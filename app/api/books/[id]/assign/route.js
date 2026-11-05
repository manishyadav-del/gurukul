import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireReviewPermission } from "@/server/security/authGuard";
import { canReviewBooks } from "@/lib/permissions";
import { logAdminActivity } from "@/server/admin/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/books/[id]/assign
 * Assigns an editorial reviewer to a book or specific pages.
 * Body: { reviewerEmail: string, pageIds?: string[], notes?: string }
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const auth = await requireReviewPermission(request);
    if (auth.errorResponse) return auth.errorResponse;
    const actor = auth.user;

    const body = await request.json().catch(() => ({}));
    const { reviewerEmail, pageIds, notes } = body;

    if (!reviewerEmail || typeof reviewerEmail !== "string") {
      return NextResponse.json(
        { error: "reviewerEmail is required" },
        { status: 400 }
      );
    }

    // Verify book exists
    const book = await prisma.book.findUnique({
      where: { id },
      select: { id: true, title: true, publicationReadiness: true },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Verify reviewer exists and has review permissions
    const targetUser = await prisma.user.findUnique({
      where: { email: reviewerEmail.trim().toLowerCase() },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: `User with email "${reviewerEmail}" not found` },
        { status: 404 }
      );
    }

    if (!targetUser.isActive) {
      return NextResponse.json(
        { error: "Target reviewer account is inactive" },
        { status: 400 }
      );
    }

    if (!canReviewBooks(targetUser)) {
      return NextResponse.json(
        {
          error: `User "${reviewerEmail}" does not have reviewer permissions (Role: ${targetUser.role})`,
        },
        { status: 403 }
      );
    }

    // Perform assignment transaction
    const now = new Date();
    const updatedCount = await prisma.$transaction(async (tx) => {
      // 1. Update pages
      const pageWhere = { bookId: id };
      if (Array.isArray(pageIds) && pageIds.length > 0) {
        pageWhere.id = { in: pageIds };
      }

      const res = await tx.bookPage.updateMany({
        where: pageWhere,
        data: {
          reviewedBy: targetUser.email,
        },
      });

      // 2. Update publicationReadiness assignment cache on Book
      const currentReadiness = (typeof book.publicationReadiness === "object" && book.publicationReadiness !== null)
        ? book.publicationReadiness
        : {};

      await tx.book.update({
        where: { id },
        data: {
          publicationReadiness: {
            ...currentReadiness,
            assignment: {
              assignedEmail: targetUser.email,
              assignedName: targetUser.name,
              assignedRole: targetUser.role,
              assignedById: actor.id,
              assignedByEmail: actor.email,
              assignedAt: now.toISOString(),
              notes: notes || null,
            },
          },
        },
      });

      return res.count;
    });

    // 3. Log administrative audit activity
    await logAdminActivity({
      actorId: actor.id,
      actorEmail: actor.email,
      actorRole: actor.role,
      action: "BOOK_ASSIGN_REVIEWER",
      targetResource: "Book",
      targetId: id,
      details: {
        bookTitle: book.title,
        assignedTo: targetUser.email,
        assignedRole: targetUser.role,
        pagesCount: updatedCount,
        notes: notes || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Assigned ${targetUser.name || targetUser.email} as reviewer for "${book.title}" (${updatedCount} pages).`,
      assignment: {
        reviewerEmail: targetUser.email,
        reviewerName: targetUser.name,
        reviewerRole: targetUser.role,
        assignedAt: now.toISOString(),
        pagesUpdated: updatedCount,
      },
    });
  } catch (error) {
    console.error("POST /api/books/[id]/assign error:", error);
    return NextResponse.json(
      { error: "Failed to assign reviewer", details: error.message },
      { status: 500 }
    );
  }
}
