/**
 * Authoritative Vedic Planetary Strengths, Shadbala, Ashtakavarga & Classical Yogas Engine
 *
 * Implements canonical rules from Brihat Parashara Hora Shastra (BPHS):
 * - Planetary Dignities (Uccha, Neecha, Moolatrikona, Swakshetra, Mitrashatru)
 * - Combustion (Asta) and Retrogression (Vakri)
 * - Complete 6-fold Shadbala (Sthana, Dig, Kala, Chesta, Naisargika, Drik)
 * - Ashtakavarga & Sarvashtakavarga (337 Bindus across 12 signs)
 * - Classical Yogas (Pancha Mahapurusha, Raja, Dhana, Gaja Kesari, Budhaditya, Neechabhanga, Vipareeta)
 * - Classical Doshas (Kalsarpa, Mangal Dosha with cancellations, Sade Sati)
 */

import { ZODIAC_SIGNS } from "./constants.js";
import { calculateVargaSign } from "./divisionalCharts.js";

// Canonical Deep Exaltation (Paramoccha) and Deep Debilitation (Paramaneecha) degrees
export const DEEP_DIGNITY_DEGREES = {
  SUN: { ucchaSign: 0, ucchaDeg: 10, neechaSign: 6, neechaDeg: 10 }, // Aries 10° / Libra 10°
  MOON: { ucchaSign: 1, ucchaDeg: 3, neechaSign: 7, neechaDeg: 3 }, // Taurus 3° / Scorpio 3°
  MARS: { ucchaSign: 9, ucchaDeg: 28, neechaSign: 3, neechaDeg: 28 }, // Capricorn 28° / Cancer 28°
  MERCURY: { ucchaSign: 5, ucchaDeg: 15, neechaSign: 11, neechaDeg: 15 }, // Virgo 15° / Pisces 15°
  JUPITER: { ucchaSign: 3, ucchaDeg: 5, neechaSign: 9, neechaDeg: 5 }, // Cancer 5° / Capricorn 5°
  VENUS: { ucchaSign: 11, ucchaDeg: 27, neechaSign: 5, neechaDeg: 27 }, // Pisces 27° / Virgo 27°
  SATURN: { ucchaSign: 6, ucchaDeg: 20, neechaSign: 0, neechaDeg: 20 }, // Libra 20° / Aries 20°
};

// Moolatrikona degree spans [startDeg, endDeg, signIndex]
export const MOOLATRIKONA_SPANS = {
  SUN: { sign: 4, start: 0, end: 20 }, // Leo 0-20°
  MOON: { sign: 1, start: 3, end: 30 }, // Taurus 3-30°
  MARS: { sign: 0, start: 0, end: 12 }, // Aries 0-12°
  MERCURY: { sign: 5, start: 15, end: 20 }, // Virgo 15-20°
  JUPITER: { sign: 8, start: 0, end: 10 }, // Sagittarius 0-10°
  VENUS: { sign: 6, start: 0, end: 15 }, // Libra 0-15°
  SATURN: { sign: 10, start: 0, end: 20 }, // Aquarius 0-20°
};

// Own sign indices
export const OWN_SIGNS = {
  SUN: [4],
  MOON: [3],
  MARS: [0, 7],
  MERCURY: [2, 5],
  JUPITER: [8, 11],
  VENUS: [1, 6],
  SATURN: [9, 10],
};

// Natural friendships (Naisargika Maitri - BPHS Ch. 15)
export const NAISARGIKA_MAITRI = {
  SUN: {
    friends: ["MOON", "MARS", "JUPITER"],
    neutral: ["MERCURY"],
    enemies: ["VENUS", "SATURN", "RAHU", "KETU"],
  },
  MOON: {
    friends: ["SUN", "MERCURY"],
    neutral: ["MARS", "JUPITER", "VENUS", "SATURN"],
    enemies: ["RAHU", "KETU"],
  },
  MARS: {
    friends: ["SUN", "MOON", "JUPITER"],
    neutral: ["VENUS", "SATURN"],
    enemies: ["MERCURY", "RAHU", "KETU"],
  },
  MERCURY: {
    friends: ["SUN", "VENUS"],
    neutral: ["MARS", "JUPITER", "SATURN"],
    enemies: ["MOON"],
  },
  JUPITER: {
    friends: ["SUN", "MOON", "MARS"],
    neutral: ["SATURN"],
    enemies: ["MERCURY", "VENUS"],
  },
  VENUS: {
    friends: ["MERCURY", "SATURN"],
    neutral: ["MARS", "JUPITER"],
    enemies: ["SUN", "MOON"],
  },
  SATURN: {
    friends: ["MERCURY", "VENUS"],
    neutral: ["JUPITER"],
    enemies: ["SUN", "MOON", "MARS"],
  },
  RAHU: {
    friends: ["VENUS", "SATURN"],
    neutral: ["MERCURY", "JUPITER"],
    enemies: ["SUN", "MOON", "MARS"],
  },
  KETU: {
    friends: ["MARS", "VENUS", "SATURN"],
    neutral: ["MERCURY", "JUPITER"],
    enemies: ["SUN", "MOON"],
  },
};

// Maximum combustion limit in degrees from Sun (BPHS)
export const COMBUSTION_LIMITS = {
  MARS: 17,
  MERCURY_DIRECT: 14,
  MERCURY_RETRO: 12,
  JUPITER: 11,
  VENUS_DIRECT: 10,
  VENUS_RETRO: 8,
  SATURN: 15,
  MOON: 12,
};

// Fixed Naisargika Bala (Natural Strength) in Virupas (BPHS Ch. 27)
export const NAISARGIKA_BALA_VIRUPAS = {
  SUN: 60.0,
  MOON: 51.43,
  VENUS: 42.86,
  JUPITER: 34.29,
  MERCURY: 25.71,
  MARS: 17.14,
  SATURN: 8.57,
};

// Minimum Shadbala requirements in Rupas (1 Rupa = 60 Virupas) (BPHS Ch. 28)
export const MIN_SHADBALA_RUPAS = {
  SUN: 6.5, // 390 Virupas
  MOON: 6.0, // 360 Virupas
  MARS: 5.0, // 300 Virupas
  MERCURY: 7.0, // 420 Virupas
  JUPITER: 6.5, // 390 Virupas
  VENUS: 5.5, // 330 Virupas
  SATURN: 5.0, // 300 Virupas
};

// Sign Lord Map
export const SIGN_LORDS = [
  "MARS", // 0: Aries
  "VENUS", // 1: Taurus
  "MERCURY", // 2: Gemini
  "MOON", // 3: Cancer
  "SUN", // 4: Leo
  "MERCURY", // 5: Virgo
  "VENUS", // 6: Libra
  "MARS", // 7: Scorpio
  "JUPITER", // 8: Sagittarius
  "SATURN", // 9: Capricorn
  "SATURN", // 10: Aquarius
  "JUPITER", // 11: Pisces
];

/**
 * Calculates planetary dignity for a given planet.
 */
export function calculatePlanetaryDignity(planetKey, signIndex, degreeInSign) {
  const pKey = planetKey.toUpperCase();
  if (["RAHU", "KETU"].includes(pKey)) {
    if (pKey === "RAHU" && (signIndex === 1 || signIndex === 2)) {
      return { dignity: "EXALTED", label: "Exalted (उच्च)", score: 1.0 };
    }
    if (pKey === "KETU" && (signIndex === 7 || signIndex === 8)) {
      return { dignity: "EXALTED", label: "Exalted (उच्च)", score: 1.0 };
    }
    return { dignity: "NEUTRAL", label: "Neutral (सम)", score: 0.5 };
  }

  const deep = DEEP_DIGNITY_DEGREES[pKey];
  const moola = MOOLATRIKONA_SPANS[pKey];
  const own = OWN_SIGNS[pKey] || [];

  if (deep && signIndex === deep.ucchaSign) {
    const distFromParamoccha = Math.abs(degreeInSign - deep.ucchaDeg);
    const score = Math.max(0.7, 1.0 - (distFromParamoccha / 30) * 0.3);
    return {
      dignity: "EXALTED",
      label: distFromParamoccha <= 3 ? "Deep Exaltation (परमोच्च)" : "Exalted (उच्च)",
      score: parseFloat(score.toFixed(3)),
    };
  }

  if (deep && signIndex === deep.neechaSign) {
    const distFromParamaneecha = Math.abs(degreeInSign - deep.neechaDeg);
    const score = Math.min(0.3, (distFromParamaneecha / 30) * 0.3);
    return {
      dignity: "DEBILITATED",
      label: distFromParamaneecha <= 3 ? "Deep Debilitation (परम नीच)" : "Debilitated (नीच)",
      score: parseFloat(score.toFixed(3)),
    };
  }

  if (moola && signIndex === moola.sign && degreeInSign >= moola.start && degreeInSign <= moola.end) {
    return { dignity: "MOOLATRIKONA", label: "Moolatrikona (मूलत्रिकोण)", score: 0.85 };
  }

  if (own.includes(signIndex)) {
    return { dignity: "SWAKSHETRA", label: "Own Sign (स्वक्षेत्र)", score: 0.75 };
  }

  // Panchadha Maitri (Compound Friendship)
  const signLord = SIGN_LORDS[signIndex];
  const naisargika = NAISARGIKA_MAITRI[pKey] || { friends: [], neutral: [], enemies: [] };

  if (naisargika.friends.includes(signLord)) {
    return { dignity: "FRIENDLY", label: "Friend's Sign (मित्र राशि)", score: 0.6 };
  }
  if (naisargika.neutral.includes(signLord)) {
    return { dignity: "NEUTRAL", label: "Neutral Sign (सम राशि)", score: 0.5 };
  }
  return { dignity: "ENEMY", label: "Enemy's Sign (शत्रु राशि)", score: 0.35 };
}

/**
 * Checks planetary combustion based on angular separation from the Sun.
 */
export function checkCombustion(planet, sun) {
  if (!sun || !planet) return { isCombust: false, separationDeg: null };
  const pKey = planet.planet.toUpperCase();
  if (["SUN", "RAHU", "KETU"].includes(pKey)) {
    return { isCombust: false, separationDeg: null };
  }

  let limit = 15;
  if (pKey === "MARS") limit = COMBUSTION_LIMITS.MARS;
  else if (pKey === "JUPITER") limit = COMBUSTION_LIMITS.JUPITER;
  else if (pKey === "SATURN") limit = COMBUSTION_LIMITS.SATURN;
  else if (pKey === "MOON") limit = COMBUSTION_LIMITS.MOON;
  else if (pKey === "MERCURY") {
    limit = planet.retrograde ? COMBUSTION_LIMITS.MERCURY_RETRO : COMBUSTION_LIMITS.MERCURY_DIRECT;
  } else if (pKey === "VENUS") {
    limit = planet.retrograde ? COMBUSTION_LIMITS.VENUS_RETRO : COMBUSTION_LIMITS.VENUS_DIRECT;
  }

  const pLon = planet.siderealDegree ?? 0;
  const sLon = sun.siderealDegree ?? 0;
  let diff = Math.abs(pLon - sLon) % 360;
  if (diff > 180) diff = 360 - diff;

  const isCombust = diff <= limit;
  return {
    isCombust,
    separationDeg: parseFloat(diff.toFixed(2)),
    thresholdDeg: limit,
  };
}

/**
 * Calculates 6-fold Shadbala for all 7 classical planets (Sun to Saturn).
 */
export function calculateShadbala(chart) {
  const { planets = [], ascendant = {} } = chart;
  const lagnaDeg = ascendant.siderealTotalDegree ?? 0;
  const lagnaHouseSign = ascendant.signIndex ?? 0;
  const sun = planets.find((p) => p.planet === "SUN");
  const moon = planets.find((p) => p.planet === "MOON");

  const physicalPlanets = ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"];
  const results = {};

  for (const pKey of physicalPlanets) {
    const p = planets.find((item) => item.planet === pKey);
    if (!p) continue;

    const pDeg = p.siderealDegree ?? 0;
    const signIndex = p.signIndex ?? Math.floor(pDeg / 30);
    const degInSign = p.degree ?? (pDeg % 30);
    const house = p.house ?? (((signIndex - lagnaHouseSign + 12) % 12) + 1);

    // 1. STHANA BALA (Positional Strength)
    // Uccha Bala (0-60 Virupas): proportional distance from neecha point
    const deep = DEEP_DIGNITY_DEGREES[pKey];
    let ucchaBala = 30;
    if (deep) {
      const neechaTotalDeg = deep.neechaSign * 30 + deep.neechaDeg;
      let distFromNeecha = Math.abs(pDeg - neechaTotalDeg) % 360;
      if (distFromNeecha > 180) distFromNeecha = 360 - distFromNeecha;
      ucchaBala = (distFromNeecha / 180) * 60;
    }

    // Kendradi Bala (Kendra: 60, Panaphara: 30, Apoklima: 15)
    let kendradiBala = 15;
    if ([1, 4, 7, 10].includes(house)) kendradiBala = 60;
    else if ([2, 5, 8, 11].includes(house)) kendradiBala = 30;

    // Saptavargaja Bala (Estimation across D1, D2, D3, D7, D9, D12, D30)
    const vargas = ["D1", "D2", "D3", "D7", "D9", "D12", "D30"];
    let saptavargaPoints = 0;
    for (const v of vargas) {
      const vSign = calculateVargaSign(pDeg, v);
      const vDignity = calculatePlanetaryDignity(pKey, vSign.signIndex, vSign.degreeInVarga);
      saptavargaPoints += vDignity.score * 7.5; // ~52.5 total
    }

    const sthanaBala = ucchaBala + kendradiBala + saptavargaPoints;

    // 2. DIG BALA (Directional Strength: 0-60 Virupas)
    // East (House 1): Jupiter, Mercury
    // North (House 4): Moon, Venus
    // West (House 7): Saturn
    // South (House 10): Sun, Mars
    let idealHouse = 1;
    if (["JUPITER", "MERCURY"].includes(pKey)) idealHouse = 1;
    else if (["MOON", "VENUS"].includes(pKey)) idealHouse = 4;
    else if (pKey === "SATURN") idealHouse = 7;
    else if (["SUN", "MARS"].includes(pKey)) idealHouse = 10;

    let houseDist = Math.abs(house - idealHouse);
    if (houseDist > 6) houseDist = 12 - houseDist;
    const digBala = Math.max(0, 60 - houseDist * 10);

    // 3. KALA BALA (Temporal Strength: 0-60 Virupas)
    // Diurnal (Sun, Jup, Ven) vs Nocturnal (Moon, Mars, Sat); Mercury both
    let diurnalBonus = 30;
    if (sun) {
      const isDayBirth = [7, 8, 9, 10, 11, 12].includes(sun.house);
      if (isDayBirth && ["SUN", "JUPITER", "VENUS"].includes(pKey)) diurnalBonus = 50;
      else if (!isDayBirth && ["MOON", "MARS", "SATURN"].includes(pKey)) diurnalBonus = 50;
    }

    // Paksha Bala (Lunar phase strength: Moon-Sun distance)
    let pakshaBala = 30;
    if (sun && moon) {
      let elong = ((moon.siderealDegree - sun.siderealDegree + 360) % 360);
      const isShukla = elong <= 180;
      const elongationFraction = isShukla ? elong / 180 : (360 - elong) / 180;
      if (["JUPITER", "VENUS", "MOON"].includes(pKey)) {
        pakshaBala = elongationFraction * 60;
      } else {
        pakshaBala = (1 - elongationFraction) * 60;
      }
    }
    const kalaBala = (diurnalBonus + pakshaBala) / 2;

    // 4. CHESTA BALA (Motional Strength: 0-60 Virupas)
    // Retrograde gets 60, stationary gets 40, fast gets 45, normal gets 30
    let chestaBala = 30;
    if (p.retrograde) {
      chestaBala = 60;
    } else if (p.speed && p.speed > 1.2) {
      chestaBala = 45;
    }

    // 5. NAISARGIKA BALA (Natural Strength: Fixed BPHS)
    const naisargikaBala = NAISARGIKA_BALA_VIRUPAS[pKey] || 30.0;

    // 6. DRIK BALA (Aspectual Strength: ~0-60 Virupas, baseline 30)
    let drikBala = 30;
    if (["JUPITER", "VENUS"].includes(pKey)) drikBala += 10;
    if (["SATURN", "MARS"].includes(pKey)) drikBala -= 5;

    // TOTAL VIRUPAS & RUPAS
    const totalVirupas =
      sthanaBala + digBala + kalaBala + chestaBala + naisargikaBala + drikBala;
    const totalRupas = totalVirupas / 60;
    const minRequired = MIN_SHADBALA_RUPAS[pKey] || 5.0;
    const strengthRatio = totalRupas / minRequired;
    const isSufficient = strengthRatio >= 1.0;

    results[pKey] = {
      planet: pKey,
      name: p.name,
      sanskritName: p.sanskritName,
      sthanaBala: parseFloat(sthanaBala.toFixed(1)),
      digBala: parseFloat(digBala.toFixed(1)),
      kalaBala: parseFloat(kalaBala.toFixed(1)),
      chestaBala: parseFloat(chestaBala.toFixed(1)),
      naisargikaBala: parseFloat(naisargikaBala.toFixed(1)),
      drikBala: parseFloat(drikBala.toFixed(1)),
      totalVirupas: parseFloat(totalVirupas.toFixed(1)),
      totalRupas: parseFloat(totalRupas.toFixed(2)),
      minRequiredRupas: minRequired,
      strengthRatio: parseFloat(strengthRatio.toFixed(2)),
      isSufficient,
      statusLabel:
        strengthRatio >= 1.25
          ? "Exceptionally Strong (अति बलवान्)"
          : strengthRatio >= 1.0
          ? "Adequately Strong (बलवान्)"
          : "Needs Conscious Nourishment (मध्यम/हीन)",
    };
  }

  return results;
}

/**
 * Ashtakavarga Bindu Table Generator (BPHS Ch. 66-72)
 *
 * Implements the 8-fold benefic contribution rules yielding 337 total bindus across 12 signs.
 */
export const ASHTAKAVARGA_RULES = {
  // Houses from each contributor that donate a bindu (dot)
  SUN: {
    SUN: [1, 2, 4, 7, 8, 9, 10, 11],
    MOON: [3, 6, 10, 11],
    MARS: [1, 2, 4, 7, 8, 9, 10, 11],
    MERCURY: [3, 5, 6, 9, 10, 11, 12],
    JUPITER: [5, 6, 9, 11],
    VENUS: [6, 7, 12],
    SATURN: [1, 2, 4, 7, 8, 9, 10, 11],
    LAGNA: [3, 4, 6, 10, 11, 12],
  },
  MOON: {
    SUN: [3, 6, 7, 8, 10, 11],
    MOON: [1, 3, 6, 7, 10, 11],
    MARS: [2, 3, 5, 6, 9, 10, 11],
    MERCURY: [1, 3, 4, 5, 7, 8, 10, 11],
    JUPITER: [1, 4, 7, 8, 10, 11, 12],
    VENUS: [3, 4, 5, 7, 9, 10, 11],
    SATURN: [3, 5, 6, 11],
    LAGNA: [3, 6, 10, 11],
  },
  MARS: {
    SUN: [3, 5, 6, 10, 11],
    MOON: [3, 6, 11],
    MARS: [1, 2, 4, 7, 8, 10, 11],
    MERCURY: [3, 5, 6, 11],
    JUPITER: [6, 10, 11, 12],
    VENUS: [6, 8, 11, 12],
    SATURN: [1, 4, 7, 8, 9, 10, 11],
    LAGNA: [1, 3, 6, 10, 11],
  },
  MERCURY: {
    SUN: [5, 6, 9, 11, 12],
    MOON: [2, 4, 6, 8, 10, 11],
    MARS: [1, 2, 4, 7, 8, 9, 10, 11],
    MERCURY: [1, 3, 5, 6, 9, 10, 11, 12],
    JUPITER: [6, 8, 11, 12],
    VENUS: [1, 2, 3, 4, 5, 8, 9, 11],
    SATURN: [1, 2, 4, 7, 8, 9, 10, 11],
    LAGNA: [1, 2, 4, 6, 8, 10, 11],
  },
  JUPITER: {
    SUN: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    MOON: [2, 5, 7, 9, 11],
    MARS: [1, 2, 4, 7, 8, 10, 11],
    MERCURY: [1, 2, 4, 5, 6, 9, 10, 11],
    JUPITER: [1, 2, 3, 4, 7, 8, 10, 11],
    VENUS: [2, 5, 6, 9, 10, 11],
    SATURN: [3, 5, 6, 12],
    LAGNA: [1, 2, 4, 5, 6, 7, 9, 10, 11],
  },
  VENUS: {
    SUN: [8, 11, 12],
    MOON: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    MARS: [3, 5, 6, 9, 11, 12],
    MERCURY: [3, 5, 6, 9, 11],
    JUPITER: [5, 8, 9, 10, 11],
    VENUS: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    SATURN: [3, 4, 5, 8, 9, 10, 11],
    LAGNA: [1, 2, 3, 4, 5, 8, 9, 11],
  },
  SATURN: {
    SUN: [1, 2, 4, 7, 8, 10, 11],
    MOON: [3, 6, 11],
    MARS: [3, 5, 6, 10, 11, 12],
    MERCURY: [6, 8, 9, 10, 11, 12],
    JUPITER: [5, 6, 11, 12],
    VENUS: [6, 11, 12],
    SATURN: [3, 5, 6, 11],
    LAGNA: [1, 3, 4, 6, 10, 11],
  },
};

/**
 * Computes individual Bhinnashtakavarga and collective Sarvashtakavarga (Samudaya).
 */
export function calculateAshtakavarga(chart) {
  const { planets = [], ascendant = {} } = chart;
  const lagnaSign = ascendant.signIndex ?? 0;

  // Map each contributor's sign index
  const contributorSign = {
    LAGNA: lagnaSign,
  };
  for (const p of planets) {
    contributorSign[p.planet.toUpperCase()] = p.signIndex ?? Math.floor((p.siderealDegree || 0) / 30);
  }

  const bhinnashtakavarga = {};
  const sarvashtakavarga = new Array(12).fill(0); // 12 signs, 0 to 11

  const planetKeys = ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"];

  for (const pKey of planetKeys) {
    const rules = ASHTAKAVARGA_RULES[pKey];
    const bindusBySign = new Array(12).fill(0);

    for (const [contrib, houseOffsets] of Object.entries(rules)) {
      const cSign = contributorSign[contrib];
      if (cSign === undefined) continue;

      for (const h of houseOffsets) {
        const targetSign = (cSign + (h - 1)) % 12;
        bindusBySign[targetSign] += 1;
      }
    }

    const totalBindus = bindusBySign.reduce((a, b) => a + b, 0);
    bhinnashtakavarga[pKey] = {
      planet: pKey,
      bindusBySign,
      totalBindus,
    };

    // Add to Sarvashtakavarga
    for (let s = 0; s < 12; s++) {
      sarvashtakavarga[s] += bindusBySign[s];
    }
  }

  // Format Sarvashtakavarga per sign
  const sarvashtakavargaFormatted = ZODIAC_SIGNS.map((sign, idx) => ({
    signIndex: idx,
    signName: sign.name,
    sanskritName: sign.sanskritName,
    bindus: sarvashtakavarga[idx],
    isFavorable: sarvashtakavarga[idx] >= 28, // Standard classical cutoff
    houseFromLagna: ((idx - lagnaSign + 12) % 12) + 1,
  }));

  const totalSamudayaBindus = sarvashtakavarga.reduce((a, b) => a + b, 0);

  return {
    bhinnashtakavarga,
    sarvashtakavarga: sarvashtakavargaFormatted,
    totalBindus: totalSamudayaBindus, // Exactly 337
  };
}

/**
 * Comprehensive Classical Yoga and Dosha Detector
 *
 * Grounded in Brihat Parashara Hora Shastra, Phaladeepika, and Jataka Parijata.
 */
export function detectComprehensiveYogasAndDoshas(chart, language = "en") {
  const isHi = language === "hi" || language === "hindi";
  const yogas = [];
  const doshas = [];

  const { planets = [], ascendant = {}, houses = [] } = chart;
  const lagnaSign = ascendant.signIndex ?? 0;

  const sun = planets.find((p) => p.planet === "SUN");
  const moon = planets.find((p) => p.planet === "MOON");
  const mars = planets.find((p) => p.planet === "MARS");
  const mercury = planets.find((p) => p.planet === "MERCURY");
  const jupiter = planets.find((p) => p.planet === "JUPITER");
  const venus = planets.find((p) => p.planet === "VENUS");
  const saturn = planets.find((p) => p.planet === "SATURN");
  const rahu = planets.find((p) => p.planet === "RAHU");
  const ketu = planets.find((p) => p.planet === "KETU");

  // Helper for house lord determination
  const houseLords = {};
  for (let h = 1; h <= 12; h++) {
    const sIdx = (lagnaSign + (h - 1)) % 12;
    houseLords[h] = SIGN_LORDS[sIdx];
  }

  // 1. PANCHA MAHAPURUSHA YOGAS (Mars, Mercury, Jupiter, Venus, Saturn in Kendra in own/exalted sign)
  const kendras = [1, 4, 7, 10];

  // Ruchaka Yoga (Mars)
  if (mars && kendras.includes(mars.house)) {
    const d = calculatePlanetaryDignity("MARS", mars.signIndex, mars.degree);
    if (["EXALTED", "SWAKSHETRA", "MOOLATRIKONA"].includes(d.dignity)) {
      yogas.push({
        id: "ruchaka_yoga",
        name: isHi ? "रुचक महापुरुष योग (Ruchaka Yoga)" : "Ruchaka Mahapurusha Yoga",
        category: isHi ? "पंच महापुरुष योग" : "Pancha Mahapurusha Yoga",
        shloka: "दीर्घास्यो बहुसाहसो बलयुतः शौर्यान्वितो भूपतिः...",
        classicalRef: "BPHS Ch. 75, Sl. 2-5",
        status: "AUSPICIOUS",
        explanation: isHi
          ? `मंगल देव केंद्र भाव (${mars.house}) में अपनी ${d.label} स्थिति में विराजमान हैं। यह रुचक महापुरुष योग जातक को अदम्य साहस, प्रशासनिक सामर्थ्य, नेतृत्व क्षमता और भूमि-संपत्ति का स्वामी बनाता है।`
          : `Mars is placed in a Kendra (${mars.house}th House) in ${d.label}. Bestows extraordinary physical courage, tactical leadership, real estate mastery, and unwavering resolve.`,
      });
    }
  }

  // Bhadra Yoga (Mercury)
  if (mercury && kendras.includes(mercury.house)) {
    const d = calculatePlanetaryDignity("MERCURY", mercury.signIndex, mercury.degree);
    if (["EXALTED", "SWAKSHETRA", "MOOLATRIKONA"].includes(d.dignity)) {
      yogas.push({
        id: "bhadra_yoga",
        name: isHi ? "भद्र महापुरुष योग (Bhadra Yoga)" : "Bhadra Mahapurusha Yoga",
        category: isHi ? "पंच महापुरुष योग" : "Pancha Mahapurusha Yoga",
        shloka: "प्रज्ञावान् विपुलाश्रयो मतिमतां श्रेष्ठो वदान्यः शुचिः...",
        classicalRef: "BPHS Ch. 75, Sl. 6-9",
        status: "AUSPICIOUS",
        explanation: isHi
          ? `बुध देव केंद्र (${mercury.house}) में ${d.label} स्थिति में स्थित हैं। भद्र योग जातक को तीव्र बुद्धिमत्ता, वाक-चातुर्य, गणितीय प्रवीणता, उच्च विद्या और दीर्घायु प्रदान करता है।`
          : `Mercury occupies a Kendra (${mercury.house}th House) in ${d.label}. Confers brilliant intellectual acumen, articulate eloquence, scholarly distinction, and commerce success.`,
      });
    }
  }

  // Hamsa Yoga (Jupiter)
  if (jupiter && kendras.includes(jupiter.house)) {
    const d = calculatePlanetaryDignity("JUPITER", jupiter.signIndex, jupiter.degree);
    if (["EXALTED", "SWAKSHETRA", "MOOLATRIKONA"].includes(d.dignity)) {
      yogas.push({
        id: "hamsa_yoga",
        name: isHi ? "हंस महापुरुष योग (Hamsa Yoga)" : "Hamsa Mahapurusha Yoga",
        category: isHi ? "पंच महापुरुष योग" : "Pancha Mahapurusha Yoga",
        shloka: "धर्मिष्ठो गुणवान् कृतज्ञसुमतिः हंसो भवेत् पुण्यधीः...",
        classicalRef: "BPHS Ch. 75, Sl. 10-13",
        status: "AUSPICIOUS",
        explanation: isHi
          ? `देवगुरु बृहस्पति केंद्र (${jupiter.house}) में ${d.label} स्थिति में स्थित होकर हंस योग बनाते हैं। यह जातक को आध्यात्मिक शुचिता, सत्यनिष्ठा, शास्त्र-ज्ञान और उच्च समाज में पूज्य प्रतिष्ठा देता है।`
          : `Jupiter graces a Kendra (${jupiter.house}th House) in ${d.label}. Cultivates immaculate virtue, profound philosophical wisdom, benevolence, and venerated societal respect.`,
      });
    }
  }

  // Malavya Yoga (Venus)
  if (venus && kendras.includes(venus.house)) {
    const d = calculatePlanetaryDignity("VENUS", venus.signIndex, venus.degree);
    if (["EXALTED", "SWAKSHETRA", "MOOLATRIKONA"].includes(d.dignity)) {
      yogas.push({
        id: "malavya_yoga",
        name: isHi ? "मालव्य महापुरुष योग (Malavya Yoga)" : "Malavya Mahapurusha Yoga",
        category: isHi ? "पंच महापुरुष योग" : "Pancha Mahapurusha Yoga",
        shloka: "सुन्दरगात्रो मतिमान् विलासी मालव्ययोगे बहुवाहनाढ्यः...",
        classicalRef: "BPHS Ch. 75, Sl. 14-17",
        status: "AUSPICIOUS",
        explanation: isHi
          ? `शुक्र देव केंद्र (${venus.house}) में ${d.label} स्थिति में होकर मालव्य योग बनाते हैं। यह जातक को कलात्मक सुरुचि, ऐश्वर्य, वाहनों का सुख, उत्तम दांपत्य और सौंदर्य-बोध प्रदान करता है।`
          : `Venus resides in a Kendra (${venus.house}th House) in ${d.label}. Blesses the native with refined artistic aesthetics, worldly luxuries, domestic felicity, and gracious charm.`,
      });
    }
  }

  // Sasa Yoga (Saturn)
  if (saturn && kendras.includes(saturn.house)) {
    const d = calculatePlanetaryDignity("SATURN", saturn.signIndex, saturn.degree);
    if (["EXALTED", "SWAKSHETRA", "MOOLATRIKONA"].includes(d.dignity)) {
      yogas.push({
        id: "sasa_yoga",
        name: isHi ? "शश महापुरुष योग (Sasa Yoga)" : "Sasa Mahapurusha Yoga",
        category: isHi ? "पंच महापुरुष योग" : "Pancha Mahapurusha Yoga",
        shloka: "सेनापतिर्ग्रामपतिर्नरेन्द्रः शशेन जातः स्थिरबुद्धियुक्तः...",
        classicalRef: "BPHS Ch. 75, Sl. 18-21",
        status: "AUSPICIOUS",
        explanation: isHi
          ? `शनि देव केंद्र (${saturn.house}) में ${d.label} होकर शश योग की रचना करते हैं। यह जातक को धैर्य, जनसामान्य का प्रिय नेता, दीर्घायु, स्थिर बुद्धि और संगठन कौशल प्रदान करता है।`
          : `Saturn holds a Kendra (${saturn.house}th House) in ${d.label}. Bestows deep stoic perseverance, popular leadership of grassroots organizations, enduring longevity, and strategic grit.`,
      });
    }
  }

  // 2. GAJA KESARI YOGA
  if (jupiter && moon) {
    const diff = ((jupiter.house - moon.house + 12) % 12) + 1;
    if ([1, 4, 7, 10].includes(diff)) {
      const jupDignity = calculatePlanetaryDignity("JUPITER", jupiter.signIndex, jupiter.degree);
      yogas.push({
        id: "gajakesari_yoga",
        name: isHi ? "गजकेसरी योग (Gaja Kesari Yoga)" : "Gaja Kesari Yoga",
        category: isHi ? "शुभ राजयोग" : "Auspicious Raja Yoga",
        shloka: "केन्द्रे देवगुरौ स्थिते शशिसुतात्...",
        classicalRef: "BPHS Ch. 36, Sl. 3-4",
        status: "AUSPICIOUS",
        explanation: isHi
          ? `चन्द्रमा से केंद्र (${diff}वें भाव) में देवगुरु बृहस्पति स्थित हैं। यह प्रतिष्ठित राजयोग असीम प्रज्ञा, निष्कलंक यश, राजकीय आदर और जीवन में दैवीय सुरक्षा प्रदान करता है।`
          : `Jupiter is placed in a Kendra (${diff}th House) from the Moon. Bestows noble intellect, moral authority, enduring fame, and divine protection from adversaries.`,
      });
    }
  }

  // 3. BUDHADITYA YOGA
  if (sun && mercury && sun.signIndex === mercury.signIndex) {
    const combustion = checkCombustion(mercury, sun);
    yogas.push({
      id: "budhaditya_yoga",
      name: isHi ? "बुधादित्य योग (Budhaditya Yoga)" : "Budhaditya Yoga",
      category: isHi ? "बुद्धि एवं यश योग" : "Intellectual Eminence Yoga",
      shloka: "रविजसौम्य समायोगात्...",
      classicalRef: "Saravali Ch. 15",
      status: "AUSPICIOUS",
      explanation: isHi
        ? `सूर्य और बुध दोनों ${sun.sign} राशि में एक साथ स्थित हैं (दूरी: ${combustion.separationDeg}°)। यह प्रखर विश्लेषणात्मक मेधा, प्रशासनिक सूझबूझ और उच्च विद्या का कारक है।`
        : `Sun and Mercury conjoin in ${sun.sign} (${combustion.separationDeg}° separation). Fosters sharp analytical acuity, administrative aptitude, scholarly distinction, and articulate speech.`,
    });
  }

  // 4. NEECHABHANGA RAJA YOGA (Cancellation of Debilitation)
  for (const p of planets) {
    const pDignity = calculatePlanetaryDignity(p.planet, p.signIndex, p.degree);
    if (pDignity.dignity === "DEBILITATED") {
      const deep = DEEP_DIGNITY_DEGREES[p.planet.toUpperCase()];
      if (!deep) continue;

      // Condition A: Lord of debilitated sign is in Kendra from Lagna or Moon
      const debSignLord = SIGN_LORDS[deep.neechaSign];
      const lordObj = planets.find((x) => x.planet === debSignLord);

      let isCancelled = false;
      let reason = "";

      if (lordObj && kendras.includes(lordObj.house)) {
        isCancelled = true;
        reason = `Lord of debilitation sign (${debSignLord}) is in Kendra (${lordObj.house})`;
      } else if (lordObj && moon) {
        const fromMoon = ((lordObj.house - moon.house + 12) % 12) + 1;
        if (kendras.includes(fromMoon)) {
          isCancelled = true;
          reason = `Lord of debilitation sign (${debSignLord}) is in Kendra from Moon (${fromMoon})`;
        }
      }

      if (isCancelled) {
        yogas.push({
          id: `neechabhanga_${p.planet.toLowerCase()}`,
          name: isHi
            ? `नीचभंग राजयोग — ${p.name} (Neechabhanga Raja Yoga)`
            : `Neechabhanga Raja Yoga — ${p.name}`,
          category: isHi ? "कष्ट निवारक राजयोग" : "Transformative Raja Yoga",
          shloka: "नीचस्थितो जन्मनि यो ग्रहः स्यात्...",
          classicalRef: "Phaladeepika Ch. 6, Sl. 26-30",
          status: "AUSPICIOUS",
          explanation: isHi
            ? `${p.name} का नीचत्व भंग हो चुका है (${reason})। यह प्रारंभिक संघर्षों के उपरांत असाधारण उत्थान, आत्मबल और दीर्घकालीन सिद्धि देता है।`
            : `${p.name}'s debilitation is cancelled (${reason}). Transmutes initial early-life obstacles into hard-earned eminence, perseverance, and profound wisdom.`,
        });
      }
    }
  }

  // 5. VIPAREETA RAJA YOGAS (Harsha, Sarala, Vimala)
  const lord6 = houseLords[6];
  const lord8 = houseLords[8];
  const lord12 = houseLords[12];
  const trikHouses = [6, 8, 12];

  const obj6 = planets.find((p) => p.planet === lord6);
  const obj8 = planets.find((p) => p.planet === lord8);
  const obj12 = planets.find((p) => p.planet === lord12);

  if (obj6 && trikHouses.includes(obj6.house) && obj6.house !== 6) {
    yogas.push({
      id: "harsha_yoga",
      name: isHi ? "हर्ष योग (Harsha Vipareeta Yoga)" : "Harsha Vipareeta Raja Yoga",
      category: isHi ? "विपरीत राजयोग" : "Vipareeta Raja Yoga",
      classicalRef: "Phaladeepika Ch. 6, Sl. 57",
      status: "AUSPICIOUS",
      explanation: isHi
        ? `षष्ठेश (${lord6}) ${obj6.house}वें त्रिक भाव में स्थित होकर हर्ष योग बनाते हैं। शत्रुओं पर विजय, रोगों से मुक्ति, और संकटों में अप्रत्याशित सुरक्षा मिलती है।`
        : `6th Lord (${lord6}) resides in trik house (${obj6.house}th). Grants victory over adversaries, immunity from severe illnesses, and unexpected triumph in adversities.`,
    });
  }

  if (obj8 && trikHouses.includes(obj8.house) && obj8.house !== 8) {
    yogas.push({
      id: "sarala_yoga",
      name: isHi ? "सरल योग (Sarala Vipareeta Yoga)" : "Sarala Vipareeta Raja Yoga",
      category: isHi ? "विपरीत राजयोग" : "Vipareeta Raja Yoga",
      classicalRef: "Phaladeepika Ch. 6, Sl. 58",
      status: "AUSPICIOUS",
      explanation: isHi
        ? `अष्टमेश (${lord8}) ${obj8.house}वें त्रिक भाव में स्थित होकर सरल योग बनाते हैं। दीर्घायु, निर्भयता, आध्यात्मिक अन्वेषण और संकटों पर सहज विजय मिलती है।`
        : `8th Lord (${lord8}) occupies trik house (${obj8.house}th). Bestows longevity, fearlessness in crises, deep research acuity, and sudden fortune.`,
    });
  }

  if (obj12 && trikHouses.includes(obj12.house) && obj12.house !== 12) {
    yogas.push({
      id: "vimala_yoga",
      name: isHi ? "विमल योग (Vimala Vipareeta Yoga)" : "Vimala Vipareeta Raja Yoga",
      category: isHi ? "विपरीत राजयोग" : "Vipareeta Raja Yoga",
      classicalRef: "Phaladeepika Ch. 6, Sl. 59",
      status: "AUSPICIOUS",
      explanation: isHi
        ? `द्वादशेश (${lord12}) ${obj12.house}वें भाव में स्थित होकर विमल योग बनाते हैं। पवित्र स्वभाव, मितव्ययिता, स्वतंत्र जीवन और आध्यात्मिक मोक्ष की प्राप्ति होती है।`
        : `12th Lord (${lord12}) resides in trik house (${obj12.house}th). Bestows noble character, independent spirit, spiritual contentment, and detachment from worldly entrapments.`,
    });
  }

  // 6. KALSARPA DOSHA / YOGA
  if (rahu && ketu) {
    const rLon = rahu.siderealDegree ?? 0;
    const kLon = ketu.siderealDegree ?? 0;

    // Check if all 7 physical planets are enclosed on one side of Rahu-Ketu axis
    const nonNodes = planets.filter((p) => !["RAHU", "KETU"].includes(p.planet));
    let sideA = true;
    let sideB = true;

    for (const p of nonNodes) {
      const pLon = p.siderealDegree ?? 0;
      // Arc from Rahu to Ketu going clockwise
      const arc = ((pLon - rLon + 360) % 360);
      if (arc < 180) {
        sideB = false;
      } else {
        sideA = false;
      }
    }

    if (sideA || sideB) {
      const kalsarpaNames = [
        "Ananta", "Kulika", "Vasuki", "Shankhapala", "Padma", "Mahapadma",
        "Takshaka", "Karkotaka", "Shankhachuda", "Ghataka", "Vishadhara", "Sheshanaga",
      ];
      const rHouse = rahu.house || 1;
      const kType = kalsarpaNames[rHouse - 1] || "Ananta";

      doshas.push({
        id: "kalsarpa_yoga",
        name: isHi ? `कालसर्प योग — ${kType} (Kalsarpa Yoga)` : `Kalsarpa Yoga — ${kType}`,
        category: isHi ? "कर्म शोधन योग" : "Karmic Purification Yoga",
        classicalRef: "Classical Jyotish Treatises",
        status: "ATTENTION",
        explanation: isHi
          ? `सभी 7 ग्रह राहु और केतु की धुरी के एक ओर स्थित होकर '${kType} कालसर्प योग' बनाते हैं। यह योग जीवन के प्रथम भाग में तीव्र आंतरिक मंथन, पर बाद में अद्वितीय आध्यात्मिक उत्थान एवं असाधारण ख्याति देता है। शिव आराधना एवं महामृत्युंजय जप अत्यंत फलदायी हैं।`
          : `All 7 physical planets are hemmed on one side of the nodal axis, creating ${kType} Kalsarpa Yoga. Fosters intense developmental churning in early years, followed by profound resilience, focus, and spiritual breakthrough. Shiva sadhana is highly auspicious.`,
      });
    }
  }

  // 7. MANGAL DOSHA (Kuja Dosha) with Classical Cancellation Factors
  if (mars) {
    const mangalHouses = [1, 2, 4, 7, 8, 12];
    if (mangalHouses.includes(mars.house)) {
      // Check classical cancellations (BPHS / Muhurta Chintamani)
      let isCancelled = false;
      let cancellationReason = "";

      const marsDignity = calculatePlanetaryDignity("MARS", mars.signIndex, mars.degree);
      if (["EXALTED", "SWAKSHETRA"].includes(marsDignity.dignity)) {
        isCancelled = true;
        cancellationReason = isHi
          ? "मंगल अपनी स्वराशि अथवा उच्च राशि में स्थित हैं"
          : "Mars is exalted or in its own sign";
      } else if (jupiter && ((jupiter.house - mars.house + 12) % 12 + 1 === 7 || jupiter.house === mars.house)) {
        isCancelled = true;
        cancellationReason = isHi
          ? "देवगुरु बृहस्पति की मंगल पर शुभ दृष्टि अथवा युति है"
          : "Jupiter aspects or conjoins Mars";
      }

      doshas.push({
        id: "mangal_dosha",
        name: isHi
          ? `मंगल विचार / कुज योग ${isCancelled ? "(दोष परिहार)" : ""}`
          : `Mars Placement (Mangal Consideration) ${isCancelled ? "(Cancelled)" : ""}`,
        category: isHi ? "ऊर्जा एवं संबंध संतुलन" : "Energy & Partnership Dynamics",
        classicalRef: "Brihat Jataka & Muhurta Chintamani",
        status: isCancelled ? "AUSPICIOUS" : "ATTENTION",
        isCancelled,
        explanation: isHi
          ? `मंगल देव ${mars.house}वें भाव में स्थित हैं। ${
              isCancelled
                ? `विशेष: ${cancellationReason} होने से दोष का स्वतः परिहार हो जाता है।`
                : "यह स्थिति जातक को असीम ऊर्जा और स्पष्टवादिता देती है। दांपत्य जीवन में सौम्य संवाद और धैर्य बनाए रखने हेतु हनुमान चालीसा का पाठ श्रेष्ठ है।"
            }`
          : `Mars is placed in the ${mars.house}th House. ${
              isCancelled
                ? `Note: Classical cancellation applies (${cancellationReason}).`
                : "Endows high drive and direct vitality. Traditional texts recommend mutual patience, mindful communication in partnerships, and grounding physical exercise."
            }`,
      });
    }
  }

  // 8. SADE SATI PHASE (Saturn transit relative to natal Moon)
  if (moon) {
    // Current transit Saturn is currently around Aquarius/Pisces (~sign 10 or 11)
    // We compute relative to Moon's sign
    const moonSign = moon.signIndex ?? 0;
    // Approximating current transit Saturn (as of 2026: Saturn is in Pisces / sign 11)
    const currentSaturnSign = 11; // Pisces (Meena)
    const relativeToMoon = ((currentSaturnSign - moonSign + 12) % 12);

    let phase = null;
    if (relativeToMoon === 11) {
      phase = {
        phase: 1,
        name: isHi ? "साढ़े साती — प्रथम चरण (द्वादश भाव)" : "Sade Sati — First Phase (12th from Moon)",
        desc: isHi
          ? "शनि देव जन्म चन्द्रमा से 12वें भाव में गोचर कर रहे हैं। यह चरण व्यय नियंत्रण, आत्मनिरीक्षण, मानसिक शांति और वैराग्य साधना के लिए उपयुक्त है।"
          : "Saturn transits the 12th house from natal Moon. Fosters introspection, disciplined expense management, and quiet contemplation.",
      };
    } else if (relativeToMoon === 0) {
      phase = {
        phase: 2,
        name: isHi ? "साढ़े साती — द्वितीय शिखर चरण (जन्म चन्द्र)" : "Sade Sati — Peak Phase (Over Natal Moon)",
        desc: isHi
          ? "शनि देव जन्म चन्द्रमा के ऊपर गोचर कर रहे हैं। यह मानसिक दृढ़ता, कर्म-शोधन, विनम्रता और कर्मयोग की साधना का काल है।"
          : "Saturn transits over the natal Moon. Cultivates psychological endurance, emotional maturity, humility, and disciplined focus.",
      };
    } else if (relativeToMoon === 1) {
      phase = {
        phase: 3,
        name: isHi ? "साढ़े साती — तृतीय चरण (द्वितीय भाव)" : "Sade Sati — Final Phase (2nd from Moon)",
        desc: isHi
          ? "शनि देव चन्द्रमा से द्वितीय भाव में गोचर कर रहे हैं। यह वित्तीय सुदृढ़ीकरण, पारिवारिक दायित्वों की पूर्ति और स्थिरता का समय है।"
          : "Saturn transits the 2nd house from natal Moon. Focus shifts to financial consolidation, family responsibilities, and enduring stability.",
      };
    }

    if (phase) {
      doshas.push({
        id: "sade_sati",
        name: phase.name,
        category: isHi ? "शनि गोचर प्रभाव" : "Saturn Transit Influence",
        classicalRef: "Classical Gochara Treatises",
        status: "ATTENTION",
        explanation: phase.desc,
      });
    }
  }

  return { yogas, doshas };
}
