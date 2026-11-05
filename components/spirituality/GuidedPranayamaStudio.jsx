"use client";

import { useState, useEffect, useRef } from "react";
import {
  Wind,
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  Info,
  Sliders,
} from "lucide-react";
import { PRANAYAMA_PRACTICES } from "../../server/spirituality/pranayamaData.js";
import { playChime } from "../../lib/audio/spiritualAudio.js";

export default function GuidedPranayamaStudio({
  language = "en",
  onSessionComplete = null,
}) {
  const isHi = language === "hi" || language === "hindi";

  const [selectedPractice, setSelectedPractice] = useState(PRANAYAMA_PRACTICES[0]);
  const [sessionDurationMinutes, setSessionDurationMinutes] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState("Inhale"); // "Inhale" | "Exhale"
  const [secondsLeftInPhase, setSecondsLeftInPhase] = useState(selectedPractice.inhaleSec);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [elapsedTotalSeconds, setElapsedTotalSeconds] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [paceModifier, setPaceModifier] = useState(1.0); // 0.8 (quick), 1.0 (normal), 1.25 (deep)
  const [sessionSummary, setSessionSummary] = useState(null);

  const timerRef = useRef(null);

  // Switch practice
  const handleSelectPractice = (practice) => {
    setIsRunning(false);
    setSelectedPractice(practice);
    setBreathPhase("Inhale");
    setSecondsLeftInPhase(Math.round(practice.inhaleSec * paceModifier));
    setCompletedCycles(0);
    setElapsedTotalSeconds(0);
    setSessionSummary(null);
  };

  // Switch pace
  const handleChangePace = (newModifier) => {
    setPaceModifier(newModifier);
    if (!isRunning) {
      setSecondsLeftInPhase(Math.round(selectedPractice.inhaleSec * newModifier));
    }
  };

  // Main Breathing Loop
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const targetTotalSeconds = sessionDurationMinutes * 60;

    timerRef.current = setInterval(() => {
      setElapsedTotalSeconds((prev) => {
        const nextTotal = prev + 1;
        if (nextTotal >= targetTotalSeconds) {
          // Session Completed!
          handleFinishSession(completedCycles + 1);
          return targetTotalSeconds;
        }
        return nextTotal;
      });

      setSecondsLeftInPhase((prev) => {
        if (prev > 1) {
          return prev - 1;
        }

        // Phase Transition: Toggle Inhale / Exhale
        if (breathPhase === "Inhale") {
          setBreathPhase("Exhale");
          if (isAudioEnabled) playChime();
          return Math.round(selectedPractice.exhaleSec * paceModifier);
        } else {
          setBreathPhase("Inhale");
          setCompletedCycles((c) => c + 1);
          if (isAudioEnabled) playChime();
          return Math.round(selectedPractice.inhaleSec * paceModifier);
        }
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [
    isRunning,
    breathPhase,
    selectedPractice,
    paceModifier,
    sessionDurationMinutes,
    completedCycles,
    isAudioEnabled,
  ]);

  // Finish session & record progress
  const handleFinishSession = async (finalCycles) => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const summary = {
      practiceName: selectedPractice.nameEn,
      practiceNameHi: selectedPractice.nameHi,
      durationMinutes: sessionDurationMinutes,
      cyclesCompleted: finalCycles || completedCycles,
      xpEarned: 15,
      completedAt: new Date().toLocaleTimeString(),
    };
    setSessionSummary(summary);

    // Call API to record session progress
    try {
      await fetch("/api/spirituality/kundalini/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pranayama_session",
          practiceName: selectedPractice.nameEn,
          durationMinutes: sessionDurationMinutes,
          cyclesCompleted: finalCycles || completedCycles,
        }),
      });

      if (onSessionComplete) {
        onSessionComplete(summary);
      }
    } catch (err) {
      console.warn("Failed to log pranayama session:", err);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setBreathPhase("Inhale");
    setSecondsLeftInPhase(Math.round(selectedPractice.inhaleSec * paceModifier));
    setCompletedCycles(0);
    setElapsedTotalSeconds(0);
    setSessionSummary(null);
  };

  // Visual pulse calculation
  const currentTotalPhase =
    breathPhase === "Inhale"
      ? Math.round(selectedPractice.inhaleSec * paceModifier)
      : Math.round(selectedPractice.exhaleSec * paceModifier);
  const progressRatio = Math.max(0, Math.min(1, (currentTotalPhase - secondsLeftInPhase + 1) / Math.max(currentTotalPhase, 1)));
  const scale = breathPhase === "Inhale" ? 1 + progressRatio * 0.35 : 1.35 - progressRatio * 0.35;

  return (
    <div className="space-y-6">
      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold block text-amber-950">
            {isHi ? "प्राणायाम अभ्यास सुरक्षा निर्देश" : "Classical Pranayama Safety Guidelines"}
          </span>
          <p className="text-[11px] text-amber-900/90 leading-relaxed">
            {isHi
              ? "सभी अभ्यास पूरी तरह सहज और स्वाभाविक होने चाहिए। सांस को कभी भी बलपूर्वक न रोकें (No forced Kumbhaka)। यदि किसी भी क्षण चक्कर, भारीपन या बेचैनी लगे, तो तत्काल अभ्यास रोकें और सामान्य श्वास लें।"
              : "All practices should feel completely effortless. Gurukul follows gentle mindfulness pacing: strictly zero forced breath retention. Discontinue immediately if you experience dizziness or shortness of breath."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* --- LEFT: PRACTICE SELECTOR LIST --- */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">
              {isHi ? "प्राणायाम तकनीक चयन" : "Select Pranayama Technique"}
            </span>
            <span className="text-xs text-stone-400">
              {PRANAYAMA_PRACTICES.length} Classical Practices
            </span>
          </div>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {PRANAYAMA_PRACTICES.map((p) => {
              const isSelected = selectedPractice.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPractice(p)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? "bg-[#faf5ec] border-amber-400 shadow-xs ring-1 ring-amber-400"
                      : "bg-white border-[#ede5d6] hover:bg-[#faf8f4]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-stone-900 font-serif">
                      {isHi ? p.nameHi : p.nameEn}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                      {p.ratio}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2">
                    {isHi ? p.descriptionHi : p.descriptionEn}
                  </p>

                  <span className="text-[10px] text-[#c4903c] italic mt-0.5">
                    {p.traditionalText}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* --- RIGHT: INTERACTIVE BREATHING PACER CANVAS --- */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#ede5d6] p-6 sm:p-7 flex flex-col items-center justify-between min-h-[540px] shadow-xs relative">
          {/* Top Controls: Duration & Sound Toggle */}
          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ede5d6]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#c4903c] font-bold block">
                Session Target
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                {[1, 3, 5, 10].map((dur) => (
                  <button
                    key={dur}
                    onClick={() => {
                      setSessionDurationMinutes(dur);
                      handleReset();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      sessionDurationMinutes === dur
                        ? "bg-[#13382c] text-white shadow-xs"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
            </div>

            {/* Pace Speed Modifier */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-500 font-mono">Pace:</span>
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-xs font-medium">
                <button
                  onClick={() => handleChangePace(0.85)}
                  className={`px-2 py-0.5 rounded-md transition ${paceModifier === 0.85 ? "bg-white text-stone-900 font-bold shadow-2xs" : "text-stone-600"}`}
                >
                  Quick
                </button>
                <button
                  onClick={() => handleChangePace(1.0)}
                  className={`px-2 py-0.5 rounded-md transition ${paceModifier === 1.0 ? "bg-white text-stone-900 font-bold shadow-2xs" : "text-stone-600"}`}
                >
                  Normal
                </button>
                <button
                  onClick={() => handleChangePace(1.25)}
                  className={`px-2 py-0.5 rounded-md transition ${paceModifier === 1.25 ? "bg-white text-stone-900 font-bold shadow-2xs" : "text-stone-600"}`}
                >
                  Deep
                </button>
              </div>

              {/* Sound Bell Toggle */}
              <button
                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                className={`p-2 rounded-xl border transition cursor-pointer ${
                  isAudioEnabled
                    ? "bg-amber-50 border-amber-300 text-amber-900"
                    : "bg-stone-100 border-stone-200 text-stone-400"
                }`}
                title={isAudioEnabled ? "Interval Chime On" : "Muted"}
              >
                {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Central Animated Breathing Pacer Orb */}
          <div className="relative w-64 h-64 flex items-center justify-center my-6">
            {/* Outer Expanding Halo */}
            <div
              className="absolute w-56 h-56 rounded-full bg-gradient-to-tr from-amber-400/20 via-emerald-400/20 to-teal-400/20 border border-amber-400/30 transition-transform duration-1000 ease-in-out"
              style={{ transform: `scale(${scale})` }}
            />
            {/* Inner Glowing Core */}
            <div
              className="absolute w-40 h-40 rounded-full bg-gradient-to-tr from-[#13382c]/15 to-amber-500/20 transition-transform duration-1000 ease-in-out"
              style={{ transform: `scale(${scale * 0.85})` }}
            />

            {/* Breath Phase & Second Counter */}
            <div className="relative z-10 text-center space-y-1 select-none">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#13382c] block">
                {breathPhase === "Inhale"
                  ? (isHi ? "पूरक • Inhale" : "Inhale")
                  : (isHi ? "रेचक • Exhale" : "Exhale")}
              </span>
              <span className="text-5xl font-mono font-bold text-stone-900 block tracking-tight">
                {secondsLeftInPhase}s
              </span>
              <span className="text-[11px] font-sans text-stone-500 block">
                {isHi ? `पूर्ण चक्र: ${completedCycles}` : `Completed Cycles: ${completedCycles}`}
              </span>
            </div>
          </div>

          {/* Session Timer Progress Bar */}
          <div className="w-full space-y-1 mb-4">
            <div className="flex items-center justify-between text-[11px] font-mono text-stone-500">
              <span>
                {Math.floor(elapsedTotalSeconds / 60)}:
                {String(elapsedTotalSeconds % 60).padStart(2, "0")}
              </span>
              <span>{sessionDurationMinutes}:00 min target</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-600 transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round((elapsedTotalSeconds / (sessionDurationMinutes * 60)) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`px-6 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer ${
                isRunning
                  ? "bg-stone-800 text-white hover:bg-stone-900"
                  : "bg-[#13382c] text-amber-300 hover:bg-[#1a4a3a]"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 text-amber-300" />
                  <span>{isHi ? "विश्राम लें (Pause)" : "Pause Practice"}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-amber-300" />
                  <span>{isHi ? "प्राणायाम आरम्भ करें" : "Begin Pranayama"}</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Session Completed Celebration Modal */}
          {sessionSummary && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-3 z-20 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-lg text-stone-900">
                Pranayama Session Completed!
              </h4>
              <p className="text-xs text-stone-600 max-w-sm">
                You practiced {sessionSummary.durationMinutes} minutes of {sessionSummary.practiceName} completing {sessionSummary.cyclesCompleted} conscious breath cycles.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-mono text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>+15 XP Earned & Daily Streak Recorded!</span>
              </div>
              <button
                onClick={() => setSessionSummary(null)}
                className="mt-2 px-5 py-2 rounded-xl bg-[#13382c] text-white text-xs font-bold hover:bg-[#1a4a3a] transition cursor-pointer"
              >
                Continue Practice
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
