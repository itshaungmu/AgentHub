/**
 * Pack Command
 * 打包 OpenClaw 工作区为 Agent Bundle
 *
 * 根据 PRD v1.1 Bundle 结构规范实现
 * v0.5: 集成隐私防护引擎 + 安全扫描
 */

import path from "node:path";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { countFiles, copyDirFiltered, ensureDir, readJson, writeJson, pathExists } from "../lib/fs-utils.js";
import { createManifest, validateManifest, generateBundleId } from "../lib/manifest.js";
import { extractOpenClawTemplate } from "../lib/openclaw-config.js";
import { scanPrivacyRisks, getPackFilterOptions, generatePrivacyReport } from "../lib/privacy-engine.js";
import { scanWorkspace as securityScanWorkspace } from "../lib/security-scanner.js";

const WORKSPACE_CORE_FILES = ["AGENTS.md", "SOUL.md", "USER.md", "IDENTITY.md", "TOOLS.md", "HEARTBEAT.md", "BOOTSTRAP.md"];

/**
 * 扫描工作区文件
 */
async function scanWorkspace(workspacePath) {
  const files = {
    core: [],
    skills: [],
    prompts: [],
    canvas: false,
  };

  for (const filename of WORKSPACE_CORE_FILES) {
    const filePath = path.join(workspacePath, filename);
    if (await pathExists(filePath)) {
      files.core.push(filename);
    }
  }

  // 检查 skills 目录
  const skillsPath = path.join(workspacePath, "skills");
  if (await pathExists(skillsPath)) {
    const entries = await readdir(skillsPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        files.skills.push(entry.name);
      }
    }
  }

  // 检查 PROMPTS 目录
  const promptsPath = path.join(workspacePath, "PROMPTS");
  if (await pathExists(promptsPath)) {
    const entries = await readdir(promptsPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".txt")) {
        files.prompts.push(entry.name);
      }
    }
  }

  // 检查 canvas 目录
  const canvasPath = path.join(workspacePath, "canvas");
  files.canvas = await pathExists(canvasPath);

  return files;
}

/**
 * Pack 命令主函数
 *
 * @param {object} options
 * @param {string} [options.workspace] - 工作区路径
 * @param {string} [options.output] - 输出目录
 * @param {string} [options.config] - OpenClaw 配置文件路径
 * @param {string} [options.version] - 版本号
 * @param {string} [options.name] - 自定义名称
 * @param {boolean} [options.strict] - 严格模式：发现高危敏感信息时中止打包
 * @param {boolean} [options.stripPrivate] - 自动剥离私有数据（默认 true）
 * @param {boolean} [options.skipScan] - 跳过安全扫描
 */
export async function packCommand(options) {
  const workspace = path.resolve(options.workspace || process.cwd());
  const output = path.resolve(options.output ?? "./bundles");
  const configPath = options.config ? path.resolve(options.config) : null;
  const version = options.version || "1.0.0";
  const customName = options.name || null;
  const strict = options.strict === true;
  const stripPrivate = options.stripPrivate !== false; // 默认开启
  const skipScan = options.skipScan === true;

  // 从工作区目录名生成 slug，保证 slug 的英文稳定性
  const slug = path.basename(workspace).toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const bundleDir = path.join(output, `${slug}-${version}.agent`);

  // ===== 隐私防护阶段 =====

  // 1. 安全扫描（除非显式跳过）
  let securityResult = null;
  let privacyResult = null;

  if (!skipScan) {
    // 1.1 安全扫描：检测 API Key、密码、Token 等
    securityResult = await securityScanWorkspace(workspace);

    // 1.2 隐私风险扫描：检测私有记忆、敏感信息
    privacyResult = await scanPrivacyRisks(workspace);

    // 1.3 严格模式：发现高危问题时中止
    if (strict) {
      const criticalFindings = securityResult.findings.filter(
        (f) => f.severity === "critical" || f.severity === "high"
      );
      if (criticalFindings.length > 0) {
        const details = criticalFindings
          .map((f) => `  ${f.file}: ${f.type} (${f.count} 处)`)
          .join("\n");
        throw new Error(
          `[严格模式] 安全扫描发现 ${criticalFindings.length} 个高危问题，打包已中止:\n${details}\n\n提示: 移除敏感信息后重试，或使用 --no-strict 跳过严格检查`
        );
      }

      if (privacyResult.hasPrivateMemory) {
        throw new Error(
          `[严格模式] 检测到 memory/private/ 中有 ${privacyResult.privateMemoryCount} 个文件，打包已中止。\n\n提示: 私有记忆会被自动排除，使用 --no-strict 允许打包`
        );
      }
    }
  }

  // 2. 扫描工作区文件结构
  const workspaceFiles = await scanWorkspace(workspace);

  // 3. 统计 Memory 分层（用于 Manifest 记录，不影响过滤）
  const memoryCounts = {
    public: await countFiles(path.join(workspace, "memory", "public")),
    portable: await countFiles(path.join(workspace, "memory", "portable")),
    private: await countFiles(path.join(workspace, "memory", "private")),
  };

  // 4. 读取并处理 OpenClaw 配置
  let template = {};
  if (configPath && (await pathExists(configPath))) {
    const config = await readJson(configPath);
    template = extractOpenClawTemplate(config);
  }

  // 5. 生成 MANIFEST
  const manifest = createManifest({
    slug,
    name: customName || path.basename(workspace),
    memoryCounts,
    openclawTemplate: template,
    skills: workspaceFiles.skills,
    prompts: workspaceFiles.prompts,
    tags: options.tags && typeof options.tags === "string" && options.tags.trim() ? options.tags.split(",").map((t) => t.trim()) : [],
    category: options.category,
    version,
    featured: options.featured === true,
  });

  // 6. 验证 MANIFEST
  const validation = validateManifest(manifest);
  if (!validation.valid) {
    throw new Error(`Invalid manifest: ${validation.errors.join(", ")}`);
  }

  // ===== 构建阶段 =====

  // 7. 创建 Bundle 目录结构
  await ensureDir(bundleDir);

  // 7.1 使用带过滤的复制替代全量复制
  const filterOptions = stripPrivate
    ? getPackFilterOptions(manifest)
    : { excludeDirs: [".git", "node_modules"], excludeFiles: [], maxFileSize: 50 * 1024 * 1024 };

  const copyReport = await copyDirFiltered(
    workspace,
    path.join(bundleDir, "WORKSPACE"),
    filterOptions,
  );

  // 7.2 写入 OPENCLAW.template.json
  await writeJson(path.join(bundleDir, "OPENCLAW.template.json"), template);

  // 7.3 写入 MANIFEST.json（更新排除信息）
  if (stripPrivate) {
    // 更新 memory.private 为 0 因为已被剥离
    manifest.includes.memory.private = 0;
    manifest.includes.memory.count = manifest.includes.memory.public + manifest.includes.memory.portable;
  }
  await writeJson(path.join(bundleDir, "MANIFEST.json"), manifest);

  // 7.4 生成隐私合规报告
  if (!skipScan && privacyResult) {
    const privacyReport = generatePrivacyReport(privacyResult, copyReport);
    await writeJson(path.join(bundleDir, "PRIVACY_REPORT.json"), privacyReport);
  }

  // 7.5 生成 README.md
  const privacyBadge = stripPrivate ? "🛡️ 已通过隐私审查" : "⚠️ 未启用隐私防护";
  const readme = `# ${manifest.name}

${manifest.description}

${privacyBadge}

## 安装

\`\`\`bash
agenthub install ${manifest.slug}
\`\`\`

## 包含内容

- **记忆**: ${manifest.includes.memory.count} 条 (public: ${manifest.includes.memory.public}, portable: ${manifest.includes.memory.portable})
- **技能**: ${manifest.includes.skills.join(", ") || "无"}
- **提示词**: ${manifest.includes.prompts} 个

## 隐私说明

- 私有记忆 (memory/private): ${stripPrivate ? "已自动剥离" : "未处理"}
- 敏感信息扫描: ${skipScan ? "已跳过" : "已完成"}
- 文件过滤: 排除了 ${copyReport.skipped.length} 个文件/目录

## 要求

- 运行时: OpenClaw ${manifest.runtime.version}
`;
  await writeFile(path.join(bundleDir, "README.md"), readme, "utf8");

  return {
    bundleDir,
    manifest,
    validation,
    bundleId: generateBundleId(manifest.slug, manifest.version),
    // 新增：安全与隐私报告
    security: securityResult ? {
      warnings: securityResult.warnings,
      findingsCount: securityResult.findings.length,
      canPublish: securityResult.canPublish,
    } : null,
    privacy: {
      stripped: stripPrivate,
      skippedFiles: copyReport.skipped.length,
      copiedFiles: copyReport.copied.length,
      skippedList: copyReport.skipped,
    },
  };
}
