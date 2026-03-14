import path from "node:path";
import { readAgentInfo } from "../lib/registry.js";

export async function infoCommand(agentSpec, options) {
  return readAgentInfo(path.resolve(options.registry), agentSpec);
}
