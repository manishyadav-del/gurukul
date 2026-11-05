import prisma from "../../lib/prisma.js";
import { downloadFile } from "../storage/download.js";
import { jobProcessPage } from "./processPage.js";
import { analyzePdf } from "../ingest/analyzePdf.js";

/**
 * Retry OCR processing for a single page within a book.
 * Independently retries without reprocessing the entire book.
 * Preserves existing manual human proofreading unless explicit overwrite requested.
 *
 * @param {string} pageId - BookPage UUID to retry
 * @param {Object} [options] - Retry options (forceOcr, forceOverwriteProofread, dpi)
 * @returns {Promise<{ success: boolean, page: Object, skipped: boolean }>}
 */
export async function retryPage(pageId, options = {}) {
  const existingPage = await prisma.bookPage.findUnique({
    where: { id: pageId },
    include: {
      book: {
        select: { id: true, title: true, originalFileUrl: true, language: true, script: true },
      },
    },
  });

  if (!existingPage) {
    throw new Error(`Page ${pageId} not found`);
  }

  const { book } = existingPage;

  if (!book.originalFileUrl) {
    throw new Error(`Book ${book.id} has no originalFileUrl — cannot retry page`);
  }

  const pdfBuffer = await downloadFile(book.originalFileUrl);
  const analysis = await analyzePdf(pdfBuffer, {
    language: book.language,
    script: book.script,
    forceOcr: options.forceOcr ?? true, // Default to forcing OCR on explicit retry
  });

  const pageMeta = analysis.pages.find(
    (p) => p.pageNumber === existingPage.pageNumber
  );

  if (!pageMeta) {
    throw new Error(`Page number ${existingPage.pageNumber} not found in PDF analysis`);
  }

  const result = await jobProcessPage({
    pdfBuffer,
    pageMeta,
    book,
    options: {
      forceRetry: true,
      forceOcr: options.forceOcr ?? true,
      forceOverwriteProofread: Boolean(options.forceOverwriteProofread),
      dpi: options.dpi || 300,
      qualityPipeline: options.qualityPipeline !== false,
      ...options,
    },
  });

  return {
    success: true,
    page: result.page,
    skipped: result.skipped,
  };
}
