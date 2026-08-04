import { NextRequest, NextResponse } from 'next/server';
import { ensureMigrations, getDb } from '@/lib/db/index';
import { requireAuth } from '@/lib/auth';
import { addAuditLog } from '@/lib/audit';
import { followUpSchema } from '@/lib/validation';
import { formatTimeTo12Hour, getDayNameFromDate } from '@/lib/utils';
import type { PatientRow } from '@/lib/db/index';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    ensureMigrations();
    const body = await request.json();
    const parsed = followUpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { patientId, date, time, procedure, doctorNotes } = parsed.data;
    const db = getDb();

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId) as
      | PatientRow
      | undefined;

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const id = 'fu_' + Date.now();
    const dayName = getDayNameFromDate(date);
    const time12 = formatTimeTo12Hour(time);

    db.prepare(
      `INSERT INTO follow_ups (
        id, patient_id, date, day_name, time, time_12, procedure, doctor_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, patientId, date, dayName, time, time12, procedure, doctorNotes || null);

    addAuditLog({
      action: 'Saved Follow-up',
      patientId: patient.file_number,
      details: `Recorded follow-up visit on ${date} (${time12}) - ${procedure}`,
      actionType: 'followup',
      userName: user.username,
    });

    const followUp = db.prepare('SELECT * FROM follow_ups WHERE id = ?').get(id);
    return NextResponse.json({ followUp }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to create follow-up' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    ensureMigrations();
    const { searchParams } = new URL(request.url);
    const followUpId = searchParams.get('id');
    const patientId = searchParams.get('patientId');

    if (!followUpId || !patientId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const db = getDb();
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId) as
      | PatientRow
      | undefined;

    const fu = db.prepare('SELECT * FROM follow_ups WHERE id = ? AND patient_id = ?').get(
      followUpId,
      patientId
    ) as { date: string; procedure: string } | undefined;

    if (!fu) {
      return NextResponse.json({ error: 'Follow-up not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM follow_ups WHERE id = ?').run(followUpId);

    addAuditLog({
      action: 'Deleted Follow-up Entry',
      patientId: patient?.file_number || patientId,
      details: `حذف متابعة | التاريخ: ${fu.date} | الإجراء: ${fu.procedure}`,
      actionType: 'delete',
      userName: user.username,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete follow-up' }, { status: 500 });
  }
}
