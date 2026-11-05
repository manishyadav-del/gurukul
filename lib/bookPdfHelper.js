import fs from "fs";
import path from "path";

/**
 * Safely resolves the public URL for a book's digitized PDF edition.
 * Checks filesystem existence to ensure zero PrismaClientValidationError risks.
 * 
 * @param {string} bookId - Book UUID
 * @param {string} bookSlug - Book slug identifier
 * @returns {string|null} Public URL to the PDF or null if not yet generated
 */
export function getGeneratedBookPdfUrl(bookId, bookSlug) {
  if (!bookId) return null;
  const slug = bookSlug || bookId;
  const filename = `${slug}-digitized-edition.pdf`;
  const relativeUrl = `/uploads/books/${bookId}/generated/${filename}`;
  const dirPath = path.join(process.cwd(), "public", "uploads", "books", bookId, "generated");
  const diskPath = path.join(dirPath, filename);

  try {
    if (fs.existsSync(diskPath)) {
      return relativeUrl;
    }
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      const pdfFile = files.find((f) => f.endsWith(".pdf"));
      if (pdfFile) {
        return `/uploads/books/${bookId}/generated/${pdfFile}`;
      }
    }
  } catch (err) {
    // Graceful fallback
  }

  return null;
}
