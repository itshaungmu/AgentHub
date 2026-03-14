import path from "node:path";
import { pathExists, readJson, writeJson } from "./fs-utils.js";

const STATS_FILE = "download-stats.json";

/**
 * 获取下载统计
 */
export async function getDownloadStats(registryDir) {
  const statsPath = path.join(registryDir, STATS_FILE);
  if (await pathExists(statsPath)) {
    return readJson(statsPath);
  }
  return { agents: {} };
}

/**
 * 保存下载统计
 */
export async function saveDownloadStats(registryDir, stats) {
  const statsPath = path.join(registryDir, STATS_FILE);
  await writeJson(statsPath, stats);
}

/**
 * 增加下载次数
 */
export async function incrementDownloads(registryDir, slug) {
  const stats = await getDownloadStats(registryDir);
  if (!stats.agents[slug]) {
    stats.agents[slug] = { downloads: 0 };
  }
  stats.agents[slug].downloads += 1;
  stats.agents[slug].lastDownload = new Date().toISOString();
  await saveDownloadStats(registryDir, stats);
  return stats.agents[slug].downloads;
}

/**
 * 获取单个 Agent 的下载次数
 */
export async function getAgentDownloads(registryDir, slug) {
  const stats = await getDownloadStats(registryDir);
  return stats.agents[slug]?.downloads || 0;
}

/**
 * 批量获取多个 Agent 的下载次数
 */
export async function getAgentsDownloads(registryDir, slugs) {
  const stats = await getDownloadStats(registryDir);
  const result = {};
  for (const slug of slugs) {
    result[slug] = stats.agents[slug]?.downloads || 0;
  }
  return result;
}

/**
 * 获取所有 Agent 的下载次数
 */
export async function getAllDownloads(registryDir) {
  const stats = await getDownloadStats(registryDir);
  return stats.agents;
}

/**
 * 获取总下载次数
 */
export async function getTotalDownloads(registryDir) {
  const stats = await getDownloadStats(registryDir);
  let total = 0;
  for (const agent of Object.values(stats.agents)) {
    total += agent.downloads || 0;
  }
  return total;
}
