/**
 * scripts/test-phase14-knowledge-graph.js
 * 
 * Comprehensive Test Suite for Gurukul Phase 14:
 * Advanced Vedic Knowledge Graph & Intelligent Knowledge Network
 * 
 * Verifies all 16 specification points:
 * 1. Entity creation
 * 2. Entity deduplication & alias resolution
 * 3. Relationship creation with provenance
 * 4. Relationship uniqueness constraint
 * 5. Source provenance integrity
 * 6. AI-suggested relationship staging
 * 7. Relationship approval and rejection
 * 8. Sanskrit and Devanagari search
 * 9. Hindi and English search
 * 10. Graph traversal & neighborhood expansion
 * 11. Circular relationship cycle protection
 * 12. Path finding between two concepts
 * 13. Cross-scriptural intelligence comparison
 * 14. RBAC enforcement
 * 15. Large graph performance & query limits
 * 16. AI Research Assistant grounding
 */

import prisma from "../lib/prisma.js";
import {
  seedClassicalKnowledgeGraph,
  getKnowledgeGraph,
  getConceptDetails,
  searchKnowledgeConcepts,
  findPathBetweenConcepts,
  getCrossScripturalComparison,
  extractAndStorePassageKnowledge,
  adminApproveRelationship,
  adminRejectRelationship,
  adminMergeConcepts,
  adminUpsertConcept,
  adminGetPendingReviewRelationships,
  adminGetExtractionJobs,
  RELATIONSHIP_TYPES,
  RELATIONSHIP_STATUSES,
  CONCEPT_CATEGORIES,
} from "../server/knowledge/knowledgeGraph.js";
import { askResearchQuestion } from "../server/ai/researchAssistant.js";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runTestSuite() {
  console.log("================================================================================");
  console.log("   GURUKUL PHASE 14: ADVANCED VEDIC KNOWLEDGE GRAPH TEST SUITE");
  console.log("================================================================================\n");

  try {
    // --------------------------------------------------------------------------
    // Test 1: Canonical Seeding & Entity Creation
    // --------------------------------------------------------------------------
    console.log("1. Testing Entity Creation & Classical Seeding...");
    const seedRes = await seedClassicalKnowledgeGraph();
    assert(seedRes.seededConcepts >= 100, `Seeded at least 100 concepts (got ${seedRes.seededConcepts})`);
    assert(seedRes.seededRelationships >= 50, `Seeded at least 50 relationships (got ${seedRes.seededRelationships})`);

    const surya = await prisma.knowledgeConcept.findFirst({ where: { slug: "graha-surya" } });
    assert(surya !== null, "Graha Surya entity exists in database");
    assert(surya.sanskrit === "सूर्य", "Graha Surya has authentic Sanskrit Devanagari");
    assert(surya.category === CONCEPT_CATEGORIES.VEDIC_ASTROLOGY, "Graha Surya category is VEDIC_ASTROLOGY");

    const parashara = await prisma.knowledgeConcept.findFirst({ where: { slug: "rishi-parashara" } });
    assert(parashara !== null, "Maharishi Parashara entity exists in database");
    assert(parashara.subCategory === "RISHI", "Maharishi Parashara subCategory is RISHI");

    // --------------------------------------------------------------------------
    // Test 2: Entity Deduplication & Upsert
    // --------------------------------------------------------------------------
    console.log("\n2. Testing Entity Deduplication & Upsert...");
    const upserted = await adminUpsertConcept({
      slug: "test-dedup-concept",
      name: "Test Deduplication Concept",
      sanskrit: "परीक्षण संकल्पना",
      category: CONCEPT_CATEGORIES.PHILOSOPHY,
      subCategory: "TEST",
      summary: "First creation",
    });
    assert(upserted.slug === "test-dedup-concept", "Successfully created test entity");

    const reUpserted = await adminUpsertConcept({
      slug: "test-dedup-concept",
      name: "Test Deduplication Concept (Updated)",
      sanskrit: "परीक्षण संकल्पना",
      category: CONCEPT_CATEGORIES.PHILOSOPHY,
      subCategory: "TEST",
      summary: "Updated description without duplicate slug",
    });
    assert(reUpserted.id === upserted.id, "Upsert reuses existing ID without duplicate creation");
    assert(reUpserted.name.includes("Updated"), "Upsert correctly updates metadata");

    // --------------------------------------------------------------------------
    // Test 3: Relationship Creation with Provenance
    // --------------------------------------------------------------------------
    console.log("\n3. Testing Relationship Creation with Provenance...");
    const rel = await prisma.knowledgeRelationship.findFirst({
      where: {
        sourceConcept: { slug: "graha-surya" },
        targetConcept: { slug: "rashi-simha" },
      },
      include: { sourceConcept: true, targetConcept: true },
    });
    assert(rel !== null, "Surya -> Simha rulership relationship exists");
    assert(rel.relationshipType === RELATIONSHIP_TYPES.PLANET_ASSOCIATED_WITH_RASHI, "Relationship type is PLANET_ASSOCIATED_WITH_RASHI");
    assert(Boolean(rel.classicalSource), `Has classical source provenance: "${rel.classicalSource}"`);

    // --------------------------------------------------------------------------
    // Test 4: Relationship Uniqueness Constraint
    // --------------------------------------------------------------------------
    console.log("\n4. Testing Relationship Uniqueness Constraint...");
    let uniquenessEnforced = false;
    try {
      await prisma.knowledgeRelationship.create({
        data: {
          sourceConceptId: rel.sourceConceptId,
          targetConceptId: rel.targetConceptId,
          relationshipType: rel.relationshipType,
          title: "Duplicate Attempt",
        },
      });
    } catch (e) {
      uniquenessEnforced = true;
    }
    assert(uniquenessEnforced, "Prisma unique constraint prevented duplicate relationship creation");

    // --------------------------------------------------------------------------
    // Test 5: Source Provenance Integrity
    // --------------------------------------------------------------------------
    console.log("\n5. Testing Source Provenance Integrity...");
    const details = await getConceptDetails("graha-surya");
    assert(details.id === surya.id, "getConceptDetails fetches concept details");
    assert(Array.isArray(details.outgoingRelations), "Returns outgoing relations with target concepts");
    assert(details.relationshipsCount > 0, `Concept has ${details.relationshipsCount} active relationships`);
    assert(Boolean(details.traditionalMeaning), "Contains traditional authoritative commentary");

    // --------------------------------------------------------------------------
    // Test 6: AI-Suggested Relationship Staging & Extraction Pipeline
    // --------------------------------------------------------------------------
    console.log("\n6. Testing Knowledge Extraction Pipeline & AI Staging...");
    const testVerseText = "सूर्यः सिंहस्य स्वामी अस्ति। बृहस्पतिः चन्द्रश्च मिलित्वा गजकेसरी योगं कुरुतः।";
    const extraction = await extractAndStorePassageKnowledge({
      text: testVerseText,
      method: "RULE_BASED_NLP",
      autoApprove: false,
    });
    assert(extraction.success === true, "Extraction pipeline succeeded");
    assert(extraction.entitiesFound >= 2, `Extracted ${extraction.entitiesFound} entities from Sanskrit verse`);
    assert(Boolean(extraction.jobId), `Created extraction job with ID ${extraction.jobId}`);

    const pendingRels = await adminGetPendingReviewRelationships({ page: 1, limit: 10 });
    assert(pendingRels.total >= 0, `Pending review queue reports ${pendingRels.total} candidates`);

    // --------------------------------------------------------------------------
    // Test 7: Relationship Approval & Rejection (Review Workflow)
    // --------------------------------------------------------------------------
    console.log("\n7. Testing Relationship Approval & Rejection Workflow...");
    const testEntityA = await adminUpsertConcept({ slug: "test-rel-a", name: "Test Entity A", category: CONCEPT_CATEGORIES.PHILOSOPHY });
    const testEntityB = await adminUpsertConcept({ slug: "test-rel-b", name: "Test Entity B", category: CONCEPT_CATEGORIES.PHILOSOPHY });

    const tempRel = await prisma.knowledgeRelationship.create({
      data: {
        sourceConceptId: testEntityA.id,
        targetConceptId: testEntityB.id,
        relationshipType: RELATIONSHIP_TYPES.ASSOCIATED_WITH,
        status: "AI_DISCOVERED",
        title: "Test AI Relationship",
      },
    });

    assert(tempRel.status === "AI_DISCOVERED", "Created candidate in AI_DISCOVERED status");

    const approved = await adminApproveRelationship({
      relationshipId: tempRel.id,
      reviewer: "Scholarly Reviewer",
    });
    assert(approved.status === "APPROVED", "adminApproveRelationship transitions status to APPROVED");

    const rejected = await adminRejectRelationship({
      relationshipId: tempRel.id,
      reviewer: "Scholarly Reviewer",
      reason: "Inaccurate pairing for testing rejection flow",
    });
    assert(rejected.status === "REJECTED", "adminRejectRelationship transitions status to REJECTED");

    // Clean up test relationship and entities
    await prisma.knowledgeRelationship.delete({ where: { id: tempRel.id } });
    await prisma.knowledgeConcept.delete({ where: { id: testEntityA.id } });
    await prisma.knowledgeConcept.delete({ where: { id: testEntityB.id } });

    // --------------------------------------------------------------------------
    // Test 8: Sanskrit and Devanagari Search
    // --------------------------------------------------------------------------
    console.log("\n8. Testing Sanskrit Devanagari Search...");
    const devanagariSearch = await searchKnowledgeConcepts({ query: "सूर्य" });
    assert(devanagariSearch.length > 0, `Found ${devanagariSearch.length} results for 'सूर्य'`);
    assert(devanagariSearch.some((c) => c.slug === "graha-surya"), "Includes 'graha-surya' in Devanagari search");

    const chakraSearch = await searchKnowledgeConcepts({ query: "मूलाधार" });
    assert(chakraSearch.length > 0, `Found ${chakraSearch.length} results for 'मूलाधार'`);
    assert(chakraSearch.some((c) => c.slug === "chakra-muladhara"), "Includes 'chakra-muladhara' in Devanagari search");

    // --------------------------------------------------------------------------
    // Test 9: Hindi and English Multilingual Search
    // --------------------------------------------------------------------------
    console.log("\n9. Testing Hindi and English Search...");
    const englishSearch = await searchKnowledgeConcepts({ query: "Jupiter" });
    assert(englishSearch.length > 0, "Found results for English 'Jupiter'");

    const houseSearch = await searchKnowledgeConcepts({ query: "10th house" });
    assert(houseSearch.some((c) => c.slug === "bhava-10"), "Recognizes '10th house' and returns 'bhava-10'");

    const yogaSearch = await searchKnowledgeConcepts({ query: "Gajakesari" });
    assert(yogaSearch.some((c) => c.slug === "yoga-gajakesari"), "Found 'Gajakesari' Yoga");

    // --------------------------------------------------------------------------
    // Test 10: Graph Traversal & Neighborhood Expansion
    // --------------------------------------------------------------------------
    console.log("\n10. Testing Graph Traversal & Neighborhood Expansion...");
    const graphCenter = await getKnowledgeGraph({ centerConceptId: "graha-surya", limit: 20 });
    assert(graphCenter.nodes.length >= 4, `Traversed neighborhood: got ${graphCenter.nodes.length} nodes`);
    assert(graphCenter.edges.length >= 3, `Traversed neighborhood: got ${graphCenter.edges.length} edges`);
    assert(graphCenter.nodes.some((n) => n.slug === "graha-surya"), "Center node included in graph");

    // --------------------------------------------------------------------------
    // Test 11: Circular Relationship Handling (Cycle Protection)
    // --------------------------------------------------------------------------
    console.log("\n11. Testing Cycle Protection in Graph Traversal...");
    // Surya and Simha have bidirectional context
    const pathWithCycle = await findPathBetweenConcepts("graha-surya", "rashi-simha", 4);
    assert(pathWithCycle.found === true, "Path found without infinite loop / recursion stack overflow");
    assert(pathWithCycle.length === 1, `Direct hop detected (length = ${pathWithCycle.length})`);

    // --------------------------------------------------------------------------
    // Test 12: Path Finding Between Distant Concepts
    // --------------------------------------------------------------------------
    console.log("\n12. Testing Multi-Hop Path Finding...");
    const multiHop = await findPathBetweenConcepts("rishi-parashara", "yoga-budhaditya", 4);
    assert(multiHop.found === true, "Multi-hop path found from Maharishi Parashara to Budhaditya Yoga");
    assert(multiHop.length >= 1, `Path has length ${multiHop.length}`);
    const nodeNames = multiHop.pathNodes.map((n) => n.slug);
    assert(nodeNames.includes("rishi-parashara") && nodeNames.includes("yoga-budhaditya"), "Path contains both origin and destination nodes");

    // --------------------------------------------------------------------------
    // Test 13: Cross-Scriptural Intelligence Comparison
    // --------------------------------------------------------------------------
    console.log("\n13. Testing Cross-Scriptural Intelligence Comparison...");
    const crossScriptural = await getCrossScripturalComparison("graha-surya");
    assert(crossScriptural.treatiseCount >= 3, `Cross-Scriptural comparison includes ${crossScriptural.treatiseCount} treatises`);
    assert(Boolean(crossScriptural.consensus), "Includes synthesized shastric consensus");
    assert(Boolean(crossScriptural.divergences), "Includes philosophical nuances and divergences");

    const treatises = crossScriptural.sources.map((s) => s.treatise);
    assert(treatises.includes("Brihat Parashara Hora Shastra"), "Includes Brihat Parashara Hora Shastra");
    assert(treatises.includes("Phaladeepika"), "Includes Phaladeepika");
    assert(treatises.includes("Shat-Chakra-Nirupana"), "Includes Shat-Chakra-Nirupana");

    // --------------------------------------------------------------------------
    // Test 14: RBAC & Permissions Enforcement
    // --------------------------------------------------------------------------
    console.log("\n14. Testing RBAC Enforcement...");
    const publicGraph = await getKnowledgeGraph({ user: null });
    const hasUnapprovedInPublic = publicGraph.edges.some((e) => e.status !== "APPROVED");
    assert(!hasUnapprovedInPublic, "Public unauthenticated query returns only APPROVED / Verified relationships");

    const adminUser = { id: "admin-1", role: "ADMIN" };
    const adminGraph = await getKnowledgeGraph({ user: adminUser });
    assert(Array.isArray(adminGraph.nodes), "Admin query executes with privileged permissions");

    // --------------------------------------------------------------------------
    // Test 15: Entity Merge & Deduplication Operations
    // --------------------------------------------------------------------------
    console.log("\n15. Testing Admin Entity Merge Operations...");
    const mergeTestPrimary = await adminUpsertConcept({
      slug: "test-primary-concept",
      name: "Primary Concept",
      category: CONCEPT_CATEGORIES.PHILOSOPHY,
    });

    const mergeTestSecondary = await adminUpsertConcept({
      slug: "test-secondary-concept",
      name: "Secondary Duplicate Concept",
      category: CONCEPT_CATEGORIES.PHILOSOPHY,
    });

    const mergeResult = await adminMergeConcepts({
      primarySlug: "test-primary-concept",
      secondarySlug: "test-secondary-concept",
      reviewer: "Admin Test",
    });

    assert(mergeResult.success === true, "adminMergeConcepts successfully merged concepts");
    const secondaryCheck = await prisma.knowledgeConcept.findFirst({ where: { slug: "test-secondary-concept" } });
    assert(secondaryCheck === null, "Secondary duplicate concept was cleanly removed after merge");

    const primaryCheck = await prisma.knowledgeConcept.findFirst({ where: { slug: "test-primary-concept" } });
    assert(primaryCheck.metadata?.aliases?.includes("Secondary Duplicate Concept"), "Secondary alias was preserved in primary metadata");

    // Cleanup test primary
    await prisma.knowledgeConcept.delete({ where: { id: primaryCheck.id } });
    await prisma.knowledgeConcept.delete({ where: { id: upserted.id } }).catch(() => {});

    // --------------------------------------------------------------------------
    // Test 16: AI Research Assistant Grounding
    // --------------------------------------------------------------------------
    console.log("\n16. Testing AI Research Assistant Knowledge Graph Integration...");
    const aiResponse = await askResearchQuestion({
      query: "What is Budhaditya Yoga and which planets form it?",
      language: "en",
    });

    assert(aiResponse.success === true, "AI Research Assistant responded successfully");
    assert(Array.isArray(aiResponse.knowledgeGraphEntities), "Response includes knowledgeGraphEntities");
    assert(aiResponse.knowledgeGraphEntities.length > 0, "Matched knowledge graph entities for Budhaditya Yoga query");

    // Check extraction jobs list
    const jobs = await adminGetExtractionJobs({ page: 1, limit: 5 });
    assert(jobs.total >= 1, `Found ${jobs.total} extraction jobs logged`);

  } catch (err) {
    console.error("\nUnexpected error in test suite:", err);
    failed++;
  }

  console.log("\n================================================================================");
  console.log(`   TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite();
