"use client";

import { useMemo } from "react";
import {
  Compass,
  Sparkles,
  BookOpen,
  Feather,
  Sun,
  Flame,
  Activity,
  Hash,
  Binary,
  Layers,
  ArrowRight,
} from "lucide-react";

const CATEGORY_DEFINITIONS = [
  {
    id: "Jyotisha",
    nameEn: "Jyotisha",
    nameHi: "ज्योतिष",
    description: "Planetary principles, natal horoscopy, and mathematical astronomy.",
    icon: Sun,
    accent: "#D05C3B",
  },
  {
    id: "Shastra",
    nameEn: "Shastra",
    nameHi: "शास्त्र",
    description: "Foundational traditional canons, Dharmashastras, and classical commentaries.",
    icon: BookOpen,
    accent: "#bf7b3b",
  },
  {
    id: "Vedas",
    nameEn: "Vedas",
    nameHi: "वेद",
    description: "The four sacred Samhitas: Rig, Yajur, Sama, and Atharva hymns.",
    icon: Flame,
    accent: "#9b4528",
  },
  {
    id: "Upanishads",
    nameEn: "Upanishads",
    nameHi: "उपनिषद्",
    description: "Mukhya Upanishadic dialogues on Brahman, Atman, and consciousness.",
    icon: Sparkles,
    accent: "#8c3b28",
  },
  {
    id: "Sanskrit",
    nameEn: "Sanskrit",
    nameHi: "संस्कृत",
    description: "Paninian vyakarana grammar, morphology, Sandhi, and classical literature.",
    icon: Feather,
    accent: "#D05C3B",
  },
  {
    id: "Philosophy",
    nameEn: "Philosophy",
    nameHi: "दर्शन",
    description: "Advaita Vedanta, Sankhya, Nyaya, Vaisheshika, and classical Darshana.",
    icon: Compass,
    accent: "#7a3f32",
  },
  {
    id: "Yoga",
    nameEn: "Yoga",
    nameHi: "योग",
    description: "Raja Yoga sutras, meditation paths, Pranayama, and inner sadhana.",
    icon: Activity,
    accent: "#5a8264",
  },
  {
    id: "Ayurveda",
    nameEn: "Ayurveda",
    nameHi: "आयुर्वेद",
    description: "Charaka, Sushruta, Tridosha balance, and holistic classical medicine.",
    icon: Activity,
    accent: "#4d7857",
  },
  {
    id: "Numerology",
    nameEn: "Numerology",
    nameHi: "अंकशास्त्र",
    description: "Vedic, Chaldean, and Pythagorean numerical vibrations and destiny numbers.",
    icon: Hash,
    accent: "#8c5b3e",
  },
  {
    id: "Vedic Science",
    nameEn: "Vedic Science",
    nameHi: "विज्ञान",
    description: "Sulba Sutras mathematics, Vastu Shastra geometry, and ancient sciences.",
    icon: Binary,
    accent: "#b06a3b",
  },
];

export default function BrowseByKnowledgeCategory({
  books = [],
  selectedCategory = "All",
  onSelectCategory,
}) {
  // Count books per category
  const categoryCounts = useMemo(() => {
    const counts = {};
    CATEGORY_DEFINITIONS.forEach((cat) => (counts[cat.id] = 0));

    books.forEach((b) => {
      const cat = b.category || b.tradition || "Shastra";
      if (counts[cat] !== undefined) {
        counts[cat] += 1;
      } else {
        // Semantic match
        const txt = `${b.title} ${b.description || ""}`.toLowerCase();
        if (txt.includes("jyotish") || txt.includes("hora") || txt.includes("astrology")) counts.Jyotisha += 1;
        else if (txt.includes("ayurveda") || txt.includes("chikitsa")) counts.Ayurveda += 1;
        else if (txt.includes("veda") || txt.includes("samhita")) counts.Vedas += 1;
        else if (txt.includes("upanishad")) counts.Upanishads += 1;
        else if (txt.includes("yoga")) counts.Yoga += 1;
        else if (txt.includes("sanskrit")) counts.Sanskrit += 1;
        else if (txt.includes("numerology") || txt.includes("अंक")) counts.Numerology += 1;
        else if (txt.includes("math") || txt.includes("ganita") || txt.includes("science")) counts["Vedic Science"] += 1;
        else if (txt.includes("gita") || txt.includes("philosophy") || txt.includes("darshana")) counts.Philosophy += 1;
        else counts.Shastra += 1;
      }
    });

    return counts;
  }, [books]);

  return (
    <section className="space-y-4 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 border-b border-[#E8DED2]">
        <div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#D05C3B] block">
            Subject Taxonomy
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#30251F] tracking-tight">
            Browse by Knowledge Category
          </h2>
        </div>
        <button
          onClick={() => onSelectCategory("All")}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full transition cursor-pointer self-start sm:self-auto ${
            selectedCategory === "All"
              ? "bg-[#D05C3B] text-white"
              : "text-[#30251F]/70 hover:text-[#D05C3B]"
          }`}
        >
          View All Subjects ({books.length})
        </button>
      </div>

      {/* 10 Category Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        {CATEGORY_DEFINITIONS.map((cat) => {
          const Icon = cat.icon;
          const count = categoryCounts[cat.id] || 0;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? "All" : cat.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? "bg-[#30251F] text-white border-[#30251F] shadow-md scale-[1.02]"
                  : "bg-white text-[#30251F] border-[#E8DED2] hover:border-[#D05C3B]/60 hover:shadow-md"
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-[#D05C3B] text-white"
                        : "bg-[#F7F5F0] text-[#D05C3B] group-hover:bg-[#D05C3B]/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white font-bold"
                        : "bg-[#F7F5F0] text-[#30251F]/70"
                    }`}
                  >
                    {count} {count === 1 ? "text" : "texts"}
                  </span>
                </div>

                <div>
                  <span
                    className={`text-[10px] font-serif block ${
                      isSelected ? "text-[#F2B872]" : "text-[#D05C3B]"
                    }`}
                  >
                    {cat.nameHi}
                  </span>
                  <h3
                    className={`font-serif font-bold text-sm tracking-tight leading-tight ${
                      isSelected ? "text-white" : "text-[#30251F] group-hover:text-[#D05C3B]"
                    }`}
                  >
                    {cat.nameEn}
                  </h3>
                </div>

                <p
                  className={`text-[11px] line-clamp-2 leading-relaxed ${
                    isSelected ? "text-stone-300" : "text-[#30251F]/60"
                  }`}
                >
                  {cat.description}
                </p>
              </div>

              <div
                className={`mt-3 pt-2 border-t text-[10px] font-semibold flex items-center justify-between ${
                  isSelected
                    ? "border-white/20 text-[#F2B872]"
                    : "border-[#E8DED2]/60 text-[#30251F]/60 group-hover:text-[#D05C3B]"
                }`}
              >
                <span>{isSelected ? "Active Filter" : "Filter Canons"}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
