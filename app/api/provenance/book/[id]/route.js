import { NextResponse } from "next/server.js";
import { getBookProvenance } from "@/server/provenance/provenanceService.js";
import { getAuthenticatedUser } from "@/server/security/authGuard.js";
import { canReviewBooks } from "@/lib/permissions.js";

/**
 * GET /api/provenance/book/[id]
 * Retrieves bibliographic provenance, OCR accuracy metrics, and verification coverage for a book.
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const bookProvenance = await getBookProvenance(id);

    if (!bookProvenance) {
      return NextResponse.json({ error: "Book provenance not found" }, { status: 404 });
    }

    if (bookProvenance.status !== "PUBLISHED") {
      const user = await getAuthenticatedUser(request);
      if (!user || !canReviewBooks(user)) {
        return NextResponse.json(
          { error: "Forbidden: Manuscript is not publicly published" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ provenance: bookProvenance });
  } catch (error) {
    console.error("GET /api/provenance/book/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch book provenance", details: error.message },
      { status: 500 }
    );
  }
}
