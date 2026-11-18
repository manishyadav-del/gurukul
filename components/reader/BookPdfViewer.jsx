"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  FileText,
  Layers,
  Sparkles,
  Bookmark,
  X,
  RotateCcw,
  AlertCircle,
  Loader2,
  Check,
  CheckCircle2,
  LayoutGrid,
  Columns,
  Scroll,
  PenLine,
  Copy,
  ArrowRight,
} from "lucide-react";

import { getPageOcrState } from "@/lib/reader/ocrState";
import Magazine3DFlipbook from "./Magazine3DFlipbook.jsx";
import MagazineToolbar from "./MagazineToolbar.jsx";
import MagazineExplainPanel from "./MagazineExplainPanel.jsx";

export { getPageOcrState };

/**
 * Premium 3D Magazine & Multi-Mode Manuscript Reader Component.
 * Supports:
 * 1. Original Manuscript (3D Magazine Flipbook & High-DPI Single Page Canvas)
 * 2. Side-by-Side (Authentic Scanned PDF Folio + Verified Scholarly Text)
 * 3. Extracted Text (Focused Devanagari Sanskrit Typography)
 * With Page Thumbnails filmstrip, Table of Contents, Personal Notes,
 * Bookmarks, Debounced Progress Auto-Save, and Resume Reading.
 */
export default function BookPdfViewer({
  pdfUrl,
  title = "Digital Book Edition",
  author,
  bookId,
  bookSlug,
  pageCount,
  processingStatus = "COMPLETED",
  ingestJobs = [],
  ocrErrors = [],
  chapters = [],
  initialPages = [],
  initialPassages = [],
  initialProgress = null,
  user = null,
}) {
  // Document state
  const [numPages, setNumPages] = useState(pageCount || 0);
  const [currentPage, setCurrentPage] = useState(1);
  // View Modes: "MANUSCRIPT" (3D Flipbook) | "SIDE_BY_SIDE" | "EXTRACTED" | "SINGLE" | "PDF_SCROLL"
  const [viewMode, setViewMode] = useState("MANUSCRIPT");
  const [theme, setTheme] = useState("classic"); // "classic" | "modern" | "night"
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Resume Reading Prompt state
  const [resumePrompt, setResumePrompt] = useState(null);

  // Restore saved theme and view mode on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("gurukul-reader-theme");
      if (savedTheme && ["classic", "modern", "night"].includes(savedTheme)) {
        setTheme(savedTheme);
      }
      const savedMode = localStorage.getItem("gurukul-reader-view-mode");
      if (savedMode && ["MANUSCRIPT", "SIDE_BY_SIDE", "EXTRACTED", "SINGLE"].includes(savedMode)) {
        setViewMode(savedMode);
      }
    }
  }, []);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("gurukul-reader-theme", newTheme);
    }
  };

  const handleViewModeChange = (newMode) => {
    setViewMode(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("gurukul-reader-view-mode", newMode);
    }
  };

  // Drawers & Overlays
  const [showChapters, setShowChapters] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [showExplainPanel, setShowExplainPanel] = useState(false);

  // User engagement state (Bookmarks, Progress, Notes)
  const [bookmarkedPages, setBookmarkedPages] = useState(new Set());
  const [readingProgress, setReadingProgress] = useState(0);
  const [notes, setNotes] = useState([]);
  const [newNoteBody, setNewNoteBody] = useState("");
  const [newNoteColor, setNewNoteColor] = useState("amber");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Pages & Passages Maps
  const [pagesMap, setPagesMap] = useState({});

  const containerRef = useRef(null);
  const pdfDocRef = useRef(null);
  const singleCanvasRef = useRef(null);
  const singleRenderTaskRef = useRef(null);
  const sideBySideCanvasRef = useRef(null);
  const sideBySideRenderTaskRef = useRef(null);
  const fetchedPagesForBookRef = useRef(null);
  const fetchedBookmarksForBookRef = useRef(null);
  const fetchedNotesForBookRef = useRef(null);

  // Initialize pages map from initialPages or fetch once from API
  const initialPagesCount = initialPages?.length || 0;
  useEffect(() => {
    if (initialPages && initialPages.length > 0) {
      const map = {};
      for (const p of initialPages) {
        map[p.pageNumber] = p;
      }
      setPagesMap(map);
      fetchedPagesForBookRef.current = bookId || "loaded";
    } else if (bookId && fetchedPagesForBookRef.current !== bookId) {
      fetchedPagesForBookRef.current = bookId;
      fetch(`/api/books/${bookId}/pages?limit=250`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.pages) {
            const map = {};
            for (const p of data.pages) {
              map[p.pageNumber] = p;
            }
            setPagesMap(map);
          }
        })
        .catch(() => {});
    }
  }, [initialPagesCount, bookId]);

  // Fetch initial bookmarks once per book
  useEffect(() => {
    if (!bookId || !user || fetchedBookmarksForBookRef.current === bookId) return;
    fetchedBookmarksForBookRef.current = bookId;
    fetch(`/api/user/bookmarks?bookId=${bookId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data?.bookmarks || data)) {
          const list = data?.bookmarks || data;
          const pageSet = new Set(
            list
              .map((b) => b.pageNumber || b.passage?.sourcePage)
              .filter(Boolean)
          );
          setBookmarkedPages(pageSet);
        }
      })
      .catch(() => {});
  }, [bookId, user]);

  // Fetch initial personal notes
  useEffect(() => {
    if (!bookId || !user || fetchedNotesForBookRef.current === bookId) return;
    fetchedNotesForBookRef.current = bookId;
    fetch(`/api/user/notes?bookId=${bookId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.notes)) {
          setNotes(data.notes);
        }
      })
      .catch(() => {});
  }, [bookId, user]);

  // Check saved progress and trigger resume reading banner
  useEffect(() => {
    if (initialProgress?.pageNumber && initialProgress.pageNumber > 1) {
      setResumePrompt({
        page: initialProgress.pageNumber,
        progress: Math.round(initialProgress.progress || 0),
      });
    } else if (bookId && user) {
      fetch(`/api/user/progress?bookId=${bookId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.progress?.pageNumber && data.progress.pageNumber > 1) {
            setResumePrompt({
              page: data.progress.pageNumber,
              progress: Math.round(data.progress.progress || 0),
            });
          }
        })
        .catch(() => {});
    }
  }, [initialProgress, bookId, user]);

  // Load PDF document using PDF.js
  const loadPdf = useCallback(async () => {
    const targetUrl =
      pdfUrl && !pdfUrl.startsWith("/uploads/books/")
        ? pdfUrl
        : bookId
        ? `/api/books/${bookId}/pdf`
        : pdfUrl;

    if (!targetUrl) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Clean up previous PDF document if open
      if (pdfDocRef.current) {
        try {
          await pdfDocRef.current.destroy();
        } catch (_) {}
        pdfDocRef.current = null;
      }

      let pdfjsLib = typeof window !== "undefined" ? window.pdfjsLib : null;
      if (!pdfjsLib && typeof window !== "undefined") {
        try {
          const vendorUrl = `${window.location.origin}/vendor/pdfjs/pdf.min.mjs`;
          const mod = await import(/* webpackIgnore: true */ vendorUrl);
          pdfjsLib = mod.default || mod;
          window.pdfjsLib = pdfjsLib;
        } catch (_) {}

        if (!pdfjsLib) {
          try {
            const mod = await import("pdfjs-dist/build/pdf.min.mjs");
            pdfjsLib = mod.default || mod;
            window.pdfjsLib = pdfjsLib;
          } catch (_) {}
        }

        if (!pdfjsLib) {
          try {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";
            script.type = "module";
            await new Promise((resolve, reject) => {
              script.onload = resolve;
              script.onerror = () => reject(new Error("Failed to load PDF.js engine"));
              document.head.appendChild(script);
            });
            pdfjsLib = window.pdfjsLib;
          } catch (_) {}
        }
      }

      if (pdfjsLib?.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          typeof window !== "undefined" && window.location?.origin
            ? `${window.location.origin}/vendor/pdfjs/pdf.worker.min.mjs`
            : "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";
      }

      const cMapUrl =
        typeof window !== "undefined" && window.location?.origin
          ? `${window.location.origin}/vendor/pdfjs/cmaps/`
          : "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/";

      if (!pdfjsLib) {
        setViewMode("PDF_SCROLL");
        setLoading(false);
        return;
      }

      const loadingTask = pdfjsLib.getDocument({
        url: targetUrl,
        withCredentials: true,
        cMapUrl,
        cMapPacked: true,
      });

      const doc = await loadingTask.promise;
      pdfDocRef.current = doc;
      setNumPages(doc.numPages);
      setCurrentPage((p) => (p > 1 && p <= doc.numPages ? p : 1));
      setLoading(false);
    } catch (err) {
      console.error("PDF.js loading failed:", err);
      const msg = String(err?.message || "");
      if (msg.includes("401") || msg.includes("Unauthorized")) {
        setError("Session Expired: Please log in to view this manuscript.");
      } else if (msg.includes("403") || msg.includes("Forbidden")) {
        setError("Access Restricted: This manuscript requires authorized permissions.");
      } else if (msg.includes("404") || msg.includes("not found")) {
        setError("Manuscript file not found on storage.");
      } else {
        setError("Unable to render manuscript PDF. You can open native PDF view or try reloading.");
      }
      setLoading(false);
    }
  }, [pdfUrl, bookId]);

  useEffect(() => {
    loadPdf();
    return () => {
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy?.().catch(() => {});
        pdfDocRef.current = null;
      }
    };
  }, [loadPdf]);

  // Synchronize Reading Progress when page changes (auto-save with debounce)
  useEffect(() => {
    if (!bookId || !user || numPages <= 0) return;
    const progressPct = Math.round((currentPage / numPages) * 100);
    setReadingProgress(progressPct);

    const timer = setTimeout(() => {
      fetch("/api/user/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          pageNumber: currentPage,
          progress: progressPct,
        }),
      }).catch(() => {});
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentPage, numPages, bookId, user]);

  // Render Single Page Canvas (when in "SINGLE" view mode)
  useEffect(() => {
    if (viewMode !== "SINGLE" || !pdfDocRef.current || !singleCanvasRef.current) return;

    let isCancelled = false;
    async function renderSinglePage() {
      if (singleRenderTaskRef.current) {
        try {
          singleRenderTaskRef.current.cancel();
        } catch (_) {}
      }

      try {
        const page = await pdfDocRef.current.getPage(currentPage);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale: scale * 1.5 });
        const canvas = singleCanvasRef.current;
        if (!canvas) return;

        const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width / 1.5}px`;
        canvas.style.height = `${viewport.height / 1.5}px`;

        const ctx = canvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const task = page.render({
          canvasContext: ctx,
          viewport,
        });
        singleRenderTaskRef.current = task;
        await task.promise;
      } catch (err) {
        if (err?.name !== "RenderingCancelledException") {
          console.warn("Single page render error:", err);
        }
      }
    }

    renderSinglePage();
    return () => {
      isCancelled = true;
    };
  }, [viewMode, currentPage, scale]);

  // Render Side-by-Side Canvas (when in "SIDE_BY_SIDE" view mode)
  useEffect(() => {
    if (viewMode !== "SIDE_BY_SIDE" || !pdfDocRef.current || !sideBySideCanvasRef.current) return;

    let isCancelled = false;
    async function renderSideBySidePage() {
      if (sideBySideRenderTaskRef.current) {
        try {
          sideBySideRenderTaskRef.current.cancel();
        } catch (_) {}
      }

      try {
        const page = await pdfDocRef.current.getPage(currentPage);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale: scale * 1.5 });
        const canvas = sideBySideCanvasRef.current;
        if (!canvas) return;

        const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1.25, 2.0) : 1.25;
        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = "100%";
        canvas.style.height = "auto";

        const ctx = canvas.getContext("2d");
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const task = page.render({
          canvasContext: ctx,
          viewport,
        });
        sideBySideRenderTaskRef.current = task;
        await task.promise;
      } catch (err) {
        if (err?.name !== "RenderingCancelledException") {
          console.warn("Side-by-side render error:", err);
        }
      }
    }

    renderSideBySidePage();
    return () => {
      isCancelled = true;
    };
  }, [viewMode, currentPage, scale]);

  // Navigation handlers (Synchronized across all modes)
  const handlePrevPage = useCallback(() => {
    if (viewMode === "MANUSCRIPT" || viewMode === "MAGAZINE") {
      setCurrentPage((p) => Math.max(1, p - 2));
    } else {
      setCurrentPage((p) => Math.max(1, p - 1));
    }
  }, [viewMode]);

  const handleNextPage = useCallback(() => {
    if (viewMode === "MANUSCRIPT" || viewMode === "MAGAZINE") {
      setCurrentPage((p) => Math.min(numPages, p + 2));
    } else {
      setCurrentPage((p) => Math.min(numPages, p + 1));
    }
  }, [viewMode, numPages]);

  const handlePageSelect = useCallback((targetPage) => {
    const clamped = Math.max(1, Math.min(numPages, targetPage));
    setCurrentPage(clamped);
  }, [numPages]);

  // Zoom handlers
  const handleZoomIn = () => setScale((s) => Math.min(2.0, +(s + 0.15).toFixed(2)));
  const handleZoomOut = () => setScale((s) => Math.max(0.65, +(s - 0.15).toFixed(2)));
  const handleZoomFit = () => setScale(1.0);
  const handleZoomFitWidth = () => setScale(1.25);

  // Fullscreen toggle
  const handleToggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Bookmark toggle
  const handleToggleBookmark = useCallback(async () => {
    if (!bookId) return;
    const isCurrentlyBookmarked = bookmarkedPages.has(currentPage);

    setBookmarkedPages((prev) => {
      const next = new Set(prev);
      if (isCurrentlyBookmarked) next.delete(currentPage);
      else next.add(currentPage);
      return next;
    });

    try {
      if (isCurrentlyBookmarked) {
        await fetch(`/api/user/bookmarks?bookId=${bookId}&pageNumber=${currentPage}`, {
          method: "DELETE",
        });
      } else {
        await fetch("/api/user/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookId,
            pageNumber: currentPage,
            note: `Bookmarked Page ${currentPage} of ${title}`,
          }),
        });
      }
    } catch (_) {}
  }, [bookId, currentPage, bookmarkedPages, title]);

  // Personal Note submission
  const handleAddNote = async (e) => {
    e?.preventDefault();
    if (!newNoteBody.trim() || !user || !bookId) return;
    setIsSavingNote(true);
    try {
      const res = await fetch("/api/user/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          sourcePage: currentPage,
          chapterId: currentChapter?.id || null,
          body: newNoteBody.trim(),
          color: newNoteColor,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.note) {
          setNotes((prev) => [data.note, ...prev]);
          setNewNoteBody("");
        }
      }
    } catch (_) {}
    setIsSavingNote(false);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) return;
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === "Home") {
        e.preventDefault();
        handlePageSelect(1);
      } else if (e.key === "End") {
        e.preventDefault();
        handlePageSelect(numPages);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        handleToggleBookmark();
      } else if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        setShowThumbnails((v) => !v);
      } else if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        setShowChapters((v) => !v);
      } else if (e.key === "1") {
        handleViewModeChange("MANUSCRIPT");
      } else if (e.key === "2") {
        handleViewModeChange("SIDE_BY_SIDE");
      } else if (e.key === "3") {
        handleViewModeChange("EXTRACTED");
      } else if (e.key === "Escape") {
        setShowChapters(false);
        setShowThumbnails(false);
        setShowExplainPanel(false);
        setShowNotesDrawer(false);
        setResumePrompt(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrevPage, handleNextPage, handlePageSelect, handleToggleFullscreen, handleToggleBookmark, numPages]);

  // Derived current chapter
  const currentChapter = useMemo(() => {
    if (!chapters || chapters.length === 0) return null;
    return (
      chapters.find(
        (ch) =>
          currentPage >= (ch.startPage || 1) &&
          currentPage <= (ch.endPage || numPages)
      ) || chapters[0]
    );
  }, [chapters, currentPage, numPages]);

  // Derived passages for currentPage
  const currentPassages = useMemo(() => {
    if (!initialPassages || initialPassages.length === 0) return [];
    return initialPassages.filter(
      (p) => Number(p.sourcePage) === Number(currentPage)
    );
  }, [initialPassages, currentPage]);

  const activePageData = pagesMap[currentPage] || null;

  // Personal notes for current page
  const pageNotes = useMemo(() => {
    return notes.filter((n) => Number(n.sourcePage) === Number(currentPage));
  }, [notes, currentPage]);

  // 2-page spread left/right page numbers
  const spreadPages = {
    left: currentPage % 2 === 0 ? currentPage : Math.max(1, currentPage - 1),
    right: currentPage % 2 === 0 ? Math.min(numPages, currentPage + 1) : currentPage,
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full min-h-[86vh] text-[#fdfaf5] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between select-none transition-colors duration-500 ${
        theme === "modern"
          ? "bg-gradient-to-b from-[#181d24] via-[#1f2630] to-[#141920]"
          : theme === "night"
          ? "bg-gradient-to-b from-[#060a08] via-[#090e0b] to-[#040605]"
          : "bg-gradient-to-b from-[#091811] via-[#0d231b] to-[#06120c]"
      }`}
    >
      {/* =========================================================================
          TOP COMPACT HEADER BAR
         ========================================================================= */}
      <header className="px-4 py-3 bg-black/40 border-b border-[#d4a359]/20 flex items-center justify-between z-20 shrink-0 backdrop-blur-xs">
        <div className="flex items-center gap-2.5 truncate max-w-sm sm:max-w-md">
          <BookOpen className="w-4 h-4 text-[#d4a359] shrink-0" />
          <h2 className="font-serif font-bold text-sm sm:text-base text-white truncate drop-shadow-xs">
            {title}
          </h2>
          {author && (
            <span className="hidden md:inline text-xs text-amber-200/70 font-serif italic truncate">
              • By {author}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Progress Indicator */}
          <span className="hidden sm:inline text-xs font-mono text-stone-300 bg-white/10 px-2.5 py-1 rounded-lg">
            {readingProgress}% read
          </span>

          {/* Table of Contents Button */}
          {chapters && chapters.length > 0 && (
            <button
              onClick={() => setShowChapters((v) => !v)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-serif font-medium transition cursor-pointer flex items-center gap-1.5 text-stone-200 hover:text-white"
              title="Table of Contents (C)"
            >
              <Layers className="w-3.5 h-3.5 text-[#d4a359]" />
              <span className="hidden sm:inline">Contents ({chapters.length})</span>
            </button>
          )}

          {/* Page Thumbnails Button */}
          <button
            onClick={() => setShowThumbnails((v) => !v)}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-serif font-medium transition cursor-pointer flex items-center gap-1.5 text-stone-200 hover:text-white"
            title="Page Thumbnails Filmstrip (T)"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#d4a359]" />
            <span className="hidden md:inline">Thumbnails</span>
          </button>

          {/* Quick Explain Trigger Button */}
          <button
            onClick={() => setShowExplainPanel((v) => !v)}
            className="px-3 py-1 rounded-lg bg-[#d4a359] hover:bg-[#c49247] text-stone-950 font-serif font-bold text-xs shadow-xs transition flex items-center gap-1 cursor-pointer"
            title="Explain current page with Vedic AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-stone-950" />
            <span>Explain</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          RESUME READING TOAST PROMPT
         ========================================================================= */}
      {resumePrompt && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-[#0d2119]/95 text-white border border-[#d4a359]/60 shadow-2xl rounded-2xl px-4 py-2.5 flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
          <Bookmark className="w-4 h-4 text-[#d4a359]" />
          <span className="text-xs font-serif">
            Welcome back! Resume reading at <strong>Page {resumePrompt.page}</strong> ({resumePrompt.progress}% read)?
          </span>
          <button
            onClick={() => {
              handlePageSelect(resumePrompt.page);
              setResumePrompt(null);
            }}
            className="px-3 py-1 rounded-lg bg-[#d4a359] hover:bg-[#c49247] text-stone-950 text-xs font-bold font-serif transition cursor-pointer"
          >
            Resume
          </button>
          <button
            onClick={() => setResumePrompt(null)}
            className="p-1 rounded-lg text-stone-400 hover:text-white transition cursor-pointer"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================================
          MAIN READING AREA (CENTRAL CENTERPIECE)
         ========================================================================= */}
      <main className="relative flex-1 w-full flex items-center justify-center overflow-hidden py-2 sm:py-4">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 text-stone-300 py-24">
            <Loader2 className="w-10 h-10 text-[#d4a359] animate-spin" />
            <p className="font-serif text-sm text-stone-200">
              Loading Manuscript & Binding Digital Magazine...
            </p>
            <span className="text-xs text-stone-400 font-mono">
              RFC 7233 Byte-Stream Connected
            </span>
          </div>
        )}

        {/* Error Fallback with Actionable Prompts */}
        {error && (
          <div className="text-center p-8 max-w-md bg-stone-900/90 rounded-2xl border border-rose-900/50 space-y-4 my-auto">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <p className="text-sm font-serif text-rose-200">{error}</p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {error.includes("log in") || error.includes("Session Expired") ? (
                <a
                  href={`/auth/login?callbackUrl=/library/${bookSlug || bookId}/pdf`}
                  className="px-4 py-2 rounded-xl bg-[#d4a359] hover:bg-[#c49247] text-stone-950 text-xs font-serif font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>Log In to Continue</span>
                </a>
              ) : (
                <button
                  onClick={loadPdf}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              )}
              <Link
                href="/library"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>Browse Library</span>
              </Link>
            </div>
          </div>
        )}

        {/* VIEW MODE 1: ORIGINAL MANUSCRIPT (3D MAGAZINE FLIPBOOK) */}
        {!loading && !error && (viewMode === "MANUSCRIPT" || viewMode === "MAGAZINE") && (
          <Magazine3DFlipbook
            pdfDoc={pdfDocRef.current}
            numPages={numPages}
            currentPage={currentPage}
            onPageChange={(newPage) => setCurrentPage(newPage)}
            scale={scale}
            title={title}
            author={author}
            theme={theme}
          />
        )}

        {/* VIEW MODE 2: SIDE-BY-SIDE (MANUSCRIPT ON LEFT, VERIFIED SCHOLARLY TEXT ON RIGHT) */}
        {!loading && !error && viewMode === "SIDE_BY_SIDE" && (
          <div className="w-full h-full max-h-[86vh] overflow-y-auto px-2 sm:px-6 py-2 select-text">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start max-w-7xl mx-auto">
              {/* Left Column: Original Manuscript PDF Canvas */}
              <div className="bg-[#fdfbf7] rounded-2xl shadow-xl overflow-hidden border border-[#d4a359]/30 flex flex-col">
                <div className="p-3 bg-[#13382c] text-white flex items-center justify-between border-b border-[#d4a359]/30">
                  <span className="text-xs font-serif font-bold flex items-center gap-1.5 text-amber-200">
                    <BookOpen className="w-3.5 h-3.5 text-[#d4a359]" />
                    Original Manuscript Folio • Page {currentPage}
                  </span>
                  <span className="text-[10px] font-mono text-stone-300">
                    Facsimile Scan
                  </span>
                </div>
                <div
                  className="p-2 sm:p-4 flex items-center justify-center overflow-auto max-h-[72vh] bg-stone-100/50"
                  style={{
                    transform: scale !== 1.0 ? `scale(${scale})` : undefined,
                    transformOrigin: "top center",
                    transition: "transform 0.2s ease-out",
                  }}
                >
                  <canvas ref={sideBySideCanvasRef} className="block object-contain shadow-md rounded max-w-full" />
                </div>
              </div>

              {/* Right Column: Verified Extracted Text, Verses & Notes */}
              <div className="bg-[#faf6ef] text-stone-900 rounded-2xl shadow-xl overflow-hidden border border-[#d4a359]/30 flex flex-col max-h-[82vh]">
                <div className="p-3 bg-[#faf7f0] border-b border-[#ede5d6] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold block">
                      {currentChapter ? `Chapter ${currentChapter.chapterNumber || currentChapter.number || 1}` : "Digitized Manuscript"}
                    </span>
                    <h3 className="font-serif font-bold text-sm text-stone-900 truncate">
                      {currentChapter?.title || title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{activePageData?.ocrConfidence ? `${Math.round(activePageData.ocrConfidence * 100)}% Verified` : "Scholarly Verified"}</span>
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                  {currentPassages.length > 0 ? (
                    currentPassages.map((passage, idx) => {
                      const isVerse = passage.passageType === "VERSE";
                      return (
                        <div
                          key={passage.id || idx}
                          className={`p-4 rounded-xl border transition ${
                            isVerse
                              ? "bg-[#eedfc9]/60 border-l-4 border-l-[#b89358] border-t-transparent border-r-transparent border-b-transparent"
                              : "bg-white border-[#ede5d6]"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono font-bold text-amber-900">
                              Verse {passage.passageNumber || idx + 1}
                            </span>
                            <button
                              onClick={() => {
                                if (navigator.clipboard) {
                                  navigator.clipboard.writeText(passage.text || passage.rawText || "");
                                }
                              }}
                              className="text-stone-400 hover:text-stone-700 transition p-1 cursor-pointer"
                              title="Copy Sanskrit Verse"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="font-serif text-base sm:text-lg text-stone-900 leading-relaxed font-medium">
                            {passage.text || passage.rawText}
                          </p>
                        </div>
                      );
                    })
                  ) : activePageData?.proofreadText || activePageData?.cleanedText || activePageData?.rawText ? (
                    <div className="p-4 sm:p-5 rounded-xl bg-white border border-[#ede5d6] space-y-3">
                      <p className="font-serif text-base sm:text-lg text-stone-900 leading-relaxed whitespace-pre-wrap">
                        {activePageData.proofreadText || activePageData.cleanedText || activePageData.rawText}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-stone-400 text-xs font-serif space-y-2">
                      <p>Page {currentPage} transcription is currently being processed or verified.</p>
                      <button
                        onClick={() => setShowExplainPanel(true)}
                        className="px-3 py-1.5 rounded-lg bg-[#d4a359] text-stone-950 font-bold text-xs cursor-pointer"
                      >
                        Explain Page with Vedic AI
                      </button>
                    </div>
                  )}

                  {/* Page Notes List */}
                  {pageNotes.length > 0 && (
                    <div className="pt-3 border-t border-[#ede5d6] space-y-2">
                      <span className="text-[11px] font-serif font-bold text-amber-900 flex items-center gap-1">
                        <PenLine className="w-3 h-3 text-[#d4a359]" />
                        <span>Your Notes on Page {currentPage}</span>
                      </span>
                      {pageNotes.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-stone-800">
                          {n.body}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE 3: EXTRACTED TEXT (CLEAN SCHOLARLY TYPOGRAPHY FOCUS) */}
        {!loading && !error && viewMode === "EXTRACTED" && (
          <div className="w-full h-full max-h-[86vh] overflow-y-auto px-3 sm:px-6 py-4 select-text flex justify-center">
            <div className="max-w-3xl w-full bg-[#fdfbf7] text-stone-900 rounded-2xl shadow-xl border border-[#d4a359]/30 p-6 sm:p-10 space-y-6">
              {/* Classical Chapter Heading */}
              <div className="text-center pb-4 border-b border-[#ede5d6] space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-bold px-2.5 py-0.5 rounded-full bg-amber-100/60">
                  {currentChapter ? `Chapter ${currentChapter.chapterNumber || currentChapter.number || 1}` : "Manuscript Folio"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900 tracking-tight">
                  {currentChapter?.title || title}
                </h2>
                <div className="flex items-center justify-center gap-2 pt-1 text-xs text-stone-400 font-mono">
                  <span>Page {currentPage} of {numPages}</span>
                  <span>•</span>
                  <span>{activePageData?.ocrConfidence ? `${Math.round(activePageData.ocrConfidence * 100)}% Accuracy` : "Scholarly Edition"}</span>
                </div>
              </div>

              {/* Verses Body */}
              <div className="space-y-6">
                {currentPassages.length > 0 ? (
                  currentPassages.map((passage, idx) => (
                    <article key={passage.id || idx} className="p-5 rounded-2xl bg-[#faf6ef] border border-[#ede5d6] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-amber-900">
                          Verse {passage.passageNumber || idx + 1}
                        </span>
                        <button
                          onClick={() => {
                            if (navigator.clipboard) {
                              navigator.clipboard.writeText(passage.text || passage.rawText || "");
                            }
                          }}
                          className="text-stone-400 hover:text-stone-700 transition cursor-pointer"
                          title="Copy verse text"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="font-serif text-lg sm:text-xl text-stone-950 leading-relaxed font-medium">
                        {passage.text || passage.rawText}
                      </p>
                    </article>
                  ))
                ) : activePageData?.proofreadText || activePageData?.cleanedText || activePageData?.rawText ? (
                  <article className="p-6 rounded-2xl bg-[#faf6ef] border border-[#ede5d6]">
                    <p className="font-serif text-lg text-stone-900 leading-relaxed whitespace-pre-wrap">
                      {activePageData.proofreadText || activePageData.cleanedText || activePageData.rawText}
                    </p>
                  </article>
                ) : (
                  <div className="text-center py-12 text-stone-400 text-xs font-serif">
                    Transcription for Page {currentPage} is being audited.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE 4: SINGLE PAGE READER */}
        {!loading && !error && viewMode === "SINGLE" && (
          <div
            className="flex items-center justify-center p-2 sm:p-4 max-h-[86vh] overflow-auto select-none"
            style={{
              transform: scale !== 1.0 ? `scale(${scale})` : undefined,
              transformOrigin: "center center",
              transition: "transform 0.25s cubic-bezier(0.2, 0, 0, 1)",
            }}
          >
            <div className="bg-[#fdfbf7] rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.55)] overflow-hidden border border-[#d4a359]/25 relative max-w-[90vw]">
              <canvas ref={singleCanvasRef} className="block object-contain" />
              <div className="p-2 text-center text-xs font-mono text-stone-500 bg-[#f7f3ea] border-t border-[#ede5d6]">
                Page {currentPage} of {numPages}
              </div>
            </div>
          </div>
        )}

        {/* VIEW MODE 5: TRADITIONAL PDF EMBED (FALLBACK) */}
        {!loading && !error && viewMode === "PDF_SCROLL" && (
          <div className="w-full h-full min-h-[75vh] p-4 flex items-center justify-center">
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=1`}
              className="w-full h-[78vh] rounded-2xl border border-[#d4a359]/30 bg-stone-900"
              title="Manuscript PDF Viewer"
            />
          </div>
        )}
      </main>

      {/* =========================================================================
          MINIMAL FLOATING READER TOOLBAR
         ========================================================================= */}
      <MagazineToolbar
        currentPage={currentPage}
        numPages={numPages}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        onPageSelect={handlePageSelect}
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomFit={handleZoomFit}
        onZoomFitWidth={handleZoomFitWidth}
        viewMode={viewMode}
        onChangeViewMode={handleViewModeChange}
        theme={theme}
        onChangeTheme={handleThemeChange}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onToggleChapters={() => setShowChapters((v) => !v)}
        onToggleThumbnails={() => setShowThumbnails((v) => !v)}
        isThumbnailsOpen={showThumbnails}
        onToggleNotes={() => setShowNotesDrawer((v) => !v)}
        isNotesOpen={showNotesDrawer}
        hasNotes={pageNotes.length > 0}
        onToggleExplain={() => setShowExplainPanel((v) => !v)}
        isExplainOpen={showExplainPanel}
        isBookmarked={bookmarkedPages.has(currentPage)}
        onToggleBookmark={handleToggleBookmark}
      />

      {/* =========================================================================
          ON-DEMAND CONTEXTUAL AI EXPLANATION DRAWER
         ========================================================================= */}
      <MagazineExplainPanel
        isOpen={showExplainPanel}
        onClose={() => setShowExplainPanel(false)}
        currentPage={currentPage}
        numPages={numPages}
        bookId={bookId}
        bookTitle={title}
        pagesMap={pagesMap}
        passages={initialPassages}
        spreadPages={spreadPages}
      />

      {/* =========================================================================
          CHAPTERS & TABLE OF CONTENTS DRAWER
         ========================================================================= */}
      {showChapters && (
        <aside
          role="dialog"
          aria-label="Table of Contents"
          className="fixed inset-y-0 left-0 z-50 w-full max-w-xs sm:max-w-sm bg-[#faf6ef] text-stone-900 shadow-2xl border-r border-[#d4a359]/30 flex flex-col animate-in slide-in-from-left duration-200"
        >
          <div className="p-4 bg-[#13382c] text-white flex items-center justify-between border-b border-[#d4a359]/30">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#d4a359]" />
              <h3 className="font-serif font-bold text-sm text-white">
                Table of Contents
              </h3>
            </div>
            <button
              onClick={() => setShowChapters(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chapters.map((ch, idx) => (
              <button
                key={ch.id || idx}
                onClick={() => {
                  if (ch.startPage) {
                    handlePageSelect(ch.startPage);
                  }
                  setShowChapters(false);
                }}
                className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex items-center justify-between group ${
                  currentPage >= (ch.startPage || 1) &&
                  currentPage <= (ch.endPage || numPages)
                    ? "bg-[#13382c] text-white border-[#13382c] shadow-xs"
                    : "bg-white hover:bg-[#f5efe4] text-stone-800 border-[#ede5d6]"
                }`}
              >
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] uppercase font-mono font-bold block opacity-70">
                    Chapter {ch.chapterNumber || ch.number || idx + 1}
                  </span>
                  <h4 className="font-serif font-bold text-xs truncate">
                    {ch.title}
                  </h4>
                </div>
                <span className="text-[10px] font-mono opacity-80 shrink-0">
                  p. {ch.startPage || 1}
                </span>
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* =========================================================================
          PAGE THUMBNAILS FILMSTRIP DRAWER
         ========================================================================= */}
      {showThumbnails && (
        <aside
          role="dialog"
          aria-label="Page Thumbnails"
          className="fixed inset-y-0 left-0 z-50 w-full max-w-xs sm:max-w-md bg-[#faf6ef] text-stone-900 shadow-2xl border-r border-[#d4a359]/30 flex flex-col animate-in slide-in-from-left duration-200"
        >
          <div className="p-4 bg-[#13382c] text-white flex items-center justify-between border-b border-[#d4a359]/30">
            <div className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-[#d4a359]" />
              <h3 className="font-serif font-bold text-sm text-white">
                Page Thumbnails ({numPages} Folios)
              </h3>
            </div>
            <button
              onClick={() => setShowThumbnails(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 border-b border-[#ede5d6] bg-[#f5efe4]">
            <input
              type="number"
              min="1"
              max={numPages}
              placeholder="Jump to page number (e.g. 15)..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1 && val <= numPages) {
                    handlePageSelect(val);
                    setShowThumbnails(false);
                  }
                }
              }}
              className="w-full bg-white border border-[#ede5d6] rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:border-[#d4a359]"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((pNum) => {
              const isCurrent = pNum === currentPage;
              const isBookmarked = bookmarkedPages.has(pNum);
              const chStart = chapters.find((ch) => ch.startPage === pNum);

              return (
                <button
                  key={pNum}
                  onClick={() => {
                    handlePageSelect(pNum);
                    setShowThumbnails(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between aspect-[3/4] relative ${
                    isCurrent
                      ? "bg-[#13382c] text-white border-[#d4a359] shadow-md ring-2 ring-[#d4a359]/60"
                      : "bg-white hover:bg-[#f5efe4] text-stone-800 border-[#ede5d6]"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-mono font-bold ${isCurrent ? "text-amber-200" : "text-stone-500"}`}>
                      p. {pNum}
                    </span>
                    {isBookmarked && (
                      <Bookmark className="w-3.5 h-3.5 text-[#d4a359] fill-current" />
                    )}
                  </div>

                  {chStart && (
                    <div className="my-auto text-center px-1">
                      <span className={`text-[9px] uppercase font-bold block truncate ${isCurrent ? "text-amber-200" : "text-amber-800"}`}>
                        Ch. {chStart.chapterNumber || chStart.number || 1}
                      </span>
                      <span className="text-[10px] font-serif line-clamp-2 leading-tight">
                        {chStart.title}
                      </span>
                    </div>
                  )}

                  <div className={`mt-auto text-[9px] font-mono text-center pt-1 border-t ${isCurrent ? "border-white/20 text-white/60" : "border-[#ede5d6] text-stone-400"}`}>
                    {pNum === 1 ? "Front Cover" : pNum === numPages ? "Back Cover" : `Folio ${pNum}`}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      )}

      {/* =========================================================================
          PERSONAL NOTES DRAWER
         ========================================================================= */}
      {showNotesDrawer && (
        <aside
          role="dialog"
          aria-label="Personal Notes"
          className="fixed inset-y-0 right-0 z-50 w-full max-w-xs sm:max-w-md bg-[#faf6ef] text-stone-900 shadow-2xl border-l border-[#d4a359]/30 flex flex-col animate-in slide-in-from-right duration-200"
        >
          <div className="p-4 bg-[#13382c] text-white flex items-center justify-between border-b border-[#d4a359]/30">
            <div className="flex items-center gap-2">
              <PenLine className="w-4 h-4 text-[#d4a359]" />
              <h3 className="font-serif font-bold text-sm text-white">
                Personal Notes & Annotations
              </h3>
            </div>
            <button
              onClick={() => setShowNotesDrawer(false)}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 border-b border-[#ede5d6] bg-[#f5efe4] space-y-3">
            <span className="text-xs font-serif font-bold text-stone-800 block">
              Add Note for Page {currentPage}
            </span>
            <textarea
              rows={3}
              value={newNoteBody}
              onChange={(e) => setNewNoteBody(e.target.value)}
              placeholder={user ? "Write your commentary, insight, or reference..." : "Sign in to save personal notes..."}
              disabled={!user || isSavingNote}
              className="w-full bg-white border border-[#ede5d6] rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#d4a359]"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {["amber", "green", "purple", "blue"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewNoteColor(color)}
                    className={`w-5 h-5 rounded-full border transition cursor-pointer ${
                      newNoteColor === color ? "ring-2 ring-stone-700 scale-110" : "opacity-60"
                    } ${
                      color === "amber" ? "bg-amber-400 border-amber-500" :
                      color === "green" ? "bg-emerald-400 border-emerald-500" :
                      color === "purple" ? "bg-purple-400 border-purple-500" :
                      "bg-blue-400 border-blue-500"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddNote}
                disabled={!user || !newNoteBody.trim() || isSavingNote}
                className="px-3 py-1.5 rounded-xl bg-[#13382c] text-white text-xs font-serif font-bold disabled:opacity-40 hover:bg-[#1a4a3b] transition cursor-pointer"
              >
                {isSavingNote ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notes.length === 0 ? (
              <div className="text-center py-12 text-stone-400 text-xs font-serif">
                No personal notes recorded yet.
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => {
                    if (note.sourcePage) handlePageSelect(note.sourcePage);
                  }}
                  className={`p-3 rounded-xl border text-xs space-y-1.5 transition cursor-pointer hover:shadow-xs ${
                    Number(note.sourcePage) === Number(currentPage)
                      ? "bg-amber-50/80 border-amber-300 ring-1 ring-amber-400/40"
                      : "bg-white border-[#ede5d6]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono">
                    <span className="font-bold text-amber-900">Page {note.sourcePage || 1}</span>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-stone-800 whitespace-pre-wrap">{note.body}</p>
                </div>
              ))
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
