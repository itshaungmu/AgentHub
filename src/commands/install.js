import path from "node:path";
import { installBundle } from "../lib/install.js";
import { writeJson } from "../lib/fs-utils.js";

export async function installCommand(agentSpec, options) {
  const targetWorkspace = path.resolve(options.targetWorkspace);
  if (!targetWorkspace) {
    throw new Error("--target-workspace is required");
  }

  // 默认走远程服务器，提升网站复制命令可用性
  if (!options.registry && !options.server) {
    options.server = "https://agenthub.cyou";
  }

  let result;
  if (options.registry) {
    result = await installBundle({
      registryDir: path.resolve(options.registry),
      agentSpec,
      targetWorkspace,
    });
  } else {
    result = await installBundle({
      serverUrl: options.server,
      agentSpec,
      targetWorkspace,
    });
  }

  const installRecordPath = path.join(targetWorkspace, ".agenthub", "install.json");
  await writeJson(installRecordPath, {
    slug: result.manifest.slug,
    version: result.manifest.version,
    installedAt: new Date().toISOString(),
  });

  return result;
}
