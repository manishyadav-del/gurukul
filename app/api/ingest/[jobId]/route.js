import { NextResponse } from "next/server";
import { getJob, updateJob } from "@/server/jobs/jobState";
import prisma from "@/lib/prisma";
import { requireOcrPermission, getAuthenticatedUser } from "@/server/security/authGuard";
import { canReviewBooks } from "@/lib/permissions";
import { enqueueBookJob, requestJobCancellation } from "@/server/jobs/queue";
import { logAdminActivity } from "@/server/admin/audit";

// GET /api/ingest/[jobId]
export async function GET(request, { params }) {
  try {
    const { jobId } = await params;
    const job = await getJob(jobId);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Protect draft/in-progress book job details from unauthorized public viewing
    if (job.book?.status !== "PUBLISHED") {
      const user = await getAuthenticatedUser(request);
      if (!user || !canReviewBooks(user)) {
        return NextResponse.json(
          { error: "Forbidden: Manuscript ingestion status is restricted" },
          { status: 403 }
        );
      }
    }

    // Calculate actual elapsed duration and throughput
    let durationSec = null;
    let pagesPerMinute = null;
    if (job.startedAt) {
      const endTime = job.completedAt ? new Date(job.completedAt).getTime() : Date.now();
      durationSec = Math.max(1, Math.round((endTime - new Date(job.startedAt).getTime()) / 1000));
      if (job.processedPages > 0) {
        pagesPerMinute = Math.round((job.processedPages / (durationSec / 60)) * 10) / 10;
      }
    }

    const isReviewer = user && canReviewBooks(user);

    const jobPayload = {
      id: job.id,
      bookId: job.bookId,
      status: job.status,
      currentStep: isReviewer ? job.currentStep : "Processing",
      progress: job.progress,
      totalPages: job.totalPages,
      processedPages: job.processedPages,
      failedPages: isReviewer ? job.failedPages : 0,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      durationSec,
      pagesPerMinute,
      book: job.book,
    };

    if (isReviewer) {
      jobPayload.checkpointPage = job.checkpointPage;
      jobPayload.priority = job.priority;
      jobPayload.attempts = job.attempts;
      jobPayload.maxAttempts = job.maxAttempts;
      jobPayload.errorCategory = job.errorCategory;
      jobPayload.errorMessage = job.errorMessage;
      jobPayload.lastHeartbeat = job.lastHeartbeat;
      jobPayload.workerId = job.workerId;
      jobPayload.cancelRequested = job.cancelRequested;
      jobPayload.stageHistory = job.stageHistory;
      jobPayload.options = job.options;
    }

    return NextResponse.json({
      job: jobPayload,
    });
  } catch (error) {
    console.error("GET /api/ingest/[jobId] error:", error);
    return NextResponse.json({ error: "Failed to fetch job", details: error.message }, { status: 500 });
  }
}

// POST /api/ingest/[jobId] — retry, resume, or cancel a job
export async function POST(request, { params }) {
  try {
    const { jobId } = await params;
    const auth = await requireOcrPermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const job = await prisma.ingestJob.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        bookId: true,
        status: true,
        options: true,
        cancelRequested: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action || "retry";

    if (action === "cancel") {
      await requestJobCancellation(job.id);
      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email || user.id,
        actorRole: user.role,
        action: "OCR_JOB_CANCEL_REQUESTED",
        targetResource: "IngestJob",
        targetId: jobId,
        status: "SUCCESS",
        details: { bookId: job.bookId },
      });
      return NextResponse.json({
        success: true,
        message: "Cancellation requested. Worker will stop processing at the next page checkpoint.",
      });
    }

    if (action === "resume" || action === "retry") {
      const queueResult = await enqueueBookJob(job.bookId, {
        ...(job.options || {}),
        forceRetry: true,
        priority: 2, // High priority for manual retries
      });

      await logAdminActivity({
        actorId: user.id,
        actorEmail: user.email || user.id,
        actorRole: user.role,
        action: "OCR_JOB_RETRY",
        targetResource: "IngestJob",
        targetId: jobId,
        status: "SUCCESS",
        details: { bookId: job.bookId, newJobId: queueResult.job?.id },
      });

      return NextResponse.json({
        success: true,
        jobId: queueResult.job?.id,
        status: "QUEUED",
        message: "Job successfully re-enqueued for background processing.",
      });
    }

    return NextResponse.json({ error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error("POST /api/ingest/[jobId] error:", error);
    return NextResponse.json({ error: "Failed to process job command", details: error.message }, { status: 500 });
  }
}
