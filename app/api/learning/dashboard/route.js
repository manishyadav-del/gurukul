import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { getLearningDashboardData } from "@/server/learning/dashboard";

// GET /api/learning/dashboard
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }

    const data = await getLearningDashboardData(authUser.id);
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/learning/dashboard error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch dashboard learning data" },
      { status: 500 }
    );
  }
}
