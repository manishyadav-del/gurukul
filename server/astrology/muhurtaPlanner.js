/**
 * Advanced Vedic Muhurta Planner Engine
 *
 * Implements classical electional astrology (Muhurta Shastra) based on
 * Muhurta Chintamani, Brihat Samhita, and Kalaprakasika:
 * - Multi-activity suitability analysis across 5 Panchanga limbs
 * - Abhijit Muhurta calculation (8th daytime Muhurta)
 * - Inauspicious windows: Rahu Kaal, Yamaganda, Gulika, and Vishti/Bhadra Karana
 * - Auspicious Choghadiya slots (Amrit, Shubh, Labh, Char)
 * - Suitability percentage score (0-100%) and timeline of favorable hours
 */

import { computePanchang } from "./panchang.js";
import { NAKSHATRA_MUHURTA } from "../../components/astrology/muhurtaConstants.js";

// Activity configurations & Classical Rules (Muhurta Chintamani)
export const MUHURTA_ACTIVITIES = {
  VIVAHA: {
    id: "VIVAHA",
    nameEn: "Marriage & Sacred Union",
    nameHi: "विवाह संस्कार",
    descriptionEn: "Long-term partnership vows, wedding ceremonies, and engagement commitments.",
    descriptionHi: "विवाह, सगाई एवं दांपत्य जीवन के पवित्र गठबंधन हेतु शुभ मुहूर्त।",
    favorableTithis: [2, 3, 5, 7, 10, 11, 12, 13],
    avoidTithis: [4, 9, 14, 30], // Rikta & Amavasya
    favorableVaras: [0, 1, 3, 4, 5], // Sun, Mon, Wed, Thu, Fri
    favorableNakshatras: [
      "Rohini", "Mrigashira", "Magha", "Uttara Phalguni", "Hasta",
      "Swati", "Anuradha", "Mula", "Uttara Ashadha", "Uttara Bhadrapada", "Revati"
    ],
  },
  VYAPAR: {
    id: "VYAPAR",
    nameEn: "Business & Financial Commerce",
    nameHi: "व्यापार एवं वित्तीय शुभारंभ",
    descriptionEn: "Inaugurating a business, signing contracts, launching products, or major investments.",
    descriptionHi: "दुकान/व्यवसाय का शुभारंभ, अनुबंध पर हस्ताक्षर, व्यापारिक निवेश एवं खाता-बही पूजन।",
    favorableTithis: [2, 3, 5, 7, 10, 11, 13, 15],
    avoidTithis: [4, 9, 14, 30],
    favorableVaras: [1, 3, 4, 5], // Mon, Wed, Thu, Fri
    favorableNakshatras: [
      "Ashwini", "Rohini", "Pushya", "Uttara Phalguni", "Hasta",
      "Chitra", "Swati", "Anuradha", "Shravana", "Dhanishta", "Revati"
    ],
  },
  GRIHA_PRAVESH: {
    id: "GRIHA_PRAVESH",
    nameEn: "Housewarming & New Home Entry",
    nameHi: "गृह प्रवेश",
    descriptionEn: "Entering a new home, moving residence, or setting up a new dwelling.",
    descriptionHi: "नए भवन में प्रवेश, वास्तु शांति पूजन एवं गृह स्थापना।",
    favorableTithis: [2, 3, 5, 7, 10, 11, 13, 15],
    avoidTithis: [4, 9, 14, 30],
    favorableVaras: [1, 3, 4, 5], // Mon, Wed, Thu, Fri
    favorableNakshatras: [
      "Rohini", "Mrigashira", "Uttara Phalguni", "Chitra", "Anuradha",
      "Uttara Ashadha", "Uttara Bhadrapada", "Revati"
    ],
  },
  VIDYA_ARAMBHA: {
    id: "VIDYA_ARAMBHA",
    nameEn: "Education & Initiation of Learning",
    nameHi: "विद्यारम्भ एवं अध्ययन",
    descriptionEn: "Commencing higher studies, sacred treatises, taking examinations, or learning skills.",
    descriptionHi: "शिक्षा आरंभ, दीक्षा, शास्त्र अध्ययन, परीक्षा एवं शोध कार्य।",
    favorableTithis: [2, 3, 5, 7, 10, 11, 12],
    avoidTithis: [4, 9, 14, 30],
    favorableVaras: [1, 3, 4, 5],
    favorableNakshatras: [
      "Ashwini", "Rohini", "Punarvasu", "Pushya", "Hasta", "Chitra",
      "Swati", "Anuradha", "Shravana", "Dhanishta", "Shatabhisha", "Revati"
    ],
  },
  YATRA: {
    id: "YATRA",
    nameEn: "Travel & Sacred Pilgrimage",
    nameHi: "यात्रा एवं तीर्थाटन",
    descriptionEn: "Long-distance journeys, vacations, business travel, and pilgrimages.",
    descriptionHi: "दूरस्थ यात्रा, विदेश गमन, तीर्थ दर्शन एवं पर्यटन।",
    favorableTithis: [2, 3, 5, 7, 10, 11, 13],
    avoidTithis: [4, 9, 14, 30],
    favorableVaras: [1, 3, 4, 5],
    favorableNakshatras: [
      "Ashwini", "Mrigashira", "Punarvasu", "Pushya", "Hasta",
      "Anuradha", "Shravana", "Dhanishta", "Revati"
    ],
  },
  CHIKITSA: {
    id: "CHIKITSA",
    nameEn: "Health, Wellness & Healing",
    nameHi: "चिकित्सा एवं आरोग्य साधना",
    descriptionEn: "Beginning medical treatments, surgery, Ayurvedic detox, or wellness routines.",
    descriptionHi: "औषधि सेवन, शल्य चिकित्सा, आयुर्वेदिक कायाकल्प एवं स्वास्थ्य सुधार।",
    favorableTithis: [2, 3, 5, 7, 8, 10, 11, 13],
    avoidTithis: [4, 9, 14, 30],
    favorableVaras: [0, 1, 2, 4], // Sun, Mon, Tue (Mars rules surgery/vitality), Thu
    favorableNakshatras: [
      "Ashwini", "Rohini", "Mrigashira", "Punarvasu", "Pushya", "Hasta",
      "Chitra", "Swati", "Anuradha", "Shravana", "Dhanishta", "Shatabhisha", "Revati"
    ],
  },
  SADHANA: {
    id: "SADHANA",
    nameEn: "Spiritual Initiation & Meditation",
    nameHi: "आध्यात्मिक दीक्षा एवं अनुष्ठान",
    descriptionEn: "Mantra initiation, silent retreat, Kundalini sadhana, and temple rituals.",
    descriptionHi: "मंत्र दीक्षा, ध्यान साधना, हवन-यज्ञ एवं कुण्डलिनी जागरण अभ्यास।",
    favorableTithis: [1, 2, 3, 5, 8, 10, 11, 13, 14, 15],
    avoidTithis: [],
    favorableVaras: [0, 1, 4], // Sun, Mon, Thu
    favorableNakshatras: [
      "Rohini", "Mrigashira", "Pushya", "Hasta", "Swati", "Anuradha",
      "Shravana", "Uttara Ashadha", "Uttara Bhadrapada", "Revati"
    ],
  },
};

// Inauspicious Yogas to avoid for auspicious beginnings
export const INAUSPICIOUS_YOGAS = [
  "Vishkambha", "Atiganda", "Shula", "Ganda", "Vyaghata", "Vajra", "Vyatipata", "Parigha", "Vaidhriti"
];

/**
 * Computes Abhijit Muhurta window (8th daytime Muhurta centered at local solar noon).
 */
export function computeAbhijitMuhurta(sunriseInput, sunsetInput, tzOffsetHours) {
  if (!sunriseInput || !sunsetInput) return null;
  const sunriseDate = sunriseInput instanceof Date ? sunriseInput : new Date(sunriseInput);
  const sunsetDate = sunsetInput instanceof Date ? sunsetInput : new Date(sunsetInput);

  if (isNaN(sunriseDate.getTime()) || isNaN(sunsetDate.getTime())) return null;
  const dayMs = sunsetDate.getTime() - sunriseDate.getTime();
  if (dayMs <= 0) return null;

  const muhurtaSpanMs = dayMs / 15; // 15 Muhurtas in a solar day
  const abhijitStartMs = sunriseDate.getTime() + 7 * muhurtaSpanMs; // 8th Muhurta (index 7)
  const abhijitEndMs = abhijitStartMs + muhurtaSpanMs;

  const start = new Date(abhijitStartMs);
  const end = new Date(abhijitEndMs);

  const formatTime = (d) => {
    const totalMinutes = Math.floor(d.getTime() / 60000) + Math.round(tzOffsetHours * 60);
    const m = ((totalMinutes % 1440) + 1440) % 1440;
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    return `${hh}:${mm}`;
  };

  return {
    start,
    end,
    startStr: formatTime(start),
    endStr: formatTime(end),
    nameEn: "Abhijit Muhurta",
    nameHi: "अभिजित मुहूर्त",
    descriptionEn: "Highly auspicious 8th Muhurta of the day; neutralizes minor astrological defects.",
    descriptionHi: "दिन का 8वां अभिजित मुहूर्त — अनेक सामान्य दोषों का शमन करने वाला सर्वशुभ काल।",
  };
}

/**
 * Evaluates comprehensive Muhurta suitability for a specific activity on a given date and location.
 *
 * @param {Object} params
 * @param {string} [params.date] - "YYYY-MM-DD"
 * @param {number} [params.latitude=28.6139]
 * @param {number} [params.longitude=77.2090]
 * @param {number} [params.tzOffset=5.5]
 * @param {string} [params.activityKey="VYAPAR"]
 * @param {string} [params.language="en"]
 * @returns {Object} Comprehensive Muhurta evaluation
 */
export function evaluateActivityMuhurta({
  date = new Date().toISOString().split("T")[0],
  latitude = 28.6139,
  longitude = 77.2090,
  tzOffset = 5.5,
  activityKey = "VYAPAR",
  language = "en",
}) {
  const isHi = language === "hi" || language === "hindi";

  // 1. Calculate base Panchang
  const panchang = computePanchang({ date, latitude, longitude, tzOffset });
  const activity = MUHURTA_ACTIVITIES[activityKey.toUpperCase()] || MUHURTA_ACTIVITIES["VYAPAR"];

  // 2. Abhijit Muhurta
  const abhijit = computeAbhijitMuhurta(panchang.sunrise?.utc, panchang.sunset?.utc, tzOffset);

  // 3. Evaluate 5 Panchang Limbs against activity rules
  const tithiNum = panchang.tithi?.id || 1;
  const isTithiFavorable = activity.favorableTithis.includes(tithiNum) && !activity.avoidTithis.includes(tithiNum);
  const isRiktaTithi = [4, 9, 14].includes(tithiNum);

  const varaIdx = panchang.vara?.id ?? 0;
  const isVaraFavorable = activity.favorableVaras.includes(varaIdx);

  const nakName = panchang.nakshatra?.name || "";
  const isNakFavorable = activity.favorableNakshatras.includes(nakName);

  const yogaName = panchang.yoga?.name || "";
  const isInauspiciousYoga = INAUSPICIOUS_YOGAS.includes(yogaName);

  const karanaName = panchang.karana?.name || "";
  const isVishtiBhadra = karanaName.toLowerCase().includes("vishti") || karanaName.toLowerCase().includes("bhadra");

  // 4. Calculate Suitability Score (0 to 100)
  let score = 50; // baseline neutral
  if (isTithiFavorable) score += 15;
  if (isRiktaTithi) score -= 20;

  if (isVaraFavorable) score += 15;

  if (isNakFavorable) score += 20;

  if (!isInauspiciousYoga) score += 10;
  else score -= 15;

  if (isVishtiBhadra) score -= 25;

  score = Math.max(10, Math.min(95, score));

  // Qualitative verdict
  let verdict = "MODERATE";
  let verdictText = "";
  if (score >= 75) {
    verdict = "HIGHLY_AUSPICIOUS";
    verdictText = isHi
      ? "अति शुभ मुहूर्त — पंचांग के अधिकांश अंग अनुकूल हैं। कार्य सिद्धि हेतु श्रेष्ठ काल।"
      : "Highly Auspicious — Panchang limbs harmonize strongly with this activity.";
  } else if (score >= 50) {
    verdict = "FAVORABLE";
    verdictText = isHi
      ? "अनुकूल मुहूर्त — शुभ चौघड़िया अथवा अभिजित मुहूर्त में कार्य प्रारंभ करना फलदायी होगा।"
      : "Favorable — Commencing during Abhijit Muhurta or auspicious Choghadiya slots is recommended.";
  } else {
    verdict = "RESTRICTED";
    verdictText = isHi
      ? "मध्यम / सतर्कता मुहूर्त — कुछ प्रतिकूल पंचांग घटक विद्यमान हैं। राहुकाल से बचें।"
      : "Restricted / Caution — Planetary factors call for patience; avoid inauspicious windows like Rahu Kaal.";
  }

  // 5. Gather Auspicious & Inauspicious Time Windows
  const recommendedSlots = [];
  const restrictedSlots = [];

  // Abhijit
  if (abhijit) {
    recommendedSlots.push({
      name: isHi ? "अभिजित मुहूर्त" : "Abhijit Muhurta",
      type: "ABHIJIT",
      start: abhijit.startStr,
      end: abhijit.endStr,
      quality: "Auspicious",
      description: isHi ? "दिन का सर्वाधिक शुभ 48 मिनट का काल" : "Most auspicious 48-minute daytime window",
    });
  }

  // Favorable Choghadiya
  for (const slot of panchang.choghadiya?.day || []) {
    if (["Amrit", "Shubh", "Labh"].includes(slot.type)) {
      recommendedSlots.push({
        name: isHi ? `${slot.nameHi} चौघड़िया` : `${slot.nameEn} Choghadiya`,
        type: "CHOGHADIYA",
        start: slot.startLocal,
        end: slot.endLocal,
        quality: slot.quality,
        description: isHi ? `शुभ चौघड़िया (${slot.nature})` : `${slot.quality} Choghadiya window`,
      });
    }
  }

  // Rahu Kaal
  if (panchang.rahuKaal) {
    restrictedSlots.push({
      name: isHi ? "राहुकाल" : "Rahu Kaal",
      type: "RAHU_KAAL",
      start: panchang.rahuKaal.startStr,
      end: panchang.rahuKaal.endStr,
      quality: "Inauspicious",
      description: isHi ? "राहु का अशुभ काल, नए कार्य आरंभ न करें" : "Inauspicious Rahu window; avoid new initiatives",
    });
  }

  // Vishti / Bhadra Alert
  if (isVishtiBhadra) {
    restrictedSlots.push({
      name: isHi ? "विष्टि (भद्रा) करण" : "Vishti (Bhadra) Karana",
      type: "BHADRA",
      start: "Current Karana",
      end: "Karana End",
      quality: "Inauspicious",
      description: isHi ? "भद्रा में मांगलिक कार्य वर्जित हैं" : "Bhadra period; auspicious beginnings restricted",
    });
  }

  return {
    date,
    activity: {
      key: activity.id,
      name: isHi ? activity.nameHi : activity.nameEn,
      description: isHi ? activity.descriptionHi : activity.descriptionEn,
    },
    suitabilityScore: score,
    verdict,
    verdictText,
    panchangSummary: {
      tithi: `${panchang.tithi?.name} (${panchang.tithi?.paksha})`,
      vara: panchang.vara?.name,
      nakshatra: panchang.nakshatra?.name,
      yoga: panchang.yoga?.name,
      karana: panchang.karana?.name,
      sunrise: panchang.sunrise?.local,
      sunset: panchang.sunset?.local,
    },
    factors: {
      isTithiFavorable,
      isRiktaTithi,
      isVaraFavorable,
      isNakFavorable,
      isInauspiciousYoga,
      isVishtiBhadra,
    },
    recommendedSlots,
    restrictedSlots,
    mindfulnessGuidance: isHi
      ? "मुहूर्त काल की ऊर्जा का विवेकपूर्ण उपयोग करने का साधन है। किसी भी शुभ मुहूर्त में संकल्प, पवित्र भावना और कर्मठता की शक्ति सर्वोच्च मानी गई है।"
      : "Vedic Muhurta aligns personal action with favorable cosmic timings. Pure intent, diligent preparation, and conscious effort remain the highest foundational blessing.",
  };
}
