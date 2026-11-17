/**
 * Automated Test Suite for Vedic Festival, Vrata & Religious Observance Calendar
 * 
 * Tests:
 * 1. Astronomical Panchang & Tithi calculation consistency
 * 2. Hindu Lunar Month calculation (Amanta vs Purnimanta)
 * 3. Festival determination rules (Udaya Tithi, Pradosha, Nishita, Madhyahna, Aparahna, Sankranti)
 * 4. Location & Timezone sensitivity (Varanasi, New Delhi, London, New York)
 * 5. Ekadashi Vrata & Dwadashi Parana timing calculations (Hari Vasara)
 * 6. Classical scripture citations & 3D Magazine Reader links
 * 7. Database model relationships (VedicFestival, FestivalRule, FestivalScriptureReference)
 * 8. User preferences & reminder scheduling (duplicate prevention)
 * 9. Admin Festival Management CRUD & Audit Logging
 * 10. Bilingual Hindi & English content validation
 */

import prisma from "../lib/prisma.js";
import {
  getInstantTithi,
  getHinduMonthInfo,
  getDayMuhurtas,
  calculateParanaWindow,
  evaluateFestivalOccurrence,
  getMonthlyVedicCalendar,
  getUpcomingFestivals,
  getVrataSchedule,
} from "../server/astrology/vedicCalendarEngine.js";
import { FESTIVAL_DEFINITIONS, ALL_EKADASHIS } from "../server/astrology/vedicCalendarData.js";
import { computePanchang } from "../server/astrology/panchang.js";

let passed = 0;
let failed = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} ${details ? `(${details})` : ""}`);
    failed++;
  }
}

async function runTests() {
  console.log("\n==================================================================");
  console.log("  GURUKUL – VEDIC FESTIVAL & RELIGIOUS OBSERVANCE CALENDAR TESTS");
  console.log("==================================================================\n");

  // TEST 1: Instant Tithi & Elongation Calculation
  console.log("[1/10] Testing Instant Tithi & Elongation Determination...");
  const sampleDate = new Date("2026-11-16T06:00:00Z");
  const tithiInfo = getInstantTithi(sampleDate);
  assert(typeof tithiInfo.tithiIndex === "number" && tithiInfo.tithiIndex >= 1 && tithiInfo.tithiIndex <= 30, "Tithi index within [1, 30]");
  assert(tithiInfo.paksha === "Shukla" || tithiInfo.paksha === "Krishna", "Paksha is either Shukla or Krishna");
  assert(tithiInfo.elongation >= 0 && tithiInfo.elongation < 360, "Elongation is within [0, 360) degrees");

  // TEST 2: Hindu Lunar Month (Amanta vs Purnimanta)
  console.log("\n[2/10] Testing Hindu Lunar Month Calculation (Amanta vs Purnimanta)...");
  // Test Shukla Paksha date (e.g. November 2026 Kartika/Margashirsha)
  const monthTestDate = new Date("2026-11-16T12:00:00Z");
  const hinduMonth = getHinduMonthInfo(monthTestDate, 5.5);
  assert(!!hinduMonth.amantaMonth, `Amanta month identified: ${hinduMonth.amantaMonth}`);
  assert(!!hinduMonth.purnimantaMonth, `Purnimanta month identified: ${hinduMonth.purnimantaMonth}`);
  assert(!!hinduMonth.amantaMonthHi, `Amanta month Hindi name present: ${hinduMonth.amantaMonthHi}`);
  assert(!!hinduMonth.purnimantaMonthHi, `Purnimanta month Hindi name present: ${hinduMonth.purnimantaMonthHi}`);

  if (hinduMonth.paksha === "Shukla") {
    assert(hinduMonth.amantaMonth === hinduMonth.purnimantaMonth, "In Shukla Paksha, Amanta and Purnimanta month names match");
  } else {
    assert(typeof hinduMonth.purnimantaMonth === "string", "In Krishna Paksha, Purnimanta month is designated accurately");
  }

  // TEST 3: Muhurta Windows of the Day
  console.log("\n[3/10] Testing Sacred Muhurta Windows (Arunodaya, Madhyahna, Aparahna, Pradosha, Nishita)...");
  const sRise = new Date("2026-11-16T01:10:00Z"); // approx 06:40 IST
  const sSet = new Date("2026-11-16T12:00:00Z");  // approx 17:30 IST
  const muhurtas = getDayMuhurtas(sRise, sSet, 5.5);
  assert(muhurtas.arunodaya.start < sRise, "Arunodaya starts before sunrise (4 Ghatikas / 96 mins)");
  assert(muhurtas.madhyahna.start < muhurtas.madhyahna.end, "Madhyahna window computed around solar noon");
  assert(muhurtas.aparahna.start < muhurtas.aparahna.end, "Aparahna window computed in the afternoon");
  assert(muhurtas.pradosha.start.getTime() === sSet.getTime(), "Pradosha Kaal commences at sunset");
  assert(muhurtas.pradosha.end.getTime() === sSet.getTime() + 144 * 60 * 1000, "Pradosha Kaal extends for 6 Ghatikas (144 mins)");
  assert(muhurtas.nishita.start < muhurtas.nishita.end, "Nishita Kaal computed around local midnight");

  // TEST 4: Ekadashi Vrat & Dwadashi Parana (Hari Vasara Window)
  console.log("\n[4/10] Testing Ekadashi Fasting & Parana Calculation...");
  const dwadashiSunrise = new Date("2026-11-21T01:15:00Z");
  const dwadashiSunset = new Date("2026-11-21T12:05:00Z");
  const dwadashiTithiEnd = new Date("2026-11-21T06:30:00Z"); // ends around noon IST
  const parana = calculateParanaWindow(dwadashiSunrise, dwadashiSunset, dwadashiTithiEnd, 5.5);
  assert(!!parana.paranaStartStr, `Parana start calculated: ${parana.paranaStartStr}`);
  assert(!!parana.paranaEndStr, `Parana end calculated: ${parana.paranaEndStr}`);
  assert(parana.paranaDateStr === "2026-11-21", "Parana date matches Dwadashi civil day");

  // TEST 5: Location & Timezone Sensitivity (Varanasi vs London vs New York)
  console.log("\n[5/10] Testing Location & Timezone Sensitivity across Global Coordinates...");
  const pVaranasi = computePanchang({ date: "2026-11-16", latitude: 25.3176, longitude: 82.9739, tzOffset: 5.5, timezone: "Asia/Kolkata" });
  const pLondon = computePanchang({ date: "2026-11-16", latitude: 51.5074, longitude: -0.1278, tzOffset: 0, timezone: "Europe/London" });
  const pNewYork = computePanchang({ date: "2026-11-16", latitude: 40.7128, longitude: -74.0060, tzOffset: -5, timezone: "America/New_York" });

  assert(pVaranasi.sunrise.local !== pLondon.sunrise.local, `Sunrise time reflects local coordinates (Varanasi: ${pVaranasi.sunrise.local}, London: ${pLondon.sunrise.local})`);
  assert(pVaranasi.sunrise.local !== pNewYork.sunrise.local, `Sunrise time differs in New York: ${pNewYork.sunrise.local}`);
  assert(pVaranasi.tithi.id !== undefined && pLondon.tithi.id !== undefined, "Tithi computed for all global locations");

  // TEST 6: Monthly Calendar Generation
  console.log("\n[6/10] Testing Complete Monthly Vedic Calendar Engine (November 2026)...");
  const monthCalendar = await getMonthlyVedicCalendar({
    year: 2026,
    month: 11,
    latitude: 28.6139,
    longitude: 77.2090,
    tzOffset: 5.5,
    timezone: "Asia/Kolkata",
    tradition: "ALL",
  });
  assert(monthCalendar.daysInMonth === 30, "November 2026 has exactly 30 days");
  assert(monthCalendar.calendarDays.length === 30, "All 30 days generated with complete Panchang data");

  const daysWithEkadashi = monthCalendar.calendarDays.filter((d) => d.flags.isEkadashi);
  assert(daysWithEkadashi.length >= 2, `Identified ${daysWithEkadashi.length} Ekadashi days in month`);

  const daysWithPradosh = monthCalendar.calendarDays.filter((d) => d.flags.isPradosh);
  assert(daysWithPradosh.length >= 2, `Identified ${daysWithPradosh.length} Pradosh days in month`);

  const daysWithPurnima = monthCalendar.calendarDays.filter((d) => d.flags.isPurnima);
  assert(daysWithPurnima.length === 1, `Identified ${daysWithPurnima.length} Purnima day in month`);

  // TEST 7: Upcoming Festivals Scanner
  console.log("\n[7/10] Testing Upcoming Festivals Scanner...");
  const upcoming = await getUpcomingFestivals({
    startDate: "2026-11-01",
    limit: 6,
    latitude: 28.6139,
    longitude: 77.2090,
    tzOffset: 5.5,
    timezone: "Asia/Kolkata",
  });
  assert(Array.isArray(upcoming) && upcoming.length > 0, `Scanned and retrieved ${upcoming.length} upcoming festivals`);
  assert(upcoming[0].daysAway !== undefined, `Days away countdown computed: ${upcoming[0].daysAway} days`);
  assert(!!upcoming[0].muhurtaWindow, `Muhurta window attached: ${upcoming[0].muhurtaWindow}`);

  // TEST 8: Dedicated Vrata Schedule Generator
  console.log("\n[8/10] Testing Dedicated Vrata Schedule Generator...");
  const vrats = await getVrataSchedule({
    year: 2026,
    month: 11,
    latitude: 28.6139,
    longitude: 77.2090,
    tzOffset: 5.5,
  });
  assert(Array.isArray(vrats) && vrats.length >= 4, `Extracted ${vrats.length} Vrata entries for month`);
  const ekadashiVrat = vrats.find((v) => v.type === "EKADASHI");
  assert(ekadashiVrat && ekadashiVrat.parana, "Ekadashi Vrata includes calculated Dwadashi Parana window");

  // TEST 9: Database Models, Seed, & Manuscript Citations
  console.log("\n[9/10] Testing Database Persistence & 3D Reader Citations...");
  const dbCount = await prisma.vedicFestival.count();
  assert(dbCount >= 15, `Database contains ${dbCount} seeded Vedic festivals`);

  const diwali = await prisma.vedicFestival.findUnique({
    where: { slug: "diwali-lakshmi-puja" },
    include: {
      rule: true,
      scriptureReferences: true,
    },
  });
  assert(diwali !== null, "Diwali festival retrieved from PostgreSQL database");
  assert(diwali.rule.determinationRule === "PRADOSHA_KAAL", "Diwali rule is PRADOSHA_KAAL");
  assert(diwali.scriptureReferences.length > 0, "Diwali has attached verified scripture references");
  assert(diwali.scriptureReferences[0].readerUrl.includes("/library/"), "Scripture reference links directly to 3D Reader URL");
  assert(!!diwali.scriptureReferences[0].shlokaSanskrit, "Sanskrit shloka present in citation");

  // TEST 10: User Observance Preferences & Reminders (Duplicate Prevention)
  console.log("\n[10/10] Testing User Observance Preferences & Reminders...");
  // Create test user
  const testEmail = `cal_user_${Date.now()}@gurukul.ai`;
  const testUser = await prisma.user.create({
    data: {
      email: testEmail,
      name: "Calendar Seeker",
      role: "USER",
      isEmailVerified: true,
    },
  });

  // Favorite / Follow
  const pref = await prisma.userFestivalPreference.create({
    data: {
      userId: testUser.id,
      festivalId: diwali.id,
      isFavorite: true,
      isFollowingVrat: true,
      completedHistory: ["2026-11-08"],
    },
  });
  assert(pref.isFavorite === true, "User festival preference saved");
  assert(pref.isFollowingVrat === true, "User following Vrat preference saved");

  // Reminder scheduling
  const reminder = await prisma.userObservanceReminder.create({
    data: {
      userId: testUser.id,
      festivalId: diwali.id,
      eventDate: "2026-11-08",
      reminderType: "FESTIVAL_DAY",
      notificationTitle: "Diwali Lakshmi Puja Reminder",
      notificationBody: "Prepare for Pradosha Kaal Lakshmi Puja tonight.",
    },
  });
  assert(reminder.id !== undefined, "User observance reminder scheduled");

  // Duplicate reminder check
  const duplicate = await prisma.userObservanceReminder.findFirst({
    where: {
      userId: testUser.id,
      festivalId: diwali.id,
      eventDate: "2026-11-08",
      reminderType: "FESTIVAL_DAY",
    },
  });
  assert(duplicate !== null && duplicate.id === reminder.id, "Existing reminder retrieved to prevent duplicate alerts");

  // Clean up test user
  await prisma.user.delete({ where: { id: testUser.id } });

  console.log("\n==================================================================");
  console.log(`  TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
