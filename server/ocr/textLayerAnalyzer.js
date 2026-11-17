/**
 * server/ocr/textLayerAnalyzer.js
 * 
 * Advanced Text Layer & Legacy DTP Font Analyzer
 * 
 * Inspects PDF selectable text layers before OCR to decide whether:
 * 1. The page has clean, readable digital Unicode text that can be used directly (skipping OCR).
 * 2. The page is a scan with no text layer (routes to OCR with EMPTY_OR_MINIMAL_TEXT_LAYER).
 * 3. The page has a legacy DTP font (Kruti Dev 010, Chanakya, Walkman-Chanakya, Shusha, DevLys)
 *    and converts it to canonical Unicode Devanagari, or routes to OCR if conversion is unverified.
 * 4. The page has a corrupted text layer (mojibake, PUA characters, replacement \uFFFD) requiring OCR.
 * 
 * Uses multi-heuristic confidence scoring rather than single-metric decisions.
 * JavaScript only.
 */

// ============================================================================
// 1. Kruti Dev 010 Mapping & Signatures
// ============================================================================
const KRUTI_DEV_KEYWORDS = [
  "esa", "gS", "Fkk", "dk", "dh", "ds", "dks", "fn;k", "fd;k", "ugha",
  "rkfd", "Hkh", "vkSj", "gksrk", "Fks", "gSa", "le;", ";g", "og", "rFkk",
  "tc", "rc", "xq#", "xzg", "'kfu", "izHkko", "jkf'k", "Hkkx", "lw;Z",
];

const KRUTI_TO_UNICODE_MAP = [
  // Multi-character compounds and words (longest first!)
  { kd: "xq#", uni: "गुरु" },
  { kd: "xzg", uni: "ग्रह" },
  { kd: "izHkko", uni: "प्रभाव" },
  { kd: "iz", uni: "प्र" },
  { kd: "D;", uni: "क्क" },
  { kd: "D=", uni: "क्त" },
  { kd: "dZ", uni: "र्क" },
  { kd: "AA", uni: "॥" },
  { kd: "=\"k", uni: "त्र" },
  { kd: "J", uni: "श्र" },
  { kd: "K", uni: "ज्ञ" },
  { kd: "N", uni: "छ" },

  // Standalone multi-character vowels
  { kd: "vkS", uni: "औ" },
  { kd: "vks", uni: "ओ" },
  { kd: "vk", uni: "आ" },
  { kd: "bZ", uni: "ई" },
  { kd: ",s", uni: "ऐ" },

  // Matras with 'k' prefix
  { kd: "kS", uni: "ौ" },
  { kd: "ks", uni: "ो" },

  // Consonants with 'k' suffix
  { kd: "[k", uni: "ख" },
  { kd: "?k", uni: "घ" },
  { kd: ".k", uni: "ण" },
  { kd: "Fk", uni: "थ" },
  { kd: "/k", uni: "ध" },
  { kd: "Hk", uni: "भ" },
  { kd: "'k", uni: "श" },
  { kd: "\"k", uni: "ष" },
  { kd: "{k", uni: "क्ष" },

  // Halanta consonants
  { kd: "[T", uni: "ख्" },
  { kd: "[", uni: "ख्" },
  { kd: "D", uni: "क्" },
  { kd: "X", uni: "ग्" },
  { kd: "?", uni: "घ्" },
  { kd: "P", uni: "च्" },
  { kd: "T", uni: "ज्" },
  { kd: ".", uni: "ण्" },
  { kd: "R", uni: "त्" },
  { kd: "F", uni: "थ्" },
  { kd: "/", uni: "ध्" },
  { kd: "U", uni: "न्" },
  { kd: "I", uni: "प्" },
  { kd: "C", uni: "ब्" },
  { kd: "H", uni: "भ्" },
  { kd: "E", uni: "म्" },
  { kd: "Y", uni: "ल्" },
  { kd: "O", uni: "व्" },
  { kd: "'", uni: "श्" },
  { kd: "\"", uni: "ष्" },
  { kd: "L", uni: "स्" },
  { kd: "{", uni: "क्ष्" },

  // Nukta consonants
  { kd: "M+", uni: "ड़" },
  { kd: "<+", uni: "ढ़" },
  { kd: "Q+", uni: "फ़" },
  { kd: "d+", uni: "क़" },
  { kd: "[k+", uni: "ख़" },
  { kd: "x+", uni: "ग़" },
  { kd: "t+", uni: "ज़" },

  // Single matras
  { kd: "S", uni: "ै" },
  { kd: "s", uni: "े" },
  { kd: "k", uni: "ा" },
  { kd: "h", uni: "ी" },
  { kd: "q", uni: "ु" },
  { kd: "w", uni: "ू" },
  { kd: "`", uni: "ृ" },
  { kd: "a", uni: "ं" },
  { kd: "%", uni: "ः" },
  { kd: "W", uni: "ँ" },
  { kd: "¡", uni: "ँ" },
  { kd: "A", uni: "।" },

  // Special characters & ra-kars
  { kd: "Z", uni: "र्" },
  { kd: "z", uni: "्र" },
  { kd: "~", uni: "्" },

  // Single consonants
  { kd: "d", uni: "क" },
  { kd: "x", uni: "ग" },
  { kd: "p", uni: "च" },
  { kd: "t", uni: "ज" },
  { kd: ">", uni: "झ" },
  { kd: "¥", uni: "ञ" },
  { kd: "V", uni: "ट" },
  { kd: "B", uni: "ठ" },
  { kd: "M", uni: "ड" },
  { kd: "<", uni: "ढ" },
  { kd: "r", uni: "त" },
  { kd: "n", uni: "द" },
  { kd: "u", uni: "न" },
  { kd: "i", uni: "प" },
  { kd: "Q", uni: "फ" },
  { kd: "c", uni: "ब" },
  { kd: "e", uni: "म" },
  { kd: ";", uni: "य" },
  { kd: "j", uni: "र" },
  { kd: "y", uni: "ल" },
  { kd: "o", uni: "व" },
  { kd: "l", uni: "स" },
  { kd: "g", uni: "ह" },

  // Single vowels
  { kd: "v", uni: "अ" },
  { kd: "b", uni: "इ" },
  { kd: "m", uni: "उ" },
  { kd: "Å", uni: "ऊ" },
  { kd: ",", uni: "ए" },

  // Numbers
  { kd: "0", uni: "०" },
  { kd: "1", uni: "१" },
  { kd: "2", uni: "२" },
  { kd: "3", uni: "३" },
  { kd: "4", uni: "४" },
  { kd: "5", uni: "५" },
  { kd: "6", uni: "६" },
  { kd: "7", uni: "७" },
  { kd: "8", uni: "८" },
  { kd: "9", uni: "९" },
];

/**
 * Converts Kruti Dev 010 encoded string to Unicode Devanagari.
 * 
 * @param {string} text 
 * @returns {string}
 */
export function convertKrutiDevToUnicode(text) {
  if (!text || typeof text !== "string") return "";

  let modified = text;

  // Handle 'f' (choti-i matra): in Kruti Dev it is typed BEFORE the consonant,
  // but in Unicode it goes AFTER the consonant.
  modified = modified.replace(/f([a-zA-Z\?\[\.\/\"\'{]+)/g, "$1f");

  // Replace each mapped token in order of length
  for (const item of KRUTI_TO_UNICODE_MAP) {
    if (item.kd === "f") continue;
    modified = modified.split(item.kd).join(item.uni);
  }

  // Replace 'f' with 'ि' (choti-i matra)
  modified = modified.split("f").join("ि");

  // Reph (Z) positioning fix: convert 'र्' before consonant
  modified = modified.replace(/([क-ह])(्[क-ह])?र्/g, "र्$1$2");

  return modified.normalize("NFC");
}

/**
 * Checks if a string appears to be encoded in Kruti Dev 010 font.
 * 
 * @param {string} text 
 * @returns {{ isKrutiDev: boolean, confidence: number }}
 */
export function detectKrutiDevEncoding(text) {
  if (!text || text.length < 15) {
    return { isKrutiDev: false, confidence: 0 };
  }

  const words = text.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return { isKrutiDev: false, confidence: 0 };

  const krutiDevRegex = new RegExp(`\\b(?:${KRUTI_DEV_KEYWORDS.join("|")})\\b`, "g");
  const krutiDevWordMatches = text.match(krutiDevRegex) || [];
  const matchRatio = krutiDevWordMatches.length / Math.max(1, words.length);

  const englishWordMatches =
    text.match(/\b(?:the|and|is|in|to|of|that|it|for|on|with|as|this|was|at|by|from|or|an)\b/gi) || [];
  const englishRatio = englishWordMatches.length / Math.max(1, words.length);

  const isKrutiDev =
    (krutiDevWordMatches.length >= 2 && englishRatio < 0.05) ||
    (matchRatio > 0.08 && englishRatio < 0.05);

  const confidence = isKrutiDev ? Math.min(0.98, Math.max(0.65, matchRatio * 4)) : 0;

  return {
    isKrutiDev,
    confidence: Math.round(confidence * 100) / 100,
  };
}

// ============================================================================
// 2. Chanakya & Walkman-Chanakya Legacy DTP Font Mapping & Signatures
// ============================================================================
const CHANAKYA_KEYWORDS = [
  "à", "ò", "ù", "ñ", "Ø", "æ", "ç", "é", "ë", "ì", "î", "ï", "ð", "ñ",
  "ò", "ó", "ô", "õ", "ö", "÷", "ø", "ù", "ú", "û", "ü", "ý", "þ", "ÿ",
];

const CHANAKYA_TO_UNICODE_MAP = [
  // Multi-character compounds
  { ch: "¬", uni: "अ" },
  { ch: "A", uni: "आ" },
  { ch: "§", uni: "ई" },
  { ch: "C", uni: "उ" },
  { ch: "E", uni: "ए" },
  { ch: "G", uni: "ऐ" },
  { ch: "I", uni: "ओ" },
  { ch: "K", uni: "औ" },
  { ch: "Ø", uni: "क्ष्" },
  { ch: "Ù", uni: "ज्ञ" },
  { ch: "˜", uni: "त्र" },
  { ch: "Í", uni: "र्" },
  { ch: "ñ", uni: "त्" },
  { ch: "ò", uni: "ो" },
  { ch: "ó", uni: "ौ" },
  { ch: "à", uni: "ा" },
  { ch: "á", uni: "ि" },
  { ch: "â", uni: "ी" },
  { ch: "ã", uni: "ु" },
  { ch: "ä", uni: "ू" },
  { ch: "å", uni: "ृ" },
  { ch: "æ", uni: "े" },
  { ch: "ç", uni: "ै" },
  { ch: "è", uni: "ं" },
  { ch: "é", uni: "ः" },
  { ch: "ê", uni: "ँ" },
  { ch: "ë", uni: "्" },
  { ch: "Ú", uni: "।" },
  { ch: "Û", uni: "॥" },
  { ch: "®", uni: "रु" },
  { ch: "¯", uni: "रू" },

  // Base Consonants
  { ch: "d", uni: "क" },
  { ch: "e", uni: "ख" },
  { ch: "f", uni: "ग" },
  { ch: "g", uni: "घ" },
  { ch: "h", uni: "ङ" },
  { ch: "i", uni: "च" },
  { ch: "j", uni: "छ" },
  { ch: "k", uni: "ज" },
  { ch: "l", uni: "झ" },
  { ch: "m", uni: "ञ" },
  { ch: "n", uni: "ट" },
  { ch: "o", uni: "ठ" },
  { ch: "p", uni: "ड" },
  { ch: "q", uni: "ढ" },
  { ch: "r", uni: "ण" },
  { ch: "s", uni: "त" },
  { ch: "t", uni: "थ" },
  { ch: "u", uni: "द" },
  { ch: "v", uni: "ध" },
  { ch: "w", uni: "न" },
  { ch: "x", uni: "प" },
  { ch: "y", uni: "फ" },
  { ch: "z", uni: "ब" },
  { ch: "{", uni: "भ" },
  { ch: "|", uni: "म" },
  { ch: "}", uni: "य" },
  { ch: "~", uni: "र" },
  { ch: "", uni: "ल" },
  { ch: "", uni: "व" },
  { ch: "", uni: "श" },
  { ch: "", uni: "ष" },
  { ch: "", uni: "स" },
  { ch: "", uni: "ह" },
];

/**
 * Converts Chanakya / Walkman-Chanakya encoded text to Unicode Devanagari.
 * 
 * @param {string} text
 * @returns {string}
 */
export function convertChanakyaToUnicode(text) {
  if (!text || typeof text !== "string") return "";

  let modified = text;

  // Reposition pre-matra 'á' (choti-i)
  modified = modified.replace(/á([a-zA-Z\u0080-\u00FF]+)/g, "$1á");

  for (const item of CHANAKYA_TO_UNICODE_MAP) {
    if (item.ch === "á") continue;
    modified = modified.split(item.ch).join(item.uni);
  }

  modified = modified.split("á").join("ि");

  return modified.normalize("NFC");
}

/**
 * Detects if a string is encoded in Chanakya font.
 * 
 * @param {string} text
 * @returns {{ isChanakya: boolean, confidence: number }}
 */
export function detectChanakyaEncoding(text) {
  if (!text || text.length < 15) {
    return { isChanakya: false, confidence: 0 };
  }

  const highAsciiMatches = text.match(/[\u00A0-\u00FF]/g) || [];
  const highAsciiRatio = highAsciiMatches.length / text.length;

  const chanakyaCharMatches = text.match(/[àòùñØæçéëÚÛ]/g) || [];
  const chanakyaRatio = chanakyaCharMatches.length / text.length;

  const isChanakya = chanakyaCharMatches.length >= 3 || (chanakyaRatio > 0.05 && highAsciiRatio > 0.08);
  const confidence = isChanakya ? Math.min(0.96, Math.max(0.60, chanakyaRatio * 6)) : 0;

  return {
    isChanakya,
    confidence: Math.round(confidence * 100) / 100,
  };
}

// ============================================================================
// 3. Multi-Heuristic Text Layer Analyzer
// ============================================================================

/**
 * Analyzes a page's selectable text layer for corruption, encoding issues, and readability.
 * 
 * @param {string} rawText - Selectable text extracted from PDF page
 * @param {Object} options - Language and script context
 * @param {string} options.language - Book language (e.g. Hindi, Sanskrit, English)
 * @param {string} options.script - Target script (e.g. Devanagari)
 * @param {number} [options.imageCount=0] - Number of embedded raster images on page
 * @returns {{
 *   hasUsableText: boolean,
 *   classification: 'DIGITAL' | 'SCANNED' | 'CORRUPTED' | 'MIXED',
 *   ocrTriggerReason: string | null,
 *   isLegacyFont: boolean,
 *   detectedFont: string | null,
 *   metrics: {
 *     textLength: number,
 *     replacementCharCount: number,
 *     puaCharCount: number,
 *     devanagariRatio: number,
 *     asciiRatio: number,
 *     controlCharRatio: number,
 *     confidenceScore: number
 *   },
 *   convertedText: string | null
 * }}
 */
export function analyzeTextLayer(rawText, options = {}) {
  const text = typeof rawText === "string" ? rawText.trim() : "";
  const textLength = text.length;
  const imageCount = options.imageCount || 0;

  const targetLang = String(options.language || "").toLowerCase();
  const isIndicExpected =
    targetLang === "hi" ||
    targetLang === "hindi" ||
    targetLang === "sa" ||
    targetLang === "sanskrit" ||
    options.script === "Devanagari";

  // 1. Empty or virtually empty text layer -> Scanned page
  if (textLength < 15) {
    return {
      hasUsableText: false,
      classification: "SCANNED",
      ocrTriggerReason: "EMPTY_OR_MINIMAL_TEXT_LAYER",
      isLegacyFont: false,
      detectedFont: null,
      metrics: {
        textLength,
        replacementCharCount: 0,
        puaCharCount: 0,
        devanagariRatio: 0,
        asciiRatio: 0,
        controlCharRatio: 0,
        confidenceScore: 0,
      },
      convertedText: null,
    };
  }

  // 2. Count character distributions
  const replacementCharCount = (text.match(/\uFFFD/g) || []).length;
  const puaCharCount = (text.match(/[\uE000-\uF8FF]/g) || []).length;
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const asciiAlphaCount = (text.match(/[a-zA-Z]/g) || []).length;
  const controlCharCount = (text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g) || []).length;

  const devanagariRatio = Math.round((devanagariCount / textLength) * 100) / 100;
  const asciiRatio = Math.round((asciiAlphaCount / textLength) * 100) / 100;
  const controlCharRatio = Math.round((controlCharCount / textLength) * 100) / 100;

  // 3. Replacement characters (\uFFFD) indicating corrupted decoding or missing fonts
  if (replacementCharCount > 3 || replacementCharCount / textLength > 0.04) {
    return {
      hasUsableText: false,
      classification: "CORRUPTED",
      ocrTriggerReason: "CORRUPTED_REPLACEMENT_CHARACTERS",
      isLegacyFont: false,
      detectedFont: null,
      metrics: {
        textLength,
        replacementCharCount,
        puaCharCount,
        devanagariRatio,
        asciiRatio,
        controlCharRatio,
        confidenceScore: 0.1,
      },
      convertedText: null,
    };
  }

  // 4. Private Use Area (PUA) characters indicating legacy proprietary font mapping
  if (puaCharCount > 5 || puaCharCount / textLength > 0.08) {
    return {
      hasUsableText: false,
      classification: "CORRUPTED",
      ocrTriggerReason: "LEGACY_FONT_PRIVATE_USE_AREA_ENCODING",
      isLegacyFont: true,
      detectedFont: "CustomPUA",
      metrics: {
        textLength,
        replacementCharCount,
        puaCharCount,
        devanagariRatio,
        asciiRatio,
        controlCharRatio,
        confidenceScore: 0.2,
      },
      convertedText: null,
    };
  }

  // 5. Detect Kruti Dev 010 legacy encoding
  const krutiCheck = detectKrutiDevEncoding(text);
  if (krutiCheck.isKrutiDev && krutiCheck.confidence >= 0.65) {
    const converted = convertKrutiDevToUnicode(text);
    const convertedDevanagariCount = (converted.match(/[\u0900-\u097F]/g) || []).length;
    const isSuccessfulConversion = convertedDevanagariCount / Math.max(1, converted.length) > 0.40;

    return {
      hasUsableText: isSuccessfulConversion,
      classification: isSuccessfulConversion ? "DIGITAL" : "CORRUPTED",
      ocrTriggerReason: isSuccessfulConversion ? null : "LEGACY_FONT_KRUTI_DEV_UNVERIFIED",
      isLegacyFont: true,
      detectedFont: "KrutiDev010",
      metrics: {
        textLength,
        replacementCharCount,
        puaCharCount,
        devanagariRatio,
        asciiRatio,
        controlCharRatio,
        confidenceScore: krutiCheck.confidence,
      },
      convertedText: isSuccessfulConversion ? converted : null,
    };
  }

  // 6. Detect Chanakya / Walkman-Chanakya legacy encoding
  const chanakyaCheck = detectChanakyaEncoding(text);
  if (chanakyaCheck.isChanakya && chanakyaCheck.confidence >= 0.60) {
    const converted = convertChanakyaToUnicode(text);
    const convertedDevanagariCount = (converted.match(/[\u0900-\u097F]/g) || []).length;
    const isSuccessfulConversion = convertedDevanagariCount / Math.max(1, converted.length) > 0.35;

    return {
      hasUsableText: isSuccessfulConversion,
      classification: isSuccessfulConversion ? "DIGITAL" : "CORRUPTED",
      ocrTriggerReason: isSuccessfulConversion ? null : "LEGACY_DTP_FONT_CHANAKYA_UNVERIFIED",
      isLegacyFont: true,
      detectedFont: "Chanakya",
      metrics: {
        textLength,
        replacementCharCount,
        puaCharCount,
        devanagariRatio,
        asciiRatio,
        controlCharRatio,
        confidenceScore: chanakyaCheck.confidence,
      },
      convertedText: isSuccessfulConversion ? converted : null,
    };
  }

  // 7. Expected Indic/Sanskrit text but got Latin characters (unmapped font or 8-bit glyph mojibake)
  if (isIndicExpected && textLength > 30 && devanagariRatio < 0.18) {
    return {
      hasUsableText: false,
      classification: "CORRUPTED",
      ocrTriggerReason: "INDIC_TEXT_UNREADABLE_LOW_DEVANAGARI_RATIO",
      isLegacyFont: true,
      detectedFont: "UnmappedIndic",
      metrics: {
        textLength,
        replacementCharCount,
        puaCharCount,
        devanagariRatio,
        asciiRatio,
        controlCharRatio,
        confidenceScore: 0.15,
      },
      convertedText: null,
    };
  }

  // 8. Detect corrupted legacy Devanagari font glyph sequences (legacy DTP / Pagemaker mis-mappings)
  const legacyAnomalyCount = (text.match(/\u0929/g) || []).length + (text.match(/\u093A/g) || []).length;
  const hasLegacyKeywords = /(?:^|\s|[।॥,])(?:औय|शयीय|ककसी|ददव्म|सबी|शडि|अयॊडी|वनस्ऩनत|ऩौवष्टक)(?:[\s।॥,]|$)/.test(text);

  if (isIndicExpected && textLength > 30 && (legacyAnomalyCount > 3 || hasLegacyKeywords)) {
    return {
      hasUsableText: false,
      classification: "CORRUPTED",
      ocrTriggerReason: "LEGACY_DEVANAGARI_FONT_MISMAPPING_DETECTED",
      isLegacyFont: true,
      detectedFont: "CorruptedDTPFont",
      metrics: {
        textLength,
        replacementCharCount,
        puaCharCount,
        devanagariRatio,
        asciiRatio,
        controlCharRatio,
        confidenceScore: 0.25,
      },
      convertedText: null,
    };
  }

  // 9. Excessive control characters or garbled byte sequences
  if (controlCharRatio > 0.08) {
    return {
      hasUsableText: false,
      classification: "CORRUPTED",
      ocrTriggerReason: "EXCESSIVE_CONTROL_CHARACTERS",
      isLegacyFont: false,
      detectedFont: null,
      metrics: {
        textLength,
        replacementCharCount,
        puaCharCount,
        devanagariRatio,
        asciiRatio,
        controlCharRatio,
        confidenceScore: 0.2,
      },
      convertedText: null,
    };
  }

  // 10. Clean, Reliable Digital Text Layer (Skip OCR, save processing time)
  return {
    hasUsableText: true,
    classification: imageCount > 0 ? "MIXED" : "DIGITAL",
    ocrTriggerReason: null,
    isLegacyFont: false,
    detectedFont: null,
    metrics: {
      textLength,
      replacementCharCount,
      puaCharCount,
      devanagariRatio,
      asciiRatio,
      controlCharRatio,
      confidenceScore: 0.98,
    },
    convertedText: null,
  };
}
