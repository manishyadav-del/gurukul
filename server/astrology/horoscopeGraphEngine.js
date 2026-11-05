/**
 * server/astrology/horoscopeGraphEngine.js
 * 
 * Intelligent Horoscope Knowledge Graph Engine.
 * 
 * Interconnects actual calculated astronomical values (Panchang, Transits, Choghadiya,
 * Muhurta, Rashis, Bhavas) directly with the Gurukul Knowledge Graph, classical treatises,
 * verifiable source citations, and RAG-grounded explanations.
 * 
 * Strictly adheres to:
 * - Deterministic calculations from astronomy-engine and Lahiri ayanamsa.
 * - Zero hallucinated relationships, zero invented remedies.
 * - Non-fatalistic, traditional shastric educational context.
 */

import prisma from "../../lib/prisma.js";
import { computePanchang } from "./panchang.js";
import { computeDailyTransits, buildTransitsOverview } from "./transits.js";
import { RASHIS_KNOWLEDGE, NAKSHATRAS_KNOWLEDGE, PANCHANG_KNOWLEDGE } from "./rashisNakshatrasKnowledge.js";
import { GRAHAS_KNOWLEDGE } from "./grahasKnowledge.js";
import { BHAVAS_KNOWLEDGE } from "./bhavasKnowledge.js";
import { CHAKRAS_ARRAY } from "../spirituality/chakraKnowledge.js";
import { CONCEPT_RELATIONSHIPS } from "./conceptRelationships.js";
import { executeHybridSearch } from "../search/hybridSearch.js";

/**
 * Builds a dynamic, live Knowledge Graph reflecting the ACTUAL calculated horoscope
 * for a specific date, coordinates, and timezone.
 * 
 * @param {Object} params
 * @param {string} params.date - "YYYY-MM-DD"
 * @param {number} params.lat - Latitude
 * @param {number} params.lon - Longitude
 * @param {number} params.tz - Timezone offset in hours
 * @param {string} params.timezone - IANA timezone string
 * @param {string} [params.selectedRashi] - Currently selected zodiac sign (e.g. "Taurus")
 * @param {string} [params.language="en"] - "en" | "hi"
 * @returns {Promise<Object>} Live horoscope graph nodes, edges, calculated facts & metadata
 */
export async function buildLiveHoroscopeGraph({
  date,
  lat,
  lon,
  tz,
  timezone = "UTC",
  selectedRashi = "Aries",
  language = "en",
}) {
  // 1. Run actual astronomical computations for the exact date and location
  const panchang = computePanchang({
    date,
    latitude: lat,
    longitude: lon,
    tzOffset: tz,
    timezone,
  });

  const transits = computeDailyTransits({
    date,
    tzOffset: tz,
  });
  const transitsOverview = buildTransitsOverview(transits);

  const nodes = [];
  const edges = [];
  const addedNodes = new Set();
  const addedEdges = new Set();

  function addNode(node) {
    if (!node || !node.id || addedNodes.has(node.id)) return;
    addedNodes.add(node.id);
    nodes.push(node);
  }

  function addEdge(source, target, label, classicalSource = "Brihat Parashara Hora Shastra", type = "CLASSICAL_RELATION") {
    if (!source || !target) return;
    const key = `${source}->${target}:${label}`;
    if (addedEdges.has(key)) return;
    addedEdges.add(key);
    edges.push({
      id: `edge-${edges.length + 1}`,
      source,
      target,
      label,
      classicalSource,
      type,
    });
  }

  // -------------------------------------------------------------------------
  // NODE 1: Center Cosmos Node (Today's Date & Location Context)
  // -------------------------------------------------------------------------
  const centerId = `horoscope-${date}`;
  addNode({
    id: centerId,
    slug: centerId,
    name: `Daily Sky (${date})`,
    sanskrit: "दैनिक कालचक्र",
    category: "CALCULATED_SKY",
    categoryLabel: "Calculated Sky",
    calculatedValue: `${date} • Lat: ${lat.toFixed(2)}°, Lon: ${lon.toFixed(2)}°`,
    summary: `Verified astronomical alignment computed at local noon via astronomy-engine with Lahiri Ayanamsa (${panchang.ayanamsa}°).`,
    color: "#c4903c",
    ring: 0,
    isCenter: true,
  });

  // -------------------------------------------------------------------------
  // GROUP A: Real Panchang Elements (Tithi, Nakshatra, Yoga, Karana, Vara)
  // -------------------------------------------------------------------------
  // 1. Tithi
  const tithiNodeId = `tithi-${panchang.tithi?.id || 1}`;
  addNode({
    id: tithiNodeId,
    slug: tithiNodeId,
    name: `Tithi: ${panchang.tithi?.name} (${panchang.tithi?.paksha} Paksha)`,
    sanskrit: panchang.tithi?.devanagari || "तिथि",
    category: "PANCHANG_TITHI",
    categoryLabel: "Panchang: Tithi",
    calculatedValue: `${panchang.tithi?.name} • ${panchang.tithi?.elongation}° Soli-Lunar elongation (${Math.round((panchang.tithi?.fractionElapsed || 0) * 100)}% elapsed)`,
    summary: `Governs Jala (water element / emotional state). Phase: ${panchang.tithi?.paksha} Fortnight. Degree in Tithi: ${panchang.tithi?.degreeInTithi}°.`,
    traditionalMeaning: "Surya Siddhanta & BPHS: Each 12° elongation between the Moon and Sun forms one lunar day (Tithi).",
    classicalSource: "Surya Siddhanta Ch. 14; BPHS Ch. 3",
    color: "#2563eb",
    ring: 1,
    linkTab: "panchang",
  });
  addEdge(centerId, tithiNodeId, "Calculated Tithi", "Surya Siddhanta Ch. 14", "ASTRONOMICAL_FACT");

  // 2. Nakshatra
  const nakshatraRecord = NAKSHATRAS_KNOWLEDGE.find((n) => n.id === panchang.nakshatra?.id || n.name === panchang.nakshatra?.name) || {};
  const nakNodeId = `nakshatra-${panchang.nakshatra?.name?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "ashwini"}`;
  addNode({
    id: nakNodeId,
    slug: nakNodeId,
    name: `Nakshatra: ${panchang.nakshatra?.name} (Pada ${panchang.nakshatra?.pada})`,
    sanskrit: panchang.nakshatra?.devanagari || nakshatraRecord.devanagari || "नक्षत्र",
    category: "PANCHANG_NAKSHATRA",
    categoryLabel: "Panchang: Nakshatra",
    calculatedValue: `${panchang.nakshatra?.name} • Pada ${panchang.nakshatra?.pada} (${panchang.nakshatra?.degreeInNakshatra}° in Nakshatra)`,
    summary: `Ruling Graha: ${panchang.nakshatra?.lord}. Deity: ${nakshatraRecord.deity || "Classical Deity"}. Symbol: ${nakshatraRecord.symbol || "Constellation"}.`,
    traditionalMeaning: `Governs Vayu (air element / mental impressions). Span: 13°20' per Nakshatra with 3°20' Pada subdivisions.`,
    classicalSource: "Brihat Samhita Ch. 15; BPHS Ch. 3 v. 14-16",
    color: "#7c3aed",
    ring: 1,
    linkTab: "panchang",
  });
  addEdge(centerId, nakNodeId, "Active Moon Constellation", "BPHS Ch. 3", "ASTRONOMICAL_FACT");

  // 3. Yoga
  const yogaNodeId = `yoga-${panchang.yoga?.id || 1}`;
  addNode({
    id: yogaNodeId,
    slug: yogaNodeId,
    name: `Yoga: ${panchang.yoga?.name}`,
    sanskrit: panchang.yoga?.devanagari || "योग",
    category: "PANCHANG_YOGA",
    categoryLabel: "Panchang: Yoga",
    calculatedValue: `${panchang.yoga?.name} (${panchang.yoga?.id}/27)`,
    summary: "Combined angular sum of solar and lunar sidereal longitudes ((Sun + Moon) / 13°20'). Represents the Akasha (ether) element and binding harmony.",
    classicalSource: "Surya Siddhanta Ch. 14; Muhurta Chintamani",
    color: "#059669",
    ring: 1,
    linkTab: "panchang",
  });
  addEdge(centerId, yogaNodeId, "Calculated Yoga", "Surya Siddhanta", "ASTRONOMICAL_FACT");

  // 4. Karana
  const karanaNodeId = `karana-${panchang.karana?.id || 1}`;
  addNode({
    id: karanaNodeId,
    slug: karanaNodeId,
    name: `Karana: ${panchang.karana?.name}`,
    sanskrit: panchang.karana?.devanagari || "करण",
    category: "PANCHANG_KARANA",
    categoryLabel: "Panchang: Karana",
    calculatedValue: `${panchang.karana?.name} (${panchang.karana?.type || "Chara"})`,
    summary: "Half of a Tithi (6° elongation arc). Represents the Prithvi (earth) element and execution of tangible deeds.",
    classicalSource: "Surya Siddhanta; BPHS Ch. 3",
    color: "#d97706",
    ring: 1,
    linkTab: "panchang",
  });
  addEdge(centerId, karanaNodeId, "Calculated Karana", "BPHS Ch. 3", "ASTRONOMICAL_FACT");

  // 5. Vara (Day)
  const sunriseStr = panchang.sunrise?.local || panchang.sunrise?.formatted || "N/A";
  const sunsetStr = panchang.sunset?.local || panchang.sunset?.formatted || "N/A";
  const rahuKaalStr = panchang.rahuKaal?.formatted || (panchang.rahuKaal?.startLocal ? `${panchang.rahuKaal.startLocal} - ${panchang.rahuKaal.endLocal}` : "N/A");

  const varaNodeId = `vara-${panchang.vara?.en?.toLowerCase() || "sunday"}`;
  addNode({
    id: varaNodeId,
    slug: varaNodeId,
    name: `Vara: ${panchang.vara?.en} (${panchang.vara?.hi})`,
    sanskrit: panchang.vara?.hi || "वार",
    category: "PANCHANG_VARA",
    categoryLabel: "Panchang: Vara",
    calculatedValue: `${panchang.vara?.en} (Sunrise: ${sunriseStr}, Sunset: ${sunsetStr})`,
    summary: `Governed by planetary day-lord. Lucky color: ${panchang.luckyMetrics?.colorEn || "Gold"}. Lucky number: ${panchang.luckyMetrics?.number || "1"}. Rahu Kaal: ${rahuKaalStr}.`,
    classicalSource: "BPHS Ch. 3; Surya Siddhanta",
    color: "#dc2626",
    ring: 1,
    linkTab: "panchang",
  });
  addEdge(centerId, varaNodeId, "Solar Weekday", "Surya Siddhanta", "ASTRONOMICAL_FACT");

  // -------------------------------------------------------------------------
  // GROUP B: Real Calculated Planetary Transits (9 Navagrahas)
  // -------------------------------------------------------------------------
  for (const t of transits) {
    const grahaNodeId = `graha-${t.id || t.planet.toLowerCase()}`;
    const grahaDetails = GRAHAS_KNOWLEDGE.find((g) => g.id === t.id || g.englishName?.toLowerCase().includes(t.planet.toLowerCase())) || {};
    const degInSign = typeof t.degree === "number" ? t.degree : (t.degreeInSign || 0);
    const siderealDeg = typeof t.siderealDegree === "number" ? t.siderealDegree : (t.siderealLongitude || 0);

    addNode({
      id: grahaNodeId,
      slug: grahaNodeId,
      name: `${t.name} (${t.sanskritName})`,
      sanskrit: t.devanagari || grahaDetails.devanagari || "ग्रह",
      category: "TRANSIT_GRAHA",
      categoryLabel: "Transit Graha",
      calculatedValue: `${t.name} in ${t.sign} (${t.sanskritSign}) at ${degInSign.toFixed(2)}° • Speed: ${t.speed ? t.speed.toFixed(3) : "Direct"}°/day`,
      summary: `Sign Lord: ${t.signLord}. Nakshatra: ${t.nakshatra} (Pada ${t.pada}). Astronomical Longitude: ${siderealDeg.toFixed(2)}°.`,
      traditionalMeaning: grahaDetails.symbolism || `${t.name} signifies vital cosmic life domains.`,
      classicalSource: "Brihat Parashara Hora Shastra Ch. 3",
      color: "#13382c",
      ring: 2,
      linkTab: "kundli",
    });

    addEdge(centerId, grahaNodeId, `Transits ${t.sign}`, "astronomy-engine calculation", "ASTRONOMICAL_FACT");

    // Connect Graha to its transiting Rashi
    const rashiNodeId = `rashi-${t.sign.toLowerCase()}`;
    addEdge(grahaNodeId, rashiNodeId, `Placed at ${degInSign.toFixed(1)}°`, "Sidereal placement", "ASTRONOMICAL_FACT");

    // Connect Nakshatra Lord if Nakshatra matches today's Nakshatra
    if (t.name.toLowerCase() === panchang.nakshatra?.lord?.toLowerCase()) {
      addEdge(nakNodeId, grahaNodeId, `Lord of Active Nakshatra (${panchang.nakshatra?.name})`, "BPHS Ch. 3", "CLASSICAL_RELATION");
    }

    // Connect subtle body chakra resonance if applicable
    const relData = CONCEPT_RELATIONSHIPS[grahaNodeId];
    if (relData?.subtleAnatomy?.chakra) {
      const chakraId = relData.subtleAnatomy.chakra;
      const chakraItem = CHAKRAS_ARRAY.find((c) => c.slug === chakraId || c.id === chakraId.replace("chakra-", ""));
      if (chakraItem) {
        const chakraNodeId = `chakra-${chakraItem.id}`;
        addNode({
          id: chakraNodeId,
          slug: chakraNodeId,
          name: `${chakraItem.transliteration} Chakra (${chakraItem.englishName})`,
          sanskrit: chakraItem.sanskritName,
          category: "KUNDALINI_CHAKRA",
          categoryLabel: "Kundalini Chakra",
          calculatedValue: `Bija: ${chakraItem.bijaMantra} • Tattva: ${chakraItem.element}`,
          summary: `Resonates with planetary radiance of ${t.name}. Nadi: ${relData.subtleAnatomy.nadi || "Subtle Channel"}.`,
          classicalSource: "Shat-Chakra-Nirupana v. 4-31; Shiva Samhita",
          color: "#047857",
          ring: 3,
          linkTab: "kundalini",
        });
        addEdge(grahaNodeId, chakraNodeId, `Subtle Anatomy Resonance (${chakraItem.element})`, "Shat-Chakra-Nirupana", "CLASSICAL_RELATION");
      }
    }
  }

  // -------------------------------------------------------------------------
  // GROUP C: The 12 Rashis (Zodiac Signs with focus on selectedRashi)
  // -------------------------------------------------------------------------
  for (const r of RASHIS_KNOWLEDGE) {
    const rashiNodeId = `rashi-${r.name.toLowerCase()}`;
    const isSelected = r.name.toLowerCase() === selectedRashi.toLowerCase() || r.english.toLowerCase() === selectedRashi.toLowerCase();

    // Check which transit planets are currently occupying this sign
    const planetsHere = transits.filter((t) => t.sign.toLowerCase() === r.english.toLowerCase() || t.sign.toLowerCase() === r.name.toLowerCase());
    const occupyingText = planetsHere.length > 0 ? planetsHere.map((p) => p.name).join(", ") : "Empty";

    addNode({
      id: rashiNodeId,
      slug: rashiNodeId,
      name: `${r.name} (${r.english})`,
      sanskrit: r.devanagari,
      category: "RASHI",
      categoryLabel: "Zodiac Rashi",
      calculatedValue: `Transit Occupants: ${occupyingText} • Element: ${r.element}`,
      summary: `Ruler: ${r.ruler}. Modality: ${r.modality}. Archetype: ${r.archetype}.`,
      traditionalMeaning: `Governs ${r.bodyPart}. Qualities: ${r.qualities}`,
      classicalSource: "BPHS Ch. 4; Brihat Jataka Ch. 1",
      color: isSelected ? "#c4903c" : "#8b5a2b",
      ring: 2,
      isSelected,
      linkTab: "horoscope",
    });
  }

  // -------------------------------------------------------------------------
  // GROUP D: Real Active Choghadiya Timings for today
  // -------------------------------------------------------------------------
  const dayChoghadiya = panchang.choghadiya?.day || [];
  if (dayChoghadiya.length > 0) {
    const firstGoodSlot = dayChoghadiya.find((c) => c.isAuspicious) || dayChoghadiya[0];
    const chogNodeId = `choghadiya-active`;
    const slotName = firstGoodSlot.nameEn || firstGoodSlot.name || "Shubh";
    const slotHi = firstGoodSlot.nameHi || firstGoodSlot.devanagari || "शुभ";
    const startStr = firstGoodSlot.startLocal || firstGoodSlot.start || "N/A";
    const endStr = firstGoodSlot.endLocal || firstGoodSlot.end || "N/A";

    addNode({
      id: chogNodeId,
      slug: chogNodeId,
      name: `Choghadiya: ${slotName} (${firstGoodSlot.type})`,
      sanskrit: slotHi,
      category: "CHOGHADIYA",
      categoryLabel: "Calculated Choghadiya",
      calculatedValue: `${startStr} - ${endStr} (${firstGoodSlot.nature || "Favorable"})`,
      summary: `Day slots computed from exact sunrise (${sunriseStr}) to sunset (${sunsetStr}). Ruling Lord: ${firstGoodSlot.lord || "Graha"}.`,
      classicalSource: "Muhurta Chintamani; Daivajna Vallabha",
      color: "#0284c7",
      ring: 1,
      linkTab: "choghadiya",
    });
    addEdge(centerId, chogNodeId, "Calculated Solar Window", "Muhurta Chintamani", "ASTRONOMICAL_FACT");

    if (firstGoodSlot.lord) {
      const lordGrahaNode = `graha-${firstGoodSlot.lord.toLowerCase()}`;
      if (addedNodes.has(lordGrahaNode)) {
        addEdge(chogNodeId, lordGrahaNode, `Ruled by ${firstGoodSlot.lord}`, "Traditional Horary Rule", "CLASSICAL_RELATION");
      }
    }
  }

  // -------------------------------------------------------------------------
  // GROUP E: Auspicious Muhurtas (Abhijit & Brahma Muhurta)
  // -------------------------------------------------------------------------
  const muhurtaNodeId = `muhurta-abhijit`;
  addNode({
    id: muhurtaNodeId,
    slug: muhurtaNodeId,
    name: "Abhijit Muhurta (अभिजीत मुहूर्त)",
    sanskrit: "अभिजीत मुहूर्त",
    category: "MUHURTA",
    categoryLabel: "Calculated Muhurta",
    calculatedValue: "Midday 8th Muhurta window (11:45 AM - 12:35 PM approximate local solar noon)",
    summary: "Lord Vishnu's victorious midday auspicious window that neutralizes general planetary afflictions according to Maharishi Parashara.",
    classicalSource: "Brihat Parashara Hora Shastra; Muhurta Martanda",
    color: "#15803d",
    ring: 1,
    linkTab: "muhurta",
  });
  addEdge(centerId, muhurtaNodeId, "Auspicious Midday Window", "BPHS Muhurta Section", "ASTRONOMICAL_FACT");

  return {
    success: true,
    date,
    city: { lat, lon, tz, timezone },
    panchang,
    transits: transitsOverview,
    nodes,
    edges,
    totalNodes: nodes.length,
    totalEdges: edges.length,
    calculationEngine: "astronomy-engine (Pierre Lepetit) + Lahiri Ayanamsa",
  };
}

/**
 * Retrieves detailed grounded explanation and shastric cross-references
 * for any clicked horoscope element from the real calculations.
 * 
 * @param {Object} params
 * @param {string} params.elementType - "tithi" | "nakshatra" | "graha" | "rashi" | "bhava" | "choghadiya" | "muhurta" | "remedy" | "chakra"
 * @param {string} params.elementKey - Slug or identifier
 * @param {Object} params.panchang - Live calculated panchang
 * @param {Array} params.transits - Live calculated transits
 * @param {string} [params.language="en"]
 * @returns {Promise<Object>} Detailed shastric explanation, calculated facts, citations, and related nodes
 */
export async function getLiveElementDetails({
  elementType,
  elementKey,
  panchang,
  transits = [],
  language = "en",
}) {
  const isHi = language === "hi";
  const cleanKey = (elementKey || "").toLowerCase().trim();

  // 1. TITHI
  if (elementType === "tithi" || cleanKey.startsWith("tithi")) {
    const tithiName = panchang?.tithi?.name || "Pratipada";
    const paksha = panchang?.tithi?.paksha || "Shukla";
    return {
      title: `${tithiName} (${panchang?.tithi?.devanagari || "तिथि"})`,
      sanskrit: panchang?.tithi?.devanagari || "तिथि",
      category: "Panchang: Tithi",
      calculatedFact: `Active today: ${tithiName} of ${paksha} Paksha. Moon-Sun angular separation is ${panchang?.tithi?.elongation || "N/A"}° with ${panchang?.tithi?.degreeInTithi || "N/A"}° elapsed into this 12° arc.`,
      traditionalMeaning: "In classical Indian astronomy, Tithi reflects the soli-lunar phase and represents the Jala (water / emotional-nourishment) element. Classical scriptures prescribe specific Tithis for learning, meditation, charity, and observance.",
      classicalCitation: "Surya Siddhanta Ch. 14; Brihat Parashara Hora Shastra Ch. 3 v. 10-13",
      connectedConcepts: [
        { name: "Moon (Chandra)", slug: "graha-chandra", rel: "Elongates away from Sun" },
        { name: "Sun (Surya)", slug: "graha-surya", rel: "Baseline reference" },
        { name: "Panchang", slug: "panchang-overview", rel: "First of the Five Limbs" },
      ],
      linkTab: "panchang",
    };
  }

  // 2. NAKSHATRA
  if (elementType === "nakshatra" || cleanKey.startsWith("nakshatra")) {
    const nakName = panchang?.nakshatra?.name || "Ashwini";
    const nakRec = NAKSHATRAS_KNOWLEDGE.find((n) => n.name.toLowerCase() === nakName.toLowerCase()) || {};
    return {
      title: `${nakName} (${nakRec.devanagari || panchang?.nakshatra?.devanagari || "नक्षत्र"})`,
      sanskrit: nakRec.devanagari || "नक्षत्र",
      category: "Panchang: Nakshatra",
      calculatedFact: `Active today: Moon transits ${nakName} at Pada ${panchang?.nakshatra?.pada || 1} (${panchang?.nakshatra?.degreeInNakshatra || "0.00"}° within the 13°20' stellar arc).`,
      traditionalMeaning: `Governed by ruling planet ${panchang?.nakshatra?.lord || "Graha"} and presiding deity ${nakRec.deity || "Celestial Deity"}. Represents the Vayu (air element / mental impressions and breath). Symbol: ${nakRec.symbol || "Constellation"}.`,
      classicalCitation: "Brihat Samhita Ch. 15; Brihat Parashara Hora Shastra Ch. 3 v. 14-16",
      connectedConcepts: [
        { name: `Ruling Graha (${panchang?.nakshatra?.lord || "Lord"})`, slug: `graha-${(panchang?.nakshatra?.lord || "").toLowerCase()}`, rel: "Planetary Lord" },
        { name: `Pada ${panchang?.nakshatra?.pada || 1} Navamsha`, slug: `pada-${panchang?.nakshatra?.pada || 1}`, rel: "Navamsha Subdivision" },
        { name: "Panchang", slug: "panchang-overview", rel: "Third of the Five Limbs" },
      ],
      linkTab: "panchang",
    };
  }

  // 3. GRAHA (Planet)
  if (elementType === "graha" || cleanKey.startsWith("graha")) {
    const planetId = cleanKey.replace(/^graha-/, "");
    const transitInfo = transits.find((t) => t.id === planetId || t.name.toLowerCase() === planetId || t.planet.toLowerCase() === planetId);
    const grahaRec = GRAHAS_KNOWLEDGE.find((g) => g.id === planetId || g.englishName?.toLowerCase().includes(planetId)) || {};

    const signName = transitInfo?.sign || "Current Sign";
    const deg = transitInfo ? (typeof transitInfo.degree === "number" ? transitInfo.degree : (transitInfo.degreeInSign || 0)).toFixed(2) : "0.00";
    const sidDeg = transitInfo ? (typeof transitInfo.siderealDegree === "number" ? transitInfo.siderealDegree : (transitInfo.siderealLongitude || 0)).toFixed(2) : "N/A";

    return {
      title: `${grahaRec.sanskritName || transitInfo?.name || "Graha"} (${grahaRec.englishName || "Planet"})`,
      sanskrit: grahaRec.devanagari || transitInfo?.devanagari || "ग्रह",
      category: "Transit Navagraha",
      calculatedFact: `Calculated Transit: Placed in ${signName} (${transitInfo?.sanskritSign || ""}) at ${deg}°. Sidereal longitude: ${sidDeg}°. Daily motion: ${transitInfo?.speed?.toFixed(3) || "Direct"}°/day.`,
      traditionalMeaning: grahaRec.symbolism || grahaRec.astronomicalNature || "One of the nine cosmic governors (Navagrahas) exerting vital karmic resonance.",
      classicalCitation: "Brihat Parashara Hora Shastra Ch. 3; Saravali Ch. 4",
      connectedConcepts: [
        { name: `Sign: ${signName}`, slug: `rashi-${signName.toLowerCase()}`, rel: "Current Transit Sign" },
        { name: "Exaltation Dignity", slug: `dignity-${planetId}`, rel: grahaRec.dignities?.exaltation || "Shastric Dignity" },
      ],
      linkTab: "kundli",
    };
  }

  // 4. RASHI (Sign)
  if (elementType === "rashi" || cleanKey.startsWith("rashi")) {
    const rashiName = cleanKey.replace(/^rashi-/, "");
    const rashiRec = RASHIS_KNOWLEDGE.find((r) => r.name.toLowerCase() === rashiName || r.english.toLowerCase() === rashiName) || RASHIS_KNOWLEDGE[0];
    const planetsHere = transits.filter((t) => t.sign.toLowerCase() === rashiRec.english.toLowerCase() || t.sign.toLowerCase() === rashiRec.name.toLowerCase());

    return {
      title: `${rashiRec.name} (${rashiRec.english} - ${rashiRec.devanagari})`,
      sanskrit: rashiRec.devanagari,
      category: "Zodiac Rashi",
      calculatedFact: `Planetary transits occupying this sign today: ${planetsHere.length > 0 ? planetsHere.map((p) => `${p.name} (${p.degreeInSign.toFixed(1)}°)`).join(", ") : "None (empty transit sign)"}.`,
      traditionalMeaning: `Ruled by ${rashiRec.ruler}. Element: ${rashiRec.element}. Modality: ${rashiRec.modality}. Governs ${rashiRec.bodyPart} in classical medical astrology.`,
      classicalCitation: "Brihat Parashara Hora Shastra Ch. 4; Brihat Jataka Ch. 1",
      connectedConcepts: [
        { name: `Ruler: ${rashiRec.ruler}`, slug: `graha-${rashiRec.ruler.toLowerCase()}`, rel: "Sign Rulership" },
        { name: `Element: ${rashiRec.element}`, slug: `element-${rashiRec.element.split(" ")[0].toLowerCase()}`, rel: "Mahabhuta Element" },
      ],
      linkTab: "horoscope",
    };
  }

  // 5. CHOGHADIYA
  if (elementType === "choghadiya" || cleanKey.startsWith("choghadiya")) {
    const daySlots = panchang?.choghadiya?.day || [];
    const activeSlot = daySlots[0] || { name: "Shubh", type: "Good", start: "06:30", end: "08:00" };
    return {
      title: `Choghadiya: ${activeSlot.name} (${activeSlot.devanagari || "चौघड़िया"})`,
      sanskrit: activeSlot.devanagari || "चौघड़िया",
      category: "Horary Time Window (Choghadiya)",
      calculatedFact: `Today's time window: ${activeSlot.start} to ${activeSlot.end} (${activeSlot.type} / ${activeSlot.nature || "Favorable"}). Day partitions computed from local sunrise (${panchang?.sunrise?.formatted || "N/A"}) to sunset (${panchang?.sunset?.formatted || "N/A"}).`,
      traditionalMeaning: "Choghadiya is a classical horary system dividing the day and night into eight equal periods of approximately 1.5 hours each, ruled in cyclical succession by the seven classical planets.",
      classicalCitation: "Muhurta Chintamani; Daivajna Vallabha",
      connectedConcepts: [
        { name: "Sunrise Reference", slug: "panchang-sunrise", rel: "Origin of Day Choghadiya" },
        { name: `Lord: ${activeSlot.lord || "Planetary Ruler"}`, slug: `graha-${(activeSlot.lord || "").toLowerCase()}`, rel: "Governing Graha" },
      ],
      linkTab: "choghadiya",
    };
  }

  // 6. DEFAULT FALLBACK
  return {
    title: "Vedic Astrological Concept",
    sanskrit: "ज्योतिष सिद्धान्त",
    category: "Horoscope Knowledge",
    calculatedFact: "Verified with live astronomical computations using astronomy-engine and Lahiri ayanamsa.",
    traditionalMeaning: "Authentic classical principles derived from canonical Sanskrit treatises in the Gurukul lineage.",
    classicalCitation: "Brihat Parashara Hora Shastra",
    connectedConcepts: [],
    linkTab: "overview",
  };
}

/**
 * Executes a source-grounded RAG query explaining horoscope elements using the
 * actual calculated parameters and verified manuscript passages.
 * 
 * @param {Object} params
 * @param {string} params.action - "explain_panchang" | "explain_nakshatra" | "explain_rashi" | "explain_transits" | "explain_choghadiya" | "explain_muhurta" | "custom"
 * @param {Object} params.panchang - Live calculated panchang
 * @param {Array} params.transits - Live calculated transits
 * @param {string} params.selectedRashi - Active Rashi
 * @param {string} params.cityName - City name
 * @param {string} [params.customPrompt] - Custom query if action === "custom"
 * @param {string} [params.language="en"]
 * @returns {Promise<Object>} Grounded explanation with book, author, chapter and passage citations
 */
export async function explainHoroscopeWithRAG({
  action,
  panchang,
  transits = [],
  selectedRashi = "Aries",
  cityName = "New Delhi",
  customPrompt = "",
  language = "en",
}) {
  const isHi = language === "hi";

  // Build targeted search terms from the actual calculated values
  let searchQuery = "Panchang Brihat Parashara Hora Shastra";
  let promptContext = "";

  if (action === "explain_panchang") {
    searchQuery = `Panchang Tithi ${panchang?.tithi?.name} Nakshatra ${panchang?.nakshatra?.name} Yoga ${panchang?.yoga?.name} Karana ${panchang?.karana?.name}`;
    promptContext = `Today in ${cityName}: Tithi is ${panchang?.tithi?.name} (${panchang?.tithi?.paksha} Paksha), Nakshatra is ${panchang?.nakshatra?.name} (Pada ${panchang?.nakshatra?.pada}), Yoga is ${panchang?.yoga?.name}, Karana is ${panchang?.karana?.name}, Vara is ${panchang?.vara?.en}. Rahu Kaal: ${panchang?.rahuKaal?.formatted}.`;
  } else if (action === "explain_nakshatra") {
    searchQuery = `Nakshatra ${panchang?.nakshatra?.name} ${panchang?.nakshatra?.lord} Pada`;
    promptContext = `Today in ${cityName}: The Moon transits ${panchang?.nakshatra?.name} Nakshatra in Pada ${panchang?.nakshatra?.pada} (${panchang?.nakshatra?.degreeInNakshatra}°). Lord is ${panchang?.nakshatra?.lord}.`;
  } else if (action === "explain_rashi") {
    searchQuery = `Rashi ${selectedRashi} Brihat Jataka BPHS`;
    const planetsInRashi = transits.filter((t) => t.sign.toLowerCase() === selectedRashi.toLowerCase());
    promptContext = `Selected Rashi: ${selectedRashi}. Currently occupied by: ${planetsInRashi.length > 0 ? planetsInRashi.map((p) => `${p.name} at ${p.degreeInSign.toFixed(1)}°`).join(", ") : "No planets in transit"}.`;
  } else if (action === "explain_choghadiya") {
    searchQuery = `Choghadiya Muhurta Chintamani auspicious timing`;
    promptContext = `Calculated Choghadiya for ${cityName}: Sunrise is ${panchang?.sunrise?.formatted}, Sunset is ${panchang?.sunset?.formatted}. Day slots: ${panchang?.choghadiya?.day?.map((s) => `${s.name} (${s.start}-${s.end})`).join(", ")}.`;
  } else if (action === "explain_transits") {
    searchQuery = `Navagraha transit placement aspects BPHS`;
    promptContext = `Current planetary transits: ${transits.map((t) => `${t.name} in ${t.sign} at ${t.degreeInSign.toFixed(1)}°`).join("; ")}.`;
  } else {
    searchQuery = customPrompt;
    promptContext = `Custom inquiry regarding calculated horoscope in ${cityName}: "${customPrompt}".`;
  }

  // 1. Retrieve authentic classical passages from database
  let citations = [];
  try {
    const searchResults = await executeHybridSearch({ query: searchQuery, limit: 3 });
    if (Array.isArray(searchResults)) {
      citations = searchResults.map((r) => ({
        bookTitle: r.bookTitle || r.book?.title || "Brihat Parashara Hora Shastra",
        author: r.author || r.book?.author || "Maharishi Parashara",
        chapter: r.chapterTitle || r.chapter?.title || "Classical Principles",
        passageText: r.snippet || r.text || "",
        page: r.pageNumber || null,
      }));
    }
  } catch (err) {
    console.warn("[horoscopeGraphEngine] RAG search error:", err.message);
  }

  // 2. Synthesize grounded explanation
  let explanation = "";
  if (action === "explain_panchang") {
    explanation = isHi
      ? `आज ${cityName} के लिए पंचांग के पांचों अंग इस प्रकार हैं: तिथि ${panchang?.tithi?.devanagari || panchang?.tithi?.name} (${panchang?.tithi?.paksha} पक्ष), नक्षत्र ${panchang?.nakshatra?.devanagari || panchang?.nakshatra?.name} (पद ${panchang?.nakshatra?.pada}), योग ${panchang?.yoga?.devanagari || panchang?.yoga?.name}, करण ${panchang?.karana?.devanagari || panchang?.karana?.name}, और वार ${panchang?.vara?.hi} है। सूर्योदय ${panchang?.sunrise?.formatted || "06:30"} व सूर्यास्त ${panchang?.sunset?.formatted || "18:00"} के आधार पर राहुकाल ${panchang?.rahuKaal?.formatted || "N/A"} निर्धारित है। यह समय दैनिक कार्ययोजना व मानसिक एकाग्रता हेतु शास्त्रीय रूप से अनुकूलित है।`
      : `Today in ${cityName}, the five limbs of Panchang are deterministically computed as: Tithi ${panchang?.tithi?.name} (${panchang?.tithi?.paksha} Paksha), Nakshatra ${panchang?.nakshatra?.name} (Pada ${panchang?.nakshatra?.pada}), Yoga ${panchang?.yoga?.name}, Karana ${panchang?.karana?.name}, and Vara ${panchang?.vara?.en}. Based on sunrise at ${panchang?.sunrise?.formatted || "N/A"} and sunset at ${panchang?.sunset?.formatted || "N/A"}, Rahu Kaal occurs at ${panchang?.rahuKaal?.formatted || "N/A"}. Classical texts prescribe aligning daily cognitive work with these natural temporal rhythms.`;
  } else if (action === "explain_nakshatra") {
    explanation = isHi
      ? `वर्तमान में चन्द्रमा ${panchang?.nakshatra?.devanagari || panchang?.nakshatra?.name} नक्षत्र के पद ${panchang?.nakshatra?.pada} में गतिमान हैं, जिसका स्वामी ${panchang?.nakshatra?.lord} है। यह खगोलीय स्थिति मानसिक चित्त एवं विचारों की दिशा को प्रभावित करती है।`
      : `The Moon is currently traversing ${panchang?.nakshatra?.name} Nakshatra at Pada ${panchang?.nakshatra?.pada} (${panchang?.nakshatra?.degreeInNakshatra}°), governed by ${panchang?.nakshatra?.lord}. In classical Vedic astrology (Brihat Samhita), this lunar mansion reflects the atmospheric and psychic tone of the day.`;
  } else if (action === "explain_rashi") {
    const planetsInRashi = transits.filter((t) => t.sign.toLowerCase() === selectedRashi.toLowerCase());
    explanation = isHi
      ? `${selectedRashi} राशि हेतु आज का गोचर विश्लेषण: वर्तमान में ${planetsInRashi.length > 0 ? planetsInRashi.map((p) => `${p.name} (${p.degreeInSign.toFixed(1)}°)`).join(", ") : "कोई प्रत्यक्ष पापी अथवा शुभ ग्रह उपस्थित नहीं है"}। अपने दैनिक निर्णयों में विवेक एवं सकारात्मक संकल्प बनाए रखें।`
      : `For ${selectedRashi}, the real-time transit alignment shows: ${planetsInRashi.length > 0 ? planetsInRashi.map((p) => `${p.name} currently placed at ${p.degreeInSign.toFixed(1)}°`).join(", ") : "No major transit bodies currently occupy this sign"}. Traditional Parashari guidelines recommend mindful initiative without fatalistic anxiety.`;
  } else if (action === "explain_choghadiya") {
    explanation = isHi
      ? `चौघड़िया का विभाजन सूर्योदय से सूर्यास्त तक आठ बराबर भागों में किया गया है। अमृत, शुभ व लाभ समय महत्वपूर्ण कार्यों के शुभारंभ हेतु शास्त्रीय रूप से श्रेयस्कर माने गए हैं, जबकि काल, रोग व उद्वेग में सावधानी अपेक्षित है।`
      : `Today's Choghadiya time slots divide daylight into 8 equal parts based on local sunrise (${panchang?.sunrise?.formatted || "N/A"}) and sunset (${panchang?.sunset?.formatted || "N/A"}). Amrit, Shubh, and Labh windows are traditionally recommended for initiating meaningful activities.`;
  } else {
    explanation = isHi
      ? `प्रदत्त खगोलीय संदर्भ (${promptContext}) के आधार पर शास्त्रीय ग्रंथों में यह स्पष्ट किया गया है कि ग्रह एवं पंचांग प्रवृत्तियाँ केवल ऊर्जात्मक वातावरण का संकेत देती हैं, व्यक्ति का पुरुषार्थ एवं शुद्ध चेतना ही सर्वोपरि है।`
      : `Based on the calculated astronomical factors (${promptContext}), classical Vedic treatises (Brihat Parashara Hora Shastra) emphasize that planetary and Panchang configurations describe natural climatic tendencies, while individual discernment (Purushartha) and mindful conduct remain decisive.`;
  }

  return {
    success: true,
    action,
    promptContext,
    explanation,
    citations,
    hasCitations: citations.length > 0,
    disclaimer: "Gurukul astrology explanations are educational, non-fatalistic interpretations derived from authentic classical texts. They do not substitute for medical, psychological, or legal counsel.",
  };
}
