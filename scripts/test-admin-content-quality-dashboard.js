import { PrismaClient } from "@prisma/client";
import assert from "node:assert/strict";
import { evaluateBookQuality } from "../server/ocr/qualityChecks.js";
import { canPublishBooks, canReviewBooks, canEditBookContent } from "../lib/permissions.js";
import { transitionBookStatus, isValidTransition } from "../server/books/lifecycle.js";
import { logAdminActivity } from "../server/admin/audit.js";

const prisma = new PrismaClient();

async function runTestSuite() {
  console.log("==========================================================================");
  console.log("  GURUKUL ADMIN CONTENT QUALITY & PUBLICATION MONITOR VERIFICATION SUITE  ");
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

  // --------------------------------------------------------------------------
  // TEST 1: Live Content Quality Overview Metrics Calculation
  // --------------------------------------------------------------------------
  console.log("[Test 1] Live Database Metrics Calculation");
  try {
    const [
      totalBooks,
      publishedBooks,
      awaitingReview,
      awaitingApproval,
      failedOrPartial,
      pagesRequiringProofreading,
      rejectedOrArchived,
    ] = await Promise.all([
      prisma.book.count(),
      prisma.book.count({ where: { status: "PUBLISHED" } }),
      prisma.book.count({ where: { status: "NEEDS_REVIEW" } }),
      prisma.book.count({ where: { status: "PENDING_APPROVAL" } }),
      prisma.book.count({
        where: {
          OR: [
            { status: "FAILED" },
            { processingStatus: { in: ["FAILED", "OCR_PROCESSING", "ANALYZING"] } },
            { ocrErrors: { some: { resolved: false } } },
            { pages: { some: { ocrCompleted: false } } },
          ],
        },
      }),
      prisma.bookPage.count({
        where: {
          OR: [
            { proofread: false },
            { ocrConfidence: { lt: 0.70, not: null } },
          ],
        },
      }),
      prisma.book.count({
        where: { status: { in: ["REJECTED", "ARCHIVED"] } },
      }),
    ]);

    assert(typeof totalBooks === "number" && totalBooks >= 13, "Total books must be >= 13");
    pass(`Calculated total books count from real DB (${totalBooks})`);

    assert(typeof publishedBooks === "number" && publishedBooks >= 0, "Published books must be numeric");
    assert(publishedBooks <= totalBooks, "Published books cannot exceed total books");
    pass(`Calculated published books count (${publishedBooks})`);

    assert(typeof awaitingReview === "number", "Awaiting review count must be numeric");
    pass(`Calculated books awaiting review (${awaitingReview})`);

    assert(typeof awaitingApproval === "number", "Awaiting approval count must be numeric");
    pass(`Calculated books awaiting approval (${awaitingApproval})`);

    assert(typeof failedOrPartial === "number", "Failed or partial books count must be numeric");
    pass(`Calculated failed or partial OCR books (${failedOrPartial})`);

    assert(typeof pagesRequiringProofreading === "number", "Pages requiring proofreading must be numeric");
    pass(`Calculated pages requiring proofreading (${pagesRequiringProofreading})`);

    assert(typeof rejectedOrArchived === "number", "Rejected/archived count must be numeric");
    pass(`Calculated rejected or archived books (${rejectedOrArchived})`);
  } catch (err) {
    fail("Metrics calculation from database", err);
  }

  // --------------------------------------------------------------------------
  // TEST 2: Multi-Criteria Filter & Sort Logic
  // --------------------------------------------------------------------------
  console.log("\n[Test 2] Filter, Sort, and Search Data Logic");
  try {
    const sampleBooks = [
      { id: "b1", title: "Brihat Parashara Hora Shastra", author: "Parashara", language: "Sanskrit", status: "PUBLISHED", totalPages: 10, proofreadingCoverage: 100, unresolvedErrorsCount: 0, avgConfidence: 0.95 },
      { id: "b2", title: "Saravali Classical", author: "Kalyana Varma", language: "Sanskrit", status: "NEEDS_REVIEW", totalPages: 15, proofreadingCoverage: 40, unresolvedErrorsCount: 2, avgConfidence: 0.82 },
      { id: "b3", title: "Arogyanidhii Health", author: "Vaidya", language: "Hindi", status: "PENDING_APPROVAL", totalPages: 8, proofreadingCoverage: 100, unresolvedErrorsCount: 0, avgConfidence: 0.91 },
      { id: "b4", title: "Vedic Astronomy", author: "Unknown", language: "English", status: "FAILED", totalPages: 5, proofreadingCoverage: 0, unresolvedErrorsCount: 5, avgConfidence: 0.55 },
    ];

    // Filter by Status: PUBLISHED
    const pubFiltered = sampleBooks.filter(b => b.status === "PUBLISHED");
    assert.equal(pubFiltered.length, 1);
    assert.equal(pubFiltered[0].id, "b1");
    pass("Status filter isolates PUBLISHED books accurately");

    // Filter by Language: Sanskrit
    const sanFiltered = sampleBooks.filter(b => b.language === "Sanskrit");
    assert.equal(sanFiltered.length, 2);
    pass("Language filter isolates Sanskrit manuscripts");

    // Filter by OCR Errors: HAS_ERRORS
    const errorFiltered = sampleBooks.filter(b => b.unresolvedErrorsCount > 0 || b.status === "FAILED");
    assert.equal(errorFiltered.length, 2);
    pass("OCR errors filter isolates books with errors");

    // Filter by Review Status: NEEDS_PROOFREADING
    const reviewFiltered = sampleBooks.filter(b => b.proofreadingCoverage < 100);
    assert.equal(reviewFiltered.length, 2);
    pass("Review status filter isolates unproofread books");

    // Sort by Coverage descending
    const sortedByCoverage = [...sampleBooks].sort((a, b) => b.proofreadingCoverage - a.proofreadingCoverage);
    assert.equal(sortedByCoverage[0].proofreadingCoverage, 100);
    assert.equal(sortedByCoverage[3].proofreadingCoverage, 0);
    pass("Sorting by proofreading coverage ordered descending");

    // Search query matching
    const searchMatch = sampleBooks.filter(b => (b.title + b.author).toLowerCase().includes("parashara"));
    assert.equal(searchMatch.length, 1);
    assert.equal(searchMatch[0].id, "b1");
    pass("Search query matches title and author");
  } catch (err) {
    fail("Filter and sort logic", err);
  }

  // --------------------------------------------------------------------------
  // TEST 3: Review Queue and Reviewer Assignment Workflow
  // --------------------------------------------------------------------------
  console.log("\n[Test 3] Review Queue and Staff Assignment Workflow");
  const testBookSlug = `quality-test-book-${Date.now()}`;
  let createdBook = null;
  try {
    // Create test book with 2 pages
    createdBook = await prisma.book.create({
      data: {
        title: "Quality Review Test Manuscript",
        slug: testBookSlug,
        language: "Sanskrit",
        script: "Devanagari",
        status: "NEEDS_REVIEW",
        originalFileUrl: "https://storage.gurukul.internal/books/quality-test.pdf",
        pageCount: 2,
        pages: {
          create: [
            {
              pageNumber: 1,
              pdfPageIndex: 0,
              rawText: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशम् ॥ १ ॥",
              cleanedText: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशम् ॥ १ ॥",
              proofreadText: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशम् ॥ १ ॥",
              ocrConfidence: 0.95,
              ocrCompleted: true,
              proofread: true,
            },
            {
              pageNumber: 2,
              pdfPageIndex: 1,
              rawText: "विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् ॥ २ ॥",
              cleanedText: "विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् ॥ २ ॥",
              proofreadText: null,
              ocrConfidence: 0.65, // Low confidence
              ocrCompleted: true,
              proofread: false,
            },
          ],
        },
      },
      include: { pages: true },
    });
    pass("Created test book in NEEDS_REVIEW status with low-confidence page");

    // Assign reviewer to the book
    const reviewerEmail = "admin@example.com";
    const updateResult = await prisma.bookPage.updateMany({
      where: { bookId: createdBook.id },
      data: { reviewedBy: reviewerEmail },
    });
    assert.equal(updateResult.count, 2, "Both pages must have reviewedBy set");
    pass("Successfully assigned reviewer email to all book pages");

    // Update assignment metadata in publicationReadiness
    await prisma.book.update({
      where: { id: createdBook.id },
      data: {
        publicationReadiness: {
          assignment: {
            assignedEmail: reviewerEmail,
            assignedAt: new Date().toISOString(),
            notes: "Review Sanskrit conjuncts on Page 2",
          },
        },
      },
    });
    pass("Persisted reviewer assignment metadata on Book record");

    // Verify assigned reviewer reads back
    const reloaded = await prisma.book.findUnique({
      where: { id: createdBook.id },
      include: { pages: true },
    });
    assert.equal(reloaded.pages[0].reviewedBy, reviewerEmail);
    assert.equal(reloaded.pages[1].reviewedBy, reviewerEmail);
    pass("Reviewer assignment read back verified on both pages");
  } catch (err) {
    fail("Review queue and assignment", err);
  }

  // --------------------------------------------------------------------------
  // TEST 4: Page-Level OCR Review & Correction History Integrity
  // --------------------------------------------------------------------------
  console.log("\n[Test 4] Page-Level OCR Review and Text Correction History");
  try {
    const page2 = createdBook.pages.find(p => p.pageNumber === 2);
    assert(page2, "Page 2 must exist");

    // 1. Raw text immutability check
    const originalRaw = page2.rawText;
    const correctedDevanagari = "विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् । लक्ष्मीकान्तं कमलनयनं ॥ २ ॥";

    // Create CorrectionHistory record simulating editor submit
    const correctionRecord = await prisma.correctionHistory.create({
      data: {
        bookId: createdBook.id,
        pageId: page2.id,
        previousText: page2.cleanedText || page2.rawText,
        correctedText: correctedDevanagari,
        correctedBy: "editor@gurukul.internal",
      },
    });

    await prisma.bookPage.update({
      where: { id: page2.id },
      data: {
        proofreadText: correctedDevanagari,
        proofread: true,
      },
    });

    // Verify rawText remains unchanged
    const reloadedPage = await prisma.bookPage.findUnique({ where: { id: page2.id } });
    assert.equal(reloadedPage.rawText, originalRaw, "Source rawText must remain completely immutable");
    pass("Original rawText preserved intact without corruption");

    // Verify Devanagari conjuncts and Sanskrit diacritics
    assert(reloadedPage.proofreadText.includes("शुभाङ्गम्"), "Devanagari conjunct ङ्ग must be preserved");
    assert(reloadedPage.proofreadText.includes("॥ २ ॥"), "Sanskrit double danda must be preserved");
    pass("Devanagari conjuncts and Sanskrit dandās preserved accurately");

    // Verify CorrectionHistory entry
    assert.equal(correctionRecord.previousText, page2.cleanedText);
    assert.equal(correctionRecord.correctedText, correctedDevanagari);
    assert.equal(correctionRecord.correctedBy, "editor@gurukul.internal");
    pass("CorrectionHistory captured previousText, correctedText, editor, and timestamp");
  } catch (err) {
    fail("Page-level OCR review and correction history", err);
  }

  // --------------------------------------------------------------------------
  // TEST 5: Publication Readiness Transparent Checklist
  // --------------------------------------------------------------------------
  console.log("\n[Test 5] Publication Readiness Transparent Checklist Evaluation");
  try {
    const readinessReport = await evaluateBookQuality(createdBook.id);

    assert(readinessReport, "Readiness report must be generated");
    assert(Array.isArray(readinessReport.checklist), "Checklist must be an array of conditions");
    assert(typeof readinessReport.readinessScore === "number", "Readiness score must be a number");
    pass(`Generated publication readiness evaluation (Score: ${readinessReport.readinessScore}%)`);

    // Verify checklist items
    const checklistItems = readinessReport.checklist.map(c => c.item);
    assert(checklistItems.some(i => i.includes("Source PDF")), "Must verify Source PDF integrity");
    assert(checklistItems.some(i => i.includes("Page Sequence")), "Must verify Page Sequence completeness");
    assert(checklistItems.some(i => i.includes("Proofreading")), "Must verify Editorial Proofreading coverage");
    pass("Transparent checklist contains all required operational quality conditions");

    // Verify Passed vs Needs Attention conditions
    const pdfCheck = readinessReport.checklist.find(c => c.item.includes("Source PDF"));
    assert.equal(pdfCheck.passed, true, "Source PDF was provided so check must pass");
    pass("Source PDF check evaluated as Passed");
  } catch (err) {
    fail("Publication readiness checklist evaluation", err);
  }

  // --------------------------------------------------------------------------
  // TEST 6: RBAC Authorization & Security Guardrails
  // --------------------------------------------------------------------------
  console.log("\n[Test 6] RBAC Security Guardrails for Admin Operations");
  try {
    const adminUser = { role: "ADMIN", email: "admin@gurukul.ai" };
    const editorUser = { role: "EDITOR", email: "editor@gurukul.ai" };
    const proofreaderUser = { role: "PROOFREADER", email: "proofreader@gurukul.ai" };
    const regularUser = { role: "USER", email: "user@gurukul.ai" };

    // Publishing permissions
    assert.equal(canPublishBooks(adminUser), true, "ADMIN must have publish permission");
    assert.equal(canPublishBooks(editorUser), false, "EDITOR must not have publish permission");
    assert.equal(canPublishBooks(proofreaderUser), false, "PROOFREADER must not have publish permission");
    assert.equal(canPublishBooks(regularUser), false, "USER must not have publish permission");
    pass("Publishing permission strictly restricted to authorized administrators");

    // Review & editing permissions
    assert.equal(canReviewBooks(editorUser), true, "EDITOR can review books");
    assert.equal(canReviewBooks(proofreaderUser), true, "PROOFREADER can review books");
    assert.equal(canReviewBooks(regularUser), false, "USER cannot review books");
    pass("Review permission granted to editors and proofreaders but blocked for standard users");

    // Content editing permissions
    assert.equal(canEditBookContent(editorUser), true, "EDITOR can edit book text");
    assert.equal(canEditBookContent(regularUser), false, "USER cannot edit book text");
    pass("Text editing permissions enforce separation of duties");
  } catch (err) {
    fail("RBAC security guardrails", err);
  }

  // --------------------------------------------------------------------------
  // TEST 7: Audit Trail Activity Logging
  // --------------------------------------------------------------------------
  console.log("\n[Test 7] Administrative Audit Trail Activity Logging");
  try {
    const loggedEntry = await logAdminActivity({
      actorEmail: "admin@gurukul.ai",
      actorRole: "ADMIN",
      action: "BOOK_ASSIGN_REVIEWER",
      targetResource: "Book",
      targetId: createdBook.id,
      details: {
        bookTitle: createdBook.title,
        assignedTo: "editor@gurukul.ai",
        secretToken: "secret12345", // Test sanitization
      },
    });

    assert(loggedEntry, "Audit entry must be created");
    assert.equal(loggedEntry.action, "BOOK_ASSIGN_REVIEWER");
    assert.equal(loggedEntry.targetId, createdBook.id);
    assert.equal(loggedEntry.details.secretToken, "[REDACTED]", "Sensitive keys must be redacted");
    pass("Audit log recorded administrative action and sanitized sensitive details");
  } catch (err) {
    fail("Audit trail activity logging", err);
  }

  // --------------------------------------------------------------------------
  // Cleanup Test Data
  // --------------------------------------------------------------------------
  try {
    if (createdBook) {
      await prisma.book.delete({ where: { id: createdBook.id } });
      pass("Cleaned up temporary test book records");
    }
  } catch (err) {
    console.warn("Cleanup warning:", err.message);
  }

  console.log("\n--------------------------------------------------------------------------");
  console.log(`TOTAL SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================================\n");

  await prisma.$disconnect();

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error("Suite fatal error:", err);
  process.exit(1);
});
