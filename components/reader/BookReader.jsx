"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Bookmark as BookmarkIcon,
  BookmarkCheck,
  List,
  Settings,
  Sun,
  Moon,
  Coffee,
  Check,
  ChevronLeft,
  ChevronRight,
  Share2,
  X,
  Type,
  Highlighter,
  PenLine,
  Trash2,
  Columns,
  Layers,
  Sparkles,
  Maximize2,
  FileText,
  HelpCircle,
  Compass,
  Languages,
  CheckCircle2,
  AlertTriangle,
  Network,
} from "lucide-react";
import BookPdfViewer from "./BookPdfViewer.jsx";

export default function BookReader({
  book,
  chapter,
  chapters = [],
  passages = [],
  pages = [],
  initialBookmarks = [],
  user = null,
}) {
  const router = useRouter();

  // Reader Customization Preferences
  const [theme, setTheme] = useState("light"); // 'light' | 'sepia' | 'dark'
  const [fontSize, setFontSize] = useState("base"); // 'sm' | 'base' | 'lg' | 'xl'
  const [lineSpacing, setLineSpacing] = useState("relaxed"); // 'normal' | 'relaxed' | 'loose'
  const [viewMode, setViewMode] = useState("magazine"); // 'magazine' | 'scroll'
  const [currentSpreadIndex, setCurrentSpreadIndex] = useState(0);
  const [showOriginalScan, setShowOriginalScan] = useState(false);
  
  // UI Panels
  const [showToc, setShowToc] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarkedPassageIds, setBookmarkedPassageIds] = useState(new Set(initialBookmarks));
  const [toastMessage, setToastMessage] = useState(null);

  // Notes & Highlights State
  const [passageNotes, setPassageNotes] = useState({});
  const [activeNoteModal, setActiveNoteModal] = useState(null);
  const [noteBody, setNoteBody] = useState("");
  const [noteColor, setNoteColor] = useState("amber");
  const [noteIsHighlight, setNoteIsHighlight] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

  // AI Passage Assistant State
  const [activeAiPassage, setActiveAiPassage] = useState(null);
  const [aiActiveTab, setAiActiveTab] = useState("explain");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiData, setAiData] = useState({});
  const [isSavingToWorkspace, setIsSavingToWorkspace] = useState(false);

  const loadAiFeature = useCallback(async (passage, action) => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/reader/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passageId: passage.id,
          passageText: passage.text,
          bookId: book.id,
          bookTitle: book.title,
          chapterTitle: chapter.title,
          pageNumber: passage.sourcePage,
          action,
          language: theme === "dark" || theme === "sepia" ? "en" : "en",
          ocrConfidence: passage.ocrConfidence,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiData((prev) => ({ ...prev, [action]: data }));
      }
    } catch (e) {
      console.error("AI Feature Error:", e);
    } finally {
      setAiLoading(false);
    }
  }, [book.id, book.title, chapter.title, theme]);

  function openAiAssistant(passage) {
    setActiveAiPassage(passage);
    setAiActiveTab("explain");
    setAiData({});
    loadAiFeature(passage, "explain");
  }

  async function handleSaveToResearchWorkspace(passage) {
    if (!user) {
      showToast("Sign in to save to Research Workspace");
      return;
    }
    setIsSavingToWorkspace(true);
    try {
      const currentExplanation = aiData.explain?.explanation;
      const res = await fetch("/api/research/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemType: "SAVED_PASSAGE",
          title: `Passage Study: ${book.title} (Ch. ${chapter.chapterNumber || chapter.number || 1})`,
          query: currentExplanation?.simpleExplanation || passage.text.slice(0, 100),
          answer: currentExplanation?.translation || null,
          notes: currentExplanation?.practicalTakeaway || null,
          bookId: book.id,
          passageId: passage.id,
          chapterId: chapter.id,
          pageNumber: passage.sourcePage,
          citations: [
            {
              bookTitle: book.title,
              author: book.author,
              chapterTitle: chapter.title,
              sourcePage: passage.sourcePage,
              passageId: passage.id,
              readerUrl: `/library/${book.slug || book.id}/${chapter.slug}?passageId=${passage.id}`,
            },
          ],
        }),
      });
      if (res.ok) {
        showToast("Saved to Personal Research Workspace!");
      } else {
        showToast("Failed to save to Research Workspace");
      }
    } catch (e) {
      showToast("Error saving to Research Workspace");
    } finally {
      setIsSavingToWorkspace(false);
    }
  }

  // Load user notes for this chapter
  useEffect(() => {
    async function loadChapterNotes() {
      if (!chapter?.id) return;
      try {
        const res = await fetch(`/api/user/notes?chapterId=${chapter.id}`);
        if (res.ok) {
          const data = await res.json();
          const map = {};
          for (const note of (data.notes || [])) {
            if (!map[note.passageId]) map[note.passageId] = [];
            map[note.passageId].push(note);
          }
          setPassageNotes(map);
        }
      } catch (e) {}
    }
    loadChapterNotes();
  }, [chapter?.id]);

  function openNoteModal(passage) {
    const existing = passageNotes[passage.id]?.[0] || null;
    setActiveNoteModal({ passage, existing });
    setNoteBody(existing?.body || "");
    setNoteColor(existing?.color || "amber");
    setNoteIsHighlight(existing ? existing.isHighlight : true);
  }

  async function handleSaveNote() {
    if (!activeNoteModal?.passage) return;
    setIsSavingNote(true);
    const { passage, existing } = activeNoteModal;

    try {
      if (existing) {
        const res = await fetch("/api/user/notes", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            noteId: existing.id,
            body: noteBody,
            color: noteColor,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setPassageNotes((prev) => ({
            ...prev,
            [passage.id]: [data.note],
          }));
          showToast("Study note updated");
          setActiveNoteModal(null);
        } else {
          showToast("Failed to update note");
        }
      } else {
        const res = await fetch("/api/user/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            passageId: passage.id,
            bookId: book.id,
            chapterId: chapter.id,
            body: noteBody,
            color: noteColor,
            isHighlight: noteIsHighlight,
            sourcePage: passage.sourcePage,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setPassageNotes((prev) => ({
            ...prev,
            [passage.id]: [...(prev[passage.id] || []), data.note],
          }));
          showToast(noteIsHighlight ? "Passage highlighted" : "Study note saved");
          setActiveNoteModal(null);
        } else {
          showToast("Sign in to save notes");
        }
      }
    } catch (e) {
      showToast("Error saving note");
    } finally {
      setIsSavingNote(false);
    }
  }

  async function handleDeleteNote(noteId, passageId) {
    try {
      const res = await fetch(`/api/user/notes?id=${noteId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPassageNotes((prev) => {
          const copy = { ...prev };
          if (copy[passageId]) {
            copy[passageId] = copy[passageId].filter((n) => n.id !== noteId);
          }
          return copy;
        });
        showToast("Note deleted");
        setActiveNoteModal(null);
      }
    } catch (e) {
      showToast("Failed to delete note");
    }
  }

  // Load preferences from localStorage on client mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("gurukul_reader_theme");
      const savedFontSize = localStorage.getItem("gurukul_reader_font_size");
      const savedSpacing = localStorage.getItem("gurukul_reader_line_spacing");
      const savedViewMode = localStorage.getItem("gurukul_reader_view_mode");

      if (savedTheme) setTheme(savedTheme);
      if (savedFontSize) setFontSize(savedFontSize);
      if (savedSpacing) setLineSpacing(savedSpacing);
      if (savedViewMode) setViewMode(savedViewMode);
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  // Update theme preference
  function handleThemeChange(newTheme) {
    setTheme(newTheme);
    try {
      localStorage.setItem("gurukul_reader_theme", newTheme);
    } catch (e) {}
  }

  // Update font size preference
  function handleFontSizeChange(newSize) {
    setFontSize(newSize);
    try {
      localStorage.setItem("gurukul_reader_font_size", newSize);
    } catch (e) {}
  }

  // Update line spacing preference
  function handleLineSpacingChange(newSpacing) {
    setLineSpacing(newSpacing);
    try {
      localStorage.setItem("gurukul_reader_line_spacing", newSpacing);
    } catch (e) {}
  }

  function handleViewModeChange(mode) {
    setViewMode(mode);
    try {
      localStorage.setItem("gurukul_reader_view_mode", mode);
    } catch (e) {}
  }

  function showToast(msg) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  // Chapter index & neighbors
  const currentIndex = chapters.findIndex((c) => c.id === chapter.id || c.slug === chapter.slug);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  // Group passages into realistic magazine pages
  const magazinePages = useMemo(() => {
    if (!passages || passages.length === 0) return [];

    // Group by sourcePage if multiple pages exist
    const sourcePageSet = new Set(passages.map((p) => p.sourcePage).filter(Boolean));
    if (sourcePageSet.size > 1) {
      const pageMap = new Map();
      passages.forEach((p) => {
        const pageNum = p.sourcePage || 1;
        if (!pageMap.has(pageNum)) pageMap.set(pageNum, []);
        pageMap.get(pageNum).push(p);
      });
      const sortedKeys = Array.from(pageMap.keys()).sort((a, b) => a - b);
      return sortedKeys.map((pageNum) => ({
        pageNumber: pageNum,
        passages: pageMap.get(pageNum),
        pageScan: pages?.find((pg) => pg.pageNumber === pageNum) || null,
      }));
    }

    // Chunk passages into editorial pages (2 passages per magazine page for balanced layout)
    const PASSAGES_PER_PAGE = 2;
    const chunks = [];
    const basePage = chapter.startPage || 1;
    for (let i = 0; i < passages.length; i += PASSAGES_PER_PAGE) {
      const pageNum = basePage + Math.floor(i / PASSAGES_PER_PAGE);
      chunks.push({
        pageNumber: pageNum,
        passages: passages.slice(i, i + PASSAGES_PER_PAGE),
        pageScan: pages?.find((pg) => pg.pageNumber === pageNum) || null,
      });
    }
    return chunks;
  }, [passages, pages, chapter.startPage]);

  const totalPages = magazinePages.length;
  const totalSpreads = Math.max(1, Math.ceil(totalPages / 2));
  const leftPageIndex = currentSpreadIndex * 2;
  const rightPageIndex = currentSpreadIndex * 2 + 1;
  const leftPage = magazinePages[leftPageIndex] || null;
  const rightPage = magazinePages[rightPageIndex] || null;
  const hasAnyScans = pages && pages.some((p) => p.imageUrl);

  // Track Reading Progress automatically in backend
  const recordProgress = useCallback(async (passageId = null) => {
    if (!book?.id) return;
    const totalChapters = chapters.length || 1;
    const progressPercent = Math.round(((currentIndex + 1) / totalChapters) * 100);

    try {
      await fetch("/api/user/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: book.id,
          chapterId: chapter.id,
          passageId,
          progress: progressPercent,
        }),
      });
    } catch (err) {
      // Non-blocking progress sync
    }
  }, [book?.id, chapter.id, chapters.length, currentIndex]);

  useEffect(() => {
    recordProgress(passages[0]?.id || null);
  }, [recordProgress, passages]);

  // Keyboard navigation shortcuts (Arrow keys flip spreads in magazine mode)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

      if (e.key === "ArrowLeft") {
        if (viewMode === "magazine" && currentSpreadIndex > 0) {
          setCurrentSpreadIndex((idx) => Math.max(0, idx - 1));
        } else if (prevChapter) {
          router.push(`/library/${book.slug}/${prevChapter.slug}`);
        }
      } else if (e.key === "ArrowRight") {
        if (viewMode === "magazine" && currentSpreadIndex < totalSpreads - 1) {
          setCurrentSpreadIndex((idx) => Math.min(totalSpreads - 1, idx + 1));
        } else if (nextChapter) {
          router.push(`/library/${book.slug}/${nextChapter.slug}`);
        }
      } else if (e.key === "Escape") {
        setShowToc(false);
        setShowSettings(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevChapter, nextChapter, book.slug, router, viewMode, currentSpreadIndex, totalSpreads]);

  // Bookmark toggling
  async function toggleBookmark(passageId) {
    const isCurrentlyBookmarked = bookmarkedPassageIds.has(passageId);
    const nextSet = new Set(bookmarkedPassageIds);

    if (isCurrentlyBookmarked) {
      nextSet.delete(passageId);
      setBookmarkedPassageIds(nextSet);
      showToast("Bookmark removed");
    } else {
      nextSet.add(passageId);
      setBookmarkedPassageIds(nextSet);
      showToast("Passage bookmarked");
    }

    try {
      const res = await fetch("/api/user/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passageId,
          chapterId: chapter.id,
        }),
      });

      if (!res.ok) {
        // Rollback on failure
        setBookmarkedPassageIds(bookmarkedPassageIds);
        showToast("Sign in to save bookmarks");
      }
    } catch (err) {
      setBookmarkedPassageIds(bookmarkedPassageIds);
      showToast("Failed to save bookmark");
    }
  }

  // Theme style mappings
  const themeClasses = {
    light: {
      bg: "bg-[#FAFAF9]",
      text: "text-stone-900",
      cardBg: "bg-white",
      cardBorder: "border-stone-200",
      verseBg: "bg-purple-50/60",
      verseBorder: "border-purple-300",
      verseText: "text-purple-950",
      headerBorder: "border-stone-200",
      navBg: "bg-white/90",
      mutedText: "text-stone-500",
      accent: "text-amber-800",
      accentBg: "bg-amber-700",
    },
    sepia: {
      bg: "bg-[#F7F1E5]",
      text: "text-[#3D332A]",
      cardBg: "bg-[#EFE7D7]",
      cardBorder: "border-[#DFD5C2]",
      verseBg: "bg-[#E8DECC]",
      verseBorder: "border-[#C9BAA3]",
      verseText: "text-[#2B231B]",
      headerBorder: "border-[#DFD5C2]",
      navBg: "bg-[#EFE7D7]/90",
      mutedText: "text-[#7D6F61]",
      accent: "text-[#8B5A2B]",
      accentBg: "bg-[#8B5A2B]",
    },
    dark: {
      bg: "bg-[#18181B]",
      text: "text-[#E4E4E7]",
      cardBg: "bg-[#27272A]",
      cardBorder: "border-[#3F3F46]",
      verseBg: "bg-[#2E2838]",
      verseBorder: "border-[#6B5B82]",
      verseText: "text-[#E9D5FF]",
      headerBorder: "border-[#27272A]",
      navBg: "bg-[#27272A]/90",
      mutedText: "text-[#A1A1AA]",
      accent: "text-[#F59E0B]",
      accentBg: "bg-[#D97706]",
    },
  }[theme];

  // Font size mappings
  const fontSizes = {
    sm: "text-base sm:text-lg",
    base: "text-lg sm:text-xl",
    lg: "text-xl sm:text-2xl",
    xl: "text-2xl sm:text-3xl",
  }[fontSize];

  // Line spacing mappings
  const lineSpacings = {
    normal: "leading-normal",
    relaxed: "leading-relaxed",
    loose: "leading-loose",
  }[lineSpacing];

  // Helper to render an individual passage card
  function renderPassageCard(passage, pIdx, isMagazine = false) {
    const isBookmarked = bookmarkedPassageIds.has(passage.id);
    const notesForPassage = passageNotes[passage.id] || [];
    const hasNotes = notesForPassage.some((n) => n.body && n.body.trim().length > 0);
    const highlightNote = notesForPassage.find((n) => n.isHighlight);
    const isHighlighted = Boolean(highlightNote);

    const isVerse = passage.passageType === "VERSE";
    const isHeading = passage.passageType === "HEADING";
    const isSubheading = passage.passageType === "SUBHEADING";
    const isFootnote = passage.passageType === "FOOTNOTE";

    // Color mapping for highlights
    const highlightClass = isHighlighted
      ? highlightNote.color === "yellow"
        ? "bg-yellow-50/70 border-yellow-300 ring-1 ring-yellow-400/40"
        : highlightNote.color === "green"
        ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/40"
        : highlightNote.color === "purple"
        ? "bg-purple-50/70 border-purple-300 ring-1 ring-purple-400/40"
        : "bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/40"
      : "";

    return (
      <article
        key={passage.id}
        id={`passage-${passage.id}`}
        className={`group relative transition-all ${
          isMagazine
            ? "p-4 sm:p-5 rounded-xl border"
            : "p-5 sm:p-6 rounded-2xl border"
        } ${isHighlighted ? highlightClass : themeClasses.cardBorder} ${
          isVerse
            ? `${themeClasses.verseBg} border-l-4 ${themeClasses.verseBorder}`
            : `${themeClasses.cardBg}`
        }`}
      >
        {/* Passage Metadata Bar */}
        <div className="flex items-center justify-between text-xs pb-2.5 mb-2.5 border-b border-stone-200/50">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-semibold opacity-60">
              #{passage.passageNumber || pIdx + 1}
            </span>
            {isVerse && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded-md">
                Shloka / Verse
              </span>
            )}
            {passage.sourcePage && (
              <span className={`text-[11px] ${themeClasses.mutedText}`}>
                Page {passage.sourcePage}
              </span>
            )}
            {isHighlighted && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Highlighter className="w-2.5 h-2.5" />
                Highlighted
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* AI Passage Assistant Button */}
            <button
              onClick={() => openAiAssistant(passage)}
              className="p-1.5 rounded-lg text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200/80 transition opacity-80 group-hover:opacity-100"
              title="AI Passage Assistant (Explain, Simplify, Sanskrit Glossary, Related Passages)"
            >
              <Sparkles className="w-4 h-4 text-emerald-800" />
            </button>

            {/* Note / Highlight Button */}
            <button
              onClick={() => openNoteModal(passage)}
              className={`p-1.5 rounded-lg transition ${
                hasNotes || isHighlighted
                  ? "text-amber-700 bg-amber-100/70"
                  : "text-stone-400 hover:text-stone-700 opacity-60 group-hover:opacity-100"
              }`}
              title={hasNotes ? "View/Edit study note" : "Add study note or highlight"}
            >
              <Highlighter className="w-4 h-4" />
            </button>

            {/* Bookmark Button */}
            <button
              onClick={() => toggleBookmark(passage.id)}
              className={`p-1.5 rounded-lg transition ${
                isBookmarked
                  ? "text-amber-600 bg-amber-50"
                  : "text-stone-400 hover:text-stone-700 opacity-60 group-hover:opacity-100"
              }`}
              title={isBookmarked ? "Remove bookmark" : "Bookmark this passage"}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 fill-amber-600 text-amber-600" />
              ) : (
                <BookmarkIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Passage Body */}
        <div className={`${fontSizes} ${lineSpacings}`}>
          {isVerse ? (
            <p className={`font-serif whitespace-pre-wrap ${themeClasses.verseText} font-medium leading-relaxed`}>
              {passage.text}
            </p>
          ) : isHeading ? (
            <h2 className="text-xl sm:text-2xl font-bold font-serif tracking-tight">
              {passage.text}
            </h2>
          ) : isSubheading ? (
            <h3 className="text-lg sm:text-xl font-semibold font-serif opacity-90">
              {passage.text}
            </h3>
          ) : isFootnote ? (
            <aside className={`text-sm italic ${themeClasses.mutedText} border-t pt-2`}>
              {passage.text}
            </aside>
          ) : (
            <p className="font-sans leading-relaxed whitespace-pre-wrap">
              {passage.text}
            </p>
          )}
        </div>

        {/* Saved Personal Study Note display */}
        {hasNotes && (
          <div className="mt-3 pt-2.5 border-t border-stone-200/50 flex items-start gap-2 text-xs text-stone-700 bg-amber-50/60 p-3 rounded-xl border border-amber-200/50">
            <PenLine className="w-3.5 h-3.5 text-amber-800 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 text-[11px]">
                  Personal Study Reflection:
                </span>
                <button
                  onClick={() => openNoteModal(passage)}
                  className="text-[11px] text-amber-800 hover:underline font-semibold"
                >
                  Edit
                </button>
              </div>
              <p className="whitespace-pre-wrap leading-relaxed text-stone-800">
                {notesForPassage[0].body}
              </p>
            </div>
          </div>
        )}
      </article>
    );
  }

  // Helper to render one page inside the Magazine 2-page spread
  function renderMagazinePageContent(pageData, isLeftPage, pageIndex) {
    if (!pageData) {
      return (
        <div className="flex-1 flex flex-col justify-between items-center text-center p-6 opacity-40">
          <div className="w-full text-right text-[10px] font-mono tracking-widest uppercase">
            {book.title}
          </div>
          <div className="space-y-3">
            <BookOpen className="w-10 h-10 text-amber-700/50 mx-auto" />
            <p className="font-serif italic text-xs">Gurukul Vedic Digital Library</p>
            <span className="text-amber-800/40 text-sm">✦ ॐ ✦</span>
          </div>
          <div className="text-[10px] font-mono text-stone-400">
            End of Chapter {chapter.chapterNumber || chapter.number || 1}
          </div>
        </div>
      );
    }

    const isFirstPageOfChapter = pageIndex === 0;

    return (
      <div className="flex-1 flex flex-col justify-between h-full">
        {/* Top Header of Magazine Page */}
        <div className="flex items-center justify-between text-[11px] font-serif border-b border-stone-200 pb-2.5 mb-4 opacity-75">
          <span className="truncate max-w-[200px] font-medium">
            {isLeftPage ? book.title : (chapter.subheading || chapter.title)}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-amber-800 font-semibold">
            {isLeftPage ? `${book.language || "Vedic"} • ${book.script || "Script"}` : `Ch. ${chapter.chapterNumber || chapter.number || 1}`}
          </span>
        </div>

        {/* Magazine Editorial Body */}
        <div className="flex-1 space-y-4">
          {showOriginalScan && pageData.pageScan?.imageUrl ? (
            <div className="space-y-2">
              <div className="rounded-lg overflow-hidden border border-stone-200 bg-stone-50 flex items-center justify-center p-2">
                <img
                  src={pageData.pageScan.imageUrl}
                  alt={`Manuscript Page ${pageData.pageNumber}`}
                  className="max-h-[500px] w-auto object-contain rounded"
                />
              </div>
              <p className="text-[10px] text-stone-400 text-center font-mono">
                Original Manuscript Scan • Page {pageData.pageNumber}
              </p>
            </div>
          ) : (
            <>
              {isFirstPageOfChapter && (
                <div className="text-center pb-3 mb-3 border-b border-amber-200/60 space-y-1.5">
                  <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-amber-800 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                    Chapter {chapter.chapterNumber || chapter.number || 1}
                  </span>
                  <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">
                    {chapter.title}
                  </h1>
                  {chapter.subheading && (
                    <p className="text-xs italic text-stone-500 font-serif max-w-sm mx-auto">
                      {chapter.subheading}
                    </p>
                  )}
                  <div className="flex items-center justify-center gap-1.5 pt-0.5 text-amber-700/60 text-xs">
                    <span>✦</span>
                    <span className="font-serif">ॐ</span>
                    <span>✦</span>
                  </div>
                </div>
              )}

              {/* Passages for this page */}
              <div className="space-y-4">
                {pageData.passages.map((passage, pIdx) => renderPassageCard(passage, pIdx, true))}
              </div>
            </>
          )}
        </div>

        {/* Bottom Footer of Magazine Page */}
        <div className="flex items-center justify-between text-[11px] font-mono pt-3 mt-4 border-t border-stone-200 opacity-60">
          <span>{isLeftPage ? pageData.pageNumber : "✦"}</span>
          <span className="font-serif italic text-[10px]">Gurukul Digital Scripture</span>
          <span>{isLeftPage ? "✦" : pageData.pageNumber}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses.bg} ${themeClasses.text}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Sticky Header */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b ${themeClasses.headerBorder} ${themeClasses.navBg} transition-colors`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/library/${book.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-semibold hover:opacity-75 transition"
              title="Back to Book Overview"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Book Details</span>
            </Link>

            <span className={`text-xs ${themeClasses.mutedText}`}>•</span>

            <div className="max-w-[200px] sm:max-w-xs truncate">
              <span className="text-xs font-bold font-serif">{book.title}</span>
            </div>
          </div>

          {/* Reader Action Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* View Mode Toggle (Magazine Spread vs Scroll vs Book PDF) */}
            <div className="flex items-center bg-stone-200/60 p-0.5 rounded-xl border border-stone-300/40">
              <button
                onClick={() => handleViewModeChange("magazine")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === "magazine"
                    ? "bg-white text-stone-900 shadow-xs font-bold"
                    : "text-stone-500 hover:text-stone-800"
                }`}
                title="Magazine Two-Page Spread View"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Magazine</span>
              </button>
              <button
                onClick={() => handleViewModeChange("scroll")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === "scroll"
                    ? "bg-white text-stone-900 shadow-xs font-bold"
                    : "text-stone-500 hover:text-stone-800"
                }`}
                title="Continuous Scroll View"
              >
                <List className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Scroll</span>
              </button>
              <button
                onClick={() => handleViewModeChange("pdf")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === "pdf"
                    ? "bg-white text-stone-900 shadow-xs font-bold"
                    : "text-stone-500 hover:text-stone-800"
                }`}
                title="Digitized Book PDF View"
              >
                <FileText className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Book PDF</span>
              </button>
            </div>

            <button
              onClick={() => setShowToc(!showToc)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:opacity-80 transition ${
                showToc ? "bg-amber-100 text-amber-900" : ""
              }`}
              title="Table of Contents"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Contents</span>
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:opacity-80 transition ${
                showSettings ? "bg-amber-100 text-amber-900" : ""
              }`}
              title="Reading Preferences"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Display</span>
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Table of Contents Drawer */}
      {showToc && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setShowToc(false)} />
          <div className={`relative ml-auto w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto ${themeClasses.cardBg} ${themeClasses.text} z-50 flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-700" />
                  <h3 className="font-bold font-serif text-lg">Table of Contents</h3>
                </div>
                <button onClick={() => setShowToc(false)} className="p-1 text-stone-400 hover:text-stone-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {chapters.map((ch, idx) => {
                  const isCurrent = ch.id === chapter.id || ch.slug === chapter.slug;
                  return (
                    <Link
                      key={ch.id}
                      href={`/library/${book.slug}/${ch.slug}`}
                      onClick={() => setShowToc(false)}
                      className={`block p-3.5 rounded-xl border transition ${
                        isCurrent
                          ? "border-amber-600 bg-amber-50 text-amber-950 font-semibold"
                          : `border-transparent hover:${themeClasses.bg} opacity-90 hover:opacity-100`
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono text-amber-700 font-bold">
                          Chapter {ch.chapterNumber || ch.number || idx + 1}
                        </span>
                        {ch.startPage && (
                          <span className={themeClasses.mutedText}>
                            Pages {ch.startPage}–{ch.endPage || ch.startPage}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-serif">{ch.title}</p>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className={`pt-6 border-t ${themeClasses.headerBorder} text-xs ${themeClasses.mutedText} text-center`}>
              Reading progress saved automatically
            </div>
          </div>
        </div>
      )}

      {/* Reader Settings Modal / Drawer */}
      {showSettings && (
        <div className="fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-xs" onClick={() => setShowSettings(false)} />
          <div className={`relative ml-auto w-full max-w-sm h-full shadow-2xl p-6 ${themeClasses.cardBg} ${themeClasses.text} z-50 overflow-y-auto space-y-6`}>
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold font-serif text-base flex items-center gap-2">
                <Type className="w-4 h-4 text-amber-700" />
                <span>Reading Preferences</span>
              </h3>
              <button onClick={() => setShowSettings(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Layout Mode Selector */}
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase tracking-wider ${themeClasses.mutedText}`}>
                Reading Layout Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleViewModeChange("magazine")}
                  className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition ${
                    viewMode === "magazine"
                      ? "border-amber-600 bg-amber-500 text-white shadow-xs"
                      : "border-stone-300 hover:border-stone-400"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Magazine</span>
                </button>
                <button
                  onClick={() => handleViewModeChange("scroll")}
                  className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition ${
                    viewMode === "scroll"
                      ? "border-amber-600 bg-amber-500 text-white shadow-xs"
                      : "border-stone-300 hover:border-stone-400"
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span>Scroll</span>
                </button>
                <button
                  onClick={() => handleViewModeChange("pdf")}
                  className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition ${
                    viewMode === "pdf"
                      ? "border-amber-600 bg-amber-500 text-white shadow-xs"
                      : "border-stone-300 hover:border-stone-400"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Book PDF</span>
                </button>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase tracking-wider ${themeClasses.mutedText}`}>
                Background Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleThemeChange("light")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                    theme === "light" ? "border-amber-600 ring-2 ring-amber-600/20 bg-white text-stone-900" : "border-stone-300 bg-stone-100 text-stone-600"
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold">Light</span>
                </button>

                <button
                  onClick={() => handleThemeChange("sepia")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                    theme === "sepia" ? "border-amber-700 ring-2 ring-amber-700/20 bg-[#F7F1E5] text-[#3D332A]" : "border-[#DFD5C2] bg-[#EFE7D7] text-[#7D6F61]"
                  }`}
                >
                  <Coffee className="w-4 h-4 text-[#8B5A2B]" />
                  <span className="text-xs font-semibold">Warm Sepia</span>
                </button>

                <button
                  onClick={() => handleThemeChange("dark")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                    theme === "dark" ? "border-amber-400 ring-2 ring-amber-400/20 bg-[#18181B] text-white" : "border-stone-700 bg-stone-800 text-stone-400"
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold">Dark</span>
                </button>
              </div>
            </div>

            {/* Font Size Selector */}
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase tracking-wider ${themeClasses.mutedText}`}>
                Font Size
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: "sm", label: "Small" },
                  { key: "base", label: "Normal" },
                  { key: "lg", label: "Large" },
                  { key: "xl", label: "Extra" },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => handleFontSizeChange(s.key)}
                    className={`py-2 px-1 rounded-xl border text-xs font-semibold transition ${
                      fontSize === s.key ? "border-amber-600 bg-amber-500 text-white" : "border-stone-300 hover:border-stone-400"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Spacing Selector */}
            <div className="space-y-2">
              <label className={`text-xs font-bold uppercase tracking-wider ${themeClasses.mutedText}`}>
                Line Spacing
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "normal", label: "Compact" },
                  { key: "relaxed", label: "Relaxed" },
                  { key: "loose", label: "Spacious" },
                ].map((sp) => (
                  <button
                    key={sp.key}
                    onClick={() => handleLineSpacingChange(sp.key)}
                    className={`py-2 px-1 rounded-xl border text-xs font-semibold transition ${
                      lineSpacing === sp.key ? "border-amber-600 bg-amber-500 text-white" : "border-stone-300 hover:border-stone-400"
                    }`}
                  >
                    {sp.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200">
              <p className={`text-[11px] ${themeClasses.mutedText} leading-relaxed`}>
                Tip: Use <kbd className="font-mono bg-stone-200/50 px-1 py-0.5 rounded-sm">←</kbd> and <kbd className="font-mono bg-stone-200/50 px-1 py-0.5 rounded-sm">→</kbd> keys on your keyboard to navigate between chapters quickly.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 1: DIGITIZED BOOK PDF EDITION */}
      {viewMode === "pdf" ? (
        <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-8 space-y-6">
          <BookPdfViewer
            pdfUrl={`/api/books/${book.id}/pdf`}
            title={book.title}
            author={book.author}
            bookId={book.id}
          />
        </main>
      ) : viewMode === "magazine" ? (
        <main className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-6 sm:py-10 space-y-6">
          {/* Magazine Two-Page Open Book Spread Container */}
          <div className="relative shadow-2xl rounded-md border border-stone-300/80 overflow-hidden bg-stone-100 flex flex-col md:flex-row">
            {/* Center Spine Crease (3D Open Book Illusion on Desktop) */}
            <div className="hidden md:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 pointer-events-none z-20 bg-gradient-to-r from-stone-900/10 via-stone-900/25 to-stone-900/10 opacity-70" />

            {/* Left Page (Even page in 2-page spread) */}
            <div className={`flex-1 min-h-[640px] sm:min-h-[700px] p-6 sm:p-8 flex flex-col justify-between relative transition-all border-b md:border-b-0 md:border-r ${themeClasses.cardBorder} ${themeClasses.cardBg} md:shadow-[inset_-14px_0_20px_-10px_rgba(0,0,0,0.12)]`}>
              {renderMagazinePageContent(leftPage, true, leftPageIndex)}
            </div>

            {/* Right Page (Odd page in 2-page spread) */}
            <div className={`flex-1 min-h-[640px] sm:min-h-[700px] p-6 sm:p-8 flex flex-col justify-between relative transition-all ${themeClasses.cardBorder} ${themeClasses.cardBg} md:shadow-[inset_14px_0_20px_-10px_rgba(0,0,0,0.12)]`}>
              {renderMagazinePageContent(rightPage, false, rightPageIndex)}
            </div>
          </div>

          {/* Magazine Navigation & Controls Bar */}
          <div className={`flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border shadow-xs ${themeClasses.cardBorder} ${themeClasses.cardBg}`}>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (currentSpreadIndex > 0) {
                    setCurrentSpreadIndex((i) => i - 1);
                  } else if (prevChapter) {
                    router.push(`/library/${book.slug}/${prevChapter.slug}`);
                  }
                }}
                disabled={currentSpreadIndex === 0 && !prevChapter}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold hover:opacity-80 disabled:opacity-40 transition ${themeClasses.cardBorder}`}
                title="Previous Spread (or Prev Chapter)"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{currentSpreadIndex === 0 ? "Prev Chapter" : "Prev Page"}</span>
              </button>

              <button
                onClick={() => {
                  if (currentSpreadIndex < totalSpreads - 1) {
                    setCurrentSpreadIndex((i) => i + 1);
                  } else if (nextChapter) {
                    router.push(`/library/${book.slug}/${nextChapter.slug}`);
                  }
                }}
                disabled={currentSpreadIndex >= totalSpreads - 1 && !nextChapter}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 disabled:opacity-40 transition shadow-xs"
                title="Next Spread (or Next Chapter)"
              >
                <span>{currentSpreadIndex >= totalSpreads - 1 ? "Next Chapter" : "Next Page"}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Page Jumper / Indicator */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="font-semibold">
                Page {leftPage?.pageNumber || 1}
                {rightPage ? `–${rightPage.pageNumber}` : ""} of {totalPages || 1}
              </span>
              <select
                value={currentSpreadIndex}
                onChange={(e) => setCurrentSpreadIndex(Number(e.target.value))}
                className="bg-stone-50 border border-stone-200 text-xs rounded-lg px-2.5 py-1 font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 text-stone-900"
              >
                {Array.from({ length: totalSpreads }).map((_, idx) => {
                  const p1 = magazinePages[idx * 2]?.pageNumber || idx * 2 + 1;
                  const p2 = magazinePages[idx * 2 + 1]?.pageNumber;
                  return (
                    <option key={idx} value={idx}>
                      Spread {idx + 1} (Pages {p1}{p2 ? `–${p2}` : ""})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Manuscript Scan Toggle */}
            {hasAnyScans && (
              <button
                onClick={() => setShowOriginalScan(!showOriginalScan)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  showOriginalScan
                    ? "bg-amber-100 text-amber-900 border-amber-300"
                    : `${themeClasses.cardBorder} opacity-80 hover:opacity-100`
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-700" />
                <span>{showOriginalScan ? "Digital Text" : "Original Scan"}</span>
              </button>
            )}
          </div>
        </main>
      ) : (
        /* VIEW MODE 2: CONTINUOUS VERTICAL SCROLL */
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
          {/* Chapter Title Header */}
          <section className={`border-b ${themeClasses.headerBorder} pb-8 space-y-3`}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold tracking-wider uppercase text-amber-700 bg-amber-100/60 px-2.5 py-1 rounded-md">
                Chapter {chapter.chapterNumber || chapter.number || 1}
              </span>
              {chapter.startPage && (
                <span className={`font-mono text-xs ${themeClasses.mutedText}`}>
                  Pages {chapter.startPage} – {chapter.endPage || chapter.startPage}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight">
              {chapter.title}
            </h1>

            {chapter.subheading && (
              <p className={`text-base sm:text-lg italic ${themeClasses.mutedText}`}>
                {chapter.subheading}
              </p>
            )}
          </section>

          {/* Chapter Passages List */}
          <div className="space-y-8">
            {passages.length === 0 ? (
              <div className={`p-12 text-center rounded-2xl border ${themeClasses.cardBorder} ${themeClasses.cardBg}`}>
                <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40 text-amber-700" />
                <h3 className="font-bold font-serif text-lg mb-1">Passages in Preparation</h3>
                <p className={`text-xs ${themeClasses.mutedText}`}>
                  This chapter is currently being digitized and structured. Please check back shortly.
                </p>
              </div>
            ) : (
              passages.map((passage, pIdx) => renderPassageCard(passage, pIdx, false))
            )}
          </div>

        {/* Chapter Navigation Pagination Bar */}
        <nav className={`pt-10 border-t ${themeClasses.headerBorder} flex items-center justify-between gap-4`} aria-label="Chapter Navigation">
          {prevChapter ? (
            <Link
              href={`/library/${book.slug}/${prevChapter.slug}`}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl border text-xs sm:text-sm font-semibold transition ${themeClasses.cardBorder} ${themeClasses.cardBg} hover:opacity-80`}
            >
              <ChevronLeft className="w-4 h-4" />
              <div className="text-left">
                <span className={`block text-[10px] uppercase font-mono ${themeClasses.mutedText}`}>
                  Previous Chapter
                </span>
                <span className="truncate max-w-[120px] sm:max-w-[200px] block">
                  {prevChapter.title}
                </span>
              </div>
            </Link>
          ) : (
            <div />
          )}

          {nextChapter ? (
            <Link
              href={`/library/${book.slug}/${nextChapter.slug}`}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold text-white transition shadow-sm ${themeClasses.accentBg} hover:opacity-90`}
            >
              <div className="text-right">
                <span className="block text-[10px] uppercase font-mono text-white/70">
                  Next Chapter
                </span>
                <span className="truncate max-w-[120px] sm:max-w-[200px] block">
                  {nextChapter.title}
                </span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href={`/library/${book.slug}`}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl border text-xs sm:text-sm font-semibold transition ${themeClasses.cardBorder} ${themeClasses.cardBg} hover:opacity-80`}
            >
              <BookOpen className="w-4 h-4 text-amber-700" />
              <span>Finish Reading</span>
            </Link>
          )}
        </nav>
      </main>
      )}

      {/* Note and Highlight Modal */}
      {activeNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Highlighter className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-stone-900 font-serif text-base">
                  {activeNoteModal.existing ? "Edit Study Note" : "Add Study Note & Highlight"}
                </h3>
              </div>
              <button
                onClick={() => setActiveNoteModal(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Passage Reference Preview */}
            <div className="bg-stone-50 border border-stone-200/60 p-3 rounded-xl text-xs space-y-1">
              <span className="font-semibold text-stone-700 block">
                Passage #{activeNoteModal.passage.passageNumber || 1}
                {activeNoteModal.passage.sourcePage ? ` • Page ${activeNoteModal.passage.sourcePage}` : ""}
              </span>
              <p className="text-stone-600 italic font-serif line-clamp-3">
                "{activeNoteModal.passage.text}"
              </p>
            </div>

            {/* Highlight Toggle & Color Picker */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 font-medium text-stone-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={noteIsHighlight}
                  onChange={(e) => setNoteIsHighlight(e.target.checked)}
                  className="rounded text-amber-700 focus:ring-amber-500 w-4 h-4"
                />
                <span>Highlight this passage</span>
              </label>

              {noteIsHighlight && (
                <div className="flex items-center gap-1.5">
                  {[
                    { key: "amber", bg: "bg-amber-400" },
                    { key: "yellow", bg: "bg-yellow-400" },
                    { key: "green", bg: "bg-emerald-400" },
                    { key: "purple", bg: "bg-purple-400" },
                  ].map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setNoteColor(c.key)}
                      className={`w-5 h-5 rounded-full ${c.bg} transition ${
                        noteColor === c.key ? "ring-2 ring-stone-900 ring-offset-1 scale-110" : "opacity-60 hover:opacity-100"
                      }`}
                      title={c.key}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Study Reflection Note Textarea */}
            <div>
              <label className="font-semibold text-stone-700 text-xs block mb-1">
                Your Reflection / Study Insights
              </label>
              <textarea
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                placeholder="Write your personal reflections, astrological annotations, or Sanskrit interpretations here..."
                rows={4}
                className="w-full p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 text-xs leading-relaxed text-stone-900"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between">
              {activeNoteModal.existing ? (
                <button
                  type="button"
                  onClick={() => handleDeleteNote(activeNoteModal.existing.id, activeNoteModal.passage.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-700 hover:bg-rose-50 text-xs font-semibold transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveNoteModal(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingNote}
                  onClick={handleSaveNote}
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
                >
                  {isSavingNote ? "Saving..." : "Save Note"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Passage Assistant Modal */}
      {activeAiPassage && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-stone-200 space-y-5 my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-stone-100 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-emerald-100 text-emerald-800">
                    <Sparkles className="w-5 h-5 text-emerald-800" />
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-900 font-serif text-lg leading-tight">
                      AI Passage Assistant
                    </h3>
                    <p className="text-xs text-stone-500 font-mono">
                      {book.title} • Ch. {chapter.chapterNumber || chapter.number || 1}
                      {activeAiPassage.sourcePage ? ` • Page ${activeAiPassage.sourcePage}` : ""}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveAiPassage(null)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 transition"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quality & Verification Status Banner */}
            <div className="flex items-center justify-between text-xs px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200/70 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  OCR Quality:
                </span>
                {activeAiPassage.ocrConfidence && activeAiPassage.ocrConfidence < 0.65 ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md text-[11px]">
                    <AlertTriangle className="w-3 h-3 text-amber-700" />
                    Scan Requires Scholarly Verification ({Math.round(activeAiPassage.ocrConfidence * 100)}%)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md text-[11px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    High Confidence / Verified ({Math.round((activeAiPassage.ocrConfidence || 0.95) * 100)}%)
                  </span>
                )}
              </div>
              <button
                onClick={() => handleSaveToResearchWorkspace(activeAiPassage)}
                disabled={isSavingToWorkspace}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-lg border border-emerald-200 transition disabled:opacity-50"
              >
                <BookmarkIcon className="w-3.5 h-3.5" />
                <span>{isSavingToWorkspace ? "Saving..." : "Save to Workspace"}</span>
              </button>
            </div>

            {/* Original Passage Snippet Preview */}
            <div className="bg-[#fcfaf5] border border-amber-900/10 p-3.5 rounded-2xl shrink-0 max-h-28 overflow-y-auto">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-900 font-bold block mb-1">
                Selected Manuscript Passage:
              </span>
              <p className="text-xs sm:text-sm font-serif italic text-stone-800 leading-relaxed whitespace-pre-wrap">
                "{activeAiPassage.text}"
              </p>
            </div>

            {/* AI Action Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 border-b border-stone-200 text-xs font-semibold">
              {[
                { id: "explain", label: "Explain Passage" },
                { id: "simplify", label: "Simplify Language" },
                { id: "sanskrit_terms", label: "Sanskrit Glossary" },
                { id: "concepts", label: "Core Concepts" },
                { id: "related_passages", label: "Related Passages" },
                { id: "classical_references", label: "Classical Citation" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setAiActiveTab(tab.id);
                    if (!aiData[tab.id]) {
                      loadAiFeature(activeAiPassage, tab.id);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                    aiActiveTab === tab.id
                      ? "bg-emerald-800 text-white shadow-xs"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* AI Tab Content Panel */}
            <div className="flex-1 overflow-y-auto space-y-4 text-xs sm:text-sm leading-relaxed text-stone-800 pr-1">
              {aiLoading && !aiData[aiActiveTab] ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-stone-500">
                  <div className="w-7 h-7 border-2 border-emerald-700 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-serif italic">Synthesizing classical source-grounded insights...</p>
                </div>
              ) : aiActiveTab === "explain" ? (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                      Contextual Meaning
                    </span>
                    <p className="text-stone-800 leading-relaxed">
                      {aiData.explain?.explanation?.simpleExplanation ||
                        aiData.explain?.explanation?.simpleHindiExplanation ||
                        "Contextual explanation is loading..."}
                    </p>
                  </div>

                  {aiData.explain?.explanation?.translation && (
                    <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                        Literal Translation
                      </span>
                      <p className="italic text-stone-700">
                        {aiData.explain?.explanation?.translation}
                      </p>
                    </div>
                  )}

                  {aiData.explain?.explanation?.realLifeExample && (
                    <div className="bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl space-y-1 text-xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                        Practical Real-Life Illustration
                      </span>
                      <p className="text-stone-800">
                        {aiData.explain?.explanation?.realLifeExample}
                      </p>
                    </div>
                  )}

                  {aiData.explain?.explanation?.practicalTakeaway && (
                    <div className="bg-emerald-50/70 border border-emerald-200/60 p-3 rounded-xl space-y-1 text-xs">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                        Actionable Takeaway
                      </span>
                      <p className="text-stone-800">
                        {aiData.explain?.explanation?.practicalTakeaway}
                      </p>
                    </div>
                  )}
                </div>
              ) : aiActiveTab === "simplify" ? (
                <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    Accessible Modern Rendering
                  </span>
                  <p className="whitespace-pre-wrap text-stone-800 leading-relaxed font-sans">
                    {aiData.simplify?.simplifiedText || "Generating simplification..."}
                  </p>
                </div>
              ) : aiActiveTab === "sanskrit_terms" ? (
                <div className="space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Key Sanskrit Terms & Philosophical Root Meanings
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(aiData.sanskrit_terms?.terms || []).map((term, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900 text-sm font-serif">
                            {term.term}
                          </span>
                          <span className="text-xs font-serif text-amber-900 font-semibold bg-amber-100/60 px-2 py-0.5 rounded-md">
                            {term.devanagari}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">
                          {term.meaning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : aiActiveTab === "concepts" ? (
                <div className="space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Astrological & Yogic Concepts Identified
                  </span>
                  <div className="space-y-2">
                    {aiData.concepts?.concepts?.planets?.length > 0 && (
                      <div className="text-xs">
                        <span className="font-bold text-stone-700">Planets (Grahas): </span>
                        <span className="text-stone-600">
                          {aiData.concepts.concepts.planets.join(", ")}
                        </span>
                      </div>
                    )}
                    {aiData.concepts?.concepts?.houses?.length > 0 && (
                      <div className="text-xs">
                        <span className="font-bold text-stone-700">Houses (Bhavas): </span>
                        <span className="text-stone-600">
                          House {aiData.concepts.concepts.houses.join(", House ")}
                        </span>
                      </div>
                    )}
                    {aiData.concepts?.concepts?.chakras?.length > 0 && (
                      <div className="text-xs">
                        <span className="font-bold text-stone-700">Chakras / Nadis: </span>
                        <span className="text-stone-600">
                          {aiData.concepts.concepts.chakras.join(", ")}
                        </span>
                      </div>
                    )}
                    {aiData.concepts?.concepts?.yogas?.length > 0 && (
                      <div className="text-xs">
                        <span className="font-bold text-stone-700">Classical Yogas: </span>
                        <span className="text-stone-600">
                          {aiData.concepts.concepts.yogas.join(", ")}
                        </span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] text-stone-500 font-mono">Shastric Knowledge Graph</span>
                      <Link
                        href="/explore"
                        target="_blank"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition"
                      >
                        <Network className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Explore in Knowledge Graph</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : aiActiveTab === "related_passages" ? (
                <div className="space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Related Classical Manuscript Passages
                  </span>
                  {(aiData.related_passages?.passages || []).length === 0 ? (
                    <p className="text-xs text-stone-500 italic">No direct cross-scripture passages located.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {(aiData.related_passages?.passages || []).map((rel, rIdx) => (
                        <div
                          key={rIdx}
                          className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-900 font-serif">
                              {rel.bookTitle} ({rel.author})
                            </span>
                            <span className="text-[10px] text-stone-500 font-mono">
                              Ch. {rel.chapterTitle} • Pg {rel.sourcePage || "Folio"}
                            </span>
                          </div>
                          <p className="text-stone-700 italic font-serif line-clamp-2">
                            "{rel.snippet}"
                          </p>
                          <Link
                            href={rel.readerUrl || `/library/${rel.bookSlug}`}
                            className="inline-flex items-center gap-1 text-[11px] text-emerald-800 hover:underline font-bold"
                          >
                            <span>Open in Digital Reader</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : aiActiveTab === "classical_references" ? (
                <div className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Scholarly Source Citation
                  </span>
                  <div className="space-y-1 font-mono text-[11px] text-stone-700 bg-white p-3 rounded-xl border border-stone-200">
                    <p><strong>Title:</strong> {book.title}</p>
                    <p><strong>Author:</strong> {book.author || "Classical Sage"}</p>
                    <p><strong>Chapter:</strong> {chapter.title} (Chapter {chapter.chapterNumber || chapter.number || 1})</p>
                    <p><strong>Source Page:</strong> {activeAiPassage.sourcePage || "Manuscript Folio"}</p>
                    <p><strong>Tradition:</strong> Classical Vedic / Shastric Literature</p>
                    <p><strong>Digital Catalog ID:</strong> {activeAiPassage.id}</p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-stone-400 italic font-serif">
                Grounded in Gurukul Shastric Digital Library
              </span>
              <button
                type="button"
                onClick={() => setActiveAiPassage(null)}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
