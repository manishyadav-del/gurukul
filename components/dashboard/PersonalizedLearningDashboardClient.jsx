"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Bookmark,
  FileText,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  Compass,
  Flame,
  Trophy,
  Shield,
  Star,
  Layers,
  ChevronRight,
  Check,
  RefreshCw,
  ExternalLink,
  Target,
  Calendar,
  Settings2,
  HelpCircle,
  Sliders,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function PersonalizedLearningDashboardClient({ initialData }) {
  const [data, setData] = useState(initialData);
  const [activeCategory, setActiveCategory] = useState("ALL"); // ALL | VEDIC_ASTROLOGY | KUNDALINI_SPIRITUALITY | DIGITAL_LIBRARY
  const [completingLessonId, setCompletingLessonId] = useState(null);
  const [expandedPathId, setExpandedPathId] = useState("path-vedic-astrology");
  const [goalsModalOpen, setGoalsModalOpen] = useState(false);
  const [targetTopicsInput, setTargetTopicsInput] = useState(initialData?.dailyGoals?.today?.targetTopics || 2);
  const [targetPagesInput, setTargetPagesInput] = useState(initialData?.dailyGoals?.today?.targetPages || 10);
  const [savingGoals, setSavingGoals] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const user = data?.user || { name: "Student" };
  const gamification = data?.gamification || {};
  const levelInfo = gamification?.levelInfo || {
    level: user.level || 1,
    title: "Novice Seeker",
    sanskritTitle: "जिज्ञासु",
    totalXp: user.totalXp || 0,
    currentLevelXp: 0,
    xpToNextLevel: 100,
    progressPercent: 0,
  };

  const dailyGoals = data?.dailyGoals || {
    today: { targetTopics: 2, studiedTopics: 0, targetPages: 10, readPages: 0, isCompleted: false },
    streak: { currentStreak: 0, longestStreak: 0, activeToday: false },
    weeklyProgress: { days: [] },
  };

  const continueLearning = data?.continueLearning;
  const learningPaths = data?.learningPaths || [];
  const recommendations = data?.recommendations || [];
  const recentlyViewed = data?.recentlyViewed || [];
  const savedConcepts = data?.savedConcepts || [];
  const categories = data?.categories || {};

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  }

  // Filter recommendations based on active category
  const filteredRecommendations = recommendations.filter((rec) => {
    if (activeCategory === "ALL") return true;
    return rec.category === activeCategory;
  });

  // Handle toggling lesson completion
  async function handleToggleLesson(pathId, lessonId, currentStatus) {
    setCompletingLessonId(lessonId);
    try {
      const res = await fetch("/api/learning/paths", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pathId,
          lessonId,
          completed: !currentStatus,
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        // Refresh dashboard data seamlessly
        const refreshRes = await fetch("/api/learning/dashboard");
        if (refreshRes.ok) {
          const freshData = await refreshRes.json();
          setData(freshData);
        }

        if (!currentStatus) {
          showToast(`✓ Completed lesson! +${resData.xpAward?.amount || 40} XP earned.`);
        } else {
          showToast("Lesson marked incomplete.");
        }
      } else {
        showToast("Error updating lesson progress: " + (resData.error || "Please log in"));
      }
    } catch (err) {
      showToast("Network error updating progress.");
    } finally {
      setCompletingLessonId(null);
    }
  }

  // Handle saving daily target goals
  async function handleSaveGoals(e) {
    e.preventDefault();
    setSavingGoals(true);
    try {
      const res = await fetch("/api/learning/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetTopics: parseInt(targetTopicsInput, 10),
          targetPages: parseInt(targetPagesInput, 10),
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        showToast("✓ Daily learning goals updated successfully!");
        setGoalsModalOpen(false);
        const refreshRes = await fetch("/api/learning/dashboard");
        if (refreshRes.ok) {
          const freshData = await refreshRes.json();
          setData(freshData);
        }
      } else {
        showToast("Failed to save goals: " + (json.error || "Unknown"));
      }
    } catch {
      showToast("Network error saving daily goals.");
    } finally {
      setSavingGoals(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#13382c] text-white px-5 py-3 rounded-2xl shadow-xl border border-[#c4903c] text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-[#d4a359]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP LEARNER HERO & GAMIFICATION HEADER */}
      <section className="bg-gradient-to-r from-[#13382c] via-[#1b4d3d] to-[#0f2e24] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#c4903c]/20 relative overflow-hidden">
        {/* Subtle background mandala / geometry */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d4a359]/10 via-transparent to-transparent pointer-events-none rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#c4903c]/20 border border-[#c4903c]/40 text-[#f3caa1] text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-[#d4a359]" />
                Level {levelInfo.level}: {levelInfo.title}
                {levelInfo.sanskritTitle && ` (${levelInfo.sanskritTitle})`}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                {dailyGoals.streak?.currentStreak || 0} Day Streak
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white tracking-tight">
              Namaste, {user.name || "Student"}
            </h1>
            <p className="text-sm text-stone-300 max-w-xl font-light leading-relaxed">
              Your personalized learning trajectory across Vedic Astrology, Kundalini Subtle Anatomy, and digital manuscripts.
            </p>
          </div>

          {/* XP & Level Progress Card */}
          <div className="bg-[#0f2820]/80 p-4 rounded-2xl border border-white/10 shrink-0 w-full sm:w-80 space-y-2.5 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-stone-300">Total Experience</span>
              <span className="text-[#f3caa1] font-mono text-sm">{levelInfo.totalXp} XP</span>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#d4a359] to-amber-300 h-full rounded-full transition-all duration-300"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-stone-400">
              <span>{levelInfo.progressPercent}% of current tier</span>
              <span>{levelInfo.isMaxLevel ? "Master Rank" : `${levelInfo.xpToNextLevel} XP to Level ${levelInfo.level + 1}`}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY SWITCHER PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { id: "ALL", label: "All Learning Domains" },
          { id: "VEDIC_ASTROLOGY", label: "♈ Vedic Astrology" },
          { id: "KUNDALINI_SPIRITUALITY", label: "🧘 Kundalini & Subtle Body" },
          { id: "DIGITAL_LIBRARY", label: "📖 Digital Library" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap transition cursor-pointer font-medium ${
              activeCategory === tab.id
                ? "bg-[#13382c] text-white shadow-xs font-bold"
                : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. CONTINUE LEARNING & DAILY GOALS (Two-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Continue Learning Action Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#c4903c] uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                Continue Learning
              </span>
              {continueLearning?.badge && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  {continueLearning.badge}
                </span>
              )}
            </div>

            <h3 className="text-xl font-serif font-bold text-stone-900 leading-snug">
              {continueLearning?.title || "Explore Classical Knowledge"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              {continueLearning?.subtitle || "Begin your foundational study of authentic Vedic Shastras."}
            </p>

            {continueLearning?.progress > 0 && (
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs text-stone-500 font-medium">
                  <span>Current Progress</span>
                  <span>{continueLearning.progress}%</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#13382c] h-full rounded-full transition-all duration-300"
                    style={{ width: `${continueLearning.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Link
              href={continueLearning?.url || "/explore"}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#13382c] text-white hover:bg-[#1b4d3d] transition font-semibold text-xs shadow-xs"
            >
              <span>{continueLearning?.actionText || "Resume Study"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Daily Learning Goals & Weekly Streak (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#c4903c]" />
              <h3 className="font-serif font-bold text-sm text-stone-900">Today's Learning Targets</h3>
            </div>
            <button
              onClick={() => setGoalsModalOpen(true)}
              className="text-stone-400 hover:text-stone-700 text-xs flex items-center gap-1 cursor-pointer font-medium"
              title="Configure daily targets"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          {/* Two Targets Progress Bars */}
          <div className="space-y-3 text-xs">
            {/* Target 1: Lessons / Topics */}
            <div className="space-y-1">
              <div className="flex justify-between text-stone-700 font-medium">
                <span>Topics / Lessons</span>
                <span className="font-mono text-stone-900 font-bold">
                  {dailyGoals.today?.studiedTopics || 0} / {dailyGoals.today?.targetTopics || 2}
                </span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${dailyGoals.today?.topicsProgressPercent || 0}%` }}
                />
              </div>
            </div>

            {/* Target 2: Manuscript Pages */}
            <div className="space-y-1">
              <div className="flex justify-between text-stone-700 font-medium">
                <span>Manuscript Pages</span>
                <span className="font-mono text-stone-900 font-bold">
                  {dailyGoals.today?.readPages || 0} / {dailyGoals.today?.targetPages || 10}
                </span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#c4903c] h-full rounded-full transition-all"
                  style={{ width: `${dailyGoals.today?.pagesProgressPercent || 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* 7-Day Weekly Activity Streak Dots */}
          <div className="pt-2 border-t border-stone-100 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
              7-Day Activity & Streak ({dailyGoals.timezone})
            </span>
            <div className="grid grid-cols-7 gap-1 text-center">
              {(dailyGoals.weeklyProgress?.days || []).map((day, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-[10px] text-stone-400 block font-medium">{day.dayOfWeek}</span>
                  <div
                    className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center text-xs transition ${
                      day.isToday
                        ? "ring-2 ring-[#c4903c] bg-stone-50 font-bold"
                        : ""
                    } ${
                      day.isCompleted
                        ? "bg-[#13382c] text-[#f3caa1]"
                        : day.active
                        ? "bg-emerald-100 text-emerald-800 font-semibold"
                        : "bg-stone-100 text-stone-400"
                    }`}
                    title={`${day.date}: ${day.studiedTopics} topics, ${day.readPages} pages, ${day.xpEarned} XP`}
                  >
                    {day.isCompleted ? (
                      <Star className="w-3.5 h-3.5 fill-current" />
                    ) : day.active ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[10px]">•</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. EXPLAINABLE RECOMMENDATIONS SECTION */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#c4903c]" />
              Recommended for You
            </h2>
            <p className="text-xs text-stone-500">
              Transparent suggestions grounded in your completed lessons, bookmarks, and classical shastric ontology.
            </p>
          </div>
          <span className="text-xs text-stone-400 font-mono">
            {filteredRecommendations.length} Recommendations
          </span>
        </div>

        {filteredRecommendations.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-500 text-xs">
            No recommendations match this specific category filter yet. Check &quot;All Learning Domains&quot;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRecommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-stone-100 text-stone-700">
                      {rec.categoryLabel}
                    </span>
                    {rec.badge && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80">
                        {rec.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-stone-900 group-hover:text-[#13382c] transition">
                      {rec.title}
                    </h4>
                    {rec.subtitle && (
                      <p className="text-xs text-stone-500 mt-0.5">{rec.subtitle}</p>
                    )}
                  </div>

                  {/* Explainability Callout (Why Recommended) */}
                  <div className="p-2.5 rounded-xl bg-[#fcfaf5] border border-amber-200/60 text-[11px] text-amber-950 flex items-start gap-1.5 leading-relaxed">
                    <HelpCircle className="w-3.5 h-3.5 text-[#c4903c] shrink-0 mt-0.5" />
                    <span>
                      <strong>Why this?</strong> {rec.reason}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  {rec.estimatedMin && (
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {rec.estimatedMin} min
                    </span>
                  )}
                  <Link
                    href={rec.url}
                    className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#13382c] group-hover:text-[#c4903c] transition"
                  >
                    <span>Start Learning</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. STRUCTURED LEARNING PATHS */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <div>
            <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#13382c]" />
              Structured Learning Paths
            </h2>
            <p className="text-xs text-stone-500">
              Curated curricula with ordered milestones, completion tracking, and shastric sources.
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {learningPaths.map((path) => {
            const isExpanded = expandedPathId === path.id;

            return (
              <div
                key={path.id}
                className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden transition"
              >
                {/* Path Header Bar */}
                <div
                  onClick={() => setExpandedPathId(isExpanded ? null : path.id)}
                  className="p-5 sm:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50/50 transition"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#13382c]/10 text-[#13382c]">
                        {path.categoryLabel}
                      </span>
                      {path.sanskritTitle && (
                        <span className="text-xs font-serif font-bold text-[#c4903c]">
                          {path.sanskritTitle}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                      {path.title}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed font-light">
                      {path.description}
                    </p>
                  </div>

                  {/* Progress Ring / Percentage */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-bold text-stone-900 block font-mono">
                        {path.progressPercent}%
                      </span>
                      <span className="text-[11px] text-stone-400">
                        {path.completedCount} / {path.totalLessons} Lessons
                      </span>
                    </div>

                    <div className="w-16 bg-stone-100 h-2 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="bg-[#13382c] h-full rounded-full transition-all"
                        style={{ width: `${path.progressPercent}%` }}
                      />
                    </div>

                    <button className="text-stone-400 hover:text-stone-700 p-1">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expandable Lessons Timeline */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-stone-100 bg-[#fcfaf5]/60 space-y-4">
                    {path.safetyNotice && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                        <Shield className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <span>{path.safetyNotice}</span>
                      </div>
                    )}

                    <div className="divide-y divide-stone-200/60">
                      {path.lessons.map((lesson) => {
                        const isThisCompleting = completingLessonId === lesson.id;

                        return (
                          <div
                            key={lesson.id}
                            className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                              lesson.isCompleted ? "opacity-75" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <button
                                onClick={() =>
                                  handleToggleLesson(path.id, lesson.id, lesson.isCompleted)
                                }
                                disabled={isThisCompleting}
                                className={`w-5 h-5 mt-0.5 rounded-full flex items-center justify-center shrink-0 border transition cursor-pointer ${
                                  lesson.isCompleted
                                    ? "bg-emerald-600 border-emerald-600 text-white"
                                    : "border-stone-300 hover:border-stone-500 text-transparent"
                                }`}
                                title={lesson.isCompleted ? "Mark incomplete" : "Mark completed (+40 XP)"}
                              >
                                {isThisCompleting ? (
                                  <RefreshCw className="w-3 h-3 animate-spin text-stone-500" />
                                ) : (
                                  <Check className="w-3 h-3 stroke-[3]" />
                                )}
                              </button>

                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-stone-400 text-[11px]">
                                    Lesson {lesson.order}:
                                  </span>
                                  <h5
                                    className={`font-semibold ${
                                      lesson.isCompleted
                                        ? "line-through text-stone-500"
                                        : "text-stone-900"
                                    }`}
                                  >
                                    {lesson.title}
                                  </h5>
                                  {lesson.sanskrit && (
                                    <span className="text-[11px] font-serif text-[#c4903c]">
                                      {lesson.sanskrit}
                                    </span>
                                  )}
                                  {lesson.isNext && (
                                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#13382c] text-[#f3caa1]">
                                      Up Next
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-stone-500 line-clamp-1">
                                  {lesson.summary}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                              <span className="text-[11px] text-stone-400">
                                {lesson.durationMin} min
                              </span>
                              <Link
                                href={lesson.url}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-[#13382c] hover:text-white text-stone-800 transition cursor-pointer"
                              >
                                Study
                              </Link>
                            </div>
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
      </section>

      {/* 6. RECENTLY VIEWED & BOOKMARKED CONCEPTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recently Viewed Topics (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-400" />
              Recently Viewed Topics
            </h3>
            <span className="text-[11px] text-stone-400 font-mono">
              {recentlyViewed.length} Topics
            </span>
          </div>

          {recentlyViewed.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-6">
              No recent topic views logged yet. Explore concepts in the Knowledge Explorer to populate this list.
            </p>
          ) : (
            <div className="divide-y divide-stone-100">
              {recentlyViewed.map((topic) => (
                <Link
                  key={topic.id}
                  href={topic.url}
                  className="py-2.5 flex items-center justify-between text-xs hover:text-[#13382c] transition group"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                      {topic.category}
                    </span>
                    <p className="font-semibold text-stone-800 truncate group-hover:text-[#13382c]">
                      {topic.title}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bookmarked & Saved Concepts (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200/80 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-serif font-bold text-sm text-stone-900 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
              Saved Study Concepts & Notes
            </h3>
            <Link
              href="/dashboard/bookmarks"
              className="text-xs font-semibold text-[#13382c] hover:underline"
            >
              View All ({savedConcepts.length})
            </Link>
          </div>

          {savedConcepts.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-6">
              No concepts bookmarked yet. Use the star bookmark in Knowledge Explorer to save key shastric terms.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {savedConcepts.slice(0, 4).map((sc) => (
                <div
                  key={sc.id}
                  className="p-3 rounded-xl bg-[#fcfaf5] border border-stone-200/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-stone-100 text-stone-600">
                      {sc.category}
                    </span>
                    {sc.sanskritTerm && (
                      <span className="text-xs font-serif text-[#c4903c] font-bold">
                        {sc.sanskritTerm}
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-stone-900 truncate">{sc.term}</h5>
                  <p className="text-[11px] text-stone-500 line-clamp-2">{sc.meaning || sc.notes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 7. DAILY GOALS SETTINGS MODAL */}
      {goalsModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-stone-900 text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-[#c4903c]" />
                Configure Daily Learning Targets
              </h3>
              <button
                onClick={() => setGoalsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGoals} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">
                  Daily Topics / Lessons Target
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={targetTopicsInput}
                  onChange={(e) => setTargetTopicsInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#d4a359]"
                />
                <span className="text-[11px] text-stone-400">
                  Recommended: 2 topics per day for steady retention.
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700 block">
                  Daily Manuscript Pages Target
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={targetPagesInput}
                  onChange={(e) => setTargetPagesInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#d4a359]"
                />
                <span className="text-[11px] text-stone-400">
                  Recommended: 10 pages per day in digital library reader.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setGoalsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingGoals}
                  className="px-5 py-2 rounded-xl bg-[#13382c] text-white hover:bg-[#1b4d3d] font-semibold transition disabled:opacity-50"
                >
                  {savingGoals ? "Saving..." : "Save Targets"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
