/**
 * Rollback Command
 * 回滚 Agent 到指定版本
 */

import path from "node:path";
import { pathExists, readJson, writeJson } from "../lib/fs-utils.js";
import { installBundle } from "../lib/install.js";
import { versionsCommand } from "./versions.js";

export async function rollbackCommand(agentSpec, options = {}) {
  const registryDir = options.registry ? path.resolve(options.registry) : null;
  const targetWorkspace = options.targetWorkspace ? path.resolve(options.targetWorkspace) : null;
  const targetVersion = options.to;

  if (!targetVersion) {
    throw new Error("请指定回滚版本: --to <version>");
  }

  const [slug] = agentSpec.split(":");

  // 验证目标版本存在
  const versions = await versionsCommand(slug, registryDir ? { registry: registryDir } : options);
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
  const installOptions = {
    agentSpec: `${slug}:${targetVersion}`,
    targetWorkspace,
  };
  if (registryDir) {
    installOptions.registryDir = registryDir;
  } else {
    installOptions.serverUrl = options.server || "https://agenthub.cyou";
  }
  const result = await installBundle(installOptions);

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
