"use client";

import Link from "next/link";
import { BookOpen, ArrowRight, ShieldCheck, Calendar, FileText } from "lucide-react";

export default function LatestPublicationsSection({ books = [] }) {
  // If books are supplied from DB, use them; otherwise provide classical verified editions
  const fallbackPublications = [
    {
      id: "brihat-jataka",
      title: "Brihat Jataka",
      author: "Varahamihira",
      language: "Sanskrit",
      category: "Jyotisha",
      publishedAt: "Classical Edition",
      description: "Fundamental work on predictive astrology by Ujjain's royal polymath Varahamihira.",
      coverImageUrl: "/images/brihat-jataka.jpg",
      slug: "brihat-jataka",
      status: "PUBLISHED",
      pageCount: 384,
    },
    {
      id: "rig-veda",
      title: "Rig Veda Samhita (Mandala I)",
      author: "Vedic Rishis",
      language: "Vedic Sanskrit",
      category: "Vedas",
      publishedAt: "Archival Release",
      description: "Sacred metered hymns celebrating Agni, Indra, and the cosmic order of Rta.",
      coverImageUrl: "/images/cover-rig-veda.jpg",
      slug: "rig-veda-samhita",
      status: "PUBLISHED",
      pageCount: 512,
    },
    {
      id: "vishnu-purana",
      title: "Vishnu Purana",
      author: "Sage Parashara",
      language: "Sanskrit • Hindi",
      category: "Purana",
      description: "Primary Mahapurana explicating cosmology, genealogical lineages of solar and lunar dynasties, and Avataras.",
      coverImageUrl: "/images/cover-vishnu-purana.jpg",
      slug: "vishnu-purana",
      status: "PUBLISHED",
      pageCount: 440,
    },
  ];

  const displayList = books.length > 0 ? books.slice(0, 3) : fallbackPublications;

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-[#E8DED2]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D05C3B]" />
              <span className="text-xs font-serif uppercase tracking-widest text-[#D05C3B] font-semibold">
                Archival Releases
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#30251F] tracking-tight">
              Latest Publications &amp; Digitized Canons
            </h2>
            <p className="text-sm text-[#30251F]/70 max-w-xl font-sans">
              Recently approved and published manuscripts from the Gurukul Administrative Publishing Studio.
            </p>
          </div>

          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D05C3B] hover:text-[#bc4f30] transition group self-start md:self-end"
          >
            <span>View All Recent Digitizations</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 3 Horizontal Publication Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayList.map((item) => {
            const cover = item.coverImageUrl || item.coverUrl || "/images/brihat-parashara.jpg";
            const pubDate = item.publishedAt
              ? (typeof item.publishedAt === "string" && !item.publishedAt.includes("-")
                  ? item.publishedAt
                  : new Date(item.publishedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }))
              : "Published Edition";

            return (
              <div
                key={item.id}
                className="bg-[#F7F5F0] rounded-2xl border border-[#E8DED2] p-5 flex flex-col justify-between hover:shadow-lg transition duration-300 group"
              >
                <div className="space-y-4">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-28 rounded-lg overflow-hidden bg-stone-900 shrink-0 relative shadow-sm">
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

                    {/* Meta */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-[#D05C3B]">
                          {item.tradition || item.category || "Scripture"}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                          {item.status || "PUBLISHED"}
                        </span>
                      </div>

                      <Link href={`/library/${item.slug || item.id}`}>
                        <h3 className="font-serif font-bold text-sm text-[#30251F] group-hover:text-[#D05C3B] transition-colors line-clamp-2">
                          {item.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-[#30251F]/60 truncate">
                        By {item.author || "Ancient Sage"}
                      </p>

                      <div className="pt-1 flex items-center gap-2 text-[11px] text-[#30251F]/50 font-mono">
                        <span>{item.language || "Sanskrit"}</span>
                        {item.pageCount && <span>• {item.pageCount} pages</span>}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-[#30251F]/70 line-clamp-2 leading-relaxed pt-1">
                    {item.description || "Authentic classical shastra published with verified pagination and Sanskrit OCR."}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#E8DED2]/80 flex items-center justify-between">
                  <span className="text-[11px] text-[#30251F]/50 font-serif italic">
                    {pubDate}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/library/${item.slug || item.id}`}
                      className="text-xs font-semibold text-[#30251F] hover:text-[#D05C3B] transition"
                    >
                      Details
                    </Link>
                    <Link
                      href={`/library/${item.slug || item.id}/pdf`}
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-md bg-[#D05C3B] text-white hover:bg-[#bc4f30] transition"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Read</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
