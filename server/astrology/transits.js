/**
 * Daily Transit Calculator — Navagraha positions for today
 *
 * Computes the sidereal positions of all 9 Vedic planets (Grahas) for a given
 * date and compares them against a natal birth chart if available.
 * All calculations are deterministic — no AI involvement.
 */

import * as Astronomy from "astronomy-engine";
import { computeLahiriAyanamsa, computeGrahaPositions, normalizeAngle } from "./calculations.js";
import { ZODIAC_SIGNS, NAKSHATRAS } from "./constants.js";

// ---------------------------------------------------------------------------
// Transit-to-natal aspect checking (Vedic whole-sign rules)
// ---------------------------------------------------------------------------

/** Vedic aspect relationships (from which houses a planet aspects) */
const VEDIC_ASPECTS = {
  SUN:     [7],
  MOON:    [7],
  MARS:    [4, 7, 8],
  MERCURY: [7],
  JUPITER: [5, 7, 9],
  VENUS:   [7],
  SATURN:  [3, 7, 10],
  RAHU:    [5, 7, 9],
  KETU:    [5, 7, 9],
};

/**
 * Checks if a transit planet aspects a natal house position using Vedic whole-sign rules.
 * @param {number} transitHouse - 1-based house of transiting planet
 * @param {number} natalHouse   - 1-based house being aspected
 * @param {string} planet       - Planet key (e.g. "MARS")
 * @returns {boolean}
 */
function isAspecting(transitHouse, natalHouse, planet) {
  const aspects = VEDIC_ASPECTS[planet] || [7];
  return aspects.some((offset) => {
    const aspectedHouse = ((transitHouse - 1 + offset - 1) % 12) + 1;
    return aspectedHouse === natalHouse;
  });
}

// ---------------------------------------------------------------------------
// Main transit computation
// ---------------------------------------------------------------------------

/**
 * Computes all 9 Navagraha transit positions for a given date.
 *
 * @param {Object} params
 * @param {string} params.date      - "YYYY-MM-DD" local date
 * @param {number} params.tzOffset  - Timezone offset in hours
 * @returns {Array<Object>} Array of 9 transit planet records
 */
export function computeDailyTransits({ date, tzOffset }) {
  const [year, month, day] = date.split("-").map(Number);
  // Use local noon for transit snapshot
  const localNoonUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0) - tzOffset * 3600 * 1000);

  const astroTime = Astronomy.MakeTime(localNoonUTC);
  const ayanamsa  = computeLahiriAyanamsa(astroTime);

  // Use lagna 0 (Aries) as placeholder — houses are relative, we just need sign/nakshatra
  const planets = computeGrahaPositions(astroTime, ayanamsa, 0);

  return planets.map((p) => ({
    planet:      p.planet,
    name:        p.name,
    sanskritName: p.sanskritName,
    sign:        p.sign,
    sanskritSign: p.sanskritSign,
    signIndex:   p.signIndex,
    degree:      p.degree,
    siderealDegree: p.siderealDegree,
    nakshatra:   p.nakshatra,
    sanskritNakshatra: p.sanskritNakshatra,
    pada:        p.pada,
    retrograde:  p.retrograde,
    signLord:    p.signLord,
    nakshatraLord: p.nakshatraLord,
  }));
}

/**
 * Compares transit planets against a natal birth chart and identifies significant transits.
 *
 * @param {Array<Object>} transits   - Output of computeDailyTransits
 * @param {Object}        natalChart - Saved birth chart (chartData JSON from DB)
 * @returns {Array<Object>} List of significant transit events
 */
export function computeTransitToNatalAspects(transits, natalChart) {
  if (!natalChart || !natalChart.planets) return [];

  const natalPlanets = natalChart.planets || [];
  const lagnaSignIndex = natalChart.ascendant
    ? Math.floor(normalizeAngle(natalChart.ascendant) / 30)
    : 0;

  const events = [];

  for (const transit of transits) {
    // Transit planet's house relative to natal Lagna (whole-sign)
    const transitHouse = ((transit.signIndex - lagnaSignIndex + 12) % 12) + 1;

    // 1. Check conjunction with natal planets (within same sign)
    for (const natal of natalPlanets) {
      if (natal.sign === transit.sign) {
        events.push({
          type: "CONJUNCTION",
          transitPlanet: transit.planet,
          transitPlanetName: transit.name,
          natalPlanet: natal.planet,
          natalPlanetName: natal.name || natal.planet,
          sign: transit.sign,
          house: transitHouse,
          description: `${transit.name} transiting conjunct natal ${natal.name || natal.planet} in ${transit.sign}`,
          descriptionHi: `${transit.sanskritName} आपके जन्म ${natal.name || natal.planet} के साथ ${transit.sanskritSign || transit.sign} राशि में युति कर रहे हैं`,
        });
      }

      // 2. Check aspects
      const natalSignIndex = ZODIAC_SIGNS.findIndex((z) => z.name === natal.sign);
      const natalHouse = ((natalSignIndex - lagnaSignIndex + 12) % 12) + 1;

      if (isAspecting(transitHouse, natalHouse, transit.planet) && natal.sign !== transit.sign) {
        events.push({
          type: "ASPECT",
          transitPlanet: transit.planet,
          transitPlanetName: transit.name,
          natalPlanet: natal.planet,
          natalPlanetName: natal.name || natal.planet,
          transitHouse,
          natalHouse,
          description: `${transit.name} aspects natal ${natal.name || natal.planet} (House ${natalHouse}) from House ${transitHouse}`,
          descriptionHi: `${transit.sanskritName} भाव ${transitHouse} से जन्मकालीन ${natal.name || natal.planet} (भाव ${natalHouse}) को देख रहे हैं`,
        });
      }
    }
  }

  return events;
}

/**
 * Builds a structured "transits overview" including sign ingresses and current nakshatra positions.
 * @param {Array<Object>} transits
 * @returns {Object}
 */
export function buildTransitsOverview(transits) {
  const sun    = transits.find((p) => p.planet === "SUN");
  const moon   = transits.find((p) => p.planet === "MOON");
  const mars   = transits.find((p) => p.planet === "MARS");
  const mercury = transits.find((p) => p.planet === "MERCURY");
  const jupiter = transits.find((p) => p.planet === "JUPITER");
  const venus  = transits.find((p) => p.planet === "VENUS");
  const saturn = transits.find((p) => p.planet === "SATURN");
  const rahu   = transits.find((p) => p.planet === "RAHU");
  const ketu   = transits.find((p) => p.planet === "KETU");

  return {
    sun, moon, mars, mercury, jupiter, venus, saturn, rahu, ketu,
    retrograde: transits.filter((p) => p.retrograde && !["RAHU", "KETU"].includes(p.planet)),
    all: transits,
  };
}
