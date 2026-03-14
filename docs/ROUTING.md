# AgentHub 路由分析与缓存策略

本文档分析了 AgentHub Web 服务器的路由设计，区分静态资源和动态 API，以便配置服务器缓存策略。

## 路由分类

### 1. 静态资源（可长期缓存）

| 路由 | 描述 | 建议缓存策略 |
|------|------|--------------|
| `/static/*.css` | CSS 样式文件 | `Cache-Control: public, max-age=31536000, immutable` |
| `/static/*.js` | JavaScript 文件 | `Cache-Control: public, max-age=31536000, immutable` |
| `/static/*.png` | PNG 图片 | `Cache-Control: public, max-age=31536000, immutable` |
| `/static/*.svg` | SVG 图片 | `Cache-Control: public, max-age=31536000, immutable` |

**Nginx 配置示例：**
```nginx
location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. 技能文件（可短期缓存）

| 路由 | 描述 | 建议缓存策略 |
|------|------|--------------|
| `/skills/agenthub-discover/SKILL.md` | AgentHub 发现技能 | `Cache-Control: public, max-age=3600` |

**Nginx 配置示例：**
```nginx
location ~ ^/skills/.+\.md$ {
    expires 1h;
    add_header Cache-Control "public";
}
```

### 3. 动态 API（不缓存或极短缓存）

#### 3.1 只读 API（可短缓存）

| 路由 | 方法 | 描述 | 建议缓存策略 |
|------|------|------|--------------|
| `/api/agents` | GET | Agent 列表查询 | `Cache-Control: private, max-age=30` |
| `/api/agents/:slug` | GET | Agent 详情 | `Cache-Control: private, max-age=60` |
| `/api/stats` | GET | 统计数据 | `Cache-Control: no-store` |
| `/api/stats/ranking` | GET | 下载排行 | `Cache-Control: private, max-age=60` |

**建议：** 对于高流量场景，可在应用层使用内存缓存（如 Redis），而非 HTTP 缓存。

#### 3.2 写操作 API（不可缓存）

| 路由 | 方法 | 描述 | 建议缓存策略 |
|------|------|------|--------------|
| `/api/publish` | POST | 发布 Agent | `Cache-Control: no-store` |
| `/api/publish-upload` | POST | 上传发布 Agent | `Cache-Control: no-store` |
| `/api/install` | POST | 安装 Agent | `Cache-Control: no-store` |

### 4. 动态页面（服务端渲染）

| 路由 | 描述 | 建议缓存策略 |
|------|------|--------------|
| `/` | 首页 | `Cache-Control: no-store` 或 `private, max-age=10` |
| `/agents/:slug` | Agent 详情页 | `Cache-Control: no-store` 或 `private, max-age=30` |
| `/stats` | 统计页面 | `Cache-Control: no-store` |

## 完整 Nginx 缓存配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 静态资源 - 长期缓存
    location /static/ {
        alias /path/to/agenthub/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 技能文件 - 短期缓存
    location ~ ^/skills/.+\.md$ {
        expires 1h;
        add_header Cache-Control "public";
    }

    # API 路由 - 不缓存
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        add_header Cache-Control "no-store";
    }

    # 动态页面 - 代理到应用服务器
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        add_header Cache-Control "no-store";
    }
}
```

## 缓存策略说明

### Cache-Control 指令解释

| 指令 | 含义 |
|------|------|
| `public` | 可被任何缓存（包括 CDN）缓存 |
| `private` | 只能被浏览器缓存，不能被 CDN 缓存 |
| `max-age=N` | 缓存有效期为 N 秒 |
| `immutable` | 资源永远不会改变，浏览器不需要重新验证 |
| `no-store` | 不缓存任何内容 |
| `no-cache` | 可以缓存，但使用前必须验证 |

### 资源类型与缓存建议

1. **带版本号的静态资源**：使用 `immutable`，因为 URL 变化时内容才会变
2. **API 响应**：通常使用 `no-store` 或短 `max-age`，确保数据新鲜
3. **用户特定内容**：使用 `private`，防止 CDN 缓存用户数据

## 架构说明

AgentHub 采用前后端分离架构：

```
┌─────────────────┐     ┌─────────────────┐
│   Web Server    │     │   API Server    │
│   (Port 3000)   │────▶│   (Port 3001)   │
│                 │     │                 │
│  - HTML 页面    │     │  - /api/* 路由  │
│  - /static/*    │     │  - 数据库操作   │
│  - 页面渲染     │     │  - 业务逻辑     │
└─────────────────┘     └─────────────────┘
```

- **Web Server** (`web-server.js`)：负责页面渲染和静态资源服务
- **API Server** (`server.js`)：负责数据处理和 API 接口

这种架构便于：
- 独立扩展 Web 层和 API 层
- 对不同类型的请求应用不同的缓存策略
- 在 API 层前添加限流、认证等中间件
