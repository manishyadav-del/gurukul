/**
 * Vedic Astrology Concept Extractor
 * 
 * Analyzes natural language questions (English, Hindi, Sanskrit) and structured
 * birth charts to identify core Jyotisha concepts:
 * - Grahas (9 Planets)
 * - Bhavas (12 Houses)
 * - Rashis (12 Zodiac Signs)
 * - Nakshatras (27 Lunar Mansions)
 * - Classical Yogas (Gajakesari, Budhaditya, Raja Yoga, Mangal Dosha, etc.)
 * - Dashas & Timings (Vimshottari, Mahadasha, Antardasha)
 * - Core Life Themes (Career/Karma, Marriage/Kalatra, Wealth/Dhana, Health/Roga, etc.)
 */

// Multilingual synonym dictionary for Grahas
export const PLANET_TERMS = {
  sun: {
    canonical: "Sun",
    sanskrit: "Surya",
    hindi: "सूर्य",
    synonyms: ["sun", "surya", "ravi", "aditya", "bhanu", "सूर्य", "रवि", "आदित्य", "भानु", "दिनकर"],
  },
  moon: {
    canonical: "Moon",
    sanskrit: "Chandra",
    hindi: "चन्द्र",
    synonyms: ["moon", "chandra", "soma", "indu", "shashi", "चन्द्र", "चंद्र", "सोम", "इंदु", "शशि"],
  },
  mars: {
    canonical: "Mars",
    sanskrit: "Mangala",
    hindi: "मंगल",
    synonyms: ["mars", "mangala", "mangal", "kuja", "bhauma", "angarak", "मंगल", "भौम", "कुज", "अंगारक"],
  },
  mercury: {
    canonical: "Mercury",
    sanskrit: "Budha",
    hindi: "बुध",
    synonyms: ["mercury", "budha", "budh", "saumya", "बुध", "सौम्य"],
  },
  jupiter: {
    canonical: "Jupiter",
    sanskrit: "Guru",
    hindi: "बृहस्पति",
    synonyms: ["jupiter", "guru", "brihaspati", "devaguru", "बृहस्पति", "गुरु", "देवगुरु"],
  },
  venus: {
    canonical: "Venus",
    sanskrit: "Shukra",
    hindi: "शुक्र",
    synonyms: ["venus", "shukra", "bhargava", "daityaguru", "शुक्र", "भार्गव"],
  },
  saturn: {
    canonical: "Saturn",
    sanskrit: "Shani",
    hindi: "शनि",
    synonyms: ["saturn", "shani", "manda", "sauri", "sani", "शनि", "मन्द", "सौरि"],
  },
  rahu: {
    canonical: "Rahu",
    sanskrit: "Rahu",
    hindi: "राहु",
    synonyms: ["rahu", "north node", "dragon's head", "tama", "राहु", "तम"],
  },
  ketu: {
    canonical: "Ketu",
    sanskrit: "Ketu",
    hindi: "केतु",
    synonyms: ["ketu", "south node", "dragon's tail", "shikhi", "केतु", "शिखी"],
  },
};

// 12 Bhavas (Houses)
export const HOUSE_TERMS = {
  1: {
    number: 1,
    nameEn: "1st House (Ascendant / Lagna)",
    nameSa: "Tanu Bhava (तनु भाव)",
    synonyms: ["1st house", "first house", "1st bhava", "house 1", "lagna", "ascendant", "tanu", "तनु", "लग्न", "लग्नेश", "लग्नेशः", "प्रथम भाव", "पहला भाव"],
  },
  2: {
    number: 2,
    nameEn: "2nd House (Wealth / Family)",
    nameSa: "Dhana Bhava (धन भाव)",
    synonyms: ["2nd house", "second house", "2nd bhava", "house 2", "dhana", "kutumba", "धन", "कुटुम्ब", "द्वितीय भाव", "दूसरा भाव"],
  },
  3: {
    number: 3,
    nameEn: "3rd House (Courage / Siblings)",
    nameSa: "Sahaja Bhava (सहज भाव)",
    synonyms: ["3rd house", "third house", "3rd bhava", "house 3", "sahaja", "bhratri", "parakrama", "सहज", "पराक्रम", "तृतीय भाव", "तीसरा भाव"],
  },
  4: {
    number: 4,
    nameEn: "4th House (Mother / Domestic Peace)",
    nameSa: "Sukha Bhava (सुख भाव)",
    synonyms: ["4th house", "fourth house", "4th bhava", "house 4", "sukha", "matru", "bandhu", "सुख", "मातृ", "चतुर्थ भाव", "चौथा भाव"],
  },
  5: {
    number: 5,
    nameEn: "5th House (Intellect / Children / Purva Punya)",
    nameSa: "Putra Bhava (पुत्र भाव)",
    synonyms: ["5th house", "fifth house", "5th bhava", "house 5", "putra", "buddhi", "vidya", "punya", "पंचम भाव", "पाँचवां भाव", "पुत्र", "विद्या", "बुद्धि"],
  },
  6: {
    number: 6,
    nameEn: "6th House (Enemies / Disease / Service)",
    nameSa: "Roga / Shatru Bhava (रोग / शत्रु भाव)",
    synonyms: ["6th house", "sixth house", "6th bhava", "house 6", "shatru", "roga", "ari", "ऋण", "रोग", "शत्रु", "षष्ठ भाव", "छठा भाव"],
  },
  7: {
    number: 7,
    nameEn: "7th House (Marriage / Partnerships)",
    nameSa: "Kalatra / Jaya Bhava (कलत्र / जाया भाव)",
    synonyms: ["7th house", "seventh house", "7th bhava", "house 7", "kalatra", "jaya", "yuvati", "marriage", "spouse", "दाम्पत्य", "विवाह", "सप्तम भाव", "सातवां भाव", "कलत्र"],
  },
  8: {
    number: 8,
    nameEn: "8th House (Longevity / Transformation / Occult)",
    nameSa: "Ayu / Randhra Bhava (आयु / रन्ध्र भाव)",
    synonyms: ["8th house", "eighth house", "8th bhava", "house 8", "ayu", "randhra", "mrityu", "आयु", "रन्ध्र", "मृत्यु", "अष्टम भाव", "आठवां भाव"],
  },
  9: {
    number: 9,
    nameEn: "9th House (Fortune / Dharma / Guru)",
    nameSa: "Bhagya / Dharma Bhava (भाग्य / धर्म भाव)",
    synonyms: ["9th house", "ninth house", "9th bhava", "house 9", "dharma", "bhagya", "guru", "भाग्य", "धर्म", "नवम भाव", "नौवां भाव"],
  },
  10: {
    number: 10,
    nameEn: "10th House (Career / Status / Karma)",
    nameSa: "Karma / Rajya Bhava (कर्म / राज्य भाव)",
    synonyms: ["10th house", "tenth house", "10th bhava", "house 10", "karma", "rajya", "profession", "career", "dashama", "कर्म", "राज्य", "दशम", "दशमे", "दशम भाव", "दसवां भाव", "व्यवसाय"],
  },
  11: {
    number: 11,
    nameEn: "11th House (Gains / Fulfillment / Income)",
    nameSa: "Labha / Aya Bhava (लाभ / आय भाव)",
    synonyms: ["11th house", "eleventh house", "11th bhava", "house 11", "labha", "aya", "gains", "income", "लाभ", "आय", "एकादश भाव", "ग्यारहवां भाव"],
  },
  12: {
    number: 12,
    nameEn: "12th House (Expenses / Isolation / Moksha)",
    nameSa: "Vyaya / Moksha Bhava (व्यय / मोक्ष भाव)",
    synonyms: ["12th house", "twelfth house", "12th bhava", "house 12", "vyaya", "moksha", "liberation", "व्यय", "मोक्ष", "द्वादश भाव", "बारहवां भाव"],
  },
};

// 12 Rashis (Zodiac Signs)
export const RASHI_TERMS = {
  aries: { number: 1, nameEn: "Aries", nameSa: "Mesha", nameHi: "मेष", synonyms: ["aries", "mesha", "मेष"] },
  taurus: { number: 2, nameEn: "Taurus", nameSa: "Vrishabha", nameHi: "वृषभ", synonyms: ["taurus", "vrishabha", "vrisha", "वृषभ", "वृष"] },
  gemini: { number: 3, nameEn: "Gemini", nameSa: "Mithuna", nameHi: "मिथुन", synonyms: ["gemini", "mithuna", "mithun", "मिथुन"] },
  cancer: { number: 4, nameEn: "Cancer", nameSa: "Karka", nameHi: "कर्क", synonyms: ["cancer", "karka", "kark", "कर्क"] },
  leo: { number: 5, nameEn: "Leo", nameSa: "Simha", nameHi: "सिंह", synonyms: ["leo", "simha", "singh", "सिंह"] },
  virgo: { number: 6, nameEn: "Virgo", nameSa: "Kanya", nameHi: "कन्या", synonyms: ["virgo", "kanya", "कन्या"] },
  libra: { number: 7, nameEn: "Libra", nameSa: "Tula", nameHi: "तुला", synonyms: ["libra", "tula", "तुला"] },
  scorpio: { number: 8, nameEn: "Scorpio", nameSa: "Vrischika", nameHi: "वृश्चिक", synonyms: ["scorpio", "vrishchika", "vrischika", "वृश्चिक"] },
  sagittarius: { number: 9, nameEn: "Sagittarius", nameSa: "Dhanu", nameHi: "धनु", synonyms: ["sagittarius", "dhanu", "धनु"] },
  capricorn: { number: 10, nameEn: "Capricorn", nameSa: "Makara", nameHi: "मकर", synonyms: ["capricorn", "makara", "makar", "मकर"] },
  aquarius: { number: 11, nameEn: "Aquarius", nameSa: "Kumbha", nameHi: "कुम्भ", synonyms: ["aquarius", "kumbha", "kumbh", "कुम्भ", "कुंभ"] },
  pisces: { number: 12, nameEn: "Pisces", nameSa: "Meena", nameHi: "मीन", synonyms: ["pisces", "meena", "meen", "मीन"] },
};

// 27 Nakshatras
export const NAKSHATRA_TERMS = [
  { name: "Ashwini", hindi: "अश्विनी", synonyms: ["ashwini", "asvini", "अश्विनी"] },
  { name: "Bharani", hindi: "भरणी", synonyms: ["bharani", "भरणी"] },
  { name: "Krittika", hindi: "कृत्तिका", synonyms: ["krittika", "kritika", "कृत्तिका", "कृतिका"] },
  { name: "Rohini", hindi: "रोहिणी", synonyms: ["rohini", "रोहिणी"] },
  { name: "Mrigashira", hindi: "मृगशिरा", synonyms: ["mrigashira", "mrigasira", "मृगशिरा", "मृगशिर"] },
  { name: "Ardra", hindi: "आर्द्रा", synonyms: ["ardra", "arudra", "आर्द्रा"] },
  { name: "Punarvasu", hindi: "पुनर्वसु", synonyms: ["punarvasu", "पुनर्वसु"] },
  { name: "Pushya", hindi: "पुष्य", synonyms: ["pushya", "pushyami", "पुष्य"] },
  { name: "Ashlesha", hindi: "अश्लेषा", synonyms: ["ashlesha", "aslesha", "अश्लेषा"] },
  { name: "Magha", hindi: "मघा", synonyms: ["magha", "makha", "मघा"] },
  { name: "Purva Phalguni", hindi: "पूर्वा फाल्गुनी", synonyms: ["purva phalguni", "purvaphalguni", "पूर्वा फाल्गुनी"] },
  { name: "Uttara Phalguni", hindi: "उत्तरा फाल्गुनी", synonyms: ["uttara phalguni", "uttaraphalguni", "उत्तरा फाल्गुनी"] },
  { name: "Hasta", hindi: "हस्त", synonyms: ["hasta", "हस्त"] },
  { name: "Chitra", hindi: "चित्रा", synonyms: ["chitra", "चित्रा"] },
  { name: "Swati", hindi: "स्वाति", synonyms: ["swati", "svati", "स्वाति"] },
  { name: "Vishakha", hindi: "विशाखा", synonyms: ["vishakha", "visakha", "विशाखा"] },
  { name: "Anuradha", hindi: "अनुराधा", synonyms: ["anuradha", "अनुराधा"] },
  { name: "Jyeshtha", hindi: "ज्येष्ठा", synonyms: ["jyeshtha", "jyestha", "ज्येष्ठा"] },
  { name: "Mula", hindi: "मूल", synonyms: ["mula", "moola", "मूल"] },
  { name: "Purva Ashadha", hindi: "पूर्वाषाढ़ा", synonyms: ["purva ashadha", "purvashadha", "पूर्वाषाढ़ा"] },
  { name: "Uttara Ashadha", hindi: "उत्तराषाढ़ा", synonyms: ["uttara ashadha", "uttarashadha", "उत्तराषाढ़ा"] },
  { name: "Shravana", hindi: "श्रवण", synonyms: ["shravana", "sravana", "श्रवण"] },
  { name: "Dhanishta", hindi: "धनिष्ठा", synonyms: ["dhanishta", "dhanistha", "धनिष्ठा"] },
  { name: "Shatabhisha", hindi: "शतभिषा", synonyms: ["shatabhisha", "satabhisa", "शतभिषा"] },
  { name: "Purva Bhadrapada", hindi: "पूर्व भाद्रपद", synonyms: ["purva bhadrapada", "purvabhadrapada", "पूर्व भाद्रपद"] },
  { name: "Uttara Bhadrapada", hindi: "उत्तर भाद्रपद", synonyms: ["uttara bhadrapada", "uttarabhadrapada", "उत्तर भाद्रपद"] },
  { name: "Revati", hindi: "रेवती", synonyms: ["revati", "रेवती"] },
];

// Classical Yogas & Doshas
export const YOGA_TERMS = [
  { id: "gajakesari", name: "Gajakesari Yoga", hindi: "गजकेसरी योग", synonyms: ["gajakesari", "gaja kesari", "गजकेसरी"] },
  { id: "budhaditya", name: "Budhaditya Yoga", hindi: "बुधादित्य योग", synonyms: ["budhaditya", "budha aditya", "बुधादित्य"] },
  { id: "chandra_mangala", name: "Chandra-Mangala Yoga", hindi: "चन्द्र-मंगल योग", synonyms: ["chandra mangala", "chandra-mangala", "चन्द्र मंगल", "चंद्र मंगल"] },
  { id: "amala", name: "Amala Yoga", hindi: "अमला योग", synonyms: ["amala", "amala yoga", "अमला योग"] },
  { id: "mangal_dosha", name: "Mangal Dosha / Kuja Yoga", hindi: "मंगल दोष / कुज योग", synonyms: ["mangal dosha", "kuja dosha", "kuja yoga", "मंगल दोष", "कुज दोष"] },
  { id: "raja_yoga", name: "Raja Yoga", hindi: "राज योग", synonyms: ["raja yoga", "rajayoga", "raj yoga", "राजयोग", "राज योग"] },
  { id: "dhana_yoga", name: "Dhana Yoga", hindi: "धन योग", synonyms: ["dhana yoga", "dhan yoga", "धनयोग", "धन योग"] },
  { id: "sade_sati", name: "Sade Sati", hindi: "साढ़े साती", synonyms: ["sade sati", "sadesati", "साढ़े साती", "साढ़ेसाती"] },
];

export const CHAKRA_TERMS = [
  { id: "muladhara", name: "Muladhara", english: "Root Chakra", hindi: "मूलाधार", element: "Earth / Prithvi", synonyms: ["muladhara", "mooladhara", "root chakra", "मूलाधार", "मूलाधार चक्र"] },
  { id: "svadhisthana", name: "Svadhisthana", english: "Sacral Chakra", hindi: "स्वाधिष्ठान", element: "Water / Jala", synonyms: ["svadhisthana", "swadhisthana", "sacral chakra", "स्वाधिष्ठान", "स्वाधिष्ठान चक्र"] },
  { id: "manipura", name: "Manipura", english: "Solar Plexus Chakra", hindi: "मणिपूर", element: "Fire / Agni", synonyms: ["manipura", "solar plexus", "मणिपूर", "मणिपुर", "मणिपूर चक्र"] },
  { id: "anahata", name: "Anahata", english: "Heart Chakra", hindi: "अनाहत", element: "Air / Vayu", synonyms: ["anahata", "heart chakra", "अनाहत", "अनाहत चक्र"] },
  { id: "vishuddha", name: "Vishuddha", english: "Throat Chakra", hindi: "विशुद्ध", element: "Ether / Akasha", synonyms: ["vishuddha", "vishuddhi", "throat chakra", "विशुद्ध", "विशुद्धि", "विशुद्ध चक्र"] },
  { id: "ajna", name: "Ajna", english: "Third Eye Chakra", hindi: "आज्ञा", element: "Mind / Manas", synonyms: ["ajna", "agya", "third eye", "आज्ञा", "आज्ञा चक्र"] },
  { id: "sahasrara", name: "Sahasrara", english: "Crown Chakra", hindi: "सहस्रार", element: "Consciousness / Chit", synonyms: ["sahasrara", "crown chakra", "सहस्रार", "सहस्रार चक्र"] },
  { id: "kundalini", name: "Kundalini Shakti", english: "Kundalini", hindi: "कुण्डलिनी", synonyms: ["kundalini", "prana-shakti", "कुण्डलिनी", "कुंडलिनी"] },
  { id: "nadis", name: "Nadis", english: "Subtle Energy Channels", hindi: "नाड़ी", synonyms: ["nadi", "nadis", "sushumna", "ida", "pingala", "सुषुम्ना", "इड़ा", "पिंगला", "नाड़ी"] },
  { id: "granthis", name: "Granthis", english: "Psychic Knots", hindi: "ग्रन्थि", synonyms: ["granthi", "granthis", "brahma granthi", "vishnu granthi", "rudra granthi", "ग्रन्थि", "ग्रंथि"] },
];

/**
 * Extracts structured astrology concepts from a query string and optional chart.
 * 
 * @param {string} query
 * @param {Object} [chart]
 * @returns {Object} Structured concepts
 */
export function extractAstrologyConcepts(query = "", chart = null) {
  const normalized = (query || "").toLowerCase();

  const foundPlanets = [];
  const foundHouses = [];
  const foundSigns = [];
  const foundNakshatras = [];
  const foundYogas = [];
  const searchKeywords = [];

  // 1. Detect Planets
  for (const [key, planet] of Object.entries(PLANET_TERMS)) {
    if (planet.synonyms.some((syn) => normalized.includes(syn.toLowerCase()))) {
      foundPlanets.push(planet.canonical);
      searchKeywords.push(planet.canonical, planet.hindi, planet.sanskrit);
    }
  }

  // 2. Detect Houses
  for (const [houseNum, house] of Object.entries(HOUSE_TERMS)) {
    if (house.synonyms.some((syn) => normalized.includes(syn.toLowerCase()))) {
      foundHouses.push(parseInt(houseNum, 10));
      searchKeywords.push(house.nameEn, house.nameSa);
    }
  }

  // 3. Detect Signs
  for (const [key, rashi] of Object.entries(RASHI_TERMS)) {
    if (rashi.synonyms.some((syn) => normalized.includes(syn.toLowerCase()))) {
      foundSigns.push(rashi.nameEn);
      searchKeywords.push(rashi.nameEn, rashi.nameSa, rashi.nameHi);
    }
  }

  // 4. Detect Nakshatras
  for (const nak of NAKSHATRA_TERMS) {
    if (nak.synonyms.some((syn) => normalized.includes(syn.toLowerCase()))) {
      foundNakshatras.push(nak.name);
      searchKeywords.push(nak.name, nak.hindi);
    }
  }

  // 5. Detect Yogas
  for (const yoga of YOGA_TERMS) {
    if (yoga.synonyms.some((syn) => normalized.includes(syn.toLowerCase()))) {
      foundYogas.push(yoga.name);
      searchKeywords.push(yoga.name, yoga.hindi);
    }
  }

  // 6. Detect Chakras & Kundalini Yogic Concepts
  const foundChakras = [];
  for (const chakra of CHAKRA_TERMS) {
    if (chakra.synonyms.some((syn) => normalized.includes(syn.toLowerCase()))) {
      foundChakras.push(chakra.name);
      searchKeywords.push(chakra.name, chakra.hindi, chakra.english);
      if (chakra.element) {
        searchKeywords.push(chakra.element);
      }
    }
  }

  // 7. Detect Dashas
  const foundDashas = [];
  if (
    normalized.includes("dasha") ||
    normalized.includes("दशा") ||
    normalized.includes("mahadasha") ||
    normalized.includes("महादशा")
  ) {
    for (const [key, planet] of Object.entries(PLANET_TERMS)) {
      if (planet.synonyms.some((syn) => normalized.includes(syn.toLowerCase()))) {
        foundDashas.push({
          planet: planet.canonical,
          type: normalized.includes("antar") ? "Antardasha" : "Mahadasha",
        });
        searchKeywords.push(`${planet.canonical} Dasha`, `${planet.hindi} महादशा`);
      }
    }
  }

  // 8. Enrich with Personal Chart if attached
  if (chart) {
    if (chart.ascendant && chart.ascendant.sign) {
      searchKeywords.push(`${chart.ascendant.sign} Lagna`, `${chart.ascendant.sign}`);
      if (!foundSigns.includes(chart.ascendant.sign)) {
        foundSigns.push(chart.ascendant.sign);
      }
    }
    if (chart.moon && chart.moon.sign) {
      searchKeywords.push(`${chart.moon.sign} Moon`);
    }
    if (chart.moon && chart.moon.nakshatra) {
      searchKeywords.push(chart.moon.nakshatra);
    }
    if (chart.dasha && chart.dasha.currentMahadasha) {
      searchKeywords.push(`${chart.dasha.currentMahadasha} Mahadasha`);
      foundDashas.push({ planet: chart.dasha.currentMahadasha, type: "Mahadasha" });
    }
  }

  return {
    rawQuery: query,
    planets: Array.from(new Set(foundPlanets)),
    houses: Array.from(new Set(foundHouses)),
    signs: Array.from(new Set(foundSigns)),
    nakshatras: Array.from(new Set(foundNakshatras)),
    yogas: Array.from(new Set(foundYogas)),
    chakras: Array.from(new Set(foundChakras)),
    dashaPeriods: foundDashas,
    dashas: Array.from(new Set(foundDashas.map((d) => d.planet))),
    expandedTerms: Array.from(new Set(searchKeywords.filter(Boolean))),
  };
}
