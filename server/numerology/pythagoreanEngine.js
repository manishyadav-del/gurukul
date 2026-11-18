/**
 * Pythagorean (Western Esoteric) Numerology Calculation Engine
 *
 * Implements deterministic classical Pythagorean numerology:
 * - 1-9 Alphabet grid mapping
 * - Exact vowel / consonant discrimination (including contextual 'Y')
 * - Rigorous Master Number preservation (11, 22, 33) across all core calculations
 * - 3-stage Life Path reduction (Month + Day + Year)
 * - Complete calculation transparency with step-by-step intermediate formulas
 */

import {
  PYTHAGOREAN_LETTER_VALUES,
  PYTHAGOREAN_MASTER_NUMBERS,
} from "./constants.js";

/**
 * Transliterates Devanagari (Hindi/Sanskrit) script to uppercase phonetic Roman characters.
 *
 * @param {string} text
 * @returns {string} Phonetic Roman representation
 */
export function transliterateDevanagariToRoman(text) {
  if (!text || typeof text !== "string") return "";
  const devanagariMap = {
    // Vowels
    "अ": "A", "आ": "AA", "इ": "I", "ई": "EE", "उ": "U", "ऊ": "OO", "ऋ": "RI",
    "ए": "E", "ऐ": "AI", "ओ": "O", "औ": "AU", "अं": "AN", "अः": "AH",
    // Matras
    "ा": "A", "ि": "I", "ी": "I", "ु": "U", "ू": "U", "ृ": "RI",
    "े": "E", "ै": "AI", "ो": "O", "ौ": "AU", "ं": "N", "ः": "H", "्": "",
    // Consonants
    "क": "K", "ख": "KH", "ग": "G", "घ": "GH", "ङ": "NG",
    "च": "CH", "छ": "CHH", "ज": "J", "झ": "JH", "ञ": "NY",
    "ट": "T", "ठ": "TH", "ड": "D", "ढ": "DH", "ण": "N",
    "त": "T", "थ": "TH", "द": "D", "ध": "DH", "न": "N",
    "प": "P", "फ": "PH", "ब": "B", "भ": "BH", "म": "M",
    "य": "Y", "र": "R", "ल": "L", "व": "V",
    "श": "SH", "ष": "SH", "स": "S", "ह": "H",
    "क़": "Q", "ख़": "KH", "ग़": "GH", "ज़": "Z", "फ़": "F", "ड़": "R", "ढ़": "RH",
  };

  let result = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (devanagariMap[ch] !== undefined) {
      result += devanagariMap[ch];
    } else {
      result += ch;
    }
  }
  return result;
}

/**
 * Normalizes input name string: strips diacritics, punctuation, spaces, numbers, and converts to uppercase.
 * Supports both Latin and Devanagari script.
 *
 * @param {string} rawName
 * @returns {string} Clean uppercase A-Z string
 */
export function normalizeName(rawName) {
  if (!rawName || typeof rawName !== "string") return "";
  const transliterated = transliterateDevanagariToRoman(rawName);
  return transliterated
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Strip diacritics / accents
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

/**
 * Determines whether a character at a specific position in a word is a vowel.
 * Follows standard classical phonology:
 * - A, E, I, O, U are always vowels.
 * - Y is a vowel when:
 *   1. It is the only vowel sound in the word/syllable (e.g. "LYNN", "GYM")
 *   2. It is at the end of a word preceded by a consonant (e.g. "MARY", "GARY")
 *   3. It is preceded by a consonant (e.g. "BRYAN", "SMYTH")
 * - Otherwise Y acts as a consonant (e.g. "YES", "YOLANDA", "MAYA", "ROYAL").
 *
 * @param {string} ch - Single character
 * @param {number} index - Index in the word
 * @param {string} word - Full word string
 * @returns {boolean}
 */
export function isVowel(ch, index, word) {
  const upper = ch.toUpperCase();
  if (["A", "E", "I", "O", "U"].includes(upper)) return true;
  if (upper !== "Y") return false;

  // 'Y' contextual evaluation
  const prev = index > 0 ? word[index - 1].toUpperCase() : null;
  const next = index < word.length - 1 ? word[index + 1].toUpperCase() : null;
  const isVowelChar = (c) => c && ["A", "E", "I", "O", "U"].includes(c);

  // If initial letter (e.g. "YES", "YOLANDA"), acts as consonant
  if (index === 0) return false;

  // If at the end and preceded by a consonant (e.g. "MARY", "GARY"), acts as vowel
  if (index === word.length - 1 && prev && !isVowelChar(prev)) return true;

  // If between two consonants (e.g. "SMYTH", "CRYSTAL"), acts as vowel
  if (prev && next && !isVowelChar(prev) && !isVowelChar(next)) return true;

  // If no other vowels exist in the entire word, Y must be the vowel (e.g. "LYNN", "GYM")
  const hasOtherVowels = word.split("").some((c) => isVowelChar(c));
  if (!hasOtherVowels) return true;

  // If preceded by a consonant (e.g. "BRYAN", "WYATT"), acts as vowel
  if (prev && !isVowelChar(prev)) return true;

  return false;
}

/**
 * Reduces a positive integer down to a single digit (1-9) or a Master Number (11, 22, 33).
 *
 * @param {number} num
 * @param {boolean} [preserveMaster=true]
 * @returns {{ finalNumber: number, steps: string[] }}
 */
export function reducePythagorean(num, preserveMaster = true) {
  if (!num || isNaN(num)) return { finalNumber: 1, steps: ["1"] };

  let current = Math.abs(Math.floor(num));
  const steps = [String(current)];

  while (current > 9) {
    if (preserveMaster && PYTHAGOREAN_MASTER_NUMBERS.includes(current)) {
      break;
    }
    const digits = String(current).split("").map(Number);
    const sum = digits.reduce((a, b) => a + b, 0);
    steps.push(`${digits.join(" + ")} = ${sum}`);
    current = sum;
  }

  return { finalNumber: current, steps };
}

/**
 * Calculates Life Path Number using the classical 3-stage reduction method:
 * Stage 1: Reduce Month to single digit or Master Number
 * Stage 2: Reduce Day to single digit or Master Number
 * Stage 3: Reduce Year to single digit or Master Number
 * Stage 4: Sum Stage 1 + Stage 2 + Stage 3 and reduce to single digit or Master Number
 *
 * @param {string|Date} birthDate
 * @returns {Object} Full calculation breakdown
 */
export function calculatePythagoreanLifePath(birthDate) {
  const d = birthDate instanceof Date ? birthDate : new Date(birthDate);
  if (isNaN(d.getTime())) {
    throw new Error("Invalid birth date provided for Life Path calculation");
  }

  const day = d.getUTCDate();
  const month = d.getUTCMonth() + 1;
  const year = d.getUTCFullYear();

  // Stage 1: Month
  const monthRed = reducePythagorean(month, true);
  // Stage 2: Day
  const dayRed = reducePythagorean(day, true);
  // Stage 3: Year
  const yearRed = reducePythagorean(year, true);

  // Stage 4: Combined Sum
  const totalSum = monthRed.finalNumber + dayRed.finalNumber + yearRed.finalNumber;
  const finalRed = reducePythagorean(totalSum, true);

  const formula = `Month(${month})[${monthRed.finalNumber}] + Day(${day})[${dayRed.finalNumber}] + Year(${year})[${yearRed.finalNumber}] = ${totalSum}`;
  const intermediateSteps = [
    `Month: ${month} -> ${monthRed.finalNumber}`,
    `Day: ${day} -> ${dayRed.finalNumber}`,
    `Year: ${year} -> ${yearRed.steps.join(" -> ")}`,
    `Sum: ${monthRed.finalNumber} + ${dayRed.finalNumber} + ${yearRed.finalNumber} = ${totalSum}`,
    `Final Reduction: ${finalRed.steps.join(" -> ")}`,
  ];

  return {
    value: finalRed.finalNumber,
    isMasterNumber: PYTHAGOREAN_MASTER_NUMBERS.includes(finalRed.finalNumber),
    monthReduced: monthRed.finalNumber,
    dayReduced: dayRed.finalNumber,
    yearReduced: yearRed.finalNumber,
    totalSum,
    formula,
    intermediateSteps,
    rawDate: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  };
}

/**
 * Calculates Expression (Destiny), Soul Urge (Heart's Desire), and Personality Numbers
 * from full name with complete letter-by-letter transparency.
 *
 * @param {string} fullName
 * @returns {Object} Comprehensive name vibrations
 */
export function calculatePythagoreanNameNumbers(fullName) {
  if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
    throw new Error("Full name string is required for Pythagorean name calculation");
  }

  // Split into words to evaluate contextual 'Y' appropriately
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

  let expressionSum = 0;
  let soulUrgeSum = 0;
  let personalitySum = 0;

  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      const val = PYTHAGOREAN_LETTER_VALUES[ch] || 0;
      if (val === 0) continue;

      const vowel = isVowel(ch, i, word);
      const letterObj = { char: ch, value: val, isVowel: vowel };

      allLetters.push(letterObj);
      expressionSum += val;

      if (vowel) {
        vowels.push(letterObj);
        soulUrgeSum += val;
      } else {
        consonants.push(letterObj);
        personalitySum += val;
      }
    }
  }

  // Reductions
  const expressionRed = reducePythagorean(expressionSum, true);
  const soulUrgeRed = reducePythagorean(soulUrgeSum, true);
  const personalityRed = reducePythagorean(personalitySum, true);

  // Letter frequency analysis (1 to 9)
  const frequencies = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
  for (const item of allLetters) {
    frequencies[item.value] = (frequencies[item.value] || 0) + 1;
  }

  const missingNumbers = Object.keys(frequencies)
    .map(Number)
    .filter((n) => frequencies[n] === 0);

  let dominantNumber = 1;
  let maxCount = -1;
  for (let n = 1; n <= 9; n++) {
    if (frequencies[n] > maxCount) {
      maxCount = frequencies[n];
      dominantNumber = n;
    }
  }

  return {
    expression: {
      value: expressionRed.finalNumber,
      isMasterNumber: PYTHAGOREAN_MASTER_NUMBERS.includes(expressionRed.finalNumber),
      totalSum: expressionSum,
      formula: `Sum of all ${allLetters.length} letters in full name`,
      intermediateSteps: [
        allLetters.map((l) => `${l.char}(${l.value})`).join(" + ") + ` = ${expressionSum}`,
        `Reduction: ${expressionRed.steps.join(" -> ")}`,
      ],
    },
    soulUrge: {
      value: soulUrgeRed.finalNumber,
      isMasterNumber: PYTHAGOREAN_MASTER_NUMBERS.includes(soulUrgeRed.finalNumber),
      totalSum: soulUrgeSum,
      formula: `Sum of ${vowels.length} vowels in full name`,
      intermediateSteps: [
        vowels.length > 0
          ? vowels.map((l) => `${l.char}(${l.value})`).join(" + ") + ` = ${soulUrgeSum}`
          : "No vowels found = 0 -> 1",
        `Reduction: ${soulUrgeRed.steps.join(" -> ")}`,
      ],
      vowelsList: vowels.map((v) => v.char),
    },
    personality: {
      value: personalityRed.finalNumber,
      isMasterNumber: PYTHAGOREAN_MASTER_NUMBERS.includes(personalityRed.finalNumber),
      totalSum: personalitySum,
      formula: `Sum of ${consonants.length} consonants in full name`,
      intermediateSteps: [
        consonants.length > 0
          ? consonants.map((l) => `${l.char}(${l.value})`).join(" + ") + ` = ${personalitySum}`
          : "No consonants found = 0 -> 1",
        `Reduction: ${personalityRed.steps.join(" -> ")}`,
      ],
      consonantsList: consonants.map((c) => c.char),
    },
    analytics: {
      totalLetters: allLetters.length,
      vowelCount: vowels.length,
      consonantCount: consonants.length,
      frequencies,
      missingNumbers,
      dominantNumber,
      dominantCount: maxCount,
    },
    allLetters,
  };
}

/**
 * Calculates Birthday Number (Day of birth 1-31, preserving 11 and 22).
 *
 * @param {string|Date} birthDate
 * @returns {Object}
 */
export function calculatePythagoreanBirthdayNumber(birthDate) {
  const d = birthDate instanceof Date ? birthDate : new Date(birthDate);
  const day = d.getUTCDate();
  // 11 and 22 are kept as Master Numbers in Birthday calculation
  let val = day;
  let isMaster = false;
  let calculation = String(day);

  if (day === 11 || day === 22) {
    isMaster = true;
    calculation = `${day} (Master Number)`;
  } else if (day > 9) {
    const digits = String(day).split("").map(Number);
    val = digits.reduce((a, b) => a + b, 0);
    calculation = `${digits.join(" + ")} = ${val}`;
  }

  return {
    value: val,
    rawDay: day,
    isMasterNumber: isMaster,
    calculation,
    formula: `Day of birth (${day}) reduced to single digit or Master Number (11, 22)`,
  };
}

/**
 * Calculates Maturity (Attainment) Number = Life Path + Expression Number.
 * Becomes strongly active from age 35 to 40 onwards.
 *
 * @param {number} lifePath
 * @param {number} expression
 * @returns {Object}
 */
export function calculatePythagoreanMaturityNumber(lifePath, expression) {
  const sum = lifePath + expression;
  const red = reducePythagorean(sum, true);

  return {
    value: red.finalNumber,
    isMasterNumber: PYTHAGOREAN_MASTER_NUMBERS.includes(red.finalNumber),
    sum,
    formula: `Life Path (${lifePath}) + Expression (${expression}) = ${sum}`,
    intermediateSteps: [
      `${lifePath} + ${expression} = ${sum}`,
      `Reduction: ${red.steps.join(" -> ")}`,
    ],
  };
}

/**
 * Calculates Personal Year, Month, and Day numbers for a given target date.
 *
 * @param {string|Date} birthDate
 * @param {string|Date} [targetDate=new Date()]
 * @returns {Object}
 */
export function calculatePythagoreanPersonalCycles(birthDate, targetDate = new Date()) {
  const b = birthDate instanceof Date ? birthDate : new Date(birthDate);
  const t = targetDate instanceof Date ? targetDate : new Date(targetDate);

  const birthDay = b.getUTCDate();
  const birthMonth = b.getUTCMonth() + 1;

  const targetDay = t.getUTCDate();
  const targetMonth = t.getUTCMonth() + 1;
  const targetYear = t.getUTCFullYear();

  // Personal Year = Birth Month + Birth Day + Target Year
  const bMonthRed = reducePythagorean(birthMonth, false).finalNumber;
  const bDayRed = reducePythagorean(birthDay, false).finalNumber;
  const tYearRed = reducePythagorean(targetYear, false).finalNumber;

  const pySum = bMonthRed + bDayRed + tYearRed;
  const pyRed = reducePythagorean(pySum, true);

  // Personal Month = Personal Year + Target Month
  const tMonthRed = reducePythagorean(targetMonth, false).finalNumber;
  const pmSum = pyRed.finalNumber + tMonthRed;
  const pmRed = reducePythagorean(pmSum, true);

  // Personal Day = Personal Month + Target Day
  const tDayRed = reducePythagorean(targetDay, false).finalNumber;
  const pdSum = pmRed.finalNumber + tDayRed;
  const pdRed = reducePythagorean(pdSum, true);

  return {
    personalYear: {
      value: pyRed.finalNumber,
      targetYear,
      formula: `Birth Month(${birthMonth})[${bMonthRed}] + Birth Day(${birthDay})[${bDayRed}] + Current Year(${targetYear})[${tYearRed}] = ${pySum}`,
      calculation: `${bMonthRed} + ${bDayRed} + ${tYearRed} = ${pySum} -> ${pyRed.steps.join(" -> ")}`,
    },
    personalMonth: {
      value: pmRed.finalNumber,
      targetMonth,
      formula: `Personal Year(${pyRed.finalNumber}) + Current Month(${targetMonth})[${tMonthRed}] = ${pmSum}`,
      calculation: `${pyRed.finalNumber} + ${tMonthRed} = ${pmSum} -> ${pmRed.steps.join(" -> ")}`,
    },
    personalDay: {
      value: pdRed.finalNumber,
      targetDay,
      formula: `Personal Month(${pmRed.finalNumber}) + Current Day(${targetDay})[${tDayRed}] = ${pdSum}`,
      calculation: `${pmRed.finalNumber} + ${tDayRed} = ${pdSum} -> ${pdRed.steps.join(" -> ")}`,
    },
  };
}

/**
 * Master Pythagorean Numerology report calculator.
 *
 * @param {Object} params
 * @param {string} params.name - Full birth name
 * @param {string|Date} params.birthDate - "YYYY-MM-DD"
 * @param {string|Date} [params.targetDate] - Target date for cycles
 * @returns {Object} Comprehensive calculation result
 */
export function calculatePythagoreanNumerology({ name, birthDate, targetDate = new Date() }) {
  const lifePath = calculatePythagoreanLifePath(birthDate);
  const nameNumbers = calculatePythagoreanNameNumbers(name);
  const birthday = calculatePythagoreanBirthdayNumber(birthDate);
  const maturity = calculatePythagoreanMaturityNumber(lifePath.value, nameNumbers.expression.value);
  const cycles = calculatePythagoreanPersonalCycles(birthDate, targetDate);

  return {
    system: "PYTHAGOREAN",
    engineVersion: "2.0.0",
    calculatedAt: new Date().toISOString(),
    inputs: {
      name: name.trim(),
      birthDate: lifePath.rawDate,
      targetDate: (targetDate instanceof Date ? targetDate : new Date(targetDate)).toISOString().split("T")[0],
    },
    coreNumbers: {
      lifePath,
      expression: nameNumbers.expression,
      soulUrge: nameNumbers.soulUrge,
      personality: nameNumbers.personality,
      birthday,
      maturity,
    },
    nameAnalytics: nameNumbers.analytics,
    cycles,
    interpretationSource: "Pythagorean Tetraktys and Western Esoteric Tradition",
  };
}
