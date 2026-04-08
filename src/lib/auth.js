/**
 * Auth Module
 * 用户认证模块 — AgentHub 权限治理核心
 *
 * 实现本地 Token 认证（类似 npm token），不依赖外部 OAuth
 *
 * 职责:
 * 1. 用户注册/登录
 * 2. API Token 生成/验证/吊销
 * 3. 密码哈希（基于 Node.js 内置 crypto，零依赖）
 */

import { randomBytes, createHmac, timingSafeEqual, scryptSync } from "node:crypto";

// Token 配置
const TOKEN_PREFIX = "ah_";
const TOKEN_BYTES = 32;
const SALT_BYTES = 16;
const SCRYPT_KEYLEN = 64;

/**
 * 生成安全的密码哈希
 * 使用 scrypt（Node.js 内置，零依赖）
 */
export function hashPassword(password) {
  const salt = randomBytes(SALT_BYTES).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * 验证密码
 */
export function verifyPassword(password, storedHash) {
  const [salt, hash] = storedHash.split(":");
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  try {
    return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
  } catch {
    return false;
  }
}

/**
 * 生成 API Token
 *
 * Token 格式: ah_<random_hex>
 * 存储: 只存 HMAC 哈希，不存原始 Token
 *
 * @param {string} [secret] - HMAC 密钥（可选，默认生成随机密钥）
 * @returns {{ token: string, tokenHash: string }}
 */
export function generateApiToken(secret) {
  const raw = randomBytes(TOKEN_BYTES).toString("hex");
  const token = `${TOKEN_PREFIX}${raw}`;
  const tokenHash = hashToken(token, secret);
  return { token, tokenHash };
}

/**
 * 计算 Token 的 HMAC 哈希（用于安全存储）
 */
export function hashToken(token, secret = "agenthub-default-secret") {
  return createHmac("sha256", secret).update(token).digest("hex");
}

/**
 * 验证 API Token 格式
 */
export function isValidTokenFormat(token) {
  return typeof token === "string" && token.startsWith(TOKEN_PREFIX) && token.length === TOKEN_PREFIX.length + TOKEN_BYTES * 2;
}

/**
 * 从请求头中提取 Token
 * 支持两种格式：
 *   Authorization: Bearer ah_xxx
 *   X-Api-Token: ah_xxx
 */
export function extractToken(request) {
  const authHeader = request.headers?.authorization || request.headers?.Authorization;
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) return match[1];
  }
  return request.headers?.["x-api-token"] || null;
}

// === Token Scope 权限定义 ===

export const SCOPES = {
  READ_AGENT: "read:agent",
  WRITE_AGENT: "write:agent",
  PUBLISH: "publish",
  ADMIN: "admin",
};

const SCOPE_HIERARCHY = {
  [SCOPES.ADMIN]: [SCOPES.PUBLISH, SCOPES.WRITE_AGENT, SCOPES.READ_AGENT],
  [SCOPES.PUBLISH]: [SCOPES.WRITE_AGENT, SCOPES.READ_AGENT],
  [SCOPES.WRITE_AGENT]: [SCOPES.READ_AGENT],
  [SCOPES.READ_AGENT]: [],
};

/**
 * 检查 Token 的 scope 是否包含所需权限
 */
export function hasScope(tokenScopes, requiredScope) {
  if (!tokenScopes || !requiredScope) return false;
  const scopes = typeof tokenScopes === "string" ? tokenScopes.split(",").map((s) => s.trim()) : tokenScopes;

  // 直接匹配
  if (scopes.includes(requiredScope)) return true;

  // 通过层级匹配（admin 包含所有权限）
  for (const scope of scopes) {
    const implies = SCOPE_HIERARCHY[scope];
    if (implies && implies.includes(requiredScope)) return true;
  }
  return false;
}

/**
 * 默认 Token Scope
 */
export const DEFAULT_SCOPES = `${SCOPES.READ_AGENT},${SCOPES.PUBLISH}`;

// === OAuth 配置（通过环境变量注入） ===

export const OAUTH_PROVIDERS = {
  github: {
    name: "GitHub",
    authorizeUrl: "https://github.com/login/oauth/authorize",
    tokenUrl: "https://github.com/login/oauth/access_token",
    userInfoUrl: "https://api.github.com/user",
    scopes: "read:user user:email",
    clientId: () => process.env.GITHUB_CLIENT_ID || "",
    clientSecret: () => process.env.GITHUB_CLIENT_SECRET || "",
  },
  google: {
    name: "Google",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
    scopes: "openid email profile",
    clientId: () => process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET || "",
  },
};

/**
 * 检查 OAuth 提供商是否已配置
 */
export function isOAuthConfigured(provider) {
  const config = OAUTH_PROVIDERS[provider];
  if (!config) return false;
  return Boolean(config.clientId() && config.clientSecret());
}

/**
 * 获取已配置的 OAuth 提供商列表
 */
export function getConfiguredProviders() {
  return Object.keys(OAUTH_PROVIDERS).filter(isOAuthConfigured);
}

/**
 * 生成 OAuth 授权 URL
 *
 * @param {string} provider - "github" 或 "google"
 * @param {string} redirectUri - 回调 URL（如 https://agenthub.cyou/api/auth/callback/github）
 * @param {string} [state] - CSRF state 参数
 * @returns {string} 授权 URL
 */
export function getOAuthAuthorizeUrl(provider, redirectUri, state) {
  const config = OAUTH_PROVIDERS[provider];
  if (!config) throw new Error(`Unknown OAuth provider: ${provider}`);
  if (!config.clientId()) throw new Error(`${config.name} OAuth not configured: set ${provider.toUpperCase()}_CLIENT_ID`);

  const csrfState = state || randomBytes(16).toString("hex");
  const params = new URLSearchParams({
    client_id: config.clientId(),
    redirect_uri: redirectUri,
    scope: config.scopes,
    state: csrfState,
    response_type: "code",
  });

  // Google 需要 access_type 参数
  if (provider === "google") {
    params.set("access_type", "offline");
    params.set("prompt", "consent");
  }

  return {
    url: `${config.authorizeUrl}?${params.toString()}`,
    state: csrfState,
  };
}

/**
 * 用 authorization code 换取 access token
 *
 * @param {string} provider - "github" 或 "google"
 * @param {string} code - 授权码
 * @param {string} redirectUri - 回调 URL（必须与授权时一致）
 * @returns {Promise<string>} access token
 */
export async function exchangeCodeForToken(provider, code, redirectUri) {
  const config = OAUTH_PROVIDERS[provider];
  if (!config) throw new Error(`Unknown OAuth provider: ${provider}`);

  const body = {
    client_id: config.clientId(),
    client_secret: config.clientSecret(),
    code,
    redirect_uri: redirectUri,
  };

  if (provider === "google") {
    body.grant_type = "authorization_code";
  }

  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  const response = await fetch(config.tokenUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OAuth token exchange failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * 用 access token 获取用户信息
 *
 * @param {string} provider - "github" 或 "google"
 * @param {string} accessToken - OAuth access token
 * @returns {Promise<{id: string, username: string, email: string, avatar: string, provider: string}>}
 */
export async function getOAuthUserInfo(provider, accessToken) {
  const config = OAUTH_PROVIDERS[provider];
  if (!config) throw new Error(`Unknown OAuth provider: ${provider}`);

  const headers = { Authorization: `Bearer ${accessToken}`, Accept: "application/json" };

  if (provider === "github") {
    headers["User-Agent"] = "AgentHub";
  }

  const response = await fetch(config.userInfoUrl, { headers });
  if (!response.ok) {
    throw new Error(`OAuth user info failed (${response.status})`);
  }

  const data = await response.json();

  if (provider === "github") {
    // GitHub: 需要额外请求获取 email（如果 profile 中未公开）
    let email = data.email;
    if (!email) {
      try {
        const emailRes = await fetch("https://api.github.com/user/emails", { headers });
        if (emailRes.ok) {
          const emails = await emailRes.json();
          const primary = emails.find((e) => e.primary) || emails[0];
          email = primary?.email || null;
        }
      } catch {
        // 忽略 email 获取失败
      }
    }
    return {
      id: String(data.id),
      username: data.login,
      email,
      avatar: data.avatar_url,
      displayName: data.name || data.login,
      provider: "github",
    };
  }

  if (provider === "google") {
    return {
      id: data.id,
      username: data.email?.split("@")[0] || data.id,
      email: data.email,
      avatar: data.picture,
      displayName: data.name,
      provider: "google",
    };
  }

  throw new Error(`Unsupported provider: ${provider}`);
}
