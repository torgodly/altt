import { NextRequest, NextResponse } from 'next/server';
import { getAuditLogs, clearAuditLogs } from '@/lib/audit';
import { rowToAuditLog } from '@/lib/db/index';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const filter = new URL(request.url).searchParams.get('filter') || 'all';
    const logs = getAuditLogs(filter === 'all' ? undefined : filter);
    return NextResponse.json({ logs: logs.map(rowToAuditLog) });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await requireAuth();
    clearAuditLogs(user.username);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to clear audit logs' }, { status: 500 });
  }
}
