import prisma from "../../lib/prisma.js";
import { logAdminActivity } from "../admin/audit.js";
import { canPublishBooks, canReviewBooks, canManageBooks, ROLES } from "../../lib/permissions.js";
import { evaluateBookQuality } from "../ocr/qualityChecks.js";

/**
 * Gurukul Book Publishing & Approval State Machine
 *
 * Enforces strictly valid state transitions:
 * DRAFT -> PROCESSING, ARCHIVED
 * PROCESSING -> NEEDS_REVIEW, FAILED
 * NEEDS_REVIEW -> PENDING_APPROVAL, DRAFT, ARCHIVED
 * PENDING_APPROVAL -> APPROVED, REJECTED, NEEDS_REVIEW
 * APPROVED -> PUBLISHED, REJECTED, DRAFT, ARCHIVED
 * PUBLISHED -> ARCHIVED, NEEDS_REVIEW (when unpublishing or revising)
 * REJECTED -> NEEDS_REVIEW, DRAFT, ARCHIVED
 * FAILED -> PROCESSING, DRAFT, ARCHIVED
 * ARCHIVED -> DRAFT
 */

export const ALLOWED_TRANSITIONS = {
  DRAFT: ["PROCESSING", "NEEDS_REVIEW", "ARCHIVED"],
  RECEIVED: ["PROCESSING", "NEEDS_REVIEW", "ARCHIVED", "DRAFT"],
  PROCESSING: ["NEEDS_REVIEW", "FAILED", "PROOFREAD"],
  PROOFREAD: ["NEEDS_REVIEW", "PENDING_APPROVAL", "DRAFT"],
  NEEDS_REVIEW: ["PENDING_APPROVAL", "DRAFT", "ARCHIVED", "PROCESSING"],
  PENDING_APPROVAL: ["APPROVED", "REJECTED", "NEEDS_REVIEW"],
  APPROVED: ["PUBLISHED", "REJECTED", "DRAFT", "ARCHIVED"],
  EXPERT_APPROVED: ["PUBLISHED", "REJECTED", "DRAFT", "ARCHIVED"],
  PUBLISHED: ["ARCHIVED", "NEEDS_REVIEW", "UNPUBLISHED", "DRAFT"],
  UNPUBLISHED: ["DRAFT", "NEEDS_REVIEW", "ARCHIVED", "PUBLISHED"],
  REJECTED: ["NEEDS_REVIEW", "DRAFT", "ARCHIVED"],
  FAILED: ["PROCESSING", "DRAFT", "ARCHIVED"],
  ARCHIVED: ["DRAFT", "NEEDS_REVIEW"],
};

/**
 * Checks whether a transition from fromStatus to toStatus is valid
 */
export function isValidTransition(fromStatus, toStatus) {
  if (fromStatus === toStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[fromStatus] || [];
  return allowed.includes(toStatus);
}

/**
 * Executes a governed state transition on a book.
 * Validates permissions, state flow, quality gates, and logs audit events.
 *
 * @param {string} bookId
 * @param {string} targetStatus
 * @param {Object} context - { user, reason, notes, overrideWarnings }
 * @returns {Promise<Object>} Updated book record
 */
export async function transitionBookStatus(bookId, targetStatus, context = {}) {
  const { user, reason, notes, overrideWarnings = false } = context;

  if (!user) {
    throw new Error("Unauthorized: User context is required to transition book state.");
  }

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: {
      pages: { select: { id: true, proofread: true, ocrCompleted: true } },
    },
  });

  if (!book) {
    const error = new Error("Book not found");
    error.statusCode = 404;
    throw error;
  }

  const currentStatus = book.status;

  // 1. Validate allowed lifecycle transition
  if (!isValidTransition(currentStatus, targetStatus)) {
    const error = new Error(
      `Invalid lifecycle transition: Cannot transition book from status "${currentStatus}" to "${targetStatus}". Allowed next statuses: [${(ALLOWED_TRANSITIONS[currentStatus] || []).join(", ")}]`
    );
    error.statusCode = 422;
    throw error;
  }

  // 2. Role-Based Permission Gates
  if (targetStatus === "PENDING_APPROVAL") {
    // Requires review or proofread or manage permission
    if (!canReviewBooks(user) && !canManageBooks(user)) {
      const error = new Error("Forbidden: Only editors, proofreaders, or admins can submit a book for approval.");
      error.statusCode = 403;
      throw error;
    }
  } else if (targetStatus === "APPROVED") {
    // Requires publishing or admin permission
    if (!canPublishBooks(user)) {
      const error = new Error("Forbidden: Only administrators or content managers can approve a book.");
      error.statusCode = 403;
      throw error;
    }
  } else if (targetStatus === "REJECTED") {
    if (!canPublishBooks(user) && !canReviewBooks(user)) {
      const error = new Error("Forbidden: You do not have permission to reject this book.");
      error.statusCode = 403;
      throw error;
    }
    if (!reason || reason.trim().length === 0) {
      const error = new Error("Validation failed: A rejection reason is required when rejecting a book.");
      error.statusCode = 422;
      throw error;
    }
  } else if (targetStatus === "PUBLISHED") {
    if (!canPublishBooks(user)) {
      const error = new Error("Forbidden: Only authorized publication administrators can publish a book.");
      error.statusCode = 403;
      throw error;
    }

    // Quality gate evaluation
    const report = await evaluateBookQuality(bookId);
    if (!report.isReadyForPublication && !overrideWarnings) {
      const failingItems = report.checklist.filter((c) => !c.passed).map((c) => c.item);
      const error = new Error(
        `Publication blocked: Mandatory readiness checks failed [${failingItems.join(", ")}].`
      );
      error.statusCode = 422;
      error.readinessReport = report;
      throw error;
    }

    if (!report.isReadyForPublication && overrideWarnings) {
      const isSuper = user.role === ROLES.SUPER_ADMIN || user.role === ROLES.ADMIN;
      if (!isSuper) {
        const error = new Error("Forbidden: Overriding publication readiness checks requires Super Admin privileges.");
        error.statusCode = 403;
        throw error;
      }
    }
  }

  // 3. Build DB update data
  const updateData = {
    status: targetStatus,
  };

  const now = new Date();
  const actorEmail = user.email || user.id || "admin";

  if (targetStatus === "APPROVED") {
    updateData.approvedAt = now;
    updateData.approvedBy = actorEmail;
    updateData.rejectionReason = null;
  } else if (targetStatus === "PENDING_APPROVAL") {
    // Submitting for review clears any old approval or rejection notes
    updateData.approvedAt = null;
    updateData.approvedBy = null;
    updateData.rejectionReason = null;
  } else if (targetStatus === "REJECTED") {
    updateData.rejectionReason = reason || "Returned for correction by reviewer";
    updateData.approvedAt = null;
    updateData.approvedBy = null;
  } else if (targetStatus === "PUBLISHED") {
    updateData.publishedAt = now;
    updateData.publishedBy = actorEmail;
    updateData.publishedVersion = (book.publishedVersion || 1) + (currentStatus === "PUBLISHED" ? 1 : 0);
    updateData.rejectionReason = null;
  } else if (targetStatus === "NEEDS_REVIEW") {
    // If returning to review, any previous approval is invalidated
    updateData.approvedAt = null;
    updateData.approvedBy = null;
    if (currentStatus === "PUBLISHED") {
      updateData.publishedVersion = (book.publishedVersion || 1) + 1;
    }
  }

  const updatedBook = await prisma.book.update({
    where: { id: bookId },
    data: updateData,
  });

  // 4. Log immutable audit trail
  // If user.id does not exist as a User FK, pass null actorId to avoid FK violation while preserving actorEmail
  let validActorId = null;
  if (user.id) {
    const userExists = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true },
    });
    if (userExists) {
      validActorId = user.id;
    }
  }

  await logAdminActivity({
    actorId: validActorId,
    actorEmail: actorEmail,
    actorRole: user.role,
    action: `BOOK_LIFECYCLE_${targetStatus}`,
    targetResource: "Book",
    targetId: bookId,
    status: "SUCCESS",
    details: {
      fromStatus: currentStatus,
      toStatus: targetStatus,
      reason: reason || null,
      notes: notes || null,
      publishedVersion: updatedBook.publishedVersion,
      overridden: overrideWarnings,
    },
  });

  return updatedBook;
}
