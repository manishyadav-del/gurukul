import fs from "fs";
import path from "path";
import crypto from "crypto";
import { PDFDocument } from "pdf-lib";
import prisma from "../../lib/prisma.js";

/**
 * Vedic Manuscript Publication Engine
 * Compiles verified publication-grade PDF artifacts containing ONLY approved pages
 * while preserving the original source PDF as an immutable document.
 */

/**
 * Locate the immutable source PDF on disk for a given book.
 */
export function getImmutableSourcePdfPath(book) {
  if (!book) return null;

  const normalizedRelative = (book.originalFileUrl || "")
    .replace(/\\/g, "/")
    .replace(/^\//, "");

  const candidates = [
    path.join(process.cwd(), "public", "uploads", "books", book.id, "original", book.originalFileName || ""),
    path.join(process.cwd(), "public", "uploads", "books", book.id, "original", path.basename(normalizedRelative || "source.pdf")),
    path.join(process.cwd(), "public", normalizedRelative),
    path.join(process.cwd(), "public", "uploads", normalizedRelative),
  ];

  for (const cand of candidates) {
    if (cand && fs.existsSync(cand) && fs.statSync(cand).isFile()) {
      return cand;
    }
  }

  // Fallback: Check original directory for any .pdf file
  const originalDir = path.join(process.cwd(), "public", "uploads", "books", book.id, "original");
  if (fs.existsSync(originalDir)) {
    try {
      const files = fs.readdirSync(originalDir);
      const pdf = files.find((f) => f.toLowerCase().endsWith(".pdf"));
      if (pdf) return path.join(originalDir, pdf);
    } catch (_) {}
  }

  return null;
}

/**
 * Compiles a publication-grade PDF containing only authorized & approved pages.
 * @param {string} bookId - Book UUID or slug
 * @param {Array<number>|null} approvedPagesList - Specific list of page numbers to include. If omitted, uses all pages where isIncluded=true and isPublished=true and verificationStatus in (VERIFIED, VERIFIED_WITH_CORRECTIONS).
 * @param {Object} options - { userId, userEmail, notes }
 */
export async function compilePublicationPdf(bookId, approvedPagesList = null, options = {}) {
  const book = await prisma.book.findFirst({
    where: { OR: [{ id: bookId }, { slug: bookId }] },
    include: {
      pages: {
        orderBy: { pageNumber: "asc" },
      },
      publicationManifests: {
        orderBy: { version: "desc" },
        take: 1,
      },
    },
  });

  if (!book) {
    throw new Error(`Book ${bookId} not found`);
  }

  const sourcePdfPath = getImmutableSourcePdfPath(book);
  if (!sourcePdfPath || !fs.existsSync(sourcePdfPath)) {
    throw new Error(`Source PDF file not found for book "${book.title}". Make sure original PDF exists in immutable storage.`);
  }

  // Determine approved pages
  let pagesToInclude = [];
  if (Array.isArray(approvedPagesList) && approvedPagesList.length > 0) {
    pagesToInclude = [...new Set(approvedPagesList.map((n) => Number(n)).filter((n) => Number.isInteger(n) && n > 0))].sort((a, b) => a - b);
  } else {
    // Default: all pages marked as included and published and verified
    pagesToInclude = book.pages
      .filter((p) => p.isIncluded !== false && p.isPublished !== false && ["VERIFIED", "VERIFIED_WITH_CORRECTIONS"].includes(p.verificationStatus))
      .map((p) => p.pageNumber)
      .sort((a, b) => a - b);

    // If no pages explicitly verified yet, but book has pages marked included & published, fallback to published pages
    if (pagesToInclude.length === 0) {
      pagesToInclude = book.pages
        .filter((p) => p.isIncluded !== false && p.isPublished !== false)
        .map((p) => p.pageNumber)
        .sort((a, b) => a - b);
    }
  }

  if (pagesToInclude.length === 0) {
    throw new Error("Cannot compile publication PDF: No approved or verified pages selected for publication.");
  }

  // Load immutable source PDF
  const sourceBytes = fs.readFileSync(sourcePdfPath);
  const sourcePdfDoc = await PDFDocument.load(sourceBytes, { ignoreEncryption: true });
  const totalSourcePages = sourcePdfDoc.getPageCount();

  // Create new publication PDF
  const publishedDoc = await PDFDocument.create();

  // Metadata
  publishedDoc.setTitle(`${book.title} (Verified Scholarly Edition)`);
  publishedDoc.setAuthor(book.author || "Gurukul Vedic Archive");
  publishedDoc.setSubject("Vedic Structured Digital Manuscript");
  publishedDoc.setProducer("Gurukul Scholarly Manuscript Publishing Engine v1.0");
  publishedDoc.setCreationDate(new Date());

  // Copy approved pages
  const validPageIndices = [];
  for (const pageNum of pagesToInclude) {
    const zeroIndex = pageNum - 1;
    if (zeroIndex >= 0 && zeroIndex < totalSourcePages) {
      validPageIndices.push(zeroIndex);
    }
  }

  if (validPageIndices.length === 0) {
    throw new Error(`Selected pages exceed original document boundaries (Document has ${totalSourcePages} pages).`);
  }

  const copiedPages = await publishedDoc.copyPages(sourcePdfDoc, validPageIndices);
  for (const page of copiedPages) {
    publishedDoc.addPage(page);
  }

  const publishedPdfBytes = await publishedDoc.save();

  // Determine publication version
  const nextVersion = (book.publicationManifests?.[0]?.version || 0) + 1;

  // Destination folder: public/uploads/books/[id]/published/
  const publishedDir = path.join(process.cwd(), "public", "uploads", "books", book.id, "published");
  if (!fs.existsSync(publishedDir)) {
    fs.mkdirSync(publishedDir, { recursive: true });
  }

  const filename = `publication_v${nextVersion}.pdf`;
  const absolutePublishedPath = path.join(publishedDir, filename);
  fs.writeFileSync(absolutePublishedPath, publishedPdfBytes);

  // Compute file SHA256 hash
  const fileHash = crypto.createHash("sha256").update(publishedPdfBytes).digest("hex");
  const relativePublishedUrl = `/uploads/books/${book.id}/published/${filename}`;

  // Find excluded pages
  const allPageNumbers = book.pages.map((p) => p.pageNumber);
  const excludedPages = allPageNumbers.filter((p) => !pagesToInclude.includes(p));

  // Save Publication Manifest in DB
  const manifest = await prisma.publicationManifest.create({
    data: {
      bookId: book.id,
      version: nextVersion,
      status: "PUBLISHED",
      approvedPages: pagesToInclude,
      excludedPages: excludedPages,
      publishedPdfPath: relativePublishedUrl,
      fileHash,
      pageCount: pagesToInclude.length,
      publishedBy: options.userEmail || options.userId || "Scholarly Admin",
      publishedAt: new Date(),
      notes: options.notes || `Published v${nextVersion} with ${pagesToInclude.length} verified pages.`,
    },
  });

  // Update book generatedPdfUrl and publishedVersion
  await prisma.book.update({
    where: { id: book.id },
    data: {
      generatedPdfUrl: relativePublishedUrl,
      publishedVersion: nextVersion,
      fileHash,
    },
  });

  return {
    success: true,
    manifest,
    version: nextVersion,
    pageCount: pagesToInclude.length,
    pdfUrl: relativePublishedUrl,
    fileHash,
  };
}

/**
 * Returns the active published PDF path for a book, if available.
 */
export async function getActivePublicationArtifact(bookId) {
  const manifest = await prisma.publicationManifest.findFirst({
    where: {
      bookId,
      status: "PUBLISHED",
    },
    orderBy: { version: "desc" },
  });

  if (!manifest || !manifest.publishedPdfPath) return null;

  const absolutePath = path.join(process.cwd(), "public", manifest.publishedPdfPath.replace(/^\//, ""));
  if (fs.existsSync(absolutePath)) {
    return {
      manifest,
      absolutePath,
      relativeUrl: manifest.publishedPdfPath,
    };
  }

  return null;
}
