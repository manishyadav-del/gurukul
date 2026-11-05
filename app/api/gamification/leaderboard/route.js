import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { getLeaderboard, toggleLeaderboardPrivacy } from "@/server/gamification/engine";
import prisma from "@/lib/prisma";

// GET /api/gamification/leaderboard?type=all-time&page=1&limit=20
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") === "weekly" ? "weekly" : "all-time";
    const page = parseInt(searchParams.get("page"), 10) || 1;
    const limit = parseInt(searchParams.get("limit"), 10) || 20;

    const authUser = await getAuthenticatedUser(request);
    const currentUserId = authUser?.id || null;

    const leaderboardData = await getLeaderboard({
      type,
      page,
      limit,
      currentUserId,
    });

    return NextResponse.json({ success: true, ...leaderboardData });
  } catch (error) {
    console.error("GET /api/gamification/leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/gamification/leaderboard
// Body: { isPublicLeaderboard: boolean }
export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = authUser.id;

    const body = await request.json();
    if (typeof body.isPublicLeaderboard !== "boolean") {
      return NextResponse.json(
        { error: "isPublicLeaderboard must be a boolean" },
        { status: 400 }
      );
    }

    const updated = await toggleLeaderboardPrivacy({
      userId,
      isPublicLeaderboard: body.isPublicLeaderboard,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("POST /api/gamification/leaderboard error:", error);
    return NextResponse.json(
      { error: "Failed to update leaderboard privacy", details: error.message },
      { status: 500 }
    );
  }
}
