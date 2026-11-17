/**
 * Gurukul User Reading & Research Analytics Service
 * 
 * Reuses existing ReadingProgress, User streaks, XP transactions,
 * Bookmarks, and Research Collections without creating duplicate gamification systems.
 */

import prisma from "../../lib/prisma.js";

/**
 * Retrieves comprehensive reading metrics and research statistics for a user.
 * 
 * @param {string} userId
 * @returns {Promise<Object>}
 */
export async function getUserReadingAnalytics(userId) {
  if (!userId) {
    throw new Error("Authentication required to view reading analytics.");
  }

  // 1. Fetch user record with streaks and level
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      totalXp: true,
      level: true,
      currentStreak: true,
      longestStreak: true,
      lastActiveDate: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  // 2. Fetch Reading Progress records with book and chapter details
  const allReadingProgress = await prisma.readingProgress.findMany({
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
          coverUrl: true,
          coverImageUrl: true,
        },
      },
      chapter: {
        select: {
          id: true,
          title: true,
          slug: true,
          chapterNumber: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const booksInProgress = allReadingProgress.filter(
    (rp) => !rp.isCompleted && (rp.progress || 0) < 100
  );

  const booksCompleted = allReadingProgress.filter(
    (rp) => rp.isCompleted || (rp.progress || 0) >= 100
  );

  // 3. Count bookmarks, research collections, and research items
  const [
    bookmarkCount,
    savedPassageItemCount,
    collectionCount,
    totalResearchItemsCount,
    readingXpRecords,
  ] = await Promise.all([
    prisma.bookmark.count({ where: { userId } }),
    prisma.researchItem.count({ where: { userId, itemType: "SAVED_PASSAGE" } }),
    prisma.researchCollection.count({ where: { userId } }),
    prisma.researchItem.count({ where: { userId } }),
    prisma.xPTransaction.aggregate({
      where: {
        userId,
        OR: [
          { actionType: { startsWith: "READING" } },
          { actionType: { startsWith: "PASSAGE" } },
          { actionType: { startsWith: "CHAPTER" } },
        ],
      },
      _sum: { amount: true },
    }),
  ]);

  const savedPassagesTotal = bookmarkCount + savedPassageItemCount;
  const readingXp = readingXpRecords._sum.amount || 0;

  // 4. Recent reading history sessions
  const recentActivity = allReadingProgress.slice(0, 8).map((rp) => ({
    id: rp.id,
    bookId: rp.bookId,
    bookTitle: rp.book?.title || "Classical Shastra",
    bookSlug: rp.book?.slug,
    chapterTitle: rp.chapter?.title || "Chapter 1",
    chapterNumber: rp.chapter?.chapterNumber || 1,
    progress: Math.round(rp.progress || 0),
    isCompleted: rp.isCompleted || (rp.progress || 0) >= 100,
    pageNumber: rp.pageNumber,
    lastReadAt: rp.updatedAt || rp.lastReadAt,
    readerUrl: `/library/${rp.book?.slug || rp.bookId}/${rp.chapter?.slug || ""}`,
  }));

  return {
    userId: user.id,
    userName: user.name,
    stats: {
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      totalXp: user.totalXp || 0,
      readingXp,
      level: user.level || 1,
      totalBooksEncountered: allReadingProgress.length,
      booksInProgressCount: booksInProgress.length,
      booksCompletedCount: booksCompleted.length,
      savedPassagesCount: savedPassagesTotal,
      researchCollectionsCount: collectionCount,
      totalResearchItemsCount,
    },
    booksInProgress: booksInProgress.map((rp) => ({
      bookId: rp.bookId,
      bookTitle: rp.book?.title,
      bookSlug: rp.book?.slug,
      author: rp.book?.author,
      language: rp.book?.language,
      progress: Math.round(rp.progress || 0),
      chapterTitle: rp.chapter?.title,
      pageNumber: rp.pageNumber,
      updatedAt: rp.updatedAt,
    })),
    booksCompleted: booksCompleted.map((rp) => ({
      bookId: rp.bookId,
      bookTitle: rp.book?.title,
      bookSlug: rp.book?.slug,
      author: rp.book?.author,
      completedAt: rp.completedAt || rp.updatedAt,
    })),
    recentActivity,
  };
}
