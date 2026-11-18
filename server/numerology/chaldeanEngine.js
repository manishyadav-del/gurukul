/**
 * Chaldean (Ancient Babylonian / Kabbalistic) Numerology Calculation Engine
 *
 * Implements canonical Chaldean numerology:
 * - 1-8 Alphabet grid (9 is sacred and excluded from alphabet mappings)
 * - Dual evaluation: Compound Number (10 to 52) for inner spiritual/occult vibration
 *   AND Single Root Digit (1-9) for outer physical/material vibration
 * - Day of Birth (Driver / Psychic) Number
 * - Full Date of Birth (Destiny / Life Path) Number
 * - Full Name Compound and Single Vibrations
 * - Soul Urge (Vowels) and Outer Personality (Consonants) in Chaldean phonetic scale
 * - Full calculation transparency with letter-by-letter intermediate steps
 */

import {
  CHALDEAN_LETTER_VALUES,
  CHALDEAN_COMPOUND_MEANINGS,
} from "./constants.js";
import { isVowel, transliterateDevanagariToRoman } from "./pythagoreanEngine.js";

/**
 * Reduces any positive integer down to a single digit (1-9) using digital root sum.
 *
 * @param {number} num
 * @returns {{ singleDigit: number, steps: string[] }}
 */
export function reduceChaldean(num) {
  if (!num || isNaN(num)) return { singleDigit: 1, steps: ["1"] };

  let current = Math.abs(Math.floor(num));
  const steps = [String(current)];

  while (current > 9) {
    const digits = String(current).split("").map(Number);
    const sum = digits.reduce((a, b) => a + b, 0);
    steps.push(`${digits.join(" + ")} = ${sum}`);
    current = sum;
  }

  return { singleDigit: current === 0 ? 9 : current, steps };
}

/**
 * Calculates Chaldean Day of Birth (Driver / Psychic Number).
 *
 * @param {string|Date} birthDate
 * @returns {Object}
 */
export function calculateChaldeanDayNumber(birthDate) {
  const d = birthDate instanceof Date ? birthDate : new Date(birthDate);
  if (isNaN(d.getTime())) {
    throw new Error("Invalid birth date provided for Chaldean day calculation");
  }

  const day = d.getUTCDate();
  const red = reduceChaldean(day);

  return {
    value: red.singleDigit,
    rawDay: day,
    compoundNumber: day > 9 ? day : null,
    compoundMeaning: day > 9 ? CHALDEAN_COMPOUND_MEANINGS[day] || null : null,
    formula: `Day of birth (${day}) reduced to single digit root (1-9)`,
    calculation: day > 9 ? `${day} -> ${red.steps.join(" -> ")}` : `${day}`,
  };
}

/**
 * Calculates Chaldean Destiny / Life Path Number from full date of birth.
 * In Chaldean system, all digits of day, month, and year are added together
 * to produce a compound total, which is then reduced to a single root digit.
 *
 * @param {string|Date} birthDate
 * @returns {Object}
 */
export function calculateChaldeanDestinyNumber(birthDate) {
  const d = birthDate instanceof Date ? birthDate : new Date(birthDate);
  if (isNaN(d.getTime())) {
    throw new Error("Invalid birth date provided for Chaldean destiny calculation");
  }

  const day = d.getUTCDate();
  const month = d.getUTCMonth() + 1;
  const year = d.getUTCFullYear();
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const allDigits = `${day}${month}${year}`.split("").map(Number);
  const totalSum = allDigits.reduce((acc, digit) => acc + digit, 0);
  const red = reduceChaldean(totalSum);

  return {
    value: red.singleDigit,
    compoundNumber: totalSum,
    compoundMeaning: CHALDEAN_COMPOUND_MEANINGS[totalSum] || null,
    rawDate: dateStr,
    totalSum,
    formula: `Sum of all digits in birth date: ${allDigits.join(" + ")} = ${totalSum}`,
    intermediateSteps: [
      `${allDigits.join(" + ")} = ${totalSum}`,
      `Reduction: ${red.steps.join(" -> ")}`,
    ],
  };
}

/**
 * Calculates Chaldean Name Vibrations:
 * - Name Compound Number & Single Root
 * - Vowels Compound Number & Single Root (Soul Urge)
 * - Consonants Compound Number & Single Root (Personality)
 *
 * @param {string} fullName
 * @returns {Object}
 */
export function calculateChaldeanNameNumbers(fullName) {
  if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
    throw new Error("Full name string is required for Chaldean name calculation");
  }

  const transliterated = transliterateDevanagariToRoman(fullName);
  const words = transliterated
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^A-Z]/g, ""))
    .filter(Boolean);

  if (words.length === 0) {
    throw new Error("Name must contain at least one alphabetic character");
  }

  const allLetters = [];
  const vowels = [];
  const consonants = [];

  let nameCompound = 0;
  let vowelsCompound = 0;
  let consonantsCompound = 0;

  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      const val = CHALDEAN_LETTER_VALUES[ch] || 0;
      if (val === 0) continue;

      const vowel = isVowel(ch, i, word);
      const letterObj = { char: ch, value: val, isVowel: vowel };

      allLetters.push(letterObj);
      nameCompound += val;

      if (vowel) {
        vowels.push(letterObj);
        vowelsCompound += val;
      } else {
        consonants.push(letterObj);
        consonantsCompound += val;
      }
    }
  }

  const nameRed = reduceChaldean(nameCompound);
  const vowelsRed = reduceChaldean(vowelsCompound);
  const consonantsRed = reduceChaldean(consonantsCompound);

  // Letter frequency analysis
  const frequencies = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 };
  for (const item of allLetters) {
    frequencies[item.value] = (frequencies[item.value] || 0) + 1;
  }

  const missingNumbers = Object.keys(frequencies)
    .map(Number)
    .filter((n) => frequencies[n] === 0);

  return {
    nameNumber: {
      singleDigit: nameRed.singleDigit,
      compoundNumber: nameCompound,
      compoundMeaning: CHALDEAN_COMPOUND_MEANINGS[nameCompound] || null,
      formula: `Sum of all letters using Chaldean vibration scale (1-8)`,
      intermediateSteps: [
        allLetters.map((l) => `${l.char}(${l.value})`).join(" + ") + ` = ${nameCompound}`,
        `Reduction to root: ${nameRed.steps.join(" -> ")}`,
      ],
    },
    soulUrge: {
      singleDigit: vowelsRed.singleDigit,
      compoundNumber: vowelsCompound,
      compoundMeaning: CHALDEAN_COMPOUND_MEANINGS[vowelsCompound] || null,
      formula: `Sum of ${vowels.length} vowels using Chaldean vibration scale`,
      intermediateSteps: [
        vowels.length > 0
          ? vowels.map((l) => `${l.char}(${l.value})`).join(" + ") + ` = ${vowelsCompound}`
          : "No vowels = 0 -> 1",
        `Reduction to root: ${vowelsRed.steps.join(" -> ")}`,
      ],
      vowelsList: vowels.map((v) => v.char),
    },
    personality: {
      singleDigit: consonantsRed.singleDigit,
      compoundNumber: consonantsCompound,
      compoundMeaning: CHALDEAN_COMPOUND_MEANINGS[consonantsCompound] || null,
      formula: `Sum of ${consonants.length} consonants using Chaldean vibration scale`,
      intermediateSteps: [
        consonants.length > 0
          ? consonants.map((l) => `${l.char}(${l.value})`).join(" + ") + ` = ${consonantsCompound}`
          : "No consonants = 0 -> 1",
        `Reduction to root: ${consonantsRed.steps.join(" -> ")}`,
      ],
      consonantsList: consonants.map((c) => c.char),
    },
    analytics: {
      totalLetters: allLetters.length,
      vowelCount: vowels.length,
      consonantCount: consonants.length,
      frequencies,
      missingNumbers,
    },
    allLetters,
  };
}

/**
 * Calculates Chaldean Personal Year, Month, and Day cycles.
 *
 * @param {string|Date} birthDate
 * @param {string|Date} [targetDate=new Date()]
 * @returns {Object}
 */
export function calculateChaldeanPersonalCycles(birthDate, targetDate = new Date()) {
  const b = birthDate instanceof Date ? birthDate : new Date(birthDate);
  const t = targetDate instanceof Date ? targetDate : new Date(targetDate);

  const birthDay = b.getUTCDate();
  const birthMonth = b.getUTCMonth() + 1;

  const targetDay = t.getUTCDate();
  const targetMonth = t.getUTCMonth() + 1;
  const targetYear = t.getUTCFullYear();

  // Personal Year = Birth Month + Birth Day + Target Year
  const bMonthRed = reduceChaldean(birthMonth).singleDigit;
  const bDayRed = reduceChaldean(birthDay).singleDigit;
  const tYearRed = reduceChaldean(targetYear).singleDigit;

  const pySum = bMonthRed + bDayRed + tYearRed;
  const pyRed = reduceChaldean(pySum);

  // Personal Month = Personal Year + Target Month
  const tMonthRed = reduceChaldean(targetMonth).singleDigit;
  const pmSum = pyRed.singleDigit + tMonthRed;
  const pmRed = reduceChaldean(pmSum);

  // Personal Day = Personal Month + Target Day
  const tDayRed = reduceChaldean(targetDay).singleDigit;
  const pdSum = pmRed.singleDigit + tDayRed;
  const pdRed = reduceChaldean(pdSum);

  return {
    personalYear: {
      value: pyRed.singleDigit,
      targetYear,
      formula: `Birth Month(${birthMonth})[${bMonthRed}] + Birth Day(${birthDay})[${bDayRed}] + Current Year(${targetYear})[${tYearRed}] = ${pySum}`,
      calculation: `${bMonthRed} + ${bDayRed} + ${tYearRed} = ${pySum} -> ${pyRed.steps.join(" -> ")}`,
    },
    personalMonth: {
      value: pmRed.singleDigit,
      targetMonth,
      formula: `Personal Year(${pyRed.singleDigit}) + Current Month(${targetMonth})[${tMonthRed}] = ${pmSum}`,
      calculation: `${pyRed.singleDigit} + ${tMonthRed} = ${pmSum} -> ${pmRed.steps.join(" -> ")}`,
    },
    personalDay: {
      value: pdRed.singleDigit,
      targetDay,
      formula: `Personal Month(${pmRed.singleDigit}) + Current Day(${targetDay})[${tDayRed}] = ${pdSum}`,
      calculation: `${pmRed.singleDigit} + ${tDayRed} = ${pdSum} -> ${pdRed.steps.join(" -> ")}`,
    },
  };
}

/**
 * Master Chaldean Numerology calculator.
 *
 * @param {Object} params
 * @param {string} params.name - Full birth name
 * @param {string|Date} params.birthDate - "YYYY-MM-DD"
 * @param {string|Date} [params.targetDate] - Target date for cycles
 * @returns {Object} Comprehensive calculation result
 */
export function calculateChaldeanNumerology({ name, birthDate, targetDate = new Date() }) {
  const dayNumber = calculateChaldeanDayNumber(birthDate);
  const destinyNumber = calculateChaldeanDestinyNumber(birthDate);
  const nameNumbers = calculateChaldeanNameNumbers(name);
  const cycles = calculateChaldeanPersonalCycles(birthDate, targetDate);

  return {
    system: "CHALDEAN",
    engineVersion: "2.0.0",
    calculatedAt: new Date().toISOString(),
    inputs: {
      name: name.trim(),
      birthDate: destinyNumber.rawDate,
      targetDate: (targetDate instanceof Date ? targetDate : new Date(targetDate)).toISOString().split("T")[0],
    },
    coreNumbers: {
      dayNumber,
      destinyNumber,
      nameNumber: nameNumbers.nameNumber,
      soulUrge: nameNumbers.soulUrge,
      personality: nameNumbers.personality,
    },
    nameAnalytics: nameNumbers.analytics,
    cycles,
    interpretationSource: "Cheiro's Book of Numbers / Ancient Chaldean-Babylonian Tradition",
  };
}
