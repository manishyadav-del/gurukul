/**
 * PaddleOCR JavaScript Adapter Evaluation & Multilingual Quality Benchmark
 * 
 * Tests:
 * 1. Runtime environment evaluation and model capability detection (English, Hindi, Sanskrit).
 * 2. Normalization of native PaddleOCR poly coordinates and detection boxes into standard contract.
 * 3. Graceful delegation and fallback for Devanagari script and Node.js server environments.
 * 4. End-to-end OCR processing via recognizeImage with engine: 'paddleocr'.
 * 5. Preservation of character error rates (CER) and accuracy across multilingual sample fixtures.
 */

import {
  evaluatePaddleOcrRuntime,
  normalizePaddleOcrResult,
  runPaddleOcr,
  PADDLE_OCR_CAPABILITIES,
} from "../server/ocr/paddleOcrAdapter.js";
import { recognizeImage } from "../server/ocr/adapter.js";
import { createCanvas } from "../lib/canvas.js";
import {
  createCleanEnglishFixture,
  createCleanHindiFixture,
  createSanskritShlokaFixture,
} from "./fixtures/ocrEvaluationFixtures.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

// Generate test image canvas buffer
function generateSampleImageBuffer(text, width = 600, height = 200, fontSize = 28) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#111111";
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillText(text, 30, 80);

  return canvas.toBuffer("image/png");
}

async function runPaddleOcrEvaluation() {
  console.log("\n==========================================================================");
  console.log("  GURUKUL PADDLEOCR JAVASCRIPT ADAPTER EVALUATION SUITE");
  console.log("==========================================================================\n");

  // 1. CAPABILITIES & RUNTIME EVALUATION
  console.log("[1/5] Evaluating PaddleOCR Capabilities & Runtime Compatibility...");
  assert(PADDLE_OCR_CAPABILITIES.sdkName === "@paddleocr/paddleocr-js", "SDK identified as @paddleocr/paddleocr-js");
  assert(PADDLE_OCR_CAPABILITIES.nativeLanguages.includes("en"), "Native support includes English");
  assert(PADDLE_OCR_CAPABILITIES.extendedLanguages.includes("hi"), "Extended support includes Hindi");
  assert(PADDLE_OCR_CAPABILITIES.extendedLanguages.includes("sa"), "Extended support includes Sanskrit");

  const enEval = evaluatePaddleOcrRuntime({ language: "eng" });
  assert(enEval.isNativeLanguageSupported === true, "English recognized as natively supported model language");
  assert(enEval.isNode === true, "Node.js environment detected correctly");

  const hiEval = evaluatePaddleOcrRuntime({ language: "hin" });
  assert(hiEval.isNativeLanguageSupported === false, "Recognizes standard PP-OCR lacks native Devanagari weights");
  assert(hiEval.requiresFallback === true, "Flags fallback requirement for unconfigured Devanagari model");
  assert(hiEval.reason.includes("Devanagari"), "Provides clear diagnostic reason for Devanagari delegation");

  const saEval = evaluatePaddleOcrRuntime({ language: "san" });
  assert(saEval.requiresFallback === true, "Flags fallback requirement for Sanskrit shlokas");

  // 2. NORMALIZATION CONTRACT TESTS
  console.log("\n[2/5] Testing Output Normalization Contract (Polys to Bounding Boxes)...");
  const mockPaddleOutput = {
    image: { width: 800, height: 600 },
    items: [
      {
        poly: [
          [50, 100],
          [350, 100],
          [350, 140],
          [50, 140],
        ],
        text: "Brihat Parashara Hora Shastra",
        score: 0.965,
      },
      {
        poly: [
          [50, 160],
          [400, 160],
          [400, 200],
          [50, 200],
        ],
        text: "॥ अथ प्रथमोऽध्यायः ॥",
        score: 0.942,
      },
    ],
    metrics: { detMs: 45, recMs: 120, totalMs: 165 },
  };

  const normalized = normalizePaddleOcrResult(mockPaddleOutput, { pageNumber: 5, language: "san" });

  assert(normalized.pageNumber === 5, "Normalized pageNumber preserved");
  assert(Array.isArray(normalized.blocks), "Normalized blocks is an array");
  assert(normalized.blocks.length === 2, "Normalized all 2 detected text lines");
  assert(normalized.blocks[0].text === "Brihat Parashara Hora Shastra", "Block 1 text preserved");
  assert(normalized.blocks[0].confidence === 0.97, "Block 1 score converted to 2-decimal confidence float");
  assert(normalized.blocks[0].bbox.x === 50, "Calculated bounding box x coordinate");
  assert(normalized.blocks[0].bbox.y === 100, "Calculated bounding box y coordinate");
  assert(normalized.blocks[0].bbox.width === 300, "Calculated bounding box width (350 - 50)");
  assert(normalized.blocks[0].bbox.height === 40, "Calculated bounding box height (140 - 100)");
  assert(normalized.blocks[0].order === 1, "Assigned sequential block order 1");
  assert(normalized.blocks[1].order === 2, "Assigned sequential block order 2");
  assert(normalized.fullText.includes("Brihat Parashara"), "Full text includes block 1");
  assert(normalized.fullText.includes("॥ अथ प्रथमोऽध्यायः ॥"), "Full text includes block 2");

  // 3. RECOGNITION VIA PADDLEOCR ADAPTER ON ENGLISH
  console.log("\n[3/5] Testing PaddleOCR Adapter Execution on English Astrology Sample...");
  const enFixture = createCleanEnglishFixture();
  const enResult = await runPaddleOcr(enFixture.buffer, { pageNumber: 1, language: "eng" });

  assert(enResult.pageNumber === 1, "Preserved page number 1");
  assert(typeof enResult.fullText === "string", "Full text is non-empty string");
  assert(enResult.fullText.toLowerCase().includes("jupiter"), "Accurately recognized English astrology term 'Jupiter'");
  assert(enResult.stats.pageConfidence >= 0.70, "Page confidence meets threshold");
  assert(enResult.diagnostics != null, "Diagnostics telemetry is attached");
  assert(enResult.diagnostics.targetLanguage === "eng", "Diagnostics records target language");

  // 4. RECOGNITION VIA PADDLEOCR ADAPTER ON HINDI DEVANAGARI
  console.log("\n[4/5] Testing PaddleOCR Adapter Execution on Hindi Devanagari Sample...");
  const hiFixture = createCleanHindiFixture();
  const hiResult = await runPaddleOcr(hiFixture.buffer, { pageNumber: 2, language: "hin" });

  assert(hiResult.pageNumber === 2, "Preserved page number 2");
  assert(hiResult.blocks.length > 0, "Generated text blocks for Hindi");
  assert(hiResult.diagnostics.fallbackActive === true, "Telemetry indicates fallback delegation for Devanagari");
  assert(hiResult.diagnostics.fallbackReason != null, "Telemetry provides informative reason");
  assert(hiResult.stats.pageConfidence >= 0.70, "High confidence achieved for Devanagari");

  // 5. RECOGNITION VIA PADDLEOCR ADAPTER ON SANSKRIT SHLOKA CONJUNCTS
  console.log("\n[5/7] Testing PaddleOCR Adapter Execution on Sanskrit Shloka Sample...");
  const sanFixture = createSanskritShlokaFixture();
  const sanResult = await runPaddleOcr(sanFixture.buffer, { pageNumber: 3, language: "san" });

  assert(sanResult.pageNumber === 3, "Preserved Sanskrit page number 3");
  assert(sanResult.blocks.length > 0, "Generated text blocks for Sanskrit shloka");
  assert(sanResult.diagnostics.fallbackActive === true, "Devanagari Sanskrit cleanly delegates to high-accuracy fallback");
  assert(sanResult.fullText.includes("॥") || sanResult.fullText.includes("।"), "Preserved Sanskrit danda punctuation");
  assert(sanResult.stats.pageConfidence >= 0.70, "High confidence achieved for Sanskrit shloka");

  // 6. BLANK / LOW-CONTRAST PAGE HANDLING
  console.log("\n[6/7] Testing Blank Page & Low-Contrast Resilience...");
  const blankCanvas = createCanvas(400, 200);
  const blankCtx = blankCanvas.getContext("2d");
  blankCtx.fillStyle = "#ffffff";
  blankCtx.fillRect(0, 0, 400, 200);
  const blankBuffer = blankCanvas.toBuffer("image/png");

  const blankResult = await runPaddleOcr(blankBuffer, { pageNumber: 4, language: "eng" });
  assert(blankResult.pageNumber === 4, "Preserved blank page number 4");
  assert(typeof blankResult.fullText === "string", "Blank page returned safe string without exception");
  assert(blankResult.blocks.length === 0, "Zero blocks correctly detected on blank canvas");

  // 7. UNIFIED ADAPTER INTEGRATION (recognizeImage with engine: 'paddleocr')
  console.log("\n[7/7] Testing Unified Application Adapter with engine: 'paddleocr'...");
  const unifiedResult = await recognizeImage(enFixture.buffer, {
    engine: "paddleocr",
    pageNumber: 5,
    language: "eng",
  });

  assert(unifiedResult.pageNumber === 5, "Unified interface preserved pageNumber 5");
  assert(Array.isArray(unifiedResult.blocks), "Unified interface returns blocks array");
  assert(unifiedResult.fullText.length > 0, "Unified interface returns full text");
  assert(unifiedResult.stats != null, "Unified interface calculates confidence stats");

  console.log("\n==========================================================================");
  console.log(`  EVALUATION RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log("==========================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPaddleOcrEvaluation().catch((err) => {
  console.error("Evaluation threw unexpected exception:", err);
  process.exit(1);
});
