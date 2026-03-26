# AgentHub 常见问题 (FAQ)

## 🤔 基础问题

### AgentHub 是什么？

AgentHub 是一个专为 **OpenClaw** 设计的 Agent 打包与分发平台。它帮助你：
- 将调教好的 Agent 打包成标准 Bundle
- 发布到 Registry 供团队或社区使用
- 一键安装别人分享的 Agent

类比：
- **Docker Hub** 之于 Docker 容器
- **npm** 之于 Node.js 包

### AgentHub 和 ClawHub 有什么区别？

| | ClawHub | AgentHub |
|---|---------|----------|
| **分发单位** | 单个 Skill（SKILL.md） | 完整 OpenClaw Agent |
| **包含内容** | 功能代码 | Workspace + Memory + 配置 + 技能 |
| **使用方式** | 安装 → 配置 → 使用 | 一键安装 → 直接使用 |

### 谁适合使用 AgentHub？

**适合：**
- OpenClaw 团队用户：统一分发、版本管理
- Agent 创作者：打包分享你调教好的 Agent
- AI 重度用户：快速获得别人调教好的 Agent 能力

**不适合：**
- 非 OpenClaw 用户（当前仅支持 OpenClaw）
- 需要单独 Skill 分发（请使用 ClawHub）
- 需要 Prompt 收藏夹（请使用专门的 Prompt 工具）

---

## 📦 安装问题

### 如何安装 AgentHub？

```bash
# 通过 npm 全局安装
npm install -g @zshuangmu/agenthub

# 验证安装
agenthub --version
```

### 安装时提示权限错误？

```bash
# 使用 sudo（macOS/Linux）
sudo npm install -g @zshuangmu/agenthub

# 或使用 nvm 管理 Node.js 版本
nvm install 18
nvm use 18
npm install -g @zshuangmu/agenthub
```

### 需要什么版本的 Node.js？

AgentHub 需要 **Node.js >= 18.0.0**。

```bash
# 检查 Node.js 版本
node --version
```

---

## 🚀 使用问题

### 如何打包我的 Agent？

```bash
agenthub pack --workspace ./my-workspace --config openclaw.json
```

确保你的 workspace 包含：
- `AGENTS.md` - Agent 定义
- `SOUL.md` - Agent 性格
- `USER.md` - 用户画像
- `IDENTITY.md` - 身份信息
- `TOOLS.md` - 工具说明
- `openclaw.json` - 配置文件

### 如何安装别人分享的 Agent？

```bash
# 从本地 Registry 安装
agenthub install <agent-name> --registry ./.registry --target-workspace ./workspace

# 从远程服务器安装
agenthub install <agent-name> --server https://your-server.com --target-workspace ./workspace
```

### 安装后如何验证？

```bash
agenthub verify <agent-name> --target-workspace ./workspace
```

### 如何更新 Agent？

```bash
# 更新到最新版
agenthub update <agent-name> --registry ./.registry --target-workspace ./workspace
```

### 如何回滚到旧版本？

```bash
# 查看可用版本
agenthub versions <agent-name> --registry ./.registry

# 回滚到指定版本
agenthub rollback <agent-name> --to 1.0.0 --registry ./.registry --target-workspace ./workspace
```

---

## 🔧 技术问题

### Bundle 文件包含什么？

```
my-agent.agent/
├── MANIFEST.json          # Agent 清单
├── WORKSPACE/             # OpenClaw workspace 快照
│   ├── AGENTS.md
│   ├── SOUL.md
│   ├── USER.md
│   ├── IDENTITY.md
│   ├── TOOLS.md
│   └── memory/
├── OPENCLAW.template.json # 配置模板
└── README.md              # 使用说明
```

### Memory 分层是什么？

AgentHub 支持三层 memory：
- **public**: 公开分享，安装时完整复制
- **portable**: 可移植，选择性分享
- **private**: 私有，发布时自动排除

### 如何共享 Registry 给团队？

**方案 1：网络共享**
```bash
# 将 .registry 放在网络驱动器
agenthub install <agent> --registry /shared/.registry
```

**方案 2：Git 仓库**
```bash
# 推送到 Git 仓库
cd .registry && git push
```

**方案 3：远程服务器**
```bash
# 启动 AgentHub 服务器
agenthub serve --registry ./.registry --port 3000 --host 0.0.0.0
```

---

## 🐛 故障排除

### 安装失败怎么办？

1. 检查 Registry 路径是否正确
2. 确认 Bundle 存在
3. 尝试强制重新安装

```bash
agenthub install <agent> --registry ./.registry --target-workspace ./workspace --force
```

### verify 校验失败？

查看详细的失败原因：
```bash
agenthub verify <agent> --target-workspace ./workspace
```

常见原因：
- 缺少安装记录 (install.json)
- 缺少配置文件
- workspace 文件不完整

### 找不到 Agent？

```bash
# 搜索所有 Agent
agenthub search "" --registry ./.registry

# 确认 Agent 名称拼写正确
agenthub info <agent> --registry ./.registry
```

### 更新失败？

1. 确认新版本已发布
2. 检查 Registry 连接
3. 确认当前版本信息

```bash
# 查看版本历史
agenthub versions <agent> --registry ./.registry

# 查看当前安装版本
agenthub list --target-workspace ./workspace
```

---

## 📚 更多帮助

- [团队分发指南](./team-distribution-guide.md)
- [3 步复刻教程](./quick-start-3-steps.md)
- [GitHub Issues](https://github.com/itshaungmu/AgentHub/issues)

---

**还有问题？** [提交 Issue](https://github.com/itshaungmu/AgentHub/issues) 获取帮助。
