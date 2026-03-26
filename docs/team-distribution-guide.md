# 如何把团队 Agent 标准化分发

本教程帮助团队负责人将调教好的 OpenClaw Agent 打包成标准资产，实现团队统一分发和版本管理。

## 🎯 你将学到

- 如何打包团队 Agent
- 如何发布到 Registry
- 如何让团队成员一键安装
- 如何管理版本和更新

## 📋 准备工作

### 1. 安装 AgentHub

```bash
npm install -g @zshuangmu/agenthub
```

### 2. 准备你的 Agent

确保你的 OpenClaw workspace 包含以下文件：

```
my-workspace/
├── AGENTS.md      # Agent 定义和行为规范
├── SOUL.md        # Agent 性格和沟通风格
├── USER.md        # 用户画像
├── IDENTITY.md    # 身份信息
├── TOOLS.md       # 可用工具说明
└── openclaw.json  # OpenClaw 配置
```

## 📦 第一步：打包 Agent

### 1.1 创建 Bundle

```bash
agenthub pack \
  --workspace ./my-workspace \
  --config ./openclaw.json \
  --output ./bundles \
  --tags "team,internal,code-review" \
  --category "Development"
```

### 1.2 验证 Bundle

```bash
# 查看生成的 Bundle
ls ./bundles/
# 输出: my-agent-1.0.0.agent

# 查看 Bundle 内容
cat ./bundles/my-agent-1.0.0.agent/MANIFEST.json
```

## 🚀 第二步：发布到 Registry

### 方案 A：本地 Registry（推荐小团队）

```bash
# 创建 Registry 目录
mkdir -p ./.registry

# 发布 Bundle
agenthub publish ./bundles/my-agent-1.0.0.agent --registry ./.registry
```

### 方案 B：远程服务器（推荐大团队）

```bash
# 启动 AgentHub 服务器
agenthub serve --registry ./.registry --port 3000 --host 0.0.0.0

# 发布到远程（在另一台机器上）
agenthub publish-remote ./bundles/my-agent-1.0.0.agent --server https://your-server.com
```

## 👥 第三步：团队成员安装

### 3.1 生成安装命令

分享以下命令给团队成员：

```bash
# 从本地 Registry 安装
agenthub install my-agent \
  --registry /path/to/shared/.registry \
  --target-workspace ./workspace

# 或从远程服务器安装
agenthub install my-agent \
  --server https://your-server.com \
  --target-workspace ./workspace
```

### 3.2 验证安装

```bash
# 检查安装状态
agenthub verify my-agent --target-workspace ./workspace

# 输出示例:
# ✅ 校验通过
# Agent: my-agent@1.0.0
# Workspace: /path/to/workspace
#
# 检查项目:
#   ✅ PASS install record
#   ✅ PASS applied config
#   ✅ PASS manifest lookup
#   ✅ PASS workspace file: AGENTS.md
#   ✅ PASS workspace file: SOUL.md
#   ✅ PASS workspace file: USER.md
#
# Agent 安装完整，可以正常使用。
```

## 🔄 第四步：版本管理

### 4.1 发布新版本

```bash
# 修改 Agent 后，更新版本号
# 编辑 MANIFEST.json 中的 version 字段

# 重新打包
agenthub pack --workspace ./my-workspace --config ./openclaw.json --output ./bundles

# 发布新版本
agenthub publish ./bundles/my-agent-1.1.0.agent --registry ./.registry
```

### 4.2 团队成员更新

```bash
# 查看可用版本
agenthub versions my-agent --registry ./.registry

# 更新到最新版
agenthub update my-agent --registry ./.registry --target-workspace ./workspace

# 输出:
# ✅ 更新成功
#
#   Agent: my-agent
#   旧版本: 1.0.0
#   新版本: 1.1.0
#
#   运行 agenthub verify my-agent 校验安装状态
```

### 4.3 回滚到旧版本

```bash
# 如果新版本有问题，可以回滚
agenthub rollback my-agent --to 1.0.0 --registry ./.registry --target-workspace ./workspace

# 输出:
# ✅ 回滚成功
#
#   Agent: my-agent
#   回滚前: 1.1.0
#   当前版本: 1.0.0
#
#   运行 agenthub verify my-agent 校验安装状态
#   运行 agenthub update my-agent 恢复到最新版本
```

## 📊 第五步：查看统计

```bash
# 查看 Agent 统计信息
agenthub stats my-agent --registry ./.registry

# 输出示例:
# 📊 my-agent 统计
#
# 版本: 1.1.0 (最新)
# 总版本数: 2
# 总下载次数: 25
# 总安装次数: 10
#
# 版本分布:
#   1.1.0: 15 下载
#   1.0.0: 10 下载
```

## 🎯 最佳实践

### 1. 命名规范

使用清晰、一致的命名：
- ✅ `team-code-reviewer`
- ✅ `acme-doc-writer`
- ❌ `agent1`, `my-agent`

### 2. 版本管理

遵循语义化版本：
- `1.0.0` → `1.0.1`: Bug 修复
- `1.0.0` → `1.1.0`: 新功能
- `1.0.0` → `2.0.0`: 重大变更

### 3. 文档完善

每个 Agent 包含完整的 README：
- 功能说明
- 安装步骤
- 使用示例
- 更新日志

### 4. 定期更新

- 定期发布更新
- 在 CHANGELOG 中记录变更
- 通知团队成员更新

## 🆘 常见问题

### Q: 安装失败怎么办？

```bash
# 检查安装状态
agenthub verify my-agent --target-workspace ./workspace

# 强制重新安装
agenthub install my-agent --registry ./.registry --target-workspace ./workspace --force
```

### Q: 如何共享 Registry？

1. **网络共享**: 将 `.registry` 目录放在网络驱动器上
2. **Git 仓库**: 将 `.registry` 推送到私有 Git 仓库
3. **远程服务器**: 启动 AgentHub 服务器

### Q: 如何删除旧版本？

目前 AgentHub 保留所有版本历史，建议定期归档不需要的版本。

## 📚 相关资源

- [快速开始指南](../README.md#-3-步上手)
- [CLI 命令参考](../README.md#-命令文档)
- [官方样板 Agent](../samples/)

---

**需要帮助？** [提交 Issue](https://github.com/itshaungmu/AgentHub/issues)
