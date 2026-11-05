/**
 * Hybrid Search Engine for Vedic Astrology Content
 * 
 * Combines PostgreSQL full-text/trigram lexical matching with semantic vector
 * similarity using Reciprocal Rank Fusion (RRF) and astrological concept reranking.
 * 
 * Features:
 * - Multilingual query normalization (English, Hindi, Sanskrit)
 * - Reciprocal Rank Fusion: RRF = w_lex/(60 + rank_lex) + w_sem/(60 + rank_sem)
 * - Astrological concept booster (matches on planets, houses, rashis, yogas)
 * - Deduplication across book editions
 * - Strict publication guardrails (only approved/published books)
 * - Reliable fallback to lexical search if semantic retrieval fails or is empty
 */

import prisma from "../../lib/prisma.js";
import { searchAstrologyContent } from "./searchEngine.js";
import { generateEmbedding, cosineSimilarity } from "../ai/embeddings.js";
import { extractAstrologyConcepts } from "../ai/conceptExtractor.js";
import { canManageBooks } from "../../lib/permissions.js";

/**
 * Executes a hybrid search combining lexical and semantic retrieval.
 * 
 * @param {Object} params
 * @param {string} params.query - Search query string
 * @param {number} [params.limit=10] - Number of top results
 * @param {string} [params.language] - Optional language filter ("Hindi", "Sanskrit", "English", "all")
 * @param {string} [params.bookId] - Optional book UUID filter
 * @param {string} [params.chapterId] - Optional chapter UUID filter
 * @param {string} [params.passageType] - Optional passage type filter
 * @param {Object} [params.user] - Requesting user for permission checks
 * @param {Object} [params.chart] - Optional attached birth chart for concept boosting
 * @param {number} [params.semanticWeight=0.5] - Weight given to semantic vs lexical (0.0 to 1.0)
 * @returns {Promise<{
 *   results: Array<Object>,
 *   total: number,
 *   timingMs: number,
 *   searchMethod: "HYBRID" | "KEYWORD_FALLBACK" | "SEMANTIC",
 *   concepts: Object
 * }>}
 */
export async function hybridSearchAstrologyContent({
  query = "",
  limit = 10,
  language,
  bookId,
  chapterId,
  passageType,
  user = null,
  chart = null,
  semanticWeight = 0.5,
}) {
  const startTime = Date.now();
  const cleanQuery = (query || "").trim();
  const isPrivileged = user && canManageBooks(user);

  if (!cleanQuery) {
    return {
      results: [],
      total: 0,
      timingMs: Date.now() - startTime,
      searchMethod: "HYBRID",
      concepts: { planets: [], houses: [], signs: [], nakshatras: [], yogas: [] },
    };
  }

  // 1. Extract Astrology Concepts
  const concepts = extractAstrologyConcepts(cleanQuery, chart);

  // 2. Run Lexical (PostgreSQL Trigram / Token) Search
  let lexicalResults = [];
  try {
    const lexRes = await searchAstrologyContent({
      query: cleanQuery,
      page: 1,
      limit: Math.max(limit * 2, 20),
      language,
      bookId,
      passageType,
      user,
    });
    lexicalResults = lexRes.results || [];
  } catch (err) {
    console.warn("[HybridSearch] Lexical search error:", err.message);
  }

  // 3. Run Semantic Vector Search
  let semanticResults = [];
  let semanticFailed = false;

  try {
    const { vector: queryVector } = await generateEmbedding(cleanQuery);

    if (queryVector && queryVector.length > 0) {
      // Query pre-computed embeddings for approved passages
      const embeddings = await prisma.passageEmbedding.findMany({
        where: {
          status: "COMPLETED",
          passage: {
            book: {
              status: isPrivileged
                ? undefined
                : "PUBLISHED",
              language:
                language &&
                language.toLowerCase() !== "all" &&
                language.toLowerCase() !== "en" &&
                language.toLowerCase() !== "english"
                  ? { equals: language, mode: "insensitive" }
                  : undefined,
            },
            bookId: bookId || undefined,
            chapterId: chapterId || undefined,
          },
        },
        take: 300,
        include: {
          passage: {
            include: {
              book: { select: { id: true, title: true, author: true, language: true, slug: true } },
              chapter: { select: { id: true, title: true, slug: true } },
            },
          },
        },
      });

      if (embeddings.length > 0) {
        const scored = embeddings
          .map((emb) => {
            const sim = cosineSimilarity(queryVector, emb.vector);
            return {
              id: emb.passageId,
              text: emb.passage.text,
              snippet: emb.passage.text.slice(0, 240),
              sourcePage: emb.passage.sourcePage,
              book: emb.passage.book,
              chapter: emb.passage.chapter,
              readerUrl: `/library/${emb.passage.book?.slug || "books"}/${emb.passage.chapter?.slug || ""}`,
              semanticScore: sim,
            };
          })
          .filter((item) => item.semanticScore > 0.15)
          .sort((a, b) => b.semanticScore - a.semanticScore)
          .slice(0, Math.max(limit * 2, 20));

        semanticResults = scored;
      }
    }
  } catch (err) {
    console.warn("[HybridSearch] Semantic retrieval error (using fallback):", err.message);
    semanticFailed = true;
  }

  // 4. Fallback Handling
  if (semanticFailed || semanticResults.length === 0) {
    // Pure lexical results
    const results = lexicalResults.slice(0, limit).map((r, idx) => ({
      ...r,
      rank: idx + 1,
      hybridScore: r.relevanceScore || 1.0,
      searchMethod: "KEYWORD_FALLBACK",
    }));

    return {
      results,
      total: results.length,
      timingMs: Date.now() - startTime,
      searchMethod: "KEYWORD_FALLBACK",
      concepts,
    };
  }

  // 5. Reciprocal Rank Fusion (RRF) & Merging
  const candidateMap = new Map();
  const k = 60; // Standard RRF constant

  // Add Lexical Ranks
  lexicalResults.forEach((item, index) => {
    const rank = index + 1;
    const rrfLex = (1 - semanticWeight) / (k + rank);
    candidateMap.set(item.id, {
      ...item,
      lexRank: rank,
      semRank: 999,
      lexScore: item.relevanceScore || 0.5,
      semScore: 0,
      rrfScore: rrfLex,
    });
  });

  // Add Semantic Ranks
  semanticResults.forEach((item, index) => {
    const rank = index + 1;
    const rrfSem = semanticWeight / (k + rank);

    if (candidateMap.has(item.id)) {
      const existing = candidateMap.get(item.id);
      existing.semRank = rank;
      existing.semScore = item.semanticScore;
      existing.rrfScore += rrfSem;
    } else {
      candidateMap.set(item.id, {
        ...item,
        lexRank: 999,
        semRank: rank,
        lexScore: 0,
        semScore: item.semanticScore,
        rrfScore: rrfSem,
      });
    }
  });

  // 6. Astrological Concept Reranking Bonus
  const candidates = Array.from(candidateMap.values());
  for (const cand of candidates) {
    const textLower = (cand.text || "").toLowerCase();
    let conceptMatches = 0;

    for (const p of concepts.planets) {
      if (textLower.includes(p.toLowerCase())) conceptMatches++;
    }
    for (const h of concepts.houses) {
      if (textLower.includes(`${h}th`) || textLower.includes(`house ${h}`) || textLower.includes(`भाव`)) {
        conceptMatches++;
      }
    }
    for (const y of concepts.yogas) {
      if (textLower.includes(y.toLowerCase())) conceptMatches += 2;
    }

    // Concept boost up to 25%
    const boost = Math.min(0.25, conceptMatches * 0.05);
    cand.conceptBoost = boost;
    cand.finalScore = parseFloat((cand.rrfScore * (1 + boost)).toFixed(4));
  }

  // 7. Deduplicate overlapping content and sort
  candidates.sort((a, b) => b.finalScore - a.finalScore);

  const seenSnippets = new Set();
  const deduplicated = [];

  for (const cand of candidates) {
    const coreSnippet = (cand.text || "").slice(0, 80).toLowerCase().trim();
    if (!seenSnippets.has(coreSnippet)) {
      seenSnippets.add(coreSnippet);
      deduplicated.push({
        ...cand,
        searchMethod: "HYBRID",
      });
    }
    if (deduplicated.length >= limit) break;
  }

  return {
    results: deduplicated,
    total: deduplicated.length,
    timingMs: Date.now() - startTime,
    searchMethod: "HYBRID",
    concepts,
  };
}

/**
 * Standalone Reciprocal Rank Fusion helper
 * @param {Array<Array<Object>>} rankLists - Array of ranked result lists
 * @param {number} [k=60] - RRF smoothing parameter
 * @returns {Array<Object>} Fused and sorted items
 */
export function reciprocalRankFusion(rankLists = [], k = 60) {
  const scoreMap = new Map();

  for (const list of rankLists) {
    if (!Array.isArray(list)) continue;
    list.forEach((item, index) => {
      const id = item.id || item.passageId;
      if (!id) return;
      const rank = index + 1;
      const score = 1.0 / (k + rank);

      if (scoreMap.has(id)) {
        const existing = scoreMap.get(id);
        existing.rrfScore += score;
      } else {
        scoreMap.set(id, {
          ...item,
          rrfScore: score,
        });
      }
    });
  }

  const fused = Array.from(scoreMap.values());
  fused.sort((a, b) => b.rrfScore - a.rrfScore);
  return fused;
}

/**
 * Direct execution wrapper returning an array of candidate results
 */
export async function executeHybridSearch(params) {
  const res = await hybridSearchAstrologyContent(params);
  return res.results || [];
}

/**
 * Direct keyword search execution wrapper returning an array of results
 */
export async function executeKeywordSearch(params) {
  const res = await searchAstrologyContent(params);
  return res.results || [];
}

