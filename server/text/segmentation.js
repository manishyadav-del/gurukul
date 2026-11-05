/**
 * Phase 3: Chapter and Passage Segmentation Service
 * 
 * Supports:
 * - English, Hindi, and Sanskrit manuscripts & typeset books.
 * - Detects Chapter Titles, Headings, Subheadings, Verses (Shlokas), Paragraphs, Footnotes.
 * - Multi-page chapter spanning (startPage to endPage).
 * - Multi-page passage spanning & reading order preservation.
 * - Quality/confidence scoring and review flagging for uncertain boundaries.
 */

import { isVerseLine, isListMarkerLine } from "./normalizeText.js";

const ENGLISH_CHAPTER_REGEX = /^(?:chapter|chap\.?|part|book|section)\s+([0-9ivxlcdm]+|[a-z]+)[\s:.-]*(.*)$/i;
const HINDI_CHAPTER_REGEX = /^(?:अध्याय|प्रकरण|खण्ड|काण्ड|सर्ग|उल्लास)\s*([०-९\d]+|[a-z\u0900-\u097f]+)?[\s:.-]*(.*)$/i;
const HINDI_ORDINAL_CHAPTER_REGEX = /^(?:प्रथम|द्वितीय|तृतीय|चतुर्थ|पंचम|षष्ठ|सप्तम|अष्टम|नवम|दशम|एकादश|द्वादश)\s+(?:अध्याय|प्रकरण)[\s:.-]*(.*)$/i;
const SANSKRIT_CHAPTER_START_REGEX = /^॥\s*अथ\s+([^॥]+?)\s*॥$/i;
const SANSKRIT_CHAPTER_COLOPHON_REGEX = /^(?:॥\s*)?इति\s+.*?ऽध्यायः.*?(?:॥)?$/i;

/**
 * Classifies whether a text block represents a chapter title.
 * 
 * @param {string} text - Block text
 * @returns {{ isChapter: boolean, title: string, chapterIdentifier?: string, confidence: number }}
 */
export function detectChapterTitle(text) {
  if (!text || typeof text !== "string") {
    return { isChapter: false, title: "", confidence: 0 };
  }

  const trimmed = text.trim();
  if (trimmed.length === 0 || trimmed.length > 120) {
    return { isChapter: false, title: "", confidence: 0 };
  }

  // 1. Sanskrit chapter introduction: e.g. ॥ अथ प्रथमोऽध्यायः ॥
  const sanMatch = trimmed.match(SANSKRIT_CHAPTER_START_REGEX);
  if (sanMatch) {
    return {
      isChapter: true,
      title: trimmed,
      chapterIdentifier: sanMatch[1].trim(),
      confidence: 0.98,
    };
  }

  // 2. Hindi Chapter keywords: अध्याय, प्रकरण, etc.
  const hinMatch = trimmed.match(HINDI_CHAPTER_REGEX);
  if (hinMatch) {
    return {
      isChapter: true,
      title: trimmed,
      chapterIdentifier: hinMatch[1] ? hinMatch[1].trim() : "1",
      confidence: 0.95,
    };
  }

  // 3. Hindi Ordinal Chapter: प्रथम अध्याय, द्वितीय अध्याय, etc.
  const hinOrdMatch = trimmed.match(HINDI_ORDINAL_CHAPTER_REGEX);
  if (hinOrdMatch) {
    return {
      isChapter: true,
      title: trimmed,
      chapterIdentifier: hinOrdMatch[0].trim(),
      confidence: 0.95,
    };
  }

  // 4. English Chapter keywords: Chapter 1, Chapter I, etc.
  const engMatch = trimmed.match(ENGLISH_CHAPTER_REGEX);
  if (engMatch) {
    return {
      isChapter: true,
      title: trimmed,
      chapterIdentifier: engMatch[1].trim(),
      confidence: 0.95,
    };
  }

  return { isChapter: false, title: "", confidence: 0 };
}

/**
 * Classifies an individual block or paragraph into a structural PassageType.
 * 
 * @param {string} blockText - Paragraph or section text
 * @returns {{
 *   type: "CHAPTER_TITLE" | "VERSE" | "HEADING" | "SUBHEADING" | "FOOTNOTE" | "PARAGRAPH",
 *   confidence: number,
 *   needsReview: boolean
 * }}
 */
export function classifyPassage(blockText) {
  const trimmed = (blockText || "").trim();
  if (!trimmed) {
    return { type: "PARAGRAPH", confidence: 1.0, needsReview: false };
  }

  // 1. Check Chapter Title
  const chCheck = detectChapterTitle(trimmed);
  if (chCheck.isChapter) {
    return {
      type: "CHAPTER_TITLE",
      confidence: chCheck.confidence,
      needsReview: chCheck.confidence < 0.85,
    };
  }

  // 2. Check Footnote: e.g. [*], [1], (1), *
  if (/^(?:[\*†‡]|\[\d+\]|\(\d+\)|[¹²³⁴⁵⁶⁷⁸⁹])\s+/.test(trimmed)) {
    return { type: "FOOTNOTE", confidence: 0.92, needsReview: false };
  }

  // 3. Check Sanskrit / Devanagari Verse (Shloka / Mantra)
  if (isVerseLine(trimmed)) {
    const hasDoubleDanda = /॥/.test(trimmed);
    const confidence = hasDoubleDanda ? 0.95 : 0.85;
    return {
      type: "VERSE",
      confidence,
      needsReview: confidence < 0.80,
    };
  }

  // 4. Check Subheading (numbered points: 1.1, १.१, 1., १., a), (1))
  if (/^(?:[०-९\d]+(?:\.[०-९\d]+|\.|\))|\([०-९\d]+\)|[a-z]\)|\([a-z]\))\s+[^\n]{3,70}$/i.test(trimmed)) {
    return { type: "SUBHEADING", confidence: 0.90, needsReview: false };
  }

  // 5. Check Section Heading
  // Short line, no sentence terminator, title-cased or distinct Devanagari heading
  const lines = trimmed.split("\n");
  if (
    lines.length === 1 &&
    trimmed.length < 80 &&
    !/[.!?।॥:]$/.test(trimmed) &&
    !isListMarkerLine(trimmed)
  ) {
    const isUppercase = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
    const isCapitalized = /^[A-Z\u0900-\u097F]/.test(trimmed);

    if (isUppercase || isCapitalized) {
      return { type: "HEADING", confidence: 0.85, needsReview: false };
    }
  }

  // Default: Prose Paragraph
  return { type: "PARAGRAPH", confidence: 0.95, needsReview: false };
}

/**
 * Segments an entire book's normalized pages into structured Chapters and Passages.
 * 
 * @param {Array<{ id: string, pageNumber: number, cleanedText: string, rawText?: string }>} pages - Ordered pages
 * @param {Object} [bookMetadata] - Book metadata (title, author)
 * @returns {{
 *   chapters: Array<{ chapterNumber: number, title: string, startPage: number, endPage: number, confidence: number, needsReview: boolean }>,
 *   passages: Array<{ chapterIndex: number, pageId: string, sourcePage: number, endPage: number, text: string, rawText: string, passageType: string, confidence: number, needsReview: boolean, sortOrder: number }>
 * }}
 */
export function segmentBookContent(pages = [], bookMetadata = {}) {
  if (!Array.isArray(pages) || pages.length === 0) {
    return { chapters: [], passages: [] };
  }

  // Sort pages by pageNumber asc
  const sortedPages = [...pages].sort((a, b) => a.pageNumber - b.pageNumber);
  const detectedChapters = [];
  const rawPassages = [];

  // Pass 1: Identify all passages and chapter markers across pages
  let currentChapterIndex = -1;
  let globalSortOrder = 1;

  for (let pIdx = 0; pIdx < sortedPages.length; pIdx++) {
    const page = sortedPages[pIdx];
    const textToProcess = (page.cleanedText || page.rawText || "").trim();
    if (!textToProcess) continue;

    // Split page text into blocks (double newline)
    const blocks = textToProcess.split(/\n\s*\n/).map((b) => b.trim()).filter((b) => b.length > 0);

    for (let bIdx = 0; bIdx < blocks.length; bIdx++) {
      const block = blocks[bIdx];
      const classification = classifyPassage(block);

      if (classification.type === "CHAPTER_TITLE") {
        currentChapterIndex++;
        detectedChapters.push({
          chapterIndex: currentChapterIndex,
          chapterNumber: currentChapterIndex + 1,
          title: block,
          startPage: page.pageNumber,
          endPage: page.pageNumber,
          confidence: classification.confidence,
          needsReview: classification.needsReview,
        });
      }

      // If no chapter has been detected yet, create a default preliminary chapter
      if (currentChapterIndex === -1) {
        currentChapterIndex = 0;
        const defaultTitle = bookMetadata.title
          ? `प्रारम्भ / Introduction: ${bookMetadata.title}`
          : "अध्याय १ / Chapter 1";

        detectedChapters.push({
          chapterIndex: 0,
          chapterNumber: 1,
          title: defaultTitle,
          startPage: page.pageNumber,
          endPage: page.pageNumber,
          confidence: 0.75,
          needsReview: true, // Needs admin review as it was synthesized
        });
      }

      rawPassages.push({
        chapterIndex: currentChapterIndex,
        pageId: page.id,
        sourcePage: page.pageNumber,
        endPage: page.pageNumber,
        text: block,
        rawText: block,
        passageType: classification.type,
        confidence: classification.confidence,
        needsReview: classification.needsReview,
        sortOrder: globalSortOrder++,
      });
    }
  }

  // Pass 2: Calculate multi-page spans for chapters
  const finalPageNumber = sortedPages[sortedPages.length - 1].pageNumber;

  for (let i = 0; i < detectedChapters.length; i++) {
    const curr = detectedChapters[i];
    const next = detectedChapters[i + 1];

    if (next) {
      curr.endPage = Math.max(curr.startPage, next.startPage - 1);
    } else {
      curr.endPage = Math.max(curr.startPage, finalPageNumber);
    }
  }

  return {
    chapters: detectedChapters,
    passages: rawPassages,
  };
}
