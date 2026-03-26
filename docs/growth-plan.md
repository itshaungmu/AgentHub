# AgentHub 外部分发计划

根据 PRD Milestone 4 要求，制定 4 次外部分发主题与节奏。

## 📅 分发时间表

| 周次 | 日期 | 主题 | 渠道 | 目标 |
|------|------|------|------|------|
| 第 1 周 | W1 | 产品发布：OpenClaw Agent 的标准分发方式 | GitHub/V2EX | 100 Stars |
| 第 2 周 | W2 | 样板 Agent 发布：3 个官方样板上手体验 | 掘金/即刻 | 200 Stars |
| 第 3 周 | W3 | 团队分发教程：如何把团队 Agent 标准化 | 技术社区 | 400 Stars |
| 第 4 周 | W4 | 用户案例：真实团队使用故事 | 公众号/知乎 | 600 Stars |

---

## 📝 第 1 周：产品发布

### 主题
**AgentHub - OpenClaw Agent 的标准分发方式**

### 标题选项
1. 🤖 AgentHub：把调教好的 OpenClaw Agent 变成可复用资产
2. 一键打包、一键分发：AgentHub 让团队共享 AI Agent 变得简单
3. 如果 Docker Hub 是容器市场，那 AgentHub 就是 Agent 市场

### 正文模板

```
## AgentHub 是什么？

AgentHub 是一个专为 OpenClaw 设计的 Agent 打包与分发平台。

类比：
- Docker Hub 之于 Docker 容器
- npm 之于 Node.js 包

但专注于 OpenClaw Agent 的分发与复刻。

## 解决什么问题？

❌ 花几周调教的 Agent，无法方便地分享给同事
❌ 每次分享都要复制一堆配置文件和提示词
❌ 团队成员各自配置，效果参差不齐
❌ Agent 更新了，不知道怎么通知大家

✅ 一键打包：agenthub pack
✅ 一键发布：agenthub publish
✅ 一键安装：agenthub install
✅ 版本管理：update / rollback / verify

## 快速开始

npm install -g @zshuangmu/agenthub

# 3 步完成首次使用
agenthub pack --workspace ./my-workspace --config openclaw.json
agenthub publish ./bundles/my-agent.agent --registry ./.registry
agenthub install my-agent --registry ./.registry --target-workspace ./workspace

## 链接

- GitHub: https://github.com/itshaungmu/AgentHub
- npm: https://www.npmjs.com/package/@zshuangmu/agenthub
- Demo: https://agenthub.cyou
```

### 发布渠道
- [ ] GitHub Release
- [ ] V2EX - 分享创造节点
- [ ] 即刻 - AI 话题
- [ ] Hacker News (可选)

---

## 📝 第 2 周：样板 Agent

### 主题
**3 个官方样板 Agent，10 分钟上手 AgentHub**

### 标题选项
1. 🎯 试试这 3 个官方 Agent，10 分钟了解 AgentHub 能做什么
2. 代码审查、知识问答、文档撰写：3 个 Agent 直接用起来
3. 不用从零调教，直接用官方样板 Agent

### 正文模板

```
## 官方样板 Agent

我们提供了 3 个官方样板 Agent，帮助你快速上手：

| Agent | 描述 | 适用场景 |
|-------|------|----------|
| code-review-assistant | 代码审查助手 | 代码质量审查、安全漏洞识别 |
| team-knowledge-assistant | 团队知识问答 | 项目信息检索、新员工入职 |
| product-doc-writer | 产品文档撰写 | 功能文档、用户指南、API 文档 |

## 快速试用

# 克隆仓库
git clone https://github.com/itshaungmu/AgentHub.git
cd AgentHub

# 打包样板
agenthub pack --workspace ./samples/code-review-assistant --config ./samples/code-review-assistant/openclaw.json

# 安装使用
agenthub publish ./bundles/code-review-assistant-1.0.0.agent --registry ./.registry
agenthub install code-review-assistant --registry ./.registry --target-workspace ./workspace

## 效果演示

[示例对话截图]

用户: 请帮我审查这段代码
Agent: 我发现了一些问题...

## 链接

- 样板目录: https://github.com/itshaungmu/AgentHub/tree/main/samples
```

### 发布渠道
- [ ] 掘金 - 前端/AI 分类
- [ ] 即刻 - AI 话题
- [ ] 知乎 - AI 话题
- [ ] 公众号 (如有)

---

## 📝 第 3 周：团队分发教程

### 主题
**如何把团队 Agent 标准化分发**

### 标题选项
1. 🏢 团队 AI Agent 怎么统一分发？用 AgentHub 就对了
2. 从零到一：团队 Agent 标准化分发实践
3. 告别复制粘贴，用 AgentHub 管理团队 AI 资产

### 正文模板

```
## 团队分发痛点

- 每个成员都要单独配置 Agent
- 配置不一样，效果参差不齐
- 更新了，不知道怎么同步给大家
- 没有版本管理，出问题无法回滚

## AgentHub 解决方案

1️⃣ 打包：agenthub pack
2️⃣ 发布：agenthub publish
3️⃣ 安装：agenthub install
4️⃣ 更新：agenthub update
5️⃣ 回滚：agenthub rollback

## 实践案例

[团队使用截图/流程图]

## 详细教程

完整教程: docs/team-distribution-guide.md

## 链接

- 教程: https://github.com/itshaungmu/AgentHub/blob/main/docs/team-distribution-guide.md
```

### 发布渠道
- [ ] 掘金 - 架构/效率工具
- [ ] 知乎 - 技术话题
- [ ] V2EX - 酷工作节点
- [ ] 公司内部渠道

---

## 📝 第 4 周：用户案例

### 主题
**真实团队使用故事**

### 标题选项
1. 我们团队用 AgentHub 统一了 10 个 AI Agent
2. 从混乱到有序：我们如何管理团队的 AI 资产
3. 用户故事：AgentHub 如何改变我们的工作方式

### 正文模板

```
## 背景

[团队背景介绍]

## 问题

[遇到的问题]

## 解决方案

使用 AgentHub 后的变化

## 效果

- [量化指标 1]
- [量化指标 2]
- [用户反馈]

## 总结

[经验总结]

## 致谢

感谢 AgentHub 团队...
```

### 发布渠道
- [ ] 公众号
- [ ] 知乎专栏
- [ ] 公司博客
- [ ] 社区投稿

---

## 📊 成功指标

| 指标 | W1 目标 | W2 目标 | W3 目标 | W4 目标 |
|------|---------|---------|---------|---------|
| GitHub Stars | 100 | 200 | 400 | 600+ |
| npm 周下载 | 50 | 100 | 200 | 500+ |
| 官网 UV | 200 | 500 | 1000 | 2000+ |
| 试用用户 | 5 | 10 | 20 | 50+ |

## 📋 执行检查清单

### 发布前
- [ ] 测试所有命令
- [ ] 准备截图/GIF
- [ ] 检查链接有效性
- [ ] 准备 FAQ 应答

### 发布时
- [ ] 选择最佳发布时间 (工作日上午)
- [ ] 多渠道同步发布
- [ ] 及时回复评论

### 发布后
- [ ] 监控 Stars/下载
- [ ] 收集用户反馈
- [ ] 记录问题和改进点

---

## 🔗 相关资源

- [CHANGELOG](../CHANGELOG.md)
- [FAQ](./faq.md)
- [GitHub Issues](https://github.com/itshaungmu/AgentHub/issues)
