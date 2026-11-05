"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Edit2,
  Trash2,
  Send,
  RefreshCw,
  XCircle,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  Filter,
  Link as LinkIcon,
  Unlink,
  ChevronRight,
  Shield,
  Compass,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const RELATIONSHIP_LABELS = {
  FATHER: "Father (पिता)",
  MOTHER: "Mother (माता)",
  SPOUSE: "Spouse (जीवनसाथी)",
  SON: "Son (पुत्र)",
  DAUGHTER: "Daughter (पुत्री)",
  BROTHER: "Brother (भाई)",
  SISTER: "Sister (बहन)",
  GRANDPARENT: "Grandparent (दादा-दादी / नाना-नानी)",
  PARENT: "Parent (माता-पिता)",
  CHILD: "Child (संतान)",
  SIBLING: "Sibling (भाई-बहन)",
  OTHER: "Other (अन्य)",
};

const RELATIONSHIP_COLORS = {
  FATHER: "bg-amber-50 text-amber-800 border-amber-200",
  MOTHER: "bg-pink-50 text-pink-800 border-pink-200",
  SPOUSE: "bg-rose-50 text-rose-800 border-rose-200",
  SON: "bg-blue-50 text-blue-800 border-blue-200",
  DAUGHTER: "bg-indigo-50 text-indigo-800 border-indigo-200",
  BROTHER: "bg-emerald-50 text-emerald-800 border-emerald-200",
  SISTER: "bg-teal-50 text-teal-800 border-teal-200",
  PARENT: "bg-amber-50 text-amber-800 border-amber-200",
  CHILD: "bg-blue-50 text-blue-800 border-blue-200",
  SIBLING: "bg-emerald-50 text-emerald-800 border-emerald-200",
  GRANDPARENT: "bg-purple-50 text-purple-800 border-purple-200",
  OTHER: "bg-stone-100 text-stone-800 border-stone-200",
};

export default function FamilyManagementClient({ initialUser }) {
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [relationshipFilter, setRelationshipFilter] = useState("ALL");
  const [privacyHidden, setPrivacyHidden] = useState(false);

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteTargetMember, setInviteTargetMember] = useState(null);
  const [kundliModalMember, setKundliModalMember] = useState(null);
  const [kundliData, setKundliData] = useState(null);
  const [kundliLoading, setKundliLoading] = useState(false);
  const [deleteConfirmMember, setDeleteConfirmMember] = useState(null);

  // Form states
  const [memberForm, setMemberForm] = useState({
    name: "",
    relationship: "SPOUSE",
    gender: "",
    dateOfBirth: "",
    birthTime: "",
    birthPlace: "",
    notes: "",
  });

  const [inviteForm, setInviteForm] = useState({
    email: "",
    name: "",
    relationship: "SPOUSE",
    personalMessage: "",
  });

  const [submitting, setSubmitting] = useState(false);

  // Load members and invitations
  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [membersRes, invitesRes] = await Promise.all([
        fetch("/api/family"),
        fetch("/api/family/invitations"),
      ]);

      const membersData = await membersRes.json();
      const invitesData = await invitesRes.json();

      if (membersRes.ok) {
        setMembers(membersData.members || []);
      } else {
        setError(membersData.error || "Failed to load family members");
      }

      if (invitesRes.ok) {
        setInvitations(invitesData.invitations || []);
      }
    } catch (err) {
      setError("Network error while loading family data: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Flash message helper
  function flashSuccess(msg) {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 5000);
  }

  // Handle Add Member
  async function handleAddMemberSubmit(e) {
    e.preventDefault();
    if (!memberForm.name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add family member");

      flashSuccess(`Added ${memberForm.name} to your family circle.`);
      setAddModalOpen(false);
      setMemberForm({
        name: "",
        relationship: "SPOUSE",
        gender: "",
        dateOfBirth: "",
        birthTime: "",
        birthPlace: "",
        notes: "",
      });
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Edit Member
  async function handleEditMemberSubmit(e) {
    e.preventDefault();
    if (!editMember || !memberForm.name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/family/${editMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update family member");

      flashSuccess(`Updated details for ${memberForm.name}.`);
      setEditMember(null);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Delete Member
  async function handleDeleteMember(memberId, permanent = false) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/family/${memberId}?permanent=${permanent}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove member");

      flashSuccess("Family member removed from active circle.");
      setDeleteConfirmMember(null);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Unlink Member
  async function handleUnlink(memberId) {
    if (!confirm("Are you sure you want to unlink this user account from the family profile?")) {
      return;
    }

    try {
      const res = await fetch(`/api/family/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "UNLINK" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to unlink account");

      flashSuccess("Account unlinked from family profile.");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  // Open Edit Modal
  function openEditModal(m) {
    setEditMember(m);
    setMemberForm({
      name: m.name || "",
      relationship: m.relationship || "OTHER",
      gender: m.gender || "",
      dateOfBirth: m.dateOfBirth ? m.dateOfBirth.split("T")[0] : "",
      birthTime: m.birthTime || "",
      birthPlace: m.birthPlace || "",
      notes: m.notes || "",
    });
  }

  // Open Invite Modal
  function openInviteModal(member = null) {
    setInviteTargetMember(member);
    setInviteForm({
      email: "",
      name: member?.name || "",
      relationship: member?.relationship || "SPOUSE",
      personalMessage: "",
    });
    setInviteModalOpen(true);
  }

  // Handle Send Invite
  async function handleSendInviteSubmit(e) {
    e.preventDefault();
    if (!inviteForm.email.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        email: inviteForm.email.trim(),
        name: inviteForm.name.trim(),
        relationship: inviteForm.relationship,
        personalMessage: inviteForm.personalMessage.trim(),
        familyMemberId: inviteTargetMember?.id || undefined,
      };

      const res = await fetch("/api/family/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send invitation");

      flashSuccess(`Invitation email dispatched to ${inviteForm.email}.`);
      setInviteModalOpen(false);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  // Resend Invite
  async function handleResendInvite(inviteId) {
    try {
      const res = await fetch(`/api/family/invitations/${inviteId}/resend`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend invitation");

      flashSuccess("Invitation resent with renewed 7-day expiration.");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  // Revoke Invite
  async function handleRevokeInvite(inviteId) {
    if (!confirm("Are you sure you want to revoke this invitation? The recipient will no longer be able to accept it.")) {
      return;
    }

    try {
      const res = await fetch(`/api/family/invitations/${inviteId}/revoke`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to revoke invitation");

      flashSuccess("Invitation revoked.");
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  // View Kundli Modal
  async function handleOpenKundli(member) {
    setKundliModalMember(member);
    setKundliLoading(true);
    setKundliData(null);

    try {
      const res = await fetch(`/api/family/${member.id}/kundli`);
      const data = await res.json();
      if (res.ok && data.success) {
        setKundliData(data);
      } else {
        setKundliData({ error: data.message || data.error || "Birth details incomplete" });
      }
    } catch (err) {
      setKundliData({ error: "Failed to calculate birth chart: " + err.message });
    } finally {
      setKundliLoading(false);
    }
  }

  // Filter members
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.birthPlace && m.birthPlace.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.linkedUser?.email && m.linkedUser.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRel =
      relationshipFilter === "ALL" || m.relationship === relationshipFilter;

    return matchesSearch && matchesRel;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
            <Link href="/dashboard" className="hover:underline">Dashboard</Link>
            <ChevronRight className="w-3 h-3 text-stone-400" />
            <span className="text-stone-600">Family Circle</span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-[#13382c] flex items-center gap-2.5">
            <Users className="w-8 h-8 text-[#d4a359]" />
            Family Management & Astrology Circle
          </h1>
          <p className="text-sm text-stone-600 mt-1 max-w-2xl">
            Manage your family members, keep birth details secure, compute personalized Vedic Kundlis, and send single-use email invitations to connect accounts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setMemberForm({
                name: "",
                relationship: "SPOUSE",
                gender: "",
                dateOfBirth: "",
                birthTime: "",
                birthPlace: "",
                notes: "",
              });
              setAddModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-[#13382c] hover:bg-[#194939] text-white text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#d4a359]" />
            <span>Add Family Member</span>
          </button>

          <button
            onClick={() => openInviteModal(null)}
            className="px-4 py-2.5 rounded-xl border border-[#d4a359] bg-[#fdfbf7] hover:bg-[#f6f1e6] text-[#13382c] text-xs sm:text-sm font-semibold shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Mail className="w-4 h-4 text-[#d4a359]" />
            <span>Invite by Email</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1 font-medium">{error}</div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 text-xs">Dismiss</button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-start gap-3 shadow-xs">
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600" />
          <div className="flex-1 font-medium">{successMessage}</div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800 text-xs">Dismiss</button>
        </div>
      )}

      {/* Overview Statistics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-stone-900">{members.length}</span>
            <p className="text-xs text-stone-500 font-medium">Family Members</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
            <LinkIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-stone-900">
              {members.filter((m) => m.linkedUserId).length}
            </span>
            <p className="text-xs text-stone-500 font-medium">Linked Accounts</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800 shrink-0">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-stone-900">
              {invitations.filter((i) => i.status === "PENDING").length}
            </span>
            <p className="text-xs text-stone-500 font-medium">Pending Invitations</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#13382c]/10 flex items-center justify-center text-[#13382c] shrink-0">
            <Sparkles className="w-6 h-6 text-[#d4a359]" />
          </div>
          <div>
            <span className="text-2xl font-bold text-stone-900">
              {members.filter((m) => m.birthProfileId || (m.dateOfBirth && m.birthTime)).length}
            </span>
            <p className="text-xs text-stone-500 font-medium">Astrology Kundlis Ready</p>
          </div>
        </div>
      </div>

      {/* Filter and Privacy Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/90 shadow-xs">
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, place, or email..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4a359] focus:border-transparent bg-stone-50/50"
            />
          </div>

          {/* Relationship Filter */}
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={relationshipFilter}
              onChange={(e) => setRelationshipFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 bg-white text-stone-700 text-xs focus:ring-2 focus:ring-[#d4a359] outline-none"
            >
              <option value="ALL">All Relationships ({members.length})</option>
              {Object.keys(RELATIONSHIP_LABELS).map((key) => (
                <option key={key} value={key}>
                  {RELATIONSHIP_LABELS[key]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Privacy Toggle */}
        <button
          onClick={() => setPrivacyHidden(!privacyHidden)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 text-xs text-stone-600 hover:bg-stone-50 transition cursor-pointer self-start sm:self-auto"
          title="Toggle visibility of birth time and place for privacy"
        >
          {privacyHidden ? (
            <>
              <Eye className="w-3.5 h-3.5 text-amber-700" />
              <span>Show Birth Details</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5 text-stone-500" />
              <span>Hide Sensitive Details</span>
            </>
          )}
        </button>
      </div>

      {/* Family Members Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
            <span>Family Members</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 font-sans font-semibold">
              {filteredMembers.length}
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 bg-stone-100 rounded-2xl animate-pulse border border-stone-200" />
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="p-10 text-center rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50/50 space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-[#13382c] flex items-center justify-center mx-auto">
              <Users className="w-7 h-7 text-[#d4a359]" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-bold text-stone-900 font-serif">No Family Profiles Found</h3>
              <p className="text-xs text-stone-500 mt-1">
                {searchQuery || relationshipFilter !== "ALL"
                  ? "No family members match your current filters. Try resetting search or relationship filter."
                  : "Start building your family circle. Add family members to calculate collective Vedic Kundlis and share astrological insights."}
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#13382c] text-white text-xs font-semibold hover:bg-[#194939] transition"
              >
                Add Member
              </button>
              <button
                onClick={() => openInviteModal(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-semibold hover:bg-stone-50 transition"
              >
                Send Email Invite
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMembers.map((member) => {
              const relColor = RELATIONSHIP_COLORS[member.relationship] || RELATIONSHIP_COLORS.OTHER;
              const hasBirthDetails = member.dateOfBirth && member.birthTime;

              return (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl border border-stone-200/90 hover:border-[#d4a359]/60 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      {/* Avatar & Name */}
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#13382c] text-[#f3caa1] font-bold text-base flex items-center justify-center shadow-xs">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-stone-900 leading-tight">
                            {member.name}
                          </h3>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${relColor}`}
                          >
                            {RELATIONSHIP_LABELS[member.relationship] || member.relationship}
                          </span>
                        </div>
                      </div>

                      {/* Account Link Status Indicator */}
                      <div>
                        {member.linkedUserId ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-medium"
                            title={`Linked account: ${member.linkedUser?.email || "Connected"}`}
                          >
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Linked</span>
                          </span>
                        ) : member.latestInvite?.computedStatus === "PENDING" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-medium">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Invited</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-stone-100 text-stone-600 text-[11px] font-medium">
                            <Shield className="w-3 h-3 text-stone-400" />
                            <span>Managed</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Birth Details Box */}
                    <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 space-y-1.5 text-xs text-stone-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span suppressHydrationWarning>
                          {member.dateOfBirth
                            ? formatDate(member.dateOfBirth)
                            : "Birth date not specified"}
                        </span>
                      </div>

                      {!privacyHidden && (
                        <>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>{member.birthTime ? `${member.birthTime} (Time)` : "Time not specified"}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span className="truncate">{member.birthPlace || "Location not specified"}</span>
                          </div>
                        </>
                      )}

                      {privacyHidden && (
                        <div className="text-[11px] text-stone-400 italic">
                          Birth time & location hidden for privacy
                        </div>
                      )}
                    </div>

                    {/* Linked User Details or Kundli Badges */}
                    {member.birthProfile?.birthChart && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 font-medium border border-amber-200">
                          Lagna: {member.birthProfile.birthChart.lagnaSign || "—"}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 font-medium border border-blue-200">
                          Moon: {member.birthProfile.birthChart.moonSign || "—"}
                        </span>
                        {member.birthProfile.birthChart.currentDasha && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-900 font-medium border border-purple-200">
                            Dasha: {member.birthProfile.birthChart.currentDasha}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-2">
                    {/* View Kundli */}
                    <button
                      onClick={() => handleOpenKundli(member)}
                      className="px-3 py-1.5 rounded-lg bg-[#13382c] hover:bg-[#194939] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#d4a359]" />
                      <span>{hasBirthDetails ? "Kundli Chart" : "Setup Kundli"}</span>
                    </button>

                    {/* Right action icons */}
                    <div className="flex items-center gap-1">
                      {!member.linkedUserId && (
                        <button
                          onClick={() => openInviteModal(member)}
                          className="p-1.5 rounded-lg hover:bg-stone-200/80 text-stone-600 hover:text-stone-900 transition cursor-pointer"
                          title="Invite to Gurukul via Email"
                        >
                          <Send className="w-3.5 h-3.5 text-[#d4a359]" />
                        </button>
                      )}

                      {member.linkedUserId && (
                        <button
                          onClick={() => handleUnlink(member.id)}
                          className="p-1.5 rounded-lg hover:bg-stone-200/80 text-stone-600 hover:text-amber-800 transition cursor-pointer"
                          title="Unlink account"
                        >
                          <Unlink className="w-3.5 h-3.5 text-amber-600" />
                        </button>
                      )}

                      <button
                        onClick={() => openEditModal(member)}
                        className="p-1.5 rounded-lg hover:bg-stone-200/80 text-stone-600 hover:text-stone-900 transition cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setDeleteConfirmMember(member)}
                        className="p-1.5 rounded-lg hover:bg-rose-100 text-stone-400 hover:text-rose-700 transition cursor-pointer"
                        title="Remove Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Email Invitations Section */}
      <div className="space-y-4 pt-4 border-t border-stone-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-700" />
              <span>Email Invitations</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Track status of invitations sent to family members to link their Gurukul accounts.
            </p>
          </div>

          <button
            onClick={() => openInviteModal(null)}
            className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>New Invitation</span>
          </button>
        </div>

        {invitations.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-stone-200 text-center text-xs text-stone-500">
            No family invitations sent yet. Click "Invite by Email" to connect with a family member.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Invited Email</th>
                    <th className="py-3 px-4">Family Member</th>
                    <th className="py-3 px-4">Relationship</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Sent Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {invitations.map((inv) => {
                    const isPending = inv.status === "PENDING";
                    const isAccepted = inv.status === "ACCEPTED";
                    const isExpired = inv.status === "EXPIRED";
                    const isRevoked = inv.status === "REVOKED";

                    return (
                      <tr key={inv.id} className="hover:bg-stone-50/50 transition">
                        <td className="py-3.5 px-4 font-medium text-stone-900">
                          {inv.invitedEmail}
                        </td>
                        <td className="py-3.5 px-4 text-stone-700">
                          {inv.familyMemberName || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-stone-600">
                          {RELATIONSHIP_LABELS[inv.relationship] || inv.relationship || "—"}
                        </td>
                        <td className="py-3.5 px-4">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Pending
                            </span>
                          )}
                          {isAccepted && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              Accepted
                            </span>
                          )}
                          {isExpired && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[11px] font-semibold">
                              <XCircle className="w-3 h-3 text-stone-400" />
                              Expired
                            </span>
                          )}
                          {isRevoked && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-semibold">
                              <XCircle className="w-3 h-3 text-rose-500" />
                              Revoked
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-stone-500" suppressHydrationWarning>
                          {formatDate(inv.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          {(isPending || isExpired || isRevoked) && (
                            <button
                              onClick={() => handleResendInvite(inv.id)}
                              className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[11px] font-semibold transition cursor-pointer"
                              title="Resend invitation email"
                            >
                              Resend
                            </button>
                          )}
                          {isPending && (
                            <button
                              onClick={() => handleRevokeInvite(inv.id)}
                              className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-600 text-[11px] font-medium transition cursor-pointer"
                              title="Revoke invitation"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ---------------- MODALS ---------------- */}

      {/* Add / Edit Family Member Modal */}
      {(addModalOpen || editMember) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-stone-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <h3 className="text-xl font-bold font-serif text-[#13382c]">
                {editMember ? "Edit Family Member" : "Add Family Member"}
              </h3>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setEditMember(null);
                }}
                className="text-stone-400 hover:text-stone-700 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={editMember ? handleEditMemberSubmit : handleAddMemberSubmit}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  placeholder="e.g. Radhika Sharma"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#d4a359] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Relationship <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={memberForm.relationship}
                    onChange={(e) => setMemberForm({ ...memberForm, relationship: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#d4a359] outline-none bg-white"
                  >
                    {Object.keys(RELATIONSHIP_LABELS).map((key) => (
                      <option key={key} value={key}>
                        {RELATIONSHIP_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Gender (Optional)
                  </label>
                  <select
                    value={memberForm.gender}
                    onChange={(e) => setMemberForm({ ...memberForm, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#d4a359] outline-none bg-white"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="FEMALE">Female (महिला)</option>
                    <option value="MALE">Male (पुरुष)</option>
                    <option value="OTHER">Other (अन्य)</option>
                  </select>
                </div>
              </div>

              {/* Birth Details (Used for Kundli calculation) */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>Vedic Astrology Birth Details</span>
                </div>
                <p className="text-[11px] text-stone-600">
                  Birth details are securely stored and kept private. Providing accurate time and place enables authentic Kundli generation.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={memberForm.dateOfBirth}
                      onChange={(e) => setMemberForm({ ...memberForm, dateOfBirth: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-[#d4a359] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Birth Time (HH:MM)</label>
                    <input
                      type="time"
                      value={memberForm.birthTime}
                      onChange={(e) => setMemberForm({ ...memberForm, birthTime: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-[#d4a359] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Birthplace City</label>
                  <input
                    type="text"
                    value={memberForm.birthPlace}
                    onChange={(e) => setMemberForm({ ...memberForm, birthPlace: e.target.value })}
                    placeholder="e.g. New Delhi, India"
                    className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-[#d4a359] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={memberForm.notes}
                  onChange={(e) => setMemberForm({ ...memberForm, notes: e.target.value })}
                  placeholder="Private family notes or health/astrology notes..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#d4a359] outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditMember(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#13382c] hover:bg-[#194939] text-white font-semibold transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editMember ? "Save Changes" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Family Member Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-stone-200 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-[#13382c] flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#d4a359]" />
                  <span>Invite Family Member</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Send a cryptographically secure, single-use invitation by email.
                </p>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-sm p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Family Member's Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="family.member@example.com"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#d4a359] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                    placeholder="e.g. Radhika"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#d4a359] outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Relationship <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={inviteForm.relationship}
                    onChange={(e) => setInviteForm({ ...inviteForm, relationship: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#d4a359] outline-none bg-white"
                  >
                    {Object.keys(RELATIONSHIP_LABELS).map((key) => (
                      <option key={key} value={key}>
                        {RELATIONSHIP_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Personal Invitation Message (Optional)
                </label>
                <textarea
                  rows={3}
                  value={inviteForm.personalMessage}
                  onChange={(e) => setInviteForm({ ...inviteForm, personalMessage: e.target.value })}
                  placeholder="Hey, join my Gurukul family circle so we can share astrological charts and family Kundlis!"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#d4a359] outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 space-y-1">
                <p className="font-semibold text-stone-800 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#13382c]" />
                  <span>Privacy & Expiry Assurance</span>
                </p>
                <p>
                  • Invitations expire automatically after 7 days.
                </p>
                <p>
                  • Only the email owner can accept. Private reading history and personal notes remain confidential.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 font-semibold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#13382c] hover:bg-[#194939] text-white font-semibold transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-[#d4a359]" />
                  <span>{submitting ? "Sending..." : "Send Invitation"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kundli Modal */}
      {kundliModalMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-xl border border-stone-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-[#13382c] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#d4a359]" />
                  <span>{kundliModalMember.name}'s Vedic Kundli</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Astrological birth chart and planetary placements.
                </p>
              </div>
              <button
                onClick={() => setKundliModalMember(null)}
                className="text-stone-400 hover:text-stone-700 text-sm p-1"
              >
                ✕
              </button>
            </div>

            {kundliLoading ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-[#13382c] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-stone-600 font-medium">Calculating Vedic planetary positions...</p>
              </div>
            ) : kundliData?.error ? (
              <div className="p-6 text-center rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
                <Compass className="w-8 h-8 text-amber-700 mx-auto" />
                <h4 className="text-sm font-bold text-amber-900">Incomplete Birth Details</h4>
                <p className="text-xs text-stone-600 max-w-sm mx-auto">
                  {kundliData.error}
                </p>
                <button
                  onClick={() => {
                    const m = kundliModalMember;
                    setKundliModalMember(null);
                    openEditModal(m);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#13382c] text-white text-xs font-semibold"
                >
                  Edit Birth Details
                </button>
              </div>
            ) : kundliData?.chart ? (
              <div className="space-y-6">
                {/* Highlights Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                    <span className="text-[10px] text-amber-700 font-semibold uppercase">Lagna (Ascendant)</span>
                    <p className="text-base font-bold text-stone-900 mt-0.5">
                      {kundliData.chart.lagnaSign || "—"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                    <span className="text-[10px] text-blue-700 font-semibold uppercase">Moon Sign (Rashi)</span>
                    <p className="text-base font-bold text-stone-900 mt-0.5">
                      {kundliData.chart.moonSign || "—"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <span className="text-[10px] text-emerald-700 font-semibold uppercase">Nakshatra</span>
                    <p className="text-base font-bold text-stone-900 mt-0.5">
                      {kundliData.chart.moonNakshatra || "—"}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-center">
                    <span className="text-[10px] text-purple-700 font-semibold uppercase">Current Dasha</span>
                    <p className="text-base font-bold text-stone-900 mt-0.5">
                      {kundliData.chart.currentDasha || "—"}
                    </p>
                  </div>
                </div>

                {/* Planetary Positions Table */}
                {kundliData.chart.planets && kundliData.chart.planets.length > 0 && (
                  <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="bg-stone-50 px-4 py-2.5 border-b border-stone-200 font-semibold text-xs text-stone-800">
                      Planetary Placements (ग्रह स्थिति)
                    </div>
                    <table className="w-full text-left text-xs">
                      <thead className="bg-stone-50/50 text-[11px] text-stone-500 uppercase">
                        <tr>
                          <th className="py-2 px-3">Planet</th>
                          <th className="py-2 px-3">Sign</th>
                          <th className="py-2 px-3">House</th>
                          <th className="py-2 px-3">Degree</th>
                          <th className="py-2 px-3">Nakshatra</th>
                          <th className="py-2 px-3">Motion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {kundliData.chart.planets.map((p) => (
                          <tr key={p.id || p.planet}>
                            <td className="py-2 px-3 font-semibold text-stone-900">{p.planet}</td>
                            <td className="py-2 px-3 text-stone-700">{p.sign}</td>
                            <td className="py-2 px-3 text-stone-600">House {p.house}</td>
                            <td className="py-2 px-3 text-stone-600">{Number(p.degree).toFixed(2)}°</td>
                            <td className="py-2 px-3 text-stone-600">{p.nakshatra || "—"}</td>
                            <td className="py-2 px-3">
                              {p.retrograde ? (
                                <span className="text-rose-600 font-semibold">Retrograde (व)</span>
                              ) : (
                                <span className="text-emerald-700">Direct</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null}

            <div className="flex justify-end pt-4 border-t border-stone-100">
              <button
                onClick={() => setKundliModalMember(null)}
                className="px-5 py-2 rounded-xl bg-[#13382c] text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <h3 className="text-lg font-bold text-stone-900 font-serif">Remove Family Member?</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to remove <strong>{deleteConfirmMember.name}</strong> from your family circle?
              Their individual astrology profile will be archived and any pending email invitations will be revoked.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmMember(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMember(deleteConfirmMember.id, false)}
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition disabled:opacity-50"
              >
                {submitting ? "Removing..." : "Confirm Removal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
