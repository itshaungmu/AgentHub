import path from "node:path";
import { copyDir, ensureDir, readJson, writeJson } from "./fs-utils.js";
import { readAgentInfo, parseSpec } from "./registry.js";
import { materializeBundlePayload } from "./bundle-transfer.js";
import { fetchJsonWithFallback } from "./http.js";

function debugLog(message, details) {
  if (!process.env.AGENTHUB_DEBUG_INSTALL) return;
  const suffix = details ? ` | ${JSON.stringify(details)}` : "";
  console.error(`[agenthub:install] ${message}${suffix}`);
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

async function installFromRemote({ serverUrl, agentSpec, targetWorkspace }) {
  const { slug, version } = parseSpec(agentSpec);
  const url = new URL(`/api/agents/${slug}/download`, serverUrl);
  if (version) {
    url.searchParams.set("version", version);
  }

  debugLog("installing from remote", { serverUrl, slug, version: version || "latest", targetWorkspace, url: url.toString() });

  let payload;
  try {
    payload = await fetchJsonWithFallback(url);
  } catch (error) {
    debugLog("remote install failed", { slug, error: error.message, cause: error.cause });
    // 提取更详细的错误信息
    const causeMsg = error.cause?.errors?.[0]?.message || error.cause?.message || "";
    const detailMsg = causeMsg ? `${error.message}: ${causeMsg}` : error.message;
    throw new Error(`Remote install failed: ${detailMsg}`);
  }

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
