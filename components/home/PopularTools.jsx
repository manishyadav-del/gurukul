import Link from "next/link";
import {
  ChevronRight,
  Compass,
  CalendarDays,
  HeartHandshake,
  Sparkles,
  Calendar,
} from "lucide-react";

export default function PopularTools() {
  const tools = [
    {
      title: "Planetary Positions",
      desc: "Current transit and retrograde",
      icon: Compass,
      color: "bg-amber-100 text-amber-700",
      href: "/astrology",
    },
    {
      title: "Dasha Calculator",
      desc: "Vimshottari and other dashas",
      icon: CalendarDays,
      color: "bg-rose-100 text-rose-700",
      href: "/astrology",
    },
    {
      title: "Compatibility",
      desc: "Relationship analysis",
      icon: HeartHandshake,
      color: "bg-purple-100 text-purple-700",
      href: "/astrology",
    },
    {
      title: "Remedies",
      desc: "Traditional upayas",
      icon: Sparkles,
      color: "bg-emerald-100 text-emerald-700",
      href: "/ai/chat",
    },
    {
      title: "Panchang",
      desc: "Daily tithi, nakshatra, yoga",
      icon: Calendar,
      color: "bg-pink-100 text-pink-700",
      href: "/astrology",
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
          className="text-xs font-semibold text-amber-800 hover:text-amber-900 transition flex items-center"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
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
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-stone-50 transition group"
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${tool.color}`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-stone-900 group-hover:text-amber-800 transition truncate">
                  {tool.title}
                </h4>
                <p className="text-[11px] text-stone-400 truncate">{tool.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
