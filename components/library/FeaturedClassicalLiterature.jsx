"use client";

import Link from "next/link";
import { BookOpen, ArrowRight, ShieldCheck, Eye, Sparkles } from "lucide-react";

export default function FeaturedClassicalLiterature({
  books = [],
  onOpenDetails = null,
}) {
  if (!books || books.length === 0) return null;

  return (
    <section className="space-y-4 py-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2.5 border-b border-[#E8DED2]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#D05C3B] bg-[#D05C3B]/10 px-2 py-0.5 rounded-sm border border-[#D05C3B]/30">
              Curated Editions
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#30251F] tracking-tight">
              Featured Classical Literature
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#30251F]/70 font-serif italic">
            Distinguished Sanskrit shastras restored with comprehensive OCR, anvaya word-breakdowns, and verified pagination
          </p>
        </div>

        <Link
          href="/library"
          className="text-xs font-semibold text-[#D05C3B] hover:text-[#bc4f30] inline-flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Browse Complete Archive</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid of Larger Editorial Book Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {books.slice(0, 4).map((book) => {
          const cover = book.coverImageUrl || book.coverUrl || "/images/brihat-parashara.jpg";
          const readerUrl = `/library/${book.slug || book.id}/pdf`;
          const detailUrl = `/library/${book.slug || book.id}`;

          return (
            <div
              key={book.id || book.slug}
              className="bg-white rounded-2xl border border-[#E8DED2] p-4 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Large Cover Container */}
                <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#241a14]">
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
                      {book.category || book.tradition || "Classical"}
                    </span>
                    {book.pageCount && (
                      <span className="text-[10px] font-mono text-white/90 bg-black/50 px-2 py-0.5 rounded-md backdrop-blur-xs">
                        {book.pageCount} pages
                      </span>
                    )}
                  </div>

                  {/* Read Quick Button */}
                  <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link
                      href={readerUrl}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D05C3B] hover:bg-[#bc4f30] text-white text-xs font-semibold shadow-md transition"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read Edition</span>
                    </Link>
                  </div>
                </div>

                {/* Information */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#30251F]/60 mb-1">
                    <span className="font-serif italic truncate max-w-[150px]">
                      {book.author || "Ancient Rishi"}
                    </span>
                    <span className="font-mono text-[10px]">
                      {book.language || "Sanskrit"}
                    </span>
                  </div>

                  <Link href={detailUrl}>
                    <h3 className="font-serif font-bold text-sm text-[#30251F] group-hover:text-[#D05C3B] transition-colors line-clamp-1 leading-snug">
                      {book.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-[#30251F]/70 line-clamp-2 leading-relaxed mt-1">
                    {book.description ||
                      "Authoritative foundational scripture expounding traditional Indian wisdom and sacred knowledge."}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 mt-3 border-t border-[#E8DED2]/60 flex items-center justify-between text-xs">
                {onOpenDetails ? (
                  <button
                    onClick={() => onOpenDetails(book)}
                    className="font-medium text-[#30251F]/70 hover:text-[#D05C3B] cursor-pointer"
                  >
                    Dossier
                  </button>
                ) : (
                  <Link
                    href={detailUrl}
                    className="font-medium text-[#30251F]/70 hover:text-[#D05C3B]"
                  >
                    Details
                  </Link>
                )}

                <Link
                  href={readerUrl}
                  className="inline-flex items-center gap-1 font-semibold text-[#D05C3B] hover:text-[#bc4f30]"
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
