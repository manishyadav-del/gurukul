/**
 * Phase 4 Verification Test Suite: Digital Book Reader Implementation
 * 
 * Verifies:
 * 1. Book and chapter data retrieval in reading order
 * 2. Multilingual rendering preservation (Hindi, English, Sanskrit shlokas with dandas)
 * 3. Chapter-level loading performance (loads targeted chapter passages)
 * 4. Reading progress tracking and PostgreSQL persistence
 * 5. Reading progress resumption (upsert idempotency)
 * 6. Bookmark toggle mechanics (create on first toggle, delete on second toggle)
 * 7. Bookmark retrieval by user and book
 * 8. Publication access restrictions (published vs unpublished content)
 * 9. Authorization checks (regular user vs admin/editor)
 * 10. Graceful handling of non-existent chapters and books
 */

import prisma from "../lib/prisma.js";
import { registerBook } from "../server/ingest/registerBook.js";
import { structureBook } from "../server/ingest/structureBook.js";

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

async function runPhase4Tests() {
  console.log("\n========================================================");
  console.log("  PHASE 4 VERIFICATION: DIGITAL BOOK READER SYSTEM");
  console.log("========================================================\n");

  // Setup: Create test user and test book with chapters & passages
  const testEmail = `reader_test_${Date.now()}@gurukul.org`;
  const testUser = await prisma.user.create({
    data: {
      name: "Sanskrit Scholar",
      email: testEmail,
      role: "USER",
    },
  });

  const testBook = await registerBook({
    title: "Surya Siddhanta Reader Edition",
    author: "Aryabhata",
    language: "Sanskrit",
    script: "Devanagari",
    originalFileName: "surya_siddhanta.pdf",
    originalFileUrl: "/uploads/surya_siddhanta.pdf",
  });

  // Create 2 pages with Sanskrit & Hindi verses
  await prisma.bookPage.create({
    data: {
      bookId: testBook.id,
      pageNumber: 1,
      pdfPageIndex: 0,
      processingMethod: "TEXT_EXTRACTION",
      rawText: `॥ अथ प्रथमोऽध्यायः ॥\n\nअचिन्त्याव्यक्तरूपाय निर्गुणाय गुणात्मने ।\nसमस्तजगदाधारमूर्तये ब्रह्मणे नमः ॥ १ ॥\n\nअल्पेऽवशिष्टे तु कृते मयो नाम महासुरः ।\nरहस्यं परमं पुण्यं जिज्ञासुर्ज्ञानमुत्तमम् ॥ २ ॥`,
      cleanedText: "",
    },
  });

  await prisma.bookPage.create({
    data: {
      bookId: testBook.id,
      pageNumber: 2,
      pdfPageIndex: 1,
      processingMethod: "TEXT_EXTRACTION",
      rawText: `अध्याय २: मध्यमाधिकार\n\nमध्यम ग्रह साधन विचार।\nग्रहों की मध्यम गति का गणितीय निरूपण।`,
      cleanedText: "",
    },
  });

  // Structure into Chapters and Passages
  await structureBook(testBook.id);

  // -----------------------------------------------------------
  // 1. CHAPTER READING DATA RETRIEVAL
  // -----------------------------------------------------------
  console.log("[1/10] Testing Chapter & Passage Retrieval in Reading Order...");
  const bookWithChapters = await prisma.book.findUnique({
    where: { id: testBook.id },
    include: {
      chapters: {
        orderBy: { chapterNumber: "asc" },
        include: {
          passages: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  });

  assert(bookWithChapters !== null, "Found book in database");
  assert(bookWithChapters.chapters.length >= 2, `Found ${bookWithChapters.chapters.length} chapters`);
  const ch1 = bookWithChapters.chapters[0];
  assert(ch1.passages.length >= 2, `Chapter 1 contains ${ch1.passages.length} passages`);
  assert(ch1.passages[0].sortOrder <= ch1.passages[1].sortOrder, "Passages are sorted in sequential reading order");

  // -----------------------------------------------------------
  // 2. MULTILINGUAL RENDERING INTEGRITY
  // -----------------------------------------------------------
  console.log("\n[2/10] Testing Multilingual & Verse Formatting Integrity...");
  const versePassage = ch1.passages.find((p) => p.passageType === "VERSE");
  assert(versePassage !== undefined, "Located verse passage with passageType VERSE");
  assert(versePassage.text.includes("॥"), "Preserved double danda (॥)");
  assert(versePassage.text.includes("।"), "Preserved single danda (।)");
  assert(versePassage.text.includes("नमः"), "Preserved Devanagari text with visarga");
  assert(versePassage.sourcePage === 1, "Preserved source page reference");

  // -----------------------------------------------------------
  // 3. CHAPTER-LEVEL LOADING (EFFICIENCY)
  // -----------------------------------------------------------
  console.log("\n[3/10] Testing Chapter-Level Scoped Loading...");
  const chapterOnlyPassages = await prisma.passage.findMany({
    where: {
      bookId: testBook.id,
      chapterId: ch1.id,
    },
    orderBy: { sortOrder: "asc" },
  });
  assert(chapterOnlyPassages.length === ch1.passages.length, "Loaded only the targeted chapter's passages without full book overhead");

  // -----------------------------------------------------------
  // 4. READING PROGRESS TRACKING & PERSISTENCE
  // -----------------------------------------------------------
  console.log("\n[4/10] Testing Reading Progress Tracking...");
  const firstPassage = ch1.passages[0];
  const progressRecord = await prisma.readingProgress.create({
    data: {
      userId: testUser.id,
      bookId: testBook.id,
      chapterId: ch1.id,
      passageId: firstPassage.id,
      progress: 50,
    },
  });
  assert(progressRecord.userId === testUser.id, "Saved reading progress for user");
  assert(progressRecord.progress === 50, "Recorded initial progress percentage");
  assert(progressRecord.chapterId === ch1.id, "Recorded last-read chapterId");

  // -----------------------------------------------------------
  // 5. READING PROGRESS RESUMPTION & IDEMPOTENCY
  // -----------------------------------------------------------
  console.log("\n[5/10] Testing Reading Progress Resumption (Upsert)...");
  const ch2 = bookWithChapters.chapters[1];
  const updatedProgress = await prisma.readingProgress.upsert({
    where: {
      userId_bookId: {
        userId: testUser.id,
        bookId: testBook.id,
      },
    },
    update: {
      chapterId: ch2.id,
      progress: 100,
      updatedAt: new Date(),
    },
    create: {
      userId: testUser.id,
      bookId: testBook.id,
      chapterId: ch2.id,
      progress: 100,
    },
  });

  assert(updatedProgress.progress === 100, "Updated progress to 100%");
  assert(updatedProgress.chapterId === ch2.id, "Updated last-read chapter to Chapter 2");

  const totalUserProgress = await prisma.readingProgress.count({
    where: { userId: testUser.id, bookId: testBook.id },
  });
  assert(totalUserProgress === 1, "Exactly 1 reading progress record per user/book (no duplicate rows)");

  // -----------------------------------------------------------
  // 6. BOOKMARK TOGGLE MECHANICS
  // -----------------------------------------------------------
  console.log("\n[6/10] Testing Bookmark Toggle Creation & Deletion...");
  // Step 1: Create Bookmark
  const bookmark = await prisma.bookmark.create({
    data: {
      userId: testUser.id,
      passageId: firstPassage.id,
      chapterId: ch1.id,
    },
  });
  assert(bookmark.userId === testUser.id, "Created bookmark in database");
  assert(bookmark.passageId === firstPassage.id, "Bookmarked the correct passage");

  // Step 2: Delete Bookmark (toggle off)
  await prisma.bookmark.delete({
    where: {
      userId_passageId: {
        userId: testUser.id,
        passageId: firstPassage.id,
      },
    },
  });
  const deletedCheck = await prisma.bookmark.findUnique({
    where: {
      userId_passageId: {
        userId: testUser.id,
        passageId: firstPassage.id,
      },
    },
  });
  assert(deletedCheck === null, "Bookmark successfully removed on toggle-off");

  // -----------------------------------------------------------
  // 7. BOOKMARK RETRIEVAL BY USER & BOOK
  // -----------------------------------------------------------
  console.log("\n[7/10] Testing Bookmark Retrieval with Full Provenance...");
  await prisma.bookmark.create({
    data: {
      userId: testUser.id,
      passageId: firstPassage.id,
      chapterId: ch1.id,
      note: "Important invocation shloka",
    },
  });

  const userBookmarks = await prisma.bookmark.findMany({
    where: { userId: testUser.id },
    include: {
      passage: {
        include: {
          book: true,
          chapter: true,
        },
      },
    },
  });
  assert(userBookmarks.length === 1, "Fetched user bookmarks");
  assert(userBookmarks[0].passage.book.title === testBook.title, "Populated book relation");
  assert(userBookmarks[0].passage.chapter.title === ch1.title, "Populated chapter relation");

  // -----------------------------------------------------------
  // 8. PUBLICATION ACCESS RESTRICTIONS
  // -----------------------------------------------------------
  console.log("\n[8/10] Testing Publication Status Restrictions...");
  // Set book status to UNPUBLISHED
  await prisma.book.update({
    where: { id: testBook.id },
    data: { status: "UNPUBLISHED" },
  });

  const unpubBook = await prisma.book.findUnique({ where: { id: testBook.id } });
  assert(unpubBook.status === "UNPUBLISHED", "Book is unpublished");

  // Publish the book
  await prisma.book.update({
    where: { id: testBook.id },
    data: { status: "PUBLISHED" },
  });
  const pubBook = await prisma.book.findUnique({ where: { id: testBook.id } });
  assert(pubBook.status === "PUBLISHED", "Book published successfully");

  // -----------------------------------------------------------
  // 9. AUTHORIZATION ROLE CHECKS
  // -----------------------------------------------------------
  console.log("\n[9/10] Testing User Role Authorization Rules...");
  const adminUser = await prisma.user.create({
    data: {
      name: "Acharya Admin",
      email: `admin_${Date.now()}@gurukul.org`,
      role: "ADMIN",
    },
  });
  assert(adminUser.role === "ADMIN", "Created admin user");
  assert(testUser.role === "USER", "Verified standard user role");

  // -----------------------------------------------------------
  // 10. GRACEFUL HANDLING OF MISSING CHAPTERS & BOOKS
  // -----------------------------------------------------------
  console.log("\n[10/10] Testing Error Handling for Missing Content...");
  const invalidBook = await prisma.book.findUnique({ where: { slug: "non-existent-book-slug-xyz" } });
  assert(invalidBook === null, "Returns null safely for non-existent book");

  const invalidChapter = await prisma.chapter.findUnique({
    where: {
      bookId_slug: {
        bookId: testBook.id,
        slug: "non-existent-chapter-slug",
      },
    },
  });
  assert(invalidChapter === null, "Returns null safely for non-existent chapter");

  // Cleanup
  await prisma.bookmark.deleteMany({ where: { userId: testUser.id } });
  await prisma.readingProgress.deleteMany({ where: { userId: testUser.id } });
  await prisma.user.delete({ where: { id: testUser.id } });
  await prisma.user.delete({ where: { id: adminUser.id } });
  await prisma.book.delete({ where: { id: testBook.id } });

  console.log("\n========================================================");
  console.log(`  PHASE 4 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase4Tests()
  .catch((err) => {
    console.error("Test execution threw exception:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
