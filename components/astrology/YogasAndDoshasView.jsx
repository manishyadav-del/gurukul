"use client";

import { Sparkles, ShieldCheck, AlertCircle, BookOpen, Flame, Compass } from "lucide-react";

export default function YogasAndDoshasView({ chart, language = "en" }) {
  const isHi = language === "hi" || language === "hindi";

  if (!chart || !chart.yogasAndDoshas) {
    return (
      <div className="p-8 text-center text-stone-500 bg-[#fbf9f4] rounded-2xl border border-amber-200">
        {isHi ? "योग एवं दोष विश्लेषण उपलब्ध नहीं है।" : "Yoga and Dosha analysis is not available."}
      </div>
    );
  }

  const { yogas = [], doshas = [] } = chart.yogasAndDoshas;

  return (
    <div className="space-y-8">
      {/* 1. Classical Auspicious Yogas Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-amber-200">
          <div>
            <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600" />
              {isHi ? "कुंडली में निर्मित शुभ राजयोग" : "Auspicious Classical Yogas"}
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900 mt-0.5">
              {isHi ? "सत्यापित पारम्परिक योग" : "Verified Canonical Yogas"} ({yogas.length})
            </h3>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-3 py-1 rounded-full">
            {yogas.length} {isHi ? "योग सक्रिय" : "Active"}
          </span>
        </div>

        {yogas.length === 0 ? (
          <div className="p-6 text-center text-stone-500 bg-white rounded-2xl border border-amber-100 text-sm">
            {isHi
              ? "इस कुंडली में प्रमुख पंच महापुरुष अथवा गजकेसरी जैसे विशिष्ट योगों की शर्तें पूर्ण नहीं हैं।"
              : "No major primary Raja Yogas detected under strict BPHS conditions for this chart."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {yogas.map((y, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs hover:border-amber-400 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                      {y.category}
                    </span>
                    <h4 className="font-serif font-bold text-stone-900 text-base mt-1.5">{y.name}</h4>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                    {isHi ? "शुभ फलदायी" : "Auspicious"}
                  </span>
                </div>

                {y.shloka && (
                  <div className="bg-[#fcfaf5] p-2.5 rounded-xl border border-amber-100 font-serif text-xs text-amber-950/80 italic">
                    "{y.shloka}"
                  </div>
                )}

                <p className="text-xs text-stone-600 leading-relaxed">{y.explanation}</p>

                {y.classicalRef && (
                  <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-amber-600" />
                      {y.classicalRef}
                    </span>
                    <span className="font-mono text-emerald-700 font-medium">✓ Verified</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Classical Doshas & Gochara Influences Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-amber-200">
          <div>
            <div className="flex items-center gap-2 text-stone-600 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              {isHi ? "कर्म-शोधन, गोचर एवं ऊर्जा विचार" : "Karmic Balances & Planetary Considerations"}
            </div>
            <h3 className="text-xl font-serif font-bold text-stone-900 mt-0.5">
              {isHi ? "सचेत अवलोकन एवं मार्गदर्शन" : "Mindful Spiritual Guidance"} ({doshas.length})
            </h3>
          </div>
          <span className="text-xs bg-amber-100 text-amber-900 font-semibold px-3 py-1 rounded-full">
            {doshas.length} {isHi ? "पहलू समीक्षित" : "Evaluated"}
          </span>
        </div>

        {doshas.length === 0 ? (
          <div className="p-6 text-center text-stone-600 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-sm">
            {isHi
              ? "इस कुंडली में कोई गंभीर कालसर्प अथवा अनिर्वार्य मांगलिक दोष नहीं है। ग्रह ऊर्जा संतुलित है।"
              : "No afflictions or major nodal bindings detected. Planetary energies are harmoniously balanced."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doshas.map((d, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs hover:border-amber-400 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                      {d.category}
                    </span>
                    <h4 className="font-serif font-bold text-stone-900 text-base mt-1.5">{d.name}</h4>
                  </div>
                  {d.isCancelled ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300 shrink-0">
                      {isHi ? "दोष परिहार" : "Cancelled"}
                    </span>
                  ) : (
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300 shrink-0">
                      {isHi ? "सजगता" : "Mindfulness"}
                    </span>
                  )}
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">{d.explanation}</p>

                {d.classicalRef && (
                  <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-amber-600" />
                      {d.classicalRef}
                    </span>
                    <span className="font-mono text-amber-800 font-medium">BPHS Canonical</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
