import { NextResponse } from "next/server.js";
import prisma from "../../../../lib/prisma.js";
import { explainPassage } from "../../../../server/ai/passageExplainer.js";
import { inspectPassageAiFeatures } from "../../../../server/ai/researchAssistant.js";
import { getAuthenticatedUser } from "../../../../server/security/authGuard.js";

// POST /api/reader/explain
export async function POST(request) {
  try {
    const user = await getAuthenticatedUser(request);
    const body = await request.json();
    const {
      passageId,
      passageText,
      bookId,
      bookTitle,
      chapterTitle,
      pageNumber,
      action = "explain",
      language = "en",
      ocrConfidence = 0.9,
    } = body || {};

    let resolvedPassageText = (passageText || "").trim();
    let resolvedBookTitle = bookTitle || "";
    let resolvedChapterTitle = chapterTitle || "";
    let resolvedPageNumber = pageNumber || null;
    let resolvedPassageNumber = null;
    let isVerified = false;

    // 1. If passageId provided, load passage and enforce security & verification checks
    if (passageId) {
      const dbPassage = await prisma.passage.findUnique({
        where: { id: passageId },
        include: {
          book: { select: { id: true, title: true, slug: true, status: true } },
          chapter: { select: { id: true, title: true, slug: true } },
          page: { select: { id: true, pageNumber: true, proofread: true } },
        },
      });

      if (!dbPassage) {
        return NextResponse.json({ error: "Passage not found" }, { status: 404 });
      }

      // Check book publication status
      if (dbPassage.book.status !== "PUBLISHED") {
        const { getAuthenticatedUser } = await import("../../../../server/security/authGuard.js");
        const { canReviewBooks } = await import("../../../../lib/permissions.js");
        const user = await getAuthenticatedUser(request);
        if (!user || !canReviewBooks(user)) {
          return NextResponse.json(
            { error: "Forbidden: Manuscript is unpublished" },
            { status: 403 }
          );
        }
      }

      resolvedPassageText = dbPassage.text || "";
      resolvedBookTitle = dbPassage.book.title;
      resolvedChapterTitle = dbPassage.chapter?.title || "";
      resolvedPageNumber = dbPassage.sourcePage || dbPassage.page?.pageNumber || resolvedPageNumber;
      resolvedPassageNumber = dbPassage.passageNumber;
      isVerified = Boolean(dbPassage.page?.proofread || dbPassage.page?.needsReview === false);
    } else if (bookId) {
      // If bookId is provided without passageId, look up book details and enforce publication check
      const book = await prisma.book.findFirst({
        where: { OR: [{ id: bookId }, { slug: bookId }] },
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

      if (book) {
        if (book.status !== "PUBLISHED") {
          const { getAuthenticatedUser } = await import("../../../../server/security/authGuard.js");
          const { canReviewBooks } = await import("../../../../lib/permissions.js");
          const user = await getAuthenticatedUser(request);
          if (!user || !canReviewBooks(user)) {
            return NextResponse.json(
              { error: "Forbidden: Manuscript is unpublished" },
              { status: 403 }
            );
          }
        }

        if (!resolvedBookTitle) resolvedBookTitle = book.title;
        if (!resolvedChapterTitle && book.chapters?.[0]) {
          resolvedChapterTitle = book.chapters[0].title;
        }
      }
    }

    if (!resolvedPassageText || resolvedPassageText.length < 5) {
      const unverifiedResponse = await explainPassage({
        passageId,
        passageText: resolvedPassageText,
        bookTitle: resolvedBookTitle,
        chapterTitle: resolvedChapterTitle,
        pageNumber: resolvedPageNumber,
        passageNumber: resolvedPassageNumber,
        language: language === "hi" ? "hi" : "en",
        ocrConfidence: typeof ocrConfidence === "number" ? ocrConfidence : 0.9,
        isVerified,
      });

      return NextResponse.json({
        success: false,
        needsReview: true,
        explanation: unverifiedResponse,
      }, { status: 422 });
    }

    if (action && action !== "explain") {
      const featureResult = await inspectPassageAiFeatures({
        passageId,
        passageText: resolvedPassageText,
        bookTitle: resolvedBookTitle,
        chapterTitle: resolvedChapterTitle,
        pageNumber: resolvedPageNumber,
        passageNumber: resolvedPassageNumber,
        action,
        language: language === "hi" ? "hi" : "en",
        ocrConfidence: typeof ocrConfidence === "number" ? ocrConfidence : 0.9,
        user,
      });

      return NextResponse.json(featureResult);
    }

    const explanation = await explainPassage({
      passageId,
      passageText: resolvedPassageText,
      bookTitle: resolvedBookTitle,
      chapterTitle: resolvedChapterTitle,
      pageNumber: resolvedPageNumber,
      passageNumber: resolvedPassageNumber,
      language: language === "hi" ? "hi" : "en",
      ocrConfidence: typeof ocrConfidence === "number" ? ocrConfidence : 0.9,
      isVerified,
    });

    return NextResponse.json({
      success: true,
      explanation,
    });
  } catch (err) {
    console.error("Reader explain passage error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate passage explanation." },
      { status: 500 }
    );
  }
}
