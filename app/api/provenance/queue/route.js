import { NextResponse } from "next/server.js";
import { getVerificationQueue } from "@/server/provenance/provenanceService.js";
import { requireReviewPermission } from "@/server/security/authGuard.js";

/**
 * GET /api/provenance/queue
 * Retrieves the pending and in-progress passages for scholarly review.
 */
export async function GET(request) {
  try {
    const auth = await requireReviewPermission(request);
    if (auth.errorResponse) return auth.errorResponse;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || null;
    const bookId = searchParams.get("bookId") || null;
    const language = searchParams.get("language") || null;
    const tradition = searchParams.get("tradition") || null;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const queueData = await getVerificationQueue({
      status,
      bookId,
      language,
      tradition,
      page,
      limit,
    });

    return NextResponse.json(queueData);
  } catch (error) {
    console.error("GET /api/provenance/queue error:", error);
    return NextResponse.json(
      { error: "Failed to fetch verification queue", details: error.message },
      { status: 500 }
    );
  }
}
