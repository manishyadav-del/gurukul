import prisma from "../../lib/prisma.js";
import {
  generateInvitationToken,
  hashInvitationToken,
  isInvitationExpired,
  sendFamilyInvitationEmail,
  sendInvitationAcceptedNotification,
} from "../email/emailService.js";
import { calculateBirthChart } from "../astrology/engine.js";

// Standard supported relationships
export const RELATIONSHIPS = [
  "SPOUSE",
  "CHILD",
  "PARENT",
  "SIBLING",
  "GRANDPARENT",
  "GRANDCHILD",
  "UNCLE_AUNT",
  "COUSIN",
  "FRIEND",
  "OTHER",
];

/**
 * Validates email format.
 */
export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Retrieves all family members accessible by the given user.
 * (Members owned by the user, or members where the user is linked).
 */
export async function listFamilyMembers(userId, { includeArchived = false } = {}) {
  if (!userId) return [];

  const where = {
    OR: [
      { ownerId: userId },
      { linkedUserId: userId },
    ],
  };

  if (!includeArchived) {
    where.isArchived = false;
  }

  const members = await prisma.familyMember.findMany({
    where,
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
      linkedUser: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      birthProfile: {
        include: {
          birthChart: {
            select: {
              id: true,
              lagnaSign: true,
              moonSign: true,
              moonNakshatra: true,
              currentDasha: true,
            },
          },
        },
      },
      invitations: {
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          invitedEmail: true,
          status: true,
          expiresAt: true,
          createdAt: true,
          acceptedAt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return members.map((m) => {
    // Check if latest invitation is expired
    const latestInvite = m.invitations[0] || null;
    let inviteStatus = null;
    if (latestInvite) {
      if (latestInvite.status === "PENDING" && isInvitationExpired(latestInvite)) {
        inviteStatus = "EXPIRED";
      } else {
        inviteStatus = latestInvite.status;
      }
    }

    return {
      ...m,
      isOwner: m.ownerId === userId,
      isLinkedUser: m.linkedUserId === userId,
      latestInvite: latestInvite ? { ...latestInvite, computedStatus: inviteStatus } : null,
    };
  });
}

/**
 * Retrieves a single family member with strict ownership/linking authorization checks.
 */
export async function getFamilyMember(memberId, userId) {
  if (!memberId || !userId) return null;

  const member = await prisma.familyMember.findUnique({
    where: { id: memberId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      linkedUser: { select: { id: true, name: true, email: true, avatarUrl: true } },
      birthProfile: {
        include: {
          birthChart: {
            include: { planets: true },
          },
        },
      },
      invitations: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          invitedEmail: true,
          status: true,
          expiresAt: true,
          createdAt: true,
          acceptedAt: true,
          revokedAt: true,
        },
      },
    },
  });

  if (!member) return null;

  // Strict ownership check: Must be owner or linked user
  if (member.ownerId !== userId && member.linkedUserId !== userId) {
    const error = new Error("Forbidden: You do not have permission to view this family profile");
    error.statusCode = 403;
    throw error;
  }

  return {
    ...member,
    isOwner: member.ownerId === userId,
    isLinkedUser: member.linkedUserId === userId,
  };
}

/**
 * Creates a new family member record under the authenticated owner.
 * If valid birth date and time are provided, automatically calculates Kundli / BirthChart.
 */
export async function createFamilyMember(userId, data) {
  if (!userId) {
    const error = new Error("Authentication required to add family member");
    error.statusCode = 401;
    throw error;
  }

  if (!data?.name || !data.name.trim()) {
    const error = new Error("Family member name is required");
    error.statusCode = 400;
    throw error;
  }

  const relationship = (data.relationship || "OTHER").toUpperCase().trim();
  const name = data.name.trim();
  const gender = data.gender ? data.gender.trim() : null;
  const birthPlace = data.birthPlace ? data.birthPlace.trim() : null;
  const birthTime = data.birthTime ? data.birthTime.trim() : null;
  const timezone = data.timezone ? data.timezone.trim() : "Asia/Kolkata";
  const notes = data.notes ? data.notes.trim() : null;

  let dateOfBirth = null;
  if (data.dateOfBirth) {
    const parsedDate = new Date(data.dateOfBirth);
    if (!isNaN(parsedDate.getTime())) {
      dateOfBirth = parsedDate;
    }
  }

  let birthProfileId = null;

  // If birth details are provided, compute BirthChart and persist BirthProfile
  if (dateOfBirth && birthTime && birthPlace) {
    try {
      const lat = typeof data.latitude === "number" ? data.latitude : 28.6139; // Default New Delhi
      const lon = typeof data.longitude === "number" ? data.longitude : 77.2090;
      const birthDateStr = dateOfBirth.toISOString().split("T")[0];
      const chart = calculateBirthChart({
        name,
        birthDate: birthDateStr,
        birthTime: birthTime || "12:00",
        latitude: lat,
        longitude: lon,
        timezone: "+05:30",
        birthPlace,
        gender: gender || "female",
        language: "en",
      });

      // Create linked BirthProfile and BirthChart
      const profileRecord = await prisma.birthProfile.create({
        data: {
          userId,
          name,
          birthDate: new Date(chart.profile.utcDate),
          birthTime,
          birthPlace,
          latitude: lat,
          longitude: lon,
          timezone,
          gender,
          language: "en",
          birthChart: {
            create: {
              ascendant: chart.ascendant.siderealTotalDegree,
              lagnaSign: chart.ascendant.sign,
              lagnaDegree: chart.ascendant.degree,
              ayanamsa: chart.calculation.ayanamsa,
              ayanamsaValue: chart.calculation.ayanamsaValue,
              moonSign: chart.moon.sign,
              moonNakshatra: chart.moon.nakshatra,
              moonPada: chart.moon.pada,
              currentDasha: chart.dasha.currentMahadasha,
              dashaBalance: chart.dasha.balanceText,
              calculationEngine: chart.calculation.calculationEngine,
              engineVersion: chart.calculation.engineVersion,
              chartData: chart,
              planets: {
                create: chart.planets.map((p) => ({
                  planet: p.planet,
                  sign: p.sign,
                  house: p.house,
                  degree: p.degree,
                  speed: p.speed,
                  nakshatra: p.nakshatra,
                  pada: p.pada,
                  retrograde: p.retrograde,
                  signLord: p.signLord,
                  nakshatraLord: p.nakshatraLord,
                })),
              },
            },
          },
        },
      });

      birthProfileId = profileRecord.id;
    } catch (chartErr) {
      console.warn("[createFamilyMember] Astrology calculation skipped or non-fatal:", chartErr.message);
    }
  }

  // Create FamilyMember
  const member = await prisma.familyMember.create({
    data: {
      ownerId: userId,
      name,
      relationship,
      gender,
      dateOfBirth,
      birthTime,
      birthPlace,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      timezone,
      notes,
      birthProfileId,
    },
    include: {
      birthProfile: {
        include: {
          birthChart: true,
        },
      },
    },
  });

  return member;
}

/**
 * Updates an existing family member profile.
 * Only the owner is permitted to edit.
 */
export async function updateFamilyMember(memberId, userId, data) {
  const existing = await prisma.familyMember.findUnique({
    where: { id: memberId },
  });

  if (!existing) {
    const error = new Error("Family member not found");
    error.statusCode = 404;
    throw error;
  }

  if (existing.ownerId !== userId) {
    const error = new Error("Forbidden: Only the profile owner can edit details");
    error.statusCode = 403;
    throw error;
  }

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name.trim();
  if (data.relationship !== undefined) updateData.relationship = data.relationship.toUpperCase().trim();
  if (data.gender !== undefined) updateData.gender = data.gender ? data.gender.trim() : null;
  if (data.birthPlace !== undefined) updateData.birthPlace = data.birthPlace ? data.birthPlace.trim() : null;
  if (data.birthTime !== undefined) updateData.birthTime = data.birthTime ? data.birthTime.trim() : null;
  if (data.timezone !== undefined) updateData.timezone = data.timezone ? data.timezone.trim() : "Asia/Kolkata";
  if (data.notes !== undefined) updateData.notes = data.notes ? data.notes.trim() : null;

  if (data.dateOfBirth !== undefined) {
    if (!data.dateOfBirth) {
      updateData.dateOfBirth = null;
    } else {
      const parsedDate = new Date(data.dateOfBirth);
      if (!isNaN(parsedDate.getTime())) {
        updateData.dateOfBirth = parsedDate;
      }
    }
  }

  const updated = await prisma.familyMember.update({
    where: { id: memberId },
    data: updateData,
    include: {
      birthProfile: {
        include: { birthChart: true },
      },
      linkedUser: { select: { id: true, name: true, email: true } },
    },
  });

  return updated;
}

/**
 * Removes or archives a family member profile.
 * Only the owner is authorized.
 */
export async function deleteFamilyMember(memberId, userId, { permanent = false } = {}) {
  const existing = await prisma.familyMember.findUnique({
    where: { id: memberId },
  });

  if (!existing) {
    const error = new Error("Family member not found");
    error.statusCode = 404;
    throw error;
  }

  if (existing.ownerId !== userId) {
    const error = new Error("Forbidden: Only the profile owner can delete or archive this profile");
    error.statusCode = 403;
    throw error;
  }

  if (permanent) {
    await prisma.familyMember.delete({
      where: { id: memberId },
    });
    return { success: true, message: "Family member permanently deleted" };
  }

  // Soft archive
  const archived = await prisma.familyMember.update({
    where: { id: memberId },
    data: {
      isArchived: true,
      archivedAt: new Date(),
    },
  });

  return { success: true, message: "Family member archived", member: archived };
}

/**
 * Creates and dispatches a family email invitation.
 */
export async function createFamilyInvitation(userId, {
  familyMemberId,
  email,
  name,
  relationship,
  personalMessage,
}) {
  if (!userId) {
    const error = new Error("Authentication required to send invitations");
    error.statusCode = 401;
    throw error;
  }

  if (!email || !isValidEmail(email)) {
    const error = new Error("A valid email address is required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Find inviter user details
  const inviter = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  });

  if (!inviter) {
    const error = new Error("Inviter account not found");
    error.statusCode = 404;
    throw error;
  }

  // Prevent inviting self
  if (inviter.email.toLowerCase() === normalizedEmail) {
    const error = new Error("You cannot send a family invitation to your own email address");
    error.statusCode = 400;
    throw error;
  }

  // Resolve or create the FamilyMember record
  let targetMemberId = familyMemberId;
  let targetMemberName = name ? name.trim() : "";
  let targetRelationship = relationship ? relationship.toUpperCase().trim() : "OTHER";

  if (targetMemberId) {
    const existingMember = await prisma.familyMember.findUnique({
      where: { id: targetMemberId },
    });

    if (!existingMember) {
      const error = new Error("Specified family member profile not found");
      error.statusCode = 404;
      throw error;
    }

    if (existingMember.ownerId !== userId) {
      const error = new Error("Forbidden: You do not own this family profile");
      error.statusCode = 403;
      throw error;
    }

    if (existingMember.linkedUserId) {
      const error = new Error("This family profile is already linked to an active Gurukul account");
      error.statusCode = 409;
      throw error;
    }

    targetMemberName = existingMember.name;
    targetRelationship = existingMember.relationship;
  } else {
    // If no memberId provided, create a pending family member profile
    if (!targetMemberName) {
      const error = new Error("Name is required when creating a new family invitation");
      error.statusCode = 400;
      throw error;
    }

    const createdMember = await prisma.familyMember.create({
      data: {
        ownerId: userId,
        name: targetMemberName,
        relationship: targetRelationship,
      },
    });

    targetMemberId = createdMember.id;
  }

  // Check for existing pending invitation for this email & family member
  const existingPending = await prisma.familyInvitation.findFirst({
    where: {
      familyMemberId: targetMemberId,
      invitedEmail: normalizedEmail,
      status: "PENDING",
      expiresAt: { gt: new Date() },
    },
  });

  if (existingPending) {
    const error = new Error("An active invitation is already pending for this email address");
    error.statusCode = 409;
    error.invitationId = existingPending.id;
    throw error;
  }

  // Check if invited email already has an existing Gurukul account (informational)
  const existingAccount = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, name: true },
  });

  // Generate secure single-use token and 7-day expiration
  const { rawToken, tokenHash } = generateInvitationToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Expire any older pending invitations for the same email/member
  await prisma.familyInvitation.updateMany({
    where: {
      familyMemberId: targetMemberId,
      invitedEmail: normalizedEmail,
      status: "PENDING",
    },
    data: { status: "REVOKED", revokedAt: new Date() },
  });

  // Persist invitation with tokenHash only (never rawToken)
  const invitation = await prisma.familyInvitation.create({
    data: {
      familyMemberId: targetMemberId,
      inviterId: userId,
      invitedEmail: normalizedEmail,
      tokenHash,
      status: "PENDING",
      relationship: targetRelationship,
      personalMessage: personalMessage ? personalMessage.trim() : null,
      expiresAt,
    },
  });

  // Dispatch email with rawToken
  const emailResult = await sendFamilyInvitationEmail({
    to: normalizedEmail,
    inviterName: inviter.name || "A family member",
    recipientName: targetMemberName,
    relationship: targetRelationship,
    personalMessage: personalMessage ? personalMessage.trim() : null,
    rawToken,
    expiresAt,
  });

  return {
    invitation: {
      id: invitation.id,
      invitedEmail: invitation.invitedEmail,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      createdAt: invitation.createdAt,
      existingAccountDetected: Boolean(existingAccount),
    },
    emailDelivery: emailResult,
    rawTokenForTesting: process.env.NODE_ENV === "test" ? rawToken : undefined,
  };
}

/**
 * Resends a pending invitation with a fresh single-use token and renewed 7-day expiration.
 */
export async function resendFamilyInvitation(invitationId, userId) {
  const invitation = await prisma.familyInvitation.findUnique({
    where: { id: invitationId },
    include: {
      inviter: { select: { id: true, name: true, email: true } },
      familyMember: { select: { id: true, name: true, relationship: true } },
    },
  });

  if (!invitation) {
    const error = new Error("Invitation not found");
    error.statusCode = 404;
    throw error;
  }

  if (invitation.inviterId !== userId) {
    const error = new Error("Forbidden: Only the inviter can resend this invitation");
    error.statusCode = 403;
    throw error;
  }

  if (invitation.status === "ACCEPTED") {
    const error = new Error("This invitation has already been accepted and cannot be resent");
    error.statusCode = 400;
    throw error;
  }

  // Generate fresh token
  const { rawToken, tokenHash } = generateInvitationToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const updated = await prisma.familyInvitation.update({
    where: { id: invitationId },
    data: {
      tokenHash,
      expiresAt,
      status: "PENDING",
      revokedAt: null,
    },
  });

  const emailResult = await sendFamilyInvitationEmail({
    to: invitation.invitedEmail,
    inviterName: invitation.inviter.name || "A family member",
    recipientName: invitation.familyMember.name,
    relationship: invitation.familyMember.relationship,
    personalMessage: invitation.personalMessage,
    rawToken,
    expiresAt,
  });

  return {
    success: true,
    invitation: updated,
    emailDelivery: emailResult,
    rawTokenForTesting: process.env.NODE_ENV === "test" ? rawToken : undefined,
  };
}

/**
 * Revokes a pending invitation.
 */
export async function revokeFamilyInvitation(invitationId, userId) {
  const invitation = await prisma.familyInvitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    const error = new Error("Invitation not found");
    error.statusCode = 404;
    throw error;
  }

  if (invitation.inviterId !== userId) {
    const error = new Error("Forbidden: Only the inviter can revoke this invitation");
    error.statusCode = 403;
    throw error;
  }

  if (invitation.status === "ACCEPTED") {
    const error = new Error("Cannot revoke an invitation that has already been accepted");
    error.statusCode = 400;
    throw error;
  }

  const updated = await prisma.familyInvitation.update({
    where: { id: invitationId },
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
    },
  });

  return { success: true, message: "Invitation revoked", invitation: updated };
}

/**
 * Validates an invitation token for the acceptance page without accepting yet.
 */
export async function inspectInvitationToken(rawToken) {
  if (!rawToken || typeof rawToken !== "string") {
    return { valid: false, reason: "INVALID_TOKEN", error: "No invitation token provided" };
  }

  const tokenHash = hashInvitationToken(rawToken);
  const invitation = await prisma.familyInvitation.findUnique({
    where: { tokenHash },
    include: {
      inviter: { select: { id: true, name: true, email: true, avatarUrl: true } },
      familyMember: { select: { id: true, name: true, relationship: true } },
    },
  });

  if (!invitation) {
    return { valid: false, reason: "NOT_FOUND", error: "Invitation not found or link is invalid" };
  }

  if (invitation.status === "ACCEPTED") {
    return {
      valid: false,
      reason: "ALREADY_ACCEPTED",
      error: "This invitation has already been accepted and linked",
      acceptedAt: invitation.acceptedAt,
    };
  }

  if (invitation.status === "REVOKED") {
    return { valid: false, reason: "REVOKED", error: "This invitation was revoked by the sender" };
  }

  if (isInvitationExpired(invitation)) {
    return { valid: false, reason: "EXPIRED", error: "This invitation has expired" };
  }

  return {
    valid: true,
    invitation: {
      id: invitation.id,
      invitedEmail: invitation.invitedEmail,
      relationship: invitation.relationship || invitation.familyMember?.relationship,
      personalMessage: invitation.personalMessage,
      expiresAt: invitation.expiresAt,
      inviter: invitation.inviter,
      familyMember: invitation.familyMember,
    },
  };
}

/**
 * Atomically accepts an invitation and links the family member to the authenticated user.
 */
export async function acceptFamilyInvitation(rawToken, currentUser) {
  if (!currentUser?.id || !currentUser.email) {
    const error = new Error("Authentication required to accept an invitation");
    error.statusCode = 401;
    throw error;
  }

  if (!rawToken || typeof rawToken !== "string") {
    const error = new Error("Invalid or missing invitation token");
    error.statusCode = 400;
    throw error;
  }

  const tokenHash = hashInvitationToken(rawToken);

  // Run atomic verification and update inside a transaction to prevent race conditions & token reuse
  const result = await prisma.$transaction(async (tx) => {
    // 1. Fetch invitation with lock
    const invitation = await tx.familyInvitation.findUnique({
      where: { tokenHash },
      include: {
        inviter: { select: { id: true, name: true, email: true } },
        familyMember: true,
      },
    });

    if (!invitation) {
      const error = new Error("Invitation not found or link is invalid");
      error.statusCode = 404;
      throw error;
    }

    if (invitation.status === "ACCEPTED") {
      const error = new Error("This invitation has already been accepted");
      error.statusCode = 409;
      throw error;
    }

    if (invitation.status === "REVOKED") {
      const error = new Error("This invitation was revoked by the sender");
      error.statusCode = 410;
      throw error;
    }

    if (isInvitationExpired(invitation)) {
      const error = new Error("This invitation has expired");
      error.statusCode = 410;
      throw error;
    }

    // 2. Strict email match validation
    const authEmail = currentUser.email.toLowerCase().trim();
    const invitedEmail = invitation.invitedEmail.toLowerCase().trim();

    if (authEmail !== invitedEmail) {
      const error = new Error(
        `Email mismatch: You are signed in as ${authEmail}, but this invitation was sent to ${invitedEmail}. Please sign in with the invited email.`
      );
      error.statusCode = 403;
      throw error;
    }

    // 3. Prevent self-linking (inviter cannot accept their own invite)
    if (invitation.inviterId === currentUser.id) {
      const error = new Error("You cannot accept an invitation sent from your own account");
      error.statusCode = 400;
      throw error;
    }

    // 4. Mark invitation as accepted atomically
    const updatedInvite = await tx.familyInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    });

    // 5. Link the family member to currentUser
    const updatedMember = await tx.familyMember.update({
      where: { id: invitation.familyMemberId },
      data: {
        linkedUserId: currentUser.id,
      },
    });

    return {
      invitation: updatedInvite,
      familyMember: updatedMember,
      inviter: invitation.inviter,
    };
  });

  // 6. Notify the inviter (non-blocking)
  sendInvitationAcceptedNotification({
    to: result.inviter.email,
    inviterName: result.inviter.name || "Gurukul Member",
    memberName: currentUser.name || "A family member",
    memberEmail: currentUser.email,
  }).catch((err) => {
    console.warn("[acceptFamilyInvitation] Non-fatal notification error:", err.message);
  });

  return {
    success: true,
    message: "Invitation accepted successfully. Family profile linked to your account.",
    familyMember: result.familyMember,
  };
}

/**
 * Unlinks a linked user account from a family member profile.
 * Can be executed by the profile owner or the linked user.
 */
export async function unlinkFamilyMember(memberId, userId) {
  const member = await prisma.familyMember.findUnique({
    where: { id: memberId },
  });

  if (!member) {
    const error = new Error("Family member not found");
    error.statusCode = 404;
    throw error;
  }

  if (member.ownerId !== userId && member.linkedUserId !== userId) {
    const error = new Error("Forbidden: You do not have permission to unlink this account");
    error.statusCode = 403;
    throw error;
  }

  const updated = await prisma.familyMember.update({
    where: { id: memberId },
    data: {
      linkedUserId: null,
    },
  });

  return { success: true, message: "Account unlinked from family profile", member: updated };
}
