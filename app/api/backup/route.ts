import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import {
  ensureMigrations,
  getDb,
  rowToPatient,
  rowToAuditLog,
  type PatientRow,
  type FollowUpRow,
  type AuditLogRow,
} from '@/lib/db/index';
import { requireAuth, requireSuperAdmin } from '@/lib/auth';
import { addAuditLog } from '@/lib/audit';
import { createUserSchema } from '@/lib/validation';

export async function GET() {
  try {
    await requireAuth();
    ensureMigrations();
    const db = getDb();

    const patients = db.prepare('SELECT * FROM patients ORDER BY created_at DESC').all() as PatientRow[];
    const followUps = db.prepare('SELECT * FROM follow_ups ORDER BY created_at ASC').all() as FollowUpRow[];
    const auditLogs = db
      .prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 500')
      .all() as AuditLogRow[];

    const followUpsByPatient = new Map<string, FollowUpRow[]>();
    for (const fu of followUps) {
      const list = followUpsByPatient.get(fu.patient_id) || [];
      list.push(fu);
      followUpsByPatient.set(fu.patient_id, list);
    }

    const data = {
      patients: patients.map((p) => rowToPatient(p, followUpsByPatient.get(p.id) || [])),
      auditLogs: auditLogs.map(rowToAuditLog),
      exportedAt: new Date().toISOString(),
      version: '2.0',
    };

    addAuditLog({
      action: 'Exported System Backup',
      details: 'Exported JSON data file',
      actionType: 'backup',
      userName: (await requireAuth()).username,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Backup failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    ensureMigrations();
    const body = await request.json();
    const { patients, auditLogs } = body;

    if (!patients || !Array.isArray(patients)) {
      return NextResponse.json({ error: 'Invalid backup format' }, { status: 400 });
    }

    const db = getDb();

    db.transaction(() => {
      db.prepare('DELETE FROM follow_ups').run();
      db.prepare('DELETE FROM attachments').run();
      db.prepare('DELETE FROM patients').run();

      const insertPatient = db.prepare(
        `INSERT INTO patients (
          id, file_number, file_date, full_name, national_id, national_number,
          dob, gender, address, patient_notes, phone, additional_phone,
          emergency_name, emergency_phone, marital_status, edu_status, blood_type,
          medical_history, has_insurance, insurance_company, insurance_card_no,
          odontogram, created_at, updated_at
        ) VALUES (
          @id, @file_number, @file_date, @full_name, @national_id, @national_number,
          @dob, @gender, @address, @patient_notes, @phone, @additional_phone,
          @emergency_name, @emergency_phone, @marital_status, @edu_status, @blood_type,
          @medical_history, @has_insurance, @insurance_company, @insurance_card_no,
          @odontogram, @created_at, @updated_at
        )`
      );

      const insertFollowUp = db.prepare(
        `INSERT INTO follow_ups (
          id, patient_id, date, day_name, time, time_12, procedure, doctor_notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );

      for (const p of patients) {
        insertPatient.run({
          id: p.id,
          file_number: p.fileNumber,
          file_date: p.fileDate,
          full_name: p.fullName,
          national_id: p.nationalId || null,
          national_number: p.nationalNumber || null,
          dob: p.dob || null,
          gender: p.gender,
          address: p.address || null,
          patient_notes: p.patientNotes || null,
          phone: p.phone,
          additional_phone: p.additionalPhone,
          emergency_name: p.emergencyName || null,
          emergency_phone: p.emergencyPhone || null,
          marital_status: p.maritalStatus || null,
          edu_status: p.eduStatus || null,
          blood_type: p.bloodType || null,
          medical_history: JSON.stringify(p.medicalHistory || {}),
          has_insurance: p.hasInsurance || 'No',
          insurance_company: p.insuranceCompany || null,
          insurance_card_no: p.insuranceCardNo || null,
          odontogram: JSON.stringify(p.odontogram || {}),
          created_at: p.createdAt || new Date().toISOString(),
          updated_at: p.updatedAt || new Date().toISOString(),
        });

        for (const fu of p.followUps || []) {
          insertFollowUp.run(
            fu.id,
            p.id,
            fu.date,
            fu.dayName || null,
            fu.time,
            fu.time12 || null,
            fu.procedure,
            fu.doctorNotes || null,
            fu.createdAt || new Date().toISOString()
          );
        }
      }

      if (auditLogs && Array.isArray(auditLogs)) {
        db.prepare('DELETE FROM audit_logs').run();
        const insertLog = db.prepare(
          `INSERT INTO audit_logs (
            id, iso_timestamp, timestamp, user_name, action, action_type,
            icon, label, color, patient_id, details, page
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        );

        for (const l of auditLogs.slice(0, 500)) {
          insertLog.run(
            l.id,
            l.isoTimestamp || new Date().toISOString(),
            l.timestamp || '',
            l.user || 'system',
            l.action,
            l.actionType || 'system',
            l.icon || null,
            l.label || null,
            l.color || null,
            l.patientId || 'N/A',
            l.details || '',
            l.page || ''
          );
        }
      }
    })();

    addAuditLog({
      action: 'Restored System Backup',
      details: `Restored ${patients.length} patient records`,
      actionType: 'restore',
      userName: user.username,
    });

    return NextResponse.json({ ok: true, count: patients.length });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Restore failed' }, { status: 500 });
  }
}
