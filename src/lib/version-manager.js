/**
 * Version Manager
 * Agent 版本管理共享逻辑
 */

import path from "node:path";
import { pathExists, readJson, writeJson } from "./fs-utils.js";
import { installBundle } from "./install.js";

/**
 * 获取当前安装的版本
 */
export async function getCurrentVersion(targetWorkspace) {
  if (!targetWorkspace) return null;

  const installRecordPath = path.join(targetWorkspace, ".agenthub", "install.json");
  if (await pathExists(installRecordPath)) {
    const record = await readJson(installRecordPath);
    return record.version;
  }
  return null;
}

/**
 * 构建安装选项
 */
export function buildInstallOptions(slug, version, targetWorkspace, options) {
  const registryDir = options.registry ? path.resolve(options.registry) : null;

  const installOptions = {
    agentSpec: `${slug}:${version}`,
    targetWorkspace,
  };

  if (registryDir) {
    installOptions.registryDir = registryDir;
  } else {
    installOptions.serverUrl = options.server || "https://agenthub.cyou";
  }

  return installOptions;
}

/**
 * 更新安装记录
 */
export async function updateInstallRecord(targetWorkspace, slug, version, metadata = {}) {
  if (!targetWorkspace) return;

  const installRecordPath = path.join(targetWorkspace, ".agenthub", "install.json");
  await writeJson(installRecordPath, {
    slug,
    version,
    ...metadata,
  });
}

/**
 * 执行版本变更（更新或回滚）
 */
export async function performVersionChange(slug, targetVersion, previousVersion, targetWorkspace, options) {
  const installOptions = buildInstallOptions(slug, targetVersion, targetWorkspace, options);
  const result = await installBundle(installOptions);

  const metadata = {
    updatedAt: new Date().toISOString(),
    previousVersion,
  };

  await updateInstallRecord(targetWorkspace, slug, targetVersion, metadata);

  return {
    manifest: result.manifest,
    previousVersion,
    targetVersion,
  };
}
