/**
 * Phase 2 OCR Verification Test Suite (Pure JavaScript, Next.js / Node.js Only)
 *
 * Verifies:
 * 1. English scanned OCR recognition & confidence metrics
 * 2. Hindi scanned OCR recognition (Devanagari script: गुरु, शनि)
 * 3. Sanskrit scanned shloka OCR recognition (॥ अथ प्रथमोऽध्यायः ॥)
 * 4. Mixed-script OCR recognition (English + Hindi)
 * 5. Low-resolution scans handling
 * 6. Blank pages detection & quality flagging (EMPTY_PAGE)
 * 7. Rotation correction / preprocessing pipeline
 * 8. OCR output normalization & contract verification (blocks, bbox, order)
 * 9. Quality assessment rule thresholds (High >=0.90, Medium 0.75-0.89, Low <0.75)
 * 10. Single-page retry API mechanics (retryPage)
 * 11. Database persistence in BookPage (ocrEngine, processingDurationMs, retryCount, rawText)
 * 12. Digital-text extraction preservation (Phase 1 coexistence)
 */

import prisma from "../lib/prisma.js";
import {
  createEnglishScannedImageBuffer,
  createHindiScannedImageBuffer,
  createSanskritScannedImageBuffer,
  createMixedScriptScannedImageBuffer,
  createLowResScannedImageBuffer,
  createBlankScannedImageBuffer,
  createRotatedScannedImageBuffer,
} from "./fixtures/scannedFixtures.js";
import { createDigitalPdfBuffer } from "./fixtures/pdfFixtures.js";
import { recognizeImage } from "../server/ocr/adapter.js";
import { normalizeOcrResult } from "../server/ocr/normalize.js";
import { calculateConfidence, CONFIDENCE_LEVELS } from "../server/ocr/confidence.js";
import { preprocessImageBuffer } from "../server/ocr/preprocess.js";
import { extractTextFromPdfPage } from "../server/ingest/extractText.js";
import { registerBook } from "../server/ingest/registerBook.js";
import { retryPage } from "../server/jobs/retryPage.js";
import { uploadFile } from "../server/storage/upload.js";
import { getOriginalPdfPath } from "../server/storage/paths.js";

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${name}`);
    failed++;
  }
}

async function runPhase2Tests() {
  console.log("\n========================================================");
  console.log("  PHASE 2 VERIFICATION: SCANNED PDF OCR (JAVASCRIPT ONLY)");
  console.log("========================================================\n");

  // -----------------------------------------------------------
  // 1. ENGLISH SCANNED OCR
  // -----------------------------------------------------------
  console.log("[1/12] Testing English Scanned OCR Recognition...");
  try {
    const engImg = createEnglishScannedImageBuffer();
    const result = await recognizeImage(engImg, { language: "eng", pageNumber: 1 });
    assert(result.fullText.includes("Jupiter") || result.fullText.includes("Astrology"), `Recognized English text: "${result.fullText.slice(0, 30)}..."`);
    assert(typeof result.stats.pageConfidence === "number", `Calculated page confidence: ${result.stats.pageConfidence}`);
    assert(result.stats.pageConfidence >= 0.75, "Confidence meets high/medium threshold");
  } catch (err) {
    console.error("English OCR test failed:", err);
    failed++;
  }

  // -----------------------------------------------------------
  // 2. HINDI SCANNED OCR
  // -----------------------------------------------------------
  console.log("\n[2/12] Testing Hindi Scanned OCR Recognition (Devanagari)...");
  try {
    const hinImg = createHindiScannedImageBuffer();
    const result = await recognizeImage(hinImg, { language: "hin", pageNumber: 1 });
    assert(result.fullText.includes("गुरु") || result.fullText.includes("शनि") || result.fullText.includes("ग्रह"), `Recognized Hindi astrology terms: "${result.fullText.slice(0, 30)}..."`);
    assert(result.stats.pageConfidence >= 0.70, `Hindi OCR confidence acceptable: ${result.stats.pageConfidence}`);
  } catch (err) {
    console.error("Hindi OCR test failed:", err);
    failed++;
  }

  // -----------------------------------------------------------
  // 3. SANSKRIT SCANNED OCR
  // -----------------------------------------------------------
  console.log("\n[3/12] Testing Sanskrit Scanned OCR Recognition...");
  try {
    const sanImg = createSanskritScannedImageBuffer();
    const result = await recognizeImage(sanImg, { language: "san", pageNumber: 1 });
    assert(result.fullText.includes("अथ") || result.fullText.includes("प्रथमो") || result.fullText.includes("॥"), `Recognized Sanskrit markers: "${result.fullText.slice(0, 30)}..."`);
    assert(result.stats.pageConfidence >= 0.70, `Sanskrit confidence acceptable: ${result.stats.pageConfidence}`);
  } catch (err) {
    console.error("Sanskrit OCR test failed:", err);
    failed++;
  }

  // -----------------------------------------------------------
  // 4. MIXED SCRIPT SCANNED OCR
  // -----------------------------------------------------------
  console.log("\n[4/12] Testing Mixed-Script Scanned OCR (English + Hindi)...");
  try {
    const mixedImg = createMixedScriptScannedImageBuffer();
    const result = await recognizeImage(mixedImg, { language: "hin+eng", pageNumber: 1 });
    assert(result.fullText.length > 5, `Mixed script recognized content: "${result.fullText.slice(0, 30)}..."`);
    assert(Array.isArray(result.blocks) && result.blocks.length > 0, "Blocks generated for mixed script");
  } catch (err) {
    console.error("Mixed OCR test failed:", err);
    failed++;
  }

  // -----------------------------------------------------------
  // 5. LOW-RESOLUTION SCAN
  // -----------------------------------------------------------
  console.log("\n[5/12] Testing Low-Resolution Scan Handling...");
  try {
    const lowResImg = createLowResScannedImageBuffer();
    const result = await recognizeImage(lowResImg, { language: "eng", pageNumber: 1 });
    assert(typeof result.fullText === "string", "Low-res image processed without throwing unhandled exception");
  } catch (err) {
    console.error("Low-res test failed:", err);
    failed++;
  }

  // -----------------------------------------------------------
  // 6. BLANK PAGE DETECTION & QUALITY FLAGGING
  // -----------------------------------------------------------
  console.log("\n[6/12] Testing Blank Page Detection & Quality Rules...");
  try {
    const blankImg = createBlankScannedImageBuffer();
    const result = await recognizeImage(blankImg, { language: "eng", pageNumber: 1 });
    const isBlank = result.fullText.trim().length === 0;
    assert(isBlank === true, "Blank image produced empty OCR fullText");
    assert(result.stats.pageConfidence === 0 || result.stats.level === CONFIDENCE_LEVELS.LOW, "Blank page flagged with LOW confidence / 0 score");
  } catch (err) {
    console.error("Blank page test failed:", err);
    failed++;
  }

  // -----------------------------------------------------------
  // 7. ROTATION CORRECTION & PREPROCESSING
  // -----------------------------------------------------------
  console.log("\n[7/12] Testing Image Preprocessing & Rotation Correction...");
  try {
    const rotatedImg = createRotatedScannedImageBuffer();
    // Correct -90 / 270 deg rotation using preprocessImageBuffer
    const correctedImg = await preprocessImageBuffer(rotatedImg, {
      rotation: 270,
      grayscale: true,
      contrast: true,
      contrastFactor: 1.4,
    });
    assert(Buffer.isBuffer(correctedImg), "Preprocessor returned transformed Buffer");
    assert(correctedImg.length > 0, "Transformed image buffer is valid");

    const result = await recognizeImage(correctedImg, { language: "eng", pageNumber: 1 });
    assert(result.fullText.includes("Rotated") || result.fullText.includes("Astrology") || result.fullText.length > 5, `Recognized rotated & corrected text: "${result.fullText.trim()}"`);
  } catch (err) {
    console.error("Rotation test failed:", err);
    failed++;
  }

  // -----------------------------------------------------------
  // 8. OCR OUTPUT NORMALIZATION & CONTRACT
  // -----------------------------------------------------------
  console.log("\n[8/12] Testing Output Normalization Contract...");
  try {
    const rawMock = {
      text: "Test line one\nTest line two",
      confidence: 88,
      blocks: [
        { text: "Test line one", confidence: 92, bbox: { x0: 10, y0: 20, x1: 100, y1: 50 } },
        { text: "Test line two", confidence: 84, bbox: { x0: 10, y0: 60, x1: 100, y1: 90 } },
      ],
    };

    const normalized = normalizeOcrResult(rawMock, { pageNumber: 42, language: "eng" });
    assert(normalized.pageNumber === 42, "Normalized pageNumber preserved");
    assert(normalized.blocks.length === 2, "Normalized blocks preserved");
    assert(normalized.blocks[0].confidence === 0.92, "Normalized confidence converted to 0.00-1.00 float");
    assert(normalized.blocks[0].bbox.width === 90, "Calculated width from bounding box");
    assert(normalized.blocks[0].bbox.height === 30, "Calculated height from bounding box");
    assert(normalized.blocks[0].order === 1, "Assigned sequential block order");
  } catch (err) {
    console.error("Normalization test failed:", err);
    failed++;
  }

  // -----------------------------------------------------------
  // 9. QUALITY ASSESSMENT THRESHOLDS
  // -----------------------------------------------------------
  console.log("\n[9/12] Testing Quality Assessment Rule Thresholds...");
  try {
    const highBlocks = [{ confidence: 0.95 }, { confidence: 0.92 }];
    const medBlocks = [{ confidence: 0.82 }, { confidence: 0.78 }];
    const lowBlocks = [{ confidence: 0.65 }, { confidence: 0.50 }];

    const highStats = calculateConfidence(highBlocks);
    assert(highStats.level === CONFIDENCE_LEVELS.HIGH, "High confidence classified as HIGH (>= 0.90)");
    assert(highStats.requiresProofreading === false, "High confidence does not require forced proofreading");

    const medStats = calculateConfidence(medBlocks);
    assert(medStats.level === CONFIDENCE_LEVELS.MEDIUM, "Medium confidence classified as MEDIUM (0.75 - 0.89)");

    const lowStats = calculateConfidence(lowBlocks);
    assert(lowStats.level === CONFIDENCE_LEVELS.LOW, "Low confidence classified as LOW (< 0.75)");
    assert(lowStats.requiresProofreading === true, "Low confidence flags requiresProofreading: true");
  } catch (err) {
    console.error("Threshold test failed:", err);
    failed++;
  }

  // -----------------------------------------------------------
  // 10. PRESERVATION OF DIGITAL TEXT EXTRACTION (PHASE 1)
  // -----------------------------------------------------------
  console.log("\n[10/12] Testing Coexistence of Digital Text Extraction (Phase 1)...");
  try {
    const digitalPdf = createDigitalPdfBuffer();
    const extracted = await extractTextFromPdfPage(digitalPdf, 1);
    assert(extracted.rawText.includes("Vedic Astrology considers Jupiter"), "Digital extraction continues working without invoking OCR");
    assert(extracted.blocks[0].confidence === 1.0, "Digital text maintains 1.0 confidence score");
  } catch (err) {
    console.error("Digital coexistence test failed:", err);
    failed++;
  }

  // -----------------------------------------------------------
  // 11. DATABASE METADATA PERSISTENCE IN BOOKPAGE
  // -----------------------------------------------------------
  console.log("\n[11/12] Testing Database Persistence of OCR Metadata...");
  let testBookId = null;
  let testPageId = null;
  try {
    const book = await registerBook({
      title: "Scanned OCR Verification Manuscript " + Date.now(),
      language: "Hindi",
    });
    testBookId = book.id;

    // Create a BookPage record with OCR metadata fields
    const page = await prisma.bookPage.create({
      data: {
        bookId: book.id,
        pageNumber: 1,
        pdfPageIndex: 0,
        processingMethod: "OCR",
        ocrEngine: "tesseract",
        rawText: "गुरु ग्रह और शनि का प्रभाव",
        cleanedText: "गुरु ग्रह और शनि का प्रभाव",
        ocrConfidence: 0.94,
        processingDurationMs: 450,
        retryCount: 0,
        ocrCompleted: true,
      },
    });
    testPageId = page.id;

    const fetchedPage = await prisma.bookPage.findUnique({
      where: { id: page.id },
    });

    assert(fetchedPage.ocrEngine === "tesseract", "Stored ocrEngine correctly");
    assert(fetchedPage.processingDurationMs === 450, "Stored processingDurationMs correctly");
    assert(fetchedPage.retryCount === 0, "Stored initial retryCount");
    assert(fetchedPage.rawText === "गुरु ग्रह और शनि का प्रभाव", "Preserved rawText unmodified");
  } catch (err) {
    console.error("DB persistence test failed:", err);
    failed++;
  }

  // -----------------------------------------------------------
  // 12. SINGLE-PAGE RETRY MECHANICS
  // -----------------------------------------------------------
  console.log("\n[12/12] Testing Independent Single-Page Retry...");
  try {
    if (testBookId && testPageId) {
      // Create minimal PDF in storage for retry
      const digitalPdf = createDigitalPdfBuffer();
      const storagePath = getOriginalPdfPath(testBookId, "retry_test.pdf");
      await uploadFile(storagePath, digitalPdf);

      await prisma.book.update({
        where: { id: testBookId },
        data: { originalFileUrl: storagePath },
      });

      const retryResult = await retryPage(testPageId);
      assert(retryResult.success === true, "retryPage succeeded independently");
      assert(retryResult.page.id === testPageId, "Retried the exact requested BookPage");

      const recheckedPage = await prisma.bookPage.findUnique({
        where: { id: testPageId },
      });
      assert(recheckedPage.retryCount >= 1, "retryCount incremented after page retry");
    }

    // Clean up test book
    if (testBookId) {
      await prisma.book.delete({ where: { id: testBookId } });
    }
  } catch (err) {
    console.error("Retry test failed:", err);
    failed++;
  }

  // -----------------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------------
  console.log("\n========================================================");
  console.log(`  PHASE 2 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase2Tests().catch(async (e) => {
  console.error("Fatal test runner error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
