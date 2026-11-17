import { NextResponse } from "next/server.js";
import { getVerificationStatistics } from "@/server/provenance/provenanceService.js";
import { requireReviewPermission } from "@/server/security/authGuard.js";

/**
 * GET /api/provenance/statistics
 * Returns system-wide statistics for the Scholarly Review Studio.
 */
export async function GET(request) {
  try {
    const auth = await requireReviewPermission(request);
    if (auth.errorResponse) return auth.errorResponse;

    const stats = await getVerificationStatistics();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("GET /api/provenance/statistics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch verification statistics", details: error.message },
      { status: 500 }
    );
  }
}
