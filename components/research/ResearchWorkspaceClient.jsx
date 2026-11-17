"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  Sparkles,
  GitCompare,
  Bookmark,
  FolderPlus,
  Trash2,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Filter,
  RefreshCw,
  FileText,
  Languages,
  Clock,
  Compass,
  ArrowRight,
  Download,
} from "lucide-react";
import VerificationBadge from "@/components/provenance/VerificationBadge.jsx";

export default function ResearchWorkspaceClient({
  publishedBooks = [],
  user = null,
}) {
  // Navigation Tabs: 'assistant' | 'comparison' | 'search' | 'workspace'
  const [activeTab, setActiveTab] = useState("assistant");

  // --- Tab 1: AI Research Assistant State ---
  const [researchQuery, setResearchQuery] = useState("");
  const [selectedBookIds, setSelectedBookIds] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [researchLanguage, setResearchLanguage] = useState("en");
  const [isSearchingAssistant, setIsSearchingAssistant] = useState(false);
  const [assistantResult, setAssistantResult] = useState(null);
  const [assistantError, setAssistantError] = useState(null);
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);

  // --- Tab 2: Book Comparison State ---
  const [compareBookIds, setCompareBookIds] = useState([]);
  const [compareTopic, setCompareTopic] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [compareResult, setCompareResult] = useState(null);
  const [compareError, setCompareError] = useState(null);
  const [isSavingComparison, setIsSavingComparison] = useState(false);

  // --- Tab 3: Intelligent Search State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState("hybrid"); // 'hybrid' | 'semantic' | 'lexical'
  const [searchLanguage, setSearchLanguage] = useState("all");
  const [searchSubject, setSearchSubject] = useState("ALL");
  const [isExecutingSearch, setIsExecutingSearch] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState(null);

  // --- Tab 4: Workspace Collections & Saved Items State ---
  const [collections, setCollections] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [activeItemFilter, setActiveItemFilter] = useState("ALL");
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [newCollectionTitle, setNewCollectionTitle] = useState("");
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  // Pre-select first 2 books for comparison if available
  useEffect(() => {
    if (publishedBooks.length >= 2 && compareBookIds.length === 0) {
      setCompareBookIds([publishedBooks[0].id, publishedBooks[1].id]);
    }
  }, [publishedBooks, compareBookIds.length]);

  // Load User Collections & Saved Items
  const loadWorkspaceData = useCallback(async () => {
    if (!user) return;
    setWorkspaceLoading(true);
    try {
      const [colRes, itemRes] = await Promise.all([
        fetch("/api/research/collections"),
        fetch("/api/research/items"),
      ]);

      if (colRes.ok) {
        const colData = await colRes.json();
        setCollections(colData.collections || []);
      }
      if (itemRes.ok) {
        const itemData = await itemRes.json();
        setSavedItems(itemData.items || []);
      }
    } catch (e) {
      console.error("Workspace load error:", e);
    } finally {
      setWorkspaceLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === "workspace") {
      loadWorkspaceData();
    }
  }, [user, activeTab, loadWorkspaceData]);

  // --- Execute AI Research Assistant ---
  async function handleAskAssistant(overrideQuery = null) {
    const q = overrideQuery || researchQuery;
    if (!q || !q.trim()) return;

    setIsSearchingAssistant(true);
    setAssistantError(null);
    setAssistantResult(null);

    try {
      const res = await fetch("/api/research/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: q.trim(),
          bookIds: selectedBookIds,
          subject: selectedSubject,
          language: researchLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to retrieve research answer.");
      }
      setAssistantResult(data);
    } catch (err) {
      setAssistantError(err.message);
    } finally {
      setIsSearchingAssistant(false);
    }
  }

  // --- Save Assistant Answer to Workspace ---
  async function handleSaveAssistantAnswer() {
    if (!user) {
      showToast("Please sign in to save research to your workspace.");
      return;
    }
    if (!assistantResult) return;

    setIsSavingAnswer(true);
    try {
      const res = await fetch("/api/research/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionId: activeCollectionId,
          itemType: "QUERY_ANSWER",
          title: `Research: ${assistantResult.query.slice(0, 70)}`,
          query: assistantResult.query,
          answer: assistantResult.answerText,
          notes: assistantResult.scholarlyContext,
          citations: assistantResult.citations,
        }),
      });

      if (res.ok) {
        showToast("Saved to your Personal Research Workspace!");
        loadWorkspaceData();
      } else {
        showToast("Failed to save research answer.");
      }
    } catch (e) {
      showToast("Error saving research answer.");
    } finally {
      setIsSavingAnswer(false);
    }
  }

  // --- Execute Source Comparison ---
  async function handleCompareSources(overrideTopic = null) {
    const top = overrideTopic || compareTopic;
    if (!top || !top.trim()) {
      setCompareError("Please enter a concept or topic to compare.");
      return;
    }
    if (compareBookIds.length < 2) {
      setCompareError("Please select at least two books for comparison.");
      return;
    }

    setIsComparing(true);
    setCompareError(null);
    setCompareResult(null);

    try {
      const res = await fetch("/api/research/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookIds: compareBookIds,
          topic: top.trim(),
          language: researchLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Comparison failed.");
      }
      setCompareResult(data);
    } catch (err) {
      setCompareError(err.message);
    } finally {
      setIsComparing(false);
    }
  }

  // --- Save Comparison to Workspace ---
  async function handleSaveComparison() {
    if (!user) {
      showToast("Please sign in to save research to your workspace.");
      return;
    }
    if (!compareResult) return;

    setIsSavingComparison(true);
    try {
      const res = await fetch("/api/research/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collectionId: activeCollectionId,
          itemType: "SOURCE_COMPARISON",
          title: `Comparison: ${compareResult.topic}`,
          query: compareResult.topic,
          answer: compareResult.comparisonText,
          comparisonData: {
            consensus: compareResult.consensus,
            nuances: compareResult.nuances,
            books: compareResult.booksWithEvidence,
          },
        }),
      });

      if (res.ok) {
        showToast("Source comparison saved to workspace!");
        loadWorkspaceData();
      } else {
        showToast("Failed to save comparison.");
      }
    } catch (e) {
      showToast("Error saving comparison.");
    } finally {
      setIsSavingComparison(false);
    }
  }

  // --- Execute Intelligent Library Search ---
  async function handleExecuteSearch(e) {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsExecutingSearch(true);
    setSearchError(null);
    setSearchResults(null);

    try {
      const params = new URLSearchParams({
        q: searchQuery.trim(),
        mode: searchMode,
        limit: "15",
      });
      if (searchLanguage && searchLanguage !== "all") params.set("language", searchLanguage);
      if (searchSubject && searchSubject !== "ALL") params.set("subject", searchSubject);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Search failed.");
      }
      setSearchResults(data);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setIsExecutingSearch(false);
    }
  }

  // --- Create Collection ---
  async function handleCreateCollection(e) {
    e.preventDefault();
    if (!newCollectionTitle.trim()) return;

    try {
      const res = await fetch("/api/research/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newCollectionTitle.trim() }),
      });

      if (res.ok) {
        setNewCollectionTitle("");
        setShowNewCollectionModal(false);
        showToast("Collection created successfully!");
        loadWorkspaceData();
      }
    } catch (e) {
      showToast("Failed to create collection.");
    }
  }

  // --- Delete Research Item ---
  async function handleDeleteItem(itemId) {
    try {
      const res = await fetch(`/api/research/items?id=${itemId}`, { method: "DELETE" });
      if (res.ok) {
        setSavedItems((prev) => prev.filter((i) => i.id !== itemId));
        showToast("Research item deleted.");
      }
    } catch (e) {
      showToast("Failed to delete item.");
    }
  }

  // Filtered items in Workspace
  const filteredWorkspaceItems = useMemo(() => {
    return savedItems.filter((item) => {
      if (activeCollectionId && item.collectionId !== activeCollectionId) return false;
      if (activeItemFilter !== "ALL" && item.itemType !== activeItemFilter) return false;
      return true;
    });
  }, [savedItems, activeCollectionId, activeItemFilter]);

  return (
    <div className="bg-[#fcfaf5] min-h-screen text-stone-900 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#13382c] text-amber-200 px-5 py-3 rounded-2xl shadow-2xl border border-amber-600/30 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <header className="bg-gradient-to-b from-[#13382c] to-[#1a4a3b] text-white pt-10 pb-12 px-4 sm:px-6 lg:px-8 border-b border-amber-900/30">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-500/20 text-amber-300 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </span>
                <span className="text-xs uppercase font-mono tracking-widest text-amber-300 font-bold">
                  Gurukul Digital Library
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight">
                AI Research Assistant & Comparative Study
              </h1>
              <p className="text-stone-300 text-xs sm:text-sm max-w-2xl font-serif">
                Conduct source-grounded academic inquiry, compare classical treatises side-by-side, understand archaic Sanskrit terminology, and preserve your findings.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/library"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-semibold border border-white/15 transition flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Browse All Books</span>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 border-t border-white/10 text-xs font-bold">
            {[
              { id: "assistant", label: "AI Research Assistant", icon: Sparkles },
              { id: "comparison", label: "Source Comparison", icon: GitCompare },
              { id: "search", label: "Intelligent Library Search", icon: Search },
              { id: "workspace", label: "Personal Workspace", icon: Bookmark },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition flex items-center gap-2 ${
                    isActive
                      ? "bg-amber-400 text-[#13382c] shadow-lg font-extrabold"
                      : "bg-white/5 text-stone-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* =================================================================== */}
        {/* TAB 1: AI RESEARCH ASSISTANT                                        */}
        {/* =================================================================== */}
        {activeTab === "assistant" && (
          <div className="space-y-6">
            {/* Research Input Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-serif font-bold text-stone-900">
                  Ask a Source-Grounded Question Across the Digital Library
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={researchQuery}
                    onChange={(e) => setResearchQuery(e.target.value)}
                    placeholder="e.g., What does the Shat-Chakra-Nirupana explain regarding the seven chakras? What are the classical definitions of planetary Drishti?"
                    className="w-full p-4 rounded-2xl border border-stone-300 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-700/30 text-stone-900"
                  />
                  <button
                    onClick={() => handleAskAssistant()}
                    disabled={isSearchingAssistant || !researchQuery.trim()}
                    className="absolute right-3 bottom-3 px-5 py-2.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-amber-300 text-xs font-bold transition flex items-center gap-2 disabled:opacity-50 shadow-sm"
                  >
                    {isSearchingAssistant ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Searching Shastras...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Conduct Research</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Filtering Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div>
                  <label className="block font-semibold text-stone-600 mb-1">Subject Focus</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-800"
                  >
                    <option value="ALL">All Subjects</option>
                    <option value="astrology">Vedic Astrology (Jyotisha)</option>
                    <option value="kundalini">Kundalini & Shat-Chakras</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-600 mb-1">Response Language</label>
                  <select
                    value={researchLanguage}
                    onChange={(e) => setResearchLanguage(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-800"
                  >
                    <option value="en">English (with Sanskrit terms)</option>
                    <option value="hi">हिंदी (शुद्ध शास्त्रीय भाषा)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-600 mb-1">Search Scope</label>
                  <select
                    value={selectedBookIds[0] || ""}
                    onChange={(e) => setSelectedBookIds(e.target.value ? [e.target.value] : [])}
                    className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-800"
                  >
                    <option value="">All Published Books ({publishedBooks.length})</option>
                    {publishedBooks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.author || "Classical"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Example Question Chips */}
              <div className="pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-2">
                  Sample Scholarly Inquiries:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "What does the Shat-Chakra-Nirupana explain about the seven chakras?",
                    "What are the different classical interpretations of planetary Drishti?",
                    "Explain the concept of Ida, Pingala, and Sushumna using classical references.",
                    "What are the classical indications of Gajakesari Yoga?",
                  ].map((sample, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setResearchQuery(sample);
                        handleAskAssistant(sample);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-xs font-serif italic transition border border-stone-200"
                    >
                      "{sample}"
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {assistantError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{assistantError}</span>
              </div>
            )}

            {/* Research Answer Display */}
            {assistantResult && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-6">
                {/* Result Header & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                      Scholarly Research Findings
                    </h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                      {assistantResult.citations?.length || 0} Sources Verified
                    </span>
                  </div>

                  <button
                    onClick={handleSaveAssistantAnswer}
                    disabled={isSavingAnswer}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{isSavingAnswer ? "Saving..." : "Save to Workspace"}</span>
                  </button>
                </div>

                {/* Synthesis Answer Text */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Source-Grounded Synthesis
                  </h3>
                  <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-stone-800 leading-relaxed font-sans text-sm whitespace-pre-wrap">
                    {assistantResult.answerText}
                  </div>
                </div>

                {/* Scholarly Context */}
                {assistantResult.scholarlyContext && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs space-y-1.5 text-stone-800">
                    <span className="font-bold uppercase tracking-wider text-amber-900 block text-[11px]">
                      Traditional Hermeneutic Context:
                    </span>
                    <p className="leading-relaxed">{assistantResult.scholarlyContext}</p>
                  </div>
                )}

                {/* Low Confidence Warnings if any */}
                {assistantResult.lowConfidenceWarnings?.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs space-y-1 text-amber-900">
                    <span className="font-bold flex items-center gap-1.5 text-amber-800">
                      <AlertTriangle className="w-4 h-4" />
                      Scholarly Verification Notice:
                    </span>
                    {assistantResult.lowConfidenceWarnings.map((w, idx) => (
                      <p key={idx}>{w}</p>
                    ))}
                  </div>
                )}

                {/* Direct Source Quotations & Citations */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Verified Classical Manuscript Citations ({assistantResult.citations?.length || 0})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(assistantResult.citations || []).map((cite, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-4 rounded-2xl bg-[#fcfaf5] border border-amber-900/15 flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-serif font-bold text-stone-900 text-sm">
                                {cite.bookTitle}
                              </h4>
                              <p className="text-[11px] text-stone-500 font-mono">
                                By {cite.author} • Ch. {cite.chapterTitle}
                                {cite.sourcePage ? ` • Page ${cite.sourcePage}` : ""}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                                cite.quality?.requiresVerification
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {cite.quality?.labelEn || "Verified"}
                            </span>
                          </div>

                          <p className="text-xs font-serif italic text-stone-700 leading-relaxed bg-white/70 p-3 rounded-xl border border-stone-200/60 line-clamp-4">
                            "{cite.snippet}"
                          </p>
                        </div>

                        <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-stone-400 font-mono">
                            Relevance: {Math.round((cite.relevance || 1) * 100)}%
                          </span>
                          <Link
                            href={cite.readerUrl}
                            className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
                          >
                            <span>Open in Reader</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <p className="text-[11px] text-stone-400 font-serif italic pt-3 border-t border-stone-100">
                  {assistantResult.disclaimer}
                </p>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: SOURCE COMPARISON WORKSPACE                                  */}
        {/* =================================================================== */}
        {activeTab === "comparison" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-5">
              <div>
                <h2 className="text-lg font-serif font-bold text-stone-900">
                  Side-by-Side Classical Treatises Comparison
                </h2>
                <p className="text-xs text-stone-500 font-serif">
                  Select two or more published books to compare their textual expositions of a specific astrological or spiritual concept.
                </p>
              </div>

              {/* Book Selection Grid */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-700 block">
                  Select Books for Comparison (Minimum 2):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1">
                  {publishedBooks.map((b) => {
                    const isSelected = compareBookIds.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          setCompareBookIds((prev) =>
                            isSelected ? prev.filter((id) => id !== b.id) : [...prev, b.id]
                          );
                        }}
                        className={`p-3 rounded-xl text-left border text-xs transition flex items-start gap-2.5 ${
                          isSelected
                            ? "bg-emerald-50/80 border-emerald-600 text-emerald-950 font-bold shadow-xs"
                            : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          className="rounded text-emerald-800 mt-0.5"
                        />
                        <div className="truncate">
                          <p className="truncate font-serif text-sm">{b.title}</p>
                          <p className="text-[10px] text-stone-500 font-mono truncate">
                            {b.author || "Classical Sage"} • {b.language}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Topic Input */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-stone-700">
                  Concept or Shastric Theme to Compare
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={compareTopic}
                    onChange={(e) => setCompareTopic(e.target.value)}
                    placeholder="e.g., Planetary Drishti, Muladhara Chakra, Lagna and Karma, Gajakesari Yoga"
                    className="flex-1 p-3 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700/30 text-stone-900"
                  />
                  <button
                    onClick={() => handleCompareSources()}
                    disabled={isComparing || compareBookIds.length < 2 || !compareTopic.trim()}
                    className="px-6 py-3 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-amber-300 text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isComparing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Comparing...</span>
                      </>
                    ) : (
                      <>
                        <GitCompare className="w-4 h-4" />
                        <span>Compare Texts</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Topic Chips */}
              <div className="flex flex-wrap gap-2 text-xs pt-1">
                {["Planetary Drishti", "Lagna & Ascendant", "Muladhara Chakra", "Surya Graha", "Gajakesari Yoga"].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setCompareTopic(t);
                      handleCompareSources(t);
                    }}
                    className="px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Compare Error */}
            {compareError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{compareError}</span>
              </div>
            )}

            {/* Comparison Results */}
            {compareResult && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                      Comparison Matrix: "{compareResult.topic}"
                    </h3>
                    <p className="text-xs text-stone-500 font-mono">
                      Comparing {compareResult.sourceGroups?.length || 0} classical treatises
                    </p>
                  </div>
                  <button
                    onClick={handleSaveComparison}
                    disabled={isSavingComparison}
                    className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{isSavingComparison ? "Saving..." : "Save Comparison"}</span>
                  </button>
                </div>

                {/* Synthesis Summary */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {compareResult.comparisonText}
                </div>

                {/* Consensus and Nuance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      Points of Consensus
                    </span>
                    <ul className="text-xs space-y-1 text-stone-800 list-disc list-inside">
                      {(compareResult.consensus || []).map((pt, idx) => (
                        <li key={idx}>{pt}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-700" />
                      Distinctive Traditional Nuances
                    </span>
                    <ul className="text-xs space-y-1 text-stone-800 list-disc list-inside">
                      {(compareResult.nuances || []).map((nu, idx) => (
                        <li key={idx}>{nu}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Side-by-side Source Excerpts */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Source Excerpts by Treatise
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(compareResult.sourceGroups || []).map((group, gIdx) => (
                      <div
                        key={gIdx}
                        className="p-4 rounded-2xl bg-[#fcfaf5] border border-stone-200 space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="font-serif font-bold text-stone-900 text-sm">
                              {group.bookTitle}
                            </h5>
                            <span className="text-[10px] text-stone-500 font-mono">
                              By {group.author}
                            </span>
                          </div>

                          {group.passages?.length > 0 ? (
                            <p className="text-xs font-serif italic text-stone-700 bg-white p-3 rounded-xl border border-stone-200/60 line-clamp-4">
                              "{group.passages[0].snippet}"
                            </p>
                          ) : (
                            <p className="text-xs text-stone-400 italic p-3">
                              No direct indexed passage for this specific topic.
                            </p>
                          )}
                        </div>

                        {group.passages?.[0] && (
                          <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                            <span className="text-[10px] text-stone-500 font-mono">
                              Page {group.passages[0].sourcePage || "Manuscript"}
                            </span>
                            <Link
                              href={group.passages[0].readerUrl}
                              className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:underline"
                            >
                              <span>Open in Reader</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: INTELLIGENT LIBRARY SEARCH                                   */}
        {/* =================================================================== */}
        {activeTab === "search" && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-stone-900">
                  Multilingual & Semantic Library Search
                </h2>
                <p className="text-xs text-stone-500 font-serif">
                  Search across book titles, authors, chapter headings, Sanskrit/Hindi verses, and English terminology with hybrid semantic matching.
                </p>
              </div>

              <form onSubmit={handleExecuteSearch} className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search Sanskrit shlokas, Hindi concepts, English terms (e.g., सूर्य, Brihat Jataka, Drishti)..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700/30 text-stone-900"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isExecutingSearch || !searchQuery.trim()}
                    className="px-6 py-3 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-amber-300 text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isExecutingSearch ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Search</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Search Engine Mode</label>
                    <select
                      value={searchMode}
                      onChange={(e) => setSearchMode(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-800"
                    >
                      <option value="hybrid">Hybrid (Lexical + Semantic)</option>
                      <option value="semantic">Semantic Vector Only</option>
                      <option value="lexical">Exact Lexical Full-Text</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Language</label>
                    <select
                      value={searchLanguage}
                      onChange={(e) => setSearchLanguage(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-800"
                    >
                      <option value="all">All Languages</option>
                      <option value="Sanskrit">Sanskrit (संस्कृत)</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                      <option value="English">English</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-600 mb-1">Subject</label>
                    <select
                      value={searchSubject}
                      onChange={(e) => setSearchSubject(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-800"
                    >
                      <option value="ALL">All Subjects</option>
                      <option value="astrology">Vedic Astrology</option>
                      <option value="kundalini">Kundalini & Spirituality</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            {/* Search Results Display */}
            {searchResults && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/80 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100 text-xs">
                  <span className="font-bold text-stone-800">
                    Found {searchResults.total || 0} matching passages in {searchResults.timingMs || 0}ms
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono uppercase bg-stone-100 px-2.5 py-1 rounded-md">
                    Method: {searchResults.searchMethod}
                  </span>
                </div>

                <div className="space-y-3">
                  {(searchResults.results || []).map((res, rIdx) => (
                    <div
                      key={rIdx}
                      className="p-4 rounded-2xl bg-[#fcfaf5] border border-amber-900/10 space-y-2 hover:border-amber-900/30 transition"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-stone-900 text-sm">
                            {res.bookTitle}
                          </span>
                          <span className="text-stone-400">•</span>
                          <span className="text-xs text-stone-600 font-mono">
                            Ch. {res.chapterTitle}
                            {res.sourcePage ? ` (Page ${res.sourcePage})` : ""}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            res.quality?.requiresVerification
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {res.quality?.labelEn || "Verified"}
                        </span>
                      </div>

                      <p className="text-xs font-serif italic text-stone-700 leading-relaxed bg-white p-3 rounded-xl border border-stone-200/60 line-clamp-3">
                        "{res.snippet}"
                      </p>

                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-[10px] text-stone-400 font-mono">
                          Relevance: {Math.round((res.relevanceScore || 1) * 100)}%
                        </span>
                        <Link
                          href={res.readerUrl}
                          className="inline-flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
                        >
                          <span>Open in Reader</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 4: PERSONAL RESEARCH WORKSPACE                                  */}
        {/* =================================================================== */}
        {activeTab === "workspace" && (
          <div className="space-y-6">
            {!user ? (
              <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-stone-200 space-y-4">
                <Bookmark className="w-12 h-12 text-stone-300 mx-auto" />
                <h3 className="text-lg font-serif font-bold text-stone-900">
                  Personal Research Workspace
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto font-serif">
                  Sign in to save research inquiries, store AI syntheses with verifiable citations, organize findings into collections, and reopen past study sessions.
                </p>
                <Link
                  href="/admin/login"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#13382c] text-amber-300 text-xs font-bold transition shadow-sm"
                >
                  <span>Sign In to Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Workspace Header & Collection Creator */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-serif font-bold text-stone-900">
                      Your Research Collections & Sessions
                    </h2>
                    <p className="text-xs text-stone-500 font-mono">
                      {savedItems.length} Saved Findings across {collections.length} Collections
                    </p>
                  </div>

                  <button
                    onClick={() => setShowNewCollectionModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>New Collection</span>
                  </button>
                </div>

                {/* Collections Selector Bar */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <button
                    onClick={() => setActiveCollectionId(null)}
                    className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-bold transition ${
                      activeCollectionId === null
                        ? "bg-emerald-800 text-white shadow-xs"
                        : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                    }`}
                  >
                    All Collections ({savedItems.length})
                  </button>
                  {collections.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => setActiveCollectionId(col.id)}
                      className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-bold transition ${
                        activeCollectionId === col.id
                          ? "bg-emerald-800 text-white shadow-xs"
                          : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-200"
                      }`}
                    >
                      {col.title} ({col.itemCount || 0})
                    </button>
                  ))}
                </div>

                {/* Collection Export Actions */}
                {activeCollectionId && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-stone-100/80 rounded-2xl border border-stone-200/60 text-xs">
                    <span className="text-stone-500 font-medium text-[11px]">Export Collection:</span>
                    <a
                      href={`/api/research/collections/${activeCollectionId}/export?format=markdown`}
                      download
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-200 text-stone-700 font-semibold text-[11px] border border-stone-200 shadow-xs transition"
                    >
                      <Download className="w-3 h-3 text-emerald-700" />
                      <span>Markdown</span>
                    </a>
                    <a
                      href={`/api/research/collections/${activeCollectionId}/export?format=bibtex`}
                      download
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-200 text-stone-700 font-semibold text-[11px] border border-stone-200 shadow-xs transition"
                    >
                      <Download className="w-3 h-3 text-emerald-700" />
                      <span>BibTeX</span>
                    </a>
                    <a
                      href={`/api/research/collections/${activeCollectionId}/export?format=json`}
                      download
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-stone-200 text-stone-700 font-semibold text-[11px] border border-stone-200 shadow-xs transition"
                    >
                      <Download className="w-3 h-3 text-emerald-700" />
                      <span>JSON</span>
                    </a>
                  </div>
                )}

                {/* Filter by Item Type */}
                <div className="flex items-center gap-2 text-xs font-semibold">
                  {["ALL", "QUERY_ANSWER", "SAVED_PASSAGE", "SOURCE_COMPARISON"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveItemFilter(t)}
                      className={`px-3 py-1 rounded-lg transition ${
                        activeItemFilter === t
                          ? "bg-amber-100 text-amber-900 border border-amber-300 font-bold"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      {t === "ALL"
                        ? "All Items"
                        : t === "QUERY_ANSWER"
                        ? "Q&A Syntheses"
                        : t === "SAVED_PASSAGE"
                        ? "Saved Passages"
                        : "Source Comparisons"}
                    </button>
                  ))}
                </div>

                {/* Saved Items List */}
                <div className="space-y-4">
                  {filteredWorkspaceItems.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 space-y-2">
                      <Bookmark className="w-8 h-8 text-stone-300 mx-auto" />
                      <p className="text-xs text-stone-500 font-serif">
                        No saved research items in this collection yet. Use the AI Assistant or Reader to save passages and citations.
                      </p>
                    </div>
                  ) : (
                    filteredWorkspaceItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200/80 space-y-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                              {item.itemType}
                            </span>
                            <h3 className="font-serif font-bold text-stone-900 text-base">
                              {item.title}
                            </h3>
                            <p className="text-[11px] text-stone-400 font-mono">
                              Saved on {new Date(item.createdAt).toLocaleDateString()}
                              {item.collectionTitle ? ` in "${item.collectionTitle}"` : ""}
                            </p>
                          </div>

                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-stone-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-stone-50 transition"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {item.query && (
                          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
                            <span className="font-bold text-stone-700 block mb-0.5">Inquiry:</span>
                            <p className="text-stone-800">{item.query}</p>
                          </div>
                        )}

                        {item.answer && (
                          <div className="text-xs sm:text-sm text-stone-800 leading-relaxed font-sans whitespace-pre-wrap bg-white p-3 rounded-xl border border-stone-100">
                            {item.answer}
                          </div>
                        )}

                        {item.notes && (
                          <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/70 text-xs">
                            <span className="font-bold text-amber-900 block mb-0.5">Personal Research Note:</span>
                            <p className="text-stone-800 italic">{item.notes}</p>
                          </div>
                        )}

                        {/* Citations Preview */}
                        {item.citations?.length > 0 && (
                          <div className="pt-2 border-t border-stone-100 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                              Associated Manuscript Citations:
                            </span>
                            <div className="flex flex-wrap gap-2 text-xs">
                              {item.citations.map((c, cIdx) => (
                                <div key={cIdx} className="flex items-center gap-1.5 flex-wrap">
                                  <Link
                                    href={c.readerUrl || `/library`}
                                    className="px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-mono text-[11px] flex items-center gap-1.5"
                                  >
                                    <span>{c.bookTitle} (Pg {c.sourcePage || "N/A"})</span>
                                    <ExternalLink className="w-3 h-3 text-emerald-700" />
                                  </Link>
                                  {c.quality && (
                                    <VerificationBadge
                                      status={c.verificationStatus || (c.quality?.isProofread ? "VERIFIED" : "UNREVIEWED")}
                                      ocrConfidence={c.quality?.ocrConfidence}
                                      size="xs"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Create Collection Modal */}
            {showNewCollectionModal && (
              <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
                <form
                  onSubmit={handleCreateCollection}
                  className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4"
                >
                  <h3 className="font-serif font-bold text-stone-900 text-lg">
                    Create New Research Collection
                  </h3>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Collection Title
                    </label>
                    <input
                      type="text"
                      value={newCollectionTitle}
                      onChange={(e) => setNewCollectionTitle(e.target.value)}
                      placeholder="e.g., Kundalini Shat-Chakra Comparative Study"
                      className="w-full p-3 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700/30 text-stone-900"
                      autoFocus
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewCollectionModal(false)}
                      className="px-4 py-2 rounded-xl text-stone-600 text-xs font-semibold hover:bg-stone-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newCollectionTitle.trim()}
                      className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition disabled:opacity-50"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
