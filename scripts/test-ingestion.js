/**
 * Comprehensive Ingestion & OCR Test Suite (Next.js + JavaScript/Node.js only)
 * 
 * Tests:
 * 1. PDF Analysis (Digital, Scanned, Mixed, Invalid)
 * 2. Text Extraction (Digital selectable text)
 * 3. Page Rendering (@napi-rs/canvas to WebP)
 * 4. OCR Adapter & Normalization Contract (Tesseract.js in Node.js)
 * 5. Astrological Text Cleaning & Preservation (गुरु, शनि, राहु, केतु, Sanskrit shlokas)
 * 6. Language Detection (en, hi, sa, mixed)
 * 7. Structure & Chapter Detection
 * 8. Passage Traceability & Provenance
 * 9. Idempotent Ingestion & Recovery
 */

import { createCanvas } from "../lib/canvas.js";
import prisma from "../lib/prisma.js";
import { analyzePdf } from "../server/ingest/analyzePdf.js";
import { extractTextFromPdfPage } from "../server/ingest/extractText.js";
import { renderPdfPageToImage } from "../server/ingest/renderPage.js";
import { cleanText } from "../server/ingest/cleanText.js";
import { detectLanguage } from "../server/ingest/detectLanguage.js";
import { detectPageStructure } from "../server/ingest/detectStructure.js";
import { createPassagesForPage } from "../server/ingest/createPassages.js";
import { recognizeImage } from "../server/ocr/adapter.js";
import { calculateConfidence, CONFIDENCE_LEVELS } from "../server/ocr/confidence.js";
import { normalizeOcrResult } from "../server/ocr/normalize.js";
import { registerBook } from "../server/ingest/registerBook.js";
import { processBook } from "../server/jobs/processBook.js";
import { uploadFile } from "../server/storage/upload.js";
import { getOriginalPdfPath } from "../server/storage/paths.js";

// Helper to create a valid minimal 2-page PDF in pure JavaScript
function createSampleDigitalPdfBuffer() {
  const content = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R 4 0 R]/Count 2>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<
/Font<<
/F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>
>>
>>/Contents 5 0 R>>endobj
4 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<
/Font<<
/F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>
>>
>>/Contents 6 0 R>>endobj
5 0 obj<</Length 120>>stream
BT
/F1 18 Tf
50 720 Td
(Chapter 1: The Foundations of Vedic Astrology) Tj
/F1 12 Tf
0 -40 Td
(Jupiter and Saturn form a powerful conjunction in the 9th house.) Tj
ET
endstream
endobj
6 0 obj<</Length 110>>stream
BT
/F1 18 Tf
50 720 Td
(Chapter 2: Planetary Influences) Tj
/F1 12 Tf
0 -40 Td
(The Moon represents the mind while the Sun represents the soul.) Tj
ET
endstream
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000052 00000 n 
0000000109 00000 n 
0000000257 00000 n 
0000000405 00000 n 
0000000577 00000 n 
trailer<</Size 7/Root 1 0 R>>
startxref
739
%%EOF`;

  return Buffer.from(content, "utf-8");
}

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedTests++;
  }
}

async function runTests() {
  console.log("\n========================================================");
  console.log("  GURUKUL ASTROLOGY: INGESTION & OCR TEST SUITE (JS ONLY)");
  console.log("========================================================\n");

  const samplePdf = createSampleDigitalPdfBuffer();

  // -----------------------------------------------------------
  // 1. PDF ANALYSIS TESTS
  // -----------------------------------------------------------
  console.log("[1/9] Testing PDF Analysis Module...");
  try {
    const analysis = await analyzePdf(samplePdf);
    assert(analysis.pageCount === 2, "Accurately detects 2-page PDF document");
    assert(analysis.pages[0].isDigital === true, "Page 1 classified as DIGITAL");
    assert(analysis.pages[0].hasSelectableText === true, "Page 1 has selectable text");
    assert(analysis.pages[0].processingMethod === "TEXT_EXTRACTION", "Method set to TEXT_EXTRACTION");
    assert(analysis.summary.overallClassification === "DIGITAL", "Overall summary is DIGITAL");
  } catch (err) {
    console.error("Analysis test failed:", err);
    failedTests++;
  }

  // -----------------------------------------------------------
  // 2. DIGITAL TEXT EXTRACTION TESTS
  // -----------------------------------------------------------
  console.log("\n[2/9] Testing Digital Text Extraction...");
  try {
    const extracted = await extractTextFromPdfPage(samplePdf, 1);
    assert(extracted.pageNumber === 1, "Page number matches requested page");
    assert(extracted.rawText.includes("Vedic Astrology"), "Extracted text contains expected heading");
    assert(extracted.rawText.includes("Jupiter and Saturn"), "Extracted text contains body sentence");
    assert(extracted.blocks.length >= 2, "Constructed layout blocks from text items");
    assert(extracted.blocks[0].confidence === 1.0, "Digital blocks have 1.0 confidence score");
  } catch (err) {
    console.error("Text extraction test failed:", err);
    failedTests++;
  }

  // -----------------------------------------------------------
  // 3. PAGE RENDERING TESTS (@napi-rs/canvas to WebP)
  // -----------------------------------------------------------
  console.log("\n[3/9] Testing Page Image Rendering...");
  try {
    const rendered = await renderPdfPageToImage(samplePdf, 1, "test-book-id", { dpi: 150 });
    assert(Buffer.isBuffer(rendered.imageBuffer), "Render returns image Buffer");
    assert(rendered.imageBuffer.length > 500, `Image buffer is valid size (${rendered.imageBuffer.length} bytes)`);
    assert(rendered.relativePath.endsWith(".webp"), "Saved relative path has .webp extension");
    assert(typeof rendered.publicUrl === "string", "Public URL generated for asset");
  } catch (err) {
    console.error("Render test failed:", err);
    failedTests++;
  }

  // -----------------------------------------------------------
  // 4. OCR ADAPTER & NORMALIZATION CONTRACT TESTS
  // -----------------------------------------------------------
  console.log("\n[4/9] Testing OCR Adapter & Contract Normalization...");
  try {
    // Generate an image with astrology terms for OCR
    const canvas = createCanvas(500, 150);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 500, 150);
    ctx.fillStyle = "#000000";
    ctx.font = "28px sans-serif";
    ctx.fillText("Jupiter In Aries 108", 20, 60);
    ctx.fillText("Brihat Parashara", 20, 110);
    const testOcrBuffer = canvas.toBuffer("image/png");

    const ocrResult = await recognizeImage(testOcrBuffer, { pageNumber: 1, language: "eng" });

    assert(ocrResult.pageNumber === 1, "Normalized contract: pageNumber is 1");
    assert(typeof ocrResult.fullText === "string", "Normalized contract: fullText is string");
    assert(ocrResult.fullText.includes("Jupiter"), "OCR recognized English astrological planet 'Jupiter'");
    assert(Array.isArray(ocrResult.blocks), "Normalized contract: blocks is array");
    assert(ocrResult.blocks.length > 0, "Blocks array populated with coordinates");
    assert(ocrResult.blocks[0].bbox !== null, "Blocks include bounding box object (x, y, width, height)");
    assert(typeof ocrResult.stats.pageConfidence === "number", "Computed stats.pageConfidence");
    assert(ocrResult.stats.level === CONFIDENCE_LEVELS.HIGH || ocrResult.stats.level === CONFIDENCE_LEVELS.MEDIUM, "Confidence classified properly");
  } catch (err) {
    console.error("OCR test failed:", err);
    failedTests++;
  }

  // -----------------------------------------------------------
  // 5. ASTROLOGY TEXT CLEANING & PRESERVATION TESTS
  // -----------------------------------------------------------
  console.log("\n[5/9] Testing Astrology Text Cleaning & Script Preservation...");
  try {
    const rawWithNoise = `12
    अथ प्रथमोऽध्यायः ।
    गुरु और शनि का सम्बन्ध मेष राशि में विशेष प्रभाव डालता है।
    राहु-केतु अक्ष का प्रभाव सदा विचारणीय है।
    Broken eng-\nlish line boundary.
    ~ ^
    12`;

    const cleaned = cleanText(rawWithNoise);

    assert(!cleaned.startsWith("12"), "Stripped leading standalone page number noise");
    assert(!cleaned.endsWith("12"), "Stripped trailing standalone page number noise");
    assert(cleaned.includes("गुरु"), "PRESERVED Hindi planet name: गुरु");
    assert(cleaned.includes("शनि"), "PRESERVED Hindi planet name: शनि");
    assert(cleaned.includes("राहु-केतु"), "PRESERVED Hindi planet nodes: राहु-केतु");
    assert(cleaned.includes("मेष"), "PRESERVED Rashi name: मेष");
    assert(cleaned.includes("प्रथमोऽध्यायः ।"), "PRESERVED Sanskrit Avagraha (ऽ), Visarga (ः), and Danda (।)");
    assert(cleaned.includes("english"), "Fixed broken line-end hyphenation");
    assert(!cleaned.includes("~ ^"), "Cleaned stray ASCII OCR noise");
  } catch (err) {
    console.error("Cleaning test failed:", err);
    failedTests++;
  }

  // -----------------------------------------------------------
  // 6. LANGUAGE DETECTION TESTS
  // -----------------------------------------------------------
  console.log("\n[6/9] Testing Language Detection...");
  try {
    const enText = "The astrological planetary influences of Jupiter, Mars and Venus in classical astrology.";
    const hiText = "मेष राशि में सूर्य उच्च का होता है और तुला राशि में नीच का होता है।";
    const saText = "ॐ नमो भगवते वासुदेवाय ॥ अथ प्रथमोऽध्यायः ॥ ग्रहाणां स्वरूपम् उवाच ॥";
    const mixedText = "Jupiter in Aries brings उच्च फल when शुभ दृष्टि is present.";

    assert(detectLanguage(enText) === "en", "Detects English text correctly");
    assert(detectLanguage(hiText) === "hi", "Detects Hindi text correctly");
    assert(detectLanguage(saText) === "sa", "Detects Sanskrit verse markers correctly");
    assert(detectLanguage(mixedText) === "mixed", "Detects mixed Hindi + English script correctly");
  } catch (err) {
    console.error("Language detection test failed:", err);
    failedTests++;
  }

  // -----------------------------------------------------------
  // 7. STRUCTURE & CHAPTER DETECTION TESTS
  // -----------------------------------------------------------
  console.log("\n[7/9] Testing Deterministic Structure Detection...");
  try {
    const pageText = `अध्याय १: ग्रह परिचय
सूर्य, चन्द्र, मङ्गल, बुध, गुरु, शुक्र और शनि का प्रभाव।

॥ श्लोक १ ॥
शान्ताकारं भुजगशयनं पद्मनाभं सुरेशम् ॥

* यह श्लोक पराशर होरा शास्त्र का है।`;

    const structure = detectPageStructure(pageText, 1);
    assert(structure.chapters.length >= 1, "Detects chapter heading");
    assert(structure.chapters[0].title.includes("ग्रह परिचय"), "Identified chapter title");
    assert(structure.sections.some((s) => s.type === "VERSE"), "Detects Sanskrit Shloka/Verse");
    assert(structure.sections.some((s) => s.type === "FOOTNOTE"), "Detects Footnote marker");
  } catch (err) {
    console.error("Structure test failed:", err);
    failedTests++;
  }

  // -----------------------------------------------------------
  // 8. PASSAGE CREATION & PROVENANCE TESTS
  // -----------------------------------------------------------
  console.log("\n[8/9] Testing Traceable Passage Creation...");
  try {
    const dummyBookId = "test-book-" + Date.now();
    const dummyPageId = "test-page-" + Date.now();

    // Register a book in DB
    const book = await prisma.book.create({
      data: {
        id: dummyBookId,
        title: "Test Shastra",
        slug: "test-shastra-" + Date.now(),
        status: "PROCESSING",
      },
    });

    const page = await prisma.bookPage.create({
      data: {
        id: dummyPageId,
        bookId: book.id,
        pageNumber: 1,
        pdfPageIndex: 0,
        rawText: "First paragraph\n\nSecond paragraph",
        cleanedText: "First paragraph\n\nSecond paragraph",
      },
    });

    const passages = await createPassagesForPage({
      bookId: book.id,
      pageId: page.id,
      pageNumber: 1,
      cleanedText: page.cleanedText,
    });

    assert(passages.length === 2, "Created 2 distinct passages from paragraphs");
    assert(passages[0].bookId === book.id, "Passage traceable to Book");
    assert(passages[0].pageId === page.id, "Passage traceable to Page");
    assert(passages[0].sourcePage === 1, "Passage retains sourcePage number");
    assert(passages[0].passageNumber === 1, "Passage retains sequential passageNumber");

    // Clean up test records
    await prisma.book.delete({ where: { id: book.id } });
  } catch (err) {
    console.error("Passage creation test failed:", err);
    failedTests++;
  }

  // -----------------------------------------------------------
  // 9. END-TO-END PIPELINE & IDEMPOTENCY RECOVERY TESTS
  // -----------------------------------------------------------
  console.log("\n[9/9] Testing Full End-to-End Pipeline & Idempotency Recovery...");
  try {
    // 1. Register book
    const book = await registerBook({
      title: "Automated Test Brihat Samhita",
      author: "Varahamihira",
      language: "Hindi",
    });
    assert(book.id && book.slug, "Book registered with unique slug");

    // 2. Upload sample PDF
    const targetPath = getOriginalPdfPath(book.id, "sample.pdf");
    await uploadFile(targetPath, samplePdf);
    await prisma.book.update({
      where: { id: book.id },
      data: { originalFileUrl: targetPath, sourcePdf: targetPath },
    });

    // 3. Run Pipeline
    const result1 = await processBook(book.id, { pdfBuffer: samplePdf });
    assert(result1.success === true, "Pipeline completed successfully");
    assert(result1.stats.processedPages === 2, "Processed all 2 pages");
    assert(result1.stats.chaptersCount >= 1, "Created chapters");
    assert(result1.stats.passagesCount >= 2, "Created passages");

    // Check DB state
    const afterBook = await prisma.book.findUnique({
      where: { id: book.id },
      include: { pages: true, chapters: true, passages: true },
    });

    assert(afterBook.status === "PROOFREAD", "Book transitioned to PROOFREAD (never auto-published)");
    assert(afterBook.processingStatus === "COMPLETED", "Processing status is COMPLETED");
    assert(afterBook.pages.length === 2, "2 BookPages stored in database");

    // 4. Test Idempotency / Recovery: Rerun pipeline
    console.log("    Testing pipeline idempotency (re-running without duplicate pages)...");
    const result2 = await processBook(book.id, { pdfBuffer: samplePdf });
    assert(result2.success === true, "Pipeline restart succeeded cleanly");

    const recheckBook = await prisma.book.findUnique({
      where: { id: book.id },
      include: { pages: true, chapters: true, passages: true },
    });

    assert(recheckBook.pages.length === 2, "Idempotency verified: exactly 2 pages remain (no duplicates)");
    assert(recheckBook.chapters.length === afterBook.chapters.length, "No duplicate chapters created");

    // Clean up test book
    await prisma.book.delete({ where: { id: book.id } });
  } catch (err) {
    console.error("End-to-end pipeline test failed:", err);
    failedTests++;
  }

  // -----------------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------------
  console.log("\n========================================================");
  console.log(`  TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log("========================================================\n");

  await prisma.$disconnect();

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch(async (e) => {
  console.error("Fatal test suite runner error:", e);
  await prisma.$disconnect();
  process.exit(1);
});
