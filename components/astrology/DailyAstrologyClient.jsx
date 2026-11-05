"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sun, Moon, Star, Compass, Clock, MapPin, Calendar,
  BookOpen, Sparkles, ChevronLeft, ChevronRight, Globe,
  Loader2, AlertCircle, CheckCircle2, Info, RefreshCw,
  Briefcase, Brain, Heart, Wallet, Zap, Flame,
  ArrowRight, Shield, Languages, Target, Send, Check,
  Share2, Copy, Palette, CheckCheck,
} from "lucide-react";
import { NAKSHATRA_MUHURTA, QUICK_TASK_PROMPTS } from "./muhurtaConstants";
import { WORLD_CITIES } from "./worldLocations";
import LiveChoghadiyaWatch from "./LiveChoghadiyaWatch.jsx";

// ---------------------------------------------------------------------------
// Preset cities (matching AstrologyPortalClient & DailyAstrologyDashboard)
// ---------------------------------------------------------------------------
const PRESET_CITIES = WORLD_CITIES;

const CARD_ICONS = {
  work:          Briefcase,
  learning:      Brain,
  relationships: Heart,
  finances:      Wallet,
  health:        Zap,
  spiritual:     Flame,
};

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------
function getTodayLocal(tzOffset) {
  const nowLocal = new Date(Date.now() + tzOffset * 3600 * 1000);
  return nowLocal.toISOString().split("T")[0];
}

function offsetDate(dateStr, delta) {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LoadingSpinner({ message = "गणना हो रही है..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-stone-500">
      <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

function PanchangCard({ panchang, language }) {
  if (!panchang) return null;
  const isHi = language === "hi";
  const { tithi, nakshatra, yoga, karana, vara, moonSign, sunrise, sunset, rahuKaal } = panchang;

  const rows = [
    { label: isHi ? "तिथि" : "Tithi",      value: isHi ? `${tithi.paksha} ${tithi.devanagari}` : `${tithi.paksha} ${tithi.name}` },
    { label: isHi ? "वार" : "Vara",         value: isHi ? vara.hi : vara.en },
    { label: isHi ? "नक्षत्र" : "Nakshatra", value: isHi ? `${nakshatra.devanagari} (पाद ${nakshatra.pada})` : `${nakshatra.name} (Pada ${nakshatra.pada})` },
    { label: isHi ? "योग" : "Yoga",         value: isHi ? yoga.devanagari : yoga.name },
    { label: isHi ? "करण" : "Karana",       value: isHi ? karana.devanagari : karana.name },
    { label: isHi ? "चंद्र राशि" : "Moon Sign", value: isHi ? moonSign.sanskritName : moonSign.name },
    { label: isHi ? "सूर्योदय" : "Sunrise",  value: sunrise?.local || "—" },
    { label: isHi ? "सूर्यास्त" : "Sunset",  value: sunset?.local  || "—" },
  ];

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sun className="w-5 h-5 text-amber-600" />
        <h3 className="font-serif font-semibold text-stone-800 text-lg">
          {isHi ? "पंचांग" : "Daily Panchang"}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-y-3 gap-x-4">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">{row.label}</p>
            <p className="text-sm text-stone-800 font-semibold mt-0.5">{row.value}</p>
          </div>
        ))}
      </div>

      {rahuKaal && (
        <div className="mt-4 pt-4 border-t border-amber-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-stone-700">
                {isHi ? "राहुकाल" : "Rahu Kaal"}: {rahuKaal.startLocal} – {rahuKaal.endLocal}
              </p>
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                {isHi ? rahuKaal.descriptionHi : rahuKaal.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShareWhatsAppButton({ panchang, report, language }) {
  const [copied, setCopied] = useState(false);
  const isHi = language === "hi";

  const handleShare = async () => {
    if (!panchang) return;
    const dateStr = panchang.date;
    const tithiStr = `${panchang.tithi?.paksha} ${panchang.tithi?.devanagari}`;
    const nakshatraStr = panchang.nakshatra?.devanagari;
    const rahuKaalStr = panchang.rahuKaal ? `${panchang.rahuKaal.startLocal} - ${panchang.rahuKaal.endLocal}` : "N/A";
    const themeStr = report?.overallTheme?.hi || "";
    const luckyColor = panchang.luckyMetrics?.colorHi || "";
    const luckyNumber = panchang.luckyMetrics?.number || "";

    const text = `🕉️ *गुरुकुल दैनिक पंचांग व राशिफल* — ${dateStr}\n` +
      `📅 *तिथि:* ${tithiStr} | *वार:* ${panchang.vara?.hi}\n` +
      `✨ *नक्षत्र:* ${nakshatraStr} (${panchang.nakshatra?.lord || ""})\n` +
      `🎨 *शुभ रंग:* ${luckyColor} | *शुभ अंक:* ${luckyNumber}\n` +
      `⚠️ *राहुकाल:* ${rahuKaalStr}\n` +
      `🌟 *आज का मुख्य भाव:* ${themeStr}\n\n` +
      `🔗 विस्तृत फलादेश व कार्य अनुकूलता जांचें:\n${typeof window !== "undefined" ? window.location.href : "https://gurukul.ai/astrology/daily"}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Gurukul Daily Astrology - ${dateStr}`,
          text,
          url: window.location.href,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer shadow-xs shrink-0"
    >
      {copied ? (
        <>
          <CheckCheck className="w-3.5 h-3.5 text-white" />
          <span>{isHi ? "कॉपी हुआ!" : "Copied!"}</span>
        </>
      ) : (
        <>
          <Share2 className="w-3.5 h-3.5 text-white" />
          <span>{isHi ? "व्हाट्सएप शेयर" : "Share on WhatsApp"}</span>
        </>
      )}
    </button>
  );
}

function LuckyMetricsBar({ lucky, language }) {
  if (!lucky) return null;
  const isHi = language === "hi";

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-amber-600" />
        <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
          {isHi ? "आज के शुभ संकेत व अनुकूलता (Daily Lucky Metrics)" : "Today's Lucky Alignment Metrics"}
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Lucky Color */}
        <div className="bg-white/90 border border-stone-200/90 rounded-xl p-3 shadow-2xs flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl border border-black/10 shrink-0 shadow-xs flex items-center justify-center text-white"
            style={{ backgroundColor: lucky.colorHex || "#EA580C" }}
          >
            <Palette className="w-4 h-4 drop-shadow-xs" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
              {isHi ? "शुभ रंग" : "Lucky Color"}
            </p>
            <p className="text-xs font-bold text-stone-800 mt-0.5 leading-tight">
              {isHi ? lucky.colorHi : lucky.colorEn}
            </p>
          </div>
        </div>

        {/* Lucky Number */}
        <div className="bg-white/90 border border-stone-200/90 rounded-xl p-3 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 shrink-0 shadow-xs flex items-center justify-center font-bold text-base font-serif">
            #
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
              {isHi ? "शुभ अंक" : "Lucky Numbers"}
            </p>
            <p className="text-sm font-bold text-stone-800 mt-0.5 leading-tight">
              {lucky.number}
            </p>
          </div>
        </div>

        {/* Auspicious Direction */}
        <div className="bg-white/90 border border-stone-200/90 rounded-xl p-3 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 shrink-0 shadow-xs flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
              {isHi ? "शुभ दिशा" : "Best Direction"}
            </p>
            <p className="text-xs font-bold text-stone-800 mt-0.5 leading-tight">
              {isHi ? lucky.directionHi : lucky.directionEn}
            </p>
          </div>
        </div>

        {/* Daily Mantra */}
        <div className="bg-white/90 border border-stone-200/90 rounded-xl p-3 shadow-2xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-100 border border-violet-300 text-violet-800 shrink-0 shadow-xs flex items-center justify-center font-serif text-sm">
            ॐ
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
              {isHi ? "दिन का मंत्र" : "Daily Mantra"}
            </p>
            <p className="text-xs font-bold text-violet-900 mt-0.5 truncate" title={lucky.mantra}>
              {lucky.mantra}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChoghadiyaPanel({ choghadiya, language }) {
  if (!choghadiya || (!choghadiya.day?.length && !choghadiya.night?.length)) return null;
  const isHi = language === "hi";
  const [tab, setTab] = useState("day");
  const slots = tab === "day" ? choghadiya.day : choghadiya.night;

  const qualityBadge = (quality) => {
    if (quality === "good") return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (quality === "neutral") return "bg-sky-100 text-sky-800 border-sky-300";
    return "bg-rose-100 text-rose-800 border-rose-300";
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="font-serif font-bold text-stone-900 text-base">
              {isHi ? "दैनिक चौघड़िया मुहूर्त (Choghadiya)" : "Daily Choghadiya Muhurta"}
            </h3>
            <p className="text-xs text-stone-500">
              {isHi
                ? "अमृत, शुभ, लाभ (श्रेष्ठ) • चर (सामान्य) • उद्वेग, काल, रोग (त्याज्य)"
                : "Amrit, Shubh, Labh (Auspicious) • Char (Neutral) • Udveg, Kaal, Rog (Inauspicious)"}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl self-start sm:self-auto border border-stone-200">
          <button
            type="button"
            onClick={() => setTab("day")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              tab === "day" ? "bg-white text-stone-900 shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            <span>{isHi ? "दिन का चौघड़िया" : "Day Choghadiya"}</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("night")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              tab === "night" ? "bg-white text-stone-900 shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isHi ? "रात का चौघड़िया" : "Night Choghadiya"}</span>
          </button>
        </div>
      </div>

      {/* Grid of 8 Slots */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {slots?.map((slot, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl border transition relative ${
              slot.isActive
                ? "bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/50 shadow-xs"
                : "bg-stone-50/60 border-stone-200/80 hover:bg-white"
            }`}
          >
            {slot.isActive && (
              <span className="absolute -top-2 right-2 text-[9px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                {isHi ? "अभी सक्रिय" : "LIVE NOW"}
              </span>
            )}
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="font-serif font-bold text-sm text-stone-900">
                {isHi ? slot.nameHi : slot.nameEn}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${qualityBadge(slot.quality)}`}>
                {isHi ? slot.nature.split(" ")[0] : slot.quality}
              </span>
            </div>

            <p className="text-xs font-semibold text-stone-700">
              {slot.startLocal} – {slot.endLocal}
            </p>
            <p className="text-[10px] text-stone-400 mt-1">
              {isHi ? `स्वामी: ${slot.lord}` : `Lord: ${slot.lord}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DayCard({ card, language }) {
  const isHi = language === "hi";
  const Icon = CARD_ICONS[card.category] || Star;
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-amber-700" />
        </div>
        <h4 className="font-semibold text-stone-800 text-sm">
          {isHi ? card.titleHi : card.titleEn}
        </h4>
      </div>
      <p className="text-sm text-stone-600 leading-relaxed mb-3">
        {isHi ? card.interpretationHi : card.interpretationEn}
      </p>
      {(card.recommendationEn || card.recommendationHi) && (
        <div className="bg-amber-50 rounded-lg px-3 py-2">
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            <span className="font-bold">{isHi ? "सुझाव: " : "Suggestion: "}</span>
            {isHi ? card.recommendationHi : card.recommendationEn}
          </p>
        </div>
      )}
    </div>
  );
}

function TransitPlanetRow({ planet, language }) {
  const isHi = language === "hi";
  return (
    <div className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-xs w-20 text-stone-500 font-medium">
          {isHi ? planet.sanskritName?.split("(")[1]?.replace(")", "") || planet.name : planet.name}
        </span>
        {planet.retrograde && (
          <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-bold">R</span>
        )}
      </div>
      <div className="text-right">
        <span className="text-xs text-stone-700 font-semibold">
          {isHi ? planet.sanskritSign?.split("(")[0]?.trim() || planet.sign : planet.sign}
        </span>
        <span className="text-[10px] text-stone-400 ml-1">{planet.nakshatra}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export default function DailyAstrologyClient() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setSession(data);
      })
      .catch(() => {});
  }, []);

  const isHi = true; // default to Hindi; user can toggle
  const [language, setLanguage] = useState("hi");
  const lang = language;

  // Location state
  const [selectedCity, setSelectedCity] = useState(PRESET_CITIES[0]);
  const [customLat, setCustomLat] = useState("");
  const [customLon, setCustomLon] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  // Date navigation
  const [date, setDate] = useState(() => getTodayLocal(5.5));

  // Data state
  const [panchang, setPanchang] = useState(null);
  const [report, setReport] = useState(null);
  const [transits, setTransits] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [cached, setCached] = useState(false);

  // Active section for scrollspy
  const [activeSection, setActiveSection] = useState("overview");

  const getCoords = useCallback(() => {
    if (useCustom && customLat && customLon) {
      return { lat: parseFloat(customLat), lon: parseFloat(customLon), tz: 0, timezone: "UTC" };
    }
    return { lat: selectedCity.lat, lon: selectedCity.lon, tz: selectedCity.tz, tzStr: selectedCity.tzStr };
  }, [useCustom, customLat, customLon, selectedCity]);

  const fetchDailyReport = useCallback(async () => {
    const { lat, lon, tz, tzStr } = getCoords();
    if (isNaN(lat) || isNaN(lon)) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        date,
        lat: lat.toString(),
        lon: lon.toString(),
        tz: tz.toString(),
        timezone: tzStr || "UTC",
        language: lang,
      });

      const res = await fetch(`/api/astrology/daily?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setPanchang(data.panchang);
      setReport(data.report);
      setTransits(data.report?.transits || null);
      setIsPersonalized(data.isPersonalized);
      setCached(data.cached);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [date, lang, getCoords]);

  useEffect(() => {
    fetchDailyReport();
  }, [fetchDailyReport]);

  const navigateDate = (delta) => {
    setDate((d) => offsetDate(d, delta));
  };

  // Task feasibility evaluation state
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
      const { lat, lon, tz, tzStr } = getCoords();
      const res = await fetch("/api/astrology/daily/check-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: text.trim(),
          date,
          lat,
          lon,
          tz,
          timezone: tzStr,
          language: lang,
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

  const todayDate = getTodayLocal(getCoords().tz);
  const isToday = date === todayDate;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Header */}
      <div className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/astrology" className="text-amber-300 text-sm hover:text-amber-200 transition-colors flex items-center gap-1">
                  <Compass className="w-3 h-3" /> {lang === "hi" ? "ज्योतिष" : "Astrology"}
                </Link>
                <span className="text-stone-500 text-sm">/</span>
                <span className="text-stone-300 text-sm">{lang === "hi" ? "दैनिक" : "Daily"}</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-amber-100">
                {lang === "hi" ? "दैनिक राशिफल" : "Daily Cosmic Guide"}
              </h1>
              <p className="text-stone-400 text-sm mt-1">
                {lang === "hi"
                  ? "आज के ग्रह गोचर और पंचांग पर आधारित मार्गदर्शन"
                  : "Guidance based on today's planetary transits and Panchang"}
              </p>
            </div>

            {/* Actions: Share & Language */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <ShareWhatsAppButton panchang={panchang} report={report} language={lang} />
              <button
                onClick={() => setLanguage((l) => l === "hi" ? "en" : "hi")}
                className="flex items-center gap-2 bg-stone-800 hover:bg-stone-700 text-amber-200 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <Languages className="w-4 h-4" />
                {lang === "hi" ? "English" : "हिंदी"}
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-6 flex flex-wrap gap-3 items-end">
            {/* City selector */}
            <div>
              <label className="text-xs text-stone-400 mb-1 block">
                <MapPin className="w-3 h-3 inline mr-1" />
                {lang === "hi" ? "स्थान" : "Location"}
              </label>
              <select
                value={useCustom ? "__custom__" : selectedCity.name}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setUseCustom(true);
                  } else {
                    const city = PRESET_CITIES.find((c) => c.name === e.target.value);
                    if (city) { setSelectedCity(city); setUseCustom(false); }
                  }
                }}
                className="bg-stone-800 border border-stone-700 text-white text-sm rounded-lg px-3 py-2 min-w-[200px]"
              >
                {PRESET_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
                <option value="__custom__">{lang === "hi" ? "कस्टम निर्देशांक" : "Custom coordinates"}</option>
              </select>
            </div>

            {useCustom && (
              <>
                <div>
                  <label className="text-xs text-stone-400 mb-1 block">Lat</label>
                  <input
                    type="number"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    placeholder="28.61"
                    className="bg-stone-800 border border-stone-700 text-white text-sm rounded-lg px-3 py-2 w-24"
                  />
                </div>
                <div>
                  <label className="text-xs text-stone-400 mb-1 block">Lon</label>
                  <input
                    type="number"
                    value={customLon}
                    onChange={(e) => setCustomLon(e.target.value)}
                    placeholder="77.21"
                    className="bg-stone-800 border border-stone-700 text-white text-sm rounded-lg px-3 py-2 w-24"
                  />
                </div>
              </>
            )}

            {/* Date navigation */}
            <div>
              <label className="text-xs text-stone-400 mb-1 block">
                <Calendar className="w-3 h-3 inline mr-1" />
                {lang === "hi" ? "तारीख" : "Date"}
              </label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigateDate(-1)}
                  className="bg-stone-800 hover:bg-stone-700 text-white p-2 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-stone-800 border border-stone-700 text-white text-sm rounded-lg px-3 py-2"
                />
                <button
                  onClick={() => navigateDate(+1)}
                  className="bg-stone-800 hover:bg-stone-700 text-white p-2 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                {!isToday && (
                  <button
                    onClick={() => setDate(todayDate)}
                    className="bg-amber-700 hover:bg-amber-600 text-white text-xs px-3 py-2 rounded-lg ml-1 transition-colors"
                  >
                    {lang === "hi" ? "आज" : "Today"}
                  </button>
                )}
              </div>
            </div>

            {/* Refresh */}
            <button
              onClick={fetchDailyReport}
              disabled={loading}
              className="bg-amber-700 hover:bg-amber-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors self-end"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {lang === "hi" ? "गणना करें" : "Calculate"}
            </button>
          </div>

          {/* Personalization status */}
          <div className="mt-4 flex items-center gap-2 text-xs">
            {session ? (
              isPersonalized ? (
                <span className="flex items-center gap-1.5 text-green-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {lang === "hi" ? "आपकी जन्मपत्री के अनुसार व्यक्तिगत फल" : "Personalized to your birth chart"}
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-stone-400">
                  <Info className="w-3.5 h-3.5" />
                  {lang === "hi" ? "सामान्य फल — " : "General reading — "}
                  <Link href="/astrology" className="text-amber-400 hover:underline">
                    {lang === "hi" ? "कुंडली बनाएं" : "Create Kundli"}
                  </Link>
                </span>
              )
            ) : (
              <span className="flex items-center gap-1.5 text-stone-400">
                <Info className="w-3.5 h-3.5" />
                {lang === "hi" ? "सामान्य फल — व्यक्तिगत फल के लिए " : "General reading — for personalization "}
                <Link href="/auth/signin" className="text-amber-400 hover:underline">
                  {lang === "hi" ? "लॉगिन करें" : "sign in"}
                </Link>
              </span>
            )}
            {cached && (
              <span className="text-stone-500 ml-2">• {lang === "hi" ? "कैश से" : "cached"}</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {loading && <LoadingSpinner message={lang === "hi" ? "पंचांग और ग्रह गोचर की गणना हो रही है..." : "Computing Panchang and planetary transits..."} />}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-semibold text-sm">{lang === "hi" ? "त्रुटि" : "Error"}</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <button onClick={fetchDailyReport} className="mt-2 text-xs text-red-700 underline">
                {lang === "hi" ? "पुनः प्रयास करें" : "Retry"}
              </button>
            </div>
          </div>
        )}

        {!loading && panchang && report && (
          <div className="space-y-8">
            {/* Daily Lucky Metrics Bar */}
            {panchang.luckyMetrics && (
              <LuckyMetricsBar lucky={panchang.luckyMetrics} language={lang} />
            )}

            {/* A. Cosmic Overview + Panchang */}
            <section id="overview">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Summary */}
                <div className="lg:col-span-3">
                  <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-amber-600" />
                      <h2 className="font-serif font-semibold text-stone-800 text-xl">
                        {lang === "hi" ? "आज का परिदृश्य" : "Today's Cosmic Overview"}
                      </h2>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-4">
                      <p className="text-lg font-serif text-stone-800 font-semibold">
                        {lang === "hi" ? report.overallTheme?.hi : report.overallTheme?.en}
                      </p>
                    </div>

                    <p className="text-stone-600 leading-relaxed text-sm">
                      {lang === "hi" ? report.dailySummary?.hi : report.dailySummary?.en}
                    </p>

                    {/* Key Panchang highlights */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {[
                        { icon: Moon, label: lang === "hi" ? panchang.moonSign.sanskritName : panchang.moonSign.name },
                        { icon: Star, label: lang === "hi" ? panchang.nakshatra.devanagari : panchang.nakshatra.name },
                        { icon: Sun,  label: lang === "hi" ? panchang.tithi.devanagari : panchang.tithi.name },
                      ].map(({ icon: Icon, label }) => (
                        <span key={label} className="inline-flex items-center gap-1.5 bg-stone-100 text-stone-700 text-xs px-3 py-1.5 rounded-full font-medium">
                          <Icon className="w-3 h-3 text-amber-600" />
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Panchang panel */}
                <div className="lg:col-span-2">
                  <PanchangCard panchang={panchang} language={lang} />
                </div>
              </div>
            </section>

            {/* B. Day at a Glance Cards */}
            {report.cards && report.cards.length > 0 && (
              <section id="day-cards">
                <h2 className="font-serif text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-amber-600" />
                  {lang === "hi" ? "आज का मार्गदर्शन" : "Your Day at a Glance"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {report.cards.map((card) => (
                    <DayCard key={card.category} card={card} language={lang} />
                  ))}
                </div>
              </section>
            )}

            {/* C & D. What to Do / Avoid (Expanded with Classical Muhurta) */}
            <section id="guidance" className="space-y-6">
              {/* Nakshatra Muhurta Energy Banner */}
              {panchang.nakshatra && (
                <div className="bg-gradient-to-r from-amber-50 via-stone-50 to-orange-50 border border-amber-200/90 rounded-2xl p-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif font-bold text-stone-900 text-base">
                            {lang === "hi"
                              ? `${panchang.nakshatra.devanagari} नक्षत्र की ऊर्जा प्रकृति`
                              : `${panchang.nakshatra.name} Nakshatra Energy Nature`}
                          </h3>
                          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-200/80 text-amber-900">
                            {NAKSHATRA_MUHURTA[panchang.nakshatra.name]
                              ? (lang === "hi" ? NAKSHATRA_MUHURTA[panchang.nakshatra.name].typeHi : NAKSHATRA_MUHURTA[panchang.nakshatra.name].typeEn)
                              : (lang === "hi" ? "सामान्य ऊर्जा" : "Standard Energy")}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {lang === "hi"
                            ? `अधिपति: ${panchang.nakshatra.lord || "ग्रह"} • चरण: ${panchang.nakshatra.pada} • मुहूर्त चिंतामणि व बृहत्संहिता के अनुसार वर्गीकरण`
                            : `Ruling Lord: ${panchang.nakshatra.lord || "Planet"} • Pada: ${panchang.nakshatra.pada} • Classified per Classical Brihat Samhita`}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-stone-600 bg-white/80 border border-amber-100 rounded-xl px-3 py-1.5 self-start sm:self-auto">
                      <span className="font-semibold text-amber-800">{lang === "hi" ? "तिथि स्वरूप: " : "Tithi Nature: "}</span>
                      {panchang.tithi?.paksha} {lang === "hi" ? panchang.tithi?.devanagari : panchang.tithi?.name}
                    </div>
                  </div>

                  {/* Classical Muhurta Auspicious / Caution Activities */}
                  {NAKSHATRA_MUHURTA[panchang.nakshatra.name] && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-1">
                      <div className="bg-white/90 border border-emerald-200/80 rounded-xl p-3.5">
                        <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{lang === "hi" ? "आज विशेष फलदायी कार्य (शुभ आरंभ)" : "Auspicious Activities for Today"}</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {(lang === "hi"
                            ? NAKSHATRA_MUHURTA[panchang.nakshatra.name].auspiciousForHi
                            : NAKSHATRA_MUHURTA[panchang.nakshatra.name].auspiciousForEn
                          ).map((act, idx) => (
                            <span key={idx} className="text-xs bg-emerald-50 text-emerald-900 border border-emerald-200/60 px-2.5 py-1 rounded-lg font-medium">
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-white/90 border border-orange-200/80 rounded-xl p-3.5">
                        <p className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-orange-600" />
                          <span>{lang === "hi" ? "जिनमें विशेष सावधानी बरतें" : "Activities Requiring Prudence"}</span>
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {(lang === "hi"
                            ? NAKSHATRA_MUHURTA[panchang.nakshatra.name].avoidForHi
                            : NAKSHATRA_MUHURTA[panchang.nakshatra.name].avoidForEn
                          ).map((act, idx) => (
                            <span key={idx} className="text-xs bg-orange-50 text-orange-900 border border-orange-200/60 px-2.5 py-1 rounded-lg font-medium">
                              {act}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* What to Do / What to Avoid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* What to Do */}
                {report.whatToDo && report.whatToDo.length > 0 && (
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 shadow-xs">
                    <h3 className="font-serif font-semibold text-stone-800 text-lg mb-4 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      {lang === "hi" ? "आज क्या करें (सकारात्मक पहल)" : "What to Do Today"}
                    </h3>
                    <ul className="space-y-3.5">
                      {report.whatToDo.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 bg-white/80 p-3 rounded-xl border border-emerald-100">
                          <span className="w-6 h-6 bg-emerald-100 text-emerald-800 rounded-lg text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-stone-800 leading-snug">
                              {lang === "hi" ? item.hi : item.en}
                            </p>
                            {item.reason && (
                              <p className="text-xs text-stone-500 mt-1 bg-emerald-50/60 px-2 py-0.5 rounded inline-block">
                                <span className="font-semibold text-emerald-800">{lang === "hi" ? "कारण: " : "Astrological basis: "}</span>
                                {item.reason}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What to Avoid */}
                {report.whatToAvoid && report.whatToAvoid.length > 0 && (
                  <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-5 shadow-xs">
                    <h3 className="font-serif font-semibold text-stone-800 text-lg mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-orange-600" />
                      {lang === "hi" ? "आज क्या न करें (सतर्कता सुझाव)" : "What to Avoid Today"}
                    </h3>
                    <ul className="space-y-3.5">
                      {report.whatToAvoid.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 bg-white/80 p-3 rounded-xl border border-orange-100">
                          <span className="w-6 h-6 bg-orange-100 text-orange-800 rounded-lg text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-stone-800 leading-snug">
                              {lang === "hi" ? item.hi : item.en}
                            </p>
                            {item.reason && (
                              <p className="text-xs text-stone-500 mt-1 bg-orange-50/60 px-2 py-0.5 rounded inline-block">
                                <span className="font-semibold text-orange-800">{lang === "hi" ? "कारण: " : "Astrological basis: "}</span>
                                {item.reason}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            {/* INTERACTIVE WORK FEASIBILITY CHECKER: क्या मेरा काम आज बनेगा? */}
            <section id="work-checker" className="bg-gradient-to-br from-stone-900 via-stone-850 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg border border-amber-500/20">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-amber-100">
                      {lang === "hi" ? "कार्य अनुकूलता जांचें — क्या आज मेरा काम बनेगा?" : "Will My Work Succeed Today? — Task Feasibility Checker"}
                    </h2>
                    <p className="text-stone-300 text-xs sm:text-sm mt-0.5">
                      {lang === "hi"
                        ? "अपना कोई भी कार्य, योजना या प्रश्न लिखें — आज के पंचांग, नक्षत्र प्रकृति, शुभ-अशुभ समय व गोचर के आधार पर विश्लेषण पाएं।"
                        : "Describe any planned work, meeting, or transaction to evaluate its astrological alignment with today's Panchang."}
                    </p>
                  </div>
                </div>

                {/* Input Area */}
                <div className="mt-5 space-y-3">
                  <div className="relative">
                    <textarea
                      rows={3}
                      value={taskQuery}
                      onChange={(e) => setTaskQuery(e.target.value)}
                      placeholder={
                        lang === "hi"
                          ? "उदा. 'आज 2 बजे मेरी नौकरी का इंटरव्यू है', या 'क्या आज नया अनुबंध साइन करना व संपत्ति खरीदना ठीक रहेगा?'"
                          : "e.g. 'I have a crucial job interview at 2 PM', or 'Should I sign my partnership agreement and buy a car today?'"
                      }
                      className="w-full bg-stone-950/70 border border-stone-700/80 rounded-2xl p-4 text-sm text-white placeholder-stone-400 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                    />
                  </div>

                  {/* Quick Task Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-amber-300/80 font-medium mr-1">
                      {lang === "hi" ? "त्वरित चयन:" : "Quick ideas:"}
                    </span>
                    {QUICK_TASK_PROMPTS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const text = lang === "hi" ? p.hi : p.en;
                          setTaskQuery(text);
                          handleEvaluateTask(text);
                        }}
                        className="text-xs bg-stone-800/80 hover:bg-amber-900/60 text-stone-200 border border-stone-700/70 hover:border-amber-500/50 px-2.5 py-1 rounded-lg transition cursor-pointer"
                      >
                        {lang === "hi" ? p.hi : p.en}
                      </button>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <button
                      type="button"
                      disabled={taskEvaluating || !taskQuery.trim() || taskQuery.trim().length < 3}
                      onClick={() => handleEvaluateTask()}
                      className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold px-6 py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition shadow-sm cursor-pointer self-start sm:self-auto"
                    >
                      {taskEvaluating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                          <span>{lang === "hi" ? "मुहूर्त व गोचर का विश्लेषण जारी..." : "Analyzing Muhurta & transits..."}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-stone-950" />
                          <span>{lang === "hi" ? "अनुकूलता जांचें (Evaluate)" : "Evaluate My Work"}</span>
                        </>
                      )}
                    </button>

                    <span className="text-[11px] text-stone-400 italic">
                      {lang === "hi"
                        ? "पारंपरिक मुहूर्त सिद्धांतों व लाहिरी पंचांग पर आधारित वस्तुनिष्ठ गणना"
                        : "Deterministic analysis grounded in classical Muhurta principles"}
                    </span>
                  </div>

                  {taskError && (
                    <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{taskError}</span>
                    </div>
                  )}
                </div>

                {/* Result Card */}
                {taskResult && (
                  <div className="mt-6 bg-stone-900/90 border border-amber-500/30 rounded-2xl p-6 text-stone-100 shadow-md space-y-4 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold block mb-0.5">
                          {lang === "hi" ? "कार्य विश्लेषण परिणाम" : "Task Feasibility Evaluation"}
                        </span>
                        <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                          <span>{lang === "hi" ? taskResult.verdict?.hi : taskResult.verdict?.en}</span>
                          <span className="text-amber-400 text-sm">
                            {"★".repeat(taskResult.score || 3)}{"☆".repeat(Math.max(0, 5 - (taskResult.score || 3)))}
                          </span>
                        </h3>
                      </div>

                      <div className="bg-amber-950/60 border border-amber-600/40 text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-xl self-start sm:self-auto">
                        {lang === "hi" ? "अनुकूलता स्तर: " : "Alignment: "}
                        {taskResult.score}/5
                      </div>
                    </div>

                    {/* Analysis Content */}
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-stone-400 font-bold mb-1">
                          {lang === "hi" ? "ज्योतिषीय परिस्थिति व प्रभाव:" : "Cosmic & Astrological Analysis:"}
                        </p>
                        <p className="text-sm text-stone-200 leading-relaxed bg-stone-950/50 p-3.5 rounded-xl border border-stone-800/80">
                          {lang === "hi" ? taskResult.feasibilityAnalysis?.hi : taskResult.feasibilityAnalysis?.en}
                        </p>
                      </div>

                      {/* Optimal Time Window */}
                      {taskResult.optimalTimeWindow && (
                        <div className="bg-amber-950/30 border border-amber-800/40 p-3.5 rounded-xl">
                          <p className="text-xs font-bold text-amber-300 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>{lang === "hi" ? "अनुशंसित समय खिड़की (शुभ काल)" : "Recommended Time Window"}</span>
                          </p>
                          <p className="text-sm text-amber-100 font-medium leading-relaxed">
                            {lang === "hi" ? taskResult.optimalTimeWindow.hi : taskResult.optimalTimeWindow.en}
                          </p>
                        </div>
                      )}

                      {/* Practical Recommendations & Precautions */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {taskResult.practicalRecommendations && taskResult.practicalRecommendations.length > 0 && (
                          <div className="bg-stone-950/60 border border-emerald-900/40 p-3.5 rounded-xl">
                            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{lang === "hi" ? "सफलता हेतु व्यावहारिक कदम" : "Practical Recommendations"}</span>
                            </p>
                            <ul className="space-y-1.5 text-xs text-stone-300">
                              {taskResult.practicalRecommendations.map((r, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-emerald-400 font-bold">•</span>
                                  <span>{lang === "hi" ? r.hi : r.en}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {taskResult.precautionsToObserve && taskResult.precautionsToObserve.length > 0 && (
                          <div className="bg-stone-950/60 border border-orange-900/40 p-3.5 rounded-xl">
                            <p className="text-xs font-bold text-orange-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-orange-400" />
                              <span>{lang === "hi" ? "बरतने योग्य सावधानियां" : "Precautions to Observe"}</span>
                            </p>
                            <ul className="space-y-1.5 text-xs text-stone-300">
                              {taskResult.precautionsToObserve.map((pr, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                  <span className="text-orange-400 font-bold">•</span>
                                  <span>{lang === "hi" ? pr.hi : pr.en}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Contemplation */}
                      {taskResult.spiritualContemplation && (
                        <div className="bg-violet-950/30 border border-violet-800/30 p-3 rounded-xl text-xs text-violet-200">
                          <span className="font-semibold text-violet-300">{lang === "hi" ? "मानसिक शांति व स्मरण: " : "Mindful Reflection: "}</span>
                          {lang === "hi" ? taskResult.spiritualContemplation.hi : taskResult.spiritualContemplation.en}
                        </div>
                      )}

                      {/* Disclaimer */}
                      {taskResult.ethicalDisclaimer && (
                        <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-400 flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                          <p>{lang === "hi" ? taskResult.ethicalDisclaimer.hi : taskResult.ethicalDisclaimer.en}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Live Choghadiya Watch & Real-Time Countdown */}
            {panchang.choghadiya && (
              <section id="choghadiya">
                <LiveChoghadiyaWatch
                  choghadiya={panchang.choghadiya}
                  selectedDate={date}
                  timezoneOffsetHours={getCoords().tz}
                  locationName={useCustom ? `${customLat}, ${customLon}` : selectedCity.name}
                  language={lang}
                />
              </section>
            )}

            {/* E. Time Windows */}
            {panchang.rahuKaal && (
              <section id="time-windows">
                <h2 className="font-serif text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  {lang === "hi" ? "शुभ-अशुभ समय" : "Auspicious & Inauspicious Windows"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-xs text-stone-500 font-medium mb-1">{lang === "hi" ? "सूर्योदय" : "Sunrise"}</p>
                    <p className="text-2xl font-semibold text-amber-700">{panchang.sunrise?.local || "—"}</p>
                    <p className="text-xs text-stone-400 mt-1">{panchang.timezone}</p>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-xs text-stone-500 font-medium mb-1">{lang === "hi" ? "राहुकाल" : "Rahu Kaal"}</p>
                    <p className="text-xl font-semibold text-orange-700">
                      {panchang.rahuKaal.startLocal} – {panchang.rahuKaal.endLocal}
                    </p>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      {lang === "hi" ? panchang.rahuKaal.descriptionHi : panchang.rahuKaal.description}
                    </p>
                  </div>
                  <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm">
                    <p className="text-xs text-stone-500 font-medium mb-1">{lang === "hi" ? "सूर्यास्त" : "Sunset"}</p>
                    <p className="text-2xl font-semibold text-amber-700">{panchang.sunset?.local || "—"}</p>
                    <p className="text-xs text-stone-400 mt-1">{panchang.timezone}</p>
                  </div>
                </div>
                <p className="text-xs text-stone-400 mt-3 italic">
                  {lang === "hi"
                    ? `सभी समय ${panchang.timezone} के अनुसार। परंपरागत वैदिक ज्योतिष पर आधारित।`
                    : `All times shown for ${panchang.timezone}. Based on traditional Vedic almanac calculations.`}
                </p>
              </section>
            )}

            {/* F. Spiritual Practice */}
            {report.spiritualPractice && (
              <section id="spiritual">
                <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-6">
                  <h2 className="font-serif text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-violet-600" />
                    {lang === "hi" ? "दैनिक आध्यात्मिक अभ्यास" : "Daily Spiritual Practice"}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-violet-800 mb-1">
                        {lang === "hi" ? report.spiritualPractice.theme?.hi : report.spiritualPractice.theme?.en}
                      </p>
                      <p className="text-sm text-stone-600 leading-relaxed">
                        {lang === "hi" ? report.spiritualPractice.suggestion?.hi : report.spiritualPractice.suggestion?.en}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-violet-200 flex items-center gap-2 text-xs text-stone-500">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>
                      {lang === "hi"
                        ? "यह सुझाव पारंपरिक ज्योतिष पर आधारित है। किसी विशिष्ट मंत्र या श्लोक का प्रयोग केवल प्रामाणिक स्रोत से करें।"
                        : "This suggestion is based on traditional almanac themes. Always verify Sanskrit verses and mantras from authentic sources."}
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* G. Planetary Transits */}
            {transits && (
              <section id="transits">
                <h2 className="font-serif text-xl font-semibold text-stone-800 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-amber-600" />
                  {lang === "hi" ? "आज का ग्रह गोचर" : "Today's Planetary Transits"}
                </h2>
                <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                    {transits.all?.map((planet) => (
                      <TransitPlanetRow key={planet.planet} planet={planet} language={lang} />
                    ))}
                  </div>
                  <p className="text-xs text-stone-400 mt-4 italic">
                    {lang === "hi"
                      ? "सभी ग्रह स्थितियाँ लाहिरी अयनांश (सायन) से निकाली गई हैं। गणना: astronomy-engine।"
                      : "All planetary positions use Lahiri Ayanamsha (sidereal). Calculated via astronomy-engine."}
                  </p>

                  {transits.retrograde?.length > 0 && (
                    <div className="mt-3 bg-orange-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-orange-800">
                        <strong>{lang === "hi" ? "वक्री ग्रह: " : "Retrograde: "}</strong>
                        {transits.retrograde.map((p) => p.name).join(", ")}
                        {" — "}
                        {lang === "hi"
                          ? "वक्री ग्रह पुनर्विचार और आंतरिक चिंतन का समय होता है।"
                          : "Retrograde periods are traditionally associated with review and reflection."}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Disclaimer */}
            {report.disclaimer && (
              <div className="bg-stone-100 border border-stone-200 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                <p className="text-xs text-stone-500 leading-relaxed">
                  {lang === "hi" ? report.disclaimer.hi : report.disclaimer.en}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
