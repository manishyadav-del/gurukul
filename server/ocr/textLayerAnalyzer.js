/**
 * Text Layer & Corrupted Text Analyzer
 * 
 * Inspects PDF selectable text layers before OCR to decide whether:
 * 1. The page has clean, readable digital text that can be extracted directly.
 * 2. The page is a scan with no text layer (requires OCR).
 * 3. The page has a corrupted text layer (replacement chars, mojibake, Kruti Dev) requiring OCR or font conversion.
 * 4. The page has an unusable or gibberish text layer.
 * 
 * JavaScript only.
 */

// Common Kruti Dev 010 specific character patterns & words that do not occur in normal English
const KRUTI_DEV_PATTERNS = [
  /\b[A-Za-z0-9]+\b/g,
  /\b(?:esa|gS|Fkk|dk|dh|ds|dks|fn;k|fd;k|ugha|rkfd|Hkh|vkSj|gksrk|Fks|gSa|le;)\b/,
  /(?:[dD][kK]|[xX][kK]|[pP][kK]|[tT][kK]|[bB][kK]|[eE][kK]|[yY][kK])/
];

/**
 * Kruti Dev 010 to Unicode Devanagari Character Mapping
 * Ordered strictly from LONGEST sequences to SHORTEST to prevent substring collision!
 */
const KRUTI_TO_UNICODE_MAP = [
  // Multi-character compounds and words
  { kd: "xq#", uni: "गुरु" },
  { kd: "xzg", uni: "ग्रह" },
  { kd: "iz", uni: "प्र" },
  { kd: "D;", uni: "क्क" },
  { kd: "D=", uni: "क्त" },
  { kd: "dZ", uni: "र्क" },
  { kd: "AA", uni: "॥" },
  { kd: "=\"k", uni: "त्र" },

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

  // Special characters
  { kd: "Z", uni: "र्" },
  { kd: "z", uni: "्र" },

  // Single consonants
  { kd: "d", uni: "क" },
  { kd: "x", uni: "ग" },
  { kd: "p", uni: "च" },
  { kd: "N", uni: "छ" },
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
  { kd: "K", uni: "ज्ञ" },

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
  // Match 'f' followed by one or more consonant characters (e.g. fu -> uf -> नि)
  modified = modified.replace(/f([a-zA-Z\?\[\.\/\"\'{]+)/g, "$1f");

  // Replace each mapped token in order of length
  for (const item of KRUTI_TO_UNICODE_MAP) {
    if (item.kd === "f") continue;
    modified = modified.split(item.kd).join(item.uni);
  }

  // Finally replace 'f' with 'ि' (choti-i matra)
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

  const words = text.split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return { isKrutiDev: false, confidence: 0 };

  const krutiDevWordMatches = text.match(/\b(?:esa|gS|Fkk|dk|dh|ds|dks|fn;k|fd;k|ugha|rkfd|Hkh|vkSj|gksrk|Fks|gSa|le;|;g|og|rFkk|tc|rc|xq#|xzg|'kfu|izHkko)\b/g) || [];
  const matchRatio = krutiDevWordMatches.length / Math.max(1, words.length);

  const englishWordMatches = text.match(/\b(?:the|and|is|in|to|of|that|it|for|on|with|as|this|was|at|by)\b/gi) || [];
  const englishRatio = englishWordMatches.length / Math.max(1, words.length);

  const isKrutiDev = (krutiDevWordMatches.length >= 2 && englishRatio < 0.05) || (matchRatio > 0.10 && englishRatio < 0.05);
  const confidence = isKrutiDev ? Math.min(0.98, Math.max(0.65, matchRatio * 4)) : 0;

  return {
    isKrutiDev,
    confidence: Math.round(confidence * 100) / 100,
  };
}

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
 *   classification: 'DIGITAL' | 'SCANNED' | 'CORRUPTED',
 *   ocrTriggerReason: string | null,
 *   isLegacyFont: boolean,
 *   detectedFont: string | null,
 *   metrics: {
 *     textLength: number,
 *     replacementCharCount: number,
 *     puaCharCount: number,
 *     devanagariRatio: number,
 *     asciiRatio: number,
 *     controlCharRatio: number
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

  // 1. Empty or virtually empty text layer
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
      },
      convertedText: null,
    };
  }

  // 2. Count special character categories
  const replacementCharCount = (text.match(/\uFFFD/g) || []).length;
  const puaCharCount = (text.match(/[\uE000-\uF8FF]/g) || []).length;
  const devanagariCount = (text.match(/[\u0900-\u097F]/g) || []).length;
  const asciiAlphaCount = (text.match(/[a-zA-Z]/g) || []).length;
  const controlCharCount = (text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g) || []).length;

  const devanagariRatio = Math.round((devanagariCount / textLength) * 100) / 100;
  const asciiRatio = Math.round((asciiAlphaCount / textLength) * 100) / 100;
  const controlCharRatio = Math.round((controlCharCount / textLength) * 100) / 100;

  // 3. Replacement characters (Unicode \uFFFD) indicating bad encoding / missing font table
  if (replacementCharCount > 3 || (replacementCharCount / textLength > 0.04)) {
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
      },
      convertedText: null,
    };
  }

  // 4. Private Use Area (PUA) characters indicating proprietary legacy Indic font mappings
  if (puaCharCount > 5 || (puaCharCount / textLength > 0.08)) {
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
      },
      convertedText: isSuccessfulConversion ? converted : null,
    };
  }

  // 6. Expected Devanagari but got Latin characters (unsupported font or 8-bit glyph mojibake)
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
      },
      convertedText: null,
    };
  }

  // 6b. Detect corrupted legacy Devanagari font glyph sequences (legacy DTP / Pagemaker mis-mappings)
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
      },
      convertedText: null,
    };
  }

  // 7. Excessive control characters or garbled bytes
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
      },
      convertedText: null,
    };
  }

  // 8. Text is usable digital text
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
    },
    convertedText: null,
  };
}
