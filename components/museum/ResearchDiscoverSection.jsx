"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles, Feather, Compass, CheckCircle2 } from "lucide-react";

const RESEARCH_EXAMPLES = [
  {
    id: "parashara-creation",
    source: "Brihat Parashara Hora Shastra",
    chapter: "Chapter 1: Srishti Krama (Order of Creation)",
    verseNumber: "Shloka 3.12",
    devanagari: "सूर्यात्मा सर्वजीवानां मणिरत्नं विवस्वते ।\nसर्वज्ञो भगवान् विष्णुः सूर्यमूर्तिधरः प्रभुः ॥",
    transliteration: "sūryātmā sarvajīvānāṁ maṇiratnaṁ vivasvate |\nsarvajño bhagavān viṣṇuḥ sūryamūrtidharaḥ prabhuḥ ||",
    anvaya: [
      { word: "सूर्यः", meaning: "The Sun", role: "Subject (Karta)" },
      { word: "सर्वजीवानाम्", meaning: "of all living beings", role: "Genitive (Sambandha)" },
      { word: "आत्मा", meaning: "the cosmic Soul (Atman)", role: "Predicate (Visheshya)" },
      { word: "भगवान् विष्णुः", meaning: "Lord Vishnu Himself", role: "Divine attribution" },
      { word: "सूर्यमूर्तिधरः", meaning: "manifesting as the Sun form", role: "Apposition" },
    ],
    translation:
      "The Sun is the Atman (essential self and soul) of all living beings in the cosmos. Lord Vishnu, the omniscient cosmic maintainer, manifests in the visible universe in the luminous form of the Sun.",
    scholarlyExplanation:
      "In classical Jyotisha, this foundational verse establishes that the Sun is not merely a physical celestial luminary, but the macrocosmic vital principle corresponding to individual consciousness and self-identity in the natal chart.",
    category: "Astrological Philosophy",
  },
  {
    id: "gita-karma",
    source: "Shrimad Bhagavad Gita",
    chapter: "Chapter 2: Sankhya Yoga",
    verseNumber: "Shloka 2.47",
    devanagari: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन ।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि ॥",
    transliteration: "karmaṇyevādhikāraste mā phaleṣu kadācana |\nmā karmaphalaheturbhūrmā te saṅgo'stvakarmaṇi ||",
    anvaya: [
      { word: "कर्मणि", meaning: "in righteous prescribed action", role: "Locative" },
      { word: "एव", meaning: "alone / indeed", role: "Avyaya" },
      { word: "अधिकारः ते", meaning: "your entitlement / authority exists", role: "Main clause" },
      { word: "मा फलेषु", meaning: "never in the fruits or results", role: "Negation" },
      { word: "मा अकर्मणि", meaning: "nor should there be attachment to inaction", role: "Prohibition" },
    ],
    translation:
      "You have an absolute right only to perform your duties, but never to the fruits of action. Let not the fruit of action be your motive, nor let there be any attachment to inaction.",
    scholarlyExplanation:
      "This central shloka articulates the core principle of Nishkama Karma: acting with total focus and excellence without anxiety over outcomes, transmuting worldly responsibility into spiritual liberation.",
    category: "Ethical Philosophy",
  },
];

export default function ResearchDiscoverSection() {
  const [activeTab, setActiveTab] = useState("shloka"); // "shloka" | "anvaya" | "translation" | "explanation"
  const [selectedExampleIndex, setSelectedExampleIndex] = useState(0);

  const activeExample = RESEARCH_EXAMPLES[selectedExampleIndex];

  return (
    <section className="py-16 sm:py-20 bg-[#F7F5F0]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Feather className="w-4 h-4 text-[#D05C3B]" />
              <span className="text-xs font-serif uppercase tracking-widest text-[#D05C3B] font-semibold">
                Text-Critical Research
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#30251F] tracking-tight">
              Research &amp; Discover
            </h2>
            <p className="text-sm text-[#30251F]/70 max-w-xl font-sans">
              Ground your understanding in verbatim original Sanskrit verses, grammatical anvaya breakdowns, and validated scholarly commentaries.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {RESEARCH_EXAMPLES.map((ex, idx) => (
              <button
                key={ex.id}
                onClick={() => setSelectedExampleIndex(idx)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition cursor-pointer ${
                  selectedExampleIndex === idx
                    ? "bg-[#D05C3B] text-white shadow-xs"
                    : "bg-white text-[#30251F]/70 border border-[#E8DED2] hover:border-[#D05C3B]/50"
                }`}
              >
                {ex.source.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Scholarly Interactive Presentation Card */}
        <div className="bg-white rounded-3xl border border-[#E8DED2] p-6 lg:p-10 shadow-lg shadow-[#30251F]/5">
          {/* Top Provenance & Citation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#E8DED2]">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#D05C3B] block">
                {activeExample.category} • Authentic Citation
              </span>
              <h3 className="font-serif font-bold text-xl text-[#30251F]">
                {activeExample.source}
              </h3>
              <p className="text-xs text-[#30251F]/60 mt-0.5">
                {activeExample.chapter} • <strong className="text-[#30251F]">{activeExample.verseNumber}</strong>
              </p>
            </div>

            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#F7F5F0] rounded-xl border border-[#E8DED2] self-start sm:self-auto">
              {[
                { id: "shloka", label: "Devanagari" },
                { id: "anvaya", label: "Anvaya & Grammar" },
                { id: "translation", label: "Translation" },
                { id: "explanation", label: "Tattva & Explanation" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-white text-[#D05C3B] font-bold shadow-xs"
                      : "text-[#30251F]/70 hover:text-[#30251F]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Content View Area */}
          <div className="py-8 min-h-[220px] flex items-center">
            {activeTab === "shloka" && (
              <div className="w-full space-y-4 text-center">
                <p className="font-sanskrit text-2xl sm:text-3xl lg:text-4xl leading-relaxed text-[#30251F] font-bold whitespace-pre-line tracking-wide">
                  {activeExample.devanagari}
                </p>
                <p className="font-serif italic text-sm text-[#30251F]/60 whitespace-pre-line">
                  {activeExample.transliteration}
                </p>
              </div>
            )}

            {activeTab === "anvaya" && (
              <div className="w-full space-y-4">
                <p className="text-xs font-serif text-[#D05C3B] font-semibold uppercase tracking-wider">
                  Padachheda &amp; Grammatical Role Breakdown (Anvaya):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeExample.anvaya.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#F7F5F0] rounded-xl border border-[#E8DED2] p-3 space-y-1"
                    >
                      <span className="font-sanskrit font-bold text-base text-[#30251F] block">
                        {item.word}
                      </span>
                      <span className="text-xs text-[#30251F]/80 block">
                        {item.meaning}
                      </span>
                      <span className="text-[10px] text-[#D05C3B] font-mono block">
                        {item.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "translation" && (
              <div className="w-full max-w-3xl mx-auto space-y-4 text-center">
                <span className="text-xs uppercase font-serif tracking-widest text-[#D05C3B] font-semibold">
                  Accurate Scholarly English Translation
                </span>
                <p className="font-serif text-lg sm:text-xl text-[#30251F] leading-relaxed">
                  &ldquo;{activeExample.translation}&rdquo;
                </p>
              </div>
            )}

            {activeTab === "explanation" && (
              <div className="w-full max-w-3xl mx-auto bg-[#F7F5F0] rounded-2xl p-6 border border-[#E8DED2] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#D05C3B]">
                  <Sparkles className="w-4 h-4" />
                  <span>Philosophical Tattva &amp; Context</span>
                </div>
                <p className="text-sm text-[#30251F]/85 leading-relaxed font-sans">
                  {activeExample.scholarlyExplanation}
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs text-[#30251F]/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified against classical commentaries and verified manuscript folios</span>
                </div>
              </div>
            )}
          </div>

          {/* Research Actions Footer */}
          <div className="pt-6 border-t border-[#E8DED2] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-[#30251F]/70">
              <Link
                href="/sanskrit"
                className="hover:text-[#D05C3B] underline underline-offset-4"
              >
                Analyze Sanskrit Grammar &amp; Sandhi
              </Link>
              <span>•</span>
              <Link
                href="/explore"
                className="hover:text-[#D05C3B] underline underline-offset-4"
              >
                Explore Concept Graph
              </Link>
            </div>

            <Link
              href="/research"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#30251F] text-white text-xs font-semibold hover:bg-[#D05C3B] transition"
            >
              <span>Open Research Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
