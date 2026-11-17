/**
 * API Route: /api/astrology/daily-practice
 *
 * GET: Retrieves the user's daily practice plan, completion metrics, and weekly history
 * POST: Adds a custom practice item to the daily plan
 * PATCH: Toggles an item as completed/uncompleted, awarding XP and logging streak
 * DELETE: Deletes a practice item from the plan
 * PUT: Updates user practice preferences (categories, target duration, reminders)
 */

import { NextResponse } from "next/server.js";
import { getAuthenticatedUser } from "../../../../server/security/authGuard.js";
import { computePanchang } from "../../../../server/astrology/panchang.js";
import {
  getOrCreateDailyPracticePlan,
  toggleDailyPracticeItem,
  addCustomPracticeItem,
  deletePracticeItem,
} from "../../../../server/astrology/dailyPracticePlanner.js";
import prisma from "../../../../lib/prisma.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const lat = parseFloat(searchParams.get("lat") || "28.6139");
    const lon = parseFloat(searchParams.get("lon") || "77.2090");
    const tzOffset = parseFloat(searchParams.get("tz") || "5.5");
    const language = searchParams.get("language") === "hi" ? "hi" : "en";
    const profileId = searchParams.get("profileId") || null;

    const reportDate =
      dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
        ? dateParam
        : new Date(Date.now() + tzOffset * 3600 * 1000).toISOString().split("T")[0];

    const user = await getAuthenticatedUser(request);
    const userId = user?.id || null;

    // Optional birth profile for personalization
    let birthProfile = null;
    let natalChart = null;
    if (userId) {
      if (profileId) {
        birthProfile = await prisma.birthProfile.findFirst({
          where: { id: profileId, userId },
          include: { birthChart: true },
        });
      }
      if (!birthProfile) {
        birthProfile = await prisma.birthProfile.findFirst({
          where: { userId },
          include: { birthChart: true },
          orderBy: { createdAt: "desc" },
        });
      }
      natalChart = birthProfile?.birthChart?.chartData || null;
    }

    const panchang = computePanchang({
      date: reportDate,
      latitude: lat,
      longitude: lon,
      tzOffset,
    });

    const result = await getOrCreateDailyPracticePlan({
      userId,
      date: reportDate,
      panchang,
      chart: natalChart,
      birthProfile,
      language,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/astrology/daily-practice error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve daily practice plan", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to record practice completions" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { itemId, completed, notes } = body;

    if (!itemId || typeof completed !== "boolean") {
      return NextResponse.json(
        { error: "itemId and boolean completed status are required" },
        { status: 400 }
      );
    }

    const result = await toggleDailyPracticeItem({
      userId: user.id,
      itemId,
      completed,
      notes,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("PATCH /api/astrology/daily-practice error:", error);
    return NextResponse.json(
      { error: "Failed to update practice item", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to add custom practice items" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      planDate,
      category = "PRACTICE",
      title,
      description,
      durationMinutes = 10,
      sanskritText,
      bookSlug,
      pageNumber,
    } = body;

    if (!planDate || !title) {
      return NextResponse.json(
        { error: "planDate and title are required" },
        { status: 400 }
      );
    }

    const result = await addCustomPracticeItem({
      userId: user.id,
      planDate,
      category,
      title,
      description,
      durationMinutes,
      sanskritText,
      bookSlug,
      pageNumber,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("POST /api/astrology/daily-practice error:", error);
    return NextResponse.json(
      { error: "Failed to add practice item", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to delete practice items" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json({ error: "itemId is required" }, { status: 400 });
    }

    const result = await deletePracticeItem({
      userId: user.id,
      itemId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("DELETE /api/astrology/daily-practice error:", error);
    return NextResponse.json(
      { error: "Failed to delete practice item", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Please log in to update preferences" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { preferredCategories, dailyTargetMinutes, preferredLanguage, remindersEnabled, preferredTime } = body;

    const updated = await prisma.userPracticePreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        preferredCategories: preferredCategories || ["MANTRA", "MEDITATION", "READING", "PRANAYAMA"],
        dailyTargetMinutes: parseInt(dailyTargetMinutes, 10) || 30,
        preferredLanguage: preferredLanguage || "en",
        remindersEnabled: Boolean(remindersEnabled),
        preferredTime: preferredTime || "06:00",
      },
      update: {
        preferredCategories: preferredCategories !== undefined ? preferredCategories : undefined,
        dailyTargetMinutes: dailyTargetMinutes !== undefined ? parseInt(dailyTargetMinutes, 10) : undefined,
        preferredLanguage: preferredLanguage !== undefined ? preferredLanguage : undefined,
        remindersEnabled: remindersEnabled !== undefined ? Boolean(remindersEnabled) : undefined,
        preferredTime: preferredTime !== undefined ? preferredTime : undefined,
      },
    });

    return NextResponse.json({ success: true, preferences: updated });
  } catch (error) {
    console.error("PUT /api/astrology/daily-practice error:", error);
    return NextResponse.json(
      { error: "Failed to update practice preferences", details: error.message },
      { status: 500 }
    );
  }
}
