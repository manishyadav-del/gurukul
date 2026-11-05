/**
 * Role-based permission checks for Gurukul Astrology
 */

export const ROLES = {
  USER: "USER",
  PROOFREADER: "PROOFREADER",
  EXPERT: "EXPERT",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
  CONTENT_ADMIN: "CONTENT_ADMIN",
  OCR_MANAGER: "OCR_MANAGER",
  ASTROLOGY_ADMIN: "ASTROLOGY_ADMIN",
  QUIZ_ADMIN: "QUIZ_ADMIN",
  SUPPORT_ADMIN: "SUPPORT_ADMIN",
};

export function isAdmin(user) {
  return Boolean(
    user &&
      (user.role === ROLES.ADMIN ||
        user.role === ROLES.SUPER_ADMIN ||
        user.role === ROLES.CONTENT_ADMIN ||
        user.role === ROLES.OCR_MANAGER ||
        user.role === ROLES.ASTROLOGY_ADMIN ||
        user.role === ROLES.QUIZ_ADMIN ||
        user.role === ROLES.SUPPORT_ADMIN)
  );
}

export function isEditor(user) {
  return Boolean(
    user &&
      (user.role === ROLES.EDITOR ||
        user.role === ROLES.ADMIN ||
        user.role === ROLES.SUPER_ADMIN ||
        user.role === ROLES.CONTENT_ADMIN)
  );
}

export function isExpert(user) {
  return Boolean(
    user &&
      (user.role === ROLES.EXPERT ||
        user.role === ROLES.ADMIN ||
        user.role === ROLES.SUPER_ADMIN ||
        user.role === ROLES.ASTROLOGY_ADMIN)
  );
}

export function isProofreader(user) {
  return Boolean(
    user &&
      (user.role === ROLES.PROOFREADER ||
        user.role === ROLES.EDITOR ||
        user.role === ROLES.ADMIN ||
        user.role === ROLES.SUPER_ADMIN ||
        user.role === ROLES.OCR_MANAGER)
  );
}

export function canManageBooks(user) {
  return Boolean(
    user &&
      (user.role === ROLES.ADMIN ||
        user.role === ROLES.SUPER_ADMIN ||
        user.role === ROLES.CONTENT_ADMIN)
  );
}

export function canPublishBooks(user) {
  return Boolean(
    user &&
      (user.role === ROLES.ADMIN ||
        user.role === ROLES.SUPER_ADMIN ||
        user.role === ROLES.CONTENT_ADMIN)
  );
}

export function canEditBookContent(user) {
  return Boolean(
    user &&
      (user.role === ROLES.ADMIN ||
        user.role === ROLES.SUPER_ADMIN ||
        user.role === ROLES.CONTENT_ADMIN ||
        user.role === ROLES.EDITOR ||
        user.role === ROLES.PROOFREADER ||
        user.role === ROLES.OCR_MANAGER)
  );
}

export function canReviewBooks(user) {
  return Boolean(
    user &&
      (user.role === ROLES.ADMIN ||
        user.role === ROLES.SUPER_ADMIN ||
        user.role === ROLES.CONTENT_ADMIN ||
        user.role === ROLES.OCR_MANAGER ||
        user.role === ROLES.EDITOR ||
        user.role === ROLES.PROOFREADER ||
        user.role === ROLES.EXPERT)
  );
}

export function canProcessOcr(user) {
  return Boolean(
    user &&
      (user.role === ROLES.ADMIN ||
        user.role === ROLES.SUPER_ADMIN ||
        user.role === ROLES.OCR_MANAGER ||
        user.role === ROLES.CONTENT_ADMIN ||
        user.role === ROLES.EDITOR)
  );
}
