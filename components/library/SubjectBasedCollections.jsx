"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BookOpen, Sparkles, Compass, ArrowRight, Eye, Sun, Activity, Flame } from "lucide-react";

const SUBJECT_CONFIGS = [
  {
    id: "astrology",
    name: "Vedic Astrology & Jyotisha",
    nameHi: "ज्योतिष शास्त्र",
    description: "Classical Jyotisha texts, planetary mathematical analysis, Vimshottari Dasha, and Muhurta.",
    icon: Sun,
    accent: "#D05C3B",
    matchKeywords: ["jyotish", "astrology", "hora", "samhita", "jataka", "parashara", "saravali", "phaladeepika", "dasha"],
  },
  {
    id: "ayurveda",
    name: "Ayurveda & Life Sciences",
    nameHi: "आयुर्वेद एवं आरोग्य",
    description: "Traditional medical literature, Tridosha pathology, botanical pharmacology, and verified source treatises.",
    icon: Activity,
    accent: "#5a8264",
    matchKeywords: ["ayurveda", "chikitsa", "arogya", "charaka", "sushruta", "medicine", "dravyaguna"],
  },
  {
    id: "yoga-philosophy",
    name: "Yoga & Darshana Philosophy",
    nameHi: "योग एवं दर्शन",
    description: "Patanjali Yoga Sutras, Advaita Vedanta, classical Darshana commentaries, and contemplative texts.",
    icon: Compass,
    accent: "#9b4528",
    matchKeywords: ["yoga", "sutra", "darshana", "philosophy", "gita", "vedanta", "sankhya", "nyaya"],
  },
  {
    id: "vedas-upanishads",
    name: "Vedas & Mukhya Upanishads",
    nameHi: "वेद एवं उपनिषद्",
    description: "Available Vedic Samhitas, Upanishadic metaphysical dialogues, Sanskrit chanting accents, and translations.",
    icon: Flame,
    accent: "#bf7b3b",
    matchKeywords: ["veda", "rig", "yajur", "sama", "atharva", "upanishad", "samhita", "aranyaka", "brahmana"],
  },
];

export default function SubjectBasedCollections({ books = [], onOpenDetails = null }) {
  const [activeSubjectId, setActiveSubjectId] = useState("astrology");

  // Group books by subject using matchKeywords and category
  const groupedBooks = useMemo(() => {
    const map = {};
    SUBJECT_CONFIGS.forEach((cfg) => (map[cfg.id] = []));

    books.forEach((book) => {
      const text = `${book.title || ""} ${book.description || ""} ${book.tradition || ""} ${book.category || ""}`.toLowerCase();
      for (const cfg of SUBJECT_CONFIGS) {
        if (cfg.matchKeywords.some((kw) => text.includes(kw))) {
          map[cfg.id].push(book);
          break; // assign to first matching subject
        }
      }
    });

    return map;
  }, [books]);

  const activeSubject = SUBJECT_CONFIGS.find((s) => s.id === activeSubjectId) || SUBJECT_CONFIGS[0];
  const activeBooks = groupedBooks[activeSubject.id] || [];

  return (
    <section className="space-y-6 py-4">
      {/* Subject Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-[#E8DED2]">
        <div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#D05C3B] block">
            Subject Collections
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#30251F] tracking-tight">
            Specialized Canonical Collections
          </h2>
        </div>

        {/* 4 Tabs */}
        <div className="flex flex-wrap gap-2">
          {SUBJECT_CONFIGS.map((subject) => {
            const Icon = subject.icon;
            const count = groupedBooks[subject.id]?.length || 0;
            const isActive = activeSubjectId === subject.id;

            return (
              <button
                key={subject.id}
                onClick={() => setActiveSubjectId(subject.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? "bg-[#30251F] text-white shadow-xs"
                    : "bg-white text-[#30251F]/70 border border-[#E8DED2] hover:border-[#D05C3B]/50 hover:text-[#30251F]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" style={{ color: isActive ? "#F2B872" : subject.accent }} />
                <span>{subject.name.split(" ")[0]}</span>
                {count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? "bg-white/20 text-white" : "bg-[#F7F5F0] text-[#30251F]/60"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Subject Banner */}
      <div className="bg-white rounded-2xl border border-[#E8DED2] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif text-[#D05C3B] font-bold">
              {activeSubject.nameHi}
            </span>
            <span className="text-stone-300">•</span>
            <h3 className="font-serif font-bold text-lg text-[#30251F]">
              {activeSubject.name}
            </h3>
          </div>
          <p className="text-xs text-[#30251F]/70 leading-relaxed max-w-2xl">
            {activeSubject.description}
          </p>
        </div>

        <Link
          href={`/library?category=${activeSubject.name.split(" ")[0].toLowerCase()}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F7F5F0] hover:bg-[#E8DED2] text-[#30251F] text-xs font-semibold transition shrink-0 self-start sm:self-auto border border-[#E8DED2]"
        >
          <span>View All in {activeSubject.name.split(" ")[0]}</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#D05C3B]" />
        </Link>
      </div>

      {/* Books Grid */}
      {activeBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {activeBooks.map((book) => {
            const cover = book.coverImageUrl || book.coverUrl || "/images/brihat-parashara.jpg";
            const readerUrl = `/library/${book.slug || book.id}/pdf`;
            const detailUrl = `/library/${book.slug || book.id}`;

            return (
              <div
                key={book.id || book.slug}
                className="bg-white rounded-2xl border border-[#E8DED2] p-4 shadow-xs hover:shadow-lg transition flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-[#241a14] relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cover}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        e.currentTarget.src = "/images/brihat-parashara.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 justify-between">
                      <Link
                        href={readerUrl}
                        className="text-[10px] text-white bg-[#D05C3B] px-2.5 py-1 rounded-md font-semibold"
                      >
                        Read Folio
                      </Link>
                      {onOpenDetails && (
                        <button
                          onClick={() => onOpenDetails(book)}
                          className="text-[10px] text-white bg-black/60 px-2 py-1 rounded-md font-medium cursor-pointer"
                        >
                          Dossier
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#30251F]/60 mb-1">
                      <span className="font-serif italic truncate max-w-[140px]">
                        {book.author || "Ancient Sage"}
                      </span>
                      {book.pageCount && (
                        <span className="font-mono text-[10px]">{book.pageCount}p</span>
                      )}
                    </div>

                    <Link href={detailUrl}>
                      <h4 className="font-serif font-bold text-sm text-[#30251F] group-hover:text-[#D05C3B] transition-colors line-clamp-1">
                        {book.title}
                      </h4>
                    </Link>

                    <p className="text-xs text-[#30251F]/70 line-clamp-2 leading-relaxed mt-1">
                      {book.description || "Authentic classical shastra published with verified pagination and Sanskrit OCR."}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#E8DED2]/60 flex items-center justify-between text-xs">
                  <Link
                    href={detailUrl}
                    className="font-medium text-[#30251F]/70 hover:text-[#D05C3B] transition"
                  >
                    Details
                  </Link>
                  <Link
                    href={readerUrl}
                    className="inline-flex items-center gap-1 font-semibold text-[#D05C3B] hover:text-[#bc4f30]"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E8DED2] p-8 text-center space-y-2">
          <BookOpen className="w-8 h-8 text-[#D05C3B]/40 mx-auto" />
          <h4 className="font-serif font-bold text-sm text-[#30251F]">
            No verified manuscripts published yet in {activeSubject.name}
          </h4>
          <p className="text-xs text-[#30251F]/60 max-w-sm mx-auto">
            Our Sanskrit pandits and archivists are preparing classical folios for this subject.
          </p>
        </div>
      )}
    </section>
  );
}
