"use client";

import { useState, useEffect, useRef } from "react";
import {
  Wind,
  Flame,
  Droplets,
  Layers,
  Sparkles,
  Heart,
  Eye,
  Crown,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  Info,
  CheckCircle2,
  Compass,
} from "lucide-react";
import {
  PRANAYAMA_PRACTICES,
  SUBTLE_NADIS,
  THREE_GRANTHIS,
} from "../../server/spirituality/pranayamaData.js";

export default function PranayamaAndTattvaStudio({ language = "en" }) {
  const isHi = language === "hi" || language === "hindi";

  const [activeTab, setActiveTab] = useState("pranayama"); // pranayama | nadis | granthis
  const [selectedPractice, setSelectedPractice] = useState(PRANAYAMA_PRACTICES[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState("Inhale"); // Inhale | Exhale
  const [secondsLeft, setSecondsLeft] = useState(PRANAYAMA_PRACTICES[0].inhaleSec);
  const [completedCycles, setCompletedCycles] = useState(0);

  const timerRef = useRef(null);

  // Switch practice
  const handleSelectPractice = (practice) => {
    setIsRunning(false);
    setSelectedPractice(practice);
    setBreathPhase("Inhale");
    setSecondsLeft(practice.inhaleSec);
    setCompletedCycles(0);
  };

  // Breathing loop
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Toggle phase
        if (breathPhase === "Inhale") {
          setBreathPhase("Exhale");
          return selectedPractice.exhaleSec;
        } else {
          setBreathPhase("Inhale");
          setCompletedCycles((c) => c + 1);
          return selectedPractice.inhaleSec;
        }
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, breathPhase, selectedPractice]);

  const handleReset = () => {
    setIsRunning(false);
    setBreathPhase("Inhale");
    setSecondsLeft(selectedPractice.inhaleSec);
    setCompletedCycles(0);
  };

  // Visual pulse calculation
  const totalPhaseSec = breathPhase === "Inhale" ? selectedPractice.inhaleSec : selectedPractice.exhaleSec;
  const progressRatio = (totalPhaseSec - secondsLeft + 1) / totalPhaseSec;
  const scale = breathPhase === "Inhale" ? 1 + progressRatio * 0.35 : 1.35 - progressRatio * 0.35;

  return (
    <div className="space-y-6">
      {/* Top Selector Navigation */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setActiveTab("pranayama")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "pranayama"
              ? "border-amber-600 text-amber-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Wind className="w-4 h-4" />
          <span>{isHi ? "प्राणायाम एवं ध्यान लयबद्धता" : "Mindful Pranayama Pacing"}</span>
        </button>
        <button
          onClick={() => setActiveTab("nadis")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "nadis"
              ? "border-amber-600 text-amber-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>{isHi ? "त्रि-नाड़ी विज्ञान (इड़ा, पिंगला, सुषुम्ना)" : "Three Nadis Studio"}</span>
        </button>
        <button
          onClick={() => setActiveTab("granthis")}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
            activeTab === "granthis"
              ? "border-amber-600 text-amber-900"
              : "border-transparent text-stone-500 hover:text-stone-800"
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>{isHi ? "त्रि-ग्रन्थि निरूपण (Brahma, Vishnu, Rudra)" : "Three Granthis"}</span>
        </button>
      </div>

      {/* TAB 1: PRANAYAMA PACER */}
      {activeTab === "pranayama" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Practice Selection Cards */}
          <div className="lg:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 px-1">
              {isHi ? "शास्त्रीय प्राणायाम चयन" : "Select Classical Practice"}
            </h3>
            {PRANAYAMA_PRACTICES.map((p) => {
              const isSelected = selectedPractice.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPractice(p)}
                  className={`w-full text-left p-4 rounded-xl border transition flex flex-col gap-1.5 ${
                    isSelected
                      ? "bg-amber-50/80 border-amber-400 shadow-xs ring-1 ring-amber-400"
                      : "bg-white border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-stone-900 font-serif">
                      {isHi ? p.nameHi : p.nameEn}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                      {p.ratio}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    {isHi ? p.descriptionHi : p.descriptionEn}
                  </p>
                  <span className="text-[10px] text-amber-800 italic mt-0.5">
                    {p.traditionalText}
                  </span>
                </button>
              );
            })}

            {/* Strict Non-Fatalistic Mindfulness Guardrail */}
            <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-600 space-y-1">
              <div className="flex items-center gap-1.5 text-stone-800 font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
                <span>{isHi ? "सचेत प्राणायाम मर्यादा" : "Classical Safety Principle"}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {isHi
                  ? "हठयोग प्रदीपिका के अनुसार प्राणायाम का अभ्यास सहज, शांत एवं बिना किसी हठ अथवा सांस रोकने के दबाव के किया जाना चाहिए।"
                  : "Gurukul follows gentle mindfulness pacing: strictly zero forced Kumbhaka (breath retention) or aggressive straining. Practice naturally within comfort."}
              </p>
            </div>
          </div>

          {/* Right: Interactive Breathing Pacer Orb */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 flex flex-col items-center justify-center min-h-[420px] shadow-xs">
            <div className="text-center mb-6">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-900">
                {selectedPractice.ratio}
              </span>
              <h2 className="text-xl font-bold font-serif text-stone-900 mt-2">
                {isHi ? selectedPractice.nameHi : selectedPractice.nameEn}
              </h2>
              <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
                {selectedPractice.recommendedFor}
              </p>
            </div>

            {/* Animated Pacing Orb */}
            <div className="relative w-56 h-56 flex items-center justify-center my-4">
              <div
                className="absolute w-44 h-44 rounded-full bg-amber-500/15 border-2 border-amber-400/40 transition-transform duration-1000 ease-in-out"
                style={{ transform: `scale(${scale})` }}
              />
              <div
                className="absolute w-36 h-36 rounded-full bg-amber-600/20 transition-transform duration-1000 ease-in-out"
                style={{ transform: `scale(${scale * 0.9})` }}
              />

              <div className="relative z-10 text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                  {breathPhase === "Inhale" ? (isHi ? "पूरक (श्वास लें)" : "Inhale") : (isHi ? "रेचक (श्वास छोड़ें)" : "Exhale")}
                </span>
                <span className="text-4xl font-mono font-bold text-stone-900 block">
                  {secondsLeft}s
                </span>
                <span className="text-[11px] text-stone-500 block">
                  {isHi ? `पूर्ण चक्र: ${completedCycles}` : `Cycles: ${completedCycles}`}
                </span>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 shadow-xs transition ${
                  isRunning
                    ? "bg-stone-800 text-white hover:bg-stone-900"
                    : "bg-amber-600 text-white hover:bg-amber-700"
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>{isHi ? "विश्राम लें" : "Pause Session"}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>{isHi ? "सत्र आरम्भ करें" : "Begin Pacing"}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                title="Reset timer"
                className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 transition"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: THREE NADIS STUDIO */}
      {activeTab === "nadis" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SUBTLE_NADIS.map((n) => (
            <div
              key={n.id}
              className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                <h3 className="text-base font-bold text-stone-900 font-serif">{n.name}</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-stone-100 rounded-md text-stone-600">
                  {n.nostril}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-stone-600">
                <div>
                  <span className="font-semibold text-stone-800">Element & Force:</span> {n.element}
                </div>
                <div>
                  <span className="font-semibold text-stone-800">Psychological Nature:</span> {n.nature}
                </div>
                <div>
                  <span className="font-semibold text-stone-800">Subtle Luminescence:</span> {n.color}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 leading-relaxed">
                <span className="font-semibold block text-stone-900 mb-0.5">Yogic Balance:</span>
                {n.guidance}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: THREE GRANTHIS */}
      {activeTab === "granthis" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block mb-0.5">
                {isHi ? "ग्रन्थि त्रय का शास्त्रीय तात्पर्य" : "Classical Significance of the Three Knots (Granthis)"}
              </span>
              {isHi
                ? "योग शास्त्रों में 'ग्रन्थि' चेतना की उन सूक्ष्म ग्रन्थियों अथवा मानसिक अड़चनों को कहते हैं जो मनुष्य को भौतिक भय, भावनात्मक आसक्ति एवं वैचारिक अहंकार में बाँधे रखती हैं।"
                : "In classical Tantra and Hatha Yoga, 'Granthis' are subtle spiritual and psychological knots that tether awareness to material survival fears, emotional entanglements, and intellectual dogmatism."}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {THREE_GRANTHIS.map((g, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3"
              >
                <div className="border-b border-stone-100 pb-2.5">
                  <h3 className="text-base font-bold text-stone-900 font-serif">{g.name}</h3>
                  <span className="text-xs text-amber-800 font-semibold block mt-0.5">
                    {g.significance}
                  </span>
                  <span className="text-[11px] text-stone-500">{g.location}</span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed">
                  {g.description}
                </p>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 leading-relaxed">
                  <span className="font-semibold text-emerald-800 block mb-0.5">Transcendence Sadhana:</span>
                  {g.unravelingPath}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
