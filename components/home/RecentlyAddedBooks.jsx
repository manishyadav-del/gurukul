import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function RecentlyAddedBooks({ books = [] }) {
  const displayBooks = Array.isArray(books) ? books.slice(0, 6) : [];

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

      {/* Grid of Genuine Book Covers */}
      {displayBooks.length === 0 ? (
        <div className="py-8 text-center text-xs font-serif text-stone-400">
          No published manuscripts available yet. Explore the library catalog soon.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {displayBooks.map((book) => (
            <Link
              key={book.slug || book.id}
              href={`/library/${book.slug || book.id}`}
              className="group flex flex-col justify-between hover:-translate-y-1 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#d4a359] rounded-xl p-1"
            >
              {/* Book Cover Image */}
              <div className="aspect-4/5 rounded-xl overflow-hidden shadow-xs border border-stone-200 bg-stone-100 relative group-hover:shadow-md transition">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={book.coverImageUrl || book.coverUrl || "/images/brihat-parashara.jpg"}
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
      )}
    </div>
  );
}
