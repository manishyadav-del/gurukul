/**
 * Gurukul Unified Intelligent Library Search
 * 
 * Supports:
 * - Book title & author search
 * - Chapter title & passage search
 * - Sanskrit & Hindi text search (Devanagari, Romanized IAST, and phonetics)
 * - English terminology search
 * - Concept-based search (Grahas, Bhavas, Rashis, Nakshatras, Chakras, Nadis, Tattvas)
 * - Semantic vector similarity search via PassageEmbedding
 * - Filters by bookId, author, subject, language, and publication status
 * - Context snippets with relevance scoring and deep reader links
 */

import prisma from "./prisma.js";
import { searchAstrologyContent } from "../server/search/searchEngine.js";
import { hybridSearchAstrologyContent } from "../server/search/hybridSearch.js";
import { canManageBooks } from "./permissions.js";
import { evaluateSourceQuality } from "../server/ai/researchAssistant.js";

/**
 * Searches published library content across books, chapters, and passages.
 * 
 * @param {Object} options
 * @param {string} options.query
 * @param {number} [options.page=1]
 * @param {number} [options.limit=20]
 * @param {string} [options.language]
 * @param {string} [options.bookId]
 * @param {string} [options.author]
 * @param {string} [options.subject]
 * @param {string} [options.passageType]
 * @param {string} [options.mode="hybrid"] - "hybrid" | "semantic" | "lexical"
 * @param {Object} [options.user]
 * @returns {Promise<Object>} Search results
 */
export async function searchContent(options = {}) {
  const {
    query = "",
    page = 1,
    limit = 20,
    language,
    bookId,
    author,
    subject,
    passageType,
    mode = "hybrid",
    user = null,
  } = options;

  const cleanQuery = (query || "").trim();
  const startTime = Date.now();

  if (!cleanQuery) {
    return {
      results: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
      timingMs: 0,
      query: "",
      searchMethod: mode.toUpperCase(),
      filters: { language, bookId, author, subject, passageType },
    };
  }

  // If pure lexical requested
  if (mode === "lexical") {
    const lex = await searchAstrologyContent({
      query: cleanQuery,
      page,
      limit,
      language,
      bookId,
      author,
      passageType,
      user,
    });
    return {
      ...lex,
      searchMethod: "LEXICAL",
    };
  }

  // Hybrid or Semantic search mode
  const hybridRes = await hybridSearchAstrologyContent({
    query: cleanQuery,
    limit: limit * 2,
    language,
    bookId,
    passageType,
    user,
    semanticWeight: mode === "semantic" ? 0.85 : 0.50,
  });

  let rawResults = hybridRes.results || [];

  // Filter by author if provided
  if (author && author.trim()) {
    const authLower = author.trim().toLowerCase();
    rawResults = rawResults.filter((r) =>
      (r.book?.author || "").toLowerCase().includes(authLower)
    );
  }

  // Filter by subject if provided
  if (subject && subject.trim() && subject.toUpperCase() !== "ALL") {
    const subLower = subject.trim().toLowerCase();
    rawResults = rawResults.filter((r) => {
      const bTitle = (r.book?.title || "").toLowerCase();
      const text = (r.text || "").toLowerCase();
      if (subLower === "astrology") {
        return (
          bTitle.includes("jyotish") ||
          bTitle.includes("hora") ||
          bTitle.includes("jataka") ||
          bTitle.includes("phaladeepika") ||
          bTitle.includes("parashara") ||
          text.includes("ग्रह") ||
          text.includes("भाव")
        );
      }
      if (subLower === "kundalini" || subLower === "spirituality") {
        return (
          bTitle.includes("chakra") ||
          bTitle.includes("kundalini") ||
          bTitle.includes("yoga") ||
          text.includes("चक्र") ||
          text.includes("नाडी") ||
          text.includes("कुण्डलिनी")
        );
      }
      return true;
    });
  }

  // Annotate with source quality & direct reader navigation links
  const total = rawResults.length;
  const skip = (page - 1) * limit;
  const pagedResults = rawResults.slice(skip, skip + limit).map((r, idx) => {
    const pid = r.id || r.passageId;
    const bookSlug = r.book?.slug || r.book?.id || "books";
    const chapterSlug = r.chapter?.slug || "";
    const quality = evaluateSourceQuality(r);

    return {
      id: pid,
      passageId: pid,
      bookId: r.book?.id,
      bookTitle: r.book?.title || "Classical Manuscript",
      bookSlug,
      author: r.book?.author || "Vedic Sage",
      language: r.book?.language || "Sanskrit",
      chapterTitle: r.chapter?.title || "Chapter",
      chapterSlug,
      chapterNumber: r.chapter?.chapterNumber || 1,
      sourcePage: r.sourcePage || null,
      passageType: r.passageType || "PARAGRAPH",
      text: r.text,
      snippet: r.snippet || (r.text ? r.text.slice(0, 240) + "..." : ""),
      relevanceScore: r.hybridScore || r.finalScore || r.relevance || 1.0,
      readerUrl: `/library/${bookSlug}/${chapterSlug}?passageId=${pid}`,
      quality,
      rank: skip + idx + 1,
    };
  });

  return {
    results: pagedResults,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    timingMs: Date.now() - startTime,
    query: cleanQuery,
    searchMethod: hybridRes.searchMethod || "HYBRID",
    concepts: hybridRes.concepts || {},
    filters: { language, bookId, author, subject, passageType, mode },
  };
}

export { searchAstrologyContent };
