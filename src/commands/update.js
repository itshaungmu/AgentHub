/**
 * Update Command
 * 更新已安装的 Agent 到最新版本
 */

import path from "node:path";
import { pathExists, readJson, writeJson } from "../lib/fs-utils.js";
import { installBundle } from "../lib/install.js";
import { versionsCommand } from "./versions.js";

export async function updateCommand(agentSpec, options) {
  const registryDir = path.resolve(options.registry);
  const targetWorkspace = options.targetWorkspace ? path.resolve(options.targetWorkspace) : null;
  const [slug] = agentSpec.split(":");

  // 获取可用版本
  const versions = await versionsCommand(slug, { registry: registryDir });
  if (versions.length === 0) {
    throw new Error(`Agent not found: ${slug}`);
  }

  const latestVersion = versions[0].version;

  // 获取当前安装版本
  let currentVersion = null;
  if (targetWorkspace) {
    const installRecordPath = path.join(targetWorkspace, ".agenthub", "install.json");
    if (await pathExists(installRecordPath)) {
      const record = await readJson(installRecordPath);
      currentVersion = record.version;
    }
  }

  if (currentVersion === latestVersion) {
    return {
      updated: false,
      message: `已是最新版本: ${latestVersion}`,
      currentVersion,
      latestVersion,
    };
  }

  // 执行更新
  const result = await installBundle({
    registryDir,
    agentSpec: `${slug}:${latestVersion}`,
    targetWorkspace,
  });

  // 记录更新
  if (targetWorkspace) {
    const installRecordPath = path.join(targetWorkspace, ".agenthub", "install.json");
    await writeJson(installRecordPath, {
      slug,
      version: latestVersion,
      updatedAt: new Date().toISOString(),
      previousVersion: currentVersion,
    });
  }

  return {
    updated: true,
    message: `已更新 ${slug} 从 ${currentVersion || "未知"} 到 ${latestVersion}`,
    currentVersion: latestVersion,
    previousVersion: currentVersion,
    manifest: result.manifest,
  };
}
