import Link from "next/link";
import { ChevronRight, Orbit, Target, Sparkles, Star } from "lucide-react";

export default function TrendingTopics() {
  const topics = [
    {
      title: "Saturn in 7th House",
      meta: "24 books • 186 passages",
      icon: Orbit,
      color: "bg-purple-100 text-purple-900 border border-purple-200",
      query: "Saturn 7th house",
    },
    {
      title: "Mangal Dosha",
      meta: "18 books • 124 passages",
      icon: Target,
      color: "bg-rose-100 text-rose-900 border border-rose-200",
      query: "Mangal Dosha",
    },
    {
      title: "Rahu in Different Houses",
      meta: "21 books • 172 passages",
      icon: Sparkles,
      color: "bg-indigo-100 text-indigo-900 border border-indigo-200",
      query: "Rahu houses",
    },
    {
      title: "Nakshatra Characteristics",
      meta: "32 books • 410 passages",
      icon: Star,
      color: "bg-amber-100 text-amber-900 border border-amber-200",
      query: "Nakshatra characteristics",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-3">
        <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
          Trending Topics
        </h3>
        <Link
          href="/search"
          className="text-xs font-semibold text-amber-900 hover:text-amber-950 transition flex items-center min-h-[44px]"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </Link>
      </div>

      {/* Topics list */}
      <div className="space-y-2">
        {topics.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.title}
              href={`/search?q=${encodeURIComponent(t.query)}`}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition group min-h-[44px]"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.color}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-amber-900 transition truncate">
                  {t.title}
                </h4>
                <p className="text-xs text-stone-600 truncate font-medium">{t.meta}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
