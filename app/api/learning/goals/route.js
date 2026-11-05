import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import {
  getUserDailyGoalsSummary,
  updateUserDailyTargets,
} from "@/server/learning/dailyGoals";

// GET /api/learning/goals
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    const summary = await getUserDailyGoalsSummary(authUser?.id || null);

    return NextResponse.json({
      success: true,
      ...summary,
    });
  } catch (error) {
    console.error("GET /api/learning/goals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch daily goals", details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/learning/goals - Update target topics and pages
export async function PUT(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { targetTopics, targetPages } = body;

    const result = await updateUserDailyTargets({
      userId: authUser.id,
      targetTopics,
      targetPages,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("PUT /api/learning/goals error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update daily targets" },
      { status: 500 }
    );
  }
}
