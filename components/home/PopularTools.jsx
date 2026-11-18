import Link from "next/link";
import {
  ChevronRight,
  Compass,
  CalendarDays,
  HeartHandshake,
  Sparkles,
  Calendar,
  Hash,
} from "lucide-react";

export default function PopularTools() {
  const tools = [
    {
      title: "Planetary Positions",
      desc: "Current transit & retrograde",
      icon: Compass,
      color: "bg-amber-100 text-amber-900 border border-amber-200",
      href: "/astrology",
    },
    {
      title: "Vedic Numerology",
      desc: "Mulank, Bhagyank, Loshu Grid",
      icon: Hash,
      color: "bg-indigo-100 text-indigo-900 border border-indigo-200",
      href: "/astrology/numerology",
    },
    {
      title: "Dasha Calculator",
      desc: "Vimshottari and Mahadashas",
      icon: CalendarDays,
      color: "bg-rose-100 text-rose-900 border border-rose-200",
      href: "/astrology",
    },
    {
      title: "Kundli Matching",
      desc: "Guna Milan analysis",
      icon: HeartHandshake,
      color: "bg-purple-100 text-purple-900 border border-purple-200",
      href: "/astrology",
    },
    {
      title: "Daily Panchang",
      desc: "Tithi, Nakshatra, Yoga, Karana",
      icon: Calendar,
      color: "bg-pink-100 text-pink-900 border border-pink-200",
      href: "/astrology/daily",
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-2">
        <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
          Popular Tools
        </h3>
        <Link
          href="/astrology"
          className="text-xs font-semibold text-amber-900 hover:text-amber-950 transition flex items-center min-h-[44px]"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </Link>
      </div>

      {/* Tools list */}
      <div className="space-y-1.5">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.title}
              href={tool.href}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 transition group min-h-[44px]"
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${tool.color}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-amber-900 transition truncate">
                  {tool.title}
                </h4>
                <p className="text-xs text-stone-600 truncate font-medium">{tool.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
