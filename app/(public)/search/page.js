"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  BookOpen,
  ArrowRight,
  Loader2,
  X,
  Filter,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";

const SUGGESTED_QUERIES = [
  "सूर्य",
  "गुरु",
  "शनि",
  "॥ अथ",
  "Jupiter",
  "लग्न",
  "राहु-केतु",
  "कालचक्र",
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [timingMs, setTimingMs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  // Debounce input (350ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1); // Reset to page 1 on new query
    }, 350);

    return () => clearTimeout(handler);
  }, [query]);

  // Execute Search
  const performSearch = useCallback(async (q, lang, type, pageNum) => {
    if (!q) {
      setResults([]);
      setTotal(0);
      setTotalPages(0);
      setSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setSearched(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q,
        page: pageNum.toString(),
        limit: "15",
      });

      if (lang && lang !== "all") params.set("language", lang);
      if (type && type !== "ALL") params.set("passageType", type);

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error("Search request failed");

      const data = await res.json();
      setResults(data.results || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 0);
      setTimingMs(data.timingMs || 0);
    } catch (err) {
      console.error("Search error:", err);
      setError("Unable to complete search. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger search on query, filter, or page change
  useEffect(() => {
    performSearch(debouncedQuery, languageFilter, typeFilter, page);
  }, [debouncedQuery, languageFilter, typeFilter, page, performSearch]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    performSearch(query.trim(), languageFilter, typeFilter, 1);
  };

  const handleSuggestionClick = (term) => {
    setQuery(term);
  };

  const clearQuery = () => {
    setQuery("");
    setDebouncedQuery("");
    setResults([]);
    setSearched(false);
  };

  // Highlight query term in text
  const renderHighlightedSnippet = (snippet, targetQuery) => {
    if (!targetQuery) return snippet;
    const parts = snippet.split(new RegExp(`(${targetQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === targetQuery.toLowerCase() ? (
        <mark key={i} className="bg-amber-200/80 text-amber-950 font-medium px-0.5 rounded-xs">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 font-serif">
          Search Astrology Scriptures
        </h1>
        <p className="text-stone-600 text-sm max-w-xl mx-auto">
          Search verses, planetary aspects, Sanskrit shlokas, and classical astrological concepts across our library.
        </p>

        {/* Search Input Box */}
        <form onSubmit={handleManualSubmit} className="max-w-2xl mx-auto pt-3">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search scriptures... (e.g. jupiter, सूर्य, ॥ अथ, लग्न, शनि)"
              className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 bg-white shadow-xs text-sm sm:text-base font-sans transition"
            />
            {query && (
              <button
                type="button"
                onClick={clearQuery}
                className="absolute right-4 p-1 text-stone-400 hover:text-stone-700 transition"
                title="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Suggested Query Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-xs">
          <span className="text-stone-400 flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Popular:</span>
          </span>
          {SUGGESTED_QUERIES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => handleSuggestionClick(term)}
              className="px-2.5 py-1 bg-stone-100 hover:bg-amber-100/80 text-stone-700 hover:text-amber-900 rounded-full text-xs transition border border-stone-200/60"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Language Filter */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-500">Language:</span>
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
            {[
              { key: "all", label: "All" },
              { key: "Sanskrit", label: "Sanskrit" },
              { key: "Hindi", label: "Hindi" },
              { key: "English", label: "English" },
            ].map((lang) => (
              <button
                key={lang.key}
                onClick={() => {
                  setLanguageFilter(lang.key);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  languageFilter === lang.key
                    ? "bg-white text-stone-900 shadow-xs font-semibold"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Passage Type Filter */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-500">Content Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="bg-stone-50 border border-stone-200 text-stone-700 py-1.5 px-2.5 rounded-xl font-medium focus:outline-none focus:border-amber-600"
          >
            <option value="ALL">All Types</option>
            <option value="VERSE">Verses & Shlokas</option>
            <option value="HEADING">Chapter Headings</option>
            <option value="PARAGRAPH">Paragraphs</option>
          </select>
        </div>
      </div>

      {/* Search Status & Count Bar */}
      {searched && (
        <div className="flex items-center justify-between text-xs text-stone-500 px-1">
          <span>
            Found <strong className="text-stone-900 font-semibold">{total}</strong> results for &ldquo;
            <span className="text-amber-800 font-medium">{debouncedQuery}</span>&rdquo;
            {timingMs > 0 && <span className="ml-2 font-mono">({timingMs}ms)</span>}
          </span>

          {totalPages > 1 && (
            <span>
              Page {page} of {totalPages}
            </span>
          )}
        </div>
      )}

      {/* Results Content Area */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
            <Loader2 className="w-8 h-8 text-amber-700 animate-spin mx-auto mb-3" />
            <p className="text-stone-600 text-sm font-medium">Searching scripture manuscripts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-sm">
            <p>{error}</p>
          </div>
        ) : !searched ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 space-y-2">
            <BookOpen className="w-10 h-10 text-stone-300 mx-auto opacity-70" />
            <p className="text-stone-600 text-sm font-medium">Enter an astrological term or verse snippet above</p>
            <p className="text-stone-400 text-xs">Supports English, Hindi, and Sanskrit Devanagari script</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 space-y-2">
            <p className="text-stone-700 text-base font-medium">No scripture passages found matching your query</p>
            <p className="text-stone-400 text-xs max-w-sm mx-auto">
              Try simplifying your query, checking spelling, or switching language filters.
            </p>
          </div>
        ) : (
          results.map((res) => (
            <article
              key={res.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs hover:border-amber-300 transition space-y-3"
            >
              {/* Result Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-stone-900">{res.bookTitle}</span>
                  <span>•</span>
                  <span className="text-stone-600">{res.chapterTitle}</span>
                  {res.passageType === "VERSE" && (
                    <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-md">
                      Verse
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                    {res.language}
                  </span>
                  {res.sourcePage && <span>Page {res.sourcePage}</span>}
                </div>
              </div>

              {/* Context Snippet */}
              <p className="text-stone-800 text-sm sm:text-base leading-relaxed font-serif">
                &ldquo;{renderHighlightedSnippet(res.snippet, debouncedQuery)}&rdquo;
              </p>

              {/* Action Link */}
              {res.readerUrl && (
                <div className="pt-2 flex justify-end">
                  <Link
                    href={res.readerUrl}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 transition group"
                  >
                    <span>Read in Reader</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              )}
            </article>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-stone-200 text-xs">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 font-semibold text-stone-700 transition disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-stone-500 font-mono">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold transition shadow-xs disabled:opacity-40"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
