"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { BookOpen, Filter, Layers, ChevronRight } from "lucide-react";

function inferBookCategory(book) {
  if (book?.tradition) return book.tradition;
  const text = `${book?.title || ""} ${book?.description || ""} ${book?.script || ""}`.toLowerCase();
  if (text.includes("jyotish") || text.includes("astrology") || text.includes("hora"))
    return "Astrology";
  if (text.includes("ayurveda") || text.includes("chikitsa")) return "Ayurveda";
  if (text.includes("veda") || text.includes("rig") || text.includes("yajur")) return "Vedas";
  if (text.includes("gita") || text.includes("upanishad") || text.includes("purana"))
    return "Philosophy";
  if (text.includes("yoga") || text.includes("sutra")) return "Yoga";
  return "Classics";
}

const CATEGORY_META = {
  Astrology: { hi: "ज्योतिष", accent: "#7c65d4", emoji: "✦" },
  Ayurveda: { hi: "आयुर्वेद", accent: "#5aad7e", emoji: "❧" },
  Vedas: { hi: "वेद", accent: "#d4a359", emoji: "ॐ" },
  Philosophy: { hi: "दर्शन", accent: "#a455b4", emoji: "☸" },
  Yoga: { hi: "योग", accent: "#34a4d4", emoji: "✿" },
  Classics: { hi: "शास्त्र", accent: "#c4703c", emoji: "⚡" },
};

function BookCard({ book }) {
  const cover = book.coverImageUrl || book.coverUrl;

  return (
    <Link
      href={`/library/${book.slug || book.id}/pdf`}
      className="group bg-white rounded-2xl border border-[#ede5d6] overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col"
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] bg-[#0c1a14] overflow-hidden">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-white/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="absolute bottom-2 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-white bg-[#13382c]/90 px-3 py-1 rounded-full font-semibold">
            Read PDF
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-serif font-bold text-sm text-stone-900 group-hover:text-[#13382c] line-clamp-2 leading-snug">
            {book.title}
          </h4>
          {book.author && (
            <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{book.author}</p>
          )}
        </div>
        {book.pageCount && (
          <p className="text-[11px] text-stone-400 font-mono mt-2">{book.pageCount} pages</p>
        )}
      </div>
    </Link>
  );
}

function CategoryGroup({ categoryName, books }) {
  const meta = CATEGORY_META[categoryName] || { hi: categoryName, accent: "#d4a359", emoji: "✦" };

  return (
    <div className="space-y-4">
      {/* Category header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            {meta.emoji}
          </span>
          <div>
            <p className="text-xs font-medium leading-none mb-0.5" style={{ color: meta.accent }}>
              {meta.hi}
            </p>
            <h3 className="font-serif font-bold text-stone-900 text-lg leading-none">
              {categoryName}
            </h3>
          </div>
        </div>
        <Link
          href={`/library?category=${categoryName.toLowerCase()}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-[#13382c] transition-colors"
        >
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Books grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}

export default function KnowledgeCategorySection({ books = [] }) {
  const [activeFilter, setActiveFilter] = useState("All");

  // Build grouped categories from real books only
  const grouped = useMemo(() => {
    const map = {};
    books.forEach((book) => {
      const cat = inferBookCategory(book);
      if (!map[cat]) map[cat] = [];
      map[cat].push(book);
    });
    return map;
  }, [books]);

  const categoryNames = Object.keys(grouped).sort();
  const filterOptions = ["All", ...categoryNames];

  const filteredGroups = useMemo(() => {
    if (activeFilter === "All") return grouped;
    if (grouped[activeFilter]) return { [activeFilter]: grouped[activeFilter] };
    return {};
  }, [grouped, activeFilter]);

  return (
    <section className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          {/* Om symbol decorative */}
          <p className="text-3xl text-[#d4a359] font-serif mb-1 leading-none" aria-hidden="true">
            ॐ
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-tight">
            Knowledge Discovery
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            {books.length > 0
              ? `${books.length} manuscript${books.length !== 1 ? "s" : ""} across ${categoryNames.length} tradition${categoryNames.length !== 1 ? "s" : ""}`
              : "Browse the digital manuscript collection"}
          </p>
        </div>

        {/* Filter pills */}
        {categoryNames.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setActiveFilter(opt)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  activeFilter === opt
                    ? "bg-[#13382c] text-white border-[#13382c]"
                    : "bg-white text-stone-600 border-[#ede5d6] hover:border-[#13382c]/40 hover:text-[#13382c]"
                }`}
              >
                {opt === "All" ? (
                  <span className="inline-flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    All Knowledge
                  </span>
                ) : (
                  opt
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[#ede5d6]" />
        <span className="text-[#d4a359] text-sm">✦</span>
        <div className="h-px flex-1 bg-[#ede5d6]" />
      </div>

      {/* Content */}
      {books.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#13382c]/10 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-[#13382c]/40" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-stone-700 text-lg">
              No manuscripts published yet
            </h3>
            <p className="text-stone-400 text-sm mt-1 max-w-xs">
              The digital library is being curated. Check back soon for sacred texts and
              classical shastras.
            </p>
          </div>
        </div>
      ) : Object.keys(filteredGroups).length === 0 ? (
        <div className="text-center py-12 text-stone-400 text-sm">
          No manuscripts found in &ldquo;{activeFilter}&rdquo;. Try a different filter.
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(filteredGroups).map(([catName, catBooks]) => (
            <CategoryGroup key={catName} categoryName={catName} books={catBooks} />
          ))}
        </div>
      )}
    </section>
  );
}
