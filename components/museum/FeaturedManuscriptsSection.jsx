"use client";

import Link from "next/link";
import { BookOpen, ArrowRight, Bookmark, Layers, Eye } from "lucide-react";

export default function FeaturedManuscriptsSection({ books = [] }) {
  // Classical verified manuscripts showcase
  const defaultManuscripts = [
    {
      id: "brihat-parashara",
      title: "Brihat Parashara Hora Shastra",
      author: "Maharshi Parashara",
      language: "Sanskrit • Hindi",
      category: "Jyotisha",
      description:
        "The definitive foundational treatise of Vedic astrology, encompassing planetary characteristics, bhavas, Vimshottari dasha systems, and divisional charts.",
      coverImage: "/images/cover-brihat-parashara-hora.jpg",
      status: "PUBLISHED",
      slug: "brihat-parashara-hora-shastra",
    },
    {
      id: "bhagavad-gita",
      title: "Shrimad Bhagavad Gita",
      author: "Maharshi Veda Vyasa",
      language: "Sanskrit • Hindi • English",
      category: "Philosophy",
      description:
        "The sacred 700-verse dialogue between Shri Krishna and Arjuna in the Bhishma Parva of Mahabharata on Dharma, Karma, and Moksha.",
      coverImage: "/images/cover-bhagavad-gita.jpg",
      status: "PUBLISHED",
      slug: "shrimad-bhagavad-gita",
    },
    {
      id: "yoga-sutras",
      title: "Patanjali Yoga Sutras",
      author: "Maharshi Patanjali",
      language: "Sanskrit • English",
      category: "Yoga & Darshana",
      description:
        "The foundational classical text of Raja Yoga, detailing the Ashtanga eightfold path to mental clarity, Samadhi, and spiritual realization.",
      coverImage: "/images/cover-yoga-sutras.jpg",
      status: "PUBLISHED",
      slug: "patanjali-yoga-sutras",
    },
    {
      id: "phaladeepika",
      title: "Phaladeepika",
      author: "Mantreswara",
      language: "Sanskrit • Hindi",
      category: "Jyotisha",
      description:
        "Celebrated 13th-century classical astrological work covering planetary combinations, Gochara transits, and yogas with practical predictive rules.",
      coverImage: "/images/phaladeepika.jpg",
      status: "PUBLISHED",
      slug: "phaladeepika",
    },
  ];

  // Merge real DB books if available, prioritizing DB records
  const displayManuscripts = books.length > 0
    ? books.slice(0, 4).map((b, idx) => ({
        id: b.id,
        title: b.title,
        author: b.author || "Classical Sage",
        language: b.language || "Sanskrit",
        category: b.tradition || "Shastra",
        description: b.description || "Sacred Vedic manuscript digitized and preserved in Gurukul.",
        coverImage: b.coverImageUrl || b.coverUrl || defaultManuscripts[idx % defaultManuscripts.length].coverImage,
        status: b.status || "PUBLISHED",
        slug: b.slug || b.id,
      }))
    : defaultManuscripts;

  return (
    <section className="py-16 sm:py-20 bg-white border-y border-[#E8DED2]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg text-[#D05C3B]">ॐ</span>
              <span className="text-xs font-serif uppercase tracking-widest text-[#D05C3B] font-semibold">
                Rare &amp; Classical Folios
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#30251F] tracking-tight">
              Featured Manuscripts &amp; Canons
            </h2>
            <p className="text-sm text-[#30251F]/70 max-w-2xl font-sans">
              High-resolution digital restorations of timeless Sanskrit palm leaves, illuminated horoscopes, and classical commentaries.
            </p>
          </div>

          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D05C3B] hover:text-[#bc4f30] transition group self-start md:self-end"
          >
            <span>Browse Full Manuscript Vault</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Large Visual Manuscript Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayManuscripts.map((item) => (
            <div
              key={item.id}
              className="bg-[#F7F5F0] rounded-2xl border border-[#E8DED2] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Large Visual Cover / Folio Photography */}
                <div className="relative aspect-[3/4] w-full bg-[#1e1510] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src = "/images/brihat-parashara.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md bg-white/90 text-[#30251F] backdrop-blur-xs">
                      {item.category}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#D05C3B] text-white">
                      {item.status}
                    </span>
                  </div>

                  {/* Quick Reader Action on Hover */}
                  <div className="absolute inset-x-4 bottom-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link
                      href={`/library/${item.slug}/pdf`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D05C3B] text-white text-xs font-semibold shadow-md hover:bg-[#bc4f30] transition"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Open 3D Reader</span>
                    </Link>
                    <Link
                      href={`/library/${item.slug}`}
                      className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-[#30251F] text-xs transition"
                      title="View Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Metadata & Title */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#30251F]/60">
                    <span className="font-serif italic">{item.author}</span>
                    <span className="font-mono">{item.language}</span>
                  </div>

                  <Link href={`/library/${item.slug}`}>
                    <h3 className="font-serif font-bold text-base text-[#30251F] group-hover:text-[#D05C3B] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-[#30251F]/70 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="px-5 pb-5 pt-3 border-t border-[#E8DED2]/80 flex items-center justify-between">
                <Link
                  href={`/library/${item.slug}`}
                  className="text-xs font-medium text-[#30251F]/80 hover:text-[#D05C3B] transition"
                >
                  Scholarly Details
                </Link>
                <Link
                  href={`/library/${item.slug}/pdf`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#D05C3B] hover:text-[#bc4f30] transition"
                >
                  <span>Read Manuscript</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
