"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Sun, Moon, Compass, Calendar, Hash, Clock } from "lucide-react";

export default function VedicAstrologyMuseumSection({ panchang = null }) {
  // Use calculated panchang values or fallback to standard classical definitions
  const tithiName = panchang?.tithi?.name || "Shukla Pratipada";
  const nakshatraName = panchang?.nakshatra?.name || "Ashwini";
  const yogaName = panchang?.yoga?.name || "Siddhi";
  const karanaName = panchang?.karana?.name || "Bava";
  const sunrise = panchang?.sunrise || "06:42 AM";
  const sunset = panchang?.sunset || "05:27 PM";
  const rahuKaal = panchang?.rahuKaal ? `${panchang.rahuKaal.start} - ${panchang.rahuKaal.end}` : "04:30 PM - 06:00 PM";

  return (
    <section className="py-16 sm:py-20 bg-white border-y border-[#E8DED2]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#D05C3B]" />
              <span className="text-xs font-serif uppercase tracking-widest text-[#D05C3B] font-semibold">
                Jyotisha Vedanga
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#30251F] tracking-tight">
              Vedic Astrology &amp; Astronomical Sciences
            </h2>
            <p className="text-sm text-[#30251F]/70 max-w-xl font-sans">
              Rigorous astronomical calculations powered by classical Parashari principles, Swiss Ephemeris algorithms, and authentic Vedic numerology.
            </p>
          </div>

          <Link
            href="/astrology"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D05C3B] hover:text-[#bc4f30] transition group self-start md:self-end"
          >
            <span>Open Full Astrology Suite</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 4 Feature Columns: Panchang, Kundli, Dasha, Numerology */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1. Real Today's Panchang */}
          <div className="bg-[#F7F5F0] rounded-2xl border border-[#E8DED2] p-6 shadow-xs hover:shadow-lg transition duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8DED2] flex items-center justify-center text-[#D05C3B] shadow-xs">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#D05C3B] font-bold px-2 py-0.5 rounded-md bg-[#D05C3B]/10">
                  Live Panchang
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-[#30251F]">
                  Daily Vedic Panchang
                </h3>
                <p className="text-xs text-[#30251F]/60 mt-0.5">
                  Astronomical 5 limbs of time
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E8DED2]/80 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#30251F]/60">Tithi:</span>
                  <span className="font-semibold text-[#30251F]">{tithiName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#30251F]/60">Nakshatra:</span>
                  <span className="font-semibold text-[#30251F]">{nakshatraName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#30251F]/60">Yoga:</span>
                  <span className="font-semibold text-[#30251F]">{yogaName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#30251F]/60">Rahu Kaal:</span>
                  <span className="font-mono text-[#D05C3B] text-[11px] font-semibold">{rahuKaal}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E8DED2]/80">
              <Link
                href="/astrology/daily"
                className="flex items-center justify-between text-xs font-semibold text-[#D05C3B] hover:text-[#bc4f30] transition"
              >
                <span>Full Daily Muhurta</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 2. Kundli Birth Chart */}
          <div className="bg-[#F7F5F0] rounded-2xl border border-[#E8DED2] p-6 shadow-xs hover:shadow-lg transition duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8DED2] flex items-center justify-center text-[#D05C3B] shadow-xs">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#30251F]/70 font-semibold px-2 py-0.5 rounded-md bg-white border border-[#E8DED2]">
                  Lagna &amp; Vargas
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-[#30251F]">
                  Kundli &amp; Birth Chart
                </h3>
                <p className="text-xs text-[#30251F]/60 mt-0.5">
                  12 Bhavas, 9 Grahas &amp; Divisional Charts
                </p>
              </div>

              <p className="text-xs text-[#30251F]/75 leading-relaxed pt-2 border-t border-[#E8DED2]/80">
                Generate high-precision North and South Indian Kundlis with exact Ascendant, planetary degrees, Shadbala, and Bhava Chalit placements.
              </p>

              <div className="flex flex-wrap gap-1.5 text-[10px] text-[#30251F]/70">
                <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8DED2]">D1 Rashi</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8DED2]">D9 Navamsha</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8DED2]">D10 Dashamsha</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E8DED2]/80">
              <Link
                href="/astrology?tab=kundli"
                className="flex items-center justify-between text-xs font-semibold text-[#D05C3B] hover:text-[#bc4f30] transition"
              >
                <span>Generate Free Kundli</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 3. Vimshottari Dasha Engine */}
          <div className="bg-[#F7F5F0] rounded-2xl border border-[#E8DED2] p-6 shadow-xs hover:shadow-lg transition duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8DED2] flex items-center justify-center text-[#D05C3B] shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#30251F]/70 font-semibold px-2 py-0.5 rounded-md bg-white border border-[#E8DED2]">
                  120-Year Cycle
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-[#30251F]">
                  Dasha &amp; Antardasha
                </h3>
                <p className="text-xs text-[#30251F]/60 mt-0.5">
                  Vimshottari planetary timeline engine
                </p>
              </div>

              <p className="text-xs text-[#30251F]/75 leading-relaxed pt-2 border-t border-[#E8DED2]/80">
                Comprehensive 5-level timeline analysis revealing your current Mahadasha, Antardasha, and Pratyantardasha with positive influences and mitigations.
              </p>

              <div className="flex flex-wrap gap-1.5 text-[10px] text-[#30251F]/70">
                <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8DED2]">Mahadasha</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8DED2]">Antardasha</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8DED2]">Remedies</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E8DED2]/80">
              <Link
                href="/astrology/my-dashboard"
                className="flex items-center justify-between text-xs font-semibold text-[#D05C3B] hover:text-[#bc4f30] transition"
              >
                <span>View Dasha Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 4. Vedic Numerology Engine */}
          <div className="bg-[#F7F5F0] rounded-2xl border border-[#E8DED2] p-6 shadow-xs hover:shadow-lg transition duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8DED2] flex items-center justify-center text-[#D05C3B] shadow-xs">
                  <Hash className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#30251F]/70 font-semibold px-2 py-0.5 rounded-md bg-white border border-[#E8DED2]">
                  Dual Engine
                </span>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-[#30251F]">
                  Vedic Numerology
                </h3>
                <p className="text-xs text-[#30251F]/60 mt-0.5">
                  Chaldean &amp; Pythagorean calculations
                </p>
              </div>

              <p className="text-xs text-[#30251F]/75 leading-relaxed pt-2 border-t border-[#E8DED2]/80">
                Discover your Life Path, Destiny, Soul Urge, and Personality Numbers calculated with master numbers, system transparency, and verified vibrational profiles.
              </p>

              <div className="flex flex-wrap gap-1.5 text-[10px] text-[#30251F]/70">
                <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8DED2]">Life Path</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8DED2]">Chaldean</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-[#E8DED2]">Pythagorean</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#E8DED2]/80">
              <Link
                href="/astrology/numerology"
                className="flex items-center justify-between text-xs font-semibold text-[#D05C3B] hover:text-[#bc4f30] transition"
              >
                <span>Calculate Numerology</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
