import test from "node:test";
import assert from "node:assert/strict";
import { runCli, PROJECT_ROOT } from "./helpers.js";

test("doctor command runs and checks environment", async () => {
  const result = runCli(["doctor", "--no-network"]);
  assert.equal(result.status, 0, "doctor should exit with 0 on healthy system");
  assert.match(result.stdout, /诊断检查|Diagnostic/);
  assert.match(result.stdout, /Node\.js/);
  assert.match(result.stdout, /通过|PASS|✅/);
});

test("doctor command shows help", async () => {
  const result = runCli(["doctor", "--help"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /agenthub doctor/);
  assert.match(result.stdout, /--no-network/);
});

test("doctor command with full flag", async () => {
  const result = runCli(["doctor", "--full", "--no-network"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /测试套件|Test Suite/i);
});
