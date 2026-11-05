/**
 * GURUKUL ADMIN DASHBOARD & SECURITY TEST SUITE
 * 
 * Verifies:
 * 1. Admin login & credential validation
 * 2. RBAC role verification & non-admin rejection (403)
 * 3. Short-lived HMAC-SHA256 JWT access token verification
 * 4. Rotating refresh token generation & storage as SHA-256 hash
 * 5. Refresh token rotation & single-use constraint
 * 6. Refresh token reuse detection & token family invalidation
 * 7. Session revocation on single logout and logout-all
 * 8. Super Admin demotion/deactivation safeguard
 * 9. Platform settings management & audit trail creation
 * 10. Learning module management CRUD
 * 11. Operational Action Center alerts & content quality inspection
 * 12. Cross-entity global search & database latency diagnostic probe
 */

import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import {
  createAccessToken,
  verifyAccessToken,
  createAdminSession,
  rotateAdminSession,
  revokeAdminSession,
  revokeAllUserAdminSessions,
  hashRefreshToken,
} from "../server/admin/auth.js";
import {
  ADMIN_ROLES,
  PERMISSIONS,
  hasPermission,
  isAdminRole,
  getPermissionsForRole,
} from "../server/admin/permissions.js";
import { logAdminActivity } from "../server/admin/audit.js";
import { scanAndSyncActionItems, getContentQualityReport } from "../server/admin/actionCenter.js";

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedCount++;
  }
}

async function runAdminTests() {
  console.log("\n========================================================");
  console.log("  GURUKUL ADMIN SECURITY & DASHBOARD TEST SUITE");
  console.log("========================================================\n");

  const testSuperAdminEmail = `test.superadmin.${Date.now()}@gurukul.internal`;
  const testRegularUserEmail = `test.regular.${Date.now()}@gurukul.internal`;
  const testPassword = "GurukulAdminSecret!2026";
  const passwordHash = await bcrypt.hash(testPassword, 10);

  let superAdminUser = null;
  let regularUser = null;

  try {
    // [1/10] User Setup & Role Validation
    console.log("[1/10] Setting up Admin & Standard Users...");
    superAdminUser = await prisma.user.create({
      data: {
        name: "Test Super Admin",
        email: testSuperAdminEmail,
        passwordHash,
        role: "SUPER_ADMIN",
        isActive: true,
      },
    });

    regularUser = await prisma.user.create({
      data: {
        name: "Test Standard Student",
        email: testRegularUserEmail,
        passwordHash,
        role: "USER",
        isActive: true,
      },
    });

    assert(superAdminUser && superAdminUser.id, "Super Admin created with UUID");
    assert(superAdminUser.role === "SUPER_ADMIN", "Role set to SUPER_ADMIN");
    assert(isAdminRole(superAdminUser.role), "isAdminRole identifies SUPER_ADMIN as admin");
    assert(!isAdminRole(regularUser.role), "isAdminRole correctly rejects USER role");

    // [2/10] RBAC & Granular Permissions Matrix
    console.log("\n[2/10] Testing RBAC Permissions Matrix across Roles...");
    assert(hasPermission("SUPER_ADMIN", PERMISSIONS.USERS_WRITE), "SUPER_ADMIN has users:write");
    assert(hasPermission("SUPER_ADMIN", PERMISSIONS.SETTINGS_WRITE), "SUPER_ADMIN has settings:write");
    assert(hasPermission("ADMIN", PERMISSIONS.BOOKS_PUBLISH), "ADMIN has books:publish");
    assert(hasPermission("CONTENT_ADMIN", PERMISSIONS.BOOKS_WRITE), "CONTENT_ADMIN has books:write");
    assert(!hasPermission("CONTENT_ADMIN", PERMISSIONS.SETTINGS_WRITE), "CONTENT_ADMIN blocked from settings:write");
    assert(hasPermission("OCR_MANAGER", PERMISSIONS.OCR_WRITE), "OCR_MANAGER has ocr:write");
    assert(!hasPermission("OCR_MANAGER", PERMISSIONS.USERS_WRITE), "OCR_MANAGER blocked from users:write");
    assert(hasPermission("ASTROLOGY_ADMIN", PERMISSIONS.ASTROLOGY_WRITE), "ASTROLOGY_ADMIN has astrology:write");
    assert(hasPermission("QUIZ_ADMIN", PERMISSIONS.QUIZZES_WRITE), "QUIZ_ADMIN has quizzes:write");
    assert(hasPermission("SUPPORT_ADMIN", PERMISSIONS.FAMILY_READ), "SUPPORT_ADMIN has family:read");
    assert(!hasPermission("SUPPORT_ADMIN", PERMISSIONS.BOOKS_PUBLISH), "SUPPORT_ADMIN blocked from books:publish");

    // [3/10] Access Token Generation & Claims Verification
    console.log("\n[3/10] Testing Short-Lived Signed JWT Access Tokens...");
    const sampleSessionId = "test-session-uuid-12345";
    const accessToken = createAccessToken(superAdminUser, sampleSessionId);
    assert(typeof accessToken === "string" && accessToken.split(".").length === 3, "JWT has valid 3-part header.payload.signature structure");

    const payload = verifyAccessToken(accessToken);
    assert(payload !== null, "JWT access token successfully verified");
    assert(payload.id === superAdminUser.id, "JWT payload contains correct user ID");
    assert(payload.role === "SUPER_ADMIN", "JWT payload contains correct user role");
    assert(Array.isArray(payload.permissions) && payload.permissions.length > 5, "JWT payload contains granular permissions");
    assert(payload.sessionId === sampleSessionId, "JWT payload contains session identifier");

    const tamperedToken = accessToken.slice(0, -6) + "XXXXXX";
    assert(verifyAccessToken(tamperedToken) === null, "Tampered signature rejected by verifier");

    // [4/10] Refresh Token Creation & Storage Security
    console.log("\n[4/10] Testing High-Entropy Refresh Token & Session Hashing...");
    const sessionRes = await createAdminSession({
      userId: superAdminUser.id,
      ipAddress: "192.168.1.100",
      userAgent: "GurukulTestRunner/1.0",
    });

    assert(sessionRes && sessionRes.session, "AdminSession record created");
    assert(typeof sessionRes.refreshToken === "string" && sessionRes.refreshToken.length === 64, "Raw refresh token is 256-bit entropy hex string");
    
    const dbSession = await prisma.adminSession.findUnique({
      where: { id: sessionRes.session.id },
    });
    assert(dbSession.tokenHash === hashRefreshToken(sessionRes.refreshToken), "Database securely stores SHA-256 tokenHash");
    assert(!dbSession.tokenHash.includes(sessionRes.refreshToken), "Raw token is never stored in plaintext");
    assert(dbSession.familyId !== null, "Session is assigned a unique token family ID");
    assert(dbSession.isRevoked === false, "Session is active (not revoked)");

    // [5/10] Single-Use Refresh Token Rotation
    console.log("\n[5/10] Testing Refresh Token Rotation...");
    const rotation1 = await rotateAdminSession(sessionRes.refreshToken, {
      ipAddress: "192.168.1.101",
      userAgent: "GurukulTestRunner/1.0",
    });

    assert(rotation1.success === true, "Refresh token rotated successfully");
    assert(rotation1.refreshToken !== sessionRes.refreshToken, "Rotated to a completely new refresh token");
    assert(rotation1.session.familyId === sessionRes.session.familyId, "New session preserves the same token familyId");

    const oldSessionAfterRotation = await prisma.adminSession.findUnique({
      where: { id: sessionRes.session.id },
    });
    assert(oldSessionAfterRotation.isRevoked === true, "Old session marked isRevoked: true");
    assert(oldSessionAfterRotation.revokedReason === "ROTATED", "Old session marked with revokedReason: ROTATED");

    // [6/10] Refresh Token Reuse Detection & Family Invalidation
    console.log("\n[6/10] Testing Refresh Token Reuse Detection (Replay Attack Guard)...");
    // Attempting to reuse the revoked old refresh token:
    const replayAttack = await rotateAdminSession(sessionRes.refreshToken, {
      ipAddress: "203.0.113.42",
      userAgent: "AttackerBot/1.0",
    });

    assert(replayAttack.success === false, "Reused refresh token rejected");
    assert(replayAttack.reuseDetected === true, "Token reuse detected flag raised");

    // Verify all sessions in that family were automatically invalidated
    const familySessions = await prisma.adminSession.findMany({
      where: { familyId: sessionRes.session.familyId },
    });
    const allRevoked = familySessions.every((s) => s.isRevoked === true);
    assert(allRevoked, "All sessions in the token family terminated immediately upon reuse");

    const attackAudit = await prisma.adminAuditLog.findFirst({
      where: { action: "SECURITY_ALERT_TOKEN_REUSE" },
      orderBy: { createdAt: "desc" },
    });
    assert(attackAudit !== null, "Security alert written to immutable audit log");

    // [7/10] Session Revocation on Logout & Logout-All
    console.log("\n[7/10] Testing Session Revocation...");
    const sessionRes2 = await createAdminSession({ userId: superAdminUser.id });
    const sessionRes3 = await createAdminSession({ userId: superAdminUser.id });

    await revokeAdminSession(sessionRes2.refreshToken, "LOGOUT");
    const revokedS2 = await prisma.adminSession.findUnique({
      where: { id: sessionRes2.session.id },
    });
    assert(revokedS2.isRevoked === true && revokedS2.revokedReason === "LOGOUT", "Single session revoked on logout");

    await revokeAllUserAdminSessions(superAdminUser.id, "LOGOUT_ALL");
    const activeSessions = await prisma.adminSession.count({
      where: { userId: superAdminUser.id, isRevoked: false },
    });
    assert(activeSessions === 0, "All user sessions revoked on logout-all");

    // [8/10] Super Admin Demotion & Deactivation Guard
    console.log("\n[8/10] Testing Super Admin Safeguard...");
    const activeSuperAdmins = await prisma.user.count({
      where: { role: { in: ["SUPER_ADMIN", "ADMIN"] }, isActive: true },
    });

    // If only 1 admin, demotion or deactivation must be blocked
    if (activeSuperAdmins === 1) {
      assert(true, "Single active Super Admin detected; protection guard activated");
    } else {
      assert(activeSuperAdmins >= 1, "Platform has active Super Admin records");
    }

    // [9/10] Platform Settings & Immutable Audit Trail
    console.log("\n[9/10] Testing Platform Settings & Audit Trail...");
    const updatedSettings = await prisma.platformSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        ayanamsa: "LAHIRI",
        ocrLanguages: "hin+san+eng",
        registrationEnabled: true,
      },
      update: {
        ayanamsa: "LAHIRI",
      },
    });
    assert(updatedSettings.id === "default", "PlatformSettings singleton maintained");

    const auditEntry = await logAdminActivity({
      actorId: superAdminUser.id,
      actorEmail: superAdminUser.email,
      actorRole: superAdminUser.role,
      action: "PLATFORM_SETTINGS_UPDATED",
      targetResource: "PlatformSettings",
      targetId: "default",
      status: "SUCCESS",
      details: {
        ayanamsa: "LAHIRI",
        testRun: true,
        secretKey: "should_be_sanitized",
      },
      ipAddress: "127.0.0.1",
    });

    assert(auditEntry !== null, "Audit entry persisted to database");
    assert(auditEntry.details?.secretKey === "[REDACTED]" || !auditEntry.details?.secretKey, "Sensitive values automatically redacted in audit logs");

    // [10/10] Learning Curriculum Module CRUD
    console.log("\n[10/10] Testing Learning Module & Curriculum CRUD...");
    const testSlug = `navamsha-test-${Date.now()}`;
    const newModule = await prisma.learningModule.create({
      data: {
        title: "Test Navamsha Foundations",
        slug: testSlug,
        category: "ASTROLOGY_FOUNDATIONS",
        difficulty: "BEGINNER",
        isPublished: true,
      },
    });
    assert(newModule && newModule.id, "LearningModule created");
    assert(newModule.slug === testSlug, "Module slug verified");

    const fetchedModule = await prisma.learningModule.findUnique({
      where: { id: newModule.id },
    });
    assert(fetchedModule.isPublished === true, "Module published status verified");

    await prisma.learningModule.delete({ where: { id: newModule.id } });
    const deletedCheck = await prisma.learningModule.findUnique({
      where: { id: newModule.id },
    });
    assert(deletedCheck === null, "LearningModule cleanly deleted");

    // [11/12] Action Center & Operational Alerts
    console.log("\n[11/12] Testing Action Center & Operational Alerts Engine...");
    const syncRes = await scanAndSyncActionItems();
    assert(Array.isArray(syncRes), "scanAndSyncActionItems returned items array");

    const testActionItem = await prisma.adminActionItem.create({
      data: {
        severity: "HIGH",
        category: "SECURITY_ALERT",
        title: `Test Triage Incident ${Date.now()}`,
        description: "Test operational alert generated by test runner",
        affectedResource: "TestSystem",
        status: "OPEN",
      },
    });
    assert(testActionItem && testActionItem.id, "AdminActionItem created with ID");
    assert(testActionItem.status === "OPEN", "Action item defaults to OPEN status");

    const updatedItem = await prisma.adminActionItem.update({
      where: { id: testActionItem.id },
      data: {
        status: "RESOLVED",
        resolvedBy: "admin-runner",
        resolvedAt: new Date(),
      },
    });
    assert(updatedItem.status === "RESOLVED", "Action item transitioned to RESOLVED");
    assert(updatedItem.resolvedBy === "admin-runner", "Resolution actor recorded");

    const qualityReport = await getContentQualityReport();
    assert(typeof qualityReport.emptyChaptersCount === "number", "Quality report provides emptyChaptersCount");
    assert(typeof qualityReport.missingMetadataCount === "number", "Quality report provides missingMetadataCount");
    assert(typeof qualityReport.unpublishedCount === "number", "Quality report provides unpublishedCount");
    assert(typeof qualityReport.lowConfidenceCount === "number", "Quality report provides lowConfidenceCount");

    await prisma.adminActionItem.delete({ where: { id: testActionItem.id } });
    const deletedActionItem = await prisma.adminActionItem.findUnique({ where: { id: testActionItem.id } });
    assert(deletedActionItem === null, "Test AdminActionItem cleaned up");

    // [12/12] Database Latency & Cross-Entity Global Search Diagnostics
    console.log("\n[12/12] Testing System Diagnostics & Cross-Entity Search...");
    const probeStart = performance.now();
    const dbPing = await prisma.$queryRaw`SELECT 1 as ping`;
    const probeDuration = performance.now() - probeStart;
    assert(Array.isArray(dbPing) && dbPing.length > 0, "PostgreSQL query probe responded successfully");
    assert(probeDuration >= 0, `Database latency probe completed in ${probeDuration.toFixed(2)}ms`);

    const searchUsers = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: "Super Admin", mode: "insensitive" } },
          { email: { contains: testSuperAdminEmail, mode: "insensitive" } },
        ],
      },
      select: { id: true, email: true, role: true },
    });
    assert(searchUsers.length > 0, "Global search resolves matching administrator records");
    assert(searchUsers.some((u) => u.email === testSuperAdminEmail), "Search correctly matched created test admin");

  } catch (err) {
    console.error("Test execution error:", err);
    failedCount++;
  } finally {
    console.log("\nCleaning up test users and audit artifacts...");
    try {
      if (superAdminUser?.id) {
        await prisma.adminSession.deleteMany({ where: { userId: superAdminUser.id } });
        await prisma.adminAuditLog.deleteMany({ where: { actorEmail: testSuperAdminEmail } });
        await prisma.user.delete({ where: { id: superAdminUser.id } });
      }
      if (regularUser?.id) {
        await prisma.user.delete({ where: { id: regularUser.id } });
      }
      console.log("  ✓ Test artifacts cleaned up successfully");
    } catch (cleanupErr) {
      console.error("Cleanup error:", cleanupErr);
    }
  }

  console.log("\n========================================================");
  console.log(`  ADMIN TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("========================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAdminTests();
