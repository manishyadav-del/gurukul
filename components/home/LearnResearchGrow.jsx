"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, ArrowRight, ExternalLink } from "lucide-react";

const KNOWLEDGE_CATEGORIES = [
  {
    id: "shastra",
    titleHi: "शास्त्र अध्ययन",
    titleEn: "Shastra Learning",
    description:
      "Study the foundational classical treatises of Vedic wisdom — from Jyotisha to Dharmashastra.",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    fallbackImage: "/images/brihat-parashara.jpg",
    href: "/library?category=shastra",
    accent: "#d4a359",
  },
  {
    id: "astrology",
    titleHi: "वैदिक ज्योतिष",
    titleEn: "Vedic Astrology",
    description:
      "Explore Jyotisha scriptures, Brihat Parashara Hora Shastra, Phaladeepika, and Jataka Parijata.",
    imageUrl:
      "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?w=800&q=80",
    fallbackImage: "/images/cover-brihat-parashara-hora.jpg",
    href: "/astrology",
    accent: "#7c65d4",
  },
  {
    id: "sanskrit",
    titleHi: "संस्कृत साहित्य",
    titleEn: "Sanskrit Literature",
    description:
      "Discover the poetry, grammar, and profound literary heritage of classical Sanskrit language.",
    imageUrl:
      "https://images.unsplash.com/photo-1491308134562-737fbf8bb1b6?w=800&q=80",
    fallbackImage: "/images/hero-rishi.jpg",
    href: "/library?category=sanskrit",
    accent: "#d46a34",
  },
  {
    id: "numerology",
    titleHi: "वैदिक अंकशास्त्र",
    titleEn: "Vedic Numerology",
    description:
      "Explore the ancient science of numbers — Pythagorean, Chaldean, and classical Vedic systems.",
    imageUrl:
      "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&q=80",
    fallbackImage: "/images/jupiter-insight.jpg",
    href: "/astrology/numerology",
    accent: "#34a4d4",
  },
  {
    id: "yoga",
    titleHi: "योग एवं अध्यात्म",
    titleEn: "Yoga & Spirituality",
    description:
      "Journey through Yoga Sutras, Kundalini wisdom, and ancient Indian meditative traditions.",
    imageUrl:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    fallbackImage: "/images/cover-yoga-sutras.jpg",
    href: "/library?category=yoga",
    accent: "#5aad7e",
  },
  {
    id: "sciences",
    titleHi: "प्राचीन भारतीय विज्ञान",
    titleEn: "Ancient Indian Sciences",
    description:
      "Examine Ayurveda, Vastu Shastra, Arthashastra, and the mathematical genius of ancient India.",
    imageUrl:
      "https://images.unsplash.com/photo-1475275166152-f1e8005f9854?w=800&q=80",
    fallbackImage: "/images/books-row.jpg",
    href: "/library?category=sciences",
    accent: "#c4703c",
  },
  {
    id: "philosophy",
    titleHi: "दर्शन एवं तत्त्वज्ञान",
    titleEn: "Philosophy & Darshana",
    description:
      "Dive into Advaita Vedanta, Nyaya, Vaisheshika, Sankhya, and the six schools of Indian philosophy.",
    imageUrl:
      "https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&q=80",
    fallbackImage: "/images/cover-bhagavad-gita.jpg",
    href: "/library?category=philosophy",
    accent: "#a455b4",
  },
  {
    id: "mathematics",
    titleHi: "वैदिक गणित",
    titleEn: "Vedic Mathematics",
    description:
      "Rediscover Aryabhata, Brahmagupta, and the ancient sutras that shaped modern mathematics.",
    imageUrl:
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",
    fallbackImage: "/images/phaladeepika.jpg",
    href: "/library?category=mathematics",
    accent: "#c4aa34",
  },
];

function CategoryCard({ category }) {
  const [imgSrc, setImgSrc] = useState(category.imageUrl);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative rounded-2xl overflow-hidden aspect-[4/3] group cursor-pointer shadow-md hover:shadow-xl transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imgSrc}
        alt={category.titleEn}
        onError={() => setImgSrc(category.fallbackImage)}
        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-500 ${
          isHovered ? "scale-105" : "scale-100"
        }`}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Gradient bottom overlay for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

      {/* Accent color top strip */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ backgroundColor: category.accent }}
      />

      {/* Bookmark icon (decorative) */}
      <button
        className="absolute top-3 right-3 p-1.5 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors z-10"
        aria-label={`Bookmark ${category.titleEn}`}
        onClick={(e) => e.preventDefault()}
      >
        <Bookmark className="w-3.5 h-3.5 text-white/80" />
      </button>

      {/* Text Content at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        {/* Devanagari title */}
        <p
          className="text-xs font-medium mb-0.5 leading-tight"
          style={{ color: category.accent }}
        >
          {category.titleHi}
        </p>
        {/* English title */}
        <h3 className="font-serif font-bold text-white text-base leading-tight mb-1.5">
          {category.titleEn}
        </h3>
        {/* Description */}
        <p className="text-white/75 text-xs leading-relaxed line-clamp-2">
          {category.description}
        </p>

        {/* Explore button — visible on hover */}
        <div
          className={`mt-3 transition-all duration-300 ${
            isHovered
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2"
          }`}
        >
          <Link
            href={category.href}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            style={{
              backgroundColor: category.accent,
              color: "#0c1a14",
            }}
          >
            Explore
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Invisible full-card link (behind everything for keyboard nav / fallback) */}
      <Link
        href={category.href}
        className="absolute inset-0 z-0"
        aria-label={`Explore ${category.titleEn}`}
        tabIndex={-1}
      />
    </div>
  );
}

export default function LearnResearchGrow() {
  return (
    <section className="py-10">
      {/* Section Heading */}
      <div className="text-center mb-8">
        <p className="text-2xl font-serif text-[#13382c] font-bold tracking-wide mb-1">
          ज्ञान • खोज • विकास
        </p>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 leading-tight">
          Learn, Research &amp; Grow
        </h2>
        <p className="text-stone-500 text-sm mt-2 max-w-xl mx-auto">
          Eight curated knowledge domains drawn from India&apos;s timeless wisdom
          traditions — explore your path.
        </p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#d4a359]" />
          <span className="text-[#d4a359] text-lg">✦</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#d4a359]" />
        </div>
      </div>

      {/* 2-row Grid: 4 cols desktop, 2 tablet, 1 mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {KNOWLEDGE_CATEGORIES.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-6 text-center">
        <Link
          href="/library"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#13382c] hover:text-[#1a4a3b] border border-[#13382c]/30 hover:border-[#13382c]/60 px-5 py-2.5 rounded-full transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          Browse Full Digital Library
        </Link>
      </div>
    </section>
  );
}
