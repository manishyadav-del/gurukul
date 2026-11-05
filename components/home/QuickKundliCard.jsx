"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, Calendar, Clock, MapPin, ArrowRight, Settings } from "lucide-react";

export default function QuickKundliCard() {
  const router = useRouter();
  const [dob, setDob] = useState("2001-02-24");
  const [tob, setTob] = useState("07:22");
  const [place, setPlace] = useState("Deoria, Uttar Pradesh, India");

  function handleSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams({
      dob,
      tob,
      place,
    });
    router.push(`/astrology?${params.toString()}`);
  }

  return (
    <div className="bg-[#121829] rounded-2xl border border-stone-800/80 p-5 text-white flex flex-col justify-between shadow-md relative overflow-hidden">
      {/* Background Starry glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
            <Compass className="w-4 h-4" />
          </div>
          <h3 className="font-serif font-bold text-base text-white">Quick Kundli</h3>
        </div>
        <p className="text-[11px] text-stone-400">
          Generate and explore your birth chart
        </p>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
          {/* Date of birth */}
          <div>
            <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
              Date of Birth
            </label>
            <div className="relative">
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-[#1b233a] border border-stone-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-400 transition"
              />
            </div>
          </div>

          {/* Time of birth */}
          <div>
            <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
              Time of Birth
            </label>
            <div className="relative">
              <input
                type="time"
                value={tob}
                onChange={(e) => setTob(e.target.value)}
                className="w-full bg-[#1b233a] border border-stone-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-400 transition"
              />
            </div>
          </div>

          {/* Place of birth */}
          <div>
            <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
              Place of Birth
            </label>
            <div className="relative">
              <input
                type="text"
                value={place}
                onChange={(e) => setPlace(e.target.value)}
                placeholder="Enter city, state, country"
                className="w-full bg-[#1b233a] border border-stone-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-hidden focus:border-amber-400 transition"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-linear-to-r from-[#e3af62] via-[#d69c47] to-[#be822b] text-[#121829] font-bold text-xs shadow-md hover:brightness-105 active:scale-[0.99] transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Generate Kundli</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Advanced Settings Link */}
      <div className="mt-4 pt-3 border-t border-stone-800/80 text-center">
        <Link
          href="/astrology"
          className="inline-flex items-center gap-1 text-[11px] text-stone-400 hover:text-amber-300 transition"
        >
          <Settings className="w-3 h-3" />
          <span>Advanced Settings</span>
        </Link>
      </div>
    </div>
  );
}
