import path from "node:path";
import { copyDir, ensureDir, readJson, writeJson } from "./fs-utils.js";
import { readAgentInfo } from "./registry.js";
import { materializeBundlePayload } from "./bundle-transfer.js";

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
  const [slug, version] = agentSpec.split(":");
  const url = new URL(`/api/agents/${slug}/download`, serverUrl);
  if (version) {
    url.searchParams.set("version", version);
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Remote install failed: ${response.status} ${await response.text()}`);
  }
  const payload = await response.json();
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
