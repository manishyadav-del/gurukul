import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { getUserReadingAnalytics } from "@/server/learning/readingAnalytics";

// GET /api/user/reading-analytics
export async function GET(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to view reading analytics." },
        { status: 401 }
      );
    }

    const analytics = await getUserReadingAnalytics(user.id);
    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (err) {
    console.error("GET /api/user/reading-analytics error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to retrieve reading analytics." },
      { status: 500 }
    );
  }
}
