import fs from "fs/promises";
import path from "path";
import { getStorageRoot, getPrivateStorageRoot, getBookBasePath } from "./paths.js";

/**
 * Delete a file from storage safely with path traversal protection.
 * Checks both private and public storage roots.
 * 
 * @param {string} relativePath - Relative path inside storage root
 * @returns {Promise<boolean>} True if file was deleted, false if not found
 */
export async function deleteFile(relativePath) {
  if (!relativePath) return false;
  let deleted = false;

  const roots = [getPrivateStorageRoot(), getStorageRoot()];

  for (const root of roots) {
    const fullPath = path.resolve(root, relativePath);
    if (!fullPath.startsWith(root)) {
      throw new Error(`Path traversal attempt detected: ${relativePath}`);
    }

    try {
      await fs.unlink(fullPath);
      deleted = true;
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.warn(`[Storage] Failed to delete file at ${fullPath}:`, err.message);
      }
    }
  }

  return deleted;
}

/**
 * Deletes all stored assets for a book (pages, previews, original PDF, generated PDFs).
 * 
 * @param {string} bookId - Book UUID
 * @returns {Promise<boolean>}
 */
export async function deleteBookDirectory(bookId) {
  if (!bookId) return false;
  const bookRelative = getBookBasePath(bookId);
  const roots = [getPrivateStorageRoot(), getStorageRoot()];

  for (const root of roots) {
    const fullDir = path.resolve(root, bookRelative);
    if (fullDir.startsWith(root)) {
      try {
        await fs.rm(fullDir, { recursive: true, force: true });
      } catch (err) {
        console.warn(`[Storage] Failed to remove book directory at ${fullDir}:`, err.message);
      }
    }
  }

  return true;
}
