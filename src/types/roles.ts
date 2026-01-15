export type UserRole = 'Processor III' | 'Underwriter';

export interface RolePermissions {
  showNeedToRequestFilter: boolean;
  showRequestedFilter: boolean;
  showSendBrwButton: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  'Processor III': {
    showNeedToRequestFilter: true,
    showRequestedFilter: true,
    showSendBrwButton: true,
  },
  'Underwriter': {
    showNeedToRequestFilter: false,
    showRequestedFilter: false,
    showSendBrwButton: false,
  },
};

export const ROLE_AUTHOR_NAMES: Record<UserRole, string> = {
  'Processor III': 'Sarah Processor',
  'Underwriter': 'Urma Underwriter',
};

export function getAuthorNameForRole(role: UserRole): string {
  return ROLE_AUTHOR_NAMES[role];
}

export const ROLE_OPTIONS: UserRole[] = ['Processor III', 'Underwriter'];

export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}
