import { NextRequest, NextResponse } from 'next/server';
import {
  ensureMigrations,
  getDb,
  rowToAttachment,
  type AttachmentRow,
  type PatientRow,
} from '@/lib/db/index';
import { requireAuth } from '@/lib/auth';
import { addAuditLog } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    ensureMigrations();
    const patientId = new URL(request.url).searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json({ error: 'patientId required' }, { status: 400 });
    }

    const db = getDb();
    const attachments = db
      .prepare('SELECT * FROM attachments WHERE patient_id = ? ORDER BY uploaded_at DESC')
      .all(patientId) as AttachmentRow[];

    return NextResponse.json({ attachments: attachments.map(rowToAttachment) });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch attachments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    ensureMigrations();
    const body = await request.json();
    const { patientId, name, type, size, dataUrl } = body;

    if (!patientId || !name || !dataUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDb();
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId) as
      | PatientRow
      | undefined;

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const id = 'file_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

    db.prepare(
      `INSERT INTO attachments (id, patient_id, name, mime_type, size, data_base64)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, patientId, name, type || 'application/octet-stream', size || 0, dataUrl);

    addAuditLog({
      action: 'Uploaded Attachment',
      patientId: patient.file_number,
      details: `File: ${name}`,
      actionType: 'attach',
      userName: user.username,
    });

    const row = db.prepare('SELECT * FROM attachments WHERE id = ?').get(id) as AttachmentRow;
    return NextResponse.json({ attachment: rowToAttachment(row) }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to upload attachment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    ensureMigrations();
    const id = new URL(request.url).searchParams.get('id');
    const patientId = new URL(request.url).searchParams.get('patientId');

    if (!id) {
      return NextResponse.json({ error: 'id required' }, { status: 400 });
    }

    const db = getDb();
    const patient = patientId
      ? (db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId) as PatientRow | undefined)
      : undefined;

    db.prepare('DELETE FROM attachments WHERE id = ?').run(id);

    addAuditLog({
      action: 'Deleted Attachment',
      patientId: patient?.file_number || patientId || 'N/A',
      details: `حذف مرفق للمريض: ${patient?.full_name || patientId}`,
      actionType: 'attach',
      userName: user.username,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to delete attachment' }, { status: 500 });
  }
}
