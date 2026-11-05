/**
 * Incremental & Resumable Background Embedding Job Processor
 * 
 * Embeds batches of approved passages without duplicating unchanged content,
 * supporting progress tracking, graceful failure handling, and resumption.
 */

import prisma from "../../lib/prisma.js";
import { embedPassage, DEFAULT_EMBEDDING_MODEL } from "./embeddings.js";

/**
 * Creates and runs an incremental embedding batch job.
 * 
 * @param {Object} options
 * @param {number} [options.batchSize=50]
 * @param {number} [options.maxPassages=500]
 * @param {boolean} [options.force=false]
 * @param {string} [options.bookId]
 * @returns {Promise<Object>} Job execution summary
 */
export async function runEmbeddingBatchJob({
  batchSize = 50,
  maxPassages = 500,
  force = false,
  bookId = null,
} = {}) {
  // 1. Create Job Record
  const job = await prisma.embeddingBatchJob.create({
    data: {
      status: "PROCESSING",
      model: DEFAULT_EMBEDDING_MODEL,
      startedAt: new Date(),
      metadata: { batchSize, maxPassages, force, bookId },
    },
  });

  try {
    // 2. Query Candidate Passages
    const where = {
      book: {
        status: { in: ["PUBLISHED", "APPROVED", "PROOFREAD"] },
      },
    };

    if (bookId) {
      where.bookId = bookId;
    }

    const totalApproved = await prisma.passage.count({ where });
    await prisma.embeddingBatchJob.update({
      where: { id: job.id },
      data: { totalCount: Math.min(totalApproved, maxPassages) },
    });

    let processedCount = 0;
    let failedCount = 0;
    let skippedCount = 0;
    let cursor = null;

    while (processedCount + failedCount < maxPassages) {
      const currentLimit = Math.min(batchSize, maxPassages - (processedCount + failedCount));
      const passages = await prisma.passage.findMany({
        where,
        take: currentLimit,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { id: "asc" },
        select: { id: true, text: true, cleanedText: true },
      });

      if (passages.length === 0) break;

      for (const p of passages) {
        cursor = p.id;
        try {
          const res = await embedPassage(p.id, force);
          if (res.skipped) {
            skippedCount++;
          }
          processedCount++;
        } catch (err) {
          failedCount++;
          console.warn(`[BatchEmbed] Failed passage ${p.id}:`, err.message);
        }
      }

      // Update progress
      await prisma.embeddingBatchJob.update({
        where: { id: job.id },
        data: {
          processedCount,
          failedCount,
          updatedAt: new Date(),
        },
      });
    }

    // 3. Mark Completed
    const completedJob = await prisma.embeddingBatchJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        processedCount,
        failedCount,
        completedAt: new Date(),
        metadata: {
          batchSize,
          maxPassages,
          force,
          bookId,
          skippedCount,
        },
      },
    });

    return {
      jobId: completedJob.id,
      status: "COMPLETED",
      totalCount: completedJob.totalCount,
      processedCount,
      failedCount,
      skippedCount,
    };
  } catch (err) {
    await prisma.embeddingBatchJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        errorMessage: err.message,
        completedAt: new Date(),
      },
    });
    throw err;
  }
}
