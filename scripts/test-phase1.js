/**
 * Phase 1 OCR Verification Test Suite (Pure JavaScript, No OCR Execution)
 *
 * Verifies:
 * 1. Digital PDF with selectable text (page count, selectable text, classification = DIGITAL)
 * 2. Scanned PDF (image present, no text, classification = SCANNED)
 * 3. Mixed PDF (image + text present, classification = MIXED)
 * 4. Invalid PDF (corrupt data handling & proper error propagation)
 * 5. Digital text extraction without calling OCR
 * 6. Preserves pageNumber (1-indexed) and pdfPageIndex (0-indexed)
 * 7. End-to-end database persistence in Book & BookPage models without duplicates
 */

import prisma from "../lib/prisma.js";
import {
  createDigitalPdfBuffer,
  createScannedPdfBuffer,
  createMixedPdfBuffer,
  createInvalidPdfBuffer,
} from "./fixtures/pdfFixtures.js";
import { analyzePdf } from "../server/ingest/analyzePdf.js";
import { extractTextFromPdfPage } from "../server/ingest/extractText.js";
import { registerBook } from "../server/ingest/registerBook.js";
import { processPhase1Book } from "../server/ingest/processPhase1.js";
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

async function runPhase1Tests() {
  console.log("\n========================================================");
  console.log("  PHASE 1 VERIFICATION: DIGITAL BOOK OCR SYSTEM");
  console.log("========================================================\n");

  const digitalPdf = createDigitalPdfBuffer();
  const scannedPdf = createScannedPdfBuffer();
  const mixedPdf = createMixedPdfBuffer();
  const invalidPdf = createInvalidPdfBuffer();

  // Test 1: Digital PDF analysis
  console.log("[1/6] Testing Digital PDF with Selectable Text...");
  const digitalAnalysis = await analyzePdf(digitalPdf);
  assert(digitalAnalysis.pageCount === 1, "Digital PDF page count is 1");
  assert(digitalAnalysis.pages[0].hasSelectableText === true, "Page has selectable text");
  assert(digitalAnalysis.pages[0].isDigital === true, "Page classified as DIGITAL");
  assert(digitalAnalysis.pages[0].imageCount === 0, "No embedded images detected");
  assert(digitalAnalysis.summary.overallClassification === "DIGITAL", "Overall classified as DIGITAL");

  // Test 2: Scanned PDF analysis
  console.log("\n[2/6] Testing Scanned PDF (Images only, no selectable text)...");
  const scannedAnalysis = await analyzePdf(scannedPdf);
  assert(scannedAnalysis.pageCount === 1, "Scanned PDF page count is 1");
  assert(scannedAnalysis.pages[0].hasSelectableText === false, "Page has no selectable text");
  assert(scannedAnalysis.pages[0].isScanned === true, "Page classified as SCANNED");
  assert(scannedAnalysis.pages[0].imageCount >= 1, "Embedded image detected");
  assert(scannedAnalysis.summary.overallClassification === "SCANNED", "Overall classified as SCANNED");

  // Test 3: Mixed PDF analysis
  console.log("\n[3/6] Testing Mixed PDF (Both text and images)...");
  const mixedAnalysis = await analyzePdf(mixedPdf);
  assert(mixedAnalysis.pageCount === 1, "Mixed PDF page count is 1");
  assert(mixedAnalysis.pages[0].hasSelectableText === true, "Page has selectable text");
  assert(mixedAnalysis.pages[0].imageCount >= 1, "Embedded image detected");
  assert(mixedAnalysis.pages[0].isMixed === true, "Page classified as MIXED");
  assert(mixedAnalysis.summary.overallClassification === "MIXED", "Overall classified as MIXED");

  // Test 4: Invalid PDF handling
  console.log("\n[4/6] Testing Invalid PDF (Corrupt data)...");
  let caughtInvalid = false;
  try {
    await analyzePdf(invalidPdf);
  } catch (err) {
    caughtInvalid = true;
    assert(err.message.includes("PDF") || err.message.length > 0, `Caught expected error: ${err.message}`);
  }
  assert(caughtInvalid === true, "Invalid PDF successfully rejected with error");

  // Test 5: Extract selectable text directly without OCR
  console.log("\n[5/6] Testing Digital Text Extraction (Without invoking OCR)...");
  const extracted = await extractTextFromPdfPage(digitalPdf, 1);
  assert(extracted.pageNumber === 1, "pageNumber is 1 (1-indexed)");
  assert(extracted.pdfPageIndex === 0, "pdfPageIndex is 0 (0-indexed)");
  assert(extracted.rawText.includes("Vedic Astrology considers Jupiter"), "Accurately extracted text content");
  assert(extracted.blocks.length >= 2, "Created layout blocks with coordinates");
  assert(extracted.blocks[0].confidence === 1.0, "Digital extracted blocks have 1.0 confidence score");

  // Test 6: Database integration and idempotency (Book & BookPage models)
  console.log("\n[6/6] Testing Phase 1 Persistence & Idempotency in Prisma...");
  const book = await registerBook({
    title: "Phase 1 Test Astrology Book " + Date.now(),
    author: "Sage Parashara",
    language: "Sanskrit",
  });
  assert(Boolean(book.id), "Book created in database");

  // Save PDF to storage
  const storagePath = getOriginalPdfPath(book.id, "digital_sample.pdf");
  await uploadFile(storagePath, digitalPdf);

  // Run Phase 1 processing
  const phase1Result = await processPhase1Book(book.id, digitalPdf);
  assert(phase1Result.totalPages === 1, "Processed 1 page");
  assert(phase1Result.pages[0].pageNumber === 1, "Recorded 1-based pageNumber");
  assert(phase1Result.pages[0].pdfPageIndex === 0, "Recorded 0-based pdfPageIndex");

  // Verify in DB
  const storedBook = await prisma.book.findUnique({
    where: { id: book.id },
    include: { pages: true },
  });
  assert(storedBook.pageCount === 1, "Book pageCount updated to 1");
  assert(storedBook.processingStatus === "COMPLETED", "processingStatus updated to COMPLETED");
  assert(storedBook.pages.length === 1, "Exactly 1 BookPage record created");
  assert(storedBook.pages[0].pageNumber === 1, "BookPage has pageNumber 1");
  assert(storedBook.pages[0].pdfPageIndex === 0, "BookPage has pdfPageIndex 0");
  assert(storedBook.pages[0].rawText.includes("Vedic Astrology"), "BookPage has extracted digital text");

  // Re-run to ensure idempotency (no duplicate records)
  console.log("    Verifying idempotency on rerun...");
  await processPhase1Book(book.id, digitalPdf);
  const recheckedBook = await prisma.book.findUnique({
    where: { id: book.id },
    include: { pages: true },
  });
  assert(recheckedBook.pages.length === 1, "Idempotency preserved: still exactly 1 BookPage record (no duplicates)");

  // Clean up test book
  await prisma.book.delete({ where: { id: book.id } });

  console.log("\n========================================================");
  console.log(`  PHASE 1 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase1Tests().catch(async (e) => {
  console.error("Test execution failed:", e);
  await prisma.$disconnect();
  process.exit(1);
});
