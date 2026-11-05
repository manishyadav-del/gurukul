/**
 * OCR Evaluation Metrics: Levenshtein Distance, CER, and WER
 * 
 * Standard implementations:
 * - Character Error Rate (CER) = Levenshtein(hypothesis, reference) / reference.length
 * - Word Error Rate (WER) = WordLevenshtein(hypothesisWords, referenceWords) / referenceWords.length
 * 
 * JavaScript only.
 */

/**
 * Computes standard Levenshtein edit distance between two sequences (strings or arrays).
 * 
 * @param {Array|string} seq1
 * @param {Array|string} seq2
 * @returns {number} Minimum number of insertions, deletions, or substitutions
 */
export function computeLevenshteinDistance(seq1, seq2) {
  const len1 = seq1.length;
  const len2 = seq2.length;

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  // Space-optimized 2-row dynamic programming
  let prevRow = new Int32Array(len2 + 1);
  let currRow = new Int32Array(len2 + 1);

  for (let j = 0; j <= len2; j++) {
    prevRow[j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    currRow[0] = i;
    const item1 = seq1[i - 1];

    for (let j = 1; j <= len2; j++) {
      const item2 = seq2[j - 1];
      const cost = item1 === item2 ? 0 : 1;
      currRow[j] = Math.min(
        currRow[j - 1] + 1,       // insertion
        prevRow[j] + 1,           // deletion
        prevRow[j - 1] + cost     // substitution
      );
    }

    // Swap rows
    const temp = prevRow;
    prevRow = currRow;
    currRow = temp;
  }

  return prevRow[len2];
}

/**
 * Calculates Character Error Rate (CER) against ground truth reference text.
 * 
 * @param {string} hypothesis - OCR output text
 * @param {string} reference - Ground truth verified reference text
 * @returns {{ cer: number, edits: number, refLength: number, accuracy: number }}
 */
export function calculateCER(hypothesis, reference) {
  const hypNorm = (hypothesis || "").trim().normalize("NFC");
  const refNorm = (reference || "").trim().normalize("NFC");

  if (!refNorm) {
    return { cer: hypNorm ? 1.0 : 0.0, edits: hypNorm.length, refLength: 0, accuracy: hypNorm ? 0 : 1.0 };
  }

  const edits = computeLevenshteinDistance(Array.from(hypNorm), Array.from(refNorm));
  const refLength = Array.from(refNorm).length;
  const cer = Math.round((edits / refLength) * 1000) / 1000;
  const accuracy = Math.max(0, Math.round((1 - cer) * 1000) / 1000);

  return {
    cer,
    edits,
    refLength,
    accuracy,
  };
}

/**
 * Calculates Word Error Rate (WER) against ground truth reference text.
 * 
 * @param {string} hypothesis - OCR output text
 * @param {string} reference - Ground truth verified reference text
 * @returns {{ wer: number, edits: number, refWords: number, accuracy: number }}
 */
export function calculateWER(hypothesis, reference) {
  const hypWords = (hypothesis || "").trim().normalize("NFC").split(/\s+/).filter(w => w.length > 0);
  const refWords = (reference || "").trim().normalize("NFC").split(/\s+/).filter(w => w.length > 0);

  if (refWords.length === 0) {
    return { wer: hypWords.length > 0 ? 1.0 : 0.0, edits: hypWords.length, refWords: 0, accuracy: hypWords.length > 0 ? 0 : 1.0 };
  }

  const edits = computeLevenshteinDistance(hypWords, refWords);
  const refWordCount = refWords.length;
  const wer = Math.round((edits / refWordCount) * 1000) / 1000;
  const accuracy = Math.max(0, Math.round((1 - wer) * 1000) / 1000);

  return {
    wer,
    edits,
    refWords: refWordCount,
    accuracy,
  };
}
