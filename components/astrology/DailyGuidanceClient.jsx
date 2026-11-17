"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
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
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Award,
  Bot,
  ExternalLink,
  Layers,
  Activity,
  CheckCircle,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Users,
} from "lucide-react";
import { playBijaMantraTone, playChime } from "@/lib/audio/spiritualAudio";
import LiveChoghadiyaWatch from "./LiveChoghadiyaWatch";
import TransitIntelligenceView from "./TransitIntelligenceView";
import DailyPracticePlanner from "./DailyPracticePlanner";
import DailyScripturalReadings from "./DailyScripturalReadings";

const CITIES = [
  { name: "New Delhi, India", lat: 28.6139, lon: 77.2090, tz: 5.5, timezone: "Asia/Kolkata" },
  { name: "Varanasi, India", lat: 25.3176, lon: 82.9739, tz: 5.5, timezone: "Asia/Kolkata" },
  { name: "Haridwar, India", lat: 29.9457, lon: 78.1642, tz: 5.5, timezone: "Asia/Kolkata" },
  { name: "Ujjain, India", lat: 23.1765, lon: 75.7885, tz: 5.5, timezone: "Asia/Kolkata" },
  { name: "Mumbai, India", lat: 19.0760, lon: 72.8777, tz: 5.5, timezone: "Asia/Kolkata" },
  { name: "Bengaluru, India", lat: 12.9716, lon: 77.5946, tz: 5.5, timezone: "Asia/Kolkata" },
  { name: "Kolkata, India", lat: 22.5726, lon: 88.3639, tz: 5.5, timezone: "Asia/Kolkata" },
  { name: "Chennai, India", lat: 13.0827, lon: 80.2707, tz: 5.5, timezone: "Asia/Kolkata" },
  { name: "London, UK", lat: 51.5074, lon: -0.1278, tz: 0, timezone: "Europe/London" },
  { name: "New York, USA", lat: 40.7128, lon: -74.0060, tz: -5, timezone: "America/New_York" },
];

const NAVIGATION_SECTIONS = [
  { id: "overview", label: "Overview", icon: Sparkles },
  { id: "panchang", label: "Panchang & Choghadiya", icon: Clock },
  { id: "transits", label: "Gochara Transits", icon: Layers },
  { id: "timings", label: "Auspicious Timings", icon: Sun },
  { id: "lifeguidance", label: "Life Spheres", icon: Activity },
  { id: "remedies", label: "Remedies & Pujas", icon: Flame },
  { id: "mantra", label: "Daily Mantra", icon: BookOpen },
  { id: "chakra", label: "Chakra & Kundalini", icon: Flower2 },
  { id: "planner", label: "Practice Planner", icon: CheckCircle },
  { id: "readings", label: "Scriptural Readings", icon: BookOpen },
  { id: "practice", label: "Guided Timer", icon: Compass },
  { id: "assistant", label: "AI Jyotish & Shastra", icon: Bot },
];

const LIFE_SPHERE_ICONS = {
  career: Briefcase,
  education: GraduationCap,
  business: TrendingUp,
  relationships: Users,
  health: Heart,
  spiritual: Flower2,
};

export default function DailyGuidanceClient() {
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [language, setLanguage] = useState("en"); // "en" | "hi"

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  // Profile switching
  const [selectedProfileId, setSelectedProfileId] = useState("");

  // Remedy UI states
  const [expandedRemedyId, setExpandedRemedyId] = useState(null);
  const [completedRemedies, setCompletedRemedies] = useState({});
  const [bookmarkedRemedies, setBookmarkedRemedies] = useState({});
  const [copiedMantraId, setCopiedMantraId] = useState(null);
  const [activeRemedyTab, setActiveRemedyTab] = useState("remedies"); // "remedies" | "pujas"
  const [selectedPujaCategory, setSelectedPujaCategory] = useState("ALL");
  const [xpToast, setXpToast] = useState(null);

  // Audio tone states
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Guided Practice Timer States
  const [selectedTechnique, setSelectedTechnique] = useState("mindful_breath");
  const [timerDurationMinutes, setTimerDurationMinutes] = useState(5);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(5 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState("Inhale"); // "Inhale" | "Hold" | "Exhale" | "Retain"
  const [chimeEnabled, setChimeEnabled] = useState(true);
  const [practiceCompleted, setPracticeCompleted] = useState(false);
  const breathCycleRef = useRef(null);

  // Active section tracking for sticky bar
  const [activeSection, setActiveSection] = useState("overview");

  // Fetch guidance on parameters change
  const fetchGuidance = useCallback(async () => {
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

      if (selectedProfileId) {
        query.set("profileId", selectedProfileId);
      }

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

      if (json.profile?.id && !selectedProfileId) {
        setSelectedProfileId(json.profile.id);
      }
    } catch (err) {
      console.error("Daily guidance fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedCity, language, selectedProfileId]);

  useEffect(() => {
    fetchGuidance();
  }, [fetchGuidance]);

  // Handle section scrolling
  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOpenPracticeTimer = (durationMinutes = 5) => {
    setTimerDurationMinutes(durationMinutes);
    setTimerSecondsLeft(durationMinutes * 60);
    setIsTimerRunning(false);
    scrollToSection("practice");
  };

  // Action handlers
  const handleToggleComplete = async (remedy) => {
    const isNowCompleted = !completedRemedies[remedy.id];
    setCompletedRemedies((prev) => ({ ...prev, [remedy.id]: isNowCompleted }));

    if (isNowCompleted) {
      showXpNotification("+20 XP • Daily Practice Recorded");
      if (chimeEnabled) playChime();
    }

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

  const showXpNotification = (msg) => {
    setXpToast(msg);
    setTimeout(() => setXpToast(null), 3500);
  };

  // Play acoustic resonance tone for mantra
  const handlePlayMantraAcoustic = (chakraKey = "anahata") => {
    setIsPlayingAudio(true);
    playBijaMantraTone(chakraKey, 3.5);
    setTimeout(() => setIsPlayingAudio(false), 3500);
  };

  // Guided Practice Timer Effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setPracticeCompleted(true);
            if (chimeEnabled) playChime();
            showXpNotification("+20 XP • Spiritual Practice Completed!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft, chimeEnabled]);

  // Breathing Orb Cycle Effect (4:4:4:4 Sama Vritti or custom)
  useEffect(() => {
    if (!isTimerRunning) return;
    const cycleDurations = {
      mindful_breath: [4000, 4000, 4000, 4000], // Inhale, Hold, Exhale, Retain
      anulom_vilom: [4000, 4000, 8000, 2000],
      nadi_shodhana: [4000, 8000, 8000, 2000],
      bhramari: [4000, 2000, 8000, 2000],
      silent_dhyana: [5000, 1000, 5000, 1000],
    };
    const phases = ["Inhale", "Hold", "Exhale", "Retain"];
    const timings = cycleDurations[selectedTechnique] || cycleDurations.mindful_breath;

    let currentPhaseIdx = 0;
    const runPhase = () => {
      setBreathPhase(phases[currentPhaseIdx]);
      breathCycleRef.current = setTimeout(() => {
        currentPhaseIdx = (currentPhaseIdx + 1) % 4;
        runPhase();
      }, timings[currentPhaseIdx]);
    };

    runPhase();
    return () => clearTimeout(breathCycleRef.current);
  }, [isTimerRunning, selectedTechnique]);

  const handleStartTimer = () => {
    if (timerSecondsLeft === 0) {
      setTimerSecondsLeft(timerDurationMinutes * 60);
      setPracticeCompleted(false);
    }
    setIsTimerRunning(true);
    if (chimeEnabled) playChime();
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSecondsLeft(timerDurationMinutes * 60);
    setPracticeCompleted(false);
    setBreathPhase("Inhale");
  };

  const handleSelectDuration = (mins) => {
    setTimerDurationMinutes(mins);
    setTimerSecondsLeft(mins * 60);
    setIsTimerRunning(false);
    setPracticeCompleted(false);
  };

  const panchang = data?.panchang;
  const guidance = data?.guidance;
  const planetaryTransits = data?.planetaryTransits;
  const userProfiles = data?.userProfiles || [];
  const activeProfile = data?.profile;
  const natalChart = data?.chart;

  // Filter classical pujas
  const filteredPujas = useMemo(() => {
    if (!guidance?.classicalPujas) return [];
    if (selectedPujaCategory === "ALL") return guidance.classicalPujas;
    return guidance.classicalPujas.filter(
      (p) => p.category === selectedPujaCategory || p.id.toUpperCase().includes(selectedPujaCategory)
    );
  }, [guidance?.classicalPujas, selectedPujaCategory]);

  return (
    <div className="bg-[#fcfaf5] min-h-screen py-6 sm:py-8 text-stone-800">
      {/* Floating XP Toast */}
      {xpToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#13382c] text-amber-300 px-5 py-3 rounded-2xl shadow-xl border border-amber-400/30 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
          <span className="font-serif font-bold text-sm tracking-wide">{xpToast}</span>
        </div>
      )}

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* =========================================================================
            HEADER & GLOBAL CONTROLS
        ========================================================================= */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-[#ede5d6]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#faf5ec] text-[#c4903c] border border-[#ede5d6] uppercase tracking-wider">
                Vedic Daily Guidance & Remedies
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs font-medium text-stone-500">
                Brihat Parashara • Surya Siddhanta • Classical Shanti
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight mt-1">
              Personalized Daily Astrology, Vedic Remedies & Kundalini Guidance
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-4xl leading-relaxed">
              Synthesized from your birth details, active Vimshottari Dasha, sidereal Gochara transits, verified astronomical Panchang, and classical Sanskrit scriptures.
            </p>
          </div>

          {/* Controls: Date, City, Profile, Language */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Profile Selector if authenticated */}
            {userProfiles.length > 0 && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#ede5d6] text-xs font-medium text-stone-700 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#c4903c]" />
                <select
                  value={selectedProfileId}
                  onChange={(e) => setSelectedProfileId(e.target.value)}
                  className="bg-transparent text-xs text-stone-800 font-medium focus:outline-none cursor-pointer pr-1"
                >
                  {userProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.birthPlace || "Chart"})
                    </option>
                  ))}
                </select>
              </div>
            )}

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
              href="/astrology/my-dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#ede5d6] text-xs font-semibold text-stone-700 hover:bg-stone-50 transition shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-[#c4903c]" />
              <span>Full Kundli</span>
            </Link>

            <Link
              href="/spirituality/kundalini"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#faf5ec] border border-[#ede5d6] text-xs font-semibold text-[#13382c] hover:bg-[#f3ebe0] transition shadow-2xs"
            >
              <Flower2 className="w-3.5 h-3.5 text-[#c4903c]" />
              <span>Chakra Studio</span>
            </Link>
          </div>
        </div>

        {/* Sticky Section Navigation Pills */}
        <div className="sticky top-2 z-40 bg-[#fcfaf5]/90 backdrop-blur-md py-2 border-y border-[#ede5d6]/80 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max">
            {NAVIGATION_SECTIONS.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? "bg-[#13382c] text-white shadow-xs"
                      : "bg-white text-stone-600 border border-[#ede5d6] hover:bg-stone-50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-300" : "text-stone-400"}`} />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && (
          <div className="bg-white rounded-2xl border border-[#ede5d6] p-12 text-center shadow-2xs space-y-3">
            <div className="w-8 h-8 border-2 border-[#13382c] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-serif text-stone-700">
              Calculating Sidereal Transits, Astronomical Panchang & Aligning Vedic Guidance...
            </p>
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
            {/* =========================================================================
                SECTION 1: TODAY'S OVERVIEW & PERSONAL ALIGNMENT
            ========================================================================= */}
            <section id="overview" className="space-y-4 scroll-mt-20">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Overview Card */}
                <div className="lg:col-span-8 bg-gradient-to-br from-[#13382c] via-[#1a4437] to-[#13382c] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden space-y-6">
                  {/* Background Mandala Accents */}
                  <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-amber-400/5 blur-2xl pointer-events-none" />
                  <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-emerald-400/5 blur-2xl pointer-events-none" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30 tracking-wider uppercase">
                          {guidance.weekday} • {guidance.weekdayHi}
                        </span>
                        <span className="text-xs text-stone-300">
                          Presided by {guidance.rulingPlanet} ({guidance.rulingPlanetHi})
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold font-serif text-amber-50 mt-2">
                        {guidance.panchangSummary?.tithi} — {guidance.panchangSummary?.nakshatra}
                      </h2>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-white/10 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-white/15 flex items-center gap-2 text-xs">
                        <Sun className="w-4 h-4 text-amber-300" />
                        <div>
                          <span className="text-[10px] text-stone-300 block">Sunrise</span>
                          <span className="font-semibold">{guidance.panchangSummary?.sunrise}</span>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-white/15 flex items-center gap-2 text-xs">
                        <Moon className="w-4 h-4 text-indigo-200" />
                        <div>
                          <span className="text-[10px] text-stone-300 block">Sunset</span>
                          <span className="font-semibold">{guidance.panchangSummary?.sunset}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Astrological Theme & Context */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/15 space-y-3 relative z-10">
                    <div className="flex items-center gap-2 text-amber-200 text-xs font-semibold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Cosmic Alignment Summary</span>
                    </div>
                    <p className="text-sm text-stone-100 leading-relaxed font-serif">
                      {guidance.personalizedGuidance?.astrologicalInsight ||
                        `Today's energy is governed by ${guidance.rulingPlanet}. The Moon traverses through ${guidance.panchangSummary?.moonSign} in ${guidance.panchangSummary?.nakshatra} Nakshatra, supporting mindful discernment, contemplative focus, and constructive endeavors.`}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 font-medium">
                        Recommended Focus: {guidance.personalizedGuidance?.recommendedFocus || "Patience, steady progress & spiritual clarity"}
                      </span>
                    </div>
                  </div>

                  {/* Micro Summary Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs relative z-10">
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <span className="text-stone-300 text-[11px] block">Rahu Kaal</span>
                      <span className="font-bold text-amber-200 mt-0.5 block truncate">
                        {guidance.panchangSummary?.rahuKaal || "10:30 - 12:00"}
                      </span>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <span className="text-stone-300 text-[11px] block">Abhijit Muhurta</span>
                      <span className="font-bold text-emerald-200 mt-0.5 block truncate">
                        {guidance.favorableTimings?.auspiciousPeriods?.find((p) => p.name.includes("Abhijit"))?.timeRange || "11:45 - 12:35"}
                      </span>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <span className="text-stone-300 text-[11px] block">Active Chakra</span>
                      <span className="font-bold text-amber-100 mt-0.5 block truncate">
                        {guidance.chakraGuidance?.primaryChakra || "Anahata"}
                      </span>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                      <span className="text-stone-300 text-[11px] block">Bija Mantra</span>
                      <span className="font-bold text-amber-200 mt-0.5 block truncate">
                        {guidance.chakraGuidance?.bijaMantra || "OM"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Personalized Natal Profile Card */}
                <div className="lg:col-span-4 bg-white rounded-3xl border border-[#ede5d6] p-6 shadow-2xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-[#c4903c]" />
                        <h3 className="font-serif font-bold text-base text-stone-900">
                          Natal Chart Connection
                        </h3>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                        {activeProfile ? "Synchronized" : "General Mode"}
                      </span>
                    </div>

                    {activeProfile ? (
                      <div className="mt-4 space-y-3">
                        <div className="p-3.5 rounded-2xl bg-[#faf5ec] border border-[#ede5d6] space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900 text-sm">{activeProfile.name}</span>
                            <span className="text-[11px] text-stone-500">{activeProfile.birthPlace || "Vedic Chart"}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200/60 text-stone-600">
                            <div>
                              <span className="text-stone-400 block text-[10px]">Lagna (Ascendant)</span>
                              <span className="font-semibold text-stone-800">
                                {typeof guidance.personalizedGuidance?.userAscendant === "object"
                                  ? guidance.personalizedGuidance.userAscendant?.sign || guidance.personalizedGuidance.userAscendant?.name || "Aries"
                                  : String(guidance.personalizedGuidance?.userAscendant || "Aries")}
                              </span>
                            </div>
                            <div>
                              <span className="text-stone-400 block text-[10px]">Janma Rashi (Moon)</span>
                              <span className="font-semibold text-stone-800">
                                {typeof guidance.personalizedGuidance?.userMoonSign === "object"
                                  ? guidance.personalizedGuidance.userMoonSign?.sign || guidance.personalizedGuidance.userMoonSign?.name || "Taurus"
                                  : String(guidance.personalizedGuidance?.userMoonSign || "Taurus")}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Active Dasha Card */}
                        {(guidance.personalizedGuidance?.currentMahadasha || guidance.personalizedGuidance?.activeDasha) && (
                          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1.5">
                            <div className="flex items-center justify-between text-amber-950 font-bold">
                              <span>Active Vimshottari Dasha</span>
                              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 font-mono">
                                {guidance.personalizedGuidance.currentMahadasha || guidance.personalizedGuidance.activeDasha?.mahadasha}
                                {" - "}
                                {guidance.personalizedGuidance.currentAntardasha || guidance.personalizedGuidance.activeDasha?.antardasha}
                                {guidance.personalizedGuidance.currentPratyantardasha ? ` - ${guidance.personalizedGuidance.currentPratyantardasha}` : ""}
                              </span>
                            </div>
                            <p className="text-[11px] text-amber-800 leading-relaxed">
                              {guidance.personalizedGuidance.dashaTheme?.archetype ||
                                guidance.personalizedGuidance.activeDasha?.significance ||
                                `Mahadasha of ${guidance.personalizedGuidance.currentMahadasha} provides the structural life themes, modulated by ${guidance.personalizedGuidance.currentAntardasha} Antardasha.`}
                            </p>
                            {guidance.personalizedGuidance.dashaTheme?.sadhana && (
                              <div className="pt-1 border-t border-amber-200/60 text-[10px] text-amber-900 flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-[#c4903c] shrink-0" />
                                <span><strong>Dasha Sadhana:</strong> {guidance.personalizedGuidance.dashaTheme.sadhana}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4 space-y-3">
                        <p className="text-xs text-stone-600 leading-relaxed">
                          You are currently viewing general astrological guidance based on today's astronomical coordinates. Connect your Vedic birth profile to unlock personalized planetary transit houses and tailored remedies.
                        </p>
                        <div className="p-3 rounded-xl bg-[#faf8f4] border border-[#ede5d6] text-xs space-y-2">
                          <span className="font-semibold text-stone-800 block">Personalization unlocks:</span>
                          <ul className="text-[11px] text-stone-600 space-y-1 list-disc list-inside">
                            <li>Vimshottari Mahadasha & Antardasha synergy</li>
                            <li>Houses from natal Lagna & Moon</li>
                            <li>Individual Ashtakavarga bindu scores</li>
                          </ul>
                        </div>
                        <Link
                          href="/dashboard/profile"
                          className="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-[#13382c] text-white text-xs font-semibold hover:bg-[#1b4b3c] transition shadow-xs gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Select or Create Birth Profile</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                    <span>Parashari Sidereal System</span>
                    <Link href="/astrology/my-dashboard" className="text-[#13382c] font-semibold hover:underline">
                      View Kundli →
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================================================
                SECTION 2: PANCHANG & LIVE CHOGHADIYA WATCH
            ========================================================================= */}
            <section id="panchang" className="space-y-4 scroll-mt-20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#c4903c]" />
                    <span>Astronomical Panchang & Live Choghadiya Watch</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Real-time Vedic timekeeping computed from high-precision astronomical algorithms (Surya Siddhanta & modern ephemeris).
                  </p>
                </div>
                <div className="text-xs text-stone-500">
                  Location: <span className="font-semibold text-stone-800">{selectedCity.name}</span>
                </div>
              </div>

              {/* Embed Live Choghadiya Watch Component */}
              <div className="bg-white rounded-3xl border border-[#ede5d6] p-6 shadow-2xs space-y-6">
                <LiveChoghadiyaWatch
                  choghadiya={panchang?.choghadiya}
                  selectedDate={selectedDate}
                  timezoneOffsetHours={selectedCity.tz}
                  locationName={selectedCity.name}
                  language={language}
                />

                {/* Additional Panchang Attributes Grid */}
                <div className="pt-4 border-t border-stone-100">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
                    Five Limbs of Panchang (पञ्चाङ्ग)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#faf8f4] border border-[#ede5d6]/80 text-xs">
                      <span className="text-[10px] text-stone-400 block font-medium">1. Tithi (Lunar Day)</span>
                      <span className="font-bold text-stone-800 mt-0.5 block">
                        {panchang?.tithi?.name || panchang?.tithi || "Shukla Pratipada"}
                      </span>
                      <span className="text-[10px] text-stone-500 block mt-0.5">
                        {panchang?.tithi?.paksha || "Shukla Paksha"}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#faf8f4] border border-[#ede5d6]/80 text-xs">
                      <span className="text-[10px] text-stone-400 block font-medium">2. Vaara (Weekday)</span>
                      <span className="font-bold text-stone-800 mt-0.5 block">
                        {panchang?.vaara?.name || panchang?.weekday || "Shukravara"}
                      </span>
                      <span className="text-[10px] text-stone-500 block mt-0.5">
                        Lord: {guidance.rulingPlanet}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#faf8f4] border border-[#ede5d6]/80 text-xs">
                      <span className="text-[10px] text-stone-400 block font-medium">3. Nakshatra</span>
                      <span className="font-bold text-stone-800 mt-0.5 block">
                        {panchang?.nakshatra?.name || panchang?.nakshatra || "Rohini"}
                      </span>
                      <span className="text-[10px] text-stone-500 block mt-0.5">
                        Lord: {panchang?.nakshatra?.lord || "Chandra"}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#faf8f4] border border-[#ede5d6]/80 text-xs">
                      <span className="text-[10px] text-stone-400 block font-medium">4. Yoga</span>
                      <span className="font-bold text-stone-800 mt-0.5 block">
                        {panchang?.yoga?.name || panchang?.yoga || "Siddhi"}
                      </span>
                      <span className="text-[10px] text-stone-500 block mt-0.5">
                        Harmonic angle
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#faf8f4] border border-[#ede5d6]/80 text-xs">
                      <span className="text-[10px] text-stone-400 block font-medium">5. Karana</span>
                      <span className="font-bold text-stone-800 mt-0.5 block">
                        {panchang?.karana?.name || panchang?.karana || "Bava"}
                      </span>
                      <span className="text-[10px] text-stone-500 block mt-0.5">
                        Half-lunar division
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================================================
                SECTION 3: PLANETARY TRANSIT INSIGHTS (GOCHARA & ASHTAKAVARGA)
            ========================================================================= */}
            <section id="transits" className="space-y-4 scroll-mt-20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#c4903c]" />
                    <span>Planetary Transit Insights (Gochara)</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Continuous sidereal transits evaluated from natal Lagna and Janma Rashi, combined with Ashtakavarga bindu strengths.
                  </p>
                </div>
                {planetaryTransits && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Predictive Gochara Active
                  </span>
                )}
              </div>

              {natalChart ? (
                <div className="bg-white rounded-3xl border border-[#ede5d6] p-6 shadow-2xs space-y-6">
                  {/* Detailed Transit Intelligence View */}
                  <TransitIntelligenceView chart={natalChart} language={language} />

                  {/* Dasha-Transit Synergy Banner */}
                  {planetaryTransits?.dashaSynergy && (
                    <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                      <div className="flex items-center gap-2 font-serif font-bold text-amber-950 text-sm">
                        <Sparkles className="w-4 h-4 text-amber-600" />
                        <span>Dasha-Transit Synergy Analysis</span>
                      </div>
                      <p className="text-xs text-amber-900 leading-relaxed">
                        {planetaryTransits.dashaSynergy.analysis ||
                          "When transit positions align beneficially with active Mahadasha lords, auspicious undertakings flourish with minimal friction. Maintain mindful moderation in areas where transit houses present reflective lessons."}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-[#ede5d6] p-8 text-center space-y-4 shadow-2xs">
                  <div className="w-12 h-12 rounded-2xl bg-[#faf5ec] border border-[#ede5d6] flex items-center justify-center mx-auto text-[#c4903c]">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="font-serif font-bold text-base text-stone-900">
                      Connect Birth Chart for Full Transit Analysis
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      To compute exact houses from Lagna, houses from Moon, Vedha obstruction checks, and Ashtakavarga scores, select your birth profile.
                    </p>
                  </div>
                  <Link
                    href="/dashboard/profile"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#13382c] text-white text-xs font-semibold hover:bg-[#1b4b3c] transition shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Select or Create Profile</span>
                  </Link>
                </div>
              )}
            </section>

            {/* =========================================================================
                SECTION 4: FAVORABLE & INAUSPICIOUS TIMINGS
            ========================================================================= */}
            <section id="timings" className="space-y-4 scroll-mt-20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight flex items-center gap-2">
                    <Sun className="w-5 h-5 text-amber-500" />
                    <span>Favorable & Inauspicious Timings</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Classical observational windows including Abhijit Muhurta, Brahma Muhurta, Rahu Kaal, Yamaganda, and Gulika Kaal.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Auspicious Periods Card */}
                <div className="lg:col-span-6 bg-white rounded-3xl border border-[#ede5d6] p-6 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-emerald-800 font-serif font-bold text-base">
                    <Sun className="w-4 h-4 text-emerald-600" />
                    <span>Auspicious Windows (शुभ मुहूर्त)</span>
                  </div>

                  <div className="space-y-3">
                    {guidance.favorableTimings?.auspiciousPeriods?.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/60 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-emerald-950 font-serif">{p.name}</span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {p.timeRange}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-900/80 leading-relaxed">{p.significance}</p>
                      </div>
                    ))}
                  </div>

                  {/* Favorable Activities */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide block mb-2">
                      Recommended Favorable Activities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {guidance.favorableTimings?.favorableActivities?.map((act, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-xs bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium"
                        >
                          ✓ {act}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Inauspicious Periods Card */}
                <div className="lg:col-span-6 bg-white rounded-3xl border border-[#ede5d6] p-6 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-amber-900 font-serif font-bold text-base">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Inauspicious Windows (वर्ज्य काल)</span>
                  </div>

                  <div className="space-y-3">
                    {guidance.favorableTimings?.inauspiciousPeriods?.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/70 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-amber-950 font-serif">{p.name}</span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                            {p.timeRange}
                          </span>
                        </div>
                        <p className="text-xs text-amber-900/80 leading-relaxed">{p.significance}</p>
                      </div>
                    ))}
                  </div>

                  {/* Unfavorable Activities to Defer */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide block mb-2">
                      Activities to Defer or Approach with Restraint:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {guidance.favorableTimings?.unfavorableActivities?.map((act, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-xs bg-amber-50 border border-amber-200 text-amber-900 font-medium"
                        >
                          ⚠ {act}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================================================
                SECTION 5: CATEGORIZED DAILY GUIDANCE (6 LIFE SPHERES)
            ========================================================================= */}
            <section id="lifeguidance" className="space-y-4 scroll-mt-20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#c4903c]" />
                    <span>Categorized Daily Guidance Across 6 Life Spheres</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Classical Parashari interpretations framed constructively for mindful living. Strictly non-alarmist and non-deterministic.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {guidance.categorizedGuidance &&
                  Object.entries(guidance.categorizedGuidance).map(([key, item]) => {
                    const Icon = LIFE_SPHERE_ICONS[key] || Activity;
                    const isFavorable = item.status === "Favorable";
                    const isReflective = item.status === "Reflective" || item.status === "Caution";

                    return (
                      <div
                        key={key}
                        className="bg-white rounded-2xl border border-[#ede5d6] p-5 shadow-2xs flex flex-col justify-between hover:border-[#d9cbba] transition space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-2 rounded-xl bg-[#faf5ec] text-[#c4903c]">
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="font-serif font-bold text-sm text-stone-900">
                                {item.title}
                              </span>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                isFavorable
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isReflective
                                  ? "bg-amber-100 text-amber-900"
                                  : "bg-stone-100 text-stone-700"
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>

                          {/* Transit influence note */}
                          {item.transitInfluence && (
                            <div className="text-[11px] font-medium text-stone-500 bg-[#faf8f4] px-2.5 py-1 rounded-lg">
                              {item.transitInfluence}
                            </div>
                          )}

                          {/* Guidance text */}
                          <p className="text-xs text-stone-600 leading-relaxed">
                            {item.guidance}
                          </p>
                        </div>

                        {/* Practical Action Recommendation */}
                        <div className="pt-3 border-t border-stone-100">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                            Actionable Focus
                          </span>
                          <span className="text-xs font-semibold text-stone-800 block">
                            {item.recommendedAction}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>

            {/* =========================================================================
                SECTION 6: RECOMMENDED VEDIC REMEDIES & CLASSICAL 8 PUJAS
            ========================================================================= */}
            <section id="remedies" className="space-y-5 scroll-mt-20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-600" />
                    <span>Recommended Vedic Remedies & Classical Pujas</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Traditional Shanti practices: Mantras, Pujas, Daan (charity), and mindful habits grounded in verified classical texts.
                  </p>
                </div>

                {/* Sub-tab Switcher: Remedies vs Pujas */}
                <div className="inline-flex rounded-xl bg-white border border-[#ede5d6] p-1 shadow-2xs self-start sm:self-auto text-xs font-semibold">
                  <button
                    onClick={() => setActiveRemedyTab("remedies")}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      activeRemedyTab === "remedies"
                        ? "bg-[#13382c] text-white"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    Today's Remedies ({guidance.recommendedPractices?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveRemedyTab("pujas")}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      activeRemedyTab === "pujas"
                        ? "bg-[#13382c] text-white"
                        : "text-stone-600 hover:text-stone-900"
                    }`}
                  >
                    Classical 8 Pujas ({guidance.classicalPujas?.length || 8})
                  </button>
                </div>
              </div>

              {/* REMEDIES VIEW */}
              {activeRemedyTab === "remedies" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {guidance.recommendedPractices?.map((remedy, idx) => {
                      const isExpanded = expandedRemedyId === remedy.id;
                      const isCompleted = Boolean(completedRemedies[remedy.id]);
                      const isBookmarked = Boolean(bookmarkedRemedies[remedy.id]);

                      return (
                        <div
                          key={remedy.id || idx}
                          className={`bg-white rounded-3xl border transition shadow-2xs flex flex-col justify-between overflow-hidden ${
                            isCompleted
                              ? "border-emerald-300 bg-emerald-50/20"
                              : "border-[#ede5d6] hover:border-[#d9cbba]"
                          }`}
                        >
                          <div className="p-6 space-y-4">
                            {/* Badges */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#faf5ec] text-[#c4903c] border border-[#ede5d6] uppercase">
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
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${
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
                                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                                    isCompleted
                                      ? "text-emerald-700 bg-emerald-100"
                                      : "text-stone-400 hover:text-emerald-700 hover:bg-emerald-50"
                                  }`}
                                  title={isCompleted ? "Completed (+20 XP)" : "Mark as completed"}
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
                              <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] space-y-2 relative">
                                <div className="flex items-center justify-between text-[11px] font-medium text-stone-400">
                                  <span>Sanskrit Mantra</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handlePlayMantraAcoustic("anahata")}
                                      className="inline-flex items-center gap-1 text-[10px] text-[#13382c] hover:underline cursor-pointer"
                                      title="Play acoustic harmonic resonance"
                                    >
                                      <Volume2 className="w-3 h-3 text-amber-600" />
                                      <span>Listen</span>
                                    </button>
                                    <button
                                      onClick={() => handleCopyMantra(remedy.id, remedy.sanskritMantra)}
                                      className="inline-flex items-center gap-1 text-[10px] text-[#13382c] hover:underline cursor-pointer"
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

                                {remedy.accessibilityAlternatives && (
                                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600">
                                    <span className="font-semibold text-stone-800">Accessibility Alternative: </span>
                                    {remedy.accessibilityAlternatives}
                                  </div>
                                )}

                                {remedy.sourceReference && (
                                  <div className="text-[10px] text-stone-400 pt-1 flex items-center justify-between">
                                    <span>
                                      Source: <span className="text-stone-600">{remedy.sourceReference}</span>
                                    </span>
                                    {remedy.digitalLibraryLink && (
                                      <Link
                                        href={remedy.digitalLibraryLink}
                                        className="text-[#13382c] hover:underline flex items-center gap-1 font-medium"
                                      >
                                        <BookOpen className="w-3 h-3" />
                                        <span>Library</span>
                                      </Link>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Footer Actions */}
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
                              className={`inline-flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                                isCompleted
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-white border border-[#ede5d6] text-stone-700 hover:bg-stone-100"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isCompleted ? "Completed (+20 XP)" : "Mark Done"}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CLASSICAL 8 PUJAS VIEW */}
              {activeRemedyTab === "pujas" && (
                <div className="space-y-4">
                  {/* Category Filter */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {["ALL", "GANESH", "SHIVA", "VISHNU", "SURYA", "DEVI", "NAVAGRAHA", "SARASWATI", "LAKSHMI"].map(
                      (cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedPujaCategory(cat)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                            selectedPujaCategory === cat
                              ? "bg-[#13382c] text-white"
                              : "bg-white border border-[#ede5d6] text-stone-600 hover:bg-stone-50"
                          }`}
                        >
                          {cat}
                        </button>
                      )
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredPujas.map((puja) => {
                      const isExpanded = expandedRemedyId === puja.id;
                      const isCompleted = Boolean(completedRemedies[puja.id]);

                      return (
                        <div
                          key={puja.id}
                          className={`bg-white rounded-3xl border transition shadow-2xs flex flex-col justify-between overflow-hidden ${
                            isCompleted ? "border-emerald-300 bg-emerald-50/10" : "border-[#ede5d6]"
                          }`}
                        >
                          <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#faf5ec] text-[#c4903c] border border-[#ede5d6] uppercase">
                                {puja.deity} • {puja.category}
                              </span>
                              <span className="text-xs text-stone-400 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {puja.durationMinutes || 20}m
                              </span>
                            </div>

                            <div>
                              <h3 className="text-lg font-bold font-serif text-stone-900">
                                {puja.title}
                              </h3>
                              <p className="text-xs text-stone-500 mt-0.5">
                                Suitable occasion: {puja.occasion}
                              </p>
                            </div>

                            <p className="text-xs text-stone-600 leading-relaxed">
                              {puja.significance}
                            </p>

                            {/* Primary Shloka / Mantra */}
                            {puja.primaryMantra && (
                              <div className="p-3.5 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] space-y-1.5">
                                <div className="flex items-center justify-between text-[11px] text-stone-400">
                                  <span className="font-medium">Classical Shloka</span>
                                  <button
                                    onClick={() => handleCopyMantra(puja.id, puja.primaryMantra)}
                                    className="text-[10px] text-[#13382c] hover:underline"
                                  >
                                    {copiedMantraId === puja.id ? "Copied" : "Copy"}
                                  </button>
                                </div>
                                <p className="text-sm font-serif font-bold text-stone-900 leading-relaxed font-sanskrit">
                                  {puja.primaryMantra}
                                </p>
                                {puja.transliteration && (
                                  <p className="text-[11px] text-stone-500 italic">
                                    {puja.transliteration}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Expandable Step-by-Step Procedure */}
                            {isExpanded && (
                              <div className="pt-3 border-t border-stone-100 space-y-3 animate-in fade-in duration-200">
                                {puja.materials?.length > 0 && (
                                  <div>
                                    <span className="text-[11px] font-bold text-stone-800 block mb-1">
                                      Puja Samagri (Materials):
                                    </span>
                                    <div className="flex flex-wrap gap-1 text-xs text-stone-600">
                                      {puja.materials.map((m, i) => (
                                        <span
                                          key={i}
                                          className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px]"
                                        >
                                          {m}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {puja.procedure?.length > 0 && (
                                  <div>
                                    <span className="text-[11px] font-bold text-stone-800 block mb-1">
                                      Step-by-Step Vidhi:
                                    </span>
                                    <ol className="text-xs text-stone-600 space-y-1 list-decimal list-inside">
                                      {puja.procedure.map((p, i) => (
                                        <li key={i}>{p}</li>
                                      ))}
                                    </ol>
                                  </div>
                                )}

                                <div className="text-[10px] text-stone-400 pt-1 flex items-center justify-between">
                                  <span>Source: {puja.classicalSource}</span>
                                  {puja.libraryLink && (
                                    <Link
                                      href={puja.libraryLink}
                                      className="text-[#13382c] hover:underline flex items-center gap-1 font-semibold"
                                    >
                                      <BookOpen className="w-3 h-3" />
                                      <span>Read Shastra</span>
                                    </Link>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="p-4 bg-stone-50/50 border-t border-[#ede5d6] flex items-center justify-between text-xs">
                            <button
                              onClick={() => setExpandedRemedyId(isExpanded ? null : puja.id)}
                              className="font-semibold text-[#13382c] hover:underline cursor-pointer"
                            >
                              {isExpanded ? "Hide Vidhi" : "View Step Vidhi"}
                            </button>

                            <button
                              onClick={() => handleToggleComplete(puja)}
                              className={`inline-flex items-center gap-1.5 font-semibold px-3 py-1.5 rounded-xl transition cursor-pointer ${
                                isCompleted
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-white border border-[#ede5d6] text-stone-700 hover:bg-stone-100"
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isCompleted ? "Puja Completed (+20 XP)" : "Record Completion"}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* =========================================================================
                SECTION 7: DAILY SANSKRIT MANTRA INTELLIGENCE (ANVAYA & AUDIO)
            ========================================================================= */}
            <section id="mantra" className="space-y-4 scroll-mt-20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#c4903c]" />
                    <span>Daily Sanskrit Mantra Intelligence</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Authentic classical Shloka aligned with today's planetary lord, complete with Pada-chheda, Anvaya analysis, and acoustic resonance.
                  </p>
                </div>
              </div>

              {guidance.dailyMantra && (
                <div className="bg-white rounded-3xl border border-[#ede5d6] p-6 sm:p-8 shadow-2xs space-y-6">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                    <div>
                      <span className="text-[11px] font-bold text-[#c4903c] uppercase tracking-wider block">
                        {guidance.dailyMantra.source || "Classical Shastra"} • Meter: {guidance.dailyMantra.meter || "Anushtup"}
                      </span>
                      <h3 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
                        {guidance.dailyMantra.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePlayMantraAcoustic("manipura")}
                        disabled={isPlayingAudio}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#faf5ec] border border-[#ede5d6] text-xs font-semibold text-[#13382c] hover:bg-[#f3ebe0] transition cursor-pointer shadow-2xs"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? "animate-pulse text-amber-600" : "text-[#c4903c]"}`} />
                        <span>{isPlayingAudio ? "Resonating..." : "Play Acoustic Resonance"}</span>
                      </button>

                      <button
                        onClick={() => handleCopyMantra("dailyMantra", guidance.dailyMantra.devanagari)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#ede5d6] text-xs font-semibold text-stone-700 hover:bg-stone-50 transition cursor-pointer"
                      >
                        {copiedMantraId === "dailyMantra" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Shloka</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Devanagari Display */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-[#faf8f4] via-[#fbf9f5] to-[#faf8f4] border border-[#ede5d6] text-center space-y-3">
                    <p className="text-lg sm:text-2xl font-serif font-bold text-stone-900 leading-relaxed font-sanskrit tracking-wide">
                      {guidance.dailyMantra.devanagari}
                    </p>
                    <p className="text-xs sm:text-sm text-stone-500 italic max-w-2xl mx-auto">
                      {guidance.dailyMantra.transliteration}
                    </p>
                  </div>

                  {/* Pada-chheda (Word Division) */}
                  {guidance.dailyMantra.padaChheda && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wide">
                        पदच्छेद (Pada-chheda / Word Division):
                      </span>
                      <p className="text-xs font-serif text-stone-800 bg-[#faf8f4] p-3 rounded-xl border border-[#ede5d6]">
                        {guidance.dailyMantra.padaChheda}
                      </p>
                    </div>
                  )}

                  {/* Anvaya (Word-by-word grammatical meaning) */}
                  {Array.isArray(guidance.dailyMantra.anvaya) && guidance.dailyMantra.anvaya.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wide block">
                        अन्वय (Anvaya / Word-by-Word Analysis):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {guidance.dailyMantra.anvaya.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-white border border-[#ede5d6] text-xs space-y-1 shadow-2xs"
                          >
                            <span className="font-serif font-bold text-[#13382c] block">
                              {item.word || item.pada}
                            </span>
                            <span className="text-[10px] text-stone-400 block">
                              {item.role || item.grammar || "Vedic Term"}
                            </span>
                            <span className="text-[11px] text-stone-700 block border-t border-stone-100 pt-1">
                              {item.meaning || item.meaningEn || item.meaningHi}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Translations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block">
                        English Translation
                      </span>
                      <p className="text-xs text-stone-700 leading-relaxed font-serif">
                        {guidance.dailyMantra.translation?.en || guidance.dailyMantra.meaningEn}
                      </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide block">
                        हिन्दी भावार्थ
                      </span>
                      <p className="text-xs text-stone-700 leading-relaxed font-serif">
                        {guidance.dailyMantra.translation?.hi || guidance.dailyMantra.meaningHi}
                      </p>
                    </div>
                  </div>

                  {/* Shastra Reference Link */}
                  {guidance.dailyMantra.libraryLink && (
                    <div className="pt-2 text-right">
                      <Link
                        href={guidance.dailyMantra.libraryLink}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#13382c] hover:underline"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Explore Verse in Gurukul Digital Library →</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* =========================================================================
                SECTION 8: KUNDALINI & CHAKRA GUIDANCE
            ========================================================================= */}
            <section id="chakra" className="space-y-4 scroll-mt-20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight flex items-center gap-2">
                    <Flower2 className="w-5 h-5 text-[#c4903c]" />
                    <span>Kundalini & Subtle Body Chakra Alignment</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Planetary weekday alignment with the seven Chakras, three Nadis (Ida, Pingala, Sushumna), and three Granthis.
                  </p>
                </div>
                <Link
                  href="/spirituality/kundalini"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#13382c] hover:underline"
                >
                  <span>Interactive Chakra Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {guidance.chakraGuidance && (
                <div className="bg-white rounded-3xl border border-[#ede5d6] p-6 sm:p-8 shadow-2xs space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Primary Chakra Visual Card */}
                    <div className="lg:col-span-5 bg-gradient-to-br from-[#faf8f4] to-[#f4ede0] rounded-2xl p-6 border border-[#ede5d6] flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#c4903c] uppercase tracking-wider">
                            Daily Planetary Ruler: {guidance.rulingPlanet}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-stone-800 border border-[#ede5d6]">
                            {guidance.chakraGuidance.element} Element
                          </span>
                        </div>
                        <h3 className="text-2xl font-bold font-serif text-stone-900 mt-2">
                          {guidance.chakraGuidance.primaryChakra} Chakra
                        </h3>
                        <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                          {guidance.chakraGuidance.traditionalSignificance}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-stone-200/60">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-500">Bija Mantra:</span>
                          <span className="font-serif font-bold text-[#13382c] text-sm">
                            {guidance.chakraGuidance.bijaMantra}
                          </span>
                        </div>
                        <button
                          onClick={() => handlePlayMantraAcoustic(guidance.chakraGuidance.primaryChakra?.toLowerCase() || "anahata")}
                          className="w-full py-2.5 rounded-xl bg-[#13382c] text-white text-xs font-semibold hover:bg-[#1b4b3c] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                          <span>Resonate Bija Mantra Tone</span>
                        </button>
                      </div>
                    </div>

                    {/* Subtle Anatomy: Nadis & Granthis */}
                    <div className="lg:col-span-7 space-y-4">
                      <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                        Subtle Energetic Pathways (नाडी एवं ग्रन्थि)
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] space-y-1 text-xs">
                          <span className="font-bold text-stone-900 font-serif block">
                            Active Nadi Pathway: {guidance.chakraGuidance.nadi || "Sushumna"}
                          </span>
                          <p className="text-[11px] text-stone-600 leading-relaxed">
                            {guidance.chakraGuidance.nadi === "Pingala"
                              ? "Solar, vitality, and digestive fire channel. Favors energetic engagement and focused action."
                              : guidance.chakraGuidance.nadi === "Ida"
                              ? "Lunar, cooling, receptive channel. Favors reflective contemplation and artistic insight."
                              : "Central harmonic channel. Fosters equanimity, meditation, and inner stillness."}
                          </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] space-y-1 text-xs">
                          <span className="font-bold text-stone-900 font-serif block">
                            Granthi Connection: {guidance.chakraGuidance.granthi || "Brahma Granthi"}
                          </span>
                          <p className="text-[11px] text-stone-600 leading-relaxed">
                            Vedic spiritual knot symbolizing transformation of material attachment into luminous discernment through breath.
                          </p>
                        </div>
                      </div>

                      {/* Recommended Contemplation */}
                      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1">
                        <span className="font-bold text-amber-950 font-serif block">
                          Suggested Subtle Contemplation for Today:
                        </span>
                        <p className="text-amber-900 leading-relaxed">
                          {guidance.chakraGuidance.recommendedPractice ||
                            "Sit erect with relaxed shoulders. Inhale smoothly into the heart center, silently chanting the Bija mantra, observing the quiet stillness between breaths."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* =========================================================================
                SECTION 9: DAILY SPIRITUAL PRACTICE & SADHANA PLANNER
            ========================================================================= */}
            <DailyPracticePlanner
              selectedDate={selectedDate}
              language={language}
              onOpenTimer={handleOpenPracticeTimer}
              onXpEarned={showXpNotification}
            />

            {/* =========================================================================
                SECTION 10: SCRIPTURAL RECOMMENDATIONS WITH 3D MAGAZINE READER
            ========================================================================= */}
            <DailyScripturalReadings
              readings={guidance.scripturalReadings}
              language={language}
            />

            {/* =========================================================================
                SECTION 11: GUIDED SPIRITUAL PRACTICE TIMER
            ========================================================================= */}
            <section id="practice" className="space-y-4 scroll-mt-20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#c4903c]" />
                    <span>Guided Spiritual Practice & Breath Pacer</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Traditional Pranayama & Meditation timer with visual breathing orb, Tibetan bowl intervals, and XP progression tracking.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-[#ede5d6] p-6 sm:p-8 shadow-2xs space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  {/* Left: Technique and Duration Selection */}
                  <div className="lg:col-span-5 space-y-5">
                    <div>
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wide block mb-2">
                        Select Practice Technique:
                      </label>
                      <select
                        value={selectedTechnique}
                        onChange={(e) => {
                          setSelectedTechnique(e.target.value);
                          handleResetTimer();
                        }}
                        className="w-full p-2.5 rounded-xl bg-[#faf8f4] border border-[#ede5d6] text-xs font-medium text-stone-800 focus:outline-none"
                      >
                        <option value="mindful_breath">Mindful Sama Vritti (Box 4:4:4:4)</option>
                        <option value="anulom_vilom">Anulom Vilom (Alternate Nostril 4:4:8:2)</option>
                        <option value="nadi_shodhana">Nadi Shodhana (Purifying 4:8:8:2)</option>
                        <option value="bhramari">Bhramari Humming Breath (4:2:8:2)</option>
                        <option value="silent_dhyana">Silent Dhyana Contemplation</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 uppercase tracking-wide block mb-2">
                        Session Duration:
                      </label>
                      <div className="flex items-center gap-2">
                        {[3, 5, 10, 15].map((mins) => (
                          <button
                            key={mins}
                            onClick={() => handleSelectDuration(mins)}
                            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                              timerDurationMinutes === mins
                                ? "bg-[#13382c] text-white"
                                : "bg-[#faf8f4] text-stone-700 border border-[#ede5d6] hover:bg-stone-100"
                            }`}
                          >
                            {mins} min
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                      <span className="text-stone-600 font-medium">Tibetan Bowl Chime</span>
                      <button
                        onClick={() => setChimeEnabled(!chimeEnabled)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                          chimeEnabled ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"
                        }`}
                      >
                        {chimeEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                        <span>{chimeEnabled ? "Chime On" : "Silent"}</span>
                      </button>
                    </div>

                    {/* Timer Controls */}
                    <div className="flex items-center gap-3 pt-2">
                      {!isTimerRunning ? (
                        <button
                          onClick={handleStartTimer}
                          className="flex-1 py-3 rounded-xl bg-[#13382c] text-white text-xs font-bold hover:bg-[#1b4b3c] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Play className="w-4 h-4 fill-white" />
                          <span>{timerSecondsLeft === timerDurationMinutes * 60 ? "Begin Practice" : "Resume"}</span>
                        </button>
                      ) : (
                        <button
                          onClick={handlePauseTimer}
                          className="flex-1 py-3 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Pause className="w-4 h-4" />
                          <span>Pause</span>
                        </button>
                      )}

                      <button
                        onClick={handleResetTimer}
                        className="p-3 rounded-xl bg-[#faf8f4] border border-[#ede5d6] text-stone-600 hover:text-stone-900 transition cursor-pointer"
                        title="Reset Timer"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>

                    {practiceCompleted && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-2 animate-in fade-in">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Practice completed! +20 XP awarded and recorded to your spiritual journal.</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Visual Breathing Orb & Countdown */}
                  <div className="lg:col-span-7 flex flex-col items-center justify-center py-6 space-y-6">
                    {/* Breathing Orb */}
                    <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                      <div
                        className={`absolute inset-0 rounded-full transition-all ease-in-out duration-1000 ${
                          isTimerRunning
                            ? breathPhase === "Inhale"
                              ? "scale-100 bg-emerald-400/20 border-2 border-emerald-500/40"
                              : breathPhase === "Hold"
                              ? "scale-95 bg-amber-400/20 border-2 border-amber-500/40"
                              : breathPhase === "Exhale"
                              ? "scale-75 bg-indigo-400/20 border-2 border-indigo-500/40"
                              : "scale-70 bg-stone-300/20 border-2 border-stone-400/40"
                            : "scale-85 bg-[#faf5ec] border border-[#ede5d6]"
                        }`}
                      />

                      <div className="relative z-10 text-center space-y-1">
                        <span className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 block">
                          {Math.floor(timerSecondsLeft / 60)}:
                          {String(timerSecondsLeft % 60).padStart(2, "0")}
                        </span>
                        <span className="text-xs font-semibold tracking-wider text-[#c4903c] uppercase block">
                          {isTimerRunning ? breathPhase : "Ready"}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-500 max-w-sm text-center leading-relaxed">
                      Follow the visual orb. Inhale slowly through the nostrils, pause gently, and release smoothly without forcing the breath.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* =========================================================================
                SECTION 10: CLASSICAL REFERENCES & AI JYOTISH RESEARCH ASSISTANT
            ========================================================================= */}
            <section id="assistant" className="space-y-4 scroll-mt-20">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight flex items-center gap-2">
                    <Bot className="w-5 h-5 text-[#c4903c]" />
                    <span>Classical References & AI Jyotish Assistant</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Verified scriptural foundations linked with Gurukul's AI Research Assistant for deep-dive textual queries.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Scripture Verification References */}
                <div className="lg:col-span-6 bg-white rounded-3xl border border-[#ede5d6] p-6 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-sm">
                    <BookOpen className="w-4 h-4 text-[#c4903c]" />
                    <span>Traceable Classical Shastras Cited</span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-xl bg-[#faf8f4] border border-[#ede5d6] flex items-center justify-between">
                      <div>
                        <span className="font-bold text-stone-900 block">Brihat Parashara Hora Shastra (BPHS)</span>
                        <span className="text-[11px] text-stone-500">Chapters 84-88 (Shanti Adhyaya) & Chapter 46 (Dasha Phala)</span>
                      </div>
                      <Link
                        href="/library"
                        className="text-[#13382c] hover:underline flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="p-3 rounded-xl bg-[#faf8f4] border border-[#ede5d6] flex items-center justify-between">
                      <div>
                        <span className="font-bold text-stone-900 block">Surya Siddhanta</span>
                        <span className="text-[11px] text-stone-500">Grahaganita & Panchang Astronomical Formulations</span>
                      </div>
                      <Link
                        href="/library"
                        className="text-[#13382c] hover:underline flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="p-3 rounded-xl bg-[#faf8f4] border border-[#ede5d6] flex items-center justify-between">
                      <div>
                        <span className="font-bold text-stone-900 block">Phaladeepika & Muhurta Chintamani</span>
                        <span className="text-[11px] text-stone-500">Transit houses, Vedha checks & Choghadiya periods</span>
                      </div>
                      <Link
                        href="/library"
                        className="text-[#13382c] hover:underline flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* AI Jyotish Assistant Deep-Dive Prompts */}
                <div className="lg:col-span-6 bg-gradient-to-br from-[#faf8f4] via-white to-[#faf8f4] rounded-3xl border border-[#ede5d6] p-6 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-stone-900 font-serif font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-[#c4903c]" />
                    <span>Inquire with AI Jyotish Assistant</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Select a classical inquiry to explore how today's transits, Dasha phase, and remedies connect with your personal horoscope:
                  </p>

                  <div className="space-y-2">
                    {[
                      "Explain today's transit of Jupiter relative to my birth chart",
                      "What are classical remedies for Rahu Kaal according to BPHS?",
                      "Explain the Anvaya and philosophical meaning of today's Sanskrit shloka",
                      "How do the three Nadis connect with today's ruling planet?",
                    ].map((query, idx) => (
                      <Link
                        key={idx}
                        href={`/astrology/ai-assistant?q=${encodeURIComponent(query)}`}
                        className="p-2.5 rounded-xl bg-white border border-[#ede5d6] text-xs text-stone-700 hover:text-[#13382c] hover:border-[#13382c] flex items-center justify-between transition shadow-2xs group"
                      >
                        <span className="truncate pr-2">"{query}"</span>
                        <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#13382c] shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Ethical & Scientific Disclaimer */}
            <div className="bg-[#faf5ec] rounded-2xl border border-[#ede5d6] p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center gap-4">
              <Info className="w-5 h-5 text-[#c4903c] shrink-0" />
              <div className="text-xs text-stone-600 leading-relaxed">
                <span className="font-bold text-stone-800 block mb-0.5">
                  {guidance.safetyNotice?.title || "Ethical Vedic Guidance & Educational Notice"}
                </span>
                {guidance.safetyNotice?.text ||
                  "Daily astrological insights, remedies, and spiritual practices are provided for philosophical reflection, self-awareness, and cultural education. They do not constitute guaranteed outcomes or replace professional medical, financial, or legal counsel."}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
