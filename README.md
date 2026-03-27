<div align="center">

# 🤖 AgentHub

**Packaging, Publishing & Distribution Platform for OpenClaw Agents**

[![npm version](https://img.shields.io/npm/v/@zshuangmu/agenthub.svg)](https://www.npmjs.com/package/@zshuangmu/agenthub)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node: >=18](https://img.shields.io/badge/Node.js->=18-green.svg)](https://nodejs.org/)
[![GitHub Stars](https://img.shields.io/github/stars/itshaungmu/AgentHub?style=social)](https://github.com/itshaungmu/AgentHub)

**Turn your well-trained OpenClaw Agent into reusable, distributable, and upgradable standard assets**

🌐 **Live Demo**: [https://agenthub.cyou](https://agenthub.cyou/)

[English](README.md) | [中文](README_CN.md)

</div>

---

## 🎯 What is AgentHub?

AgentHub is a packaging and distribution platform designed specifically for **OpenClaw**, similar to:
- **Docker Hub** for Docker containers
- **npm** for Node.js packages

But focused on **OpenClaw Agent distribution and replication**.

### Core Capabilities

| Capability | Description |
|------------|-------------|
| 📦 **One-Click Packaging** | Package Agent's personality, memory, and skills into a standard Bundle |
| 🚀 **Publish & Distribute** | Publish to local or remote Registry, generate shareable links |
| ⚡ **One-Click Install** | Team members install via unified command, replicate complete Agent capabilities |
| 🔄 **Version Management** | Full support for upgrades, rollbacks, and verification |

### Who is it for?

- **✅ OpenClaw Team Users**: Unified distribution, version management, team reuse
- **✅ Agent Creators**: Package and share your well-trained Agents
- **✅ AI Power Users**: Quickly acquire Agent capabilities trained by others

### Who is it NOT for?

- ❌ Non-OpenClaw users (currently only supports OpenClaw)
- ❌ Those needing a Prompt collection (please use dedicated Prompt tools)
- ❌ Single Skill distribution (please use ClawHub)

## 🎯 Official Sample Agents

We provide 3 official sample Agents to help you get started quickly:

| Agent | Description | Use Cases |
|-------|-------------|-----------|
| **code-review-assistant** | Code Review Assistant | Code quality review, security vulnerability identification |
| **team-knowledge-assistant** | Team Knowledge Q&A | Project information retrieval, new employee onboarding |
| **product-doc-writer** | Product Documentation Writer | Feature docs, user guides, API documentation |

### Quick Try

```bash
# Package any sample Agent
agenthub pack --workspace ./samples/code-review-assistant --config ./samples/code-review-assistant/openclaw.json

# Publish and install
agenthub publish ./bundles/code-review-assistant-1.0.0.agent --registry ./.registry
agenthub install code-review-assistant --registry ./.registry --target-workspace ./workspace
```

## 📸 Screenshots

![AgentHub Web Interface](./docs/image.png)

## 🚀 3 Steps to Get Started

### Step 1: Installation

```bash
# Install globally via npm
npm install -g @zshuangmu/agenthub

# Or clone from source
git clone https://github.com/itshaungmu/AgentHub.git
cd AgentHub && npm install && npm link
```

### Step 2: Package and Publish Your Agent

```bash
# 1. Package your OpenClaw workspace
agenthub pack --workspace ./my-workspace --config openclaw.json

# Or specify a version number
agenthub pack --workspace ./my-workspace --config openclaw.json --version 2.0.0

# 2. Publish to Registry
agenthub publish ./bundles/my-agent.agent --registry ./.registry
```

### Step 3: Team Members Install and Use

```bash
# Team members install with one click
agenthub install my-agent --registry ./.registry --target-workspace ./workspace

# Or start the Web interface to browse
agenthub serve --registry ./.registry --port 3000
```

Visit http://localhost:3000 to see your Agent!

### 🎯 Try Sample Agents

We provide an official sample Agent for quick experience:

```bash
# 1. Clone the repository
git clone https://github.com/itshaungmu/AgentHub.git
cd AgentHub

# 2. Package the sample Agent
agenthub pack --workspace ./samples/code-review-assistant --config ./samples/code-review-assistant/openclaw.json

# 3. Publish to local Registry
agenthub publish ./bundles/code-review-assistant-1.0.0.agent --registry ./.registry

# 4. Install to your workspace
agenthub install code-review-assistant --registry ./.registry --target-workspace ./my-workspace

# 5. Verify installation
agenthub verify code-review-assistant --registry ./.registry --target-workspace ./my-workspace
```

---

## 📖 Command Documentation

### CLI Commands

| Command | Description |
|---------|-------------|
| `pack` | Package workspace as Agent Bundle (supports `--version` to specify version) |
| `publish` | Publish to local Registry |
| `publish-remote` | Publish to remote server |
| `search` | Search Agents in Registry |
| `info` | View Agent details |
| `install` | Install Agent to workspace |
| `list` | List installed Agents |
| `uninstall` | Uninstall an installed Agent |
| `verify` | Verify installed Agent integrity |
| `versions` | View Agent version history |
| `update` | Update Agent to latest version |
| `rollback` | Rollback Agent to specified version |
| `stats` | View Agent statistics |
| `doctor` | Diagnose AgentHub installation and environment issues |
| `serve` | Start Web + API services |
| `api` | Start API service only |
| `web` | Start Web frontend only |

### HTTP API

```bash
# Health check
curl http://localhost:3001/api/health

# List all Agents
curl http://localhost:3001/api/agents

# Search Agents
curl "http://localhost:3001/api/agents?q=react"

# Get Agent details
curl http://localhost:3001/api/agents/my-agent

# Download Agent Bundle
curl http://localhost:3001/api/agents/my-agent/download

# Get statistics
curl http://localhost:3001/api/stats

# Get download ranking
curl "http://localhost:3001/api/stats/ranking?limit=10"

# Publish Agent (POST)
curl -X POST http://localhost:3001/api/publish -H "Content-Type: application/json" -d '{"slug":"my-agent","version":"1.0.0"}'

# Upload and publish Agent (POST)
curl -X POST http://localhost:3001/api/publish-upload -H "Content-Type: application/json" -d '{"bundleData":"..."}'
```

### AI Auto-Discovery

Let your AI assistant automatically discover available Agents:

```bash
curl http://localhost:3001/api/skills/agenthub-discover
```

## 📚 Tutorial Documentation

| Tutorial | Description |
|----------|-------------|
| [3 Steps to Replicate Agent](./docs/quick-start-3-steps.md) | 10-minute quick start guide |
| [Team Distribution Guide](./docs/team-distribution-guide.md) | How to standardize team Agent distribution |
| [FAQ](./docs/faq.md) | Frequently asked questions |

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

## 🐳 Docker Deployment

```bash
# Production startup (inside container)
NODE_ENV=production node src/cli.js serve --registry ./.registry --port 3000 --host 0.0.0.0
```

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

- 🐛 [Report a Bug](https://github.com/itshaungmu/AgentHub/issues/new?template=bug_report.md)
- 💡 [Request a Feature](https://github.com/itshaungmu/AgentHub/issues/new?template=feature_request.md)
- 🔧 [Submit a PR](https://github.com/itshaungmu/AgentHub/pulls)

## 📄 License

[MIT License](LICENSE) © AgentHub Team

## 🙏 Acknowledgments

- Built for the [OpenClaw](https://github.com/openclaw) ecosystem
- Inspired by npm and Docker Hub

---

<div align="center">

**[⬆ Back to Top](#agenthub)**

Made with ❤️ by the AgentHub Team

</div>
