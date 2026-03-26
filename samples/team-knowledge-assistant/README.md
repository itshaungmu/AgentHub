# Team Knowledge Assistant

**AgentHub 官方样板 Agent**

一个团队知识问答助手，帮助团队成员快速找到项目、团队和业务相关的信息。

## 特性

- 🔍 **知识检索**: 快速找到需要的信息
- 📚 **知识整理**: 组织碎片化信息为结构化知识
- 👥 **团队协作**: 帮助新成员快速融入
- ⚠️ **更新提示**: 识别并提示过时信息

## 安装

```bash
agenthub install team-knowledge-assistant --target-workspace ./workspace
```

## 使用示例

```
用户: 我们的项目架构是什么？

助手: 项目采用微服务架构：

**服务划分**
- API Gateway: 统一入口
- User Service: 用户管理
- Order Service: 订单处理
- Notification Service: 通知服务

**技术栈**
- 后端: Node.js + Express
- 数据库: PostgreSQL + Redis
- 消息队列: RabbitMQ

**相关文档**
- 架构文档: docs/architecture.md
- API 文档: docs/api/
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
