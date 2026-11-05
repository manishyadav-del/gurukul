"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
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
  Search,
  Bookmark,
  BookmarkCheck,
  List,
  Grid,
  Columns,
  Copy,
  Check,
  X,
  RotateCcw,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Clock,
  Loader2,
  Type,
  BookMarked,
  ArrowRight,
  Maximize,
  HelpCircle,
  Settings,
  Languages,
  Eye,
  Sun,
  Moon,
  Coffee,
  Palette,
  AlignLeft,
  Share2,
} from "lucide-react";

import { getPageOcrState } from "@/lib/reader/ocrState";

export { getPageOcrState };

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
}) {
  // Document state
  const [numPages, setNumPages] = useState(pageCount || 0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [viewMode, setViewMode] = useState("SINGLE"); // "SPREAD" | "SINGLE" | "EMBED"
  const [layoutMode, setLayoutMode] = useState("SPLIT"); // "SPLIT" (Side-by-Side) | "PDF_ONLY" (Original Page) | "TEXT_ONLY" (Extracted Text)
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0); // 0 | 90 | 180 | 270
  const [splitRatio, setSplitRatio] = useState("50-50"); // "50-50" | "40-60" | "60-40"
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sidebars & Drawers
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTextPage, setActiveTextPage] = useState(1); // Page displayed in text panel

  // Typography & Reading Preferences (Extracted Text Mode)
  const [textFontSize, setTextFontSize] = useState("base"); // "sm" | "base" | "lg" | "xl"
  const [textLineSpacing, setTextLineSpacing] = useState("relaxed"); // "normal" | "relaxed" | "loose"
  const [textFontFamily, setTextFontFamily] = useState("serif"); // "serif" | "sans" | "devanagari"
  const [textTheme, setTextTheme] = useState("dark"); // "dark" | "sepia" | "cream" | "night"

  // Text panel interaction state
  const [copied, setCopied] = useState(false);
  const [retryingOcr, setRetryingOcr] = useState(false);
  const [retryMessage, setRetryMessage] = useState(null);
  const [selectedTextSnippet, setSelectedTextSnippet] = useState("");
  const [selectionPosition, setSelectionPosition] = useState(null);

  // "Understand This Passage" Reading Assistant State
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantData, setAssistantData] = useState(null);
  const [assistantError, setAssistantError] = useState(null);
  const [assistantLanguage, setAssistantLanguage] = useState("en"); // "en" | "hi"

  // User engagement state
  const [bookmarkedPages, setBookmarkedPages] = useState(new Set());
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [savedConceptKeys, setSavedConceptKeys] = useState(new Set());

  // Pages metadata map: pageNumber -> page object
  const [pagesMap, setPagesMap] = useState({});

  const containerRef = useRef(null);
  const readerAreaRef = useRef(null);
  const textContentRef = useRef(null);
  const canvasLeftRef = useRef(null);
  const canvasRightRef = useRef(null);
  const canvasSingleRef = useRef(null);
  const pdfDocRef = useRef(null);
  const renderTasksRef = useRef({});

  // Initialize pages map from initialPages or fetch from API
  useEffect(() => {
    if (initialPages && initialPages.length > 0) {
      const map = {};
      for (const p of initialPages) {
        map[p.pageNumber] = p;
      }
      setPagesMap(map);
    } else if (bookId) {
      fetch(`/api/books/${bookId}/pages?limit=150`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.pages) {
            const map = {};
            for (const p of data.pages) {
              map[p.pageNumber] = p;
            }
            setPagesMap(map);
          }
        })
        .catch((e) => console.warn("Could not load book pages metadata:", e));
    }
  }, [bookId, initialPages]);

  // Load saved bookmarks and last reading position on mount
  useEffect(() => {
    if (bookId) {
      // 1. Try loading user bookmarks from server
      fetch(`/api/user/bookmarks?bookId=${bookId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.bookmarks) {
            const pages = new Set();
            for (const b of data.bookmarks) {
              const p = b.passage?.sourcePage ?? b.passage?.passageNumber ?? b.passage?.page;
              if (typeof p === "number") pages.add(p);
            }
            if (pages.size > 0) {
              setBookmarkedPages((prev) => new Set([...prev, ...pages]));
            }
          }
        })
        .catch(() => {});

      // 2. Load from localStorage if present
      try {
        const storedBm = localStorage.getItem(`gurukul_bookmarks_${bookId}`);
        if (storedBm) {
          const parsed = JSON.parse(storedBm);
          if (Array.isArray(parsed)) {
            setBookmarkedPages((prev) => new Set([...prev, ...parsed]));
          }
        }
      } catch (_) {}

      // 3. Load saved reading progress and restore last page
      fetch(`/api/user/progress?bookId=${bookId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.progress) {
            if (typeof data.progress.progress === "number") {
              setReadingProgress(Math.round(data.progress.progress));
            }
            if (!sessionStorage.getItem(`gurukul_reader_opened_${bookId}`)) {
              const restoredPage =
                data.progress.pageNumber ||
                (numPages > 0 ? Math.max(1, Math.round((data.progress.progress / 100) * numPages)) : null);

              if (restoredPage && restoredPage > 1 && (!numPages || restoredPage <= numPages)) {
                setCurrentPage(restoredPage);
              }
              sessionStorage.setItem(`gurukul_reader_opened_${bookId}`, "true");
            }
          }
        })
        .catch(() => {});
    }
  }, [bookId, numPages]);

  // Keep active text page synchronized with current page
  useEffect(() => {
    setActiveTextPage(currentPage);
    setPageInput(String(currentPage));

    // Update reading progress
    if (numPages > 0) {
      const pct = Math.min(100, Math.round((currentPage / numPages) * 100));
      setReadingProgress(pct);

      // Debounced progress save
      const timer = setTimeout(() => {
        if (bookId) {
          fetch("/api/user/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookId,
              progress: pct,
              pageNumber: currentPage,
            }),
          }).catch(() => {});
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [currentPage, numPages, bookId]);

  // Load PDF document using pdfjs-dist via dynamic script
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

      // Dynamically load pdfjs: attempt local bundle first, fallback to CDN
      let pdfjsLib = window.pdfjsLib;
      if (!pdfjsLib) {
        try {
          const mod = await import("pdfjs-dist/build/pdf.min.mjs");
          pdfjsLib = mod.default || mod;
          window.pdfjsLib = pdfjsLib;
        } catch (_) {
          // Fallback to CDN script injection if local bundle import is unavailable
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          script.async = true;
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = () => reject(new Error("Failed to load PDF.js engine"));
            document.head.appendChild(script);
          });
          pdfjsLib = window.pdfjsLib;
        }
      }

      if (pdfjsLib?.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          window.location?.origin
            ? `${window.location.origin}/vendor/pdfjs/pdf.worker.min.mjs`
            : "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }

      const cMapUrl = window.location?.origin
        ? `${window.location.origin}/vendor/pdfjs/cmaps/`
        : "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/";

      // Pass credentials to ensure session cookies are sent for restricted manuscripts
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
        setError("Session Expired: Please log in with reviewer credentials to view this manuscript.");
      } else if (msg.includes("403") || msg.includes("Forbidden")) {
        setError("Access Restricted: This manuscript requires authorized reviewer or administrator permissions.");
      } else if (msg.includes("404") || msg.includes("Not Found")) {
        setError("Manuscript PDF file not found on storage.");
      } else {
        setError("Failed to render manuscript PDF. The file may be generating or temporarily unavailable.");
      }
      setLoading(false);
    }
  }, [pdfUrl, bookId]);

  useEffect(() => {
    loadPdf();
    return () => {
      Object.values(renderTasksRef.current).forEach((task) => {
        try {
          task?.cancel?.();
        } catch (_) {}
      });
      renderTasksRef.current = {};
      if (pdfDocRef.current) {
        pdfDocRef.current.destroy?.().catch(() => {});
        pdfDocRef.current = null;
      }
    };
  }, [loadPdf]);

  // Render Page onto a Canvas element with active task cancellation and rotation support
  const renderPageToCanvas = useCallback(
    async (pageNum, canvas, targetScale, key = "default") => {
      if (!pdfDocRef.current || !canvas || pageNum < 1 || pageNum > numPages) return;

      // Cancel previous ongoing render task on this canvas if any
      if (renderTasksRef.current[key]) {
        try {
          renderTasksRef.current[key].cancel();
        } catch (_) {}
        delete renderTasksRef.current[key];
      }

      try {
        const page = await pdfDocRef.current.getPage(pageNum);
        const effectiveRotation = (page.rotate + rotation) % 360;
        const viewport = page.getViewport({ scale: targetScale, rotation: effectiveRotation });
        const ctx = canvas.getContext("2d");

        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = viewport.width * pixelRatio;
        canvas.height = viewport.height * pixelRatio;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderTask = page.render({
          canvasContext: ctx,
          viewport,
        });
        renderTasksRef.current[key] = renderTask;

        await renderTask.promise;
        delete renderTasksRef.current[key];
      } catch (err) {
        if (err.name !== "RenderingCancelledException") {
          console.error(`Error rendering page ${pageNum}:`, err);
        }
      }
    },
    [numPages, rotation]
  );

  // Render canvases when page, scale, view mode, or rotation changes
  useEffect(() => {
    if (!pdfDocRef.current || loading || viewMode === "EMBED") return;

    if (viewMode === "SINGLE") {
      renderPageToCanvas(currentPage, canvasSingleRef.current, scale, "single");
    } else if (viewMode === "SPREAD") {
      const leftPageNum = currentPage % 2 === 1 ? currentPage : Math.max(1, currentPage - 1);
      const rightPageNum = leftPageNum + 1;

      if (leftPageNum >= 1 && leftPageNum <= numPages) {
        renderPageToCanvas(leftPageNum, canvasLeftRef.current, scale * 0.85, "left");
      }
      if (rightPageNum >= 1 && rightPageNum <= numPages) {
        renderPageToCanvas(rightPageNum, canvasRightRef.current, scale * 0.85, "right");
      }
    }
  }, [currentPage, scale, viewMode, rotation, loading, numPages, renderPageToCanvas]);

  // Navigation Handlers
  const handlePrevPage = () => {
    if (viewMode === "SPREAD") {
      setCurrentPage((prev) => Math.max(1, prev - 2));
    } else {
      setCurrentPage((prev) => Math.max(1, prev - 1));
    }
  };

  const handleNextPage = () => {
    if (viewMode === "SPREAD") {
      setCurrentPage((prev) => Math.min(numPages, prev + 2));
    } else {
      setCurrentPage((prev) => Math.min(numPages, prev + 1));
    }
  };

  const handlePageJump = (e) => {
    e?.preventDefault();
    const val = parseInt(pageInput, 10);
    if (!isNaN(val) && val >= 1 && val <= numPages) {
      setCurrentPage(val);
    } else {
      setPageInput(String(currentPage));
    }
  };

  // Zoom & Layout Presets
  const handleZoomIn = () => setScale((s) => Math.min(2.5, Math.round((s + 0.15) * 100) / 100));
  const handleZoomOut = () => setScale((s) => Math.max(0.6, Math.round((s - 0.15) * 100) / 100));
  const handleResetZoom = () => setScale(1.0);
  const handleRotate = () => setRotation((r) => (r + 90) % 360);

  const handleFitWidth = () => {
    if (!readerAreaRef.current) return;
    const availableWidth = readerAreaRef.current.clientWidth - 48;
    const targetPageWidth = viewMode === "SPREAD" ? 1200 : 600;
    const computed = Math.max(0.6, Math.min(2.2, availableWidth / targetPageWidth));
    setScale(Math.round(computed * 100) / 100);
  };

  const handleFitPage = () => {
    if (!readerAreaRef.current) return;
    const availableHeight = readerAreaRef.current.clientHeight - 60;
    const computed = Math.max(0.6, Math.min(2.0, availableHeight / 850));
    setScale(Math.round(computed * 100) / 100);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen?.()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Copy current OCR page text or selected text
  const currentOcrText = useMemo(() => {
    const p = pagesMap[activeTextPage];
    const pageText = p?.proofreadText || p?.cleanedText || p?.rawText;
    if (pageText && pageText.trim()) return pageText.trim();

    // Fallback: match passages with sourcePage === activeTextPage
    if (initialPassages && initialPassages.length > 0) {
      const pagePassages = initialPassages.filter(
        (pass) => (pass.sourcePage || 1) === activeTextPage
      );
      if (pagePassages.length > 0) {
        return pagePassages
          .map((pass) => pass.text || pass.rawText || "")
          .filter(Boolean)
          .join("\n\n");
      }
      // If only 1 page in document or first page, fallback to first few passages
      if (numPages <= 1 || activeTextPage === 1) {
        return initialPassages
          .slice(0, 5)
          .map((pass) => pass.text || pass.rawText || "")
          .filter(Boolean)
          .join("\n\n");
      }
    }

    return "";
  }, [pagesMap, activeTextPage, initialPassages, numPages]);

  const handleCopyText = (customText = null) => {
    const textToCopy = customText || currentOcrText;
    if (!textToCopy) return;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Trigger high-resolution single-page OCR retry
  const handleRetryPageOcr = async (pageId) => {
    if (!pageId || retryingOcr) return;
    setRetryingOcr(true);
    setRetryMessage(null);
    try {
      const res = await fetch(`/api/pages/${pageId}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceOcr: true, dpi: 300 }),
      });
      const data = await res.json();
      if (res.ok && data?.page) {
        setPagesMap((prev) => ({
          ...prev,
          [data.page.pageNumber]: data.page,
        }));
        setRetryMessage({ type: "success", text: "Page OCR refreshed successfully!" });
      } else {
        setRetryMessage({ type: "error", text: data?.error || "Retry failed. Try again." });
      }
    } catch (err) {
      setRetryMessage({ type: "error", text: "Network error during OCR retry." });
    } finally {
      setRetryingOcr(false);
      setTimeout(() => setRetryMessage(null), 4000);
    }
  };

  // Bookmark current page toggle (Server-synced with localStorage fallback)
  const toggleBookmark = async () => {
    const isBookmarked = bookmarkedPages.has(currentPage);
    setIsBookmarking(true);

    // Optimistically update local state & localStorage
    setBookmarkedPages((prev) => {
      const next = new Set(prev);
      if (isBookmarked) next.delete(currentPage);
      else next.add(currentPage);

      try {
        localStorage.setItem(`gurukul_bookmarks_${bookId}`, JSON.stringify([...next]));
      } catch (_) {}

      return next;
    });

    try {
      if (isBookmarked) {
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
          }),
        });
      }
    } catch (e) {
      console.warn("Bookmark server sync notice:", e);
    } finally {
      setIsBookmarking(false);
    }
  };

  // In-Book Full-Text Search across pagesMap
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    const results = [];
    for (let pNum = 1; pNum <= (numPages || 100); pNum++) {
      const pageData = pagesMap[pNum];
      if (!pageData) continue;
      const text = (pageData.proofreadText || pageData.cleanedText || pageData.rawText || "").toLowerCase();
      const matchIndex = text.indexOf(q);
      if (matchIndex !== -1) {
        const start = Math.max(0, matchIndex - 40);
        const end = Math.min(text.length, matchIndex + q.length + 50);
        const snippet = (start > 0 ? "..." : "") + text.slice(start, end).trim() + (end < text.length ? "..." : "");
        results.push({
          pageNumber: pNum,
          snippet,
          confidence: pageData.ocrConfidence,
          proofread: pageData.proofread,
        });
      }
    }
    return results;
  }, [searchQuery, pagesMap, numPages]);

  // Helper to render text with search keyword highlight
  const renderHighlightedText = (text, query) => {
    if (!query || query.trim().length < 2 || !text) {
      return text;
    }

    const q = query.trim();
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <mark
          key={i}
          className="bg-amber-400 text-stone-900 font-bold px-0.5 rounded shadow-2xs underline decoration-amber-600"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Contextual "Understand This Passage" Reading Assistant
  const handleUnderstandPassage = async (customText = null) => {
    const textToExplain =
      customText ||
      selectedTextSnippet ||
      window.getSelection()?.toString()?.trim() ||
      currentOcrText;

    if (!textToExplain || textToExplain.length < 3) return;

    setShowAssistant(true);
    setAssistantLoading(true);
    setAssistantError(null);

    try {
      const activeChapter = chapters.find(
        (c) => c.startPage <= activeTextPage && (!c.endPage || c.endPage >= activeTextPage)
      );

      const res = await fetch("/api/reader/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passageText: textToExplain,
          bookId,
          bookTitle: title,
          chapterTitle: activeChapter?.title || "",
          pageNumber: activeTextPage,
          language: assistantLanguage,
          ocrConfidence: pagesMap[activeTextPage]?.ocrConfidence ?? 0.9,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.explanation) {
          setAssistantData(data.explanation);
        } else {
          throw new Error(data.error || "Failed to generate explanation");
        }
      } else {
        setAssistantData(data.explanation);
      }
    } catch (err) {
      console.error("Passage explanation error:", err);
      setAssistantError(err.message || "Explanation temporarily unavailable.");
    } finally {
      setAssistantLoading(false);
    }
  };

  // Re-run explanation if user switches language inside the Assistant panel
  useEffect(() => {
    if (showAssistant && assistantData && !assistantLoading) {
      handleUnderstandPassage(assistantData.originalPassage);
    }
  }, [assistantLanguage]);

  // Handle text selection inside the extracted text panel
  const handleTextMouseUp = () => {
    const sel = window.getSelection();
    const text = sel?.toString()?.trim();
    if (text && text.length >= 10) {
      setSelectedTextSnippet(text);
      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionPosition({
          top: rect.top - 40,
          left: Math.max(10, rect.left + rect.width / 2 - 80),
        });
      } catch (_) {
        setSelectionPosition(null);
      }
    } else {
      setSelectedTextSnippet("");
      setSelectionPosition(null);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target?.tagName)) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          handlePrevPage();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNextPage();
          break;
        case "Home":
          e.preventDefault();
          setCurrentPage(1);
          break;
        case "End":
          e.preventDefault();
          setCurrentPage(numPages);
          break;
        case "+":
        case "=":
          e.preventDefault();
          handleZoomIn();
          break;
        case "-":
        case "_":
          e.preventDefault();
          handleZoomOut();
          break;
        case "0":
          e.preventDefault();
          handleResetZoom();
          break;
        case "r":
        case "R":
          e.preventDefault();
          handleRotate();
          break;
        case "f":
        case "F":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "1":
          e.preventDefault();
          setLayoutMode("PDF_ONLY");
          break;
        case "2":
          e.preventDefault();
          setLayoutMode("SPLIT");
          setViewMode("SINGLE");
          break;
        case "3":
          e.preventDefault();
          setLayoutMode("TEXT_ONLY");
          break;
        case "s":
        case "S":
          e.preventDefault();
          setShowSearch((v) => !v);
          break;
        case "Escape":
          setShowThumbnails(false);
          setShowChapters(false);
          setShowSearch(false);
          setShowSettings(false);
          setShowAssistant(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const activePageData = pagesMap[activeTextPage];
  const ocrState = getPageOcrState(activePageData, {
    processingStatus,
    ocrErrors,
  });

  // Theme-based class styles for Extracted Text panel
  const themeClasses = useMemo(() => {
    switch (textTheme) {
      case "sepia":
        return {
          panel: "bg-[#fbf0d9] text-[#451a03] border-[#e8d5b5]",
          header: "bg-[#f4e2be] border-[#e8d5b5] text-[#451a03]",
          subHeader: "bg-[#ebd3a8] border-[#dfc392]",
          text: "text-[#3b1400]",
          card: "bg-[#fff7ea] border-[#e8d5b5]",
        };
      case "cream":
        return {
          panel: "bg-[#faf8f4] text-[#292524] border-[#ede5d6]",
          header: "bg-[#f3ede1] border-[#ede5d6] text-[#292524]",
          subHeader: "bg-[#ebe2d1] border-[#e2d5bd]",
          text: "text-[#1c1917]",
          card: "bg-white border-[#ede5d6]",
        };
      case "night":
        return {
          panel: "bg-[#0b1329] text-[#e2e8f0] border-[#1e293b]",
          header: "bg-[#070d1e] border-[#1e293b] text-[#e2e8f0]",
          subHeader: "bg-[#0f172a] border-[#1e293b]",
          text: "text-[#cbd5e1]",
          card: "bg-[#111c38] border-[#1e293b]",
        };
      case "dark":
      default:
        return {
          panel: "bg-stone-900/95 text-stone-200 border-stone-800",
          header: "bg-stone-950 border-stone-800 text-stone-200",
          subHeader: "bg-stone-950/80 border-stone-800/80",
          text: "text-stone-200",
          card: "bg-stone-900 border-stone-800",
        };
    }
  }, [textTheme]);

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-stone-900 text-stone-100 rounded-2xl overflow-hidden border border-stone-800 shadow-2xl transition-all ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : "w-full min-h-[780px]"
      }`}
    >
      {/* =========================================================================
          PRIMARY CONTROL TOOLBAR (Reorganized into 5 Functional Groups)
          ========================================================================= */}
      <header className="bg-stone-950/95 backdrop-blur-md px-3 sm:px-4 py-2.5 border-b border-stone-800 flex flex-wrap items-center justify-between gap-2.5 text-xs select-none">
        
        {/* GROUP 1: NAVIGATION (Pages, Chapters, Search, Prev/Next, Jump) */}
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          <button
            onClick={() => {
              setShowThumbnails((v) => !v);
              setShowChapters(false);
              setShowSearch(false);
            }}
            className={`p-1.5 rounded-lg border transition flex items-center gap-1 cursor-pointer ${
              showThumbnails
                ? "bg-amber-600 text-white border-amber-500 shadow-xs"
                : "bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800"
            }`}
            title="Toggle Page Filmstrip (Pages)"
            aria-label="Toggle Page Filmstrip"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px] font-medium">Pages</span>
          </button>

          {chapters.length > 0 && (
            <button
              onClick={() => {
                setShowChapters((v) => !v);
                setShowThumbnails(false);
                setShowSearch(false);
              }}
              className={`p-1.5 rounded-lg border transition flex items-center gap-1 cursor-pointer ${
                showChapters
                  ? "bg-amber-600 text-white border-amber-500 shadow-xs"
                  : "bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800"
              }`}
              title="Table of Contents (Chapters)"
              aria-label="Table of Contents"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px] font-medium">Chapters</span>
            </button>
          )}

          <button
            onClick={() => {
              setShowSearch((v) => !v);
              setShowThumbnails(false);
              setShowChapters(false);
            }}
            className={`p-1.5 rounded-lg border transition flex items-center gap-1 cursor-pointer ${
              showSearch
                ? "bg-amber-600 text-white border-amber-500 shadow-xs"
                : "bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800"
            }`}
            title="Search Manuscript Text (Press S)"
            aria-label="Search within book"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline text-[11px] font-medium">Search</span>
          </button>

          <div className="h-4 w-px bg-stone-800 mx-0.5" />

          {/* Prev / Page Form / Next Controls */}
          <button
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
            className="p-1 rounded bg-stone-900 hover:bg-stone-800 disabled:opacity-30 border border-stone-800 cursor-pointer"
            title="Previous Page (←)"
            aria-label="Previous Page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <form onSubmit={handlePageJump} className="flex items-center gap-1">
            <input
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={handlePageJump}
              className="w-9 sm:w-11 text-center bg-stone-900 border border-stone-800 rounded px-1 py-0.5 text-stone-200 font-mono text-xs focus:outline-none focus:border-amber-500"
              aria-label="Current Page Number"
            />
            <span className="text-stone-500 font-mono text-xs">/ {numPages || 1}</span>
          </form>

          <button
            onClick={handleNextPage}
            disabled={numPages > 0 && currentPage >= numPages}
            className="p-1 rounded bg-stone-900 hover:bg-stone-800 disabled:opacity-30 border border-stone-800 cursor-pointer"
            title="Next Page (→)"
            aria-label="Next Page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* GROUP 2: READING MODE SWITCHER (Original Page | Side-by-Side | Extracted Text) */}
        <div className="inline-flex rounded-xl border border-stone-800 bg-stone-900/90 p-0.5 text-xs font-medium">
          <button
            onClick={() => setLayoutMode("PDF_ONLY")}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              layoutMode === "PDF_ONLY"
                ? "bg-amber-600 text-white font-semibold shadow-xs"
                : "text-stone-400 hover:text-stone-200"
            }`}
            title="Original Scanned Manuscript Mode (Key 1)"
            aria-label="Original Page Mode"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Original Page</span>
          </button>

          <button
            onClick={() => {
              setLayoutMode("SPLIT");
              setViewMode("SINGLE");
            }}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              layoutMode === "SPLIT"
                ? "bg-amber-600 text-white font-semibold shadow-xs"
                : "text-stone-400 hover:text-stone-200"
            }`}
            title="Side-by-Side Manuscript & OCR Mode (Key 2)"
            aria-label="Side-by-Side Mode"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Side-by-Side</span>
          </button>

          <button
            onClick={() => setLayoutMode("TEXT_ONLY")}
            className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
              layoutMode === "TEXT_ONLY"
                ? "bg-amber-600 text-white font-semibold shadow-xs"
                : "text-stone-400 hover:text-stone-200"
            }`}
            title="Extracted Clean Typography Mode (Key 3)"
            aria-label="Extracted Text Mode"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Extracted Text</span>
          </button>
        </div>

        {/* GROUP 3: READING CONTROLS & PERSONAL TOOLS */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Zoom Controls (Visible in PDF / Split modes) */}
          {layoutMode !== "TEXT_ONLY" && (
            <div className="flex items-center gap-0.5 bg-stone-900 rounded-lg p-0.5 border border-stone-800">
              <button
                onClick={handleZoomOut}
                className="p-1 text-stone-400 hover:text-stone-200 rounded cursor-pointer"
                title="Zoom Out (-)"
                aria-label="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetZoom}
                className="px-1 text-[11px] font-mono text-stone-300 hover:text-amber-400 cursor-pointer"
                title="Click to Reset 100% (Key 0)"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                onClick={handleZoomIn}
                className="p-1 text-stone-400 hover:text-stone-200 rounded cursor-pointer"
                title="Zoom In (+)"
                aria-label="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Fit Width / Fit Page */}
          {layoutMode !== "TEXT_ONLY" && (
            <>
              <button
                onClick={handleFitWidth}
                className="hidden xl:inline-flex px-1.5 py-1 text-[10px] rounded bg-stone-900 border border-stone-800 text-stone-300 hover:bg-stone-800 cursor-pointer"
                title="Fit to Container Width"
              >
                Fit Width
              </button>
              <button
                onClick={handleFitPage}
                className="hidden xl:inline-flex px-1.5 py-1 text-[10px] rounded bg-stone-900 border border-stone-800 text-stone-300 hover:bg-stone-800 cursor-pointer"
                title="Fit Entire Page in View"
              >
                Fit Page
              </button>
            </>
          )}

          {/* Spread vs Single Toggle */}
          {layoutMode !== "TEXT_ONLY" && (
            <button
              onClick={() => setViewMode((m) => (m === "SPREAD" ? "SINGLE" : "SPREAD"))}
              className={`p-1.5 rounded border transition cursor-pointer ${
                viewMode === "SPREAD"
                  ? "bg-stone-800 text-amber-400 border-amber-500/50"
                  : "bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800"
              }`}
              title={viewMode === "SPREAD" ? "Switch to Single Page" : "Switch to 2-Page Spread"}
              aria-label="Toggle Single or Double Page"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Rotate Canvas */}
          {layoutMode !== "TEXT_ONLY" && (
            <button
              onClick={handleRotate}
              className="p-1.5 rounded bg-stone-900 text-stone-300 border border-stone-800 hover:bg-stone-800 cursor-pointer"
              title={`Rotate 90° (Current: ${rotation}°) (Key R)`}
              aria-label="Rotate Page"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Panel Resizer in Side-by-Side Mode */}
          {layoutMode === "SPLIT" && (
            <div className="hidden lg:flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800 text-[10px] font-mono">
              <button
                onClick={() => setSplitRatio("60-40")}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${splitRatio === "60-40" ? "bg-amber-600 text-white font-bold" : "text-stone-400"}`}
                title="60% Scan / 40% Text"
              >
                60:40
              </button>
              <button
                onClick={() => setSplitRatio("50-50")}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${splitRatio === "50-50" ? "bg-amber-600 text-white font-bold" : "text-stone-400"}`}
                title="50% Scan / 50% Text"
              >
                50:50
              </button>
              <button
                onClick={() => setSplitRatio("40-60")}
                className={`px-1.5 py-0.5 rounded cursor-pointer ${splitRatio === "40-60" ? "bg-amber-600 text-white font-bold" : "text-stone-400"}`}
                title="40% Scan / 60% Text"
              >
                40:60
              </button>
            </div>
          )}

          <div className="h-4 w-px bg-stone-800 mx-0.5" />

          {/* Understand This Passage Assistant Button */}
          <button
            onClick={() => handleUnderstandPassage()}
            className="px-2 py-1 rounded-lg bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-[11px] shadow-sm flex items-center gap-1.5 cursor-pointer transition"
            title="Explain Passage with Practical Examples & Terminology"
            aria-label="Understand This Passage"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span className="hidden sm:inline">Understand Passage</span>
          </button>

          {/* Reading Settings Toggle */}
          <button
            onClick={() => setShowSettings((v) => !v)}
            className={`p-1.5 rounded border transition cursor-pointer ${
              showSettings
                ? "bg-amber-600 text-white border-amber-500 shadow-xs"
                : "bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800"
            }`}
            title="Reading Typography & Theme Settings"
            aria-label="Reading Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Bookmark Current Page */}
          <button
            onClick={toggleBookmark}
            disabled={isBookmarking}
            className={`p-1.5 rounded border transition cursor-pointer ${
              bookmarkedPages.has(currentPage)
                ? "bg-amber-600 text-white border-amber-500 shadow-xs"
                : "bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800"
            }`}
            title={bookmarkedPages.has(currentPage) ? "Remove Bookmark" : "Bookmark this Page"}
            aria-label="Bookmark this Page"
          >
            {bookmarkedPages.has(currentPage) ? (
              <BookmarkCheck className="w-3.5 h-3.5" />
            ) : (
              <Bookmark className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded bg-stone-900 text-stone-300 border border-stone-800 hover:bg-stone-800 cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
            aria-label="Fullscreen Toggle"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* =========================================================================
          READING SETTINGS POPOVER (Typography, Line Spacing, Themes)
          ========================================================================= */}
      {showSettings && (
        <div className="bg-stone-950 border-b border-stone-800 p-3 sm:px-6 flex flex-wrap items-center justify-between gap-4 text-xs z-30 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Font Size */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-stone-400 font-medium">Size:</span>
              <div className="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800">
                {["sm", "base", "lg", "xl"].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setTextFontSize(sz)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                      textFontSize === sz ? "bg-amber-600 text-white font-bold" : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    {sz.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Spacing */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-stone-400 font-medium">Spacing:</span>
              <div className="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800">
                {[
                  { id: "normal", label: "Compact" },
                  { id: "relaxed", label: "Normal" },
                  { id: "loose", label: "Spacious" },
                ].map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => setTextLineSpacing(sp.id)}
                    className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                      textLineSpacing === sp.id ? "bg-amber-600 text-white font-bold" : "text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-stone-400 font-medium">Type:</span>
              <div className="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800">
                <button
                  onClick={() => setTextFontFamily("serif")}
                  className={`px-2 py-0.5 rounded text-[11px] font-serif cursor-pointer ${
                    textFontFamily === "serif" ? "bg-amber-600 text-white font-bold" : "text-stone-400"
                  }`}
                >
                  Classical Serif
                </button>
                <button
                  onClick={() => setTextFontFamily("sans")}
                  className={`px-2 py-0.5 rounded text-[11px] font-sans cursor-pointer ${
                    textFontFamily === "sans" ? "bg-amber-600 text-white font-bold" : "text-stone-400"
                  }`}
                >
                  Modern Sans
                </button>
                <button
                  onClick={() => setTextFontFamily("devanagari")}
                  className={`px-2 py-0.5 rounded text-[11px] font-serif cursor-pointer ${
                    textFontFamily === "devanagari" ? "bg-amber-600 text-white font-bold" : "text-stone-400"
                  }`}
                >
                  देवनागरी
                </button>
              </div>
            </div>

            {/* Reading Theme */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-stone-400 font-medium">Theme:</span>
              <div className="flex items-center bg-stone-900 rounded-lg p-0.5 border border-stone-800 gap-1">
                <button
                  onClick={() => setTextTheme("dark")}
                  className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                    textTheme === "dark" ? "bg-stone-800 text-amber-400 border border-amber-500/50" : "text-stone-400"
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() => setTextTheme("sepia")}
                  className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                    textTheme === "sepia" ? "bg-[#fbf0d9] text-[#451a03] font-bold" : "text-stone-400"
                  }`}
                >
                  Sepia
                </button>
                <button
                  onClick={() => setTextTheme("cream")}
                  className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                    textTheme === "cream" ? "bg-[#faf8f4] text-[#292524] font-bold" : "text-stone-400"
                  }`}
                >
                  Cream
                </button>
                <button
                  onClick={() => setTextTheme("night")}
                  className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${
                    textTheme === "night" ? "bg-[#0b1329] text-[#e2e8f0] font-bold" : "text-stone-400"
                  }`}
                >
                  Night
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="text-stone-400 hover:text-stone-200 text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      )}

      {/* =========================================================================
          MAIN READER BODY: Sidebars + Visual Area + OCR Panel + Assistant
          ========================================================================= */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-h-[640px]">
        
        {/* Collapsible Page Thumbnails Filmstrip Drawer */}
        {showThumbnails && (
          <aside className="w-48 sm:w-56 bg-stone-950 border-r border-stone-800 flex flex-col z-20 shrink-0 animate-in slide-in-from-left duration-200">
            <div className="p-3 border-b border-stone-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-300 font-serif flex items-center gap-1.5">
                <Grid className="w-3.5 h-3.5 text-amber-500" />
                <span>Page Filmstrip ({numPages})</span>
              </span>
              <button
                onClick={() => setShowThumbnails(false)}
                className="text-stone-400 hover:text-stone-200 p-1 cursor-pointer"
                aria-label="Close thumbnails"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {Array.from({ length: numPages || 0 }).map((_, idx) => {
                const pNum = idx + 1;
                const isSelected =
                  viewMode === "SPREAD"
                    ? pNum === currentPage || (pNum === currentPage + 1 && pNum <= numPages)
                    : pNum === currentPage;
                const pageMeta = pagesMap[pNum];
                const pageOcr = getPageOcrState(pageMeta, { processingStatus, ocrErrors });

                return (
                  <button
                    key={pNum}
                    onClick={() => setCurrentPage(pNum)}
                    className={`w-full text-left p-2 rounded-xl border transition flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? "bg-amber-600/20 border-amber-500 shadow-md"
                        : "bg-stone-900 border-stone-800 hover:bg-stone-850"
                    }`}
                  >
                    <div className="w-9 h-12 bg-stone-950 rounded border border-stone-700 flex flex-col items-center justify-center font-mono text-xs shrink-0">
                      <span className="text-[11px] font-bold text-stone-200">{pNum}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-stone-200">Page {pNum}</span>
                        <div className="flex items-center gap-1.5">
                          {bookmarkedPages.has(pNum) && (
                            <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                          )}
                          {pageMeta?.proofread && (
                            <span className="text-emerald-400 text-[10px]" title="Proofread">✓</span>
                          )}
                        </div>
                      </div>
                      <span className={`text-[10px] block truncate ${pageOcr.isVerified ? "text-emerald-400" : "text-stone-400"}`}>
                        {pageOcr.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Collapsible Chapters Drawer (Table of Contents) */}
        {showChapters && chapters.length > 0 && (
          <aside className="w-64 sm:w-72 bg-stone-950 border-r border-stone-800 flex flex-col z-20 shrink-0 animate-in slide-in-from-left duration-200">
            <div className="p-3 border-b border-stone-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-300 font-serif flex items-center gap-1.5">
                <List className="w-3.5 h-3.5 text-amber-500" />
                <span>Chapters ({chapters.length})</span>
              </span>
              <button
                onClick={() => setShowChapters(false)}
                className="text-stone-400 hover:text-stone-200 p-1 cursor-pointer"
                aria-label="Close chapters"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {chapters.map((ch, idx) => {
                const isActive = ch.startPage <= currentPage && (!ch.endPage || ch.endPage >= currentPage);
                return (
                  <button
                    key={ch.id || idx}
                    onClick={() => {
                      if (ch.startPage) setCurrentPage(ch.startPage);
                      setShowChapters(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition group cursor-pointer ${
                      isActive
                        ? "bg-amber-600/20 border-amber-500 shadow-sm"
                        : "bg-stone-900 border-stone-800 hover:bg-stone-850 hover:border-amber-500/50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs text-amber-500 font-semibold mb-1">
                      <span>Chapter {ch.chapterNumber || ch.number || idx + 1}</span>
                      {ch.startPage && (
                        <span className="font-mono text-[11px] text-stone-400 group-hover:text-amber-400">
                          p. {ch.startPage}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-200 font-serif line-clamp-2">{ch.title}</p>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Collapsible In-Book Search Drawer */}
        {showSearch && (
          <aside className="w-72 sm:w-80 bg-stone-950 border-r border-stone-800 flex flex-col z-20 shrink-0 animate-in slide-in-from-left duration-200">
            <div className="p-3 border-b border-stone-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-300 font-serif flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-amber-500" />
                <span>In-Book Search</span>
              </span>
              <button
                onClick={() => setShowSearch(false)}
                className="text-stone-400 hover:text-stone-200 p-1 cursor-pointer"
                aria-label="Close search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 border-b border-stone-800">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Sanskrit / Hindi / English..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-stone-900 border border-stone-700 rounded-xl text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  autoFocus
                />
                <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-2.5" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                <div className="text-center py-10 text-stone-400 text-xs">
                  <p>No matching text found for "{searchQuery}".</p>
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    Verify spelling or try searching Devanagari terms.
                  </span>
                </div>
              )}

              {searchResults.map((res, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentPage(res.pageNumber);
                    setShowSearch(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-850 hover:border-amber-500 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      Page {res.pageNumber}
                    </span>
                    {res.proofread && (
                      <span className="text-[10px] text-emerald-400">✓ Verified</span>
                    )}
                  </div>
                  <p className="text-xs text-stone-300 font-serif leading-relaxed line-clamp-3">
                    {renderHighlightedText(res.snippet, searchQuery)}
                  </p>
                </button>
              ))}
            </div>
          </aside>
        )}

        {/* Center Canvas Area: Original Manuscript Scan */}
        {layoutMode !== "TEXT_ONLY" && (
          <div
            ref={readerAreaRef}
            className={`flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-stone-950 relative min-w-0 ${
              layoutMode === "SPLIT"
                ? splitRatio === "60-40"
                  ? "lg:w-[60%]"
                  : splitRatio === "40-60"
                  ? "lg:w-[40%]"
                  : "lg:w-[50%]"
                : "w-full"
            }`}
          >
            {loading && (
              <div className="flex flex-col items-center justify-center gap-3 text-stone-400 py-20">
                <div className="w-10 h-10 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                <p className="font-serif text-sm">प्रस्तुत हो रही है गुरुकुल डिजिटल ई-पुस्तक...</p>
                <span className="text-xs text-stone-500">Loading Digitized Book Pages...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-16 text-stone-400 space-y-3">
                <AlertCircle className="w-12 h-12 mx-auto text-rose-500 opacity-60" />
                <p className="text-sm font-semibold text-rose-400">{error}</p>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={loadPdf}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-xl font-medium inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry Loading</span>
                  </button>
                  <button
                    onClick={() => setViewMode("EMBED")}
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs rounded-xl font-medium inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open Native PDF</span>
                  </button>
                  <button
                    onClick={() => setLayoutMode("TEXT_ONLY")}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs rounded-xl font-medium inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Read Extracted Text</span>
                  </button>
                </div>
              </div>
            )}

            {/* View Mode 1: Two-Page Book Spread */}
            {!loading && !error && viewMode === "SPREAD" && (
              <div className="flex items-center justify-center gap-0 max-w-full overflow-auto p-2">
                {/* Left Page Book Card */}
                <div className="bg-white rounded-l-2xl shadow-2xl border-r border-stone-200 overflow-hidden relative shadow-[inset_-14px_0_24px_-10px_rgba(0,0,0,0.2)]">
                  <canvas ref={canvasLeftRef} className="block shadow-xs" />
                  <div className="absolute top-0 right-0 bottom-0 w-8 pointer-events-none bg-gradient-to-l from-black/10 to-transparent" />
                </div>

                {/* Right Page Book Card */}
                {(() => {
                  const leftPageNum = currentPage % 2 === 1 ? currentPage : Math.max(1, currentPage - 1);
                  const rightPageNum = leftPageNum + 1;
                  return rightPageNum <= numPages ? (
                    <div className="bg-white rounded-r-2xl shadow-2xl border-l border-stone-100 overflow-hidden relative shadow-[inset_14px_0_24px_-10px_rgba(0,0,0,0.15)]">
                      <canvas ref={canvasRightRef} className="block shadow-xs" />
                      <div className="absolute top-0 left-0 bottom-0 w-8 pointer-events-none bg-gradient-to-r from-black/10 to-transparent" />
                    </div>
                  ) : (
                    <div className="bg-stone-900/60 rounded-r-2xl border-l border-stone-800 p-8 flex flex-col items-center justify-center text-center text-stone-500 min-w-[280px]">
                      <span className="text-amber-500 font-serif text-lg mb-1">॥ ग्रन्थ समाप्ति ॥</span>
                      <span className="text-[11px]">End of Manuscript</span>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* View Mode 2: Single Page Reader */}
            {!loading && !error && viewMode === "SINGLE" && (
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden my-auto">
                <canvas ref={canvasSingleRef} className="block max-w-full" />
              </div>
            )}

            {/* View Mode 3: Native PDF Document Embed */}
            {!loading && !error && viewMode === "EMBED" && (
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1`}
                className="w-full h-full min-h-[680px] rounded-xl border border-stone-800"
                title="Book PDF Document"
              />
            )}
          </div>
        )}

        {/* Right Section: Selectable OCR Text Panel (Synchronized with Page) */}
        {layoutMode !== "PDF_ONLY" && (
          <div
            className={`${
              layoutMode === "TEXT_ONLY"
                ? "flex-1"
                : splitRatio === "40-60"
                ? "w-full lg:w-[60%] border-l border-stone-800"
                : splitRatio === "60-40"
                ? "w-full lg:w-[40%] border-l border-stone-800"
                : "w-full lg:w-[50%] border-l border-stone-800"
            } ${themeClasses.panel} flex flex-col shrink-0 overflow-hidden select-text relative transition-colors duration-200`}
          >
            {/* OCR Text Header Bar */}
            <div className={`p-3 ${themeClasses.header} border-b flex items-center justify-between text-xs`}>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <span className="font-semibold font-serif">
                  Recognized Text (Page {activeTextPage})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Contextual Action Button */}
                <button
                  onClick={() => handleUnderstandPassage()}
                  className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition flex items-center gap-1 text-[11px] shadow-xs cursor-pointer"
                  title="Explain this page passage with practical examples"
                >
                  <Sparkles className="w-3 h-3 text-amber-200" />
                  <span>Explain Passage</span>
                </button>

                {/* Copy Text Button */}
                <button
                  onClick={() => handleCopyText()}
                  className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium transition flex items-center gap-1 text-[11px] cursor-pointer"
                  title="Copy Page Text to Clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Page Selector Tabs for Two-Page Spread */}
            {viewMode === "SPREAD" && (
              <div className={`flex border-b ${themeClasses.subHeader} text-xs`}>
                {(() => {
                  const leftPage = currentPage % 2 === 1 ? currentPage : Math.max(1, currentPage - 1);
                  const rightPage = leftPage + 1;
                  return (
                    <>
                      <button
                        onClick={() => setActiveTextPage(leftPage)}
                        className={`flex-1 py-1.5 font-medium text-center border-b-2 transition cursor-pointer ${
                          activeTextPage === leftPage
                            ? "border-amber-500 text-amber-400 bg-stone-900/60 font-bold"
                            : "border-transparent text-stone-400 hover:text-stone-300"
                        }`}
                      >
                        Left Page #{leftPage}
                      </button>
                      {rightPage <= numPages && (
                        <button
                          onClick={() => setActiveTextPage(rightPage)}
                          className={`flex-1 py-1.5 font-medium text-center border-b-2 transition cursor-pointer ${
                            activeTextPage === rightPage
                              ? "border-amber-500 text-amber-400 bg-stone-900/60 font-bold"
                              : "border-transparent text-stone-400 hover:text-stone-300"
                          }`}
                        >
                          Right Page #{rightPage}
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* OCR Status & Review Guardrail Banner */}
            <div className={`px-4 py-2.5 ${themeClasses.subHeader} border-b flex items-center justify-between text-xs`}>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${ocrState.badgeClass}`}
                >
                  {ocrState.isVerified ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : ocrState.isWarning ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  <span>{ocrState.label}</span>
                </span>

                <span className="text-[11px] text-stone-500 hidden sm:inline">
                  {activePageData?.ocrEngine ? `Engine: ${activePageData.ocrEngine}` : "Standard Pipeline"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-stone-400 font-mono">
                  {activePageData?.language || "Sanskrit / Hindi"}
                </span>
                {activePageData?.id && (ocrState.isWarning || ocrState.isError || !activePageData.ocrCompleted) && (
                  <button
                    onClick={() => handleRetryPageOcr(activePageData.id)}
                    disabled={retryingOcr}
                    className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-medium flex items-center gap-1 text-[10px] transition cursor-pointer"
                    title="Retry OCR on this single page"
                  >
                    {retryingOcr ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <RotateCcw className="w-2.5 h-2.5" />}
                    <span>Retry OCR</span>
                  </button>
                )}
              </div>
            </div>

            {/* Notification Banner for Page OCR Retries */}
            {retryMessage && (
              <div
                className={`mx-4 mt-2.5 p-2 rounded-xl text-xs flex items-center gap-2 ${
                  retryMessage.type === "success"
                    ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                    : "bg-rose-950/80 text-rose-300 border border-rose-800"
                }`}
              >
                {retryMessage.type === "success" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{retryMessage.text}</span>
              </div>
            )}

            {/* Low Recognition Quality Warning Callout */}
            {ocrState.isWarning && (
              <div className="mx-4 mt-3 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <p className="leading-snug">
                  <strong>Low Recognition Confidence:</strong> This page scan contains complex conjuncts or scan artifacts. Please compare with the original scanned page on the left.
                </p>
              </div>
            )}

            {/* Processing Failure Callout */}
            {ocrState.isError && (
              <div className="mx-4 mt-3 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-[11px] flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <p className="leading-snug">
                    <strong>OCR Extraction Failed:</strong> Processing error encountered on this page. You can trigger a high-resolution retry or review the original scan.
                  </p>
                </div>
              </div>
            )}

            {/* Unverified Draft vs Human Verified Callout */}
            {!ocrState.isVerified && !ocrState.isWarning && !ocrState.isError && currentOcrText && (
              <div className="mx-4 mt-3 p-2.5 bg-amber-500/10 border border-amber-500/25 rounded-xl text-amber-300 text-[11px] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <p className="leading-snug">
                  <strong>Unreviewed OCR Draft:</strong> Optical recognition text may contain scanning conjunct anomalies. Scholarly citations should verify against the original scanned manuscript page.
                </p>
              </div>
            )}

            {ocrState.isVerified && (
              <div className="mx-4 mt-3 p-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-300 text-[11px] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <p className="leading-snug">
                  <strong>Human Verified Revision:</strong> This page text has been authenticated by a qualified Sanskrit scholar.
                </p>
              </div>
            )}

            {/* OCR Text Content Area */}
            <div
              ref={textContentRef}
              onMouseUp={handleTextMouseUp}
              className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 ${
                textFontFamily === "sans"
                  ? "font-sans"
                  : textFontFamily === "devanagari"
                  ? "font-serif tracking-wide"
                  : "font-serif"
              }`}
            >
              {!currentOcrText ? (
                <div className="text-center py-16 text-stone-400 space-y-3">
                  {ocrState.isProcessing ? (
                    <Loader2 className="w-10 h-10 mx-auto text-amber-500 animate-spin" />
                  ) : (
                    <Sparkles className="w-10 h-10 mx-auto text-amber-500/40" />
                  )}
                  <p className="text-sm font-semibold text-stone-300 font-sans">
                    {ocrState.label}
                  </p>
                  <p className="text-xs text-stone-500 font-sans max-w-xs mx-auto">
                    {ocrState.description}
                  </p>
                </div>
              ) : (
                <div
                  className={`${themeClasses.text} whitespace-pre-wrap ${
                    textFontSize === "sm"
                      ? "text-xs"
                      : textFontSize === "lg"
                      ? "text-base"
                      : textFontSize === "xl"
                      ? "text-lg"
                      : "text-sm"
                  } ${
                    textLineSpacing === "normal"
                      ? "leading-relaxed"
                      : textLineSpacing === "loose"
                      ? "leading-loose"
                      : "leading-7"
                  }`}
                >
                  {renderHighlightedText(currentOcrText, searchQuery)}
                </div>
              )}
            </div>

            {/* Floating Selection Tooltip Action */}
            {selectedTextSnippet && selectionPosition && (
              <div
                style={{ top: selectionPosition.top, left: selectionPosition.left }}
                className="fixed z-40 bg-stone-900 border border-amber-500/80 shadow-2xl rounded-xl px-2.5 py-1.5 flex items-center gap-2 animate-in fade-in duration-150"
              >
                <button
                  onClick={() => handleUnderstandPassage(selectedTextSnippet)}
                  className="text-xs text-amber-300 hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Explain Selection</span>
                </button>
                <span className="text-stone-600">|</span>
                <button
                  onClick={() => handleCopyText(selectedTextSnippet)}
                  className="text-xs text-stone-300 hover:text-white cursor-pointer"
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            "UNDERSTAND THIS PASSAGE" ASSISTANT DRAWER PANEL
            ========================================================================= */}
        {showAssistant && (
          <aside className="w-full sm:w-96 md:w-[440px] bg-stone-950 border-l border-amber-500/40 flex flex-col z-30 shrink-0 shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Assistant Header */}
            <div className="p-3.5 bg-gradient-to-r from-amber-950/80 to-stone-950 border-b border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-600/30 text-amber-400 border border-amber-500/40">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-200 font-serif">
                    {assistantLanguage === "hi" ? "अंश का सरल भावार्थ" : "Understand This Passage"}
                  </h4>
                  <p className="text-[10px] text-amber-400/80">
                    Gurukul Classical Reading Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Switcher */}
                <button
                  onClick={() => setAssistantLanguage((l) => (l === "en" ? "hi" : "en"))}
                  className="px-2 py-0.5 rounded-md bg-stone-900 border border-amber-500/40 text-[10px] font-bold text-amber-300 hover:bg-stone-850 cursor-pointer"
                >
                  {assistantLanguage === "en" ? "हिंदी" : "English"}
                </button>
                <button
                  onClick={() => setShowAssistant(false)}
                  className="p-1 rounded-md text-stone-400 hover:text-stone-200 cursor-pointer"
                  aria-label="Close assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Assistant Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-serif">
              {assistantLoading && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-stone-400">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  <p className="text-xs font-sans text-stone-300">
                    {assistantLanguage === "hi"
                      ? "शास्त्रीय श्लोक व भावार्थ का विश्लेषण जारी है..."
                      : "Analyzing classical passage & practical applications..."}
                  </p>
                </div>
              )}

              {assistantError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs space-y-2">
                  <p className="font-sans font-semibold">{assistantError}</p>
                  <button
                    onClick={() => handleUnderstandPassage()}
                    className="px-3 py-1 bg-stone-900 hover:bg-stone-800 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Retry Analysis
                  </button>
                </div>
              )}

              {!assistantLoading && assistantData && (
                <div className="space-y-4">
                  {/* Source Reference Header */}
                  <div className="flex items-center justify-between text-[11px] text-amber-400/90 font-mono border-b border-stone-800 pb-2">
                    <span>
                      {assistantData.sourceReference?.bookTitle || title}
                    </span>
                    <span>
                      Page {assistantData.sourceReference?.pageNumber || activeTextPage}
                    </span>
                  </div>

                  {/* 1. Original Passage */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 block font-sans">
                      1. Original Passage (स्रोत मूल अंश)
                    </span>
                    <div className="p-3 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 text-xs leading-relaxed italic border-l-2 border-l-amber-500">
                      "{assistantData.originalPassage}"
                    </div>
                  </div>

                  {/* Low Confidence Warning if applicable */}
                  {assistantData.lowConfidenceWarning && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                      <p>{assistantData.lowConfidenceWarning}</p>
                    </div>
                  )}

                  {/* 2. Simple Explanation */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 block font-sans">
                      2. Simple Meaning (सरल अर्थ)
                    </span>
                    <p className="text-xs text-stone-200 leading-relaxed font-sans bg-stone-900/60 p-3 rounded-xl border border-stone-800/80">
                      {assistantData.simpleExplanation}
                    </p>
                  </div>

                  {/* 3. Literal Translation */}
                  {assistantData.translation && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 block font-sans">
                        3. Translation (अनुवाद)
                      </span>
                      <p className="text-xs text-stone-300 leading-relaxed italic bg-stone-900/40 p-2.5 rounded-xl border border-stone-800">
                        {assistantData.translation}
                      </p>
                    </div>
                  )}

                  {/* 4. Key Terms Glossary */}
                  {assistantData.keyTerms && assistantData.keyTerms.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 block font-sans">
                        4. Key Terms & Concepts (पारिभाषिक शब्द)
                      </span>
                      <div className="space-y-1.5 font-sans">
                        {assistantData.keyTerms.map((k, i) => (
                          <div
                            key={i}
                            className="p-2.5 rounded-lg bg-stone-900/80 border border-stone-800 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                                <span>{k.term}</span>
                                {k.devanagari && (
                                  <span className="text-[11px] text-stone-400">({k.devanagari})</span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await fetch("/api/learning/concepts", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({
                                        term: k.term,
                                        sanskritTerm: k.devanagari,
                                        meaning: k.meaning,
                                        sourceBookId: bookId,
                                      }),
                                    });
                                    setSavedConceptKeys((prev) => new Set([...prev, k.term]));
                                  } catch (_) {}
                                }}
                                className="text-[10px] text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                              >
                                {savedConceptKeys.has(k.term) ? "Saved ✓" : "+ Save"}
                              </button>
                            </div>
                            <p className="text-[11px] text-stone-300">{k.meaning}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. Real-Life Example */}
                  {assistantData.realLifeExample && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 block font-sans">
                        5. Real-Life Example (व्यावहारिक दृष्टांत)
                      </span>
                      <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/60 text-emerald-200 text-xs leading-relaxed font-sans">
                        {assistantData.realLifeExample}
                      </div>
                    </div>
                  )}

                  {/* 6. Practical Takeaway */}
                  {assistantData.practicalTakeaway && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 block font-sans">
                        6. Practical Takeaway (दैनिक निष्कर्ष)
                      </span>
                      <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-900/60 text-amber-200 text-xs leading-relaxed font-sans font-medium">
                        {assistantData.practicalTakeaway}
                      </div>
                    </div>
                  )}

                  {/* AI Provenance & Ethical Disclosure */}
                  <div className="pt-2 border-t border-stone-800/80 text-[10px] text-stone-500 font-sans leading-relaxed">
                    <p className="font-semibold text-stone-400 mb-0.5">
                      Provenance & Disclosure:
                    </p>
                    <p>{assistantData.disclaimer}</p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* =========================================================================
          READER FOOTER TOOLBAR (Progress, Spread Navigation, Title)
          ========================================================================= */}
      {viewMode !== "EMBED" && numPages > 0 && (
        <footer className="bg-stone-950/90 px-4 py-2 border-t border-stone-800 flex flex-wrap items-center justify-between text-xs text-stone-400 select-none">
          <div className="flex items-center gap-2">
            <span className="font-serif">॥ श्री गुरुकुल डिजिटल ग्रंथालय ॥</span>
            <span className="hidden sm:inline text-stone-600">•</span>
            <span className="hidden sm:inline text-stone-400 font-mono">
              Reading Progress: {readingProgress}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-30 cursor-pointer"
              title="Previous Page (←)"
            >
              ← Prev
            </button>
            <span className="font-mono text-stone-300">
              {viewMode === "SPREAD"
                ? `Pages ${currentPage}-${Math.min(currentPage + 1, numPages)} of ${numPages}`
                : `Page ${currentPage} of ${numPages}`}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-30 cursor-pointer"
              title="Next Page (→)"
            >
              Next →
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
