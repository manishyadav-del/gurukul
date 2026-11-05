"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Sparkles,
  BookOpen,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Compass,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Layers,
  ShieldCheck,
  Sun,
  Moon,
  Flame,
  Wind,
  Droplets,
  Heart,
  Eye,
  Crown,
  Zap,
  Send,
  MessageSquare,
  AlertCircle,
  BookmarkCheck,
  Check,
  Star,
  Filter,
  Info,
  User,
  HelpCircle,
  Lock,
  ChevronDown,
  ChevronUp,
  Network,
} from "lucide-react";

import InteractiveKnowledgeGraph from "@/components/explorer/InteractiveKnowledgeGraph";
import NorthIndianChart from "@/components/astrology/NorthIndianChart";
import { CHAKRAS_ARRAY } from "@/server/spirituality/chakraKnowledge.js";
import { BHAVAS_KNOWLEDGE } from "@/server/astrology/bhavasKnowledge.js";
import { GRAHAS_KNOWLEDGE } from "@/server/astrology/grahasKnowledge.js";
import {
  RASHIS_KNOWLEDGE,
  NAKSHATRAS_KNOWLEDGE,
  PANCHANG_KNOWLEDGE,
} from "@/server/astrology/rashisNakshatrasKnowledge.js";
import {
  CONCEPT_RELATIONSHIPS,
  getRelatedConcepts,
} from "@/server/astrology/conceptRelationships.js";

// Standard reference birth chart for educational exploration
const DEFAULT_EDUCATIONAL_CHART = {
  ascendant: {
    sign: { number: 1, name: "Aries", sanskrit: "Mesha" },
    degree: 15.2,
    nakshatra: "Bharani",
    pada: 1,
  },
  houses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => ({ number: n })),
  planets: [
    { planet: "Sun", house: 10, degree: 10.4, sign: "Capricorn", nakshatra: "Shravana", pada: 1 },
    { planet: "Moon", house: 4, degree: 18.5, sign: "Cancer", nakshatra: "Pushya", pada: 2 },
    { planet: "Mars", house: 1, degree: 12.1, sign: "Aries", nakshatra: "Ashwini", pada: 4 },
    { planet: "Mercury", house: 11, degree: 22.8, sign: "Aquarius", nakshatra: "Purva Bhadrapada", pada: 1 },
    { planet: "Jupiter", house: 9, degree: 16.3, sign: "Sagittarius", nakshatra: "Purva Ashadha", pada: 1 },
    { planet: "Venus", house: 12, degree: 27.9, sign: "Pisces", nakshatra: "Revati", pada: 4 },
    { planet: "Saturn", house: 11, degree: 8.4, sign: "Aquarius", nakshatra: "Shatabhisha", pada: 1 },
    { planet: "Rahu", house: 2, degree: 4.2, sign: "Taurus", nakshatra: "Krittika", pada: 3 },
    { planet: "Ketu", house: 8, degree: 4.2, sign: "Scorpio", nakshatra: "Anuradha", pada: 1 },
  ],
};

// Normalize raw entities into a unified Concept Object
function normalizeEntities() {
  const list = [];

  // 1. Chakras (7)
  CHAKRAS_ARRAY.forEach((c) => {
    list.push({
      key: `chakra-${c.id}`,
      id: c.slug || c.id,
      category: "chakras",
      categoryLabel: "Kundalini Chakra",
      name: `${c.sanskritName} (${c.englishName})`,
      sanskrit: c.sanskritName,
      transliteration: c.transliteration,
      summary: c.meaning || c.introduction?.coreConcept || "",
      element: c.element || "",
      bija: c.bijaMantra || "",
      petals: c.petalsCount || 0,
      deity: c.deityTraditional || "",
      location: c.locationTraditional || "",
      classicalVerse: c.philosophy?.classicalQuote || (c.sources && c.sources[0]?.citation) || "",
      classicalSource: (c.sources && c.sources[0]?.text) || "Shat-Chakra-Nirupana",
      modernMisconceptions: Array.isArray(c.philosophy?.avoidingMisconceptions)
        ? c.philosophy.avoidingMisconceptions.join(" ")
        : c.philosophy?.avoidingMisconceptions || "",
      everydayIntegration: Array.isArray(c.everydayExamples)
        ? c.everydayExamples.map((e) => e.scenario).join("; ")
        : "",
      subtleAnatomy: {
        nadi: c.granthisAssociated || "",
        granthi: c.granthisAssociated || "",
      },
    });
  });

  // 2. Grahas (9)
  GRAHAS_KNOWLEDGE.forEach((g) => {
    list.push({
      key: `graha-${g.id}`,
      id: g.id,
      category: "grahas",
      categoryLabel: "Navagraha",
      name: `${g.englishName || g.sanskritName} (${g.sanskritName})`,
      sanskrit: g.devanagari || "",
      transliteration: g.sanskritName,
      summary: g.symbolism || g.astronomicalNature || "",
      element: g.element || "",
      nature: g.nature || "",
      ownSigns: g.dignities?.ownSign || "",
      exaltedIn: g.dignities?.exaltation || "",
      debilitatedIn: g.dignities?.debilitation || "",
      karakaFor: Array.isArray(g.coreSignifications) ? g.coreSignifications.join("; ") : "",
      classicalVerse: g.classicalCitations || "",
      classicalSource: g.classicalCitations || "Brihat Parashara Hora Shastra",
      modernMisconceptions: Array.isArray(g.commonMisconceptions)
        ? g.commonMisconceptions.join(" ")
        : "",
      yogicResonance: g.yogicResonance || "",
    });
  });

  // 3. Bhavas (12)
  BHAVAS_KNOWLEDGE.forEach((b) => {
    list.push({
      key: `bhava-${b.number}`,
      id: `bhava-${b.number}`,
      category: "bhavas",
      categoryLabel: "Vedic Bhava (House)",
      name: `Bhava ${b.number}: ${b.sanskritName} (${b.englishName})`,
      sanskrit: b.sanskritName,
      transliteration: b.sanskritName,
      summary: b.coreSignification,
      houseNumber: b.number,
      houseType: b.classification,
      karaka: b.naturalKaraka,
      primaryThemes: b.keySignifications,
      classicalVerse: b.classicalReference,
      classicalSource: "Brihat Parashara Hora Shastra (Bhava Adhyaya)",
      modernMisconceptions: Array.isArray(b.modernMisconceptions)
        ? b.modernMisconceptions.join(" ")
        : b.modernMisconceptions,
      bodyPart: b.bodyParts,
    });
  });

  // 4. Rashis (12)
  RASHIS_KNOWLEDGE.forEach((r) => {
    const rawKey = r.name || `rashi-${r.number}`;
    list.push({
      key: `rashi-${rawKey.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      id: `rashi-${r.number}`,
      category: "rashis",
      categoryLabel: "Rashi (Zodiac Sign)",
      name: `${r.english || r.name} (${r.name})`,
      sanskrit: r.devanagari || "",
      transliteration: r.name,
      summary: r.archetype ? `${r.archetype}. ${r.qualities || ""}` : r.nature,
      element: r.element,
      rulingPlanet: r.ruler || r.rulingPlanet,
      modality: r.modality,
      bodyPart: r.bodyPart,
      classicalSource: "Brihat Parashara Hora Shastra",
      primaryThemes: r.qualities || r.keywords,
      symbol: r.symbol,
    });
  });

  // 5. Nakshatras (27)
  NAKSHATRAS_KNOWLEDGE.forEach((n) => {
    const rawKey = n.name || `nakshatra-${n.number}`;
    list.push({
      key: `nakshatra-${rawKey.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      id: `nakshatra-${n.number}`,
      category: "nakshatras",
      categoryLabel: "27 Nakshatras",
      name: `${n.name} (${n.devanagari || ""})`,
      sanskrit: n.devanagari || "",
      transliteration: n.name,
      summary: n.primaryQualities || n.coreMeaning,
      rulingPlanet: n.rulingPlanet,
      deity: n.deity,
      symbol: n.symbol,
      rashiSpan: n.span || n.degrees,
      guna: n.guna || "",
      padas: n.padas,
      classicalSource: "Brihat Samhita / Taittiriya Brahmana",
    });
  });

  // 6. Panchang (5 Limbs)
  const panchangLimbs = Array.isArray(PANCHANG_KNOWLEDGE)
    ? PANCHANG_KNOWLEDGE
    : PANCHANG_KNOWLEDGE.limbs || [];
  panchangLimbs.forEach((p, idx) => {
    const rawName = p.limb || p.name || `Limb ${idx + 1}`;
    list.push({
      key: `panchang-${rawName.toLowerCase().split(" ")[0].replace(/[^a-z0-9]+/g, "")}`,
      id: `panchang-${idx + 1}`,
      category: "panchang",
      categoryLabel: "Panchang Anga",
      name: rawName,
      sanskrit: p.sanskrit || "",
      transliteration: rawName,
      summary: p.significance || p.governs || p.elementAssociation,
      element: p.elementAssociation || p.element,
      calculation: p.calculationMethod || p.calculation,
      significance: p.significance,
      classicalSource: "Muhurta Chintamani / Surya Siddhanta",
    });
  });

  return list;
}

const ALL_CONCEPTS = normalizeEntities();

export default function KnowledgeExplorerClient() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConceptKey, setSelectedConceptKey] = useState("chakra-manipura");
  const [activeTab, setActiveTab] = useState("concept"); // "concept" | "chart" | "ai"

  // User persistence state
  const [user, setUser] = useState(null);
  const [savedConcepts, setSavedConcepts] = useState({});
  const [completedMap, setCompletedMap] = useState({});
  const [userNote, setUserNote] = useState("");
  const [noteStatus, setNoteStatus] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Chart state
  const [chart, setChart] = useState(DEFAULT_EDUCATIONAL_CHART);
  const [chartSource, setChartSource] = useState("standard"); // "standard" | "user"
  const [chartSelectionMsg, setChartSelectionMsg] = useState("");

  // AI Knowledge Assistant state
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);

  const noteTimeoutRef = useRef(null);

  // 1. Initial Authentication & User Data Load
  useEffect(() => {
    async function loadUserData() {
      try {
        const meRes = await fetch("/api/auth/me");
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.authenticated && meData.user) {
            setUser(meData.user);

            // Fetch saved concepts & notes
            const conceptsRes = await fetch("/api/learning/concepts");
            if (conceptsRes.ok) {
              const cJson = await conceptsRes.json();
              if (cJson.concepts) {
                const map = {};
                cJson.concepts.forEach((sc) => {
                  map[sc.conceptKey] = sc;
                });
                setSavedConcepts(map);
              }
            }

            // Fetch user kundalini/learning progress
            const progRes = await fetch("/api/learning/progress");
            if (progRes.ok) {
              const pJson = await progRes.json();
              const cMap = {};
              if (pJson.kundaliniProgress) {
                pJson.kundaliniProgress.forEach((kp) => {
                  if (kp.module?.chakraAssociation) {
                    cMap[kp.module.chakraAssociation] = true;
                  }
                });
              }
              setCompletedMap(cMap);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user learning profile:", err);
      }
    }
    loadUserData();
  }, []);

  // Find currently active concept object
  const currentConcept = useMemo(() => {
    const found = ALL_CONCEPTS.find((c) => c.key === selectedConceptKey);
    return found || ALL_CONCEPTS[0];
  }, [selectedConceptKey]);

  // Sync user note when concept changes
  useEffect(() => {
    if (savedConcepts[currentConcept.key]?.notes) {
      setUserNote(savedConcepts[currentConcept.key].notes);
    } else {
      setUserNote("");
    }
    setNoteStatus("");
  }, [currentConcept.key, savedConcepts]);

  // Log recently viewed topic to learning engine
  useEffect(() => {
    if (user && currentConcept) {
      fetch("/api/learning/recent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicKey: currentConcept.key,
          title: currentConcept.name,
          category: currentConcept.category?.toUpperCase() || "ASTROLOGY",
          url: `/explore?category=${currentConcept.category || "all"}`,
        }),
      }).catch(() => {});
    }
  }, [currentConcept?.key, user]);

  // Compute related concepts dynamically from ontology
  const relatedNodes = useMemo(() => {
    return getRelatedConcepts(currentConcept.key);
  }, [currentConcept.key]);

  // Filter concepts list based on category and multilingual search query
  const filteredConcepts = useMemo(() => {
    return ALL_CONCEPTS.filter((item) => {
      // Category check
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      // Search check across all language representations
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSanskrit = (item.sanskrit || "").toLowerCase().includes(q);
        const matchesTranslit = (item.transliteration || "").toLowerCase().includes(q);
        const matchesSummary = (item.summary || "").toLowerCase().includes(q);
        const matchesElement = (item.element || "").toLowerCase().includes(q);
        return matchesName || matchesSanskrit || matchesTranslit || matchesSummary || matchesElement;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  // Handle saving personal study note
  async function handleSaveNote() {
    if (!user) {
      setNoteStatus("Please log in to save notes.");
      return;
    }
    setSavingNote(true);
    setNoteStatus("");
    try {
      const res = await fetch("/api/learning/concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conceptKey: currentConcept.key,
          term: currentConcept.name,
          sanskritTerm: currentConcept.sanskrit,
          category: currentConcept.category,
          meaning: currentConcept.summary,
          notes: userNote,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSavedConcepts((prev) => ({
          ...prev,
          [currentConcept.key]: {
            ...prev[currentConcept.key],
            notes: userNote,
            conceptKey: currentConcept.key,
          },
        }));
        setNoteStatus("✓ Note saved securely!");
        if (noteTimeoutRef.current) clearTimeout(noteTimeoutRef.current);
        noteTimeoutRef.current = setTimeout(() => setNoteStatus(""), 3500);
      } else {
        setNoteStatus("Failed to save note: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      setNoteStatus("Network error while saving note.");
    } finally {
      setSavingNote(false);
    }
  }

  // Handle bookmarking toggle
  async function handleToggleBookmark() {
    const isCurrentlyBookmarked = Boolean(savedConcepts[currentConcept.key]);
    if (!user) {
      setNoteStatus("Please log in to bookmark concepts.");
      return;
    }

    try {
      if (isCurrentlyBookmarked) {
        const res = await fetch(`/api/learning/concepts?conceptKey=${currentConcept.key}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setSavedConcepts((prev) => {
            const next = { ...prev };
            delete next[currentConcept.key];
            return next;
          });
        }
      } else {
        const res = await fetch("/api/learning/concepts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conceptKey: currentConcept.key,
            term: currentConcept.name,
            sanskritTerm: currentConcept.sanskrit,
            category: currentConcept.category,
            meaning: currentConcept.summary,
            notes: userNote || "",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setSavedConcepts((prev) => ({
            ...prev,
            [currentConcept.key]: data.concept,
          }));
        }
      }
    } catch (err) {
      console.error("Bookmark toggle error:", err);
    }
  }

  // Handle Mark Completed toggle
  async function handleToggleCompletion() {
    const isCompleted = Boolean(completedMap[currentConcept.key]);
    setCompletedMap((prev) => ({
      ...prev,
      [currentConcept.key]: !isCompleted,
    }));
  }

  // Handle Chart House Click
  function handleHouseClick(houseNum) {
    const targetKey = `bhava-${houseNum}`;
    setSelectedConceptKey(targetKey);
    setSelectedCategory("bhavas");
    setActiveTab("concept");
    setChartSelectionMsg(`Selected Bhava ${houseNum} from Kundli Chart`);
  }

  // Handle Chart Planet Click
  function handlePlanetClick(planetName) {
    const planetMap = {
      Sun: "graha-surya",
      Moon: "graha-chandra",
      Mars: "graha-mangala",
      Mercury: "graha-budha",
      Jupiter: "graha-guru",
      Venus: "graha-shukra",
      Saturn: "graha-shani",
      Rahu: "graha-rahu",
      Ketu: "graha-ketu",
    };
    const targetKey = planetMap[planetName] || "graha-surya";
    setSelectedConceptKey(targetKey);
    setSelectedCategory("grahas");
    setActiveTab("concept");
    setChartSelectionMsg(`Selected ${planetName} Graha from Kundli Chart`);
  }

  // Handle AI Knowledge Assistant Query
  async function handleAskAi(customMessage) {
    const query = customMessage || aiQuery;
    if (!query.trim()) return;

    setActiveTab("ai");
    setAiLoading(true);

    const userMsg = { role: "user", content: query };
    setAiMessages((prev) => [...prev, userMsg]);
    setAiQuery("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${query} (Context: Study of ${currentConcept.name} - ${currentConcept.sanskrit || ""})`,
          conversationId,
          chart,
          language: "en",
        }),
      });

      const data = await res.json();
      if (res.ok && data.content) {
        if (data.conversationId) setConversationId(data.conversationId);
        const assistantMsg = {
          role: "assistant",
          content: data.content,
          sources: data.sources || [],
          sourceComparison: data.sourceComparison || null,
          hasSufficientEvidence: data.hasSufficientEvidence,
        };
        setAiMessages((prev) => [...prev, assistantMsg]);
      } else {
        setAiMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data.error ||
              "Gurukul AI was unable to retrieve classical passages for this query. Please check your query or consult the digital library directly.",
            sources: [],
          },
        ]);
      }
    } catch (err) {
      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Failed to connect to the Gurukul AI service. Please verify your connection.",
          sources: [],
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  }

  // Categories config
  const CATEGORIES = [
    { id: "all", label: "All Topics", count: ALL_CONCEPTS.length },
    { id: "chakras", label: "7 Chakras & Kundalini", count: 7 },
    { id: "grahas", label: "9 Navagrahas", count: 9 },
    { id: "bhavas", label: "12 Bhavas (Houses)", count: 12 },
    { id: "rashis", label: "12 Rashis (Signs)", count: 12 },
    { id: "nakshatras", label: "27 Nakshatras & Padas", count: 27 },
    { id: "panchang", label: "Panchang Elements", count: 5 },
  ];

  return (
    <div className="min-h-screen bg-[#fcfaf5] text-stone-900 pb-16">
      {/* 1. Header Banner */}
      <section className="bg-gradient-to-b from-[#13382c] to-[#0d271f] text-white pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-[#c4903c]/20 shadow-md">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c4903c]/20 border border-[#c4903c]/40 text-[#f3caa1] text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
                Classical Vedic Ontology & Kundalini Explorer
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
                Gurukul AI Knowledge Explorer
              </h1>
              <p className="text-sm sm:text-base text-stone-300 max-w-2xl font-light leading-relaxed">
                Interconnect authentic Vedic Astrology (Jyotisha Shastra), North Indian Kundli chart interpretation, and Shat-Chakra Yogic Subtle Anatomy grounded in original Sanskrit manuscripts.
              </p>
            </div>

            {/* View Mode Tabs (Knowledge Graph, Concept Details, Kundli Chart, AI Assistant) */}
            <div className="flex items-center gap-2 bg-[#1b4d3d]/60 p-1.5 rounded-xl border border-white/10 shrink-0">
              <button
                onClick={() => setActiveTab("graph")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeTab === "graph"
                    ? "bg-[#d4a359] text-[#13382c] font-bold shadow-xs"
                    : "text-stone-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Network className="w-4 h-4 text-[#d4a359]" />
                <span>Knowledge Graph</span>
              </button>
              <button
                onClick={() => setActiveTab("concept")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeTab === "concept"
                    ? "bg-[#d4a359] text-[#13382c] font-bold shadow-xs"
                    : "text-stone-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Concept Wisdom</span>
              </button>
              <button
                onClick={() => setActiveTab("chart")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeTab === "chart"
                    ? "bg-[#d4a359] text-[#13382c] font-bold shadow-xs"
                    : "text-stone-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Interactive Kundli</span>
              </button>
              <button
                onClick={() => setActiveTab("ai")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeTab === "ai"
                    ? "bg-[#d4a359] text-[#13382c] font-bold shadow-xs"
                    : "text-stone-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <MessageSquare className="w-4 h-4 text-[#d4a359]" />
                <span>Ask AI Shastra</span>
              </button>
            </div>
          </div>

          {/* Multilingual Live Search Bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across Sanskrit, English, Hindi (e.g. Manipura, सूर्य, 10th House, Rohini, Vayu)..."
                className="w-full bg-white text-stone-900 text-sm pl-10 pr-4 py-2.5 rounded-xl shadow-inner border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4a359]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-xs text-stone-400 hover:text-stone-600 font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Chips Scroll */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#d4a359] text-[#13382c] font-bold shadow-xs"
                    : "bg-[#1e4a3c]/80 text-stone-300 hover:text-white hover:bg-[#255c4b]"
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Main Content Grid */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {activeTab === "graph" ? (
          <div className="w-full pb-8">
            <InteractiveKnowledgeGraph
              centerSlug={currentConcept?.id || selectedConceptKey?.replace(/^chakra-/, 'chakra-')?.replace(/^graha-/, '')}
              onSelectConcept={(concept) => {
                const targetKey = concept.slug;
                setSelectedConceptKey(targetKey);
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Concept Directory (4 columns on lg) */}
            <aside className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-4 flex flex-col h-[750px]">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2 text-stone-700 font-serif font-bold text-sm">
                  <Layers className="w-4 h-4 text-[#c4903c]" />
                  <span>Concepts ({filteredConcepts.length})</span>
                </div>
                <span className="text-[11px] text-stone-400 font-mono">
                  {selectedCategory.toUpperCase()}
                </span>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto divide-y divide-stone-100 pr-1 mt-2">
                {filteredConcepts.length === 0 ? (
                  <div className="text-center py-12 text-stone-400 text-xs">
                    No concepts match your search. Try searching for a deity, graha, or chakra.
                  </div>
                ) : (
                  filteredConcepts.map((item) => {
                    const isSelected = item.key === selectedConceptKey;
                    const isBookmarked = Boolean(savedConcepts[item.key]);
                    const isCompleted = Boolean(completedMap[item.key]);

                    return (
                      <div
                        key={item.key}
                        onClick={() => {
                          setSelectedConceptKey(item.key);
                          setActiveTab("concept");
                        }}
                        className={`p-3 rounded-xl transition cursor-pointer text-left my-1 flex items-start justify-between gap-3 ${
                          isSelected
                            ? "bg-[#13382c] text-white shadow-xs"
                            : "hover:bg-stone-50 text-stone-800"
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                isSelected
                                  ? "bg-[#c4903c] text-[#13382c]"
                                  : "bg-stone-100 text-stone-600"
                              }`}
                            >
                              {item.category}
                            </span>
                            {item.sanskrit && (
                              <span
                                className={`text-xs font-serif ${
                                  isSelected ? "text-[#f3caa1]" : "text-[#c4903c]"
                                }`}
                              >
                                {item.sanskrit}
                              </span>
                            )}
                          </div>
                          <h4
                            className={`text-xs sm:text-sm font-semibold truncate ${
                              isSelected ? "text-white" : "text-stone-900"
                            }`}
                          >
                            {item.name}
                          </h4>
                          <p
                            className={`text-[11px] line-clamp-1 ${
                              isSelected ? "text-stone-300" : "text-stone-500"
                            }`}
                          >
                            {item.summary}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0 pt-1">
                          {isBookmarked && (
                            <Star
                              className={`w-3.5 h-3.5 fill-current ${
                                isSelected ? "text-[#f3caa1]" : "text-amber-500"
                              }`}
                            />
                          )}
                          {isCompleted && (
                            <CheckCircle2
                              className={`w-3.5 h-3.5 ${
                                isSelected ? "text-emerald-300" : "text-emerald-600"
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Learning Progress Summary Footer */}
              <div className="pt-3 border-t border-stone-100 text-xs text-stone-600 space-y-1.5 bg-stone-50/50 -mx-4 -mb-4 p-3 rounded-b-2xl">
                <div className="flex justify-between items-center text-[11px] font-medium text-stone-500">
                  <span>Your Study Progress</span>
                  <span>
                    {Object.keys(completedMap).length} / {ALL_CONCEPTS.length} completed
                  </span>
                </div>
                <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#13382c] h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (Object.keys(completedMap).length / ALL_CONCEPTS.length) * 100
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    {Object.keys(savedConcepts).length} Bookmarked
                  </span>
                  <span>{user ? `Logged in: ${user.name}` : "Guest Mode"}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Dynamic Workspace (8 columns on lg) */}
          <section className="lg:col-span-8 space-y-6">
            {/* TAB 1: CONCEPT DETAILED WISDOM & CROSS-LINKS */}
            {activeTab === "concept" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Main Card */}
                <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 space-y-6">
                  {/* Top Bar with Badges and Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#13382c]/10 text-[#13382c] uppercase tracking-wider">
                          {currentConcept.categoryLabel}
                        </span>
                        {currentConcept.sanskrit && (
                          <span className="text-sm font-serif font-bold text-[#c4903c]">
                            {currentConcept.sanskrit}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-1">
                        {currentConcept.name}
                      </h2>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleToggleBookmark}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                          savedConcepts[currentConcept.key]
                            ? "bg-amber-50 border-amber-300 text-amber-800"
                            : "border-stone-200 text-stone-700 hover:bg-stone-50"
                        }`}
                        title="Save to your bookmarks"
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            savedConcepts[currentConcept.key] ? "fill-current text-amber-600" : ""
                          }`}
                        />
                        <span>
                          {savedConcepts[currentConcept.key] ? "Bookmarked" : "Bookmark"}
                        </span>
                      </button>

                      <button
                        onClick={handleToggleCompletion}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                          completedMap[currentConcept.key]
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                            : "border-stone-200 text-stone-700 hover:bg-stone-50"
                        }`}
                        title="Mark as studied"
                      >
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            completedMap[currentConcept.key] ? "text-emerald-600" : ""
                          }`}
                        />
                        <span>
                          {completedMap[currentConcept.key] ? "Studied" : "Mark Studied"}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("graph");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-900/90 text-amber-300 hover:bg-emerald-800 transition cursor-pointer shadow-xs border border-amber-400/20"
                        title="View this concept in the AI Knowledge Graph"
                      >
                        <Network className="w-3.5 h-3.5" />
                        <span>View in Graph</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("ai");
                          handleAskAi(
                            `Provide deep classical shastric explanation for ${currentConcept.name} and its traditional significance.`
                          );
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#13382c] text-white hover:bg-[#1b4d3d] transition cursor-pointer shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
                        <span>Ask AI</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary / Core Shastric Definition */}
                  <div className="bg-[#fcfaf5] p-4 rounded-xl border border-stone-200/80">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                      Traditional Signification
                    </h3>
                    <p className="text-sm text-stone-800 leading-relaxed font-serif">
                      {currentConcept.summary}
                    </p>
                  </div>

                  {/* Key Classical Attributes Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                    {currentConcept.element && (
                      <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <span className="text-[10px] text-stone-400 font-medium block">Tattva (Element)</span>
                        <span className="font-semibold text-stone-800">{currentConcept.element}</span>
                      </div>
                    )}
                    {currentConcept.bija && (
                      <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <span className="text-[10px] text-stone-400 font-medium block">Bija Mantra</span>
                        <span className="font-semibold text-[#c4903c] font-serif">{currentConcept.bija}</span>
                      </div>
                    )}
                    {currentConcept.deity && (
                      <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <span className="text-[10px] text-stone-400 font-medium block">Presiding Deity</span>
                        <span className="font-semibold text-stone-800">{currentConcept.deity}</span>
                      </div>
                    )}
                    {currentConcept.petals && (
                      <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <span className="text-[10px] text-stone-400 font-medium block">Petals / Phonemes</span>
                        <span className="font-semibold text-stone-800">{currentConcept.petals} Petals</span>
                      </div>
                    )}
                    {currentConcept.rulingPlanet && (
                      <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <span className="text-[10px] text-stone-400 font-medium block">Ruling Graha</span>
                        <span className="font-semibold text-stone-800">{currentConcept.rulingPlanet}</span>
                      </div>
                    )}
                    {currentConcept.ownSigns && (
                      <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <span className="text-[10px] text-stone-400 font-medium block">Own Signs</span>
                        <span className="font-semibold text-stone-800">
                          {Array.isArray(currentConcept.ownSigns)
                            ? currentConcept.ownSigns.join(", ")
                            : currentConcept.ownSigns}
                        </span>
                      </div>
                    )}
                    {currentConcept.exaltedIn && (
                      <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <span className="text-[10px] text-stone-400 font-medium block">Exaltation Sign</span>
                        <span className="font-semibold text-emerald-700">{currentConcept.exaltedIn}</span>
                      </div>
                    )}
                    {currentConcept.debilitatedIn && (
                      <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <span className="text-[10px] text-stone-400 font-medium block">Debilitation Sign</span>
                        <span className="font-semibold text-rose-700">{currentConcept.debilitatedIn}</span>
                      </div>
                    )}
                    {currentConcept.karaka && (
                      <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <span className="text-[10px] text-stone-400 font-medium block">Natural Karaka</span>
                        <span className="font-semibold text-stone-800">{currentConcept.karaka}</span>
                      </div>
                    )}
                    {currentConcept.bodyPart && (
                      <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-100">
                        <span className="text-[10px] text-stone-400 font-medium block">Anatomical Region</span>
                        <span className="font-semibold text-stone-800">{currentConcept.bodyPart}</span>
                      </div>
                    )}
                  </div>

                  {/* Classical Shloka / Verse Box */}
                  {currentConcept.classicalVerse && (
                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-amber-700" />
                          Classical Verse & Textual Citation
                        </span>
                        <span className="text-[11px] font-mono text-amber-700">
                          {currentConcept.classicalSource}
                        </span>
                      </div>
                      {typeof currentConcept.classicalVerse === "string" ? (
                        <p className="text-xs sm:text-sm font-serif italic text-amber-950">
                          &ldquo;{currentConcept.classicalVerse}&rdquo;
                        </p>
                      ) : (
                        <div className="space-y-1 text-xs">
                          {currentConcept.classicalVerse.sanskrit && (
                            <p className="font-serif font-semibold text-amber-900 text-sm">
                              {currentConcept.classicalVerse.sanskrit}
                            </p>
                          )}
                          {currentConcept.classicalVerse.translation && (
                            <p className="text-amber-950 italic">
                              Translation: &ldquo;{currentConcept.classicalVerse.translation}&rdquo;
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Authentic Teaching vs Misconceptions */}
                  {currentConcept.modernMisconceptions && (
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-stone-800 font-bold">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>Classical Shastra vs. Common Misconceptions</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed">
                        {currentConcept.modernMisconceptions}
                      </p>
                    </div>
                  )}

                  {/* Cross-Link Ontology: Connected Nodes */}
                  <div className="space-y-3 pt-2 border-t border-stone-100">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-[#c4903c]" />
                        Connected Concepts & Yogic Resonances ({relatedNodes.length})
                      </h4>
                      <span className="text-[11px] text-stone-400">
                        Click any node to navigate
                      </span>
                    </div>

                    {relatedNodes.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">
                        No explicit secondary ontology nodes mapped for this concept yet.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {relatedNodes.map((rel, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedConceptKey(rel.key);
                              if (rel.category) setSelectedCategory(rel.category);
                            }}
                            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-stone-100 hover:bg-[#13382c] hover:text-white border border-stone-200/90 transition cursor-pointer text-stone-800 shadow-2xs"
                          >
                            <span className="font-semibold">{rel.relation}:</span>
                            <span className="font-mono text-[11px] text-[#c4903c] group-hover:text-[#f3caa1]">
                              {rel.key}
                            </span>
                            <ArrowRight className="w-3 h-3 text-stone-400 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Personal Study Notes Editor */}
                  <div className="pt-4 border-t border-stone-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-stone-500" />
                        <span>Personal Study & Reflection Notes</span>
                      </label>
                      {noteStatus && (
                        <span className="text-xs font-semibold text-emerald-700">
                          {noteStatus}
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      value={userNote}
                      onChange={(e) => setUserNote(e.target.value)}
                      placeholder="Write personal reflections, questions, or Sanskrit correlations..."
                      className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4a359] bg-[#fcfaf5] text-stone-800"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveNote}
                        disabled={savingNote}
                        className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#13382c] text-white hover:bg-[#1b4d3d] transition cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {savingNote ? "Saving..." : "Save Note to Database"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE KUNDLI CHART EXPLORER */}
            {activeTab === "chart" && (
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-stone-900">
                      Interactive North Indian Kundli Chart
                    </h3>
                    <p className="text-xs text-stone-500">
                      Click any House (1 to 12) or Planet (Sun, Moon, Mars, etc.) to view authentic classical shastric lessons.
                    </p>
                  </div>
                  {chartSelectionMsg && (
                    <div className="text-xs bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg border border-amber-200 font-semibold">
                      {chartSelectionMsg}
                    </div>
                  )}
                </div>

                {/* Chart and Quick Guide Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-7">
                    <NorthIndianChart
                      chart={chart}
                      language="en"
                      onHouseClick={handleHouseClick}
                      onPlanetClick={handlePlanetClick}
                      className="max-w-[420px]"
                    />
                  </div>

                  <div className="md:col-span-5 space-y-4 text-xs">
                    <div className="p-4 rounded-xl bg-[#fcfaf5] border border-stone-200 space-y-2">
                      <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                        Educational Chart Coordinates
                      </h4>
                      <div className="space-y-1 text-stone-600">
                        <p>
                          <strong>Lagna (Ascendant):</strong> {chart.ascendant.sign.name} ({chart.ascendant.degree}°) - Nakshatra: {chart.ascendant.nakshatra} (Pada {chart.ascendant.pada})
                        </p>
                        <p>
                          <strong>Tanu Bhava (1st House):</strong> Mars in Aries (Own Sign)
                        </p>
                        <p>
                          <strong>Karma Bhava (10th House):</strong> Sun with Digbala (Directional Strength)
                        </p>
                        <p>
                          <strong>Labha Bhava (11th House):</strong> Saturn in Aquarius (Moolatrikona)
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                      <h4 className="font-bold text-amber-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-amber-700" />
                        How Kundli Connects to Chakras
                      </h4>
                      <p className="text-stone-700 leading-relaxed">
                        In classical Yogic Jyotisha, the Sun (10th/1st House) illuminates the Manipura fire center; the Moon in the 4th House (Matru Bhava) governs the heart-water balance (Anahata/Svadhisthana); Saturn in the 11th cultivates Muladhara grounding.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleHouseClick(1)}
                        className="flex-1 py-2 px-3 rounded-lg text-center font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition cursor-pointer"
                      >
                        Explore 1st House
                      </button>
                      <button
                        onClick={() => handlePlanetClick("Sun")}
                        className="flex-1 py-2 px-3 rounded-lg text-center font-semibold bg-[#13382c] text-white hover:bg-[#1b4d3d] transition cursor-pointer"
                      >
                        Explore Sun Graha
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: INTEGRATED AI SHASTRA ASSISTANT (RAG GROUNDED) */}
            {activeTab === "ai" && (
              <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div>
                    <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#c4903c]" />
                      Grounded AI Shastra Assistant
                    </h3>
                    <p className="text-xs text-stone-500">
                      Grounded in classical Sanskrit texts with verified book titles, chapters, and source pages.
                    </p>
                  </div>
                  <span className="text-[11px] bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full font-mono">
                    Topic: {currentConcept.name}
                  </span>
                </div>

                {/* Suggested prompt chips */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                    Suggested Shastric Inquiries
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      onClick={() =>
                        handleAskAi(
                          `What do classical treatises (BPHS, Shat-Chakra-Nirupana) state regarding ${currentConcept.name}?`
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-[#13382c] hover:text-white transition cursor-pointer text-stone-700"
                    >
                      Classical treaties & citations
                    </button>
                    <button
                      onClick={() =>
                        handleAskAi(
                          `How does ${currentConcept.name} resonate with subtle body chakras, tattvas, and nadis?`
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-[#13382c] hover:text-white transition cursor-pointer text-stone-700"
                    >
                      Subtle anatomy & chakra resonance
                    </button>
                    <button
                      onClick={() =>
                        handleAskAi(
                          `What are the authentic, non-fatalistic remedies and common misconceptions regarding ${currentConcept.name}?`
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-[#13382c] hover:text-white transition cursor-pointer text-stone-700"
                    >
                      Authentic remedies vs misconceptions
                    </button>
                  </div>
                </div>

                {/* Message Log */}
                <div className="space-y-4 min-h-[250px] max-h-[460px] overflow-y-auto pr-1">
                  {aiMessages.length === 0 ? (
                    <div className="text-center py-12 text-stone-400 text-xs space-y-2">
                      <BookOpen className="w-8 h-8 text-stone-300 mx-auto" />
                      <p>No queries yet. Select an inquiry chip above or ask any question below.</p>
                      <p className="text-[11px] text-stone-400">
                        Answers will cite verified digital library manuscripts.
                      </p>
                    </div>
                  ) : (
                    aiMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl text-xs space-y-3 ${
                          msg.role === "user"
                            ? "bg-[#13382c] text-white ml-8"
                            : "bg-[#fcfaf5] text-stone-900 mr-8 border border-stone-200"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold opacity-80">
                          <span>{msg.role === "user" ? "You" : "Gurukul AI Shastra Assistant"}</span>
                        </div>
                        <div className="prose prose-stone text-xs max-w-none leading-relaxed whitespace-pre-line">
                          {msg.content}
                        </div>

                        {/* AISources Citation Cards */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="pt-2 border-t border-stone-200/80 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                              Verified Shastric Sources Cited ({msg.sources.length}):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {msg.sources.map((s, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="p-2 rounded bg-white border border-stone-200 text-[11px] space-y-0.5"
                                >
                                  <p className="font-bold text-stone-800 truncate">{s.bookTitle}</p>
                                  <p className="text-stone-500">
                                    Chapter: {s.chapterTitle || "General"} | Page {s.sourcePage || "N/A"}
                                  </p>
                                  {s.readerUrl && (
                                    <Link
                                      href={s.readerUrl}
                                      className="text-[#c4903c] hover:underline inline-flex items-center gap-1 font-semibold pt-0.5"
                                    >
                                      <span>Read in Library</span>
                                      <ExternalLink className="w-2.5 h-2.5" />
                                    </Link>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {aiLoading && (
                    <div className="p-4 rounded-xl bg-stone-50 text-stone-600 text-xs flex items-center gap-2 animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#c4903c]" />
                      <span>Retrieving authentic shastric passages and synthesizing grounded interpretation...</span>
                    </div>
                  )}
                </div>

                {/* Input box */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAskAi();
                  }}
                  className="flex items-center gap-2 pt-2 border-t border-stone-100"
                >
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder={`Ask about ${currentConcept.name} in classical texts...`}
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#d4a359]"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiQuery.trim()}
                    className="px-4 py-2.5 bg-[#13382c] text-white rounded-xl text-xs font-semibold hover:bg-[#1b4d3d] transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ask</span>
                  </button>
                </form>

                {/* Ethical Disclaimer */}
                <p className="text-[10px] text-stone-400 italic text-center">
                  * Gurukul AI explanations are source-grounded educational tools. Content is non-fatalistic and does not replace medical, psychiatric, or legal counsel.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
    </div>
  );
}
