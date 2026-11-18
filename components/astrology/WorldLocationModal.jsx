"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Globe,
  X,
  Search,
  MapPin,
  Compass,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  LOCATION_HIERARCHY,
  getAvailableCountries,
  getStatesForCountry,
  getTownsForState,
  filterByFirstLetter,
  searchAllLocations,
  formatTzOffset,
  estimateTzFromLongitude,
  COMMON_TIMEZONES,
} from "./worldLocations";

export default function WorldLocationModal({
  isOpen,
  onClose,
  onApply,
  initialLocation,
  isHi = false,
  title,
  subtitle,
}) {
  // Mode: "hierarchy" (Country > State > Town) | "quick" (Unified search) | "manual" (Direct Lat/Lon)
  const [activeMode, setActiveMode] = useState("hierarchy");

  // Hierarchy States
  const [selectedCountry, setSelectedCountry] = useState("India");
  const [countrySearch, setCountrySearch] = useState("India");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);

  const [selectedState, setSelectedState] = useState("Uttar Pradesh");
  const [stateSearch, setStateSearch] = useState("Uttar Pradesh");
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);

  const [selectedTown, setSelectedTown] = useState(null);
  const [townSearch, setTownSearch] = useState("");
  const [isTownDropdownOpen, setIsTownDropdownOpen] = useState(false);

  // Quick Search State
  const [quickQuery, setQuickQuery] = useState("");
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [onlineResults, setOnlineResults] = useState([]);

  // Calculated Coordinates & Timezone State
  const [calculatedPlace, setCalculatedPlace] = useState({
    name: "Varanasi (Kashi), Uttar Pradesh, India",
    lat: "25.3176",
    lon: "82.9739",
    tz: "5.5",
    tzStr: "Asia/Kolkata",
    isSacred: true,
  });

  // Collapsible fine-tune coordinates panel
  const [showManualOverride, setShowManualOverride] = useState(false);

  // Refs for outside click handling
  const countryRef = useRef(null);
  const stateRef = useRef(null);
  const townRef = useRef(null);

  // Initialize from initialLocation when modal opens
  useEffect(() => {
    if (isOpen && initialLocation) {
      if (initialLocation.name) {
        // Try to match initialLocation in hierarchy
        const matches = searchAllLocations(initialLocation.name, 1);
        if (matches.length > 0) {
          const m = matches[0];
          setSelectedCountry(m.country);
          setCountrySearch(m.country);
          setSelectedState(m.state);
          setStateSearch(m.state);
          setSelectedTown({ name: m.shortName, lat: m.lat, lon: m.lon, tz: m.tz, tzStr: m.tzStr, isSacred: m.isSacred });
          setTownSearch(m.shortName);
          setCalculatedPlace({
            name: m.name,
            lat: String(m.lat),
            lon: String(m.lon),
            tz: String(m.tz),
            tzStr: m.tzStr,
            isSacred: m.isSacred,
          });
        } else {
          setCalculatedPlace({
            name: initialLocation.name,
            lat: String(initialLocation.lat || "28.6139"),
            lon: String(initialLocation.lon || "77.2090"),
            tz: String(initialLocation.tz !== undefined ? initialLocation.tz : "5.5"),
            tzStr: initialLocation.tzStr || "Asia/Kolkata",
            isSacred: false,
          });
        }
      }
    }
  }, [isOpen, initialLocation]);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (countryRef.current && !countryRef.current.contains(e.target)) {
        setIsCountryDropdownOpen(false);
      }
      if (stateRef.current && !stateRef.current.contains(e.target)) {
        setIsStateDropdownOpen(false);
      }
      if (townRef.current && !townRef.current.contains(e.target)) {
        setIsTownDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered Countries (First Letter & Substring Matching)
  const availableCountries = useMemo(() => getAvailableCountries(), []);
  const filteredCountries = useMemo(() => {
    return filterByFirstLetter(availableCountries, countrySearch);
  }, [availableCountries, countrySearch]);

  // States for Selected Country
  const availableStates = useMemo(() => {
    return getStatesForCountry(selectedCountry);
  }, [selectedCountry]);

  // Filtered States (First Letter & Substring Matching)
  const filteredStates = useMemo(() => {
    return filterByFirstLetter(availableStates, stateSearch);
  }, [availableStates, stateSearch]);

  // Towns for Selected State
  const availableTowns = useMemo(() => {
    return getTownsForState(selectedCountry, selectedState);
  }, [selectedCountry, selectedState]);

  // Filtered Towns (First Letter & Substring Matching)
  const filteredTowns = useMemo(() => {
    return filterByFirstLetter(availableTowns, townSearch);
  }, [availableTowns, townSearch]);

  // Quick Search Results
  const localQuickResults = useMemo(() => {
    if (!quickQuery || quickQuery.trim().length === 0) return [];
    return searchAllLocations(quickQuery, 15);
  }, [quickQuery]);

  // Handler: Select Country
  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    setCountrySearch(country);
    setIsCountryDropdownOpen(false);

    // Reset state & town
    const nextStates = getStatesForCountry(country);
    const defaultState = nextStates[0] || "";
    setSelectedState(defaultState);
    setStateSearch(defaultState);

    const nextTowns = getTownsForState(country, defaultState);
    if (nextTowns.length > 0) {
      handleSelectTown(nextTowns[0], defaultState, country);
    } else {
      setSelectedTown(null);
      setTownSearch("");
    }
  };

  // Handler: Select State
  const handleSelectState = (state) => {
    setSelectedState(state);
    setStateSearch(state);
    setIsStateDropdownOpen(false);

    // Reset town to first town in that state
    const nextTowns = getTownsForState(selectedCountry, state);
    if (nextTowns.length > 0) {
      handleSelectTown(nextTowns[0], state, selectedCountry);
    } else {
      setSelectedTown(null);
      setTownSearch("");
    }
  };

  // Handler: Select Town (Auto-calculates lat, lon, tz!)
  const handleSelectTown = (town, stateName = selectedState, countryName = selectedCountry) => {
    setSelectedTown(town);
    setTownSearch(town.name);
    setIsTownDropdownOpen(false);

    const fullName = `${town.name}, ${stateName}, ${countryName}`;
    setCalculatedPlace({
      name: fullName,
      lat: String(town.lat),
      lon: String(town.lon),
      tz: String(town.tz !== undefined ? town.tz : LOCATION_HIERARCHY[countryName]?.defaultTz || 5.5),
      tzStr: town.tzStr || LOCATION_HIERARCHY[countryName]?.tzStr || "Asia/Kolkata",
      isSacred: !!town.isSacred,
    });
  };

  // Handler: Quick Search Online Fallback
  const handleSearchOnline = async () => {
    if (!quickQuery || quickQuery.trim().length < 3) return;
    setIsSearchingOnline(true);
    try {
      const res = await fetch(`/api/astrology/location-lookup?q=${encodeURIComponent(quickQuery)}&online=1`);
      if (res.ok) {
        const data = await res.json();
        setOnlineResults(data.results || []);
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsSearchingOnline(false);
    }
  };

  // Apply Location button click
  const handleApply = () => {
    const latNum = parseFloat(calculatedPlace.lat);
    const lonNum = parseFloat(calculatedPlace.lon);
    const tzNum = parseFloat(calculatedPlace.tz);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) return;
    if (isNaN(lonNum) || lonNum < -180 || lonNum > 180) return;

    const locationObj = {
      name: calculatedPlace.name.trim() || `${latNum.toFixed(2)}°, ${lonNum.toFixed(2)}°`,
      lat: latNum,
      lon: lonNum,
      tz: isNaN(tzNum) ? 0 : tzNum,
      tzStr: calculatedPlace.tzStr || `UTC${formatTzOffset(tzNum || 0)}`,
      category: calculatedPlace.isSacred ? "Sacred India" : (selectedCountry === "India" ? "India" : "Custom"),
    };

    onApply(locationObj);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-[#ede5d6] shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ede5d6] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#faf7f0] text-[#c4903c] border border-[#ede5d6] shadow-xs">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 font-serif leading-tight">
                {title || (isHi ? "विश्व का कोई भी स्थान जोड़ें" : "Add Any Location in the World")}
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                {subtitle ||
                  (isHi
                    ? "देश, राज्य व नगर चुनते ही अक्षांश, देशांतर व समय-क्षेत्र स्वतः गणना हो जाएँगे।"
                    : "Automatic high-precision coordinates & timezone calculated by location hierarchy.")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-700 transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#faf7f0] rounded-xl border border-[#ede5d6] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveMode("hierarchy")}
            className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === "hierarchy"
                ? "bg-[#13382c] text-white shadow-xs font-bold"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isHi ? "देश > राज्य > नगर" : "Country > State > Town"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("quick")}
            className={`flex-1 py-1.5 px-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeMode === "quick"
                ? "bg-[#13382c] text-white shadow-xs font-bold"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isHi ? "त्वरित खोज" : "Quick Search"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("manual")}
            className={`py-1.5 px-2.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
              activeMode === "manual"
                ? "bg-[#13382c] text-white shadow-xs font-bold"
                : "text-stone-600 hover:text-stone-900"
            }`}
            title="Manual Coordinates"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isHi ? "मैन्युअल" : "Coordinates"}</span>
          </button>
        </div>

        {/* MODE 1: HIERARCHY (Country -> State -> Town with 1st letter filter) */}
        {activeMode === "hierarchy" && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* Quick Country Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-1">
                {isHi ? "त्वरित देश:" : "Popular:"}
              </span>
              {["India", "Nepal", "United States", "United Kingdom", "Canada", "Australia"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSelectCountry(c)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                    selectedCountry === c
                      ? "bg-[#13382c] text-white border-[#13382c] font-semibold"
                      : "bg-[#faf7f0] text-stone-700 border-[#ede5d6] hover:bg-[#f0ebe0]"
                  }`}
                >
                  {c === "India" && "🇮🇳 "}
                  {c === "Nepal" && "🇳🇵 "}
                  {c === "United States" && "🇺🇸 "}
                  {c === "United Kingdom" && "🇬🇧 "}
                  {c === "Canada" && "🇨🇦 "}
                  {c === "Australia" && "🇦🇺 "}
                  {c}
                </button>
              ))}
            </div>

            {/* Step 1: Country Dropdown */}
            <div className="relative" ref={countryRef}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#13382c] text-white text-[10px] flex items-center justify-center font-mono">1</span>
                  <span>{isHi ? "1. देश चुनें (Country)" : "1. Country"}</span>
                </label>
                <span className="text-[10px] text-stone-400">
                  {isHi ? "पहला अक्षर लिखकर खोजें" : "Write 1st letter to filter"}
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => {
                    setCountrySearch(e.target.value);
                    setIsCountryDropdownOpen(true);
                  }}
                  onFocus={() => setIsCountryDropdownOpen(true)}
                  placeholder={isHi ? "पहला अक्षर लिखें (उदा. I = India, N = Nepal)..." : "Write first letter (e.g. 'I' for India)..."}
                  className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 pr-8 text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-[#c4903c] transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Country Dropdown Menu */}
              {isCountryDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#ede5d6] rounded-xl shadow-xl max-h-48 overflow-y-auto z-30 divide-y divide-[#f7f2e8]">
                  {filteredCountries.length === 0 ? (
                    <div className="p-2.5 text-center text-xs text-stone-400">
                      {isHi ? "कोई देश नहीं मिला" : "No matching country found"}
                    </div>
                  ) : (
                    filteredCountries.map((c) => {
                      const isSelected = selectedCountry === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => handleSelectCountry(c)}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition cursor-pointer ${
                            isSelected ? "bg-[#faf7f0] text-[#13382c] font-bold" : "text-stone-700 hover:bg-[#faf7f0]"
                          }`}
                        >
                          <span>{c}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#13382c]" />}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Step 2: State / Province Dropdown */}
            <div className="relative" ref={stateRef}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#13382c] text-white text-[10px] flex items-center justify-center font-mono">2</span>
                  <span>{isHi ? "2. राज्य / प्रांत चुनें (State / Province)" : "2. State / Province"}</span>
                </label>
                <span className="text-[10px] text-stone-400">
                  {isHi ? "पहला अक्षर लिखें" : "Write 1st letter"}
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={stateSearch}
                  onChange={(e) => {
                    setStateSearch(e.target.value);
                    setIsStateDropdownOpen(true);
                  }}
                  onFocus={() => setIsStateDropdownOpen(true)}
                  placeholder={
                    isHi
                      ? "पहला अक्षर लिखें (उदा. U = Uttar Pradesh, M = Maharashtra)..."
                      : "Write first letter (e.g. 'U' for Uttar Pradesh, 'M' for Maharashtra)..."
                  }
                  className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 pr-8 text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-[#c4903c] transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* State Dropdown Menu */}
              {isStateDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#ede5d6] rounded-xl shadow-xl max-h-48 overflow-y-auto z-30 divide-y divide-[#f7f2e8]">
                  {filteredStates.length === 0 ? (
                    <div className="p-2.5 text-center text-xs text-stone-400">
                      {isHi ? "इस देश में कोई राज्य नहीं मिला" : "No matching state found"}
                    </div>
                  ) : (
                    filteredStates.map((s) => {
                      const isSelected = selectedState === s;
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleSelectState(s)}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition cursor-pointer ${
                            isSelected ? "bg-[#faf7f0] text-[#13382c] font-bold" : "text-stone-700 hover:bg-[#faf7f0]"
                          }`}
                        >
                          <span>{s}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#13382c]" />}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Step 3: Town / City Dropdown */}
            <div className="relative" ref={townRef}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-[#c4903c] text-white text-[10px] flex items-center justify-center font-mono">3</span>
                  <span>{isHi ? "3. नगर / शहर / तीर्थ चुनें (Town / City)" : "3. Town / City / Pilgrimage Center"}</span>
                </label>
                <span className="text-[10px] text-stone-400">
                  {isHi ? "पहला अक्षर लिखकर चुनें" : "Type 1st letter to filter"}
                </span>
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={townSearch}
                  onChange={(e) => {
                    setTownSearch(e.target.value);
                    setIsTownDropdownOpen(true);
                  }}
                  onFocus={() => setIsTownDropdownOpen(true)}
                  placeholder={
                    isHi
                      ? "पहला अक्षर लिखें (उदा. V = Varanasi, D = Deoria, A = Ayodhya)..."
                      : "Type 1st letter (e.g. 'V' for Varanasi, 'D' for Deoria, 'A' for Ayodhya)..."
                  }
                  className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 pr-8 text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-[#c4903c] transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setIsTownDropdownOpen(!isTownDropdownOpen)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Town Dropdown Menu */}
              {isTownDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#ede5d6] rounded-xl shadow-xl max-h-56 overflow-y-auto z-30 divide-y divide-[#f7f2e8]">
                  {filteredTowns.length === 0 ? (
                    <div className="p-3 text-center text-xs text-stone-500 space-y-2">
                      <p>{isHi ? "इस राज्य में कोई पूर्वनिर्धारित नगर नहीं मिला।" : "No preset towns matching in this state."}</p>
                      {townSearch.trim() && (
                        <button
                          type="button"
                          onClick={() => {
                            const newPlace = {
                              name: townSearch.trim(),
                              lat: 26.5,
                              lon: 82.5,
                              tz: 5.5,
                              tzStr: "Asia/Kolkata",
                              isSacred: false,
                            };
                            handleSelectTown(newPlace, selectedState, selectedCountry);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#13382c] text-white text-[11px] font-semibold hover:bg-[#1a4a3b] transition"
                        >
                          + {isHi ? `"${townSearch.trim()}" को कस्टम नगर के रूप में जोड़ें` : `Add "${townSearch.trim()}" as custom town`}
                        </button>
                      )}
                    </div>
                  ) : (
                    filteredTowns.map((t) => {
                      const isSelected = selectedTown?.name === t.name;
                      return (
                        <button
                          key={t.name}
                          type="button"
                          onClick={() => handleSelectTown(t, selectedState, selectedCountry)}
                          className={`w-full text-left px-3 py-2.5 text-xs flex items-center justify-between transition cursor-pointer ${
                            isSelected ? "bg-[#faf7f0] text-[#13382c] font-bold" : "text-stone-700 hover:bg-[#faf7f0]"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className={`w-3.5 h-3.5 shrink-0 ${t.isSacred ? "text-[#c4903c]" : "text-stone-400"}`} />
                            <span className="truncate">{t.name}</span>
                            {t.isSacred && (
                              <span className="shrink-0 px-1.5 py-0.2 rounded bg-amber-50 text-[#c4903c] border border-amber-200 text-[9px] font-bold">
                                🕉️ {isHi ? "तीर्थ" : "Sacred"}
                              </span>
                            )}
                            {t.note && (
                              <span className="hidden sm:inline text-[10px] text-stone-400 truncate">
                                • {t.note}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-mono text-stone-400 shrink-0 ml-2">
                            {t.lat.toFixed(2)}°, {t.lon.toFixed(2)}°
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODE 2: QUICK SEARCH (Type 1st letter of any city/town worldwide) */}
        {activeMode === "quick" && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                {isHi ? "किसी भी शहर या तीर्थ का नाम लिखें" : "Search Any City, Town, or Sacred Kshetra"}
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  placeholder={
                    isHi
                      ? "पहला अक्षर लिखें (उदा. V = Varanasi, D = Deoria, A = Ayodhya, L = London)..."
                      : "Type 1st letter (e.g. 'V' for Varanasi, 'D' for Deoria, 'A' for Ayodhya, 'L' for London)..."
                  }
                  className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-[#c4903c] transition shadow-2xs"
                  autoFocus
                />
              </div>
            </div>

            {/* Quick Results List */}
            <div className="border border-[#ede5d6] rounded-xl divide-y divide-[#ede5d6] max-h-56 overflow-y-auto bg-white shadow-2xs">
              {quickQuery.trim().length === 0 ? (
                <div className="p-4 text-center text-xs text-stone-400">
                  {isHi
                    ? "खोजने के लिए पहला अक्षर या नगर का नाम लिखें।"
                    : "Type the first letter of any town, city, or pilgrimage center."}
                </div>
              ) : localQuickResults.length === 0 && onlineResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-stone-500 space-y-2">
                  <p>{isHi ? "स्थानीय डेटाबेस में परिणाम नहीं मिले।" : "No matches in local database."}</p>
                  <button
                    type="button"
                    onClick={handleSearchOnline}
                    disabled={isSearchingOnline}
                    className="px-3.5 py-1.5 rounded-lg bg-[#13382c] text-white text-xs font-semibold hover:bg-[#1a4a3b] transition cursor-pointer disabled:opacity-50"
                  >
                    {isSearchingOnline ? (isHi ? "खोज रहे हैं..." : "Searching Global Map...") : (isHi ? "🌐 विश्व मानचित्र (OSM) पर खोजें" : "🌐 Search Worldwide Map")}
                  </button>
                </div>
              ) : (
                <>
                  {localQuickResults.map((item, idx) => (
                    <button
                      key={`${item.name}-${idx}`}
                      type="button"
                      onClick={() => {
                        setCalculatedPlace({
                          name: item.name,
                          lat: String(item.lat),
                          lon: String(item.lon),
                          tz: String(item.tz),
                          tzStr: item.tzStr,
                          isSacred: item.isSacred,
                        });
                        setSelectedCountry(item.country);
                        setSelectedState(item.state);
                        setSelectedTown({ name: item.shortName, lat: item.lat, lon: item.lon, tz: item.tz, tzStr: item.tzStr, isSacred: item.isSacred });
                      }}
                      className="w-full text-left p-2.5 text-xs flex items-center justify-between hover:bg-[#faf7f0] transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className={`w-3.5 h-3.5 shrink-0 ${item.isSacred ? "text-[#c4903c]" : "text-stone-400"}`} />
                        <div className="truncate">
                          <div className="font-semibold text-stone-900 truncate flex items-center gap-1.5">
                            <span>{item.shortName}</span>
                            {item.isSacred && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-50 text-[#c4903c] border border-amber-200 text-[9px] font-bold">
                                🕉️ Sacred
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-stone-500 truncate">
                            {item.state}, {item.country}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className="text-[10px] font-mono text-stone-400 block">
                          {item.lat.toFixed(2)}°, {item.lon.toFixed(2)}°
                        </span>
                        <span className="text-[9px] text-[#c4903c] font-bold uppercase">
                          Auto Calc ✓
                        </span>
                      </div>
                    </button>
                  ))}

                  {/* Online Nominatim results if any */}
                  {onlineResults.map((item, idx) => (
                    <button
                      key={`online-${idx}`}
                      type="button"
                      onClick={() => {
                        setCalculatedPlace({
                          name: item.name,
                          lat: String(item.lat),
                          lon: String(item.lon),
                          tz: String(item.tz),
                          tzStr: item.tzStr,
                          isSacred: false,
                        });
                      }}
                      className="w-full text-left p-2.5 text-xs flex items-center justify-between hover:bg-[#faf7f0] transition cursor-pointer bg-emerald-50/30"
                    >
                      <div className="truncate">
                        <div className="font-semibold text-stone-900 truncate">
                          🌐 {item.shortName}
                        </div>
                        <div className="text-[10px] text-stone-500 truncate">{item.name}</div>
                      </div>
                      <span className="text-[10px] font-mono text-stone-400 shrink-0 ml-2">
                        {item.lat.toFixed(2)}°, {item.lon.toFixed(2)}°
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* MODE 3: MANUAL INPUT (Exact match with previous modal fields) */}
        {activeMode === "manual" && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                {isHi ? "स्थान का नाम (Place Name)" : "Place Name"}
              </label>
              <input
                type="text"
                value={calculatedPlace.name}
                onChange={(e) => setCalculatedPlace({ ...calculatedPlace, name: e.target.value })}
                placeholder="e.g. Paris, France or Tokyo, Japan or Ayodhya, India"
                className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  {isHi ? "अक्षांश (Latitude: -90° to 90°)" : "Latitude (-90° to 90°)"}
                </label>
                <input
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  value={calculatedPlace.lat}
                  onChange={(e) => setCalculatedPlace({ ...calculatedPlace, lat: e.target.value })}
                  placeholder="e.g. 28.6139"
                  className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:bg-white"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700 block">
                    {isHi ? "देशांतर (-180° to 180°)" : "Longitude (-180° to 180°)"}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const estTz = estimateTzFromLongitude(calculatedPlace.lon);
                      setCalculatedPlace((f) => ({
                        ...f,
                        tz: estTz.toString(),
                        tzStr: `UTC${formatTzOffset(estTz)}`,
                      }));
                    }}
                    className="text-[10px] text-[#c4903c] font-semibold hover:underline cursor-pointer"
                  >
                    {isHi ? "स्वतः TZ" : "Auto TZ"}
                  </button>
                </div>
                <input
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  value={calculatedPlace.lon}
                  onChange={(e) => {
                    const newLon = e.target.value;
                    const estTz = estimateTzFromLongitude(newLon);
                    setCalculatedPlace({
                      ...calculatedPlace,
                      lon: newLon,
                      tz: estTz.toString(),
                      tzStr: `UTC${formatTzOffset(estTz)}`,
                    });
                  }}
                  placeholder="e.g. 77.2090"
                  className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                {isHi ? "समय क्षेत्र ऑफसेट (Timezone Offset)" : "Timezone Offset (Hours from UTC)"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={
                    COMMON_TIMEZONES.some((tz) => {
                      const [hStr, mStr] = tz.value.replace("+", "").split(":");
                      const val = parseFloat(hStr) + (parseFloat(mStr || "0") / 60) * (tz.value.startsWith("-") ? -1 : 1);
                      return Math.abs(val - parseFloat(calculatedPlace.tz)) < 0.05;
                    })
                      ? calculatedPlace.tz
                      : "custom"
                  }
                  onChange={(e) => {
                    if (e.target.value !== "custom") {
                      const hours = parseFloat(e.target.value);
                      setCalculatedPlace({
                        ...calculatedPlace,
                        tz: hours.toString(),
                        tzStr: `UTC${formatTzOffset(hours)}`,
                      });
                    }
                  }}
                  className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-2.5 py-2 text-xs text-stone-900 focus:outline-none focus:bg-white"
                >
                  {COMMON_TIMEZONES.map((tz) => {
                    const sign = tz.value.startsWith("-") ? -1 : 1;
                    const [hStr, mStr] = tz.value.replace(/^[+-]/, "").split(":");
                    const h = sign * (parseFloat(hStr) + (parseFloat(mStr || "0") / 60));
                    return (
                      <option key={tz.value} value={h.toString()}>
                        {tz.label}
                      </option>
                    );
                  })}
                  <option value="custom">Custom hours offset...</option>
                </select>
                <input
                  type="number"
                  step="0.25"
                  min="-12"
                  max="14"
                  value={calculatedPlace.tz}
                  onChange={(e) =>
                    setCalculatedPlace({
                      ...calculatedPlace,
                      tz: e.target.value,
                      tzStr: `UTC${formatTzOffset(parseFloat(e.target.value) || 0)}`,
                    })
                  }
                  placeholder="e.g. 5.5, 9, -5"
                  className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* AUTOMATIC CALCULATION CARD (Shows in Hierarchy & Quick modes) */}
        {activeMode !== "manual" && (
          <div className="bg-[#faf7f0] border border-[#ede5d6] rounded-xl p-3.5 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#ede5d6]/60 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#13382c]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isHi ? "स्वतः परिकलित विवरण (Auto-Calculated)" : "Automatically Calculated Details"}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowManualOverride(!showManualOverride)}
                className="text-[10px] font-semibold text-[#c4903c] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>{showManualOverride ? (isHi ? "छुपाएं" : "Hide") : (isHi ? "सत्यापित / संपादित करें" : "Edit / Fine-tune")}</span>
              </button>
            </div>

            {/* Selected Location Banner */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#c4903c] shrink-0" />
              <div className="text-xs font-bold text-stone-900 truncate">
                {calculatedPlace.name}
              </div>
            </div>

            {/* Coordinates & TZ Metric Badges */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white border border-[#ede5d6]">
                <span className="text-[10px] text-stone-400 block font-medium uppercase tracking-wider">
                  {isHi ? "अक्षांश (Lat)" : "Latitude"}
                </span>
                <span className="text-xs font-bold font-mono text-stone-800">
                  {parseFloat(calculatedPlace.lat || 0).toFixed(4)}° {parseFloat(calculatedPlace.lat) >= 0 ? "N" : "S"}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#ede5d6]">
                <span className="text-[10px] text-stone-400 block font-medium uppercase tracking-wider">
                  {isHi ? "देशांतर (Lon)" : "Longitude"}
                </span>
                <span className="text-xs font-bold font-mono text-stone-800">
                  {parseFloat(calculatedPlace.lon || 0).toFixed(4)}° {parseFloat(calculatedPlace.lon) >= 0 ? "E" : "W"}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white border border-[#ede5d6]">
                <span className="text-[10px] text-stone-400 block font-medium uppercase tracking-wider">
                  {isHi ? "समय-क्षेत्र (TZ)" : "Timezone"}
                </span>
                <span className="text-xs font-bold font-mono text-stone-800">
                  {formatTzOffset(parseFloat(calculatedPlace.tz || 5.5))}
                </span>
              </div>
            </div>

            {/* Optional Editable Override Fields */}
            {showManualOverride && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#ede5d6]/60">
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block mb-0.5">Lat (°)</label>
                  <input
                    type="number"
                    step="any"
                    value={calculatedPlace.lat}
                    onChange={(e) => setCalculatedPlace({ ...calculatedPlace, lat: e.target.value })}
                    className="w-full bg-white border border-[#ede5d6] rounded-lg px-2 py-1 text-xs text-stone-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block mb-0.5">Lon (°)</label>
                  <input
                    type="number"
                    step="any"
                    value={calculatedPlace.lon}
                    onChange={(e) => setCalculatedPlace({ ...calculatedPlace, lon: e.target.value })}
                    className="w-full bg-white border border-[#ede5d6] rounded-lg px-2 py-1 text-xs text-stone-800 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-stone-600 block mb-0.5">TZ Hours</label>
                  <input
                    type="number"
                    step="0.25"
                    value={calculatedPlace.tz}
                    onChange={(e) => setCalculatedPlace({ ...calculatedPlace, tz: e.target.value })}
                    className="w-full bg-white border border-[#ede5d6] rounded-lg px-2 py-1 text-xs text-stone-800 font-mono"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-[#ede5d6]">
          <div className="text-[11px] text-stone-500 hidden sm:flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#c4903c]" />
            <span>{isHi ? "सटीक पंचांग व लग्न गणना के लिए तैयार" : "Ephemeris & Panchang Ready"}</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
            >
              {isHi ? "रद्द करें" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-[#0f2e22] hover:bg-[#184433] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isHi ? "स्थान लागू करें" : "Apply Location"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
