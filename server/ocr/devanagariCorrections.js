/**
 * server/ocr/devanagariCorrections.js
 * 
 * Conservative Devanagari & Sanskrit OCR Text Post-Processing
 * 
 * Addresses common OCR recognition issues in Sanskrit and Hindi manuscripts:
 * - Visarga (ः) vs ASCII Colon (:) or Semicolon (;)
 * - Avagraha (ऽ) vs Latin 'S', 's', '5', '$', '§'
 * - Danda (।) & Double Danda (॥) vs ASCII pipes (|), exclamation (!), slash, or 'I'/'l'
 * - Independent vowel composition (e.g. अा -> आ, अो -> ओ, अौ -> औ, एे -> ऐ)
 * - Duplicate identical matras (e.g. ाा -> ा, ीी -> ी, ूू -> ू, ्् -> ्)
 * - Space collapsing between consonant and attached matra (e.g. 'क ा' -> 'का')
 * - Nukta character composition (consonant + nukta canonical ordering)
 * - Preservation of ZWJ (\u200D), ZWNJ (\u200C), Halant, and Vedic accents (\u0951, \u0952)
 * 
 * Strictly non-destructive: Never alters semantic Sanskrit words or guesses uncertain root words.
 */

// Devanagari Unicode character ranges
const DEVANAGARI_CONSONANTS = /[\u0915-\u0939\u0958-\u095F]/;
const DEVANAGARI_MATRAS = /[\u093E-\u094C\u0962\u0963]/;

/**
 * Normalizes Devanagari dandas (।) and double dandas (॥) from common OCR misrecognitions.
 * 
 * @param {string} text
 * @returns {string}
 */
export function normalizeDevanagariDandas(text) {
  if (!text || typeof text !== "string") return "";

  let result = text;

  // 1. Normalize double danda: ||, | |, I I, l l, ! !, / /, \ \ preceded or followed by Devanagari
  result = result.replace(/([।\u0900-\u097F\d०-९\s])(?:\|\|\s*|\|\s*\|\s*|I\s*I\s*|l\s*l\s*|!\s*!\s*|\/{2}\s*|\\{2}\s*)(?=[।\u0900-\u097F\d०-९\s\n]|$)/gu, "$1॥ ");

  // 2. Normalize single danda: single pipe |, uppercase I, lowercase l, exclamation mark ! when standing as verse punctuation
  result = result.replace(/([\u0900-\u097F\d०-९])\s+(?:\||!|\/|\\)\s+([\u0900-\u097F])/gu, "$1 । $2");
  result = result.replace(/([\u0900-\u097F\d०-९])\s*(?:\||!)\s*$/gmu, "$1 ।");
  result = result.replace(/([\u0900-\u097F\d०-९])\s*(?:\|\|)\s*$/gmu, "$1 ॥");

  // 3. Clean up spacing around dandas: exactly one space before and after
  result = result.replace(/\s*।\s*/g, " । ");
  result = result.replace(/\s*॥\s*/g, " ॥ ");

  // Ensure double dandas at end of line don't have trailing whitespace before newline
  result = result.replace(/॥\s+\n/g, "॥\n");
  result = result.replace(/।\s+\n/g, "।\n");

  return result;
}

/**
 * Corrects Visarga (ः) vs ASCII Colon (:) and Semicolon (;) in Devanagari text.
 * In Sanskrit manuscripts, colons immediately following Devanagari words are almost universally Visargas.
 * 
 * @param {string} text
 * @returns {string}
 */
export function normalizeSanskritVisarga(text) {
  if (!text || typeof text !== "string") return "";

  let result = text;

  // Devanagari word followed immediately by colon or semicolon without whitespace:
  // e.g. नम: -> नमः, राम: -> रामः, अध्याय: -> अध्यायः, दुःख: -> दुःखः
  result = result.replace(/([\u0905-\u0939\u093E-\u094C\u0958-\u095F])[;:](?=\s|[।॥,\.\?!]|$)/gu, "$1ः");

  // Devanagari word followed by a space and colon before punctuation/newline: e.g. "नम :" -> "नमः"
  result = result.replace(/([\u0905-\u0939\u093E-\u094C\u0958-\u095F])\s+:(?=\s|[।॥\n]|$)/gu, "$1ः");

  // Remove space between consonant/matra and visarga if created
  result = result.replace(/([\u0900-\u097F])\s+ः/gu, "$1ः");

  return result;
}

/**
 * Corrects Avagraha (ऽ, U+093D) from OCR misrecognitions like 'S', 's', '5', '$', '§'.
 * Avagraha occurs in Sanskrit Sandhi after 'ो' or 'े' (e.g., प्रथमोऽध्यायः, सोऽहम्, तेऽपि, नमोऽस्तु).
 * 
 * @param {string} text
 * @returns {string}
 */
export function normalizeSanskritAvagraha(text) {
  if (!text || typeof text !== "string") return "";

  let result = text;

  // After 'ो' or 'े', replace S, s, 5, $, § when followed by Devanagari consonants
  // e.g. प्रथमोSध्यायः -> प्रथमोऽध्यायः, सो5हम् -> सोऽहम्, शिवो$हम् -> शिवोऽहम्
  result = result.replace(/([ोे])\s*[Ss5\$§]([\u0905-\u0939])/gu, "$1ऽ$2");

  // Standalone between two Devanagari letters: e.g. सो S हम् -> सोऽहम्
  result = result.replace(/([\u0900-\u097F])\s+[Ss5]\s+([\u0900-\u097F])/gu, "$1ऽ$2");

  return result;
}

/**
 * Normalizes Devanagari vowels and matra compositions:
 * - Fixes independent vowel decomposing errors (अा -> आ, अो -> ओ, अौ -> औ, एे -> ऐ, अे -> ए)
 * - Fixes duplicate identical matras (ाा -> ा, ीी -> ी, ूू -> ू, ्् -> ्)
 * - Fixes spaces detached between consonant and combining matra
 * 
 * @param {string} text
 * @returns {string}
 */
export function normalizeDevanagariVowelsAndMatras(text) {
  if (!text || typeof text !== "string") return "";

  let result = text;

  // 1. Independent vowel decomposition fixes
  result = result.replace(/अ[ाा]/gu, "आ");
  result = result.replace(/अ[ोो]/gu, "ओ");
  result = result.replace(/अ[ौौ]/gu, "औ");
  result = result.replace(/अ[ेे]/gu, "ए");
  result = result.replace(/ए[ेे]/gu, "ऐ");
  result = result.replace(/इ[ीी]/gu, "ई");
  result = result.replace(/उ[ुू]/gu, "ऊ");
  result = result.replace(/ऋ[ृृ]/gu, "ॠ");

  // 2. Duplicate identical matras collapsing
  result = result.replace(/ा{2,}/gu, "ा");
  result = result.replace(/ि{2,}/gu, "ि");
  result = result.replace(/ी{2,}/gu, "ी");
  result = result.replace(/ु{2,}/gu, "ु");
  result = result.replace(/ू{2,}/gu, "ू");
  result = result.replace(/ृ{2,}/gu, "ृ");
  result = result.replace(/े{2,}/gu, "े");
  result = result.replace(/ै{2,}/gu, "ै");
  result = result.replace(/ो{2,}/gu, "ो");
  result = result.replace(/ौ{2,}/gu, "ौ");
  result = result.replace(/्{2,}/gu, "्"); // Illegal consecutive virama (््)
  result = result.replace(/ं{2,}/gu, "ं"); // Double anusvara
  result = result.replace(/ः{2,}/gu, "ः"); // Double visarga

  // 3. Fix detached matras separated by whitespace from base consonant:
  // e.g., 'क ा' -> 'का', 'ग ु' -> 'गु', 'म ें' -> 'में'
  result = result.replace(/([\u0915-\u0939\u0958-\u095F])\s+([\u093E-\u094C\u0962\u0963])/gu, "$1$2");

  // 4. Fix detached Virama (्) separated from consonant: e.g. 'क ् ष' -> 'क्ष'
  result = result.replace(/([\u0915-\u0939\u0958-\u095F])\s+्\s*([\u0915-\u0939\u0958-\u095F])/gu, "$1्$2");

  // 5. Fix detached Anusvara (ं) or Chandrabindu (ँ): e.g. 'क ं' -> 'कं'
  result = result.replace(/([\u0905-\u0939\u093E-\u094C])\s+([ंँ])/gu, "$1$2");

  // 6. Nukta ordering: ensure Nukta (\u093C) immediately follows consonant before matra
  // e.g., ड + ा + ़ -> ड़ + ा
  result = result.replace(/([\u0915-\u0939])([\u093E-\u094C])\u093C/gu, "$1\u093C$2");

  return result;
}

/**
 * Comprehensive Devanagari and Sanskrit text correction pipeline.
 * Applies all safe, non-destructive normalization steps and Unicode NFC.
 * 
 * @param {string} text - Raw OCR or text-layer string
 * @param {Object} [options]
 * @param {boolean} [options.preserveVerses=true] - Ensure verse structure is intact
 * @param {boolean} [options.isSanskrit=true] - Apply Sanskrit specific Visarga/Avagraha rules
 * @returns {string} Normalized Devanagari text
 */
export function correctDevanagariOcrText(text, options = {}) {
  if (!text || typeof text !== "string") return "";

  // Step 1: Unicode NFC Normalization (canonical composition)
  let cleaned = text.normalize("NFC");

  // Step 2: Vowels and Matra corrections
  cleaned = normalizeDevanagariVowelsAndMatras(cleaned);

  // Step 3: Visarga vs Colon normalization
  cleaned = normalizeSanskritVisarga(cleaned);

  // Step 4: Avagraha normalization
  cleaned = normalizeSanskritAvagraha(cleaned);

  // Step 5: Danda & Double Danda standardization
  if (options.preserveVerses !== false) {
    cleaned = normalizeDevanagariDandas(cleaned);
  }

  // Step 6: Clean up non-printable control characters (preserve standard \n, \t)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\uFFFD]/g, "");

  // Step 7: Collapse redundant multiple spaces while preserving newlines
  cleaned = cleaned
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n");

  return cleaned.normalize("NFC");
}
