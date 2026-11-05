"use client";

import { useState } from "react";
import {
  Heart,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Users,
  Compass,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

export default function KundliMatchingView({
  chart = null,
  familyMembers = [],
  language = "en",
}) {
  const isHi = language === "hi" || language === "hindi";

  // Partner 1 (Groom) & Partner 2 (Bride) inputs
  const [groomDob, setGroomDob] = useState("1998-05-15");
  const [groomTob, setGroomTob] = useState("08:45");
  const [groomPlace, setGroomPlace] = useState("Varanasi, India");
  const [groomLat] = useState(25.3176);
  const [groomLon] = useState(82.9739);

  const [brideDob, setBrideDob] = useState("2000-09-22");
  const [brideTob, setBrideTob] = useState("11:30");
  const [bridePlace, setBridePlace] = useState("Prayagraj, India");
  const [brideLat] = useState(25.4358);
  const [brideLon] = useState(81.8463);

  const [matchingResult, setMatchingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCalculateMatching = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        groomInput: {
          name: "Groom",
          birthDate: groomDob,
          birthTime: groomTob,
          birthPlace: groomPlace,
          latitude: groomLat,
          longitude: groomLon,
          timezone: "+05:30",
          gender: "male",
          language,
        },
        brideInput: {
          name: "Bride",
          birthDate: brideDob,
          birthTime: brideTob,
          birthPlace: bridePlace,
          latitude: brideLat,
          longitude: brideLon,
          timezone: "+05:30",
          gender: "female",
          language,
        },
        language,
      };

      const res = await fetch("/api/astrology/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to calculate matching.");
      }

      setMatchingResult(data);
    } catch (err) {
      setError(err.message || "Failed to calculate Ashtakoota compatibility.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#173d31] via-[#1d4d3e] to-[#25604e] p-6 rounded-2xl text-amber-50 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Heart className="w-4 h-4 text-rose-400" />
              {isHi ? "वैदिक अष्टकूट गुण मिलान (36 गुण)" : "Vedic Ashtakoota 36-Point Compatibility"}
            </div>
            <h3 className="text-2xl font-serif text-white font-bold">
              {isHi ? "कुंडली मिलान एवं संबंध सामंजस्य" : "Kundli Matching & Relationship Synergy"}
            </h3>
            <p className="text-amber-200/90 text-xs mt-1 max-w-2xl">
              {isHi
                ? "वर्ण, वश्य, तारा, योनि, ग्रह मैत्री, गण, भकूट और नाड़ी — महर्षि पराशर विरचित 8 कूटों पर आधारित शास्त्रीय विश्लेषण एवं दोष परिहार।"
                : "Varna, Vashya, Tara, Yoni, Graha Maitri, Gana, Bhakoot, and Nadi — Parashari 8-fold compatibility with classical cancellation algorithms."}
            </p>
          </div>

          <div className="bg-black/25 px-4 py-2.5 rounded-xl border border-amber-400/30 text-xs">
            <span className="text-amber-300 font-semibold">{isHi ? "कुल गुण" : "Total Gunas"}</span>
            <div className="text-xl font-bold font-mono text-white mt-0.5">36 Points</div>
          </div>
        </div>
      </div>

      {/* Dual Birth Input Form */}
      <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Partner 1 (Groom) */}
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
              <span className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-700" />
                {isHi ? "प्रथम साथी / वर विवरण" : "Partner 1 (Groom Details)"}
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">
                Groom
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-stone-500 font-medium block mb-1">
                  {isHi ? "जन्म तिथि" : "Birth Date"}
                </label>
                <input
                  type="date"
                  value={groomDob}
                  onChange={(e) => setGroomDob(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="text-stone-500 font-medium block mb-1">
                  {isHi ? "जन्म समय" : "Birth Time"}
                </label>
                <input
                  type="time"
                  value={groomTob}
                  onChange={(e) => setGroomTob(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="text-stone-500 font-medium block mb-1">
                {isHi ? "जन्म स्थान" : "Birthplace"}
              </label>
              <input
                type="text"
                value={groomPlace}
                onChange={(e) => setGroomPlace(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
              />
            </div>
          </div>

          {/* Partner 2 (Bride) */}
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/70 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-purple-200/60">
              <span className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-700" />
                {isHi ? "द्वितीय साथी / कन्या विवरण" : "Partner 2 (Bride Details)"}
              </span>
              <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded">
                Bride
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-stone-500 font-medium block mb-1">
                  {isHi ? "जन्म तिथि" : "Birth Date"}
                </label>
                <input
                  type="date"
                  value={brideDob}
                  onChange={(e) => setBrideDob(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                />
              </div>
              <div>
                <label className="text-stone-500 font-medium block mb-1">
                  {isHi ? "जन्म समय" : "Birth Time"}
                </label>
                <input
                  type="time"
                  value={brideTob}
                  onChange={(e) => setBrideTob(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="text-stone-500 font-medium block mb-1">
                {isHi ? "जन्म स्थान" : "Birthplace"}
              </label>
              <input
                type="text"
                value={bridePlace}
                onChange={(e) => setBridePlace(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs text-stone-900"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleCalculateMatching}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#173d31] hover:bg-[#1f5041] text-amber-300 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span>{isHi ? "गुण मिलान गणना जारी है..." : "Computing Ashtakoota Match..."}</span>
          ) : (
            <>
              <Heart className="w-4 h-4 text-rose-400" />
              <span>{isHi ? "36 गुण मिलान परिणाम देखें" : "Calculate 36 Guna Milan"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Section */}
      {matchingResult && (
        <div className="space-y-6">
          {/* Score Hero Card */}
          <div className="bg-white p-6 rounded-2xl border border-amber-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {isHi ? "अष्टकूट कुल प्राप्तांक" : "Ashtakoota Total Score"}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-serif font-bold text-[#173d31]">
                    {matchingResult.totalScore}
                  </span>
                  <span className="text-lg font-bold text-stone-400">/ 36</span>
                  <span
                    className={`ml-2 text-xs font-bold px-3 py-1 rounded-full ${
                      matchingResult.classification === "UTKRISHTA"
                        ? "bg-emerald-100 text-emerald-800"
                        : matchingResult.classification === "MADHYAMA"
                        ? "bg-amber-100 text-amber-900"
                        : "bg-rose-100 text-rose-900"
                    }`}
                  >
                    {matchingResult.scorePercentage}% • {matchingResult.classification}
                  </span>
                </div>
              </div>

              <div className="sm:text-right text-xs text-stone-600 space-y-1">
                <div>
                  <span className="font-semibold text-stone-800">Groom:</span> {matchingResult.groom.moonSign} ({matchingResult.groom.nakshatra} - Pada {matchingResult.groom.pada})
                </div>
                <div>
                  <span className="font-semibold text-stone-800">Bride:</span> {matchingResult.bride.moonSign} ({matchingResult.bride.nakshatra} - Pada {matchingResult.bride.pada})
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed bg-[#fcfaf5] p-3.5 rounded-xl border border-amber-100">
              {matchingResult.verdictText}
            </p>
          </div>

          {/* 8 Kootas Detailed Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {matchingResult.kootas.map((k, idx) => (
              <div
                key={idx}
                className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-2.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-serif font-bold text-stone-900">
                      {isHi ? k.sanskritName : k.name}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        k.obtainedPoints === k.maxPoints
                          ? "bg-emerald-100 text-emerald-800"
                          : k.obtainedPoints > 0
                          ? "bg-amber-100 text-amber-900"
                          : "bg-rose-100 text-rose-900"
                      }`}
                    >
                      {k.obtainedPoints} / {k.maxPoints}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono mt-1 pt-1 border-t border-amber-100/60">
                    <span>G: {k.groomValue}</span>
                    <span>•</span>
                    <span>B: {k.brideValue}</span>
                  </div>

                  {k.isCancelled && (
                    <div className="mt-1 text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{isHi ? "दोष परिहार" : "Dosha Cancelled"}</span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-stone-600 leading-relaxed pt-1 border-t border-amber-100/60">
                  {k.interpretation}
                </p>
              </div>
            ))}
          </div>

          {/* Manglik Compatibility Card */}
          {matchingResult.manglik && (
            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                <span className="font-serif font-bold text-stone-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  {isHi ? "मांगलिक विचार एवं कुज दोष सामंजस्य" : "Manglik (Kuja Dosha) Mutual Alignment"}
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    matchingResult.manglik.compatibilityStatus === "NEUTRALIZED" ||
                    matchingResult.manglik.compatibilityStatus === "CLEAR"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {matchingResult.manglik.compatibilityStatus}
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                {matchingResult.manglik.description}
              </p>
            </div>
          )}

          {/* Non-fatalistic Mindfulness Guidance */}
          <div className="bg-[#fbf9f4] p-4 rounded-2xl border border-amber-200 text-xs text-stone-700 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{matchingResult.mindfulnessGuidance}</p>
          </div>
        </div>
      )}
    </div>
  );
}
