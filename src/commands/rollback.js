/**
 * Rollback Command
 * 回滚 Agent 到指定版本
 */

import path from "node:path";
import { getCurrentVersion, updateInstallRecord, buildInstallOptions } from "../lib/version-manager.js";
import { installBundle } from "../lib/install.js";
import { parseSpec } from "../lib/registry.js";
import { versionsCommand } from "./versions.js";
import { success, warning, highlight, muted, symbols } from "../lib/colors.js";

export async function rollbackCommand(agentSpec, options = {}) {
  const targetWorkspace = options.targetWorkspace ? path.resolve(options.targetWorkspace) : null;
  const targetVersion = options.to;

  if (!targetVersion) {
    throw new Error("请指定回滚版本: --to <version>");
  }

  const { slug } = parseSpec(agentSpec);

  // 验证目标版本存在
  const versions = await versionsCommand(slug, options);
  const versionExists = versions.some((v) => v.version === targetVersion);
  if (!versionExists) {
    throw new Error(`版本 ${targetVersion} 不存在`);
  }

  // 获取当前版本
  const currentVersion = await getCurrentVersion(targetWorkspace);

  // 执行回滚
  const installOptions = buildInstallOptions(slug, targetVersion, targetWorkspace, options);
  const result = await installBundle(installOptions);

  // 记录回滚
  await updateInstallRecord(targetWorkspace, slug, targetVersion, {
    rolledBackAt: new Date().toISOString(),
    rolledBackFrom: currentVersion,
  });

  return {
    rolledBack: true,
    message: [
      success(`${symbols.success} 回滚成功`),
      "",
      `  ${highlight("Agent:")} ${slug}`,
      `  ${muted("回滚前:")} ${currentVersion || "未知"}`,
      `  ${highlight("当前版本:")} ${targetVersion}`,
      "",
      `  ${muted("运行")} ${highlight("agenthub verify " + slug)} ${muted("校验安装状态")}`,
      `  ${muted("运行")} ${highlight("agenthub update " + slug)} ${muted("恢复到最新版本")}`,
    ].join("\n"),
    currentVersion: targetVersion,
    previousVersion: currentVersion,
    manifest: result.manifest,
  };
}
