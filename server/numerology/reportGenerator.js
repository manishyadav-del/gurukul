/**
 * Gurukul Comprehensive Numerology Report Generator
 *
 * Constructs a 10-section structured personalized report based on verified calculation outputs
 * and canonical interpretive datasets.
 *
 * Supports:
 * - Systems: "PYTHAGOREAN", "CHALDEAN", "VEDIC"
 * - Languages: "en" (English) and "hi" (Hindi)
 *
 * Zero mock data — 100% derived from deterministic calculations.
 */

import {
  NUMEROLOGY_ARCHETYPES,
  PERSONAL_YEAR_THEMES,
  CHALDEAN_COMPOUND_MEANINGS,
} from "./constants.js";
import { NUMEROLOGY_PLANETARY_PROFILES } from "./numerologyEngine.js";

/**
 * Builds the 12-month personal month sequence for a given personal year.
 *
 * @param {number} personalYear
 * @param {number} targetYear
 * @param {boolean} isHi
 * @returns {Array<Object>}
 */
export function generate12MonthGuidance(personalYear, targetYear, isHi) {
  const monthNamesEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const monthNamesHi = [
    "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
    "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर",
  ];

  const months = [];
  for (let m = 1; m <= 12; m++) {
    // Month reduction (1-9)
    let mRed = m > 9 ? (m % 10) + Math.floor(m / 10) : m;
    let pm = personalYear + mRed;
    while (pm > 9) {
      pm = String(pm).split("").map(Number).reduce((a, b) => a + b, 0);
    }

    const theme = PERSONAL_YEAR_THEMES[pm] || PERSONAL_YEAR_THEMES[1];
    months.push({
      monthIndex: m,
      monthName: isHi ? monthNamesHi[m - 1] : monthNamesEn[m - 1],
      personalMonthNumber: pm,
      themeTitle: isHi ? theme.titleHi : theme.titleEn,
      guidance: isHi ? theme.themeHi : theme.themeEn,
    });
  }

  return months;
}

/**
 * Generates a complete 10-section structured personalized report.
 *
 * @param {Object} params
 * @param {Object} params.calculationResult - Result from pythagorean, chaldean, or vedic engine
 * @param {string} [params.system="CHALDEAN"] - "CHALDEAN" | "PYTHAGOREAN" | "VEDIC"
 * @param {string} [params.language="en"] - "en" | "hi"
 * @returns {Object} Structured report
 */
export function generateStructuredReport({ calculationResult, system = "CHALDEAN", language = "en" }) {
  const isHi = language === "hi" || language === "hindi";

  if (!calculationResult || !calculationResult.coreNumbers) {
    throw new Error("Valid calculation result is required to generate report.");
  }

  const inputs = calculationResult.inputs || calculationResult.person || {};
  const core = calculationResult.coreNumbers;
  const targetYear = calculationResult.cycles?.personalYear?.targetYear || new Date().getFullYear();

  // Extract primary life path / destiny number and primary name number
  let primaryLifePath = 1;
  let primaryExpression = 1;
  let primarySoulUrge = 1;
  let primaryPersonality = 1;

  if (system === "PYTHAGOREAN") {
    primaryLifePath = core.lifePath.value;
    primaryExpression = core.expression.value;
    primarySoulUrge = core.soulUrge.value;
    primaryPersonality = core.personality.value;
  } else if (system === "CHALDEAN") {
    primaryLifePath = core.destinyNumber.value;
    primaryExpression = core.nameNumber.singleDigit;
    primarySoulUrge = core.soulUrge.singleDigit;
    primaryPersonality = core.personality.singleDigit;
  } else {
    // VEDIC
    primaryLifePath = calculationResult.bhagyank?.value || 1;
    primaryExpression = calculationResult.namank?.value || 1;
    primarySoulUrge = calculationResult.mulank?.value || 1;
    primaryPersonality = calculationResult.namank?.value || 1;
  }

  // Archetypes
  const lifePathArchetype = NUMEROLOGY_ARCHETYPES[primaryLifePath] || NUMEROLOGY_ARCHETYPES[1];
  const expressionArchetype = NUMEROLOGY_ARCHETYPES[primaryExpression] || NUMEROLOGY_ARCHETYPES[1];
  const soulUrgeArchetype = NUMEROLOGY_ARCHETYPES[primarySoulUrge] || NUMEROLOGY_ARCHETYPES[1];
  const personalityArchetype = NUMEROLOGY_ARCHETYPES[primaryPersonality] || NUMEROLOGY_ARCHETYPES[1];

  // Vedic/Planetary profile for planetary correspondences & gems/mantras
  const rootNumberForPlanet = typeof primaryLifePath === "number" && primaryLifePath <= 9
    ? primaryLifePath
    : typeof primaryExpression === "number" && primaryExpression <= 9
    ? primaryExpression
    : 1;
  const planetaryProfile = NUMEROLOGY_PLANETARY_PROFILES[rootNumberForPlanet] || NUMEROLOGY_PLANETARY_PROFILES[1];

  // Personal Year Cycle
  const personalYearNum = calculationResult.cycles?.personalYear?.value || 1;
  const personalYearTheme = PERSONAL_YEAR_THEMES[personalYearNum] || PERSONAL_YEAR_THEMES[1];
  const monthlyGuidance = generate12MonthGuidance(personalYearNum, targetYear, isHi);

  // 1. Personal Numerology Overview
  const overview = {
    title: isHi ? "व्यक्तिगत अंकज्योतिष सार" : "Personal Numerology Overview",
    system,
    systemName: system === "PYTHAGOREAN"
      ? (isHi ? "पाइथागोरस अंक प्रणाली (पाश्चात्य गूढ़ परंपरा)" : "Pythagorean Numerology (Western Tradition)")
      : system === "CHALDEAN"
      ? (isHi ? "खाल्डियन अंक प्रणाली (प्राचीन बाबिलोनियन परंपरा)" : "Chaldean Numerology (Babylonian Tradition)")
      : (isHi ? "वैदिक अंक शास्त्र (सांख्य शास्त्र परंपरा)" : "Vedic Numerology (Sankhya Shastra)"),
    personName: inputs.name,
    birthDate: inputs.birthDate,
    primaryArchetype: isHi ? lifePathArchetype.titleHi : lifePathArchetype.titleEn,
    rulerPlanet: planetaryProfile.graha,
    rulerPlanetDevanagari: planetaryProfile.grahaDevanagari,
    coreVibrationSummary: isHi
      ? `आपका प्राथमिक जीवन पथ अंक ${primaryLifePath} (${lifePathArchetype.titleHi}) है, जो ${planetaryProfile.grahaDevanagari} ग्रह द्वारा शासित है। आपकी अभिव्यक्ति का मुख्य अंक ${primaryExpression} (${expressionArchetype.titleHi}) है।`
      : `Your primary Life Path vibration is ${primaryLifePath} (${lifePathArchetype.titleEn}), governed by ${planetaryProfile.graha}. Your outer Expression vibration is ${primaryExpression} (${expressionArchetype.titleEn}).`,
  };

  // 2. Core Numbers
  const coreNumbersSection = {
    title: isHi ? "प्रमुख आधारभूत अंक" : "Core Numerological Matrix",
    numbers: [
      {
        key: "lifePath",
        name: isHi ? "जीवन पथ अंक (Life Path / भाग्यांक)" : "Life Path / Destiny Number",
        value: primaryLifePath,
        formula: calculationResult.coreNumbers?.lifePath?.formula || calculationResult.coreNumbers?.destinyNumber?.formula || "DOB Reduction",
        intermediate: calculationResult.coreNumbers?.lifePath?.intermediateSteps || calculationResult.coreNumbers?.destinyNumber?.intermediateSteps || [],
        description: isHi ? lifePathArchetype.lifePathHi : lifePathArchetype.lifePathEn,
        rulingPlanet: planetaryProfile.graha,
      },
      {
        key: "expression",
        name: isHi ? "अभिव्यक्ति अंक (Expression / नामांक)" : "Expression / Name Number",
        value: primaryExpression,
        compoundNumber: calculationResult.coreNumbers?.nameNumber?.compoundNumber || calculationResult.coreNumbers?.expression?.totalSum || null,
        compoundMeaning: calculationResult.coreNumbers?.nameNumber?.compoundMeaning || null,
        formula: calculationResult.coreNumbers?.expression?.formula || calculationResult.coreNumbers?.nameNumber?.formula || "Full Name Letters Sum",
        intermediate: calculationResult.coreNumbers?.expression?.intermediateSteps || calculationResult.coreNumbers?.nameNumber?.intermediateSteps || [],
        description: isHi ? expressionArchetype.expressionHi : expressionArchetype.expressionEn,
      },
      {
        key: "soulUrge",
        name: isHi ? "आत्म अभिलाषा अंक (Soul Urge / Heart's Desire)" : "Soul Urge / Heart's Desire",
        value: primarySoulUrge,
        compoundNumber: calculationResult.coreNumbers?.soulUrge?.compoundNumber || null,
        compoundMeaning: calculationResult.coreNumbers?.soulUrge?.compoundMeaning || null,
        formula: calculationResult.coreNumbers?.soulUrge?.formula || "Vowels Sum",
        intermediate: calculationResult.coreNumbers?.soulUrge?.intermediateSteps || [],
        description: isHi ? soulUrgeArchetype.soulUrgeHi : soulUrgeArchetype.soulUrgeEn,
      },
      {
        key: "personality",
        name: isHi ? "व्यक्तित्व अंक (Personality Number)" : "Personality Number",
        value: primaryPersonality,
        compoundNumber: calculationResult.coreNumbers?.personality?.compoundNumber || null,
        compoundMeaning: calculationResult.coreNumbers?.personality?.compoundMeaning || null,
        formula: calculationResult.coreNumbers?.personality?.formula || "Consonants Sum",
        intermediate: calculationResult.coreNumbers?.personality?.intermediateSteps || [],
        description: isHi ? personalityArchetype.personalityHi : personalityArchetype.personalityEn,
      },
    ],
  };

  if (calculationResult.coreNumbers?.birthday) {
    const bday = calculationResult.coreNumbers.birthday;
    coreNumbersSection.numbers.push({
      key: "birthday",
      name: isHi ? "जन्म दिवस अंक (Birthday Number)" : "Birthday Number",
      value: bday.value,
      formula: bday.formula,
      intermediate: [bday.calculation],
      description: isHi
        ? `जन्म दिवस अंक ${bday.value} जातक की जन्मजात विशिष्ट प्रतिभा एवं तुरंत उपयोग में आने वाले सामर्थ्य को दर्शाता है।`
        : `Birthday number ${bday.value} reveals innate sub-talents, special skills, and immediate instincts available from birth.`,
    });
  }

  if (calculationResult.coreNumbers?.maturity) {
    const mat = calculationResult.coreNumbers.maturity;
    const matArchetype = NUMEROLOGY_ARCHETYPES[mat.value] || NUMEROLOGY_ARCHETYPES[1];
    coreNumbersSection.numbers.push({
      key: "maturity",
      name: isHi ? "परिपक्वता अंक (Maturity Number)" : "Maturity Number",
      value: mat.value,
      formula: mat.formula,
      intermediate: mat.intermediateSteps,
      description: isHi ? matArchetype.lifePathHi : matArchetype.lifePathEn,
    });
  }

  // 3. Name Analysis
  const analytics = calculationResult.nameAnalytics || {};
  const nameAnalysis = {
    title: isHi ? "नाम ध्वनि विश्लेषण" : "In-Depth Name Vibration Analysis",
    totalLetters: analytics.totalLetters || 0,
    vowelCount: analytics.vowelCount || 0,
    consonantCount: analytics.consonantCount || 0,
    frequencies: analytics.frequencies || {},
    missingNumbers: analytics.missingNumbers || [],
    dominantNumber: analytics.dominantNumber || null,
    dominantCount: analytics.dominantCount || 0,
    summary: isHi
      ? `नाम में कुल ${analytics.totalLetters || 0} अक्षर हैं (${analytics.vowelCount || 0} स्वर, ${analytics.consonantCount || 0} व्यंजन)। ${
          analytics.missingNumbers?.length > 0
            ? `अंक ${analytics.missingNumbers.join(", ")} नाम में अनुपस्थित हैं (कार्मिक पाठ)।`
            : "नाम में सभी मूल अंक संतुलित रूप से उपस्थित हैं।"
        }`
      : `The name comprises ${analytics.totalLetters || 0} letters (${analytics.vowelCount || 0} vowels, ${analytics.consonantCount || 0} consonants). ${
          analytics.missingNumbers?.length > 0
            ? `Karmic lessons: Numbers ${analytics.missingNumbers.join(", ")} are absent from the name vibration.`
            : "The name possesses a harmoniously distributed spectrum across foundational numbers."
        }`,
  };

  // 4. Personality Interpretation
  const personality = {
    title: isHi ? "व्यक्तित्व एवं मनोवैज्ञानिक स्वरूप" : "Personality & Behavioral Dynamics",
    archetypeTitle: isHi ? lifePathArchetype.titleHi : lifePathArchetype.titleEn,
    coreKeywords: isHi ? lifePathArchetype.keywordsHi : lifePathArchetype.keywordsEn,
    detailedAnalysis: isHi
      ? `${lifePathArchetype.expressionHi} बाह्य जगत में आपका आचरण ${personalityArchetype.personalityHi}`
      : `${lifePathArchetype.expressionEn} In public engagements, ${personalityArchetype.personalityEn}`,
  };

  // 5. Strengths and Challenges
  const strengthsAndChallenges = {
    title: isHi ? "सामर्थ्य एवं विकास की चुनौतियाँ" : "Gifts, Strengths & Shadow Edges",
    strengths: isHi ? lifePathArchetype.strengthsHi : lifePathArchetype.strengthsEn,
    challenges: isHi ? lifePathArchetype.challengesHi : lifePathArchetype.challengesEn,
  };

  // 6. Personal Year Cycle
  const personalYearCycle = {
    title: isHi ? "व्यक्तिगत वर्ष चक्र" : "Personal Year Cycle & Universal Currents",
    year: targetYear,
    personalYearNumber: personalYearNum,
    cycleTitle: isHi ? personalYearTheme.titleHi : personalYearTheme.titleEn,
    cycleTheme: isHi ? personalYearTheme.themeHi : personalYearTheme.themeEn,
  };

  // 7. Monthly Guidance
  const monthlyGuidanceSection = {
    title: isHi ? "12-मासिक मार्गदर्शन कैलेंडर" : "12-Month Vibrational Roadmap",
    months: monthlyGuidance,
  };

  // 8. Relationship Compatibility
  const compatibility = {
    title: isHi ? "संबंध एवं अंक सामंजस्य" : "Relationship & Interpersonal Compatibility",
    naturalHarmonies: planetaryProfile.friendlyNumbers,
    neutralVibrations: planetaryProfile.neutralNumbers,
    challengingVibrations: planetaryProfile.enemyNumbers,
    advice: isHi
      ? `अंक ${planetaryProfile.friendlyNumbers.join(", ")} आपके साथ स्वाभाविक रूप से सामंजस्यपूर्ण हैं। अंक ${planetaryProfile.enemyNumbers.join(", ")} के साथ साझेदारी में स्पष्ट संवाद और धैर्य की आवश्यकता होती है।`
      : `Numbers ${planetaryProfile.friendlyNumbers.join(", ")} resonate in natural harmony with your core frequency. Working with numbers ${planetaryProfile.enemyNumbers.join(", ")} requires conscious patience and clear contractual clarity.`,
  };

  // 9. Career & Life Purpose
  const career = {
    title: isHi ? "आजीविका एवं कर्म पथ" : "Career Trajectory & Vocational Fulfillment",
    recommendedFields: isHi ? lifePathArchetype.careerHi : lifePathArchetype.careerEn,
    leadershipStyle: isHi
      ? `अंक ${primaryLifePath} का नेतृत्व मुख्य रूप से ${lifePathArchetype.keywordsHi.slice(0, 3).join(", ")} पर आधारित होता है।`
      : `Number ${primaryLifePath} leads predominantly through ${lifePathArchetype.keywordsEn.slice(0, 3).join(", ")}.`,
  };

  // 10. Summary and Recommendations
  const summaryAndRecommendations = {
    title: isHi ? "निष्कर्ष एवं दैनिक आध्यात्मिक परामर्श" : "Summary & Actionable Guidance",
    luckyColors: planetaryProfile.luckyColors,
    luckyDays: planetaryProfile.luckyDays,
    luckyGemstone: planetaryProfile.luckyGemstone,
    favorableDirection: planetaryProfile.favorableDirection,
    dailyPractice: isHi
      ? `प्रतिदिन प्रातः ${planetaryProfile.luckyDays[0]} के दिन विशेष रूप से एकाग्रचित्त होकर ${planetaryProfile.beejMantra} का जप करें।`
      : `Incorporate contemplative mindfulness and recite the primary mantra (${planetaryProfile.beejMantra}) especially on ${planetaryProfile.luckyDays[0]}.`,
    traditionalDisclaimer: isHi
      ? "वैदिक एवं पाश्चात्य अंकशास्त्र सांकेतिक एवं आध्यात्मिक प्रवृत्तियों का दिग्दर्शन कराते हैं, यह अनिवार्य भाग्य नहीं है। व्यक्ति का सत्कर्म एवं विवेक सर्वोपरि है।"
      : "Numerological traditions offer symbolic and archetypal self-reflection. Free will, conscious ethics, and diligent action remain supreme.",
  };

  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      system,
      language,
      engineVersion: calculationResult.engineVersion || "2.0.0",
      targetYear,
    },
    sections: {
      overview,
      coreNumbers: coreNumbersSection,
      nameAnalysis,
      personality,
      strengthsAndChallenges,
      personalYearCycle,
      monthlyGuidance: monthlyGuidanceSection,
      compatibility,
      career,
      summaryAndRecommendations,
    },
  };
}
