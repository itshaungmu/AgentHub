import path from "node:path";
import { installBundle } from "../lib/install.js";
import { writeJson } from "../lib/fs-utils.js";

export async function installCommand(agentSpec, options) {
  // 未显式提供时，默认在当前目录执行安装
  const targetWorkspace = path.resolve(options.targetWorkspace || process.cwd());

  // 默认走远程服务器，提升网站复制命令可用性
  if (!options.registry && !options.server) {
    options.server = "https://agenthub.cyou";
  }

  const debugEnabled = Boolean(process.env.AGENTHUB_DEBUG_INSTALL);
  const debug = (message, details) => {
    if (!debugEnabled) return;
    console.error(`[agenthub:install] ${message} | ${JSON.stringify(details)}`);
  };

  debug("start install", {
    agentSpec,
    hasRegistry: Boolean(options.registry),
    hasServer: Boolean(options.server),
    targetWorkspace,
  });

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

  debug("install finished", {
    slug: result.manifest.slug,
    version: result.manifest.version,
    installedAt: new Date().toISOString(),
  });

  const installRecordPath = path.join(targetWorkspace, ".agenthub", "install.json");
  await writeJson(installRecordPath, {
    slug: result.manifest.slug,
    version: result.manifest.version,
    installedAt: new Date().toISOString(),
  });

  return result;
}
