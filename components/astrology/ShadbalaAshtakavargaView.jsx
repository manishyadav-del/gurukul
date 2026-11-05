"use client";

import { useState } from "react";
import { Scale, CheckCircle2, AlertCircle, Info, Sparkles, Grid } from "lucide-react";

export default function ShadbalaAshtakavargaView({ chart, language = "en" }) {
  const [activeSubTab, setActiveSubTab] = useState("shadbala");
  const [selectedPlanetAV, setSelectedPlanetAV] = useState("SUN");
  const isHi = language === "hi" || language === "hindi";

  if (!chart || (!chart.shadbala && !chart.ashtakavarga)) {
    return (
      <div className="p-8 text-center text-stone-500 bg-[#fbf9f4] rounded-2xl border border-amber-200">
        {isHi
          ? "षड्बल एवं अष्टकवर्ग गणना उपलब्ध नहीं है।"
          : "Shadbala and Ashtakavarga calculations are not available."}
      </div>
    );
  }

  const shadbala = chart.shadbala || {};
  const av = chart.ashtakavarga || { sarvashtakavarga: [], bhinnashtakavarga: {} };
  const planetsList = Object.keys(shadbala);

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-3 border-b border-amber-200 pb-3">
        <button
          onClick={() => setActiveSubTab("shadbala")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeSubTab === "shadbala"
              ? "bg-[#173d31] text-amber-300 shadow-sm"
              : "bg-amber-50/70 text-stone-700 hover:bg-amber-100"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>{isHi ? "षड्बल (6 बल शक्ति)" : "Shadbala (6-fold Strength)"}</span>
        </button>

        <button
          onClick={() => setActiveSubTab("ashtakavarga")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeSubTab === "ashtakavarga"
              ? "bg-[#173d31] text-amber-300 shadow-sm"
              : "bg-amber-50/70 text-stone-700 hover:bg-amber-100"
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>{isHi ? "अष्टकवर्ग (सर्वाष्टक 337 बिंदु)" : "Ashtakavarga (337 Bindus)"}</span>
        </button>
      </div>

      {/* 1. SHADBALA VIEW */}
      {activeSubTab === "shadbala" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#173d31] to-[#1d4d3e] p-6 rounded-2xl text-amber-50 shadow-md">
            <h3 className="text-xl font-serif font-bold text-white mb-1">
              {isHi ? "महर्षि पराशर विरचित षड्बल शक्ति" : "Parashari 6-fold Shadbala Strength"}
            </h3>
            <p className="text-xs text-amber-200/90 leading-relaxed max-w-2xl">
              {isHi
                ? "षड्बल छह स्वतंत्र घटकों (स्थानबल, दिग्बल, कालबल, चेष्टाबल, नैसर्गिकबल, तथा दृग्बल) का समग्र योग है। 1 रूप = 60 विरूपा। जब कुल रूप न्यूनतम आवश्यकता से अधिक हो, तो ग्रह अपने शुभ फल पूर्ण सामर्थ्य से प्रदान करता है।"
                : "Shadbala synthesizes 6 independent astronomical strength components: Positional (Sthana), Directional (Dig), Temporal (Kala), Motional (Chesta), Natural (Naisargika), and Aspectual (Drik). 1 Rupa = 60 Virupas."}
            </p>
          </div>

          {/* Shadbala Table */}
          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fcfaf5] text-stone-700 border-b border-amber-200/70 font-semibold">
                  <tr>
                    <th className="py-3 px-3.5">{isHi ? "ग्रह" : "Planet"}</th>
                    <th className="py-3 px-2 text-center">{isHi ? "स्थान" : "Sthana"}</th>
                    <th className="py-3 px-2 text-center">{isHi ? "दिग्" : "Dig"}</th>
                    <th className="py-3 px-2 text-center">{isHi ? "काल" : "Kala"}</th>
                    <th className="py-3 px-2 text-center">{isHi ? "चेष्टा" : "Chesta"}</th>
                    <th className="py-3 px-2 text-center">{isHi ? "नैसर्गिक" : "Naisargika"}</th>
                    <th className="py-3 px-2 text-center">{isHi ? "दृग्" : "Drik"}</th>
                    <th className="py-3 px-3 text-right">{isHi ? "कुल रूप" : "Total Rupas"}</th>
                    <th className="py-3 px-3 text-right">{isHi ? "न्यूनतम" : "Req. Rupas"}</th>
                    <th className="py-3 px-4 text-center">{isHi ? "सामर्थ्य अनुपात" : "Strength Ratio"}</th>
                    <th className="py-3 px-4">{isHi ? "स्थिति" : "Status"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {planetsList.map((pKey) => {
                    const b = shadbala[pKey];
                    const percent = Math.min(150, Math.round(b.strengthRatio * 100));
                    return (
                      <tr key={pKey} className="hover:bg-amber-50/50 transition-colors">
                        <td className="py-3 px-3.5 font-bold text-stone-900 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                          {isHi ? b.sanskritName || b.name : b.name}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-stone-600">
                          {b.sthanaBala}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-stone-600">
                          {b.digBala}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-stone-600">
                          {b.kalaBala}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-stone-600">
                          {b.chestaBala}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-stone-600">
                          {b.naisargikaBala}
                        </td>
                        <td className="py-3 px-2 text-center font-mono text-stone-600">
                          {b.drikBala}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#173d31]">
                          {b.totalRupas}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-stone-500">
                          {b.minRequiredRupas}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="w-16 bg-stone-200 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  b.strengthRatio >= 1.25
                                    ? "bg-amber-500"
                                    : b.strengthRatio >= 1.0
                                    ? "bg-emerald-600"
                                    : "bg-rose-500"
                                }`}
                                style={{ width: `${Math.min(100, (percent / 150) * 100)}%` }}
                              ></div>
                            </div>
                            <span className="font-mono text-[11px] font-semibold text-stone-700">
                              {percent}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                              b.isSufficient
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-900"
                            }`}
                          >
                            {b.isSufficient ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                            )}
                            {b.statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. ASHTAKAVARGA VIEW */}
      {activeSubTab === "ashtakavarga" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#173d31] to-[#1d4d3e] p-6 rounded-2xl text-amber-50 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-white mb-1">
                  {isHi ? "सर्वाष्टकवर्ग (समुदाय अष्टकवर्ग)" : "Sarvashtakavarga (Samudaya Bindus)"}
                </h3>
                <p className="text-xs text-amber-200/90 leading-relaxed max-w-2xl">
                  {isHi
                    ? "महर्षि पराशर के नियमानुसार 8 दाताओं द्वारा 12 राशियों में कुल 337 शुभ बिंदु वितरित होते हैं। जिस राशि में 28 या अधिक बिंदु होते हैं, वह राशि गोचर और महत्वपूर्ण कार्यों हेतु अत्यंत शुभ मानी जाती है।"
                    : "Canonical 8-fold benefic distribution across 12 signs totaling exactly 337 bindus. Signs with 28 or more bindus are considered auspicious for major undertakings and transit benefits."}
                </p>
              </div>

              <div className="bg-black/25 px-4 py-2.5 rounded-xl border border-amber-400/30 self-start md:self-auto text-xs">
                <div className="text-amber-300 font-semibold">{isHi ? "कुल समुदाय बिंदु" : "Total Samudaya"}</div>
                <div className="text-white font-mono text-lg font-bold">
                  {av.totalBindus} / 337 <span className="text-xs text-emerald-300 font-normal">✓ BPHS</span>
                </div>
              </div>
            </div>
          </div>

          {/* 12 Signs Sarvashtakavarga Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {av.sarvashtakavarga.map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  item.isFavorable
                    ? "bg-emerald-50/70 border-emerald-300 shadow-xs"
                    : "bg-white border-amber-200"
                }`}
              >
                <div className="text-xs text-stone-500 font-medium">
                  {isHi ? item.sanskritName : item.signName}
                </div>
                <div
                  className={`text-2xl font-bold font-mono my-1 ${
                    item.isFavorable ? "text-emerald-700" : "text-amber-900"
                  }`}
                >
                  {item.bindus}
                </div>
                <div className="flex items-center justify-center gap-1 text-[11px] text-stone-500 font-mono">
                  <span>H{item.houseFromLagna}</span>
                  <span>•</span>
                  <span className={item.isFavorable ? "text-emerald-600 font-semibold" : "text-stone-400"}>
                    {item.isFavorable ? (isHi ? "शुभ" : "Favorable") : isHi ? "मध्यम" : "Moderate"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bhinnashtakavarga Selector (Individual Planet's Ashtakavarga) */}
          {av.bhinnashtakavarga && (
            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h4 className="font-semibold text-sm text-stone-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  {isHi ? "भिन्नाष्टकवर्ग (ग्रहवार बिंदु)" : "Bhinnashtakavarga (Individual Planet Bindus)"}
                </h4>

                <div className="flex flex-wrap gap-1.5">
                  {["SUN", "MOON", "MARS", "MERCURY", "JUPITER", "VENUS", "SATURN"].map((pKey) => (
                    <button
                      key={pKey}
                      onClick={() => setSelectedPlanetAV(pKey)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        selectedPlanetAV === pKey
                          ? "bg-[#173d31] text-amber-300 font-bold"
                          : "bg-amber-50 text-stone-700 hover:bg-amber-100"
                      }`}
                    >
                      {pKey}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Planet's Bindu Table */}
              {av.bhinnashtakavarga[selectedPlanetAV] && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 pt-2">
                  {av.bhinnashtakavarga[selectedPlanetAV].bindusBySign.map((bCount, sIdx) => (
                    <div
                      key={sIdx}
                      className="p-2.5 rounded-xl bg-[#fcfaf5] border border-amber-100 text-center"
                    >
                      <div className="text-[11px] text-stone-500">
                        {isHi ? av.sarvashtakavarga[sIdx]?.sanskritName : av.sarvashtakavarga[sIdx]?.signName?.slice(0, 3)}
                      </div>
                      <div className="text-base font-bold font-mono text-stone-900 mt-0.5">
                        {bCount}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
