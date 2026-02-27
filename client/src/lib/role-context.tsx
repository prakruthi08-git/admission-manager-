import React, { createContext, useContext, useState, ReactNode } from "react";

export type Role = "Admin" | "Admission Officer" | "Management";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  canManageSetup: boolean;
  canManageAdmissions: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("Admin");

  const value = {
    role,
    setRole,
    canManageSetup: role === "Admin",
    canManageAdmissions: role === "Admin" || role === "Admission Officer",
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
