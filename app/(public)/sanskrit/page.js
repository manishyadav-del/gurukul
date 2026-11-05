import { Suspense } from "react";
import SanskritShastraStudio from "@/components/sanskrit/SanskritShastraStudio";

export const metadata = {
  title: "Sanskrit Shastra Intelligence - Gurukul",
  description:
    "Advanced morphological, metrical (Chhandas), Sandhi, Samasa, and Anvaya intelligence for Sanskrit verses from classical Vedic treatises.",
};

export default async function SanskritShastraPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const initialVerseId = resolvedSearchParams?.verse || "bphs-1-1";
  const initialLang = resolvedSearchParams?.lang || "en";

  return (
    <div className="min-h-screen bg-[#fcfaf5] text-stone-800 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <div className="flex items-center gap-2 text-[#c4903c] text-xs font-semibold uppercase tracking-wider mb-1">
            <span>Classical Philology & Shastra Vyakarna</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#13382c] tracking-tight">
            Sanskrit Shastra Intelligence Studio
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Examine authentic Sanskrit verses with syllable-level Chhandas meter scan, Pada-Cheda, Sandhi rules, Samasa compounds, verbal Dhatus, and syntactical Anvaya reconstruction.
          </p>
        </div>

        <Suspense
          fallback={
            <div className="min-h-[500px] bg-white rounded-3xl border border-stone-200 flex items-center justify-center text-stone-500 text-sm">
              Loading Sanskrit Shastra Studio...
            </div>
          }
        >
          <SanskritShastraStudio initialVerseId={initialVerseId} initialLanguage={initialLang} />
        </Suspense>
      </div>
    </div>
  );
}
