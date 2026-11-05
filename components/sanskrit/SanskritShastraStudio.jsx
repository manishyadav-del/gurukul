"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Feather,
  Sparkles,
  Layers,
  Search,
  Globe,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  GraduationCap,
  Eye,
  EyeOff,
  Flame,
  ArrowRight,
  Columns,
  Share2,
} from "lucide-react";

export default function SanskritShastraStudio({ initialVerseId = "bphs-1-1", initialLanguage = "en" }) {
  const [language, setLanguage] = useState(initialLanguage);
  const isHi = language === "hi" || language === "hindi";

  // Data states
  const [verseList, setVerseList] = useState([]);
  const [selectedVerseId, setSelectedVerseId] = useState(initialVerseId);
  const [verseAnalysis, setVerseAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Custom text input mode
  const [customInputMode, setCustomInputMode] = useState(false);
  const [customText, setCustomText] = useState("");
  const [analyzingCustom, setAnalyzingCustom] = useState(false);

  // Studio Active Tab
  const [activeTab, setActiveTab] = useState("anvaya"); // "anvaya" | "chhandas" | "sandhi" | "samasa" | "dhatu" | "crossText" | "learn"

  // Learning Mode State
  const [revealedWords, setRevealedWords] = useState(new Set());
  const [revealedAll, setRevealedAll] = useState(false);
  const [quizSelection, setQuizSelection] = useState({});

  // Fetch list of canonical verses
  const fetchVerseList = useCallback(async () => {
    try {
      const res = await fetch("/api/sanskrit/verses");
      const data = await res.json();
      if (res.ok && data.verses) {
        setVerseList(data.verses);
      }
    } catch (err) {
      console.error("Failed to load verse catalog:", err);
    }
  }, []);

  // Fetch detailed verse analysis
  const fetchVerseAnalysis = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sanskrit/verses/${id}`);
      const data = await res.json();
      if (!res.ok || !data.verse) {
        throw new Error(data.error || "Failed to load Sanskrit analysis");
      }
      setVerseAnalysis(data.verse);
      setRevealedWords(new Set());
      setRevealedAll(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVerseList();
  }, [fetchVerseList]);

  useEffect(() => {
    if (!customInputMode && selectedVerseId) {
      fetchVerseAnalysis(selectedVerseId);
    }
  }, [selectedVerseId, customInputMode, fetchVerseAnalysis]);

  // Handle Custom Text Analysis
  const handleAnalyzeCustomText = async (e) => {
    e.preventDefault();
    if (!customText.trim()) return;

    setAnalyzingCustom(true);
    setError(null);
    try {
      const res = await fetch("/api/sanskrit/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          verseText: customText.trim(),
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.analysis) {
        throw new Error(data.error || "Custom verse analysis failed");
      }
      setVerseAnalysis(data.analysis);
      setRevealedWords(new Set());
      setRevealedAll(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzingCustom(false);
    }
  };

  // Toggle reveal in learning mode
  const toggleWordReveal = (index) => {
    setRevealedWords((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleToggleRevealAll = () => {
    if (revealedAll) {
      setRevealedWords(new Set());
      setRevealedAll(false);
    } else {
      const allIndices = new Set(verseAnalysis?.anvaya?.map((_, i) => i) || []);
      setRevealedWords(allIndices);
      setRevealedAll(true);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden flex flex-col space-y-0">
      {/* 1. Studio Header & Verse Selector */}
      <div className="bg-gradient-to-r from-[#13382c] via-[#1a4a3b] to-[#13382c] text-amber-50 p-6 sm:p-8 border-b border-[#c4903c]/30 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#c4903c] text-xs font-semibold uppercase tracking-wider mb-1">
              <Feather className="w-4 h-4" />
              <span>{isHi ? "उन्नत संस्कृत शास्त्र प्रज्ञा" : "Advanced Sanskrit Shastra Intelligence"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              {verseAnalysis?.source || "Sanskrit Shastra Studio"}
            </h2>
            <p className="text-xs text-amber-200/80 mt-1">
              {verseAnalysis ? `${verseAnalysis.author} • ${verseAnalysis.chapter} (${verseAnalysis.verseNumber})` : "Morphological, Metrical, & Syntactic Intelligence"}
            </p>
          </div>

          {/* Action Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setLanguage(isHi ? "en" : "hi")}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-amber-200 border border-white/15 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#c4903c]" />
              <span>{isHi ? "English" : "हिन्दी"}</span>
            </button>

            <button
              onClick={() => {
                setCustomInputMode(!customInputMode);
                if (!customInputMode) setCustomText("");
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#c4903c] hover:bg-[#d4a359] text-[#13382c] font-bold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{customInputMode ? (isHi ? "ग्रंथ सूची पर लौटें" : "Catalog Verses") : (isHi ? "अन्य श्लोक जांचें" : "Analyze Custom Verse")}</span>
            </button>
          </div>
        </div>

        {/* Catalog Selector Dropdown OR Custom Input Bar */}
        {!customInputMode ? (
          <div className="flex items-center gap-2 bg-black/25 p-2 rounded-2xl border border-white/10 max-w-xl">
            <BookOpen className="w-4 h-4 text-[#c4903c] shrink-0 ml-1" />
            <select
              value={selectedVerseId}
              onChange={(e) => setSelectedVerseId(e.target.value)}
              className="w-full bg-transparent text-xs text-white focus:outline-none cursor-pointer font-medium"
            >
              {verseList.map((v) => (
                <option key={v.id} value={v.id} className="text-stone-900 bg-white">
                  {v.source} ({v.verseNumber}) — {v.subject} [{v.chhanda}]
                </option>
              ))}
            </select>
          </div>
        ) : (
          <form onSubmit={handleAnalyzeCustomText} className="space-y-2 bg-black/25 p-4 rounded-2xl border border-white/10">
            <label className="block text-[11px] text-amber-200 font-semibold">
              {isHi ? "देवनागरी संस्कृत श्लोक यहाँ दर्ज करें:" : "Enter Devanagari Sanskrit verse for real-time morphological analysis:"}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="उदा. ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं..."
                className="flex-1 px-3 py-2 rounded-xl bg-white/10 text-white placeholder-amber-200/40 text-xs focus:outline-none focus:ring-2 focus:ring-[#c4903c]"
              />
              <button
                type="submit"
                disabled={analyzingCustom}
                className="px-4 py-2 bg-[#c4903c] text-[#13382c] font-bold text-xs rounded-xl hover:bg-[#d4a359] transition flex items-center gap-1.5 shrink-0"
              >
                {analyzingCustom && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{isHi ? "विश्लेषण करें" : "Analyze"}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Primary Verse Display Box */}
      {verseAnalysis && (
        <div className="p-6 sm:p-8 bg-[#fcfaf5] border-b border-stone-200/80 text-center space-y-3">
          <p className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-stone-900 leading-relaxed whitespace-pre-line tracking-wide">
            {verseAnalysis.devanagari}
          </p>

          {verseAnalysis.iast && (
            <p className="text-xs sm:text-sm text-stone-600 font-mono italic max-w-3xl mx-auto whitespace-pre-line">
              {verseAnalysis.iast}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-semibold border border-amber-200">
              छन्द: {verseAnalysis.metricalScan?.identifiedMeter || "Vedic Meter"}
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-stone-100 text-stone-700 font-medium">
              कुल वर्ण: {verseAnalysis.metricalScan?.totalSyllables || 0} Aksharas
            </span>
            {verseAnalysis.isCanonical && (
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                ✓ Verified Canonical Source
              </span>
            )}
          </div>
        </div>
      )}

      {/* 3. Segmented Analysis Tabs */}
      <div className="bg-white p-2 border-b border-stone-200/80 overflow-x-auto flex items-center gap-1 px-4 sm:px-6">
        {[
          { id: "anvaya", label: isHi ? "अन्वय एवं पदच्छेद" : "Anvaya & Pada Cheda", icon: Columns },
          { id: "chhandas", label: isHi ? "छन्द परीक्षा (मात्रा/वर्ण)" : "Chhandas (Meter)", icon: Feather },
          { id: "sandhi", label: isHi ? "सन्धि विच्छेद" : "Sandhi Splitting", icon: Layers },
          { id: "samasa", label: isHi ? "समास विग्रह" : "Samasa Analysis", icon: BookOpen },
          { id: "dhatu", label: isHi ? "धातु व लकार रूप" : "Dhatu & Morphology", icon: Flame },
          { id: "crossText", label: isHi ? "शास्त्र समन्वय" : "Cross-Text References", icon: Sparkles },
          { id: "learn", label: isHi ? "संस्कृत अभ्यास (Learning)" : "Learning Mode", icon: GraduationCap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#13382c] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#c4903c]" : "text-stone-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Contents */}
      <div className="p-6 sm:p-8 bg-white min-h-[440px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-stone-500">
            <RefreshCw className="w-8 h-8 animate-spin text-[#c4903c] mb-3" />
            <span className="text-sm font-serif font-bold text-[#13382c]">
              {isHi ? "श्लोक का व्याकरणिक विश्लेषण हो रहा है..." : "Parsing Sanskrit morphology, Sandhi & Anvaya..."}
            </span>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <span className="text-xs sm:text-sm">{error}</span>
          </div>
        ) : !verseAnalysis ? (
          <div className="text-center py-20 text-stone-400 text-sm">No verse loaded.</div>
        ) : (
          <div>
            {/* TAB 1: ANVAYA & PADA CHEDA */}
            {activeTab === "anvaya" && (
              <div className="space-y-6">
                {/* Dual Views: Poetic Order vs Anvaya Prose Order */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Poetic Pada Cheda */}
                  <div className="p-5 rounded-2xl bg-[#fcfaf5] border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#13382c]">
                        {isHi ? "पदच्छेद (Word Separation)" : "Pada Cheda (Word Separation)"}
                      </span>
                      <span className="text-[10px] text-stone-400">Poetic Order</span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {verseAnalysis.padaCheda?.map((word, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 font-serif text-sm font-semibold text-stone-800 shadow-2xs"
                        >
                          {word}
                        </span>
                      ))}
                    </div>

                    <p className="text-[11px] text-stone-500 italic pt-2">
                      {isHi
                        ? "संधि-युक्त पदों को पृथक करके मूल पदों का दर्शन।"
                        : "Individual word components isolated from compound euphonic combinations."}
                    </p>
                  </div>

                  {/* Right: Syntactic Anvaya Order */}
                  <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                        {isHi ? "अन्वय (Syntactic Prose Re-ordering)" : "Syntactic Anvaya Order"}
                      </span>
                      <span className="text-[10px] text-amber-800/80 font-semibold">Prose Syntax</span>
                    </div>

                    <p className="text-sm font-serif font-bold text-stone-900 leading-relaxed">
                      {verseAnalysis.anvaya?.map((a) => a.word).join(" ")}
                    </p>

                    <p className="text-[11px] text-stone-600 italic pt-2">
                      {isHi
                        ? "कर्ता, कर्म, करण एवं क्रिया के अनुसार व्यवस्थित गद्यात्मक क्रम।"
                        : "Reorganized in logical subject-object-verb prose order for effortless comprehension."}
                    </p>
                  </div>
                </div>

                {/* Word-by-word Morphological Table */}
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#c4903c]" />
                    <span>{isHi ? "पद-परिचय एवं व्याकरण (Word-by-Word Analysis)" : "Word-by-Word Grammatical Analysis"}</span>
                  </h4>

                  <div className="overflow-x-auto rounded-2xl border border-stone-200">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#fcfaf5] border-b border-stone-200 text-stone-600 font-semibold">
                        <tr>
                          <th className="py-3 px-4">{isHi ? "संस्कृत पद" : "Sanskrit Word"}</th>
                          <th className="py-3 px-4">{isHi ? "व्याकरणिक परिचय" : "Grammatical Classification"}</th>
                          <th className="py-3 px-4">{isHi ? "हिन्दी भावार्थ" : "Hindi Meaning"}</th>
                          <th className="py-3 px-4">{isHi ? "अंग्रेजी अर्थ" : "English Meaning"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {verseAnalysis.anvaya?.map((token, idx) => (
                          <tr key={idx} className="hover:bg-amber-50/40 transition">
                            <td className="py-3 px-4 font-serif font-bold text-stone-900 text-sm">
                              {token.word}
                              {token.iast && <span className="block text-[10px] text-stone-400 font-sans italic">{token.iast}</span>}
                            </td>
                            <td className="py-3 px-4 text-stone-700">
                              <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 text-[11px] font-medium">
                                {token.grammar}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-stone-800 font-medium">{token.meaningHi}</td>
                            <td className="py-3 px-4 text-stone-700">{token.meaningEn}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Dual Complete Translations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                    <div className="text-[11px] font-bold text-[#13382c] uppercase">{isHi ? "सम्पूर्ण हिन्दी अनुवाद" : "Full Hindi Translation"}</div>
                    <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                      {verseAnalysis.translationHi}
                    </p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                    <div className="text-[11px] font-bold text-[#13382c] uppercase">{isHi ? "सम्पूर्ण अंग्रेजी अनुवाद" : "Full English Translation"}</div>
                    <p className="text-xs sm:text-sm text-stone-800 leading-relaxed">
                      {verseAnalysis.translationEn}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CHHANDAS (METER) VISUALIZATION */}
            {activeTab === "chhandas" && (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-amber-600/10 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      {isHi ? "पहचाना गया छन्द" : "Identified Classical Meter"}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                      Pingala Shastra Validation
                    </span>
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-stone-900">
                    {verseAnalysis.metricalScan?.identifiedMeter}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-2xl">
                    {verseAnalysis.metricalScan?.explanation}
                  </p>
                </div>

                {/* Pada-by-Pada Syllable Weight Map */}
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-stone-900 text-base">
                    {isHi ? "पाद-वार मात्रा / वर्ण विन्यास (Laghu । एवं Guru ऽ)" : "Pada-by-Pada Syllable Scan (Laghu । & Guru ऽ)"}
                  </h4>

                  <div className="space-y-3">
                    {verseAnalysis.metricalScan?.padas?.map((p, idx) => (
                      <div key={idx} className="p-4 bg-[#fcfaf5] rounded-2xl border border-stone-200 space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-stone-600">
                          <span>Pada {idx + 1}: {p.padaText}</span>
                          <span className="text-amber-800">{p.count} Syllables</span>
                        </div>

                        {/* Syllable blocks */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {p.syllables?.map((s, sIdx) => (
                            <div
                              key={sIdx}
                              className={`flex flex-col items-center justify-center w-10 h-14 rounded-xl border text-xs shadow-2xs ${
                                s.weight === "ऽ"
                                  ? "bg-amber-100 border-amber-300 text-amber-900 font-bold"
                                  : "bg-white border-stone-200 text-stone-700"
                              }`}
                            >
                              <span className="font-serif text-sm">{s.akshara}</span>
                              <span className="text-base font-bold mt-0.5">{s.weight}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <strong>संकेत: </strong>
                    <span>लघु (।) = हृस्व स्वर (1 मात्रा) | गुरु (ऽ) = दीर्घ स्वर, अनुस्वारयुक्त, विसर्गयुक्त अथवा संयुक्ताक्षर से पूर्व का वर्ण (2 मात्रा)।</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SANDHI SPLITTING */}
            {activeTab === "sandhi" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-stone-900 text-lg">
                    {isHi ? "श्लोक में प्रयुक्त सन्धि नियम" : "Identified Sandhi Rules & Euphonic Combinations"}
                  </h3>
                  <span className="text-xs text-stone-500">Paninian Vyakarna Rules</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {verseAnalysis.detectedSandhis?.map((s, idx) => (
                    <div key={idx} className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2 hover:border-amber-300 transition">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                          {s.type}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-stone-900">{s.name}</h4>
                      <p className="text-xs text-stone-600 leading-relaxed font-mono bg-[#fcfaf5] p-2 rounded-lg">
                        {s.pattern}
                      </p>
                      <p className="text-xs text-stone-600">{s.explanation}</p>
                      <div className="text-[11px] text-emerald-800 font-semibold pt-1">
                        उदा: {s.example}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: SAMASA (COMPOUND STRUCTURES) */}
            {activeTab === "samasa" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-stone-900 text-lg">
                    {isHi ? "समास विग्रह एवं प्रकार" : "Compound Structures (Samasa Analysis)"}
                  </h3>
                  <span className="text-xs text-stone-500">Classical Compounding</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {verseAnalysis.detectedSamasas?.map((sm, idx) => (
                    <div key={idx} className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                      <span className="text-[10px] font-bold text-[#13382c] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {sm.rule}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-stone-900">{sm.type}</h4>
                      <p className="text-xs text-stone-600 leading-relaxed">{sm.explanation}</p>
                      <div className="pt-2 border-t border-stone-100 space-y-1">
                        <span className="text-[10px] text-stone-400 uppercase font-semibold">उदाहरण:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {sm.examples?.map((ex, exIdx) => (
                            <span key={exIdx} className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-100">
                              {ex}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: DHATU & MORPHOLOGY */}
            {activeTab === "dhatu" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-stone-900 text-lg">
                    {isHi ? "धातु, गण एवं लकार रूप" : "Verbal Roots (Dhatu) & Conjugational Forms"}
                  </h3>
                  <span className="text-xs text-stone-500">Dhatupatha Analysis</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {verseAnalysis.detectedDhatus?.map((d, idx) => (
                    <div key={idx} className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-serif font-bold text-stone-900">{d.dhatu}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold">{d.gana}</span>
                      </div>
                      <div className="text-xs text-stone-600">
                        <strong>अर्थ: </strong>{d.meaningHi} / {d.meaningEn}
                      </div>
                      <div className="p-3 bg-[#fcfaf5] rounded-xl text-xs space-y-1 border border-stone-100">
                        <div className="text-[10px] text-stone-400 uppercase font-bold">शास्त्रीय रूप (Forms):</div>
                        {d.forms && Object.entries(d.forms).map(([k, v]) => (
                          <div key={k} className="flex justify-between text-stone-700">
                            <span className="capitalize">{k}:</span>
                            <span className="font-serif font-bold text-stone-900">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: CROSS-TEXT SHASTRA REFERENCES */}
            {activeTab === "crossText" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-stone-900 text-lg">
                      {isHi ? "अंतर-शास्त्रीय श्लोक तुलना" : "Cross-Textual Shastra Concept Explorer"}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {isHi ? "विभिन्न वैदिक ग्रंथों में समान दार्शनिक संकल्पनाओं का तुलनात्मक अध्ययन" : "Comparative study of parallel Sanskrit verses across Gurukul Digital Library"}
                    </p>
                  </div>
                  <span className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-semibold">
                    Shastra Ontology
                  </span>
                </div>

                <div className="space-y-4">
                  {verseAnalysis.crossReferences?.map((group, idx) => (
                    <div key={idx} className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4">
                      <h4 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#c4903c]" />
                        <span>{group.concept}</span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {group.verses?.map((v) => (
                          <div
                            key={v.id}
                            onClick={() => {
                              setSelectedVerseId(v.id);
                              setCustomInputMode(false);
                            }}
                            className={`p-3.5 rounded-xl border transition text-left cursor-pointer space-y-1.5 ${
                              v.id === verseAnalysis.canonicalId
                                ? "bg-amber-50 border-amber-300 shadow-2xs"
                                : "bg-[#fcfaf5] border-stone-200 hover:border-amber-200"
                            }`}
                          >
                            <div className="font-serif font-bold text-xs text-stone-900 flex items-center justify-between">
                              <span>{v.source}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
                            </div>
                            <p className="text-[11px] text-stone-600 line-clamp-3 leading-relaxed">
                              {v.context}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: INTERACTIVE SANSKRIT LEARNING MODE */}
            {activeTab === "learn" && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-[#13382c] to-[#1a4a3b] text-white rounded-2xl">
                  <div>
                    <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-[#c4903c]" />
                      <span>{isHi ? "संस्कृत पद-बोध अभ्यास मोड" : "Interactive Sanskrit Learning Mode"}</span>
                    </h3>
                    <p className="text-xs text-amber-200/80 mt-0.5">
                      {isHi ? "प्रत्येक पद पर क्लिक करके उसका अर्थ व व्याकरण देखें और अभ्यास करें।" : "Click any word card to test your recall and reveal its grammatical role & translation."}
                    </p>
                  </div>

                  <button
                    onClick={handleToggleRevealAll}
                    className="px-4 py-2 rounded-xl bg-[#c4903c] text-[#13382c] font-bold text-xs hover:bg-[#d4a359] transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    {revealedAll ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{revealedAll ? (isHi ? "सभी छुपाएं" : "Hide All") : (isHi ? "सभी प्रकट करें" : "Reveal All")}</span>
                  </button>
                </div>

                {/* Interactive Word Flashcards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {verseAnalysis.anvaya?.map((token, idx) => {
                    const isRevealed = revealedWords.has(idx) || revealedAll;
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleWordReveal(idx)}
                        className={`p-4 rounded-2xl border transition cursor-pointer select-none space-y-2 ${
                          isRevealed
                            ? "bg-amber-50/60 border-amber-300 shadow-xs"
                            : "bg-white border-stone-200 hover:border-amber-200 shadow-2xs"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-stone-400 font-mono">Word #{idx + 1}</span>
                          <span className="text-[10px] text-amber-800 font-semibold">
                            {isRevealed ? (isHi ? "प्रकट" : "Revealed") : (isHi ? "क्लिक करें" : "Tap to Reveal")}
                          </span>
                        </div>

                        <div className="font-serif font-bold text-lg text-stone-900">
                          {token.word}
                        </div>

                        {isRevealed ? (
                          <div className="space-y-1 pt-1 border-t border-amber-200/60 animate-in fade-in duration-150">
                            <div className="text-xs font-semibold text-[#13382c]">
                              {token.meaningHi}
                            </div>
                            <div className="text-xs text-stone-600">
                              {token.meaningEn}
                            </div>
                            <div className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium inline-block mt-1">
                              {token.grammar}
                            </div>
                          </div>
                        ) : (
                          <div className="h-10 flex items-center justify-center text-xs text-stone-400 border border-dashed border-stone-200 rounded-xl">
                            {isHi ? "अर्थ जानने हेतु क्लिक करें" : "Click to test meaning"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
