/**
 * Versions Command
 * 查看 Agent 的所有可用版本
 */

import { pathExists, readJson } from "../lib/fs-utils.js";
import path from "node:path";
import { fetchRemoteJson } from "../lib/remote.js";

export async function versionsCommand(agentSpec, options = {}) {
  const [slug] = agentSpec.split(":");

  if (!options.registry) {
    const result = await fetchRemoteJson(`/api/agents?q=${encodeURIComponent(slug)}`, options);
    return (result.agents || [])
      .filter((entry) => entry.slug === slug)
      .map((entry) => ({
        version: entry.version,
        name: entry.name,
        description: entry.description,
        updatedAt: entry.updatedAt || entry.createdAt,
      }))
      .sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));
  }

  const registryDir = path.resolve(options.registry);
  const indexPath = path.join(registryDir, "index.json");
  if (!(await pathExists(indexPath))) {
    return [];
  }

  const index = await readJson(indexPath);
  const versions = index.agents
    .filter((entry) => entry.slug === slug)
    .map((entry) => ({
      version: entry.version,
      name: entry.name,
      description: entry.description,
      updatedAt: entry.updatedAt || entry.createdAt,
    }))
    .sort((a, b) => b.version.localeCompare(a.version, undefined, { numeric: true }));

  return versions;
}

export function formatVersionsOutput(slug, versions, currentVersion = null) {
  const lines = [];
  lines.push(`\n📋 ${slug} 可用版本:\n`);
  lines.push("─".repeat(50));

  for (const v of versions) {
    const isLatest = v === versions[0];
    const isCurrent = currentVersion && v.version === currentVersion;
    const marker = isCurrent ? "✓" : isLatest ? "*" : " ";
    const latestTag = isLatest ? " (latest)" : "";
    const currentTag = isCurrent ? " (installed)" : "";

    lines.push(`  ${marker} ${v.version}${latestTag}${currentTag}`);
    if (v.description) {
      lines.push(`      ${v.description.substring(0, 60)}`);
    }
  }

  lines.push("─".repeat(50));

  if (currentVersion) {
    lines.push(`\n当前安装: ${currentVersion}`);
    if (versions.length > 0 && versions[0].version !== currentVersion) {
      lines.push(`可更新到: ${versions[0].version}`);
      lines.push(`\n更新命令: agenthub update ${slug}`);
    }
  } else {
    lines.push(`\n安装命令: agenthub install ${slug}`);
  }

  return lines.join("\n");
}
