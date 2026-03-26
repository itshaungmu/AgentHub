import { createApiServer } from "../api-server.js";

export async function apiCommand(options) {
  const registry = options.registry || "./.registry";
  const port = parseInt(options.port || "3001", 10);
  const host = options.host || "0.0.0.0";

  return createApiServer({ registryDir: registry, port, host });
}
