import { Suspense } from "react";
import DailyGuidanceClient from "@/components/astrology/DailyGuidanceClient";

export const metadata = {
  title: "Daily Vedic Remedies, Puja & Spiritual Guidance - Gurukul",
  description:
    "Explore traditional weekday pujas, mantra japa, charitable remedies (Daan), and mindful habits aligned with verified astronomical Panchang.",
};

export default function DailyGuidancePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fcfaf5] flex items-center justify-center text-stone-500 text-sm">
          Loading Daily Vedic Guidance...
        </div>
      }
    >
      <DailyGuidanceClient />
    </Suspense>
  );
}
