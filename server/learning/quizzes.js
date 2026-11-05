/**
 * Interactive Quiz & Assessment Management Service
 * 
 * Handles quiz authoring, question validation with grounded scriptural citations,
 * question publication review, server-side score calculation, and attempt history.
 */

import prisma from "../../lib/prisma.js";
import { awardXp, recordDailyActivity, checkAchievements } from "../gamification/engine.js";

/**
 * Creates an interactive quiz grounded in book/chapter content.
 * 
 * @param {Object} params
 * @param {string} params.title
 * @param {string} [params.description]
 * @param {string} [params.bookId]
 * @param {string} [params.chapterId]
 * @param {string} [params.topic]
 * @param {string} [params.difficulty="MEDIUM"] - "EASY" | "MEDIUM" | "HARD"
 * @param {boolean} [params.isPublished=false]
 * @param {Array<Object>} params.questions
 * @returns {Promise<Object>} Created quiz
 */
export async function createQuiz({
  title,
  description = "",
  bookId = null,
  chapterId = null,
  topic = null,
  difficulty = "MEDIUM",
  isPublished = false,
  questions = [],
}) {
  if (!title || !title.trim()) {
    const err = new Error("Quiz title is required");
    err.statusCode = 400;
    throw err;
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    const err = new Error("Quiz must contain at least one question");
    err.statusCode = 400;
    throw err;
  }

  // Validate each question structure
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.question || !q.question.trim()) {
      const err = new Error(`Question #${i + 1} text cannot be empty`);
      err.statusCode = 400;
      throw err;
    }

    if (!Array.isArray(q.options) || q.options.length < 2) {
      const err = new Error(`Question #${i + 1} must have at least 2 options`);
      err.statusCode = 400;
      throw err;
    }

    const correctCount = q.options.filter((opt) => opt.isCorrect).length;
    if (correctCount !== 1) {
      const err = new Error(
        `Question #${i + 1} must have exactly one correct option (found ${correctCount})`
      );
      err.statusCode = 400;
      throw err;
    }

    // Verify sourcePassageId exists if provided
    if (q.sourcePassageId) {
      const passage = await prisma.passage.findUnique({
        where: { id: q.sourcePassageId },
      });
      if (!passage) {
        const err = new Error(
          `Question #${i + 1} references non-existent sourcePassageId: ${q.sourcePassageId}`
        );
        err.statusCode = 400;
        throw err;
      }
    }
  }

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "") + `-${Date.now().toString(36)}`;

  const quiz = await prisma.quiz.create({
    data: {
      title: title.trim(),
      slug,
      description: description ? description.trim() : null,
      bookId: bookId || null,
      chapterId: chapterId || null,
      topic: topic ? topic.trim() : null,
      difficulty: ["EASY", "MEDIUM", "HARD"].includes(difficulty?.toUpperCase())
        ? difficulty.toUpperCase()
        : "MEDIUM",
      isPublished: Boolean(isPublished),
      questions: {
        create: questions.map((q, qIndex) => ({
          question: q.question.trim(),
          explanation: q.explanation ? q.explanation.trim() : null,
          sourcePassageId: q.sourcePassageId || null,
          sourcePage: q.sourcePage ? Number(q.sourcePage) : null,
          order: qIndex + 1,
          difficulty: q.difficulty || difficulty || "MEDIUM",
          options: {
            create: q.options.map((opt, optIndex) => ({
              text: opt.text.trim(),
              isCorrect: Boolean(opt.isCorrect),
              order: optIndex + 1,
            })),
          },
        })),
      },
    },
    include: {
      questions: {
        include: {
          options: true,
          sourcePassage: {
            include: {
              book: { select: { title: true, slug: true } },
              chapter: { select: { title: true, slug: true } },
            },
          },
        },
      },
      book: { select: { title: true, slug: true } },
      chapter: { select: { title: true, slug: true } },
    },
  });

  return quiz;
}

/**
 * Retrieves a quiz for taking (sanitizing correct answer flags) or reviewing.
 * 
 * @param {string} quizId
 * @param {Object} [options]
 * @param {boolean} [options.includeAnswers=false] - If false, strips isCorrect & explanations
 * @returns {Promise<Object>}
 */
export async function getQuiz(quizId, { includeAnswers = false } = {}) {
  const quiz = await prisma.quiz.findFirst({
    where: {
      OR: [{ id: quizId }, { slug: quizId }],
    },
    include: {
      book: { select: { id: true, title: true, slug: true, author: true } },
      chapter: { select: { id: true, title: true, slug: true, chapterNumber: true } },
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: {
            orderBy: { order: "asc" },
            select: includeAnswers
              ? { id: true, text: true, isCorrect: true, order: true }
              : { id: true, text: true, order: true },
          },
          sourcePassage: includeAnswers
            ? {
                select: {
                  id: true,
                  text: true,
                  sourcePage: true,
                  passageNumber: true,
                  book: { select: { title: true, slug: true } },
                  chapter: { select: { title: true, slug: true } },
                },
              }
            : false,
        },
      },
    },
  });

  if (!quiz) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }

  // If answers are hidden, strip out explanation to prevent client inspection
  if (!includeAnswers) {
    return {
      ...quiz,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        question: q.question,
        order: q.order,
        difficulty: q.difficulty,
        options: q.options,
      })),
    };
  }

  return quiz;
}

/**
 * Lists quizzes with filtering and pagination.
 */
export async function listQuizzes({
  bookId = null,
  chapterId = null,
  topic = null,
  difficulty = null,
  isPublished = null,
  includeUnpublished = false,
  page = 1,
  limit = 20,
} = {}) {
  const where = {};

  if (!includeUnpublished) {
    where.isPublished = true;
  } else if (typeof isPublished === "boolean") {
    where.isPublished = isPublished;
  }

  if (bookId) where.bookId = bookId;
  if (chapterId) where.chapterId = chapterId;
  if (topic) where.topic = { contains: topic, mode: "insensitive" };
  if (difficulty && difficulty.toUpperCase() !== "ALL") {
    where.difficulty = difficulty.toUpperCase();
  }

  const [quizzes, total] = await Promise.all([
    prisma.quiz.findMany({
      where,
      include: {
        book: { select: { id: true, title: true, slug: true } },
        chapter: { select: { id: true, title: true, slug: true, chapterNumber: true } },
        _count: {
          select: { questions: true, attempts: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.quiz.count({ where }),
  ]);

  return { quizzes, total, page, limit };
}

/**
 * Evaluates submitted quiz answers strictly on the server and records attempt.
 * 
 * @param {Object} params
 * @param {string} params.quizId
 * @param {string} params.userId
 * @param {Array<{ questionId: string, selectedOptionId: string }>} params.answers
 * @returns {Promise<Object>} Evaluated attempt with score and explanations
 */
export async function submitQuizAttempt({ quizId, userId, answers = [] }) {
  if (!quizId) {
    const err = new Error("quizId is required");
    err.statusCode = 400;
    throw err;
  }

  if (!userId) {
    const err = new Error("Authentication required to submit quiz attempt");
    err.statusCode = 401;
    throw err;
  }

  // Load quiz with all questions and correct options from database
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { order: "asc" },
        include: {
          options: true,
          sourcePassage: {
            include: {
              book: { select: { title: true, slug: true } },
              chapter: { select: { title: true, slug: true } },
            },
          },
        },
      },
    },
  });

  if (!quiz) {
    const err = new Error("Quiz not found");
    err.statusCode = 404;
    throw err;
  }

  const userAnswersMap = new Map();
  for (const ans of answers) {
    if (ans.questionId) {
      userAnswersMap.set(ans.questionId, ans.selectedOptionId);
    }
  }

  let correctCount = 0;
  const evaluatedAnswers = [];

  for (const question of quiz.questions) {
    const selectedOptionId = userAnswersMap.get(question.id) || null;
    const correctOption = question.options.find((opt) => opt.isCorrect);
    const selectedOption = question.options.find((opt) => opt.id === selectedOptionId);

    const isCorrect = Boolean(selectedOption && selectedOption.isCorrect);
    if (isCorrect) {
      correctCount++;
    }

    evaluatedAnswers.push({
      questionId: question.id,
      question: question.question,
      selectedOptionId,
      selectedOptionText: selectedOption ? selectedOption.text : "No answer selected",
      correctOptionId: correctOption?.id || null,
      correctOptionText: correctOption?.text || null,
      isCorrect,
      explanation: question.explanation,
      sourcePassage: question.sourcePassage
        ? {
            id: question.sourcePassage.id,
            text: question.sourcePassage.text,
            sourcePage: question.sourcePassage.sourcePage || question.sourcePage,
            bookTitle: question.sourcePassage.book?.title,
            chapterTitle: question.sourcePassage.chapter?.title,
            readerUrl: `/library/${question.sourcePassage.book?.slug}/${question.sourcePassage.chapter?.slug}#passage-${question.sourcePassage.id}`,
          }
        : null,
    });
  }

  const totalQuestions = quiz.questions.length;
  const percentage = totalQuestions > 0
    ? parseFloat(((correctCount / totalQuestions) * 100).toFixed(1))
    : 0;

  // Persist QuizAttempt and QuizAnswer records in database
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId,
      quizId: quiz.id,
      score: correctCount,
      totalQuestions,
      percentage,
      completedAt: new Date(),
      answers: {
        create: evaluatedAnswers.map((ea) => ({
          questionId: ea.questionId,
          selectedOptionId: ea.selectedOptionId,
          isCorrect: ea.isCorrect,
        })),
      },
    },
    include: {
      quiz: { select: { id: true, title: true, difficulty: true } },
    },
  });

  // Gamification: award XP, maintain daily streak, and unlock achievements
  let gamification = { awardedXp: 0, newAchievements: [] };
  try {
    const baseAward = await awardXp({
      userId,
      actionType: "QUIZ_COMPLETED",
      referenceId: attempt.id,
      description: `Completed quiz: ${quiz.title}`,
    });
    if (baseAward.awarded) gamification.awardedXp += baseAward.amount;

    if (percentage >= 60) {
      const passAward = await awardXp({
        userId,
        actionType: "QUIZ_PASSED",
        referenceId: attempt.id,
        description: `Passed quiz (>= 60%): ${quiz.title}`,
      });
      if (passAward.awarded) gamification.awardedXp += passAward.amount;
    }

    if (percentage === 100) {
      const perfectAward = await awardXp({
        userId,
        actionType: "QUIZ_PERFECT",
        referenceId: attempt.id,
        description: `Perfect score in quiz: ${quiz.title}`,
      });
      if (perfectAward.awarded) gamification.awardedXp += perfectAward.amount;
    }

    await recordDailyActivity({ userId });
    gamification.newAchievements = await checkAchievements(userId);
  } catch (gamificationErr) {
    console.error("Gamification error during quiz attempt:", gamificationErr);
  }

  return {
    attemptId: attempt.id,
    quizId: quiz.id,
    quizTitle: quiz.title,
    score: correctCount,
    totalQuestions,
    percentage,
    passed: percentage >= 60,
    completedAt: attempt.completedAt,
    evaluatedAnswers,
    gamification,
  };
}

/**
 * Retrieves quiz attempt history for a user.
 */
export async function getUserQuizAttempts(userId, quizId = null) {
  if (!userId) return [];

  const where = { userId };
  if (quizId) where.quizId = quizId;

  return await prisma.quizAttempt.findMany({
    where,
    include: {
      quiz: {
        select: {
          id: true,
          title: true,
          slug: true,
          difficulty: true,
          book: { select: { title: true, slug: true } },
        },
      },
      answers: {
        include: {
          question: { select: { question: true, explanation: true } },
          selectedOption: { select: { text: true, isCorrect: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
