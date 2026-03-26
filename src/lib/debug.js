/**
 * Debug Logger
 * 性能日志工具，用于调试和性能分析
 */

const DEBUG = process.env.AGENTHUB_DEBUG === "true" || process.env.AGENTHUB_DEBUG === "1";

/**
 * 计时器存储
 */
const timers = new Map();

/**
 * 开始计时
 * @param {string} label - 计时标签
 */
export function time(label) {
  if (!DEBUG) return;
  timers.set(label, Date.now());
}

/**
 * 结束计时并输出
 * @param {string} label - 计时标签
 * @returns {number|null} 耗时毫秒数
 */
export function timeEnd(label) {
  if (!DEBUG) return null;
  const start = timers.get(label);
  if (!start) return null;
  const elapsed = Date.now() - start;
  timers.delete(label);
  console.log(`[DEBUG] ${label}: ${elapsed}ms`);
  return elapsed;
}

/**
 * 输出调试日志
 * @param {string} message - 日志消息
 * @param {...any} args - 额外参数
 */
export function debug(message, ...args) {
  if (!DEBUG) return;
  const timestamp = new Date().toISOString().split("T")[1].slice(0, 12);
  console.log(`[DEBUG ${timestamp}] ${message}`, ...args);
}

/**
 * 输出警告日志
 * @param {string} message - 日志消息
 * @param {...any} args - 额外参数
 */
export function warn(message, ...args) {
  if (!DEBUG) return;
  const timestamp = new Date().toISOString().split("T")[1].slice(0, 12);
  console.warn(`[WARN ${timestamp}] ${message}`, ...args);
}

/**
 * 输出错误日志
 * @param {string} message - 日志消息
 * @param {...any} args - 额外参数
 */
export function error(message, ...args) {
  if (!DEBUG) return;
  const timestamp = new Date().toISOString().split("T")[1].slice(0, 12);
  console.error(`[ERROR ${timestamp}] ${message}`, ...args);
}

/**
 * 性能追踪装饰器
 * @param {string} label - 标签
 * @param {Function} fn - 要执行的函数
 * @returns {any} 函数执行结果
 */
export async function trace(label, fn) {
  time(label);
  try {
    const result = await fn();
    timeEnd(label);
    return result;
  } catch (err) {
    timeEnd(label);
    throw err;
  }
}

/**
 * 同步版本的性能追踪
 * @param {string} label - 标签
 * @param {Function} fn - 要执行的函数
 * @returns {any} 函数执行结果
 */
export function traceSync(label, fn) {
  time(label);
  try {
    const result = fn();
    timeEnd(label);
    return result;
  } catch (err) {
    timeEnd(label);
    throw err;
  }
}

export default {
  DEBUG,
  time,
  timeEnd,
  debug,
  warn,
  error,
  trace,
  traceSync,
};
