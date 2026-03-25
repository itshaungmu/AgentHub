/**
 * Update Command
 * 更新已安装的 Agent 到最新版本
 */

import path from "node:path";
import { getCurrentVersion, performVersionChange } from "../lib/version-manager.js";
import { parseSpec } from "../lib/registry.js";
import { versionsCommand } from "./versions.js";
import { success, warning, highlight, muted, symbols } from "../lib/colors.js";

export async function updateCommand(agentSpec, options = {}) {
  const targetWorkspace = options.targetWorkspace ? path.resolve(options.targetWorkspace) : null;
  const { slug } = parseSpec(agentSpec);

  // 获取可用版本
  const versions = await versionsCommand(slug, options);
  if (versions.length === 0) {
    throw new Error(`Agent not found: ${slug}`);
  }

  const latestVersion = versions[0].version;

  // 获取当前安装版本
  const currentVersion = await getCurrentVersion(targetWorkspace);

  if (currentVersion === latestVersion) {
    return {
      updated: false,
      message: `${success(`${symbols.success} ${slug} 已是最新版本`)} ${muted(`(${latestVersion})`)}`,
      currentVersion,
      latestVersion,
    };
  }

  // 执行更新
  const result = await performVersionChange(slug, latestVersion, currentVersion, targetWorkspace, options);

  return {
    updated: true,
    message: [
      success(`${symbols.success} 更新成功`),
      "",
      `  ${highlight("Agent:")} ${slug}`,
      `  ${muted("旧版本:")} ${currentVersion || "未知"}`,
      `  ${highlight("新版本:")} ${latestVersion}`,
      "",
      `  ${muted("运行")} ${highlight("agenthub verify " + slug)} ${muted("校验安装状态")}`,
    ].join("\n"),
    currentVersion: latestVersion,
    previousVersion: currentVersion,
    manifest: result.manifest,
  };
}
