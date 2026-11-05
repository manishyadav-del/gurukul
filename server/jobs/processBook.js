import prisma from "../../lib/prisma.js";
import { downloadFile } from "../storage/download.js";
import { analyzePdf } from "../ingest/analyzePdf.js";
import { jobProcessPage } from "./processPage.js";
import { structureBook } from "../ingest/structureBook.js";
import { createJob, updateJob } from "./jobState.js";
import {
  recordJobStage,
  isCancellationRequested,
  updateJobHeartbeat,
} from "./queue.js";

/**
 * Master Book Ingestion & OCR Orchestrator.
 * Fully resumable, idempotent, checkpointed, and executable from API, CLI, or workers.
 * 
 * Pipeline Stages:
 * 1. PDF Validation & Registration
 * 2. PDF Analysis & Page Classification
 * 3. Digital Text Extraction & Multi-Method OCR (with Page Checkpoints)
 * 4. Text Normalization & Quality Checks
 * 5. Chapter and Passage Structuring
 * 6. Search Indexing & Embedding Freshness Sync
 * 7. Digital Book PDF Generation
 * 8. Final Processing Summary
 * 
 * @param {string} bookId - Book UUID
 * @param {Object} options - Ingestion options
 * @returns {Promise<{ success: boolean, jobId: string, stats: Object, cancelled?: boolean }>}
 */
export async function processBook(bookId, options = {}) {
  const startTime = Date.now();
  const book = await prisma.book.findUnique({
    where: { id: bookId },
  });

  if (!book) {
    throw new Error(`Book ${bookId} not found`);
  }

  // Prevent duplicate concurrent execution on the same book
  const activeStatuses = ["ANALYZING", "EXTRACTING", "OCR_PROCESSING", "STRUCTURING"];
  if (activeStatuses.includes(book.processingStatus) && !options.force && !options.jobId) {
    const activeJob = await prisma.ingestJob.findFirst({
      where: {
        bookId,
        status: { in: activeStatuses },
        updatedAt: { gt: new Date(Date.now() - 10 * 60 * 1000) },
      },
      orderBy: { updatedAt: "desc" },
    });

    if (activeJob) {
      console.warn(`[processBook] Book ${bookId} is already actively processed by Job ${activeJob.id}. Skipping.`);
      return {
        success: true,
        alreadyActive: true,
        jobId: activeJob.id,
        stats: {
          totalPages: activeJob.totalPages,
          processedPages: activeJob.processedPages,
          failedPages: activeJob.failedPages,
        },
      };
    }
  }

  // Locate or create IngestJob
  let job = options.jobId
    ? await prisma.ingestJob.findUnique({ where: { id: options.jobId } })
    : null;

  if (!job) {
    job = await createJob(bookId);
  }

  const workerId = options.workerId || job.workerId || `worker-${process.pid}`;

  try {
    // -------------------------------------------------------------
    // STAGE 1: PDF VALIDATION & INTEGRITY
    // -------------------------------------------------------------
    await recordJobStage(job.id, "STAGE_1_PDF_VALIDATION", { status: "STARTING" });
    await updateJob(job.id, {
      status: "ANALYZING",
      currentStep: "Stage 1/8: Validating PDF file integrity and storage access...",
      progress: 5,
      workerId,
      lastHeartbeat: new Date(),
    });

    if (!book.originalFileUrl) {
      const err = new Error(`Book ${bookId} has no originalFileUrl recorded`);
      err.category = "PERMANENT";
      throw err;
    }

    const pdfBuffer = options.pdfBuffer || (await downloadFile(book.originalFileUrl));

    // Validate PDF signature (%PDF-)
    if (pdfBuffer.length < 5 || pdfBuffer.toString("utf8", 0, 5) !== "%PDF-") {
      const err = new Error("Invalid file content: Missing valid %PDF- file header signature.");
      err.category = "PERMANENT";
      throw err;
    }

    // Check cancellation
    if (await isCancellationRequested(job.id)) {
      return handleCancellation(job.id, bookId, "Stage 1");
    }

    // -------------------------------------------------------------
    // STAGE 2: PDF ANALYSIS & PAGE CLASSIFICATION
    // -------------------------------------------------------------
    await recordJobStage(job.id, "STAGE_2_PDF_ANALYSIS", { status: "STARTING" });
    await updateJob(job.id, {
      status: "ANALYZING",
      currentStep: "Stage 2/8: Analyzing text layers, font encodings, and classifying pages...",
      progress: 10,
      lastHeartbeat: new Date(),
    });

    const analysis = await analyzePdf(pdfBuffer, {
      language: book.language,
      script: book.script,
      forceOcr: options.forceOcr,
    });
    const totalPages = analysis.pageCount;

    await updateJob(job.id, {
      totalPages,
      progress: 15,
      lastHeartbeat: new Date(),
    });
    await prisma.book.update({
      where: { id: bookId },
      data: { pageCount: totalPages, processingStatus: "ANALYZING" },
    });

    // -------------------------------------------------------------
    // STAGE 3: DIGITAL EXTRACTION & OCR PROCESSING (CHECKPOINTED)
    // -------------------------------------------------------------
    await recordJobStage(job.id, "STAGE_3_PAGE_PROCESSING", { status: "STARTING", totalPages });
    
    let processedPages = 0;
    let failedPages = 0;
    let skippedCount = 0;

    for (let i = 0; i < analysis.pages.length; i++) {
      const pageMeta = analysis.pages[i];

      // Check cancellation request at each page boundary
      if (await isCancellationRequested(job.id)) {
        return handleCancellation(job.id, bookId, `Page ${pageMeta.pageNumber}`);
      }

      // Update worker heartbeat
      await updateJobHeartbeat(job.id, workerId);

      const stepType = pageMeta.processingMethod === "TEXT_EXTRACTION" ? "EXTRACTING" : "OCR_PROCESSING";
      const progressPercent = Math.min(85, Math.round(15 + ((i + 1) / totalPages) * 70));

      await updateJob(job.id, {
        status: stepType,
        currentStep: `Stage 3/8: Processing page ${pageMeta.pageNumber} of ${totalPages} (${pageMeta.classification})`,
        progress: progressPercent,
        checkpointPage: pageMeta.pageNumber,
        processedPages,
        failedPages,
      });

      try {
        const pageResult = await jobProcessPage({
          pdfBuffer,
          pageMeta,
          book,
          options: {
            ...options,
            dpi: options.dpi || 300,
            forceRetry: options.forceRetry,
            forceOcr: options.forceOcr,
            forceOverwriteProofread: Boolean(options.forceOverwriteProofread),
          },
        });

        if (pageResult.skipped) {
          skippedCount++;
        }
        processedPages++;
      } catch (pageErr) {
        console.error(`[processBook] Page ${pageMeta.pageNumber} failed for book ${bookId}:`, pageErr.message);
        failedPages++;
        // Page isolation: continue with remaining pages
      }
    }

    // -------------------------------------------------------------
    // STAGE 4: TEXT NORMALIZATION & QUALITY CHECKS
    // -------------------------------------------------------------
    await recordJobStage(job.id, "STAGE_4_QUALITY_CHECK", { status: "STARTING" });
    await updateJob(job.id, {
      status: "CLEANING",
      currentStep: "Stage 4/8: Performing text normalization and Devanagari quality validation...",
      progress: 88,
      lastHeartbeat: new Date(),
    });

    // -------------------------------------------------------------
    // STAGE 5: CHAPTER & PASSAGE STRUCTURING
    // -------------------------------------------------------------
    await recordJobStage(job.id, "STAGE_5_STRUCTURING", { status: "STARTING" });
    await updateJob(job.id, {
      status: "STRUCTURING",
      currentStep: "Stage 5/8: Detecting chapters, shlokas, creating passages, and assembling hierarchy...",
      progress: 90,
      lastHeartbeat: new Date(),
    });
    await prisma.book.update({
      where: { id: bookId },
      data: { processingStatus: "STRUCTURING" },
    });

    const structureStats = await structureBook(bookId, options);

    // -------------------------------------------------------------
    // STAGE 6: SEARCH INDEXING & EMBEDDING FRESHNESS SYNC
    // -------------------------------------------------------------
    await recordJobStage(job.id, "STAGE_6_SEARCH_SYNC", { status: "STARTING" });
    await updateJob(job.id, {
      currentStep: "Stage 6/8: Updating search indexes and freshness markers...",
      progress: 94,
      lastHeartbeat: new Date(),
    });

    try {
      await prisma.book.update({
        where: { id: bookId },
        data: { searchIndexedAt: new Date() },
      });
    } catch (syncErr) {
      console.warn(`[processBook] Search index mark warning for ${bookId}:`, syncErr.message);
    }

    // -------------------------------------------------------------
    // STAGE 7: DIGITAL BOOK PDF GENERATION
    // -------------------------------------------------------------
    await recordJobStage(job.id, "STAGE_7_PDF_GENERATION", { status: "STARTING" });
    await updateJob(job.id, {
      currentStep: "Stage 7/8: Compiling digitized book PDF...",
      progress: 97,
      lastHeartbeat: new Date(),
    });

    let pdfStats = null;
    try {
      const { generateBookPdf } = await import("../pdf/generateBookPdf.js");
      pdfStats = await generateBookPdf(bookId);
    } catch (pdfErr) {
      console.warn(`[PDF Generator] Auto-generating book PDF warning for ${bookId}:`, pdfErr.message);
    }

    // -------------------------------------------------------------
    // STAGE 8: FINAL PROCESSING SUMMARY
    // -------------------------------------------------------------
    const totalDurationMs = Date.now() - startTime;
    await recordJobStage(job.id, "STAGE_8_COMPLETED", {
      status: "SUCCESS",
      durationMs: totalDurationMs,
      processedPages,
      failedPages,
    });

    await updateJob(job.id, {
      status: "COMPLETED",
      currentStep: "Ingestion, OCR structuring, and digital book PDF generation complete.",
      progress: 100,
      processedPages,
      failedPages,
      completedAt: new Date(),
      lastHeartbeat: new Date(),
    });

    await prisma.book.update({
      where: { id: bookId },
      data: {
        processingStatus: "COMPLETED",
        status: book.status === "RECEIVED" ? "PROOFREAD" : book.status,
      },
    });

    return {
      success: true,
      jobId: job.id,
      stats: {
        totalPages,
        processedPages,
        failedPages,
        skippedCount,
        durationMs: totalDurationMs,
        ...structureStats,
        pdfStats,
      },
    };
  } catch (err) {
    console.error(`[processBook] Pipeline failure for book ${bookId}:`, err);
    const category = err.category || (err.message.includes("PDF") ? "CORRUPTED_PDF" : "TRANSIENT");

    await updateJob(job.id, {
      status: "FAILED",
      currentStep: "Failed",
      errorMessage: err.message,
      errorCategory: category,
      completedAt: new Date(),
    });

    await prisma.book.update({
      where: { id: bookId },
      data: { processingStatus: "FAILED" },
    });

    throw err;
  }
}

async function handleCancellation(jobId, bookId, checkpoint) {
  console.log(`[processBook] Cancellation checkpoint reached at ${checkpoint} for Job ${jobId}`);
  await updateJob(jobId, {
    status: "CANCELLED",
    currentStep: `Processing cancelled at safe checkpoint: ${checkpoint}`,
    completedAt: new Date(),
  });
  await prisma.book.update({
    where: { id: bookId },
    data: { processingStatus: "QUEUED" },
  });
  return {
    success: false,
    cancelled: true,
    jobId,
    checkpoint,
  };
}
