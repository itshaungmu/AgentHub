import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

export async function copyDir(source, destination) {
  await ensureDir(path.dirname(destination));
  await cp(source, destination, { recursive: true });
}

/**
 * 带过滤的目录复制
 * @param {string} source - 源目录
 * @param {string} destination - 目标目录
 * @param {object} options - 过滤选项
 * @param {string[]} [options.excludeDirs] - 排除的目录名/相对路径
 * @param {string[]} [options.excludeFiles] - 排除的文件名
 * @param {number} [options.maxFileSize] - 跳过超过此大小(字节)的文件
 * @returns {Promise<{copied: string[], skipped: string[]}>} 复制报告
 */
export async function copyDirFiltered(source, destination, options = {}) {
  const { excludeDirs = [], excludeFiles = [], maxFileSize = 50 * 1024 * 1024 } = options;
  const report = { copied: [], skipped: [] };

  async function walkAndCopy(srcDir, destDir, relativeBase = "") {
    await ensureDir(destDir);
    const entries = await readdir(srcDir, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);
      const relativePath = relativeBase ? `${relativeBase}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        // 检查是否在排除目录列表中（匹配目录名或相对路径）
        const shouldExclude = excludeDirs.some((pattern) => {
          const normalized = pattern.replace(/\\/g, "/");
          return entry.name === normalized || relativePath === normalized || relativePath.startsWith(`${normalized}/`);
        });
        if (shouldExclude) {
          report.skipped.push(relativePath);
          continue;
        }
        await walkAndCopy(srcPath, destPath, relativePath);
      } else if (entry.isFile()) {
        // 检查排除文件名
        if (excludeFiles.includes(entry.name)) {
          report.skipped.push(relativePath);
          continue;
        }
        // 检查文件大小
        const fileStat = await stat(srcPath);
        if (fileStat.size > maxFileSize) {
          report.skipped.push(relativePath);
          continue;
        }
        await ensureDir(path.dirname(destPath));
        await cp(srcPath, destPath);
        report.copied.push(relativePath);
      }
    }
  }

  await walkAndCopy(source, destination);
  return report;
}

export async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

export async function writeJson(filePath, value) {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

export async function removeDir(dirPath) {
  await rm(dirPath, { recursive: true, force: true });
}

export async function countFiles(dirPath) {
  if (!(await pathExists(dirPath))) {
    return 0;
  }
  const entries = await readdir(dirPath, { withFileTypes: true });
  let total = 0;
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      total += await countFiles(fullPath);
    } else {
      total += 1;
    }
  }
  return total;
}
