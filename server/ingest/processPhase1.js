import prisma from "../../lib/prisma.js";
import { analyzePdf } from "./analyzePdf.js";
import { extractTextFromPdfPage } from "./extractText.js";
import { renderPdfPageToImage } from "./renderPage.js";
import { cleanText } from "./cleanText.js";
import { detectLanguage } from "./detectLanguage.js";
import { uploadJson } from "../storage/upload.js";
import { getPageOcrJsonPath } from "../storage/paths.js";

/**
 * Phase 1 PDF Analyzer & Ingestion Engine (No OCR).
 *
 * 1. Analyzes PDF pages using pdfjs-dist.
 * 2. Determines:
 *    - Total page count
 *    - Which pages contain selectable text (DIGITAL)
 *    - Which pages appear to be scanned (SCANNED)
 *    - Which pages contain both text and images (MIXED)
 *    - Which pages appear blank or unreadable (BLANK_OR_UNREADABLE)
 * 3. Extracts selectable text directly from digital/mixed pages without calling OCR.
 * 4. Preserves pageNumber (1-based) and pdfPageIndex (0-based) separately.
 * 5. Idempotently stores BookPage records, OcrBlocks, and analysis results.
 * 6. Updates Book metadata (pageCount, processingStatus = COMPLETED).
 *
 * @param {string} bookId - ID of the registered book
 * @param {Buffer} pdfBuffer - Buffer of the original PDF
 * @returns {Promise<{
 *   bookId: string,
 *   totalPages: number,
 *   summary: Object,
 *   pages: Array<Object>
 * }>}
 */
export async function processPhase1Book(bookId, pdfBuffer) {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
  });

  if (!book) {
    throw new Error(`Book ${bookId} not found`);
  }

  // Update book status to ANALYZING
  await prisma.book.update({
    where: { id: bookId },
    data: { processingStatus: "ANALYZING" },
  });

  try {
    // 1. Analyze PDF using pdfjs-dist
    const analysis = await analyzePdf(pdfBuffer);
    const totalPages = analysis.pageCount;

    // 2. Iterate pages and extract selectable text where available
    const processedPages = [];

    for (const pageMeta of analysis.pages) {
      const pageNumber = pageMeta.pageNumber;
      const pdfPageIndex = pageMeta.pdfPageIndex;

      let rawText = "";
      let blocks = [];
      let detectedLang = book.language || "Hindi";
      let ocrConfidence = null;

      // Extract text directly if page has selectable text (DIGITAL or MIXED)
      if (pageMeta.hasSelectableText) {
        try {
          const extracted = await extractTextFromPdfPage(pdfBuffer, pageNumber);
          rawText = extracted.rawText || "";
          blocks = extracted.blocks || [];
          ocrConfidence = 1.0; // 100% digital selectable confidence
          detectedLang = detectLanguage(rawText) || book.language || "Hindi";
        } catch (extractErr) {
          console.warn(`Extraction error on page ${pageNumber}:`, extractErr.message);
          await prisma.ocrError.create({
            data: {
              bookId: book.id,
              errorType: "TEXT_EXTRACTION_FAILED",
              message: `Page ${pageNumber} extraction notice: ${extractErr.message}`,
              confidence: 0,
            },
          });
        }
      } else if (pageMeta.isBlankOrUnreadable) {
        // Log blank page warning for visibility
        await prisma.ocrError.create({
          data: {
            bookId: book.id,
            errorType: "EMPTY_PAGE",
            message: `Page ${pageNumber} appears blank or unreadable.`,
            confidence: 0,
          },
        });
      }

      // Clean text while preserving Hindi/Sanskrit characters
      const cleanedText = rawText ? cleanText(rawText) : "";

      // Optional: Save JSON analysis output for inspection
      try {
        const jsonPath = getPageOcrJsonPath(book.id, pageNumber);
        await uploadJson(jsonPath, {
          pageNumber,
          pdfPageIndex,
          classification: pageMeta.classification,
          hasSelectableText: pageMeta.hasSelectableText,
          imageCount: pageMeta.imageCount,
          rawText,
          cleanedText,
          blocks,
        });
      } catch (storageErr) {
        console.warn(`Could not upload JSON metadata for page ${pageNumber}:`, storageErr.message);
      }

      // Render page image so admin proofreading and page preview can view original scan/page
      let pageImageUrl = null;
      let renderedWidth = pageMeta.width;
      let renderedHeight = pageMeta.height;
      try {
        const rendered = await renderPdfPageToImage(pdfBuffer, pageNumber, book.id, {
          format: "webp",
        });
        pageImageUrl = rendered.publicUrl;
        renderedWidth = rendered.width || pageMeta.width;
        renderedHeight = rendered.height || pageMeta.height;
      } catch (renderErr) {
        console.warn(`Could not render image for page ${pageNumber}:`, renderErr.message);
      }

      // 3. Upsert BookPage record idempotently
      const existingPage = await prisma.bookPage.findUnique({
        where: {
          bookId_pageNumber: {
            bookId: book.id,
            pageNumber,
          },
        },
      });

      let pageRecord;
      if (existingPage) {
        pageRecord = await prisma.bookPage.update({
          where: { id: existingPage.id },
          data: {
            pdfPageIndex,
            imageUrl: pageImageUrl || existingPage.imageUrl,
            processingMethod: pageMeta.processingMethod,
            rawText: rawText || null,
            cleanedText: cleanedText || null,
            language: detectedLang,
            ocrConfidence,
            width: renderedWidth,
            height: renderedHeight,
            ocrCompleted: pageMeta.hasSelectableText, // Marked complete if digital text is already extracted
          },
        });

        // Clear existing blocks for this page to prevent duplicate entries
        await prisma.ocrBlock.deleteMany({
          where: { pageId: existingPage.id },
        });
      } else {
        pageRecord = await prisma.bookPage.create({
          data: {
            bookId: book.id,
            pageNumber,
            pdfPageIndex,
            imageUrl: pageImageUrl,
            processingMethod: pageMeta.processingMethod,
            rawText: rawText || null,
            cleanedText: cleanedText || null,
            language: detectedLang,
            ocrConfidence,
            width: renderedWidth,
            height: renderedHeight,
            ocrCompleted: pageMeta.hasSelectableText,
          },
        });
      }

      // 4. Save extracted layout blocks
      if (blocks.length > 0) {
        for (const b of blocks) {
          await prisma.ocrBlock.create({
            data: {
              pageId: pageRecord.id,
              text: b.text,
              confidence: b.confidence ?? 1.0,
              x: b.bbox ? b.bbox.x : null,
              y: b.bbox ? b.bbox.y : null,
              width: b.bbox ? b.bbox.width : null,
              height: b.bbox ? b.bbox.height : null,
              blockOrder: b.order || 1,
              language: b.language || detectedLang,
            },
          });
        }
      }

      processedPages.push({
        pageNumber,
        pdfPageIndex,
        classification: pageMeta.classification,
        hasSelectableText: pageMeta.hasSelectableText,
        textLength: rawText.length,
      });
    }

    // 5. Update book summary
    const updatedBook = await prisma.book.update({
      where: { id: book.id },
      data: {
        pageCount: totalPages,
        processingStatus: "COMPLETED",
        status: "RECEIVED",
      },
    });

    return {
      bookId: updatedBook.id,
      totalPages,
      summary: analysis.summary,
      pages: processedPages,
    };
  } catch (err) {
    console.error(`Phase 1 processing error on book ${bookId}:`, err);
    await prisma.book.update({
      where: { id: bookId },
      data: { processingStatus: "FAILED" },
    });
    throw err;
  }
}
