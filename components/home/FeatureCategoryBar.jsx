"use client";

import Link from "next/link";
import { Sun, Compass, BookOpen, Sparkles, Users } from "lucide-react";

export default function FeatureCategoryBar() {
  const features = [
    {
      title: "Daily Horoscope",
      desc: "Get today's guidance",
      href: "/astrology/daily",
      icon: Sun,
    },
    {
      title: "Kundli Analysis",
      desc: "Understand your chart",
      href: "/astrology",
      icon: Compass,
    },
    {
      title: "Digital Library",
      desc: "Read sacred texts",
      href: "/library",
      icon: BookOpen,
    },
    {
      title: "AI Assistant",
      desc: "Ask & Learn",
      href: "/ai/chat",
      icon: Sparkles,
    },
    {
      title: "Knowledge Community",
      desc: "Share & Grow",
      href: "/community",
      icon: Users,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-[#ede7dc] p-3 shadow-xs">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Link
              key={idx}
              href={item.href}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#faf7f0] transition group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-[#faf5eb] border border-[#f0e3cc] flex items-center justify-center shrink-0 group-hover:bg-[#d4a359]/20 group-hover:border-[#d4a359] transition">
                <Icon className="w-5 h-5 text-[#c4903c]" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-semibold text-stone-900 group-hover:text-[#13382c] transition truncate font-serif">
                  {item.title}
                </div>
                <div className="text-[11px] text-stone-500 truncate">
                  {item.desc}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
