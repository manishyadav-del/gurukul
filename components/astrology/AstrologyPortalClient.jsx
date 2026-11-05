"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Compass,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Sun,
  Moon,
  Orbit,
  RotateCcw,
  Wrench,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BookOpen,
  CalendarDays,
  Flame,
  Star,
  Scale,
  Sunrise,
  Sunset,
  Languages,
  Globe,
  ShieldCheck,
  Layers,
  Grid,
  Bot,
  Heart,
} from "lucide-react";
import NorthIndianChart from "./NorthIndianChart";
import HoroscopeLearningPortal from "./HoroscopeLearningPortal";
import DivisionalChartsView from "./DivisionalChartsView";
import DashaTimelineView from "./DashaTimelineView";
import ShadbalaAshtakavargaView from "./ShadbalaAshtakavargaView";
import YogasAndDoshasView from "./YogasAndDoshasView";
import TransitIntelligenceView from "./TransitIntelligenceView";
import PersonalJyotishAssistant from "./PersonalJyotishAssistant";
import KundliMatchingView from "./KundliMatchingView";
import MuhurtaPlannerView from "./MuhurtaPlannerView";
import {
  LAGNA_EXPLANATIONS,
  MOON_SIGN_EXPLANATIONS,
  BHAVA_SIGNIFICATIONS,
  getPlanetHouseInterpretation,
  MAHADASHA_EXPLANATIONS,
  detectChartYogas,
  getPlanetName,
  getRashiName,
  PLANET_NAMES_HI,
  RASHI_NAMES_HI,
} from "./kundliExplanations";
import { formatDate } from "@/lib/utils";
import {
  WORLD_CITIES,
  formatTzOffset,
  estimateTzFromLongitude,
  COMMON_TIMEZONES,
} from "./worldLocations";

const PRESET_CITIES = WORLD_CITIES;

const CITY_CATEGORIES = [
  "Sacred India",
  "India",
  "Asia & Middle East",
  "Europe & UK",
  "Americas",
  "Australia & Pacific",
  "Africa",
];

export default function AstrologyPortalClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab") || "kundli";
  const [activeTab, setActiveTab] = useState(
    ["tools", "learning", "matching", "muhurta"].includes(tabParam) ? tabParam : "kundli"
  );
  const [learningCategory, setLearningCategory] = useState("overview");
  const [learningTarget, setLearningTarget] = useState(null);

  // Form inputs
  const [name, setName] = useState("Manish");
  const [dob, setDob] = useState(searchParams.get("dob") || "2001-02-24");
  const [tob, setTob] = useState(searchParams.get("tob") || "07:22");
  const [place, setPlace] = useState(searchParams.get("place") || "Deoria, Uttar Pradesh, India");
  const [gender, setGender] = useState("male");

  // State for calculation
  const [chart, setChart] = useState(null);
  const [kundliSubView, setKundliSubView] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("hi");
  const isHi = language === "hi";

  // Custom Place State
  const [isCustomPlace, setIsCustomPlace] = useState(false);
  const [customPlaceName, setCustomPlaceName] = useState("");
  const [customLat, setCustomLat] = useState("28.6139");
  const [customLon, setCustomLon] = useState("77.2090");
  const [customTz, setCustomTz] = useState("+05:30");

  // Family Members Selection for Personalized Astrology
  const [familyMembers, setFamilyMembers] = useState([]);
  const [selectedFamilyMemberId, setSelectedFamilyMemberId] = useState("");

  useEffect(() => {
    fetch("/api/family")
      .then((res) => (res.ok ? res.json() : { members: [] }))
      .then((data) => {
        if (data.members && data.members.length > 0) {
          setFamilyMembers(data.members);
        }
      })
      .catch(() => {});
  }, []);

  function handleSelectFamilyMember(memberId) {
    setSelectedFamilyMemberId(memberId);
    if (!memberId) return;
    const member = familyMembers.find((m) => m.id === memberId);
    if (member) {
      const newName = member.name;
      const newDob = member.dateOfBirth ? member.dateOfBirth.split("T")[0] : dob;
      const newTob = member.birthTime || tob;
      const newPlace = member.birthPlace || place;
      const newGender = member.gender?.toLowerCase() || gender;

      setName(newName);
      setDob(newDob);
      setTob(newTob);
      setPlace(newPlace);
      setGender(newGender);

      calculateChart({
        name: newName,
        dob: newDob,
        tob: newTob,
        place: newPlace,
        gender: newGender,
      });
    }
  }

  // Interpretations & Yogas derivations
  const lagnaSignName = chart?.ascendant?.sign?.name || "Aries";
  const lagnaInfo = LAGNA_EXPLANATIONS[lagnaSignName] || LAGNA_EXPLANATIONS["Aries"];

  const moonSignName = chart?.moon?.sign || "Aries";
  const moonInfo = MOON_SIGN_EXPLANATIONS[moonSignName] || MOON_SIGN_EXPLANATIONS["Aries"];

  const currentDashaName = chart?.dasha?.currentMahadasha || "Jupiter";
  const dashaKey =
    Object.keys(MAHADASHA_EXPLANATIONS).find(
      (k) => k.toLowerCase() === currentDashaName.toLowerCase()
    ) || "Jupiter";
  const dashaInfo = MAHADASHA_EXPLANATIONS[dashaKey] || MAHADASHA_EXPLANATIONS["Jupiter"];

  const detectedYogas = chart ? detectChartYogas(chart, language) : [];

  async function calculateChart(inputData) {
    setLoading(true);
    setError(null);
    try {
      let placeName = inputData.place;
      let lat = 28.6139;
      let lon = 77.2090;
      let tz = "+05:30";

      if (isCustomPlace || inputData.place === "__custom__") {
        placeName = (customPlaceName || "").trim() || "Custom Location";
        lat = parseFloat(customLat);
        lon = parseFloat(customLon);
        tz = (customTz || "+05:30").trim();
        if (isNaN(lat) || lat < -90 || lat > 90) {
          throw new Error("Please provide a valid latitude between -90° and +90°.");
        }
        if (isNaN(lon) || lon < -180 || lon > 180) {
          throw new Error("Please provide a valid longitude between -180° and +180°.");
        }
      } else {
        const matchedCity = PRESET_CITIES.find(
          (c) => c.name.toLowerCase() === inputData.place.toLowerCase()
        ) || PRESET_CITIES[0];
        placeName = matchedCity.name;
        lat = matchedCity.lat;
        lon = matchedCity.lon;
        tz = formatTzOffset(matchedCity.tz);
      }

      const res = await fetch("/api/astrology/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inputData.name || "Student",
          birthDate: inputData.dob,
          birthTime: inputData.tob,
          birthPlace: placeName,
          latitude: lat,
          longitude: lon,
          timezone: tz,
          gender: inputData.gender,
          language: "en",
          saveProfile: true,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to calculate birth chart");
      }

      setChart(json.chart);
    } catch (err) {
      console.error("Calculation error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Calculate on initial mount
  useEffect(() => {
    calculateChart({ name, dob, tob, place, gender });
  }, []);

  function handleFormSubmit(e) {
    e.preventDefault();
    calculateChart({ name, dob, tob, place, gender });
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-2 border border-amber-300">
            <Compass className="w-3.5 h-3.5 text-amber-700" />
            <span>Vedic Astrological Science</span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 font-serif">
            Astrology & Kundli Portal
          </h1>
          <p className="text-stone-600 text-sm mt-1 max-w-2xl">
            Precision ephemeris calculations, North Indian Rashi Kundli, Navagraha coordinates, and Vimshottari Dasha grounded in Maharishi Parashara's classical shastras.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200 shrink-0">
          <button
            onClick={() => setActiveTab("kundli")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "kundli"
                ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Compass className="w-4 h-4 text-amber-700" />
            <span>Kundli (Birth Chart)</span>
          </button>
          <button
            onClick={() => setActiveTab("matching")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "matching"
                ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Kundli Matching (36 गुण)</span>
          </button>
          <button
            onClick={() => setActiveTab("muhurta")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "muhurta"
                ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Clock className="w-4 h-4 text-amber-700" />
            <span>Muhurta Planner (शुभ मुहूर्त)</span>
          </button>
          <button
            onClick={() => setActiveTab("tools")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "tools"
                ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Wrench className="w-4 h-4 text-amber-700" />
            <span>Astrology Tools & Panchang</span>
          </button>
          <button
            onClick={() => setActiveTab("learning")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === "learning"
                ? "bg-white text-stone-900 shadow-xs border border-stone-200"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-800" />
            <span>Learning Center (अध्ययन केंद्र)</span>
          </button>
          <Link
            href="/astrology/daily"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer bg-amber-700 text-white hover:bg-amber-800 shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>Daily Cosmic Guide (दैनिक फल)</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: KUNDLI & EPHEMERIS */}
      {activeTab === "kundli" && (
        <div className="space-y-8">
          {/* Birth Details Input Form */}
          <div className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-800 flex items-center gap-2 font-serif">
                <span>Enter Birth Details (जन्म विवरण)</span>
              </h2>

              {familyMembers.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-stone-500 font-medium">Select Family Profile:</span>
                  <select
                    value={selectedFamilyMemberId}
                    onChange={(e) => handleSelectFamilyMember(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50/60 text-amber-900 font-semibold text-xs outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Personal Profile ({name})</option>
                    {familyMembers.map((fm) => (
                      <option key={fm.id} value={fm.id}>
                        {fm.name} ({fm.relationship})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-500 transition"
                  placeholder="e.g. Manish"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Time of Birth (24h)
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={tob}
                    onChange={(e) => setTob(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-500 transition"
                  />
                </div>
              </div>

              <div className={isCustomPlace || place === "__custom__" ? "md:col-span-2 lg:col-span-3" : ""}>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-semibold text-stone-600">
                    Place of Birth
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomPlace(!isCustomPlace);
                      if (!customPlaceName && place !== "__custom__") {
                        setCustomPlaceName(place);
                      }
                    }}
                    className="text-[10px] text-amber-600 hover:underline font-semibold cursor-pointer"
                  >
                    {isCustomPlace || place === "__custom__" ? "← Choose Presets" : "+ Any Place Worldwide"}
                  </button>
                </div>

                {!isCustomPlace && place !== "__custom__" ? (
                  <select
                    value={place}
                    onChange={(e) => {
                      if (e.target.value === "__custom__") {
                        setIsCustomPlace(true);
                        setPlace("__custom__");
                      } else {
                        const match = PRESET_CITIES.find((c) => c.name === e.target.value);
                        setPlace(e.target.value);
                        if (match) {
                          setCustomLat(match.lat.toString());
                          setCustomLon(match.lon.toString());
                          setCustomTz(formatTzOffset(match.tz));
                        }
                      }
                    }}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-500 transition"
                  >
                    <option value="__custom__">🌐 + Enter Any Custom Place in the World...</option>
                    {CITY_CATEGORIES.map((cat) => (
                      <optgroup key={cat} label={cat}>
                        {PRESET_CITIES.filter((c) => (c.category || "Other") === cat).map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                ) : (
                  <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-3 space-y-2.5">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block mb-1">
                        Place Name (City, Town, Village, Country)
                      </label>
                      <input
                        type="text"
                        required
                        value={customPlaceName}
                        onChange={(e) => setCustomPlaceName(e.target.value)}
                        placeholder="e.g. Tokyo, Japan / Ayodhya, India / Paris, France"
                        className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block mb-1">
                          Latitude (-90° to 90°)
                        </label>
                        <input
                          type="number"
                          step="any"
                          min="-90"
                          max="90"
                          required
                          value={customLat}
                          onChange={(e) => setCustomLat(e.target.value)}
                          placeholder="e.g. 35.6762"
                          className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">
                            Longitude (-180° to 180°)
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const est = estimateTzFromLongitude(customLon);
                              setCustomTz(formatTzOffset(est));
                            }}
                            className="text-[9px] text-amber-600 font-semibold hover:underline cursor-pointer"
                          >
                            Auto TZ
                          </button>
                        </div>
                        <input
                          type="number"
                          step="any"
                          min="-180"
                          max="180"
                          required
                          value={customLon}
                          onChange={(e) => {
                            const newLon = e.target.value;
                            const est = estimateTzFromLongitude(newLon);
                            setCustomLon(newLon);
                            setCustomTz(formatTzOffset(est));
                          }}
                          placeholder="e.g. 139.6503"
                          className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block mb-1">
                        Timezone Offset (UTC Offset)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select
                          value={COMMON_TIMEZONES.some((tz) => tz.value === customTz) ? customTz : "custom"}
                          onChange={(e) => {
                            if (e.target.value !== "custom") {
                              setCustomTz(e.target.value);
                            }
                          }}
                          className="w-full bg-white border border-stone-300 rounded-lg px-2 py-1.5 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500"
                        >
                          {COMMON_TIMEZONES.map((tz) => (
                            <option key={tz.value} value={tz.value}>
                              {tz.label}
                            </option>
                          ))}
                          <option value="custom">Manual entry...</option>
                        </select>
                        <input
                          type="text"
                          value={customTz}
                          onChange={(e) => setCustomTz(e.target.value)}
                          placeholder="+05:30 or +09:00"
                          className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Calculating...</span>
                  ) : (
                    <>
                      <span>Calculate Kundli</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Kundli Summary Pill Strip */}
          {chart && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-amber-50/80 rounded-2xl border border-amber-200 p-4 shadow-2xs">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                  {isHi ? "लग्न (Ascendant)" : "Ascendant (Lagna)"}
                </span>
                <div className="mt-1">
                  <span className="text-xl font-bold text-stone-900 font-serif">
                    {isHi ? chart.ascendant.sign.sanskrit : chart.ascendant.sign.name}
                  </span>
                  <span className="text-xs text-amber-800 ml-1">
                    ({isHi ? chart.ascendant.sign.name : chart.ascendant.sign.sanskrit})
                  </span>
                </div>
                <span className="text-xs text-stone-500 block mt-0.5">
                  {chart.ascendant.degreeFormatted} • {chart.ascendant.nakshatra.name} ({isHi ? `चरण ${chart.ascendant.pada}` : `Pada ${chart.ascendant.pada}`})
                </span>
              </div>

              <div className="bg-purple-50/80 rounded-2xl border border-purple-200 p-4 shadow-2xs">
                <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">
                  {isHi ? "चन्द्र राशि (Moon Sign)" : "Moon Sign (Rashi)"}
                </span>
                <div className="mt-1">
                  <span className="text-xl font-bold text-stone-900 font-serif">
                    {isHi ? `${getRashiName(chart.moon.sign, "hi")} राशि` : chart.moon.sign}
                  </span>
                  <span className="text-xs text-purple-800 ml-1">
                    ({chart.moon.nakshatra})
                  </span>
                </div>
                <span className="text-xs text-stone-500 block mt-0.5">
                  {isHi ? `चरण ${chart.moon.pada} • स्वामी: ${getPlanetName(chart.moon.signLord, "hi")}` : `Pada ${chart.moon.pada} • Lord: ${chart.moon.signLord}`}
                </span>
              </div>

              <div className="bg-orange-50/80 rounded-2xl border border-orange-200 p-4 shadow-2xs">
                <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">
                  {isHi ? "सक्रिय महादशा (Current Dasha)" : "Current Mahadasha"}
                </span>
                <div className="mt-1">
                  <span className="text-xl font-bold text-stone-900 font-serif">
                    {isHi
                      ? `${getPlanetName(chart.dasha.currentMahadasha, "hi")} महादशा`
                      : `${chart.dasha.currentMahadasha} Mahadasha`}
                  </span>
                </div>
                <span className="text-xs text-stone-500 block mt-0.5">
                  {chart.dasha.balanceText}
                </span>
              </div>

              <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 shadow-2xs">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  {isHi ? "अयनांश (लाहिड़ी)" : "Ayanamsa (Lahiri)"}
                </span>
                <div className="mt-1">
                  <span className="text-xl font-bold text-stone-900 font-serif">
                    {chart.calculation.ayanamsaValue.toFixed(4)}°
                  </span>
                </div>
                <span className="text-xs text-stone-500 block mt-0.5">
                  {isHi ? `गणना इंजन: ${chart.calculation.calculationEngine}` : `Engine: ${chart.calculation.calculationEngine}`}
                </span>
              </div>
            </div>
          )}

          {/* Language Selector Bar */}
          {chart && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-linear-to-r from-amber-50/90 via-white to-amber-50/90 p-3.5 rounded-2xl border border-amber-200/90 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-700 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Languages className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-stone-900 block font-serif">
                    {isHi ? "कुण्डली विस्तृत फलादेश भाषा (Choose Explanation Language)" : "Kundli In-Depth Explanation Language (व्याख्या भाषा)"}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    {isHi
                      ? "लग्न, चन्द्र राशि, द्वादश भाव, ग्रह फल, शुभ योग और विंशोत्तरी दशा की प्रामाणिक व्याख्या"
                      : "Authentic classical interpretations for Ascendant, Moon Sign, 12 Bhavas, Graha Phala, Yogas & Dasha"}
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center p-1 bg-stone-100/90 rounded-xl border border-stone-200 shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setLanguage("hi")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isHi
                      ? "bg-amber-700 text-white shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <span>🇮🇳 हिंदी (Hindi)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage("en")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    !isHi
                      ? "bg-amber-700 text-white shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <span>🇬🇧 English</span>
                </button>
              </div>
            </div>
          )}

          {/* Kundli Sub-Navigation Bar */}
          {chart && (
            <div className="flex flex-wrap items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
              <button
                type="button"
                onClick={() => setKundliSubView("overview")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  kundliSubView === "overview"
                    ? "bg-[#173d31] text-amber-300 shadow-sm"
                    : "text-stone-600 hover:text-stone-900 bg-white/70"
                }`}
              >
                <Compass className="w-4 h-4 text-amber-700" />
                <span>{isHi ? "लग्न व ग्रह (Overview)" : "Lagna & Planets"}</span>
              </button>

              <button
                type="button"
                onClick={() => setKundliSubView("vargas")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  kundliSubView === "vargas"
                    ? "bg-[#173d31] text-amber-300 shadow-sm"
                    : "text-stone-600 hover:text-stone-900 bg-white/70"
                }`}
              >
                <Layers className="w-4 h-4 text-amber-700" />
                <span>{isHi ? "षोडशवर्ग (16 Charts D1-D60)" : "16 Divisional Charts"}</span>
              </button>

              <button
                type="button"
                onClick={() => setKundliSubView("shadbala")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  kundliSubView === "shadbala"
                    ? "bg-[#173d31] text-amber-300 shadow-sm"
                    : "text-stone-600 hover:text-stone-900 bg-white/70"
                }`}
              >
                <Scale className="w-4 h-4 text-amber-700" />
                <span>{isHi ? "षड्बल व अष्टकवर्ग (337 Bindus)" : "Shadbala & Ashtakavarga"}</span>
              </button>

              <button
                type="button"
                onClick={() => setKundliSubView("dasha")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  kundliSubView === "dasha"
                    ? "bg-[#173d31] text-amber-300 shadow-sm"
                    : "text-stone-600 hover:text-stone-900 bg-white/70"
                }`}
              >
                <Clock className="w-4 h-4 text-amber-700" />
                <span>{isHi ? "दशा क्रम (Vimshottari 3-Tier)" : "Dasha Timeline"}</span>
              </button>

              <button
                type="button"
                onClick={() => setKundliSubView("yogas")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  kundliSubView === "yogas"
                    ? "bg-[#173d31] text-amber-300 shadow-sm"
                    : "text-stone-600 hover:text-stone-900 bg-white/70"
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>{isHi ? "शुभ योग व गोचर (Yogas & Doshas)" : "Classical Yogas & Doshas"}</span>
              </button>

              <button
                type="button"
                onClick={() => setKundliSubView("bhavas")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  kundliSubView === "bhavas"
                    ? "bg-[#173d31] text-amber-300 shadow-sm"
                    : "text-stone-600 hover:text-stone-900 bg-white/70"
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>{isHi ? "द्वादश भाव (12 Bhavas)" : "12 Bhavas Deep Dive"}</span>
              </button>

              <button
                type="button"
                onClick={() => setKundliSubView("transits")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  kundliSubView === "transits"
                    ? "bg-[#173d31] text-amber-300 shadow-sm"
                    : "text-stone-600 hover:text-stone-900 bg-white/70"
                }`}
              >
                <Orbit className="w-4 h-4 text-amber-700" />
                <span>{isHi ? "गोचर फल (Transits)" : "Predictive Transits"}</span>
              </button>

              <button
                type="button"
                onClick={() => setKundliSubView("ai")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  kundliSubView === "ai"
                    ? "bg-[#173d31] text-amber-300 shadow-sm"
                    : "text-stone-600 hover:text-stone-900 bg-white/70"
                }`}
              >
                <Bot className="w-4 h-4 text-amber-700" />
                <span>{isHi ? "ज्योतिष AI (Jyotish AI)" : "AI Jyotish Assistant"}</span>
              </button>
            </div>
          )}

          {/* Main Kundli Section: Diamond Chart + Planets Table */}
          {chart && kundliSubView === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: North Indian Kundli Chart (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-amber-700" />
                    <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                      Lagna Kundli ( लग्न कुण्डली )
                    </h3>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold uppercase">
                    {isHi ? "उत्तर भारतीय शैली" : "North Indian"}
                  </span>
                </div>

                {/* SVG Diamond Kundli */}
                <NorthIndianChart
                  chart={chart}
                  language={language}
                  onHouseClick={(h) => {
                    setLearningCategory("bhavas");
                    setLearningTarget(h);
                    setActiveTab("learning");
                  }}
                />

                <div className="text-center">
                  <span className="text-[11px] text-stone-500 bg-stone-50 border border-stone-200/80 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#c4903c]" />
                    {isHi
                      ? "विस्तृत शास्त्रीय अध्ययन के लिए कुण्डली के किसी भी भाव पर क्लिक करें"
                      : "Tip: Click any house number on the chart to open its comprehensive guide in the Learning Center"}
                  </span>
                </div>

                {/* Chart Guide */}
                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between text-[11px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
                    {isHi
                      ? `लग्न = ${chart.ascendant.sign.sanskrit} (${chart.ascendant.sign.name})`
                      : `Lagna = ${chart.ascendant.sign.name}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block" />
                    {isHi ? "(व/R) = वक्री" : "(R) = Retrograde"}
                  </span>
                  <span className="text-stone-400">
                    {isHi ? "स्थिर भाव • लाल रंग में राशि संख्या" : "Fixed Bhavas • Rashi in red"}
                  </span>
                </div>
              </div>

              {/* Right Column: Planetary Positions Table (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Orbit className="w-4 h-4 text-amber-700" />
                    <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                      Navagraha Positions (ग्रह स्थिति)
                    </h3>
                  </div>
                  <span className="text-xs text-stone-500">
                    9 Sidereal Celestial Coordinates
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                        <th className="py-2.5 pr-2">{isHi ? "ग्रह (Planet)" : "Planet"}</th>
                        <th className="py-2.5 px-2">{isHi ? "राशि (Sign)" : "Rashi (Sign)"}</th>
                        <th className="py-2.5 px-2">{isHi ? "स्पष्ट रेखांश" : "Longitude"}</th>
                        <th className="py-2.5 px-2">{isHi ? "भाव" : "Bhava"}</th>
                        <th className="py-2.5 px-2">{isHi ? "नक्षत्र" : "Nakshatra"}</th>
                        <th className="py-2.5 px-2">{isHi ? "गति / स्थिति" : "Status"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                      {/* Ascendant row */}
                      <tr className="bg-amber-50/50">
                        <td className="py-2.5 pr-2 font-bold text-amber-950 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-600" />
                          <span>{isHi ? "लग्न (Lagna)" : "Lagna"}</span>
                        </td>
                        <td className="py-2.5 px-2 font-semibold">
                          {isHi ? `${chart.ascendant.sign.sanskrit} (${chart.ascendant.sign.name})` : chart.ascendant.sign.name}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-stone-600">
                          {chart.ascendant.degreeFormatted}
                        </td>
                        <td className="py-2.5 px-2 font-bold text-stone-900">
                          {isHi ? "प्रथम भाव (1st)" : "1st"}
                        </td>
                        <td className="py-2.5 px-2 text-stone-600">
                          {chart.ascendant.nakshatra.name} ({isHi ? `चरण ${chart.ascendant.pada}` : `Pada ${chart.ascendant.pada}`})
                        </td>
                        <td className="py-2.5 px-2">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-900 font-bold">
                            {isHi ? "उदय लग्न" : "Ascendant"}
                          </span>
                        </td>
                      </tr>

                      {/* 9 Planets */}
                      {chart.planets.map((p) => (
                        <tr key={p.planet} className="hover:bg-stone-50/80 transition">
                          <td className="py-2.5 pr-2 font-bold text-stone-900">
                            <button
                              onClick={() => {
                                setLearningCategory("grahas");
                                setLearningTarget(p.planet.toLowerCase());
                                setActiveTab("learning");
                              }}
                              className="text-left font-bold text-stone-900 hover:text-emerald-800 hover:underline cursor-pointer flex items-center gap-1"
                              title="View classical planet guide"
                            >
                              <span>{isHi ? getPlanetName(p.planet, "hi") : p.planet}</span>
                              <BookOpen className="w-3 h-3 text-stone-400 opacity-60 inline" />
                            </button>
                          </td>
                          <td className="py-2.5 px-2">
                            <span className="font-semibold text-stone-900">
                              {isHi ? `${getRashiName(p.sign, "hi")} (${p.sign})` : p.sign}
                            </span>
                            <span className="text-[10px] text-stone-400 block font-normal">
                              {isHi ? `स्वामी: ${getPlanetName(p.signLord, "hi")}` : `Lord: ${p.signLord}`}
                            </span>
                          </td>
                          <td className="py-2.5 px-2 font-mono text-stone-600">
                            {p.degreeFormatted}
                          </td>
                          <td className="py-2.5 px-2 font-bold text-amber-800">
                            <button
                              onClick={() => {
                                setLearningCategory("bhavas");
                                setLearningTarget(p.house);
                                setActiveTab("learning");
                              }}
                              className="text-amber-800 hover:text-emerald-800 hover:underline cursor-pointer"
                              title="View classical house guide"
                            >
                              {p.house}{isHi ? "वां भाव" : "th House"}
                            </button>
                          </td>
                          <td className="py-2.5 px-2">
                            <span>{p.nakshatra}</span>
                            <span className="text-[10px] text-stone-400 ml-1">
                              ({isHi ? `चरण ${p.pada}` : `Pada ${p.pada}`})
                            </span>
                          </td>
                          <td className="py-2.5 px-2">
                            {p.retrograde ? (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-bold">
                                {isHi ? "वक्री (R)" : "Vakri (R)"}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                                {isHi ? "मार्गी" : "Direct"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* AI Assistant consultation Banner */}
                <div className="mt-4 pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-linear-to-r from-amber-50 via-white to-amber-50 p-4 rounded-xl border border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-900">
                        Deep Vedic Chart Analysis with Gurukul AI
                      </h4>
                      <p className="text-[11px] text-stone-500">
                        Get authentic scriptural insights grounded in Parashara Hora & Phaladeepika.
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/ai/chat?prompt=${encodeURIComponent(
                      `Please analyze my Vedic birth chart with Lagna in ${chart.ascendant.sign.name} and Moon in ${chart.moon.sign}. What are the primary yogas and career indications?`
                    )}`}
                    className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-xs transition shrink-0 flex items-center gap-1.5"
                  >
                    <span>Consult AI Assistant</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Section 1: Lagna & Moon Sign Comprehensive Life & Mind Analysis */}
          {chart && kundliSubView === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lagna (Ascendant) Card */}
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-700" />
                    <h3 className="font-serif font-bold text-stone-900 text-base">
                      {isHi ? "लग्न विवेचना (Ascendant & Life Path)" : "Ascendant (Lagna) Life Path & Temperament"}
                    </h3>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold uppercase">
                    {isHi ? lagnaInfo.elementHi : lagnaInfo.elementEn}
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <h4 className="text-base font-bold text-stone-900 font-serif">
                      {isHi ? lagnaInfo.nameHi : lagnaInfo.nameEn}
                    </h4>
                    <span className="text-xs text-amber-800 font-semibold">
                      {isHi ? `स्वामी: ${lagnaInfo.lordHi}` : `Lord: ${lagnaInfo.lordEn}`}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed mt-2">
                    {isHi ? lagnaInfo.overviewHi : lagnaInfo.overviewEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                    {isHi ? "प्रमुख स्वभाव लक्षण (Core Traits)" : "Core Personality Traits"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(isHi ? lagnaInfo.traitsHi : lagnaInfo.traitsEn).map((trait, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-[11px] bg-stone-100 text-stone-700 font-medium border border-stone-200/80"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80">
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-1">
                    {isHi ? "अनुकूल कार्यक्षेत्र एवं आजीविका (Career Calling)" : "Career Calling & Suited Professions"}
                  </span>
                  <p className="text-xs text-stone-700">
                    {isHi ? lagnaInfo.careerHi : lagnaInfo.careerEn}
                  </p>
                </div>
              </div>

              {/* Moon Sign (Chandra Rashi) Card */}
              <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-purple-700" />
                    <h3 className="font-serif font-bold text-stone-900 text-base">
                      {isHi ? "चन्द्र राशि एवं मानसिक स्वभाव (Moon Sign & Mind)" : "Moon Sign (Chandra Rashi) Emotional Nature"}
                    </h3>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-bold uppercase">
                    {chart.moon.nakshatra} (Pada {chart.moon.pada})
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <h4 className="text-base font-bold text-stone-900 font-serif">
                      {isHi ? moonInfo.nameHi : moonInfo.nameEn}
                    </h4>
                    <span className="text-xs text-purple-800 font-semibold">
                      {isHi ? `राशि स्वामी: ${chart.moon.signLord}` : `Sign Lord: ${chart.moon.signLord}`}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed mt-2">
                    {isHi ? moonInfo.mindHi : moonInfo.mindEn}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80">
                  <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block mb-1">
                    {isHi ? "भावनात्मक प्रकृति एवं अंतर्मन (Inner Emotional Nature)" : "Inner Emotional Nature & Temperament"}
                  </span>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    {isHi ? moonInfo.natureHi : moonInfo.natureEn}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                    {isHi ? "संबंध एवं आत्मिक संतुलन (Relationships & Harmony)" : "Relationships & Spiritual Balance"}
                  </span>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    {isHi ? moonInfo.relationshipsHi : moonInfo.relationshipsEn}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SubView: 16 Divisional Charts (Shodashavarga D1-D60) */}
          {chart && kundliSubView === "vargas" && (
            <DivisionalChartsView
              chart={chart}
              language={language}
              onPlanetClick={(p) => {
                setLearningCategory("grahas");
                setLearningTarget(p);
                setActiveTab("learning");
              }}
            />
          )}

          {/* SubView: 6-fold Shadbala & Ashtakavarga 337 Bindus */}
          {chart && kundliSubView === "shadbala" && (
            <ShadbalaAshtakavargaView chart={chart} language={language} />
          )}

          {/* SubView: 3-Tier Vimshottari Dasha Timeline */}
          {chart && kundliSubView === "dasha" && (
            <DashaTimelineView chart={chart} language={language} />
          )}

          {/* SubView: Verified Classical Yogas & Doshas */}
          {chart && kundliSubView === "yogas" && (
            <YogasAndDoshasView chart={chart} language={language} />
          )}

          {/* SubView: Predictive Transit Intelligence (Gochara) */}
          {chart && kundliSubView === "transits" && (
            <TransitIntelligenceView chart={chart} language={language} />
          )}

          {/* SubView: Personal AI Jyotish Assistant */}
          {chart && kundliSubView === "ai" && (
            <PersonalJyotishAssistant chart={chart} language={language} />
          )}

          {/* Section 3: 12 Bhavas & Deep Resident Planet Interpretations */}
          {chart && kundliSubView === "bhavas" && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
              <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-stone-900 text-base">
                    {isHi ? "द्वादश भाव एवं ग्रह फल विचार (12 Bhavas & Graha Phala)" : "The 12 Bhavas & House Interpretations"}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {isHi
                      ? "प्रत्येक भाव का शास्त्रीय महत्व एवं उसमें स्थित ग्रहों का विस्तृत प्रभाव।"
                      : "Detailed house significations, sign rulership, and classical resident planetary impacts."}
                  </p>
                </div>
                <span className="text-xs text-stone-500 font-medium">
                  {chart.ascendant.sign.name} Lagna
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                {chart.houses.map((h) => {
                  const isKendra = [1, 4, 7, 10].includes(h.house);
                  const isTrikona = [1, 5, 9].includes(h.house);
                  const bhavaData = BHAVA_SIGNIFICATIONS[h.house] || {};
                  const houseTitle = isHi
                    ? bhavaData.titleHi || `${h.house}वां भाव`
                    : bhavaData.titleEn || `${h.house}th House`;
                  const houseDesc = isHi
                    ? bhavaData.descHi || h.signification
                    : bhavaData.descEn || h.signification;

                  return (
                    <div
                      key={h.house}
                      className="p-4 rounded-xl border border-stone-200 bg-stone-50/40 hover:bg-white hover:border-amber-300 transition space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-900 font-serif">
                            {houseTitle}
                          </span>
                          <div className="flex items-center gap-1">
                            {isTrikona && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold uppercase">
                                Trikona
                              </span>
                            )}
                            {!isTrikona && isKendra && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 font-bold uppercase">
                                Kendra
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-xs text-stone-700">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-stone-800">
                            <span>{isHi ? `राशि: ${getRashiName(h.sign, "hi")} (${h.sign})` : `Sign: ${h.sign}`}</span>
                            <span className="text-amber-800">
                              {isHi ? `स्वामी: ${getPlanetName(h.signLord || h.lord, "hi")}` : `Lord: ${h.signLord || h.lord}`}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
                            {houseDesc}
                          </p>
                        </div>
                      </div>

                      {/* Resident Planets & In-Depth Phala */}
                      <div className="pt-2.5 border-t border-stone-200/60 space-y-2">
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                          {isHi ? "भाव में स्थित ग्रह एवं फल:" : "Resident Planets & Impact:"}
                        </span>

                        {h.planets && h.planets.length > 0 ? (
                          <div className="space-y-2">
                            {h.planets.map((p, idx) => {
                              const pName = typeof p === "string" ? p : p.name || p.planet;
                              const isRetro = typeof p === "object" && p.retrograde;
                              const pDegree =
                                typeof p === "object" && typeof p.degree === "number"
                                  ? Math.floor(p.degree)
                                  : null;
                              const interpretation = getPlanetHouseInterpretation(
                                pName,
                                h.house,
                                h.sign,
                                isRetro,
                                language
                              );

                              return (
                                <div
                                  key={idx}
                                  className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/70 text-xs space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-amber-950 flex items-center gap-1">
                                      <span>{isHi ? getPlanetName(pName, "hi") : pName}</span>
                                      {pDegree !== null && (
                                        <span className="text-[10px] text-amber-800 font-normal">
                                          ({pDegree}°)
                                        </span>
                                      )}
                                    </span>
                                    {isRetro && (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold">
                                        {isHi ? "वक्री (R)" : "Retro (R)"}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-stone-700 leading-relaxed">
                                    {interpretation}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[11px] text-stone-400 italic">
                            {isHi
                              ? `कोई ग्रह स्थित नहीं। इस भाव का फल भावेश ${getPlanetName(h.signLord || h.lord, "hi")} के आधीन है।`
                              : `No resident planets. Significations directed by lord ${h.signLord || h.lord}.`}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

                  </div>
      )}

      {/* TAB: KUNDLI MATCHING (ASHTAKOOTA 36 GUNAS) */}
      {activeTab === "matching" && (
        <KundliMatchingView
          chart={chart}
          familyMembers={familyMembers}
          language={language}
        />
      )}

      {/* TAB: ADVANCED MUHURTA PLANNER */}
      {activeTab === "muhurta" && (
        <MuhurtaPlannerView language={language} />
      )}

      {/* TAB 2: ASTROLOGY TOOLS & PANCHANG */}
      {activeTab === "tools" && (
        <div className="space-y-8">
          {/* Panchang Live Tool */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-stone-900 font-serif">
                  Today's Daily Vedic Panchang (पञ्चाङ्गम्)
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Five sacred limbs of time calculated for the current solar day.
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-900">
                Live Daily Calculation
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
                <Clock className="w-5 h-5 text-amber-700 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-amber-900 uppercase">Tithi</span>
                <span className="text-sm font-bold text-stone-900 block mt-1">Shukla Ashtami</span>
                <span className="text-[10px] text-stone-500">Till 14:32 IST</span>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-center">
                <Star className="w-5 h-5 text-purple-700 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-purple-900 uppercase">Nakshatra</span>
                <span className="text-sm font-bold text-stone-900 block mt-1">Rohini</span>
                <span className="text-[10px] text-stone-500">Moon in Taurus</span>
              </div>

              <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 text-center">
                <Flame className="w-5 h-5 text-orange-700 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-orange-900 uppercase">Yoga</span>
                <span className="text-sm font-bold text-stone-900 block mt-1">Siddhi</span>
                <span className="text-[10px] text-stone-500">Auspicious</span>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-center">
                <Scale className="w-5 h-5 text-blue-700 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-blue-900 uppercase">Karana</span>
                <span className="text-sm font-bold text-stone-900 block mt-1">Bava</span>
                <span className="text-[10px] text-stone-500">Followed by Balava</span>
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-center">
                <Sunrise className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-amber-900 uppercase">Sunrise</span>
                <span className="text-sm font-bold text-stone-900 block mt-1">06:11 AM</span>
                <span className="text-[10px] text-stone-500">Local Solar Dawn</span>
              </div>

              <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-center">
                <Sunset className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                <span className="text-[10px] font-bold text-rose-900 uppercase">Sunset</span>
                <span className="text-sm font-bold text-stone-900 block mt-1">05:48 PM</span>
                <span className="text-[10px] text-stone-500">Dusk / Sandhya</span>
              </div>
            </div>
          </div>

          {/* Planetary Transits (Gochar) Tool */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-base">
                  Major Planetary Transits (गोचर स्थिति)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Current positions of the slower-moving outer planets according to Lahiri Sidereal Ephemeris.
                </p>
              </div>
              <span className="text-xs text-stone-500">Real-Time Astrometric Calculation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-amber-200 bg-linear-to-br from-amber-50/60 to-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-stone-900 text-sm">Jupiter (Guru)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">
                    Direct
                  </span>
                </div>
                <p className="text-xs text-stone-700 font-medium">Transiting in Taurus (Vrishabha)</p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Aspecting 9th and 5th houses, conferring wisdom, educational luck, and spiritual growth.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-stone-200 bg-linear-to-br from-stone-50 to-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-stone-900 text-sm">Saturn (Shani)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
                    Own Sign
                  </span>
                </div>
                <p className="text-xs text-stone-700 font-medium">Transiting in Aquarius (Kumbha)</p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Moolatrikona placement instilling karmic discipline, patience, and enduring restructuring.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-indigo-200 bg-linear-to-br from-indigo-50/50 to-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-stone-900 text-sm">Rahu (North Node)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-bold">
                    Retrograde
                  </span>
                </div>
                <p className="text-xs text-stone-700 font-medium">Transiting in Pisces (Meena)</p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Stimulates spiritual seeking, foreign voyages, and psychic sensitivities.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-rose-200 bg-linear-to-br from-rose-50/50 to-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-stone-900 text-sm">Ketu (South Node)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-rose-100 text-rose-800 font-bold">
                    Retrograde
                  </span>
                </div>
                <p className="text-xs text-stone-700 font-medium">Transiting in Virgo (Kanya)</p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Cultivates detachment from perfectionism and enhances inward meditative focus.
                </p>
              </div>
            </div>
          </div>

          {/* Classical Vedic Remedies (Upayas) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
            <div className="border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-stone-900 text-base">
                Classical Astrological Remedies (शान्ति उपायाः)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Authentic scriptural remedies derived from Maharishi Parashara's Brihat Parashara Hora Shastra.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center text-xs font-bold font-serif">
                    म
                  </span>
                  <h4 className="text-xs font-bold text-stone-900">Mantra Japa (मन्त्र जप)</h4>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Regular recitation of Navagraha Stotram, Gayatri Mantra, and the Vedic seed mantra corresponding to the debilitated or afflicted Graha lord.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-200 text-emerald-900 flex items-center justify-center text-xs font-bold font-serif">
                    द
                  </span>
                  <h4 className="text-xs font-bold text-stone-900">Dana & Seva (दान एवं सेवा)</h4>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Selfless charity of grains, cow care (Go-seva), and clothing on days ruled by difficult planetary transits (e.g. black sesame seeds on Saturday).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-200 text-purple-900 flex items-center justify-center text-xs font-bold font-serif">
                    र
                  </span>
                  <h4 className="text-xs font-bold text-stone-900">Ratna & Dhyana (रत्न एवं ध्यान)</h4>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Wearing prescribed gemstones for beneficial functional rulers (Kendra and Trikona lords only), combined with daily yogic meditation and pranayama.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VEDIC ASTROLOGY LEARNING CENTER */}
      {activeTab === "learning" && (
        <HoroscopeLearningPortal
          initialCategory={learningCategory}
          initialTarget={learningTarget}
        />
      )}
    </div>
  );
}
