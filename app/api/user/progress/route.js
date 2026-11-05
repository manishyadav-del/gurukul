import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { awardXp, recordDailyActivity, checkAchievements } from "@/server/gamification/engine";

async function getUserId(request) {
  const authUser = await getAuthenticatedUser(request);
  return authUser?.id || null;
}

// GET /api/user/progress?bookId=...
export async function GET(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookId = searchParams.get("bookId");

    if (bookId) {
      const progress = await prisma.readingProgress.findUnique({
        where: {
          userId_bookId: {
            userId,
            bookId,
          },
        },
        include: {
          book: {
            select: { id: true, title: true, slug: true, status: true, pageCount: true },
          },
          chapter: {
            select: { id: true, title: true, slug: true, chapterNumber: true, startPage: true, endPage: true },
          },
          passage: {
            select: { id: true, passageNumber: true, sourcePage: true },
          },
        },
      });

      return NextResponse.json({ progress });
    }

    // List all reading progress for user (Recently Read)
    const allProgress = await prisma.readingProgress.findMany({
      where: { userId },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            slug: true,
            language: true,
            coverUrl: true,
            pageCount: true,
            status: true,
            _count: { select: { chapters: true, passages: true } },
          },
        },
        chapter: {
          select: { id: true, title: true, slug: true, chapterNumber: true, startPage: true, endPage: true },
        },
        passage: {
          select: { id: true, passageNumber: true, sourcePage: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ recentBooks: allProgress });
  } catch (error) {
    console.error("GET /api/user/progress error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reading progress", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/user/progress
export async function POST(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookId, chapterId, passageId, pageNumber, progress } = body;

    if (!bookId) {
      return NextResponse.json({ error: "bookId is required" }, { status: 400 });
    }

    // Verify book exists and enforce publication check
    const targetBook = await prisma.book.findFirst({
      where: { OR: [{ id: bookId }, { slug: bookId }] },
      select: { id: true, status: true },
    });

    if (!targetBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (targetBook.status !== "PUBLISHED") {
      const { canReviewBooks } = await import("@/lib/permissions");
      const authUser = await getAuthenticatedUser(request);
      if (!authUser || !canReviewBooks(authUser)) {
        return NextResponse.json(
          { error: "Forbidden: Cannot record reading progress for unpublished manuscript" },
          { status: 403 }
        );
      }
    }

    const actualBookId = targetBook.id;

    let resolvedPageNumber = typeof pageNumber === "number" ? pageNumber : null;
    if (!resolvedPageNumber && passageId) {
      const p = await prisma.passage.findUnique({
        where: { id: passageId },
        select: { sourcePage: true },
      });
      if (p?.sourcePage) resolvedPageNumber = p.sourcePage;
    }

    const progressPercent = typeof progress === "number" ? Math.min(100, Math.max(0, progress)) : 0;
    const isCompleted = progressPercent >= 100;

    const record = await prisma.readingProgress.upsert({
      where: {
        userId_bookId: {
          userId,
          bookId: actualBookId,
        },
      },
      update: {
        chapterId: chapterId || null,
        passageId: passageId || null,
        pageNumber: resolvedPageNumber,
        progress: progressPercent,
        isCompleted: isCompleted ? true : undefined,
        completedAt: isCompleted ? new Date() : undefined,
        updatedAt: new Date(),
      },
      create: {
        userId,
        bookId: actualBookId,
        chapterId: chapterId || null,
        passageId: passageId || null,
        pageNumber: resolvedPageNumber,
        progress: progressPercent,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // Gamification: streak tracking, reading session award, and completion awards
    let gamification = { awardedXp: 0, newAchievements: [] };
    try {
      await recordDailyActivity({ userId });

      // Session award with cooldown & daily limits
      const sessionAward = await awardXp({
        userId,
        actionType: "READING_SESSION",
        description: "Active scripture reading session",
      });
      if (sessionAward.awarded) gamification.awardedXp += sessionAward.amount;

      // Chapter completion award (idempotent per chapter)
      if (chapterId && isCompleted) {
        const chapterAward = await awardXp({
          userId,
          actionType: "CHAPTER_COMPLETED",
          referenceId: chapterId,
          description: "Completed manuscript chapter",
        });
        if (chapterAward.awarded) gamification.awardedXp += chapterAward.amount;
      }

      // Book completion award (idempotent per book)
      if (isCompleted) {
        const bookAward = await awardXp({
          userId,
          actionType: "BOOK_COMPLETED",
          referenceId: bookId,
          description: "Completed full manuscript book",
        });
        if (bookAward.awarded) gamification.awardedXp += bookAward.amount;
      }

      gamification.newAchievements = await checkAchievements(userId);
    } catch (gamificationErr) {
      console.error("Gamification error during progress update:", gamificationErr);
    }

    return NextResponse.json({ success: true, progress: record, gamification });
  } catch (error) {
    console.error("POST /api/user/progress error:", error);
    return NextResponse.json(
      { error: "Failed to update reading progress", details: error.message },
      { status: 500 }
    );
  }
}
