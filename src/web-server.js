import http from "node:http";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { sendHtml, sendJson, notFound, fetchJsonWithFallback } from "./lib/http.js";
import { renderAgentListPage, renderAgentDetailPage, renderStatsPage } from "./lib/html.js";

const API_BASE = process.env.API_BASE || "http://127.0.0.1:3001";

async function fetchApi(endpoint, apiBaseUrl) {
  const url = `${apiBaseUrl}${endpoint}`;
  return fetchJsonWithFallback(url);
}

/**
 * 读取请求体（用于 POST 代理）
 */
async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/**
 * 获取前端公开 base URL（考虑反向代理的 X-Forwarded-* 头）
 * 用于 OAuth 回调中的 redirect_base
 */
function getPublicBaseUrl(request) {
  const proto = request.headers["x-forwarded-proto"] || "http";
  const host = request.headers["x-forwarded-host"] || request.headers.host;
  return `${proto}://${host}`;
}

/**
 * 通用 API 代理：将请求透传到后端 API 服务
 * 支持 GET/POST/DELETE，保留 headers 和 body
 */
async function proxyToApi(request, response, apiBaseUrl, targetPath) {
  const targetUrl = `${apiBaseUrl}${targetPath}`;

  const proxyHeaders = {
    "Accept": request.headers.accept || "application/json",
    "Content-Type": request.headers["content-type"] || "application/json",
    "User-Agent": request.headers["user-agent"] || "AgentHub-WebProxy",
  };

  // 透传认证头
  if (request.headers.authorization) {
    proxyHeaders["Authorization"] = request.headers.authorization;
  }
  if (request.headers["x-api-token"]) {
    proxyHeaders["X-Api-Token"] = request.headers["x-api-token"];
  }

  // 透传 X-Forwarded-* 头给后端
  proxyHeaders["X-Forwarded-For"] = request.headers["x-forwarded-for"] || request.socket.remoteAddress;
  proxyHeaders["X-Forwarded-Proto"] = request.headers["x-forwarded-proto"] || "http";
  proxyHeaders["X-Forwarded-Host"] = request.headers["x-forwarded-host"] || request.headers.host;

  const fetchOptions = {
    method: request.method,
    headers: proxyHeaders,
    redirect: "manual",  // 不自动跟随重定向，让前端处理
  };

  // POST/PUT/PATCH 需要转发 body
  if (request.method !== "GET" && request.method !== "HEAD") {
    fetchOptions.body = await readBody(request);
  }

  try {
    const apiRes = await fetch(targetUrl, fetchOptions);

    // 处理 302 重定向（OAuth 跳转）
    if (apiRes.status >= 300 && apiRes.status < 400) {
      const location = apiRes.headers.get("location");
      response.writeHead(apiRes.status, { "Location": location });
      response.end();
      return;
    }

    // 透传响应头
    const resHeaders = {};
    const contentType = apiRes.headers.get("content-type");
    if (contentType) resHeaders["Content-Type"] = contentType;

    // 透传 CORS 头
    for (const [key, value] of apiRes.headers.entries()) {
      if (key.startsWith("access-control-") || key === "x-content-type-options" || key === "x-frame-options") {
        resHeaders[key] = value;
      }
    }

    const body = await apiRes.text();
    response.writeHead(apiRes.status, resHeaders);
    response.end(body);
  } catch (err) {
    sendJson(response, 502, { error: `API proxy error: ${err.message}` });
  }
}

export async function createWebServer({ port = 3000, apiBase = null, host = "0.0.0.0" }) {
  const apiBaseUrl = apiBase || API_BASE;

  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, "http://127.0.0.1");

      // 静态资源：CSS/JS
      if (url.pathname.startsWith("/static/")) {
        const filePath = path.join(process.cwd(), "public", url.pathname);
        try {
          const content = await readFile(filePath);
          const ext = path.extname(filePath);
          const contentTypes = {
            ".css": "text/css",
            ".js": "application/javascript",
            ".png": "image/png",
            ".svg": "image/svg+xml"
          };
          response.writeHead(200, { "Content-Type": contentTypes[ext] || "application/octet-stream" });
          response.end(content);
        } catch {
          notFound(response);
        }
        return;
      }

      // === Auth API 路由代理 ===

      // OAuth 授权跳转：需要注入 redirect_base 让回调回到 Web 前端
      if (url.pathname.startsWith("/api/auth/oauth/") && !url.pathname.includes("/callback") && request.method === "GET") {
        const publicBase = getPublicBaseUrl(request);
        const provider = url.pathname.split("/").pop();
        // 将 redirect_base 设为 Web 前端地址，这样 OAuth 回调会回到 Web 前端
        const targetPath = `/api/auth/oauth/${provider}?redirect_base=${encodeURIComponent(publicBase)}`;
        await proxyToApi(request, response, apiBaseUrl, targetPath);
        return;
      }

      // OAuth 回调处理：直接代理到后端
      if (url.pathname.startsWith("/api/auth/callback/") && request.method === "GET") {
        const targetPath = `${url.pathname}${url.search}`;
        await proxyToApi(request, response, apiBaseUrl, targetPath);
        return;
      }

      // 其他所有 /api/auth/* 路由：直接代理（providers, register, login, me, tokens 等）
      if (url.pathname.startsWith("/api/auth/")) {
        const targetPath = `${url.pathname}${url.search}`;
        await proxyToApi(request, response, apiBaseUrl, targetPath);
        return;
      }

      // 健康检查代理
      if (url.pathname === "/api/health") {
        await proxyToApi(request, response, apiBaseUrl, "/api/health");
        return;
      }

      // 首页
      if (url.pathname === "/") {
        const query = url.searchParams.get("q") ?? "";
        const data = await fetchApi(`/api/agents?q=${encodeURIComponent(query)}`, apiBaseUrl);
        const stats = await fetchApi("/api/stats", apiBaseUrl);
        sendHtml(response, 200, renderAgentListPage({
          query,
          agents: data.agents,
          totalDownloads: stats.stats.totalDownloads,
          apiBase: apiBaseUrl
        }));
        return;
      }

      // Agent 详情页
      if (url.pathname.startsWith("/agents/")) {
        const slug = url.pathname.slice("/agents/".length);
        const manifest = await fetchApi(`/api/agents/${slug}`, apiBaseUrl);
        sendHtml(response, 200, renderAgentDetailPage({ ...manifest, apiBase: apiBaseUrl }));
        return;
      }

      // 统计页面
      if (url.pathname === "/stats") {
        const stats = await fetchApi("/api/stats", apiBaseUrl);
        sendHtml(response, 200, renderStatsPage(stats));
        return;
      }

      // 技能页面（重定向到 API）
      if (url.pathname === "/skills/agenthub-discover" || url.pathname === "/skills/agenthub-discover/SKILL.md") {
        response.writeHead(302, { "Location": `${apiBaseUrl}/api/skills/agenthub-discover` });
        response.end();
        return;
      }

      notFound(response);
    } catch (error) {
      // 如果 API 不可用，显示错误页面
      sendHtml(response, 503, renderErrorPage(error.message, apiBaseUrl));
    }
  });

  await new Promise((resolve) => server.listen(port, host, resolve));
  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : port;

  return {
    server,
    port: actualPort,
    baseUrl: `http://127.0.0.1:${actualPort}`,
    close: () => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve()))),
  };
}

function renderErrorPage(message, apiBase) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>服务不可用 - AgentHub</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #064e3b;
    }
    .error-box {
      background: rgba(255,255,255,0.9);
      padding: 48px;
      border-radius: 24px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(16, 185, 129, 0.15);
    }
    h1 { font-size: 48px; margin-bottom: 16px; }
    p { color: #6b7280; margin-bottom: 24px; }
    code { background: #f3f4f6; padding: 8px 16px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="error-box">
    <h1>⚠️</h1>
    <h2>后端服务不可用</h2>
    <p>无法连接到 API 服务</p>
    <code>API 地址: ${apiBase}</code>
    <p style="margin-top: 16px; font-size: 14px;">错误: ${message}</p>
  </div>
</body>
</html>`;
}
