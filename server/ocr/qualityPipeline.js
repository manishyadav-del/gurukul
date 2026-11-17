/**
 * Confidence-Based OCR Quality & Multi-Attempt Retry Pipeline
 * 
 * Implements a robust quality pipeline:
 * 1. Executes primary OCR with standard preprocessing.
 * 2. Evaluates output quality across multiple dimensions:
 *    - Engine confidence
 *    - Empty or suspiciously short text
 *    - Excessive replacement characters (\uFFFD)
 *    - Malformed Devanagari sequences (e.g. orphaned matras without base consonants)
 *    - Abnormal noise character distributions
 * 3. Retries low-quality pages with alternative preprocessing (Adaptive local thresholding, deskewing).
 * 4. Retries with alternative PSM mode (PSM 6: uniform block) when beneficial.
 * 5. Compares candidates using composite multi-factor validity (NOT confidence alone).
 * 6. Selects the superior result and retains diagnostic logs.
 * 
 * JavaScript only.
 */

import { runTesseractOcr } from "./recognize.js";
import { preprocessImageBuffer } from "./preprocess.js";
import { normalizeOcrResult } from "./normalize.js";
import { calculateConfidence } from "./confidence.js";
import { validateDevanagariText } from "./sanskritValidator.js";

/**
 * Evaluates the quality and validity of an OCR output candidate.
 * Incorporates structural Devanagari validation, syllable balance, and noise checks.
 * 
 * @param {Object} candidate - Raw OCR result
 * @param {Object} context - Target language, page number, script
 * @returns {{
 *   confidence: number,
 *   passesQuality: boolean,
 *   reasons: string[],
 *   compositeScore: number,
 *   metrics: {
 *     textLength: number,
 *     devanagariCount: number,
 *     orphanedMatraCount: number,
 *     replacementCharCount: number,
 *     noiseCharCount: number,
 *     validityScore: number,
 *     structuralValidityScore: number
 *   }
 * }}
 */
export function evaluateOcrCandidate(candidate, context = {}) {
  const text = (candidate.fullText || candidate.text || "").trim();
  const textLength = text.length;
  let confidence = 0;
  if (typeof candidate.stats?.pageConfidence === "number") {
    confidence = candidate.stats.pageConfidence;
  } else if (typeof candidate.confidence === "number") {
    confidence = candidate.confidence > 1 ? candidate.confidence / 100 : candidate.confidence;
  } else if (Array.isArray(candidate.blocks) && candidate.blocks.length > 0) {
    const validScores = candidate.blocks
      .map(b => typeof b.confidence === "number" ? (b.confidence > 1 ? b.confidence / 100 : b.confidence) : null)
      .filter(s => s !== null);
    if (validScores.length > 0) {
      confidence = Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 1000) / 1000;
    }
  }

  const lang = String(context.language || "").toLowerCase();
  const isIndic = lang === "hi" || lang === "hindi" || lang === "sa" || lang === "sanskrit" || context.script === "Devanagari";

  const reasons = [];

  // 1. Empty or suspiciously short
  if (textLength === 0) {
    reasons.push("EMPTY_TEXT");
  } else if (textLength < 12) {
    reasons.push("SUSPICIOUSLY_SHORT_TEXT");
  }

  // 2. Count Devanagari characters
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const devanagariRatio = textLength > 0 ? devanagariCount / textLength : 0;

  // 3. Deep Devanagari structural validation
  let structuralValidityScore = 1.0;
  if (devanagariCount > 0 || isIndic) {
    const devValidation = validateDevanagariText(text);
    structuralValidityScore = devValidation.score;
    for (const issue of devValidation.issues) {
      if (issue.severity === "CRITICAL" || issue.severity === "WARNING") {
        reasons.push(`${issue.code}: ${issue.message}`);
      }
    }
  }

  // 4. Detect malformed Devanagari: orphaned combining marks without a base consonant
  const orphanedMatras = (text.match(/(?:^|[\s\p{P}])[\u093E-\u094C\u0901\u0902\u0903\u094D]/gu) || []).length;
  if (orphanedMatras > 2 && !reasons.some(r => r.includes("ORPHANED_COMBINING_MATRA"))) {
    reasons.push(`MALFORMED_DEVANAGARI_ORPHANED_MATRAS (${orphanedMatras})`);
  }

  // 5. Replacement characters (\uFFFD or unprintable sequences)
  const replacementCharCount = (text.match(/\uFFFD/g) || []).length;
  if (replacementCharCount > 2 && !reasons.some(r => r.includes("CORRUPTED_UNICODE_REPLACEMENT"))) {
    reasons.push(`EXCESSIVE_REPLACEMENT_CHARS (${replacementCharCount})`);
  }

  // 6. Noise characters (isolated ASCII junk often produced by OCR on scan dust: ~ ^ _ ` \)
  const noiseCharCount = (text.match(/[~^`_\\]/g) || []).length;
  const noiseRatio = textLength > 0 ? noiseCharCount / textLength : 0;
  if (noiseRatio > 0.05 && !reasons.some(r => r.includes("HIGH_NOISE_ARTIFACT_DENSITY"))) {
    reasons.push("HIGH_NOISE_CHARACTER_DENSITY");
  }

  // 7. Indic script expectation check
  if (isIndic && textLength > 25 && devanagariRatio < 0.20 && !reasons.some(r => r.includes("ABNORMAL_LOW_DEVANAGARI_RATIO"))) {
    reasons.push("EXPECTED_INDIC_BUT_FOUND_LOW_DEVANAGARI");
  }

  // 8. Calculate multi-factor composite validity score
  // Balances engine confidence (30%), structural validity (35%), script coherence (25%), and length (10%)
  let validityScore = structuralValidityScore;
  if (noiseRatio > 0) validityScore -= Math.min(0.2, noiseRatio * 2);
  validityScore = Math.max(0, Math.min(1.0, validityScore));

  const lengthFactor = Math.min(1.0, textLength / 50);

  let scriptFactor = 1.0;
  if (isIndic) {
    scriptFactor = Math.min(1.0, devanagariRatio * 1.5);
  }

  const compositeScore = Math.round(
    ((confidence * 0.30) + (validityScore * 0.35) + (scriptFactor * 0.25) + (lengthFactor * 0.10)) * 1000
  ) / 1000;

  const minConfidence = context.minConfidence ?? 0.70;
  const passesQuality = reasons.length === 0 && confidence >= minConfidence && structuralValidityScore >= 0.75;

  return {
    confidence,
    passesQuality,
    reasons,
    compositeScore,
    metrics: {
      textLength,
      devanagariCount,
      orphanedMatraCount: orphanedMatras,
      replacementCharCount,
      noiseCharCount,
      validityScore,
      structuralValidityScore,
    },
  };
}

/**
 * Runs OCR with a multi-recipe quality and retry pipeline.
 * 
 * @param {Buffer} imageBuffer - Scanned page image buffer
 * @param {Object} options - Language, pageNumber, targetDpi, thresholds
 * @returns {Promise<{
 *   pageNumber: number,
 *   blocks: Array,
 *   fullText: string,
 *   stats: Object,
 *   diagnostics: {
 *     attemptsCount: number,
 *     winningRecipe: string,
 *     candidates: Array<{ recipe: string, confidence: number, compositeScore: number, reasons: string[] }>
 *   }
 * }>}
 */
export async function runOcrWithQualityRetries(imageBuffer, options = {}) {
  const pageNumber = options.pageNumber || 1;
  const candidates = [];

  // -------------------------------------------------------------
  // RECIPE 1: Primary Pass (Gentle contrast + Grayscale, PSM 3)
  // -------------------------------------------------------------
  let recipe1Buffer = imageBuffer;
  try {
    recipe1Buffer = await preprocessImageBuffer(imageBuffer, {
      grayscale: true,
      contrast: true,
      contrastFactor: 1.2,
      adaptive: false,
      denoise: false,
    });
  } catch (err) {
    console.warn("[OCR Quality Pipeline] Recipe 1 preprocessing fallback to raw buffer:", err.message);
  }

  const raw1 = await runTesseractOcr(recipe1Buffer, {
    language: options.language,
    psm: 3,
  });

  const norm1 = normalizeOcrResult(raw1, options);
  norm1.confidence = typeof raw1.confidence === "number" ? (raw1.confidence > 1 ? raw1.confidence / 100 : raw1.confidence) : 0.85;
  const eval1 = evaluateOcrCandidate(norm1, options);
  const stats1 = calculateConfidence(norm1.blocks, raw1.confidence, {
    ...options.thresholds,
    structuralValidityScore: eval1.metrics.structuralValidityScore,
  });
  norm1.stats = stats1;

  candidates.push({
    recipe: "Recipe1_StandardContrast_PSM3",
    result: norm1,
    confidence: eval1.confidence,
    compositeScore: eval1.compositeScore,
    reasons: eval1.reasons,
    evaluation: eval1,
  });

  // If Recipe 1 is high quality, return immediately without wasting compute cycles
  if (eval1.passesQuality && eval1.confidence >= 0.85) {
    return {
      pageNumber: norm1.pageNumber,
      blocks: norm1.blocks,
      fullText: norm1.fullText,
      stats: norm1.stats,
      diagnostics: {
        attemptsCount: 1,
        winningRecipe: "Recipe1_StandardContrast_PSM3",
        candidates: candidates.map(c => ({
          recipe: c.recipe,
          confidence: c.confidence,
          compositeScore: c.compositeScore,
          reasons: c.reasons,
        })),
      },
    };
  }

  // -------------------------------------------------------------
  // RECIPE 2: Border Removal + Adaptive Local Thresholding + Auto-Deskew
  // Preserves fine Devanagari matras on unevenly lit scans/manuscripts
  // -------------------------------------------------------------
  try {
    const recipe2Buffer = await preprocessImageBuffer(imageBuffer, {
      grayscale: true,
      contrast: true,
      contrastFactor: 1.45,
      adaptive: true,
      deskew: true,
      denoise: true,
      removeBorders: true,
      upscaleLowRes: true,
      tRatio: 0.12,
    });

    const raw2 = await runTesseractOcr(recipe2Buffer, {
      language: options.language,
      psm: 3,
    });

    const norm2 = normalizeOcrResult(raw2, options);
    norm2.confidence = typeof raw2.confidence === "number" ? (raw2.confidence > 1 ? raw2.confidence / 100 : raw2.confidence) : 0.85;
    const eval2 = evaluateOcrCandidate(norm2, options);
    norm2.stats = calculateConfidence(norm2.blocks, raw2.confidence, {
      ...options.thresholds,
      structuralValidityScore: eval2.metrics.structuralValidityScore,
    });

    candidates.push({
      recipe: "Recipe2_AdaptiveThreshold_BorderRemoval_Deskew_PSM3",
      result: norm2,
      confidence: eval2.confidence,
      compositeScore: eval2.compositeScore,
      reasons: eval2.reasons,
      evaluation: eval2,
    });

    // If candidate 2 achieved clean high-quality output, select it
    if (eval2.passesQuality && eval2.compositeScore > eval1.compositeScore) {
      return {
        pageNumber: norm2.pageNumber,
        blocks: norm2.blocks,
        fullText: norm2.fullText,
        stats: norm2.stats,
        diagnostics: {
          attemptsCount: 2,
          winningRecipe: "Recipe2_AdaptiveThreshold_BorderRemoval_Deskew_PSM3",
          candidates: candidates.map(c => ({
            recipe: c.recipe,
            confidence: c.confidence,
            compositeScore: c.compositeScore,
            reasons: c.reasons,
          })),
        },
      };
    }
  } catch (err) {
    console.warn("[OCR Quality Pipeline] Recipe 2 retry encountered an issue:", err.message);
  }

  // -------------------------------------------------------------
  // RECIPE 3: Sanskrit Layout Tuning & Uniform Block Mode (PSM 6)
  // Especially effective for dense classical shloka verses and treatise texts
  // -------------------------------------------------------------
  if (candidates.every(c => !c.evaluation.passesQuality)) {
    try {
      const recipe3Buffer = await preprocessImageBuffer(imageBuffer, {
        grayscale: true,
        contrast: true,
        contrastFactor: 1.6,
        deskew: true,
        adaptive: false,
        denoise: true,
        removeBorders: true,
        upscaleLowRes: true,
      });

      const raw3 = await runTesseractOcr(recipe3Buffer, {
        language: options.language,
        psm: 6, // Uniform single text block
      });

      const norm3 = normalizeOcrResult(raw3, options);
      norm3.confidence = typeof raw3.confidence === "number" ? (raw3.confidence > 1 ? raw3.confidence / 100 : raw3.confidence) : 0.85;
      const eval3 = evaluateOcrCandidate(norm3, options);
      norm3.stats = calculateConfidence(norm3.blocks, raw3.confidence, {
        ...options.thresholds,
        structuralValidityScore: eval3.metrics.structuralValidityScore,
      });

      candidates.push({
        recipe: "Recipe3_HighContrast_BorderRemoval_Deskew_PSM6",
        result: norm3,
        confidence: eval3.confidence,
        compositeScore: eval3.compositeScore,
        reasons: eval3.reasons,
        evaluation: eval3,
      });
    } catch (err) {
      console.warn("[OCR Quality Pipeline] Recipe 3 retry encountered an issue:", err.message);
    }
  }

  // -------------------------------------------------------------
  // SELECTION: Rank candidates by composite multi-factor score
  // -------------------------------------------------------------
  candidates.sort((a, b) => b.compositeScore - a.compositeScore);
  const bestCandidate = candidates[0];

  return {
    pageNumber: bestCandidate.result.pageNumber,
    blocks: bestCandidate.result.blocks,
    fullText: bestCandidate.result.fullText,
    stats: bestCandidate.result.stats,
    diagnostics: {
      attemptsCount: candidates.length,
      winningRecipe: bestCandidate.recipe,
      candidates: candidates.map(c => ({
        recipe: c.recipe,
        confidence: c.confidence,
        compositeScore: c.compositeScore,
        reasons: c.reasons,
      })),
    },
  };
}
