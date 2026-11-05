"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flower2,
  ShieldAlert,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Bookmark,
  Check,
  AlertTriangle,
  ArrowRight,
  Sun,
  Flame,
  Wind,
  Droplets,
  Layers,
  Heart,
  Eye,
  Crown,
  Search,
  Languages,
  Printer,
  Compass,
  Save,
  Award,
} from "lucide-react";
import { CHAKRAS_ARRAY } from "../../server/spirituality/chakraKnowledge.js";
import InteractiveChakraStudio from "./InteractiveChakraStudio.jsx";
import NadisAndGranthisVisualizer from "./NadisAndGranthisVisualizer.jsx";
import GuidedPranayamaStudio from "./GuidedPranayamaStudio.jsx";
import GuidedMeditationStudio from "./GuidedMeditationStudio.jsx";
import SanskritShlokaExplorer from "./SanskritShlokaExplorer.jsx";
import PersonalSpiritualDashboard from "./PersonalSpiritualDashboard.jsx";

export default function KundaliniClient() {
  const [chakras, setChakras] = useState(CHAKRAS_ARRAY);
  const [activeMainSection, setActiveMainSection] = useState("chakras"); // chakras | nadis | pranayama | meditation | shlokas | dashboard
  const [activeChakraSlug, setActiveChakraSlug] = useState(CHAKRAS_ARRAY[0].slug);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState("ALL"); // ALL | BEGINNER | INTERMEDIATE | THEORY
  const [language, setLanguage] = useState("en"); // en | hi
  const isHi = language === "hi" || language === "hindi";

  // Reflection notes and completion state
  const [reflectionNotes, setReflectionNotes] = useState({});
  const [completedMap, setCompletedMap] = useState({});
  const [bookmarkedMap, setBookmarkedMap] = useState({});
  const [saveStatus, setSaveStatus] = useState("");
  const [expandedModuleId, setExpandedModuleId] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch("/api/spirituality/kundalini");
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            if (Array.isArray(json.chakras) && json.chakras.length > 0) {
              setChakras(json.chakras);
              const comp = {};
              const bkm = {};
              const notes = {};
              json.chakras.forEach((c) => {
                if (c.isCompleted) comp[c.slug] = true;
                if (c.isBookmarked) bkm[c.slug] = true;
                if (c.userReflectionNote) notes[c.slug] = c.userReflectionNote;
              });
              setCompletedMap(comp);
              setBookmarkedMap(bkm);
              setReflectionNotes(notes);
            }
            if (Array.isArray(json.modules)) {
              setModules(json.modules);
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch remote Kundalini data, using bundled classical curriculum:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleToggleComplete = async (chakra) => {
    const isNow = !completedMap[chakra.slug];
    setCompletedMap((prev) => ({ ...prev, [chakra.slug]: isNow }));

    try {
      const res = await fetch("/api/spirituality/kundalini/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: chakra.slug,
          action: isNow ? "complete" : "uncomplete",
        }),
      });
      if (res.ok && isNow) {
        showNotification(isHi ? `पूर्ण हुआ: ${chakra.sanskritName} (+20 XP अर्जित)` : `Completed: ${chakra.englishName} (+20 XP Earned)`);
      }
    } catch {
      // Local state preserved
    }
  };

  const handleToggleBookmark = async (chakra) => {
    const isNow = !bookmarkedMap[chakra.slug];
    setBookmarkedMap((prev) => ({ ...prev, [chakra.slug]: isNow }));

    try {
      await fetch("/api/spirituality/kundalini/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: chakra.slug,
          action: isNow ? "bookmark" : "unbookmark",
        }),
      });
    } catch {
      // Local state preserved
    }
  };

  const handleSaveReflection = async (slug, note) => {
    setReflectionNotes((prev) => ({ ...prev, [slug]: note }));
    try {
      const chakra = chakras.find((c) => c.slug === slug) || {};
      const res = await fetch("/api/spirituality/kundalini/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId: slug,
          action: "save_notes",
          notes: note,
          term: chakra.sanskritName || slug,
        }),
      });
      if (res.ok) {
        showNotification(isHi ? "आपकी चिंतन टिप्पणी सुरक्षित हो गई है।" : "Reflection notes saved to your spiritual journal.");
      }
    } catch {
      // Local state preserved
    }
  };

  const handleSessionComplete = (summary) => {
    showNotification(
      isHi
        ? `साधना पूर्ण: ${summary.titleHi || summary.titleEn} (+${summary.xpEarned || 15} XP अर्जित)`
        : `Session Complete: ${summary.titleEn} (+${summary.xpEarned || 15} XP Earned)`
    );
  };

  const handleNavigateTab = (tab, payload) => {
    setActiveMainSection(tab);
    if (tab === "chakras" && payload?.slug) {
      setActiveChakraSlug(payload.slug);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredModules = modules.filter((m) => {
    if (selectedLevel === "ALL") return true;
    return m.level === selectedLevel;
  });

  return (
    <div className="bg-[#fcfaf5] min-h-screen py-6 sm:py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Floating Notification */}
        {notification && (
          <div className="fixed top-6 right-6 z-50 bg-[#13382c] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-2">
            <Sparkles className="w-4 h-4 text-[#c4903c] shrink-0" />
            <span className="font-medium">{notification}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#ede5d6]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#faf5ec] text-[#c4903c] border border-[#ede5d6] uppercase tracking-wider">
                {isHi ? "प्रामाणिक योग शास्त्र एवं साधना" : "Classical Yogic Shastra & Sadhana"}
              </span>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-xs font-medium text-stone-500">
                Shat-Chakra-Nirupana, Shiva Samhita & Hatha Yoga Pradipika
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight mt-1">
              {isHi ? "कुण्डलिनी, चक्र एवं आध्यात्मिक साधना केंद्र" : "Chakra Studio & Guided Spiritual Practice"}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
              {isHi
                ? "प्राण, नाड़ियों, ग्रन्थियों और सप्त चक्रों का प्रामाणिक शास्त्रीय अध्ययन एवं सुरक्षित निर्देशित साधना। बिना किसी अंधविश्वास या भ्रामक दावों के, शास्त्रीय परंपरा पर आधारित शिक्षण।"
                : "Explore authentic subtle anatomy (Chakras, Nadis, Granthis) and engage in traditional guided Pranayama and Meditation. Grounded in verified classical manuscripts, free from sensationalism."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-center">
            {/* Language Switch */}
            <button
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#ede5d6] text-xs font-semibold text-stone-700 hover:bg-stone-50 shadow-2xs transition cursor-pointer"
              title="Toggle English / Hindi terminology"
            >
              <Languages className="w-3.5 h-3.5 text-[#c4903c]" />
              <span>{language === "en" ? "हिन्दी" : "English"}</span>
            </button>

            {/* Print Layout */}
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white border border-[#ede5d6] text-stone-600 hover:text-stone-900 hover:bg-stone-50 shadow-2xs transition cursor-pointer"
              title="Print study guide"
            >
              <Printer className="w-4 h-4" />
            </button>

            <Link
              href="/library"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#ede5d6] text-xs font-semibold text-stone-700 hover:bg-stone-50 transition shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#c4903c]" />
              <span>Digital Library</span>
            </Link>

            <Link
              href="/astrology"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#ede5d6] text-xs font-semibold text-stone-700 hover:bg-stone-50 transition shadow-2xs"
            >
              <Compass className="w-3.5 h-3.5 text-[#c4903c]" />
              <span>Vedic Astrology</span>
            </Link>
          </div>
        </div>

        {/* CRITICAL SAFETY BANNER (Non-Negotiable) */}
        <div className="bg-amber-50 rounded-2xl border border-amber-200/90 p-5 sm:p-6 shadow-2xs space-y-3">
          <div className="flex items-start gap-3.5">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h3 className="font-serif font-bold text-sm sm:text-base text-amber-950">
                {isHi ? "शास्त्रीय चिंतन एवं ध्यान सुरक्षा निर्देश" : "Ethical & Safety Notice for Contemplative Practices"}
              </h3>
              <p className="text-xs text-amber-900/90 leading-relaxed">
                1. <strong>Gentle and Optional:</strong> Classical texts emphasize moral discipline (Yama/Niyama) and natural ease (Sthira-Sukha) over aggressive techniques.
              </p>
              <p className="text-xs text-amber-900/90 leading-relaxed">
                2. <strong>No Forceful Breath Retention:</strong> Never practice extreme breath holding (Kumbhaka) or hyperventilation without years of supervised foundation.
              </p>
              <p className="text-xs text-amber-900/90 leading-relaxed">
                3. <strong>Clear Stop Instructions:</strong> If at any point you experience lightheadedness, tingling, anxiety, or physical discomfort, discontinue immediately. Open your eyes, drink warm water, and ground yourself in ordinary physical activity.
              </p>
              <p className="text-xs text-amber-900/90 leading-relaxed">
                4. <strong>Non-Medical Scope:</strong> These practices are contemplative philosophies and are NOT a substitute for professional medical, psychiatric, or psychological diagnosis or treatment.
              </p>
            </div>
          </div>
        </div>

        {/* MODE SWITCHER NAVIGATION (All 6 Studio Tabs) */}
        <div className="flex border-b border-[#ede5d6] gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveMainSection("chakras")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeMainSection === "chakras"
                ? "bg-[#13382c] text-white shadow-xs"
                : "bg-white text-stone-700 hover:bg-stone-50 border border-[#ede5d6]"
            }`}
          >
            <Flower2 className="w-4 h-4 text-[#c4903c]" />
            <span>{isHi ? "सप्त चक्र स्टूडियो (Seven Chakras)" : "Seven Chakras Studio"}</span>
          </button>

          <button
            onClick={() => setActiveMainSection("nadis")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeMainSection === "nadis"
                ? "bg-[#13382c] text-white shadow-xs"
                : "bg-white text-stone-700 hover:bg-stone-50 border border-[#ede5d6]"
            }`}
          >
            <Layers className="w-4 h-4 text-[#c4903c]" />
            <span>{isHi ? "नाड़ी एवं ग्रन्थि विज्ञान (Nadis & Granthis)" : "Nadis & Granthis"}</span>
          </button>

          <button
            onClick={() => setActiveMainSection("pranayama")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeMainSection === "pranayama"
                ? "bg-[#13382c] text-white shadow-xs"
                : "bg-white text-stone-700 hover:bg-stone-50 border border-[#ede5d6]"
            }`}
          >
            <Wind className="w-4 h-4 text-[#c4903c]" />
            <span>{isHi ? "प्राणायाम स्टूडियो (Guided Pranayama)" : "Guided Pranayama Studio"}</span>
          </button>

          <button
            onClick={() => setActiveMainSection("meditation")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeMainSection === "meditation"
                ? "bg-[#13382c] text-white shadow-xs"
                : "bg-white text-stone-700 hover:bg-stone-50 border border-[#ede5d6]"
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#c4903c]" />
            <span>{isHi ? "ध्यान स्टूडियो (Guided Meditation)" : "Guided Meditation Studio"}</span>
          </button>

          <button
            onClick={() => setActiveMainSection("shlokas")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeMainSection === "shlokas"
                ? "bg-[#13382c] text-white shadow-xs"
                : "bg-white text-stone-700 hover:bg-stone-50 border border-[#ede5d6]"
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#c4903c]" />
            <span>{isHi ? "संस्कृत मन्त्र एवं अन्वय (Sanskrit & Anvaya)" : "Sanskrit Mantras & Anvaya"}</span>
          </button>

          <button
            onClick={() => setActiveMainSection("dashboard")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeMainSection === "dashboard"
                ? "bg-[#13382c] text-white shadow-xs"
                : "bg-white text-stone-700 hover:bg-stone-50 border border-[#ede5d6]"
            }`}
          >
            <Award className="w-4 h-4 text-[#c4903c]" />
            <span>{isHi ? "व्यक्तिगत साधना डैशबोर्ड (Sadhana Dashboard)" : "Personal Sadhana Dashboard"}</span>
          </button>
        </div>

        {/* SECTION 1: INTERACTIVE SEVEN CHAKRA STUDIO */}
        {activeMainSection === "chakras" && (
          <div className="space-y-8">
            <InteractiveChakraStudio
              chakras={chakras}
              activeChakraSlug={activeChakraSlug}
              onSelectChakra={setActiveChakraSlug}
              completedMap={completedMap}
              bookmarkedMap={bookmarkedMap}
              reflectionNotes={reflectionNotes}
              onToggleComplete={handleToggleComplete}
              onToggleBookmark={handleToggleBookmark}
              onSaveNotes={handleSaveReflection}
              language={language}
            />

            {/* CURRICULUM MODULES */}
            <div className="space-y-4 pt-6 border-t border-[#ede5d6]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
                    {isHi ? "शैक्षणिक अध्ययन मॉड्यूल" : "Educational Curriculum Modules"}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    From historical foundations to theoretical philosophy in Kashmir Shaivism.
                  </p>
                </div>

                {/* Filter by Level */}
                <div className="inline-flex rounded-xl bg-white border border-[#ede5d6] p-0.5 text-xs font-medium text-stone-700 shadow-2xs">
                  {["ALL", "BEGINNER", "INTERMEDIATE", "THEORY"].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setSelectedLevel(lvl)}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                        selectedLevel === lvl ? "bg-[#13382c] text-white" : "hover:text-stone-900"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {loading && (
                <div className="bg-white rounded-2xl border border-[#ede5d6] p-8 text-center text-stone-500 text-xs">
                  Loading educational modules...
                </div>
              )}

              {!loading && filteredModules.length === 0 && (
                <div className="bg-white rounded-2xl border border-[#ede5d6] p-8 text-center text-stone-500 text-xs">
                  No modules found for this level filter.
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredModules.map((mod) => {
                  const isExpanded = expandedModuleId === mod.id;

                  return (
                    <div
                      key={mod.id}
                      className="bg-white rounded-2xl border border-[#ede5d6] hover:border-[#d9cbba] transition shadow-2xs flex flex-col justify-between overflow-hidden"
                    >
                      <div className="p-5 sm:p-6 space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[#faf5ec] text-[#c4903c] border border-[#ede5d6] uppercase tracking-wider">
                              {mod.level}
                            </span>
                            <span className="text-xs text-stone-400">
                              {mod.chakraAssociation}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-base sm:text-lg font-bold font-serif text-stone-900 leading-snug">
                            {mod.title}
                          </h3>
                          {mod.subtitle && (
                            <p className="text-xs text-stone-500 mt-0.5 font-medium">
                              {mod.subtitle}
                            </p>
                          )}
                        </div>

                        {mod.historicalContext && (
                          <p className="text-xs text-stone-600 leading-relaxed">
                            {mod.historicalContext}
                          </p>
                        )}

                        {isExpanded && mod.practices && (
                          <div className="pt-3 border-t border-[#ede5d6] space-y-3 text-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#c4903c] block">
                              Contemplative Practice Guidance
                            </span>
                            {Array.isArray(mod.practices) &&
                              mod.practices.map((pr, pIdx) => (
                                <div key={pIdx} className="p-3 rounded-xl bg-stone-50 border border-stone-100 space-y-1">
                                  <span className="font-bold text-stone-900 block">
                                    Step {pr.step}: {pr.title}
                                  </span>
                                  <p className="text-stone-600 leading-relaxed">{pr.text}</p>
                                </div>
                              ))}
                            {mod.safetyGuidance && (
                              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950">
                                <strong>Safety Note: </strong>
                                {mod.safetyGuidance}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="px-5 py-3 bg-[#faf8f4] border-t border-[#ede5d6] flex items-center justify-between">
                        <button
                          onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                          className="text-xs font-bold text-stone-700 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                        >
                          <span>{isExpanded ? "Hide Details" : "Read Full Module"}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: THREE NADIS & THREE GRANTHIS VISUALIZER */}
        {activeMainSection === "nadis" && (
          <NadisAndGranthisVisualizer language={language} />
        )}

        {/* SECTION 3: GUIDED PRANAYAMA STUDIO */}
        {activeMainSection === "pranayama" && (
          <GuidedPranayamaStudio
            language={language}
            onSessionComplete={handleSessionComplete}
          />
        )}

        {/* SECTION 4: GUIDED MEDITATION STUDIO */}
        {activeMainSection === "meditation" && (
          <GuidedMeditationStudio
            language={language}
            onSessionComplete={handleSessionComplete}
          />
        )}

        {/* SECTION 5: SANSKRIT SHLOKA INTELLIGENCE & ANVAYA */}
        {activeMainSection === "shlokas" && (
          <SanskritShlokaExplorer language={language} />
        )}

        {/* SECTION 6: PERSONAL SPIRITUAL DASHBOARD */}
        {activeMainSection === "dashboard" && (
          <PersonalSpiritualDashboard
            language={language}
            onNavigateTab={handleNavigateTab}
          />
        )}
      </div>
    </div>
  );
}
