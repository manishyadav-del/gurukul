import { Suspense } from "react";
import DailyAstrologyDashboard from "@/components/astrology/DailyAstrologyDashboard";

export const metadata = {
  title: "Daily Astrology & Panchang Dashboard - Gurukul",
  description:
    "Explore today's verified Vedic Panchang, planetary transits, personalized Kundli guidance, and auspicious time windows.",
};

export default async function DailyAstrologyPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fcfaf5] flex items-center justify-center text-stone-500 text-sm">
          Loading Daily Cosmic Guidance...
        </div>
      }
    >
      <DailyAstrologyDashboard initialTab={resolvedSearchParams?.tab || "overview"} />
    </Suspense>
  );
}
