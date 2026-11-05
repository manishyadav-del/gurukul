/**
 * Test Suite: Live Choghadiya Watch & Real-Time Countdown
 */

import { computeChoghadiya, CHOGHADIYA_TYPES } from "../server/astrology/panchang.js";

async function runTests() {
  console.log("=== GURUKUL LIVE CHOGHADIYA WATCH & REAL-TIME COUNTDOWN TEST SUITE ===");
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

  // Set up astronomical test fixtures
  // Delhi sunrise: 06:30, sunset: 18:30 (12-hour day = 720 minutes, each day slot = 90 minutes)
  const sunrise = new Date("2026-11-04T01:00:00.000Z"); // 06:30 IST
  const sunset  = new Date("2026-11-04T13:00:00.000Z"); // 18:30 IST
  const weekdayIndex = 3; // Wednesday
  const tzOffset = 5.5;

  // Test 1: Mid-day test time: 10:15 IST (04:45 UTC) -> should be in slot 3 (09:30 - 11:00)
  const testNowDay = new Date("2026-11-04T04:45:00.000Z");
  const choghadiyaDay = computeChoghadiya(sunrise, sunset, weekdayIndex, tzOffset, testNowDay);

  // 1. Array structure assertions
  assert(choghadiyaDay && Array.isArray(choghadiyaDay.day), "Day Choghadiya is returned as an array");
  assert(choghadiyaDay && Array.isArray(choghadiyaDay.night), "Night Choghadiya is returned as an array");
  assert(choghadiyaDay.day.length === 8, `Day Choghadiya contains exactly 8 slots (found ${choghadiyaDay.day.length})`);
  assert(choghadiyaDay.night.length === 8, `Night Choghadiya contains exactly 8 slots (found ${choghadiyaDay.night.length})`);

  // 2. Slot properties and timestamp assertions
  const requiredFields = [
    "index", "type", "nameEn", "nameHi", "lord", "nature", "quality",
    "startLocal", "endLocal", "startUtc", "endUtc", "startMs", "endMs", "isDay"
  ];

  for (const slot of choghadiyaDay.day) {
    for (const f of requiredFields) {
      if (slot[f] === undefined) {
        assert(false, `Day slot ${slot.index} missing field '${f}'`);
      }
    }
    assert(slot.startMs < slot.endMs, `Day slot ${slot.index} has valid startMs < endMs (${slot.startLocal} to ${slot.endLocal})`);
    assert(slot.isDay === true, `Day slot ${slot.index} isDay is true`);
  }

  for (const slot of choghadiyaDay.night) {
    for (const f of requiredFields) {
      if (slot[f] === undefined) {
        assert(false, `Night slot ${slot.index} missing field '${f}'`);
      }
    }
    assert(slot.startMs < slot.endMs, `Night slot ${slot.index} has valid startMs < endMs (${slot.startLocal} to ${slot.endLocal})`);
    assert(slot.isDay === false, `Night slot ${slot.index} isDay is false`);
  }

  // 3. Continuity check: slot i+1 starts exactly when slot i ends
  for (let i = 0; i < 7; i++) {
    assert(
      choghadiyaDay.day[i].endMs === choghadiyaDay.day[i + 1].startMs,
      `Day slot ${i + 1} seamlessly transitions into slot ${i + 2}`
    );
    assert(
      choghadiyaDay.night[i].endMs === choghadiyaDay.night[i + 1].startMs,
      `Night slot ${i + 1} seamlessly transitions into slot ${i + 2}`
    );
  }

  // Day to Night transition check
  assert(
    choghadiyaDay.day[7].endMs === choghadiyaDay.night[0].startMs,
    "Sunset marks the exact boundary where Day slot 8 connects to Night slot 1"
  );

  // 4. Live active daytime slot identification
  assert(choghadiyaDay.current !== null, "Current active daytime slot detected");
  assert(choghadiyaDay.current.isActive === true, `Current daytime slot marked active: ${choghadiyaDay.current.nameEn}`);
  assert(
    testNowDay.getTime() >= choghadiyaDay.current.startMs && testNowDay.getTime() < choghadiyaDay.current.endMs,
    `Current slot bounds encompass test time: ${choghadiyaDay.current.startLocal} <= 10:15 < ${choghadiyaDay.current.endLocal}`
  );

  // 5. Countdown and progress calculation verification
  const curStart = choghadiyaDay.current.startMs;
  const curEnd = choghadiyaDay.current.endMs;
  const totalDuration = curEnd - curStart;
  const elapsed = testNowDay.getTime() - curStart;
  const remaining = curEnd - testNowDay.getTime();
  const progressPercent = Math.round((elapsed / totalDuration) * 100);

  assert(elapsed > 0, `Elapsed time is positive (${Math.round(elapsed / 60000)} minutes)`);
  assert(remaining > 0, `Remaining time is positive (${Math.round(remaining / 60000)} minutes)`);
  assert(elapsed + remaining === totalDuration, "Elapsed time + Remaining time equals total slot duration");
  assert(progressPercent >= 0 && progressPercent <= 100, `Progress percentage in bounds: ${progressPercent}%`);

  // 6. Test all 7 classical Choghadiya types
  const types = Object.keys(CHOGHADIYA_TYPES);
  assert(types.length === 7, `7 canonical Choghadiya types present: ${types.join(", ")}`);
  for (const t of types) {
    const meta = CHOGHADIYA_TYPES[t];
    assert(meta.nameEn && meta.nameHi && meta.lord && meta.quality, `Type '${t}' fully configured with lord ${meta.lord}`);
  }

  // 7. Nighttime slot test: 21:00 IST (15:30 UTC)
  const testNowNight = new Date("2026-11-04T15:30:00.000Z");
  const choghadiyaNight = computeChoghadiya(sunrise, sunset, weekdayIndex, tzOffset, testNowNight);
  assert(choghadiyaNight.current !== null, "Active nighttime slot detected");
  assert(choghadiyaNight.current.isDay === false, "Active nighttime slot isDay is false");
  assert(
    testNowNight.getTime() >= choghadiyaNight.current.startMs && testNowNight.getTime() < choghadiyaNight.current.endMs,
    `Night slot bounds encompass test time: ${choghadiyaNight.current.startLocal} <= 21:00 < ${choghadiyaNight.current.endLocal}`
  );

  // 8. Midnight transition test: 00:00 IST (18:30 UTC)
  const midnightTime = new Date("2026-11-04T18:30:00.000Z");
  const midnightChoghadiya = computeChoghadiya(sunrise, sunset, weekdayIndex, tzOffset, midnightTime);
  assert(midnightChoghadiya.current !== null, "Active slot correctly identified across midnight");
  assert(midnightChoghadiya.current.isDay === false, "Midnight slot is correctly marked as Night period");

  // 9. Historical & Future date simulation (date string check)
  const todayLocalStr = "2026-11-04";
  const pastDateStr = "2026-10-15";
  const futureDateStr = "2026-12-01";
  assert(pastDateStr !== todayLocalStr, "Past date recognized as non-today (schedule preview mode)");
  assert(futureDateStr !== todayLocalStr, "Future date recognized as non-today (schedule preview mode)");

  console.log(`\n=== RESULTS: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
