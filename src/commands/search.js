import path from "node:path";
import { searchRegistry } from "../lib/registry.js";

export async function searchCommand(query, options) {
  const results = await searchRegistry(path.resolve(options.registry), query);
  return results;
}
