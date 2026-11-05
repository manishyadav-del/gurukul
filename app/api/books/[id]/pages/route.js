import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { canReviewBooks } from "@/lib/permissions";
import { getAuthenticatedUser } from "@/server/security/authGuard";

// GET /api/books/[id]/pages?q=...&page=1&limit=50
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const pageNumber = searchParams.get("pageNumber") ? parseInt(searchParams.get("pageNumber"), 10) : null;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const book = await prisma.book.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      select: { id: true, status: true, title: true, pageCount: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const user = await getAuthenticatedUser(request);

    // Public users can strictly only view pages from PUBLISHED books
    if (book.status !== "PUBLISHED") {
      if (!user || !canReviewBooks(user)) {
        return NextResponse.json(
          { error: "Forbidden: Manuscript is unpublished" },
          { status: 403 }
        );
      }
    }

    const where = { bookId: book.id };
    if (pageNumber) {
      where.pageNumber = pageNumber;
    }

    // In-book search filter
    if (q) {
      where.OR = [
        { proofreadText: { contains: q, mode: "insensitive" } },
        { cleanedText: { contains: q, mode: "insensitive" } },
        { rawText: { contains: q, mode: "insensitive" } },
      ];
    }

    const [pages, total] = await Promise.all([
      prisma.bookPage.findMany({
        where,
        orderBy: { pageNumber: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          pageNumber: true,
          pdfPageIndex: true,
          processingMethod: true,
          ocrConfidence: true,
          ocrCompleted: true,
          proofread: true,
          ocrEngine: true,
          qualityIssues: true,
          language: true,
          rawText: true,
          cleanedText: true,
          proofreadText: true,
          imageUrl: true,
        },
      }),
      prisma.bookPage.count({ where }),
    ]);

    return NextResponse.json({
      bookId: book.id,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      pages,
    });
  } catch (error) {
    console.error("GET /api/books/[id]/pages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch book pages", details: error.message },
      { status: 500 }
    );
  }
}
