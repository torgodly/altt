import { NextRequest, NextResponse } from 'next/server';
import { ensureMigrations, getDb, rowToDoctor, type DoctorRow } from '@/lib/db/index';
import { requireAuth } from '@/lib/auth';
import { addAuditLog } from '@/lib/audit';
import { createDoctorSchema, updateDoctorSchema } from '@/lib/validation';

export async function GET() {
  try {
    await requireAuth();
    ensureMigrations();
    const db = getDb();
    const doctors = db
      .prepare('SELECT * FROM doctors ORDER BY name ASC')
      .all() as DoctorRow[];
    return NextResponse.json({ doctors: doctors.map(rowToDoctor) });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    ensureMigrations();
    const body = await request.json();
    const parsed = createDoctorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, specialty, phone } = parsed.data;
    const db = getDb();
    const id = 'doc_' + Date.now();

    db.prepare(
      `INSERT INTO doctors (id, name, specialty, phone, active) VALUES (?, ?, ?, ?, 1)`
    ).run(id, name.trim(), specialty?.trim() || null, phone?.trim() || null);

    addAuditLog({
      action: 'Added Doctor',
      details: `Doctor added: ${name}`,
      actionType: 'system',
      userName: user.username,
    });

    const row = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id) as DoctorRow;
    return NextResponse.json({ doctor: rowToDoctor(row) }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to create doctor' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    ensureMigrations();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const body = await request.json();
    const parsed = updateDoctorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id) as DoctorRow | undefined;
    if (!existing) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });

    const data = parsed.data;
    db.prepare(
      `UPDATE doctors SET
        name = COALESCE(?, name),
        specialty = COALESCE(?, specialty),
        phone = COALESCE(?, phone),
        active = COALESCE(?, active)
      WHERE id = ?`
    ).run(
      data.name?.trim() ?? null,
      data.specialty?.trim() ?? null,
      data.phone?.trim() ?? null,
      data.active !== undefined ? (data.active ? 1 : 0) : null,
      id
    );

    addAuditLog({
      action: 'Updated Doctor',
      details: `Doctor updated: ${data.name || existing.name}`,
      actionType: 'system',
      userName: user.username,
    });

    const row = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id) as DoctorRow;
    return NextResponse.json({ doctor: rowToDoctor(row) });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update doctor' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    ensureMigrations();
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const db = getDb();
    const existing = db.prepare('SELECT * FROM doctors WHERE id = ?').get(id) as DoctorRow | undefined;
    if (!existing) return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });

    db.prepare('UPDATE patients SET doctor_id = NULL WHERE doctor_id = ?').run(id);
    db.prepare('DELETE FROM doctors WHERE id = ?').run(id);

    addAuditLog({
      action: 'Deleted Doctor',
      details: `Doctor deleted: ${existing.name}`,
      actionType: 'system',
      userName: user.username,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete doctor' }, { status: 500 });
  }
}
