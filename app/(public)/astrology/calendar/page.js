import { Suspense } from "react";
import VedicCalendarStudio from "@/components/astrology/VedicCalendarStudio";

export const metadata = {
  title: "Vedic Festival & Vrata Calendar - Gurukul",
  description:
    "Explore verified Hindu festivals, Ekadashi Vrata, Pradosha, Parana timings, and classical scriptural references with high astronomical precision.",
};

export default async function VedicCalendarPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const initialTab = resolvedParams?.tab || "calendar";

  return (
    <div className="min-h-screen bg-[#fcfaf5] text-stone-900 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 max-w-7xl mx-auto">
      <Suspense
        fallback={
          <div className="min-h-[50vh] flex items-center justify-center text-stone-500 text-sm">
            Loading Vedic Calendar...
          </div>
        }
      >
        <VedicCalendarStudio initialTab={initialTab} />
      </Suspense>
    </div>
  );
}
