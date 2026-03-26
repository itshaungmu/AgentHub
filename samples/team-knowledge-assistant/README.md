# Team Knowledge Assistant

**AgentHub 官方样板 Agent** | 版本 1.0.0

一个团队知识问答助手，帮助团队成员快速找到项目、团队和业务相关的信息。

## 适用场景

| 场景 | 描述 |
|------|------|
| 新员工入职 | 快速了解团队架构、规范、项目背景 |
| 项目交接 | 帮助接手项目的成员快速上手 |
| 日常查询 | 快速找到技术文档、API 说明、流程规范 |
| 会议准备 | 了解项目背景和决策历史 |
| 故障排查 | 找到相关问题的解决方案和历史记录 |

## 特性

- 🔍 **知识检索**: 快速找到需要的信息
- 📚 **知识整理**: 组织碎片化信息为结构化知识
- 👥 **团队协作**: 帮助新成员快速融入
- ⚠️ **更新提示**: 识别并提示过时信息

## 安装

### 方式 1: 从远程服务器安装 (推荐)

```bash
# 安装到当前 workspace
agenthub install team-knowledge-assistant --target-workspace .

# 安装到指定目录
agenthub install team-knowledge-assistant --target-workspace /path/to/your/workspace
```

### 方式 2: 从本地 Registry 安装

```bash
# 先打包样板 Agent
agenthub pack --workspace ./samples/team-knowledge-assistant \
  --config ./samples/team-knowledge-assistant/openclaw.json

# 发布到本地 Registry
agenthub publish ./bundles/team-knowledge-assistant-1.0.0.agent --registry ./.registry

# 安装
agenthub install team-knowledge-assistant \
  --registry ./.registry \
  --target-workspace ./workspace
```

### 验证安装

```bash
agenthub verify team-knowledge-assistant --target-workspace ./workspace
```

## 使用示例

### 示例 1: 项目架构查询

```
用户: 我们的项目架构是什么？

助手: 项目采用微服务架构：

**服务划分**
- API Gateway: 统一入口，负责认证和路由
- User Service: 用户管理和认证
- Order Service: 订单处理和库存管理
- Notification Service: 通知和消息推送

**技术栈**
- 后端: Node.js + Express / Python + FastAPI
- 数据库: PostgreSQL (主库) + Redis (缓存)
- 消息队列: RabbitMQ
- 部署: Kubernetes + Docker

**相关文档**
- 架构设计文档: docs/architecture/overview.md
- API 文档: docs/api/
- 部署指南: docs/deployment/
```

### 示例 2: 流程规范查询

```
用户: 发布流程是什么？

助手: 我们的发布流程如下：

**发布前检查**
1. 代码审查通过 (至少 1 个 approve)
2. 测试覆盖率 >= 80%
3. 集成测试通过
4. 安全扫描无高危漏洞

**发布步骤**
1. 创建 release 分支
2. 更新 CHANGELOG
3. 提交发布 PR
4. 合并后触发 CI/CD
5. 监控线上指标

**回滚方案**
- 保留最近 3 个版本的容器镜像
- 一键回滚脚本: scripts/rollback.sh

**相关文档**
- 发布清单: docs/release/checklist.md
- CI 配置: .github/workflows/
```

### 示例 3: 技术问题解答

```
用户: 如何处理跨服务的分布式事务？

助手: 我们采用 Saga 模式处理分布式事务：

**实现方案**
- 使用消息队列实现最终一致性
- 每个服务维护本地事务状态
- 失败时执行补偿操作

**代码示例**
```javascript
// 订单服务发起事务
async function createOrder(orderData) {
  // 1. 创建订单记录
  const order = await Order.create(orderData);

  // 2. 发送消息到库存服务
  await mq.publish('inventory.reserve', {
    orderId: order.id,
    items: orderData.items
  });

  // 3. 等待确认或超时
  return order;
}
```

**补偿机制**
- 超时未确认自动取消订单
- 库存预留失败回滚订单

**相关文档**
- 分布式事务设计: docs/architecture/distributed-transactions.md
```

## 团队使用建议

### 知识积累
1. 定期更新团队知识库
2. 记录项目决策和原因
3. 整理常见问题解答

### 新人引导
1. 使用 Agent 进行入职培训
2. 快速了解团队规范
3. 学习项目历史和背景

### 日常协作
1. 会议前查询相关背景
2. 快速定位技术文档
3. 了解历史决策原因

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
