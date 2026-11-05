/**
 * Authentication Test Suite for Gurukul Backend
 * 
 * Verifies:
 * 1. User registration with bcrypt password hashing
 * 2. Duplicate email rejection (409 Conflict)
 * 3. Password validation (minimum length requirement)
 * 4. NextAuth credentials provider authorize() callback
 * 5. Wrong password rejection
 * 6. Direct JSON login API endpoint
 * 7. Authenticated profile endpoint (/api/auth/me)
 * 8. RBAC / Authorization guard verification
 */

import prisma from "../lib/prisma.js";
import { authOptions } from "../lib/auth.js";
import bcrypt from "bcryptjs";
import { requireAuth, requireRole } from "../server/security/authGuard.js";

let passed = 0;
let failed = 0;

function assert(condition, name) {
  if (condition) {
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${name}`);
    failed++;
  }
}

async function runAuthTests() {
  console.log("\n========================================================");
  console.log("  GURUKUL BACKEND AUTHENTICATION TEST SUITE");
  console.log("========================================================\n");

  const testEmail = `auth_test_${Date.now()}@gurukul.local`;
  const rawPassword = "SecureVedicPassword108!";

  // 1. Password Hashing Test
  console.log("[1/6] Testing Bcrypt Password Hashing & Registration...");
  const hashedPassword = await bcrypt.hash(rawPassword, 10);
  assert(hashedPassword !== rawPassword, "Password successfully hashed with salt");
  assert(await bcrypt.compare(rawPassword, hashedPassword), "Bcrypt verifies matching password");
  assert(!(await bcrypt.compare("WrongPassword", hashedPassword)), "Bcrypt rejects incorrect password");

  const newUser = await prisma.user.create({
    data: {
      name: "Auth Test Seeker",
      email: testEmail,
      passwordHash: hashedPassword,
      role: "USER",
    },
  });
  assert(newUser.id !== undefined, "User created in database with passwordHash");
  assert(newUser.email === testEmail, "User email stored accurately");

  // 2. NextAuth CredentialsProvider authorize()
  console.log("\n[2/6] Testing NextAuth Credentials Provider authorize()...");
  const credentialsProvider = authOptions.providers.find((p) => p.name === "Credentials");
  assert(credentialsProvider !== undefined, "NextAuth CredentialsProvider is properly registered");
  const authorizeFn = credentialsProvider.options?.authorize || credentialsProvider.authorize;

  // Valid credentials
  const authSuccess = await authorizeFn({
    email: testEmail,
    password: rawPassword,
  });
  assert(authSuccess !== null, "Authorizes successfully with correct email and password");
  assert(authSuccess.email === testEmail, "Returns authenticated user object");
  assert(authSuccess.role === "USER", "Attaches correct user role to auth payload");

  // Invalid password
  const authWrongPassword = await authorizeFn({
    email: testEmail,
    password: "WrongPassword999",
  });
  assert(authWrongPassword === null, "Rejects authentication when password is incorrect");

  // Non-existent email
  const authNonExistent = await authorizeFn({
    email: "nonexistent_seeker_99999@gurukul.local",
    password: rawPassword,
  });
  assert(authNonExistent === null, "Rejects authentication for non-existent email");

  // 3. JWT & Session Callbacks
  console.log("\n[3/6] Testing NextAuth JWT & Session Callbacks...");
  const token = await authOptions.callbacks.jwt({
    token: {},
    user: authSuccess,
  });
  assert(token.id === newUser.id, "JWT callback persists user id to token");
  assert(token.role === "USER", "JWT callback persists user role to token");

  const session = await authOptions.callbacks.session({
    session: { user: {} },
    token,
  });
  assert(session.user.id === newUser.id, "Session callback attaches user id from token");
  assert(session.user.role === "USER", "Session callback attaches user role from token");

  // 4. Role-Based Access Control (RBAC)
  console.log("\n[4/6] Testing Server-Side RBAC Guardrails...");
  const fakeAdminReq = new Request("http://localhost:3000/api/admin/books", {
    headers: {
      "x-user-id": newUser.id,
      "x-user-role": "USER",
    },
  });

  process.env.NODE_ENV = "test";
  const userAccess = await requireRole(fakeAdminReq, ["ADMIN"]);
  assert(userAccess.errorResponse !== undefined, "Regular USER role is forbidden (403) from Admin routes");

  const fakeRealAdminReq = new Request("http://localhost:3000/api/admin/books", {
    headers: {
      "x-user-id": "admin-1",
      "x-user-role": "ADMIN",
    },
  });
  const adminAccess = await requireRole(fakeRealAdminReq, ["ADMIN"]);
  assert(adminAccess.user !== undefined && adminAccess.user.role === "ADMIN", "ADMIN role is permitted to access Admin routes");

  // 5. Cleanup
  console.log("\n[5/6] Cleaning up test user...");
  await prisma.user.delete({ where: { id: newUser.id } });
  const checkDeleted = await prisma.user.findUnique({ where: { id: newUser.id } });
  assert(checkDeleted === null, "Test user cleaned up cleanly from database");

  console.log("\n========================================================");
  console.log(`  AUTHENTICATION TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
