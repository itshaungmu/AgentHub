/**
 * Rollback Command
 * 回滚 Agent 到指定版本
 */

import path from "node:path";
import { pathExists, readJson, writeJson } from "../lib/fs-utils.js";
import { installBundle } from "../lib/install.js";
import { versionsCommand } from "./versions.js";

export async function rollbackCommand(agentSpec, options) {
  const registryDir = path.resolve(options.registry);
  const targetWorkspace = options.targetWorkspace ? path.resolve(options.targetWorkspace) : null;
  const targetVersion = options.to;

  if (!targetVersion) {
    throw new Error("请指定回滚版本: --to <version>");
  }

  const [slug] = agentSpec.split(":");

  // 验证目标版本存在
  const versions = await versionsCommand(slug, { registry: registryDir });
  const versionExists = versions.some((v) => v.version === targetVersion);
  if (!versionExists) {
    throw new Error(`版本 ${targetVersion} 不存在`);
  }

  // 获取当前版本
  let currentVersion = null;
  if (targetWorkspace) {
    const installRecordPath = path.join(targetWorkspace, ".agenthub", "install.json");
    if (await pathExists(installRecordPath)) {
      const record = await readJson(installRecordPath);
      currentVersion = record.version;
    }
  }

  // 执行回滚
  const result = await installBundle({
    registryDir,
    agentSpec: `${slug}:${targetVersion}`,
    targetWorkspace,
  });

  // 记录回滚
  if (targetWorkspace) {
    const installRecordPath = path.join(targetWorkspace, ".agenthub", "install.json");
    await writeJson(installRecordPath, {
      slug,
      version: targetVersion,
      rolledBackAt: new Date().toISOString(),
      rolledBackFrom: currentVersion,
    });
  }

  return {
    rolledBack: true,
    message: `已回滚 ${slug} 从 ${currentVersion || "未知"} 到 ${targetVersion}`,
    currentVersion: targetVersion,
    previousVersion: currentVersion,
    manifest: result.manifest,
  };
}
