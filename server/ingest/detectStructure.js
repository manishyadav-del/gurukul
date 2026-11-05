/**
 * Deterministic structure detection for astrology manuscripts and books.
 * Identifies Chapters, Headings, Verses (Shlokas), Paragraphs, Footnotes, Headers, and Footers.
 */

const CHAPTER_PATTERNS = [
  /^(?:chapter|chap\.?)\s+([0-9ivxlcdm]+|[a-z]+)[\s:.-]*(.*)$/i,
  /^(?:अध्याय|प्रकरण|खण्ड|सर्ग|उल्लास)\s*([०-९\d]+|[a-z\u0900-\u097f]+)?[\s:.-]*(.*)$/i,
  /^(?:प्रथम|द्वितीय|तृतीय|चतुर्थ|पंचम|षष्ठ|सप्तम|अष्टम|नवम|दशम|एकादश|द्वादश)\s+(?:अध्याय|प्रकरण)[\s:.-]*(.*)$/i,
];

const VERSE_PATTERNS = [
  /॥/, // Contains double danda ॥
  /।\s*[०-९\d]*\s*।/,
  /(?:श्लोक|मन्त्र|सूत्र)\s*[०-९\d]*/i,
];

const FOOTNOTE_PATTERNS = [
  /^[\*†‡]\s+/,
  /^\[\d+\]\s+/,
  /^\(\d+\)\s+/,
  /^[¹²³⁴⁵⁶⁷⁸⁹]\s+/,
];

/**
 * Detect structural type for a single text line or block.
 */
export function classifyTextBlock(text) {
  const trimmed = text.trim();
  if (!trimmed) return { type: "EMPTY" };

  // Check Footnote
  for (const pattern of FOOTNOTE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { type: "FOOTNOTE", text: trimmed };
    }
  }

  // Check Chapter
  for (const pattern of CHAPTER_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match) {
      return {
        type: "CHAPTER",
        title: trimmed,
        chapterIdentifier: match[1] ? match[1].trim() : null,
        chapterTitle: match[2] ? match[2].trim() : trimmed,
      };
    }
  }

  // Check Verse / Shloka
  for (const pattern of VERSE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { type: "VERSE", text: trimmed };
    }
  }

  // Check Heading (short line, no final sentence punctuation)
  if (
    trimmed.length < 80 &&
    !trimmed.includes("\n") &&
    !/[.!?।॥]$/.test(trimmed) &&
    (trimmed === trimmed.toUpperCase() || /^[A-Z\u0900-\u097F]/.test(trimmed))
  ) {
    return { type: "HEADING", text: trimmed };
  }

  return { type: "PARAGRAPH", text: trimmed };
}

/**
 * Analyze an entire page's text into structural components.
 * 
 * @param {string} pageText - Cleaned text of the page
 * @param {number} pageNumber - Page number
 * @returns {{
 *   chapters: Array<{ title: string, chapterNumber: number, pageNumber: number }>,
 *   sections: Array<{ type: string, text: string, pageNumber: number }>
 * }}
 */
export function detectPageStructure(pageText, pageNumber = 1) {
  if (!pageText || typeof pageText !== "string") {
    return { chapters: [], sections: [] };
  }

  // Split into lines first, then group
  const rawLines = pageText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const sections = [];
  const chapters = [];

  for (const line of rawLines) {
    const classification = classifyTextBlock(line);

    if (classification.type === "CHAPTER") {
      chapters.push({
        title: classification.chapterTitle || classification.title,
        fullHeading: classification.title,
        chapterIdentifier: classification.chapterIdentifier,
        pageNumber,
      });
    }

    sections.push({
      ...classification,
      pageNumber,
    });
  }

  return {
    chapters,
    sections,
  };
}
