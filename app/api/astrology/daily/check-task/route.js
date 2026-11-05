/**
 * POST /api/astrology/daily/check-task
 *
 * Evaluates whether a user's planned work/task is favorable according to today's
 * Panchang, Nakshatra characteristics, Tithi, Rahu Kaal, and personal birth chart.
 *
 * Request body:
 * {
 *   task: string,
 *   date?: string,
 *   lat: number,
 *   lon: number,
 *   tz: number,
 *   timezone?: string,
 *   language?: "hi" | "en",
 *   profileId?: string
 * }
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { computePanchang } from "@/server/astrology/panchang";
import { computeDailyTransits } from "@/server/astrology/transits";
import { evaluateTaskWithAI } from "@/server/astrology/taskEvaluator";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const taskText = (body.task || "").trim();

    if (!taskText || taskText.length < 3) {
      return NextResponse.json(
        { error: "Please enter a valid work or task description (at least 3 characters)" },
        { status: 400 }
      );
    }

    if (taskText.length > 500) {
      return NextResponse.json(
        { error: "Task description must be under 500 characters" },
        { status: 400 }
      );
    }

    const lat = parseFloat(body.lat ?? 28.6139);
    const lon = parseFloat(body.lon ?? 77.209);
    const tzOffset = parseFloat(body.tz ?? 5.5);
    const timezone = body.timezone || "Asia/Kolkata";
    const language = body.language === "en" ? "en" : "hi";
    const profileId = body.profileId || null;

    let reportDate = body.date;
    if (!reportDate || !/^\d{4}-\d{2}-\d{2}$/.test(reportDate)) {
      const nowLocal = new Date(Date.now() + tzOffset * 3600 * 1000);
      reportDate = nowLocal.toISOString().split("T")[0];
    }

    // Authenticate (optional)
    const authUser = await getAuthenticatedUser(request);
    const userId = authUser?.id || null;

    let natalChartData = null;
    if (profileId) {
      const profile = await prisma.birthProfile.findUnique({
        where: { id: profileId },
        include: { birthChart: true },
      });
      if (profile) {
        if (profile.userId && (!authUser || (profile.userId !== authUser.id && authUser.role !== "ADMIN"))) {
          return NextResponse.json(
            { error: "Forbidden: Unauthorized access to birth profile" },
            { status: 403 }
          );
        }
        natalChartData = profile.birthChart?.chartData || null;
      }
    } else if (userId) {
      const latestProfile = await prisma.birthProfile.findFirst({
        where: { userId },
        include: { birthChart: true },
        orderBy: { createdAt: "desc" },
      });
      if (latestProfile?.birthChart?.chartData) {
        natalChartData = latestProfile.birthChart.chartData;
      }
    }

    // 1. Compute today's Panchang
    const panchang = computePanchang({
      date: reportDate,
      latitude: lat,
      longitude: lon,
      tzOffset,
      timezone,
    });

    // 2. Compute Transits
    const transits = computeDailyTransits({ date: reportDate, tzOffset });

    // 3. Evaluate task feasibility
    const evaluation = await evaluateTaskWithAI({
      taskText,
      panchang,
      transits,
      natalChart: natalChartData,
      language,
    });

    return NextResponse.json({
      success: true,
      task: taskText,
      date: reportDate,
      panchang: {
        nakshatra: panchang.nakshatra,
        tithi: panchang.tithi,
        vara: panchang.vara,
        moonSign: panchang.moonSign,
        rahuKaal: panchang.rahuKaal,
      },
      evaluation,
    });
  } catch (error) {
    console.error("POST /api/astrology/daily/check-task error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate task feasibility", details: error.message },
      { status: 500 }
    );
  }
}
