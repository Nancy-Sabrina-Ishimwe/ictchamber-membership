import type { UserRole } from '../context/AuthContext';

export function isStaffRole(role: UserRole): boolean {
  return role === 'admin' || role === 'standard_user';
}

export function canWriteForRole(role: UserRole): boolean {
  return role === 'admin';
}
