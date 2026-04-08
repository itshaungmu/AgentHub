/**
 * Permissions Module
 * Agent 可见性与访问控制
 *
 * 职责:
 * 1. Agent 可见性管理 (public/private/team)
 * 2. 操作权限检查
 * 3. 团队成员授权
 */

// === Agent 可见性级别 ===
export const VISIBILITY = {
  PUBLIC: "public",
  PRIVATE: "private",
  TEAM: "team",
};

// === 操作类型 ===
export const ACTIONS = {
  VIEW: "view",
  INSTALL: "install",
  PUBLISH: "publish",
  UPDATE: "update",
  DELETE: "delete",
};

/**
 * 检查用户是否有权访问 Agent
 *
 * @param {object} agent - Agent manifest (含 permissions 字段)
 * @param {object|null} user - 当前用户 (null 表示匿名)
 * @param {string} action - 操作类型
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function checkAccess(agent, user, action) {
  const permissions = agent?.permissions || {};
  const visibility = permissions.visibility || VISIBILITY.PUBLIC;
  const owner = permissions.owner || "anonymous";

  // 公开 Agent: 所有人可查看/安装
  if (visibility === VISIBILITY.PUBLIC) {
    if (action === ACTIONS.VIEW || action === ACTIONS.INSTALL) {
      return { allowed: true };
    }
    // 发布/更新/删除需要是 owner
    if (user && (user.username === owner || user.role === "admin")) {
      return { allowed: true };
    }
    return { allowed: false, reason: `Only owner (${owner}) or admin can ${action}` };
  }

  // 匿名用户对非公开 Agent 无权限
  if (!user) {
    return { allowed: false, reason: "Authentication required" };
  }

  // 私有 Agent: 仅 owner 可访问
  if (visibility === VISIBILITY.PRIVATE) {
    if (user.username === owner || user.role === "admin") {
      return { allowed: true };
    }
    return { allowed: false, reason: "This agent is private" };
  }

  // 团队 Agent: owner + 授权列表中的用户
  if (visibility === VISIBILITY.TEAM) {
    const allowedUsers = permissions.allowedUsers || [];
    if (user.username === owner || user.role === "admin" || allowedUsers.includes(user.username)) {
      return { allowed: true };
    }
    return { allowed: false, reason: "You are not a member of this team" };
  }

  return { allowed: false, reason: "Unknown visibility level" };
}

/**
 * 在 Agent 列表中过滤用户有权查看的 Agent
 *
 * @param {Array} agents - Agent 列表
 * @param {object|null} user - 当前用户
 * @returns {Array} 过滤后的 Agent 列表
 */
export function filterVisibleAgents(agents, user) {
  return agents.filter((agent) => {
    const result = checkAccess(agent, user, ACTIONS.VIEW);
    return result.allowed;
  });
}

/**
 * 创建默认权限配置
 *
 * @param {string} owner - 发布者用户名
 * @param {string} [visibility] - 可见性级别
 * @returns {object} 权限配置
 */
export function createDefaultPermissions(owner = "anonymous", visibility = VISIBILITY.PUBLIC) {
  return {
    visibility,
    owner,
    allowedUsers: [],
    createdAt: new Date().toISOString(),
  };
}
