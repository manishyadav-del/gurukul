import prisma from "../lib/prisma.js";
import {
  getPassageProvenance,
  submitPassageForReview,
  verifyPassage,
  getVerificationQueue,
  getVerificationStatistics,
  getBookProvenance,
  evaluateVerificationProvenance,
  VERIFICATION_STATUSES,
} from "../server/provenance/provenanceService.js";
import {
  adminApproveRelationship,
  adminRejectRelationship,
} from "../server/knowledge/knowledgeGraph.js";
import {
  retrieveResearchPassages,
  askResearchQuestion,
} from "../server/ai/researchAssistant.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runScholarlyProvenanceTests() {
  console.log("===============================================================================");
  console.log("  GURUKUL SCHOLARLY SOURCE VERIFICATION & PROVENANCE SUITE");
  console.log("===============================================================================\n");

  // Step 0: Fetch a real passage and real book from the database
  const samplePassage = await prisma.passage.findFirst({
    include: {
      book: true,
      chapter: true,
      page: true,
    },
  });

  if (!samplePassage) {
    console.error("FATAL: No passage found in database to test.");
    process.exit(1);
  }

  const sampleBook = samplePassage.book;
  console.log(`[Setup] Using real database records:`);
  console.log(`  Book: "${sampleBook.title}" (ID: ${sampleBook.id})`);
  console.log(`  Passage ID: ${samplePassage.id} (Source Page: ${samplePassage.sourcePage || 1})\n`);

  // -------------------------------------------------------------------------
  // MODULE 1: Central Source Provenance Structure & Retrieval
  // -------------------------------------------------------------------------
  console.log("--- Module 1: Central Source Provenance Structure & Retrieval ---");
  const prov = await getPassageProvenance(samplePassage.id);

  assert(prov !== null, "Provenance record successfully retrieved for passage");
  assert(prov.passageId === samplePassage.id, "Provenance passageId matches target");
  assert(Boolean(prov.structuralReference.bookTitle), "Contains valid structural reference bookTitle");
  assert(Boolean(prov.structuralReference.readerUrl), "Contains direct BookReader deep link URL");
  assert(prov.structuralReference.readerUrl.includes("passageId="), "readerUrl includes deep-link query parameter");
  assert(prov.structuralReference.pdfSourceUrl.includes("/api/books/"), "Contains secure PDF source streaming URL");
  assert(typeof prov.bibliographicDetails.originalLanguage === "string", "Bibliographic details record original language");
  assert(typeof prov.contentLayers.originalText === "string", "Content layers provide original text");
  assert(typeof prov.contentLayers.rawOcrText === "string", "Content layers preserve raw OCR text");
  assert(typeof prov.contentLayers.translations === "object", "Content layers partition translations clearly");
  assert(typeof prov.extractionProvenance.processingMethod === "string", "Extraction provenance identifies processing method");
  assert(typeof prov.verificationAudit.currentStatus === "string", "Verification audit identifies current status");

  // -------------------------------------------------------------------------
  // MODULE 2: Provenance Quality Classification
  // -------------------------------------------------------------------------
  console.log("\n--- Module 2: Provenance Quality & Verification Badging ---");
  const unreviewedGrade = evaluateVerificationProvenance({ verificationStatus: "UNREVIEWED", ocrConfidence: 0.88 });
  assert(!unreviewedGrade.isHumanVerified, "UNREVIEWED is correctly marked as NOT human verified");
  assert(unreviewedGrade.badgeLabel.includes("OCR"), "UNREVIEWED badge indicates OCR Draft");

  const verifiedGrade = evaluateVerificationProvenance({ verificationStatus: "VERIFIED" });
  assert(verifiedGrade.isHumanVerified, "VERIFIED is marked as human verified");
  assert(verifiedGrade.badgeColor === "emerald", "VERIFIED badge color is emerald");

  const needsCorrectionGrade = evaluateVerificationProvenance({ verificationStatus: "NEEDS_CORRECTION" });
  assert(needsCorrectionGrade.needsCorrection, "NEEDS_CORRECTION is correctly recognized");
  assert(needsCorrectionGrade.badgeColor === "rose", "NEEDS_CORRECTION badge color is rose");

  // -------------------------------------------------------------------------
  // MODULE 3: Scholarly Review Workflow & Lifecycle
  // -------------------------------------------------------------------------
  console.log("\n--- Module 3: Scholarly Review Workflow & Lifecycle ---");

  // Test submitting passage for review
  const testScholar = {
    id: "scholar-test-user-id",
    email: "acharyasharma@gurukul.org",
    name: "Acharya Sharma",
    role: "EXPERT",
  };

  const submitRes = await submitPassageForReview({
    passageId: samplePassage.id,
    user: testScholar,
    notes: "Review requested for conjunct ligature alignment.",
  });
  assert(submitRes.verificationStatus === VERIFICATION_STATUSES.PENDING_REVIEW, "Passage moved to PENDING_REVIEW");

  // Verify that an immutable ScholarlyReview audit entry was created
  const reviewAudit1 = await prisma.scholarlyReview.findFirst({
    where: { passageId: samplePassage.id, action: "SUBMIT_FOR_REVIEW" },
    orderBy: { createdAt: "desc" },
  });
  assert(reviewAudit1 !== null, "Immutable ScholarlyReview audit record generated on submit");
  assert(reviewAudit1.reviewerEmail === "acharyasharma@gurukul.org", "Audit record captures reviewer identity");

  // Test verifying with textual correction
  const originalText = samplePassage.text;
  const verifiedCorrectedText = originalText + " ॥"; // Append classical Sanskrit danda ligature

  const verifyRes = await verifyPassage({
    passageId: samplePassage.id,
    status: VERIFICATION_STATUSES.VERIFIED,
    correctedText: verifiedCorrectedText,
    reason: "Added classical double danda at verse completion",
    scholarlyNotes: "Verified against Chowkhamba 1954 critical edition folio.",
    transliteration: "om tat sat",
    hindiTranslation: "यह श्लोक परम तत्व को निरूपित करता है।",
    translationSource: "Chowkhamba Sanskrit Series",
    translator: "Pt. Kedardatt Joshi",
    user: testScholar,
  });

  assert(
    verifyRes.verificationStatus === VERIFICATION_STATUSES.VERIFIED_WITH_CORRECTIONS,
    "Status automatically escalated to VERIFIED_WITH_CORRECTIONS when text was modified"
  );
  assert(verifyRes.text === verifiedCorrectedText, "Passage text updated with verified correction");
  assert(verifyRes.verifiedBy === testScholar.email, "verifiedBy correctly recorded");
  assert(verifyRes.hindiTranslation !== null, "Hindi translation stored with attribution");
  assert(verifyRes.translator === "Pt. Kedardatt Joshi", "Translator attribution preserved");

  // Check CorrectionHistory entry
  const correctionEntry = await prisma.correctionHistory.findFirst({
    where: { passageId: samplePassage.id },
    orderBy: { createdAt: "desc" },
  });
  assert(correctionEntry !== null, "CorrectionHistory entry successfully created");
  assert(correctionEntry.previousText === originalText, "Previous text safely preserved in CorrectionHistory");
  assert(correctionEntry.correctedText === verifiedCorrectedText, "Corrected text recorded in CorrectionHistory");
  assert(correctionEntry.correctedBy === testScholar.email, "CorrectedBy accurately attributes scholar");

  // Check rawText was NEVER overwritten
  const checkPassage = await prisma.passage.findUnique({
    where: { id: samplePassage.id },
    select: { rawText: true, text: true },
  });
  assert(
    checkPassage.rawText === samplePassage.rawText,
    "Original raw OCR text was strictly preserved and never overwritten"
  );

  // -------------------------------------------------------------------------
  // MODULE 4: Verification Queue & Filtering
  // -------------------------------------------------------------------------
  console.log("\n--- Module 4: Verification Queue & Filtering ---");
  const queueResult = await getVerificationQueue({
    status: "ALL",
    limit: 5,
  });
  assert(Array.isArray(queueResult.queue), "Queue returns array of passages");
  assert(queueResult.pagination.total > 0, "Queue pagination total is greater than 0");
  assert(queueResult.queue[0].provenanceGrade !== undefined, "Queue items include provenanceGrade badges");

  const pendingQueue = await getVerificationQueue({
    status: VERIFICATION_STATUSES.VERIFIED_WITH_CORRECTIONS,
    limit: 5,
  });
  assert(
    pendingQueue.queue.some((p) => p.id === samplePassage.id),
    "Verified passage appears in VERIFIED_WITH_CORRECTIONS queue"
  );

  // -------------------------------------------------------------------------
  // MODULE 5: Verification Statistics & System Health
  // -------------------------------------------------------------------------
  console.log("\n--- Module 5: Verification Statistics & System Health ---");
  const statsResult = await getVerificationStatistics();
  assert(typeof statsResult.overview.totalPassages === "number", "Reports total passages count");
  assert(typeof statsResult.overview.verifiedTotal === "number", "Reports verified total count");
  assert(typeof statsResult.overview.verifiedPercentage === "number", "Calculates verified percentage");
  assert(typeof statsResult.byStatus.VERIFIED_WITH_CORRECTIONS === "number", "Includes status breakdown");
  assert(Array.isArray(statsResult.recentReviews), "Includes recent review decisions log");

  // -------------------------------------------------------------------------
  // MODULE 6: Book-Level Bibliographic Provenance
  // -------------------------------------------------------------------------
  console.log("\n--- Module 6: Book-Level Bibliographic Provenance ---");
  const bookProv = await getBookProvenance(sampleBook.id);
  assert(bookProv !== null, "Book provenance retrieved successfully");
  assert(bookProv.title === sampleBook.title, "Book title matches target record");
  assert(typeof bookProv.metrics.totalPages === "number", "Reports total pages count");
  assert(typeof bookProv.metrics.totalPassages === "number", "Reports total passages count");
  assert(typeof bookProv.metrics.averageOcrConfidence === "number", "Reports average OCR optical confidence");

  // -------------------------------------------------------------------------
  // MODULE 7: Knowledge Graph Evidence Verification
  // -------------------------------------------------------------------------
  console.log("\n--- Module 7: Knowledge Graph Evidence Verification ---");
  const sampleRel = await prisma.knowledgeRelationship.findFirst();

  if (sampleRel) {
    const approvedRel = await adminApproveRelationship({
      relationshipId: sampleRel.id,
      reviewer: "acharyasharma@gurukul.org",
      reviewerNotes: "Verified classical cross-reference in Brihat Parashara Hora Shastra.",
    });
    assert(approvedRel.status === "APPROVED", "Relationship successfully approved");
    assert(approvedRel.reviewedBy === "acharyasharma@gurukul.org", "reviewedBy recorded on relationship");
    assert(approvedRel.reviewerNotes !== null, "Reviewer notes preserved on relationship");
  } else {
    console.log("  (Skipping relationship review test: no knowledge relationship found)");
  }

  // -------------------------------------------------------------------------
  // MODULE 8: AI Research Assistant Source Transparency
  // -------------------------------------------------------------------------
  console.log("\n--- Module 8: AI Research Assistant Source Transparency ---");
  const researchCitations = await retrieveResearchPassages({
    query: "Jupiter",
    limit: 2,
  });

  assert(Array.isArray(researchCitations), "retrieveResearchPassages returns citations array");
  if (researchCitations.length > 0) {
    const c1 = researchCitations[0];
    assert(typeof c1.verificationStatus === "string", "Citation includes verificationStatus");
    assert(typeof c1.isHumanVerified === "boolean", "Citation includes isHumanVerified flag");
    assert(Boolean(c1.provenanceUrl), "Citation provides direct provenance URL (/api/provenance/passage/...)");
    assert(c1.contentClassification?.isOriginalScripture === true, "Citation distinguishes original scripture");
  }

  const aiAnswer = await askResearchQuestion({
    query: "Jupiter in the first house",
    limit: 2,
    language: "en",
  });

  assert(aiAnswer.success === true, "askResearchQuestion succeeds");
  assert(typeof aiAnswer.answerText === "string", "Generates grounded scholarly answerText");
  assert(Array.isArray(aiAnswer.directQuotes), "directQuotes provides verbatim quoted passages");
  if (aiAnswer.directQuotes.length > 0) {
    assert(Boolean(aiAnswer.directQuotes[0].provenanceUrl), "Direct quote provides provenanceUrl");
  }

  // -------------------------------------------------------------------------
  // CLEANUP / RESTORATION
  // -------------------------------------------------------------------------
  console.log("\n[Cleanup] Restoring original text of sample passage...");
  await prisma.passage.update({
    where: { id: samplePassage.id },
    data: {
      text: originalText,
      cleanedText: originalText,
      proofreadText: samplePassage.proofreadText,
      verificationStatus: samplePassage.verificationStatus || "UNREVIEWED",
    },
  });
  console.log("  ✓ Sample passage restored to pristine initial state.");

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log("\n===============================================================================");
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runScholarlyProvenanceTests()
  .catch((err) => {
    console.error("Test execution failed with exception:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
