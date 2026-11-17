import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { getIntelligentBookRecommendations } from "@/server/learning/recommendationEngine";
import { applyRateLimit, RATE_LIMIT_TIERS } from "@/server/security/rateLimiter";
import { apiError } from "@/server/security/apiResponse";

// GET /api/books/recommendations?limit=6
export async function GET(request) {
  try {
    const rateLimitResponse = applyRateLimit(request, RATE_LIMIT_TIERS.GENERAL);
    if (rateLimitResponse) return rateLimitResponse;

    const user = await getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "6", 10), 1), 20);

    const recommendations = await getIntelligentBookRecommendations({
      userId: user?.id || null,
      limit,
    });

    return NextResponse.json({
      success: true,
      ...recommendations,
    });
  } catch (error) {
    return apiError(error, 500, "BOOK_RECOMMENDATIONS_FAILED", request);
  }
}
