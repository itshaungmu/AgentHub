/**
 * Uninstall Command
 * 卸载已安装的 Agent
 */

import path from "node:path";
import { pathExists, readJson, writeJson, removeDir } from "../lib/fs-utils.js";

/**
 * 卸载已安装的 Agent
 * @param {string} agentSpec - Agent slug 或 slug@version
 * @param {object} options - 选项
 * @returns {Promise<object>} 卸载结果
 */
export async function uninstallCommand(agentSpec, options = {}) {
  const { slug } = parseSpec(agentSpec);
  const targetWorkspace = path.resolve(options.targetWorkspace || process.cwd());
  const agenthubDir = path.join(targetWorkspace, ".agenthub");
  const installRecordPath = path.join(agenthubDir, "install.json");

  // 检查安装记录是否存在
  if (!(await pathExists(installRecordPath))) {
    throw new Error(`未找到安装记录: ${slug}\n  该 Agent 可能未安装或安装记录已损坏`);
  }

  // 读取安装记录
  const installRecord = await readJson(installRecordPath);

  // 检查是否是该 Agent
  if (installRecord.slug !== slug) {
    throw new Error(`当前工作区安装的是 ${installRecord.slug}，而非 ${slug}`);
  }

  // 保存卸载信息
  const uninstallInfo = {
    slug: installRecord.slug,
    version: installRecord.version,
    installedAt: installRecord.installedAt,
    uninstalledAt: new Date().toISOString(),
    location: targetWorkspace,
  };

  // 删除安装记录
  await removeDir(agenthubDir);

  return uninstallInfo;
}

/**
 * 解析 agent spec
 */
function parseSpec(spec) {
  const match = spec.match(/^([^@]+)(?:@(.+))?$/);
  if (!match) {
    throw new Error(`无效的 agent spec: ${spec}`);
  }
  return {
    slug: match[1],
    version: match[2] || null,
  };
}

/**
 * 格式化卸载输出
 */
export function formatUninstallOutput(info) {
  const lines = [];
  lines.push("\n🗑️  卸载成功\n");
  lines.push("─".repeat(50));
  lines.push(`  Agent:     ${info.slug}@${info.version}`);
  lines.push(`  安装时间:   ${info.installedAt || "未知"}`);
  lines.push(`  卸载时间:   ${info.uninstalledAt}`);
  lines.push("─".repeat(50));
  lines.push(`\n💡 重新安装: agenthub install ${info.slug}\n`);
  return lines.join("\n");
}
