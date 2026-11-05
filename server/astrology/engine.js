/**
 * Unified Astrology Calculation Engine
 * 
 * Coordinates input validation, astronomical calculations, Lahiri Ayanamsa, 
 * Bhavas, 16 Divisional Charts (Shodashavarga), 3-tier Vimshottari Dasha,
 * Shadbala (6 Balas), Ashtakavarga (337 bindus), and Classical Yogas/Doshas.
 */

import * as Astronomy from "astronomy-engine";
import { validateBirthDetails } from "./validation.js";
import {
  computeLahiriAyanamsa,
  computeAscendant,
  computeGrahaPositions,
  buildHouses,
} from "./calculations.js";
import { AYANAMSA_TYPE } from "./constants.js";
import { computeAllDivisionalCharts } from "./divisionalCharts.js";
import { computeComprehensiveVimshottari } from "./dashaEngine.js";
import {
  calculatePlanetaryDignity,
  checkCombustion,
  calculateShadbala,
  calculateAshtakavarga,
  detectComprehensiveYogasAndDoshas,
} from "./planetaryStrengths.js";

/**
 * Calculates a complete Vedic birth chart deterministically from birth details.
 * 
 * @param {Object} input - Raw user birth details
 * @returns {Object} Complete birth chart result
 */
export function calculateBirthChart(input = {}) {
  const validation = validateBirthDetails(input);
  if (!validation.isValid) {
    const err = new Error(`Invalid birth details: ${validation.errors.join("; ")}`);
    err.validationErrors = validation.errors;
    err.statusCode = 400;
    throw err;
  }

  const norm = validation.normalized;
  const astroTime = Astronomy.MakeTime(norm.utcDate);

  // 1. Lahiri Ayanamsa
  const ayanamsaVal = computeLahiriAyanamsa(astroTime);

  // 2. Ascendant (Lagna)
  const ascendant = computeAscendant(astroTime, norm.latitude, norm.longitude, ayanamsaVal);

  // 3. Planetary positions (9 Grahas)
  const rawPlanets = computeGrahaPositions(astroTime, ayanamsaVal, ascendant.signIndex);

  // 4. Sun & Moon details
  const sun = rawPlanets.find((p) => p.planet === "SUN");
  const moon = rawPlanets.find((p) => p.planet === "MOON");

  // 5. Enrich planets with Dignity and Combustion
  const planets = rawPlanets.map((p) => {
    const dignity = calculatePlanetaryDignity(p.planet, p.signIndex, p.degree);
    const combustion = checkCombustion(p, sun);
    return {
      ...p,
      dignity: dignity.dignity,
      dignityLabel: dignity.label,
      dignityScore: dignity.score,
      isCombust: combustion.isCombust,
      combustionSeparation: combustion.separationDeg,
    };
  });

  // 6. 12 Houses (Bhavas)
  const houses = buildHouses(ascendant.signIndex, planets);

  // 7. Base chart reference for advanced calculations
  const baseChartObj = {
    ascendant: {
      sign: ascendant.sign.name,
      sanskritSign: ascendant.sign.sanskritName,
      signIndex: ascendant.signIndex,
      degree: parseFloat(ascendant.degreeInSign.toFixed(4)),
      siderealTotalDegree: parseFloat(ascendant.siderealDegree.toFixed(4)),
      nakshatra: ascendant.nakshatra.name,
      sanskritNakshatra: ascendant.nakshatra.devanagari,
      pada: ascendant.pada,
      signLord: ascendant.sign.lord,
    },
    moon: {
      sign: moon.sign,
      sanskritSign: moon.sanskritSign,
      signIndex: moon.signIndex,
      degree: moon.degree,
      siderealDegree: moon.siderealDegree,
      nakshatra: moon.nakshatra,
      sanskritNakshatra: moon.sanskritNakshatra,
      pada: moon.pada,
      signLord: moon.signLord,
    },
    planets,
    houses,
  };

  // 8. Comprehensive Vimshottari Dasha (3 tiers: Mahadasha, Antardasha, Pratyantardasha)
  const dasha = computeComprehensiveVimshottari(moon.siderealDegree, norm.utcDate);

  // 9. All 16 Divisional Charts (Shodashavarga D1-D60)
  const divisionalCharts = computeAllDivisionalCharts(baseChartObj);

  // 10. Shadbala (6 Balas + Rupas + Minimum Requirements)
  const shadbala = calculateShadbala(baseChartObj);

  // 11. Ashtakavarga & Sarvashtakavarga (337 bindus across 12 signs)
  const ashtakavarga = calculateAshtakavarga(baseChartObj);

  // 12. Comprehensive Classical Yogas & Doshas
  const yogasAndDoshas = detectComprehensiveYogasAndDoshas(baseChartObj, norm.language);

  // 13. Extract key astrological factors for classical manuscript retrieval
  const chartFactors = [];
  chartFactors.push(`Lagna in ${ascendant.sign.name}`);
  chartFactors.push(`Lagna in ${ascendant.nakshatra.name} Nakshatra`);
  chartFactors.push(`Moon in ${moon.sign}`);
  chartFactors.push(`Moon in ${moon.nakshatra} Nakshatra`);
  chartFactors.push(`Current Mahadasha of ${dasha.activeDasha.mahadasha}`);
  chartFactors.push(`Current Antardasha of ${dasha.activeDasha.antardasha}`);

  for (const p of planets) {
    chartFactors.push(`${p.name} in ${p.sign}`);
    chartFactors.push(`${p.name} in House ${p.house}`);
    if (p.dignityLabel) {
      chartFactors.push(`${p.name} ${p.dignityLabel}`);
    }
    if (p.isCombust) {
      chartFactors.push(`${p.name} Combust (अस्त)`);
    }
    if (p.retrograde && !["RAHU", "KETU"].includes(p.planet)) {
      chartFactors.push(`${p.name} Retrograde (Vakri)`);
    }
  }

  for (const y of yogasAndDoshas.yogas) {
    chartFactors.push(`Yoga: ${y.name}`);
  }
  for (const d of yogasAndDoshas.doshas) {
    chartFactors.push(`Dosha: ${d.name}`);
  }

  return {
    profile: {
      name: norm.name,
      birthDate: norm.birthDate,
      birthTime: norm.birthTime,
      birthPlace: norm.birthPlace,
      latitude: norm.latitude,
      longitude: norm.longitude,
      timezone: norm.timezone,
      gender: norm.gender,
      language: norm.language,
      utcDate: norm.utcDate.toISOString(),
    },
    ascendant: baseChartObj.ascendant,
    moon: baseChartObj.moon,
    planets,
    houses,
    dasha: {
      currentMahadasha: dasha.activeDasha.mahadasha,
      currentAntardasha: dasha.activeDasha.antardasha,
      currentPratyantardasha: dasha.activeDasha.pratyantardasha,
      activeDasha: dasha.activeDasha,
      balanceText: dasha.balanceText,
      balanceYears: dasha.balanceYears,
      timeline: dasha.timeline,
    },
    divisionalCharts,
    shadbala,
    ashtakavarga,
    yogasAndDoshas,
    calculation: {
      ayanamsa: AYANAMSA_TYPE,
      ayanamsaValue: parseFloat(ayanamsaVal.toFixed(4)),
      calculationEngine: "astronomy-engine",
      engineVersion: "2.0.0",
      houseSystem: "Whole Sign",
      shodashavargaIncluded: true,
      shadbalaIncluded: true,
      ashtakavargaTotalBindus: ashtakavarga.totalBindus,
    },
    chartFactors,
  };
}
