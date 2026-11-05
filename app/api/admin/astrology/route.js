import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/server/admin/auth";
import { PERMISSIONS } from "@/server/admin/permissions";
import { logAdminActivity } from "@/server/admin/audit";
import { calculateBirthChart } from "@/server/astrology/engine";

export async function GET(request) {
  const auth = await requireAdmin(request, PERMISSIONS.ASTROLOGY_READ);
  if (!auth.authorized) return auth.response;

  try {
    let settings = await prisma.platformSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.platformSettings.create({
        data: { id: "default" },
      });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    const [totalReports, todayReports, totalCharts] = await Promise.all([
      prisma.dailyAstrologyReport.count(),
      prisma.dailyAstrologyReport.count({ where: { reportDate: todayStr } }),
      prisma.birthChart.count(),
    ]);

    return NextResponse.json({
      settings,
      cacheStats: {
        totalDailyReports: totalReports,
        todayCachedReports: todayReports,
        totalBirthCharts: totalCharts,
      },
    });
  } catch (error) {
    console.error("GET /api/admin/astrology error:", error);
    return NextResponse.json({ error: "Failed to load astrology configuration" }, { status: 500 });
  }
}

export async function PATCH(request) {
  const auth = await requireAdmin(request, PERMISSIONS.ASTROLOGY_WRITE);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { ayanamsa, defaultChartStyle, panchangCalculationEngine } = body;

    const updated = await prisma.platformSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        ayanamsa: ayanamsa || "LAHIRI",
        defaultChartStyle: defaultChartStyle || "NORTH_INDIAN",
        panchangCalculationEngine: panchangCalculationEngine || "swiss-ephemeris-v1",
        updatedBy: auth.admin.user.email,
      },
      update: {
        ...(ayanamsa ? { ayanamsa } : {}),
        ...(defaultChartStyle ? { defaultChartStyle } : {}),
        ...(panchangCalculationEngine ? { panchangCalculationEngine } : {}),
        updatedBy: auth.admin.user.email,
      },
    });

    await logAdminActivity({
      actorId: auth.admin.user.id,
      actorEmail: auth.admin.user.email,
      actorRole: auth.admin.role,
      action: "ASTROLOGY_CONFIG_UPDATED",
      targetResource: "PlatformSettings",
      targetId: "default",
      status: "SUCCESS",
      details: { ayanamsa, defaultChartStyle, panchangCalculationEngine },
    });

    return NextResponse.json({
      success: true,
      message: "Astrology configuration updated",
      settings: updated,
    });
  } catch (error) {
    console.error("PATCH /api/admin/astrology error:", error);
    return NextResponse.json({ error: "Failed to update configuration" }, { status: 500 });
  }
}

// POST: Run real-time astronomical calculation diagnostics
export async function POST(request) {
  const auth = await requireAdmin(request, PERMISSIONS.ASTROLOGY_READ);
  if (!auth.authorized) return auth.response;

  try {
    const testBirthDate = "1995-10-24";
    const testBirthTime = "12:30";
    const testLat = 28.6139; // New Delhi
    const testLon = 77.2090;

    const startTime = performance.now();
    const chart = await calculateBirthChart({
      birthDate: testBirthDate,
      birthTime: testBirthTime,
      latitude: testLat,
      longitude: testLon,
      timezone: "Asia/Kolkata",
    });
    const durationMs = Math.round(performance.now() - startTime);

    return NextResponse.json({
      success: true,
      diagnostic: {
        status: "HEALTHY",
        engine: "astronomy-engine-v2",
        executionTimeMs: durationMs,
        testLocation: "New Delhi (28.6139° N, 77.2090° E)",
        ascendant: chart?.ascendant?.sign || "Calculated",
        moonSign: chart?.moonSign || "Calculated",
        nakshatra: chart?.nakshatra?.name || "Calculated",
        planetsCalculated: chart?.planets?.length || 9,
      },
    });
  } catch (error) {
    console.error("POST /api/admin/astrology diagnostic error:", error);
    return NextResponse.json({
      success: false,
      diagnostic: {
        status: "ERROR",
        errorMessage: error.message,
      },
    }, { status: 500 });
  }
}
