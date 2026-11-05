import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireOcrPermission } from "@/server/security/authGuard";
import { enqueueBookJob } from "@/server/jobs/queue";
import { logAdminActivity } from "@/server/admin/audit";

/**
 * POST /api/books/[id]/process
 * Enqueues the full OCR ingestion pipeline for a book into the durable queue.
 * Returns promptly with job identifier and status endpoint.
 */
export async function POST(request, { params }) {
  try {
    const auth = await requireOcrPermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;
    const { id } = await params;

    const book = await prisma.book.findUnique({
      where: { id },
      select: { id: true, title: true, originalFileUrl: true, processingStatus: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (!book.originalFileUrl) {
      return NextResponse.json(
        { error: "No PDF file found for this book. Upload a PDF first via POST /api/books." },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const forceRetry = Boolean(body?.forceRetry);
    const forceOcr = Boolean(body?.forceOcr);
    const forceOverwriteProofread = Boolean(body?.forceOverwriteProofread);
    const dpi = body?.dpi ? Math.min(600, Math.max(150, parseInt(body.dpi, 10))) : 300;
    const priority = body?.priority !== undefined ? parseInt(body.priority, 10) : 0;

    // Guard against accidental proofreading overwrite
    if (forceOverwriteProofread && user.role !== "SUPER_ADMIN" && user.role !== "ADMIN" && user.role !== "OCR_MANAGER") {
      return NextResponse.json(
        { error: "Forbidden: Only Administrators or OCR Managers can force overwrite proofread pages." },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const isSync = url.searchParams.get("sync") === "true";

    if (isSync) {
      // Synchronous execution path for CLI test suites that require inline completion
      const { processBook } = await import("@/server/jobs/processBook.js");
      const result = await processBook(id, {
        forceRetry,
        forceOcr,
        forceOverwriteProofread,
        dpi,
      });

      return NextResponse.json({
        success: true,
        jobId: result.jobId,
        stats: result.stats,
        message: "Ingestion pipeline completed.",
      });
    }

    // Default: Asynchronous durable queue enqueue
    const queueResult = await enqueueBookJob(id, {
      forceRetry,
      forceOcr,
      forceOverwriteProofread,
      dpi,
      priority,
    });

    await logAdminActivity({
      actorId: user.id,
      actorEmail: user.email || user.id,
      actorRole: user.role,
      action: "OCR_JOB_ENQUEUE",
      targetResource: "Book",
      targetId: id,
      status: "SUCCESS",
      details: {
        jobId: queueResult.job?.id,
        dpi,
        forceOcr,
        isNew: queueResult.isNew,
      },
    });

    return NextResponse.json({
      success: true,
      jobId: queueResult.job?.id,
      status: queueResult.job?.status || "QUEUED",
      statusUrl: `/api/ingest/${queueResult.job?.id}`,
      message: queueResult.isNew
        ? "OCR ingestion job enqueued successfully."
        : "Active job already exists for this book.",
    });
  } catch (error) {
    console.error("POST /api/books/[id]/process error:", error);
    return NextResponse.json({ error: "Failed to enqueue processing job", details: error.message }, { status: 500 });
  }
}
