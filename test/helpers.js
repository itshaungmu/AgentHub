import { mkdtemp, mkdir, writeFile, readFile, readdir, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const PROJECT_ROOT = path.resolve(__dirname, "..");

export async function createTempDir(prefix = "agenthub-") {
  return mkdtemp(path.join(tmpdir(), prefix));
}

export async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function setupWorkspace(root) {
  await mkdir(path.join(root, "memory", "public"), { recursive: true });
  await mkdir(path.join(root, "memory", "portable"), { recursive: true });
  await mkdir(path.join(root, "skills"), { recursive: true });
  await writeFile(path.join(root, "AGENTS.md"), "# Agent rules\n", "utf8");
  await writeFile(path.join(root, "SOUL.md"), "# Soul\n", "utf8");
  await writeFile(path.join(root, "USER.md"), "# User\n", "utf8");
  await writeFile(path.join(root, "TOOLS.md"), "# Tools\n", "utf8");
  await writeFile(path.join(root, "IDENTITY.md"), "# Identity\n", "utf8");
  await writeFile(path.join(root, "memory", "public", "style.md"), "friendly\n", "utf8");
  await writeFile(path.join(root, "memory", "portable", "project.md"), "project summary\n", "utf8");
  await writeFile(path.join(root, "skills", "github-pr.md"), "skill ref\n", "utf8");
}

export function runCli(args, options = {}) {
  return spawnSync("node", ["src/cli.js", ...args], {
    cwd: PROJECT_ROOT,
    encoding: "utf8",
    ...options,
  });
}

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function listDirNames(dirPath) {
  return (await readdir(dirPath)).sort();
}
