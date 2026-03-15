import http from "node:http";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { infoCommand, installCommand, publishCommand, searchCommand } from "./index.js";
import { publishUploadedBundle, serializeBundleDir } from "./lib/bundle-transfer.js";
import { notFound, readJsonBody, sendJson } from "./lib/http.js";
import {
  initDatabase,
  incrementDownloads,
  getAgentDownloads,
  getAgentsDownloads,
  getTotalDownloads,
  getDownloadRanking,
  getRecentDownloads,
  getDatabaseStats
} from "./lib/database.js";

// 安全配置
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || ["*"];
const MAX_UPLOAD_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE || "10485760", 10); // 10MB default
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || "100", 10); // 100 requests per minute

// 简单的速率限制器
const rateLimiter = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  const requests = rateLimiter.get(ip) || [];
  const recentRequests = requests.filter(t => t > windowStart);
  if (recentRequests.length >= RATE_LIMIT_MAX) {
    return false;
  }
  recentRequests.push(now);
  rateLimiter.set(ip, recentRequests);
  return true;
}

// slug 格式验证
function isValidSlug(slug) {
  return /^[a-z0-9-]+$/.test(slug) && slug.length <= 100;
}

export async function createApiServer({ registryDir, port = 3000 }) {
  // 初始化数据库
  await initDatabase(registryDir);

  const server = http.createServer(async (request, response) => {
    const origin = request.headers.origin || "*";
    const allowedOrigin = ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin)
      ? (ALLOWED_ORIGINS.includes("*") ? "*" : origin)
      : ALLOWED_ORIGINS[0];

    // CORS 头
    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY"
    };

    // 速率限制检查
    const clientIp = request.socket.remoteAddress;
    if (!checkRateLimit(clientIp)) {
      response.writeHead(429, { "Content-Type": "application/json", ...corsHeaders });
      response.end(JSON.stringify({ error: "Too many requests" }));
      return;
    }

    // 处理预检请求
    if (request.method === "OPTIONS") {
      response.writeHead(204, corsHeaders);
      response.end();
      return;
    }

    try {
      const url = new URL(request.url, "http://127.0.0.1");

      // API: 获取 AgentHub Discover Skill
      if (url.pathname === "/api/skills/agenthub-discover") {
        try {
          const skillPath = path.join(process.cwd(), "skills", "agenthub-discover", "SKILL.md");
          const content = await readFile(skillPath, "utf8");
          response.writeHead(200, {
            "Content-Type": "text/markdown; charset=utf-8",
            ...corsHeaders
          });
          response.end(content);
        } catch {
          response.writeHead(404, { "Content-Type": "application/json", ...corsHeaders });
          response.end(JSON.stringify({ error: "Skill not found" }));
        }
        return;
      }

      // API: 获取 Agent 列表
      if (url.pathname === "/api/agents") {
        const agents = await searchCommand(url.searchParams.get("q") ?? "", { registry: registryDir });
        const slugs = agents.map(a => a.slug);
        const downloads = await getAgentsDownloads(registryDir, slugs);
        const agentsWithDownloads = agents.map(a => ({ ...a, downloads: downloads[a.slug] || 0 }));
        sendJson(response, 200, { agents: agentsWithDownloads }, corsHeaders);
        return;
      }

      // API: 下载 Agent Bundle（远程安装）
      if (url.pathname.startsWith("/api/agents/") && url.pathname.endsWith("/download")) {
        const slug = url.pathname.slice("/api/agents/".length, -"/download".length);
        if (!isValidSlug(slug)) {
          sendJson(response, 400, { error: "Invalid slug format" }, corsHeaders);
          return;
        }

        const version = url.searchParams.get("version") || undefined;
        const manifest = await infoCommand(version ? `${slug}:${version}` : slug, { registry: registryDir });
        const bundleDir = path.join(registryDir, "agents", manifest.slug, manifest.version);
        const payload = await serializeBundleDir(bundleDir);
        sendJson(response, 200, payload, corsHeaders);
        return;
      }

      // API: 获取单个 Agent 详情
      if (url.pathname.startsWith("/api/agents/")) {
        const slug = url.pathname.slice("/api/agents/".length);
        // 安全检查：验证 slug 格式
        if (!isValidSlug(slug)) {
          sendJson(response, 400, { error: "Invalid slug format" }, corsHeaders);
          return;
        }
        const manifest = await infoCommand(slug, { registry: registryDir });
        const downloads = await getAgentDownloads(registryDir, slug);
        sendJson(response, 200, { ...manifest, downloads }, corsHeaders);
        return;
      }

      // API: 发布 Agent
      if (url.pathname === "/api/publish" && request.method === "POST") {
        const body = await readJsonBody(request);
        const manifest = await publishCommand(body.bundleDir, { registry: registryDir });
        sendJson(response, 200, manifest, corsHeaders);
        return;
      }

      // API: 上传发布 Agent
      if (url.pathname === "/api/publish-upload" && request.method === "POST") {
        const body = await readJsonBody(request);
        const manifest = await publishUploadedBundle({ payload: body, registryDir });
        sendJson(response, 200, manifest, corsHeaders);
        return;
      }

      // API: 安装 Agent（记录下载）
      if (url.pathname === "/api/install" && request.method === "POST") {
        const body = await readJsonBody(request);
        const result = await installCommand(body.agent, {
          registry: registryDir,
          targetWorkspace: body.targetWorkspace,
        });
        const slug = body.agent.split(":")[0];
        await incrementDownloads(registryDir, slug, {
          targetWorkspace: body.targetWorkspace,
          ip: request.socket.remoteAddress,
          userAgent: request.headers['user-agent']
        });
        sendJson(response, 200, result, corsHeaders);
        return;
      }

      // API: 获取下载统计
      if (url.pathname === "/api/stats") {
        const stats = await getDatabaseStats(registryDir);
        const ranking = await getDownloadRanking(registryDir, 10);
        const recent = await getRecentDownloads(registryDir, 20);
        sendJson(response, 200, { stats, ranking, recent }, corsHeaders);
        return;
      }

      // API: 获取下载排行
      if (url.pathname === "/api/stats/ranking") {
        const limit = parseInt(url.searchParams.get("limit") || "10", 10);
        const ranking = await getDownloadRanking(registryDir, limit);
        sendJson(response, 200, { ranking }, corsHeaders);
        return;
      }

      // API: 健康检查
      if (url.pathname === "/api/health") {
        sendJson(response, 200, { status: "ok", timestamp: new Date().toISOString() }, corsHeaders);
        return;
      }

      notFound(response, corsHeaders);
    } catch (error) {
      sendJson(response, 500, { error: error.message }, corsHeaders);
    }
  });

  await new Promise((resolve) => server.listen(port, "0.0.0.0", resolve));
  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : port;

  return {
    server,
    port: actualPort,
    baseUrl: `http://127.0.0.1:${actualPort}`,
    close: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
  };
}
