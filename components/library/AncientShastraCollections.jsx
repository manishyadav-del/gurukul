"use client";

import { useRef, useMemo } from "react";
import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight, Eye, ArrowRight } from "lucide-react";

export default function AncientShastraCollections({
  title = "Ancient Astrology & Shastra Collections",
  subtitle = "Authoritative classical manuscripts on horoscopy, astronomy, and Vedic sciences",
  badge = "Vedic Shastras",
  books = [],
  onOpenDetails = null,
}) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -340 : 340;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  if (!books || books.length === 0) return null;

  return (
    <section className="space-y-4 py-3">
      {/* Shelf Header */}
      <div className="flex items-end justify-between gap-4 pb-2.5 border-b border-[#E8DED2]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {badge && (
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#D05C3B] bg-[#D05C3B]/10 px-2 py-0.5 rounded-sm border border-[#D05C3B]/30">
                {badge}
              </span>
            )}
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#30251F] tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#30251F]/70 font-serif italic">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action and Horizontal Navigation Arrows */}
        <div className="flex items-center gap-2">
          <Link
            href="/library"
            className="text-xs font-semibold text-[#D05C3B] hover:text-[#bc4f30] hidden sm:inline-flex items-center gap-1 mr-2"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-full border border-[#E8DED2] bg-white hover:border-[#30251F] text-[#30251F] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-full border border-[#E8DED2] bg-white hover:border-[#30251F] text-[#30251F] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontally Scrollable Book Cards Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-thin"
        style={{ scrollbarGutter: "stable" }}
      >
        {books.map((book) => {
          const cover = book.coverImageUrl || book.coverUrl || "/images/brihat-parashara.jpg";
          const readerUrl = `/library/${book.slug || book.id}/pdf`;
          const detailUrl = `/library/${book.slug || book.id}`;

          return (
            <div
              key={book.id || book.slug}
              className="w-64 sm:w-72 shrink-0 snap-start bg-white rounded-2xl border border-[#E8DED2] p-4 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Visual Cover */}
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-[#241a14]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={cover}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    onError={(e) => {
                      e.currentTarget.src = "/images/brihat-parashara.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-75 group-hover:opacity-50 transition-opacity" />

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/95 text-[#30251F] shadow-xs">
                      {book.category || book.tradition || "Shastra"}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-700 text-white">
                      {book.status || "PUBLISHED"}
                    </span>
                  </div>

                  {/* Hover Quick Read Button */}
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link
                      href={readerUrl}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D05C3B] hover:bg-[#bc4f30] text-white text-xs font-semibold shadow-md transition"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read Book</span>
                    </Link>
                    {onOpenDetails ? (
                      <button
                        onClick={() => onOpenDetails(book)}
                        className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-[#30251F] shadow-xs transition cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <Link
                        href={detailUrl}
                        className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-[#30251F] shadow-xs transition"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Book Metadata */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#30251F]/60 mb-1">
                    <span className="font-serif italic truncate max-w-[150px]">
                      {book.author || "Classical Sage"}
                    </span>
                    <span className="font-mono text-[10px]">
                      {book.language || "Sanskrit"}
                    </span>
                  </div>

                  <Link href={detailUrl}>
                    <h3 className="font-serif font-bold text-sm text-[#30251F] group-hover:text-[#D05C3B] transition-colors line-clamp-2 leading-snug">
                      {book.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-[#30251F]/70 line-clamp-2 leading-relaxed mt-1">
                    {book.description ||
                      "Authentic classical Shastra verified by scholars, with digitized folios and synchronized verse translation."}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 mt-3 border-t border-[#E8DED2]/80 flex items-center justify-between">
                <Link
                  href={detailUrl}
                  className="text-xs font-medium text-[#30251F]/70 hover:text-[#D05C3B] transition"
                >
                  Details
                </Link>
                <Link
                  href={readerUrl}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#D05C3B] hover:text-[#bc4f30] transition"
                >
                  <span>Read Book</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
