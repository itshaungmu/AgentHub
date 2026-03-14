import path from "node:path";
import { copyDir, ensureDir, readJson, writeJson } from "./fs-utils.js";
import { readAgentInfo } from "./registry.js";

export async function installBundle({ registryDir, agentSpec, targetWorkspace }) {
  const manifest = await readAgentInfo(registryDir, agentSpec);
  const bundleDir = path.join(registryDir, "agents", manifest.slug, manifest.version);
  await ensureDir(targetWorkspace);
  await copyDir(path.join(bundleDir, "WORKSPACE"), targetWorkspace);
  const template = await readJson(path.join(bundleDir, "OPENCLAW.template.json"));
  const appliedPath = path.join(targetWorkspace, ".agenthub", "OPENCLAW.applied.json");
  await writeJson(appliedPath, template);
  return { manifest, appliedPath };
}
