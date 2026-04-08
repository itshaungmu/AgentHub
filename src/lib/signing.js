/**
 * Signing Module
 * Bundle 签名与完整性校验 — AgentHub 信任链核心
 *
 * 职责:
 * 1. 为 Bundle 生成 SHA-256 校验和
 * 2. 使用 HMAC 签名
 * 3. 安装前验证签名完整性
 */

import { createHash, createHmac } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { pathExists, writeJson, readJson } from "./fs-utils.js";

const SIGNATURE_FILE = "SIGNATURE.json";
const HASH_ALGORITHM = "sha256";

/**
 * 计算文件的 SHA-256 哈希
 */
async function hashFile(filePath) {
  const content = await readFile(filePath);
  return createHash(HASH_ALGORITHM).update(content).digest("hex");
}

/**
 * 递归收集目录中所有文件的哈希
 */
async function collectChecksums(dirPath, basePath = "") {
  const checksums = {};
  const entries = await readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

    // 跳过签名文件本身
    if (!basePath && entry.name === SIGNATURE_FILE) continue;

    if (entry.isDirectory()) {
      const subChecksums = await collectChecksums(fullPath, relativePath);
      Object.assign(checksums, subChecksums);
    } else if (entry.isFile()) {
      checksums[relativePath] = `${HASH_ALGORITHM}:${await hashFile(fullPath)}`;
    }
  }

  return checksums;
}

/**
 * 为 Bundle 生成签名
 *
 * @param {string} bundleDir - Bundle 目录路径
 * @param {object} options
 * @param {string} options.signer - 签名者标识（用户名或邮箱）
 * @param {string} [options.secret] - HMAC 密钥
 * @returns {Promise<object>} 签名信息
 */
export async function signBundle(bundleDir, options = {}) {
  const { signer = "anonymous", secret = "agenthub-default-secret" } = options;

  // 1. 收集所有文件的校验和
  const checksums = await collectChecksums(bundleDir);

  // 2. 将校验和排序后计算总哈希（确保顺序一致性）
  const sortedKeys = Object.keys(checksums).sort();
  const checksumString = sortedKeys.map((k) => `${k}:${checksums[k]}`).join("\n");
  const contentHash = createHash(HASH_ALGORITHM).update(checksumString).digest("hex");

  // 3. 使用 HMAC 签名
  const signature = createHmac(HASH_ALGORITHM, secret).update(contentHash).digest("hex");

  const signatureData = {
    algorithm: HASH_ALGORITHM,
    signer,
    timestamp: new Date().toISOString(),
    contentHash,
    signature: `hmac-${HASH_ALGORITHM}:${signature}`,
    checksums,
    fileCount: sortedKeys.length,
  };

  // 4. 写入签名文件
  await writeJson(path.join(bundleDir, SIGNATURE_FILE), signatureData);

  return signatureData;
}

/**
 * 验证 Bundle 签名
 *
 * @param {string} bundleDir - Bundle 目录路径
 * @param {object} [options]
 * @param {string} [options.secret] - HMAC 密钥
 * @returns {Promise<{valid: boolean, reason?: string, details?: object}>}
 */
export async function verifyBundleSignature(bundleDir, options = {}) {
  const { secret = "agenthub-default-secret" } = options;
  const sigPath = path.join(bundleDir, SIGNATURE_FILE);

  // 1. 检查签名文件是否存在
  if (!(await pathExists(sigPath))) {
    return { valid: false, reason: "No signature file found", unsigned: true };
  }

  const signatureData = await readJson(sigPath);

  // 2. 重新收集校验和
  const currentChecksums = await collectChecksums(bundleDir);

  // 3. 比对文件列表
  const signedFiles = Object.keys(signatureData.checksums).sort();
  const currentFiles = Object.keys(currentChecksums).sort();

  const addedFiles = currentFiles.filter((f) => !signedFiles.includes(f));
  const removedFiles = signedFiles.filter((f) => !currentFiles.includes(f));
  const modifiedFiles = signedFiles.filter(
    (f) => currentChecksums[f] && currentChecksums[f] !== signatureData.checksums[f]
  );

  if (addedFiles.length > 0 || removedFiles.length > 0 || modifiedFiles.length > 0) {
    return {
      valid: false,
      reason: "Bundle content has been tampered with",
      details: {
        addedFiles,
        removedFiles,
        modifiedFiles,
      },
    };
  }

  // 4. 验证 HMAC 签名
  const sortedKeys = Object.keys(currentChecksums).sort();
  const checksumString = sortedKeys.map((k) => `${k}:${currentChecksums[k]}`).join("\n");
  const contentHash = createHash(HASH_ALGORITHM).update(checksumString).digest("hex");
  const expectedSig = `hmac-${HASH_ALGORITHM}:${createHmac(HASH_ALGORITHM, secret).update(contentHash).digest("hex")}`;

  if (expectedSig !== signatureData.signature) {
    return { valid: false, reason: "Signature verification failed" };
  }

  return {
    valid: true,
    signer: signatureData.signer,
    timestamp: signatureData.timestamp,
    fileCount: signatureData.fileCount,
  };
}

/**
 * 快速检查 Bundle 是否已签名
 */
export async function isSigned(bundleDir) {
  return pathExists(path.join(bundleDir, SIGNATURE_FILE));
}
