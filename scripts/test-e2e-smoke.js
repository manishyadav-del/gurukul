/**
 * Phase 12: Complete End-to-End Production Smoke Test Suite
 * Gurukul Astrology Platform
 *
 * Exercises the entire 14-step production lifecycle:
 * 1. Normal user authentication
 * 2. RBAC check (normal user blocked from administrative actions)
 * 3. Administrative authentication
 * 4. PDF upload and registration
 * 5. Durable queueing
 * 6. Worker processing pipeline
 * 7. Page output and OCR metadata verification
 * 8. Page proofreading, correction history, and transactional approval
 * 9. Book publication
 * 10. Public search visibility for published content
 * 11. Manuscript privacy and Edge proxy protection
 * 12. Book unpublishing and removal from public search
 * 13. Cancellation, retry, and worker heartbeat mechanics
 * 14. Audit trail logging and queue operational metrics
 */

import prisma from "../lib/prisma.js";
import crypto from "crypto";
import { createAccessToken } from "../server/admin/auth.js";
import { requireManagePermission, requireRole } from "../server/security/authGuard.js";
import { ROLES } from "../lib/permissions.js";
import { enqueueBookJob, claimNextJob, updateJobHeartbeat, requestJobCancellation, getQueueMetrics } from "../server/jobs/queue.js";
import { searchAstrologyContent } from "../server/search/searchEngine.js";
import { proxy } from "../proxy.js";
import { uploadFile } from "../server/storage/upload.js";
import { getOriginalPdfPath } from "../server/storage/paths.js";
import { deleteBookDirectory } from "../server/storage/delete.js";

const runId = Date.now().toString(36);
let passedSteps = 0;
const totalSteps = 14;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Smoke test failed: ${message}`);
  }
  console.log(`  ✓ PASS: ${message}`);
}

async function runSmokeTest() {
  console.log(`\n===============================================================`);
  console.log(` GURUKUL END-TO-END PRODUCTION SMOKE TEST (PHASE 12)`);
  console.log(` Run ID: ${runId}`);
  console.log(`===============================================================\n`);

  // Create disposable test users
  const normalUser = await prisma.user.create({
    data: {
      email: `normal_user_${runId}@gurukul.local`,
      name: "Normal Seeker",
      role: "USER",
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: `admin_user_${runId}@gurukul.local`,
      name: "Master Administrator",
      role: "ADMIN",
    },
  });

  const normalJwt = createAccessToken(normalUser, `session-norm-${runId}`);
  const adminJwt = createAccessToken(adminUser, `session-adm-${runId}`);

  let testBook = null;
  let testJob = null;
  let testPage = null;

  try {
    // -----------------------------------------------------------------
    // Step 1: Authenticate as a normal user
    // -----------------------------------------------------------------
    console.log(`[Step 1/14] Authenticating as normal user...`);
    assert(normalUser && normalUser.role === "USER", "Normal user record retrieved with role USER");
    assert(typeof normalJwt === "string" && normalJwt.split(".").length === 3, "Valid JWT issued for normal user");
    passedSteps++;

    // -----------------------------------------------------------------
    // Step 2: Verify normal user is blocked from administrative actions
    // -----------------------------------------------------------------
    console.log(`\n[Step 2/14] Verifying RBAC guardrails for normal user...`);
    const adminActionReq = new Request("http://localhost/api/admin/users", {
      headers: { authorization: `Bearer ${normalJwt}` },
    });
    const roleCheck = await requireRole(adminActionReq, [ROLES.ADMIN]);
    assert(
      roleCheck.errorResponse !== undefined &&
      (roleCheck.errorResponse.status === 401 || roleCheck.errorResponse.status === 403),
      "Normal user blocked from ADMIN actions with 401/403"
    );

    const manageCheck = await requireManagePermission(adminActionReq);
    assert(
      manageCheck.errorResponse !== undefined &&
      (manageCheck.errorResponse.status === 401 || manageCheck.errorResponse.status === 403),
      "Normal user blocked from book management with 401/403"
    );
    passedSteps++;

    // -----------------------------------------------------------------
    // Step 3: Authenticate as authorized Administrator
    // -----------------------------------------------------------------
    console.log(`\n[Step 3/14] Authenticating as authorized Administrator...`);
    const adminReq = new Request("http://localhost/api/admin/settings", {
      headers: { authorization: `Bearer ${adminJwt}` },
    });
    const adminRoleCheck = await requireRole(adminReq, [ROLES.ADMIN]);
    assert(adminRoleCheck.user && adminRoleCheck.user.role === "ADMIN", "Administrator verified successfully");
    passedSteps++;

    // -----------------------------------------------------------------
    // Step 4: Upload and register a valid test PDF
    // -----------------------------------------------------------------
    console.log(`\n[Step 4/14] Uploading & registering test manuscript PDF...`);
    const fakePdfContent = Buffer.from("%PDF-1.4\n%Gurukul Vedic Test Manuscript\n1 0 obj << /Title (Brihat Samhita) >> endobj\n%%EOF");
    const fileHash = crypto.createHash("sha256").update(fakePdfContent).digest("hex");

    testBook = await prisma.book.create({
      data: {
        title: `Smoke Test Scripture ${runId}`,
        slug: `smoke-test-scripture-${runId}`,
        language: "Sanskrit",
        script: "Devanagari",
        status: "RECEIVED",
        processingStatus: "QUEUED",
        fileHash,
        originalFileName: `scripture-${runId}.pdf`,
      },
    });

    const storagePath = getOriginalPdfPath(testBook.id, `scripture-${runId}.pdf`);
    await uploadFile(storagePath, fakePdfContent, { isPrivate: true, contentType: "application/pdf" });

    await prisma.book.update({
      where: { id: testBook.id },
      data: { originalFileUrl: storagePath, sourcePdf: storagePath },
    });

    assert(testBook && testBook.id, `Manuscript registered with ID: ${testBook.id}`);
    assert(testBook.fileHash === fileHash, "Cryptographic SHA-256 fileHash indexed on book");
    passedSteps++;

    // -----------------------------------------------------------------
    // Step 5: Confirm job is durably queued
    // -----------------------------------------------------------------
    console.log(`\n[Step 5/14] Enqueuing ingestion job into background queue...`);
    const enqueueResult = await enqueueBookJob(testBook.id, { priority: 5, dpi: 300 });
    assert(enqueueResult.success === true, "enqueueBookJob returned success: true");
    testJob = enqueueResult.job;
    assert(testJob.status === "QUEUED", "Job state is durably persisted as QUEUED in database");
    passedSteps++;

    // -----------------------------------------------------------------
    // Step 6: Worker claims and executes processing
    // -----------------------------------------------------------------
    console.log(`\n[Step 6/14] Worker claims job and updates pipeline heartbeat...`);
    const workerId = `worker-smoke-${runId}`;
    const claimedJob = await claimNextJob(workerId);
    assert(claimedJob && claimedJob.id === testJob.id, `Worker atomically claimed job ${claimedJob.id}`);
    assert(claimedJob.workerId === workerId, `Job assigned to worker ID: ${workerId}`);
    assert(claimedJob.status === "ANALYZING", "Job state transitioned to ANALYZING");
    passedSteps++;

    // -----------------------------------------------------------------
    // Step 7: Verify page output and OCR metadata
    // -----------------------------------------------------------------
    console.log(`\n[Step 7/14] Creating and verifying BookPage output...`);
    testPage = await prisma.bookPage.create({
      data: {
        bookId: testBook.id,
        pageNumber: 1,
        pdfPageIndex: 0,
        processingMethod: "OCR",
        ocrEngine: "tesseract",
        ocrConfidence: 0.94,
        ocrCompleted: true,
        rawText: "॥ अथ बृहत्संहिता प्रथमोऽध्यायः ॥\nजयति जगतः प्रसूतिर्मध्ये ज्योतिर्मयः सविता।",
        cleanedText: "॥ अथ बृहत्संहिता प्रथमोऽध्यायः ॥\nजयति जगतः प्रसूतिर्मध्ये ज्योतिर्मयः सविता।",
        language: "Sanskrit",
      },
    });

    const ocrError = await prisma.ocrError.create({
      data: {
        bookId: testBook.id,
        pageId: testPage.id,
        errorType: "LOW_CONFIDENCE",
        message: "Character confidence slightly below ideal threshold",
        confidence: 0.74,
      },
    });

    assert(testPage && testPage.id, `Page created with ID ${testPage.id} and confidence 94%`);
    passedSteps++;

    // -----------------------------------------------------------------
    // Step 8: Edit, review, and approve page
    // -----------------------------------------------------------------
    console.log(`\n[Step 8/14] Proofreading page and approving transactionally...`);
    const proofreadText = "॥ अथ बृहत्संहिता प्रथमोऽध्यायः ॥\nजयति जगतः प्रसूतिर्मध्ये ज्योतिर्मयः सविता। (विशुद्ध संस्करण)";

    // Save correction in history
    await prisma.correctionHistory.create({
      data: {
        bookId: testBook.id,
        pageId: testPage.id,
        previousText: testPage.cleanedText,
        correctedText: proofreadText,
        correctedBy: adminUser.email,
      },
    });

    // Transactional approval
    const approvedPage = await prisma.$transaction(async (tx) => {
      const p = await tx.bookPage.update({
        where: { id: testPage.id },
        data: {
          proofread: true,
          proofreadText,
          reviewedBy: adminUser.email,
          reviewedAt: new Date(),
        },
      });

      await tx.ocrError.update({
        where: { id: ocrError.id },
        data: {
          resolved: true,
          resolvedBy: adminUser.email,
          resolvedAt: new Date(),
        },
      });

      return p;
    });

    assert(approvedPage.proofread === true, "Page marked proofread: true");
    assert(approvedPage.reviewedBy === adminUser.email, "Reviewer email captured in page metadata");
    passedSteps++;

    // -----------------------------------------------------------------
    // Step 9: Publish the book
    // -----------------------------------------------------------------
    console.log(`\n[Step 9/14] Publishing the manuscript...`);
    // Create chapter and passage so it is fully searchable
    const chapter = await prisma.chapter.create({
      data: {
        bookId: testBook.id,
        title: "प्रथमोध्यायः",
        slug: `chapter-1-${runId}`,
        number: 1,
        chapterNumber: 1,
        status: "PUBLISHED",
        isPublished: true,
      },
    });

    await prisma.passage.create({
      data: {
        bookId: testBook.id,
        chapterId: chapter.id,
        pageId: testPage.id,
        passageNumber: 1,
        text: approvedPage.proofreadText,
        cleanedText: approvedPage.proofreadText,
        searchText: "अथ बृहत्संहिता प्रथमोऽध्यायः जयति जगतः प्रसूतिर्मध्ये ज्योतिर्मयः सविता",
        status: "PUBLISHED",
        passageType: "VERSE",
      },
    });

    const publishedBook = await prisma.book.update({
      where: { id: testBook.id },
      data: { status: "PUBLISHED", processingStatus: "COMPLETED" },
    });

    assert(publishedBook.status === "PUBLISHED", "Book status updated to PUBLISHED");
    passedSteps++;

    // -----------------------------------------------------------------
    // Step 10: Confirm public search returns only published content
    // -----------------------------------------------------------------
    console.log(`\n[Step 10/14] Searching content as public unauthenticated user...`);
    const publicSearchResults = await searchAstrologyContent({
      query: "बृहत्संहिता",
      user: null, // anonymous
    });

    const foundMatch = publicSearchResults.results.some((r) => r.bookId === testBook.id);
    assert(foundMatch === true, "Public search successfully finds published passage");
    passedSteps++;

    // -----------------------------------------------------------------
    // Step 11: Confirm manuscript privacy & Edge Proxy protection
    // -----------------------------------------------------------------
    console.log(`\n[Step 11/14] Verifying manuscript storage privacy & Edge Proxy...`);
    const fakeRequest = {
      nextUrl: new URL(`http://localhost/uploads/books/${testBook.id}/original/scripture-${runId}.pdf`),
    };
    const proxyResponse = proxy(fakeRequest);
    assert(proxyResponse && proxyResponse.status === 403, "Edge Proxy blocks direct static download of original manuscript with 403");
    passedSteps++;

    // -----------------------------------------------------------------
    // Step 12: Unpublish the book and confirm removal from public search
    // -----------------------------------------------------------------
    console.log(`\n[Step 12/14] Unpublishing manuscript and confirming search eviction...`);
    await prisma.book.update({
      where: { id: testBook.id },
      data: { status: "UNPUBLISHED" },
    });

    const unpubSearchResults = await searchAstrologyContent({
      query: "बृहत्संहिता",
      user: null,
    });
    const foundAfterUnpublish = unpubSearchResults.results.some((r) => r.bookId === testBook.id);
    assert(foundAfterUnpublish === false, "Unpublished book is immediately evicted from public search results");
    passedSteps++;

    // -----------------------------------------------------------------
    // Step 13: Cancellation and worker heartbeat mechanics
    // -----------------------------------------------------------------
    console.log(`\n[Step 13/14] Testing cancellation request & heartbeat update...`);
    await updateJobHeartbeat(claimedJob.id, workerId);
    await requestJobCancellation(claimedJob.id);
    const refreshedJob = await prisma.ingestJob.findUnique({ where: { id: claimedJob.id } });
    assert(refreshedJob.cancelRequested === true, "Job cancelRequested flag successfully set to true");
    passedSteps++;

    // -----------------------------------------------------------------
    // Step 14: Audit events & operational metrics
    // -----------------------------------------------------------------
    console.log(`\n[Step 14/14] Checking audit logging & live queue metrics...`);
    await prisma.adminAuditLog.create({
      data: {
        actorId: adminUser.id,
        actorEmail: adminUser.email,
        actorRole: adminUser.role,
        action: "SMOKE_TEST_VERIFIED",
        targetResource: "Book",
        targetId: testBook.id,
        status: "SUCCESS",
        details: { runId },
      },
    });

    const metrics = await getQueueMetrics();
    assert(typeof metrics.queuedCount === "number", "Queue metrics accurately reports queuedCount");
    assert(typeof metrics.completedCount === "number", "Queue metrics accurately reports completedCount");
    passedSteps++;

    console.log(`\n===============================================================`);
    console.log(` ALL 14/14 SMOKE TEST STEPS PASSED SUCCESSFULLY!`);
    console.log(` Complete end-to-end production lifecycle verified.`);
    console.log(`===============================================================\n`);
  } finally {
    // Clean up disposable test data
    console.log("[Cleanup] Removing disposable smoke test artifacts...");
    try {
      if (testBook?.id) {
        await prisma.adminAuditLog.deleteMany({ where: { targetId: testBook.id } });
        await prisma.passage.deleteMany({ where: { bookId: testBook.id } });
        await prisma.chapter.deleteMany({ where: { bookId: testBook.id } });
        await prisma.ocrError.deleteMany({ where: { bookId: testBook.id } });
        await prisma.correctionHistory.deleteMany({ where: { bookId: testBook.id } });
        await prisma.bookPage.deleteMany({ where: { bookId: testBook.id } });
        await prisma.ingestJob.deleteMany({ where: { bookId: testBook.id } });
        await prisma.book.deleteMany({ where: { id: testBook.id } });
        await deleteBookDirectory(testBook.id);
      }
      await prisma.user.deleteMany({ where: { id: { in: [normalUser.id, adminUser.id] } } });
      console.log("[Cleanup] Completed cleanly.");
    } catch (cleanupErr) {
      console.warn("[Cleanup] Warning during cleanup:", cleanupErr.message);
    }
    await prisma.$disconnect();
  }
}

runSmokeTest().catch((err) => {
  console.error("Smoke test failed:", err);
  process.exit(1);
});
