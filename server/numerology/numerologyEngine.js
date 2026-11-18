/**
 * Gurukul Vedic Numerology (Sankhya Shastra) Engine
 *
 * Implements deterministic classical Indian Numerology (अंक शास्त्र) derived from
 * Vedic Jyotisha correlations, Surya Siddhanta planetary rulerships, and canonical Chaldean-Vedic phonetics.
 *
 * All values are computed deterministically from verified mathematical formulas.
 * NO LLM or mock values — 100% genuine algorithmic calculations.
 */

import { calculatePythagoreanNumerology, transliterateDevanagariToRoman } from "./pythagoreanEngine.js";
import { calculateChaldeanNumerology } from "./chaldeanEngine.js";
import { generateStructuredReport } from "./reportGenerator.js";

// Canonical Chaldean-Vedic letter vibration table
export const CHALDEAN_VALUES = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

// Classical Planetary & Devata Correspondences for Numbers 1-9
export const NUMEROLOGY_PLANETARY_PROFILES = {
  1: {
    number: 1,
    graha: "Surya (Sun)",
    grahaDevanagari: "सूर्य",
    deity: "Lord Shiva / Aditya",
    element: "Agni (Fire)",
    nature: "King, Leader, Pioneer, Radiant, Resolute",
    luckyColors: ["Gold", "Orange", "Ruby Red", "Saffron"],
    luckyDays: ["Sunday"],
    luckyGemstone: "Ruby (Manikya)",
    favorableDirection: "East",
    beejMantra: "ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः",
    friendlyNumbers: [1, 2, 3, 5, 9],
    neutralNumbers: [4, 7],
    enemyNumbers: [6, 8],
    qualities: [
      "Natural executive authority, commanding presence, and entrepreneurial initiative",
      "High self-respect, moral clarity, and protective instincts for dependents",
      "Goal-driven ambition that thrives when independent rather than subordinate",
    ],
    vulnerabilities: [
      "Susceptibility to excessive pride (Ahamkara) or impatience when others move slowly",
      "Risk of professional burnout from refusing to delegate responsibilities",
    ],
  },
  2: {
    number: 2,
    graha: "Chandra (Moon)",
    grahaDevanagari: "चन्द्र",
    deity: "Goddess Parvati / Bhuvaneshwari",
    element: "Jala (Water)",
    nature: "Peacemaker, Sensitive, Intuitive, Adaptable, Nurturing",
    luckyColors: ["Pearl White", "Cream", "Silver", "Light Green"],
    luckyDays: ["Monday"],
    luckyGemstone: "Natural Pearl (Moti) / Moonstone",
    favorableDirection: "North-West",
    beejMantra: "ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः",
    friendlyNumbers: [1, 2, 3, 5],
    neutralNumbers: [6, 8],
    enemyNumbers: [4, 7, 9],
    qualities: [
      "High emotional intelligence, empathy, and intuitive discernment",
      "Superb collaborative ability, diplomatic problem-solving, and creative imagination",
      "Aesthetic sensitivity and appreciation for peaceful, harmonious environments",
    ],
    vulnerabilities: [
      "Fluctuating mood and vulnerability to taking others' negativity personally",
      "Tendency toward hesitation or self-doubt when confronted with harsh hostility",
    ],
  },
  3: {
    number: 3,
    graha: "Brihaspati / Guru (Jupiter)",
    grahaDevanagari: "बृहस्पति (गुरु)",
    deity: "Lord Brahma / Brihaspati",
    element: "Akasha (Ether)",
    nature: "Counselor, Knowledge Seeker, Generous, Dharmic, Philosophical",
    luckyColors: ["Bright Yellow", "Golden Saffron", "Amber"],
    luckyDays: ["Thursday"],
    luckyGemstone: "Yellow Sapphire (Pukhraj)",
    favorableDirection: "North-East (Ishanya)",
    beejMantra: "ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः",
    friendlyNumbers: [1, 2, 3, 5, 9],
    neutralNumbers: [4, 8],
    enemyNumbers: [6, 7],
    qualities: [
      "Profound philosophical intellect, love for higher wisdom, and pedagogical gifts",
      "Optimistic life view grounded in classical righteousness (Dharma)",
      "Natural mentor whose counsel is sought by peers, colleagues, and family",
    ],
    vulnerabilities: [
      "Tendency toward unsolicited advice or dogmatic certainty",
      "Overextending energy across too many academic or philanthropic endeavors",
    ],
  },
  4: {
    number: 4,
    graha: "Rahu",
    grahaDevanagari: "राहु",
    deity: "Goddess Durga / Bhairava",
    element: "Vayu (Air)",
    nature: "Revolutionary, Structural Builder, Analytical, Unconventional",
    luckyColors: ["Electric Blue", "Smoky Grey", "Khaki"],
    luckyDays: ["Saturday", "Wednesday"],
    luckyGemstone: "Hessonite Garnet (Gomed)",
    favorableDirection: "South-West",
    beejMantra: "ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः",
    friendlyNumbers: [1, 5, 6, 7],
    neutralNumbers: [3, 8],
    enemyNumbers: [2, 4, 9],
    qualities: [
      "Sharp systematic thinking, technical mastery, and pattern recognition",
      "Courage to question outdated dogmas and architect modern structural systems",
      "Steadfast loyalty in friendships and resolute endurance through adversity",
    ],
    vulnerabilities: [
      "Feeling misunderstood by traditionalists or feeling an underlying sense of alienation",
      "Sudden unexpected shifts in career or circumstances requiring rapid pivot",
    ],
  },
  5: {
    number: 5,
    graha: "Budha (Mercury)",
    grahaDevanagari: "बुध",
    deity: "Lord Vishnu / Narayana",
    element: "Prithvi (Earth)",
    nature: "Communicator, Merchant, Quick-witted, Versatile, Analytical",
    luckyColors: ["Emerald Green", "Parrot Green", "Mint"],
    luckyDays: ["Wednesday"],
    luckyGemstone: "Emerald (Panna)",
    favorableDirection: "North",
    beejMantra: "ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः",
    friendlyNumbers: [1, 2, 3, 5, 6],
    neutralNumbers: [4, 7, 8, 9],
    enemyNumbers: [], // 5 has no natural enemies in classical Sankhya Shastra
    qualities: [
      "Quick analytical wit, commercial acumen, and eloquent communication skills",
      "Adaptable across diverse cultures, industries, and social circles",
      "Rapid learning capability with an inquisitive, youthful outlook",
    ],
    vulnerabilities: [
      "Restlessness, nervous exhaustion, or difficulty committing to a single long path",
      "Scattering mental focus when bored with repetitive administrative duties",
    ],
  },
  6: {
    number: 6,
    graha: "Shukra (Venus)",
    grahaDevanagari: "शुक्र",
    deity: "Goddess Lakshmi / Mahalakshmi",
    element: "Jala (Water)",
    nature: "Aesthetic, Harmonious, Nurturing, Artistic, Luxurious",
    luckyColors: ["Pure White", "Pastel Blue", "Rose Pink", "Silver"],
    luckyDays: ["Friday"],
    luckyGemstone: "Diamond (Heera) / White Zircon",
    favorableDirection: "South-East",
    beejMantra: "ॐ द्रां द्रीं द्रौं सः शुक्राय नमः",
    friendlyNumbers: [1, 4, 5, 6, 7],
    neutralNumbers: [2, 8],
    enemyNumbers: [3],
    qualities: [
      "Refined aesthetic taste, artistic discernment, and magnetic social charm",
      "Devoted family commitment, warm hospitality, and instinct for community care",
      "Appreciation for quality, comfort, fine design, and tranquil environments",
    ],
    vulnerabilities: [
      "Susceptibility to indulgence, extravagance, or over-sacrificing for ungrateful recipients",
      "Difficulty confronting direct conflict without aesthetic distress",
    ],
  },
  7: {
    number: 7,
    graha: "Ketu",
    grahaDevanagari: "केतु",
    deity: "Lord Ganesha / Matsya Avatar",
    element: "Akasha (Ether)",
    nature: "Mystic, Researcher, Introspective, Spiritual, Ascetic, Intuitive",
    luckyColors: ["Sea Green", "Light Yellow", "Off-White", "Smoky Brown"],
    luckyDays: ["Monday", "Thursday"],
    luckyGemstone: "Cat's Eye (Vaidurya)",
    favorableDirection: "North-East",
    beejMantra: "ॐ स्रां स्रीं स्रौं सः केतवे नमः",
    friendlyNumbers: [1, 4, 5, 6],
    neutralNumbers: [3, 8],
    enemyNumbers: [2, 9],
    qualities: [
      "Deep spiritual introspection, interest in occult/esoteric sciences and meditation",
      "Piercing research mind that penetrates superficial claims to uncover hidden truths",
      "High natural detachment from materialistic pretense and worldly superficiality",
    ],
    vulnerabilities: [
      "Tendency toward seclusion, aloofness, or melancholy when misunderstood",
      "Overthinking intuitive insights until practical action is paralyzed",
    ],
  },
  8: {
    number: 8,
    graha: "Shani (Saturn)",
    grahaDevanagari: "शनि",
    deity: "Lord Hanuman / Yama / Shani Deva",
    element: "Vayu (Air)",
    nature: "Disciplined, Karmic Master, Enduring, Structural, Just",
    luckyColors: ["Navy Blue", "Charcoal", "Royal Violet", "Black"],
    luckyDays: ["Saturday"],
    luckyGemstone: "Blue Sapphire (Neelam) / Amethyst",
    favorableDirection: "West",
    beejMantra: "ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः",
    friendlyNumbers: [3, 5, 6, 7],
    neutralNumbers: [4],
    enemyNumbers: [1, 2, 9],
    qualities: [
      "Exceptional capacity for sustained discipline, long-term sacrifice, and resilience",
      "Profound respect for universal justice, truth, and karmic accountability",
      "Mastery of tangible structures, large-scale systems, and realistic execution",
    ],
    vulnerabilities: [
      "Early life struggles that require patience before delayed success blossoms after age 35",
      "Risk of cynicism, emotional rigidity, or self-imposed isolation",
    ],
  },
  9: {
    number: 9,
    graha: "Mangala (Mars)",
    grahaDevanagari: "मंगल",
    deity: "Lord Kartikeya / Hanuman / Narasimha",
    element: "Agni (Fire)",
    nature: "Warrior, Protector, Courageous, Dynamic, Humanitarian",
    luckyColors: ["Coral Red", "Crimson", "Maroon"],
    luckyDays: ["Tuesday"],
    luckyGemstone: "Red Coral (Moonga)",
    favorableDirection: "South",
    beejMantra: "ॐ क्रां क्रीं क्रौं सः भौमाय नमः",
    friendlyNumbers: [1, 2, 3, 5],
    neutralNumbers: [6, 8],
    enemyNumbers: [4, 7],
    qualities: [
      "Boundless dynamic energy, fearless courage, and heroic protective instincts",
      "Humanitarian impulse to champion the underdog and combat injustice",
      "Decisive action under high pressure and resilience in athletic/physical spheres",
    ],
    vulnerabilities: [
      "Combative reactivity, sharp temper, or asserting dominance unnecessarily",
      "Prone to rash decisions or physical accidents due to impulsive speed",
    ],
  },
};

/**
 * Reduces any positive integer down to a single digit (1-9) using standard digital root sum.
 *
 * @param {number} num
 * @returns {number} 1 to 9
 */
export function reduceToSingleDigit(num) {
  if (!num || isNaN(num)) return 1;
  let n = Math.abs(Math.floor(num));
  while (n > 9) {
    let sum = 0;
    while (n > 0) {
      sum += n % 10;
      n = Math.floor(n / 10);
    }
    n = sum;
  }
  return n === 0 ? 9 : n;
}

/**
 * Computes Mulank (Psychic / Driver Number) from birth day.
 *
 * @param {number|string} day - Day of month (1-31)
 * @returns {{ mulank: number, originalDay: number, calculation: string }}
 */
export function calculateMulank(day) {
  const d = parseInt(day, 10);
  if (isNaN(d) || d < 1 || d > 31) {
    throw new Error("Invalid birth day: must be an integer between 1 and 31");
  }
  const mulank = reduceToSingleDigit(d);
  const calculation = d > 9 ? `${d} -> ${Math.floor(d / 10)} + ${d % 10} = ${mulank}` : `${d}`;
  return { mulank, originalDay: d, calculation };
}

/**
 * Computes Bhagyank (Destiny / Life Path Number) from full birth date (YYYY-MM-DD or Date).
 *
 * @param {string|Date} birthDateInput
 * @returns {{ bhagyank: number, totalSum: number, calculation: string, dateStr: string }}
 */
export function calculateBhagyank(birthDateInput) {
  let d;
  if (birthDateInput instanceof Date) {
    d = birthDateInput;
  } else {
    d = new Date(birthDateInput);
  }
  if (isNaN(d.getTime())) {
    throw new Error("Invalid birth date provided for Bhagyank calculation");
  }

  // Use UTC to prevent local timezone shifts
  const day = d.getUTCDate();
  const month = d.getUTCMonth() + 1;
  const year = d.getUTCFullYear();
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const allDigits = `${day}${month}${year}`.split("").map((c) => parseInt(c, 10));
  const totalSum = allDigits.reduce((acc, digit) => acc + digit, 0);
  const bhagyank = reduceToSingleDigit(totalSum);

  const calculation = `${allDigits.join(" + ")} = ${totalSum} -> ${bhagyank}`;
  return { bhagyank, totalSum, calculation, dateStr };
}

/**
 * Computes Namank (Name Number) from an individual's name using the Chaldean-Vedic system.
 *
 * @param {string} name
 * @returns {{
 *   namank: number,
 *   compoundNumber: number,
 *   calculation: string,
 *   letterBreakdown: Array<{ char: string, value: number }>
 * }}
 */
export function calculateNamank(name) {
  if (!name || typeof name !== "string") {
    throw new Error("Valid name string is required for Namank calculation");
  }

  const transliterated = transliterateDevanagariToRoman(name);
  const cleanName = transliterated.toUpperCase().replace(/[^A-Z]/g, "");
  if (cleanName.length === 0) {
    throw new Error("Name must contain at least one alphabetic character");
  }

  const letterBreakdown = [];
  let compoundNumber = 0;

  for (const ch of cleanName) {
    const val = CHALDEAN_VALUES[ch] || 0;
    if (val > 0) {
      letterBreakdown.push({ char: ch, value: val });
      compoundNumber += val;
    }
  }

  const namank = reduceToSingleDigit(compoundNumber);
  const calculation = `${letterBreakdown.map((l) => `${l.char}(${l.value})`).join(" + ")} = ${compoundNumber} -> ${namank}`;

  return {
    namank,
    compoundNumber,
    calculation,
    letterBreakdown,
  };
}

/**
 * Calculates the Vedic 3x3 Grid (Anka Yantra / Loshu Grid) from birth date digits,
 * Driver (Mulank), and Destiny (Bhagyank).
 *
 * Grid Structure:
 * [4] [9] [2]   -> Mental Plane
 * [3] [5] [7]   -> Emotional / Spiritual Plane
 * [8] [1] [6]   -> Practical / Action Plane
 *
 * @param {string} dateStr - "YYYY-MM-DD"
 * @param {number} mulank
 * @param {number} bhagyank
 * @returns {Object} Grid frequencies and plane assessments
 */
export function calculateVedicGrid(dateStr, mulank, bhagyank) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };

  // Count raw digits from date string
  const cleanDigits = dateStr.replace(/[^0-9]/g, "");
  for (const ch of cleanDigits) {
    const num = parseInt(ch, 10);
    if (num >= 1 && num <= 9) counts[num] += 1;
  }

  // Include Mulank and Bhagyank in the Vedic Anka Chart
  if (mulank >= 1 && mulank <= 9) counts[mulank] += 1;
  if (bhagyank >= 1 && bhagyank <= 9) counts[bhagyank] += 1;

  // Horizontal Planes
  const mentalScore = (counts[4] > 0 ? 1 : 0) + (counts[9] > 0 ? 1 : 0) + (counts[2] > 0 ? 1 : 0);
  const emotionalScore = (counts[3] > 0 ? 1 : 0) + (counts[5] > 0 ? 1 : 0) + (counts[7] > 0 ? 1 : 0);
  const practicalScore = (counts[8] > 0 ? 1 : 0) + (counts[1] > 0 ? 1 : 0) + (counts[6] > 0 ? 1 : 0);

  // Vertical Planes
  const thoughtScore = (counts[4] > 0 ? 1 : 0) + (counts[3] > 0 ? 1 : 0) + (counts[8] > 0 ? 1 : 0);
  const willScore = (counts[9] > 0 ? 1 : 0) + (counts[5] > 0 ? 1 : 0) + (counts[1] > 0 ? 1 : 0);
  const actionScore = (counts[2] > 0 ? 1 : 0) + (counts[7] > 0 ? 1 : 0) + (counts[6] > 0 ? 1 : 0);

  // Diagonals
  const goldenArrowScore = (counts[4] > 0 ? 1 : 0) + (counts[5] > 0 ? 1 : 0) + (counts[6] > 0 ? 1 : 0);
  const silverArrowScore = (counts[2] > 0 ? 1 : 0) + (counts[5] > 0 ? 1 : 0) + (counts[8] > 0 ? 1 : 0);

  return {
    frequencies: counts,
    layout: [
      [
        { num: 4, count: counts[4], active: counts[4] > 0 },
        { num: 9, count: counts[9], active: counts[9] > 0 },
        { num: 2, count: counts[2], active: counts[2] > 0 },
      ],
      [
        { num: 3, count: counts[3], active: counts[3] > 0 },
        { num: 5, count: counts[5], active: counts[5] > 0 },
        { num: 7, count: counts[7], active: counts[7] > 0 },
      ],
      [
        { num: 8, count: counts[8], active: counts[8] > 0 },
        { num: 1, count: counts[1], active: counts[1] > 0 },
        { num: 6, count: counts[6], active: counts[6] > 0 },
      ],
    ],
    planes: {
      mentalPlane: { score: mentalScore, max: 3, percent: Math.round((mentalScore / 3) * 100), label: "Mental / Memory Plane (4-9-2)" },
      emotionalPlane: { score: emotionalScore, max: 3, percent: Math.round((emotionalScore / 3) * 100), label: "Emotional / Will Plane (3-5-7)" },
      practicalPlane: { score: practicalScore, max: 3, percent: Math.round((practicalScore / 3) * 100), label: "Practical / Action Plane (8-1-6)" },
      thoughtPlane: { score: thoughtScore, max: 3, percent: Math.round((thoughtScore / 3) * 100), label: "Thought Plane (4-3-8)" },
      willPlane: { score: willScore, max: 3, percent: Math.round((willScore / 3) * 100), label: "Will / Determination Plane (9-5-1)" },
      actionPlane: { score: actionScore, max: 3, percent: Math.round((actionScore / 3) * 100), label: "Execution Plane (2-7-6)" },
      goldenArrow: { active: goldenArrowScore === 3, score: goldenArrowScore, label: "Golden Rajyoga Arrow (4-5-6)" },
      silverArrow: { active: silverArrowScore === 3, score: silverArrowScore, label: "Silver Spiritual Arrow (2-5-8)" },
    },
  };
}

/**
 * Calculates relational harmony between Mulank (Psychic), Bhagyank (Destiny), and Namank (Name).
 *
 * @param {number} mulank
 * @param {number} bhagyank
 * @param {number} namank
 * @returns {Object} Mutual harmony evaluation
 */
export function calculateNumberSynergy(mulank, bhagyank, namank) {
  const driverProfile = NUMEROLOGY_PLANETARY_PROFILES[mulank] || NUMEROLOGY_PLANETARY_PROFILES[1];
  const destinyProfile = NUMEROLOGY_PLANETARY_PROFILES[bhagyank] || NUMEROLOGY_PLANETARY_PROFILES[1];

  const nameFriendlyToDriver = driverProfile.friendlyNumbers.includes(namank);
  const nameEnemyToDriver = driverProfile.enemyNumbers.includes(namank);

  const nameFriendlyToDestiny = destinyProfile.friendlyNumbers.includes(namank);
  const nameEnemyToDestiny = destinyProfile.enemyNumbers.includes(namank);

  const driverFriendlyToDestiny = driverProfile.friendlyNumbers.includes(bhagyank);
  const driverEnemyToDestiny = driverProfile.enemyNumbers.includes(bhagyank);

  let harmonyScore = 70; // Base baseline
  if (driverFriendlyToDestiny) harmonyScore += 15;
  if (driverEnemyToDestiny) harmonyScore -= 20;

  if (nameFriendlyToDriver) harmonyScore += 10;
  if (nameEnemyToDriver) harmonyScore -= 15;

  if (nameFriendlyToDestiny) harmonyScore += 10;
  if (nameEnemyToDestiny) harmonyScore -= 15;

  harmonyScore = Math.max(10, Math.min(100, harmonyScore));

  let status = "MODERATE_HARMONY";
  let statusEn = "Harmonious Vibration";
  let statusHi = "सामंजस्यपूर्ण समन्वय";

  if (harmonyScore >= 85) {
    status = "EXCELLENT_SYNERGY";
    statusEn = "Highly Auspicious Synergy";
    statusHi = "अत्यन्त शुभ एवं फलदायी संयोग";
  } else if (harmonyScore < 60) {
    status = "NEEDS_ALIGNMENT";
    statusEn = "Challenging Planetary Friction (Name Correction Advised)";
    statusHi = "ग्रह संघर्ष (नामांक परिष्कार अनुशंसित)";
  }

  return {
    score: harmonyScore,
    status,
    statusEn,
    statusHi,
    nameToDriver: nameFriendlyToDriver ? "FRIENDLY" : nameEnemyToDriver ? "ENEMY" : "NEUTRAL",
    nameToDestiny: nameFriendlyToDestiny ? "FRIENDLY" : nameEnemyToDestiny ? "ENEMY" : "NEUTRAL",
    driverToDestiny: driverFriendlyToDestiny ? "FRIENDLY" : driverEnemyToDestiny ? "ENEMY" : "NEUTRAL",
  };
}

/**
 * Master deterministic Vedic Numerology calculator.
 *
 * @param {Object} params
 * @param {string} params.name - User's full name
 * @param {string|Date} params.birthDate - Date of birth ("YYYY-MM-DD")
 * @returns {Object} Comprehensive Vedic Numerology Report
 */
export function calculateVedicNumerology({ name, birthDate }) {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new Error("Full name is required for Vedic numerology calculation");
  }

  const parsedDate = birthDate instanceof Date ? birthDate : new Date(birthDate);
  if (isNaN(parsedDate.getTime())) {
    throw new Error("Valid birth date (YYYY-MM-DD) is required for Vedic numerology calculation");
  }

  // 1. Psychic / Driver Number (Mulank)
  const day = parsedDate.getUTCDate();
  const mulankData = calculateMulank(day);

  // 2. Destiny / Life Path Number (Bhagyank)
  const bhagyankData = calculateBhagyank(parsedDate);

  // 3. Name Number (Namank)
  const namankData = calculateNamank(name);

  // 4. Planetary Profiles
  const driverProfile = NUMEROLOGY_PLANETARY_PROFILES[mulankData.mulank];
  const destinyProfile = NUMEROLOGY_PLANETARY_PROFILES[bhagyankData.bhagyank];
  const nameProfile = NUMEROLOGY_PLANETARY_PROFILES[namankData.namank];

  // 5. Vedic Anka Grid (Loshu Matrix)
  const grid = calculateVedicGrid(bhagyankData.dateStr, mulankData.mulank, bhagyankData.bhagyank);

  // 6. Tri-Number Synergy
  const synergy = calculateNumberSynergy(mulankData.mulank, bhagyankData.bhagyank, namankData.namank);

  return {
    calculatedAt: new Date().toISOString(),
    person: {
      name: name.trim(),
      birthDate: bhagyankData.dateStr,
    },
    mulank: {
      value: mulankData.mulank,
      nameEn: "Psychic / Driver Number (Mulank)",
      nameHi: "मूलांक (स्वभाव एवं आन्तरिक व्यक्तित्व)",
      calculation: mulankData.calculation,
      planet: driverProfile.graha,
      planetDevanagari: driverProfile.grahaDevanagari,
      deity: driverProfile.deity,
      element: driverProfile.element,
      nature: driverProfile.nature,
      luckyColors: driverProfile.luckyColors,
      luckyDays: driverProfile.luckyDays,
      luckyGemstone: driverProfile.luckyGemstone,
      favorableDirection: driverProfile.favorableDirection,
      beejMantra: driverProfile.beejMantra,
      friendlyNumbers: driverProfile.friendlyNumbers,
      neutralNumbers: driverProfile.neutralNumbers,
      enemyNumbers: driverProfile.enemyNumbers,
      qualities: driverProfile.qualities,
      vulnerabilities: driverProfile.vulnerabilities,
    },
    bhagyank: {
      value: bhagyankData.bhagyank,
      nameEn: "Destiny / Life Path Number (Bhagyank)",
      nameHi: "भाग्यांक (जीवन पथ एवं कर्म फल)",
      calculation: bhagyankData.calculation,
      planet: destinyProfile.graha,
      planetDevanagari: destinyProfile.grahaDevanagari,
      deity: destinyProfile.deity,
      element: destinyProfile.element,
      nature: destinyProfile.nature,
      luckyColors: destinyProfile.luckyColors,
      luckyDays: destinyProfile.luckyDays,
      luckyGemstone: destinyProfile.luckyGemstone,
      favorableDirection: destinyProfile.favorableDirection,
      beejMantra: destinyProfile.beejMantra,
      friendlyNumbers: destinyProfile.friendlyNumbers,
      neutralNumbers: destinyProfile.neutralNumbers,
      enemyNumbers: destinyProfile.enemyNumbers,
      qualities: destinyProfile.qualities,
      vulnerabilities: destinyProfile.vulnerabilities,
    },
    namank: {
      value: namankData.namank,
      compoundNumber: namankData.compoundNumber,
      nameEn: "Name Number (Namank)",
      nameHi: "नामांक (सामाजिक प्रतिष्ठा एवं ध्वनि कम्पन)",
      calculation: namankData.calculation,
      planet: nameProfile.graha,
      planetDevanagari: nameProfile.grahaDevanagari,
      deity: nameProfile.deity,
      beejMantra: nameProfile.beejMantra,
      letterBreakdown: namankData.letterBreakdown,
    },
    synergy,
    grid,
    recommendations: {
      dailyPractice: `Recite the primary Beej Mantra for Mulank (${driverProfile.beejMantra}) 108 times at sunrise on ${driverProfile.luckyDays[0]}.`,
      colorAdvisory: `Wear or keep items in ${driverProfile.luckyColors[0]} or ${driverProfile.luckyColors[1]} during vital negotiations.`,
      directionAdvisory: `Align work desk or study altar facing ${driverProfile.favorableDirection}.`,
      compatibleNumbers: driverProfile.friendlyNumbers,
      challengingNumbers: driverProfile.enemyNumbers,
    },
  };
}

export {
  calculatePythagoreanNumerology,
  calculatePythagoreanLifePath,
  calculatePythagoreanNameNumbers,
  calculatePythagoreanBirthdayNumber,
  calculatePythagoreanMaturityNumber,
  calculatePythagoreanPersonalCycles,
} from "./pythagoreanEngine.js";

export {
  calculateChaldeanNumerology,
  calculateChaldeanDayNumber,
  calculateChaldeanDestinyNumber,
  calculateChaldeanNameNumbers,
  calculateChaldeanPersonalCycles,
} from "./chaldeanEngine.js";

export { generateStructuredReport } from "./reportGenerator.js";

/**
 * Universal Master Numerology Orchestrator
 *
 * @param {Object} params
 * @param {string} params.name - Full Name
 * @param {string|Date} params.birthDate - Date of Birth (YYYY-MM-DD)
 * @param {string} [params.system="CHALDEAN"] - "CHALDEAN" | "PYTHAGOREAN" | "VEDIC"
 * @param {string} [params.language="en"] - "en" | "hi"
 * @param {string|Date} [params.targetDate] - Target calculation date
 * @returns {Object} Complete calculation + 10-section structured report
 */
export function calculateCompleteNumerology({
  name,
  birthDate,
  system = "CHALDEAN",
  language = "en",
  targetDate = new Date(),
}) {
  const normalizedSystem = ["PYTHAGOREAN", "VEDIC", "CHALDEAN"].includes(String(system).toUpperCase().trim())
    ? String(system).toUpperCase().trim()
    : "CHALDEAN";

  let rawCalculation;

  if (normalizedSystem === "PYTHAGOREAN") {
    rawCalculation = calculatePythagoreanNumerology({ name, birthDate, targetDate });
  } else if (normalizedSystem === "VEDIC") {
    rawCalculation = calculateVedicNumerology({ name, birthDate });
  } else {
    rawCalculation = calculateChaldeanNumerology({ name, birthDate, targetDate });
  }

  const structuredReport = generateStructuredReport({
    calculationResult: rawCalculation,
    system: normalizedSystem,
    language,
  });

  return {
    system: normalizedSystem,
    language,
    engineVersion: "2.0.0",
    inputs: {
      name: name.trim(),
      birthDate: typeof birthDate === "string" ? birthDate : new Date(birthDate).toISOString().split("T")[0],
      system: normalizedSystem,
      language,
      targetDate: (targetDate instanceof Date ? targetDate : new Date(targetDate)).toISOString().split("T")[0],
    },
    calculation: rawCalculation,
    report: structuredReport,
  };
}
