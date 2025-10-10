import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name?: string | null;
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

    // Get user from Prisma to ensure they still exist
    // Add retry logic to handle prepared statement errors
    let user: {
      id: string;
      email: string;
      name: string | null;
      role: string;
    } | null = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries && !user) {
      try {
        user = await db.user.findUnique({
          where: {
            id: decoded.userId,
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        });
      } catch (dbError) {
        console.error(`Database error during auth verification (attempt ${retryCount + 1}):`, dbError);
        retryCount++;
        
        // Wait a bit before retrying
        if (retryCount < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
        }
      }
    }

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
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