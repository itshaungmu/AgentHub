import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { createTempDir, readJson, runCli, setupWorkspace, writeJson, pathExists } from "./helpers.js";
import { redactContent, scanPrivacyRisks, getPackFilterOptions, generatePrivacyReport } from "../src/lib/privacy-engine.js";

// === redactContent 测试 ===

test("redactContent redacts OpenAI API keys", () => {
  const input = "my key is sk-abc12345678901234567890";
  const { content, redactions } = redactContent(input);
  assert.ok(!content.includes("sk-abc"), "API key should be redacted");
  assert.ok(content.includes("sk-***REDACTED***"));
  assert.equal(redactions.length, 1);
  assert.equal(redactions[0].type, "OpenAI API Key");
});

test("redactContent redacts GitHub tokens", () => {
  const input = "token: ghp_abcdefghijklmnopqrstuvwxyz1234567890";
  const { content, redactions } = redactContent(input);
  assert.ok(!content.includes("ghp_abc"));
  assert.equal(redactions[0].type, "GitHub Token");
});

test("redactContent redacts passwords", () => {
  const input = `password = "my_secret_pass123"`;
  const { content, redactions } = redactContent(input);
  assert.ok(!content.includes("my_secret_pass123"));
  assert.equal(redactions.length, 1);
});

test("redactContent redacts JWT tokens", () => {
  const input = "bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abc123def456";
  const { content, redactions } = redactContent(input);
  assert.ok(!content.includes("eyJhbGci"));
  assert.ok(redactions.some(r => r.type === "JWT Token"));
});

test("redactContent handles clean content without changes", () => {
  const input = "This is a normal markdown document with no secrets.";
  const { content, redactions } = redactContent(input);
  assert.equal(content, input);
  assert.equal(redactions.length, 0);
});

test("redactContent handles multiple patterns in same content", () => {
  const input = `api_key = "secret123"\ntoken: ghp_abcdefghijklmnopqrstuvwxyz1234567890`;
  const { content, redactions } = redactContent(input);
  assert.ok(redactions.length >= 2, "Should find multiple redactions");
});

// === scanPrivacyRisks 测试 ===

test("scanPrivacyRisks detects private memory directory", async () => {
  const temp = await createTempDir("privacy-scan-");
  await mkdir(path.join(temp, "memory", "private"), { recursive: true });
  await writeFile(path.join(temp, "memory", "private", "secret.md"), "my private data", "utf8");

  const result = await scanPrivacyRisks(temp);
  assert.equal(result.hasPrivateMemory, true);
  assert.equal(result.privateMemoryCount, 1);
});

test("scanPrivacyRisks detects sensitive content in files", async () => {
  const temp = await createTempDir("privacy-scan-");
  await writeFile(path.join(temp, "config.json"), JSON.stringify({ api_key: "sk-abcdefghijklmnopqrstuvwxyz12345" }), "utf8");

  const result = await scanPrivacyRisks(temp);
  assert.ok(result.sensitiveFindings.length > 0, "Should find sensitive content");
  assert.ok(result.riskyFiles.length > 0);
});

test("scanPrivacyRisks reports clean workspace", async () => {
  const temp = await createTempDir("privacy-scan-");
  await writeFile(path.join(temp, "README.md"), "# Hello World\n\nNothing sensitive here.", "utf8");

  const result = await scanPrivacyRisks(temp);
  assert.equal(result.hasPrivateMemory, false);
  assert.equal(result.sensitiveFindings.length, 0);
});

// === getPackFilterOptions 测试 ===

test("getPackFilterOptions includes private memory in excludeDirs", () => {
  const manifest = {
    sharingPolicy: {
      blockedMemoryLayers: ["private"],
    },
  };
  const opts = getPackFilterOptions(manifest);
  assert.ok(opts.excludeDirs.includes("memory/private"));
  assert.ok(opts.excludeDirs.includes(".git"));
  assert.ok(opts.excludeDirs.includes("node_modules"));
});

test("getPackFilterOptions includes default exclude files", () => {
  const opts = getPackFilterOptions({});
  assert.ok(opts.excludeFiles.includes(".env"));
  assert.ok(opts.excludeFiles.includes(".npmrc"));
});

// === generatePrivacyReport 测试 ===

test("generatePrivacyReport produces severity clean for safe workspace", () => {
  const scanResult = {
    hasPrivateMemory: false,
    privateMemoryCount: 0,
    sensitiveFindings: [],
    riskyFiles: [],
    totalFilesScanned: 10,
  };
  const copyReport = { copied: ["a.md", "b.md"], skipped: [] };
  const report = generatePrivacyReport(scanResult, copyReport);
  assert.equal(report.severity, "clean");
  assert.equal(report.summary.filesCopied, 2);
  assert.equal(report.compliance.policyEnforced, true);
});

test("generatePrivacyReport produces severity high for private memory", () => {
  const scanResult = {
    hasPrivateMemory: true,
    privateMemoryCount: 3,
    sensitiveFindings: [],
    riskyFiles: [],
    totalFilesScanned: 10,
  };
  const report = generatePrivacyReport(scanResult, { copied: [], skipped: ["memory/private"] });
  assert.equal(report.severity, "high");
});

// === pack 集成测试 ===

test("pack with privacy strips private memory and generates report", async () => {
  const temp = await createTempDir("agenthub-privacy-pack-");
  const workspace = path.join(temp, "workspace");
  const output = path.join(temp, "output");
  const configPath = path.join(temp, "openclaw.json");

  await setupWorkspace(workspace);
  // 添加私有记忆
  await mkdir(path.join(workspace, "memory", "private"), { recursive: true });
  await writeFile(path.join(workspace, "memory", "private", "secret.md"), "private data", "utf8");
  await writeJson(configPath, {
    agents: { defaults: { model: { primary: "anthropic/claude-3-5-sonnet" } } },
  });

  const result = runCli(["pack", "--workspace", workspace, "--config", configPath, "--output", output]);
  assert.equal(result.status, 0, `CLI should succeed, stderr: ${result.stderr}`);

  const bundleDir = path.join(output, "workspace-1.0.0.agent");
  // 私有记忆不应存在于 Bundle 中
  assert.equal(await pathExists(path.join(bundleDir, "WORKSPACE", "memory", "private")), false,
    "private memory should be stripped from bundle");

  // 公开记忆应保留
  assert.equal(await pathExists(path.join(bundleDir, "WORKSPACE", "memory", "public", "style.md")), true);

  // 隐私报告应存在
  assert.equal(await pathExists(path.join(bundleDir, "PRIVACY_REPORT.json")), true);
  const privacyReport = await readJson(path.join(bundleDir, "PRIVACY_REPORT.json"));
  assert.ok(privacyReport.version);
  assert.ok(privacyReport.summary);

  // Manifest 中 private memory count 应为 0
  const manifest = await readJson(path.join(bundleDir, "MANIFEST.json"));
  assert.equal(manifest.includes.memory.private, 0, "private memory count should be 0 in manifest");
});

test("pack --strict fails when sensitive info detected", async () => {
  const temp = await createTempDir("agenthub-strict-pack-");
  const workspace = path.join(temp, "workspace");
  const output = path.join(temp, "output");
  const configPath = path.join(temp, "openclaw.json");

  await setupWorkspace(workspace);
  // 写入含 API Key 的文件
  await writeFile(path.join(workspace, "TOOLS.md"), "Use this key: sk-abcdefghijklmnopqrstuvwxyz12345", "utf8");
  await writeJson(configPath, {
    agents: { defaults: { model: { primary: "test" } } },
  });

  const result = runCli(["pack", "--workspace", workspace, "--config", configPath, "--output", output, "--strict"]);
  assert.equal(result.status, 1, "strict mode should fail with sensitive content");
});

test("pack --skip-scan skips security scan", async () => {
  const temp = await createTempDir("agenthub-skip-pack-");
  const workspace = path.join(temp, "workspace");
  const output = path.join(temp, "output");
  const configPath = path.join(temp, "openclaw.json");

  await setupWorkspace(workspace);
  await writeJson(configPath, {
    agents: { defaults: { model: { primary: "test" } } },
  });

  const result = runCli(["pack", "--workspace", workspace, "--config", configPath, "--output", output, "--skip-scan"]);
  assert.equal(result.status, 0);

  const bundleDir = path.join(output, "workspace-1.0.0.agent");
  // 跳过扫描时不应生成隐私报告
  assert.equal(await pathExists(path.join(bundleDir, "PRIVACY_REPORT.json")), false);
});
