/**
 * Privacy Engine
 * 隐私处理引擎 — AgentHub 核心竞争力模块
 *
 * 职责:
 * 1. 打包前自动剥离私有数据
 * 2. 对文本内容进行脱敏替换
 * 3. 生成隐私合规报告
 */

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

// === 默认排除目录 ===
const DEFAULT_EXCLUDE_DIRS = [
  "memory/private",
  ".git",
  ".env",
  "node_modules",
  ".vscode",
  ".idea",
];

// === 默认排除文件 ===
const DEFAULT_EXCLUDE_FILES = [
  ".env",
  ".env.local",
  ".env.production",
  ".env.development",
  ".npmrc",
  ".netrc",
  "id_rsa",
  "id_ed25519",
];

// === 敏感信息模式（与 security-scanner.js 保持一致，增强版） ===
const REDACT_PATTERNS = [
  { pattern: /sk-[a-zA-Z0-9]{20,}/g, name: "OpenAI API Key", replacement: "sk-***REDACTED***" },
  { pattern: /ghp_[a-zA-Z0-9]{36}/g, name: "GitHub Token", replacement: "ghp_***REDACTED***" },
  { pattern: /gho_[a-zA-Z0-9]{36}/g, name: "GitHub OAuth", replacement: "gho_***REDACTED***" },
  { pattern: /ghu_[a-zA-Z0-9]{36}/g, name: "GitHub User Token", replacement: "ghu_***REDACTED***" },
  { pattern: /ghs_[a-zA-Z0-9]{36}/g, name: "GitHub Server Token", replacement: "ghs_***REDACTED***" },
  { pattern: /ghr_[a-zA-Z0-9]{36}/g, name: "GitHub Refresh Token", replacement: "ghr_***REDACTED***" },
  { pattern: /xox[baprs]-[a-zA-Z0-9-]+/g, name: "Slack Token", replacement: "xox_-***REDACTED***" },
  { pattern: /-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END \1?PRIVATE KEY-----/g, name: "Private Key", replacement: "***PRIVATE_KEY_REDACTED***" },
  { pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g, name: "JWT Token", replacement: "***JWT_REDACTED***" },
  { pattern: /(password|passwd|pwd)\s*[=:]\s*['"][^'"]+['"]/gi, name: "Password", replacement: "$1=***REDACTED***" },
  { pattern: /(secret|api_key|apikey|access_key)\s*[=:]\s*['"][^'"]+['"]/gi, name: "API Secret", replacement: "$1=***REDACTED***" },
  { pattern: /(token|bearer)\s*[=:]\s*['"][^'"]+['"]/gi, name: "Token", replacement: "$1=***REDACTED***" },
  // 邮箱地址脱敏
  { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, name: "Email Address", replacement: "***@***.***" },
];

// 文本文件扩展名
const TEXT_EXTENSIONS = new Set([
  ".md", ".txt", ".json", ".yaml", ".yml", ".xml", ".html", ".css", ".js", ".ts",
  ".py", ".sh", ".bash", ".zsh", ".env", ".conf", ".config", ".ini", ".toml",
  ".jsx", ".tsx", ".vue", ".svelte", ".astro",
]);

function isTextFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return TEXT_EXTENSIONS.has(ext) || !ext;
}

/**
 * 对文本内容进行脱敏
 * @param {string} content - 原始内容
 * @param {Array} [patterns] - 脱敏模式列表
 * @returns {{ content: string, redactions: Array }} 脱敏后的内容和脱敏记录
 */
export function redactContent(content, patterns = REDACT_PATTERNS) {
  const redactions = [];
  let result = content;

  for (const { pattern, name, replacement } of patterns) {
    // 重建 RegExp 以重置 lastIndex
    const regex = new RegExp(pattern.source, pattern.flags);
    const matches = result.match(regex);
    if (matches) {
      redactions.push({ type: name, count: matches.length });
      result = result.replace(regex, replacement);
    }
  }

  return { content: result, redactions };
}

/**
 * 扫描目录，统计隐私风险
 * @param {string} dirPath - 目录路径
 * @returns {Promise<object>} 扫描报告
 */
export async function scanPrivacyRisks(dirPath) {
  const report = {
    hasPrivateMemory: false,
    privateMemoryCount: 0,
    sensitiveFindings: [],
    riskyFiles: [],
    totalFilesScanned: 0,
  };

  // 检查 memory/private/
  const privatePath = path.join(dirPath, "memory", "private");
  try {
    const privateStat = await stat(privatePath);
    if (privateStat.isDirectory()) {
      const entries = await readdir(privatePath);
      report.hasPrivateMemory = entries.length > 0;
      report.privateMemoryCount = entries.length;
    }
  } catch {
    // 不存在，正常
  }

  // 递归扫描文本文件
  await scanDirForSensitive(dirPath, report, "");

  return report;
}

async function scanDirForSensitive(dirPath, report, relativePath) {
  let entries;
  try {
    entries = await readdir(dirPath, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      // 跳过不需要扫描的目录
      if (["node_modules", ".git", ".vscode", ".idea"].includes(entry.name)) continue;
      await scanDirForSensitive(fullPath, report, relPath);
    } else if (entry.isFile() && isTextFile(entry.name)) {
      try {
        const content = await readFile(fullPath, "utf8");
        report.totalFilesScanned++;

        const { redactions } = redactContent(content);
        if (redactions.length > 0) {
          report.sensitiveFindings.push(...redactions.map((r) => ({
            file: relPath,
            type: r.type,
            count: r.count,
          })));
          report.riskyFiles.push(relPath);
        }
      } catch {
        // 无法读取，跳过
      }
    }
  }
}

/**
 * 获取打包过滤配置
 * 根据 sharingPolicy 和扫描结果，返回 copyDirFiltered 所需的 options
 *
 * @param {object} manifest - MANIFEST 对象
 * @param {object} [overrides] - 自定义覆盖
 * @returns {object} copyDirFiltered 的 options
 */
export function getPackFilterOptions(manifest, overrides = {}) {
  const policy = manifest?.sharingPolicy || {};
  const blockedLayers = policy.blockedMemoryLayers || ["private"];

  const excludeDirs = [
    ...DEFAULT_EXCLUDE_DIRS,
    ...blockedLayers.map((layer) => `memory/${layer}`),
    ...(overrides.excludeDirs || []),
  ];

  // 去重
  const uniqueDirs = [...new Set(excludeDirs)];

  return {
    excludeDirs: uniqueDirs,
    excludeFiles: [...DEFAULT_EXCLUDE_FILES, ...(overrides.excludeFiles || [])],
    maxFileSize: overrides.maxFileSize || 50 * 1024 * 1024,
  };
}

/**
 * 生成隐私合规报告
 * @param {object} scanResult - scanPrivacyRisks 的结果
 * @param {object} copyReport - copyDirFiltered 的结果
 * @returns {object} 隐私合规报告
 */
export function generatePrivacyReport(scanResult, copyReport) {
  const severity = scanResult.hasPrivateMemory ? "high" :
    scanResult.sensitiveFindings.length > 0 ? "medium" : "clean";

  return {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    severity,
    summary: {
      totalFilesScanned: scanResult.totalFilesScanned,
      sensitiveItemsFound: scanResult.sensitiveFindings.length,
      privateMemoryDetected: scanResult.hasPrivateMemory,
      privateMemoryCount: scanResult.privateMemoryCount,
      filesSkipped: copyReport?.skipped?.length || 0,
      filesCopied: copyReport?.copied?.length || 0,
    },
    details: {
      sensitiveFindings: scanResult.sensitiveFindings,
      riskyFiles: scanResult.riskyFiles,
      skippedPaths: copyReport?.skipped || [],
    },
    compliance: {
      privateDataStripped: !scanResult.hasPrivateMemory || severity !== "clean",
      sensitiveInfoRedacted: scanResult.sensitiveFindings.length === 0,
      policyEnforced: true,
    },
  };
}
