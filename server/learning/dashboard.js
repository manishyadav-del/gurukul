/**
 * Learning Dashboard & Recommendation Engine
 * 
 * Computes authenticated student learning metrics from persisted database records
 * and provides transparent, rule-based personalized study recommendations.
 */

import prisma from "../../lib/prisma.js";
import { getGamificationStatus } from "../gamification/engine.js";
import { extractGlossaryTerms } from "../ai/passageExplainer.js";
import { getLearningPathsWithProgress } from "./learningPaths.js";
import { getUserDailyGoalsSummary } from "./dailyGoals.js";
import { getExplainableRecommendations } from "./recommendationEngine.js";

/**
 * Computes consolidated learning progress metrics for a user.
 * 
 * @param {string} userId
 * @returns {Promise<Object>} Learning metrics
 */
export async function getLearningDashboardData(userId) {
  if (!userId) {
    return getGuestDashboardPreview();
  }

  const [
    readingProgress,
    quizAttempts,
    bookmarks,
    notes,
    user,
    gamification,
    learningModules,
    userLearningProgress,
    kundaliniModules,
    userKundaliniProgress,
    savedConcepts,
    recentTopics,
    learningPaths,
    dailyGoalsSummary,
    explainableRecs,
  ] = await Promise.all([
    // 1. Reading progress with exact chapter & page positions
    prisma.readingProgress.findMany({
      where: { userId },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
            author: true,
            language: true,
            pageCount: true,
            status: true,
            _count: { select: { chapters: true, passages: true } },
          },
        },
        chapter: {
          select: {
            id: true,
            title: true,
            slug: true,
            chapterNumber: true,
            startPage: true,
            endPage: true,
          },
        },
        passage: {
          select: {
            id: true,
            sourcePage: true,
            passageNumber: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),

    // 2. Quiz attempts
    prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            slug: true,
            difficulty: true,
            topic: true,
            book: { select: { title: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),

    // 3. Bookmarks count & recents
    prisma.bookmark.findMany({
      where: { userId },
      include: {
        passage: {
          include: {
            book: { select: { id: true, title: true, slug: true } },
            chapter: { select: { id: true, title: true, slug: true, chapterNumber: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),

    // 4. Notes & Highlights count & recents
    prisma.note.findMany({
      where: { userId },
      include: {
        passage: {
          include: {
            book: { select: { id: true, title: true, slug: true } },
            chapter: { select: { id: true, title: true, slug: true, chapterNumber: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),

    // 5. User profile
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        totalXp: true,
        level: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
        isPublicLeaderboard: true,
      },
    }),

    // 6. Gamification status
    getGamificationStatus(userId),

    // 7. Foundational learning modules
    prisma.learningModule.findMany({
      where: { isPublished: true },
      include: {
        lessons: {
          where: { isPublished: true },
          select: { id: true, title: true, slug: true, order: true, durationMin: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    }),

    // 8. User's lesson progress
    prisma.userLearningProgress.findMany({
      where: { userId },
    }),

    // 9. Kundalini spiritual guidance modules
    prisma.kundaliniModule.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        level: true,
        chakraAssociation: true,
        order: true,
      },
      orderBy: { order: "asc" },
    }),

    // 10. User Kundalini progress
    prisma.userKundaliniProgress.findMany({
      where: { userId },
    }),

    // 11. User explicitly saved concepts
    prisma.userSavedConcept.findMany({
      where: { userId },
      include: {
        sourceBook: { select: { id: true, title: true, slug: true } },
        sourcePassage: {
          select: { id: true, sourcePage: true, chapter: { select: { title: true, slug: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),

    // 12. Recently viewed topics
    prisma.userRecentTopic.findMany({
      where: { userId },
      orderBy: { viewedAt: "desc" },
      take: 8,
    }),

    // 13. Structured learning paths with progress
    getLearningPathsWithProgress(userId),

    // 14. Timezone-aware daily goals summary
    getUserDailyGoalsSummary(userId),

    // 15. Explainable recommendations
    getExplainableRecommendations({ userId, categoryFilter: "ALL", limit: 12 }),
  ]);

  // Aggregate reading stats
  const totalBooksStudied = readingProgress.length;
  const completedBooks = readingProgress.filter(
    (rp) => rp.progress >= 100 || rp.isCompleted
  ).length;

  // Aggregate quiz metrics
  const totalQuizAttempts = quizAttempts.length;
  const totalScoreSum = quizAttempts.reduce((acc, a) => acc + a.percentage, 0);
  const averageQuizScore = totalQuizAttempts > 0
    ? parseFloat((totalScoreSum / totalQuizAttempts).toFixed(1))
    : 0;
  const passedQuizzes = quizAttempts.filter((a) => a.percentage >= 60).length;

  // Separate notes from text highlights
  const personalNotes = notes.filter((n) => !n.isHighlight || (n.body && n.body.trim().length > 0));
  const highlights = notes.filter((n) => n.isHighlight);

  // Extract unique subjects / topics studied
  const studiedTopicsSet = new Set();
  for (const rp of readingProgress) {
    if (rp.book?.title) studiedTopicsSet.add(rp.book.title);
    if (rp.book?.language) studiedTopicsSet.add(`${rp.book.language} Manuscripts`);
  }
  for (const qa of quizAttempts) {
    if (qa.quiz?.topic) studiedTopicsSet.add(qa.quiz.topic);
    if (qa.quiz?.title) studiedTopicsSet.add(qa.quiz.title);
  }

  // Format bookmarks with deep links
  const formattedBookmarks = bookmarks.map((bm) => ({
    id: bm.id,
    passageId: bm.passageId,
    bookTitle: bm.passage?.book?.title,
    chapterTitle: bm.passage?.chapter?.title,
    sourcePage: bm.passage?.sourcePage,
    textSnippet: bm.passage?.text ? bm.passage.text.slice(0, 160) : "",
    readerUrl: `/library/${bm.passage?.book?.slug || "book"}/${bm.passage?.chapter?.slug || "chapter"}#passage-${bm.passageId}`,
    createdAt: bm.createdAt,
  }));

  // Format notes with deep links
  const formattedNotes = notes.map((n) => ({
    id: n.id,
    passageId: n.passageId,
    bookTitle: n.passage?.book?.title,
    chapterTitle: n.passage?.chapter?.title,
    body: n.body,
    selectedText: n.selectedText,
    color: n.color,
    isHighlight: n.isHighlight,
    sourcePage: n.sourcePage || n.passage?.sourcePage,
    readerUrl: `/library/${n.passage?.book?.slug || "book"}/${n.passage?.chapter?.slug || "chapter"}#passage-${n.passageId}`,
    updatedAt: n.updatedAt,
  }));

  // Process Saved & Studied Concepts
  let consolidatedConcepts = savedConcepts.map((sc) => ({
    id: sc.id,
    key: sc.conceptKey,
    term: sc.term,
    sanskritTerm: sc.sanskritTerm,
    category: sc.category,
    meaning: sc.meaning,
    notes: sc.notes,
    sourceBookTitle: sc.sourceBook?.title,
    sourceBookSlug: sc.sourceBook?.slug,
    readerUrl: sc.sourcePassage
      ? `/library/${sc.sourceBook?.slug}/${sc.sourcePassage.chapter?.slug || ""}#passage-${sc.sourcePassageId}`
      : null,
    savedAt: sc.createdAt,
  }));

  // If few explicitly saved concepts, enrich with concepts from bookmarks and notes
  if (consolidatedConcepts.length < 5) {
    const conceptTexts = [
      ...bookmarks.map((b) => b.passage?.text).filter(Boolean),
      ...notes.map((n) => n.body || n.selectedText).filter(Boolean),
    ].join(" ");

    const extracted = extractGlossaryTerms(conceptTexts, "en");
    const existingKeys = new Set(consolidatedConcepts.map((c) => c.key.toLowerCase()));

    for (const item of extracted) {
      const key = item.term.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      if (!existingKeys.has(key)) {
        existingKeys.add(key);
        consolidatedConcepts.push({
          id: `derived-${key}`,
          key,
          term: item.term,
          sanskritTerm: item.devanagari,
          category: "GLOSSARY",
          meaning: item.meaning,
          notes: "Concept encountered in your studied classical passages",
          sourceBookTitle: null,
          readerUrl: null,
          savedAt: new Date(),
        });
      }
    }
  }

  // Process Foundational Learning Modules with User Completion
  const userCompletedLessons = new Set(
    userLearningProgress.filter((p) => p.completed && p.lessonId).map((p) => p.lessonId)
  );

  const formattedLearningModules = learningModules.map((m) => {
    const totalLessons = m.lessons.length;
    const completedLessonsCount = m.lessons.filter((l) => userCompletedLessons.has(l.id)).length;
    const isCompleted = totalLessons > 0 && completedLessonsCount === totalLessons;
    const progressPercent = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

    return {
      id: m.id,
      title: m.title,
      slug: m.slug,
      description: m.description,
      category: m.category,
      difficulty: m.difficulty,
      totalLessons,
      completedLessonsCount,
      progressPercent,
      isCompleted,
      url: `/dashboard`,
    };
  });

  // Process Kundalini Spiritual Modules with User Completion
  const userKundaliniMap = new Map(userKundaliniProgress.map((p) => [p.moduleId, p]));
  const formattedKundaliniModules = kundaliniModules.map((km) => {
    const prog = userKundaliniMap.get(km.id);
    return {
      id: km.id,
      title: km.title,
      slug: km.slug,
      level: km.level,
      chakraAssociation: km.chakraAssociation,
      isCompleted: Boolean(prog?.completed),
      completedAt: prog?.completedAt || null,
      isBookmarked: Boolean(prog?.bookmarked),
      url: `/spirituality/kundalini/${km.slug}`,
    };
  });

  // Consolidated Reading Progress with Page Resumption
  const formattedReadingProgress = readingProgress.map((rp) => {
    const lastPage = rp.pageNumber || rp.passage?.sourcePage || rp.chapter?.startPage || 1;
    const resumeUrl = `/library/${rp.book?.slug}/${rp.chapter?.slug || ""}${lastPage ? `?page=${lastPage}` : ""}`;

    return {
      id: rp.id,
      bookId: rp.bookId,
      bookTitle: rp.book?.title,
      bookSlug: rp.book?.slug,
      bookLanguage: rp.book?.language,
      currentChapter: rp.chapter?.title,
      currentChapterSlug: rp.chapter?.slug,
      chapterNumber: rp.chapter?.chapterNumber,
      lastReadPage: lastPage,
      progress: parseFloat(rp.progress.toFixed(0)),
      isCompleted: rp.progress >= 100 || rp.isCompleted,
      lastReadAt: rp.updatedAt,
      resumeUrl,
    };
  });

  const currentlyReading = formattedReadingProgress.filter((rp) => rp.progress > 0 && !rp.isCompleted);
  const recentlyRead = formattedReadingProgress.slice(0, 6);
  const completedBooksList = formattedReadingProgress.filter((rp) => rp.isCompleted);

  // Determine "Continue Learning" top actionable item
  let continueLearning = null;
  if (currentlyReading.length > 0) {
    const cur = currentlyReading[0];
    continueLearning = {
      type: "DIGITAL_LIBRARY",
      category: "DIGITAL_LIBRARY",
      title: cur.currentChapter || cur.bookTitle,
      subtitle: `${cur.bookTitle} • Page ${cur.lastReadPage} (${cur.progress}% done)`,
      badge: "Resume Manuscript",
      progress: cur.progress,
      url: cur.resumeUrl,
      actionText: "Continue Reading",
    };
  } else {
    const activePath = learningPaths.find((p) => p.nextLesson);
    if (activePath && activePath.nextLesson) {
      continueLearning = {
        type: activePath.category,
        category: activePath.category,
        title: activePath.nextLesson.title,
        subtitle: `${activePath.title} • Lesson ${activePath.nextLesson.order} of ${activePath.totalLessons}`,
        badge: "Next in Path",
        progress: activePath.progressPercent,
        url: activePath.nextLesson.url,
        actionText: "Start Lesson",
      };
    } else if (recentTopics.length > 0) {
      const lastViewed = recentTopics[0];
      continueLearning = {
        type: lastViewed.category,
        category: lastViewed.category,
        title: lastViewed.title,
        subtitle: "Resume your recent topic exploration",
        badge: "Recently Viewed",
        progress: 0,
        url: lastViewed.url,
        actionText: "Resume Study",
      };
    }
  }

  // 2. Structured Domain Categories
  const astroPath = learningPaths.find((p) => p.id === "path-vedic-astrology");
  const kundPath = learningPaths.find((p) => p.id === "path-kundalini-spirituality");

  const categories = {
    vedicAstrology: {
      title: "Vedic Astrology",
      sanskrit: "ज्योतिष शास्त्र",
      path: astroPath || null,
      progressPercent: astroPath?.progressPercent || 0,
      completedLessons: astroPath?.lessons?.filter((l) => l.isCompleted) || [],
      pendingLessons: astroPath?.lessons?.filter((l) => !l.isCompleted) || [],
      conceptsCount: consolidatedConcepts.filter(
        (c) => c.category === "GRAHA" || c.category === "BHAVA" || c.category === "RASHI" || c.category === "NAKSHATRA"
      ).length,
    },
    kundaliniSpirituality: {
      title: "Kundalini & Spirituality",
      sanskrit: "कुण्डलिनी एवं षट्चक्र",
      path: kundPath || null,
      progressPercent: kundPath?.progressPercent || 0,
      completedLessons: kundPath?.lessons?.filter((l) => l.isCompleted) || [],
      pendingLessons: kundPath?.lessons?.filter((l) => !l.isCompleted) || [],
      chakrasCompleted: formattedKundaliniModules.filter((k) => k.isCompleted).length,
      totalChakras: 7,
    },
    digitalLibrary: {
      title: "Digital Library",
      sanskrit: "डिजिटल ग्रन्थागार",
      totalBooksStudied,
      completedBooks,
      currentlyReadingCount: currentlyReading.length,
      totalBookmarks: bookmarks.length,
      totalNotes: personalNotes.length,
      readingProgress: formattedReadingProgress,
    },
  };

  const hasLearningHistory = Boolean(
    readingProgress.length > 0 ||
    quizAttempts.length > 0 ||
    bookmarks.length > 0 ||
    notes.length > 0 ||
    userLearningProgress.length > 0 ||
    userKundaliniProgress.length > 0 ||
    recentTopics.length > 0
  );

  return {
    user: user || { id: userId, name: "Student" },
    hasLearningHistory,
    gamification: gamification || null,
    continueLearning,
    categories,
    learningPaths,
    dailyGoals: dailyGoalsSummary,
    streak: dailyGoalsSummary?.streak || {
      currentStreak: user?.currentStreak || 0,
      longestStreak: user?.longestStreak || 0,
      lastActiveDate: user?.lastActiveDate || null,
      activeToday: false,
    },
    recentlyViewed: recentTopics.map((rt) => ({
      id: rt.id,
      topicKey: rt.topicKey,
      title: rt.title,
      category: rt.category,
      url: rt.url,
      viewedAt: rt.viewedAt,
    })),
    summary: {
      totalBooksStudied,
      completedBooks,
      totalQuizAttempts,
      averageQuizScore,
      passedQuizzes,
      totalBookmarks: bookmarks.length,
      totalNotes: personalNotes.length,
      totalHighlights: highlights.length,
      totalSavedConcepts: consolidatedConcepts.length,
      completedModulesCount:
        formattedLearningModules.filter((m) => m.isCompleted).length +
        formattedKundaliniModules.filter((km) => km.isCompleted).length,
      studiedTopics: Array.from(studiedTopicsSet).slice(0, 8),
    },
    readingProgress: formattedReadingProgress,
    currentlyReading,
    recentlyRead,
    completedBooks: completedBooksList,
    quizAttempts: quizAttempts.map((qa) => ({
      id: qa.id,
      quizId: qa.quizId,
      quizTitle: qa.quiz?.title,
      quizSlug: qa.quiz?.slug,
      difficulty: qa.quiz?.difficulty,
      score: qa.score,
      totalQuestions: qa.totalQuestions,
      percentage: qa.percentage,
      passed: qa.percentage >= 60,
      completedAt: qa.completedAt || qa.createdAt,
    })),
    bookmarks: formattedBookmarks,
    notes: formattedNotes,
    savedConcepts: consolidatedConcepts,
    learningModules: formattedLearningModules,
    kundaliniModules: formattedKundaliniModules,
    recommendations: explainableRecs,
  };
}

/**
 * Transparent, rule-based recommendation engine explaining the reason for each suggested item.
 */
export async function generatePersonalizedRecommendations({
  userId,
  readingProgress = [],
  quizAttempts = [],
  learningModules = [],
  userLearningProgress = [],
}) {
  const recommendations = [];

  // Rule 1: Continue Incomplete Reading (Next Chapter / Resume Page)
  const inProgress = readingProgress.find((rp) => rp.progress > 0 && rp.progress < 100);
  if (inProgress) {
    const targetBook = inProgress.book || (await prisma.book.findUnique({
      where: { id: inProgress.bookId },
      select: { id: true, title: true, slug: true },
    }));

    if (targetBook) {
      const chapters = await prisma.chapter.findMany({
        where: { bookId: inProgress.bookId },
        orderBy: { chapterNumber: "asc" },
        select: { id: true, title: true, slug: true, chapterNumber: true },
      });

      const currentIdx = chapters.findIndex((c) => c.id === inProgress.chapterId);
      if (currentIdx !== -1 && currentIdx < chapters.length - 1) {
        const nextChap = chapters[currentIdx + 1];
        recommendations.push({
          id: `rec-next-chapter-${nextChap.id}`,
          type: "NEXT_CHAPTER",
          title: `Chapter ${nextChap.chapterNumber}: ${nextChap.title}`,
          subtitle: targetBook.title,
          url: `/library/${targetBook.slug}/${nextChap.slug}`,
          badge: "Continue Reading",
          reason: `Based on your recent study progress (${inProgress.progress.toFixed(0)}%) in ${targetBook.title}`,
        });
      } else {
        recommendations.push({
          id: `rec-resume-${inProgress.id}`,
          type: "RESUME_BOOK",
          title: inProgress.chapter?.title || targetBook.title,
          subtitle: targetBook.title,
          url: `/library/${targetBook.slug}/${inProgress.chapter?.slug || ""}`,
          badge: "Resume Manuscript",
          reason: `You have completed ${inProgress.progress.toFixed(0)}% of this manuscript`,
        });
      }
    }
  }

  // Rule 2: Incomplete Educational Learning Modules
  const incompleteModule = learningModules.find((m) => {
    const total = m.lessons?.length || 0;
    const completedCount = userLearningProgress.filter((p) => p.moduleId === m.id && p.completed).length;
    return total > 0 && completedCount < total;
  });

  if (incompleteModule) {
    recommendations.push({
      id: `rec-module-${incompleteModule.id}`,
      type: "LEARNING_MODULE",
      title: incompleteModule.title,
      subtitle: `${incompleteModule.category?.replace(/_/g, " ") || "Educational Module"}`,
      url: `/dashboard`,
      badge: `${incompleteModule.difficulty} Module`,
      reason: `Structured lesson series aligning with your Jyotish foundation`,
    });
  }

  // Rule 3: Knowledge Assessment (Quiz Available for Read Book)
  if (readingProgress.length > 0) {
    const readBookIds = readingProgress.map((rp) => rp.bookId);
    const attemptedQuizIds = new Set(quizAttempts.map((qa) => qa.quizId));

    const availableQuizzes = await prisma.quiz.findMany({
      where: {
        isPublished: true,
        bookId: { in: readBookIds },
        id: { notIn: Array.from(attemptedQuizIds) },
      },
      include: {
        book: { select: { title: true, slug: true } },
      },
      take: 2,
    });

    for (const quiz of availableQuizzes) {
      recommendations.push({
        id: `rec-quiz-${quiz.id}`,
        type: "ASSESSMENT",
        title: quiz.title,
        subtitle: quiz.book?.title || "Astrology Assessment",
        url: `/quiz/${quiz.slug || quiz.id}`,
        badge: `${quiz.difficulty} Quiz`,
        reason: `Test your understanding of ${quiz.book?.title || "the subject"} after studying its passages`,
      });
    }
  }

  // Rule 4: Weakness Mastery (Retake / Review Quiz scored under 70%)
  const weakAttempt = quizAttempts.find((qa) => qa.percentage < 70);
  if (weakAttempt && weakAttempt.quiz) {
    recommendations.push({
      id: `rec-mastery-${weakAttempt.id}`,
      type: "REVIEW_STUDY",
      title: `Retake: ${weakAttempt.quiz.title}`,
      subtitle: `Previous score: ${weakAttempt.percentage}%`,
      url: `/quiz/${weakAttempt.quiz.slug || weakAttempt.quiz.id}`,
      badge: "Mastery Review",
      reason: `Strengthen your grasp of this topic where your previous score was ${weakAttempt.score}/${weakAttempt.totalQuestions}`,
    });
  }

  // Rule 5: Related Authors and Topics from Read History
  if (readingProgress.length > 0 && recommendations.length < 4) {
    const readBookIds = readingProgress.map((rp) => rp.bookId);
    const readAuthors = readingProgress.map((rp) => rp.book?.author).filter(Boolean);

    if (readAuthors.length > 0) {
      const relatedBooks = await prisma.book.findMany({
        where: {
          status: "PUBLISHED",
          author: { in: readAuthors },
          id: { notIn: readBookIds },
        },
        select: { id: true, title: true, slug: true, author: true, language: true },
        take: 2,
      });

      for (const rb of relatedBooks) {
        recommendations.push({
          id: `rec-author-${rb.id}`,
          type: "RELATED_AUTHOR",
          title: rb.title,
          subtitle: `By ${rb.author}`,
          url: `/library/${rb.slug}`,
          badge: "Related Author",
          reason: `Recommended because you are studying manuscripts authored by ${rb.author}`,
        });
        if (recommendations.length >= 4) break;
      }
    }
  }

  // Rule 6: Foundational Classical Recommendation (Fallback / Discovery)
  if (recommendations.length < 3) {
    const publishedBooks = await prisma.book.findMany({
      where: { status: "PUBLISHED" },
      select: { id: true, title: true, slug: true, author: true, language: true },
      take: 3,
    });

    for (const book of publishedBooks) {
      if (!readingProgress.some((rp) => rp.bookId === book.id)) {
        recommendations.push({
          id: `rec-foundation-${book.id}`,
          type: "EXPLORE_CLASSIC",
          title: book.title,
          subtitle: book.author || "Classical Vedic Author",
          url: `/library/${book.slug}`,
          badge: book.language,
          reason: "Foundational classical manuscript recommended for authentic Jyotish studies",
        });
        if (recommendations.length >= 3) break;
      }
    }
  }

  return recommendations;
}

/**
 * Preview metrics and helpful onboarding state for guest students.
 */
function getGuestDashboardPreview() {
  return {
    user: { id: null, name: "Guest Student" },
    hasLearningHistory: false,
    continueLearning: {
      type: "VEDIC_ASTROLOGY",
      category: "VEDIC_ASTROLOGY",
      title: "Introduction to Jyotisha (Vedanga)",
      subtitle: "Begin your Vedic Astrology Foundation journey",
      badge: "Start Learning",
      progress: 0,
      url: "/explore?category=overview",
      actionText: "Start Learning",
    },
    categories: {
      vedicAstrology: {
        title: "Vedic Astrology",
        sanskrit: "ज्योतिष शास्त्र",
        path: null,
        progressPercent: 0,
        completedLessons: [],
        pendingLessons: [],
        conceptsCount: 0,
      },
      kundaliniSpirituality: {
        title: "Kundalini & Spirituality",
        sanskrit: "कुण्डलिनी एवं षट्चक्र",
        path: null,
        progressPercent: 0,
        completedLessons: [],
        pendingLessons: [],
        chakrasCompleted: 0,
        totalChakras: 7,
      },
      digitalLibrary: {
        title: "Digital Library",
        sanskrit: "डिजिटल ग्रन्थागार",
        totalBooksStudied: 0,
        completedBooks: 0,
        currentlyReadingCount: 0,
        totalBookmarks: 0,
        totalNotes: 0,
        readingProgress: [],
      },
    },
    learningPaths: [],
    dailyGoals: {
      timezone: "Asia/Kolkata",
      today: {
        date: new Date().toISOString().split("T")[0],
        targetTopics: 2,
        studiedTopics: 0,
        topicsProgressPercent: 0,
        targetPages: 10,
        readPages: 0,
        pagesProgressPercent: 0,
        isCompleted: false,
      },
      streak: { currentStreak: 0, longestStreak: 0, lastActiveDate: null, activeToday: false },
      weeklyProgress: { activeDaysCount: 0, totalWeeklyXp: 0, totalWeeklyTopics: 0, totalWeeklyPages: 0, days: [] },
    },
    streak: { currentStreak: 0, longestStreak: 0, lastActiveDate: null, activeToday: false },
    recentlyViewed: [],
    summary: {
      totalBooksStudied: 0,
      completedBooks: 0,
      totalQuizAttempts: 0,
      averageQuizScore: 0,
      passedQuizzes: 0,
      totalBookmarks: 0,
      totalNotes: 0,
      totalHighlights: 0,
      totalSavedConcepts: 0,
      completedModulesCount: 0,
      studiedTopics: ["Vedic Astrology Basics", "Sanskrit Shlokas", "Nine Grahas"],
    },
    readingProgress: [],
    currentlyReading: [],
    recentlyRead: [],
    completedBooks: [],
    quizAttempts: [],
    bookmarks: [],
    notes: [],
    savedConcepts: [],
    learningModules: [],
    kundaliniModules: [],
    recommendations: [
      {
        id: "rec-guest-1",
        type: "EXPLORE_CLASSIC",
        title: "Explore Classical Manuscripts",
        subtitle: "Gurukul Digital Library",
        url: "/library",
        badge: "Getting Started",
        reason: "Sign in to persist your personal reading progress, bookmarks, and quiz scores",
      },
    ],
  };
}
