"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Heart,
  ShieldAlert,
  Compass,
  ArrowRight,
  Bookmark,
  Check,
  Copy,
  Info,
  Flame,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Feather,
  Flower2,
} from "lucide-react";

const CITIES = [
  { name: "New Delhi, India", lat: 28.6139, lon: 77.2090, tz: 5.5, timezone: "Asia/Kolkata" },
  { name: "Varanasi, India", lat: 25.3176, lon: 82.9739, tz: 5.5, timezone: "Asia/Kolkata" },
  { name: "Haridwar, India", lat: 29.9457, lon: 78.1642, tz: 5.5, timezone: "Asia/Kolkata" },
  { name: "Ujjain, India", lat: 23.1765, lon: 75.7885, tz: 5.5, timezone: "Asia/Kolkata" },
  { name: "Mumbai, India", lat: 19.0760, lon: 72.8777, tz: 5.5, timezone: "Asia/Kolkata" },
  { name: "Bengaluru, India", lat: 12.9716, lon: 77.5946, tz: 5.5, timezone: "Asia/Kolkata" },
];

export default function DailyGuidanceClient() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [language, setLanguage] = useState("en"); // "en" | "hi"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [expandedRemedyId, setExpandedRemedyId] = useState(null);
  const [completedRemedies, setCompletedRemedies] = useState({});
  const [bookmarkedRemedies, setBookmarkedRemedies] = useState({});
  const [copiedMantraId, setCopiedMantraId] = useState(null);

  useEffect(() => {
    async function fetchGuidance() {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams({
          date: selectedDate,
          lat: String(selectedCity.lat),
          lon: String(selectedCity.lon),
          tz: String(selectedCity.tz),
          timezone: selectedCity.timezone,
          language,
        });

        const res = await fetch(`/api/astrology/daily-guidance?${query.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to load daily guidance (HTTP ${res.status})`);
        }
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.error || "Could not retrieve daily guidance");
        }
        setData(json);

        // Populate initial completion and bookmark state
        const initialCompleted = {};
        const initialBookmarked = {};
        if (json.guidance?.recommendedPractices) {
          json.guidance.recommendedPractices.forEach((r) => {
            if (r.isCompleted) initialCompleted[r.id] = true;
            if (r.isBookmarked) initialBookmarked[r.id] = true;
          });
        }
        setCompletedRemedies(initialCompleted);
        setBookmarkedRemedies(initialBookmarked);
      } catch (err) {
        console.error("Daily guidance fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGuidance();
  }, [selectedDate, selectedCity, language]);

  const handleToggleComplete = async (remedy) => {
    const isNowCompleted = !completedRemedies[remedy.id];
    setCompletedRemedies((prev) => ({ ...prev, [remedy.id]: isNowCompleted }));

    try {
      await fetch("/api/astrology/daily-guidance/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          remedyId: remedy.id,
          practiceDate: selectedDate,
          action: isNowCompleted ? "complete" : "uncomplete",
        }),
      });
    } catch (e) {
      // Local state already updated
    }
  };

  const handleToggleBookmark = async (remedy) => {
    const isNowBookmarked = !bookmarkedRemedies[remedy.id];
    setBookmarkedRemedies((prev) => ({ ...prev, [remedy.id]: isNowBookmarked }));

    try {
      await fetch("/api/astrology/daily-guidance/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          remedyId: remedy.id,
          practiceDate: selectedDate,
          action: isNowBookmarked ? "bookmark" : "unbookmark",
        }),
      });
    } catch (e) {
      // Local state already updated
    }
  };

  const handleCopyMantra = (id, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedMantraId(id);
    setTimeout(() => setCopiedMantraId(null), 2000);
  };

  const panchang = data?.panchang;
  const guidance = data?.guidance;

  return (
    <div className="bg-[#fcfaf5] min-h-screen py-6 sm:py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header & Navigation Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#ede5d6]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#faf5ec] text-[#c4903c] border border-[#ede5d6] uppercase tracking-wider">
                Vedic Daily Guidance
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs font-medium text-stone-500">
                Brihat Parashara & Classical Shanti
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight mt-1">
              Daily Vedic Remedies & Puja Recommendations
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
              Traditional planetary remedies, mantra japa, and mindful conduct synchronized with today's verified astronomical Panchang.
            </p>
          </div>

          {/* Controls: Date, City, Language */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Input */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#ede5d6] text-xs font-medium text-stone-700 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs text-stone-700 focus:outline-none cursor-pointer"
              />
            </div>

            {/* City Selector */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#ede5d6] text-xs font-medium text-stone-700 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <select
                value={selectedCity.name}
                onChange={(e) => {
                  const found = CITIES.find((c) => c.name === e.target.value);
                  if (found) setSelectedCity(found);
                }}
                className="bg-transparent text-xs text-stone-700 focus:outline-none cursor-pointer pr-1"
              >
                {CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Toggle */}
            <div className="inline-flex rounded-xl bg-white border border-[#ede5d6] p-0.5 text-xs font-medium text-stone-700 shadow-2xs">
              <button
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded-lg transition ${
                  language === "en" ? "bg-[#13382c] text-white" : "hover:text-stone-900"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("hi")}
                className={`px-2.5 py-1 rounded-lg transition ${
                  language === "hi" ? "bg-[#13382c] text-white" : "hover:text-stone-900"
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Quick Links */}
            <Link
              href="/spirituality/kundalini"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#faf5ec] border border-[#ede5d6] text-xs font-semibold text-[#13382c] hover:bg-[#f3ebe0] transition shadow-2xs"
            >
              <Flower2 className="w-3.5 h-3.5 text-[#c4903c]" />
              <span>Kundalini Education</span>
            </Link>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="bg-white rounded-2xl border border-[#ede5d6] p-12 text-center shadow-2xs space-y-3">
            <div className="w-8 h-8 border-2 border-[#13382c] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-serif text-stone-700">Calculating Astronomical Panchang & Aligning Vedic Remedies...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-red-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Unable to compute daily guidance</span>
            </div>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && guidance && (
          <>
            {/* Section 1: Today's Overview & Panchang Banner */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Main Panchang Card */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-[#ede5d6] p-6 shadow-2xs relative overflow-hidden space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-[#c4903c] uppercase tracking-wider">
                      Today's Astronomical Theme
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 mt-0.5">
                      {guidance.weekday} ({guidance.weekdayHi}) — Lorded by {guidance.rulingPlanet} ({guidance.rulingPlanetHi})
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#fcfaf5] border border-[#ede5d6] text-stone-700">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>{guidance.panchangSummary?.sunrise}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#fcfaf5] border border-[#ede5d6] text-stone-700">
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{guidance.panchangSummary?.sunset}</span>
                    </span>
                  </div>
                </div>

                {/* Panchang Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-[#faf8f4] border border-[#ede5d6]/70">
                    <span className="text-[11px] font-medium text-stone-400 block">Tithi</span>
                    <span className="text-xs font-bold text-stone-800 block mt-0.5 truncate">
                      {guidance.panchangSummary?.tithi}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#faf8f4] border border-[#ede5d6]/70">
                    <span className="text-[11px] font-medium text-stone-400 block">Nakshatra</span>
                    <span className="text-xs font-bold text-stone-800 block mt-0.5 truncate">
                      {guidance.panchangSummary?.nakshatra}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#faf8f4] border border-[#ede5d6]/70">
                    <span className="text-[11px] font-medium text-stone-400 block">Yoga & Karana</span>
                    <span className="text-xs font-bold text-stone-800 block mt-0.5 truncate">
                      {guidance.panchangSummary?.yoga} / {guidance.panchangSummary?.karana}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#faf8f4] border border-[#ede5d6]/70">
                    <span className="text-[11px] font-medium text-stone-400 block">Moon Sign (Rashi)</span>
                    <span className="text-xs font-bold text-stone-800 block mt-0.5 truncate">
                      {guidance.panchangSummary?.moonSign}
                    </span>
                  </div>
                </div>

                {/* Rahu Kaal Alert Banner */}
                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-amber-950 block">
                        Rahu Kaal Window Today: {guidance.panchangSummary?.rahuKaal}
                      </span>
                      <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                        Traditional observational window: avoid starting major inaugural contracts. Ideal for routine work or quiet reflection.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/astrology/daily#choghadiya"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 hover:underline shrink-0"
                  >
                    <span>Full Choghadiya</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

              {/* Personalized Insight / Opt-In Box */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-[#ede5d6] p-6 shadow-2xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#c4903c]" />
                    <h3 className="font-serif font-bold text-base text-stone-900">
                      Personalized Alignment
                    </h3>
                  </div>

                  {guidance.personalizedGuidance?.isAvailable ? (
                    <div className="mt-3 space-y-2.5">
                      <div className="p-3 rounded-xl bg-[#faf5ec] border border-[#ede5d6] text-xs space-y-1">
                        <span className="font-semibold text-stone-900 block">
                          Profile: {guidance.personalizedGuidance.profileName}
                        </span>
                        <span className="text-[11px] text-stone-600 block">
                          Moon in {typeof guidance.personalizedGuidance.userMoonSign === "object"
                            ? guidance.personalizedGuidance.userMoonSign?.sign || guidance.personalizedGuidance.userMoonSign?.name || "Aries"
                            : String(guidance.personalizedGuidance.userMoonSign || "Aries")} • Lagna {typeof guidance.personalizedGuidance.userAscendant === "object"
                            ? guidance.personalizedGuidance.userAscendant?.sign || guidance.personalizedGuidance.userAscendant?.name || "Aries"
                            : String(guidance.personalizedGuidance.userAscendant || "Aries")}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {guidance.personalizedGuidance.astrologicalInsight}
                      </p>
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 font-medium">
                        Focus: {guidance.personalizedGuidance.recommendedFocus}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-3">
                      <p className="text-xs text-stone-600 leading-relaxed">
                        General daily guidance is currently displayed. Connect your birth profile to unlock recommendations tailored to your natal Moon sign and current transit alignments.
                      </p>
                      <Link
                        href="/dashboard/profile"
                        className="inline-flex items-center justify-center w-full px-4 py-2 rounded-xl bg-[#13382c] text-white text-xs font-semibold hover:bg-[#1b4b3c] transition shadow-xs"
                      >
                        Select or Create Birth Profile
                      </Link>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Classical Parashari Methodology</span>
                  <Compass className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Section 2: Recommended Spiritual Practices (3 to 5 Prioritized Cards) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
                    Recommended Practices for Today
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Prioritized by weekday relevance, accessible materials, and non-commercial classical traditions.
                  </p>
                </div>
                <div className="text-xs text-stone-500 font-medium">
                  {Object.values(completedRemedies).filter(Boolean).length} of{" "}
                  {guidance.recommendedPractices?.length || 0} completed
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {guidance.recommendedPractices?.map((remedy, idx) => {
                  const isExpanded = expandedRemedyId === remedy.id;
                  const isCompleted = Boolean(completedRemedies[remedy.id]);
                  const isBookmarked = Boolean(bookmarkedRemedies[remedy.id]);

                  return (
                    <div
                      key={remedy.id || idx}
                      className={`bg-white rounded-2xl border transition shadow-2xs flex flex-col justify-between overflow-hidden ${
                        isCompleted
                          ? "border-emerald-300 bg-emerald-50/20"
                          : "border-[#ede5d6] hover:border-[#d9cbba]"
                      }`}
                    >
                      <div className="p-5 space-y-3.5">
                        {/* Top Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#faf5ec] text-[#c4903c] border border-[#ede5d6] uppercase">
                              {remedy.category}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-600">
                              {remedy.costLevel}
                            </span>
                            {remedy.durationMinutes && (
                              <span className="text-[11px] text-stone-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {remedy.durationMinutes}m
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleToggleBookmark(remedy)}
                              className={`p-1.5 rounded-lg transition ${
                                isBookmarked
                                  ? "text-[#c4903c] bg-[#faf5ec]"
                                  : "text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                              }`}
                              title="Bookmark practice"
                            >
                              <Bookmark className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleComplete(remedy)}
                              className={`p-1.5 rounded-lg transition ${
                                isCompleted
                                  ? "text-emerald-700 bg-emerald-100"
                                  : "text-stone-400 hover:text-emerald-700 hover:bg-emerald-50"
                              }`}
                              title={isCompleted ? "Completed" : "Mark as completed"}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Deity */}
                        <div>
                          <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide block">
                            {remedy.deity} • {remedy.planetaryAssociation}
                          </span>
                          <h3 className="text-base font-bold font-serif text-stone-900 mt-0.5 leading-snug">
                            {remedy.title}
                          </h3>
                        </div>

                        {/* Purpose */}
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {remedy.purpose}
                        </p>

                        {/* Sanskrit Mantra Display */}
                        {remedy.sanskritMantra && (
                          <div className="p-3 rounded-xl bg-[#faf8f4] border border-[#ede5d6] space-y-1.5 relative">
                            <div className="flex items-center justify-between text-[11px] font-medium text-stone-400">
                              <span>Sanskrit Mantra</span>
                              <button
                                onClick={() => handleCopyMantra(remedy.id, remedy.sanskritMantra)}
                                className="inline-flex items-center gap-1 text-[10px] text-[#13382c] hover:underline"
                              >
                                {copiedMantraId === remedy.id ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-600" />
                                    <span>Copied</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <p className="text-sm font-serif font-bold text-stone-900 leading-relaxed font-sanskrit">
                              {remedy.sanskritMantra}
                            </p>
                            {remedy.transliteration && (
                              <p className="text-[11px] text-stone-500 italic">
                                {remedy.transliteration}
                              </p>
                            )}
                            {remedy.mantraMeaning && (
                              <p className="text-[11px] text-stone-600 pt-1 border-t border-stone-200/60">
                                <span className="font-medium text-stone-700">Meaning: </span>
                                {remedy.mantraMeaning}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Step-by-Step Instructions (Expandable) */}
                        {isExpanded && (
                          <div className="pt-2 border-t border-stone-100 space-y-3 animate-in fade-in duration-200">
                            {/* Materials */}
                            {remedy.materials?.length > 0 && (
                              <div>
                                <span className="text-[11px] font-bold text-stone-700 block mb-1">
                                  Materials Needed:
                                </span>
                                <ul className="text-xs text-stone-600 space-y-1 list-disc list-inside">
                                  {remedy.materials.map((m, i) => (
                                    <li key={i}>{m}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Steps */}
                            {Array.isArray(remedy.instructions) && remedy.instructions.length > 0 && (
                              <div>
                                <span className="text-[11px] font-bold text-stone-700 block mb-1">
                                  Step-by-Step Procedure:
                                </span>
                                <ol className="text-xs text-stone-600 space-y-1.5 list-decimal list-inside">
                                  {remedy.instructions.map((step, i) => (
                                    <li key={i} className="leading-relaxed">
                                      {typeof step === "string" ? step : step.text || step.title}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {/* Accessibility Alternative */}
                            {remedy.accessibilityAlternatives && (
                              <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-[11px] text-stone-600">
                                <span className="font-semibold text-stone-800">Accessibility Alternative: </span>
                                {remedy.accessibilityAlternatives}
                              </div>
                            )}

                            {/* Source Citation */}
                            {remedy.sourceReference && (
                              <div className="text-[10px] text-stone-400 pt-1">
                                <span className="font-medium text-stone-500">Source: </span>
                                {remedy.sourceReference} ({remedy.tradition})
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-4 bg-stone-50/50 border-t border-[#ede5d6] flex items-center justify-between text-xs">
                        <button
                          onClick={() => setExpandedRemedyId(isExpanded ? null : remedy.id)}
                          className="inline-flex items-center gap-1 font-semibold text-[#13382c] hover:underline cursor-pointer"
                        >
                          <span>{isExpanded ? "Hide Instructions" : "Step Instructions"}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleToggleComplete(remedy)}
                          className={`inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg transition ${
                            isCompleted
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-white border border-[#ede5d6] text-stone-700 hover:bg-stone-100"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isCompleted ? "Done" : "Mark Done"}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Good Habits & Mindful Conduct */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Column 1: Good Habits for Today */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-[#ede5d6] p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2">
                  <Feather className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    Good Habits for Today (Sattvic Conduct)
                  </h3>
                </div>
                <div className="space-y-3">
                  {guidance.goodHabits?.map((h) => (
                    <div key={h.id} className="p-3.5 rounded-xl bg-[#faf8f4] border border-[#ede5d6]/70 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800">{h.title}</span>
                        <span className="text-[10px] text-stone-400 italic">{h.source}</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">{h.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: What to Avoid (Non-Alarmist Guidelines) */}
              <div className="lg:col-span-6 bg-white rounded-2xl border border-[#ede5d6] p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    What to Avoid (Traditional Observances)
                  </h3>
                </div>
                <div className="space-y-3">
                  {guidance.whatToAvoid?.map((a) => (
                    <div key={a.id} className="p-3.5 rounded-xl bg-amber-50/40 border border-amber-200/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-950">{a.title}</span>
                        <span className="text-[10px] text-amber-800 italic">{a.tradition}</span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">{a.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Ethical & Scientific Disclaimer */}
            <div className="bg-[#faf5ec] rounded-2xl border border-[#ede5d6] p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center gap-4">
              <Info className="w-5 h-5 text-[#c4903c] shrink-0" />
              <div className="text-xs text-stone-600 leading-relaxed">
                <span className="font-bold text-stone-800 block mb-0.5">
                  {guidance.safetyNotice?.title}
                </span>
                {guidance.safetyNotice?.text}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
