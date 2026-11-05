/**
 * Vedic Daily Spiritual Remedies & Guidance Engine
 * 
 * Deterministic recommendation engine that synthesizes:
 * 1. Current verified Panchang (Vara, Tithi, Nakshatra, Rahu Kaal)
 * 2. Planetary associations and deity alignments (Brihat Parashara Hora Shastra, Ch. 84)
 * 3. User personalized chart context (Moon sign, Ascendant) when opted-in
 * 4. User practice history (completed today, bookmarked)
 * 
 * Safety & Ethical Principles:
 * - Clear distinction between traditional religious belief and scientific fact
 * - Zero fear-mongering, curses, or superstitious guarantees
 * - All practices are safe, accessible, free or low-cost, with gentle alternatives
 */

import prisma from "../../lib/prisma.js";
import { INITIAL_REMEDIES } from "./seedRemediesAndKundalini.js";

/**
 * Returns prioritized spiritual recommendations for the given date, Panchang, and optional user profile.
 * 
 * @param {Object} params
 * @param {Object} params.panchang          - Output of computePanchang()
 * @param {string} params.date              - "YYYY-MM-DD"
 * @param {string|null} params.userId       - Authenticated user ID (optional)
 * @param {Object|null} params.birthProfile - Birth profile with chart data (optional)
 * @param {string} params.language          - "en" or "hi"
 * @returns {Promise<Object>} Categorized daily guidance
 */
export async function getDailySpiritualGuidance({
  panchang,
  date,
  userId = null,
  birthProfile = null,
  language = "en",
}) {
  const weekdayIndex = panchang.vara?.dayIndex ?? new Date(date).getUTCDay();
  const currentTithiName = panchang.tithi?.name || "";
  const currentNakshatraName = panchang.nakshatra?.name || "";
  const moonRashi = panchang.moonSign?.name || "Aries";

  // 1. Fetch remedies from database with fallback to seed data
  let allRemedies = [];
  try {
    allRemedies = await prisma.dailyRemedy.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "asc" },
    });
  } catch (err) {
    console.warn("[remedyEngine] DB fetch failed, using built-in verified corpus:", err.message);
  }

  if (!allRemedies || allRemedies.length === 0) {
    allRemedies = INITIAL_REMEDIES.map((r, i) => ({ ...r, id: `seed-remedy-${i}` }));
  }

  // 2. Fetch user's completion logs and bookmarks if authenticated
  const userLogsMap = new Map();
  if (userId) {
    try {
      const logs = await prisma.userPracticeLog.findMany({
        where: {
          userId,
          practiceDate: date,
        },
      });
      for (const log of logs) {
        userLogsMap.set(log.remedyId, log);
      }
    } catch (err) {
      console.warn("[remedyEngine] Failed to fetch user practice logs:", err.message);
    }
  }

  // 3. Score and prioritize recommendations
  const scoredRemedies = allRemedies.map((remedy) => {
    let score = 0;
    const reasons = [];

    // Weekday match (Primary alignment)
    if (remedy.applicableWeekdays?.includes(weekdayIndex)) {
      score += 50;
      reasons.push(`Aligned with today's ruling day (${panchang.vara?.en} - ${panchang.vara?.lord})`);
    }

    // Tithi match
    if (
      remedy.applicableTithis?.includes(currentTithiName) ||
      remedy.applicableTithis?.includes("All")
    ) {
      score += 20;
      reasons.push(`Traditional for ${currentTithiName} Tithi`);
    }

    // Nakshatra match
    if (
      remedy.applicableNakshatras?.includes(currentNakshatraName) ||
      remedy.applicableNakshatras?.includes("All")
    ) {
      score += 15;
    }

    // Universal avoidance guidelines (Rahu Kaal)
    if (remedy.category === "AVOIDANCE") {
      score += 35;
      reasons.push("Daily traditional mindfulness guideline");
    }

    // Category diversity weighting
    if (remedy.category === "PUJA" || remedy.category === "MANTRA") score += 10;
    if (remedy.category === "DAAN") score += 8;
    if (remedy.category === "HABIT") score += 6;

    const userLog = userLogsMap.get(remedy.id);

    return {
      ...remedy,
      matchScore: score,
      matchReasons: reasons,
      isCompleted: Boolean(userLog?.completed),
      isBookmarked: Boolean(userLog?.bookmarked),
      userNotes: userLog?.notes || null,
    };
  });

  // Sort by score descending
  scoredRemedies.sort((a, b) => b.matchScore - a.matchScore);

  // 4. Select top 3 to 5 balanced recommendations ensuring category variety
  const selected = [];
  const usedCategories = new Set();

  for (const r of scoredRemedies) {
    if (selected.length >= 5) break;

    // Pick at most 2 per category to guarantee broad spiritual guidance
    const countInCat = selected.filter((x) => x.category === r.category).length;
    if (countInCat < 2) {
      selected.push(r);
      usedCategories.add(r.category);
    }
  }

  // Ensure an avoidance guideline is included if available
  const avoidanceItem = scoredRemedies.find((r) => r.category === "AVOIDANCE");
  if (avoidanceItem && !selected.some((s) => s.id === avoidanceItem.id)) {
    if (selected.length >= 5) selected.pop();
    selected.push(avoidanceItem);
  }

  // 5. Build Personalized Astrology Guidance (if user provided birth profile)
  let personalizedGuidance = null;
  if (birthProfile) {
    const chartData = birthProfile.birthChart?.chartData;

    // Resolve user's natal Moon sign (Rashi) name as string
    let userMoonRashi = "Aries";
    if (typeof chartData?.moon?.sign === "string") {
      userMoonRashi = chartData.moon.sign;
    } else if (typeof chartData?.moonSign === "string") {
      userMoonRashi = chartData.moonSign;
    } else if (typeof birthProfile.moonSign === "string") {
      userMoonRashi = birthProfile.moonSign;
    } else if (typeof chartData?.moon === "string") {
      userMoonRashi = chartData.moon;
    }

    // Resolve user's Lagna / Ascendant sign name as string
    let userLagna = "Aries";
    if (typeof chartData?.ascendant?.sign === "string") {
      userLagna = chartData.ascendant.sign;
    } else if (typeof chartData?.ascendant === "string") {
      userLagna = chartData.ascendant;
    } else if (typeof birthProfile.ascendant === "string") {
      userLagna = birthProfile.ascendant;
    }

    personalizedGuidance = {
      isAvailable: true,
      profileName: birthProfile.name || "Seeker",
      userMoonSign: String(userMoonRashi),
      userAscendant: String(userLagna),
      astrologicalInsight: `With your natal Moon in ${userMoonRashi} and transit Moon traveling through ${moonRashi}, today favors gentle mental poise and conscious focus on inner harmony. The planetary ruler of ${panchang.vara?.en} (${panchang.vara?.lord}) invites you to balance active duties with quiet reflection.`,
      recommendedFocus: `Dedicate 5 to 10 minutes to mindful breathing before entering major discussions, especially as the day transitions through Rahu Kaal.`,
      disclaimer: "Astrological guidance represents traditional contemplative archetypes. It does not replace personal judgment, professional healthcare, or medical advice.",
    };
  } else {
    personalizedGuidance = {
      isAvailable: false,
      message: "Log in or select your birth profile to receive personalized chart-based spiritual guidance.",
    };
  }

  // 6. Good Habits for Today (derived from traditional Dharma Shastra principles)
  const goodHabits = [
    {
      id: "habit-1",
      title: "Pratah Sankalpa (Morning Intention)",
      description: "Upon waking, take 3 mindful breaths before looking at digital screens. Set a calm, benevolent intention for your day.",
      source: "Taittiriya Aranyaka (Brahma Yajna)",
    },
    {
      id: "habit-2",
      title: "Mitabhashana (Measured & Kind Speech)",
      description: "Consciously pause before responding in conversations. Speak words that are truthful, pleasant, and beneficial.",
      source: "Bhagavad Gita 17.15 (Vangmaya Tapas)",
    },
    {
      id: "habit-3",
      title: "Pancha Yajna Gesture (Acts of Kindness)",
      description: "Offer food or water to birds, animals, or care for a plant. Even the smallest act of environmental care generates wholesome karma.",
      source: "Manusmriti 3.68-71",
    },
    {
      id: "habit-4",
      title: "Nitya Svadhyaya (Daily Reflective Study)",
      description: "Spend 10 to 15 minutes reading an inspiring passage from sacred literature or contemplative philosophy.",
      source: "Patanjali Yoga Sutras 2.44",
    },
  ];

  // 7. Traditional Observance: What to Avoid (Careful, non-alarmist guidelines)
  const whatToAvoid = [
    {
      id: "avoid-1",
      title: "Impulsive Commitments during Rahu Kaal",
      description: panchang.rahuKaal
        ? `Traditional astrology cautions against commencing irrevocable contracts or major inaugural ventures during today's Rahu Kaal (${panchang.rahuKaal.startLocal} – ${panchang.rahuKaal.endLocal}). Use this period for steady ongoing work, cleaning, or silent contemplation.`
        : "Avoid hasty, emotionally charged decisions during unsettled moments of the day.",
      tradition: "Muhurta Chintamani & Brihat Samhita",
    },
    {
      id: "avoid-2",
      title: "Harsh Criticism & Verbal Conflict (Pāruṣya)",
      description: "Refrain from engaging in argumentative social media debates or aggressive confrontation today. Conserve mental energy for constructive goals.",
      tradition: "Dharma Shastra & Yoga Sutras (Ahimsa)",
    },
    {
      id: "avoid-3",
      title: "Excessive Lethargy & Procrastination (Tamas)",
      description: "Avoid prolonged daytime slumber or aimless distraction. Maintain a steady, purposeful rhythm throughout your waking hours.",
      tradition: "Bhagavad Gita 18.39",
    },
  ];

  return {
    date,
    weekday: panchang.vara?.en,
    weekdayHi: panchang.vara?.hi,
    rulingPlanet: panchang.vara?.lord,
    rulingPlanetHi: panchang.vara?.lordHi,
    panchangSummary: {
      tithi: `${panchang.tithi?.paksha} ${panchang.tithi?.name} (${panchang.tithi?.devanagari})`,
      nakshatra: `${panchang.nakshatra?.name} (${panchang.nakshatra?.devanagari})`,
      yoga: `${panchang.yoga?.name} (${panchang.yoga?.devanagari})`,
      karana: `${panchang.karana?.name} (${panchang.karana?.devanagari})`,
      moonSign: `${panchang.moonSign?.name} (${panchang.moonSign?.sanskritName})`,
      sunrise: panchang.sunrise?.local || "06:00 AM",
      sunset: panchang.sunset?.local || "06:00 PM",
      rahuKaal: panchang.rahuKaal
        ? `${panchang.rahuKaal.startLocal} – ${panchang.rahuKaal.endLocal}`
        : "Check local calendar",
    },
    recommendedPractices: selected,
    goodHabits,
    whatToAvoid,
    personalizedGuidance,
    safetyNotice: {
      title: "Ethical & Spiritual Disclaimer",
      text: "Vedic remedies and spiritual guidance are traditional practices intended for personal self-discipline, inner peace, and contemplative reflection. They are NOT guaranteed scientific mechanisms for altering external circumstances, avoiding natural difficulties, or curing medical/psychological conditions. Always consult qualified healthcare professionals for medical or emotional concerns.",
    },
  };
}
