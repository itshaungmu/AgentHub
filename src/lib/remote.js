import { request as httpsRequest } from "node:https";
import { request as httpRequest } from "node:http";
import { spawn } from "node:child_process";

export function resolveServerUrl(options = {}) {
  return options.server || "https://agenthub.cyou";
}

function debugLog(message, details) {
  if (!process.env.AGENTHUB_DEBUG_INSTALL) return;
  const suffix = details ? ` | ${JSON.stringify(details)}` : "";
  console.error(`[agenthub:remote] ${message}${suffix}`);
}

async function requestPayloadText(rawUrl) {
  const parsed = new URL(rawUrl);
  const transport = parsed.protocol === "http:" ? httpRequest : httpsRequest;

  return await new Promise((resolve, reject) => {
    const req = transport(
      {
        method: "GET",
        hostname: parsed.hostname,
        port: parsed.port,
        path: `${parsed.pathname}${parsed.search || ""}`,
        protocol: parsed.protocol,
        headers: {
          "User-Agent": "agenthub-cli/0.1.6",
          Accept: "application/json",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if ((res.statusCode || 500) < 200 || (res.statusCode || 500) >= 300) {
            reject(new Error(`Remote request failed: ${res.statusCode} ${res.statusMessage || ""}`));
            return;
          }
          resolve(data);
        });
      },
    );

    req.on("error", (error) => {
      reject(new Error(`Network error: ${error.code || error.message || "unknown"} (${parsed.hostname})`));
    });
    req.end();
  });
}

async function fetchWithCurl(rawUrl) {
  return await new Promise((resolve, reject) => {
    const curl = spawn("curl", ["-s", "-f", "--connect-timeout", "30", "-H", "Accept: application/json", rawUrl]);
    let stdout = "";
    let stderr = "";

    curl.stdout.on("data", (data) => {
      stdout += data;
    });
    curl.stderr.on("data", (data) => {
      stderr += data;
    });
    curl.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`curl failed with code ${code}: ${stderr.slice(0, 100)}`));
        return;
      }
      resolve(stdout);
    });
    curl.on("error", (error) => {
      reject(new Error(`Failed to spawn curl: ${error.message}`));
    });
  });
}

export async function fetchRemoteJson(pathname, options = {}) {
  const serverUrl = resolveServerUrl(options);
  const url = new URL(pathname, serverUrl).toString();

  try {
    const response = await fetch(url);
    debugLog("primary fetch done", { url, ok: response.ok, status: response.status });
    if (!response.ok) {
      throw new Error(`Remote request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    debugLog("primary fetch failed", { url, error: error.message });
  }

  try {
    const payloadText = await requestPayloadText(url);
    debugLog("http fallback success", { url });
    return JSON.parse(payloadText);
  } catch (error) {
    debugLog("http fallback failed", { url, error: error.message });
  }

  const payloadText = await fetchWithCurl(url);
  debugLog("curl fallback success", { url });
  return JSON.parse(payloadText);
}
