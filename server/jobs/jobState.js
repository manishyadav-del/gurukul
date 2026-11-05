import prisma from "../../lib/prisma.js";

/**
 * Manages persistent IngestJob state in PostgreSQL via Prisma.
 */

export async function createJob(bookId, totalPages = 0) {
  return await prisma.ingestJob.create({
    data: {
      bookId,
      status: "QUEUED",
      currentStep: "INITIALIZING",
      progress: 0,
      totalPages,
      processedPages: 0,
      failedPages: 0,
      startedAt: new Date(),
    },
  });
}

export async function updateJob(jobId, updates) {
  return await prisma.ingestJob.update({
    where: { id: jobId },
    data: {
      ...updates,
      updatedAt: new Date(),
    },
  });
}

export async function getJob(jobId) {
  return await prisma.ingestJob.findUnique({
    where: { id: jobId },
    include: {
      book: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          processingStatus: true,
          pageCount: true,
        },
      },
    },
  });
}
