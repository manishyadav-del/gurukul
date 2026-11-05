import prisma from "../../lib/prisma.js";

/**
 * Durable PostgreSQL-backed Job Queue for Gurukul OCR Pipeline.
 * Zero external infrastructure dependencies required.
 * Handles priority, lease claiming, heartbeats, recovery of stalled workers,
 * bounded concurrency, stage checkpoints, and graceful cancellation.
 */

const STALLED_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes without heartbeat = stalled

/**
 * Enqueue a book for background processing.
 * Idempotent: If an active job exists, returns that job instead of creating a duplicate.
 * 
 * @param {string} bookId - Book UUID
 * @param {Object} options - Options (priority, dpi, forceOcr, forceRetry, forceOverwriteProofread, engine)
 * @returns {Promise<{ success: boolean, job: Object, isNew: boolean }>}
 */
export async function enqueueBookJob(bookId, options = {}) {
  const activeStatuses = ["QUEUED", "ANALYZING", "EXTRACTING", "OCR_PROCESSING", "STRUCTURING"];
  
  // 1. Check for an active job on this book
  const existingJob = await prisma.ingestJob.findFirst({
    where: {
      bookId,
      status: { in: activeStatuses },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existingJob && !options.forceRetry) {
    // If job was last updated more than 10 mins ago without heartbeat, consider it abandoned and re-queue it
    const isStalled = existingJob.lastHeartbeat
      ? Date.now() - new Date(existingJob.lastHeartbeat).getTime() > STALLED_THRESHOLD_MS
      : Date.now() - new Date(existingJob.updatedAt).getTime() > STALLED_THRESHOLD_MS * 2;

    if (!isStalled) {
      return {
        success: true,
        job: existingJob,
        isNew: false,
        message: `Book is already in progress under job ${existingJob.id}`,
      };
    }

    // Reset stalled job to QUEUED
    const resurrectedJob = await prisma.ingestJob.update({
      where: { id: existingJob.id },
      data: {
        status: "QUEUED",
        currentStep: "Resurrected from stalled state. Re-enqueued.",
        attempts: { increment: 1 },
        lastHeartbeat: null,
        workerId: null,
        cancelRequested: false,
        options: options || existingJob.options,
      },
    });

    return {
      success: true,
      job: resurrectedJob,
      isNew: false,
      resurrected: true,
    };
  }

  // 2. Create brand-new durable job
  const priority = Number.isInteger(options.priority) ? options.priority : 0;

  const job = await prisma.ingestJob.create({
    data: {
      bookId,
      status: "QUEUED",
      currentStep: "Job enqueued. Waiting for background worker...",
      progress: 0,
      priority,
      options: options || {},
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      checkpointPage: 0,
      stageHistory: [
        {
          stage: "ENQUEUED",
          timestamp: new Date().toISOString(),
          status: "SUCCESS",
        },
      ],
    },
  });

  // Keep Book processingStatus aligned
  await prisma.book.update({
    where: { id: bookId },
    data: { processingStatus: "QUEUED" },
  });

  return {
    success: true,
    job,
    isNew: true,
  };
}

/**
 * Atomically claim the next highest priority, oldest QUEUED job.
 * Sets workerId and initial heartbeat.
 * 
 * @param {string} workerId - Unique identifier of worker process
 * @returns {Promise<Object|null>} Claimed IngestJob or null
 */
export async function claimNextJob(workerId) {
  // First, recover any stalled jobs
  await recoverStalledJobs();

  // Find candidate jobs
  return await prisma.$transaction(async (tx) => {
    const candidate = await tx.ingestJob.findFirst({
      where: {
        status: "QUEUED",
        cancelRequested: false,
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "asc" },
      ],
    });

    if (!candidate) {
      return null;
    }

    // Atomically claim candidate
    const claimed = await tx.ingestJob.update({
      where: { id: candidate.id },
      data: {
        status: "ANALYZING",
        workerId,
        lastHeartbeat: new Date(),
        startedAt: candidate.startedAt || new Date(),
        attempts: { increment: 1 },
        currentStep: "Worker claimed job. Initializing processing...",
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
            originalFileUrl: true,
            language: true,
            script: true,
          },
        },
      },
    });

    return claimed;
  });
}

/**
 * Updates worker heartbeat timestamp.
 * 
 * @param {string} jobId
 * @param {string} workerId
 * @returns {Promise<boolean>}
 */
export async function updateJobHeartbeat(jobId, workerId) {
  try {
    await prisma.ingestJob.updateMany({
      where: { id: jobId, workerId },
      data: { lastHeartbeat: new Date() },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if cancellation has been requested for a job.
 * 
 * @param {string} jobId
 * @returns {Promise<boolean>}
 */
export async function isCancellationRequested(jobId) {
  const job = await prisma.ingestJob.findUnique({
    where: { id: jobId },
    select: { cancelRequested: true, status: true },
  });
  return Boolean(job?.cancelRequested || job?.status === "CANCELLED");
}

/**
 * Requests cancellation of a job. Processing will stop at the next page checkpoint.
 * 
 * @param {string} jobId
 * @returns {Promise<Object>}
 */
export async function requestJobCancellation(jobId) {
  return await prisma.ingestJob.update({
    where: { id: jobId },
    data: { cancelRequested: true },
  });
}

/**
 * Records a pipeline stage transition in stageHistory.
 * 
 * @param {string} jobId
 * @param {string} stageName
 * @param {Object} details
 */
export async function recordJobStage(jobId, stageName, details = {}) {
  try {
    const job = await prisma.ingestJob.findUnique({
      where: { id: jobId },
      select: { stageHistory: true },
    });

    const history = Array.isArray(job?.stageHistory) ? job.stageHistory : [];
    history.push({
      stage: stageName,
      timestamp: new Date().toISOString(),
      ...details,
    });

    await prisma.ingestJob.update({
      where: { id: jobId },
      data: { stageHistory: history },
    });
  } catch (err) {
    console.warn(`[Queue] Failed to record stage ${stageName} for job ${jobId}:`, err.message);
  }
}

/**
 * Scans for active jobs whose workers have stopped heartbeating.
 * Marks them stalled or re-queues them if attempts < maxAttempts.
 */
export async function recoverStalledJobs(staleThresholdMs = STALLED_THRESHOLD_MS) {
  const staleCutoff = new Date(Date.now() - staleThresholdMs);
  const activeStatuses = ["ANALYZING", "EXTRACTING", "OCR_PROCESSING", "STRUCTURING"];

  try {
    const stalledJobs = await prisma.ingestJob.findMany({
      where: {
        status: { in: activeStatuses },
        OR: [
          { lastHeartbeat: { lt: staleCutoff } },
          { lastHeartbeat: null, updatedAt: { lt: staleCutoff } },
        ],
      },
      take: 10,
    });

    for (const job of stalledJobs) {
      if (job.attempts < job.maxAttempts) {
        console.warn(`[Queue Recovery] Job ${job.id} heartbeat timed out. Re-queuing (attempt ${job.attempts + 1}/${job.maxAttempts})...`);
        await prisma.ingestJob.update({
          where: { id: job.id },
          data: {
            status: "QUEUED",
            currentStep: `Recovered from stalled worker (attempt ${job.attempts + 1}). Ready to resume.`,
            workerId: null,
            lastHeartbeat: null,
          },
        });
      } else {
        console.error(`[Queue Recovery] Job ${job.id} exceeded max retry attempts (${job.attempts}). Marking FAILED.`);
        await prisma.ingestJob.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            currentStep: "Stalled: Worker heartbeat lost and max retry attempts exceeded.",
            errorMessage: "Worker crashed or disconnected without heartbeat.",
            errorCategory: "STALLED_WORKER_TIMEOUT",
            completedAt: new Date(),
          },
        });
        await prisma.book.update({
          where: { id: job.bookId },
          data: { processingStatus: "FAILED" },
        });
      }
    }
  } catch (err) {
    console.error("[Queue Recovery] Failed to check stalled jobs:", err.message);
  }
}

/**
 * Collects live queue metrics for admin monitoring.
 * 
 * @returns {Promise<Object>}
 */
export async function getQueueMetrics() {
  const staleCutoff = new Date(Date.now() - STALLED_THRESHOLD_MS);
  const activeStatuses = ["ANALYZING", "EXTRACTING", "OCR_PROCESSING", "STRUCTURING"];

  const [
    queuedCount,
    activeCount,
    completedCount,
    failedCount,
    cancelledCount,
    stalledCount,
    oldestQueued,
    activeWorkers,
  ] = await Promise.all([
    prisma.ingestJob.count({ where: { status: "QUEUED" } }),
    prisma.ingestJob.count({ where: { status: { in: activeStatuses } } }),
    prisma.ingestJob.count({ where: { status: "COMPLETED" } }),
    prisma.ingestJob.count({ where: { status: "FAILED" } }),
    prisma.ingestJob.count({ where: { status: "CANCELLED" } }),
    prisma.ingestJob.count({
      where: {
        status: { in: activeStatuses },
        OR: [
          { lastHeartbeat: { lt: staleCutoff } },
          { lastHeartbeat: null, updatedAt: { lt: staleCutoff } },
        ],
      },
    }),
    prisma.ingestJob.findFirst({
      where: { status: "QUEUED" },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    }),
    prisma.ingestJob.findMany({
      where: {
        status: { in: activeStatuses },
        lastHeartbeat: { gte: staleCutoff },
        workerId: { not: null },
      },
      distinct: ["workerId"],
      select: { workerId: true, lastHeartbeat: true },
    }),
  ]);

  const oldestQueuedAgeSec = oldestQueued
    ? Math.round((Date.now() - new Date(oldestQueued.createdAt).getTime()) / 1000)
    : 0;

  return {
    queuedCount,
    activeCount,
    completedCount,
    failedCount,
    cancelledCount,
    stalledCount,
    oldestQueuedAgeSec,
    activeWorkerCount: activeWorkers.length,
    lastWorkerHeartbeat: activeWorkers[0]?.lastHeartbeat || null,
  };
}
