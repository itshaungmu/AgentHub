/**
 * 零依赖 .env 文件加载器
 * 在服务启动前加载 .env 文件中的环境变量
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * 加载 .env 文件到 process.env
 * 不会覆盖已存在的环境变量（系统环境变量优先）
 *
 * @param {string} [filePath] - .env 文件路径，默认为项目根目录的 .env
 */
export function loadEnv(filePath) {
  const envPath = filePath || resolve(process.cwd(), ".env");

  let content;
  try {
    content = readFileSync(envPath, "utf8");
  } catch {
    // .env 文件不存在，静默跳过
    return;
  }

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    // 跳过空行和注释
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    // 去除引号包裹
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // 不覆盖已存在的环境变量
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
