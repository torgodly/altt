import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ensureMigrations, getDb, type AdminUserRow } from '@/lib/db/index';
import { requireSuperAdmin } from '@/lib/auth';
import { addAuditLog } from '@/lib/audit';
import { createUserSchema } from '@/lib/validation';

export async function GET() {
  try {
    await requireSuperAdmin();
    ensureMigrations();
    const db = getDb();

    const users = db
      .prepare('SELECT id, username, is_super_admin, created_at FROM admin_users ORDER BY created_at ASC')
      .all() as Omit<AdminUserRow, 'password_hash'>[];

    return NextResponse.json({ users });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin();
    ensureMigrations();
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    const { username, password } = parsed.data;
    const db = getDb();

    const existing = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(username);
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    const hash = bcrypt.hashSync(password, 12);
    db.prepare(
      'INSERT INTO admin_users (username, password_hash, is_super_admin) VALUES (?, ?, 0)'
    ).run(username, hash);

    addAuditLog({
      action: 'Added Admin User',
      details: `تمّ إضافة مستخدم جديد: ${username}`,
      actionType: 'system',
      userName: admin.username,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await requireSuperAdmin();
    ensureMigrations();
    const username = new URL(request.url).searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'username required' }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username) as
      | AdminUserRow
      | undefined;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.is_super_admin === 1) {
      return NextResponse.json({ error: 'Cannot delete super admin' }, { status: 403 });
    }

    db.prepare('DELETE FROM admin_users WHERE username = ?').run(username);

    addAuditLog({
      action: 'Deleted Admin User',
      details: `تمّ حذف المستخدم: ${username}`,
      actionType: 'system',
      userName: admin.username,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
