import { NextResponse } from "next/server";
import { transitionBookStatus } from "@/server/books/lifecycle";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { canPublishBooks } from "@/lib/permissions";
import { evaluateBookQuality } from "@/server/ocr/qualityChecks";

/**
 * POST /api/books/[id]/publish
 * Explicit Publication Endpoint (Phase 4)
 * Body: { overrideWarnings?: boolean, versionNotes?: string }
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    if (!canPublishBooks(user)) {
      return NextResponse.json(
        { error: "Forbidden: Publishing books requires publication approval permissions (ADMIN, CONTENT_ADMIN, SUPER_ADMIN)" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { overrideWarnings = false, versionNotes = "" } = body;

    const updatedBook = await transitionBookStatus(id, "PUBLISHED", {
      user,
      notes: versionNotes,
      overrideWarnings,
    });

    return NextResponse.json({
      success: true,
      message: `Book published successfully as Version ${updatedBook.publishedVersion}!`,
      book: {
        id: updatedBook.id,
        title: updatedBook.title,
        status: updatedBook.status,
        publishedVersion: updatedBook.publishedVersion,
        publishedAt: updatedBook.publishedAt,
        publishedBy: updatedBook.publishedBy,
      },
    });
  } catch (error) {
    console.error("POST /api/books/[id]/publish error:", error);
    const status = error.statusCode || 500;
    return NextResponse.json(
      {
        error: error.message || "Failed to publish book",
        checklist: error.readinessReport?.checklist,
        readinessScore: error.readinessReport?.readinessScore,
      },
      { status }
    );
  }
}
