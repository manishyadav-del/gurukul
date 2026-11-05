"use client";

import { useState } from "react";
import {
  Compass,
  Crown,
  Info,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Flame,
} from "lucide-react";
import { SUBTLE_NADIS, THREE_GRANTHIS } from "../../server/spirituality/pranayamaData.js";

export default function NadisAndGranthisVisualizer({ language = "en" }) {
  const isHi = language === "hi" || language === "hindi";

  const [activeNadiFilter, setActiveNadiFilter] = useState("all"); // "all", "ida", "pingala", "sushumna"
  const [selectedGranthiId, setSelectedGranthiId] = useState(THREE_GRANTHIS[0].id);

  const selectedGranthi =
    THREE_GRANTHIS.find((g) => g.id === selectedGranthiId) || THREE_GRANTHIS[0];

  return (
    <div className="space-y-6">
      {/* Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block text-amber-950">
            {isHi ? "सूक्ष्म शरीर एवं नाड़ी विज्ञान का शास्त्रीय परिप्रेक्ष्य" : "Classical Subtle Anatomy & Contemplative Scope"}
          </span>
          <p className="text-[11px] text-amber-900/90 leading-relaxed">
            {isHi
              ? "हठयोग एवं तन्त्र ग्रन्थों में वर्णित 72,000 नाड़ियाँ एवं तीन ग्रन्थियाँ आध्यात्मिक ध्यान की सूक्ष्म संरचनाएँ (भावना) हैं। इन्हें आधुनिक चिकित्सा विज्ञान के भौतिक रक्तवाही अथवा तंत्रिका तंतुओं (physical nerves or blood vessels) के समान नहीं माना जाना चाहिए।"
              : "In classical Hatha Yoga and Tantra, the 72,000 Nadis and Three Granthis are internal contemplative structures (Bhavana) cultivated during meditative absorption. They are explicitly subtle and symbolic, and should not be confused with physical medical anatomy or neurological nerves."}
          </p>
        </div>
      </div>

      {/* SECTION 1: INTERACTIVE THREE NADIS VISUALIZER */}
      <div className="bg-white rounded-3xl border border-[#ede5d6] p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ede5d6] pb-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#c4903c] font-semibold">
              {isHi ? "त्रि-नाड़ी समन्वय" : "The Three Primary Nadis"}
            </span>
            <h3 className="text-xl font-bold font-serif text-stone-900 mt-0.5">
              Ida, Pingala & Sushumna Channel Architecture
            </h3>
          </div>

          {/* Nadi Channel Filter Controls */}
          <div className="flex items-center gap-1.5 bg-[#faf8f4] p-1 rounded-2xl border border-[#ede5d6] text-xs">
            <button
              onClick={() => setActiveNadiFilter("all")}
              className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                activeNadiFilter === "all"
                  ? "bg-[#13382c] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Unified System
            </button>
            <button
              onClick={() => setActiveNadiFilter("ida")}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                activeNadiFilter === "ida"
                  ? "bg-slate-700 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Moon className="w-3 h-3 text-cyan-300" />
              <span>Ida (Lunar)</span>
            </button>
            <button
              onClick={() => setActiveNadiFilter("pingala")}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                activeNadiFilter === "pingala"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Sun className="w-3 h-3 text-amber-200" />
              <span>Pingala (Solar)</span>
            </button>
            <button
              onClick={() => setActiveNadiFilter("sushumna")}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ${
                activeNadiFilter === "sushumna"
                  ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-stone-950 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Flame className="w-3 h-3 text-amber-800" />
              <span>Sushumna</span>
            </button>
          </div>
        </div>

        {/* Visual Diagram + Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Interactive SVG Subtle Spine & Spiraling Nadis Diagram */}
          <div className="lg:col-span-5 bg-gradient-to-b from-stone-900 to-stone-950 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[380px] shadow-inner relative overflow-hidden">
            {/* Background subtle star grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]" />

            <svg
              viewBox="0 0 240 380"
              className="w-full max-w-[210px] h-[350px] relative z-10 select-none"
            >
              <defs>
                <filter id="nadi-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* 1. Central Sushumna Vertical Channel */}
              {(activeNadiFilter === "all" || activeNadiFilter === "sushumna") && (
                <g>
                  <line
                    x1="120"
                    y1="340"
                    x2="120"
                    y2="40"
                    stroke="#fbbf24"
                    strokeWidth="5"
                    strokeLinecap="round"
                    filter="url(#nadi-glow)"
                    opacity={activeNadiFilter === "sushumna" ? "1" : "0.75"}
                  />
                  <line
                    x1="120"
                    y1="340"
                    x2="120"
                    y2="40"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>
              )}

              {/* 2. Ida (Left / Moon / Blue-White) Spiraling Sine Path */}
              {(activeNadiFilter === "all" || activeNadiFilter === "ida") && (
                <path
                  d="M 120 340 
                     C 60 300, 60 270, 120 250 
                     C 180 230, 180 200, 120 180 
                     C 60 160, 60 130, 120 110 
                     C 180 90, 180 60, 120 40 
                     C 95 30, 85 20, 80 15"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#nadi-glow)"
                  opacity={activeNadiFilter === "ida" ? "1" : "0.85"}
                />
              )}

              {/* 3. Pingala (Right / Sun / Crimson-Gold) Reciprocal Spiraling Path */}
              {(activeNadiFilter === "all" || activeNadiFilter === "pingala") && (
                <path
                  d="M 120 340 
                     C 180 300, 180 270, 120 250 
                     C 60 230, 60 200, 120 180 
                     C 180 160, 180 130, 120 110 
                     C 60 90, 60 60, 120 40 
                     C 145 30, 155 20, 160 15"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#nadi-glow)"
                  opacity={activeNadiFilter === "pingala" ? "1" : "0.85"}
                />
              )}

              {/* Chakra Intersection Nodes */}
              {[
                { y: 340, name: "Muladhara", color: "#b91c1c", r: 8 },
                { y: 295, name: "Svadhisthana", color: "#ea580c", r: 7 },
                { y: 250, name: "Manipura", color: "#ca8a04", r: 7 },
                { y: 180, name: "Anahata", color: "#15803d", r: 8 },
                { y: 110, name: "Vishuddha", color: "#0369a1", r: 7 },
                { y: 40, name: "Ajna", color: "#4338ca", r: 8 },
                { y: 12, name: "Sahasrara", color: "#7e22ce", r: 9 },
              ].map((c, i) => (
                <g key={i}>
                  <circle
                    cx="120"
                    cy={c.y}
                    r={c.r}
                    fill={c.color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x="135"
                    y={c.y + 4}
                    fill="#e2e8f0"
                    fontSize="9"
                    fontFamily="sans-serif"
                    fontWeight="bold"
                    opacity="0.8"
                  >
                    {c.name}
                  </text>
                </g>
              ))}

              {/* Nostril Termini labels */}
              <text x="50" y="15" fill="#38bdf8" fontSize="8" fontFamily="sans-serif" fontWeight="bold">
                Left (Ida)
              </text>
              <text x="165" y="15" fill="#f97316" fontSize="8" fontFamily="sans-serif" fontWeight="bold">
                Right (Pingala)
              </text>
            </svg>

            <span className="text-[10px] text-stone-400 font-mono mt-2 z-10">
              Ida (Moon ☽) • Sushumna (Fire ⚡) • Pingala (Sun ☉)
            </span>
          </div>

          {/* Nadi Attribute Cards */}
          <div className="lg:col-span-7 space-y-3">
            {SUBTLE_NADIS.map((nadi) => {
              const isHighlighted = activeNadiFilter === "all" || activeNadiFilter === nadi.id;
              return (
                <div
                  key={nadi.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isHighlighted
                      ? "bg-[#faf8f4] border-[#ede5d6] shadow-xs"
                      : "bg-white border-stone-100 opacity-40"
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-sm text-stone-900">
                        {nadi.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {nadi.nostril}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-amber-800">
                      {nadi.element}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs text-stone-600">
                    <div>
                      <span className="font-semibold text-stone-800">Nature:</span> {nadi.nature}
                    </div>
                    <div>
                      <span className="font-semibold text-stone-800">Origin & Path:</span>{" "}
                      {nadi.originAndPath?.slice(0, 75)}...
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-stone-200/60 text-[11px] text-stone-500 italic flex items-center justify-between">
                    <span>{nadi.scripturalReference}</span>
                    <span className="font-mono text-stone-600 font-bold">{nadi.color}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 2: THREE GRANTHIS (SPHERES OF SPIRITUAL KNOTS) */}
      <div className="bg-white rounded-3xl border border-[#ede5d6] p-6 sm:p-7 shadow-xs space-y-6">
        <div className="border-b border-[#ede5d6] pb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-[#c4903c] font-semibold">
            {isHi ? "ग्रन्थि त्रय निरूपण" : "The Three Subtle Spiritual Knots"}
          </span>
          <h3 className="text-xl font-bold font-serif text-stone-900 mt-0.5">
            Three Granthis Intelligence (Brahma, Vishnu, Rudra)
          </h3>
          <p className="text-xs text-stone-600 mt-1 max-w-2xl leading-relaxed">
            In classical Hatha Yoga and Tantra, &quot;Granthis&quot; are energetic and psychological knots where identification with limited ego structures obstructs the natural flow of pure awareness.
          </p>
        </div>

        {/* Granthi Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {THREE_GRANTHIS.map((g) => {
            const isSelected = selectedGranthi.id === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGranthiId(g.id)}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#faf5ec] border-amber-400 shadow-xs ring-1 ring-amber-400"
                    : "bg-white border-[#ede5d6] hover:bg-[#faf8f4]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-sm text-stone-900">
                      {g.name}
                    </span>
                    <Crown className="w-3.5 h-3.5 text-[#c4903c]" />
                  </div>
                  <span className="text-xs font-semibold text-[#13382c] block mt-0.5">
                    {g.significance}
                  </span>
                  <span className="text-[11px] text-stone-500 block mt-1">
                    {g.location}
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-200/80 text-[11px] text-stone-600 line-clamp-2">
                  {g.description}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Granthi Comprehensive Breakdown */}
        <div className="p-5 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#ede5d6]">
            <div>
              <span className="font-serif font-bold text-lg text-stone-900 block">
                {selectedGranthi.name}
              </span>
              <span className="text-xs font-semibold text-[#c4903c]">
                {selectedGranthi.significance} • {selectedGranthi.location}
              </span>
            </div>
          </div>

          <p className="leading-relaxed text-stone-700">
            {selectedGranthi.description}
          </p>

          {/* Cross-Tradition Nuances & Comparisons */}
          <div className="space-y-2 pt-2">
            <span className="font-bold text-xs uppercase tracking-wider text-[#13382c] block">
              Classical Treatise Comparisons & Lineage Perspectives:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-white border border-[#ede5d6] space-y-1">
                <span className="font-bold text-[11px] text-amber-900 block">Shat-Chakra-Nirupana:</span>
                <p className="text-[11px] text-stone-600">
                  {selectedGranthi.traditionsComparison?.shatChakraNirupana}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#ede5d6] space-y-1">
                <span className="font-bold text-[11px] text-amber-900 block">Goraksha Paddhati:</span>
                <p className="text-[11px] text-stone-600">
                  {selectedGranthi.traditionsComparison?.gorakshaPaddhati}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-white border border-[#ede5d6] space-y-1">
                <span className="font-bold text-[11px] text-amber-900 block">Hatha Yoga Pradipika:</span>
                <p className="text-[11px] text-stone-600">
                  {selectedGranthi.traditionsComparison?.hathaYogaPradipika}
                </p>
              </div>
            </div>
          </div>

          {/* Path of Transcendence */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
            <span className="font-bold block text-emerald-900">
              Sadhana for Harmonious Piercing (ग्रन्थि भेदन):
            </span>
            <p className="text-[11px] leading-relaxed">
              {selectedGranthi.unravelingPath}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
