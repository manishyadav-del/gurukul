"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  ArrowRight,
  Sparkles,
  LogIn,
  UserCheck,
  Lock,
} from "lucide-react";

export default function AcceptInviteClient({
  token,
  inspection,
  currentUser,
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(inspection?.valid ? null : inspection?.error || "Invalid invitation");
  const [success, setSuccess] = useState(false);

  // Quick Sign In / Register State for unauthenticated users
  const [authMode, setAuthMode] = useState("login"); // 'login' or 'register'
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState(inspection?.invitation?.familyMember?.name || "");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const invitation = inspection?.invitation;
  const isExpired = inspection?.reason === "EXPIRED";
  const isRevoked = inspection?.reason === "REVOKED";
  const isAlreadyAccepted = inspection?.reason === "ALREADY_ACCEPTED";

  // Check email match if authenticated
  const isEmailMismatch =
    currentUser &&
    invitation &&
    currentUser.email?.toLowerCase().trim() !== invitation.invitedEmail?.toLowerCase().trim();

  // Handle Accept Invitation
  async function handleAccept() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/family/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to accept invitation");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/family");
      }, 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle Quick Auth (Sign in or Register)
  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const email = invitation.invitedEmail;

      if (authMode === "register") {
        // Register account first
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: authName.trim() || invitation.familyMember?.name || "Family Member",
            email,
            password: authPassword,
          }),
        });

        const regData = await regRes.json();
        if (!regRes.ok) {
          throw new Error(regData.error || "Failed to register account");
        }
      }

      // NextAuth sign in
      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password: authPassword,
      });

      if (signInRes?.error) {
        throw new Error(signInRes.error || "Invalid password");
      }

      // Reload page to refresh session state
      router.refresh();
      window.location.reload();
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex w-14 h-14 rounded-full bg-[#13382c] text-[#d4a359] items-center justify-center text-2xl font-bold shadow-md mb-3">
            ॐ
          </div>
          <h1 className="text-2xl font-bold font-serif text-[#13382c]">Gurukul Family Circle</h1>
          <p className="text-xs text-stone-600 mt-1 uppercase tracking-wider font-semibold">
            Digital Astrology & Vedic Knowledge Network
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white py-8 px-6 shadow-xl border border-stone-200/90 rounded-3xl sm:px-10 space-y-6">
          {/* SUCCESS STATE */}
          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-bold font-serif text-stone-900">
                Welcome to the Family Circle!
              </h2>
              <p className="text-sm text-stone-600 max-w-sm mx-auto">
                You have successfully accepted the invitation from{" "}
                <strong>{invitation?.inviter?.name || "your family member"}</strong>.
                Your profile is now securely connected.
              </p>
              <div className="pt-4">
                <Link
                  href="/dashboard/family"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#13382c] text-white font-semibold text-sm shadow-md hover:bg-[#194939] transition"
                >
                  <span>Go to Family Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-[#d4a359]" />
                </Link>
              </div>
            </div>
          ) : !inspection?.valid ? (
            /* INVALID / EXPIRED / REVOKED / ALREADY ACCEPTED STATE */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
                {isExpired ? (
                  <Clock className="w-8 h-8" />
                ) : isAlreadyAccepted ? (
                  <UserCheck className="w-8 h-8 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-8 h-8" />
                )}
              </div>

              <h2 className="text-xl font-bold font-serif text-stone-900">
                {isExpired
                  ? "Invitation Has Expired"
                  : isAlreadyAccepted
                  ? "Invitation Already Accepted"
                  : isRevoked
                  ? "Invitation Revoked"
                  : "Invalid Invitation Link"}
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
                {error ||
                  "This invitation link is no longer valid. Please ask the sender to generate and send a new invitation from their Gurukul dashboard."}
              </p>

              <div className="pt-4 flex justify-center gap-3">
                <Link
                  href="/"
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
                >
                  Return to Home
                </Link>
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 rounded-xl bg-[#13382c] text-white text-xs font-semibold hover:bg-[#194939] transition"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : isEmailMismatch ? (
            /* EMAIL MISMATCH STATE */
            <div className="space-y-4 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7 text-amber-700" />
              </div>
              <h2 className="text-lg font-bold font-serif text-stone-900">Email Address Mismatch</h2>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-stone-700 text-left space-y-2">
                <p>
                  You are currently logged in as: <strong>{currentUser.email}</strong>
                </p>
                <p>
                  However, this invitation was sent to: <strong>{invitation.invitedEmail}</strong>
                </p>
                <p className="text-stone-500 text-[11px] pt-1">
                  For privacy and family security, invitations may only be accepted by the intended recipient email.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => router.push("/api/auth/signout")}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition"
                >
                  Sign Out & Switch Account
                </button>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          ) : !currentUser ? (
            /* UNAUTHENTICATED STATE — SIGN IN OR REGISTER */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Invitation Ready</span>
                </div>
                <h2 className="text-xl font-bold font-serif text-stone-900">
                  {invitation?.inviter?.name || "A family member"} invited you!
                </h2>
                <p className="text-xs text-stone-600">
                  Please sign in or create an account for <strong>{invitation?.invitedEmail}</strong> to accept and link to your family circle.
                </p>
              </div>

              {/* Personal Message Quote */}
              {invitation?.personalMessage && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-950 italic">
                  "{invitation.personalMessage}"
                </div>
              )}

              {/* Auth Form */}
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/90 space-y-4">
                <div className="flex border-b border-stone-200 pb-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className={`flex-1 pb-1 text-center transition ${
                      authMode === "login"
                        ? "text-[#13382c] border-b-2 border-[#13382c] font-bold"
                        : "text-stone-400 hover:text-stone-600"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode("register")}
                    className={`flex-1 pb-1 text-center transition ${
                      authMode === "register"
                        ? "text-[#13382c] border-b-2 border-[#13382c] font-bold"
                        : "text-stone-400 hover:text-stone-600"
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-stone-600 font-medium mb-1">Email</label>
                    <input
                      type="email"
                      disabled
                      value={invitation.invitedEmail}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-200/60 text-stone-600 cursor-not-allowed"
                    />
                  </div>

                  {authMode === "register" && (
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        placeholder="e.g. Radhika Sharma"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#d4a359] outline-none bg-white"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">
                      {authMode === "register" ? "Choose Password" : "Password"}
                    </label>
                    <input
                      type="password"
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#d4a359] outline-none bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 rounded-xl bg-[#13382c] hover:bg-[#194939] text-white font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <LogIn className="w-4 h-4 text-[#d4a359]" />
                    <span>{authLoading ? "Processing..." : authMode === "register" ? "Register & Continue" : "Sign In & Continue"}</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* READY TO ACCEPT STATE (AUTHENTICATED & MATCHING EMAIL) */
            <div className="space-y-6">
              {/* Inviter Presentation */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
                <div className="w-14 h-14 rounded-full bg-[#13382c] text-[#f3caa1] font-bold text-xl flex items-center justify-center shadow-xs">
                  {invitation.inviter?.name?.charAt(0) || "G"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">
                    {invitation.inviter?.name || "A family member"}
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Inviting you as: <span className="font-semibold text-amber-900">{invitation.relationship}</span>
                  </p>
                </div>
              </div>

              {invitation.personalMessage && (
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 italic">
                  "{invitation.personalMessage}"
                </div>
              )}

              {/* Permissions & Security Box */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <Shield className="w-4 h-4 text-emerald-700" />
                  <span>What happens when you accept:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-[11px] text-emerald-800">
                  <li>Your Gurukul account links to your family profile for astrology Kundlis.</li>
                  <li>Your private reading notes, bookmarks, and quiz attempts remain private.</li>
                  <li>You can unlink your account at any time from your dashboard settings.</li>
                </ul>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {error}
                </div>
              )}

              {/* Accept Button */}
              <div className="pt-2">
                <button
                  onClick={handleAccept}
                  disabled={loading}
                  className="w-full py-3.5 rounded-full bg-[#13382c] hover:bg-[#194939] text-white font-bold text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer border border-[#d4a359]"
                >
                  <Sparkles className="w-4 h-4 text-[#d4a359]" />
                  <span>{loading ? "Accepting & Linking..." : "Accept Invitation & Connect"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
