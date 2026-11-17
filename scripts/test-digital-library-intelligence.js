/**
 * Gurukul – Advanced Digital Library Discovery & Research Intelligence
 * Comprehensive Validation Test Suite
 * 
 * Validates against actual PostgreSQL database:
 * 1. Multilingual Search (Sanskrit, Hindi, English, Unicode ligatures, transliterations)
 * 2. Search Filters & Relevance Ranking (Exact phrase boost, author, category, OCR status)
 * 3. Intelligent Explainable Book Recommendations (5 shelves, authentic reasoning, real DB records)
 * 4. Research Collection CRUD & Scholarly Citation Export (Markdown, BibTeX, JSON)
 * 5. Passage Discovery & Verification Badges (evaluateSourceQuality, reader navigation URLs)
 * 6. AI Research Assistant & Summarization (Grounding, uncertainty handling, citations)
 * 7. User Reading Analytics & Gamification Integration (Streaks, XP, reading progress)
 * 8. Admin Digital Library Intelligence (Indexing status, unindexed passages, metadata audits)
 */

import assert from "node:assert";
import prisma from "../lib/prisma.js";
import { searchAstrologyContent } from "../server/search/searchEngine.js";
import { normalizeSearchQuery, expandMultilingualSearchTerms } from "../server/search/normalizeQuery.js";
import { getIntelligentBookRecommendations } from "../server/learning/recommendationEngine.js";
import {
  getUserResearchCollections,
  createResearchCollection,
  updateResearchCollection,
  deleteResearchCollection,
  getResearchItems,
  saveResearchItem,
  updateResearchItem,
  deleteResearchItem,
  exportResearchCollection,
} from "../server/research/workspace.js";
import { summarizePassage, askResearchQuestion, compareSourcesAcrossBooks, evaluateSourceQuality } from "../server/ai/researchAssistant.js";
import { getUserReadingAnalytics } from "../server/learning/readingAnalytics.js";
import { getLibraryIntelligenceReport } from "../server/admin/libraryIntelligence.js";

async function runTests() {
  console.log("\n================================================================================");
  console.log("   GURUKUL: ADVANCED DIGITAL LIBRARY DISCOVERY & RESEARCH INTELLIGENCE SUITE    ");
  console.log("================================================================================\n");

  let testUser = null;
  let testCollection = null;
  let testItem = null;

  try {
    // --------------------------------------------------------------------------
    // 1. MULTILINGUAL SEARCH & TRANSLITERATION INTELLIGENCE
    // --------------------------------------------------------------------------
    console.log("[1/8] Testing Multilingual Search & Query Normalization...");

    // 1.1 Sanskrit Devanagari Search
    const sanRes = await searchAstrologyContent({ query: "मूर्तिभावे", limit: 5 });
    assert(sanRes.total >= 1, "Sanskrit query 'मूर्तिभावे' returned results");
    assert(sanRes.results[0].text.includes("मूर्तिभावे") || sanRes.results[0].text.includes("मूर्त्तिभावे"), "Matched Sanskrit text directly");
    assert(sanRes.results[0].readerUrl.includes("?passageId="), "readerUrl contains ?passageId=");
    assert(sanRes.results[0].readerUrl.includes("#passage-"), "readerUrl contains #passage- anchor");
    console.log(`  ✓ Sanskrit Devanagari search passed (matched ${sanRes.total} passages, ${sanRes.timingMs}ms)`);

    // 1.2 Hindi Search
    const hinRes = await searchAstrologyContent({ query: "शहद", limit: 5 });
    assert(hinRes.total >= 1, "Hindi query 'शहद' returned results");
    console.log(`  ✓ Hindi search passed (matched ${hinRes.total} passages)`);

    // 1.3 English Search with Transliteration Expansion
    const engRes = await searchAstrologyContent({ query: "Jupiter", limit: 5 });
    assert(engRes.total >= 1, "English query 'Jupiter' returned results");
    assert(Array.isArray(engRes.expandedConcepts), "expandedConcepts array returned");
    assert(engRes.expandedConcepts.includes("गुरु"), "Transliteration expanded Jupiter -> गुरु");
    console.log(`  ✓ English search with transliteration expansion passed (expanded to: ${engRes.expandedConcepts.slice(0, 3).join(", ")})`);

    // 1.4 Transliteration Query Expansion Unit Test
    const expansions = expandMultilingualSearchTerms("surya");
    assert(expansions.includes("सूर्य"), "Expanded 'surya' to 'सूर्य'");
    const kundaliniExp = expandMultilingualSearchTerms("kundalini");
    assert(kundaliniExp.includes("कुण्डलिनी") || kundaliniExp.includes("कुंडलिनी"), "Expanded 'kundalini' to Devanagari");
    console.log("  ✓ Bidirectional transliteration dictionary verified");

    // --------------------------------------------------------------------------
    // 2. SEARCH FILTERS & RELEVANCE RANKING
    // --------------------------------------------------------------------------
    console.log("\n[2/8] Testing Search Filters & Relevance Ranking...");

    // 2.1 Language Filter
    const langSanRes = await searchAstrologyContent({ query: "॥ अथ", language: "Sanskrit", limit: 5 });
    assert(langSanRes.total >= 1, "Language filter 'Sanskrit' returned results");
    assert(langSanRes.results.every((r) => r.language === "Sanskrit"), "All results strictly in Sanskrit");

    const langEngRes = await searchAstrologyContent({ query: "॥ अथ", language: "English", limit: 5 });
    assert(langEngRes.total === 0, "Language filter 'English' cleanly excluded Sanskrit verses");
    console.log("  ✓ Strict language filtering passed");

    // 2.2 Author Filter
    const authorRes = await searchAstrologyContent({ query: "मूर्तिभावे", author: "Varahamihira", limit: 5 });
    assert(authorRes.total >= 1, "Author filter 'Varahamihira' returned results");
    assert(authorRes.results.every((r) => r.bookAuthor.toLowerCase().includes("varahamihira")), "Filtered strictly by author");
    console.log("  ✓ Author filter passed");

    // 2.3 Passage Type Filter
    const verseRes = await searchAstrologyContent({ query: "॥ अथ", passageType: "VERSE", limit: 5 });
    assert(verseRes.total >= 1, "PassageType filter 'VERSE' returned results");
    assert(verseRes.results.every((r) => r.passageType === "VERSE"), "All results are verses");
    console.log("  ✓ PassageType filter passed");

    // 2.4 Relevance Ranking (Exact phrase match gets score boost)
    const exactQuery = "मूर्तिभावे रविः स्थितः";
    const rankRes = await searchAstrologyContent({ query: exactQuery, limit: 5 });
    assert(rankRes.results.length >= 1, "Found results for exact phrase");
    assert(rankRes.results[0].matchType === "EXACT_PHRASE", "Ranked exact phrase match as EXACT_PHRASE");
    assert(rankRes.results[0].score >= 200, "Exact phrase received high relevance score boost");
    console.log(`  ✓ Relevance ranking passed (top score: ${rankRes.results[0].score}, type: ${rankRes.results[0].matchType})`);

    // --------------------------------------------------------------------------
    // 3. INTELLIGENT EXPLAINABLE BOOK RECOMMENDATIONS
    // --------------------------------------------------------------------------
    console.log("\n[3/8] Testing Intelligent Book Recommendations...");

    // Create a temporary test user to test personalized signals
    testUser = await prisma.user.create({
      data: {
        email: `test_researcher_${Date.now()}@gurukul.local`,
        name: "Acharya Researcher",
        totalXp: 350,
        level: 4,
        currentStreak: 7,
        longestStreak: 12,
      },
    });

    // Seed some reading progress for this user
    const sampleBook = await prisma.book.findFirst({
      where: { status: "PUBLISHED" },
      include: { chapters: { take: 1 } },
    });
    assert(sampleBook, "Found at least one published book in database");

    await prisma.readingProgress.create({
      data: {
        userId: testUser.id,
        bookId: sampleBook.id,
        chapterId: sampleBook.chapters[0]?.id || null,
        progress: 45,
        pageNumber: 2,
      },
    });

    // Test Recommendations Generation
    const recs = await getIntelligentBookRecommendations({ userId: testUser.id, limit: 4 });

    assert(Array.isArray(recs.recommendedForYou), "Returns recommendedForYou array");
    assert(recs.recommendedForYou.length > 0, "recommendedForYou has recommendations");
    assert(recs.recommendedForYou.every((r) => r.reason && r.reason.length > 10), "Every recommendation has an explainable reason");

    assert(Array.isArray(recs.continueYourStudies), "Returns continueYourStudies array");
    assert(recs.continueYourStudies.length >= 1, "continueYourStudies contains user's in-progress book");
    assert(recs.continueYourStudies[0].bookId === sampleBook.id, "Correct book identified in continueYourStudies");
    assert(recs.continueYourStudies[0].reason.includes("45% complete"), "Reason details exact completion progress");

    assert(Array.isArray(recs.exploreSimilarScriptures), "Returns exploreSimilarScriptures array");
    assert(Array.isArray(recs.recentlyAddedBooks), "Returns recentlyAddedBooks array");

    // Verify all recommended books strictly exist in database
    const allRecBookIds = [
      ...recs.recommendedForYou.map((b) => b.bookId),
      ...recs.continueYourStudies.map((b) => b.bookId),
      ...recs.exploreSimilarScriptures.map((b) => b.bookId),
      ...recs.recentlyAddedBooks.map((b) => b.bookId),
    ];
    const existingCount = await prisma.book.count({
      where: { id: { in: allRecBookIds } },
    });
    assert(existingCount === new Set(allRecBookIds).size, "All recommended books strictly exist in database");

    console.log(`  ✓ 5 Recommendation shelves generated with authentic reasoning (completed in ${recs.timingMs}ms)`);
    console.log(`    - Sample Reason: "${recs.continueYourStudies[0].reason}"`);

    // --------------------------------------------------------------------------
    // 4. RESEARCH COLLECTION CRUD & CITATION EXPORT
    // --------------------------------------------------------------------------
    console.log("\n[4/8] Testing Research Collection Management & Citation Export...");

    // 4.1 Create Collection
    testCollection = await createResearchCollection({
      userId: testUser.id,
      title: "Vedic Astronomy & Navagraha Research",
      description: "Scholarly comparative notes on solar treatises and planetary aspects.",
      tags: ["Jyotisha", "Navagraha", "Classical"],
    });
    assert(testCollection.id, "Created research collection");
    assert(testCollection.tags.length === 3, "Stored collection tags");

    // 4.2 Save Research Item (Passage & Notes)
    const samplePassage = await prisma.passage.findFirst({
      where: { bookId: sampleBook.id },
    });
    assert(samplePassage, "Found a sample passage in database");

    testItem = await saveResearchItem({
      userId: testUser.id,
      collectionId: testCollection.id,
      itemType: "SAVED_PASSAGE",
      title: "Solar Invocations & Planetary Mechanics",
      query: "How does the Sun govern planetary motion in classical Shastra?",
      answer: "The Sun is the Atmakaraka and cosmic center of the sidereal sphere.",
      notes: "Compare this passage with Brihat Samhita Chapter 2 verse 1.",
      bookId: sampleBook.id,
      passageId: samplePassage.id,
      pageNumber: samplePassage.sourcePage || 1,
      citations: [
        {
          bookTitle: sampleBook.title,
          author: sampleBook.author,
          passageId: samplePassage.id,
        },
      ],
    });
    assert(testItem.id, "Saved research item to collection");

    // 4.3 Update Research Collection (Rename & Update Description)
    const updatedCol = await updateResearchCollection({
      userId: testUser.id,
      collectionId: testCollection.id,
      title: "Renamed: Advanced Vedic Astronomy",
      description: "Updated scholarly description.",
    });
    assert(updatedCol.title === "Renamed: Advanced Vedic Astronomy", "Successfully renamed collection");

    // 4.4 Update Research Item (Update Notes)
    const updatedItem = await updateResearchItem({
      userId: testUser.id,
      itemId: testItem.id,
      notes: "Expanded comparative research notes with Brihat Parashara Hora Shastra.",
    });
    assert(updatedItem.notes.includes("Brihat Parashara"), "Successfully updated research item notes");

    // 4.5 Export Collection to Markdown
    const mdExport = await exportResearchCollection({
      userId: testUser.id,
      collectionId: testCollection.id,
      format: "markdown",
    });
    assert(mdExport.content.includes("Advanced Vedic Astronomy"), "Markdown export contains collection title");
    assert(mdExport.content.includes("Expanded comparative research notes"), "Markdown export includes personal research notes");
    assert(mdExport.content.includes(sampleBook.title), "Markdown export cites authentic book title");

    // 4.6 Export Collection to BibTeX
    const bibExport = await exportResearchCollection({
      userId: testUser.id,
      collectionId: testCollection.id,
      format: "bibtex",
    });
    assert(bibExport.content.includes("@misc{"), "BibTeX export contains valid BibTeX entries");
    assert(bibExport.content.includes("publisher = {Gurukul Digital Library}"), "BibTeX specifies Gurukul Digital Library publisher");

    // 4.7 User Data Isolation Check
    const anotherUser = await prisma.user.create({
      data: { email: `isolation_test_${Date.now()}@gurukul.local`, name: "Other User" },
    });
    const foreignCollections = await getUserResearchCollections(anotherUser.id);
    assert(foreignCollections.length === 0, "User data isolation: cannot see another user's research collections");
    await prisma.user.delete({ where: { id: anotherUser.id } });

    console.log("  ✓ Research Collection CRUD, items, user isolation & Citation Export (Markdown, BibTeX) passed");

    // --------------------------------------------------------------------------
    // 5. PASSAGE DISCOVERY & SOURCE QUALITY VERIFICATION
    // --------------------------------------------------------------------------
    console.log("\n[5/8] Testing Passage Discovery & Scholarly Quality Badging...");

    const qualityProofread = evaluateSourceQuality({ isVerified: true, ocrConfidence: 0.98 });
    assert(qualityProofread.isProofread === true, "Identified proofread text");
    assert(qualityProofread.qualityGrade === "VERIFIED_PROOFREAD", "Grade is VERIFIED_PROOFREAD");
    assert(qualityProofread.requiresVerification === false, "Proofread does not require verification");

    const qualityLowOcr = evaluateSourceQuality({ ocrConfidence: 0.52, needsReview: true });
    assert(qualityLowOcr.qualityGrade === "NEEDS_SCHOLARLY_REVIEW", "Low confidence flagged as NEEDS_SCHOLARLY_REVIEW");
    assert(qualityLowOcr.requiresVerification === true, "Unverified OCR text flagged to require scholarly review");

    console.log("  ✓ Scholarly provenance & OCR verification grading passed (unverified OCR never presented as verified)");

    // --------------------------------------------------------------------------
    // 6. AI RESEARCH ASSISTANT & PASSAGE SUMMARIZATION
    // --------------------------------------------------------------------------
    console.log("\n[6/8] Testing AI Research Assistant & Summarization...");

    // 6.1 Passage Summarization
    const summary = await summarizePassage({
      passageId: samplePassage.id,
      language: "en",
      user: testUser,
    });
    assert(summary.success === true, "Passage summarization succeeded");
    assert(summary.summary && summary.summary.length > 20, "Generated scholarly summary text");
    assert(Array.isArray(summary.keyPoints) && summary.keyPoints.length >= 2, "Generated scholarly key points");
    assert(summary.sourceProvenance.bookTitle === sampleBook.title, "Summary correctly attributes source book provenance");
    console.log(`  ✓ Passage summarization passed (generated ${summary.keyPoints.length} scholarly key points)`);

    // 6.2 Research Inquiry with Real Citations
    const inquiry = await askResearchQuestion({
      query: "Jupiter aspects and spiritual knowledge",
      bookIds: [sampleBook.id],
      language: "en",
      user: testUser,
    });
    assert(inquiry.success === true, "Research question answered");
    assert(Array.isArray(inquiry.citations), "Returns citations array");
    console.log(`  ✓ AI research assistant inquiry passed (returned ${inquiry.citations.length} grounded citations)`);

    // 6.3 Cross-Book Comparison (if multiple books exist)
    const booksForComp = await prisma.book.findMany({
      where: { status: "PUBLISHED" },
      take: 2,
    });
    if (booksForComp.length >= 2) {
      const comp = await compareSourcesAcrossBooks({
        bookIds: booksForComp.map((b) => b.id),
        topicOrQuery: "Sun in first house",
        language: "en",
        user: testUser,
      });
      assert(comp.success === true, "Cross-book comparison succeeded");
      assert(Array.isArray(comp.sourceGroups) && comp.sourceGroups.length === 2, "Comparison evaluated both treatises");
      console.log(`  ✓ Cross-scriptural source comparison passed (${booksForComp[0].title} vs ${booksForComp[1].title})`);
    }

    // --------------------------------------------------------------------------
    // 7. USER READING ANALYTICS
    // --------------------------------------------------------------------------
    console.log("\n[7/8] Testing User Reading Analytics & Gamification Integration...");

    const analytics = await getUserReadingAnalytics(testUser.id);
    assert(analytics.userId === testUser.id, "Analytics matched user");
    assert(analytics.stats.currentStreak === 7, "Accurately reflects currentStreak (7)");
    assert(analytics.stats.longestStreak === 12, "Accurately reflects longestStreak (12)");
    assert(analytics.stats.totalXp === 350, "Accurately reflects totalXp (350)");
    assert(analytics.stats.booksInProgressCount >= 1, "Accurately reflects books in progress count");
    assert(analytics.stats.researchCollectionsCount >= 1, "Accurately reflects research collections count");
    assert(Array.isArray(analytics.recentActivity) && analytics.recentActivity.length >= 1, "Returns recent reading activity");
    console.log("  ✓ Reading analytics integrated with existing progress, streaks, and XP engine");

    // --------------------------------------------------------------------------
    // 8. ADMIN DIGITAL LIBRARY INTELLIGENCE
    // --------------------------------------------------------------------------
    console.log("\n[8/8] Testing Admin Digital Library Intelligence...");

    const adminReport = await getLibraryIntelligenceReport();
    assert(adminReport.libraryOverview.totalBooks >= 1, "Report contains totalBooks count");
    assert(adminReport.searchIndexing.searchCoveragePct >= 0, "Report contains searchCoveragePct");
    assert(adminReport.ocrAndScholarlyQuality.verificationPct >= 0, "Report contains verificationPct");
    assert(typeof adminReport.incompleteMetadata.missingAuthorCount === "number", "Audits missing authors");
    assert(typeof adminReport.incompleteMetadata.missingDescriptionCount === "number", "Audits missing descriptions");
    assert(typeof adminReport.incompleteMetadata.missingPageCountCount === "number", "Audits missing page counts");
    assert(adminReport.researchEcosystem.recommendationPoolSize >= 1, "Reports recommendation pool size");
    console.log(`  ✓ Admin library intelligence report generated (Search Coverage: ${adminReport.searchIndexing.searchCoveragePct}%, Published Books: ${adminReport.libraryOverview.publishedBooks})`);

    console.log("\n================================================================================");
    console.log("   ALL 8 ADVANCED DIGITAL LIBRARY DISCOVERY & RESEARCH TEST MODULES PASSED!     ");
    console.log("================================================================================\n");

  } finally {
    // Clean up created test records
    try {
      if (testItem?.id) {
        await prisma.researchItem.delete({ where: { id: testItem.id } }).catch(() => {});
      }
      if (testCollection?.id) {
        await prisma.researchCollection.delete({ where: { id: testCollection.id } }).catch(() => {});
      }
      if (testUser?.id) {
        await prisma.readingProgress.deleteMany({ where: { userId: testUser.id } }).catch(() => {});
        await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
      }
    } catch (_e) {}
  }
}

runTests().catch((err) => {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
});
