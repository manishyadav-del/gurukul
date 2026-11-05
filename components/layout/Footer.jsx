import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[#0f2e24] bg-[#102d24] text-stone-300 mt-auto">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 font-bold text-white text-lg font-serif">
              <div className="w-7 h-7 rounded-full bg-[#d4a359] flex items-center justify-center text-[#13382c] text-xs font-bold shadow-xs">
                ॐ
              </div>
              <span>Gurukul</span>
            </div>
            <p className="text-xs text-stone-300/80 leading-relaxed max-w-sm">
              Preserving and digitizing sacred Vedic astrology, Upanishads, Jyotisha shastras, and timeless Indian wisdom for modern seekers worldwide.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#d4a359] tracking-wider uppercase mb-3 font-serif">
              Wisdom & Shastras
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <Link href="/library" className="hover:text-white transition">
                  Digital Library
                </Link>
              </li>
              <li>
                <Link href="/astrology" className="hover:text-white transition">
                  Astrology Dashboard
                </Link>
              </li>
              <li>
                <Link href="/astrology?tab=kundli" className="hover:text-white transition">
                  Kundli Calculator
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-white transition">
                  Search Classical Passages
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#d4a359] tracking-wider uppercase mb-3 font-serif">
              Community & Learning
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <Link href="/community" className="hover:text-white transition">
                  Knowledge Community
                </Link>
              </li>
              <li>
                <Link href="/ai/chat" className="hover:text-white transition">
                  Gurukul AI Assistant
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition">
                  Learning Journey
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-white transition">
                  Vedic Quizzes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#d4a359] tracking-wider uppercase mb-3 font-serif">
              About & Platform
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <span className="text-stone-400">वसुधैव कुटुम्बकम्</span>
              </li>
              <li>
                <span className="text-stone-400">Knowledge Unites Us</span>
              </li>
              <li className="pt-2">
                <Link href="/admin" className="text-xs text-[#d4a359] hover:underline">
                  Admin Portal →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1a4638] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-400">
          <p>© {new Date().getFullYear()} Gurukul. Ancient Wisdom for a Brighter Tomorrow.</p>
          <p className="mt-2 sm:mt-0 font-medium text-stone-400">
            Rig Veda • Parashara • Upanishads • Jyotisha
          </p>
        </div>
      </div>
    </footer>
  );
}
