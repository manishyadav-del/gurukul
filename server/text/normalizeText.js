/**
 * Phase 3: Text Processing and Normalization Service
 * 
 * Responsibilities:
 * - Preserves original raw text completely unchanged.
 * - Performs Unicode NFC normalization (essential for Devanagari conjuncts & matras).
 * - Conservative cleanup of non-printable control characters.
 * - Conservative hyphenation unwrapping strictly for ASCII/English words across line breaks.
 * - Strictly preserves Devanagari characters, Sanskrit diacritics, accents, and dandas (।, ॥).
 * - Preserves verse numbering patterns (e.g. ॥ १ ॥, [१], १., 1.).
 * - Conservative line joining: merges wrapped prose lines without breaking verses, headings, or lists.
 * - Never silently rewrites, paraphrases, or invents book content.
 */

/**
 * Checks if a line is a verse line or contains Sanskrit verse terminators.
 */
export function isVerseLine(line) {
  if (!line) return false;
  const trimmed = line.trim();
  // Contains double danda ॥ or single danda । with verse context
  if (/॥/.test(trimmed)) return true;
  if (/।\s*[०-९\d]*\s*।?$/.test(trimmed)) return true;
  if (/^(?:श्लोक|मन्त्र|सूक्त|ऋचा|कारिका)\s*[०-९\d]*/i.test(trimmed)) return true;
  return false;
}

/**
 * Checks if a line is a structural heading or chapter marker.
 */
export function isHeadingOrChapterLine(line) {
  if (!line) return false;
  const trimmed = line.trim();
  if (trimmed.length === 0 || trimmed.length > 90) return false;

  // Chapter patterns
  if (/^(?:chapter|chap\.?|part|section|book)\s+([0-9ivxlcdm]+|[a-z]+)/i.test(trimmed)) return true;
  if (/^(?:अध्याय|प्रकरण|खण्ड|काण्ड|सर्ग|उल्लास)\s*([०-९\d]+|[a-z\u0900-\u097f]+)?/i.test(trimmed)) return true;
  if (/^(?:प्रथम|द्वितीय|तृतीय|चतुर्थ|पंचम|षष्ठ|सप्तम|अष्टम|नवम|दशम|एकादश|द्वादश)\s+(?:अध्याय|प्रकरण)/i.test(trimmed)) return true;
  if (/^॥\s*अथ\s+.*?॥$/.test(trimmed)) return true;

  // Standalone heading (short, no ending terminal punctuation, starts with capital or Devanagari)
  if (!/[.!?।॥:]$/.test(trimmed) && trimmed.length < 70) {
    if (trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) return true;
    if (/^[A-Z\u0900-\u097F]/.test(trimmed) && !trimmed.includes(",")) return true;
  }

  return false;
}

/**
 * Checks if a line starts with a list or numbering marker.
 */
export function isListMarkerLine(line) {
  if (!line) return false;
  const trimmed = line.trim();
  return /^(?:[०-९\d]+[\.\)]|\([०-९\d]+\)|\[[०-९\d]+\]|[a-z]\)|\([a-z]\)|[\*\-•])\s+/i.test(trimmed);
}

/**
 * Normalizes text extracted from digital PDFs or OCR scans conservatively.
 * 
 * @param {string} rawText - Unmodified extracted text
 * @param {Object} [options] - Normalization options
 * @param {string[]} [options.removeLines] - Known repeated headers/footers to strip
 * @returns {string} Normalized text
 */
export function normalizeText(rawText, options = {}) {
  if (!rawText || typeof rawText !== "string") {
    return "";
  }

  // 1. Unicode NFC Normalization (canonical composition preserves combining marks and matras)
  let text = rawText.normalize("NFC");

  // 2. Remove control characters (preserve standard whitespace: \n, \r, \t)
  text = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 3. Normalize newline sequences
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // 4. Conservative English word-hyphenation unwrapping at line-breaks
  // e.g., "astro-\nlogy" -> "astrology"
  // NOTE: Strictly ASCII letters [a-zA-Z] to prevent stripping Devanagari compound hyphens
  text = text.replace(/([a-zA-Z]{2,})-\n\s*([a-zA-Z]{2,})/g, "$1$2");

  // 5. Split into lines for conservative line-level cleanup
  const rawLines = text.split("\n");
  const filteredLines = [];

  const linesToRemove = new Set(
    (options.removeLines || []).map((l) => l.trim().toLowerCase())
  );

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const trimmed = rawLine.trim();

    // Check if matching evidence-based header or footer removal list
    if (trimmed && linesToRemove.has(trimmed.toLowerCase())) {
      continue;
    }

    // Collapse multiple inline spaces and tabs into a single space
    const cleanedLine = trimmed.replace(/[ \t]+/g, " ");
    filteredLines.push(cleanedLine);
  }

  // 6. Conservative paragraph and line assembly
  // Group into logical blocks:
  // - Blank lines separate paragraphs
  // - Verses preserve their distinct internal lines
  // - Headings remain isolated on their own lines
  // - Prose sentences split across wrapped lines within a paragraph are joined with a single space
  const paragraphs = [];
  let currentParaLines = [];
  let currentIsVerse = false;

  function flushParagraph() {
    if (currentParaLines.length === 0) return;

    if (currentIsVerse) {
      // Preserve individual verse lines intact
      paragraphs.push(currentParaLines.join("\n"));
    } else {
      // Conservative prose line joining:
      // Join lines with space if previous line doesn't end with sentence terminator
      let joined = "";
      for (let j = 0; j < currentParaLines.length; j++) {
        const line = currentParaLines[j];
        if (j === 0) {
          joined = line;
        } else {
          const prev = currentParaLines[j - 1];
          // If previous line ends with sentence terminator, preserve newline; otherwise join with space
          if (/[.!?।॥:]$/.test(prev)) {
            joined += "\n" + line;
          } else {
            joined += " " + line;
          }
        }
      }
      paragraphs.push(joined.trim());
    }

    currentParaLines = [];
    currentIsVerse = false;
  }

  for (let i = 0; i < filteredLines.length; i++) {
    const line = filteredLines[i];

    if (!line) {
      // Blank line: paragraph boundary
      flushParagraph();
      continue;
    }

    const isVerse = isVerseLine(line);
    const isHeading = isHeadingOrChapterLine(line);
    const isList = isListMarkerLine(line);

    // If this line is a heading or list marker, start a fresh block
    if (isHeading) {
      flushParagraph();
      paragraphs.push(line);
      continue;
    }

    if (isList) {
      flushParagraph();
      currentParaLines.push(line);
      continue;
    }

    if (isVerse) {
      if (!currentIsVerse && currentParaLines.length > 0) {
        flushParagraph();
      }
      currentIsVerse = true;
      currentParaLines.push(line);
      continue;
    }

    // Regular prose line
    if (currentIsVerse && currentParaLines.length > 0) {
      flushParagraph();
    }
    currentParaLines.push(line);
  }

  flushParagraph();

  return paragraphs.join("\n\n").trim();
}
