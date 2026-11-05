/**
 * Test Suite: Sanskrit Shloka Intelligence & Kundalini Spirituality Studio
 */

import { SANSKRIT_SHLOKAS, queryShlokas } from "../server/spirituality/sanskritShlokas.js";
import { PRANAYAMA_PRACTICES, SUBTLE_NADIS, THREE_GRANTHIS } from "../server/spirituality/pranayamaData.js";

async function runTests() {
  console.log("=== GURUKUL SANSKRIT SHLOKA & KUNDALINI STUDIO TEST SUITE ===");
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

  // --- PART 1: Sanskrit Shloka Intelligence Tests ---
  console.log("\n--- Testing Sanskrit Shloka Intelligence ---");

  assert(Array.isArray(SANSKRIT_SHLOKAS) && SANSKRIT_SHLOKAS.length >= 6, `Shlokas database contains ${SANSKRIT_SHLOKAS.length} canonical verses`);

  for (const s of SANSKRIT_SHLOKAS) {
    assert(s.id && s.source && s.verseNumber, `Shloka ${s.id} has ID, source, and verse number`);
    assert(s.devanagari && s.devanagari.length > 10, `Shloka ${s.id} contains authentic Devanagari script`);
    assert(s.iast && s.iast.length > 10, `Shloka ${s.id} contains valid IAST transliteration`);
    assert(Array.isArray(s.anvaya) && s.anvaya.length > 0, `Shloka ${s.id} contains word-by-word Anvaya (${s.anvaya.length} tokens)`);
    assert(s.chhanda && typeof s.chhanda === "string", `Shloka ${s.id} defines classical Chhanda meter (${s.chhanda})`);
    assert(s.translationEn && s.translationHi, `Shloka ${s.id} contains bilingual English and Hindi translations`);

    // Verify each anvaya item has grammar tag and bilingual meaning
    for (const token of s.anvaya) {
      if (!token.word || !token.grammar || !token.meaningEn || !token.meaningHi) {
        assert(false, `Token in ${s.id} missing fields: ${JSON.stringify(token)}`);
      }
    }
  }

  // Test query functionality
  const bphsResults = queryShlokas({ source: "Brihat Parashara" });
  assert(bphsResults.length >= 1, "Query filters correctly by source 'Brihat Parashara'");

  const kundaliniResults = queryShlokas({ category: "Kundalini" });
  assert(kundaliniResults.length >= 2, "Query filters correctly by category 'Kundalini'");

  const keywordResults = queryShlokas({ query: "Purushartha" });
  assert(keywordResults.length >= 1 && keywordResults[0].id === "gita-6-5", "Query searches by concept keyword 'Purushartha'");

  // --- PART 2: Pranayama & Subtle Anatomy Studio Tests ---
  console.log("\n--- Testing Pranayama & Subtle Anatomy Studio ---");

  assert(Array.isArray(PRANAYAMA_PRACTICES) && PRANAYAMA_PRACTICES.length === 4, "4 canonical pranayama practices defined");

  for (const p of PRANAYAMA_PRACTICES) {
    assert(p.holdSec === 0, `${p.nameEn} adheres to safe mindfulness standard (holdSec === 0)`);
    assert(p.inhaleSec >= 4 && p.exhaleSec >= 4, `${p.nameEn} has gentle pacing (${p.ratio})`);
    assert(p.traditionalText && p.traditionalText.length > 5, `${p.nameEn} cites classical text (${p.traditionalText})`);
  }

  assert(Array.isArray(SUBTLE_NADIS) && SUBTLE_NADIS.length === 3, "3 primary Nadis defined (Ida, Pingala, Sushumna)");
  const nadiIds = SUBTLE_NADIS.map(n => n.id);
  assert(nadiIds.includes("ida") && nadiIds.includes("pingala") && nadiIds.includes("sushumna"), "All three Nadis present");

  assert(Array.isArray(THREE_GRANTHIS) && THREE_GRANTHIS.length === 3, "3 classical Granthis defined (Brahma, Vishnu, Rudra)");
  const granthiNames = THREE_GRANTHIS.map(g => g.name);
  assert(
    granthiNames.some(g => g.includes("Brahma")) &&
    granthiNames.some(g => g.includes("Vishnu")) &&
    granthiNames.some(g => g.includes("Rudra")),
    "Brahma, Vishnu, and Rudra Granthis present with transcendence guidance"
  );

  console.log(`\n=== RESULTS: ${passed} Passed, ${failed} Failed ===`);
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
