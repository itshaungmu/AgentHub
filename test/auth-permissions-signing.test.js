import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { createTempDir, readJson, setupWorkspace, writeJson, pathExists } from "./helpers.js";
import {
  hashPassword, verifyPassword, generateApiToken, hashToken,
  isValidTokenFormat, extractToken, hasScope, SCOPES, DEFAULT_SCOPES,
} from "../src/lib/auth.js";
import { checkAccess, filterVisibleAgents, VISIBILITY, ACTIONS } from "../src/lib/permissions.js";
import { signBundle, verifyBundleSignature, isSigned } from "../src/lib/signing.js";
import { packCommand } from "../src/commands/pack.js";
import { ensureDir } from "../src/lib/fs-utils.js";

// === Auth 模块测试 ===

test("hashPassword and verifyPassword round-trip", () => {
  const password = "my-secure-password-123";
  const hashed = hashPassword(password);
  assert.ok(hashed.includes(":"), "hash should contain salt separator");
  assert.ok(verifyPassword(password, hashed), "correct password should verify");
  assert.ok(!verifyPassword("wrong-password", hashed), "wrong password should fail");
});

test("hashPassword generates unique salts", () => {
  const h1 = hashPassword("same-pass");
  const h2 = hashPassword("same-pass");
  assert.notEqual(h1, h2, "different salts should produce different hashes");
  // 但两者都应该验证通过
  assert.ok(verifyPassword("same-pass", h1));
  assert.ok(verifyPassword("same-pass", h2));
});

test("generateApiToken produces valid format", () => {
  const { token, tokenHash } = generateApiToken();
  assert.ok(token.startsWith("ah_"), "token should have ah_ prefix");
  assert.ok(isValidTokenFormat(token), "token should pass format check");
  assert.ok(tokenHash.length === 64, "hash should be 64 char hex");
});

test("hashToken is deterministic", () => {
  const token = "ah_test123456";
  const h1 = hashToken(token, "secret");
  const h2 = hashToken(token, "secret");
  assert.equal(h1, h2, "same token+secret should produce same hash");

  const h3 = hashToken(token, "other-secret");
  assert.notEqual(h1, h3, "different secrets should produce different hashes");
});

test("isValidTokenFormat validates correctly", () => {
  assert.ok(!isValidTokenFormat("not-a-token"));
  assert.ok(!isValidTokenFormat("ah_short"));
  assert.ok(!isValidTokenFormat(null));
  assert.ok(!isValidTokenFormat(123));
});

test("extractToken from Authorization header", () => {
  assert.equal(extractToken({ headers: { authorization: "Bearer ah_mytoken" } }), "ah_mytoken");
  assert.equal(extractToken({ headers: { authorization: "bearer ah_mytoken" } }), "ah_mytoken");
  assert.equal(extractToken({ headers: {} }), null);
  assert.equal(extractToken({ headers: { "x-api-token": "ah_alt" } }), "ah_alt");
});

test("hasScope checks scope hierarchy", () => {
  assert.ok(hasScope("admin", SCOPES.READ_AGENT), "admin should have read");
  assert.ok(hasScope("admin", SCOPES.PUBLISH), "admin should have publish");
  assert.ok(hasScope("publish", SCOPES.READ_AGENT), "publish should have read");
  assert.ok(!hasScope("read:agent", SCOPES.PUBLISH), "read should not have publish");
  assert.ok(hasScope("read:agent,publish", SCOPES.PUBLISH), "comma-separated scopes");
});

// === Permissions 模块测试 ===

test("checkAccess allows public agent view for anonymous", () => {
  const agent = { permissions: { visibility: "public", owner: "alice" } };
  const result = checkAccess(agent, null, ACTIONS.VIEW);
  assert.ok(result.allowed);
});

test("checkAccess denies public agent publish for non-owner", () => {
  const agent = { permissions: { visibility: "public", owner: "alice" } };
  const result = checkAccess(agent, { username: "bob" }, ACTIONS.PUBLISH);
  assert.ok(!result.allowed);
});

test("checkAccess allows public agent publish for owner", () => {
  const agent = { permissions: { visibility: "public", owner: "alice" } };
  const result = checkAccess(agent, { username: "alice" }, ACTIONS.PUBLISH);
  assert.ok(result.allowed);
});

test("checkAccess denies private agent for anonymous", () => {
  const agent = { permissions: { visibility: "private", owner: "alice" } };
  const result = checkAccess(agent, null, ACTIONS.VIEW);
  assert.ok(!result.allowed);
  assert.ok(result.reason.includes("Authentication"));
});

test("checkAccess allows private agent for owner", () => {
  const agent = { permissions: { visibility: "private", owner: "alice" } };
  assert.ok(checkAccess(agent, { username: "alice" }, ACTIONS.VIEW).allowed);
});

test("checkAccess team visibility for allowed users", () => {
  const agent = { permissions: { visibility: "team", owner: "alice", allowedUsers: ["bob"] } };
  assert.ok(checkAccess(agent, { username: "bob" }, ACTIONS.VIEW).allowed);
  assert.ok(!checkAccess(agent, { username: "charlie" }, ACTIONS.VIEW).allowed);
  assert.ok(checkAccess(agent, { username: "alice" }, ACTIONS.VIEW).allowed);
});

test("checkAccess admin always allowed", () => {
  const agent = { permissions: { visibility: "private", owner: "alice" } };
  assert.ok(checkAccess(agent, { username: "admin", role: "admin" }, ACTIONS.DELETE).allowed);
});

test("filterVisibleAgents filters correctly", () => {
  const agents = [
    { slug: "pub", permissions: { visibility: "public", owner: "a" } },
    { slug: "priv", permissions: { visibility: "private", owner: "a" } },
    { slug: "team", permissions: { visibility: "team", owner: "a", allowedUsers: ["b"] } },
  ];
  const anonymous = filterVisibleAgents(agents, null);
  assert.equal(anonymous.length, 1);
  assert.equal(anonymous[0].slug, "pub");

  const userB = filterVisibleAgents(agents, { username: "b" });
  assert.equal(userB.length, 2); // pub + team
});

// === Signing 模块测试 ===

test("signBundle creates SIGNATURE.json", async () => {
  const temp = await createTempDir("signing-");
  const bundleDir = path.join(temp, "test.agent");
  await ensureDir(bundleDir);
  await writeFile(path.join(bundleDir, "MANIFEST.json"), JSON.stringify({ slug: "test" }));
  await writeFile(path.join(bundleDir, "README.md"), "# Test");

  const sig = await signBundle(bundleDir, { signer: "tester" });
  assert.equal(sig.algorithm, "sha256");
  assert.equal(sig.signer, "tester");
  assert.ok(sig.checksums["MANIFEST.json"]);
  assert.ok(sig.checksums["README.md"]);
  assert.equal(sig.fileCount, 2);

  assert.ok(await isSigned(bundleDir));
});

test("verifyBundleSignature passes for unmodified bundle", async () => {
  const temp = await createTempDir("verify-sig-");
  const bundleDir = path.join(temp, "test.agent");
  await ensureDir(bundleDir);
  await writeFile(path.join(bundleDir, "MANIFEST.json"), JSON.stringify({ slug: "test" }));
  await writeFile(path.join(bundleDir, "README.md"), "# Test");

  await signBundle(bundleDir, { signer: "tester" });
  const result = await verifyBundleSignature(bundleDir);
  assert.ok(result.valid, "unmodified bundle should verify");
  assert.equal(result.signer, "tester");
});

test("verifyBundleSignature detects file modification", async () => {
  const temp = await createTempDir("tamper-sig-");
  const bundleDir = path.join(temp, "test.agent");
  await ensureDir(bundleDir);
  await writeFile(path.join(bundleDir, "MANIFEST.json"), JSON.stringify({ slug: "test" }));

  await signBundle(bundleDir);
  // Tamper with the file
  await writeFile(path.join(bundleDir, "MANIFEST.json"), JSON.stringify({ slug: "hacked" }));

  const result = await verifyBundleSignature(bundleDir);
  assert.ok(!result.valid, "tampered bundle should fail verification");
  assert.ok(result.details.modifiedFiles.includes("MANIFEST.json"));
});

test("verifyBundleSignature detects added files", async () => {
  const temp = await createTempDir("added-sig-");
  const bundleDir = path.join(temp, "test.agent");
  await ensureDir(bundleDir);
  await writeFile(path.join(bundleDir, "MANIFEST.json"), JSON.stringify({ slug: "test" }));

  await signBundle(bundleDir);
  // Add new file
  await writeFile(path.join(bundleDir, "EVIL.md"), "malicious content");

  const result = await verifyBundleSignature(bundleDir);
  assert.ok(!result.valid);
  assert.ok(result.details.addedFiles.includes("EVIL.md"));
});

test("verifyBundleSignature returns unsigned for missing signature", async () => {
  const temp = await createTempDir("nosig-");
  const bundleDir = path.join(temp, "test.agent");
  await ensureDir(bundleDir);
  await writeFile(path.join(bundleDir, "MANIFEST.json"), JSON.stringify({ slug: "test" }));

  const result = await verifyBundleSignature(bundleDir);
  assert.ok(!result.valid);
  assert.ok(result.unsigned);
});

// === Pack + Signing 集成测试 ===

test("pack command output can be signed and verified", async () => {
  const temp = await createTempDir("pack-sign-");
  const workspace = path.join(temp, "workspace");
  const output = path.join(temp, "output");
  const configPath = path.join(temp, "openclaw.json");

  await setupWorkspace(workspace);
  await writeJson(configPath, {
    agents: { defaults: { model: { primary: "test" } } },
  });

  const result = await packCommand({
    workspace, output, config: configPath, skipScan: true,
  });

  // Sign the bundle
  const sig = await signBundle(result.bundleDir, { signer: "ci-bot" });
  assert.ok(sig.fileCount > 0);

  // Verify the bundle
  const verification = await verifyBundleSignature(result.bundleDir);
  assert.ok(verification.valid, "freshly signed bundle should verify");
  assert.equal(verification.signer, "ci-bot");
});

// === OAuth 模块测试 ===

import {
  OAUTH_PROVIDERS, isOAuthConfigured, getConfiguredProviders, getOAuthAuthorizeUrl,
} from "../src/lib/auth.js";

test("OAUTH_PROVIDERS has github and google configured", () => {
  assert.ok(OAUTH_PROVIDERS.github);
  assert.ok(OAUTH_PROVIDERS.google);
  assert.equal(OAUTH_PROVIDERS.github.name, "GitHub");
  assert.equal(OAUTH_PROVIDERS.google.name, "Google");
  assert.ok(OAUTH_PROVIDERS.github.authorizeUrl.includes("github.com"));
  assert.ok(OAUTH_PROVIDERS.google.authorizeUrl.includes("accounts.google.com"));
});

test("isOAuthConfigured returns false when env vars not set", () => {
  // 默认环境下，没有设置 CLIENT_ID 和 CLIENT_SECRET
  const origGhId = process.env.GITHUB_CLIENT_ID;
  const origGhSecret = process.env.GITHUB_CLIENT_SECRET;
  delete process.env.GITHUB_CLIENT_ID;
  delete process.env.GITHUB_CLIENT_SECRET;
  assert.equal(isOAuthConfigured("github"), false);
  assert.equal(isOAuthConfigured("nonexistent"), false);
  // 恢复
  if (origGhId) process.env.GITHUB_CLIENT_ID = origGhId;
  if (origGhSecret) process.env.GITHUB_CLIENT_SECRET = origGhSecret;
});

test("isOAuthConfigured returns true when env vars set", () => {
  const origId = process.env.GITHUB_CLIENT_ID;
  const origSecret = process.env.GITHUB_CLIENT_SECRET;
  process.env.GITHUB_CLIENT_ID = "test-id";
  process.env.GITHUB_CLIENT_SECRET = "test-secret";
  assert.equal(isOAuthConfigured("github"), true);
  // 恢复
  if (origId) { process.env.GITHUB_CLIENT_ID = origId; } else { delete process.env.GITHUB_CLIENT_ID; }
  if (origSecret) { process.env.GITHUB_CLIENT_SECRET = origSecret; } else { delete process.env.GITHUB_CLIENT_SECRET; }
});

test("getConfiguredProviders filters by env vars", () => {
  const origGhId = process.env.GITHUB_CLIENT_ID;
  const origGhSecret = process.env.GITHUB_CLIENT_SECRET;
  delete process.env.GITHUB_CLIENT_ID;
  delete process.env.GITHUB_CLIENT_SECRET;
  const providers = getConfiguredProviders();
  assert.ok(!providers.includes("github"), "github should not be configured without env vars");
  // 恢复
  if (origGhId) process.env.GITHUB_CLIENT_ID = origGhId;
  if (origGhSecret) process.env.GITHUB_CLIENT_SECRET = origGhSecret;
});

test("getOAuthAuthorizeUrl generates GitHub authorize URL", () => {
  const origId = process.env.GITHUB_CLIENT_ID;
  const origSecret = process.env.GITHUB_CLIENT_SECRET;
  process.env.GITHUB_CLIENT_ID = "gh-test-id";
  process.env.GITHUB_CLIENT_SECRET = "gh-test-secret";

  const result = getOAuthAuthorizeUrl("github", "http://localhost:3000/api/auth/callback/github");
  assert.ok(result.url.includes("github.com/login/oauth/authorize"));
  assert.ok(result.url.includes("client_id=gh-test-id"));
  assert.ok(result.url.includes("redirect_uri="));
  assert.ok(result.url.includes("scope=read%3Auser"));
  assert.ok(result.state.length > 0, "should have CSRF state");

  if (origId) { process.env.GITHUB_CLIENT_ID = origId; } else { delete process.env.GITHUB_CLIENT_ID; }
  if (origSecret) { process.env.GITHUB_CLIENT_SECRET = origSecret; } else { delete process.env.GITHUB_CLIENT_SECRET; }
});

test("getOAuthAuthorizeUrl generates Google authorize URL with extra params", () => {
  const origId = process.env.GOOGLE_CLIENT_ID;
  const origSecret = process.env.GOOGLE_CLIENT_SECRET;
  process.env.GOOGLE_CLIENT_ID = "google-test-id";
  process.env.GOOGLE_CLIENT_SECRET = "google-test-secret";

  const result = getOAuthAuthorizeUrl("google", "http://localhost:3000/api/auth/callback/google");
  assert.ok(result.url.includes("accounts.google.com"));
  assert.ok(result.url.includes("client_id=google-test-id"));
  assert.ok(result.url.includes("access_type=offline"), "Google should have access_type");
  assert.ok(result.url.includes("prompt=consent"), "Google should have prompt");

  if (origId) { process.env.GOOGLE_CLIENT_ID = origId; } else { delete process.env.GOOGLE_CLIENT_ID; }
  if (origSecret) { process.env.GOOGLE_CLIENT_SECRET = origSecret; } else { delete process.env.GOOGLE_CLIENT_SECRET; }
});

test("getOAuthAuthorizeUrl throws for unknown provider", () => {
  assert.throws(() => getOAuthAuthorizeUrl("twitter", "http://localhost/callback"), /Unknown OAuth provider/);
});

test("getOAuthAuthorizeUrl throws when not configured", () => {
  const origId = process.env.GITHUB_CLIENT_ID;
  delete process.env.GITHUB_CLIENT_ID;
  assert.throws(() => getOAuthAuthorizeUrl("github", "http://localhost/callback"), /not configured/);
  if (origId) process.env.GITHUB_CLIENT_ID = origId;
});

// === API Server OAuth 路由集成测试 ===

import { createApiServer } from "../src/api-server.js";

test("API /api/auth/providers returns available providers", async () => {
  const temp = await createTempDir("oauth-api-");
  const registryDir = path.join(temp, "registry");
  await ensureDir(registryDir);

  const { baseUrl, close } = await createApiServer({ registryDir, port: 0 });
  try {
    const res = await fetch(`${baseUrl}/api/auth/providers`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.providers));
    assert.equal(data.localAuth, true);
  } finally {
    await close();
  }
});

test("API /api/auth/register and /api/auth/login flow", async () => {
  const temp = await createTempDir("auth-api-");
  const registryDir = path.join(temp, "registry");
  await ensureDir(registryDir);

  const { baseUrl, close } = await createApiServer({ registryDir, port: 0 });
  try {
    // 注册
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "testuser", password: "secure123", email: "test@test.com" }),
    });
    assert.equal(regRes.status, 201);
    const regData = await regRes.json();
    assert.equal(regData.user.username, "testuser");
    assert.ok(regData.token.startsWith("ah_"), "should return API token");

    // 重复注册应失败
    const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "testuser", password: "other123" }),
    });
    assert.equal(dupRes.status, 409);

    // 登录
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "testuser", password: "secure123" }),
    });
    assert.equal(loginRes.status, 200);
    const loginData = await loginRes.json();
    assert.ok(loginData.token.startsWith("ah_"));

    // 用 token 获取用户信息
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${loginData.token}` },
    });
    assert.equal(meRes.status, 200);
    const meData = await meRes.json();
    assert.equal(meData.user.username, "testuser");

    // 无 token 获取用户信息应 401
    const noAuthRes = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(noAuthRes.status, 401);
  } finally {
    await close();
  }
});
