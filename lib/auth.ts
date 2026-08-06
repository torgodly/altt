import { getIronSession, SessionOptions } from 'iron-session';
import { cookies } from 'next/headers';
import type { SessionUser } from '@/lib/types';

import { getSuperAdminUsername, canManageUsers as checkCanManageUsers } from '@/lib/constants';

export interface SessionData {
  user?: SessionUser;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'development-secret-min-32-characters-long!!',
  cookieName: 'dental_clinic_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session.user) {
    throw new Error('UNAUTHORIZED');
  }
  return session.user;
}

export async function requireUserManagement(): Promise<SessionUser> {
  const user = await requireAuth();
  if (!checkCanManageUsers(user.username)) {
    throw new Error('FORBIDDEN');
  }
  return user;
}

/** @deprecated use requireUserManagement for user CRUD; kept for backward compat */
export async function requireSuperAdmin(): Promise<SessionUser> {
  return requireUserManagement();
}
