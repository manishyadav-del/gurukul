import fs from "fs/promises";
import path from "path";
import { getStorageRoot, getPrivateStorageRoot } from "./paths.js";

/**
 * Read/download file from storage.
 * Safely resolves from private storage root or public uploads root.
 * 
 * @param {string} relativePath - Relative path inside storage root
 * @returns {Promise<Buffer>}
 */
export async function downloadFile(relativePath) {
  const provider = (process.env.STORAGE_PROVIDER || "local").toLowerCase();

  if (provider === "local") {
    const roots = [getPrivateStorageRoot(), getStorageRoot()];

    for (const root of roots) {
      const fullPath = path.resolve(root, relativePath);
      if (!fullPath.startsWith(root)) {
        throw new Error(`Path traversal attempt detected: ${relativePath}`);
      }

      try {
        await fs.access(fullPath);
        return await fs.readFile(fullPath);
      } catch (err) {
        if (err.code !== "ENOENT") throw err;
      }
    }

    throw new Error(`File not found in storage: ${relativePath}`);
  }

  throw new Error(`Unsupported STORAGE_PROVIDER: ${provider}`);
}

/**
 * Check if a file exists in storage.
 */
export async function fileExists(relativePath) {
  try {
    const roots = [getPrivateStorageRoot(), getStorageRoot()];
    for (const root of roots) {
      const fullPath = path.resolve(root, relativePath);
      if (fullPath.startsWith(root)) {
        try {
          await fs.access(fullPath);
          return true;
        } catch {}
      }
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Read and parse JSON from storage.
 */
export async function downloadJson(relativePath) {
  const buffer = await downloadFile(relativePath);
  return JSON.parse(buffer.toString("utf-8"));
}

/**
 * Delete a file from storage.
 */
export async function deleteFile(relativePath) {
  const root = getStorageRoot();
  const fullPath = path.resolve(root, relativePath);

  if (!fullPath.startsWith(root)) {
    throw new Error(`Path traversal attempt detected: ${relativePath}`);
  }

  try {
    await fs.unlink(fullPath);
    return true;
  } catch (err) {
    if (err.code === "ENOENT") return false;
    throw err;
  }
}
