export function sendJson(response, statusCode, payload, extraHeaders = {}) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8", ...extraHeaders });
  response.end(`${JSON.stringify(payload, null, 2)}\n`);
}

export function sendHtml(response, statusCode, html, extraHeaders = {}) {
  response.writeHead(statusCode, { "content-type": "text/html; charset=utf-8", ...extraHeaders });
  response.end(html);
}

export function notFound(response, extraHeaders = {}) {
  sendJson(response, 404, { error: "Not Found" }, extraHeaders);
}

export async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }
  if (chunks.length === 0) {
    return {};
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
