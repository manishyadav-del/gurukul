import { Suspense } from "react";
import KnowledgeExplorerClient from "@/components/explorer/KnowledgeExplorerClient";

export const metadata = {
  title: "AI Knowledge Explorer - Gurukul Classical Shastra",
  description:
    "Unified exploration of Vedic Astrology (Rashis, Bhavas, Navagrahas, Nakshatras, Panchang) and Shat-Chakra Kundalini subtle anatomy, interconnected with source-grounded manuscripts.",
};

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fcfaf5] flex items-center justify-center text-stone-500 text-sm">
          Loading Gurukul AI Knowledge Explorer...
        </div>
      }
    >
      <KnowledgeExplorerClient />
    </Suspense>
  );
}
