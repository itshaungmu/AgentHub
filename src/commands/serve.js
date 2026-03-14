import path from "node:path";
import { createServer } from "../server.js";

export async function serveCommand(options) {
  const registryDir = path.resolve(options.registry);
  const port = options.port ? Number(options.port) : 3000;
  const host = options.host || "0.0.0.0";
  return createServer({ registryDir, port, host });
}
