import path from "node:path";
import { pathExists, readJson } from "../lib/fs-utils.js";
import { parseSpec } from "../lib/registry.js";
import { infoCommand } from "./info.js";
import { success, error, warning, info as infoColor, highlight, muted, symbols } from "../lib/colors.js";

export async function verifyCommand(agentSpec, options = {}) {
  const targetWorkspace = path.resolve(options.targetWorkspace || process.cwd());
  const installRecordPath = path.join(targetWorkspace, ".agenthub", "install.json");
  const appliedConfigPath = path.join(targetWorkspace, ".agenthub", "OPENCLAW.applied.json");

  const checks = [];

  if (!(await pathExists(installRecordPath))) {
    return {
      ok: false,
      verified: false,
      targetWorkspace,
      reason: "install record missing",
      checks: [{ name: "install_record", ok: false, detail: installRecordPath }],
    };
  }

  const installRecord = await readJson(installRecordPath);
  const expectedSlug = agentSpec ? parseSpec(agentSpec).slug : installRecord.slug;
  if (expectedSlug && installRecord.slug !== expectedSlug) {
    checks.push({
      name: "slug_match",
      ok: false,
      detail: `installed=${installRecord.slug}, expected=${expectedSlug}`,
    });
    return {
      ok: false,
      verified: false,
      targetWorkspace,
      installRecord,
      checks,
      reason: "installed slug mismatch",
    };
  }

  checks.push({ name: "install_record", ok: true, detail: installRecordPath });

  const configExists = await pathExists(appliedConfigPath);
  checks.push({ name: "applied_config", ok: configExists, detail: appliedConfigPath });

  let manifest = null;
  try {
    manifest = await infoCommand(`${installRecord.slug}:${installRecord.version}`, options);
    checks.push({ name: "manifest_lookup", ok: true, detail: `${installRecord.slug}@${installRecord.version}` });
  } catch (error) {
    checks.push({
      name: "manifest_lookup",
      ok: false,
      detail: error.message,
    });
  }

  const requiredFiles = ["AGENTS.md", "SOUL.md", "USER.md"];
  for (const fileName of requiredFiles) {
    const filePath = path.join(targetWorkspace, fileName);
    checks.push({
      name: `workspace_file:${fileName}`,
      ok: await pathExists(filePath),
      detail: filePath,
    });
  }

  const verified = checks.every((check) => check.ok);
  return {
    ok: verified,
    verified,
    targetWorkspace,
    installRecord,
    manifest,
    checks,
  };
}

export function formatVerifyOutput(result) {
  const lines = [];

  // 标题
  if (result.verified) {
    lines.push(`\n${success(`${symbols.success} 校验通过`)}\n`);
  } else {
    lines.push(`\n${error(`${symbols.error} 校验失败`)}\n`);
  }

  // Agent 信息
  if (result.installRecord) {
    lines.push(`${highlight("Agent:")} ${result.installRecord.slug}@${result.installRecord.version}`);
  }
  lines.push(`${highlight("Workspace:")} ${result.targetWorkspace}`);
  lines.push("");

  // 检查结果
  lines.push(`${infoColor("检查项目:")}`);
  for (const check of result.checks || []) {
    const status = check.ok
      ? success(`${symbols.success} PASS`)
      : error(`${symbols.error} FAIL`);
    const checkName = check.name.replace(":", ": ").replace("_", " ");
    lines.push(`  ${status} ${muted(checkName)}`);
    if (!check.ok || check.name.includes(":")) {
      lines.push(`         ${muted(check.detail)}`);
    }
  }

  // 失败原因
  if (result.reason) {
    lines.push(`\n${warning(`原因: ${result.reason}`)}`);
  }

  // 健康度建议
  if (result.verified) {
    lines.push(`\n${success("Agent 安装完整，可以正常使用。")}`);
  } else {
    lines.push(`\n${warning("建议:")}`);
    if (result.checks?.some(c => c.name === "install_record" && !c.ok)) {
      lines.push(`  - 运行 ${highlight("agenthub install <agent-slug>")} 安装 Agent`);
    }
    if (result.checks?.some(c => c.name.includes("workspace_file") && !c.ok)) {
      lines.push(`  - 检查 workspace 文件是否完整`);
      lines.push(`  - 尝试重新安装: ${highlight("agenthub install <agent-slug> --force")}`);
    }
    if (result.checks?.some(c => c.name === "applied_config" && !c.ok)) {
      lines.push(`  - 配置文件未应用，检查 OPENCLAW.template.json`);
    }
  }

  return lines.join("\n");
}
