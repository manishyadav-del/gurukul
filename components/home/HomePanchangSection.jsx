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

  // Dynamic formatted display date
  const displayDate = initialPanchang?.date
    ? new Date(initialPanchang.date).toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

  const cards = [
    {
      label: "Tithi",
      primary: tithiName,
      secondary: tithiDev,
      icon: Moon,
    },
    {
      label: "Nakshatra",
      primary: nakshatraName,
      secondary: nakshatraDev,
      icon: Sparkles,
    },
    {
      label: "Yoga",
      primary: yogaName,
      secondary: yogaDev,
      icon: Sun,
    },
    {
      label: "Karana",
      primary: karanaName,
      secondary: karanaDev,
      icon: Layers,
    },
    {
      label: "Vara",
      primary: varaName,
      secondary: varaDev,
      icon: Calendar,
    },
  ];

  return (
    <section aria-labelledby="panchang-heading" className="bg-[#fcfaf5] rounded-2xl border border-[#ede7dc] p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 id="panchang-heading" className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
            Today's Panchang
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-0.5 font-medium">
            {displayDate}
          </p>
        </div>

        <Link
          href="/astrology/daily"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-white text-xs sm:text-sm font-semibold transition self-start sm:self-auto cursor-pointer shadow-xs min-h-[44px]"
        >
          <span>View Full Panchang</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 5 Panchang Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl border border-[#ede5d6] p-4 flex flex-col items-start justify-between min-h-[105px] shadow-2xs hover:border-[#d4a359] transition"
            >
              <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                {card.label}
              </span>
              <div className="flex items-center gap-2.5 mt-2.5">
                <div className="w-8 h-8 rounded-full bg-[#faf5ec] border border-[#ede5d6] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#c4903c]" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm sm:text-base font-bold text-stone-900 font-serif leading-snug truncate">
                    {card.primary}
                  </div>
                  <div className="text-xs font-semibold text-amber-900/90 font-sanskrit leading-snug truncate">
                    ({card.secondary})
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Bar: Sunrise, Sunset, Rahu Kaal, Lucky Color, Lucky Number, Lucky Direction */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-[#ede7dc]">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-[#f0e8dc] text-xs">
          <Sunrise className="w-4 h-4 text-amber-700 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs text-stone-600 block leading-tight font-medium">Sunrise</span>
            <span className="font-bold text-stone-900 leading-tight">{sunrise}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-[#f0e8dc] text-xs">
          <Sunset className="w-4 h-4 text-orange-700 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs text-stone-600 block leading-tight font-medium">Sunset</span>
            <span className="font-bold text-stone-900 leading-tight">{sunset}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-[#f0e8dc] text-xs">
          <Clock className="w-4 h-4 text-rose-700 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs text-stone-600 block leading-tight font-medium">Rahu Kaal</span>
            <span className="font-bold text-stone-900 leading-tight text-[11px] sm:text-xs truncate block">{rahuKaal}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-[#f0e8dc] text-xs">
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-700 shrink-0 shadow-xs" />
          <div className="min-w-0">
            <span className="text-xs text-stone-600 block leading-tight font-medium">Lucky Color</span>
            <span className="font-bold text-stone-900 leading-tight">Green</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-[#f0e8dc] text-xs">
          <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center font-bold text-xs shrink-0">
            6
          </div>
          <div className="min-w-0">
            <span className="text-xs text-stone-600 block leading-tight font-medium">Lucky Number</span>
            <span className="font-bold text-stone-900 leading-tight">6</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-[#f0e8dc] text-xs">
          <Compass className="w-4 h-4 text-[#13382c] shrink-0" />
          <div className="min-w-0">
            <span className="text-xs text-stone-600 block leading-tight font-medium">Direction</span>
            <span className="font-bold text-stone-900 leading-tight">North</span>
          </div>
        </div>
      </div>
    </section>
  );
}
