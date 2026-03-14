/**
 * Security Scanner
 * 安全扫描模块
 *
 * 根据 PRD v1.1 安全规范实现
 */

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

// 敏感信息模式
const SENSITIVE_PATTERNS = [
  { pattern: /sk-[a-zA-Z0-9]{20,}/g, name: "OpenAI API Key", severity: "high" },
  { pattern: /ghp_[a-zA-Z0-9]{36}/g, name: "GitHub Personal Token", severity: "high" },
  { pattern: /gho_[a-zA-Z0-9]{36}/g, name: "GitHub OAuth Token", severity: "high" },
  { pattern: /ghu_[a-zA-Z0-9]{36}/g, name: "GitHub User Token", severity: "high" },
  { pattern: /ghs_[a-zA-Z0-9]{36}/g, name: "GitHub Server Token", severity: "high" },
  { pattern: /ghr_[a-zA-Z0-9]{36}/g, name: "GitHub Refresh Token", severity: "high" },
  { pattern: /xox[baprs]-[a-zA-Z0-9-]+/g, name: "Slack Token", severity: "high" },
  { pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g, name: "JWT Token", severity: "medium" },
  { pattern: /(password|passwd|pwd)\s*[=:]\s*['"][^'"]+['"]/gi, name: "Password", severity: "high" },
  { pattern: /(secret|api_key|apikey|access_key)\s*[=:]\s*['"][^'"]+['"]/gi, name: "API Key/Secret", severity: "high" },
  { pattern: /-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----/g, name: "Private Key", severity: "critical" },
  { pattern: /(token|bearer)\s*[=:]\s*['"][^'"]+['"]/gi, name: "Token", severity: "medium" },
];

// 禁止的配置字段路径
const FORBIDDEN_CONFIG_PATHS = [
  "channels",
  "gateway",
  "wizard",
  "auth",
  "credentials",
  "secrets",
  "tokens",
];

// 文件扩展名白名单（跳过二进制文件）
const TEXT_EXTENSIONS = new Set([
  ".md", ".txt", ".json", ".yaml", ".yml", ".xml", ".html", ".css", ".js", ".ts",
  ".py", ".sh", ".bash", ".zsh", ".env", ".conf", ".config", ".ini", ".toml",
]);

/**
 * 检查文件是否为文本文件
 */
function isTextFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return TEXT_EXTENSIONS.has(ext) || !ext;
}

/**
 * 扫描文件内容中的敏感信息
 */
async function scanFileContent(filePath, content) {
  const findings = [];

  for (const { pattern, name, severity } of SENSITIVE_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      findings.push({
        file: filePath,
        type: name,
        severity,
        count: matches.length,
        // 不记录具体值，只记录发现
      });
    }
  }

  return findings;
}

/**
 * 递归扫描目录
 */
async function scanDirectory(dirPath, basePath = "") {
  const findings = [];
  const entries = await readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // 跳过 node_modules 和隐藏目录
      if (entry.name === "node_modules" || entry.name.startsWith(".")) {
        continue;
      }
      const subFindings = await scanDirectory(fullPath, relativePath);
      findings.push(...subFindings);
    } else if (entry.isFile() && isTextFile(entry.name)) {
      try {
        const content = await readFile(fullPath, "utf8");
        const fileFindings = await scanFileContent(relativePath, content);
        findings.push(...fileFindings);
      } catch {
        // 跳过无法读取的文件
      }
    }
  }

  return findings;
}

/**
 * 检查配置文件中的禁止字段
 */
function checkForbiddenFields(config, path = "") {
  const violations = [];

  for (const key of Object.keys(config)) {
    const currentPath = path ? `${path}.${key}` : key;

    // 检查是否是禁止的路径
    for (const forbidden of FORBIDDEN_CONFIG_PATHS) {
      if (currentPath.startsWith(forbidden) || key === forbidden) {
        violations.push({
          path: currentPath,
          reason: `禁止包含 ${forbidden} 配置`,
        });
      }
    }

    // 递归检查嵌套对象
    if (typeof config[key] === "object" && config[key] !== null) {
      const nestedViolations = checkForbiddenFields(config[key], currentPath);
      violations.push(...nestedViolations);
    }
  }

  return violations;
}

/**
 * 扫描 Bundle
 */
export async function scanBundle(bundleDir) {
  const result = {
    warnings: [],
    errors: [],
    findings: [],
    canPublish: true,
  };

  // 1. 扫描敏感信息
  const workspacePath = path.join(bundleDir, "WORKSPACE");
  try {
    const contentFindings = await scanDirectory(workspacePath, "WORKSPACE");
    result.findings.push(...contentFindings);

    for (const finding of contentFindings) {
      const severityIcon = finding.severity === "critical" ? "🔴" : finding.severity === "high" ? "🟠" : "🟡";
      result.warnings.push(`${severityIcon} ${finding.file}: 发现 ${finding.type} (${finding.count} 处)`);

      if (finding.severity === "critical" || finding.severity === "high") {
        result.canPublish = false;
      }
    }
  } catch {
    // WORKSPACE 目录不存在
  }

  // 2. 检查私有记忆
  const manifestPath = path.join(bundleDir, "MANIFEST.json");
  try {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

    if (manifest.includes?.memory?.private > 0) {
      result.errors.push("检测到私有记忆 (memory/private)，禁止公开发布");
      result.canPublish = false;
    }

    // 3. 检查配置文件
    const configPath = path.join(bundleDir, "OPENCLAW.template.json");
    try {
      const config = JSON.parse(await readFile(configPath, "utf8"));
      const violations = checkForbiddenFields(config);

      for (const violation of violations) {
        result.warnings.push(`⚠️ OPENCLAW.template.json: ${violation.reason} (${violation.path})`);
      }

      if (violations.length > 0) {
        result.canPublish = false;
      }
    } catch {
      // 配置文件不存在
    }
  } catch {
    // MANIFEST 不存在
  }

  return result;
}

/**
 * 扫描工作区（打包前预扫描）
 */
export async function scanWorkspace(workspacePath) {
  const result = {
    warnings: [],
    errors: [],
    findings: [],
    canPublish: true,
  };

  // 扫描敏感信息
  const contentFindings = await scanDirectory(workspacePath);
  result.findings.push(...contentFindings);

  for (const finding of contentFindings) {
    const severityIcon = finding.severity === "critical" ? "🔴" : finding.severity === "high" ? "🟠" : "🟡";
    result.warnings.push(`${severityIcon} ${finding.file}: 发现 ${finding.type}`);
  }

  // 检查私有记忆
  const privateMemoryPath = path.join(workspacePath, "memory", "private");
  try {
    const stat_ = await stat(privateMemoryPath);
    if (stat_.isDirectory()) {
      const files = await readdir(privateMemoryPath);
      if (files.length > 0) {
        result.warnings.push("🚫 检测到 memory/private/ 目录，包含私有记忆");
        result.warnings.push("   公开发布时将被阻止，建议将私有记忆移出工作区");
      }
    }
  } catch {
    // 目录不存在，正常
  }

  return result;
}
