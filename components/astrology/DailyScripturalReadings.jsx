"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  ShieldCheck,
} from "lucide-react";

/**
 * Intelligent Scriptural Recommendations & Verified Digital Library Reader Links
 *
 * Displays authentic passages from Gurukul's verified manuscripts (Arogyanidhii,
 * Phaladeepika, Brihat Parashara Hora Shastra) grounded in the day's Vedic energy,
 * with direct links to read in the 3D Magazine Reader.
 */
export default function DailyScripturalReadings({ readings = [], language = "en" }) {
  const [copiedId, setCopiedId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const handleCopy = (id, text) => {
    if (!text || typeof window === "undefined") return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!readings || readings.length === 0) {
    return null;
  }

  const isHi = language === "hi";

  return (
    <section id="readings" className="space-y-4 scroll-mt-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#c4903c]" />
            <span>{isHi ? "प्रामाणिक शास्त्र स्वाध्याय एवं डिजिटल ग्रंथागार" : "Authentic Scriptural Readings & Digital Library"}</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {isHi
              ? "आज के वार एवं पंचांग के अनुकूल वैदिक ग्रंथों के प्रामाणिक अंश — 3D मैगज़ीन रीडर में सीधे पढ़ें।"
              : "Scholarly passages from verified treatises aligned with today's planetary energy. Click to open directly in the 3D Magazine Reader."}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold text-[11px]">{isHi ? "सत्यापित पांडुलिपियां" : "Verified Manuscript Editions"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {readings.map((reading, idx) => {
          const isExpanded = expandedId === reading.id || (expandedId === null && idx === 0);
          return (
            <div
              key={reading.id || idx}
              className="bg-white rounded-3xl border border-[#ede5d6] p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4 relative overflow-hidden group"
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#13382c] via-[#c4903c] to-[#13382c]" />

              <div className="space-y-3">
                {/* Book & Chapter Header */}
                <div className="flex items-start justify-between gap-2 pt-1">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#c4903c] font-bold block">
                      {reading.chapter || "Classical Shastra"}
                    </span>
                    <h3 className="font-serif font-bold text-base text-stone-900 group-hover:text-[#13382c] transition">
                      {reading.bookTitle}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    p. {reading.pageNumber || 1}
                  </span>
                </div>

                {/* Sanskrit Verse in Traditional Card */}
                <div className="p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#ede4d1] space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-stone-400">
                    <span className="font-serif italic text-[#8b261e]">मूल संस्कृत श्लोक</span>
                    <button
                      onClick={() => handleCopy(reading.id, `${reading.sanskritVerse}\n\n${reading.transliteration}`)}
                      className="text-stone-400 hover:text-stone-700 transition cursor-pointer p-1"
                      title="Copy Sanskrit Verse"
                    >
                      {copiedId === reading.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <p className="font-serif text-sm text-stone-900 font-semibold leading-relaxed tracking-wide">
                    {reading.sanskritVerse}
                  </p>

                  {reading.transliteration && (
                    <p className="text-[11px] font-mono text-stone-500 italic pt-1 border-t border-stone-200/50">
                      {reading.transliteration}
                    </p>
                  )}
                </div>

                {/* Translation (Bilingual) */}
                <div className="space-y-1.5 text-xs text-stone-700 leading-relaxed">
                  <p className="font-medium">
                    <strong className="text-stone-900">{isHi ? "हिंदी अर्थ: " : "Meaning: "}</strong>
                    {isHi ? reading.translationHi || reading.translationEn : reading.translationEn || reading.translationHi}
                  </p>
                </div>

                {/* Why Recommended Explanation */}
                {reading.whyRecommended && (
                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#c4903c] shrink-0 mt-0.5" />
                    <span>{reading.whyRecommended}</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions: 3D Reader Launch Button */}
              <div className="pt-3 border-t border-[#ede5d6] flex items-center justify-between gap-2">
                <span className="text-[10px] text-stone-400 font-serif italic truncate max-w-[130px]">
                  {reading.traditionalAttribution}
                </span>

                <Link
                  href={reading.readerUrl || `/library/${reading.bookSlug}/pdf`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#13382c] hover:bg-[#194939] text-white text-xs font-serif font-bold transition shadow-2xs group-hover:scale-102"
                >
                  <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isHi ? "3D रीडर में खोलें" : "Open in 3D Reader"}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
