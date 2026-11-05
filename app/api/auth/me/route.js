import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";

export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser?.id) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    // Fetch fresh user profile with reading progress and achievements summary
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        locale: true,
        timezone: true,
        level: true,
        totalXp: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
        isPublicLeaderboard: true,
        createdAt: true,
        _count: {
          select: {
            bookmarks: true,
            notes: true,
            quizAttempts: true,
            readingProgress: true,
            userAchievements: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { authenticated: false, error: "User record not found in database" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session profile", details: error.message },
      { status: 500 }
    );
  }
}
