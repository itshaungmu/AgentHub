import { randomBytes } from "node:crypto";
import http from "node:http";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { infoCommand, installCommand, publishCommand, searchCommand } from "./index.js";
import { publishUploadedBundle, serializeBundleDir } from "./lib/bundle-transfer.js";
import { notFound, readJsonBody, sendHtml, sendJson } from "./lib/http.js";
import { renderAgentDetailPage, renderAgentListPage, renderStatsPage } from "./lib/html.js";
import { sortByDownloadsAndTime } from "./lib/registry.js";
import {
  hashPassword, verifyPassword, generateApiToken, hashToken, extractToken,
  SCOPES, DEFAULT_SCOPES,
  getConfiguredProviders, getOAuthAuthorizeUrl, exchangeCodeForToken, getOAuthUserInfo, isOAuthConfigured,
} from "./lib/auth.js";
import {
  initDatabase,
  incrementDownloads,
  getAgentDownloads,
  getAgentsDownloads,
  getTotalDownloads,
  getDownloadRanking,
  getRecentDownloads,
  getDatabaseStats,
  createUser, findUserByUsername,
  saveApiToken, findTokenByHash,
  addAuditLog,
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
        sortByDownloadsAndTime(agentsWithDownloads);
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

      // === Token 认证（可选） ===
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

      // === Auth 路由 ===

      // API: 获取可用的 OAuth 提供商
      if (url.pathname === "/api/auth/providers" && request.method === "GET") {
        const providers = getConfiguredProviders().map((p) => ({
          id: p,
          name: p === "github" ? "GitHub" : "Google",
          loginUrl: `/api/auth/oauth/${p}`,
        }));
        sendJson(response, 200, { providers, localAuth: true });
        return;
      }

      // API: 用户注册
      if (url.pathname === "/api/auth/register" && request.method === "POST") {
        const body = await readJsonBody(request);
        if (!body.username || !body.password) {
          sendJson(response, 400, { error: "Username and password required" });
          return;
        }
        const existing = await findUserByUsername(registryDir, body.username);
        if (existing) {
          sendJson(response, 409, { error: "Username already exists" });
          return;
        }
        const passwordHash = hashPassword(body.password);
        const user = await createUser(registryDir, { username: body.username, passwordHash, email: body.email });
        const { token, tokenHash } = generateApiToken();
        await saveApiToken(registryDir, { userId: user.id, tokenHash, label: "default", scopes: DEFAULT_SCOPES });
        sendJson(response, 201, { user: { id: user.id, username: user.username }, token });
        return;
      }

      // API: 用户登录
      if (url.pathname === "/api/auth/login" && request.method === "POST") {
        const body = await readJsonBody(request);
        const user = await findUserByUsername(registryDir, body.username);
        if (!user || !verifyPassword(body.password, user.passwordHash)) {
          sendJson(response, 401, { error: "Invalid credentials" });
          return;
        }
        const { token, tokenHash } = generateApiToken();
        await saveApiToken(registryDir, { userId: user.id, tokenHash, label: "login", scopes: DEFAULT_SCOPES });
        sendJson(response, 200, { user: { id: user.id, username: user.username }, token });
        return;
      }

      // API: 当前用户信息
      if (url.pathname === "/api/auth/me" && request.method === "GET") {
        if (!authenticatedUser) {
          sendJson(response, 401, { error: "Authentication required" });
          return;
        }
        sendJson(response, 200, { user: authenticatedUser });
        return;
      }

      // API: OAuth 授权跳转
      if (url.pathname.startsWith("/api/auth/oauth/") && !url.pathname.includes("/callback") && request.method === "GET") {
        const provider = url.pathname.split("/").pop();
        if (!isOAuthConfigured(provider)) {
          sendJson(response, 400, { error: `${provider} OAuth not configured. Set ${provider.toUpperCase()}_CLIENT_ID and ${provider.toUpperCase()}_CLIENT_SECRET environment variables.` });
          return;
        }
        const baseUrl = url.searchParams.get("redirect_base") || `http://${request.headers.host}`;
        const redirectUri = `${baseUrl}/api/auth/callback/${provider}`;
        const { url: authorizeUrl } = getOAuthAuthorizeUrl(provider, redirectUri);
        response.writeHead(302, { Location: authorizeUrl });
        response.end();
        return;
      }

      // API: OAuth 回调处理
      if (url.pathname.startsWith("/api/auth/callback/") && request.method === "GET") {
        const provider = url.pathname.split("/").pop();
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error) { sendJson(response, 400, { error: `OAuth denied: ${error}` }); return; }
        if (!code) { sendJson(response, 400, { error: "Missing authorization code" }); return; }

        try {
          const baseUrl = `http://${request.headers.host}`;
          const redirectUri = `${baseUrl}/api/auth/callback/${provider}`;
          const accessToken = await exchangeCodeForToken(provider, code, redirectUri);
          const oauthUser = await getOAuthUserInfo(provider, accessToken);
          const oauthUsername = `${provider}_${oauthUser.username}`;
          let localUser = await findUserByUsername(registryDir, oauthUsername);

          if (!localUser) {
            const randomPass = hashPassword(randomBytes(32).toString("hex"));
            localUser = await createUser(registryDir, { username: oauthUsername, passwordHash: randomPass, email: oauthUser.email });
          }

          const { token, tokenHash } = generateApiToken();
          await saveApiToken(registryDir, { userId: localUser.id, tokenHash, label: `${provider}-oauth`, scopes: DEFAULT_SCOPES });
          await addAuditLog(registryDir, { userId: localUser.id, username: oauthUsername, action: `oauth-login-${provider}`, details: { oauthId: oauthUser.id, email: oauthUser.email }, ipAddress: request.socket.remoteAddress });

          const acceptsJson = request.headers.accept?.includes("application/json");
          if (acceptsJson) {
            sendJson(response, 200, { user: { id: localUser.id, username: oauthUsername, provider }, oauthProfile: { displayName: oauthUser.displayName, avatar: oauthUser.avatar, email: oauthUser.email }, token });
          } else {
            const html = `<!DOCTYPE html><html><head><title>AgentHub - Login Success</title>
<style>body{font-family:system-ui;max-width:500px;margin:80px auto;text-align:center}
.token{background:#1a1a2e;color:#0f0;padding:12px;border-radius:8px;word-break:break-all;font-family:monospace;font-size:14px;margin:16px 0}
.btn{background:#4f46e5;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:16px}
.btn:hover{background:#4338ca}
.avatar{width:64px;height:64px;border-radius:50%;margin:12px}</style></head>
<body>
<h1>\u2705 登录成功</h1>
<img class="avatar" src="${oauthUser.avatar || ''}" alt="avatar">
<p>欢迎，<strong>${oauthUser.displayName || oauthUsername}</strong></p>
<p>你的 API Token：</p>
<div class="token" id="token">${token}</div>
<button class="btn" onclick="navigator.clipboard.writeText(document.getElementById('token').textContent).then(()=>this.textContent='\u2705 已复制')">\ud83d\udccb 复制 Token</button>
<p style="color:#888;margin-top:24px">请妥善保管此 Token，它不会再次显示。</p>
<script>localStorage.setItem('agenthub-token','${token}');localStorage.setItem('agenthub-user',JSON.stringify({id:${localUser.id},username:'${oauthUsername}',provider:'${provider}'}));setTimeout(()=>window.location='/',3000);</script>
</body></html>`;
            sendHtml(response, 200, html);
          }
          return;
        } catch (oauthErr) {
          sendJson(response, 500, { error: `OAuth failed: ${oauthErr.message}` });
          return;
        }
      }

      if (url.pathname.startsWith("/api/agents/") && url.pathname.endsWith("/download")) {
        const slug = url.pathname.slice("/api/agents/".length, -"/download".length);
        const version = url.searchParams.get("version") || undefined;
        const manifest = await infoCommand(version ? `${slug}:${version}` : slug, { registry: registryDir });
        const bundleDir = path.join(registryDir, "agents", manifest.slug, manifest.version);
        const payload = await serializeBundleDir(bundleDir);
        // 记录下载（包含元数据）
        await incrementDownloads(registryDir, manifest.slug, {
          ip: request.socket.remoteAddress,
          userAgent: request.headers['user-agent']
        });
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
        sortByDownloadsAndTime(agentsWithDownloads);
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
