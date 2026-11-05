import { Suspense } from "react";
import PersonalJyotishAssistant from "@/components/astrology/PersonalJyotishAssistant";

export const metadata = {
  title: "AI Jyotish Assistant - Gurukul",
  description:
    "Ask personal astrology questions grounded in your calculated birth chart, active Vimshottari Dasha, planetary transits, and verified classical treatises.",
};

export default async function AIAssistantPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialLang = resolvedSearchParams?.lang || "en";

  return (
    <div className="min-h-screen bg-[#fcfaf5] text-stone-800 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 text-[#c4903c] text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Classical Jyotisha AI Research</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#13382c] tracking-tight">
            AI Jyotish Assistant
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Inquire about your active Mahadasha, Gochara transits, planetary combinations, and explore grounded scriptural evidence from the Gurukul Digital Library.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="min-h-[500px] bg-white rounded-3xl border border-stone-200 flex items-center justify-center text-stone-500 text-sm">
              Loading AI Jyotish Assistant...
            </div>
          }
        >
          <PersonalJyotishAssistant initialLanguage={initialLang} />
        </Suspense>
      </div>
    </div>
  );
}
