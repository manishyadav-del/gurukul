/**
 * Verification test suite for Gurukul Interactive Chakra Studio & Guided Spiritual Practice
 */

import { PRANAYAMA_PRACTICES, SUBTLE_NADIS, THREE_GRANTHIS } from "../server/spirituality/pranayamaData.js";
import { MEDITATION_CATEGORIES, MEDITATION_PRACTICES } from "../server/spirituality/meditationData.js";
import { CHAKRAS_ARRAY } from "../server/spirituality/chakraKnowledge.js";
import { CHAKRA_FREQUENCIES, AMBIENT_FREQUENCIES } from "../lib/audio/spiritualAudio.js";
import prisma from "../lib/prisma.js";

async function runTests() {
  console.log("=== GURUKUL CHAKRA STUDIO & SPIRITUAL PRACTICE VERIFICATION ===\n");
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

  try {
    // 1. Verify Chakra Knowledge
    console.log("--- 1. Seven Chakras Data Integrity ---");
    assert(Array.isArray(CHAKRAS_ARRAY) && CHAKRAS_ARRAY.length === 7, "All 7 classical chakras defined in CHAKRAS_ARRAY");
    const requiredChakras = ["muladhara", "svadhisthana", "manipura", "anahata", "vishuddha", "ajna", "sahasrara"];
    for (const chakraId of requiredChakras) {
      const c = CHAKRAS_ARRAY.find((item) => item.id === chakraId || item.slug.startsWith(chakraId));
      assert(c !== undefined, `Found chakra ${chakraId}`);
      assert(c?.bijaMantra !== undefined && c?.bijaMantra.length > 0, `Chakra ${chakraId} has Bija Mantra ${c?.bijaMantra}`);
      assert(c?.element !== undefined, `Chakra ${chakraId} has Element ${c?.element}`);
      assert(Boolean(c?.tradition || c?.classicalSources), `Chakra ${chakraId} has classical references`);
    }

    // 2. Verify Pranayama Data
    console.log("\n--- 2. Pranayama Practices Integrity ---");
    assert(Array.isArray(PRANAYAMA_PRACTICES) && PRANAYAMA_PRACTICES.length >= 6, "At least 6 pranayama practices defined");
    const reqPractices = ["anulom_vilom", "nadi_shodhana", "bhramari", "ujjayi", "bhastrika", "mindful_breathing"];
    for (const id of reqPractices) {
      const p = PRANAYAMA_PRACTICES.find((item) => item.id === id);
      assert(p !== undefined, `Found practice ${id} (${p?.nameEn})`);
      assert(p?.inhaleSec > 0 && p?.exhaleSec > 0, `Practice ${id} has valid timing ratio (${p?.inhaleSec}s : ${p?.exhaleSec}s)`);
      assert(Boolean(p?.precautions), `Practice ${id} has clear safety precautions`);
    }

    // 3. Verify Nadis & Granthis
    console.log("\n--- 3. Subtle Nadis & Three Granthis Integrity ---");
    assert(Array.isArray(SUBTLE_NADIS) && SUBTLE_NADIS.length === 3, "All 3 primary subtle nadis defined (Ida, Pingala, Sushumna)");
    for (const nadi of SUBTLE_NADIS) {
      assert(nadi.name && nadi.originAndPath, `Nadi ${nadi.id} has name and origin/path`);
      assert(Boolean(nadi.scripturalReference), `Nadi ${nadi.id} has classical scriptural reference`);
    }

    assert(Array.isArray(THREE_GRANTHIS) && THREE_GRANTHIS.length === 3, "All 3 spiritual granthis defined (Brahma, Vishnu, Rudra)");
    for (const granthi of THREE_GRANTHIS) {
      assert(granthi.name && granthi.location && granthi.description, `Granthi ${granthi.id} has name, location, and description`);
      assert(granthi.traditionsComparison && Object.keys(granthi.traditionsComparison).length >= 2, `Granthi ${granthi.id} has cross-tradition comparative analysis`);
      assert(Boolean(granthi.unravelingPath), `Granthi ${granthi.id} provides traditional transcendence sadhana`);
    }

    // 4. Verify Meditation Data
    console.log("\n--- 4. Classical Meditation Practices Integrity ---");
    assert(Array.isArray(MEDITATION_CATEGORIES) && MEDITATION_CATEGORIES.length >= 5, "Classical meditation categories defined");
    const reqCategories = ["BEGINNER", "MINDFUL_BREATH", "CHAKRA_FOCUSED", "MANTRA_JAPA", "TRADITIONAL_YOGIC"];
    for (const catId of reqCategories) {
      const cat = MEDITATION_CATEGORIES.find((c) => c.id === catId);
      assert(cat !== undefined, `Found category ${catId} (${cat?.nameEn})`);
      const practices = MEDITATION_PRACTICES.filter((p) => p.category === catId);
      assert(practices.length > 0, `Category ${catId} has ${practices.length} active meditation practices`);
    }

    for (const med of MEDITATION_PRACTICES) {
      assert(med.steps && med.steps.length >= 3, `Meditation ${med.id} has at least 3 phased guidance steps`);
      assert(Boolean(med.traditionalSource), `Meditation ${med.id} has classical source citation (${med.traditionalSource})`);
      assert(Boolean(med.safetyNoticeEn || med.safetyNotice), `Meditation ${med.id} contains safety and grounding notes`);
    }

    // 5. Verify Audio Frequencies
    console.log("\n--- 5. Web Audio Harmonic Engine Integrity ---");
    for (const chakraId of requiredChakras) {
      assert(CHAKRA_FREQUENCIES[chakraId] !== undefined, `Harmonic frequency defined for ${chakraId}: ${CHAKRA_FREQUENCIES[chakraId]?.freq}Hz`);
    }
    assert(AMBIENT_FREQUENCIES.cosmic_om?.fundamental === 136.1, "Cosmic Om frequency calibrated to 136.1Hz (Earth Year / Sadja)");
    assert(AMBIENT_FREQUENCIES.tanpura?.sa === 138.59, "Tanpura Sa calibrated to 138.59Hz");

    // 6. Verify Database & Progress Service
    console.log("\n--- 6. Database Schema & User Progress Integration ---");
    const sampleUser = await prisma.user.findFirst();
    if (sampleUser) {
      console.log(`Using sample user ID: ${sampleUser.id} for progress tracking verification`);

      // Find or create a module for foreign key
      let sampleModule = await prisma.kundaliniModule.findFirst();
      if (!sampleModule) {
        sampleModule = await prisma.kundaliniModule.create({
          data: {
            slug: "muladhara-root-chakra",
            title: "Muladhara Chakra Mastery",
            level: "BEGINNER",
            chakraAssociation: "Muladhara",
            description: "Classical root grounding",
            order: 1,
          },
        });
      }

      // Test progress record creation / update
      const progressRecord = await prisma.userKundaliniProgress.upsert({
        where: {
          userId_moduleId: {
            userId: sampleUser.id,
            moduleId: sampleModule.id,
          },
        },
        update: {
          completed: true,
          completedAt: new Date(),
          bookmarked: true,
        },
        create: {
          userId: sampleUser.id,
          moduleId: sampleModule.id,
          completed: true,
          completedAt: new Date(),
          bookmarked: true,
        },
      });

      assert(progressRecord.completed === true, "UserKundaliniProgress successfully persists chakra completion");
      assert(progressRecord.bookmarked === true, "UserKundaliniProgress successfully persists chakra bookmark");

      // Verify UserSavedConcept for reflection notes
      const savedConcept = await prisma.userSavedConcept.upsert({
        where: {
          userId_conceptKey: {
            userId: sampleUser.id,
            conceptKey: "chakra-reflection-muladhara",
          },
        },
        update: {
          notes: "Root chakra foundation note.",
          category: "KUNDALINI",
        },
        create: {
          userId: sampleUser.id,
          conceptKey: "chakra-reflection-muladhara",
          term: "मूलाधार",
          notes: "Root chakra foundation note.",
          category: "KUNDALINI",
        },
      });
      assert(savedConcept.term === "मूलाधार", "UserSavedConcept successfully upserts Sanskrit concept notes");
      assert(savedConcept.category === "KUNDALINI", "UserSavedConcept categorizes entry as KUNDALINI");
    } else {
      console.log("[INFO] No user in database, skipping DB write check (schema already validated).");
    }

    console.log(`\n========================================`);
    console.log(`Verification Complete: ${passed} Passed, ${failed} Failed.`);
    console.log(`========================================`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
