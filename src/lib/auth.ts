import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { createServerSupabaseClient } from '@/lib/supabase-client';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };

    // Get user from Supabase to ensure they still exist
    const supabase = createServerSupabaseClient();
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Auth verification error:', error);
    return null;
  }
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