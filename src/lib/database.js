import path from "node:path";
import { pathExists, ensureDir } from "./fs-utils.js";
import { readFile, writeFile } from "node:fs/promises";
import initSqlJs from "sql.js";

let db = null;
let dbPath = null;

/**
 * 初始化数据库
 */
export async function initDatabase(registryDir) {
  if (db) return db;

  const SQL = await initSqlJs();
  dbPath = path.join(registryDir, "agenthub.db");

  // 确保目录存在
  await ensureDir(registryDir);

  // 尝试加载现有数据库
  if (await pathExists(dbPath)) {
    const buffer = await readFile(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // 创建表
  db.run(`
    CREATE TABLE IF NOT EXISTS download_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_slug TEXT NOT NULL UNIQUE,
      downloads INTEGER DEFAULT 0,
      last_download_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS download_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_slug TEXT NOT NULL,
      installed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      target_workspace TEXT,
      ip_address TEXT,
      user_agent TEXT
    )
  `);

  // 创建索引
  db.run(`CREATE INDEX IF NOT EXISTS idx_download_stats_slug ON download_stats(agent_slug)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_download_logs_slug ON download_logs(agent_slug)`);

  await saveDatabase();
  return db;
}

/**
 * 保存数据库到文件
 */
export async function saveDatabase() {
  if (!db || !dbPath) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  await writeFile(dbPath, buffer);
}

/**
 * 关闭数据库连接
 */
export async function closeDatabase() {
  if (db) {
    await saveDatabase();
    db.close();
    db = null;
  }
}

/**
 * 增加下载次数
 */
export async function incrementDownloads(registryDir, slug, metadata = {}) {
  await initDatabase(registryDir);

  // 更新或插入下载统计
  const existing = db.exec(`SELECT downloads FROM download_stats WHERE agent_slug = ?`, [slug]);

  if (existing.length > 0 && existing[0].values.length > 0) {
    db.run(`
      UPDATE download_stats
      SET downloads = downloads + 1,
          last_download_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE agent_slug = ?
    `, [slug]);
  } else {
    db.run(`
      INSERT INTO download_stats (agent_slug, downloads, last_download_at, created_at, updated_at)
      VALUES (?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [slug]);
  }

  // 记录下载日志
  db.run(`
    INSERT INTO download_logs (agent_slug, target_workspace, ip_address, user_agent)
    VALUES (?, ?, ?, ?)
  `, [slug, metadata.targetWorkspace || null, metadata.ip || null, metadata.userAgent || null]);

  await saveDatabase();

  return getAgentDownloads(registryDir, slug);
}

/**
 * 获取单个 Agent 的下载次数
 */
export async function getAgentDownloads(registryDir, slug) {
  await initDatabase(registryDir);

  const result = db.exec(`SELECT downloads FROM download_stats WHERE agent_slug = ?`, [slug]);
  if (result.length > 0 && result[0].values.length > 0) {
    return result[0].values[0][0];
  }
  return 0;
}

/**
 * 批量获取多个 Agent 的下载次数
 */
export async function getAgentsDownloads(registryDir, slugs) {
  await initDatabase(registryDir);

  const result = {};
  for (const slug of slugs) {
    result[slug] = 0;
  }

  const placeholders = slugs.map(() => '?').join(',');
  const rows = db.exec(`SELECT agent_slug, downloads FROM download_stats WHERE agent_slug IN (${placeholders})`, slugs);

  if (rows.length > 0) {
    for (const row of rows[0].values) {
      result[row[0]] = row[1];
    }
  }

  return result;
}

/**
 * 获取所有 Agent 的下载次数
 */
export async function getAllDownloads(registryDir) {
  await initDatabase(registryDir);

  const result = {};
  const rows = db.exec(`SELECT agent_slug, downloads FROM download_stats`);

  if (rows.length > 0) {
    for (const row of rows[0].values) {
      result[row[0]] = row[1];
    }
  }

  return result;
}

/**
 * 获取总下载次数
 */
export async function getTotalDownloads(registryDir) {
  await initDatabase(registryDir);

  const result = db.exec(`SELECT COALESCE(SUM(downloads), 0) as total FROM download_stats`);
  if (result.length > 0 && result[0].values.length > 0) {
    return result[0].values[0][0];
  }
  return 0;
}

/**
 * 获取下载排行
 */
export async function getDownloadRanking(registryDir, limit = 10) {
  await initDatabase(registryDir);

  const rows = db.exec(`
    SELECT agent_slug, downloads, last_download_at
    FROM download_stats
    ORDER BY downloads DESC
    LIMIT ?
  `, [limit]);

  if (rows.length > 0) {
    return rows[0].values.map(row => ({
      slug: row[0],
      downloads: row[1],
      lastDownload: row[2]
    }));
  }
  return [];
}

/**
 * 获取最近的下载日志
 */
export async function getRecentDownloads(registryDir, limit = 50) {
  await initDatabase(registryDir);

  const rows = db.exec(`
    SELECT agent_slug, installed_at, target_workspace
    FROM download_logs
    ORDER BY installed_at DESC
    LIMIT ?
  `, [limit]);

  if (rows.length > 0) {
    return rows[0].values.map(row => ({
      slug: row[0],
      installedAt: row[1],
      targetWorkspace: row[2]
    }));
  }
  return [];
}

/**
 * 获取数据库统计信息
 */
export async function getDatabaseStats(registryDir) {
  await initDatabase(registryDir);

  const totalAgents = db.exec(`SELECT COUNT(*) FROM download_stats`)[0]?.values[0][0] || 0;
  const totalDownloads = await getTotalDownloads(registryDir);
  const totalLogs = db.exec(`SELECT COUNT(*) FROM download_logs`)[0]?.values[0][0] || 0;

  return {
    totalAgents,
    totalDownloads,
    totalLogs
  };
}
