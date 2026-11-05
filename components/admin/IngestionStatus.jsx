"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertTriangle, XCircle, ArrowRight, RefreshCw } from "lucide-react";

export default function IngestionStatus({ jobId, onComplete }) {
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    let isMounted = true;
    let intervalId = null;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/ingest/${jobId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch job status");
        }
        const data = await res.json();
        if (isMounted) {
          setJob(data);

          if (data.status === "COMPLETED" || data.status === "FAILED") {
            if (intervalId) clearInterval(intervalId);
            if (data.status === "COMPLETED" && onComplete) {
              onComplete(data);
            }
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      }
    };

    fetchStatus();
    intervalId = setInterval(fetchStatus, 2000);

    return () => {
      isMounted = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId, onComplete]);

  const handleRetry = async () => {
    if (!job?.bookId) return;
    setRetrying(true);
    try {
      const res = await fetch(`/api/books/${job.bookId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRetry: true }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setRetrying(false);
    }
  };

  if (!job && !error) {
    return (
      <div className="bg-white rounded-2xl border border-stone-200 p-6 flex items-center justify-center gap-3 text-stone-500">
        <Loader2 className="w-5 h-5 animate-spin text-amber-700" />
        <span className="text-sm">Connecting to ingestion monitor...</span>
      </div>
    );
  }

  const isCompleted = job?.status === "COMPLETED";
  const isFailed = job?.status === "FAILED";
  const isRunning = !isCompleted && !isFailed;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRunning && <Loader2 className="w-5 h-5 animate-spin text-amber-600" />}
          {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          {isFailed && <XCircle className="w-5 h-5 text-rose-600" />}
          <h3 className="font-bold text-stone-900 text-base font-serif">
            Ingestion Pipeline Status
          </h3>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isCompleted
              ? "bg-emerald-100 text-emerald-800"
              : isFailed
              ? "bg-rose-100 text-rose-800"
              : "bg-amber-100 text-amber-800 animate-pulse"
          }`}
        >
          {job?.status || "INITIALIZING"}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-stone-600">
          <span>{job?.currentStep || "Processing..."}</span>
          <span>{Math.round(job?.progress || 0)}%</span>
        </div>
        <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              isCompleted
                ? "bg-emerald-600"
                : isFailed
                ? "bg-rose-500"
                : "bg-amber-600"
            }`}
            style={{ width: `${Math.max(2, job?.progress || 0)}%` }}
          />
        </div>
      </div>

      {/* Stats Counter */}
      <div className="grid grid-cols-3 gap-3 text-center border-t border-stone-100 pt-4">
        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/50">
          <span className="text-xs text-stone-500 block">Total Pages</span>
          <span className="text-lg font-bold text-stone-900">{job?.totalPages ?? 0}</span>
        </div>
        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/50">
          <span className="text-xs text-stone-500 block">Processed</span>
          <span className="text-lg font-bold text-emerald-700">{job?.processedPages ?? 0}</span>
        </div>
        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/50">
          <span className="text-xs text-stone-500 block">Failed Pages</span>
          <span className="text-lg font-bold text-rose-600">{job?.failedPages ?? 0}</span>
        </div>
      </div>

      {job?.errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{job.errorMessage}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {isFailed && (
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${retrying ? "animate-spin" : ""}`} />
            <span>Retry Ingestion</span>
          </button>
        )}

        {isCompleted && job?.bookId && (
          <Link
            href={`/admin/proofreading?bookId=${job.bookId}`}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
          >
            <span>Proceed to Proofreading</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
