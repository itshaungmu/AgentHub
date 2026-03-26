import { createWebServer } from "../web-server.js";

export async function webCommand(options) {
  const port = parseInt(options.port || "3000", 10);
  const apiBase = options.apiBase || "http://127.0.0.1:3001";
  const host = options.host || "0.0.0.0";

  return createWebServer({ port, apiBase, host });
}
