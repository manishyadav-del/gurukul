"use client";

import { AlertTriangle, CheckCircle2, ShieldCheck, Tag } from "lucide-react";

export default function OCRReview({ blocks = [], ocrErrors = [], confidence = 0, language = "Hindi" }) {
  const confPercent = Math.round((confidence || 0) * 100);

  const getConfBadge = (score) => {
    if (score >= 90) return "bg-emerald-100 text-emerald-800 border-emerald-200";
    if (score >= 75) return "bg-amber-100 text-amber-800 border-amber-200";
    return "bg-rose-100 text-rose-800 border-rose-200";
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-xs">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <h4 className="text-sm font-bold text-stone-900 font-serif flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>OCR Diagnostics & Blocks</span>
        </h4>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-stone-100 text-stone-700">
            Lang: {language}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getConfBadge(
              confPercent
            )}`}
          >
            Confidence: {confPercent}%
          </span>
        </div>
      </div>

      {/* Errors / Warnings */}
      {ocrErrors && ocrErrors.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-rose-800 block">Flagged Quality Issues</span>
          {ocrErrors.map((err) => (
            <div
              key={err.id}
              className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-xs flex items-start gap-2.5 text-rose-900"
            >
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold text-[11px] uppercase tracking-wider text-rose-700 block">
                  {err.errorType}
                </span>
                <p className="mt-0.5 text-rose-800">{err.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Structured OCR Blocks List */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-semibold text-stone-600">
            Detected Blocks ({blocks.length})
          </span>
        </div>

        {blocks.length === 0 ? (
          <p className="text-xs text-stone-400 italic py-2">No individual blocks stored.</p>
        ) : (
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1 divide-y divide-stone-100">
            {blocks.map((b) => {
              const bConf = typeof b.confidence === "number" ? Math.round(b.confidence > 1 ? b.confidence : b.confidence * 100) : null;
              return (
                <div key={b.id || b.blockOrder || b.order} className="pt-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
                    <span className="font-mono font-medium text-stone-600">
                      Block #{b.blockOrder || b.order}
                    </span>
                    {bConf !== null && (
                      <span className={`px-1.5 py-0.2 rounded-sm font-semibold ${getConfBadge(bConf)}`}>
                        {bConf}%
                      </span>
                    )}
                  </div>
                  <p className="text-stone-800 font-serif leading-relaxed line-clamp-2">{b.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
