"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  UserPlus,
  Heart,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  Shield,
  Compass,
  Star,
  RefreshCw,
} from "lucide-react";
import WorldLocationModal from "./WorldLocationModal";

const RELATIONSHIP_LABELS = {
  SELF: { en: "Myself (Seeker)", hi: "स्वयं (जिज्ञासु)", color: "bg-[#13382c] text-white border-[#13382c]" },
  SPOUSE: { en: "Spouse", hi: "जीवनसाथी", color: "bg-rose-50 text-rose-800 border-rose-200" },
  CHILD: { en: "Child / Son / Daughter", hi: "संतान (पुत्र / पुत्री)", color: "bg-blue-50 text-blue-800 border-blue-200" },
  PARENT: { en: "Parent (Father / Mother)", hi: "माता-पिता", color: "bg-amber-50 text-amber-800 border-amber-200" },
  SIBLING: { en: "Sibling (Brother / Sister)", hi: "भाई / बहन", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  GRANDPARENT: { en: "Grandparent", hi: "दादा / दादी / नाना / नानी", color: "bg-purple-50 text-purple-800 border-purple-200" },
  FRIEND: { en: "Friend", hi: "मित्र", color: "bg-teal-50 text-teal-800 border-teal-200" },
  OTHER: { en: "Family Member", hi: "पारिवारिक सदस्य", color: "bg-stone-100 text-stone-800 border-stone-200" },
};

const RASHI_SYMBOLS = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓",
};

const RASHI_TRANSLATIONS = {
  Aries: { hi: "मेष", element: "Fire", lord: "Mars" },
  Taurus: { hi: "वृषभ", element: "Earth", lord: "Venus" },
  Gemini: { hi: "मिथुन", element: "Air", lord: "Mercury" },
  Cancer: { hi: "कर्क", element: "Water", lord: "Moon" },
  Leo: { hi: "सिंह", element: "Fire", lord: "Sun" },
  Virgo: { hi: "कन्या", element: "Earth", lord: "Mercury" },
  Libra: { hi: "तुला", element: "Air", lord: "Venus" },
  Scorpio: { hi: "वृश्चिक", element: "Water", lord: "Mars" },
  Sagittarius: { hi: "धनु", element: "Fire", lord: "Jupiter" },
  Capricorn: { hi: "मकर", element: "Earth", lord: "Saturn" },
  Aquarius: { hi: "कुम्भ", element: "Air", lord: "Saturn" },
  Pisces: { hi: "मीन", element: "Water", lord: "Jupiter" },
};

export default function FamilyAstrologyCircle({
  isHi = false,
  selectedRashi = "Scorpio",
  onSelectRashi,
  currentPanchang,
  selectedDate,
}) {
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState("self");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Form State for Adding Family Member
  const [formData, setFormData] = useState({
    name: "",
    relationship: "SPOUSE",
    gender: "female",
    dateOfBirth: "1998-05-15",
    birthTime: "08:30",
    birthPlace: "Ayodhya, Uttar Pradesh, India",
    latitude: 26.7922,
    longitude: 82.1998,
    timezone: "Asia/Kolkata",
  });

  // Load family members from API and LocalStorage
  const loadFamilyMembers = useCallback(async () => {
    let localMembers = [];
    try {
      const stored = localStorage.getItem("gurukul_family_circle");
      if (stored) {
        localMembers = JSON.parse(stored);
      }
    } catch {
      // Ignore
    }

    try {
      const res = await fetch("/api/family");
      if (res.ok) {
        const data = await res.json();
        const apiMembers = (data.members || []).map((m) => {
          const bp = m.birthProfile || {};
          const bc = bp.birthChart || {};
          return {
            id: m.id,
            name: m.name,
            relationship: m.relationship || "OTHER",
            gender: m.gender,
            dateOfBirth: m.dateOfBirth ? m.dateOfBirth.split("T")[0] : "",
            birthTime: m.birthTime || "",
            birthPlace: m.birthPlace || "",
            moonSign: bc.moonSign || "Aries",
            nakshatra: bc.moonNakshatra || "Ashwini",
            lagnaSign: bc.lagnaSign || "Aries",
            currentDasha: bc.currentDasha || "Active Cycle",
          };
        });

        // Merge API members with local members (avoid duplicates by name)
        const combined = [...apiMembers];
        for (const loc of localMembers) {
          if (!combined.some((c) => c.name.toLowerCase() === loc.name.toLowerCase())) {
            combined.push(loc);
          }
        }
        setMembers(combined);
        return;
      }
    } catch {
      // Fallback to local
    }

    if (localMembers.length > 0) {
      setMembers(localMembers);
    } else {
      // Default sample family members for instant intuitive demo
      const sample = [
        {
          id: "member-1",
          name: isHi ? "प्रिया (जीवनसाथी)" : "Priya (Spouse)",
          relationship: "SPOUSE",
          gender: "female",
          dateOfBirth: "1996-10-24",
          birthTime: "07:15",
          birthPlace: "Varanasi, Uttar Pradesh, India",
          moonSign: "Cancer",
          nakshatra: "Pushya",
          lagnaSign: "Scorpio",
          currentDasha: "Jupiter / Moon",
        },
        {
          id: "member-2",
          name: isHi ? "आरव (पुत्र)" : "Aarav (Child)",
          relationship: "CHILD",
          gender: "male",
          dateOfBirth: "2018-03-12",
          birthTime: "11:45",
          birthPlace: "New Delhi, India",
          moonSign: "Leo",
          nakshatra: "Magha",
          lagnaSign: "Gemini",
          currentDasha: "Sun / Mars",
        },
      ];
      setMembers(sample);
      try {
        localStorage.setItem("gurukul_family_circle", JSON.stringify(sample));
      } catch {}
    }
  }, [isHi]);

  useEffect(() => {
    loadFamilyMembers();
  }, [loadFamilyMembers]);

  // Selected Person details
  const activeProfile = useMemo(() => {
    if (selectedMemberId === "self") {
      return {
        id: "self",
        name: isHi ? "आप (मुख्य साधक)" : "You (Primary Seeker)",
        relationship: "SELF",
        moonSign: selectedRashi,
        nakshatra: currentPanchang?.nakshatra?.name || "Dhanishta",
        lagnaSign: "Scorpio",
        currentDasha: "Mars Mahadasha",
        isSelf: true,
      };
    }
    return members.find((m) => m.id === selectedMemberId) || null;
  }, [selectedMemberId, members, selectedRashi, currentPanchang, isHi]);

  // Switch member
  const handleSelectMember = (memberId) => {
    setSelectedMemberId(memberId);
    if (memberId === "self") {
      // Keep or reset
    } else {
      const match = members.find((m) => m.id === memberId);
      if (match && match.moonSign && onSelectRashi) {
        onSelectRashi(match.moonSign);
      }
    }
  };

  // Handle Save New Family Member
  const handleSaveMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      if (!formData.name.trim()) {
        throw new Error("Please enter family member's name.");
      }

      // Compute astronomical chart for the new member
      let computedMoon = "Aries";
      let computedNakshatra = "Ashwini";
      let computedLagna = "Aries";
      let computedDasha = "Jupiter";

      try {
        const chartRes = await fetch("/api/astrology/chart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            birthDate: formData.dateOfBirth,
            birthTime: formData.birthTime,
            birthPlace: formData.birthPlace,
            latitude: formData.latitude,
            longitude: formData.longitude,
            timezone: formData.timezone,
            gender: formData.gender,
          }),
        });
        if (chartRes.ok) {
          const chartData = await chartRes.json();
          if (chartData?.chart) {
            computedMoon = chartData.chart.moon?.sign || "Aries";
            computedNakshatra = chartData.chart.moon?.nakshatra || "Ashwini";
            computedLagna = chartData.chart.lagna?.sign || "Aries";
            computedDasha = chartData.chart.dasha?.currentMahadasha || "Jupiter";
          }
        }
      } catch {
        // Fallback
      }

      const newMember = {
        id: `family-${Date.now()}`,
        name: formData.name.trim(),
        relationship: formData.relationship,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        birthTime: formData.birthTime,
        birthPlace: formData.birthPlace,
        moonSign: computedMoon,
        nakshatra: computedNakshatra,
        lagnaSign: computedLagna,
        currentDasha: computedDasha,
      };

      // Try saving to backend API
      try {
        await fetch("/api/family", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            relationship: formData.relationship,
            gender: formData.gender,
            dateOfBirth: formData.dateOfBirth,
            birthTime: formData.birthTime,
            birthPlace: formData.birthPlace,
            latitude: formData.latitude,
            longitude: formData.longitude,
            timezone: formData.timezone,
          }),
        });
      } catch {
        // Continue with local save
      }

      const updated = [...members, newMember];
      setMembers(updated);
      try {
        localStorage.setItem("gurukul_family_circle", JSON.stringify(updated));
      } catch {}

      // Select newly added member
      setSelectedMemberId(newMember.id);
      if (onSelectRashi) {
        onSelectRashi(newMember.moonSign);
      }
      setShowAddModal(false);
    } catch (err) {
      setFormError(err.message || "Failed to add family member.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Family Circle Header Bar & Member Pills */}
      <div className="bg-white rounded-2xl border border-[#ede5d6] p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ede5d6]/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#faf7f0] text-[#c4903c] border border-[#ede5d6] shadow-2xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 font-serif flex items-center gap-2">
                <span>{isHi ? "पारिवारिक कुंडली व दैनिक गोचर" : "Family Astrology Circle"}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#faf7f0] text-[#c4903c] border border-[#ede5d6]">
                  {members.length + 1} {isHi ? "सदस्य" : "Members"}
                </span>
              </h2>
              <p className="text-[11px] text-stone-500">
                {isHi
                  ? "स्वयं अथवा परिवार के किसी भी सदस्य को चुनकर उनका व्यक्तिगत राशिफल व शुभ मुहूर्त देखें।"
                  : "Switch between family members to view their personalized Moon sign, Dasha, and daily transits."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#13382c] text-white hover:bg-[#1a4a3b] text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#c4903c]" />
            <span>{isHi ? "+ सदस्य जोड़ें" : "+ Add Member"}</span>
          </button>
        </div>

        {/* Member Pills Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* Self Profile Pill */}
          <button
            type="button"
            onClick={() => handleSelectMember("self")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition shrink-0 cursor-pointer ${
              selectedMemberId === "self"
                ? "bg-[#13382c] text-white border-[#13382c] shadow-xs"
                : "bg-[#faf7f0] text-stone-700 border-[#ede5d6] hover:bg-[#f3ecde]"
            }`}
          >
            <span className="text-sm">👑</span>
            <div className="text-left">
              <div className="font-bold leading-tight">{isHi ? "स्वयं (आप)" : "Self (You)"}</div>
              <div className={`text-[10px] ${selectedMemberId === "self" ? "text-emerald-200" : "text-stone-400"}`}>
                {RASHI_SYMBOLS[selectedRashi]} {selectedRashi}
              </div>
            </div>
          </button>

          {/* Family Members Pills */}
          {members.map((m) => {
            const isSelected = selectedMemberId === m.id;
            const relBadge = RELATIONSHIP_LABELS[m.relationship] || RELATIONSHIP_LABELS.OTHER;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSelectMember(m.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#13382c] text-white border-[#13382c] shadow-xs"
                    : "bg-white text-stone-700 border-[#ede5d6] hover:bg-[#faf7f0]"
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-[#faf7f0] border border-[#ede5d6] flex items-center justify-center text-xs text-[#c4903c]">
                  {RASHI_SYMBOLS[m.moonSign] || "🌙"}
                </div>
                <div className="text-left">
                  <div className="font-bold leading-tight flex items-center gap-1">
                    <span>{m.name}</span>
                    <span className={`text-[9px] px-1 py-0.2 rounded border ${relBadge.color}`}>
                      {isHi ? relBadge.hi.split(" ")[0] : relBadge.en.split(" ")[0]}
                    </span>
                  </div>
                  <div className={`text-[10px] ${isSelected ? "text-emerald-200" : "text-stone-400"}`}>
                    {m.moonSign} • {m.nakshatra}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Personalized Vedic Card for the Selected Member */}
      {activeProfile && (
        <div className="bg-gradient-to-br from-[#faf7f0] to-white rounded-2xl border border-[#ede5d6] p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ede5d6]/70 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#fae4bd] flex items-center justify-center text-2xl text-[#c4903c] shadow-xs font-serif">
                {RASHI_SYMBOLS[activeProfile.moonSign] || "♈"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-stone-900 font-serif">
                    {activeProfile.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#13382c]/10 text-[#13382c] border border-[#13382c]/20">
                    {activeProfile.isSelf ? (isHi ? "मुख्य साधक" : "Self") : activeProfile.relationship}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  {isHi ? "चंद्र राशि: " : "Moon Sign: "}
                  <strong className="text-stone-900">{activeProfile.moonSign} ({RASHI_TRANSLATIONS[activeProfile.moonSign]?.hi})</strong>
                  {" • "}
                  {isHi ? "नक्षत्र: " : "Nakshatra: "}
                  <strong className="text-stone-900">{activeProfile.nakshatra}</strong>
                  {activeProfile.lagnaSign && (
                    <>
                      {" • "}
                      {isHi ? "लग्न: " : "Lagna: "}
                      <span className="text-stone-700">{activeProfile.lagnaSign}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>{activeProfile.currentDasha || "Active Dasha"}</span>
              </span>
            </div>
          </div>

          {/* Quick Metrics: Today's Favorable Energy for This Person */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-white border border-[#ede5d6]">
              <span className="text-[10px] text-stone-400 font-semibold block uppercase tracking-wider">
                {isHi ? "शुभ रंग (Color)" : "Lucky Color"}
              </span>
              <span className="text-xs font-bold text-stone-800">
                {activeProfile.moonSign === "Scorpio" ? "Maroon / Red" : activeProfile.moonSign === "Leo" ? "Gold / Orange" : "White / Yellow"}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#ede5d6]">
              <span className="text-[10px] text-stone-400 font-semibold block uppercase tracking-wider">
                {isHi ? "शुभ अंक (Number)" : "Lucky Number"}
              </span>
              <span className="text-xs font-bold text-stone-800">
                {activeProfile.moonSign === "Scorpio" ? "9, 1" : activeProfile.moonSign === "Leo" ? "1, 5" : "3, 7"}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#ede5d6]">
              <span className="text-[10px] text-stone-400 font-semibold block uppercase tracking-wider">
                {isHi ? "दिशा (Direction)" : "Favorable Direction"}
              </span>
              <span className="text-xs font-bold text-stone-800">
                {activeProfile.moonSign === "Scorpio" ? "East / North-East" : "North / East"}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-[#ede5d6]">
              <span className="text-[10px] text-stone-400 font-semibold block uppercase tracking-wider">
                {isHi ? "आज की ऊर्जा" : "Today's Focus"}
              </span>
              <span className="text-xs font-bold text-[#13382c]">
                {activeProfile.isSelf ? "Courage & Focus" : "Learning & Harmony"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Add Family Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#ede5d6] shadow-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 relative my-auto">
            <div className="flex items-center justify-between border-b border-[#ede5d6] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-[#faf7f0] text-[#c4903c] border border-[#ede5d6]">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-serif leading-tight">
                    {isHi ? "परिवार के सदस्य को जोड़ें" : "Add Family Member"}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {isHi
                      ? "जन्म विवरण दर्ज करते ही चंद्र राशि, नक्षत्र व कुंडली की स्वतः गणना हो जाएगी।"
                      : "Enter birth details for automatic Moon sign, Nakshatra & Kundli calculation."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveMember} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    {isHi ? "पूरा नाम" : "Full Name"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Priya Sharma"
                    className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    {isHi ? "संबंध (Relationship)" : "Relationship"} *
                  </label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="SPOUSE">Spouse (जीवनसाथी)</option>
                    <option value="CHILD">Child / Son / Daughter (संतान)</option>
                    <option value="PARENT">Parent (माता-पिता)</option>
                    <option value="SIBLING">Sibling (भाई-बहन)</option>
                    <option value="GRANDPARENT">Grandparent (दादा-दादी)</option>
                    <option value="FRIEND">Friend (मित्र)</option>
                    <option value="OTHER">Other Family (अन्य)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    {isHi ? "जन्म तिथि (Date of Birth)" : "Date of Birth"} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    {isHi ? "जन्म समय (Birth Time)" : "Birth Time"}
                  </label>
                  <input
                    type="time"
                    value={formData.birthTime}
                    onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                    className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              {/* Birth Place with Country > State > Town Selector */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-stone-700 block">
                    {isHi ? "जन्म स्थान (Birth Place)" : "Birth Place (City, State, Country)"} *
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowLocationModal(true)}
                    className="text-[10px] text-[#c4903c] font-bold hover:underline cursor-pointer"
                  >
                    🌐 {isHi ? "देश > राज्य > नगर से चुनें" : "Select Country > State > Town"}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    placeholder="e.g. Varanasi, Uttar Pradesh, India"
                    className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:bg-white pr-20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLocationModal(true)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-lg bg-[#13382c] text-white text-[10px] font-semibold"
                  >
                    {isHi ? "बदलें" : "Pick"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ede5d6]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
                >
                  {isHi ? "रद्द करें" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isHi ? "सदस्य जोड़ें व गणना करें" : "Save & Calculate Chart"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable WorldLocationModal for Country > State > Town */}
      <WorldLocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onApply={(loc) => {
          setFormData((prev) => ({
            ...prev,
            birthPlace: loc.name,
            latitude: loc.lat,
            longitude: loc.lon,
            timezone: loc.tzStr || "Asia/Kolkata",
          }));
          setShowLocationModal(false);
        }}
        initialLocation={{
          name: formData.birthPlace,
          lat: formData.latitude,
          lon: formData.longitude,
        }}
        isHi={isHi}
        title={isHi ? "जन्म स्थान चुनें" : "Select Family Member's Birth Place"}
        subtitle={isHi ? "देश, राज्य व नगर से अक्षांश व देशांतर की स्वतः गणना।" : "Country > State > Town with automatic coordinates & timezone."}
      />
    </div>
  );
}
