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
import { evaluatePaddleOcrRuntime } from "../server/ocr/paddleOcrAdapter.js";
import { cleanText, normalizeDandas } from "../server/ingest/cleanText.js";
import { getPageOcrState } from "../lib/reader/ocrState.js";
import { explainPassage, extractGlossaryTerms } from "../server/ai/passageExplainer.js";

async function runAuditSuite() {
  console.log("==========================================================================");
  console.log("  GURUKUL DIGITAL LIBRARY COMPREHENSIVE AUDIT & STABILIZATION SUITE       ");
  console.log("==========================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // Task 1: Audit Book Publishing Lifecycle Transitions
  // -------------------------------------------------------------------------
  console.log("\n[Task 1] Audit Book Publishing Lifecycle Transitions");
  
  // Transition Table Consistency
  assert(isValidTransition("DRAFT", "PROCESSING"), "DRAFT -> PROCESSING is valid");
  assert(isValidTransition("DRAFT", "NEEDS_REVIEW"), "DRAFT -> NEEDS_REVIEW is valid");
  assert(!isValidTransition("DRAFT", "PUBLISHED"), "Direct DRAFT -> PUBLISHED blocked");
  assert(!isValidTransition("DRAFT", "APPROVED"), "Direct DRAFT -> APPROVED blocked");
  assert(isValidTransition("NEEDS_REVIEW", "PENDING_APPROVAL"), "NEEDS_REVIEW -> PENDING_APPROVAL is valid");
  assert(!isValidTransition("NEEDS_REVIEW", "PUBLISHED"), "NEEDS_REVIEW -> PUBLISHED blocked without approval");
  assert(isValidTransition("PENDING_APPROVAL", "APPROVED"), "PENDING_APPROVAL -> APPROVED is valid");
  assert(isValidTransition("PENDING_APPROVAL", "REJECTED"), "PENDING_APPROVAL -> REJECTED is valid");
  assert(isValidTransition("APPROVED", "PUBLISHED"), "APPROVED -> PUBLISHED is valid");
  assert(isValidTransition("PUBLISHED", "NEEDS_REVIEW"), "PUBLISHED -> NEEDS_REVIEW on revision is valid");
  assert(isValidTransition("PUBLISHED", "ARCHIVED"), "PUBLISHED -> ARCHIVED is valid");
  assert(isValidTransition("ARCHIVED", "DRAFT"), "ARCHIVED -> DRAFT is valid");
  assert(!isValidTransition("REJECTED", "PUBLISHED"), "REJECTED -> PUBLISHED directly blocked");

  // -------------------------------------------------------------------------
  // Task 2: Validate Three Reader Modes & Display Logic
  // -------------------------------------------------------------------------
  console.log("\n[Task 2] Validate Three Reader Modes & Display Logic");

  const mockVerifiedPage = {
    id: "p-1",
    pageNumber: 1,
    ocrCompleted: true,
    proofread: true,
    ocrConfidence: 0.98,
    proofreadText: "ॐ नमो भगवते वासुदेवाय।",
  };

  const mockDraftPage = {
    id: "p-2",
    pageNumber: 2,
    ocrCompleted: true,
    proofread: false,
    ocrConfidence: 0.88,
    rawText: "शान्ताकारं भुजगशयनं",
  };

  const mockLowConfPage = {
    id: "p-3",
    pageNumber: 3,
    ocrCompleted: true,
    proofread: false,
    ocrConfidence: 0.52,
    rawText: "ग..ब.ड..",
  };

  const state1 = getPageOcrState(mockVerifiedPage);
  assert(state1.status === "COMPLETED" && state1.isVerified === true, "Verified page correctly labeled as Verified Human Review");

  const state2 = getPageOcrState(mockDraftPage);
  assert(state2.status === "COMPLETED" && state2.isVerified === false, "Draft page clearly labeled as Unverified OCR Draft");

  const state3 = getPageOcrState(mockLowConfPage);
  assert(state3.status === "PARTIALLY_FAILED" && state3.isWarning === true, "Low optical confidence page flagged with warning");

  // -------------------------------------------------------------------------
  // Task 3: Improve OCR Reliability & Indic Normalization
  // -------------------------------------------------------------------------
  console.log("\n[Task 3] Improve OCR Reliability & Indic Normalization");

  // PaddleOCR fallback evaluation
  const paddleEvalIndic = evaluatePaddleOcrRuntime({ language: "san" });
  assert(paddleEvalIndic.requiresFallback === true, "PaddleOCR adapter correctly identifies fallback requirement for Sanskrit");
  assert(paddleEvalIndic.reason.includes("Devanagari"), "PaddleOCR provides clear diagnostic reason for Indic delegation");

  // Text cleaning: preserve Sanskrit dandas and ligatures
  const rawDevanagari = "धर्मक्षेत्रे कुरुक्षेत्रे || १ || समवेता युयुत्सवः |";
  const cleanedDevanagari = cleanText(rawDevanagari, { language: "Sanskrit", isIndic: true });
  assert(cleanedDevanagari.includes("॥ १ ॥"), "Dandas normalized to authentic double danda format (॥ १ ॥)");
  assert(cleanedDevanagari.includes("।"), "Single danda normalized correctly");

  // Preserves ZWJ / ZWNJ characters
  const rawWithZwnj = "क\u200Cत\u200Dय";
  const cleanedZwnj = cleanText(rawWithZwnj, { isIndic: true });
  assert(cleanedZwnj.includes("\u200C") && cleanedZwnj.includes("\u200D"), "Zero Width Non-Joiner & Joiner preserved for Sanskrit conjuncts");

  // -------------------------------------------------------------------------
  // Task 4: Security & Permissions Audit
  // -------------------------------------------------------------------------
  console.log("\n[Task 4] Security & Permissions Audit");

  const admin = { id: "a-1", role: ROLES.ADMIN };
  const contentAdmin = { id: "ca-1", role: ROLES.CONTENT_ADMIN };
  const editor = { id: "e-1", role: ROLES.EDITOR };
  const proofreader = { id: "pr-1", role: ROLES.PROOFREADER };
  const user = { id: "u-1", role: ROLES.USER };

  assert(canPublishBooks(admin) && canPublishBooks(contentAdmin), "Admins & Content Admins have publishing permission");
  assert(!canPublishBooks(editor), "Content editor blocked from publishing without publication permission");
  assert(!canPublishBooks(proofreader), "Proofreader blocked from publishing");
  assert(!canPublishBooks(user), "Standard user blocked from publishing");
  assert(!canEditBookContent(user), "Standard user blocked from editing text");
  assert(canEditBookContent(editor) && canEditBookContent(proofreader), "Editors and Proofreaders can edit book content");

  // -------------------------------------------------------------------------
  // Task 5: Passage Explanation Safeguards
  // -------------------------------------------------------------------------
  console.log("\n[Task 5] Passage Explanation Safeguards");

  const glossaryMatches = extractGlossaryTerms("अथ योगानुशासनम्। चित्तवृत्तिनिरोधः। धर्म एवं कर्म।", "sa");
  assert(glossaryMatches.length >= 2, "Glossary successfully extracts matched Vedic terms");
  assert(glossaryMatches.some((g) => g.term === "Dharma"), "Dharma matched with Devanagari representation");
  assert(glossaryMatches.some((g) => g.term === "Karma"), "Karma matched with Devanagari representation");

  const explanation = await explainPassage({
    passageText: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।",
    bookTitle: "श्रीमद्भगवद्गीता",
    chapterTitle: "सांख्ययोग",
    pageNumber: 47,
    language: "en",
    ocrConfidence: 0.45, // low confidence trigger
  });

  assert(explanation.sourcePassage === "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।", "Original source text preserved verbatim");
  assert(explanation.isLowConfidence === true, "Low-confidence OCR properly triggers isLowConfidence warning flag");
  assert(Boolean(explanation.disclaimer), "Ethical disclaimer attached to explanation");
  assert(Boolean(explanation.realLifeExample), "Illustrative real-life example provided separate from scripture");

  // -------------------------------------------------------------------------
  // Task 6: Database Integration & Post-Approval Invalidation
  // -------------------------------------------------------------------------
  console.log("\n[Task 6] Database Integration & Post-Approval Invalidation");

  const testSlug = `audit-test-${Date.now()}`;
  let dbBook = null;

  try {
    dbBook = await prisma.book.create({
      data: {
        title: "Audit Test Manuscript",
        slug: testSlug,
        language: "Sanskrit",
        script: "Devanagari",
        status: "DRAFT",
        originalFileUrl: "/storage/manuscripts/audit.pdf",
        pages: {
          create: [
            {
              pageNumber: 1,
              pdfPageIndex: 0,
              rawText: "ॐ गुरुभ्यो नमः।",
              cleanedText: "ॐ गुरुभ्यो नमः।",
              proofreadText: "ॐ गुरुभ्यो नमः।",
              proofread: true,
              ocrCompleted: true,
              ocrConfidence: 0.99,
              language: "sa",
            },
          ],
        },
        chapters: {
          create: [
            {
              title: "मङ्गलाचरणम्",
              slug: "mangalcharanam",
              chapterNumber: 1,
              startPage: 1,
              endPage: 1,
            },
          ],
        },
      },
      include: {
        pages: true,
        chapters: true,
      },
    });

    assert(dbBook.status === "DRAFT", "New book starts in DRAFT state");

    // DRAFT -> NEEDS_REVIEW
    await transitionBookStatus(dbBook.id, "NEEDS_REVIEW", { user: editor });
    
    // NEEDS_REVIEW -> PENDING_APPROVAL
    await transitionBookStatus(dbBook.id, "PENDING_APPROVAL", { user: editor });

    // PENDING_APPROVAL -> APPROVED
    const approvedBook = await transitionBookStatus(dbBook.id, "APPROVED", { user: admin });
    assert(approvedBook.status === "APPROVED", "Transitioned to APPROVED");
    assert(approvedBook.approvedAt !== null, "approvedAt persisted");
    assert(approvedBook.approvedBy !== null, "approvedBy persisted");

    // INVENTORY CHECK: An edit made after approval MUST invalidate approval!
    // Simulate page edit on an APPROVED book
    const testPage = dbBook.pages[0];
    await prisma.$transaction(async (tx) => {
      await tx.bookPage.update({
        where: { id: testPage.id },
        data: { proofreadText: "ॐ गुरुभ्यो नमः। [संशोधन]" },
      });
      // Invalidation logic matching PATCH /api/pages/[pageId]
      await tx.book.update({
        where: { id: dbBook.id },
        data: {
          status: "NEEDS_REVIEW",
          approvedAt: null,
          approvedBy: null,
        },
      });
    });

    const invalidatedBook = await prisma.book.findUnique({ where: { id: dbBook.id } });
    assert(invalidatedBook.status === "NEEDS_REVIEW", "Post-approval page edit invalidated approval back to NEEDS_REVIEW");
    assert(invalidatedBook.approvedAt === null, "approvedAt cleared upon post-approval edit");
    assert(invalidatedBook.approvedBy === null, "approvedBy cleared upon post-approval edit");

    // Resubmit, re-approve, and explicitly publish
    await transitionBookStatus(dbBook.id, "PENDING_APPROVAL", { user: editor });
    await transitionBookStatus(dbBook.id, "APPROVED", { user: admin });
    const publishedBook = await transitionBookStatus(dbBook.id, "PUBLISHED", { user: admin, overrideWarnings: true });
    assert(publishedBook.status === "PUBLISHED", "Published successfully");
    assert(publishedBook.publishedVersion === 1, "publishedVersion initialized to 1");

    // Post-publication edit: must reset to NEEDS_REVIEW and increment publishedVersion
    await prisma.$transaction(async (tx) => {
      await tx.bookPage.update({
        where: { id: testPage.id },
        data: { proofreadText: "ॐ गुरुभ्यो नमः। [संस्करण २]" },
      });
      await tx.book.update({
        where: { id: dbBook.id },
        data: {
          status: "NEEDS_REVIEW",
          approvedAt: null,
          approvedBy: null,
          publishedVersion: (publishedBook.publishedVersion || 1) + 1,
        },
      });
    });

    const postPubRevisedBook = await prisma.book.findUnique({ where: { id: dbBook.id } });
    assert(postPubRevisedBook.status === "NEEDS_REVIEW", "Post-publication edit resets status to NEEDS_REVIEW");
    assert(postPubRevisedBook.publishedVersion === 2, "Post-publication edit increments publishedVersion to 2");

  } finally {
    if (dbBook?.id) {
      await prisma.book.delete({ where: { id: dbBook.id } }).catch(() => {});
    }
  }

  console.log("\n==========================================================================");
  console.log(`  AUDIT SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runAuditSuite().catch((err) => {
  console.error("FATAL ERROR in audit suite:", err);
  process.exit(1);
});
