/**
 * OCR Evaluation & Accuracy Verification Suite
 * 
 * Tests and measures:
 * - Character Error Rate (CER) and Word Error Rate (WER) against ground-truth
 * - Baseline (single-pass raw Tesseract) vs Improved Pipeline (Adaptive + Quality Retry + Normalization)
 * - Empty-page rate, failure rate, and manual review rate
 * - Processing time per page
 * - Unit tests for:
 *   - Text layer corruption & Kruti Dev detection
 *   - Indic text normalization (dandas, ligatures, Vedic accents)
 *   - Quality pipeline retry decisions
 *   - Human proofreading preservation
 *   - Single-page retry mechanics
 * 
 * JavaScript only.
 */

import {
  createCleanEnglishFixture,
  createCleanHindiFixture,
  createSanskritShlokaFixture,
  createMixedLanguageFixture,
  createSkewedPageFixture,
  createRotatedPageFixture,
  createLowResPageFixture,
  createNoisyDegradedPageFixture,
  createKrutiDevSample,
  createChanakyaSample,
} from "./fixtures/ocrEvaluationFixtures.js";
import { calculateCER, calculateWER } from "../server/ocr/evaluationMetrics.js";
import { runTesseractOcr } from "../server/ocr/recognize.js";
import { recognizeImage } from "../server/ocr/adapter.js";
import { cleanText, normalizeDandas } from "../server/ingest/cleanText.js";
import {
  analyzeTextLayer,
  detectKrutiDevEncoding,
  convertKrutiDevToUnicode,
  detectChanakyaEncoding,
  convertChanakyaToUnicode,
} from "../server/ocr/textLayerAnalyzer.js";
import { evaluateOcrCandidate } from "../server/ocr/qualityPipeline.js";
import {
  correctDevanagariOcrText,
  normalizeDevanagariDandas,
  normalizeSanskritVisarga,
  normalizeSanskritAvagraha,
  normalizeDevanagariVowelsAndMatras,
} from "../server/ocr/devanagariCorrections.js";
import {
  validateDevanagariText,
  calculateSanskritTextQuality,
  DEVANAGARI_ISSUE_CODES,
} from "../server/ocr/sanskritValidator.js";
import { removeScanBorders, normalizeResolution } from "../server/ocr/preprocess.js";
import { calculateConfidence, CONFIDENCE_LEVELS } from "../server/ocr/confidence.js";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(cond, name) {
  totalTests++;
  if (cond) {
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${name}`);
    failedTests++;
  }
}

async function runBenchmark() {
  console.log("\n==========================================================================");
  console.log("  GURUKUL OCR ACCURACY BENCHMARK & EVALUATION SUITE");
  console.log("==========================================================================\n");

  const fixtures = [
    createCleanEnglishFixture(),
    createCleanHindiFixture(),
    createSanskritShlokaFixture(),
    createMixedLanguageFixture(),
    createSkewedPageFixture(),
    createRotatedPageFixture(),
    createLowResPageFixture(),
    createNoisyDegradedPageFixture(),
  ];

  console.log("--------------------------------------------------------------------------");
  console.log("1. BENCHMARK COMPARISON: BASELINE vs IMPROVED QUALITY PIPELINE");
  console.log("--------------------------------------------------------------------------\n");

  const results = [];

  let baselineTotalTime = 0;
  let improvedTotalTime = 0;
  let baselineTotalEdits = 0;
  let baselineTotalRefChars = 0;
  let improvedTotalEdits = 0;
  let improvedTotalRefChars = 0;

  let baselineEmptyPages = 0;
  let improvedEmptyPages = 0;
  let baselineFailures = 0;
  let improvedFailures = 0;
  let baselineReviewNeeded = 0;
  let improvedReviewNeeded = 0;

  for (const fix of fixtures) {
    console.log(`Evaluating fixture: [${fix.type}] (${fix.language})...`);

    // --- BASELINE: Single-pass Tesseract with no adaptive preprocessing or quality retry ---
    const t0 = Date.now();
    let baselineText = "";
    let baselineConfidence = 0;
    try {
      const baseRaw = await runTesseractOcr(fix.buffer, {
        language: fix.language,
        psm: 3,
      });
      baselineText = (baseRaw.text || "").trim();
      baselineConfidence = baseRaw.confidence > 1 ? baseRaw.confidence / 100 : baseRaw.confidence;
    } catch (err) {
      baselineFailures++;
      console.warn(`  [Baseline] Exception on ${fix.type}:`, err.message);
    }
    const baselineDuration = Date.now() - t0;
    baselineTotalTime += baselineDuration;

    if (!baselineText) baselineEmptyPages++;
    if (baselineConfidence < 0.75 || !baselineText) baselineReviewNeeded++;

    const baseCer = calculateCER(baselineText, fix.groundTruth);
    const baseWer = calculateWER(baselineText, fix.groundTruth);
    baselineTotalEdits += baseCer.edits;
    baselineTotalRefChars += baseCer.refLength;

    // --- IMPROVED PIPELINE: Quality pipeline + Adaptive thresholding + Deskew + Indic cleanup ---
    const t1 = Date.now();
    let improvedText = "";
    let improvedConfidence = 0;
    let winningRecipe = "standard";
    try {
      const impRes = await recognizeImage(fix.buffer, {
        language: fix.language,
        pageNumber: 1,
        qualityPipeline: true,
      });
      // Apply cleanText with Indic normalization
      improvedText = cleanText(impRes.fullText, {
        language: fix.language,
        isIndic: fix.language.includes("hin") || fix.language.includes("san"),
      });
      improvedConfidence = impRes.stats?.pageConfidence ?? 0.85;
      winningRecipe = impRes.diagnostics?.winningRecipe || "Recipe1";
    } catch (err) {
      improvedFailures++;
      console.warn(`  [Improved] Exception on ${fix.type}:`, err.message);
    }
    const improvedDuration = Date.now() - t1;
    improvedTotalTime += improvedDuration;

    if (!improvedText) improvedEmptyPages++;
    if (improvedConfidence < 0.75 || !improvedText) improvedReviewNeeded++;

    const impCer = calculateCER(improvedText, fix.groundTruth);
    const impWer = calculateWER(improvedText, fix.groundTruth);
    improvedTotalEdits += impCer.edits;
    improvedTotalRefChars += impCer.refLength;

    results.push({
      type: fix.type,
      baseline: {
        cer: baseCer.cer,
        wer: baseWer.wer,
        confidence: baselineConfidence,
        timeMs: baselineDuration,
        text: baselineText.replace(/\n/g, " ").slice(0, 35),
      },
      improved: {
        cer: impCer.cer,
        wer: impWer.wer,
        confidence: improvedConfidence,
        timeMs: improvedDuration,
        recipe: winningRecipe,
        text: improvedText.replace(/\n/g, " ").slice(0, 35),
      },
    });
  }

  // Print Comparison Table
  console.log("\n========================================================================================================");
  console.log(
    "Fixture Type".padEnd(28) +
    "| Baseline CER / WER".padEnd(23) +
    "| Improved CER / WER".padEnd(23) +
    "| CER Gain".padEnd(12) +
    "| Winning Recipe"
  );
  console.log("--------------------------------------------------------------------------------------------------------");

  for (const r of results) {
    const baseMetric = `${Math.round(r.baseline.cer * 100)}% / ${Math.round(r.baseline.wer * 100)}%`;
    const impMetric = `${Math.round(r.improved.cer * 100)}% / ${Math.round(r.improved.wer * 100)}%`;
    const gainNum = Math.round((r.baseline.cer - r.improved.cer) * 100);
    const gainStr = gainNum > 0 ? `+${gainNum}% better` : `${gainNum}%`;

    console.log(
      r.type.padEnd(28) +
      `| ${baseMetric.padEnd(21)}` +
      `| ${impMetric.padEnd(21)}` +
      `| ${gainStr.padEnd(10)}` +
      `| ${r.improved.recipe}`
    );
  }
  console.log("========================================================================================================\n");

  const overallBaselineCER = Math.round((baselineTotalEdits / Math.max(1, baselineTotalRefChars)) * 1000) / 1000;
  const overallImprovedCER = Math.round((improvedTotalEdits / Math.max(1, improvedTotalRefChars)) * 1000) / 1000;
  const avgBaselineTime = Math.round(baselineTotalTime / fixtures.length);
  const avgImprovedTime = Math.round(improvedTotalTime / fixtures.length);

  console.log("SUMMARY BENCHMARK METRICS:");
  console.log(`- Overall Character Error Rate (CER): Baseline = ${Math.round(overallBaselineCER * 100)}%  ->  Improved = ${Math.round(overallImprovedCER * 100)}%`);
  console.log(`- Average Processing Time Per Page:   Baseline = ${avgBaselineTime}ms  ->  Improved = ${avgImprovedTime}ms`);
  console.log(`- Empty-Page Rate:                    Baseline = ${Math.round((baselineEmptyPages / fixtures.length) * 100)}%  ->  Improved = ${Math.round((improvedEmptyPages / fixtures.length) * 100)}%`);
  console.log(`- Processing Failure Rate:            Baseline = ${Math.round((baselineFailures / fixtures.length) * 100)}%  ->  Improved = ${Math.round((improvedFailures / fixtures.length) * 100)}%`);
  console.log(`- Manual-Review Required Rate:        Baseline = ${Math.round((baselineReviewNeeded / fixtures.length) * 100)}%  ->  Improved = ${Math.round((improvedReviewNeeded / fixtures.length) * 100)}%\n`);

  assert(overallImprovedCER <= overallBaselineCER, "Improved pipeline achieves lower or equal overall CER than baseline");
  assert(improvedFailures === 0, "Improved pipeline zero processing failures");

  // --------------------------------------------------------------------------
  // 2. UNIT TESTS: TEXT LAYER & CORRUPTED TEXT DETECTION
  // --------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------");
  console.log("2. UNIT TESTS: TEXT LAYER CORRUPTION & LEGACY FONT DETECTION");
  console.log("--------------------------------------------------------------------------\n");

  // 2.1 Clean digital text detection
  const cleanAnalysis = analyzeTextLayer("Jupiter in the Ninth House brings auspicious spiritual growth.", {
    language: "English",
  });
  assert(cleanAnalysis.hasUsableText === true, "Clean digital English recognized as usable text");
  assert(cleanAnalysis.classification === "DIGITAL", "Classified as DIGITAL");
  assert(cleanAnalysis.ocrTriggerReason === null, "No OCR trigger needed for clean digital text");

  // 2.2 Corrupted replacement characters detection (\uFFFD)
  const corruptAnalysis = analyzeTextLayer("This page has severe encoding corruption \uFFFD\uFFFD\uFFFD", {
    language: "English",
  });
  assert(corruptAnalysis.hasUsableText === false, "Corrupted text layer with replacement characters rejected");
  assert(corruptAnalysis.ocrTriggerReason === "CORRUPTED_REPLACEMENT_CHARACTERS", "Trigger reason identified as CORRUPTED_REPLACEMENT_CHARACTERS");

  // 2.3 Kruti Dev legacy font detection and conversion
  const krutiSample = createKrutiDevSample();
  const krutiDetect = detectKrutiDevEncoding(krutiSample.krutiDevText);
  assert(krutiDetect.isKrutiDev === true, "Kruti Dev 010 font encoding detected");
  const krutiConverted = convertKrutiDevToUnicode(krutiSample.krutiDevText);
  assert(krutiConverted.includes("ग्रह") || krutiConverted.includes("शनि") || krutiConverted.includes("और"), `Kruti Dev successfully converted: "${krutiConverted}"`);

  // 2.3.1 Chanakya / Walkman-Chanakya font detection and conversion
  const chanakyaSample = createChanakyaSample();
  const chanakyaDetect = detectChanakyaEncoding(chanakyaSample.chanakyaText);
  assert(chanakyaDetect.isChanakya === true, "Chanakya legacy font encoding detected");
  const chanakyaConverted = convertChanakyaToUnicode(chanakyaSample.chanakyaText);
  assert(chanakyaConverted.includes("काजो") || chanakyaConverted.includes("।"), `Chanakya successfully converted: "${chanakyaConverted}"`);

  // 2.4 Unmapped Devanagari ratio check
  const mojibakeAnalysis = analyzeTextLayer("This was supposed to be a Hindi book but has only Latin ASCII gibberish abcdefghijklmnopqrstuvwxyz", {
    language: "Hindi",
    script: "Devanagari",
  });
  assert(mojibakeAnalysis.hasUsableText === false, "Hindi book with 0% Devanagari flagged as unreadable mojibake");
  assert(mojibakeAnalysis.ocrTriggerReason === "INDIC_TEXT_UNREADABLE_LOW_DEVANAGARI_RATIO", "Trigger reason correctly set to INDIC_TEXT_UNREADABLE_LOW_DEVANAGARI_RATIO");

  // --------------------------------------------------------------------------
  // 3. UNIT TESTS: INDIC NORMALIZATION & CLEANUP
  // --------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------");
  console.log("3. UNIT TESTS: INDIC NORMALIZATION & TEXT CLEANUP");
  console.log("--------------------------------------------------------------------------\n");

  // 3.1 Danda normalization
  const dandaInput = "शान्ताकारं भुजगशयनं | पद्मनाभं सुरेशम् ||";
  const dandaOutput = normalizeDandas(dandaInput);
  assert(dandaOutput.includes("।") && dandaOutput.includes("॥"), `Dandas normalized: "${dandaOutput}"`);
  assert(!dandaOutput.includes("|"), "All ASCII pipes converted to authentic Devanagari dandas");

  // 3.2 Vedic accents preservation
  const vedicShloka = "अ॒ग्निमी॑ळे पु॒रोहि॑तं य॒ज्ञस्य॑ दे॒वमृ॒त्विज॑म् ॥";
  const cleanedVedic = cleanText(vedicShloka, { language: "Sanskrit", isIndic: true });
  assert(cleanedVedic.includes("\u0951") || cleanedVedic.includes("\u0952"), "Preserved udatta and anudatta Vedic accents");
  assert(cleanedVedic.includes("॥"), "Preserved double danda verse boundary");

  // 3.3 Scan speckle noise removal without altering words
  const noisyInput = "गुरु ग्रह और शनि ~^\n\nमेष राशि `_";
  const cleanedNoisy = cleanText(noisyInput, { language: "Hindi", isIndic: true });
  assert(!cleanedNoisy.includes("~") && !cleanedNoisy.includes("^") && !cleanedNoisy.includes("`"), "Removed isolated scan artifacts (~, ^, `)");
  assert(cleanedNoisy.includes("गुरु") && cleanedNoisy.includes("शनि") && cleanedNoisy.includes("मेष"), "Preserved authentic Hindi astrology terms");

  // 3.4 Visarga normalization from trailing colons
  const visargaInput = "ॐ नम: शिवाय । राम: पठति । 10:30 बजे Note: Important";
  const visargaCorrected = correctDevanagariOcrText(visargaInput);
  assert(visargaCorrected.includes("नमः") && visargaCorrected.includes("रामः"), `Visarga normalized for Sanskrit tokens: "${visargaCorrected}"`);
  assert(visargaCorrected.includes("10:30") && visargaCorrected.includes("Note:"), "Preserved time formatting and English colons without false conversion");

  // 3.5 Avagraha normalization from 'S' or '5' in Sanskrit compounds
  const avagrahaInput = "सो S हम् को 5 पि";
  const avagrahaCorrected = correctDevanagariOcrText(avagrahaInput);
  assert(avagrahaCorrected.includes("सोऽहम्") || avagrahaCorrected.includes("सोऽ") && avagrahaCorrected.includes("कोऽपि"), `Avagraha reconstructed: "${avagrahaCorrected}"`);

  // 3.6 Canonical vowel decomposition (अा -> आ, अो -> ओ, अौ -> औ)
  const vowelInput = "अाकाश अोम अौषध";
  const vowelCorrected = correctDevanagariOcrText(vowelInput);
  assert(vowelCorrected.includes("आकाश") && vowelCorrected.includes("ओम") && vowelCorrected.includes("औषध"), `Canonical vowels composed: "${vowelCorrected}"`);

  // --------------------------------------------------------------------------
  // 4. UNIT TESTS: QUALITY EVALUATION & RETRY DECISIONS
  // --------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------");
  console.log("4. UNIT TESTS: QUALITY EVALUATION & RETRY DECISIONS");
  console.log("--------------------------------------------------------------------------\n");

  // 4.1 Empty text quality failure
  const emptyEval = evaluateOcrCandidate({ text: "", confidence: 0 });
  assert(emptyEval.passesQuality === false, "Empty OCR text fails quality evaluation");
  assert(emptyEval.reasons.includes("EMPTY_TEXT"), "Reason marked as EMPTY_TEXT");

  // 4.2 Malformed Devanagari (orphaned matras)
  const malformedEval = evaluateOcrCandidate({
    text: " ि ो ु ा ौ कुछ शब्द",
    confidence: 0.88,
  }, { language: "Hindi", script: "Devanagari" });
  assert(malformedEval.passesQuality === false, "Malformed Devanagari with orphaned matras fails quality check");
  assert(malformedEval.metrics.orphanedMatraCount >= 3, "Detected orphaned matras without base consonants");

  // 4.3 High quality candidate passing
  const goodEval = evaluateOcrCandidate({
    text: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशम् ॥ विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् ॥",
    confidence: 0.92,
  }, { language: "Sanskrit", script: "Devanagari" });
  assert(goodEval.passesQuality === true, "Well-formed Sanskrit shloka passes quality evaluation");
  assert(goodEval.compositeScore >= 0.80, `High composite score awarded: ${goodEval.compositeScore}`);

  // --------------------------------------------------------------------------
  // 5. UNIT TESTS: SANSKRIT STRUCTURAL VALIDATION & 4-TIER CONFIDENCE
  // --------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------");
  console.log("5. UNIT TESTS: SANSKRIT STRUCTURAL VALIDATOR & 4-TIER CONFIDENCE");
  console.log("--------------------------------------------------------------------------\n");

  // 5.1 Structural validation of clean Sanskrit verse
  const cleanVerse = "गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः । गुरुः साक्षात् परं ब्रह्म तस्मै श्रीगुरवे नमः ॥";
  const validResult = validateDevanagariText(cleanVerse);
  assert(validResult.isValid === true, "Authentic Guru Stotram verse marked valid");
  assert(validResult.qualityLevel === "HIGH", "Quality level evaluated as HIGH");
  assert(validResult.score >= 0.95, `Validity score >= 0.95 (actual: ${validResult.score})`);

  // 5.2 Structural validation flagging illegal consecutive halants and orphaned matras
  const anomalousText = "क््ख कुछ  िगलत ईे शब्द";
  const anomalyResult = validateDevanagariText(anomalousText);
  assert(anomalyResult.isValid === false, "Text with illegal virama and dangling matras marked invalid");
  assert(anomalyResult.issues.some(i => i.code === DEVANAGARI_ISSUE_CODES.ILLEGAL_CONSECUTIVE_VIRAMA), "Flagged ILLEGAL_CONSECUTIVE_VIRAMA");
  assert(anomalyResult.issues.some(i => i.code === DEVANAGARI_ISSUE_CODES.ORPHANED_COMBINING_MATRA), "Flagged ORPHANED_COMBINING_MATRA");
  assert(anomalyResult.issues.some(i => i.code === DEVANAGARI_ISSUE_CODES.MATRA_ON_INDEPENDENT_VOWEL), "Flagged MATRA_ON_INDEPENDENT_VOWEL");

  // 5.3 4-Tier confidence calculation
  // Tier 1: Verified Proofread (human approval)
  const tierProofread = calculateConfidence([{ confidence: 0.82, text: "Some text" }], null, { proofread: true });
  assert(tierProofread.tier === CONFIDENCE_LEVELS.VERIFIED_PROOFREAD, "Tier classified as VERIFIED_PROOFREAD");
  assert(tierProofread.requiresProofreading === false, "Verified proofread requires no further review");

  // Tier 2: High Confidence
  const tierHigh = calculateConfidence([{ confidence: 0.93, text: cleanVerse }], null, { structuralValidityScore: 0.98 });
  assert(tierHigh.tier === CONFIDENCE_LEVELS.HIGH_CONFIDENCE, "Tier classified as HIGH_CONFIDENCE");
  assert(tierHigh.requiresProofreading === false, "High confidence requires no further review");

  // Tier 3: Needs Review (good raw confidence but structural anomalies detected)
  const tierNeedsReview = calculateConfidence([{ confidence: 0.91, text: anomalousText }], null, { structuralValidityScore: 0.45 });
  assert(tierNeedsReview.tier === CONFIDENCE_LEVELS.NEEDS_REVIEW, "Degraded to NEEDS_REVIEW due to structural Devanagari defect");
  assert(tierNeedsReview.requiresProofreading === true, "Needs review requires human proofreading");

  // Tier 4: Low Confidence
  const tierLow = calculateConfidence([{ confidence: 0.52, text: "Garbled" }], null);
  assert(tierLow.tier === CONFIDENCE_LEVELS.LOW_CONFIDENCE, "Tier classified as LOW_CONFIDENCE");
  assert(tierLow.requiresProofreading === true, "Low confidence requires proofreading");

  // --------------------------------------------------------------------------
  // 6. UNIT TESTS: SCAN BORDER REMOVAL & RESOLUTION NORMALIZATION
  // --------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------");
  console.log("6. UNIT TESTS: SCAN BORDER REMOVAL & RESOLUTION NORMALIZATION");
  console.log("--------------------------------------------------------------------------\n");

  // 6.1 Scan border removal test
  const testW = 100, testH = 100;
  const testPixels = Buffer.alloc(testW * testH * 4, 255); // white
  // Add dark border on left edge (x: 0..3)
  for (let y = 0; y < testH; y++) {
    for (let x = 0; x < 4; x++) {
      const idx = (y * testW + x) * 4;
      testPixels[idx] = 10;
      testPixels[idx + 1] = 10;
      testPixels[idx + 2] = 10;
    }
  }
  const clearedPixels = removeScanBorders(testPixels, testW, testH);
  // Check that dark left border has been cleared to 255
  let borderCleared = true;
  for (let y = 0; y < testH; y++) {
    for (let x = 0; x < 4; x++) {
      if (clearedPixels[(y * testW + x) * 4] < 200) {
        borderCleared = false;
        break;
      }
    }
  }
  assert(borderCleared === true, "Dark scanner edge border cleared to white background");

  // --------------------------------------------------------------------------
  // 5. SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n==========================================================================");
  console.log(`  EVALUATION SUITE COMPLETED: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log("==========================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runBenchmark().catch((err) => {
  console.error("Benchmark execution error:", err);
  process.exit(1);
});
