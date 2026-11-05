/**
 * Test Suite: Kundli Matching (Ashtakoota 36 Gunas) & Advanced Muhurta Planner
 */

import { computeAshtakootaMatching, evaluateManglikCompatibility } from "../server/astrology/kundliMatching.js";
import { evaluateActivityMuhurta, MUHURTA_ACTIVITIES } from "../server/astrology/muhurtaPlanner.js";

async function runTests() {
  console.log("=== GURUKUL KUNDLI MATCHING & MUHURTA PLANNER TEST SUITE ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // --- PART 1: Ashtakoota Matching Tests ---
  console.log("\n--- Testing Ashtakoota 36 Gunas Matching ---");

  // Profile A (Groom): Moon in Rohini (Taurus), Mars in 12th house
  const groomChart = {
    profile: { name: "Anand" },
    moon: {
      sign: "Taurus",
      nakshatra: "Rohini",
      longitude: 45.0,
      pada: 2,
    },
    planets: [
      { planet: "MARS", house: 12, dignity: "NEUTRAL", sign: "Aries" }
    ]
  };

  // Profile B (Bride): Moon in Mrigashira (Gemini), Mars in 1st house
  const brideChart = {
    profile: { name: "Pooja" },
    moon: {
      sign: "Gemini",
      nakshatra: "Mrigashira",
      longitude: 58.0,
      pada: 3,
    },
    planets: [
      { planet: "MARS", house: 1, dignity: "NEUTRAL", sign: "Gemini" }
    ]
  };

  const matchResult = computeAshtakootaMatching(groomChart, brideChart, "en");

  assert(matchResult !== null && typeof matchResult === "object", "Matching returns a valid object");
  assert(matchResult.totalScore >= 0 && matchResult.totalScore <= 36, `Total score is within 0-36 range: ${matchResult.totalScore}`);
  assert(Array.isArray(matchResult.kootas) && matchResult.kootas.length === 8, "All 8 Kootas evaluated");

  // Check specific kootas
  const varna = matchResult.kootas.find(k => k.name.includes("Varna"));
  assert(varna && varna.maxPoints === 1, "Varna max score is 1");

  const vashya = matchResult.kootas.find(k => k.name.includes("Vashya"));
  assert(vashya && vashya.maxPoints === 2, "Vashya max score is 2");

  const tara = matchResult.kootas.find(k => k.name.includes("Tara"));
  assert(tara && tara.maxPoints === 3, "Tara max score is 3");

  const yoni = matchResult.kootas.find(k => k.name.includes("Yoni"));
  assert(yoni && yoni.maxPoints === 4, "Yoni max score is 4");

  const maitri = matchResult.kootas.find(k => k.name.includes("Maitri"));
  assert(maitri && maitri.maxPoints === 5, "Graha Maitri max score is 5");

  const gana = matchResult.kootas.find(k => k.name.includes("Gana"));
  assert(gana && gana.maxPoints === 6, "Gana max score is 6");

  const bhakoot = matchResult.kootas.find(k => k.name.includes("Bhakoot"));
  assert(bhakoot && bhakoot.maxPoints === 7, "Bhakoot max score is 7");

  const nadi = matchResult.kootas.find(k => k.name.includes("Nadi"));
  assert(nadi && nadi.maxPoints === 8, "Nadi max score is 8");

  // Manglik analysis
  const manglikComp = evaluateManglikCompatibility(groomChart, brideChart, "en");
  assert(manglikComp.groomMars.isManglik === true, "Groom detected as Manglik (Mars in 12th)");
  assert(manglikComp.brideMars.isManglik === true, "Bride detected as Manglik (Mars in 1st)");
  assert(manglikComp.compatibilityStatus === "NEUTRALIZED", "Both Manglik charts result in mutual NEUTRALIZED status");

  // Same Nadi cancellation test
  // Both Moon in Ashwini
  const chartSameNadi1 = {
    profile: { name: "G1" },
    moon: { sign: "Aries", nakshatra: "Ashwini", longitude: 2.0, pada: 1 },
    planets: []
  };
  const chartSameNadi2 = {
    profile: { name: "B1" },
    moon: { sign: "Aries", nakshatra: "Ashwini", longitude: 11.0, pada: 4 },
    planets: []
  };
  const sameNadiResult = computeAshtakootaMatching(chartSameNadi1, chartSameNadi2, "en");
  const sameNadiKoota = sameNadiResult.kootas.find(k => k.name.includes("Nadi"));
  assert(sameNadiKoota.isCancelled === true, "Nadi dosha cancellation recognized for different Padas");

  // --- PART 2: Advanced Muhurta Planner Tests ---
  console.log("\n--- Testing Advanced Muhurta Planner ---");

  const muhurtaResult = evaluateActivityMuhurta({
    activityKey: "VIVAHA",
    date: new Date().toISOString().split("T")[0],
    latitude: 28.6139,
    longitude: 77.2090,
    tzOffset: 5.5
  });

  assert(muhurtaResult !== null && typeof muhurtaResult === "object", "Muhurta calculation returns valid object");
  assert(muhurtaResult.activity !== undefined && muhurtaResult.activity.key === "VIVAHA", "Activity matches VIVAHA");
  assert(muhurtaResult.suitabilityScore >= 0 && muhurtaResult.suitabilityScore <= 100, `Suitability score is in 0-100 range: ${muhurtaResult.suitabilityScore}`);
  assert(muhurtaResult.panchangSummary !== undefined, "Panchang summary present");
  assert(muhurtaResult.factors !== undefined, "Evaluation factors present");
  assert(Array.isArray(muhurtaResult.recommendedSlots), "Recommended slots array present");
  assert(Array.isArray(muhurtaResult.restrictedSlots), "Restricted slots array present");
  assert(typeof muhurtaResult.mindfulnessGuidance === "string", "Mindfulness guidance provided");

  // Test across all 7 activities
  const activityKeys = Object.keys(MUHURTA_ACTIVITIES);
  assert(activityKeys.length === 7, `7 canonical activity profiles verified: ${activityKeys.join(", ")}`);

  for (const act of activityKeys) {
    const res = evaluateActivityMuhurta({
      activityKey: act,
      latitude: 19.0760,
      longitude: 72.8777
    });
    assert(res.suitabilityScore >= 0 && res.verdict !== undefined, `Activity '${act}' calculated with score ${res.suitabilityScore} (${res.verdict})`);
  }

  console.log(`\n=== RESULTS: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
