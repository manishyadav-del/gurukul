"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sparkles,
  Layers,
  Bookmark,
  BookOpen,
  FileText,
  RotateCcw,
  Palette,
  Sun,
  Moon,
  Scroll,
} from "lucide-react";

/**
 * Compact Floating Glassmorphic Reader Toolbar.
 * Provides intuitive, responsive controls for navigation, zoom,
 * view modes, reading themes, and on-demand AI explanations.
 */
export default function MagazineToolbar({
  currentPage,
  numPages,
  onPrevPage,
  onNextPage,
  onPageSelect,
  scale = 1.0,
  onZoomIn,
  onZoomOut,
  onZoomFit,
  viewMode = "MAGAZINE", // "MAGAZINE" | "SINGLE" | "PDF_SCROLL"
  onChangeViewMode,
  theme = "classic", // "classic" | "modern" | "night"
  onChangeTheme,
  isFullscreen = false,
  onToggleFullscreen,
  onToggleChapters,
  onToggleExplain,
  isExplainOpen = false,
  isBookmarked = false,
  onToggleBookmark,
}) {
  const [editingPage, setEditingPage] = useState(false);
  const [pageInputVal, setPageInputVal] = useState(String(currentPage));
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const handlePageSubmit = (e) => {
    e.preventDefault();
    const p = parseInt(pageInputVal, 10);
    if (!isNaN(p) && p >= 1 && p <= numPages) {
      onPageSelect(p);
    } else {
      setPageInputVal(String(currentPage));
    }
    setEditingPage(false);
  };

  return (
    <nav
      aria-label="Reader Navigation & Controls"
      className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[98vw] sm:max-w-2xl bg-[#0d2119]/95 backdrop-blur-md text-[#fdfaf5] border border-[#d4a359]/40 shadow-2xl rounded-2xl px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-3.5 transition-all duration-300"
    >
      {/* 1. Page Turn Navigation */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onPrevPage}
          disabled={currentPage <= 1}
          aria-label="Previous Page"
          className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#d4a359]"
          title="Previous Page (← or Swipe Right)"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        {/* Page Counter & Direct Jump */}
        {editingPage ? (
          <form onSubmit={handlePageSubmit} className="flex items-center">
            <label htmlFor="pageJumpInput" className="sr-only">Jump to page number</label>
            <input
              id="pageJumpInput"
              type="number"
              min="1"
              max={numPages}
              value={pageInputVal}
              onChange={(e) => setPageInputVal(e.target.value)}
              onBlur={handlePageSubmit}
              autoFocus
              className="w-14 text-center bg-black/60 text-white font-mono text-xs sm:text-sm rounded-lg py-1.5 px-1 border border-[#d4a359] focus:outline-hidden"
            />
          </form>
        ) : (
          <button
            onClick={() => {
              setPageInputVal(String(currentPage));
              setEditingPage(true);
            }}
            className="min-h-[40px] sm:min-h-[44px] px-2.5 py-1 rounded-xl hover:bg-white/10 text-xs sm:text-sm font-mono font-medium text-stone-200 transition cursor-pointer flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#d4a359]"
            title="Click to jump to page"
            aria-label={`Current page ${currentPage} of ${numPages}. Click to enter page number.`}
          >
            <span className="text-white font-bold">{currentPage}</span>
            <span className="text-white/50">/</span>
            <span className="text-stone-300 font-medium">{numPages}</span>
          </button>
        )}

        <button
          onClick={onNextPage}
          disabled={currentPage >= numPages}
          aria-label="Next Page"
          className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#d4a359]"
          title="Next Page (→ or Swipe Left)"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="h-5 w-px bg-white/20 hidden sm:block shrink-0" />

      {/* 2. Zoom & Fit Controls */}
      <div className="hidden md:flex items-center gap-1 shrink-0">
        <button
          onClick={onZoomOut}
          aria-label="Zoom Out"
          className="min-w-[36px] min-h-[36px] rounded-lg hover:bg-white/10 text-stone-200 hover:text-white transition cursor-pointer flex items-center justify-center"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={onZoomFit}
          className="px-2 py-1 text-xs font-mono text-amber-200 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer font-bold"
          title="Fit to Screen"
          aria-label={`Zoom level ${Math.round(scale * 100)} percent. Click to reset zoom.`}
        >
          {Math.round(scale * 100)}%
        </button>

        <button
          onClick={onZoomIn}
          aria-label="Zoom In"
          className="min-w-[36px] min-h-[36px] rounded-lg hover:bg-white/10 text-stone-200 hover:text-white transition cursor-pointer flex items-center justify-center"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      <div className="h-5 w-px bg-white/20 shrink-0 hidden sm:block" />

      {/* 3. Display Mode Selector (Magazine / Single) */}
      <div className="hidden sm:flex items-center gap-1 bg-black/40 p-0.5 rounded-xl border border-white/15 text-xs">
        <button
          onClick={() => onChangeViewMode("MAGAZINE")}
          className={`px-3 py-1.5 rounded-lg text-xs font-serif transition cursor-pointer flex items-center gap-1.5 ${
            viewMode === "MAGAZINE"
              ? "bg-[#d4a359] text-stone-950 font-bold shadow-xs"
              : "text-stone-300 hover:text-white"
          }`}
          title="3D Two-Page Magazine Flipbook"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Magazine</span>
        </button>

        <button
          onClick={() => onChangeViewMode("SINGLE")}
          className={`px-3 py-1.5 rounded-lg text-xs font-serif transition cursor-pointer flex items-center gap-1.5 ${
            viewMode === "SINGLE"
              ? "bg-[#d4a359] text-stone-950 font-bold shadow-xs"
              : "text-stone-300 hover:text-white"
          }`}
          title="Single Page View"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Single</span>
        </button>
      </div>

      {/* 4. Reading Theme Selector */}
      {onChangeTheme && (
        <div className="relative hidden lg:block shrink-0">
          <button
            onClick={() => setShowThemeMenu((v) => !v)}
            aria-label="Change reading theme"
            className="min-w-[40px] min-h-[40px] rounded-xl hover:bg-white/10 text-stone-200 hover:text-white transition cursor-pointer flex items-center justify-center gap-1"
            title="Reading Theme (Classic / Modern / Night)"
          >
            {theme === "night" ? (
              <Moon className="w-4 h-4 text-blue-300" />
            ) : theme === "modern" ? (
              <Sun className="w-4 h-4 text-amber-200" />
            ) : (
              <Palette className="w-4 h-4 text-[#d4a359]" />
            )}
          </button>

          {showThemeMenu && (
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#0c241b] border border-[#d4a359]/40 rounded-xl p-1.5 shadow-xl flex flex-col gap-1 min-w-[130px] z-50">
              <button
                onClick={() => {
                  onChangeTheme("classic");
                  setShowThemeMenu(false);
                }}
                className={`px-3 py-2 text-left text-xs rounded-lg flex items-center gap-2 cursor-pointer transition ${
                  theme === "classic"
                    ? "bg-[#d4a359] text-stone-950 font-bold"
                    : "text-stone-200 hover:bg-white/10"
                }`}
              >
                <span>📜</span>
                <span>Classic</span>
              </button>
              <button
                onClick={() => {
                  onChangeTheme("modern");
                  setShowThemeMenu(false);
                }}
                className={`px-3 py-2 text-left text-xs rounded-lg flex items-center gap-2 cursor-pointer transition ${
                  theme === "modern"
                    ? "bg-[#d4a359] text-stone-950 font-bold"
                    : "text-stone-200 hover:bg-white/10"
                }`}
              >
                <span>📄</span>
                <span>Modern</span>
              </button>
              <button
                onClick={() => {
                  onChangeTheme("night");
                  setShowThemeMenu(false);
                }}
                className={`px-3 py-2 text-left text-xs rounded-lg flex items-center gap-2 cursor-pointer transition ${
                  theme === "night"
                    ? "bg-[#d4a359] text-stone-950 font-bold"
                    : "text-stone-200 hover:bg-white/10"
                }`}
              >
                <span>🌙</span>
                <span>Night</span>
              </button>
            </div>
          )}
        </div>
      )}

      <div className="h-5 w-px bg-white/20 hidden sm:block shrink-0" />

      {/* 5. Table of Contents & Bookmark Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {onToggleChapters && (
          <button
            onClick={onToggleChapters}
            aria-label="Table of Contents"
            className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-xl hover:bg-white/10 text-stone-200 hover:text-white transition cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#d4a359]"
            title="Table of Contents (Chapters)"
          >
            <Layers className="w-4 h-4" />
          </button>
        )}

        {onToggleBookmark && (
          <button
            onClick={onToggleBookmark}
            aria-label={isBookmarked ? "Remove Bookmark" : "Bookmark this Page"}
            className={`min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-xl hover:bg-white/10 transition cursor-pointer flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#d4a359] ${
              isBookmarked ? "text-[#d4a359]" : "text-stone-200 hover:text-white"
            }`}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark this Page"}
          >
            <Bookmark
              className="w-4 h-4"
              fill={isBookmarked ? "currentColor" : "none"}
            />
          </button>
        )}

        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            className="min-w-[40px] min-h-[40px] sm:min-w-[44px] sm:min-h-[44px] rounded-xl hover:bg-white/10 text-stone-200 hover:text-white transition cursor-pointer hidden sm:flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#d4a359]"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Reading"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      <div className="h-5 w-px bg-white/20 shrink-0" />

      {/* 6. PRIMARY CTA: On-Demand Explain Button */}
      <button
        onClick={onToggleExplain}
        aria-label="Explain current page"
        className={`min-h-[40px] sm:min-h-[44px] px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl font-serif font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-all duration-200 cursor-pointer shrink-0 border focus-visible:ring-2 focus-visible:ring-white ${
          isExplainOpen
            ? "bg-white text-[#13382c] border-white"
            : "bg-[#d4a359] hover:bg-[#c49247] text-stone-950 border-[#f2cf8d]/60 hover:scale-[1.02]"
        }`}
        title="Open Contextual AI Explanation for this Page"
      >
        <Sparkles className="w-4 h-4 text-stone-950" />
        <span>Explain</span>
      </button>
    </nav>
  );
}
