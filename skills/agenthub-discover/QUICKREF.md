# AgentHub Discover Skill - 快速参考

## AI Agent 调用指南

当用户询问关于 AgentHub 上的 Agent 时，使用以下 curl 命令获取信息：

### 列出所有 Agent

```bash
curl -s http://127.0.0.1:3456/api/agents | jq '.agents[] | {slug, name, version, description}'
```

### 搜索 Agent

```bash
curl -s "http://127.0.0.1:3456/api/agents?q=<关键词>" | jq '.agents[] | {slug, name, description}'
```

### 获取 Agent 详情

```bash
curl -s http://127.0.0.1:3456/api/agents/<slug> | jq .
```

### 获取 Agent 技能

```bash
curl -s http://127.0.0.1:3456/api/agents/<slug> | jq '.includes.skills'
```

### 获取 Agent 记忆统计

```bash
curl -s http://127.0.0.1:3456/api/agents/<slug> | jq '.includes.memory'
```

### 生成安装命令

```bash
curl -s http://127.0.0.1:3456/api/agents/<slug> | jq -r '"agenthub install " + .slug + " --registry ./.registry --target-workspace <workspace>"'
```

## 示例对话

**用户**: 有什么好用的 Agent？

**AI 执行**:
```bash
curl -s http://127.0.0.1:3456/api/agents | jq -r '.agents[] | "- **\(.name)** (\(.slug)): \(.description)"'
```

**AI 回复**:
- **lobster-agent** (lobster-agent): OpenClaw agent bundle for lobster-agent
- ...

---

**用户**: 龙虾 Agent 有什么技能？

**AI 执行**:
```bash
curl -s http://127.0.0.1:3456/api/agents/lobster-agent | jq '.includes'
```

**AI 回复**:
- 技能: agenthub-discover
- 记忆: 2 条 (public: 1, portable: 1)
- ...

---

**用户**: 如何安装龙虾 Agent？

**AI 执行**:
```bash
curl -s http://127.0.0.1:3456/api/agents/lobster-agent | jq -r '"agenthub install " + .slug + " --registry ./.registry --target-workspace <workspace>"'
```

**AI 回复**:
```
agenthub install lobster-agent --registry ./.registry --target-workspace <workspace>
```
