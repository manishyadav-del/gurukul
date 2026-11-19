"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, BookCopy, Sparkles } from "lucide-react";

const CURATED_COLLECTIONS = [
  {
    id: "jyotisha-corpus",
    titleHi: "ज्योतिष वेदांग संग्रह",
    titleEn: "The Jyotisha Vedanga Corpus",
    description:
      "Core astrological treatises covering Ganita (astronomy), Hora (predictive natal horoscopy), and Samhita (mundane astrology).",
    treatiseCount: 12,
    leadText: "Brihat Parashara Hora Shastra",
    image: "/images/cover-brihat-parashara-hora.jpg",
    accent: "#D05C3B",
    href: "/library?category=astrology",
    tags: ["Parashara", "Phaladeepika", "Jataka Parijata"],
  },
  {
    id: "upanishadic-darshana",
    titleHi: "उपनिषद् एवं वेदान्त",
    titleEn: "Upanishadic Darshana & Vedanta",
    description:
      "The quintessence of Vedic knowledge exploring Brahman, Atman, and consciousness through classical commentaries of Adi Shankaracharya.",
    treatiseCount: 18,
    leadText: "Mandukya & Katha Upanishad",
    image: "/images/cover-bhagavad-gita.jpg",
    accent: "#9b4528",
    href: "/library?category=philosophy",
    tags: ["Advaita", "Vedanta", "Brahma Sutras"],
  },
  {
    id: "classical-ayurveda",
    titleHi: "आयुर्वेद एवं आरोग्य शास्त्र",
    titleEn: "Classical Ayurveda & Life Sciences",
    description:
      "Foundational medical treatises on Tridosha balance, herbal pharmacology, Rasashastra, and holistic disease prevention.",
    treatiseCount: 8,
    leadText: "Charaka & Sushruta Samhita",
    image: "/images/books-row.jpg",
    accent: "#5a8264",
    href: "/library?category=ayurveda",
    tags: ["Charaka", "Sushruta", "Chikitsa"],
  },
  {
    id: "itihasa-niti",
    titleHi: "इतिहास, पुराण एवं नीतिशास्त्र",
    titleEn: "Itihasa, Purana & Nitishastra",
    description:
      "Timeless epics, governance philosophies, diplomatic codes, and sacred cultural narratives of ancient Bharat.",
    treatiseCount: 15,
    leadText: "Bhagavad Gita & Chanakya Niti",
    image: "/images/cover-chanakya-niti.jpg",
    accent: "#bf7b3b",
    href: "/library?category=shastra",
    tags: ["Bhagavad Gita", "Chanakya", "Purana"],
  },
];

export default function KnowledgeCollectionsSection() {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-[#E8DED2]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookCopy className="w-4 h-4 text-[#D05C3B]" />
              <span className="text-xs font-serif uppercase tracking-widest text-[#D05C3B] font-semibold">
                Curated Archives
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#30251F] tracking-tight">
              Knowledge Collections
            </h2>
            <p className="text-sm text-[#30251F]/70 max-w-xl font-sans">
              Interconnected archives assembled by domain scholars to guide serious study from foundational sutras to advanced commentaries.
            </p>
          </div>

          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D05C3B] hover:text-[#bc4f30] transition group self-start md:self-end"
          >
            <span>View All Collections</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 4 Large Collection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {CURATED_COLLECTIONS.map((col) => (
            <div
              key={col.id}
              className="bg-[#F7F5F0] rounded-3xl border border-[#E8DED2] p-6 lg:p-8 flex flex-col justify-between hover:shadow-xl transition-all duration-300 group"
            >
              <div className="space-y-6">
                {/* Top Row: Devanagari + Count Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-serif font-medium text-[#D05C3B]">
                    {col.titleHi}
                  </span>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-white border border-[#E8DED2] text-[#30251F]/80">
                    {col.treatiseCount} Classical Canons
                  </span>
                </div>

                {/* Visual Layout: Side by side Thumbnail & Description */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  <div className="sm:col-span-4 aspect-[3/4] rounded-2xl overflow-hidden bg-[#241a14] relative shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={col.image}
                      alt={col.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = "/images/brihat-parashara.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute bottom-2 left-2 right-2 text-[10px] text-white/95 font-serif font-semibold truncate text-center">
                      {col.leadText}
                    </span>
                  </div>

                  <div className="sm:col-span-8 space-y-3">
                    <h3 className="font-serif font-bold text-xl text-[#30251F] group-hover:text-[#D05C3B] transition-colors">
                      {col.titleEn}
                    </h3>
                    <p className="text-xs text-[#30251F]/75 leading-relaxed font-sans">
                      {col.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {col.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white border border-[#E8DED2] text-[#30251F]/70"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action row */}
              <div className="mt-6 pt-4 border-t border-[#E8DED2]/80 flex items-center justify-between">
                <span className="text-xs text-[#30251F]/60 font-serif italic">
                  Complete Lineage &amp; Cross-References
                </span>
                <Link
                  href={col.href}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D05C3B] group-hover:text-[#bc4f30] transition"
                >
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
