import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { createTempDir, runCli, setupWorkspace, writeJson } from "./helpers.js";

async function setupPublishedRegistry() {
  const temp = await createTempDir("agenthub-server-html-");
  const workspace = path.join(temp, "workspace");
  const output = path.join(temp, "output");
  const registry = path.join(temp, "registry");
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
  return { registry };
}

test("server renders browse list and detail html pages", async () => {
  const { createServer } = await import("../src/server.js");
  const { registry } = await setupPublishedRegistry();
  const server = await createServer({ registryDir: registry, port: 0 });

  try {
    const listResponse = await fetch(`${server.baseUrl}/?q=workspace`);
    assert.equal(listResponse.status, 200);
    const listHtml = await listResponse.text();
    assert.match(listHtml, /AgentHub/i);
    assert.match(listHtml, /workspace/);
    assert.match(listHtml, /v1\.0\.0/);

    const detailResponse = await fetch(`${server.baseUrl}/agents/workspace`);
    assert.equal(detailResponse.status, 200);
    const detailHtml = await detailResponse.text();
    assert.match(detailHtml, /OpenClaw/i);
    assert.match(detailHtml, /agenthub install workspace/i);
  } finally {
    await server.close();
  }
});
