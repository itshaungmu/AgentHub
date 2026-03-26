# Code Review Assistant

**AgentHub 官方样板 Agent** | 版本 1.0.0

一个专业的代码审查助手，帮助开发者进行高质量的代码审查。

## 适用场景

| 场景 | 描述 |
|------|------|
| 代码提交前审查 | 在 PR/MR 提交前自查代码质量 |
| 安全审计 | 发现潜在的安全漏洞 |
| 性能优化 | 识别代码中的性能瓶颈 |
| 最佳实践学习 | 学习行业最佳编码实践 |
| 团队代码规范 | 确保代码符合团队规范 |

## 特性

- 🔍 **代码质量审查**: 检查可读性、可维护性和最佳实践
- 🔒 **安全漏洞识别**: 发现潜在的安全问题
- ⚡ **性能问题发现**: 识别性能瓶颈
- 💡 **改进建议**: 提供具体的代码改进方案

## 安装

### 方式 1: 从远程服务器安装 (推荐)

```bash
# 安装到当前 workspace
agenthub install code-review-assistant --target-workspace .

# 安装到指定目录
agenthub install code-review-assistant --target-workspace /path/to/your/workspace
```

### 方式 2: 从本地 Registry 安装

```bash
# 先打包样板 Agent
agenthub pack --workspace ./samples/code-review-assistant \
  --config ./samples/code-review-assistant/openclaw.json

# 发布到本地 Registry
agenthub publish ./bundles/code-review-assistant-1.0.0.agent --registry ./.registry

# 安装
agenthub install code-review-assistant \
  --registry ./.registry \
  --target-workspace ./workspace
```

### 验证安装

```bash
agenthub verify code-review-assistant --target-workspace ./workspace
```

## 使用示例

### 示例 1: SQL 注入检测

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

### 示例 2: 性能问题检测

```
审查这个函数：

async function getUsers(userIds) {
  const users = [];
  for (const id of userIds) {
    const user = await fetch(`/api/users/${id}`);
    users.push(user);
  }
  return users;
}
```

Agent 反馈：

```
⚠️ **性能问题 (建议优化)**

检测到 N+1 查询问题：循环中串行执行异步请求，
当 userIds 有 100 个元素时，需要 100 次网络请求。

优化方案 1: 并行请求
```javascript
async function getUsers(userIds) {
  return Promise.all(
    userIds.map(id => fetch(`/api/users/${id}`))
  );
}
```

优化方案 2: 批量请求 (如果 API 支持)
```javascript
async function getUsers(userIds) {
  return fetch('/api/users/batch', {
    method: 'POST',
    body: JSON.stringify({ ids: userIds })
  });
}
```
```

### 示例 3: 代码质量建议

```
审查这个组件：

const UserList = ({ users }) => {
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <span>{user.name}</span>
          <span>{user.email}</span>
        </div>
      ))}
    </div>
  );
};
```

Agent 反馈：

```
✅ **代码质量建议**

基础功能正确，以下是改进建议：

1. **可访问性**: 添加语义化标签
```jsx
<ul role="list">
  {users.map(user => (
    <li key={user.id}>
      <strong>{user.name}</strong>
      <span>{user.email}</span>
    </li>
  ))}
</ul>
```

2. **空状态处理**: 添加空列表提示
3. **加载状态**: 考虑添加 loading 状态
```

## 最佳实践

### 审查前
1. 提供完整的代码上下文
2. 说明代码的用途和业务场景
3. 指出关注的重点领域

### 审查时
1. 优先关注安全问题
2. 评估性能影响
3. 检查可维护性

### 审查后
1. 记录发现的问题
2. 制定改进计划
3. 跟踪修复进度

## 包含内容

| 文件 | 说明 |
|------|------|
| AGENTS.md | Agent 定义和行为规范 |
| SOUL.md | Agent 性格和沟通风格 |
| USER.md | 用户画像和使用场景 |
| IDENTITY.md | 身份信息和能力定义 |
| TOOLS.md | 可用工具说明 |
| openclaw.json | 配置文件 |
| README.md | 使用说明 |

## 技术要求

- OpenClaw >= 0.5.0
- Claude 3.5 Sonnet 或更高版本

## 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| 1.0.0 | 2026-03-26 | 初始版本 |

## 许可证

MIT

---

**问题反馈**: [GitHub Issues](https://github.com/itshaungmu/AgentHub/issues)
