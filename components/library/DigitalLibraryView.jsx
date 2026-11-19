"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  BookOpen,
  Bookmark,
  Clock,
  Flame,
  Sparkles,
  Users,
  Layers,
  Search,
  Filter,
  ArrowRight,
  RotateCcw,
  BookMarked,
  FileText,
  Compass,
  Star,
  CheckCircle2,
  ChevronRight,
  SlidersHorizontal,
  X,
  Info,
  ExternalLink,
  Menu,
  Sliders,
  Eye,
  Languages,
  Network,
  Grid,
  LayoutGrid,
} from "lucide-react";
import LibraryHero from "./LibraryHero.jsx";
import AncientShastraCollections from "./AncientShastraCollections.jsx";
import BrowseByKnowledgeCategory from "./BrowseByKnowledgeCategory.jsx";
import RecommendedForYouSection from "./RecommendedForYouSection.jsx";
import LibraryKnowledgeDiscovery from "./LibraryKnowledgeDiscovery.jsx";
import SubjectBasedCollections from "./SubjectBasedCollections.jsx";
import FeaturedClassicalLiterature from "./FeaturedClassicalLiterature.jsx";
import EditorialShelf from "./EditorialShelf.jsx";
import BookPresentation3D from "./BookPresentation3D.jsx";
import PalmLeafCard from "./PalmLeafCard.jsx";
import MinimalBookModal from "./MinimalBookModal.jsx";
import { ShlokaDivider, OmSeal } from "./VedicOrnament.jsx";

/**
 * Determines a semantic category for a classical text based on title & description.
 */
function inferBookCategory(book) {
  if (book?.tradition) return book.tradition;
  const text = `${book?.title || ""} ${book?.description || ""} ${book?.script || ""}`.toLowerCase();

  if (
    text.includes("jyotish") ||
    text.includes("astrology") ||
    text.includes("hora") ||
    text.includes("samhita") ||
    text.includes("jataka") ||
    text.includes("parashara") ||
    text.includes("saravali") ||
    text.includes("phaladeepika") ||
    text.includes("ग्रह") ||
    text.includes("भाव") ||
    text.includes("कुण्डली")
  ) {
    return "Jyotisha";
  }

  if (
    text.includes("chikitsa") ||
    text.includes("arogya") ||
    text.includes("ayurveda") ||
    text.includes("charaka") ||
    text.includes("sushruta") ||
    text.includes("चिकित्सा") ||
    text.includes("आरोग्य")
  ) {
    return "Ayurveda";
  }

  if (
    text.includes("veda") ||
    text.includes("rig") ||
    text.includes("yajur") ||
    text.includes("sama") ||
    text.includes("atharva") ||
    text.includes("वेद") ||
    text.includes("ऋग्वेद")
  ) {
    return "Vedas";
  }

  if (text.includes("upanishad") || text.includes("उपनिषद")) {
    return "Upanishads";
  }

  if (text.includes("yoga") || text.includes("योग") || text.includes("sutra")) {
    return "Yoga";
  }

  if (text.includes("sanskrit") || text.includes("grammar") || text.includes("व्याकरण")) {
    return "Sanskrit";
  }

  if (text.includes("numerology") || text.includes("अंक")) {
    return "Numerology";
  }

  if (text.includes("ganita") || text.includes("math") || text.includes("science") || text.includes("गणित")) {
    return "Vedic Science";
  }

  if (
    text.includes("gita") ||
    text.includes("purana") ||
    text.includes("darshana") ||
    text.includes("philosophy") ||
    text.includes("पुराण")
  ) {
    return "Philosophy";
  }

  return "Shastra";
}

/**
 * Procedural manuscript cover palette generator for books without an uploaded cover image.
 */
function RecommendationShelf({ title, icon: Icon, books = [], badge = "Recommendation", onInfo }) {
  if (!books || books.length === 0) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-amber-700" />}
          <h2 className="text-lg font-bold font-serif text-stone-900">{title}</h2>
        </div>
        <span className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md font-medium">
          {badge}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((item, idx) => (
          <div
            key={item.id || idx}
            className="bg-white rounded-2xl border border-[#E8DED2] p-4 shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
          >
            <div className="flex gap-3.5 items-start">
              <div
                onClick={() => onInfo(item)}
                className="w-16 h-22 shrink-0 cursor-pointer"
              >
                <ManuscriptCoverCard book={item} index={idx} />
              </div>
              <div className="flex-1 min-w-0 space-y-1.5">
                <span className="inline-block text-xs uppercase font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-sm">
                  {item.language || "Sanskrit"}
                </span>
                <h3
                  onClick={() => onInfo(item)}
                  className="font-serif font-bold text-sm text-stone-900 group-hover:text-[#D05C3B] line-clamp-2 cursor-pointer"
                >
                  {item.title}
                </h3>
                <p className="text-xs text-stone-600 font-medium truncate">
                  By {item.author || "Ancient Sage"}
                </p>
                {item.reason && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-1.5">
                    <p className="text-xs text-amber-950 leading-relaxed line-clamp-2 flex items-start gap-1 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>{item.reason}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between mt-3 text-xs">
              <button
                onClick={() => onInfo(item)}
                className="text-stone-500 hover:text-stone-900 font-medium underline"
              >
                Details
              </button>
              <Link
                href={item.readerUrl || `/library/${item.slug || item.bookId || item.id}/pdf`}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-[#D05C3B] hover:bg-[#bc4f30] px-3 py-1.5 rounded-lg shadow-xs transition"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Read</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Procedural manuscript cover palette generator for books without an uploaded cover image.
 */
const COVER_PALETTES = [
  { bg: "from-stone-900 via-[#13382c] to-[#0a1e17]", border: "border-[#d4a359]/40", text: "text-[#f3e5ab]", badge: "bg-[#d4a359]/20 text-[#f3e5ab]" },
  { bg: "from-[#2b1810] via-[#4a2417] to-[#1c0d08]", border: "border-amber-500/40", text: "text-amber-100", badge: "bg-amber-500/20 text-amber-200" },
  { bg: "from-[#111827] via-[#1e293b] to-[#0f172a]", border: "border-sky-400/30", text: "text-slate-100", badge: "bg-sky-400/20 text-sky-200" },
  { bg: "from-[#2e1021] via-[#47122b] to-[#1c0612]", border: "border-rose-400/30", text: "text-rose-100", badge: "bg-rose-400/20 text-rose-200" },
];

function ManuscriptCoverCard({ book, index = 0, editionCount = 1 }) {
  const palette = COVER_PALETTES[index % COVER_PALETTES.length];
  const coverSrc = book.coverUrl || book.coverImageUrl;

  if (coverSrc && coverSrc.startsWith("http")) {
    return (
      <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-stone-900 border border-stone-200/80 shadow-md group-hover:shadow-xl group-hover:scale-[1.02] transition-all">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverSrc}
          alt={book.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {editionCount > 1 && (
          <span className="absolute top-2 right-2 bg-amber-500/90 text-stone-900 text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
            {editionCount} Editions
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Open Reader</span>
          </span>
        </div>
      </div>
    );
  }

  // Authentic Vedic Manuscript Jacket Fallback
  return (
    <div
      className={`relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-gradient-to-br ${palette.bg} border ${palette.border} p-3.5 flex flex-col justify-between shadow-md group-hover:shadow-xl group-hover:scale-[1.02] transition-all select-none`}
    >
      {/* Decorative Ornate Borders */}
      <div className="absolute inset-1.5 border border-dashed border-amber-400/20 rounded-lg pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-xs tracking-wider uppercase font-bold text-amber-200 font-mono">
          {book.language || "Sanskrit"}
        </span>
        {editionCount > 1 ? (
          <span className="bg-amber-400/25 border border-amber-300/50 text-amber-100 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {editionCount} Eds
          </span>
        ) : (
          <span className="text-amber-300 font-serif text-sm font-bold">ॐ</span>
        )}
      </div>

      {/* Center Title & Script */}
      <div className="relative z-10 my-auto text-center px-1">
        <div className="w-6 h-0.5 bg-amber-400/50 mx-auto mb-2 rounded-full" />
        <h4 className={`font-serif font-bold text-xs sm:text-sm ${palette.text} line-clamp-3 leading-snug drop-shadow-sm`}>
          {book.title}
        </h4>
        {book.script && (
          <p className="text-xs text-amber-100 font-serif mt-1 italic line-clamp-1 font-medium">
            {book.script}
          </p>
        )}
        <div className="w-6 h-0.5 bg-amber-400/50 mx-auto mt-2 rounded-full" />
      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 pt-2 border-t border-amber-400/20 flex items-center justify-between text-xs text-stone-200">
        <span className="truncate max-w-[90px] text-stone-100 font-medium">
          {book.author || "Classical Text"}
        </span>
        {book.pageCount ? (
          <span className="font-mono text-amber-200 font-bold">{book.pageCount}p</span>
        ) : (
          <span className="text-amber-300/80">Vedic Shastra</span>
        )}
      </div>
    </div>
  );
}

/**
 * Minimal Book-First Modal & On-Demand Knowledge Exploration
 */
function BookInfoModal({ book, onClose }) {
  return <MinimalBookModal book={book} onClose={onClose} />;
}

export default function DigitalLibraryView({
  initialBooks = [],
  initialProgress = [],
  initialRecommendations = null,
  isAuthenticated = false,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Read initial values from URL query parameters
  const initialQ = searchParams?.get("q") || "";
  const initialSidebar = searchParams?.get("sidebar") || "all-books";
  const initialCategory = searchParams?.get("category") || "All";
  const initialLanguage = searchParams?.get("lang") || "All";
  const initialSort = searchParams?.get("sort") || "newest";
  const initialDedup = searchParams?.get("dedup") !== "false";

  // Interactive UI states
  const [searchInputValue, setSearchInputValue] = useState(initialQ);
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedSidebar, setSelectedSidebar] = useState(initialSidebar);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [sortBy, setSortBy] = useState(initialSort);
  const [deduplicateTitles, setDeduplicateTitles] = useState(initialDedup);
  const [cardPresentationStyle, setCardPresentationStyle] = useState("3D"); // "3D" | "PALM" | "COMPACT"

  // Deep full-text search state
  const [deepSearchEnabled, setDeepSearchEnabled] = useState(false);
  const [deepSearchResults, setDeepSearchResults] = useState(null);
  const [isDeepSearching, setIsDeepSearching] = useState(false);

  // Modal inspection state
  const [selectedBookForInfo, setSelectedBookForInfo] = useState(null);

  // Mobile navigation drawer toggle
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sync state to URL params cleanly
  const updateUrlParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams ? searchParams.toString() : "");

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === "All" || value === "all-books" || value === "newest" || (key === "dedup" && value === true)) {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", targetUrl);
      }
    },
    [searchParams, pathname]
  );

  // Debounce search query update by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInputValue);
      updateUrlParams({ q: searchInputValue.trim() });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchInputValue, updateUrlParams]);

  // Deep search query runner when enabled
  useEffect(() => {
    if (!deepSearchEnabled || !searchQuery.trim()) {
      setDeepSearchResults(null);
      return;
    }

    let isSubscribed = true;
    setIsDeepSearching(true);

    fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}&limit=20`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Search failed"))))
      .then((data) => {
        if (isSubscribed) {
          setDeepSearchResults(data);
          setIsDeepSearching(false);
        }
      })
      .catch((err) => {
        console.warn("Deep search request error:", err);
        if (isSubscribed) {
          setDeepSearchResults(null);
          setIsDeepSearching(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [deepSearchEnabled, searchQuery]);

  const sidebarNav = [
    { id: "all-books", label: "All Manuscripts", icon: BookOpen },
    { id: "recommended", label: "Recommended for You", icon: Sparkles },
    { id: "continue-reading", label: "Continue Reading", icon: Clock },
    { id: "featured", label: "Featured Canons", icon: Flame },
    { id: "astrology", label: "Jyotish & Astrology", icon: Compass },
    { id: "ayurveda", label: "Ayurveda & Health", icon: Layers },
    { id: "philosophy", label: "Philosophy & Darshana", icon: Sparkles },
  ];

  const categories = [
    "All",
    "Jyotisha",
    "Shastra",
    "Vedas",
    "Upanishads",
    "Sanskrit",
    "Philosophy",
    "Yoga",
    "Ayurveda",
    "Numerology",
    "Vedic Science",
  ];

  const languages = ["All", "Sanskrit", "Hindi", "English"];

  // Enrich real books with inferred categories
  const booksWithCategory = useMemo(() => {
    return initialBooks.map((b) => ({
      ...b,
      category: inferBookCategory(b),
    }));
  }, [initialBooks]);

  // Group or deduplicate books by title if enabled
  const processedBooks = useMemo(() => {
    if (!deduplicateTitles) {
      return booksWithCategory.map((b) => ({ ...b, editionCount: 1 }));
    }

    const titleMap = new Map();
    booksWithCategory.forEach((b) => {
      const normalizedTitle = (b.title || "").trim().toLowerCase();
      if (!titleMap.has(normalizedTitle)) {
        titleMap.set(normalizedTitle, []);
      }
      titleMap.get(normalizedTitle).push(b);
    });

    const deduped = [];
    titleMap.forEach((editions) => {
      // Pick the edition with the highest page count or most recent
      const best = [...editions].sort(
        (a, b) => (b.pageCount || 0) - (a.pageCount || 0) || new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      )[0];
      deduped.push({
        ...best,
        editionCount: editions.length,
      });
    });

    return deduped;
  }, [booksWithCategory, deduplicateTitles]);

  // Featured books (curated by pageCount or classical significance)
  const featuredBooks = useMemo(() => {
    return [...processedBooks]
      .filter((b) => (b.pageCount && b.pageCount >= 3) || b.author)
      .slice(0, 4);
  }, [processedBooks]);

  const primaryFeaturedBook = useMemo(() => {
    return (
      processedBooks.find((b) => (b.title || "").toLowerCase().includes("brihat jataka")) ||
      processedBooks.find((b) => (b.title || "").toLowerCase().includes("brihat parashara")) ||
      processedBooks.find((b) => (b.pageCount || 0) > 100) ||
      featuredBooks[0] ||
      processedBooks[0] ||
      null
    );
  }, [processedBooks, featuredBooks]);

  const astrologyBooks = useMemo(() => {
    return processedBooks.filter((b) => b.category === "Astrology").slice(0, 10);
  }, [processedBooks]);

  const palmLeafBooks = useMemo(() => {
    return processedBooks.slice(0, 6);
  }, [processedBooks]);

  // Filtered & Sorted books
  const filteredBooks = useMemo(() => {
    return processedBooks
      .filter((book) => {
        // Sidebar quick category filtering
        if (selectedSidebar === "astrology" && !["Jyotisha", "Astrology"].includes(book.category)) return false;
        if (selectedSidebar === "ayurveda" && book.category !== "Ayurveda") return false;
        if (selectedSidebar === "philosophy" && !["Philosophy", "Vedas", "Upanishads", "Yoga"].includes(book.category)) return false;
        if (selectedSidebar === "featured") {
          const isFeatured = (book.pageCount && book.pageCount >= 3) || (book.author && book.author !== "Unknown");
          if (!isFeatured) return false;
        }

        // Category filter
        if (selectedCategory !== "All" && book.category !== selectedCategory) {
          return false;
        }

        // Language filter
        if (selectedLanguage !== "All") {
          const bLang = (book.language || "").toLowerCase();
          const targetLang = selectedLanguage.toLowerCase();
          if (!bLang.includes(targetLang)) return false;
        }

        // Search Query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = (book.title || "").toLowerCase().includes(q);
          const matchAuthor = (book.author || "").toLowerCase().includes(q);
          const matchDesc = (book.description || "").toLowerCase().includes(q);
          const matchScript = (book.script || "").toLowerCase().includes(q);
          const matchCategory = (book.category || "").toLowerCase().includes(q);

          // If deep search has results, also match book IDs from deep results
          const matchDeepBook = deepSearchResults?.passages?.some((p) => p.chapter?.bookId === book.id);

          if (!matchTitle && !matchAuthor && !matchDesc && !matchScript && !matchCategory && !matchDeepBook) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "title") {
          return (a.title || "").localeCompare(b.title || "");
        }
        if (sortBy === "pages") {
          return (b.pageCount || 0) - (a.pageCount || 0);
        }
        // Default newest
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
  }, [processedBooks, selectedCategory, selectedLanguage, selectedSidebar, searchQuery, sortBy, deepSearchResults]);

  // Handle sidebar navigation selection
  const handleSelectSidebar = (id) => {
    setSelectedSidebar(id);
    setMobileSidebarOpen(false);

    if (id === "all-books") {
      setSelectedCategory("All");
      updateUrlParams({ sidebar: null, category: null });
    } else if (id === "astrology") {
      setSelectedCategory("Astrology");
      updateUrlParams({ sidebar: id, category: "Astrology" });
    } else if (id === "ayurveda") {
      setSelectedCategory("Ayurveda");
      updateUrlParams({ sidebar: id, category: "Ayurveda" });
    } else if (id === "philosophy") {
      setSelectedCategory("Philosophy");
      updateUrlParams({ sidebar: id, category: "Philosophy" });
    } else {
      updateUrlParams({ sidebar: id });
    }
  };

  // Reset all search and filtering controls
  const handleResetFilters = () => {
    setSearchInputValue("");
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedLanguage("All");
    setSelectedSidebar("all-books");
    setSortBy("newest");
    setDeepSearchEnabled(false);
    updateUrlParams({
      q: null,
      sidebar: null,
      category: null,
      lang: null,
      sort: null,
    });
  };

  return (
    <div className="bg-[#F7F5F0] min-h-screen py-6 sm:py-8 text-[#30251F]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* 1. Immersive Library Hero (Shown when in all-books and no active search query) */}
        {primaryFeaturedBook && selectedSidebar === "all-books" && !searchQuery.trim() ? (
          <LibraryHero
            featuredBook={primaryFeaturedBook}
            onOpenDetails={setSelectedBookForInfo}
          />
        ) : (
          /* Editorial Header Banner when searching or filtering */
          <div className="bg-gradient-to-r from-[#241711] via-[#30251F] to-[#1c120c] rounded-3xl p-6 sm:p-8 text-[#F7F5F0] shadow-lg border border-[#E8DED2]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#D05C3B]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-2 max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D05C3B]/20 border border-[#D05C3B]/40 text-[#F2B872] text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#F2B872]" />
                <span>गुरुकुल डिजिटल ग्रन्थागार • Classical Vedic Library</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold font-serif tracking-tight text-[#F7F5F0]">
                Sacred Shastras &amp; Digitized Manuscripts
              </h1>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Explore {processedBooks.length} classical works ({initialBooks.length} editions) digitized with dual-layer OCR, interactive Devanagari translation, chapter navigation, and dual-page manuscript reading.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
              <Link
                href="/explore"
                className="bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold rounded-2xl px-4 py-3 text-center shadow-lg transition flex items-center gap-2 text-xs"
              >
                <Network className="w-4 h-4 text-[#F2B872]" />
                <span>Knowledge Graph</span>
              </Link>

              <Link
                href="/research"
                className="bg-[#D05C3B] hover:bg-[#bc4f30] text-white font-bold rounded-2xl px-4 py-3 text-center shadow-lg transition flex items-center gap-2 text-xs"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>AI Research Assistant</span>
              </Link>
            </div>
          </div>
        )}

        {/* 2. Ancient Astrology & Shastra Collections (Horizontal scroll shelf) */}
        {selectedSidebar === "all-books" && !searchQuery.trim() && (
          <AncientShastraCollections
            title="Ancient Astrology & Shastra Collections"
            subtitle="Authoritative foundational classical texts on planetary mathematics, bhavas, and predictive horoscopy"
            badge="Classical Shastras"
            books={processedBooks}
            onOpenDetails={setSelectedBookForInfo}
          />
        )}

        {/* 3. Browse by Knowledge Category (10 subjects grid with dynamic counts & filters) */}
        {selectedSidebar === "all-books" && !searchQuery.trim() && (
          <BrowseByKnowledgeCategory
            books={processedBooks}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              updateUrlParams({ category: cat });
            }}
          />
        )}

        {/* 4. Recommended for You (Personalized study recommendations) */}
        {selectedSidebar === "all-books" && !searchQuery.trim() && (
          <RecommendedForYouSection
            recommendations={initialRecommendations}
            fallbackBooks={processedBooks}
            isAuthenticated={isAuthenticated}
            onOpenDetails={setSelectedBookForInfo}
          />
        )}

        {/* 5. Knowledge Discovery (Dark editorial manuscript vault) */}
        {selectedSidebar === "all-books" && !searchQuery.trim() && (
          <LibraryKnowledgeDiscovery />
        )}

        {/* 6. Subject-based Book Collections (Astrology, Ayurveda, Yoga & Philosophy, Vedas & Upanishads) */}
        {selectedSidebar === "all-books" && !searchQuery.trim() && (
          <SubjectBasedCollections
            books={processedBooks}
            onOpenDetails={setSelectedBookForInfo}
          />
        )}

        {/* 7. Featured Classical Literature (Larger editorial book cards) */}
        {featuredBooks.length > 0 && selectedSidebar === "all-books" && !searchQuery.trim() && (
          <FeaturedClassicalLiterature
            books={featuredBooks}
            onOpenDetails={setSelectedBookForInfo}
          />
        )}

        {/* Continue Reading Empty State when in Continue Reading sidebar */}
        {selectedSidebar === "continue-reading" && initialProgress.length === 0 && (
          <div className="bg-white rounded-3xl border border-[#E8DED2] p-8 sm:p-12 text-center space-y-4">
            <Clock className="w-12 h-12 mx-auto text-[#D05C3B]/60" />
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-serif font-bold text-[#30251F]">
                No Books in Progress Yet
              </h3>
              <p className="text-xs sm:text-sm text-[#30251F]/70 leading-relaxed">
                {isAuthenticated
                  ? "Select any classical Shastra from the library and start reading. Your progress, bookmarks, and last-read page will automatically be tracked here."
                  : "Sign in to track your reading progress, bookmark sacred verses, and resume reading on any device."}
              </p>
            </div>
            <button
              onClick={() => handleSelectSidebar("all-books")}
              className="px-5 py-2.5 rounded-xl bg-[#D05C3B] hover:bg-[#bc4f30] text-white text-xs font-semibold shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse All Manuscripts</span>
            </button>
          </div>
        )}

        {/* Mobile Navigation Toggle Button */}
        <div className="lg:hidden flex items-center justify-between bg-white rounded-2xl p-3 border border-[#E8DED2]">
          <span className="text-xs font-semibold text-[#30251F]">
            Active: <strong className="text-[#D05C3B]">{sidebarNav.find((s) => s.id === selectedSidebar)?.label}</strong>
          </span>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#30251F] text-white text-xs font-semibold"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Navigation &amp; Filters</span>
          </button>
        </div>

        {/* Main Library Exploration Grid & Filtering */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Category Sidebar */}
          <aside
            className={`lg:col-span-3 xl:col-span-2 space-y-3 ${
              mobileSidebarOpen ? "block" : "hidden lg:block"
            }`}
          >
            <div className="bg-white rounded-2xl border border-[#E8DED2] p-3 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-3 py-1.5 block">
                Library Sections
              </span>
              {sidebarNav.map((item) => {
                const Icon = item.icon;
                const isActive = selectedSidebar === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectSidebar(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition text-left cursor-pointer ${
                      isActive
                        ? "bg-[#30251F] text-white shadow-xs font-semibold"
                        : "text-stone-700 hover:bg-[#F7F5F0] hover:text-[#D05C3B]"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-[#D05C3B]" : "text-stone-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Stats Panel */}
            <div className="bg-[#F7F5F0] rounded-2xl border border-[#E8DED2] p-4 text-xs space-y-2 text-[#30251F]/80">
              <span className="font-semibold text-[#30251F] block">Digital Manuscripts</span>
              <p className="text-[11px] text-[#30251F]/60 leading-relaxed">
                All books are processed directly via Gurukul&apos;s OCR pipeline preserving Sanskrit Dandās (।, ॥), Vedic accents, and original page layouts.
              </p>
            </div>
          </aside>

          {/* Main Book Listing Area */}
          <main className="lg:col-span-9 xl:col-span-10 space-y-5">
            {/* Search, Language & Sort Controls */}
            <div className="bg-white rounded-2xl border border-[#E8DED2] p-4 shadow-2xs space-y-4">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Input Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchInputValue}
                    onChange={(e) => setSearchInputValue(e.target.value)}
                    placeholder="Search by title, author, Sanskrit shloka term, or subject..."
                    className="w-full bg-[#F7F5F0] text-[#30251F] placeholder-stone-400 text-xs sm:text-sm pl-10 pr-20 py-2.5 rounded-xl border border-[#E8DED2] focus:outline-hidden focus:ring-2 focus:ring-[#D05C3B]/40"
                  />
                  {searchInputValue && (
                    <button
                      onClick={() => setSearchInputValue("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-semibold cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Language Pills */}
                <div className="inline-flex rounded-xl border border-[#E8DED2] bg-[#F7F5F0] p-1 text-xs font-medium self-start sm:self-auto shrink-0">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        setSelectedLanguage(lang);
                        updateUrlParams({ lang });
                      }}
                      className={`px-3 py-1.5 rounded-lg transition cursor-pointer text-xs ${
                        selectedLanguage === lang
                          ? "bg-[#30251F] text-white font-semibold shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Chips & Sort Selector */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-stone-100">
                <div className="flex flex-wrap items-center gap-1.5">
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          updateUrlParams({ category: cat });
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer ${
                          isActive
                            ? "bg-[#D05C3B] text-white font-semibold shadow-xs"
                            : "bg-[#F7F5F0] text-stone-700 hover:bg-[#E8DED2] border border-[#E8DED2]"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>

                {/* Options: Deduplication Toggle & Sort Dropdown */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {/* Distinct Titles vs All Editions Toggle */}
                  <button
                    onClick={() => {
                      const next = !deduplicateTitles;
                      setDeduplicateTitles(next);
                      updateUrlParams({ dedup: next });
                    }}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer ${
                      deduplicateTitles
                        ? "bg-amber-50 border-amber-300 text-amber-900 font-semibold"
                        : "bg-[#F7F5F0] border-[#E8DED2] text-stone-600"
                    }`}
                    title="Toggle grouping duplicate test edition entries"
                  >
                    <span>{deduplicateTitles ? "Unique Works" : "All Editions"}</span>
                  </button>

                  {/* Deep Full-Text Search Toggle */}
                  {searchQuery.trim() && (
                    <button
                      onClick={() => setDeepSearchEnabled(!deepSearchEnabled)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition cursor-pointer ${
                        deepSearchEnabled
                          ? "bg-[#D05C3B] border-[#D05C3B] text-white font-semibold"
                          : "bg-[#F7F5F0] border-[#E8DED2] text-stone-600"
                      }`}
                      title="Search inside extracted Devanagari text & passages"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isDeepSearching ? "Searching..." : "Deep OCR Search"}</span>
                    </button>
                  )}

                  {/* Presentation Mode Selector */}
                  <div className="inline-flex rounded-xl border border-[#E8DED2] bg-[#F7F5F0] p-0.5 text-xs font-medium shrink-0">
                    <button
                      onClick={() => setCardPresentationStyle("3D")}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${
                        cardPresentationStyle === "3D"
                          ? "bg-[#30251F] text-white font-semibold shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                      title="3D Physical Book Spines"
                    >
                      3D Granthas
                    </button>
                    <button
                      onClick={() => setCardPresentationStyle("PALM")}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${
                        cardPresentationStyle === "PALM"
                          ? "bg-[#30251F] text-white font-semibold shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                      title="Palm-Leaf Manuscript View"
                    >
                      Palm-Leaf
                    </button>
                    <button
                      onClick={() => setCardPresentationStyle("COMPACT")}
                      className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${
                        cardPresentationStyle === "COMPACT"
                          ? "bg-[#30251F] text-white font-semibold shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                      title="Cover Grid View"
                    >
                      Covers
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-500 font-medium flex items-center gap-1">
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>Sort:</span>
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSortBy(val);
                        updateUrlParams({ sort: val });
                      }}
                      className="bg-[#F7F5F0] border border-[#E8DED2] rounded-lg px-2.5 py-1 text-xs text-[#30251F] font-medium focus:outline-hidden cursor-pointer"
                    >
                      <option value="newest">Recently Added</option>
                      <option value="title">Title (A-Z)</option>
                      <option value="pages">Length (Pages)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Deep Search Findings Banner */}
            {deepSearchEnabled && deepSearchResults?.passages && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>
                    Deep OCR Search found <strong>{deepSearchResults.passages.length}</strong> matching Sanskrit passages across manuscripts.
                  </span>
                </div>
                <button
                  onClick={() => setDeepSearchEnabled(false)}
                  className="text-stone-500 hover:text-stone-800 text-[11px] underline cursor-pointer"
                >
                  Disable Deep Search
                </button>
              </div>
            )}

            {/* Results Count Bar */}
            <div className="flex items-center justify-between px-1 text-xs text-stone-500">
              <span>
                Showing <strong className="text-stone-800">{filteredBooks.length}</strong> of {processedBooks.length} {deduplicateTitles ? "classical works" : "manuscripts"}
              </span>
              {searchQuery && (
                <span className="italic">
                  Filtered by &ldquo;{searchQuery}&rdquo;
                </span>
              )}
            </div>

            {/* Empty State */}
            {filteredBooks.length === 0 && (
              <div className="bg-white rounded-2xl border border-[#E8DED2] p-12 text-center space-y-4">
                <Compass className="w-12 h-12 mx-auto text-stone-400 opacity-60" />
                <div className="space-y-1">
                  <h3 className="text-base font-serif font-bold text-stone-800">
                    No manuscripts match your query
                  </h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Try adjusting your search terms, clearing category filters, or selecting &ldquo;All Languages&rdquo;.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-[#D05C3B] text-white rounded-xl text-xs font-semibold hover:bg-[#bc4f30] transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}

            {/* Dynamic Books Grid Based on Selected Presentation Style */}
            {cardPresentationStyle === "3D" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8 justify-items-center">
                {filteredBooks.map((book, idx) => (
                  <div key={book.id} className="flex flex-col items-center space-y-3 w-44 sm:w-52">
                    <BookPresentation3D
                      book={book}
                      index={idx}
                      size="md"
                      showQuickAction={true}
                      onClick={() => setSelectedBookForInfo(book)}
                    />
                    <div className="text-center w-full space-y-1">
                      <button
                        onClick={() => setSelectedBookForInfo(book)}
                        className="font-serif font-bold text-xs sm:text-sm text-stone-900 hover:text-[#D05C3B] line-clamp-1 block w-full cursor-pointer transition-colors"
                        title={book.title}
                      >
                        {book.title}
                      </button>
                      <p className="text-[11px] text-stone-500 font-serif italic truncate">
                        {book.author || "Ancient Sage"}
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-1 text-[11px]">
                        <Link
                          href={`/library/${book.slug || book.id}/pdf`}
                          className="font-semibold text-[#D05C3B] hover:underline"
                        >
                          Read
                        </Link>
                        <span className="text-stone-300">•</span>
                        <button
                          onClick={() => setSelectedBookForInfo(book)}
                          className="text-stone-500 hover:text-stone-900 cursor-pointer"
                        >
                          Dossier
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : cardPresentationStyle === "PALM" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBooks.map((book) => (
                  <PalmLeafCard
                    key={book.id}
                    book={book}
                    onOpenDetails={setSelectedBookForInfo}
                  />
                ))}
              </div>
            ) : (
              /* Compact Traditional Cover Grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredBooks.map((book, idx) => (
                  <div
                    key={book.id}
                    className="group flex flex-col bg-white rounded-2xl border border-[#E8DED2] p-2.5 shadow-2xs hover:shadow-md hover:border-[#D05C3B]/60 transition flex-1 justify-between"
                  >
                    <div
                      onClick={() => setSelectedBookForInfo(book)}
                      className="block cursor-pointer focus:outline-hidden"
                      title={`View ${book.title}`}
                    >
                      <ManuscriptCoverCard book={book} index={idx} editionCount={book.editionCount} />
                    </div>

                    <div className="mt-2.5 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
                          <span className="font-bold text-amber-900 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded">
                            {book.category}
                          </span>
                          {book.pageCount && (
                            <span className="font-mono text-xs font-semibold text-stone-700">{book.pageCount}p</span>
                          )}
                        </div>

                        <button
                          onClick={() => setSelectedBookForInfo(book)}
                          className="text-left w-full block group-hover:text-[#D05C3B] transition cursor-pointer min-h-[36px]"
                          title={book.title}
                        >
                          <h3 className="font-serif font-bold text-xs sm:text-sm text-stone-900 line-clamp-2 leading-snug">
                            {book.title}
                          </h3>
                        </button>

                        <p className="text-xs text-stone-600 font-medium line-clamp-1 mt-0.5">
                          {book.author || "Classical Author"}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1 text-[11px]">
                        <button
                          onClick={() => setSelectedBookForInfo(book)}
                          className="px-2 py-1 text-stone-500 hover:text-stone-800 transition font-medium cursor-pointer"
                          aria-label={`View Info for ${book.title}`}
                        >
                          Info
                        </button>
                        <Link
                          href={`/library/${book.slug || book.id}/pdf`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#D05C3B] hover:bg-[#bc4f30] text-white font-semibold transition shadow-2xs"
                          aria-label={`Read ${book.title}`}
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Read</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Book Quick Info Modal */}
      {selectedBookForInfo && (
        <BookInfoModal
          book={selectedBookForInfo}
          onClose={() => setSelectedBookForInfo(null)}
        />
      )}
    </div>
  );
}
