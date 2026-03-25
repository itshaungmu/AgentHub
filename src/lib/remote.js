import { fetchJsonWithFallback } from "./http.js";

export function resolveServerUrl(options = {}) {
  return options.server || "https://agenthub.cyou";
}

export async function fetchRemoteJson(pathname, options = {}) {
  const serverUrl = resolveServerUrl(options);
  const url = new URL(pathname, serverUrl).toString();
  return fetchJsonWithFallback(url);
}
