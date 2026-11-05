import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireManagePermission, requireReviewPermission } from "@/server/security/authGuard";
import { structureBook } from "@/server/ingest/structureBook";
import { logAdminActivity } from "@/server/admin/audit";

// GET /api/books/[id]/structure
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const auth = await requireReviewPermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }

    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        chapters: {
          orderBy: { chapterNumber: "asc" },
          include: {
            passages: {
              orderBy: { sortOrder: "asc" },
              include: {
                correctionHistory: {
                  orderBy: { createdAt: "desc" },
                },
              },
            },
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Unassigned passages (passages with no chapterId)
    const unassignedPassages = await prisma.passage.findMany({
      where: { bookId: id, chapterId: null },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      book: {
        id: book.id,
        title: book.title,
        slug: book.slug,
        status: book.status,
        processingStatus: book.processingStatus,
      },
      chapters: book.chapters,
      unassignedPassages,
    });
  } catch (error) {
    console.error("GET /api/books/[id]/structure error:", error);
    return NextResponse.json(
      { error: "Failed to fetch book structure", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/books/[id]/structure (Triggers Reprocessing / Structuring)
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const auth = await requireManagePermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const stats = await structureBook(id);

    await logAdminActivity({
      actorId: user.id,
      actorEmail: user.email || user.id,
      actorRole: user.role,
      action: "BOOK_STRUCTURE_EXECUTE",
      targetResource: "Book",
      targetId: id,
      status: "SUCCESS",
      details: stats,
    });

    return NextResponse.json({
      message: "Book structuring completed successfully",
      stats,
    });
  } catch (error) {
    console.error("POST /api/books/[id]/structure error:", error);
    return NextResponse.json(
      { error: "Failed to structure book", details: error.message },
      { status: 500 }
    );
  }
}
