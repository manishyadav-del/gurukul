"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Sparkles,
  Compass,
  Layers,
  Sun,
  Moon,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Check,
  Languages,
  Printer,
  Info,
  ExternalLink,
  Flame,
  Wind,
  Droplets,
  Star,
  Award,
} from "lucide-react";
import { HOROSCOPE_OVERVIEW } from "../../server/astrology/horoscopeOverviewKnowledge.js";
import { BHAVAS_KNOWLEDGE } from "../../server/astrology/bhavasKnowledge.js";
import { GRAHAS_KNOWLEDGE } from "../../server/astrology/grahasKnowledge.js";
import {
  RASHIS_KNOWLEDGE,
  NAKSHATRAS_KNOWLEDGE,
  PANCHANG_KNOWLEDGE,
} from "../../server/astrology/rashisNakshatrasKnowledge.js";

export default function HoroscopeLearningPortal({ initialCategory = "overview", initialTarget = null, onSelectTopic = null }) {
  const [activeCategory, setActiveCategory] = useState(initialCategory); // overview | bhavas | grahas | rashis | nakshatras | panchang
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState("en"); // en | hi
  const isHi = language === "hi";

  // Selected item detail states
  const [selectedBhavaNumber, setSelectedBhavaNumber] = useState(1);
  const [selectedGrahaId, setSelectedGrahaId] = useState("surya");
  const [selectedRashiNumber, setSelectedRashiNumber] = useState(1);
  const [selectedNakshatraNumber, setSelectedNakshatraNumber] = useState(1);

  // User notes & bookmarks
  const [userNotes, setUserNotes] = useState({});
  const [bookmarkedItems, setBookmarkedItems] = useState({});
  const [noteStatus, setNoteStatus] = useState("");

  useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory);
    }
    if (initialTarget) {
      if (typeof initialTarget === "number") {
        if (initialCategory === "bhavas") setSelectedBhavaNumber(initialTarget);
        if (initialCategory === "rashis") setSelectedRashiNumber(initialTarget);
        if (initialCategory === "nakshatras") setSelectedNakshatraNumber(initialTarget);
      } else if (typeof initialTarget === "string") {
        if (initialCategory === "grahas") setSelectedGrahaId(initialTarget.toLowerCase());
      }
    }
  }, [initialCategory, initialTarget]);

  const activeBhava = BHAVAS_KNOWLEDGE.find((b) => b.number === selectedBhavaNumber) || BHAVAS_KNOWLEDGE[0];
  const activeGraha = GRAHAS_KNOWLEDGE.find((g) => g.id === selectedGrahaId) || GRAHAS_KNOWLEDGE[0];
  const activeRashi = RASHIS_KNOWLEDGE.find((r) => r.number === selectedRashiNumber) || RASHIS_KNOWLEDGE[0];
  const activeNakshatra = NAKSHATRAS_KNOWLEDGE.find((n) => n.number === selectedNakshatraNumber) || NAKSHATRAS_KNOWLEDGE[0];

  const handleSaveNote = async (key, term, category) => {
    const noteText = userNotes[key] || "";
    setNoteStatus("Saving...");
    try {
      const res = await fetch("/api/spirituality/kundalini/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: key,
          action: "save_notes",
          notes: noteText,
          term,
        }),
      });
      if (res.ok) {
        setNoteStatus("Saved successfully!");
        setTimeout(() => setNoteStatus(""), 3000);
      } else {
        setNoteStatus("Saved locally (login to sync with profile)");
        setTimeout(() => setNoteStatus(""), 3000);
      }
    } catch {
      setNoteStatus("Saved locally (offline)");
      setTimeout(() => setNoteStatus(""), 3000);
    }
  };

  const handleToggleBookmark = (key) => {
    setBookmarkedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  // Search filtered lists
  const queryLower = searchQuery.toLowerCase().trim();
  const filteredBhavas = queryLower
    ? BHAVAS_KNOWLEDGE.filter(
        (b) =>
          b.sanskritName.toLowerCase().includes(queryLower) ||
          b.englishName.toLowerCase().includes(queryLower) ||
          b.primarySignifications.some((s) => s.toLowerCase().includes(queryLower)) ||
          Object.values(b.modernLifeDomains).some((d) => d.toLowerCase().includes(queryLower))
      )
    : BHAVAS_KNOWLEDGE;

  const filteredGrahas = queryLower
    ? GRAHAS_KNOWLEDGE.filter(
        (g) =>
          g.sanskritName.toLowerCase().includes(queryLower) ||
          g.englishName.toLowerCase().includes(queryLower) ||
          g.symbolism.toLowerCase().includes(queryLower) ||
          g.coreSignifications.some((s) => s.toLowerCase().includes(queryLower))
      )
    : GRAHAS_KNOWLEDGE;

  const filteredNakshatras = queryLower
    ? NAKSHATRAS_KNOWLEDGE.filter(
        (n) =>
          n.name.toLowerCase().includes(queryLower) ||
          n.deity.toLowerCase().includes(queryLower) ||
          n.symbol.toLowerCase().includes(queryLower) ||
          n.primaryQualities.toLowerCase().includes(queryLower)
      )
    : NAKSHATRAS_KNOWLEDGE;

  return (
    <div className="bg-[#fcfaf5] rounded-3xl border border-[#ede5d6] p-4 sm:p-7 shadow-xs space-y-7">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#ede5d6]">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#faf5ec] text-[#c4903c] border border-[#ede5d6] uppercase tracking-wider">
              {isHi ? "वैदिक ज्योतिष विद्यापीठ" : "Vedic Astrology Learning Center"}
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs font-medium text-stone-500">
              Brihat Parashara Hora Shastra & Brihat Jataka
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight mt-1">
            {isHi ? "जन्म कुण्डली एवं नवग्रह संपूर्ण ज्ञानकोश" : "Vedic Horoscope, Bhavas & Navagraha Compendium"}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
            {isHi
              ? "शास्त्रसम्मत, भयमुक्त और प्रामाणिक शिक्षण। 12 भाव, 9 ग्रह, 12 राशियां, 27 नक्षत्र और पंचांग के 5 अंगों का गहन अध्ययन।"
              : "Source-grounded, non-fatalistic educational guide. Explore the classical architecture of the 12 Bhavas, 9 Navagrahas, 12 Rashis, 27 Nakshatras, and the 5 Limbs of Panchang."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-center">
          {/* Language Switch */}
          <button
            onClick={() => setLanguage(language === "en" ? "hi" : "en")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#ede5d6] text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-2xs transition cursor-pointer"
            title="Toggle English / Hindi terminology"
          >
            <Languages className="w-3.5 h-3.5 text-[#c4903c]" />
            <span>{language === "en" ? "हिन्दी" : "English"}</span>
          </button>

          {/* Print Layout */}
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-white border border-[#ede5d6] text-stone-600 hover:text-stone-900 hover:bg-stone-50 shadow-2xs transition cursor-pointer"
            title="Print or export study guide"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search and Navigation Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Navigation Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {[
            { id: "overview", label: isHi ? "कुण्डली परिचय" : "Overview & Foundations", icon: Compass },
            { id: "bhavas", label: isHi ? "12 भाव (Bhavas)" : "12 Houses (Bhavas)", icon: Layers },
            { id: "grahas", label: isHi ? "9 ग्रह (Navagrahas)" : "9 Grahas (Navagrahas)", icon: Sun },
            { id: "rashis", label: isHi ? "12 राशियां (Rashis)" : "12 Rashis (Signs)", icon: Star },
            { id: "nakshatras", label: isHi ? "27 नक्षत्र (Nakshatras)" : "27 Nakshatras", icon: Moon },
            { id: "panchang", label: isHi ? "पञ्चाङ्ग (5 Limbs)" : "5 Limbs of Panchang", icon: Sparkles },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSearchQuery("");
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? "bg-[#13382c] text-white shadow-xs"
                    : "bg-white text-stone-700 border border-[#ede5d6] hover:bg-stone-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#e8c882]" : "text-stone-500"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isHi ? "ज्ञानकोश में खोजें..." : "Search concepts, houses, planets..."}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#ede5d6] text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#13382c]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-stone-400 hover:text-stone-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* SECTION 1: OVERVIEW & FOUNDATIONS */}
      {/* ==================================================================== */}
      {activeCategory === "overview" && (
        <div className="space-y-6">
          {/* Hero Concept Card */}
          <div className="bg-white rounded-2xl border border-[#ede5d6] p-6 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#c4903c]">
              {isHi ? "मूल अवधारणा" : "Fundamental Definition"}
            </span>
            <h3 className="text-xl font-bold font-serif text-stone-900">
              {HOROSCOPE_OVERVIEW.title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
              {HOROSCOPE_OVERVIEW.introduction.whatIsJanmaKundli}
            </p>
          </div>

          {/* Chart Types Comparison Grid */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-stone-800 font-serif">
              {isHi ? "कुण्डली प्रकारों की तुलना" : "Comparison of Chart Types in Vedic Tradition"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {HOROSCOPE_OVERVIEW.introduction.chartTypesComparison.map((ct) => (
                <div key={ct.type} className="bg-white rounded-xl border border-[#ede5d6] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-bold font-serif text-stone-900">{ct.type}</h5>
                    <span className="text-xs font-serif text-[#c4903c] font-sanskrit">{ct.sanskrit}</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">{ct.description}</p>
                  <div className="pt-2 border-t border-stone-100 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="font-bold text-stone-500 block">Stability:</span>
                      <span className="text-stone-700">{ct.stability}</span>
                    </div>
                    <div>
                      <span className="font-bold text-stone-500 block">Primary Use:</span>
                      <span className="text-stone-700">{ct.primaryUse}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Birth Data Critical Role */}
          <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-5 space-y-3">
            <h4 className="font-serif font-bold text-sm text-amber-950 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>{HOROSCOPE_OVERVIEW.introduction.birthDataCriticalRole.title}</span>
            </h4>
            <p className="text-xs text-amber-900/90 leading-relaxed whitespace-pre-line">
              {HOROSCOPE_OVERVIEW.introduction.birthDataCriticalRole.explanation}
            </p>
            <div className="p-3.5 rounded-xl bg-white/80 border border-amber-200/60 text-xs text-amber-950 space-y-1">
              <span className="font-bold block text-stone-900">
                {isHi ? "अस्पष्ट जन्म समय की स्थिति में शास्त्रीय दृष्टिकोण:" : "How to Handle Uncertain Birth Times:"}
              </span>
              <p className="text-[11px] text-stone-700 whitespace-pre-line">
                {HOROSCOPE_OVERVIEW.introduction.birthDataCriticalRole.approximateTimeGuidance}
              </p>
            </div>
          </div>

          {/* Core Structural Elements Grid */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-stone-800 font-serif">
              {isHi ? "कुण्डली के आधार स्तम्भ" : "Core Structural Elements"}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {HOROSCOPE_OVERVIEW.structuralElements.map((elem) => (
                <div key={elem.element} className="bg-white rounded-xl border border-[#ede5d6] p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-serif text-stone-900">{elem.element}</span>
                    <span className="text-xs font-sanskrit text-[#c4903c]">{elem.sanskrit}</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">{elem.concept}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Composite Synthesis & Ethics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Methodology */}
            <div className="bg-white rounded-2xl border border-[#ede5d6] p-5 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#13382c]">
                {isHi ? "व्याख्या पद्धति" : "Interpretation Methodology"}
              </span>
              <h4 className="font-serif font-bold text-base text-stone-900">
                {HOROSCOPE_OVERVIEW.compositeInterpretationMethodology.title}
              </h4>
              <div className="space-y-2.5">
                {HOROSCOPE_OVERVIEW.compositeInterpretationMethodology.principles.map((p) => (
                  <div key={p.name} className="p-2.5 rounded-lg bg-[#faf8f4] border border-[#ede5d6] text-xs">
                    <span className="font-bold text-stone-900 block">{p.name}</span>
                    <span className="text-stone-600 leading-relaxed mt-0.5 block">{p.rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Boundaries and Ethics */}
            <div className="bg-white rounded-2xl border border-[#ede5d6] p-5 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                {isHi ? "मर्यादा एवं नैतिकता" : "Ethical Boundaries & Philosophy"}
              </span>
              <h4 className="font-serif font-bold text-base text-stone-900">
                {HOROSCOPE_OVERVIEW.ethicalBoundariesAndLimitations.title}
              </h4>
              <div className="space-y-2.5">
                {HOROSCOPE_OVERVIEW.ethicalBoundariesAndLimitations.axioms.map((ax) => (
                  <div key={ax.topic} className="p-2.5 rounded-lg bg-[#faf8f4] border border-[#ede5d6] text-xs">
                    <span className="font-bold text-stone-900 block">{ax.topic}</span>
                    <span className="text-stone-600 leading-relaxed mt-0.5 block">{ax.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Classical References */}
          <div className="bg-[#faf5ec] rounded-2xl border border-[#ede5d6] p-5 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#c4903c]">
              {isHi ? "प्रामाणिक शास्त्रीय ग्रन्थ" : "Classical Citations & Canonical Sources"}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {HOROSCOPE_OVERVIEW.classicalReferences.map((ref) => (
                <div key={ref.text} className="bg-white rounded-xl border border-[#ede5d6] p-3 text-xs space-y-1">
                  <h6 className="font-serif font-bold text-stone-900">{ref.text}</h6>
                  <p className="text-[11px] text-[#c4903c] font-medium">{ref.author}</p>
                  <p className="text-[11px] text-stone-600">{ref.importance}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 2: 12 BHAVAS (HOUSES) */}
      {/* ==================================================================== */}
      {activeCategory === "bhavas" && (
        <div className="space-y-6">
          {/* Houses Selector Carousel/Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {filteredBhavas.map((bhava) => {
              const isSelected = activeBhava.number === bhava.number;
              return (
                <button
                  key={bhava.number}
                  onClick={() => setSelectedBhavaNumber(bhava.number)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#13382c] border-[#13382c] text-white shadow-xs"
                      : "bg-white border-[#ede5d6] hover:border-stone-400 text-stone-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      House {bhava.number}
                    </span>
                    <span className="text-xs font-serif font-sanskrit opacity-90">
                      {bhava.devanagari.split(" ")[0]}
                    </span>
                  </div>
                  <span className="text-xs font-bold block mt-1 font-serif">
                    {bhava.sanskritName.split(" ")[0]}
                  </span>
                  <span className="text-[10px] opacity-75 truncate mt-0.5">
                    {bhava.englishName.split(" ")[2] || bhava.englishName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Bhava Comprehensive Detail Card */}
          <div className="bg-white rounded-2xl border border-[#ede5d6] p-6 space-y-6">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#ede5d6]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#faf5ec] text-[#c4903c] border border-[#ede5d6] uppercase tracking-wider">
                    Bhava {activeBhava.number}
                  </span>
                  {activeBhava.classifications.map((cls) => (
                    <span key={cls} className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-700">
                      {cls}
                    </span>
                  ))}
                </div>
                <h3 className="text-2xl font-bold font-serif text-stone-900 mt-1 flex items-center gap-2">
                  <span>{activeBhava.sanskritName}</span>
                  <span className="text-lg text-stone-400 font-normal">({activeBhava.devanagari})</span>
                </h3>
                <p className="text-xs text-stone-600 font-medium">{activeBhava.englishName}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleBookmark(`bhava-${activeBhava.number}`)}
                  className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    bookmarkedItems[`bhava-${activeBhava.number}`]
                      ? "bg-[#faf5ec] border-[#c4903c] text-[#c4903c]"
                      : "bg-white border-[#ede5d6] text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{bookmarkedItems[`bhava-${activeBhava.number}`] ? "Saved" : "Save"}</span>
                </button>
              </div>
            </div>

            {/* Karaka & Significations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#ede5d6] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c4903c]">
                  Natural Signifier (Karaka)
                </span>
                <p className="text-xs font-semibold text-stone-900">{activeBhava.karakaGraha}</p>
                <div className="pt-2 border-t border-stone-200/60 text-[11px] text-stone-600">
                  <span className="font-bold block text-stone-700">Classical Citations:</span>
                  <span>{activeBhava.classicalCitations}</span>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                  Classical Core Significations
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                  {activeBhava.primarySignifications.map((sig, i) => (
                    <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#13382c] shrink-0 mt-1.5" />
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modern Life Domains */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#13382c]">
                Modern Practical Life Domains
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {Object.entries(activeBhava.modernLifeDomains).map(([domain, text]) => (
                  <div key={domain} className="p-3 rounded-xl border border-[#ede5d6] bg-white space-y-1">
                    <span className="font-bold text-stone-900 capitalize block">{domain}:</span>
                    <span className="text-stone-600 leading-relaxed block">{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Analyze & Balanced Example */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#ede5d6] space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700 block">
                  Methodology: How to Systematically Analyze House {activeBhava.number}
                </span>
                <p className="text-stone-700 leading-relaxed">
                  <strong>House Lord (Bhavesha):</strong> {activeBhava.howToAnalyze.bhaveshaLordship}
                </p>
                <p className="text-stone-700 leading-relaxed">
                  <strong>Occupying Planets:</strong> {activeBhava.howToAnalyze.occupyingPlanets}
                </p>
                <p className="text-stone-700 leading-relaxed">
                  <strong>Aspects:</strong> {activeBhava.howToAnalyze.aspectingPlanets}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                  Classical Chart Example
                </span>
                <p className="text-emerald-950 leading-relaxed">
                  {activeBhava.howToAnalyze.balancedExample}
                </p>
              </div>
            </div>

            {/* Common Misconceptions */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                Common Astrological Misconceptions Corrected
              </span>
              <ul className="space-y-1.5 text-amber-950">
                {activeBhava.commonMisconceptions.map((misc, idx) => (
                  <li key={idx} className="leading-relaxed">
                    • {misc}
                  </li>
                ))}
              </ul>
            </div>

            {/* User Personal Study Notes */}
            <div className="p-4 rounded-xl bg-stone-50 border border-[#ede5d6] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700">
                  Your Personal Reflection & Study Notes for House {activeBhava.number}
                </span>
                {noteStatus && <span className="text-[11px] font-semibold text-emerald-700">{noteStatus}</span>}
              </div>
              <textarea
                rows={2}
                value={userNotes[`bhava-${activeBhava.number}`] || ""}
                onChange={(e) =>
                  setUserNotes((prev) => ({
                    ...prev,
                    [`bhava-${activeBhava.number}`]: e.target.value,
                  }))
                }
                placeholder="Write your contemplative insights, personal chart reflections, or mentor notes..."
                className="w-full p-2.5 rounded-lg bg-white border border-[#ede5d6] text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#13382c]"
              />
              <button
                onClick={() =>
                  handleSaveNote(`bhava-${activeBhava.number}`, `House ${activeBhava.number} (${activeBhava.sanskritName})`, "BHAVA")
                }
                className="px-3 py-1.5 rounded-lg bg-[#13382c] text-white text-xs font-semibold hover:bg-[#1a4a3b] transition cursor-pointer"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 3: 9 GRAHAS (NAVAGRAHAS) */}
      {/* ==================================================================== */}
      {activeCategory === "grahas" && (
        <div className="space-y-6">
          {/* Graha selector bar */}
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
            {filteredGrahas.map((graha) => {
              const isSelected = activeGraha.id === graha.id;
              return (
                <button
                  key={graha.id}
                  onClick={() => setSelectedGrahaId(graha.id)}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-between ${
                    isSelected
                      ? "bg-[#13382c] border-[#13382c] text-white shadow-xs"
                      : "bg-white border-[#ede5d6] hover:border-stone-400 text-stone-800"
                  }`}
                >
                  <span className="text-[10px] font-serif font-sanskrit opacity-90 block">
                    {graha.devanagari}
                  </span>
                  <span className="text-xs font-bold block mt-0.5 font-serif">
                    {graha.sanskritName.split(" ")[0]}
                  </span>
                  <span className="text-[10px] opacity-75 truncate block">
                    {graha.englishName.replace("The ", "")}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Graha Comprehensive Detail Card */}
          <div className="bg-white rounded-2xl border border-[#ede5d6] p-6 space-y-6">
            {/* Top overview */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#ede5d6]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#faf5ec] text-[#c4903c] border border-[#ede5d6] uppercase tracking-wider">
                    {activeGraha.nature}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-700">
                    Aspects: {activeGraha.aspects}
                  </span>
                </div>
                <h3 className="text-2xl font-bold font-serif text-stone-900 mt-1 flex items-center gap-2">
                  <span>{activeGraha.sanskritName}</span>
                  <span className="text-lg text-stone-400 font-normal">({activeGraha.devanagari})</span>
                  <span className="text-base text-stone-600 font-normal">— {activeGraha.englishName}</span>
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">{activeGraha.symbolism}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleBookmark(`graha-${activeGraha.id}`)}
                  className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                    bookmarkedItems[`graha-${activeGraha.id}`]
                      ? "bg-[#faf5ec] border-[#c4903c] text-[#c4903c]"
                      : "bg-white border-[#ede5d6] text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{bookmarkedItems[`graha-${activeGraha.id}`] ? "Saved" : "Save"}</span>
                </button>
              </div>
            </div>

            {/* Astronomical vs Astrological distinction */}
            <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/80 text-xs text-sky-950 space-y-1">
              <span className="font-bold text-sky-900 uppercase text-[10px] tracking-wider block">
                Astronomical Physical Nature
              </span>
              <p className="leading-relaxed">{activeGraha.astronomicalNature}</p>
            </div>

            {/* Dignity & Planetary Friendship Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              {/* Dignity Table */}
              <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#ede5d6] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c4903c] block">
                  Dignities (Classical Avasthas)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-stone-500 font-bold block">Exaltation (Uchcha):</span>
                    <span className="text-stone-900 font-medium">{activeGraha.dignities.exaltation}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-bold block">Debilitation (Neecha):</span>
                    <span className="text-stone-900 font-medium">{activeGraha.dignities.debilitation}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-bold block">Moolatrikona:</span>
                    <span className="text-stone-900 font-medium">{activeGraha.dignities.moolatrikona}</span>
                  </div>
                  <div>
                    <span className="text-stone-500 font-bold block">Own Sign (Swakshetra):</span>
                    <span className="text-stone-900 font-medium">{activeGraha.dignities.ownSign}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-stone-200/60">
                  <span className="text-stone-500 font-bold">Directional Strength (Digbala): </span>
                  <span className="text-stone-900">{activeGraha.dignities.directionalStrength}</span>
                </div>
              </div>

              {/* Natural Planetary Friendships */}
              <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#ede5d6] space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700 block">
                  Natural Relationships (Naisargika Sambandha)
                </span>
                <div className="space-y-1.5">
                  <div>
                    <span className="text-emerald-700 font-bold">Friends (Mitra): </span>
                    <span className="text-stone-800">{activeGraha.relationships.friends.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-stone-600 font-bold">Neutral (Sama): </span>
                    <span className="text-stone-800">{activeGraha.relationships.neutral.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-rose-700 font-bold">Enemies (Shatru): </span>
                    <span className="text-stone-800">{activeGraha.relationships.enemies.join(", ")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Core Significations */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Core Significations (Karakatvas)
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700">
                {activeGraha.coreSignifications.map((sig, i) => (
                  <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-stone-50 border border-stone-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c4903c] shrink-0 mt-1.5" />
                    <span>{sig}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* House Placements Summary */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#13382c]">
                Expression Across House Placements
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-[#ede5d6] bg-white space-y-1">
                  <span className="font-bold text-stone-900 block">In Kendras (1, 4, 7, 10):</span>
                  <span className="text-stone-600 leading-relaxed block">{activeGraha.houseInfluenceSummary.inKendras}</span>
                </div>
                <div className="p-3 rounded-xl border border-[#ede5d6] bg-white space-y-1">
                  <span className="font-bold text-stone-900 block">In Trikonas (1, 5, 9):</span>
                  <span className="text-stone-600 leading-relaxed block">{activeGraha.houseInfluenceSummary.inTrikonas}</span>
                </div>
                <div className="p-3 rounded-xl border border-[#ede5d6] bg-white space-y-1">
                  <span className="font-bold text-stone-900 block">In Dusthanas (6, 8, 12):</span>
                  <span className="text-stone-600 leading-relaxed block">{activeGraha.houseInfluenceSummary.inDusthanas}</span>
                </div>
              </div>
            </div>

            {/* Chart Context and Misconceptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                  Whole Chart Context (Mandatory Principle)
                </span>
                <p className="text-emerald-950 leading-relaxed">{activeGraha.holisticChartContext}</p>
                <p className="text-[11px] text-emerald-800 pt-1">
                  <strong>Citation:</strong> {activeGraha.classicalCitations}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                  Misconceptions Debunked
                </span>
                {activeGraha.commonMisconceptions.map((misc, idx) => (
                  <p key={idx} className="text-amber-950 leading-relaxed text-[11px]">
                    • {misc}
                  </p>
                ))}
              </div>
            </div>

            {/* User Note on Graha */}
            <div className="p-4 rounded-xl bg-stone-50 border border-[#ede5d6] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700">
                  Your Personal Reflection & Study Notes for {activeGraha.sanskritName}
                </span>
                {noteStatus && <span className="text-[11px] font-semibold text-emerald-700">{noteStatus}</span>}
              </div>
              <textarea
                rows={2}
                value={userNotes[`graha-${activeGraha.id}`] || ""}
                onChange={(e) =>
                  setUserNotes((prev) => ({
                    ...prev,
                    [`graha-${activeGraha.id}`]: e.target.value,
                  }))
                }
                placeholder={`Contemplative notes, Dasha insights, or placement observations for ${activeGraha.sanskritName}...`}
                className="w-full p-2.5 rounded-lg bg-white border border-[#ede5d6] text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#13382c]"
              />
              <button
                onClick={() =>
                  handleSaveNote(`graha-${activeGraha.id}`, `${activeGraha.sanskritName} (${activeGraha.englishName})`, "GRAHA")
                }
                className="px-3 py-1.5 rounded-lg bg-[#13382c] text-white text-xs font-semibold hover:bg-[#1a4a3b] transition cursor-pointer"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 4: 12 RASHIS */}
      {/* ==================================================================== */}
      {activeCategory === "rashis" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {RASHIS_KNOWLEDGE.map((rashi) => {
              const isSelected = activeRashi.number === rashi.number;
              return (
                <button
                  key={rashi.number}
                  onClick={() => setSelectedRashiNumber(rashi.number)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#13382c] border-[#13382c] text-white shadow-xs"
                      : "bg-white border-[#ede5d6] hover:border-stone-400 text-stone-800"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold opacity-80">{rashi.number}.</span>
                    <span className="text-xs font-sanskrit opacity-90">{rashi.devanagari}</span>
                  </div>
                  <span className="text-xs font-bold block mt-1 font-serif">{rashi.name}</span>
                  <span className="text-[10px] opacity-75">{rashi.english}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-[#ede5d6] p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#ede5d6]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#faf5ec] text-[#c4903c] border border-[#ede5d6]">
                    Sign {activeRashi.number}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-700">
                    {activeRashi.element}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-700">
                    {activeRashi.modality}
                  </span>
                </div>
                <h3 className="text-2xl font-bold font-serif text-stone-900 mt-1">
                  {activeRashi.name} ({activeRashi.devanagari}) — {activeRashi.english}
                </h3>
                <p className="text-xs text-stone-600 mt-0.5 font-medium">
                  Ruler: {activeRashi.ruler} • Symbol: {activeRashi.symbol} • Body Part: {activeRashi.bodyPart}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#faf8f4] border border-[#ede5d6] text-xs text-right">
                <span className="text-stone-500 block text-[10px] font-bold uppercase">Archetype</span>
                <span className="font-serif font-bold text-stone-900">{activeRashi.archetype}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 block">
                  Balanced Expression
                </span>
                <p className="text-emerald-950 leading-relaxed">{activeRashi.balancedExpression}</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                  Unbalanced Shadow Expression
                </span>
                <p className="text-amber-950 leading-relaxed">{activeRashi.unbalancedExpression}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 5: 27 NAKSHATRAS */}
      {/* ==================================================================== */}
      {activeCategory === "nakshatras" && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-9 gap-2">
            {filteredNakshatras.map((nak) => {
              const isSelected = activeNakshatra.number === nak.number;
              return (
                <button
                  key={nak.number}
                  onClick={() => setSelectedNakshatraNumber(nak.number)}
                  className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-[#13382c] border-[#13382c] text-white shadow-xs"
                      : "bg-white border-[#ede5d6] hover:border-stone-400 text-stone-800"
                  }`}
                >
                  <span className="text-[10px] opacity-75">{nak.number}</span>
                  <span className="text-xs font-bold font-serif truncate mt-0.5">{nak.name}</span>
                  <span className="text-[10px] font-sanskrit opacity-80">{nak.devanagari}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-[#ede5d6] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ede5d6]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#faf5ec] text-[#c4903c] border border-[#ede5d6]">
                    Nakshatra {activeNakshatra.number} of 27
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-700">
                    Celestial Span: {activeNakshatra.span}
                  </span>
                </div>
                <h3 className="text-2xl font-bold font-serif text-stone-900 mt-1 flex items-center gap-2">
                  <span>{activeNakshatra.name}</span>
                  <span className="text-lg text-stone-400 font-normal">({activeNakshatra.devanagari})</span>
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Deity: <strong>{activeNakshatra.deity}</strong> • Ruler: <strong>{activeNakshatra.rulingPlanet}</strong> • Symbol: <strong>{activeNakshatra.symbol}</strong>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#ede5d6] text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c4903c] block">
                Primary Psychological & Spiritual Qualities
              </span>
              <p className="text-stone-700 leading-relaxed">{activeNakshatra.primaryQualities}</p>
            </div>

            {/* 4 Padas breakdown */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-700 block">
                The Four Padas (3°20' Navamsha Segments)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {activeNakshatra.padas.map((p) => (
                  <div key={p.pada} className="p-3.5 rounded-xl border border-[#ede5d6] bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#13382c]">Pada {p.pada}</span>
                      <span className="text-[11px] font-medium text-stone-500">Navamsha: {p.navamsha}</span>
                    </div>
                    <span className="text-[11px] text-[#c4903c] font-bold block">Ruler: {p.ruler}</span>
                    <p className="text-stone-600 leading-relaxed text-[11px]">{p.quality}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SECTION 6: 5 LIMBS OF PANCHANG */}
      {/* ==================================================================== */}
      {activeCategory === "panchang" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#ede5d6] p-6 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#c4903c]">
              {PANCHANG_KNOWLEDGE.subtitle}
            </span>
            <h3 className="text-xl font-bold font-serif text-stone-900">
              {PANCHANG_KNOWLEDGE.title}
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed whitespace-pre-line">
              {PANCHANG_KNOWLEDGE.philosophicalContext}
            </p>
          </div>

          <div className="space-y-4">
            {PANCHANG_KNOWLEDGE.limbs.map((limb, idx) => (
              <div key={limb.limb} className="bg-white rounded-2xl border border-[#ede5d6] p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#faf5ec] text-[#c4903c] border border-[#ede5d6] flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <h4 className="text-base font-bold font-serif text-stone-900">
                      {limb.limb} ({limb.sanskrit})
                    </h4>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#faf8f4] text-stone-700 border border-[#ede5d6]">
                    Element: {limb.elementAssociation}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                    <span className="font-bold text-stone-900 block text-[11px]">
                      Astronomical Calculation Method:
                    </span>
                    <p className="text-stone-700 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                      {limb.calculationMethod}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#faf5ec] border border-[#ede5d6] space-y-1">
                    <span className="font-bold text-stone-900 block text-[11px]">
                      Traditional Role in Timing & Contemplation (Muhurta):
                    </span>
                    <p className="text-stone-700 leading-relaxed">{limb.traditionalUsage}</p>
                    {limb.examples && (
                      <div className="pt-2 border-t border-[#ede5d6] text-[11px] text-stone-600">
                        <strong>Examples: </strong>
                        {Array.isArray(limb.examples) ? limb.examples.join("; ") : limb.examples}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
