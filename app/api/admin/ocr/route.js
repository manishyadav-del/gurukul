import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import { getQueueMetrics, enqueueBookJob, recoverStalledJobs, requestJobCancellation } from "@/server/jobs/queue";
import { retryPage } from "@/server/jobs/retryPage";
import { logAdminActivity } from "@/server/admin/audit";

export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.OCR_READ);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const jobStatus = searchParams.get("status") || undefined;
    const search = searchParams.get("q") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const queueMetrics = await getQueueMetrics();

    // Query filters for jobs
    const jobWhere = {};
    if (jobStatus) {
      jobWhere.status = jobStatus;
    }
    if (search) {
      jobWhere.book = {
        title: { contains: search, mode: "insensitive" },
      };
    }

    const [
      totalPages,
      extractedPages,
      ocrCompletedPages,
      proofreadPages,
      lowConfidencePages,
      unresolvedErrorsCount,
      avgDurationResult,
      totalJobsCount,
      jobs,
      flaggedPages,
    ] = await Promise.all([
      prisma.bookPage.count(),
      prisma.bookPage.count({ where: { processingMethod: "TEXT_EXTRACTION", ocrCompleted: true } }),
      prisma.bookPage.count({ where: { processingMethod: "OCR", ocrCompleted: true } }),
      prisma.bookPage.count({ where: { proofread: true } }),
      // Fixed: ocrConfidence is 0.00 - 1.00 float scale
      prisma.bookPage.count({ where: { ocrConfidence: { lt: 0.75, not: null } } }),
      prisma.ocrError.count({ where: { resolved: false } }),
      prisma.bookPage.aggregate({
        _avg: { processingDurationMs: true },
        where: { processingDurationMs: { gt: 0 } },
      }),
      prisma.ingestJob.count({ where: jobWhere }),
      prisma.ingestJob.findMany({
        where: jobWhere,
        skip,
        take: limit,
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        include: {
          book: {
            select: { id: true, title: true, slug: true, language: true },
          },
        },
      }),
      prisma.bookPage.findMany({
        where: {
          OR: [
            { ocrCompleted: false },
            { ocrConfidence: { lt: 0.75 } },
            { ocrErrors: { some: { resolved: false } } },
          ],
        },
        take: 30,
        orderBy: [{ retryCount: "desc" }, { updatedAt: "desc" }],
        include: {
          book: {
            select: { id: true, title: true, slug: true, language: true },
          },
          ocrErrors: {
            where: { resolved: false },
            take: 1,
            orderBy: { createdAt: "desc" },
          },
        },
      }),
    ]);

    const avgDurationMs = Math.round(avgDurationResult._avg.processingDurationMs || 0);

    const stats = {
      totalPages,
      extractedPages,
      ocrCompletedPages,
      proofreadPages,
      pendingProofread: Math.max(0, totalPages - proofreadPages),
      lowConfidencePages,
      unresolvedErrorsCount,
      activeJobsCount: queueMetrics.activeCount,
      queuedJobsCount: queueMetrics.queuedCount,
      failedJobsCount: queueMetrics.failedCount,
      completedJobsCount: queueMetrics.completedCount,
      stalledJobsCount: queueMetrics.stalledCount,
      oldestQueuedAgeSec: queueMetrics.oldestQueuedAgeSec,
      activeWorkerCount: queueMetrics.activeWorkerCount,
      lastWorkerHeartbeat: queueMetrics.lastWorkerHeartbeat,
      avgPageDurationMs: avgDurationMs,
      // Calculate realistic OCR success rate
      ocrSuccessRate: totalPages > 0
        ? Math.round(((totalPages - unresolvedErrorsCount) / totalPages) * 1000) / 10
        : 100,
    };

    return NextResponse.json({
      stats,
      jobs,
      flaggedPages,
      pagination: {
        page,
        limit,
        total: totalJobsCount,
        totalPages: Math.ceil(totalJobsCount / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/ocr error:", error);
    return NextResponse.json({ error: "Failed to load OCR operational status" }, { status: 500 });
  }
}

// POST /api/admin/ocr — Bulk operations: bulk retry failed pages, bulk job retry
export async function POST(request) {
  const auth = await requireAdmin(request, PERMISSIONS.OCR_WRITE);
  if (!auth.authorized) return auth.response;
  const user = auth.admin.user;

  try {
    const body = await request.json();
    const action = body.action;

    if (action === "bulk_retry_flagged") {
      const pageIds = Array.isArray(body.pageIds) ? body.pageIds : [];
      if (pageIds.length === 0) {
        return NextResponse.json({ error: "No pageIds supplied for bulk retry" }, { status: 400 });
      }

      // Limit bulk retry batch size to 20 to protect worker capacity
      const batchIds = pageIds.slice(0, 20);
      const results = [];

      for (const pageId of batchIds) {
        try {
          const retried = await retryPage(pageId, {
            forceOcr: true,
            dpi: body.dpi || 300,
            forceOverwriteProofread: false, // Never overwrite proofread text in bulk retries!
          });
          results.push({ pageId, success: true, pageNumber: retried.page.pageNumber });
        } catch (pageErr) {
          results.push({ pageId, success: false, error: pageErr.message });
        }
      }

      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "OCR_BULK_RETRY_PAGES",
        targetResource: "BookPage",
        status: "SUCCESS",
        details: {
          requestedCount: pageIds.length,
          processedCount: batchIds.length,
          successful: results.filter((r) => r.success).length,
        },
      });

      return NextResponse.json({
        success: true,
        results,
        message: `Processed ${results.length} pages: ${results.filter((r) => r.success).length} succeeded, ${results.filter((r) => !r.success).length} failed.`,
      });
    }

    if (action === "recover_stalled_jobs") {
      const recovered = await recoverStalledJobs();
      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "OCR_RECOVER_STALLED_JOBS",
        targetResource: "IngestJob",
        status: "SUCCESS",
        details: { recoveredCount: recovered.recoveredCount },
      });

      return NextResponse.json({
        success: true,
        recoveredCount: recovered.recoveredCount,
        message: `Resurrected ${recovered.recoveredCount} stalled jobs back to QUEUED status.`,
      });
    }

    if (action === "cancel_job") {
      const { jobId } = body;
      if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

      await requestJobCancellation(jobId);
      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "OCR_CANCEL_JOB",
        targetResource: "IngestJob",
        targetId: jobId,
        status: "SUCCESS",
      });

      return NextResponse.json({ success: true, message: `Job ${jobId} cancellation requested.` });
    }

    if (action === "retry_job") {
      const { bookId } = body;
      if (!bookId) return NextResponse.json({ error: "bookId required" }, { status: 400 });

      const enqueued = await enqueueBookJob(bookId, { forceRetry: true });
      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "OCR_RETRY_BOOK_JOB",
        targetResource: "IngestJob",
        targetId: enqueued.job?.id,
        status: "SUCCESS",
        details: { bookId },
      });

      return NextResponse.json({
        success: true,
        job: enqueued.job,
        message: `Book processing job re-enqueued successfully.`,
      });
    }

    if (action === "reprocess_range") {
      const { bookId, startPage, endPage, dpi = 300 } = body;
      if (!bookId) return NextResponse.json({ error: "bookId required" }, { status: 400 });
      const start = parseInt(startPage, 10);
      const end = parseInt(endPage, 10);
      if (isNaN(start) || isNaN(end) || start > end) {
        return NextResponse.json({ error: "Valid startPage and endPage required" }, { status: 400 });
      }

      const pagesToReprocess = await prisma.bookPage.findMany({
        where: {
          bookId,
          pageNumber: { gte: start, lte: end },
          proofread: false, // Never overwrite human proofread text
        },
        orderBy: { pageNumber: "asc" },
        take: 30, // Cap to 30 pages to protect worker capacity
        select: { id: true, pageNumber: true },
      });

      const results = [];
      for (const p of pagesToReprocess) {
        try {
          await retryPage(p.id, {
            forceOcr: true,
            dpi,
            forceOverwriteProofread: false,
          });
          results.push({ pageId: p.id, pageNumber: p.pageNumber, success: true });
        } catch (pageErr) {
          results.push({ pageId: p.id, pageNumber: p.pageNumber, success: false, error: pageErr.message });
        }
      }

      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        action: "OCR_REPROCESS_PAGE_RANGE",
        targetResource: "BookPage",
        status: "SUCCESS",
        details: {
          bookId,
          startPage: start,
          endPage: end,
          eligibleCount: pagesToReprocess.length,
          successful: results.filter((r) => r.success).length,
        },
      });

      return NextResponse.json({
        success: true,
        results,
        message: `Reprocessed ${results.filter((r) => r.success).length} of ${pagesToReprocess.length} eligible pages in range [${start} - ${end}].`,
      });
    }

    return NextResponse.json({ error: `Unsupported bulk action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error("POST /api/admin/ocr error:", error);
    return NextResponse.json({ error: "Bulk operation failed", details: error.message }, { status: 500 });
  }
}
