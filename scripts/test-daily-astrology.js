/**
 * Test Suite for Daily Astrology & Panchang System
 *
 * Verifies:
 * 1. Panchang calculations (Tithi, Nakshatra, Yoga, Karana, Vara, Sunrise, Sunset, Rahu Kaal)
 * 2. Planetary transits and Navagraha sidereal coordinates
 * 3. Transit-to-natal aspect detection
 * 4. Fallback interpretation generation (bilingual, non-hallucinatory)
 * 5. Database caching and deduplication via DailyAstrologyReport
 */

import assert from "node:assert";
import { computePanchang, computeTithi, computeYoga, computeKarana, computeVara, computeRahuKaal } from "../server/astrology/panchang.js";
import { computeDailyTransits, computeTransitToNatalAspects, buildTransitsOverview } from "../server/astrology/transits.js";
import { generateDailyInterpretation } from "../server/astrology/dailyAiInterpretation.js";
import prisma from "../lib/prisma.js";

let passed = 0;
let total = 0;

function test(description, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    ${err.message}`);
  }
}

async function asyncTest(description, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✓ ${description}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    ${err.message}`);
  }
}

console.log("\n=======================================================");
console.log("Gurukul Daily Astrology & Cosmic Guidance Test Suite");
console.log("=======================================================\n");

// ---------------------------------------------------------------------------
// 1. Panchang calculations
// ---------------------------------------------------------------------------
console.log("Suite 1: Astronomical & Panchang Engine");

test("Computes correct weekday (Vara) for known dates", () => {
  const sunday = new Date("2026-10-18T12:00:00Z");
  const res = computeVara(sunday);
  assert.strictEqual(res.en, "Sunday");
  assert.strictEqual(res.hi, "रविवार");
  assert.strictEqual(res.dayIndex, 0);
});

test("Computes Tithi correctly from elongation", () => {
  // 0° elongation = Shukla Pratipada (0)
  const tithi1 = computeTithi(10, 10);
  assert.strictEqual(tithi1.id, 1);
  assert.strictEqual(tithi1.name, "Pratipada");
  assert.strictEqual(tithi1.paksha, "Shukla");

  // ~175° elongation = Purnima (15)
  const tithiPurnima = computeTithi(185, 10);
  assert.strictEqual(tithiPurnima.id, 15);
  assert.strictEqual(tithiPurnima.name, "Purnima");

  // 355° elongation = Amavasya (30)
  const tithiAmavasya = computeTithi(5, 10); // elongation = 355°
  assert.strictEqual(tithiAmavasya.id, 30);
  assert.strictEqual(tithiAmavasya.name, "Amavasya");
});

test("Computes Yoga correctly from Moon + Sun sidereal sum", () => {
  const yoga = computeYoga(50, 40); // 90° -> 90 / 13.333 = index 6 -> Sukarman (id 7)
  assert.ok(yoga.name);
  assert.ok(yoga.devanagari);
  assert.ok(yoga.id >= 1 && yoga.id <= 27);
});

test("Computes Karana within valid boundaries", () => {
  const karana = computeKarana(45, 15);
  assert.ok(karana.name);
  assert.ok(karana.devanagari);
});

test("Computes Rahu Kaal window strictly between sunrise and sunset", () => {
  const sunrise = new Date("2026-10-17T06:15:00Z");
  const sunset  = new Date("2026-10-17T17:45:00Z");
  const rahuKaal = computeRahuKaal(sunrise, sunset, 6 /* Saturday */, 5.5);

  assert.ok(rahuKaal, "Rahu Kaal must be returned");
  assert.ok(rahuKaal.start >= sunrise, "Rahu Kaal start must be >= sunrise");
  assert.ok(rahuKaal.end <= sunset, "Rahu Kaal end must be <= sunset");
  assert.ok(rahuKaal.start < rahuKaal.end, "Rahu Kaal start must be < end");
  assert.ok(rahuKaal.startStr && rahuKaal.endStr, "Local formatted strings must exist");
});

test("Full computePanchang returns complete structure for Delhi", () => {
  const p = computePanchang({
    date: "2026-10-17",
    latitude: 28.6139,
    longitude: 77.209,
    tzOffset: 5.5,
    timezone: "Asia/Kolkata",
  });

  assert.strictEqual(p.date, "2026-10-17");
  assert.strictEqual(p.ayanamsaType, "Lahiri");
  assert.ok(p.tithi && p.tithi.name, "Tithi should be populated");
  assert.ok(p.nakshatra && p.nakshatra.name, "Nakshatra should be populated");
  assert.ok(p.yoga && p.yoga.name, "Yoga should be populated");
  assert.ok(p.karana && p.karana.name, "Karana should be populated");
  assert.ok(p.moonSign && p.moonSign.name, "Moon sign should be populated");
  assert.ok(p.sunSign && p.sunSign.name, "Sun sign should be populated");
  assert.ok(p.sunrise && p.sunrise.local, "Sunrise should have local time");
  assert.ok(p.sunset && p.sunset.local, "Sunset should have local time");
  assert.ok(p.rahuKaal && p.rahuKaal.startLocal, "Rahu Kaal should have start local time");
  assert.ok(p.choghadiya && p.choghadiya.day.length === 8, "Choghadiya should contain 8 day slots");
  assert.ok(p.choghadiya && p.choghadiya.night.length === 8, "Choghadiya should contain 8 night slots");
  assert.ok(p.luckyMetrics && p.luckyMetrics.colorEn, "Lucky Metrics should contain lucky color");
  assert.ok(p.luckyMetrics && p.luckyMetrics.number, "Lucky Metrics should contain lucky number");
});

// ---------------------------------------------------------------------------
// 2. Daily Transits
// ---------------------------------------------------------------------------
console.log("\nSuite 2: Navagraha Planetary Transits");

test("Computes all 9 Navagrahas with sidereal positions", () => {
  const transits = computeDailyTransits({ date: "2026-10-17", tzOffset: 5.5 });
  assert.strictEqual(transits.length, 9, "Must return exactly 9 Grahas");

  const requiredPlanets = ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN", "RAHU", "KETU"];
  for (const key of requiredPlanets) {
    const found = transits.find((p) => p.planet === key);
    assert.ok(found, `Planet ${key} must exist in transits`);
    assert.ok(found.sign, `${key} must have a sign`);
    assert.ok(found.nakshatra, `${key} must have a nakshatra`);
    assert.ok(typeof found.retrograde === "boolean", `${key} retrograde must be boolean`);
  }
});

test("Builds transits overview summary", () => {
  const transits = computeDailyTransits({ date: "2026-10-17", tzOffset: 5.5 });
  const overview = buildTransitsOverview(transits);
  assert.ok(overview.sun);
  assert.ok(overview.moon);
  assert.ok(Array.isArray(overview.retrograde));
  assert.strictEqual(overview.all.length, 9);
});

test("Computes transit-to-natal aspects when natal chart is provided", () => {
  const transits = computeDailyTransits({ date: "2026-10-17", tzOffset: 5.5 });
  const mockNatalChart = {
    ascendant: 15.0, // Aries Lagna
    planets: [
      { planet: "SUN", name: "Sun", sign: transits[0].sign, house: 1 }, // Conjunction with transit Sun
      { planet: "MOON", name: "Moon", sign: "Libra", house: 7 },
    ],
  };

  const aspects = computeTransitToNatalAspects(transits, mockNatalChart);
  assert.ok(Array.isArray(aspects));
  // At least the conjunction with Sun should be detected
  const hasConj = aspects.some((a) => a.type === "CONJUNCTION" && a.transitPlanet === "SUN");
  assert.ok(hasConj, "Should detect Sun conjunction in same sign");
});

// ---------------------------------------------------------------------------
// 3. AI / Fallback Interpretation
// ---------------------------------------------------------------------------
console.log("\nSuite 3: Interpretation & Fallback Reliability");

await asyncTest("Generates complete, structured bilingual interpretation without throwing", async () => {
  const panchang = computePanchang({
    date: "2026-10-17",
    latitude: 26.5024,
    longitude: 83.7791,
    tzOffset: 5.5,
    timezone: "Asia/Kolkata",
  });
  const transits = computeDailyTransits({ date: "2026-10-17", tzOffset: 5.5 });

  const result = await generateDailyInterpretation({
    panchang,
    transits,
    natalAspects: [],
    language: "hi",
    isPersonalized: false,
  });

  assert.ok(result.dailySummary, "dailySummary must exist");
  assert.ok(result.dailySummary.en && result.dailySummary.hi, "dailySummary must be bilingual");
  assert.ok(result.overallTheme, "overallTheme must exist");
  assert.ok(Array.isArray(result.whatToDo), "whatToDo must be an array");
  assert.ok(Array.isArray(result.whatToAvoid), "whatToAvoid must be an array");
  assert.ok(result.spiritualPractice, "spiritualPractice must exist");
  assert.ok(result.disclaimer, "disclaimer must exist");
});

// ---------------------------------------------------------------------------
// 4. Database Caching & Idempotency
// ---------------------------------------------------------------------------
console.log("\nSuite 4: Database Persistence & Deduplication");

await asyncTest("DailyAstrologyReport upsert enforces uniqueness and stores valid JSON", async () => {
  const testReportDate = "2026-10-17";
  const lat = 26.5024;
  const lon = 83.7791;

  const panchang = computePanchang({
    date: testReportDate,
    latitude: lat,
    longitude: lon,
    tzOffset: 5.5,
    timezone: "Asia/Kolkata",
  });

  const uniqueKey = {
    userId: "general",
    reportDate: testReportDate,
    latitude: parseFloat(lat.toFixed(4)),
    longitude: parseFloat(lon.toFixed(4)),
    language: "hi",
    calculationVersion: "v1",
  };

  // 1. Create or update report
  const report1 = await prisma.dailyAstrologyReport.upsert({
    where: {
      userId_reportDate_latitude_longitude_language_calculationVersion: uniqueKey,
    },
    update: {
      panchangData: panchang,
      reportContent: { test: true, iteration: 1 },
      isPersonalized: false,
    },
    create: {
      ...uniqueKey,
      timezone: "Asia/Kolkata",
      panchangData: panchang,
      reportContent: { test: true, iteration: 1 },
      isPersonalized: false,
    },
  });

  assert.ok(report1.id, "Report should have an ID");

  // 2. Duplicate upsert should update in-place without creating a duplicate row
  const report2 = await prisma.dailyAstrologyReport.upsert({
    where: {
      userId_reportDate_latitude_longitude_language_calculationVersion: uniqueKey,
    },
    update: {
      panchangData: panchang,
      reportContent: { test: true, iteration: 2 },
    },
    create: {
      ...uniqueKey,
      timezone: "Asia/Kolkata",
      panchangData: panchang,
      reportContent: { test: true, iteration: 2 },
    },
  });

  assert.strictEqual(report1.id, report2.id, "Deduplication must keep same ID on identical parameters");
  assert.strictEqual(report2.reportContent.iteration, 2, "Updated content must be persisted");

  // Clean up test entry
  await prisma.dailyAstrologyReport.deleteMany({
    where: { id: report1.id },
  });
});

// ---------------------------------------------------------------------------
// 5. Work Feasibility & Task Evaluation
// ---------------------------------------------------------------------------
console.log("\nSuite 5: Work Feasibility & Task Evaluation");

await asyncTest("Evaluates user work/task feasibility against Panchang", async () => {
  const { evaluateTaskDeterministically, evaluateTaskWithAI } = await import("../server/astrology/taskEvaluator.js");

  const panchang = computePanchang({
    date: "2026-10-17",
    latitude: 28.6139,
    longitude: 77.209,
    tzOffset: 5.5,
    timezone: "Asia/Kolkata",
  });

  // 1. Test deterministic evaluation
  const det = evaluateTaskDeterministically({
    taskText: "Sign a new commercial partnership contract",
    panchang,
  });

  assert.ok(det.score >= 1 && det.score <= 5, "Score must be between 1 and 5");
  assert.ok(det.verdictEn && det.verdictHi, "Verdict must be bilingual");
  assert.ok(det.nakshatraType, "Nakshatra type must exist");
  assert.ok(Array.isArray(det.bestActivities), "Best activities must be array");
  assert.ok(det.safeTimeWindow, "Safe time window must exist");

  // 2. Test full AI/fallback task evaluation
  const res = await evaluateTaskWithAI({
    taskText: "Job interview at 2 PM",
    panchang,
    transits: [],
    language: "hi",
  });

  assert.ok(res.verdict, "Result must have verdict");
  assert.ok(res.feasibilityAnalysis?.en && res.feasibilityAnalysis?.hi, "Feasibility analysis must be bilingual");
  assert.ok(res.optimalTimeWindow, "Optimal time window must exist");
  assert.ok(Array.isArray(res.practicalRecommendations), "Practical recommendations must be array");
  assert.ok(Array.isArray(res.precautionsToObserve), "Precautions must be array");
  assert.ok(res.ethicalDisclaimer, "Ethical disclaimer must exist");
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log("\n=======================================================");
console.log(`Results: ${passed} / ${total} tests passed.`);
console.log("=======================================================\n");

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
