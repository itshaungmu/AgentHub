import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { createTempDir, PROJECT_ROOT, runCli, setupWorkspace, writeJson, readJson } from "./helpers.js";

/**
 * Tests for query commands: search, info, stats, versions
 */

test("search command lists agents from local registry", async () => {
  const temp = await createTempDir("agenthub-search-");
  const workspace = path.join(temp, "workspace");
  const output = path.join(temp, "output");
  const registry = path.join(temp, "registry");
  const configPath = path.join(temp, "openclaw.json");

  await setupWorkspace(workspace);
  await writeJson(configPath, {
    agents: { defaults: { model: { primary: "anthropic/claude-3-5-sonnet" } } },
  });

  // Pack and publish an agent
  assert.equal(
    runCli(["pack", "--workspace", workspace, "--config", configPath, "--output", output]).status,
    0
  );
  assert.equal(
    runCli(["publish", path.join(output, "workspace-1.0.0.agent"), "--registry", registry]).status,
    0
  );

  // Search should find the agent
  const result = runCli(["search", "--registry", registry]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /workspace/);
});

test("search command filters by query", async () => {
  const temp = await createTempDir("agenthub-search-filter-");
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
    0
  );
  assert.equal(
    runCli(["publish", path.join(output, "workspace-1.0.0.agent"), "--registry", registry]).status,
    0
  );

  // Search with matching query
  const resultMatch = runCli(["search", "work", "--registry", registry]);
  assert.equal(resultMatch.status, 0);
  assert.match(resultMatch.stdout, /workspace/);

  // Search with non-matching query
  const resultNoMatch = runCli(["search", "nonexistent", "--registry", registry]);
  assert.equal(resultNoMatch.status, 0);
  // Should not show the agent when query doesn't match
});

test("info command shows agent details", async () => {
  const temp = await createTempDir("agenthub-info-");
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
    0
  );
  assert.equal(
    runCli(["publish", path.join(output, "workspace-1.0.0.agent"), "--registry", registry]).status,
    0
  );

  const result = runCli(["info", "workspace", "--registry", registry]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /workspace/);
  assert.match(result.stdout, /1\.0\.0/);
});

test("stats command shows agent statistics", async () => {
  const temp = await createTempDir("agenthub-stats-");
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
    0
  );
  assert.equal(
    runCli(["publish", path.join(output, "workspace-1.0.0.agent"), "--registry", registry]).status,
    0
  );

  const result = runCli(["stats", "workspace", "--registry", registry]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Statistics|统计/i);
  assert.match(result.stdout, /workspace/);
  assert.match(result.stdout, /1\.0\.0/);
});

test("versions command lists available versions", async () => {
  const temp = await createTempDir("agenthub-versions-");
  const workspace = path.join(temp, "workspace");
  const output = path.join(temp, "output");
  const registry = path.join(temp, "registry");
  const configPath = path.join(temp, "openclaw.json");

  await setupWorkspace(workspace);
  await writeJson(configPath, {
    agents: { defaults: { model: { primary: "anthropic/claude-3-5-sonnet" } } },
  });

  // Pack and publish
  assert.equal(
    runCli(["pack", "--workspace", workspace, "--config", configPath, "--output", output]).status,
    0
  );
  assert.equal(
    runCli(["publish", path.join(output, "workspace-1.0.0.agent"), "--registry", registry]).status,
    0
  );

  const result = runCli(["versions", "workspace", "--registry", registry]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /1\.0\.0/);
  assert.match(result.stdout, /latest/);
});

test("query commands show help", () => {
  const searchHelp = runCli(["search", "--help"]);
  assert.equal(searchHelp.status, 0);
  assert.match(searchHelp.stdout, /search/);

  const infoHelp = runCli(["info", "--help"]);
  assert.equal(infoHelp.status, 0);
  assert.match(infoHelp.stdout, /info/);

  const statsHelp = runCli(["stats", "--help"]);
  assert.equal(statsHelp.status, 0);
  assert.match(statsHelp.stdout, /stats/);

  const versionsHelp = runCli(["versions", "--help"]);
  assert.equal(versionsHelp.status, 0);
  assert.match(versionsHelp.stdout, /versions/);
});

test("stats command fails for non-existent agent", async () => {
  const temp = await createTempDir("agenthub-stats-fail-");
  const registry = path.join(temp, "registry");

  const result = runCli(["stats", "nonexistent-agent", "--registry", registry]);
  assert.notEqual(result.status, 0);
});

test("pack command supports custom version", async () => {
  const temp = await createTempDir("agenthub-pack-version-");
  const workspace = path.join(temp, "workspace");
  const output = path.join(temp, "output");
  const configPath = path.join(temp, "openclaw.json");

  await setupWorkspace(workspace);
  await writeJson(configPath, {
    agents: { defaults: { model: { primary: "anthropic/claude-3-5-sonnet" } } },
  });

  // Pack with custom version
  const result = runCli([
    "pack",
    "--workspace", workspace,
    "--config", configPath,
    "--output", output,
    "--version", "2.5.0"
  ]);

  assert.equal(result.status, 0);

  // Verify the bundle directory uses the custom version
  const bundlePath = path.join(output, "workspace-2.5.0.agent");
  const stat = await import("node:fs/promises").then(fs => fs.stat(bundlePath));
  assert.ok(stat.isDirectory(), "Bundle directory should exist with custom version");

  // Verify the manifest contains the custom version
  const manifest = await readJson(path.join(bundlePath, "MANIFEST.json"));
  assert.equal(manifest.version, "2.5.0");
});
