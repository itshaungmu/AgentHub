import path from "node:path";
import { readFile } from "node:fs/promises";

export async function serveSkillMarkdown(request, response) {
  const skillPath = path.join(process.cwd(), "skills", "agenthub-discover", "SKILL.md");
  try {
    const content = await readFile(skillPath, "utf8");
    response.writeHead(200, {
      "Content-Type": "text/markdown; charset=utf-8",
      "Access-Control-Allow-Origin": "*"
    });
    response.end(content);
  } catch (error) {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ error: "Skill not found" }));
  }
}
