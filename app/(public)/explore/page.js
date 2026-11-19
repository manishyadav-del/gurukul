import { Suspense } from "react";
import KnowledgeExplorerClient from "@/components/explorer/KnowledgeExplorerClient";

export const metadata = {
  title: "AI Knowledge Explorer – Gurukul Digital Museum",
  description:
    "Unified exploration of Vedic Astrology (Rashis, Bhavas, Navagrahas, Nakshatras, Panchang) and Shat-Chakra Kundalini subtle anatomy, interconnected with source-grounded manuscripts.",
};

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center text-[#30251F]/60 text-sm font-sans">
          Loading Gurukul AI Knowledge Explorer...
        </div>
      }
    >
      <KnowledgeExplorerClient />
    </Suspense>
  );
}
