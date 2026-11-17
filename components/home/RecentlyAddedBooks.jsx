import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function RecentlyAddedBooks({ books = [] }) {
  const defaultBooks = [
    {
      title: "Brihat Parashara Hora Shastra",
      slug: "brihat-parashara-hora-shastra",
      language: "Sanskrit",
      pageCount: 1200,
      coverUrl: "/images/brihat-parashara.jpg",
    },
    {
      title: "Saravali",
      slug: "saravali",
      language: "Sanskrit",
      pageCount: 850,
      coverUrl: "/images/saravali.jpg",
    },
    {
      title: "Phaladeepika",
      slug: "phaladeepika",
      language: "Sanskrit",
      pageCount: 642,
      coverUrl: "/images/phaladeepika.jpg",
    },
    {
      title: "Jataka Parijata",
      slug: "jataka-parijata",
      language: "Sanskrit",
      pageCount: 720,
      coverUrl: "/images/jataka-parijata.jpg",
    },
    {
      title: "Manasagari",
      slug: "manasagari",
      language: "Sanskrit",
      pageCount: 910,
      coverUrl: "/images/manasagari.jpg",
    },
    {
      title: "Brihat Jataka",
      slug: "brihat-jataka",
      language: "Sanskrit",
      pageCount: 1320,
      coverUrl: "/images/brihat-jataka.jpg",
    },
  ];

  const displayBooks = books.length >= 6 ? books.slice(0, 6) : defaultBooks;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
        <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
          Recently Added Books
        </h3>
        <Link
          href="/library"
          className="text-xs font-semibold text-amber-900 hover:text-amber-950 transition flex items-center min-h-[44px]"
        >
          <span>View Library</span>
          <ChevronRight className="w-4 h-4 ml-0.5" />
        </Link>
      </div>

      {/* Grid of 6 Book Covers */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {displayBooks.map((book) => (
          <Link
            key={book.slug}
            href={`/library/${book.slug}`}
            className="group flex flex-col justify-between hover:-translate-y-1 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#d4a359] rounded-xl p-1"
          >
            {/* Book Cover Image */}
            <div className="aspect-4/5 rounded-xl overflow-hidden shadow-xs border border-stone-200 bg-stone-100 relative group-hover:shadow-md transition">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={book.coverUrl || "/images/brihat-parashara.jpg"}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Book Details */}
            <div className="pt-2.5 space-y-1.5">
              <h4 className="text-xs font-bold text-stone-900 leading-snug line-clamp-1 group-hover:text-amber-900 transition">
                {book.title}
              </h4>
              <div className="flex items-center justify-between text-xs">
                <span className="px-1.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-900 border border-purple-200/60">
                  {book.language || "Sanskrit"}
                </span>
                <span className="text-[11px] text-stone-600 font-medium">
                  {book.pageCount ? `${book.pageCount}p` : "Full"}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
