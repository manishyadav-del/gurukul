/**
 * OCR Confidence calculation and classification utilities.
 */

export const CONFIDENCE_LEVELS = {
  HIGH: "HIGH",
  MEDIUM: "MEDIUM",
  LOW: "LOW",
};

export const DEFAULT_THRESHOLDS = {
  high: 0.90,
  medium: 0.75,
};

/**
 * Calculates page-level, average, and minimum confidence scores from blocks.
 * 
 * @param {Array<{ confidence?: number }>} blocks
 * @param {number|null} pageRawConfidence - Raw page confidence (0-1 or 0-100)
 * @returns {{
 *   pageConfidence: number,
 *   averageBlockConfidence: number,
 *   minBlockConfidence: number,
 *   level: 'HIGH' | 'MEDIUM' | 'LOW',
 *   requiresProofreading: boolean
 * }}
 */
export function calculateConfidence(blocks = [], pageRawConfidence = null, customThresholds = {}) {
  const highThreshold = customThresholds.high ?? parseFloat(process.env.OCR_HIGH_CONFIDENCE || "0.90");
  const mediumThreshold = customThresholds.medium ?? parseFloat(process.env.OCR_MIN_CONFIDENCE || "0.75");

  if (!blocks || blocks.length === 0) {
    const fallbackScore = pageRawConfidence !== null
      ? (pageRawConfidence > 1 ? pageRawConfidence / 100 : pageRawConfidence)
      : 0;

    const level = fallbackScore >= highThreshold
      ? CONFIDENCE_LEVELS.HIGH
      : fallbackScore >= mediumThreshold
        ? CONFIDENCE_LEVELS.MEDIUM
        : CONFIDENCE_LEVELS.LOW;

    return {
      pageConfidence: Math.round(fallbackScore * 1000) / 1000,
      averageBlockConfidence: Math.round(fallbackScore * 1000) / 1000,
      minBlockConfidence: Math.round(fallbackScore * 1000) / 1000,
      level,
      requiresProofreading: level === CONFIDENCE_LEVELS.LOW,
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
      requiresProofreading: true,
    };
  }

  const sum = scores.reduce((acc, curr) => acc + curr, 0);
  const avg = sum / scores.length;
  const min = Math.min(...scores);

  // If page raw confidence was supplied, blend it or default to average block confidence
  const pageScore = pageRawConfidence !== null
    ? (pageRawConfidence > 1 ? pageRawConfidence / 100 : pageRawConfidence)
    : avg;

  const level = pageScore >= highThreshold
    ? CONFIDENCE_LEVELS.HIGH
    : pageScore >= mediumThreshold
      ? CONFIDENCE_LEVELS.MEDIUM
      : CONFIDENCE_LEVELS.LOW;

  return {
    pageConfidence: Math.round(pageScore * 1000) / 1000,
    averageBlockConfidence: Math.round(avg * 1000) / 1000,
    minBlockConfidence: Math.round(min * 1000) / 1000,
    level,
    requiresProofreading: level === CONFIDENCE_LEVELS.LOW,
  };
}
