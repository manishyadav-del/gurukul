/**
 * Daily Astrology AI Interpretation Service
 *
 * Receives pre-computed Panchang + transit data and produces structured,
 * bilingual (Hindi/English) astrological guidance.
 *
 * IMPORTANT: The AI model is given ONLY verified calculation results.
 * It NEVER calculates planetary positions, Tithi, Nakshatra, or times itself.
 */

const API_KEY = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildDailyPrompt({ panchang, transits, natalAspects, dasha, language, isPersonalized }) {
  const isHindi = language === "hi";

  const moonInfo = `Moon in ${panchang.moonSign.name} (${panchang.moonSign.sanskritName}), Nakshatra: ${panchang.nakshatra.name} (${panchang.nakshatra.devanagari}), Pada ${panchang.nakshatra.pada}`;
  const transitSummary = transits.slice(0, 9).map((p) =>
    `${p.name}: ${p.sign}${p.retrograde ? " (R)" : ""}, Nakshatra ${p.nakshatra}`
  ).join("; ");

  const aspectSummary = natalAspects && natalAspects.length > 0
    ? natalAspects.slice(0, 10).map((a) => a.description).join("; ")
    : "No natal chart available — general interpretation only.";

  const dashaInfo = dasha
    ? `Current Mahadasha: ${dasha.currentMahadasha || "Unknown"}. Current Antardasha: ${dasha.currentAntardasha || "Unknown"}.`
    : "Dasha: Not available.";

  const panchangSummary = [
    `Date: ${panchang.date}`,
    `Vara (Weekday): ${panchang.vara.en} (${panchang.vara.hi})`,
    `Tithi: ${panchang.tithi.paksha} Paksha ${panchang.tithi.name} (${panchang.tithi.devanagari})`,
    `Nakshatra: ${panchang.nakshatra.name} (${panchang.nakshatra.devanagari}) Pada ${panchang.nakshatra.pada}`,
    `Yoga: ${panchang.yoga.name} (${panchang.yoga.devanagari})`,
    `Karana: ${panchang.karana.name} (${panchang.karana.devanagari})`,
    moonInfo,
  ].join("\n");

  return `You are a learned Vedic astrology guide for Gurukul, a traditional knowledge platform. 
You communicate with warmth, respect, and intellectual honesty. 
You NEVER invent facts, Sanskrit verses, or astronomical data. 
You ONLY interpret the verified calculation data provided below.
You NEVER guarantee outcomes or make alarming predictions.

TODAY'S VERIFIED PANCHANG DATA (calculated astronomically, Lahiri Ayanamsha):
${panchangSummary}

PLANETARY TRANSITS TODAY (sidereal positions, Lahiri Ayanamsha):
${transitSummary}

${isPersonalized ? `NATAL CHART TRANSIT ASPECTS:\n${aspectSummary}` : "INTERPRETATION: General — no personal birth chart available."}

${dashaInfo}

LANGUAGE: ${isHindi ? "Respond in Hindi (Devanagari script) for all hindi fields, English for all english fields" : "Respond in English"}

TASK: Return a JSON object with EXACTLY this structure (no markdown, raw JSON):
{
  "dailySummary": {
    "en": "2-3 sentence general overview of today's astrological atmosphere",
    "hi": "2-3 वाक्य में आज के ज्योतिषीय वातावरण का सारांश"
  },
  "overallTheme": {
    "en": "One phrase describing today's overall theme",
    "hi": "आज के दिन की मुख्य भावना — एक वाक्य"
  },
  "cards": [
    {
      "category": "work",
      "titleEn": "Work & Career",
      "titleHi": "कार्य और करियर",
      "interpretationEn": "1-2 sentences about work/career today",
      "interpretationHi": "कार्य और करियर के बारे में 1-2 वाक्य",
      "recommendationEn": "One practical suggestion",
      "recommendationHi": "एक व्यावहारिक सुझाव"
    },
    {
      "category": "learning",
      "titleEn": "Learning & Productivity",
      "titleHi": "अध्ययन और उत्पादकता",
      "interpretationEn": "...",
      "interpretationHi": "...",
      "recommendationEn": "...",
      "recommendationHi": "..."
    },
    {
      "category": "relationships",
      "titleEn": "Relationships & Communication",
      "titleHi": "संबंध और संवाद",
      "interpretationEn": "...",
      "interpretationHi": "...",
      "recommendationEn": "...",
      "recommendationHi": "..."
    },
    {
      "category": "finances",
      "titleEn": "Money & Financial Discipline",
      "titleHi": "धन और वित्तीय अनुशासन",
      "interpretationEn": "...",
      "interpretationHi": "...",
      "recommendationEn": "...",
      "recommendationHi": "..."
    },
    {
      "category": "health",
      "titleEn": "Energy & Wellbeing",
      "titleHi": "ऊर्जा और स्वास्थ्य",
      "interpretationEn": "...",
      "interpretationHi": "...",
      "recommendationEn": "...",
      "recommendationHi": "..."
    },
    {
      "category": "spiritual",
      "titleEn": "Spiritual Practice",
      "titleHi": "आध्यात्मिक अभ्यास",
      "interpretationEn": "...",
      "interpretationHi": "...",
      "recommendationEn": "...",
      "recommendationHi": "..."
    }
  ],
  "whatToDo": [
    { "en": "Practical suggestion based on today's astrological factors", "hi": "हिंदी सुझाव", "reason": "Brief astrological reason" }
  ],
  "whatToAvoid": [
    { "en": "Gentle, non-alarmist guidance", "hi": "हिंदी में सौम्य मार्गदर्शन", "reason": "Brief astrological reason" }
  ],
  "spiritualPractice": {
    "theme": {
      "en": "Today's spiritual theme based on Nakshatra/Yoga",
      "hi": "आज का आध्यात्मिक विषय"
    },
    "suggestion": {
      "en": "A general reflection or practice suggestion (do not invent mantras or Sanskrit verses)",
      "hi": "एक सामान्य ध्यान या अभ्यास सुझाव"
    }
  },
  "isPersonalized": ${isPersonalized},
  "disclaimer": {
    "en": "This interpretation is based on traditional Vedic astrology. It is offered as a reflective guide, not as a guarantee or prediction of specific outcomes.",
    "hi": "यह व्याख्या पारंपरिक वैदिक ज्योतिष पर आधारित है। इसे एक चिंतनशील मार्गदर्शन के रूप में प्रस्तुत किया गया है, न कि किसी विशिष्ट परिणाम की गारंटी के रूप में।"
  }
}

RULES:
- Do NOT invent Sanskrit verses or mantras. Use general reflection only.  
- Do NOT claim certainty about outcomes.
- Do NOT mention specific diseases, accidents, financial losses, or relationship failures.
- Keep whatToDo and whatToAvoid lists to 3-5 items each.
- ALL interpretation must be grounded in the Panchang and transit data provided above.
- Return ONLY the raw JSON object — no markdown, no explanation text.`;
}

// ---------------------------------------------------------------------------
// AI Interpretation
// ---------------------------------------------------------------------------

/**
 * Generates a structured daily astrological interpretation using verified Panchang + transit data.
 *
 * @param {Object} params
 * @param {Object} params.panchang       - Output of computePanchang
 * @param {Array}  params.transits       - Output of computeDailyTransits
 * @param {Array}  params.natalAspects   - Output of computeTransitToNatalAspects (may be [])
 * @param {Object} [params.dasha]        - Active dasha info from natal chart (optional)
 * @param {string} [params.language]     - "hi" or "en"
 * @param {boolean} [params.isPersonalized] - Whether natal chart is available
 * @returns {Promise<Object>} Structured interpretation
 */
export async function generateDailyInterpretation({
  panchang,
  transits,
  natalAspects = [],
  dasha = null,
  language = "hi",
  isPersonalized = false,
}) {
  const prompt = buildDailyPrompt({ panchang, transits, natalAspects, dasha, language, isPersonalized });

  // 1. Try Gemini REST API if key exists
  if (API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2500,
            responseMimeType: "application/json",
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim()) {
          const clean = text.trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
          const parsed = JSON.parse(clean);
          return { ...parsed, _source: "gemini" };
        }
      }
    } catch (err) {
      console.warn("[Daily AI] Gemini API error, falling back:", err.message);
    }
  }

  // 2. Try OpenAI REST API if key exists
  if (OPENAI_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.3,
          max_tokens: 2500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data?.choices?.[0]?.message?.content;
        if (text && text.trim()) {
          const parsed = JSON.parse(text.trim());
          return { ...parsed, _source: "openai" };
        }
      }
    } catch (err) {
      console.warn("[Daily AI] OpenAI API error, falling back:", err.message);
    }
  }

  // 3. Robust deterministic offline fallback
  return getFallbackInterpretation(panchang, isPersonalized);
}

// ---------------------------------------------------------------------------
// Fallback (when AI is unavailable)
// ---------------------------------------------------------------------------

/**
 * Returns a minimal deterministic fallback when the AI is unavailable.
 * All text is sourced from Panchang calculation — no fabricated content.
 */
function getFallbackInterpretation(panchang, isPersonalized) {
  const { tithi, nakshatra, yoga, vara, moonSign } = panchang;

  return {
    _source: "fallback",
    dailySummary: {
      en: `Today is ${vara.en}, ${tithi.paksha} Paksha ${tithi.name}. The Moon is in ${moonSign.name} in the ${nakshatra.name} Nakshatra (${nakshatra.devanagari}). The active Yoga is ${yoga.name} (${yoga.devanagari}).`,
      hi: `आज ${vara.hi} है, ${tithi.paksha} पक्ष ${tithi.devanagari}। चंद्रमा ${moonSign.sanskritName} राशि में ${nakshatra.devanagari} नक्षत्र में हैं। आज का योग ${yoga.devanagari} है।`,
    },
    overallTheme: {
      en: `${yoga.name} Yoga — ${nakshatra.name} Nakshatra Day`,
      hi: `${yoga.devanagari} योग — ${nakshatra.devanagari} नक्षत्र`,
    },
    cards: [],
    whatToDo: [
      {
        en: "Focus on completing existing tasks and responsibilities.",
        hi: "अपने मौजूदा कार्यों और जिम्मेदारियों को पूरा करने पर ध्यान दें।",
        reason: "General guidance based on traditional almanac.",
      },
    ],
    whatToAvoid: [
      {
        en: "Avoid making major irreversible decisions without careful reflection.",
        hi: "बिना सोच-विचार के कोई बड़ा अपरिवर्तनीय निर्णय लेने से बचें।",
        reason: "General guidance based on traditional almanac.",
      },
    ],
    spiritualPractice: {
      theme: {
        en: `${nakshatra.name} Nakshatra is associated with ${nakshatra.lord || "its ruling deity"}.`,
        hi: `${nakshatra.devanagari} नक्षत्र के अधिपति ${nakshatra.lord || "देवता"} हैं।`,
      },
      suggestion: {
        en: "Begin the day with a moment of stillness and gratitude. Observe your thoughts before reacting.",
        hi: "दिन की शुरुआत कुछ पलों की शांति और कृतज्ञता के साथ करें। प्रतिक्रिया देने से पहले अपने विचारों को देखें।",
      },
    },
    isPersonalized,
    disclaimer: {
      en: "This interpretation is based on traditional Vedic astrology. It is offered as a reflective guide, not as a guarantee or prediction of specific outcomes.",
      hi: "यह व्याख्या पारंपरिक वैदिक ज्योतिष पर आधारित है। इसे एक चिंतनशील मार्गदर्शन के रूप में प्रस्तुत किया गया है, न कि किसी विशिष्ट परिणाम की गारंटी के रूप में।",
    },
  };
}
