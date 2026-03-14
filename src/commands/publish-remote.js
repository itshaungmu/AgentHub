import path from "node:path";
import { publishRemoteBundle } from "../lib/bundle-transfer.js";

export async function publishRemoteCommand(bundleDir, options) {
  return publishRemoteBundle({
    bundleDir: path.resolve(bundleDir),
    serverUrl: options.server,
  });
}
