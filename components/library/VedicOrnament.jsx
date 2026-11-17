import React from "react";

/**
 * Reusable Authentic Vedic SVG Motifs & Decorative Dividers
 * Hand-crafted vector geometry inspired by traditional Sanskrit manuscripts,
 * temple carvings, and palm-leaf granthas.
 */

export function OmSeal({ className = "w-6 h-6 text-amber-500" }) {
  return (
    <span className={`inline-flex items-center justify-center font-serif select-none ${className}`}>
      ॐ
    </span>
  );
}

export function ShlokaDivider({ className = "w-full my-6", accentColor = "#d4a359" }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#d4a359]/40 to-[#d4a359]/70" />
      <div className="flex items-center gap-1.5 text-[#d4a359] shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-[#d4a359]" />
        <svg className="w-4 h-4 text-[#d4a359]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
        </svg>
        <span className="w-1.5 h-1.5 rounded-full bg-[#d4a359]" />
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#d4a359]/40 to-[#d4a359]/70" />
    </div>
  );
}

export function LotusMotif({ className = "w-8 h-8 text-[#d4a359]" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M24 6C24 6 18 16 18 26C18 32 20.5 36 24 38C27.5 36 30 32 30 26C30 16 24 6 24 6Z" fill="currentColor" fillOpacity="0.15" />
      <path d="M18 16C18 16 10 21 8 30C7 34.5 10 38 14 38C17.5 38 21 35 24 32C21 27 18 21 18 16Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M30 16C30 16 38 21 40 30C41 34.5 38 38 34 38C30.5 38 27 35 24 32C27 27 30 21 30 16Z" fill="currentColor" fillOpacity="0.1" />
      <path d="M12 38C15 42 20 44 24 44C28 44 33 42 36 38" />
    </svg>
  );
}

export function ManuscriptCorner({ position = "top-left", className = "w-6 h-6 text-[#d4a359]/60" }) {
  const rotationClass = {
    "top-left": "",
    "top-right": "rotate-90",
    "bottom-right": "rotate-180",
    "bottom-left": "-rotate-90",
  }[position] || "";

  return (
    <svg
      className={`${className} ${rotationClass}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M2 22V6C2 3.79086 3.79086 2 6 2H22" strokeLinecap="round" />
      <path d="M6 6H14V14H6V6Z" fill="currentColor" fillOpacity="0.2" strokeWidth="1" />
      <circle cx="6" cy="6" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function SacredGeometryWatermark({ className = "w-96 h-96 opacity-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.75"
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="90" strokeDasharray="3 3" />
      <circle cx="100" cy="100" r="75" />
      <polygon points="100,25 165,137 35,137" />
      <polygon points="100,175 35,63 165,63" />
      <circle cx="100" cy="100" r="50" strokeDasharray="2 2" />
      <polygon points="100,50 143,125 57,125" />
      <polygon points="100,150 57,75 143,75" />
      <circle cx="100" cy="100" r="22" />
      <circle cx="100" cy="100" r="4" fill="currentColor" />
    </svg>
  );
}
