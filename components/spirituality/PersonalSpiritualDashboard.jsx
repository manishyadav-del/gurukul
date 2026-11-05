"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  Sparkles,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  Bookmark,
  Calendar,
  Layers,
  Wind,
  Flower2,
  Compass,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function PersonalSpiritualDashboard({
  language = "en",
  onNavigateTab = null,
}) {
  const isHi = language === "hi" || language === "hindi";

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch spiritual dashboard metrics
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/spirituality/kundalini/progress");
      if (res.ok) {
        const json = await res.json();
        setMetrics(json.metrics);
      }
    } catch (err) {
      console.warn("Failed to load spiritual metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const totalChakras = metrics?.totalChakras || 7;
  const completedChakras = metrics?.completedChakrasCount || 0;
  const completionPercentage = metrics?.completionPercentage || Math.round((completedChakras / totalChakras) * 100);
  const currentStreak = metrics?.currentStreak || 0;
  const totalXp = metrics?.totalXp || 0;
  const level = metrics?.level || { level: 1, title: "Novice Seeker", sanskritTitle: "जिज्ञासु", progressPercent: 0 };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Progression Overview Card */}
      <div className="bg-gradient-to-br from-[#13382c] via-[#1a4b3b] to-stone-900 rounded-3xl p-6 sm:p-8 text-white shadow-md border border-[#1f5442] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isHi ? "मेरी साधना एवं प्रगति" : "Personal Sadhana & Progress"}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
              Spiritual Learning Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl font-sans">
              Track your daily meditation, classical pranayama cycles, chakra studies, and sacred mantra reflections in one unified space.
            </p>
          </div>

          {/* Current Level Badge */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/15 self-start sm:self-auto">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center font-bold text-lg shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 block">
                Level {level.level} • {level.sanskritTitle}
              </span>
              <span className="text-sm font-bold text-white font-serif block">
                {level.title}
              </span>
              <span className="text-[11px] font-mono text-stone-300">
                {totalXp} Total XP
              </span>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-200">
            <span>Level {level.level} Progression</span>
            <span>{level.progressPercent || 0}% Complete</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${level.progressPercent || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Streak */}
        <div className="bg-white rounded-2xl border border-[#ede5d6] p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 font-sans">Daily Streak</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-stone-900">{currentStreak}</span>
            <span className="text-xs text-stone-500 font-sans">consecutive days</span>
          </div>
          <span className="text-[10px] text-stone-400 block">
            Longest record: {metrics?.longestStreak || currentStreak} days
          </span>
        </div>

        {/* Metric 2: Chakras Studied */}
        <div className="bg-white rounded-2xl border border-[#ede5d6] p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 font-sans">Chakra Lessons</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Flower2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-stone-900">
              {completedChakras} / {totalChakras}
            </span>
            <span className="text-xs text-emerald-700 font-bold">({completionPercentage}%)</span>
          </div>
          <span className="text-[10px] text-stone-400 block">
            {7 - completedChakras} remaining to complete curriculum
          </span>
        </div>

        {/* Metric 3: Meditation Minutes */}
        <div className="bg-white rounded-2xl border border-[#ede5d6] p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 font-sans">Meditation</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-stone-900">
              {metrics?.meditationMinutesTotal || 0}
            </span>
            <span className="text-xs text-stone-500 font-sans">minutes practiced</span>
          </div>
          <span className="text-[10px] text-stone-400 block">
            {metrics?.meditationSessionsCount || 0} recorded sessions
          </span>
        </div>

        {/* Metric 4: Pranayama & Breathwork */}
        <div className="bg-white rounded-2xl border border-[#ede5d6] p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 font-sans">Pranayama</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-stone-900">
              {metrics?.pranayamaMinutesTotal || 0}
            </span>
            <span className="text-xs text-stone-500 font-sans">minutes breathing</span>
          </div>
          <span className="text-[10px] text-stone-400 block">
            {metrics?.pranayamaSessionsCount || 0} recorded sessions
          </span>
        </div>
      </div>

      {/* Two Column Layout: Saved Reflection Notes + Next Recommended Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* --- LEFT: SAVED REFLECTION NOTES & BOOKMARKS --- */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#ede5d6] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#ede5d6]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#c4903c]" />
              <h3 className="font-serif font-bold text-base text-stone-900">
                Saved Reflection Notes ({metrics?.savedNotes?.length || 0})
              </h3>
            </div>
            <button
              onClick={fetchMetrics}
              className="text-xs text-[#13382c] hover:underline font-bold"
            >
              Refresh
            </button>
          </div>

          {!metrics?.savedNotes || metrics.savedNotes.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-xs text-stone-500">
                You haven&apos;t saved any contemplation notes yet. Visit any Chakra in the Chakra Studio to write reflections.
              </p>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab("chakras")}
                  className="px-4 py-1.5 rounded-xl bg-[#13382c] text-white text-xs font-bold hover:bg-[#1a4a3a] transition inline-flex items-center gap-1.5"
                >
                  <span>Explore Chakras</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {metrics.savedNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-xs text-stone-900">
                      {note.term}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    {note.notes}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- RIGHT: SUGGESTED NEXT LESSONS & QUICK PRACTICE --- */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#ede5d6] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#ede5d6]">
            <TrendingUp className="w-4 h-4 text-[#c4903c]" />
            <h3 className="font-serif font-bold text-base text-stone-900">
              Suggested Next Lessons
            </h3>
          </div>

          <div className="space-y-3">
            {/* Suggested 1 */}
            <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] space-y-2 hover:border-amber-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase">
                  Daily Breathwork
                </span>
                <span className="text-[10px] text-stone-400 font-mono">5 min</span>
              </div>
              <span className="font-serif font-bold text-sm text-stone-900 block">
                Nadi Shodhana Pranayama
              </span>
              <p className="text-xs text-stone-600 line-clamp-2">
                Balance lunar (Ida) and solar (Pingala) nervous channels before midday study.
              </p>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab("pranayama")}
                  className="text-xs font-bold text-[#13382c] hover:underline flex items-center gap-1 mt-1"
                >
                  <span>Begin Practice</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Suggested 2 */}
            <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] space-y-2 hover:border-amber-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold uppercase">
                  Meditation
                </span>
                <span className="text-[10px] text-stone-400 font-mono">10 min</span>
              </div>
              <span className="font-serif font-bold text-sm text-stone-900 block">
                Prana Samyama — Ocean of Breath
              </span>
              <p className="text-xs text-stone-600 line-clamp-2">
                Attune to the natural transition points of in-breath and out-breath from the Gita.
              </p>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab("meditation")}
                  className="text-xs font-bold text-[#13382c] hover:underline flex items-center gap-1 mt-1"
                >
                  <span>Begin Practice</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Suggested 3 */}
            <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] space-y-2 hover:border-amber-300 transition">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase">
                  Sanskrit Shastra
                </span>
                <span className="text-[10px] text-stone-400 font-mono">Word-by-word</span>
              </div>
              <span className="font-serif font-bold text-sm text-stone-900 block">
                Shat-Chakra-Nirupana (Verse 4)
              </span>
              <p className="text-xs text-stone-600 line-clamp-2">
                Explore the original Sanskrit meters and Pada-chheda of Muladhara Lotus.
              </p>
              {onNavigateTab && (
                <button
                  onClick={() => onNavigateTab("shlokas")}
                  className="text-xs font-bold text-[#13382c] hover:underline flex items-center gap-1 mt-1"
                >
                  <span>Study Shloka</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
