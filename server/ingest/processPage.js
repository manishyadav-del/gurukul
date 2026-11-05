import prisma from "../../lib/prisma.js";
import { renderPdfPageToImage } from "./renderPage.js";
import { extractTextFromPdfPage } from "./extractText.js";
import { recognizeImage } from "../ocr/index.js";
import { cleanText } from "./cleanText.js";
import { detectLanguage } from "./detectLanguage.js";
import { uploadJson } from "../storage/upload.js";
import { getPageOcrJsonPath } from "../storage/paths.js";

/**
 * Processes an individual page of a book:
 * - Renders original page image (WebP) for side-by-side proofreading at 300-400 DPI
 * - Performs digital extraction or quality-pipeline OCR recognition
 * - Cleans text preserving Devanagari script, Sanskrit shlokas, and astrological terms
 * - Detects language (Hindi, Sanskrit, English, Mixed)
 * - Persists BookPage, OcrBlock records, and logs any OcrErrors idempotently.
 * - Strictly preserves manual proofreading corrections unless forceOverwriteProofread is specified.
 * 
 * @param {Object} params
 * @param {Buffer|Uint8Array} params.pdfBuffer - PDF binary
 * @param {Object} params.pageMeta - Analysis record for the page
 * @param {Object} params.book - Book database record
 * @param {Object} [params.options] - Custom thresholds, force OCR, etc.
 * @returns {Promise<BookPage>}
 */
export async function processPage({ pdfBuffer, pageMeta, book, options = {} }) {
  const startTime = Date.now();
  const pageNumber = pageMeta.pageNumber;
  const pdfPageIndex = pageMeta.pdfPageIndex ?? pageNumber - 1;
  const processingMethod = pageMeta.processingMethod || "OCR";
  const ocrTriggerReason = pageMeta.ocrTriggerReason || null;

  // 1. Always render the page image so the proofreader can view the source page
  let renderedImage;
  try {
    renderedImage = await renderPdfPageToImage(pdfBuffer, pageNumber, book.id, {
      dpi: options.dpi || 300,
      format: "webp",
    });
  } catch (err) {
    console.error(`Page ${pageNumber} image rendering failed:`, err);
    await prisma.ocrError.create({
      data: {
        bookId: book.id,
        errorType: "IMAGE_RENDER_FAILED",
        message: `Failed to render page image: ${err.message}`,
        confidence: 0,
      },
    });
    throw err;
  }

  let rawText = "";
  let blocks = [];
  let ocrConfidence = 1.0;
  let ocrStats = null;
  let ocrDiagnostics = null;

  // 2. Extract or Recognize text based on classification
  const lang = String(book.language || "").toLowerCase();
  const isIndic = lang === "hi" || lang === "hindi" || lang === "sa" || lang === "sanskrit" || book.script === "Devanagari";
  const forceOcr = Boolean(options.forceOcr);

  let useOcr = processingMethod === "OCR" || processingMethod === "MIXED" || forceOcr;

  // If a verified Kruti Dev conversion is available from PDF analysis and not forced OCR:
  if (!forceOcr && pageMeta.convertedText && pageMeta.isLegacyFont) {
    rawText = pageMeta.convertedText;
    ocrConfidence = 0.95;
    useOcr = false;
  }

  if (!useOcr && processingMethod === "TEXT_EXTRACTION") {
    try {
      const extracted = await extractTextFromPdfPage(pdfBuffer, pageNumber);
      rawText = extracted.rawText || "";
      blocks = extracted.blocks || [];
      ocrConfidence = 1.0; // Perfect digital score

      // Safety check: if extracted text has legacy 8-bit font mojibake (e.g. Kruti Dev), fallback to OCR
      const devanagariCount = (rawText.match(/[\u0900-\u097F]/g) || []).length;
      if (isIndic && rawText.length > 20 && (devanagariCount / rawText.length < 0.15)) {
        console.warn(`[OCR Fallback] Page ${pageNumber} extracted text appears to be legacy 8-bit font mojibake (only ${devanagariCount} Devanagari chars out of ${rawText.length}). Falling back to OCR.`);
        useOcr = true;
      }
    } catch (err) {
      console.warn(`Digital extraction failed for page ${pageNumber}, falling back to OCR:`, err.message);
      await prisma.ocrError.create({
        data: {
          bookId: book.id,
          errorType: "TEXT_EXTRACTION_FAILED",
          message: `Digital extraction error: ${err.message}. Retrying via OCR.`,
          confidence: 0,
        },
      });
      useOcr = true;
    }
  }

  if (useOcr) {
    // SCANNED, MIXED, legacy-font mojibake, or force OCR - Execute Multi-Attempt Quality Pipeline
    try {
      const ocrResult = await recognizeImage(renderedImage.imageBuffer, {
        pageNumber,
        language: book.language,
        script: book.script,
        engine: options.engine || book.ocrEngine || process.env.OCR_ENGINE,
        qualityPipeline: options.qualityPipeline !== false,
        singlePass: options.singlePass,
      });

      rawText = ocrResult.fullText || "";
      blocks = ocrResult.blocks || [];
      ocrConfidence = ocrResult.stats?.pageConfidence ?? 0.85;
      ocrStats = ocrResult.stats;
      ocrDiagnostics = ocrResult.diagnostics || null;

      // Check for low confidence or empty page errors
      const minConfidence = parseFloat(process.env.OCR_MIN_CONFIDENCE || "0.75");
      if (rawText.trim().length === 0) {
        await prisma.ocrError.create({
          data: {
            bookId: book.id,
            errorType: "EMPTY_PAGE",
            message: `Page ${pageNumber} yielded no OCR text. Trigger reason: ${ocrTriggerReason || "Unknown"}`,
            confidence: ocrConfidence,
          },
        });
      } else if (ocrConfidence < minConfidence) {
        await prisma.ocrError.create({
          data: {
            bookId: book.id,
            errorType: "LOW_CONFIDENCE",
            message: `Page ${pageNumber} confidence (${Math.round(ocrConfidence * 100)}%) is below threshold (${Math.round(minConfidence * 100)}%). Recipe: ${ocrDiagnostics?.winningRecipe || "standard"}`,
            confidence: ocrConfidence,
          },
        });
      }
    } catch (err) {
      console.error(`OCR failed on page ${pageNumber}:`, err);
      await prisma.ocrError.create({
        data: {
          bookId: book.id,
          errorType: "OCR_FAILED",
          message: `OCR engine exception: ${err.message}`,
          confidence: 0,
        },
      });
      throw err;
    }
  }

  // 3. Clean text (never modifies rawText)
  const cleanedText = cleanText(rawText, {
    language: book.language,
    isIndic,
  });

  // 4. Detect language
  const detectedLang = detectLanguage(cleanedText || rawText);

  // 5. Save structured OCR JSON file to storage
  const ocrJsonPath = getPageOcrJsonPath(book.id, pageNumber);
  await uploadJson(ocrJsonPath, {
    pageNumber,
    rawText,
    cleanedText,
    ocrConfidence,
    language: detectedLang,
    blocks,
    stats: ocrStats,
    diagnostics: ocrDiagnostics,
    ocrTriggerReason,
  });

  // 6. Idempotent database upsert of BookPage
  const durationMs = Date.now() - startTime;
  const engineName = (process.env.OCR_ENGINE || "tesseract").toLowerCase();

  const existingPage = await prisma.bookPage.findUnique({
    where: {
      bookId_pageNumber: {
        bookId: book.id,
        pageNumber,
      },
    },
  });

  let bookPage;
  if (existingPage) {
    // Preserve manual corrections unless explicitly requested to overwrite
    const preserveProofread = !options.forceOverwriteProofread && (existingPage.proofread || existingPage.proofreadText);

    bookPage = await prisma.bookPage.update({
      where: { id: existingPage.id },
      data: {
        pdfPageIndex,
        imageUrl: renderedImage.publicUrl,
        width: renderedImage.width,
        height: renderedImage.height,
        processingMethod,
        ocrEngine: engineName,
        rawText,
        cleanedText,
        proofreadText: preserveProofread ? existingPage.proofreadText : null,
        proofread: preserveProofread ? existingPage.proofread : false,
        language: detectedLang,
        ocrConfidence,
        ocrCompleted: true,
        processingDurationMs: durationMs,
        retryCount: (existingPage.retryCount || 0) + 1,
      },
    });

    // Delete old blocks for this page to avoid duplicates
    await prisma.ocrBlock.deleteMany({
      where: { pageId: existingPage.id },
    });
  } else {
    bookPage = await prisma.bookPage.create({
      data: {
        bookId: book.id,
        pageNumber,
        pdfPageIndex,
        imageUrl: renderedImage.publicUrl,
        width: renderedImage.width,
        height: renderedImage.height,
        processingMethod,
        ocrEngine: engineName,
        rawText,
        cleanedText,
        language: detectedLang,
        ocrConfidence,
        ocrCompleted: true,
        processingDurationMs: durationMs,
        retryCount: 0,
      },
    });
  }

  // 7. Insert OcrBlocks
  if (blocks.length > 0) {
    for (const b of blocks) {
      await prisma.ocrBlock.create({
        data: {
          pageId: bookPage.id,
          text: b.text,
          confidence: b.confidence,
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

  return bookPage;
}
