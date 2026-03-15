<div align="center">

# 🤖 AgentHub

**AI Agent 的开源应用市场**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node: >=18](https://img.shields.io/badge/Node.js->=18-green.svg)](https://nodejs.org/)
[![GitHub Stars](https://img.shields.io/github/stars/agenthub/agenthub?style=social)](https://github.com/agenthub/agenthub)

**一句话打包上传 Agent 的全部能力（性格、记忆、技能）<br>一键下载获得这些功力**

🌐 **在线体验**: [https://agenthub.cyou](https://agenthub.cyou/)

[English](README.md) | [中文](README_CN.md)

</div>

---

## 🎯 AgentHub 是什么？

AgentHub 是一个开源的 AI Agent 打包与分发平台。它可以让你：

- **📦 打包** Agent 的性格、记忆和技能到一个 Bundle
- **🚀 发布** 到本地或远程仓库，只需一条命令
- **🔍 发现** 和搜索市场上的 Agent
- **⚡ 安装** Agent 到任何工作区，即刻可用

非常适合想要在项目间共享 AI 能力的团队，或者想要备份和版本管理 Agent 配置的个人用户。

## ✨ 特性

| 特性 | 说明 |
|------|------|
| 📦 **一键打包** | 自动扫描工作区，打包 Agent 能力 |
| 🚀 **本地优先** | 无需云端，完全在本地运行 |
| 🌐 **Web 界面** | 精美的深色主题 UI，支持中英文切换 |
| 🔐 **记忆分层** | 三层记忆架构：公开、可移植、私有 |
| 🔄 **版本管理** | 完整的版本历史，支持回滚 |
| 📊 **数据统计** | 内置下载追踪和统计分析 |

## 📸 截图

![alt text](image-cn.png)

## 🚀 快速开始

### 安装

```bash
# 克隆仓库
git clone https://github.com/agenthub/agenthub.git
cd agenthub

# 安装依赖
npm install

# 链接到全局（可选）
npm link
```

### 基本使用

```bash
# 1. 打包你的 Agent
agenthub pack --workspace ./my-agent --config openclaw.json

# 2. 发布到仓库
agenthub publish ./bundles/my-agent.agent --registry ./.registry

# 3. 启动 Web 界面
agenthub serve --registry ./.registry --port 3000
```

访问 http://localhost:3000 查看你的 Agent！

## 📖 文档

### 命令

| 命令 | 说明 |
|------|------|
| `pack` | 打包工作区为 Agent Bundle |
| `publish` | 发布到本地仓库 |
| `publish-remote` | 发布到远程服务器 |
| `search` | 搜索仓库中的 Agent |
| `info` | 查看 Agent 详情 |
| `install` | 安装 Agent 到工作区 |
| `serve` | 启动 Web + API 服务 |
| `api` | 仅启动 API 服务 |
| `web` | 仅启动 Web 前端 |

### HTTP API

```bash
# 获取所有 Agent
curl http://localhost:3001/api/agents

# 搜索 Agent
curl "http://localhost:3001/api/agents?q=react"

# 获取 Agent 详情
curl http://localhost:3001/api/agents/my-agent

# 获取统计数据
curl http://localhost:3001/api/stats
```

### AI 自动发现

让你的 AI 助手自动发现可用的 Agent：

```bash
curl http://localhost:3001/api/skills/agenthub-discover
```

## 🏗️ 架构

```
┌─────────────────┐     pack      ┌─────────────────┐    publish    ┌─────────────────┐
│   OpenClaw      │  ──────────►  │    Bundle       │  ──────────►  │    Registry     │
│   工作区         │               │   (*.agent)     │               │   (.registry)   │
└─────────────────┘               └─────────────────┘               └─────────────────┘
                                                                          │
                                          ┌───────────────────────────────┘
                                          │
                                          ▼
                                  ┌─────────────────┐
                                  │   AgentHub      │
                                  │   Web + API     │
                                  └─────────────────┘
```

## 🧪 开发

```bash
# 运行测试
npm test

# 启动开发服务器
node src/cli.js serve --registry ./.registry
```

## 🤝 贡献

我们欢迎各种形式的贡献！详情请查看 [CONTRIBUTING.md](CONTRIBUTING.md)。

- 🐛 [报告 Bug](https://github.com/agenthub/agenthub/issues/new?template=bug_report.md)
- 💡 [功能建议](https://github.com/agenthub/agenthub/issues/new?template=feature_request.md)
- 🔧 [提交 PR](https://github.com/agenthub/agenthub/pulls)

## 📄 许可证

[MIT License](LICENSE) © AgentHub Team

## 🙏 致谢

- 为 [OpenClaw](https://github.com/openclaw) 生态构建
- 灵感来源于 npm 和 Docker Hub

---

<div align="center">

**[⬆ 返回顶部](#agenthub)**

由 AgentHub 团队用 ❤️ 制作

</div>
