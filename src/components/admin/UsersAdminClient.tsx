"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { UserRole } from "@/lib/supabase";

export interface StaffRow {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
  last_sign_in_at: string | null;
}

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  marketing_sales: "Marketing & Sales",
};

const ROLE_BADGE: Record<UserRole, string> = {
  admin: "bg-primary/10 text-primary",
  marketing_sales: "bg-accent/10 text-accent",
};

function formatDate(s: string | null): string {
  if (!s) return "Never";
  return new Date(s).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" });
}

export default function UsersAdminClient({
  initialUsers,
  currentAdminId,
}: {
  initialUsers: StaffRow[];
  currentAdminId: string;
}) {
  const [users, setUsers] = useState<StaffRow[]>(initialUsers);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<StaffRow | null>(null);

  async function handleDelete(user: StaffRow) {
    if (user.id === currentAdminId) return;
    if (!confirm(`Delete ${user.name} (${user.email})? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "Delete failed");
      return;
    }
    setUsers(prev => prev.filter(u => u.id !== user.id));
  }

  return (
    <div className="min-h-screen bg-bg-alt">
      <header className="bg-primary text-white px-6 py-4 flex items-center gap-4">
        <Link href="/admin/dashboard" className="text-white/60 hover:text-white text-sm transition">
          ← Dashboard
        </Link>
        <h1 className="font-semibold">Staff Users</h1>
        <span className="text-white/40 text-sm">({users.length})</span>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-end mb-4">
          <button
            onClick={() => setShowAdd(true)}
            className="bg-accent text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-accent-dark transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {users.length === 0 ? (
            <div className="text-center py-16 text-text-secondary">No staff yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-bg-alt border-b border-border">
                <tr>
                  {["Name", "Email", "Role", "Created", "Last sign-in", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-bg-alt/50 transition">
                    <td className="px-4 py-3 font-medium text-dark">{u.name}</td>
                    <td className="px-4 py-3 text-text-secondary">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_BADGE[u.role]}`}>
                        {ROLE_LABEL[u.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{formatDate(u.created_at)}</td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{formatDate(u.last_sign_in_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditing(u)}
                          className="p-1.5 text-text-secondary hover:text-primary transition"
                          aria-label={`Edit ${u.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-1.5 text-text-secondary hover:text-red-600 transition disabled:opacity-30"
                          disabled={u.id === currentAdminId}
                          aria-label={`Delete ${u.name}`}
                          title={u.id === currentAdminId ? "Cannot delete yourself" : ""}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAdd && (
        <AddStaffModal
          onClose={() => setShowAdd(false)}
          onCreated={(row) => setUsers(prev => [row, ...prev])}
        />
      )}
      {editing && (
        <EditStaffModal
          user={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

// Stubs — replaced in Task 22
function AddStaffModal(_: { onClose: () => void; onCreated: (row: StaffRow) => void }) { return null; }
function EditStaffModal(_: { user: StaffRow; onClose: () => void; onSaved: (updated: Partial<StaffRow> & { id: string }) => void }) { return null; }
