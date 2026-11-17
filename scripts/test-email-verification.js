/**
 * Automated Test Suite for Email Verification Workflow in Gurukul
 */

import prisma from "../lib/prisma.js";
import {
  createAndSendVerificationToken,
  verifyEmailOtp,
  getSentEmailHistory,
  clearSentEmailHistory,
} from "../server/email/emailService.js";

async function runTests() {
  console.log("===============================================================================");
  console.log("             GURUKUL EMAIL VERIFICATION & AUTH WORKFLOW TESTS                 ");
  console.log("===============================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  const testEmail = `seeker-${Date.now()}@testgurukul.org`;
  clearSentEmailHistory();

  try {
    // 1. Create unverified user
    console.log("--- TEST 1: Register User with isEmailVerified: false ---");
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: "Test Seeker",
        isEmailVerified: false,
      },
    });

    assert(user.isEmailVerified === false, "User record created with isEmailVerified = false");

    // 2. Dispatch 6-digit verification code
    console.log("\n--- TEST 2: Generate & Dispatch 6-Digit Email OTP ---");
    const sendResult = await createAndSendVerificationToken(testEmail, user.name);
    assert(sendResult.success === true, "createAndSendVerificationToken returned success");

    const tokenRecord = await prisma.emailVerificationToken.findFirst({
      where: { email: testEmail, used: false },
      orderBy: { createdAt: "desc" },
    });

    assert(Boolean(tokenRecord), "EmailVerificationToken record persisted in database");
    assert(tokenRecord.otpCode.length === 6, `Generated OTP is a 6-digit code: [${tokenRecord.otpCode}]`);
    assert(new Date(tokenRecord.expiresAt).getTime() > Date.now(), "Token expiration is in the future (~15 mins)");

    const sentEmails = getSentEmailHistory();
    const verificationEmail = sentEmails.find((e) => e.to === testEmail);
    assert(Boolean(verificationEmail), "Email dispatched to recipient address");
    assert(verificationEmail.otpCode === tokenRecord.otpCode, "Dispatched email contains matching 6-digit OTP code");

    // 3. Negative test: wrong OTP code
    console.log("\n--- TEST 3: Invalid Verification Code Handling ---");
    let caughtInvalidError = false;
    try {
      await verifyEmailOtp(testEmail, "000000");
    } catch (err) {
      caughtInvalidError = true;
      assert(err.message.includes("Invalid or expired"), `Rejected invalid code with error: "${err.message}"`);
    }
    assert(caughtInvalidError, "Rejected incorrect OTP code");

    // 4. Positive test: valid 6-digit OTP code
    console.log("\n--- TEST 4: Valid Verification Code Completion ---");
    const verifyResult = await verifyEmailOtp(testEmail, tokenRecord.otpCode);
    assert(verifyResult.success === true, "verifyEmailOtp succeeded with correct code");

    const verifiedUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    assert(verifiedUser.isEmailVerified === true, "User isEmailVerified updated to true");
    assert(Boolean(verifiedUser.emailVerified), `User emailVerified timestamp set: ${verifiedUser.emailVerified}`);

    // Token marked as used
    const usedToken = await prisma.emailVerificationToken.findUnique({
      where: { id: tokenRecord.id },
    });
    assert(usedToken.used === true, "Token record marked used: true (cannot be replayed)");

    // Clean up test records
    await prisma.emailVerificationToken.deleteMany({ where: { email: testEmail } });
    await prisma.user.delete({ where: { id: user.id } });

  } catch (err) {
    console.error("Test failure:", err);
    failed++;
  }

  console.log("\n===============================================================================");
  console.log(`   TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log("===============================================================================\n");

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runTests();
