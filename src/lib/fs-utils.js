import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

export async function copyDir(source, destination) {
  await ensureDir(path.dirname(destination));
  await cp(source, destination, { recursive: true });
}

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function writeJson(filePath, value) {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function removeDir(dirPath) {
  await rm(dirPath, { recursive: true, force: true });
}

export async function countFiles(dirPath) {
  if (!(await pathExists(dirPath))) {
    return 0;
  }
  const entries = await readdir(dirPath, { withFileTypes: true });
  let total = 0;
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      total += await countFiles(fullPath);
    } else {
      total += 1;
    }
  }
  return total;
}
