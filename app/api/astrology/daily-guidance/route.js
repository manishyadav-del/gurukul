/**
 * GET /api/astrology/daily-guidance
 * 
 * Returns unified daily astrology, personalized guidance across 6 life spheres,
 * verified Vedic remedies, dedicated 8-category Puja recommendations, Sanskrit
 * Mantra Intelligence with Anvaya, daily Chakra & Kundalini guidance, and
 * guided spiritual practice timer details.
 * 
 * Query parameters:
 *   date      - YYYY-MM-DD (defaults to local date)
 *   lat       - latitude (defaults to 28.6139 for New Delhi)
 *   lon       - longitude (defaults to 77.2090 for New Delhi)
 *   tz        - timezone offset in hours (defaults to 5.5 for IST)
 *   timezone  - IANA timezone string (e.g. "Asia/Kolkata")
 *   language  - "en" or "hi" (defaults to "en")
 *   profileId - optional BirthProfile ID for personalized guidance
 */

import { NextResponse } from "next/server.js";
import prisma from "../../../../lib/prisma.js";
import { getAuthenticatedUser } from "../../../../server/security/authGuard.js";
import { computePanchang } from "../../../../server/astrology/panchang.js";
import { evaluatePredictiveTransits } from "../../../../server/astrology/transitIntelligence.js";
import { getDailySpiritualGuidance } from "../../../../server/astrology/remedyEngine.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Coordinate defaults: New Delhi (28.6139° N, 77.2090° E, IST +5.5)
    const lat = parseFloat(searchParams.get("lat") || "28.6139");
    const lon = parseFloat(searchParams.get("lon") || "77.2090");
    const tzOffset = parseFloat(searchParams.get("tz") || "5.5");
    const timezone = searchParams.get("timezone") || "Asia/Kolkata";
    const language = searchParams.get("language") === "hi" ? "hi" : "en";
    const profileId = searchParams.get("profileId") || null;

    if (isNaN(lat) || isNaN(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return NextResponse.json({ error: "Invalid geographic coordinates" }, { status: 400 });
    }

    // Determine target local date
    const dateParam = searchParams.get("date");
    let reportDate;
    if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      reportDate = dateParam;
    } else {
      const nowLocal = new Date(Date.now() + tzOffset * 3600 * 1000);
      reportDate = nowLocal.toISOString().split("T")[0];
    }

    // Authenticate user if session exists
    const authUser = await getAuthenticatedUser(request);
    const userId = authUser?.id || null;

    let userProfilesList = [];
    if (userId) {
      userProfilesList = await prisma.birthProfile.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          birthDate: true,
          birthPlace: true,
          latitude: true,
          longitude: true,
          timezone: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    // Optional birth profile personalization
    let birthProfile = null;
    if (profileId) {
      const profile = await prisma.birthProfile.findUnique({
        where: { id: profileId },
        include: {
          birthChart: {
            include: { planets: true },
          },
        },
      });

      if (profile) {
        if (profile.userId && (!authUser || (profile.userId !== authUser.id && authUser.role !== "ADMIN"))) {
          return NextResponse.json(
            { error: "Forbidden: Unauthorized access to birth profile" },
            { status: 403 }
          );
        }
        birthProfile = profile;
      }
    } else if (authUser?.id) {
      // If user is logged in, fetch their primary birth profile
      const userProfile = await prisma.birthProfile.findFirst({
        where: { userId: authUser.id },
        include: {
          birthChart: {
            include: { planets: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      if (userProfile) {
        birthProfile = userProfile;
      }
    }

    // 1. Deterministic astronomical Panchang calculation
    const panchang = computePanchang({
      date: reportDate,
      latitude: lat,
      longitude: lon,
      tzOffset,
      timezone,
    });

    // 2. Compute Predictive Gochara Transits if chart is available
    const natalChartData = birthProfile?.birthChart?.chartData || null;
    let planetaryTransits = null;
    if (natalChartData && natalChartData.planets && natalChartData.ascendant) {
      try {
        planetaryTransits = evaluatePredictiveTransits(natalChartData, reportDate, tzOffset, language);
      } catch (tErr) {
        console.warn("[daily-guidance] Transit calculation error:", tErr.message);
      }
    }

    // 3. Verified spiritual remedies, puja, and guidance synthesis
    const guidance = await getDailySpiritualGuidance({
      panchang,
      date: reportDate,
      userId,
      birthProfile,
      chart: natalChartData,
      transits: planetaryTransits,
      language,
    });

    const response = NextResponse.json({
      success: true,
      panchang,
      planetaryTransits,
      guidance,
      chart: natalChartData,
      profile: birthProfile
        ? {
            id: birthProfile.id,
            name: birthProfile.name,
            birthDate: birthProfile.birthDate,
            birthTime: birthProfile.birthTime,
            birthPlace: birthProfile.birthPlace,
            latitude: birthProfile.latitude,
            longitude: birthProfile.longitude,
            timezone: birthProfile.timezone,
          }
        : null,
      userProfiles: userProfilesList,
      meta: {
        date: reportDate,
        latitude: lat,
        longitude: lon,
        timezone,
        language,
        isPersonalized: Boolean(birthProfile),
        profileName: birthProfile?.name || null,
      },
    });

    // Cache responses for 10 minutes (private if authenticated to avoid caching user logs)
    if (userId) {
      response.headers.set("Cache-Control", "private, max-age=60");
    } else {
      response.headers.set("Cache-Control", "public, max-age=600, stale-while-revalidate=1200");
    }

    return response;
  } catch (error) {
    console.error("GET /api/astrology/daily-guidance error:", error);
    return NextResponse.json(
      { error: "Failed to generate daily spiritual guidance", details: error.message },
      { status: 500 }
    );
  }
}
