/**
 * Gurukul OCR Page State & Verification Classification Helper
 *
 * States:
 * - NOT_PROCESSED: Page exists but has not been fed into OCR pipeline.
 * - QUEUED: Manuscript is scheduled in the background ingestion worker.
 * - PROCESSING: Background worker is actively recognizing/normalizing this page.
 * - COMPLETED: OCR finished (further partitioned into Verified vs Unverified Draft).
 * - PARTIALLY_FAILED: OCR completed with low optical confidence or orphaned characters.
 * - FAILED: Processing error or unresolvable decoding exception.
 */
export function getPageOcrState(pageData, bookContext = {}) {
  const { processingStatus = "COMPLETED", ocrErrors = [] } = bookContext;

  // 1. Check if an unresolved OCR error matches this specific page
  const hasPageError = ocrErrors.some(
    (e) => Boolean(pageData?.id && e.pageId === pageData.id && !e.resolved)
  );

  if (pageData?.qualityIssues?.failed || (hasPageError && !pageData?.ocrCompleted)) {
    return {
      status: "FAILED",
      label: "OCR Processing Failed",
      badgeClass: "text-rose-400 bg-rose-500/10 border-rose-500/25",
      isError: true,
      description: "OCR encountered an unrecoverable decoding error on this page.",
    };
  }

  // 2. Active pipeline processing
  if (
    ["PROCESSING", "ANALYZING", "EXTRACTING", "RECOGNIZING", "NORMALIZING", "STRUCTURING"].includes(
      processingStatus
    ) &&
    !pageData?.ocrCompleted
  ) {
    return {
      status: "PROCESSING",
      label: "Processing in Queue",
      badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/25",
      isProcessing: true,
      description: "Background OCR worker is currently extracting and analyzing this page.",
    };
  }

  // 3. Queued in pipeline
  if (processingStatus === "QUEUED" && !pageData?.ocrCompleted) {
    return {
      status: "QUEUED",
      label: "Queued for OCR",
      badgeClass: "text-sky-400 bg-sky-500/10 border-sky-500/25",
      isQueued: true,
      description: "Manuscript page is awaiting background worker assignment.",
    };
  }

  // 4. Missing or empty page data
  if (!pageData) {
    return {
      status: "NOT_PROCESSED",
      label: "Awaiting Processing",
      badgeClass: "text-stone-400 bg-stone-850 border-stone-700",
      description: "This page has not yet been processed through OCR or contains graphical artwork.",
    };
  }

  // 5. Partial failure or low optical confidence
  if (
    pageData.qualityIssues?.isLowConfidence ||
    (pageData.ocrConfidence !== null && pageData.ocrConfidence !== undefined && pageData.ocrConfidence < 0.75) ||
    pageData.qualityIssues?.hasOrphanedMatras
  ) {
    return {
      status: "PARTIALLY_FAILED",
      label: `Partially Extracted (${Math.round((pageData.ocrConfidence || 0.5) * 100)}% Conf)`,
      badgeClass: "text-amber-400 bg-amber-500/10 border-amber-500/25",
      isWarning: true,
      description: "Optical confidence is low. Text may contain broken conjuncts or scan artifacts.",
    };
  }

  // 6. Completed
  const hasText = !!(pageData.proofreadText || pageData.cleanedText || pageData.rawText);
  if (pageData.ocrCompleted || hasText) {
    if (pageData.proofread) {
      return {
        status: "COMPLETED",
        isVerified: true,
        label: "Verified Human Review",
        badgeClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
        description: "Reviewed and approved by a qualified Sanskrit/Hindi proofreader.",
      };
    }
    return {
      status: "COMPLETED",
      isVerified: false,
      label: `Unverified OCR Draft (${Math.round((pageData.ocrConfidence || 0.9) * 100)}% Conf)`,
      badgeClass: "text-amber-300 bg-amber-500/10 border-amber-500/25",
      description: "Raw optical recognition output. Unreviewed text must be verified before citation.",
    };
  }

  return {
    status: "NOT_PROCESSED",
    label: "Not Processed",
    badgeClass: "text-stone-400 bg-stone-850 border-stone-700",
    description: "Page text has not yet been extracted.",
  };
}
