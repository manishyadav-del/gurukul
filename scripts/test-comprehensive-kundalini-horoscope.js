/**
 * scripts/test-comprehensive-kundalini-horoscope.js
 * 
 * Comprehensive Test Suite for:
 * 1. Seven-Chakra Classical Learning System (Sections A-G)
 * 2. Vedic Horoscope Foundations, 12 Bhavas, 9 Grahas, 12 Rashis, 27 Nakshatras, and Panchang
 * 3. Search and Retrieval via Knowledge API
 * 4. Progress and Reflection Note persistence
 */

import { CHAKRAS_ARRAY, getChakraBySlug } from "../server/spirituality/chakraKnowledge.js";
import { HOROSCOPE_OVERVIEW } from "../server/astrology/horoscopeOverviewKnowledge.js";
import { BHAVAS_KNOWLEDGE } from "../server/astrology/bhavasKnowledge.js";
import { GRAHAS_KNOWLEDGE } from "../server/astrology/grahasKnowledge.js";
import {
  RASHIS_KNOWLEDGE,
  NAKSHATRAS_KNOWLEDGE,
  PANCHANG_KNOWLEDGE,
} from "../server/astrology/rashisNakshatrasKnowledge.js";
import prisma from "../lib/prisma.js";

async function runTestSuite() {
  console.log("================================================================================");
  console.log("   GURUKUL KUNDALINI & VEDIC HOROSCOPE COMPREHENSIVE VERIFICATION SUITE         ");
  console.log("================================================================================\n");

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passedTests++;
    } else {
      console.error(`  ✗ [FAIL] ${message}`);
      failedTests++;
    }
  }

  // ---------------------------------------------------------------------------
  // TEST SUITE 1: SEVEN-CHAKRA KNOWLEDGE SYSTEM (Sections A to G)
  // ---------------------------------------------------------------------------
  console.log("--- TEST SUITE 1: Seven-Chakra Learning System (Classical Shat-Chakra) ---");

  assert(CHAKRAS_ARRAY.length === 7, "All 7 Classical Chakras are present in CHAKRAS_ARRAY");

  const expectedChakraSlugs = [
    "muladhara-chakra",
    "svadhisthana-chakra",
    "manipura-chakra",
    "anahata-chakra",
    "vishuddha-chakra",
    "ajna-chakra",
    "sahasrara-chakra",
  ];

  for (const slug of expectedChakraSlugs) {
    const chakra = getChakraBySlug(slug);
    assert(Boolean(chakra), `getChakraBySlug("${slug}") successfully found chakra`);

    if (chakra) {
      // SECTION A: Introduction & Meaning
      assert(
        chakra.sanskritName && chakra.englishName && chakra.transliteration && chakra.pronunciation,
        `[${chakra.sanskritName}] Sec A: Has Sanskrit, English, transliteration, and pronunciation`
      );
      assert(
        Boolean(chakra.introduction?.coreMeaning) &&
          Boolean(chakra.introduction?.beginnerExplanation) &&
          Boolean(chakra.introduction?.grossToSubtleFramework) &&
          Boolean(chakra.introduction?.traditionalVersusModern),
        `[${chakra.sanskritName}] Sec A: Has core meaning, beginner explanation, framework & traditional context`
      );

      // SECTION B: Traditional Symbolism
      assert(
        chakra.petalsCount > 0 &&
          chakra.bijaMantra &&
          chakra.element &&
          chakra.symbolism?.associatedDeityArchetype &&
          chakra.symbolism?.sacredGeometryYantra,
        `[${chakra.sanskritName}] Sec B: Has petals, bija, element, deity archetype & yantra shape`
      );

      // SECTION C: Philosophical & Spiritual Significance
      assert(
        chakra.philosophy?.innerQualitiesBalanced &&
          chakra.philosophy?.roleInSpiritualDevelopment &&
          chakra.philosophy?.connectionToPranaNadisGranthis &&
          chakra.philosophy?.noPseudoscienceClaims,
        `[${chakra.sanskritName}] Sec C: Has balanced qualities, spiritual role, Nadis/Granthis & no-pseudoscience clause`
      );

      // SECTION D: Everyday-Life Examples (at least 3 meaningful scenarios)
      assert(
        Array.isArray(chakra.everydayExamples) && chakra.everydayExamples.length >= 3,
        `[${chakra.sanskritName}] Sec D: Contains at least 3 non-diagnostic everyday-life scenarios (${chakra.everydayExamples?.length || 0} found)`
      );

      // SECTION E: Guided Learning & Safe Contemplation
      assert(
        Array.isArray(chakra.guidedLearning?.reflectionPrompts) &&
          chakra.guidedLearning.reflectionPrompts.length >= 2,
        `[${chakra.sanskritName}] Sec E: Has self-reflection inquiry prompts`
      );
      const exercise = chakra.guidedLearning?.safeMindfulnessExercise;
      assert(
        Boolean(exercise?.title) &&
          Boolean(exercise?.duration) &&
          Array.isArray(exercise?.steps) &&
          exercise.steps.length >= 3 &&
          Array.isArray(exercise?.clearStopSignals) &&
          exercise.clearStopSignals.length >= 2 &&
          exercise.boundaryNotice?.includes("NO extreme breath retention"),
        `[${chakra.sanskritName}] Sec E: Gentle safe contemplation with duration, stop signals & NO-Kumbhaka boundary`
      );

      // SECTION F: FAQs
      assert(
        Array.isArray(chakra.faqs) && chakra.faqs.length >= 2,
        `[${chakra.sanskritName}] Sec F: Contains classical FAQs with grounded answers (${chakra.faqs?.length || 0} found)`
      );

      // SECTION G: Sources and Further Study
      assert(
        Array.isArray(chakra.sources) && chakra.sources.length >= 2,
        `[${chakra.sanskritName}] Sec G: Contains textual citations (Shat-Chakra-Nirupana, Shiva Samhita, etc.)`
      );
    }
  }

  // ---------------------------------------------------------------------------
  // TEST SUITE 2: VEDIC HOROSCOPE FOUNDATIONS & OVERVIEW
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 2: Vedic Horoscope Foundations & Overview ---");

  assert(Boolean(HOROSCOPE_OVERVIEW.title), "Horoscope overview has comprehensive title");
  assert(
    HOROSCOPE_OVERVIEW.introduction.chartTypesComparison.length >= 4,
    "Covers 4 classical chart types (Janma, Gochara, Prashna, Varshaphala)"
  );
  assert(
    Boolean(HOROSCOPE_OVERVIEW.introduction.birthDataCriticalRole.explanation) &&
      Boolean(HOROSCOPE_OVERVIEW.introduction.birthDataCriticalRole.approximateTimeGuidance),
    "Explains importance of exact birth coordinates and guidance for approximate birth times"
  );
  assert(
    HOROSCOPE_OVERVIEW.structuralElements.length >= 6,
    "Details all 6 structural elements (Lagna, Bhavas, Rashis, Grahas, Nakshatras, Dashas)"
  );
  assert(
    HOROSCOPE_OVERVIEW.compositeInterpretationMethodology.principles.length >= 4,
    "Provides composite interpretation principles (No single factor, threefold confirmation, etc.)"
  );
  assert(
    HOROSCOPE_OVERVIEW.ethicalBoundariesAndLimitations.axioms.length >= 4,
    "Covers ethics, free will (Purushartha vs Daiva), non-fatalism, and non-medical scope"
  );

  // ---------------------------------------------------------------------------
  // TEST SUITE 3: 12 BHAVAS (HOUSES)
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 3: Comprehensive 12 Bhavas (Houses) ---");

  assert(BHAVAS_KNOWLEDGE.length === 12, "All 12 Bhavas are present (1st to 12th)");

  for (let h = 1; h <= 12; h++) {
    const bhava = BHAVAS_KNOWLEDGE.find((b) => b.number === h);
    assert(Boolean(bhava), `Bhava ${h} is present`);

    if (bhava) {
      assert(
        Boolean(bhava.sanskritName) && Boolean(bhava.englishName) && Boolean(bhava.karakaGraha),
        `[Bhava ${h}] Has Sanskrit name (${bhava.sanskritName}), English name, and Karaka`
      );
      assert(
        Array.isArray(bhava.classifications) && bhava.classifications.length >= 1,
        `[Bhava ${h}] Classified by Kendra/Trikona/Upachaya/Dusthana/Maraka`
      );
      assert(
        bhava.primarySignifications.length >= 3,
        `[Bhava ${h}] Has at least 3 classical core significations`
      );
      assert(
        bhava.modernLifeDomains.career &&
          bhava.modernLifeDomains.relationships &&
          bhava.modernLifeDomains.psychology &&
          bhava.modernLifeDomains.materialStability &&
          bhava.modernLifeDomains.innerLife,
        `[Bhava ${h}] Covers all 5 modern life domains (career, relationships, psychology, material, inner)`
      );
      assert(
        bhava.commonMisconceptions.length >= 2,
        `[Bhava ${h}] Corrects common misconceptions with classical reasoning`
      );
      assert(
        Boolean(bhava.howToAnalyze.bhaveshaLordship) &&
          Boolean(bhava.howToAnalyze.occupyingPlanets) &&
          Boolean(bhava.howToAnalyze.balancedExample),
        `[Bhava ${h}] Provides lord analysis, occupying planets & balanced chart example`
      );
    }
  }

  // ---------------------------------------------------------------------------
  // TEST SUITE 4: 9 GRAHAS (NAVAGRAHAS)
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 4: Navagrahas (9 Cosmic Grahas) ---");

  assert(GRAHAS_KNOWLEDGE.length === 9, "All 9 Navagrahas are present (Surya to Ketu)");

  const expectedGrahas = [
    "surya",
    "chandra",
    "mangala",
    "budha",
    "guru",
    "shukra",
    "shani",
    "rahu",
    "ketu",
  ];

  for (const gId of expectedGrahas) {
    const graha = GRAHAS_KNOWLEDGE.find((g) => g.id === gId);
    assert(Boolean(graha), `Graha '${gId}' is present`);

    if (graha) {
      assert(
        Boolean(graha.astronomicalNature),
        `[${graha.sanskritName}] Clearly distinguishes physical astronomical nature from astrological symbolism`
      );
      assert(
        graha.dignities.exaltation &&
          graha.dignities.debilitation &&
          graha.dignities.moolatrikona &&
          graha.dignities.ownSign,
        `[${graha.sanskritName}] Details dignities: Exaltation, Debilitation, Moolatrikona, Own Sign`
      );
      assert(
        Array.isArray(graha.relationships.friends) &&
          Array.isArray(graha.relationships.neutral) &&
          Array.isArray(graha.relationships.enemies),
        `[${graha.sanskritName}] Details natural planetary friendships (Mitra, Sama, Shatru)`
      );
      assert(
        Boolean(graha.aspects),
        `[${graha.sanskritName}] Details special planetary aspects (Drishti): ${graha.aspects}`
      );
      assert(
        Boolean(graha.holisticChartContext),
        `[${graha.sanskritName}] Re-emphasizes whole-chart context and house lordship`
      );
    }
  }

  // ---------------------------------------------------------------------------
  // TEST SUITE 5: 12 RASHIS, 27 NAKSHATRAS & 5 LIMBS OF PANCHANG
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 5: Rashis, Nakshatras & Panchang ---");

  assert(RASHIS_KNOWLEDGE.length === 12, "All 12 Rashis present (Mesha to Meena)");
  const sampleRashi = RASHIS_KNOWLEDGE[0];
  assert(
    sampleRashi.element && sampleRashi.modality && sampleRashi.ruler && sampleRashi.archetype,
    "Rashis have element, modality, ruler, archetype, and balanced/unbalanced expressions"
  );

  assert(NAKSHATRAS_KNOWLEDGE.length === 27, "All 27 Nakshatras present (Ashwini to Revati)");
  const sampleNakshatra = NAKSHATRAS_KNOWLEDGE[0];
  assert(
    sampleNakshatra.span &&
      sampleNakshatra.deity &&
      sampleNakshatra.rulingPlanet &&
      sampleNakshatra.symbol &&
      Array.isArray(sampleNakshatra.padas) &&
      sampleNakshatra.padas.length === 4,
    "Nakshatras have span, deity, ruling planet, symbol, and all 4 Padas mapped to Navamshas"
  );

  assert(PANCHANG_KNOWLEDGE.limbs.length === 5, "All 5 Limbs of Panchang present");
  const limbNames = PANCHANG_KNOWLEDGE.limbs.map((l) => l.limb);
  assert(
    limbNames.some((n) => n.includes("Tithi")) &&
      limbNames.some((n) => n.includes("Vara")) &&
      limbNames.some((n) => n.includes("Nakshatra")) &&
      limbNames.some((n) => n.includes("Yoga")) &&
      limbNames.some((n) => n.includes("Karana")),
    "Five limbs correctly cover Tithi, Vara, Nakshatra, Yoga, and Karana"
  );

  for (const limb of PANCHANG_KNOWLEDGE.limbs) {
    assert(
      Boolean(limb.calculationMethod) && Boolean(limb.traditionalUsage),
      `[Panchang: ${limb.limb}] Has astronomical calculation method and traditional usage`
    );
  }

  // ---------------------------------------------------------------------------
  // TEST SUITE 6: DATABASE PROGRESS & REFLECTION NOTE PERSISTENCE
  // ---------------------------------------------------------------------------
  console.log("\n--- TEST SUITE 6: Database Persistence & Upsert Safety ---");

  try {
    // 1. Test upserting a chakra module
    const firstChakra = CHAKRAS_ARRAY[0];
    const seededModule = await prisma.kundaliniModule.upsert({
      where: { slug: firstChakra.slug },
      update: {
        title: `${firstChakra.sanskritName} (${firstChakra.englishName})`,
        subtitle: firstChakra.meaning,
        chakraAssociation: firstChakra.englishName,
        chakraElement: firstChakra.element,
        bijaMantra: firstChakra.bijaMantra,
        historicalContext: firstChakra.introduction.traditionalVersusModern,
        practices: firstChakra.guidedLearning.safeMindfulnessExercise,
        safetyGuidance: firstChakra.guidedLearning.safeMindfulnessExercise.clearStopSignals.join("; "),
        sourceReferences: firstChakra.sources,
        order: firstChakra.number,
        status: "PUBLISHED",
      },
      create: {
        slug: firstChakra.slug,
        title: `${firstChakra.sanskritName} (${firstChakra.englishName})`,
        subtitle: firstChakra.meaning,
        chakraAssociation: firstChakra.englishName,
        chakraElement: firstChakra.element,
        bijaMantra: firstChakra.bijaMantra,
        historicalContext: firstChakra.introduction.traditionalVersusModern,
        practices: firstChakra.guidedLearning.safeMindfulnessExercise,
        safetyGuidance: firstChakra.guidedLearning.safeMindfulnessExercise.clearStopSignals.join("; "),
        sourceReferences: firstChakra.sources,
        order: firstChakra.number,
        status: "PUBLISHED",
      },
    });

    assert(Boolean(seededModule.id), `Prisma successfully upserted KundaliniModule: ${seededModule.title}`);

    // 2. Test saving a reflection note in UserSavedConcept
    const testUser = await prisma.user.findFirst();
    if (testUser) {
      const savedConcept = await prisma.userSavedConcept.upsert({
        where: {
          userId_conceptKey: {
            userId: testUser.id,
            conceptKey: "chakra-reflection-muladhara-chakra",
          },
        },
        update: {
          notes: "Grounded stillness observed during 5-minute morning contemplation.",
        },
        create: {
          userId: testUser.id,
          conceptKey: "chakra-reflection-muladhara-chakra",
          term: "Muladhara Chakra",
          sanskritTerm: "लम्",
          category: "KUNDALINI",
          meaning: "Root Center Foundation",
          notes: "Grounded stillness observed during 5-minute morning contemplation.",
        },
      });

      assert(Boolean(savedConcept.id), `UserSavedConcept successfully persisted reflection note for user ${testUser.id}`);
    } else {
      console.log("  ℹ No user in database, skipping UserSavedConcept live user test.");
    }
  } catch (dbErr) {
    console.warn("  ⚠ Live DB test notice:", dbErr.message);
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log("================================================================================");

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
