/**
 * Automated Verification Suite for Phases 4 & 5
 * (Predictive Transit Intelligence & Personal AI Jyotish Assistant)
 */

import { calculateBirthChart } from "../server/astrology/engine.js";
import { evaluatePredictiveTransits } from "../server/astrology/transitIntelligence.js";
import {
  generatePersonalizedAIPrompts,
  queryAIJyotishAssistant,
} from "../server/astrology/aiJyotishAssistant.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log("=== GURUKUL TRANSIT INTELLIGENCE & AI JYOTISH ASSISTANT VERIFICATION ===\n");

// 1. Prepare sample birth chart
console.log("1. Generating Natal Chart Context:");
const testInput = {
  name: "Yudhishthira",
  birthDate: "1998-05-15",
  birthTime: "08:45",
  birthPlace: "Ujjain, India",
  latitude: 23.1765,
  longitude: 75.7885,
  timezone: "+05:30",
  gender: "male",
  language: "en",
};

const chart = calculateBirthChart(testInput);
assert(chart && chart.ascendant, "Natal chart generated with full astronomical parameters");

// 2. Predictive Transit Evaluation Test
console.log("\n2. Predictive Transit Intelligence (Gochara) Test:");
const transits = evaluatePredictiveTransits(chart, "2026-11-02", 5.5, "en");
assert(transits && transits.transitDetails, "Transit evaluation returned complete snapshot");
assert(transits.transitDetails.length === 9, "All 9 Navagrahas evaluated in daily transit");

// Check house relative to Lagna and Moon
for (const t of transits.transitDetails) {
  assert(
    t.houseFromLagna >= 1 && t.houseFromLagna <= 12,
    `${t.planet} mapped to House ${t.houseFromLagna} from Lagna`
  );
  assert(
    t.houseFromMoon >= 1 && t.houseFromMoon <= 12,
    `${t.planet} mapped to House ${t.houseFromMoon} from Moon (Janma Rashi)`
  );
  assert(
    typeof t.sarvaBindus === "number" || t.sarvaBindus === null,
    `${t.planet} Ashtakavarga transit bindu check: ${t.sarvaBindus ?? "N/A"}`
  );
}

// Check Guru & Shani Gochara
assert(transits.guruGochara !== null, "Guru Gochara (Jupiter transit) evaluated");
console.log(`  → Guru Gochara: House ${transits.guruGochara?.houseFromMoon} (${transits.guruGochara?.sign}) - Auspicious: ${transits.guruGochara?.isAuspicious}`);

assert(transits.shaniGochara !== null, "Shani Gochara (Saturn transit & Sade Sati) evaluated");
console.log(`  → Shani Gochara: House ${transits.shaniGochara?.houseFromMoon} (${transits.shaniGochara?.sign}) - Type: ${transits.shaniGochara?.shaniType}`);

// Check Dasha-Transit Synergy
assert(transits.dashaSynergy !== null, "Dasha-Transit Synergy evaluated");
console.log(`  → Dasha Synergy: Mahadasha ${transits.dashaSynergy?.mahaLord} transiting ${transits.dashaSynergy?.mahaTransitSign} (${transits.dashaSynergy?.synergyStatus})`);

// 3. Personalized Quick Prompts Generation Test
console.log("\n3. Personalized AI Quick Prompts Test:");
const enPrompts = generatePersonalizedAIPrompts(chart, "en");
const hiPrompts = generatePersonalizedAIPrompts(chart, "hi");
assert(enPrompts.length === 4, "Generated 4 tailored English prompt suggestions");
assert(hiPrompts.length === 4, "Generated 4 tailored Hindi prompt suggestions");
console.log(`  → Sample EN prompt: "${enPrompts[0]}"`);
console.log(`  → Sample HI prompt: "${hiPrompts[0]}"`);

// 4. Personal AI Jyotish Assistant Query Test
console.log("\n4. Personal AI Jyotish Assistant Reasoning Test:");
async function testAssistant() {
  const query = "What is the spiritual theme of my active Mahadasha and current Saturn transit?";
  const result = await queryAIJyotishAssistant({
    query,
    chart,
    language: "en",
  });

  assert(result && result.answer, "AI Jyotish Assistant synthesized response");
  assert(result.chartFactors.length > 0, "Deterministic birth chart factors injected");
  assert(result.recommendedSadhana.length > 0, "Practical Vedic sadhana recommended");
  assert(result.disclaimer.includes("Disclaimer"), "Mandatory non-fatalistic ethical disclaimer included");
  assert(result.followUpQuestions.length > 0, "Intelligent follow-up questions provided");

  console.log(`\n  → Injected ${result.chartFactors.length} chart factors:`, result.chartFactors.slice(0, 3).join("; "));
  console.log(`  → Recommended Sadhana: ${result.recommendedSadhana}`);
  console.log(`  → Sample Response Excerpt:\n"${result.answer.slice(0, 180)}..."`);
}

testAssistant()
  .then(() => {
    console.log(`\n========================================`);
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  })
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  });
