import path from "node:path";
import { publishBundle } from "../lib/registry.js";

export async function publishCommand(bundleDir, options) {
  const registry = path.resolve(options.registry);
  return publishBundle(path.resolve(bundleDir), registry);
}
