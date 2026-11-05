import { Suspense } from "react";
import KundaliniClient from "@/components/spirituality/KundaliniClient";

export const metadata = {
  title: "Kundalini & Chakra Guidance - Gurukul Classical Education",
  description:
    "Gentle educational exploration of classical Kundalini and Chakra concepts based on the Upanishads, Hatha Yoga Pradipika, and Tantraloka, with strict safety notices.",
};

export default function KundaliniPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fcfaf5] flex items-center justify-center text-stone-500 text-sm">
          Loading Kundalini Guidance...
        </div>
      }
    >
      <KundaliniClient />
    </Suspense>
  );
}
