"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, CircleCheck } from "lucide-react";
import type { UserRole } from "@/lib/types";
import { useToast } from "./ui/Toast";
import { ConfirmDialog } from "./ui/ConfirmDialog";

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
  const { toast } = useToast();
  const [users, setUsers] = useState<StaffRow[]>(initialUsers);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<StaffRow | null>(null);
  const [pendingDelete, setPendingDelete] = useState<StaffRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(user: StaffRow) {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast("error", err.error ?? "Could not delete this account.");
        return;
      }
      setUsers(prev => prev.filter(u => u.id !== user.id));
      toast("success", `${user.name} removed.`);
      setPendingDelete(null);
    } catch {
      toast("error", "Could not delete — check your connection and try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-dark">Staff Users</h1>
          <p className="text-sm text-text-secondary mt-0.5">{users.length} account{users.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 min-h-11 bg-accent text-white px-5 rounded-full text-sm font-medium hover:bg-accent-dark transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden /> Add Staff
        </button>
      </div>

      <div>{/* content wrapper */}

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
                  <tr key={u.id} className="hover:bg-bg-alt/50 transition-colors">
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
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => setEditing(u)}
                          className="flex items-center justify-center min-h-11 min-w-11 rounded-xl text-text-secondary hover:text-primary hover:bg-bg-alt transition-colors cursor-pointer"
                          aria-label={`Edit ${u.name}`}
                        >
                          <Pencil className="w-4 h-4" aria-hidden />
                        </button>
                        <button
                          onClick={() => setPendingDelete(u)}
                          className="flex items-center justify-center min-h-11 min-w-11 rounded-xl text-text-secondary hover:text-red-600 hover:bg-bg-alt transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={u.id === currentAdminId}
                          aria-label={`Delete ${u.name}`}
                          title={u.id === currentAdminId ? "Cannot delete yourself" : ""}
                        >
                          <Trash2 className="w-4 h-4" aria-hidden />
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

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this account?"
        message={pendingDelete ? `${pendingDelete.name} (${pendingDelete.email}) will lose access immediately. This cannot be undone.` : ""}
        confirmLabel="Delete account"
        danger
        busy={deleting}
        onConfirm={() => { if (pendingDelete) handleDelete(pendingDelete); }}
        onCancel={() => setPendingDelete(null)}
      />
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
          <p className="flex items-center justify-center gap-2 text-green-700 font-semibold">
            <CircleCheck className="w-5 h-5" aria-hidden /> Created — password copied to clipboard.
          </p>
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
            <button type="button" onClick={onClose} className="min-h-11 px-5 rounded-full text-sm border border-border hover:bg-bg-alt transition-colors cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="min-h-11 bg-primary text-white px-5 rounded-full text-sm font-medium hover:bg-primary-light transition-colors cursor-pointer disabled:opacity-60">
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
  const { toast } = useToast();
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
      toast("success", "Password reset and copied to clipboard.");
    } else {
      toast("success", "Staff account updated.");
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
          <button type="button" onClick={onClose} className="min-h-11 px-5 rounded-full text-sm border border-border hover:bg-bg-alt transition-colors cursor-pointer">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="min-h-11 bg-primary text-white px-5 rounded-full text-sm font-medium hover:bg-primary-light transition-colors cursor-pointer disabled:opacity-60">
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
        className="min-h-11 px-3 rounded-xl text-xs border border-border hover:bg-bg-alt transition-colors cursor-pointer">
        {show ? "Hide" : "Show"}
      </button>
      <button type="button" onClick={() => navigator.clipboard.writeText(value).catch(() => {})}
        className="min-h-11 px-3 rounded-xl text-xs border border-border hover:bg-bg-alt transition-colors cursor-pointer">
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
          <button onClick={onClose} className="flex items-center justify-center min-h-11 min-w-11 -mr-2 rounded-xl text-text-secondary hover:text-dark hover:bg-bg-alt transition-colors cursor-pointer" aria-label="Close">
            <X className="w-4 h-4" aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
