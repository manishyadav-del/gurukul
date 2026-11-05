import prisma from "../../lib/prisma.js";
import { processPage } from "../ingest/processPage.js";

/**
 * Job-level page processor with idempotency and retry mechanics.
 * 
 * If a page is already completed and options.force is not true:
 * - SKIPS execution without recreating blocks or re-running OCR.
 * If failed previously:
 * - RETRIES processing.
 * 
 * @param {Object} params
 * @param {Buffer} params.pdfBuffer
 * @param {Object} params.pageMeta
 * @param {Object} params.book
 * @param {Object} [params.options]
 * @returns {Promise<{ page: BookPage, skipped: boolean }>}
 */
export async function jobProcessPage({ pdfBuffer, pageMeta, book, options = {} }) {
  const pageNumber = pageMeta.pageNumber;

  // Check if page has already been processed successfully
  const existingPage = await prisma.bookPage.findUnique({
    where: {
      bookId_pageNumber: {
        bookId: book.id,
        pageNumber,
      },
    },
  });

  const isIndic = book.language === "hi" || book.language === "sa" || book.language === "Hindi" || book.language === "Sanskrit" || book.script === "Devanagari";
  const existingDevanagari = existingPage?.cleanedText ? (existingPage.cleanedText.match(/[\u0900-\u097F]/g) || []).length : 0;
  const isExistingMojibake = isIndic && (existingPage?.cleanedText?.length || 0) > 20 && (existingDevanagari / existingPage.cleanedText.length < 0.15);

  if (existingPage && existingPage.ocrCompleted && !options.forceRetry && !options.forceOcr && !isExistingMojibake) {
    return {
      page: existingPage,
      skipped: true,
    };
  }

  // Execute single page pipeline
  const processed = await processPage({
    pdfBuffer,
    pageMeta,
    book,
    options,
  });

  return {
    page: processed,
    skipped: false,
  };
}
