import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { updateBookSchema } from "@/lib/validation";
import { canManageBooks, canReviewBooks } from "@/lib/permissions";
import { getAuthenticatedUser, requireManagePermission, requirePublishPermission, requireRole } from "@/server/security/authGuard";
import { logAdminActivity } from "@/server/admin/audit";

// GET /api/books/[id]
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const book = await prisma.book.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        chapters: { orderBy: { number: "asc" } },
        pages: {
          orderBy: { pageNumber: "asc" },
          select: {
            id: true, pageNumber: true, pdfPageIndex: true,
            processingMethod: true, ocrConfidence: true,
            ocrCompleted: true, proofread: true, imageUrl: true,
            ocrEngine: true, qualityIssues: true,
            language: true, rawText: true, cleanedText: true, proofreadText: true,
          },
        },
        ingestJobs: { orderBy: { createdAt: "desc" }, take: 5 },
        ocrErrors: { where: { resolved: false }, orderBy: { createdAt: "desc" }, take: 20 },
        _count: {
          select: {
            chapters: true, passages: true, pages: true,
            ingestJobs: true, ocrErrors: true,
          },
        },
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const user = await getAuthenticatedUser(request);

    // Public users can only view PUBLISHED books
    if (book.status !== "PUBLISHED") {
      if (!user || !canReviewBooks(user)) {
        return NextResponse.json(
          { error: "Forbidden: Manuscript is unpublished" },
          { status: 403 }
        );
      }
    }

    // Protect private internal storage paths from unprivileged users
    if (!user || !canReviewBooks(user)) {
      delete book.originalFileUrl;
      delete book.sourcePdf;
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error("GET /api/books/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch book", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/books/[id]
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const auth = await requireManagePermission(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const body = await request.json();

    // Prevent direct status tampering via PATCH /api/books/[id]
    if (body.status !== undefined && body.status !== book.status) {
      return NextResponse.json(
        {
          error: "Forbidden: Direct status modification via general book update is blocked. Use the governed lifecycle endpoints (/lifecycle or /publish) to change book status.",
        },
        { status: 400 }
      );
    }

    const validated = updateBookSchema.parse(body);

    const updated = await prisma.book.update({
      where: { id },
      data: validated,
    });

    await logAdminActivity({
      actorId: user.id,
      actorEmail: user.email || user.id,
      actorRole: user.role,
      action: "BOOK_METADATA_UPDATE",
      targetResource: "Book",
      targetId: id,
      status: "SUCCESS",
      details: {
        fieldsUpdated: Object.keys(validated),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 422 });
    }
    console.error("PATCH /api/books/[id] error:", error);
    return NextResponse.json({ error: "Failed to update book", details: error.message }, { status: 500 });
  }
}

// DELETE /api/books/[id]
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const auth = await requireRole(request, ["SUPER_ADMIN", "ADMIN"]);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const book = await prisma.book.findUnique({ where: { id }, select: { id: true, title: true } });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    await prisma.book.delete({ where: { id } });

    // Clean up associated file storage assets
    try {
      const { deleteBookDirectory } = await import("@/server/storage/delete.js");
      await deleteBookDirectory(id);
    } catch (storageCleanupErr) {
      console.warn(`[Storage] Failed to cleanup storage for deleted book ${id}:`, storageCleanupErr.message);
    }

    await logAdminActivity({
      actorId: user.id,
      actorEmail: user.email || user.id,
      actorRole: user.role,
      action: "BOOK_DELETE",
      targetResource: "Book",
      targetId: id,
      status: "SUCCESS",
      details: { title: book.title },
    });

    return NextResponse.json({ success: true, message: "Book deleted" });
  } catch (error) {
    console.error("DELETE /api/books/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete book", details: error.message }, { status: 500 });
  }
}
