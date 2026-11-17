"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Sparkles, Compass, ArrowRight, ShieldCheck, FileText } from "lucide-react";
import BookPresentation3D from "./BookPresentation3D.jsx";
import { SacredGeometryWatermark, ShlokaDivider } from "./VedicOrnament.jsx";

export default function LibraryHero({ featuredBook, onOpenDetails = null }) {
  if (!featuredBook) return null;

  const readerUrl = `/library/${featuredBook.slug || featuredBook.id}/pdf`;
  const detailUrl = `/library/${featuredBook.slug || featuredBook.id}`;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1e17] via-[#103328] to-[#071610] text-[#f7efe1] border border-[#d4a359]/30 shadow-2xl p-6 sm:p-8 md:p-12">
      {/* Decorative Sacred Geometry Watermark Background */}
      <div className="absolute -top-12 -right-12 pointer-events-none text-[#d4a359]/10">
        <SacredGeometryWatermark className="w-80 h-80 sm:w-120 sm:h-120" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Editorial Information */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-[#d4a359]/20 text-[#d4a359] border border-[#d4a359]/40">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Featured Ancient Shastra</span>
            </span>

            <span className="text-xs px-2.5 py-1 rounded-md bg-white/10 text-stone-300 font-mono">
              {featuredBook.language || "Sanskrit"} • {featuredBook.script || "Devanagari"}
            </span>

            {featuredBook.pageCount && (
              <span className="text-xs px-2.5 py-1 rounded-md bg-white/10 text-stone-300 font-mono">
                {featuredBook.pageCount} Pages
              </span>
            )}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold font-serif text-[#fdfaf5] leading-tight tracking-tight">
              {featuredBook.title}
            </h1>
            <p className="text-sm sm:text-base font-serif italic text-[#d4a359]">
              Attributed to {featuredBook.author || "Ancient Rishi Tradition"}
            </p>
          </div>

          <p className="text-sm sm:text-base text-stone-300/90 leading-relaxed max-w-2xl line-clamp-3 sm:line-clamp-4">
            {featuredBook.description ||
              "An authentic foundational classical treatise expounding the planetary principles, predictive horoscopy, and divine astrological laws of ancient Vedic knowledge."}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href={readerUrl}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#d4a359] hover:bg-[#c49247] text-stone-950 font-serif font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-stone-950" />
              <span>Begin Reading Manuscript</span>
            </Link>

            {onOpenDetails ? (
              <button
                onClick={() => onOpenDetails(featuredBook)}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#f7efe1] font-medium text-sm border border-white/20 transition-all cursor-pointer"
              >
                <span>Manuscript Details</span>
                <ArrowRight className="w-4 h-4 text-[#d4a359]" />
              </button>
            ) : (
              <Link
                href={detailUrl}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#f7efe1] font-medium text-sm border border-white/20 transition-all"
              >
                <span>Manuscript Details</span>
                <ArrowRight className="w-4 h-4 text-[#d4a359]" />
              </Link>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-stone-300/80 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{featuredBook._count?.passages || 1} Digitized Passages</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Authentic Vedic Lineage</span>
            </div>
          </div>
        </div>

        {/* Right Column: 3D Manuscript Cover Showcase */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end py-4">
          <BookPresentation3D
            book={featuredBook}
            index={0}
            size="lg"
            showQuickAction={true}
            onClick={() => onOpenDetails ? onOpenDetails(featuredBook) : null}
          />
        </div>
      </div>
    </div>
  );
}
