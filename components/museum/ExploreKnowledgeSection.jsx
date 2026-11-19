"use client";

import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

const KNOWLEDGE_DOMAINS = [
  {
    id: "shastra",
    titleHi: "शास्त्र अध्ययन",
    titleEn: "Shastra Learning",
    description:
      "Study foundational classical treatises of Dharma, Jyotisha, and Nitishastra in authentic Devanagari with modern translations.",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    fallback: "/images/brihat-parashara.jpg",
    href: "/library?category=shastra",
    tag: "Core Canons",
  },
  {
    id: "astrology",
    titleHi: "वैदिक ज्योतिष",
    titleEn: "Vedic Astrology",
    description:
      "Explore classical Jyotisha principles from Parashara Hora, Phaladeepika, and Jataka Parijata with planetary mathematics.",
    imageUrl:
      "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&q=80",
    fallback: "/images/cover-brihat-parashara-hora.jpg",
    href: "/astrology",
    tag: "Vedanga",
  },
  {
    id: "heritage",
    titleHi: "भारतीय धरोहर",
    titleEn: "Indian Heritage",
    description:
      "Discover the spiritual civilization, temple iconography, sacred geography, and oral lineage traditions of Bharat.",
    imageUrl:
      "https://images.unsplash.com/photo-1475275166152-f1e8005f9854?w=800&q=80",
    fallback: "/images/books-row.jpg",
    href: "/explore",
    tag: "Tradition",
  },
  {
    id: "sanskrit",
    titleHi: "संस्कृत साहित्य",
    titleEn: "Sanskrit Literature",
    description:
      "Unravel classical Sanskrit poetry, Paninian grammar, Sandhi, Samasa, and linguistic morphology of Vedic hymns.",
    imageUrl:
      "https://images.unsplash.com/photo-1491308134562-737fbf8bb1b6?w=800&q=80",
    fallback: "/images/hero-rishi.jpg",
    href: "/sanskrit",
    tag: "Language",
  },
  {
    id: "philosophy",
    titleHi: "दर्शन एवं तत्त्वज्ञान",
    titleEn: "Philosophy & Darshana",
    description:
      "Immerse yourself in Advaita Vedanta, Sankhya, Nyaya, Vaisheshika, Yoga, and Mimamsa schools of philosophical inquiry.",
    imageUrl:
      "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&q=80",
    fallback: "/images/cover-bhagavad-gita.jpg",
    href: "/library?category=philosophy",
    tag: "Shad Darshana",
  },
  {
    id: "science",
    titleHi: "प्राचीन विज्ञान",
    titleEn: "Ancient Sciences",
    description:
      "Examine classical Ayurveda, Vastu Shastra, Sulba Sutras mathematics, and early Indian astronomy calculations.",
    imageUrl:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    fallback: "/images/phaladeepika.jpg",
    href: "/library?category=ayurveda",
    tag: "Sciences",
  },
];

export default function ExploreKnowledgeSection() {
  return (
    <section className="py-16 sm:py-20 bg-[#F7F5F0]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#D05C3B]" />
              <span className="text-xs font-serif uppercase tracking-widest text-[#D05C3B] font-semibold">
                Explore Knowledge
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#30251F] tracking-tight">
              Six Pillars of Classical Indian Thought
            </h2>
            <p className="text-sm text-[#30251F]/70 max-w-2xl font-sans">
              From systematic Sanskrit grammars to profound metaphysical inquiry, explore the interconnected domains curated by Gurukul.
            </p>
          </div>

          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D05C3B] hover:text-[#bc4f30] transition group self-start md:self-end"
          >
            <span>Explore All Disciplines</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 6 Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {KNOWLEDGE_DOMAINS.map((domain) => (
            <Link
              key={domain.id}
              href={domain.href}
              className="group bg-white rounded-2xl border border-[#E8DED2] p-5 shadow-xs hover:shadow-xl hover:border-[#D05C3B]/50 transition duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Visual Image Banner with Subtle Framing */}
                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#241a14]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={domain.imageUrl}
                    alt={domain.titleEn}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = domain.fallback;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider font-semibold bg-white/90 text-[#30251F] px-2.5 py-1 rounded-full shadow-xs">
                    {domain.tag}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <p className="text-xs text-[#D05C3B] font-serif font-medium mb-1">
                    {domain.titleHi}
                  </p>
                  <h3 className="font-serif font-bold text-lg text-[#30251F] group-hover:text-[#D05C3B] transition-colors">
                    {domain.titleEn}
                  </h3>
                  <p className="text-xs text-[#30251F]/70 leading-relaxed mt-2 line-clamp-2">
                    {domain.description}
                  </p>
                </div>
              </div>

              {/* Action row */}
              <div className="mt-5 pt-3.5 border-t border-[#E8DED2]/60 flex items-center justify-between text-xs font-medium text-[#30251F]/80 group-hover:text-[#D05C3B] transition-colors">
                <span>Enter Wing</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
