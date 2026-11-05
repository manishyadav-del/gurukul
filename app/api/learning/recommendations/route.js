import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { getExplainableRecommendations } from "@/server/learning/recommendationEngine";

// GET /api/learning/recommendations?category=ALL|VEDIC_ASTROLOGY|KUNDALINI_SPIRITUALITY|DIGITAL_LIBRARY&limit=12
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "ALL";
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    const recommendations = await getExplainableRecommendations({
      userId: authUser?.id || null,
      categoryFilter: category,
      limit: Math.min(30, Math.max(1, limit)),
    });

    return NextResponse.json({
      success: true,
      category,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error("GET /api/learning/recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning recommendations", details: error.message },
      { status: 500 }
    );
  }
}
