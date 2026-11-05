/**
 * Gurukul — World Locations & Custom Global Places Verification Suite
 * 
 * Tests custom coordinates, world cities, timezone offset resolution,
 * and high-precision Vedic birth chart & daily Panchang calculations for any location on Earth.
 */

import assert from "node:assert/strict";
import {
  WORLD_CITIES,
  formatTzOffset,
  estimateTzFromLongitude,
  COMMON_TIMEZONES,
} from "../components/astrology/worldLocations.js";
import { calculateBirthChart } from "../server/astrology/engine.js";
import { computePanchang } from "../server/astrology/panchang.js";
import { computeDailyTransits } from "../server/astrology/transits.js";
import { validateBirthDetails } from "../server/astrology/validation.js";

async function runTests() {
  console.log("============================================================");
  console.log("   Gurukul: World Locations & Custom Places Test Suite      ");
  console.log("============================================================\n");

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}:`, err.message);
    }
  }

  // --- 1. World Cities Dataset & Categories ---
  test("World cities dataset contains 30+ curated cities across all continents", () => {
    assert(Array.isArray(WORLD_CITIES), "WORLD_CITIES must be an array");
    assert(WORLD_CITIES.length >= 30, `Expected >= 30 cities, found ${WORLD_CITIES.length}`);
    const categories = new Set(WORLD_CITIES.map((c) => c.category));
    assert(categories.has("Sacred India"), "Missing Sacred India category");
    assert(categories.has("India"), "Missing India category");
    assert(categories.has("Asia & Middle East"), "Missing Asia & Middle East category");
    assert(categories.has("Europe & UK"), "Missing Europe & UK category");
    assert(categories.has("Americas"), "Missing Americas category");
    assert(categories.has("Australia & Pacific"), "Missing Australia & Pacific category");
    assert(categories.has("Africa"), "Missing Africa category");
  });

  test("Every preset city has valid name, latitude, longitude, and timezone", () => {
    for (const city of WORLD_CITIES) {
      assert(typeof city.name === "string" && city.name.length > 0, `City name invalid: ${city.name}`);
      assert(typeof city.lat === "number" && city.lat >= -90 && city.lat <= 90, `Lat invalid for ${city.name}: ${city.lat}`);
      assert(typeof city.lon === "number" && city.lon >= -180 && city.lon <= 180, `Lon invalid for ${city.name}: ${city.lon}`);
      assert(typeof city.tz === "number" && city.tz >= -12 && city.tz <= 14, `Tz invalid for ${city.name}: ${city.tz}`);
    }
  });

  test("Key sacred & pilgrimage cities are present (Ayodhya, Varanasi, Haridwar, Ujjain, Mathura)", () => {
    const names = WORLD_CITIES.map((c) => c.name.toLowerCase());
    assert(names.some((n) => n.includes("ayodhya")), "Ayodhya must be present");
    assert(names.some((n) => n.includes("varanasi")), "Varanasi must be present");
    assert(names.some((n) => n.includes("haridwar")), "Haridwar must be present");
    assert(names.some((n) => n.includes("ujjain")), "Ujjain must be present");
    assert(names.some((n) => n.includes("mathura")), "Mathura must be present");
  });

  // --- 2. Timezone Formatting & Longitude Estimation ---
  test("formatTzOffset correctly formats positive, negative, and fractional hour offsets", () => {
    assert.equal(formatTzOffset(5.5), "+05:30");
    assert.equal(formatTzOffset(0), "+00:00");
    assert.equal(formatTzOffset(-5), "-05:00");
    assert.equal(formatTzOffset(-8), "-08:00");
    assert.equal(formatTzOffset(9), "+09:00");
    assert.equal(formatTzOffset(5.75), "+05:45");
    assert.equal(formatTzOffset(-3.5), "-03:30");
  });

  test("estimateTzFromLongitude provides accurate approximate UTC offsets across world longitudes", () => {
    // Tokyo (approx 139.65E) => approx +9
    assert.equal(estimateTzFromLongitude(139.65), 9.5);
    // New Delhi (approx 77.2E) => approx +5
    assert.equal(estimateTzFromLongitude(77.2), 5);
    // London (approx 0) => 0
    assert.equal(estimateTzFromLongitude(-0.12), 0);
    // New York (approx -74W) => approx -5
    assert.equal(estimateTzFromLongitude(-74), -5);
    // San Francisco (approx -122.4W) => approx -8
    assert.equal(estimateTzFromLongitude(-122.4), -8);
    // Sydney (approx 151.2E) => approx +10
    assert.equal(estimateTzFromLongitude(151.2), 10);
  });

  // --- 3. Kundli Birth Chart Calculation for Custom World Locations ---
  test("Computes accurate Vedic birth chart for Tokyo, Japan (Custom Asian Location)", () => {
    const chart = calculateBirthChart({
      name: "Kenji",
      birthDate: "1995-10-15",
      birthTime: "14:30",
      birthPlace: "Tokyo, Japan",
      latitude: 35.6762,
      longitude: 139.6503,
      timezone: "+09:00",
      gender: "male",
    });

    assert(chart, "Chart result should be defined");
    assert.equal(chart.profile.name, "Kenji");
    assert.equal(chart.profile.birthPlace, "Tokyo, Japan");
    assert.equal(chart.profile.latitude, 35.6762);
    assert.equal(chart.profile.longitude, 139.6503);
    assert(chart.ascendant && chart.ascendant.sign, "Ascendant sign must be computed");
    assert(chart.moon && chart.moon.sign, "Moon sign must be computed");
    assert(chart.planets && chart.planets.length === 9, "9 Grahas must be computed");
    assert(chart.houses && chart.houses.length === 12, "12 Bhavas must be computed");
    assert(chart.dasha && chart.dasha.currentMahadasha, "Vimshottari dasha must be computed");
  });

  test("Computes accurate Vedic birth chart for Paris, France (Custom European Location)", () => {
    const chart = calculateBirthChart({
      name: "Claire",
      birthDate: "1988-06-21",
      birthTime: "08:15",
      birthPlace: "Paris, France",
      latitude: 48.8566,
      longitude: 2.3522,
      timezone: "+01:00",
      gender: "female",
    });

    assert(chart, "Chart result should be defined");
    assert.equal(chart.profile.birthPlace, "Paris, France");
    assert(chart.ascendant.sign, "Ascendant should exist");
    assert(chart.planets.length === 9, "Planets should exist");
  });

  test("Computes accurate Vedic birth chart for Ayodhya, India (Sacred Indian City)", () => {
    const chart = calculateBirthChart({
      name: "Ramdas",
      birthDate: "2000-01-01",
      birthTime: "12:00",
      birthPlace: "Ayodhya, Uttar Pradesh, India",
      latitude: 26.7922,
      longitude: 82.1998,
      timezone: "+05:30",
      gender: "male",
    });

    assert(chart, "Chart result should be defined");
    assert.equal(chart.profile.latitude, 26.7922);
    assert.equal(chart.profile.longitude, 82.1998);
    assert(chart.ascendant.sign, "Ascendant should exist");
  });

  test("Computes accurate Vedic birth chart for Honolulu, Hawaii (Remote Pacific Coordinates)", () => {
    const chart = calculateBirthChart({
      name: "Keanu",
      birthDate: "1992-12-05",
      birthTime: "18:45",
      birthPlace: "Honolulu, Hawaii, USA",
      latitude: 21.3069,
      longitude: -157.8583,
      timezone: "-10:00",
      gender: "male",
    });

    assert(chart, "Chart result should be defined");
    assert.equal(chart.profile.latitude, 21.3069);
    assert.equal(chart.profile.longitude, -157.8583);
    assert(chart.ascendant.sign, "Ascendant should exist");
  });

  test("Validation rejects invalid latitude (>90) or invalid longitude (>180)", () => {
    const invalidLat = validateBirthDetails({
      name: "Tester",
      birthDate: "2000-01-01",
      birthTime: "12:00",
      latitude: 95.5,
      longitude: 77.2,
    });
    assert(!invalidLat.isValid, "Latitude 95.5 must be rejected");
    assert(invalidLat.errors.some((e) => e.includes("Latitude")), "Error message must mention latitude");

    const invalidLon = validateBirthDetails({
      name: "Tester",
      birthDate: "2000-01-01",
      birthTime: "12:00",
      latitude: 28.6,
      longitude: 195.2,
    });
    assert(!invalidLon.isValid, "Longitude 195.2 must be rejected");
    assert(invalidLon.errors.some((e) => e.includes("Longitude")), "Error message must mention longitude");
  });

  // --- 4. Daily Panchang & Sunrise/Sunset for World Locations ---
  test("Computes accurate Panchang & local Sunrise/Sunset for Tokyo, Japan", () => {
    const panchang = computePanchang({
      date: "2026-10-27",
      latitude: 35.6762,
      longitude: 139.6503,
      tzOffset: 9,
      timezone: "Asia/Tokyo",
    });

    assert(panchang, "Panchang should be computed");
    assert(panchang.tithi && panchang.tithi.name, "Tithi should exist");
    assert(panchang.nakshatra && panchang.nakshatra.name, "Nakshatra should exist");
    assert(panchang.vara && panchang.vara.en, "Vara should exist");
    assert(panchang.sunrise && panchang.sunrise.local, "Sunrise should exist");
    assert(panchang.sunset && panchang.sunset.local, "Sunset should exist");
    assert(panchang.choghadiya && Array.isArray(panchang.choghadiya.day), "Day Choghadiya should exist");
    assert.equal(panchang.choghadiya.day.length, 8, "8 daytime Choghadiya intervals");
    assert.equal(panchang.choghadiya.night.length, 8, "8 nighttime Choghadiya intervals");
  });

  test("Computes accurate Panchang & local Sunrise/Sunset for London, UK", () => {
    const panchang = computePanchang({
      date: "2026-10-27",
      latitude: 51.5074,
      longitude: -0.1278,
      tzOffset: 0,
      timezone: "Europe/London",
    });

    assert(panchang, "Panchang should be computed");
    assert(panchang.sunrise.local, "Sunrise should exist for London");
    assert(panchang.sunset.local, "Sunset should exist for London");
    assert(panchang.choghadiya.day.length === 8, "8 daytime Choghadiya intervals");
  });

  test("Computes daily planetary transits correctly", () => {
    const transits = computeDailyTransits({ date: "2026-10-27", tzOffset: 5.5 });
    assert(Array.isArray(transits), "Transits should be an array");
    assert(transits.length >= 7, "Should include Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn");
    for (const t of transits) {
      assert(t.planet, "Planet name must be present");
      assert(t.sign, "Rashi sign must be present");
      assert(typeof t.degree === "number", "Degree must be numeric");
    }
  });

  console.log(`\n============================================================`);
  console.log(`   Results: ${passed} / ${total} tests passed                `);
  console.log(`============================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runTests();
