"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sun, Moon, Star, Clock, Compass, AlertCircle, Sparkles,
  ArrowRight, Target, Loader2, Check, Shield, CheckCircle2,
  Palette, Share2, CheckCheck,
} from "lucide-react";
import { QUICK_TASK_PROMPTS } from "@/components/astrology/muhurtaConstants";

export default function HomeDailyAstro({ initialPanchang }) {
  const [panchang] = useState(initialPanchang);

  // Quick task feasibility checker state
  const [taskQuery, setTaskQuery] = useState("");
  const [taskEvaluating, setTaskEvaluating] = useState(false);
  const [taskResult, setTaskResult] = useState(null);
  const [taskError, setTaskError] = useState(null);

  const handleEvaluateTask = async (customTask) => {
    const text = customTask || taskQuery;
    if (!text || text.trim().length < 3) return;
    setTaskEvaluating(true);
    setTaskError(null);
    try {
      const res = await fetch("/api/astrology/daily/check-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: text.trim(),
          date: panchang?.date,
          lat: panchang?.latitude || 28.6139,
          lon: panchang?.longitude || 77.209,
          tz: panchang?.tzOffset || 5.5,
          timezone: panchang?.timezone || "Asia/Kolkata",
          language: "hi",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to evaluate task");
      setTaskResult(data.evaluation);
    } catch (err) {
      setTaskError(err.message);
    } finally {
      setTaskEvaluating(false);
    }
  };

  if (!panchang) return null;

  const { tithi, nakshatra, yoga, karana, vara, moonSign, rahuKaal, luckyMetrics, choghadiya } = panchang;
  const currentChoghadiya = choghadiya?.current || choghadiya?.day?.[0];

  return (
    <section className="bg-gradient-to-br from-[#1a140d] via-[#241a10] to-[#17120a] text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-amber-600/30 relative overflow-hidden">
      {/* Background Decorative Cosmic Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

      <div className="relative z-10 space-y-6">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1.5 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>आज का वैदिक पंचांग व दैनिक मार्गदर्शन • Daily Cosmic Guide</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-amber-100 flex items-center gap-2">
              <span>दैनिक राशिफल व कार्य सिद्धि मुहूर्त</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-stone-300 bg-stone-900/80 px-3 py-1.5 rounded-xl border border-stone-700/80">
              📅 {vara?.hi} ({vara?.en}), {panchang.date}
            </span>
            <Link
              href="/astrology/daily"
              className="text-xs font-bold bg-amber-600 hover:bg-amber-500 text-stone-950 px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 shadow-xs shrink-0 cursor-pointer"
            >
              <span>पूर्ण राशिफल</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Essential Panchang Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Tithi */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Sun className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">तिथि (Tithi)</p>
              <p className="text-xs sm:text-sm font-bold text-amber-100 truncate mt-0.5">
                {tithi?.paksha} {tithi?.devanagari}
              </p>
            </div>
          </div>

          {/* Nakshatra */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">नक्षत्र (Nakshatra)</p>
              <p className="text-xs sm:text-sm font-bold text-purple-100 truncate mt-0.5">
                {nakshatra?.devanagari} (पाद {nakshatra?.pada})
              </p>
            </div>
          </div>

          {/* Moon Sign */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-300 flex items-center justify-center shrink-0">
              <Moon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">चंद्र राशि (Moon Sign)</p>
              <p className="text-xs sm:text-sm font-bold text-sky-100 truncate mt-0.5">
                {moonSign?.sanskritName}
              </p>
            </div>
          </div>

          {/* Rahu Kaal */}
          <div className="bg-stone-900/80 border border-stone-800 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">राहुकाल (वर्ज्य काल)</p>
              <p className="text-xs sm:text-sm font-bold text-rose-200 truncate mt-0.5">
                {rahuKaal ? `${rahuKaal.startLocal} – ${rahuKaal.endLocal}` : "उपलब्ध नहीं"}
              </p>
            </div>
          </div>
        </div>

        {/* Lucky Alignment & Live Choghadiya Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Lucky Metrics (7 Cols) */}
          <div className="md:col-span-7 bg-stone-900/60 border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>आज के शुभ संकेत (Lucky Metrics)</span>
              </span>
              <span className="text-[11px] text-stone-400">वार स्वामी: {vara?.lordHi}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Lucky Color */}
              <div className="bg-stone-950/70 border border-stone-800 p-2.5 rounded-xl flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg border border-white/20 shrink-0"
                  style={{ backgroundColor: luckyMetrics?.colorHex || "#EA580C" }}
                />
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">शुभ रंग</span>
                  <span className="text-xs font-bold text-stone-200 truncate block">
                    {luckyMetrics?.colorHi || "लाल"}
                  </span>
                </div>
              </div>

              {/* Lucky Number */}
              <div className="bg-stone-950/70 border border-stone-800 p-2.5 rounded-xl flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 font-bold font-serif text-sm flex items-center justify-center shrink-0">
                  #
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">शुभ अंक</span>
                  <span className="text-xs font-bold text-stone-200 truncate block">
                    {luckyMetrics?.number || "3"}
                  </span>
                </div>
              </div>

              {/* Best Direction */}
              <div className="bg-stone-950/70 border border-stone-800 p-2.5 rounded-xl flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-stone-400 block">शुभ दिशा</span>
                  <span className="text-xs font-bold text-stone-200 truncate block">
                    {luckyMetrics?.directionHi || "उत्तर"}
                  </span>
                </div>
              </div>
            </div>

            {luckyMetrics?.mantra && (
              <p className="text-[11px] text-amber-200/90 mt-2.5 pt-2 border-t border-stone-800/80 truncate">
                <span className="font-semibold text-amber-400">दैनिक जप: </span>
                {luckyMetrics.mantra}
              </p>
            )}
          </div>

          {/* Live Choghadiya (5 Cols) */}
          <div className="md:col-span-5 bg-stone-900/60 border border-amber-500/20 rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>वर्तमान चौघड़िया मुहूर्त</span>
              </span>
              <span className="text-[9px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full animate-pulse">
                LIVE
              </span>
            </div>

            {currentChoghadiya ? (
              <div className="bg-stone-950/70 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base text-amber-100">
                      {currentChoghadiya.nameHi}
                    </span>
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded">
                      {currentChoghadiya.nature}
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 font-medium mt-1">
                    समय: {currentChoghadiya.startLocal} – {currentChoghadiya.endLocal}
                  </p>
                </div>
                <div className="text-right text-[10px] text-stone-400">
                  <span>स्वामी: {currentChoghadiya.lord}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-400">चौघड़िया उपलब्ध है</p>
            )}

            <div className="mt-2 text-right">
              <Link
                href="/astrology/daily#choghadiya"
                className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
              >
                सभी 16 चौघड़िया मुहूर्त देखें →
              </Link>
            </div>
          </div>
        </div>

        {/* Interactive "Will My Work Succeed Today?" (कार्य अनुकूलता जांचें) */}
        <div className="bg-stone-950/80 border border-amber-500/30 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif font-bold text-sm sm:text-base text-white">
              कार्य अनुकूलता जांचें — क्या आज मेरा काम बनेगा?
            </h3>
          </div>
          <p className="text-xs text-stone-300 mb-3">
            अपना कोई भी कार्य या योजना लिखें (उदा. इंटरव्यू, एग्रीमेंट, यात्रा या प्रोजेक्ट) — आज के पंचांग के अनुसार तुरंत जांचें।
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={taskQuery}
              onChange={(e) => setTaskQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEvaluateTask();
              }}
              placeholder="उदा. 'आज 2 बजे नौकरी का इंटरव्यू है', या 'क्या आज वाहन क्रय करना ठीक रहेगा?'"
              className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-stone-400 focus:outline-hidden focus:border-amber-400"
            />
            <button
              type="button"
              disabled={taskEvaluating || !taskQuery.trim() || taskQuery.trim().length < 3}
              onClick={() => handleEvaluateTask()}
              className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shrink-0"
            >
              {taskEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                  <span>जांच जारी...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-stone-950" />
                  <span>अनुकूलता जांचें</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Idea Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span className="text-[10px] text-amber-300/80 font-medium">त्वरित चयन:</span>
            {QUICK_TASK_PROMPTS.slice(0, 4).map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTaskQuery(p.hi);
                  handleEvaluateTask(p.hi);
                }}
                className="text-[11px] bg-stone-900/80 hover:bg-amber-950/60 text-stone-300 border border-stone-800 hover:border-amber-500/50 px-2 py-0.5 rounded-lg transition cursor-pointer"
              >
                {p.hi}
              </button>
            ))}
          </div>

          {taskError && (
            <div className="mt-3 p-2.5 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{taskError}</span>
            </div>
          )}

          {/* Task Evaluation Result Preview */}
          {taskResult && (
            <div className="mt-4 bg-stone-900 border border-amber-500/40 rounded-xl p-4 text-stone-200 space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-amber-300 text-sm">
                  {taskResult.verdict?.hi}
                </span>
                <span className="text-amber-400 text-xs">
                  {"★".repeat(taskResult.score || 3)}{"☆".repeat(Math.max(0, 5 - (taskResult.score || 3)))}
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                {taskResult.feasibilityAnalysis?.hi}
              </p>
              {taskResult.optimalTimeWindow && (
                <p className="text-[11px] text-amber-200 bg-amber-950/40 px-2.5 py-1.5 rounded-lg border border-amber-800/40">
                  <span className="font-bold">शुभ समय: </span>
                  {taskResult.optimalTimeWindow.hi}
                </p>
              )}
              <div className="pt-1 text-right">
                <Link
                  href="/astrology/daily#work-checker"
                  className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
                >
                  विस्तृत सावधानियां व पूर्ण उपाय देखें →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
