"use client";

import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Clock,
  CheckCircle2,
  BookOpen,
  ShieldAlert,
  Flame,
  Flower2,
  Compass,
} from "lucide-react";
import {
  MEDITATION_CATEGORIES,
  MEDITATION_PRACTICES,
} from "../../server/spirituality/meditationData.js";
import {
  startAmbientDrone,
  stopAmbientDrone,
  playChime,
} from "../../lib/audio/spiritualAudio.js";

export default function GuidedMeditationStudio({
  language = "en",
  onSessionComplete = null,
}) {
  const isHi = language === "hi" || language === "hindi";

  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedPractice, setSelectedPractice] = useState(MEDITATION_PRACTICES[0]);
  const [selectedDuration, setSelectedDuration] = useState(selectedPractice.defaultDuration || 5);
  const [ambientAudio, setAmbientAudio] = useState(selectedPractice.ambientOption || "cosmic_om");
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [sessionSummary, setSessionSummary] = useState(null);

  const timerRef = useRef(null);

  // Filter practices by category
  const filteredPractices =
    selectedCategory === "ALL"
      ? MEDITATION_PRACTICES
      : MEDITATION_PRACTICES.filter((p) => p.category === selectedCategory);

  // Select practice
  const handleSelectPractice = (practice) => {
    setIsRunning(false);
    stopAmbientDrone();
    setSelectedPractice(practice);
    setSelectedDuration(practice.defaultDuration || 5);
    setAmbientAudio(practice.ambientOption || "cosmic_om");
    setElapsedSeconds(0);
    setCurrentStepIndex(0);
    setSessionSummary(null);
  };

  // Timer loop & dynamic step advancement
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAmbientDrone();
      return;
    }

    // Start background drone if enabled
    if (ambientAudio && ambientAudio !== "silent") {
      startAmbientDrone(ambientAudio);
    }

    const totalTargetSeconds = selectedDuration * 60;
    const stepsCount = selectedPractice.steps?.length || 1;
    const stepDuration = Math.max(20, Math.floor(totalTargetSeconds / stepsCount));

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;

        // Auto-advance step based on elapsed time
        const newStep = Math.min(Math.floor(next / stepDuration), stepsCount - 1);
        setCurrentStepIndex(newStep);

        if (next >= totalTargetSeconds) {
          handleFinishMeditation();
          return totalTargetSeconds;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopAmbientDrone();
    };
  }, [isRunning, selectedDuration, selectedPractice, ambientAudio]);

  // Finish session & record progress
  const handleFinishMeditation = async () => {
    setIsRunning(false);
    stopAmbientDrone();
    playChime();
    if (timerRef.current) clearInterval(timerRef.current);

    const summary = {
      titleEn: selectedPractice.titleEn,
      titleHi: selectedPractice.titleHi,
      durationMinutes: selectedDuration,
      xpEarned: 25,
      completedAt: new Date().toLocaleTimeString(),
    };
    setSessionSummary(summary);

    try {
      await fetch("/api/spirituality/kundalini/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "meditation_session",
          meditationTitle: selectedPractice.titleEn,
          durationMinutes: selectedDuration,
        }),
      });

      if (onSessionComplete) {
        onSessionComplete(summary);
      }
    } catch (err) {
      console.warn("Failed to log meditation session:", err);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    stopAmbientDrone();
    setElapsedSeconds(0);
    setCurrentStepIndex(0);
    setSessionSummary(null);
  };

  const totalTargetSeconds = selectedDuration * 60;
  const secondsRemaining = Math.max(0, totalTargetSeconds - elapsedSeconds);
  const currentStep =
    selectedPractice.steps?.[currentStepIndex] || selectedPractice.steps?.[0] || {};

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex border-b border-[#ede5d6] gap-1.5 overflow-x-auto pb-1 text-xs">
        {MEDITATION_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-2 rounded-xl font-bold transition shrink-0 cursor-pointer ${
              selectedCategory === cat.id
                ? "bg-[#13382c] text-white shadow-xs"
                : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            {isHi ? cat.nameHi : cat.nameEn}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* --- LEFT: MEDITATION PRACTICES LIST --- */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">
              {isHi ? "शास्त्रीय ध्यान साधना" : "Classical Meditations"}
            </span>
            <span className="text-xs text-stone-400">
              {filteredPractices.length} Practices Available
            </span>
          </div>

          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredPractices.map((practice) => {
              const isSelected = selectedPractice.id === practice.id;
              return (
                <button
                  key={practice.id}
                  onClick={() => handleSelectPractice(practice)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? "bg-[#faf5ec] border-amber-400 shadow-xs ring-1 ring-amber-400"
                      : "bg-white border-[#ede5d6] hover:bg-[#faf8f4]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-stone-900 font-serif">
                      {isHi ? practice.titleHi : practice.titleEn}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                      {practice.tradition?.split(" ")[0]}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2">
                    {isHi ? practice.subtitleHi : practice.subtitleEn}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#c4903c] italic mt-0.5">
                    <span>{practice.traditionalSource}</span>
                    <span className="font-mono text-stone-500">{practice.defaultDuration} min</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* --- RIGHT: MEDITATION STUDIO CANVAS & GUIDANCE --- */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#ede5d6] p-6 sm:p-7 flex flex-col items-center justify-between min-h-[560px] shadow-xs relative">
          {/* Top Options: Duration & Ambient Sound */}
          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#ede5d6]">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#c4903c] font-bold block mb-1">
                Duration Target
              </span>
              <div className="flex items-center gap-1.5">
                {(selectedPractice.durations || [3, 5, 10, 15, 20]).map((dur) => (
                  <button
                    key={dur}
                    onClick={() => {
                      setSelectedDuration(dur);
                      handleReset();
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      selectedDuration === dur
                        ? "bg-[#13382c] text-white shadow-xs"
                        : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                    }`}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
            </div>

            {/* Ambient Sound Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-500 font-mono">Acoustic:</span>
              <select
                value={ambientAudio}
                onChange={(e) => {
                  setAmbientAudio(e.target.value);
                  if (isRunning) {
                    startAmbientDrone(e.target.value);
                  }
                }}
                className="px-2.5 py-1 rounded-xl bg-stone-100 border border-stone-200 text-xs font-medium text-stone-800 focus:outline-none"
              >
                <option value="cosmic_om">Cosmic Om (136.1 Hz)</option>
                <option value="tanpura_drone">Tanpura (Sa - Pa)</option>
                <option value="tibetan_bowl">Singing Bowl (432 Hz)</option>
                <option value="silent">Silent Meditation</option>
              </select>
            </div>
          </div>

          {/* Central Pulsing Meditation Lotus / Mandala */}
          <div className="relative w-64 h-64 flex items-center justify-center my-4">
            {/* Outer Gentle Halo */}
            <div
              className={`absolute w-56 h-56 rounded-full bg-gradient-to-tr from-purple-400/20 via-amber-300/20 to-emerald-400/20 border border-amber-300/40 transition-transform duration-3000 ease-in-out ${
                isRunning ? "animate-pulse scale-105" : "scale-100"
              }`}
            />
            {/* Inner Glowing Core */}
            <div
              className={`absolute w-40 h-40 rounded-full bg-gradient-to-tr from-[#13382c]/20 to-amber-500/25 transition-transform duration-2000 ${
                isRunning ? "scale-110" : "scale-95"
              }`}
            />

            <div className="relative z-10 text-center space-y-1 select-none">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#13382c] block">
                {currentStep.phase || "Contemplative Presence"}
              </span>
              <span className="text-5xl font-mono font-bold text-stone-900 block tracking-tight">
                {Math.floor(secondsRemaining / 60)}:
                {String(secondsRemaining % 60).padStart(2, "0")}
              </span>
              <span className="text-[11px] text-stone-500 font-sans block">
                Step {currentStepIndex + 1} of {selectedPractice.steps?.length || 1}
              </span>
            </div>
          </div>

          {/* Timed Step Guidance Card */}
          <div className="w-full p-4 rounded-2xl bg-[#faf8f4] border border-[#ede5d6] text-center space-y-1.5 my-2">
            <span className="font-serif font-bold text-xs text-[#c4903c] uppercase tracking-wider block">
              {currentStep.phase}
            </span>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed max-w-lg mx-auto font-sans">
              {isHi ? currentStep.instructionHi : currentStep.instructionEn}
            </p>
          </div>

          {/* Actions Controls */}
          <div className="flex items-center gap-3 mt-3">
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
                  <span>{isHi ? "विश्राम लें (Pause)" : "Pause Meditation"}</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-amber-300" />
                  <span>{isHi ? "ध्यान आरम्भ करें" : "Begin Meditation"}</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-2xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 transition cursor-pointer"
              title="Reset Session"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Session Completion Celebration Modal */}
          {sessionSummary && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-3 z-20 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-lg text-stone-900">
                Meditation Completed!
              </h4>
              <p className="text-xs text-stone-600 max-w-sm">
                You completed {sessionSummary.durationMinutes} minutes of {sessionSummary.titleEn} in peaceful contemplation.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-mono text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>+25 XP Earned & Daily Streak Recorded!</span>
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
