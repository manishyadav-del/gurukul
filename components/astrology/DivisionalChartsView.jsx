"use client";

import { useState } from "react";
import NorthIndianChart from "./NorthIndianChart";
import { DIVISIONAL_CHARTS_META } from "@/server/astrology/divisionalCharts";
import { Sparkles, Layers, BookOpen, Compass, Info } from "lucide-react";

export default function DivisionalChartsView({
  chart,
  language = "en",
  onPlanetClick = null,
}) {
  const [selectedVarga, setSelectedVarga] = useState("D9"); // Default to D9 Navamsha
  const isHi = language === "hi" || language === "hindi";

  if (!chart || !chart.divisionalCharts) {
    return (
      <div className="p-8 text-center text-stone-500 bg-[#fbf9f4] rounded-2xl border border-amber-200">
        {isHi
          ? "षोडशवर्ग (विभागीय कुंडलियां) गणना उपलब्ध नहीं है।"
          : "Divisional charts calculation is not available."}
      </div>
    );
  }

  const vargas = chart.divisionalCharts;
  const currentChart = vargas[selectedVarga] || vargas["D9"] || vargas["D1"];
  const meta = currentChart.meta || DIVISIONAL_CHARTS_META[selectedVarga] || {};

  const vargaGroups = [
    {
      groupName: isHi ? "प्रमुख वर्ग" : "Primary Varga",
      codes: ["D1", "D2", "D3", "D7", "D9", "D10", "D12"],
    },
    {
      groupName: isHi ? "उच्चतर षोडशवर्ग" : "Higher Shodashavarga",
      codes: ["D4", "D16", "D20", "D24", "D27", "D30", "D40", "D45", "D60"],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Description */}
      <div className="bg-gradient-to-r from-[#173d31] to-[#1d4d3e] p-6 rounded-2xl text-amber-50 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" />
              {isHi ? "महर्षि पराशर विरचित षोडशवर्ग" : "Maharshi Parashara's Shodashavarga"}
            </div>
            <h3 className="text-2xl font-serif text-white font-bold">
              {meta.name} ({meta.code}) — {meta.sanskritName}
            </h3>
            <p className="text-amber-200/90 text-sm mt-1 max-w-2xl">{meta.significance}</p>
          </div>
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-amber-400/30 self-start md:self-auto">
            <BookOpen className="w-4 h-4 text-amber-300" />
            <div className="text-xs">
              <div className="text-amber-300 font-semibold">{isHi ? "शास्त्रीय प्रमाण" : "Classical Authority"}</div>
              <div className="text-amber-100/90">{meta.classicalRef || "BPHS Ch. 6"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Varga Selector Pills */}
      <div className="space-y-3">
        {vargaGroups.map((group, gIdx) => (
          <div key={gIdx} className="bg-white/80 p-3 rounded-2xl border border-amber-100/80 shadow-xs">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2 px-1">
              {group.groupName}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.codes.map((code) => {
                const itemMeta = DIVISIONAL_CHARTS_META[code] || {};
                const isSelected = selectedVarga === code;
                return (
                  <button
                    key={code}
                    onClick={() => setSelectedVarga(code)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#173d31] text-amber-300 shadow-sm ring-2 ring-amber-400/40"
                        : "bg-amber-50/70 text-stone-700 hover:bg-amber-100/70 hover:text-stone-900 border border-amber-200/60"
                    }`}
                  >
                    <span className="font-bold">{code}</span>
                    <span className="text-[11px] opacity-80">{itemMeta.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart & Table Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chart Canvas */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-amber-200 shadow-sm flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4 pb-2 border-b border-amber-100">
            <div className="flex items-center gap-2 text-stone-800 font-semibold text-sm">
              <Compass className="w-4 h-4 text-amber-600" />
              <span>
                {meta.name} ({meta.code}) {isHi ? "चक्र" : "Chart"}
              </span>
            </div>
            <span className="text-xs font-mono bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/70 text-amber-900 font-medium">
              Lagna: {currentChart.ascendant.sign} ({currentChart.ascendant.degreeInVarga?.toFixed(1)}°)
            </span>
          </div>

          <div className="w-full max-w-[420px]">
            <NorthIndianChart
              chart={currentChart}
              language={language}
              onPlanetClick={onPlanetClick}
            />
          </div>

          {currentChart.ascendant.shashtiamshaDeity && (
            <div className="mt-4 w-full bg-amber-50/80 p-3 rounded-xl border border-amber-200/80 text-xs text-stone-700 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900">
                  {isHi ? "षष्ट्यंश देवता एवं प्रकृति:" : "Shashtiamsha Deity & Nature:"}
                </span>{" "}
                <span className="font-bold text-amber-800">
                  {currentChart.ascendant.shashtiamshaDeity}
                </span>{" "}
                (
                <span
                  className={
                    currentChart.ascendant.shashtiamshaNature === "Benefic"
                      ? "text-emerald-700 font-semibold"
                      : "text-amber-900 font-semibold"
                  }
                >
                  {currentChart.ascendant.shashtiamshaNature}
                </span>
                ) — {isHi ? "अतीव सूक्ष्म प्रारब्ध एवं कर्मफल" : "Reflects subtle karmic seeds."}
              </div>
            </div>
          )}
        </div>

        {/* Planets in this Varga Table */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-amber-50/60 border-b border-amber-200/70 flex items-center justify-between">
              <h4 className="font-semibold text-sm text-stone-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600" />
                {isHi ? `${meta.name} में ग्रह स्थिति` : `Planets in ${meta.name} (${meta.code})`}
              </h4>
              <span className="text-xs text-stone-500 font-mono">
                {currentChart.planets.length} {isHi ? "ग्रह" : "Grahas"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fcfaf5] text-stone-600 border-b border-amber-100">
                  <tr>
                    <th className="py-2.5 px-3.5 font-semibold">{isHi ? "ग्रह" : "Planet"}</th>
                    <th className="py-2.5 px-3 font-semibold">{isHi ? "राशि" : "Sign"}</th>
                    <th className="py-2.5 px-3 font-semibold">{isHi ? "भाव" : "House"}</th>
                    <th className="py-2.5 px-3 font-semibold">{isHi ? "अंश" : "Degree"}</th>
                    <th className="py-2.5 px-3.5 font-semibold">{isHi ? "स्वामी" : "Lord"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100/60">
                  {currentChart.planets.map((p, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-amber-50/50 transition-colors"
                      onClick={() => onPlanetClick && onPlanetClick(p.planet)}
                    >
                      <td className="py-2.5 px-3.5 font-medium text-stone-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        {isHi ? p.sanskritName || p.name : p.name}
                        {p.retrograde && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1 rounded font-bold">
                            {isHi ? "व" : "R"}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-stone-700">
                        {isHi ? p.sanskritSign || p.sign : p.sign}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-amber-900">
                        H{p.house}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-stone-600">
                        {p.degreeInVarga?.toFixed(1)}°
                      </td>
                      <td className="py-2.5 px-3.5 text-stone-500">{p.signLord}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Varga Purpose & Guidance Card */}
          <div className="bg-[#fbf9f4] p-4 rounded-2xl border border-amber-200/80 text-xs text-stone-700 space-y-2">
            <div className="font-semibold text-stone-900 flex items-center gap-1.5 text-amber-800">
              <BookOpen className="w-3.5 h-3.5" />
              {isHi ? "शास्त्रीय फलविचार एवं उपयोग" : "Classical Analytical Context"}
            </div>
            <p className="text-stone-600 leading-relaxed">
              {isHi
                ? `महर्षि पराशर के अनुसार ${meta.sanskritName} (${meta.code}) कुंडली का उपयोग विशेष रूप से '${meta.significance}' हेतु किया जाता है। मुख्य जन्मकुंडली (D1) के सूक्ष्म फलों को प्रमाणित करने के लिए संबंधित वर्ग का अवलोकन अनिवार्य है।`
                : `According to Maharshi Parashara, the ${meta.name} (${meta.code}) chart specifically uncovers '${meta.significance}'. It serves to confirm and refine indications visible in the primary D1 Rashi chart.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
