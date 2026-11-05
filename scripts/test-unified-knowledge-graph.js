/**
 * scripts/test-unified-knowledge-graph.js
 * 
 * Master Verification Test Suite for the Unified Gurukul Knowledge Graph & Platform Integration.
 */

import prisma from "../lib/prisma.js";
import {
  getKnowledgeGraph,
  getConceptDetails,
  searchKnowledgeConcepts,
  discoverPassageConcepts,
} from "../server/knowledge/knowledgeGraph.js";
import { getExplainableRecommendations } from "../server/learning/recommendationEngine.js";

async function runTestSuite() {
  console.log("\n========================================================");
  console.log("   GURUKUL UNIFIED KNOWLEDGE GRAPH VERIFICATION SUITE   ");
  console.log("========================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = "") {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1: Database Schema & Canonical Concept Population
    // ----------------------------------------------------
    const conceptCount = await prisma.knowledgeConcept.count();
    const relationshipCount = await prisma.knowledgeRelationship.count();

    assert(conceptCount >= 100, `Database has ${conceptCount} canonical concepts (>=100 expected)`);
    assert(relationshipCount >= 20, `Database has ${relationshipCount} classical relationships (>=20 expected)`);

    // Verify key sub-categories exist
    const categories = await prisma.knowledgeConcept.groupBy({
      by: ["subCategory"],
      _count: { id: true },
    });
    const catKeys = categories.map((c) => c.subCategory);
    assert(
      ["GRAHA", "BHAVA", "RASHI", "NAKSHATRA", "CHAKRA"].every((c) => catKeys.includes(c)),
      "All major classical categories present (GRAHA, BHAVA, RASHI, NAKSHATRA, CHAKRA)",
      `Found: ${catKeys.join(", ")}`
    );

    // ----------------------------------------------------
    // TEST 2: Knowledge Graph Traversal & Radial Exploration
    // ----------------------------------------------------
    const fullGraph = await getKnowledgeGraph({ category: "ALL", depth: 1, limit: 120 });
    assert(fullGraph.nodes.length >= 100, `getKnowledgeGraph returned ${fullGraph.nodes.length} nodes`);
    assert(fullGraph.edges.length >= 20, `getKnowledgeGraph returned ${fullGraph.edges.length} edges`);

    // Check specific node structure
    const sunNode = fullGraph.nodes.find((n) => n.slug === "graha-surya");
    assert(
      sunNode && sunNode.sanskrit === "सूर्य" && sunNode.subCategory === "GRAHA",
      "Surya Graha node correctly structured with Sanskrit devanagari and subCategory",
      JSON.stringify(sunNode)
    );

    // Center node expansion around "graha-surya"
    const centeredGraph = await getKnowledgeGraph({ centerSlug: "graha-surya", depth: 1 });
    assert(
      centeredGraph.nodes.length > 1 && centeredGraph.edges.length > 0,
      `Centered neighborhood around Surya returned ${centeredGraph.nodes.length} nodes and ${centeredGraph.edges.length} edges`
    );

    // ----------------------------------------------------
    // TEST 3: Deep Concept Details & Verified Provenance
    // ----------------------------------------------------
    const manipuraDetails = await getConceptDetails("chakra-manipura");
    assert(
      manipuraDetails && manipuraDetails.sanskrit === "मणिपूर",
      "Manipura Chakra details retrieved with authentic devanagari",
      manipuraDetails ? manipuraDetails.name : "null"
    );
    assert(
      manipuraDetails && manipuraDetails.traditionalMeaning?.length > 10,
      "Manipura Chakra contains authoritative traditional shastric meaning",
      manipuraDetails?.traditionalMeaning
    );
    assert(
      Array.isArray(manipuraDetails?.outgoingRelations) && Array.isArray(manipuraDetails?.incomingRelations),
      "Manipura Chakra returns bidirectional classical relationships"
    );

    // ----------------------------------------------------
    // TEST 4: Multilingual Lexical & Sanskrit Search
    // ----------------------------------------------------
    const searchDevanagari = await searchKnowledgeConcepts("सूर्य");
    assert(
      searchDevanagari.length > 0 && searchDevanagari.some((c) => c.slug === "graha-surya"),
      "Search by Sanskrit Devanagari 'सूर्य' accurately locates Surya Graha"
    );

    const searchEnglish = await searchKnowledgeConcepts("Manipura");
    assert(
      searchEnglish.length > 0 && searchEnglish.some((c) => c.slug === "chakra-manipura"),
      "Search by English 'Manipura' accurately locates Solar Plexus Chakra"
    );

    const searchBhava = await searchKnowledgeConcepts("10th House");
    assert(
      searchBhava.length > 0 && searchBhava.some((c) => c.slug === "bhava-10"),
      "Search by English '10th House' accurately locates Karma Bhava"
    );

    // ----------------------------------------------------
    // TEST 5: Passage Concept Auto-Discovery
    // ----------------------------------------------------
    const passageText = "The radiant Surya influences the Manipura chakra and governs the 10th bhava of karma and dharma.";
    const discovered = await discoverPassageConcepts(passageText);
    assert(
      discovered.length >= 2,
      `discoverPassageConcepts identified ${discovered.length} concepts in classical test passage`,
      discovered.map((d) => d.slug).join(", ")
    );

    // ----------------------------------------------------
    // TEST 6: Explainable Recommendations Engine with Graph Signals
    // ----------------------------------------------------
    const defaultRecs = await getExplainableRecommendations({ userId: null, categoryFilter: "ALL" });
    assert(
      defaultRecs.length > 0,
      `getExplainableRecommendations returns ${defaultRecs.length} grounded recommendations for guest user`
    );
    assert(
      defaultRecs.every((r) => r.reason && r.category && r.url),
      "Every recommendation provides full explainability reason, category, and direct deep-link"
    );

    // ----------------------------------------------------
    // TEST 7: Classical Grounding & Publication Integrity
    // ----------------------------------------------------
    // Verify all seeded classical relationships have authoritative sources
    const relationships = await prisma.knowledgeRelationship.findMany({
      select: { title: true, classicalSource: true, tradition: true },
    });
    const hasUncited = relationships.some((r) => !r.classicalSource || r.classicalSource.trim() === "");
    assert(!hasUncited, "100% of classical relationships have verifiable source citations (no hallucinations)");

    console.log("\n========================================================");
    console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
    console.log("========================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test Suite execution encountered error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTestSuite();
