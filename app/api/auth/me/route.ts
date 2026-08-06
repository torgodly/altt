import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { canManageUsers } from '@/lib/constants';

export async function GET() {
  const session = await getSession();
  if (!session.user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      ...session.user,
      canManageUsers: canManageUsers(session.user.username),
    },
  });
}
