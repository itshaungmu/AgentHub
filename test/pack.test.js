import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { createTempDir, readJson, runCli, setupWorkspace, writeJson, pathExists } from "./helpers.js";

test("pack creates a bundle with workspace snapshot, manifest, and config template", async () => {
  const temp = await createTempDir("agenthub-pack-");
  const workspace = path.join(temp, "workspace");
  const output = path.join(temp, "output");
  const configPath = path.join(temp, "openclaw.json");
  await setupWorkspace(workspace);
  await writeJson(configPath, {
    agents: {
      defaults: {
        model: { primary: "anthropic/claude-3-5-sonnet" },
        compaction: { enabled: true },
        memorySearch: { enabled: true },
      },
    },
    channels: { telegram: { botToken: "secret" } },
  });

  const result = runCli(["pack", "--workspace", workspace, "--config", configPath, "--output", output]);
  assert.equal(result.status, 0);
  const bundleDir = path.join(output, "workspace-1.0.0.agent");
  assert.equal(await pathExists(path.join(bundleDir, "MANIFEST.json")), true);
  assert.equal(await pathExists(path.join(bundleDir, "WORKSPACE", "SOUL.md")), true);
  assert.equal(await pathExists(path.join(bundleDir, "OPENCLAW.template.json")), true);
  const manifest = await readJson(path.join(bundleDir, "MANIFEST.json"));
  assert.equal(manifest.runtime.type, "openclaw");
  assert.equal(manifest.includes.memory.public, 1);
  assert.equal(manifest.includes.memory.portable, 1);
});
