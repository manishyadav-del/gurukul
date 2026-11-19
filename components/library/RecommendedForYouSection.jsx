"use client";

import Link from "next/link";
import { Sparkles, BookOpen, Compass, ArrowRight, Eye, CheckCircle2 } from "lucide-react";

export default function RecommendedForYouSection({
  recommendations = null,
  fallbackBooks = [],
  isAuthenticated = false,
  onOpenDetails = null,
}) {
  // Extract recommended books or use general published books for unauthenticated users
  const recommendedList =
    recommendations?.recommendedForYou?.length > 0
      ? recommendations.recommendedForYou
      : fallbackBooks.slice(0, 3);

  if (!recommendedList || recommendedList.length === 0) return null;

  return (
    <section className="space-y-4 py-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2.5 border-b border-[#E8DED2]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#D05C3B] bg-[#D05C3B]/10 px-2 py-0.5 rounded-sm border border-[#D05C3B]/30">
              {isAuthenticated ? "Tailored Study" : "Curator's Selection"}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#30251F] tracking-tight">
              Recommended for You
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#30251F]/70 font-serif italic">
            {isAuthenticated
              ? "Recommended based on your reading progress, bookmark traditions, and studied shastras"
              : "Essential foundational classical shastras recommended for Vedic research and daily study"}
          </p>
        </div>

        <Link
          href="/explore"
          className="text-xs font-semibold text-[#D05C3B] hover:text-[#bc4f30] inline-flex items-center gap-1 self-start sm:self-auto"
        >
          <span>Explore Knowledge Graph</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 3 Large Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {recommendedList.map((item, idx) => {
          const cover = item.coverImageUrl || item.coverUrl || "/images/brihat-parashara.jpg";
          const readerUrl = item.readerUrl || `/library/${item.slug || item.bookId || item.id}/pdf`;
          const detailUrl = `/library/${item.slug || item.bookId || item.id}`;

          return (
            <div
              key={item.id || idx}
              className="bg-white rounded-2xl border border-[#E8DED2] p-4 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex gap-4 items-start">
                  {/* Thumbnail Cover */}
                  <div className="w-20 h-28 rounded-xl overflow-hidden bg-[#241a14] shrink-0 relative shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        e.currentTarget.src = "/images/brihat-parashara.jpg";
                      }}
                    />
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#D05C3B] bg-[#D05C3B]/10 px-2 py-0.5 rounded-sm inline-block">
                      {item.language || "Sanskrit"}
                    </span>

                    <Link href={detailUrl}>
                      <h3 className="font-serif font-bold text-sm text-[#30251F] group-hover:text-[#D05C3B] transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-[#30251F]/60 truncate">
                      By {item.author || "Ancient Rishi"}
                    </p>
                  </div>
                </div>

                {/* Reason Pill */}
                {item.reason && (
                  <div className="bg-[#F7F5F0] border border-[#E8DED2] rounded-xl p-2.5 text-xs text-[#30251F]/80 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#D05C3B] shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed text-[11px]">
                      {item.reason}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 mt-3 border-t border-[#E8DED2]/60 flex items-center justify-between text-xs">
                {onOpenDetails ? (
                  <button
                    onClick={() => onOpenDetails(item)}
                    className="font-medium text-[#30251F]/70 hover:text-[#D05C3B] cursor-pointer"
                  >
                    Dossier Details
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
                  className="inline-flex items-center gap-1 font-semibold px-3 py-1.5 rounded-lg bg-[#D05C3B] hover:bg-[#bc4f30] text-white shadow-xs transition"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Book</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
