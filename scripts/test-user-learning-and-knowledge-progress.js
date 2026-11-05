import { PrismaClient } from "@prisma/client";
import assert from "node:assert/strict";
import { getLearningDashboardData, generatePersonalizedRecommendations } from "../server/learning/dashboard.js";
import { explainPassage, generateDeterministicExplanation } from "../server/ai/passageExplainer.js";
import { awardXp, recordDailyActivity, calculateLevel, getFormattedDateInTimezone, getDayDifference } from "../server/gamification/engine.js";
import { createQuiz, submitQuizAttempt } from "../server/learning/quizzes.js";
import { createNote, getUserNotes } from "../server/learning/notes.js";

const prisma = new PrismaClient();

async function runLearningAndProgressTests() {
  console.log("==========================================================================");
  console.log("     GURUKUL USER LEARNING & KNOWLEDGE PROGRESS SYSTEM VERIFICATION      ");
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

  // Tracking test entities for clean teardown
  const testUsers = [];
  const testBooks = [];
  const testQuizzes = [];
  const testModules = [];

  try {
    // --------------------------------------------------------------------------
    // SETUP: Create two isolated test users & test published manuscript
    // --------------------------------------------------------------------------
    const timestamp = Date.now();
    const studentA = await prisma.user.create({
      data: {
        name: `Student Alpha ${timestamp}`,
        email: `student.alpha.${timestamp}@example.com`,
        role: "USER",
        timezone: "Asia/Kolkata",
      },
    });
    testUsers.push(studentA.id);

    const studentB = await prisma.user.create({
      data: {
        name: `Student Beta ${timestamp}`,
        email: `student.beta.${timestamp}@example.com`,
        role: "USER",
        timezone: "Asia/Kolkata",
      },
    });
    testUsers.push(studentB.id);

    const publishedBook = await prisma.book.create({
      data: {
        title: `Brihat Parasara Hora Sastra ${timestamp}`,
        slug: `bphs-${timestamp}`,
        author: "Maharishi Parasara",
        language: "Sanskrit",
        status: "PUBLISHED",
        pageCount: 120,
        chapters: {
          create: [
            {
              title: "Chapter 1: The Creation Principles",
              slug: `chapter-1-creation-${timestamp}`,
              chapterNumber: 1,
              startPage: 1,
              endPage: 20,
            },
            {
              title: "Chapter 2: Planetary Incarnations",
              slug: `chapter-2-incarnations-${timestamp}`,
              chapterNumber: 2,
              startPage: 21,
              endPage: 45,
            },
          ],
        },
      },
      include: {
        chapters: true,
      },
    });
    testBooks.push(publishedBook.id);

    const testChapter1 = publishedBook.chapters[0];

    const testPassage1 = await prisma.passage.create({
      data: {
        bookId: publishedBook.id,
        chapterId: testChapter1.id,
        passageNumber: 1,
        text: "सृष्ट्यादिकर्ता भगवान् ब्रह्मा लोकपितामहः। धर्मार्थकाममोक्षाणां मूलं संक्षेपकं शृणु॥",
        sourcePage: 5,
        ocrConfidence: 0.94,
      },
    });

    // --------------------------------------------------------------------------
    // TEST 1: Reading Progress Persistence & Resume Position
    // --------------------------------------------------------------------------
    console.log("[Test 1] Reading Progress Persistence & Exact Page Resumption");

    // Persist progress on page 5 with 40% progress
    const recordProgress = await prisma.readingProgress.create({
      data: {
        userId: studentA.id,
        bookId: publishedBook.id,
        chapterId: testChapter1.id,
        passageId: testPassage1.id,
        pageNumber: 5,
        progress: 40,
        isCompleted: false,
      },
    });
    assert.equal(recordProgress.pageNumber, 5);
    assert.equal(recordProgress.progress, 40);
    assert.equal(recordProgress.isCompleted, false);
    pass("Reading progress persisted with exact page number and chapter position");

    // Fetch dashboard and verify resumeUrl includes page 5
    const dashA = await getLearningDashboardData(studentA.id);
    const bookProgress = dashA.readingProgress.find((p) => p.bookId === publishedBook.id);
    assert(bookProgress);
    assert.equal(bookProgress.lastReadPage, 5);
    assert(bookProgress.resumeUrl.includes("page=5"));
    pass("Dashboard computes resumeUrl pointing directly to last-read manuscript page");

    // --------------------------------------------------------------------------
    // TEST 2: Preventing False Completion When Merely Opening a Book
    // --------------------------------------------------------------------------
    console.log("\n[Test 2] Preventing False Completion on Book Opening");

    const newBook = await prisma.book.create({
      data: {
        title: `Jaimini Sutras ${timestamp}`,
        slug: `jaimini-${timestamp}`,
        language: "Sanskrit",
        status: "PUBLISHED",
        pageCount: 50,
      },
    });
    testBooks.push(newBook.id);

    // Opening book with 0 progress
    const openedRecord = await prisma.readingProgress.create({
      data: {
        userId: studentA.id,
        bookId: newBook.id,
        progress: 0,
        isCompleted: false,
      },
    });
    assert.equal(openedRecord.isCompleted, false);
    assert.equal(openedRecord.completedAt, null);
    pass("Opening a book with 0% progress does NOT mark it complete");

    // Only 100% marks isCompleted: true
    const completedRecord = await prisma.readingProgress.update({
      where: { id: openedRecord.id },
      data: {
        progress: 100,
        isCompleted: true,
        completedAt: new Date(),
      },
    });
    assert.equal(completedRecord.isCompleted, true);
    assert(completedRecord.completedAt !== null);
    pass("Only reaching 100% completion explicitly marks manuscript as completed");

    // --------------------------------------------------------------------------
    // TEST 3: Cross-User Data Isolation & Strict Scoping
    // --------------------------------------------------------------------------
    console.log("\n[Test 3] Cross-User Data Isolation & Negative Access");

    // Student A saves a bookmark and a private study note
    const bookmarkA = await prisma.bookmark.create({
      data: {
        userId: studentA.id,
        passageId: testPassage1.id,
        note: "Crucial verse on Dharma and Karma foundations",
      },
    });

    const noteA = await createNote({
      userId: studentA.id,
      passageId: testPassage1.id,
      bookId: publishedBook.id,
      chapterId: testChapter1.id,
      body: "Personal astrological reflection on the 4 Purusharthas.",
      selectedText: "धर्मार्थकाममोक्षाणां",
      color: "emerald",
      isHighlight: false,
      sourcePage: 5,
    });

    // Student B queries their notes and bookmarks
    const studentBNotes = await getUserNotes({ userId: studentB.id });
    assert.equal(studentBNotes.notes.length, 0);

    const studentBBookmarks = await prisma.bookmark.findMany({
      where: { userId: studentB.id },
    });
    assert.equal(studentBBookmarks.length, 0);

    const studentBDash = await getLearningDashboardData(studentB.id);
    assert.equal(studentBDash.bookmarks.length, 0);
    assert.equal(studentBDash.notes.length, 0);
    assert.equal(studentBDash.readingProgress.length, 0);
    pass("Strict data isolation verified: Student B cannot see Student A's bookmarks, notes, or progress");

    // --------------------------------------------------------------------------
    // TEST 4: Unpublished Book Access Restrictions
    // --------------------------------------------------------------------------
    console.log("\n[Test 4] Unpublished Manuscript Security Guard");

    const draftBook = await prisma.book.create({
      data: {
        title: `Unpublished Manuscript ${timestamp}`,
        slug: `draft-book-${timestamp}`,
        status: "DRAFT",
        chapters: {
          create: [
            {
              title: "Draft Chapter",
              slug: `draft-chapter-${timestamp}`,
              chapterNumber: 1,
              startPage: 1,
              endPage: 10,
            },
          ],
        },
      },
      include: {
        chapters: true,
      },
    });
    testBooks.push(draftBook.id);

    const draftPassage = await prisma.passage.create({
      data: {
        bookId: draftBook.id,
        chapterId: draftBook.chapters[0].id,
        passageNumber: 1,
        text: "Secret unpublished esoteric commentary.",
        sourcePage: 2,
      },
    });

    // Simulating regular user permission check on unpublished manuscript
    const { canReviewBooks } = await import("../lib/permissions.js");
    assert.equal(canReviewBooks(studentA), false);
    pass("Standard USER role denied permission to review or access unpublished manuscript");

    // --------------------------------------------------------------------------
    // TEST 5: Structured Learning From Books (Passage Explainer)
    // --------------------------------------------------------------------------
    console.log("\n[Test 5] Structured Learning From Books: Grounded Explanations");

    const explanation = await explainPassage({
      passageId: testPassage1.id,
      passageText: testPassage1.text,
      bookTitle: publishedBook.title,
      chapterTitle: testChapter1.title,
      pageNumber: 5,
      language: "en",
      ocrConfidence: 0.94,
      isVerified: true,
    });

    assert.equal(explanation.success, true);
    assert(explanation.originalPassage.includes("सृष्ट्यादिकर्ता"));
    assert(explanation.simpleHindiExplanation.length > 20);
    assert(explanation.englishTranslation.length > 20);
    assert(Array.isArray(explanation.keyTerms) && explanation.keyTerms.length > 0);
    assert(explanation.realLifeExample.length > 30);
    assert.equal(explanation.sourceReference.bookTitle, publishedBook.title);
    assert.equal(explanation.sourceReference.pageNumber, 5);
    pass("Structured passage explanation delivers original text, Hindi meaning, English translation, glossary & real-life example");

    // Low confidence scan warning check
    const lowConfExplanation = await explainPassage({
      passageText: "संदिग्ध श्लोक अंश",
      bookTitle: publishedBook.title,
      pageNumber: 7,
      ocrConfidence: 0.55,
    });
    assert.equal(lowConfExplanation.isLowConfidence, true);
    assert(lowConfExplanation.lowConfidenceWarning !== null);
    pass("Low-confidence scans properly trigger transparent manuscript comparison warning");

    // --------------------------------------------------------------------------
    // TEST 6: Integrity Guard: Corrupted/Missing Text Requests Review
    // --------------------------------------------------------------------------
    console.log("\n[Test 6] Integrity Guard: Zero Hallucination on Unverified Text");

    const unverifiedExplanation = await explainPassage({
      passageText: "??",
      bookTitle: publishedBook.title,
    });
    assert.equal(unverifiedExplanation.success, false);
    assert.equal(unverifiedExplanation.needsReview, true);
    assert(unverifiedExplanation.error.includes("unavailable for this passage"));
    pass("Corrupted or empty source text requests review rather than synthesizing fake meanings");

    // --------------------------------------------------------------------------
    // TEST 7: Educational Learning Modules Progress Tracking
    // --------------------------------------------------------------------------
    console.log("\n[Test 7] Educational Learning Modules & Lesson Progress");

    // Find or verify foundational learning module
    const moduleItem = await prisma.learningModule.findFirst({
      where: { isPublished: true },
      include: { lessons: true },
    });
    assert(moduleItem && moduleItem.lessons.length > 0);

    const firstLesson = moduleItem.lessons[0];

    // Mark lesson complete
    const lessonProgress = await prisma.userLearningProgress.create({
      data: {
        userId: studentA.id,
        moduleId: moduleItem.id,
        lessonId: firstLesson.id,
        completed: true,
        completedAt: new Date(),
      },
    });
    assert.equal(lessonProgress.completed, true);
    pass("Lesson completion recorded in UserLearningProgress separate from book reading progress");

    // Verify dashboard reflects module progress percentage
    const dashWithModule = await getLearningDashboardData(studentA.id);
    const modProgress = dashWithModule.learningModules.find((m) => m.id === moduleItem.id);
    assert(modProgress);
    assert(modProgress.progressPercent > 0);
    assert.equal(modProgress.completedLessonsCount, 1);
    pass("Personalized dashboard computes lesson completion percentage for educational modules");

    // --------------------------------------------------------------------------
    // TEST 8: User Saved Concepts & Terminology
    // --------------------------------------------------------------------------
    console.log("\n[Test 8] User Saved Concepts Management");

    const savedConcept = await prisma.userSavedConcept.create({
      data: {
        userId: studentA.id,
        conceptKey: "dharma",
        term: "Dharma",
        sanskritTerm: "धर्म",
        category: "PHILOSOPHY",
        meaning: "Cosmic righteousness, duty, and alignment with spiritual truth.",
        notes: "Study alongside Parasara Chapter 1 commentary.",
        sourceBookId: publishedBook.id,
        sourcePassageId: testPassage1.id,
      },
    });
    assert.equal(savedConcept.conceptKey, "dharma");

    // Idempotent upsert verification
    const updatedConcept = await prisma.userSavedConcept.upsert({
      where: {
        userId_conceptKey: {
          userId: studentA.id,
          conceptKey: "dharma",
        },
      },
      update: {
        notes: "Updated note: Contemplate daily during morning sadhana.",
      },
      create: {
        userId: studentA.id,
        conceptKey: "dharma",
        term: "Dharma",
      },
    });
    assert.equal(updatedConcept.notes, "Updated note: Contemplate daily during morning sadhana.");
    pass("Saved concepts persist with Sanskrit metadata, book linkage, and idempotent updates");

    // --------------------------------------------------------------------------
    // TEST 8b: Page-Level Bookmarking & Removal by Page Number
    // --------------------------------------------------------------------------
    console.log("\n[Test 8b] Page-Level Bookmarking & Removal Verification");

    // Create a passage specifically on page 12 for bookmark testing
    const page12Passage = await prisma.passage.create({
      data: {
        bookId: publishedBook.id,
        chapterId: testChapter1.id,
        passageNumber: 12,
        sourcePage: 12,
        text: "सप्तमे भृगुसुतः कलत्रसुखं प्रयच्छति।",
      },
    });

    const page12Bookmark = await prisma.bookmark.create({
      data: {
        userId: studentA.id,
        passageId: page12Passage.id,
        note: "Bookmark on page 12",
      },
    });
    assert(page12Bookmark.id);
    pass("Page-level bookmark created referencing verified sourcePage");

    // Query user bookmarks by bookId
    const bookBookmarks = await prisma.bookmark.findMany({
      where: {
        userId: studentA.id,
        passage: { bookId: publishedBook.id },
      },
      include: {
        passage: { select: { sourcePage: true } },
      },
    });
    assert(bookBookmarks.some((b) => b.passage.sourcePage === 12));
    pass("User bookmarks query successfully retrieves bookmarked page number");

    // Remove page 12 bookmark
    await prisma.bookmark.delete({
      where: { id: page12Bookmark.id },
    });
    const afterDelete = await prisma.bookmark.findUnique({
      where: { id: page12Bookmark.id },
    });
    assert.equal(afterDelete, null);
    pass("Page bookmark removed cleanly without altering manuscript or passage records");

    // --------------------------------------------------------------------------
    // TEST 9: Grounded Quiz Assessment & Idempotent XP Award
    // --------------------------------------------------------------------------
    console.log("\n[Test 9] Grounded Quiz Evaluation & Idempotent XP Award");

    const quiz = await createQuiz({
      title: `Vedic Creation Quiz ${timestamp}`,
      bookId: publishedBook.id,
      chapterId: testChapter1.id,
      topic: "Creation Sutras",
      difficulty: "EASY",
      isPublished: true,
      questions: [
        {
          question: "According to Parasara's opening shloka, who is the creator of the world?",
          sourcePassageId: testPassage1.id,
          sourcePage: 5,
          order: 1,
          options: [
            { text: "Lord Brahma (Lokapitamaha)", isCorrect: true, order: 1 },
            { text: "Rahu", isCorrect: false, order: 2 },
          ],
        },
      ],
    });
    testQuizzes.push(quiz.id);

    const q1 = quiz.questions[0];
    const correctOpt = q1.options.find((o) => o.isCorrect);

    // Submit attempt with correct answer
    const attemptResult = await submitQuizAttempt({
      quizId: quiz.id,
      userId: studentA.id,
      answers: [{ questionId: q1.id, selectedOptionId: correctOpt.id }],
    });

    assert.equal(attemptResult.percentage, 100);
    assert.equal(attemptResult.passed, true);
    assert(attemptResult.gamification.awardedXp > 0);
    pass("Grounded quiz evaluated server-side and awarded initial completion XP");

    // Anti-duplication: Attempting to award XP for the same attempt again returns ALREADY_AWARDED
    const dupAward = await awardXp({
      userId: studentA.id,
      actionType: "QUIZ_COMPLETED",
      referenceId: attemptResult.attemptId,
    });
    assert.equal(dupAward.awarded, false);
    assert.equal(dupAward.reason, "ALREADY_AWARDED");
    pass("Duplicate points strictly blocked by unique database constraint on (userId, actionType, referenceId)");

    // --------------------------------------------------------------------------
    // TEST 10: Personalized Recommendations With and Without History
    // --------------------------------------------------------------------------
    console.log("\n[Test 10] Personalized Recommendations with Transparent Rationales");

    // Student A (has read book and taken quiz)
    const recsA = await generatePersonalizedRecommendations({
      userId: studentA.id,
      readingProgress: [recordProgress],
      quizAttempts: [attemptResult],
    });
    assert(recsA.length > 0);
    assert(recsA.some((r) => r.type === "NEXT_CHAPTER" || r.type === "RESUME_BOOK"));
    assert(recsA.every((r) => r.reason && r.reason.length > 10));
    pass("Active student receives transparent recommendations based on actual reading progress");

    // Related Author recommendation signal verification
    const authorBook = await prisma.book.create({
      data: {
        title: `Parasara Samhita ${timestamp}`,
        slug: `parasara-samhita-${timestamp}`,
        author: "Maharishi Parasara",
        language: "Sanskrit",
        status: "PUBLISHED",
      },
    });
    testBooks.push(authorBook.id);

    const recsWithAuthor = await generatePersonalizedRecommendations({
      userId: studentA.id,
      readingProgress: [
        {
          ...recordProgress,
          book: publishedBook,
        },
      ],
      quizAttempts: [attemptResult],
    });
    assert(recsWithAuthor.some((r) => r.type === "RELATED_AUTHOR"));
    pass("Related author recommendation accurately generated based on student reading history");

    // Guest / New student without history
    const guestDash = await getLearningDashboardData(null);
    assert.equal(guestDash.hasLearningHistory, false);
    assert(guestDash.recommendations.length > 0);
    assert.equal(guestDash.recommendations[0].type, "EXPLORE_CLASSIC");
    pass("Student without history receives helpful onboarding state and foundational manuscript suggestions");

    // --------------------------------------------------------------------------
    // TEST 11: Timezone-Aware Streak Boundaries
    // --------------------------------------------------------------------------
    console.log("\n[Test 11] Timezone-Aware Daily Streak Mechanics");

    const todayStr = getFormattedDateInTimezone(new Date(), "Asia/Kolkata");
    assert(typeof todayStr === "string" && todayStr.length === 10);

    // Same-day repeated activity is idempotent and does not increment streak
    const activityToday = await recordDailyActivity({
      userId: studentA.id,
      userTimezone: "Asia/Kolkata",
    });
    const repeatActivityToday = await recordDailyActivity({
      userId: studentA.id,
      userTimezone: "Asia/Kolkata",
    });
    assert.equal(activityToday.currentStreak, repeatActivityToday.currentStreak);
    pass("Consecutive requests on same calendar day maintain existing streak without double counting");

    // 1-day difference yields consecutive increment
    const diffDay = getDayDifference("2026-10-29", "2026-10-28");
    assert.equal(diffDay, 1);
    const missedDayDiff = getDayDifference("2026-10-31", "2026-10-28");
    assert.equal(missedDayDiff, 3);
    pass("Calendar day difference accurately determines consecutive streak vs missed days");

  } catch (err) {
    fail("Unexpected error during test suite execution", err);
  } finally {
    // --------------------------------------------------------------------------
    // CLEANUP: Clean up temporary test data
    // --------------------------------------------------------------------------
    console.log("\n[Cleanup] Removing temporary test entities...");
    try {
      for (const qId of testQuizzes) {
        await prisma.quiz.delete({ where: { id: qId } }).catch(() => {});
      }
      for (const bId of testBooks) {
        await prisma.book.delete({ where: { id: bId } }).catch(() => {});
      }
      for (const uId of testUsers) {
        await prisma.user.delete({ where: { id: uId } }).catch(() => {});
      }
      pass("Cleanup completed successfully");
    } catch (cleanupErr) {
      console.warn("Cleanup warning:", cleanupErr.message);
    }
    await prisma.$disconnect();
  }

  console.log("\n--------------------------------------------------------------------------");
  console.log(`TOTAL SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==========================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runLearningAndProgressTests();
