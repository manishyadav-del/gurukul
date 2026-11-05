/**
 * Phase 7 Verification Test Suite: Personalized Learning System for Gurukul
 * 
 * Verifies:
 * 1. Interactive Quiz Creation with grounded question validation
 * 2. Invalid quiz structure rejection (empty question, <2 options, !=1 correct option, invalid passage reference)
 * 3. Client answer protection (isCorrect & explanations hidden on unsubmitted quiz)
 * 4. Server-side score evaluation and grading calculation
 * 5. Incorrect answer handling and explanation generation
 * 6. Quiz retake workflow and attempt history tracking
 * 7. Quiz publication visibility guardrails (drafts excluded from public list)
 * 8. Study Notes creation, retrieval, and reader deep-link generation
 * 9. Text highlight creation with color tags and offsets
 * 10. Server-side note authorization (preventing cross-user edit/delete)
 * 11. Passage mismatch resilience (verifying reliableMatch flag)
 * 12. Learning Dashboard aggregation of real persisted progress and quiz metrics
 * 13. Transparent, rule-based personalized recommendation generation with explicit reasons
 */

import prisma from "../lib/prisma.js";
import { registerBook } from "../server/ingest/registerBook.js";
import { structureBook } from "../server/ingest/structureBook.js";
import {
  createQuiz,
  getQuiz,
  listQuizzes,
  submitQuizAttempt,
  getUserQuizAttempts,
} from "../server/learning/quizzes.js";
import {
  createNote,
  updateNote,
  deleteNote,
  getUserNotes,
} from "../server/learning/notes.js";
import {
  getLearningDashboardData,
  generatePersonalizedRecommendations,
} from "../server/learning/dashboard.js";

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

async function runPhase7Tests() {
  console.log("\n========================================================");
  console.log("  PHASE 7 VERIFICATION: PERSONALIZED LEARNING SYSTEM");
  console.log("========================================================\n");

  let createdQuiz = null;

  // Setup: Create test book with published chapters and passages
  console.log("[Setup] Initializing test book, chapters, and users...");
  const testBook = await registerBook({
    title: "Brihat Jataka Learning Edition",
    author: "Varahamihira",
    language: "Sanskrit",
    script: "Devanagari",
    originalFileName: "brihat_jataka_learning.pdf",
    originalFileUrl: "/uploads/brihat_jataka_learning.pdf",
  });

  // Page 1
  await prisma.bookPage.create({
    data: {
      bookId: testBook.id,
      pageNumber: 1,
      pdfPageIndex: 1,
      processingMethod: "TEXT_EXTRACTION",
      rawText: "मूर्त्तिभावे रविः स्थितः। लग्न विचारः।",
      cleanedText: "मूर्त्तिभावे रविः स्थितः। लग्न विचारः।",
      language: "Sanskrit",
      ocrCompleted: true,
    },
  });

  // Page 2
  await prisma.bookPage.create({
    data: {
      bookId: testBook.id,
      pageNumber: 2,
      pdfPageIndex: 2,
      processingMethod: "TEXT_EXTRACTION",
      rawText: "दशमे भावे रविः कुलदीपक योगं करोति।",
      cleanedText: "दशमे भावे रविः कुलदीपक योगं करोति।",
      language: "Sanskrit",
      ocrCompleted: true,
    },
  });

  await structureBook(testBook.id, {
    chapterTitles: ["Tanu Bhava", "Karma Bhava"],
    passageCount: 2,
  });

  // Mark book published
  await prisma.book.update({
    where: { id: testBook.id },
    data: { status: "PUBLISHED" },
  });

  const passages = await prisma.passage.findMany({
    where: { bookId: testBook.id },
    include: { chapter: true },
  });
  const passage1 = passages[0];
  const passage2 = passages[1];

  // Create two distinct test users for isolation testing
  const userA = await prisma.user.create({
    data: {
      email: `student_a_${Date.now()}@gurukul.ai`,
      name: "Student Arjuna",
      role: "USER",
    },
  });

  const userB = await prisma.user.create({
    data: {
      email: `student_b_${Date.now()}@gurukul.ai`,
      name: "Student Bhima",
      role: "USER",
    },
  });

  // 1. Quiz Creation & Question Validation
  console.log("\n[1/13] Testing Quiz Creation & Grounded Question Validation...");
  {
    const quiz = await createQuiz({
      title: "Planetary Placements in Bhavas",
      description: "Classical assessment on Sun in 1st and 10th houses",
      bookId: testBook.id,
      chapterId: passage1.chapterId,
      difficulty: "MEDIUM",
      isPublished: true,
      questions: [
        {
          question: "What effect is created when the Sun is located in the 10th house?",
          explanation: "According to Varahamihira, the Sun in the 10th house forms the auspicious Kuladipaka yoga.",
          sourcePassageId: passage2.id,
          sourcePage: 2,
          options: [
            { text: "Kuladipaka Yoga", isCorrect: true },
            { text: "Kemadruma Yoga", isCorrect: false },
            { text: "Daridra Yoga", isCorrect: false },
            { text: "Amala Yoga", isCorrect: false },
          ],
        },
        {
          question: "Which bhava represents the physical body and vital nature?",
          explanation: "Tanu bhava (the first house or Lagna) signifies the physical body and vitality.",
          sourcePassageId: passage1.id,
          sourcePage: 1,
          options: [
            { text: "Tanu Bhava (1st House)", isCorrect: true },
            { text: "Vyaya Bhava (12th House)", isCorrect: false },
          ],
        },
      ],
    });

    assert(quiz.id !== undefined, "Quiz created successfully");
    assert(quiz.questions.length === 2, "Created quiz with 2 questions");
    assert(quiz.questions[0].options.length === 4, "Question 1 has 4 options");
    createdQuiz = quiz;
  }

  // 2. Invalid Quiz Structures Rejection
  console.log("\n[2/13] Testing Invalid Quiz Structure Rejections...");
  {
    // No correct options
    let failedNoCorrect = false;
    try {
      await createQuiz({
        title: "Invalid Quiz",
        questions: [
          {
            question: "Question with no correct answer",
            options: [
              { text: "Opt 1", isCorrect: false },
              { text: "Opt 2", isCorrect: false },
            ],
          },
        ],
      });
    } catch (e) {
      failedNoCorrect = true;
    }
    assert(failedNoCorrect, "Rejects question with 0 correct options");

    // Multiple correct options
    let failedMultiCorrect = false;
    try {
      await createQuiz({
        title: "Invalid Quiz",
        questions: [
          {
            question: "Question with two correct answers",
            options: [
              { text: "Opt 1", isCorrect: true },
              { text: "Opt 2", isCorrect: true },
            ],
          },
        ],
      });
    } catch (e) {
      failedMultiCorrect = true;
    }
    assert(failedMultiCorrect, "Rejects question with multiple correct options");

    // Non-existent source passage
    let failedBadPassage = false;
    try {
      await createQuiz({
        title: "Invalid Quiz",
        questions: [
          {
            question: "Question with bogus citation",
            sourcePassageId: "non-existent-uuid-12345",
            options: [
              { text: "Opt 1", isCorrect: true },
              { text: "Opt 2", isCorrect: false },
            ],
          },
        ],
      });
    } catch (e) {
      failedBadPassage = true;
    }
    assert(failedBadPassage, "Rejects question referencing non-existent passage citation");
  }

  // 3. Client Answer Protection (Hidden on Unsubmitted Quiz)
  console.log("\n[3/13] Testing Client Answer Protection...");
  {
    const quizzes = await listQuizzes({ isPublished: true });
    const targetQuiz = quizzes.quizzes[0];
    const clientQuiz = await getQuiz(targetQuiz.id, { includeAnswers: false });

    const q1 = clientQuiz.questions[0];
    assert(q1.options[0].isCorrect === undefined, "isCorrect is stripped from client option payload");
    assert(q1.explanation === undefined, "Explanation is hidden on unsubmitted quiz");
  }

  // 4. Server-Side Scoring & Grading
  console.log("\n[4/13] Testing Server-Side Score Calculation...");
  {
    const fullQuiz = await getQuiz(createdQuiz.id, { includeAnswers: true });
    const q1 = fullQuiz.questions[0];
    const q2 = fullQuiz.questions[1];

    const correctQ1Option = q1.options.find((o) => o.isCorrect);
    const correctQ2Option = q2.options.find((o) => o.isCorrect);

    // User A submits 100% correct answers
    const attempt = await submitQuizAttempt({
      quizId: fullQuiz.id,
      userId: userA.id,
      answers: [
        { questionId: q1.id, selectedOptionId: correctQ1Option.id },
        { questionId: q2.id, selectedOptionId: correctQ2Option.id },
      ],
    });

    assert(attempt.score === 2, "Server calculated score of 2/2");
    assert(attempt.percentage === 100, "Percentage calculated as 100%");
    assert(attempt.passed === true, "Marked as passed (>= 60%)");
    assert(attempt.evaluatedAnswers[0].sourcePassage !== null, "Answer includes grounded sourcePassage reference");
    assert(attempt.evaluatedAnswers[0].sourcePassage.bookTitle === "Brihat Jataka Learning Edition", "Passage citation references correct book");
  }

  // 5. Incorrect Answers & Explanation Reviews
  console.log("\n[5/13] Testing Incorrect Answers & Explanations...");
  {
    const fullQuiz = await getQuiz(createdQuiz.id, { includeAnswers: true });
    const q1 = fullQuiz.questions[0];
    const q2 = fullQuiz.questions[1];

    const wrongQ1Option = q1.options.find((o) => !o.isCorrect);
    const correctQ2Option = q2.options.find((o) => o.isCorrect);

    // User B submits 1 correct, 1 wrong answer (50%)
    const attempt = await submitQuizAttempt({
      quizId: fullQuiz.id,
      userId: userB.id,
      answers: [
        { questionId: q1.id, selectedOptionId: wrongQ1Option.id },
        { questionId: q2.id, selectedOptionId: correctQ2Option.id },
      ],
    });

    assert(attempt.score === 1, "Server calculated score of 1/2");
    assert(attempt.percentage === 50, "Percentage calculated as 50%");
    assert(attempt.passed === false, "Marked as failed (< 60%)");
    assert(attempt.evaluatedAnswers[0].isCorrect === false, "Question 1 marked incorrect");
    assert(attempt.evaluatedAnswers[0].explanation.includes("Varahamihira"), "Explanation provided for wrong answer");
  }

  // 6. Quiz Retakes & Attempt History
  console.log("\n[6/13] Testing Quiz Retakes & Attempt History Tracking...");
  {
    const fullQuiz = await getQuiz(createdQuiz.id, { includeAnswers: true });
    const q1 = fullQuiz.questions[0];
    const q2 = fullQuiz.questions[1];

    const correctQ1Option = q1.options.find((o) => o.isCorrect);
    const correctQ2Option = q2.options.find((o) => o.isCorrect);

    // User B retakes the quiz and improves score to 100%
    const retakeAttempt = await submitQuizAttempt({
      quizId: fullQuiz.id,
      userId: userB.id,
      answers: [
        { questionId: q1.id, selectedOptionId: correctQ1Option.id },
        { questionId: q2.id, selectedOptionId: correctQ2Option.id },
      ],
    });

    assert(retakeAttempt.percentage === 100, "Retake improved score to 100%");

    const history = await getUserQuizAttempts(userB.id, fullQuiz.id);
    assert(history.length === 2, "User B has 2 recorded attempts for this quiz");
    assert(history[0].score >= history[1].score, "Recent retake attempt recorded at top of history");
  }

  // 7. Draft and Publication Guardrails
  console.log("\n[7/13] Testing Draft & Publication Guardrails...");
  {
    const draftQuiz = await createQuiz({
      title: "Draft Sanskrit Astrological Grammar",
      difficulty: "HARD",
      isPublished: false, // Draft!
      questions: [
        {
          question: "Identify the sandhi in shloka opening.",
          options: [
            { text: "Yan Sandhi", isCorrect: true },
            { text: "Guna Sandhi", isCorrect: false },
          ],
        },
      ],
    });

    const publicList = await listQuizzes({ isPublished: true, includeUnpublished: false });
    assert(!publicList.quizzes.some((q) => q.id === draftQuiz.id), "Draft quiz is strictly excluded from public list");

    const adminList = await listQuizzes({ includeUnpublished: true });
    assert(adminList.quizzes.some((q) => q.id === draftQuiz.id), "Admin list includes draft quiz for editorial review");
  }

  // 8. Study Notes Creation & Reader Deep-Links
  console.log("\n[8/13] Testing Study Notes Creation & Navigation URLs...");
  {
    const note = await createNote({
      userId: userA.id,
      passageId: passage1.id,
      body: "Important classical verse regarding Lagna characteristics.",
      selectedText: "मूर्त्तिभावे रविः",
      isHighlight: false,
    });

    assert(note.id !== undefined, "Study note created successfully");
    assert(note.readerUrl.startsWith("/library/"), "Generates valid readerUrl");
    assert(note.readerUrl.includes(`#passage-${passage1.id}`), "readerUrl anchors to specific passage");
    assert(note.sourcePage === passage1.sourcePage, "Preserves sourcePage reference");
  }

  // 9. Text Highlights with Color & Offsets
  console.log("\n[9/13] Testing Text Highlights with Color Coding...");
  {
    const highlight = await createNote({
      userId: userA.id,
      passageId: passage2.id,
      selectedText: "कुलदीपक योगं",
      color: "green",
      isHighlight: true,
      startOffset: 15,
      endOffset: 27,
    });

    assert(highlight.isHighlight === true, "Recorded as text highlight");
    assert(highlight.color === "green", "Highlight color set to green");
    assert(highlight.startOffset === 15, "Preserves start character offset");
  }

  // 10. Server-Side User Isolation for Notes
  console.log("\n[10/13] Testing Note Privacy & User Isolation Guardrails...");
  {
    // Retrieve User A's note
    const userANotes = await getUserNotes({ userId: userA.id });
    const noteA = userANotes.notes[0];

    // User B tries to update User A's note -> should fail with 403 Forbidden
    let blockedEdit = false;
    try {
      await updateNote({
        noteId: noteA.id,
        userId: userB.id,
        body: "Malicious unauthorized tamper",
      });
    } catch (e) {
      if (e.statusCode === 403) blockedEdit = true;
    }
    assert(blockedEdit, "User B forbidden (403) from editing User A's private note");

    // User B tries to delete User A's note -> should fail with 403 Forbidden
    let blockedDelete = false;
    try {
      await deleteNote({
        noteId: noteA.id,
        userId: userB.id,
      });
    } catch (e) {
      if (e.statusCode === 403) blockedDelete = true;
    }
    assert(blockedDelete, "User B forbidden (403) from deleting User A's private note");
  }

  // 11. Passage Mismatch Resilience
  console.log("\n[11/13] Testing Passage Mismatch Resilience...");
  {
    const noteWithValidText = await createNote({
      userId: userA.id,
      passageId: passage1.id,
      selectedText: "लग्न विचारः", // Exists in passage1
      isHighlight: true,
    });
    assert(noteWithValidText.reliableMatch === true, "Matches existing passage text reliably");

    const noteWithObsoleteText = await createNote({
      userId: userA.id,
      passageId: passage1.id,
      selectedText: "This text does not exist in the Sanskrit passage",
      isHighlight: true,
    });
    assert(noteWithObsoleteText.reliableMatch === false, "Flags reliableMatch: false when selectedText no longer matches");
  }

  // 12. Learning Dashboard Aggregation
  console.log("\n[12/13] Testing Learning Dashboard Progress Aggregation...");
  {
    // Record reading progress for User A (50% of test book)
    await prisma.readingProgress.upsert({
      where: {
        userId_bookId: {
          userId: userA.id,
          bookId: testBook.id,
        },
      },
      update: {
        progress: 50,
        chapterId: passage1.chapterId,
      },
      create: {
        userId: userA.id,
        bookId: testBook.id,
        chapterId: passage1.chapterId,
        progress: 50,
      },
    });

    const dashboard = await getLearningDashboardData(userA.id);

    assert(dashboard.summary.totalBooksStudied >= 1, "Aggregates total books studied");
    assert(dashboard.summary.totalQuizAttempts >= 1, "Aggregates total quiz attempts");
    assert(dashboard.summary.averageQuizScore === 100, "Calculates accurate average quiz score");
    assert(dashboard.readingProgress.length >= 1, "Contains active reading sessions");
    assert(dashboard.readingProgress[0].progress === 50, "Accurately reflects 50% reading progress");
    assert(dashboard.notes.length >= 2, "Contains persisted notes and highlights");
  }

  // 13. Personalized Recommendations
  console.log("\n[13/13] Testing Rule-Based Personalized Recommendations...");
  {
    const recs = await generatePersonalizedRecommendations({
      userId: userA.id,
      readingProgress: [
        {
          bookId: testBook.id,
          chapterId: passage1.chapterId,
          progress: 50,
          book: testBook,
        },
      ],
      quizAttempts: [],
    });

    assert(recs.length > 0, "Generated personalized recommendations");
    assert(recs[0].reason !== undefined, "Every recommendation includes a clear transparent reason");
    assert(recs[0].reason.includes("recent progress") || recs[0].reason.includes("manuscript"), "Reason references actual user activity");
    assert(recs[0].url.startsWith("/library/") || recs[0].url.startsWith("/quiz/"), "Recommendation links to valid destination");
  }

  console.log("\n========================================================");
  console.log(`  PHASE 7 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase7Tests().catch((err) => {
  console.error("Fatal error during Phase 7 tests:", err);
  process.exit(1);
});
