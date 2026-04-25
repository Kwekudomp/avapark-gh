"use client";

import { createContext, useContext } from "react";
import type { UserRole } from "@/lib/supabase";

export interface AdminRoleValue {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}

const AdminRoleContext = createContext<AdminRoleValue | null>(null);

export function AdminRoleProvider({
  value,
  children,
}: {
  value: AdminRoleValue;
  children: React.ReactNode;
}) {
  return <AdminRoleContext.Provider value={value}>{children}</AdminRoleContext.Provider>;
}

export function useAdminRole(): AdminRoleValue {
  const ctx = useContext(AdminRoleContext);
  if (!ctx) throw new Error("useAdminRole must be used inside <AdminRoleProvider>");
  return ctx;
}
