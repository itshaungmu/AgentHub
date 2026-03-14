<div align="center">

# 🤖 AgentHub

**The Open Source Marketplace for AI Agents**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node: >=18](https://img.shields.io/badge/Node.js->=18-green.svg)](https://nodejs.org/)
[![GitHub Stars](https://img.shields.io/github/stars/agenthub/agenthub?style=social)](https://github.com/agenthub/agenthub)

**Package and upload your Agent's full capabilities in one command.<br>Download and gain those powers with one click.**

[English](README.md) | [中文](README_CN.md)

</div>

---

## 🎯 What is AgentHub?

AgentHub is an open-source platform for packaging and distributing AI Agents. It allows you to:

- **📦 Package** your Agent's personality, memory, and skills into a single bundle
- **🚀 Publish** to a local or remote registry with one command
- **🔍 Discover** and search agents from the marketplace
- **⚡ Install** agents to any workspace instantly

Perfect for teams who want to share AI capabilities across projects, or individuals who want to backup and version their agent configurations.

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📦 **One-Click Packaging** | Automatically scan workspace and package Agent capabilities |
| 🚀 **Local-First** | No cloud required, runs entirely on your machine |
| 🌐 **Web Interface** | Beautiful dark-themed UI with i18n support (EN/中文) |
| 🔐 **Memory Layers** | Three-tier memory: public, portable, private |
| 🔄 **Version Control** | Full version history with rollback support |
| 📊 **Analytics** | Built-in download tracking and statistics |

## 📸 Screenshots

![alt text](./docs/image.png)
## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/agenthub/agenthub.git
cd agenthub

# Install dependencies
npm install

# Link globally (optional)
npm link
```

### Basic Usage

```bash
# 1. Pack your agent
agenthub pack --workspace ./my-agent --config openclaw.json

# 2. Publish to registry
agenthub publish ./bundles/my-agent.agent --registry ./.registry

# 3. Start web interface
agenthub serve --registry ./.registry --port 3000
```

Visit http://localhost:3000 to see your agents!

## 📖 Documentation

### Commands

| Command | Description |
|---------|-------------|
| `pack` | Pack workspace into Agent Bundle |
| `publish` | Publish to local registry |
| `publish-remote` | Publish to remote server |
| `search` | Search agents in registry |
| `info` | View agent details |
| `install` | Install agent to workspace |
| `serve` | Start web + API service |
| `api` | Start API server only |
| `web` | Start web frontend only |

### HTTP API

```bash
# List all agents
curl http://localhost:3001/api/agents

# Search agents
curl "http://localhost:3001/api/agents?q=react"

# Get agent details
curl http://localhost:3001/api/agents/my-agent

# Get statistics
curl http://localhost:3001/api/stats
```

### AI Auto-Discovery

Let your AI assistant automatically discover available agents:

```bash
curl http://localhost:3001/api/skills/agenthub-discover
```

## 🏗️ Architecture

```
┌─────────────────┐     pack      ┌─────────────────┐    publish    ┌─────────────────┐
│   OpenClaw      │  ──────────►  │    Bundle       │  ──────────►  │    Registry     │
│   Workspace     │               │   (*.agent)     │               │   (.registry)   │
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

## 🧪 Development

```bash
# Run tests
npm test

# Start development server
node src/cli.js serve --registry ./.registry
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

- 🐛 [Report a Bug](https://github.com/agenthub/agenthub/issues/new?template=bug_report.md)
- 💡 [Request a Feature](https://github.com/agenthub/agenthub/issues/new?template=feature_request.md)
- 🔧 [Submit a Pull Request](https://github.com/agenthub/agenthub/pulls)

## 📄 License

[MIT License](LICENSE) © AgentHub Team

## 🙏 Acknowledgments

- Built for [OpenClaw](https://github.com/openclaw) ecosystem
- Inspired by npm and Docker Hub

---

<div align="center">

**[⬆ Back to Top](#agenthub)**

Made with ❤️ by the AgentHub Team

</div>
