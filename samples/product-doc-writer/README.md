# Product Documentation Writer

**AgentHub 官方样板 Agent** | 版本 1.0.0

一个产品文档撰写助手，帮助创建清晰、专业、易于理解的产品文档。

## 适用场景

| 场景 | 描述 |
|------|------|
| 功能文档编写 | 为新功能编写用户文档 |
| API 文档撰写 | 编写 API 接口文档 |
| 用户指南制作 | 创建产品使用指南 |
| 文档优化改进 | 提升现有文档质量 |
| 中英双语支持 | 翻译和撰写双语文档 |

## 特性

- 📝 **文档撰写**: 编写功能文档、用户指南、API 文档
- ✨ **文档优化**: 改进可读性和完整性
- 📋 **格式规范**: 统一的文档风格
- 🌐 **中英双语**: 支持中英文文档

## 安装

### 方式 1: 从远程服务器安装 (推荐)

```bash
# 安装到当前 workspace
agenthub install product-doc-writer --target-workspace .

# 安装到指定目录
agenthub install product-doc-writer --target-workspace /path/to/your/workspace
```

### 方式 2: 从本地 Registry 安装

```bash
# 先打包样板 Agent
agenthub pack --workspace ./samples/product-doc-writer \
  --config ./samples/product-doc-writer/openclaw.json

# 发布到本地 Registry
agenthub publish ./bundles/product-doc-writer-1.0.0.agent --registry ./.registry

# 安装
agenthub install product-doc-writer \
  --registry ./.registry \
  --target-workspace ./workspace
```

### 验证安装

```bash
agenthub verify product-doc-writer --target-workspace ./workspace
```

## 使用示例

### 示例 1: 功能文档编写

```
用户: 帮我写一个用户登录功能的文档

助手: # 用户登录功能

## 简介

用户登录功能允许已注册用户通过邮箱和密码安全地访问其账户。

## 快速开始

1. 打开应用或访问网站
2. 点击右上角「登录」按钮
3. 输入注册邮箱和密码
4. 点击「登录」按钮

### 预期结果
- 成功登录后跳转到首页
- 显示用户头像和名称
- 可访问个性化功能

## 详细说明

### 支持的登录方式

| 方式 | 说明 | 适用场景 |
|------|------|----------|
| 邮箱 + 密码 | 传统登录方式 | 所有用户 |
| 手机号 + 验证码 | 快速登录 | 移动端用户 |
| Google 账号 | OAuth 登录 | 国际用户 |
| GitHub 账号 | OAuth 登录 | 开发者用户 |

### 安全特性

- **密码加密**: 使用 bcrypt 加密存储
- **登录失败限制**: 5 次失败后锁定 15 分钟
- **两步验证**: 支持 TOTP 验证器
- **会话管理**: 可查看和撤销活跃会话

### 错误处理

| 错误信息 | 原因 | 解决方案 |
|----------|------|----------|
| 邮箱未注册 | 账户不存在 | 检查邮箱或注册新账户 |
| 密码错误 | 密码输入错误 | 检查大小写或重置密码 |
| 账户被锁定 | 失败次数过多 | 等待 15 分钟或联系客服 |

## 常见问题

**Q: 忘记密码怎么办？**

A: 点击登录页面「忘记密码」，输入注册邮箱，按邮件指引重置密码。

**Q: 如何开启两步验证？**

A: 登录后进入「账户设置」→「安全」→「两步验证」，扫描二维码绑定。

**Q: 登录状态会保持多久？**

A: 默认保持 7 天，可在设置中调整。敏感操作需要重新验证密码。
```

### 示例 2: API 文档撰写

```
用户: 写一个用户登录 API 的文档

助手: # 用户登录 API

## 端点

```
POST /api/v1/auth/login
```

认证用户并返回访问令牌。

## 请求

### Headers

| Header | 类型 | 必填 | 说明 |
|--------|------|------|------|
| Content-Type | string | 是 | application/json |

### Body

```json
{
  "email": "user@example.com",
  "password": "your_password",
  "remember_me": true
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| email | string | 是 | 用户邮箱 |
| password | string | 是 | 用户密码 |
| remember_me | boolean | 否 | 延长会话有效期 |

## 响应

### 成功响应 (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "usr_123",
      "email": "user@example.com",
      "name": "张三"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expires_at": "2024-01-08T00:00:00Z"
  }
}
```

### 错误响应

| 状态码 | 代码 | 说明 |
|--------|------|------|
| 400 | INVALID_EMAIL | 邮箱格式错误 |
| 401 | INVALID_CREDENTIALS | 邮箱或密码错误 |
| 429 | TOO_MANY_ATTEMPTS | 尝试次数过多 |

## 示例

### cURL

```bash
curl -X POST https://api.example.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"secret"}'
```

### JavaScript

```javascript
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'secret'
  })
});

const { data } = await response.json();
console.log(data.token);
```
```

### 示例 3: 文档优化

```
用户: 优化这段文档，让它更清晰：

"用户可以点击设置然后找到安全选项然后修改密码需要输入旧密码和新密码"

助手: # 修改密码

## 步骤

1. 点击右上角 **头像**
2. 选择 **设置**
3. 在左侧菜单点击 **安全**
4. 找到「修改密码」部分
5. 输入：
   - 当前密码
   - 新密码
   - 确认新密码
6. 点击 **保存更改**

## 要求

- 新密码至少 8 个字符
- 包含大小写字母和数字
- 不能与最近 3 次密码相同

## 提示

💡 修改密码后，其他设备的登录状态会自动失效，需要重新登录。
```

## 文档风格指南

Agent 会遵循以下原则：

1. **结构清晰**: 使用标题、列表、表格组织内容
2. **语言简洁**: 避免冗长句子，直达要点
3. **示例丰富**: 提供代码和操作示例
4. **格式统一**: 遵循 Markdown 最佳实践

## 包含内容

| 文件 | 说明 |
|------|------|
| AGENTS.md | Agent 定义和行为规范 |
| SOUL.md | Agent 性格和写作风格 |
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
