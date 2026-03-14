import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { createTempDir, readJson, runCli, setupWorkspace, writeJson, pathExists } from "./helpers.js";

test("install restores workspace files and writes templated config to target", async () => {
  const temp = await createTempDir("agenthub-install-");
  const workspace = path.join(temp, "workspace");
  const output = path.join(temp, "output");
  const registry = path.join(temp, "registry");
  const target = path.join(temp, "installed-workspace");
  const configPath = path.join(temp, "openclaw.json");
  await setupWorkspace(workspace);
  await writeJson(configPath, {
    agents: { defaults: { model: { primary: "anthropic/claude-3-5-sonnet" } } },
  });

  assert.equal(runCli(["pack", "--workspace", workspace, "--config", configPath, "--output", output]).status, 0);
  assert.equal(
    runCli(["publish", path.join(output, "workspace-1.0.0.agent"), "--registry", registry]).status,
    0,
  );

  const installResult = runCli([
    "install",
    "workspace",
    "--registry",
    registry,
    "--target-workspace",
    target,
  ]);
  assert.equal(installResult.status, 0);
  assert.equal(await pathExists(path.join(target, "SOUL.md")), true);
  assert.equal(await pathExists(path.join(target, ".agenthub", "OPENCLAW.applied.json")), true);
  const applied = await readJson(path.join(target, ".agenthub", "OPENCLAW.applied.json"));
  assert.equal(applied.agents.defaults.model.primary, "anthropic/claude-3-5-sonnet");
});
