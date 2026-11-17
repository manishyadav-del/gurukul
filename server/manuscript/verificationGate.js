import { canReviewBooks, canManageBooks } from "../../lib/permissions.js";

/**
 * Vedic Manuscript Verification Gate
 * Enforces server-side publication and scholarly verification rules across all APIs.
 *
 * Rules:
 * 1. An unverified page must NEVER be visible to normal users.
 * 2. A verified and published page can be displayed.
 * 3. An unverified passage must not be exposed as verified content.
 * 4. An explanation must remain hidden until independently verified and published.
 * 5. A verified PDF page does not automatically verify its OCR text or explanations.
 * 6. A rejected or unpublished item must immediately become inaccessible to normal users.
 * 7. Admin and authorized reviewers can inspect all material according to RBAC permissions.
 */

export const VERIFIED_STATUSES = ["VERIFIED", "VERIFIED_WITH_CORRECTIONS"];

/**
 * Determines whether the user has privileges to inspect unverified/unpublished material.
 */
export function canAccessUnverifiedContent(user) {
  if (!user) return false;
  return Boolean(canReviewBooks(user) || canManageBooks(user) || user.role === "ADMIN" || user.role === "SCHOLAR");
}

/**
 * Filter pages for the requesting user.
 * Normal users only see published and verified pages.
 */
export function filterPagesForUser(pages = [], user = null) {
  if (canAccessUnverifiedContent(user)) {
    return pages;
  }
  return pages.filter(
    (p) =>
      p.isIncluded !== false &&
      p.isPublished !== false &&
      (VERIFIED_STATUSES.includes(p.verificationStatus) || p.proofread === true)
  );
}

/**
 * Filter passages for the requesting user.
 */
export function filterPassagesForUser(passages = [], user = null) {
  if (canAccessUnverifiedContent(user)) {
    return passages;
  }
  return passages.filter(
    (p) =>
      p.isPublished !== false &&
      (VERIFIED_STATUSES.includes(p.verificationStatus) || p.status === "APPROVED" || p.status === "VERIFIED")
  );
}

/**
 * Filter scholarly explanations for the requesting user.
 */
export function filterExplanationsForUser(explanations = [], user = null) {
  if (canAccessUnverifiedContent(user)) {
    return explanations;
  }
  return explanations.filter(
    (e) => e.isPublished === true && (VERIFIED_STATUSES.includes(e.status) || e.status === "APPROVED")
  );
}

/**
 * Build Prisma WHERE clause for BookPage based on user privileges.
 */
export function getPrismaPageWhereClause(bookId, user = null) {
  if (canAccessUnverifiedContent(user)) {
    return { bookId };
  }
  return {
    bookId,
    isIncluded: true,
    isPublished: true,
    OR: [
      { verificationStatus: { in: VERIFIED_STATUSES } },
      { proofread: true },
    ],
  };
}

/**
 * Build Prisma WHERE clause for Passage based on user privileges.
 */
export function getPrismaPassageWhereClause(bookId, user = null) {
  if (canAccessUnverifiedContent(user)) {
    return { bookId };
  }
  return {
    bookId,
    isPublished: true,
    OR: [
      { verificationStatus: { in: VERIFIED_STATUSES } },
      { status: "APPROVED" },
    ],
  };
}

/**
 * Build Prisma WHERE clause for ScholarlyExplanation based on user privileges.
 */
export function getPrismaExplanationWhereClause(bookId, user = null) {
  if (canAccessUnverifiedContent(user)) {
    return { bookId };
  }
  return {
    bookId,
    isPublished: true,
    status: { in: VERIFIED_STATUSES },
  };
}
