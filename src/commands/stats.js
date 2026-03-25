/**
 * Stats Command
 * 查看 Agent 统计信息
 */

import path from "node:path";
import { pathExists, readJson } from "../lib/fs-utils.js";
import { fetchRemoteJson } from "../lib/remote.js";
import { parseSpec, getLatestVersion } from "../lib/registry.js";

/**
 * 构建统计返回对象的辅助函数
 */
function buildStatsResult(slug, manifest, agentEntries) {
  const latestEntry = getLatestVersion(agentEntries);
  return {
    slug,
    name: manifest.name,
    latestVersion: latestEntry.version,
    totalVersions: agentEntries.length,
    description: manifest.description,
    author: manifest.author,
    runtime: manifest.runtime,
    includes: manifest.includes,
    requirements: manifest.requirements,
    metadata: manifest.metadata,
    downloads: manifest.downloads || 0,
    stars: manifest.stats?.stars || 0,
    rating: manifest.stats?.rating || null,
  };
}

export async function statsCommand(agentSpec, options = {}) {
  const { slug } = parseSpec(agentSpec);

  if (!options.registry) {
    const [manifest, agentsResult] = await Promise.all([
      fetchRemoteJson(`/api/agents/${slug}`, options),
      fetchRemoteJson(`/api/agents?q=${encodeURIComponent(slug)}`, options),
    ]);

    const agentEntries = (agentsResult.agents || []).filter((entry) => entry.slug === slug);
    if (agentEntries.length === 0) {
      throw new Error(`Agent not found: ${slug}`);
    }

    return buildStatsResult(slug, manifest, agentEntries);
  }

  const registryDir = path.resolve(options.registry);
  const indexPath = path.join(registryDir, "index.json");
  if (!(await pathExists(indexPath))) {
    throw new Error(`Agent not found: ${slug}`);
  }

  const index = await readJson(indexPath);
  const agentEntries = index.agents.filter((entry) => entry.slug === slug);

  if (agentEntries.length === 0) {
    throw new Error(`Agent not found: ${slug}`);
  }

  const latestEntry = getLatestVersion(agentEntries);
  const manifestPath = path.join(
    registryDir,
    "agents",
    slug,
    latestEntry.version,
    "MANIFEST.json"
  );
  const manifest = await readJson(manifestPath);

  return buildStatsResult(slug, manifest, agentEntries);
}

export function formatStatsOutput(stats) {
  const lines = [];
  lines.push("\n╔═══════════════════════════════════════════════════════════════╗");
  lines.push("║                     Agent Statistics                          ║");
  lines.push("╠═══════════════════════════════════════════════════════════════╣");
  lines.push(`║ Name:           ${stats.name.substring(0, 44).padEnd(44)}║`);
  lines.push(`║ Slug:           ${stats.slug.padEnd(44)}║`);
  lines.push(`║ Version:        ${stats.latestVersion.padEnd(44)}║`);
  lines.push(`║ Author:         ${(stats.author || "unknown").padEnd(44)}║`);
  lines.push("╠═══════════════════════════════════════════════════════════════╣");
  lines.push("║ Statistics:                                                    ║");
  lines.push(`║   Downloads:    ${String(stats.downloads).padEnd(44)}║`);
  lines.push(`║   Stars:        ${String(stats.stars).padEnd(44)}║`);
  lines.push(`║   Versions:     ${String(stats.totalVersions).padEnd(44)}║`);
  if (stats.rating) {
    lines.push(`║   Rating:       ${`${stats.rating}/5.0`.padEnd(44)}║`);
  }
  lines.push("╠═══════════════════════════════════════════════════════════════╣");
  lines.push("║ Content:                                                       ║");
  const memory = stats.includes?.memory || {};
  lines.push(`║   Memory:       ${`共 ${memory.count || 0} 条 (public: ${memory.public || 0}, portable: ${memory.portable || 0})`.padEnd(42)}║`);
  if (stats.includes?.skills?.length > 0) {
    lines.push(`║   Skills:       ${stats.includes.skills.join(", ").substring(0, 42).padEnd(42)}║`);
  }
  lines.push("╠═══════════════════════════════════════════════════════════════╣");
  lines.push(`║ Runtime:        ${`${stats.runtime?.type || "openclaw"} ${stats.runtime?.version || ""}`.padEnd(44)}║`);
  lines.push("╚═══════════════════════════════════════════════════════════════╝");

  return lines.join("\n");
}
