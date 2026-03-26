# 贡献指南

感谢你对 AgentHub 的关注！我们欢迎任何形式的贡献。

## 如何贡献

### 报告问题

如果你发现了 bug 或有功能建议，请 [创建 Issue](https://github.com/itshaungmu/AgentHub/issues/new)，并包含：

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
AgentHub/
├── src/
│   ├── cli.js           # CLI 入口
│   ├── index.js         # 模块导出
│   ├── server.js        # HTTP 服务器
│   ├── api-server.js    # API 服务器
│   ├── web-server.js    # Web 服务器
│   ├── commands/        # CLI 命令实现
│   │   ├── pack.js      # 打包命令
│   │   ├── publish.js   # 本地发布
│   │   ├── publish-remote.js # 远程发布
│   │   ├── install.js   # 安装命令
│   │   ├── search.js    # 搜索命令
│   │   ├── info.js      # 详情命令
│   │   ├── list.js      # 列表命令
│   │   ├── verify.js    # 校验命令
│   │   ├── versions.js  # 版本列表
│   │   ├── update.js    # 更新命令
│   │   ├── rollback.js  # 回滚命令
│   │   ├── stats.js     # 统计命令
│   │   ├── serve.js     # 服务命令
│   │   ├── api.js       # API 服务
│   │   └── web.js       # Web 服务
│   └── lib/             # 核心库
│       ├── manifest.js      # Manifest 处理
│       ├── registry.js      # Registry 操作
│       ├── install.js       # 安装逻辑
│       ├── html.js          # HTML 模板
│       ├── http.js          # HTTP 工具
│       ├── database.js      # 数据库操作
│       ├── fs-utils.js      # 文件系统工具
│       ├── colors.js        # 终端颜色
│       ├── version-manager.js # 版本管理
│       ├── security-scanner.js # 安全扫描
│       ├── bundle-transfer.js # Bundle 传输
│       └── remote.js        # 远程操作
├── samples/             # 官方样板 Agent
│   ├── code-review-assistant/
│   ├── team-knowledge-assistant/
│   └── product-doc-writer/
├── test/                # 测试文件
├── docs/                # 文档
│   ├── quick-start-3-steps.md
│   ├── team-distribution-guide.md
│   ├── faq.md
│   ├── growth-plan.md
│   └── feedback-form.md
└── package.json
```

### 开发命令

```bash
# 运行测试
npm test

# 启动开发服务器
node src/cli.js serve --registry ./.registry

# 打包样板
node src/cli.js pack --workspace ./samples/code-review-assistant --config ./samples/code-review-assistant/openclaw.json
```

### 添加新命令

1. 在 `src/commands/` 创建新文件
2. 在 `src/index.js` 导出命令
3. 在 `src/cli.js` 添加命令路由
4. 在 `test/` 添加测试
5. 更新 README 命令文档

## 发布流程

1. 更新 CHANGELOG.md
2. 更新 package.json 版本号
3. 运行测试确保通过
4. 创建 Git tag
5. 推送到 GitHub
6. 发布到 npm

```bash
npm version patch  # 或 minor / major
git push origin main --tags
npm publish --access public
```

## 行为准则

- 尊重所有贡献者
- 保持建设性的讨论
- 欢迎不同的观点和经验
- 专注于对社区最有利的事情

## 许可证

通过贡献代码，你同意你的代码将以 MIT 许可证发布。
