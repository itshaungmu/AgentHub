import path from "node:path";
import { searchRegistry } from "../lib/registry.js";
import { fetchRemoteJson } from "../lib/remote.js";

export async function searchCommand(query, options = {}) {
  if (options.registry) {
    return searchRegistry(path.resolve(options.registry), query);
  }

  const params = new URLSearchParams();
  if (query) params.set("q", query);
  const result = await fetchRemoteJson(`/api/agents?${params.toString()}`, options);
  return result.agents || [];
}
