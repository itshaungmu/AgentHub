import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { spawn } from "node:child_process";
import { createTempDir, runCli, setupWorkspace, writeJson } from "./helpers.js";

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    let stderr = "";
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`child exited with ${code}\n${stderr}`));
    });
  });
}

test("cli shows help", () => {
  const result = runCli([]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /agenthub/i);
});

test("serve command starts the browse server and returns usable pages", async () => {
  const temp = await createTempDir("agenthub-serve-");
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

  const child = spawn("node", ["src/cli.js", "serve", "--registry", registry, "--port", "0"], {
    cwd: "/root/agenthub",
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  });

  try {
    const baseUrl = await new Promise((resolve, reject) => {
      let stdout = "";
      let stderr = "";
      const timeout = setTimeout(() => reject(new Error(`serve startup timeout\n${stdout}\n${stderr}`)), 5000);

      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
        const match = stdout.match(/Server listening at (http:\/\/127\.0\.0\.1:\d+)/);
        if (match) {
          clearTimeout(timeout);
          resolve(match[1]);
        }
      });
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });
      child.on("exit", (code) => {
        clearTimeout(timeout);
        reject(new Error(`serve exited early: ${code}\n${stdout}\n${stderr}`));
      });
    });

    const response = await fetch(baseUrl);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /AgentHub/i);
    assert.match(html, /workspace/);
    assert.match(html, /v1\.0\.0/);
  } finally {
    child.kill("SIGTERM");
    await new Promise((resolve) => child.on("exit", resolve));
  }
});

test("publish-remote uploads a bundle to a running HTTP registry", async () => {
  const { createServer } = await import("../src/server.js");
  const temp = await createTempDir("agenthub-publish-remote-");
  const workspace = path.join(temp, "workspace");
  const output = path.join(temp, "output");
  const registry = path.join(temp, "registry");
  const configPath = path.join(temp, "openclaw.json");
  await setupWorkspace(workspace);
  await writeJson(configPath, {
    agents: { defaults: { model: { primary: "anthropic/claude-3-5-sonnet" } } },
  });
  assert.equal(runCli(["pack", "--workspace", workspace, "--config", configPath, "--output", output]).status, 0);

  const server = await createServer({ registryDir: registry, port: 0 });
  try {
    const child = spawn(
      "node",
      [
        "src/cli.js",
        "publish-remote",
        path.join(output, "workspace-1.0.0.agent"),
        "--server",
        server.baseUrl,
      ],
      { cwd: "/root/agenthub", stdio: ["ignore", "pipe", "pipe"] },
    );
    await waitForExit(child);

    const response = await fetch(`${server.baseUrl}/api/agents`);
    const json = await response.json();
    assert.equal(json.agents.length, 1);
    assert.equal(json.agents[0].slug, "workspace");
  } finally {
    await server.close();
  }
});
