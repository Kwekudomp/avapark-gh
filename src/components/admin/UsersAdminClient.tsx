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

function AddStaffModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (row: StaffRow) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("marketing_sales");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Password must be at least 8 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setSubmitting(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, role, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to create user");
      setSubmitting(false);
      return;
    }
    try { await navigator.clipboard.writeText(password); } catch { /* noop */ }
    onCreated({
      id: data.user.id,
      email,
      name,
      role,
      created_at: new Date().toISOString(),
      last_sign_in_at: null,
    });
    setDone(true);
    setTimeout(() => onClose(), 2500);
  }

  return (
    <ModalShell title="Add Staff" onClose={onClose}>
      {done ? (
        <div className="text-center py-6">
          <p className="text-green-700 font-semibold">✓ Created — password copied to clipboard.</p>
          <p className="text-text-secondary text-sm mt-1">Send to user via WhatsApp or in person.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name">
            <input className={inputClass} value={name} onChange={e => setName(e.target.value)} required />
          </Field>
          <Field label="Email">
            <input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="off" />
          </Field>
          <Field label="Role">
            <select className={inputClass} value={role} onChange={e => setRole(e.target.value as UserRole)}>
              <option value="marketing_sales">Marketing & Sales Officer</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <Field label="Password (min 8 chars)">
            <PasswordField value={password} onChange={setPassword} show={showPwd} onToggleShow={() => setShowPwd(s => !s)} />
          </Field>
          <Field label="Confirm Password">
            <input className={inputClass} type={showPwd ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </Field>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2 rounded-full text-sm border border-border hover:bg-bg-alt transition">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="bg-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-primary-light transition disabled:opacity-60">
              {submitting ? "Creating…" : "Create Staff"}
            </button>
          </div>
        </form>
      )}
    </ModalShell>
  );
}

function EditStaffModal({
  user,
  onClose,
  onSaved,
}: {
  user: StaffRow;
  onClose: () => void;
  onSaved: (updated: Partial<StaffRow> & { id: string }) => void;
}) {
  const [name, setName] = useState(user.name);
  const [role, setRole] = useState<UserRole>(user.role);
  const [resetting, setResetting] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (resetting) {
      if (password.length < 8) return setError("Password must be at least 8 characters");
      if (password !== confirm) return setError("Passwords do not match");
    }
    setSubmitting(true);
    const body: Record<string, unknown> = { name, role };
    if (resetting) body.password = password;

    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Failed to save");
      setSubmitting(false);
      return;
    }
    if (resetting) {
      try { await navigator.clipboard.writeText(password); } catch { /* noop */ }
      alert("Password reset and copied to clipboard.");
    }
    onSaved({ id: user.id, name, role });
  }

  return (
    <ModalShell title={`Edit ${user.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Name">
          <input className={inputClass} value={name} onChange={e => setName(e.target.value)} required />
        </Field>
        <Field label="Email (read-only)">
          <input className={`${inputClass} bg-bg-alt`} value={user.email} disabled />
        </Field>
        <Field label="Role">
          <select className={inputClass} value={role} onChange={e => setRole(e.target.value as UserRole)}>
            <option value="marketing_sales">Marketing & Sales Officer</option>
            <option value="admin">Admin</option>
          </select>
        </Field>

        <div className="border-t border-border pt-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={resetting} onChange={e => setResetting(e.target.checked)} />
            <span>Reset password</span>
          </label>
          {resetting && (
            <div className="mt-3 space-y-3">
              <Field label="New password (min 8)">
                <PasswordField value={password} onChange={setPassword} show={showPwd} onToggleShow={() => setShowPwd(s => !s)} />
              </Field>
              <Field label="Confirm new password">
                <input className={inputClass} type={showPwd ? "text" : "password"} value={confirm} onChange={e => setConfirm(e.target.value)} required={resetting} />
              </Field>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-full text-sm border border-border hover:bg-bg-alt transition">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="bg-primary text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-primary-light transition disabled:opacity-60">
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ───────────────────────────── helpers ─────────────────────────────────────

const inputClass =
  "w-full border border-border rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold tracking-wider text-text-secondary uppercase mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function PasswordField({
  value, onChange, show, onToggleShow,
}: {
  value: string; onChange: (v: string) => void; show: boolean; onToggleShow: () => void;
}) {
  return (
    <div className="flex gap-2">
      <input
        className={`${inputClass} flex-1`}
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        minLength={8}
        autoComplete="new-password"
      />
      <button type="button" onClick={onToggleShow}
        className="px-3 py-2 rounded-xl text-xs border border-border hover:bg-bg-alt transition">
        {show ? "Hide" : "Show"}
      </button>
      <button type="button" onClick={() => navigator.clipboard.writeText(value).catch(() => {})}
        className="px-3 py-2 rounded-xl text-xs border border-border hover:bg-bg-alt transition">
        Copy
      </button>
    </div>
  );
}

function ModalShell({
  title, onClose, children,
}: {
  title: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-border w-full max-w-md p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-primary">{title}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-dark transition" aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
