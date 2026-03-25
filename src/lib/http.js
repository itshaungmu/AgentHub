import { request as httpsRequest } from "node:https";
import { request as httpRequest } from "node:http";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const VERSION = require("../../package.json").version;

export function sendJson(response, statusCode, payload, extraHeaders = {}) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8", ...extraHeaders });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

export function sendHtml(response, statusCode, html, extraHeaders = {}) {
  response.writeHead(statusCode, { "content-type": "text/html; charset=utf-8", ...extraHeaders });
  response.end(html);
}

export function notFound(response, extraHeaders = {}) {
  sendJson(response, 404, { error: "Not Found" }, extraHeaders);
}

export async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }
  if (chunks.length === 0) {
    return {};
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

/**
 * 共享的网络请求工具函数
 */

function debugLog(message, details) {
  if (!process.env.AGENTHUB_DEBUG_INSTALL) return;
  const suffix = details ? ` | ${JSON.stringify(details)}` : "";
  console.error(`[agenthub:http] ${message}${suffix}`);
}

/**
 * 使用原生 http/https 模块请求
 */
export async function requestPayloadText(rawUrl) {
  const parsed = new URL(rawUrl);
  const transport = parsed.protocol === "http:" ? httpRequest : httpsRequest;
  const requestOptions = {
    method: "GET",
    hostname: parsed.hostname,
    port: parsed.port,
    path: `${parsed.pathname}${parsed.search || ""}`,
    protocol: parsed.protocol,
    headers: {
      "User-Agent": `agenthub-cli/${VERSION}`,
      Accept: "application/json",
    },
  };

  debugLog("http request begin", { url: rawUrl, protocol: parsed.protocol, hostname: parsed.hostname, path: requestOptions.path });

  return await new Promise((resolve, reject) => {
    const req = transport(requestOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          const reason = `${res.statusCode} ${res.statusMessage || ""}`;
          debugLog("http request failed", { reason, rawUrl });
          reject(new Error(`Remote request failed: ${reason}`));
          return;
        }
        debugLog("http request success", { rawUrl, bytes: data.length });
        resolve(data);
      });
    });

    req.on("error", (error) => {
      debugLog("http request error", { rawUrl, code: error.code, message: error.message, errno: error.errno });
      const errorDetail = error.code || error.message || `errno ${error.errno}` || "unknown network error";
      reject(new Error(`Network error: ${errorDetail} (${parsed.hostname})`));
    });
    req.end();
  });
}

/**
 * 使用 curl 作为 fallback（绕过 Cloudflare 等网络限制）
 */
export async function fetchWithCurl(rawUrl) {
  debugLog("curl fallback begin", { url: rawUrl });

  return await new Promise((resolve, reject) => {
    const curl = spawn("curl", [
      "-s", "-f",
      "--connect-timeout", "30",
      "-H", "Accept: application/json",
      rawUrl
    ]);

    let stdout = "";
    let stderr = "";

    curl.stdout.on("data", (data) => { stdout += data; });
    curl.stderr.on("data", (data) => { stderr += data; });

    curl.on("close", (code) => {
      if (code !== 0) {
        debugLog("curl fallback failed", { code, stderr: stderr.slice(0, 200) });
        reject(new Error(`curl failed with code ${code}: ${stderr.slice(0, 100)}`));
        return;
      }
      debugLog("curl fallback success", { url: rawUrl, bytes: stdout.length });
      resolve(stdout);
    });

    curl.on("error", (err) => {
      debugLog("curl spawn error", { message: err.message });
      reject(new Error(`Failed to spawn curl: ${err.message}`));
    });
  });
}

/**
 * 多层 fallback 的 JSON 请求
 * 1. 原生 fetch
 * 2. http/https 模块
 * 3. curl 命令
 */
export async function fetchJsonWithFallback(url) {
  const baseUrl = url.toString();
  debugLog("requesting payload", { url: baseUrl });

  // 1. 尝试原生 fetch
  try {
    const response = await fetch(baseUrl);
    debugLog("primary fetch done", { url: baseUrl, ok: response.ok, status: response.status, statusText: response.statusText });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (err) {
    debugLog("primary fetch failed", { url: baseUrl, error: err.message });
  }

  // 2. 尝试 http/https 模块
  try {
    const payloadText = await requestPayloadText(baseUrl);
    debugLog("http/https fallback success", { url: baseUrl });
    return JSON.parse(payloadText);
  } catch (err) {
    debugLog("http/https fallback failed", { url: baseUrl, error: err.message });
  }

  // 3. 最终 fallback: 使用 curl
  try {
    const payloadText = await fetchWithCurl(baseUrl);
    debugLog("curl fallback success", { url: baseUrl });
    return JSON.parse(payloadText);
  } catch (err) {
    debugLog("all fetch methods failed", { url: baseUrl, finalError: err.message });
    throw new Error(`All fetch methods failed. Last error: ${err.message}`);
  }
}
