"use client";

import React from "react";
import { ShieldCheck, CheckCircle2, Clock, AlertTriangle, XCircle, FileText } from "lucide-react";

/**
 * Public and Admin Verification Badge Component
 * Renders an accessible, trustworthy indicator of scholarly review status.
 */
export default function VerificationBadge({
  status = "UNREVIEWED",
  ocrConfidence = null,
  size = "sm",
  showConfidence = false,
  onClick = null,
  className = "",
}) {
  const normStatus = (status || "UNREVIEWED").toUpperCase();

  let config = {
    label: "OCR Draft",
    icon: FileText,
    colors: "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100/70",
    description: "Extracted via OCR; unreviewed draft.",
  };

  if (normStatus === "VERIFIED") {
    config = {
      label: "Verified Source",
      icon: ShieldCheck,
      colors: "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/80",
      description: "Verified against original manuscript by a Vedic scholar.",
    };
  } else if (normStatus === "VERIFIED_WITH_CORRECTIONS") {
    config = {
      label: "Human Reviewed",
      icon: CheckCircle2,
      colors: "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/80",
      description: "Scholar verified with typographical corrections applied.",
    };
  } else if (normStatus === "PENDING_REVIEW" || normStatus === "UNDER_REVIEW") {
    config = {
      label: "Review Pending",
      icon: Clock,
      colors: "bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100/80",
      description: "Queued for manuscript folio inspection.",
    };
  } else if (normStatus === "NEEDS_CORRECTION") {
    config = {
      label: "Needs Correction",
      icon: AlertTriangle,
      colors: "bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100/80",
      description: "Reviewer flagged character or scan defects.",
    };
  } else if (normStatus === "REJECTED") {
    config = {
      label: "Rejected",
      icon: XCircle,
      colors: "bg-stone-100 text-stone-600 border-stone-300 line-through",
      description: "Ineligible for scholarly citation.",
    };
  }

  const Icon = config.icon;
  const isClickable = typeof onClick === "function";

  const sizeClasses = {
    xs: "text-[10px] px-1.5 py-0.5 gap-1",
    sm: "text-xs px-2.5 py-1 gap-1.5",
    md: "text-sm px-3.5 py-1.5 gap-2",
  }[size] || "text-xs px-2.5 py-1 gap-1.5";

  const buttonOrSpan = isClickable ? "button" : "span";
  const Tag = buttonOrSpan;

  return (
    <Tag
      type={isClickable ? "button" : undefined}
      onClick={isClickable ? onClick : undefined}
      title={config.description}
      className={`inline-flex items-center font-medium rounded-full border transition-all ${config.colors} ${sizeClasses} ${
        isClickable ? "cursor-pointer active:scale-95 shadow-2xs" : ""
      } ${className}`}
    >
      <Icon className={size === "xs" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-3.5 h-3.5"} />
      <span className="font-semibold tracking-tight">{config.label}</span>
      {showConfidence && ocrConfidence !== null && (
        <span className="opacity-70 font-mono text-[10px] border-l border-current/30 pl-1">
          {Math.round(ocrConfidence * 100)}%
        </span>
      )}
    </Tag>
  );
}
