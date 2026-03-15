import path from "node:path";
import { installBundle } from "../lib/install.js";

export async function installCommand(agentSpec, options) {
  const targetWorkspace = path.resolve(options.targetWorkspace);
  if (!targetWorkspace) {
    throw new Error("--target-workspace is required");
  }

  // 默认走远程服务器，提升网站复制命令可用性
  if (!options.registry && !options.server) {
    options.server = "https://agenthub.cyou";
  }

  if (options.registry) {
    return installBundle({
      registryDir: path.resolve(options.registry),
      agentSpec,
      targetWorkspace,
    });
  }

  return installBundle({
    serverUrl: options.server,
    agentSpec,
    targetWorkspace,
  });
}
