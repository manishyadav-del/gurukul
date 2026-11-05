"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Users,
  BookOpen,
  HelpCircle,
  GraduationCap,
  Mail,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  X,
} from "lucide-react";

export default function GlobalSearchAdminClient({ initialQuery = "" }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const performSearch = async (term) => {
    if (!term || term.length < 2) {
      setResults(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(term)}`);
      if (res.ok) {
        const json = await res.json();
        setResults(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    router.push(`/admin/search?q=${encodeURIComponent(query)}`);
    performSearch(query);
  };

  const hasResults = results && results.totalMatches > 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2 py-4">
        <div className="w-12 h-12 rounded-2xl bg-[#13382c] text-[#d4a359] mx-auto flex items-center justify-center font-serif text-2xl font-bold shadow-md">
          <Search className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold font-serif text-stone-900">
          Global Administrative Search
        </h1>
        <p className="text-xs text-stone-500">
          Search users, manuscripts, chapters, quizzes, curriculum modules, and operational incidents.
        </p>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length >= 2) performSearch(e.target.value);
            else setResults(null);
          }}
          placeholder="Type to search across the entire platform (e.g. Parashara, Admin, Gita, Navamsha)..."
          className="w-full pl-12 pr-12 py-3.5 text-sm rounded-2xl border border-stone-300 shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#13382c]"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults(null);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </form>

      {/* Loading Indicator */}
      {loading && (
        <div className="py-6 text-center text-xs text-stone-400 animate-pulse">
          Searching PostgreSQL across multiple entities...
        </div>
      )}

      {/* Results Categories */}
      {results && !loading && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-200">
            <span>
              Found <strong className="text-stone-900">{results.totalMatches}</strong> match(es) for "{results.query}"
            </span>
          </div>

          {!hasResults ? (
            <div className="p-8 text-center text-xs text-stone-400 bg-white rounded-3xl border border-stone-200">
              No matching records found. Try a different search term or check spelling.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Users */}
              {results.results.users?.length > 0 && (
                <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
                  <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-700" />
                    <span>Users ({results.results.users.length})</span>
                  </h3>
                  <div className="divide-y divide-stone-100 text-xs">
                    {results.results.users.map((u) => (
                      <Link
                        key={u.id}
                        href={`/admin/users`}
                        className="py-2.5 flex items-center justify-between hover:bg-stone-50 rounded-xl px-2 transition"
                      >
                        <div>
                          <p className="font-bold text-stone-900">{u.name || "Anonymous"}</p>
                          <p className="text-[11px] text-stone-400 font-mono">{u.email}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full font-mono text-[10px] bg-stone-100 text-stone-700">
                          {u.role}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Books */}
              {results.results.books?.length > 0 && (
                <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
                  <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-700" />
                    <span>Books & Manuscripts ({results.results.books.length})</span>
                  </h3>
                  <div className="divide-y divide-stone-100 text-xs">
                    {results.results.books.map((b) => (
                      <Link
                        key={b.id}
                        href={`/admin/books/${b.id}`}
                        className="py-2.5 flex items-center justify-between hover:bg-stone-50 rounded-xl px-2 transition"
                      >
                        <div>
                          <p className="font-bold text-stone-900">{b.title}</p>
                          <p className="text-[11px] text-stone-400">{b.author || "Unknown author"}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                          {b.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Chapters */}
              {results.results.chapters?.length > 0 && (
                <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
                  <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-700" />
                    <span>Chapters ({results.results.chapters.length})</span>
                  </h3>
                  <div className="divide-y divide-stone-100 text-xs">
                    {results.results.chapters.map((ch) => (
                      <Link
                        key={ch.id}
                        href={`/admin/books/${ch.book?.id}/structure`}
                        className="py-2.5 flex items-center justify-between hover:bg-stone-50 rounded-xl px-2 transition"
                      >
                        <div>
                          <p className="font-bold text-stone-900">{ch.title}</p>
                          <p className="text-[11px] text-stone-400">Book: {ch.book?.title} (Ch #{ch.chapterNumber})</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Quizzes */}
              {results.results.quizzes?.length > 0 && (
                <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
                  <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-purple-700" />
                    <span>Quizzes ({results.results.quizzes.length})</span>
                  </h3>
                  <div className="divide-y divide-stone-100 text-xs">
                    {results.results.quizzes.map((q) => (
                      <Link
                        key={q.id}
                        href={`/admin/quizzes`}
                        className="py-2.5 flex items-center justify-between hover:bg-stone-50 rounded-xl px-2 transition"
                      >
                        <div>
                          <p className="font-bold text-stone-900">{q.title}</p>
                          <p className="text-[11px] text-stone-400">Topic: {q.topic || "Astrology"}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-100 text-purple-800 font-bold">
                          {q.difficulty}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Modules */}
              {results.results.learningModules?.length > 0 && (
                <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
                  <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-teal-700" />
                    <span>Learning Modules ({results.results.learningModules.length})</span>
                  </h3>
                  <div className="divide-y divide-stone-100 text-xs">
                    {results.results.learningModules.map((m) => (
                      <Link
                        key={m.id}
                        href={`/admin/learn`}
                        className="py-2.5 flex items-center justify-between hover:bg-stone-50 rounded-xl px-2 transition"
                      >
                        <div>
                          <p className="font-bold text-stone-900">{m.title}</p>
                          <p className="text-[11px] text-stone-400 font-mono">/{m.slug}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-stone-100 text-stone-700">
                          {m.category}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
