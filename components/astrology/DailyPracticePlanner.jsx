"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Clock,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  Flower2,
  Compass,
  Play,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Calendar,
  X,
} from "lucide-react";

const CATEGORY_CONFIG = {
  ALL: { label: "All Practices", icon: Sparkles, color: "text-[#c4903c] bg-amber-50 border-amber-200" },
  MANTRA: { label: "Mantra Japa", icon: BookOpen, color: "text-amber-700 bg-amber-50 border-amber-200" },
  PRANAYAMA: { label: "Pranayama", icon: Compass, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  MEDITATION: { label: "Dhyana", icon: Flower2, color: "text-indigo-700 bg-indigo-50 border-indigo-200" },
  READING: { label: "Swadhyaya", icon: BookOpen, color: "text-rose-700 bg-rose-50 border-rose-200" },
  PUJA: { label: "Puja", icon: Flame, color: "text-orange-700 bg-orange-50 border-orange-200" },
};

export default function DailyPracticePlanner({
  selectedDate,
  language = "en",
  onOpenTimer = null,
  onXpEarned = null,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [togglingItemId, setTogglingItemId] = useState(null);

  // Form states for adding custom item
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("MANTRA");
  const [newDuration, setNewDuration] = useState(10);
  const [newDescription, setNewDescription] = useState("");
  const [newSanskrit, setNewSanskrit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isHi = language === "hi";

  // Fetch plan for selected date
  const fetchPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/astrology/daily-practice?date=${selectedDate}&language=${language}`);
      if (!res.ok) {
        throw new Error(`Failed to load daily practice plan (HTTP ${res.status})`);
      }
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Could not retrieve practice plan");
      }
      setData(json);
    } catch (err) {
      console.error("[DailyPracticePlanner] Fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, language]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  // Toggle practice item completion
  const handleToggleItem = async (item) => {
    if (togglingItemId) return;
    setTogglingItemId(item.id);

    const nextCompleted = !item.completed;

    // Optimistic UI update
    setData((prev) => {
      if (!prev?.plan?.items) return prev;
      const updatedItems = prev.plan.items.map((it) =>
        it.id === item.id ? { ...it, completed: nextCompleted } : it
      );
      const completedCount = updatedItems.filter((i) => i.completed).length;
      const completedMinutes = updatedItems
        .filter((i) => i.completed)
        .reduce((sum, i) => sum + (i.durationMinutes || 0), 0);
      const percentComplete = Math.min(
        100,
        Math.round((completedMinutes / Math.max(1, prev.plan.targetDuration || 30)) * 100)
      );

      return {
        ...prev,
        plan: {
          ...prev.plan,
          items: updatedItems,
        },
        metrics: {
          ...prev.metrics,
          completedCount,
          completedMinutes,
          percentComplete,
        },
      };
    });

    try {
      const res = await fetch("/api/astrology/daily-practice", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          completed: nextCompleted,
        }),
      });

      const json = await res.json();
      if (json.success && nextCompleted && json.xpAwarded) {
        if (onXpEarned) {
          onXpEarned(`+${json.xpAwarded} XP • ${item.title}`);
        }
      }
    } catch (e) {
      // Revert if API fails
      fetchPlan();
    } finally {
      setTogglingItemId(null);
    }
  };

  // Add custom practice item
  const handleAddCustomItem = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/astrology/daily-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planDate: selectedDate,
          category: newCategory,
          title: newTitle.trim(),
          description: newDescription.trim() || null,
          durationMinutes: parseInt(newDuration, 10) || 10,
          sanskritText: newSanskrit.trim() || null,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setShowAddModal(false);
        setNewTitle("");
        setNewDescription("");
        setNewSanskrit("");
        fetchPlan();
      }
    } catch (err) {
      console.error("[Add Custom Practice Error]:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete practice item
  const handleDeleteItem = async (itemId) => {
    try {
      const res = await fetch(`/api/astrology/daily-practice?itemId=${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchPlan();
      }
    } catch (e) {
      console.error("[Delete Practice Item Error]:", e);
    }
  };

  const plan = data?.plan || null;
  const metrics = data?.metrics || {
    completedCount: 0,
    totalCount: 0,
    completedMinutes: 0,
    targetDuration: 30,
    percentComplete: 0,
    currentStreak: 0,
  };
  const weeklyHistory = data?.weeklyHistory || [];

  const allItems = plan?.items || [];
  const filteredItems =
    selectedCategory === "ALL"
      ? allItems
      : allItems.filter((i) => i.category === selectedCategory);

  return (
    <section id="planner" className="space-y-5 scroll-mt-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#c4903c]" />
            <span>{isHi ? "दैनिक वैदिक साधना एवं अभ्यास योजनाकार" : "Daily Vedic Practice & Sadhana Planner"}</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {isHi
              ? "आज के नक्षत्र, वार एवं दशा के अनुकूल दैनिक मंत्र, प्राणायाम, ध्यान एवं शास्त्र स्वाध्याय का व्यक्तिगत लक्ष्य।"
              : "Structured spiritual practice schedule aligned with today's planetary energy, active Dasha, and Digital Library treatises."}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#13382c] hover:bg-[#194939] text-white text-xs font-semibold transition shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-300" />
          <span>{isHi ? "अभ्यास जोड़ें" : "Add Practice"}</span>
        </button>
      </div>

      {/* Progress & Metrics Dashboard Card */}
      <div className="bg-gradient-to-br from-white via-[#faf8f4] to-white rounded-3xl border border-[#ede5d6] p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Main Progress Bar & Minutes Counter */}
          <div className="md:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500">
                  {isHi ? "दैनिक साधना पूर्णता" : "Today's Sadhana Progress"}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  {metrics.percentComplete}%
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-stone-800">
                {metrics.completedMinutes} / {metrics.targetDuration} {isHi ? "मिनट" : "mins"}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-3 rounded-full bg-stone-100 overflow-hidden border border-stone-200/60 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#13382c] via-[#c4903c] to-emerald-600 transition-all duration-500 ease-out"
                style={{ width: `${metrics.percentComplete}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-500">
              <span>
                {metrics.completedCount} of {metrics.totalCount} {isHi ? "अभ्यास पूर्ण" : "practices completed"}
              </span>
              <span>
                {metrics.percentComplete >= 100
                  ? isHi
                    ? "✨ आज का साधना लक्ष्य पूर्ण!"
                    : "✨ Daily target achieved!"
                  : `${Math.max(0, metrics.targetDuration - metrics.completedMinutes)} ${isHi ? "मिनट शेष" : "mins remaining"}`}
              </span>
            </div>
          </div>

          {/* Consistency Streak & Quick Stats */}
          <div className="md:col-span-4 bg-[#fdfbf7] rounded-2xl border border-[#ede5d6] p-4 flex items-center justify-around">
            <div className="text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-amber-600">
                <Flame className="w-4 h-4 fill-amber-500" />
                <span className="text-xl font-bold font-mono">{metrics.currentStreak || 1}</span>
              </div>
              <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">
                {isHi ? "दिनों की निरंतरता" : "Day Streak"}
              </span>
            </div>

            <div className="h-8 w-px bg-stone-200" />

            <div className="text-center space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-emerald-700">
                <Award className="w-4 h-4" />
                <span className="text-xl font-bold font-mono">{metrics.completedCount * 15}</span>
              </div>
              <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-semibold">
                {isHi ? "अर्जित XP" : "XP Earned"}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly 7-Day Consistency Visualization */}
        {weeklyHistory.length > 0 && (
          <div className="pt-3 border-t border-[#ede5d6]/70 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-serif font-bold text-stone-700">
                {isHi ? "विगत 7 दिवस साधना इतिहास" : "Past 7 Days Consistency Bar"}
              </span>
              <span className="text-[11px] text-stone-400 font-mono">
                {weeklyHistory.filter((w) => w.completedItems > 0).length} / 7 days active
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {weeklyHistory.map((day, idx) => {
                const dayDate = new Date(day.date);
                const dayName = dayDate.toLocaleDateString("en-US", { weekday: "short" });
                const isCurrent = day.date === selectedDate;
                const isCompleted = day.completedItems > 0;

                return (
                  <div
                    key={day.date || idx}
                    className={`rounded-xl p-2 text-center transition border ${
                      isCurrent
                        ? "border-[#13382c] bg-amber-50/50 shadow-xs"
                        : "border-[#ede5d6] bg-white"
                    }`}
                  >
                    <span className="text-[10px] font-mono text-stone-500 block uppercase">
                      {dayName}
                    </span>
                    <span className="text-[11px] font-bold text-stone-800 block mt-0.5">
                      {dayDate.getDate()}
                    </span>

                    <div className="mt-1 flex justify-center">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-stone-100 text-stone-300 flex items-center justify-center text-[10px]">
                          •
                        </div>
                      )}
                    </div>

                    <span className="text-[9px] font-mono text-stone-400 block mt-0.5">
                      {day.completedMinutes > 0 ? `${day.completedMinutes}m` : "-"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {Object.entries(CATEGORY_CONFIG).map(([catKey, config]) => {
          const Icon = config.icon;
          const isSelected = selectedCategory === catKey;
          const count =
            catKey === "ALL"
              ? allItems.length
              : allItems.filter((i) => i.category === catKey).length;

          return (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shrink-0 ${
                isSelected
                  ? "bg-[#13382c] text-white shadow-xs"
                  : "bg-white text-stone-600 border border-[#ede5d6] hover:bg-stone-50"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-amber-300" : "text-stone-400"}`} />
              <span>{config.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected ? "bg-white/20 text-white" : "bg-stone-100 text-stone-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Practice Items List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#ede5d6] p-8 text-center text-xs text-stone-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-stone-300 mx-auto" />
            <p>No practices found in this category for today.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-[#13382c] font-semibold hover:underline"
            >
              Add a practice now
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isCompleted = Boolean(item.completed);
            const isExpanded = expandedItemId === item.id;
            const isToggling = togglingItemId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border transition p-4 sm:p-5 ${
                  isCompleted
                    ? "bg-[#f9fbf9] border-emerald-200/90 shadow-2xs"
                    : "bg-white border-[#ede5d6] hover:border-[#d4a359]/60 shadow-2xs"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleItem(item)}
                      disabled={isToggling}
                      className="mt-0.5 shrink-0 transition cursor-pointer text-stone-400 hover:text-emerald-600 disabled:opacity-50"
                      title={isCompleted ? "Mark incomplete" : "Mark completed"}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 hover:border-emerald-500" />
                      )}
                    </button>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border ${
                            CATEGORY_CONFIG[item.category]?.color || "text-stone-600 bg-stone-50 border-stone-200"
                          }`}
                        >
                          {item.category}
                        </span>

                        <span className="text-[11px] font-mono text-stone-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>{item.durationMinutes} mins</span>
                        </span>

                        {item.sourceReference && (
                          <span className="text-[10px] font-serif text-stone-400 italic truncate max-w-[200px]">
                            • {item.sourceReference}
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-sm sm:text-base font-bold font-serif ${
                          isCompleted ? "text-stone-500 line-through" : "text-stone-900"
                        }`}
                      >
                        {item.title}
                      </h4>

                      {item.description && (
                        <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* If reading with direct 3D Magazine Reader link */}
                    {item.readerUrl && (
                      <Link
                        href={item.readerUrl}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#13382c] hover:bg-[#194939] text-white text-xs font-serif font-bold transition shadow-2xs"
                        title="Open treatise in 3D Magazine Reader"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                        <span className="hidden sm:inline">3D Reader</span>
                      </Link>
                    )}

                    {/* If meditation/pranayama, launch guided timer */}
                    {(item.category === "PRANAYAMA" || item.category === "MEDITATION") && onOpenTimer && (
                      <button
                        onClick={() => onOpenTimer(item.durationMinutes)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition cursor-pointer"
                        title="Start timer for this practice"
                      >
                        <Play className="w-3.5 h-3.5 text-amber-700" />
                        <span className="hidden sm:inline">Timer</span>
                      </button>
                    )}

                    {/* Expand details toggle */}
                    {(item.sanskritText || item.meaningEn || item.meaningHi) && (
                      <button
                        onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                        title="Toggle Sanskrit verse & meaning"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    )}

                    {/* Delete for custom added items */}
                    {item.id && !item.id.startsWith("preview-") && (
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-lg text-stone-300 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details: Sanskrit & Meaning */}
                {isExpanded && (item.sanskritText || item.meaningEn || item.meaningHi) && (
                  <div className="mt-4 pt-3 border-t border-stone-200/60 space-y-2.5 animate-in fade-in duration-200 text-xs">
                    {item.sanskritText && (
                      <div className="p-3 rounded-xl bg-[#faf8f4] border border-[#ede5d6]">
                        <span className="text-[10px] font-mono text-stone-400 block mb-1">
                          मूल संस्कृत मंत्र / श्लोक:
                        </span>
                        <p className="font-serif text-sm font-semibold text-stone-900 leading-relaxed">
                          {item.sanskritText}
                        </p>
                        {item.transliteration && (
                          <p className="text-[11px] font-mono text-stone-500 italic mt-1">
                            {item.transliteration}
                          </p>
                        )}
                      </div>
                    )}

                    {(item.meaningEn || item.meaningHi) && (
                      <div className="text-stone-700 space-y-1">
                        {isHi && item.meaningHi ? (
                          <p>
                            <strong className="text-stone-900">हिंदी भावार्थ: </strong>
                            {item.meaningHi}
                          </p>
                        ) : (
                          <p>
                            <strong className="text-stone-900">Significance: </strong>
                            {item.meaningEn || item.meaningHi}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Practice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-[#ede5d6] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#c4903c]" />
                <span>{isHi ? "नया साधना अभ्यास जोड़ें" : "Add Custom Practice Item"}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  {isHi ? "अभ्यास शीर्षक" : "Practice Title"} *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gayatri Mantra 108 Japa or Gita Chapter 2"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#c4903c] outline-hidden text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#c4903c] outline-hidden text-xs bg-white"
                  >
                    <option value="MANTRA">Mantra Japa</option>
                    <option value="PRANAYAMA">Pranayama</option>
                    <option value="MEDITATION">Meditation (Dhyana)</option>
                    <option value="READING">Swadhyaya (Reading)</option>
                    <option value="PUJA">Puja & Upasana</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-semibold mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#c4903c] outline-hidden text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Optional Description / Focus
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Focus on breath rhythm at sunrise"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#c4903c] outline-hidden text-xs"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Optional Sanskrit Shloka / Mantra Text
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. ॐ भूर्भुवः स्वः..."
                  value={newSanskrit}
                  onChange={(e) => setNewSanskrit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#c4903c] outline-hidden text-xs font-serif"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim()}
                  className="px-4 py-2 rounded-xl bg-[#13382c] hover:bg-[#194939] text-white font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add to Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
