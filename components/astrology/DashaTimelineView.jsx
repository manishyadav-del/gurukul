"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Flame,
  CheckCircle2,
  BookOpen,
  Compass,
  Briefcase,
  Coins,
  Heart,
  ShieldAlert,
  GraduationCap,
  ScrollText,
  Printer,
  Globe,
  TrendingUp,
  AlertTriangle,
  Info,
  CalendarDays,
} from "lucide-react";

export default function DashaTimelineView({ chart, language = "en" }) {
  const [currentLang, setCurrentLang] = useState(language);
  const [activeTab, setActiveTab] = useState("overview"); // overview, domains, opportunities, remedies, timeline
  const [expandedMaha, setExpandedMaha] = useState(null);
  const [expandedAntar, setExpandedAntar] = useState(null);
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Sync internal language state if external prop changes
  useEffect(() => {
    setCurrentLang(language);
  }, [language]);

  const isHi = currentLang === "hi" || currentLang === "hindi";

  // Fetch complete 11-section calculation-grounded report
  useEffect(() => {
    if (!chart) return;
    let isMounted = true;
    async function loadReport() {
      setLoadingReport(true);
      try {
        const res = await fetch("/api/astrology/dasha/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chart, language: currentLang }),
        });
        const data = await res.json();
        if (isMounted && data.success && data.report) {
          setReport(data.report);
        }
      } catch (err) {
        console.error("Failed to fetch Dasha report:", err);
      } finally {
        if (isMounted) setLoadingReport(false);
      }
    }
    loadReport();
    return () => {
      isMounted = false;
    };
  }, [chart, currentLang]);

  if (!chart || !chart.dasha || !chart.dasha.timeline) {
    return (
      <div className="p-8 text-center text-stone-500 bg-[#fbf9f4] rounded-2xl border border-amber-200">
        {isHi ? "दशा क्रम गणना उपलब्ध नहीं है।" : "Dasha timeline calculation is not available."}
      </div>
    );
  }

  const { dasha } = chart;
  const active = dasha.activeDasha || {};
  const sections = report?.sections || {};

  // Calculate percentage elapsed of current Mahadasha
  const getCycleProgress = () => {
    if (!active.startDate || !active.endDate) return 50;
    const s = new Date(active.startDate).getTime();
    const e = new Date(active.endDate).getTime();
    const now = Date.now();
    if (now <= s) return 0;
    if (now >= e) return 100;
    return Math.min(100, Math.max(0, Math.round(((now - s) / (e - s)) * 100)));
  };

  const cycleProgress = getCycleProgress();

  return (
    <div className="space-y-6">
      {/* 1. Active Dasha Hero Card */}
      <div className="bg-gradient-to-br from-[#13382c] via-[#1a4a3a] to-[#25604e] p-6 sm:p-7 rounded-3xl text-amber-50 shadow-xl border border-amber-500/30 relative overflow-hidden">
        {/* Subtle decorative background watermarks */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-semibold tracking-wider uppercase border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5" />
                {isHi ? "वर्तमान सक्रिय विंशोत्तरी काल" : "Active Vimshottari Period"}
              </span>

              {report?.activeDashaSummary?.sambandhaAxis && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 text-amber-200 text-xs font-medium border border-amber-300/20">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  {isHi
                    ? sections.section2_antardashaOverview?.sambandha?.axisHi ||
                      report.activeDashaSummary.sambandhaAxis
                    : report.activeDashaSummary.sambandhaAxis}
                </span>
              )}
            </div>

            {/* 3-Tier Period Hierarchy */}
            <div className="flex flex-wrap items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
                {sections.section1_mahadashaOverview?.sanskritLord && isHi
                  ? sections.section1_mahadashaOverview.sanskritLord
                  : active.mahadasha}{" "}
                <span className="text-amber-300 text-2xl font-normal font-sans">
                  {isHi ? "महादशा" : "Mahadasha"}
                </span>
              </span>
              <span className="text-amber-400/60 text-2xl font-light">/</span>
              <span className="text-xl sm:text-2xl font-serif font-semibold text-amber-200">
                {sections.section2_antardashaOverview?.sanskritLord && isHi
                  ? sections.section2_antardashaOverview.sanskritLord
                  : active.antardasha}{" "}
                <span className="text-amber-300/80 text-base font-normal font-sans">
                  {isHi ? "अंतर्दशा" : "Antardasha"}
                </span>
              </span>
              <span className="text-amber-400/60 text-xl font-light">/</span>
              <span className="text-base sm:text-lg font-serif text-amber-300/90 font-medium">
                {active.pratyantardasha}{" "}
                <span className="text-xs text-amber-300/70 font-sans">
                  {isHi ? "प्रत्यंतर्दशा" : "Pratyantar"}
                </span>
              </span>
            </div>

            {/* Dates and House Placements */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-amber-100/90 pt-1">
              <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-amber-400/20">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {isHi ? "महादशा:" : "Mahadasha:"} {active.startDate} — {active.endDate}
                </span>
              </div>

              {active.antarStartDate && (
                <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-xl border border-amber-400/20">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {isHi ? "अंतर्दशा:" : "Antardasha:"} {active.antarStartDate} — {active.antarEndDate}
                  </span>
                </div>
              )}

              {sections.section1_mahadashaOverview?.house && (
                <div className="flex items-center gap-1.5 bg-amber-400/15 px-3 py-1.5 rounded-xl border border-amber-400/30 text-amber-200">
                  <Compass className="w-3.5 h-3.5" />
                  <span>
                    {active.mahadasha} {isHi ? "भाव" : "in House"}{" "}
                    {sections.section1_mahadashaOverview.house} (
                    {sections.section1_mahadashaOverview.dignityLabel})
                  </span>
                </div>
              )}
            </div>

            {/* Mahadasha Progress Bar */}
            <div className="pt-2 max-w-xl">
              <div className="flex justify-between text-[11px] text-amber-200/80 mb-1 font-mono">
                <span>{isHi ? "महादशा प्रगति" : "Cycle Progression"}</span>
                <span>{cycleProgress}%</span>
              </div>
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden border border-amber-400/20">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-full transition-all duration-700"
                  style={{ width: `${cycleProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Language Toggle & Action Controls */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end gap-3 shrink-0">
            <button
              onClick={() => setCurrentLang(isHi ? "en" : "hi")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/30 hover:bg-black/50 text-amber-200 text-xs font-medium border border-amber-400/30 transition-colors shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{isHi ? "English" : "हिन्दी"}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-medium border border-amber-400/30 transition-colors shadow-sm"
              title="Print Dasha Report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isHi ? "प्रिंट / PDF" : "Print Report"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive 5-Tab Navigation Bar */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-[#f5f0e6] rounded-2xl border border-amber-200/80 shadow-xs">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "overview"
              ? "bg-[#13382c] text-amber-100 shadow-md"
              : "text-stone-700 hover:bg-amber-100/70"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isHi ? "सक्रिय दशा विश्लेषण" : "Active Synthesis"}</span>
        </button>

        <button
          onClick={() => setActiveTab("domains")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "domains"
              ? "bg-[#13382c] text-amber-100 shadow-md"
              : "text-stone-700 hover:bg-amber-100/70"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>{isHi ? "जीवन क्षेत्र प्रभाव" : "Life Domains"}</span>
        </button>

        <button
          onClick={() => setActiveTab("opportunities")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "opportunities"
              ? "bg-[#13382c] text-amber-100 shadow-md"
              : "text-stone-700 hover:bg-amber-100/70"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{isHi ? "अवसर एवं सावधानियाँ" : "Opportunities & Cautions"}</span>
        </button>

        <button
          onClick={() => setActiveTab("remedies")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "remedies"
              ? "bg-[#13382c] text-amber-100 shadow-md"
              : "text-stone-700 hover:bg-amber-100/70"
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>{isHi ? "वैदिक उपाय एवं साधना" : "Vedic Remedies"}</span>
        </button>

        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === "timeline"
              ? "bg-[#13382c] text-amber-100 shadow-md"
              : "text-stone-700 hover:bg-amber-100/70"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{isHi ? "120-वर्षीय दशा चक्र" : "120-Year Timeline"}</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: ACTIVE SYNTHESIS & INFLUENCE */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Mahadasha & Antardasha Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mahadasha Detailed Card */}
            <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-serif font-bold text-sm">
                    M
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-stone-900">
                      {isHi ? "महादशा मुख्य प्रभाव" : "Mahadasha Foundation"}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {sections.section1_mahadashaOverview?.lord || active.mahadasha} (
                      {active.startDate} — {active.endDate})
                    </p>
                  </div>
                </div>
                {sections.section1_mahadashaOverview?.functionalRole && (
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    {sections.section1_mahadashaOverview.functionalRole}
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-700 leading-relaxed">
                {isHi
                  ? sections.section1_mahadashaOverview?.descriptionHi ||
                    "महादशा आपके बहु-वर्षीय जीवन चक्र के आधार का निर्माण करती है।"
                  : sections.section1_mahadashaOverview?.descriptionEn ||
                    "Mahadasha establishes the overarching architectural environment of your life pursuits."}
              </p>

              {sections.section1_mahadashaOverview?.ruledHouses && (
                <div className="bg-[#fcfaf5] p-3.5 rounded-xl border border-amber-200/60 flex flex-wrap items-center gap-4 text-xs text-stone-700">
                  <div>
                    <span className="text-stone-500">{isHi ? "लग्न से स्थिति:" : "House Placement:"}</span>{" "}
                    <span className="font-semibold text-stone-900">
                      {isHi ? "भाव" : "House"} {sections.section1_mahadashaOverview.house} (
                      {sections.section1_mahadashaOverview.sign})
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500">{isHi ? "स्वामित्व भाव:" : "Governed Houses:"}</span>{" "}
                    <span className="font-semibold text-stone-900">
                      {sections.section1_mahadashaOverview.ruledHouses.join(", ")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Antardasha Detailed Card */}
            <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-serif font-bold text-sm">
                    A
                  </div>
                  <div>
                    <h3 className="text-base font-serif font-bold text-stone-900">
                      {isHi ? "अंतर्दशा (भुक्ति) प्रभाव" : "Antardasha Modification"}
                    </h3>
                    <p className="text-xs text-stone-500">
                      {sections.section2_antardashaOverview?.lord || active.antardasha} (
                      {active.antarStartDate} — {active.antarEndDate})
                    </p>
                  </div>
                </div>
                {sections.section2_antardashaOverview?.sambandha?.naturalRelationship && (
                  <span className="text-[11px] font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
                    {sections.section2_antardashaOverview.sambandha.naturalRelationship}
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-700 leading-relaxed">
                {isHi
                  ? sections.section2_antardashaOverview?.descriptionHi ||
                    "अंतर्दशा महादशा के फल को तात्कालिक रूप से रूपांतरित करती है।"
                  : sections.section2_antardashaOverview?.descriptionEn ||
                    "Antardasha filters and directs the Mahadasha lord's energy into specific events."}
              </p>

              {sections.section2_antardashaOverview?.sambandha && (
                <div className="bg-[#fcfaf5] p-3.5 rounded-xl border border-amber-200/60 flex flex-wrap items-center gap-4 text-xs text-stone-700">
                  <div>
                    <span className="text-stone-500">{isHi ? "परस्पर सम्बन्ध:" : "Mutual Sambandha:"}</span>{" "}
                    <span className="font-semibold text-amber-900">
                      {isHi
                        ? sections.section2_antardashaOverview.sambandha.axisHi
                        : sections.section2_antardashaOverview.sambandha.axis}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-500">{isHi ? "अवस्था:" : "Dignity:"}</span>{" "}
                    <span className="font-semibold text-stone-900">
                      {sections.section2_antardashaOverview.dignityLabel}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pratyantardasha Micro-Cycle Banner */}
          <div className="bg-[#fbf9f4] p-5 rounded-2xl border border-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-700 shrink-0">
                <Compass className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-stone-900">
                  {isHi ? "प्रत्यंतर्दशा (सूक्ष्म चक्र)" : "Current Pratyantardasha Micro-Pulse"}
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed max-w-3xl">
                  {isHi
                    ? sections.section3_pratyantardashaOverview?.descriptionHi ||
                      "प्रत्यंतर्दशा आपके दैनिक चित्त और तात्कालिक निर्णयों को दिशा देती है।"
                    : sections.section3_pratyantardashaOverview?.descriptionEn ||
                      "Pratyantardasha guides your immediate psychological tone and day-to-day engagement."}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 bg-white px-3.5 py-2 rounded-xl border border-amber-200/80 shadow-2xs font-mono text-xs">
              <span className="text-stone-500">{isHi ? "अवधि:" : "Span:"}</span>{" "}
              <span className="font-semibold text-stone-900">
                {active.pratyantarStartDate} → {active.pratyantarEndDate}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIFE DOMAIN IMPACTS */}
      {activeTab === "domains" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. Career & Professional Stature */}
          <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-stone-900 font-serif font-bold text-base border-b border-amber-100 pb-2.5">
              <Briefcase className="w-5 h-5 text-amber-700" />
              <span>{isHi ? "कर्मक्षेत्र एवं आजीविका" : "Career & Professional Stature"}</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              {isHi
                ? sections.section6_careerAndFinances?.careerHi ||
                  "कर्मक्षेत्र में अनुशासित और रणनीतिक कदम सफलता दिलाएंगे।"
                : sections.section6_careerAndFinances?.careerEn ||
                  "Professional responsibilities and leadership initiatives advance under this dasha."}
            </p>
          </div>

          {/* 2. Wealth & Finances */}
          <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-stone-900 font-serif font-bold text-base border-b border-amber-100 pb-2.5">
              <Coins className="w-5 h-5 text-amber-700" />
              <span>{isHi ? "धन एवं वित्तीय समृद्धि" : "Wealth & Financial Growth"}</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              {isHi
                ? sections.section6_careerAndFinances?.financesHi ||
                  "वित्तीय स्थिरता बनाए रखने के लिए संयमित बजट और विवेकपूर्ण निवेश आवश्यक है।"
                : sections.section6_careerAndFinances?.financesEn ||
                  "Financial consolidation and purposeful capital deployment are favored."}
            </p>
          </div>

          {/* 3. Relationships & Marriage */}
          <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-stone-900 font-serif font-bold text-base border-b border-amber-100 pb-2.5">
              <Heart className="w-5 h-5 text-rose-600" />
              <span>{isHi ? "पारिवारिक एवं वैवाहिक सम्बन्ध" : "Relationships & Family"}</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              {isHi
                ? sections.section7_relationshipsAndFamily?.descriptionHi ||
                  "पारिवारिक संवाद में मधुरता और आदर भाव से शांति बनी रहेगी।"
                : sections.section7_relationshipsAndFamily?.descriptionEn ||
                  "Clear communication and mutual respect sustain harmony in personal relationships."}
            </p>
          </div>

          {/* 4. Health & Spiritual Vitality */}
          <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-stone-900 font-serif font-bold text-base border-b border-amber-100 pb-2.5">
              <Flame className="w-5 h-5 text-amber-600" />
              <span>{isHi ? "स्वास्थ्य एवं आध्यात्मिक चेतना" : "Health & Spiritual Vitality"}</span>
            </div>
            <div className="space-y-2 text-xs text-stone-700 leading-relaxed">
              <p>
                <strong className="text-stone-900">{isHi ? "स्वास्थ्य:" : "Vitality:"}</strong>{" "}
                {isHi
                  ? sections.section8_healthAndSpirituality?.healthHi ||
                    "सात्विक आहार और नियमित विश्राम आवश्यक है।"
                  : sections.section8_healthAndSpirituality?.healthEn ||
                    "Sustain physical vitality with regular rest and balanced nutrition."}
              </p>
              <p>
                <strong className="text-stone-900">{isHi ? "साधना:" : "Sadhana:"}</strong>{" "}
                {isHi
                  ? sections.section8_healthAndSpirituality?.spiritualHi ||
                    "स्वाध्याय और ध्यान के लिए अनुकूल समय।"
                  : sections.section8_healthAndSpirituality?.spiritualEn ||
                    "Favorable window for contemplative mindfulness and sacred study."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OPPORTUNITIES & CAUTIONS */}
      {activeTab === "opportunities" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Opportunities Column */}
          <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-200 space-y-4">
            <div className="flex items-center gap-2 text-emerald-900 font-serif font-bold text-base border-b border-emerald-200/80 pb-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{isHi ? "सकारात्मक प्रभाव एवं शुभ अवसर" : "Favorable Opportunities"}</span>
            </div>
            <ul className="space-y-3">
              {(isHi
                ? sections.section4_positiveInfluences?.opportunitiesHi
                : sections.section4_positiveInfluences?.opportunitiesEn) ? (
                (isHi
                  ? sections.section4_positiveInfluences.opportunitiesHi
                  : sections.section4_positiveInfluences.opportunitiesEn
                ).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-emerald-950 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-stone-600">
                  {isHi ? "गणना प्रगति पर है..." : "Calculating opportunities..."}
                </li>
              )}
            </ul>
          </div>

          {/* Cautions Column */}
          <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-200 space-y-4">
            <div className="flex items-center gap-2 text-amber-950 font-serif font-bold text-base border-b border-amber-200/80 pb-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>{isHi ? "संभावित चुनौतियाँ एवं सावधानियाँ" : "Precautionary Advice"}</span>
            </div>
            <ul className="space-y-3">
              {(isHi
                ? sections.section5_potentialChallenges?.challengesHi
                : sections.section5_potentialChallenges?.challengesEn) ? (
                (isHi
                  ? sections.section5_potentialChallenges.challengesHi
                  : sections.section5_potentialChallenges.challengesEn
                ).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-amber-950 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-stone-600">
                  {isHi ? "गणना प्रगति पर है..." : "Calculating precautions..."}
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* TAB 4: TRADITIONAL VEDIC REMEDIES */}
      {activeTab === "remedies" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mahadasha Lord Remedy Card */}
            {sections.section9_traditionalRemedies?.mahadashaRemedy && (
              <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-600" />
                    <h3 className="font-serif font-bold text-stone-900 text-sm">
                      {isHi ? "महादशा अधिपति उपाय:" : "Mahadasha Upaya:"}{" "}
                      {isHi
                        ? sections.section9_traditionalRemedies.mahadashaRemedy.planetHi
                        : sections.section9_traditionalRemedies.mahadashaRemedy.planet}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Presiding Deity */}
                  <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                    <span className="font-semibold text-amber-900 block mb-0.5">
                      {isHi ? "इष्ट / अधिष्ठाता देव:" : "Presiding Deity:"}
                    </span>
                    <span className="text-stone-800">
                      {isHi
                        ? sections.section9_traditionalRemedies.mahadashaRemedy.devataHi
                        : sections.section9_traditionalRemedies.mahadashaRemedy.devata}
                    </span>
                  </div>

                  {/* Beej Mantra */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <span className="font-semibold text-stone-700 block mb-1">
                      {isHi ? "तांत्रिक / बीज मंत्र:" : "Beej Mantra:"}
                    </span>
                    <div className="font-serif text-sm font-bold text-[#13382c] tracking-wide mb-1">
                      {sections.section9_traditionalRemedies.mahadashaRemedy.beejMantra}
                    </div>
                    <div className="text-[11px] text-stone-500 font-mono">
                      {sections.section9_traditionalRemedies.mahadashaRemedy.beejMantraCount}
                    </div>
                  </div>

                  {/* Gayatri Mantra */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <span className="font-semibold text-stone-700 block mb-1">
                      {isHi ? "पौराणिक / गायत्री मंत्र:" : "Pauranik / Gayatri Mantra:"}
                    </span>
                    <div className="font-serif text-xs font-semibold text-stone-900">
                      {sections.section9_traditionalRemedies.mahadashaRemedy.gayatriMantra}
                    </div>
                  </div>

                  {/* Daan (Charity) */}
                  <div className="bg-[#fcfaf5] p-3 rounded-xl border border-amber-200/60 space-y-1">
                    <span className="font-semibold text-amber-900 block">
                      {isHi ? "अनुशंसित दान सामग्री:" : "Recommended Daan (Charity):"}
                    </span>
                    <p className="text-stone-700">
                      {isHi
                        ? sections.section9_traditionalRemedies.mahadashaRemedy.daanHi
                        : sections.section9_traditionalRemedies.mahadashaRemedy.daan}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      <strong>{isHi ? "शुभ समय:" : "Timing:"}</strong>{" "}
                      {sections.section9_traditionalRemedies.mahadashaRemedy.daanDay}
                    </p>
                  </div>

                  {/* Vrata & Sadhana */}
                  <div className="bg-[#fcfaf5] p-3 rounded-xl border border-amber-200/60">
                    <span className="font-semibold text-amber-900 block mb-0.5">
                      {isHi ? "व्रत एवं साधना अनुशासन:" : "Vrata & Discipline:"}
                    </span>
                    <p className="text-stone-700">
                      {isHi
                        ? sections.section9_traditionalRemedies.mahadashaRemedy.vrataSadhanaHi
                        : sections.section9_traditionalRemedies.mahadashaRemedy.vrataSadhana}
                    </p>
                  </div>

                  {/* Citation */}
                  <div className="text-[11px] text-stone-500 italic pt-1">
                    <span className="font-semibold">{isHi ? "शास्त्रीय प्रमाण:" : "Citation:"}</span>{" "}
                    {sections.section9_traditionalRemedies.mahadashaRemedy.citation}
                  </div>
                </div>
              </div>
            )}

            {/* Antardasha Lord Remedy Card */}
            {sections.section9_traditionalRemedies?.antardashaRemedy && (
              <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <h3 className="font-serif font-bold text-stone-900 text-sm">
                      {isHi ? "अंतर्दशा अधिपति उपाय:" : "Antardasha Upaya:"}{" "}
                      {isHi
                        ? sections.section9_traditionalRemedies.antardashaRemedy.planetHi
                        : sections.section9_traditionalRemedies.antardashaRemedy.planet}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Presiding Deity */}
                  <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                    <span className="font-semibold text-amber-900 block mb-0.5">
                      {isHi ? "इष्ट / अधिष्ठाता देव:" : "Presiding Deity:"}
                    </span>
                    <span className="text-stone-800">
                      {isHi
                        ? sections.section9_traditionalRemedies.antardashaRemedy.devataHi
                        : sections.section9_traditionalRemedies.antardashaRemedy.devata}
                    </span>
                  </div>

                  {/* Beej Mantra */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <span className="font-semibold text-stone-700 block mb-1">
                      {isHi ? "तांत्रिक / बीज मंत्र:" : "Beej Mantra:"}
                    </span>
                    <div className="font-serif text-sm font-bold text-[#13382c] tracking-wide mb-1">
                      {sections.section9_traditionalRemedies.antardashaRemedy.beejMantra}
                    </div>
                    <div className="text-[11px] text-stone-500 font-mono">
                      {sections.section9_traditionalRemedies.antardashaRemedy.beejMantraCount}
                    </div>
                  </div>

                  {/* Gayatri Mantra */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <span className="font-semibold text-stone-700 block mb-1">
                      {isHi ? "पौराणिक / गायत्री मंत्र:" : "Pauranik / Gayatri Mantra:"}
                    </span>
                    <div className="font-serif text-xs font-semibold text-stone-900">
                      {sections.section9_traditionalRemedies.antardashaRemedy.gayatriMantra}
                    </div>
                  </div>

                  {/* Daan (Charity) */}
                  <div className="bg-[#fcfaf5] p-3 rounded-xl border border-amber-200/60 space-y-1">
                    <span className="font-semibold text-amber-900 block">
                      {isHi ? "अनुशंसित दान सामग्री:" : "Recommended Daan (Charity):"}
                    </span>
                    <p className="text-stone-700">
                      {isHi
                        ? sections.section9_traditionalRemedies.antardashaRemedy.daanHi
                        : sections.section9_traditionalRemedies.antardashaRemedy.daan}
                    </p>
                    <p className="text-[11px] text-stone-500">
                      <strong>{isHi ? "शुभ समय:" : "Timing:"}</strong>{" "}
                      {sections.section9_traditionalRemedies.antardashaRemedy.daanDay}
                    </p>
                  </div>

                  {/* Vrata & Sadhana */}
                  <div className="bg-[#fcfaf5] p-3 rounded-xl border border-amber-200/60">
                    <span className="font-semibold text-amber-900 block mb-0.5">
                      {isHi ? "व्रत एवं साधना अनुशासन:" : "Vrata & Discipline:"}
                    </span>
                    <p className="text-stone-700">
                      {isHi
                        ? sections.section9_traditionalRemedies.antardashaRemedy.vrataSadhanaHi
                        : sections.section9_traditionalRemedies.antardashaRemedy.vrataSadhana}
                    </p>
                  </div>

                  {/* Citation */}
                  <div className="text-[11px] text-stone-500 italic pt-1">
                    <span className="font-semibold">{isHi ? "शास्त्रीय प्रमाण:" : "Citation:"}</span>{" "}
                    {sections.section9_traditionalRemedies.antardashaRemedy.citation}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ethical Disclaimer */}
          <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-300/80 flex items-start gap-3 text-xs text-amber-950">
            <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isHi
                ? sections.section9_traditionalRemedies?.ethicalDisclaimerHi ||
                  "वैदिक उपाय पारंपरिक आत्म-शुद्धि व सात्विक आचरण के साधन हैं। यह किसी भौतिक फल की गारंटी नहीं हैं और न ही चिकित्सकीय अथवा वित्तीय विशेषज्ञ सलाह का विकल्प हैं।"
                : sections.section9_traditionalRemedies?.ethicalDisclaimerEn ||
                  "Vedic astrology remedies (Upayas) are traditional spiritual contemplative tools rooted in Brihat Parashara Hora Shastra (Ch. 84). They foster mindfulness and inner peace, and are never a substitute for certified medical, legal, or financial counsel."}
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: 120-YEAR TIMELINE & TRANSITIONS */}
      {activeTab === "timeline" && (
        <div className="space-y-6">
          {/* Upcoming Transitions Card */}
          {sections.section10_upcomingTransitions?.milestones && (
            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm space-y-3">
              <h4 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-amber-700" />
                {isHi ? "आगामी दशा संक्रमण एवं उल्टे गिनती" : "Upcoming Transitions Countdown"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {sections.section10_upcomingTransitions.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-amber-200/80 bg-[#fcfaf5] space-y-1.5"
                  >
                    <div className="text-[11px] font-semibold text-stone-600">
                      {isHi ? m.labelHi : m.labelEn}
                    </div>
                    <div className="flex items-baseline justify-between font-mono">
                      <span className="text-xs text-stone-800 font-bold">{m.targetDate}</span>
                      <span className="text-xs text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md font-bold">
                        {m.daysRemaining} {isHi ? "दिन शेष" : "days left"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dasha Balance Note */}
          <div className="flex flex-wrap items-center justify-between text-xs text-stone-600 bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/60 gap-3">
            <div>
              <span className="font-semibold text-stone-800">
                {isHi ? "जन्म समय दशा शेष:" : "Birth Dasha Balance:"}
              </span>{" "}
              <span className="font-mono text-amber-900 font-medium">{dasha.balanceText}</span>
            </div>
            <div className="text-stone-500">
              {isHi ? "चन्द्र नक्षत्र:" : "Moon Nakshatra:"}{" "}
              <span className="font-semibold text-stone-700">{chart.moon?.nakshatra}</span> (
              {chart.moon?.pada} {isHi ? "पाद" : "Pada"})
            </div>
          </div>

          {/* 9 Mahadasha Full Timeline Tree */}
          <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-amber-50/60 border-b border-amber-200/70 flex items-center justify-between">
              <h4 className="font-semibold text-sm text-stone-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                {isHi ? "सम्पूर्ण विंशोत्तरी दशा चक्र (120 वर्ष)" : "120-Year Vimshottari Dasha Hierarchy"}
              </h4>
              <span className="text-xs text-stone-500 font-mono">
                {isHi ? "महादशा → अंतर्दशा → प्रत्यंतर्दशा" : "Maha → Antar → Pratyantar"}
              </span>
            </div>

            <div className="divide-y divide-amber-100/80">
              {dasha.timeline.map((maha, mIdx) => {
                const isMahaExpanded = expandedMaha === mIdx;
                return (
                  <div key={mIdx} className="transition-colors">
                    {/* Mahadasha Row */}
                    <div
                      onClick={() => setExpandedMaha(isMahaExpanded ? null : mIdx)}
                      className={`p-4 flex items-center justify-between cursor-pointer select-none hover:bg-amber-50/50 transition-colors ${
                        maha.isCurrent ? "bg-amber-100/40" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button className="text-stone-400 hover:text-stone-600 p-0.5">
                          {isMahaExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-900 text-sm">
                              {isHi ? maha.sanskritName || maha.lord : maha.lord}
                            </span>
                            {maha.isCurrent && (
                              <span className="bg-[#13382c] text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                                <CheckCircle2 className="w-3 h-3" />
                                {isHi ? "वर्तमान" : "Active"}
                              </span>
                            )}
                            {maha.isPartial && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">
                                {isHi ? "जन्म शेष" : "Balance"}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-stone-500 font-mono mt-0.5">
                            {maha.startDate} → {maha.endDate} ({maha.durationYears}y)
                          </div>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 font-mono">
                        {maha.durationYears} {isHi ? "वर्ष" : "Yrs"}
                      </div>
                    </div>

                    {/* Antardasha Expansion */}
                    {isMahaExpanded && maha.antardashas && (
                      <div className="bg-[#fcfaf5] p-4 pl-10 border-t border-amber-100 space-y-3">
                        <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
                          {isHi ? `${maha.lord} में 9 अंतर्दशाएं (भुक्ति)` : `9 Antardashas under ${maha.lord}`}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {maha.antardashas.map((antar, aIdx) => {
                            const antarKey = `${mIdx}-${aIdx}`;
                            const isAntarExpanded = expandedAntar === antarKey;
                            return (
                              <div
                                key={aIdx}
                                className={`p-3 rounded-xl border text-xs transition-all ${
                                  antar.isCurrent
                                    ? "bg-amber-100/60 border-amber-400/80 shadow-2xs ring-1 ring-amber-400/40"
                                    : "bg-white border-amber-200/70 hover:border-amber-300"
                                }`}
                              >
                                <div
                                  onClick={() => setExpandedAntar(isAntarExpanded ? null : antarKey)}
                                  className="flex items-center justify-between cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-stone-900">
                                      {maha.lord} - {antar.lord}
                                    </span>
                                    {antar.isCurrent && (
                                      <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.2 rounded font-bold">
                                        {isHi ? "सक्रिय" : "Active"}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-stone-400 hover:text-stone-600">
                                    {isAntarExpanded ? (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronRight className="w-3.5 h-3.5" />
                                    )}
                                  </span>
                                </div>

                                <div className="text-[11px] text-stone-500 font-mono mt-1">
                                  {antar.startDate} → {antar.endDate} ({antar.durationMonths}m)
                                </div>

                                {/* Pratyantardasha Sub-level Expansion */}
                                {isAntarExpanded && antar.pratyantardashas && (
                                  <div className="mt-3 pt-2.5 border-t border-amber-200/60 space-y-1.5">
                                    <div className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider">
                                      {isHi ? "9 प्रत्यंतर्दशाएं (सूक्ष्म)" : "9 Pratyantardashas"}
                                    </div>
                                    <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                                      {antar.pratyantardashas.map((p, pIdx) => (
                                        <div
                                          key={pIdx}
                                          className={`flex items-center justify-between p-1.5 rounded text-[11px] font-mono ${
                                            p.isCurrent
                                              ? "bg-amber-200/60 font-bold text-amber-950"
                                              : "hover:bg-amber-50 text-stone-700"
                                          }`}
                                        >
                                          <span>
                                            {maha.lord.slice(0, 2)}-{antar.lord.slice(0, 2)}-
                                            {p.lord.slice(0, 2)}
                                          </span>
                                          <span className="text-stone-500 text-[10px]">
                                            {p.startDate} ({p.durationDays}d)
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
