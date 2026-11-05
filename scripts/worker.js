#!/usr/bin/env node
/**
 * Standalone Durable OCR Worker — Gurukul Astrology
 *
 * Continuously polls PostgreSQL queue using transactional claims,
 * sends heartbeats, detects stalled jobs, handles graceful shutdown,
 * and processes jobs through the 8-stage pipeline.
 *
 * PRODUCTION DEPLOYMENT:
 *   node scripts/worker.js
 *   # Or via PM2:
 *   pm2 start scripts/worker.js --name ocr-worker
 *
 * REQUIRED ENVIRONMENT VARIABLES:
 *   DATABASE_URL             PostgreSQL connection string
 *   OCR_ENGINE               tesseract (default)
 *   OCR_LANGUAGE             eng+hin+san (default)
 *   WORKER_POLL_INTERVAL_MS   polling interval in ms (default 3000)
 */

import { PrismaClient } from "@prisma/client";
import { processBook } from "../server/jobs/processBook.js";
import {
  claimNextJob,
  updateJobHeartbeat,
  recoverStalledJobs,
} from "../server/jobs/queue.js";

const prisma = new PrismaClient({ log: ["error", "warn"] });
const POLL_INTERVAL_MS = parseInt(process.env.WORKER_POLL_INTERVAL_MS || "3000", 10);
const HEARTBEAT_INTERVAL_MS = 10000;
const WORKER_ID = `ocr-worker-${process.pid}-${Date.now().toString(36)}`;

console.log(`[OCR Worker] Starting Gurukul Worker ID: ${WORKER_ID}`);
console.log(`[OCR Worker] Poll interval: ${POLL_INTERVAL_MS}ms | Heartbeat: ${HEARTBEAT_INTERVAL_MS}ms`);
console.log(`[OCR Worker] Engine: ${process.env.OCR_ENGINE || "tesseract"}`);

let isProcessing = false;
let isShuttingDown = false;
let currentJobId = null;
let heartbeatTimer = null;

async function processNextJob() {
  if (isProcessing || isShuttingDown) return;

  try {
    const job = await claimNextJob(WORKER_ID);
    if (!job) return;

    isProcessing = true;
    currentJobId = job.id;
    console.log(`[OCR Worker] [CLAIMED] Job ${job.id} for Book "${job.book?.title || job.bookId}" (Priority: ${job.priority || 0})`);

    // Start periodic heartbeat
    heartbeatTimer = setInterval(async () => {
      if (currentJobId) {
        await updateJobHeartbeat(currentJobId, WORKER_ID);
      }
    }, HEARTBEAT_INTERVAL_MS);

    try {
      const result = await processBook(job.bookId, {
        jobId: job.id,
        workerId: WORKER_ID,
        forceOcr: job.options?.forceOcr,
        forceRetry: job.options?.forceRetry,
        forceOverwriteProofread: job.options?.forceOverwriteProofread,
        dpi: job.options?.dpi,
      });

      if (result.cancelled) {
        console.log(`[OCR Worker] [CANCELLED] Job ${job.id} halted safely at checkpoint ${result.checkpoint}`);
      } else {
        console.log(
          `[OCR Worker] [SUCCESS] Job ${job.id} completed in ${Math.round((result.stats?.durationMs || 0) / 1000)}s: ` +
          `${result.stats?.processedPages || 0} pages, ` +
          `${result.stats?.failedPages || 0} failed, ` +
          `${result.stats?.chaptersCount || 0} chapters, ` +
          `${result.stats?.passagesCount || 0} passages.`
        );
      }
    } catch (jobError) {
      console.error(`[OCR Worker] [ERROR] Job ${job.id} failed:`, jobError.message);
    } finally {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
      currentJobId = null;
      isProcessing = false;
    }
  } catch (error) {
    console.error("[OCR Worker] Queue poll error:", error.message);
    isProcessing = false;
  }
}

async function shutdown(signal) {
  console.log(`[OCR Worker] ${signal} received. Initiating graceful shutdown...`);
  isShuttingDown = true;

  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
  }

  if (isProcessing && currentJobId) {
    console.log(`[OCR Worker] Waiting for current page checkpoint on Job ${currentJobId}...`);
    // Allow up to 10 seconds for current checkpoint to complete
    let waitCount = 0;
    while (isProcessing && waitCount < 20) {
      await new Promise((r) => setTimeout(r, 500));
      waitCount++;
    }
  }

  await prisma.$disconnect();
  console.log("[OCR Worker] Graceful shutdown completed.");
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Start polling loop
const pollInterval = setInterval(processNextJob, POLL_INTERVAL_MS);
processNextJob();
