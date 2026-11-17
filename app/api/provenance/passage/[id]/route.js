import { NextResponse } from "next/server.js";
import { getPassageProvenance, submitPassageForReview } from "@/server/provenance/provenanceService.js";
import { getAuthenticatedUser, requireReviewPermission } from "@/server/security/authGuard.js";
import { canReviewBooks } from "@/lib/permissions.js";

/**
 * GET /api/provenance/passage/[id]
 * Retrieves comprehensive scholarly provenance for a passage.
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const provenance = await getPassageProvenance(id);

    if (!provenance) {
      return NextResponse.json({ error: "Passage provenance not found" }, { status: 404 });
    }

    // Protect unpublished manuscript provenance from public viewers
    if (provenance.structuralReference && provenance.bibliographicDetails) {
      const user = await getAuthenticatedUser(request);
      // If book is draft/unpublished, only reviewers/admins can view
      if (!provenance.structuralReference.bookSlug) {
        if (!user || !canReviewBooks(user)) {
          return NextResponse.json(
            { error: "Forbidden: Manuscript is not publicly published" },
            { status: 403 }
          );
        }
      }
    }

    return NextResponse.json({ provenance });
  } catch (error) {
    console.error("GET /api/provenance/passage/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch passage provenance", details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/provenance/passage/[id]
 * Submits a passage to the scholarly verification queue.
 */
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const auth = await requireReviewPermission(request);
    if (auth.errorResponse) return auth.errorResponse;

    const body = await request.json().catch(() => ({}));
    const updated = await submitPassageForReview({
      passageId: id,
      user: auth.user,
      notes: body.notes || null,
    });

    return NextResponse.json({
      success: true,
      message: "Passage queued for scholarly review",
      passage: updated,
    });
  } catch (error) {
    console.error("POST /api/provenance/passage/[id] submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit passage for review", details: error.message },
      { status: 500 }
    );
  }
}
