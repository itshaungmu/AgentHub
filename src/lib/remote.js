export function resolveServerUrl(options = {}) {
  return options.server || "https://agenthub.cyou";
}

export async function fetchRemoteJson(pathname, options = {}) {
  const serverUrl = resolveServerUrl(options);
  const url = new URL(pathname, serverUrl);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Remote request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
