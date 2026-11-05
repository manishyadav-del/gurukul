"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Compass,
  ArrowRight,
  Sun,
  Flame,
} from "lucide-react";
import { MUHURTA_ACTIVITIES } from "@/server/astrology/muhurtaPlanner";

export default function MuhurtaPlannerView({ language = "en" }) {
  const isHi = language === "hi" || language === "hindi";
  const [selectedActivity, setSelectedActivity] = useState("VYAPAR");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [muhurtaData, setMuhurtaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const activities = Object.values(MUHURTA_ACTIVITIES);

  const fetchMuhurta = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/astrology/muhurta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          activityKey: selectedActivity,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to fetch Muhurta.");
      }
      setMuhurtaData(data);
    } catch (err) {
      setError(err.message || "Failed to load Muhurta planner.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMuhurta();
  }, [selectedActivity, selectedDate, language]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#173d31] via-[#1d4d3e] to-[#25604e] p-6 rounded-2xl text-amber-50 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4" />
              {isHi ? "वैदिक मुहूर्त शास्त्र एवं काल विवेक" : "Vedic Electional Astrology (Muhurta Shastra)"}
            </div>
            <h3 className="text-2xl font-serif text-white font-bold">
              {isHi ? "शुभ मुहूर्त निर्धारक एवं समय चक्र" : "Advanced Auspicious Timing & Muhurta Planner"}
            </h3>
            <p className="text-amber-200/90 text-xs mt-1 max-w-2xl">
              {isHi
                ? "पञ्चाङ्ग के 5 अंगों (तिथि, वार, नक्षत्र, योग, करण) और अभिजित व चौघड़िया के आधार पर विशिष्ट कार्यों हेतु शुभ समय निर्धारण।"
                : "Activity-based electional planner evaluating the 5 limbs of Panchang, Abhijit Muhurta, Choghadiyas, and Rahu Kaal."}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-black/25 px-4 py-2.5 rounded-xl border border-amber-400/30 self-start md:self-auto text-xs">
            <Calendar className="w-4 h-4 text-amber-300" />
            <div>
              <span className="text-amber-300 font-semibold block">{isHi ? "चयनित तिथि" : "Selected Date"}</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-mono text-xs focus:outline-hidden cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Selector Pills */}
      <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-2">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block px-1">
          {isHi ? "कार्य / अनुष्ठान का चयन करें:" : "Choose Activity Category:"}
        </span>
        <div className="flex flex-wrap gap-2">
          {activities.map((act) => {
            const isSelected = selectedActivity === act.id;
            return (
              <button
                key={act.id}
                onClick={() => setSelectedActivity(act.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? "bg-[#173d31] text-amber-300 shadow-sm ring-2 ring-amber-400/30"
                    : "bg-amber-50/70 text-stone-700 hover:bg-amber-100 border border-amber-200/60"
                }`}
              >
                <span>{isHi ? act.nameHi : act.nameEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="p-6 text-center text-xs text-stone-500 bg-white rounded-2xl border border-amber-200 shadow-xs flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
          <span>{isHi ? "पंचांग मुहूर्त गणना जारी है..." : "Calculating Panchanga Muhurta..."}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Muhurta Evaluation Report */}
      {muhurtaData && !loading && (
        <div className="space-y-6">
          {/* Suitability Score Hero Card */}
          <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {isHi ? "मुहूर्त अनुकूलता स्तर" : "Muhurta Suitability Score"}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-serif font-bold text-[#173d31]">
                    {muhurtaData.suitabilityScore}%
                  </span>
                  <span
                    className={`ml-2 text-xs font-bold px-3 py-1 rounded-full ${
                      muhurtaData.verdict === "HIGHLY_AUSPICIOUS"
                        ? "bg-emerald-100 text-emerald-800"
                        : muhurtaData.verdict === "FAVORABLE"
                        ? "bg-amber-100 text-amber-900"
                        : "bg-rose-100 text-rose-900"
                    }`}
                  >
                    {muhurtaData.verdict}
                  </span>
                </div>
              </div>

              <div className="sm:text-right text-xs text-stone-600 space-y-1">
                <div>
                  <span className="font-semibold text-stone-800">{isHi ? "तिथि:" : "Tithi:"}</span>{" "}
                  {muhurtaData.panchangSummary?.tithi}
                </div>
                <div>
                  <span className="font-semibold text-stone-800">{isHi ? "नक्षत्र:" : "Nakshatra:"}</span>{" "}
                  {muhurtaData.panchangSummary?.nakshatra} • {muhurtaData.panchangSummary?.vara}
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed bg-[#fcfaf5] p-3.5 rounded-xl border border-amber-100">
              {muhurtaData.verdictText}
            </p>
          </div>

          {/* Time Windows Split: Recommended vs Caution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Recommended Auspicious Slots */}
            <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                <span className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {isHi ? "अनुशंसित शुभ समय (Auspicious Slots)" : "Recommended Auspicious Windows"}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  {muhurtaData.recommendedSlots.length} {isHi ? "उपलब्ध" : "Slots"}
                </span>
              </div>

              <div className="space-y-2.5">
                {muhurtaData.recommendedSlots.map((slot, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span>{slot.name}</span>
                      <span className="font-mono text-emerald-800">
                        {slot.start} — {slot.end}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">{slot.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Restricted / Caution Slots */}
            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                <span className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  {isHi ? "वर्जित / सतर्कता काल (Restricted Windows)" : "Restricted / Caution Windows"}
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                  {muhurtaData.restrictedSlots.length} {isHi ? "सचेत" : "Windows"}
                </span>
              </div>

              <div className="space-y-2.5">
                {muhurtaData.restrictedSlots.map((slot, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span>{slot.name}</span>
                      <span className="font-mono text-amber-900">
                        {slot.start} — {slot.end}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 leading-relaxed">{slot.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mindfulness Guidance */}
          <div className="bg-[#fbf9f4] p-4 rounded-2xl border border-amber-200 text-xs text-stone-700 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{muhurtaData.mindfulnessGuidance}</p>
          </div>
        </div>
      )}
    </div>
  );
}
