"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Flame,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

export default function DashaTimelineView({ chart, language = "en" }) {
  const [expandedMaha, setExpandedMaha] = useState(null);
  const [expandedAntar, setExpandedAntar] = useState(null);
  const isHi = language === "hi" || language === "hindi";

  if (!chart || !chart.dasha || !chart.dasha.timeline) {
    return (
      <div className="p-8 text-center text-stone-500 bg-[#fbf9f4] rounded-2xl border border-amber-200">
        {isHi ? "दशा क्रम गणना उपलब्ध नहीं है।" : "Dasha timeline calculation is not available."}
      </div>
    );
  }

  const { dasha } = chart;
  const active = dasha.activeDasha || {};
  const theme = active.theme || {};
  const subTheme = active.subTheme || {};

  return (
    <div className="space-y-6">
      {/* Active Dasha Hero Card */}
      <div className="bg-gradient-to-br from-[#173d31] via-[#1d4d3e] to-[#25604e] p-6 rounded-2xl text-amber-50 shadow-md">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              {isHi ? "वर्तमान सक्रिय विंशोत्तरी दशा काल" : "Current Active Vimshottari Period"}
            </div>

            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-white">
                {active.mahadasha} {isHi ? "महादशा" : "Mahadasha"}
              </span>
              <span className="text-amber-300 text-xl font-bold">/</span>
              <span className="text-xl font-serif font-semibold text-amber-200">
                {active.antardasha} {isHi ? "अंतर्दशा" : "Antardasha"}
              </span>
              <span className="text-amber-300 text-lg font-bold">/</span>
              <span className="text-base font-serif text-amber-300/90 font-medium">
                {active.pratyantardasha} {isHi ? "प्रत्यंतर्दशा" : "Pratyantar"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-amber-200/90 pt-1">
              <div className="flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-lg border border-amber-400/20">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {isHi ? "महादशा अवधि:" : "Mahadasha:"} {active.startDate} — {active.endDate}
                </span>
              </div>
              {active.antarStartDate && (
                <div className="flex items-center gap-1.5 bg-black/25 px-3 py-1.5 rounded-lg border border-amber-400/20">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {isHi ? "अंतर्दशा अवधि:" : "Antardasha:"} {active.antarStartDate} —{" "}
                    {active.antarEndDate}
                  </span>
                </div>
              )}
            </div>

            {theme.archetype && (
              <p className="text-xs text-amber-100/90 leading-relaxed max-w-2xl pt-1">
                <span className="font-semibold text-amber-300">
                  {isHi ? "दशा मूल प्रभाव:" : "Primary Influence:"}
                </span>{" "}
                {theme.archetype}. {theme.focus}
              </p>
            )}
          </div>

          {theme.sadhana && (
            <div className="bg-amber-950/40 backdrop-blur-md p-4 rounded-xl border border-amber-400/30 max-w-xs shrink-0 self-start">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs mb-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>{isHi ? "अनुशंसित साधना एवं जप" : "Recommended Sadhana"}</span>
              </div>
              <p className="text-[12px] text-amber-100/90 leading-relaxed">{theme.sadhana}</p>
            </div>
          )}
        </div>
      </div>

      {/* Dasha Balance Note */}
      <div className="flex items-center justify-between text-xs text-stone-600 bg-amber-50/70 p-3 rounded-xl border border-amber-200/60">
        <div>
          <span className="font-semibold text-stone-800">
            {isHi ? "जन्म समय दशा शेष:" : "Birth Dasha Balance:"}
          </span>{" "}
          <span className="font-mono text-amber-900 font-medium">{dasha.balanceText}</span>
        </div>
        <div className="text-stone-500">
          {isHi ? "चन्द्र नक्षत्र:" : "Moon Nakshatra:"}{" "}
          <span className="font-semibold text-stone-700">{chart.moon?.nakshatra}</span> (
          {chart.moon?.pada} {isHi ? "पाद" : "Pada"})
        </div>
      </div>

      {/* 9 Mahadasha Full Timeline Tree */}
      <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-amber-50/60 border-b border-amber-200/70 flex items-center justify-between">
          <h4 className="font-semibold text-sm text-stone-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600" />
            {isHi ? "सम्पूर्ण विंशोत्तरी दशा चक्र (120 वर्ष)" : "120-Year Vimshottari Dasha Hierarchy"}
          </h4>
          <span className="text-xs text-stone-500 font-mono">
            {isHi ? "महादशा → अंतर्दशा → प्रत्यंतर्दशा" : "Maha → Antar → Pratyantar"}
          </span>
        </div>

        <div className="divide-y divide-amber-100/80">
          {dasha.timeline.map((maha, mIdx) => {
            const isMahaExpanded = expandedMaha === mIdx;
            return (
              <div key={mIdx} className="transition-colors">
                {/* Mahadasha Row */}
                <div
                  onClick={() => setExpandedMaha(isMahaExpanded ? null : mIdx)}
                  className={`p-4 flex items-center justify-between cursor-pointer select-none hover:bg-amber-50/50 transition-colors ${
                    maha.isCurrent ? "bg-amber-100/40" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button className="text-stone-400 hover:text-stone-600 p-0.5">
                      {isMahaExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 text-sm">
                          {isHi ? maha.sanskritName || maha.lord : maha.lord}
                        </span>
                        {maha.isCurrent && (
                          <span className="bg-[#173d31] text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <CheckCircle2 className="w-3 h-3" />
                            {isHi ? "वर्तमान" : "Active"}
                          </span>
                        )}
                        {maha.isPartial && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                            {isHi ? "जन्म शेष" : "Balance"}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 font-mono mt-0.5">
                        {maha.startDate} → {maha.endDate} ({maha.durationYears}y)
                      </div>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 font-mono">
                    {maha.durationYears} {isHi ? "वर्ष" : "Yrs"}
                  </div>
                </div>

                {/* Antardasha Expansion */}
                {isMahaExpanded && maha.antardashas && (
                  <div className="bg-[#fcfaf5] p-4 pl-10 border-t border-amber-100 space-y-3">
                    <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                      {isHi ? `${maha.lord} में 9 अंतर्दशाएं (भुक्ति)` : `9 Antardashas under ${maha.lord}`}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {maha.antardashas.map((antar, aIdx) => {
                        const antarKey = `${mIdx}-${aIdx}`;
                        const isAntarExpanded = expandedAntar === antarKey;
                        return (
                          <div
                            key={aIdx}
                            className={`p-3 rounded-xl border text-xs transition-all ${
                              antar.isCurrent
                                ? "bg-amber-100/60 border-amber-400/80 shadow-xs ring-1 ring-amber-400/40"
                                : "bg-white border-amber-200/70 hover:border-amber-300"
                            }`}
                          >
                            <div
                              onClick={() => setExpandedAntar(isAntarExpanded ? null : antarKey)}
                              className="flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-stone-900">
                                  {maha.lord} - {antar.lord}
                                </span>
                                {antar.isCurrent && (
                                  <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.2 rounded font-bold">
                                    {isHi ? "सक्रिय" : "Active"}
                                  </span>
                                )}
                              </div>
                              <span className="text-stone-400 hover:text-stone-600">
                                {isAntarExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5" />
                                )}
                              </span>
                            </div>

                            <div className="text-[11px] text-stone-500 font-mono mt-1">
                              {antar.startDate} → {antar.endDate} ({antar.durationMonths}m)
                            </div>

                            {/* Pratyantardasha Sub-level Expansion */}
                            {isAntarExpanded && antar.pratyantardashas && (
                              <div className="mt-3 pt-2.5 border-t border-amber-200/60 space-y-1.5">
                                <div className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider">
                                  {isHi ? "9 प्रत्यंतर्दशाएं (सूक्ष्म)" : "9 Pratyantardashas"}
                                </div>
                                <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                                  {antar.pratyantardashas.map((p, pIdx) => (
                                    <div
                                      key={pIdx}
                                      className={`flex items-center justify-between p-1.5 rounded text-[11px] font-mono ${
                                        p.isCurrent
                                          ? "bg-amber-200/60 font-bold text-amber-950"
                                          : "hover:bg-amber-50 text-stone-700"
                                      }`}
                                    >
                                      <span>
                                        {maha.lord.slice(0, 2)}-{antar.lord.slice(0, 2)}-
                                        {p.lord.slice(0, 2)}
                                      </span>
                                      <span className="text-stone-500 text-[10px]">
                                        {p.startDate} ({p.durationDays}d)
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
