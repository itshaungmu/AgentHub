import path from "node:path";
import { copyDir, ensureDir, pathExists, readJson, writeJson } from "./fs-utils.js";

function parseSpec(agentSpec) {
  const [slug, version] = agentSpec.split(":");
  return { slug, version };
}

export async function publishBundle(bundleDir, registryDir) {
  const manifest = await readJson(path.join(bundleDir, "MANIFEST.json"));
  if (manifest.runtime?.type !== "openclaw") {
    throw new Error("Only OpenClaw bundles are supported.");
  }
  if ((manifest.includes?.memory?.private ?? 0) > 0) {
    throw new Error("Public publish rejected: private memory detected.");
  }

  const targetDir = path.join(registryDir, "agents", manifest.slug, manifest.version);
  await ensureDir(path.join(registryDir, "agents", manifest.slug));
  await copyDir(bundleDir, targetDir);

  const indexPath = path.join(registryDir, "index.json");
  const index = (await pathExists(indexPath)) ? await readJson(indexPath) : { agents: [] };
  index.agents = index.agents.filter(
    (entry) => !(entry.slug === manifest.slug && entry.version === manifest.version),
  );
  index.agents.push({
    slug: manifest.slug,
    version: manifest.version,
    name: manifest.name,
    description: manifest.description,
    runtime: manifest.runtime,
  });
  index.agents.sort((left, right) => left.slug.localeCompare(right.slug));
  await writeJson(indexPath, index);

  return manifest;
}

export async function searchRegistry(registryDir, query) {
  const indexPath = path.join(registryDir, "index.json");
  if (!(await pathExists(indexPath))) {
    return [];
  }
  const index = await readJson(indexPath);
  const normalized = query.toLowerCase();
  return index.agents.filter((entry) => entry.slug.toLowerCase().includes(normalized));
}

export async function readAgentInfo(registryDir, agentSpec) {
  const { slug, version } = parseSpec(agentSpec);
  const baseDir = path.join(registryDir, "agents", slug);
  if (!(await pathExists(baseDir))) {
    throw new Error(`Agent not found: ${slug}`);
  }

  let selectedVersion = version;
  if (!selectedVersion) {
    const index = await readJson(path.join(registryDir, "index.json"));
    const versions = index.agents.filter((entry) => entry.slug === slug).map((entry) => entry.version).sort();
    selectedVersion = versions.at(-1);
  }
  return readJson(path.join(baseDir, selectedVersion, "MANIFEST.json"));
}
