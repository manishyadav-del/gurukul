import crypto from "crypto";

/**
 * In-memory buffer for testing and development auditing.
 * Enables zero-dependency unit and integration tests without network I/O.
 */
let sentEmailBuffer = [];

/**
 * Returns all recorded sent emails (useful for test assertions).
 */
export function getSentEmailHistory() {
  return [...sentEmailBuffer];
}

/**
 * Clears recorded sent emails.
 */
export function clearSentEmailHistory() {
  sentEmailBuffer = [];
}

/**
 * Generates a cryptographically secure 256-bit token and its SHA-256 hash.
 * Only the hash is persisted to the database. The raw token is sent only in the email.
 * 
 * @returns {{ rawToken: string, tokenHash: string }}
 */
export function generateInvitationToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashInvitationToken(rawToken);
  return { rawToken, tokenHash };
}

/**
 * Computes the SHA-256 hash of a raw invitation token.
 * 
 * @param {string} rawToken
 * @returns {string} Hex-encoded SHA-256 hash
 */
export function hashInvitationToken(rawToken) {
  if (!rawToken || typeof rawToken !== "string") {
    throw new Error("Invalid token provided for hashing");
  }
  return crypto.createHash("sha256").update(rawToken.trim()).digest("hex");
}

/**
 * Checks whether an invitation record has expired.
 * 
 * @param {{ expiresAt: Date|string }} invitation
 * @returns {boolean}
 */
export function isInvitationExpired(invitation) {
  if (!invitation?.expiresAt) return true;
  return new Date(invitation.expiresAt).getTime() <= Date.now();
}

/**
 * Resolves the application base URL from environment variables.
 */
export function getAppBaseUrl() {
  return (
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

/**
 * Renders an accessible, brand-aligned Gurukul HTML email for family invitations.
 */
function renderFamilyInvitationHtml({
  inviterName,
  recipientName,
  relationship,
  personalMessage,
  inviteUrl,
  expiresAtFormatted,
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Gurukul Family Invitation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f6f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #2c2925;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f6f0; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(19, 56, 44, 0.08); border: 1px solid #e7dfcf;">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #13382c; padding: 32px 28px; text-align: center;">
              <div style="display: inline-block; width: 44px; height: 44px; line-height: 44px; border-radius: 50%; background-color: #d4a359; color: #13382c; font-weight: bold; font-size: 22px; margin-bottom: 12px;">
                ॐ
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                Gurukul Digital Library & Astrology
              </h1>
              <p style="margin: 6px 0 0 0; color: #f3caa1; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
                Family Circle Invitation
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.5; color: #2c2925;">
                Namaste <strong>${recipientName || "there"}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #4a453e;">
                <strong>${inviterName || "A family member"}</strong> has invited you to join their Gurukul family circle as their <strong>${relationship || "family member"}</strong>.
              </p>

              ${
                personalMessage
                  ? `<div style="margin: 0 0 24px 0; padding: 16px 20px; background-color: #fdfaf3; border-left: 4px solid #d4a359; border-radius: 0 8px 8px 0; font-style: italic; color: #5a5245; font-size: 14px; line-height: 1.5;">
                      "${personalMessage}"
                    </div>`
                  : ""
              }

              <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #6b6357;">
                By accepting this invitation, your individual Gurukul profile will be linked to your family tree, allowing you to seamlessly view family astrology Kundlis, Vedic charts, and learning milestones.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${inviteUrl}" target="_blank" style="display: inline-block; background-color: #13382c; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 9999px; font-weight: 600; font-size: 15px; letter-spacing: 0.3px; border: 2px solid #d4a359; box-shadow: 0 4px 12px rgba(19, 56, 44, 0.2);">
                  Accept Invitation
                </a>
              </div>

              <!-- Security & Expiration Footnote -->
              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #efe8da; font-size: 12px; line-height: 1.5; color: #8a8275;">
                <p style="margin: 0 0 8px 0;">
                  ⏱️ <strong>Expiration:</strong> This secure single-use invitation will expire on <strong>${expiresAtFormatted}</strong> (7 days).
                </p>
                <p style="margin: 0;">
                  🔒 <strong>Privacy Notice:</strong> Gurukul never shares your private passwords, personal notes, or reading history. If you did not expect this invitation, you may safely ignore this email.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #faf7f2; padding: 20px 32px; text-align: center; border-top: 1px solid #e7dfcf; font-size: 12px; color: #9c9486;">
              <p style="margin: 0 0 4px 0;">
                © ${new Date().getFullYear()} Gurukul Digital Library. All rights reserved.
              </p>
              <p style="margin: 0;">
                Bridging Ancient Vedic Wisdom & Modern Digital Architecture.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Sends a family invitation email via Resend (if configured) or Console/Memory logger.
 * 
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.inviterName - Name of the user sending the invite
 * @param {string} params.recipientName - Name of the invited family member
 * @param {string} params.relationship - Relationship string (e.g. Sibling, Parent)
 * @param {string} [params.personalMessage] - Optional custom message
 * @param {string} params.rawToken - Raw single-use token to embed in URL
 * @param {Date} params.expiresAt - Expiration Date
 * @returns {Promise<{ success: boolean, provider: string, messageId?: string, error?: string }>}
 */
export async function sendFamilyInvitationEmail({
  to,
  inviterName,
  recipientName,
  relationship,
  personalMessage,
  rawToken,
  expiresAt,
}) {
  const baseUrl = getAppBaseUrl();
  const inviteUrl = `${baseUrl}/invite/accept/${rawToken}`;
  const expiresAtFormatted = new Date(expiresAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const subject = `${inviterName || "A family member"} invited you to join Gurukul Family Circle`;
  const html = renderFamilyInvitationHtml({
    inviterName,
    recipientName,
    relationship,
    personalMessage,
    inviteUrl,
    expiresAtFormatted,
  });

  const emailRecord = {
    to,
    subject,
    inviterName,
    recipientName,
    relationship,
    inviteUrl,
    expiresAt,
    sentAt: new Date(),
  };

  // 1. If Resend API Key is provided, dispatch via Resend REST API
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "Gurukul <invitations@gurukul.ai>",
          to: [to],
          subject,
          html,
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || `Resend API returned status ${response.status}`);
      }

      emailRecord.provider = "resend";
      emailRecord.messageId = resData.id;
      sentEmailBuffer.push(emailRecord);

      return {
        success: true,
        provider: "resend",
        messageId: resData.id,
      };
    } catch (err) {
      console.error("[EmailService] Failed to send via Resend API:", err.message);
      // Fall through to record in buffer for audit/test recovery
      emailRecord.provider = "resend_failed";
      emailRecord.error = err.message;
      sentEmailBuffer.push(emailRecord);
      return {
        success: false,
        provider: "resend",
        error: err.message,
      };
    }
  }

  // 2. Development, Test, and Local Fallback Provider
  emailRecord.provider = "local_logger";
  emailRecord.messageId = `local-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  sentEmailBuffer.push(emailRecord);

  if (process.env.NODE_ENV !== "test") {
    console.log("\n=======================================================");
    console.log("  [Gurukul Email Service] Simulated Family Invitation");
    console.log("-------------------------------------------------------");
    console.log(`To:          ${to}`);
    console.log(`Subject:     ${subject}`);
    console.log(`Inviter:     ${inviterName} (${relationship})`);
    console.log(`Accept URL:  ${inviteUrl}`);
    console.log(`Expires:     ${expiresAtFormatted}`);
    console.log("=======================================================\n");
  }

  return {
    success: true,
    provider: "local_logger",
    messageId: emailRecord.messageId,
    inviteUrl,
  };
}

/**
 * Sends a notification email to the inviter when their invitation is accepted.
 */
export async function sendInvitationAcceptedNotification({
  to,
  inviterName,
  memberName,
  memberEmail,
}) {
  const subject = `${memberName} accepted your Gurukul Family Circle invitation!`;
  const html = `<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #f8f6f0; padding: 24px;">
  <div style="max-width: 500px; background: #fff; padding: 24px; border-radius: 12px; margin: 0 auto; border: 1px solid #e7dfcf;">
    <h2 style="color: #13382c; margin-top: 0;">Family Circle Connected! 🌟</h2>
    <p>Namaste ${inviterName},</p>
    <p><strong>${memberName}</strong> (${memberEmail}) has accepted your invitation and linked their account to your family circle.</p>
    <p>You can now view their linked status and shared astrology charts in your Gurukul Family Dashboard.</p>
    <p style="margin-top: 24px;">
      <a href="${getAppBaseUrl()}/dashboard/family" style="background: #13382c; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 20px; font-weight: bold;">
        View Family Dashboard
      </a>
    </p>
  </div>
</body>
</html>`;

  const record = {
    to,
    subject,
    type: "ACCEPTED_NOTIFICATION",
    memberName,
    memberEmail,
    sentAt: new Date(),
  };

  sentEmailBuffer.push(record);

  if (process.env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "Gurukul <invitations@gurukul.ai>",
          to: [to],
          subject,
          html,
        }),
      });
    } catch (e) {
      console.error("[EmailService] Failed to send acceptance notification via Resend:", e.message);
    }
  }

  return { success: true };
}
