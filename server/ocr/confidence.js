/**
 * OCR Confidence calculation and classification utilities.
 * 
 * 4-Tier Transparent Quality & Lifecycle Classification:
 * - VERIFIED_PROOFREAD: Manually reviewed, verified, and approved by human scholar/editor.
 * - HIGH_CONFIDENCE (HIGH): Page confidence >= 0.88 with strong structural Devanagari validity.
 * - NEEDS_REVIEW (MEDIUM): Marginal confidence (0.70-0.88) or structural anomalies flagged.
 * - LOW_CONFIDENCE (LOW): Substandard confidence (< 0.70) or severe malformations.
 */

export const CONFIDENCE_LEVELS = {
  VERIFIED_PROOFREAD: "VERIFIED_PROOFREAD",
  HIGH_CONFIDENCE: "HIGH_CONFIDENCE",
  NEEDS_REVIEW: "NEEDS_REVIEW",
  LOW_CONFIDENCE: "LOW_CONFIDENCE",
  // Backward compatibility aliases
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
};

export const DEFAULT_THRESHOLDS = {
  high: 0.88,
  medium: 0.70,
};

/**
 * Calculates page-level, average, and minimum confidence scores from blocks.
 * Optionally incorporates structural Devanagari validity score.
 * 
 * @param {Array<{ confidence?: number, text?: string }>} blocks
 * @param {number|null} pageRawConfidence - Raw page confidence (0-1 or 0-100)
 * @param {Object} [customThresholds]
 * @param {number} [customThresholds.high=0.88]
 * @param {number} [customThresholds.medium=0.70]
 * @param {boolean} [customThresholds.proofread=false]
 * @param {number} [customThresholds.structuralValidityScore] - Structural validity (0.0 - 1.0)
 * @returns {{
 *   pageConfidence: number,
 *   averageBlockConfidence: number,
 *   minBlockConfidence: number,
 *   level: string,
 *   tier: 'VERIFIED_PROOFREAD' | 'HIGH_CONFIDENCE' | 'NEEDS_REVIEW' | 'LOW_CONFIDENCE',
 *   requiresProofreading: boolean,
 *   structuralValidityScore: number|null
 * }}
 */
export function calculateConfidence(blocks = [], pageRawConfidence = null, customThresholds = {}) {
  const highThreshold = customThresholds.high ?? parseFloat(process.env.OCR_HIGH_CONFIDENCE || "0.88");
  const mediumThreshold = customThresholds.medium ?? parseFloat(process.env.OCR_MIN_CONFIDENCE || "0.70");
  const isProofread = Boolean(customThresholds.proofread || customThresholds.isApproved);
  const structuralScore = typeof customThresholds.structuralValidityScore === "number"
    ? Math.max(0, Math.min(1, customThresholds.structuralValidityScore))
    : null;

  if (isProofread) {
    const baseScore = pageRawConfidence !== null
      ? (pageRawConfidence > 1 ? pageRawConfidence / 100 : pageRawConfidence)
      : 0.95;
    return {
      pageConfidence: Math.round(baseScore * 1000) / 1000,
      averageBlockConfidence: Math.round(baseScore * 1000) / 1000,
      minBlockConfidence: Math.round(baseScore * 1000) / 1000,
      level: CONFIDENCE_LEVELS.VERIFIED_PROOFREAD,
      tier: CONFIDENCE_LEVELS.VERIFIED_PROOFREAD,
      requiresProofreading: false,
      structuralValidityScore: structuralScore ?? 1.0,
    };
  }

  if (!blocks || blocks.length === 0) {
    let fallbackScore = pageRawConfidence !== null
      ? (pageRawConfidence > 1 ? pageRawConfidence / 100 : pageRawConfidence)
      : 0;

    if (structuralScore !== null) {
      fallbackScore = (fallbackScore * 0.65) + (structuralScore * 0.35);
    }

    const tier = fallbackScore >= highThreshold && (structuralScore === null || structuralScore >= 0.75)
      ? CONFIDENCE_LEVELS.HIGH_CONFIDENCE
      : fallbackScore >= mediumThreshold
        ? CONFIDENCE_LEVELS.NEEDS_REVIEW
        : CONFIDENCE_LEVELS.LOW_CONFIDENCE;

    const level = tier === CONFIDENCE_LEVELS.HIGH_CONFIDENCE
      ? CONFIDENCE_LEVELS.HIGH
      : tier === CONFIDENCE_LEVELS.NEEDS_REVIEW
        ? CONFIDENCE_LEVELS.MEDIUM
        : CONFIDENCE_LEVELS.LOW;

    return {
      pageConfidence: Math.round(fallbackScore * 1000) / 1000,
      averageBlockConfidence: Math.round(fallbackScore * 1000) / 1000,
      minBlockConfidence: Math.round(fallbackScore * 1000) / 1000,
      level,
      tier,
      requiresProofreading: tier !== CONFIDENCE_LEVELS.HIGH_CONFIDENCE,
      structuralValidityScore: structuralScore,
    };
  }

  const scores = blocks
    .map((b) => (typeof b.confidence === "number" ? (b.confidence > 1 ? b.confidence / 100 : b.confidence) : null))
    .filter((s) => s !== null);

  if (scores.length === 0) {
    return {
      pageConfidence: 0,
      averageBlockConfidence: 0,
      minBlockConfidence: 0,
      level: CONFIDENCE_LEVELS.LOW,
      tier: CONFIDENCE_LEVELS.LOW_CONFIDENCE,
      requiresProofreading: true,
      structuralValidityScore: structuralScore,
    };
  }

  const sum = scores.reduce((acc, curr) => acc + curr, 0);
  const avg = sum / scores.length;
  const min = Math.min(...scores);

  // If page raw confidence was supplied, blend it or default to average block confidence
  let pageScore = pageRawConfidence !== null
    ? (pageRawConfidence > 1 ? pageRawConfidence / 100 : pageRawConfidence)
    : avg;

  // Blend with structural Devanagari validity if available
  if (structuralScore !== null) {
    pageScore = (pageScore * 0.65) + (structuralScore * 0.35);
  }

  const tier = (pageScore >= highThreshold && (structuralScore === null || structuralScore >= 0.75))
    ? CONFIDENCE_LEVELS.HIGH_CONFIDENCE
    : pageScore >= mediumThreshold
      ? CONFIDENCE_LEVELS.NEEDS_REVIEW
      : CONFIDENCE_LEVELS.LOW_CONFIDENCE;

  const level = tier === CONFIDENCE_LEVELS.HIGH_CONFIDENCE
    ? CONFIDENCE_LEVELS.HIGH
    : tier === CONFIDENCE_LEVELS.NEEDS_REVIEW
      ? CONFIDENCE_LEVELS.MEDIUM
      : CONFIDENCE_LEVELS.LOW;

  return {
    pageConfidence: Math.round(pageScore * 1000) / 1000,
    averageBlockConfidence: Math.round(avg * 1000) / 1000,
    minBlockConfidence: Math.round(min * 1000) / 1000,
    level,
    tier,
    requiresProofreading: tier !== CONFIDENCE_LEVELS.HIGH_CONFIDENCE,
    structuralValidityScore: structuralScore,
  };
}
