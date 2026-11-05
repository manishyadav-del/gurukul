/**
 * Comprehensive Vimshottari Dasha Engine
 *
 * Implements 3-tier Vimshottari period calculations (Mahadasha, Antardasha, Pratyantardasha)
 * starting from the exact sidereal Moon longitude and birth date.
 * Strictly adheres to Brihat Parashara Hora Shastra (BPHS Ch. 46).
 */

import { VIMSHOTTARI_DASHA_CYCLE, NAKSHATRAS } from "./constants.js";
import { getNakshatraAndPada } from "./calculations.js";

// Classical Dasha Interpretation Archetypes (BPHS & Phaladeepika)
export const DASHA_THEMES = {
  SUN: {
    name: "Sun (Surya)",
    sanskritName: "सूर्य",
    archetype: "Soul purpose, authority, illumination, vitality, government honor",
    focus: "Self-realization, fatherly bonds, administrative duties, eye/bone health",
    sadhana: "Gayatri Mantra, Surya Namaskar, Aditya Hridaya Stotram",
  },
  MOON: {
    name: "Moon (Chandra)",
    sanskritName: "चन्द्र",
    archetype: "Mind, emotions, motherhood, public acclaim, intuitive perception",
    focus: "Emotional balance, domestic peace, maternal care, fluid health",
    sadhana: "Chandra Bija Mantra, meditation near water, mindfulness of breath",
  },
  MARS: {
    name: "Mars (Mangala)",
    sanskritName: "मंगल",
    archetype: "Courage, physical vitality, initiative, land/property, brothers",
    focus: "Disciplined action, avoiding impulsive conflict, athletic/engineering pursuits",
    sadhana: "Hanuman Chalisa, Kartikeya Stotram, mindful physical exercise",
  },
  RAHU: {
    name: "Rahu",
    sanskritName: "राहु",
    archetype: "Unconventional growth, foreign connections, tech innovation, worldly ambitions",
    focus: "Discerning illusion from truth, avoiding speculative excess, ethical clarity",
    sadhana: "Durga Saptashati, Rahu Bija Mantra, charity to the needy",
  },
  JUPITER: {
    name: "Jupiter (Guru)",
    sanskritName: "बृहस्पति",
    archetype: "Divine wisdom, spiritual expansion, higher education, progeny, dharma",
    focus: "Learning sacred treatises, spiritual mentor guidance, moral abundance",
    sadhana: "Guru Gita, Vishnu Sahasranama, study of classical philosophy",
  },
  SATURN: {
    name: "Saturn (Shani)",
    sanskritName: "शनि",
    archetype: "Discipline, perseverance, karma exhaustion, longevity, humble service",
    focus: "Patience, structural mastery, detachment, service to the elderly/underprivileged",
    sadhana: "Shani Stotram, Shiva Panchakshari, disciplined daily routine",
  },
  MERCURY: {
    name: "Mercury (Budha)",
    sanskritName: "बुध",
    archetype: "Intellect, business commerce, communication, analytical prowess, writing",
    focus: "Intellectual projects, financial mathematics, articulate speech, diplomacy",
    sadhana: "Vishnu Ashtottara, Budha Bija Mantra, study of sacred literature",
  },
  KETU: {
    name: "Ketu",
    sanskritName: "केतु",
    archetype: "Moksha, intuitive transcendence, detachment, esoteric wisdom, subtle insight",
    focus: "Inner contemplation, releasing obsolete attachments, deep spiritual solitude",
    sadhana: "Ganesha Atharvashirsha, Maha Mrityunjaya Mantra, silent dhyana",
  },
  VENUS: {
    name: "Venus (Shukra)",
    sanskritName: "शुक्र",
    archetype: "Aesthetic beauty, devotion (Bhakti), relationships, creative arts, refined pleasures",
    focus: "Harmonious partnerships, artistic expression, cultural refinement, generosity",
    sadhana: "Lakshmi Ashtakam, Shukra Bija Mantra, cultivating divine devotion",
  },
};

/**
 * Calculates Pratyantardashas (sub-sub periods) within an Antardasha.
 *
 * @param {string} mahaLord - Ruler of Mahadasha
 * @param {string} antarLord - Ruler of Antardasha
 * @param {string} antarStartDate - ISO date string
 * @param {string} antarEndDate - ISO date string
 * @param {Date} [currentDate=new Date()]
 * @returns {Array<Object>} List of 9 Pratyantardashas
 */
export function buildPratyantardashas(
  mahaLord,
  antarLord,
  antarStartDate,
  antarEndDate,
  currentDate = new Date()
) {
  const antarIndex = VIMSHOTTARI_DASHA_CYCLE.findIndex(
    (item) => item.lord.toLowerCase() === antarLord.toLowerCase()
  );
  if (antarIndex === -1) return [];

  const startMs = new Date(antarStartDate).getTime();
  const endMs = new Date(antarEndDate).getTime();
  const totalDurationMs = Math.max(1, endMs - startMs);
  const currentIso = currentDate.toISOString().split("T")[0];

  let currentStart = new Date(startMs);
  const pratyantars = [];

  for (let i = 0; i < 9; i++) {
    const idx = (antarIndex + i) % 9;
    const subSub = VIMSHOTTARI_DASHA_CYCLE[idx];

    // Fraction = subSub.years / 120 of the Antardasha
    const fraction = subSub.years / 120;
    const durationMs = fraction * totalDurationMs;
    const itemEnd = new Date(currentStart.getTime() + durationMs);

    const sIso = currentStart.toISOString().split("T")[0];
    const eIso = itemEnd.toISOString().split("T")[0];
    const isCurrent = currentIso >= sIso && currentIso <= eIso;

    pratyantars.push({
      lord: subSub.lord,
      sanskritName: subSub.sanskritName,
      durationDays: parseFloat((durationMs / (86400 * 1000)).toFixed(1)),
      startDate: sIso,
      endDate: eIso,
      isCurrent,
    });

    currentStart = itemEnd;
  }

  // Ensure an active Pratyantar is flagged if current date is within the range
  const hasCurrent = pratyantars.some((p) => p.isCurrent);
  if (!hasCurrent && currentIso >= antarStartDate && currentIso <= antarEndDate) {
    for (let j = 0; j < pratyantars.length; j++) {
      if (currentIso <= pratyantars[j].endDate) {
        pratyantars[j].isCurrent = true;
        break;
      }
    }
    if (!pratyantars.some((p) => p.isCurrent)) {
      pratyantars[pratyantars.length - 1].isCurrent = true;
    }
  }

  return pratyantars;
}

/**
 * Computes the complete 3-tier Vimshottari Dasha system.
 *
 * @param {number} moonSiderealDeg - Moon's exact sidereal longitude [0, 360)
 * @param {Date} birthDateUtc - Exact birth date in UTC
 * @param {Date} [currentDate=new Date()]
 * @returns {Object} Complete Vimshottari Dasha tree and active state
 */
export function computeComprehensiveVimshottari(
  moonSiderealDeg,
  birthDateUtc,
  currentDate = new Date()
) {
  const nakshatraInfo = getNakshatraAndPada(moonSiderealDeg);
  const startingLord = nakshatraInfo.nakshatra.lord;

  // Locate starting planet in 9-fold cycle
  const cycleIndex = VIMSHOTTARI_DASHA_CYCLE.findIndex(
    (item) => item.lord.toLowerCase() === startingLord.toLowerCase()
  );
  const startingItem = VIMSHOTTARI_DASHA_CYCLE[cycleIndex];
  const totalYears = startingItem.years;

  // Remaining fraction of the Nakshatra
  const fractionRemaining = 1 - nakshatraInfo.fractionElapsed;
  const balanceYears = totalYears * fractionRemaining;

  const balYearsInt = Math.floor(balanceYears);
  const balMonths = Math.floor((balanceYears - balYearsInt) * 12);
  const balDays = Math.floor(((balanceYears - balYearsInt) * 12 - balMonths) * 30);
  const balanceText = `${balYearsInt}y ${balMonths}m ${balDays}d of ${startingLord}`;

  // Build sequential timeline of 9 Mahadashas
  const timeline = [];
  let currentStartTime = new Date(birthDateUtc.getTime());
  const currentIso = currentDate.toISOString().split("T")[0];

  // 1st Mahadasha (Partial initial balance)
  const firstDurationDays = balanceYears * 365.25;
  let currentEndTime = new Date(currentStartTime.getTime() + firstDurationDays * 86400 * 1000);

  timeline.push({
    lord: startingItem.lord,
    sanskritName: startingItem.sanskritName,
    durationYears: parseFloat(balanceYears.toFixed(2)),
    startDate: currentStartTime.toISOString().split("T")[0],
    endDate: currentEndTime.toISOString().split("T")[0],
    isPartial: true,
  });

  // Remaining 8 Mahadashas
  for (let i = 1; i < 9; i++) {
    const idx = (cycleIndex + i) % 9;
    const item = VIMSHOTTARI_DASHA_CYCLE[idx];
    const itemStart = new Date(currentEndTime.getTime());
    const durationDays = item.years * 365.25;
    const itemEnd = new Date(itemStart.getTime() + durationDays * 86400 * 1000);

    timeline.push({
      lord: item.lord,
      sanskritName: item.sanskritName,
      durationYears: item.years,
      startDate: itemStart.toISOString().split("T")[0],
      endDate: itemEnd.toISOString().split("T")[0],
      isPartial: false,
    });

    currentEndTime = itemEnd;
  }

  // Find active Mahadasha
  let activeMaha = timeline.find((d) => currentIso >= d.startDate && currentIso <= d.endDate);
  if (!activeMaha) {
    activeMaha = timeline[timeline.length - 1];
  }

  // Populate Antardashas & Pratyantardashas
  let activeAntar = null;
  let activePratyantar = null;

  timeline.forEach((maha) => {
    maha.isCurrent = maha.lord === activeMaha.lord;
    const mahaCycleIdx = VIMSHOTTARI_DASHA_CYCLE.findIndex(
      (v) => v.lord.toLowerCase() === maha.lord.toLowerCase()
    );
    const mahaItem = VIMSHOTTARI_DASHA_CYCLE[mahaCycleIdx];

    const mStartMs = new Date(maha.startDate).getTime();
    const mEndMs = new Date(maha.endDate).getTime();
    const mTotalMs = Math.max(1, mEndMs - mStartMs);

    let aStart = new Date(mStartMs);
    const antardashas = [];

    for (let j = 0; j < 9; j++) {
      const aIdx = (mahaCycleIdx + j) % 9;
      const aItem = VIMSHOTTARI_DASHA_CYCLE[aIdx];
      const aFraction = aItem.years / 120;
      const aDurationMs = aFraction * mTotalMs;
      const aEnd = new Date(aStart.getTime() + aDurationMs);

      const aStartIso = aStart.toISOString().split("T")[0];
      const aEndIso = aEnd.toISOString().split("T")[0];
      const isAntarCurrent = maha.isCurrent && currentIso >= aStartIso && currentIso <= aEndIso;

      // Build Pratyantardashas for this Antardasha
      const pratyantars = buildPratyantardashas(
        maha.lord,
        aItem.lord,
        aStartIso,
        aEndIso,
        currentDate
      );

      const antarObj = {
        lord: aItem.lord,
        sanskritName: aItem.sanskritName,
        durationMonths: parseFloat(((aItem.years * mahaItem.years * 12) / 120).toFixed(1)),
        durationYears: parseFloat(((aItem.years * mahaItem.years) / 120).toFixed(2)),
        startDate: aStartIso,
        endDate: aEndIso,
        isCurrent: isAntarCurrent,
        pratyantardashas: pratyantars,
      };

      if (isAntarCurrent) {
        activeAntar = antarObj;
        activePratyantar = pratyantars.find((p) => p.isCurrent) || pratyantars[0];
      }

      antardashas.push(antarObj);
      aStart = aEnd;
    }

    maha.antardashas = antardashas;
  });

  // Fallback for active sub-periods
  if (!activeAntar && activeMaha.antardashas?.length) {
    activeAntar = activeMaha.antardashas[0];
    activePratyantar = activeAntar.pratyantardashas?.[0] || null;
  }

  const mahaTheme = DASHA_THEMES[activeMaha.lord.toUpperCase()] || {};
  const antarTheme = DASHA_THEMES[activeAntar?.lord?.toUpperCase()] || {};

  return {
    moonNakshatra: nakshatraInfo.nakshatra.name,
    moonPada: nakshatraInfo.pada,
    startingLord,
    balanceText,
    balanceYears: parseFloat(balanceYears.toFixed(2)),
    activeDasha: {
      mahadasha: activeMaha.lord,
      antardasha: activeAntar?.lord || activeMaha.lord,
      pratyantardasha: activePratyantar?.lord || activeAntar?.lord || activeMaha.lord,
      startDate: activeMaha.startDate,
      endDate: activeMaha.endDate,
      antarStartDate: activeAntar?.startDate,
      antarEndDate: activeAntar?.endDate,
      pratyantarStartDate: activePratyantar?.startDate,
      pratyantarEndDate: activePratyantar?.endDate,
      theme: mahaTheme,
      subTheme: antarTheme,
    },
    timeline,
  };
}
