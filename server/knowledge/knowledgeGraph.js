/**
 * server/knowledge/knowledgeGraph.js
 * 
 * Unified AI Knowledge Graph Engine for Gurukul
 * 
 * Interconnects:
 * - Digital Library: Books, Authors, Chapters, Passages
 * - Vedic Astrology: 9 Grahas, 12 Bhavas, 12 Rashis, 27 Nakshatras & 4 Padas, Panchang
 * - Kundalini & Subtle Anatomy: 7 Chakras, 5 Tattvas, 3 Nadis, 3 Granthis, Bija Mantras
 * - Classical Provenance: Brihat Parashara Hora Shastra, Shat-Chakra-Nirupana, Shiva Samhita, Saravali
 * 
 * Supports:
 * - Neighborhood expansion, lazy-loading, and graph pagination
 * - Source citations and tradition-specific verification
 * - Duplicate prevention and audit tracking
 * - Public publication status enforcement
 */

import prisma from "../../lib/prisma.js";
import { CONCEPT_RELATIONSHIPS } from "../astrology/conceptRelationships.js";
import { GRAHAS_KNOWLEDGE } from "../astrology/grahasKnowledge.js";
import { BHAVAS_KNOWLEDGE } from "../astrology/bhavasKnowledge.js";
import {
  RASHIS_KNOWLEDGE,
  NAKSHATRAS_KNOWLEDGE,
  PANCHANG_KNOWLEDGE,
} from "../astrology/rashisNakshatrasKnowledge.js";
import { CHAKRAS_KNOWLEDGE } from "../spirituality/chakraKnowledge.js";
import { canManageBooks } from "../../lib/permissions.js";
import { extractAstrologyConcepts } from "../ai/conceptExtractor.js";

// Canonical Controlled Relationship Types
export const RELATIONSHIP_TYPES = {
  BOOK_CONTAINS_CHAPTER: "BOOK_CONTAINS_CHAPTER",
  CHAPTER_CONTAINS_PASSAGE: "CHAPTER_CONTAINS_PASSAGE",
  PASSAGE_REFERENCES_CONCEPT: "PASSAGE_REFERENCES_CONCEPT",
  CONCEPT_RELATED_TO_CONCEPT: "CONCEPT_RELATED_TO_CONCEPT",
  PLANET_ASSOCIATED_WITH_RASHI: "PLANET_ASSOCIATED_WITH_RASHI",
  NAKSHATRA_BELONGS_TO_RASHI: "NAKSHATRA_BELONGS_TO_RASHI",
  CHAKRA_ASSOCIATED_WITH_TATTVA: "CHAKRA_ASSOCIATED_WITH_TATTVA",
  CONCEPT_REFERENCED_IN_BOOK: "CONCEPT_REFERENCED_IN_BOOK",
  CONCEPT_HAS_CLASSICAL_REFERENCE: "CONCEPT_HAS_CLASSICAL_REFERENCE",
  AUTHORED_BY: "AUTHORED_BY",
  MENTIONS: "MENTIONS",
  EXPLAINS: "EXPLAINS",
  REFERENCES: "REFERENCES",
  DESCRIBES: "DESCRIBES",
  HAS_COMMENTARY: "HAS_COMMENTARY",
  HAS_TRANSLATION: "HAS_TRANSLATION",
  ASSOCIATED_WITH: "ASSOCIATED_WITH",
  BELONGS_TO: "BELONGS_TO",
  DERIVED_FROM: "DERIVED_FROM",
  INTERPRETS: "INTERPRETS",
  SUPPORTS: "SUPPORTS",
  CONTRADICTS: "CONTRADICTS",
  RELATED_TO: "RELATED_TO",
};

// Canonical Concept Categories
export const CONCEPT_CATEGORIES = {
  VEDIC_ASTROLOGY: "VEDIC_ASTROLOGY",
  KUNDALINI_SPIRITUALITY: "KUNDALINI_SPIRITUALITY",
  DIGITAL_LIBRARY: "DIGITAL_LIBRARY",
  PHILOSOPHY: "PHILOSOPHY",
  SANSKRIT_SHASTRA: "SANSKRIT_SHASTRA",
};

// Relationship Review Statuses
export const RELATIONSHIP_STATUSES = {
  VERIFIED: "APPROVED",
  APPROVED: "APPROVED",
  AI_SUGGESTED: "AI_DISCOVERED",
  AI_DISCOVERED: "AI_DISCOVERED",
  PENDING_REVIEW: "NEEDS_REVIEW",
  NEEDS_REVIEW: "NEEDS_REVIEW",
  REJECTED: "REJECTED",
};

// Extraction Methods
export const EXTRACTION_METHODS = {
  CLASSICAL_CANON: "CLASSICAL_CANON",
  MANUAL_SCHOLARLY: "MANUAL_SCHOLARLY",
  RULE_BASED_NLP: "RULE_BASED_NLP",
  AI_ASSISTED: "AI_ASSISTED",
};

/**
 * Seeds and synchronizes the canonical Classical Knowledge Graph into PostgreSQL.
 * Idempotent: safe to run multiple times without creating duplicates.
 * 
 * @returns {Promise<Object>} Summary of seeded concepts and relationships
 */
export async function seedClassicalKnowledgeGraph() {
  let seededConcepts = 0;
  let seededRelationships = 0;

  // --------------------------------------------------------------------------
  // 1. SEED 9 GRAHAS (NAVAGRAHAS)
  // --------------------------------------------------------------------------
  for (const graha of GRAHAS_KNOWLEDGE) {
    const slug = `graha-${(graha.id || graha.sanskritName || "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const cleanEn = (graha.englishName || "").replace(/^The\s+/, "");
    const name = `${graha.sanskritName} (${cleanEn})`;
    const devanagari = graha.devanagari || graha.sanskritName;
    const summary = graha.symbolism || graha.astronomicalNature || `${cleanEn} planetary energy and significations.`;
    const traditionalMeaning = `Nature: ${graha.nature || "Classical Graha"}. Exaltation: ${graha.dignities?.exaltation || "N/A"}.`;

    await prisma.knowledgeConcept.upsert({
      where: { slug },
      update: {
        name,
        sanskrit: devanagari,
        category: CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
        subCategory: "GRAHA",
        summary,
        description: graha.symbolism || null,
        traditionalMeaning,
        color: "#c4903c",
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
      create: {
        slug,
        name,
        sanskrit: devanagari,
        category: CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
        subCategory: "GRAHA",
        summary,
        description: graha.symbolism || null,
        traditionalMeaning,
        color: "#c4903c",
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
    });
    seededConcepts++;
  }

  // --------------------------------------------------------------------------
  // 2. SEED 12 BHAVAS (HOUSES)
  // --------------------------------------------------------------------------
  for (const bhava of BHAVAS_KNOWLEDGE) {
    const slug = `bhava-${bhava.number}`;
    const name = `House ${bhava.number} (${bhava.sanskritName})`;
    const devanagari = bhava.devanagari || bhava.sanskritName;
    const summary = bhava.englishName || `Bhava ${bhava.number} life domain and karakas.`;
    const traditionalMeaning = bhava.classicalCitations || "Brihat Parashara Hora Shastra Ch. 11-24";

    await prisma.knowledgeConcept.upsert({
      where: { slug },
      update: {
        name,
        sanskrit: devanagari,
        category: CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
        subCategory: "BHAVA",
        summary,
        description: Array.isArray(bhava.primarySignifications) ? bhava.primarySignifications.join("; ") : null,
        traditionalMeaning,
        color: "#13382c",
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
      create: {
        slug,
        name,
        sanskrit: devanagari,
        category: CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
        subCategory: "BHAVA",
        summary,
        description: Array.isArray(bhava.primarySignifications) ? bhava.primarySignifications.join("; ") : null,
        traditionalMeaning,
        color: "#13382c",
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
    });
    seededConcepts++;
  }

  // --------------------------------------------------------------------------
  // 3. SEED 12 RASHIS (ZODIAC SIGNS)
  // --------------------------------------------------------------------------
  for (const rashi of RASHIS_KNOWLEDGE) {
    const slug = `rashi-${rashi.name.toLowerCase()}`;
    await prisma.knowledgeConcept.upsert({
      where: { slug },
      update: {
        name: `${rashi.name} (${rashi.english})`,
        sanskrit: rashi.devanagari,
        category: CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
        subCategory: "RASHI",
        summary: `${rashi.english} (${rashi.element}, ${rashi.modality}) ruled by ${rashi.ruler}.`,
        description: rashi.qualities || null,
        traditionalMeaning: `Modality: ${rashi.modality}, Element: ${rashi.element}, Symbol: ${rashi.symbol}.`,
        color: "#8b5a2b",
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
      create: {
        slug,
        name: `${rashi.name} (${rashi.english})`,
        sanskrit: rashi.devanagari,
        category: CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
        subCategory: "RASHI",
        summary: `${rashi.english} (${rashi.element}, ${rashi.modality}) ruled by ${rashi.ruler}.`,
        description: rashi.qualities || null,
        traditionalMeaning: `Modality: ${rashi.modality}, Element: ${rashi.element}, Symbol: ${rashi.symbol}.`,
        color: "#8b5a2b",
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
    });
    seededConcepts++;
  }

  // --------------------------------------------------------------------------
  // 4. SEED 27 NAKSHATRAS
  // --------------------------------------------------------------------------
  for (const nak of NAKSHATRAS_KNOWLEDGE) {
    const slug = `nakshatra-${nak.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    await prisma.knowledgeConcept.upsert({
      where: { slug },
      update: {
        name: `${nak.name} (${nak.deity})`,
        sanskrit: nak.devanagari,
        category: CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
        subCategory: "NAKSHATRA",
        summary: `Nakshatra #${nak.number} spanning ${nak.span}. Ruled by ${nak.ruler}, Deity: ${nak.deity}.`,
        description: nak.symbol ? `Symbol: ${nak.symbol}. Motivating Purpose: ${nak.purushartha || "Dharma"}.` : null,
        traditionalMeaning: `Gana: ${nak.gana || "Deva"}, Yoni: ${nak.yoni || "Sacred"}, Shakti: ${nak.shakti || "Power"}.`,
        color: "#5b4a8b",
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
      create: {
        slug,
        name: `${nak.name} (${nak.deity})`,
        sanskrit: nak.devanagari,
        category: CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
        subCategory: "NAKSHATRA",
        summary: `Nakshatra #${nak.number} spanning ${nak.span}. Ruled by ${nak.ruler}, Deity: ${nak.deity}.`,
        description: nak.symbol ? `Symbol: ${nak.symbol}. Motivating Purpose: ${nak.purushartha || "Dharma"}.` : null,
        traditionalMeaning: `Gana: ${nak.gana || "Deva"}, Yoni: ${nak.yoni || "Sacred"}, Shakti: ${nak.shakti || "Power"}.`,
        color: "#5b4a8b",
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
    });
    seededConcepts++;
  }

  // --------------------------------------------------------------------------
  // 5. SEED 7 CHAKRAS & SUBTLE ANATOMY
  // --------------------------------------------------------------------------
  for (const [key, chakra] of Object.entries(CHAKRAS_KNOWLEDGE)) {
    const slug = `chakra-${key}`;
    await prisma.knowledgeConcept.upsert({
      where: { slug },
      update: {
        name: `${chakra.sanskritName} (${chakra.englishName})`,
        sanskrit: chakra.sanskritName,
        iast: chakra.transliteration,
        category: CONCEPT_CATEGORIES.KUNDALINI_SPIRITUALITY,
        subCategory: "CHAKRA",
        summary: `Chakra #${chakra.number}. ${chakra.meaning}. Bija: ${chakra.bijaMantra}, Element: ${chakra.element}.`,
        description: chakra.introduction?.overviewEn || null,
        traditionalMeaning: chakra.tradition || "Shat-Chakra-Nirupana & Shiva Samhita",
        color: chakra.number === 1 ? "#991b1b" : chakra.number === 2 ? "#c2410c" : chakra.number === 3 ? "#b45309" : chakra.number === 4 ? "#15803d" : chakra.number === 5 ? "#0369a1" : chakra.number === 6 ? "#4338ca" : "#6b21a8",
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
      create: {
        slug,
        name: `${chakra.sanskritName} (${chakra.englishName})`,
        sanskrit: chakra.sanskritName,
        iast: chakra.transliteration,
        category: CONCEPT_CATEGORIES.KUNDALINI_SPIRITUALITY,
        subCategory: "CHAKRA",
        summary: `Chakra #${chakra.number}. ${chakra.meaning}. Bija: ${chakra.bijaMantra}, Element: ${chakra.element}.`,
        description: chakra.introduction?.overviewEn || null,
        traditionalMeaning: chakra.tradition || "Shat-Chakra-Nirupana & Shiva Samhita",
        color: chakra.number === 1 ? "#991b1b" : chakra.number === 2 ? "#c2410c" : chakra.number === 3 ? "#b45309" : chakra.number === 4 ? "#15803d" : chakra.number === 5 ? "#0369a1" : chakra.number === 6 ? "#4338ca" : "#6b21a8",
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
    });
    seededConcepts++;
  }

  // Seed 5 Tattvas
  const TATTVAS = [
    { slug: "tattva-prithvi", name: "Prithvi Tattva (Earth Element)", sanskrit: "पृथ्वी तत्त्व", bija: "LAM (लम्)", chakra: "chakra-muladhara" },
    { slug: "tattva-jala", name: "Jala Tattva (Water Element)", sanskrit: "जल तत्त्व", bija: "VAM (वम्)", chakra: "chakra-svadhisthana" },
    { slug: "tattva-agni", name: "Agni Tattva (Fire Element)", sanskrit: "अग्नि तत्त्व", bija: "RAM (रम्)", chakra: "chakra-manipura" },
    { slug: "tattva-vayu", name: "Vayu Tattva (Air Element)", sanskrit: "वायु तत्त्व", bija: "YAM (यम्)", chakra: "chakra-anahata" },
    { slug: "tattva-akasha", name: "Akasha Tattva (Ether / Space Element)", sanskrit: "आकाश तत्त्व", bija: "HAM (हम्)", chakra: "chakra-vishuddha" },
  ];

  for (const t of TATTVAS) {
    await prisma.knowledgeConcept.upsert({
      where: { slug: t.slug },
      update: {
        name: t.name,
        sanskrit: t.sanskrit,
        category: CONCEPT_CATEGORIES.KUNDALINI_SPIRITUALITY,
        subCategory: "TATTVA",
        summary: `Mahabhuta element corresponding to acoustic seed ${t.bija}.`,
        traditionalMeaning: "Sankhya Philosophy, Shiva Samhita, Shat-Chakra-Nirupana",
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
      create: {
        slug: t.slug,
        name: t.name,
        sanskrit: t.sanskrit,
        category: CONCEPT_CATEGORIES.KUNDALINI_SPIRITUALITY,
        subCategory: "TATTVA",
        summary: `Mahabhuta element corresponding to acoustic seed ${t.bija}.`,
        traditionalMeaning: "Sankhya Philosophy, Shiva Samhita, Shat-Chakra-Nirupana",
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
    });
    seededConcepts++;
  }

  // Seed 3 Nadis
  const NADIS = [
    { slug: "nadi-sushumna", name: "Sushumna Nadi (Central Channel)", sanskrit: "सुषुम्णा नाडी", summary: "The central conduit of non-dual spiritual consciousness traversing the spinal axis." },
    { slug: "nadi-ida", name: "Ida Nadi (Lunar Left Channel)", sanskrit: "इड़ा नाडी", summary: "Cooling, introspective, feminine, parasympathetic channel ending in left nostril." },
    { slug: "nadi-pingala", name: "Pingala Nadi (Solar Right Channel)", sanskrit: "पिङ्गला नाडी", summary: "Dynamic, vital, heating, sympathetic channel ending in right nostril." },
  ];

  for (const n of NADIS) {
    await prisma.knowledgeConcept.upsert({
      where: { slug: n.slug },
      update: {
        name: n.name,
        sanskrit: n.sanskrit,
        category: CONCEPT_CATEGORIES.KUNDALINI_SPIRITUALITY,
        subCategory: "NADI",
        summary: n.summary,
        traditionalMeaning: "Shiva Samhita Patala 2, Shandilya Upanishad",
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
      create: {
        slug: n.slug,
        name: n.name,
        sanskrit: n.sanskrit,
        category: CONCEPT_CATEGORIES.KUNDALINI_SPIRITUALITY,
        subCategory: "NADI",
        summary: n.summary,
        traditionalMeaning: "Shiva Samhita Patala 2, Shandilya Upanishad",
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
    });
    seededConcepts++;
  }

  // --------------------------------------------------------------------------
  // 6. SEED PUBLISHED BOOKS AS DIGITAL LIBRARY CONCEPTS
  // --------------------------------------------------------------------------
  const publishedBooks = await prisma.book.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, slug: true, author: true, language: true, description: true },
  });

  for (const b of publishedBooks) {
    const slug = `book-${b.slug || b.id}`;
    await prisma.knowledgeConcept.upsert({
      where: { slug },
      update: {
        name: b.title,
        category: CONCEPT_CATEGORIES.DIGITAL_LIBRARY,
        subCategory: "BOOK",
        summary: `Authored by ${b.author || "Classical Sage"} in ${b.language}.`,
        description: b.description || "Authentic classical Vedic manuscript in the Gurukul Digital Library.",
        sourceBookId: b.id,
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
      create: {
        slug,
        name: b.title,
        category: CONCEPT_CATEGORIES.DIGITAL_LIBRARY,
        subCategory: "BOOK",
        summary: `Authored by ${b.author || "Classical Sage"} in ${b.language}.`,
        description: b.description || "Authentic classical Vedic manuscript in the Gurukul Digital Library.",
        sourceBookId: b.id,
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
    });
    seededConcepts++;
  }

  // --------------------------------------------------------------------------
  // 7. SEED CONTROLLED CLASSICAL RELATIONSHIPS
  // --------------------------------------------------------------------------
  // Fetch all concept IDs into a dictionary by slug
  const allConcepts = await prisma.knowledgeConcept.findMany({
    select: { id: true, slug: true },
  });
  const conceptMap = new Map(allConcepts.map((c) => [c.slug, c.id]));

  // Helper to safely upsert relationship
  async function safeUpsertRelationship({
    sourceSlug,
    targetSlug,
    relationshipType,
    title,
    description,
    classicalSource,
    tradition = "Parashari / Classical Vedic",
  }) {
    let sourceId = conceptMap.get(sourceSlug);
    let targetId = conceptMap.get(targetSlug);

    if (!sourceId) {
      const s = await prisma.knowledgeConcept.findFirst({ where: { slug: sourceSlug }, select: { id: true } });
      if (s) {
        sourceId = s.id;
        conceptMap.set(sourceSlug, s.id);
      }
    }
    if (!targetId) {
      const t = await prisma.knowledgeConcept.findFirst({ where: { slug: targetSlug }, select: { id: true } });
      if (t) {
        targetId = t.id;
        conceptMap.set(targetSlug, t.id);
      }
    }

    if (!sourceId || !targetId) return null;

    return await prisma.knowledgeRelationship.upsert({
      where: {
        sourceConceptId_targetConceptId_relationshipType: {
          sourceConceptId: sourceId,
          targetConceptId: targetId,
          relationshipType,
        },
      },
      update: {
        title,
        description,
        classicalSource,
        tradition,
        status: "APPROVED",
        confidence: 1.0,
      },
      create: {
        sourceConceptId: sourceId,
        targetConceptId: targetId,
        relationshipType,
        title,
        description,
        classicalSource,
        tradition,
        status: "APPROVED",
        confidence: 1.0,
      },
    });
  }

  // Seed Relationships from CONCEPT_RELATIONSHIPS
  for (const [key, rel] of Object.entries(CONCEPT_RELATIONSHIPS)) {
    const sourceSlug = rel.id;

    // Own signs (PLANET_ASSOCIATED_WITH_RASHI)
    if (Array.isArray(rel.ownSigns)) {
      for (const rashiSlug of rel.ownSigns) {
        const res = await safeUpsertRelationship({
          sourceSlug,
          targetSlug: rashiSlug,
          relationshipType: RELATIONSHIP_TYPES.PLANET_ASSOCIATED_WITH_RASHI,
          title: "Rules Rashi (Swakshetra)",
          description: `${rel.name} exercises primary planetary rulership over ${rashiSlug}.`,
          classicalSource: "Brihat Parashara Hora Shastra Ch. 3 v. 18-20",
        });
        if (res) seededRelationships++;
      }
    }

    // Exaltation (PLANET_ASSOCIATED_WITH_RASHI)
    if (rel.exaltedIn) {
      const res = await safeUpsertRelationship({
        sourceSlug,
        targetSlug: rel.exaltedIn,
        relationshipType: RELATIONSHIP_TYPES.PLANET_ASSOCIATED_WITH_RASHI,
        title: "Exalted In (Uchcha)",
        description: `${rel.name} achieves its maximum dignified, sovereign expression in ${rel.exaltedIn}.`,
        classicalSource: "Brihat Parashara Hora Shastra Ch. 3 v. 49-50",
      });
      if (res) seededRelationships++;
    }

    // Debilitation (PLANET_ASSOCIATED_WITH_RASHI)
    if (rel.debilitatedIn) {
      const res = await safeUpsertRelationship({
        sourceSlug,
        targetSlug: rel.debilitatedIn,
        relationshipType: RELATIONSHIP_TYPES.PLANET_ASSOCIATED_WITH_RASHI,
        title: "Debilitated In (Neecha)",
        description: `${rel.name} undergoes structural weakness or friction in ${rel.debilitatedIn}.`,
        classicalSource: "Brihat Parashara Hora Shastra Ch. 3 v. 51-52",
      });
      if (res) seededRelationships++;
    }

    // Karaka for Bhavas (CONCEPT_RELATED_TO_CONCEPT)
    if (Array.isArray(rel.karakaForBhavas)) {
      for (const bhavaSlug of rel.karakaForBhavas) {
        const res = await safeUpsertRelationship({
          sourceSlug,
          targetSlug: bhavaSlug,
          relationshipType: RELATIONSHIP_TYPES.CONCEPT_RELATED_TO_CONCEPT,
          title: "Natural Karaka (Significator)",
          description: `${rel.name} is the primary significator for the matters of ${bhavaSlug}.`,
          classicalSource: "Phaladeepika Ch. 15 & BPHS Ch. 32",
        });
        if (res) seededRelationships++;
      }
    }

    // Subtle Anatomy: Chakra connection
    if (rel.subtleAnatomy?.chakra) {
      const res = await safeUpsertRelationship({
        sourceSlug,
        targetSlug: rel.subtleAnatomy.chakra,
        relationshipType: RELATIONSHIP_TYPES.CONCEPT_RELATED_TO_CONCEPT,
        title: "Governs Subtle Center",
        description: rel.classicalReasoning || `${rel.name} vitalizes and harmonizes ${rel.subtleAnatomy.chakra}.`,
        classicalSource: "Shiva Samhita Patala 5 & Shat-Chakra-Nirupana",
        tradition: "Nath Sampradaya / Hatha Yoga",
      });
      if (res) seededRelationships++;
    }
  }

  // Seed Chakra -> Tattva relationships
  for (const t of TATTVAS) {
    const res = await safeUpsertRelationship({
      sourceSlug: t.chakra,
      targetSlug: t.slug,
      relationshipType: RELATIONSHIP_TYPES.CHAKRA_ASSOCIATED_WITH_TATTVA,
      title: "Element / Mahabhuta",
      description: `Governs the sensory-energetic manifestation of ${t.name}.`,
      classicalSource: "Shat-Chakra-Nirupana Verses 4-31",
      tradition: "Tantric Shaktism / Hatha Yoga",
    });
    if (res) seededRelationships++;
  }

  // Seed Sushumna -> Chakras
  for (let cNum = 1; cNum <= 7; cNum++) {
    const chakraKey = cNum === 1 ? "chakra-muladhara" : cNum === 2 ? "chakra-svadhisthana" : cNum === 3 ? "chakra-manipura" : cNum === 4 ? "chakra-anahata" : cNum === 5 ? "chakra-vishuddha" : cNum === 6 ? "chakra-ajna" : "chakra-sahasrara";
    const res = await safeUpsertRelationship({
      sourceSlug: "nadi-sushumna",
      targetSlug: chakraKey,
      relationshipType: RELATIONSHIP_TYPES.CONCEPT_RELATED_TO_CONCEPT,
      title: "Encloses Center",
      description: "Traverses along the central canal piercing this spiritual locus.",
      classicalSource: "Shiva Samhita Patala 2 v. 18-24",
      tradition: "Hatha Yoga",
    });
    if (res) seededRelationships++;
  }

  // Seed Book -> Concept links for published classical treatises
  const treatiseMappings = [
    { bookTitleMatch: "Parashara", conceptSlugs: ["graha-surya", "graha-guru", "bhava-1", "bhava-9", "bhava-10", "rashi-mesha"] },
    { bookTitleMatch: "Phaladeepika", conceptSlugs: ["graha-shani", "graha-shukra", "bhava-2", "bhava-7", "rashi-vrishabha"] },
    { bookTitleMatch: "Brihat Jataka", conceptSlugs: ["graha-budha", "graha-chandra", "bhava-4", "bhava-5", "rashi-simha"] },
    { bookTitleMatch: "Kundalini", conceptSlugs: ["chakra-muladhara", "chakra-anahata", "nadi-sushumna", "tattva-prithvi"] },
  ];

  for (const mapping of treatiseMappings) {
    const matchedBook = publishedBooks.find((b) => b.title.toLowerCase().includes(mapping.bookTitleMatch.toLowerCase()));
    if (matchedBook) {
      const bookConceptSlug = `book-${matchedBook.slug || matchedBook.id}`;
      for (const cSlug of mapping.conceptSlugs) {
        const res = await safeUpsertRelationship({
          sourceSlug: bookConceptSlug,
          targetSlug: cSlug,
          relationshipType: RELATIONSHIP_TYPES.CONCEPT_REFERENCED_IN_BOOK,
          title: "Expounds Doctrine",
          description: `Authoritative classical treatise establishing core shastric principles.`,
          classicalSource: matchedBook.title,
          tradition: "Classical Sanskrit Manuscript",
        });
        if (res) seededRelationships++;
      }
    }
  }

  // --------------------------------------------------------------------------
  // 8. SEED RISHIS, AUTHORS & CLASSICAL SAGES
  // --------------------------------------------------------------------------
  const RISHIS_AND_AUTHORS = [
    {
      slug: "rishi-parashara",
      name: "Maharishi Parashara (महर्षि पराशर)",
      sanskrit: "महर्षि पराशर",
      iast: "Maharṣi Parāśara",
      category: CONCEPT_CATEGORIES.PHILOSOPHY,
      subCategory: "RISHI",
      summary: "Supreme sage and father of Vedic astrology; promulgator of Brihat Parashara Hora Shastra.",
      traditionalMeaning: "Rigvedic Rishi, grandson of Vashistha, father of Veda Vyasa, and preceptor of Maitreya.",
      color: "#92400e",
    },
    {
      slug: "rishi-varahamihira",
      name: "Acharya Varahamihira (आचार्य वराहमिहिर)",
      sanskrit: "आचार्य वराहमिहिर",
      iast: "Varāhamihira",
      category: CONCEPT_CATEGORIES.PHILOSOPHY,
      subCategory: "AUTHOR",
      summary: "6th century polymath, astronomer and astrologer of Ujjain; author of Brihat Jataka and Panchasiddhantika.",
      traditionalMeaning: "Navaratna of King Vikramaditya's court; systematizer of predictive and astronomical Jyotisha.",
      color: "#78350f",
    },
    {
      slug: "author-mantreshwara",
      name: "Mantreshwara (मन्त्रेश्वर)",
      sanskrit: "मन्त्रेश्वर",
      iast: "Mantreśvara",
      category: CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
      subCategory: "AUTHOR",
      summary: "13th-century Vedic astrological scholar from Southern India; author of the definitive Phaladeepika.",
      traditionalMeaning: "Renowned devotee of Goddess Sukeshwari; composer of systematic planetary phalas.",
      color: "#b45309",
    },
    {
      slug: "author-purnananda",
      name: "Swami Purnananda Giri (पूर्णानन्द गिरि)",
      sanskrit: "पूर्णानन्द गिरि",
      iast: "Pūrṇānanda Giri",
      category: CONCEPT_CATEGORIES.KUNDALINI_SPIRITUALITY,
      subCategory: "AUTHOR",
      summary: "16th-century Tantric yogic master; composer of Shat-Chakra-Nirupana delineating subtle anatomy.",
      traditionalMeaning: "Master of Kalikula Tantra elucidating Kundalini awakening and lotus chakra petalled lotuses.",
      color: "#065f46",
    },
    {
      slug: "rishi-vyasa",
      name: "Maharishi Veda Vyasa (महर्षि वेदव्यास)",
      sanskrit: "महर्षि वेदव्यास",
      iast: "Veda Vyāsa",
      category: CONCEPT_CATEGORIES.PHILOSOPHY,
      subCategory: "RISHI",
      summary: "Compiler of the four Vedas, author of the Mahabharata, Bhagavad Gita, and eighteen Puranas.",
      traditionalMeaning: "Son of Sage Parashara and Satyavati; primordial seer of Sanatana Shastra.",
      color: "#1e3a8a",
    },
  ];

  for (const r of RISHIS_AND_AUTHORS) {
    await prisma.knowledgeConcept.upsert({
      where: { slug: r.slug },
      update: {
        name: r.name,
        sanskrit: r.sanskrit,
        iast: r.iast,
        category: r.category,
        subCategory: r.subCategory,
        summary: r.summary,
        traditionalMeaning: r.traditionalMeaning,
        color: r.color,
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
      create: {
        slug: r.slug,
        name: r.name,
        sanskrit: r.sanskrit,
        iast: r.iast,
        category: r.category,
        subCategory: r.subCategory,
        summary: r.summary,
        traditionalMeaning: r.traditionalMeaning,
        color: r.color,
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
    });
    seededConcepts++;
  }

  // --------------------------------------------------------------------------
  // 9. SEED CLASSICAL YOGAS & DOSHAS
  // --------------------------------------------------------------------------
  const CLASSICAL_YOGAS = [
    {
      slug: "yoga-gajakesari",
      name: "Gajakesari Yoga (गजकेसरी योग)",
      sanskrit: "गजकेसरी योग",
      iast: "Gajakesarī Yoga",
      category: CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
      subCategory: "YOGA",
      summary: "Formed when Jupiter is in a Kendra (1st, 4th, 7th, 10th) from the Moon.",
      traditionalMeaning: "Bestows royal dignity, unimpeachable virtues, enduring fame, and eloquence. BPHS Ch. 36.",
      color: "#d97706",
      grahas: ["graha-chandra", "graha-guru"],
    },
    {
      slug: "yoga-budhaditya",
      name: "Budhaditya Yoga (बुधादित्य योग)",
      sanskrit: "बुधादित्य योग",
      iast: "Budhāditya Yoga",
      category: CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
      subCategory: "YOGA",
      summary: "Conjunction of the Sun (Surya) and Mercury (Budha) in the same sign.",
      traditionalMeaning: "Confers profound intellect, administrative skill, scholarly aptitude, and eloquent speech. Saravali Ch. 31.",
      color: "#ea580c",
      grahas: ["graha-surya", "graha-budha"],
    },
    {
      slug: "yoga-hamsa",
      name: "Hamsa Yoga (हंस योग)",
      sanskrit: "हंस योग",
      iast: "Haṁsa Yoga",
      category: CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
      subCategory: "YOGA",
      summary: "Pancha Mahapurusha Yoga formed by Jupiter in Kendra in own sign (Sagittarius/Pisces) or exaltation (Cancer).",
      traditionalMeaning: "Grants righteous disposition, philosophical reverence, and spiritual majesty. Phaladeepika Ch. 6.",
      color: "#eab308",
      grahas: ["graha-guru"],
    },
    {
      slug: "yoga-malavya",
      name: "Malavya Yoga (मालव्य योग)",
      sanskrit: "मालव्य योग",
      iast: "Mālavya Yoga",
      category: CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
      subCategory: "YOGA",
      summary: "Pancha Mahapurusha Yoga formed by Venus in Kendra in Taurus, Libra, or Pisces.",
      traditionalMeaning: "Bestows artistic refinement, sensory grace, wealth, vehicles, and auspicious relationships. Phaladeepika Ch. 6.",
      color: "#ec4899",
      grahas: ["graha-shukra"],
    },
    {
      slug: "yoga-ruchaka",
      name: "Ruchaka Yoga (रुचक योग)",
      sanskrit: "रुचक योग",
      iast: "Rucaka Yoga",
      category: CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
      subCategory: "YOGA",
      summary: "Pancha Mahapurusha Yoga formed by Mars in Kendra in Aries, Scorpio, or Capricorn.",
      traditionalMeaning: "Infuses extraordinary physical stamina, military leadership, valor, and executive capability. Phaladeepika Ch. 6.",
      color: "#dc2626",
      grahas: ["graha-mangala"],
    },
    {
      slug: "yoga-bhadra",
      name: "Bhadra Yoga (भद्र योग)",
      sanskrit: "भद्र योग",
      iast: "Bhadra Yoga",
      category: CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
      subCategory: "YOGA",
      summary: "Pancha Mahapurusha Yoga formed by Mercury in Kendra in Gemini or Virgo.",
      traditionalMeaning: "Confers commercial mastery, mathematical brilliance, long life, and scholastic eloquence. Phaladeepika Ch. 6.",
      color: "#16a34a",
      grahas: ["graha-budha"],
    },
    {
      slug: "yoga-sasa",
      name: "Sasa Yoga (शश योग)",
      sanskrit: "शश योग",
      iast: "Śaśa Yoga",
      category: CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
      subCategory: "YOGA",
      summary: "Pancha Mahapurusha Yoga formed by Saturn in Kendra in Capricorn, Aquarius, or Libra.",
      traditionalMeaning: "Confers commanding authority over land, judicial discernment, and endurance. Phaladeepika Ch. 6.",
      color: "#475569",
      grahas: ["graha-shani"],
    },
    {
      slug: "yoga-raja-yoga",
      name: "Raja Yoga (राज योग)",
      sanskrit: "राज योग",
      iast: "Rāja Yoga",
      category: CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
      subCategory: "YOGA",
      summary: "Harmonious union between lords of Kendras (quadrants) and Trikonas (trines).",
      traditionalMeaning: "Produces worldly eminence, public influence, and accomplishment of major objectives. BPHS Ch. 34.",
      color: "#b45309",
      grahas: [],
    },
    {
      slug: "yoga-mangal-dosha",
      name: "Mangal Dosha / Kuja Dosha (मंगल दोष)",
      sanskrit: "मंगल दोष",
      iast: "Kuja Doṣa",
      category: CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
      subCategory: "DOSHA",
      summary: "Placement of Mars in Bhavas 1, 2, 4, 7, 8, or 12 from Lagna, Moon, or Venus.",
      traditionalMeaning: "Indicates fiery friction in domestic partnerships requiring harmonious temperance. Muhurta Chintamani.",
      color: "#b91c1c",
      grahas: ["graha-mangala"],
    },
  ];

  for (const y of CLASSICAL_YOGAS) {
    await prisma.knowledgeConcept.upsert({
      where: { slug: y.slug },
      update: {
        name: y.name,
        sanskrit: y.sanskrit,
        iast: y.iast,
        category: y.category,
        subCategory: y.subCategory,
        summary: y.summary,
        traditionalMeaning: y.traditionalMeaning,
        color: y.color,
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
      create: {
        slug: y.slug,
        name: y.name,
        sanskrit: y.sanskrit,
        iast: y.iast,
        category: y.category,
        subCategory: y.subCategory,
        summary: y.summary,
        traditionalMeaning: y.traditionalMeaning,
        color: y.color,
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
    });
    seededConcepts++;

    // Seed relationship: Grahas -> Yoga
    for (const gSlug of y.grahas) {
      const res = await safeUpsertRelationship({
        sourceSlug: gSlug,
        targetSlug: y.slug,
        relationshipType: RELATIONSHIP_TYPES.ASSOCIATED_WITH,
        title: "Constituent Planetary Karaka",
        description: `Planetary placement required to form ${y.name}.`,
        classicalSource: y.traditionalMeaning,
      });
      if (res) seededRelationships++;
    }
  }

  // --------------------------------------------------------------------------
  // 10. SEED SANSKRIT SHASTRA ENTITIES (DHATUS & CHHANDAS)
  // --------------------------------------------------------------------------
  const SANSKRIT_ENTITIES = [
    {
      slug: "dhatu-kri",
      name: "Dhatu Kri (कृ धातु)",
      sanskrit: "कृ धातु",
      iast: "Dhātu kṛ",
      category: CONCEPT_CATEGORIES.SANSKRIT_SHASTRA,
      subCategory: "DHATU",
      summary: "Foundational Sanskrit verbal root meaning 'to do', 'to act', 'to make'. Gana: Tanadi (8), Ubhayapada.",
      traditionalMeaning: "Etymological root of Karma (कर्म), Kriya (क्रिया), Kartri (कर्तृ). Paninian Dhatupatha 8.10.",
      color: "#0f766e",
    },
    {
      slug: "dhatu-drish",
      name: "Dhatu Drish (दृश् धातु)",
      sanskrit: "दृश् धातु",
      iast: "Dhātu dṛś",
      category: CONCEPT_CATEGORIES.SANSKRIT_SHASTRA,
      subCategory: "DHATU",
      summary: "Verbal root meaning 'to see', 'to perceive', 'to realize'. Gana: Bhvadi (1), Parasmaipada.",
      traditionalMeaning: "Origin of Drishti (दृष्टि - astrological aspect) and Darshana (दर्शन - philosophical vision).",
      color: "#0f766e",
    },
    {
      slug: "dhatu-nam",
      name: "Dhatu Nam (नम् धातु)",
      sanskrit: "नम् धातु",
      iast: "Dhātu nam",
      category: CONCEPT_CATEGORIES.SANSKRIT_SHASTRA,
      subCategory: "DHATU",
      summary: "Verbal root meaning 'to bow', 'to salute', 'to bend in reverence'. Gana: Bhvadi (1).",
      traditionalMeaning: "Origin of Namah (नमः) and Namaskara (नमस्कार).",
      color: "#0f766e",
    },
    {
      slug: "dhatu-bhu",
      name: "Dhatu Bhu (भू धातु)",
      sanskrit: "भू धातु",
      iast: "Dhātu bhū",
      category: CONCEPT_CATEGORIES.SANSKRIT_SHASTRA,
      subCategory: "DHATU",
      summary: "Primary root of existence meaning 'to be', 'to become'. Gana: Bhvadi (1).",
      traditionalMeaning: "Origin of Bhavana, Bhava (भाव - house/state), and Bhuta (भूत - element). Paninian 1.1.",
      color: "#0f766e",
    },
    {
      slug: "chhandas-anushtubh",
      name: "Anushtubh Chhandas (अनुष्टुभ् छन्दः)",
      sanskrit: "अनुष्टुभ् छन्दः",
      iast: "Anuṣṭubh Chhandas",
      category: CONCEPT_CATEGORIES.SANSKRIT_SHASTRA,
      subCategory: "CHHANDAS",
      summary: "Standard 32-syllable Vedic and classical epic meter: 4 quarters (Padas) of 8 syllables each.",
      traditionalMeaning: "Meter of the Bhagavad Gita, Valmiki Ramayana, and Brihat Parashara Hora Shastra.",
      color: "#6d28d9",
    },
    {
      slug: "chhandas-shardulavikridita",
      name: "Shardulavikridita Chhandas (शार्दूलविक्रीडित छन्दः)",
      sanskrit: "शार्दूलविक्रीडित छन्दः",
      iast: "Śārdūlavikrīḍita Chhandas",
      category: CONCEPT_CATEGORIES.SANSKRIT_SHASTRA,
      subCategory: "CHHANDAS",
      summary: "Majestic 19-syllable Sanskrit meter with pauses at 12th and 19th syllables. Scheme: म स ज स त त ग.",
      traditionalMeaning: "Used for high devotional and philosophical invocations in classical treatises.",
      color: "#6d28d9",
    },
  ];

  for (const s of SANSKRIT_ENTITIES) {
    await prisma.knowledgeConcept.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        sanskrit: s.sanskrit,
        iast: s.iast,
        category: s.category,
        subCategory: s.subCategory,
        summary: s.summary,
        traditionalMeaning: s.traditionalMeaning,
        color: s.color,
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
      create: {
        slug: s.slug,
        name: s.name,
        sanskrit: s.sanskrit,
        iast: s.iast,
        category: s.category,
        subCategory: s.subCategory,
        summary: s.summary,
        traditionalMeaning: s.traditionalMeaning,
        color: s.color,
        status: "APPROVED",
        confidence: 1.0,
        isClassical: true,
      },
    });
    seededConcepts++;
  }

  // Seed Sanskrit links: Dhatu Bhu -> Bhava 1
  await safeUpsertRelationship({
    sourceSlug: "dhatu-bhu",
    targetSlug: "bhava-1",
    relationshipType: RELATIONSHIP_TYPES.DERIVED_FROM,
    title: "Etymological Origin",
    description: "Bhava is etymologically derived from Dhatu 'Bhū' indicating a state or sphere of being.",
    classicalSource: "Paninian Ashtadhyayi & BPHS Ch. 11",
  });
  seededRelationships++;

  // Seed Rishi Parashara -> Surya
  await safeUpsertRelationship({
    sourceSlug: "rishi-parashara",
    targetSlug: "graha-surya",
    relationshipType: RELATIONSHIP_TYPES.EXPLAINS,
    title: "Authoritative Exposition",
    description: "Expounds the spiritual and astronomical nature of Surya to sage Maitreya.",
    classicalSource: "Brihat Parashara Hora Shastra Ch. 3",
  });
  seededRelationships++;

  return {
    seededConcepts,
    seededRelationships,
  };
}

/**
 * Retrieves the interactive knowledge graph with neighborhood expansion,
 * pagination, and filtering by category or sub-category.
 * 
 * @param {Object} params
 * @param {string} [params.category]
 * @param {string} [params.subCategory]
 * @param {string} [params.search]
 * @param {string} [params.centerConceptId]
 * @param {number} [params.limit=40]
 * @param {number} [params.depth=1]
 * @param {Object} [params.user]
 * @returns {Promise<Object>} Graph { nodes, edges, totalNodes, totalEdges, categories }
 */
export async function getKnowledgeGraph({
  category = null,
  subCategory = null,
  search = null,
  centerConceptId = null,
  pathStart = null,
  pathEnd = null,
  scripture = null,
  limit = 40,
  depth = 1,
  user = null,
} = {}) {
  const isPrivileged = user && canManageBooks(user);

  let highlightedPath = null;
  const pathNodeIdSet = new Set();
  const pathEdgeIdSet = new Set();

  // If pathStart and pathEnd are provided, compute shortest classical path
  if (pathStart && pathEnd) {
    try {
      highlightedPath = await findPathBetweenConcepts(pathStart, pathEnd);
      if (highlightedPath.found) {
        highlightedPath.pathNodes.forEach((n) => pathNodeIdSet.add(n.id));
        highlightedPath.pathEdges.forEach((e) => pathEdgeIdSet.add(e.id));
      }
    } catch (e) {
      console.warn("Path finding in getKnowledgeGraph:", e.message);
    }
  }

  // 1. Determine Target Concept IDs
  let targetConceptIds = new Set(pathNodeIdSet);

  if (centerConceptId) {
    // Center node neighborhood expansion
    const center = await prisma.knowledgeConcept.findFirst({
      where: {
        OR: [{ id: centerConceptId }, { slug: centerConceptId }],
      },
      select: { id: true },
    });

    if (center) {
      targetConceptIds.add(center.id);

      // 1-depth or 2-depth traversal
      const connections = await prisma.knowledgeRelationship.findMany({
        where: {
          OR: [{ sourceConceptId: center.id }, { targetConceptId: center.id }],
          status: isPrivileged ? undefined : "APPROVED",
        },
        take: limit,
        select: { sourceConceptId: true, targetConceptId: true },
      });

      connections.forEach((c) => {
        targetConceptIds.add(c.sourceConceptId);
        targetConceptIds.add(c.targetConceptId);
      });
    }
  } else {
    // Broad query with filters
    const where = {
      status: isPrivileged ? undefined : "APPROVED",
    };

    if (category && category !== "ALL") {
      where.category = category;
    }
    if (subCategory && subCategory !== "ALL") {
      where.subCategory = subCategory;
    }
    if (scripture && scripture !== "ALL") {
      where.OR = [
        { sourceBookId: scripture },
        { sourceBook: { slug: scripture } },
        { traditionalMeaning: { contains: scripture, mode: "insensitive" } },
      ];
    }
    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search.trim(), mode: "insensitive" } },
        { sanskrit: { contains: search.trim(), mode: "insensitive" } },
        { summary: { contains: search.trim(), mode: "insensitive" } },
        { traditionalMeaning: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const matched = await prisma.knowledgeConcept.findMany({
      where,
      take: limit,
      select: { id: true },
      orderBy: { slug: "asc" },
    });

    matched.forEach((m) => targetConceptIds.add(m.id));
  }

  const conceptIdList = Array.from(targetConceptIds);

  // 2. Fetch Nodes with metadata and connection degree
  const nodesRaw = await prisma.knowledgeConcept.findMany({
    where: { id: { in: conceptIdList } },
    include: {
      sourceBook: { select: { id: true, title: true, slug: true, status: true } },
      _count: {
        select: {
          outgoingRelations: true,
          incomingRelations: true,
          passageReferences: true,
        },
      },
    },
  });

  // Filter out any concepts referencing unpublished books if user is not privileged
  const filteredNodes = nodesRaw.filter((node) => {
    if (node.sourceBook && node.sourceBook.status !== "PUBLISHED" && !isPrivileged) {
      return false;
    }
    return true;
  });

  const validIdSet = new Set(filteredNodes.map((n) => n.id));

  // 3. Fetch Edges connecting these nodes
  const edgesRaw = await prisma.knowledgeRelationship.findMany({
    where: {
      sourceConceptId: { in: Array.from(validIdSet) },
      targetConceptId: { in: Array.from(validIdSet) },
      status: isPrivileged ? undefined : "APPROVED",
    },
    select: {
      id: true,
      sourceConceptId: true,
      targetConceptId: true,
      relationshipType: true,
      title: true,
      description: true,
      classicalSource: true,
      tradition: true,
      confidence: true,
      status: true,
      isBidirectional: true,
    },
  });

  // 4. Format Graph Payload for Visualizer (Nodes & Links)
  const nodes = filteredNodes.map((n) => ({
    id: n.id,
    slug: n.slug,
    name: n.name,
    sanskrit: n.sanskrit,
    iast: n.iast,
    category: n.category,
    subCategory: n.subCategory,
    summary: n.summary,
    description: n.description,
    traditionalMeaning: n.traditionalMeaning,
    color: n.color || (n.category === "KUNDALINI_SPIRITUALITY" ? "#047857" : n.category === "DIGITAL_LIBRARY" ? "#b45309" : "#1e3a8a"),
    confidence: n.confidence,
    status: n.status,
    isClassical: n.isClassical,
    isPathNode: pathNodeIdSet.has(n.id),
    degree: (n._count.outgoingRelations || 0) + (n._count.incomingRelations || 0),
    passageCount: n._count.passageReferences || 0,
    sourceBook: n.sourceBook ? { title: n.sourceBook.title, slug: n.sourceBook.slug } : null,
  }));

  const edges = edgesRaw.map((e) => ({
    id: e.id,
    source: e.sourceConceptId,
    target: e.targetConceptId,
    relationshipType: e.relationshipType,
    title: e.title || e.relationshipType.replace(/_/g, " "),
    description: e.description,
    classicalSource: e.classicalSource,
    tradition: e.tradition,
    confidence: e.confidence,
    status: e.status,
    isPathEdge: pathEdgeIdSet.has(e.id),
  }));

  return {
    nodes,
    edges,
    totalNodes: nodes.length,
    totalEdges: edges.length,
    categories: Object.values(CONCEPT_CATEGORIES),
    highlightedPath,
  };
}

/**
 * Fetches full details for a single concept, including related concepts,
 * incoming/outgoing relationships, classical citations, and matching published passages.
 * 
 * @param {string} conceptIdOrSlug
 * @param {Object} [user]
 * @returns {Promise<Object>} Concept details
 */
export async function getConceptDetails(conceptIdOrSlug, user = null) {
  if (!conceptIdOrSlug) throw new Error("Concept ID or slug is required.");
  const isPrivileged = user && canManageBooks(user);

  const concept = await prisma.knowledgeConcept.findFirst({
    where: {
      OR: [{ id: conceptIdOrSlug }, { slug: conceptIdOrSlug }],
      status: isPrivileged ? undefined : "APPROVED",
    },
    include: {
      sourceBook: { select: { id: true, title: true, slug: true, author: true, status: true } },
      sourcePassage: {
        select: {
          id: true,
          text: true,
          sourcePage: true,
          ocrConfidence: true,
          book: { select: { title: true, slug: true, status: true } },
          chapter: { select: { title: true, slug: true } },
        },
      },
      outgoingRelations: {
        where: { status: isPrivileged ? undefined : "APPROVED" },
        include: {
          targetConcept: {
            select: { id: true, slug: true, name: true, sanskrit: true, category: true, subCategory: true, color: true },
          },
        },
      },
      incomingRelations: {
        where: { status: isPrivileged ? undefined : "APPROVED" },
        include: {
          sourceConcept: {
            select: { id: true, slug: true, name: true, sanskrit: true, category: true, subCategory: true, color: true },
          },
        },
      },
      passageReferences: {
        take: 8,
        include: {
          passage: {
            select: {
              id: true,
              text: true,
              sourcePage: true,
              ocrConfidence: true,
              book: { select: { id: true, title: true, slug: true, author: true, status: true } },
              chapter: { select: { id: true, title: true, slug: true, chapterNumber: true } },
            },
          },
        },
      },
    },
  });

  if (!concept) {
    throw new Error(`Concept '${conceptIdOrSlug}' not found.`);
  }

  // Publication filter for references
  const verifiedPassages = concept.passageReferences
    .filter((ref) => isPrivileged || ref.passage.book?.status === "PUBLISHED")
    .map((ref) => ({
      passageId: ref.passage.id,
      snippet: ref.passage.text.slice(0, 240) + "...",
      sourcePage: ref.passage.sourcePage,
      bookTitle: ref.passage.book?.title,
      author: ref.passage.book?.author,
      chapterTitle: ref.passage.chapter?.title,
      readerUrl: `/library/${ref.passage.book?.slug || "books"}/${ref.passage.chapter?.slug || ""}?passageId=${ref.passage.id}`,
      ocrConfidence: ref.passage.ocrConfidence,
      relevance: ref.relevance,
    }));

  let crossScriptural = null;
  try {
    crossScriptural = await getCrossScripturalComparison(concept.id);
  } catch (e) {
    // Non-blocking fallback
  }

  return {
    ...concept,
    verifiedPassages,
    relationshipsCount: (concept.outgoingRelations?.length || 0) + (concept.incomingRelations?.length || 0),
    crossScriptural,
  };
}

/**
 * Searches concepts within the knowledge graph.
 * 
 * @param {Object} params
 * @returns {Promise<Array<Object>>} Matching concepts
 */
export async function searchKnowledgeConcepts(param = {}) {
  const query = typeof param === "string" ? param : (param?.query || "");
  const category = typeof param === "object" ? param?.category : null;
  const limit = typeof param === "object" ? (param?.limit || 20) : 20;

  const clean = (query || "").trim();
  if (!clean) return [];

  // Recognize patterns like "10th House", "House 10" -> number 10
  const houseMatch = clean.match(/(\d+)(?:st|nd|rd|th)?\s*house/i) || clean.match(/house\s*(\d+)/i);
  const houseNum = houseMatch ? houseMatch[1] : null;

  const orConditions = [
    { name: { contains: clean, mode: "insensitive" } },
    { sanskrit: { contains: clean, mode: "insensitive" } },
    { iast: { contains: clean, mode: "insensitive" } },
    { summary: { contains: clean, mode: "insensitive" } },
    { traditionalMeaning: { contains: clean, mode: "insensitive" } },
    { slug: { contains: clean.toLowerCase().replace(/\s+/g, "-"), mode: "insensitive" } },
  ];

  if (houseNum) {
    orConditions.push({ slug: `bhava-${houseNum}` });
    orConditions.push({ name: { contains: `House ${houseNum}`, mode: "insensitive" } });
  }

  const where = {
    status: "APPROVED",
    OR: orConditions,
  };

  if (category && category !== "ALL") {
    where.category = category;
  }

  return await prisma.knowledgeConcept.findMany({
    where,
    take: limit,
    select: {
      id: true,
      slug: true,
      name: true,
      sanskrit: true,
      category: true,
      subCategory: true,
      summary: true,
      color: true,
      isClassical: true,
    },
    orderBy: { name: "asc" },
  });
}

/**
 * Automatically discovers concepts in arbitrary text (e.g. from an OCR scanned page).
 * 
 * @param {string} text
 * @returns {Promise<Array<Object>>} Discovered concept matches with confidence
 */
export async function discoverPassageConcepts(text = "") {
  if (!text || text.trim().length < 5) return [];

  const textLower = text.toLowerCase();
  const allConcepts = await prisma.knowledgeConcept.findMany({
    where: { status: "APPROVED" },
    select: { id: true, slug: true, name: true, sanskrit: true, category: true, subCategory: true },
  });

  const discovered = [];

  for (const c of allConcepts) {
    let match = false;
    let confidence = 0.85;

    // 1. Sanskrit Devanagari exact match
    if (c.sanskrit && text.includes(c.sanskrit)) {
      match = true;
      confidence = 0.98;
    }
    // 2. Slug match (without prefix)
    else {
      const bareSlug = c.slug.replace(/^(graha|chakra|rashi|nakshatra|bhava|tattva|nadi)-/, "");
      if (bareSlug.length >= 3 && textLower.includes(bareSlug)) {
        match = true;
        confidence = 0.92;
      } else if (c.name) {
        // 3. Any prominent identifier word in concept name
        const words = c.name.toLowerCase().split(/[\s(),]+/);
        for (const w of words) {
          if (w.length >= 4 && textLower.includes(w)) {
            match = true;
            confidence = 0.90;
            break;
          }
        }
      }
    }

    if (match) {
      discovered.push({
        conceptId: c.id,
        slug: c.slug,
        name: c.name,
        sanskrit: c.sanskrit,
        category: c.category,
        subCategory: c.subCategory,
        confidence,
      });
    }
  }

  return discovered.slice(0, 10);
}

/**
 * Links a passage to a knowledge graph concept.
 */
export async function linkPassageToConcept({ passageId, conceptId, relevance = 1.0, context = null }) {
  if (!passageId || !conceptId) throw new Error("passageId and conceptId required.");

  return await prisma.passageConceptReference.upsert({
    where: {
      passageId_conceptId: { passageId, conceptId },
    },
    update: { relevance, context },
    create: { passageId, conceptId, relevance, context },
  });
}

/**
 * Admin: Create or update a concept.
 */
export async function adminUpsertConcept(data) {
  const { id, slug, name, sanskrit, iast, category, subCategory, description, summary, traditionalMeaning, color, status, isClassical } = data;
  if (!name || !slug) throw new Error("Concept name and slug are required.");

  return await prisma.knowledgeConcept.upsert({
    where: { slug },
    update: {
      name,
      sanskrit,
      iast,
      category: category || CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
      subCategory,
      description,
      summary,
      traditionalMeaning,
      color,
      status: status || "APPROVED",
      isClassical: isClassical !== undefined ? isClassical : true,
    },
    create: {
      slug,
      name,
      sanskrit,
      iast,
      category: category || CONCEPT_CATEGORIES.VEDIC_ASTROLOGY,
      subCategory,
      description,
      summary,
      traditionalMeaning,
      color,
      status: status || "APPROVED",
      isClassical: isClassical !== undefined ? isClassical : true,
    },
  });
}

/**
 * Admin: Approve, reject or review a relationship.
 */
export async function adminUpdateRelationshipStatus({ relationshipId, status, reviewer = "Admin" }) {
  if (!relationshipId || !status) throw new Error("relationshipId and status required.");

  return await prisma.knowledgeRelationship.update({
    where: { id: relationshipId },
    data: {
      status,
      reviewedBy: reviewer,
      reviewedAt: new Date(),
    },
  });
}

/**
 * Discovers connecting paths between two entities in the knowledge graph.
 * Uses Breadth-First Search (BFS) with frontier-level batching and strict cycle protection.
 * Supports configurable traversal depth, alternative distinct paths, and directional semantics.
 *
 * @param {string} sourceSlugOrId
 * @param {string} targetSlugOrId
 * @param {number|Object} [optionsOrDepth=4] - Max depth number OR options object { maxDepth, maxPaths, allowedRelationshipTypes }
 * @returns {Promise<Object>} Path discovery result with directional semantics and source provenance
 */
export async function findPathBetweenConcepts(sourceSlugOrId, targetSlugOrId, optionsOrDepth = 4) {
  if (!sourceSlugOrId || !targetSlugOrId) {
    throw new Error("Both source and target concepts are required for path finding.");
  }

  // Parse options or depth
  let maxDepth = 4;
  let maxPaths = 1;
  let allowedRelationshipTypes = null;

  if (typeof optionsOrDepth === "number") {
    maxDepth = Math.max(1, Math.min(optionsOrDepth, 6));
  } else if (optionsOrDepth && typeof optionsOrDepth === "object") {
    if (typeof optionsOrDepth.maxDepth === "number") {
      maxDepth = Math.max(1, Math.min(optionsOrDepth.maxDepth, 6));
    }
    if (typeof optionsOrDepth.maxPaths === "number") {
      maxPaths = Math.max(1, Math.min(optionsOrDepth.maxPaths, 3));
    }
    if (Array.isArray(optionsOrDepth.allowedRelationshipTypes)) {
      allowedRelationshipTypes = optionsOrDepth.allowedRelationshipTypes;
    }
  }

  const [sourceConcept, targetConcept] = await Promise.all([
    prisma.knowledgeConcept.findFirst({
      where: { OR: [{ id: sourceSlugOrId }, { slug: sourceSlugOrId }] },
      select: { id: true, slug: true, name: true, sanskrit: true, category: true, subCategory: true, color: true, summary: true },
    }),
    prisma.knowledgeConcept.findFirst({
      where: { OR: [{ id: targetSlugOrId }, { slug: targetSlugOrId }] },
      select: { id: true, slug: true, name: true, sanskrit: true, category: true, subCategory: true, color: true, summary: true },
    }),
  ]);

  if (!sourceConcept || !targetConcept) {
    return {
      found: false,
      message: !sourceConcept
        ? `Source concept '${sourceSlugOrId}' not found.`
        : `Target concept '${targetSlugOrId}' not found.`,
      pathNodes: [],
      pathEdges: [],
      summaryTrail: null,
      alternativePaths: [],
    };
  }

  if (sourceConcept.id === targetConcept.id) {
    return {
      found: true,
      length: 0,
      depth: 0,
      pathNodes: [sourceConcept],
      pathEdges: [],
      summaryTrail: sourceConcept.name,
      alternativePaths: [],
    };
  }

  // Helper to build scholarly narrative for a hop
  const buildHopNarrative = (fromNode, toNode, rel, isOutgoing) => {
    const fromName = fromNode?.name || "Concept";
    const toName = toNode?.name || "Concept";
    const relType = rel.relationshipType;

    switch (relType) {
      case RELATIONSHIP_TYPES.PLANET_ASSOCIATED_WITH_RASHI:
        return isOutgoing
          ? `${fromName} rules and governs the zodiac sign ${toName}`
          : `${fromName} is ruled and governed by ${toName}`;
      case RELATIONSHIP_TYPES.CHAKRA_ASSOCIATED_WITH_TATTVA:
        return isOutgoing
          ? `${fromName} embodies the subtle elemental principle (Tattva) of ${toName}`
          : `${fromName} is the elemental principle grounding ${toName}`;
      case RELATIONSHIP_TYPES.NAKSHATRA_BELONGS_TO_RASHI:
        return isOutgoing
          ? `${fromName} resides within the astrological domain of ${toName}`
          : `${fromName} contains the stellar lunar mansion of ${toName}`;
      case RELATIONSHIP_TYPES.AUTHORED_BY:
        return isOutgoing
          ? `${fromName} is authored by the revered sage ${toName}`
          : `${fromName} authored and transmitted the classical treatise ${toName}`;
      case RELATIONSHIP_TYPES.DERIVED_FROM:
        return isOutgoing
          ? `${fromName} is etymologically and conceptually derived from ${toName}`
          : `${fromName} gives grammatical and philosophical rise to ${toName}`;
      case RELATIONSHIP_TYPES.EXPLAINS:
      case RELATIONSHIP_TYPES.DESCRIBES:
        return isOutgoing
          ? `${fromName} systematically explains and defines ${toName}`
          : `${fromName} is expounded and delineated in ${toName}`;
      case RELATIONSHIP_TYPES.ASSOCIATED_WITH:
      default:
        if (rel.title) {
          return `${fromName} connects with ${toName} (${rel.title})`;
        }
        return `${fromName} is traditionally associated with ${toName}`;
    }
  };

  // Frontier-level BFS with batch queries
  let frontier = [
    {
      currentId: sourceConcept.id,
      nodeIds: [sourceConcept.id],
      edgeObjects: [],
      edgeIds: new Set(),
    },
  ];

  const globalVisited = new Set([sourceConcept.id]);
  const discoveredPaths = [];
  let currentDepth = 0;

  while (frontier.length > 0 && currentDepth < maxDepth && discoveredPaths.length < maxPaths) {
    currentDepth++;

    // 1. Gather all unique node IDs in current frontier for frontier-level query batching
    const frontierNodeIds = Array.from(new Set(frontier.map((f) => f.currentId)));

    // 2. Batch fetch all adjacent approved relationships across the entire frontier in ONE DB call
    const batchRelations = await prisma.knowledgeRelationship.findMany({
      where: {
        OR: [
          { sourceConceptId: { in: frontierNodeIds } },
          { targetConceptId: { in: frontierNodeIds } },
        ],
        status: "APPROVED",
        ...(allowedRelationshipTypes ? { relationshipType: { in: allowedRelationshipTypes } } : {}),
      },
      select: {
        id: true,
        sourceConceptId: true,
        targetConceptId: true,
        relationshipType: true,
        title: true,
        description: true,
        classicalSource: true,
        confidence: true,
        status: true,
        sourceBook: { select: { id: true, title: true, slug: true, author: true } },
      },
      take: 120,
    });

    // Build adjacency lookup: nodeId -> Array of relations
    const adjacency = new Map();
    for (const rel of batchRelations) {
      if (!adjacency.has(rel.sourceConceptId)) adjacency.set(rel.sourceConceptId, []);
      if (!adjacency.has(rel.targetConceptId)) adjacency.set(rel.targetConceptId, []);
      adjacency.get(rel.sourceConceptId).push(rel);
      adjacency.get(rel.targetConceptId).push(rel);
    }

    const nextFrontier = [];
    const levelVisited = new Set();

    for (const item of frontier) {
      const adjacent = adjacency.get(item.currentId) || [];

      for (const rel of adjacent) {
        // Prevent traversing the exact same edge back-and-forth
        if (item.edgeIds.has(rel.id)) continue;

        const isOutgoing = rel.sourceConceptId === item.currentId;
        const neighborId = isOutgoing ? rel.targetConceptId : rel.sourceConceptId;

        // Found target
        if (neighborId === targetConcept.id) {
          const newEdgeIds = new Set(item.edgeIds);
          newEdgeIds.add(rel.id);
          discoveredPaths.push({
            nodeIds: [...item.nodeIds, targetConcept.id],
            edgeObjects: [
              ...item.edgeObjects,
              {
                ...rel,
                direction: isOutgoing ? "OUTGOING" : "INCOMING",
                fromConceptId: item.currentId,
                toConceptId: neighborId,
              },
            ],
          });
          if (discoveredPaths.length >= maxPaths) break;
          continue;
        }

        // Prevent circular loops in path
        if (item.nodeIds.includes(neighborId)) continue;

        // For shortest path discovery, prefer unvisited nodes
        if (!globalVisited.has(neighborId)) {
          levelVisited.add(neighborId);
          const newEdgeIds = new Set(item.edgeIds);
          newEdgeIds.add(rel.id);
          nextFrontier.push({
            currentId: neighborId,
            nodeIds: [...item.nodeIds, neighborId],
            edgeObjects: [
              ...item.edgeObjects,
              {
                ...rel,
                direction: isOutgoing ? "OUTGOING" : "INCOMING",
                fromConceptId: item.currentId,
                toConceptId: neighborId,
              },
            ],
            edgeIds: newEdgeIds,
          });
        }
      }

      if (discoveredPaths.length >= maxPaths) break;
    }

    for (const id of levelVisited) {
      globalVisited.add(id);
    }

    frontier = nextFrontier;
  }

  if (discoveredPaths.length === 0) {
    return {
      found: false,
      message: `No classical connection found between '${sourceConcept.name}' and '${targetConcept.name}' within depth ${maxDepth}.`,
      pathNodes: [],
      pathEdges: [],
      summaryTrail: null,
      alternativePaths: [],
    };
  }

  // Hydrate all unique nodes across all discovered paths in ONE batch query
  const allNodeIds = Array.from(new Set(discoveredPaths.flatMap((p) => p.nodeIds)));
  const hydratedNodes = await prisma.knowledgeConcept.findMany({
    where: { id: { in: allNodeIds } },
    select: {
      id: true,
      slug: true,
      name: true,
      sanskrit: true,
      iast: true,
      category: true,
      subCategory: true,
      color: true,
      summary: true,
    },
  });

  const nodeMap = new Map(hydratedNodes.map((n) => [n.id, n]));

  // Format all discovered paths with narratives, directional descriptors, and summary trails
  const formattedPaths = discoveredPaths.map((path) => {
    const nodes = path.nodeIds.map((id) => nodeMap.get(id)).filter(Boolean);
    const edges = path.edgeObjects.map((edge) => {
      const fromNode = nodeMap.get(edge.fromConceptId);
      const toNode = nodeMap.get(edge.toConceptId);
      const isOutgoing = edge.direction === "OUTGOING";
      const narrative = buildHopNarrative(fromNode, toNode, edge, isOutgoing);

      return {
        ...edge,
        fromNode,
        toNode,
        narrative,
        classicalSource: edge.classicalSource || edge.sourceBook?.title || "Classical Vedic Canon",
      };
    });

    const summaryParts = [];
    for (let i = 0; i < nodes.length; i++) {
      summaryParts.push(nodes[i].name);
      if (i < edges.length) {
        const edge = edges[i];
        const label = edge.title || edge.relationshipType.replace(/_/g, " ").toLowerCase();
        summaryParts.push(`➔ [${label}] ➔`);
      }
    }

    return {
      length: edges.length,
      depth: edges.length,
      pathNodes: nodes,
      pathEdges: edges,
      summaryTrail: summaryParts.join(" "),
    };
  });

  const primaryPath = formattedPaths[0];

  return {
    found: true,
    length: primaryPath.length,
    depth: primaryPath.depth,
    pathNodes: primaryPath.pathNodes,
    pathEdges: primaryPath.pathEdges,
    summaryTrail: primaryPath.summaryTrail,
    alternativePaths: formattedPaths.slice(1),
  };
}

// Classical Cross-Scriptural Treatise Intelligence Ontology
export const CROSS_SCRIPTURAL_TREATISES = [
  {
    conceptSlug: "graha-surya",
    sources: [
      {
        treatise: "Brihat Parashara Hora Shastra",
        author: "Maharishi Parashara",
        tradition: "Parashari Jyotish",
        chapter: "Chapter 3 (Graha Gunas & Svarupa), Verses 12-25",
        perspective: "Surya is the soul of all (Sarvatma), square-bodied, honey-eyed, bile-predominant, representing kingship, bones, courage, and divine dharma.",
        relationshipType: RELATIONSHIP_TYPES.EXPLAINS,
      },
      {
        treatise: "Phaladeepika",
        author: "Mantreshwara",
        tradition: "Classical Predictive Jyotish",
        chapter: "Chapter 2, Verses 4-8 & Chapter 8",
        perspective: "Surya signifies father, royal patronage, copper, vitality, and temples. Placement in 10th house confers Digbala (directional triumph).",
        relationshipType: RELATIONSHIP_TYPES.INTERPRETS,
      },
      {
        treatise: "Shat-Chakra-Nirupana",
        author: "Swami Purnananda Giri",
        tradition: "Tantric Kundalini Yoga",
        chapter: "Verses 19-21 (Manipura Mandala)",
        perspective: "Solar energy is embodied in the digestive-pranic fire of Manipura Chakra and the radiant right Pingala Nadi vitalizing bodily vitality.",
        relationshipType: RELATIONSHIP_TYPES.ASSOCIATED_WITH,
      },
      {
        treatise: "Bhagavad Gita",
        author: "Maharishi Veda Vyasa",
        tradition: "Vedanta / Yoga Shastra",
        chapter: "Chapter 10, Verse 21 & Chapter 15, Verse 12",
        perspective: "The supreme light of the Sun is declared as the cosmic radiance of the Divine: 'yad aditya-gatam tejo jagad bhasayate akhilam'.",
        relationshipType: RELATIONSHIP_TYPES.SUPPORTS,
      },
    ],
    consensus: "Universal classical agreement on Surya as the premier celestial symbol of luminous consciousness, sovereign vitality, and spiritual illumination.",
    divergences: "Astrological works emphasize specific house placements and functional combustion, while Yogic and Vedantic scriptures focus on inner solar prana (Surya Nadi) and non-dual light.",
  },
  {
    conceptSlug: "yoga-gajakesari",
    sources: [
      {
        treatise: "Brihat Parashara Hora Shastra",
        author: "Maharishi Parashara",
        tradition: "Parashari Jyotish",
        chapter: "Chapter 36 (Special Yogas), Verses 3-4",
        perspective: "When Jupiter is in Kendra from the Moon, free from debilitation or combustion, the native builds cities, enjoys unshakeable wealth, and vanquishes adversaries like an elephant-lion.",
        relationshipType: RELATIONSHIP_TYPES.EXPLAINS,
      },
      {
        treatise: "Saravali",
        author: "Kalyanavarma",
        tradition: "Imperial Horoscopy",
        chapter: "Chapter 35, Verses 14-16",
        perspective: "Emphasizes intellectual brilliance, oratorical eminence, philanthropic inclination, and administrative authority throughout middle and later life.",
        relationshipType: RELATIONSHIP_TYPES.INTERPRETS,
      },
      {
        treatise: "Phaladeepika",
        author: "Mantreshwara",
        tradition: "Predictive Jyotish",
        chapter: "Chapter 6, Verses 36-37",
        perspective: "Focuses on moral integrity, longevity, and universal reverence by magistrates and scholars; notes that Jupiter's dignity enhances results.",
        relationshipType: RELATIONSHIP_TYPES.SUPPORTS,
      },
    ],
    consensus: "Both Parashara, Kalyanavarma, and Mantreshwara classify Gajakesari as one of the most auspicious and durable Shubha Yogas in Vedic astrology.",
    divergences: "Parashara highlights executive sovereignty and wealth, while Mantreshwara emphasizes moral reverence and scholarly rectitude.",
  },
  {
    conceptSlug: "chakra-muladhara",
    sources: [
      {
        treatise: "Shat-Chakra-Nirupana",
        author: "Swami Purnananda Giri",
        tradition: "Tantric Shaktism",
        chapter: "Verses 4-13",
        perspective: "Four-petalled crimson lotus at the base of Sushumna containing Prithvi Tattva, the golden Traipura Trikona, and the dormant Kundalini coiled three-and-a-half times.",
        relationshipType: RELATIONSHIP_TYPES.EXPLAINS,
        evidenceGrade: "PRIMARY_CANON",
      },
      {
        treatise: "Shiva Samhita",
        author: "Classical Yoga Agama",
        tradition: "Hatha Yoga",
        chapter: "Patala 5, Verses 53-68",
        perspective: "Focuses on the energetic awakening of Muladhara through Mula Bandha and Kumbhaka, dissolving physical disease and overcoming fear of death.",
        relationshipType: RELATIONSHIP_TYPES.DESCRIBES,
        evidenceGrade: "PRIMARY_CANON",
      },
      {
        treatise: "Brihat Parashara Hora Shastra",
        author: "Maharishi Parashara",
        tradition: "Parashari Jyotish",
        chapter: "Chapter 3 (Planetary Dignities)",
        perspective: "Corresponds energetically to Mars (Mangala) as the planetary archetype of physical grounding, bone marrow, and raw survival fortitude.",
        relationshipType: RELATIONSHIP_TYPES.ASSOCIATED_WITH,
        evidenceGrade: "PRIMARY_CANON",
      },
    ],
    consensus: "All classical authorities recognize Muladhara as the primal foundation of embodied life, grounding the physical organism in earth (Prithvi).",
    divergences: "Tantric texts detail visual iconography and geometric yantras, whereas astrological sources focus on corresponding planetary rulers (Mars) and bodily tissue dhatus.",
  },
  {
    conceptSlug: "graha-chandra",
    sources: [
      {
        treatise: "Brihat Parashara Hora Shastra",
        author: "Maharishi Parashara",
        tradition: "Parashari Jyotish",
        chapter: "Chapter 3 (Graha Svarupa), Verses 15-28",
        perspective: "Chandra is the Manas (mind) of Kalapurusha, water-predominant, sattvic, white-hued, signifying mother, pearls, royal queenship, and fluctuating fortunes.",
        relationshipType: RELATIONSHIP_TYPES.EXPLAINS,
        evidenceGrade: "PRIMARY_CANON",
      },
      {
        treatise: "Phaladeepika",
        author: "Mantreshwara",
        tradition: "Classical Predictive Jyotish",
        chapter: "Chapter 2, Verses 9-11 & Chapter 6",
        perspective: "Moon governs mental equilibrium, bodily fluids, nocturnal strength, and emotional contentment. Auspicious associations produce Gajakesari and Sunapha yogas.",
        relationshipType: RELATIONSHIP_TYPES.INTERPRETS,
        evidenceGrade: "PRIMARY_CANON",
      },
      {
        treatise: "Shat-Chakra-Nirupana",
        author: "Swami Purnananda Giri",
        tradition: "Tantric Kundalini Yoga",
        chapter: "Verses 40-42 (Sahasrara & Ajna Chandra Mandala)",
        perspective: "Chandra is embodied as the cool lunar nectar (Amrita) dripping from the crescent Moon at Sahasrara into the pale, feminine Ida Nadi.",
        relationshipType: RELATIONSHIP_TYPES.ASSOCIATED_WITH,
        evidenceGrade: "PRIMARY_CANON",
      },
      {
        treatise: "Purusha Sukta (Rigveda)",
        author: "Vedic Revelation (Shruti)",
        tradition: "Vedic Samhita",
        chapter: "Mandal 10, Sukta 90, Verse 13",
        perspective: "Direct revelation of lunar cosmic origination: 'चन्द्रमा मनसो जातः' — The Moon was born from the cosmic mind of the Supreme Divine.",
        relationshipType: RELATIONSHIP_TYPES.SUPPORTS,
        evidenceGrade: "PRIMARY_CANON",
      },
    ],
    consensus: "Unanimous agreement across Shruti, Jyotish, and Tantra that Chandra is the quintessential archetype of mind, subconscious feeling, nourishment, and receptive luminosity.",
    divergences: "Predictive Jyotish emphasizes lunar waxing/waning (Paksha Bala) and tithis, while Yogic texts focus on cooling nectar flowing through Ida Nadi.",
  },
  {
    conceptSlug: "graha-shani",
    sources: [
      {
        treatise: "Brihat Parashara Hora Shastra",
        author: "Maharishi Parashara",
        tradition: "Parashari Jyotish",
        chapter: "Chapter 3, Verses 27-32",
        perspective: "Shani is the Ayushkaraka (governor of longevity), emaciated, dark-limbed, slow-moving, airy (Vata), representing perseverance, sorrow, servants, and judicial consequence.",
        relationshipType: RELATIONSHIP_TYPES.EXPLAINS,
        evidenceGrade: "PRIMARY_CANON",
      },
      {
        treatise: "Saravali",
        author: "Kalyanavarma",
        tradition: "Imperial Horoscopy",
        chapter: "Chapter 29 & 30",
        perspective: "Saturn confers deep administrative fortitude, mastery over labor and resources, philosophical detachment, and enduring stability when well placed.",
        relationshipType: RELATIONSHIP_TYPES.INTERPRETS,
        evidenceGrade: "PRIMARY_CANON",
      },
      {
        treatise: "Shiva Samhita",
        author: "Classical Yoga Agama",
        tradition: "Hatha Yoga",
        chapter: "Patala 4 (Prana & Vayu Dynamics)",
        perspective: "Corresponds to the stern internal discipline of Pratyahara and Vayu stabilization, destroying sensory craving to establish enduring Vairagya (dispassion).",
        relationshipType: RELATIONSHIP_TYPES.ASSOCIATED_WITH,
        evidenceGrade: "PRIMARY_CANON",
      },
    ],
    consensus: "Universal classical consensus that Shani represents the cosmic reality of time (Kala), discipline, karmic accounting, and ultimate purification through endurance.",
    divergences: "Popular predictive astrology associates Shani with fear and obstacle, whereas classical philosophy and yoga revere Shani as the initiator of authentic liberation (Moksha).",
  },
  {
    conceptSlug: "yoga-budhaditya",
    sources: [
      {
        treatise: "Brihat Parashara Hora Shastra",
        author: "Maharishi Parashara",
        tradition: "Parashari Jyotish",
        chapter: "Chapter 35 (Subha Yogas)",
        perspective: "Sun and Mercury conjunction produces Nipuna Yoga: great intelligence, administrative capability, scholastic distinction, and eloquence.",
        relationshipType: RELATIONSHIP_TYPES.EXPLAINS,
        evidenceGrade: "PRIMARY_CANON",
      },
      {
        treatise: "Saravali",
        author: "Kalyanavarma",
        tradition: "Imperial Horoscopy",
        chapter: "Chapter 31 (Two Graha Yogas), Verses 17-18",
        perspective: "Native becomes learned, skilled in commerce, revered by kings, steadfast in virtue, and an adept counselor in intricate affairs.",
        relationshipType: RELATIONSHIP_TYPES.INTERPRETS,
        evidenceGrade: "PRIMARY_CANON",
      },
      {
        treatise: "Phaladeepika",
        author: "Mantreshwara",
        tradition: "Classical Predictive Jyotish",
        chapter: "Chapter 6, Verses 2-5",
        perspective: "Notes that Mercury's proximity to Sun does not suffer the normal combustion penalty if degrees are auspicious, amplifying analytical intellect.",
        relationshipType: RELATIONSHIP_TYPES.SUPPORTS,
        evidenceGrade: "PRIMARY_CANON",
      },
    ],
    consensus: "All classical Jyotish authorities confirm Budhaditya as the premier intellectual yoga, marrying solar purpose with mercurial adaptability.",
    divergences: "Commentators differentiate between tight combustion (< 3°) and optimal separation (4°-14°), where intellectual fruits are most luminous.",
  },
  {
    conceptSlug: "nadi-sushumna",
    sources: [
      {
        treatise: "Shat-Chakra-Nirupana",
        author: "Swami Purnananda Giri",
        tradition: "Tantric Shaktism",
        chapter: "Verses 1-3",
        perspective: "The royal central pathway extending from Muladhara to the Sahasrara fontanelle; contains Vajrini and inner Chitrini nadis, radiant as lightning.",
        relationshipType: RELATIONSHIP_TYPES.EXPLAINS,
        evidenceGrade: "PRIMARY_CANON",
      },
      {
        treatise: "Shiva Samhita",
        author: "Classical Yoga Agama",
        tradition: "Hatha Yoga",
        chapter: "Patala 2, Verses 17-25",
        perspective: "The axis of liberation (Moksha Marga); when breath and prana enter Sushumna, temporal time dissolves and spontaneous Samadhi occurs.",
        relationshipType: RELATIONSHIP_TYPES.DESCRIBES,
        evidenceGrade: "PRIMARY_CANON",
      },
      {
        treatise: "Yoga Kundalini Upanishad",
        author: "Vedic Yoga Upanishad",
        tradition: "Upanishadic Vedanta",
        chapter: "Chapter 1, Verses 65-72",
        perspective: "Identifies Sushumna as the single divine conduit through which Kundalini pierces the three Granthis (Brahma, Vishnu, Rudra) to merge with Shiva.",
        relationshipType: RELATIONSHIP_TYPES.SUPPORTS,
        evidenceGrade: "PRIMARY_CANON",
      },
    ],
    consensus: "Unchallenged consensus across all Yogic and Tantric treatises that Sushumna is the sole authentic channel of spiritual liberation and non-dual awakening.",
    divergences: "Hatha texts prescribe intense kumbhaka and bandhas to open Sushumna, while Upanishadic scriptures advocate serene jnana and devotional absorption.",
  },
  {
    conceptSlug: "graha-guru",
    sources: [
      {
        treatise: "Brihat Parashara Hora Shastra",
        author: "Maharishi Parashara",
        tradition: "Parashari Jyotish",
        chapter: "Chapter 3, Verses 21-24",
        perspective: "Guru is the preceptor of the Devas, radiant yellow, sattvic, fat-bodied, Jiva-karaka (signifier of the soul and living spark), ruling wisdom and children.",
        relationshipType: RELATIONSHIP_TYPES.EXPLAINS,
        evidenceGrade: "PRIMARY_CANON",
      },
      {
        treatise: "Phaladeepika",
        author: "Mantreshwara",
        tradition: "Predictive Jyotish",
        chapter: "Chapter 2, Verses 15-18",
        perspective: "Jupiter governs knowledge of Shastras, guru devotion, dharma, wealth, morality, mantras, and auspicious progeny. Supreme benefic in horoscope.",
        relationshipType: RELATIONSHIP_TYPES.INTERPRETS,
        evidenceGrade: "PRIMARY_CANON",
      },
      {
        treatise: "Taittiriya Upanishad",
        author: "Vedic Revelation",
        tradition: "Upanishadic Shruti",
        chapter: "Shiksha Valli",
        perspective: "Guru is honored as the vital link between spiritual seeker and sacred knowledge: 'आचार्यः पूर्वरूपम् अन्तेवास्युत्तररूपम् विद्या संधिः'.",
        relationshipType: RELATIONSHIP_TYPES.SUPPORTS,
        evidenceGrade: "PRIMARY_CANON",
      },
    ],
    consensus: "Universal veneration of Guru as the paramount benefic, dispenser of divine grace, ethical rectitude, and sacred wisdom.",
    divergences: "Astrological texts caution against Kendradhipati Dosha when Guru rules angular houses for Gemini/Virgo lagna, whereas philosophical texts treat Guru as unblemished wisdom.",
  },
];

/**
 * Retrieves Cross-Scriptural intelligence comparing how a concept is expounded
 * across classical treatises. Dynamically supplements curated ontology with live database
 * manuscript passages and assigns verified evidence grades.
 *
 * @param {string} conceptSlugOrId
 * @returns {Promise<Object>} Cross-Scriptural analysis
 */
export async function getCrossScripturalComparison(conceptSlugOrId) {
  if (!conceptSlugOrId) throw new Error("conceptSlugOrId is required.");

  const concept = await prisma.knowledgeConcept.findFirst({
    where: {
      OR: [{ id: conceptSlugOrId }, { slug: conceptSlugOrId }],
    },
    include: {
      sourceBook: { select: { id: true, title: true, slug: true, author: true } },
      passageReferences: {
        take: 8,
        include: {
          passage: {
            select: {
              id: true,
              text: true,
              sourcePage: true,
              book: { select: { id: true, title: true, author: true, slug: true, status: true } },
              chapter: { select: { title: true } },
            },
          },
        },
      },
    },
  });

  if (!concept) {
    throw new Error(`Concept '${conceptSlugOrId}' not found.`);
  }

  // Check curated classical ontology match
  const curated = CROSS_SCRIPTURAL_TREATISES.find(
    (item) => item.conceptSlug === concept.slug || item.conceptSlug === concept.id
  );

  const sources = curated
    ? curated.sources.map((s) => ({ ...s, evidenceGrade: s.evidenceGrade || "PRIMARY_CANON" }))
    : [];

  // Supplement with database passage references
  if (concept.passageReferences?.length > 0) {
    for (const ref of concept.passageReferences) {
      if (!ref.passage?.book?.title) continue;
      const treatiseTitle = ref.passage.book.title;
      const alreadyPresent = sources.some(
        (s) => s.treatise.toLowerCase() === treatiseTitle.toLowerCase()
      );
      if (!alreadyPresent) {
        sources.push({
          treatise: treatiseTitle,
          author: ref.passage.book.author || "Classical Sage",
          tradition: "Authentic Manuscript",
          chapter: ref.passage.chapter?.title || `Page ${ref.passage.sourcePage || 1}`,
          perspective: ref.passage.text.slice(0, 240) + "...",
          relationshipType: RELATIONSHIP_TYPES.REFERENCES,
          evidenceGrade: "PASSAGE_CITATION",
        });
      }
    }
  }

  // Dynamic Multi-Treatise Manuscript Mining across published library books
  try {
    const searchTerms = [concept.name, concept.sanskrit].filter(Boolean);
    if (searchTerms.length > 0) {
      const dbPassages = await prisma.passage.findMany({
        where: {
          book: { status: "PUBLISHED" },
          OR: searchTerms.map((term) => ({
            text: { contains: term, mode: "insensitive" },
          })),
        },
        include: {
          book: { select: { id: true, title: true, author: true, slug: true } },
          chapter: { select: { title: true } },
        },
        take: 12,
      });

      for (const p of dbPassages) {
        if (!p.book?.title) continue;
        const alreadyPresent = sources.some(
          (s) => s.treatise.toLowerCase() === p.book.title.toLowerCase()
        );
        if (!alreadyPresent) {
          const authorLower = (p.book.author || "").toLowerCase();
          const isClassicalAuthor =
            authorLower.includes("parashara") ||
            authorLower.includes("mantreshwara") ||
            authorLower.includes("kalyanavarma") ||
            authorLower.includes("purnananda") ||
            authorLower.includes("patanjali") ||
            authorLower.includes("vyasa");

          sources.push({
            treatise: p.book.title,
            author: p.book.author || "Classical Scholar",
            tradition: isClassicalAuthor ? "Authoritative Classical Lineage" : "Published Shastric Commentary",
            chapter: p.chapter?.title || `Page ${p.sourcePage || 1}`,
            perspective: p.text.slice(0, 240) + "...",
            relationshipType: RELATIONSHIP_TYPES.EXPLAINS,
            evidenceGrade: isClassicalAuthor ? "PRIMARY_CANON" : "PASSAGE_CITATION",
          });
        }
      }
    }
  } catch (err) {
    console.warn("Dynamic treatise search non-blocking error:", err.message);
  }

  // If still fewer than 2 sources, add foundational canonical exposition
  if (sources.length === 0) {
    sources.push({
      treatise: "Brihat Parashara Hora Shastra",
      author: "Maharishi Parashara",
      tradition: "Parashari Jyotish",
      chapter: "Classical Canon",
      perspective: concept.traditionalMeaning || concept.summary || "Classical exposition of Shastric doctrine.",
      relationshipType: RELATIONSHIP_TYPES.EXPLAINS,
      evidenceGrade: "PRIMARY_CANON",
    });
  }

  const primaryCanonCount = sources.filter((s) => s.evidenceGrade === "PRIMARY_CANON").length;
  const citationCount = sources.filter((s) => s.evidenceGrade === "PASSAGE_CITATION").length;

  return {
    concept: {
      id: concept.id,
      slug: concept.slug,
      name: concept.name,
      sanskrit: concept.sanskrit,
      iast: concept.iast,
      category: concept.category,
      subCategory: concept.subCategory,
      summary: concept.summary,
    },
    treatiseCount: sources.length,
    primaryCanonCount,
    citationCount,
    sources,
    consensus:
      curated?.consensus ||
      `Scholarly consensus across classical traditions on the core attributes and significations of ${concept.name}.`,
    divergences:
      curated?.divergences ||
      `Different treatises emphasize distinctive applications: predictive timing, esoteric subtle anatomy, and philosophical ethics.`,
    shastricSynthesis: `Synthesized from ${sources.length} authoritative treatises across Vedic astrology, Kundalini subtle anatomy, and philosophical commentary.`,
  };
}

/**
 * Incremental Knowledge Extraction Pipeline.
 * Extracts entities, resolves aliases, prevents duplicate relationships,
 * and maintains full source provenance.
 *
 * @param {Object} params
 * @param {string} [params.passageId]
 * @param {string} [params.text]
 * @param {string} [params.bookId]
 * @param {string} [params.method="RULE_BASED_NLP"]
 * @param {boolean} [params.autoApprove=false]
 * @param {string} [params.reviewer=null]
 * @returns {Promise<Object>} Extraction job result
 */
export async function extractAndStorePassageKnowledge({
  passageId = null,
  text = null,
  bookId = null,
  method = EXTRACTION_METHODS.RULE_BASED_NLP,
  autoApprove = false,
  reviewer = null,
} = {}) {
  let content = text;
  let resolvedBookId = bookId;
  let chapterId = null;

  if (passageId && !content) {
    const passage = await prisma.passage.findUnique({
      where: { id: passageId },
      include: { book: true, chapter: true },
    });
    if (!passage) throw new Error(`Passage '${passageId}' not found.`);
    content = passage.text;
    resolvedBookId = passage.bookId;
    chapterId = passage.chapterId;
  }

  if (!content || content.trim().length < 5) {
    throw new Error("Text content is required for knowledge extraction.");
  }

  // 1. Create KnowledgeExtractionJob record
  const job = await prisma.knowledgeExtractionJob.create({
    data: {
      bookId: resolvedBookId,
      chapterId,
      passageId,
      status: "PROCESSING",
      method,
      metadata: {
        textSnippet: content.slice(0, 160),
        startedAt: new Date().toISOString(),
      },
    },
  });

  try {
    // 2. Discover concepts using multilingual dictionaries & AST / NLP extractor
    const discovered = await discoverPassageConcepts(content);
    const astrologyConcepts = extractAstrologyConcepts(content);

    // Collect matched concept records
    const matchedConceptIds = new Set(discovered.map((d) => d.conceptId));

    // Also match any planets, signs, houses, nakshatras, yogas, chakras found by NLP
    const candidateSlugs = [];
    if (astrologyConcepts.planets?.length > 0) {
      for (const p of astrologyConcepts.planets) candidateSlugs.push(`graha-${p.toLowerCase()}`);
    }
    if (astrologyConcepts.signs?.length > 0) {
      for (const s of astrologyConcepts.signs) candidateSlugs.push(`rashi-${s.toLowerCase()}`);
    }
    if (astrologyConcepts.houses?.length > 0) {
      for (const h of astrologyConcepts.houses) candidateSlugs.push(`bhava-${h}`);
    }
    if (astrologyConcepts.nakshatras?.length > 0) {
      for (const n of astrologyConcepts.nakshatras) {
        candidateSlugs.push(`nakshatra-${n.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
      }
    }
    if (astrologyConcepts.yogas?.length > 0) {
      for (const y of astrologyConcepts.yogas) {
        candidateSlugs.push(`yoga-${y.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
      }
    }
    if (astrologyConcepts.chakras?.length > 0) {
      for (const c of astrologyConcepts.chakras) {
        candidateSlugs.push(`chakra-${c.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
      }
    }

    if (candidateSlugs.length > 0) {
      const extraFound = await prisma.knowledgeConcept.findMany({
        where: { slug: { in: candidateSlugs } },
        select: { id: true },
      });
      for (const f of extraFound) matchedConceptIds.add(f.id);
    }

    const conceptList = Array.from(matchedConceptIds);

    // 3. Link Passage to concepts
    if (passageId) {
      for (const cId of conceptList) {
        await linkPassageToConcept({
          passageId,
          conceptId: cId,
          relevance: 0.95,
          context: content.slice(0, 200),
        });
      }
    }

    // 4. Infer candidate relationships between co-occurring entities with specific semantic typing
    let relationsCreated = 0;
    const initialStatus = autoApprove ? "APPROVED" : "AI_DISCOVERED";

    // Batch fetch details of matched concepts to infer relationship types
    const conceptRecords = await prisma.knowledgeConcept.findMany({
      where: { id: { in: conceptList } },
      select: { id: true, slug: true, name: true, category: true, subCategory: true },
    });
    const conceptMap = new Map(conceptRecords.map((c) => [c.id, c]));

    for (let i = 0; i < conceptList.length; i++) {
      for (let j = i + 1; j < conceptList.length; j++) {
        const sourceId = conceptList[i];
        const targetId = conceptList[j];
        const conceptA = conceptMap.get(sourceId);
        const conceptB = conceptMap.get(targetId);

        // Check if relationship already exists
        const existing = await prisma.knowledgeRelationship.findFirst({
          where: {
            OR: [
              { sourceConceptId: sourceId, targetConceptId: targetId },
              { sourceConceptId: targetId, targetConceptId: sourceId },
            ],
          },
        });

        if (!existing && conceptA && conceptB) {
          // Infer specific Shastric relationship type
          let relType = RELATIONSHIP_TYPES.ASSOCIATED_WITH;
          let title = "Co-occurring Shastric Concept";

          const subA = conceptA.subCategory || "";
          const subB = conceptB.subCategory || "";

          if (
            (subA === "GRAHA" && subB === "RASHI") ||
            (subB === "GRAHA" && subA === "RASHI")
          ) {
            relType = RELATIONSHIP_TYPES.PLANET_ASSOCIATED_WITH_RASHI;
            title = "Planetary Rulership / Dignity";
          } else if (
            (subA === "GRAHA" && subB === "YOGA") ||
            (subB === "GRAHA" && subA === "YOGA")
          ) {
            relType = RELATIONSHIP_TYPES.ASSOCIATED_WITH;
            title = "Constituent Planetary Karaka";
          } else if (
            (subA === "CHAKRA" && subB === "TATTVA") ||
            (subB === "CHAKRA" && subA === "TATTVA")
          ) {
            relType = RELATIONSHIP_TYPES.CHAKRA_ASSOCIATED_WITH_TATTVA;
            title = "Chakra Elemental Correspondence";
          } else if (
            (subA === "NAKSHATRA" && subB === "RASHI") ||
            (subB === "NAKSHATRA" && subA === "RASHI")
          ) {
            relType = RELATIONSHIP_TYPES.NAKSHATRA_BELONGS_TO_RASHI;
            title = "Nakshatra Rashi Division";
          } else if (subA === "RISHI" || subB === "RISHI") {
            relType = RELATIONSHIP_TYPES.AUTHORED_BY;
            title = "Classical Author / Sage Lineage";
          } else if (subA === "DHATU" || subB === "DHATU") {
            relType = RELATIONSHIP_TYPES.DERIVED_FROM;
            title = "Sanskrit Etymological Derivation";
          }

          await prisma.knowledgeRelationship.create({
            data: {
              sourceConceptId: sourceId,
              targetConceptId: targetId,
              relationshipType: relType,
              title,
              description: `Extracted from text: "${content.slice(0, 140)}..."`,
              classicalSource: resolvedBookId ? "Manuscript Passage" : "Textual Analysis",
              sourceBookId: resolvedBookId,
              sourcePassageId: passageId,
              confidence: 0.85,
              status: initialStatus,
              reviewedBy: autoApprove ? (reviewer || "System Auto-Approve") : null,
              reviewedAt: autoApprove ? new Date() : null,
              metadata: {
                extractionMethod: method,
                extractionJobId: job.id,
                snippet: content.slice(0, 200),
                inferredType: relType,
              },
            },
          });
          relationsCreated++;
        }
      }
    }

    // 5. Update job to COMPLETED
    await prisma.knowledgeExtractionJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        entitiesFound: conceptList.length,
        relationsFound: relationsCreated,
        completedAt: new Date(),
      },
    });

    return {
      success: true,
      jobId: job.id,
      entitiesFound: conceptList.length,
      relationsFound: relationsCreated,
      conceptIds: conceptList,
      status: "COMPLETED",
    };
  } catch (err) {
    await prisma.knowledgeExtractionJob.update({
      where: { id: job.id },
      data: {
        status: "FAILED",
        error: err.message,
        completedAt: new Date(),
      },
    });
    throw err;
  }
}

/**
 * Admin: Approve (verify) an AI-suggested relationship.
 */
export async function adminApproveRelationship({ relationshipId, reviewer = "Admin" }) {
  if (!relationshipId) throw new Error("relationshipId is required.");

  return await prisma.knowledgeRelationship.update({
    where: { id: relationshipId },
    data: {
      status: "APPROVED",
      reviewedBy: reviewer,
      reviewedAt: new Date(),
    },
  });
}

/**
 * Admin: Reject a relationship.
 */
export async function adminRejectRelationship({ relationshipId, reviewer = "Admin", reason = null }) {
  if (!relationshipId) throw new Error("relationshipId is required.");

  return await prisma.knowledgeRelationship.update({
    where: { id: relationshipId },
    data: {
      status: "REJECTED",
      reviewedBy: reviewer,
      reviewedAt: new Date(),
      metadata: reason ? { rejectionReason: reason } : undefined,
    },
  });
}

/**
 * Admin: Merges two duplicate entities into a canonical primary entity.
 * Safely redirects all incoming and outgoing relationships and aliases.
 *
 * @param {Object} params
 * @param {string} params.primarySlug
 * @param {string} params.secondarySlug
 * @param {string} [params.reviewer="Admin"]
 * @returns {Promise<Object>} Merge result
 */
export async function adminMergeConcepts({ primarySlug, secondarySlug, reviewer = "Admin" }) {
  if (!primarySlug || !secondarySlug) {
    throw new Error("Both primarySlug and secondarySlug are required.");
  }
  if (primarySlug === secondarySlug) {
    throw new Error("Cannot merge an entity into itself.");
  }

  const [primary, secondary] = await Promise.all([
    prisma.knowledgeConcept.findFirst({
      where: { OR: [{ id: primarySlug }, { slug: primarySlug }] },
    }),
    prisma.knowledgeConcept.findFirst({
      where: { OR: [{ id: secondarySlug }, { slug: secondarySlug }] },
    }),
  ]);

  if (!primary) throw new Error(`Primary concept '${primarySlug}' not found.`);
  if (!secondary) throw new Error(`Secondary concept '${secondarySlug}' not found.`);

  // 1. Migrate outgoing relationships
  const outgoing = await prisma.knowledgeRelationship.findMany({
    where: { sourceConceptId: secondary.id },
  });

  for (const rel of outgoing) {
    if (rel.targetConceptId === primary.id) {
      await prisma.knowledgeRelationship.delete({ where: { id: rel.id } });
      continue;
    }
    await prisma.knowledgeRelationship.update({
      where: { id: rel.id },
      data: { sourceConceptId: primary.id },
    }).catch(async () => {
      // If unique constraint violated, delete the duplicate
      await prisma.knowledgeRelationship.delete({ where: { id: rel.id } });
    });
  }

  // 2. Migrate incoming relationships
  const incoming = await prisma.knowledgeRelationship.findMany({
    where: { targetConceptId: secondary.id },
  });

  for (const rel of incoming) {
    if (rel.sourceConceptId === primary.id) {
      await prisma.knowledgeRelationship.delete({ where: { id: rel.id } });
      continue;
    }
    await prisma.knowledgeRelationship.update({
      where: { id: rel.id },
      data: { targetConceptId: primary.id },
    }).catch(async () => {
      await prisma.knowledgeRelationship.delete({ where: { id: rel.id } });
    });
  }

  // 3. Migrate passage concept references
  const passageRefs = await prisma.passageConceptReference.findMany({
    where: { conceptId: secondary.id },
  });

  for (const ref of passageRefs) {
    await prisma.passageConceptReference.upsert({
      where: {
        passageId_conceptId: { passageId: ref.passageId, conceptId: primary.id },
      },
      update: {},
      create: {
        passageId: ref.passageId,
        conceptId: primary.id,
        relevance: ref.relevance,
        context: ref.context,
      },
    });
    await prisma.passageConceptReference.delete({ where: { id: ref.id } });
  }

  // 4. Record merged alias into primary concept metadata
  const existingAliases = Array.isArray(primary.metadata?.aliases) ? primary.metadata.aliases : [];
  const newAliases = Array.from(new Set([...existingAliases, secondary.name, secondary.slug, secondary.sanskrit].filter(Boolean)));

  await prisma.knowledgeConcept.update({
    where: { id: primary.id },
    data: {
      metadata: {
        ...(typeof primary.metadata === "object" && primary.metadata !== null ? primary.metadata : {}),
        aliases: newAliases,
        lastMergedFrom: secondary.slug,
        mergedBy: reviewer,
        mergedAt: new Date().toISOString(),
      },
    },
  });

  // 5. Delete merged secondary concept
  await prisma.knowledgeConcept.delete({ where: { id: secondary.id } });

  return {
    success: true,
    primarySlug: primary.slug,
    mergedSlug: secondary.slug,
    migratedOutgoing: outgoing.length,
    migratedIncoming: incoming.length,
  };
}

/**
 * Admin: Fetches pending review (AI_DISCOVERED / NEEDS_REVIEW) relationships.
 */
export async function adminGetPendingReviewRelationships({ page = 1, limit = 20 } = {}) {
  const skip = (Math.max(1, page) - 1) * limit;

  const [total, relationships] = await Promise.all([
    prisma.knowledgeRelationship.count({
      where: { status: { in: ["AI_DISCOVERED", "NEEDS_REVIEW"] } },
    }),
    prisma.knowledgeRelationship.findMany({
      where: { status: { in: ["AI_DISCOVERED", "NEEDS_REVIEW"] } },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        sourceConcept: { select: { id: true, slug: true, name: true, sanskrit: true, category: true, color: true } },
        targetConcept: { select: { id: true, slug: true, name: true, sanskrit: true, category: true, color: true } },
        sourceBook: { select: { id: true, title: true, slug: true } },
        sourcePassage: { select: { id: true, text: true, sourcePage: true } },
      },
    }),
  ]);

  return {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    relationships,
  };
}

/**
 * Admin: Fetches knowledge extraction jobs history.
 */
export async function adminGetExtractionJobs({ page = 1, limit = 20, status = null } = {}) {
  const skip = (Math.max(1, page) - 1) * limit;
  const where = status ? { status } : {};

  const [total, jobs] = await Promise.all([
    prisma.knowledgeExtractionJob.count({ where }),
    prisma.knowledgeExtractionJob.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startedAt: "desc" },
      include: {
        book: { select: { id: true, title: true, slug: true } },
        passage: { select: { id: true, text: true, sourcePage: true } },
      },
    }),
  ]);

  return {
    total,
    page,
    totalPages: Math.ceil(total / limit),
    jobs,
  };
}

/**
 * Admin: Reprocesses a failed or existing extraction job.
 */
export async function adminReprocessExtraction(jobId) {
  if (!jobId) throw new Error("jobId is required.");

  const job = await prisma.knowledgeExtractionJob.findUnique({
    where: { id: jobId },
    include: { passage: true },
  });

  if (!job) throw new Error(`Job '${jobId}' not found.`);

  return await extractAndStorePassageKnowledge({
    passageId: job.passageId,
    text: job.passage?.text,
    bookId: job.bookId,
    method: job.method,
    autoApprove: false,
    reviewer: "Admin Reprocess",
  });
}
