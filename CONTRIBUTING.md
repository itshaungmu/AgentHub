# 贡献指南

感谢你对 AgentHub 的关注！我们欢迎任何形式的贡献。

## 如何贡献

### 报告问题

如果你发现了 bug 或有功能建议，请 [创建 Issue](https://github.com/agenthub/agenthub/issues/new)，并包含：

- 清晰的问题描述
- 复现步骤（如果是 bug）
- 期望的行为
- 实际的行为
- 你的环境信息（Node.js 版本、操作系统等）

### 提交代码

1. **Fork 仓库** 并克隆到本地

2. **安装依赖**
   ```bash
   npm install
   ```

3. **运行测试** 确保所有测试通过
   ```bash
   npm test
   ```

4. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **编写代码** 并添加测试

6. **提交更改** 使用清晰的 commit message
   ```bash
   git commit -m "feat: 添加 XXX 功能"
   ```

7. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **创建 Pull Request**

### Commit 规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式（不影响功能）
- `refactor:` 重构
- `test:` 测试相关
- `chore:` 构建/工具相关

### 代码风格

- 使用 ES Modules (`import`/`export`)
- 使用 2 空格缩进
- 使用分号
- 函数和变量使用 camelCase
- 类使用 PascalCase
- 常量使用 UPPER_SNAKE_CASE

## 开发环境

### 要求

- Node.js >= 18.0.0
- npm >= 9.0.0

### 项目结构

```
agenthub/
├── src/
│   ├── cli.js           # CLI 入口
│   ├── index.js         # 模块导出
│   ├── server.js        # HTTP 服务器
│   ├── commands/        # CLI 命令实现
│   │   ├── pack.js
│   │   ├── publish.js
│   │   ├── install.js
│   │   ├── search.js
│   │   ├── info.js
│   │   └── serve.js
│   └── lib/             # 核心库
│       ├── manifest.js
│       ├── registry.js
│       ├── install.js
│       ├── html.js
│       └── http.js
├── test/                # 测试文件
├── docs/                # 文档
└── package.json
```

## 行为准则

- 尊重所有贡献者
- 保持建设性的讨论
- 欢迎不同的观点和经验
- 专注于对社区最有利的事情

## 许可证

通过贡献代码，你同意你的代码将以 MIT 许可证发布。
