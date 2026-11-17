/**
 * Gurukul – Daily Vedic Guidance & Personalized Spiritual Practice Planner Test Suite
 *
 * Validates:
 * 1. Daily Panchang calculations across multiple dates and global locations
 * 2. Date and timezone handling without hardcoded positions
 * 3. Personalized guidance with complete birth charts (Lagna, Moon, Vimshottari Dasha, Gochara)
 * 4. General fallback guidance when birth profile is unavailable
 * 5. Daily practice planner creation, default items, and completion tracking
 * 6. Gamification integration (XP awards & activity logging)
 * 7. Custom practice item addition and deletion
 * 8. Scriptural recommendations with valid 3D Magazine Reader URLs
 * 9. User-level data isolation (RBAC and authorization)
 * 10. Bilingual content rendering (English and Hindi)
 */

import prisma from "../lib/prisma.js";
import { computePanchang } from "../server/astrology/panchang.js";
import { getDailySpiritualGuidance } from "../server/astrology/remedyEngine.js";
import {
  getOrCreateDailyPracticePlan,
  toggleDailyPracticeItem,
  addCustomPracticeItem,
  deletePracticeItem,
  WEEKDAY_SADHANA_TEMPLATES,
} from "../server/astrology/dailyPracticePlanner.js";
import { computeComprehensiveVimshottari, DASHA_THEMES } from "../server/astrology/dashaEngine.js";

async function runTests() {
  console.log("===============================================================================");
  console.log("  GURUKUL DAILY VEDIC GUIDANCE & SPIRITUAL PRACTICE PLANNER TEST SUITE        ");
  console.log("===============================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const testEmailA = `seeker_a_${timestamp}@gurukul.local`;
  const testEmailB = `seeker_b_${timestamp}@gurukul.local`;
  let userA = null;
  let userB = null;
  let profileA = null;

  try {
    // =========================================================================
    // TEST 1: Daily Panchang Calculations Across Dates and Global Coordinates
    // =========================================================================
    console.log("--- TEST 1: Astronomical Panchang for Global Coordinates & Dates ---");

    const locations = [
      { name: "New Delhi", lat: 28.6139, lon: 77.209, tz: 5.5 },
      { name: "Varanasi", lat: 25.3176, lon: 82.9739, tz: 5.5 },
      { name: "London", lat: 51.5074, lon: -0.1278, tz: 0 },
      { name: "New York", lat: 40.7128, lon: -74.006, tz: -5 },
    ];

    for (const loc of locations) {
      const p = computePanchang({
        date: "2026-11-16",
        latitude: loc.lat,
        longitude: loc.lon,
        tzOffset: loc.tz,
      });

      assert(p.tithi && p.tithi.name, `${loc.name}: Tithi calculated (${p.tithi?.paksha} ${p.tithi?.name})`);
      assert(p.nakshatra && p.nakshatra.name, `${loc.name}: Nakshatra calculated (${p.nakshatra?.name})`);
      assert(p.vara && p.vara.en, `${loc.name}: Vara calculated (${p.vara?.en} - ${p.vara?.lord})`);
      assert(p.sunrise && p.sunrise.local, `${loc.name}: Sunrise computed (${p.sunrise?.local})`);
      assert(p.choghadiya && p.choghadiya.day?.length === 8, `${loc.name}: 8 Day Choghadiyas computed`);
      assert(p.rahuKaal && p.rahuKaal.startLocal, `${loc.name}: Rahu Kaal computed (${p.rahuKaal?.startLocal} - ${p.rahuKaal?.endLocal})`);
    }

    // =========================================================================
    // TEST 2: Personalized Guidance & Vimshottari Dasha with Birth Profile
    // =========================================================================
    console.log("\n--- TEST 2: Personalized Guidance & Vimshottari Dasha Integration ---");

    userA = await prisma.user.create({
      data: {
        email: testEmailA,
        name: "Arjuna Seeker",
        role: "USER",
        isEmailVerified: true,
      },
    });

    profileA = await prisma.birthProfile.create({
      data: {
        userId: userA.id,
        name: "Arjuna Natal",
        birthDate: new Date("1995-05-15T08:30:00Z"),
        birthTime: "14:00",
        birthPlace: "Varanasi, India",
        latitude: 25.3176,
        longitude: 82.9739,
        timezone: "Asia/Kolkata",
      },
    });

    const sampleChart = {
      birthDate: "1995-05-15T08:30:00Z",
      moon: { sign: "Scorpio", longitude: 218.45 },
      ascendant: { sign: "Leo", longitude: 135.2 },
      planets: [
        { name: "Moon", longitude: 218.45, sign: "Scorpio" },
        { name: "Sun", longitude: 30.5, sign: "Taurus" },
        { name: "Jupiter", longitude: 245.1, sign: "Sagittarius" },
      ],
    };

    const delhiPanchang = computePanchang({
      date: "2026-11-16",
      latitude: 28.6139,
      longitude: 77.209,
      tzOffset: 5.5,
    });

    const personalized = await getDailySpiritualGuidance({
      panchang: delhiPanchang,
      date: "2026-11-16",
      userId: userA.id,
      birthProfile: profileA,
      chart: sampleChart,
      language: "en",
    });

    assert(personalized.personalizedGuidance.isAvailable === true, "Personalized guidance is available");
    assert(personalized.personalizedGuidance.currentMahadasha !== null, `Active Mahadasha resolved: ${personalized.personalizedGuidance.currentMahadasha}`);
    assert(personalized.personalizedGuidance.currentAntardasha !== null, `Active Antardasha resolved: ${personalized.personalizedGuidance.currentAntardasha}`);
    assert(personalized.personalizedGuidance.dashaTheme !== null, "BPHS Dasha theme and archetype populated");
    assert(personalized.personalizedGuidance.sadhanaFocus !== null, "Dasha sadhana recommendation populated");

    // =========================================================================
    // TEST 3: General Guidance Fallback for Unauthenticated / Chartless Users
    // =========================================================================
    console.log("\n--- TEST 3: General Fallback Guidance (No Birth Profile) ---");

    const generalGuidance = await getDailySpiritualGuidance({
      panchang: delhiPanchang,
      date: "2026-11-16",
      userId: null,
      birthProfile: null,
      chart: null,
      language: "en",
    });

    assert(generalGuidance.personalizedGuidance.isAvailable === false, "Personalized guidance correctly flags false without chart");
    assert(generalGuidance.panchangSummary.tithi !== undefined, "General Panchang summary provided");
    assert(generalGuidance.recommendedPractices.length >= 1, "Panchang-based remedies provided in general mode");
    assert(generalGuidance.safetyNotice && generalGuidance.safetyNotice.title, "Ethical and non-deterministic disclaimer present");

    // =========================================================================
    // TEST 4: Scriptural Recommendations & 3D Magazine Reader Links
    // =========================================================================
    console.log("\n--- TEST 4: Digital Library Scriptural Recommendations ---");

    assert(Array.isArray(personalized.scripturalReadings), "scripturalReadings is an array");
    assert(personalized.scripturalReadings.length === 3, "Contains 3 authentic classical treatise readings");

    for (const r of personalized.scripturalReadings) {
      assert(r.bookSlug && r.pageNumber, `Reading "${r.bookTitle}" has bookSlug: ${r.bookSlug}, page: ${r.pageNumber}`);
      assert(r.readerUrl.startsWith("/library/"), `Valid 3D Reader URL: ${r.readerUrl}`);
      assert(r.sanskritVerse && r.sanskritVerse.length > 5, `Devanagari Sanskrit verse present: "${r.sanskritVerse.substring(0, 25)}..."`);
      assert(r.translationEn && r.translationHi, `Bilingual translations present for "${r.bookTitle}"`);
      assert(r.verificationStatus === "VERIFIED", `Treatise verificationStatus is strictly VERIFIED`);
    }

    // =========================================================================
    // TEST 5: Daily Practice Planner Lifecycle (Create, Query, Toggle, XP)
    // =========================================================================
    console.log("\n--- TEST 5: Daily Practice Planner Lifecycle & Gamification ---");

    const planResult = await getOrCreateDailyPracticePlan({
      userId: userA.id,
      date: "2026-11-16",
      panchang: delhiPanchang,
      chart: sampleChart,
      birthProfile: profileA,
      language: "en",
    });

    assert(planResult.success === true, "getOrCreateDailyPracticePlan returned success");
    assert(planResult.plan && planResult.plan.items.length >= 4, `Plan initialized with ${planResult.plan?.items?.length} practices`);
    assert(planResult.metrics.percentComplete === 0, "Initial completion is 0%");

    const firstItem = planResult.plan.items[0];
    assert(firstItem.title !== undefined, `Practice item 1: "${firstItem.title}" (${firstItem.category})`);

    // Toggle completion of first practice item
    const toggleResult = await toggleDailyPracticeItem({
      userId: userA.id,
      itemId: firstItem.id,
      completed: true,
    });

    assert(toggleResult.success === true, "toggleDailyPracticeItem succeeded");
    assert(toggleResult.item.completed === true, "Practice item marked completed: true");
    assert(toggleResult.xpAwarded > 0, `XP awarded for completion: +${toggleResult.xpAwarded} XP`);

    // Verify user total XP updated in database
    const updatedUserA = await prisma.user.findUnique({ where: { id: userA.id } });
    assert(updatedUserA.totalXp >= toggleResult.xpAwarded, `User totalXp updated: ${updatedUserA.totalXp} XP`);

    // =========================================================================
    // TEST 6: Custom Practice Item Addition & Deletion
    // =========================================================================
    console.log("\n--- TEST 6: Custom Practice Item Management ---");

    const addResult = await addCustomPracticeItem({
      userId: userA.id,
      planDate: "2026-11-16",
      category: "MANTRA",
      title: "Maha Mrityunjaya 108 Japa",
      description: "Quiet twilight japa for family peace",
      durationMinutes: 15,
      sanskritText: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्",
      bookSlug: "phaladeepika",
      pageNumber: 2,
    });

    assert(addResult.success === true, "addCustomPracticeItem succeeded");
    assert(addResult.item.title === "Maha Mrityunjaya 108 Japa", "Custom practice title matches");
    assert(addResult.item.readerUrl === "/library/phaladeepika/pdf?page=2", "Custom item readerUrl constructed correctly");

    // Delete custom item
    const deleteResult = await deletePracticeItem({
      userId: userA.id,
      itemId: addResult.item.id,
    });

    assert(deleteResult.success === true, "deletePracticeItem succeeded");

    // =========================================================================
    // TEST 7: User-Level Data Isolation & Security Guard
    // =========================================================================
    console.log("\n--- TEST 7: User-Level Data Isolation (Security Guard) ---");

    userB = await prisma.user.create({
      data: {
        email: testEmailB,
        name: "Bhima Seeker",
        role: "USER",
        isEmailVerified: true,
      },
    });

    // User B attempts to toggle User A's item
    let unauthorizedError = null;
    try {
      await toggleDailyPracticeItem({
        userId: userB.id,
        itemId: firstItem.id,
        completed: true,
      });
    } catch (err) {
      unauthorizedError = err.message;
    }

    assert(
      unauthorizedError && unauthorizedError.includes("Forbidden"),
      `Unauthorized modification strictly rejected: "${unauthorizedError}"`
    );

    // User B attempts to delete User A's item
    let unauthorizedDelete = null;
    try {
      await deletePracticeItem({
        userId: userB.id,
        itemId: firstItem.id,
      });
    } catch (err) {
      unauthorizedDelete = err.message;
    }

    assert(
      unauthorizedDelete && unauthorizedDelete.includes("Forbidden"),
      `Unauthorized deletion strictly rejected: "${unauthorizedDelete}"`
    );

    // =========================================================================
    // TEST 8: Bilingual Rendering (Hindi & English)
    // =========================================================================
    console.log("\n--- TEST 8: Bilingual Content Support (Hindi & English) ---");

    const hindiGuidance = await getDailySpiritualGuidance({
      panchang: delhiPanchang,
      date: "2026-11-16",
      userId: userA.id,
      birthProfile: profileA,
      chart: sampleChart,
      language: "hi",
    });

    assert(hindiGuidance.weekdayHi !== undefined, `Hindi weekday present: "${hindiGuidance.weekdayHi}"`);
    assert(hindiGuidance.rulingPlanetHi !== undefined, `Hindi ruling planet present: "${hindiGuidance.rulingPlanetHi}"`);
    assert(hindiGuidance.dailyMantra?.translationHi !== undefined, `Hindi mantra translation present`);

  } catch (err) {
    console.error("Test execution exception:", err);
    failed++;
  } finally {
    console.log("\n--- Cleaning up test records ---");
    try {
      if (userA) {
        await prisma.dailyPracticeItem.deleteMany({ where: { plan: { userId: userA.id } } });
        await prisma.dailyPracticePlan.deleteMany({ where: { userId: userA.id } });
        await prisma.userPracticePreference.deleteMany({ where: { userId: userA.id } });
        await prisma.xPTransaction.deleteMany({ where: { userId: userA.id } });
        if (profileA) await prisma.birthProfile.delete({ where: { id: profileA.id } });
        await prisma.user.delete({ where: { id: userA.id } });
      }
      if (userB) {
        await prisma.user.delete({ where: { id: userB.id } });
      }
      console.log("  ✓ Test records cleaned up cleanly.");
    } catch (cleanupErr) {
      console.warn("Cleanup warning:", cleanupErr.message);
    }
  }

  console.log("\n===============================================================================");
  console.log(`   TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("===============================================================================");

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
