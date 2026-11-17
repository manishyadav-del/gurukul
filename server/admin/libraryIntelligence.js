/**
 * Gurukul Admin Digital Library & Research Intelligence Service
 * 
 * Provides administrative oversight into:
 * - Search indexing and vector embedding freshness
 * - Books with missing or incomplete metadata
 * - Unindexed passages
 * - OCR verification and proofreading health
 * - Recommendation engine and knowledge graph health
 */

import prisma from "../../lib/prisma.js";

/**
 * Compiles a comprehensive administrative report on digital library search & research health.
 * 
 * @returns {Promise<Object>}
 */
export async function getLibraryIntelligenceReport() {
  const [
    totalBooks,
    publishedBooks,
    draftBooks,
    totalChapters,
    totalPassages,
    passagesWithSearchText,
    totalEmbeddings,
    completedEmbeddings,
    outdatedEmbeddings,
    proofreadPassages,
    lowConfidencePassages,
    booksMissingAuthor,
    booksMissingDescription,
    booksMissingPageCount,
    totalCollections,
    totalResearchItems,
    knowledgeConceptsCount,
  ] = await Promise.all([
    prisma.book.count(),
    prisma.book.count({ where: { status: "PUBLISHED" } }),
    prisma.book.count({ where: { status: { in: ["DRAFT", "RECEIVED", "PROCESSING"] } } }),
    prisma.chapter.count(),
    prisma.passage.count(),
    prisma.passage.count({ where: { searchText: { not: null } } }),
    prisma.passageEmbedding.count(),
    prisma.passageEmbedding.count({ where: { status: "COMPLETED" } }),
    prisma.passageEmbedding.count({ where: { status: "OUTDATED" } }),
    prisma.passage.count({
      where: {
        OR: [
          { status: "PUBLISHED" },
          { page: { proofread: true } },
        ],
      },
    }),
    prisma.passage.count({
      where: {
        OR: [
          { needsReview: true },
          { ocrConfidence: { lt: 0.65 } },
        ],
      },
    }),
    prisma.book.findMany({
      where: { OR: [{ author: null }, { author: "" }] },
      select: { id: true, title: true, slug: true, status: true },
      take: 10,
    }),
    prisma.book.findMany({
      where: { OR: [{ description: null }, { description: "" }] },
      select: { id: true, title: true, slug: true, status: true },
      take: 10,
    }),
    prisma.book.findMany({
      where: { OR: [{ pageCount: null }, { pageCount: 0 }] },
      select: { id: true, title: true, slug: true, status: true },
      take: 10,
    }),
    prisma.researchCollection.count(),
    prisma.researchItem.count(),
    prisma.knowledgeConcept.count(),
  ]);

  const searchCoveragePct =
    totalPassages > 0 ? Math.round((passagesWithSearchText / totalPassages) * 100) : 100;

  const embeddingCoveragePct =
    totalPassages > 0 ? Math.round((completedEmbeddings / totalPassages) * 100) : 100;

  return {
    generatedAt: new Date().toISOString(),
    libraryOverview: {
      totalBooks,
      publishedBooks,
      draftBooks,
      totalChapters,
      totalPassages,
      knowledgeConceptsCount,
    },
    searchIndexing: {
      passagesWithSearchText,
      unindexedPassages: Math.max(0, totalPassages - passagesWithSearchText),
      searchCoveragePct,
      totalEmbeddings,
      completedEmbeddings,
      outdatedEmbeddings,
      embeddingCoveragePct,
      status: searchCoveragePct > 90 ? "OPTIMAL" : "INDEXING_REQUIRED",
    },
    ocrAndScholarlyQuality: {
      proofreadPassages,
      lowConfidencePassages,
      verificationPct: totalPassages > 0 ? Math.round((proofreadPassages / totalPassages) * 100) : 0,
      scholarlyFlag: lowConfidencePassages > 0 ? "ACTION_RECOMMENDED" : "HEALTHY",
    },
    incompleteMetadata: {
      missingAuthorCount: booksMissingAuthor.length,
      missingDescriptionCount: booksMissingDescription.length,
      missingPageCountCount: booksMissingPageCount.length,
      sampleBooksMissingAuthor: booksMissingAuthor,
      sampleBooksMissingDescription: booksMissingDescription,
      sampleBooksMissingPageCount: booksMissingPageCount,
    },
    researchEcosystem: {
      totalCollections,
      totalResearchItems,
      recommendationPoolSize: publishedBooks,
      isRecommendationReady: publishedBooks >= 3,
    },
  };
}
