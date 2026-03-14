import path from "node:path";
import { installBundle } from "../lib/install.js";

export async function installCommand(agentSpec, options) {
  return installBundle({
    registryDir: path.resolve(options.registry),
    agentSpec,
    targetWorkspace: path.resolve(options.targetWorkspace),
  });
}
