import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { createTempDir, readJson, runCli, setupWorkspace, writeJson } from "./helpers.js";

test("server publishes an uploaded bundle payload", async () => {
  const { createServer } = await import("../src/server.js");
  const { serializeBundleDir } = await import("../src/lib/bundle-transfer.js");

  const temp = await createTempDir("agenthub-server-upload-");
  const workspace = path.join(temp, "workspace");
  const output = path.join(temp, "output");
  const registry = path.join(temp, "registry");
  const configPath = path.join(temp, "openclaw.json");
  await setupWorkspace(workspace);
  await writeJson(configPath, {
    agents: { defaults: { model: { primary: "anthropic/claude-3-5-sonnet" } } },
  });
  assert.equal(runCli(["pack", "--workspace", workspace, "--config", configPath, "--output", output]).status, 0);
  const bundleDir = path.join(output, "workspace-1.0.0.agent");

  const server = await createServer({ registryDir: registry, port: 0 });
  try {
    const payload = await serializeBundleDir(bundleDir);
    const response = await fetch(`${server.baseUrl}/api/publish-upload`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    assert.equal(response.status, 200);
    const json = await response.json();
    assert.equal(json.slug, "workspace");

    const index = await readJson(path.join(registry, "index.json"));
    assert.equal(index.agents.length, 1);
    assert.equal(index.agents[0].slug, "workspace");
  } finally {
    await server.close();
  }
});
