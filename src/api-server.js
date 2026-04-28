import { randomBytes } from "node:crypto";
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
  getDatabaseStats,
  createUser,
  findUserByUsername,
  saveApiToken,
  findTokenByHash,
  listUserTokens,
  revokeToken,
  addAuditLog,
  queryAuditLogs,
} from "./lib/database.js";
import {
  hashPassword, verifyPassword, generateApiToken, hashToken, extractToken, hasScope, SCOPES, DEFAULT_SCOPES,
  getConfiguredProviders, getOAuthAuthorizeUrl, exchangeCodeForToken, getOAuthUserInfo, isOAuthConfigured,
} from "./lib/auth.js";

// 安全配置
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || ["*"];
const MAX_UPLOAD_SIZE = parseInt(process.env.MAX_UPLOAD_SIZE || "10485760", 10); // 10MB default
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || "100", 10); // 100 requests per minute

// 简单的速率限制器
const rateLimiter = new Map();
let cleanupInterval = null;

function startRateLimiterCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;
    for (const [ip, requests] of rateLimiter.entries()) {
      const recentRequests = requests.filter(t => t > windowStart);
      if (recentRequests.length === 0) {
        rateLimiter.delete(ip);
      } else if (recentRequests.length !== requests.length) {
        rateLimiter.set(ip, recentRequests);
      }
    }
  }, RATE_LIMIT_WINDOW);
}

function stopRateLimiterCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

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

export async function createApiServer({ registryDir, port = 3000, host = "0.0.0.0" }) {
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
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Api-Token",
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

      // === Token 认证（可选，不强制） ===
      let authenticatedUser = null;
      const rawToken = extractToken(request);
      if (rawToken) {
        const tHash = hashToken(rawToken);
        const tokenRecord = await findTokenByHash(registryDir, tHash);
        if (tokenRecord) {
          authenticatedUser = {
            userId: tokenRecord.userId,
            username: tokenRecord.username,
            role: tokenRecord.role,
            scopes: tokenRecord.scopes,
          };
        }
      }

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
        // 记录下载（包含元数据）
        await incrementDownloads(registryDir, manifest.slug, {
          ip: request.socket.remoteAddress,
          userAgent: request.headers['user-agent']
        });
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

      // API: 发布 Agent（含审计日志）
      if (url.pathname === "/api/publish" && request.method === "POST") {
        const body = await readJsonBody(request);
        const manifest = await publishCommand(body.bundleDir, { registry: registryDir });
        await addAuditLog(registryDir, {
          username: authenticatedUser?.username,
          action: "publish",
          resource: `${manifest.slug}@${manifest.version}`,
          ipAddress: clientIp,
        });
        sendJson(response, 200, manifest, corsHeaders);
        return;
      }

      // API: 上传发布 Agent（含审计日志）
      if (url.pathname === "/api/publish-upload" && request.method === "POST") {
        const body = await readJsonBody(request);
        const manifest = await publishUploadedBundle({ payload: body, registryDir });
        await addAuditLog(registryDir, {
          username: authenticatedUser?.username,
          action: "publish-upload",
          resource: `${manifest.slug}@${manifest.version}`,
          ipAddress: clientIp,
        });
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

      // === P1: 认证 API ===

      // API: 用户注册
      if (url.pathname === "/api/auth/register" && request.method === "POST") {
        const body = await readJsonBody(request);
        if (!body.username || !body.password) {
          sendJson(response, 400, { error: "username and password are required" }, corsHeaders);
          return;
        }
        if (body.username.length < 3 || body.username.length > 50) {
          sendJson(response, 400, { error: "username must be 3-50 characters" }, corsHeaders);
          return;
        }
        if (body.password.length < 6) {
          sendJson(response, 400, { error: "password must be at least 6 characters" }, corsHeaders);
          return;
        }
        const existing = await findUserByUsername(registryDir, body.username);
        if (existing) {
          sendJson(response, 409, { error: "username already exists" }, corsHeaders);
          return;
        }
        const passwordHash = hashPassword(body.password);
        const user = await createUser(registryDir, {
          username: body.username,
          passwordHash,
          email: body.email,
        });
        // 自动生成初始 Token
        const { token, tokenHash } = generateApiToken();
        await saveApiToken(registryDir, { userId: user.id, tokenHash, label: "initial", scopes: DEFAULT_SCOPES });
        await addAuditLog(registryDir, { userId: user.id, username: user.username, action: "register", ipAddress: clientIp });
        sendJson(response, 201, { user: { id: user.id, username: user.username }, token }, corsHeaders);
        return;
      }

      // API: 用户登录
      if (url.pathname === "/api/auth/login" && request.method === "POST") {
        const body = await readJsonBody(request);
        if (!body.username || !body.password) {
          sendJson(response, 400, { error: "username and password are required" }, corsHeaders);
          return;
        }
        const user = await findUserByUsername(registryDir, body.username);
        if (!user || !verifyPassword(body.password, user.passwordHash)) {
          sendJson(response, 401, { error: "invalid credentials" }, corsHeaders);
          return;
        }
        // 生成新 Token
        const { token, tokenHash } = generateApiToken();
        await saveApiToken(registryDir, { userId: user.id, tokenHash, label: body.label || "login", scopes: DEFAULT_SCOPES });
        await addAuditLog(registryDir, { userId: user.id, username: user.username, action: "login", ipAddress: clientIp });
        sendJson(response, 200, { user: { id: user.id, username: user.username, role: user.role }, token }, corsHeaders);
        return;
      }

      // API: 查看当前用户信息
      if (url.pathname === "/api/auth/me" && request.method === "GET") {
        if (!authenticatedUser) {
          sendJson(response, 401, { error: "Authentication required" }, corsHeaders);
          return;
        }
        const tokens = await listUserTokens(registryDir, authenticatedUser.userId);
        sendJson(response, 200, { user: authenticatedUser, tokens }, corsHeaders);
        return;
      }

      // API: 生成新 Token
      if (url.pathname === "/api/auth/tokens" && request.method === "POST") {
        if (!authenticatedUser) {
          sendJson(response, 401, { error: "Authentication required" }, corsHeaders);
          return;
        }
        const body = await readJsonBody(request);
        const { token, tokenHash } = generateApiToken();
        await saveApiToken(registryDir, {
          userId: authenticatedUser.userId,
          tokenHash,
          label: body.label || "api",
          scopes: body.scopes || DEFAULT_SCOPES,
        });
        sendJson(response, 201, { token, label: body.label || "api" }, corsHeaders);
        return;
      }

      // API: 吊销 Token
      if (url.pathname.startsWith("/api/auth/tokens/") && request.method === "DELETE") {
        if (!authenticatedUser) {
          sendJson(response, 401, { error: "Authentication required" }, corsHeaders);
          return;
        }
        const tokenId = parseInt(url.pathname.split("/").pop(), 10);
        await revokeToken(registryDir, tokenId);
        sendJson(response, 200, { revoked: true }, corsHeaders);
        return;
      }

      // API: 查询审计日志
      if (url.pathname === "/api/audit" && request.method === "GET") {
        if (!authenticatedUser || authenticatedUser.role !== "admin") {
          sendJson(response, 403, { error: "Admin access required" }, corsHeaders);
          return;
        }
        const logs = await queryAuditLogs(registryDir, {
          action: url.searchParams.get("action") || undefined,
          username: url.searchParams.get("username") || undefined,
          limit: parseInt(url.searchParams.get("limit") || "50", 10),
        });
        sendJson(response, 200, { logs }, corsHeaders);
        return;
      }

      // === OAuth 路由 ===

      // API: 获取可用的 OAuth 提供商
      if (url.pathname === "/api/auth/providers" && request.method === "GET") {
        const providers = getConfiguredProviders().map((p) => ({
          id: p,
          name: p === "github" ? "GitHub" : "Google",
          loginUrl: `/api/auth/oauth/${p}`,
        }));
        sendJson(response, 200, { providers, localAuth: true }, corsHeaders);
        return;
      }

      // API: OAuth 授权跳转
      if (url.pathname.startsWith("/api/auth/oauth/") && !url.pathname.includes("/callback") && request.method === "GET") {
        const provider = url.pathname.split("/").pop();
        if (!isOAuthConfigured(provider)) {
          sendJson(response, 400, { error: `${provider} OAuth not configured. Set ${provider.toUpperCase()}_CLIENT_ID and ${provider.toUpperCase()}_CLIENT_SECRET environment variables.` }, corsHeaders);
          return;
        }
        const fwdProto = request.headers["x-forwarded-proto"] || "http";
        const fwdHost = request.headers["x-forwarded-host"] || request.headers.host;
        const baseUrl = url.searchParams.get("redirect_base") || `${fwdProto}://${fwdHost}`;
        const redirectUri = `${baseUrl}/api/auth/callback/${provider}`;
        const { url: authorizeUrl, state } = getOAuthAuthorizeUrl(provider, redirectUri);
        // 重定向到 OAuth 提供商
        response.writeHead(302, { Location: authorizeUrl, ...corsHeaders });
        response.end();
        return;
      }

      // API: OAuth 回调处理
      if (url.pathname.startsWith("/api/auth/callback/") && request.method === "GET") {
        const provider = url.pathname.split("/").pop();
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error) {
          sendJson(response, 400, { error: `OAuth denied: ${error}` }, corsHeaders);
          return;
        }
        if (!code) {
          sendJson(response, 400, { error: "Missing authorization code" }, corsHeaders);
          return;
        }

        try {
          const fwdProto = request.headers["x-forwarded-proto"] || "http";
          const fwdHost = request.headers["x-forwarded-host"] || request.headers.host;
          const baseUrl = `${fwdProto}://${fwdHost}`;
          const redirectUri = `${baseUrl}/api/auth/callback/${provider}`;

          // 1. 用 code 换 access token
          const accessToken = await exchangeCodeForToken(provider, code, redirectUri);

          // 2. 获取用户信息
          const oauthUser = await getOAuthUserInfo(provider, accessToken);

          // 3. 查找或创建本地用户
          const oauthUsername = `${provider}_${oauthUser.username}`;
          let localUser = await findUserByUsername(registryDir, oauthUsername);

          if (!localUser) {
            // 自动注册 -- 密码用随机值（OAuth 用户不需要密码）
            const randomPass = hashPassword(randomBytes(32).toString("hex"));
            localUser = await createUser(registryDir, {
              username: oauthUsername,
              passwordHash: randomPass,
              email: oauthUser.email,
            });
          }

          // 4. 生成 AgentHub Token
          const { token, tokenHash } = generateApiToken();
          await saveApiToken(registryDir, {
            userId: localUser.id,
            tokenHash,
            label: `${provider}-oauth`,
            scopes: DEFAULT_SCOPES,
          });

          await addAuditLog(registryDir, {
            userId: localUser.id,
            username: oauthUsername,
            action: `oauth-login-${provider}`,
            details: { oauthId: oauthUser.id, email: oauthUser.email },
            ipAddress: clientIp,
          });

          // 5. 返回结果（支持 JSON 和 HTML 跳转两种模式）
          const acceptsJson = request.headers.accept?.includes("application/json");
          if (acceptsJson) {
            sendJson(response, 200, {
              user: { id: localUser.id, username: oauthUsername, provider },
              oauthProfile: { displayName: oauthUser.displayName, avatar: oauthUser.avatar, email: oauthUser.email },
              token,
            }, corsHeaders);
          } else {
            // HTML 模式：通过页面展示 Token 并引导用户复制
            const html = `<!DOCTYPE html><html><head><title>AgentHub - Login Success</title>
<style>body{font-family:system-ui;max-width:500px;margin:80px auto;text-align:center}
.token{background:#1a1a2e;color:#0f0;padding:12px;border-radius:8px;word-break:break-all;font-family:monospace;font-size:14px;margin:16px 0}
.btn{background:#4f46e5;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:16px}
.btn:hover{background:#4338ca}
.avatar{width:64px;height:64px;border-radius:50%;margin:12px}</style></head>
<body>
<h1>✅ 登录成功</h1>
<img class="avatar" src="${oauthUser.avatar || ''}" alt="avatar">
<p>欢迎，<strong>${oauthUser.displayName || oauthUsername}</strong></p>
<p>你的 API Token：</p>
<div class="token" id="token">${token}</div>
<button class="btn" onclick="navigator.clipboard.writeText(document.getElementById('token').textContent).then(()=>this.textContent='✅ 已复制')">📋 复制 Token</button>
<p style="color:#888;margin-top:24px">请妙善保管此 Token，它不会再次显示。</p>
<p style="color:#888">CLI 使用: <code>agenthub publish --token ${token.slice(0, 10)}...</code></p>
</body></html>`;
            response.writeHead(200, { "Content-Type": "text/html; charset=utf-8", ...corsHeaders });
            response.end(html);
          }
          return;
        } catch (oauthErr) {
          sendJson(response, 500, { error: `OAuth failed: ${oauthErr.message}` }, corsHeaders);
          return;
        }
      }

      notFound(response, corsHeaders);
    } catch (error) {
      sendJson(response, 500, { error: error.message }, corsHeaders);
    }
  });

  startRateLimiterCleanup();
  await new Promise((resolve) => server.listen(port, host, resolve));
  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : port;

  return {
    server,
    port: actualPort,
    baseUrl: `http://127.0.0.1:${actualPort}`,
    close: () => new Promise((resolve, reject) => {
      stopRateLimiterCleanup();
      server.close((error) => (error ? reject(error) : resolve()));
    }),
  };
}
