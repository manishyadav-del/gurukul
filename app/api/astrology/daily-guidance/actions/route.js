/**
 * POST /api/astrology/daily-guidance/actions
 * 
 * Handles user completion and bookmarking of daily spiritual practices.
 * Strictly requires authentication.
 */

import { NextResponse } from "next/server.js";
import prisma from "../../../../../lib/prisma.js";
import { requireAuth } from "../../../../../server/security/authGuard.js";

export async function POST(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const body = await request.json();
    const { remedyId, practiceDate, action, notes } = body;

    if (!remedyId || !practiceDate || !action) {
      return NextResponse.json(
        { error: "remedyId, practiceDate, and action are required" },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(practiceDate)) {
      return NextResponse.json({ error: "Invalid practiceDate format (YYYY-MM-DD)" }, { status: 400 });
    }

    // Check if remedy exists
    const remedy = await prisma.dailyRemedy.findUnique({
      where: { id: remedyId },
      select: { id: true, title: true },
    });

    if (!remedy) {
      return NextResponse.json({ error: "Remedy not found" }, { status: 404 });
    }

    let updateData = {};
    if (action === "complete") {
      updateData = { completed: true, completedAt: new Date() };
    } else if (action === "uncomplete") {
      updateData = { completed: false, completedAt: null };
    } else if (action === "bookmark") {
      updateData = { bookmarked: true };
    } else if (action === "unbookmark") {
      updateData = { bookmarked: false };
    } else if (action === "note") {
      updateData = { notes: notes || "" };
    } else {
      return NextResponse.json({ error: `Invalid action '${action}'` }, { status: 400 });
    }

    const log = await prisma.userPracticeLog.upsert({
      where: {
        userId_remedyId_practiceDate: {
          userId: user.id,
          remedyId,
          practiceDate,
        },
      },
      update: updateData,
      create: {
        userId: user.id,
        remedyId,
        practiceDate,
        completed: action === "complete",
        completedAt: action === "complete" ? new Date() : null,
        bookmarked: action === "bookmark",
        notes: notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      action,
      log,
      message: `Practice '${remedy.title}' successfully updated.`,
    });
  } catch (error) {
    console.error("POST /api/astrology/daily-guidance/actions error:", error);
    return NextResponse.json(
      { error: "Failed to update practice log", details: error.message },
      { status: 500 }
    );
  }
}
