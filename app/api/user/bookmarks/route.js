import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";

async function getUserId(request) {
  const authUser = await getAuthenticatedUser(request);
  return authUser?.id || null;
}

// GET /api/user/bookmarks
export async function GET(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const passageId = searchParams.get("passageId");
    const bookId = searchParams.get("bookId");

    // Single passage check
    if (passageId) {
      const existing = await prisma.bookmark.findUnique({
        where: {
          userId_passageId: {
            userId,
            passageId,
          },
        },
      });
      return NextResponse.json({ isBookmarked: !!existing, bookmark: existing });
    }

    const where = { userId };
    if (bookId) {
      where.passage = { bookId };
    }

    const bookmarks = await prisma.bookmark.findMany({
      where,
      include: {
        passage: {
          include: {
            book: { select: { id: true, title: true, slug: true } },
            chapter: { select: { id: true, title: true, slug: true, chapterNumber: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ bookmarks });
  } catch (error) {
    console.error("GET /api/user/bookmarks error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/user/bookmarks (Toggle bookmark)
export async function POST(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { passageId, chapterId, note, bookId, pageNumber } = body;

    let targetPassageId = passageId;
    let targetChapterId = chapterId;
    const parsedPageNum = typeof pageNumber === "number" ? pageNumber : (pageNumber ? parseInt(pageNumber, 10) : null);

    if (!targetPassageId && bookId) {
      // Resolve or create passage reference for this book page
      const foundPassage = await prisma.passage.findFirst({
        where: {
          bookId,
          ...(parsedPageNum ? { sourcePage: parsedPageNum } : {}),
        },
        select: { id: true, chapterId: true },
      });

      if (foundPassage) {
        targetPassageId = foundPassage.id;
        if (!targetChapterId) targetChapterId = foundPassage.chapterId;
      } else {
        const foundChapter = await prisma.chapter.findFirst({
          where: {
            bookId,
            ...(parsedPageNum
              ? {
                  startPage: { lte: parsedPageNum },
                  endPage: { gte: parsedPageNum },
                }
              : {}),
          },
          select: { id: true },
        });

        const createdPassage = await prisma.passage.create({
          data: {
            bookId,
            chapterId: foundChapter?.id || null,
            passageNumber: parsedPageNum || 1,
            sourcePage: parsedPageNum || 1,
            text: `Manuscript Page ${parsedPageNum || 1}`,
            cleanedText: `Manuscript Page ${parsedPageNum || 1}`,
          },
        });
        targetPassageId = createdPassage.id;
        targetChapterId = foundChapter?.id || null;
      }
    }

    if (!targetPassageId) {
      return NextResponse.json({ error: "passageId or bookId with pageNumber is required" }, { status: 400 });
    }

    // Check if already bookmarked
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_passageId: {
          userId,
          passageId: targetPassageId,
        },
      },
    });

    if (existing) {
      // Toggle off: remove
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ bookmarked: false, message: "Bookmark removed" });
    }

    // Toggle on: create
    const created = await prisma.bookmark.create({
      data: {
        userId,
        passageId: targetPassageId,
        chapterId: targetChapterId || null,
        note: note || null,
      },
    });

    return NextResponse.json({ bookmarked: true, bookmark: created, message: "Bookmark saved" });
  } catch (error) {
    console.error("POST /api/user/bookmarks error:", error);
    return NextResponse.json(
      { error: "Failed to toggle bookmark", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/user/bookmarks
export async function DELETE(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body = null;
    try {
      body = await request.json();
    } catch (_) {}

    const { searchParams } = new URL(request.url);
    const passageId = searchParams.get("passageId") || body?.passageId;
    const bookmarkId = searchParams.get("id") || body?.id;
    const bookId = searchParams.get("bookId") || body?.bookId;
    const pageNumberStr = searchParams.get("pageNumber") || body?.pageNumber;
    const pageNumber = pageNumberStr ? parseInt(pageNumberStr, 10) : null;

    if (bookmarkId) {
      await prisma.bookmark.deleteMany({
        where: { id: bookmarkId, userId },
      });
      return NextResponse.json({ success: true, message: "Bookmark removed" });
    }

    if (passageId) {
      await prisma.bookmark.deleteMany({
        where: { passageId, userId },
      });
      return NextResponse.json({ success: true, message: "Bookmark removed" });
    }

    if (bookId && pageNumber) {
      const passages = await prisma.passage.findMany({
        where: { bookId, sourcePage: pageNumber },
        select: { id: true },
      });
      const pIds = passages.map((p) => p.id);
      if (pIds.length > 0) {
        await prisma.bookmark.deleteMany({
          where: { userId, passageId: { in: pIds } },
        });
      }
      return NextResponse.json({ success: true, message: "Bookmark removed" });
    }

    return NextResponse.json({ error: "passageId, id, or bookId with pageNumber required" }, { status: 400 });
  } catch (error) {
    console.error("DELETE /api/user/bookmarks error:", error);
    return NextResponse.json(
      { error: "Failed to delete bookmark", details: error.message },
      { status: 500 }
    );
  }
}
