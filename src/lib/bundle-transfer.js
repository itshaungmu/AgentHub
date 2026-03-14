import { mkdtemp, readdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { ensureDir } from "./fs-utils.js";
import { publishBundle } from "./registry.js";

async function walk(dirPath, baseDir = dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath, baseDir)));
    } else {
      files.push({
        path: path.relative(baseDir, fullPath),
        contentBase64: (await readFile(fullPath)).toString("base64"),
      });
    }
  }
  return files;
}

export async function serializeBundleDir(bundleDir) {
  return {
    bundleName: path.basename(bundleDir),
    files: await walk(bundleDir),
  };
}

export async function materializeBundlePayload(payload) {
  const tempRoot = await mkdtemp(path.join(tmpdir(), "agenthub-upload-"));
  const bundleDir = path.join(tempRoot, payload.bundleName);
  for (const file of payload.files) {
    const destination = path.join(bundleDir, file.path);
    await ensureDir(path.dirname(destination));
    await writeFile(destination, Buffer.from(file.contentBase64, "base64"));
  }
  return bundleDir;
}

export async function publishUploadedBundle({ payload, registryDir }) {
  const bundleDir = await materializeBundlePayload(payload);
  return publishBundle(bundleDir, registryDir);
}

export async function publishRemoteBundle({ bundleDir, serverUrl }) {
  const payload = await serializeBundleDir(bundleDir);
  const response = await fetch(new URL("/api/publish-upload", serverUrl), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Remote publish failed: ${response.status} ${await response.text()}`);
  }
  return response.json();
}
