"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function MuseumHero() {
  return (
    <section className="relative overflow-hidden bg-[#F7F5F0] pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-[#E8DED2]">
      {/* Abstract Blurred Colorful Background Artwork */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#D05C3B]/15 via-[#F2B872]/20 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#E8DED2] via-[#D05C3B]/10 to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Spacious Asymmetric Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Headline & Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8DED2]/50 border border-[#E8DED2] text-[#D05C3B] text-xs font-medium tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scholarly Knowledge Platform &amp; Manuscript Archives</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#30251F] tracking-tight leading-[1.12]">
              From Knowledge to <br className="hidden sm:inline" />
              Understanding <br className="hidden sm:inline" />
              the <span className="italic font-normal text-[#D05C3B]">Tattva</span>.
            </h1>

            <p className="text-base sm:text-lg text-[#30251F]/80 leading-relaxed font-sans max-w-xl">
              Preserving, translating, and connecting ancient Indian knowledge across sacred Shastras, Vedic astrology, Sanskrit literature, and spiritual philosophy. Discover rare manuscripts and timeless truths through authentic texts and structured research.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/library"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#D05C3B] hover:bg-[#bc4f30] text-white text-sm font-semibold tracking-wide transition shadow-sm hover:shadow-md cursor-pointer"
              >
                <span>Start Reading</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-[#E8DED2]/50 border border-[#E8DED2] text-[#30251F] text-sm font-medium tracking-wide transition cursor-pointer"
              >
                <span>Explore Collections</span>
              </Link>
            </div>

            {/* Core Domain Badges */}
            <div className="pt-4 border-t border-[#E8DED2]/70 flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#30251F]/60 font-serif mr-1">Museum Wings:</span>
              {[
                { label: "Shastras", href: "/library?category=shastra" },
                { label: "Vedic Jyotisha", href: "/astrology" },
                { label: "Sanskrit Grammar", href: "/sanskrit" },
                { label: "Darshana & Vedanta", href: "/library?category=philosophy" },
                { label: "Ayurveda", href: "/library?category=ayurveda" },
              ].map((wing) => (
                <Link
                  key={wing.label}
                  href={wing.href}
                  className="text-xs px-2.5 py-1 rounded-md bg-[#FFFFFF] border border-[#E8DED2] text-[#30251F]/80 hover:text-[#D05C3B] hover:border-[#D05C3B]/40 transition"
                >
                  {wing.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Visual Manuscript Display (Museum Framing) */}
          <div className="lg:col-span-6">
            <div className="relative group">
              {/* Outer decorative museum matte frame */}
              <div className="p-3 bg-white rounded-3xl border border-[#E8DED2] shadow-xl shadow-[#30251F]/5 transition duration-500 hover:shadow-2xl">
                <div className="relative rounded-2xl overflow-hidden bg-[#1c120c] aspect-[16/9] sm:aspect-[2/1] lg:aspect-[16/10]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/museum-manuscripts-triptych.png"
                    alt="Classical Palm Leaf Manuscripts and Vedic Astrological Charts"
                    className="w-full h-full object-cover transition duration-700 group-hover:scale-[1.02]"
                  />
                  {/* Subtle inner shadow and overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Caption overlay */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#F2B872] block">
                        Preserved Palm Leaf &amp; Astrological Corpus
                      </span>
                      <h2 className="font-serif font-semibold text-white text-sm sm:text-base leading-tight mt-0.5">
                        Brihat Parashara, Shastras &amp; Vedic Diagrams
                      </h2>
                    </div>
                    <Link
                      href="/library"
                      className="shrink-0 text-xs font-medium text-white/90 bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full transition"
                    >
                      View Folios
                    </Link>
                  </div>
                </div>

                {/* Museum Provenance Footer */}
                <div className="mt-3 px-2 py-1 flex items-center justify-between text-[11px] text-[#30251F]/70">
                  <span className="font-serif italic">
                    Rare Vedic Manuscripts • Sanskrit • Commentary &amp; Anvaya
                  </span>
                  <span className="font-mono text-[#D05C3B]">Status: Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
