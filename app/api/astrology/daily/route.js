/**
 * GET /api/astrology/daily
 *
 * Returns cached or freshly computed daily astrology report.
 * Includes Panchang, transits, and AI interpretation.
 *
 * Query parameters:
 *   date        - YYYY-MM-DD (defaults to today in specified timezone)
 *   lat         - latitude (required)
 *   lon         - longitude (required)
 *   tz          - timezone offset in hours (e.g. 5.5 for IST, defaults to 0)
 *   timezone    - IANA timezone string for display (e.g. Asia/Kolkata)
 *   language    - "hi" or "en" (defaults to "hi")
 *   profileId   - birth profile ID for personalized report (optional)
 */

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { computePanchang } from "@/server/astrology/panchang";
import { computeDailyTransits, computeTransitToNatalAspects, buildTransitsOverview } from "@/server/astrology/transits";
import { generateDailyInterpretation } from "@/server/astrology/dailyAiInterpretation";

const CALCULATION_VERSION = "v1";

// Simple in-memory rate limiter (per IP, per minute)
const requestMap = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const entry = requestMap.get(ip) || { count: 0, resetAt: now + 60_000 };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + 60_000;
  }
  entry.count++;
  requestMap.set(ip, entry);
  return entry.count > 30; // 30 requests per minute per IP
}

export async function GET(request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const lat       = parseFloat(searchParams.get("lat") || "0");
    const lon       = parseFloat(searchParams.get("lon") || "0");
    const tzOffset  = parseFloat(searchParams.get("tz")  || "0");
    const timezone  = searchParams.get("timezone") || "UTC";
    const language  = searchParams.get("language") === "en" ? "en" : "hi";
    const profileId = searchParams.get("profileId") || null;

    if (isNaN(lat) || isNaN(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return NextResponse.json({ error: "Invalid lat/lon parameters" }, { status: 400 });
    }

    // Determine date in local timezone
    const dateParam = searchParams.get("date");
    let reportDate;
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      reportDate = dateParam;
    } else {
      // Compute today's date in the specified timezone offset
      const nowLocal = new Date(Date.now() + tzOffset * 3600 * 1000);
      reportDate = nowLocal.toISOString().split("T")[0];
    }

    // Authenticate (optional — personalization requires auth)
    const authUser = await getAuthenticatedUser(request);
    const userId = authUser?.id || null;

    // Resolve birth chart for personalization
    let natalChartData = null;
    let dashaInfo = null;
    let birthChartId = null;
    let isPersonalized = false;

    if (profileId) {
      const profile = await prisma.birthProfile.findUnique({
        where: { id: profileId },
        include: { birthChart: { include: { planets: true } } },
      });

      // Security: only allow access if the profile belongs to the authenticated user
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
      // Auto-load the user's most recent birth chart
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

    // Check for a cached report (unique per user+date+location+language+version)
    const effectiveUserId = userId || "general";
    const cacheKey = {
      userId: effectiveUserId,
      reportDate,
      latitude: parseFloat(lat.toFixed(4)),
      longitude: parseFloat(lon.toFixed(4)),
      language,
      calculationVersion: CALCULATION_VERSION,
    };

    const cached = await prisma.dailyAstrologyReport.findFirst({
      where: cacheKey,
    }).catch(() => null);

    if (cached) {
      return NextResponse.json({
        success: true,
        cached: true,
        reportDate,
        panchang: cached.panchangData,
        report: cached.reportContent,
        isPersonalized: cached.isPersonalized,
      });
    }

    // --- Compute fresh data ---
    const panchang = computePanchang({ date: reportDate, latitude: lat, longitude: lon, tzOffset, timezone });
    const transits = computeDailyTransits({ date: reportDate, tzOffset });
    const transitsOverview = buildTransitsOverview(transits);

    // Transit-to-natal aspects (only if natal chart available)
    const natalAspects = natalChartData
      ? computeTransitToNatalAspects(transits, natalChartData)
      : [];

    // Generate AI interpretation
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
      natalAspects: natalAspects.slice(0, 20), // limit stored aspects
    };

    // Cache the report (upsert to handle race conditions)
    await prisma.dailyAstrologyReport.upsert({
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
    }).catch((err) => {
      // Non-fatal: if caching fails, still return the computed result
      console.warn("DailyAstrologyReport cache write failed:", err.message);
    });

    return NextResponse.json({
      success: true,
      cached: false,
      reportDate,
      panchang,
      report: reportContent,
      isPersonalized,
    });
  } catch (error) {
    console.error("GET /api/astrology/daily error:", error);
    return NextResponse.json(
      { error: "Failed to generate daily astrology report", details: error.message },
      { status: 500 }
    );
  }
}
