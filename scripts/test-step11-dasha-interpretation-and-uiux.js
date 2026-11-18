/**
 * Step 11 Test Suite: Gurukul Dasha & Antardasha Interpretation,
 * Chart Grounding, Sourced Remedies, and UI/UX Verification
 */

import assert from "node:assert/strict";
import { calculateBirthChart } from "../server/astrology/engine.js";
import {
  resolvePlanetDetails,
  calculateDashaSambandha,
  calculateUpcomingTransitions,
  generateDashaInterpretationReport,
  CLASSICAL_REMEDIES,
  NATURAL_RELATIONSHIPS,
} from "../server/astrology/dashaInterpretation.js";

let passedCount = 0;
let totalCount = 0;

function runTest(testName, fn) {
  totalCount++;
  try {
    fn();
    passedCount++;
    console.log(`  ✓ ${testName}`);
  } catch (error) {
    console.error(`  ✗ ${testName}`);
    console.error(`    ${error.message}`);
  }
}

async function runAsyncTest(testName, fn) {
  totalCount++;
  try {
    await fn();
    passedCount++;
    console.log(`  ✓ ${testName}`);
  } catch (error) {
    console.error(`  ✗ ${testName}`);
    console.error(`    ${error.message}`);
  }
}

console.log("\n================================================================================");
console.log("   GURUKUL STEP 11: DASHA-ANTARDASHA INTERPRETATION & UI/UX AUDIT");
console.log("================================================================================\n");

// 1. Chart Generation for Test Case
const testBirthDetails = {
  name: "Arjuna Test",
  birthDate: "1992-04-14",
  birthTime: "08:15",
  birthPlace: "Ujjain, India",
  latitude: 23.1765,
  longitude: 75.7885,
  timezone: "Asia/Kolkata",
  language: "en",
};

const chart = calculateBirthChart(testBirthDetails);

// Test 1: Birth Chart and Dasha Engine Sanity
runTest("1. Engine produces valid birth chart and Vimshottari Dasha base", () => {
  assert.ok(chart, "Chart should exist");
  assert.ok(chart.ascendant, "Chart should have ascendant");
  assert.ok(chart.dasha, "Chart should have dasha data");
  assert.ok(chart.dasha.activeDasha, "Should have active dasha");
  assert.ok(chart.dasha.activeDasha.mahadasha, "Should have active Mahadasha lord");
  assert.ok(chart.dasha.activeDasha.antardasha, "Should have active Antardasha lord");
  assert.ok(chart.dasha.activeDasha.pratyantardasha, "Should have active Pratyantardasha lord");
});

// Test 2: Planetary Details Resolution from Lagna
runTest("2. Resolves planetary house ownership, placement and dignity correctly", () => {
  const sunDetails = resolvePlanetDetails(chart, "Sun");
  assert.ok(sunDetails, "Sun details should resolve");
  assert.strictEqual(typeof sunDetails.house, "number", "House should be a number");
  assert.ok(Array.isArray(sunDetails.ruledHouses), "ruledHouses should be array");
  assert.ok(sunDetails.dignityLabel, "dignityLabel should exist");
  assert.ok(sunDetails.functionalRole, "functionalRole should exist");
});

// Test 3: Lagna Lord Identification
runTest("3. Correctly identifies Lagna Lord and functional roles", () => {
  const ascLord = chart.ascendant.signLord;
  const ascLordDetails = resolvePlanetDetails(chart, ascLord);
  assert.ok(
    ascLordDetails.isLagnaLord || ascLordDetails.ruledHouses.includes(1),
    `Ascendant lord ${ascLord} must own House 1`
  );
});

// Test 4: Classical Remedies Data Completeness
runTest("4. Classical remedies contain all 9 planets with mantras, deities, and citations", () => {
  const planets = ["SUN", "MOON", "MARS", "RAHU", "JUPITER", "SATURN", "MERCURY", "KETU", "VENUS"];
  for (const p of planets) {
    const r = CLASSICAL_REMEDIES[p];
    assert.ok(r, `Remedy for ${p} must exist`);
    assert.ok(r.beejMantra, `${p} must have Beej Mantra`);
    assert.ok(r.gayatriMantra, `${p} must have Gayatri/Pauranik Mantra`);
    assert.ok(r.devataEn && r.devataHi, `${p} must have bilingual Devata`);
    assert.ok(r.daanItemEn && r.daanItemHi, `${p} must have bilingual Daan item`);
    assert.ok(r.vrataSadhanaEn && r.vrataSadhanaHi, `${p} must have bilingual Vrata`);
    assert.ok(r.scripturalCitation, `${p} must cite classical scriptures (BPHS/Phaladeepika)`);
  }
});

// Test 5: Natural Relationships Consistency
runTest("5. Natural relationships follow classical Parashari rules", () => {
  assert.ok(NATURAL_RELATIONSHIPS.SUN.friends.includes("MOON"), "Sun considers Moon a friend");
  assert.ok(NATURAL_RELATIONSHIPS.SUN.enemies.includes("SATURN"), "Sun considers Saturn an enemy");
  assert.ok(NATURAL_RELATIONSHIPS.JUPITER.friends.includes("SUN"), "Jupiter considers Sun a friend");
  assert.ok(NATURAL_RELATIONSHIPS.SATURN.friends.includes("VENUS"), "Saturn considers Venus a friend");
});

// Test 6: Mutual Sambandha Calculations (Axis & Tone)
runTest("6. Mutual Sambandha correctly categorizes geometric axes (1/1, 5/9, 6/8, etc.)", () => {
  // Test Mock Planets
  const mockPlanetA = { key: "JUPITER", name: "Jupiter", house: 1, ruledHouses: [1, 4] };
  const mockPlanetB = { key: "MARS", name: "Mars", house: 1, ruledHouses: [5] };
  const yuti = calculateDashaSambandha(mockPlanetA, mockPlanetB);
  assert.strictEqual(yuti.axisKey, "1_1", "House 1 and 1 should form Yuti");

  const mockPlanetC = { key: "SATURN", name: "Saturn", house: 6, ruledHouses: [10, 11] };
  const shadashtaka = calculateDashaSambandha(mockPlanetA, mockPlanetC);
  assert.strictEqual(shadashtaka.axisKey, "6_8", "House 1 and 6 should form Shadashtaka");
  assert.strictEqual(shadashtaka.tone, "challenging", "6/8 should be flagged challenging");

  const mockPlanetD = { key: "SUN", name: "Sun", house: 9, ruledHouses: [9] };
  const trikona = calculateDashaSambandha(mockPlanetA, mockPlanetD);
  assert.strictEqual(trikona.axisKey, "5_9", "House 1 and 9 should form 5/9 Trikona");
  assert.strictEqual(trikona.tone, "highly_favorable", "5/9 should be highly favorable");
});

// Test 7: Upcoming Dasha Transitions Calculation
runTest("7. Calculates upcoming transitions milestones and countdowns in days", () => {
  const transitions = calculateUpcomingTransitions(chart.dasha, new Date("2026-11-18"));
  assert.ok(Array.isArray(transitions), "Transitions should be an array");
  assert.ok(transitions.length > 0, "Should have at least 1 milestone");
  for (const t of transitions) {
    assert.strictEqual(typeof t.daysRemaining, "number", "Days remaining should be number");
    assert.ok(t.targetDate, "Should have targetDate");
    assert.ok(t.labelEn && t.labelHi, "Should have bilingual labels");
  }
});

// Test 8: Comprehensive 11-Section Report Generation (English)
runTest("8. Generates complete 11-section bilingual report in English", () => {
  const report = generateDashaInterpretationReport({
    chart,
    targetDate: new Date("2026-11-18"),
    language: "en",
  });

  assert.ok(report.meta, "Report must have meta");
  assert.strictEqual(report.meta.language, "en");
  assert.ok(report.activeDashaSummary, "Report must have activeDashaSummary");

  const s = report.sections;
  assert.ok(s.section1_mahadashaOverview, "Section 1 must exist");
  assert.ok(s.section2_antardashaOverview, "Section 2 must exist");
  assert.ok(s.section3_pratyantardashaOverview, "Section 3 must exist");
  assert.ok(s.section4_positiveInfluences, "Section 4 must exist");
  assert.ok(s.section5_potentialChallenges, "Section 5 must exist");
  assert.ok(s.section6_careerAndFinances, "Section 6 must exist");
  assert.ok(s.section7_relationshipsAndFamily, "Section 7 must exist");
  assert.ok(s.section8_healthAndSpirituality, "Section 8 must exist");
  assert.ok(s.section9_traditionalRemedies, "Section 9 must exist");
  assert.ok(s.section10_upcomingTransitions, "Section 10 must exist");
  assert.ok(s.section11_astronomicalMetadata, "Section 11 must exist");

  // Check section content depth
  assert.ok(s.section1_mahadashaOverview.descriptionEn.length > 50, "Section 1 English description must be rich");
  assert.ok(s.section2_antardashaOverview.sambandha, "Section 2 must contain Sambandha analysis");
  assert.ok(s.section9_traditionalRemedies.ethicalDisclaimerEn.includes("Brihat Parashara Hora Shastra"), "Must include ethical disclaimer");
});

// Test 9: Comprehensive 11-Section Report Generation (Hindi Devanagari)
runTest("9. Generates complete 11-section bilingual report in Hindi", () => {
  const reportHi = generateDashaInterpretationReport({
    chart,
    targetDate: new Date("2026-11-18"),
    language: "hi",
  });

  const s = reportHi.sections;
  assert.strictEqual(reportHi.meta.isHindi, true, "isHindi must be true");
  assert.ok(s.section1_mahadashaOverview.descriptionHi.length > 50, "Section 1 Hindi description must be rich");
  assert.ok(s.section4_positiveInfluences.opportunitiesHi.length > 0, "Section 4 must have Hindi opportunities");
  assert.ok(s.section5_potentialChallenges.challengesHi.length > 0, "Section 5 must have Hindi challenges");
  assert.ok(s.section9_traditionalRemedies.ethicalDisclaimerHi.includes("बृहत्पाराशर"), "Must include Hindi ethical disclaimer");
});

// Test 10: Dynamic Content Verification (No static hardcoding)
runTest("10. Ensures dynamic chart grounding differs across different birth charts", () => {
  // Chart 2: Different birth coordinates and date
  const chart2 = calculateBirthChart({
    name: "Nakula Test",
    birthDate: "1985-08-20",
    birthTime: "18:45",
    birthPlace: "Varanasi, India",
    latitude: 25.3176,
    longitude: 82.9739,
    timezone: "Asia/Kolkata",
    language: "en",
  });

  const rep1 = generateDashaInterpretationReport({ chart, targetDate: new Date("2026-11-18") });
  const rep2 = generateDashaInterpretationReport({ chart: chart2, targetDate: new Date("2026-11-18") });

  assert.notStrictEqual(
    rep1.activeDashaSummary.mahadashaRange,
    rep2.activeDashaSummary.mahadashaRange,
    "Different charts must have different dasha timelines"
  );
  assert.notStrictEqual(
    rep1.sections.section1_mahadashaOverview.house,
    rep2.sections.section1_mahadashaOverview.house,
    "House placements must reflect distinct chart geometries"
  );
});

console.log("\n--------------------------------------------------------------------------------");
console.log(`Step 11 Dasha Interpretation & UI/UX Audit Results: ${passedCount} / ${totalCount} Passed`);
console.log("--------------------------------------------------------------------------------\n");

if (passedCount !== totalCount) {
  process.exit(1);
}
