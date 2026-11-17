"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";
import { OmSeal, ManuscriptCorner } from "./VedicOrnament.jsx";

// Classical Jacket Color Schemes for authentic historical presentation
const VEDIC_JACKET_THEMES = [
  {
    name: "Forest Temple",
    bg: "bg-gradient-to-br from-[#0c281e] via-[#13382c] to-[#081b14]",
    spine: "bg-[#081b14] border-r border-[#d4a359]/30",
    goldBorder: "border-[#d4a359]/50",
    titleColor: "text-[#f5e6c8]",
    subColor: "text-[#d4a359]",
    badgeBg: "bg-[#d4a359]/20 text-[#f5e6c8] border border-[#d4a359]/40",
  },
  {
    name: "Ancient Terracotta",
    bg: "bg-gradient-to-br from-[#3b170e] via-[#522214] to-[#240e08]",
    spine: "bg-[#240e08] border-r border-amber-500/30",
    goldBorder: "border-amber-400/50",
    titleColor: "text-amber-100",
    subColor: "text-amber-300",
    badgeBg: "bg-amber-500/20 text-amber-200 border border-amber-400/40",
  },
  {
    name: "Royal Indraneel",
    bg: "bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0a0f1d]",
    spine: "bg-[#0a0f1d] border-r border-sky-400/30",
    goldBorder: "border-sky-300/40",
    titleColor: "text-slate-100",
    subColor: "text-sky-200",
    badgeBg: "bg-sky-400/20 text-sky-200 border border-sky-300/30",
  },
  {
    name: "Deep Saffron & Mahogany",
    bg: "bg-gradient-to-br from-[#381e0d] via-[#4d2810] to-[#241306]",
    spine: "bg-[#241306] border-r border-[#d4a359]/30",
    goldBorder: "border-[#d4a359]/40",
    titleColor: "text-[#fef3c7]",
    subColor: "text-[#fbbf24]",
    badgeBg: "bg-amber-400/20 text-amber-100 border border-amber-300/40",
  },
];

export default function BookPresentation3D({
  book,
  index = 0,
  size = "md", // "sm" | "md" | "lg"
  showQuickAction = true,
  onClick = null,
}) {
  const theme = VEDIC_JACKET_THEMES[index % VEDIC_JACKET_THEMES.length];
  const coverSrc = book.coverUrl || book.coverImageUrl;
  const hasUploadedCover = Boolean(coverSrc && coverSrc.startsWith("http"));

  const sizeClasses = {
    sm: "w-36 h-52 sm:w-40 sm:h-56",
    md: "w-44 h-64 sm:w-52 sm:h-76",
    lg: "w-56 h-80 sm:w-64 sm:h-96",
  }[size] || "w-48 h-70";

  return (
    <div
      className={`group relative perspective-1000 select-none ${sizeClasses}`}
      style={{ perspective: "1000px" }}
      onClick={onClick}
    >
      {/* Dynamic 3D Book Container */}
      <div className="relative w-full h-full transition-all duration-500 ease-out transform-gpu group-hover:rotate-y-[-10deg] group-hover:rotate-x-[3deg] group-hover:translate-y-[-6px] shadow-[0_12px_28px_-6px_rgba(0,0,0,0.4),0_6px_14px_-4px_rgba(0,0,0,0.3)] group-hover:shadow-[0_22px_45px_-8px_rgba(0,0,0,0.55),0_10px_22px_-6px_rgba(212,163,89,0.25)] rounded-r-xl rounded-l-xs overflow-hidden flex">
        
        {/* Physical Book Spine (Left Strip) */}
        <div className={`w-3.5 sm:w-4 shrink-0 h-full ${theme.spine} relative overflow-hidden flex flex-col justify-between py-3 items-center shadow-inner`}>
          <div className="w-full h-px bg-[#d4a359]/40" />
          <span className="text-[7px] uppercase font-mono tracking-widest text-[#d4a359]/80 rotate-90 whitespace-nowrap">
            {book.language || "GRANTHA"}
          </span>
          <div className="w-full h-px bg-[#d4a359]/40" />
        </div>

        {/* Book Cover Face */}
        <div className="relative flex-1 h-full overflow-hidden flex flex-col justify-between">
          {hasUploadedCover ? (
            /* Uploaded Cover Image Mode */
            <div className="relative w-full h-full bg-stone-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverSrc}
                alt={book.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-stone-950/30" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#d4a359] block truncate">
                  {book.author || "Classical Sage"}
                </span>
                <h4 className="font-serif font-bold text-xs sm:text-sm line-clamp-2 leading-snug drop-shadow-md">
                  {book.title}
                </h4>
              </div>
            </div>
          ) : (
            /* Authentic Vedic Manuscript Cloth Jacket Fallback */
            <div className={`w-full h-full ${theme.bg} p-3.5 sm:p-4 flex flex-col justify-between relative`}>
              {/* Subtle Parchment Texture & Border */}
              <div className="absolute inset-1.5 border border-[#d4a359]/30 rounded-r-lg pointer-events-none" />
              <div className="absolute inset-2 border border-dashed border-[#d4a359]/20 rounded-r-md pointer-events-none" />

              {/* Ornate Corner Accents */}
              <ManuscriptCorner position="top-right" className="absolute top-2 right-2 w-4 h-4 text-[#d4a359]/50" />
              <ManuscriptCorner position="bottom-right" className="absolute bottom-2 right-2 w-4 h-4 text-[#d4a359]/50" />

              {/* Header: Sacred Symbol & Language */}
              <div className="relative z-10 flex items-center justify-between">
                <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm ${theme.badgeBg}`}>
                  {book.language || "Sanskrit"}
                </span>
                <OmSeal className="text-sm text-[#d4a359]" />
              </div>

              {/* Center: Title & Script */}
              <div className="relative z-10 text-center my-auto px-1 space-y-1.5">
                <div className="w-5 h-0.5 bg-[#d4a359]/40 mx-auto rounded-full" />
                <h4 className={`font-serif font-bold text-xs sm:text-sm md:text-base ${theme.titleColor} line-clamp-3 leading-snug tracking-tight drop-shadow-sm`}>
                  {book.title}
                </h4>
                {book.script && (
                  <p className="text-[10px] text-[#d4a359]/80 font-serif italic truncate">
                    {book.script}
                  </p>
                )}
                <div className="w-5 h-0.5 bg-[#d4a359]/40 mx-auto rounded-full" />
              </div>

              {/* Footer: Author & Page Count */}
              <div className="relative z-10 pt-2 border-t border-[#d4a359]/20 flex items-center justify-between text-[10px] text-stone-300">
                <span className="truncate max-w-[95px] text-stone-300/90 font-medium">
                  {book.author || "Ancient Shastra"}
                </span>
                {book.pageCount ? (
                  <span className="font-mono text-[#d4a359] font-bold">
                    {book.pageCount}p
                  </span>
                ) : (
                  <span className="text-[#d4a359]/70 text-[9px]">Vedic MS</span>
                )}
              </div>
            </div>
          )}

          {/* Simulated Physical Page Edges (Right Side Depth) */}
          <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-l from-stone-200 via-stone-300 to-stone-400 opacity-80 pointer-events-none shadow-xs" />

          {/* Quick Read Overlay on Hover */}
          {showQuickAction && (
            <div className="absolute inset-0 bg-[#0d281e]/85 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-3 text-center">
              <span className="w-8 h-8 rounded-full bg-[#d4a359] text-stone-950 flex items-center justify-center shadow-md">
                <BookOpen className="w-4 h-4" />
              </span>
              <p className="text-xs font-serif font-bold text-white">
                Read Manuscript
              </p>
              <span className="text-[10px] text-amber-200/80 font-mono">
                {book._count?.chapters || 1} Chapters • {book.pageCount || 1} Pages
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Surface Shadow Drop underneath */}
      <div className="absolute -bottom-3 left-3 right-3 h-3 bg-black/40 blur-md rounded-full pointer-events-none transition-all duration-500 group-hover:blur-lg group-hover:scale-105" />
    </div>
  );
}
