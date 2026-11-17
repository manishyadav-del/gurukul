/**
 * Gurukul: Location Hierarchy & First-Letter Autocomplete Test Suite
 */

import assert from "node:assert/strict";
import {
  LOCATION_HIERARCHY,
  getAvailableCountries,
  getStatesForCountry,
  getTownsForState,
  filterByFirstLetter,
  searchAllLocations,
  resolveLocationAutomatically,
  formatTzOffset,
} from "../components/astrology/worldLocations.js";

async function runHierarchyTests() {
  console.log("============================================================");
  console.log("   Gurukul: Location Hierarchy & Autocomplete Tests         ");
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

  // 1. Countries Hierarchy
  test("Available countries are listed with India prioritized first", () => {
    const countries = getAvailableCountries();
    assert.ok(countries.length >= 10, "Should have at least 10 countries");
    assert.equal(countries[0], "India", "India must be first");
    assert.equal(countries[1], "Nepal", "Nepal must be second");
    assert.ok(countries.includes("United States"));
    assert.ok(countries.includes("United Kingdom"));
  });

  // 2. States for Country
  test("States for India contains major Vedic regions and sacred states", () => {
    const states = getStatesForCountry("India");
    assert.ok(states.length >= 15, "India should have at least 15 states listed");
    assert.ok(states.includes("Uttar Pradesh"));
    assert.ok(states.includes("Uttarakhand"));
    assert.ok(states.includes("Maharashtra"));
    assert.ok(states.includes("Madhya Pradesh"));
    assert.ok(states.includes("Gujarat"));
    assert.ok(states.includes("Rajasthan"));
    assert.ok(states.includes("Bihar"));
    assert.ok(states.includes("Tamil Nadu"));
    assert.ok(states.includes("Karnataka"));
  });

  // 3. Towns for State
  test("Towns for Uttar Pradesh include Varanasi, Ayodhya, Mathura, Deoria, Gorakhpur", () => {
    const towns = getTownsForState("India", "Uttar Pradesh");
    assert.ok(towns.length >= 10, "Should have 10+ towns in UP");
    const names = towns.map((t) => t.name);
    assert.ok(names.some((n) => n.includes("Varanasi")));
    assert.ok(names.some((n) => n.includes("Ayodhya")));
    assert.ok(names.some((n) => n.includes("Mathura")));
    assert.ok(names.some((n) => n.includes("Deoria")));
    assert.ok(names.some((n) => n.includes("Gorakhpur")));

    // Verify all towns have lat, lon, tz
    for (const town of towns) {
      assert.ok(typeof town.lat === "number" && town.lat >= -90 && town.lat <= 90);
      assert.ok(typeof town.lon === "number" && town.lon >= -180 && town.lon <= 180);
      assert.ok(typeof town.tz === "number");
    }
  });

  // 4. First Letter Filtering
  test("Filter by first letter 'u' correctly returns Uttar Pradesh and Uttarakhand first", () => {
    const states = getStatesForCountry("India");
    const filtered = filterByFirstLetter(states, "u");
    assert.ok(filtered.length >= 2);
    assert.equal(filtered[0], "Uttar Pradesh");
    assert.equal(filtered[1], "Uttarakhand");
  });

  test("Filter towns by first letter 'v' returns Varanasi, Vrindavan first", () => {
    const towns = getTownsForState("India", "Uttar Pradesh");
    const filtered = filterByFirstLetter(towns, "v");
    assert.ok(filtered.length >= 2);
    assert.ok(filtered[0].name.toLowerCase().startsWith("v"));
    assert.ok(filtered[1].name.toLowerCase().startsWith("v"));
  });

  test("Filter towns by first letter 'd' returns Deoria first", () => {
    const towns = getTownsForState("India", "Uttar Pradesh");
    const filtered = filterByFirstLetter(towns, "d");
    assert.ok(filtered.length >= 1);
    assert.equal(filtered[0].name, "Deoria");
  });

  // 5. Automatic Calculation & Resolution
  test("resolveLocationAutomatically auto-computes lat, lon, and timezone for town name", () => {
    const resolved = resolveLocationAutomatically("Varanasi");
    assert.ok(resolved);
    assert.ok(resolved.name.includes("Varanasi"));
    assert.equal(resolved.lat, 25.3176);
    assert.equal(resolved.lon, 82.9739);
    assert.equal(resolved.tz, 5.5);
    assert.equal(resolved.tzStr, "Asia/Kolkata");
  });

  test("resolveLocationAutomatically auto-computes for Deoria", () => {
    const resolved = resolveLocationAutomatically("Deoria");
    assert.ok(resolved);
    assert.equal(resolved.lat, 26.5024);
    assert.equal(resolved.lon, 83.7791);
    assert.equal(resolved.tz, 5.5);
  });

  test("searchAllLocations returns scored results from any first letter or partial query", () => {
    const results = searchAllLocations("kashi");
    assert.ok(results.length >= 1);
    assert.ok(results[0].name.includes("Varanasi (Kashi)"));
    assert.equal(results[0].country, "India");
    assert.equal(results[0].state, "Uttar Pradesh");
  });

  console.log(`\n============================================================`);
  console.log(`   Hierarchy Results: ${passed} / ${total} tests passed     `);
  console.log(`============================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runHierarchyTests().catch((e) => {
  console.error("Test execution error:", e);
  process.exit(1);
});
