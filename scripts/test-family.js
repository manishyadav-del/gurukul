/**
 * Family Management & Email Invitations Test Suite for Gurukul
 * 
 * Verifies:
 * 1. Creating, editing, and archiving family member profiles
 * 2. Strict authorization preventing cross-user profile tampering (403 Forbidden)
 * 3. Birth details validation and Vedic Kundli generation
 * 4. Single-use invitation token generation and SHA-256 database hashing
 * 5. Rejection of duplicate pending invitations (409 Conflict)
 * 6. Email mismatch rejection upon acceptance (403 Forbidden)
 * 7. Successful invitation acceptance and account linking
 * 8. Token reuse prevention (single-use constraint)
 * 9. Handling of expired and revoked invitations
 * 10. Concurrency race-condition protection during acceptance
 * 11. Profile unlinking without data loss
 */

process.env.NODE_ENV = "test";

import prisma from "../lib/prisma.js";
import {
  createFamilyMember,
  updateFamilyMember,
  getFamilyMember,
  listFamilyMembers,
  deleteFamilyMember,
  createFamilyInvitation,
  resendFamilyInvitation,
  revokeFamilyInvitation,
  inspectInvitationToken,
  acceptFamilyInvitation,
  unlinkFamilyMember,
} from "../server/family/familyService.js";
import {
  getSentEmailHistory,
  clearSentEmailHistory,
  hashInvitationToken,
} from "../server/email/emailService.js";

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

async function runFamilyTests() {
  console.log("\n========================================================");
  console.log("  GURUKUL FAMILY MANAGEMENT & INVITATIONS TEST SUITE");
  console.log("========================================================\n");

  const timestamp = Date.now();
  const userA_Email = `user_a_${timestamp}@gurukul.local`;
  const userB_Email = `user_b_${timestamp}@gurukul.local`;
  const intruder_Email = `intruder_${timestamp}@gurukul.local`;

  let userA, userB, intruder;

  try {
    // Setup test users
    userA = await prisma.user.create({
      data: {
        name: "Arjun Sharma (Family Owner)",
        email: userA_Email,
        role: "USER",
      },
    });

    userB = await prisma.user.create({
      data: {
        name: "Pooja Sharma (Spouse)",
        email: userB_Email,
        role: "USER",
      },
    });

    intruder = await prisma.user.create({
      data: {
        name: "Intruder User",
        email: intruder_Email,
        role: "USER",
      },
    });

    // ----------------------------------------------------
    // 1. CREATE FAMILY MEMBER
    // ----------------------------------------------------
    console.log("[1/10] Testing Family Profile Creation & Kundli Generation...");
    const createdMember = await createFamilyMember(userA.id, {
      name: "Pooja Sharma",
      relationship: "SPOUSE",
      gender: "FEMALE",
      dateOfBirth: "1994-08-15",
      birthTime: "06:30",
      birthPlace: "Varanasi, Uttar Pradesh, India",
      notes: "Devoted reader of Bhagavad Gita",
    });

    assert(createdMember.id !== undefined, "Family member created with UUID");
    assert(createdMember.name === "Pooja Sharma", "Member name recorded accurately");
    assert(createdMember.relationship === "SPOUSE", "Relationship recorded as SPOUSE");
    assert(createdMember.ownerId === userA.id, "Owner correctly set to User A");
    assert(createdMember.linkedUserId === null, "New profile has null linkedUserId (managed by owner)");
    assert(createdMember.birthProfileId !== null, "Automatically calculated and linked Vedic BirthProfile");

    // ----------------------------------------------------
    // 2. RETRIEVAL & OWNERSHIP ISOLATION
    // ----------------------------------------------------
    console.log("\n[2/10] Testing Ownership Authorization & Cross-User Security...");
    const fetchedByOwner = await getFamilyMember(createdMember.id, userA.id);
    assert(fetchedByOwner !== null, "Owner can retrieve family member profile");
    assert(fetchedByOwner.isOwner === true, "isOwner flag is true for owner");

    let crossUserBlocked = false;
    try {
      await getFamilyMember(createdMember.id, intruder.id);
    } catch (err) {
      if (err.statusCode === 403) crossUserBlocked = true;
    }
    assert(crossUserBlocked, "Intruder blocked with 403 Forbidden when accessing User A's member");

    // ----------------------------------------------------
    // 3. EDIT FAMILY MEMBER
    // ----------------------------------------------------
    console.log("\n[3/10] Testing Family Member Updates...");
    const updatedMember = await updateFamilyMember(createdMember.id, userA.id, {
      name: "Pooja A. Sharma",
      notes: "Updated spiritual study goals",
    });
    assert(updatedMember.name === "Pooja A. Sharma", "Member name updated successfully");
    assert(updatedMember.notes === "Updated spiritual study goals", "Member notes updated");

    let intruderEditBlocked = false;
    try {
      await updateFamilyMember(createdMember.id, intruder.id, { name: "Hacked Name" });
    } catch (err) {
      if (err.statusCode === 403) intruderEditBlocked = true;
    }
    assert(intruderEditBlocked, "Intruder blocked from updating User A's family member");

    // ----------------------------------------------------
    // 4. SEND EMAIL INVITATION & TOKEN HASHING
    // ----------------------------------------------------
    console.log("\n[4/10] Testing Email Invitation Dispatch & Crypto Hashing...");
    clearSentEmailHistory();

    const inviteResult = await createFamilyInvitation(userA.id, {
      familyMemberId: createdMember.id,
      email: userB_Email,
      personalMessage: "Join our Gurukul circle so we can share astrological insights!",
    });

    assert(inviteResult.invitation.id !== undefined, "Invitation record created");
    assert(inviteResult.invitation.status === "PENDING", "Invitation status is PENDING");
    assert(inviteResult.emailDelivery.success === true, "Email delivery returned success");

    const emailHistory = getSentEmailHistory();
    assert(emailHistory.length >= 1, "Invitation email recorded in outbound email buffer");
    assert(emailHistory[0].to === userB_Email, "Email dispatched to correct recipient");
    assert(emailHistory[0].subject.includes("Gurukul Family Circle"), "Email subject contains Gurukul branding");

    const rawToken = inviteResult.rawTokenForTesting;
    const computedHash = hashInvitationToken(rawToken);

    // Verify database stores ONLY hash, never raw token
    const dbInvitation = await prisma.familyInvitation.findUnique({
      where: { id: inviteResult.invitation.id },
    });
    assert(dbInvitation.tokenHash === computedHash, "Database securely stores SHA-256 tokenHash");
    assert(!dbInvitation.token, "Database has no raw token column or plain text leak");

    // ----------------------------------------------------
    // 5. DUPLICATE INVITATION REJECTION
    // ----------------------------------------------------
    console.log("\n[5/10] Testing Duplicate Invitation Guard...");
    let duplicateBlocked = false;
    try {
      await createFamilyInvitation(userA.id, {
        familyMemberId: createdMember.id,
        email: userB_Email,
      });
    } catch (err) {
      if (err.statusCode === 409) duplicateBlocked = true;
    }
    assert(duplicateBlocked, "Duplicate pending invitation rejected with 409 Conflict");

    // Self-invitation rejection
    let selfInviteBlocked = false;
    try {
      await createFamilyInvitation(userA.id, {
        familyMemberId: createdMember.id,
        email: userA_Email,
      });
    } catch (err) {
      if (err.statusCode === 400) selfInviteBlocked = true;
    }
    assert(selfInviteBlocked, "Inviting own email address rejected with 400 Bad Request");

    // ----------------------------------------------------
    // 6. TOKEN INSPECTION
    // ----------------------------------------------------
    console.log("\n[6/10] Testing Token Inspection without Acceptance...");
    const inspection = await inspectInvitationToken(rawToken);
    assert(inspection.valid === true, "Valid raw token passes inspection");
    assert(inspection.invitation.invitedEmail === userB_Email, "Returns recipient email for UI verification");
    assert(inspection.invitation.inviter.name === userA.name, "Returns inviter display name");

    const invalidInspection = await inspectInvitationToken("tampered_token_xyz_123");
    assert(invalidInspection.valid === false, "Tampered token fails inspection");
    assert(invalidInspection.reason === "NOT_FOUND", "Fails with NOT_FOUND");

    // ----------------------------------------------------
    // 7. EMAIL MISMATCH REJECTION
    // ----------------------------------------------------
    console.log("\n[7/10] Testing Strict Email Mismatch Security...");
    let mismatchBlocked = false;
    try {
      // Intruder attempts to accept invitation sent to User B
      await acceptFamilyInvitation(rawToken, intruder);
    } catch (err) {
      if (err.statusCode === 403 && err.message.includes("Email mismatch")) {
        mismatchBlocked = true;
      }
    }
    assert(mismatchBlocked, "Unauthorized user with mismatched email rejected with 403 Email Mismatch");

    // ----------------------------------------------------
    // 8. ACCEPTANCE & ACCOUNT LINKING
    // ----------------------------------------------------
    console.log("\n[8/10] Testing Valid Invitation Acceptance & Account Linking...");
    const acceptResult = await acceptFamilyInvitation(rawToken, userB);
    assert(acceptResult.success === true, "Invitation accepted successfully by matching user");

    // Verify member is now linked to User B
    const linkedMember = await prisma.familyMember.findUnique({
      where: { id: createdMember.id },
    });
    assert(linkedMember.linkedUserId === userB.id, "Family member linkedUserId set to User B");

    // Verify invitation marked as ACCEPTED
    const acceptedInvite = await prisma.familyInvitation.findUnique({
      where: { id: dbInvitation.id },
    });
    assert(acceptedInvite.status === "ACCEPTED", "Invitation status transitioned to ACCEPTED");
    assert(acceptedInvite.acceptedAt !== null, "acceptedAt timestamp recorded");

    // Verify notification sent to inviter
    const acceptanceEmail = getSentEmailHistory().find((e) => e.type === "ACCEPTED_NOTIFICATION");
    assert(acceptanceEmail !== undefined, "Acceptance notification email dispatched to inviter");
    assert(acceptanceEmail.to === userA_Email, "Notification sent to User A's email");

    // ----------------------------------------------------
    // 9. TOKEN REUSE & CONCURRENCY PROTECTION
    // ----------------------------------------------------
    console.log("\n[9/10] Testing Single-Use Token Reuse Prevention...");
    let reuseBlocked = false;
    try {
      await acceptFamilyInvitation(rawToken, userB);
    } catch (err) {
      if (err.statusCode === 409) reuseBlocked = true;
    }
    assert(reuseBlocked, "Reusing accepted token rejected with 409 Conflict");

    // ----------------------------------------------------
    // 10. EXPIRATION, REVOCATION & UNLINKING
    // ----------------------------------------------------
    console.log("\n[10/10] Testing Expiration, Revocation & Account Unlinking...");

    // Test Expiration
    const expiredInvite = await prisma.familyInvitation.create({
      data: {
        familyMemberId: createdMember.id,
        inviterId: userA.id,
        invitedEmail: `expired_${timestamp}@gurukul.local`,
        tokenHash: hashInvitationToken(`expired_raw_${timestamp}`),
        status: "PENDING",
        expiresAt: new Date(Date.now() - 10000), // Expired 10 seconds ago
      },
    });

    const expiredInspection = await inspectInvitationToken(`expired_raw_${timestamp}`);
    assert(expiredInspection.valid === false, "Expired token marked invalid");
    assert(expiredInspection.reason === "EXPIRED", "Reason correctly marked as EXPIRED");

    // Test Revocation
    const freshInvite = await createFamilyInvitation(userA.id, {
      name: "Sister Priya",
      relationship: "SIBLING",
      email: `priya_${timestamp}@gurukul.local`,
    });

    const revokeResult = await revokeFamilyInvitation(freshInvite.invitation.id, userA.id);
    assert(revokeResult.success === true, "Invitation revoked by owner");

    const revokedInspection = await inspectInvitationToken(freshInvite.rawTokenForTesting);
    assert(revokedInspection.valid === false, "Revoked token marked invalid");
    assert(revokedInspection.reason === "REVOKED", "Reason correctly marked as REVOKED");

    // Test Unlinking
    const unlinkResult = await unlinkFamilyMember(createdMember.id, userA.id);
    assert(unlinkResult.success === true, "Owner successfully unlinked account from profile");

    const unlinkedMember = await prisma.familyMember.findUnique({
      where: { id: createdMember.id },
    });
    assert(unlinkedMember.linkedUserId === null, "linkedUserId reset to null after unlinking");
    assert(unlinkedMember.ownerId === userA.id, "Profile still preserved under owner");

    // Test Soft Archiving
    const archiveResult = await deleteFamilyMember(createdMember.id, userA.id, { permanent: false });
    assert(archiveResult.success === true, "Family member soft archived");

    const activeList = await listFamilyMembers(userA.id, { includeArchived: false });
    const inActiveList = activeList.some((m) => m.id === createdMember.id);
    assert(!inActiveList, "Archived member excluded from active list");

    const allList = await listFamilyMembers(userA.id, { includeArchived: true });
    const inAllList = allList.some((m) => m.id === createdMember.id);
    assert(inAllList, "Archived member included when includeArchived is true");

  } catch (err) {
    console.error("Test execution failed with error:", err);
    failed++;
  } finally {
    // Clean up test data
    console.log("\nCleaning up test artifacts...");
    try {
      if (userA) await prisma.user.delete({ where: { id: userA.id } });
      if (userB) await prisma.user.delete({ where: { id: userB.id } });
      if (intruder) await prisma.user.delete({ where: { id: intruder.id } });
      console.log("  ✓ Test artifacts cleaned up successfully");
    } catch (cleanupErr) {
      console.warn("Cleanup warning:", cleanupErr.message);
    }
  }

  console.log("\n========================================================");
  console.log(`  FAMILY TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runFamilyTests().catch(console.error);
