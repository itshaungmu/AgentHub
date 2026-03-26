/**
 * Doctor Command
 * 诊断 AgentHub 安装和环境问题
 */

import { execSync } from "node:child_process";
import { access, constants, readFile } from "node:fs/promises";
import path from "node:path";
import { success, error, warning, info as infoColor, highlight, muted } from "../lib/colors.js";

const PROJECT_ROOT = path.resolve(import.meta.dirname, "../..");

/**
 * 检查 Node.js 版本
 */
function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split(".")[0], 10);
  const required = 18;
  const passed = major >= required;
  return {
    name: "Node.js 版本",
    passed,
    message: passed
      ? `${version} (需要 >= ${required})`
      : `${version} (需要 >= ${required})`,
    severity: passed ? "ok" : "error",
    fix: passed ? null : `升级 Node.js 到 v${required} 或更高版本`,
  };
}

/**
 * 检查 npm 包安装
 */
async function checkNpmPackage() {
  try {
    const packageJson = await readFile(
      path.join(PROJECT_ROOT, "package.json"),
      "utf8"
    );
    const pkg = JSON.parse(packageJson);
    return {
      name: "AgentHub 包",
      passed: true,
      message: `v${pkg.version} 已安装`,
      severity: "ok",
      fix: null,
    };
  } catch {
    return {
      name: "AgentHub 包",
      passed: false,
      message: "无法读取 package.json",
      severity: "error",
      fix: "重新安装 AgentHub: npm install -g @zshuangmu/agenthub",
    };
  }
}

/**
 * 检查 CLI 可执行文件
 */
async function checkCliExecutable() {
  try {
    const result = execSync("node src/cli.js --version", {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    const version = result.trim();
    return {
      name: "CLI 可执行文件",
      passed: true,
      message: version,
      severity: "ok",
      fix: null,
    };
  } catch (err) {
    return {
      name: "CLI 可执行文件",
      passed: false,
      message: "CLI 无法执行",
      severity: "error",
      fix: "检查 Node.js 安装和文件权限",
    };
  }
}

/**
 * 检查测试套件
 */
async function checkTests() {
  try {
    const result = execSync("npm test", {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 30000,
    });
    const match = result.match(/ℹ tests (\d+).*ℹ pass (\d+).*ℹ fail (\d+)/s);
    if (match) {
      const [, total, passed, failed] = match;
      const passRate = (parseInt(passed, 10) / parseInt(total, 10)) * 100;
      return {
        name: "测试套件",
        passed: parseInt(failed, 10) === 0,
        message: `${passed}/${total} 通过 (${passRate.toFixed(0)}%)`,
        severity: parseInt(failed, 10) > 0 ? "warning" : "ok",
        fix: parseInt(failed, 10) > 0 ? "运行 npm test 查看失败详情" : null,
      };
    }
    return {
      name: "测试套件",
      passed: true,
      message: "测试通过",
      severity: "ok",
      fix: null,
    };
  } catch (err) {
    return {
      name: "测试套件",
      passed: false,
      message: "测试执行失败",
      severity: "warning",
      fix: "运行 npm test 查看失败详情",
    };
  }
}

/**
 * 检查样本 Agent
 */
async function checkSampleAgents() {
  const samplesDir = path.join(PROJECT_ROOT, "samples");
  const expectedSamples = [
    "code-review-assistant",
    "team-knowledge-assistant",
    "product-doc-writer",
  ];
  const results = [];

  for (const sample of expectedSamples) {
    const samplePath = path.join(samplesDir, sample);
    try {
      await access(samplePath, constants.R_OK);
      results.push({ name: sample, exists: true });
    } catch {
      results.push({ name: sample, exists: false });
    }
  }

  const existing = results.filter((r) => r.exists).length;
  const passed = existing === expectedSamples.length;

  return {
    name: "样本 Agent",
    passed,
    message: `${existing}/${expectedSamples.length} 可用`,
    severity: passed ? "ok" : "warning",
    fix: passed ? null : `缺失样本: ${results
      .filter((r) => !r.exists)
      .map((r) => r.name)
      .join(", ")}`,
  };
}

/**
 * 检查文档
 */
async function checkDocumentation() {
  const docsDir = path.join(PROJECT_ROOT, "docs");
  const expectedDocs = [
    "faq.md",
    "growth-plan.md",
    "team-distribution-guide.md",
    "quick-start-3-steps.md",
  ];
  const results = [];

  for (const doc of expectedDocs) {
    const docPath = path.join(docsDir, doc);
    try {
      await access(docPath, constants.R_OK);
      results.push({ name: doc, exists: true });
    } catch {
      results.push({ name: doc, exists: false });
    }
  }

  const existing = results.filter((r) => r.exists).length;
  const passed = existing >= expectedDocs.length - 1; // 允许缺少1个

  return {
    name: "文档完整性",
    passed,
    message: `${existing}/${expectedDocs.length} 文档可用`,
    severity: passed ? "ok" : "warning",
    fix: passed ? null : `检查 docs/ 目录`,
  };
}

/**
 * 检查网络连接 (可选)
 */
async function checkNetworkConnection(serverUrl) {
  const url = serverUrl || "https://agenthub.cyou";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    return {
      name: "网络连接",
      passed: response.ok,
      message: `${url} - ${response.status}`,
      severity: response.ok ? "ok" : "warning",
      fix: response.ok ? null : "检查网络连接或服务器状态",
    };
  } catch (err) {
    return {
      name: "网络连接",
      passed: false,
      message: `${url} - 连接失败`,
      severity: "warning",
      fix: "检查网络连接或稍后重试",
    };
  }
}

/**
 * 运行所有诊断检查
 */
export async function doctorCommand(options) {
  const checks = [];

  console.log(`\n${highlight("🔍 AgentHub 诊断检查")}\n`);
  console.log(`${muted("检查 AgentHub 安装和环境配置...")}\n`);

  // 基础检查
  checks.push(checkNodeVersion());
  checks.push(await checkNpmPackage());
  checks.push(await checkCliExecutable());

  // 测试检查
  if (options.full) {
    checks.push(await checkTests());
  }

  // 内容检查
  checks.push(await checkSampleAgents());
  checks.push(await checkDocumentation());

  // 网络检查
  if (options.network !== false) {
    checks.push(await checkNetworkConnection(options.server));
  }

  // 输出结果
  let passed = 0;
  let warnings = 0;
  let errors = 0;

  for (const check of checks) {
    let symbol;
    let colorFn;
    switch (check.severity) {
      case "ok":
        symbol = "✅";
        colorFn = success;
        passed++;
        break;
      case "warning":
        symbol = "⚠️";
        colorFn = warning;
        warnings++;
        break;
      case "error":
        symbol = "❌";
        colorFn = error;
        errors++;
        break;
    }

    console.log(`  ${symbol} ${check.name}: ${colorFn(check.message)}`);
    if (check.fix) {
      console.log(`      ${muted("建议:")} ${check.fix}`);
    }
  }

  // 总结
  console.log(`\n${muted("─".repeat(40))}\n`);

  const total = checks.length;
  if (errors === 0 && warnings === 0) {
    console.log(success(`🎉 所有检查通过！(${passed}/${total})`));
    console.log(`${infoColor("AgentHub 已就绪，可以正常使用。")}\n`);
  } else if (errors === 0) {
    console.log(warning(`⚠️  检查完成，有 ${warnings} 个警告 (${passed}/${total} 通过)`));
    console.log(`${infoColor("AgentHub 可以使用，但建议解决上述警告。")}\n`);
  } else {
    console.log(error(`❌ 检查失败，有 ${errors} 个错误 (${passed}/${total} 通过)`));
    console.log(`${infoColor("请先解决上述错误再使用 AgentHub。")}\n`);
  }

  return {
    passed,
    warnings,
    errors,
    total,
    healthy: errors === 0,
    checks,
  };
}

/**
 * 格式化输出
 */
export function formatDoctorOutput(result) {
  const lines = [];
  lines.push(`\n${highlight("🔍 AgentHub 诊断检查")}\n`);
  lines.push(`${muted("检查结果:")} ${result.passed}/${result.total} 通过\n`);

  if (result.healthy) {
    lines.push(success("✅ AgentHub 健康状态良好"));
  } else {
    lines.push(error("❌ AgentHub 需要修复"));
  }

  return lines.join("\n");
}
