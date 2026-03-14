/**
 * List Command
 * 列出已安装的 Agent
 */

import path from "node:path";
import { stat, readdir, readFile } from "node:fs/promises";

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function listCommand(options = {}) {
  // 检查多个可能的安装位置
  const locations = [];

  // 1. 当前目录的 .agenthub
  const cwd = process.cwd();
  const cwdAgenthub = path.join(cwd, ".agenthub");
  if (await pathExists(cwdAgenthub)) {
    const installs = await findInstallsInDir(cwd);
    locations.push(...installs.map((i) => ({ ...i, location: cwd })));
  }

  // 2. 如果指定了 target-workspace
  if (options.targetWorkspace) {
    const targetPath = path.resolve(options.targetWorkspace);
    const installs = await findInstallsInDir(targetPath);
    locations.push(...installs.map((i) => ({ ...i, location: targetPath })));
  }

  return locations;
}

async function findInstallsInDir(dirPath) {
  const installs = [];
  const agenthubDir = path.join(dirPath, ".agenthub");
  const installRecordPath = path.join(agenthubDir, "install.json");

  if (await pathExists(installRecordPath)) {
    try {
      const record = await readJson(installRecordPath);
      installs.push({
        slug: record.slug,
        version: record.version,
        installedAt: record.installedAt || record.updatedAt,
        rolledBackAt: record.rolledBackAt,
      });
    } catch {
      // 无效的安装记录
    }
  }

  return installs;
}

export function formatListOutput(installs) {
  if (installs.length === 0) {
    return "\n📭 暂无已安装的 Agent\n\n安装命令: agenthub install <agent-slug>\n";
  }

  const lines = [];
  lines.push("\n📦 已安装的 Agent:\n");
  lines.push("─".repeat(60));

  for (const install of installs) {
    const status = install.rolledBackAt ? "↩️ " : "✓ ";
    lines.push(`  ${status} ${install.slug}@${install.version}`);
    if (install.location) {
      lines.push(`     位置: ${install.location}`);
    }
    if (install.installedAt) {
      lines.push(`     安装时间: ${install.installedAt}`);
    }
    lines.push("");
  }

  lines.push("─".repeat(60));
  lines.push(`\n共 ${installs.length} 个已安装的 Agent\n`);

  return lines.join("\n");
}
