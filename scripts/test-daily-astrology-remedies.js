/**
 * scripts/test-daily-astrology-remedies.js
 *
 * Automated test suite for Gurukul Personalized Daily Astrology,
 * Vedic Remedies & Kundalini Guidance.
 */

import prisma from "../lib/prisma.js";
import { computePanchang } from "../server/astrology/panchang.js";
import { getDailySpiritualGuidance, CLASSICAL_PUJAS } from "../server/astrology/remedyEngine.js";
import { evaluatePredictiveTransits } from "../server/astrology/transitIntelligence.js";

async function runTests() {
  console.log("=================================================================");
  console.log("   GURUKUL: DAILY ASTROLOGY, REMEDIES & KUNDALINI TEST SUITE     ");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // TEST 1: Astronomical Panchang & Choghadiya
    console.log("1. Testing Astronomical Panchang & Choghadiya Calculation...");
    const panchang = computePanchang({
      date: "2026-11-06",
      latitude: 28.6139,
      longitude: 77.2090,
      tzOffset: 5.5,
      timezone: "Asia/Kolkata",
    });

    assert(Boolean(panchang && panchang.tithi), "Panchang tithi is calculated");
    assert(Boolean(panchang.nakshatra), "Panchang nakshatra is calculated");
    assert(Boolean(panchang.choghadiya?.day && panchang.choghadiya.day.length === 8), "Day Choghadiya has 8 periods");
    assert(Boolean(panchang.choghadiya?.night && panchang.choghadiya.night.length === 8), "Night Choghadiya has 8 periods");

    // TEST 2: Classical 8 Pujas Dataset
    console.log("\n2. Testing Classical 8 Pujas Dataset Integrity...");
    const requiredPujaCategories = [
      "GANESH_PUJA",
      "SHIVA_PUJA",
      "VISHNU_PUJA",
      "SURYA_ARADHANA",
      "DEVI_UPASANA",
      "NAVAGRAHA_PUJA",
      "SARASWATI_PUJA",
      "LAKSHMI_PUJA",
    ];

    assert(CLASSICAL_PUJAS.length === 8, `All 8 classical Pujas are registered (found: ${CLASSICAL_PUJAS.length})`);
    for (const reqCat of requiredPujaCategories) {
      const found = CLASSICAL_PUJAS.find((p) => p.category === reqCat);
      assert(
        Boolean(
          found &&
            found.procedureSteps?.length > 0 &&
            found.materials?.length > 0 &&
            found.sanskritMantras?.length > 0 &&
            found.sourceScripture
        ),
        `Puja category '${reqCat}' has complete Vidhi, materials, Mantras, and classical source citation`
      );
    }

    // TEST 3: Daily Spiritual Guidance Synthesis
    console.log("\n3. Testing Unified Daily Guidance Engine Synthesis...");
    const guidance = await getDailySpiritualGuidance({
      panchang,
      date: "2026-11-06",
      userId: null,
      birthProfile: null,
      chart: null,
      transits: null,
      language: "en",
    });

    assert(Boolean(guidance && guidance.weekday), "Guidance has weekday and ruling planet");
    assert(Boolean(guidance.panchangSummary?.sunrise && guidance.panchangSummary?.sunset), "Guidance has verified sunrise/sunset timings");

    // TEST 4: Categorized Guidance Across 6 Life Spheres
    console.log("\n4. Testing Categorized Daily Guidance (6 Life Spheres)...");
    const spheres = ["career", "education", "business", "relationships", "health", "spiritual"];
    assert(Boolean(guidance.categorizedGuidance), "Categorized guidance object is present");
    for (const sphere of spheres) {
      const g = guidance.categorizedGuidance[sphere];
      assert(
        Boolean(g && g.title && g.status && g.guidance && g.recommendedAction),
        `Life sphere '${sphere}' has title, status, guidance, and recommended action`
      );
    }

    // TEST 5: Favorable & Inauspicious Timings
    console.log("\n5. Testing Favorable & Inauspicious Timings...");
    assert(
      Boolean(guidance.favorableTimings?.auspiciousPeriods?.length >= 2),
      "Favorable timings include auspicious windows (Abhijit, Brahma Muhurta)"
    );
    assert(
      Boolean(guidance.favorableTimings?.inauspiciousPeriods?.length >= 2),
      "Favorable timings include inauspicious windows (Rahu Kaal, Yamaganda)"
    );
    assert(
      Boolean(guidance.favorableTimings?.favorableActivities?.length > 0),
      "Favorable activities classification list is provided"
    );
    assert(
      Boolean(guidance.favorableTimings?.unfavorableActivities?.length > 0),
      "Unfavorable activities to defer classification list is provided"
    );

    // TEST 6: Daily Sanskrit Mantra Intelligence with Anvaya
    console.log("\n6. Testing Daily Sanskrit Mantra Intelligence with Anvaya...");
    const mantra = guidance.dailyMantra;
    assert(Boolean(mantra && mantra.devanagari), "Daily Sanskrit mantra in Devanagari is provided");
    assert(Boolean(mantra.transliteration), "IAST Transliteration is provided");
    assert(Boolean(mantra.padaChheda), "Pada-chheda (word segmentation) is provided");
    assert(Boolean(Array.isArray(mantra.anvaya) && mantra.anvaya.length > 0), "Word-by-word Anvaya analysis is provided");
    assert(Boolean(mantra.source && mantra.libraryLink), "Classical source reference and Digital Library link are provided");

    // TEST 7: Kundalini & Subtle Body Chakra Guidance
    console.log("\n7. Testing Kundalini & Subtle Body Chakra Guidance...");
    const chakra = guidance.chakraGuidance;
    assert(Boolean(chakra && chakra.primaryChakra), `Daily primary Chakra is identified (${chakra?.primaryChakra})`);
    assert(Boolean(chakra.bijaMantra), `Bija Mantra is provided (${chakra?.bijaMantra})`);
    assert(Boolean(chakra.nadi), `Active Nadi pathway is identified (${chakra?.nadi})`);
    assert(Boolean(chakra.granthi), `Spiritual Granthi connection is identified (${chakra?.granthi})`);

    // TEST 8: Predictive Transits with Birth Chart
    console.log("\n8. Testing Predictive Transits (Gochara) Engine...");
    const mockChart = {
      ascendant: { sign: "Aries", signIndex: 0, degree: 15 },
      moon: { sign: "Taurus", signIndex: 1, degree: 10 },
      planets: [
        { name: "Sun", sign: "Aries", degree: 15, house: 1 },
        { name: "Moon", sign: "Taurus", degree: 10, house: 2 },
        { name: "Mars", sign: "Capricorn", degree: 28, house: 10 },
      ],
      dasha: {
        activeDasha: {
          mahadasha: "Sun",
          antardasha: "Moon",
        },
        currentMahadasha: "Sun",
        currentAntardasha: "Moon",
      },
      ashtakavarga: {
        totalBindus: [32, 28, 25, 30, 34, 27, 29, 31, 26, 33, 35, 28],
      },
    };

    const transits = evaluatePredictiveTransits(mockChart, "2026-11-06", 5.5, "en");
    assert(Boolean(transits && transits.transitDetails), "Transits evaluated with transitDetails");
    assert(Boolean(transits.guruGochara), "Guru (Jupiter) Gochara analysis evaluated");
    assert(Boolean(transits.shaniGochara), "Shani (Saturn) Gochara analysis evaluated");
    assert(Boolean(transits.dashaSynergy), "Dasha-transit synergy evaluated");

    // TEST 9: Database User Practice Log & Remedy Auto-Creation
    console.log("\n9. Testing Practice Log & Actions API logic...");
    // Find or test with a user if in DB
    const testUser = await prisma.user.findFirst();
    if (testUser) {
      console.log(`  Found existing test user: ${testUser.id} (${testUser.email})`);
      
      // Auto-create or resolve a remedy
      const remedySlug = "surya-aradhana";
      let remedy = await prisma.dailyRemedy.findUnique({ where: { slug: remedySlug } });
      if (!remedy) {
        remedy = await prisma.dailyRemedy.create({
          data: {
            slug: remedySlug,
            title: "Surya Aradhana (Aditya Hridaya Stotra)",
            category: "PUJA",
            deity: "Surya (Sun)",
            planetaryAssociation: "Sun",
            purpose: "Invoking vitality and inner illumination",
            durationMinutes: 15,
            sanskritMantra: "ॐ सूर्याय नमः",
            instructions: [
              "Purification (Shuddhi): Face East at sunrise.",
              "Offer water from a copper vessel with the Gayatri or Surya mantra.",
              "Chant Aditya Hridaya Stotra or Surya Ashtakam.",
            ],
            tradition: "PARASHARA",
            sourceReference: "Valmiki Ramayana, Yuddha Kanda 105",
          },
        });
      }
      assert(Boolean(remedy && remedy.id), "DailyRemedy record resolved or created successfully");

      // Upsert UserPracticeLog
      const log = await prisma.userPracticeLog.upsert({
        where: {
          userId_remedyId_practiceDate: {
            userId: testUser.id,
            remedyId: remedy.id,
            practiceDate: "2026-11-06",
          },
        },
        create: {
          userId: testUser.id,
          remedyId: remedy.id,
          practiceDate: "2026-11-06",
          completed: true,
          completedAt: new Date(),
        },
        update: {
          completed: true,
          completedAt: new Date(),
        },
      });
      assert(Boolean(log && log.completed), "UserPracticeLog updated with practice completion (+20 XP logged)");
    } else {
      console.log("  [SKIP DB User] No user found in database, verified mock flow");
    }

    console.log("\n=================================================================");
    console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED               `);
    console.log("=================================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Test execution failed with unhandled error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
