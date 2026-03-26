/**
 * MANIFEST Generator
 * 根据 PRD v1.1 规范生成完整的 MANIFEST.json
 */

const WORKSPACE_FILES = ["AGENTS.md", "SOUL.md", "USER.md", "IDENTITY.md", "TOOLS.md", "HEARTBEAT.md", "BOOTSTRAP.md"];

export function createManifest({ slug, name, description, author, memoryCounts, openclawTemplate, skills = [], prompts = [], tags = [], category, language = "zh-CN", version = "1.0.0", featured = false }) {
  const hasModel = openclawTemplate?.agents?.defaults?.model?.primary;
  const totalMemory = memoryCounts.public + memoryCounts.portable + memoryCounts.private;

  return {
    // 基本信息
    name: name || slug,
    slug,
    version,
    description: description || `OpenClaw agent bundle for ${name || slug}`,
    author: author || "anonymous",
    icon: undefined,
    bundleVersion: "1.0",

    // 运行时
    runtime: {
      type: "openclaw",
      version: ">=0.5.0",
      compatibility: "openclaw-only",
    },

    // 性格
    persona: {
      summary: `Imported from OpenClaw workspace: ${name || slug}`,
      traits: [],
      expertise: [],
      communication_style: undefined,
    },

    // 包含内容
    includes: {
      memory: {
        count: totalMemory,
        public: memoryCounts.public,
        portable: memoryCounts.portable,
        private: memoryCounts.private,
      },
      workspaceFiles: WORKSPACE_FILES,
      skills: skills,
      prompts: prompts.length,
      configTemplates: ["OPENCLAW.template.json"],
    },

    // 依赖
    requirements: {
      env: [],
      model: hasModel ?? undefined,
      openclaw: ">=0.5.0",
    },

    // 分享策略
    sharingPolicy: {
      memoryMode: "layered",
      allowedMemoryLayers: ["public", "portable"],
      blockedMemoryLayers: ["private"],
      openclawConfigMode: "template-only",
    },

    // 元数据
    metadata: {
      tags: tags.length > 0 ? tags : ["openclaw"],
      category: category || "General",
      language: language,
      license: "MIT",
      featured,
    },
  };
}

/**
 * 验证 MANIFEST 完整性
 */
export function validateManifest(manifest) {
  const errors = [];
  const warnings = [];

  // 必需字段检查
  if (!manifest.name) errors.push("name is required");
  if (!manifest.slug) errors.push("slug is required");
  if (!manifest.version) errors.push("version is required");
  if (!manifest.description) errors.push("description is required");

  // 运行时检查
  if (manifest.runtime?.type !== "openclaw") {
    errors.push("runtime.type must be 'openclaw'");
  }

  // 私有记忆检查
  if (manifest.includes?.memory?.private > 0) {
    warnings.push("Bundle contains private memory, cannot be published publicly");
  }

  return {
    valid: errors.length === 0,
    canPublish: errors.length === 0 && manifest.includes?.memory?.private === 0,
    errors,
    warnings,
  };
}

/**
 * 生成 Bundle ID
 */
export function generateBundleId(slug, version) {
  return `agenthub://${slug}@${version}`;
}

/**
 * 解析 Bundle ID
 */
export function parseBundleId(bundleId) {
  const match = bundleId.match(/^agenthub:\/\/([^@]+)@(.+)$/);
  if (!match) {
    return null;
  }
  return { slug: match[1], version: match[2] };
}
