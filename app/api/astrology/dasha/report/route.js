import { NextResponse } from "next/server.js";
import prisma from "@/lib/prisma.js";
import { getAuthenticatedUser } from "@/server/security/authGuard.js";
import { calculateBirthChart } from "@/server/astrology/engine.js";
import { generateDashaInterpretationReport } from "@/server/astrology/dashaInterpretation.js";

/**
 * POST /api/astrology/dasha/report
 *
 * Generates an 11-section calculation-backed Mahadasha, Antardasha, and
 * Pratyantardasha interpretation and Vedic guidance report.
 */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const authUser = await getAuthenticatedUser(request);
    const userId = authUser?.id || null;

    const language = body.language || "en";
    const targetDate = body.targetDate ? new Date(body.targetDate) : new Date();

    let chart = body.chart || null;

    // If chart not provided directly, check profileId or birth details
    if (!chart) {
      if (body.profileId) {
        const profile = await prisma.birthProfile.findUnique({
          where: { id: body.profileId },
          include: { charts: { take: 1, orderBy: { createdAt: "desc" } } },
        });

        if (profile?.charts?.[0]?.chartData) {
          chart = profile.charts[0].chartData;
        } else if (profile) {
          chart = calculateBirthChart({
            name: profile.name,
            birthDate: profile.birthDate.toISOString().split("T")[0],
            birthTime: profile.birthTime,
            birthPlace: profile.birthPlace,
            latitude: profile.latitude,
            longitude: profile.longitude,
            timezone: profile.timezone,
            language: profile.language || language,
          });
        }
      } else if (body.birthDate && body.latitude !== undefined && body.longitude !== undefined) {
        chart = calculateBirthChart({
          name: body.name || "Seeker",
          birthDate: body.birthDate,
          birthTime: body.birthTime || "12:00",
          birthPlace: body.birthPlace || "Custom Location",
          latitude: Number(body.latitude),
          longitude: Number(body.longitude),
          timezone: body.timezone || "Asia/Kolkata",
          language,
        });
      }
    }

    // Fallback: If user is authenticated and has a primary profile, load it
    if (!chart && userId) {
      const primaryProfile = await prisma.birthProfile.findFirst({
        where: { userId },
        include: { charts: { take: 1, orderBy: { createdAt: "desc" } } },
      });
      if (primaryProfile?.charts?.[0]?.chartData) {
        chart = primaryProfile.charts[0].chartData;
      }
    }

    if (!chart) {
      return NextResponse.json(
        {
          error:
            "Missing birth chart data. Provide 'chart' object, 'profileId', or birth coordinates (birthDate, latitude, longitude).",
        },
        { status: 400 }
      );
    }

    // Generate comprehensive 11-section Dasha interpretation
    const report = generateDashaInterpretationReport({
      chart,
      targetDate,
      language,
    });

    return NextResponse.json({
      success: true,
      report,
      dashaSummary: report.activeDashaSummary,
    });
  } catch (error) {
    console.error("POST /api/astrology/dasha/report error:", error);
    const status = error.statusCode || 500;
    return NextResponse.json(
      {
        error: error.message || "Failed to generate Dasha interpretation report",
        details: error.validationErrors || null,
      },
      { status }
    );
  }
}

/**
 * GET /api/astrology/dasha/report
 *
 * Query parameters:
 * ?profileId=<id>&language=en|hi&targetDate=YYYY-MM-DD
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("profileId");
    const language = searchParams.get("language") || "en";
    const targetDateStr = searchParams.get("targetDate");
    const targetDate = targetDateStr ? new Date(targetDateStr) : new Date();

    const authUser = await getAuthenticatedUser(request);
    const userId = authUser?.id || null;

    let chart = null;

    if (profileId) {
      const profile = await prisma.birthProfile.findUnique({
        where: { id: profileId },
        include: { charts: { take: 1, orderBy: { createdAt: "desc" } } },
      });
      if (profile?.charts?.[0]?.chartData) {
        chart = profile.charts[0].chartData;
      }
    } else if (userId) {
      const profile = await prisma.birthProfile.findFirst({
        where: { userId },
        include: { charts: { take: 1, orderBy: { createdAt: "desc" } } },
      });
      if (profile?.charts?.[0]?.chartData) {
        chart = profile.charts[0].chartData;
      }
    }

    if (!chart) {
      return NextResponse.json(
        { error: "No birth chart found. Please specify profileId or calculate a chart first." },
        { status: 404 }
      );
    }

    const report = generateDashaInterpretationReport({
      chart,
      targetDate,
      language,
    });

    return NextResponse.json({
      success: true,
      report,
      dashaSummary: report.activeDashaSummary,
    });
  } catch (error) {
    console.error("GET /api/astrology/dasha/report error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch Dasha interpretation report" },
      { status: 500 }
    );
  }
}
