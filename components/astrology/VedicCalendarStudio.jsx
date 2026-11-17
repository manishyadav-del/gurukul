"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  Clock,
  Heart,
  Bookmark,
  BookOpen,
  Share2,
  Bell,
  CheckCircle2,
  Check,
  AlertCircle,
  HelpCircle,
  X,
  Languages,
  Flame,
  ShieldCheck,
  Info,
  ExternalLink,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import { WORLD_CITIES, formatTzOffset, estimateTzFromLongitude } from "./worldLocations";

const PRESET_CITIES = WORLD_CITIES;

const CATEGORY_COLORS = {
  FESTIVAL: "bg-amber-100 text-amber-900 border-amber-300",
  VRATA: "bg-emerald-100 text-emerald-900 border-emerald-300",
  JAYANTI: "bg-purple-100 text-purple-900 border-purple-300",
  SANKRANTI: "bg-orange-100 text-orange-900 border-orange-300",
  REGIONAL: "bg-blue-100 text-blue-900 border-blue-300",
};

export default function VedicCalendarStudio({ initialTab = "calendar" }) {
  const [selectedTab, setSelectedTab] = useState(initialTab); // "calendar" | "upcoming" | "vrata" | "saved"
  const [language, setLanguage] = useState("en"); // "en" | "hi"
  const [tradition, setTradition] = useState("ALL"); // "ALL" | "PURNIMANTA" | "AMANTA"
  const isHi = language === "hi";

  // Location State
  const [selectedCity, setSelectedCity] = useState(PRESET_CITIES[0]); // Varanasi default
  const [showCustomCityModal, setShowCustomCityModal] = useState(false);
  const [customCityForm, setCustomCityForm] = useState({
    name: "Custom Location",
    lat: "28.6139",
    lon: "77.2090",
    tz: "5.5",
    tzStr: "Asia/Kolkata",
  });

  // Date State
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth() + 1); // 1-12

  // API Data State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthData, setMonthData] = useState(null);
  const [upcomingData, setUpcomingData] = useState([]);
  const [vrataData, setVrataData] = useState([]);

  // Filter & Search
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal / Detail State
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedFestival, setSelectedFestival] = useState(null);
  const [festivalDetailLoading, setFestivalDetailLoading] = useState(false);
  const [reminderMsg, setReminderMsg] = useState("");

  // User Preferences
  const [userPreferences, setUserPreferences] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // 1. Fetch Month Data
  const fetchMonthCalendar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `/api/astrology/calendar/month?year=${currentYear}&month=${currentMonth}&lat=${selectedCity.lat}&lon=${selectedCity.lon}&tz=${selectedCity.tz}&tzStr=${encodeURIComponent(selectedCity.tzStr || "Asia/Kolkata")}&tradition=${tradition}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to load calendar");
      setMonthData(data.calendar);
    } catch (err) {
      console.error("Calendar fetch error:", err);
      setError(err.message || "Failed to load calendar");
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentMonth, selectedCity, tradition]);

  // 2. Fetch Upcoming Festivals
  const fetchUpcoming = useCallback(async () => {
    try {
      const url = `/api/astrology/calendar/upcoming?limit=15&lat=${selectedCity.lat}&lon=${selectedCity.lon}&tz=${selectedCity.tz}&category=${categoryFilter}&tradition=${tradition}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setUpcomingData(data.upcoming || []);
      }
    } catch (err) {
      console.error("Upcoming fetch error:", err);
    }
  }, [selectedCity, categoryFilter, tradition]);

  // 3. Fetch Vrata Schedule
  const fetchVrata = useCallback(async () => {
    try {
      const url = `/api/astrology/calendar/vrata?year=${currentYear}&month=${currentMonth}&lat=${selectedCity.lat}&lon=${selectedCity.lon}&tz=${selectedCity.tz}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setVrataData(data.vrats || []);
      }
    } catch (err) {
      console.error("Vrata fetch error:", err);
    }
  }, [currentYear, currentMonth, selectedCity]);

  // 4. Fetch User Preferences
  const fetchPreferences = useCallback(async () => {
    try {
      const res = await fetch("/api/astrology/calendar/preferences");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUserPreferences(data.preferences || []);
        }
      }
    } catch {
      // Ignored for unauthenticated guests
    }
  }, []);

  useEffect(() => {
    fetchMonthCalendar();
    fetchUpcoming();
    fetchVrata();
    fetchPreferences();
  }, [fetchMonthCalendar, fetchUpcoming, fetchVrata, fetchPreferences]);

  // Open Festival Detail Modal
  const openFestivalDetail = async (slug) => {
    try {
      setFestivalDetailLoading(true);
      setSelectedFestival(null);
      const res = await fetch(`/api/astrology/calendar/festivals/${slug}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setSelectedFestival(data.festival);
        // Check if favorite/followed
        const pref = userPreferences.find(
          (p) => p.festival?.slug === slug || p.festivalId === data.festival.id
        );
        setIsFavorite(!!pref?.isFavorite);
        setIsFollowing(!!pref?.isFollowingVrat);
      }
    } catch (err) {
      console.error("Festival detail error:", err);
    } finally {
      setFestivalDetailLoading(false);
    }
  };

  // Toggle Favorite
  const toggleFavorite = async (festival) => {
    try {
      const nextFav = !isFavorite;
      setIsFavorite(nextFav);
      const res = await fetch("/api/astrology/calendar/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          festivalSlug: festival.slug,
          isFavorite: nextFav,
        }),
      });
      if (res.ok) {
        fetchPreferences();
      }
    } catch (err) {
      console.error("Toggle favorite error:", err);
    }
  };

  // Toggle Follow Vrat
  const toggleFollowVrat = async (festival) => {
    try {
      const nextFollow = !isFollowing;
      setIsFollowing(nextFollow);
      const res = await fetch("/api/astrology/calendar/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          festivalSlug: festival.slug,
          isFollowingVrat: nextFollow,
        }),
      });
      if (res.ok) {
        fetchPreferences();
      }
    } catch (err) {
      console.error("Toggle follow error:", err);
    }
  };

  // Schedule Observance Reminder
  const scheduleReminder = async (festival, eventDate) => {
    try {
      setReminderMsg("Scheduling reminder...");
      const res = await fetch("/api/astrology/calendar/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          festivalSlug: festival.slug,
          eventDate: eventDate || new Date().toISOString().split("T")[0],
          reminderType: festival.category === "VRATA" ? "VRAT_START" : "FESTIVAL_DAY",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReminderMsg("Reminder set successfully!");
        setTimeout(() => setReminderMsg(""), 3500);
      } else {
        setReminderMsg(data.error || "Please sign in to schedule reminders");
        setTimeout(() => setReminderMsg(""), 3500);
      }
    } catch {
      setReminderMsg("Failed to schedule reminder");
      setTimeout(() => setReminderMsg(""), 3500);
    }
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const monthNamesHi = [
    "जनवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून",
    "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="bg-white rounded-3xl border border-[#ede5d6] p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#ede5d6] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c4903c]">
                {isHi ? "वैदिक पर्व व व्रत पंचांग" : "Vedic Festival & Vrata Calendar"}
              </span>
              <span className="text-xs text-stone-300">•</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Panchang Verified</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
              {isHi ? "हिंदू पर्व, व्रत एवं उत्सव कैलेंडर" : "Vedic Observance & Festival Calendar"}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              {isHi
                ? "स्थान-सटीक पंचांग, एकादशी, प्रदोष, संक्रांति, पूर्णिमा एवं शास्त्रीय प्रमाण युक्त पर्व विवरणी"
                : "Astronomically computed Hindu festivals, Ekadashi, Pradosha, Parana timings, and classical shastric references"}
            </p>
          </div>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Location Selector */}
            <div className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#faf7f0] border border-[#ede5d6] text-xs font-medium text-stone-700 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-[#c4903c]" />
              <select
                value={PRESET_CITIES.some((c) => c.name === selectedCity.name) ? selectedCity.name : "__custom__"}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setShowCustomCityModal(true);
                  } else {
                    const found = PRESET_CITIES.find((c) => c.name === e.target.value);
                    if (found) setSelectedCity(found);
                  }
                }}
                className="bg-transparent text-xs text-stone-900 focus:outline-none cursor-pointer font-medium"
              >
                <optgroup label="Sacred India">
                  {PRESET_CITIES.filter((c) => c.category === "Sacred India").map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </optgroup>
                <optgroup label="India">
                  {PRESET_CITIES.filter((c) => c.category === "India").map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Global Cities">
                  {PRESET_CITIES.filter((c) => c.category !== "Sacred India" && c.category !== "India").map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </optgroup>
                <option value="__custom__">+ Custom Coordinates...</option>
              </select>
            </div>

            {/* Tradition Selector */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#faf7f0] border border-[#ede5d6] text-xs font-medium text-stone-700 shadow-2xs">
              <span className="text-[11px] text-stone-400 font-semibold">{isHi ? "परंपरा:" : "Tradition:"}</span>
              <select
                value={tradition}
                onChange={(e) => setTradition(e.target.value)}
                className="bg-transparent text-xs text-stone-900 focus:outline-none cursor-pointer font-medium"
              >
                <option value="ALL">{isHi ? "सभी परंपराएं (All)" : "All Traditions"}</option>
                <option value="PURNIMANTA">{isHi ? "पूर्णिमांत (उत्तर भारत)" : "Purnimanta (North India)"}</option>
                <option value="AMANTA">{isHi ? "अमांत (दक्षिण व पश्चिम भारत)" : "Amanta (South & West India)"}</option>
              </select>
            </div>

            {/* Language Toggle */}
            <button
              type="button"
              onClick={() => setLanguage((l) => (l === "en" ? "hi" : "en"))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#ede5d6] text-xs font-bold text-stone-700 hover:bg-[#faf7f0] shadow-2xs transition cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-[#c4903c]" />
              <span>{isHi ? "English" : "हिंदी"}</span>
            </button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="inline-flex p-1 rounded-2xl bg-[#f4ece1] border border-[#ede2d0] text-xs font-medium">
            <button
              type="button"
              onClick={() => setSelectedTab("calendar")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer ${
                selectedTab === "calendar"
                  ? "bg-[#13382c] text-white shadow-xs font-semibold"
                  : "text-stone-700 hover:text-stone-900"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>{isHi ? "मासिक पंचांग कैलेंडर" : "Monthly Calendar"}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab("upcoming")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer ${
                selectedTab === "upcoming"
                  ? "bg-[#13382c] text-white shadow-xs font-semibold"
                  : "text-stone-700 hover:text-stone-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>{isHi ? "आगामी पर्व सूची" : "Upcoming Festivals"}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab("vrata")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer ${
                selectedTab === "vrata"
                  ? "bg-[#13382c] text-white shadow-xs font-semibold"
                  : "text-stone-700 hover:text-stone-900"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>{isHi ? "एकादशी व व्रत योजना" : "Ekadashi & Vrata Planner"}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab("saved")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer ${
                selectedTab === "saved"
                  ? "bg-[#13382c] text-white shadow-xs font-semibold"
                  : "text-stone-700 hover:text-stone-900"
              }`}
            >
              <Heart className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>{isHi ? "मेरे सुरक्षित पर्व व व्रत" : "My Saved Observances"}</span>
            </button>
          </div>

          {/* Month Navigator Controls */}
          {selectedTab === "calendar" && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-white border border-[#ede5d6] text-stone-600 hover:bg-[#faf7f0] shadow-2xs transition cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-4 py-1.5 rounded-xl bg-white border border-[#ede5d6] text-xs font-bold text-stone-900 shadow-2xs font-serif min-w-[140px] text-center">
                {isHi ? monthNamesHi[currentMonth - 1] : monthNames[currentMonth - 1]} {currentYear}
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-white border border-[#ede5d6] text-stone-600 hover:bg-[#faf7f0] shadow-2xs transition cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Custom Location Modal */}
      {showCustomCityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-[#ede5d6] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ede5d6] pb-3">
              <h3 className="text-sm font-bold text-stone-900 font-serif">
                {isHi ? "कस्टम स्थान समन्वय दर्ज करें" : "Enter Custom Coordinates"}
              </h3>
              <button
                type="button"
                onClick={() => setShowCustomCityModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Place Name</label>
                <input
                  type="text"
                  value={customCityForm.name}
                  onChange={(e) => setCustomCityForm({ ...customCityForm, name: e.target.value })}
                  className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={customCityForm.lat}
                    onChange={(e) => setCustomCityForm({ ...customCityForm, lat: e.target.value })}
                    className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={customCityForm.lon}
                    onChange={(e) => setCustomCityForm({ ...customCityForm, lon: e.target.value })}
                    className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">Timezone Offset (Hours from UTC)</label>
                <input
                  type="number"
                  step="0.5"
                  value={customCityForm.tz}
                  onChange={(e) => setCustomCityForm({ ...customCityForm, tz: e.target.value })}
                  className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCustomCityModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCity({
                    name: customCityForm.name || "Custom Place",
                    lat: parseFloat(customCityForm.lat),
                    lon: parseFloat(customCityForm.lon),
                    tz: parseFloat(customCityForm.tz),
                    tzStr: `UTC${formatTzOffset(parseFloat(customCityForm.tz))}`,
                    category: "Custom",
                  });
                  setShowCustomCityModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#13382c] text-white text-xs font-semibold shadow-xs"
              >
                Apply Location
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Views */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-[#ede5d6] p-12 text-center text-stone-500 text-sm flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#c4903c]" />
          <span>{isHi ? "वैदिक कैलेंडर खगोलीय गणना जारी है..." : "Computing Vedic festival & astronomical alignments..."}</span>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-3xl p-6 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      ) : (
        <>
          {/* TAB 1: Monthly Calendar Grid */}
          {selectedTab === "calendar" && monthData && (
            <div className="bg-white rounded-3xl border border-[#ede5d6] p-5 sm:p-7 shadow-xs space-y-4">
              {/* Day-of-week header */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-stone-500 uppercase tracking-wider border-b border-[#ede5d6] pb-2">
                <div>Sun (रवि)</div>
                <div>Mon (सोम)</div>
                <div>Tue (मंगल)</div>
                <div>Wed (बुध)</div>
                <div>Thu (गुरु)</div>
                <div>Fri (शुक्र)</div>
                <div>Sat (शनि)</div>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-2 sm:gap-3">
                {monthData.calendarDays.map((day) => {
                  const hasFestival = day.festivals && day.festivals.length > 0;
                  const isToday = day.date === new Date().toISOString().split("T")[0];

                  return (
                    <div
                      key={day.date}
                      onClick={() => setSelectedDay(day)}
                      className={`min-h-[110px] sm:min-h-[130px] p-2 sm:p-2.5 rounded-2xl border transition flex flex-col justify-between cursor-pointer relative group ${
                        isToday
                          ? "bg-[#faf5eb] border-[#c4903c] ring-2 ring-[#c4903c]/20"
                          : hasFestival
                          ? "bg-amber-50/40 border-amber-200 hover:bg-amber-50/80"
                          : "bg-white border-[#f0e8dc] hover:bg-[#faf7f0]"
                      }`}
                    >
                      {/* Top Row: Day number & Tithi */}
                      <div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs sm:text-sm font-bold font-serif ${
                              isToday
                                ? "w-6 h-6 rounded-full bg-[#13382c] text-white flex items-center justify-center text-xs"
                                : "text-stone-900"
                            }`}
                          >
                            {day.dayNumber}
                          </span>
                          <span className="text-xs font-semibold text-stone-700 truncate max-w-[70px] text-right">
                            {isHi ? day.panchang.tithi.devanagari : day.panchang.tithi.name}
                          </span>
                        </div>

                        {/* Nakshatra & Month Paksha Subtext */}
                        <div className="text-xs text-stone-600 font-medium mt-0.5 truncate">
                          {day.panchang.nakshatra.name} • {day.panchang.tithi.paksha[0]}
                        </div>
                      </div>

                      {/* Middle: Festival Badges */}
                      <div className="my-1 space-y-1">
                        {hasFestival &&
                          day.festivals.slice(0, 2).map((f) => (
                            <div
                              key={f.slug}
                              onClick={(e) => {
                                e.stopPropagation();
                                openFestivalDetail(f.slug);
                              }}
                              className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#13382c] text-white truncate hover:bg-[#1a4a3b] transition"
                              title={f.name}
                            >
                              {isHi && f.nameHi ? f.nameHi : f.name}
                            </div>
                          ))}

                        {hasFestival && day.festivals.length > 2 && (
                          <div className="text-xs font-bold text-[#9a5a1f] px-1">
                            +{day.festivals.length - 2} more...
                          </div>
                        )}
                      </div>

                      {/* Bottom Row: Flags (Ekadashi, Pradosh, Purnima) */}
                      <div className="flex items-center gap-1 text-xs pt-1 border-t border-stone-100 flex-wrap">
                        {day.flags.isEkadashi && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                            {isHi ? "एकादशी" : "Ekadashi"}
                          </span>
                        )}
                        {day.flags.isPradosh && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300">
                            {isHi ? "प्रदोष" : "Pradosh"}
                          </span>
                        )}
                        {day.flags.isPurnima && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                            {isHi ? "पूर्णिमा" : "Purnima"}
                          </span>
                        )}
                        {day.flags.isAmavasya && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-900 border border-stone-300">
                            {isHi ? "अमावस्या" : "Amavasya"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Upcoming Festivals List */}
          {selectedTab === "upcoming" && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2">
                {["ALL", "FESTIVAL", "VRATA", "JAYANTI", "SANKRANTI"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      categoryFilter === cat
                        ? "bg-[#13382c] text-white shadow-2xs"
                        : "bg-white border border-[#ede5d6] text-stone-700 hover:bg-[#faf7f0]"
                    }`}
                  >
                    {cat === "ALL" ? (isHi ? "सभी श्रेणियां" : "All Categories") : cat}
                  </button>
                ))}
              </div>

              {/* Upcoming Festival Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingData.map((f) => (
                  <div
                    key={`${f.slug}-${f.date}`}
                    onClick={() => openFestivalDetail(f.slug)}
                    className="bg-white rounded-2xl border border-[#ede5d6] p-5 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-4 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                            CATEGORY_COLORS[f.category] || "bg-stone-100 text-stone-800 border-stone-200"
                          }`}
                        >
                          {f.category}
                        </span>
                        <span className="text-xs font-bold text-[#c4903c] bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                          {f.daysAway === 0
                            ? isHi ? "आज (Today)" : "Today"
                            : f.daysAway === 1
                            ? isHi ? "कल (Tomorrow)" : "Tomorrow"
                            : isHi ? `${f.daysAway} दिन शेष` : `in ${f.daysAway} days`}
                        </span>
                      </div>

                      <h3 className="text-base font-bold font-serif text-stone-900 group-hover:text-[#13382c] transition">
                        {isHi && f.nameHi ? f.nameHi : f.name}
                      </h3>
                      {f.nameSanskrit && (
                        <p className="text-[11px] text-[#c4903c] font-serif italic mt-0.5">
                          {f.nameSanskrit}
                        </p>
                      )}

                      <p className="text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed">
                        {isHi && f.significanceHi ? f.significanceHi : f.significance}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#ede5d6] space-y-1.5 text-xs text-stone-500">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">{isHi ? "दिनांक व तिथि:" : "Date & Tithi:"}</span>
                        <span className="font-semibold text-stone-800">
                          {f.date} • {f.tithiName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">{isHi ? "शुभ मुहूर्त:" : "Muhurta:"}</span>
                        <span className="font-semibold text-emerald-800">{f.muhurtaWindow}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Dedicated Vrata Planner */}
          {selectedTab === "vrata" && (
            <div className="space-y-5">
              <div className="bg-[#faf5eb] rounded-2xl border border-[#ede2cc] p-4 text-xs text-stone-700 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#c4903c] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold font-serif text-stone-900 text-sm">
                    {isHi ? "वैदिक व्रत एवं उपवास निर्देशिका" : "Vedic Fasting & Observance Guidelines"}
                  </span>
                  <p className="text-[11px] leading-relaxed text-stone-600">
                    {isHi
                      ? "एकादशी व्रत में द्वादशी पारण का समय अत्यंत महत्वपूर्ण है। पारण सदा हरिवासर के पश्चात और विहित मुहूर्त के भीतर ही करें।"
                      : "Fasting timings are astronomically calibrated for your selected location. Ekadashi fasts must be broken (Parana) strictly after Hari Vasara ends and before Dwadashi expires."}
                  </p>
                </div>
              </div>

              {/* Vrata Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vrataData.map((v, idx) => (
                  <div
                    key={`${v.type}-${v.date}-${idx}`}
                    className="bg-white rounded-2xl border border-[#ede5d6] p-5 shadow-xs space-y-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-serif text-[#13382c] bg-[#faf5eb] px-2.5 py-1 rounded-lg border border-[#ede2cc]">
                        {v.typeLabel}
                      </span>
                      <span className="text-xs font-semibold text-stone-500">
                        {v.date} ({isHi ? v.dayNameHi : v.dayName})
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400">{isHi ? "तिथि एवं पक्ष:" : "Tithi & Paksha:"}</span>
                        <span className="font-medium text-stone-800">
                          {v.tithi} ({v.paksha} Paksha)
                        </span>
                      </div>

                      {v.parana && (
                        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span>{isHi ? "द्वादशी पारण मुहूर्त:" : "Parana Window:"}</span>
                            <span>
                              {v.parana.paranaStartStr} - {v.parana.paranaEndStr}
                            </span>
                          </div>
                          <p className="text-[10px] text-emerald-700">
                            {isHi ? v.parana.noteHi : v.parana.noteEn} (Date: {v.parana.paranaDateStr})
                          </p>
                        </div>
                      )}

                      {v.pujaWindow && (
                        <div className="flex items-center justify-between">
                          <span className="text-stone-400">{isHi ? "पूजा मुहूर्त:" : "Puja Muhurta:"}</span>
                          <span className="font-semibold text-stone-800">{v.pujaWindow}</span>
                        </div>
                      )}

                      <div className="pt-2 text-[11px] text-stone-500 border-t border-stone-100">
                        {isHi ? v.rulesHi : v.rulesEn}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Saved & Followed Observances */}
          {selectedTab === "saved" && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl border border-[#ede5d6] p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold font-serif text-stone-900">
                  {isHi ? "मेरे अनुसरण किए गए व्रत व प्रिय पर्व" : "My Followed Vrats & Favorite Festivals"}
                </h3>

                {userPreferences.length === 0 ? (
                  <div className="text-center py-10 text-stone-500 text-xs space-y-2">
                    <Heart className="w-8 h-8 text-stone-300 mx-auto" />
                    <p>
                      {isHi
                        ? "आपने अभी कोई पर्व या व्रत सुरक्षित नहीं किया है। पर्व विवरण में जाकर 'हृदय' अथवा 'व्रत अनुसरण' पर क्लिक करें।"
                        : "You haven't saved any festivals or followed any Vrats yet. Open any festival detail to follow or favorite it."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userPreferences.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => openFestivalDetail(p.festival.slug)}
                        className="p-4 rounded-2xl border border-[#ede5d6] hover:bg-[#faf7f0] transition cursor-pointer flex items-center justify-between"
                      >
                        <div>
                          <h4 className="text-sm font-bold font-serif text-stone-900">
                            {isHi && p.festival.nameHi ? p.festival.nameHi : p.festival.name}
                          </h4>
                          <span className="text-[10px] text-stone-500 uppercase">{p.festival.category}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#c4903c]">
                          {p.isFavorite && <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />}
                          {p.isFollowingVrat && <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* 4. Day Inspector Drawer / Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-[#ede5d6] shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ede5d6] pb-3">
              <div>
                <span className="text-xs font-semibold text-[#c4903c] uppercase">
                  {isHi ? "दैनिक पंचांग व पर्व" : "Daily Vedic Panchang"}
                </span>
                <h3 className="text-lg font-bold font-serif text-stone-900">
                  {selectedDay.date} ({isHi ? selectedDay.dayNameHi : selectedDay.dayName})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Panchang Elements Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-[#faf7f0] p-3 rounded-2xl border border-[#ede5d6]">
              <div>
                <span className="text-stone-400 block">{isHi ? "तिथि (Tithi):" : "Tithi:"}</span>
                <span className="font-bold text-stone-800">
                  {selectedDay.panchang.tithi.name} ({selectedDay.panchang.tithi.devanagari})
                </span>
                <span className="text-[10px] text-stone-500 block">ends at {selectedDay.panchang.tithi.endsAt}</span>
              </div>
              <div>
                <span className="text-stone-400 block">{isHi ? "नक्षत्र (Nakshatra):" : "Nakshatra:"}</span>
                <span className="font-bold text-stone-800">{selectedDay.panchang.nakshatra.name}</span>
                <span className="text-[10px] text-stone-500 block">Lord: {selectedDay.panchang.nakshatra.lord}</span>
              </div>
              <div>
                <span className="text-stone-400 block">{isHi ? "सूर्योदय / सूर्यास्त:" : "Sunrise / Sunset:"}</span>
                <span className="font-bold text-stone-800">
                  {selectedDay.muhurtas.sunriseStr} / {selectedDay.muhurtas.sunsetStr}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block">{isHi ? "राहुकाल:" : "Rahu Kaal:"}</span>
                <span className="font-bold text-rose-700">{selectedDay.panchang.rahuKaal || "--"}</span>
              </div>
            </div>

            {/* Hindu Month Traditions */}
            <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">{isHi ? "पूर्णिमांत मास (उत्तर भारत):" : "Purnimanta Month (North):"}</span>
                <span className="font-bold text-stone-900">
                  {selectedDay.hinduMonth.purnimanta} ({selectedDay.hinduMonth.purnimantaHi})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500">{isHi ? "अमांत मास (दक्षिण/पश्चिम):" : "Amanta Month (South/West):"}</span>
                <span className="font-bold text-stone-900">
                  {selectedDay.hinduMonth.amanta} ({selectedDay.hinduMonth.amantaHi})
                </span>
              </div>
            </div>

            {/* Festivals on this day */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                {isHi ? "इस दिन के पर्व एवं उत्सव:" : "Festivals on this Day:"}
              </h4>
              {selectedDay.festivals && selectedDay.festivals.length > 0 ? (
                selectedDay.festivals.map((f) => (
                  <div
                    key={f.slug}
                    onClick={() => {
                      setSelectedDay(null);
                      openFestivalDetail(f.slug);
                    }}
                    className="p-3 rounded-xl border border-[#ede5d6] bg-white hover:bg-[#faf7f0] transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h5 className="text-sm font-bold font-serif text-stone-900">
                        {isHi && f.nameHi ? f.nameHi : f.name}
                      </h5>
                      <span className="text-[11px] text-emerald-800">{f.muhurtaWindow}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500 italic">
                  {isHi ? "इस दिन कोई विशेष सार्वजनिक पर्व नहीं है।" : "No major universal festival on this date."}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Comprehensive Festival Detail Modal */}
      {selectedFestival && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#ede5d6] shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto relative">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedFestival(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header / Hero */}
            <div className="border-b border-[#ede5d6] pb-4 space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    CATEGORY_COLORS[selectedFestival.category] || "bg-stone-100 text-stone-800"
                  }`}
                >
                  {selectedFestival.category}
                </span>
                <span className="text-xs text-stone-400">•</span>
                <span className="text-xs text-[#c4903c] font-medium">
                  {selectedFestival.rule?.determinationRule || "Panchang Determined"}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
                {isHi && selectedFestival.nameHi ? selectedFestival.nameHi : selectedFestival.name}
              </h2>
              {selectedFestival.nameSanskrit && (
                <p className="text-sm text-[#c4903c] font-serif italic">
                  {selectedFestival.nameSanskrit}
                </p>
              )}

              {/* Action Buttons: Favorite, Follow Vrat, Reminder */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => toggleFavorite(selectedFestival)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isFavorite
                      ? "bg-rose-50 border-rose-200 text-rose-700"
                      : "bg-white border-[#ede5d6] text-stone-700 hover:bg-[#faf7f0]"
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
                  <span>{isFavorite ? (isHi ? "सुरक्षित किया" : "Favorited") : (isHi ? "सुरक्षित करें" : "Save Favorite")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleFollowVrat(selectedFestival)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    isFollowing
                      ? "bg-amber-50 border-amber-200 text-amber-800"
                      : "bg-white border-[#ede5d6] text-stone-700 hover:bg-[#faf7f0]"
                  }`}
                >
                  <Flame className={`w-3.5 h-3.5 ${isFollowing ? "fill-amber-500 text-amber-500" : ""}`} />
                  <span>{isFollowing ? (isHi ? "व्रत का अनुसरण कर रहे हैं" : "Following Vrat") : (isHi ? "व्रत अनुसरण करें" : "Follow Vrat")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => scheduleReminder(selectedFestival)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#13382c] text-white hover:bg-[#1a4a3b] transition cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>{isHi ? "स्मरण सेट करें" : "Set Reminder"}</span>
                </button>

                {reminderMsg && <span className="text-xs font-medium text-emerald-700">{reminderMsg}</span>}
              </div>
            </div>

            {/* Significance & Spiritual Overview */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                {isHi ? "धार्मिक एवं आध्यात्मिक महत्व" : "Spiritual & Traditional Significance"}
              </h4>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-serif">
                {isHi && selectedFestival.significanceHi
                  ? selectedFestival.significanceHi
                  : selectedFestival.significance}
              </p>
            </div>

            {/* Puja Vidhi */}
            {selectedFestival.pujaVidhi && (
              <div className="p-4 rounded-2xl bg-[#faf5eb] border border-[#ede2cc] space-y-2">
                <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <Sun className="w-4 h-4 text-[#c4903c]" />
                  <span>{isHi ? "पारंपरिक पूजा विधि" : "Traditional Puja Vidhi"}</span>
                </h4>
                <div className="text-xs text-stone-700 whitespace-pre-line leading-relaxed font-serif">
                  {isHi && selectedFestival.pujaVidhiHi
                    ? selectedFestival.pujaVidhiHi
                    : selectedFestival.pujaVidhi}
                </div>
              </div>
            )}

            {/* Vrata & Fasting Rules */}
            {selectedFestival.vrataRules && (
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1.5 text-xs">
                <h4 className="font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{isHi ? "व्रत एवं उपवास नियम" : "Vrata & Fasting Guidelines"}</span>
                </h4>
                <p className="text-emerald-900 leading-relaxed">
                  {isHi && selectedFestival.vrataRulesHi
                    ? selectedFestival.vrataRulesHi
                    : selectedFestival.vrataRules}
                </p>
                <p className="text-[10px] text-emerald-700 italic pt-1">
                  * Religious observance guidance only. Not medical advice. Devotees with health conditions should consult physicians before strict waterless fasts.
                </p>
              </div>
            )}

            {/* Sacred Mantras */}
            {selectedFestival.mantras && selectedFestival.mantras.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  {isHi ? "पवित्र मंत्र एवं स्तुति" : "Sacred Mantras & Stotras"}
                </h4>
                {selectedFestival.mantras.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-1 text-xs"
                  >
                    <span className="font-bold text-[#c4903c] text-xs">{m.title}</span>
                    <p className="font-serif text-sm font-bold text-stone-900">{m.sanskrit}</p>
                    <p className="text-stone-500 italic text-[11px]">{m.transliteration}</p>
                    <p className="text-stone-700 pt-1 text-[11px] border-t border-amber-200/50">
                      {isHi && m.meaningHi ? m.meaningHi : m.meaningEn}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Verified Scripture Reference with 3D Reader Link */}
            {selectedFestival.scriptureReferences && selectedFestival.scriptureReferences.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#c4903c]" />
                  <span>{isHi ? "प्रमाणित शास्त्रीय संदर्भ" : "Verified Manuscript References"}</span>
                </h4>
                {selectedFestival.scriptureReferences.map((ref, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#fcfaf5] border border-[#ede5d6] space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#13382c] font-serif">
                        {ref.bookTitle} • {ref.chapterTitle || "Classical Text"}
                      </span>
                      <span className="text-[10px] text-stone-500">{ref.verseNumber}</span>
                    </div>

                    <p className="font-serif text-xs font-semibold text-stone-900 italic">
                      {ref.shlokaSanskrit}
                    </p>
                    <p className="text-stone-600 text-[11px]">
                      {isHi && ref.translationHi ? ref.translationHi : ref.translationEn}
                    </p>

                    {ref.readerUrl && (
                      <div className="pt-2 border-t border-[#ede5d6] flex justify-end">
                        <Link
                          href={ref.readerUrl}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#13382c] hover:underline"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#c4903c]" />
                          <span>{isHi ? "3D पत्रिका पाठक में खोलें" : "Open in 3D Magazine Reader"}</span>
                          <ExternalLink className="w-3 h-3 text-stone-400" />
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
