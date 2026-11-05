/**
 * server/astrology/conceptRelationships.js
 * 
 * Verified, classical ontology cross-linking Vedic Astrology concepts
 * (Grahas, Bhavas, Rashis, Nakshatras, Panchang) and Kundalini Yogic concepts
 * (Chakras, Bija Mantras, Tattvas, Nadis, Granthis).
 * 
 * Grounded in:
 * - Brihat Parashara Hora Shastra (BPHS)
 * - Shat-Chakra-Nirupana & Shiva Samhita
 * - Saravali & Phaladeepika
 */

export const CONCEPT_RELATIONSHIPS = {
  // ==========================================================================
  // GRAHAS -> RASHIS, BHAVAS, NAKSHATRAS, CHAKRAS, TATTVAS
  // ==========================================================================
  "graha-surya": {
    id: "graha-surya",
    type: "graha",
    name: "Surya (Sun)",
    sanskrit: "सूर्य",
    ownSigns: ["rashi-simha"],
    exaltedIn: "rashi-mesha",
    debilitatedIn: "rashi-tula",
    karakaForBhavas: ["bhava-1", "bhava-9", "bhava-10"],
    rulesNakshatras: ["nakshatra-krittika", "nakshatra-uttara-phalguni", "nakshatra-uttara-ashadha"],
    subtleAnatomy: {
      chakra: "chakra-manipura",
      nadi: "Pingala Nadi (Surya Nadi / Solar Right Channel)",
      tattva: "Agni (Fire / Metabolic & Vital Radiance)",
      bija: "RAM (रम्)"
    },
    classicalReasoning: "Surya is the cosmic soul (Atmakaraka) and supreme source of Prana. It governs the digestive and energetic fire (Jatharagni) centered in Manipura Chakra and flows dynamically through the heating Pingala Nadi on the right side of the body."
  },
  "graha-chandra": {
    id: "graha-chandra",
    type: "graha",
    name: "Chandra (Moon)",
    sanskrit: "चन्द्र",
    ownSigns: ["rashi-karka"],
    exaltedIn: "rashi-vrishabha",
    debilitatedIn: "rashi-vrishchika",
    karakaForBhavas: ["bhava-4"],
    rulesNakshatras: ["nakshatra-rohini", "nakshatra-hasta", "nakshatra-shravana"],
    subtleAnatomy: {
      chakra: "chakra-ajna",
      associatedChakra: "chakra-svadhisthana",
      nadi: "Ida Nadi (Chandra Nadi / Lunar Left Channel)",
      tattva: "Jala (Water / Soma / Liquid Mind)",
      bija: "VAM (वम्)"
    },
    classicalReasoning: "Chandra governs the sensory mind (Manas) and fluid consciousness (Soma). In yogic physiology, Chandra is associated with the calming, cooling left Ida Nadi and the psychic reflection in Ajna, while governing the water element (Jala Tattva) centered in Svadhisthana."
  },
  "graha-mangala": {
    id: "graha-mangala",
    type: "graha",
    name: "Mangala (Mars)",
    sanskrit: "मङ्गल",
    ownSigns: ["rashi-mesha", "rashi-vrishchika"],
    exaltedIn: "rashi-makara",
    debilitatedIn: "rashi-karka",
    karakaForBhavas: ["bhava-3", "bhava-6"],
    rulesNakshatras: ["nakshatra-mrigashira", "nakshatra-chitra", "nakshatra-dhanishta"],
    subtleAnatomy: {
      chakra: "chakra-muladhara",
      associatedChakra: "chakra-manipura",
      tattva: "Agni / Prithvi (Fiery Drive & Grounded Courage)",
      bija: "LAM / RAM"
    },
    classicalReasoning: "Mars rules Aries (cardinal fire) and Scorpio (fixed water/kundalini depths). It provides the raw physical courage and stamina anchored in Muladhara and fuels focused willpower in Manipura."
  },
  "graha-budha": {
    id: "graha-budha",
    type: "graha",
    name: "Budha (Mercury)",
    sanskrit: "बुध",
    ownSigns: ["rashi-mithuna", "rashi-kanya"],
    exaltedIn: "rashi-kanya",
    debilitatedIn: "rashi-meena",
    karakaForBhavas: ["bhava-2", "bhava-10"],
    rulesNakshatras: ["nakshatra-ashlesha", "nakshatra-jyeshtha", "nakshatra-revati"],
    subtleAnatomy: {
      chakra: "chakra-vishuddha",
      associatedChakra: "chakra-ajna",
      tattva: "Prithvi / Vayu (Analytical Earth & Communicative Air)",
      bija: "HAM / OM"
    },
    classicalReasoning: "Budha is the planet of intellect (Buddhi), articulation, and discrimination. In yogic theory, articulate speech and vocal communication reside in Vishuddha Chakra, while rational discrimination links directly to Ajna."
  },
  "graha-guru": {
    id: "graha-guru",
    type: "graha",
    name: "Guru (Jupiter)",
    sanskrit: "गुरु",
    ownSigns: ["rashi-dhanu", "rashi-meena"],
    exaltedIn: "rashi-karka",
    debilitatedIn: "rashi-makara",
    karakaForBhavas: ["bhava-2", "bhava-5", "bhava-9", "bhava-11"],
    rulesNakshatras: ["nakshatra-punarvasu", "nakshatra-vishakha", "nakshatra-purva-bhadrapada"],
    subtleAnatomy: {
      chakra: "chakra-ajna",
      associatedChakra: "chakra-sahasrara",
      tattva: "Akasha (Ether / Space of Boundless Wisdom)",
      bija: "OM (ॐ)"
    },
    classicalReasoning: "Guru represents divine wisdom, Dharma, and expansion. Ruling Akasha (the all-permeating ether), Jupiter resonates with the higher intellectual clarity of Ajna and the spiritual grace of Sahasrara."
  },
  "graha-shukra": {
    id: "graha-shukra",
    type: "graha",
    name: "Shukra (Venus)",
    sanskrit: "शुक्र",
    ownSigns: ["rashi-vrishabha", "rashi-tula"],
    exaltedIn: "rashi-meena",
    debilitatedIn: "rashi-kanya",
    karakaForBhavas: ["bhava-4", "bhava-7", "bhava-12"],
    rulesNakshatras: ["nakshatra-bharani", "nakshatra-purva-phalguni", "nakshatra-purva-ashadha"],
    subtleAnatomy: {
      chakra: "chakra-anahata",
      associatedChakra: "chakra-svadhisthana",
      tattva: "Jala (Water of Creative Love & Rejuvenation)",
      bija: "YAM / VAM"
    },
    classicalReasoning: "Shukra embodies artistic refinement, unconditional love (Prema), and the regenerative Sanjivani nectar. It governs emotional reciprocity in Anahata (Heart) and creative procreation in Svadhisthana."
  },
  "graha-shani": {
    id: "graha-shani",
    type: "graha",
    name: "Shani (Saturn)",
    sanskrit: "शनि",
    ownSigns: ["rashi-makara", "rashi-kumbha"],
    exaltedIn: "rashi-tula",
    debilitatedIn: "rashi-mesha",
    karakaForBhavas: ["bhava-6", "bhava-8", "bhava-10", "bhava-12"],
    rulesNakshatras: ["nakshatra-pushya", "nakshatra-anuradha", "nakshatra-uttara-bhadrapada"],
    subtleAnatomy: {
      chakra: "chakra-muladhara",
      granthi: "Brahma Granthi (Root Knot of Material Attachment)",
      tattva: "Vayu (Air of Detachment & Structural Time)",
      bija: "LAM (लम्)"
    },
    classicalReasoning: "Shani represents inexorable Time (Kala), discipline, endurance, and detachment (Vairagya). Its sobering stability anchors Muladhara, requiring the yogi to pierce Brahma Granthi before ascending the Sushumna."
  },
  "graha-rahu": {
    id: "graha-rahu",
    type: "graha",
    name: "Rahu (North Lunar Node)",
    sanskrit: "राहु",
    coRulesSign: "rashi-kumbha",
    exaltedIn: "rashi-vrishabha",
    debilitatedIn: "rashi-vrishchika",
    rulesNakshatras: ["nakshatra-ardra", "nakshatra-swati", "nakshatra-shatabhisha"],
    subtleAnatomy: {
      chakra: "chakra-ajna",
      aspect: "Maya Shakti (Exploratory Worldly Hunger & Future Projection)",
      tattva: "Vayu / Chhaya (Shadow Astral Current)"
    },
    classicalReasoning: "Rahu represents the ascending lunar intersection point, driving human consciousness toward outer expansion, technology, and unfulfilled desire. It tests discernment at the threshold of Ajna."
  },
  "graha-ketu": {
    id: "graha-ketu",
    type: "graha",
    name: "Ketu (South Lunar Node)",
    sanskrit: "केतु",
    coRulesSign: "rashi-vrishchika",
    exaltedIn: "rashi-vrishchika",
    debilitatedIn: "rashi-vrishabha",
    rulesNakshatras: ["nakshatra-ashwini", "nakshatra-magha", "nakshatra-mula"],
    subtleAnatomy: {
      chakra: "chakra-sahasrara",
      associatedChakra: "chakra-muladhara",
      aspect: "Mokshakaraka (Kundalini Awakening & Spiritual Dissolution)",
      tattva: "Agni / Chhaya (Dissolving Spiritual Flame)"
    },
    classicalReasoning: "Ketu represents spiritual liberation (Moksha), ancestral wisdom, and ego-dissolution. Symbolized as the serpent's tail, Ketu stirs the coiled Kundalini at Muladhara and guides the soul toward liberation in Sahasrara."
  },

  // ==========================================================================
  // CHAKRAS -> ELEMENTS, BIJA MANTRAS, GRAHAS, NADIS, GRANTHIS
  // ==========================================================================
  "chakra-muladhara": {
    id: "chakra-muladhara",
    type: "chakra",
    name: "Muladhara (Root Chakra)",
    sanskrit: "मूलाधार",
    tattva: "Prithvi (Earth)",
    bija: "LAM (लम्)",
    petals: 4,
    petalsLetters: "वं (Vaṁ), शं (Śaṁ), षं (Ṣaṁ), सं (Saṁ)",
    nadiIntersection: "Origin of Sushumna, Ida, and Pingala Nadis (Yukta Triveni)",
    granthi: "Brahma Granthi (Knot of Physical & Material Attachment)",
    relatedGrahas: ["graha-mangala", "graha-shani", "graha-ketu"],
    relatedRashis: ["rashi-makara", "rashi-vrishabha", "rashi-kanya"],
    relatedBhavas: ["bhava-1", "bhava-2"],
    classicalCitation: "Shat-Chakra-Nirupana v. 4-13; Shiva Samhita Ch. 5, v. 64-75"
  },
  "chakra-svadhisthana": {
    id: "chakra-svadhisthana",
    type: "chakra",
    name: "Svadhisthana (Sacral Chakra)",
    sanskrit: "स्वाधिष्ठान",
    tattva: "Jala (Water)",
    bija: "VAM (वम्)",
    petals: 6,
    petalsLetters: "बं (Baṁ), भं (Bhaṁ), मं (Maṁ), यं (Yaṁ), रं (Raṁ), लं (Laṁ)",
    relatedGrahas: ["graha-chandra", "graha-shukra"],
    relatedRashis: ["rashi-karka", "rashi-vrishchika", "rashi-meena"],
    relatedBhavas: ["bhava-4", "bhava-7", "bhava-8"],
    classicalCitation: "Shat-Chakra-Nirupana v. 14-18; Shiva Samhita Ch. 5, v. 76-85"
  },
  "chakra-manipura": {
    id: "chakra-manipura",
    type: "chakra",
    name: "Manipura (Solar Plexus Chakra)",
    sanskrit: "मणिपूर",
    tattva: "Agni (Fire)",
    bija: "RAM (रम्)",
    petals: 10,
    petalsLetters: "डं (Ḍaṁ), ढं (Ḍhaṁ), णं (Ṇaṁ), तं (Taṁ), थं (Thaṁ), दं (Daṁ), धं (Dhaṁ), नं (Naṁ), पं (Paṁ), फं (Phaṁ)",
    relatedGrahas: ["graha-surya", "graha-mangala"],
    relatedRashis: ["rashi-mesha", "rashi-simha", "rashi-dhanu"],
    relatedBhavas: ["bhava-3", "bhava-5", "bhava-6"],
    classicalCitation: "Shat-Chakra-Nirupana v. 19-21; Hatha Yoga Pradipika Ch. 3, v. 79-82"
  },
  "chakra-anahata": {
    id: "chakra-anahata",
    type: "chakra",
    name: "Anahata (Heart Chakra)",
    sanskrit: "अनाहत",
    tattva: "Vayu (Air)",
    bija: "YAM (यम्)",
    petals: 12,
    petalsLetters: "कं (Kaṁ), खं (Khaṁ), गं (Gaṁ), घं (Ghaṁ), ङं (Ṅaṁ), चं (Caṁ), छं (Chaṁ), जं (Jaṁ), झं (Jhaṁ), ञं (Ñaṁ), टं (Ṭaṁ), ठं (Ṭhaṁ)",
    granthi: "Vishnu Granthi (Knot of Emotional & Interpersonal Attachment)",
    relatedGrahas: ["graha-shukra", "graha-chandra"],
    relatedRashis: ["rashi-mithuna", "rashi-tula", "rashi-kumbha"],
    relatedBhavas: ["bhava-4", "bhava-9"],
    classicalCitation: "Shat-Chakra-Nirupana v. 22-27; Shiva Samhita Ch. 5, v. 86-96"
  },
  "chakra-vishuddha": {
    id: "chakra-vishuddha",
    type: "chakra",
    name: "Vishuddha (Throat Chakra)",
    sanskrit: "विशुद्ध",
    tattva: "Akasha (Space / Ether)",
    bija: "HAM (हम्)",
    petals: 16,
    petalsLetters: "All 16 Sanskrit Vowels: अं (Aṁ), आं (Āṁ), इं (Iṁ), ईं (Īṁ), उं (Uṁ), ऊं (Ūṁ), ऋं (Ṛṁ), ॠं (Ṝṁ), ऌं (Ḷṁ), ॡं (Ḹṁ), एं (Eṁ), ऐं (Aiṁ), ओं (Oṁ), औं (Auṁ), अं (Aṁ), अः (Aḥ)",
    relatedGrahas: ["graha-budha", "graha-guru"],
    relatedRashis: ["rashi-mithuna", "rashi-kanya"],
    relatedBhavas: ["bhava-2", "bhava-3"],
    classicalCitation: "Shat-Chakra-Nirupana v. 28-31; Shiva Samhita Ch. 5, v. 97-105"
  },
  "chakra-ajna": {
    id: "chakra-ajna",
    type: "chakra",
    name: "Ajna (Third Eye Chakra)",
    sanskrit: "आज्ञा",
    tattva: "Mahat / Manas (Pure Intellect & Receptive Witness)",
    bija: "OM (ॐ)",
    petals: 2,
    petalsLetters: "हं (Haṁ), क्षं (Kṣaṁ)",
    nadiIntersection: "Mukta Triveni (Confluence where Ida and Pingala merge into Sushumna)",
    granthi: "Rudra Granthi (Knot of Egoic Individuation / Ahankara)",
    relatedGrahas: ["graha-guru", "graha-surya", "graha-chandra", "graha-rahu"],
    relatedRashis: ["rashi-dhanu", "rashi-meena"],
    relatedBhavas: ["bhava-9", "bhava-10"],
    classicalCitation: "Shat-Chakra-Nirupana v. 32-39; Tantraloka Ahnika 5"
  },
  "chakra-sahasrara": {
    id: "chakra-sahasrara",
    type: "chakra",
    name: "Sahasrara (Crown Lotus)",
    sanskrit: "सहस्रार",
    tattva: "Paramatman / Chit (Transcendental Consciousness)",
    bija: "Silent Resonance (Anahata Nada)",
    petals: 1000,
    petalsLetters: "All 50 Sanskrit letters cycling 20 times across 1000 petals",
    relatedGrahas: ["graha-ketu", "graha-guru"],
    relatedRashis: ["rashi-meena"],
    relatedBhavas: ["bhava-12"],
    classicalCitation: "Shat-Chakra-Nirupana v. 40-49; Shiva Samhita Ch. 5, v. 150-165"
  }
};

/**
 * Helper to retrieve related concept nodes for any entity.
 * 
 * @param {string} conceptKey e.g. "graha-surya", "chakra-anahata", "bhava-1"
 * @returns {Array<Object>} List of linked concept descriptors
 */
export function getRelatedConcepts(conceptKey) {
  if (!conceptKey) return [];
  const normalized = conceptKey.toLowerCase().trim();

  // If directly defined in ontology
  if (CONCEPT_RELATIONSHIPS[normalized]) {
    const entry = CONCEPT_RELATIONSHIPS[normalized];
    const related = [];

    // Map own signs
    if (entry.ownSigns) {
      entry.ownSigns.forEach((rId) => related.push({ key: rId, category: "rashis", relation: "Own Sign (Swakshetra)" }));
    }
    if (entry.exaltedIn) {
      related.push({ key: entry.exaltedIn, category: "rashis", relation: "Exaltation (Uchcha)" });
    }
    if (entry.debilitatedIn) {
      related.push({ key: entry.debilitatedIn, category: "rashis", relation: "Debilitation (Neecha)" });
    }
    if (entry.karakaForBhavas) {
      entry.karakaForBhavas.forEach((bId) => related.push({ key: bId, category: "bhavas", relation: "Natural Karaka" }));
    }
    if (entry.rulesNakshatras) {
      entry.rulesNakshatras.forEach((nId) => related.push({ key: nId, category: "nakshatras", relation: "Vimshottari Ruler" }));
    }
    if (entry.subtleAnatomy?.chakra) {
      related.push({ key: entry.subtleAnatomy.chakra, category: "kundalini", relation: `Yogic Resonance: ${entry.subtleAnatomy.tattva || ""}` });
    }
    if (entry.subtleAnatomy?.nadi) {
      related.push({ key: `nadi-${entry.subtleAnatomy.nadi.toLowerCase().split(" ")[0]}`, category: "kundalini", relation: `Nadi Channel: ${entry.subtleAnatomy.nadi}` });
    }
    if (entry.subtleAnatomy?.tattva) {
      related.push({ key: `tattva-${entry.subtleAnatomy.tattva.toLowerCase().split(" ")[0]}`, category: "kundalini", relation: `Tattva: ${entry.subtleAnatomy.tattva}` });
    }
    if (entry.tattva) {
      related.push({ key: `tattva-${entry.tattva.toLowerCase().split(" ")[0]}`, category: "kundalini", relation: `Tattva: ${entry.tattva}` });
    }
    if (entry.bija) {
      related.push({ key: `bija-${entry.bija.toLowerCase().split(" ")[0]}`, category: "kundalini", relation: `Bija Mantra: ${entry.bija}` });
    }
    if (entry.granthi) {
      related.push({ key: `granthi-${entry.granthi.toLowerCase().split(" ")[0]}`, category: "kundalini", relation: `Spiritual Granthi: ${entry.granthi}` });
    }
    if (entry.relatedGrahas) {
      entry.relatedGrahas.forEach((gId) => related.push({ key: gId, category: "grahas", relation: "Cosmic Graha Resonance" }));
    }
    if (entry.relatedRashis) {
      entry.relatedRashis.forEach((rId) => related.push({ key: rId, category: "rashis", relation: "Elemental Rashi Resonance" }));
    }
    if (entry.relatedBhavas) {
      entry.relatedBhavas.forEach((bId) => related.push({ key: bId, category: "bhavas", relation: "Related Life House" }));
    }

    return related;
  }

  // Handle Bhavas e.g. "bhava-1"
  if (normalized.startsWith("bhava-")) {
    const num = parseInt(normalized.replace("bhava-", ""), 10);
    const related = [];
    if (num === 1) related.push({ key: "graha-surya", category: "grahas", relation: "Karaka: Surya" }, { key: "chakra-muladhara", category: "kundalini", relation: "Physical Embodiment" });
    if (num === 2) related.push({ key: "graha-guru", category: "grahas", relation: "Karaka: Guru" }, { key: "graha-budha", category: "grahas", relation: "Speech: Budha" }, { key: "chakra-vishuddha", category: "kundalini", relation: "Vocal Center" });
    if (num === 3) related.push({ key: "graha-mangala", category: "grahas", relation: "Karaka: Mangala" }, { key: "graha-budha", category: "grahas", relation: "Communication: Budha" }, { key: "chakra-manipura", category: "kundalini", relation: "Willpower & Drive" });
    if (num === 4) related.push({ key: "graha-chandra", category: "grahas", relation: "Karaka: Chandra" }, { key: "graha-shukra", category: "grahas", relation: "Vehicle Karaka: Shukra" }, { key: "chakra-anahata", category: "kundalini", relation: "Seat of Emotional Contentment" });
    if (num === 5) related.push({ key: "graha-guru", category: "grahas", relation: "Karaka: Guru" }, { key: "chakra-manipura", category: "kundalini", relation: "Creative Discernment" });
    if (num === 6) related.push({ key: "graha-mangala", category: "grahas", relation: "Overcoming Rivals: Mangala" }, { key: "graha-shani", category: "grahas", relation: "Labor & Seva: Shani" });
    if (num === 7) related.push({ key: "graha-shukra", category: "grahas", relation: "Karaka: Shukra" }, { key: "chakra-svadhisthana", category: "kundalini", relation: "Interpersonal Polarity" });
    if (num === 8) related.push({ key: "graha-shani", category: "grahas", relation: "Karaka: Shani" }, { key: "chakra-muladhara", category: "kundalini", relation: "Kundalini Root Alchemy" });
    if (num === 9) related.push({ key: "graha-guru", category: "grahas", relation: "Karaka: Guru" }, { key: "graha-surya", category: "grahas", relation: "Paternal Lineage: Surya" }, { key: "chakra-ajna", category: "kundalini", relation: "Higher Wisdom Guidance" });
    if (num === 10) related.push({ key: "graha-surya", category: "grahas", relation: "Executive Karma: Surya" }, { key: "graha-shani", category: "grahas", relation: "Professional Labor: Shani" }, { key: "graha-budha", category: "grahas", relation: "Commercial Mastery: Budha" });
    if (num === 11) related.push({ key: "graha-guru", category: "grahas", relation: "Karaka: Guru" });
    if (num === 12) related.push({ key: "graha-shani", category: "grahas", relation: "Solitude: Shani" }, { key: "graha-ketu", category: "grahas", relation: "Mokshakaraka: Ketu" }, { key: "chakra-sahasrara", category: "kundalini", relation: "Spiritual Transcendence" });
    return related;
  }

  // Handle Rashis e.g. "rashi-mesha"
  if (normalized.startsWith("rashi-")) {
    const rName = normalized.replace("rashi-", "");
    const related = [];
    if (rName === "mesha") related.push({ key: "graha-mangala", category: "grahas", relation: "Ruler: Mars" }, { key: "graha-surya", category: "grahas", relation: "Exaltation of Sun" }, { key: "chakra-manipura", category: "kundalini", relation: "Agni Tattva" });
    if (rName === "vrishabha") related.push({ key: "graha-shukra", category: "grahas", relation: "Ruler: Venus" }, { key: "graha-chandra", category: "grahas", relation: "Exaltation of Moon" }, { key: "chakra-muladhara", category: "kundalini", relation: "Prithvi Tattva" });
    if (rName === "mithuna") related.push({ key: "graha-budha", category: "grahas", relation: "Ruler: Mercury" }, { key: "chakra-vishuddha", category: "kundalini", relation: "Vayu & Speech" });
    if (rName === "karka") related.push({ key: "graha-chandra", category: "grahas", relation: "Ruler: Moon" }, { key: "graha-guru", category: "grahas", relation: "Exaltation of Jupiter" }, { key: "chakra-svadhisthana", category: "kundalini", relation: "Jala Tattva" });
    if (rName === "simha") related.push({ key: "graha-surya", category: "grahas", relation: "Ruler: Sun" }, { key: "chakra-manipura", category: "kundalini", relation: "Agni Tattva" });
    if (rName === "kanya") related.push({ key: "graha-budha", category: "grahas", relation: "Ruler & Exaltation: Mercury" }, { key: "chakra-vishuddha", category: "kundalini", relation: "Analytical Service" });
    if (rName === "tula") related.push({ key: "graha-shukra", category: "grahas", relation: "Ruler: Venus" }, { key: "graha-shani", category: "grahas", relation: "Exaltation of Saturn" }, { key: "chakra-anahata", category: "kundalini", relation: "Vayu Tattva & Harmony" });
    if (rName === "vrishchika") related.push({ key: "graha-mangala", category: "grahas", relation: "Ruler: Mars / Ketu" }, { key: "chakra-muladhara", category: "kundalini", relation: "Deep Transformation" });
    if (rName === "dhanu") related.push({ key: "graha-guru", category: "grahas", relation: "Ruler: Jupiter" }, { key: "chakra-ajna", category: "kundalini", relation: "Dharma & Wisdom" });
    if (rName === "makara") related.push({ key: "graha-shani", category: "grahas", relation: "Ruler: Saturn" }, { key: "graha-mangala", category: "grahas", relation: "Exaltation of Mars" }, { key: "chakra-muladhara", category: "kundalini", relation: "Prithvi Tattva & Discipline" });
    if (rName === "kumbha") related.push({ key: "graha-shani", category: "grahas", relation: "Ruler: Saturn / Rahu" }, { key: "chakra-anahata", category: "kundalini", relation: "Humanitarian Vayu" });
    if (rName === "meena") related.push({ key: "graha-guru", category: "grahas", relation: "Ruler: Jupiter" }, { key: "graha-shukra", category: "grahas", relation: "Exaltation of Venus" }, { key: "chakra-sahasrara", category: "kundalini", relation: "Moksha & Dissolution" });
    return related;
  }

  // Handle Nakshatras e.g. "nakshatra-ashwini"
  if (normalized.startsWith("nakshatra-")) {
    const nName = normalized.replace("nakshatra-", "");
    const related = [];
    if (nName.includes("ashwini")) related.push({ key: "graha-ketu", category: "grahas", relation: "Vimshottari Ruler: Ketu" }, { key: "rashi-mesha", category: "rashis", relation: "Rashi: Aries (0°-13°20')" });
    if (nName.includes("bharani")) related.push({ key: "graha-shukra", category: "grahas", relation: "Vimshottari Ruler: Venus" }, { key: "rashi-mesha", category: "rashis", relation: "Rashi: Aries (13°20'-26°40')" });
    if (nName.includes("krittika")) related.push({ key: "graha-surya", category: "grahas", relation: "Vimshottari Ruler: Sun" }, { key: "rashi-mesha", category: "rashis", relation: "Pada 1 in Mesha" }, { key: "rashi-vrishabha", category: "rashis", relation: "Padas 2-4 in Vrishabha" });
    if (nName.includes("rohini")) related.push({ key: "graha-chandra", category: "grahas", relation: "Vimshottari Ruler: Moon" }, { key: "rashi-vrishabha", category: "rashis", relation: "Rashi: Taurus (10°-23°20')" });
    if (nName.includes("mrigashira")) related.push({ key: "graha-mangala", category: "grahas", relation: "Vimshottari Ruler: Mars" }, { key: "rashi-vrishabha", category: "rashis", relation: "Padas 1-2" }, { key: "rashi-mithuna", category: "rashis", relation: "Padas 3-4" });
    if (nName.includes("ardra")) related.push({ key: "graha-rahu", category: "grahas", relation: "Vimshottari Ruler: Rahu" }, { key: "rashi-mithuna", category: "rashis", relation: "Rashi: Gemini (6°40'-20°)" });
    if (nName.includes("punarvasu")) related.push({ key: "graha-guru", category: "grahas", relation: "Vimshottari Ruler: Jupiter" }, { key: "rashi-mithuna", category: "rashis", relation: "Padas 1-3" }, { key: "rashi-karka", category: "rashis", relation: "Pada 4" });
    if (nName.includes("pushya")) related.push({ key: "graha-shani", category: "grahas", relation: "Vimshottari Ruler: Saturn" }, { key: "rashi-karka", category: "rashis", relation: "Rashi: Cancer (3°20'-16°40')" });
    if (nName.includes("ashlesha")) related.push({ key: "graha-budha", category: "grahas", relation: "Vimshottari Ruler: Mercury" }, { key: "rashi-karka", category: "rashis", relation: "Rashi: Cancer (16°40'-30°)" }, { key: "chakra-muladhara", category: "kundalini", relation: "Serpentine Awakening" });
    if (nName.includes("magha")) related.push({ key: "graha-ketu", category: "grahas", relation: "Vimshottari Ruler: Ketu" }, { key: "rashi-simha", category: "rashis", relation: "Rashi: Leo (0°-13°20')" });
    return related;
  }

  return [];
}
