import path from "node:path";
import { pathExists, readJson } from "../lib/fs-utils.js";
import { parseSpec } from "../lib/registry.js";
import { infoCommand } from "./info.js";

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
  lines.push(`\n${result.verified ? "✅" : "❌"} Verify ${result.verified ? "passed" : "failed"}\n`);
  if (result.installRecord) {
    lines.push(`Agent: ${result.installRecord.slug}@${result.installRecord.version}`);
  }
  lines.push(`Workspace: ${result.targetWorkspace}`);
  lines.push("");
  for (const check of result.checks || []) {
    lines.push(`- ${check.ok ? "PASS" : "FAIL"} ${check.name}: ${check.detail}`);
  }
  if (result.reason) {
    lines.push(`\nReason: ${result.reason}`);
  }
  return lines.join("\n");
}
