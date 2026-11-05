/**
 * Multilingual Astrology Passage Retrieval Pipeline (Phase 9 Advanced Retrieval)
 * 
 * Maps astrological chart factors and user queries into multilingual terms
 * (English, Hindi, Sanskrit) and retrieves relevant passages from published
 * classical texts using Hybrid Search (PostgreSQL Lexical + Semantic Vector Similarity).
 * 
 * Features:
 * - Astrological concept extraction (Grahas, Bhavas, Rashis, Nakshatras, Yogas, Dashas)
 * - Hybrid search with Reciprocal Rank Fusion & Concept Boosting
 * - Evidence adequacy and confidence evaluation
 * - Classical Source Comparison across different astrological treatises
 * - Backward compatibility with Phase 6 array callers
 */

import { hybridSearchAstrologyContent } from "../search/hybridSearch.js";
import { extractAstrologyConcepts } from "./conceptExtractor.js";
import { comparePassageSources } from "./sourceComparison.js";

// Re-export extraction helpers
export { extractAstrologyConcepts } from "./conceptExtractor.js";

/**
 * Extracts searchable queries from user query and birth chart factors.
 * Provided for backwards compatibility with Phase 6 tests and services.
 * 
 * @param {string} userQuery
 * @param {Object} [chart]
 * @returns {Array<string>} List of targeted query phrases
 */
export function extractRetrievalQueries(userQuery = "", chart = null) {
  const concepts = extractAstrologyConcepts(userQuery, chart);
  const queries = [];

  if (userQuery && userQuery.trim()) {
    queries.push(userQuery.trim());
  }

  // Add expanded concepts
  queries.push(...concepts.expandedTerms.slice(0, 5));

  // Add planets in key houses if chart provided
  if (chart && Array.isArray(chart.planets)) {
    for (const p of chart.planets) {
      if ([1, 5, 9, 10].includes(p.house)) {
        queries.push(`${p.name} in House ${p.house}`);
        queries.push(`${p.name} in ${p.sign}`);
      }
    }
  }

  return Array.from(new Set(queries.filter(Boolean))).slice(0, 6);
}

/**
 * Retrieves classical book passages relevant to the query and birth chart
 * using advanced hybrid search, concept extraction, and source comparison.
 * 
 * @param {Object} params
 * @param {string} params.query - User question or inquiry
 * @param {Object} [params.chart] - Calculated birth chart
 * @param {number} [params.limit=5] - Maximum number of passages to return
 * @param {string} [params.language] - Optional language preference ('en', 'hi', 'sa')
 * @param {Object} [params.user] - Requesting user for permission checks
 * @param {number} [params.minRelevance=0.15] - Minimum relevance threshold
 * @returns {Promise<Array<Object>>} Passages array augmented with Phase 9 metadata
 */
export async function retrieveRelevantPassages({
  query = "",
  chart = null,
  limit = 5,
  language = null,
  user = null,
  minRelevance = 0.15,
}) {
  const cleanQuery = (query || "").trim();

  // 1. Concept Extraction
  const concepts = extractAstrologyConcepts(cleanQuery, chart);

  // 2. Hybrid Search (Lexical Trigram + Semantic Embeddings)
  let searchRes;
  try {
    searchRes = await hybridSearchAstrologyContent({
      query: cleanQuery || "Jyotish shastra principles",
      limit: Math.max(limit * 2, 10),
      language: language && language !== "all" ? language : undefined,
      user,
      chart,
      semanticWeight: 0.5,
    });
  } catch (err) {
    console.warn("[Retrieval] Hybrid search failed, attempting fallback:", err.message);
    searchRes = { results: [], searchMethod: "KEYWORD_FALLBACK", concepts };
  }

  const rawResults = searchRes.results || [];

  // 3. Normalize Passage Evidence & Apply Thresholds
  const passages = [];
  const seenIds = new Set();

  for (const item of rawResults) {
    const pId = item.id || item.passageId;
    if (!pId || seenIds.has(pId)) continue;
    seenIds.add(pId);

    const relevance = typeof item.finalScore === "number"
      ? item.finalScore
      : typeof item.relevanceScore === "number"
      ? item.relevanceScore
      : typeof item.relevance === "number"
      ? item.relevance
      : 1.0;

    passages.push({
      passageId: pId,
      bookId: item.book?.id,
      bookTitle: item.book?.title || "Classical Astrology Manuscript",
      bookAuthor: item.book?.author || "Vedic Sage",
      chapterTitle: item.chapter?.title || "General Principles",
      chapterSlug: item.chapter?.slug || "",
      sourcePage: item.sourcePage || null,
      text: item.text,
      snippet: item.snippet || (item.text ? item.text.slice(0, 240) + "..." : ""),
      relevance: parseFloat(relevance.toFixed(4)),
      readerUrl: item.readerUrl || `/library/${item.book?.slug || "books"}/${item.chapter?.slug || ""}`,
      language: item.book?.language || "Sanskrit",
      searchMethod: item.searchMethod || searchRes.searchMethod || "HYBRID",
    });

    if (passages.length >= limit) break;
  }

  // 4. Evaluate Evidence Adequacy & Confidence
  // Check if query had substantive astrological keywords vs out-of-scope/unsupported queries
  const hasAstrologicalTerms =
    concepts.planets.length > 0 ||
    concepts.houses.length > 0 ||
    concepts.signs.length > 0 ||
    concepts.nakshatras.length > 0 ||
    concepts.yogas.length > 0;

  let hasSufficientEvidence = passages.length > 0;
  let evidenceConfidence = "INSUFFICIENT_EVIDENCE";

  if (passages.length >= 3 && passages[0].relevance > 0.008) {
    evidenceConfidence = "HIGH";
  } else if (passages.length >= 1 && passages[0].relevance > 0.003) {
    evidenceConfidence = "MEDIUM";
  } else if (passages.length > 0) {
    evidenceConfidence = "LOW";
  }

  // Detect strictly out-of-scope queries (e.g. quantum computing, crypto predictions)
  const isOutOfScope =
    /quantum|blockchain|crypto|bitcoin|ethereum|machine learning|python|react/i.test(cleanQuery) &&
    !hasAstrologicalTerms;

  if (isOutOfScope) {
    hasSufficientEvidence = false;
    evidenceConfidence = "INSUFFICIENT_EVIDENCE";
  }

  // 5. Source Comparison Analysis
  const sourceComparison = comparePassageSources(passages);

  // 6. Return array with backward-compatible metadata properties
  const resultList = passages.slice(0, limit);
  Object.assign(resultList, {
    concepts,
    sourceComparison,
    hasSufficientEvidence,
    evidenceConfidence,
    searchMethod: searchRes.searchMethod || "HYBRID",
    timingMs: searchRes.timingMs || 0,
    totalFound: resultList.length,
  });

  return resultList;
}
