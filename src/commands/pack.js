/**
 * Pack Command
 * 打包 OpenClaw 工作区为 Agent Bundle
 *
 * 根据 PRD v1.1 Bundle 结构规范实现
 */

import path from "node:path";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { countFiles, copyDir, ensureDir, readJson, writeJson, pathExists } from "../lib/fs-utils.js";
import { createManifest, validateManifest, generateBundleId } from "../lib/manifest.js";
import { extractOpenClawTemplate } from "../lib/openclaw-config.js";

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
 */
export async function packCommand(options) {
  const workspace = path.resolve(options.workspace || process.cwd());
  const output = path.resolve(options.output ?? "./bundles");
  const configPath = options.config ? path.resolve(options.config) : null;
  const version = options.version || "1.0.0";
  const customName = options.name || null;

  // 从工作区名称或自定义名称生成 slug
  const baseName = customName || path.basename(workspace);
  const slug = baseName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const bundleDir = path.join(output, `${slug}-${version}.agent`);

  // 1. 扫描工作区
  const workspaceFiles = await scanWorkspace(workspace);

  // 2. 统计 Memory 分层
  const memoryCounts = {
    public: await countFiles(path.join(workspace, "memory", "public")),
    portable: await countFiles(path.join(workspace, "memory", "portable")),
    private: await countFiles(path.join(workspace, "memory", "private")),
  };

  // 3. 读取并处理 OpenClaw 配置
  let template = {};
  if (configPath && (await pathExists(configPath))) {
    const config = await readJson(configPath);
    template = extractOpenClawTemplate(config);
  }

  // 4. 生成 MANIFEST
  const manifest = createManifest({
    slug,
    name: customName || path.basename(workspace),
    memoryCounts,
    openclawTemplate: template,
    skills: workspaceFiles.skills,
    prompts: workspaceFiles.prompts,
    tags: options.tags ? options.tags.split(",").map((t) => t.trim()) : [],
    category: options.category,
    version,
    featured: options.featured === true,
  });

  // 5. 验证 MANIFEST
  const validation = validateManifest(manifest);
  if (!validation.valid) {
    throw new Error(`Invalid manifest: ${validation.errors.join(", ")}`);
  }

  // 6. 创建 Bundle 目录结构
  await ensureDir(bundleDir);

  // 6.1 复制 WORKSPACE
  await copyDir(workspace, path.join(bundleDir, "WORKSPACE"));

  // 6.2 写入 OPENCLAW.template.json
  await writeJson(path.join(bundleDir, "OPENCLAW.template.json"), template);

  // 6.3 写入 MANIFEST.json
  await writeJson(path.join(bundleDir, "MANIFEST.json"), manifest);

  // 6.4 生成 README.md
  const readme = `# ${manifest.name}

${manifest.description}

## 安装

\`\`\`bash
agenthub install ${manifest.slug}
\`\`\`

## 包含内容

- **记忆**: ${manifest.includes.memory.count} 条
- **技能**: ${manifest.includes.skills.join(", ") || "无"}
- **提示词**: ${manifest.includes.prompts} 个

## 要求

- 运行时: OpenClaw ${manifest.runtime.version}
`;
  await writeFile(path.join(bundleDir, "README.md"), readme, "utf8");

  return {
    bundleDir,
    manifest,
    validation,
    bundleId: generateBundleId(manifest.slug, manifest.version),
  };
}
