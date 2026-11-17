"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  X,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Layers,
  FileText,
  ShieldCheck,
  Send,
  Loader2,
  ExternalLink,
  Compass,
  CheckCircle2,
} from "lucide-react";
import BookPresentation3D from "./BookPresentation3D.jsx";
import { ShlokaDivider } from "./VedicOrnament.jsx";

export default function MinimalBookModal({ book, onClose }) {
  const modalRef = useRef(null);

  // View state: 'minimal' (book-first initial view) | 'expanded' (on-demand information)
  const [mode, setMode] = useState("minimal");
  const [activeTab, setActiveTab] = useState("about"); // 'about' | 'contents' | 'details' | 'learn'

  // Full book details (chapters, etc.) fetched on demand if not already present
  const [detailedBook, setDetailedBook] = useState(book);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // AI Interactive Learning State (Strictly on-demand)
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiError, setAiError] = useState(null);

  // Escape key listener to close modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Fetch full details (chapters, pages) on demand when user expands
  useEffect(() => {
    if (mode === "expanded" && (!detailedBook.chapters || detailedBook.chapters.length === 0)) {
      setLoadingDetails(true);
      fetch(`/api/books/${book.slug || book.id}`)
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Failed to load details"))))
        .then((data) => {
          if (data && !data.error) {
            setDetailedBook((prev) => ({
              ...prev,
              ...data,
              chapters: data.chapters || prev.chapters || [],
            }));
          }
        })
        .catch((err) => console.warn("Failed to fetch extended book details:", err))
        .finally(() => setLoadingDetails(false));
    }
  }, [mode, book.slug, book.id, detailedBook.chapters]);

  if (!book) return null;

  const router = useRouter();

  const chapters = detailedBook.chapters || book.chapters || [];
  const authorName = (book.author && book.author !== "Unknown" && book.author.trim().length > 0) ? book.author.trim() : null;
  const firstChapter = chapters[0];
  const targetChapterSlug = firstChapter?.slug;
  const readerUrl = `/library/${book.slug || book.id}/pdf`;
  const chapterReaderUrl = targetChapterSlug
    ? `/library/${book.slug || book.id}/${targetChapterSlug}`
    : `/library/${book.slug || book.id}/pdf`;
  const pdfUrl = `/library/${book.slug || book.id}/pdf`;
  const detailUrl = `/library/${book.slug || book.id}`;

  // Safe navigation handler that closes the modal and executes router navigation
  const handleOpenReader = (targetUrl) => {
    const destination = targetUrl || readerUrl;
    onClose?.();
    if (typeof window !== "undefined") {
      router.push(destination);
    }
  };

  // Interactive AI Inquiry Handler (Called ONLY when user clicks Ask)
  const handleAskSage = async (customQuestion = null) => {
    const questionToAsk = (customQuestion || aiQuery || "").trim();
    if (!questionToAsk) return;

    setAiLoading(true);
    setAiError(null);
    setAiResponse(null);

    try {
      const res = await fetch("/api/research/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: questionToAsk,
          bookIds: [book.id],
          language: "en",
        }),
      });

      if (!res.ok) {
        throw new Error("Unable to synthesize explanation at this time.");
      }

      const data = await res.json();
      setAiResponse(data);
    } catch (err) {
      setAiError(err.message || "Failed to generate classical explanation.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="minimal-book-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-950/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className={`bg-[#fdfbf7] text-stone-900 rounded-3xl border border-[#d4a359]/30 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          mode === "minimal"
            ? "max-w-md sm:max-w-lg w-full max-h-[90vh]"
            : "max-w-3xl w-full max-h-[88vh]"
        }`}
      >
        {/* =========================================================================
            STATE 1: MINIMAL INITIAL VIEW (Book-First, Zero Clutter)
           ========================================================================= */}
        {mode === "minimal" ? (
          <div className="relative p-6 sm:p-8 flex flex-col items-center justify-between overflow-y-auto">
            {/* Top Close Button */}
            <button
              onClick={onClose}
              aria-label="Close book view"
              className="absolute top-4 right-4 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 transition cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Visual Centerpiece: Large 3D Book Artwork (Clickable to Read) */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => handleOpenReader(readerUrl)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleOpenReader(readerUrl);
                }
              }}
              className="py-2 sm:py-4 flex justify-center transform hover:scale-[1.03] active:scale-[0.98] transition-transform duration-300 cursor-pointer group"
              title={`Click to open and read ${book.title}`}
              aria-label={`Click to open and read ${book.title}`}
            >
              <BookPresentation3D
                book={book}
                index={0}
                size="lg"
                showQuickAction={false}
              />
            </div>

            {/* Book Title & Author Only */}
            <div className="text-center mt-5 mb-6 space-y-1.5 max-w-sm">
              <h2
                id="minimal-book-title"
                className="font-serif font-bold text-xl sm:text-2xl text-stone-900 leading-snug drop-shadow-xs"
              >
                {book.title}
              </h2>
              {authorName && (
                <p className="text-sm font-serif italic text-[#8c622a]">
                  By {authorName}
                </p>
              )}
            </div>

            {/* Actions: Prominent Read Button & Subtle Learn More */}
            <div className="w-full space-y-3 flex flex-col items-center">
              <Link
                href={readerUrl}
                onClick={() => onClose?.()}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#13382c] hover:bg-[#1a4a3b] text-white font-serif font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#d4a359] group-hover:scale-110 transition-transform" />
                <span>Read Book</span>
              </Link>

              <button
                onClick={() => setMode("expanded")}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8c622a] hover:text-[#13382c] py-2 px-4 rounded-xl hover:bg-[#f5efe6] transition cursor-pointer"
              >
                <span>Explore Book & Knowledge</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* =========================================================================
             STATE 2: ON-DEMAND EXPANDED EXPLORATION VIEW
             ========================================================================= */
          <div className="flex flex-col h-full max-h-[88vh]">
            {/* Top Navigation & Mini Header */}
            <div className="bg-[#13382c] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#d4a359]/30 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setMode("minimal")}
                  className="inline-flex items-center gap-1 text-xs text-amber-200 hover:text-white transition font-medium cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Back to Book View</span>
                </button>

                <span className="text-white/30 text-xs hidden sm:inline">•</span>

                <div className="truncate min-w-0">
                  <h3 className="font-serif font-bold text-sm sm:text-base text-white truncate">
                    {book.title}
                  </h3>
                  {authorName && (
                    <p className="text-[11px] text-amber-200/80 font-serif italic truncate">
                      {authorName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={readerUrl}
                  onClick={() => onClose?.()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#d4a359] hover:bg-[#c49247] text-stone-950 font-serif font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Book</span>
                </Link>

                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Exploration Tabs Header */}
            <div className="bg-[#faf6ef] border-b border-[#ede5d6] px-4 sm:px-6 flex gap-2 sm:gap-6 overflow-x-auto shrink-0 py-2">
              <button
                onClick={() => setActiveTab("about")}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-serif font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "about"
                    ? "bg-[#13382c] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>About This Book</span>
              </button>

              <button
                onClick={() => setActiveTab("contents")}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-serif font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "contents"
                    ? "bg-[#13382c] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Contents ({chapters.length || book._count?.chapters || 1})</span>
              </button>

              <button
                onClick={() => setActiveTab("details")}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-serif font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "details"
                    ? "bg-[#13382c] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Book Information</span>
              </button>

              <button
                onClick={() => setActiveTab("learn")}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-serif font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "learn"
                    ? "bg-[#13382c] text-white shadow-xs"
                    : "text-[#8c622a] hover:text-[#13382c] hover:bg-[#ede0ce]"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Learn & AI Study</span>
              </button>
            </div>

            {/* Scrollable Tab Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
              {/* TAB 1: ABOUT THIS BOOK */}
              {activeTab === "about" && (
                <div className="space-y-5">
                  <div className="bg-white rounded-2xl border border-[#ede5d6] p-5 shadow-2xs space-y-3">
                    <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-stone-500">
                      Manuscript Overview & Scope
                    </h4>
                    <p className="text-sm text-stone-800 leading-relaxed">
                      {book.description ||
                        `${book.title} is a classical Vedic Shastra preserved with authentic Sanskrit verses, mathematical formulations, and traditional commentary.`}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#faf6ef] rounded-2xl border border-[#ede5d6] p-4 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-stone-500 font-mono block">
                        Tradition & Lineage
                      </span>
                      <strong className="text-sm font-serif text-stone-900">
                        {book.category || "Classical Vedic Shastra"}
                      </strong>
                      <p className="text-xs text-stone-600">
                        Preserved through authentic guru-shishya parampara.
                      </p>
                    </div>

                    <div className="bg-[#faf6ef] rounded-2xl border border-[#ede5d6] p-4 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-stone-500 font-mono block">
                        Attributed Author
                      </span>
                      <strong className="text-sm font-serif text-stone-900">
                        {authorName || "Ancient Vedic Sage"}
                      </strong>
                      <p className="text-xs text-stone-600">
                        Foundational rishi of the classical canon.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <Link
                      href={detailUrl}
                      onClick={() => onClose?.()}
                      className="inline-flex items-center gap-1 font-semibold text-[#8c622a] hover:text-[#13382c] underline cursor-pointer"
                    >
                      <span>Open Full Manuscript Dossier</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

              {/* TAB 2: CONTENTS & CHAPTERS */}
              {activeTab === "contents" && (
                <div className="space-y-4">
                  {loadingDetails ? (
                    <div className="py-8 flex flex-col items-center justify-center gap-2 text-stone-500">
                      <Loader2 className="w-5 h-5 animate-spin text-[#d4a359]" />
                      <span className="text-xs font-mono">Loading chapter hierarchy...</span>
                    </div>
                  ) : chapters.length > 0 ? (
                    <div className="divide-y divide-stone-100 rounded-2xl border border-[#ede5d6] bg-white overflow-hidden shadow-2xs">
                      {chapters.map((ch) => (
                        <div
                          key={ch.id}
                          className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-stone-50/80 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-7 h-7 rounded-lg bg-[#faf6ef] border border-[#ede5d6] text-[#8c622a] flex items-center justify-center text-xs font-mono font-bold shrink-0">
                              {ch.chapterNumber || ch.number || 1}
                            </span>
                            <div className="min-w-0">
                              <h5 className="text-xs sm:text-sm font-serif font-bold text-stone-900 truncate">
                                {ch.title}
                              </h5>
                              <div className="text-[11px] text-stone-500 font-mono flex items-center gap-2">
                                {ch._count?.passages > 0 && <span>{ch._count.passages} verses</span>}
                                {ch.startPage && <span>Pages {ch.startPage}–{ch.endPage || ch.startPage}</span>}
                              </div>
                            </div>
                          </div>

                          <Link
                            href={`/library/${book.slug || book.id}/${ch.slug}`}
                            onClick={() => onClose?.()}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#13382c] hover:bg-[#1a4a3b] text-white text-xs font-semibold shrink-0 shadow-2xs cursor-pointer"
                          >
                            <BookOpen className="w-3 h-3" />
                            <span>Read</span>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-[#ede5d6] p-6 text-center space-y-2">
                      <p className="text-xs text-stone-600">
                        This manuscript is arranged as a continuous classical treatise with synchronized facsimile page navigation.
                      </p>
                      <Link
                        href={readerUrl}
                        onClick={() => onClose?.()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#13382c] text-white text-xs font-semibold shadow-xs cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Open Reader</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: BOOK DETAILS & METADATA */}
              {activeTab === "details" && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-[#ede5d6] p-5 shadow-2xs">
                    <h4 className="text-xs uppercase font-mono tracking-wider font-bold text-stone-500 pb-2 border-b border-stone-100">
                      Archival & Technical Specifications
                    </h4>
                    <dl className="divide-y divide-stone-100 text-xs mt-1">
                      <div className="py-2.5 flex justify-between">
                        <dt className="text-stone-500 font-medium">Original Language</dt>
                        <dd className="font-semibold text-stone-900">{book.language || "Sanskrit"}</dd>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <dt className="text-stone-500 font-medium">Script</dt>
                        <dd className="font-semibold text-stone-900">{book.script || "Devanagari"}</dd>
                      </div>
                      {book.pageCount && (
                        <div className="py-2.5 flex justify-between">
                          <dt className="text-stone-500 font-medium">Page Count (Patras)</dt>
                          <dd className="font-mono font-bold text-stone-900">{book.pageCount} pages</dd>
                        </div>
                      )}
                      <div className="py-2.5 flex justify-between">
                        <dt className="text-stone-500 font-medium">Publisher / Collection</dt>
                        <dd className="font-semibold text-stone-900">{book.publisher || "Gurukul Press"}</dd>
                      </div>
                      <div className="py-2.5 flex justify-between">
                        <dt className="text-stone-500 font-medium">OCR Verification</dt>
                        <dd className="font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Scholarly Verified</span>
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}

              {/* TAB 4: LEARN THIS BOOK & AI STUDY (Interactive On-Demand Experience) */}
              {activeTab === "learn" && (
                <div className="space-y-5">
                  {/* Contextual Notice */}
                  <div className="bg-amber-50/70 border border-amber-200/60 rounded-2xl p-4 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 font-serif">
                      <Sparkles className="w-4 h-4 text-amber-700" />
                      <span>On-Demand Vedic Intelligence</span>
                    </div>
                    <p className="text-amber-800 leading-relaxed">
                      Synthesize classical interpretations grounded directly in the verified Sanskrit passages of <em>{book.title}</em>. No AI responses are generated automatically.
                    </p>
                  </div>

                  {/* Pre-set Scholarly Prompt Suggestions */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-stone-500 block">
                      Recommended Scholarly Inquiries:
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        `What are the core astrological and philosophical principles expounded in ${book.title}?`,
                        "Explain the primary planetary strengths and foundational shloka syntax.",
                        "What auspicious muhurta and spiritual remedies are highlighted in this text?",
                      ].map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setAiQuery(prompt);
                            handleAskSage(prompt);
                          }}
                          className="text-left p-3 rounded-xl bg-white hover:bg-[#faf6ef] border border-[#ede5d6] hover:border-[#d4a359] text-xs text-stone-800 font-medium transition cursor-pointer flex items-center justify-between group shadow-2xs"
                        >
                          <span className="line-clamp-1">{prompt}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#13382c] shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Question Input */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-stone-500 block">
                      Ask a Specific Question:
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !aiLoading) handleAskSage();
                        }}
                        placeholder={`Ask about verses, planetary principles, or concepts in ${book.title}...`}
                        className="flex-1 bg-white border border-[#ede5d6] rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-[#13382c]/20"
                      />
                      <button
                        onClick={() => handleAskSage()}
                        disabled={aiLoading || !aiQuery.trim()}
                        className="px-4 py-2.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-white text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs shrink-0"
                      >
                        {aiLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5 text-[#d4a359]" />
                        )}
                        <span>Ask Sage</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Response Display Area */}
                  {aiLoading && (
                    <div className="p-6 bg-white rounded-2xl border border-[#ede5d6] text-center space-y-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#d4a359] mx-auto" />
                      <p className="text-xs font-serif italic text-stone-600">
                        Consulting verified verses of {book.title}...
                      </p>
                    </div>
                  )}

                  {aiError && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                      {aiError}
                    </div>
                  )}

                  {aiResponse && (
                    <div className="bg-white rounded-2xl border border-[#d4a359]/40 p-5 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                        <span className="text-[10px] font-mono uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          AI Research Synthesis • Grounded in Shastra
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {new Date().toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="text-xs text-stone-800 leading-relaxed space-y-2 whitespace-pre-wrap font-serif">
                        {aiResponse.answerText || aiResponse.answer || aiResponse.response || JSON.stringify(aiResponse)}
                      </div>

                      {aiResponse.citations && aiResponse.citations.length > 0 && (
                        <div className="pt-2 border-t border-stone-100 space-y-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-stone-500 block">
                            Grounded Classical Citations ({aiResponse.citations.length}):
                          </span>
                          <div className="space-y-1">
                            {aiResponse.citations.map((c, i) => (
                              <div key={i} className="text-[11px] text-stone-600 flex items-center justify-between bg-stone-50 p-2 rounded-lg">
                                <span className="font-semibold text-stone-800">
                                  {c.bookTitle || book.title} {c.pageNumber ? `(Page ${c.pageNumber})` : ""}
                                </span>
                                {c.readerUrl && (
                                  <Link
                                    href={c.readerUrl}
                                    onClick={() => onClose?.()}
                                    className="text-[10px] text-amber-700 hover:text-amber-900 underline font-medium cursor-pointer"
                                  >
                                    View Source
                                  </Link>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-2 flex justify-between items-center text-xs">
                    <Link
                      href={`/research`}
                      onClick={onClose}
                      className="inline-flex items-center gap-1 font-semibold text-[#8c622a] hover:text-[#13382c] underline"
                    >
                      <span>Open Complete AI Research Studio</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
