/**
 * MANIFEST Generator
 * 根据 PRD v2.0 规范生成完整的 MANIFEST.json
 * 扩展字段：installMethods / permissions / compatibility / useCases / examples
 */

const WORKSPACE_FILES = ["AGENTS.md", "SOUL.md", "USER.md", "IDENTITY.md", "TOOLS.md", "HEARTBEAT.md", "BOOTSTRAP.md"];

/**
 * 默认权限声明 — 所有权限默认关闭
 */
const DEFAULT_PERMISSIONS = {
  readFiles: false,
  writeFiles: false,
  executeShell: false,
  networkAccess: false,
  requiresApiKey: false,
  thirdPartyDeps: [],
};

/**
 * 生成单个环境的安装指令模板
 */
function buildInstallBlock(slug, version) {
  return {
    openclaw: {
      install: `npx @zshuangmu/agenthub install ${slug} --target-workspace ./my-workspace`,
      requirements: "OpenClaw >=0.5.0",
      verify: `openclaw list-agents | grep ${slug}`,
      upgrade: `npx @zshuangmu/agenthub install ${slug}@latest --target-workspace ./my-workspace`,
      uninstall: `rm -rf ./my-workspace/.openclaw/agents/${slug}`,
    },
    claudeCode: {
      install: `npx @zshuangmu/agenthub install ${slug} --target-workspace .`,
      requirements: "Claude Code (VS Code Extension)",
      verify: "Check .claude/agents/ directory for the installed agent files",
      upgrade: `npx @zshuangmu/agenthub install ${slug}@latest --target-workspace .`,
      uninstall: `rm -rf .claude/agents/${slug}`,
    },
    cursor: {
      install: `npx @zshuangmu/agenthub install ${slug} --target-workspace .`,
      requirements: "Cursor IDE",
      verify: "Check .cursor/agents/ directory for the installed agent files",
      upgrade: `npx @zshuangmu/agenthub install ${slug}@latest --target-workspace .`,
      uninstall: `rm -rf .cursor/agents/${slug}`,
    },
    generic: {
      install: `npx @zshuangmu/agenthub install ${slug}@${version} --target-workspace ./my-workspace`,
      requirements: "Node.js >=18.0.0",
      verify: `ls ./my-workspace/.openclaw/agents/${slug}/MANIFEST.json`,
      upgrade: `npx @zshuangmu/agenthub install ${slug}@latest --target-workspace ./my-workspace`,
      uninstall: `rm -rf ./my-workspace/.openclaw/agents/${slug}`,
    },
  };
}

export function createManifest({
  slug, name, description, author, memoryCounts, openclawTemplate,
  skills = [], prompts = [], tags = [], category, language = "zh-CN",
  version = "1.0.0", featured = false,
  // === P0 新增参数 ===
  permissions = {},
  installMethods,
  compatibility = {},
  // === P1 新增参数 ===
  useCases = {},
  examples = [],
  repository,
  changelog,
}) {
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
    bundleVersion: "2.0",

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

    // === P0: 多环境安装指令 ===
    installMethods: installMethods || buildInstallBlock(slug, version),

    // === P0: 权限与风险声明 ===
    permissions: {
      ...DEFAULT_PERMISSIONS,
      ...permissions,
    },

    // === P0: 兼容性信息 ===
    compatibility: {
      platforms: compatibility.platforms || ["openclaw"],
      minVersion: compatibility.minVersion || "0.5.0",
      testedVersion: compatibility.testedVersion || undefined,
      knownLimitations: compatibility.knownLimitations || [],
    },

    // === P1: 适用场景 ===
    useCases: {
      solves: useCases.solves || "",
      scenarios: useCases.scenarios || [],
      notSuitableFor: useCases.notSuitableFor || [],
    },

    // === P1: 使用示例 ===
    examples: examples.length > 0 ? examples : [],

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
      repository: repository || undefined,
      changelog: changelog || undefined,
    },
  };
}

/**
 * 验证 MANIFEST 完整性（PRD v2.0 增强版）
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

  // === P0: 权限声明警告 ===
  const perms = manifest.permissions || {};
  if (perms.executeShell) {
    warnings.push("This agent requires shell execution permission — higher risk");
  }
  if (perms.networkAccess) {
    warnings.push("This agent accesses external network");
  }
  if (perms.writeFiles) {
    warnings.push("This agent writes to local files");
  }
  if (perms.requiresApiKey) {
    warnings.push("This agent requires an API key to function");
  }

  // === P1: 元数据完整性建议 ===
  if (!manifest.useCases?.solves && !manifest.useCases?.scenarios?.length) {
    warnings.push("Missing use-case information — consider adding useCases for better discoverability");
  }
  if (!manifest.examples || manifest.examples.length === 0) {
    warnings.push("No usage examples provided — consider adding 2-3 examples");
  }
  if (!manifest.metadata?.repository) {
    warnings.push("No repository URL — consider adding metadata.repository for trust");
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

/**
 * 获取权限的风险等级（用于前端展示）
 */
export function getPermissionRiskLevel(permissions) {
  if (!permissions) return "low";
  const { executeShell, networkAccess, writeFiles, requiresApiKey } = permissions;
  if (executeShell) return "high";
  if (networkAccess && writeFiles) return "high";
  if (networkAccess || writeFiles) return "medium";
  if (requiresApiKey) return "medium";
  return "low";
}

/**
 * 获取 Trust Badges（基于 manifest 自动推断）
 */
export function getTrustBadges(manifest) {
  const badges = [];
  const perms = manifest.permissions || {};
  const meta = manifest.metadata || {};

  // 正面标记
  if (meta.license && meta.license !== "UNLICENSED") badges.push({ id: "open-source", label: "Open Source", icon: "📖", type: "positive" });
  if (meta.repository) badges.push({ id: "verified-source", label: "Verified Source", icon: "✅", type: "positive" });
  if (!perms.requiresApiKey && (!manifest.requirements?.env || manifest.requirements.env.length === 0)) {
    badges.push({ id: "low-setup", label: "Low Setup", icon: "🟢", type: "positive" });
  }

  // 风险标记
  if (perms.requiresApiKey) badges.push({ id: "requires-api-key", label: "Requires API Key", icon: "🔑", type: "warning" });
  if (perms.executeShell) badges.push({ id: "executes-shell", label: "Executes Shell", icon: "⚠️", type: "danger" });
  if (perms.writeFiles) badges.push({ id: "writes-files", label: "Writes Files", icon: "📝", type: "warning" });
  if (perms.networkAccess) badges.push({ id: "network-access", label: "Network Access", icon: "🌐", type: "info" });

  return badges;
}
