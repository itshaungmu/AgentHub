# 3 步在 OpenClaw 中复用 Agent

本教程帮助你在 10 分钟内快速复用别人调教好的 OpenClaw Agent。

## 🎯 目标

- 了解如何发现 Agent
- 学会如何安装 Agent
- 验证安装成功

## ⏱️ 预计时间：10 分钟

---

## 第一步：发现 Agent (2 分钟)

### 方式 1：浏览官方样板

查看官方提供的样板 Agent：

```bash
# 克隆仓库
git clone https://github.com/itshaungmu/AgentHub.git
cd AgentHub

# 查看样板目录
ls samples/
# 输出: code-review-assistant  product-doc-writer  team-knowledge-assistant
```

### 方式 2：搜索 Registry

```bash
# 搜索所有 Agent
agenthub search "" --registry ./.registry

# 搜索特定类型的 Agent
agenthub search "code" --registry ./.registry
```

### 方式 3：查看 Agent 详情

```bash
agenthub info code-review-assistant --registry ./.registry

# 输出:
# 📦 Code Review Assistant (code-review-assistant@1.0.0)
#    专业的代码审查助手
#    Runtime: openclaw >=0.5.0
#    Memory: 0 条 (public: 0, portable: 0)
#
#    安装命令: agenthub install code-review-assistant
```

---

## 第二步：安装 Agent (5 分钟)

### 2.1 安装到当前目录

```bash
# 最简单的安装方式
agenthub install code-review-assistant --target-workspace .

# 输出:
# 📥 正在安装 code-review-assistant...
#
# [OK] 已安装 code-review-assistant@1.0.0
#   位置: 当前目录
```

### 2.2 安装到指定目录

```bash
# 安装到你的 OpenClaw workspace
agenthub install code-review-assistant \
  --target-workspace /path/to/your/openclaw/workspace
```

### 2.3 安装特定版本

```bash
# 查看可用版本
agenthub versions code-review-assistant --registry ./.registry

# 安装指定版本
agenthub install code-review-assistant:1.0.0 \
  --registry ./.registry \
  --target-workspace ./workspace
```

---

## 第三步：验证和使用 (3 分钟)

### 3.1 验证安装

```bash
agenthub verify code-review-assistant --target-workspace ./workspace

# 输出:
# [OK] 校验通过
#
# Agent: code-review-assistant@1.0.0
# Workspace: /path/to/workspace
#
# 检查项目:
#   [OK] PASS install record
#   [OK] PASS applied config
#   [OK] PASS manifest lookup
#   [OK] PASS workspace file: AGENTS.md
#   [OK] PASS workspace file: SOUL.md
#   [OK] PASS workspace file: USER.md
#
# Agent 安装完整，可以正常使用。
```

### 3.2 开始使用

1. 打开 OpenClaw
2. 切换到安装了 Agent 的 workspace
3. 开始与 Agent 对话

**示例对话：**

```
你: 请帮我审查这段代码：
function getUser(id) {
  return db.query('SELECT * FROM users WHERE id = ' + id);
}

Agent: 我发现了一些问题：

🔴 安全问题 (必须修复)
第 2 行存在 SQL 注入风险。直接拼接用户输入到 SQL 语句中
可能导致恶意用户执行任意 SQL 命令。

建议使用参数化查询：

function getUser(id) {
  return db.query('SELECT * FROM users WHERE id = ?', [id]);
}

这样可以防止 SQL 注入攻击。
```

### 3.3 查看已安装的 Agent

```bash
agenthub list --target-workspace ./workspace

# 输出:
# 已安装的 Agent (./workspace)
#
# code-review-assistant@1.0.0
#   安装时间: 2026-03-26T10:00:00Z
#   位置: /path/to/workspace
```

---

## 🎉 完成！

你已经成功安装并可以使用 Agent 了！

## 📚 接下来

- **更新 Agent**: `agenthub update <agent-name>`
- **查看版本**: `agenthub versions <agent-name>`
- **回滚版本**: `agenthub rollback <agent-name> --to <version>`
- **查看统计**: `agenthub stats <agent-name>`

## 🆘 遇到问题？

### 安装失败

```bash
# 强制重新安装
agenthub install <agent-name> --target-workspace ./workspace --force
```

### 找不到 Agent

```bash
# 确认 Registry 路径正确
agenthub search "" --registry /correct/path/to/.registry
```

### 验证失败

```bash
# 查看详细的失败原因
agenthub verify <agent-name> --target-workspace ./workspace
```

---

## 📖 相关教程

- [团队分发指南](./team-distribution-guide.md) - 如何分享你的 Agent 给团队
- [CLI 命令参考](../README.md#-命令文档) - 完整命令列表

---

**需要帮助？** [提交 Issue](https://github.com/itshaungmu/AgentHub/issues)
