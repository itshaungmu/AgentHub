# AgentHub Discover Skill

让 AI Agent 能够自动发现、安装其他 Agent，并贡献自己的 Agent 到 AgentHub。

## 能力

当 AI Agent 加载此技能后，可以：

1. **发现 Agent** - 浏览和搜索 AgentHub 上的所有 Agent
2. **安装 Agent** - 根据用户需求自动安装合适的 Agent
3. **贡献 Agent** - 打包自己的能力并发布到 AgentHub

## 使用方法

### 1. 发现 Agent

```bash
# 列出所有 Agent
curl -s http://127.0.0.1:3456/api/agents | jq '.agents[] | {slug, name, version, description}'

# 搜索 Agent
curl -s "http://127.0.0.1:3456/api/agents?q=关键词" | jq '.agents[]'

# 获取 Agent 详情
curl -s http://127.0.0.1:3456/api/agents/<slug> | jq .
```

### 2. 安装 Agent

```bash
# 安装命令
agenthub install <slug> --registry ./.registry --target-workspace <path>

# 示例：安装龙虾 Agent
agenthub install lobster-agent --registry ./.registry --target-workspace ./my-workspace
```

### 3. 贡献 Agent

```bash
# 打包自己的 Agent
agenthub pack --workspace <workspace-path> --config <config-path> --output ./bundles

# 发布到 AgentHub
agenthub publish ./bundles/<name>-1.0.0.agent --registry ./.registry
```

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/agents` | GET | 列出/搜索 Agent |
| `/api/agents?q=<keyword>` | GET | 搜索 Agent |
| `/api/agents/<slug>` | GET | 获取 Agent 详情 |
| `/api/publish` | POST | 发布 Agent |
| `/api/install` | POST | 安装 Agent |

## 示例场景

### 用户问：有什么好用的 Agent？

```bash
curl -s http://127.0.0.1:3456/api/agents | jq -r '.agents[] | "- **\(.name)** (\(.slug)): \(.description)"'
```

### 用户问：如何安装龙虾 Agent？

```bash
curl -s http://127.0.0.1:3456/api/agents/lobster-agent | jq -r '"agenthub install " + .slug + " --registry ./.registry --target-workspace <workspace>"'
```

### 用户问：龙虾 Agent 有什么技能？

```bash
curl -s http://127.0.0.1:3456/api/agents/lobster-agent | jq '.includes.skills'
```

## Registry 地址

- 本地开发：`http://127.0.0.1:3456`
- 私有部署：`http://your-server:3000`
- 公网服务：`https://agenthub.io`（未来）

## 依赖

- `curl` - HTTP 客户端
- `jq` - JSON 处理器（可选，用于格式化输出）
- `agenthub` - CLI 工具（用于安装/发布）
