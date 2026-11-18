"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Calendar,
  User,
  RefreshCw,
  AlertTriangle,
  History,
  Printer,
  ChevronDown,
  ChevronUp,
  Info,
  Trash2,
  X,
  FileText,
} from "lucide-react";

export default function VedicNumerologyStudio({
  initialProfile = null,
  initialReport = null,
  initialSavedReport = null,
  user = null,
}) {
  const [name, setName] = useState(
    initialReport?.person?.name || initialProfile?.name || user?.name || ""
  );
  const [birthDate, setBirthDate] = useState(
    initialReport?.person?.birthDate ||
      (initialProfile?.birthDate ? new Date(initialProfile.birthDate).toISOString().split("T")[0] : "")
  );
  const [system, setSystem] = useState(initialSavedReport?.system || "CHALDEAN"); // "CHALDEAN" | "PYTHAGOREAN" | "VEDIC"
  const [language, setLanguage] = useState(initialSavedReport?.language || "en"); // "en" | "hi"
  const [saveToProfile, setSaveToProfile] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Active calculation & report state
  const [activeReportData, setActiveReportData] = useState(null); // Structured 10-section report
  const [activeCalculation, setActiveCalculation] = useState(null); // Raw calculation details
  const [vedicData, setVedicData] = useState(initialReport || null); // For Loshu grid & Vedic matrix

  // UI Tabs & Modals
  const [activeTab, setActiveTab] = useState("REPORT"); // "REPORT" | "CORE" | "GRID" | "MONTHLY"
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [savedReports, setSavedReports] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedCalcDetail, setSelectedCalcDetail] = useState(null); // For transparency modal

  const isHi = language === "hi" || language === "hindi";

  // Auto-calculate on initial mount if name and birthDate are provided
  useEffect(() => {
    if (name && birthDate) {
      handleCalculate();
    }
  }, [system, language]);

  const handleCalculate = async (e) => {
    if (e) e.preventDefault();
    if (!name || name.trim().length < 2) {
      setError(isHi ? "कृपया कम से कम 2 अक्षरों का नाम दर्ज करें।" : "Please enter a valid full name with at least 2 characters.");
      return;
    }
    if (!birthDate) {
      setError(isHi ? "कृपया वैध जन्म तिथि चुनें।" : "Please select a valid date of birth.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/numerology/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          birthDate,
          system,
          language,
          saveToProfile: Boolean(user?.id && saveToProfile),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to calculate numerology report");
      }

      setActiveReportData(data.report);
      setActiveCalculation(data.calculation);
      if (data.vedic) setVedicData(data.vedic);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!user?.id) return;
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/numerology/reports");
      const data = await res.json();
      if (res.ok && data.reports) {
        setSavedReports(data.reports);
      }
    } catch (err) {
      console.warn("Error fetching saved reports:", err.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenHistory = () => {
    setShowHistoryModal(true);
    fetchHistory();
  };

  const handleLoadSavedReport = async (reportId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/numerology/calculate?reportId=${reportId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load report");

      setActiveReportData(data.report);
      setSystem(data.system);
      setLanguage(data.language);
      setShowHistoryModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId, e) => {
    e.stopPropagation();
    if (!confirm(isHi ? "क्या आप इस रिपोर्ट को हटाना चाहते हैं?" : "Are you sure you want to delete this saved report?")) return;

    try {
      const res = await fetch(`/api/numerology/reports?id=${reportId}`, { method: "DELETE" });
      if (res.ok) {
        setSavedReports((prev) => prev.filter((r) => r.id !== reportId));
      }
    } catch (err) {
      console.warn("Delete error:", err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const sections = activeReportData?.sections;

  return (
    <div className="space-y-8 print:p-0 print:space-y-4">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          nav, footer, .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          .print-break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c231b] via-[#13382c] to-[#071610] text-[#f7efe1] border border-[#d4a359]/30 shadow-2xl p-6 sm:p-8 md:p-10 no-print">
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-[#d4a359]/20 text-[#d4a359] border border-[#d4a359]/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vedic & Universal Numerology Studio • अंक ज्योतिष</span>
            </div>

            <div className="flex items-center gap-2">
              {user?.id && (
                <button
                  type="button"
                  onClick={handleOpenHistory}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-serif text-white flex items-center gap-1.5 transition cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>{isHi ? "सहेजी गई रिपोर्टें" : "Saved Reports"}</span>
                </button>
              )}

              {activeReportData && (
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-[#d4a359] hover:bg-[#c39248] text-stone-950 font-bold text-xs font-serif flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isHi ? "प्रिंट / PDF" : "Print / PDF"}</span>
                </button>
              )}
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold font-serif text-[#fdfaf5] leading-tight tracking-tight">
            {isHi ? "गुरुकुल अंकज्योतिष अनुसंधान केंद्र" : "Gurukul Numerology Studio"}
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-serif max-w-2xl">
            {isHi
              ? "खाल्डियन, पाइथागोरस एवं वैदिक सांख्य शास्त्र के प्रामाणिक सूत्रों द्वारा अपने जीवन पथ, अभिव्यक्ति, आत्म-अभिलाषा एवं कार्मिक दशाओं का सूक्ष्म विश्लेषण प्राप्त करें।"
              : "Discover your Life Path, Expression, Soul Urge, and Karmic cycles through deterministic Chaldean, Pythagorean, and Vedic Sankhya Shastra engines with zero mock data."}
          </p>
        </div>
      </div>

      {/* Input & Settings Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs no-print">
        <form onSubmit={handleCalculate} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-serif text-stone-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>{isHi ? "पूरा नाम (उच्चारण अनुसार)" : "Full Name"}</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Manish Sharma"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#13382c]/20 focus:border-[#13382c]"
                required
              />
              <p className="text-[11px] text-stone-400">
                {isHi ? "ध्वनि कम्पन एवं नामांक हेतु" : "Used for letter vibration calculation."}
              </p>
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-serif text-stone-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>{isHi ? "जन्म तिथि" : "Date of Birth"}</span>
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#13382c]/20 focus:border-[#13382c]"
                required
              />
              <p className="text-[11px] text-stone-400">
                {isHi ? "जीवन पथ एवं मूलांक हेतु" : "Calculates Life Path & Driver numbers."}
              </p>
            </div>

            {/* Numerology System */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-serif text-stone-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>{isHi ? "अंक प्रणाली" : "Numerology System"}</span>
              </label>
              <select
                value={system}
                onChange={(e) => setSystem(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#13382c]/20 focus:border-[#13382c]"
              >
                <option value="CHALDEAN">Chaldean (Babylonian 1-8)</option>
                <option value="PYTHAGOREAN">Pythagorean (Western 1-9)</option>
                <option value="VEDIC">Vedic (Sankhya Shastra)</option>
              </select>
              <p className="text-[11px] text-stone-400">
                {system === "CHALDEAN"
                  ? (isHi ? "संयुक्त अंक (10-52) एवं मूल अंक" : "Compound & Root numbers")
                  : system === "PYTHAGOREAN"
                  ? (isHi ? "मास्टर अंक 11, 22, 33 मान्य" : "Preserves Master Numbers")
                  : (isHi ? "मूलांक, भाग्यांक एवं अंक यंत्र" : "Mulank, Bhagyank & Grid")}
              </p>
            </div>

            {/* Language Preference */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold font-serif text-stone-800 flex items-center gap-1.5">
                <span>{isHi ? "भाषा" : "Report Language"}</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#13382c]/20 focus:border-[#13382c]"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
              <p className="text-[11px] text-stone-400">
                {isHi ? "पूर्ण द्विभाषी रिपोर्ट समर्थन" : "Full bilingual report output"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-stone-100">
            {user?.id ? (
              <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-600">
                <input
                  type="checkbox"
                  checked={saveToProfile}
                  onChange={(e) => setSaveToProfile(e.target.checked)}
                  className="rounded border-stone-300 text-[#13382c] focus:ring-[#13382c]"
                />
                <span>{isHi ? "रिपोर्ट को मेरे प्रोफ़ाइल में सुरक्षित रखें" : "Save report to my Gurukul profile"}</span>
              </label>
            ) : (
              <span className="text-xs text-stone-400">
                {isHi ? "सहेजने के लिए कृपया लॉगिन करें।" : "Log in to save report history to your profile."}
              </span>
            )}

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3a] text-white text-xs font-bold font-serif shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{isHi ? "गणना की जा रही है..." : "Generating Authentic Report..."}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>{isHi ? "अंक विश्लेषण उत्पन्न करें" : "Generate Numerology Report"}</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      {/* Main Results Display */}
      {sections && (
        <div className="space-y-6">
          {/* Printable Header */}
          <div className="hidden print:block border-b-2 border-stone-800 pb-4 mb-6 text-center">
            <h1 className="text-2xl font-bold font-serif uppercase tracking-wider">Gurukul Numerology Report</h1>
            <p className="text-xs text-stone-600 font-serif">
              Name: {sections.overview.personName} • Birth Date: {sections.overview.birthDate} • System: {sections.overview.systemName}
            </p>
          </div>

          {/* Navigation Tabs (Screen only) */}
          <div className="flex border-b border-stone-200 overflow-x-auto no-print gap-2">
            {[
              { id: "REPORT", label: isHi ? "विस्तृत 10-खंडीय रिपोर्ट" : "Complete 10-Section Report" },
              { id: "CORE", label: isHi ? "आधारभूत अंक एवं सूत्र" : "Core Numbers & Formulas" },
              { id: "GRID", label: isHi ? "3x3 वैदिक अंक यंत्र (लोशू)" : "3x3 Vedic Grid Matrix" },
              { id: "MONTHLY", label: isHi ? "12-मासिक मार्गदर्शन" : "12-Month Roadmap" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-serif font-bold transition whitespace-nowrap border-b-2 cursor-pointer ${
                  activeTab === tab.id
                    ? "border-[#13382c] text-[#13382c]"
                    : "border-transparent text-stone-500 hover:text-stone-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: COMPLETE 10-SECTION REPORT */}
          {(activeTab === "REPORT" || true) && (
            <div className={`${activeTab !== "REPORT" ? "hidden print:block" : ""} space-y-6`}>
              {/* Section 1: Overview Card */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs print-break-inside-avoid">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#d4a359]">
                      Section 1
                    </span>
                    <h2 className="text-lg font-bold font-serif text-stone-900">{sections.overview.title}</h2>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 font-serif">
                    {sections.overview.systemName}
                  </span>
                </div>
                <p className="text-sm font-serif text-stone-700 leading-relaxed">
                  {sections.overview.coreVibrationSummary}
                </p>
              </div>

              {/* Section 2: Core Numbers Summary Ribbon */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print-break-inside-avoid">
                {sections.coreNumbers.numbers.slice(0, 4).map((cn, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedCalcDetail(cn)}
                    className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs hover:border-[#d4a359] transition cursor-pointer relative group"
                  >
                    <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
                      <span className="font-serif font-medium">{cn.name}</span>
                      <Info className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#d4a359] transition" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-serif font-bold text-[#13382c]">{cn.value}</span>
                      {cn.compoundNumber && (
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600">
                          {cn.compoundNumber}
                        </span>
                      )}
                    </div>
                    {cn.compoundMeaning && (
                      <p className="text-[11px] text-[#d4a359] font-serif font-bold truncate mt-1">
                        {isHi ? cn.compoundMeaning.titleHi : cn.compoundMeaning.titleEn}
                      </p>
                    )}
                    <p className="text-[10px] text-stone-400 font-mono truncate mt-0.5">{cn.formula}</p>
                  </div>
                ))}
              </div>

              {/* Section 3: In-Depth Name Vibration Analysis */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs print-break-inside-avoid">
                <div className="border-b border-stone-100 pb-3 mb-4">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#d4a359]">
                    Section 3
                  </span>
                  <h3 className="text-base font-bold font-serif text-stone-900">{sections.nameAnalysis.title}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                    <span className="text-xs text-stone-500 font-serif">{isHi ? "कुल अक्षर" : "Total Letters"}</span>
                    <p className="text-xl font-bold font-serif text-stone-900">{sections.nameAnalysis.totalLetters}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                    <span className="text-xs text-stone-500 font-serif">{isHi ? "स्वर (Vowels)" : "Vowels"}</span>
                    <p className="text-xl font-bold font-serif text-[#13382c]">{sections.nameAnalysis.vowelCount}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-100">
                    <span className="text-xs text-stone-500 font-serif">{isHi ? "व्यंजन (Consonants)" : "Consonants"}</span>
                    <p className="text-xl font-bold font-serif text-amber-700">{sections.nameAnalysis.consonantCount}</p>
                  </div>
                </div>
                <p className="text-xs font-serif text-stone-700 leading-relaxed bg-stone-50/60 p-3.5 rounded-xl border border-stone-100">
                  {sections.nameAnalysis.summary}
                </p>
              </div>

              {/* Section 4 & 5: Personality, Gifts & Challenges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-break-inside-avoid">
                <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
                  <div className="border-b border-stone-100 pb-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#d4a359]">
                      Section 4
                    </span>
                    <h3 className="text-base font-bold font-serif text-stone-900">{sections.personality.title}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sections.personality.coreKeywords.map((kw, i) => (
                      <span key={i} className="text-[11px] font-serif px-2.5 py-1 rounded-full bg-[#13382c]/10 text-[#13382c] font-medium">
                        {kw}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs font-serif text-stone-700 leading-relaxed">
                    {sections.personality.detailedAnalysis}
                  </p>
                </div>

                <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-4">
                  <div className="border-b border-stone-100 pb-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#d4a359]">
                      Section 5
                    </span>
                    <h3 className="text-base font-bold font-serif text-stone-900">{sections.strengthsAndChallenges.title}</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-bold font-serif text-emerald-800 mb-1">{isHi ? "प्राकृतिक सामर्थ्य:" : "Innate Gifts:"}</h4>
                      <ul className="text-xs font-serif text-stone-700 space-y-1 list-disc list-inside">
                        {sections.strengthsAndChallenges.strengths.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold font-serif text-rose-800 mb-1">{isHi ? "सावधानी एवं विकास क्षेत्र:" : "Growth Edges & Challenges:"}</h4>
                      <ul className="text-xs font-serif text-stone-700 space-y-1 list-disc list-inside">
                        {sections.strengthsAndChallenges.challenges.map((c, idx) => (
                          <li key={idx}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 6 & 8: Personal Year & Compatibility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print-break-inside-avoid">
                {/* Personal Year */}
                <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-3">
                  <div className="border-b border-stone-100 pb-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#d4a359]">
                      Section 6
                    </span>
                    <h3 className="text-base font-bold font-serif text-stone-900">{sections.personalYearCycle.title} ({sections.personalYearCycle.year})</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-serif font-bold text-[#d4a359]">
                      {sections.personalYearCycle.personalYearNumber}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold font-serif text-stone-900">{sections.personalYearCycle.cycleTitle}</h4>
                      <p className="text-xs font-serif text-stone-600 leading-relaxed mt-1">
                        {sections.personalYearCycle.cycleTheme}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Compatibility */}
                <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-3">
                  <div className="border-b border-stone-100 pb-2">
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#d4a359]">
                      Section 8
                    </span>
                    <h3 className="text-base font-bold font-serif text-stone-900">{sections.compatibility.title}</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-serif">
                    <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                      <span className="text-emerald-800 font-bold block">{isHi ? "परम मित्र" : "Friendly"}</span>
                      <span className="text-sm font-bold text-emerald-900 mt-1 block">
                        {sections.compatibility.naturalHarmonies.join(", ")}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                      <span className="text-stone-700 font-bold block">{isHi ? "सम (तटस्थ)" : "Neutral"}</span>
                      <span className="text-sm font-bold text-stone-800 mt-1 block">
                        {sections.compatibility.neutralVibrations.join(", ")}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
                      <span className="text-rose-800 font-bold block">{isHi ? "शत्रु (सतर्क)" : "Friction"}</span>
                      <span className="text-sm font-bold text-rose-900 mt-1 block">
                        {sections.compatibility.challengingVibrations.join(", ")}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs font-serif text-stone-600 leading-relaxed">
                    {sections.compatibility.advice}
                  </p>
                </div>
              </div>

              {/* Section 9: Career & Purpose */}
              <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs print-break-inside-avoid">
                <div className="border-b border-stone-100 pb-3 mb-4">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#d4a359]">
                    Section 9
                  </span>
                  <h3 className="text-base font-bold font-serif text-stone-900">{sections.career.title}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-bold font-serif text-stone-800 mb-1">{isHi ? "अनुकूल कार्यक्षेत्र:" : "Favorable Vocational Spheres:"}</h4>
                    <p className="text-xs font-serif text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                      {sections.career.recommendedFields}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-serif text-stone-800 mb-1">{isHi ? "नेतृत्व शैली:" : "Leadership Expression:"}</h4>
                    <p className="text-xs font-serif text-stone-700 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-100">
                      {sections.career.leadershipStyle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 10: Summary & Remedies */}
              <div className="bg-gradient-to-br from-[#13382c] to-[#0c231b] rounded-3xl border border-[#d4a359]/30 text-white p-6 sm:p-8 shadow-xl print-break-inside-avoid">
                <div className="border-b border-white/10 pb-3 mb-4">
                  <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#d4a359]">
                    Section 10
                  </span>
                  <h3 className="text-base font-bold font-serif text-[#fdfaf5]">{sections.summaryAndRecommendations.title}</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-serif mb-4">
                  <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                    <span className="text-stone-300 block text-[11px]">{isHi ? "शुभ रंग" : "Lucky Colors"}</span>
                    <span className="font-bold text-[#d4a359] mt-0.5 block">{sections.summaryAndRecommendations.luckyColors.join(", ")}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                    <span className="text-stone-300 block text-[11px]">{isHi ? "शुभ दिन" : "Lucky Days"}</span>
                    <span className="font-bold text-[#d4a359] mt-0.5 block">{sections.summaryAndRecommendations.luckyDays.join(", ")}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                    <span className="text-stone-300 block text-[11px]">{isHi ? "शुभ रत्न" : "Lucky Gemstone"}</span>
                    <span className="font-bold text-[#d4a359] mt-0.5 block">{sections.summaryAndRecommendations.luckyGemstone || "—"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                    <span className="text-stone-300 block text-[11px]">{isHi ? "शुभ दिशा" : "Favorable Direction"}</span>
                    <span className="font-bold text-[#d4a359] mt-0.5 block">{sections.summaryAndRecommendations.favorableDirection || "—"}</span>
                  </div>
                </div>
                <p className="text-xs font-serif text-stone-200 leading-relaxed mb-4">
                  {sections.summaryAndRecommendations.dailyPractice}
                </p>
                <p className="text-[10px] font-mono text-stone-400 border-t border-white/10 pt-3">
                  {sections.summaryAndRecommendations.traditionalDisclaimer}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: CORE NUMBERS & FORMULAS */}
          {activeTab === "CORE" && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-lg font-bold font-serif text-stone-900">
                  {isHi ? "समस्त आधारभूत अंक एवं चरणबद्ध गणना सूत्र" : "Core Numbers & Step-by-Step Mathematical Formulas"}
                </h3>
                <p className="text-xs font-serif text-stone-500 mt-1">
                  {isHi
                    ? "प्रत्येक अंक की गणना पूर्णतः पारदर्शी है। किसी भी कार्ड को खोलकर विस्तार देखें।"
                    : "Every calculation is fully deterministic. Expand any card to see exact letter weights and reductions."}
                </p>
              </div>

              <div className="space-y-4">
                {sections.coreNumbers.numbers.map((numItem, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-[#13382c] text-white text-lg font-serif font-bold flex items-center justify-center">
                          {numItem.value}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold font-serif text-stone-900">{numItem.name}</h4>
                          <span className="text-xs font-mono text-stone-500">{numItem.formula}</span>
                        </div>
                      </div>
                      {numItem.compoundNumber && (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-mono font-bold">
                          Compound: {numItem.compoundNumber}
                        </span>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-stone-100 font-mono text-xs text-stone-700 space-y-1">
                      <span className="text-[11px] font-bold text-stone-400 block uppercase">
                        {isHi ? "मध्यवर्ती चरण:" : "Intermediate Steps:"}
                      </span>
                      {Array.isArray(numItem.intermediate) && numItem.intermediate.map((step, sIdx) => (
                        <div key={sIdx} className="text-stone-800 truncate">
                          ↳ {step}
                        </div>
                      ))}
                    </div>

                    <p className="text-xs font-serif text-stone-700 leading-relaxed">
                      {numItem.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 3x3 VEDIC ANKA YANTRA (LOSHU MATRIX) */}
          {activeTab === "GRID" && vedicData && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-lg font-bold font-serif text-stone-900">
                  {isHi ? "3x3 वैदिक अंक यंत्र (लोशू ग्रिड)" : "3x3 Vedic Anka Yantra (Loshu Matrix)"}
                </h3>
                <p className="text-xs font-serif text-stone-500 mt-1">
                  {isHi
                    ? "जन्म तिथि, मूलांक एवं भाग्यांक द्वारा निर्मित 8 प्रमुख तलों (Planes) का सूक्ष्म विश्लेषण।"
                    : "Evaluates the 8 foundational energetic planes based on birth date digits, Driver, and Destiny numbers."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* 3x3 Grid Visual */}
                <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto w-full aspect-square p-3 rounded-2xl bg-stone-100 border border-stone-200">
                  {vedicData.grid?.layout?.flat()?.map((cell, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col items-center justify-center rounded-xl p-2 transition font-serif ${
                        cell.active
                          ? "bg-[#13382c] text-white shadow-xs"
                          : "bg-white/60 text-stone-300 border border-dashed border-stone-200"
                      }`}
                    >
                      <span className="text-2xl font-bold leading-none">{cell.num}</span>
                      <span className="text-[10px] font-mono mt-1 opacity-80">
                        {cell.count > 0 ? `×${cell.count}` : "—"}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Planes List */}
                <div className="space-y-3">
                  {[
                    vedicData.grid?.planes?.mentalPlane,
                    vedicData.grid?.planes?.emotionalPlane,
                    vedicData.grid?.planes?.practicalPlane,
                    vedicData.grid?.planes?.thoughtPlane,
                    vedicData.grid?.planes?.willPlane,
                    vedicData.grid?.planes?.actionPlane,
                  ].filter(Boolean).map((plane, pIdx) => (
                    <div key={pIdx} className="space-y-1">
                      <div className="flex justify-between text-xs font-serif">
                        <span className="font-medium text-stone-800">{plane.label}</span>
                        <span className="font-mono text-stone-500">{plane.percent}%</span>
                      </div>
                      <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#13382c] to-[#d4a359] rounded-full transition-all"
                          style={{ width: `${plane.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 12-MONTH GUIDANCE ROADMAP */}
          {activeTab === "MONTHLY" && (
            <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-stone-100 pb-3">
                <h3 className="text-lg font-bold font-serif text-stone-900">
                  {sections.monthlyGuidance.title} ({sections.personalYearCycle.year})
                </h3>
                <p className="text-xs font-serif text-stone-500 mt-1">
                  {isHi
                    ? "प्रत्येक मास का व्यक्तिगत अंक एवं कार्य-योजना का दिशा-निर्देश।"
                    : "Navigate the active calendar year with precise monthly personal vibrations and strategic focus."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.monthlyGuidance.months.map((mItem, mIdx) => (
                  <div key={mIdx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-serif text-stone-900">{mItem.monthName}</span>
                      <span className="w-6 h-6 rounded-full bg-[#13382c] text-white text-xs font-serif font-bold flex items-center justify-center">
                        {mItem.personalMonthNumber}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold font-serif text-[#d4a359]">{mItem.themeTitle}</h4>
                    <p className="text-xs font-serif text-stone-600 leading-relaxed">
                      {mItem.guidance}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transparency Details Modal */}
      {selectedCalcDetail && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold font-serif text-stone-900">
                {selectedCalcDetail.name}
              </h3>
              <button
                onClick={() => setSelectedCalcDetail(null)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-serif text-stone-700">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-serif text-[#13382c]">{selectedCalcDetail.value}</span>
                {selectedCalcDetail.compoundNumber && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold">
                    Compound: {selectedCalcDetail.compoundNumber}
                  </span>
                )}
              </div>

              {selectedCalcDetail.compoundMeaning && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1">
                  <span className="text-[10px] font-bold text-amber-900 uppercase">
                    {isHi ? selectedCalcDetail.compoundMeaning.titleHi : selectedCalcDetail.compoundMeaning.titleEn}
                  </span>
                  <p className="text-xs text-amber-950 leading-relaxed">
                    {isHi ? selectedCalcDetail.compoundMeaning.meaningHi : selectedCalcDetail.compoundMeaning.meaningEn}
                  </p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 font-mono text-[11px] space-y-1">
                <span className="text-[10px] text-stone-400 font-bold block uppercase">{isHi ? "सूत्र:" : "Formula:"}</span>
                <p className="text-stone-800">{selectedCalcDetail.formula}</p>
                <span className="text-[10px] text-stone-400 font-bold block uppercase pt-1">{isHi ? "गणना चरण:" : "Steps:"}</span>
                {Array.isArray(selectedCalcDetail.intermediate) && selectedCalcDetail.intermediate.map((step, idx) => (
                  <p key={idx} className="text-stone-700">↳ {step}</p>
                ))}
              </div>

              <p className="text-xs text-stone-600 leading-relaxed">
                {selectedCalcDetail.description}
              </p>
            </div>

            <button
              onClick={() => setSelectedCalcDetail(null)}
              className="w-full py-2.5 rounded-xl bg-[#13382c] text-white text-xs font-serif font-bold cursor-pointer"
            >
              {isHi ? "बंद करें" : "Close"}
            </button>
          </div>
        </div>
      )}

      {/* Saved Reports History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#d4a359]" />
                <h3 className="text-base font-bold font-serif text-stone-900">
                  {isHi ? "सहेजी गई रिपोर्टें (Report History)" : "Saved Numerology Reports"}
                </h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {loadingHistory ? (
                <div className="py-8 text-center text-xs font-serif text-stone-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Loading history...</span>
                </div>
              ) : savedReports.length === 0 ? (
                <div className="py-8 text-center text-xs font-serif text-stone-400">
                  {isHi ? "कोई सहेजी गई रिपोर्ट नहीं मिली।" : "No saved reports found."}
                </div>
              ) : (
                savedReports.map((rpt) => (
                  <div
                    key={rpt.id}
                    onClick={() => handleLoadSavedReport(rpt.id)}
                    className="p-4 rounded-2xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200 transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div>
                      <h4 className="text-xs font-bold font-serif text-stone-900">{rpt.name}</h4>
                      <p className="text-[11px] text-stone-500 font-serif">
                        {rpt.system} • {new Date(rpt.birthDate).toISOString().split("T")[0]} • Version {rpt.version}
                      </p>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Saved on {new Date(rpt.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteReport(rpt.id, e)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full py-2.5 rounded-xl bg-stone-100 text-stone-700 text-xs font-serif font-bold cursor-pointer hover:bg-stone-200 transition"
            >
              {isHi ? "वापस जाएँ" : "Back"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
