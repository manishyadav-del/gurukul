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
    <div className="min-h-screen bg-[#F7F5F0] text-[#30251F] pb-20">
      {/* 1. Header Banner - Gurukul Digital Museum Identity */}
      <section className="relative overflow-hidden bg-[#F7F5F0] border-b border-[#E8DED2] pt-8 pb-10 sm:pt-12 sm:pb-14 px-4 sm:px-6 lg:px-8">
        {/* Soft Blurred Background Warmth */}
        <div className="absolute top-0 right-1/4 -mr-36 -mt-24 w-96 h-96 rounded-full bg-gradient-to-br from-[#D05C3B]/10 via-[#F2B872]/15 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -mb-28 w-80 h-80 rounded-full bg-gradient-to-tr from-[#E8DED2] via-[#D05C3B]/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-[1440px] mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8DED2]/60 border border-[#E8DED2] text-[#D05C3B] text-xs font-semibold tracking-wider uppercase font-sans">
                <Sparkles className="w-3.5 h-3.5 text-[#D05C3B]" />
                <span>Classical Vedic Ontology &amp; Kundalini Explorer</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#30251F] tracking-tight leading-tight">
                Gurukul <span className="italic font-normal text-[#D05C3B]">AI Knowledge Explorer</span>
              </h1>
              <p className="text-sm sm:text-base text-[#30251F]/80 max-w-2xl font-sans leading-relaxed">
                Interconnect authentic Vedic Astrology (Jyotisha Shastra), North Indian Kundli chart interpretation, and Shat-Chakra Yogic Subtle Anatomy grounded in original Sanskrit manuscripts.
              </p>
            </div>

            {/* View Mode Tabs (Knowledge Graph, Concept Details, Kundli Chart, AI Assistant) */}
            <div className="flex flex-wrap items-center gap-2 bg-[#E8DED2]/50 p-1.5 rounded-2xl border border-[#E8DED2] shrink-0">
              <button
                onClick={() => setActiveTab("graph")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  activeTab === "graph"
                    ? "bg-[#30251F] text-white font-semibold shadow-xs"
                    : "bg-white/80 hover:bg-white text-[#30251F]/80 hover:text-[#30251F] border border-transparent hover:border-[#E8DED2]"
                }`}
              >
                <Network className={`w-4 h-4 ${activeTab === "graph" ? "text-[#F2B872]" : "text-[#D05C3B]"}`} />
                <span>Knowledge Graph</span>
              </button>
              <button
                onClick={() => setActiveTab("concept")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  activeTab === "concept"
                    ? "bg-[#D05C3B] text-white font-semibold shadow-xs"
                    : "bg-white/80 hover:bg-white text-[#30251F]/80 hover:text-[#30251F] border border-transparent hover:border-[#E8DED2]"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Concept Wisdom</span>
              </button>
              <button
                onClick={() => setActiveTab("chart")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  activeTab === "chart"
                    ? "bg-[#30251F] text-white font-semibold shadow-xs"
                    : "bg-white/80 hover:bg-white text-[#30251F]/80 hover:text-[#30251F] border border-transparent hover:border-[#E8DED2]"
                }`}
              >
                <Compass className={`w-4 h-4 ${activeTab === "chart" ? "text-[#F2B872]" : "text-[#D05C3B]"}`} />
                <span>Interactive Kundli</span>
              </button>
              <button
                onClick={() => setActiveTab("ai")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  activeTab === "ai"
                    ? "bg-[#D05C3B] text-white font-semibold shadow-xs"
                    : "bg-white/80 hover:bg-white text-[#30251F]/80 hover:text-[#30251F] border border-transparent hover:border-[#E8DED2]"
                }`}
              >
                <MessageSquare className={`w-4 h-4 ${activeTab === "ai" ? "text-[#F2B872]" : "text-[#D05C3B]"}`} />
                <span>Ask AI Shastra</span>
              </button>
            </div>
          </div>

          {/* Multilingual Live Search Bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#30251F]/40 absolute left-4 top-4 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across Sanskrit, English, Hindi (e.g. Manipura, सूर्य, 10th House, Rohini, Vayu)..."
                className="w-full bg-white text-[#30251F] text-sm pl-11 pr-12 py-3.5 rounded-2xl shadow-xs border border-[#E8DED2] focus:outline-none focus:ring-2 focus:ring-[#D05C3B]/40 focus:border-[#D05C3B] placeholder:text-[#30251F]/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-3.5 text-xs text-[#30251F]/50 hover:text-[#D05C3B] font-semibold cursor-pointer"
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
                className={`px-4 py-2 rounded-full whitespace-nowrap transition cursor-pointer font-medium ${
                  selectedCategory === cat.id
                    ? "bg-[#30251F] text-white font-semibold shadow-xs"
                    : "bg-white hover:bg-[#E8DED2]/60 text-[#30251F]/80 border border-[#E8DED2]"
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Main Content Grid */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-8">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Concept Directory (4 columns on lg) */}
            <aside className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl border border-[#E8DED2] shadow-sm shadow-[#30251F]/5 p-5 flex flex-col h-[780px]">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E8DED2]">
                <div className="flex items-center gap-2 text-[#30251F] font-serif font-bold text-sm">
                  <Layers className="w-4 h-4 text-[#D05C3B]" />
                  <span>Concepts ({filteredConcepts.length})</span>
                </div>
                <span className="text-[11px] text-[#30251F]/50 font-mono uppercase tracking-wider">
                  {selectedCategory}
                </span>
              </div>

              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#E8DED2]/60 pr-1 mt-2">
                {filteredConcepts.length === 0 ? (
                  <div className="text-center py-12 text-[#30251F]/50 text-xs">
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
                        className={`p-3.5 rounded-2xl transition cursor-pointer text-left my-1.5 flex items-start justify-between gap-3 ${
                          isSelected
                            ? "bg-[#30251F] text-[#F7F5F0] shadow-md shadow-[#30251F]/15 border border-[#30251F]"
                            : "hover:bg-[#FAF8F5] border border-transparent hover:border-[#E8DED2] text-[#30251F]"
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono ${
                                isSelected
                                  ? "bg-[#D05C3B] text-white"
                                  : "bg-[#E8DED2]/60 text-[#30251F]/70"
                              }`}
                            >
                              {item.category}
                            </span>
                            {item.sanskrit && (
                              <span
                                className={`text-xs font-serif font-semibold ${
                                  isSelected ? "text-[#F2B872]" : "text-[#D05C3B]"
                                }`}
                              >
                                {item.sanskrit}
                              </span>
                            )}
                          </div>
                          <h4
                            className={`text-sm font-serif font-bold truncate ${
                              isSelected ? "text-white" : "text-[#30251F]"
                            }`}
                          >
                            {item.name}
                          </h4>
                          <p
                            className={`text-[11px] line-clamp-1 leading-snug ${
                              isSelected ? "text-[#F7F5F0]/80" : "text-[#30251F]/70"
                            }`}
                          >
                            {item.summary}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1.5 shrink-0 pt-1">
                          {isBookmarked && (
                            <Star
                              className={`w-3.5 h-3.5 fill-current ${
                                isSelected ? "text-[#F2B872]" : "text-[#D05C3B]"
                              }`}
                            />
                          )}
                          {isCompleted && (
                            <CheckCircle2
                              className={`w-3.5 h-3.5 ${
                                isSelected ? "text-[#F2B872]" : "text-emerald-600"
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
              <div className="pt-3.5 border-t border-[#E8DED2] text-xs text-[#30251F]/80 space-y-2 bg-[#FAF8F5] -mx-5 -mb-5 p-4 rounded-b-3xl">
                <div className="flex justify-between items-center text-[11px] font-medium text-[#30251F]/70">
                  <span>Your Study Progress</span>
                  <span className="font-mono font-semibold">
                    {Object.keys(completedMap).length} / {ALL_CONCEPTS.length} completed
                  </span>
                </div>
                <div className="w-full bg-[#E8DED2] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#D05C3B] h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (Object.keys(completedMap).length / ALL_CONCEPTS.length) * 100
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#30251F]/70 pt-0.5">
                  <span className="flex items-center gap-1 font-medium">
                    <Star className="w-3.5 h-3.5 text-[#D05C3B] fill-[#D05C3B]" />
                    {Object.keys(savedConcepts).length} Bookmarked
                  </span>
                  <span className="font-medium">{user ? `Logged in: ${user.name}` : "Guest Mode"}</span>
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
                <div className="bg-white rounded-3xl border border-[#E8DED2] shadow-sm shadow-[#30251F]/5 p-6 sm:p-8 space-y-6">
                  {/* Top Bar with Badges and Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8DED2]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#E8DED2]/60 text-[#30251F] uppercase tracking-wider font-mono">
                          {currentConcept.categoryLabel}
                        </span>
                        {currentConcept.sanskrit && (
                          <span className="text-sm font-serif font-bold text-[#D05C3B]">
                            {currentConcept.sanskrit}
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#30251F] mt-2 tracking-tight">
                        {currentConcept.name}
                      </h2>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={handleToggleBookmark}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                          savedConcepts[currentConcept.key]
                            ? "bg-[#D05C3B]/10 border-[#D05C3B] text-[#D05C3B] font-semibold"
                            : "border-[#E8DED2] text-[#30251F] hover:bg-[#FAF8F5]"
                        }`}
                        title="Save to your bookmarks"
                      >
                        <Bookmark
                          className={`w-3.5 h-3.5 ${
                            savedConcepts[currentConcept.key] ? "fill-current text-[#D05C3B]" : ""
                          }`}
                        />
                        <span>
                          {savedConcepts[currentConcept.key] ? "Bookmarked" : "Bookmark"}
                        </span>
                      </button>

                      <button
                        onClick={handleToggleCompletion}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                          completedMap[currentConcept.key]
                            ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold"
                            : "border-[#E8DED2] text-[#30251F] hover:bg-[#FAF8F5]"
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
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#30251F] text-white hover:bg-[#201814] transition cursor-pointer shadow-xs"
                        title="View this concept in the AI Knowledge Graph"
                      >
                        <Network className="w-3.5 h-3.5 text-[#F2B872]" />
                        <span>View in Graph</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("ai");
                          handleAskAi(
                            `Provide deep classical shastric explanation for ${currentConcept.name} and its traditional significance.`
                          );
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#D05C3B] text-white hover:bg-[#bc4f30] transition cursor-pointer shadow-xs"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        <span>Ask AI</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary / Core Shastric Definition */}
                  <div className="space-y-1.5">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#30251F]/60 font-mono">
                      TRADITIONAL SIGNIFICATION
                    </h3>
                    <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8DED2] text-xs sm:text-sm text-[#30251F] leading-relaxed font-sans">
                      {currentConcept.summary}
                    </div>
                  </div>

                  {/* Key Classical Attributes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {currentConcept.element && (
                      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DED2] hover:border-[#D05C3B]/50 transition">
                        <span className="text-[10px] text-[#30251F]/60 font-mono font-medium block uppercase tracking-wider">Tattva (Element)</span>
                        <span className="font-serif font-bold text-[#30251F] text-xs sm:text-sm mt-1 block">{currentConcept.element}</span>
                      </div>
                    )}
                    {currentConcept.bija && (
                      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DED2] hover:border-[#D05C3B]/50 transition">
                        <span className="text-[10px] text-[#30251F]/60 font-mono font-medium block uppercase tracking-wider">Bija Mantra</span>
                        <span className="font-serif font-bold text-[#D05C3B] text-xs sm:text-sm mt-1 block">{currentConcept.bija}</span>
                      </div>
                    )}
                    {currentConcept.deity && (
                      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DED2] hover:border-[#D05C3B]/50 transition">
                        <span className="text-[10px] text-[#30251F]/60 font-mono font-medium block uppercase tracking-wider">Presiding Deity</span>
                        <span className="font-serif font-bold text-[#30251F] text-xs leading-snug mt-1 block">{currentConcept.deity}</span>
                      </div>
                    )}
                    {currentConcept.petals ? (
                      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DED2] hover:border-[#D05C3B]/50 transition">
                        <span className="text-[10px] text-[#30251F]/60 font-mono font-medium block uppercase tracking-wider">Petals / Phonemes</span>
                        <span className="font-serif font-bold text-[#30251F] text-xs sm:text-sm mt-1 block">{currentConcept.petals} Petals</span>
                      </div>
                    ) : null}
                    {currentConcept.rulingPlanet && (
                      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DED2] hover:border-[#D05C3B]/50 transition">
                        <span className="text-[10px] text-[#30251F]/60 font-mono font-medium block uppercase tracking-wider">Ruling Graha</span>
                        <span className="font-serif font-bold text-[#30251F] text-xs sm:text-sm mt-1 block">{currentConcept.rulingPlanet}</span>
                      </div>
                    )}
                    {currentConcept.ownSigns && (
                      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DED2] hover:border-[#D05C3B]/50 transition">
                        <span className="text-[10px] text-[#30251F]/60 font-mono font-medium block uppercase tracking-wider">Own Signs</span>
                        <span className="font-serif font-bold text-[#30251F] text-xs sm:text-sm mt-1 block">
                          {Array.isArray(currentConcept.ownSigns)
                            ? currentConcept.ownSigns.join(", ")
                            : currentConcept.ownSigns}
                        </span>
                      </div>
                    )}
                    {currentConcept.exaltedIn && (
                      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DED2] hover:border-[#D05C3B]/50 transition">
                        <span className="text-[10px] text-[#30251F]/60 font-mono font-medium block uppercase tracking-wider">Exaltation Sign</span>
                        <span className="font-serif font-bold text-emerald-800 text-xs sm:text-sm mt-1 block">{currentConcept.exaltedIn}</span>
                      </div>
                    )}
                    {currentConcept.debilitatedIn && (
                      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DED2] hover:border-[#D05C3B]/50 transition">
                        <span className="text-[10px] text-[#30251F]/60 font-mono font-medium block uppercase tracking-wider">Debilitation Sign</span>
                        <span className="font-serif font-bold text-rose-800 text-xs sm:text-sm mt-1 block">{currentConcept.debilitatedIn}</span>
                      </div>
                    )}
                    {currentConcept.karaka && (
                      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DED2] hover:border-[#D05C3B]/50 transition">
                        <span className="text-[10px] text-[#30251F]/60 font-mono font-medium block uppercase tracking-wider">Natural Karaka</span>
                        <span className="font-serif font-bold text-[#30251F] text-xs sm:text-sm mt-1 block">{currentConcept.karaka}</span>
                      </div>
                    )}
                    {currentConcept.bodyPart && (
                      <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8DED2] hover:border-[#D05C3B]/50 transition">
                        <span className="text-[10px] text-[#30251F]/60 font-mono font-medium block uppercase tracking-wider">Anatomical Region</span>
                        <span className="font-serif font-bold text-[#30251F] text-xs sm:text-sm mt-1 block">{currentConcept.bodyPart}</span>
                      </div>
                    )}
                  </div>

                  {/* Cross-Link Ontology: Connected Nodes */}
                  <div className="space-y-3 pt-5 border-t border-[#E8DED2]">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#30251F] font-serif flex items-center gap-1.5">
                        <span className="text-[#D05C3B] font-mono">@</span>
                        <span>CONNECTED CONCEPTS &amp; YOGIC RESONANCES ({relatedNodes.length})</span>
                      </h4>
                      <span className="text-[11px] text-[#30251F]/60 font-sans">
                        Click any node to navigate
                      </span>
                    </div>

                    {relatedNodes.length === 0 ? (
                      <p className="text-xs text-[#30251F]/50 italic">
                        No explicit secondary ontology nodes mapped for this concept yet.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2.5">
                        {relatedNodes.map((rel, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedConceptKey(rel.key);
                              if (rel.category) setSelectedCategory(rel.category);
                            }}
                            className="group inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs bg-white hover:bg-[#30251F] hover:text-white border border-[#E8DED2] transition cursor-pointer text-[#30251F] shadow-xs"
                          >
                            <span className="font-medium text-[#30251F]/80 group-hover:text-stone-200">{rel.relation}:</span>
                            <span className="font-mono text-[11px] text-[#D05C3B] group-hover:text-[#F2B872]">
                              {rel.key}
                            </span>
                            <span className="text-[#30251F]/40 group-hover:text-white transition-transform group-hover:translate-x-0.5">&rarr;</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Personal Study Notes Editor */}
                  <div className="pt-5 border-t border-[#E8DED2] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#30251F] font-serif flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-[#D05C3B]" />
                        <span>Personal Study &amp; Reflection Notes</span>
                      </label>
                      {noteStatus && (
                        <span className="text-xs font-semibold text-emerald-800">
                          {noteStatus}
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      value={userNote}
                      onChange={(e) => setUserNote(e.target.value)}
                      placeholder="Write personal reflections, questions, or Sanskrit correlations..."
                      className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-[#E8DED2] bg-white text-[#30251F] placeholder:text-[#30251F]/40 focus:outline-none focus:ring-2 focus:ring-[#D05C3B]/40 focus:border-[#D05C3B]"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveNote}
                        disabled={savingNote}
                        className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#D05C3B] text-white hover:bg-[#bc4f30] transition cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {savingNote ? "Saving..." : "Save Note to Database"}
                      </button>
                    </div>
                  </div>

                  {/* Classical Shloka & Misconceptions (Collapsible Scholarly Drawer) */}
                  {(currentConcept.classicalVerse || currentConcept.modernMisconceptions) && (
                    <details className="group pt-3 border-t border-[#E8DED2]">
                      <summary className="text-xs font-semibold text-[#30251F]/70 cursor-pointer hover:text-[#30251F] flex items-center justify-between py-1.5 select-none font-sans">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-[#D05C3B]" />
                          <span>Classical Citations &amp; Shastric Explanations</span>
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 transition-transform group-open:rotate-180 text-[#30251F]/50" />
                      </summary>
                      <div className="space-y-4 pt-3">
                        {currentConcept.classicalVerse && (
                          <div className="p-4 rounded-2xl bg-[#E8DED2]/30 border border-[#E8DED2] space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold text-[#30251F]">
                              <span className="flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4 text-[#D05C3B]" />
                                Classical Verse &amp; Textual Citation
                              </span>
                              <span className="text-[11px] font-mono text-[#D05C3B]">
                                {currentConcept.classicalSource}
                              </span>
                            </div>
                            {typeof currentConcept.classicalVerse === "string" ? (
                              <p className="text-xs sm:text-sm font-serif italic text-[#30251F]">
                                &ldquo;{currentConcept.classicalVerse}&rdquo;
                              </p>
                            ) : (
                              <div className="space-y-1 text-xs">
                                {currentConcept.classicalVerse.sanskrit && (
                                  <p className="font-serif font-semibold text-[#30251F] text-sm">
                                    {currentConcept.classicalVerse.sanskrit}
                                  </p>
                                )}
                                {currentConcept.classicalVerse.translation && (
                                  <p className="text-[#30251F]/80 italic font-sans">
                                    Translation: &ldquo;{currentConcept.classicalVerse.translation}&rdquo;
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {currentConcept.modernMisconceptions && (
                          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DED2] space-y-2 text-xs">
                            <div className="flex items-center gap-1.5 text-[#30251F] font-bold">
                              <ShieldCheck className="w-4 h-4 text-[#D05C3B]" />
                              <span>Classical Shastra vs. Common Misconceptions</span>
                            </div>
                            <p className="text-[#30251F]/80 leading-relaxed font-sans">
                              {currentConcept.modernMisconceptions}
                            </p>
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE KUNDLI CHART EXPLORER */}
            {activeTab === "chart" && (
              <div className="bg-white rounded-3xl border border-[#E8DED2] shadow-sm shadow-[#30251F]/5 p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E8DED2]">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#30251F]">
                      Interactive North Indian Kundli Chart
                    </h3>
                    <p className="text-xs text-[#30251F]/70 font-sans mt-0.5">
                      Click any House (1 to 12) or Planet (Sun, Moon, Mars, etc.) to view authentic classical shastric lessons.
                    </p>
                  </div>
                  {chartSelectionMsg && (
                    <div className="text-xs bg-[#E8DED2]/50 text-[#D05C3B] px-3.5 py-1.5 rounded-xl border border-[#E8DED2] font-semibold">
                      {chartSelectionMsg}
                    </div>
                  )}
                </div>

                {/* Chart and Quick Guide Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                  <div className="md:col-span-7 flex justify-center">
                    <NorthIndianChart
                      chart={chart}
                      language="en"
                      onHouseClick={handleHouseClick}
                      onPlanetClick={handlePlanetClick}
                      className="max-w-[420px] w-full"
                    />
                  </div>

                  <div className="md:col-span-5 space-y-4 text-xs">
                    <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8DED2] space-y-2.5">
                      <h4 className="font-bold text-[#30251F] uppercase tracking-wider text-[11px] font-mono">
                        Educational Chart Coordinates
                      </h4>
                      <div className="space-y-1.5 text-[#30251F]/80">
                        <p>
                          <strong>Lagna (Ascendant):</strong> {chart.ascendant.sign.name} ({chart.ascendant.degree}°) • Nakshatra: {chart.ascendant.nakshatra} (Pada {chart.ascendant.pada})
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

                    <div className="p-5 rounded-2xl bg-[#E8DED2]/30 border border-[#E8DED2] space-y-2">
                      <h4 className="font-bold text-[#30251F] uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-[#D05C3B]" />
                        <span>How Kundli Connects to Chakras</span>
                      </h4>
                      <p className="text-[#30251F]/80 leading-relaxed font-sans">
                        In classical Yogic Jyotisha, the Sun (10th/1st House) illuminates the Manipura fire center; the Moon in the 4th House (Matru Bhava) governs the heart-water balance (Anahata/Svadhisthana); Saturn in the 11th cultivates Muladhara grounding.
                      </p>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => handleHouseClick(1)}
                        className="flex-1 py-2.5 px-4 rounded-xl text-center font-semibold bg-white hover:bg-[#FAF8F5] text-[#30251F] border border-[#E8DED2] transition cursor-pointer text-xs"
                      >
                        Explore 1st House
                      </button>
                      <button
                        onClick={() => handlePlanetClick("Sun")}
                        className="flex-1 py-2.5 px-4 rounded-xl text-center font-semibold bg-[#D05C3B] text-white hover:bg-[#bc4f30] transition cursor-pointer text-xs shadow-xs"
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
              <div className="bg-white rounded-3xl border border-[#E8DED2] shadow-sm shadow-[#30251F]/5 p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#E8DED2]">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#30251F] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D05C3B]" />
                      <span>Grounded AI Shastra Assistant</span>
                    </h3>
                    <p className="text-xs text-[#30251F]/70 font-sans mt-0.5">
                      Grounded in classical Sanskrit texts with verified book titles, chapters, and source pages.
                    </p>
                  </div>
                  <span className="text-[11px] bg-[#E8DED2]/60 text-[#30251F] px-3 py-1 rounded-full font-mono font-medium">
                    Topic: {currentConcept.name}
                  </span>
                </div>

                {/* Suggested prompt chips */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-[#30251F]/60 uppercase tracking-wider block font-mono">
                    Suggested Shastric Inquiries
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      onClick={() =>
                        handleAskAi(
                          `What do classical treatises (BPHS, Shat-Chakra-Nirupana) state regarding ${currentConcept.name}?`
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#30251F] hover:text-white border border-[#E8DED2] transition cursor-pointer text-[#30251F] font-medium"
                    >
                      Classical treatises &amp; citations
                    </button>
                    <button
                      onClick={() =>
                        handleAskAi(
                          `How does ${currentConcept.name} resonate with subtle body chakras, tattvas, and nadis?`
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#30251F] hover:text-white border border-[#E8DED2] transition cursor-pointer text-[#30251F] font-medium"
                    >
                      Subtle anatomy &amp; chakra resonance
                    </button>
                    <button
                      onClick={() =>
                        handleAskAi(
                          `What are the authentic, non-fatalistic remedies and common misconceptions regarding ${currentConcept.name}?`
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#30251F] hover:text-white border border-[#E8DED2] transition cursor-pointer text-[#30251F] font-medium"
                    >
                      Authentic remedies vs misconceptions
                    </button>
                  </div>
                </div>

                {/* Message Log */}
                <div className="space-y-4 min-h-[250px] max-h-[460px] overflow-y-auto pr-1">
                  {aiMessages.length === 0 ? (
                    <div className="text-center py-12 text-[#30251F]/50 text-xs space-y-2">
                      <BookOpen className="w-8 h-8 text-[#D05C3B]/40 mx-auto" />
                      <p>No queries yet. Select an inquiry chip above or ask any question below.</p>
                      <p className="text-[11px] text-[#30251F]/40 font-mono">
                        Answers will cite verified digital library manuscripts.
                      </p>
                    </div>
                  ) : (
                    aiMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-5 rounded-2xl text-xs space-y-3 ${
                          msg.role === "user"
                            ? "bg-[#30251F] text-[#F7F5F0] ml-8"
                            : "bg-[#FAF8F5] text-[#30251F] mr-8 border border-[#E8DED2]"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-semibold opacity-80 font-mono">
                          <span>{msg.role === "user" ? "You" : "Gurukul AI Shastra Assistant"}</span>
                        </div>
                        <div className="prose prose-stone text-xs max-w-none leading-relaxed whitespace-pre-line font-sans">
                          {msg.content}
                        </div>

                        {/* AISources Citation Cards */}
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="pt-3 border-t border-[#E8DED2] space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#30251F]/60 block font-mono">
                              Verified Shastric Sources Cited ({msg.sources.length}):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {msg.sources.map((s, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="p-3 rounded-xl bg-white border border-[#E8DED2] text-[11px] space-y-1"
                                >
                                  <p className="font-bold text-[#30251F] truncate font-serif">{s.bookTitle}</p>
                                  <p className="text-[#30251F]/70 text-[10px]">
                                    Chapter: {s.chapterTitle || "General"} • Page {s.sourcePage || "N/A"}
                                  </p>
                                  {s.readerUrl && (
                                    <Link
                                      href={s.readerUrl}
                                      className="text-[#D05C3B] hover:underline inline-flex items-center gap-1 font-semibold pt-0.5 text-[11px]"
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
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DED2] text-[#30251F]/70 text-xs flex items-center gap-2 animate-pulse">
                      <RefreshCw className="w-4 h-4 animate-spin text-[#D05C3B]" />
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
                  className="flex items-center gap-2 pt-3 border-t border-[#E8DED2]"
                >
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder={`Ask about ${currentConcept.name} in classical texts...`}
                    className="flex-1 bg-white border border-[#E8DED2] rounded-2xl px-4 py-3 text-xs text-[#30251F] placeholder:text-[#30251F]/40 focus:outline-none focus:ring-2 focus:ring-[#D05C3B]/40 focus:border-[#D05C3B]"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiQuery.trim()}
                    className="px-5 py-3 bg-[#D05C3B] text-white rounded-2xl text-xs font-semibold hover:bg-[#bc4f30] transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ask</span>
                  </button>
                </form>

                {/* Ethical Disclaimer */}
                <p className="text-[10px] text-[#30251F]/50 italic text-center font-sans">
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
