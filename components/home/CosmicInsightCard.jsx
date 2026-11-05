"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function CosmicInsightCard() {
  const insights = [
    {
      planet: "Jupiter (Guru)",
      title: "Today's Transit",
      shloka: "“गुरु ज्ञानः प्रकाशं ददाति, धर्मे स्थितिं ददाति।”",
      meaning: "Jupiter brings wisdom, clarity and supports your journey towards higher learning.",
      image: "/images/jupiter-insight.jpg",
    },
    {
      planet: "Sun (Surya)",
      title: "Vitality & Purpose",
      shloka: "“आदित्यस्य नमस्कारं ये कुर्वन्ति दिने दिने।”",
      meaning: "The Sun fosters inner vitality, righteous purpose, and courage in noble actions.",
      image: "/images/jupiter-insight.jpg",
    },
    {
      planet: "Saturn (Shani)",
      title: "Discipline & Karma",
      shloka: "“नीलांजन समाभासं रविपुत्रं यमाग्रजम्।”",
      meaning: "Saturn instills enduring patience, perseverance, and mastery over obstacles.",
      image: "/images/jupiter-insight.jpg",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  function handleNext() {
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  }

  const current = insights[currentIndex];

  return (
    <div className="bg-[#fcf8f0] rounded-2xl border border-amber-200/80 p-5 shadow-2xs flex flex-col justify-between relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-amber-200/50 pb-3">
        <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
          Today's Cosmic Insight
        </h3>
        <Link
          href="/astrology"
          className="text-xs font-semibold text-amber-800 hover:text-amber-900 transition flex items-center"
        >
          <span>Today's Transit</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Main Body */}
      <div className="flex items-center gap-4 py-4">
        {/* Planet Thumbnail */}
        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-300 shadow-xs shrink-0 bg-stone-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.image}
            alt={current.planet}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Shloka and Meaning */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
            {current.planet}
          </h4>
          <p className="font-serif text-xs sm:text-sm font-semibold text-amber-900 leading-snug">
            {current.shloka}
          </p>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            {current.meaning}
          </p>
        </div>

        {/* Carousel Next Arrow Button */}
        <button
          onClick={handleNext}
          title="Next Cosmic Insight"
          className="w-7 h-7 rounded-full bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 flex items-center justify-center shrink-0 transition cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Subtle indicator dots */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        {insights.map((_, i) => (
          <span
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === currentIndex ? "w-4 bg-amber-700" : "bg-amber-300/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
