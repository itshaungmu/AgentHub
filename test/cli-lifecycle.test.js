import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createTempDir, PROJECT_ROOT, readJson, runCli, setupWorkspace, writeJson } from "./helpers.js";

async function buildTwoVersions(temp) {
  const workspace = path.join(temp, "workspace");
  const output = path.join(temp, "output");
  const registry = path.join(temp, "registry");
  const configPath = path.join(temp, "openclaw.json");

  await setupWorkspace(workspace);
  await writeJson(configPath, {
    agents: { defaults: { model: { primary: "anthropic/claude-3-5-sonnet" } } },
  });

  assert.equal(
    runCli(["pack", "--workspace", workspace, "--config", configPath, "--output", output]).status,
    0,
  );

  const baseBundle = path.join(output, "workspace-1.0.0.agent");
  const nextBundle = path.join(output, "workspace-1.1.0.agent");
  await fs.cp(baseBundle, nextBundle, { recursive: true });

  const manifestPath = path.join(nextBundle, "MANIFEST.json");
  const manifest = await readJson(manifestPath);
  manifest.version = "1.1.0";
  await writeJson(manifestPath, manifest);

  assert.equal(runCli(["publish", baseBundle, "--registry", registry]).status, 0);
  assert.equal(runCli(["publish", nextBundle, "--registry", registry]).status, 0);

  return { registry, targetWorkspace: path.join(temp, "installed-workspace") };
}

test("list/verify/update/rollback commands work for local registry workflows", async () => {
  const temp = await createTempDir("agenthub-lifecycle-");
  const { registry, targetWorkspace } = await buildTwoVersions(temp);

  assert.equal(
    runCli(["install", "workspace:1.0.0", "--registry", registry, "--target-workspace", targetWorkspace]).status,
    0,
  );

  const listResult = runCli(["list", "--target-workspace", targetWorkspace]);
  assert.equal(listResult.status, 0);
  assert.match(listResult.stdout, /workspace@1\.0\.0/);

  const verifyResult = runCli(["verify", "workspace", "--registry", registry, "--target-workspace", targetWorkspace]);
  assert.equal(verifyResult.status, 0);
  assert.match(verifyResult.stdout, /Verify passed/);
  assert.match(verifyResult.stdout, /PASS workspace_file:AGENTS\.md/);

  const versionsResult = runCli(["versions", "workspace", "--registry", registry]);
  assert.equal(versionsResult.status, 0);
  assert.match(versionsResult.stdout, /1\.1\.0/);

  const updateResult = runCli([
    "update",
    "workspace",
    "--registry",
    registry,
    "--target-workspace",
    targetWorkspace,
  ]);
  assert.equal(updateResult.status, 0);
  assert.match(updateResult.stdout, /已更新|已是最新版本/);

  const rollbackResult = runCli([
    "rollback",
    "workspace",
    "--to",
    "1.0.0",
    "--registry",
    registry,
    "--target-workspace",
    targetWorkspace,
  ]);
  assert.equal(rollbackResult.status, 0);
  assert.match(rollbackResult.stdout, /已回滚/);

  const statsResult = runCli(["stats", "workspace", "--registry", registry]);
  assert.equal(statsResult.status, 0);
  assert.match(statsResult.stdout, /workspace/);
});

test("verify fails clearly when install record is missing", async () => {
  const temp = await createTempDir("agenthub-verify-missing-");
  const targetWorkspace = path.join(temp, "workspace");
  await setupWorkspace(targetWorkspace);

  const result = runCli(["verify", "workspace", "--target-workspace", targetWorkspace]);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Verify failed/);
  assert.match(result.stdout, /install record missing/);
});


test("command help exposes lifecycle entries", async () => {
  assert.match(runCli(["list", "--help"]).stdout, /agenthub list/);
  assert.match(runCli(["verify", "--help"]).stdout, /agenthub verify/);
  assert.match(runCli(["update", "--help"]).stdout, /agenthub update/);
  assert.match(runCli(["rollback", "--help"]).stdout, /agenthub rollback/);
  assert.match(runCli(["stats", "--help"]).stdout, /agenthub stats/);
});
