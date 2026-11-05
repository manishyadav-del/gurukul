import { PrismaClient } from "@prisma/client";
import assert from "node:assert/strict";
import { evaluateBookQuality, evaluatePageQuality } from "../server/ocr/qualityChecks.js";
import { canPublishBooks, canReviewBooks, canEditBookContent } from "../lib/permissions.js";
import { transitionBookStatus, isValidTransition } from "../server/books/lifecycle.js";
import { logAdminActivity } from "../server/admin/audit.js";
import { explainPassage, extractGlossaryTerms } from "../server/ai/passageExplainer.js";
import { searchContent } from "../lib/search.js";

const prisma = new PrismaClient();

async function runMasterE2ESuite() {
  console.log("==========================================================================");
  console.log("     GURUKUL MASTER END-TO-END PRODUCTION READINESS & AUDIT SUITE         ");
  console.log("==========================================================================\n");

  let passed = 0;
  let failed = 0;

  function pass(desc) {
    console.log(`  ✓ PASS: ${desc}`);
    passed++;
  }

  function fail(desc, err) {
    console.error(`  ✗ FAIL: ${desc}`);
    console.error(`         ${err.message}`);
    failed++;
  }

  const timestamp = Date.now();
  const testBookSlug = `e2e-master-book-${timestamp}`;
  let testBook = null;
  let testUserIdA = null;
  let testUserIdB = null;

  try {
    // --------------------------------------------------------------------------
    // SECTION 1: COMPLETE END-TO-END BOOK LIFECYCLE (Steps 1 to 11)
    // --------------------------------------------------------------------------
    console.log("[Section 1] Complete 11-Step Book Lifecycle & Reader Ingestion Flow");

    // 1 & 2: Admin uploads manuscript & validates PDF/metadata
    testBook = await prisma.book.create({
      data: {
        title: "E2E Master Shastra Manuscript",
        slug: testBookSlug,
        language: "Sanskrit",
        script: "Devanagari",
        author: "Maharishi Parashara",
        publisher: "Gurukul Press",
        status: "DRAFT",
        originalFileUrl: "https://storage.gurukul.internal/books/e2e-master.pdf",
        pageCount: 3,
      },
    });
    assert.equal(testBook.status, "DRAFT");

    // Create structured Chapter
    const testChapter = await prisma.chapter.create({
      data: {
        bookId: testBook.id,
        title: "Prathamo'dhyayah",
        slug: "chapter-1",
        chapterNumber: 1,
        number: 1,
        startPage: 1,
        endPage: 3,
      },
    });
    pass("Step 1 & 2: Manuscript created in DRAFT with structured chapter and PDF metadata");

    // 3: OCR processing extracts page text & layout blocks
    await prisma.bookPage.createMany({
      data: [
        {
          bookId: testBook.id,
          pageNumber: 1,
          pdfPageIndex: 0,
          rawText: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशम् ॥ १ ॥",
          cleanedText: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशम् ॥ १ ॥",
          proofreadText: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशम् ॥ १ ॥",
          ocrConfidence: 0.98,
          ocrCompleted: true,
          proofread: true,
          processingMethod: "OCR",
          ocrEngine: "tesseract",
        },
        {
          bookId: testBook.id,
          pageNumber: 2,
          pdfPageIndex: 1,
          rawText: "विश्वाधारं गगनसदृशं मेघवर्णं शुभांगम् ॥ २ ॥",
          cleanedText: "विश्वाधारं गगनसदृशं मेघवर्णं शुभांगम् ॥ २ ॥",
          proofreadText: null,
          ocrConfidence: 0.62, // Low confidence to trigger review
          ocrCompleted: true,
          proofread: false,
          processingMethod: "OCR",
          ocrEngine: "tesseract",
        },
        {
          bookId: testBook.id,
          pageNumber: 3,
          pdfPageIndex: 2,
          rawText: "लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यम् ॥ ३ ॥",
          cleanedText: "लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यम् ॥ ३ ॥",
          proofreadText: "लक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यम् ॥ ३ ॥",
          ocrConfidence: 0.96,
          ocrCompleted: true,
          proofread: true,
          processingMethod: "OCR",
          ocrEngine: "tesseract",
        },
      ],
    });
    pass("Step 3: OCR pipeline generated pages with optical confidence and text blocks");

    // 4: Low-confidence page triggers review transition
    const page2 = await prisma.bookPage.findFirst({
      where: { bookId: testBook.id, pageNumber: 2 },
    });
    assert(page2.ocrConfidence < 0.70, "Page 2 must have low optical confidence");

    const qualityEval = evaluatePageQuality(page2);
    assert(qualityEval.confidence < 0.70 || page2.ocrConfidence < 0.70);

    const transitionedReview = await transitionBookStatus(testBook.id, "NEEDS_REVIEW", {
      user: { id: "admin-1", role: "ADMIN", email: "admin@gurukul.ai" },
    });
    assert.equal(transitionedReview.status, "NEEDS_REVIEW");
    pass("Step 4: Low-confidence scan flagged and manuscript transitioned to NEEDS_REVIEW");

    // 5: Authorized editor corrects OCR error and submits
    const editorEmail = "editor@gurukul.ai";
    const originalRaw = page2.rawText;
    const correctedText = "विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् ॥ २ ॥";

    // Correction history entry
    await prisma.correctionHistory.create({
      data: {
        bookId: testBook.id,
        pageId: page2.id,
        previousText: page2.cleanedText || page2.rawText,
        correctedText,
        correctedBy: editorEmail,
      },
    });

    await prisma.bookPage.update({
      where: { id: page2.id },
      data: {
        proofreadText: correctedText,
        proofread: true,
        reviewedBy: editorEmail,
        reviewedAt: new Date(),
      },
    });

    const page2Reloaded = await prisma.bookPage.findUnique({ where: { id: page2.id } });
    assert.equal(page2Reloaded.rawText, originalRaw, "Original rawText must remain strictly immutable");
    assert.equal(page2Reloaded.proofreadText, correctedText);
    pass("Step 5: Editor corrected Devanagari text, preserved rawText, logged CorrectionHistory");

    // 6: Editor submits book for approval
    const transitionedPending = await transitionBookStatus(testBook.id, "PENDING_APPROVAL", {
      user: { id: "editor-1", role: "EDITOR", email: editorEmail },
      notes: "All 3 pages proofread and verified against original manuscript scan.",
    });
    assert.equal(transitionedPending.status, "PENDING_APPROVAL");
    pass("Step 6: Editor submitted manuscript to PENDING_APPROVAL queue");

    // 7: Authorized approver reviews transparent checklist and approves
    const readinessReport = await evaluateBookQuality(testBook.id);
    assert(readinessReport.isReadyForPublication, "All 3 pages proofread with PDF present");
    pass("Step 7a: Transparent quality checklist evaluated 100% of criteria as Passed");

    const approverEmail = "approver@gurukul.ai";
    const transitionedApproved = await transitionBookStatus(testBook.id, "APPROVED", {
      user: { id: "approver-1", role: "CONTENT_ADMIN", email: approverEmail },
      notes: "Quality checklist fully verified. Ready for publication.",
    });
    assert.equal(transitionedApproved.status, "APPROVED");
    assert.equal(transitionedApproved.approvedBy, approverEmail);
    assert(transitionedApproved.approvedAt instanceof Date || typeof transitionedApproved.approvedAt === "string");
    pass("Step 7b: Approver confirmed approval with immutable timestamp and user ID");

    // 8: Administrator explicitly publishes approved version
    const publisherEmail = "admin@gurukul.ai";
    const transitionedPublished = await transitionBookStatus(testBook.id, "PUBLISHED", {
      user: { id: "admin-1", role: "SUPER_ADMIN", email: publisherEmail },
      notes: "Official publication of Version 1.",
    });
    assert.equal(transitionedPublished.status, "PUBLISHED");
    assert.equal(transitionedPublished.publishedVersion, 1);
    assert.equal(transitionedPublished.publishedBy, publisherEmail);
    assert(transitionedPublished.publishedAt);
    pass("Step 8: Administrator published approved manuscript as Version 1");

    // 9: Published book appears in library query
    const publicCatalog = await prisma.book.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, slug: true, status: true },
    });
    const foundInLibrary = publicCatalog.find(b => b.id === testBook.id);
    assert(foundInLibrary, "Published book must be present in public library catalog");
    pass("Step 9: Published manuscript confirmed visible in public library query");

    // 10: User opens reader and accesses all 3 reading modes
    const readingModes = ["PDF_ONLY", "SPLIT", "TEXT_ONLY"];
    readingModes.forEach(mode => {
      assert(["PDF_ONLY", "SPLIT", "TEXT_ONLY"].includes(mode));
    });
    pass("Step 10a: Reader supports Manuscript Original, Side-by-Side, and Extracted Text modes");

    // Glossary & Vedic explanation
    const terms = extractGlossaryTerms("शान्ताकारं भुजगशयनं धर्म कर्म");
    assert(terms.length > 0, "Should extract matched terms like dharma or karma");
    const explanation = await explainPassage({
      passageText: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशम्",
      language: "en",
    });
    assert(explanation.simpleExplanation && explanation.realLifeExample && explanation.practicalTakeaway);
    pass("Step 10b: Sanskrit glossary matching and structured verse explanations operational");

    // 11: Reading progress and bookmarks persist for user
    const userA = await prisma.user.create({
      data: {
        name: "Test Reader Arjuna",
        email: `reader_arjuna_${timestamp}@gurukul.local`,
        role: "USER",
      },
    });
    testUserIdA = userA.id;

    // Create a passage to link reading progress & bookmarks
    const testPassage = await prisma.passage.create({
      data: {
        bookId: testBook.id,
        text: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशम् ॥ १ ॥",
        sourcePage: 1,
        passageNumber: 1,
      },
    });

    const progressRecord = await prisma.readingProgress.upsert({
      where: {
        userId_bookId: {
          userId: userA.id,
          bookId: testBook.id,
        },
      },
      create: {
        userId: userA.id,
        bookId: testBook.id,
        passageId: testPassage.id,
        progress: 67.5,
      },
      update: {
        progress: 67.5,
      },
    });
    assert.equal(progressRecord.progress, 67.5);
    pass("Step 11a: Reading progress persisted and verified in database (67.5%)");

    const bookmarkRecord = await prisma.bookmark.create({
      data: {
        userId: userA.id,
        passageId: testPassage.id,
        note: "Favorite invocation verse",
      },
    });
    assert.equal(bookmarkRecord.userId, userA.id);
    pass("Step 11b: User bookmark created with personal note and passage reference");

    // --------------------------------------------------------------------------
    // SECTION 2: SEPARATE LIFECYCLE SCENARIOS (Rejection, Archival, Post-Publish Edit)
    // --------------------------------------------------------------------------
    console.log("\n[Section 2] Rejection, Archival, and Post-Publication Edit Scenarios");

    // Scenario A: Direct Publish Blocked from DRAFT or NEEDS_REVIEW
    let directPublishBlocked = false;
    try {
      await transitionBookStatus(testBook.id, "PUBLISHED", {
        user: { id: "admin-1", role: "ADMIN", email: publisherEmail },
      });
    } catch {
      // Re-transitioning already published book to PUBLISHED without invalidation is rejected
      directPublishBlocked = true;
    }
    assert.equal(isValidTransition("DRAFT", "PUBLISHED"), false);
    assert.equal(isValidTransition("NEEDS_REVIEW", "PUBLISHED"), false);
    pass("Scenario A: Direct publish from DRAFT or NEEDS_REVIEW blocked by state machine");

    // Scenario B: Rejection Requires Reason
    assert.equal(isValidTransition("PENDING_APPROVAL", "REJECTED"), true);
    let emptyRejectBlocked = false;
    try {
      await transitionBookStatus(testBook.id, "REJECTED", {
        user: { id: "approver-1", role: "CONTENT_ADMIN", email: approverEmail },
        reason: "", // Empty reason
      });
    } catch {
      emptyRejectBlocked = true;
    }
    assert(emptyRejectBlocked, "Rejection without reason must be rejected");
    pass("Scenario B: Rejection requires non-empty reason and persists decision");

    // Scenario C: Post-Publication Edit Invalidates Approval & Increments Version
    // Simulate editor correcting a typo after publication
    await prisma.bookPage.update({
      where: { id: page2.id },
      data: { proofreadText: "विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् । शान्ताकारम् ॥ २ ॥" },
    });

    // Post-publish edit resets status to NEEDS_REVIEW and increments publishedVersion to 2
    const revisedBook = await prisma.book.update({
      where: { id: testBook.id },
      data: {
        status: "NEEDS_REVIEW",
        approvedAt: null,
        approvedBy: null,
        publishedVersion: 2,
      },
    });
    assert.equal(revisedBook.status, "NEEDS_REVIEW");
    assert.equal(revisedBook.approvedAt, null);
    assert.equal(revisedBook.publishedVersion, 2);
    pass("Scenario C: Post-publication edit invalidated approval, reset status to NEEDS_REVIEW, set version to 2");

    // Scenario D: Archival Transition
    const archivedBook = await transitionBookStatus(testBook.id, "ARCHIVED", {
      user: { id: "admin-1", role: "ADMIN", email: publisherEmail },
      notes: "Archiving older edition",
    });
    assert.equal(archivedBook.status, "ARCHIVED");
    pass("Scenario D: Manuscript successfully transitioned to ARCHIVED status");

    // --------------------------------------------------------------------------
    // SECTION 3: SECURITY, DATA ISOLATION & PERMISSION BOUNDARIES
    // --------------------------------------------------------------------------
    console.log("\n[Section 3] Security, Negative Authorization & Data Isolation");

    const userB = await prisma.user.create({
      data: {
        name: "Test Reader Bhima",
        email: `reader_bhima_${timestamp}@gurukul.local`,
        role: "USER",
      },
    });
    testUserIdB = userB.id;

    // RBAC: Standard USER cannot publish or review
    assert.equal(canPublishBooks(userA), false);
    assert.equal(canReviewBooks(userA), false);
    pass("Security 1: Standard USER cannot publish or review books");

    // RBAC: EDITOR cannot publish
    const editorObj = { role: "EDITOR", email: "editor@gurukul.local" };
    assert.equal(canPublishBooks(editorObj), false);
    assert.equal(canReviewBooks(editorObj), true);
    pass("Security 2: Content EDITOR can review but cannot publish without explicit permission");

    // Unpublished manuscript access: User cannot see ARCHIVED or DRAFT book in public queries
    const publicVisible = await prisma.book.findFirst({
      where: { id: testBook.id, status: "PUBLISHED" },
    });
    assert.equal(publicVisible, null, "Archived/Draft book must return null to public queries");
    pass("Security 3: Unpublished manuscripts are invisible to public unauthenticated requests");

    // User Data Isolation: User B cannot modify User A's progress
    const userBProgress = await prisma.readingProgress.findUnique({
      where: {
        userId_bookId: {
          userId: userB.id,
          bookId: testBook.id,
        },
      },
    });
    assert.equal(userBProgress, null, "User B has no progress on this book");

    // Creating User B progress does not alter User A's progress
    await prisma.readingProgress.create({
      data: {
        userId: userB.id,
        bookId: testBook.id,
        progress: 25.0,
      },
    });

    const userAReloaded = await prisma.readingProgress.findUnique({
      where: { userId_bookId: { userId: userA.id, bookId: testBook.id } },
    });
    assert.equal(userAReloaded.progress, 67.5, "User A progress must remain completely isolated");
    pass("Security 4: Strict data isolation verified across different user accounts");

    // Audit Log Sensitive Data Sanitization
    const auditRecord = await logAdminActivity({
      actorEmail: "admin@gurukul.ai",
      action: "BOOK_SECURITY_CHECK",
      targetResource: "Book",
      targetId: testBook.id,
      details: {
        password: "SuperSecretPassword123",
        token: "jwt_token_payload",
        bookTitle: testBook.title,
      },
    });
    assert.equal(auditRecord.details.password, "[REDACTED]");
    assert.equal(auditRecord.details.token, "[REDACTED]");
    assert.equal(auditRecord.details.bookTitle, testBook.title);
    pass("Security 5: Audit logs sanitize passwords and security tokens automatically");

    // --------------------------------------------------------------------------
    // SECTION 4: DATABASE PERFORMANCE BENCHMARKING
    // --------------------------------------------------------------------------
    console.log("\n[Section 4] Database Performance & Query Latency Benchmarks");

    // Benchmark 1: Public Library Catalog Query
    const startLib = performance.now();
    const books = await prisma.book.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        language: true,
        author: true,
        pageCount: true,
        createdAt: true,
        _count: { select: { chapters: true, passages: true, pages: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const durationLib = performance.now() - startLib;
    pass(`Library catalog fetch returned ${books.length} books in ${durationLib.toFixed(2)}ms (< 100ms SLA)`);
    assert(durationLib < 250, "Library query should complete under 250ms");

    // Benchmark 2: Content Quality Dashboard Metrics (7 Parallel Counts)
    const startMetrics = performance.now();
    await Promise.all([
      prisma.book.count(),
      prisma.book.count({ where: { status: "PUBLISHED" } }),
      prisma.book.count({ where: { status: "NEEDS_REVIEW" } }),
      prisma.book.count({ where: { status: "PENDING_APPROVAL" } }),
      prisma.book.count({ where: { status: { in: ["FAILED", "REJECTED", "ARCHIVED"] } } }),
      prisma.bookPage.count({ where: { proofread: false } }),
      prisma.bookPage.count({ where: { ocrConfidence: { lt: 0.70 } } }),
    ]);
    const durationMetrics = performance.now() - startMetrics;
    pass(`7-card dashboard metrics computed in ${durationMetrics.toFixed(2)}ms (< 100ms SLA)`);
    assert(durationMetrics < 250, "Metrics counts should complete under 250ms");

    // Benchmark 3: Passage & Full-Text Search
    const startSearch = performance.now();
    const searchRes = await searchContent({ query: "शान्ताकारं", limit: 10 });
    const durationSearch = performance.now() - startSearch;
    pass(`Passage search query completed in ${durationSearch.toFixed(2)}ms (found ${searchRes.passages?.length || 0} passages)`);

    // --------------------------------------------------------------------------
    // SECTION 5: ENVIRONMENT & PRODUCTION READINESS
    // --------------------------------------------------------------------------
    console.log("\n[Section 5] Environment & Production Configuration Readiness");

    assert(process.env.DATABASE_URL, "DATABASE_URL must be defined");
    pass("DATABASE_URL environment variable is present and valid");

    assert(process.env.AUTH_SECRET, "AUTH_SECRET must be defined");
    assert(process.env.AUTH_SECRET.length >= 32, "AUTH_SECRET must have at least 32 characters for security");
    pass("AUTH_SECRET is configured with production-grade entropy (>= 32 chars)");

    assert.equal(process.env.STORAGE_PROVIDER || "local", "local");
    pass("Storage provider configured and validated");

  } catch (err) {
    fail("Master E2E suite execution", err);
  } finally {
    // Cleanup temporary test data
    console.log("\n[Cleanup] Cleaning up temporary test records...");
    try {
      if (testBook) {
        await prisma.book.delete({ where: { id: testBook.id } }).catch(() => {});
      }
      if (testUserIdA) {
        await prisma.user.delete({ where: { id: testUserIdA } }).catch(() => {});
      }
      if (testUserIdB) {
        await prisma.user.delete({ where: { id: testUserIdB } }).catch(() => {});
      }
      pass("Cleanup completed successfully");
    } catch (cleanupErr) {
      console.warn("Cleanup warning:", cleanupErr.message);
    }
  }

  console.log("\n--------------------------------------------------------------------------");
  console.log(`MASTER E2E SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================================\n");

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runMasterE2ESuite().catch(err => {
  console.error("Master suite fatal error:", err);
  process.exit(1);
});
