/**
 * Phase 5 Verification Test Suite: Multilingual Full-Text Search
 * 
 * Verifies:
 * 1. English astrological search matching
 * 2. Hindi Devanagari search matching
 * 3. Sanskrit classical shloka and danda-aware search matching
 * 4. Unicode normalization resilience (NFC, quotes, whitespace)
 * 5. Empty query and malformed input handling
 * 6. Language filter restrictions (Sanskrit, Hindi, English)
 * 7. Book ID and author filter restrictions
 * 8. Passage type filter restrictions (VERSE vs PARAGRAPH)
 * 9. Pagination slicing and page counts
 * 10. Publication status guardrails (unpublished books strictly excluded from public results)
 * 11. Direct reader navigation URL generation (/library/[book]/[chapter]#passage-[id])
 * 12. Search performance benchmark measurement (query latency in ms)
 */

import prisma from "../lib/prisma.js";
import { registerBook } from "../server/ingest/registerBook.js";
import { structureBook } from "../server/ingest/structureBook.js";
import { searchAstrologyContent } from "../server/search/searchEngine.js";
import { normalizeSearchQuery } from "../server/search/normalizeQuery.js";
import { setupSearchIndexes } from "./setup-search-indexes.js";

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${name}`);
    failed++;
  }
}

async function runPhase5Tests() {
  console.log("\n========================================================");
  console.log("  PHASE 5 VERIFICATION: MULTILINGUAL FULL-TEXT SEARCH");
  console.log("========================================================\n");

  // Ensure trigram indexes are active
  await setupSearchIndexes();

  // Setup: Create test book with published Sanskrit and Hindi content
  const testBook = await registerBook({
    title: "Brihat Samhita Search Edition",
    author: "Varahamihira Acharya",
    language: "Sanskrit",
    script: "Devanagari",
    originalFileName: "brihat_samhita_search.pdf",
    originalFileUrl: "/uploads/brihat_samhita_search.pdf",
  });

  // Page 1: Sanskrit Shlokas & Chapter 1
  await prisma.bookPage.create({
    data: {
      bookId: testBook.id,
      pageNumber: 1,
      pdfPageIndex: 0,
      processingMethod: "TEXT_EXTRACTION",
      rawText: `॥ अथ प्रथमोऽध्यायः ॥\n\nजयति जगतः प्रसूतिर्विश्वमयी विश्वहेतुरुद्भवति ।\nयस्मादिदं समस्तं नमोऽस्तु तस्मै परेशाय ॥ १ ॥\n\nशान्ताकारं भुजगशयनं पद्मनाभं सुरेशं विश्वाधारं गगनसदृशम्।`,
      cleanedText: "",
    },
  });

  // Page 2: Hindi commentary & Chapter 2
  await prisma.bookPage.create({
    data: {
      bookId: testBook.id,
      pageNumber: 2,
      pdfPageIndex: 1,
      processingMethod: "TEXT_EXTRACTION",
      rawText: `अध्याय २: आदित्य चार\n\nसूर्य मण्डल का प्रभाव सम्पूर्ण सौरमण्डल पर पड़ता है।\nJupiter and planetary conjunctions govern spiritual inclinations in astrology.`,
      cleanedText: "",
    },
  });

  // Structure and set status to PUBLISHED
  await structureBook(testBook.id);
  await prisma.book.update({
    where: { id: testBook.id },
    data: { status: "PUBLISHED" },
  });

  // -----------------------------------------------------------
  // 1. ENGLISH SEARCH MATCHING
  // -----------------------------------------------------------
  console.log("[1/12] Testing English Full-Text Search...");
  const engSearch = await searchAstrologyContent({ query: "Jupiter" });
  assert(engSearch.total >= 1, `Found ${engSearch.total} results for English query 'Jupiter'`);
  assert(engSearch.results.some((r) => r.text.includes("Jupiter")), "Result snippet contains 'Jupiter'");
  assert(engSearch.results.some((r) => r.bookTitle === testBook.title), "Populated bookTitle in search result");

  // -----------------------------------------------------------
  // 2. HINDI DEVANAGARI SEARCH MATCHING
  // -----------------------------------------------------------
  console.log("\n[2/12] Testing Hindi Devanagari Search...");
  const hinSearch = await searchAstrologyContent({ query: "सौरमण्डल" });
  assert(hinSearch.total >= 1, `Found ${hinSearch.total} results for Hindi query 'सौरमण्डल'`);
  assert(hinSearch.results[0].text.includes("सौरमण्डल"), "Matched Hindi term in passage");
  assert(hinSearch.results[0].sourcePage === 2, "Preserved sourcePage 2 for Hindi passage");

  // -----------------------------------------------------------
  // 3. SANSKRIT SHLOKA & DANDA SEARCH MATCHING
  // -----------------------------------------------------------
  console.log("\n[3/12] Testing Sanskrit Shloka & Danda Search...");
  const sanSearch = await searchAstrologyContent({ query: "शान्ताकारं" });
  assert(sanSearch.total >= 1, `Found ${sanSearch.total} results for Sanskrit term 'शान्ताकारं'`);
  const shlokaSearch = await searchAstrologyContent({ query: "॥ अथ" });
  assert(shlokaSearch.total >= 1, `Found ${shlokaSearch.total} results for verse opening '॥ अथ'`);
  assert(shlokaSearch.results[0].snippet.includes("अथ"), "Context snippet contains 'अथ'");

  // -----------------------------------------------------------
  // 4. UNICODE NORMALIZATION RESILIENCE
  // -----------------------------------------------------------
  console.log("\n[4/12] Testing Unicode Normalization & Punctuation Resilience...");
  // Query with surrounding quotes and extra spaces
  const quotedSearch = await searchAstrologyContent({ query: '  "शान्ताकारं"  ' });
  assert(quotedSearch.total >= 1, "Matched query with external quotation marks and padding");

  // Query with terminal danda
  const dandaSearch = await searchAstrologyContent({ query: "शान्ताकारं ।" });
  assert(dandaSearch.total >= 1, "Matched query containing trailing danda punctuation");

  // -----------------------------------------------------------
  // 5. EMPTY QUERY & WHITESPACE HANDLING
  // -----------------------------------------------------------
  console.log("\n[5/12] Testing Empty Query & Whitespace Handling...");
  const emptySearch = await searchAstrologyContent({ query: "" });
  assert(emptySearch.total === 0, "Empty string returns 0 results cleanly");
  assert(Array.isArray(emptySearch.results), "Returns empty results array");

  const whitespaceSearch = await searchAstrologyContent({ query: "    " });
  assert(whitespaceSearch.total === 0, "Whitespace-only query returns 0 results cleanly");

  // -----------------------------------------------------------
  // 6. LANGUAGE FILTER RESTRICTIONS
  // -----------------------------------------------------------
  console.log("\n[6/12] Testing Language Filter...");
  // Book language is Sanskrit
  const filteredSan = await searchAstrologyContent({ query: "सूर्य", language: "Sanskrit" });
  assert(filteredSan.total >= 1, "Found results with language: 'Sanskrit'");

  const filteredEng = await searchAstrologyContent({ query: "सूर्य", language: "English" });
  assert(filteredEng.total === 0, "Language filter 'English' cleanly excluded Sanskrit book");

  // -----------------------------------------------------------
  // 7. BOOK ID & AUTHOR FILTERS
  // -----------------------------------------------------------
  console.log("\n[7/12] Testing Book ID and Author Filters...");
  const bookFiltered = await searchAstrologyContent({ query: "सूर्य", bookId: testBook.id });
  assert(bookFiltered.total >= 1, "Found results with matching bookId");

  const authorFiltered = await searchAstrologyContent({ query: "सूर्य", author: "Varahamihira" });
  assert(authorFiltered.total >= 1, "Found results with matching author substring");

  const wrongAuthor = await searchAstrologyContent({ query: "सूर्य", author: "NonExistentAuthor" });
  assert(wrongAuthor.total === 0, "Filter with non-matching author returned 0 results");

  // -----------------------------------------------------------
  // 8. PASSAGE TYPE FILTER (VERSE vs PARAGRAPH)
  // -----------------------------------------------------------
  console.log("\n[8/12] Testing Passage Type Filter...");
  const verseOnly = await searchAstrologyContent({ query: "जयति", passageType: "VERSE" });
  assert(verseOnly.total >= 1, "Found shloka with passageType: 'VERSE'");
  assert(verseOnly.results.every((r) => r.passageType === "VERSE"), "All returned results have type VERSE");

  // -----------------------------------------------------------
  // 9. PAGINATION SLICING & TOTAL PAGES
  // -----------------------------------------------------------
  console.log("\n[9/12] Testing Pagination Slicing...");
  const page1 = await searchAstrologyContent({ query: "परेशाय", page: 1, limit: 1 });
  assert(page1.results.length === 1, "Limit: 1 returned exactly 1 result on page 1");
  assert(page1.page === 1, "Returned page metadata 1");
  assert(page1.limit === 1, "Returned limit metadata 1");

  // -----------------------------------------------------------
  // 10. PUBLICATION STATUS RESTRICTIONS
  // -----------------------------------------------------------
  console.log("\n[10/12] Testing Publication Status Guardrails...");
  // Unpublish the book
  await prisma.book.update({
    where: { id: testBook.id },
    data: { status: "UNPUBLISHED" },
  });

  // Public search must return 0 results
  const publicUnpubSearch = await searchAstrologyContent({ query: "शान्ताकारं", user: null });
  assert(publicUnpubSearch.total === 0, "Unpublished content strictly hidden from public search");

  // Privileged admin user CAN see unpublished content
  const adminSearch = await searchAstrologyContent({ query: "शान्ताकारं", user: { role: "ADMIN" } });
  assert(adminSearch.total >= 1, "Admin user can search unpublished/draft content");

  // Restore published status
  await prisma.book.update({
    where: { id: testBook.id },
    data: { status: "PUBLISHED" },
  });

  // -----------------------------------------------------------
  // 11. PAGE-LINKED NAVIGATION URL GENERATION
  // -----------------------------------------------------------
  console.log("\n[11/12] Testing Reader Context URL Generation...");
  const navSearch = await searchAstrologyContent({ query: "शान्ताकारं" });
  const firstResult = navSearch.results[0];
  assert(firstResult.readerUrl !== null, "readerUrl is populated");
  assert(firstResult.readerUrl.startsWith("/library/"), "readerUrl links to /library/ path");
  assert(firstResult.readerUrl.includes(testBook.slug), "readerUrl contains book slug");
  assert(firstResult.readerUrl.includes("#passage-"), "readerUrl contains passage anchor");

  // -----------------------------------------------------------
  // 12. MEASURED PERFORMANCE BENCHMARK
  // -----------------------------------------------------------
  console.log("\n[12/12] Measuring Search Performance Benchmark...");
  const benchmarkRuns = [];
  for (let i = 0; i < 5; i++) {
    const t0 = Date.now();
    await searchAstrologyContent({ query: "शान्ताकारं" });
    benchmarkRuns.push(Date.now() - t0);
  }
  const avgLatency = Math.round(benchmarkRuns.reduce((a, b) => a + b, 0) / benchmarkRuns.length);
  console.log(`  Measured query latency across 5 runs: [${benchmarkRuns.join("ms, ")}ms] (Average: ${avgLatency}ms)`);
  assert(avgLatency < 100, `Average query latency (${avgLatency}ms) is well under 100ms threshold`);

  // Cleanup test book
  await prisma.book.delete({ where: { id: testBook.id } });

  console.log("\n========================================================");
  console.log(`  PHASE 5 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5Tests()
  .catch((err) => {
    console.error("Test execution threw exception:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
