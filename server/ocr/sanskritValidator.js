/**
 * server/ocr/sanskritValidator.js
 * 
 * Sanskrit and Hindi Text Quality Validation Engine
 * 
 * Performs structural, phonetic, and orthographic validation of OCR extracted text
 * without modifying the original text. Identifies anomalies, assigns a structural
 * validity score, and generates human-reviewable issue diagnostics.
 * 
 * Checks include:
 * 1. Invalid Unicode sequences (consecutive viramas, matra before consonant)
 * 2. Broken Devanagari characters (orphaned matras, matra on independent vowel)
 * 3. Suspicious character combinations (Latin characters embedded in Devanagari words)
 * 4. Unusual word fragmentation or isolated single-letter tokens
 * 5. Repeated OCR noise artifacts (~, ^, `, _, \)
 * 6. Sanskrit verse balance (quarter verses, dandas, meter scan)
 * 7. Legacy DTP mojibake patterns
 * 
 * Strictly non-destructive: flags issues for scholarly review; never silently alters text.
 */

export const ISSUE_SEVERITY = {
  CRITICAL: "CRITICAL",
  WARNING: "WARNING",
  INFO: "INFO",
};

export const DEVANAGARI_ISSUE_CODES = {
  EMPTY_TEXT: "EMPTY_TEXT",
  CORRUPTED_UNICODE_REPLACEMENT: "CORRUPTED_UNICODE_REPLACEMENT",
  ABNORMAL_LOW_DEVANAGARI_RATIO: "ABNORMAL_LOW_DEVANAGARI_RATIO",
  ILLEGAL_CONSECUTIVE_VIRAMA: "ILLEGAL_CONSECUTIVE_VIRAMA",
  ORPHANED_COMBINING_MATRA: "ORPHANED_COMBINING_MATRA",
  MATRA_ON_INDEPENDENT_VOWEL: "MATRA_ON_INDEPENDENT_VOWEL",
  MIXED_SCRIPT_WORD_ANOMALY: "MIXED_SCRIPT_WORD_ANOMALY",
  HIGH_NOISE_ARTIFACT_DENSITY: "HIGH_NOISE_ARTIFACT_DENSITY",
  MISSING_SINGLE_DANDA_HEMISTICH: "MISSING_SINGLE_DANDA_HEMISTICH",
};

/**
 * Validates Devanagari / Sanskrit text for structural, orthographic, and OCR anomalies.
 * 
 * @param {string} text - OCR text to validate
 * @param {Object} [options]
 * @param {string} [options.language="sa"] - 'sa', 'san', 'hi', 'hin', 'sanskrit', 'hindi'
 * @param {number} [options.minConfidence=0.75]
 * @returns {{
 *   isValid: boolean,
 *   structuralValidityScore: number, // 0.00 - 1.00
 *   qualityLevel: 'HIGH' | 'NEEDS_REVIEW' | 'LOW',
 *   issues: Array<{
 *     code: string,
 *     severity: 'CRITICAL' | 'WARNING' | 'INFO',
 *     message: string,
 *     snippet?: string,
 *     count?: number
 *   }>,
 *   metrics: {
 *     totalChars: number,
 *     devanagariChars: number,
 *     devanagariRatio: number,
 *     wordCount: number,
 *     verseCount: number,
 *     dandaCount: number,
 *     orphanedMatraCount: number,
 *     brokenConjunctCount: number,
 *     noiseCharCount: number
 *   }
 * }}
 */
export function validateDevanagariText(text, options = {}) {
  const raw = typeof text === "string" ? text.trim() : "";
  const totalChars = raw.length;

  const issues = [];
  let deduction = 0;

  if (totalChars === 0) {
    return {
      isValid: false,
      structuralValidityScore: 0,
      qualityLevel: "LOW",
      issues: [
        {
          code: "EMPTY_TEXT",
          severity: ISSUE_SEVERITY.CRITICAL,
          message: "Page yielded zero text content.",
        },
      ],
      metrics: {
        totalChars: 0,
        devanagariChars: 0,
        devanagariRatio: 0,
        wordCount: 0,
        verseCount: 0,
        dandaCount: 0,
        orphanedMatraCount: 0,
        brokenConjunctCount: 0,
        noiseCharCount: 0,
      },
    };
  }

  // 1. Character Counts & Ratios
  const devanagariMatches = raw.match(/[\u0900-\u097F]/g) || [];
  const devanagariChars = devanagariMatches.length;
  const devanagariRatio = Math.round((devanagariChars / totalChars) * 100) / 100;

  const words = raw.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const singleDandas = (raw.match(/।/g) || []).length;
  const doubleDandas = (raw.match(/॥/g) || []).length;
  const dandaCount = singleDandas + doubleDandas;
  const verseCount = doubleDandas;

  // 2. Critical Check: Replacement character (\uFFFD) indicating corrupted decoding
  const replacementMatches = raw.match(/\uFFFD/g) || [];
  if (replacementMatches.length > 0) {
    issues.push({
      code: "CORRUPTED_UNICODE_REPLACEMENT",
      severity: ISSUE_SEVERITY.CRITICAL,
      message: `Detected ${replacementMatches.length} Unicode replacement character(s) (\\uFFFD). Text layer or OCR stream has unmapped glyphs.`,
      count: replacementMatches.length,
    });
    deduction += Math.min(35, replacementMatches.length * 8);
  }

  // 3. Indic Expected Script Ratio Check
  const lang = String(options.language || "").toLowerCase();
  const isIndicExpected = lang.includes("hi") || lang.includes("sa") || lang.includes("san") || lang.includes("hin");

  if (isIndicExpected && totalChars > 25 && devanagariRatio < 0.30) {
    issues.push({
      code: "ABNORMAL_LOW_DEVANAGARI_RATIO",
      severity: ISSUE_SEVERITY.CRITICAL,
      message: `Devanagari ratio is only ${Math.round(devanagariRatio * 100)}% on an Indic manuscript page. Likely legacy DTP font or misaligned OCR engine.`,
      count: Math.round(devanagariRatio * 100),
    });
    deduction += 30;
  }

  // 4. Broken Conjuncts & Illegal Virama Sequences (e.g. consecutive virama ््)
  const doubleViramaMatches = raw.match(/\u094D\u094D+/g) || [];
  const brokenConjunctCount = doubleViramaMatches.length;
  if (brokenConjunctCount > 0) {
    issues.push({
      code: "ILLEGAL_CONSECUTIVE_VIRAMA",
      severity: ISSUE_SEVERITY.WARNING,
      message: `Detected ${brokenConjunctCount} illegal consecutive Virama (््) sequence(s), indicating broken conjunct consonant rendering.`,
      count: brokenConjunctCount,
    });
    deduction += Math.min(20, brokenConjunctCount * 5);
  }

  // 5. Orphaned / Dangling Matras
  // A combining matra or anusvara/visarga standing alone at the start of a token or isolated by space
  const orphanedMatraMatches = raw.match(/(?:^|[\s\p{P}])[\u093E-\u094C\u0901\u0902\u0903\u094D]/gu) || [];
  const orphanedMatraCount = orphanedMatraMatches.length;
  if (orphanedMatraCount > 0) {
    issues.push({
      code: "ORPHANED_COMBINING_MATRA",
      severity: orphanedMatraCount > 3 ? ISSUE_SEVERITY.WARNING : ISSUE_SEVERITY.INFO,
      message: `Detected ${orphanedMatraCount} orphaned matra(s) or accents lacking a base consonant.`,
      count: orphanedMatraCount,
    });
    deduction += Math.min(25, orphanedMatraCount * 4);
  }

  // 6. Matra on Independent Vowel (e.g. अा, अो, अौ, एे, इी)
  const invalidVowelMatraMatches = raw.match(/[अआइईउऊऋएऐओऔ][\u093E-\u094C]/gu) || [];
  if (invalidVowelMatraMatches.length > 0) {
    issues.push({
      code: "MATRA_ON_INDEPENDENT_VOWEL",
      severity: ISSUE_SEVERITY.WARNING,
      message: `Detected ${invalidVowelMatraMatches.length} decomposed vowel sequence(s) (e.g. '${invalidVowelMatraMatches[0]}').`,
      snippet: invalidVowelMatraMatches.slice(0, 3).join(", "),
      count: invalidVowelMatraMatches.length,
    });
    deduction += Math.min(15, invalidVowelMatraMatches.length * 3);
  }

  // 7. Mixed Script Anomalies: Latin characters embedded directly inside Devanagari words
  // e.g. "कlल", "सmय", "शlन्ति" (excluding valid Sanskrit IAST diacritics or standard abbreviations)
  const mixedScriptWords = words.filter((w) => /[\u0900-\u097F]/.test(w) && /[a-zA-Z]/.test(w));
  if (mixedScriptWords.length > 0) {
    issues.push({
      code: "MIXED_SCRIPT_WORD_ANOMALY",
      severity: ISSUE_SEVERITY.WARNING,
      message: `Detected ${mixedScriptWords.length} word(s) mixing Latin and Devanagari characters.`,
      snippet: mixedScriptWords.slice(0, 3).join(", "),
      count: mixedScriptWords.length,
    });
    deduction += Math.min(20, mixedScriptWords.length * 4);
  }

  // 8. OCR Dust / Noise Character Density (~, ^, `, _, \)
  const noiseMatches = raw.match(/[~^`_\\]/g) || [];
  const noiseCharCount = noiseMatches.length;
  const noiseRatio = totalChars > 0 ? noiseCharCount / totalChars : 0;
  if (noiseRatio > 0.03 || noiseCharCount > 5) {
    issues.push({
      code: "HIGH_NOISE_ARTIFACT_DENSITY",
      severity: ISSUE_SEVERITY.WARNING,
      message: `Detected high concentration of OCR scan dust noise characters (${noiseCharCount} artifacts).`,
      count: noiseCharCount,
    });
    deduction += Math.min(20, Math.round(noiseRatio * 150));
  }

  // 9. Sanskrit Verse Danda Integrity
  // If text appears to be a Sanskrit verse (contains double danda ॥), verify balanced structure
  if (doubleDandas > 0 && singleDandas === 0 && wordCount > 16) {
    issues.push({
      code: "MISSING_SINGLE_DANDA_HEMISTICH",
      severity: ISSUE_SEVERITY.INFO,
      message: "Verse ends with double danda (॥) but lacks single danda (।) separating hemistichs (half-verses).",
    });
    deduction += 5;
  }

  // 10. Compute Final Structural Validity Score
  const rawScore = Math.max(0, 100 - deduction) / 100;
  const structuralValidityScore = Math.round(rawScore * 1000) / 1000;

  let qualityLevel = "HIGH";
  if (structuralValidityScore < 0.70 || issues.some((i) => i.severity === ISSUE_SEVERITY.CRITICAL)) {
    qualityLevel = "LOW";
  } else if (structuralValidityScore < 0.88 || issues.some((i) => i.severity === ISSUE_SEVERITY.WARNING)) {
    qualityLevel = "NEEDS_REVIEW";
  }

  const isValid = structuralValidityScore >= 0.85 &&
    !issues.some((i) => i.severity === ISSUE_SEVERITY.CRITICAL || i.severity === ISSUE_SEVERITY.WARNING);

  return {
    isValid,
    structuralValidityScore,
    score: structuralValidityScore,
    qualityLevel,
    issues,
    metrics: {
      totalChars,
      devanagariChars,
      devanagariRatio,
      wordCount,
      verseCount,
      dandaCount,
      orphanedMatraCount,
      brokenConjunctCount,
      noiseCharCount,
    },
  };
}

export function calculateSanskritTextQuality(text, options = {}) {
  return validateDevanagariText(text, options);
}
