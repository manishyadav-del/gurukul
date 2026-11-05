"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Volume2,
  Bookmark,
  Check,
  BookOpen,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Save,
  HelpCircle,
  Compass,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import { playBijaMantraTone, CHAKRA_FREQUENCIES } from "../../lib/audio/spiritualAudio.js";

// Canonical visual geometry for the Seven Chakras
const CHAKRA_VISUAL_STYLES = {
  muladhara: {
    color: "#b91c1c",
    activeGlow: "rgba(185, 28, 28, 0.4)",
    element: "Earth (Prithvi)",
    bgBadge: "bg-red-50 text-red-900 border-red-200",
    shape: "Square (Dharani Mandala)",
  },
  svadhisthana: {
    color: "#ea580c",
    activeGlow: "rgba(234, 88, 12, 0.4)",
    element: "Water (Apas)",
    bgBadge: "bg-orange-50 text-orange-900 border-orange-200",
    shape: "Crescent Moon",
  },
  manipura: {
    color: "#ca8a04",
    activeGlow: "rgba(202, 138, 4, 0.4)",
    element: "Fire (Tejas)",
    bgBadge: "bg-amber-50 text-amber-900 border-amber-200",
    shape: "Inverted Triangle",
  },
  anahata: {
    color: "#15803d",
    activeGlow: "rgba(21, 128, 61, 0.4)",
    element: "Air (Vayu)",
    bgBadge: "bg-emerald-50 text-emerald-900 border-emerald-200",
    shape: "Hexagram (Shatkona)",
  },
  vishuddha: {
    color: "#0369a1",
    activeGlow: "rgba(3, 105, 161, 0.4)",
    element: "Ether (Akasha)",
    bgBadge: "bg-sky-50 text-sky-900 border-sky-200",
    shape: "Full Moon & Circle",
  },
  ajna: {
    color: "#4338ca",
    activeGlow: "rgba(67, 56, 202, 0.4)",
    element: "Mind (Manas / Mahat)",
    bgBadge: "bg-indigo-50 text-indigo-900 border-indigo-200",
    shape: "Two-Petaled Winged Oval",
  },
  sahasrara: {
    color: "#7e22ce",
    activeGlow: "rgba(126, 34, 206, 0.4)",
    element: "Pure Consciousness (Brahman)",
    bgBadge: "bg-purple-50 text-purple-900 border-purple-200",
    shape: "Thousand-Petaled Lotus",
  },
};

export default function InteractiveChakraStudio({
  chakras = [],
  activeChakraSlug,
  onSelectChakra,
  completedMap = {},
  bookmarkedMap = {},
  reflectionNotes = {},
  onToggleComplete,
  onToggleBookmark,
  onSaveNotes,
  language = "en",
}) {
  const isHi = language === "hi" || language === "hindi";
  const [activeTab, setActiveTab] = useState("overview"); // overview | symbolism | anatomy | contemplation | notes
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [localNote, setLocalNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSaveStatus, setNoteSaveStatus] = useState("");

  const activeChakra =
    chakras.find((c) => c.slug === activeChakraSlug) || chakras[0] || {};
  const chakraId = (activeChakra.id || "muladhara").toLowerCase();
  const style = CHAKRA_VISUAL_STYLES[chakraId] || CHAKRA_VISUAL_STYLES.muladhara;

  // Handle note change when switching chakras
  const currentSavedNote = reflectionNotes[activeChakra.slug] || "";

  // Play Bija Mantra Sound
  const handlePlayBijaMantra = () => {
    setIsPlayingAudio(true);
    playBijaMantraTone(chakraId, 3.0);
    setTimeout(() => setIsPlayingAudio(false), 3000);
  };

  // Save Reflection Notes
  const handleSaveReflection = async () => {
    if (!onSaveNotes) return;
    setIsSavingNote(true);
    setNoteSaveStatus("");
    try {
      await onSaveNotes(activeChakra.slug, localNote || currentSavedNote);
      setNoteSaveStatus("Saved successfully to your spiritual journal!");
      setTimeout(() => setNoteSaveStatus(""), 3500);
    } catch {
      setNoteSaveStatus("Failed to save note.");
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#ede5d6]">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#c4903c] font-semibold">
            {isHi ? "षट्चक्र निरूपण एवं साधना" : "Classical Seven Chakra Exploration"}
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mt-0.5">
            Interactive Chakra Studio
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-500 font-sans">
            {Object.values(completedMap).filter(Boolean).length} / {chakras.length} {isHi ? "अध्ययन पूर्ण" : "Studied"}
          </span>
          <div className="w-24 h-2 rounded-full bg-stone-200 overflow-hidden">
            <div
              className="h-full bg-emerald-700 transition-all duration-300"
              style={{
                width: `${Math.round((Object.values(completedMap).filter(Boolean).length / Math.max(chakras.length, 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Left Column Spine Visualization + Right Column Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* --- LEFT: INTERACTIVE MERUDANDA / SPINAL COLUMN VISUALIZATION --- */}
        <div className="lg:col-span-4 bg-gradient-to-b from-stone-900 via-[#13382c] to-stone-950 rounded-3xl p-6 text-white shadow-md border border-[#1f5442] flex flex-col items-center">
          <span className="text-[11px] font-mono tracking-widest uppercase text-amber-300/80 mb-1">
            {isHi ? "मेरुदण्ड एवं सूक्ष्म चक्र" : "Merudanda • Subtle Axis"}
          </span>
          <span className="text-xs text-stone-300 text-center mb-6 max-w-xs">
            {isHi
              ? "किसी भी चक्र पर क्लिक करके शास्त्रीय विवरण एवं मन्त्र ध्वनि का अनुभव करें।"
              : "Select any center along the spinal axis to explore classical shastric attributes."}
          </span>

          {/* Central Vertical Energy Channel with 7 Interactive Chakras */}
          <div className="relative w-full max-w-[240px] flex flex-col items-center py-4">
            {/* The Central Sushumna Golden Conduit Line */}
            <div className="absolute top-4 bottom-4 w-1 bg-gradient-to-b from-purple-400 via-emerald-400 to-amber-500 rounded-full opacity-60 shadow-[0_0_12px_rgba(251,191,36,0.6)]" />

            {/* Ascending Chakras from Sahasrara (Top) down to Muladhara (Base) */}
            <div className="flex flex-col-reverse gap-5 w-full z-10">
              {chakras.map((chakra) => {
                const cId = (chakra.id || "").toLowerCase();
                const isSelected = activeChakra.slug === chakra.slug;
                const isCompleted = Boolean(completedMap[chakra.slug]);
                const cStyle = CHAKRA_VISUAL_STYLES[cId] || CHAKRA_VISUAL_STYLES.muladhara;

                return (
                  <button
                    key={chakra.slug}
                    onClick={() => onSelectChakra(chakra.slug)}
                    className={`w-full py-2.5 px-3 rounded-2xl transition-all duration-200 flex items-center justify-between group cursor-pointer border ${
                      isSelected
                        ? "bg-white/20 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.4)] translate-x-1"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Geometric Chakra Lotus Icon / Glowing Node */}
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-transform duration-200 group-hover:scale-110"
                        style={{
                          backgroundColor: cStyle.color,
                          boxShadow: isSelected ? `0 0 16px ${cStyle.color}` : "none",
                        }}
                      >
                        <span className="text-white font-mono text-[11px] drop-shadow-xs">
                          {chakra.bijaMantra?.split(" ")[0] || chakra.number}
                        </span>
                      </div>

                      <div className="text-left">
                        <span className="font-serif font-bold text-xs sm:text-sm text-white block leading-tight">
                          {chakra.sanskritName}
                        </span>
                        <span className="text-[10px] text-stone-300 font-sans block opacity-80">
                          {chakra.englishName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-amber-300/80 hidden sm:inline">
                        #{chakra.number}
                      </span>
                      {isCompleted && (
                        <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-[10px] text-stone-400 text-center italic mt-4 pt-3 border-t border-white/10 max-w-xs leading-relaxed">
            {isHi
              ? "शास्त्रीय मर्यादा: चक्र सूक्ष्म ध्यान के प्रतीक हैं, भौतिक शल्य अंग नहीं।"
              : "Classical Principle: Chakras are subtle contemplative loci (Adharas), not physical surgical organs."}
          </p>
        </div>

        {/* --- RIGHT: RICH CHAKRA DETAIL STUDIO PANEL --- */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#ede5d6] p-6 sm:p-7 shadow-xs space-y-6">
          {/* Chakra Header & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#ede5d6]">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${style.bgBadge}`}>
                  Chakra {activeChakra.number} • {activeChakra.element}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-700">
                  Petals: {activeChakra.petalsCount}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-700">
                  Geometry: {style.shape}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 flex items-center gap-2.5 flex-wrap">
                <span>{activeChakra.sanskritName}</span>
                <span className="text-base text-stone-500 font-sans font-normal">
                  ({activeChakra.transliteration})
                </span>
                <span className="text-base text-[#13382c] font-sans font-semibold">
                  — {activeChakra.englishName}
                </span>
              </h3>

              <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                <strong>{isHi ? "शास्त्रीय अर्थ:" : "Literal Meaning:"}</strong> {activeChakra.meaning} •{" "}
                <strong>{isHi ? "स्थान:" : "Location:"}</strong> {activeChakra.locationTraditional}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 self-start shrink-0">
              {/* Play Bija Sound */}
              <button
                onClick={handlePlayBijaMantra}
                disabled={isPlayingAudio}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition disabled:opacity-50 cursor-pointer"
                title="Resonate Bija Mantra Frequency"
              >
                <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? "animate-bounce" : ""}`} />
                <span>{isPlayingAudio ? "Sounding..." : `${activeChakra.bijaMantra}`}</span>
              </button>

              {/* Bookmark */}
              <button
                onClick={() => onToggleBookmark(activeChakra)}
                className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  bookmarkedMap[activeChakra.slug]
                    ? "bg-amber-50 border-amber-300 text-amber-900"
                    : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
                title="Bookmark for review"
              >
                <Bookmark className="w-3.5 h-3.5" />
              </button>

              {/* Complete / Studied */}
              <button
                onClick={() => onToggleComplete(activeChakra)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  completedMap[activeChakra.slug]
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                    : "bg-white border-stone-300 text-stone-700 hover:bg-emerald-50 hover:text-emerald-800"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{completedMap[activeChakra.slug] ? "Studied ✓" : "Mark Studied"}</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation for Detailed Sections */}
          <div className="flex border-b border-[#ede5d6] gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: "overview", label: isHi ? "अवलोकन एवं अर्थ" : "Overview & Meaning" },
              { id: "symbolism", label: isHi ? "शास्त्रीय प्रतीक" : "Traditional Symbolism" },
              { id: "anatomy", label: isHi ? "नाड़ी एवं ग्रन्थि" : "Subtle Anatomy & Granthis" },
              { id: "contemplation", label: isHi ? "मार्गदर्शित भावना" : "Guided Contemplation" },
              { id: "notes", label: isHi ? "साधना डायरी" : "Personal Notes" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#13382c] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] space-y-2">
                <span className="font-serif font-bold text-stone-900 block text-base">
                  {isHi ? "शास्त्रीय परिचय (Classical Introduction)" : "Classical Introduction"}
                </span>
                <p>{isHi ? activeChakra.introduction?.overviewHi : activeChakra.introduction?.overviewEn}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white border border-[#ede5d6] space-y-1.5">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#c4903c] block">
                    {isHi ? "चेतना सोपान में स्थान" : "Place in Consciousness"}
                  </span>
                  <p className="text-xs text-stone-600">
                    {activeChakra.introduction?.grossToSubtleFramework || activeChakra.introduction?.frameworkPlace}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#ede5d6] space-y-1.5">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#13382c] block">
                    {isHi ? "शास्त्रीय बनाम आधुनिक भेद" : "Traditional vs. Modern Interpretation"}
                  </span>
                  <p className="text-xs text-stone-600">
                    {activeChakra.introduction?.traditionalVersusModern || activeChakra.introduction?.traditionalVsModern}
                  </p>
                </div>
              </div>

              {/* Digital Library & AI Research Assistant Action */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-serif font-bold text-amber-950 text-xs sm:text-sm block">
                    Explore Original Treatise in Gurukul Digital Library
                  </span>
                  <span className="text-xs text-amber-900/80">
                    Read verses in Shat-Chakra-Nirupana or consult the AI Research Assistant.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/research?q=${encodeURIComponent(activeChakra.sanskritName + " " + activeChakra.englishName)}`}
                    className="px-3 py-1.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3a] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ask AI Assistant</span>
                  </Link>
                  <Link
                    href="/library"
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-amber-300 text-stone-800 text-xs font-semibold transition flex items-center gap-1"
                  >
                    <span>Digital Library</span>
                    <ExternalLink className="w-3 h-3 text-stone-500" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRADITIONAL SYMBOLISM */}
          {activeTab === "symbolism" && (
            <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] space-y-1.5">
                  <span className="font-serif font-bold text-stone-900 text-sm block">
                    {isHi ? "कमल पंखुड़ियाँ एवं मातृका वर्ण" : "Lotus Petals & Matrika Syllables"}
                  </span>
                  <p className="text-xs text-stone-600 mb-2">
                    {activeChakra.symbolism?.lotusDescription || `${activeChakra.petalsCount} petals inscribed with Sanskrit seed letters.`}
                  </p>
                  {Array.isArray(activeChakra.petalsLetters) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {activeChakra.petalsLetters.map((l, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-[#ede5d6] font-sanskrit text-xs font-bold text-[#13382c]">
                          {l}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] space-y-1.5">
                  <span className="font-serif font-bold text-stone-900 text-sm block">
                    {isHi ? "बीज मन्त्र एवं नाद" : "Bija Mantra Resonance"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold font-serif text-[#c4903c]">
                      {activeChakra.bijaMantra}
                    </span>
                    <button
                      onClick={handlePlayBijaMantra}
                      className="p-1.5 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 transition"
                      title="Play Resonant Tone"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-stone-600">
                    {activeChakra.symbolism?.bijaSignificance || `Resonant acoustic seed sound aligning awareness with ${activeChakra.element}.`}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] space-y-1.5">
                  <span className="font-serif font-bold text-stone-900 text-sm block">
                    {isHi ? "यन्त्र एवं अधिष्ठातृ देवता" : "Yantra & Presiding Archetypes"}
                  </span>
                  <p className="text-xs text-stone-600">
                    <strong>Deity:</strong> {activeChakra.deityTraditional}
                  </p>
                  <p className="text-xs text-stone-600">
                    <strong>Symbolic Animal:</strong> {activeChakra.symbolicAnimal}
                  </p>
                  <p className="text-xs text-stone-600">
                    <strong>Yantra Shape:</strong> {activeChakra.yantraShape}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] space-y-1.5">
                  <span className="font-serif font-bold text-stone-900 text-sm block">
                    {isHi ? "पारंपरिक रंग व्यवस्था" : "Traditional Sacred Colors"}
                  </span>
                  <p className="text-xs text-stone-600">
                    <strong>Traditional Shastra:</strong> {activeChakra.colorTraditional}
                  </p>
                  <p className="text-xs text-stone-600">
                    <strong>Modern Palette:</strong> {activeChakra.colorModern}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SUBTLE ANATOMY & GRANTHIS */}
          {activeTab === "anatomy" && (
            <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <span className="font-serif font-bold text-amber-950 text-base block">
                  Associated Granthi (Spiritual Knot)
                </span>
                <p className="text-xs text-stone-700">
                  {activeChakra.granthisAssociated || "No primary granthi located directly at this center; functions as a conduit for pranic alignment."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] space-y-2">
                <span className="font-serif font-bold text-stone-900 text-sm block">
                  Relationship with the Three Nadis (Ida, Pingala, Sushumna)
                </span>
                <p className="text-xs text-stone-600">
                  {activeChakra.philosophy?.subtleAnatomyContext ||
                    "This center represents a pivotal junction where the spiraling lunar (Ida) and solar (Pingala) nadis intersect around the central spiritual conduit (Sushumna)."}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-stone-600 space-y-1.5">
                <div className="flex items-center gap-1.5 text-stone-800 font-bold">
                  <Info className="w-3.5 h-3.5 text-stone-700" />
                  <span>Important Distinction on Subtle vs Physical Anatomy</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Classical Yogic and Tantric treatises describe chakras as internal visualization mandalas (Bhavana) cultivated during meditation, not as physical anatomical organs or verified medical diagnostic categories.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: GUIDED CONTEMPLATION */}
          {activeTab === "contemplation" && (
            <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
              {activeChakra.guidedLearning?.gentleExercise && (
                <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-emerald-950 text-base">
                      {activeChakra.guidedLearning.gentleExercise.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      {activeChakra.guidedLearning.gentleExercise.duration}
                    </span>
                  </div>

                  <p className="text-xs text-emerald-900/90">
                    {activeChakra.guidedLearning.gentleExercise.description}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-emerald-200/80">
                    <span className="text-xs font-bold text-emerald-950 block">Step-by-Step Practice:</span>
                    {activeChakra.guidedLearning.gentleExercise.steps?.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                        <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>

                  {activeChakra.guidedLearning.gentleExercise.stopInstructions && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>
                        <strong>Safety Signal:</strong> {activeChakra.guidedLearning.gentleExercise.stopInstructions}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Reflection Questions */}
              {activeChakra.guidedLearning?.reflectionPrompts && (
                <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] space-y-2">
                  <span className="font-serif font-bold text-stone-900 text-sm block">
                    Everyday Life Contemplation Prompts
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-xs text-stone-600">
                    {activeChakra.guidedLearning.reflectionPrompts.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PERSONAL REFLECTION NOTES */}
          {activeTab === "notes" && (
            <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <div className="space-y-1.5">
                <label className="font-serif font-bold text-stone-900 text-sm block">
                  Personal Contemplation & Sadhana Journal
                </label>
                <p className="text-xs text-stone-500">
                  Record personal insights, reflections on grounding, or mindful observations during contemplation on {activeChakra.sanskritName}.
                </p>
              </div>

              <textarea
                value={localNote !== "" ? localNote : currentSavedNote}
                onChange={(e) => setLocalNote(e.target.value)}
                placeholder="Write your personal contemplative reflections here..."
                rows={5}
                className="w-full p-3.5 rounded-2xl bg-white border border-[#ede5d6] text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#13382c]"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={handleSaveReflection}
                  disabled={isSavingNote}
                  className="px-4 py-2 rounded-xl bg-[#13382c] hover:bg-[#1a4a3a] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isSavingNote ? "Saving Note..." : "Save Reflection"}</span>
                </button>

                {noteSaveStatus && (
                  <span className="text-xs font-medium text-emerald-700 animate-fade-in">
                    {noteSaveStatus}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
