/**
 * Classical Shodashavarga (16 Divisional Charts) Engine
 *
 * Implements authoritative mathematical algorithms from Brihat Parashara Hora Shastra (BPHS):
 * D1 (Rashi), D2 (Hora), D3 (Drekkana), D4 (Chaturthamsha), D7 (Saptamsha),
 * D9 (Navamsha), D10 (Dashamsha), D12 (Dwadashamsha), D16 (Shodashamsha),
 * D20 (Vimshamsha), D24 (Chaturvimshamsha), D27 (Saptavimshamsha),
 * D30 (Trimshamsha), D40 (Khavedamsha), D45 (Akshavedamsha), D60 (Shashtiamsha).
 */

import { ZODIAC_SIGNS } from "./constants.js";

// Canonical metadata for the 16 Shodashavarga charts
export const DIVISIONAL_CHARTS_META = {
  D1: {
    code: "D1",
    name: "Rashi",
    sanskritName: "राशि",
    division: 1,
    significance: "Physical body, overall destiny, vitality, general life path",
    classicalRef: "BPHS Ch. 6, Sl. 2-4",
  },
  D2: {
    code: "D2",
    name: "Hora",
    sanskritName: "होरा",
    division: 2,
    significance: "Wealth, material prosperity, liquid assets, resources",
    classicalRef: "BPHS Ch. 6, Sl. 5-7",
  },
  D3: {
    code: "D3",
    name: "Drekkana",
    sanskritName: "द्रेष्काण",
    division: 3,
    significance: "Siblings, courage, initiative, enterprise, vital energy",
    classicalRef: "BPHS Ch. 6, Sl. 8-10",
  },
  D4: {
    code: "D4",
    name: "Chaturthamsha",
    sanskritName: "चतुर्थांश (तुर्यांश)",
    division: 4,
    significance: "Fixed assets, real estate, home, inner contentment, fortune",
    classicalRef: "BPHS Ch. 6, Sl. 11-12",
  },
  D7: {
    code: "D7",
    name: "Saptamsha",
    sanskritName: "सप्तांश",
    division: 7,
    significance: "Children, progeny, creative lineage, grandchildren",
    classicalRef: "BPHS Ch. 6, Sl. 13-14",
  },
  D9: {
    code: "D9",
    name: "Navamsha",
    sanskritName: "नवांश",
    division: 9,
    significance: "Spouse, marriage, dharma, inner potential, spiritual destiny",
    classicalRef: "BPHS Ch. 6, Sl. 15-18",
  },
  D10: {
    code: "D10",
    name: "Dashamsha",
    sanskritName: "दशांश",
    division: 10,
    significance: "Career, profession, societal status, leadership, achievements",
    classicalRef: "BPHS Ch. 6, Sl. 19-21",
  },
  D12: {
    code: "D12",
    name: "Dwadashamsha",
    sanskritName: "द्वादशांश",
    division: 12,
    significance: "Parents, ancestral lineage, heritage, past karma",
    classicalRef: "BPHS Ch. 6, Sl. 22-24",
  },
  D16: {
    code: "D16",
    name: "Shodashamsha",
    sanskritName: "षोडशांश (कलामंश)",
    division: 16,
    significance: "Vehicles, comforts, conveyances, mental happiness",
    classicalRef: "BPHS Ch. 6, Sl. 25-27",
  },
  D20: {
    code: "D20",
    name: "Vimshamsha",
    sanskritName: "विंशांश",
    division: 20,
    significance: "Spiritual practice, upasana, devotion, meditation progress",
    classicalRef: "BPHS Ch. 6, Sl. 28-30",
  },
  D24: {
    code: "D24",
    name: "Chaturvimshamsha",
    sanskritName: "चतुर्विंशांश (सिद्धांश)",
    division: 24,
    significance: "Higher learning, academic prowess, wisdom, intellectual mastery",
    classicalRef: "BPHS Ch. 6, Sl. 31-33",
  },
  D27: {
    code: "D27",
    name: "Saptavimshamsha",
    sanskritName: "सप्तविंशांश (भांश)",
    division: 27,
    significance: "Inherent strengths, physical resilience, subconscious traits",
    classicalRef: "BPHS Ch. 6, Sl. 34-36",
  },
  D30: {
    code: "D30",
    name: "Trimshamsha",
    sanskritName: "त्रिंशांश",
    division: 30,
    significance: "Afflictions, karmic challenges, health vulnerabilities, moral tests",
    classicalRef: "BPHS Ch. 6, Sl. 37-40",
  },
  D40: {
    code: "D40",
    name: "Khavedamsha",
    sanskritName: "खवेदांश (चत्वारिंशांश)",
    division: 40,
    significance: "Auspicious and inauspicious karmic balance, ancestral merits",
    classicalRef: "BPHS Ch. 6, Sl. 41-42",
  },
  D45: {
    code: "D45",
    name: "Akshavedamsha",
    sanskritName: "अक्षवेदांश",
    division: 45,
    significance: "General character refinement, moral disposition, subtle virtues",
    classicalRef: "BPHS Ch. 6, Sl. 43-44",
  },
  D60: {
    code: "D60",
    name: "Shashtiamsha",
    sanskritName: "षष्ट्यंश",
    division: 60,
    significance: "Deep past-life karma, subtle destiny, ultimate root of fate",
    classicalRef: "BPHS Ch. 6, Sl. 45-48",
  },
};

// 60 Shashtiamsha Deities & Nature (BPHS Ch. 6)
export const SHASHTIAMSHA_NAMES = [
  { name: "Ghora", nature: "Malefic" },
  { name: "Rakshasa", nature: "Malefic" },
  { name: "Deva", nature: "Benefic" },
  { name: "Kubera", nature: "Benefic" },
  { name: "Yaksha", nature: "Benefic" },
  { name: "Kinnara", nature: "Benefic" },
  { name: "Bhrashta", nature: "Malefic" },
  { name: "Kulaghna", nature: "Malefic" },
  { name: "Garala", nature: "Malefic" },
  { name: "Vahni", nature: "Malefic" },
  { name: "Maya", nature: "Malefic" },
  { name: "Purishaka", nature: "Malefic" },
  { name: "Apampati", nature: "Benefic" },
  { name: "Marutwan", nature: "Benefic" },
  { name: "Kaala", nature: "Malefic" },
  { name: "Sarpa", nature: "Malefic" },
  { name: "Amrita", nature: "Benefic" },
  { name: "Indu", nature: "Benefic" },
  { name: "Mridu", nature: "Benefic" },
  { name: "Komala", nature: "Benefic" },
  { name: "Heramba", nature: "Benefic" },
  { name: "Brahma", nature: "Benefic" },
  { name: "Vishnu", nature: "Benefic" },
  { name: "Maheshwara", nature: "Benefic" },
  { name: "Deva", nature: "Benefic" },
  { name: "Ardra", nature: "Benefic" },
  { name: "Kalanidhi", nature: "Benefic" },
  { name: "Bhedaka", nature: "Malefic" },
  { name: "Gulika", nature: "Malefic" },
  { name: "Mrityu", nature: "Malefic" },
  { name: "Kaala", nature: "Malefic" },
  { name: "Davagni", nature: "Malefic" },
  { name: "Ghora", nature: "Malefic" },
  { name: "Yama", nature: "Malefic" },
  { name: "Kantaka", nature: "Malefic" },
  { name: "Sudha", nature: "Benefic" },
  { name: "Amrita", nature: "Benefic" },
  { name: "Purnachandra", nature: "Benefic" },
  { name: "Vishadagdha", nature: "Malefic" },
  { name: "Kulanasha", nature: "Malefic" },
  { name: "Vamshakshaya", nature: "Malefic" },
  { name: "Utpata", nature: "Malefic" },
  { name: "Kala", nature: "Malefic" },
  { name: "Saumya", nature: "Benefic" },
  { name: "Komala", nature: "Benefic" },
  { name: "Sheetala", nature: "Benefic" },
  { name: "Karaladamshtra", nature: "Malefic" },
  { name: "Chandramukhi", nature: "Benefic" },
  { name: "Praveena", nature: "Benefic" },
  { name: "Kala-Pravina", nature: "Benefic" },
  { name: "Dandashuka", nature: "Malefic" },
  { name: "Nirmala", nature: "Benefic" },
  { name: "Shubha", nature: "Benefic" },
  { name: "Ashubha", nature: "Malefic" },
  { name: "Atishubha", nature: "Benefic" },
  { name: "Sudha-Payodhi", nature: "Benefic" },
  { name: "Ghorarupa", nature: "Malefic" },
  { name: "Atigadada", nature: "Malefic" },
  { name: "Bhramana", nature: "Malefic" },
  { name: "Indurekha", nature: "Benefic" },
];

/**
 * Calculates the divisional sign index [0-11] for a given sidereal longitude [0-360).
 *
 * @param {number} siderealDeg - Sidereal degree [0, 360)
 * @param {string} varga - Divisional chart code (e.g., "D9", "D10")
 * @returns {{ signIndex: number, degreeInVarga: number, vargaMetadata: Object }}
 */
export function calculateVargaSign(siderealDeg, varga = "D1") {
  const normDeg = ((siderealDeg % 360) + 360) % 360;
  const rashiIndex = Math.floor(normDeg / 30); // 0-11
  const degInRashi = normDeg % 30; // 0-30
  const isOddRashi = rashiIndex % 2 === 0; // Aries=0 (odd 1st), Taurus=1 (even 2nd), etc.

  // Movable (Chara): 0 (Aries), 3 (Cancer), 6 (Libra), 9 (Capricorn)
  // Fixed (Sthira): 1 (Taurus), 4 (Leo), 7 (Scorpio), 10 (Aquarius)
  // Dual (Dvisvabhava): 2 (Gemini), 5 (Virgo), 8 (Sagittarius), 11 (Pisces)
  const modality = rashiIndex % 3; // 0=Movable, 1=Fixed, 2=Dual

  let targetSign = rashiIndex;
  let degreeInVarga = 0;
  let extraMeta = {};

  switch (varga.toUpperCase()) {
    case "D1": {
      // Rashi Chart
      targetSign = rashiIndex;
      degreeInVarga = degInRashi;
      break;
    }

    case "D2": {
      // Hora: 15° each
      // BPHS: In odd signs, 0-15° is Sun (Leo/4), 15-30° is Moon (Cancer/3).
      // In even signs, 0-15° is Moon (Cancer/3), 15-30° is Sun (Leo/4).
      const part = Math.floor(degInRashi / 15);
      degreeInVarga = (degInRashi % 15) * 2;
      if (isOddRashi) {
        targetSign = part === 0 ? 4 : 3;
      } else {
        targetSign = part === 0 ? 3 : 4;
      }
      break;
    }

    case "D3": {
      // Drekkana: 10° each
      // 0-10°: Same sign
      // 10-20°: 5th from it (+4 signs)
      // 20-30°: 9th from it (+8 signs)
      const part = Math.min(2, Math.floor(degInRashi / 10));
      degreeInVarga = (degInRashi % 10) * 3;
      targetSign = (rashiIndex + part * 4) % 12;
      break;
    }

    case "D4": {
      // Chaturthamsha: 7°30' (7.5°) each
      // Parts start from the sign itself, 4th (+3), 7th (+6), 10th (+9)
      const part = Math.min(3, Math.floor(degInRashi / 7.5));
      degreeInVarga = (degInRashi % 7.5) * 4;
      targetSign = (rashiIndex + part * 3) % 12;
      break;
    }

    case "D7": {
      // Saptamsha: 30/7 = 4.285714° each
      // Odd signs: starts from same sign
      // Even signs: starts from 7th sign (+6)
      const span = 30 / 7;
      const part = Math.min(6, Math.floor(degInRashi / span));
      degreeInVarga = (degInRashi % span) * 7;
      const startSign = isOddRashi ? rashiIndex : (rashiIndex + 6) % 12;
      targetSign = (startSign + part) % 12;
      break;
    }

    case "D9": {
      // Navamsha: 3°20' (3.333333°) each
      // Fiery (Aries, Leo, Sag): starts from Aries (0)
      // Earthy (Taurus, Virgo, Cap): starts from Capricorn (9)
      // Airy (Gemini, Libra, Aqu): starts from Libra (6)
      // Watery (Cancer, Scorpio, Pis): starts from Cancer (3)
      const span = 30 / 9;
      const part = Math.min(8, Math.floor(degInRashi / span));
      degreeInVarga = (degInRashi % span) * 9;

      let startSign = 0;
      const triplicity = rashiIndex % 4;
      if (triplicity === 0) startSign = 0; // Fiery -> Aries
      else if (triplicity === 1) startSign = 9; // Earthy -> Capricorn
      else if (triplicity === 2) startSign = 6; // Airy -> Libra
      else if (triplicity === 3) startSign = 3; // Watery -> Cancer

      targetSign = (startSign + part) % 12;
      break;
    }

    case "D10": {
      // Dashamsha: 3° each
      // Odd signs: starts from same sign
      // Even signs: starts from 9th sign (+8)
      const part = Math.min(9, Math.floor(degInRashi / 3));
      degreeInVarga = (degInRashi % 3) * 10;
      const startSign = isOddRashi ? rashiIndex : (rashiIndex + 8) % 12;
      targetSign = (startSign + part) % 12;
      break;
    }

    case "D12": {
      // Dwadashamsha: 2°30' (2.5°) each
      // Starts from the sign itself
      const part = Math.min(11, Math.floor(degInRashi / 2.5));
      degreeInVarga = (degInRashi % 2.5) * 12;
      targetSign = (rashiIndex + part) % 12;
      break;
    }

    case "D16": {
      // Shodashamsha: 1.875° each
      // Movable (Chara): starts from Aries (0)
      // Fixed (Sthira): starts from Leo (4)
      // Dual (Dvisvabhava): starts from Sagittarius (8)
      const span = 30 / 16;
      const part = Math.min(15, Math.floor(degInRashi / span));
      degreeInVarga = (degInRashi % span) * 16;

      let startSign = 0;
      if (modality === 0) startSign = 0;
      else if (modality === 1) startSign = 4;
      else if (modality === 2) startSign = 8;

      targetSign = (startSign + part) % 12;
      break;
    }

    case "D20": {
      // Vimshamsha: 1.5° each
      // Movable: starts from Aries (0)
      // Fixed: starts from Sagittarius (8)
      // Dual: starts from Leo (4)
      const span = 30 / 20;
      const part = Math.min(19, Math.floor(degInRashi / span));
      degreeInVarga = (degInRashi % span) * 20;

      let startSign = 0;
      if (modality === 0) startSign = 0;
      else if (modality === 1) startSign = 8;
      else if (modality === 2) startSign = 4;

      targetSign = (startSign + part) % 12;
      break;
    }

    case "D24": {
      // Chaturvimshamsha (Siddhamsa): 1.25° each
      // Odd signs: starts from Leo (4)
      // Even signs: starts from Cancer (3)
      const span = 30 / 24;
      const part = Math.min(23, Math.floor(degInRashi / span));
      degreeInVarga = (degInRashi % span) * 24;
      const startSign = isOddRashi ? 4 : 3;
      targetSign = (startSign + part) % 12;
      break;
    }

    case "D27": {
      // Saptavimshamsha (Bhamsa): 30/27 = 1.111111° each
      // Fiery: starts from Aries (0)
      // Earthy: starts from Cancer (3)
      // Airy: starts from Libra (6)
      // Watery: starts from Capricorn (9)
      const span = 30 / 27;
      const part = Math.min(26, Math.floor(degInRashi / span));
      degreeInVarga = (degInRashi % span) * 27;

      let startSign = 0;
      const triplicity = rashiIndex % 4;
      if (triplicity === 0) startSign = 0;
      else if (triplicity === 1) startSign = 3;
      else if (triplicity === 2) startSign = 6;
      else if (triplicity === 3) startSign = 9;

      targetSign = (startSign + part) % 12;
      break;
    }

    case "D30": {
      // Trimshamsha: Unequal division (BPHS Ch. 6, Sl. 37-40)
      // Odd signs:
      // 0-5°: Mars (Aries / 0)
      // 5-10°: Saturn (Aquarius / 10)
      // 10-18°: Jupiter (Sagittarius / 8)
      // 18-25°: Mercury (Gemini / 2)
      // 25-30°: Venus (Taurus / 1)
      // Even signs:
      // 0-5°: Venus (Taurus / 1)
      // 5-12°: Mercury (Virgo / 5)
      // 12-20°: Jupiter (Pisces / 11)
      // 20-25°: Saturn (Capricorn / 9)
      // 25-30°: Mars (Scorpio / 7)
      if (isOddRashi) {
        if (degInRashi < 5) {
          targetSign = 0; // Aries (Mars)
          degreeInVarga = (degInRashi / 5) * 30;
        } else if (degInRashi < 10) {
          targetSign = 10; // Aquarius (Saturn)
          degreeInVarga = ((degInRashi - 5) / 5) * 30;
        } else if (degInRashi < 18) {
          targetSign = 8; // Sagittarius (Jupiter)
          degreeInVarga = ((degInRashi - 10) / 8) * 30;
        } else if (degInRashi < 25) {
          targetSign = 2; // Gemini (Mercury)
          degreeInVarga = ((degInRashi - 18) / 7) * 30;
        } else {
          targetSign = 1; // Taurus (Venus)
          degreeInVarga = ((degInRashi - 25) / 5) * 30;
        }
      } else {
        if (degInRashi < 5) {
          targetSign = 1; // Taurus (Venus)
          degreeInVarga = (degInRashi / 5) * 30;
        } else if (degInRashi < 12) {
          targetSign = 5; // Virgo (Mercury)
          degreeInVarga = ((degInRashi - 5) / 7) * 30;
        } else if (degInRashi < 20) {
          targetSign = 11; // Pisces (Jupiter)
          degreeInVarga = ((degInRashi - 12) / 8) * 30;
        } else if (degInRashi < 25) {
          targetSign = 9; // Capricorn (Saturn)
          degreeInVarga = ((degInRashi - 20) / 5) * 30;
        } else {
          targetSign = 7; // Scorpio (Mars)
          degreeInVarga = ((degInRashi - 25) / 5) * 30;
        }
      }
      break;
    }

    case "D40": {
      // Khavedamsha: 0.75° (45') each
      // Odd signs: starts from Aries (0)
      // Even signs: starts from Libra (6)
      const span = 0.75;
      const part = Math.min(39, Math.floor(degInRashi / span));
      degreeInVarga = (degInRashi % span) * 40;
      const startSign = isOddRashi ? 0 : 6;
      targetSign = (startSign + part) % 12;
      break;
    }

    case "D45": {
      // Akshavedamsha: 40' = 2/3° (0.666667°) each
      // Movable: starts from Aries (0)
      // Fixed: starts from Leo (4)
      // Dual: starts from Sagittarius (8)
      const span = 30 / 45;
      const part = Math.min(44, Math.floor(degInRashi / span));
      degreeInVarga = (degInRashi % span) * 45;

      let startSign = 0;
      if (modality === 0) startSign = 0;
      else if (modality === 1) startSign = 4;
      else if (modality === 2) startSign = 8;

      targetSign = (startSign + part) % 12;
      break;
    }

    case "D60": {
      // Shashtiamsha: 0.5° (30') each
      // Starts from the sign itself
      const part = Math.min(59, Math.floor(degInRashi / 0.5));
      degreeInVarga = (degInRashi % 0.5) * 60;
      targetSign = (rashiIndex + part) % 12;

      const deity = SHASHTIAMSHA_NAMES[part] || SHASHTIAMSHA_NAMES[0];
      extraMeta = {
        shashtiamshaNumber: part + 1,
        shashtiamshaDeity: deity.name,
        shashtiamshaNature: deity.nature,
      };
      break;
    }

    default:
      targetSign = rashiIndex;
      degreeInVarga = degInRashi;
  }

  const sign = ZODIAC_SIGNS[targetSign];
  return {
    signIndex: targetSign,
    sign: sign.name,
    sanskritSign: sign.sanskritName,
    signLord: sign.lord,
    degreeInVarga: parseFloat(degreeInVarga.toFixed(4)),
    ...extraMeta,
  };
}

/**
 * Builds a complete Divisional Chart structure for a specific Varga code.
 *
 * @param {Object} baseChart - Chart containing ascendant and planets
 * @param {string} vargaCode - Divisional code (e.g., "D9", "D10")
 * @returns {Object} Complete Varga chart structure
 */
export function buildDivisionalChart(baseChart, vargaCode = "D9") {
  const meta = DIVISIONAL_CHARTS_META[vargaCode.toUpperCase()] || {
    code: vargaCode,
    name: vargaCode,
    sanskritName: vargaCode,
    division: 1,
    significance: "Divisional chart",
    classicalRef: "BPHS",
  };

  const ascDeg = baseChart.ascendant?.siderealTotalDegree ?? baseChart.ascendant?.degree ?? 0;
  const vargaAsc = calculateVargaSign(ascDeg, vargaCode);

  const vargaPlanets = (baseChart.planets || []).map((p) => {
    const pDeg = p.siderealDegree ?? p.degree ?? 0;
    const vSign = calculateVargaSign(pDeg, vargaCode);
    const house = ((vSign.signIndex - vargaAsc.signIndex + 12) % 12) + 1;

    return {
      planet: p.planet,
      name: p.name,
      sanskritName: p.sanskritName,
      house,
      sign: vSign.sign,
      sanskritSign: vSign.sanskritSign,
      signIndex: vSign.signIndex,
      signLord: vSign.signLord,
      degreeInVarga: vSign.degreeInVarga,
      retrograde: p.retrograde || false,
      ...(vSign.shashtiamshaDeity
        ? {
            shashtiamshaDeity: vSign.shashtiamshaDeity,
            shashtiamshaNature: vSign.shashtiamshaNature,
          }
        : {}),
    };
  });

  // Build 12 Houses for this Varga
  const houses = [];
  for (let h = 1; h <= 12; h++) {
    const hSignIndex = (vargaAsc.signIndex + (h - 1)) % 12;
    const sign = ZODIAC_SIGNS[hSignIndex];
    const occupyingPlanets = vargaPlanets.filter((p) => p.house === h);

    houses.push({
      house: h,
      sign: sign.name,
      sanskritSign: sign.sanskritName,
      signLord: sign.lord,
      planets: occupyingPlanets,
    });
  }

  return {
    meta,
    ascendant: {
      sign: vargaAsc.sign,
      sanskritSign: vargaAsc.sanskritSign,
      signIndex: vargaAsc.signIndex,
      signLord: vargaAsc.signLord,
      degreeInVarga: vargaAsc.degreeInVarga,
      ...(vargaAsc.shashtiamshaDeity
        ? {
            shashtiamshaDeity: vargaAsc.shashtiamshaDeity,
            shashtiamshaNature: vargaAsc.shashtiamshaNature,
          }
        : {}),
    },
    planets: vargaPlanets,
    houses,
  };
}

/**
 * Computes all 16 Shodashavarga charts at once.
 *
 * @param {Object} baseChart - Complete birth chart with ascendant and planets
 * @returns {Object} Map of all 16 divisional charts
 */
export function computeAllDivisionalCharts(baseChart) {
  const codes = [
    "D1",
    "D2",
    "D3",
    "D4",
    "D7",
    "D9",
    "D10",
    "D12",
    "D16",
    "D20",
    "D24",
    "D27",
    "D30",
    "D40",
    "D45",
    "D60",
  ];

  const charts = {};
  for (const code of codes) {
    charts[code] = buildDivisionalChart(baseChart, code);
  }
  return charts;
}
