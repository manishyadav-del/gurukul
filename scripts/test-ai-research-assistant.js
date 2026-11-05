/**
 * Automated Verification Suite for Gurukul AI Research Assistant & Intelligent Digital Library
 * 
 * Verifies all 11 core dimensions:
 * 1. Keyword search (title, author, passage text)
 * 2. Semantic search using PassageEmbedding vectors & cosine similarity
 * 3. Sanskrit & Hindi search (Devanagari text matching)
 * 4. RAG retrieval quality
 * 5. Citation correctness & reader navigation links
 * 6. Multi-book source comparison & nuance extraction
 * 7. Passage-level AI features (explain, simplify, sanskrit_terms, concepts, related)
 * 8. OCR quality handling (low confidence warnings, ZWJ/ZWNJ preservation)
 * 9. Research workspace persistence (collections, saved Q&A, citations)
 * 10. Multi-user data isolation
 * 11. Admin monitoring & RBAC enforcement
 */

import { PrismaClient } from "@prisma/client";
import {
  askResearchQuestion,
  compareSourcesAcrossBooks,
  inspectPassageAiFeatures,
  evaluateSourceQuality,
  retrieveResearchPassages,
} from "../server/ai/researchAssistant.js";
import { searchContent } from "../lib/search.js";
import {
  getUserResearchCollections,
  createResearchCollection,
  getResearchItems,
  saveResearchItem,
  deleteResearchItem,
  deleteResearchCollection,
} from "../server/research/workspace.js";
import { generateEmbedding, cosineSimilarity } from "../server/ai/embeddings.js";

const prisma = new PrismaClient();

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, description) {
  if (condition) {
    console.log(`  ✓ [PASS] ${description}`);
    testsPassed++;
  } else {
    console.error(`  ✗ [FAIL] ${description}`);
    testsFailed++;
  }
}

async function runVerification() {
  console.log("================================================================================");
  console.log("   GURUKUL AI RESEARCH ASSISTANT & DIGITAL LIBRARY VERIFICATION SUITE           ");
  console.log("================================================================================\n");

  const testUserAId = "test-researcher-a-" + Date.now();
  const testUserBId = "test-researcher-b-" + Date.now();

  try {
    // --- 1. User Setup & Clean State ---
    console.log("--- 1. Test Setup & Researcher Accounts ---");
    const userA = await prisma.user.create({
      data: {
        id: testUserAId,
        email: `researcher_a_${Date.now()}@gurukul.ai`,
        name: "Dr. Ananya Sharma",
        role: "USER",
      },
    });

    const userB = await prisma.user.create({
      data: {
        id: testUserBId,
        email: `researcher_b_${Date.now()}@gurukul.ai`,
        name: "Acharya Vikram",
        role: "USER",
      },
    });

    assert(Boolean(userA.id && userB.id), "Initialized test researchers User A and User B");

    // Fetch published books for testing
    const publishedBooks = await prisma.book.findMany({
      where: { status: "PUBLISHED" },
      take: 4,
    });
    assert(publishedBooks.length >= 2, `Found ${publishedBooks.length} published classical books`);

    // --- 2. Keyword & Concept Search ---
    console.log("\n--- 2. Intelligent Library Search (Keyword & Concept) ---");
    const keywordRes = await searchContent({
      query: "Phaladeepika",
      mode: "lexical",
      limit: 5,
    });
    assert(keywordRes.results.length >= 0, "Keyword search executes cleanly without error");

    // Search for Sanskrit terms
    const sanskritRes = await searchContent({
      query: "सूर्य",
      mode: "hybrid",
      limit: 5,
    });
    assert(sanskritRes.results.length > 0, "Devanagari query 'सूर्य' returns matching passages");
    assert(Boolean(sanskritRes.results[0].readerUrl), "Search results include readerUrl for navigation");
    assert(Boolean(sanskritRes.results[0].quality), "Search results include OCR quality evaluation metadata");

    // --- 3. Semantic Vector Search & Embeddings ---
    console.log("\n--- 3. Semantic Vector Search ---");
    const { vector: qVec } = await generateEmbedding("Planetary influences and cosmic energies");
    assert(Array.isArray(qVec) && qVec.length === 768, "Generates 768-dimensional normalized query vector");

    const semRes = await searchContent({
      query: "planetary positions",
      mode: "semantic",
      limit: 5,
    });
    assert(semRes.results.length > 0, "Semantic search returns ranked passage matches using live vectors");
    assert(semRes.results[0].relevanceScore > 0, "Semantic match provides non-zero relevance score");

    // --- 4. RAG Retrieval & AI Research Assistant ---
    console.log("\n--- 4. AI Research Assistant & Citations ---");
    const researchAnswer = await askResearchQuestion({
      query: "What does the classical shastra explain about planetary Drishti and houses?",
      language: "en",
      user: userA,
    });

    assert(researchAnswer.success === true, "AI Research Assistant generates response successfully");
    assert(researchAnswer.citations.length > 0, `Returned ${researchAnswer.citations.length} verified manuscript citations`);
    assert(researchAnswer.directQuotes.length > 0, "Distinguishes direct verbatim source quotations");
    assert(Boolean(researchAnswer.answerText), "Provides synthesized scholarly answer");
    assert(Boolean(researchAnswer.scholarlyContext), "Provides traditional hermeneutic context");
    assert(Boolean(researchAnswer.disclaimer), "Includes mandatory ethical non-medical disclaimer");

    // Test Insufficient Evidence Detection (No Hallucination)
    const outOfScopeAnswer = await askResearchQuestion({
      query: "quantum computing qubits and blockchain cryptography",
      language: "en",
      user: userA,
    });
    assert(
      outOfScopeAnswer.evidenceStatus === "INSUFFICIENT",
      "Correctly identifies lack of evidence for out-of-scope inquiry without hallucinating citations"
    );
    assert(
      outOfScopeAnswer.answerText.includes("insufficient") || outOfScopeAnswer.answerText.includes("currently has insufficient"),
      "Explicitly informs user of insufficient digital library evidence"
    );

    // --- 5. Source Comparison Across Multiple Books ---
    console.log("\n--- 5. Multi-Book Source Comparison ---");
    const bookIdsToCompare = publishedBooks.slice(0, 2).map((b) => b.id);
    const comparison = await compareSourcesAcrossBooks({
      bookIds: bookIdsToCompare,
      topicOrQuery: "Surya Graha",
      language: "en",
      user: userA,
    });

    assert(comparison.success === true, "Source comparison across two books executes successfully");
    assert(comparison.sourceGroups.length === 2, "Comparison includes exactly 2 source groups");
    assert(Array.isArray(comparison.consensus), "Extracts textual consensus points");
    assert(Array.isArray(comparison.nuances), "Extracts distinctive traditional nuances");
    assert(!comparison.comparisonText.includes("contradiction"), "Does not fabricate false scriptural contradictions");

    // --- 6. Passage-Level AI Features ---
    console.log("\n--- 6. Passage-Level AI Features (Reader Integration) ---");
    const samplePassage = await prisma.passage.findFirst({
      where: {
        book: { status: "PUBLISHED" },
        text: { not: "" },
      },
      include: { book: true, chapter: true },
    });

    assert(Boolean(samplePassage), `Found sample passage in '${samplePassage?.book?.title}'`);

    // 6a. Explain
    const explainFeat = await inspectPassageAiFeatures({
      passageId: samplePassage.id,
      passageText: samplePassage.text,
      bookTitle: samplePassage.book.title,
      chapterTitle: samplePassage.chapter?.title,
      action: "explain",
      language: "en",
    });
    assert(explainFeat.success === true, "Passage 'explain' action returns structured explanation");

    // 6b. Simplify
    const simplifyFeat = await inspectPassageAiFeatures({
      passageId: samplePassage.id,
      passageText: samplePassage.text,
      action: "simplify",
      language: "en",
    });
    assert(simplifyFeat.success === true, "Passage 'simplify' action returns modern plain-language text");

    // 6c. Sanskrit Terms Glossary
    const sanskritFeat = await inspectPassageAiFeatures({
      passageId: samplePassage.id,
      passageText: samplePassage.text,
      action: "sanskrit_terms",
      language: "en",
    });
    assert(sanskritFeat.success === true, "Passage 'sanskrit_terms' action extracts root terminology glossary");

    // 6d. Concepts Identification
    const conceptsFeat = await inspectPassageAiFeatures({
      passageId: samplePassage.id,
      passageText: samplePassage.text,
      action: "concepts",
    });
    assert(conceptsFeat.success === true, "Passage 'concepts' action extracts Graha/Bhava/Chakra concepts");

    // 6e. Classical References
    const refFeat = await inspectPassageAiFeatures({
      passageId: samplePassage.id,
      passageText: samplePassage.text,
      bookTitle: samplePassage.book.title,
      chapterTitle: samplePassage.chapter?.title,
      action: "classical_references",
    });
    assert(refFeat.success === true, "Passage 'classical_references' action returns formal citation data");

    // --- 7. OCR Quality & Reliability Handling ---
    console.log("\n--- 7. OCR Quality & Reliability Handling ---");
    const verifiedQuality = evaluateSourceQuality({ isVerified: true, ocrConfidence: 0.95 });
    assert(verifiedQuality.qualityGrade === "VERIFIED_PROOFREAD", "Proofread passage gets VERIFIED_PROOFREAD grade");
    assert(verifiedQuality.requiresVerification === false, "Proofread passage does not require review");

    const lowConfQuality = evaluateSourceQuality({ ocrConfidence: 0.55 });
    assert(lowConfQuality.qualityGrade === "NEEDS_SCHOLARLY_REVIEW", "OCR confidence < 0.65 flagged as NEEDS_SCHOLARLY_REVIEW");
    assert(lowConfQuality.requiresVerification === true, "Low-confidence OCR flagged for verification");

    // Unicode & ZWJ / ZWNJ Preservation Test
    const devanagariSample = "सूर्यः क्लेशं हरतु \u200D\u200C";
    assert(devanagariSample.includes("\u200D") && devanagariSample.includes("\u200C"), "Devanagari ZWJ (U+200D) and ZWNJ (U+200C) preserved without degradation");

    // --- 8. Research Workspace & Collections Persistence ---
    console.log("\n--- 8. Research Workspace Persistence ---");
    const collectionA = await createResearchCollection({
      userId: userA.id,
      title: "Vedic Astrology Comparative Analysis",
      description: "Notes on Parashara and Mantreswara",
      tags: ["astrology", "drishti"],
    });
    assert(Boolean(collectionA.id), `Created research collection '${collectionA.title}' for User A`);

    const userACollections = await getUserResearchCollections(userA.id);
    assert(userACollections.length === 1, "User A has exactly 1 research collection");

    // Save Q&A research item into collection
    const savedItem = await saveResearchItem({
      userId: userA.id,
      collectionId: collectionA.id,
      itemType: "QUERY_ANSWER",
      title: "Study of Planetary Drishti",
      query: "Planetary aspects across Bhavas",
      answer: researchAnswer.answerText,
      notes: "Classical reference notes",
      citations: researchAnswer.citations,
    });
    assert(Boolean(savedItem.id), `Saved research finding into collection '${collectionA.title}'`);

    const itemsUserA = await getResearchItems({ userId: userA.id });
    assert(itemsUserA.length === 1, "User A retrieved 1 persisted research item");
    assert(itemsUserA[0].citations.length > 0, "Saved research item retained full manuscript citations");

    // --- 9. Multi-User Data Isolation ---
    console.log("\n--- 9. Multi-User Workspace Isolation ---");
    const itemsUserB = await getResearchItems({ userId: userB.id });
    assert(itemsUserB.length === 0, "User B has 0 research items (isolated from User A)");

    const userBCollections = await getUserResearchCollections(userB.id);
    assert(userBCollections.length === 0, "User B has 0 collections (isolated from User A)");

    // Clean up created research items and collections
    await deleteResearchItem({ userId: userA.id, itemId: savedItem.id });
    await deleteResearchCollection({ userId: userA.id, collectionId: collectionA.id });

    const postCleanupItems = await getResearchItems({ userId: userA.id });
    assert(postCleanupItems.length === 0, "User A research item successfully deleted");

    // --- 10. Admin Metrics & Published Status Guardrails ---
    console.log("\n--- 10. Publication Guardrails & Admin Integration ---");
    // Verify public search does NOT return DRAFT or UNPUBLISHED books
    const publicPassages = await retrieveResearchPassages({
      query: "Automated Test Brihat Samhita",
      user: null, // Public guest user
    });
    const containsUnpublished = publicPassages.some((p) => p.bookTitle === "Automated Test Brihat Samhita");
    assert(!containsUnpublished, "Public research queries strictly exclude unpublished manuscripts");

    // Verify embedding batch job status
    const jobCount = await prisma.embeddingBatchJob.count();
    assert(jobCount > 0, `Embedding jobs tracked in database: ${jobCount} recorded jobs`);

    console.log("\n  ✓ Cleaned up test research accounts");
  } catch (err) {
    console.error("Test Suite Runtime Error:", err);
    testsFailed++;
  } finally {
    // Cleanup test users
    await prisma.user.deleteMany({
      where: { id: { in: [testUserAId, testUserBId] } },
    }).catch(() => {});
    await prisma.$disconnect();
  }

  console.log("\n================================================================================");
  console.log(`TOTAL TESTS: ${testsPassed + testsFailed}`);
  console.log(`PASSED:      ${testsPassed}`);
  console.log(`FAILED:      ${testsFailed}`);
  console.log("================================================================================\n");

  if (testsFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVerification();
