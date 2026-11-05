/**
 * Predictive Vedic Transit Intelligence Engine (Gochara System)
 *
 * Implements classical Gochara principles from Brihat Parashara Hora Shastra,
 * Phaladeepika (Ch. 26), and Brihat Samhita:
 * - Real-time sidereal transits relative to both Lagna and Janma Rashi (Moon)
 * - Ashtakavarga transit evaluation (Bhinnashtakavarga & Sarvashtakavarga bindu counts)
 * - Guru Gochara (Jupiter transit: houses 2, 5, 7, 9, 11 with Vedha considerations)
 * - Shani Gochara (Sade Sati 12-1-2, Kantaka Shani 4, Ashtama Shani 8, Upachaya 3-6-11)
 * - Rahu-Ketu Gochara (nodal axis transit)
 * - Dasha-Transit Synergy (how current Dasha lords perform in the transiting sky)
 */

import { computeDailyTransits, computeTransitToNatalAspects } from "./transits.js";
import { ZODIAC_SIGNS } from "./constants.js";
import { calculatePlanetaryDignity } from "./planetaryStrengths.js";

// Auspicious Houses from Moon (Janma Rashi) according to Phaladeepika Ch. 26
export const AUSPICIOUS_GOCHARA_HOUSES = {
  SUN: [3, 6, 10, 11],
  MOON: [1, 3, 6, 7, 10, 11],
  MARS: [3, 6, 11],
  MERCURY: [2, 4, 6, 8, 10, 11],
  JUPITER: [2, 5, 7, 9, 11],
  VENUS: [1, 2, 3, 4, 5, 8, 9, 11, 12],
  SATURN: [3, 6, 11],
  RAHU: [3, 6, 10, 11],
  KETU: [3, 9, 11],
};

// Vedha (Obstruction) pairs: [Auspicious House, Obstructing House] (Phaladeepika)
export const GOCHARA_VEDHA_PAIRS = {
  SUN: { 3: 9, 6: 12, 10: 4, 11: 5 },
  MOON: { 1: 5, 3: 9, 6: 12, 7: 2, 10: 4, 11: 8 },
  MARS: { 3: 12, 6: 9, 11: 5 },
  MERCURY: { 2: 5, 4: 3, 6: 9, 8: 1, 10: 7, 11: 12 },
  JUPITER: { 2: 12, 5: 4, 7: 3, 9: 10, 11: 8 },
  VENUS: { 1: 8, 2: 7, 3: 1, 4: 10, 5: 9, 8: 5, 9: 11, 11: 6, 12: 3 },
  SATURN: { 3: 12, 6: 9, 11: 5 },
};

/**
 * Evaluates comprehensive planetary transits against a user's birth chart.
 *
 * @param {Object} natalChart - Full birth chart result from calculateBirthChart
 * @param {string} [dateStr]  - "YYYY-MM-DD" local date (defaults to today)
 * @param {number} [tzOffset=5.5] - Timezone offset in hours
 * @param {string} [language="en"]
 * @returns {Object} Comprehensive transit intelligence report
 */
export function evaluatePredictiveTransits(
  natalChart,
  dateStr = new Date().toISOString().split("T")[0],
  tzOffset = 5.5,
  language = "en"
) {
  const isHi = language === "hi" || language === "hindi";

  if (!natalChart || !natalChart.planets || !natalChart.ascendant) {
    throw new Error("Valid birth chart is required to calculate predictive transit intelligence.");
  }

  // 1. Compute today's exact sidereal transits
  const dailyTransits = computeDailyTransits({ date: dateStr, tzOffset });
  const transitAspects = computeTransitToNatalAspects(dailyTransits, natalChart);

  const lagnaSignIndex = natalChart.ascendant.signIndex ?? 0;
  const moonSignIndex = natalChart.moon?.signIndex ?? 0;
  const av = natalChart.ashtakavarga || null;
  const dasha = natalChart.dasha || null;

  const transitDetails = [];

  for (const t of dailyTransits) {
    const tSignIdx = t.signIndex;
    const houseFromLagna = ((tSignIdx - lagnaSignIndex + 12) % 12) + 1;
    const houseFromMoon = ((tSignIdx - moonSignIndex + 12) % 12) + 1;

    // Dignity of transiting planet
    const dignity = calculatePlanetaryDignity(t.planet, tSignIdx, t.degree);

    // Auspiciousness from Moon (Gochara rule)
    const favorableHouses = AUSPICIOUS_GOCHARA_HOUSES[t.planet] || [];
    const isGocharaAuspicious = favorableHouses.includes(houseFromMoon);

    // Vedha (Obstruction) check
    let hasVedha = false;
    let vedhaCausingPlanet = null;
    const vedhaRules = GOCHARA_VEDHA_PAIRS[t.planet] || {};
    const obstructingHouse = vedhaRules[houseFromMoon];

    if (isGocharaAuspicious && obstructingHouse) {
      // Find if any planet (except Sun for Saturn, etc.) is in the obstructing house from Moon
      const obstructingSignIdx = (moonSignIndex + (obstructingHouse - 1)) % 12;
      const obstructingPlanet = dailyTransits.find(
        (p) => p.signIndex === obstructingSignIdx && p.planet !== "SUN" && p.planet !== t.planet
      );
      if (obstructingPlanet) {
        hasVedha = true;
        vedhaCausingPlanet = obstructingPlanet.name;
      }
    }

    // Ashtakavarga evaluation in transiting sign
    let sarvaBindus = null;
    let bhinnaBindus = null;
    let isAvFavorable = false;

    if (av) {
      if (av.sarvashtakavarga && av.sarvashtakavarga[tSignIdx]) {
        sarvaBindus = av.sarvashtakavarga[tSignIdx].bindus;
        isAvFavorable = sarvaBindus >= 28;
      }
      if (av.bhinnashtakavarga && av.bhinnashtakavarga[t.planet]) {
        bhinnaBindus = av.bhinnashtakavarga[t.planet].bindusBySign[tSignIdx];
      }
    }

    // Status label & interpretation
    let status = "NEUTRAL";
    let summaryText = "";

    if (isGocharaAuspicious && !hasVedha) {
      status = "FAVORABLE";
      summaryText = isHi
        ? `चन्द्रमा से ${houseFromMoon}वें भाव में गोचर शुभ फलदायी है।`
        : `Transit in ${houseFromMoon}th from Moon is classically favorable.`;
    } else if (hasVedha) {
      status = "VEDHA_OBSTRUCTED";
      summaryText = isHi
        ? `चन्द्रमा से ${houseFromMoon}वां भाव शुभ है, किंतु ${vedhaCausingPlanet} के वेध के कारण फल संतुलित रहेगा।`
        : `Classically favorable house obstructed by Vedha from ${vedhaCausingPlanet}.`;
    } else {
      status = "INTROSPECTIVE";
      summaryText = isHi
        ? `चन्द्रमा से ${houseFromMoon}वें भाव में गोचर संयम, धैर्य व आंतरिक साधना की अपेक्षा रखता है।`
        : `Transit in ${houseFromMoon}th calls for patience, mindfulness, and contemplation.`;
    }

    transitDetails.push({
      planet: t.planet,
      name: t.name,
      sanskritName: t.sanskritName,
      transitSign: t.sign,
      sanskritSign: t.sanskritSign,
      transitDegree: t.degree,
      retrograde: t.retrograde,
      houseFromLagna,
      houseFromMoon,
      dignity: dignity.label,
      isGocharaAuspicious,
      hasVedha,
      vedhaCausingPlanet,
      sarvaBindus,
      bhinnaBindus,
      isAvFavorable,
      status,
      summaryText,
    });
  }

  // 2. Special Jupiter Transit (Guru Gochara)
  const jupiterTransit = transitDetails.find((t) => t.planet === "JUPITER");
  let guruGochara = null;
  if (jupiterTransit) {
    const h = jupiterTransit.houseFromMoon;
    const isAuspicious = [2, 5, 7, 9, 11].includes(h);
    guruGochara = {
      houseFromMoon: h,
      sign: jupiterTransit.transitSign,
      isAuspicious,
      description: isAuspicious
        ? isHi
          ? `देवगुरु बृहस्पति जन्म चन्द्रमा से ${h}वें भाव (${jupiterTransit.transitSign}) में गोचर कर रहे हैं। यह ज्ञान, आध्यात्मिक समृद्धि, मांगलिक अवसर एवं दैवीय कृपा का काल है।`
          : `Jupiter transits the auspicious ${h}th House from natal Moon in ${jupiterTransit.transitSign}. Fosters intellectual clarity, auspicious life developments, and spiritual growth.`
        : isHi
          ? `देवगुरु बृहस्पति जन्म चन्द्रमा से ${h}वें भाव में स्थित हैं। यह काल अंतर्मुखी अध्ययन, गुरु उपासना और धैर्यपूर्वक आत्मसुधार हेतु अनुकूल है।`
          : `Jupiter occupies the ${h}th House from natal Moon. A contemplative phase favoring deep study, mentorship, and inward spiritual consolidation.`,
    };
  }

  // 3. Special Saturn Transit (Shani Gochara & Sade Sati)
  const saturnTransit = transitDetails.find((t) => t.planet === "SATURN");
  let shaniGochara = null;
  if (saturnTransit) {
    const h = saturnTransit.houseFromMoon;
    let shaniType = "REGULAR";
    let shaniTitle = "";
    let shaniDesc = "";

    if (h === 12) {
      shaniType = "SADE_SATI_1";
      shaniTitle = isHi ? "साढ़े साती — प्रथम चरण (आरोही)" : "Sade Sati — Rising Phase (12th House)";
      shaniDesc = isHi
        ? "शनि देव चन्द्रमा से 12वें भाव में गोचरस्थ हैं। यह चरण अनावश्यक व्यय पर नियंत्रण, विदेश यात्रा विचार, आत्ममंथन और वैराग्य साधना की प्रेरणा देता है।"
        : "Saturn transits the 12th house from Moon. Calls for mindful financial management, contemplation, releasing obsolete attachments, and disciplined rest.";
    } else if (h === 1) {
      shaniType = "SADE_SATI_2";
      shaniTitle = isHi ? "साढ़े साती — द्वितीय शिखर चरण (जन्म चन्द्र)" : "Sade Sati — Peak Phase (Over Natal Moon)";
      shaniDesc = isHi
        ? "शनि देव जन्म चन्द्रमा के ऊपर गोचर कर रहे हैं। यह चरण मानसिक परिपक्वता, कर्म-शोधन, नम्रता और दीर्घकालिक चरित्र निर्माण का महान अवसर है।"
        : "Saturn transits directly over the natal Moon. Cultivates psychological grit, emotional maturity, humility, and unwavering endurance.";
    } else if (h === 2) {
      shaniType = "SADE_SATI_3";
      shaniTitle = isHi ? "साढ़े साती — तृतीय ढलती अवस्था (वित्तीय चरण)" : "Sade Sati — Setting Phase (2nd House)";
      shaniDesc = isHi
        ? "शनि देव चन्द्रमा से द्वितीय भाव में गोचर कर रहे हैं। यह वाणी संयम, पारिवारिक स्थिरता, और संचित धन के सदुपयोग का समय है।"
        : "Saturn transits the 2nd house from Moon. Focus shifts to financial consolidation, mindful speech, and steady family commitments.";
    } else if (h === 4) {
      shaniType = "KANTAKA_SHANI";
      shaniTitle = isHi ? "कंटक शनि (चतुर्थ भाव गोचर)" : "Kantaka Shani (4th House from Moon)";
      shaniDesc = isHi
        ? "शनि देव चतुर्थ भाव में हैं। घरेलू शांति बनाए रखें और संपत्ति संबंधी निर्णयों में धैर्य बरतें।"
        : "Saturn transits the 4th house from Moon. Emphasizes patience in domestic affairs and steady emotional grounding.";
    } else if (h === 8) {
      shaniType = "ASHTAMA_SHANI";
      shaniTitle = isHi ? "अष्टम शनि (गूढ़ अन्वेषण चरण)" : "Ashtama Shani (8th House from Moon)";
      shaniDesc = isHi
        ? "शनि देव अष्टम भाव में गोचर कर रहे हैं। स्वास्थ्य की सजगता, आयुर्वेद, और गहन ध्यान साधना अत्यंत फलदायी हैं।"
        : "Saturn transits the 8th house from Moon. Encourages profound introspective research, preventive wellness routines, and deep meditation.";
    } else if ([3, 6, 11].includes(h)) {
      shaniType = "UPACHAYA_AUSPICIOUS";
      shaniTitle = isHi ? `शनि गोचर — परम शुभ (${h}वां उपचय भाव)` : `Auspicious Saturn Transit (${h}th Upachaya House)`;
      shaniDesc = isHi
        ? `शनि देव उपचय भाव (${h}वें) में गोचर कर रहे हैं। यह शत्रुओं पर विजय, अचल संपत्ति लाभ और कठिन परिश्रम से स्थायी सफलता का योग है।`
        : `Saturn transits an Upachaya house (${h}th). Classically auspicious for disciplined triumphs, professional progress, and tangible rewards for sustained effort.`;
    }

    shaniGochara = {
      houseFromMoon: h,
      sign: saturnTransit.transitSign,
      shaniType,
      title: shaniTitle,
      description: shaniDesc,
    };
  }

  // 4. Dasha-Transit Synergy
  let dashaSynergy = null;
  if (dasha && dasha.activeDasha) {
    const mahaLord = dasha.activeDasha.mahadasha;
    const antarLord = dasha.activeDasha.antardasha;

    const mahaTransit = transitDetails.find((t) => t.planet.toUpperCase() === mahaLord.toUpperCase());
    const antarTransit = transitDetails.find((t) => t.planet.toUpperCase() === antarLord.toUpperCase());

    if (mahaTransit) {
      const isMahaStrong = mahaTransit.isGocharaAuspicious || mahaTransit.isAvFavorable;
      dashaSynergy = {
        mahaLord,
        antarLord,
        mahaTransitSign: mahaTransit.transitSign,
        mahaHouseFromLagna: mahaTransit.houseFromLagna,
        mahaHouseFromMoon: mahaTransit.houseFromMoon,
        antarTransitSign: antarTransit?.transitSign || "—",
        synergyStatus: isMahaStrong ? "EMPOWERED" : "MODERATE",
        synergyExplanation: isHi
          ? `आपकी वर्तमान महादशा स्वामी ${mahaLord} आज गोचर में ${mahaTransit.transitSign} राशि (लग्न से भाव ${mahaTransit.houseFromLagna}, चन्द्र से भाव ${mahaTransit.houseFromMoon}) में संचरण कर रहे हैं। सर्वाष्टक बिंदु: ${mahaTransit.sarvaBindus || "—"}। ${
              isMahaStrong
                ? "गोचर स्थिति अनुकूल होने से दशा के सकारात्मक फल तीव्रता से परिलक्षित होंगे।"
                : "गोचर मध्यम होने से धैर्यपूर्वक साधना एवं विवेकपूर्ण कर्म अनुशंसित है।"
            }`
          : `Your active Mahadasha ruler ${mahaLord} currently transits ${mahaTransit.transitSign} (House ${mahaTransit.houseFromLagna} from Lagna, House ${mahaTransit.houseFromMoon} from Moon) with ${mahaTransit.sarvaBindus || "—"} Sarvashtakavarga bindus. ${
              isMahaStrong
                ? "Planetary alignment strongly supports progressive endeavors and fruitful outcomes."
                : "Encourages steady, conscious effort and contemplative sadhana to maximize planetary grace."
            }`,
      };
    }
  }

  return {
    date: dateStr,
    transitDetails,
    transitAspects,
    guruGochara,
    shaniGochara,
    dashaSynergy,
  };
}
