import { NextRequest, NextResponse } from 'next/server';
import {
  ensureMigrations,
  getDb,
  rowToPatient,
  rowToAttachment,
  type PatientRow,
  type FollowUpRow,
  type AttachmentRow,
} from '@/lib/db/index';
import { requireAuth } from '@/lib/auth';
import { addAuditLog } from '@/lib/audit';
import { updatePatientSchema } from '@/lib/validation';

type RouteContext = { params: Promise<{ id: string }> };

function getPatientWithRelations(id: string) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(id) as PatientRow | undefined;
  if (!row) return null;

  const followUps = db
    .prepare('SELECT * FROM follow_ups WHERE patient_id = ? ORDER BY created_at ASC')
    .all(id) as FollowUpRow[];

  const attachments = db
    .prepare('SELECT * FROM attachments WHERE patient_id = ? ORDER BY uploaded_at DESC')
    .all(id) as AttachmentRow[];

  return {
    patient: rowToPatient(row, followUps),
    attachments: attachments.map(rowToAttachment),
  };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    ensureMigrations();
    const { id } = await context.params;
    const result = getPatientWithRelations(id);

    if (!result) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    ensureMigrations();
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updatePatientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const db = getDb();
    const existing = db.prepare('SELECT * FROM patients WHERE id = ?').get(id) as PatientRow | undefined;

    if (!existing) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const data = parsed.data;
    const updates: string[] = [];
    const values: Record<string, unknown> = { id };

    const fieldMap: Record<string, string> = {
      fullName: 'full_name',
      nationalId: 'national_id',
      nationalNumber: 'national_number',
      dob: 'dob',
      gender: 'gender',
      address: 'address',
      patientNotes: 'patient_notes',
      phone: 'phone',
      additionalPhone: 'additional_phone',
      emergencyName: 'emergency_name',
      emergencyPhone: 'emergency_phone',
      maritalStatus: 'marital_status',
      eduStatus: 'edu_status',
      bloodType: 'blood_type',
      hasInsurance: 'has_insurance',
      insuranceCompany: 'insurance_company',
      insuranceCardNo: 'insurance_card_no',
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (data[key as keyof typeof data] !== undefined) {
        updates.push(`${col} = @${col}`);
        values[col] = data[key as keyof typeof data];
      }
    }

    if (data.medicalHistory !== undefined) {
      updates.push('medical_history = @medical_history');
      values.medical_history = JSON.stringify(data.medicalHistory);
    }

    if (data.odontogram !== undefined) {
      updates.push('odontogram = @odontogram');
      values.odontogram = JSON.stringify(data.odontogram);
    }

    updates.push("updated_at = datetime('now')");

    db.prepare(`UPDATE patients SET ${updates.join(', ')} WHERE id = @id`).run(values);

    addAuditLog({
      action: 'Edited Patient Record',
      patientId: existing.file_number,
      details: `Updated complete details for ${data.fullName || existing.full_name}`,
      actionType: 'edit',
      userName: user.username,
    });

    const result = getPatientWithRelations(id);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireAuth();
    ensureMigrations();
    const { id } = await context.params;
    const db = getDb();

    const existing = db.prepare('SELECT * FROM patients WHERE id = ?').get(id) as PatientRow | undefined;

    if (!existing) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    db.prepare('DELETE FROM patients WHERE id = ?').run(id);

    addAuditLog({
      action: 'Deleted Patient Record',
      patientId: existing.file_number,
      details: `تم حذف ملف المريض: ${existing.full_name} - هاتف: ${existing.phone}`,
      actionType: 'delete',
      userName: user.username,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 });
  }
}
