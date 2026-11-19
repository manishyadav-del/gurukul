"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BookOpen, Layers, ArrowRight, ExternalLink, Filter } from "lucide-react";

export default function DigitalLibrarySection({ books = [] }) {
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Determine category for books
  const categorizedBooks = useMemo(() => {
    return books.map((b) => {
      let cat = b.tradition || "Shastras";
      const txt = `${b.title} ${b.description || ""}`.toLowerCase();
      if (txt.includes("jyotish") || txt.includes("hora") || txt.includes("astrology")) cat = "Jyotisha";
      else if (txt.includes("ayurveda") || txt.includes("chikitsa")) cat = "Ayurveda";
      else if (txt.includes("veda") || txt.includes("samhita")) cat = "Vedas";
      else if (txt.includes("gita") || txt.includes("upanishad") || txt.includes("darshana")) cat = "Philosophy";
      return { ...b, computedCategory: cat };
    });
  }, [books]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(["All"]);
    categorizedBooks.forEach((b) => set.add(b.computedCategory));
    if (set.size === 1) {
      ["Jyotisha", "Philosophy", "Vedas", "Ayurveda", "Shastras"].forEach((c) => set.add(c));
    }
    return Array.from(set);
  }, [categorizedBooks]);

  const filtered = useMemo(() => {
    if (selectedCategory === "All") return categorizedBooks;
    return categorizedBooks.filter((b) => b.computedCategory === selectedCategory);
  }, [categorizedBooks, selectedCategory]);

  return (
    <section className="py-16 sm:py-20 bg-[#F7F5F0]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#D05C3B]" />
              <span className="text-xs font-serif uppercase tracking-widest text-[#D05C3B] font-semibold">
                Digital Library Catalog
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#30251F] tracking-tight">
              Archived Treatises &amp; Commentaries
            </h2>
            <p className="text-sm text-[#30251F]/70 max-w-xl font-sans">
              Search and read published classical shastras verified by scholars, with synchronized original page images and extracted Sanskrit texts.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-medium transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#D05C3B] text-white shadow-xs"
                    : "bg-white text-[#30251F]/70 border border-[#E8DED2] hover:border-[#D05C3B]/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Books Shelf Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {filtered.slice(0, 12).map((book) => {
              const cover = book.coverImageUrl || book.coverUrl || "/images/brihat-parashara.jpg";
              return (
                <div
                  key={book.id}
                  className="bg-white rounded-xl border border-[#E8DED2] p-3 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                >
                  <Link href={`/library/${book.slug || book.id}`}>
                    <div className="aspect-[3/4] w-full rounded-lg overflow-hidden bg-stone-900 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cover}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => {
                          e.currentTarget.src = "/images/brihat-parashara.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-[10px] text-white bg-[#D05C3B] px-2 py-0.5 rounded-sm font-semibold">
                          Open Reader
                        </span>
                      </div>
                    </div>

                    <div className="mt-2.5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#D05C3B] block">
                        {book.computedCategory}
                      </span>
                      <h3 className="font-serif font-bold text-xs text-[#30251F] group-hover:text-[#D05C3B] transition-colors line-clamp-1">
                        {book.title}
                      </h3>
                      <p className="text-[11px] text-[#30251F]/60 line-clamp-1">
                        {book.author || "Ancient Sage"}
                      </p>
                    </div>
                  </Link>

                  <div className="mt-2 pt-2 border-t border-[#E8DED2]/60 flex items-center justify-between text-[11px]">
                    <span className="text-[#30251F]/50 font-mono">
                      {book.pageCount ? `${book.pageCount}p` : "Folio"}
                    </span>
                    <Link
                      href={`/library/${book.slug || book.id}/pdf`}
                      className="text-[#D05C3B] font-semibold hover:underline"
                    >
                      Read →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E8DED2] p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-[#D05C3B]/40 mx-auto" />
            <h3 className="font-serif font-bold text-lg text-[#30251F]">
              Catalog Under Scholarly Verification
            </h3>
            <p className="text-xs text-[#30251F]/70 max-w-md mx-auto">
              Our Sanskrit pandits and archivists are publishing classical folios. Browse all currently available editions in the library catalog.
            </p>
            <div className="pt-2">
              <Link
                href="/library"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D05C3B] text-white text-xs font-semibold hover:bg-[#bc4f30] transition"
              >
                <span>Browse Full Library</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* View All CTA Footer */}
        <div className="mt-10 text-center">
          <Link
            href="/library"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-[#E8DED2] text-[#30251F] text-xs font-semibold hover:border-[#D05C3B] hover:text-[#D05C3B] transition shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Complete Digital Library Catalog &amp; Indices</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
