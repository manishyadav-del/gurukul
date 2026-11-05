import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { explainPassage } from "@/server/ai/passageExplainer";

// POST /api/books/[id]/explain
export async function POST(request, { params }) {
  try {
    const { id: bookId } = await params;
    const body = await request.json();
    const {
      passageText,
      pageNumber,
      language = "en",
      ocrConfidence = 0.9,
    } = body || {};

    if (!passageText || typeof passageText !== "string" || passageText.trim().length < 3) {
      return NextResponse.json(
        { error: "Passage text must be at least 3 characters long." },
        { status: 400 }
      );
    }

    let bookTitle = "Gurukul Manuscript";
    let chapterTitle = "Classical Chapter";

    const book = await prisma.book.findFirst({
      where: {
        OR: [{ id: bookId }, { slug: bookId }],
      },
      select: {
        id: true,
        status: true,
        title: true,
        chapters: {
          where: pageNumber
            ? {
                startPage: { lte: pageNumber },
                endPage: { gte: pageNumber },
              }
            : undefined,
          take: 1,
          select: { title: true },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (book.status !== "PUBLISHED") {
      const { getAuthenticatedUser } = await import("@/server/security/authGuard");
      const { canReviewBooks } = await import("@/lib/permissions");
      const user = await getAuthenticatedUser(request);
      if (!user || !canReviewBooks(user)) {
        return NextResponse.json(
          { error: "Forbidden: Manuscript is unpublished" },
          { status: 403 }
        );
      }
    }

    bookTitle = book.title;
    if (book.chapters?.[0]?.title) {
      chapterTitle = book.chapters[0].title;
    }

    const explanation = await explainPassage({
      passageText: passageText.trim(),
      bookTitle,
      chapterTitle,
      pageNumber,
      language: language === "hi" ? "hi" : "en",
      ocrConfidence: typeof ocrConfidence === "number" ? ocrConfidence : 0.9,
    });

    return NextResponse.json({
      success: true,
      explanation,
    });
  } catch (err) {
    console.error("Book explain route error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate passage explanation." },
      { status: 500 }
    );
  }
}
