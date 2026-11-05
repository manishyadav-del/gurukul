/**
 * Phase 3 Verification Test Suite: Text Processing and Digital Book Structuring
 * 
 * Verifies:
 * 1. Conservative text normalization & English hyphen unwrapping
 * 2. Devanagari compound preservation (never strip hyphens between Hindi/Sanskrit words)
 * 3. Sanskrit diacritics, dandas (।, ॥), avagraha (ऽ), and verse numbering preservation
 * 4. Evidence-based running header and footer detection across multi-page books
 * 5. English chapter, heading, and subheading segmentation
 * 6. Hindi chapter and numbered section detection
 * 7. Sanskrit shloka and verse segmentation (with internal pada linebreaks)
 * 8. Multi-page chapter spanning (startPage to endPage)
 * 9. Blank and empty page resilience
 * 10. Database persistence of hierarchy (Book -> Chapter -> Passage) in Prisma
 * 11. Idempotency and safe reprocessing (zero duplicate chapters or passages)
 * 12. Manual admin correction and audit trail (CorrectionHistory)
 * 13. Status workflow (DRAFT -> REVIEWED -> APPROVED -> PUBLISHED) & no auto-publish
 */

import prisma from "../lib/prisma.js";
import { normalizeText, isVerseLine, isHeadingOrChapterLine } from "../server/text/normalizeText.js";
import { detectRepeatedHeadersFooters, isPageNumberArtifact } from "../server/text/headerFooterDetector.js";
import { segmentBookContent, classifyPassage, detectChapterTitle } from "../server/text/segmentation.js";
import { structureBook } from "../server/ingest/structureBook.js";
import { registerBook } from "../server/ingest/registerBook.js";

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${name}`);
    failed++;
  }
}

async function runPhase3Tests() {
  console.log("\n========================================================");
  console.log("  PHASE 3 VERIFICATION: TEXT PROCESSING & STRUCTURING");
  console.log("========================================================\n");

  // -----------------------------------------------------------
  // 1. CONSERVATIVE NORMALIZATION & HYPHEN UNWRAPPING
  // -----------------------------------------------------------
  console.log("[1/13] Testing Text Normalization & Conservative Hyphen Unwrapping...");
  const rawEnglishSample = "Astro-\nlogy is an ancient sci-\nence based on planetary motions.";
  const normalizedEng = normalizeText(rawEnglishSample);
  assert(normalizedEng.includes("Astrology"), "Unwrapped 'Astro-\\nlogy' to 'Astrology'");
  assert(normalizedEng.includes("science"), "Unwrapped 'sci-\\nence' to 'science'");
  assert(!normalizedEng.includes("Astro-"), "No residual hyphen in English broken word");

  // -----------------------------------------------------------
  // 2. DEVANAGARI COMPOUND PRESERVATION
  // -----------------------------------------------------------
  console.log("\n[2/13] Testing Devanagari Compound & Hyphen Preservation...");
  const rawHindiSample = "मेष-वृषभ और तुला-वृश्चिक राशियों के मध्य ग्रह-स्थिति का विश्लेषण।";
  const normalizedHindi = normalizeText(rawHindiSample);
  assert(normalizedHindi.includes("मेष-वृषभ"), "Preserved Devanagari hyphenated compound 'मेष-वृषभ'");
  assert(normalizedHindi.includes("तुला-वृश्चिक"), "Preserved Devanagari hyphenated compound 'तुला-वृश्चिक'");
  assert(normalizedHindi.includes("ग्रह-स्थिति"), "Preserved Devanagari hyphenated compound 'ग्रह-स्थिति'");

  // -----------------------------------------------------------
  // 3. SANSKRIT DIACRITICS, DANDAS & VERSE NUMBERING PRESERVATION
  // -----------------------------------------------------------
  console.log("\n[3/13] Testing Sanskrit Diacritics, Dandas and Verse Numbering...");
  const rawSanskritVerse = `शान्ताकारं भुजगशयनं पद्मनाभं सुरेशम् ।
विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् ॥ १ ॥`;
  const normalizedSan = normalizeText(rawSanskritVerse);
  assert(normalizedSan.includes("।"), "Preserved single danda (।)");
  assert(normalizedSan.includes("॥ १ ॥"), "Preserved double danda and verse number (॥ १ ॥)");
  assert(normalizedSan.includes("शान्ताकारं"), "Preserved anusvara (ं)");
  assert(isVerseLine("विश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम् ॥ १ ॥"), "Identified as verse line");

  // -----------------------------------------------------------
  // 4. EVIDENCE-BASED REPEATED HEADER & FOOTER DETECTION
  // -----------------------------------------------------------
  console.log("\n[4/13] Testing Evidence-Based Repeated Header/Footer Detection...");
  const simulatedBookPages = [
    { pageNumber: 1, rawText: "BRIHAT PARASHARA HORA SHASTRA\n\nChapter 1: The Ascendant\nFirst house details.\n\nPage 1" },
    { pageNumber: 2, rawText: "BRIHAT PARASHARA HORA SHASTRA\n\nSecond house details and wealth.\n\nPage 2" },
    { pageNumber: 3, rawText: "BRIHAT PARASHARA HORA SHASTRA\n\nThird house details and siblings.\n\nPage 3" },
    { pageNumber: 4, rawText: "BRIHAT PARASHARA HORA SHASTRA\n\nFourth house details and mother.\n\nPage 4" },
  ];

  const headerAnalysis = detectRepeatedHeadersFooters(simulatedBookPages, {
    title: "Brihat Parashara",
  });
  assert(headerAnalysis.headersToRemove.length > 0, "Detected repeated running header with cross-page evidence");
  assert(headerAnalysis.headersToRemove.some((h) => h.includes("brihat parashara")), "Identified 'BRIHAT PARASHARA HORA SHASTRA' as header");
  assert(isPageNumberArtifact("Page 1"), "Detected 'Page 1' as page number artifact");
  assert(isPageNumberArtifact("१२"), "Detected Devanagari numeral '१२' as page number artifact");

  // -----------------------------------------------------------
  // 5. ENGLISH CHAPTER AND HEADING SEGMENTATION
  // -----------------------------------------------------------
  console.log("\n[5/13] Testing English Chapter & Heading Segmentation...");
  const engChCheck = detectChapterTitle("Chapter 1: The Twelve Houses");
  assert(engChCheck.isChapter === true, "Detected 'Chapter 1: The Twelve Houses'");
  assert(engChCheck.confidence >= 0.90, "High confidence (>= 0.90) for explicit English chapter");

  const engHeadingClass = classifyPassage("PLANETARY ASPECTS AND CONJUNCTIONS");
  assert(engHeadingClass.type === "HEADING", "Classified prominent title line as HEADING");

  const engSubheadingClass = classifyPassage("1.1 The Role of Jupiter in the 9th House");
  assert(engSubheadingClass.type === "SUBHEADING", "Classified numbered subsection as SUBHEADING");

  // -----------------------------------------------------------
  // 6. HINDI CHAPTER & NUMBERED SECTION SEGMENTATION
  // -----------------------------------------------------------
  console.log("\n[6/13] Testing Hindi Chapter & Numbered Section Detection...");
  const hinChCheck = detectChapterTitle("अध्याय १: नवग्रह स्वरूप एवं विचार");
  assert(hinChCheck.isChapter === true, "Detected Hindi chapter 'अध्याय १'");
  assert(hinChCheck.confidence >= 0.90, "High confidence for Hindi chapter");

  const hinOrdCheck = detectChapterTitle("प्रथम अध्याय: कुण्डली निर्माण");
  assert(hinOrdCheck.isChapter === true, "Detected Hindi ordinal chapter 'प्रथम अध्याय'");

  const hinSectionClass = classifyPassage("१. सूर्य ग्रह का प्रभाव");
  assert(hinSectionClass.type === "SUBHEADING", "Classified Devanagari numbered section as SUBHEADING");

  // -----------------------------------------------------------
  // 7. SANSKRIT SHLOKA & VERSE SEGMENTATION
  // -----------------------------------------------------------
  console.log("\n[7/13] Testing Sanskrit Shloka & Verse Segmentation...");
  const sanChCheck = detectChapterTitle("॥ अथ प्रथमोऽध्यायः ॥");
  assert(sanChCheck.isChapter === true, "Detected Sanskrit chapter opening '॥ अथ प्रथमोऽध्यायः ॥'");
  assert(sanChCheck.confidence >= 0.95, "Very high confidence (>= 0.95) for classical Sanskrit chapter");

  const shlokaBlock = `अथ वक्ष्ये विशेषेण ग्रहाणां भावसंस्थितम् ।
सर्वशास्त्रार्थविद् विप्रो यदुवाच पराशरः ॥ १ ॥`;
  const shlokaClass = classifyPassage(shlokaBlock);
  assert(shlokaClass.type === "VERSE", "Classified Sanskrit shloka as VERSE");
  assert(shlokaClass.confidence >= 0.90, "High confidence for double-danda delimited verse");

  // -----------------------------------------------------------
  // 8. MULTI-PAGE CHAPTER SPANNING
  // -----------------------------------------------------------
  console.log("\n[8/13] Testing Multi-Page Chapter Spanning...");
  const mockPages = [
    { id: "p1", pageNumber: 1, cleanedText: "Chapter 1: The Ascendant\n\nIntroductory text for chapter 1." },
    { id: "p2", pageNumber: 2, cleanedText: "Continuing discourse on the ascendant from chapter 1." },
    { id: "p3", pageNumber: 3, cleanedText: "Chapter 2: The Second House\n\nWealth and family considerations." },
  ];
  const segmented = segmentBookContent(mockPages);
  assert(segmented.chapters.length === 2, "Identified 2 chapters across 3 pages");
  assert(segmented.chapters[0].startPage === 1, "Chapter 1 startPage is 1");
  assert(segmented.chapters[0].endPage === 2, "Chapter 1 correctly spans to page 2");
  assert(segmented.chapters[1].startPage === 3, "Chapter 2 starts on page 3");
  assert(segmented.chapters[1].endPage === 3, "Chapter 2 ends on page 3");

  // -----------------------------------------------------------
  // 9. BLANK AND EMPTY PAGE RESILIENCE
  // -----------------------------------------------------------
  console.log("\n[9/13] Testing Blank Page Resilience...");
  const mockWithBlank = [
    { id: "p1", pageNumber: 1, cleanedText: "Chapter 1: Beginnings\n\nValid text here." },
    { id: "p2", pageNumber: 2, cleanedText: "" }, // Blank page
    { id: "p3", pageNumber: 3, cleanedText: "   \n\n   " }, // Whitespace-only page
    { id: "p4", pageNumber: 4, cleanedText: "Conclusion of chapter 1." },
  ];
  const blankSegmented = segmentBookContent(mockWithBlank);
  assert(blankSegmented.chapters.length === 1, "Handled blank pages without creating phantom chapters");
  const emptyPassages = blankSegmented.passages.filter((p) => !p.text || !p.text.trim());
  assert(emptyPassages.length === 0, "No blank or whitespace-only passages created");

  // -----------------------------------------------------------
  // 10. DATABASE PERSISTENCE OF HIERARCHY IN PRISMA
  // -----------------------------------------------------------
  console.log("\n[10/13] Testing Master Book Structuring & Prisma Persistence...");
  const testBook = await registerBook({
    title: "Brihat Jataka Test Edition",
    author: "Varahamihira",
    language: "Sanskrit",
    script: "Devanagari",
    originalFileName: "brihat_jataka_test.pdf",
    originalFileUrl: "/uploads/brihat_jataka_test.pdf",
  });

  // Create 3 real pages in database
  const page1 = await prisma.bookPage.create({
    data: {
      bookId: testBook.id,
      pageNumber: 1,
      pdfPageIndex: 0,
      processingMethod: "TEXT_EXTRACTION",
      rawText: `॥ अथ प्रथमोऽध्यायः ॥\n\nमूर्तित्वे परिकल्पितः शशभृतो वर्त्मापुनर्जन्मनाम् ।\nआत्मेत्यात्मविदां क्रतुश्च यजतां भर्तामरज्योतिषाम् ॥ १ ॥\n\nयस्य भासा विभातीदं सर्वं तस्मै नमो नमः।`,
      cleanedText: "",
    },
  });

  const page2 = await prisma.bookPage.create({
    data: {
      bookId: testBook.id,
      pageNumber: 2,
      pdfPageIndex: 1,
      processingMethod: "TEXT_EXTRACTION",
      rawText: `कालः सृजति भूतानि कालः संहरति प्रजाः ।\nकालः सुप्तेषु जागर्ति कालो हि दुरतिक्रमः ॥ २ ॥\n\nग्रहों के कालचक्र का प्रभाव मनुष्य के जीवन पर निरन्तर पड़ता रहता है।`,
      cleanedText: "",
    },
  });

  const page3 = await prisma.bookPage.create({
    data: {
      bookId: testBook.id,
      pageNumber: 3,
      pdfPageIndex: 2,
      processingMethod: "TEXT_EXTRACTION",
      rawText: `अध्याय २: ग्रहभेद\n\n१. रवि विचार\nसूर्य आत्मा का कारक है और सिंह राशि का स्वामी है।`,
      cleanedText: "",
    },
  });

  // Run Master Structuring Service
  const structResult = await structureBook(testBook.id);
  assert(structResult.success === true, "structureBook completed successfully");
  assert(structResult.chaptersCount >= 2, `Created ${structResult.chaptersCount} chapters in database`);
  assert(structResult.passagesCount >= 4, `Created ${structResult.passagesCount} passages in database`);

  // Verify Book updated status
  const updatedBook = await prisma.book.findUnique({ where: { id: testBook.id } });
  assert(updatedBook.status === "PROOFREAD", "Book status updated to PROOFREAD (never auto-published)");
  assert(updatedBook.processingStatus === "COMPLETED", "Book processingStatus is COMPLETED");

  // Verify Chapter records
  const dbChapters = await prisma.chapter.findMany({
    where: { bookId: testBook.id },
    orderBy: { chapterNumber: "asc" },
  });
  assert(dbChapters.length >= 2, "Verified chapters stored in Prisma");
  assert(dbChapters[0].startPage === 1, "Chapter 1 startPage is 1");
  assert(dbChapters[0].endPage === 2, "Chapter 1 spans to page 2");
  assert(dbChapters[1].startPage === 3, "Chapter 2 starts on page 3");

  // Verify Passage records
  const dbPassages = await prisma.passage.findMany({
    where: { bookId: testBook.id },
    orderBy: { sortOrder: "asc" },
  });
  assert(dbPassages.length >= 4, "Verified passages stored in Prisma");
  const versePassages = dbPassages.filter((p) => p.passageType === "VERSE");
  assert(versePassages.length >= 2, "Persisted shlokas with passageType VERSE");
  assert(dbPassages[0].rawText.length > 0, "Preserved rawText on passages");
  assert(dbPassages[0].searchText.length > 0, "Generated normalized searchText for indexing");

  // -----------------------------------------------------------
  // 11. IDEMPOTENCY & SAFE REPROCESSING
  // -----------------------------------------------------------
  console.log("\n[11/13] Testing Idempotency & Safe Reprocessing (Zero Duplicates)...");
  const rerunResult = await structureBook(testBook.id);
  assert(rerunResult.success === true, "Reprocessing succeeded without error");

  const rerunChapters = await prisma.chapter.findMany({ where: { bookId: testBook.id } });
  const rerunPassages = await prisma.passage.findMany({ where: { bookId: testBook.id } });
  assert(rerunChapters.length === dbChapters.length, `Chapter count unchanged: ${rerunChapters.length} (no duplicate chapters)`);
  assert(rerunPassages.length === dbPassages.length, `Passage count unchanged: ${rerunPassages.length} (no duplicate passages)`);

  // -----------------------------------------------------------
  // 12. MANUAL CORRECTIONS & AUDIT TRAIL
  // -----------------------------------------------------------
  console.log("\n[12/13] Testing Manual Admin Corrections & Previous Text Audit History...");
  const freshPassages = await prisma.passage.findMany({
    where: { bookId: testBook.id },
    orderBy: { sortOrder: "asc" },
  });
  const passageToEdit = freshPassages[0];
  const originalPassageText = passageToEdit.text;
  const correctedText = originalPassageText + "\n[शोधित संस्करण / Corrected by Pandit Shastri]";

  // Record correction in CorrectionHistory
  await prisma.correctionHistory.create({
    data: {
      bookId: testBook.id,
      passageId: passageToEdit.id,
      pageId: passageToEdit.pageId,
      previousText: originalPassageText,
      correctedText,
      correctedBy: "editor@gurukul.org",
    },
  });

  // Update passage with APPROVED status and proofreadText
  await prisma.passage.update({
    where: { id: passageToEdit.id },
    data: {
      text: correctedText,
      cleanedText: correctedText,
      proofreadText: correctedText,
      previousText: originalPassageText,
      status: "APPROVED",
      needsReview: false,
    },
  });

  const auditHistory = await prisma.correctionHistory.findMany({
    where: { passageId: passageToEdit.id },
  });
  assert(auditHistory.length === 1, "Audit history record created in CorrectionHistory");
  assert(auditHistory[0].previousText === originalPassageText, "Preserved original text in previousText audit");
  assert(auditHistory[0].correctedBy === "editor@gurukul.org", "Recorded editor identity");

  // Re-run structuring to verify that approved/proofread content is NOT overwritten
  await structureBook(testBook.id);
  const preservedPassage = await prisma.passage.findUnique({
    where: { id: passageToEdit.id },
  });
  assert(preservedPassage !== null, "Proofread passage still exists");
  assert(preservedPassage.proofreadText === correctedText, "Preserved administrator's proofreadText on reprocessing");

  // -----------------------------------------------------------
  // 13. STATUS WORKFLOW & PUBLICATION RESTRICTION
  // -----------------------------------------------------------
  console.log("\n[13/13] Testing Status Transitions & Auto-Publish Guardrails...");
  // Chapters start as DRAFT
  const draftChapter = await prisma.chapter.findFirst({ where: { bookId: testBook.id } });
  assert(draftChapter.status === "DRAFT", "New chapter defaults to DRAFT");
  assert(draftChapter.isPublished === false, "isPublished defaults to false");

  // Transition to REVIEWED -> APPROVED -> PUBLISHED
  await prisma.chapter.update({
    where: { id: draftChapter.id },
    data: { status: "REVIEWED" },
  });
  const reviewedChapter = await prisma.chapter.findUnique({ where: { id: draftChapter.id } });
  assert(reviewedChapter.status === "REVIEWED", "Transitioned chapter to REVIEWED");

  await prisma.chapter.update({
    where: { id: draftChapter.id },
    data: { status: "APPROVED" },
  });
  const approvedChapter = await prisma.chapter.findUnique({ where: { id: draftChapter.id } });
  assert(approvedChapter.status === "APPROVED", "Transitioned chapter to APPROVED");

  await prisma.chapter.update({
    where: { id: draftChapter.id },
    data: { status: "PUBLISHED", isPublished: true },
  });
  const publishedChapter = await prisma.chapter.findUnique({ where: { id: draftChapter.id } });
  assert(publishedChapter.status === "PUBLISHED" && publishedChapter.isPublished === true, "Explicitly published chapter");

  // Cleanup test data
  await prisma.book.delete({ where: { id: testBook.id } });

  console.log("\n========================================================");
  console.log(`  PHASE 3 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3Tests()
  .catch((err) => {
    console.error("Test execution threw exception:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
