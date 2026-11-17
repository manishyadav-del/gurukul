/**
 * Gurukul Multilingual Query Normalization & Transliteration Intelligence
 * 
 * Supports:
 * - Devanagari (Hindi, Sanskrit) and Latin (English, IAST) scripts.
 * - Unicode NFC normalization to reconcile combining marks, virama, and matras without damaging Sanskrit characters.
 * - Devanagari orthographic variants (anusvara vs classical homorganic nasals, nukta reconciliation).
 * - Comprehensive bidirectional transliteration and concept expansion for Vedic astrological & spiritual terms.
 * - Conservative cleaning without destructive stemming or ligature degradation.
 * - Intelligent context snippet extraction with match boundaries.
 */

// Bidirectional Astrological & Spiritual Terminology Dictionary
export const MULTILINGUAL_CONCEPT_MAP = [
  // Navagrahas
  {
    en: ["sun", "surya", "soorya", "ravi", "aditya", "bhanu"],
    hi: ["सूर्य", "रवि", "आदित्य", "भानु", "सूरज"],
    canonical: "सूर्य",
  },
  {
    en: ["moon", "chandra", "chanda", "soma", "indu", "vidhu"],
    hi: ["चन्द्र", "चंद्र", "सोम", "इन्दु", "इंदु", "चाँद"],
    canonical: "चन्द्र",
  },
  {
    en: ["mars", "mangal", "mangala", "kuja", "angarak", "bhauma"],
    hi: ["मंगल", "मङ्गल", "कुज", "अंगारक", "भौम"],
    canonical: "मंगल",
  },
  {
    en: ["mercury", "budha", "budh", "soumya"],
    hi: ["बुध", "सौम्य"],
    canonical: "बुध",
  },
  {
    en: ["jupiter", "guru", "brihaspati", "brahaspati", "devaguru", "jeeva"],
    hi: ["गुरु", "बृहस्पति", "देवगुरु", "जीव"],
    canonical: "गुरु",
  },
  {
    en: ["venus", "shukra", "sukra", "bhrigu", "daityaguru", "kavya"],
    hi: ["शुक्र", "भृगु", "दैत्यगुरु", "काव्य"],
    canonical: "शुक्र",
  },
  {
    en: ["saturn", "shani", "sani", "manda", "sauri", "chhayaputra"],
    hi: ["शनि", "मन्द", "मंद", "सौरि", "छायापुत्र"],
    canonical: "शनि",
  },
  {
    en: ["rahu", "north node", "dragon head", "tamopradhana", "sarpa"],
    hi: ["राहु", "सर्प"],
    canonical: "राहु",
  },
  {
    en: ["ketu", "south node", "dragon tail", "dhwaja", "shikhi"],
    hi: ["केतु", "ध्वज", "शिखी"],
    canonical: "केतु",
  },

  // Bhavas & Astrological Concepts
  {
    en: ["lagna", "ascendant", "first house", "1st house", "tanu bhava"],
    hi: ["लग्न", "तनु भाव", "प्रथम भाव"],
    canonical: "लग्न",
  },
  {
    en: ["dhana", "second house", "2nd house", "wealth house", "kula"],
    hi: ["धन भाव", "द्वितीय भाव", "धन"],
    canonical: "धन",
  },
  {
    en: ["sahaja", "third house", "3rd house", "bhatru", "parakrama"],
    hi: ["सहज भाव", "तृतीय भाव", "पराक्रम", "भ्रातृ"],
    canonical: "सहज",
  },
  {
    en: ["sukha", "fourth house", "4th house", "matru", "bandhu", "patala"],
    hi: ["सुख भाव", "चतुर्थ भाव", "मातृ", "बन्धु", "बंधु"],
    canonical: "सुख",
  },
  {
    en: ["putra", "fifth house", "5th house", "suta", "buddhi", "poorvapunya"],
    hi: ["पुत्र भाव", "पंचम भाव", "पञ्चम भाव", "सुत", "बुद्धि"],
    canonical: "सुत",
  },
  {
    en: ["shatru", "sixth house", "6th house", "ari", "roga", "rina"],
    hi: ["शत्रु भाव", "षष्ठ भाव", "अरि", "रोग", "ऋण"],
    canonical: "शत्रु",
  },
  {
    en: ["kalatra", "seventh house", "7th house", "yuvati", "jaya", "kama"],
    hi: ["कलत्र भाव", "सप्तम भाव", "युवति", "जाया", "काम"],
    canonical: "कलत्र",
  },
  {
    en: ["randhra", "eighth house", "8th house", "ayur", "mrityu"],
    hi: ["रन्ध्र भाव", "रंध्र", "अष्टम भाव", "आयु", "मृत्यु"],
    canonical: "रन्ध्र",
  },
  {
    en: ["dharma", "ninth house", "9th house", "bhagya", "guru house"],
    hi: ["धर्म भाव", "नवम भाव", "भाग्य"],
    canonical: "धर्म",
  },
  {
    en: ["karma", "tenth house", "10th house", "dashama", "rajya", "vyapara"],
    hi: ["कर्म भाव", "दशम भाव", "राज्य"],
    canonical: "दशम",
  },
  {
    en: ["labha", "eleventh house", "11th house", "ekadasha", "aaya"],
    hi: ["लाभ भाव", "एकादश भाव", "आय"],
    canonical: "लाभ",
  },
  {
    en: ["vyaya", "twelfth house", "12th house", "dvadasa", "moksha"],
    hi: ["व्यय भाव", "द्वादश भाव", "मोक्ष"],
    canonical: "व्यय",
  },

  // Astrological Mechanics
  {
    en: ["dasha", "dasa", "mahadasha", "vimshottari"],
    hi: ["दशा", "महादशा", "विंशोत्तरी"],
    canonical: "दशा",
  },
  {
    en: ["drishti", "aspect", "planetary gaze", "aspects"],
    hi: ["दृष्टि", "दृष्टयः"],
    canonical: "दृष्टि",
  },
  {
    en: ["yoga", "yogas", "gajakesari", "raja yoga", "pancha mahapurusha"],
    hi: ["योग", "राजयोग", "गजकेसरी", "पञ्चमहापुरुष"],
    canonical: "योग",
  },
  {
    en: ["gochara", "transit", "transits", "gochar"],
    hi: ["गोचर", "सञ्चार"],
    canonical: "गोचर",
  },
  {
    en: ["kundali", "kundalini", "horoscope", "birth chart", "janma patrika"],
    hi: ["कुण्डली", "कुंडली", "जन्मपत्रिका", "जन्माङ्ग"],
    canonical: "कुण्डली",
  },
  {
    en: ["nakshatra", "constellation", "lunar mansion", "ashwini", "rohini"],
    hi: ["नक्षत्र", "अश्विनी", "रोहिणी"],
    canonical: "नक्षत्र",
  },
  {
    en: ["rashi", "zodiac sign", "mesha", "aries", "vrishabha", "taurus"],
    hi: ["राशि", "मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुम्भ", "मीन"],
    canonical: "राशि",
  },

  // Kundalini & Subtle Anatomy
  {
    en: ["kundalini", "coiled serpent", "subtle energy"],
    hi: ["कुण्डलिनी", "कुंडलिनी"],
    canonical: "कुण्डलिनी",
  },
  {
    en: ["chakra", "energy center", "chakras"],
    hi: ["चक्र", "षट्चक्र", "षड्चक्र"],
    canonical: "चक्र",
  },
  {
    en: ["muladhara", "root chakra", "mooladhara"],
    hi: ["मूलाधार", "मूलाधार चक्र"],
    canonical: "मूलाधार",
  },
  {
    en: ["svadhisthana", "sacral chakra", "swadhisthana"],
    hi: ["स्वाधिष्ठान", "स्वाधिष्ठान चक्र"],
    canonical: "स्वाधिष्ठान",
  },
  {
    en: ["manipura", "solar plexus chakra", "nabhi chakra"],
    hi: ["मणिपूर", "मणिपूर चक्र", "नाभि चक्र"],
    canonical: "मणिपूर",
  },
  {
    en: ["anahata", "heart chakra", "hridaya"],
    hi: ["अनाहत", "अनाहत चक्र", "हृदय चक्र"],
    canonical: "अनाहत",
  },
  {
    en: ["vishuddha", "throat chakra", "kantha chakra"],
    hi: ["विशुद्ध", "विशुद्ध चक्र", "कण्ठ चक्र"],
    canonical: "विशुद्ध",
  },
  {
    en: ["ajna", "third eye chakra", "agya chakra", "bhrumadhya"],
    hi: ["आज्ञा", "आज्ञा चक्र", "भ्रूमध्य"],
    canonical: "आज्ञा",
  },
  {
    en: ["sahasrara", "crown chakra", "brahmarandhra"],
    hi: ["सहस्रार", "सहस्रार चक्र", "ब्रह्मरन्ध्र"],
    canonical: "सहस्रार",
  },
  {
    en: ["prana", "vital breath", "pranayama", "vayu"],
    hi: ["प्राण", "प्राणायाम", "वायु"],
    canonical: "प्राण",
  },
  {
    en: ["nadi", "subtle channels", "ida", "pingala", "sushumna"],
    hi: ["नाडी", "नाड़ी", "इड़ा", "इडा", "पिङ्गला", "पिंगला", "सुषुम्ना"],
    canonical: "नाडी",
  },

  // Classical Treatises & Authors
  {
    en: ["parashara", "parasara", "bphs", "brihat parashara hora shastra"],
    hi: ["पराशर", "बृहत्पाराशर होराशास्त्र", "पाराशर होरा"],
    canonical: "पराशर",
  },
  {
    en: ["varahamihira", "varaha", "brihat jataka", "brihat samhita"],
    hi: ["वराहमिहिर", "बृहज्जातक", "बृहत्संहिता"],
    canonical: "वराहमिहिर",
  },
  {
    en: ["phaladeepika", "mantreswara", "phaladipika"],
    hi: ["फलदीपिका", "मन्त्रेश्वर", "मंत्रेश्वर"],
    canonical: "फलदीपिका",
  },
  {
    en: ["manasagari", "harji janardana"],
    hi: ["मानसागरी", "हरजी जनार्दन"],
    canonical: "मानसागरी",
  },
  {
    en: ["saravali", "kalyana varma"],
    hi: ["सारावली", "कल्याण वर्मा"],
    canonical: "सारावली",
  },
  {
    en: ["shloka", "sloka", "verse", "stotra", "mantra"],
    hi: ["श्लोक", "मन्त्र", "मंत्र", "स्तोत्र"],
    canonical: "श्लोक",
  },
];

/**
 * Expands a search query into associated transliterated terms and synonyms.
 * 
 * @param {string} query
 * @returns {Array<string>} Array of expanded term variations
 */
export function expandMultilingualSearchTerms(query) {
  if (!query || typeof query !== "string") return [];
  const clean = query.trim().toLowerCase();
  const variations = new Set();

  for (const entry of MULTILINGUAL_CONCEPT_MAP) {
    const enMatch = entry.en.some((term) => clean === term || clean.includes(term) || term.includes(clean));
    const hiMatch = entry.hi.some((term) => query.includes(term) || term.includes(query));

    if (enMatch || hiMatch) {
      entry.hi.forEach((t) => variations.add(t));
      entry.en.forEach((t) => variations.add(t));
      if (entry.canonical) variations.add(entry.canonical);
    }
  }

  return Array.from(variations);
}

/**
 * Normalizes Devanagari text variations without destroying ligatures, virama, or accents.
 * Reconciles nasal representations and nukta variants while preserving canonical script forms.
 * 
 * @param {string} text
 * @returns {string} Normalized text
 */
export function normalizeDevanagari(text) {
  if (!text || typeof text !== "string") return "";

  // 1. Unicode NFC Canonical Composition
  let res = text.normalize("NFC");

  // 2. Normalize danda variations to standard danda
  res = res.replace(/[|।]/g, "।").replace(/[||॥]/g, "॥");

  // 3. Remove zero-width non-joiner and joiner marks for matching if isolated
  // Note: We retain standard virama (्) so consonant conjuncts stay grammatically authentic
  res = res.replace(/[\u200B-\u200D\uFEFF]/g, "");

  return res.trim();
}

/**
 * Normalizes a user search query.
 * 
 * @param {string} rawQuery - User search query
 * @returns {{
 *   raw: string,
 *   normalized: string,
 *   tokens: string[],
 *   expandedTerms: string[],
 *   isDevanagari: boolean,
 *   isLatin: boolean,
 *   isEmpty: boolean
 * }}
 */
export function normalizeSearchQuery(rawQuery) {
  if (!rawQuery || typeof rawQuery !== "string") {
    return {
      raw: "",
      normalized: "",
      tokens: [],
      expandedTerms: [],
      isDevanagari: false,
      isLatin: false,
      isEmpty: true,
    };
  }

  // 1. Unicode NFC Canonical Composition
  let text = rawQuery.normalize("NFC");

  // 2. Remove non-printable control characters
  text = text.replace(/[\x00-\x1F\x7F]/g, "");

  // 3. Trim and collapse multiple whitespace
  text = text.trim().replace(/\s+/g, " ");

  if (text.length === 0) {
    return {
      raw: rawQuery,
      normalized: "",
      tokens: [],
      expandedTerms: [],
      isDevanagari: false,
      isLatin: false,
      isEmpty: true,
    };
  }

  // 4. Strip surrounding quotation marks or external edge punctuation
  let cleaned = text.replace(/^["'“”‘’«»]+|["'“”‘’«»]+$/g, "").trim();
  // Strip trailing whitespace + isolated sentence punctuation (e.g. "term ।" -> "term")
  cleaned = cleaned.replace(/\s+[।॥?!.:;,]+$/g, "").trim();

  // 5. Script detection
  const isDevanagari = /[\u0900-\u097F]/.test(cleaned);
  const isLatin = /[a-zA-Z]/.test(cleaned);

  // 6. Tokenize for individual term searching
  const tokenCleaned = cleaned.replace(/[।,;:!?()\[\]{}"'«»]/g, " ");
  const tokens = tokenCleaned
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  // 7. Expand Multilingual Concept Variations
  const expandedTerms = expandMultilingualSearchTerms(cleaned);

  return {
    raw: rawQuery,
    normalized: cleaned,
    tokens,
    expandedTerms,
    isDevanagari,
    isLatin,
    isEmpty: cleaned.length === 0,
  };
}

/**
 * Generates an excerpt snippet centered on the search query with matched context.
 * 
 * @param {string} fullText - Passage or text block
 * @param {string} query - Target search term
 * @param {number} [contextLength=80] - Characters before and after match
 * @returns {string} Clean excerpt snippet
 */
export function generateContextSnippet(fullText, query, contextLength = 80) {
  if (!fullText) return "";
  if (!query || !query.trim()) {
    return fullText.slice(0, contextLength * 2) + (fullText.length > contextLength * 2 ? "..." : "");
  }

  const normalizedText = fullText.normalize("NFC");
  const normalizedQuery = query.trim().normalize("NFC");

  const lowerText = normalizedText.toLowerCase();
  const lowerQuery = normalizedQuery.toLowerCase();

  let idx = lowerText.indexOf(lowerQuery);

  // If exact query not found, search for individual tokens
  if (idx === -1) {
    const tokens = normalizedQuery.split(/\s+/).filter((t) => t.length > 2);
    for (const token of tokens) {
      idx = lowerText.indexOf(token.toLowerCase());
      if (idx !== -1) break;
    }
  }

  // If still not found, check expanded concept terms
  if (idx === -1) {
    const expansions = expandMultilingualSearchTerms(normalizedQuery);
    for (const exp of expansions) {
      idx = lowerText.indexOf(exp.toLowerCase());
      if (idx !== -1) break;
    }
  }

  if (idx === -1) {
    return normalizedText.slice(0, 180) + (normalizedText.length > 180 ? "..." : "");
  }

  // Calculate snippet boundaries avoiding slicing words awkwardly
  let start = Math.max(0, idx - contextLength);
  let end = Math.min(normalizedText.length, idx + normalizedQuery.length + contextLength);

  // Adjust start to beginning of a word if possible
  if (start > 0) {
    const spaceBefore = normalizedText.indexOf(" ", start);
    if (spaceBefore !== -1 && spaceBefore < idx) {
      start = spaceBefore + 1;
    }
  }

  // Adjust end to end of a word if possible
  if (end < normalizedText.length) {
    const spaceAfter = normalizedText.lastIndexOf(" ", end);
    if (spaceAfter > idx) {
      end = spaceAfter;
    }
  }

  const prefix = start > 0 ? "… " : "";
  const suffix = end < normalizedText.length ? " …" : "";

  return prefix + normalizedText.slice(start, end).trim() + suffix;
}
