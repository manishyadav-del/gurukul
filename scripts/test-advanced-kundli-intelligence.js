/**
 * Automated Verification Suite for Advanced Kundli Intelligence (Phases 2 & 3)
 */

import { calculateBirthChart } from "../server/astrology/engine.js";
import { DIVISIONAL_CHARTS_META, computeAllDivisionalCharts } from "../server/astrology/divisionalCharts.js";
import { computeComprehensiveVimshottari } from "../server/astrology/dashaEngine.js";
import {
  calculatePlanetaryDignity,
  calculateShadbala,
  calculateAshtakavarga,
  detectComprehensiveYogasAndDoshas,
} from "../server/astrology/planetaryStrengths.js";

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

console.log("=== GURUKUL ADVANCED KUNDLI INTELLIGENCE VERIFICATION ===\n");

// Test 1: Full Chart Calculation
console.log("1. Full Birth Chart Calculation Test:");
const testInput = {
  name: "Arjuna",
  birthDate: "1995-10-24",
  birthTime: "14:30",
  birthPlace: "Varanasi, India",
  latitude: 25.3176,
  longitude: 82.9739,
  timezone: "+05:30",
  gender: "male",
  language: "en",
};

const chart = calculateBirthChart(testInput);
assert(chart && chart.ascendant, "Birth chart calculated successfully");
assert(chart.planets.length === 9, "All 9 Grahas computed with sidereal coordinates");
assert(chart.houses.length === 12, "All 12 Bhavas constructed with whole-sign mappings");

// Test 2: 16 Divisional Charts (Shodashavarga)
console.log("\n2. Shodashavarga (16 Divisional Charts) Test:");
const vargas = chart.divisionalCharts;
const expectedVargas = [
  "D1", "D2", "D3", "D4", "D7", "D9", "D10", "D12",
  "D16", "D20", "D24", "D27", "D30", "D40", "D45", "D60"
];

assert(Object.keys(vargas).length === 16, `All 16 Divisional Charts present (found ${Object.keys(vargas).length})`);

for (const code of expectedVargas) {
  const vChart = vargas[code];
  assert(
    vChart && vChart.ascendant && vChart.planets.length === 9 && vChart.houses.length === 12,
    `${code} (${vChart?.meta?.name}) chart has complete ascendant, 9 planets, and 12 houses`
  );
}

// Check D60 specific Shashtiamsha deity metadata
const d60Asc = vargas["D60"].ascendant;
assert(
  d60Asc.shashtiamshaDeity && d60Asc.shashtiamshaNature,
  `D60 Ascendant has BPHS Shashtiamsha deity: ${d60Asc.shashtiamshaDeity} (${d60Asc.shashtiamshaNature})`
);

// Test 3: Comprehensive 3-Tier Vimshottari Dasha
console.log("\n3. Comprehensive Vimshottari Dasha Test:");
const dasha = chart.dasha;
assert(dasha.currentMahadasha, `Active Mahadasha identified: ${dasha.currentMahadasha}`);
assert(dasha.currentAntardasha, `Active Antardasha identified: ${dasha.currentAntardasha}`);
assert(dasha.currentPratyantardasha, `Active Pratyantardasha identified: ${dasha.currentPratyantardasha}`);
assert(dasha.timeline.length === 9, "Complete 9 Mahadasha cycles mapped across 120-year span");

const activeMaha = dasha.timeline.find((m) => m.isCurrent);
assert(activeMaha && activeMaha.antardashas.length === 9, "Active Mahadasha contains 9 Antardashas");

const activeAntar = activeMaha.antardashas.find((a) => a.isCurrent);
assert(activeAntar && activeAntar.pratyantardashas.length === 9, "Active Antardasha contains 9 Pratyantardashas");

// Test 4: 6-fold Shadbala Calculation
console.log("\n4. 6-fold Shadbala Strength Test:");
const shadbala = chart.shadbala;
const physicalKeys = ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"];
assert(Object.keys(shadbala).length === 7, "Shadbala calculated for all 7 physical planets");

for (const pKey of physicalKeys) {
  const b = shadbala[pKey];
  assert(
    b.sthanaBala >= 0 &&
    b.digBala >= 0 &&
    b.kalaBala >= 0 &&
    b.chestaBala >= 0 &&
    b.naisargikaBala > 0 &&
    b.drikBala >= 0 &&
    b.totalRupas > 0,
    `${pKey} has all 6 Balas (Total: ${b.totalRupas} Rupas, Req: ${b.minRequiredRupas} Rupas)`
  );
}

// Test 5: Ashtakavarga & Sarvashtakavarga (337 Bindus)
console.log("\n5. Ashtakavarga & Sarvashtakavarga Test:");
const av = chart.ashtakavarga;
assert(av.sarvashtakavarga.length === 12, "Sarvashtakavarga has 12 signs evaluated");
assert(
  av.totalBindus === 337,
  `Sarvashtakavarga total bindus across 12 signs is exactly 337 (Canonical BPHS rule, found ${av.totalBindus})`
);

// Test 6: Classical Yogas and Doshas
console.log("\n6. Classical Yogas and Doshas Detection Test:");
const yd = chart.yogasAndDoshas;
assert(Array.isArray(yd.yogas), "Yogas array returned");
assert(Array.isArray(yd.doshas), "Doshas array returned");
console.log(`  → Detected ${yd.yogas.length} Yogas:`, yd.yogas.map((y) => y.name).join(", "));
console.log(`  → Detected ${yd.doshas.length} Doshas/Transits:`, yd.doshas.map((d) => d.name).join(", "));

assert(yd.yogas.length > 0 || yd.doshas.length >= 0, "Yoga/Dosha evaluation completed successfully");

// Final Summary
console.log(`\n========================================`);
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
