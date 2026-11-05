/**
 * Classical Vedic Astrology Constants (Brihat Parashara Hora Shastra)
 */

export const AYANAMSA_TYPE = "Lahiri";

// 12 Zodiac Signs (Rashis)
export const ZODIAC_SIGNS = [
  { id: 1, name: "Aries", sanskritName: "मेष (Mesha)", lord: "Mars", element: "Fire", modality: "Movable" },
  { id: 2, name: "Taurus", sanskritName: "वृषभ (Vrishabha)", lord: "Venus", element: "Earth", modality: "Fixed" },
  { id: 3, name: "Gemini", sanskritName: "मिथुन (Mithuna)", lord: "Mercury", element: "Air", modality: "Dual" },
  { id: 4, name: "Cancer", sanskritName: "कर्क (Karka)", lord: "Moon", element: "Water", modality: "Movable" },
  { id: 5, name: "Leo", sanskritName: "सिंह (Simha)", lord: "Sun", element: "Fire", modality: "Fixed" },
  { id: 6, name: "Virgo", sanskritName: "कन्या (Kanya)", lord: "Mercury", element: "Earth", modality: "Dual" },
  { id: 7, name: "Libra", sanskritName: "तुला (Tula)", lord: "Venus", element: "Air", modality: "Movable" },
  { id: 8, name: "Scorpio", sanskritName: "वृश्चिक (Vrishchika)", lord: "Mars", element: "Water", modality: "Fixed" },
  { id: 9, name: "Sagittarius", sanskritName: "धनु (Dhanu)", lord: "Jupiter", element: "Fire", modality: "Dual" },
  { id: 10, name: "Capricorn", sanskritName: "मकर (Makara)", lord: "Saturn", element: "Earth", modality: "Movable" },
  { id: 11, name: "Aquarius", sanskritName: "कुम्भ (Kumbha)", lord: "Saturn", element: "Air", modality: "Fixed" },
  { id: 12, name: "Pisces", sanskritName: "मीन (Meena)", lord: "Jupiter", element: "Water", modality: "Dual" },
];

// 27 Lunar Mansions (Nakshatras)
export const NAKSHATRAS = [
  { id: 1, name: "Ashwini", devanagari: "अश्विनी", lord: "Ketu", deity: "Ashwini Kumaras", startDeg: 0, endDeg: 13.333333 },
  { id: 2, name: "Bharani", devanagari: "भरणी", lord: "Venus", deity: "Yama", startDeg: 13.333333, endDeg: 26.666667 },
  { id: 3, name: "Krittika", devanagari: "कृत्तिका", lord: "Sun", deity: "Agni", startDeg: 26.666667, endDeg: 40.0 },
  { id: 4, name: "Rohini", devanagari: "रोहिणी", lord: "Moon", deity: "Brahma", startDeg: 40.0, endDeg: 53.333333 },
  { id: 5, name: "Mrigashira", devanagari: "मृगशिरा", lord: "Mars", deity: "Soma", startDeg: 53.333333, endDeg: 66.666667 },
  { id: 6, name: "Ardra", devanagari: "आर्द्रा", lord: "Rahu", deity: "Rudra", startDeg: 66.666667, endDeg: 80.0 },
  { id: 7, name: "Punarvasu", devanagari: "पुनर्वसु", lord: "Jupiter", deity: "Aditi", startDeg: 80.0, endDeg: 93.333333 },
  { id: 8, name: "Pushya", devanagari: "पुष्य", lord: "Saturn", deity: "Brihaspati", startDeg: 93.333333, endDeg: 106.666667 },
  { id: 9, name: "Ashlesha", devanagari: "आश्लेषा", lord: "Mercury", deity: "Sarpas", startDeg: 106.666667, endDeg: 120.0 },
  { id: 10, name: "Magha", devanagari: "मघा", lord: "Ketu", deity: "Pitris", startDeg: 120.0, endDeg: 133.333333 },
  { id: 11, name: "Purva Phalguni", devanagari: "पूर्वाफाल्गुनी", lord: "Venus", deity: "Bhaga", startDeg: 133.333333, endDeg: 146.666667 },
  { id: 12, name: "Uttara Phalguni", devanagari: "उत्तराफाल्गुनी", lord: "Sun", deity: "Aryaman", startDeg: 146.666667, endDeg: 160.0 },
  { id: 13, name: "Hasta", devanagari: "हस्त", lord: "Moon", deity: "Savitr", startDeg: 160.0, endDeg: 173.333333 },
  { id: 14, name: "Chitra", devanagari: "चित्रा", lord: "Mars", deity: "Vishwakarma", startDeg: 173.333333, endDeg: 186.666667 },
  { id: 15, name: "Swati", devanagari: "स्वाती", lord: "Rahu", deity: "Vayu", startDeg: 186.666667, endDeg: 200.0 },
  { id: 16, name: "Vishakha", devanagari: "विशाखा", lord: "Jupiter", deity: "Indra-Agni", startDeg: 200.0, endDeg: 213.333333 },
  { id: 17, name: "Anuradha", devanagari: "अनुराधा", lord: "Saturn", deity: "Mitra", startDeg: 213.333333, endDeg: 226.666667 },
  { id: 18, name: "Jyeshtha", devanagari: "ज्येष्ठा", lord: "Mercury", deity: "Indra", startDeg: 226.666667, endDeg: 240.0 },
  { id: 19, name: "Mula", devanagari: "मूल", lord: "Ketu", deity: "Nirriti", startDeg: 240.0, endDeg: 253.333333 },
  { id: 20, name: "Purva Ashadha", devanagari: "पूर्वाषाढ़ा", lord: "Venus", deity: "Apah", startDeg: 253.333333, endDeg: 266.666667 },
  { id: 21, name: "Uttara Ashadha", devanagari: "उत्तराषाढ़ा", lord: "Sun", deity: "Vishvedevas", startDeg: 266.666667, endDeg: 280.0 },
  { id: 22, name: "Shravana", devanagari: "श्रवण", lord: "Moon", deity: "Vishnu", startDeg: 280.0, endDeg: 293.333333 },
  { id: 23, name: "Dhanishta", devanagari: "धनिष्ठा", lord: "Mars", deity: "Vasus", startDeg: 293.333333, endDeg: 306.666667 },
  { id: 24, name: "Shatabhisha", devanagari: "शतभिषा", lord: "Rahu", deity: "Varuna", startDeg: 306.666667, endDeg: 320.0 },
  { id: 25, name: "Purva Bhadrapada", devanagari: "पूर्वभाद्रपदा", lord: "Jupiter", deity: "Aja Ekapada", startDeg: 320.0, endDeg: 333.333333 },
  { id: 26, name: "Uttara Bhadrapada", devanagari: "उत्तरभाद्रपदा", lord: "Saturn", deity: "Ahirbudhnya", startDeg: 333.333333, endDeg: 346.666667 },
  { id: 27, name: "Revati", devanagari: "रेवती", lord: "Mercury", deity: "Pushan", startDeg: 346.666667, endDeg: 360.0 },
];

// 9 Grahas (Vedic Planets)
export const PLANETS = [
  { key: "SUN", name: "Sun", sanskritName: "सूर्य (Surya)", nature: "Kruura", gender: "Male" },
  { key: "MOON", name: "Moon", sanskritName: "चन्द्र (Chandra)", nature: "Saumya", gender: "Female" },
  { key: "MARS", name: "Mars", sanskritName: "मंगल (Mangala)", nature: "Kruura", gender: "Male" },
  { key: "MERCURY", name: "Mercury", sanskritName: "बुध (Budha)", nature: "Saumya", gender: "Neutral" },
  { key: "JUPITER", name: "Jupiter", sanskritName: "बृहस्पति (Guru)", nature: "Saumya", gender: "Male" },
  { key: "VENUS", name: "Venus", sanskritName: "शुक्र (Shukra)", nature: "Saumya", gender: "Female" },
  { key: "SATURN", name: "Saturn", sanskritName: "शनि (Shani)", nature: "Kruura", gender: "Neutral" },
  { key: "RAHU", name: "Rahu", sanskritName: "राहु (Rahu)", nature: "Chhaya Kruura", gender: "Neutral" },
  { key: "KETU", name: "Ketu", sanskritName: "केतु (Ketu)", nature: "Chhaya Kruura", gender: "Neutral" },
];

// Vimshottari Mahadasha 120-Year Cycle Sequence & Years
export const VIMSHOTTARI_DASHA_CYCLE = [
  { lord: "Ketu", sanskritName: "केतु", years: 7 },
  { lord: "Venus", sanskritName: "शुक्र", years: 20 },
  { lord: "Sun", sanskritName: "सूर्य", years: 6 },
  { lord: "Moon", sanskritName: "चन्द्र", years: 10 },
  { lord: "Mars", sanskritName: "मंगल", years: 7 },
  { lord: "Rahu", sanskritName: "राहु", years: 18 },
  { lord: "Jupiter", sanskritName: "गुरु", years: 16 },
  { lord: "Saturn", sanskritName: "शनि", years: 19 },
  { lord: "Mercury", sanskritName: "बुध", years: 17 },
];

// 12 Bhavas (Astrological Houses)
export const HOUSES = [
  { house: 1, name: "Tanu Bhava", signification: "Self, Physical Body, Vitality, Nature", karaka: "Sun" },
  { house: 2, name: "Dhana Bhava", signification: "Wealth, Family, Speech, Assets", karaka: "Jupiter" },
  { house: 3, name: "Sahaja Bhava", signification: "Siblings, Courage, Communications, Skills", karaka: "Mars" },
  { house: 4, name: "Sukha Bhava", signification: "Mother, Vehicles, Mind, Land, Happiness", karaka: "Moon" },
  { house: 5, name: "Putra Bhava", signification: "Children, Intellect, Purva Punya, Creativity", karaka: "Jupiter" },
  { house: 6, name: "Ari Bhava", signification: "Enemies, Disease, Debts, Daily Work, Service", karaka: "Mars/Saturn" },
  { house: 7, name: "Yuvati Bhava", signification: "Spouse, Partnerships, Business, Foreign Travel", karaka: "Venus" },
  { house: 8, name: "Randhra Bhava", signification: "Longevity, Transformation, Hidden Knowledge, Occult", karaka: "Saturn" },
  { house: 9, name: "Dharma Bhava", signification: "Higher Wisdom, Dharma, Guru, Fortune, Father", karaka: "Jupiter" },
  { house: 10, name: "Karma Bhava", signification: "Career, Status, Actions, Public Stature", karaka: "Sun/Mercury" },
  { house: 11, name: "Labha Bhava", signification: "Gains, Desires, Elder Siblings, Aspirations", karaka: "Jupiter" },
  { house: 12, name: "Vyaya Bhava", signification: "Expenditure, Liberation (Moksha), Foreign Lands, Isolation", karaka: "Saturn/Ketu" },
];
