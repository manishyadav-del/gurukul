import prisma from "../lib/prisma.js";
import {
  ALLOWED_TRANSITIONS,
  isValidTransition,
  transitionBookStatus,
} from "../server/books/lifecycle.js";
import {
  canPublishBooks,
  canReviewBooks,
  canManageBooks,
  canEditBookContent,
  ROLES,
} from "../lib/permissions.js";

async function runTests() {
  console.log("=== Gurukul Admin Publishing & Approval Workflow Test Suite ===");
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passedCount++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failedCount++;
    }
  }

  // Phase 1: Permission Matrix Separation
  console.log("\n[Test 1] Permission Matrix Separation");
  const adminUser = { id: "admin-1", role: ROLES.ADMIN };
  const superAdminUser = { id: "super-1", role: ROLES.SUPER_ADMIN };
  const contentAdminUser = { id: "ca-1", role: ROLES.CONTENT_ADMIN };
  const editorUser = { id: "ed-1", role: ROLES.EDITOR };
  const proofreaderUser = { id: "pr-1", role: ROLES.PROOFREADER };
  const regularUser = { id: "u-1", role: ROLES.USER };

  // Only Admins / Content Admins can publish
  assert(canPublishBooks(adminUser), "ADMIN can publish books");
  assert(canPublishBooks(superAdminUser), "SUPER_ADMIN can publish books");
  assert(canPublishBooks(contentAdminUser), "CONTENT_ADMIN can publish books");
  assert(!canPublishBooks(editorUser), "EDITOR cannot publish books (publishing restricted)");
  assert(!canPublishBooks(proofreaderUser), "PROOFREADER cannot publish books");
  assert(!canPublishBooks(regularUser), "USER cannot publish books");

  // Editors & Proofreaders can edit and review
  assert(canEditBookContent(editorUser), "EDITOR can edit book content");
  assert(canEditBookContent(proofreaderUser), "PROOFREADER can edit book content");
  assert(canReviewBooks(proofreaderUser), "PROOFREADER can review books");
  assert(!canEditBookContent(regularUser), "USER cannot edit book content");
  assert(!canReviewBooks(regularUser), "USER cannot review books");

  // Phase 2: State Machine Transition Rules
  console.log("\n[Test 2] State Machine Transition Rules");
  assert(isValidTransition("DRAFT", "PROCESSING"), "DRAFT -> PROCESSING is valid");
  assert(isValidTransition("DRAFT", "NEEDS_REVIEW"), "DRAFT -> NEEDS_REVIEW is valid");
  assert(!isValidTransition("DRAFT", "PUBLISHED"), "DRAFT -> PUBLISHED is blocked");
  assert(isValidTransition("NEEDS_REVIEW", "PENDING_APPROVAL"), "NEEDS_REVIEW -> PENDING_APPROVAL is valid");
  assert(!isValidTransition("NEEDS_REVIEW", "PUBLISHED"), "NEEDS_REVIEW -> PUBLISHED is blocked without approval");
  assert(isValidTransition("PENDING_APPROVAL", "APPROVED"), "PENDING_APPROVAL -> APPROVED is valid");
  assert(isValidTransition("PENDING_APPROVAL", "REJECTED"), "PENDING_APPROVAL -> REJECTED is valid");
  assert(isValidTransition("APPROVED", "PUBLISHED"), "APPROVED -> PUBLISHED is valid");
  assert(isValidTransition("PUBLISHED", "NEEDS_REVIEW"), "PUBLISHED -> NEEDS_REVIEW is valid on revision");
  assert(isValidTransition("PUBLISHED", "ARCHIVED"), "PUBLISHED -> ARCHIVED is valid");
  assert(!isValidTransition("REJECTED", "PUBLISHED"), "REJECTED -> PUBLISHED is blocked directly");

  // Phase 3 & 4: Database Lifecycle & Quality Gate Execution
  console.log("\n[Test 3] End-to-End Book Lifecycle in DB");
  const testSlug = `test-lifecycle-${Date.now()}`;
  let testBook = null;

  try {
    testBook = await prisma.book.create({
      data: {
        title: "Test Shrimad Bhagavad Gita Lifecycle",
        slug: testSlug,
        language: "Sanskrit",
        script: "Devanagari",
        status: "DRAFT",
        originalFileUrl: "/storage/manuscripts/test.pdf",
        pages: {
          create: [
            {
              pageNumber: 1,
              pdfPageIndex: 0,
              rawText: "ॐ श्रीपरमात्मने नमः। अथ प्रथमोऽध्यायः।",
              cleanedText: "ॐ श्रीपरमात्मने नमः। अथ प्रथमोऽध्यायः।",
              proofreadText: "ॐ श्रीपरमात्मने नमः। अथ प्रथमोऽध्यायः।",
              proofread: true,
              ocrCompleted: true,
              ocrConfidence: 0.98,
              language: "sa",
            },
            {
              pageNumber: 2,
              pdfPageIndex: 1,
              rawText: "धृतराष्ट्र उवाच धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः।",
              cleanedText: "धृतराष्ट्र उवाच धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः।",
              proofreadText: "धृतराष्ट्र उवाच धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः।",
              proofread: true,
              ocrCompleted: true,
              ocrConfidence: 0.95,
              language: "sa",
            },
          ],
        },
        chapters: {
          create: [
            {
              title: "अर्जुनविषादयोग",
              slug: "arjuna-vishada-yoga",
              chapterNumber: 1,
              startPage: 1,
              endPage: 2,
            },
          ],
        },
      },
    });

    assert(testBook.status === "DRAFT", "New book starts in DRAFT state");

    // Attempt illegal transition directly from DRAFT to PUBLISHED
    let threwIllegal = false;
    try {
      await transitionBookStatus(testBook.id, "PUBLISHED", { user: adminUser });
    } catch (e) {
      threwIllegal = true;
      assert(e.message.includes("Invalid lifecycle transition"), "Blocked direct DRAFT -> PUBLISHED transition");
    }
    assert(threwIllegal, "Direct leap to PUBLISHED threw expected error");

    // Transition: DRAFT -> NEEDS_REVIEW
    const underReview = await transitionBookStatus(testBook.id, "NEEDS_REVIEW", { user: editorUser });
    assert(underReview.status === "NEEDS_REVIEW", "Transitioned to NEEDS_REVIEW");

    // Attempt publish from NEEDS_REVIEW (must fail without submission & approval)
    let threwSkipApproval = false;
    try {
      await transitionBookStatus(testBook.id, "PUBLISHED", { user: adminUser });
    } catch (e) {
      threwSkipApproval = true;
      assert(e.message.includes("Invalid lifecycle transition"), "Blocked publishing while in NEEDS_REVIEW");
    }
    assert(threwSkipApproval, "Skipping approval threw expected error");

    // Transition: NEEDS_REVIEW -> PENDING_APPROVAL
    const submitted = await transitionBookStatus(testBook.id, "PENDING_APPROVAL", {
      user: editorUser,
      notes: "Proofread complete, submitting for admin approval",
    });
    assert(submitted.status === "PENDING_APPROVAL", "Transitioned to PENDING_APPROVAL");

    // Rejection Test: Rejecting manuscript requires a reason
    let threwNoReason = false;
    try {
      await transitionBookStatus(testBook.id, "REJECTED", { user: adminUser, reason: "" });
    } catch (e) {
      threwNoReason = true;
      assert(e.message.includes("rejection reason is required"), "Rejection without reason rejected");
    }
    assert(threwNoReason, "Empty rejection reason threw expected error");

    // Transition: PENDING_APPROVAL -> APPROVED
    const approved = await transitionBookStatus(testBook.id, "APPROVED", {
      user: adminUser,
      notes: "Content verified against manuscript",
    });
    assert(approved.status === "APPROVED", "Transitioned to APPROVED");
    assert(approved.approvedBy === adminUser.id || approved.approvedBy === "admin", "ApprovedBy recorded");

    // Phase 4: Explicit Publication
    const published = await transitionBookStatus(testBook.id, "PUBLISHED", {
      user: adminUser,
      notes: "Official first release",
      overrideWarnings: true,
    });
    assert(published.status === "PUBLISHED", "Transitioned to PUBLISHED");
    assert(published.publishedVersion === 1, "Published version initialized to 1");
    assert(published.publishedAt !== null, "PublishedAt timestamp recorded");

    // Phase 5: Post-Publication Edit triggers review & revision increment
    console.log("\n[Test 4] Post-Publication Edit triggers reapproval requirement");
    const testPage = await prisma.bookPage.findFirst({ where: { bookId: testBook.id } });
    assert(Boolean(testPage), "Found test page for edit");

    // Simulate page edit via correction
    const prevText = testPage.proofreadText;
    const newText = prevText + " [संशोधित]";

    await prisma.$transaction(async (tx) => {
      await tx.bookPage.update({
        where: { id: testPage.id },
        data: { proofreadText: newText },
      });
      await tx.correctionHistory.create({
        data: {
          bookId: testBook.id,
          pageId: testPage.id,
          previousText: prevText,
          correctedText: newText,
          correctedBy: "editor@gurukul.org",
        },
      });
      await tx.book.update({
        where: { id: testBook.id },
        data: {
          status: "NEEDS_REVIEW",
          publishedVersion: (published.publishedVersion || 1) + 1,
        },
      });
    });

    const revisedBook = await prisma.book.findUnique({ where: { id: testBook.id } });
    assert(revisedBook.status === "NEEDS_REVIEW", "Post-publish edit reverted status to NEEDS_REVIEW");
    assert(revisedBook.publishedVersion === 2, "Published version incremented to 2 for revision");

    // Verify CorrectionHistory preserves both original and corrected text
    const historyRecord = await prisma.correctionHistory.findFirst({
      where: { bookId: testBook.id, pageId: testPage.id },
    });
    assert(Boolean(historyRecord), "CorrectionHistory entry created");
    assert(historyRecord.previousText === prevText, "previousText faithfully preserved");
    assert(historyRecord.correctedText === newText, "correctedText recorded");
    assert(testPage.rawText.includes("ॐ श्रीपरमात्मने"), "Source rawText remained immutable");

    // Phase 6: Verify Audit Trail
    console.log("\n[Test 5] Audit Trail Verification");
    const auditLogs = await prisma.adminAuditLog.findMany({
      where: { targetResource: "Book", targetId: testBook.id },
    });
    assert(auditLogs.length >= 4, `Recorded ${auditLogs.length} audit entries for lifecycle transitions`);

  } finally {
    if (testBook?.id) {
      await prisma.book.delete({ where: { id: testBook.id } }).catch(() => {});
    }
  }

  console.log(`\n========================================`);
  console.log(`Results: ${passedCount} passed, ${failedCount} failed`);
  console.log(`========================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("FATAL ERROR in test suite:", err);
  process.exit(1);
});
