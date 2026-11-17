"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Layers,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Download,
  Share2,
  Bookmark,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Compass,
  FileText,
  Search,
  ChevronRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import BookPresentation3D from "./BookPresentation3D.jsx";
import { ShlokaDivider, SacredGeometryWatermark, OmSeal } from "./VedicOrnament.jsx";

export default function BookDetailClient({
  book,
  readingProgress = null,
  verificationStats = null,
  relatedBooks = [],
  generatedPdfUrl = null,
}) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "toc" | "provenance"
  const [tocSearch, setTocSearch] = useState("");
  const [expandedChapterId, setExpandedChapterId] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const chapters = book.chapters || [];
  const firstChapter = chapters[0] || null;
  const targetChapter = readingProgress?.chapter || firstChapter;
  const progressPct = Math.round(readingProgress?.progress || 0);

  // Filtered chapters for TOC search
  const filteredChapters = chapters.filter((ch) => {
    if (!tocSearch.trim()) return true;
    const q = tocSearch.toLowerCase().trim();
    return (
      (ch.title || "").toLowerCase().includes(q) ||
      String(ch.chapterNumber || ch.number || "").includes(q) ||
      (ch.subheading || "").toLowerCase().includes(q)
    );
  });

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf6ef] text-stone-900 pb-16">
      {/* Top Breadcrumbs & Quick Return Bar */}
      <div className="bg-[#f4ecd8] border-b border-[#e2d2ba] py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#13382c] transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Classical Library</span>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 transition cursor-pointer"
              title="Copy Manuscript URL"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? "Link Copied!" : "Share Shastra"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Manuscript Hero Showcase Header */}
      <div className="relative bg-gradient-to-br from-[#0c281e] via-[#13382c] to-[#071912] text-[#f7efe1] border-b border-[#d4a359]/30 py-8 sm:py-12 md:py-16 overflow-hidden">
        {/* Sacred Geometry Watermark in Background */}
        <div className="absolute -top-16 -right-16 pointer-events-none text-[#d4a359]/10">
          <SacredGeometryWatermark className="w-96 h-96 sm:w-140 sm:h-140" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left: 3D Book Cover Presentation */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center">
              <BookPresentation3D
                book={book}
                index={0}
                size="lg"
                showQuickAction={false}
              />

              {/* Physical Document Indicator */}
              <div className="mt-4 flex items-center gap-2 text-xs text-[#d4a359]/80 font-mono">
                <ShieldCheck className="w-4 h-4 text-[#d4a359]" />
                <span>Digitized Vedic Grantha • Pristine Edition</span>
              </div>
            </div>

            {/* Right: Rich Manuscript Dossier Info */}
            <div className="lg:col-span-8 space-y-4 sm:space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider bg-[#d4a359]/20 text-[#d4a359] border border-[#d4a359]/40">
                  {book.language || "Sanskrit"} • {book.script || "Devanagari"}
                </span>

                {book.pageCount && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/10 text-stone-200 border border-white/15">
                    {book.pageCount} Patras (Pages)
                  </span>
                )}

                <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/10 text-stone-200 border border-white/15">
                  {chapters.length} Chapters
                </span>

                {book._count?.passages > 0 && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    {book._count.passages} Digitized Passages
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold font-serif text-[#fdfaf5] leading-tight tracking-tight">
                  {book.title}
                </h1>
                <p className="text-base sm:text-lg font-serif italic text-[#d4a359]">
                  Attributed Author / Rishi: <strong className="font-semibold text-white">{book.author || "Ancient Vedic Tradition"}</strong>
                </p>
              </div>

              <p className="text-sm sm:text-base text-stone-200/90 leading-relaxed max-w-3xl">
                {book.description ||
                  "Classical authoritative treatise expounding fundamental principles, Sanskrit shlokas, and commentaries preserved in traditional manuscript form."}
              </p>

              {/* Reading Progress Indicator if user was already reading */}
              {readingProgress && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 max-w-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#d4a359] font-bold">Your Reading Progress</span>
                    <span className="text-white">{progressPct}% Complete</span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#d4a359] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, progressPct))}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-stone-300 font-serif italic">
                    {targetChapter
                      ? `Last active in Chapter ${targetChapter.chapterNumber || targetChapter.number || 1}: ${targetChapter.title}`
                      : "Pick up right where you left off"}
                  </p>
                </div>
              )}

              {/* Primary Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                {/* 1. Primary Reading Mode */}
                {targetChapter ? (
                  <Link
                    href={`/library/${book.slug || book.id}/${targetChapter.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#d4a359] hover:bg-[#c49247] text-stone-950 font-serif font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                  >
                    <BookOpen className="w-4 h-4 text-stone-950" />
                    <span>
                      {readingProgress ? `Resume Reading (Chapter ${targetChapter.chapterNumber || 1})` : "Start Scholarly Reading"}
                    </span>
                  </Link>
                ) : (
                  <Link
                    href={`/library/${book.slug || book.id}/pdf`}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#d4a359] hover:bg-[#c49247] text-stone-950 font-serif font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                  >
                    <BookOpen className="w-4 h-4 text-stone-950" />
                    <span>Read Digitized Manuscript</span>
                  </Link>
                )}

                {/* 2. Dual-Page PDF Manuscript Reader */}
                <Link
                  href={`/library/${book.slug || book.id}/pdf`}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm border border-white/20 transition shadow-sm"
                >
                  <FileText className="w-4 h-4 text-[#d4a359]" />
                  <span>Dual-Page Manuscript Reader</span>
                </Link>

                {/* 3. Download Digitized PDF */}
                {generatedPdfUrl && (
                  <a
                    href={generatedPdfUrl}
                    download={`${book.slug || book.id}-digitized-edition.pdf`}
                    className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-stone-300 hover:text-white font-medium text-xs border border-white/10 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-white border-b border-[#e2d5c1] sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex gap-2 sm:gap-6 overflow-x-auto py-3">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-serif font-bold transition whitespace-nowrap cursor-pointer ${
                activeTab === "overview"
                  ? "bg-[#13382c] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              Manuscript Overview
            </button>

            <button
              onClick={() => setActiveTab("toc")}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-serif font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === "toc"
                  ? "bg-[#13382c] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Table of Contents ({chapters.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("provenance")}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-serif font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === "provenance"
                  ? "bg-[#13382c] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Provenance & Scholarly Source</span>
            </button>
          </div>

          <Link
            href="/research"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#8c622a] hover:text-[#13382c]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Research Assistant</span>
          </Link>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* =========================================================================
            TAB 1: MANUSCRIPT OVERVIEW
           ========================================================================= */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 8 Cols: Editorial Sections */}
            <div className="lg:col-span-8 space-y-8">
              {/* About the Shastra */}
              <div className="bg-white rounded-3xl border border-[#e2d5c1] p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                  <BookOpen className="w-5 h-5 text-[#8c622a]" />
                  <h2 className="text-xl font-bold font-serif text-stone-900">
                    About this Classical Shastra
                  </h2>
                </div>

                <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                  {book.description ||
                    `${book.title} is a venerable classical work of ancient Indian learning, composed in ${book.language || "Sanskrit"} and transcribed in ${book.script || "Devanagari"} script. It expounds essential principles, shlokas, and commentaries foundational to Vedic astrology, spiritual metaphysics, and cosmological wisdom.`}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                  <div className="bg-[#faf6ef] rounded-2xl border border-[#e8dbc7] p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">
                      Scripture Lineage
                    </span>
                    <strong className="text-sm font-serif text-stone-900">
                      Vedic Jyotish Shastra Tradition
                    </strong>
                    <p className="text-xs text-stone-600">
                      Transmitted through authentic guru-shishya parampara.
                    </p>
                  </div>

                  <div className="bg-[#faf6ef] rounded-2xl border border-[#e8dbc7] p-4 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-500 block">
                      Textual Integrity
                    </span>
                    <strong className="text-sm font-serif text-stone-900">
                      Preserved Sanskrit OCR
                    </strong>
                    <p className="text-xs text-stone-600">
                      Scanned from historical physical manuscripts with high optical resolution.
                    </p>
                  </div>
                </div>
              </div>

              {/* Historical Background & Significance */}
              <div className="bg-white rounded-3xl border border-[#e2d5c1] p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                  <Compass className="w-5 h-5 text-[#13382c]" />
                  <h2 className="text-xl font-bold font-serif text-stone-900">
                    Historical Background & Significance
                  </h2>
                </div>

                <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                  Classical Vedic shastras were preserved as sacred granthas on palm leaves (Talapatra) and handmade birch bark (Bhojapatra). This digitized work presents the authentic verses, Dandās (।, ॥), and word-level syntax, enabling scholars, researchers, and students to read both original facsimile pages and searchable Sanskrit text.
                </p>

                <ShlokaDivider className="my-4" />

                <div className="space-y-2">
                  <h3 className="text-sm font-serif font-bold text-stone-900">
                    Key Study Areas Covered:
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#13382c]" />
                      <span>Planetary strengths (Shadbala) & aspects (Drishti)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#13382c]" />
                      <span>House significations (Bhava Viveka) & Dashas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#13382c]" />
                      <span>Auspicious timings (Muhurta) & Choghadiya cycles</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#13382c]" />
                      <span>Spiritual remedies, stotras, and gems</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Quick Bibliographic Dossier & Stats */}
            <div className="lg:col-span-4 space-y-6">
              {/* Bibliographic Card */}
              <div className="bg-white rounded-3xl border border-[#e2d5c1] p-6 shadow-xs space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-bold text-stone-500 pb-2 border-b border-stone-100">
                  Bibliographic Information
                </h3>

                <dl className="divide-y divide-stone-100 text-xs">
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-stone-500 font-medium">Attributed Sage</dt>
                    <dd className="font-semibold text-stone-900">{book.author || "Ancient Sage"}</dd>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-stone-500 font-medium">Original Language</dt>
                    <dd className="font-semibold text-[#8c622a]">{book.language || "Sanskrit"}</dd>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-stone-500 font-medium">Script</dt>
                    <dd className="font-semibold text-stone-900">{book.script || "Devanagari"}</dd>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-stone-500 font-medium">Physical Patras</dt>
                    <dd className="font-mono font-bold text-stone-900">{book.pageCount || "Continuous"}</dd>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-stone-500 font-medium">Publisher / Archive</dt>
                    <dd className="font-semibold text-stone-900">{book.publisher || "Gurukul Digital Archives"}</dd>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-stone-500 font-medium">Digitization Status</dt>
                    <dd className="font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Full OCR Verified</span>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Related Classical Shastras */}
              {relatedBooks.length > 0 && (
                <div className="bg-white rounded-3xl border border-[#e2d5c1] p-6 shadow-xs space-y-3">
                  <h3 className="text-xs uppercase tracking-wider font-bold text-stone-500 pb-2 border-b border-stone-100">
                    Related Classical Shastras
                  </h3>

                  <div className="space-y-3">
                    {relatedBooks.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/library/${rel.slug || rel.id}`}
                        className="group flex items-start gap-3 p-2 rounded-xl hover:bg-[#faf6ef] transition"
                      >
                        <div className="w-10 h-14 bg-stone-900 rounded-md shrink-0 overflow-hidden border border-[#d4a359]/30 flex items-center justify-center text-amber-200 font-serif text-xs">
                          {rel.title?.charAt(0) || "ग्र"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-serif font-bold text-stone-900 group-hover:text-[#13382c] line-clamp-1 transition-colors">
                            {rel.title}
                          </h4>
                          <p className="text-[11px] text-stone-500 truncate">
                            {rel.author || "Ancient Sage"}
                          </p>
                          <span className="text-[10px] text-[#8c622a] font-mono">
                            {rel.language || "Sanskrit"}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: INTERACTIVE TABLE OF CONTENTS
           ========================================================================= */}
        {activeTab === "toc" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#e2d5c1] shadow-2xs">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={tocSearch}
                  onChange={(e) => setTocSearch(e.target.value)}
                  placeholder="Search chapters by title or chapter number..."
                  className="w-full bg-[#faf6ef] text-stone-900 placeholder-stone-400 text-xs sm:text-sm pl-10 pr-4 py-2 rounded-xl border border-[#e2d5c1] focus:outline-hidden focus:ring-2 focus:ring-[#13382c]/30"
                />
              </div>

              <div className="text-xs text-stone-500 font-mono shrink-0">
                Showing {filteredChapters.length} of {chapters.length} chapters
              </div>
            </div>

            {filteredChapters.length > 0 ? (
              <div className="divide-y divide-stone-200 rounded-3xl border border-[#e2d5c1] bg-white overflow-hidden shadow-xs">
                {filteredChapters.map((chapter) => {
                  const isExpanded = expandedChapterId === chapter.id;
                  const chNumber = chapter.chapterNumber || chapter.number || 1;
                  const passagesCount = chapter._count?.passages ?? 0;

                  return (
                    <div key={chapter.id} className="transition-colors hover:bg-stone-50/70">
                      <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <span className="w-8 h-8 rounded-lg bg-[#faf6ef] border border-[#e2d5c1] text-[#8c622a] flex items-center justify-center text-xs font-bold shrink-0 font-mono">
                            {chNumber}
                          </span>

                          <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-serif font-bold text-stone-900 truncate">
                              {chapter.title}
                            </h3>
                            <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5 font-mono">
                              <span>{passagesCount} verses</span>
                              {chapter.startPage && (
                                <>
                                  <span>•</span>
                                  <span>Pages {chapter.startPage}–{chapter.endPage || chapter.startPage}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/library/${book.slug || book.id}/${chapter.slug}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#13382c] hover:bg-[#1a4a3b] text-white text-xs font-semibold shadow-xs transition"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Read</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-[#e2d5c1] p-12 text-center space-y-3">
                <FileText className="w-10 h-10 mx-auto text-stone-400" />
                <h3 className="text-base font-serif font-bold text-stone-800">
                  No chapters match your search
                </h3>
                <p className="text-xs text-stone-500">
                  Try clearing your search query to view the full Table of Contents.
                </p>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 3: PROVENANCE & SCHOLARLY SOURCE
           ========================================================================= */}
        {activeTab === "provenance" && (
          <div className="bg-white rounded-3xl border border-[#e2d5c1] p-6 sm:p-10 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-stone-100">
              <ShieldCheck className="w-6 h-6 text-[#13382c]" />
              <div>
                <h2 className="text-xl font-bold font-serif text-stone-900">
                  Scholarly Provenance & Content Lineage
                </h2>
                <p className="text-xs text-stone-500">
                  Full traceability to the physical scanned archive and verified OCR extraction layers.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#faf6ef] p-4 rounded-2xl border border-[#e8dbc7] space-y-1">
                <span className="text-[10px] font-mono text-stone-500 uppercase">Extraction Engine</span>
                <strong className="block text-sm font-semibold text-stone-900">Gurukul Multilingual OCR</strong>
                <p className="text-xs text-stone-600">Dual-pass OCR preserving Sanskrit Dandās & Matras.</p>
              </div>

              <div className="bg-[#faf6ef] p-4 rounded-2xl border border-[#e8dbc7] space-y-1">
                <span className="text-[10px] font-mono text-stone-500 uppercase">Human Verification</span>
                <strong className="block text-sm font-semibold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Scholarly Verified</span>
                </strong>
                <p className="text-xs text-stone-600">Audited against physical manuscript scans.</p>
              </div>

              <div className="bg-[#faf6ef] p-4 rounded-2xl border border-[#e8dbc7] space-y-1">
                <span className="text-[10px] font-mono text-stone-500 uppercase">Digital Preservation</span>
                <strong className="block text-sm font-semibold text-stone-900">Permanent Gurukul Archive</strong>
                <p className="text-xs text-stone-600">Immunity to textual degradation with digital backup.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <p className="text-xs text-stone-600 font-serif italic">
                Every verse and passage in this Shastra can be cross-referenced against the original facsimile page.
              </p>
              <Link
                href={`/library/${book.slug || book.id}/pdf`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-white text-xs font-semibold shadow-xs"
              >
                <span>Inspect Facsimile Pages</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
