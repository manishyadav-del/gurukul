"use client";

import React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function PalmLeafCard({ book, onOpenDetails = null }) {
  const readerHref = `/library/${book.slug || book.id}/pdf`;
  const detailHref = `/library/${book.slug || book.id}`;

  return (
    <article className="relative group bg-[#faf5ec] hover:bg-[#fffcf7] border border-[#d8c8b0] hover:border-[#b89358] rounded-xl p-4 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Palm-leaf string hole aesthetic (Granthi Chhidra) on left edge */}
      <div className="absolute top-1/2 -translate-y-1/2 left-3 w-3.5 h-3.5 rounded-full bg-[#e8dac5] border border-[#bfa37b] flex items-center justify-center pointer-events-none shadow-inner" aria-hidden="true">
        <div className="w-1.5 h-1.5 rounded-full bg-[#523920]/50" />
      </div>

      <div className="pl-5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs uppercase font-mono tracking-wider font-bold text-[#633e14] bg-[#ede0ce] px-2 py-0.5 rounded-sm border border-[#d2be9f]">
            {book.language || "Sanskrit"} • {book.script || "Devanagari"}
          </span>
          {book.pageCount && (
            <span className="text-xs text-stone-700 font-mono font-medium">
              {book.pageCount} Patras (Pages)
            </span>
          )}
        </div>

        <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 group-hover:text-[#D05C3B] line-clamp-1 transition-colors">
          {book.title}
        </h3>

        <p className="text-xs sm:text-sm text-stone-700 line-clamp-2 leading-relaxed">
          {book.description || `Classical treatise attributed to ${book.author || "ancient sages"}, preserved in authentic manuscript form.`}
        </p>

        <div className="text-xs text-stone-600 font-medium">
          Rishi / Author: <span className="text-stone-900 font-bold">{book.author || "Ancient Vedic Tradition"}</span>
        </div>
      </div>

      <div className="pl-5 pt-3 mt-3 border-t border-[#e8dbc7] flex items-center justify-between gap-3">
        {onOpenDetails ? (
          <button
            onClick={() => onOpenDetails(book)}
            className="text-xs font-bold text-[#7a4e1d] hover:text-[#D05C3B] underline transition-colors cursor-pointer min-h-[44px] inline-flex items-center"
          >
            Manuscript Dossier
          </button>
        ) : (
          <Link
            href={detailHref}
            className="text-xs font-bold text-[#7a4e1d] hover:text-[#D05C3B] underline transition-colors min-h-[44px] inline-flex items-center"
          >
            Manuscript Dossier
          </Link>
        )}

        <Link
          href={readerHref}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#30251F] hover:bg-[#D05C3B] text-white text-xs font-semibold shadow-xs transition min-h-[44px]"
        >
          <BookOpen className="w-4 h-4 text-[#F2B872]" />
          <span>Read Manuscript</span>
        </Link>
      </div>
    </article>
  );
}
