import prisma from "../../lib/prisma.js";
import { generateEmbedding } from "../ai/embeddings.js";

/**
 * Gurukul Search & AI Content Freshness Manager.
 * Ensures proofread passages are synchronized with search text,
 * invalidates stale vector embeddings upon text correction,
 * and supports selective book/passage reindexing.
 */

/**
 * Synchronizes search text and vector embedding for a single passage.
 * 
 * @param {string} passageId - Passage UUID
 * @returns {Promise<Object>}
 */
export async function syncPassageFreshness(passageId) {
  const passage = await prisma.passage.findUnique({
    where: { id: passageId },
    select: {
      id: true,
      text: true,
      cleanedText: true,
      proofreadText: true,
      bookId: true,
    },
  });

  if (!passage) {
    throw new Error(`Passage ${passageId} not found`);
  }

  const activeText = (passage.proofreadText || passage.cleanedText || passage.text || "").trim();

  // 1. Update normalized searchText
  const normalizedSearchText = activeText
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  await prisma.passage.update({
    where: { id: passageId },
    data: {
      searchText: normalizedSearchText,
      updatedAt: new Date(),
    },
  });

  // 2. Generate and update vector embedding
  try {
    const { vector } = await generateEmbedding(activeText);
    const contentHash = Buffer.from(activeText).toString("base64").slice(0, 32);

    await prisma.passageEmbedding.upsert({
      where: {
        id: (await prisma.passageEmbedding.findFirst({ where: { passageId } }))?.id || "new-id",
      },
      update: {
        vector,
        contentHash,
        status: "COMPLETED",
        updatedAt: new Date(),
      },
      create: {
        passageId,
        vector,
        contentHash,
        status: "COMPLETED",
      },
    });
  } catch (err) {
    console.warn(`[Freshness] Embedding generation skipped for passage ${passageId}:`, err.message);
  }

  return { success: true, passageId };
}

/**
 * Reindexes search text and marks freshness for an entire book.
 * 
 * @param {string} bookId - Book UUID
 * @returns {Promise<Object>}
 */
export async function reindexBookSearch(bookId) {
  const passages = await prisma.passage.findMany({
    where: { bookId },
    select: { id: true, text: true, cleanedText: true, proofreadText: true },
  });

  let updatedCount = 0;
  for (const p of passages) {
    const activeText = (p.proofreadText || p.cleanedText || p.text || "").trim();
    const normalized = activeText
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();

    await prisma.passage.update({
      where: { id: p.id },
      data: { searchText: normalized },
    });
    updatedCount++;
  }

  await prisma.book.update({
    where: { id: bookId },
    data: { searchIndexedAt: new Date() },
  });

  return {
    success: true,
    bookId,
    passagesUpdated: updatedCount,
    indexedAt: new Date(),
  };
}

/**
 * Retries and updates outdated or missing embeddings across all books.
 * 
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export async function reindexOutdatedEmbeddings(limit = 50) {
  const outdated = await prisma.passageEmbedding.findMany({
    where: { status: "OUTDATED" },
    take: limit,
    select: { id: true, passageId: true },
  });

  let refreshed = 0;
  for (const item of outdated) {
    try {
      await syncPassageFreshness(item.passageId);
      refreshed++;
    } catch (err) {
      console.warn(`Failed to refresh embedding for passage ${item.passageId}:`, err.message);
    }
  }

  return {
    success: true,
    refreshedCount: refreshed,
    remainingOutdated: Math.max(0, outdated.length - refreshed),
  };
}

/**
 * Retrieves overall search and AI freshness diagnostic metrics.
 * 
 * @returns {Promise<Object>}
 */
export async function getSearchFreshnessReport() {
  const [
    totalPassages,
    passagesWithSearchText,
    totalEmbeddings,
    outdatedEmbeddings,
    booksCount,
    unindexedBooks,
  ] = await Promise.all([
    prisma.passage.count(),
    prisma.passage.count({ where: { searchText: { not: null } } }),
    prisma.passageEmbedding.count({ where: { status: "COMPLETED" } }),
    prisma.passageEmbedding.count({ where: { status: "OUTDATED" } }),
    prisma.book.count(),
    prisma.book.count({ where: { searchIndexedAt: null } }),
  ]);

  return {
    totalPassages,
    searchCoveragePercent: totalPassages > 0 ? Math.round((passagesWithSearchText / totalPassages) * 100) : 100,
    totalEmbeddings,
    outdatedEmbeddings,
    embeddingFreshnessPercent: totalEmbeddings > 0
      ? Math.round(((totalEmbeddings - outdatedEmbeddings) / totalEmbeddings) * 100)
      : 100,
    totalBooks: booksCount,
    unindexedBooksCount: unindexedBooks,
    status: outdatedEmbeddings > 20 || unindexedBooks > 0 ? "ACTION_REQUIRED" : "FRESH",
  };
}
