import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { getUserDailyGoalsSummary } from "@/server/learning/dailyGoals";
import { recordDailyActivity } from "@/server/gamification/engine";

// GET /api/learning/streak
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({
        currentStreak: 0,
        longestStreak: 0,
        activeToday: false,
        timezone: "Asia/Kolkata",
        weeklyDays: [],
      });
    }

    const summary = await getUserDailyGoalsSummary(authUser.id);

    return NextResponse.json({
      success: true,
      timezone: summary.timezone,
      streak: summary.streak,
      today: summary.today,
      weeklyProgress: summary.weeklyProgress,
    });
  } catch (error) {
    console.error("GET /api/learning/streak error:", error);
    return NextResponse.json(
      { error: "Failed to fetch streak data", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/learning/streak - Record daily activity trigger
export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await recordDailyActivity({
      userId: authUser.id,
      userTimezone: authUser.timezone || "Asia/Kolkata",
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("POST /api/learning/streak error:", error);
    return NextResponse.json(
      { error: "Failed to update daily streak", details: error.message },
      { status: 500 }
    );
  }
}
