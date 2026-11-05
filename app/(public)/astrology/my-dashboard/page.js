import { Suspense } from "react";
import PersonalAstrologyDashboard from "@/components/astrology/PersonalAstrologyDashboard";

export const metadata = {
  title: "My Vedic Astrology Dashboard - Gurukul",
  description:
    "Personalized Vedic Astrology dashboard featuring your birth chart, Vimshottari Dasha timeline, real-time Gochara transits, private journal, and daily guidance.",
};

export default async function MyAstrologyDashboardPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialLang = resolvedSearchParams?.lang || "en";

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fcfaf5] flex items-center justify-center text-stone-500 text-sm">
          Loading Personalized Astrology Dashboard...
        </div>
      }
    >
      <PersonalAstrologyDashboard initialLanguage={initialLang} />
    </Suspense>
  );
}
