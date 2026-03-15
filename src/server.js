import http from "node:http";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { infoCommand, installCommand, publishCommand, searchCommand } from "./index.js";
import { publishUploadedBundle, serializeBundleDir } from "./lib/bundle-transfer.js";
import { notFound, readJsonBody, sendHtml, sendJson } from "./lib/http.js";
import { renderAgentDetailPage, renderAgentListPage, renderStatsPage } from "./lib/html.js";
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

export async function createServer({ registryDir, port = 3000, host = "0.0.0.0" }) {
  // 初始化数据库
  await initDatabase(registryDir);

  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://127.0.0.1");

      // API: 获取 AgentHub Discover Skill
      if (url.pathname === "/skills/agenthub-discover/SKILL.md") {
        try {
          const skillPath = path.join(process.cwd(), "skills", "agenthub-discover", "SKILL.md");
          const content = await readFile(skillPath, "utf8");
          response.writeHead(200, {
            "Content-Type": "text/markdown; charset=utf-8",
            "Access-Control-Allow-Origin": "*"
          });
          response.end(content);
        } catch {
          response.writeHead(404, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ error: "Skill not found" }));
        }
        return;
      }

      if (url.pathname === "/api/agents") {
        const agents = await searchCommand(url.searchParams.get("q") ?? "", { registry: registryDir });
        // 添加下载数
        const slugs = agents.map(a => a.slug);
        const downloads = await getAgentsDownloads(registryDir, slugs);
        const agentsWithDownloads = agents.map(a => ({ ...a, downloads: downloads[a.slug] || 0 }));
        // 按下载量降序排序，下载量一致时按更新时间降序排序
        agentsWithDownloads.sort((a, b) => {
          if (b.downloads !== a.downloads) {
            return b.downloads - a.downloads;
          }
          // 下载量一致时，按更新时间降序（最近更新的排前面）
          const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return timeB - timeA;
        });
        sendJson(response, 200, { agents: agentsWithDownloads });
        return;
      }

      if (url.pathname === "/api/publish" && request.method === "POST") {
        const body = await readJsonBody(request);
        const manifest = await publishCommand(body.bundleDir, { registry: registryDir });
        sendJson(response, 200, manifest);
        return;
      }

      if (url.pathname === "/api/publish-upload" && request.method === "POST") {
        const body = await readJsonBody(request);
        const manifest = await publishUploadedBundle({ payload: body, registryDir });
        sendJson(response, 200, manifest);
        return;
      }

      if (url.pathname === "/api/install" && request.method === "POST") {
        const body = await readJsonBody(request);
        const result = await installCommand(body.agent, {
          registry: registryDir,
          targetWorkspace: body.targetWorkspace,
        });
        // 记录下载（包含元数据）
        const slug = body.agent.split(":")[0];
        await incrementDownloads(registryDir, slug, {
          targetWorkspace: body.targetWorkspace,
          ip: request.socket.remoteAddress,
          userAgent: request.headers['user-agent']
        });
        sendJson(response, 200, result);
        return;
      }

      // API: 获取下载统计
      if (url.pathname === "/api/stats") {
        const stats = await getDatabaseStats(registryDir);
        const ranking = await getDownloadRanking(registryDir, 10);
        const recent = await getRecentDownloads(registryDir, 20);
        sendJson(response, 200, { stats, ranking, recent });
        return;
      }

      // API: 获取下载排行
      if (url.pathname === "/api/stats/ranking") {
        const limit = parseInt(url.searchParams.get("limit") || "10", 10);
        const ranking = await getDownloadRanking(registryDir, limit);
        sendJson(response, 200, { ranking });
        return;
      }

      if (url.pathname.startsWith("/api/agents/") && url.pathname.endsWith("/download")) {
        const slug = url.pathname.slice("/api/agents/".length, -"/download".length);
        const version = url.searchParams.get("version") || undefined;
        const manifest = await infoCommand(version ? `${slug}:${version}` : slug, { registry: registryDir });
        const bundleDir = path.join(registryDir, "agents", manifest.slug, manifest.version);
        const payload = await serializeBundleDir(bundleDir);
        sendJson(response, 200, payload);
        return;
      }

      if (url.pathname.startsWith("/api/agents/")) {
        const slug = url.pathname.slice("/api/agents/".length);
        const manifest = await infoCommand(slug, { registry: registryDir });
        // 添加下载数
        const downloads = await getAgentDownloads(registryDir, slug);
        sendJson(response, 200, { ...manifest, downloads });
        return;
      }

      if (url.pathname === "/") {
        const query = url.searchParams.get("q") ?? "";
        const agents = await searchCommand(query, { registry: registryDir });
        // 添加下载数
        const slugs = agents.map(a => a.slug);
        const downloads = await getAgentsDownloads(registryDir, slugs);
        const totalDownloads = await getTotalDownloads(registryDir);
        const agentsWithDownloads = agents.map(a => ({ ...a, downloads: downloads[a.slug] || 0 }));
        // 按下载量降序排序，下载量一致时按更新时间降序排序
        agentsWithDownloads.sort((a, b) => {
          if (b.downloads !== a.downloads) {
            return b.downloads - a.downloads;
          }
          // 下载量一致时，按更新时间降序（最近更新的排前面）
          const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
          return timeB - timeA;
        });
        sendHtml(response, 200, renderAgentListPage({ query, agents: agentsWithDownloads, totalDownloads }));
        return;
      }

      if (url.pathname.startsWith("/agents/")) {
        const slug = url.pathname.slice("/agents/".length);
        const manifest = await infoCommand(slug, { registry: registryDir });
        // 添加下载数
        const downloads = await getAgentDownloads(registryDir, slug);
        sendHtml(response, 200, renderAgentDetailPage({ ...manifest, downloads }));
        return;
      }

      // 统计页面
      if (url.pathname === "/stats") {
        const stats = await getDatabaseStats(registryDir);
        const ranking = await getDownloadRanking(registryDir, 10);
        const recent = await getRecentDownloads(registryDir, 20);
        sendHtml(response, 200, renderStatsPage({ stats, ranking, recent }));
        return;
      }

      notFound(response);
    } catch (error) {
      sendJson(response, 500, { error: error.message });
    }
  });

  await new Promise((resolve) => server.listen(port, host, resolve));
  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : port;

  return {
    server,
    port: actualPort,
    host,
    baseUrl: `http://${host === "0.0.0.0" ? "127.0.0.1" : host}:${actualPort}`,
    close: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
  };
}
