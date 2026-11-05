import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";

// GET /api/astrology/charts
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    const userId = authUser?.id || null;
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");

    // If specific profileId requested
    if (profileId) {
      const profile = await prisma.birthProfile.findUnique({
        where: { id: profileId },
        include: {
          birthChart: {
            include: { planets: true },
          },
        },
      });

      if (!profile) {
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      }

      // Security check: Prevent unauthorized access to private birth profile
      if (profile.userId) {
        if (!userId || (profile.userId !== userId && authUser?.role !== "ADMIN")) {
          return NextResponse.json({ error: "Unauthorized access to birth profile" }, { status: 403 });
        }
      }

      return NextResponse.json({ profile, chart: profile.birthChart });
    }

    // Listing profiles requires authentication
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }

    // List profiles strictly for the authenticated user
    const where = { userId };

    const profiles = await prisma.birthProfile.findMany({
      where,
      include: {
        birthChart: {
          select: {
            id: true,
            lagnaSign: true,
            moonSign: true,
            moonNakshatra: true,
            currentDasha: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ profiles });
  } catch (error) {
    console.error("GET /api/astrology/charts error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve charts" },
      { status: 500 }
    );
  }
}
