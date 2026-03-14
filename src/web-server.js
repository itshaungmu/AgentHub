import http from "node:http";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { sendHtml, sendJson, notFound } from "./lib/http.js";
import { renderAgentListPage, renderAgentDetailPage, renderStatsPage } from "./lib/html.js";

const API_BASE = process.env.API_BASE || "http://127.0.0.1:3001";

async function fetchApi(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}

export async function createWebServer({ port = 3000, apiBase = null }) {
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

      // 首页
      if (url.pathname === "/") {
        const query = url.searchParams.get("q") ?? "";
        const data = await fetchApi(`/api/agents?q=${encodeURIComponent(query)}`);
        const stats = await fetchApi("/api/stats");
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
        const manifest = await fetchApi(`/api/agents/${slug}`);
        sendHtml(response, 200, renderAgentDetailPage({ ...manifest, apiBase: apiBaseUrl }));
        return;
      }

      // 统计页面
      if (url.pathname === "/stats") {
        const stats = await fetchApi("/api/stats");
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
