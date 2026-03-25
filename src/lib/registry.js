import path from "node:path";
import { copyDir, ensureDir, pathExists, readJson, writeJson } from "./fs-utils.js";

/**
 * 解析 agentSpec，支持两种格式：
 * - 短名格式：slug 或 slug:version
 * - URI 格式：agenthub://owner/slug@version
 */
export function parseSpec(agentSpec) {
  // URI 格式：agenthub://owner/slug@version
  if (agentSpec.startsWith("agenthub://")) {
    const uri = agentSpec.slice("agenthub://".length);
    const parts = uri.split("/");
    const lastPart = parts[parts.length - 1] || parts[parts.length - 2];
    const [slug, version] = lastPart.split("@");
    return { slug, version: version || undefined };
  }
  // 短名格式：slug 或 slug:version
  const [slug, version] = agentSpec.split(":");
  return { slug, version: version || undefined };
}

/**
 * 版本比较函数（用于排序）
 * 按 semver 降序排列
 */
export function compareVersionsDesc(a, b) {
  return b.version.localeCompare(a.version, undefined, { numeric: true });
}

/**
 * 从 agent 条目中获取最新版本
 */
export function getLatestVersion(entries) {
  if (!entries || entries.length === 0) return null;
  return [...entries].sort(compareVersionsDesc)[0];
}

/**
 * 按下载量和更新时间排序 Agent 列表
 * 下载量降序，下载量一致时按更新时间降序
 */
export function sortByDownloadsAndTime(agents) {
  return agents.sort((a, b) => {
    if (b.downloads !== a.downloads) {
      return b.downloads - a.downloads;
    }
    const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
    const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    return timeB - timeA;
  });
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
    updatedAt: new Date().toISOString(),
    tags: manifest.metadata?.tags || [],
    category: manifest.metadata?.category || 'General',
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
  const normalized = query.toLowerCase().trim();

  // 空查询返回所有
  if (!normalized) {
    return index.agents;
  }

  return index.agents.filter((entry) => {
    // 搜索 slug
    if (entry.slug?.toLowerCase().includes(normalized)) return true;
    // 搜索 name
    if (entry.name?.toLowerCase().includes(normalized)) return true;
    // 搜索 description
    if (entry.description?.toLowerCase().includes(normalized)) return true;
    // 搜索 tags
    if (entry.tags?.some(tag => tag.toLowerCase().includes(normalized))) return true;
    // 搜索 category
    if (entry.category?.toLowerCase().includes(normalized)) return true;
    return false;
  });
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
