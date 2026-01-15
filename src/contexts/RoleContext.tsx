import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { UserRole } from '../types/roles';
import { getRolePermissions, type RolePermissions } from '../types/roles';

interface RoleContextType {
  selectedRole: UserRole;
  setSelectedRole: (role: UserRole) => void;
  permissions: RolePermissions;
}

const RoleContext = createContext<RoleContextType | null>(null);

const STORAGE_KEY = 'selectedRole';
const DEFAULT_ROLE: UserRole = 'Processor III';

export function RoleProvider({ children }: { children: ReactNode }) {
  const [selectedRole, setSelectedRoleState] = useState<UserRole>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'Processor III' || stored === 'Underwriter') {
      return stored;
    }
    return DEFAULT_ROLE;
  });

  const permissions = getRolePermissions(selectedRole);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedRole);
  }, [selectedRole]);

  function setSelectedRole(role: UserRole) {
    setSelectedRoleState(role);
  }

  return (
    <RoleContext.Provider
      value={{
        selectedRole,
        setSelectedRole,
        permissions,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRoleContext() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRoleContext must be used within a RoleProvider');
  }
  return context;
}
