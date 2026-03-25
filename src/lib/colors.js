/**
 * Terminal Colors Utility
 * 简单的终端颜色支持（无需额外依赖）
 */

// 检测是否支持颜色
const supportsColor = process.stdout.isTTY && process.env.NO_COLOR === undefined;

// ANSI 颜色代码
const codes = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

/**
 * 创建颜色函数
 */
function colorize(code) {
  return (text) => supportsColor ? `${code}${text}${codes.reset}` : text;
}

// 导出颜色函数
export const colors = {
  reset: (text) => text,
  bold: colorize(codes.bold),
  dim: colorize(codes.dim),
  red: colorize(codes.red),
  green: colorize(codes.green),
  yellow: colorize(codes.yellow),
  blue: colorize(codes.blue),
  magenta: colorize(codes.magenta),
  cyan: colorize(codes.cyan),
  white: colorize(codes.white),
};

// 语义化颜色
export const success = (text) => colors.green(text);
export const error = (text) => colors.red(text);
export const warning = (text) => colors.yellow(text);
export const info = (text) => colors.cyan(text);
export const highlight = (text) => colors.bold(colors.cyan(text));
export const muted = (text) => colors.dim(text);

// 常用符号
export const symbols = {
  success: supportsColor ? "✓" : "[OK]",
  error: supportsColor ? "✗" : "[ERR]",
  warning: supportsColor ? "⚠" : "[!]",
  info: supportsColor ? "ℹ" : "[i]",
  arrow: supportsColor ? "→" : "->",
  bullet: supportsColor ? "•" : "*",
};
