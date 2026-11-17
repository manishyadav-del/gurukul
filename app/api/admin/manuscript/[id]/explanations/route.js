import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { canReviewBooks, canManageBooks } from "@/lib/permissions";
import { logAdminActivity } from "@/server/admin/audit";

// GET /api/admin/manuscript/[id]/explanations
// List all explanations for studio review (filterable by status, pageNumber, chapterId)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user || (!canReviewBooks(user) && !canManageBooks(user))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const pageNumber = searchParams.get("pageNumber") ? Number(searchParams.get("pageNumber")) : null;
    const chapterId = searchParams.get("chapterId");

    const book = await prisma.book.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true, title: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const where = { bookId: book.id };
    if (status) where.status = status;
    if (pageNumber) where.pageNumber = pageNumber;
    if (chapterId) where.chapterId = chapterId;

    const explanations = await prisma.scholarlyExplanation.findMany({
      where,
      orderBy: [{ pageNumber: "asc" }, { createdAt: "desc" }],
      include: {
        chapter: { select: { id: true, title: true } },
        passage: { select: { id: true, text: true, verseNumber: true, sourcePage: true } },
      },
    });

    return NextResponse.json({
      bookId: book.id,
      total: explanations.length,
      explanations,
    });
  } catch (err) {
    console.error("GET /api/admin/manuscript/[id]/explanations error:", err);
    return NextResponse.json({ error: err.message || "Failed to load explanations" }, { status: 500 });
  }
}

// POST /api/admin/manuscript/[id]/explanations
// Create a new scholarly explanation (or ingest an AI draft for review)
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user || (!canReviewBooks(user) && !canManageBooks(user))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const book = await prisma.book.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const body = await request.json();
    const {
      passageId = null,
      pageNumber = null,
      chapterId = null,
      explanationType = "COMMENTARY", // SIMPLE, WORD_BY_WORD, GRAMMAR, ANVAYA, COMMENTARY, AI_GENERATED
      content,
      language = "en",
      status = "VERIFIED", // Admin-created defaults to VERIFIED
      isPublished = true,
      reviewerNotes = null,
    } = body || {};

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Explanation content cannot be empty" }, { status: 400 });
    }

    const explanation = await prisma.scholarlyExplanation.create({
      data: {
        bookId: book.id,
        passageId: passageId || null,
        chapterId: chapterId || null,
        pageNumber: pageNumber ? Number(pageNumber) : null,
        explanationType,
        content: content.trim(),
        language,
        status,
        isPublished: Boolean(isPublished),
        reviewerId: user.id,
        reviewerEmail: user.email,
        reviewerNotes,
      },
    });

    return NextResponse.json({
      success: true,
      explanation,
    });
  } catch (err) {
    console.error("POST /api/admin/manuscript/[id]/explanations error:", err);
    return NextResponse.json({ error: err.message || "Failed to create explanation" }, { status: 500 });
  }
}

// PATCH /api/admin/manuscript/[id]/explanations
// Approve, correct, reject, or publish an explanation
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);
    if (!user || (!canReviewBooks(user) && !canManageBooks(user))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      explanationId,
      action, // 'approve', 'reject', 'publish', 'unpublish', 'correct'
      content,
      status,
      isPublished,
      reviewerNotes,
    } = body || {};

    if (!explanationId) {
      return NextResponse.json({ error: "explanationId is required" }, { status: 400 });
    }

    const updateData = {};

    switch (action) {
      case "approve":
        updateData.status = "VERIFIED";
        updateData.isPublished = true;
        updateData.reviewerId = user.id;
        updateData.reviewerEmail = user.email;
        break;
      case "reject":
        updateData.status = "REJECTED";
        updateData.isPublished = false;
        updateData.reviewerId = user.id;
        updateData.reviewerEmail = user.email;
        break;
      case "publish":
        updateData.isPublished = true;
        break;
      case "unpublish":
        updateData.isPublished = false;
        break;
      case "correct":
        updateData.status = "VERIFIED_WITH_CORRECTIONS";
        updateData.isPublished = true;
        if (content) updateData.content = content.trim();
        updateData.reviewerId = user.id;
        updateData.reviewerEmail = user.email;
        break;
      default:
        if (content) updateData.content = content.trim();
        if (status) updateData.status = status;
        if (typeof isPublished === "boolean") updateData.isPublished = isPublished;
        updateData.reviewerId = user.id;
        updateData.reviewerEmail = user.email;
    }

    if (reviewerNotes) updateData.reviewerNotes = reviewerNotes;

    const updated = await prisma.scholarlyExplanation.update({
      where: { id: explanationId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      explanation: updated,
    });
  } catch (err) {
    console.error("PATCH /api/admin/manuscript/[id]/explanations error:", err);
    return NextResponse.json({ error: err.message || "Failed to update explanation" }, { status: 500 });
  }
}
