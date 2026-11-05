"use client";

import Link from "next/link";
import {
  Moon,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Clock,
  Compass,
  ArrowRight,
  Calendar,
  Layers,
} from "lucide-react";

export default function HomePanchangSection({ initialPanchang }) {
  // Use computed or fallback to match the exact mockup display
  const tithiName = initialPanchang?.tithi?.name || "Purnima";
  const tithiDev = initialPanchang?.tithi?.devanagari || "पूर्णिमा";
  const nakshatraName = initialPanchang?.nakshatra?.name || "Rohini";
  const nakshatraDev = initialPanchang?.nakshatra?.devanagari || "रोहिणी";
  const yogaName = initialPanchang?.yoga?.name || "Siddhi";
  const yogaDev = initialPanchang?.yoga?.devanagari || "सिद्धि";
  const karanaName = initialPanchang?.karana?.name || "Bava";
  const karanaDev = initialPanchang?.karana?.devanagari || "बव";
  const varaName = initialPanchang?.vara?.en || "Shukravar";
  const varaDev = initialPanchang?.vara?.hi || "शुक्रवार";

  const sunrise = initialPanchang?.sunrise?.local || "06:18 AM";
  const sunset = initialPanchang?.sunset?.local || "05:52 PM";
  const rahuKaal = initialPanchang?.rahuKaal
    ? `${initialPanchang.rahuKaal.start?.local || "10:30 AM"} - ${initialPanchang.rahuKaal.end?.local || "12:00 PM"}`
    : "10:30 AM - 12:00 PM";

  const cards = [
    {
      label: "Tithi",
      primary: tithiName,
      secondary: `(${tithiDev})`,
      icon: Moon,
    },
    {
      label: "Nakshatra",
      primary: nakshatraName,
      secondary: `(${nakshatraDev})`,
      icon: Sparkles,
    },
    {
      label: "Yoga",
      primary: yogaName,
      secondary: `(${yogaDev})`,
      icon: Sun,
    },
    {
      label: "Karana",
      primary: karanaName,
      secondary: `(${karanaDev})`,
      icon: Layers,
    },
    {
      label: "Vara",
      primary: varaName,
      secondary: `(${varaDev})`,
      icon: Calendar,
    },
  ];

  return (
    <div className="bg-[#fcfaf5] rounded-2xl border border-[#ede7dc] p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
            Today's Panchang
          </h2>
          <p className="text-xs text-stone-500 mt-0.5 font-medium">
            Friday, 16 October 2026
          </p>
        </div>

        <Link
          href="/astrology/daily"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#13382c] hover:bg-[#1a4a3b] text-white text-xs font-semibold transition self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <span>View Full Panchang</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 5 Panchang Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-[#ede5d6] p-4 flex flex-col items-start justify-between min-h-[95px] shadow-2xs hover:border-[#d4a359] transition"
            >
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                {card.label}
              </span>
              <div className="flex items-center gap-2.5 mt-2">
                <div className="w-7 h-7 rounded-full bg-[#faf5ec] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#c4903c]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-900 font-serif leading-tight">
                    {card.primary}
                  </div>
                  <div className="text-[11px] text-stone-500 font-medium leading-tight">
                    {card.secondary}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Bar: Sunrise, Sunset, Rahu Kaal, Lucky Color, Lucky Number, Lucky Direction */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-2 border-t border-[#ede7dc]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#f0e8dc] text-xs">
          <Sunrise className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <span className="text-[10px] text-stone-400 block leading-none">Sunrise</span>
            <span className="font-semibold text-stone-800 leading-tight">{sunrise}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#f0e8dc] text-xs">
          <Sunset className="w-4 h-4 text-orange-600 shrink-0" />
          <div>
            <span className="text-[10px] text-stone-400 block leading-none">Sunset</span>
            <span className="font-semibold text-stone-800 leading-tight">{sunset}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#f0e8dc] text-xs">
          <Clock className="w-4 h-4 text-red-500 shrink-0" />
          <div>
            <span className="text-[10px] text-stone-400 block leading-none">Rahu Kaal</span>
            <span className="font-semibold text-stone-800 leading-tight">{rahuKaal}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#f0e8dc] text-xs">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 shrink-0" />
          <div>
            <span className="text-[10px] text-stone-400 block leading-none">Lucky Color</span>
            <span className="font-semibold text-stone-800 leading-tight">Green</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#f0e8dc] text-xs">
          <div className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0">
            6
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block leading-none">Lucky Number</span>
            <span className="font-semibold text-stone-800 leading-tight">6</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-[#f0e8dc] text-xs">
          <Compass className="w-4 h-4 text-[#13382c] shrink-0" />
          <div>
            <span className="text-[10px] text-stone-400 block leading-none">Lucky Direction</span>
            <span className="font-semibold text-stone-800 leading-tight">North</span>
          </div>
        </div>
      </div>
    </div>
  );
}
