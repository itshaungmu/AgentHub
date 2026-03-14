import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { createTempDir, pathExists, readJson, runCli, setupWorkspace, writeJson } from "./helpers.js";

async function setupBundleFixture() {
  const temp = await createTempDir("agenthub-server-mutations-");
  const workspace = path.join(temp, "workspace");
  const output = path.join(temp, "output");
  const registry = path.join(temp, "registry");
  const target = path.join(temp, "installed-workspace");
  const configPath = path.join(temp, "openclaw.json");
  await setupWorkspace(workspace);
  await writeJson(configPath, {
    agents: {
      defaults: {
        model: { primary: "anthropic/claude-3-5-sonnet" },
        memorySearch: { enabled: true },
      },
    },
  });
  assert.equal(runCli(["pack", "--workspace", workspace, "--config", configPath, "--output", output]).status, 0);
  return { registry, bundleDir: path.join(output, "workspace-1.0.0.agent"), target };
}

test("server can publish a bundle and install it via HTTP APIs", async () => {
  const { createServer } = await import("../src/server.js");
  const { registry, bundleDir, target } = await setupBundleFixture();
  const server = await createServer({ registryDir: registry, port: 0 });

  try {
    const publishResponse = await fetch(`${server.baseUrl}/api/publish`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ bundleDir }),
    });
    assert.equal(publishResponse.status, 200);
    const publishJson = await publishResponse.json();
    assert.equal(publishJson.slug, "workspace");

    const index = await readJson(path.join(registry, "index.json"));
    assert.equal(index.agents.length, 1);

    const installResponse = await fetch(`${server.baseUrl}/api/install`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ agent: "workspace", targetWorkspace: target }),
    });
    assert.equal(installResponse.status, 200);
    const installJson = await installResponse.json();
    assert.equal(installJson.manifest.slug, "workspace");
    assert.equal(await pathExists(path.join(target, "SOUL.md")), true);
    assert.equal(await pathExists(path.join(target, ".agenthub", "OPENCLAW.applied.json")), true);
  } finally {
    await server.close();
  }
});
