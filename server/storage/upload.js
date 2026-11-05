import fs from "fs/promises";
import path from "path";
import { getStorageRoot, getPrivateStorageRoot, getPublicUrl } from "./paths.js";

/**
 * Upload/save file to storage (local filesystem by default, S3/R2 ready).
 * 
 * @param {string} relativePath - Relative path inside storage root (e.g. books/123/original/book.pdf)
 * @param {Buffer|string} content - File content buffer or string
 * @param {Object} options - Options such as contentType, overwrite, isPrivate
 * @returns {Promise<{ relativePath: string, fullPath: string, publicUrl: string|null, bytes: number }>}
 */
export async function uploadFile(relativePath, content, options = {}) {
  const provider = (process.env.STORAGE_PROVIDER || "local").toLowerCase();
  const overwrite = options.overwrite ?? true;
  const isPrivate = options.isPrivate ?? (relativePath.includes("original/") || relativePath.includes("original\\"));

  if (provider === "local") {
    const root = isPrivate ? getPrivateStorageRoot() : getStorageRoot();
    const fullPath = path.resolve(root, relativePath);

    // Prevent directory traversal
    if (!fullPath.startsWith(root)) {
      throw new Error(`Path traversal attempt detected: ${relativePath}`);
    }

    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    if (!overwrite) {
      try {
        await fs.access(fullPath);
        throw new Error(`File already exists at ${relativePath} and overwrite is false.`);
      } catch (err) {
        if (err.code !== "ENOENT") throw err;
      }
    }

    const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
    await fs.writeFile(fullPath, buffer);

    return {
      relativePath,
      fullPath,
      publicUrl: getPublicUrl(relativePath),
      bytes: buffer.length,
    };
  }

  // Future S3 / Cloudflare R2 provider support
  if (provider === "s3" || provider === "r2") {
    // When S3 credentials are configured, S3 SDK putObject can be hooked here
    throw new Error(`S3/R2 upload provider is not fully configured. Using local fallback.`);
  }

  throw new Error(`Unsupported STORAGE_PROVIDER: ${provider}`);
}

/**
 * Save JSON metadata to storage
 */
export async function uploadJson(relativePath, data) {
  const jsonString = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  return uploadFile(relativePath, jsonString, { contentType: "application/json" });
}
