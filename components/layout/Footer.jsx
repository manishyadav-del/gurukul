"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  // Hide public footer on all admin portal routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  return (
    <footer className="border-t border-[#0f2e24] bg-[#102d24] text-stone-200 mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 font-bold text-white text-lg font-serif">
              <div className="w-8 h-8 rounded-full bg-[#d4a359] flex items-center justify-center text-[#13382c] text-sm font-bold shadow-xs">
                ॐ
              </div>
              <span>Gurukul</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed max-w-sm">
              Preserving and digitizing sacred Vedic astrology, Upanishads, Jyotisha shastras, and timeless Indian wisdom for modern seekers worldwide.
            </p>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#d4a359] tracking-wider uppercase mb-3 font-serif">
              Wisdom & Shastras
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-200">
              <li>
                <Link href="/library" className="hover:text-white hover:underline transition inline-flex items-center min-h-[32px]">
                  Digital Library
                </Link>
              </li>
              <li>
                <Link href="/astrology" className="hover:text-white hover:underline transition inline-flex items-center min-h-[32px]">
                  Astrology Dashboard
                </Link>
              </li>
              <li>
                <Link href="/astrology?tab=kundli" className="hover:text-white hover:underline transition inline-flex items-center min-h-[32px]">
                  Kundli Calculator
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-white hover:underline transition inline-flex items-center min-h-[32px]">
                  Search Classical Passages
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#d4a359] tracking-wider uppercase mb-3 font-serif">
              Community & Learning
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-200">
              <li>
                <Link href="/community" className="hover:text-white hover:underline transition inline-flex items-center min-h-[32px]">
                  Knowledge Community
                </Link>
              </li>
              <li>
                <Link href="/ai/chat" className="hover:text-white hover:underline transition inline-flex items-center min-h-[32px]">
                  Gurukul AI Assistant
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white hover:underline transition inline-flex items-center min-h-[32px]">
                  Learning Journey
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-white hover:underline transition inline-flex items-center min-h-[32px]">
                  Vedic Quizzes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs sm:text-sm font-bold text-[#d4a359] tracking-wider uppercase mb-3 font-serif">
              About & Platform
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-200">
              <li>
                <span className="font-sanskrit text-stone-100 font-bold">वसुधैव कुटुम्बकम्</span>
              </li>
              <li>
                <span className="text-stone-300">Knowledge Unites Us</span>
              </li>
              <li className="pt-2">
                <Link href="/admin" className="text-xs sm:text-sm font-bold text-[#d4a359] hover:underline inline-flex items-center min-h-[32px]">
                  Admin Portal →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1a4638] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-stone-300">
          <p>© {new Date().getFullYear()} Gurukul. Ancient Wisdom for a Brighter Tomorrow.</p>
          <p className="mt-2 sm:mt-0 font-medium text-stone-200">
            Rig Veda • Parashara • Upanishads • Jyotisha
          </p>
        </div>
      </div>
    </footer>
  );
}
