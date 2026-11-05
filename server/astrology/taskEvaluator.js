/**
 * Vedic Task & Muhurta Feasibility Evaluator
 *
 * Evaluates a user's planned task/work against today's deterministic Panchang,
 * Nakshatra qualities (Gana, Nature/Samjna), Tithi classification, and transits.
 *
 * References:
 * - Muhurta Chintamani
 * - Brihat Samhita (Varahamihira)
 * - Kalaprakasika
 */

import { computeLahiriAyanamsa } from "./calculations.js";
import { computePanchang } from "./panchang.js";

// ---------------------------------------------------------------------------
// Classical Nakshatra Classifications (Samjna)
// ---------------------------------------------------------------------------
export const NAKSHATRA_QUALITIES = {
  // Sthira (Fixed) - Good for permanent, long-lasting works, laying foundation, investments
  "Rohini": { type: "Sthira (स्थिर)", energy: "Fixed", bestFor: ["Long-term investments", "Construction", "Signing permanent agreements", "Starting marriage rites", "Planting trees", "Home entry"] },
  "Uttara Phalguni": { type: "Sthira (स्थिर)", energy: "Fixed", bestFor: ["New ventures", "Foundation stone", "Taking office", "Long-term agreements"] },
  "Uttara Ashadha": { type: "Sthira (स्थिर)", energy: "Fixed", bestFor: ["Real estate", "Starting durable projects", "Long-term contracts", "Spiritual initiations"] },
  "Uttara Bhadrapada": { type: "Sthira (स्थिर)", energy: "Fixed", bestFor: ["Meditation centers", "Long-term savings", "Charitable foundations", "Scholarly works"] },

  // Chara (Movable) - Good for travel, vehicles, quick movements, technology launches
  "Punarvasu": { type: "Chara (चर)", energy: "Movable", bestFor: ["Journeys", "Buying vehicles", "Commencing studies", "Moving residences", "Healthcare recovery"] },
  "Swati": { type: "Chara (चर)", energy: "Movable", bestFor: ["Air travel", "Business networking", "Vehicle acquisition", "Starting marketing campaigns", "Artistic learning"] },
  "Shravana": { type: "Chara (चर)", energy: "Movable", bestFor: ["Learning music", "Public presentations", "Travel", "Higher education", "Spiritual discourses"] },
  "Dhanishta": { type: "Chara (चर)", energy: "Movable", bestFor: ["Financial transactions", "Travel", "Sports & physical pursuits", "Music & arts"] },
  "Shatabhisha": { type: "Chara (चर)", energy: "Movable", bestFor: ["Medical treatment", "Technology & internet work", "Research & data analysis", "Water-related ventures"] },

  // Kshipra / Laghu (Swift/Light) - Supreme for fast commerce, tech, exams, deals
  "Ashwini": { type: "Kshipra (लघु/क्षिप्र)", energy: "Swift", bestFor: ["Starting medicines/therapy", "Fast business transactions", "Travel", "Learning technology", "Sporting events"] },
  "Pushya": { type: "Kshipra (लघु/क्षिप्र)", energy: "Swift/Nourishing", bestFor: ["All auspicious beginnings", "Financial investments", "Taking up a job", "Learning sacred knowledge", "Signing deals"] },
  "Hasta": { type: "Kshipra (लघु/क्षिप्र)", energy: "Swift", bestFor: ["Commercial trade", "Negotiations", "Art & craft", "Public speaking", "Document signing"] },

  // Mridu (Soft/Tender) - Superb for creative, romance, arts, partnerships, peace
  "Mrigashira": { type: "Mridu (मृदु)", energy: "Soft", bestFor: ["Creative arts", "Romance & friendship", "Travel", "Wearing new garments", "Researching curiosities"] },
  "Chitra": { type: "Mridu (मृदु)", energy: "Soft", bestFor: ["Design & architecture", "Fashion & aesthetics", "Artistic creation", "Decorations"] },
  "Anuradha": { type: "Mridu (मृदु)", energy: "Soft", bestFor: ["Forming partnerships", "Friendship", "Travel", "Spiritual devotion", "Reconciliation"] },
  "Revati": { type: "Mridu (मृदु)", energy: "Soft", bestFor: ["Financial investments", "Creative writing", "Travel by water", "Starting a business", "Spiritual initiation"] },

  // Mishra (Mixed/Common)
  "Krittika": { type: "Mishra (मिश्र)", energy: "Mixed", bestFor: ["Technical audits", "Fire rituals", "Cooking/culinary", "Ending debts", "Disputes resolution"] },
  "Vishakha": { type: "Mishra (मिश्र)", energy: "Mixed", bestFor: ["Goal-oriented focus", "Competitive planning", "Celebrations", "Agricultural pursuits"] },

  // Ugra (Fierce) - Good for audit, demolition, surgeries, competitive defense, NOT gentle starts
  "Bharani": { type: "Ugra (उग्र)", energy: "Fierce", bestFor: ["Auditing & eliminating errors", "Surgeries", "Severing negative ties", "Confidential research", "Discarding obsolete items"] },
  "Magha": { type: "Ugra (उग्र)", energy: "Fierce", bestFor: ["Honoring ancestors", "Administrative authority", "Historical research", "Demolition of old structures"] },
  "Purva Phalguni": { type: "Ugra (उग्र)", energy: "Fierce/Sensory", bestFor: ["Relaxation & entertainment", "Resolving disputes", "Artistic performance", "Negotiating terms"] },
  "Purva Ashadha": { type: "Ugra (उग्र)", energy: "Fierce", bestFor: ["Water sports", "Confronting obstacles", "Courageous decisions", "Military/police strategy"] },
  "Purva Bhadrapada": { type: "Ugra (उग्र)", energy: "Fierce", bestFor: ["Deep introspection", "Penance", "Overcoming addictions", "Technical problem solving"] },

  // Tikshna (Sharp/Dreadful) - Debugging, surgical, breaking habits
  "Ardra": { type: "Tikshna (तीक्ष्ण)", energy: "Sharp", bestFor: ["Debugging & error hunting", "Surgical operations", "Breaking toxic habits", "Demolition", "Overcoming hurdles"] },
  "Ashlesha": { type: "Tikshna (तीक्ष्ण)", energy: "Sharp", bestFor: ["Competitive strategy", "Handling difficult legal matters", "Research in toxicology/chemistry", "Self-defense"] },
  "Jyeshtha": { type: "Tikshna (तीक्ष्ण)", energy: "Sharp", bestFor: ["Administrative commands", "Defending rights", "Combatting falsehood", "Crisis management"] },
  "Mula": { type: "Tikshna (तीक्ष्ण)", energy: "Sharp", bestFor: ["Root-cause analysis", "Researching ancient secrets", "Planting herbs", "Ending unproductive dependencies"] },
};

// ---------------------------------------------------------------------------
// Tithi Classifications (Nanda, Bhadra, Jaya, Rikta, Poorna)
// ---------------------------------------------------------------------------
export const TITHI_GROUPS = {
  // Rikta (4, 9, 14 in both pakshas) - Empty tithis, traditionally avoid starting peaceful ventures
  4:  { name: "Rikta (रिक्ता)", nature: "Challenging for beginnings", recommendation: "Suitable for cleaning, audits, debugging, settling disputes; avoid signing new contracts." },
  9:  { name: "Rikta (रिक्ता)", nature: "Challenging for beginnings", recommendation: "Suitable for physical workouts, competitive preparation; postpone major new agreements." },
  14: { name: "Rikta (रिक्ता)", nature: "Challenging for beginnings", recommendation: "Suitable for spiritual discipline and ending old matters; avoid starting celebratory ventures." },
  19: { name: "Rikta (रिक्ता)", nature: "Challenging for beginnings", recommendation: "Suitable for debt clearance and elimination of clutter." },
  24: { name: "Rikta (रिक्ता)", nature: "Challenging for beginnings", recommendation: "Suitable for strategic defense and auditing." },
  29: { name: "Rikta (रिक्ता)", nature: "Challenging for beginnings", recommendation: "Suitable for introspective work and quiet resolution." },

  // Poorna (5, 10, 15, 30) - Full, fulfilling
  5:  { name: "Poorna (पूर्णा)", nature: "Fulfilling & Auspicious", recommendation: "Excellent for financial prosperity, health ventures, and constructive undertakings." },
  10: { name: "Poorna (पूर्णा)", nature: "Fulfilling & Auspicious", recommendation: "Highly favorable for partnerships, administrative progress, and promotions." },
  15: { name: "Poorna (पूर्णा - पूर्णिमा)", nature: "Supreme Fulfillment", recommendation: "Auspicious for spiritual ceremonies, charitable gifts, and public announcements." },
  30: { name: "Amavasya (अमावस्या)", nature: "Deep Introspection", recommendation: "Ideal for ancestral remembrance, rest, and internal planning; avoid starting bright external projects." },

  // Jaya (3, 8, 13) - Victory
  3:  { name: "Jaya (जया)", nature: "Triumphant", recommendation: "Favorable for overcoming hurdles, legal strategy, athletic events, and bold action." },
  8:  { name: "Jaya (जया)", nature: "Triumphant", recommendation: "Good for courageous tasks, surgery, and resolving longstanding conflicts." },
  13: { name: "Jaya (जया)", nature: "Triumphant", recommendation: "Excellent for negotiations, competitive victories, and decisive launches." },

  // Bhadra (2, 7, 12) - Welfare & Commerce
  2:  { name: "Bhadra (भद्रा)", nature: "Auspicious & Commercial", recommendation: "Great for commerce, financial investments, vehicle buying, and learning." },
  7:  { name: "Bhadra (भद्रा)", nature: "Auspicious & Commercial", recommendation: "Favors journeys, transport, trading agreements, and friendships." },
  12: { name: "Bhadra (भद्रा)", nature: "Auspicious & Commercial", recommendation: "Favorable for religious studies, philanthropic work, and social events." },

  // Nanda (1, 6, 11) - Joy & Festivity
  1:  { name: "Nanda (नन्दा)", nature: "Joyful & Energetic", recommendation: "Favorable for celebrations, physical well-being, creative beginnings, and personal goals." },
  6:  { name: "Nanda (नन्दा)", nature: "Joyful & Energetic", recommendation: "Favorable for friendships, entertainment, social meetings, and starting creative projects." },
  11: { name: "Nanda (नन्दा - एकादशी)", nature: "Sacred & Pure", recommendation: "Supreme for mental clarity, spiritual vows, study, and high ethical dealings." },
};

// ---------------------------------------------------------------------------
// Deterministic Rule-Based Task Evaluation
// ---------------------------------------------------------------------------

export function evaluateTaskDeterministically({ taskText, panchang }) {
  const nakshatraName = panchang.nakshatra?.name || "Ashwini";
  const nakshatraInfo = NAKSHATRA_QUALITIES[nakshatraName] || {
    type: "Samanya (सामान्य)",
    energy: "Balanced",
    bestFor: ["Routine tasks", "General work"],
  };

  const tithiId = panchang.tithi?.id || 1;
  const tithiInfo = TITHI_GROUPS[tithiId] || {
    name: "Shubha (शुभ)",
    nature: "Moderate",
    recommendation: "Conduct work with mindfulness and practical diligence.",
  };

  const isRiktaTithi = [4, 9, 14, 19, 24, 29].includes(tithiId);
  const isPoornaTithi = [5, 10, 15].includes(tithiId);
  const isKshipraOrPushya = ["Ashwini", "Pushya", "Hasta"].includes(nakshatraName);
  const isUgraOrTikshna = ["Bharani", "Magha", "Purva Phalguni", "Purva Ashadha", "Purva Bhadrapada", "Ardra", "Ashlesha", "Jyeshtha", "Mula"].includes(nakshatraName);

  // Compute confidence / suitability score: 1 to 5 stars
  let score = 3; // neutral default
  const positiveFactors = [];
  const cautionaryFactors = [];

  // Tithi factors
  if (isPoornaTithi) {
    score += 1;
    positiveFactors.push(`Today is ${panchang.tithi.name} (${tithiInfo.name}), which is traditionally deemed a full, fruitful tithi.`);
  } else if (isRiktaTithi) {
    score -= 1;
    cautionaryFactors.push(`Today is ${panchang.tithi.name} (${tithiInfo.name}), a Rikta tithi. Classical Muhurta advises double-checking terms before signing or starting new long-term ventures.`);
  }

  // Nakshatra factors
  if (isKshipraOrPushya) {
    score += 1;
    positiveFactors.push(`${nakshatraName} is a Kshipra (swift/light) Nakshatra, excellent for quick deal execution, trade, study, and swift transactions.`);
  } else if (isUgraOrTikshna) {
    cautionaryFactors.push(`${nakshatraName} has a fierce/sharp energy (${nakshatraInfo.type}). It excels at audits, debugging, surgery, or cutting ties, but demands patience for gentle diplomacy or new partnerships.`);
  } else {
    positiveFactors.push(`${nakshatraName} possesses ${nakshatraInfo.type} energy, favorable for ${nakshatraInfo.bestFor.slice(0, 3).join(", ")}.`);
  }

  // Rahu Kaal reminder
  if (panchang.rahuKaal) {
    cautionaryFactors.push(`Rahu Kaal is active from ${panchang.rahuKaal.startLocal} to ${panchang.rahuKaal.endLocal}. Avoid initiating critical signatures or inaugural actions during this specific window.`);
  }

  // Clamp score [1, 5]
  score = Math.max(1, Math.min(5, score));

  let verdictEn = "Favorable with Care";
  let verdictHi = "सावधानीपूर्वक अनुकूल";

  if (score >= 4) {
    verdictEn = "Highly Favorable Alignment";
    verdictHi = "अति अनुकूल ग्रह योग";
  } else if (score <= 2) {
    verdictEn = "Demands Heightened Caution & Review";
    verdictHi = "विशेष सावधानी एवं समीक्षा आवश्यक";
  }

  return {
    score,
    verdictEn,
    verdictHi,
    nakshatraType: nakshatraInfo.type,
    nakshatraEnergy: nakshatraInfo.energy,
    bestActivities: nakshatraInfo.bestFor,
    tithiGroup: tithiInfo.name,
    tithiRecommendation: tithiInfo.recommendation,
    positiveFactors,
    cautionaryFactors,
    safeTimeWindow: panchang.rahuKaal
      ? `Avoid Rahu Kaal (${panchang.rahuKaal.startLocal} - ${panchang.rahuKaal.endLocal}). Prefer morning after sunrise or mid-afternoon.`
      : "Conduct during standard daytime hours with attention.",
    safeTimeWindowHi: panchang.rahuKaal
      ? `राहुकाल (${panchang.rahuKaal.startLocal} से ${panchang.rahuKaal.endLocal}) से बचें। सूर्योदय के बाद प्रातः या अपराह्न का समय अधिक श्रेष्ठ है।`
      : "दिन के सामान्य शुभ घंटों में कार्य करें।",
  };
}

// ---------------------------------------------------------------------------
// AI-Augmented Evaluation (when API key available)
// ---------------------------------------------------------------------------

const API_KEY = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
const OPENAI_KEY = process.env.OPENAI_API_KEY;

export async function evaluateTaskWithAI({ taskText, panchang, transits, natalChart = null, language = "hi" }) {
  // First get deterministic baseline
  const base = evaluateTaskDeterministically({ taskText, panchang });

  const prompt = `You are a learned Vedic Jyotisha counselor in Gurukul.
A user is asking whether their specific planned work/task will succeed today or how they should approach it.

USER'S PLANNED TASK: "${taskText}"

TODAY'S VERIFIED ASTRONOMICAL PANCHANG (Lahiri Ayanamsha):
- Date: ${panchang.date}
- Weekday (Vara): ${panchang.vara?.en} (${panchang.vara?.hi})
- Tithi: ${panchang.tithi?.paksha} ${panchang.tithi?.name} (${panchang.tithi?.devanagari})
- Nakshatra: ${panchang.nakshatra?.name} (${panchang.nakshatra?.devanagari}), Pada ${panchang.nakshatra?.pada} - Quality: ${base.nakshatraType}
- Moon Sign: ${panchang.moonSign?.name} (${panchang.moonSign?.sanskritName})
- Rahu Kaal: ${panchang.rahuKaal?.startLocal || "N/A"} to ${panchang.rahuKaal?.endLocal || "N/A"}

DETERMINISTIC EVALUATION BASELINE:
- Alignment Score: ${base.score}/5
- Best activities for this Nakshatra: ${base.bestActivities.join(", ")}
- Tithi note: ${base.tithiRecommendation}

${natalChart ? `NATAL CHART AVAILABLE: Ascendant is ${natalChart.ascendant?.sign || natalChart.lagnaSign || "N/A"}, Moon in ${natalChart.moon?.sign || natalChart.moonSign || "N/A"}` : "No natal chart provided (General reading)."}

LANGUAGE: Provide output with both English ("en") and Hindi Devanagari ("hi") fields.

TASK: Return a JSON object with this EXACT structure (no markdown, pure JSON):
{
  "score": ${base.score},
  "verdict": {
    "en": "${base.verdictEn}",
    "hi": "${base.verdictHi}"
  },
  "feasibilityAnalysis": {
    "en": "2-3 insightful sentences directly addressing the user's task. Explain how today's Nakshatra nature (${base.nakshatraType}) and Tithi either support or challenge this specific work. Emphasize preparation and ethical effort.",
    "hi": "उपयोगकर्ता के कार्य पर 2-3 वाक्यों में सीधा और सारगर्भित विश्लेषण। आज के नक्षत्र और तिथि के प्रभाव को समझाएं।"
  },
  "optimalTimeWindow": {
    "en": "${base.safeTimeWindow}",
    "hi": "${base.safeTimeWindowHi}"
  },
  "practicalRecommendations": [
    {
      "en": "Actionable step 1 for success in this task",
      "hi": "सफलता के लिए व्यावहारिक कदम 1"
    },
    {
      "en": "Actionable step 2 for success in this task",
      "hi": "सफलता के लिए व्यावहारिक कदम 2"
    }
  ],
  "precautionsToObserve": [
    {
      "en": "Things to be cautious of (e.g. check fine print, avoid rushing during Rahu Kaal)",
      "hi": "बरतने योग्य सावधानी"
    }
  ],
  "spiritualContemplation": {
    "en": "Traditional contemplation or remembrance for peace of mind while performing this task",
    "hi": "कार्य की सिद्धि और मानसिक शांति के लिए पारंपरिक चिंतन या स्मरण"
  },
  "ethicalDisclaimer": {
    "en": "Astrology offers symbolic and timing guidance. Success ultimately rests on your diligent effort (Purushartha), clear ethics, and practical preparation.",
    "hi": "ज्योतिष समय और ऊर्जा का मार्गदर्शन प्रदान करता है। सफलता आपके पुरुषार्थ, व्यावहारिक तैयारी और कर्मनिष्ठा पर निर्भर करती है।"
  }
}

RULES:
- Do NOT guarantee success or failure. Never speak in absolute terms.
- Do NOT invent mantras, shlokas, or fake book verses.
- Directly connect the analysis to the USER's specific task.
- Return ONLY the raw JSON object.`;

  // 1. Try Gemini
  if (API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 2000,
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
      console.warn("[Task Evaluator] Gemini API error, falling back:", err.message);
    }
  }

  // 2. Try OpenAI
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
          temperature: 0.35,
          max_tokens: 2000,
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
      console.warn("[Task Evaluator] OpenAI API error, falling back:", err.message);
    }
  }

  // 3. Structured deterministic fallback
  return {
    _source: "deterministic_fallback",
    score: base.score,
    verdict: {
      en: base.verdictEn,
      hi: base.verdictHi,
    },
    feasibilityAnalysis: {
      en: `Today's lunar mansion is ${panchang.nakshatra?.name} (${base.nakshatraType}), which carries an energy best suited for: ${base.bestActivities.slice(0, 3).join(", ")}. Regarding your task ("${taskText}"), the current ${panchang.tithi?.name} Tithi advises diligence and thorough review.`,
      hi: `आज का नक्षत्र ${panchang.nakshatra?.devanagari} (${base.nakshatraType}) है, जिसका प्रभाव विशेष रूप से इन कार्यों के लिए श्रेष्ठ है: ${base.bestActivities.slice(0, 3).join(", ")}। आपके कार्य ("${taskText}") के संदर्भ में आज की ${panchang.tithi?.devanagari} तिथि एकाग्रता और सावधानीपूर्वक आगे बढ़ने का संकेत देती है।`,
    },
    optimalTimeWindow: {
      en: base.safeTimeWindow,
      hi: base.safeTimeWindowHi,
    },
    practicalRecommendations: [
      {
        en: `Align your task with ${panchang.nakshatra?.name}'s strength by focusing on clarity and structured execution.`,
        hi: `कार्य को स्पष्ट योजना और एकाग्रता के साथ आरंभ करें।`,
      },
      {
        en: `Double-check paperwork, numbers, and agreements before finalizing.`,
        hi: `कागजातों, विवरणों और शर्तों की भली-भांति जांच कर लें।`,
      },
    ],
    precautionsToObserve: [
      {
        en: panchang.rahuKaal
          ? `Avoid initiating new critical actions during Rahu Kaal (${panchang.rahuKaal.startLocal} - ${panchang.rahuKaal.endLocal}).`
          : `Avoid hurried or impulsive choices.`,
        hi: panchang.rahuKaal
          ? `राहुकाल (${panchang.rahuKaal.startLocal} से ${panchang.rahuKaal.endLocal}) के दौरान महत्वपूर्ण शुरुआत से बचें।`
          : `जल्दबाजी या भावुकता में निर्णय न लें।`,
      },
    ],
    spiritualContemplation: {
      en: "Take three deep mindful breaths before beginning, focusing on sincere effort and ethical clarity.",
      hi: "कार्य आरंभ करने से पहले कुछ क्षण शांत होकर ईश्वर या अपने इष्ट का स्मरण करें और निष्काम भाव से कर्म करें।",
    },
    ethicalDisclaimer: {
      en: "Astrological timing is a supportive guide. Ultimate outcome depends upon your sincere effort, skill, and ethical conduct (Purushartha).",
      hi: "ज्योतिषीय समय केवल अनुकूलता का संकेत देता है। वास्तविक सफलता आपके पुरुषार्थ, कर्म और व्यावहारिक कौशल पर निर्भर करती है।",
    },
  };
}
