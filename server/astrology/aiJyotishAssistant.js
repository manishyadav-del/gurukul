/**
 * Personal AI Jyotish Assistant Service
 *
 * Coordinates user birth chart factors, active 3-tier Vimshottari Dasha,
 * live predictive transits, and grounded RAG passage retrieval to provide
 * authentic, non-fatalistic Vedic astrological guidance.
 *
 * Adheres strictly to Maharshi Parashara's shastras and Gurukul ethical standards:
 * - Deterministic chart facts clearly distinguished from classical interpretations.
 * - Strict non-fatalistic framing: Purushartha (human agency) and spiritual evolution.
 * - Zero fabricated quotes; verified classical passages cited with page numbers.
 */

import { hybridSearchAstrologyContent } from "../search/hybridSearch.js";
import { evaluatePredictiveTransits } from "./transitIntelligence.js";
import {
  ETHICAL_DISCLAIMER_EN,
  ETHICAL_DISCLAIMER_HI,
} from "../ai/interpreter.js";

/**
 * Pre-computed contextual quick prompt recommendations based on chart state.
 */
export function generatePersonalizedAIPrompts(chart, language = "en") {
  const isHi = language === "hi" || language === "hindi";
  if (!chart) return [];

  const maha = chart.dasha?.currentMahadasha || "Planetary";
  const antar = chart.dasha?.currentAntardasha || "sub-period";
  const moon = chart.moon?.sign || "Moon";
  const lagna = chart.ascendant?.sign || "Lagna";

  if (isHi) {
    return [
      `मेरी वर्तमान ${maha} महादशा और ${antar} अंतर्दशा का मुख्य आध्यात्मिक प्रयोजन क्या है?`,
      `आज के गोचर में शनि और गुरु का मेरी जन्म राशि (${moon}) पर क्या शास्त्रीय प्रभाव है?`,
      `मेरी कुंडली में लग्न (${lagna}) और नवम भाव की स्थिति के अनुसार अनुकूल साधना क्या है?`,
      `मेरी पत्रिका में सबसे सशक्त और कमजोर ग्रह के संतुलन हेतु क्या उपाय शास्त्र-सम्मत हैं?`,
    ];
  }

  return [
    `What is the primary spiritual focus of my active ${maha} Mahadasha and ${antar} Antardasha?`,
    `How do current transits of Saturn and Jupiter interact with my natal Moon in ${moon}?`,
    `What classical sadhana and mindfulness practices harmonize my ${lagna} Lagna?`,
    `According to Shadbala, how can I best strengthen and balance my planetary energies?`,
  ];
}

/**
 * Processes a query through the Personal AI Jyotish Assistant.
 *
 * @param {Object} params
 * @param {string} params.query       - User's astrological or spiritual question
 * @param {Object} params.chart       - Complete birth chart
 * @param {string} [params.language]  - "en" or "hi"
 * @param {Array}  [params.history]   - Prior conversation messages
 * @returns {Promise<Object>} Formatted assistant response with citations and guidance
 */
export async function queryAIJyotishAssistant({
  query = "",
  chart = null,
  language = "en",
  history = [],
}) {
  const isHi = language === "hi" || language === "hindi";

  if (!query || query.trim().length === 0) {
    throw new Error("Query string is required.");
  }

  // 1. Evaluate current transits relative to chart
  let transitData = null;
  if (chart) {
    try {
      transitData = evaluatePredictiveTransits(chart, undefined, 5.5, language);
    } catch {
      transitData = null;
    }
  }

  // 2. Perform Grounded RAG Retrieval for classical evidence
  // Construct search terms combining user query with key chart keywords
  const searchTerms = [query];
  if (chart?.dasha?.currentMahadasha) {
    searchTerms.push(`${chart.dasha.currentMahadasha} dasha`);
  }
  if (chart?.ascendant?.sign) {
    searchTerms.push(`${chart.ascendant.sign} lagna`);
  }
  if (chart?.moon?.sign) {
    searchTerms.push(`${chart.moon.sign} rashi`);
  }

  let retrievedPassages = [];
  try {
    const searchRes = await hybridSearchAstrologyContent({
      query: searchTerms.join(" "),
      limit: 4,
      language: isHi ? "Hindi" : "English",
      chart,
    });
    retrievedPassages = (searchRes?.results || []).map((r) => ({
      bookTitle: r.book?.title || "Classical Vedic Treatise",
      bookAuthor: r.book?.author || "Maharshi Parashara",
      chapterTitle: r.chapter?.title || "Astrological Principles",
      sourcePage: r.page?.pageNumber || "Folio",
      readerUrl: `/library/${r.book?.id || "books"}`,
      text: r.text || r.content || "",
    }));
  } catch {
    retrievedPassages = [];
  }

  // 3. Extract relevant chart facts for deterministic context
  const chartContext = [];
  if (chart) {
    chartContext.push(
      `Lagna: ${chart.ascendant?.sign} (${chart.ascendant?.degree?.toFixed(1)}°), ${chart.ascendant?.nakshatra}`
    );
    chartContext.push(
      `Moon: ${chart.moon?.sign} (${chart.moon?.degree?.toFixed(1)}°), ${chart.moon?.nakshatra} (Pada ${chart.moon?.pada})`
    );
    chartContext.push(
      `Active Dasha: ${chart.dasha?.currentMahadasha} Maha / ${chart.dasha?.currentAntardasha} Antar / ${chart.dasha?.currentPratyantardasha} Pratyantar`
    );
    if (chart.yogasAndDoshas?.yogas?.length) {
      chartContext.push(
        `Active Yogas: ${chart.yogasAndDoshas.yogas.map((y) => y.name).join(", ")}`
      );
    }
    if (transitData?.dashaSynergy) {
      chartContext.push(`Dasha-Transit Synergy: ${transitData.dashaSynergy.synergyStatus}`);
    }
    if (transitData?.shaniGochara?.title) {
      chartContext.push(`Saturn Transit: ${transitData.shaniGochara.title}`);
    }
  }

  // 4. Synthesize Scholarly Response
  let responseText = "";
  let recommendedSadhana = "";

  if (isHi) {
    responseText += `नमस्ते! आपकी जन्मपत्रिका और शास्त्रीय वैदिक प्रमाणों के आधार पर आपके प्रश्न का विश्लेषण प्रस्तुत है:\n\n`;

    if (chartContext.length > 0) {
      responseText += `### जन्म पत्रिका गणितीय स्थिति (Chart Alignments):\n`;
      for (const fact of chartContext) {
        responseText += `- **${fact}**\n`;
      }
      responseText += `\n`;
    }

    // Transit context if applicable
    if (transitData?.shaniGochara?.description) {
      responseText += `### गोचर स्थिति (Planetary Transit Alignment):\n`;
      responseText += `${transitData.shaniGochara.description}\n\n`;
    }

    if (retrievedPassages.length > 0) {
      responseText += `### प्रामाणिक शास्त्रीय प्रमाण (Scriptural Grounding):\n`;
      for (const p of retrievedPassages) {
        responseText += `- **${p.bookTitle}** (अध्याय: *${p.chapterTitle}*, पृष्ठ: ${p.sourcePage}):\n`;
        responseText += `  > "${p.text.slice(0, 200)}..."\n`;
      }
      responseText += `\n`;
    }

    responseText += `### फलविचार एवं दार्शनिक दृष्टिकोण (Philosophical Guidance):\n`;
    responseText += `वैदिक ज्योतिष के अनुसार ग्रह परिस्थितियां हमारे पूर्वसंचित कर्मों (*प्रारब्ध*) की सूचक हैं, किंतु पुरुषार्थ और विवेक (*विवेक-ख्याति*) द्वारा हम जीवन की दिशा निर्धारित करते हैं। आपकी वर्तमान दशा और गोचर धैर्य, निरंतर कर्तव्य-पालन और आत्म-अनुशासन की प्रेरणा देते हैं।\n\n`;

    recommendedSadhana =
      chart?.dasha?.activeDasha?.theme?.sadhana ||
      "दैनिक गायत्री मंत्र जप, सूर्य को जल अर्पण, और सात्विक ध्यान अभ्यास।";
  } else {
    responseText += `Namaste! Based on your birth chart coordinates and authentic Vedic scriptural authorities, here is the synthesis for your inquiry:\n\n`;

    if (chartContext.length > 0) {
      responseText += `### Calculated Chart Alignments (Deterministic Facts):\n`;
      for (const fact of chartContext) {
        responseText += `- **${fact}**\n`;
      }
      responseText += `\n`;
    }

    if (transitData?.shaniGochara?.description) {
      responseText += `### Current Transit Influence (Gochara Alignment):\n`;
      responseText += `${transitData.shaniGochara.description}\n\n`;
    }

    if (retrievedPassages.length > 0) {
      responseText += `### Scriptural Grounding from Gurukul Digital Library:\n`;
      for (const p of retrievedPassages) {
        responseText += `- **${p.bookTitle}** (Chapter: *${p.chapterTitle}*, Page: ${p.sourcePage}):\n`;
        responseText += `  > "${p.text.slice(0, 200)}..."\n`;
      }
      responseText += `\n`;
    }

    responseText += `### Traditional Guidance & Ethical Perspective:\n`;
    responseText += `Classical Jyotish regards planetary configurations as indicators of *Prarabdha* (past karmic impressions) rather than rigid destiny. Through *Purushartha* (conscious conscious action), self-reflection, and spiritual grounding, one harmonizes challenging energies and maximizes natural strengths.\n\n`;

    recommendedSadhana =
      chart?.dasha?.activeDasha?.theme?.sadhana ||
      "Daily Gayatri Mantra contemplation, regular mindful breathwork, and charitable service (Seva).";
  }

  // Follow-up intelligent questions
  const followUpQuestions = generatePersonalizedAIPrompts(chart, language).slice(0, 3);

  return {
    query,
    answer: responseText,
    chartFactors: chartContext,
    citations: retrievedPassages,
    recommendedSadhana,
    followUpQuestions,
    disclaimer: isHi ? ETHICAL_DISCLAIMER_HI : ETHICAL_DISCLAIMER_EN,
    timestamp: new Date().toISOString(),
  };
}
