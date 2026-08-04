import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { ensureMigrations, getDb, type AdminUserRow } from '@/lib/db/index';
import { addAuditLog } from '@/lib/audit';
import { loginSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    ensureMigrations();
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
    }

    const { username, password } = parsed.data;
    const db = getDb();

    const user = db
      .prepare('SELECT * FROM admin_users WHERE username = ?')
      .get(username) as AdminUserRow | undefined;

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const session = await getSession();
    session.user = {
      username: user.username,
      isSuperAdmin: user.is_super_admin === 1,
    };
    await session.save();

    addAuditLog({
      action: 'Admin Login',
      details: `User logged in: ${username}`,
      actionType: 'login',
      userName: username,
      page: 'login',
    });

    return NextResponse.json({
      user: session.user,
    });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
