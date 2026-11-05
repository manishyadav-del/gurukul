import { NextResponse } from "next/server.js";
import prisma from "../../../../lib/prisma.js";
import { getAuthenticatedUser } from "../../../../server/security/authGuard.js";
import { calculateBirthChart } from "../../../../server/astrology/engine.js";

// POST /api/astrology/chart
export async function POST(request) {
  try {
    const body = await request.json();
    const authUser = await getAuthenticatedUser(request);
    const userId = authUser?.id || null;

    // 1. Calculate deterministic chart
    const chart = calculateBirthChart(body);

    let profileRecord = null;
    let chartRecord = null;

    // 2. Persist to database if authenticated or if user exists
    if (userId || body.saveProfile) {
      let targetUserId = userId;

      if (!targetUserId) {
        // If unauthenticated but requested to save, find or create guest user
        let guestUser = await prisma.user.findFirst({
          where: { email: "guest@gurukul.ai" },
        });
        if (!guestUser) {
          guestUser = await prisma.user.create({
            data: {
              email: "guest@gurukul.ai",
              name: "Gurukul Guest",
              role: "USER",
            },
          });
        }
        targetUserId = guestUser.id;
      }

      // Create BirthProfile
      profileRecord = await prisma.birthProfile.create({
        data: {
          userId: targetUserId,
          name: chart.profile.name,
          birthDate: new Date(chart.profile.utcDate),
          birthTime: chart.profile.birthTime,
          birthPlace: chart.profile.birthPlace,
          latitude: chart.profile.latitude,
          longitude: chart.profile.longitude,
          timezone: chart.profile.timezone,
          language: chart.profile.language,
          gender: chart.profile.gender,
        },
      });

      // Create BirthChart
      chartRecord = await prisma.birthChart.create({
        data: {
          birthProfileId: profileRecord.id,
          ascendant: chart.ascendant.siderealTotalDegree,
          lagnaSign: chart.ascendant.sign,
          lagnaDegree: chart.ascendant.degree,
          ayanamsa: chart.calculation.ayanamsa,
          ayanamsaValue: chart.calculation.ayanamsaValue,
          moonSign: chart.moon.sign,
          moonNakshatra: chart.moon.nakshatra,
          moonPada: chart.moon.pada,
          currentDasha: chart.dasha.currentMahadasha,
          dashaBalance: chart.dasha.balanceText,
          calculationEngine: chart.calculation.calculationEngine,
          engineVersion: chart.calculation.engineVersion,
          chartData: chart,
          planets: {
            create: chart.planets.map((p) => ({
              planet: p.planet,
              sign: p.sign,
              house: p.house,
              degree: p.degree,
              speed: p.speed,
              nakshatra: p.nakshatra,
              pada: p.pada,
              retrograde: p.retrograde,
              signLord: p.signLord,
              nakshatraLord: p.nakshatraLord,
            })),
          },
        },
        include: {
          planets: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      chart,
      profileId: profileRecord?.id || null,
      chartId: chartRecord?.id || null,
    });
  } catch (error) {
    console.error("POST /api/astrology/chart error:", error);
    const status = error.statusCode || (error.validationErrors ? 400 : 500);
    return NextResponse.json(
      {
        error: error.message || "Failed to calculate birth chart",
        details: error.validationErrors || null,
      },
      { status }
    );
  }
}
