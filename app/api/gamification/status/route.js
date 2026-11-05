import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { getGamificationStatus } from "@/server/gamification/engine";

// GET /api/gamification/status
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }

    const status = await getGamificationStatus(authUser.id);
    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("GET /api/gamification/status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gamification status", details: error.message },
      { status: 500 }
    );
  }
}
