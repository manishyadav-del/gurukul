import { Suspense } from "react";
import DailyAstrologyDashboard from "@/components/astrology/DailyAstrologyDashboard";
import AstrologyPortalClient from "@/components/astrology/AstrologyPortalClient";

export const metadata = {
  title: "Daily Astrology Dashboard - Gurukul",
  description:
    "Explore today's verified Vedic Panchang, planetary transits, personalized guidance, and auspicious timing windows.",
};

export default async function AstrologyPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const showKundli = resolvedSearchParams?.tab === "kundli-portal";

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fcfaf5] flex items-center justify-center text-stone-500 text-sm">
          Loading Astrology Dashboard...
        </div>
      }
    >
      {showKundli ? (
        <AstrologyPortalClient />
      ) : (
        <DailyAstrologyDashboard initialTab={resolvedSearchParams?.tab || "overview"} />
      )}
    </Suspense>
  );
}
