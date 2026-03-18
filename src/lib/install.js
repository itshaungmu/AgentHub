import path from "node:path";
import { copyDir, ensureDir, readJson, writeJson } from "./fs-utils.js";
import { readAgentInfo } from "./registry.js";
import { materializeBundlePayload } from "./bundle-transfer.js";
import { request as httpsRequest } from "node:https";
import { request as httpRequest } from "node:http";

function debugLog(message, details) {
  if (!process.env.AGENTHUB_DEBUG_INSTALL) return;
  const suffix = details ? ` | ${JSON.stringify(details)}` : "";
  console.error(`[agenthub:install] ${message}${suffix}`);
}

async function requestPayloadText(rawUrl) {
  const parsed = new URL(rawUrl);
  const transport = parsed.protocol === "http:" ? httpRequest : httpsRequest;
  const requestOptions = {
    method: "GET",
    hostname: parsed.hostname,
    port: parsed.port,
    path: `${parsed.pathname}${parsed.search || ""}`,
    protocol: parsed.protocol,
    headers: {
      "User-Agent": "agenthub-cli/0.1.3",
      Accept: "application/json",
    },
  };

  debugLog("fallback request begin", { url: rawUrl, protocol: parsed.protocol, hostname: parsed.hostname, path: requestOptions.path });

  return await new Promise((resolve, reject) => {
    const req = transport(requestOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          const reason = `${res.statusCode} ${res.statusMessage || ""}`;
          debugLog("fallback request failed", { reason, rawUrl });
          reject(new Error(`Remote install failed: ${reason}`));
          return;
        }
        debugLog("fallback request success", { rawUrl, bytes: data.length });
        resolve(data);
      });
    });

    req.on("error", (error) => {
      debugLog("fallback request error", { rawUrl, message: error.message });
      reject(error);
    });
    req.end();
  });
}

async function fetchPayload(url) {
  const baseUrl = url.toString();
  debugLog("requesting payload", { url: baseUrl });

  try {
    const response = await fetch(baseUrl);
    debugLog("primary fetch done", { url: baseUrl, ok: response.ok, status: response.status, statusText: response.statusText });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return response;
  } catch (err) {
    debugLog("primary fetch failed, fallback to http/https", { url: baseUrl, error: err.message });
    const payloadText = await requestPayloadText(baseUrl);
    return {
      ok: true,
      json: async () => JSON.parse(payloadText),
      statusText: "OK",
    };
  }
}

async function applyBundleDir({ bundleDir, targetWorkspace }) {
  const manifest = await readJson(path.join(bundleDir, "MANIFEST.json"));
  await ensureDir(targetWorkspace);
  await copyDir(path.join(bundleDir, "WORKSPACE"), targetWorkspace);
  const template = await readJson(path.join(bundleDir, "OPENCLAW.template.json"));
  const appliedPath = path.join(targetWorkspace, ".agenthub", "OPENCLAW.applied.json");
  await writeJson(appliedPath, template);
  return { manifest, appliedPath };
}

/**
 * 解析 agentSpec，支持两种格式：
 * - 短名格式：slug 或 slug:version
 * - URI 格式：agenthub://owner/slug@version
 */
function parseAgentSpec(agentSpec) {
  // URI 格式：agenthub://owner/slug@version
  if (agentSpec.startsWith("agenthub://")) {
    const uri = agentSpec.slice("agenthub://".length);
    // owner/slug@version -> slug@version
    const parts = uri.split("/");
    const lastPart = parts[parts.length - 1] || parts[parts.length - 2];
    const [slug, version] = lastPart.split("@");
    return { slug, version: version || undefined };
  }
  // 短名格式：slug 或 slug:version
  const [slug, version] = agentSpec.split(":");
  return { slug, version: version || undefined };
}

async function installFromRemote({ serverUrl, agentSpec, targetWorkspace }) {
  const { slug, version } = parseAgentSpec(agentSpec);
  const url = new URL(`/api/agents/${slug}/download`, serverUrl);
  if (version) {
    url.searchParams.set("version", version);
  }

  debugLog("installing from remote", { serverUrl, slug, version: version || "latest", targetWorkspace, url: url.toString() });

  let response;
  try {
    response = await fetchPayload(url);
  } catch (error) {
    debugLog("remote install failed", { slug, error: error.message, cause: error.cause });
    // 提取更详细的错误信息
    const causeMsg = error.cause?.errors?.[0]?.message || error.cause?.message || "";
    const detailMsg = causeMsg ? `${error.message}: ${causeMsg}` : error.message;
    throw new Error(`Remote install failed: ${detailMsg}`);
  }

  if (!response.ok) {
    throw new Error(`Remote install failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  debugLog("payload received", { slug, size: JSON.stringify(payload).length });
  const bundleDir = await materializeBundlePayload(payload);
  return applyBundleDir({ bundleDir, targetWorkspace });
}

export async function installBundle({ registryDir, serverUrl, agentSpec, targetWorkspace }) {
  if (registryDir) {
    const manifest = await readAgentInfo(registryDir, agentSpec);
    const bundleDir = path.join(registryDir, "agents", manifest.slug, manifest.version);
    return applyBundleDir({ bundleDir, targetWorkspace });
  }

  if (serverUrl) {
    return installFromRemote({ serverUrl, agentSpec, targetWorkspace });
  }

  throw new Error("Either registryDir or serverUrl is required");
}
