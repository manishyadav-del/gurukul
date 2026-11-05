"use client";

import { useState } from "react";
import {
  HeartHandshake,
  Mail,
  Users,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function FamilyManagementAdminClient({ initialData }) {
  const [activeTab, setActiveTab] = useState(initialData?.tab || "members");
  const [stats, setStats] = useState(initialData?.stats || {});
  const [members, setMembers] = useState(initialData?.members || []);
  const [invitations, setInvitations] = useState(initialData?.invitations || []);
  const [pagination, setPagination] = useState(initialData?.pagination || { total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [privacyMask, setPrivacyMask] = useState(true);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  const fetchData = async (tab = activeTab, page = 1, searchQuery = search) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/family?tab=${tab}&page=${page}&search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setPagination(data.pagination);
        if (tab === "members") setMembers(data.members || []);
        if (tab === "invitations") setInvitations(data.invitations || []);
      }
    } catch (err) {
      console.error("Family fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    fetchData(newTab, 1, search);
  };

  const handleRevokeInvite = async (inviteId) => {
    if (!confirm("Are you sure you want to administratively revoke this pending invitation?")) return;
    try {
      const res = await fetch(`/api/admin/family/invitations/${inviteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "REVOKE", reason: "Administrative intervention" }),
      });
      if (res.ok) {
        setActionMessage("Invitation successfully revoked.");
        setTimeout(() => setActionMessage(""), 4000);
        fetchData("invitations", pagination.page, search);
      }
    } catch (err) {
      console.error("Revoke error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">Family Circles & Invitations</h1>
          <p className="text-xs text-stone-500 mt-1">
            Audit multi-user family circles, oversee token delivery, and prevent abusive invitations.
          </p>
        </div>

        {/* Privacy Guard Toggle */}
        <button
          onClick={() => setPrivacyMask(!privacyMask)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer self-start ${
            privacyMask
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-amber-50 text-amber-800 border-amber-200"
          }`}
        >
          {privacyMask ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{privacyMask ? "Privacy Mask Active (Default)" : "Birth Details Unmasked"}</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-stone-400">Total Members</span>
          <p className="text-2xl font-black font-serif text-stone-900 mt-0.5">{stats.totalMembers || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-stone-400">Linked Accounts</span>
          <p className="text-2xl font-black font-serif text-emerald-700 mt-0.5">{stats.totalLinked || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-stone-400">Pending Invites</span>
          <p className="text-2xl font-black font-serif text-amber-700 mt-0.5">{stats.totalPendingInvites || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-stone-400">Accepted Invites</span>
          <p className="text-2xl font-black font-serif text-blue-700 mt-0.5">{stats.totalAcceptedInvites || 0}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-stone-400">Revoked Invites</span>
          <p className="text-2xl font-black font-serif text-stone-500 mt-0.5">{stats.totalRevokedInvites || 0}</p>
        </div>
      </div>

      {/* Tab Switcher & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-semibold w-full md:w-auto">
          <button
            onClick={() => handleTabChange("members")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "members"
                ? "bg-white text-stone-900 shadow-2xs font-bold"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Family Profiles
          </button>
          <button
            onClick={() => handleTabChange("invitations")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "invitations"
                ? "bg-white text-stone-900 shadow-2xs font-bold"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Email Invitations
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchData(activeTab, 1, search);
          }}
          className="flex-1 w-full max-w-md relative"
        >
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === "members" ? "Search by member name or owner email..." : "Search by invited email or sender..."}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#13382c]"
          />
        </form>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          {activeTab === "members" ? (
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 border-b border-stone-200 uppercase font-bold text-stone-500">
                <tr>
                  <th className="px-5 py-3.5">Member Name</th>
                  <th className="px-5 py-3.5">Relationship</th>
                  <th className="px-5 py-3.5">Owner Profile</th>
                  <th className="px-5 py-3.5">Linked User Account</th>
                  <th className="px-5 py-3.5">Birth Details</th>
                  <th className="px-5 py-3.5">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-stone-400">Loading family members...</td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-stone-400">No family members found.</td>
                  </tr>
                ) : (
                  members.map((m) => (
                    <tr key={m.id} className="hover:bg-stone-50/70 transition">
                      <td className="px-5 py-3.5 font-bold text-stone-900">{m.name}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-semibold">
                          {m.relationship}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-stone-800">{m.owner?.name || "Anonymous"}</p>
                        <p className="text-[11px] text-stone-400 font-mono">{m.owner?.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        {m.linkedUser ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Linked ({m.linkedUser.email})</span>
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">Owner Managed</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[11px] text-stone-500">
                        {privacyMask ? (
                          <span className="font-mono text-stone-400">[Masked for Privacy]</span>
                        ) : (
                          <span>
                            {m.dateOfBirth ? formatDate(m.dateOfBirth) : "N/A"}
                            {m.birthTime ? ` at ${m.birthTime}` : ""}
                            {m.birthPlace ? ` (${m.birthPlace})` : ""}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-stone-400 font-mono text-[11px]" suppressHydrationWarning>
                        {formatDate(m.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 border-b border-stone-200 uppercase font-bold text-stone-500">
                <tr>
                  <th className="px-5 py-3.5">Invited Email</th>
                  <th className="px-5 py-3.5">Target Member Profile</th>
                  <th className="px-5 py-3.5">Invited By</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Sent Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-stone-400">Loading invitations...</td>
                  </tr>
                ) : invitations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-stone-400">No invitations found.</td>
                  </tr>
                ) : (
                  invitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-stone-50/70 transition">
                      <td className="px-5 py-3.5 font-bold font-mono text-stone-900">{inv.invitedEmail}</td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-stone-800">{inv.familyMember?.name || "N/A"}</span>
                        <span className="text-[11px] text-stone-400 ml-1.5">({inv.relationship || "OTHER"})</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-stone-800">{inv.inviter?.name || "User"}</p>
                        <p className="text-[11px] text-stone-400 font-mono">{inv.inviter?.email}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            inv.status === "PENDING"
                              ? "bg-amber-100 text-amber-800"
                              : inv.status === "ACCEPTED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-stone-100 text-stone-500"
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-stone-400 font-mono text-[11px]" suppressHydrationWarning>
                        {formatDate(inv.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {inv.status === "PENDING" && (
                          <button
                            onClick={() => handleRevokeInvite(inv.id)}
                            className="px-2.5 py-1 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-[11px] font-semibold transition cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1 || loading}
              onClick={() => fetchData(activeTab, pagination.page - 1, search)}
              className="p-1.5 rounded-lg border border-stone-200 enabled:hover:bg-stone-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => fetchData(activeTab, pagination.page + 1, search)}
              className="p-1.5 rounded-lg border border-stone-200 enabled:hover:bg-stone-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
