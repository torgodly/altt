import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { addAuditLog } from '@/lib/audit';

export async function POST() {
  const session = await getSession();
  const username = session.user?.username;

  if (username) {
    addAuditLog({
      action: 'Admin Logout',
      details: 'User logged out',
      actionType: 'logout',
      userName: username,
      page: 'dashboard',
    });
  }

  session.destroy();
  return NextResponse.json({ ok: true });
}
