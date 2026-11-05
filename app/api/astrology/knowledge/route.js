/**
 * GET /api/astrology/knowledge
 * 
 * Provides structured educational content on Vedic Astrology (Jyotisha Shastra)
 * and Kundalini Yoga, covering Horoscope Foundations, the 12 Bhavas (Houses),
 * the 9 Grahas (Navagrahas), the 12 Rashis (Signs), all 27 Nakshatras with 4 Padas each,
 * the 5 Limbs of Panchang, and the Seven Classical Chakras.
 * 
 * Includes concept relationships, related node resolution, and multilingual search.
 * 
 * Supports query parameters:
 *  - category: overview | bhavas | grahas | rashis | nakshatras | panchang | chakras | relationships | all
 *  - q: search query across all categories including Sanskrit, Hindi, and English
 *  - id or number: fetch specific entity
 *  - relatedTo: fetch concepts linked to a given concept key (e.g. "graha-surya")
 */

import { NextResponse } from "next/server.js";
import { HOROSCOPE_OVERVIEW } from "../../../../server/astrology/horoscopeOverviewKnowledge.js";
import { BHAVAS_KNOWLEDGE } from "../../../../server/astrology/bhavasKnowledge.js";
import { GRAHAS_KNOWLEDGE } from "../../../../server/astrology/grahasKnowledge.js";
import { RASHIS_KNOWLEDGE, NAKSHATRAS_KNOWLEDGE, PANCHANG_KNOWLEDGE } from "../../../../server/astrology/rashisNakshatrasKnowledge.js";
import { CHAKRAS_ARRAY, getChakraBySlug } from "../../../../server/spirituality/chakraKnowledge.js";
import { CONCEPT_RELATIONSHIPS, getRelatedConcepts } from "../../../../server/astrology/conceptRelationships.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category")?.toLowerCase() || "all";
    const q = searchParams.get("q")?.toLowerCase()?.trim() || "";
    const id = searchParams.get("id")?.toLowerCase()?.trim() || "";
    const number = searchParams.get("number") ? parseInt(searchParams.get("number"), 10) : null;
    const relatedTo = searchParams.get("relatedTo")?.toLowerCase()?.trim() || "";

    // 1. Related Concepts Lookup
    if (relatedTo) {
      const related = getRelatedConcepts(relatedTo);
      return NextResponse.json({
        success: true,
        conceptKey: relatedTo,
        relationships: related,
        count: related.length,
      });
    }

    if (category === "relationships") {
      return NextResponse.json({
        success: true,
        relationships: CONCEPT_RELATIONSHIPS,
      });
    }

    // 2. Specific Entity Lookups
    if (category === "bhavas" && number) {
      const bhava = BHAVAS_KNOWLEDGE.find((b) => b.number === number);
      if (!bhava) {
        return NextResponse.json({ error: `Bhava ${number} not found` }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: bhava,
        related: getRelatedConcepts(`bhava-${number}`),
      });
    }

    if (category === "grahas" && id) {
      const graha = GRAHAS_KNOWLEDGE.find((g) => g.id === id || g.sanskritName.toLowerCase().includes(id));
      if (!graha) {
        return NextResponse.json({ error: `Graha '${id}' not found` }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: graha,
        related: getRelatedConcepts(`graha-${graha.id}`),
      });
    }

    if (category === "rashis" && (id || number)) {
      const rashi = RASHIS_KNOWLEDGE.find((r) => (number && r.number === number) || (id && (r.name.toLowerCase() === id || r.english.toLowerCase() === id)));
      if (!rashi) {
        return NextResponse.json({ error: "Rashi not found" }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: rashi,
        related: getRelatedConcepts(`rashi-${rashi.name.toLowerCase()}`),
      });
    }

    if (category === "nakshatras" && (number || id)) {
      const nakshatra = NAKSHATRAS_KNOWLEDGE.find((n) => (number && n.number === number) || (id && n.name.toLowerCase() === id));
      if (!nakshatra) {
        return NextResponse.json({ error: "Nakshatra not found" }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: nakshatra,
        related: getRelatedConcepts(`nakshatra-${nakshatra.name.toLowerCase()}`),
      });
    }

    if (category === "chakras" && id) {
      const chakra = getChakraBySlug(id);
      if (!chakra) {
        return NextResponse.json({ error: `Chakra '${id}' not found` }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        data: chakra,
        related: getRelatedConcepts(`chakra-${chakra.id}`),
      });
    }

    // 3. Search Filter Across All Disciplines (Astrology & Kundalini)
    if (q) {
      const filteredBhavas = BHAVAS_KNOWLEDGE.filter((b) =>
        b.sanskritName.toLowerCase().includes(q) ||
        b.devanagari?.toLowerCase().includes(q) ||
        b.englishName.toLowerCase().includes(q) ||
        b.primarySignifications.some((s) => s.toLowerCase().includes(q)) ||
        Object.values(b.modernLifeDomains || {}).some((v) => v.toLowerCase().includes(q))
      );

      const filteredGrahas = GRAHAS_KNOWLEDGE.filter((g) =>
        g.sanskritName.toLowerCase().includes(q) ||
        g.devanagari?.toLowerCase().includes(q) ||
        g.englishName.toLowerCase().includes(q) ||
        g.symbolism.toLowerCase().includes(q) ||
        g.coreSignifications.some((s) => s.toLowerCase().includes(q))
      );

      const filteredRashis = RASHIS_KNOWLEDGE.filter((r) =>
        r.name.toLowerCase().includes(q) ||
        r.devanagari?.toLowerCase().includes(q) ||
        r.english.toLowerCase().includes(q) ||
        r.archetype.toLowerCase().includes(q) ||
        r.qualities.toLowerCase().includes(q)
      );

      const filteredNakshatras = NAKSHATRAS_KNOWLEDGE.filter((n) =>
        n.name.toLowerCase().includes(q) ||
        n.devanagari?.toLowerCase().includes(q) ||
        n.deity.toLowerCase().includes(q) ||
        n.symbol.toLowerCase().includes(q) ||
        n.primaryQualities.toLowerCase().includes(q)
      );

      const filteredChakras = CHAKRAS_ARRAY.filter((c) =>
        c.sanskritName.toLowerCase().includes(q) ||
        c.englishName.toLowerCase().includes(q) ||
        c.bijaMantra.toLowerCase().includes(q) ||
        c.element.toLowerCase().includes(q) ||
        c.meaning.toLowerCase().includes(q)
      );

      return NextResponse.json({
        success: true,
        query: q,
        results: {
          bhavas: filteredBhavas,
          grahas: filteredGrahas,
          rashis: filteredRashis,
          nakshatras: filteredNakshatras,
          chakras: filteredChakras,
          totalMatches:
            filteredBhavas.length +
            filteredGrahas.length +
            filteredRashis.length +
            filteredNakshatras.length +
            filteredChakras.length,
        },
      });
    }

    // 4. Category Returns
    let responseData = {};
    if (category === "overview") {
      responseData = { overview: HOROSCOPE_OVERVIEW };
    } else if (category === "bhavas") {
      responseData = { bhavas: BHAVAS_KNOWLEDGE };
    } else if (category === "grahas") {
      responseData = { grahas: GRAHAS_KNOWLEDGE };
    } else if (category === "rashis") {
      responseData = { rashis: RASHIS_KNOWLEDGE };
    } else if (category === "nakshatras") {
      responseData = { nakshatras: NAKSHATRAS_KNOWLEDGE };
    } else if (category === "panchang") {
      responseData = { panchang: PANCHANG_KNOWLEDGE };
    } else if (category === "chakras") {
      responseData = { chakras: CHAKRAS_ARRAY };
    } else {
      // "all"
      responseData = {
        overview: HOROSCOPE_OVERVIEW,
        bhavas: BHAVAS_KNOWLEDGE,
        grahas: GRAHAS_KNOWLEDGE,
        rashis: RASHIS_KNOWLEDGE,
        nakshatras: NAKSHATRAS_KNOWLEDGE,
        panchang: PANCHANG_KNOWLEDGE,
        chakras: CHAKRAS_ARRAY,
        summary: {
          totalBhavas: BHAVAS_KNOWLEDGE.length,
          totalGrahas: GRAHAS_KNOWLEDGE.length,
          totalRashis: RASHIS_KNOWLEDGE.length,
          totalNakshatras: NAKSHATRAS_KNOWLEDGE.length,
          totalChakras: CHAKRAS_ARRAY.length,
          panchangLimbsCount: PANCHANG_KNOWLEDGE.limbs.length,
        },
      };
    }

    const res = NextResponse.json({
      success: true,
      category,
      ...responseData,
    });

    res.headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
    return res;
  } catch (error) {
    console.error("GET /api/astrology/knowledge error:", error);
    return NextResponse.json(
      { error: "Failed to fetch astrology knowledge", details: error.message },
      { status: 500 }
    );
  }
}
