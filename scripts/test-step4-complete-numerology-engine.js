/**
 * Gurukul Step 4: Complete Numerology Engine & Report Generation Test Suite
 *
 * Validates:
 * 1. Pythagorean Numerology Engine (1-9 grid, Master Numbers 11/22/33, contextual Y, 3-stage Life Path, Expression, Soul Urge, Personality, Birthday, Maturity)
 * 2. Chaldean Numerology Engine (1-8 grid, Compound Numbers 10-52, Destiny, Name, Soul Urge, Personality)
 * 3. Vedic Numerology (Sankhya Shastra: Mulank, Bhagyank, Namank, 3x3 Anka Yantra)
 * 4. Name Normalization & Vowel/Consonant Discrimination
 * 5. Edge cases: Leap years, boundary dates, accents, punctuation, Y behavior
 * 6. 10-Section Structured Report Generation (Bilingual: English & Hindi)
 * 7. Calculation Transparency & Formula Verification
 */

import assert from "assert";
import {
  PYTHAGOREAN_LETTER_VALUES,
  CHALDEAN_LETTER_VALUES,
  CHALDEAN_COMPOUND_MEANINGS,
  PYTHAGOREAN_MASTER_NUMBERS,
} from "../server/numerology/constants.js";
import {
  normalizeName,
  isVowel,
  reducePythagorean,
  calculatePythagoreanLifePath,
  calculatePythagoreanNameNumbers,
  calculatePythagoreanBirthdayNumber,
  calculatePythagoreanMaturityNumber,
  calculatePythagoreanPersonalCycles,
  calculatePythagoreanNumerology,
} from "../server/numerology/pythagoreanEngine.js";
import {
  reduceChaldean,
  calculateChaldeanDayNumber,
  calculateChaldeanDestinyNumber,
  calculateChaldeanNameNumbers,
  calculateChaldeanPersonalCycles,
  calculateChaldeanNumerology,
} from "../server/numerology/chaldeanEngine.js";
import {
  calculateMulank,
  calculateBhagyank,
  calculateNamank,
  calculateVedicGrid,
  calculateCompleteNumerology,
} from "../server/numerology/numerologyEngine.js";
import { generateStructuredReport } from "../server/numerology/reportGenerator.js";

let passed = 0;
let total = 0;

function runTest(description, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] ${description}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${description}`);
    console.error(`         ${err.message}`);
  }
}

console.log("================================================================================");
console.log("   GURUKUL STEP 4: NUMEROLOGY ENGINE & REPORT GENERATION TEST SUITE            ");
console.log("================================================================================\n");

// -----------------------------------------------------------------------------
// SECTION 1: NAME NORMALIZATION & VOWEL DISCRIMINATION
// -----------------------------------------------------------------------------
console.log("--- Section 1: Name Normalization & Phonetic Discrimination ---");

runTest("normalizeName removes accents, punctuation, spaces and converts to uppercase", () => {
  assert.strictEqual(normalizeName("  Dr. René J. O'Connor-Smith! "), "DRRENEJOCONNORSMITH");
  assert.strictEqual(normalizeName("Àlexandêr"), "ALEXANDER");
  assert.strictEqual(normalizeName(""), "");
});

runTest("isVowel accurately identifies standard vowels A, E, I, O, U", () => {
  assert.strictEqual(isVowel("a", 0, "alex"), true);
  assert.strictEqual(isVowel("E", 1, "PETER"), true);
  assert.strictEqual(isVowel("i", 2, "SHIVA"), true);
  assert.strictEqual(isVowel("o", 1, "JOHN"), true);
  assert.strictEqual(isVowel("u", 1, "GURU"), true);
  assert.strictEqual(isVowel("b", 0, "BOB"), false);
});

runTest("isVowel accurately handles contextual 'Y' (vowel vs consonant)", () => {
  // 'Y' at start is consonant
  assert.strictEqual(isVowel("Y", 0, "YES"), false);
  assert.strictEqual(isVowel("Y", 0, "YOLANDA"), false);

  // 'Y' at end after consonant is vowel
  assert.strictEqual(isVowel("Y", 3, "MARY"), true);
  assert.strictEqual(isVowel("Y", 4, "HARRY"), true);

  // 'Y' between consonants is vowel
  assert.strictEqual(isVowel("Y", 2, "BRYAN"), true);
  assert.strictEqual(isVowel("Y", 2, "SMYTH"), true);

  // 'Y' in word with no other vowels is vowel
  assert.strictEqual(isVowel("Y", 1, "LYNN"), true);
  assert.strictEqual(isVowel("Y", 1, "GYM"), true);
});

// -----------------------------------------------------------------------------
// SECTION 2: PYTHAGOREAN NUMEROLOGY SYSTEM
// -----------------------------------------------------------------------------
console.log("\n--- Section 2: Pythagorean Numerology Engine ---");

runTest("reducePythagorean preserves Master Numbers (11, 22, 33)", () => {
  assert.strictEqual(reducePythagorean(11, true).finalNumber, 11);
  assert.strictEqual(reducePythagorean(22, true).finalNumber, 22);
  assert.strictEqual(reducePythagorean(33, true).finalNumber, 33);
  assert.strictEqual(reducePythagorean(29, true).finalNumber, 11); // 2+9 = 11 -> preserved!
  assert.strictEqual(reducePythagorean(25, true).finalNumber, 7);  // 2+5 = 7
  assert.strictEqual(reducePythagorean(38, true).finalNumber, 11); // 3+8 = 11 -> preserved!
});

runTest("Pythagorean Life Path performs classical 3-stage reduction", () => {
  // Reference: November 22, 1980
  // Month: 11 (Master)
  // Day: 22 (Master)
  // Year: 1980 -> 1+9+8+0 = 18 -> 1+8 = 9
  // Total: 11 + 22 + 9 = 42 -> 4+2 = 6
  const lp1 = calculatePythagoreanLifePath("1980-11-22");
  assert.strictEqual(lp1.monthReduced, 11);
  assert.strictEqual(lp1.dayReduced, 22);
  assert.strictEqual(lp1.yearReduced, 9);
  assert.strictEqual(lp1.value, 6);
  assert(lp1.intermediateSteps.length >= 4);

  // Reference Master Life Path 11: July 29, 1990
  // Month: 7
  // Day: 29 -> 11 (Master)
  // Year: 1990 -> 19 -> 10 -> 1
  // Total: 7 + 11 + 1 = 19 -> 10 -> 1
  const lp2 = calculatePythagoreanLifePath("1990-07-29");
  assert.strictEqual(lp2.dayReduced, 11);
});

runTest("Pythagorean Expression, Soul Urge & Personality compute with Master Numbers", () => {
  // John Smith
  // J(1) O(6) H(8) N(5) = 20
  // S(1) M(4) I(9) T(2) H(8) = 24
  // Expression Total = 44 -> 4+4 = 8
  const res = calculatePythagoreanNameNumbers("John Smith");
  assert.strictEqual(res.expression.value, 8);

  // Vowels in "John Smith": O(6), I(9) -> 6 + 9 = 15 -> 1+5 = 6 (Soul Urge)
  assert.strictEqual(res.soulUrge.value, 6);

  // Consonants in "John Smith": J(1), H(8), N(5), S(1), M(4), T(2), H(8)
  // Sum = 1+8+5+1+4+2+8 = 29 -> 2+9 = 11 (Master Number Personality!)
  assert.strictEqual(res.personality.value, 11);
  assert.strictEqual(res.personality.isMasterNumber, true);
});

runTest("Pythagorean Birthday Number preserves 11 and 22", () => {
  assert.strictEqual(calculatePythagoreanBirthdayNumber("1990-05-11").value, 11);
  assert.strictEqual(calculatePythagoreanBirthdayNumber("1990-05-22").value, 22);
  assert.strictEqual(calculatePythagoreanBirthdayNumber("1990-05-25").value, 7); // 2+5 = 7
});

runTest("Pythagorean Maturity Number = Life Path + Expression", () => {
  // LP 6 + Expression 8 = 14 -> 1+4 = 5
  const mat = calculatePythagoreanMaturityNumber(6, 8);
  assert.strictEqual(mat.value, 5);
  assert.strictEqual(mat.sum, 14);

  // LP 11 + Expression 22 = 33 (Master Number Maturity!)
  const matMaster = calculatePythagoreanMaturityNumber(11, 22);
  assert.strictEqual(matMaster.value, 33);
  assert.strictEqual(matMaster.isMasterNumber, true);
});

runTest("Pythagorean Personal Year, Month, and Day cycles compute accurately", () => {
  // DOB: May 15 (Month 5, Day 15 -> 6), Target Year: 2026 -> 2+0+2+6 = 10 -> 1
  // Personal Year = 5 + 6 + 1 = 12 -> 3
  const cycles = calculatePythagoreanPersonalCycles("1990-05-15", "2026-11-18");
  assert.strictEqual(cycles.personalYear.value, 3);
  // Target Month = 11 -> 2. Personal Month = 3 + 2 = 5
  assert.strictEqual(cycles.personalMonth.value, 5);
  // Target Day = 18 -> 9. Personal Day = 5 + 9 = 14 -> 5
  assert.strictEqual(cycles.personalDay.value, 5);
});

// -----------------------------------------------------------------------------
// SECTION 3: CHALDEAN NUMEROLOGY SYSTEM
// -----------------------------------------------------------------------------
console.log("\n--- Section 3: Chaldean Numerology Engine ---");

runTest("Chaldean alphabet has no letter assigned to 9", () => {
  const values = Object.values(CHALDEAN_LETTER_VALUES);
  assert.strictEqual(values.includes(9), false);
  assert.strictEqual(CHALDEAN_LETTER_VALUES["A"], 1);
  assert.strictEqual(CHALDEAN_LETTER_VALUES["F"], 8);
  assert.strictEqual(CHALDEAN_LETTER_VALUES["P"], 8);
});

runTest("Chaldean Name Numbers compute Compound Number and Single Root", () => {
  // Name: "Manish Sharma"
  // M(4) A(1) N(5) I(1) S(3) H(5) = 19
  // S(3) H(5) A(1) R(2) M(4) A(1) = 16
  // Total Compound = 19 + 16 = 35 -> 3+5 = 8
  const res = calculateChaldeanNameNumbers("Manish Sharma");
  assert.strictEqual(res.nameNumber.compoundNumber, 35);
  assert.strictEqual(res.nameNumber.singleDigit, 8);
  assert(res.nameNumber.intermediateSteps.length >= 2);
});

runTest("Chaldean Compound Numbers map to verified classical interpretations", () => {
  assert(CHALDEAN_COMPOUND_MEANINGS[10]);
  assert.strictEqual(CHALDEAN_COMPOUND_MEANINGS[10].titleEn, "The Wheel of Fortune");
  assert.strictEqual(CHALDEAN_COMPOUND_MEANINGS[19].titleEn, "The Prince of Heaven");
  assert.strictEqual(CHALDEAN_COMPOUND_MEANINGS[23].titleEn, "The Royal Star of the Lion");
  assert.strictEqual(CHALDEAN_COMPOUND_MEANINGS[24].titleEn, "Love, Harmony, and Material Success");
});

runTest("Chaldean Destiny and Day Numbers compute accurately", () => {
  // 1990-05-15
  // Day: 15 -> Compound 15 (Venusian Magnetism), Single 6
  const day = calculateChaldeanDayNumber("1990-05-15");
  assert.strictEqual(day.rawDay, 15);
  assert.strictEqual(day.compoundNumber, 15);
  assert.strictEqual(day.value, 6);
  assert.strictEqual(day.compoundMeaning.titleEn, "The Magician / Venusian Magnetism");

  // Destiny: 1+5 + 0+5 + 1+9+9+0 = 6 + 5 + 19 = 30 -> 3
  const dest = calculateChaldeanDestinyNumber("1990-05-15");
  assert.strictEqual(dest.totalSum, 30);
  assert.strictEqual(dest.value, 3);
});

// -----------------------------------------------------------------------------
// SECTION 4: VEDIC NUMEROLOGY (SANKHYA SHASTRA)
// -----------------------------------------------------------------------------
console.log("\n--- Section 4: Vedic Numerology Engine ---");

runTest("Vedic Mulank, Bhagyank, and Loshu Grid are computed deterministically", () => {
  const m = calculateMulank(15);
  assert.strictEqual(m.mulank, 6);

  const b = calculateBhagyank("1990-05-15");
  assert.strictEqual(b.bhagyank, 3);

  const n = calculateNamank("Manish");
  assert.strictEqual(n.compoundNumber, 19);
  assert.strictEqual(n.namank, 1);

  const grid = calculateVedicGrid("1990-05-15", m.mulank, b.bhagyank);
  assert(grid.frequencies[1] > 0);
  assert(grid.frequencies[9] > 0);
  assert(grid.frequencies[5] > 0);
  assert(grid.planes.mentalPlane);
});

// -----------------------------------------------------------------------------
// SECTION 5: BOUNDARY CASES & INPUT VALIDATION
// -----------------------------------------------------------------------------
console.log("\n--- Section 5: Boundary Conditions & Edge Cases ---");

runTest("Handles leap-year birth date (2000-02-29) smoothly", () => {
  const lp = calculatePythagoreanLifePath("2000-02-29");
  assert(lp.value >= 1 && lp.value <= 9);
  const ch = calculateChaldeanDestinyNumber("2000-02-29");
  assert(ch.value >= 1 && ch.value <= 9);
});

runTest("Handles year boundary (1999-12-31 and 2000-01-01)", () => {
  const p1 = calculatePythagoreanLifePath("1999-12-31");
  const p2 = calculatePythagoreanLifePath("2000-01-01");
  assert(p1.value >= 1 && p1.value <= 9);
  assert(p2.value >= 1 && p2.value <= 9);
});

runTest("Rejects invalid names and dates gracefully with meaningful errors", () => {
  assert.throws(() => calculatePythagoreanNameNumbers(""), /required/);
  assert.throws(() => calculatePythagoreanNameNumbers("12345"), /alphabetic/);
  assert.throws(() => calculatePythagoreanLifePath("invalid-date"), /Invalid birth date/);
});

// -----------------------------------------------------------------------------
// SECTION 6: 10-SECTION STRUCTURED REPORT GENERATION
// -----------------------------------------------------------------------------
console.log("\n--- Section 6: 10-Section Structured Report Generation ---");

runTest("calculateCompleteNumerology generates complete 10-section report in English", () => {
  const result = calculateCompleteNumerology({
    name: "Manish Sharma",
    birthDate: "1990-05-15",
    system: "CHALDEAN",
    language: "en",
  });

  assert(result.report);
  const sec = result.report.sections;
  assert(sec.overview);
  assert(sec.coreNumbers);
  assert(sec.nameAnalysis);
  assert(sec.personality);
  assert(sec.strengthsAndChallenges);
  assert(sec.personalYearCycle);
  assert(sec.monthlyGuidance);
  assert(sec.compatibility);
  assert(sec.career);
  assert(sec.summaryAndRecommendations);

  // Check 12 months present
  assert.strictEqual(sec.monthlyGuidance.months.length, 12);
  assert(sec.compatibility.naturalHarmonies.length > 0);
  assert(sec.summaryAndRecommendations.luckyColors.length > 0);
});

runTest("calculateCompleteNumerology generates complete 10-section report in Hindi", () => {
  const result = calculateCompleteNumerology({
    name: "मनीष शर्मा",
    birthDate: "1990-05-15",
    system: "PYTHAGOREAN",
    language: "hi",
  });

  assert(result.report);
  const sec = result.report.sections;
  assert.strictEqual(result.language, "hi");
  assert(sec.overview.title.includes("अंकज्योतिष") || sec.overview.coreVibrationSummary);
  assert(sec.monthlyGuidance.months[0].monthName === "जनवरी");
  assert(sec.summaryAndRecommendations.traditionalDisclaimer.includes("वैदिक"));
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("\n================================================================================");
console.log(`   Step 4 Validation Results: ${passed} / ${total} tests passed                `);
console.log("================================================================================\n");

if (passed !== total) {
  process.exit(1);
}
