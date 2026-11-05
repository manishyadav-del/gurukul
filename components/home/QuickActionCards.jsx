import Link from "next/link";
import {
  Compass,
  BookOpen,
  Sparkles,
  GraduationCap,
  Sun,
  ChevronRight,
} from "lucide-react";

export default function QuickActionCards() {
  const cards = [
    {
      title: "Generate Your Kundli",
      subtitle: "Enter birth details and explore your chart",
      href: "/astrology",
      icon: Compass,
      bgColor: "bg-amber-100 text-amber-800 border-amber-200",
    },
    {
      title: "Daily Cosmic Guide",
      subtitle: "Today's Panchang, transits & guidance",
      href: "/astrology/daily",
      icon: Sun,
      bgColor: "bg-orange-100 text-orange-800 border-orange-200",
    },
    {
      title: "Explore Library",
      subtitle: "Browse authentic astrology books",
      href: "/library",
      icon: BookOpen,
      bgColor: "bg-purple-100 text-purple-800 border-purple-200",
    },
    {
      title: "AI Astrology Assistant",
      subtitle: "Get answers with book references",
      href: "/ai/chat",
      icon: Sparkles,
      bgColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    },
    {
      title: "Learn & Practice",
      subtitle: "Quizzes, notes and personal progress",
      href: "/dashboard",
      icon: GraduationCap,
      bgColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.title}
            href={card.href}
            className="bg-white rounded-2xl border border-stone-200/90 p-3.5 flex items-center justify-between gap-3 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${card.bgColor} shadow-2xs group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-stone-900 group-hover:text-amber-800 transition truncate">
                  {card.title}
                </h3>
                <p className="text-[11px] text-stone-500 leading-snug truncate">
                  {card.subtitle}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
