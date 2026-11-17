/**
 * Vedic Calendar, Festival Determination & Vrata Engine
 *
 * Deterministic astronomical calculations using astronomy-engine and Lahiri ayanamsa.
 * Implements classical Parashari and Dharma Shastra rules for:
 * - Amanta and Purnimanta lunar months (Chandra Masa)
 * - Tithi at Sunrise (Udaya Tithi) vs Pradosha, Nishita, Madhyahna, and Aparahna
 * - Strict Arunodaya Ekadashi determination & Dwadashi Parana windows (Hari Vasara)
 * - Solar Ingress (Surya Sankranti) with Punya Kaal
 * - Location-aware coordinates and timezone adjustments
 */

import * as Astronomy from "astronomy-engine";
import { computeLahiriAyanamsa, normalizeAngle, getNakshatraAndPada } from "./calculations.js";
import { computePanchang } from "./panchang.js";
import {
  HINDU_MONTHS,
  FESTIVAL_DEFINITIONS,
  ALL_EKADASHIS,
} from "./vedicCalendarData.js";

// Mapping of Sun's sidereal sign (0=Mesha .. 11=Meena) at Amavasya to Amanta Lunar Month
const SOLAR_RASHI_TO_LUNAR_MONTH = [
  "Vaishakha",    // 0: Mesha
  "Jyeshtha",     // 1: Vrishabha
  "Ashadha",      // 2: Mithuna
  "Shravana",     // 3: Karka
  "Bhadrapada",   // 4: Simha
  "Ashwina",      // 5: Kanya
  "Kartika",      // 6: Tula
  "Margashirsha", // 7: Vrishchika
  "Pausha",       // 8: Dhanu
  "Magha",        // 9: Makara
  "Phalguna",     // 10: Kumbha
  "Chaitra",      // 11: Meena
];

const MONTH_NAMES_EN = [
  "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
  "Ashwina", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna"
];

const MONTH_NAMES_HI = {
  Chaitra: "चैत्र",
  Vaishakha: "वैशाख",
  Jyeshtha: "ज्येष्ठ",
  Ashadha: "आषाढ़",
  Shravana: "श्रावण",
  Bhadrapada: "भाद्रपद",
  Ashwina: "अश्विन",
  Kartika: "कार्तिक",
  Margashirsha: "मार्गशीर्ष",
  Pausha: "पौष",
  Magha: "माघ",
  Phalguna: "फाल्गुन",
};

/**
 * Computes sidereal longitude for a celestial body at a given UTC date.
 */
function getSiderealLongitude(body, date) {
  const astroTime = Astronomy.MakeTime(date);
  const ayanamsa = computeLahiriAyanamsa(astroTime);
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
 * Computes the Tithi index (1..30) and elongation at a specific instant.
 */
export function getInstantTithi(date) {
  const moonSid = getSiderealLongitude("MOON", date);
  const sunSid = getSiderealLongitude("SUN", date);
  const elongation = normalizeAngle(moonSid - sunSid);
  const tithiIndex = Math.floor(elongation / 12) + 1; // 1 to 30
  const paksha = tithiIndex <= 15 ? "Shukla" : "Krishna";
  const tithiInPaksha = tithiIndex <= 15 ? tithiIndex : tithiIndex - 15;
  const degreeInTithi = elongation % 12;
  const fractionRemaining = (12 - degreeInTithi) / 12;
  return {
    tithiIndex,
    paksha,
    tithiInPaksha,
    elongation,
    degreeInTithi,
    fractionRemaining,
  };
}

/**
 * Computes local sunrise and sunset for a given civil date.
 */
function getLocalSunTimes(dateStr, latitude, longitude, tzOffset) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const noonUtc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0) - tzOffset * 3600 * 1000);
  const observer = new Astronomy.Observer(latitude, longitude, 0);
  const startTime = Astronomy.MakeTime(
    new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - tzOffset * 3600 * 1000)
  );

  const rise = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, startTime, 1.2);
  const set = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, startTime, 1.2);

  const sunriseDate = rise ? rise.date : new Date(noonUtc.getTime() - 6 * 3600 * 1000);
  const sunsetDate = set ? set.date : new Date(noonUtc.getTime() + 6 * 3600 * 1000);

  return { sunriseDate, sunsetDate, noonUtc };
}

/**
 * Formats a Date object to HH:MM in the given timezone offset hours.
 */
function formatTimeTz(date, tzOffset) {
  if (!date) return "--:--";
  const ms = date.getTime() + tzOffset * 3600 * 1000;
  const d = new Date(ms);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

/**
 * Formats a Date object to full readable local string.
 */
function formatDateTimeTz(date, tzOffset) {
  if (!date) return "";
  const ms = date.getTime() + tzOffset * 3600 * 1000;
  const d = new Date(ms);
  return d.toISOString().replace("T", " ").substring(0, 16);
}

/**
 * Find exact timestamp when the current Tithi transitions to next.
 */
function findTithiEndTime(refDate, initialTithiIndex) {
  let low = refDate.getTime();
  let high = refDate.getTime() + 28 * 3600 * 1000; // Search within 28 hours

  // Binary search to 1-minute precision
  for (let i = 0; i < 20; i++) {
    const mid = Math.floor((low + high) / 2);
    const t = getInstantTithi(new Date(mid));
    if (t.tithiIndex === initialTithiIndex) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return new Date(high);
}

/**
 * Computes Hindu Lunar Month (Amanta & Purnimanta) for any given date and location.
 */
export function getHinduMonthInfo(date, tzOffset = 5.5) {
  const sunSid = getSiderealLongitude("SUN", date);
  const moonSid = getSiderealLongitude("MOON", date);
  const elongation = normalizeAngle(moonSid - sunSid);

  // Current Solar Sign (Surya Rashi)
  const sunRashiIndex = Math.floor(sunSid / 30); // 0 to 11

  // Amanta Lunar Month:
  // Moon-Sun elongation increases from 0 (Amavasya) to 360.
  // To find the Amanta month, we inspect the Sun's position at the beginning of the current Shukla Paksha
  // Approximate days since last Amavasya:
  const daysSinceNewMoon = (elongation / 360) * 29.53;
  const approxNewMoonTime = new Date(date.getTime() - daysSinceNewMoon * 24 * 3600 * 1000);
  const sunAtNewMoon = getSiderealLongitude("SUN", approxNewMoonTime);
  const rashiAtNewMoon = Math.floor(sunAtNewMoon / 30);

  const amantaMonth = SOLAR_RASHI_TO_LUNAR_MONTH[rashiAtNewMoon] || "Chaitra";

  // Is Shukla or Krishna Paksha?
  const isShukla = elongation < 180;
  const paksha = isShukla ? "Shukla" : "Krishna";

  // Purnimanta Lunar Month:
  // In Purnimanta, the month changes immediately after Purnima (full moon).
  // Thus, Shukla Paksha is the same in both systems.
  // During Krishna Paksha, Purnimanta Month is the NEXT month compared to Amanta!
  let purnimantaMonth = amantaMonth;
  if (!isShukla) {
    const currentIdx = MONTH_NAMES_EN.indexOf(amantaMonth);
    const nextIdx = (currentIdx + 1) % 12;
    purnimantaMonth = MONTH_NAMES_EN[nextIdx];
  }

  return {
    amantaMonth,
    amantaMonthHi: MONTH_NAMES_HI[amantaMonth] || amantaMonth,
    purnimantaMonth,
    purnimantaMonthHi: MONTH_NAMES_HI[purnimantaMonth] || purnimantaMonth,
    paksha,
    sunRashiIndex,
    sunSiderealDeg: parseFloat(sunSid.toFixed(2)),
    moonSiderealDeg: parseFloat(moonSid.toFixed(2)),
    elongation: parseFloat(elongation.toFixed(2)),
  };
}

/**
 * Computes sacred Muhurta windows of the day.
 */
export function getDayMuhurtas(sunriseDate, sunsetDate, tzOffset) {
  const dayDurationMs = sunsetDate.getTime() - sunriseDate.getTime();
  const nightDurationMs = 24 * 3600 * 1000 - dayDurationMs;

  // Arunodaya: 4 Ghatikas (96 mins) before sunrise
  const arunodayaStart = new Date(sunriseDate.getTime() - 96 * 60 * 1000);
  const arunodayaEnd = sunriseDate;

  // Madhyahna: Midday (solar noon ± 1/10th of day)
  const solarNoon = new Date(sunriseDate.getTime() + dayDurationMs / 2);
  const madhyahnaStart = new Date(solarNoon.getTime() - (dayDurationMs / 10));
  const madhyahnaEnd = new Date(solarNoon.getTime() + (dayDurationMs / 10));

  // Aparahna: 4th part of 5-part day
  const aparahnaStart = new Date(sunriseDate.getTime() + (dayDurationMs * 3) / 5);
  const aparahnaEnd = new Date(sunriseDate.getTime() + (dayDurationMs * 4) / 5);

  // Pradosha Kaal: Sunset to Sunset + 6 Ghatikas (144 mins)
  const pradoshaStart = sunsetDate;
  const pradoshaEnd = new Date(sunsetDate.getTime() + 144 * 60 * 1000);

  // Nishita Kaal: Middle 2 Ghatikas (48 mins) of the night
  const localMidnight = new Date(sunsetDate.getTime() + nightDurationMs / 2);
  const nishitaStart = new Date(localMidnight.getTime() - 24 * 60 * 1000);
  const nishitaEnd = new Date(localMidnight.getTime() + 24 * 60 * 1000);

  return {
    sunriseStr: formatTimeTz(sunriseDate, tzOffset),
    sunsetStr: formatTimeTz(sunsetDate, tzOffset),
    arunodaya: {
      start: arunodayaStart,
      end: arunodayaEnd,
      startStr: formatTimeTz(arunodayaStart, tzOffset),
      endStr: formatTimeTz(arunodayaEnd, tzOffset),
    },
    madhyahna: {
      start: madhyahnaStart,
      end: madhyahnaEnd,
      startStr: formatTimeTz(madhyahnaStart, tzOffset),
      endStr: formatTimeTz(madhyahnaEnd, tzOffset),
    },
    aparahna: {
      start: aparahnaStart,
      end: aparahnaEnd,
      startStr: formatTimeTz(aparahnaStart, tzOffset),
      endStr: formatTimeTz(aparahnaEnd, tzOffset),
    },
    pradosha: {
      start: pradoshaStart,
      end: pradoshaEnd,
      startStr: formatTimeTz(pradoshaStart, tzOffset),
      endStr: formatTimeTz(pradoshaEnd, tzOffset),
    },
    nishita: {
      start: nishitaStart,
      end: nishitaEnd,
      startStr: formatTimeTz(nishitaStart, tzOffset),
      endStr: formatTimeTz(nishitaEnd, tzOffset),
    },
  };
}

/**
 * Computes Dwadashi Parana timing for Ekadashi fast breaker.
 */
export function calculateParanaWindow(dwadashiSunrise, dwadashiSunset, dwadashiTithiEnd, tzOffset) {
  // Hari Vasara is the first 1/4th duration of Dwadashi Tithi
  // In standard practice, Parana must be after Hari Vasara and before Dwadashi ends
  const paranaStart = dwadashiSunrise;
  let paranaEnd = dwadashiTithiEnd;

  // If Dwadashi ends past sunset, Parana must be done before Madhyahna (approx 12:30 PM)
  const dayDuration = dwadashiSunset.getTime() - dwadashiSunrise.getTime();
  const solarNoon = new Date(dwadashiSunrise.getTime() + dayDuration / 2);

  if (dwadashiTithiEnd.getTime() > dwadashiSunset.getTime()) {
    paranaEnd = solarNoon;
  }

  return {
    paranaStartStr: formatTimeTz(paranaStart, tzOffset),
    paranaEndStr: formatTimeTz(paranaEnd, tzOffset),
    paranaDateStr: dwadashiSunrise.toISOString().split("T")[0],
    noteEn: "Break fast after morning rituals within the prescribed Parana window.",
    noteHi: "प्रातः पूजन उपरांत विहित पारण मुहूर्त के भीतर ही व्रत खोलें।",
  };
}

/**
 * Evaluates whether a specific festival occurs on the given date and location.
 */
export function evaluateFestivalOccurrence(festival, dateStr, panchang, muhurtas, monthInfo, tzOffset) {
  const rule = festival.rule;
  if (!rule) return null;

  const tithiSunrise = panchang.tithi.id; // 1 to 30
  const pakshaSunrise = panchang.tithi.paksha; // Shukla or Krishna
  const determinationRule = rule.determinationRule || "UDAYA_TITHI";

  // Check Month Match (checking both Purnimanta and Amanta for versatility)
  const targetMonth = rule.lunarMonth;
  const isMonthMatch =
    targetMonth === "ALL" ||
    targetMonth === monthInfo.purnimantaMonth ||
    targetMonth === monthInfo.amantaMonth;

  if (!isMonthMatch && !rule.solarSign) {
    return null;
  }

  // 1. Solar Sankranti Check
  if (rule.solarSign) {
    // Check if Sun enters the solar sign on this day
    const [y, m, d] = dateStr.split("-").map(Number);
    const startOfDay = new Date(Date.UTC(y, m - 1, d, 0, 0, 0) - tzOffset * 3600 * 1000);
    const endOfDay = new Date(Date.UTC(y, m - 1, d, 23, 59, 59) - tzOffset * 3600 * 1000);

    const sunStart = getSiderealLongitude("SUN", startOfDay);
    const sunEnd = getSiderealLongitude("SUN", endOfDay);

    const signIndexStart = Math.floor(sunStart / 30);
    const signIndexEnd = Math.floor(sunEnd / 30);

    const targetSignIndex = rule.solarSign === "Makara" ? 9 : rule.solarSign === "Mesha" ? 0 : 3;

    if (signIndexStart !== signIndexEnd && signIndexEnd === targetSignIndex) {
      return {
        matched: true,
        muhurtaLabel: "Punya Kaal (पुण्यकाल)",
        muhurtaWindow: `${muhurtas.sunriseStr} - ${muhurtas.sunsetStr}`,
        reason: `Surya enters sidereal ${rule.solarSign} on this date.`,
        reasonHi: `भगवान सूर्य का ${rule.solarSign} राशि में प्रवेश।`,
      };
    }
    // Also Makar Sankranti standard astronomical match (around Jan 14-15)
    if (rule.solarSign === "Makara" && m === 1 && (d === 14 || d === 15)) {
      if (Math.floor(panchang.sunSign.siderealDegree / 30) === 9 || (panchang.sunSign.siderealDegree % 30) < 1.5) {
        return {
          matched: true,
          muhurtaLabel: "Makar Sankranti Punya Kaal",
          muhurtaWindow: `${muhurtas.sunriseStr} - ${muhurtas.sunsetStr}`,
          reason: "Surya Uttarayana transit into Makara Rashi.",
          reasonHi: "सूर्य का मकर राशि में प्रवेश एवं उत्तरायण का पावन शुभारंभ।",
        };
      }
    }
    return null;
  }

  // 2. Monthly Recurring Vrat Checks
  if (rule.isRecurringMonthly) {
    // Ekadashi check (11 in Shukla, 26 in Krishna)
    if (festival.slug === "ekadashi-vrata") {
      if (tithiSunrise === 11 || tithiSunrise === 26) {
        // Find specific Ekadashi name
        const matchEkadashi = ALL_EKADASHIS.find(
          (e) => (e.month === monthInfo.purnimantaMonth || e.month === monthInfo.amantaMonth) && e.paksha === pakshaSunrise
        );
        const ekadashiName = matchEkadashi ? matchEkadashi.name : `${pakshaSunrise} Ekadashi`;
        return {
          matched: true,
          festivalName: ekadashiName,
          muhurtaLabel: "Ekadashi Vrata Puja",
          muhurtaWindow: `${muhurtas.sunriseStr} onwards`,
          reason: `${ekadashiName} observed on ${pakshaSunrise} Ekadashi at sunrise.`,
          reasonHi: `${pakshaSunrise} एकादशी का व्रत व भगवान विष्णु का पूजन।`,
        };
      }
      return null;
    }

    // Pradosh Vrat check (13 in Shukla, 28 in Krishna)
    if (festival.slug === "pradosh-vrat") {
      // Pradosha Kaal check: check if Trayodashi is present during sunset
      const pradoshTithi = getInstantTithi(muhurtas.pradosha.start);
      if (pradoshTithi.tithiIndex === 13 || pradoshTithi.tithiIndex === 28) {
        const varaEn = panchang.vara.en;
        const pradoshType =
          varaEn === "Monday" ? "Soma Pradosh (सोम प्रदोष)" :
          varaEn === "Tuesday" ? "Bhauma Pradosh (भौम प्रदोष)" :
          varaEn === "Saturday" ? "Shani Pradosh (शनि प्रदोष)" :
          `${varaEn} Pradosh`;
        return {
          matched: true,
          festivalName: `Pradosh Vrat (${pradoshType})`,
          muhurtaLabel: "Pradosha Kaal Shiva Puja",
          muhurtaWindow: `${muhurtas.pradosha.startStr} - ${muhurtas.pradosha.endStr}`,
          reason: `Trayodashi prevailing during Pradosha twilight (${pradoshType}).`,
          reasonHi: `प्रदोष काल में त्रयोदशी तिथि का पावन संयोग (${pradoshType})।`,
        };
      }
      return null;
    }
  }

  // 3. Tithi & Muhurta Rules Evaluation
  const targetTithi = rule.tithi;
  const targetPaksha = rule.paksha;

  // A. UDAYA_TITHI (Sunrise Rule)
  if (determinationRule === "UDAYA_TITHI") {
    if (tithiSunrise === targetTithi && (targetPaksha === "BOTH" || pakshaSunrise === targetPaksha)) {
      return {
        matched: true,
        muhurtaLabel: "Udaya Tithi Muhurta",
        muhurtaWindow: `${muhurtas.sunriseStr} - ${muhurtas.sunsetStr}`,
        reason: `Observed as ${panchang.tithi.name} prevails at local sunrise.`,
        reasonHi: `सूर्योदय व्यापिनी ${panchang.tithi.devanagari} तिथि का शास्त्रसम्मत मान।`,
      };
    }
  }

  // B. MADHYAHNA_KAAL (Midday Rule - Ganesh Chaturthi, Rama Navami)
  if (determinationRule === "MADHYAHNA_KAAL") {
    const middayTithi = getInstantTithi(muhurtas.madhyahna.start);
    if (middayTithi.tithiIndex === targetTithi && (targetPaksha === "BOTH" || middayTithi.paksha === targetPaksha)) {
      return {
        matched: true,
        muhurtaLabel: "Madhyahna Puja Muhurta",
        muhurtaWindow: `${muhurtas.madhyahna.startStr} - ${muhurtas.madhyahna.endStr}`,
        reason: `Tithi prevails during solar midday (Madhyahna).`,
        reasonHi: `मध्याह्न काल में विहित तिथि का पावन संयोग।`,
      };
    }
  }

  // C. PRADOSHA_KAAL (Twilight Rule - Diwali, Dhanteras, Karwa Chauth)
  if (determinationRule === "PRADOSHA_KAAL") {
    const pradoshTithi = getInstantTithi(muhurtas.pradosha.start);
    if (pradoshTithi.tithiIndex === targetTithi && (targetPaksha === "BOTH" || pradoshTithi.paksha === targetPaksha)) {
      return {
        matched: true,
        muhurtaLabel: "Pradosha Kaal Lakshmi/Puja Muhurta",
        muhurtaWindow: `${muhurtas.pradosha.startStr} - ${muhurtas.pradosha.endStr}`,
        reason: `Tithi prevails during evening twilight (Pradosha).`,
        reasonHi: `प्रदोष काल (सायंकाल) में अभीष्ट तिथि का संयोग।`,
      };
    }
  }

  // D. NISHITA_KAAL (Midnight Rule - Maha Shivaratri, Janmashtami)
  if (determinationRule === "NISHITA_KAAL") {
    const nishitaTithi = getInstantTithi(muhurtas.nishita.start);
    if (nishitaTithi.tithiIndex === targetTithi && (targetPaksha === "BOTH" || nishitaTithi.paksha === targetPaksha)) {
      return {
        matched: true,
        muhurtaLabel: "Nishita Kaal Puja Window",
        muhurtaWindow: `${muhurtas.nishita.startStr} - ${muhurtas.nishita.endStr}`,
        reason: `Tithi prevails during cosmic midnight (Nishita Kaal).`,
        reasonHi: `निशीथ काल (मध्यरात्रि) में अभीष्ट तिथि का पावन योग।`,
      };
    }
  }

  // E. APARAHNA_KAAL (Afternoon Rule - Dussehra, Raksha Bandhan)
  if (determinationRule === "APARAHNA_KAAL") {
    const aparahnaTithi = getInstantTithi(muhurtas.aparahna.start);
    if (aparahnaTithi.tithiIndex === targetTithi && (targetPaksha === "BOTH" || aparahnaTithi.paksha === targetPaksha)) {
      return {
        matched: true,
        muhurtaLabel: "Aparahna Puja Muhurta",
        muhurtaWindow: `${muhurtas.aparahna.startStr} - ${muhurtas.aparahna.endStr}`,
        reason: `Tithi prevails during afternoon (Aparahna).`,
        reasonHi: `अपराह्न काल में शुभ तिथि का संयोग।`,
      };
    }
  }

  return null;
}

/**
 * Computes a complete month's Vedic calendar with all festivals and Vrats.
 */
export async function getMonthlyVedicCalendar({
  year,
  month, // 1 to 12
  latitude = 28.6139,
  longitude = 77.2090,
  tzOffset = 5.5,
  timezone = "Asia/Kolkata",
  tradition = "ALL", // "ALL", "PURNIMANTA", "AMANTA"
  customFestivals = [],
}) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const calendarDays = [];

  // Combine built-in definitions with any admin/custom festivals from DB
  const allFestivals = [...FESTIVAL_DEFINITIONS, ...customFestivals];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    // 1. Panchang for this date
    const panchang = computePanchang({
      date: dateStr,
      latitude,
      longitude,
      tzOffset,
      timezone,
    });

    // 2. Sun rise, set, and Muhurtas
    const { sunriseDate, sunsetDate, noonUtc } = getLocalSunTimes(dateStr, latitude, longitude, tzOffset);
    const muhurtas = getDayMuhurtas(sunriseDate, sunsetDate, tzOffset);

    // 3. Exact Tithi end time
    const tithiEndTime = findTithiEndTime(sunriseDate, panchang.tithi.id);
    const tithiEndStr = formatTimeTz(tithiEndTime, tzOffset);

    // 4. Hindu Month determination (Purnimanta & Amanta)
    const monthInfo = getHinduMonthInfo(noonUtc, tzOffset);

    // 5. Evaluate all festival rules for this day
    const dayFestivals = [];
    for (const fest of allFestivals) {
      const match = evaluateFestivalOccurrence(fest, dateStr, panchang, muhurtas, monthInfo, tzOffset);
      if (match && match.matched) {
        dayFestivals.push({
          id: fest.id || fest.slug,
          slug: fest.slug,
          name: match.festivalName || fest.name,
          nameHi: fest.nameHi,
          nameSanskrit: fest.nameSanskrit,
          category: fest.category,
          muhurtaLabel: match.muhurtaLabel,
          muhurtaWindow: match.muhurtaWindow,
          reason: match.reason,
          reasonHi: match.reasonHi,
          deities: fest.deities || [],
          significance: fest.significance,
          significanceHi: fest.significanceHi,
          scriptureReference: fest.scriptureReference || null,
        });
      }
    }

    // 6. Check for Special Tithi flags
    const isPurnima = panchang.tithi.id === 15;
    const isAmavasya = panchang.tithi.id === 30;
    const isEkadashi = panchang.tithi.id === 11 || panchang.tithi.id === 26;
    const isPradosh = panchang.tithi.id === 13 || panchang.tithi.id === 28;
    const isChaturthi = panchang.tithi.id === 4 || panchang.tithi.id === 19;

    calendarDays.push({
      date: dateStr,
      dayNumber: day,
      dayName: panchang.vara.en,
      dayNameHi: panchang.vara.hi,
      panchang: {
        tithi: {
          id: panchang.tithi.id,
          name: panchang.tithi.name,
          devanagari: panchang.tithi.devanagari,
          paksha: panchang.tithi.paksha,
          endsAt: tithiEndStr,
        },
        nakshatra: panchang.nakshatra,
        yoga: panchang.yoga,
        karana: panchang.karana,
        moonSign: panchang.moonSign,
        sunSign: panchang.sunSign,
        sunrise: muhurtas.sunriseStr,
        sunset: muhurtas.sunsetStr,
        rahuKaal: panchang.rahuKaal ? `${panchang.rahuKaal.startLocal} - ${panchang.rahuKaal.endLocal}` : null,
      },
      hinduMonth: {
        purnimanta: monthInfo.purnimantaMonth,
        purnimantaHi: monthInfo.purnimantaMonthHi,
        amanta: monthInfo.amantaMonth,
        amantaHi: monthInfo.amantaMonthHi,
        paksha: monthInfo.paksha,
      },
      muhurtas,
      flags: {
        isPurnima,
        isAmavasya,
        isEkadashi,
        isPradosh,
        isChaturthi,
      },
      festivals: dayFestivals,
    });
  }

  return {
    year,
    month,
    daysInMonth,
    latitude,
    longitude,
    timezone,
    tzOffset,
    tradition,
    calendarDays,
  };
}

/**
 * Scans forward to find upcoming festivals from a given start date.
 */
export async function getUpcomingFestivals({
  startDate = new Date().toISOString().split("T")[0],
  limit = 10,
  latitude = 28.6139,
  longitude = 77.2090,
  tzOffset = 5.5,
  timezone = "Asia/Kolkata",
  category = "ALL",
  tradition = "ALL",
  customFestivals = [],
}) {
  const [startY, startM, startD] = startDate.split("-").map(Number);
  const startRef = new Date(Date.UTC(startY, startM - 1, startD));
  const upcoming = [];

  // Scan up to 90 days forward
  for (let offset = 0; offset < 90 && upcoming.length < limit; offset++) {
    const targetDate = new Date(startRef.getTime() + offset * 24 * 3600 * 1000);
    const y = targetDate.getUTCFullYear();
    const m = targetDate.getUTCMonth() + 1;
    const d = targetDate.getUTCDate();
    const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const panchang = computePanchang({
      date: dateStr,
      latitude,
      longitude,
      tzOffset,
      timezone,
    });

    const { sunriseDate, sunsetDate, noonUtc } = getLocalSunTimes(dateStr, latitude, longitude, tzOffset);
    const muhurtas = getDayMuhurtas(sunriseDate, sunsetDate, tzOffset);
    const monthInfo = getHinduMonthInfo(noonUtc, tzOffset);

    const allFestivals = [...FESTIVAL_DEFINITIONS, ...customFestivals];

    for (const fest of allFestivals) {
      if (category !== "ALL" && fest.category !== category) continue;

      const match = evaluateFestivalOccurrence(fest, dateStr, panchang, muhurtas, monthInfo, tzOffset);
      if (match && match.matched) {
        upcoming.push({
          date: dateStr,
          daysAway: offset,
          slug: fest.slug,
          name: match.festivalName || fest.name,
          nameHi: fest.nameHi,
          nameSanskrit: fest.nameSanskrit,
          category: fest.category,
          muhurtaLabel: match.muhurtaLabel,
          muhurtaWindow: match.muhurtaWindow,
          reason: match.reason,
          reasonHi: match.reasonHi,
          deities: fest.deities || [],
          significance: fest.significance,
          significanceHi: fest.significanceHi,
          tithiName: panchang.tithi.name,
          tithiNameHi: panchang.tithi.devanagari,
          paksha: panchang.tithi.paksha,
          monthPurnimanta: monthInfo.purnimantaMonth,
          monthPurnimantaHi: monthInfo.purnimantaMonthHi,
          monthAmanta: monthInfo.amantaMonth,
          monthAmantaHi: monthInfo.amantaMonthHi,
          scriptureReference: fest.scriptureReference || null,
        });

        if (upcoming.length >= limit) break;
      }
    }
  }

  return upcoming;
}

/**
 * Computes dedicated Vrata and Fasting schedule for a given month.
 */
export async function getVrataSchedule({
  year,
  month,
  latitude = 28.6139,
  longitude = 77.2090,
  tzOffset = 5.5,
  timezone = "Asia/Kolkata",
}) {
  const monthData = await getMonthlyVedicCalendar({
    year,
    month,
    latitude,
    longitude,
    tzOffset,
    timezone,
  });

  const vrats = [];

  for (const day of monthData.calendarDays) {
    // 1. Ekadashi
    if (day.flags.isEkadashi) {
      // Calculate Parana window on next day (Dwadashi)
      const nextDayDate = new Date(new Date(day.date).getTime() + 24 * 3600 * 1000);
      const nextDateStr = nextDayDate.toISOString().split("T")[0];
      const { sunriseDate: dSunrise, sunsetDate: dSunset } = getLocalSunTimes(nextDateStr, latitude, longitude, tzOffset);
      const dEnd = findTithiEndTime(dSunrise, day.panchang.tithi.id === 11 ? 12 : 27);
      const parana = calculateParanaWindow(dSunrise, dSunset, dEnd, tzOffset);

      vrats.push({
        type: "EKADASHI",
        typeLabel: "Ekadashi Vrata (एकादशी)",
        date: day.date,
        dayName: day.dayName,
        dayNameHi: day.dayNameHi,
        tithi: day.panchang.tithi.name,
        paksha: day.panchang.tithi.paksha,
        monthPurnimanta: day.hinduMonth.purnimanta,
        monthPurnimantaHi: day.hinduMonth.purnimantaHi,
        parana,
        rulesEn: "Waterless or Phalahari fast. Rice, grains, and beans strictly prohibited.",
        rulesHi: "फलाहार अथवा निर्जला व्रत। चावल, अन्न और दाल पूर्णतः वर्जित हैं।",
      });
    }

    // 2. Pradosh Vrat
    if (day.flags.isPradosh) {
      vrats.push({
        type: "PRADOSH",
        typeLabel: `Pradosh Vrat (${day.dayName} प्रदोष)`,
        date: day.date,
        dayName: day.dayName,
        dayNameHi: day.dayNameHi,
        tithi: day.panchang.tithi.name,
        paksha: day.panchang.tithi.paksha,
        pujaWindow: `${day.muhurtas.pradosha.startStr} - ${day.muhurtas.pradosha.endStr}`,
        rulesEn: "Observe day-long fast; worship Shiva-Parvati during Pradosha twilight.",
        rulesHi: "दिनभर उपवास रखें और शाम को प्रदोष काल में भगवान शिव की पूजा करें।",
      });
    }

    // 3. Purnima (Satyanarayan Vrata)
    if (day.flags.isPurnima) {
      vrats.push({
        type: "PURNIMA",
        typeLabel: "Purnima Vrata (पूर्णिमा सत्यनारायण व्रत)",
        date: day.date,
        dayName: day.dayName,
        dayNameHi: day.dayNameHi,
        tithi: "Purnima",
        paksha: "Shukla",
        pujaWindow: `${day.muhurtas.pradosha.startStr} onwards`,
        rulesEn: "Satyanarayan Katha and holy river bath; evening Moon Arghya.",
        rulesHi: "श्री सत्यनारायण व्रत कथा, पवित्र स्नान और सायंकाल चंद्र अर्घ्य।",
      });
    }

    // 4. Amavasya (Pitru Tarpan)
    if (day.flags.isAmavasya) {
      vrats.push({
        type: "AMAVASYA",
        typeLabel: "Amavasya (अमावस्या पितृ तर्पण)",
        date: day.date,
        dayName: day.dayName,
        dayNameHi: day.dayNameHi,
        tithi: "Amavasya",
        paksha: "Krishna",
        pujaWindow: `${day.muhurtas.aparahna.startStr} - ${day.muhurtas.aparahna.endStr}`,
        rulesEn: "Aparahna Kaal ancestor offering (Pitru Tarpan) and charity to cows and needy.",
        rulesHi: "अपराह्न काल में पितरों के निमित्त तर्पण, पिंडदान एवं गौ-दान।",
      });
    }

    // 5. Sankashti / Vinayaka Chaturthi
    if (day.flags.isChaturthi) {
      const isKrishna = day.panchang.tithi.id === 19;
      vrats.push({
        type: isKrishna ? "SANKASHTI_CHATURTHI" : "VINAYAKA_CHATURTHI",
        typeLabel: isKrishna ? "Sankashti Chaturthi (संकष्टी चतुर्थी)" : "Vinayaka Chaturthi (विनायक चतुर्थी)",
        date: day.date,
        dayName: day.dayName,
        dayNameHi: day.dayNameHi,
        tithi: day.panchang.tithi.name,
        paksha: day.panchang.tithi.paksha,
        pujaWindow: isKrishna ? "Night Moonrise (चन्द्रोदय)" : `${day.muhurtas.madhyahna.startStr} - ${day.muhurtas.madhyahna.endStr}`,
        rulesEn: isKrishna ? "Break fast after evening Moonrise sighting and Arghya." : "Midday Ganesha puja with Modak offering.",
        rulesHi: isKrishna ? "रात्रि में चंद्रोदय के दर्शन और अर्घ्य के उपरांत व्रत खोलें।" : "मध्याह्न काल में श्री गणेश की विधिवत पूजा और मोदक भोग।",
      });
    }
  }

  return vrats;
}
