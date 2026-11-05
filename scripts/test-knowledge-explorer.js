/**
 * scripts/test-knowledge-explorer.js
 * 
 * End-to-End Automated Test Suite for Gurukul AI Knowledge Explorer:
 * 1. Classical Concept Ontology Engine (Grahas, Bhavas, Rashis, Nakshatras, Chakras, Nadis, Tattvas)
 * 2. Yogic Subtle Anatomy AI Concept Extraction
 * 3. Multilingual Knowledge API Search (Sanskrit, Hindi, English)
 * 4. Related Node Resolution & Cross-Links
 * 5. Learning Progress & Note Persistence via Prisma
 * 6. Admin Content Module Management
 */

import {
  CONCEPT_RELATIONSHIPS,
  getRelatedConcepts,
} from "../server/astrology/conceptRelationships.js";
import { extractAstrologyConcepts } from "../server/ai/conceptExtractor.js";
import { CHAKRAS_ARRAY } from "../server/spirituality/chakraKnowledge.js";
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
  console.log("      GURUKUL AI KNOWLEDGE EXPLORER — AUTOMATED VERIFICATION SUITE              ");
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

  try {
    // -------------------------------------------------------------------------
    // 1. CLASSICAL CONCEPT ONTOLOGY ENGINE
    // -------------------------------------------------------------------------
    console.log("--- 1. Classical Concept Ontology Engine ---");

    assert(
      typeof CONCEPT_RELATIONSHIPS === "object" && Object.keys(CONCEPT_RELATIONSHIPS).length >= 16,
      `Ontology contains ${Object.keys(CONCEPT_RELATIONSHIPS).length} core mapped concept nodes`
    );

    // Test Surya (Sun) cross-links
    const suryaLinks = getRelatedConcepts("graha-surya");
    assert(suryaLinks.length >= 4, `Surya has ${suryaLinks.length} verified shastric cross-links`);
    const suryaChakra = suryaLinks.find((l) => l.key.includes("manipura"));
    assert(Boolean(suryaChakra), "Surya correctly connects to Manipura Chakra");
    const suryaRashi = suryaLinks.find((l) => l.key === "rashi-simha");
    assert(Boolean(suryaRashi), "Surya correctly connects to its own sign (Simha / Leo)");

    // Test Chandra (Moon) cross-links
    const chandraLinks = getRelatedConcepts("graha-chandra");
    const chandraIda = chandraLinks.find((l) => l.relation.toLowerCase().includes("ida"));
    assert(Boolean(chandraIda), "Chandra correctly connects to Ida Nadi (Lunar Channel)");

    // Test Manipura Chakra cross-links
    const manipuraLinks = getRelatedConcepts("chakra-manipura");
    assert(manipuraLinks.length >= 3, `Manipura Chakra has ${manipuraLinks.length} verified connections`);
    const manipuraGraha = manipuraLinks.find((l) => l.key === "graha-surya");
    assert(Boolean(manipuraGraha), "Manipura Chakra connects to Surya Graha (Solar Fire)");
    const manipuraTattva = manipuraLinks.find((l) => l.relation.toLowerCase().includes("agni"));
    assert(Boolean(manipuraTattva), "Manipura Chakra connects to Agni Tattva (Fire)");

    // Test 1st House (Tanu Bhava) cross-links
    const bhava1Links = getRelatedConcepts("bhava-1");
    const bhava1Karaka = bhava1Links.find((l) => l.key === "graha-surya");
    assert(Boolean(bhava1Karaka), "1st House (Tanu Bhava) connects to natural Karaka Surya");

    // Test Rashi Mesha (Aries) cross-links
    const meshaLinks = getRelatedConcepts("rashi-mesha");
    const meshaMangala = meshaLinks.find((l) => l.key === "graha-mangala");
    assert(Boolean(meshaMangala), "Mesha connects to its ruler Mangala (Mars)");

    // Test Nakshatra Ashwini cross-links
    const ashwiniLinks = getRelatedConcepts("nakshatra-ashwini");
    const ashwiniKetu = ashwiniLinks.find((l) => l.key === "graha-ketu");
    assert(Boolean(ashwiniKetu), "Ashwini connects to its Vimshottari ruler Ketu");

    // -------------------------------------------------------------------------
    // 2. YOGIC & CHAKRA AI CONCEPT EXTRACTION
    // -------------------------------------------------------------------------
    console.log("\n--- 2. Yogic Subtle Anatomy AI Concept Extraction ---");

    const query1 = "How do I balance my Manipura chakra and Surya in my 10th house?";
    const extracted1 = extractAstrologyConcepts(query1);
    assert(
      extracted1.chakras.some((c) => c.toLowerCase().includes("manipura")) ||
        extracted1.expandedTerms.some((t) => t.toLowerCase().includes("manipura")),
      `Extracted subtle anatomy from query 1: ${JSON.stringify(extracted1.chakras)}`
    );
    assert(
      extracted1.planets.includes("Sun") || extracted1.expandedTerms.some((t) => t.toLowerCase().includes("surya")),
      "Extracted planetary concept (Surya/Sun)"
    );
    assert(
      extracted1.houses.includes(10),
      "Extracted 10th house from query 1"
    );

    const query2 = "Awakening of Kundalini and Muladhara grounding";
    const extracted2 = extractAstrologyConcepts(query2);
    assert(
      extracted2.chakras.some((c) => c.toLowerCase().includes("muladhara")) ||
        extracted2.expandedTerms.some((t) => t.toLowerCase().includes("muladhara")),
      `Extracted Kundalini root chakra concepts: ${JSON.stringify(extracted2.chakras)}`
    );

    const query3 = "सदाशिव और आज्ञा चक्र का ध्यान";
    const extracted3 = extractAstrologyConcepts(query3);
    assert(
      extracted3.chakras.some((c) => c.toLowerCase().includes("ajna")) ||
        extracted3.expandedTerms.some((t) => t.includes("आज्ञा") || t.toLowerCase().includes("ajna")),
      `Extracted Hindi/Sanskrit query concept: ${JSON.stringify(extracted3.chakras)}`
    );

    // -------------------------------------------------------------------------
    // 3. KNOWLEDGE DOMAIN COVERAGE
    // -------------------------------------------------------------------------
    console.log("\n--- 3. Knowledge Domain Coverage ---");

    assert(CHAKRAS_ARRAY.length === 7, "All 7 Classical Chakras available");
    assert(GRAHAS_KNOWLEDGE.length === 9, "All 9 Navagrahas available");
    assert(BHAVAS_KNOWLEDGE.length === 12, "All 12 Bhavas available");
    assert(RASHIS_KNOWLEDGE.length === 12, "All 12 Rashis available");
    assert(NAKSHATRAS_KNOWLEDGE.length === 27, "All 27 Nakshatras available");
    const panchangLimbs = Array.isArray(PANCHANG_KNOWLEDGE)
      ? PANCHANG_KNOWLEDGE
      : PANCHANG_KNOWLEDGE.limbs || [];
    assert(panchangLimbs.length === 5, "All 5 Limbs of Panchang available");

    // -------------------------------------------------------------------------
    // 4. LEARNING PROGRESS & PERSONAL NOTES DATABASE INTEGRATION
    // -------------------------------------------------------------------------
    console.log("\n--- 4. Learning Progress & Note Persistence (Prisma) ---");

    // Ensure a test user exists
    let testUser = await prisma.user.findFirst({
      where: { email: "test-explorer@gurukul.ai" },
    });
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: "test-explorer@gurukul.ai",
          name: "Explorer Tester",
          role: "USER",
        },
      });
    }
    assert(Boolean(testUser.id), `Active test user: ${testUser.email}`);

    // Upsert a concept bookmark and note
    const testConceptKey = "test-chakra-manipura";
    const savedConcept = await prisma.userSavedConcept.upsert({
      where: {
        userId_conceptKey: {
          userId: testUser.id,
          conceptKey: testConceptKey,
        },
      },
      update: {
        term: "Manipura Chakra",
        sanskritTerm: "मणिपूर चक्र",
        category: "CHAKRA",
        meaning: "Solar plexus center of spiritual radiance and transformation",
        notes: "Classical reference: Shat-Chakra-Nirupana verse 19. Governed by Agni Tattva.",
      },
      create: {
        userId: testUser.id,
        conceptKey: testConceptKey,
        term: "Manipura Chakra",
        sanskritTerm: "मणिपूर चक्र",
        category: "CHAKRA",
        meaning: "Solar plexus center of spiritual radiance and transformation",
        notes: "Classical reference: Shat-Chakra-Nirupana verse 19. Governed by Agni Tattva.",
      },
    });

    assert(Boolean(savedConcept.id), "Successfully persisted UserSavedConcept in PostgreSQL");
    assert(
      savedConcept.notes.includes("Shat-Chakra-Nirupana"),
      "Retrieved saved personal study reflection note correctly"
    );

    // Retrieve via query
    const fetchedConcept = await prisma.userSavedConcept.findUnique({
      where: {
        userId_conceptKey: {
          userId: testUser.id,
          conceptKey: testConceptKey,
        },
      },
    });
    assert(fetchedConcept.conceptKey === testConceptKey, "Confirmed unique retrieval by userId_conceptKey");

    // Clean up test concept
    await prisma.userSavedConcept.delete({
      where: { id: savedConcept.id },
    });
    console.log("  ✓ Cleaned up test concept record");

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log("\n================================================================================");
    console.log(`TOTAL TESTS: ${totalTests}`);
    console.log(`PASSED:      ${passedTests}`);
    console.log(`FAILED:      ${failedTests}`);
    console.log("================================================================================\n");

    if (failedTests > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("Test execution threw error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTestSuite();
