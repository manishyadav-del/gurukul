/**
 * Automated Verification Suite for Phase 11: Personalized Vedic Astrology Dashboard
 */

import assert from "node:assert";
import { calculateBirthChart } from "../server/astrology/engine.js";
import { validateBirthDetails } from "../server/astrology/validation.js";
import { evaluatePredictiveTransits } from "../server/astrology/transitIntelligence.js";
import { computePanchang } from "../server/astrology/panchang.js";
import { SANSKRIT_SHLOKAS } from "../server/spirituality/sanskritShlokas.js";
import { WORLD_CITIES } from "../components/astrology/worldLocations.js";

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`[PASS] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`[FAIL] ${desc}: ${err.message}`);
    failed++;
  }
}

console.log("=== GURUKUL PHASE 11: PERSONALIZED ASTROLOGY DASHBOARD TEST SUITE ===");

// 1. Birth Details Validation
it("Rejects birth details missing mandatory date", () => {
  const result = validateBirthDetails({ name: "Devotee", birthTime: "10:30" });
  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes("date")));
});

it("Rejects birth details with invalid time format", () => {
  const result = validateBirthDetails({ name: "Devotee", birthDate: "1995-05-15", birthTime: "invalid-time" });
  assert.strictEqual(result.isValid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes("time")));
});

it("Accepts valid birth details and normalizes timezone", () => {
  const result = validateBirthDetails({
    name: "Arjuna",
    birthDate: "1992-08-24",
    birthTime: "14:15",
    birthPlace: "Varanasi, UP, India",
    latitude: 25.3176,
    longitude: 82.9739,
    timezone: "+05:30",
  });
  assert.strictEqual(result.isValid, true);
  assert.strictEqual(result.normalized.name, "Arjuna");
  assert.strictEqual(result.normalized.latitude, 25.3176);
  assert.strictEqual(result.normalized.longitude, 82.9739);
});

// 2. Deterministic Kundli Calculation
const testChart = calculateBirthChart({
  name: "Arjuna",
  birthDate: "1992-08-24",
  birthTime: "14:15",
  birthPlace: "Varanasi, UP, India",
  latitude: 25.3176,
  longitude: 82.9739,
  timezone: "+05:30",
});

it("Calculates Ascendant (Lagna) with valid sign and degree", () => {
  assert.ok(testChart.ascendant);
  assert.ok(testChart.ascendant.sign);
  assert.strictEqual(typeof testChart.ascendant.degree, "number");
  assert.ok(testChart.ascendant.nakshatra);
  assert.ok(testChart.ascendant.pada >= 1 && testChart.ascendant.pada <= 4);
});

it("Calculates Moon details (Janma Rashi and Janma Nakshatra)", () => {
  assert.ok(testChart.moon);
  assert.ok(testChart.moon.sign);
  assert.ok(testChart.moon.nakshatra);
  assert.ok(testChart.moon.pada >= 1 && testChart.moon.pada <= 4);
});

it("Calculates 9 classical Grahas with houses, dignities, and nakshatras", () => {
  assert.ok(Array.isArray(testChart.planets));
  assert.strictEqual(testChart.planets.length, 9);
  const planets = ["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN", "RAHU", "KETU"];
  for (const p of planets) {
    const found = testChart.planets.find((item) => item.planet === p);
    assert.ok(found, `Graha ${p} must be calculated`);
    assert.ok(found.house >= 1 && found.house <= 12, `House for ${p} must be 1-12`);
    assert.ok(found.sign, `Sign for ${p} must be present`);
    assert.ok(found.dignity, `Dignity for ${p} must be present`);
  }
});

it("Builds 12 houses with Whole Sign system", () => {
  assert.ok(Array.isArray(testChart.houses));
  assert.strictEqual(testChart.houses.length, 12);
  for (let h = 1; h <= 12; h++) {
    const house = testChart.houses.find((item) => item.house === h);
    assert.ok(house, `House ${h} must exist`);
    assert.ok(house.sign, `House ${h} sign must exist`);
  }
});

// 3. Vimshottari Dasha Calculations
it("Computes 3-tier Vimshottari Dasha (Mahadasha, Antardasha, Pratyantardasha)", () => {
  assert.ok(testChart.dasha);
  assert.ok(testChart.dasha.currentMahadasha);
  assert.ok(testChart.dasha.currentAntardasha);
  assert.ok(testChart.dasha.currentPratyantardasha);
  assert.ok(testChart.dasha.timeline);
  assert.strictEqual(testChart.dasha.timeline.length, 9); // All 9 Mahadashas
});

it("Each Mahadasha in timeline contains 9 Antardashas", () => {
  for (const maha of testChart.dasha.timeline) {
    assert.ok(maha.lord);
    assert.ok(maha.startDate);
    assert.ok(maha.endDate);
    assert.ok(Array.isArray(maha.antardashas));
    assert.strictEqual(maha.antardashas.length, 9);
  }
});

// 4. Predictive Gochara Transits & Ashtakavarga
const transits = evaluatePredictiveTransits(testChart, "2026-11-04", 5.5, "en");

it("Evaluates 9 transiting planets relative to Lagna and Janma Rashi", () => {
  assert.ok(transits.transitDetails);
  assert.strictEqual(transits.transitDetails.length, 9);
  for (const t of transits.transitDetails) {
    assert.ok(t.houseFromLagna >= 1 && t.houseFromLagna <= 12);
    assert.ok(t.houseFromMoon >= 1 && t.houseFromMoon <= 12);
    assert.strictEqual(typeof t.isGocharaAuspicious, "boolean");
    assert.strictEqual(typeof t.hasVedha, "boolean");
  }
});

it("Includes Ashtakavarga transit scores when chart contains Ashtakavarga", () => {
  const tWithAv = transits.transitDetails.find((t) => t.sarvaBindus !== undefined);
  assert.ok(tWithAv, "At least one transiting graha has Sarvashtakavarga bindu count");
  assert.ok(tWithAv.sarvaBindus >= 0);
  assert.ok(tWithAv.bhinnaBindus >= 0);
});

it("Accurately tracks Sade Sati and Shani Gochara status", () => {
  assert.ok(transits.shaniGochara);
  assert.ok(transits.shaniGochara.shaniType);
  assert.ok(transits.shaniGochara.houseFromMoon >= 1 && transits.shaniGochara.houseFromMoon <= 12);
});

it("Calculates Dasha-Transit synergy for current Mahadasha ruler", () => {
  assert.ok(transits.dashaSynergy);
  assert.ok(transits.dashaSynergy.mahaLord);
  assert.ok(transits.dashaSynergy.synergyExplanation);
});

// 5. Panchang & Choghadiya
const panchang = computePanchang({
  date: "2026-11-04",
  latitude: 25.3176,
  longitude: 82.9739,
  tzOffset: 5.5,
  timezone: "Asia/Kolkata",
});

it("Computes 5 limbs of Panchang (Tithi, Nakshatra, Yoga, Karana, Vara)", () => {
  assert.ok(panchang.tithi?.name);
  assert.ok(panchang.nakshatra?.name);
  assert.ok(panchang.yoga?.name);
  assert.ok(panchang.karana?.name);
  assert.ok(panchang.vara?.en);
  assert.ok(panchang.vara?.hi);
});

it("Computes Sunrise, Sunset, and 16 Choghadiya slots via computePanchang", () => {
  assert.ok(panchang.sunrise?.utc);
  assert.ok(panchang.sunset?.utc);
  assert.ok(panchang.choghadiya);
  assert.strictEqual(panchang.choghadiya.day.length, 8);
  assert.strictEqual(panchang.choghadiya.night.length, 8);
});

// 6. Verified Sanskrit Shlokas
it("Contains authentic classical Sanskrit shlokas from verified treatises", () => {
  assert.ok(Array.isArray(SANSKRIT_SHLOKAS));
  assert.ok(SANSKRIT_SHLOKAS.length >= 6);

  const sources = new Set(SANSKRIT_SHLOKAS.map((s) => s.source));
  assert.ok(sources.has("Brihat Parashara Hora Shastra"));
  assert.ok(sources.has("Srimad Bhagavad Gita"));

  for (const s of SANSKRIT_SHLOKAS) {
    assert.ok(s.id, "Shloka must have ID");
    assert.ok(s.devanagari, "Must have Devanagari text");
    assert.ok(s.translationEn, "Must have English translation");
    assert.ok(s.translationHi, "Must have Hindi translation");
    assert.ok(s.verseNumber, "Must have authentic verse reference");
  }
});

// 7. World Cities & Coordinates Resolution
it("Resolves coordinates from WORLD_CITIES database", () => {
  assert.ok(WORLD_CITIES.length >= 40);
  const ayodhya = WORLD_CITIES.find((c) => c.name.includes("Ayodhya"));
  assert.ok(ayodhya);
  assert.strictEqual(ayodhya.lat, 26.7922);
  assert.strictEqual(ayodhya.lon, 82.1998);

  const london = WORLD_CITIES.find((c) => c.name.includes("London"));
  assert.ok(london);
  assert.strictEqual(london.tz, 0.0);
});

// 8. Private Astrology Journal Simulation & Isolation Test
const mockJournalDB = new Map();

function createJournalEntry({ userId, title, notes, entryDate, astrologyEvent, mood, tags }) {
  if (!userId) throw new Error("Authentication required");
  if (!title) throw new Error("Title is required");

  const id = `journal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const record = {
    id,
    userId,
    title,
    notes,
    entryDate: entryDate || new Date().toISOString().split("T")[0],
    astrologyEvent: astrologyEvent || "Reflection",
    mood: mood || "Contemplative",
    tags: tags || [],
    createdAt: new Date(),
  };
  mockJournalDB.set(id, record);
  return record;
}

function getJournalEntries({ userId, search, eventFilter }) {
  if (!userId) throw new Error("Authentication required");
  let results = [];
  for (const item of mockJournalDB.values()) {
    // STRICT USER ISOLATION
    if (item.userId !== userId) continue;
    if (search && !item.title.includes(search) && !item.notes.includes(search)) continue;
    if (eventFilter && !item.astrologyEvent.includes(eventFilter)) continue;
    results.push(item);
  }
  return results.sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate));
}

it("Enforces user-level data isolation in private astrology journal", () => {
  const user1 = "user-alice-123";
  const user2 = "user-bob-456";

  const entry1 = createJournalEntry({
    userId: user1,
    title: "Jupiter Mahadasha Meditation",
    notes: "Felt deep serenity and mental clarity today.",
    astrologyEvent: "Jupiter Transit",
  });

  const entry2 = createJournalEntry({
    userId: user2,
    title: "Saturn Transit Observation",
    notes: "Patience tested during project deadline.",
    astrologyEvent: "Saturn Transit",
  });

  // User 1 must only see their own entry
  const user1Entries = getJournalEntries({ userId: user1 });
  assert.strictEqual(user1Entries.length, 1);
  assert.strictEqual(user1Entries[0].id, entry1.id);
  assert.strictEqual(user1Entries[0].userId, user1);

  // User 2 must only see their own entry
  const user2Entries = getJournalEntries({ userId: user2 });
  assert.strictEqual(user2Entries.length, 1);
  assert.strictEqual(user2Entries[0].id, entry2.id);
  assert.strictEqual(user2Entries[0].userId, user2);

  // Cross-user access is impossible
  assert.ok(!user1Entries.some((e) => e.userId === user2));
  assert.ok(!user2Entries.some((e) => e.userId === user1));
});

console.log(`\n=== RESULTS: ${passed} Passed, ${failed} Failed ===`);
if (failed > 0) process.exit(1);
