"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Volume2,
  VolumeX,
  Sparkles,
  Scroll,
  Info,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Share2,
} from "lucide-react";
import { SANSKRIT_SHLOKAS } from "../../server/spirituality/sanskritShlokas.js";

export default function SanskritShlokaExplorer({ language = "en" }) {
  const isHi = language === "hi" || language === "hindi";

  const [shlokas, setShlokas] = useState(SANSKRIT_SHLOKAS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedSource, setSelectedSource] = useState("ALL");
  const [expandedAnvayaId, setExpandedAnvayaId] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [bookmarkedMap, setBookmarkedMap] = useState({});

  const categories = ["ALL", ...Array.from(new Set(SANSKRIT_SHLOKAS.map((s) => s.category)))];
  const sources = ["ALL", ...Array.from(new Set(SANSKRIT_SHLOKAS.map((s) => s.source)))];

  // Filter shlokas locally
  useEffect(() => {
    let list = [...SANSKRIT_SHLOKAS];
    if (selectedCategory !== "ALL") {
      list = list.filter((s) => s.category === selectedCategory);
    }
    if (selectedSource !== "ALL") {
      list = list.filter((s) => s.source === selectedSource);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.devanagari.toLowerCase().includes(q) ||
          s.iast.toLowerCase().includes(q) ||
          s.subject.toLowerCase().includes(q) ||
          s.translationEn.toLowerCase().includes(q) ||
          s.translationHi.toLowerCase().includes(q)
      );
    }
    setShlokas(list);
  }, [searchQuery, selectedCategory, selectedSource]);

  const handleCopy = (shloka) => {
    const text = `${shloka.devanagari}\n\n${shloka.iast}\n\nSource: ${shloka.source} (${shloka.verseNumber})\nTranslation: ${shloka.translationEn}`;
    navigator.clipboard?.writeText(text);
    setCopiedId(shloka.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleBookmark = (id) => {
    setBookmarkedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePlayCadence = (shloka) => {
    if (playingId === shloka.id) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingId(null);
      return;
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(shloka.devanagari);
      utterance.lang = "sa-IN";
      utterance.rate = 0.75; // slow reverent cadence
      utterance.pitch = 0.9;
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);
      setPlayingId(shloka.id);
      window.speechSynthesis.speak(utterance);
    } else {
      setPlayingId(shloka.id);
      setTimeout(() => setPlayingId(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 p-6 sm:p-8 text-amber-50 shadow-md">
        <div className="relative z-10 max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs font-semibold">
            <Scroll className="w-3.5 h-3.5" />
            <span>{isHi ? "वैदिक श्लोक अन्वय एवं व्याकरण विमर्श" : "Canonical Sanskrit Shloka Intelligence"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
            {isHi ? "मूल संस्कृत श्लोक एवं अन्वय अन्वेषक" : "Sanskrit Shloka & Anvaya Explorer"}
          </h1>
          <p className="text-sm text-stone-300 leading-relaxed">
            {isHi
              ? "बृहत् पराशर होरा शास्त्र, षट्चक्रनिरूपण, फलदीपिका एवं श्रीमद्भगवद्गीता के प्रामाणिक श्लोकों का शब्दशः पदच्छेद, अन्वय, व्याकरण एवं दार्शनिक भावार्थ।"
              : "Authentic classical verses from Brihat Parashara Hora Shastra, Shat-Chakra-Nirupana, Phaladeepika, and the Bhagavad Gita with word-by-word Anvaya analysis, meters (Chhandas), and philosophical commentary."}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHi ? "श्लोक, मंत्र, स्रोत या अर्थ खोजें..." : "Search by Sanskrit, IAST, source, or meaning..."}
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-600 transition"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "ALL" ? (isHi ? "सभी श्रेणियां" : "All Categories") : c}
                </option>
              ))}
            </select>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            >
              {sources.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? (isHi ? "सभी ग्रंथ" : "All Treatises") : s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Shlokas List */}
      <div className="space-y-6">
        {shlokas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 text-stone-500 text-sm">
            {isHi ? "कोई श्लोक नहीं मिला।" : "No shlokas matched your search criteria."}
          </div>
        ) : (
          shlokas.map((shloka) => {
            const isAnvayaOpen = expandedAnvayaId === shloka.id;
            const isPlaying = playingId === shloka.id;
            const isBookmarked = bookmarkedMap[shloka.id];
            const isCopied = copiedId === shloka.id;

            return (
              <div
                key={shloka.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden transition hover:border-amber-300"
              >
                {/* Shloka Card Header */}
                <div className="bg-stone-50/70 border-b border-stone-200 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      {shloka.category}
                    </span>
                    <span className="text-xs font-semibold text-stone-800 font-serif">
                      {shloka.source} • {shloka.verseNumber}
                    </span>
                    <span className="text-[11px] text-stone-500">({shloka.author})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 bg-stone-200/70 rounded-md text-stone-700">
                      {shloka.chhanda}
                    </span>
                    <button
                      onClick={() => handlePlayCadence(shloka)}
                      title={isPlaying ? "Stop audio" : "Play classical recitation cadence"}
                      className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition ${
                        isPlaying
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-white text-stone-700 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleCopy(shloka)}
                      title="Copy shloka and citation"
                      className="p-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 transition"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleToggleBookmark(shloka.id)}
                      title="Bookmark verse"
                      className={`p-1.5 rounded-lg border transition ${
                        isBookmarked
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Shloka Body */}
                <div className="p-6 space-y-5">
                  {/* Subject Tag */}
                  <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    {shloka.subject}
                  </h3>

                  {/* Sacred Devanagari Script Block */}
                  <div className="p-5 rounded-xl bg-amber-50/50 border border-amber-200/70 text-center">
                    <p className="text-lg sm:text-xl font-serif text-stone-900 leading-relaxed whitespace-pre-line tracking-wide font-medium">
                      {shloka.devanagari}
                    </p>
                    <p className="mt-3 text-xs sm:text-sm font-serif italic text-amber-900/80 whitespace-pre-line">
                      {shloka.iast}
                    </p>
                  </div>

                  {/* Translations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        {isHi ? "हिन्दी भावार्थ" : "Hindi Meaning"}
                      </span>
                      <p className="text-xs text-stone-800 leading-relaxed font-serif">
                        {shloka.translationHi}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                        {isHi ? "आंग्ल अनुवाद" : "English Translation"}
                      </span>
                      <p className="text-xs text-stone-800 leading-relaxed">
                        {shloka.translationEn}
                      </p>
                    </div>
                  </div>

                  {/* Philosophical Commentary */}
                  <div className="p-4 rounded-xl bg-stone-100/60 border border-stone-200/80 text-xs text-stone-700 leading-relaxed flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-stone-900 block mb-0.5">
                        {isHi ? "शास्त्रीय चिंतन एवं व्यावहारिक अनुप्रयोग" : "Philosophical Context & Mindful Application"}
                      </span>
                      {isHi ? shloka.commentaryHi : shloka.commentaryEn}
                    </div>
                  </div>

                  {/* Anvaya Accordion Toggle */}
                  <div className="border-t border-stone-100 pt-3">
                    <button
                      onClick={() => setExpandedAnvayaId(isAnvayaOpen ? null : shloka.id)}
                      className="w-full flex items-center justify-between text-xs font-semibold text-amber-900 hover:text-amber-800 py-1"
                    >
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        {isHi ? "पदच्छेद एवं शब्दशः अन्वय विश्लेषण (Word-by-Word Analysis)" : "Word-by-Word Anvaya & Grammatical Breakdown"}
                      </span>
                      {isAnvayaOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isAnvayaOpen && (
                      <div className="mt-3 overflow-x-auto rounded-xl border border-stone-200 bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold text-[11px]">
                            <tr>
                              <th className="py-2.5 px-3">पद (Sanskrit Word)</th>
                              <th className="py-2.5 px-3">IAST</th>
                              <th className="py-2.5 px-3">व्याकरण (Grammar)</th>
                              <th className="py-2.5 px-3">Meaning (English)</th>
                              <th className="py-2.5 px-3">अर्थ (Hindi)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {shloka.anvaya.map((item, idx) => (
                              <tr key={idx} className="hover:bg-amber-50/30">
                                <td className="py-2 px-3 font-serif font-bold text-stone-900">{item.word}</td>
                                <td className="py-2 px-3 italic text-stone-600 font-serif">{item.iast}</td>
                                <td className="py-2 px-3 text-[11px] font-mono text-amber-800">{item.grammar}</td>
                                <td className="py-2 px-3 text-stone-700">{item.meaningEn}</td>
                                <td className="py-2 px-3 text-stone-700 font-serif">{item.meaningHi}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
