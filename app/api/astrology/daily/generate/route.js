/**
 * POST /api/astrology/daily/generate
 *
 * Forces re-generation of the daily astrology report (bypassing or updating cache).
 *
 * Request body:
 * {
 *   date: "YYYY-MM-DD",
 *   lat: number,
 *   lon: number,
 *   tz: number,
 *   timezone: string,
 *   language: "hi" | "en",
 *   profileId?: string
 * }
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { computePanchang } from "@/server/astrology/panchang";
import { computeDailyTransits, computeTransitToNatalAspects, buildTransitsOverview } from "@/server/astrology/transits";
import { generateDailyInterpretation } from "@/server/astrology/dailyAiInterpretation";

const CALCULATION_VERSION = "v1";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const lat = parseFloat(body.lat ?? 0);
    const lon = parseFloat(body.lon ?? 0);
    const tzOffset = parseFloat(body.tz ?? 0);
    const timezone = body.timezone || "UTC";
    const language = body.language === "en" ? "en" : "hi";
    const profileId = body.profileId || null;

    if (isNaN(lat) || isNaN(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return NextResponse.json({ error: "Invalid coordinates provided" }, { status: 400 });
    }

    let reportDate = body.date;
    if (!reportDate || !/^\d{4}-\d{2}-\d{2}$/.test(reportDate)) {
      const nowLocal = new Date(Date.now() + tzOffset * 3600 * 1000);
      reportDate = nowLocal.toISOString().split("T")[0];
    }

    const authUser = await getAuthenticatedUser(request);
    const userId = authUser?.id || null;

    let natalChartData = null;
    let dashaInfo = null;
    let birthChartId = null;
    let isPersonalized = false;

    if (profileId) {
      const profile = await prisma.birthProfile.findUnique({
        where: { id: profileId },
        include: { birthChart: { include: { planets: true } } },
      });

      if (profile) {
        if (profile.userId && (!authUser || (profile.userId !== authUser.id && authUser.role !== "ADMIN"))) {
          return NextResponse.json(
            { error: "Forbidden: Unauthorized access to birth profile" },
            { status: 403 }
          );
        }
        natalChartData = profile.birthChart?.chartData || null;
        birthChartId = profile.birthChart?.id || null;
        if (natalChartData) {
          isPersonalized = true;
          dashaInfo = natalChartData.dasha || null;
        }
      }
    } else if (userId) {
      const latestProfile = await prisma.birthProfile.findFirst({
        where: { userId },
        include: { birthChart: { include: { planets: true } } },
        orderBy: { createdAt: "desc" },
      });
      if (latestProfile?.birthChart?.chartData) {
        natalChartData = latestProfile.birthChart.chartData;
        birthChartId = latestProfile.birthChart.id;
        isPersonalized = true;
        dashaInfo = natalChartData.dasha || null;
      }
    }

    // Deterministic Astronomical calculations
    const panchang = computePanchang({
      date: reportDate,
      latitude: lat,
      longitude: lon,
      tzOffset,
      timezone,
    });
    const transits = computeDailyTransits({ date: reportDate, tzOffset });
    const transitsOverview = buildTransitsOverview(transits);

    const natalAspects = natalChartData
      ? computeTransitToNatalAspects(transits, natalChartData)
      : [];

    // AI Interpretation
    const interpretation = await generateDailyInterpretation({
      panchang,
      transits,
      natalAspects,
      dasha: dashaInfo,
      language,
      isPersonalized,
    });

    const reportContent = {
      ...interpretation,
      transits: transitsOverview,
      natalAspects: natalAspects.slice(0, 20),
    };

    // Upsert into cache
    const cacheKey = {
      userId: userId || "general",
      reportDate,
      latitude: parseFloat(lat.toFixed(4)),
      longitude: parseFloat(lon.toFixed(4)),
      language,
      calculationVersion: CALCULATION_VERSION,
    };

    let reportRecord = null;
    try {
      reportRecord = await prisma.dailyAstrologyReport.upsert({
        where: {
          userId_reportDate_latitude_longitude_language_calculationVersion: cacheKey,
        },
        update: {
          panchangData: panchang,
          reportContent,
          isPersonalized,
          birthChartId: birthChartId || null,
          timezone,
        },
        create: {
          ...cacheKey,
          timezone,
          panchangData: panchang,
          reportContent,
          isPersonalized,
          birthChartId: birthChartId || null,
        },
      });
    } catch (dbErr) {
      console.warn("DailyAstrologyReport upsert failed:", dbErr.message);
    }

    return NextResponse.json({
      success: true,
      reportDate,
      panchang,
      report: reportContent,
      isPersonalized,
      reportId: reportRecord?.id || null,
    });
  } catch (error) {
    console.error("POST /api/astrology/daily/generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate daily report", details: error.message },
      { status: 500 }
    );
  }
}
