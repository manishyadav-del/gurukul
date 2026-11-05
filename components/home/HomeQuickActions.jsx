"use client";

import Link from "next/link";
import { Compass, Sparkles, Scale, Clock } from "lucide-react";

export default function HomeQuickActions() {
  const actions = [
    {
      title: "Daily Horoscope",
      desc: "Read for your zodiac sign",
      href: "/astrology/daily",
      iconBg: "bg-blue-100 text-blue-700",
      icon: Sparkles,
    },
    {
      title: "Kundli Report",
      desc: "Detailed analysis",
      href: "/astrology",
      iconBg: "bg-amber-100 text-amber-700",
      icon: Compass,
    },
    {
      title: "Will My Work Succeed?",
      desc: "Check auspicious timing",
      href: "/astrology/daily#muhurta",
      iconBg: "bg-orange-100 text-orange-700",
      icon: Scale,
    },
    {
      title: "Today's Choghadiya",
      desc: "Day & Night periods",
      href: "/astrology/daily#choghadiya",
      iconBg: "bg-sky-100 text-sky-700",
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-3.5">
      <h2 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">
        Quick Actions
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <Link
              key={idx}
              href={act.href}
              className="bg-white rounded-2xl border border-[#ede5d6] p-4 flex items-center gap-3.5 shadow-2xs hover:shadow-md hover:border-[#d4a359] transition group cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${act.iconBg} group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-[#13382c] transition truncate font-serif">
                  {act.title}
                </h3>
                <p className="text-xs text-stone-500 truncate mt-0.5">
                  {act.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
