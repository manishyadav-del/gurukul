"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles, Feather, Compass, Layers } from "lucide-react";

const DISCOVERY_CARDS = [
  {
    id: "palm-leaf-collection",
    titleHi: "तालपत्र पाण्डुलिपि",
    titleEn: "Palm-Leaf Manuscript Archives",
    description:
      "Digitized birch-bark (bhurjapatra) and palm-leaf (talapatra) folios preserving foundational astronomical treatises and unbroken oral lineages.",
    imageUrl: "/images/museum-manuscripts-triptych.png",
    fallback: "/images/brihat-parashara.jpg",
    tag: "Archival Preservation",
    targetHref: "/library?tab=manuscripts",
    cta: "Explore Folios",
  },
  {
    id: "jyotisha-manuscripts",
    titleHi: "सिद्धान्त एवं होरा ग्रन्थ",
    titleEn: "Classical Jyotisha Manuscripts",
    description:
      "Illuminated birth horoscopes, planetary transit diagrams, and time-reckoning calculations from Parashara, Varahamihira, and Mantreswara.",
    imageUrl: "/images/cover-brihat-parashara-hora.jpg",
    fallback: "/images/phaladeepika.jpg",
    tag: "Vedanga Jyotisha",
    targetHref: "/astrology",
    cta: "View Jyotisha Corpus",
  },
  {
    id: "original-sanskrit",
    titleHi: "मूल संस्कृत शास्त्र",
    titleEn: "Original Sanskrit Texts & Grammar",
    description:
      "Word-for-word grammatical anvaya, Sandhi analysis, and Paninian morphology linked directly to verified verse transcriptions.",
    imageUrl: "/images/hero-rishi.jpg",
    fallback: "/images/books-row.jpg",
    tag: "Linguistic Rigor",
    targetHref: "/sanskrit",
    cta: "Open Sanskrit Studio",
  },
  {
    id: "vedic-philosophy",
    titleHi: "षड् दर्शन एवं वेदान्त",
    titleEn: "Ancient Indian Philosophy & Darshana",
    description:
      "Comparative epistemological inquiries into Advaita, Sankhya, Nyaya, and Yoga Sutras with classical Shankara Bhashya commentaries.",
    imageUrl: "/images/cover-bhagavad-gita.jpg",
    fallback: "/images/cover-yoga-sutras.jpg",
    tag: "Metaphysical Wisdom",
    targetHref: "/library?category=philosophy",
    cta: "Study Darshana",
  },
];

export default function LibraryKnowledgeDiscovery() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#241711] via-[#30251F] to-[#1c120c] text-[#F7F5F0] border border-[#E8DED2]/20 shadow-2xl p-6 sm:p-8 lg:p-12 my-6">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D05C3B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F2B872]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D05C3B]/20 border border-[#D05C3B]/40 text-[#F2B872] text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Digital Museum Scholarly Vault</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#F7F5F0] tracking-tight">
              Knowledge Discovery &amp; Manuscript Archives
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
              Enter the sacred archives where high-resolution folio restorations, original Sanskrit verses, and conceptual lineages bridge ancient realization with modern research.
            </p>
          </div>

          <Link
            href="/research"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#F7F5F0] border border-white/20 text-xs font-semibold transition self-start md:self-auto"
          >
            <Compass className="w-4 h-4 text-[#F2B872]" />
            <span>Research Studio</span>
          </Link>
        </div>

        {/* 4 Large Editorial Discovery Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DISCOVERY_CARDS.map((card) => (
            <div
              key={card.id}
              className="bg-white/5 border border-white/10 hover:border-[#D05C3B]/60 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Large Landscape Image Container */}
                <div className="relative aspect-[16/10] w-full bg-[#160d08] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.imageUrl}
                    alt={card.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
                    onError={(e) => {
                      e.currentTarget.src = card.fallback;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#241711] via-transparent to-transparent" />
                  <span className="absolute top-2.5 left-2.5 text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-black/60 text-[#F2B872] backdrop-blur-xs">
                    {card.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-serif text-[#F2B872] block">
                    {card.titleHi}
                  </span>
                  <h3 className="font-serif font-bold text-base text-[#F7F5F0] group-hover:text-[#F2B872] transition-colors leading-snug">
                    {card.titleEn}
                  </h3>
                  <p className="text-xs text-stone-300/80 line-clamp-3 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 pt-2 border-t border-white/10">
                <Link
                  href={card.targetHref}
                  className="inline-flex items-center justify-between w-full text-xs font-semibold text-[#F2B872] group-hover:text-white transition"
                >
                  <span>{card.cta}</span>
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
