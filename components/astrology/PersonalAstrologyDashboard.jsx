"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Compass,
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Flame,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Globe,
  Star,
  Layers,
  Heart,
  Feather,
  Info,
  Bot,
} from "lucide-react";
import NorthIndianChart from "./NorthIndianChart";
import DashaTimelineView from "./DashaTimelineView";
import TransitIntelligenceView from "./TransitIntelligenceView";
import PersonalJyotishAssistant from "./PersonalJyotishAssistant";
import WorldLocationModal from "./WorldLocationModal";
import { WORLD_CITIES } from "./worldLocations";

export default function PersonalAstrologyDashboard({ initialLanguage = "en" }) {
  const [language, setLanguage] = useState(initialLanguage);
  const isHi = language === "hi" || language === "hindi";

  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active tab
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "dasha" | "transits" | "guidance" | "journal" | "wisdom"

  // Profile modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    birthDate: "",
    birthTime: "12:00",
    birthPlace: "",
    latitude: 28.6139,
    longitude: 77.209,
    timezone: "Asia/Kolkata",
    gender: "unspecified",
  });
  const [citySearch, setCitySearch] = useState("");
  const [showBirthLocationModal, setShowBirthLocationModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Journal states
  const [journalEntries, setJournalEntries] = useState([]);
  const [journalLoading, setJournalLoading] = useState(false);
  const [journalSearch, setJournalSearch] = useState("");
  const [journalFilter, setJournalFilter] = useState("ALL");
  const [journalModalOpen, setJournalModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [journalForm, setJournalForm] = useState({
    title: "",
    entryDate: new Date().toISOString().split("T")[0],
    astrologyEvent: "Daily Astrological Reflection",
    mood: "Contemplative",
    notes: "",
    tags: "",
  });
  const [journalSaving, setJournalSaving] = useState(false);
  const [journalError, setJournalError] = useState(null);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/astrology/my-dashboard?lang=${language}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load personalized dashboard");
      }
      setDashboardData(data);

      if (data.profile) {
        setProfileForm({
          name: data.profile.name || "",
          birthDate: data.profile.birthDate || "",
          birthTime: data.profile.birthTime || "12:00",
          birthPlace: data.profile.birthPlace || "",
          latitude: data.profile.latitude || 28.6139,
          longitude: data.profile.longitude || 77.209,
          timezone: data.profile.timezone || "Asia/Kolkata",
          gender: data.profile.gender || "unspecified",
        });
      } else if (data.prefill) {
        setProfileForm((prev) => ({
          ...prev,
          ...data.prefill,
        }));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [language]);

  // Fetch journal entries
  const fetchJournalEntries = useCallback(async () => {
    setJournalLoading(true);
    try {
      let url = `/api/astrology/journal?limit=50`;
      if (journalSearch.trim()) url += `&search=${encodeURIComponent(journalSearch.trim())}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.entries) {
        setJournalEntries(data.entries);
      }
    } catch (err) {
      console.error("Journal fetch error:", err);
    } finally {
      setJournalLoading(false);
    }
  }, [journalSearch]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (activeTab === "journal") {
      fetchJournalEntries();
    }
  }, [activeTab, fetchJournalEntries]);

  // Handle City Select
  const handleSelectCity = (city) => {
    setProfileForm((prev) => ({
      ...prev,
      birthPlace: city.name,
      latitude: city.lat,
      longitude: city.lon,
      timezone: city.tzStr || String(city.tz),
    }));
    setCitySearch(city.name);
  };

  // Filtered Cities for search
  const filteredCities = useMemo(() => {
    if (!citySearch || citySearch.length < 2) return [];
    return WORLD_CITIES.filter((c) =>
      c.name.toLowerCase().includes(citySearch.toLowerCase())
    ).slice(0, 6);
  }, [citySearch]);

  // Save Birth Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);

    try {
      const res = await fetch("/api/user/astrology-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profileForm,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile");
      }
      setProfileModalOpen(false);
      await fetchDashboard();
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  // Open Journal Modal
  const handleOpenJournalModal = (entry = null) => {
    if (entry) {
      setEditingEntry(entry);
      setJournalForm({
        title: entry.title,
        entryDate: entry.entryDate,
        astrologyEvent: entry.astrologyEvent,
        mood: entry.mood,
        notes: entry.notes,
        tags: Array.isArray(entry.tags) ? entry.tags.join(", ") : "",
      });
    } else {
      setEditingEntry(null);
      const activeMaha = dashboardData?.chart?.dasha?.currentMahadasha;
      const activeAntar = dashboardData?.chart?.dasha?.currentAntardasha;
      setJournalForm({
        title: "",
        entryDate: new Date().toISOString().split("T")[0],
        astrologyEvent: activeMaha ? `${activeMaha}-${activeAntar || "Transit"} Reflection` : "Daily Astrological Reflection",
        mood: "Contemplative",
        notes: "",
        tags: "jyotish, reflection, dasha",
      });
    }
    setJournalError(null);
    setJournalModalOpen(true);
  };

  // Save Journal Entry
  const handleSaveJournal = async (e) => {
    e.preventDefault();
    if (!journalForm.title.trim()) {
      setJournalError("Please provide a title for your journal entry.");
      return;
    }

    setJournalSaving(true);
    setJournalError(null);

    const payload = {
      title: journalForm.title.trim(),
      entryDate: journalForm.entryDate,
      astrologyEvent: journalForm.astrologyEvent,
      mood: journalForm.mood,
      notes: journalForm.notes.trim(),
      tags: journalForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      mahadasha: dashboardData?.chart?.dasha?.currentMahadasha || null,
      antardasha: dashboardData?.chart?.dasha?.currentAntardasha || null,
    };

    try {
      let res;
      if (editingEntry) {
        res = await fetch(`/api/astrology/journal/${editingEntry.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/astrology/journal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save journal entry");

      setJournalModalOpen(false);
      fetchJournalEntries();
    } catch (err) {
      setJournalError(err.message);
    } finally {
      setJournalSaving(false);
    }
  };

  // Delete Journal Entry
  const handleDeleteJournal = async (id) => {
    if (!confirm(isHi ? "क्या आप इस प्रविष्टि को हटाना चाहते हैं?" : "Delete this journal entry?")) {
      return;
    }

    try {
      const res = await fetch(`/api/astrology/journal/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchJournalEntries();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Filtered Journal Entries
  const filteredJournalEntries = useMemo(() => {
    if (journalFilter === "ALL") return journalEntries;
    return journalEntries.filter((e) =>
      e.astrologyEvent?.toLowerCase().includes(journalFilter.toLowerCase())
    );
  }, [journalEntries, journalFilter]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf5] flex flex-col items-center justify-center p-6 text-stone-600">
        <div className="w-12 h-12 rounded-full border-4 border-[#13382c]/20 border-t-[#c4903c] animate-spin mb-4" />
        <h2 className="text-xl font-serif font-bold text-[#13382c]">
          {isHi ? "आपकी व्यक्तिगत ज्योतिषीय कुंडली गणना हो रही है..." : "Aligning Your Personal Vedic Sky..."}
        </h2>
        <p className="text-sm text-stone-500 mt-1">
          {isHi ? "ग्रह स्थिति, दशा, गोचर और पंचांग समन्वयन" : "Computing planetary positions, Vimshottari Dasha & Gochara transits"}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fcfaf5] p-6 max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">
          {isHi ? "डैशबोर्ड लोड करने में समस्या आई" : "Unable to Load Astrology Dashboard"}
        </h2>
        <p className="text-sm text-stone-600 max-w-md mb-6">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-6 py-2.5 rounded-xl bg-[#13382c] text-white font-medium hover:bg-[#1a4a3b] transition flex items-center gap-2 cursor-pointer shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          {isHi ? "पुनः प्रयास करें" : "Try Again"}
        </button>
      </div>
    );
  }

  const { isComplete, profile, chart, transits, panchang, choghadiya, guidance, upcomingEvents, dailyWisdom, recommendations } = dashboardData || {};

  return (
    <div className="min-h-screen bg-[#fcfaf5] text-stone-800 pb-24">
      {/* 1. Header & Personal Profile Banner */}
      <header className="bg-gradient-to-b from-[#13382c] via-[#174335] to-[#1a4d3d] text-amber-50 pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-[#c4903c]/20 shadow-md">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#c4903c] text-xs font-semibold uppercase tracking-wider mb-1">
                <Sparkles className="w-4 h-4" />
                <span>{isHi ? "वैदिक ज्योतिषीय आत्म-दर्शन" : "Personalized Vedic Astrology Ecosystem"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
                {profile ? (
                  <>
                    {profile.name}
                    <span className="text-[#c4903c] font-normal text-lg sm:text-xl ml-2">
                      ({chart?.ascendant?.sign || "Lagna"} {isHi ? "लग्न" : "Ascendant"})
                    </span>
                  </>
                ) : (
                  isHi ? "मेरा ज्योतिषीय डैशबोर्ड" : "My Vedic Astrology Dashboard"
                )}
              </h1>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setLanguage(isHi ? "en" : "hi")}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-amber-200 border border-white/15 transition flex items-center gap-1.5 cursor-pointer"
                title="Switch Language"
              >
                <Globe className="w-3.5 h-3.5 text-[#c4903c]" />
                <span>{isHi ? "English" : "हिन्दी"}</span>
              </button>

              <button
                onClick={() => setProfileModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#c4903c] hover:bg-[#d4a359] text-[#13382c] font-semibold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{profile ? (isHi ? "जन्म विवरण बदलें" : "Edit Birth Details") : (isHi ? "जन्म विवरण भरें" : "Set Birth Details")}</span>
              </button>

              <button
                onClick={fetchDashboard}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-200 border border-white/15 transition cursor-pointer"
                title="Refresh calculations"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Birth Profile Meta Pill Bar */}
          {profile && chart && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
              <div className="bg-black/30 backdrop-blur-xs p-3 rounded-xl border border-white/15">
                <div className="text-xs text-amber-200 font-bold uppercase tracking-wider">{isHi ? "लग्न (Ascendant)" : "Ascendant (Lagna)"}</div>
                <div className="text-sm font-bold text-white mt-1 truncate">{chart.ascendant?.sign} {chart.ascendant?.degree}°</div>
                <div className="text-xs text-amber-100/90 font-medium">{chart.ascendant?.nakshatra} (P{chart.ascendant?.pada})</div>
              </div>

              <div className="bg-black/30 backdrop-blur-xs p-3 rounded-xl border border-white/15">
                <div className="text-xs text-amber-200 font-bold uppercase tracking-wider">{isHi ? "जन्म राशि (Moon)" : "Janma Rashi (Moon)"}</div>
                <div className="text-sm font-bold text-white mt-1 truncate">{chart.moon?.sign}</div>
                <div className="text-xs text-amber-100/90 font-medium">{chart.moon?.nakshatra} (P{chart.moon?.pada})</div>
              </div>

              <div className="bg-black/30 backdrop-blur-xs p-3 rounded-xl border border-white/15">
                <div className="text-xs text-amber-200 font-bold uppercase tracking-wider">{isHi ? "सूर्य राशि (Sun)" : "Sun Sign (Surya)"}</div>
                <div className="text-sm font-bold text-white mt-1 truncate">
                  {chart.planets?.find((p) => p.planet === "SUN")?.sign || "N/A"}
                </div>
                <div className="text-xs text-amber-100/90 font-medium">{chart.planets?.find((p) => p.planet === "SUN")?.nakshatra || ""}</div>
              </div>

              <div className="bg-black/30 backdrop-blur-xs p-3 rounded-xl border border-white/15">
                <div className="text-xs text-amber-200 font-bold uppercase tracking-wider">{isHi ? "सक्रिय महादशा" : "Active Mahadasha"}</div>
                <div className="text-sm font-bold text-white mt-1 truncate">{chart.dasha?.currentMahadasha}</div>
                <div className="text-xs text-amber-100/90 font-medium">{chart.dasha?.currentAntardasha} Antardasha</div>
              </div>

              <div className="bg-black/30 backdrop-blur-xs p-3 rounded-xl border border-white/15 col-span-2 sm:col-span-2">
                <div className="text-xs text-amber-200 font-bold uppercase tracking-wider">{isHi ? "जन्म स्थान एवं समय" : "Birth Place & Time"}</div>
                <div className="text-sm font-medium text-white mt-1 truncate flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#d4a359] shrink-0" />
                  <span>{profile.birthPlace}</span>
                </div>
                <div className="text-xs text-amber-100/90 flex items-center gap-2 mt-1 font-medium">
                  <span>{profile.birthDate}</span>
                  <span>•</span>
                  <span>{profile.birthTime}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Incomplete Profile Callout Banner */}
        {!isComplete && (
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-600/15 border-2 border-[#c4903c] rounded-2xl p-6 sm:p-8 mb-8 shadow-lg backdrop-blur-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#13382c] font-bold text-lg font-serif">
                  <Sparkles className="w-5 h-5 text-[#c4903c]" />
                  <span>{isHi ? "अपनी जन्म कुंडली सक्रिय करें" : "Complete Your Birth Profile"}</span>
                </div>
                <p className="text-sm text-stone-700 max-w-2xl leading-relaxed">
                  {isHi
                    ? "सटीक वैदिक ज्योतिषीय मार्गदर्शन, वर्तमान विंशोत्तरी दशा, गोचर और पंचांग के लिए अपने जन्म की सटीक तारीख, समय और स्थान दर्ज करें।"
                    : "To calculate your exact Vedic birth chart (Kundli), active Vimshottari Dasha, Gochara transits, and tailored daily guidance, please provide your date, exact time, and birthplace."}
                </p>
              </div>
              <button
                onClick={() => setProfileModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-[#13382c] text-white hover:bg-[#1a4a3b] font-semibold text-sm transition flex items-center gap-2 shrink-0 cursor-pointer shadow-md"
              >
                <span>{isHi ? "जन्म विवरण दर्ज करें" : "Enter Birth Details"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 2. Navigation Tab Segmented Bar */}
        <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-stone-200/80 mb-8 overflow-x-auto flex items-center gap-1">
          {[
            { id: "overview", label: isHi ? "जन्म कुंडली व ग्रह" : "Chart & Grahas", icon: Compass },
            { id: "dasha", label: isHi ? "विंशोत्तरी दशा काल" : "Dasha Timeline", icon: Calendar },
            { id: "transits", label: isHi ? "दैनिक गोचर" : "Gochara Transits", icon: Layers },
            { id: "guidance", label: isHi ? "दैनिक मार्गदर्शन" : "Daily Guidance", icon: Sparkles },
            { id: "journal", label: isHi ? "ज्योतिषीय दैनिकी" : "Astrology Journal", icon: BookOpen },
            { id: "assistant", label: isHi ? "एआई ज्योतिष सहायक" : "AI Jyotish Assistant", icon: Bot },
            { id: "wisdom", label: isHi ? "शास्त्र ज्ञान व सुझाव" : "Wisdom & Reading", icon: Feather },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#13382c] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#c4903c]" : "text-stone-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. Tab Contents */}

        {/* TAB 1: CHART OVERVIEW & PLANETS */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {chart ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: North Indian Kundli Chart */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-stone-900 text-lg flex items-center gap-2">
                      <Compass className="w-5 h-5 text-[#c4903c]" />
                      <span>{isHi ? "लग्न कुण्डली (D1 चक्र)" : "Lagna Birth Chart (D1)"}</span>
                    </h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                      Lahiri Ayanamsa
                    </span>
                  </div>

                  <div className="p-2 bg-[#fbf9f4] rounded-2xl border border-amber-100 flex items-center justify-center">
                    <NorthIndianChart
                      chart={chart}
                      language={language}
                      className="w-full max-w-[380px]"
                    />
                  </div>

                  <div className="text-[11px] text-stone-500 text-center leading-relaxed">
                    {isHi
                      ? "प्रथम भाव लग्न को दर्शाता है। शीर्ष केंद्र हीरा लग्न भाव है।"
                      : "First house represents the Lagna (Ascendant). Top-central diamond is the 1st House."}
                  </div>
                </div>

                {/* Right: Key Planetary Placements & Dignities */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Planetary Table */}
                  <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif font-bold text-stone-900 text-lg flex items-center gap-2">
                        <Star className="w-5 h-5 text-[#c4903c]" />
                        <span>{isHi ? "ग्रह स्थिति एवं बल" : "Planetary Positions & Dignity"}</span>
                      </h3>
                      <span className="text-xs text-stone-500">9 Classical Grahas</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs sm:text-sm">
                        <thead>
                          <tr className="border-b border-stone-200 text-stone-700 font-bold uppercase tracking-wider text-xs">
                            <th className="pb-3">{isHi ? "ग्रह" : "Graha"}</th>
                            <th className="pb-3">{isHi ? "राशि" : "Rashi"}</th>
                            <th className="pb-3">{isHi ? "भाव" : "House"}</th>
                            <th className="pb-3">{isHi ? "अंश" : "Degree"}</th>
                            <th className="pb-3">{isHi ? "नक्षत्र (पद)" : "Nakshatra"}</th>
                            <th className="pb-3 text-right">{isHi ? "स्थिति" : "Dignity"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {chart.planets?.map((p) => {
                            const isRetro = p.retrograde && !["RAHU", "KETU"].includes(p.planet);
                            return (
                              <tr key={p.planet} className="hover:bg-amber-50/50 transition">
                                <td className="py-3 font-bold text-stone-900 flex items-center gap-1.5">
                                  <span>{p.name || p.planet}</span>
                                  {isRetro && (
                                    <span className="text-xs text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded font-bold">
                                      {isHi ? "व" : "R"}
                                    </span>
                                  )}
                                  {p.isCombust && (
                                    <span className="text-xs text-rose-900 bg-rose-100 border border-rose-300 px-1.5 py-0.5 rounded font-bold">
                                      {isHi ? "अस्त" : "Combust"}
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 text-stone-800 font-semibold">{p.sign}</td>
                                <td className="py-3 text-stone-700 font-medium">H{p.house}</td>
                                <td className="py-3 text-stone-700 font-medium">{typeof p.degree === "number" ? p.degree.toFixed(2) : p.degree}°</td>
                                <td className="py-3 text-stone-700 font-medium truncate max-w-[130px]">
                                  {p.nakshatra} (P{p.pada})
                                </td>
                                <td className="py-3 text-right font-medium">
                                  <span
                                    className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                                      p.dignity === "EXALTED" || p.dignity === "OWN" || p.dignity === "MOOLATRIKONA"
                                        ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                        : p.dignity === "DEBILITATED"
                                        ? "bg-rose-100 text-rose-900 border border-rose-300"
                                        : "bg-stone-100 text-stone-800 border border-stone-200"
                                    }`}
                                  >
                                    {p.dignityLabel || p.dignity || "Neutral"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Yogas and Doshas Summary */}
                  {chart.yogasAndDoshas && (
                    <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
                      <h4 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                        <Flame className="w-4 h-4 text-[#c4903c]" />
                        <span>{isHi ? "प्रमुख योग एवं दोष" : "Classical Yogas & Astrological Factors"}</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {chart.yogasAndDoshas.yogas?.slice(0, 4).map((y, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 space-y-1">
                            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{y.name}</span>
                            </div>
                            <p className="text-[11px] text-emerald-800/80 leading-relaxed line-clamp-2">
                              {y.description}
                            </p>
                          </div>
                        ))}

                        {chart.yogasAndDoshas.doshas?.slice(0, 2).map((d, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 space-y-1">
                            <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>{d.name}</span>
                            </div>
                            <p className="text-[11px] text-amber-800/80 leading-relaxed line-clamp-2">
                              {d.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-stone-300">
                <Compass className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                <p className="text-stone-600 font-medium">
                  {isHi ? "कृपया अपना जन्म विवरण दर्ज करें।" : "Complete your birth profile to unlock the interactive birth chart."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DASHA TIMELINE */}
        {activeTab === "dasha" && (
          <div className="space-y-6">
            {chart ? (
              <DashaTimelineView chart={chart} language={language} />
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-stone-300">
                <Calendar className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                <p className="text-stone-600 font-medium">
                  {isHi ? "दशा गणना के लिए जन्म विवरण आवश्यक है।" : "Birth profile required to compute Vimshottari Dasha."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: GOCHARA TRANSITS */}
        {activeTab === "transits" && (
          <div className="space-y-6">
            {chart ? (
              <TransitIntelligenceView chart={chart} language={language} />
            ) : (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-stone-300">
                <Layers className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                <p className="text-stone-600 font-medium">
                  {isHi ? "गोचर गणना के लिए जन्म विवरण आवश्यक है।" : "Birth profile required to compute transit intelligence."}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DAILY GUIDANCE & PANCHANG */}
        {activeTab === "guidance" && (
          <div className="space-y-8">
            {/* Unified 10-Section Experience Callout Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#13382c] to-[#1d4d3d] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30 uppercase tracking-wider">
                    Full Experience
                  </span>
                  <span className="text-xs text-stone-300">10-Section Guidance Suite</span>
                </div>
                <h4 className="text-base sm:text-lg font-serif font-bold text-amber-50">
                  {isHi ? "दैनिक वैदिक उपाय, पूजा एवं कुण्डलिनी मार्गदर्शन" : "Dedicated Daily Remedies, Puja & Kundalini Guidance"}
                </h4>
                <p className="text-xs text-stone-200 max-w-2xl">
                  {isHi
                    ? "८ शास्त्रीय पूजाएं, संस्कृत मन्त्र अन्वय, नाडी एवं चक्र साधना, तथा श्वास गति टाइमर युक्त विस्तृत अनुभव।"
                    : "Access all 8 classical Pujas, Sanskrit mantra Anvaya analysis, active Nadi & Chakra alignment, and interactive breath pacing."}
                </p>
              </div>
              <Link
                href="/astrology/daily-guidance"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 text-[#13382c] font-bold text-xs hover:bg-amber-300 transition shrink-0 shadow-sm"
              >
                <span>{isHi ? "पूर्ण दैनिक अनुभव खोलें" : "Launch Full Experience"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Daily Guidance Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900">
                    {isHi ? "दैनिक वैयक्तिक मार्गदर्शन" : "Today's Personalized Guidance"}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {isHi ? "खगोलीय गणनाओं एवं शास्त्रीय सूत्रों पर आधारित" : "Synthesized from exact transit coordinates & Parashari scripture"}
                  </p>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                  Calculated Astrological Intelligence
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {guidance && guidance.length > 0 ? (
                  guidance.map((g, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#13382c] uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                          {g.category}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {g.type === "CALCULATED" ? "Astronomically Grounded" : "Interpretive"}
                        </span>
                      </div>

                      <h4 className="text-base font-serif font-bold text-stone-900">
                        {g.headline}
                      </h4>

                      <p className="text-xs text-stone-600 leading-relaxed">
                        {g.analysis}
                      </p>

                      {g.classicalReference && (
                        <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 flex items-center gap-1.5 italic">
                          <BookOpen className="w-3.5 h-3.5 text-[#c4903c] shrink-0" />
                          <span>{g.classicalReference}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-stone-500 bg-white rounded-2xl border border-stone-200 col-span-2">
                    {isHi ? "मार्गदर्शन संकलन लोड हो रहा है..." : "No specific guidance generated for current query."}
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Astrological Events */}
            {upcomingEvents && upcomingEvents.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#c4903c]" />
                    <span>{isHi ? "निकटवर्ती ज्योतिषीय संक्रमण" : "Important Upcoming Astrological Transitions"}</span>
                  </h3>
                  <span className="text-xs text-stone-400">Next 365 Days</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {upcomingEvents.map((evt, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          {evt.category}
                        </span>
                        {evt.daysRemaining && (
                          <span className="text-[10px] text-stone-500 font-semibold">
                            {evt.daysRemaining} days away
                          </span>
                        )}
                      </div>
                      <div className="font-serif font-bold text-sm text-stone-900">{evt.title}</div>
                      <p className="text-xs text-stone-600 leading-relaxed">{evt.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Panchang & Choghadiya Quick Card */}
            {panchang && (
              <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#c4903c]" />
                    <span>{isHi ? "आज का पंचांग व शुभ समय" : "Today's Panchang & Auspicious Muhurtas"}</span>
                  </h3>
                  <Link
                    href="/astrology/daily"
                    className="text-xs font-semibold text-[#13382c] hover:underline flex items-center gap-1"
                  >
                    <span>{isHi ? "विस्तृत दैनिक पंचांग देखें" : "View Full Daily Panchang"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-stone-50 rounded-xl">
                    <div className="text-[10px] text-stone-500 uppercase font-semibold">{isHi ? "तिथि" : "Tithi"}</div>
                    <div className="text-xs font-bold text-stone-900 mt-0.5">{panchang.tithi?.name}</div>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl">
                    <div className="text-[10px] text-stone-500 uppercase font-semibold">{isHi ? "नक्षत्र" : "Nakshatra"}</div>
                    <div className="text-xs font-bold text-stone-900 mt-0.5">{panchang.nakshatra?.name}</div>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl">
                    <div className="text-[10px] text-stone-500 uppercase font-semibold">{isHi ? "अभिजीत मुहूर्त" : "Abhijit Muhurta"}</div>
                    <div className="text-xs font-bold text-emerald-800 mt-0.5">{panchang.muhurta?.abhijit || "Midday"}</div>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl">
                    <div className="text-[10px] text-stone-500 uppercase font-semibold">{isHi ? "राहु काल" : "Rahu Kalam"}</div>
                    <div className="text-xs font-bold text-rose-800 mt-0.5">{panchang.inauspiciousPeriods?.rahuKalam || "N/A"}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ASTROLOGY JOURNAL */}
        {activeTab === "journal" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  {isHi ? "निजी ज्योतिषीय दैनिकी" : "Private Astrology Journal"}
                </h3>
                <p className="text-xs text-stone-500">
                  {isHi
                    ? "अपने ग्रहों के प्रभाव, गोचर, साधना और मानसिक अवस्था को सुरक्षित रूप से रिकॉर्ड करें"
                    : "Privately record reflections, transits, sadhana, and psychological observations"}
                </p>
              </div>

              <button
                onClick={() => handleOpenJournalModal()}
                className="px-4 py-2.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-white font-semibold text-xs transition flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 text-[#c4903c]" />
                <span>{isHi ? "नई प्रविष्टि लिखें" : "New Journal Entry"}</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-3 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={journalSearch}
                  onChange={(e) => setJournalSearch(e.target.value)}
                  placeholder={isHi ? "दैनिकी में खोजें..." : "Search reflections, tags, notes..."}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c4903c]"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-stone-400" />
                <select
                  value={journalFilter}
                  onChange={(e) => setJournalFilter(e.target.value)}
                  className="text-xs rounded-xl bg-stone-50 border border-stone-200 py-2 px-3 focus:outline-none"
                >
                  <option value="ALL">{isHi ? "सभी विषय" : "All Event Types"}</option>
                  <option value="Transit">Transits</option>
                  <option value="Dasha">Dasha Shifts</option>
                  <option value="Meditation">Meditation / Sadhana</option>
                  <option value="Reflection">General Reflection</option>
                </select>
              </div>
            </div>

            {/* Journal Entries List */}
            {journalLoading ? (
              <div className="p-12 text-center text-stone-500 bg-white rounded-2xl border border-stone-200">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#c4903c]" />
                <p className="text-xs">{isHi ? "दैनिकी लोड हो रही है..." : "Loading private journal..."}</p>
              </div>
            ) : filteredJournalEntries.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-stone-300 space-y-3">
                <BookOpen className="w-10 h-10 text-stone-400 mx-auto" />
                <h4 className="font-serif font-bold text-stone-800 text-base">
                  {isHi ? "कोई दैनिकी प्रविष्टि नहीं मिली" : "No Journal Entries Found"}
                </h4>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  {isHi
                    ? "वर्तमान ग्रह दशा अथवा दैनिक गोचर के प्रति अपने विचार और ध्यान के अनुभव को लिखें।"
                    : "Begin logging your observations on planetary shifts, meditation practices, and personal reflections."}
                </p>
                <button
                  onClick={() => handleOpenJournalModal()}
                  className="px-4 py-2 rounded-xl bg-[#13382c] text-white text-xs font-semibold hover:bg-[#1a4a3b] transition cursor-pointer"
                >
                  {isHi ? "पहला विचार दर्ज करें" : "Write First Entry"}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJournalEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-3 hover:border-amber-300 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-900 bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-200">
                          {entry.astrologyEvent}
                        </span>
                        <span className="text-xs text-stone-400">•</span>
                        <span className="text-xs text-stone-500 font-medium">{entry.entryDate}</span>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                          onClick={() => handleOpenJournalModal(entry)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
                          title="Edit Entry"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteJournal(entry.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-base font-serif font-bold text-stone-900">
                      {entry.title}
                    </h4>

                    {entry.notes && (
                      <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">
                        {entry.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
                      {entry.mood && (
                        <span className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                          Mood: {entry.mood}
                        </span>
                      )}
                      {entry.tags && entry.tags.map((t, idx) => (
                        <span key={idx} className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: AI JYOTISH ASSISTANT */}
        {activeTab === "assistant" && (
          <div className="space-y-6">
            <PersonalJyotishAssistant chart={chart} profile={profile} initialLanguage={language} />
          </div>
        )}

        {/* TAB 6: SANSKRIT WISDOM & RECOMMENDATIONS */}
        {activeTab === "wisdom" && (
          <div className="space-y-8">
            {/* Daily Sanskrit Wisdom */}
            {dailyWisdom && (
              <div className="bg-gradient-to-br from-[#13382c] via-[#1a4a3b] to-[#13382c] text-amber-50 p-6 sm:p-8 rounded-2xl shadow-md border border-[#c4903c]/30 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#c4903c] text-xs font-semibold uppercase tracking-wider">
                    <Feather className="w-4 h-4" />
                    <span>{isHi ? "दैनिक संस्कृत शास्त्र श्लोक" : "Verified Daily Sanskrit Wisdom"}</span>
                  </div>
                  <span className="text-xs text-amber-200/80 bg-black/25 px-3 py-1 rounded-full border border-white/10">
                    {dailyWisdom.source} • {dailyWisdom.verseNumber || "Shloka"}
                  </span>
                </div>

                {/* Devanagari Shloka */}
                <div className="text-center py-4 space-y-2">
                  <p className="text-xl sm:text-2xl font-serif text-white font-bold leading-relaxed whitespace-pre-line">
                    {dailyWisdom.devanagari}
                  </p>
                  {dailyWisdom.iast && (
                    <p className="text-xs text-amber-200/70 italic font-mono">
                      {dailyWisdom.iast}
                    </p>
                  )}
                </div>

                {/* Translations & Practical Takeaway */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/15">
                  <div className="p-4 bg-black/20 rounded-xl space-y-1">
                    <div className="text-[11px] text-[#c4903c] font-bold uppercase">{isHi ? "भावार्थ (हिन्दी)" : "Hindi Meaning"}</div>
                    <p className="text-xs text-amber-100/90 leading-relaxed">
                      {dailyWisdom.translationHi || dailyWisdom.translationEn}
                    </p>
                  </div>

                  <div className="p-4 bg-black/20 rounded-xl space-y-1">
                    <div className="text-[11px] text-[#c4903c] font-bold uppercase">{isHi ? "अंग्रेजी अनुवाद" : "English Meaning"}</div>
                    <p className="text-xs text-amber-100/90 leading-relaxed">
                      {dailyWisdom.translationEn}
                    </p>
                  </div>
                </div>

                {dailyWisdom.commentaryEn && (
                  <div className="p-4 bg-[#c4903c]/15 rounded-xl border border-[#c4903c]/30 space-y-1">
                    <div className="text-[11px] text-[#c4903c] font-bold uppercase">{isHi ? "व्यावहारिक साधना व चिंतन" : "Practical Contemplation & Takeaway"}</div>
                    <p className="text-xs text-amber-100 leading-relaxed">
                      {isHi ? dailyWisdom.commentaryHi || dailyWisdom.commentaryEn : dailyWisdom.commentaryEn}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Personalized Recommendations */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-stone-900">
                    {isHi ? "प्रामाणिक अध्ययन सुझाव" : "Explainable Learning Recommendations"}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {isHi ? "आपकी सक्रिय महादशा, लग्न एवं अध्ययन प्रगति पर आधारित" : "Grounding reading paths in your active Mahadasha, Lagna, and reading history"}
                  </p>
                </div>
                <span className="text-xs text-stone-500">{recommendations?.length || 0} Recommended Topics</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations && recommendations.length > 0 ? (
                  recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between hover:border-[#c4903c] transition space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {rec.category || "Astrology"}
                          </span>
                          <span className="text-[10px] text-stone-400 font-semibold">{rec.type || "Topic"}</span>
                        </div>

                        <h4 className="font-serif font-bold text-sm text-stone-900 line-clamp-2">
                          {rec.title}
                        </h4>

                        <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                          {rec.description || rec.explainabilityReason}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-stone-100 space-y-2">
                        <div className="text-[10px] text-amber-800 bg-amber-50/60 p-2 rounded-lg italic">
                          <span className="font-semibold">Why: </span>
                          {rec.explainabilityReason || rec.astrologicalRelevance}
                        </div>

                        {rec.url ? (
                          <Link
                            href={rec.url}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#13382c] hover:underline"
                          >
                            <span>Study Manuscript</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <Link
                            href="/library"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#13382c] hover:underline"
                          >
                            <span>Explore in Library</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-stone-500 bg-white rounded-2xl border border-stone-200 col-span-3">
                    {isHi ? "सुझाव तैयार हो रहे हैं..." : "Recommendations will generate as you progress through your learning paths."}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. Edit Birth Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-xl flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#c4903c]" />
                  <span>{isHi ? "वैदिक जन्म विवरण" : "Personal Birth Details"}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {isHi
                    ? "सटीक लग्न व ग्रह स्थिति गणना हेतु प्रामाणिक विवरण भरें"
                    : "Accurate birth details ensure deterministic Kundli calculation"}
                </p>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {profileError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  {isHi ? "पूर्ण नाम" : "Full Name"} *
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="e.g. Manish Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c4903c]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {isHi ? "जन्म तिथि" : "Date of Birth"} *
                  </label>
                  <input
                    type="date"
                    required
                    value={profileForm.birthDate}
                    onChange={(e) => setProfileForm({ ...profileForm, birthDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c4903c]"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {isHi ? "जन्म समय (24-घंटे)" : "Time of Birth (24-hour)"} *
                  </label>
                  <input
                    type="time"
                    required
                    value={profileForm.birthTime}
                    onChange={(e) => setProfileForm({ ...profileForm, birthTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c4903c]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-stone-700 font-bold">
                    {isHi ? "जन्म स्थान" : "Place of Birth (City / Town)"} *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowBirthLocationModal(true)}
                    className="text-xs text-[#c4903c] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>🌐 {isHi ? "देश > राज्य > नगर से स्वतः चुनें" : "Auto Country > State > Town"}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={profileForm.birthPlace}
                  onChange={(e) => {
                    setProfileForm({ ...profileForm, birthPlace: e.target.value });
                    setCitySearch(e.target.value);
                  }}
                  placeholder="Type city name (e.g. Varanasi, Ayodhya, New Delhi, London)..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c4903c]"
                />

                {/* Filtered cities suggestions */}
                {filteredCities.length > 0 && (
                  <div className="mt-1 bg-white border border-stone-200 rounded-xl shadow-lg max-h-40 overflow-y-auto divide-y divide-stone-100 z-10">
                    {filteredCities.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => handleSelectCity(c)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-amber-50 flex items-center justify-between text-stone-700"
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-[10px] text-stone-400">TZ: {c.tz >= 0 ? `+${c.tz}` : c.tz}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {isHi ? "अक्षांश (Latitude)" : "Latitude"}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={profileForm.latitude}
                    onChange={(e) => setProfileForm({ ...profileForm, latitude: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {isHi ? "देशांतर (Longitude)" : "Longitude"}
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={profileForm.longitude}
                    onChange={(e) => setProfileForm({ ...profileForm, longitude: parseFloat(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 font-medium hover:bg-stone-200 transition cursor-pointer"
                >
                  {isHi ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-[#13382c] text-white font-semibold hover:bg-[#1a4a3b] transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {savingProfile && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isHi ? "कुंडली गणना करें" : "Calculate & Save Kundli"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Location Modal for Birth Place */}
      <WorldLocationModal
        isOpen={showBirthLocationModal}
        onClose={() => setShowBirthLocationModal(false)}
        onApply={(loc) => {
          setProfileForm((prev) => ({
            ...prev,
            birthPlace: loc.name,
            latitude: loc.lat,
            longitude: loc.lon,
            timezone: loc.tzStr || String(loc.tz),
          }));
          setCitySearch(loc.name);
          setShowBirthLocationModal(false);
        }}
        initialLocation={{
          name: profileForm.birthPlace,
          lat: profileForm.latitude,
          lon: profileForm.longitude,
          tz: profileForm.timezone,
        }}
        isHi={isHi}
        title={isHi ? "जन्म स्थान का स्वतः चयन" : "Select Birth Place"}
        subtitle={isHi ? "देश, राज्य व नगर से अक्षांश, देशांतर और समय-क्षेत्र स्वतः भरें।" : "Automatic coordinates & timezone calculated by location hierarchy."}
      />

      {/* 5. Astrology Journal Modal */}
      {journalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-serif font-bold text-stone-900 text-xl flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#c4903c]" />
                  <span>{editingEntry ? (isHi ? "प्रविष्टि संपादित करें" : "Edit Journal Entry") : (isHi ? "नई दैनिकी प्रविष्टि" : "New Astrology Journal Entry")}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {isHi ? "यह प्रविष्टि पूर्णतः निजी और सुरक्षित है" : "Private & isolated to your account"}
                </p>
              </div>
              <button
                onClick={() => setJournalModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {journalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{journalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveJournal} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  {isHi ? "शीर्षक" : "Entry Title"} *
                </label>
                <input
                  type="text"
                  required
                  value={journalForm.title}
                  onChange={(e) => setJournalForm({ ...journalForm, title: e.target.value })}
                  placeholder="e.g. Jupiter Transit to 9th House Meditation Experience"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c4903c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {isHi ? "तारीख" : "Date"} *
                  </label>
                  <input
                    type="date"
                    required
                    value={journalForm.entryDate}
                    onChange={(e) => setJournalForm({ ...journalForm, entryDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    {isHi ? "मनोदशा" : "Mindset / Mood"}
                  </label>
                  <select
                    value={journalForm.mood}
                    onChange={(e) => setJournalForm({ ...journalForm, mood: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none"
                  >
                    <option value="Contemplative">Contemplative (शांत / चिंतनशील)</option>
                    <option value="Devotional">Devotional (भक्तिमय)</option>
                    <option value="Energized">Energized (ऊर्जावान)</option>
                    <option value="Challenging">Reflective / Challenging (धैर्यवान)</option>
                    <option value="Peaceful">Serene (प्रसन्न)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  {isHi ? "संबद्ध ज्योतिषीय घटना" : "Associated Astrology Event"}
                </label>
                <input
                  type="text"
                  value={journalForm.astrologyEvent}
                  onChange={(e) => setJournalForm({ ...journalForm, astrologyEvent: e.target.value })}
                  placeholder="e.g. Saturn Sade Sati, Full Moon, Jupiter Mahadasha"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  {isHi ? "व्यक्तिगत अवलोकन एवं विचार" : "Personal Notes & Observations"} *
                </label>
                <textarea
                  rows={4}
                  required
                  value={journalForm.notes}
                  onChange={(e) => setJournalForm({ ...journalForm, notes: e.target.value })}
                  placeholder="Reflect on today's mental state, meditation experience, synchronicities, or life events..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#c4903c]"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  {isHi ? "टैग (अल्पविराम से अलग करें)" : "Tags (comma separated)"}
                </label>
                <input
                  type="text"
                  value={journalForm.tags}
                  onChange={(e) => setJournalForm({ ...journalForm, tags: e.target.value })}
                  placeholder="meditation, dasha, career, health"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setJournalModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 font-medium hover:bg-stone-200 transition cursor-pointer"
                >
                  {isHi ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={journalSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#13382c] text-white font-semibold hover:bg-[#1a4a3b] transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {journalSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingEntry ? (isHi ? "अद्यतन करें" : "Update Entry") : (isHi ? "सहेजें" : "Save Entry")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
