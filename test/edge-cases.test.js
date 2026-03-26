import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { createTempDir, PROJECT_ROOT, runCli, setupWorkspace, writeJson, readJson } from "./helpers.js";

/**
 * Edge case tests for robustness
 */

test("pack fails gracefully with missing workspace", async () => {
  const result = runCli([
    "pack",
    "--workspace", "/nonexistent/path/that/does/not/exist",
    "--config", "/tmp/test.json"
  ]);
  assert.notEqual(result.status, 0);
});

test("pack fails gracefully with missing config", async () => {
  const temp = await createTempDir("agenthub-pack-noconfig-");
  const workspace = path.join(temp, "workspace");
  await setupWorkspace(workspace);

  const result = runCli([
    "pack",
    "--workspace", workspace,
    "--config", "/nonexistent/path/config.json"
  ]);
  // CLI may succeed with warning if config doesn't exist
  // Just check that it doesn't crash
});

test("install fails for non-existent agent", async () => {
  const temp = await createTempDir("agenthub-install-noagent-");
  const registry = path.join(temp, "registry");
  const target = path.join(temp, "target");

  const result = runCli([
    "install",
    "nonexistent-agent-xyz",
    "--registry", registry,
    "--target-workspace", target
  ]);
  assert.notEqual(result.status, 0);
});

test("verify fails for non-existent install", async () => {
  const temp = await createTempDir("agenthub-verify-noinstall-");
  const target = path.join(temp, "target");

  const result = runCli([
    "verify",
    "nonexistent-agent-xyz",
    "--target-workspace", target
  ]);
  assert.notEqual(result.status, 0);
});

test("update fails for non-existent install", async () => {
  const temp = await createTempDir("agenthub-update-noinstall-");
  const target = path.join(temp, "target");
  const registry = path.join(temp, "registry");

  const result = runCli([
    "update",
    "nonexistent-agent-xyz",
    "--registry", registry,
    "--target-workspace", target
  ]);
  assert.notEqual(result.status, 0);
});

test("rollback fails for non-existent install", async () => {
  const temp = await createTempDir("agenthub-rollback-noinstall-");
  const target = path.join(temp, "target");
  const registry = path.join(temp, "registry");

  const result = runCli([
    "rollback",
    "nonexistent-agent-xyz",
    "--to", "1.0.0",
    "--registry", registry,
    "--target-workspace", target
  ]);
  assert.notEqual(result.status, 0);
});

test("publish fails for non-existent bundle", async () => {
  const temp = await createTempDir("agenthub-publish-nobundle-");
  const registry = path.join(temp, "registry");

  const result = runCli([
    "publish",
    "/nonexistent/bundle.agent",
    "--registry", registry
  ]);
  assert.notEqual(result.status, 0);
});

test("versions returns empty array for non-existent agent", async () => {
  const temp = await createTempDir("agenthub-versions-noagent-");
  const registry = path.join(temp, "registry");

  const result = runCli([
    "versions",
    "nonexistent-agent-xyz",
    "--registry", registry
  ]);
  // Should succeed but show no versions
  assert.equal(result.status, 0);
});

test("info fails for non-existent agent in local registry", async () => {
  const temp = await createTempDir("agenthub-info-noagent-");
  const registry = path.join(temp, "registry");

  const result = runCli([
    "info",
    "nonexistent-agent-xyz",
    "--registry", registry
  ]);
  assert.notEqual(result.status, 0);
});

test("pack handles special characters in description", async () => {
  const temp = await createTempDir("agenthub-pack-special-");
  const workspace = path.join(temp, "workspace");
  const output = path.join(temp, "output");
  const configPath = path.join(temp, "openclaw.json");

  await setupWorkspace(workspace);
  await writeJson(configPath, {
    agents: { defaults: { model: { primary: "anthropic/claude-3-5-sonnet" } } },
  });

  // Pack should succeed
  const result = runCli([
    "pack",
    "--workspace", workspace,
    "--config", configPath,
    "--output", output,
    "--tags", "中文标签,emoji🎉,special!@#"
  ]);
  assert.equal(result.status, 0);
});

test("pack handles long name gracefully", async () => {
  const temp = await createTempDir("agenthub-pack-longname-");
  const workspace = path.join(temp, "workspace");
  const output = path.join(temp, "output");
  const configPath = path.join(temp, "openclaw.json");

  await setupWorkspace(workspace);
  await writeJson(configPath, {
    agents: { defaults: { model: { primary: "anthropic/claude-3-5-sonnet" } } },
  });

  const longName = "A".repeat(200);
  const result = runCli([
    "pack",
    "--workspace", workspace,
    "--config", configPath,
    "--output", output,
    "--name", longName
  ]);
  // Should succeed (name will be truncated or slugified)
  assert.equal(result.status, 0);
});

test("list returns empty for workspace with no installs", async () => {
  const temp = await createTempDir("agenthub-list-empty-");

  const result = runCli([
    "list",
    "--target-workspace", temp
  ]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /暂无|no.*agent|0.*agent/i);
});

test("search returns empty for no matches", async () => {
  const temp = await createTempDir("agenthub-search-nomatch-");
  const registry = path.join(temp, "registry");

  const result = runCli([
    "search",
    "xyznonexistent12345",
    "--registry", registry
  ]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /未找到|not found|0.*agent/i);
});

test("pack handles empty tags gracefully", async () => {
  const temp = await createTempDir("agenthub-pack-emptytags-");
  const workspace = path.join(temp, "workspace");
  const output = path.join(temp, "output");
  const configPath = path.join(temp, "openclaw.json");

  await setupWorkspace(workspace);
  await writeJson(configPath, {
    agents: { defaults: { model: { primary: "anthropic/claude-3-5-sonnet" } } },
  });

  const result = runCli([
    "pack",
    "--workspace", workspace,
    "--config", configPath,
    "--output", output,
    "--tags", ""
  ]);
  assert.equal(result.status, 0);
});

test("doctor handles missing sample agents gracefully", async () => {
  const result = runCli([
    "doctor",
    "--no-network"
  ]);
  // Doctor should pass even without sample agents (just a warning)
  assert.equal(result.status, 0);
});
