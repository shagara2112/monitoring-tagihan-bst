// Client-side auth utilities (no database calls)
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export function hasRole(user: AuthUser | null, roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function isSuperAdmin(user: AuthUser | null): boolean {
  return hasRole(user, ['SUPER_ADMIN']);
}

export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, ['SUPER_ADMIN', 'ADMIN']);
}

export function isManagerOrAdmin(user: AuthUser | null): boolean {
  return hasRole(user, ['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
}