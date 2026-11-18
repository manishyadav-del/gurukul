/**
 * Gurukul Admin Permissions & Role-Based Access Control (RBAC)
 */

export const ADMIN_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  CONTENT_ADMIN: "CONTENT_ADMIN",
  OCR_MANAGER: "OCR_MANAGER",
  ASTROLOGY_ADMIN: "ASTROLOGY_ADMIN",
  QUIZ_ADMIN: "QUIZ_ADMIN",
  SUPPORT_ADMIN: "SUPPORT_ADMIN",
  // Legacy / existing compatibility mappings
  EDITOR: "EDITOR",
  PROOFREADER: "PROOFREADER",
  EXPERT: "EXPERT",
};

export const PERMISSIONS = {
  // User Management
  USERS_READ: "users:read",
  USERS_WRITE: "users:write",
  USERS_DELETE: "users:delete",

  // Family Management
  FAMILY_READ: "family:read",
  FAMILY_WRITE: "family:write",

  // Digital Books
  BOOKS_READ: "books:read",
  BOOKS_WRITE: "books:write",
  BOOKS_PUBLISH: "books:publish",

  // OCR Processing
  OCR_READ: "ocr:read",
  OCR_WRITE: "ocr:write",

  // Astrology & Panchang
  ASTROLOGY_READ: "astrology:read",
  ASTROLOGY_WRITE: "astrology:write",

  // Numerology
  NUMEROLOGY_READ: "numerology:read",
  NUMEROLOGY_WRITE: "numerology:write",

  // Astro AI
  AI_READ: "ai:read",
  AI_WRITE: "ai:write",

  // Learning Curriculum
  LEARNING_READ: "learning:read",
  LEARNING_WRITE: "learning:write",

  // Quizzes
  QUIZZES_READ: "quizzes:read",
  QUIZZES_WRITE: "quizzes:write",

  // Analytics & Audits
  ANALYTICS_READ: "analytics:read",
  AUDIT_READ: "audit:read",

  // Platform Configuration
  SETTINGS_READ: "settings:read",
  SETTINGS_WRITE: "settings:write",
};

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS_MAP = {
  [ADMIN_ROLES.SUPER_ADMIN]: ALL_PERMISSIONS,
  [ADMIN_ROLES.ADMIN]: ALL_PERMISSIONS,
  
  [ADMIN_ROLES.CONTENT_ADMIN]: [
    PERMISSIONS.BOOKS_READ,
    PERMISSIONS.BOOKS_WRITE,
    PERMISSIONS.BOOKS_PUBLISH,
    PERMISSIONS.LEARNING_READ,
    PERMISSIONS.LEARNING_WRITE,
    PERMISSIONS.QUIZZES_READ,
    PERMISSIONS.QUIZZES_WRITE,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.ANALYTICS_READ,
  ],

  [ADMIN_ROLES.EDITOR]: [
    PERMISSIONS.BOOKS_READ,
    PERMISSIONS.BOOKS_WRITE,
    PERMISSIONS.BOOKS_PUBLISH,
    PERMISSIONS.LEARNING_READ,
    PERMISSIONS.LEARNING_WRITE,
    PERMISSIONS.QUIZZES_READ,
    PERMISSIONS.QUIZZES_WRITE,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.ANALYTICS_READ,
  ],

  [ADMIN_ROLES.OCR_MANAGER]: [
    PERMISSIONS.BOOKS_READ,
    PERMISSIONS.OCR_READ,
    PERMISSIONS.OCR_WRITE,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.ANALYTICS_READ,
  ],

  [ADMIN_ROLES.PROOFREADER]: [
    PERMISSIONS.BOOKS_READ,
    PERMISSIONS.OCR_READ,
    PERMISSIONS.OCR_WRITE,
    PERMISSIONS.AUDIT_READ,
  ],

  [ADMIN_ROLES.ASTROLOGY_ADMIN]: [
    PERMISSIONS.ASTROLOGY_READ,
    PERMISSIONS.ASTROLOGY_WRITE,
    PERMISSIONS.NUMEROLOGY_READ,
    PERMISSIONS.NUMEROLOGY_WRITE,
    PERMISSIONS.AI_READ,
    PERMISSIONS.AI_WRITE,
    PERMISSIONS.BOOKS_READ,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.ANALYTICS_READ,
  ],

  [ADMIN_ROLES.EXPERT]: [
    PERMISSIONS.ASTROLOGY_READ,
    PERMISSIONS.ASTROLOGY_WRITE,
    PERMISSIONS.NUMEROLOGY_READ,
    PERMISSIONS.NUMEROLOGY_WRITE,
    PERMISSIONS.AI_READ,
    PERMISSIONS.AI_WRITE,
    PERMISSIONS.BOOKS_READ,
    PERMISSIONS.AUDIT_READ,
  ],

  [ADMIN_ROLES.QUIZ_ADMIN]: [
    PERMISSIONS.QUIZZES_READ,
    PERMISSIONS.QUIZZES_WRITE,
    PERMISSIONS.LEARNING_READ,
    PERMISSIONS.LEARNING_WRITE,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.ANALYTICS_READ,
  ],

  [ADMIN_ROLES.SUPPORT_ADMIN]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.USERS_WRITE,
    PERMISSIONS.FAMILY_READ,
    PERMISSIONS.FAMILY_WRITE,
    PERMISSIONS.AUDIT_READ,
  ],
};

/**
 * Checks whether a given role is recognized as an administrative role.
 */
export function isAdminRole(role) {
  if (!role) return false;
  return Boolean(ROLE_PERMISSIONS_MAP[role]);
}

/**
 * Retrieves the list of permission strings granted to a role.
 */
export function getPermissionsForRole(role) {
  if (!role) return [];
  return ROLE_PERMISSIONS_MAP[role] || [];
}

/**
 * Validates if a role has the specified permission.
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission) || role === ADMIN_ROLES.SUPER_ADMIN || role === ADMIN_ROLES.ADMIN;
}

/**
 * Human readable label for roles
 */
export const ROLE_LABELS = {
  SUPER_ADMIN: "Super Administrator",
  ADMIN: "Administrator",
  CONTENT_ADMIN: "Content Administrator",
  OCR_MANAGER: "OCR Operations Manager",
  ASTROLOGY_ADMIN: "Astrology & AI Specialist",
  QUIZ_ADMIN: "Quiz & Learning Manager",
  SUPPORT_ADMIN: "Support Administrator",
  EDITOR: "Content Editor",
  PROOFREADER: "OCR Proofreader",
  EXPERT: "Vedic Scholar / Expert",
  USER: "Standard User",
};
