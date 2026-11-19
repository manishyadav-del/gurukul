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
    <footer className="border-t border-[#E8DED2] bg-[#F7F5F0] text-[#30251F] mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Main Footer Columns */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* 1. About Gurukul */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5 font-bold text-[#30251F] text-xl font-serif">
              <div className="w-8 h-8 rounded-full bg-[#D05C3B] flex items-center justify-center text-white text-sm font-bold shadow-xs">
                ॐ
              </div>
              <span>Gurukul</span>
            </div>
            <p className="text-xs text-[#30251F]/80 leading-relaxed">
              Digital Museum of Timeless Wisdom. Preserving, digitizing, and illuminating ancient Indian manuscripts, classical treatises, and Vedic sciences for scholars, practitioners, and seekers worldwide.
            </p>
            <div className="text-[11px] text-[#D05C3B] font-serif font-semibold tracking-wide">
              ज्ञानं परमं ध्येयम्
            </div>
          </div>

          {/* 2. Explore */}
          <div>
            <h4 className="text-xs font-bold text-[#30251F] tracking-wider uppercase mb-3.5 font-serif">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-[#30251F]/75">
              <li>
                <Link href="/explore" className="hover:text-[#D05C3B] transition inline-block">
                  Knowledge Explorer
                </Link>
              </li>
              <li>
                <Link href="/library?category=shastra" className="hover:text-[#D05C3B] transition inline-block">
                  Shastra Learning
                </Link>
              </li>
              <li>
                <Link href="/library?category=astrology" className="hover:text-[#D05C3B] transition inline-block">
                  Vedic Astrology
                </Link>
              </li>
              <li>
                <Link href="/library?category=philosophy" className="hover:text-[#D05C3B] transition inline-block">
                  Philosophy &amp; Darshana
                </Link>
              </li>
              <li>
                <Link href="/library?category=sanskrit" className="hover:text-[#D05C3B] transition inline-block">
                  Sanskrit Heritage
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Library */}
          <div>
            <h4 className="text-xs font-bold text-[#30251F] tracking-wider uppercase mb-3.5 font-serif">
              Library
            </h4>
            <ul className="space-y-2 text-xs text-[#30251F]/75">
              <li>
                <Link href="/library" className="hover:text-[#D05C3B] transition inline-block">
                  Digital Library Catalog
                </Link>
              </li>
              <li>
                <Link href="/library?tab=manuscripts" className="hover:text-[#D05C3B] transition inline-block">
                  Featured Manuscripts
                </Link>
              </li>
              <li>
                <Link href="/library?category=vedas" className="hover:text-[#D05C3B] transition inline-block">
                  Vedas &amp; Samhitas
                </Link>
              </li>
              <li>
                <Link href="/library?category=ayurveda" className="hover:text-[#D05C3B] transition inline-block">
                  Ayurvedic Treatises
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-[#D05C3B] transition inline-block">
                  Search Corpus
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Research */}
          <div>
            <h4 className="text-xs font-bold text-[#30251F] tracking-wider uppercase mb-3.5 font-serif">
              Research
            </h4>
            <ul className="space-y-2 text-xs text-[#30251F]/75">
              <li>
                <Link href="/research" className="hover:text-[#D05C3B] transition inline-block">
                  Manuscript Hierarchy &amp; Passages
                </Link>
              </li>
              <li>
                <Link href="/sanskrit" className="hover:text-[#D05C3B] transition inline-block">
                  Sanskrit Grammar &amp; Sandhi
                </Link>
              </li>
              <li>
                <Link href="/ai/chat" className="hover:text-[#D05C3B] transition inline-block">
                  Scholarly AI Research Assistant
                </Link>
              </li>
              <li>
                <Link href="/astrology/my-dashboard" className="hover:text-[#D05C3B] transition inline-block">
                  Kundli &amp; Dasha Timeline
                </Link>
              </li>
              <li>
                <Link href="/astrology/numerology" className="hover:text-[#D05C3B] transition inline-block">
                  Vedic Numerology Engine
                </Link>
              </li>
            </ul>
          </div>

          {/* 5. Support & Platform */}
          <div>
            <h4 className="text-xs font-bold text-[#30251F] tracking-wider uppercase mb-3.5 font-serif">
              Support
            </h4>
            <ul className="space-y-2 text-xs text-[#30251F]/75">
              <li>
                <Link href="/dashboard" className="hover:text-[#D05C3B] transition inline-block">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/bookmarks" className="hover:text-[#D05C3B] transition inline-block">
                  Saved Manuscripts
                </Link>
              </li>
              <li>
                <Link href="/community" className="hover:text-[#D05C3B] transition inline-block">
                  Scholars Community
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-[#D05C3B] transition inline-block">
                  Vedic Wisdom Quizzes
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin"
                  className="text-xs font-semibold text-[#D05C3B] hover:underline inline-flex items-center gap-1"
                >
                  Admin Publishing Studio →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#E8DED2] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#30251F]/70">
          <p>© {new Date().getFullYear()} Gurukul. Digital Museum of Timeless Wisdom.</p>
          <p className="mt-2 sm:mt-0 font-serif text-[11px] text-[#30251F]/60">
            वसुधैव कुटुम्बकम् • Knowledge Unites All
          </p>
        </div>
      </div>
    </footer>
  );
}
