import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/server/security/authGuard";

export async function GET(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const preferences = await prisma.userFestivalPreference.findMany({
      where: { userId: user.id },
      include: {
        festival: {
          select: {
            id: true,
            slug: true,
            name: true,
            nameHi: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      preferences,
    });
  } catch (error) {
    console.error("Festival preferences GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const body = await request.json();
    const { festivalSlug, festivalId, isFavorite, isFollowingVrat, logCompletionDate } = body;

    // Resolve festival
    const festival = await prisma.vedicFestival.findFirst({
      where: {
        OR: [
          ...(festivalId ? [{ id: festivalId }] : []),
          ...(festivalSlug ? [{ slug: festivalSlug }] : []),
        ],
      },
    });

    if (!festival) {
      return NextResponse.json(
        { success: false, error: "Festival not found" },
        { status: 404 }
      );
    }

    const existingPref = await prisma.userFestivalPreference.findUnique({
      where: {
        userId_festivalId: {
          userId: user.id,
          festivalId: festival.id,
        },
      },
    });

    let history = Array.isArray(existingPref?.completedHistory)
      ? [...existingPref.completedHistory]
      : [];

    if (logCompletionDate && !history.includes(logCompletionDate)) {
      history.push(logCompletionDate);
    }

    const updated = await prisma.userFestivalPreference.upsert({
      where: {
        userId_festivalId: {
          userId: user.id,
          festivalId: festival.id,
        },
      },
      update: {
        ...(typeof isFavorite === "boolean" ? { isFavorite } : {}),
        ...(typeof isFollowingVrat === "boolean" ? { isFollowingVrat } : {}),
        completedHistory: history,
      },
      create: {
        userId: user.id,
        festivalId: festival.id,
        isFavorite: typeof isFavorite === "boolean" ? isFavorite : true,
        isFollowingVrat: typeof isFollowingVrat === "boolean" ? isFollowingVrat : false,
        completedHistory: history,
      },
      include: {
        festival: {
          select: {
            id: true,
            slug: true,
            name: true,
            nameHi: true,
            category: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      preference: updated,
    });
  } catch (error) {
    console.error("Festival preferences POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update preference" },
      { status: 500 }
    );
  }
}
