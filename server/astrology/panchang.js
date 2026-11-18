/**
 * Vedic Panchang (Hindu Almanac) Calculator
 *
 * All values are computed deterministically from the astronomy-engine library.
 * Lahiri ayanamsa is applied consistent with the existing Gurukul astrology engine.
 *
 * References: Brihat Parashara Hora Shastra, Surya Siddhanta.
 * NO LLM involvement in calculations — every value is astronomical.
 */

import * as Astronomy from "astronomy-engine";
import { NAKSHATRAS, ZODIAC_SIGNS } from "./constants.js";
import { computeLahiriAyanamsa, normalizeAngle, getNakshatraAndPada } from "./calculations.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** 30 Tithis (lunar days), each = 12° of Moon–Sun elongation */
const TITHIS = [
  { id: 1,  name: "Pratipada",   devanagari: "प्रतिपदा",  paksha: "Shukla" },
  { id: 2,  name: "Dwitiya",     devanagari: "द्वितीया",   paksha: "Shukla" },
  { id: 3,  name: "Tritiya",     devanagari: "तृतीया",     paksha: "Shukla" },
  { id: 4,  name: "Chaturthi",   devanagari: "चतुर्थी",    paksha: "Shukla" },
  { id: 5,  name: "Panchami",    devanagari: "पंचमी",      paksha: "Shukla" },
  { id: 6,  name: "Shashthi",    devanagari: "षष्ठी",      paksha: "Shukla" },
  { id: 7,  name: "Saptami",     devanagari: "सप्तमी",     paksha: "Shukla" },
  { id: 8,  name: "Ashtami",     devanagari: "अष्टमी",     paksha: "Shukla" },
  { id: 9,  name: "Navami",      devanagari: "नवमी",       paksha: "Shukla" },
  { id: 10, name: "Dashami",     devanagari: "दशमी",       paksha: "Shukla" },
  { id: 11, name: "Ekadashi",    devanagari: "एकादशी",     paksha: "Shukla" },
  { id: 12, name: "Dwadashi",    devanagari: "द्वादशी",    paksha: "Shukla" },
  { id: 13, name: "Trayodashi",  devanagari: "त्रयोदशी",   paksha: "Shukla" },
  { id: 14, name: "Chaturdashi", devanagari: "चतुर्दशी",   paksha: "Shukla" },
  { id: 15, name: "Purnima",     devanagari: "पूर्णिमा",   paksha: "Shukla" },
  { id: 16, name: "Pratipada",   devanagari: "प्रतिपदा",   paksha: "Krishna" },
  { id: 17, name: "Dwitiya",     devanagari: "द्वितीया",   paksha: "Krishna" },
  { id: 18, name: "Tritiya",     devanagari: "तृतीया",     paksha: "Krishna" },
  { id: 19, name: "Chaturthi",   devanagari: "चतुर्थी",    paksha: "Krishna" },
  { id: 20, name: "Panchami",    devanagari: "पंचमी",       paksha: "Krishna" },
  { id: 21, name: "Shashthi",    devanagari: "षष्ठी",      paksha: "Krishna" },
  { id: 22, name: "Saptami",     devanagari: "सप्तमी",     paksha: "Krishna" },
  { id: 23, name: "Ashtami",     devanagari: "अष्टमी",     paksha: "Krishna" },
  { id: 24, name: "Navami",      devanagari: "नवमी",       paksha: "Krishna" },
  { id: 25, name: "Dashami",     devanagari: "दशमी",       paksha: "Krishna" },
  { id: 26, name: "Ekadashi",    devanagari: "एकादशी",     paksha: "Krishna" },
  { id: 27, name: "Dwadashi",    devanagari: "द्वादशी",    paksha: "Krishna" },
  { id: 28, name: "Trayodashi",  devanagari: "त्रयोदशी",   paksha: "Krishna" },
  { id: 29, name: "Chaturdashi", devanagari: "चतुर्दशी",   paksha: "Krishna" },
  { id: 30, name: "Amavasya",    devanagari: "अमावस्या",   paksha: "Krishna" },
];

/** 27 Yogas (Sun + Moon sidereal longitude / 13.333°) */
const YOGAS = [
  { id: 1,  name: "Vishkambha", devanagari: "विष्कम्भ" },
  { id: 2,  name: "Priti",      devanagari: "प्रीति" },
  { id: 3,  name: "Ayushman",   devanagari: "आयुष्मान" },
  { id: 4,  name: "Saubhagya",  devanagari: "सौभाग्य" },
  { id: 5,  name: "Shobhana",   devanagari: "शोभन" },
  { id: 6,  name: "Atiganda",   devanagari: "अतिगण्ड" },
  { id: 7,  name: "Sukarman",   devanagari: "सुकर्म" },
  { id: 8,  name: "Dhriti",     devanagari: "धृति" },
  { id: 9,  name: "Shoola",     devanagari: "शूल" },
  { id: 10, name: "Ganda",      devanagari: "गण्ड" },
  { id: 11, name: "Vriddhi",    devanagari: "वृद्धि" },
  { id: 12, name: "Dhruva",     devanagari: "ध्रुव" },
  { id: 13, name: "Vyaghata",   devanagari: "व्याघात" },
  { id: 14, name: "Harshana",   devanagari: "हर्षण" },
  { id: 15, name: "Vajra",      devanagari: "वज्र" },
  { id: 16, name: "Siddhi",     devanagari: "सिद्धि" },
  { id: 17, name: "Vyatipata",  devanagari: "व्यतीपात" },
  { id: 18, name: "Variyan",    devanagari: "वरीयान" },
  { id: 19, name: "Parigha",    devanagari: "परिघ" },
  { id: 20, name: "Shiva",      devanagari: "शिव" },
  { id: 21, name: "Siddha",     devanagari: "सिद्ध" },
  { id: 22, name: "Sadhya",     devanagari: "साध्य" },
  { id: 23, name: "Shubha",     devanagari: "शुभ" },
  { id: 24, name: "Shukla",     devanagari: "शुक्ल" },
  { id: 25, name: "Brahma",     devanagari: "ब्रह्म" },
  { id: 26, name: "Indra",      devanagari: "इन्द्र" },
  { id: 27, name: "Vaidhriti",  devanagari: "वैधृति" },
];

/** 11 Karanas (half-Tithis). Indices 0–3 are fixed; 4–10 repeat. */
const KARANAS_FIXED = [
  { name: "Kimstughna", devanagari: "किंस्तुघ्न" },  // Always 1st half of Shukla 1
];
const KARANAS_REPEATING = [
  { name: "Bava",     devanagari: "बव" },
  { name: "Balava",   devanagari: "बालव" },
  { name: "Kaulava",  devanagari: "कौलव" },
  { name: "Taitila",  devanagari: "तैतिल" },
  { name: "Gara",     devanagari: "गर" },
  { name: "Vanija",   devanagari: "वणिज" },
  { name: "Vishti",   devanagari: "विष्टि" },
];

/** Weekday names */
const VARA_NAMES = [
  { en: "Sunday",    hi: "रविवार", lord: "Sun",     lordHi: "सूर्य" },
  { en: "Monday",    hi: "सोमवार", lord: "Moon",    lordHi: "चन्द्र" },
  { en: "Tuesday",   hi: "मंगलवार", lord: "Mars",   lordHi: "मंगल" },
  { en: "Wednesday", hi: "बुधवार",  lord: "Mercury", lordHi: "बुध" },
  { en: "Thursday",  hi: "गुरुवार", lord: "Jupiter", lordHi: "गुरु" },
  { en: "Friday",    hi: "शुक्रवार", lord: "Venus", lordHi: "शुक्र" },
  { en: "Saturday",  hi: "शनिवार", lord: "Saturn",  lordHi: "शनि" },
];

/**
 * Rahu Kaal: fraction of day by weekday (Sun–Sat).
 * Each entry is [startFraction, endFraction] of daytime (0=sunrise, 1=sunset).
 * Traditional order: Sun=8th, Mon=2nd, Tue=7th, Wed=5th, Thu=6th, Fri=4th, Sat=3rd.
 */
const RAHU_KAAL_FRACTIONS = [
  [7/8, 8/8], // Sunday   (8th part)
  [1/8, 2/8], // Monday   (2nd part)
  [6/8, 7/8], // Tuesday  (7th part)
  [4/8, 5/8], // Wednesday(5th part)
  [5/8, 6/8], // Thursday (6th part)
  [3/8, 4/8], // Friday   (4th part)
  [2/8, 3/8], // Saturday (3rd part)
];

export const CHOGHADIYA_TYPES = {
  Amrit: { key: "Amrit", nameEn: "Amrit", nameHi: "अमृत", lord: "Moon", nature: "Best (अति शुभ)", quality: "good" },
  Shubh: { key: "Shubh", nameEn: "Shubh", nameHi: "शुभ", lord: "Jupiter", nature: "Auspicious (शुभ)", quality: "good" },
  Labh:  { key: "Labh",  nameEn: "Labh",  nameHi: "लाभ", lord: "Mercury", nature: "Gainful (लाभदायक)", quality: "good" },
  Char:  { key: "Char",  nameEn: "Char",  nameHi: "चर", lord: "Venus", nature: "Neutral / Motion (सामान्य)", quality: "neutral" },
  Rog:   { key: "Rog",   nameEn: "Rog",   nameHi: "रोग", lord: "Mars", nature: "Inauspicious (अशुभ)", quality: "bad" },
  Kaal:  { key: "Kaal",  nameEn: "Kaal",  nameHi: "काल", lord: "Saturn", nature: "Inauspicious (अशुभ)", quality: "bad" },
  Udveg: { key: "Udveg", nameEn: "Udveg", nameHi: "उद्वेग", lord: "Sun", nature: "Inauspicious (अशुभ)", quality: "bad" },
};

const DAY_CHOGHADIYA_ORDER = [
  ["Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg"], // Sun
  ["Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit"], // Mon
  ["Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog"],   // Tue
  ["Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh"],   // Wed
  ["Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh"], // Thu
  ["Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char"],   // Fri
  ["Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal"],   // Sat
];

const NIGHT_CHOGHADIYA_ORDER = [
  ["Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh"], // Sun
  ["Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char"],   // Mon
  ["Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal"],   // Tue
  ["Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg"], // Wed
  ["Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit"], // Thu
  ["Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char", "Rog"],   // Fri
  ["Labh", "Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh"],   // Sat
];

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

/**
 * Gets a sidereal longitude for Moon or Sun at a given AstroTime.
 * @param {"MOON"|"SUN"} body
 * @param {Object} astroTime - astronomy-engine AstroTime
 * @param {number} ayanamsa - degrees
 * @returns {number} sidereal longitude [0, 360)
 */
function getSiderealLongitude(body, astroTime, ayanamsa) {
  let tropLon;
  if (body === "SUN") {
    const pos = Astronomy.SunPosition(astroTime);
    tropLon = normalizeAngle(pos.elon);
  } else {
    const vec = Astronomy.GeoMoon(astroTime);
    const ecl = Astronomy.Ecliptic(vec);
    tropLon = normalizeAngle(ecl.elon);
  }
  return normalizeAngle(tropLon - ayanamsa);
}

/**
 * Computes sunrise and sunset for a date and location.
 * @param {Date} date - local date reference (mid-day UTC is fine)
 * @param {number} latitude
 * @param {number} longitude
 * @returns {{ sunrise: Date|null, sunset: Date|null }}
 */
function computeSunriseSunset(date, latitude, longitude) {
  try {
    const observer = new Astronomy.Observer(latitude, longitude, 0);
    const startTime = Astronomy.MakeTime(
      new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0))
    );

    const sunrise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, startTime, 1);
    const sunset  = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, startTime, 1);

    return {
      sunrise: sunrise ? sunrise.date : null,
      sunset:  sunset  ? sunset.date  : null,
    };
  } catch {
    return { sunrise: null, sunset: null };
  }
}

/**
 * Formats a Date to HH:MM in the given timezone offset (hours).
 */
function formatTimeInTz(date, tzOffsetHours) {
  if (!date) return null;
  const offsetMs = tzOffsetHours * 60 * 60 * 1000;
  const local = new Date(date.getTime() + offsetMs);
  const hh = String(local.getUTCHours()).padStart(2, "0");
  const mm = String(local.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// ---------------------------------------------------------------------------
// Individual Panchang element calculators
// ---------------------------------------------------------------------------

/**
 * Computes Tithi from Moon–Sun sidereal elongation.
 * @param {number} moonSid - sidereal Moon longitude
 * @param {number} sunSid  - sidereal Sun longitude
 * @returns {Object} Tithi info
 */
export function computeTithi(moonSid, sunSid) {
  const elongation = normalizeAngle(moonSid - sunSid);
  const tithiIndex = Math.floor(elongation / 12); // 0-based, 0=Shukla Pratipada
  const tithi = TITHIS[Math.min(tithiIndex, 29)];
  const degreeInTithi = elongation % 12;
  const fractionElapsed = degreeInTithi / 12;
  return { ...tithi, degreeInTithi: parseFloat(degreeInTithi.toFixed(4)), fractionElapsed: parseFloat(fractionElapsed.toFixed(4)), elongation: parseFloat(elongation.toFixed(4)) };
}

/**
 * Computes Yoga from (Moon + Sun) sidereal longitude sum.
 * Each Yoga = 13.333°
 * @param {number} moonSid
 * @param {number} sunSid
 * @returns {Object} Yoga info
 */
export function computeYoga(moonSid, sunSid) {
  const sum = normalizeAngle(moonSid + sunSid);
  const yogaIndex = Math.floor(sum / (360 / 27));
  const yoga = YOGAS[Math.min(yogaIndex, 26)];
  return { ...yoga };
}

/**
 * Computes Karana (half-Tithi).
 * @param {number} moonSid
 * @param {number} sunSid
 * @returns {Object} Karana info
 */
export function computeKarana(moonSid, sunSid) {
  const elongation = normalizeAngle(moonSid - sunSid);
  const halfTithiIndex = Math.floor(elongation / 6); // 0-based
  // halfTithiIndex 0 = Kimstughna (fixed, 1st half of Shukla 1)
  // halfTithiIndex 1..56 cycle through 7 repeating Karanas
  // halfTithiIndex 57,58,59 = Shakuni, Chatushpada, Naga (fixed)
  const FIXED_END = [
    { name: "Shakuni",     devanagari: "शकुनि" },
    { name: "Chatushpada", devanagari: "चतुष्पाद" },
    { name: "Naga",        devanagari: "नाग" },
  ];
  let karana;
  if (halfTithiIndex === 0) {
    karana = { name: "Kimstughna", devanagari: "किंस्तुघ्न" };
  } else if (halfTithiIndex >= 57) {
    karana = FIXED_END[Math.min(halfTithiIndex - 57, 2)];
  } else {
    const idx = (halfTithiIndex - 1) % 7;
    karana = KARANAS_REPEATING[idx];
  }
  return { ...karana };
}

/**
 * Computes Moon sign (Chandra Rashi) from sidereal Moon longitude.
 */
export function computeMoonSign(moonSid) {
  const signIndex = Math.floor(moonSid / 30);
  return ZODIAC_SIGNS[Math.min(signIndex, 11)];
}

/**
 * Computes Sun sign (Surya Rashi) from sidereal Sun longitude.
 */
export function computeSunSign(sunSid) {
  const signIndex = Math.floor(sunSid / 30);
  return ZODIAC_SIGNS[Math.min(signIndex, 11)];
}

/**
 * Computes Vara (weekday) from a UTC date.
 */
export function computeVara(date) {
  const dayOfWeek = date.getUTCDay(); // 0=Sun, 6=Sat
  return { ...VARA_NAMES[dayOfWeek], dayIndex: dayOfWeek };
}

/**
 * Computes Rahu Kaal time window based on sunrise/sunset and weekday.
 * @param {Date} sunrise
 * @param {Date} sunset
 * @param {number} weekdayIndex - 0=Sun, 6=Sat
 * @param {number} tzOffsetHours
 * @returns {{ start: Date, end: Date, startStr: string, endStr: string } | null}
 */
export function computeRahuKaal(sunrise, sunset, weekdayIndex, tzOffsetHours) {
  if (!sunrise || !sunset) return null;
  const dayDurationMs = sunset.getTime() - sunrise.getTime();
  if (dayDurationMs <= 0) return null;

  const [startFrac, endFrac] = RAHU_KAAL_FRACTIONS[weekdayIndex];
  const start = new Date(sunrise.getTime() + startFrac * dayDurationMs);
  const end   = new Date(sunrise.getTime() + endFrac   * dayDurationMs);

  return {
    start,
    end,
    startStr: formatTimeInTz(start, tzOffsetHours),
    endStr:   formatTimeInTz(end,   tzOffsetHours),
    tradition: "Vedic",
    description: "Inauspicious period governed by Rahu. Traditional Vedic almanac advises avoiding new important undertakings during this window.",
    descriptionHi: "राहुकाल — राहु ग्रह का अशुभ काल। पारंपरिक ज्योतिष में इस समय नए महत्वपूर्ण कार्य आरंभ करने से बचने की सलाह दी जाती है।",
  };
}

/**
 * Computes Day and Night Choghadiya intervals based on sunrise and sunset.
 * @param {Date} sunrise
 * @param {Date} sunset
 * @param {number} weekdayIndex - 0=Sun, 6=Sat
 * @param {number} tzOffsetHours
 * @param {Date} [now=new Date()]
 * @returns {{ day: Array, night: Array, current: Object|null }}
 */
export function computeChoghadiya(sunrise, sunset, weekdayIndex, tzOffsetHours, now = new Date()) {
  if (!sunrise || !sunset) return { day: [], night: [], current: null };

  const dayDurationMs = sunset.getTime() - sunrise.getTime();
  const slotDayMs = dayDurationMs / 8;
  const dayOrder = DAY_CHOGHADIYA_ORDER[weekdayIndex] || DAY_CHOGHADIYA_ORDER[0];

  const daySlots = [];
  let currentSlot = null;

  for (let i = 0; i < 8; i++) {
    const start = new Date(sunrise.getTime() + i * slotDayMs);
    const end   = new Date(sunrise.getTime() + (i + 1) * slotDayMs);
    const typeKey = dayOrder[i];
    const meta = CHOGHADIYA_TYPES[typeKey] || CHOGHADIYA_TYPES["Char"];
    const isActive = now >= start && now < end;

    const slotObj = {
      index: i + 1,
      type: typeKey,
      nameEn: meta.nameEn,
      nameHi: meta.nameHi,
      lord: meta.lord,
      nature: meta.nature,
      quality: meta.quality,
      startLocal: formatTimeInTz(start, tzOffsetHours),
      endLocal:   formatTimeInTz(end,   tzOffsetHours),
      startUtc:   start.toISOString(),
      endUtc:     end.toISOString(),
      startMs:    start.getTime(),
      endMs:      end.getTime(),
      isActive,
      isDay: true,
    };

    if (isActive) currentSlot = slotObj;
    daySlots.push(slotObj);
  }

  // Night Choghadiya (sunset to next sunrise ~ 24h - dayDuration)
  const nightDurationMs = (24 * 3600 * 1000) - dayDurationMs;
  const slotNightMs = nightDurationMs / 8;
  const nightOrder = NIGHT_CHOGHADIYA_ORDER[weekdayIndex] || NIGHT_CHOGHADIYA_ORDER[0];

  const nightSlots = [];
  for (let i = 0; i < 8; i++) {
    const start = new Date(sunset.getTime() + i * slotNightMs);
    const end   = new Date(sunset.getTime() + (i + 1) * slotNightMs);
    const typeKey = nightOrder[i];
    const meta = CHOGHADIYA_TYPES[typeKey] || CHOGHADIYA_TYPES["Char"];
    const isActive = now >= start && now < end;

    const slotObj = {
      index: i + 1,
      type: typeKey,
      nameEn: meta.nameEn,
      nameHi: meta.nameHi,
      lord: meta.lord,
      nature: meta.nature,
      quality: meta.quality,
      startLocal: formatTimeInTz(start, tzOffsetHours),
      endLocal:   formatTimeInTz(end,   tzOffsetHours),
      startUtc:   start.toISOString(),
      endUtc:     end.toISOString(),
      startMs:    start.getTime(),
      endMs:      end.getTime(),
      isActive,
      isDay: false,
    };

    if (isActive) currentSlot = slotObj;
    nightSlots.push(slotObj);
  }

  return {
    day: daySlots,
    night: nightSlots,
    current: currentSlot,
  };
}

/**
 * Classical Starting Ghatika for Amrit Kaal in each of the 27 Nakshatras (Brihat Samhita & Muhurta Chintamani)
 * (Index 0 = Ashwini, ..., Index 26 = Revati)
 */
export const NAKSHATRA_AMRIT_GHATIKAS = [
  42, 48, 54, 52, 38, 35, 54, 44, 56, 54,
  44, 48, 45, 45, 44, 44, 42, 44, 46, 44,
  45, 45, 44, 48, 44, 42, 54,
];

/**
 * Computes location-specific Abhijit Muhurta (8th daytime Muhurta centered around solar midday).
 *
 * @param {Date} sunrise
 * @param {Date} sunset
 * @param {number} weekdayIndex - 0=Sun, ..., 3=Wed, 6=Sat
 * @param {number} tzOffsetHours
 * @returns {Object|null}
 */
export function computeAbhijitMuhurta(sunrise, sunset, weekdayIndex, tzOffsetHours) {
  if (!sunrise || !sunset) return null;
  const dayDurationMs = sunset.getTime() - sunrise.getTime();
  if (dayDurationMs <= 0) return null;

  const muhurtaMs = dayDurationMs / 15; // 15 Muhurtas of daytime
  const start = new Date(sunrise.getTime() + 7 * muhurtaMs);
  const end = new Date(sunrise.getTime() + 8 * muhurtaMs);

  const isAuspicious = weekdayIndex !== 3; // On Wednesday, Abhijit has Budha-Abhijit restriction

  return {
    start,
    end,
    startLocal: formatTimeInTz(start, tzOffsetHours),
    endLocal: formatTimeInTz(end, tzOffsetHours),
    startUtc: start.toISOString(),
    endUtc: end.toISOString(),
    durationMinutes: Math.round(muhurtaMs / 60000),
    isAuspicious,
    status: isAuspicious ? "AUSPICIOUS" : "RESTRICTED_ON_WEDNESDAY",
    nameEn: "Abhijit Muhurta",
    nameHi: "अभिजित मुहूर्त",
    description: isAuspicious
      ? "Most auspicious daytime Muhurta; neutralizes all negative planetary afflictions for major ventures."
      : "On Wednesdays, Abhijit Muhurta is classically restricted due to planetary clash with Mercury.",
    descriptionHi: isAuspicious
      ? "सर्वोत्तम विजय मुहूर्त — सभी दोषों का शमन कर नवीन कार्यों के लिए परम कल्याणकारी।"
      : "बुधवार को अभिजित मुहूर्त का परिहार माना जाता है (बुध-अभिजित दोष)।",
  };
}

/**
 * Computes location-specific Brahma Muhurta (2 Muhurtas before sunrise, approx 96-48 min before dawn).
 *
 * @param {Date} sunrise
 * @param {Date} sunset
 * @param {number} tzOffsetHours
 * @returns {Object|null}
 */
export function computeBrahmaMuhurta(sunrise, sunset, tzOffsetHours) {
  if (!sunrise) return null;

  const start = new Date(sunrise.getTime() - 96 * 60 * 1000);
  const end = new Date(sunrise.getTime() - 48 * 60 * 1000);

  return {
    start,
    end,
    startLocal: formatTimeInTz(start, tzOffsetHours),
    endLocal: formatTimeInTz(end, tzOffsetHours),
    startUtc: start.toISOString(),
    endUtc: end.toISOString(),
    durationMinutes: 48,
    nameEn: "Brahma Muhurta",
    nameHi: "ब्रह्म मुहूर्त",
    description: "Sacred pre-dawn window for meditation, Pranayama, Vedic chanting, and intellectual study.",
    descriptionHi: "सूर्योदय से पूर्व का परम पावन काल — ध्यान, प्राणायाम, मंत्र जप व स्वाध्याय हेतु सर्वश्रेष्ठ।",
  };
}

/**
 * Computes Nakshatra-based Amrit Kaal (Amrit Ghati) for the day.
 *
 * @param {Object} nakshatraInfo - Output from getNakshatraAndPada
 * @param {Date} sunrise
 * @param {Date} sunset
 * @param {number} tzOffsetHours
 * @returns {Object|null}
 */
export function computeAmritKaal(nakshatraInfo, sunrise, sunset, tzOffsetHours) {
  if (!sunrise || !sunset || !nakshatraInfo?.nakshatra) return null;

  const nakshatraIndex = (nakshatraInfo.nakshatra.id - 1) % 27;
  const startGhatika = NAKSHATRA_AMRIT_GHATIKAS[nakshatraIndex] || 42;

  const ghatikaMs = 24 * 60 * 1000;
  const amritDurationMs = 4 * ghatikaMs; // 96 minutes

  const nakshatraFraction = nakshatraInfo.fractionElapsed || 0.5;
  const dayCycleMs = 24 * 3600 * 1000;
  const amritStartOffsetMs = ((startGhatika * ghatikaMs) + (nakshatraFraction * 6 * 3600 * 1000)) % dayCycleMs;
  const start = new Date(sunrise.getTime() + amritStartOffsetMs);
  const end = new Date(start.getTime() + amritDurationMs);

  return {
    start,
    end,
    startLocal: formatTimeInTz(start, tzOffsetHours),
    endLocal: formatTimeInTz(end, tzOffsetHours),
    startUtc: start.toISOString(),
    endUtc: end.toISOString(),
    durationMinutes: 96,
    nakshatraName: nakshatraInfo.nakshatra.name,
    startGhatika,
    nameEn: "Amrit Kaal",
    nameHi: "अमृत काल",
    description: "Sacred nectar timing window derived from the ruling Nakshatra; highly propitious for ceremonies, sanctifications, and starting auspicious deeds.",
    descriptionHi: "नक्षत्र-आधारित अमृत काल — मांगलिक अनुष्ठान, पूजा, व नवीन कार्यों हेतु अमृततुल्य फलदायी मुहूर्त।",
  };
}

/**
 * Computes Lucky Metrics for the day based on Weekday (Vara) and Moon Sign (Chandra Rashi).
 * @param {Object} vara
 * @param {Object} moonSign
 * @returns {Object}
 */
export function computeLuckyMetrics(vara, moonSign) {
  const LUCKY_CONFIG = {
    Sunday: {
      colorEn: "Ruby Red & Golden Yellow",
      colorHi: "लाल व स्वर्णिम पीला",
      colorHex: "#DC2626",
      number: "1 & 9",
      directionEn: "East",
      directionHi: "पूर्व",
      mantra: "ॐ सूर्याय नमः (Om Suryaya Namah)",
      gemstoneEn: "Ruby / Copper",
      gemstoneHi: "माणिक्य / तांबा",
    },
    Monday: {
      colorEn: "Pearl White & Silver",
      colorHi: "दूधिया सफेद व चांदी",
      colorHex: "#E2E8F0",
      number: "2 & 7",
      directionEn: "North-West",
      directionHi: "उत्तर-पश्चिम (वायव्य)",
      mantra: "ॐ सोमाय नमः (Om Somaya Namah)",
      gemstoneEn: "Pearl / Silver",
      gemstoneHi: "मोती / चांदी",
    },
    Tuesday: {
      colorEn: "Bright Coral & Saffron",
      colorHi: "मूंगा लाल व केसरिया",
      colorHex: "#EA580C",
      number: "9 & 3",
      directionEn: "South",
      directionHi: "दक्षिण",
      mantra: "ॐ भौमाय नमः (Om Bhaumaya Namah)",
      gemstoneEn: "Red Coral / Copper",
      gemstoneHi: "मूंगा / तांबा",
    },
    Wednesday: {
      colorEn: "Emerald Green & Mint",
      colorHi: "तोतिया हरा व हल्का हरा",
      colorHex: "#16A34A",
      number: "5 & 1",
      directionEn: "North",
      directionHi: "उत्तर",
      mantra: "ॐ बुधाय नमः (Om Budhaya Namah)",
      gemstoneEn: "Emerald / Bronze",
      gemstoneHi: "पन्ना / कांसा",
    },
    Thursday: {
      colorEn: "Bright Yellow & Gold",
      colorHi: "पीला व स्वर्णिम",
      colorHex: "#CA8A04",
      number: "3 & 7",
      directionEn: "North-East",
      directionHi: "उत्तर-पूर्व (ईशान)",
      mantra: "ॐ बृहस्पतये नमः (Om Brihaspataye Namah)",
      gemstoneEn: "Yellow Sapphire / Gold",
      gemstoneHi: "पुखराज / पीतल-सोना",
    },
    Friday: {
      colorEn: "Silk White & Sky Blue",
      colorHi: "सफेद व आसमानी",
      colorHex: "#38BDF8",
      number: "6 & 2",
      directionEn: "South-East",
      directionHi: "दक्षिण-पूर्व (आग्नेय)",
      mantra: "ॐ शुक्राय नमः (Om Shukraya Namah)",
      gemstoneEn: "Diamond / Silver",
      gemstoneHi: "हीरा / चांदी",
    },
    Saturday: {
      colorEn: "Navy Blue & Dark Slate",
      colorHi: "गहरा नीला व काला",
      colorHex: "#1E3A8A",
      number: "8 & 4",
      directionEn: "West",
      directionHi: "पश्चिम",
      mantra: "ॐ शनैश्चराय नमः (Om Shanaishcharaya Namah)",
      gemstoneEn: "Blue Sapphire / Iron",
      gemstoneHi: "नीलम / लोहा",
    },
  };

  const dayConfig = LUCKY_CONFIG[vara?.en] || LUCKY_CONFIG.Sunday;
  return {
    ...dayConfig,
    moonRashiName: moonSign?.name || "Aries",
    moonRashiSanskrit: moonSign?.sanskritName || "मेष",
  };
}

// ---------------------------------------------------------------------------
// Main Panchang computation
// ---------------------------------------------------------------------------

/**
 * Computes a complete Panchang for a given date and location.
 *
 * @param {Object} params
 * @param {string} params.date        - "YYYY-MM-DD" in local timezone
 * @param {number} params.latitude    - Geographic latitude
 * @param {number} params.longitude   - Geographic longitude
 * @param {number} params.tzOffset    - Timezone offset in hours (e.g. 5.5 for IST)
 * @param {string} params.timezone    - IANA timezone string (e.g. "Asia/Kolkata") — for display only
 * @returns {Object} Complete Panchang data
 */
export function computePanchang({ date, latitude, longitude, tzOffset, timezone }) {
  // Convert local date string to UTC date at local noon
  const [year, month, day] = date.split("-").map(Number);
  // Local noon in UTC
  const localNoonUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0) - tzOffset * 3600 * 1000);

  const astroTime = Astronomy.MakeTime(localNoonUTC);
  const ayanamsa = computeLahiriAyanamsa(astroTime);

  // 1. Planetary longitudes at local noon
  const moonSid = getSiderealLongitude("MOON", astroTime, ayanamsa);
  const sunSid  = getSiderealLongitude("SUN",  astroTime, ayanamsa);

  // 2. Panchang elements
  const tithi     = computeTithi(moonSid, sunSid);
  const nakshatra = getNakshatraAndPada(moonSid);
  const yoga      = computeYoga(moonSid, sunSid);
  const karana    = computeKarana(moonSid, sunSid);
  const moonSign  = computeMoonSign(moonSid);
  const sunSign   = computeSunSign(sunSid);

  // Use UTC date matching the local date for weekday (important near midnight boundaries)
  const localDate = new Date(Date.UTC(year, month - 1, day));
  const vara      = computeVara(localDate);

  // 3. Sunrise / Sunset
  const { sunrise, sunset } = computeSunriseSunset(localNoonUTC, latitude, longitude);

  // 4. Rahu Kaal
  const rahuKaal = computeRahuKaal(sunrise, sunset, vara.dayIndex, tzOffset);

  // 5. Day & Night Choghadiya intervals
  const choghadiya = computeChoghadiya(sunrise, sunset, vara.dayIndex, tzOffset);

  // 6. Auspicious Timing Windows (Abhijit, Brahma Muhurta, Amrit Kaal)
  const abhijitMuhurta = computeAbhijitMuhurta(sunrise, sunset, vara.dayIndex, tzOffset);
  const brahmaMuhurta = computeBrahmaMuhurta(sunrise, sunset, tzOffset);
  const amritKaal = computeAmritKaal(nakshatra, sunrise, sunset, tzOffset);

  // 7. Daily Lucky Metrics
  const luckyMetrics = computeLuckyMetrics(vara, moonSign);

  return {
    date,
    latitude,
    longitude,
    timezone,
    tzOffset,
    ayanamsa: parseFloat(ayanamsa.toFixed(4)),
    ayanamsaType: "Lahiri",
    calculationEngine: "astronomy-engine",
    calculatedAt: new Date().toISOString(),

    // Panchang elements
    tithi,
    nakshatra: {
      id: nakshatra.nakshatra.id,
      name: nakshatra.nakshatra.name,
      devanagari: nakshatra.nakshatra.devanagari,
      lord: nakshatra.nakshatra.lord,
      pada: nakshatra.pada,
      degreeInNakshatra: parseFloat(nakshatra.degreeInNakshatra.toFixed(4)),
    },
    yoga,
    karana,
    vara,

    // Planetary signs
    moonSign: {
      name: moonSign.name,
      sanskritName: moonSign.sanskritName,
      lord: moonSign.lord,
      siderealDegree: parseFloat(moonSid.toFixed(4)),
      degreeInSign: parseFloat((moonSid % 30).toFixed(4)),
    },
    sunSign: {
      name: sunSign.name,
      sanskritName: sunSign.sanskritName,
      lord: sunSign.lord,
      siderealDegree: parseFloat(sunSid.toFixed(4)),
      degreeInSign: parseFloat((sunSid % 30).toFixed(4)),
    },

    // Time windows
    sunrise: sunrise ? {
      utc: sunrise.toISOString(),
      local: formatTimeInTz(sunrise, tzOffset),
    } : null,
    sunset: sunset ? {
      utc: sunset.toISOString(),
      local: formatTimeInTz(sunset, tzOffset),
    } : null,
    rahuKaal: rahuKaal ? {
      startLocal: rahuKaal.startStr,
      endLocal:   rahuKaal.endStr,
      startUtc:   rahuKaal.start.toISOString(),
      endUtc:     rahuKaal.end.toISOString(),
      tradition:  rahuKaal.tradition,
      description: rahuKaal.description,
      descriptionHi: rahuKaal.descriptionHi,
    } : null,

    // Choghadiya & Lucky Metrics
    choghadiya,
    luckyMetrics,

    // Auspicious Timing Windows
    abhijitMuhurta,
    brahmaMuhurta,
    amritKaal,
  };
}
