/**
 * Text Cleaning & Indic Normalization for Digital and OCR Astrology Text.
 * 
 * Cleans formatting noise while strictly preserving:
 * - Hindi and Sanskrit Devanagari script, ligatures, and Vedic accents
 * - Astrology terminology (e.g. गुरु, शनि, राहु, केतु, मेष, वृषभ...)
 * - Sanskrit shlokas, verse line boundaries, and danda punctuation (।, ॥)
 * - Shloka numbering formats (e.g. ॥ १ ॥, ॥ १० ॥, (१), [१])
 * - Never invents words or silently paraphrases text.
 */

/**
 * Normalizes Devanagari dandas (pipe | and double pipe || to । and ॥).
 * In authentic Devanagari typography:
 * - Single danda attaches to the end of a sentence without a space before it (e.g. "होता है।").
 * - Double danda has a space before it and after it (e.g. "सुरेशम् ॥").
 */
export function normalizeDandas(text) {
  if (!text) return "";

  let res = text;

  // Replace double pipe or repeated single danda with double danda ॥
  res = res.replace(/([|।!]\s*[|।!])/g, "॥");

  // Replace single vertical bar | with single danda । when near Devanagari or Devanagari digits
  res = res.replace(/(?<=[\u0900-\u097F०-९\d\s])\|(?=[\s०-९\d॥]|$)/g, "।");

  // Double danda formatting: single space before ॥
  res = res.replace(/(\S)\s*॥/g, "$1 ॥");
  res = res.replace(/॥\s*([०-९\d]+)\s*॥/g, "॥ $1 ॥");

  // Normalize multiple spaces before single danda to at most a single space (preserve verse spacing)
  res = res.replace(/(\S)[ \t]{2,}।(?=[\s\n]|$)/g, "$1 ।");

  // Clean double spaces introduced
  res = res.replace(/[ \t]{2,}/g, " ");

  return res.trim();
}

export function cleanText(rawText, options = {}) {
  if (!rawText || typeof rawText !== "string") {
    return "";
  }

  // 1. Unicode NFC Canonical Composition
  let text = rawText.normalize("NFC");

  // 2. Remove invalid control characters, zero-width space (\u200B) and BOM (\uFEFF)
  // Strictly preserve Zero Width Non-Joiner (\u200C) and Zero Width Joiner (\u200D) required for Sanskrit/Devanagari conjunct ligatures
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\u200B\uFEFF]/g, "");

  // 3. Normalize carriage returns to standard newline
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 4. Fix broken English word hyphenation across linebreaks (e.g. "sig-\nnificant" -> "significant")
  text = text.replace(/([a-zA-Z]{2,})-\n\s*([a-zA-Z]{2,})/g, "$1$2");

  // 5. Danda and punctuation normalization for Indic text
  const isIndic =
    options.isIndic ||
    options.language === "Hindi" ||
    options.language === "Sanskrit" ||
    options.language === "hin" ||
    options.language === "san" ||
    /[\u0900-\u097F]/.test(text);

  if (isIndic) {
    text = normalizeDandas(text);
  }

  // 6. Split lines to process headers, footers, and page number noise
  let lines = text.split("\n").map((l) => l.trim());

  // Filter out standalone page number lines at the very top or very bottom
  if (lines.length > 0 && /^\d+$/.test(lines[0])) {
    lines.shift();
  }
  if (lines.length > 0 && /^\d+$/.test(lines[lines.length - 1])) {
    lines.pop();
  }

  // Remove repeated running headers or footers if passed
  if (options.runningHeader && options.runningHeader.trim()) {
    const h = options.runningHeader.trim().toLowerCase();
    lines = lines.filter((l) => l.toLowerCase() !== h);
  }
  if (options.runningFooter && options.runningFooter.trim()) {
    const f = options.runningFooter.trim().toLowerCase();
    lines = lines.filter((l) => l.toLowerCase() !== f);
  }

  // Process each line for excessive internal whitespace without touching Devanagari characters
  lines = lines.map((line) => {
    let cleanedLine = line.replace(/[ \t]+/g, " ");

    // Remove isolated stray ASCII noise artifacts at ends or starts of lines (e.g. ~^ or `_)
    cleanedLine = cleanedLine.replace(/\s+[\^~`_\\\/]+\s*$/g, "");
    cleanedLine = cleanedLine.replace(/^[\^~`_\\\/]+\s+/g, "");

    return cleanedLine.trim();
  });

  // 7. Rejoin and clean excessive consecutive blank lines
  text = lines.join("\n");
  text = text.replace(/\n{3,}/g, "\n\n");

  return text.trim();
}
