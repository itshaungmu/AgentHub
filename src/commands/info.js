import path from "node:path";
import { readAgentInfo, parseSpec } from "../lib/registry.js";
import { fetchRemoteJson } from "../lib/remote.js";

export async function infoCommand(agentSpec, options = {}) {
  if (options.registry) {
    return readAgentInfo(path.resolve(options.registry), agentSpec);
  }

  const { slug, version } = parseSpec(agentSpec);
  const params = new URLSearchParams();
  if (version) params.set("version", version);
  const qs = params.toString();
  return fetchRemoteJson(`/api/agents/${slug}${qs ? `?${qs}` : ""}`, options);
}
