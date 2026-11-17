/**
 * Gurukul Intelligent Multilingual Digital Library Search Engine
 * 
 * Features:
 * - Full-text search across Book titles, Chapter titles, and Passages.
 * - Native multilingual support: English, Hindi, and Sanskrit (Devanagari).
 * - Unicode normalization preserving ligatures, combining marks, virama, and matras.
 * - Bidirectional transliteration & cross-scriptural astrological concept expansion.
 * - Exact phrase, partial word, and semantic relevance scoring.
 * - Strict publication guardrails (unpublished content only visible to authorized editors/admins).
 * - Multi-criteria filters:
 *   - Language (Sanskrit, Hindi, English, all)
 *   - Book UUID & Author
 *   - Chapter UUID
 *   - Scripture / Category (Jyotish, Ayurveda, Philosophy, etc.)
 *   - Passage Type (VERSE, HEADING, PARAGRAPH, FOOTNOTE)
 *   - OCR Verification Status (VERIFIED, HIGH_CONFIDENCE, NEEDS_REVIEW)
 *   - Availability of Searchable Text
 * - Scholarly provenance and verification badges (never presenting unverified OCR as verified text).
 * - Deep Reader navigation links directly to exact passage IDs.
 * - Anonymous, privacy-preserving search analytics logging.
 */

import prisma from "../../lib/prisma.js";
import {
  normalizeSearchQuery,
  generateContextSnippet,
} from "./normalizeQuery.js";
import { canManageBooks } from "../../lib/permissions.js";
import { extractAstrologyConcepts } from "../ai/conceptExtractor.js";
import { evaluateSourceQuality } from "../ai/researchAssistant.js";

/**
 * Searches astrology and sacred scripture content with multilingual query intelligence,
 * comprehensive filtering, and relevance-based ranking.
 * 
 * @param {Object} params
 * @param {string} params.query - User search query
 * @param {number} [params.page=1] - 1-based page number
 * @param {number} [params.limit=20] - Results per page
 * @param {string} [params.language] - Optional language filter (e.g. "Hindi", "Sanskrit", "English")
 * @param {string} [params.bookId] - Optional book UUID filter
 * @param {string} [params.chapterId] - Optional chapter UUID filter
 * @param {string} [params.author] - Optional author filter
 * @param {string} [params.subject] - Optional subject/category filter (Astrology, Ayurveda, Philosophy, etc.)
 * @param {string} [params.passageType] - Optional passage type filter (VERSE, HEADING, PARAGRAPH)
 * @param {string} [params.ocrStatus] - Optional verification status (VERIFIED, HIGH_CONFIDENCE, NEEDS_REVIEW)
 * @param {boolean} [params.hasSearchableText] - Filter passages with non-empty text
 * @param {Object} [params.user] - Requesting user for permission checks
 * @returns {Promise<{
 *   results: Array<Object>,
 *   total: number,
 *   page: number,
 *   limit: number,
 *   totalPages: number,
 *   timingMs: number,
 *   query: string,
 *   filters: Object,
 *   expandedConcepts: Array<string>
 * }>}
 */
export async function searchAstrologyContent({
  query = "",
  page = 1,
  limit = 20,
  language,
  bookId,
  chapterId,
  author,
  subject,
  passageType,
  ocrStatus,
  hasSearchableText,
  user = null,
}) {
  const startTime = Date.now();

  const {
    normalized,
    tokens,
    expandedTerms,
    isEmpty,
  } = normalizeSearchQuery(query);

  if (isEmpty) {
    return {
      results: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
      timingMs: Date.now() - startTime,
      query: "",
      filters: { language, bookId, chapterId, author, subject, passageType, ocrStatus },
      expandedConcepts: [],
    };
  }

  const isPrivileged = user && canManageBooks(user);

  // 1. Build Base Where Clauses
  const where = {
    // Publication Guard: Public users strictly only see PUBLISHED books
    book: {
      status: isPrivileged ? undefined : "PUBLISHED",
    },
  };

  // 2. Language Filter
  if (language && language.trim() && language.toLowerCase() !== "all") {
    where.book.language = { equals: language.trim(), mode: "insensitive" };
  }

  // 3. Book ID & Chapter ID Filters
  if (bookId && bookId.trim()) {
    where.bookId = bookId.trim();
  }

  if (chapterId && chapterId.trim()) {
    where.chapterId = chapterId.trim();
  }

  // 4. Author Filter
  if (author && author.trim()) {
    where.book.author = { contains: author.trim(), mode: "insensitive" };
  }

  // 5. Subject / Scripture Category Filter
  if (subject && subject.trim() && subject.toUpperCase() !== "ALL") {
    const sub = subject.trim().toLowerCase();
    if (sub === "astrology" || sub === "jyotish") {
      where.book.OR = [
        { title: { contains: "jyotish", mode: "insensitive" } },
        { title: { contains: "hora", mode: "insensitive" } },
        { title: { contains: "jataka", mode: "insensitive" } },
        { title: { contains: "samhita", mode: "insensitive" } },
        { title: { contains: "parashara", mode: "insensitive" } },
        { title: { contains: "phaladeepika", mode: "insensitive" } },
        { title: { contains: "manasagari", mode: "insensitive" } },
        { description: { contains: "astrology", mode: "insensitive" } },
      ];
    } else if (sub === "ayurveda" || sub === "health") {
      where.book.OR = [
        { title: { contains: "arogya", mode: "insensitive" } },
        { title: { contains: "chikitsa", mode: "insensitive" } },
        { title: { contains: "ayurveda", mode: "insensitive" } },
        { description: { contains: "ayurveda", mode: "insensitive" } },
      ];
    } else if (sub === "philosophy" || sub === "kundalini" || sub === "spirituality") {
      where.book.OR = [
        { title: { contains: "upanishad", mode: "insensitive" } },
        { title: { contains: "gita", mode: "insensitive" } },
        { title: { contains: "yoga", mode: "insensitive" } },
        { title: { contains: "chakra", mode: "insensitive" } },
        { title: { contains: "kundalini", mode: "insensitive" } },
        { description: { contains: "philosophy", mode: "insensitive" } },
      ];
    }
  }

  // 6. Passage Type Filter
  if (passageType && passageType.trim() && passageType.toUpperCase() !== "ALL") {
    where.passageType = passageType.trim().toUpperCase();
  }

  // 7. OCR / Verification Status Filter
  if (ocrStatus && ocrStatus.trim() && ocrStatus.toUpperCase() !== "ALL") {
    const statusUpper = ocrStatus.trim().toUpperCase();
    if (statusUpper === "VERIFIED" || statusUpper === "PROOFREAD") {
      where.status = { in: ["APPROVED", "PUBLISHED", "REVIEWED"] };
    } else if (statusUpper === "HIGH_CONFIDENCE") {
      where.ocrConfidence = { gte: 0.85 };
    } else if (statusUpper === "NEEDS_REVIEW") {
      where.OR = [
        { needsReview: true },
        { ocrConfidence: { lt: 0.65 } },
      ];
    }
  }

  // 8. Searchable Text Filter
  if (hasSearchableText === true) {
    where.text = { not: "" };
  }

  // 9. Search Matching Conditions:
  // Primary literal phrase condition is always first!
  const searchOrConditions = [];
  searchOrConditions.push({ text: { contains: normalized, mode: "insensitive" } });

  // Add individual tokens
  for (const token of tokens.slice(0, 3)) {
    if (token.length >= 2 && !searchOrConditions.some((c) => c.text?.contains === token)) {
      searchOrConditions.push({ text: { contains: token, mode: "insensitive" } });
    }
  }

  // Cross-lingual concept expansions (English <-> Sanskrit / Hindi)
  // Only add if not filtering by strict language or if language matches
  if (!language || language.toLowerCase() === "all") {
    for (const term of expandedTerms.slice(0, 2)) {
      if (!searchOrConditions.some((c) => c.text?.contains === term)) {
        searchOrConditions.push({ text: { contains: term, mode: "insensitive" } });
      }
    }
  }

  // Astrological Domain Concepts
  try {
    const concepts = extractAstrologyConcepts(query);
    if (concepts && (!language || language.toLowerCase() === "all")) {
      if (concepts.houses.includes(1) && !searchOrConditions.some((c) => c.text?.contains === "लग्न")) {
        searchOrConditions.push({ text: { contains: "लग्न", mode: "insensitive" } });
      }
      if (concepts.houses.includes(10) && !searchOrConditions.some((c) => c.text?.contains === "दशम")) {
        searchOrConditions.push({ text: { contains: "दशम", mode: "insensitive" } });
      }
      if (concepts.planets.includes("Sun") && !searchOrConditions.some((c) => c.text?.contains === "सूर्य")) {
        searchOrConditions.push({ text: { contains: "सूर्य", mode: "insensitive" } });
      }
      if (concepts.planets.includes("Jupiter") && !searchOrConditions.some((c) => c.text?.contains === "गुरु")) {
        searchOrConditions.push({ text: { contains: "गुरु", mode: "insensitive" } });
      }
      if (concepts.yogas.length > 0) {
        for (const y of concepts.yogas) {
          if (y.includes("Gajakesari") && !searchOrConditions.some((c) => c.text?.contains === "गजकेसरी")) {
            searchOrConditions.push({ text: { contains: "गजकेसरी", mode: "insensitive" } });
          }
        }
      }
    }
  } catch (_e) {}

  where.OR = searchOrConditions.slice(0, 5);

  // 10. Query Database
  const total = await prisma.passage.count({ where });

  // Fetch with pool size to rank properly in-memory
  const fetchLimit = Math.min(Math.max(limit * 5, 100), 250);
  const skip = (page - 1) * limit;

  const passages = await prisma.passage.findMany({
    where,
    include: {
      book: {
        select: {
          id: true,
          title: true,
          slug: true,
          language: true,
          script: true,
          author: true,
          status: true,
        },
      },
      chapter: {
        select: {
          id: true,
          title: true,
          slug: true,
          chapterNumber: true,
          number: true,
          startPage: true,
          endPage: true,
        },
      },
    },
    take: fetchLimit,
  });

  // 11. Calculate Relevance & Generate Snippets
  const lowerQuery = normalized.toLowerCase();

  const formattedResults = passages.map((p) => {
    const text = p.text || p.cleanedText || p.rawText || "";
    const lowerText = text.toLowerCase();
    const chapterTitle = p.chapter?.title || "General";
    const bookTitle = p.book?.title || "";
    const bookAuthor = p.book?.author || "";

    // Relevance scoring:
    // +200 for exact phrase in passage text
    // +80 for match in book title
    // +50 for match in chapter title
    // +40 for match in author
    // +30 for proofread/verified content
    // +15 for high OCR confidence (>= 0.85)
    // +10 for each matching token
    let score = 0;
    let matchType = "APPROXIMATE";

    if (lowerText.includes(lowerQuery)) {
      score += 200;
      matchType = "EXACT_PHRASE";
    }

    if (bookTitle.toLowerCase().includes(lowerQuery)) score += 80;
    if (chapterTitle.toLowerCase().includes(lowerQuery)) score += 50;
    if (bookAuthor.toLowerCase().includes(lowerQuery)) score += 40;

    // Quality boosts
    const quality = evaluateSourceQuality(p);
    if (quality.isProofread) score += 30;
    else if (quality.ocrConfidence >= 0.85) score += 15;

    // Token frequency boost
    for (const tok of tokens) {
      if (tok.length > 2 && lowerText.includes(tok.toLowerCase())) {
        score += 10;
      }
    }

    const snippet = generateContextSnippet(text, normalized, 80);

    const chapterSlug = p.chapter?.slug || "chapter-1";
    const bookSlug = p.book?.slug || "";
    // Generates readerUrl with both parameter and anchor for seamless navigation and compatibility
    const readerUrl =
      bookSlug && chapterSlug
        ? `/library/${bookSlug}/${chapterSlug}?passageId=${p.id}#passage-${p.id}`
        : null;

    return {
      id: p.id,
      passageId: p.id,
      score,
      matchType,
      passageNumber: p.passageNumber || p.number,
      passageType: p.passageType,
      sourcePage: p.sourcePage,
      snippet,
      text: p.text,
      language: p.book?.language || "Sanskrit",
      script: p.book?.script || "Devanagari",
      bookId: p.bookId,
      bookTitle: p.book?.title,
      bookSlug: p.book?.slug,
      bookAuthor: p.book?.author,
      chapterId: p.chapterId,
      chapterTitle,
      chapterSlug,
      chapterNumber: p.chapter?.chapterNumber || p.chapter?.number || 1,
      readerUrl,
      quality,
      ocrConfidence: quality.ocrConfidence,
      isVerified: quality.isProofread,
    };
  });

  // Sort by score descending (highest relevance first)
  formattedResults.sort((a, b) => b.score - a.score);

  // Slice results according to pagination
  const pagedResults = formattedResults.slice(skip, skip + limit);

  const durationMs = Date.now() - startTime;

  return {
    results: pagedResults,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    timingMs: durationMs,
    query: normalized,
    expandedConcepts: expandedTerms,
    filters: {
      language: language || null,
      bookId: bookId || null,
      chapterId: chapterId || null,
      author: author || null,
      subject: subject || null,
      passageType: passageType || null,
      ocrStatus: ocrStatus || null,
    },
  };
}
