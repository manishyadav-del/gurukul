/**
 * Personalized Context Retrieval & Synthesis Engine for AI Jyotish Assistant
 * 
 * Features:
 * - Intent classification (Dasha, Gochara/Transits, Natal Chart, Yogas/Doshas, Sade Sati, Panchang)
 * - Selective context retrieval (only gathers parameters relevant to the user's specific inquiry)
 * - Grounded RAG classical search generation
 * - 6-tier structured synthesis:
 *   1. Direct Answer
 *   2. Your Astrology Data (Calculated facts)
 *   3. Classical Explanation (Shastric commentary)
 *   4. Scriptural References (Verifiable citations)
 *   5. Practical Understanding (Purushartha & Sadhana)
 *   6. Ethical Disclaimer & Guardrails
 */

import { evaluatePredictiveTransits } from "./transitIntelligence.js";
import { computePanchang } from "./panchang.js";
import { comparePassageSources } from "../ai/sourceComparison.js";
import { ETHICAL_DISCLAIMER_EN, ETHICAL_DISCLAIMER_HI } from "../ai/interpreter.js";

/**
 * Classifies the primary intent of an astrological question to avoid bloated prompt dumps.
 */
export function classifyAstrologyQuery(query = "") {
  const q = query.toLowerCase();

  if (q.includes("dasha") || q.includes("mahadasha") || q.includes("antardasha") || q.includes("pratyantar") || q.includes("दशा")) {
    return "DASHA";
  }
  if (q.includes("transit") || q.includes("gochara") || q.includes("गोचर") || q.includes("sade sati") || q.includes("साढ़े साती") || q.includes("shani") || q.includes("jupiter transit")) {
    return "TRANSIT";
  }
  if (q.includes("yoga") || q.includes("dosha") || q.includes("योग") || q.includes("दोष") || q.includes("manglik") || q.includes("gajakesari") || q.includes("kaal sarp")) {
    return "YOGA_DOSHA";
  }
  if (q.includes("panchang") || q.includes("tithi") || q.includes("nakshatra") || q.includes("muhurta") || q.includes("choghadiya") || q.includes("पंचांग") || q.includes("चौघड़िया")) {
    return "PANCHANG";
  }
  if (q.includes("lagna") || q.includes("ascendant") || q.includes("rashi") || q.includes("moon sign") || q.includes("sun sign") || q.includes("लग्न") || q.includes("राशि")) {
    return "NATAL_CHART";
  }
  if (q.includes("shadbala") || q.includes("ashtakavarga") || q.includes("strength") || q.includes("बल")) {
    return "PLANETARY_STRENGTH";
  }

  return "GENERAL_JYOTISH";
}

/**
 * Extracts ONLY relevant context parameters based on classified intent.
 */
export function extractTargetedAstrologyContext({
  query,
  chart = null,
  profile = null,
  todayDateStr = new Date().toISOString().split("T")[0],
  language = "en",
}) {
  const intent = classifyAstrologyQuery(query);
  const isHi = language === "hi" || language === "hindi";

  const targetedData = {
    intent,
    summaryPills: [],
    astronomyDataText: "",
    searchTerms: [query],
  };

  if (!chart) {
    targetedData.astronomyDataText = isHi
      ? "जन्म विवरण अनुपलब्ध हैं। सामान्य ज्योतिषीय सिद्धांत प्रस्तुत किए जा रहे हैं।"
      : "No personal birth chart is loaded. Providing general classical astrological principles.";
    return targetedData;
  }

  const lagna = chart.ascendant?.sign || chart.lagnaSign || "Aries";
  const moon = chart.moon?.sign || chart.moonSign || "Aries";
  const maha = chart.dasha?.currentMahadasha || chart.currentDasha || "Sun";
  const antar = chart.dasha?.currentAntardasha || "Moon";

  switch (intent) {
    case "DASHA": {
      targetedData.summaryPills.push(`Active Mahadasha: ${maha}`, `Antardasha: ${antar}`);
      targetedData.searchTerms.push(`${maha} dasha`, `${antar} antardasha`, "Vimshottari Dasha Phala");

      const activeDasha = chart.dasha?.activeDasha || {};
      targetedData.astronomyDataText = isHi
        ? `सक्रिय महादशा: ${maha} (प्रारंभ: ${activeDasha.startDate || "N/A"}, समाप्ति: ${activeDasha.endDate || "N/A"})\nअंतर्दशा: ${antar}\nप्रत्यंतर्दशा: ${chart.dasha?.currentPratyantardasha || "N/A"}`
        : `Active Mahadasha: ${maha} (Start: ${activeDasha.startDate || "N/A"}, End: ${activeDasha.endDate || "N/A"})\nCurrent Antardasha: ${antar}\nPratyantardasha: ${chart.dasha?.currentPratyantardasha || "N/A"}`;
      break;
    }

    case "TRANSIT": {
      targetedData.summaryPills.push(`Lagna: ${lagna}`, `Moon: ${moon}`);
      targetedData.searchTerms.push("Gochara Phala", "Saturn transit", "Jupiter transit");

      let transitResult = null;
      try {
        transitResult = evaluatePredictiveTransits(chart, todayDateStr, 5.5, language);
      } catch {
        transitResult = null;
      }

      if (transitResult) {
        const shani = transitResult.shaniGochara;
        const dashaSyn = transitResult.dashaSynergy;

        targetedData.astronomyDataText = isHi
          ? `गोचर संकलन (संदर्भ: चंद्र राशि ${moon} व लग्न ${lagna}):\n` +
            `- शनि गोचर स्थिति: ${shani?.title || "शनि भ्रमण"} (चंद्र से भाव: ${shani?.houseFromMoon})\n` +
            `- दशा-गोचर समन्वय: ${dashaSyn?.synergyStatus || "संतुलित"} (${dashaSyn?.synergyExplanation || ""})`
          : `Gochara Transits (Relative to Janma Rashi ${moon} & Lagna ${lagna}):\n` +
            `- Saturn Transit: ${shani?.title || "Saturn Cycle"} (House from Moon: ${shani?.houseFromMoon})\n` +
            `- Dasha-Transit Synergy: ${dashaSyn?.synergyStatus || "Aligned"} (${dashaSyn?.synergyExplanation || ""})`;
      }
      break;
    }

    case "YOGA_DOSHA": {
      const yogas = chart.yogasAndDoshas?.yogas || [];
      const doshas = chart.yogasAndDoshas?.doshas || [];
      const topYogas = yogas.slice(0, 3).map((y) => y.name).join(", ");
      const topDoshas = doshas.slice(0, 2).map((d) => d.name).join(", ");

      targetedData.summaryPills.push(`Yogas: ${topYogas || "Standard"}`, `Doshas: ${topDoshas || "None"}`);
      targetedData.searchTerms.push(topYogas || "Raja Yoga", "classical yoga phala");

      targetedData.astronomyDataText = isHi
        ? `कुंडली में निर्मित शास्त्रीय योग: ${topYogas || "सामान्य स्थिति"}\nदोष परीक्षण: ${topDoshas || "कोई प्रमुख दोष नहीं"}`
        : `Identified Classical Yogas: ${topYogas || "Standard Placements"}\nDoshas Evaluated: ${topDoshas || "None significant"}`;
      break;
    }

    case "PANCHANG": {
      const lat = profile?.latitude || 28.6139;
      const lon = profile?.longitude || 77.209;
      const p = computePanchang({
        date: todayDateStr,
        latitude: lat,
        longitude: lon,
        tzOffset: 5.5,
        timezone: profile?.timezone || "Asia/Kolkata",
      });

      targetedData.summaryPills.push(`Tithi: ${p.tithi?.name}`, `Nakshatra: ${p.nakshatra?.name}`);
      targetedData.searchTerms.push(`${p.tithi?.name} tithi`, `${p.nakshatra?.name} nakshatra`);

      targetedData.astronomyDataText = isHi
        ? `आज का पंचांग: तिथि ${p.tithi?.name}, नक्षत्र ${p.nakshatra?.name}, वार ${p.vara?.hi}, योग ${p.yoga?.name}, करण ${p.karana?.name}`
        : `Today's Panchang: Tithi ${p.tithi?.name}, Nakshatra ${p.nakshatra?.name}, Vara ${p.vara?.en}, Yoga ${p.yoga?.name}, Karana ${p.karana?.name}`;
      break;
    }

    case "NATAL_CHART":
    default: {
      targetedData.summaryPills.push(`Lagna: ${lagna}`, `Moon: ${moon}`, `Mahadasha: ${maha}`);
      targetedData.searchTerms.push(`${lagna} lagna`, `${moon} rashi`, "Brihat Parashara Hora Shastra");

      const sun = chart.planets?.find((p) => p.planet === "SUN")?.sign || "N/A";
      targetedData.astronomyDataText = isHi
        ? `लग्न: ${lagna} (${chart.ascendant?.degree?.toFixed(1) || 0}°), चंद्र राशि: ${moon}, सूर्य राशि: ${sun}, सक्रिय दशा: ${maha}/${antar}`
        : `Ascendant (Lagna): ${lagna} (${chart.ascendant?.degree?.toFixed(1) || 0}°), Moon Sign: ${moon}, Sun Sign: ${sun}, Active Dasha: ${maha}/${antar}`;
      break;
    }
  }

  return targetedData;
}

/**
 * Synthesizes a structured 6-tier scholarly response.
 */
export function synthesizePersonalizedAnswer({
  query,
  chart,
  profile,
  passages = [],
  language = "en",
}) {
  const isHi = language === "hi" || language === "hindi";
  const context = extractTargetedAstrologyContext({ query, chart, profile, language });
  const hasPassages = Array.isArray(passages) && passages.length > 0;
  const comparison = comparePassageSources(passages);

  let directAnswer = "";
  let classicalExplanation = "";
  let practicalSadhana = "";

  if (isHi) {
    directAnswer = `आपके प्रश्न "${query}" का शास्त्रीय एवं गणितीय विश्लेषण:\n` +
      `आपकी पत्रिका के अनुसार वर्तमान में ${context.summaryPills.join(" | ")} का प्रभाव प्रभावी है।`;

    if (hasPassages) {
      classicalExplanation = `महर्षि पराशर एवं पारंपरिक आचार्यों के अनुसार यह स्थिति आंतरिक परिपक्वता, दायित्व-बोध एवं आत्म-चिंतन का संकेत देती है। शास्त्रों में इस विन्यास का उल्लेख कर्तव्यनिष्ठता और पुरुषार्थ के साथ आगे बढ़ने के रूप में किया गया है।`;
    } else {
      classicalExplanation = `गुरुकुल डिजिटल पुस्तकालय में इस विशिष्ट विषय पर पर्याप्त शास्त्रीय पांडुलिपि साक्ष्य उपलब्ध नहीं हैं। वैदिक परम्परा में अप्रामाणिक या कल्पित भविष्यवाणियों के स्थान पर शास्त्र-सम्मत साक्ष्यों को ही प्राथमिकता दी जाती है।`;
    }

    practicalSadhana = chart?.dasha?.activeDasha?.theme?.sadhana ||
      "दैनिक गायत्री मंत्र का मानसिक जप, सूर्य नमस्कार, एवं सात्विक ध्यान अभ्यास।";
  } else {
    directAnswer = `Analysis for your inquiry "${query}":\n` +
      `Your birth chart and planetary coordinates reflect active influences of ${context.summaryPills.join(" | ")}.`;

    if (hasPassages) {
      classicalExplanation = `According to classical authorities including Maharshi Parashara and Mantreswara, this configuration emphasizes disciplined effort, intellectual discernment, and alignment with Dharma. The classical treatises view planetary positions as maps of karma (Prarabdha) to be navigated with conscious wisdom (Purushartha).`;
    } else {
      classicalExplanation = `Sufficient supporting classical passages were not found in the Digital Library for this specific query. Gurukul strictly avoids invented or deterministic prognostications and prioritizes verifiable classical sources.`;
    }

    practicalSadhana = chart?.dasha?.activeDasha?.theme?.sadhana ||
      "Daily contemplation, focused breathwork (Pranayama), and selfless action (Karma Yoga).";
  }

  // Format 6 sections
  const sections = [
    {
      title: isHi ? "1. स्पष्ट उत्तर (Direct Answer)" : "1. Direct Answer",
      content: directAnswer,
    },
    {
      title: isHi ? "2. आपकी जन्मपत्रिका व खगोलीय गणना (Your Astrology Data)" : "2. Your Calculated Astrology Data",
      content: context.astronomyDataText,
    },
    {
      title: isHi ? "3. शास्त्रीय व्याख्या (Classical Scriptural Explanation)" : "3. Classical Scriptural Explanation",
      content: classicalExplanation,
    },
    {
      title: isHi ? "4. प्रामाणिक ग्रंथ संदर्भ (Scriptural References & Citations)" : "4. Scriptural References & Citations",
      citations: passages.map((p) => ({
        bookTitle: p.bookTitle,
        bookAuthor: p.bookAuthor,
        chapterTitle: p.chapterTitle,
        sourcePage: p.sourcePage,
        readerUrl: p.readerUrl,
        text: p.text?.slice(0, 250) + "...",
      })),
      sourceComparison: comparison.hasMultipleSources ? comparison : null,
    },
    {
      title: isHi ? "5. व्यावहारिक साधना व चिंतन (Practical Understanding)" : "5. Practical Understanding & Purushartha",
      content: practicalSadhana,
    },
    {
      title: isHi ? "6. मर्यादा एवं अस्वीकरण (Ethical Guardrails)" : "6. Limitations & Ethical Guardrails",
      content: isHi ? ETHICAL_DISCLAIMER_HI : ETHICAL_DISCLAIMER_EN,
    },
  ];

  // Combined formatted markdown text
  let fullText = `### ${sections[0].title}\n${sections[0].content}\n\n` +
    `### ${sections[1].title}\n${sections[1].content}\n\n` +
    `### ${sections[2].title}\n${sections[2].content}\n\n`;

  if (hasPassages) {
    fullText += `### ${sections[3].title}\n`;
    for (const p of passages) {
      fullText += `- **${p.bookTitle}** (*${p.chapterTitle}*, Page: ${p.sourcePage || "Classical Folio"}):\n  > "${p.text?.slice(0, 200)}..."\n  [Read in Library](${p.readerUrl})\n\n`;
    }
  } else {
    fullText += `### ${sections[3].title}\n*No direct classical passages found for this specific query.*\n\n`;
  }

  fullText += `### ${sections[4].title}\n${sections[4].content}\n\n` +
    `---\n*${sections[5].content}*`;

  return {
    directAnswer,
    astronomyDataText: context.astronomyDataText,
    classicalExplanation,
    fullText,
    sections,
    citations: passages,
    sourceComparison: comparison.hasMultipleSources ? comparison : null,
    summaryPills: context.summaryPills,
    hasSufficientEvidence: hasPassages,
    disclaimer: isHi ? ETHICAL_DISCLAIMER_HI : ETHICAL_DISCLAIMER_EN,
  };
}
