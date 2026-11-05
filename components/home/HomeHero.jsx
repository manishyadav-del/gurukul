"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-[#13382c] text-white border-b border-[#0f2e24]">
      {/* Background Vedic Temple / Sage Illustration */}
      <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[58%] pointer-events-none select-none overflow-hidden opacity-90">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/gurukul-hero-vedic.jpg"
          alt="Vedic Temple and Celestial Wisdom"
          className="w-full h-full object-cover object-center"
        />
        {/* Gradients blending into the background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#13382c] via-[#13382c]/80 lg:via-[#13382c]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#13382c] via-transparent to-transparent" />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="max-w-xl space-y-5">
          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold font-serif tracking-tight text-white leading-[1.2]">
            Ancient Wisdom <br />
            for a Brighter Tomorrow
          </h1>

          {/* Subtitle */}
          <p className="text-stone-200 text-sm sm:text-base leading-relaxed max-w-lg">
            Explore Vedic astrology, timeless books, and a vibrant knowledge community — all in one place.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/astrology"
              className="px-5 py-2.5 rounded-lg bg-[#d4a359] hover:bg-[#c49348] text-[#13382c] text-xs sm:text-sm font-semibold transition shadow-md cursor-pointer"
            >
              Explore Astrology
            </Link>
            <Link
              href="/library"
              className="px-5 py-2.5 rounded-lg bg-black/25 hover:bg-black/40 border border-white/30 text-white text-xs sm:text-sm font-medium transition cursor-pointer backdrop-blur-xs"
            >
              Browse Library
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
