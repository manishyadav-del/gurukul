"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  Layers,
  Clock,
  Compass,
  Heart,
  ShieldCheck,
  Check,
  RotateCcw,
  Star,
  Briefcase,
  Brain,
  Wallet,
  Zap,
  Flame,
  Shield,
  Info,
  AlertCircle,
  Loader2,
  Languages,
  Target,
  ExternalLink,
  Copy,
  Bookmark,
  CheckCheck,
  User,
  Users,
  Globe,
  X,
  Network,
  Award,
} from "lucide-react";
import NorthIndianChart from "./NorthIndianChart";
import HoroscopeKnowledgeExplorer from "./HoroscopeKnowledgeExplorer";
import LiveChoghadiyaWatch from "./LiveChoghadiyaWatch.jsx";
import VedicCalendarStudio from "./VedicCalendarStudio";
import WorldLocationModal from "./WorldLocationModal";
import PlaceAutocompleteInput from "./PlaceAutocompleteInput";
import FamilyAstrologyCircle from "./FamilyAstrologyCircle";
import PanchangKnowledgeModal from "./PanchangKnowledgeModal";
import VedicNumerologyStudio from "./VedicNumerologyStudio";
import { NAKSHATRA_MUHURTA } from "./muhurtaConstants";
import { RASHI_NAMES_HI } from "./kundliExplanations";
import {
  WORLD_CITIES,
  formatTzOffset,
  estimateTzFromLongitude,
  COMMON_TIMEZONES,
} from "./worldLocations";

// ---------------------------------------------------------------------------
// Preset World Cities (Expanded library of spiritual & global cities)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// 12 Rashis Constants & Traditional Vedic Correspondences
// ---------------------------------------------------------------------------
const RASHIS = [
  { id: "Aries",       nameEn: "Aries",       nameHi: "मेष",     symbol: "♈", lordEn: "Mars",    lordHi: "मंगल",     element: "Fire (अग्नि)",   index: 0 },
  { id: "Taurus",      nameEn: "Taurus",      nameHi: "वृषभ",    symbol: "♉", lordEn: "Venus",   lordHi: "शुक्र",    element: "Earth (पृथ्वी)", index: 1 },
  { id: "Gemini",      nameEn: "Gemini",      nameHi: "मिथुन",   symbol: "♊", lordEn: "Mercury", lordHi: "बुध",      element: "Air (वायु)",     index: 2 },
  { id: "Cancer",      nameEn: "Cancer",      nameHi: "कर्क",    symbol: "♋", lordEn: "Moon",    lordHi: "चन्द्र",   element: "Water (जल)",     index: 3 },
  { id: "Leo",         nameEn: "Leo",         nameHi: "सिंह",    symbol: "♌", lordEn: "Sun",     lordHi: "सूर्य",    element: "Fire (अग्नि)",   index: 4 },
  { id: "Virgo",       nameEn: "Virgo",       nameHi: "कन्या",   symbol: "♍", lordEn: "Mercury", lordHi: "बुध",      element: "Earth (पृथ्वी)", index: 5 },
  { id: "Libra",       nameEn: "Libra",       nameHi: "तुला",    symbol: "♎", lordEn: "Venus",   lordHi: "शुक्र",    element: "Air (वायु)",     index: 6 },
  { id: "Scorpio",     nameEn: "Scorpio",     nameHi: "वृश्चिक", symbol: "♏", lordEn: "Mars",    lordHi: "मंगल",     element: "Water (जल)",     index: 7 },
  { id: "Sagittarius", nameEn: "Sagittarius", nameHi: "धनु",     symbol: "♐", lordEn: "Jupiter", lordHi: "बृहस्पति", element: "Fire (अग्नि)",   index: 8 },
  { id: "Capricorn",   nameEn: "Capricorn",   nameHi: "मकर",     symbol: "♑", lordEn: "Saturn",  lordHi: "शनि",     element: "Earth (पृथ्वी)", index: 9 },
  { id: "Aquarius",    nameEn: "Aquarius",    nameHi: "कुम्भ",   symbol: "♒", lordEn: "Saturn",  lordHi: "शनि",     element: "Air (वायु)",     index: 10 },
  { id: "Pisces",      nameEn: "Pisces",      nameHi: "मीन",     symbol: "♓", lordEn: "Jupiter", lordHi: "बृहस्पति", element: "Water (जल)",     index: 11 },
];

const RASHI_DETAILS = {
  Aries: {
    luckyColor: "Crimson Red / Blood Orange",
    luckyNumber: 9,
    luckyDirection: "East",
    favorableWindow: "06:30 AM - 08:30 AM",
    mantra: "ॐ क्रां क्रीं क्रौं सः भौमाय नमः",
    focus: "Courage, initiative, sports, competitive tasks, and decisive leadership.",
  },
  Taurus: {
    luckyColor: "Pearl White / Soft Green",
    luckyNumber: 6,
    luckyDirection: "South-East",
    favorableWindow: "09:00 AM - 11:00 AM",
    mantra: "ॐ द्रां द्रीं द्रौं सः शुक्राय नमः",
    focus: "Financial planning, asset consolidation, art, harmony, and steadfast progress.",
  },
  Gemini: {
    luckyColor: "Emerald Green / Light Yellow",
    luckyNumber: 5,
    luckyDirection: "North",
    favorableWindow: "11:30 AM - 01:30 PM",
    mantra: "ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः",
    focus: "Communication, writing, negotiations, trade, and learning new concepts.",
  },
  Cancer: {
    luckyColor: "Silver / Milk White",
    luckyNumber: 2,
    luckyDirection: "North-West",
    favorableWindow: "07:00 PM - 09:00 PM",
    mantra: "ॐ श्रां श्रीं श्रौं सः चन्द्रमसे नमः",
    focus: "Emotional balance, family harmony, intuition, care, and home environment.",
  },
  Leo: {
    luckyColor: "Golden Yellow / Saffron",
    luckyNumber: 1,
    luckyDirection: "East",
    favorableWindow: "06:00 AM - 08:00 AM",
    mantra: "ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः",
    focus: "Administration, public presence, creative projects, self-confidence, and vital energy.",
  },
  Virgo: {
    luckyColor: "Deep Green / Beige",
    luckyNumber: 5,
    luckyDirection: "South",
    favorableWindow: "02:00 PM - 04:00 PM",
    mantra: "ॐ बुं बुधाय नमः",
    focus: "Analytical tasks, healthcare, systematic organizing, editing, and precision work.",
  },
  Libra: {
    luckyColor: "Sky Blue / Diamond White",
    luckyNumber: 6,
    luckyDirection: "West",
    favorableWindow: "04:30 PM - 06:30 PM",
    mantra: "ॐ शुं शुक्राय नमः",
    focus: "Partnerships, diplomacy, legal agreements, design aesthetics, and mutual balance.",
  },
  Scorpio: {
    luckyColor: "Maroon / Dark Rust",
    luckyNumber: 9,
    luckyDirection: "North",
    favorableWindow: "08:00 PM - 10:00 PM",
    mantra: "ॐ अं अंगारकाय नमः",
    focus: "Deep research, transformation, investigative analysis, occult study, and resolute will.",
  },
  Sagittarius: {
    luckyColor: "Bright Yellow / Turmeric Gold",
    luckyNumber: 3,
    luckyDirection: "North-East",
    favorableWindow: "07:30 AM - 09:30 AM",
    mantra: "ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः",
    focus: "Higher philosophy, spiritual wisdom, mentorship, teaching, and moral clarity.",
  },
  Capricorn: {
    luckyColor: "Navy Blue / Charcoal Grey",
    luckyNumber: 8,
    luckyDirection: "South",
    favorableWindow: "05:00 PM - 07:00 PM",
    mantra: "ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः",
    focus: "Patience, disciplined duty, structural foundations, career stamina, and long-range goals.",
  },
  Aquarius: {
    luckyColor: "Electric Blue / Cyan",
    luckyNumber: 8,
    luckyDirection: "West",
    favorableWindow: "01:00 PM - 03:00 PM",
    mantra: "ॐ शं शनैश्चराय नमः",
    focus: "Social innovation, collective welfare, visionary ideas, networking, and detachment.",
  },
  Pisces: {
    luckyColor: "Saffron Yellow / Sea Foam",
    luckyNumber: 3,
    luckyDirection: "North-East",
    favorableWindow: "05:30 AM - 07:30 AM",
    mantra: "ॐ बृं बृहस्पतये नमः",
    focus: "Meditation, compassionate service, artistic intuition, dreams, and spiritual surrender.",
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function offsetDateStr(dateStr, deltaDays) {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().split("T")[0];
}

export default function DailyAstrologyDashboard({ initialTab = "overview" }) {
  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [selectedCity, setSelectedCity] = useState(PRESET_CITIES[0]);
  const [selectedDate, setSelectedDate] = useState(getTodayIsoDate);
  const [language, setLanguage] = useState("en"); // "en" or "hi"
  const [selectedRashi, setSelectedRashi] = useState("Taurus");

  // Dynamic API state for Dashboard & Panchang
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [panchangData, setPanchangData] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [transitsData, setTransitsData] = useState(null);

  // Choghadiya tab state
  const [choghadiyaTab, setChoghadiyaTab] = useState("day");

  // Muhurta Checker interactive state
  const [taskQuery, setTaskQuery] = useState("Start a new project");
  const [taskEvaluating, setTaskEvaluating] = useState(false);
  const [taskResult, setTaskResult] = useState(null);
  const [taskError, setTaskError] = useState(null);

  // Custom Location Modal for header selector
  const [showCustomCityModal, setShowCustomCityModal] = useState(false);
  const [showKundliLocationModal, setShowKundliLocationModal] = useState(false);
  const [customCityForm, setCustomCityForm] = useState({
    name: "Custom Location",
    lat: "28.6139",
    lon: "77.2090",
    tz: "5.5",
    tzStr: "Asia/Kolkata",
  });

  // Panchang Shastric Knowledge Modal
  const [knowledgeModalState, setKnowledgeModalState] = useState({
    isOpen: false,
    elementKey: "tithi",
    data: null,
  });

  // Kundli Calculator Form & State
  const [kundliSubTab, setKundliSubTab] = useState("calculator"); // "calculator" | "transits"
  const [kundliForm, setKundliForm] = useState({
    name: "Seeker",
    dob: "2001-02-24",
    tob: "07:22",
    place: "New Delhi, India",
    isCustomPlace: false,
    customPlaceName: "",
    customLat: "28.6139",
    customLon: "77.2090",
    customTz: "+05:30",
    gender: "male",
  });
  const [chartResult, setChartResult] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);

  // Remedies & Puja State
  const [remediesList, setRemediesList] = useState([]);
  const [remediesLoading, setRemediesLoading] = useState(false);
  const [remediesActionMsg, setRemediesActionMsg] = useState("");
  const [copiedMantraId, setCopiedMantraId] = useState(null);

  // Kundalini Modules State
  const [kundaliniModules, setKundaliniModules] = useState([]);
  const [kundaliniLoading, setKundaliniLoading] = useState(false);
  const [kundaliniActionMsg, setKundaliniActionMsg] = useState("");

  // Horoscope Knowledge Explorer Target State
  const [explorerTarget, setExplorerTarget] = useState(null);

  const isHi = language === "hi";

  // Sidebar navigation definition (all 9 options work inside the dashboard)
  const sidebarItems = useMemo(
    () => [
      { id: "overview", label: isHi ? "दैनिक परिदृश्य" : "Daily Overview", icon: Sparkles },
      { id: "family", label: isHi ? "पारिवारिक कुंडली" : "Family Circle", icon: Users },
      { id: "calendar", label: isHi ? "पर्व व व्रत कैलेंडर" : "Festival & Vrata Calendar", icon: Calendar },
      { id: "panchang", label: isHi ? "पंचांग" : "Panchang", icon: Sun },
      { id: "horoscope", label: isHi ? "आज का राशिफल" : "Today's Horoscope", icon: Compass },
      { id: "choghadiya", label: isHi ? "चौघड़िया" : "Choghadiya", icon: Clock },
      { id: "muhurta", label: isHi ? "मुहूर्त जांचक" : "Muhurta Checker", icon: CheckCircle2 },
      { id: "kundli", label: isHi ? "कुंडली व गोचर" : "Kundli & Transit", icon: Layers },
      { id: "remedies", label: isHi ? "वैदिक उपाय व पूजा" : "Vedic Remedies & Puja", icon: Heart },
      { id: "kundalini", label: isHi ? "कुंडलिनी व चक्र" : "Kundalini & Chakras", icon: ShieldCheck },
      { id: "numerology", label: isHi ? "वैदिक अंक ज्योतिष" : "Vedic Numerology", icon: Award },
      { id: "explorer", label: isHi ? "ज्ञान अन्वेषक" : "Horoscope Knowledge Explorer", icon: Network },
    ],
    [isHi]
  );

  // Synchronize Tab with URL search parameters and browser history
  const updateTab = useCallback(
    (newTab) => {
      setSelectedTab(newTab);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", newTab);
        window.history.pushState({}, "", url.toString());
      }
    },
    []
  );

  // Open Horoscope Knowledge Explorer focusing on a specific element
  const openInExplorer = useCallback(
    (targetSlug) => {
      setExplorerTarget(targetSlug || null);
      updateTab("explorer");
    },
    [updateTab]
  );

  useEffect(() => {
    const handlePopState = () => {
      const search = new URLSearchParams(window.location.search);
      const t = search.get("tab");
      if (t && sidebarItems.some((item) => item.id === t)) {
        setSelectedTab(t);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [sidebarItems]);

  // Fetch real astronomical daily report
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        date: selectedDate,
        lat: selectedCity.lat.toString(),
        lon: selectedCity.lon.toString(),
        tz: selectedCity.tz.toString(),
        timezone: selectedCity.tzStr,
        language: language,
      });

      const res = await fetch(`/api/astrology/daily?${params}`);
      if (!res.ok) {
        throw new Error(`Failed to load astrology data (HTTP ${res.status})`);
      }
      const data = await res.json();
      setPanchangData(data.panchang || null);
      setReportData(data.report || null);
      setTransitsData(data.report?.transits || null);
    } catch (err) {
      console.error("DailyAstrologyDashboard fetch error:", err);
      setError(err.message || "Failed to load live data");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedCity, language]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Fetch Remedies when Remedies tab is selected or opened
  const fetchRemedies = useCallback(async () => {
    setRemediesLoading(true);
    try {
      const res = await fetch("/api/astrology/daily-guidance");
      if (res.ok) {
        const data = await res.json();
        setRemediesList(data.guidance?.recommendedPractices || []);
      }
    } catch (err) {
      console.error("Failed to load remedies:", err);
    } finally {
      setRemediesLoading(false);
    }
  }, []);

  // Fetch Kundalini Modules when Kundalini tab is selected or opened
  const fetchKundalini = useCallback(async () => {
    setKundaliniLoading(true);
    try {
      const res = await fetch("/api/spirituality/kundalini");
      if (res.ok) {
        const data = await res.json();
        setKundaliniModules(data.modules || []);
      }
    } catch (err) {
      console.error("Failed to load kundalini modules:", err);
    } finally {
      setKundaliniLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTab === "remedies" && remediesList.length === 0) {
      fetchRemedies();
    }
    if (selectedTab === "kundalini" && kundaliniModules.length === 0) {
      fetchKundalini();
    }
  }, [selectedTab, remediesList.length, kundaliniModules.length, fetchRemedies, fetchKundalini]);

  // Muhurta Task Evaluator handler
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
          date: selectedDate,
          lat: selectedCity.lat,
          lon: selectedCity.lon,
          tz: selectedCity.tz,
          timezone: selectedCity.tzStr,
          language: language,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to evaluate task");
      setTaskResult(data.evaluation);
    } catch (err) {
      setTaskError(err.message || "Evaluation unavailable");
    } finally {
      setTaskEvaluating(false);
    }
  };

  // Run baseline evaluation for current task query once data loads
  useEffect(() => {
    if (panchangData && !taskResult && !taskEvaluating) {
      handleEvaluateTask(taskQuery);
    }
  }, [panchangData]);

  // Kundli Calculator Submit Handler
  const handleCalculateKundli = async (e) => {
    if (e) e.preventDefault();
    if (!kundliForm.dob || !kundliForm.tob) {
      setChartError("Please provide both Date of Birth and Time of Birth.");
      return;
    }
    setChartLoading(true);
    setChartError(null);
    try {
      let placeName = kundliForm.place;
      let lat = 28.6139;
      let lon = 77.2090;
      let tz = "+05:30";

      if (kundliForm.isCustomPlace || kundliForm.place === "__custom__") {
        placeName = (kundliForm.customPlaceName || "").trim() || "Custom Location";
        lat = parseFloat(kundliForm.customLat);
        lon = parseFloat(kundliForm.customLon);
        tz = (kundliForm.customTz || "+05:30").trim();

        if (isNaN(lat) || lat < -90 || lat > 90) {
          throw new Error("Please provide a valid latitude between -90° and +90°.");
        }
        if (isNaN(lon) || lon < -180 || lon > 180) {
          throw new Error("Please provide a valid longitude between -180° and +180°.");
        }
      } else {
        const matchedCity =
          PRESET_CITIES.find(
            (c) => c.name.toLowerCase() === kundliForm.place.toLowerCase()
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
          name: kundliForm.name || "Seeker",
          birthDate: kundliForm.dob,
          birthTime: kundliForm.tob,
          birthPlace: placeName,
          latitude: lat,
          longitude: lon,
          timezone: tz,
          gender: kundliForm.gender,
          language: "en",
          saveProfile: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Calculation failed");
      setChartResult(data.chart);
    } catch (err) {
      console.error("Kundli calculation error:", err);
      setChartError(err.message || "Failed to calculate birth chart");
    } finally {
      setChartLoading(false);
    }
  };

  // Remedies Practice Action Handler (Mark Complete, Bookmark)
  const handleRemedyAction = async (remedyId, action) => {
    try {
      const res = await fetch("/api/astrology/daily-guidance/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          remedyId,
          practiceDate: selectedDate,
          action,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setRemediesActionMsg("Please sign in to save or complete practice records.");
          setTimeout(() => setRemediesActionMsg(""), 4000);
          return;
        }
        throw new Error(data.error || "Action failed");
      }
      // Update local state
      setRemediesList((prev) =>
        prev.map((item) => {
          if (item.id === remedyId) {
            if (action === "complete") return { ...item, isCompleted: true };
            if (action === "uncomplete") return { ...item, isCompleted: false };
            if (action === "bookmark") return { ...item, isBookmarked: true };
            if (action === "unbookmark") return { ...item, isBookmarked: false };
          }
          return item;
        })
      );
      setRemediesActionMsg(data.message || "Updated successfully");
      setTimeout(() => setRemediesActionMsg(""), 3000);
    } catch (err) {
      setRemediesActionMsg(err.message || "Action failed");
      setTimeout(() => setRemediesActionMsg(""), 3500);
    }
  };

  // Kundalini Progress Action Handler
  const handleKundaliniAction = async (moduleId, action) => {
    try {
      const res = await fetch("/api/spirituality/kundalini/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          action,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setKundaliniActionMsg("Please sign in to track your Kundalini learning progress.");
          setTimeout(() => setKundaliniActionMsg(""), 4000);
          return;
        }
        throw new Error(data.error || "Action failed");
      }
      setKundaliniModules((prev) =>
        prev.map((mod) => {
          if (mod.id === moduleId) {
            if (action === "complete") return { ...mod, isCompleted: true };
            if (action === "uncomplete") return { ...mod, isCompleted: false };
            if (action === "bookmark") return { ...mod, isBookmarked: true };
            if (action === "unbookmark") return { ...mod, isBookmarked: false };
          }
          return mod;
        })
      );
      setKundaliniActionMsg(data.message || "Progress saved");
      setTimeout(() => setKundaliniActionMsg(""), 3000);
    } catch (err) {
      setKundaliniActionMsg(err.message || "Action failed");
      setTimeout(() => setKundaliniActionMsg(""), 3500);
    }
  };

  // Copy Mantra to clipboard
  const handleCopyMantra = (id, text) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMantraId(id);
      setTimeout(() => setCopiedMantraId(null), 2500);
    }
  };

  // Derived transit house for chosen Rashi
  const transitHouseInfo = useMemo(() => {
    if (!panchangData?.moonSign?.name) return { house: 1, nature: "neutral", text: "Moon transits your sign" };
    const rashiObj = RASHIS.find((r) => r.id === selectedRashi) || RASHIS[1];
    const moonObj = RASHIS.find((r) => r.id === panchangData.moonSign.name || r.nameEn === panchangData.moonSign.name) || RASHIS[0];
    const house = ((moonObj.index - rashiObj.index + 12) % 12) + 1;

    const houseMeanings = {
      1: { nature: "positive", textEn: "1st House (Vitality, Mental Alertness & Fresh Starts)", textHi: "प्रथम भाव (आत्मबल, नव-आरंभ व मानसिक स्पष्टता)" },
      2: { nature: "neutral", textEn: "2nd House (Financial Accounting, Family & Speech)", textHi: "द्वितीय भाव (धन संचय, वाणी व पारिवारिक चिंतन)" },
      3: { nature: "positive", textEn: "3rd House (Courage, Initiative, Short Travel & Siblings)", textHi: "तृतीय भाव (पराक्रम, लघु यात्रा व पुरुषार्थ में सफलता)" },
      4: { nature: "neutral", textEn: "4th House (Domestic Peace, Introspection & Vehicles)", textHi: "चतुर्थ भाव (गृह सुख, आत्म-चिंतन व वाहन संबंधित कार्य)" },
      5: { nature: "positive", textEn: "5th House (Creative Intellect, Mantras & Learning)", textHi: "पंचम भाव (सृजनात्मक बुद्धि, मंत्र साधना व विद्या)" },
      6: { nature: "positive", textEn: "6th House (Overcoming Obstacles, Diligence & Healing)", textHi: "षष्ठ भाव (शत्रु-बाधा निवारण, स्वास्थ्य सुधार व विजय)" },
      7: { nature: "positive", textEn: "7th House (Partnerships, Harmony & Public Engagements)", textHi: "सप्तम भाव (साझेदारी, वैवाहिक सौहार्द व जनसंपर्क)" },
      8: { nature: "prudent", textEn: "8th House (Prudence Advised, Deep Research & Meditation)", textHi: "अष्टम भाव (सतर्कता, गहन अनुसंधान व आध्यात्मिक ध्यान)" },
      9: { nature: "positive", textEn: "9th House (Dharma, Fortune, Mentorship & Long Journeys)", textHi: "नवम भाव (धर्म, भाग्य वृद्धि, गुरु कृपा व पुण्य संचय)" },
      10: { nature: "positive", textEn: "10th House (Career Eminence, Executive Action & Honor)", textHi: "दशम भाव (कर्म क्षेत्र में सफलता, प्रतिष्ठा व नेतृत्व)" },
      11: { nature: "positive", textEn: "11th House (Financial Gains, Social Networking & Desires)", textHi: "एकादश भाव (लाभ, मित्रों का सहयोग व मनोरथ सिद्धि)" },
      12: { nature: "prudent", textEn: "12th House (Spiritual Daan, Rest, Expenses & Solitude)", textHi: "द्वादश भाव (दान-पुण्य, व्यय नियंत्रण, विश्राम व ध्यान)" },
    };

    return {
      house,
      ...houseMeanings[house],
    };
  }, [selectedRashi, panchangData]);

  return (
    <div className="bg-[#fcfaf5] min-h-screen py-6 sm:py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#ede5d6]/70">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c4903c]">
                {isHi ? "वैदिक ज्योतिष पंचांग" : "Vedic Astrology Portal"}
              </span>
              <span className="text-xs text-stone-300">•</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Lahiri Ayanamsha</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
              {isHi ? "दैनिक ज्योतिष डैशबोर्ड" : "Daily Astrology Dashboard"}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              {isHi
                ? "आज का प्रामाणिक पंचांग, चौघड़िया, राशिफल, मुहूर्त एवं आध्यात्मिक मार्गदर्शन"
                : "Your verified astronomical Vedic guidance, auspicious timings, and planetary alignments"}
            </p>
          </div>

          {/* Controls: Date, Location, Language Toggle */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Navigation */}
            <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#ede5d6] text-xs font-medium text-stone-700 shadow-2xs">
              <button
                type="button"
                onClick={() => setSelectedDate((d) => offsetDateStr(d, -1))}
                className="p-1 hover:bg-stone-100 rounded text-stone-500 transition cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1.5 px-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-xs text-stone-800 focus:outline-none cursor-pointer font-medium"
                />
              </div>
              <button
                type="button"
                onClick={() => setSelectedDate((d) => offsetDateStr(d, 1))}
                className="p-1 hover:bg-stone-100 rounded text-stone-500 transition cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* City Selector (Any place worldwide or curated presets) */}
            <div className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#ede5d6] text-xs font-medium text-stone-700 shadow-2xs">
              <MapPin className="w-3.5 h-3.5 text-[#c4903c]" />
              <select
                value={PRESET_CITIES.some((c) => c.name === selectedCity.name) ? selectedCity.name : "__custom__"}
                onChange={(e) => {
                  if (e.target.value === "__custom__") {
                    setShowCustomCityModal(true);
                  } else {
                    const match = PRESET_CITIES.find((c) => c.name === e.target.value) || PRESET_CITIES[0];
                    setSelectedCity(match);
                  }
                }}
                className="bg-transparent text-xs text-stone-700 focus:outline-none cursor-pointer pr-1 max-w-[180px] truncate"
                title={selectedCity.name}
              >
                {!PRESET_CITIES.some((c) => c.name === selectedCity.name) && (
                  <option value="__custom__">📍 {selectedCity.name} (Custom)</option>
                )}
                <option value="__custom__">🌐 + {isHi ? "अन्य स्थान जोड़ें..." : "Add Custom Place..."}</option>
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
              <button
                type="button"
                onClick={() => setShowCustomCityModal(true)}
                className="text-[11px] text-[#c4903c] hover:text-[#966724] font-bold pl-1 border-l border-[#ede5d6] cursor-pointer"
                title={isHi ? "विश्व का कोई भी स्थान जोड़ें" : "Add any place in the world"}
              >
                +
              </button>
            </div>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLanguage((l) => (l === "en" ? "hi" : "en"))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#ede5d6] text-xs font-bold text-stone-700 hover:bg-[#faf7f0] shadow-2xs transition cursor-pointer"
              title="Toggle Hindi / English"
            >
              <Languages className="w-3.5 h-3.5 text-[#c4903c]" />
              <span>{isHi ? "English" : "हिंदी"}</span>
            </button>

            {/* Link to Personal Astrology Dashboard */}
            <Link
              href="/astrology/my-dashboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#13382c] text-white hover:bg-[#1a4a3b] text-xs font-semibold shadow-2xs transition cursor-pointer"
              title={isHi ? "मेरी व्यक्तिगत ज्योतिषीय कुंडली व गोचर" : "My Personal Astrology & Kundli"}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#c4903c]" />
              <span>{isHi ? "मेरी कुंडली" : "My Kundli"}</span>
            </Link>
          </div>
        </div>

        {/* Custom Location Modal for Header Selector (Country > State > Town Hierarchy & Auto-calculation) */}
        <WorldLocationModal
          isOpen={showCustomCityModal}
          onClose={() => setShowCustomCityModal(false)}
          onApply={(location) => {
            setSelectedCity(location);
            setCustomCityForm({
              name: location.name,
              lat: String(location.lat),
              lon: String(location.lon),
              tz: String(location.tz),
              tzStr: location.tzStr,
            });
            setShowCustomCityModal(false);
          }}
          initialLocation={selectedCity}
          isHi={isHi}
        />

        {/* Dedicated Location Modal for Kundli Form */}
        <WorldLocationModal
          isOpen={showKundliLocationModal}
          onClose={() => setShowKundliLocationModal(false)}
          onApply={(location) => {
            setKundliForm((prev) => ({
              ...prev,
              isCustomPlace: true,
              place: "__custom__",
              customPlaceName: location.name,
              customLat: String(location.lat),
              customLon: String(location.lon),
              customTz: location.tzStr || formatTzOffset(location.tz),
            }));
            setShowKundliLocationModal(false);
          }}
          initialLocation={{
            name: kundliForm.customPlaceName || kundliForm.place,
            lat: kundliForm.customLat,
            lon: kundliForm.customLon,
            tz: 5.5,
          }}
          isHi={isHi}
          title={isHi ? "कुंडली जन्म स्थान चुनें" : "Select Kundli Birth Location"}
          subtitle={isHi ? "देश, राज्य व नगर से अक्षांश व देशांतर की स्वतः गणना।" : "Country > State > Town with automatic coordinates & timezone for exact Kundli."}
        />

        {/* Panchang Shastric Knowledge Modal */}
        <PanchangKnowledgeModal
          isOpen={knowledgeModalState.isOpen}
          onClose={() => setKnowledgeModalState((prev) => ({ ...prev, isOpen: false }))}
          elementKey={knowledgeModalState.elementKey}
          currentData={knowledgeModalState.data}
          isHi={isHi}
          onOpenExplorer={openInExplorer}
        />

        {/* Layout Grid: Sidebar + Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar Navigation */}
          <aside className="lg:col-span-3 xl:col-span-3 space-y-4">
            <div className="bg-white rounded-2xl border border-[#ede5d6] p-2.5 shadow-2xs space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = selectedTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => updateTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition text-left cursor-pointer ${
                      isActive
                        ? "bg-[#13382c] text-white shadow-xs font-semibold"
                        : "text-stone-700 hover:bg-[#faf7f0] hover:text-[#13382c]"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-[#d4a359]" : "text-stone-400"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Complete Kundli Link Card */}
            <div className="hidden lg:block bg-[#faf5eb] rounded-2xl border border-[#ede2cc] p-4 text-xs space-y-2">
              <div className="font-serif font-bold text-stone-900 text-sm">
                {isHi ? "सम्पूर्ण जन्म कुण्डली" : "Complete Kundli Calculator"}
              </div>
              <p className="text-stone-600 leading-relaxed text-[11px]">
                {isHi
                  ? "लग्न, भाव, विंशोत्तरी दशा व उच्च खगोलीय सटीकता युक्त वैदिक जन्मपत्रिका तैयार करें।"
                  : "Compute Vedic birth chart, planetary degrees, Bhavas & Vimshottari Dasha with high astronomical accuracy."}
              </p>
              <button
                type="button"
                onClick={() => {
                  updateTab("kundli");
                  setKundliSubTab("calculator");
                }}
                className="inline-flex items-center gap-1 font-semibold text-[#13382c] hover:underline pt-1 text-xs cursor-pointer"
              >
                <span>{isHi ? "कुण्डली इंजन खोलें" : "Open Kundli Engine"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </aside>

          {/* Main Dashboard Content Area */}
          <main className="lg:col-span-9 xl:col-span-9 min-h-[500px]">
            {loading ? (
              <div className="bg-white rounded-2xl border border-[#ede5d6] p-12 text-center shadow-2xs flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#c4903c]" />
                <p className="text-sm font-serif font-bold text-stone-800">
                  {isHi ? "खगोलीय पंचांग की गणना हो रही है..." : "Computing verified astronomical Panchang..."}
                </p>
                <p className="text-xs text-stone-400">
                  {selectedCity.name} • {selectedDate}
                </p>
              </div>
            ) : error ? (
              <div className="bg-red-50 rounded-2xl border border-red-200 p-6 text-red-900 space-y-3">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>{isHi ? "पंचांग गणना में त्रुटि" : "Unable to load astronomy calculations"}</span>
                </div>
                <p className="text-xs text-red-700">{error}</p>
                <button
                  onClick={fetchReport}
                  className="text-xs font-semibold bg-white border border-red-300 px-3 py-1.5 rounded-lg text-red-800 hover:bg-red-50 transition cursor-pointer"
                >
                  {isHi ? "पुनः प्रयास करें" : "Retry Calculation"}
                </button>
              </div>
            ) : (
              <>
                {/* ------------------------------------------------------------- */}
                {/* TAB 1: DAILY OVERVIEW                                         */}
                {/* ------------------------------------------------------------- */}
                {selectedTab === "overview" && (
                  <div className="space-y-6">
                    {/* Family Astrology Circle & Member Switcher */}
                    <FamilyAstrologyCircle
                      isHi={isHi}
                      selectedRashi={selectedRashi}
                      onSelectRashi={(rashi) => setSelectedRashi(rashi)}
                      currentPanchang={panchangData}
                      selectedDate={selectedDate}
                    />

                    {/* Top 2 Cards: Today's Focus & Your Rashi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Today's Focus */}
                      <div className="bg-white rounded-2xl border border-[#ede5d6] p-5 shadow-2xs flex flex-col justify-between space-y-3">
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-[#eaf4ef] border border-[#cbe6d7] flex items-center justify-center shrink-0">
                            <Sun className="w-6 h-6 text-[#196b49]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                                {isHi ? "दैनिक ऊर्जा" : "Today's Focus"}
                              </span>
                            </div>
                            <h2 className="font-serif font-bold text-base text-stone-900">
                              {panchangData?.vara?.en} ({panchangData?.vara?.hi}) — Lord {panchangData?.vara?.lord}
                            </h2>
                            <p className="text-xs text-stone-600 leading-relaxed mt-1">
                              {reportData?.dailySummary?.[language] ||
                                `Auspicious day governed by ${panchangData?.vara?.lord}. Ideal for focused duties, spiritual disciplines, and harmonizing commitments under ${panchangData?.nakshatra?.name} Nakshatra.`}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eaf4ef] text-[#196b49] border border-[#cbe6d7]">
                            <Check className="w-3 h-3" />
                            <span>Vara Lord: {panchangData?.vara?.lord}</span>
                          </span>
                          <button
                            onClick={() => updateTab("remedies")}
                            className="text-xs text-[#13382c] font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isHi ? "उपाय देखें" : "View Remedies"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Your Rashi Card with 12 Rashi Switcher */}
                      <div className="bg-white rounded-2xl border border-[#ede5d6] p-5 shadow-2xs flex flex-col justify-between space-y-3">
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-[#fdf5e8] border border-[#fae4bd] flex items-center justify-center shrink-0 text-xl font-bold text-[#c4903c]">
                            {RASHIS.find((r) => r.id === selectedRashi)?.symbol || "♈"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                                {isHi ? "आपकी राशि चुनें" : "Your Selected Sign"}
                              </span>
                              <select
                                value={selectedRashi}
                                onChange={(e) => setSelectedRashi(e.target.value)}
                                className="bg-[#faf8f4] border border-[#eee5d6] rounded-lg text-xs font-semibold text-stone-800 px-2 py-0.5 focus:outline-none cursor-pointer"
                              >
                                {RASHIS.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.symbol} {r.nameEn} ({r.nameHi})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <h2 className="font-serif font-bold text-base text-stone-900 mt-0.5">
                              {selectedRashi} ({RASHI_NAMES_HI[selectedRashi] || selectedRashi})
                            </h2>
                            <p className="text-xs text-stone-600 leading-relaxed mt-1">
                              {isHi ? transitHouseInfo.textHi : transitHouseInfo.textEn}.
                              {" "}
                              {RASHI_DETAILS[selectedRashi]?.focus}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                          <span className="text-[11px] text-stone-500 font-medium">
                            {isHi ? "शुभ रंग: " : "Lucky Color: "}
                            <span className="text-stone-800 font-bold">{RASHI_DETAILS[selectedRashi]?.luckyColor?.split("/")[0]}</span>
                          </span>
                          <button
                            onClick={() => updateTab("horoscope")}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#13382c] hover:underline cursor-pointer"
                          >
                            <span>{isHi ? "विस्तृत राशिफल" : "Detailed Horoscope"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Panchang Details 5 Pillars */}
                    <div className="bg-white rounded-2xl border border-[#ede5d6] p-5 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="font-serif font-bold text-lg text-stone-900">
                            {isHi ? "दैनिक पंचांग विवरण" : "Panchang Details"}
                          </h2>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {panchangData?.vara?.en}, {selectedDate} • {selectedCity.name}
                          </p>
                        </div>
                        <button
                          onClick={() => updateTab("panchang")}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#13382c] hover:underline cursor-pointer"
                        >
                          <span>{isHi ? "सम्पूर्ण पंचांग देखें" : "View Full Panchang"}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* 5 Cards Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {/* Tithi */}
                        <div
                          onClick={() =>
                            setKnowledgeModalState({
                              isOpen: true,
                              elementKey: "tithi",
                              data: {
                                name: `${panchangData?.tithi?.paksha || ""} ${panchangData?.tithi?.name || ""}`,
                                sub: panchangData?.tithi?.devanagari,
                                status: panchangData?.tithi?.paksha === "Shukla" ? "Shukla Paksha (Waxing)" : "Krishna Paksha (Waning)",
                              },
                            })
                          }
                          className="bg-[#faf8f4] border border-[#eee5d6] hover:border-[#c4903c] rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition shadow-2xs hover:shadow-xs group"
                          title="Click to view full Vedic Tithi knowledge"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-semibold text-stone-400">Tithi</span>
                            <span className="text-[10px] font-bold text-[#c4903c] group-hover:underline">ज्ञान ℹ️</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Moon className="w-4 h-4 text-[#c4903c] shrink-0" />
                            <div className="min-w-0">
                              <div className="font-serif font-bold text-sm text-stone-900 truncate">
                                {panchangData?.tithi?.paksha} {panchangData?.tithi?.name}
                              </div>
                              <div className="text-[11px] text-stone-500 font-medium truncate">
                                {panchangData?.tithi?.devanagari}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Nakshatra */}
                        <div
                          onClick={() =>
                            setKnowledgeModalState({
                              isOpen: true,
                              elementKey: "nakshatra",
                              data: {
                                name: panchangData?.nakshatra?.name,
                                sub: `${panchangData?.nakshatra?.devanagari || ""} (Pada ${panchangData?.nakshatra?.pada || 1})`,
                                status: "Cosmic Star Mansion",
                              },
                            })
                          }
                          className="bg-[#faf8f4] border border-[#eee5d6] hover:border-[#c4903c] rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition shadow-2xs hover:shadow-xs group"
                          title="Click to view Nakshatra deity & attributes"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-semibold text-stone-400">Nakshatra</span>
                            <span className="text-[10px] font-bold text-[#c4903c] group-hover:underline">ज्ञान ℹ️</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Sparkles className="w-4 h-4 text-[#c4903c] shrink-0" />
                            <div className="min-w-0">
                              <div className="font-serif font-bold text-sm text-stone-900 truncate">
                                {panchangData?.nakshatra?.name}
                              </div>
                              <div className="text-[11px] text-stone-500 font-medium truncate">
                                {panchangData?.nakshatra?.devanagari} (Pada {panchangData?.nakshatra?.pada})
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Yoga */}
                        <div
                          onClick={() =>
                            setKnowledgeModalState({
                              isOpen: true,
                              elementKey: "yoga",
                              data: {
                                name: panchangData?.yoga?.name,
                                sub: panchangData?.yoga?.devanagari,
                                status: "Solar-Lunar Harmony",
                              },
                            })
                          }
                          className="bg-[#faf8f4] border border-[#eee5d6] hover:border-[#c4903c] rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition shadow-2xs hover:shadow-xs group"
                          title="Click to view Yoga effect & auspiciousness"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-semibold text-stone-400">Yoga</span>
                            <span className="text-[10px] font-bold text-[#c4903c] group-hover:underline">ज्ञान ℹ️</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Sun className="w-4 h-4 text-[#c4903c] shrink-0" />
                            <div className="min-w-0">
                              <div className="font-serif font-bold text-sm text-stone-900 truncate">
                                {panchangData?.yoga?.name}
                              </div>
                              <div className="text-[11px] text-stone-500 font-medium truncate">
                                {panchangData?.yoga?.devanagari}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Karana */}
                        <div
                          onClick={() =>
                            setKnowledgeModalState({
                              isOpen: true,
                              elementKey: "karana",
                              data: {
                                name: panchangData?.karana?.name,
                                sub: panchangData?.karana?.devanagari,
                                status: "Half-Tithi Action Window",
                              },
                            })
                          }
                          className="bg-[#faf8f4] border border-[#eee5d6] hover:border-[#c4903c] rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition shadow-2xs hover:shadow-xs group"
                          title="Click to view Karana guidelines & Bhadra check"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-semibold text-stone-400">Karana</span>
                            <span className="text-[10px] font-bold text-[#c4903c] group-hover:underline">ज्ञान ℹ️</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Layers className="w-4 h-4 text-[#c4903c] shrink-0" />
                            <div className="min-w-0">
                              <div className="font-serif font-bold text-sm text-stone-900 truncate">
                                {panchangData?.karana?.name}
                              </div>
                              <div className="text-[11px] text-stone-500 font-medium truncate">
                                {panchangData?.karana?.devanagari}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Vara */}
                        <div
                          onClick={() =>
                            setKnowledgeModalState({
                              isOpen: true,
                              elementKey: "vara",
                              data: {
                                name: `${panchangData?.vara?.en || ""} (${panchangData?.vara?.hi || ""})`,
                                sub: `Lord ${panchangData?.vara?.lord || "Mars"}`,
                                status: "Weekday Ruler",
                              },
                            })
                          }
                          className="bg-[#faf8f4] border border-[#eee5d6] hover:border-[#c4903c] rounded-xl p-3.5 flex flex-col justify-between cursor-pointer transition shadow-2xs hover:shadow-xs group"
                          title="Click to view Weekday Lord & remedies"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-semibold text-stone-400">Vara</span>
                            <span className="text-[10px] font-bold text-[#c4903c] group-hover:underline">ज्ञान ℹ️</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="w-4 h-4 text-[#c4903c] shrink-0" />
                            <div className="min-w-0">
                              <div className="font-serif font-bold text-sm text-stone-900 truncate">
                                {panchangData?.vara?.en}
                              </div>
                              <div className="text-[11px] text-stone-500 font-medium truncate">
                                {panchangData?.vara?.hi}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sub-bar: Sunrise, Sunset, Rahu Kaal, Moon Sign */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-stone-100 text-xs">
                        <div>
                          <span className="text-[10px] text-stone-400 block">{isHi ? "सूर्योदय" : "Sunrise"}</span>
                          <span className="font-semibold text-stone-800">{panchangData?.sunrise?.local || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block">{isHi ? "सूर्यास्त" : "Sunset"}</span>
                          <span className="font-semibold text-stone-800">{panchangData?.sunset?.local || "—"}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block">{isHi ? "राहुकाल (वर्जित)" : "Rahu Kaal"}</span>
                          <span className="font-semibold text-amber-900">
                            {panchangData?.rahuKaal ? `${panchangData.rahuKaal.startLocal} – ${panchangData.rahuKaal.endLocal}` : "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block">{isHi ? "चंद्र राशि" : "Moon Sign"}</span>
                          <span className="font-semibold text-stone-800">
                            {panchangData?.moonSign?.name} ({panchangData?.moonSign?.sanskritName})
                          </span>
                        </div>
                      </div>

                      {/* Auspicious & Inauspicious Muhurta Highlights Bar */}
                      <div className="bg-[#faf8f4] border border-[#ede5d6] rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-stone-600 font-semibold text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-[#c4903c]" />
                          <span>{isHi ? "आज के मुख्य मुहूर्त काल:" : "Key Timings Today (Click to Learn):"}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Abhijit Muhurta */}
                          {panchangData?.abhijitMuhurta && (
                            <span
                              onClick={() =>
                                setKnowledgeModalState({
                                  isOpen: true,
                                  elementKey: "muhurta",
                                  data: {
                                    name: isHi ? "अभिजित मुहूर्त (अति शुभ)" : "Abhijit Muhurta (Most Auspicious)",
                                    sub: `${panchangData.abhijitMuhurta.startLocal} – ${panchangData.abhijitMuhurta.endLocal} (${panchangData.abhijitMuhurta.durationMinutes} min)`,
                                    status: panchangData.abhijitMuhurta.isAuspicious ? "Auspicious ✓" : "Restricted on Wed",
                                  },
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold cursor-pointer hover:bg-emerald-200 transition text-[11px] flex items-center gap-1"
                              title="Click for Abhijit Muhurta details"
                            >
                              <span>
                                🟢 {isHi ? "अभिजित" : "Abhijit"}: {panchangData.abhijitMuhurta.startLocal} – {panchangData.abhijitMuhurta.endLocal}
                              </span>
                            </span>
                          )}

                          {/* Amrit Kaal */}
                          {panchangData?.amritKaal && (
                            <span
                              onClick={() =>
                                setKnowledgeModalState({
                                  isOpen: true,
                                  elementKey: "muhurta",
                                  data: {
                                    name: isHi ? "अमृत काल (अमृत योग)" : "Amrit Kaal (Nectar Window)",
                                    sub: `${panchangData.amritKaal.startLocal} – ${panchangData.amritKaal.endLocal} (${panchangData.amritKaal.durationMinutes} min)`,
                                    status: "Good",
                                  },
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 font-semibold cursor-pointer hover:bg-amber-200 transition text-[11px]"
                              title="Click for Amrit Kaal details"
                            >
                              <span>
                                🟡 {isHi ? "अमृत काल" : "Amrit Kaal"}: {panchangData.amritKaal.startLocal} – {panchangData.amritKaal.endLocal}
                              </span>
                            </span>
                          )}

                          {/* Brahma Muhurta */}
                          {panchangData?.brahmaMuhurta && (
                            <span
                              onClick={() =>
                                setKnowledgeModalState({
                                  isOpen: true,
                                  elementKey: "muhurta",
                                  data: {
                                    name: isHi ? "ब्रह्म मुहूर्त (साधना काल)" : "Brahma Muhurta (Pre-dawn Window)",
                                    sub: `${panchangData.brahmaMuhurta.startLocal} – ${panchangData.brahmaMuhurta.endLocal} (${panchangData.brahmaMuhurta.durationMinutes} min)`,
                                    status: "Spiritual",
                                  },
                                })
                              }
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 font-semibold cursor-pointer hover:bg-indigo-100 transition text-[11px]"
                              title="Click for Brahma Muhurta details"
                            >
                              <span>
                                🔵 {isHi ? "ब्रह्म मुहूर्त" : "Brahma Muhurta"}: {panchangData.brahmaMuhurta.startLocal} – {panchangData.brahmaMuhurta.endLocal}
                              </span>
                            </span>
                          )}

                          {/* Rahu Kaal Warning */}
                          <span
                            onClick={() =>
                              setKnowledgeModalState({
                                isOpen: true,
                                elementKey: "muhurta",
                                data: {
                                  name: isHi ? "राहु काल (वर्जित समय)" : "Rahu Kaal (Period of Caution)",
                                  sub: panchangData?.rahuKaal ? `${panchangData.rahuKaal.startLocal} – ${panchangData.rahuKaal.endLocal}` : "Avoid starting major new works",
                                  status: "Caution ⚠️",
                                },
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-semibold cursor-pointer hover:bg-rose-100 transition text-[11px]"
                            title="Click for Rahu Kaal details"
                          >
                            <span>🔴 {isHi ? `राहुकाल: ${panchangData?.rahuKaal?.startLocal || ""}` : `Rahu Kaal: ${panchangData?.rahuKaal?.startLocal || ""}`}</span>
                          </span>

                          {/* Brahma Muhurta */}
                          <span
                            onClick={() =>
                              setKnowledgeModalState({
                                isOpen: true,
                                elementKey: "muhurta",
                                data: {
                                  name: isHi ? "ब्रह्म मुहूर्त (साधना काल)" : "Brahma Muhurta (Meditation)",
                                  sub: "04:30 AM – 05:18 AM (1h 36m before Sunrise)",
                                  status: "Spiritual",
                                },
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-semibold cursor-pointer hover:bg-purple-100 transition text-[11px]"
                            title="Click for Brahma Muhurta details"
                          >
                            <span>🟣 {isHi ? "ब्रह्म मुहूर्त" : "Brahma Muhurta"}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom 3 Columns: Day Choghadiya, Will My Work Succeed?, Daily Remedies */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Column 1: Day Choghadiya */}
                      <div className="bg-white rounded-2xl border border-[#ede5d6] p-5 shadow-2xs flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-serif font-bold text-base text-stone-900">
                              {isHi ? "दिन का चौघड़िया" : "Day Choghadiya"}
                            </h3>
                            <span className="text-[10px] uppercase font-bold text-stone-400">8 Slots</span>
                          </div>
                          <div className="divide-y divide-stone-100 mt-3">
                            {panchangData?.choghadiya?.day?.slice(0, 4).map((slot, idx) => (
                              <div key={idx} className="py-2 flex items-center justify-between text-xs">
                                <span className="font-mono text-stone-600 font-medium">
                                  {slot.startLocal} - {slot.endLocal}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {slot.isActive && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  )}
                                  <span
                                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                      slot.quality === "good"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : slot.quality === "neutral"
                                        ? "bg-sky-100 text-sky-800"
                                        : "bg-red-50 text-red-700"
                                    }`}
                                  >
                                    {isHi ? slot.nameHi : slot.nameEn}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-100">
                          <button
                            onClick={() => updateTab("choghadiya")}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#13382c] hover:underline cursor-pointer"
                          >
                            <span>{isHi ? "सभी 16 चौघड़िया काल देखें" : "View All 16 Periods"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Column 2: Will My Work Succeed Today? */}
                      <div className="bg-white rounded-2xl border border-[#ede5d6] p-5 shadow-2xs flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="font-serif font-bold text-base text-stone-900">
                            {isHi ? "क्या आज मेरा काम बनेगा?" : "Will My Work Succeed Today?"}
                          </h3>

                          <div className="mt-3 space-y-2.5">
                            <div>
                              <label className="text-[11px] font-medium text-stone-400 block mb-1">
                                {isHi ? "कार्य या योजना चुनें" : "Select Task"}
                              </label>
                              <select
                                value={taskQuery}
                                onChange={(e) => {
                                  setTaskQuery(e.target.value);
                                  handleEvaluateTask(e.target.value);
                                }}
                                className="w-full text-xs bg-[#faf8f4] border border-[#eee5d6] rounded-xl px-3 py-2 font-medium text-stone-800 focus:outline-none"
                              >
                                <option value="Start a new business or tech project">Start a new project / business</option>
                                <option value="Sign contracts and legal agreements">Sign contracts & agreements</option>
                                <option value="Financial investment and buy gold">Financial transactions / investments</option>
                                <option value="Travel and long-distance journey">Travel & journey</option>
                                <option value="Purchase property or vehicle">Purchase vehicle or property</option>
                              </select>
                            </div>

                            {/* Result Box */}
                            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-1.5 min-h-[75px]">
                              {taskEvaluating ? (
                                <div className="flex items-center gap-2 text-xs text-stone-500 py-2">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                                  <span>{isHi ? "मुहूर्त व पंचांग का मिलान जारी..." : "Analyzing against Panchang..."}</span>
                                </div>
                              ) : taskResult ? (
                                <>
                                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                                    <div className="flex items-center gap-1.5">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                      <span>{isHi ? taskResult.verdict?.hi : taskResult.verdict?.en}</span>
                                    </div>
                                    <span className="text-amber-700 text-xs">
                                      {"★".repeat(taskResult.score || 3)}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-stone-600 leading-relaxed line-clamp-2">
                                    {isHi
                                      ? taskResult.optimalTimeWindow?.hi || taskResult.feasibilityAnalysis?.hi
                                      : taskResult.optimalTimeWindow?.en || taskResult.feasibilityAnalysis?.en}
                                  </p>
                                </>
                              ) : (
                                <p className="text-[11px] text-stone-500">Ready to evaluate.</p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                          <button
                            onClick={() => updateTab("muhurta")}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#13382c] hover:underline cursor-pointer"
                          >
                            <span>{isHi ? "गहन मुहूर्त जांचक" : "Open Muhurta Checker"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Column 3: Daily Remedies */}
                      <div className="bg-white rounded-2xl border border-[#ede5d6] p-5 shadow-2xs flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-serif font-bold text-base text-stone-900">
                              {isHi ? "दैनिक वैदिक उपाय" : "Daily Remedies"}
                            </h3>
                            <span className="text-[10px] font-bold text-[#c4903c] bg-[#faf5eb] px-2 py-0.5 rounded border border-[#ede2cc]">
                              {panchangData?.vara?.en}
                            </span>
                          </div>

                          <ul className="mt-3 space-y-2.5 text-xs text-stone-700">
                            <li className="flex items-start gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-[#faf5ec] flex items-center justify-center shrink-0 text-xs font-serif font-bold text-[#c4903c]">
                                ॐ
                              </span>
                              <span className="font-medium text-stone-800">
                                {RASHI_DETAILS[selectedRashi]?.mantra}
                              </span>
                            </li>
                            <li className="flex items-start gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-[#faf5ec] flex items-center justify-center shrink-0 text-xs font-serif font-bold text-[#c4903c]">
                                🪔
                              </span>
                              <span className="text-stone-600 leading-snug">
                                {panchangData?.vara?.lord} invocation and meditation.
                              </span>
                            </li>
                            <li className="flex items-start gap-2.5">
                              <span className="w-6 h-6 rounded-full bg-[#faf5ec] flex items-center justify-center shrink-0 text-xs font-serif font-bold text-[#c4903c]">
                                🌾
                              </span>
                              <span className="text-stone-600 leading-snug">
                                Sattvic conduct, gratitude, and charity to seekers.
                              </span>
                            </li>
                          </ul>
                        </div>

                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                          <button
                            onClick={() => updateTab("remedies")}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#13382c] hover:underline cursor-pointer"
                          >
                            <span>{isHi ? "सम्पूर्ण उपाय व पूजा" : "Full Remedies & Puja"}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB: FAMILY ASTROLOGY CIRCLE                                  */}
                {/* ------------------------------------------------------------- */}
                {selectedTab === "family" && (
                  <div className="space-y-6">
                    <FamilyAstrologyCircle
                      isHi={isHi}
                      selectedRashi={selectedRashi}
                      onSelectRashi={(rashi) => setSelectedRashi(rashi)}
                      currentPanchang={panchangData}
                      selectedDate={selectedDate}
                    />
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB: VEDIC CALENDAR & FESTIVALS                               */}
                {/* ------------------------------------------------------------- */}
                {selectedTab === "calendar" && (
                  <div className="space-y-6">
                    <VedicCalendarStudio initialTab="calendar" />
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 2: FULL PANCHANG DETAILS                                  */}
                {/* ------------------------------------------------------------- */}
                {selectedTab === "panchang" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-[#ede5d6] p-6 shadow-2xs space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-[#c4903c]">
                            {isHi ? "प्रामाणिक वैदिक पंचांग" : "Classical Vedic Almanac"}
                          </span>
                          <h2 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
                            {panchangData?.vara?.en} ({panchangData?.vara?.hi}) — {selectedDate}
                          </h2>
                          <p className="text-xs text-stone-500 mt-1">
                            Calculated for {selectedCity.name} ({selectedCity.tzStr}) using high-precision astronomical ephemeris.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                            Ayanamsha: {panchangData?.ayanamsa}° Lahiri
                          </span>
                        </div>
                      </div>

                      {/* 5 Pillars Detailed Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Tithi */}
                        <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#ede5d6] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-400 uppercase">Tithi (तिथि)</span>
                            <span className="text-xs font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                              {panchangData?.tithi?.paksha} Paksha
                            </span>
                          </div>
                          <p className="font-serif font-bold text-base text-stone-900">
                            {panchangData?.tithi?.name} ({panchangData?.tithi?.devanagari})
                          </p>
                          <p className="text-xs text-stone-600">
                            Elongation: {panchangData?.tithi?.elongation}° • Progress: {((panchangData?.tithi?.fractionElapsed || 0) * 100).toFixed(1)}%
                          </p>
                        </div>

                        {/* Nakshatra */}
                        <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#ede5d6] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-400 uppercase">Nakshatra (नक्षत्र)</span>
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                              Pada {panchangData?.nakshatra?.pada}
                            </span>
                          </div>
                          <p className="font-serif font-bold text-base text-stone-900">
                            {panchangData?.nakshatra?.name} ({panchangData?.nakshatra?.devanagari})
                          </p>
                          <p className="text-xs text-stone-600">
                            Lord: {panchangData?.nakshatra?.lord} • Degree: {panchangData?.nakshatra?.degreeInNakshatra}° in constellation
                          </p>
                        </div>

                        {/* Yoga */}
                        <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#ede5d6] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-400 uppercase">Yoga (योग)</span>
                            <span className="text-xs font-bold text-stone-600 bg-stone-200/70 px-2 py-0.5 rounded">
                              #{panchangData?.yoga?.id} of 27
                            </span>
                          </div>
                          <p className="font-serif font-bold text-base text-stone-900">
                            {panchangData?.yoga?.name} ({panchangData?.yoga?.devanagari})
                          </p>
                          <p className="text-xs text-stone-600">
                            Sum of solar & lunar longitudes per classical Surya Siddhanta.
                          </p>
                        </div>

                        {/* Karana */}
                        <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#ede5d6] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-400 uppercase">Karana (करण)</span>
                            <span className="text-xs font-bold text-stone-600 bg-stone-200/70 px-2 py-0.5 rounded">
                              Half-Tithi
                            </span>
                          </div>
                          <p className="font-serif font-bold text-base text-stone-900">
                            {panchangData?.karana?.name} ({panchangData?.karana?.devanagari})
                          </p>
                          <p className="text-xs text-stone-600">
                            Action-governing division of lunar day.
                          </p>
                        </div>

                        {/* Vara */}
                        <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#ede5d6] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-400 uppercase">Vara (वार)</span>
                            <span className="text-xs font-bold text-[#13382c] bg-[#eaf4ef] px-2 py-0.5 rounded">
                              Lord {panchangData?.vara?.lord}
                            </span>
                          </div>
                          <p className="font-serif font-bold text-base text-stone-900">
                            {panchangData?.vara?.en} ({panchangData?.vara?.hi})
                          </p>
                          <p className="text-xs text-stone-600">
                            Governed by {panchangData?.vara?.lord} ({panchangData?.vara?.lordHi}).
                          </p>
                        </div>

                        {/* Sun & Moon Signs */}
                        <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#ede5d6] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-400 uppercase">Luminaries</span>
                            <span className="text-xs font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                              Sidereal
                            </span>
                          </div>
                          <p className="text-xs text-stone-800 font-semibold">
                            Sun: {panchangData?.sunSign?.name} ({panchangData?.sunSign?.sanskritName}) at {panchangData?.sunSign?.degreeInSign}°
                          </p>
                          <p className="text-xs text-stone-800 font-semibold">
                            Moon: {panchangData?.moonSign?.name} ({panchangData?.moonSign?.sanskritName}) at {panchangData?.moonSign?.degreeInSign}°
                          </p>
                        </div>
                      </div>

                      {/* Auspicious & Inauspicious Timings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-stone-100">
                        {/* Auspicious Periods */}
                        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-950 uppercase tracking-wider">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>{isHi ? "शुभ काल (Auspicious Windows)" : "Auspicious Windows Today"}</span>
                          </div>
                          <ul className="space-y-1.5 text-xs text-emerald-900">
                            <li className="flex items-center justify-between">
                              <span className="font-semibold">Sunrise (सूर्योदय):</span>
                              <span className="font-mono">{panchangData?.sunrise?.local}</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="font-semibold">Sunset (सूर्यास्त):</span>
                              <span className="font-mono">{panchangData?.sunset?.local}</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="font-semibold">Brahma Muhurta (ब्राह्म मुहूर्त):</span>
                              <span className="font-mono">~1 hr 36m before sunrise</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="font-semibold">Abhijit Muhurta (अभिजित मुहूर्त):</span>
                              <span className="font-mono">~Midday (11:45 AM - 12:35 PM)</span>
                            </li>
                          </ul>
                        </div>

                        {/* Cautionary Windows */}
                        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase tracking-wider">
                            <Clock className="w-4 h-4 text-amber-700" />
                            <span>{isHi ? "वर्ज्य काल (Caution Windows)" : "Caution Periods to Observe"}</span>
                          </div>
                          <ul className="space-y-1.5 text-xs text-amber-900">
                            <li className="flex items-center justify-between">
                              <span className="font-semibold">Rahu Kaal (राहुकाल):</span>
                              <span className="font-mono font-bold">
                                {panchangData?.rahuKaal?.startLocal} – {panchangData?.rahuKaal?.endLocal}
                              </span>
                            </li>
                            <li className="text-[11px] text-amber-800 leading-relaxed">
                              {panchangData?.rahuKaal?.description ||
                                "Traditional cautionary period: avoid inaugural commitments or signing new contracts."}
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 3: TODAY'S HOROSCOPE (ALL 12 RASHIS)                      */}
                {/* ------------------------------------------------------------- */}
                {selectedTab === "horoscope" && (
                  <div className="space-y-6">
                    {/* 12 Rashi Switcher Bar */}
                    <div className="bg-white rounded-2xl border border-[#ede5d6] p-4 shadow-2xs">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                          {isHi ? "अपनी राशि चुनें" : "Select Your Zodiac Sign (Rashi)"}
                        </span>
                        <span className="text-xs text-stone-400">12 Sidereal Vedic Signs</span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {RASHIS.map((r) => {
                          const isSel = selectedRashi === r.id;
                          return (
                            <button
                              key={r.id}
                              onClick={() => setSelectedRashi(r.id)}
                              className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                                isSel
                                  ? "bg-[#13382c] text-white border-[#13382c] shadow-xs"
                                  : "bg-[#faf8f4] border-[#ede5d6] text-stone-700 hover:bg-white hover:border-stone-400"
                              }`}
                            >
                              <div className="text-lg leading-none mb-1">{r.symbol}</div>
                              <div className="font-serif font-bold text-xs truncate">{r.nameEn}</div>
                              <div className="text-[10px] opacity-80">{r.nameHi}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detailed Horoscope For Selected Sign */}
                    <div className="bg-white rounded-2xl border border-[#ede5d6] p-6 shadow-2xs space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                        <div className="flex items-center gap-3.5">
                          <div className="w-14 h-14 rounded-2xl bg-[#faf5eb] border border-[#ede2cc] flex items-center justify-center text-3xl font-bold text-[#c4903c]">
                            {RASHIS.find((r) => r.id === selectedRashi)?.symbol}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                                {RASHIS.find((r) => r.id === selectedRashi)?.element} • Lord {RASHIS.find((r) => r.id === selectedRashi)?.lordEn}
                              </span>
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
                              {selectedRashi} ({RASHI_NAMES_HI[selectedRashi] || selectedRashi})
                            </h2>
                            <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                              {isHi ? transitHouseInfo.textHi : transitHouseInfo.textEn}
                            </p>
                          </div>
                        </div>

                        {/* Quick Lucky Metrics */}
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                            <span className="text-stone-400 text-[10px] block uppercase">Lucky Number</span>
                            <span className="font-bold text-stone-800">{RASHI_DETAILS[selectedRashi]?.luckyNumber}</span>
                          </div>
                          <div className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                            <span className="text-stone-400 text-[10px] block uppercase">Direction</span>
                            <span className="font-bold text-stone-800">{RASHI_DETAILS[selectedRashi]?.luckyDirection}</span>
                          </div>
                          <div className="px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                            <span className="text-stone-400 text-[10px] block uppercase">Color</span>
                            <span className="font-bold text-stone-800">{RASHI_DETAILS[selectedRashi]?.luckyColor?.split("/")[0]}</span>
                          </div>
                        </div>
                      </div>

                      {/* 6 Domain Life Guidance Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Career */}
                        <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#ede5d6] space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                            <Briefcase className="w-4 h-4 text-amber-700" />
                            <span>{isHi ? "कार्यक्षेत्र व व्यापार" : "Career & Work"}</span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            {RASHIS.find((r) => r.id === selectedRashi)?.element.includes("Fire")
                              ? "Dynamic leadership and decisive proposals bring gains. Avoid impatience with associates."
                              : RASHIS.find((r) => r.id === selectedRashi)?.element.includes("Earth")
                              ? "Steady progress in structural tasks and documentation. Calculated execution succeeds."
                              : RASHIS.find((r) => r.id === selectedRashi)?.element.includes("Air")
                              ? "Favorable for negotiations, team presentations, writing, and strategic communications."
                              : "Trust intuitive foresight in client relations. Maintain clear professional boundaries."}
                          </p>
                        </div>

                        {/* Learning & Intellect */}
                        <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#ede5d6] space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                            <Brain className="w-4 h-4 text-indigo-700" />
                            <span>{isHi ? "विद्या व मानसिक एकाग्रता" : "Study & Mind"}</span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            {panchangData?.nakshatra?.name} Nakshatra promotes disciplined retention and clarity. Good time for research and self-study.
                          </p>
                        </div>

                        {/* Love & Relationships */}
                        <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#ede5d6] space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                            <Heart className="w-4 h-4 text-rose-600" />
                            <span>{isHi ? "संबंध व परिवार" : "Relationships & Harmony"}</span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Gentle dialogue resolves lingering domestic misunderstandings. Prioritize attentive listening and patience.
                          </p>
                        </div>

                        {/* Finance */}
                        <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#ede5d6] space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                            <Wallet className="w-4 h-4 text-emerald-700" />
                            <span>{isHi ? "वित्त व संपत्ति" : "Finance & Wealth"}</span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Favor calculated investments and long-term saving. Avoid speculative purchases during Rahu Kaal window.
                          </p>
                        </div>

                        {/* Health */}
                        <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#ede5d6] space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                            <Zap className="w-4 h-4 text-amber-600" />
                            <span>{isHi ? "स्वास्थ्य व ऊर्जा" : "Health & Vitality"}</span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            Adequate hydration and mindful pacing will sustain steady stamina. Moderate Sattvic meals are recommended.
                          </p>
                        </div>

                        {/* Spiritual Direction */}
                        <div className="p-4 rounded-xl bg-[#faf8f4] border border-[#ede5d6] space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                            <Flame className="w-4 h-4 text-[#c4903c]" />
                            <span>{isHi ? "आध्यात्मिक साधना" : "Spiritual Sravana"}</span>
                          </div>
                          <p className="text-xs text-stone-600 leading-relaxed font-mono">
                            {RASHI_DETAILS[selectedRashi]?.mantra}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 4: CHOGHADIYA MUHURTA (LIVE WATCH & FULL 16 SLOTS)        */}
                {/* ------------------------------------------------------------- */}
                {selectedTab === "choghadiya" && (
                  <LiveChoghadiyaWatch
                    choghadiya={panchangData?.choghadiya}
                    selectedDate={selectedDate}
                    timezoneOffsetHours={parseFloat(selectedCity?.tz ?? panchangData?.tzOffset ?? 5.5)}
                    locationName={selectedCity?.name || "New Delhi"}
                    language={language}
                  />
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 5: MUHURTA CHECKER                                        */}
                {/* ------------------------------------------------------------- */}
                {selectedTab === "muhurta" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-[#ede5d6] p-6 shadow-2xs space-y-6">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#c4903c]">
                          {isHi ? "कार्य अनुकूलता व मुहूर्त विश्लेषक" : "Task Feasibility & Muhurta Analyzer"}
                        </span>
                        <h2 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
                          {isHi ? "क्या आज मेरा काम बनेगा?" : "Will My Planned Work Succeed Today?"}
                        </h2>
                        <p className="text-xs text-stone-500 mt-1">
                          Evaluates your task against today's Panchang, Nakshatra nature ({panchangData?.nakshatra?.name}), Rahu Kaal, and Choghadiya.
                        </p>
                      </div>

                      {/* Task Input & Quick Selection */}
                      <div className="space-y-3">
                        <textarea
                          rows={3}
                          value={taskQuery}
                          onChange={(e) => setTaskQuery(e.target.value)}
                          placeholder="Describe your planned task (e.g. 'Sign contracts and register new business', 'Important client presentation', etc.)"
                          className="w-full bg-[#faf8f4] border border-[#ede5d6] rounded-xl p-3.5 text-xs sm:text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#13382c]"
                        />

                        {/* Quick Prompts */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-stone-400 mr-1">
                            {isHi ? "त्वरित विकल्प:" : "Quick Ideas:"}
                          </span>
                          {[
                            "Start a new business project",
                            "Sign contracts and agreements",
                            "Investments and financial transactions",
                            "Purchase property or vehicle",
                            "Travel and journey departure",
                            "Medical consultation and health check",
                          ].map((prompt, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setTaskQuery(prompt);
                                handleEvaluateTask(prompt);
                              }}
                              className="text-xs bg-[#faf8f4] hover:bg-[#faf5eb] border border-[#ede5d6] px-2.5 py-1 rounded-lg text-stone-700 transition cursor-pointer"
                            >
                              {prompt}
                            </button>
                          ))}
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            type="button"
                            disabled={taskEvaluating || !taskQuery.trim()}
                            onClick={() => handleEvaluateTask()}
                            className="bg-[#13382c] hover:bg-[#1a4b3b] disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-xs"
                          >
                            {taskEvaluating ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>{isHi ? "मुहूर्त गणना जारी..." : "Evaluating against Panchang..."}</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-4 h-4 text-[#d4a359]" />
                                <span>{isHi ? "अनुकूलता जांचें" : "Evaluate Task Feasibility"}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Evaluation Result View */}
                      {taskResult && (
                        <div className="p-5 rounded-2xl bg-[#faf5eb] border border-[#ede2cc] space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#ede2cc]">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-[#c4903c] block">
                                Astrological Feasibility Verdict
                              </span>
                              <h3 className="font-serif font-bold text-lg text-stone-900 flex items-center gap-2">
                                <span>{isHi ? taskResult.verdict?.hi : taskResult.verdict?.en}</span>
                                <span className="text-amber-600 text-sm">
                                  {"★".repeat(taskResult.score || 3)}
                                  {"☆".repeat(Math.max(0, 5 - (taskResult.score || 3)))}
                                </span>
                              </h3>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white border border-[#ede2cc] text-stone-800 self-start sm:self-auto">
                              Alignment Score: {taskResult.score}/5
                            </span>
                          </div>

                          {/* Analysis Paragraph */}
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-stone-400 block">
                              Astrological Context & Energy
                            </span>
                            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed bg-white/70 p-3 rounded-xl border border-[#ede2cc]/60">
                              {isHi ? taskResult.feasibilityAnalysis?.hi : taskResult.feasibilityAnalysis?.en}
                            </p>
                          </div>

                          {/* Recommended Time Window */}
                          {taskResult.optimalTimeWindow && (
                            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs">
                              <span className="font-bold text-amber-950 block mb-0.5">
                                Recommended Auspicious Window:
                              </span>
                              <p className="text-amber-900 leading-relaxed">
                                {isHi ? taskResult.optimalTimeWindow.hi : taskResult.optimalTimeWindow.en}
                              </p>
                            </div>
                          )}

                          {/* Recommendations & Precautions */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {taskResult.practicalRecommendations?.length > 0 && (
                              <div className="p-3 rounded-xl bg-white/80 border border-emerald-200 space-y-1.5">
                                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Practical Success Steps</span>
                                </span>
                                <ul className="space-y-1 text-xs text-stone-600">
                                  {taskResult.practicalRecommendations.map((r, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span className="text-emerald-600">•</span>
                                      <span>{isHi ? r.hi : r.en}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {taskResult.precautionsToObserve?.length > 0 && (
                              <div className="p-3 rounded-xl bg-white/80 border border-amber-200 space-y-1.5">
                                <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Precautions to Observe</span>
                                </span>
                                <ul className="space-y-1 text-xs text-stone-600">
                                  {taskResult.precautionsToObserve.map((pr, i) => (
                                    <li key={i} className="flex items-start gap-1">
                                      <span className="text-amber-600">•</span>
                                      <span>{isHi ? pr.hi : pr.en}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 6: KUNDLI & PLANETARY TRANSITS (GOCHAR)                   */}
                {/* ------------------------------------------------------------- */}
                {selectedTab === "kundli" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-[#ede5d6] p-6 shadow-2xs space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-[#c4903c]">
                            {isHi ? "वैदिक जन्म कुण्डली व गोचर" : "Vedic Birth Chart & Planetary Transits"}
                          </span>
                          <h2 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
                            {isHi ? "सम्पूर्ण कुण्डली कैलकुलेटर" : "Complete Kundli & Planetary Positions"}
                          </h2>
                          <p className="text-xs text-stone-500 mt-0.5">
                            High-precision ephemeris calculations, North Indian Rashi Kundli, Bhavas, and Vimshottari Dasha.
                          </p>
                        </div>

                        {/* Sub-tab toggle */}
                        <div className="flex items-center gap-1 bg-[#faf8f4] p-1 rounded-xl border border-[#ede5d6] self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setKundliSubTab("calculator")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              kundliSubTab === "calculator"
                                ? "bg-[#13382c] text-white shadow-xs"
                                : "text-stone-600 hover:text-stone-900"
                            }`}
                          >
                            <Compass className="w-3.5 h-3.5 text-[#d4a359]" />
                            <span>{isHi ? "कुण्डली कैलकुलेटर" : "Kundli Calculator"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setKundliSubTab("transits")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                              kundliSubTab === "transits"
                                ? "bg-[#13382c] text-white shadow-xs"
                                : "text-stone-600 hover:text-stone-900"
                            }`}
                          >
                            <Layers className="w-3.5 h-3.5 text-amber-500" />
                            <span>{isHi ? "दैनिक गोचर" : "Daily Transits"}</span>
                          </button>
                        </div>
                      </div>

                      {/* SUB-VIEW A: KUNDLI CALCULATOR FORM & RESULT */}
                      {kundliSubTab === "calculator" && (
                        <div className="space-y-6">
                          {/* Input Form */}
                          <form onSubmit={handleCalculateKundli} className="p-4 sm:p-5 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] space-y-4">
                            <div className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                              <User className="w-4 h-4 text-[#c4903c]" />
                              <span>{isHi ? "जन्म विवरण दर्ज करें" : "Enter Birth Details"}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                              {/* Name */}
                              <div>
                                <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                                  {isHi ? "नाम (Name)" : "Full Name"}
                                </label>
                                <input
                                  type="text"
                                  value={kundliForm.name}
                                  onChange={(e) => setKundliForm({ ...kundliForm, name: e.target.value })}
                                  placeholder="Seeker"
                                  className="w-full bg-white border border-[#ede5d6] rounded-xl px-3 py-2 text-stone-900 focus:outline-none"
                                />
                              </div>

                              {/* Date of Birth */}
                              <div>
                                <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                                  {isHi ? "जन्म तिथि (Date)" : "Birth Date"}
                                </label>
                                <input
                                  type="date"
                                  required
                                  value={kundliForm.dob}
                                  onChange={(e) => setKundliForm({ ...kundliForm, dob: e.target.value })}
                                  className="w-full bg-white border border-[#ede5d6] rounded-xl px-3 py-2 text-stone-900 focus:outline-none"
                                />
                              </div>

                              {/* Time of Birth */}
                              <div>
                                <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                                  {isHi ? "जन्म समय (Time)" : "Birth Time (24h)"}
                                </label>
                                <input
                                  type="time"
                                  required
                                  value={kundliForm.tob}
                                  onChange={(e) => setKundliForm({ ...kundliForm, tob: e.target.value })}
                                  className="w-full bg-white border border-[#ede5d6] rounded-xl px-3 py-2 text-stone-900 focus:outline-none"
                                />
                              </div>

                              {/* Place of Birth */}
                              <div className={kundliForm.isCustomPlace || kundliForm.place === "__custom__" ? "sm:col-span-2 lg:col-span-3" : ""}>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="text-[11px] font-semibold text-stone-600 block">
                                    {isHi ? "जन्म स्थान (Birth Place)" : "Birth Place"}
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setShowKundliLocationModal(true)}
                                      className="text-[10px] text-white bg-[#13382c] hover:bg-[#1a4a3b] px-2 py-0.5 rounded-lg font-semibold inline-flex items-center gap-1 cursor-pointer transition shadow-2xs"
                                      title={isHi ? "देश, राज्य व नगर से स्वतः अक्षांश/देशांतर चुनें" : "Select Country > State > Town (Auto Calculated)"}
                                    >
                                      <Globe className="w-3 h-3 text-[#c4903c]" />
                                      <span>{isHi ? "स्वतः स्थान चयन" : "Auto Location"}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setKundliForm((prev) => ({
                                          ...prev,
                                          isCustomPlace: !prev.isCustomPlace,
                                          customPlaceName: prev.customPlaceName || (prev.place !== "__custom__" ? prev.place : ""),
                                        }))
                                      }
                                      className="text-[10px] text-[#c4903c] hover:underline font-semibold inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>
                                        {kundliForm.isCustomPlace || kundliForm.place === "__custom__"
                                          ? isHi
                                            ? "← प्रिसेट"
                                            : "← Presets"
                                          : isHi
                                            ? "मैन्युअल"
                                            : "Manual"}
                                      </span>
                                    </button>
                                  </div>
                                </div>

                                {!kundliForm.isCustomPlace && kundliForm.place !== "__custom__" ? (
                                  <select
                                    value={kundliForm.place}
                                    onChange={(e) => {
                                      if (e.target.value === "__custom__") {
                                        setKundliForm({
                                          ...kundliForm,
                                          isCustomPlace: true,
                                          place: "__custom__",
                                          customPlaceName: "",
                                        });
                                      } else {
                                        const match = PRESET_CITIES.find((c) => c.name === e.target.value);
                                        setKundliForm({
                                          ...kundliForm,
                                          place: e.target.value,
                                          customLat: match ? match.lat.toString() : kundliForm.customLat,
                                          customLon: match ? match.lon.toString() : kundliForm.customLon,
                                          customTz: match ? formatTzOffset(match.tz) : kundliForm.customTz,
                                        });
                                      }
                                    }}
                                    className="w-full bg-white border border-[#ede5d6] rounded-xl px-3 py-2 text-stone-900 focus:outline-none"
                                  >
                                    <option value="__custom__">
                                      🌐 {isHi ? "+ विश्व का कोई भी स्थान दर्ज करें..." : "+ Enter Any Place Worldwide (Coordinates / City)..."}
                                    </option>
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
                                  <div className="bg-[#faf7f0] border border-[#ede5d6] rounded-xl p-3 space-y-2.5">
                                    <div>
                                      <label className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block mb-1">
                                        {isHi ? "स्थान का नाम (City / Town / Country)" : "Place Name (Any City, Town, Village, or Country)"}
                                      </label>
                                      <PlaceAutocompleteInput
                                        value={kundliForm.customPlaceName}
                                        onChange={(val) => setKundliForm((prev) => ({ ...prev, customPlaceName: val }))}
                                        onSelectLocation={(loc) => {
                                          setKundliForm((prev) => ({
                                            ...prev,
                                            isCustomPlace: true,
                                            place: "__custom__",
                                            customPlaceName: loc.name,
                                            customLat: String(loc.lat),
                                            customLon: String(loc.lon),
                                            customTz: loc.tzStr || (typeof loc.tz === "number" ? formatTzOffset(loc.tz) : String(loc.tz || "+05:30")),
                                          }));
                                        }}
                                        isHi={isHi}
                                        placeholder={isHi ? "उदा. टोक्यो, जापान / अयोध्या, भारत" : "e.g. Tokyo, Japan / Ayodhya, India / Paris, France"}
                                        onOpenModal={() => setShowKundliLocationModal(true)}
                                      />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <div>
                                        <label className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block mb-1">
                                          {isHi ? "अक्षांश (Latitude: -90° to 90°)" : "Latitude (-90° to 90°)"}
                                        </label>
                                        <input
                                          type="number"
                                          step="any"
                                          min="-90"
                                          max="90"
                                          required
                                          value={kundliForm.customLat}
                                          onChange={(e) => setKundliForm({ ...kundliForm, customLat: e.target.value })}
                                          placeholder="e.g. 35.6762"
                                          className="w-full bg-white border border-[#ede5d6] rounded-lg px-2.5 py-1.5 text-xs text-stone-900 focus:outline-none"
                                        />
                                      </div>
                                      <div>
                                        <div className="flex items-center justify-between mb-1">
                                          <label className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block">
                                            {isHi ? "देशांतर (-180° to 180°)" : "Longitude (-180° to 180°)"}
                                          </label>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const estTz = estimateTzFromLongitude(kundliForm.customLon);
                                              const formatted = formatTzOffset(estTz);
                                              setKundliForm((f) => ({ ...f, customTz: formatted }));
                                            }}
                                            className="text-[9px] text-[#c4903c] font-semibold hover:underline cursor-pointer"
                                            title="Auto detect timezone offset from longitude"
                                          >
                                            {isHi ? "स्वतः TZ पहचानें" : "Auto TZ"}
                                          </button>
                                        </div>
                                        <input
                                          type="number"
                                          step="any"
                                          min="-180"
                                          max="180"
                                          required
                                          value={kundliForm.customLon}
                                          onChange={(e) => {
                                            const newLon = e.target.value;
                                            const estTz = estimateTzFromLongitude(newLon);
                                            setKundliForm({
                                              ...kundliForm,
                                              customLon: newLon,
                                              customTz: formatTzOffset(estTz),
                                            });
                                          }}
                                          placeholder="e.g. 139.6503"
                                          className="w-full bg-white border border-[#ede5d6] rounded-lg px-2.5 py-1.5 text-xs text-stone-900 focus:outline-none"
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <label className="text-[10px] uppercase tracking-wider font-bold text-stone-500 block mb-1">
                                        {isHi ? "समय क्षेत्र ऑफसेट (Timezone Offset)" : "Timezone Offset (UTC Offset)"}
                                      </label>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <select
                                          value={COMMON_TIMEZONES.some((tz) => tz.value === kundliForm.customTz) ? kundliForm.customTz : "custom"}
                                          onChange={(e) => {
                                            if (e.target.value !== "custom") {
                                              setKundliForm({ ...kundliForm, customTz: e.target.value });
                                            }
                                          }}
                                          className="w-full bg-white border border-[#ede5d6] rounded-lg px-2 py-1.5 text-xs text-stone-900 focus:outline-none"
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
                                          value={kundliForm.customTz}
                                          onChange={(e) => setKundliForm({ ...kundliForm, customTz: e.target.value })}
                                          placeholder="+05:30 or +09:00"
                                          className="w-full bg-white border border-[#ede5d6] rounded-lg px-2.5 py-1.5 text-xs text-stone-900 focus:outline-none"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Gender */}
                              <div>
                                <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                                  {isHi ? "लिंग (Gender)" : "Gender"}
                                </label>
                                <select
                                  value={kundliForm.gender}
                                  onChange={(e) => setKundliForm({ ...kundliForm, gender: e.target.value })}
                                  className="w-full bg-white border border-[#ede5d6] rounded-xl px-3 py-2 text-stone-900 focus:outline-none"
                                >
                                  <option value="male">Male</option>
                                  <option value="female">Female</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-[#ede5d6]/60">
                              <span className="text-[11px] text-stone-500">
                                Lahiri Ayanamsha (Chitra Paksha) • Deterministic Ephemeris
                              </span>
                              <button
                                type="submit"
                                disabled={chartLoading}
                                className="bg-[#13382c] hover:bg-[#1a4b3b] disabled:opacity-50 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-xs"
                              >
                                {chartLoading ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#d4a359]" />
                                    <span>{isHi ? "गणना जारी..." : "Computing Chart..."}</span>
                                  </>
                                ) : (
                                  <>
                                    <Compass className="w-3.5 h-3.5 text-[#d4a359]" />
                                    <span>{isHi ? "जन्म कुण्डली बनाएं" : "Calculate Birth Chart"}</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </form>

                          {chartError && (
                            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                              <span>{chartError}</span>
                            </div>
                          )}

                          {/* Calculated Chart Result Presentation */}
                          {chartResult && (
                            <div className="space-y-6 pt-2">
                              {/* Summary Cards */}
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="p-3.5 rounded-xl bg-[#faf5eb] border border-[#ede2cc]">
                                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Lagna (Ascendant)</span>
                                  <span className="font-serif font-bold text-sm text-stone-900 block mt-0.5">
                                    {chartResult.ascendant?.sign} ({chartResult.ascendant?.sanskritSign?.split("(")[0]})
                                  </span>
                                  <span className="text-[11px] text-stone-600 block mt-0.5">
                                    {chartResult.ascendant?.degree?.toFixed(2)}° • {chartResult.ascendant?.nakshatra}
                                  </span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-[#faf5eb] border border-[#ede2cc]">
                                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Moon Sign (Rashi)</span>
                                  <span className="font-serif font-bold text-sm text-stone-900 block mt-0.5">
                                    {chartResult.moon?.sign} ({chartResult.moon?.sanskritSign?.split("(")[0]})
                                  </span>
                                  <span className="text-[11px] text-stone-600 block mt-0.5">
                                    {chartResult.moon?.degree?.toFixed(2)}° • {chartResult.moon?.nakshatra}
                                  </span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-[#faf5eb] border border-[#ede2cc]">
                                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Current Mahadasha</span>
                                  <span className="font-serif font-bold text-sm text-stone-900 block mt-0.5">
                                    {chartResult.dasha?.currentMahadasha}
                                  </span>
                                  <span className="text-[11px] text-stone-600 block mt-0.5">
                                    {chartResult.dasha?.balanceText || "Active Vimshottari"}
                                  </span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-[#faf5eb] border border-[#ede2cc]">
                                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Ayanamsha</span>
                                  <span className="font-serif font-bold text-sm text-stone-900 block mt-0.5">
                                    {chartResult.calculation?.ayanamsaValue?.toFixed(4)}°
                                  </span>
                                  <span className="text-[11px] text-stone-600 block mt-0.5">
                                    {chartResult.calculation?.ayanamsa || "Lahiri"}
                                  </span>
                                </div>
                              </div>

                              {/* Chart SVG and Planetary Table Grid */}
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                {/* North Indian Chart SVG */}
                                <div className="lg:col-span-6 bg-[#faf8f4] border border-[#ede5d6] p-4 rounded-2xl flex flex-col items-center">
                                  <span className="text-xs font-bold text-stone-800 font-serif mb-3">
                                    {isHi ? "लग्न कुण्डली (North Indian Rashi Chart)" : "Lagna Kundli (North Indian Rashi Chart)"}
                                  </span>
                                  <NorthIndianChart chart={chartResult} language={language} />
                                </div>

                                {/* Planetary Coordinates Table */}
                                <div className="lg:col-span-6 overflow-x-auto">
                                  <span className="text-xs font-bold text-stone-800 font-serif block mb-2">
                                    {isHi ? "ग्रह स्पष्ट (Planetary Longitudes & Bhavas)" : "Planetary Longitudes & Bhavas"}
                                  </span>
                                  <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden bg-white">
                                    <thead className="bg-[#faf8f4] border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
                                      <tr>
                                        <th className="p-2.5">Graha</th>
                                        <th className="p-2.5">Rashi</th>
                                        <th className="p-2.5">House</th>
                                        <th className="p-2.5">Degree</th>
                                        <th className="p-2.5">Nakshatra</th>
                                        <th className="p-2.5">Speed</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                                      {chartResult.planets?.map((p, idx) => (
                                        <tr key={idx} className="hover:bg-amber-50/40">
                                          <td className="p-2.5 font-bold">{p.planet}</td>
                                          <td className="p-2.5">{p.sign}</td>
                                          <td className="p-2.5 font-mono">{p.house}</td>
                                          <td className="p-2.5 font-mono">{p.degree?.toFixed(2)}°</td>
                                          <td className="p-2.5">{p.nakshatra} (P{p.pada})</td>
                                          <td className="p-2.5">
                                            {p.retrograde ? (
                                              <span className="px-1 py-0.5 rounded bg-orange-100 text-orange-800 font-bold text-[9px]">
                                                Vakri (R)
                                              </span>
                                            ) : (
                                              <span className="text-emerald-700 text-[10px]">Direct</span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* SUB-VIEW B: LIVE TRANSITS TABLE */}
                      {kundliSubTab === "transits" && (
                        <div className="space-y-4">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border border-stone-200 rounded-xl overflow-hidden">
                              <thead className="bg-[#faf8f4] border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
                                <tr>
                                  <th className="p-3">Graha (Planet)</th>
                                  <th className="p-3">Rashi (Sign)</th>
                                  <th className="p-3">Degree in Sign</th>
                                  <th className="p-3">Nakshatra</th>
                                  <th className="p-3">Pada</th>
                                  <th className="p-3">Motion</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                                {transitsData?.all?.map((p, idx) => (
                                  <tr key={idx} className="hover:bg-amber-50/40 transition">
                                    <td className="p-3 font-bold text-stone-900">
                                      {p.name} ({p.sanskritName?.split("(")[1]?.replace(")", "") || p.name})
                                    </td>
                                    <td className="p-3">
                                      {p.sign} ({p.sanskritSign?.split("(")[0]?.trim() || p.sign})
                                    </td>
                                    <td className="p-3 font-mono">
                                      {p.degree?.toFixed(2)}°
                                    </td>
                                    <td className="p-3">
                                      {p.nakshatra} ({p.sanskritNakshatra})
                                    </td>
                                    <td className="p-3">{p.pada}</td>
                                    <td className="p-3">
                                      {p.retrograde ? (
                                        <span className="px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 font-bold text-[10px]">
                                          Vakri (R)
                                        </span>
                                      ) : (
                                        <span className="text-emerald-700 font-semibold text-[10px]">
                                          Marga (Direct)
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 7: VEDIC REMEDIES & PUJA RECOMMENDATIONS                   */}
                {/* ------------------------------------------------------------- */}
                {selectedTab === "remedies" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-[#ede5d6] p-6 shadow-2xs space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-[#c4903c]">
                            {isHi ? "प्रामाणिक वैदिक उपाय व पूजा" : "Classical Vedic Remedies & Daily Puja"}
                          </span>
                          <h2 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
                            {panchangData?.vara?.en} Puja & Astrological Remedies
                          </h2>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Classical mantras, Sattvic daily practices, and charitable actions from the Vedas and Brihat Parashara Hora Shastra.
                          </p>
                        </div>
                        <Link
                          href="/astrology/daily-guidance"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#13382c] text-white text-xs font-bold shadow-xs hover:bg-[#1a4b3b] transition self-start sm:self-auto"
                        >
                          <span>{isHi ? "विस्तृत पोर्टल पृष्ठ" : "Full Guidance Page"}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#d4a359]" />
                        </Link>
                      </div>

                      {/* Action Notification Message */}
                      {remediesActionMsg && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{remediesActionMsg}</span>
                        </div>
                      )}

                      {/* Remedies Cards List */}
                      {remediesLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-400 text-xs">
                          <Loader2 className="w-6 h-6 animate-spin text-[#c4903c]" />
                          <span>Loading verified practices from database...</span>
                        </div>
                      ) : remediesList.length === 0 ? (
                        <div className="p-6 text-center text-stone-500 text-xs bg-stone-50 rounded-xl">
                          No published practices found for this date.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {remediesList.map((remedy) => (
                            <div
                              key={remedy.id}
                              className={`p-5 rounded-2xl border transition space-y-3.5 flex flex-col justify-between ${
                                remedy.isCompleted
                                  ? "bg-emerald-50/60 border-emerald-300"
                                  : "bg-[#faf8f4] border-[#ede5d6]"
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#c4903c] block">
                                      {remedy.category} • {remedy.deity}
                                    </span>
                                    <h3 className="font-serif font-bold text-base text-stone-900 mt-0.5">
                                      {remedy.title}
                                    </h3>
                                  </div>
                                  {remedy.isCompleted && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      Done
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-stone-600 leading-relaxed">
                                  {remedy.purpose}
                                </p>

                                {/* Mantra Box */}
                                {remedy.sanskritMantra && (
                                  <div className="p-3 rounded-xl bg-white border border-[#ede5d6] space-y-1.5 relative group">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] font-bold text-stone-400 uppercase">Mantra</span>
                                      <button
                                        type="button"
                                        onClick={() => handleCopyMantra(remedy.id, remedy.sanskritMantra)}
                                        className="text-stone-400 hover:text-stone-800 transition p-1 cursor-pointer flex items-center gap-1 text-[10px]"
                                        title="Copy Sanskrit Mantra"
                                      >
                                        {copiedMantraId === remedy.id ? (
                                          <>
                                            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                                            <span className="text-emerald-700 font-bold">Copied!</span>
                                          </>
                                        ) : (
                                          <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span>Copy</span>
                                          </>
                                        )}
                                      </button>
                                    </div>
                                    <p className="font-serif font-bold text-sm text-stone-900">
                                      {remedy.sanskritMantra}
                                    </p>
                                    {remedy.mantraMeaning && (
                                      <p className="text-[11px] text-stone-500 italic">
                                        "{remedy.mantraMeaning}"
                                      </p>
                                    )}
                                  </div>
                                )}

                                {remedy.sourceReference && (
                                  <p className="text-[10px] text-stone-400">
                                    Source: {remedy.sourceReference}
                                  </p>
                                )}
                              </div>

                              {/* Interactive Action Buttons */}
                              <div className="pt-2 border-t border-[#ede5d6]/70 flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleRemedyAction(remedy.id, remedy.isCompleted ? "uncomplete" : "complete")}
                                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                                    remedy.isCompleted
                                      ? "bg-emerald-600 text-white"
                                      : "bg-white border border-stone-300 text-stone-700 hover:bg-stone-50"
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{remedy.isCompleted ? "Completed" : "Mark as Done"}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRemedyAction(remedy.id, remedy.isBookmarked ? "unbookmark" : "bookmark")}
                                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                                    remedy.isBookmarked
                                      ? "text-[#c4903c] bg-amber-50"
                                      : "text-stone-400 hover:text-stone-700"
                                  }`}
                                  title={remedy.isBookmarked ? "Remove Bookmark" : "Save Practice"}
                                >
                                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 8: KUNDALINI & CHAKRAS GUIDANCE                           */}
                {/* ------------------------------------------------------------- */}
                {selectedTab === "kundalini" && (
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl border border-[#ede5d6] p-6 shadow-2xs space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-[#c4903c]">
                            {isHi ? "प्रामाणिक कुंडलिनी व चक्र विज्ञान" : "Authentic Kundalini & Chakra Wisdom"}
                          </span>
                          <h2 className="text-2xl font-serif font-bold text-stone-900 mt-0.5">
                            {isHi ? "दैनिक चक्र संरेखण व ध्यान" : "Chakra Alignment & Structured Modules"}
                          </h2>
                          <p className="text-xs text-stone-500 mt-0.5">
                            Traditional Shaiva-Shakta and Upanishadic energy awareness presented safely and responsibly.
                          </p>
                        </div>
                        <Link
                          href="/spirituality/kundalini"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#13382c] text-white text-xs font-bold shadow-xs hover:bg-[#1a4b3b] transition self-start sm:self-auto"
                        >
                          <span>{isHi ? "सम्पूर्ण कुंडलिनी मॉड्यूल खोलें" : "Explore Kundalini Portal"}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-[#d4a359]" />
                        </Link>
                      </div>

                      {/* Action Notification Message */}
                      {kundaliniActionMsg && (
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{kundaliniActionMsg}</span>
                        </div>
                      )}

                      {/* Strict Traditional Safety Guardrail Banner */}
                      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                        <div className="flex items-center gap-2 font-bold text-amber-900">
                          <Shield className="w-4 h-4 text-amber-700 shrink-0" />
                          <span>Essential Spiritual Safety Guardrail</span>
                        </div>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          Traditional texts (Hatha Yoga Pradipika, Shiva Samhita) emphasize that forceful breath retention (Kumbhaka), hyperventilation, or unguided Kundalini arousal are strictly prohibited without an experienced, qualified living preceptor. Spiritual practices support calm focus and are never a substitute for medical healthcare.
                        </p>
                      </div>

                      {/* Kundalini Educational Modules Grid */}
                      {kundaliniLoading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-2 text-stone-400 text-xs">
                          <Loader2 className="w-6 h-6 animate-spin text-[#c4903c]" />
                          <span>Loading educational chakra modules...</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {kundaliniModules.map((mod) => (
                            <div
                              key={mod.id}
                              className={`p-5 rounded-2xl border transition space-y-3 flex flex-col justify-between ${
                                mod.isCompleted
                                  ? "bg-emerald-50/60 border-emerald-300"
                                  : "bg-[#faf8f4] border-[#ede5d6]"
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#c4903c] block">
                                      {mod.level} {mod.chakra ? `• ${mod.chakra}` : ""}
                                    </span>
                                    <h3 className="font-serif font-bold text-base text-stone-900 mt-0.5">
                                      {mod.title}
                                    </h3>
                                  </div>
                                  {mod.isCompleted && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                      <Check className="w-3 h-3 text-emerald-600" />
                                      Learned
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                                  {mod.summary || mod.description || "Foundational traditional study module."}
                                </p>

                                {mod.safetyNotice && (
                                  <p className="text-[11px] text-amber-800 bg-amber-50/70 p-2 rounded-lg border border-amber-200/60">
                                    <span className="font-bold">Safety: </span>
                                    {mod.safetyNotice}
                                  </p>
                                )}
                              </div>

                              {/* Interactive Progress Tracking */}
                              <div className="pt-2 border-t border-[#ede5d6]/70 flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleKundaliniAction(mod.id, mod.isCompleted ? "uncomplete" : "complete")}
                                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                                    mod.isCompleted
                                      ? "bg-emerald-600 text-white"
                                      : "bg-white border border-stone-300 text-stone-700 hover:bg-stone-50"
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{mod.isCompleted ? "Completed" : "Mark as Learned"}</span>
                                </button>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleKundaliniAction(mod.id, mod.isBookmarked ? "unbookmark" : "bookmark")}
                                    className={`text-xs font-semibold p-1.5 rounded-lg transition cursor-pointer ${
                                      mod.isBookmarked
                                        ? "text-[#c4903c] bg-amber-50"
                                        : "text-stone-400 hover:text-stone-700"
                                    }`}
                                    title={mod.isBookmarked ? "Remove Bookmark" : "Save Module"}
                                  >
                                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                                  </button>

                                  <Link
                                    href={`/spirituality/kundalini/${mod.slug}`}
                                    className="text-xs font-semibold text-[#13382c] hover:underline inline-flex items-center gap-1"
                                  >
                                    <span>Read Module</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB: VEDIC NUMEROLOGY STUDIO                                 */}
                {/* ------------------------------------------------------------- */}
                {selectedTab === "numerology" && (
                  <div className="space-y-6">
                    <VedicNumerologyStudio />
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* TAB 9: LIVE HOROSCOPE KNOWLEDGE EXPLORER                     */}
                {/* ------------------------------------------------------------- */}
                {selectedTab === "explorer" && (
                  <div className="space-y-6">
                    <HoroscopeKnowledgeExplorer
                      date={selectedDate}
                      city={selectedCity}
                      panchangData={panchangData}
                      reportData={reportData}
                      selectedRashi={selectedRashi}
                      language={language}
                      onNavigateTab={updateTab}
                      initialTargetConcept={explorerTarget}
                    />
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
