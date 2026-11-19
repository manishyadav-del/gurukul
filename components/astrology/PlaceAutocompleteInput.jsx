"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  MapPin,
  Search,
  Globe,
  Sparkles,
  Loader2,
  Navigation,
  X,
  Check,
} from "lucide-react";
import {
  searchAllLocations,
  formatTzOffset,
  estimateTzFromLongitude,
} from "./worldLocations";

/**
 * Reusable Place Autocomplete Input Component.
 * 
 * Supports:
 * - Instant offline client-side search across 340+ towns, sacred shrines, and global cities (<5ms).
 * - Devanagari Hindi & English input ("अयोध्या", "टोक्यो", "Varanasi", "Tokyo", etc.).
 * - Debounced online geocoding fallback for obscure villages via /api/astrology/location-lookup.
 * - One-click GPS Auto-detection (navigator.geolocation).
 * - Full keyboard navigation (Arrow Up, Arrow Down, Enter, Escape).
 * - Seamless integration with Kundli and Astrology forms.
 */
export default function PlaceAutocompleteInput({
  value = "",
  onChange,
  onSelectLocation,
  placeholder,
  isHi = false,
  className = "",
  onOpenModal,
  disabled = false,
  autoFocus = false,
}) {
  const [inputValue, setInputValue] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsNotice, setGpsNotice] = useState(null);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Sync internal input value with prop if changed from outside
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Click outside listener to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Quick popular recommendations when input is focused but empty
  const defaultPopularPlaces = useMemo(() => {
    return [
      {
        name: "Ayodhya, Uttar Pradesh, India",
        shortName: isHi ? "अयोध्या" : "Ayodhya",
        state: isHi ? "उत्तर प्रदेश" : "Uttar Pradesh",
        country: isHi ? "भारत" : "India",
        lat: 26.7922,
        lon: 82.1998,
        tz: 5.5,
        tzStr: "Asia/Kolkata",
        isSacred: true,
        note: isHi ? "राम जन्मभूमि तीर्थ" : "Ram Janmabhoomi",
      },
      {
        name: "Varanasi (Kashi), Uttar Pradesh, India",
        shortName: isHi ? "वाराणसी (काशी)" : "Varanasi (Kashi)",
        state: isHi ? "उत्तर प्रदेश" : "Uttar Pradesh",
        country: isHi ? "भारत" : "India",
        lat: 25.3176,
        lon: 82.9739,
        tz: 5.5,
        tzStr: "Asia/Kolkata",
        isSacred: true,
        note: isHi ? "काशी विश्वनाथ ज्योतिर्लिंग" : "Kashi Vishwanath",
      },
      {
        name: "Ujjain, Madhya Pradesh, India",
        shortName: isHi ? "उज्जैन" : "Ujjain",
        state: isHi ? "मध्य प्रदेश" : "Madhya Pradesh",
        country: isHi ? "भारत" : "India",
        lat: 23.1765,
        lon: 75.7885,
        tz: 5.5,
        tzStr: "Asia/Kolkata",
        isSacred: true,
        note: isHi ? "महाकालेश्वर ज्योतिर्लिंग" : "Mahakaleshwar",
      },
      {
        name: "New Delhi, Delhi, India",
        shortName: isHi ? "नई दिल्ली" : "New Delhi",
        state: isHi ? "दिल्ली" : "Delhi",
        country: isHi ? "भारत" : "India",
        lat: 28.6139,
        lon: 77.2090,
        tz: 5.5,
        tzStr: "Asia/Kolkata",
        isSacred: false,
        note: isHi ? "राजधानी" : "Capital",
      },
      {
        name: "Tokyo, Japan, Japan",
        shortName: isHi ? "टोक्यो" : "Tokyo",
        state: isHi ? "जापान" : "Japan",
        country: isHi ? "जापान" : "Japan",
        lat: 35.6762,
        lon: 139.6503,
        tz: 9.0,
        tzStr: "Asia/Tokyo",
        isSacred: false,
        note: isHi ? "जापान राजधानी" : "Japan Capital",
      },
      {
        name: "London, England, UK",
        shortName: isHi ? "लंदन" : "London",
        state: "England",
        country: "UK",
        lat: 51.5074,
        lon: -0.1278,
        tz: 0.0,
        tzStr: "Europe/London",
        isSacred: false,
        note: isHi ? "ग्रीनविच मेरिडियन" : "GMT / UTC+0",
      },
    ];
  }, [isHi]);

  // Execute query search
  const performSearch = useCallback(
    (query) => {
      const q = (query || "").trim();
      if (!q) {
        setSuggestions(defaultPopularPlaces);
        setIsSearchingOnline(false);
        return;
      }

      // 1. Instant local search (<5ms)
      const localMatches = searchAllLocations(q, 8);
      setSuggestions(localMatches);
      setHighlightIndex(-1);

      // 2. If fewer than 2 results and query >= 3 characters, try online lookup fallback
      if (localMatches.length < 2 && q.length >= 3) {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(async () => {
          setIsSearchingOnline(true);
          try {
            const res = await fetch(
              `/api/astrology/location-lookup?q=${encodeURIComponent(q)}&online=1`
            );
            if (res.ok) {
              const data = await res.json();
              if (data?.results && data.results.length > 0) {
                // Combine and deduplicate
                const existingNames = new Set(localMatches.map((m) => m.name.toLowerCase()));
                const newOnlineMatches = data.results.filter(
                  (r) => !existingNames.has(r.name.toLowerCase())
                );
                setSuggestions([...localMatches, ...newOnlineMatches].slice(0, 8));
              }
            }
          } catch {
            // Graceful silent fallback to local matches
          } finally {
            setIsSearchingOnline(false);
          }
        }, 400);
      } else {
        setIsSearchingOnline(false);
      }
    },
    [defaultPopularPlaces]
  );

  // Handle typing in input
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (onChange) onChange(val);
    setIsOpen(true);
    performSearch(val);
  };

  // Select a suggestion
  const handleSelect = (loc) => {
    const formattedName = loc.name || `${loc.shortName || ""}, ${loc.country || ""}`;
    setInputValue(formattedName);
    setIsOpen(false);
    setHighlightIndex(-1);

    if (onChange) onChange(formattedName);
    if (onSelectLocation) {
      onSelectLocation({
        name: formattedName,
        shortName: loc.shortName || loc.name,
        state: loc.state || "",
        country: loc.country || "",
        lat: loc.lat,
        lon: loc.lon,
        tz: loc.tz !== undefined ? loc.tz : 5.5,
        tzStr: loc.tzStr || (loc.tz !== undefined ? `UTC${formatTzOffset(loc.tz)}` : "Asia/Kolkata"),
        isSacred: !!loc.isSacred,
        note: loc.note || "",
      });
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        performSearch(inputValue);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightIndex(-1);
    }
  };

  // Browser GPS auto-detection
  const handleGpsDetect = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsNotice(isHi ? "आपके ब्राउज़र में GPS उपलब्ध नहीं है" : "GPS not supported on this browser");
      setTimeout(() => setGpsNotice(null), 3500);
      return;
    }

    setIsGpsLoading(true);
    setGpsNotice(isHi ? "स्थान खोजा जा रहा है..." : "Locating via GPS...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLoading(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lon = parseFloat(pos.coords.longitude.toFixed(4));
        const tzEst = estimateTzFromLongitude(lon);
        const tzStr = `UTC${formatTzOffset(tzEst)}`;

        // Check if there is a known nearby town (within ~35km)
        let resolvedName = `Current Location (${lat > 0 ? `${lat}°N` : `${Math.abs(lat)}°S`}, ${lon > 0 ? `${lon}°E` : `${Math.abs(lon)}°W`})`;
        let isSacred = false;
        let note = "GPS Location";

        const localMatches = searchAllLocations("", 100);
        let closestTown = null;
        let minDistanceSq = 0.15; // roughly ~40km

        for (const loc of localMatches) {
          const dLat = loc.lat - lat;
          const dLon = loc.lon - lon;
          const dSq = dLat * dLat + dLon * dLon;
          if (dSq < minDistanceSq) {
            minDistanceSq = dSq;
            closestTown = loc;
          }
        }

        if (closestTown) {
          resolvedName = `${closestTown.name} (GPS: ${lat}°, ${lon}°)`;
          isSacred = closestTown.isSacred;
          note = closestTown.note || "Near GPS Coordinates";
        }

        setInputValue(resolvedName);
        setGpsNotice(isHi ? "स्थान सफलतापूर्वक पहचाना गया!" : "Location detected!");
        setTimeout(() => setGpsNotice(null), 2500);

        if (onChange) onChange(resolvedName);
        if (onSelectLocation) {
          onSelectLocation({
            name: resolvedName,
            lat,
            lon,
            tz: tzEst,
            tzStr,
            isSacred,
            note,
          });
        }
      },
      (err) => {
        setIsGpsLoading(false);
        let msg = isHi ? "स्थान अनुमति अस्वीकृत या अनुपलब्ध" : "Location permission denied";
        if (err.code === 2) msg = isHi ? "स्थान सिग्नल अनुपलब्ध है" : "Position unavailable";
        if (err.code === 3) msg = isHi ? "स्थान पहचान समय समाप्त" : "GPS request timed out";
        setGpsNotice(msg);
        setTimeout(() => setGpsNotice(null), 3500);
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 60000 }
    );
  };

  // Clear input
  const handleClear = () => {
    setInputValue("");
    if (onChange) onChange("");
    setSuggestions(defaultPopularPlaces);
    if (inputRef.current) inputRef.current.focus();
  };

  const defaultPlaceholder = isHi
    ? "उदा. टोक्यो, जापान / अयोध्या, भारत"
    : "e.g. Tokyo, Japan / Ayodhya, India / Paris, France";

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        {/* Left search icon */}
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
          <Search className="w-3.5 h-3.5" />
        </div>

        {/* Text Input */}
        <input
          ref={inputRef}
          type="text"
          required
          disabled={disabled}
          autoFocus={autoFocus}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            setIsOpen(true);
            performSearch(inputValue);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || defaultPlaceholder}
          className={
            className ||
            "w-full bg-white border border-[#ede5d6] focus:border-[#D05C3B] rounded-lg pl-8 pr-20 py-1.5 text-xs text-[#30251F] placeholder:text-stone-400 transition focus:outline-none shadow-2xs"
          }
          autoComplete="off"
        />

        {/* Right action buttons: Clear, GPS, Loader, Modal */}
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-stone-400 hover:text-stone-600 rounded-md transition"
              title={isHi ? "साफ़ करें" : "Clear"}
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* GPS Auto-detect button */}
          <button
            type="button"
            onClick={handleGpsDetect}
            disabled={isGpsLoading}
            className={`p-1 rounded-md transition flex items-center gap-0.5 text-[10px] font-medium ${
              isGpsLoading
                ? "text-[#D05C3B] bg-orange-50"
                : "text-stone-500 hover:text-[#D05C3B] hover:bg-orange-50"
            }`}
            title={isHi ? "ब्राउज़र GPS द्वारा वर्तमान स्थान स्वतः पहचानें" : "Auto-detect location with GPS"}
          >
            {isGpsLoading ? (
              <Loader2 className="w-3 h-3 animate-spin text-[#D05C3B]" />
            ) : (
              <Navigation className="w-3 h-3" />
            )}
          </button>

          {/* Optional: Atlas hierarchy modal trigger */}
          {onOpenModal && (
            <button
              type="button"
              onClick={onOpenModal}
              className="p-1 text-stone-500 hover:text-[#13382c] hover:bg-stone-100 rounded-md transition"
              title={isHi ? "संपूर्ण विश्व एटलस खोलें (देश > राज्य > नगर)" : "Browse World Atlas Hierarchy"}
            >
              <Globe className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* GPS Status Notice Toast */}
      {gpsNotice && (
        <div className="absolute top-full left-0 mt-1 z-30 px-2 py-1 bg-[#30251F] text-amber-100 text-[11px] rounded-md shadow-md animate-fade-in flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-[#D05C3B]" />
          <span>{gpsNotice}</span>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-[#ede5d6] rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto animate-fade-in divide-y divide-[#f5efe6]">
          {/* Header indicator */}
          <div className="px-3 py-1.5 bg-[#FAF7F0] flex items-center justify-between text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
            <span>
              {!inputValue.trim()
                ? isHi
                  ? "⭐ लोकप्रिय पवित्र तीर्थ व महानगर"
                  : "⭐ Popular Shrines & Metros"
                : isHi
                ? `स्थान परिणाम (${suggestions.length})`
                : `Matching Places (${suggestions.length})`}
            </span>
            {isSearchingOnline && (
              <span className="flex items-center gap-1 text-[#D05C3B] lowercase tracking-normal">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                {isHi ? "ऑनलाइन खोज..." : "searching..."}
              </span>
            )}
          </div>

          {/* Results list */}
          {suggestions.length > 0 ? (
            suggestions.map((loc, idx) => {
              const isSelected = highlightIndex === idx;
              const isSacred = !!loc.isSacred;
              const formattedTz =
                typeof loc.tz === "number" ? formatTzOffset(loc.tz) : loc.tz || "+05:30";

              return (
                <div
                  key={`${loc.name || loc.shortName}-${loc.lat}-${loc.lon}-${idx}`}
                  onMouseDown={() => handleSelect(loc)}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  className={`px-3 py-2 cursor-pointer transition flex items-start gap-2.5 ${
                    isSelected ? "bg-[#F7F5F0]" : "hover:bg-[#FAF7F0]"
                  }`}
                >
                  {/* Left Pin / Sacred icon */}
                  <div className="mt-0.5 shrink-0">
                    {isSacred ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-100 text-[#c4903c]" title="Sacred Shrine">
                        <Sparkles className="w-3 h-3 text-[#D05C3B]" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-stone-100 text-stone-500">
                        <MapPin className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  {/* Main text content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-[#30251F] truncate">
                        {loc.shortName || loc.name}
                      </span>
                      {isSacred && (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          {loc.note || (isHi ? "पवित्र तीर्थ" : "Sacred Tirtha")}
                        </span>
                      )}
                      {!isSacred && loc.note && (
                        <span className="text-[9px] text-stone-400">
                          ({loc.note})
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-stone-500 flex items-center gap-2 mt-0.5">
                      <span className="truncate">
                        {loc.state ? `${loc.state}, ` : ""}
                        {loc.country || "India"}
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="font-mono text-[9px] text-stone-600">
                        {typeof loc.lat === "number" ? loc.lat.toFixed(2) : loc.lat}°,{" "}
                        {typeof loc.lon === "number" ? loc.lon.toFixed(2) : loc.lon}°
                      </span>
                      <span className="text-stone-300">•</span>
                      <span className="font-mono text-[9px] text-stone-600 font-medium">
                        UTC{formattedTz}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="self-center text-[#D05C3B]">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-4 py-3 text-center text-xs text-stone-500">
              {isHi
                ? "कोई स्थान नहीं मिला। अक्षांश और देशांतर सीधे नीचे दर्ज कर सकते हैं।"
                : "No matching location found. You can enter custom coordinates below."}
            </div>
          )}

          {/* Footer quick help */}
          <div className="px-3 py-1.5 bg-[#FAF7F0] flex items-center justify-between text-[10px] text-stone-400 border-t border-[#ede5d6]">
            <span>{isHi ? "↑↓ से चुनें, Enter दबाएं" : "Use ↑↓ arrows to navigate, Enter to select"}</span>
            {onOpenModal && (
              <button
                type="button"
                onMouseDown={onOpenModal}
                className="text-[#D05C3B] font-semibold hover:underline"
              >
                {isHi ? "+ पूर्ण एटलस सूची" : "+ Full Atlas List"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
