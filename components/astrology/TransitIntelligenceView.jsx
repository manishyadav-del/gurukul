"use client";

import { useMemo } from "react";
import {
  Compass,
  Sparkles,
  Calendar,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Orbit,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { evaluatePredictiveTransits } from "@/server/astrology/transitIntelligence";

export default function TransitIntelligenceView({ chart, language = "en" }) {
  const isHi = language === "hi" || language === "hindi";

  const transitData = useMemo(() => {
    if (!chart) return null;
    try {
      return evaluatePredictiveTransits(chart, undefined, 5.5, language);
    } catch {
      return null;
    }
  }, [chart, language]);

  if (!chart || !transitData) {
    return (
      <div className="p-8 text-center text-stone-500 bg-[#fbf9f4] rounded-2xl border border-amber-200">
        {isHi ? "गोचर विश्लेषण गणना उपलब्ध नहीं है।" : "Transit intelligence calculation is not available."}
      </div>
    );
  }

  const { transitDetails = [], dashaSynergy, guruGochara, shaniGochara, transitAspects = [] } = transitData;

  return (
    <div className="space-y-6">
      {/* 1. Dasha-Transit Synergy Hero Card */}
      {dashaSynergy && (
        <div className="bg-gradient-to-r from-[#173d31] via-[#1d4d3e] to-[#25604e] p-6 rounded-2xl text-amber-50 shadow-md">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                {isHi ? "दशा-गोचर समन्वय (Dasha-Transit Synergy)" : "Dasha-Transit Synergy"}
              </div>
              <h3 className="text-xl font-serif font-bold text-white">
                {dashaSynergy.mahaLord} {isHi ? "महादशा स्वामी का गोचर प्रभाव" : "Active Mahadasha Ruler Transit"}
              </h3>
              <p className="text-xs text-amber-100/90 leading-relaxed max-w-2xl">
                {dashaSynergy.synergyExplanation}
              </p>
            </div>

            <div className="bg-black/25 px-4 py-2.5 rounded-xl border border-amber-400/30 text-xs shrink-0 self-start">
              <div className="text-amber-300 font-semibold">{isHi ? "समन्वय स्थिति" : "Synergy Status"}</div>
              <div className="text-white font-bold text-sm mt-0.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                {dashaSynergy.synergyStatus}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Guru & Shani Gochara Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Guru Gochara */}
        {guruGochara && (
          <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <h4 className="font-serif font-bold text-stone-900 text-base">
                  {isHi ? "गुरु गोचर (देवगुरु बृहस्पति)" : "Guru Gochara (Jupiter Transit)"}
                </h4>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  guruGochara.isAuspicious
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                {isHi
                  ? `चन्द्र से भाव ${guruGochara.houseFromMoon}`
                  : `H${guruGochara.houseFromMoon} from Moon`}
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">{guruGochara.description}</p>
          </div>
        )}

        {/* Shani Gochara / Sade Sati */}
        {shaniGochara && (
          <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                <h4 className="font-serif font-bold text-stone-900 text-base">
                  {shaniGochara.title || (isHi ? "शनि गोचर" : "Saturn Transit")}
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200">
                {isHi
                  ? `चन्द्र से भाव ${shaniGochara.houseFromMoon}`
                  : `H${shaniGochara.houseFromMoon} from Moon`}
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">{shaniGochara.description}</p>
          </div>
        )}
      </div>

      {/* 3. Real-Time Navagraha Transits Table */}
      <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-amber-50/60 border-b border-amber-200/70 flex items-center justify-between">
          <h4 className="font-semibold text-sm text-stone-800 flex items-center gap-2">
            <Orbit className="w-4 h-4 text-amber-600" />
            {isHi ? "वर्तमान नवग्रह गोचर स्थिति एवं अष्टकवर्ग" : "Current Navagraha Transits & Ashtakavarga"}
          </h4>
          <span className="text-xs text-stone-500 font-mono">
            {transitData.date}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fcfaf5] text-stone-700 border-b border-amber-100 font-semibold">
              <tr>
                <th className="py-2.5 px-3.5">{isHi ? "ग्रह" : "Planet"}</th>
                <th className="py-2.5 px-3">{isHi ? "गोचर राशि" : "Transit Sign"}</th>
                <th className="py-2.5 px-2 text-center">{isHi ? "लग्न से" : "From Lagna"}</th>
                <th className="py-2.5 px-2 text-center">{isHi ? "चन्द्र से" : "From Moon"}</th>
                <th className="py-2.5 px-3 text-center">{isHi ? "सर्वाष्टक बिंदु" : "Sarva Bindus"}</th>
                <th className="py-2.5 px-3">{isHi ? "गरिमा" : "Dignity"}</th>
                <th className="py-2.5 px-3.5">{isHi ? "गोचर फल" : "Gochara Status"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100/70">
              {transitDetails.map((t) => (
                <tr key={t.planet} className="hover:bg-amber-50/40 transition-colors">
                  <td className="py-2.5 px-3.5 font-bold text-stone-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    {isHi ? t.sanskritName || t.name : t.name}
                    {t.retrograde && (
                      <span className="text-[10px] bg-rose-100 text-rose-800 px-1 rounded font-bold">
                        {isHi ? "व" : "R"}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-stone-700">
                    {isHi ? t.sanskritSign : t.transitSign} ({t.transitDegree?.toFixed(1)}°)
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono font-medium text-amber-900">
                    H{t.houseFromLagna}
                  </td>
                  <td className="py-2.5 px-2 text-center font-mono font-medium text-purple-900">
                    H{t.houseFromMoon}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono">
                    {t.sarvaBindus !== null ? (
                      <span
                        className={`font-bold px-2 py-0.5 rounded ${
                          t.isAvFavorable
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {t.sarvaBindus}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-stone-600 text-[11px]">{t.dignity}</td>
                  <td className="py-2.5 px-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        t.status === "FAVORABLE"
                          ? "bg-emerald-100 text-emerald-800"
                          : t.status === "VEDHA_OBSTRUCTED"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-stone-100 text-stone-700"
                      }`}
                    >
                      {t.status === "FAVORABLE" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {t.status === "VEDHA_OBSTRUCTED" && <AlertCircle className="w-3 h-3 text-amber-600" />}
                      {t.status === "INTROSPECTIVE" && <ShieldCheck className="w-3 h-3 text-stone-500" />}
                      {t.summaryText}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Transit Conjunctions & Aspects to Natal Chart */}
      {transitAspects.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-3">
          <h4 className="font-semibold text-sm text-stone-800 flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-600" />
            {isHi
              ? "जन्मकालीन ग्रहों के साथ गोचर दृष्टि व युति"
              : "Active Transits to Natal Chart (Aspects & Conjunctions)"}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {transitAspects.map((ev, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-stone-700 space-y-1"
              >
                <div className="font-semibold text-stone-900 flex items-center justify-between">
                  <span>{ev.transitPlanetName} → {ev.natalPlanetName}</span>
                  <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                    {ev.type}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  {isHi ? ev.descriptionHi : ev.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
