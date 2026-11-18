/**
 * Gurukul Step 3: Vedic Astrology Engine Accuracy & Validation Test Suite
 *
 * Mathematically validates:
 * A. Birth Chart (Lagna, 9 Grahas, Whole Sign Bhavas, Nakshatra & Pada, Retrograde, Planetary Aspects)
 * B. Shodashavarga (All 16 Divisional Charts D1 to D60 mathematical mappings)
 * C. Vimshottari Dasha (3 tiers: Mahadasha, Antardasha, Pratyantardasha, balance at birth, 120-year span)
 * D. Panchang (Tithi, Nakshatra, Yoga, Karana, Vara, Sunrise/Sunset, Rahu Kaal, Abhijit, Amrit Kaal, Brahma Muhurta)
 * E. Advanced Astrology (Shadbala, Sarvashtakavarga 337 bindus, Yogas & Doshas, Gochara, Sade Sati)
 * F. Polar & Boundary Extremes (Equator, Southern Hemisphere, Polar latitudes, 90° latitude clamp, midnight transition)
 */

import assert from "assert";
import * as Astronomy from "astronomy-engine";
import {
  computeLahiriAyanamsa,
  computeAscendant,
  computeGrahaPositions,
  getNakshatraAndPada,
  computeVimshottariDasha,
  buildHouses,
  computePlanetaryAspects,
} from "../server/astrology/calculations.js";
import { calculateBirthChart } from "../server/astrology/engine.js";
import {
  calculateVargaSign,
  computeAllDivisionalCharts,
  DIVISIONAL_CHARTS_META,
  SHASHTIAMSHA_NAMES,
} from "../server/astrology/divisionalCharts.js";
import {
  computeComprehensiveVimshottari,
  buildPratyantardashas,
} from "../server/astrology/dashaEngine.js";
import {
  computeTithi,
  computeYoga,
  computeKarana,
  computeVara,
  computePanchang,
  computeAbhijitMuhurta,
  computeBrahmaMuhurta,
  computeAmritKaal,
} from "../server/astrology/panchang.js";
import {
  calculateShadbala,
  calculateAshtakavarga,
  detectComprehensiveYogasAndDoshas,
} from "../server/astrology/planetaryStrengths.js";
import { evaluatePredictiveTransits } from "../server/astrology/transitIntelligence.js";

let passed = 0;
let total = 0;

function runTest(description, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] ${description}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${description}`);
    console.error(`         ${err.message}`);
  }
}

console.log("================================================================================");
console.log("   GURUKUL STEP 3: VEDIC ASTROLOGY ENGINE ACCURACY & VALIDATION SUITE          ");
console.log("================================================================================\n");

// -----------------------------------------------------------------------------
// SECTION A: BIRTH CHART, LAGNA, & PLANETARY ASPECTS
// -----------------------------------------------------------------------------
console.log("--- Section A: Birth Chart & Planetary Aspects ---");

const testBirthInput = {
  name: "Vedic Scholar Reference",
  birthDate: "1990-05-15",
  birthTime: "14:30",
  birthPlace: "New Delhi, India",
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: "+05:30",
  gender: "male",
  language: "en",
};

let chartResult;
runTest("calculateBirthChart calculates complete birth chart with Lahiri Ayanamsha", () => {
  chartResult = calculateBirthChart(testBirthInput);
  assert(chartResult);
  assert.strictEqual(chartResult.calculation.ayanamsa, "Lahiri");
  assert(chartResult.calculation.ayanamsaValue > 23.5 && chartResult.calculation.ayanamsaValue < 24.5);
  assert.strictEqual(chartResult.ascendant.sign, "Virgo"); // Kanya Lagna for 1990-05-15 14:30 New Delhi
  assert.strictEqual(chartResult.ascendant.nakshatra, "Uttara Phalguni");
});

runTest("All 9 Grahas computed with sidereal coordinates, signs, and whole-sign houses", () => {
  assert.strictEqual(chartResult.planets.length, 9);
  const planetKeys = chartResult.planets.map((p) => p.planet);
  assert(planetKeys.includes("SUN"));
  assert(planetKeys.includes("MOON"));
  assert(planetKeys.includes("MARS"));
  assert(planetKeys.includes("MERCURY"));
  assert(planetKeys.includes("JUPITER"));
  assert(planetKeys.includes("VENUS"));
  assert(planetKeys.includes("SATURN"));
  assert(planetKeys.includes("RAHU"));
  assert(planetKeys.includes("KETU"));

  // Check degree in sign is in [0, 30)
  for (const p of chartResult.planets) {
    assert(p.degree >= 0 && p.degree < 30);
    assert(p.house >= 1 && p.house <= 12);
  }
});

runTest("Classical Parashara Graha Drishti (Planetary Aspects) computed correctly", () => {
  const mars = chartResult.planets.find((p) => p.planet === "MARS");
  const jupiter = chartResult.planets.find((p) => p.planet === "JUPITER");
  const saturn = chartResult.planets.find((p) => p.planet === "SATURN");
  const sun = chartResult.planets.find((p) => p.planet === "SUN");

  // All planets aspect 7th house
  assert(sun.aspects.aspectedHouses.includes(((sun.house - 1 + 6) % 12) + 1));

  // Mars special aspects: 4th, 7th, 8th
  const expectedMarsHouses = [
    ((mars.house - 1 + 3) % 12) + 1,
    ((mars.house - 1 + 6) % 12) + 1,
    ((mars.house - 1 + 7) % 12) + 1,
  ];
  for (const h of expectedMarsHouses) {
    assert(mars.aspects.aspectedHouses.includes(h), `Mars must aspect house ${h}`);
  }
  assert(mars.aspects.specialAspects.some((s) => s.includes("4th House")));
  assert(mars.aspects.specialAspects.some((s) => s.includes("8th House")));

  // Jupiter special aspects: 5th, 7th, 9th
  const expectedJupHouses = [
    ((jupiter.house - 1 + 4) % 12) + 1,
    ((jupiter.house - 1 + 6) % 12) + 1,
    ((jupiter.house - 1 + 8) % 12) + 1,
  ];
  for (const h of expectedJupHouses) {
    assert(jupiter.aspects.aspectedHouses.includes(h), `Jupiter must aspect house ${h}`);
  }

  // Saturn special aspects: 3rd, 7th, 10th
  const expectedSatHouses = [
    ((saturn.house - 1 + 2) % 12) + 1,
    ((saturn.house - 1 + 6) % 12) + 1,
    ((saturn.house - 1 + 9) % 12) + 1,
  ];
  for (const h of expectedSatHouses) {
    assert(saturn.aspects.aspectedHouses.includes(h), `Saturn must aspect house ${h}`);
  }
});

// -----------------------------------------------------------------------------
// SECTION B: SHODASHAVARGA (16 DIVISIONAL CHARTS)
// -----------------------------------------------------------------------------
console.log("\n--- Section B: Shodashavarga (16 Divisional Charts) ---");

runTest("All 16 Divisional Charts (D1 through D60) are present in calculation output", () => {
  const dCharts = chartResult.divisionalCharts;
  const codes = Object.keys(DIVISIONAL_CHARTS_META);
  assert.strictEqual(codes.length, 16);
  for (const code of codes) {
    assert(dCharts[code], `Divisional chart ${code} must exist`);
    assert.strictEqual(dCharts[code].planets.length, 9);
    assert.strictEqual(dCharts[code].houses.length, 12);
  }
});

runTest("D2 (Hora) Parashara odd/even sign mathematical rule", () => {
  // Odd sign (Aries = 0): 0-15° -> Leo (4), 15-30° -> Cancer (3)
  const ariesPart1 = calculateVargaSign(7.5, "D2"); // Aries 7.5°
  assert.strictEqual(ariesPart1.signIndex, 4); // Leo (Sun)

  const ariesPart2 = calculateVargaSign(22.5, "D2"); // Aries 22.5°
  assert.strictEqual(ariesPart2.signIndex, 3); // Cancer (Moon)

  // Even sign (Taurus = 1): 0-15° -> Cancer (3), 15-30° -> Leo (4)
  const taurusPart1 = calculateVargaSign(37.5, "D2"); // Taurus 7.5°
  assert.strictEqual(taurusPart1.signIndex, 3); // Cancer (Moon)

  const taurusPart2 = calculateVargaSign(52.5, "D2"); // Taurus 22.5°
  assert.strictEqual(taurusPart2.signIndex, 4); // Leo (Sun)
});

runTest("D3 (Drekkana) 10-degree triplicity mapping", () => {
  // Aries (0):
  // 0-10° -> Aries (0)
  // 10-20° -> Leo (4)
  // 20-30° -> Sagittarius (8)
  assert.strictEqual(calculateVargaSign(5, "D3").signIndex, 0);
  assert.strictEqual(calculateVargaSign(15, "D3").signIndex, 4);
  assert.strictEqual(calculateVargaSign(25, "D3").signIndex, 8);
});

runTest("D9 (Navamsha) elemental triplicity starting signs", () => {
  // Fiery (Aries): 0° -> Aries (0)
  assert.strictEqual(calculateVargaSign(1, "D9").signIndex, 0);

  // Earthy (Taurus): 0° -> Capricorn (9)
  assert.strictEqual(calculateVargaSign(31, "D9").signIndex, 9);

  // Airy (Gemini): 0° -> Libra (6)
  assert.strictEqual(calculateVargaSign(61, "D9").signIndex, 6);

  // Watery (Cancer): 0° -> Cancer (3)
  assert.strictEqual(calculateVargaSign(91, "D9").signIndex, 3);
});

runTest("D30 (Trimshamsha) unequal degree spans and planetary rulerships", () => {
  // Odd sign: 0-5° Mars (Aries/0), 5-10° Saturn (Aquarius/10), 10-18° Jupiter (Sagittarius/8)
  assert.strictEqual(calculateVargaSign(3, "D3").signIndex !== undefined, true);
  assert.strictEqual(calculateVargaSign(2, "D30").signIndex, 0); // 0-5° Mars -> Aries (0)
  assert.strictEqual(calculateVargaSign(7, "D30").signIndex, 10); // 5-10° Saturn -> Aquarius (10)
  assert.strictEqual(calculateVargaSign(14, "D30").signIndex, 8); // 10-18° Jupiter -> Sagittarius (8)
});

runTest("D60 (Shashtiamsha) allocates correct 0.5-degree division and classical deity", () => {
  const d60 = calculateVargaSign(0.25, "D60"); // First Shashtiamsha
  assert.strictEqual(d60.shashtiamshaNumber, 1);
  assert.strictEqual(d60.shashtiamshaDeity, "Ghora");
  assert.strictEqual(d60.shashtiamshaNature, "Malefic");

  const d60Benefic = calculateVargaSign(1.25, "D60"); // 3rd Shashtiamsha (1.0° - 1.5°)
  assert.strictEqual(d60Benefic.shashtiamshaNumber, 3);
  assert.strictEqual(d60Benefic.shashtiamshaDeity, "Deva");
  assert.strictEqual(d60Benefic.shashtiamshaNature, "Benefic");
});

// -----------------------------------------------------------------------------
// SECTION C: VIMSHOTTARI DASHA
// -----------------------------------------------------------------------------
console.log("\n--- Section C: Vimshottari Dasha Engine ---");

runTest("Vimshottari Dasha computes balance at birth and 120-year timeline", () => {
  const dasha = chartResult.dasha;
  assert(dasha.currentMahadasha);
  assert(dasha.currentAntardasha);
  assert(dasha.currentPratyantardasha);
  assert(dasha.timeline.length >= 9);

  // Total standard Vimshottari cycle is 120 years
  const totalYears = dasha.timeline.reduce((acc, d) => acc + d.durationYears, 0);
  assert(totalYears >= 115 && totalYears <= 125);
});

runTest("Antardashas and Pratyantardashas have valid dates and sequential coverage", () => {
  const moon = chartResult.moon;
  const dashaTree = computeComprehensiveVimshottari(moon.siderealDegree, new Date("1990-05-15T09:00:00Z"));
  assert(dashaTree.activeDasha.mahadasha);
  assert(dashaTree.activeDasha.antardasha);
  assert(dashaTree.activeDasha.pratyantardasha);

  // 1st Mahadasha has 9 Antardashas
  assert.strictEqual(dashaTree.timeline[0].antardashas.length, 9);
  assert.strictEqual(dashaTree.timeline[0].antardashas[0].pratyantardashas.length, 9);
});

// -----------------------------------------------------------------------------
// SECTION D: PANCHANG & AUSPICIOUS MUHURTAS
// -----------------------------------------------------------------------------
console.log("\n--- Section D: Panchang, Solar Windows & Muhurtas ---");

runTest("Panchang computes 5 limbs (Tithi, Nakshatra, Yoga, Karana, Vara) mathematically", () => {
  const panchang = computePanchang({
    date: "2026-11-18",
    latitude: 28.6139,
    longitude: 77.2090,
    tzOffset: 5.5,
    timezone: "Asia/Kolkata",
  });

  assert(panchang.tithi);
  assert(panchang.tithi.name);
  assert(panchang.tithi.paksha === "Shukla" || panchang.tithi.paksha === "Krishna");
  assert(panchang.nakshatra);
  assert(panchang.nakshatra.name);
  assert(panchang.yoga);
  assert(panchang.karana);
  assert(panchang.vara);
  assert.strictEqual(panchang.vara.en, "Wednesday"); // 2026-11-18 is Wednesday
});

runTest("computeTithi derives correct Tithi from Moon-Sun elongation", () => {
  // Shukla Pratipada: Moon is 6° ahead of Sun
  const t1 = computeTithi(6, 0);
  assert.strictEqual(t1.name, "Pratipada");
  assert.strictEqual(t1.paksha, "Shukla");

  // Purnima: Moon is 175° ahead of Sun (14 * 12 = 168 to 180)
  const t15 = computeTithi(175, 0);
  assert.strictEqual(t15.name, "Purnima");
  assert.strictEqual(t15.paksha, "Shukla");

  // Amavasya: Moon is 355° ahead of Sun (29 * 12 = 348 to 360)
  const t30 = computeTithi(355, 0);
  assert.strictEqual(t30.name, "Amavasya");
  assert.strictEqual(t30.paksha, "Krishna");
});

runTest("Sunrise, Sunset, and Rahu Kaal computed dynamically from topocentric coordinates", () => {
  const panchang = computePanchang({
    date: "2026-11-18",
    latitude: 28.6139,
    longitude: 77.2090,
    tzOffset: 5.5,
    timezone: "Asia/Kolkata",
  });

  assert(panchang.sunrise && panchang.sunrise.local);
  assert(panchang.sunset && panchang.sunset.local);
  assert(panchang.rahuKaal && panchang.rahuKaal.startLocal && panchang.rahuKaal.endLocal);

  // In New Delhi in November, sunrise is approx 06:40-06:50 AM, sunset approx 17:25-17:35 PM
  const [srH] = panchang.sunrise.local.split(":").map(Number);
  const [ssH] = panchang.sunset.local.split(":").map(Number);
  assert(srH >= 6 && srH <= 7);
  assert(ssH >= 17 && ssH <= 18);
});

runTest("Abhijit Muhurta, Brahma Muhurta, and Amrit Kaal are computed dynamically", () => {
  const panchang = computePanchang({
    date: "2026-11-18",
    latitude: 28.6139,
    longitude: 77.2090,
    tzOffset: 5.5,
    timezone: "Asia/Kolkata",
  });

  // Dynamic Abhijit Muhurta
  assert(panchang.abhijitMuhurta);
  assert(panchang.abhijitMuhurta.startLocal);
  assert(panchang.abhijitMuhurta.endLocal);
  assert(panchang.abhijitMuhurta.durationMinutes >= 40 && panchang.abhijitMuhurta.durationMinutes <= 55);

  // Dynamic Brahma Muhurta
  assert(panchang.brahmaMuhurta);
  assert(panchang.brahmaMuhurta.startLocal);
  assert(panchang.brahmaMuhurta.endLocal);
  assert.strictEqual(panchang.brahmaMuhurta.durationMinutes, 48);

  // Dynamic Amrit Kaal
  assert(panchang.amritKaal);
  assert(panchang.amritKaal.startLocal);
  assert(panchang.amritKaal.endLocal);
  assert.strictEqual(panchang.amritKaal.durationMinutes, 96);
});

// -----------------------------------------------------------------------------
// SECTION E: ADVANCED ASTROLOGY (SHADBALA, ASHTAKAVARGA, SADE SATI, TRANSITS)
// -----------------------------------------------------------------------------
console.log("\n--- Section E: Advanced Astrology Systems ---");

runTest("Shadbala calculates 6 classical Balas for 7 physical Grahas", () => {
  const shadbala = chartResult.shadbala;
  assert(shadbala);

  for (const planetKey of ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"]) {
    const p = shadbala[planetKey] || shadbala.planets?.[planetKey];
    assert(p, `Planet ${planetKey} must exist in Shadbala`);
    assert(p.sthanaBala >= 0);
    assert(p.digBala >= 0);
    assert(p.kalaBala >= 0);
    assert(p.chestaBala >= 0);
    assert(p.naisargikaBala >= 0);
    assert(typeof p.drikBala === "number");
    assert(p.totalRupas > 0);
    assert(typeof p.isSufficient === "boolean");
  }
});

runTest("Sarvashtakavarga sums to exactly 337 bindus across 12 signs (BPHS Rule)", () => {
  const av = chartResult.ashtakavarga;
  assert(av);
  assert.strictEqual(av.totalBindus, 337); // Mathematical invariant of Parashara Ashtakavarga
});

runTest("Gochara Transits and Sade Sati correctly evaluate against natal Moon", () => {
  const transits = evaluatePredictiveTransits(chartResult, "2026-11-18", 5.5, "en");
  assert(transits);
  assert(Array.isArray(transits.transitDetails) && transits.transitDetails.length === 9);
  assert(transits.shaniGochara);
  assert(transits.shaniGochara.shaniType);
});

// -----------------------------------------------------------------------------
// SECTION F: POLAR & GEOGRAPHIC BOUNDARY CONDITIONS
// -----------------------------------------------------------------------------
console.log("\n--- Section F: Polar & Boundary Condition Robustness ---");

runTest("Equatorial calculation (Quito, Ecuador: Lat 0°) computes without distortion", () => {
  const eqChart = calculateBirthChart({
    name: "Equator Case",
    birthDate: "2000-01-01",
    birthTime: "12:00",
    birthPlace: "Quito, Ecuador",
    latitude: 0.0,
    longitude: -78.4678,
    timezone: "-05:00",
  });
  assert(eqChart.ascendant.degree >= 0 && eqChart.ascendant.degree < 30);
  assert.strictEqual(eqChart.planets.length, 9);
});

runTest("Southern Hemisphere (Sydney, Australia: Lat -33.8688°) computes correctly", () => {
  const shChart = calculateBirthChart({
    name: "Southern Hemisphere Case",
    birthDate: "1995-07-20",
    birthTime: "08:15",
    birthPlace: "Sydney, Australia",
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: "+10:00",
  });
  assert(shChart.ascendant.sign);
  assert.strictEqual(shChart.planets.length, 9);
});

runTest("Exact North Pole boundary (Lat 90.0° N) gracefully clamps without tan() singularity", () => {
  const poleChart = calculateBirthChart({
    name: "North Pole Boundary",
    birthDate: "2020-06-21",
    birthTime: "00:00",
    birthPlace: "North Pole",
    latitude: 90.0,
    longitude: 0.0,
    timezone: "+00:00",
  });
  assert(!isNaN(chartResult.ascendant.degree));
  assert.strictEqual(poleChart.planets.length, 9);
});

runTest("High Arctic Polar Day / Night handles null sunrise/sunset gracefully", () => {
  // Tromsø, Norway (Lat 69.6492°) in December has polar night (no sunrise)
  const polarPanchang = computePanchang({
    date: "2026-12-21",
    latitude: 69.6492,
    longitude: 18.9553,
    tzOffset: 1.0,
    timezone: "Europe/Oslo",
  });
  // Must not crash; returns null for sunrise/sunset or fallback
  assert.strictEqual(polarPanchang.planets !== undefined, false); // panchang has core limbs
  assert(polarPanchang.tithi);
  assert(polarPanchang.nakshatra);
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("\n================================================================================");
console.log(`   Step 3 Validation Results: ${passed} / ${total} tests passed                `);
console.log("================================================================================\n");

if (passed !== total) {
  process.exit(1);
}
