"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, BookOpen, Layers } from "lucide-react";
import BookPresentation3D from "./BookPresentation3D.jsx";
import PalmLeafCard from "./PalmLeafCard.jsx";

export default function EditorialShelf({
  title,
  subtitle = null,
  badge = null,
  books = [],
  layout = "3D_SCROLL", // "3D_SCROLL" | "PALM_LEAF_GRID" | "PROGRESS_ROW"
  onOpenDetails = null,
}) {
  const scrollRef = useRef(null);

  if (!books || books.length === 0) return null;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="space-y-4 py-2">
      {/* Shelf Header */}
      <div className="flex items-end justify-between gap-4 pb-2 border-b border-[#e8dac5]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {badge && (
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#8c622a] bg-[#f5efe6] px-2 py-0.5 rounded-sm border border-[#d8c8b0]">
                {badge}
              </span>
            )}
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-stone-600 font-serif italic">
              {subtitle}
            </p>
          )}
        </div>

        {/* Scroll Arrows for Horizontal Shelves */}
        {layout === "3D_SCROLL" && books.length > 3 && (
          <div className="hidden sm:flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="w-8 h-8 rounded-full border border-stone-300 hover:border-stone-900 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="w-8 h-8 rounded-full border border-stone-300 hover:border-stone-900 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Render Shelf Contents Based on Layout */}
      {layout === "PALM_LEAF_GRID" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((book) => (
            <PalmLeafCard
              key={book.id || book.slug}
              book={book}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      ) : layout === "PROGRESS_ROW" ? (
        /* Continue Reading Shelf */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {books.map((item, idx) => {
            const book = item.book || item;
            const chapter = item.chapter || null;
            const progressPct = Math.round(item.progress || 0);

            return (
              <div
                key={item.id || idx}
                className="bg-[#faf6ef] border border-[#e2d5c1] hover:border-[#b89358] rounded-2xl p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div className="flex gap-3.5 items-start">
                  <div className="shrink-0 w-16 h-24">
                    <BookPresentation3D
                      book={book}
                      index={idx}
                      size="sm"
                      showQuickAction={false}
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <span className="inline-block text-[9px] uppercase font-bold text-[#8c622a] bg-[#ede0ce] px-1.5 py-0.5 rounded-sm">
                      {book.language || "Sanskrit"}
                    </span>
                    <h3 className="font-serif font-bold text-xs sm:text-sm text-stone-900 group-hover:text-[#13382c] line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-[11px] text-stone-500 truncate">
                      {chapter ? `Chapter ${chapter.chapterNumber || chapter.number || 1}: ${chapter.title}` : `By ${book.author || "Ancient Sage"}`}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="w-full bg-[#e8dac5] rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#13382c] h-1.5 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(5, progressPct))}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-stone-500">
                        <span>{progressPct}% Completed</span>
                        {item.pageNumber && <span>Page {item.pageNumber}</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#ede0ce] flex items-center justify-between mt-3">
                  <Link
                    href={`/library/${book.slug || book.id}`}
                    className="text-xs text-stone-500 hover:text-stone-900 underline font-medium"
                  >
                    Dossier
                  </Link>

                  <Link
                    href={chapter ? `/library/${book.slug || book.id}/${chapter.slug}` : `/library/${book.slug || book.id}/pdf`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#13382c] hover:bg-[#1a4a3b] text-white text-xs font-semibold shadow-xs transition"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#d4a359]" />
                    <span>Resume</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Default: 3D Horizontal Scroll Shelf */
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-thin scrollbar-thumb-[#d4a359]/30 scrollbar-track-transparent snap-x"
        >
          {books.map((book, idx) => (
            <div
              key={book.id || book.slug}
              className="shrink-0 snap-start flex flex-col items-center space-y-3"
            >
              <BookPresentation3D
                book={book}
                index={idx}
                size="md"
                showQuickAction={true}
                onClick={() => onOpenDetails ? onOpenDetails(book) : null}
              />

              <div className="text-center w-44 sm:w-52 space-y-1">
                <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-900 line-clamp-1 hover:text-[#13382c] transition-colors">
                  {onOpenDetails ? (
                    <button
                      onClick={() => onOpenDetails(book)}
                      className="cursor-pointer text-center w-full truncate hover:text-[#13382c]"
                    >
                      {book.title}
                    </button>
                  ) : (
                    <Link href={`/library/${book.slug || book.id}`}>
                      {book.title}
                    </Link>
                  )}
                </h4>
                <p className="text-[11px] text-stone-500 font-serif italic truncate">
                  {book.author || "Ancient Sage"}
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Link
                    href={`/library/${book.slug || book.id}/pdf`}
                    className="text-[11px] font-semibold text-[#13382c] hover:text-[#1a4a3b] hover:underline"
                  >
                    Read
                  </Link>
                  <span className="text-stone-300">•</span>
                  <button
                    onClick={() => onOpenDetails ? onOpenDetails(book) : null}
                    className="text-[11px] text-stone-500 hover:text-stone-900 cursor-pointer"
                  >
                    Info
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
