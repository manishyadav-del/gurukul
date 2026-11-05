import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { calculateBirthChart } from "@/server/astrology/engine";
import { evaluatePredictiveTransits } from "@/server/astrology/transitIntelligence";
import { computePanchang } from "@/server/astrology/panchang";
import { SANSKRIT_SHLOKAS } from "@/server/spirituality/sanskritShlokas";
import { getExplainableRecommendations } from "@/server/learning/recommendationEngine";

/**
 * Calculates upcoming reliably predictable events based on the user's birth chart.
 */
function computeUpcomingEvents(chart, todayDateStr) {
  const events = [];
  const today = new Date(todayDateStr || new Date());

  // 1. Dasha Transitions from timeline
  if (chart?.dasha?.timeline && Array.isArray(chart.dasha.timeline)) {
    for (const maha of chart.dasha.timeline) {
      const antars = maha.antardashas || maha.subPeriods || [];
      if (Array.isArray(antars)) {
        for (const antar of antars) {
          if (!antar.endDate) continue;
          const endDate = new Date(antar.endDate);
          if (endDate > today) {
            const diffDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
            if (diffDays <= 365) {
              const lordName = antar.lord || antar.planet || "Graha";
              events.push({
                type: "DASHA_TRANSITION",
                category: "Dasha",
                title: `${lordName} Antardasha Conclusion`,
                date: antar.endDate,
                daysRemaining: diffDays,
                description: `Transition from ${lordName} Antardasha in ${maha.lord} Mahadasha to next sub-period.`,
                impact: "Internal psychological shift and change in life-focus themes.",
                auspiciousness: "Neutral",
              });
            }
          }
        }
      }
    }
  }

  // 2. Slow-Moving Planetary Transits (Jupiter, Saturn, Rahu/Ketu)
  const moonSign = chart?.moon?.sign || "Aries";
  events.push({
    type: "TRANSIT_CYCLE",
    category: "Gochara",
    title: "Brihaspati (Jupiter) Annual Progression",
    date: "Current Cycle Active",
    description: `Jupiter blesses houses 5, 7, and 9 with its benefic trinal drishti from current transit position relative to your Janma Rashi (${moonSign}).`,
    impact: "Spiritual discernment, expansion of wisdom, and auspicious guidance.",
    auspiciousness: "Good",
  });

  events.push({
    type: "TRANSIT_CYCLE",
    category: "Gochara",
    title: "Shani (Saturn) Karmic Cycle",
    date: "Current Cycle Active",
    description: `Saturn governs structural discipline, patience, and karmic maturation relative to your natal Lagna and Moon.`,
    impact: "Grounding, systematic effort, and endurance in long-term goals.",
    auspiciousness: "Neutral",
  });

  // Sort events by days remaining
  events.sort((a, b) => (a.daysRemaining || 999) - (b.daysRemaining || 999));
  return events.slice(0, 5);
}

/**
 * Selects a contextually relevant, authentic Sanskrit shloka from verified repository.
 */
function selectDailyWisdom(chart) {
  if (!SANSKRIT_SHLOKAS || SANSKRIT_SHLOKAS.length === 0) {
    return null;
  }

  // Prefer shloka matching current Mahadasha or general Vedic wisdom
  const activeMaha = chart?.dasha?.currentMahadasha?.toUpperCase() || "";
  let matched = SANSKRIT_SHLOKAS.find((s) =>
    s.subject?.toUpperCase().includes(activeMaha) ||
    s.keywords?.some((k) => k.toUpperCase().includes(activeMaha))
  );

  // Fallback to day-of-year index or first shloka
  if (!matched) {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    matched = SANSKRIT_SHLOKAS[dayOfYear % SANSKRIT_SHLOKAS.length];
  }

  return matched;
}

/**
 * Synthesizes personalized daily guidance combining astronomical calculations
 * with classical scripture references (*Brihat Parashara*, *Phaladeepika*).
 */
function buildPersonalizedGuidance(chart, transits, panchang, language = "en") {
  const isHi = language === "hi" || language === "hindi";
  const moonSign = chart?.moon?.sign || "Aries";
  const mahaLord = chart?.dasha?.currentMahadasha || "Sun";
  const antarLord = chart?.dasha?.currentAntardasha || "Moon";

  // Check transit of Mahadasha lord
  const mahaTransit = transits?.transitDetails?.find(
    (t) => (t.planet || t.name)?.toUpperCase() === mahaLord.toUpperCase()
  );

  const guidanceItems = [];

  // Item 1: Dasha Ruler Influence
  if (mahaTransit) {
    const houseFromMoon = mahaTransit.houseFromMoon;
    const isAuspicious = mahaTransit.isGocharaAuspicious && !mahaTransit.hasVedha;

    guidanceItems.push({
      category: isHi ? "दशा प्रभाव" : "Active Dasha Influence",
      headline: `${mahaLord} Mahadasha & ${antarLord} Antardasha`,
      analysis: isHi
        ? `आपकी वर्तमान महादशा स्वामी ${mahaLord} आपकी जन्म राशि (${moonSign}) से ${houseFromMoon}वें भाव में गोचर कर रहे हैं। ${
            isAuspicious
              ? "यह गोचर फलदायी और सकारात्मक ऊर्जा प्रदान कर रहा है।"
              : "यह गोचर धैर्य और संतुलित निर्णय लेने की प्रेरणा देता है।"
          }`
        : `Your active Mahadasha lord ${mahaLord} currently transits the ${houseFromMoon}th house from your Janma Rashi (${moonSign}). ${
            isAuspicious
              ? "This transit confers favorable vitality and mental clarity."
              : "This transit counsels thoughtful reflection, measured speech, and deliberate action."
          }`,
      classicalReference: "Brihat Parashara Hora Shastra (BPHS), Dasha Phala Adhyaya",
      type: "CALCULATED",
    });
  }

  // Item 2: Daily Panchang Energy
  if (panchang) {
    const varaName = isHi ? panchang.vara?.hi : panchang.vara?.en;
    guidanceItems.push({
      category: isHi ? "दैनिक पंचांग मार्गदर्शन" : "Daily Panchang Energy",
      headline: `${panchang.tithi?.name || "Tithi"} & ${panchang.nakshatra?.name || "Nakshatra"}`,
      analysis: isHi
        ? `आज ${varaName || "दिन"} को ${panchang.tithi?.name || ""} तिथि और ${
            panchang.nakshatra?.name || ""
          } नक्षत्र का प्रभाव है। सूर्योदय ${panchang.sunrise?.local || "06:00"} एवं सूर्यास्त ${panchang.sunset?.local || "18:00"} के मध्य काल का सदुपयोग करें।`
        : `Today's cosmic flow is governed by ${panchang.tithi?.name || "Tithi"} and ${
            panchang.nakshatra?.name || "Nakshatra"
          } under ${varaName || "day"}. Sunrise at ${panchang.sunrise?.local || "06:00"} and Sunset at ${panchang.sunset?.local || "18:00"} mark the diurnal rhythm for spiritual alignment.`,
      classicalReference: "Muhurta Chintamani / Surya Siddhanta",
      type: "CALCULATED",
    });
  }

  // Item 3: Sade Sati & Saturn Awareness
  if (transits?.shaniGochara) {
    const shani = transits.shaniGochara;
    const isSadeSati = shani.shaniType?.includes("SADE_SATI");
    guidanceItems.push({
      category: isHi ? "शनि गोचर स्थिति" : "Saturn Transit Awareness",
      headline: isSadeSati ? "Saturn Sade Sati Period" : `Saturn in House ${shani.houseFromMoon} from Moon`,
      analysis: shani.description || (isSadeSati
        ? "Saturn is transiting adjacent to Janma Rashi, emphasizing perseverance, introspection, and authentic living."
        : `Saturn currently moves through your ${shani.houseFromMoon}th house from Moon in ${shani.sign}, providing stability through dedicated focus.`),
      classicalReference: "Phaladeepika, Chapter 26 (Gochara Phala)",
      type: "CALCULATED",
    });
  }

  return guidanceItems;
}

// GET /api/astrology/my-dashboard
export async function GET(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser?.id) {
      return NextResponse.json({ error: "Unauthorized: Authentication required" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const language = searchParams.get("lang") || "en";
    const dateStr = searchParams.get("date") || new Date().toISOString().split("T")[0];

    // 1. Fetch user's primary birth profile
    let profile = await prisma.birthProfile.findFirst({
      where: { userId: authUser.id },
      include: {
        birthChart: {
          include: { planets: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // If profile doesn't exist, check user table
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

      return NextResponse.json({
        success: true,
        isComplete: false,
        profile: null,
        chart: null,
        missingFields: [
          !userRecord?.dateOfBirth ? "dateOfBirth" : null,
          !userRecord?.birthTime ? "birthTime" : null,
          !userRecord?.birthPlace ? "birthPlace" : null,
        ].filter(Boolean),
        prefill: {
          name: userRecord?.name || authUser.name || "",
          birthDate: userRecord?.dateOfBirth ? userRecord.dateOfBirth.toISOString().split("T")[0] : "",
          birthTime: userRecord?.birthTime || "12:00",
          birthPlace: userRecord?.birthPlace || "",
          gender: userRecord?.gender || "",
          timezone: userRecord?.timezone || "Asia/Kolkata",
          language: userRecord?.locale || language,
        },
      });
    }

    // 2. Resolve chart data
    let chart = profile.birthChart?.chartData;
    if (!chart || !chart.planets || !chart.dasha) {
      chart = calculateBirthChart({
        name: profile.name,
        birthDate: profile.birthDate.toISOString().split("T")[0],
        birthTime: profile.birthTime || "12:00",
        birthPlace: profile.birthPlace,
        latitude: profile.latitude,
        longitude: profile.longitude,
        timezone: profile.timezone || "Asia/Kolkata",
        language: profile.language || language,
        gender: profile.gender,
      });
    }

    const lat = profile.latitude || 28.6139;
    const lon = profile.longitude || 77.209;
    const tzOffset = 5.5; // standard IST or user offset

    // 3. Compute Real-Time Transits (Gochara) against natal chart
    const transits = evaluatePredictiveTransits(chart, dateStr, tzOffset, language);

    // 4. Compute Real-Time Panchang & Choghadiya for user's geographical location
    const panchang = computePanchang({
      date: dateStr,
      latitude: lat,
      longitude: lon,
      tzOffset,
      timezone: profile.timezone || "Asia/Kolkata",
    });

    const choghadiya = panchang.choghadiya || { day: [], night: [] };

    // 5. Synthesize Guidance & Upcoming Events
    const guidance = buildPersonalizedGuidance(chart, transits, panchang, language);
    const upcomingEvents = computeUpcomingEvents(chart, dateStr);

    // 6. Select Verified Sanskrit Shloka
    const dailyWisdom = selectDailyWisdom(chart);

    // 7. Generate Explainable Recommendations based on user profile and reading progress
    let recommendations = [];
    try {
      recommendations = await getExplainableRecommendations({
        userId: authUser.id,
        categoryFilter: "ALL",
        limit: 6,
      });
    } catch {
      recommendations = [];
    }

    // Enrich recommendations with user's active Mahadasha explainability tag
    const enrichedRecommendations = recommendations.map((r) => ({
      ...r,
      astrologicalRelevance: `Aligned with your ${chart.dasha?.currentMahadasha || "Planetary"} Mahadasha and ${chart.ascendant?.sign || "Lagna"} Ascendant inquiry.`,
    }));

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
      chart: {
        ascendant: chart.ascendant,
        moon: chart.moon,
        planets: chart.planets,
        houses: chart.houses,
        dasha: chart.dasha,
        yogasAndDoshas: chart.yogasAndDoshas,
        shadbala: chart.shadbala,
        ashtakavarga: chart.ashtakavarga,
        calculation: chart.calculation,
      },
      transits,
      panchang: {
        tithi: panchang.tithi,
        nakshatra: panchang.nakshatra,
        yoga: panchang.yoga,
        karana: panchang.karana,
        vara: panchang.vara,
        moonSign: panchang.moonSign,
        sunSign: panchang.sunSign,
        sunrise: panchang.sunrise,
        sunset: panchang.sunset,
        rahuKaal: panchang.rahuKaal,
      },
      choghadiya,
      guidance,
      upcomingEvents,
      dailyWisdom,
      recommendations: enrichedRecommendations,
    });
  } catch (error) {
    console.error("GET /api/astrology/my-dashboard error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load personalized astrology dashboard" },
      { status: 500 }
    );
  }
}
