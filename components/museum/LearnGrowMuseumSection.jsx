"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, Feather, Award, CheckCircle2, Sparkles } from "lucide-react";

export default function LearnGrowMuseumSection() {
  const learningPillars = [
    {
      title: "Sanskrit Grammar & Morphological Analysis",
      description:
        "Learn Paninian grammar, Sandhi splitters, Samasa compounds, and Dhatu root conjugations with interactive scholarly analysis tools.",
      actionLabel: "Open Sanskrit Studio",
      href: "/sanskrit",
      badge: "Grammar & Linguistics",
    },
    {
      title: "Vedic Wisdom Quizzes & Self-Assessment",
      description:
        "Test your comprehension across Rigvedic hymns, Upanishadic philosophy, Astrological Yogas, and Bhagavad Gita verses.",
      actionLabel: "Take Knowledge Quiz",
      href: "/quiz",
      badge: "Interactive Assessment",
    },
    {
      title: "Personal Learning Journey & Bookmarks",
      description:
        "Track your reading progress, save sacred passages to your private study circles, and organize notes across classical manuscripts.",
      actionLabel: "Access Student Dashboard",
      href: "/dashboard",
      badge: "Personal Study",
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#F7F5F0]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#D05C3B]" />
              <span className="text-xs font-serif uppercase tracking-widest text-[#D05C3B] font-semibold">
                Education &amp; Growth
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#30251F] tracking-tight">
              Learn, Master &amp; Preserve
            </h2>
            <p className="text-sm text-[#30251F]/70 max-w-xl font-sans">
              Gurukul combines museum-grade manuscript preservation with accessible pedagogic tools for scholars, students, and curious minds.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D05C3B] hover:text-[#bc4f30] transition group self-start md:self-end"
          >
            <span>Explore Educational Resources</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {learningPillars.map((pillar, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-[#E8DED2] p-7 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#D05C3B] font-bold px-2.5 py-1 rounded-full bg-[#E8DED2]/50 inline-block">
                  {pillar.badge}
                </span>

                <h3 className="font-serif font-bold text-xl text-[#30251F] group-hover:text-[#D05C3B] transition-colors leading-snug">
                  {pillar.title}
                </h3>

                <p className="text-xs text-[#30251F]/75 leading-relaxed font-sans">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#E8DED2]/80">
                <Link
                  href={pillar.href}
                  className="inline-flex items-center justify-between w-full text-xs font-semibold text-[#30251F] group-hover:text-[#D05C3B] transition"
                >
                  <span>{pillar.actionLabel}</span>
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
