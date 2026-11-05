/**
 * Vedic Ashtakoota Kundli Matching & Compatibility Engine
 *
 * Implements the authoritative 36-point Guna Milan system from
 * Brihat Parashara Hora Shastra, Muhurta Chintamani, and Jataka Parijata:
 * 1. Varna (1 point) - Spiritual & ego compatibility
 * 2. Vashya (2 points) - Mutual attraction & temperament
 * 3. Tara (3 points) - Destiny, health & longevity resonance
 * 4. Yoni (4 points) - Physical, biological & psychological affinity
 * 5. Graha Maitri (5 points) - Mental harmony & intellectual friendship
 * 6. Gana (6 points) - Behavioral disposition (Deva, Manushya, Rakshasa)
 * 7. Bhakoot (7 points) - Emotional welfare, prosperity & family growth
 * 8. Nadi (8 points) - Genetic, physiological & bio-energy balance
 *
 * Includes:
 * - Classical Nadi & Bhakoot Dosha cancellation algorithms
 * - Dual-chart Manglik (Kuja Dosha) compatibility & neutralization
 * - Strict non-fatalistic relationship mindfulness & communication guidance
 */

import { ZODIAC_SIGNS, NAKSHATRAS, PLANETS } from "./constants.js";
import { NAISARGIKA_MAITRI, SIGN_LORDS } from "./planetaryStrengths.js";

// Varna mapping (Brahmin 4 > Kshatriya 3 > Vaishya 2 > Shudra 1)
export const SIGN_VARNA = {
  0: { varna: "Kshatriya", rank: 3, element: "Fire" }, // Aries
  1: { varna: "Vaishya", rank: 2, element: "Earth" }, // Taurus
  2: { varna: "Shudra", rank: 1, element: "Air" }, // Gemini
  3: { varna: "Brahmin", rank: 4, element: "Water" }, // Cancer
  4: { varna: "Kshatriya", rank: 3, element: "Fire" }, // Leo
  5: { varna: "Vaishya", rank: 2, element: "Earth" }, // Virgo
  6: { varna: "Shudra", rank: 1, element: "Air" }, // Libra
  7: { varna: "Brahmin", rank: 4, element: "Water" }, // Scorpio
  8: { varna: "Kshatriya", rank: 3, element: "Fire" }, // Sagittarius
  9: { varna: "Vaishya", rank: 2, element: "Earth" }, // Capricorn
  10: { varna: "Shudra", rank: 1, element: "Air" }, // Aquarius
  11: { varna: "Brahmin", rank: 4, element: "Water" }, // Pisces
};

// Vashya mapping
export const SIGN_VASHYA = {
  0: "Chatushpada", // Aries
  1: "Chatushpada", // Taurus
  2: "Manava", // Gemini
  3: "Jalachara", // Cancer
  4: "Vanachara", // Leo
  5: "Manava", // Virgo
  6: "Manava", // Libra
  7: "Keeta", // Scorpio
  8: "Manava", // Sagittarius (1st half)
  9: "Chatushpada", // Capricorn (1st half)
  10: "Manava", // Aquarius
  11: "Jalachara", // Pisces
};

// 14 Animal Yonis mapped to Nakshatras (0-26)
export const NAKSHATRA_YONI = [
  "Horse", // 0: Ashwini
  "Elephant", // 1: Bharani
  "Sheep", // 2: Krittika
  "Serpent", // 3: Rohini
  "Serpent", // 4: Mrigashira
  "Dog", // 5: Ardra
  "Cat", // 6: Punarvasu
  "Sheep", // 7: Pushya
  "Cat", // 8: Ashlesha
  "Rat", // 9: Magha
  "Rat", // 10: Purva Phalguni
  "Cow", // 11: Uttara Phalguni
  "Buffalo", // 12: Hasta
  "Tiger", // 13: Chitra
  "Buffalo", // 14: Swati
  "Tiger", // 15: Vishakha
  "Deer", // 16: Anuradha
  "Deer", // 17: Jyeshtha
  "Dog", // 18: Mula
  "Monkey", // 19: Purva Ashadha
  "Mongoose", // 20: Uttara Ashadha
  "Monkey", // 21: Shravana
  "Lion", // 22: Dhanishta
  "Horse", // 23: Shatabhisha
  "Lion", // 24: Purva Bhadrapada
  "Cow", // 25: Uttara Bhadrapada
  "Elephant", // 26: Revati
];

// Sworn enemies in Yoni Koota (0 points)
export const YONI_SWORN_ENEMIES = [
  ["Horse", "Buffalo"],
  ["Elephant", "Lion"],
  ["Sheep", "Monkey"],
  ["Serpent", "Mongoose"],
  ["Dog", "Deer"],
  ["Cat", "Rat"],
  ["Cow", "Tiger"],
];

// Gana mapping (Deva, Manushya, Rakshasa)
export const NAKSHATRA_GANA = [
  "Deva", // 0: Ashwini
  "Manushya", // 1: Bharani
  "Rakshasa", // 2: Krittika
  "Manushya", // 3: Rohini
  "Deva", // 4: Mrigashira
  "Manushya", // 5: Ardra
  "Deva", // 6: Punarvasu
  "Deva", // 7: Pushya
  "Rakshasa", // 8: Ashlesha
  "Rakshasa", // 9: Magha
  "Manushya", // 10: Purva Phalguni
  "Manushya", // 11: Uttara Phalguni
  "Deva", // 12: Hasta
  "Rakshasa", // 13: Chitra
  "Deva", // 14: Swati
  "Rakshasa", // 15: Vishakha
  "Deva", // 16: Anuradha
  "Rakshasa", // 17: Jyeshtha
  "Rakshasa", // 18: Mula
  "Manushya", // 19: Purva Ashadha
  "Manushya", // 20: Uttara Ashadha
  "Deva", // 21: Shravana
  "Rakshasa", // 22: Dhanishta
  "Rakshasa", // 23: Shatabhisha
  "Manushya", // 24: Purva Bhadrapada
  "Manushya", // 25: Uttara Bhadrapada
  "Deva", // 26: Revati
];

// Nadi mapping (Adi/Vata, Madhya/Pitta, Antya/Kapha)
export const NAKSHATRA_NADI = [
  "Adi", // 0: Ashwini
  "Madhya", // 1: Bharani
  "Antya", // 2: Krittika
  "Antya", // 3: Rohini
  "Madhya", // 4: Mrigashira
  "Adi", // 5: Ardra
  "Adi", // 6: Punarvasu
  "Madhya", // 7: Pushya
  "Antya", // 8: Ashlesha
  "Antya", // 9: Magha
  "Madhya", // 10: Purva Phalguni
  "Adi", // 11: Uttara Phalguni
  "Adi", // 12: Hasta
  "Madhya", // 13: Chitra
  "Antya", // 14: Swati
  "Antya", // 15: Vishakha
  "Madhya", // 16: Anuradha
  "Adi", // 17: Jyeshtha
  "Adi", // 18: Mula
  "Madhya", // 19: Purva Ashadha
  "Antya", // 20: Uttara Ashadha
  "Antya", // 21: Shravana
  "Madhya", // 22: Dhanishta
  "Adi", // 23: Shatabhisha
  "Adi", // 24: Purva Bhadrapada
  "Madhya", // 25: Uttara Bhadrapada
  "Antya", // 26: Revati
];

/**
 * Calculates 1. Varna Koota (Max 1 point)
 */
export function calculateVarna(groomSignIdx, brideSignIdx) {
  const gV = SIGN_VARNA[groomSignIdx];
  const bV = SIGN_VARNA[brideSignIdx];
  const points = gV.rank >= bV.rank ? 1 : 0;
  return {
    name: "Varna Koota",
    sanskritName: "वर्ण कूट",
    maxPoints: 1,
    obtainedPoints: points,
    groomValue: gV.varna,
    brideValue: bV.varna,
    isCompatible: points > 0,
    interpretation:
      points === 1
        ? "Harmonious ego alignment and spiritual affinity."
        : "Complementary spiritual learning; calls for mutual ego deference.",
  };
}

/**
 * Calculates 2. Vashya Koota (Max 2 points)
 */
export function calculateVashya(groomSignIdx, brideSignIdx) {
  const gV = SIGN_VASHYA[groomSignIdx];
  const bV = SIGN_VASHYA[brideSignIdx];

  let points = 0;
  if (gV === bV) {
    points = 2;
  } else if (
    (gV === "Manava" && bV === "Chatushpada") ||
    (gV === "Chatushpada" && bV === "Manava") ||
    (gV === "Jalachara" && bV === "Manava")
  ) {
    points = 1;
  } else if (gV === "Vanachara" || bV === "Vanachara") {
    points = 0;
  } else {
    points = 0.5;
  }

  return {
    name: "Vashya Koota",
    sanskritName: "वश्य कूट",
    maxPoints: 2,
    obtainedPoints: points,
    groomValue: gV,
    brideValue: bV,
    isCompatible: points >= 1,
    interpretation:
      points === 2
        ? "Natural mutual attraction, emotional alignment, and shared life pacing."
        : points >= 1
        ? "Good amicable balance with conscious respect for personal boundaries."
        : "Different temperaments; requires patient communication to avoid dominance struggles.",
  };
}

/**
 * Calculates 3. Tara Koota (Max 3 points)
 */
export function calculateTara(groomNakIdx, brideNakIdx) {
  const countGtoB = ((brideNakIdx - groomNakIdx + 27) % 9) + 1;
  const countBtoG = ((groomNakIdx - brideNakIdx + 27) % 9) + 1;

  const inauspiciousTaras = [3, 5, 7]; // Vipat, Pratyak, Naidhana
  const gToBAuspicious = !inauspiciousTaras.includes(countBtoG);
  const bToGAuspicious = !inauspiciousTaras.includes(countGtoB);

  let points = 0;
  if (gToBAuspicious && bToGAuspicious) {
    points = 3;
  } else if (gToBAuspicious || bToGAuspicious) {
    points = 1.5;
  } else {
    points = 0;
  }

  return {
    name: "Tara Koota",
    sanskritName: "तारा कूट",
    maxPoints: 3,
    obtainedPoints: points,
    groomValue: `Tara ${countBtoG}`,
    brideValue: `Tara ${countGtoB}`,
    isCompatible: points >= 1.5,
    interpretation:
      points === 3
        ? "Excellent health resonance, favorable destiny synergy, and mutual wellbeing."
        : points === 1.5
        ? "Moderate destiny support; regular mindfulness and holistic wellness recommended."
        : "Karmic adjustments; requires conscious mutual care during challenging transits.",
  };
}

/**
 * Calculates 4. Yoni Koota (Max 4 points)
 */
export function calculateYoni(groomNakIdx, brideNakIdx) {
  const gY = NAKSHATRA_YONI[groomNakIdx];
  const bY = NAKSHATRA_YONI[brideNakIdx];

  const isSwornEnemy = YONI_SWORN_ENEMIES.some(
    ([a, b]) => (a === gY && b === bY) || (a === bY && b === gY)
  );

  let points = 2; // baseline neutral
  if (gY === bY) {
    points = 4;
  } else if (isSwornEnemy) {
    points = 0;
  } else {
    points = 2;
  }

  return {
    name: "Yoni Koota",
    sanskritName: "योनि कूट",
    maxPoints: 4,
    obtainedPoints: points,
    groomValue: gY,
    brideValue: bY,
    isCompatible: points >= 2,
    interpretation:
      points === 4
        ? "Deep biological, emotional, and physical harmony; seamless instinctual bond."
        : points >= 2
        ? "Balanced physical and emotional rapport; cultivated intimacy thrives easily."
        : "Opposing instinctual natures; requires empathetic patience and transparent emotional sharing.",
  };
}

/**
 * Calculates 5. Graha Maitri Koota (Max 5 points)
 */
export function calculateGrahaMaitri(groomSignIdx, brideSignIdx) {
  const gLord = SIGN_LORDS[groomSignIdx];
  const bLord = SIGN_LORDS[brideSignIdx];

  if (gLord === bLord) {
    return {
      name: "Graha Maitri Koota",
      sanskritName: "ग्रह मैत्री कूट",
      maxPoints: 5,
      obtainedPoints: 5,
      groomValue: gLord,
      brideValue: bLord,
      isCompatible: true,
      interpretation: "Same Moon sign ruler: extraordinary intellectual friendship and mental rapport.",
    };
  }

  const gFriendships = NAISARGIKA_MAITRI[gLord] || { friends: [], neutral: [], enemies: [] };
  const bFriendships = NAISARGIKA_MAITRI[bLord] || { friends: [], neutral: [], enemies: [] };

  const gRelToB = gFriendships.friends.includes(bLord)
    ? "FRIEND"
    : gFriendships.neutral.includes(bLord)
    ? "NEUTRAL"
    : "ENEMY";

  const bRelToG = bFriendships.friends.includes(gLord)
    ? "FRIEND"
    : bFriendships.neutral.includes(gLord)
    ? "NEUTRAL"
    : "ENEMY";

  let points = 0;
  if (gRelToB === "FRIEND" && bRelToG === "FRIEND") {
    points = 5;
  } else if (
    (gRelToB === "FRIEND" && bRelToG === "NEUTRAL") ||
    (gRelToB === "NEUTRAL" && bRelToG === "FRIEND")
  ) {
    points = 4;
  } else if (gRelToB === "NEUTRAL" && bRelToG === "NEUTRAL") {
    points = 3;
  } else if (
    (gRelToB === "FRIEND" && bRelToG === "ENEMY") ||
    (gRelToB === "ENEMY" && bRelToG === "FRIEND")
  ) {
    points = 1;
  } else if (
    (gRelToB === "NEUTRAL" && bRelToG === "ENEMY") ||
    (gRelToB === "ENEMY" && bRelToG === "NEUTRAL")
  ) {
    points = 0.5;
  } else {
    points = 0;
  }

  return {
    name: "Graha Maitri Koota",
    sanskritName: "ग्रह मैत्री कूट",
    maxPoints: 5,
    obtainedPoints: points,
    groomValue: gLord,
    brideValue: bLord,
    isCompatible: points >= 3,
    interpretation:
      points >= 4
        ? "Profound mental affinity, shared philosophical outlook, and effortless intellectual rapport."
        : points >= 3
        ? "Good conversational harmony; differences can be bridged through honest communication."
        : "Distinct mental worldviews; partners should celebrate different perspectives rather than contest them.",
  };
}

/**
 * Calculates 6. Gana Koota (Max 6 points)
 */
export function calculateGana(groomNakIdx, brideNakIdx) {
  const gG = NAKSHATRA_GANA[groomNakIdx];
  const bG = NAKSHATRA_GANA[brideNakIdx];

  let points = 0;
  if (gG === bG) {
    points = 6;
  } else if (
    (gG === "Deva" && bG === "Manushya") ||
    (gG === "Manushya" && bG === "Deva")
  ) {
    points = 5;
  } else if (gG === "Deva" && bG === "Rakshasa") {
    points = 1;
  } else if (gG === "Manushya" && bG === "Rakshasa") {
    points = 0;
  } else if (gG === "Rakshasa" && bG === "Deva") {
    points = 1;
  } else {
    points = 0;
  }

  return {
    name: "Gana Koota",
    sanskritName: "गण कूट",
    maxPoints: 6,
    obtainedPoints: points,
    groomValue: gG,
    brideValue: bG,
    isCompatible: points >= 5,
    interpretation:
      points === 6
        ? "Matching behavioral temperaments; synchronized lifestyle expectations and social habits."
        : points === 5
        ? "Harmonious balance between idealistic virtue (Deva) and worldly pragmatism (Manushya)."
        : "Contrasting behavioral styles; requires intentional empathy and emotional self-regulation.",
  };
}

/**
 * Calculates 7. Bhakoot Koota (Max 7 points) with classical cancellations
 */
export function calculateBhakoot(groomSignIdx, brideSignIdx) {
  const diffFromGroom = ((brideSignIdx - groomSignIdx + 12) % 12) + 1;
  const diffFromBride = ((groomSignIdx - brideSignIdx + 12) % 12) + 1;

  // Auspicious combinations: 1/1, 1/7, 3/11, 4/10
  const isAuspicious =
    diffFromGroom === 1 ||
    diffFromGroom === 7 ||
    diffFromGroom === 3 ||
    diffFromGroom === 11 ||
    diffFromGroom === 4 ||
    diffFromGroom === 10;

  let points = isAuspicious ? 7 : 0;
  let isCancelled = false;
  let cancellationReason = "";

  // Check classical Bhakoot Dosha cancellations
  if (points === 0) {
    const gLord = SIGN_LORDS[groomSignIdx];
    const bLord = SIGN_LORDS[brideSignIdx];

    // Cancellation A: Same Sign Lord (e.g. Aries-Scorpio ruled by Mars, Taurus-Libra ruled by Venus)
    if (gLord === bLord) {
      isCancelled = true;
      points = 7;
      cancellationReason = `Cancelled: Both Moon signs are ruled by the same planet (${gLord}).`;
    } else {
      // Cancellation B: Sign Lords are mutual natural friends
      const gFriends = NAISARGIKA_MAITRI[gLord]?.friends || [];
      const bFriends = NAISARGIKA_MAITRI[bLord]?.friends || [];
      if (gFriends.includes(bLord) && bFriends.includes(gLord)) {
        isCancelled = true;
        points = 7;
        cancellationReason = `Cancelled: Both sign lords (${gLord} and ${bLord}) are mutual friends.`;
      }
    }
  }

  const doshaName =
    diffFromGroom === 6 || diffFromGroom === 8
      ? "Shadashtaka (6/8)"
      : diffFromGroom === 2 || diffFromGroom === 12
      ? "Dvidvadasha (2/12)"
      : diffFromGroom === 5 || diffFromGroom === 9
      ? "Navapanchama (5/9)"
      : "Harmonious Placement";

  return {
    name: "Bhakoot Koota",
    sanskritName: "भकूट कूट",
    maxPoints: 7,
    obtainedPoints: points,
    groomValue: `House ${diffFromBride}`,
    brideValue: `House ${diffFromGroom}`,
    doshaName,
    isCancelled,
    cancellationReason,
    isCompatible: points > 0,
    interpretation:
      points === 7
        ? isCancelled
          ? `Bhakoot Dosha (${doshaName}) is present but neutralized (${cancellationReason}). Confers family stability and joy.`
          : "Highly favorable emotional rapport, prosperity, and mutually supportive domestic growth."
        : `Presence of ${doshaName} Bhakoot placement; requires conscious financial transparency and mutual emotional understanding.`,
  };
}

/**
 * Calculates 8. Nadi Koota (Max 8 points) with classical cancellations
 */
export function calculateNadi(groomNakIdx, brideNakIdx, groomSignIdx, brideSignIdx, groomPada, bridePada) {
  const gN = NAKSHATRA_NADI[groomNakIdx];
  const bN = NAKSHATRA_NADI[brideNakIdx];

  let points = gN !== bN ? 8 : 0;
  let isCancelled = false;
  let cancellationReason = "";

  // Check classical Nadi Dosha cancellations (BPHS / Muhurta Chintamani)
  if (points === 0) {
    // Cancellation 1: Same Nakshatra but different Padas
    if (groomNakIdx === brideNakIdx && groomPada !== bridePada) {
      isCancelled = true;
      points = 8;
      cancellationReason = `Cancelled: Same Nakshatra (${NAKSHATRAS[groomNakIdx].name}) with different Padas (Groom: Pada ${groomPada}, Bride: Pada ${bridePada}).`;
    }
    // Cancellation 2: Different Nakshatra but same Moon Sign
    else if (groomNakIdx !== brideNakIdx && groomSignIdx === brideSignIdx) {
      isCancelled = true;
      points = 8;
      cancellationReason = `Cancelled: Same Rashi (${ZODIAC_SIGNS[groomSignIdx].name}) with different Nakshatras.`;
    }
    // Cancellation 3: Lords of both Moon signs are identical
    else if (SIGN_LORDS[groomSignIdx] === SIGN_LORDS[brideSignIdx]) {
      isCancelled = true;
      points = 8;
      cancellationReason = `Cancelled: Same planet (${SIGN_LORDS[groomSignIdx]}) rules both Moon signs.`;
    }
  }

  return {
    name: "Nadi Koota",
    sanskritName: "नाड़ी कूट",
    maxPoints: 8,
    obtainedPoints: points,
    groomValue: `${gN} Nadi`,
    brideValue: `${bN} Nadi`,
    isCancelled,
    cancellationReason,
    isCompatible: points > 0,
    interpretation:
      points === 8
        ? isCancelled
          ? `Nadi Dosha neutralized (${cancellationReason}). Confers vibrant bio-energy and healthy progeny.`
          : "Distinct biological energies (Nadi); promotes physical vitality, health longevity, and auspicious progeny."
        : "Same Nadi (Nadi Dosha); classical texts recommend spiritual alignment, Pranayama sadhana, and balanced lifestyle.",
  };
}

/**
 * Evaluates Manglik Dosha compatibility across both partners' charts.
 */
export function evaluateManglikCompatibility(groomChart, brideChart, language = "en") {
  const isHi = language === "hi" || language === "hindi";

  const getMarsStatus = (chart) => {
    if (!chart || !chart.planets) return { isManglik: false, house: null, isCancelled: false };
    const mars = chart.planets.find((p) => p.planet === "MARS");
    if (!mars) return { isManglik: false, house: null, isCancelled: false };

    const mangalHouses = [1, 2, 4, 7, 8, 12];
    const isPlacedInMangalHouse = mangalHouses.includes(mars.house);
    const isCancelled = mars.dignity === "EXALTED" || mars.dignity === "SWAKSHETRA";

    return {
      isManglik: isPlacedInMangalHouse && !isCancelled,
      house: mars.house,
      isCancelled,
      sign: mars.sign,
    };
  };

  const groomMars = getMarsStatus(groomChart);
  const brideMars = getMarsStatus(brideChart);

  let compatibilityStatus = "BALANCED";
  let description = "";

  if (groomMars.isManglik && brideMars.isManglik) {
    compatibilityStatus = "NEUTRALIZED";
    description = isHi
      ? "दोनों पत्रिकाओं में मंगल की स्थिति उपस्थित होने से कुज दोष का स्वतः शमन (परस्पर परिहार) हो जाता है।"
      : "Both partners have active Mars placements, mutually balancing and neutralizing Kuja Dosha.";
  } else if (!groomMars.isManglik && !brideMars.isManglik) {
    compatibilityStatus = "CLEAR";
    description = isHi
      ? "दोनों पत्रिकाओं में मांगलिक प्रभाव नहीं है। वैवाहिक ऊर्जा सहज व शांत है।"
      : "Neither partner has Kuja Dosha placement. Relationship energies are harmonious.";
  } else {
    compatibilityStatus = "SINGLE_MANGLIK";
    const manglikPartner = groomMars.isManglik ? (isHi ? "वर" : "Groom") : (isHi ? "कन्या" : "Bride");
    description = isHi
      ? `${manglikPartner} की पत्रिका में मंगल स्थिति विशेष विचार की अपेक्षा रखती है। आपसी संवाद में सौम्यता एवं धैर्य बनाए रखना शुभ फलदायी होगा।`
      : `${manglikPartner} has an active Mars placement. Classical texts recommend conscious patience and mutual understanding in joint decision-making.`;
  }

  return {
    groomMars,
    brideMars,
    compatibilityStatus,
    description,
  };
}

/**
 * Computes complete 36-point Ashtakoota compatibility between two charts.
 *
 * @param {Object} groomChart - Groom's complete birth chart
 * @param {Object} brideChart - Bride's complete birth chart
 * @param {string} [language="en"]
 * @returns {Object} Complete Guna Milan score, breakdown, and guidance
 */
export function computeAshtakootaMatching(groomChart, brideChart, language = "en") {
  const isHi = language === "hi" || language === "hindi";

  if (!groomChart?.moon || !brideChart?.moon) {
    throw new Error("Both birth charts must have valid Moon coordinates for Ashtakoota matching.");
  }

  const gSignIdx = groomChart.moon.signIndex ?? 0;
  const bSignIdx = brideChart.moon.signIndex ?? 0;

  // Find Moon Nakshatra indices (0-26)
  const gNakIdx = NAKSHATRAS.findIndex(
    (n) => n.name.toLowerCase() === (groomChart.moon.nakshatra || "").toLowerCase()
  );
  const bNakIdx = NAKSHATRAS.findIndex(
    (n) => n.name.toLowerCase() === (brideChart.moon.nakshatra || "").toLowerCase()
  );

  const safeGNakIdx = gNakIdx !== -1 ? gNakIdx : 0;
  const safeBNakIdx = bNakIdx !== -1 ? bNakIdx : 0;

  const gPada = groomChart.moon.pada || 1;
  const bPada = brideChart.moon.pada || 1;

  // Calculate 8 Kootas
  const varna = calculateVarna(gSignIdx, bSignIdx);
  const vashya = calculateVashya(gSignIdx, bSignIdx);
  const tara = calculateTara(safeGNakIdx, safeBNakIdx);
  const yoni = calculateYoni(safeGNakIdx, safeBNakIdx);
  const grahaMaitri = calculateGrahaMaitri(gSignIdx, bSignIdx);
  const gana = calculateGana(safeGNakIdx, safeBNakIdx);
  const bhakoot = calculateBhakoot(gSignIdx, bSignIdx);
  const nadi = calculateNadi(safeGNakIdx, safeBNakIdx, gSignIdx, bSignIdx, gPada, bPada);

  const kootas = [varna, vashya, tara, yoni, grahaMaitri, gana, bhakoot, nadi];
  const totalScore = kootas.reduce((acc, k) => acc + k.obtainedPoints, 0);
  const maxScore = 36;
  const scorePercentage = Math.round((totalScore / maxScore) * 100);

  // Classification & Category
  let classification = "EXCELLENT";
  let verdictText = "";

  if (totalScore >= 28) {
    classification = "UTKRISHTA";
    verdictText = isHi
      ? "उत्कृष्ट मिलान (28–36 गुण): दोनों कुंडलियों में अत्यंत शुभ सामंजस्य है। जीवनसाथी के रूप में आध्यात्मिक, मानसिक एवं लौकिक प्रगति सहज रहेगी।"
      : "Outstanding Compatibility (28–36 points): Exceptional alignment across emotional, mental, and physical dimensions.";
  } else if (totalScore >= 18) {
    classification = "MADHYAMA";
    verdictText = isHi
      ? "मध्यम शुभ मिलान (18–27 गुण): विवाह एवं दीर्घकालिक साझेदारी हेतु अनुकूल है। परस्पर समझदारी और संवाद से संबंध समृद्ध होगा।"
      : "Favorable Compatibility (18–27 points): Healthy and supportive foundation for enduring mutual growth and partnership.";
  } else {
    classification = "HEENA";
    verdictText = isHi
      ? "साधारण मिलान (18 से कम गुण): दोनों में भिन्न स्वभाव और दृष्टिकोण हैं। संबंध को सुदृढ़ रखने हेतु परिपक्व संवाद और सचेत समर्पण आवश्यक है।"
      : "Moderate / Challenging Alignment (< 18 points): Reflects different life pacing and values; calls for conscious emotional empathy and mutual adaptation.";
  }

  // Manglik compatibility
  const manglik = evaluateManglikCompatibility(groomChart, brideChart, language);

  return {
    groom: {
      name: groomChart.profile?.name || "Groom",
      moonSign: groomChart.moon.sign,
      nakshatra: groomChart.moon.nakshatra,
      pada: gPada,
    },
    bride: {
      name: brideChart.profile?.name || "Bride",
      moonSign: brideChart.moon.sign,
      nakshatra: brideChart.moon.nakshatra,
      pada: bPada,
    },
    totalScore,
    maxScore,
    scorePercentage,
    classification,
    verdictText,
    kootas,
    manglik,
    mindfulnessGuidance: isHi
      ? "वैदिक ज्योतिष में गुण मिलान किसी भी संबंध का अंत नहीं, अपितु दोनों व्यक्तियों के मनोवैज्ञानिक, भावनात्मक और शारीरिक स्वभाव को समझने का दर्पण है। परस्पर सम्मान, खुला संवाद और प्रेम किसी भी तकनीकी बिंदु से परे हैं।"
      : "Vedic Ashtakoota compatibility is not an irrevocable verdict, but a diagnostic mirror for understanding mutual communication styles, stress responses, and emotional temperaments. Mutual respect, genuine empathy, and shared values remain paramount.",
  };
}
