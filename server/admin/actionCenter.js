/**
 * Gurukul Admin Action Center & Quality Control Service
 * Scans operational incidents, OCR failures, content review queues, and security alerts.
 */

import prisma from "../../lib/prisma.js";

/**
 * Scans the database and generates/updates operational action items
 */
export async function scanAndSyncActionItems() {
  const createdOrUpdated = [];

  try {
    // 1. Scan for Failed OCR Ingest Jobs
    const failedJobs = await prisma.ingestJob.findMany({
      where: { status: "FAILED" },
      include: { book: { select: { id: true, title: true } } },
      take: 20,
    });

    for (const job of failedJobs) {
      const existing = await prisma.adminActionItem.findFirst({
        where: {
          category: "OCR_FAILURE",
          affectedResource: "IngestJob",
          resourceId: job.id,
        },
      });

      if (!existing) {
        const item = await prisma.adminActionItem.create({
          data: {
            severity: "CRITICAL",
            category: "OCR_FAILURE",
            title: `OCR Ingestion Failure: ${job.book?.title || "Book"}`,
            description: `Ingestion job #${job.id.slice(0, 8)} failed during page analysis or recognition: ${job.errorMessage || "Unknown extraction error"}.`,
            affectedResource: "IngestJob",
            resourceId: job.id,
            actionUrl: `/admin/ocr`,
            status: "OPEN",
          },
        });
        createdOrUpdated.push(item);
      }
    }

    // 2. Scan for Books Awaiting Content Review
    const booksAwaitingReview = await prisma.book.findMany({
      where: { status: { in: ["PROOFREAD", "RECEIVED"] } },
      select: { id: true, title: true, status: true, language: true },
      take: 20,
    });

    for (const book of booksAwaitingReview) {
      const existing = await prisma.adminActionItem.findFirst({
        where: {
          category: "CONTENT_REVIEW",
          affectedResource: "Book",
          resourceId: book.id,
        },
      });

      if (!existing) {
        const item = await prisma.adminActionItem.create({
          data: {
            severity: "WARNING",
            category: "CONTENT_REVIEW",
            title: `Manuscript Awaiting Verification: ${book.title}`,
            description: `Book in ${book.language} is currently in '${book.status}' state and requires editorial approval before public publication.`,
            affectedResource: "Book",
            resourceId: book.id,
            actionUrl: `/admin/books/${book.id}`,
            status: "OPEN",
          },
        });
        createdOrUpdated.push(item);
      }
    }

    // 3. Scan for Security Alerts (e.g., Token Reuse Replays)
    const securityEvents = await prisma.adminAuditLog.findMany({
      where: {
        action: { contains: "SECURITY_ALERT" },
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      take: 10,
    });

    for (const evt of securityEvents) {
      const existing = await prisma.adminActionItem.findFirst({
        where: {
          category: "SECURITY_ALERT",
          affectedResource: "AdminAuditLog",
          resourceId: evt.id,
        },
      });

      if (!existing) {
        const item = await prisma.adminActionItem.create({
          data: {
            severity: "CRITICAL",
            category: "SECURITY_ALERT",
            title: `Security Alert: ${evt.action.replace(/_/g, " ")}`,
            description: `Incident detected for actor ${evt.actorEmail} from IP ${evt.ipAddress || "unknown"}. Immediate audit required.`,
            affectedResource: "AdminAuditLog",
            resourceId: evt.id,
            actionUrl: `/admin/audit-logs`,
            status: "OPEN",
          },
        });
        createdOrUpdated.push(item);
      }
    }

    // 4. Scan for Embedding / RAG Batch Job Failures
    const failedEmbeddings = await prisma.embeddingBatchJob.findMany({
      where: { status: "FAILED" },
      take: 10,
    });

    for (const emb of failedEmbeddings) {
      const existing = await prisma.adminActionItem.findFirst({
        where: {
          category: "AI_ERROR",
          affectedResource: "EmbeddingBatchJob",
          resourceId: emb.id,
        },
      });

      if (!existing) {
        const item = await prisma.adminActionItem.create({
          data: {
            severity: "WARNING",
            category: "AI_ERROR",
            title: `Vector Embedding Batch Incomplete`,
            description: `Passage vectorization job #${emb.id.slice(0, 8)} stopped with error: ${emb.errorMessage || "Embedding API timeout"}.`,
            affectedResource: "EmbeddingBatchJob",
            resourceId: emb.id,
            actionUrl: `/admin/astro-ai`,
            status: "OPEN",
          },
        });
        createdOrUpdated.push(item);
      }
    }

    // 5. Scan for Expired / Stale Invitations
    const expiredInvitesCount = await prisma.familyInvitation.count({
      where: { status: "EXPIRED" },
    });

    if (expiredInvitesCount > 0) {
      const existing = await prisma.adminActionItem.findFirst({
        where: {
          category: "EMAIL_FAILURE",
          affectedResource: "FamilyInvitationSummary",
        },
      });

      if (!existing) {
        const item = await prisma.adminActionItem.create({
          data: {
            severity: "INFO",
            category: "EMAIL_FAILURE",
            title: `${expiredInvitesCount} Family Invitation(s) Expired`,
            description: `Family invitations have exceeded their 7-day acceptance window without being claimed.`,
            affectedResource: "FamilyInvitationSummary",
            actionUrl: `/admin/family`,
            status: "OPEN",
          },
        });
        createdOrUpdated.push(item);
      }
    }

  } catch (err) {
    console.error("Action center scan error:", err);
  }

  return createdOrUpdated;
}

/**
 * Retrieves Content Quality Inspection Reports
 */
export async function getContentQualityReport() {
  const [
    emptyChapters,
    missingMetadataBooks,
    unpublishedBooks,
    lowConfidencePages,
  ] = await Promise.all([
    // 1. Chapters with zero passages
    prisma.chapter.findMany({
      where: {
        passages: { none: {} },
      },
      select: {
        id: true,
        title: true,
        chapterNumber: true,
        book: { select: { id: true, title: true } },
      },
      take: 20,
    }),

    // 2. Books with missing author or description
    prisma.book.findMany({
      where: {
        OR: [{ author: null }, { description: null }, { coverUrl: null }],
      },
      select: {
        id: true,
        title: true,
        author: true,
        description: true,
        coverUrl: true,
      },
      take: 20,
    }),

    // 3. Unpublished books
    prisma.book.findMany({
      where: {
        status: { not: "PUBLISHED" },
      },
      select: {
        id: true,
        title: true,
        status: true,
        language: true,
        createdAt: true,
      },
      take: 20,
    }),

    // 4. Low-confidence OCR pages (< 70%)
    prisma.bookPage.findMany({
      where: {
        ocrConfidence: { lt: 70 },
      },
      select: {
        id: true,
        pageNumber: true,
        ocrConfidence: true,
        book: { select: { id: true, title: true } },
      },
      take: 20,
    }),
  ]);

  return {
    emptyChaptersCount: emptyChapters.length,
    emptyChapters,
    missingMetadataCount: missingMetadataBooks.length,
    missingMetadataBooks,
    unpublishedCount: unpublishedBooks.length,
    unpublishedBooks,
    lowConfidenceCount: lowConfidencePages.length,
    lowConfidencePages,
  };
}
