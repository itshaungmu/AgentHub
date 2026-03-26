#!/usr/bin/env node
/**
 * AgentHub CLI
 * AI Agent 打包与分发平台
 *
 * 根据 PRD v1.1 规范实现
 */

import {
  infoCommand,
  installCommand,
  verifyCommand,
  formatVerifyOutput,
  packCommand,
  publishCommand,
  publishRemoteCommand,
  serveCommand,
  searchCommand,
  apiCommand,
  webCommand,
  updateCommand,
  rollbackCommand,
  listCommand,
  formatListOutput,
  statsCommand,
  formatStatsOutput,
  versionsCommand,
  formatVersionsOutput,
  doctorCommand,
} from "./index.js";
import { uninstallCommand, formatUninstallOutput } from "./commands/uninstall.js";

import { success, error, warning, info as infoColor, highlight, muted, symbols } from "./lib/colors.js";
import { setVerbose, debug } from "./lib/debug.js";

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const VERSION = require("../package.json").version;

/**
 * 验证必需参数，如果缺失则打印错误并设置退出码
 * @param {string} arg - 要验证的参数
 * @param {string} message - 错误消息
 * @returns {boolean} 参数是否存在
 */
function requireArg(arg, message) {
  if (!arg) {
    console.error(error(message));
    process.exitCode = 1;
    return false;
  }
  return true;
}

function printHelp() {
  console.log(`
AgentHub v${VERSION} - AI Agent 打包与分发平台

用法:
  agenthub <command> [options]

命令:
  pack        打包 OpenClaw 工作区为 Agent Bundle
  publish     发布 Bundle 到本地 Registry
  publish-remote  发布 Bundle 到远程服务器
  install     安装 Agent 到目标工作区（默认当前目录）
  search      搜索 Registry 中的 Agent
  info        查看 Agent 详情
  list        列出当前目录/指定目录的已安装 Agent
  uninstall   卸载已安装的 Agent
  verify      校验已安装 Agent 是否完整可用
  versions    查看 Agent 版本历史
  update      更新已安装 Agent 到最新版
  rollback    回滚已安装 Agent 到指定版本
  stats       查看 Agent 统计信息
  doctor      诊断 AgentHub 安装和环境问题
  serve       启动 Web + API 服务

选项:
  --help, -h      显示帮助信息
  --version, -v   显示版本号
  --verbose       显示详细日志信息

详细帮助:
  agenthub <command> --help

示例:
  # 打包 Agent
  agenthub pack --workspace ./my-workspace --config openclaw.json --output ./bundles

  # 发布 Agent
  agenthub publish ./bundles/my-agent.agent --registry ./.registry

  # 安装 Agent
  agenthub install my-agent --registry ./.registry --target-workspace ./workspace

  # 搜索 Agent
  agenthub search "code review" --registry ./.registry

  # 启动完整服务（前端+后端）
  agenthub serve --registry ./.registry --port 3000

`);
}

function printCommandHelp(command) {
  const helps = {
    pack: `
agenthub pack - 打包 Agent

用法:
  agenthub pack --workspace <dir> --config <file> --output <dir>

选项:
  --workspace <dir>   OpenClaw 工作区目录 (必需)
  --config <file>     openclaw.json 配置文件路径 (必需)
  --output <dir>      输出目录 (默认: ./bundles)
  --name <name>       Agent 名称 (默认: 工作区目录名)
  --version <ver>     版本号 (默认: 1.0.0)
  --tags <tags>       标签，逗号分隔
  --category <cat>    分类
  --featured          标记为精选 Agent

示例:
  agenthub pack --workspace ./my-agent --config ./openclaw.json
  agenthub pack --workspace ./my-agent --config ./openclaw.json --version 2.0.0
  agenthub pack --workspace ./my-agent --config ./openclaw.json --name "Code Helper" --featured
`,
    publish: `
agenthub publish - 发布 Agent

用法:
  agenthub publish <bundle-dir> --registry <dir>

选项:
  --registry <dir>    Registry 目录 (必需)

示例:
  agenthub publish ./bundles/my-agent.agent --registry ./.registry
`,
    install: `
agenthub install - 安装 Agent

用法:
  agenthub install <agent-slug>[:version] [--registry <dir> | --server <url>] --target-workspace <dir>

选项:
  --registry <dir>          本地 Registry 目录（与 --server 二选一）
  --server <url>            远程服务器地址（默认: https://agenthub.cyou）
  --target-workspace <dir>  目标工作区目录 (必需)
  --force                   强制覆盖

示例:
  agenthub install code-review-assistant --registry ./.registry --target-workspace ./workspace
  agenthub install my-agent:1.0.0 --server https://agenthub.cyou --target-workspace ./workspace
  agenthub install meeting-minutes-assistant --target-workspace ./workspace
`,
    search: `
agenthub search - 搜索 Agent

用法:
  agenthub search <query> --registry <dir>

选项:
  --registry <dir>    Registry 目录 (必需)
  --json              JSON 格式输出

示例:
  agenthub search "code review" --registry ./.registry
  agenthub search "" --registry ./.registry  # 列出所有
  agenthub search "code" --registry ./.registry --json
`,
    list: `
agenthub list - 列出已安装 Agent

用法:
  agenthub list [--target-workspace <dir>] [--json]

选项:
  --target-workspace <dir>  指定工作区目录（可选）
  --json                    JSON 格式输出

示例:
  agenthub list
  agenthub list --target-workspace ./my-workspace
  agenthub list --json
  agenthub list --target-workspace ./my-workspace
`,
    uninstall: `
agenthub uninstall - 卸载已安装 Agent

用法:
  agenthub uninstall <agent-slug> [--target-workspace <dir>]

选项:
  --target-workspace <dir>  指定工作区目录（可选）

示例:
  agenthub uninstall my-agent
  agenthub uninstall my-agent --target-workspace ./my-workspace
`,
    verify: `
agenthub verify - 校验已安装 Agent

用法:
  agenthub verify [agent-slug] [--registry <dir> | --server <url>] [--target-workspace <dir>]

选项:
  --registry <dir>          本地 Registry 目录（与 --server 二选一）
  --server <url>            远程服务器地址（默认: https://agenthub.cyou）
  --target-workspace <dir>  目标工作区目录（默认当前目录）

示例:
  agenthub verify workspace --registry ./.registry --target-workspace ./my-workspace
  agenthub verify workspace --server https://agenthub.cyou --target-workspace ./my-workspace
`,
    versions: `
agenthub versions - 查看版本历史

用法:
  agenthub versions <agent-slug> [--registry <dir> | --server <url>]

选项:
  --registry <dir>          本地 Registry 目录（与 --server 二选一）
  --server <url>            远程服务器地址（默认: https://agenthub.cyou）

示例:
  agenthub versions workspace --registry ./.registry
  agenthub versions workspace --server https://agenthub.cyou
`,
    update: `
agenthub update - 更新 Agent 到最新版

用法:
  agenthub update <agent-slug> [--registry <dir> | --server <url>] --target-workspace <dir>

选项:
  --registry <dir>          本地 Registry 目录（与 --server 二选一）
  --server <url>            远程服务器地址（默认: https://agenthub.cyou）
  --target-workspace <dir>  目标工作区目录 (必需)

示例:
  agenthub update workspace --registry ./.registry --target-workspace ./my-workspace
  agenthub update workspace --server https://agenthub.cyou --target-workspace ./my-workspace
`,
    rollback: `
agenthub rollback - 回滚 Agent 到指定版本

用法:
  agenthub rollback <agent-slug> --to <version> [--registry <dir> | --server <url>] --target-workspace <dir>

选项:
  --to <version>            目标版本 (必需)
  --registry <dir>          本地 Registry 目录（与 --server 二选一）
  --server <url>            远程服务器地址（默认: https://agenthub.cyou）
  --target-workspace <dir>  目标工作区目录 (必需)

示例:
  agenthub rollback workspace --to 1.0.0 --registry ./.registry --target-workspace ./my-workspace
  agenthub rollback workspace --to 1.0.0 --server https://agenthub.cyou --target-workspace ./my-workspace
`,
    stats: `
agenthub stats - 查看 Agent 统计信息

用法:
  agenthub stats <agent-slug> --registry <dir>

选项:
  --registry <dir>    Registry 目录 (必需)

示例:
  agenthub stats workspace --registry ./.registry
`,
    doctor: `
agenthub doctor - 诊断 AgentHub 安装和环境问题

用法:
  agenthub doctor [options]

选项:
  --full      运行完整诊断（包括测试套件）
  --no-network  跳过网络连接检查
  --server <url>  指定服务器地址检查（默认: https://agenthub.cyou）

示例:
  agenthub doctor
  agenthub doctor --full
  agenthub doctor --no-network
`,
    serve: `
agenthub serve - 启动完整服务（前端+后端）

用法:
  agenthub serve --registry <dir> --port <port>

选项:
  --registry <dir>    Registry 目录 (必需)
  --port <port>       前端端口号 (默认: 3000)
  --api-port <port>   后端 API 端口号 (默认: 3001)
  --host <host>       监听地址 (默认: 0.0.0.0)

示例:
  agenthub serve --registry ./.registry --port 3000
  agenthub serve --registry ./.registry --host 127.0.0.1
`,
    api: `
agenthub api - 仅启动 API 后端服务

用法:
  agenthub api --registry <dir> --port <port>

选项:
  --registry <dir>    Registry 目录 (必需)
  --port <port>       API 端口号 (默认: 3001)
  --host <host>       监听地址 (默认: 0.0.0.0)

示例:
  agenthub api --registry ./.registry --port 3001
`,
    web: `
agenthub web - 仅启动 Web 前端服务

用法:
  agenthub web --port <port> --api-base <url>

选项:
  --port <port>       Web 端口号 (默认: 3000)
  --api-base <url>    API 服务地址 (默认: http://127.0.0.1:3001)
  --host <host>       监听地址 (默认: 0.0.0.0)

示例:
  agenthub web --port 3000 --api-base http://127.0.0.1:3001
`,
  };

  console.log(helps[command] || `未知命令: ${command}`);
}

function parseArgs(argv) {
  const positionals = [];
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token.startsWith("--")) {
      const rawKey = token.slice(2);
      const camelKey = rawKey.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      const value = argv[index + 1];
      if (value && !value.startsWith("-")) {
        options[rawKey] = value;
        options[camelKey] = value;
        index += 1;
      } else {
        options[rawKey] = true;
        options[camelKey] = true;
      }
    } else if (token === "-h") {
      options.help = true;
    } else if (token === "-v") {
      options.version = true;
    } else {
      positionals.push(token);
    }
  }
  return { positionals, options };
}

async function main() {
  const { positionals, options } = parseArgs(process.argv.slice(2));
  const [command, ...rest] = positionals;

  // 设置 verbose 模式
  if (options.verbose) {
    setVerbose(true);
    debug("Verbose mode enabled");
  }

  // 全局选项 - only show version if --version/-v is a boolean flag, not a string value
  if (options.version === true) {
    console.log(`AgentHub v${VERSION}`);
    return;
  }

  if (!command) {
    printHelp();
    return;
  }

  // 命令帮助
  if (options.help) {
    printCommandHelp(command);
    return;
  }

  // 命令路由
  try {
    switch (command) {
      case "pack": {
        if (!options.workspace || !options.config) {
          console.error(error("错误: --workspace 和 --config 是必需的"));
          console.log(muted("\n运行 'agenthub pack --help' 查看帮助"));
          process.exitCode = 1;
          return;
        }
        const result = await packCommand(options);
        console.log(success(`${symbols.success} 打包完成: ${result.bundleDir}`));
        return;
      }

      case "publish": {
        if (!requireArg(rest[0], "错误: 需要指定 bundle 目录")) return;
        const result = await publishCommand(rest[0], options);
        console.log(success(`${symbols.success} 已发布 ${highlight(`${result.slug}@${result.version}`)}`));
        return;
      }

      case "publish-remote": {
        if (!requireArg(rest[0], "错误: 需要指定 bundle 目录")) return;
        const result = await publishRemoteCommand(rest[0], options);
        console.log(success(`${symbols.success} 已发布到远程 ${highlight(`${result.slug}@${result.version}`)}`));
        return;
      }

      case "search": {
        const results = await searchCommand(rest[0] || "", options);
        if (options.json) {
          console.log(JSON.stringify({ agents: results, count: results.length, query: rest[0] || "" }, null, 2));
        } else if (results.length === 0) {
          console.log(warning("未找到匹配的 Agent"));
        } else {
          console.log(`\n${infoColor(`找到 ${results.length} 个 Agent:`)}\n`);
          for (const entry of results) {
            console.log(`  ${highlight(entry.slug)}${muted("@")}${entry.version} ${muted("-")} ${entry.description || ""}`);
          }
        }
        return;
      }

      case "info": {
        if (!requireArg(rest[0], "错误: 需要指定 agent slug")) return;
        const result = await infoCommand(rest[0], options);
        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`\n${highlight("📦")} ${result.name} (${result.slug}@${result.version})`);
          console.log(`   ${result.description}`);
          console.log(`   ${muted("Runtime:")} ${result.runtime?.type || "openclaw"} ${result.runtime?.version || ""}`);
          const mem = result.includes?.memory || {};
          if (mem.count > 0) {
            console.log(`   ${muted("Memory:")} ${mem.count} 条 (public: ${mem.public}, portable: ${mem.portable})`);
          }
          console.log(`\n   ${infoColor("安装命令:")} agenthub install ${result.slug}`);
        }
        return;
      }

      case "install": {
        if (!requireArg(rest[0], "错误: 需要指定 agent slug")) return;
        console.log(`\n${infoColor("📥 正在安装")} ${highlight(rest[0])}...\n`);
        const installResult = await installCommand(rest[0], options);
        console.log(success(`${symbols.success} 已安装 ${highlight(`${installResult.manifest.slug}@${installResult.manifest.version}`)}`));
        console.log(`  ${muted("位置:")} ${options.targetWorkspace || "当前目录"}`);
        return;
      }

      case "list": {
        const list = await listCommand(options);
        if (options.json) {
          console.log(JSON.stringify({ agents: list, count: list.length }, null, 2));
        } else {
          console.log(formatListOutput(list));
        }
        return;
      }

      case "uninstall": {
        if (!requireArg(rest[0], "错误: 需要指定 agent slug")) return;
        const result = await uninstallCommand(rest[0], options);
        console.log(formatUninstallOutput(result));
        return;
      }

      case "verify": {
        const result = await verifyCommand(rest[0], options);
        console.log(formatVerifyOutput(result));
        if (!result.verified) {
          process.exitCode = 1;
        }
        return;
      }

      case "versions": {
        if (!requireArg(rest[0], "错误: 需要指定 agent slug")) return;
        const versions = await versionsCommand(rest[0], options);
        console.log(formatVersionsOutput(rest[0], versions));
        return;
      }

      case "update": {
        if (!requireArg(rest[0], "错误: 需要指定 agent slug")) return;
        const updateResult = await updateCommand(rest[0], options);
        console.log(updateResult.message);
        return;
      }

      case "rollback": {
        if (!requireArg(rest[0], "错误: 需要指定 agent slug")) return;
        const rollbackResult = await rollbackCommand(rest[0], options);
        console.log(rollbackResult.message);
        return;
      }

      case "stats": {
        if (!requireArg(rest[0], "错误: 需要指定 agent slug")) return;
        const stats = await statsCommand(rest[0], options);
        console.log(formatStatsOutput(stats));
        return;
      }

      case "doctor": {
        const result = await doctorCommand(options);
        if (!result.healthy) {
          process.exitCode = 1;
        }
        return;
      }

      case "serve": {
        const result = await serveCommand(options);
        console.log(success(`Server listening at ${result.baseUrl}`));
        console.log(`\n${highlight("🌐 AgentHub 服务已启动")}`);
        console.log(`   ${muted("地址:")} ${result.baseUrl}`);
        console.log(`   ${muted("API:")}  ${result.baseUrl}/api/agents`);
        console.log(`\n${muted("按 Ctrl+C 停止服务")}\n`);

        const shutdown = async () => {
          process.off("SIGINT", shutdown);
          process.off("SIGTERM", shutdown);
          await result.close();
          process.exit(0);
        };
        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
        return;
      }

      case "api": {
        const port = options.port || "3001";
        const result = await apiCommand({ ...options, port });
        console.log(success(`Server listening at ${result.baseUrl}`));
        console.log(`\n${highlight("🔧 API 服务已启动")}`);
        console.log(`   ${muted("地址:")} ${result.baseUrl}`);
        console.log(`   ${muted("端点:")} ${result.baseUrl}/api/agents`);
        console.log(`   ${muted("统计:")} ${result.baseUrl}/api/stats`);
        console.log(`\n${muted("按 Ctrl+C 停止服务")}\n`);

        const shutdown = async () => {
          process.off("SIGINT", shutdown);
          process.off("SIGTERM", shutdown);
          await result.close();
          process.exit(0);
        };
        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
        return;
      }

      case "web": {
        const port = options.port || "3000";
        const apiBase = options.apiBase || "http://127.0.0.1:3001";
        const host = options.host || "0.0.0.0";
        const result = await webCommand({ port, apiBase, host });
        console.log(success(`Server listening at ${result.baseUrl}`));
        console.log(`\n${highlight("🌐 Web 服务已启动")}`);
        console.log(`   ${muted("地址:")} ${result.baseUrl}`);
        console.log(`   ${muted("API:")}  ${apiBase}`);
        console.log(`\n${muted("按 Ctrl+C 停止服务")}\n`);

        const shutdown = async () => {
          process.off("SIGINT", shutdown);
          process.off("SIGTERM", shutdown);
          await result.close();
          process.exit(0);
        };
        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);
        return;
      }

      default:
        console.error(error(`未知命令: ${command}`));
        console.log(muted("\n运行 'agenthub --help' 查看可用命令"));
        process.exitCode = 1;
    }
  } catch (err) {
    // 提取更详细的错误信息
    const causeMsg = err.cause?.errors?.[0]?.message || err.cause?.message || "";
    const detailMsg = causeMsg ? `${err.message}\n   原因: ${causeMsg}` : err.message;
    console.error(`\n${error(`${symbols.error} 错误:`)} ${detailMsg}`);

    // 提供友好的解决建议
    const errMsg = err.message.toLowerCase();
    if (errMsg.includes("not found") || errMsg.includes("does not exist") || errMsg.includes("enoent")) {
      console.log(`\n${warning("建议:")}`);
      console.log(`  - 检查文件路径是否正确`);
      console.log(`  - 确认 workspace 目录存在`);
      console.log(`  - 运行 ${highlight("agenthub --help")} 查看命令用法`);
    } else if (errMsg.includes("permission") || errMsg.includes("eacces")) {
      console.log(`\n${warning("建议:")}`);
      console.log(`  - 检查文件权限`);
      console.log(`  - 尝试使用 ${highlight("sudo")} 命令`);
    } else if (errMsg.includes("network") || errMsg.includes("econnrefused") || errMsg.includes("timeout") || errMsg.includes("fetch failed")) {
      console.log(`\n${warning("建议:")}`);
      console.log(`  - 检查网络连接`);
      console.log(`  - 确认服务器地址正确`);
      console.log(`  - 使用 ${highlight("--registry")} 指定本地 registry`);
      console.log(`  - 运行 ${highlight("agenthub doctor")} 诊断环境问题`);
    } else if (errMsg.includes("agent not found") || errMsg.includes("no agent")) {
      console.log(`\n${warning("建议:")}`);
      console.log(`  - 运行 ${highlight("agenthub search")} 查看可用 Agent`);
      console.log(`  - 检查 Agent 名称拼写`);
      console.log(`  - 确认使用正确的 --registry 路径`);
    } else if (errMsg.includes("invalid") || errMsg.includes("validation")) {
      console.log(`\n${warning("建议:")}`);
      console.log(`  - 检查配置文件格式 (openclaw.json)`);
      console.log(`  - 确认 workspace 包含必需文件 (AGENTS.md, SOUL.md 等)`);
      console.log(`  - 运行 ${highlight("agenthub verify")} 检查安装完整性`);
    } else if (errMsg.includes("version") || errMsg.includes("already")) {
      console.log(`\n${warning("建议:")}`);
      console.log(`  - 运行 ${highlight("agenthub versions <agent>")} 查看可用版本`);
      console.log(`  - 使用 ${highlight("--force")} 强制覆盖安装`);
      console.log(`  - 运行 ${highlight("agenthub list")} 查看已安装的 Agent`);
    }

    console.log(`\n${muted("如需更多帮助:")}`);
    console.log(`${muted("  - 运行: agenthub <command> --help")}`);
    console.log(`${muted("  - 诊断: agenthub doctor")}`);
    process.exitCode = 1;
  }
}

main();
