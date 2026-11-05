/**
 * Deterministic Vedic Astrology Calculation Service
 * 
 * Powered by high-precision astronomy algorithms (Lahiri Ayanamsa, 
 * sidereal planetary coordinates, Lagna, 12 Bhavas, Nakshatra, Pada, Vimshottari Dasha).
 */

import * as Astronomy from "astronomy-engine";
import {
  AYANAMSA_TYPE,
  ZODIAC_SIGNS,
  NAKSHATRAS,
  PLANETS,
  VIMSHOTTARI_DASHA_CYCLE,
  HOUSES,
} from "./constants.js";

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

/**
 * Normalizes an angle to [0, 360) degrees.
 */
export function normalizeAngle(deg) {
  let val = deg % 360;
  if (val < 0) val += 360;
  return val;
}

/**
 * Computes official Indian Government Lahiri (Chitra Paksha) Ayanamsa for an astronomical time.
 * 
 * @param {Object} astroTime - Astronomy-engine AstroTime instance
 * @returns {number} Ayanamsa in degrees
 */
export function computeLahiriAyanamsa(astroTime) {
  // Julian Day
  const jd = astroTime.ut + 2451545.0; // ut is days from J2000.0 (JD 2451545.0)
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries from J2000.0

  // Standard Lahiri Ayanamsa formula
  // Base at J2000.0 is 23° 51' 25.53" = 23.857088°
  // Precession rate ~ 50.29" per year = 1.396042° per century
  const ayanamsa = 23.857088 + 1.396042 * T + 0.000308 * T * T;
  return ayanamsa;
}

/**
 * Computes Sidereal Ascendant (Lagna) for given time and geographic coordinates.
 * 
 * @param {Object} astroTime
 * @param {number} latitude - Geographic latitude in degrees
 * @param {number} longitude - Geographic longitude in degrees
 * @param {number} ayanamsa - Lahiri ayanamsa in degrees
 * @returns {{
 *   tropicalDegree: number,
 *   siderealDegree: number,
 *   signIndex: number,
 *   sign: Object,
 *   degreeInSign: number,
 *   nakshatra: Object,
 *   pada: number
 * }}
 */
export function computeAscendant(astroTime, latitude, longitude, ayanamsa) {
  // Greenwich Apparent Sidereal Time in hours
  const gastHours = Astronomy.SiderealTime(astroTime);
  
  // Right Ascension of the Midheaven (RAMC) in degrees
  const ramcDeg = normalizeAngle(gastHours * 15 + longitude);
  const ramcRad = ramcDeg * D2R;

  // True Obliquity of the Ecliptic (eps)
  const jd = astroTime.ut + 2451545.0;
  const T = (jd - 2451545.0) / 36525.0;
  const epsDeg = 23.439291 - 0.0130042 * T;
  const epsRad = epsDeg * D2R;
  const latRad = latitude * D2R;

  // Spherical trigonometry Ascendant formula
  const y = Math.cos(ramcRad);
  const x = -Math.sin(ramcRad) * Math.cos(epsRad) - Math.tan(latRad) * Math.sin(epsRad);

  let tropicalAsc = Math.atan2(y, x) * R2D;
  tropicalAsc = normalizeAngle(tropicalAsc);

  // Sidereal Ascendant = (Tropical - Ayanamsa) mod 360
  const siderealAsc = normalizeAngle(tropicalAsc - ayanamsa);

  const signIndex = Math.floor(siderealAsc / 30);
  const degreeInSign = siderealAsc % 30;
  const sign = ZODIAC_SIGNS[signIndex];

  // Nakshatra and Pada
  const nakshatraInfo = getNakshatraAndPada(siderealAsc);

  return {
    tropicalDegree: tropicalAsc,
    siderealDegree: siderealAsc,
    signIndex,
    sign,
    degreeInSign,
    nakshatra: nakshatraInfo.nakshatra,
    pada: nakshatraInfo.pada,
  };
}

/**
 * Determines Nakshatra (1-27) and Pada (1-4) for a sidereal longitude.
 * 
 * @param {number} longitude - Sidereal longitude in degrees [0, 360)
 * @returns {{ nakshatra: Object, pada: number, degreeInNakshatra: number, fractionElapsed: number }}
 */
export function getNakshatraAndPada(longitude) {
  const norm = normalizeAngle(longitude);
  const span = 360 / 27; // 13.333333333 degrees per Nakshatra
  const padaSpan = span / 4; // 3.333333333 degrees per Pada

  const index = Math.min(26, Math.floor(norm / span));
  const degreeInNakshatra = norm % span;
  const pada = Math.min(4, Math.floor(degreeInNakshatra / padaSpan) + 1);

  return {
    nakshatra: NAKSHATRAS[index],
    pada,
    degreeInNakshatra,
    fractionElapsed: degreeInNakshatra / span,
  };
}

/**
 * Computes mean lunar ascending node (Rahu) and descending node (Ketu).
 * 
 * @param {number} jd - Julian Day
 * @returns {{ rahuTropical: number, ketuTropical: number }}
 */
export function computeLunarNodesTropical(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  // Meeus formula for Moon's mean ascending node
  let omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
  omega = normalizeAngle(omega);

  const ketu = normalizeAngle(omega + 180);
  return { rahuTropical: omega, ketuTropical: ketu };
}

/**
 * Calculates geocentric tropical and sidereal coordinates for all 9 Grahas.
 * 
 * @param {Object} astroTime
 * @param {number} ayanamsa
 * @param {number} lagnaSignIndex - Sign index of Ascendant (0-11) for house determination
 * @returns {Array<Object>} List of 9 planetary position records
 */
export function computeGrahaPositions(astroTime, ayanamsa, lagnaSignIndex) {
  const jd = astroTime.ut + 2451545.0;
  const dtHours = 1;
  const timeNext = Astronomy.MakeTime(new Date(astroTime.date.getTime() + dtHours * 3600 * 1000));

  const results = [];

  // 1. Sun
  {
    const sunPos = Astronomy.SunPosition(astroTime);
    const sunPosNext = Astronomy.SunPosition(timeNext);
    const tropLon = normalizeAngle(sunPos.elon);
    const speedDegPerDay = (normalizeAngle(sunPosNext.elon - tropLon + 180) - 180) * 24;
    results.push(formatGrahaData("SUN", tropLon, speedDegPerDay, ayanamsa, lagnaSignIndex, false));
  }

  // 2. Moon
  {
    const moonPos = Astronomy.Ecliptic(Astronomy.GeoMoon(astroTime));
    const moonPosNext = Astronomy.Ecliptic(Astronomy.GeoMoon(timeNext));
    const tropLon = normalizeAngle(moonPos.elon);
    const speedDegPerDay = (normalizeAngle(moonPosNext.elon - tropLon + 180) - 180) * 24;
    results.push(formatGrahaData("MOON", tropLon, speedDegPerDay, ayanamsa, lagnaSignIndex, false));
  }

  // 3-7. Physical Planets: Mars, Mercury, Jupiter, Venus, Saturn
  const planetBodyMap = [
    { key: "MARS", body: Astronomy.Body.Mars },
    { key: "MERCURY", body: Astronomy.Body.Mercury },
    { key: "JUPITER", body: Astronomy.Body.Jupiter },
    { key: "VENUS", body: Astronomy.Body.Venus },
    { key: "SATURN", body: Astronomy.Body.Saturn },
  ];

  for (const { key, body } of planetBodyMap) {
    const vec = Astronomy.GeoVector(body, astroTime, true);
    const ecl = Astronomy.Ecliptic(vec);
    const vecNext = Astronomy.GeoVector(body, timeNext, true);
    const eclNext = Astronomy.Ecliptic(vecNext);

    const tropLon = normalizeAngle(ecl.elon);
    const diff = normalizeAngle(eclNext.elon - tropLon + 180) - 180;
    const speedDegPerDay = diff * 24;
    const isRetrograde = speedDegPerDay < 0;

    results.push(formatGrahaData(key, tropLon, speedDegPerDay, ayanamsa, lagnaSignIndex, isRetrograde));
  }

  // 8 & 9. Rahu & Ketu (Shadow planets / Lunar nodes)
  {
    const nodes = computeLunarNodesTropical(jd);
    const nodesNext = computeLunarNodesTropical(jd + dtHours / 24);
    const speedRahu = (normalizeAngle(nodesNext.rahuTropical - nodes.rahuTropical + 180) - 180) * 24;

    results.push(formatGrahaData("RAHU", nodes.rahuTropical, speedRahu, ayanamsa, lagnaSignIndex, true));
    results.push(formatGrahaData("KETU", nodes.ketuTropical, speedRahu, ayanamsa, lagnaSignIndex, true));
  }

  return results;
}

/**
 * Helper to build enriched Graha record.
 */
function formatGrahaData(planetKey, tropicalDegree, speedDegPerDay, ayanamsa, lagnaSignIndex, isRetrograde) {
  const siderealDegree = normalizeAngle(tropicalDegree - ayanamsa);
  const signIndex = Math.floor(siderealDegree / 30);
  const degreeInSign = siderealDegree % 30;
  const sign = ZODIAC_SIGNS[signIndex];

  // Whole Sign House: Lagna is House 1
  const house = ((signIndex - lagnaSignIndex + 12) % 12) + 1;

  const nakshatraInfo = getNakshatraAndPada(siderealDegree);
  const planetMeta = PLANETS.find((p) => p.key === planetKey) || {};

  return {
    planet: planetKey,
    name: planetMeta.name || planetKey,
    sanskritName: planetMeta.sanskritName || planetKey,
    tropicalDegree,
    siderealDegree,
    sign: sign.name,
    sanskritSign: sign.sanskritName,
    signIndex,
    house,
    degree: parseFloat(degreeInSign.toFixed(4)),
    speed: parseFloat(speedDegPerDay.toFixed(4)),
    retrograde: isRetrograde,
    nakshatra: nakshatraInfo.nakshatra.name,
    sanskritNakshatra: nakshatraInfo.nakshatra.devanagari,
    pada: nakshatraInfo.pada,
    signLord: sign.lord,
    nakshatraLord: nakshatraInfo.nakshatra.lord,
  };
}

/**
 * Computes Vimshottari Mahadasha balance and 120-year sequence from Moon's sidereal position.
 * 
 * @param {number} moonSiderealDeg
 * @param {Date} birthDateUtc
 * @param {Date} [currentDate=new Date()]
 * @returns {Object} Dasha details
 */
export function computeVimshottariDasha(moonSiderealDeg, birthDateUtc, currentDate = new Date()) {
  const nakshatraInfo = getNakshatraAndPada(moonSiderealDeg);
  const startingLord = nakshatraInfo.nakshatra.lord;

  // Find index in cycle
  const cycleIndex = VIMSHOTTARI_DASHA_CYCLE.findIndex(
    (item) => item.lord.toLowerCase() === startingLord.toLowerCase()
  );

  const startingItem = VIMSHOTTARI_DASHA_CYCLE[cycleIndex];
  const totalYears = startingItem.years;

  // Fraction remaining of the current Nakshatra
  const fractionRemaining = 1 - nakshatraInfo.fractionElapsed;
  const balanceYears = totalYears * fractionRemaining;

  const balYearsInt = Math.floor(balanceYears);
  const balMonths = Math.floor((balanceYears - balYearsInt) * 12);
  const balDays = Math.floor((((balanceYears - balYearsInt) * 12) - balMonths) * 30);

  const balanceText = `${balYearsInt}y ${balMonths}m ${balDays}d of ${startingLord}`;

  // Build sequential timeline of Mahadashas
  const dashaTimeline = [];
  let currentStartTime = new Date(birthDateUtc.getTime());

  // 1st Mahadasha (Remaining balance)
  const firstDurationDays = balanceYears * 365.25;
  let currentEndTime = new Date(currentStartTime.getTime() + firstDurationDays * 86400 * 1000);

  dashaTimeline.push({
    lord: startingItem.lord,
    sanskritName: startingItem.sanskritName,
    durationYears: parseFloat(balanceYears.toFixed(2)),
    startDate: currentStartTime.toISOString().split("T")[0],
    endDate: currentEndTime.toISOString().split("T")[0],
    isPartial: true,
  });

  // Subsequent Mahadashas in sequence
  for (let i = 1; i < 9; i++) {
    const idx = (cycleIndex + i) % 9;
    const item = VIMSHOTTARI_DASHA_CYCLE[idx];
    const itemStart = new Date(currentEndTime.getTime());
    const durationDays = item.years * 365.25;
    const itemEnd = new Date(itemStart.getTime() + durationDays * 86400 * 1000);

    dashaTimeline.push({
      lord: item.lord,
      sanskritName: item.sanskritName,
      durationYears: item.years,
      startDate: itemStart.toISOString().split("T")[0],
      endDate: itemEnd.toISOString().split("T")[0],
      isPartial: false,
    });

    currentEndTime = itemEnd;
  }

  // Determine current active Mahadasha
  const currentIso = currentDate.toISOString().split("T")[0];
  let activeDasha = dashaTimeline.find(
    (d) => currentIso >= d.startDate && currentIso <= d.endDate
  );
  if (!activeDasha) {
    activeDasha = dashaTimeline[dashaTimeline.length - 1];
  }

  // Attach Antardashas to all Mahadashas and flag current
  dashaTimeline.forEach((d) => {
    d.isCurrent = (d.lord === activeDasha.lord);
    d.antardashas = buildAntardashas(d.lord, d.startDate, d.endDate, currentDate);
  });

  const activeAntar = activeDasha.antardashas?.find((a) => a.isCurrent) || activeDasha.antardashas?.[0];

  return {
    moonNakshatra: nakshatraInfo.nakshatra.name,
    moonPada: nakshatraInfo.pada,
    startingLord,
    balanceText,
    balanceYears: parseFloat(balanceYears.toFixed(2)),
    currentMahadasha: activeDasha.lord,
    currentAntardasha: activeAntar?.lord || activeDasha.lord,
    activeAntardasha: activeAntar || null,
    timeline: dashaTimeline,
  };
}

/**
 * Computes the 9 Antardashas (sub-periods) for a given Mahadasha based on Vimshottari rules.
 */
export function buildAntardashas(mahaLord, startDateStr, endDateStr, currentDate = new Date()) {
  const cycleIndex = VIMSHOTTARI_DASHA_CYCLE.findIndex(
    (v) => v.lord.toLowerCase() === mahaLord.toLowerCase()
  );
  if (cycleIndex === -1) return [];

  const mahaItem = VIMSHOTTARI_DASHA_CYCLE[cycleIndex];
  const startMs = new Date(startDateStr).getTime();
  const endMs = new Date(endDateStr).getTime();
  const totalDurationMs = Math.max(1, endMs - startMs);
  const currentIso = currentDate.toISOString().split("T")[0];

  let currentStart = new Date(startMs);
  const antardashas = [];

  for (let i = 0; i < 9; i++) {
    const idx = (cycleIndex + i) % 9;
    const subItem = VIMSHOTTARI_DASHA_CYCLE[idx];
    const fraction = subItem.years / 120; // 120 years total in Vimshottari
    const durationMs = fraction * totalDurationMs;
    const itemEnd = new Date(currentStart.getTime() + durationMs);

    const sIso = currentStart.toISOString().split("T")[0];
    const eIso = itemEnd.toISOString().split("T")[0];
    const isCurrent = currentIso >= sIso && currentIso <= eIso;

    antardashas.push({
      lord: subItem.lord,
      sanskritName: subItem.sanskritName,
      durationMonths: parseFloat(((subItem.years * mahaItem.years * 12) / 120).toFixed(1)),
      durationYears: parseFloat(((subItem.years * mahaItem.years) / 120).toFixed(2)),
      startDate: sIso,
      endDate: eIso,
      isCurrent,
    });

    currentStart = itemEnd;
  }

  // Ensure an active Antardasha is flagged if current date is within Mahadasha
  const hasActive = antardashas.some((a) => a.isCurrent);
  if (!hasActive && currentIso >= startDateStr && currentIso <= endDateStr) {
    for (let j = 0; j < antardashas.length; j++) {
      if (currentIso <= antardashas[j].endDate) {
        antardashas[j].isCurrent = true;
        break;
      }
    }
    if (!antardashas.some((a) => a.isCurrent)) {
      antardashas[antardashas.length - 1].isCurrent = true;
    }
  }

  return antardashas;
}

/**
 * Builds 12 Houses (Bhavas) with associated signs and residing planets.
 */
export function buildHouses(lagnaSignIndex, planets) {
  return HOUSES.map((h) => {
    const signIndex = (lagnaSignIndex + (h.house - 1)) % 12;
    const sign = ZODIAC_SIGNS[signIndex];
    const residingPlanets = planets
      .filter((p) => p.house === h.house)
      .map((p) => ({
        planet: p.planet,
        name: p.name,
        degree: p.degree,
        retrograde: p.retrograde,
      }));

    return {
      house: h.house,
      name: h.name,
      sign: sign.name,
      sanskritSign: sign.sanskritName,
      signLord: sign.lord,
      signification: h.signification,
      karaka: h.karaka,
      planets: residingPlanets,
    };
  });
}
