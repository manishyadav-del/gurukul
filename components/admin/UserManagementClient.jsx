"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Shield,
  Edit2,
  Lock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";
import { ADMIN_ROLES, ROLE_LABELS } from "@/server/admin/permissions";
import { formatDate } from "@/lib/utils";

export default function UserManagementClient({ initialUsers, initialPagination }) {
  const [users, setUsers] = useState(initialUsers || []);
  const [pagination, setPagination] = useState(initialPagination || { total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);

  // Edit Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalRole, setModalRole] = useState("");
  const [modalIsActive, setModalIsActive] = useState(true);
  const [modalNewPassword, setModalNewPassword] = useState("");
  const [modalRevokeSessions, setModalRevokeSessions] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSaving, setModalSaving] = useState(false);

  const fetchUsers = async (page = 1, searchQuery = search, role = roleFilter, status = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        search: searchQuery,
        role,
        status,
      });
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1, search, roleFilter, statusFilter);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setModalRole(user.role);
    setModalIsActive(user.isActive !== false);
    setModalNewPassword("");
    setModalRevokeSessions(false);
    setModalError("");
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setModalError("");
    setModalSaving(true);

    try {
      const payload = {
        role: modalRole,
        isActive: modalIsActive,
        revokeSessions: modalRevokeSessions,
      };
      if (modalNewPassword.trim()) {
        payload.newPassword = modalNewPassword.trim();
      }

      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user");
      }

      // Update local state
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id ? { ...u, ...data.user } : u
        )
      );
      setSelectedUser(null);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setModalSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">Users & Roles Management</h1>
          <p className="text-xs text-stone-500 mt-1">
            Search, filter, assign administrative privileges, and protect core accounts.
          </p>
        </div>
        <div className="text-xs font-semibold text-stone-500 bg-stone-100 px-3.5 py-1.5 rounded-full self-start">
          Total Users: <span className="text-stone-900 font-bold">{pagination.total}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email address..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#13382c]"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              fetchUsers(1, search, e.target.value, statusFilter);
            }}
            className="text-xs py-2 px-3 rounded-xl border border-stone-300 bg-white font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#13382c]"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Administrator</option>
            <option value="CONTENT_ADMIN">Content Admin</option>
            <option value="OCR_MANAGER">OCR Manager</option>
            <option value="ASTROLOGY_ADMIN">Astrology Admin</option>
            <option value="QUIZ_ADMIN">Quiz Admin</option>
            <option value="SUPPORT_ADMIN">Support Admin</option>
            <option value="EDITOR">Editor</option>
            <option value="PROOFREADER">Proofreader</option>
            <option value="EXPERT">Scholar / Expert</option>
            <option value="USER">Standard User</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              fetchUsers(1, search, roleFilter, e.target.value);
            }}
            className="text-xs py-2 px-3 rounded-xl border border-stone-300 bg-white font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#13382c]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Accounts</option>
            <option value="INACTIVE">Deactivated Accounts</option>
          </select>

          <button
            onClick={() => fetchUsers(1, search, roleFilter, statusFilter)}
            className="px-3.5 py-2 rounded-xl bg-[#13382c] text-white text-xs font-semibold hover:bg-[#1a4a3a] transition cursor-pointer"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 uppercase font-bold text-stone-500">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Activity Stats</th>
                <th className="px-5 py-3.5">Registered</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-stone-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-stone-400">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isAdmin =
                    u.role === ADMIN_ROLES.SUPER_ADMIN ||
                    u.role === ADMIN_ROLES.ADMIN;

                  return (
                    <tr key={u.id} className="hover:bg-stone-50/70 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-700 shrink-0">
                            {u.name ? u.name[0].toUpperCase() : "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-stone-900 truncate">
                              {u.name || "Anonymous User"}
                            </p>
                            <p className="text-[11px] text-stone-400 font-mono truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isAdmin
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : u.role === "USER"
                              ? "bg-stone-100 text-stone-700"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          <Shield className="w-3 h-3 text-amber-700" />
                          <span>{ROLE_LABELS[u.role] || u.role}</span>
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        {u.isActive !== false ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-[11px] font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 text-[11px] font-semibold">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Deactivated</span>
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-[11px] text-stone-500 space-y-0.5">
                        <div>XP: <strong className="text-stone-800">{u.totalXp}</strong> (Lvl {u.level})</div>
                        <div>
                          Reads: {u._count?.readingProgress || 0} • Quizzes: {u._count?.quizAttempts || 0} • Family: {u._count?.ownedFamilyMembers || 0}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 text-stone-400 font-mono text-[11px]" suppressHydrationWarning>
                        {formatDate(u.createdAt)}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => openEditModal(u)}
                          className="px-3 py-1.5 rounded-lg border border-stone-200 hover:border-amber-300 bg-stone-50 hover:bg-stone-100 text-stone-800 text-[11px] font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-[#13382c]" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1 || loading}
              onClick={() => fetchUsers(pagination.page - 1)}
              className="p-1.5 rounded-lg border border-stone-200 enabled:hover:bg-stone-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => fetchUsers(pagination.page + 1)}
              className="p-1.5 rounded-lg border border-stone-200 enabled:hover:bg-stone-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div>
                <h3 className="font-bold text-stone-900 font-serif text-base">
                  Manage User Account
                </h3>
                <p className="text-xs text-stone-500 truncate">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              {modalError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Role Select */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Assigned Platform Role
                </label>
                <select
                  value={modalRole}
                  onChange={(e) => setModalRole(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-stone-300 font-medium focus:ring-2 focus:ring-[#13382c] focus:outline-none"
                >
                  <option value="USER">Standard User (Student)</option>
                  <option value="SUPER_ADMIN">Super Admin (All Privileges)</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="CONTENT_ADMIN">Content Admin (Books, Quizzes)</option>
                  <option value="OCR_MANAGER">OCR Operations Manager</option>
                  <option value="ASTROLOGY_ADMIN">Astrology & AI Specialist</option>
                  <option value="QUIZ_ADMIN">Quiz & Learning Manager</option>
                  <option value="SUPPORT_ADMIN">Support Admin</option>
                  <option value="EDITOR">Editor</option>
                  <option value="PROOFREADER">Proofreader</option>
                  <option value="EXPERT">Scholar / Expert</option>
                </select>
                <p className="text-[11px] text-stone-400 mt-1">
                  Guarded: System prevents demoting the last active Super Admin.
                </p>
              </div>

              {/* Account Status Toggle */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Account Status
                </label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-stone-800">
                    <input
                      type="radio"
                      name="isActive"
                      checked={modalIsActive === true}
                      onChange={() => setModalIsActive(true)}
                      className="accent-[#13382c]"
                    />
                    <span>Active (Permit Log In)</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer font-medium text-red-700">
                    <input
                      type="radio"
                      name="isActive"
                      checked={modalIsActive === false}
                      onChange={() => setModalIsActive(false)}
                      className="accent-red-600"
                    />
                    <span>Deactivated / Suspended</span>
                  </label>
                </div>
              </div>

              {/* Reset Password */}
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Reset Password (Optional)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={modalNewPassword}
                    onChange={(e) => setModalNewPassword(e.target.value)}
                    placeholder="Leave blank to keep unchanged"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 font-mono focus:ring-2 focus:ring-[#13382c] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Must be at least 6 characters if updating.
                </p>
              </div>

              {/* Revoke Sessions Checkbox */}
              <div className="pt-2 border-t border-stone-100">
                <label className="inline-flex items-center gap-2 cursor-pointer text-stone-700">
                  <input
                    type="checkbox"
                    checked={modalRevokeSessions}
                    onChange={(e) => setModalRevokeSessions(e.target.checked)}
                    className="rounded-md accent-[#13382c]"
                  />
                  <span>Revoke all active sessions (Force sign-out on all devices)</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSaving}
                  className="px-4 py-2 rounded-xl bg-[#13382c] hover:bg-[#1a4a3a] text-white font-bold transition shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {modalSaving ? "Saving Changes..." : "Apply Updates"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
