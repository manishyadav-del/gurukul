import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { calculateBirthChart } from "@/server/astrology/engine";
import { validateBirthDetails, parseTimezoneOffsetMinutes } from "@/server/astrology/validation";
import { WORLD_CITIES } from "@/components/astrology/worldLocations";

/**
 * Resolves latitude, longitude, and timezone offset if missing from input.
 */
function resolveLocationCoordinates(input) {
  let lat = input.latitude !== undefined && input.latitude !== null && input.latitude !== "" ? parseFloat(input.latitude) : null;
  let lon = input.longitude !== undefined && input.longitude !== null && input.longitude !== "" ? parseFloat(input.longitude) : null;
  let tz = input.timezone || null;

  if ((lat === null || isNaN(lat) || lon === null || isNaN(lon)) && input.birthPlace) {
    const cleanPlace = input.birthPlace.toLowerCase().trim();
    const matchedCity = WORLD_CITIES.find((c) =>
      c.name.toLowerCase().includes(cleanPlace) || cleanPlace.includes(c.name.toLowerCase().split(",")[0].trim())
    );
    if (matchedCity) {
      lat = matchedCity.lat;
      lon = matchedCity.lon;
      if (!tz) tz = matchedCity.tzStr || String(matchedCity.tz);
    }
  }

  // Default fallback if still unresolved: New Delhi, India
  if (lat === null || isNaN(lat)) lat = 28.6139;
  if (lon === null || isNaN(lon)) lon = 77.209;
  if (!tz) tz = "Asia/Kolkata";

  return { latitude: lat, longitude: lon, timezone: tz };
}

// GET /api/user/astrology-profile
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    // 1. Check for existing primary BirthProfile for this user
    let profile = await prisma.birthProfile.findFirst({
      where: { userId: authUser.id },
      include: {
        birthChart: {
          include: { planets: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // 2. If no BirthProfile, check if user has basic profile fields on User model
    if (!profile) {
      const userRecord = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: {
          name: true,
          dateOfBirth: true,
          birthTime: true,
          birthPlace: true,
          gender: true,
          timezone: true,
          locale: true,
        },
      });

      const missing = [];
      if (!userRecord?.dateOfBirth) missing.push("dateOfBirth");
      if (!userRecord?.birthTime) missing.push("birthTime");
      if (!userRecord?.birthPlace) missing.push("birthPlace");

      return NextResponse.json({
        success: true,
        isComplete: false,
        profile: null,
        chart: null,
        missingFields: missing,
        prefill: {
          name: userRecord?.name || authUser.name || "",
          birthDate: userRecord?.dateOfBirth ? userRecord.dateOfBirth.toISOString().split("T")[0] : "",
          birthTime: userRecord?.birthTime || "12:00",
          birthPlace: userRecord?.birthPlace || "",
          gender: userRecord?.gender || "",
          timezone: userRecord?.timezone || "Asia/Kolkata",
          language: userRecord?.locale || "en",
        },
      });
    }

    // 3. Verify completeness
    const missing = [];
    if (!profile.birthDate) missing.push("dateOfBirth");
    if (!profile.birthTime) missing.push("birthTime");
    if (!profile.birthPlace) missing.push("birthPlace");

    if (missing.length > 0) {
      return NextResponse.json({
        success: true,
        isComplete: false,
        profile,
        chart: profile.birthChart?.chartData || null,
        missingFields: missing,
      });
    }

    // 4. If chart is not computed yet or lacks full chartData, recalculate
    let chartData = profile.birthChart?.chartData;
    if (!chartData || !chartData.planets || !chartData.dasha) {
      try {
        const fullChart = calculateBirthChart({
          name: profile.name,
          birthDate: profile.birthDate.toISOString().split("T")[0],
          birthTime: profile.birthTime || "12:00",
          birthPlace: profile.birthPlace,
          latitude: profile.latitude,
          longitude: profile.longitude,
          timezone: profile.timezone || "Asia/Kolkata",
          language: profile.language || "en",
          gender: profile.gender,
        });

        chartData = fullChart;

        // Update BirthChart in background/upsert
        if (profile.birthChart) {
          await prisma.birthChart.update({
            where: { id: profile.birthChart.id },
            data: {
              ascendant: fullChart.ascendant.siderealTotalDegree,
              lagnaSign: fullChart.ascendant.sign,
              lagnaDegree: fullChart.ascendant.degree,
              ayanamsaValue: fullChart.calculation.ayanamsaValue,
              moonSign: fullChart.moon.sign,
              moonNakshatra: fullChart.moon.nakshatra,
              moonPada: fullChart.moon.pada,
              currentDasha: fullChart.dasha.currentMahadasha,
              dashaBalance: fullChart.dasha.balanceText,
              chartData: fullChart,
            },
          });
        }
      } catch (calcErr) {
        console.warn("Auto-recalculate chart warning:", calcErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      isComplete: true,
      profile: {
        id: profile.id,
        name: profile.name,
        birthDate: profile.birthDate.toISOString().split("T")[0],
        birthTime: profile.birthTime,
        birthPlace: profile.birthPlace,
        latitude: profile.latitude,
        longitude: profile.longitude,
        timezone: profile.timezone,
        gender: profile.gender,
        language: profile.language,
      },
      chart: chartData,
      missingFields: [],
    });
  } catch (error) {
    console.error("GET /api/user/astrology-profile error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve astrology profile" },
      { status: 500 }
    );
  }
}

// POST /api/user/astrology-profile — Create or update user's primary birth profile and recalculate Kundli
export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const body = await request.json();
    const loc = resolveLocationCoordinates(body);

    const inputData = {
      name: body.name ? body.name.trim() : authUser.name || "Seeker",
      birthDate: body.birthDate,
      birthTime: body.birthTime || "12:00",
      birthPlace: body.birthPlace ? body.birthPlace.trim() : "New Delhi, India",
      latitude: loc.latitude,
      longitude: loc.longitude,
      timezone: loc.timezone,
      gender: body.gender || "unspecified",
      language: body.language || "en",
    };

    // Validate birth details
    const validation = validateBirthDetails(inputData);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Invalid birth details", validationErrors: validation.errors },
        { status: 400 }
      );
    }

    // Deterministically calculate birth chart using existing engine
    const chart = calculateBirthChart(inputData);

    // Find existing profile or create new
    let profile = await prisma.birthProfile.findFirst({
      where: { userId: authUser.id },
      include: { birthChart: true },
      orderBy: { updatedAt: "desc" },
    });

    const birthDateObj = new Date(chart.profile.utcDate);

    if (profile) {
      // Update existing BirthProfile
      profile = await prisma.birthProfile.update({
        where: { id: profile.id },
        data: {
          name: inputData.name,
          birthDate: birthDateObj,
          birthTime: inputData.birthTime,
          birthPlace: inputData.birthPlace,
          latitude: inputData.latitude,
          longitude: inputData.longitude,
          timezone: inputData.timezone,
          language: inputData.language,
          gender: inputData.gender,
        },
      });

      // Update or create BirthChart
      if (profile.birthChartId || (await prisma.birthChart.findUnique({ where: { birthProfileId: profile.id } }))) {
        await prisma.birthChart.update({
          where: { birthProfileId: profile.id },
          data: {
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
            chartData: chart,
          },
        });
      } else {
        await prisma.birthChart.create({
          data: {
            birthProfileId: profile.id,
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
          },
        });
      }
    } else {
      // Create new BirthProfile and BirthChart
      profile = await prisma.birthProfile.create({
        data: {
          userId: authUser.id,
          name: inputData.name,
          birthDate: birthDateObj,
          birthTime: inputData.birthTime,
          birthPlace: inputData.birthPlace,
          latitude: inputData.latitude,
          longitude: inputData.longitude,
          timezone: inputData.timezone,
          language: inputData.language,
          gender: inputData.gender,
          birthChart: {
            create: {
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
            },
          },
        },
      });
    }

    // Sync user model
    await prisma.user.update({
      where: { id: authUser.id },
      data: {
        dateOfBirth: birthDateObj,
        birthTime: inputData.birthTime,
        birthPlace: inputData.birthPlace,
        gender: inputData.gender,
        timezone: inputData.timezone,
      },
    }).catch(() => null);

    return NextResponse.json({
      success: true,
      message: "Astrology profile saved and Kundli calculated successfully.",
      profile: {
        id: profile.id,
        name: inputData.name,
        birthDate: inputData.birthDate,
        birthTime: inputData.birthTime,
        birthPlace: inputData.birthPlace,
        latitude: inputData.latitude,
        longitude: inputData.longitude,
        timezone: inputData.timezone,
        gender: inputData.gender,
        language: inputData.language,
      },
      chart,
    });
  } catch (error) {
    console.error("POST /api/user/astrology-profile error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to save astrology profile" },
      { status: 500 }
    );
  }
}
