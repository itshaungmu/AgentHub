# Code Review Assistant

**AgentHub 官方样板 Agent**

一个专业的代码审查助手，帮助开发者进行高质量的代码审查。

## 特性

- 🔍 **代码质量审查**: 检查可读性、可维护性和最佳实践
- 🔒 **安全漏洞识别**: 发现潜在的安全问题
- ⚡ **性能问题发现**: 识别性能瓶颈
- 💡 **改进建议**: 提供具体的代码改进方案

## 安装

```bash
# 安装到当前 workspace
agenthub install code-review-assistant --target-workspace ./workspace

# 或安装到指定目录
agenthub install code-review-assistant --target-workspace /path/to/your/workspace
```

## 使用示例

安装后，在 OpenClaw 中与 Agent 对话：

```
请帮我审查这段代码：

function getUser(id) {
  return db.query('SELECT * FROM users WHERE id = ' + id);
}
```

Agent 会提供类似这样的反馈：

```
我发现了一些问题：

🔴 **安全问题 (必须修复)**
第 2 行存在 SQL 注入风险。直接拼接用户输入到 SQL 语句中
可能导致恶意用户执行任意 SQL 命令。

建议使用参数化查询：

function getUser(id) {
  return db.query('SELECT * FROM users WHERE id = ?', [id]);
}

这样可以防止 SQL 注入攻击。
```

## 包含内容

- 📝 AGENTS.md - Agent 定义和行为规范
- 🎭 SOUL.md - Agent 性格和沟通风格
- 👤 USER.md - 用户画像
- 🆔 IDENTITY.md - 身份信息
- 🔧 TOOLS.md - 可用工具说明

## 版本历史

- 1.0.0 - 初始版本

## 许可证

MIT
