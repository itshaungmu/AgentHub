import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { createTempDir, readJson, runCli, setupWorkspace, writeJson, pathExists } from "./helpers.js";

test("publish stores bundle and search/info can discover it", async () => {
  const temp = await createTempDir("agenthub-publish-");
  const workspace = path.join(temp, "workspace");
  const output = path.join(temp, "output");
  const registry = path.join(temp, "registry");
  const configPath = path.join(temp, "openclaw.json");
  await setupWorkspace(workspace);
  await writeJson(configPath, {
    agents: { defaults: { model: { primary: "anthropic/claude-3-5-sonnet" } } },
  });

  const packResult = runCli(["pack", "--workspace", workspace, "--config", configPath, "--output", output]);
  assert.equal(packResult.status, 0);
  const bundleDir = path.join(output, "workspace-1.0.0.agent");

  const publishResult = runCli(["publish", bundleDir, "--registry", registry]);
  assert.equal(publishResult.status, 0);
  assert.equal(await pathExists(path.join(registry, "agents", "workspace", "1.0.0", "MANIFEST.json")), true);
  const index = await readJson(path.join(registry, "index.json"));
  assert.equal(index.agents.length, 1);

  const searchResult = runCli(["search", "workspace", "--registry", registry]);
  assert.equal(searchResult.status, 0);
  assert.match(searchResult.stdout, /workspace/i);

  const infoResult = runCli(["info", "workspace", "--registry", registry]);
  assert.equal(infoResult.status, 0);
  assert.match(infoResult.stdout, /OpenClaw/i);
});
