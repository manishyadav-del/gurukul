import path from "path";

/**
 * Storage path utilities for book ingestion assets.
 * 
 * Directory Structure:
 * books/
 *   {bookId}/
 *     original/
 *       book.pdf
 *     pages/
 *       001.webp
 *     ocr/
 *       001.json
 *     previews/
 *       001.webp
 */

export function padPageNumber(pageNumber, length = 3) {
  return String(pageNumber).padStart(length, "0");
}

export function getBookBasePath(bookId) {
  return path.join("books", bookId);
}

export function getOriginalPdfPath(bookId, filename = "book.pdf") {
  // Sanitize filename to prevent directory traversal
  const safeName = path.basename(filename);
  return path.join("books", bookId, "original", safeName);
}

export function getPageImagePath(bookId, pageNumber, ext = "webp") {
  const padded = padPageNumber(pageNumber);
  return path.join("books", bookId, "pages", `${padded}.${ext}`);
}

export function getPagePreviewPath(bookId, pageNumber, ext = "webp") {
  const padded = padPageNumber(pageNumber);
  return path.join("books", bookId, "previews", `${padded}.${ext}`);
}

export function getPageOcrJsonPath(bookId, pageNumber) {
  const padded = padPageNumber(pageNumber);
  return path.join("books", bookId, "ocr", `${padded}.json`);
}

export function getStorageRoot() {
  const customRoot = process.env.STORAGE_LOCAL_ROOT;
  if (customRoot) {
    return path.resolve(customRoot);
  }
  // Store inside public/uploads so images/previews can be resolved directly by Next.js
  return path.resolve(process.cwd(), "public", "uploads");
}

export function getPrivateStorageRoot() {
  const customPrivate = process.env.STORAGE_PRIVATE_ROOT;
  if (customPrivate) {
    return path.resolve(customPrivate);
  }
  // Store private manuscripts outside the publicly served web directory
  return path.resolve(process.cwd(), "storage", "private");
}

export function getPublicUrl(relativePath) {
  if (!relativePath) return null;
  // Private files (e.g. original source PDFs) never have a public static URL
  if (relativePath.includes("original/") || relativePath.includes("original\\")) {
    return null;
  }
  // Normalize Windows backslashes to forward slashes for URLs
  const normalized = relativePath.split(path.sep).join("/");
  return `/uploads/${normalized}`;
}
