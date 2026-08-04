import { NextRequest, NextResponse } from 'next/server';
import {
  ensureMigrations,
  getDb,
  getNextFileNumber,
  incrementFileSeq,
  rowToPatient,
  type PatientRow,
  type FollowUpRow,
} from '@/lib/db/index';
import { requireAuth } from '@/lib/auth';
import { addAuditLog } from '@/lib/audit';
import { createPatientSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    ensureMigrations();
    const db = getDb();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.toLowerCase() || '';
    const gender = searchParams.get('gender') || '';
    const insurance = searchParams.get('insurance') || '';
    const followupFilter = searchParams.get('followup') || 'all';

    let patients = db
      .prepare('SELECT * FROM patients ORDER BY created_at DESC')
      .all() as PatientRow[];

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const currentMonth = today.substring(0, 7);

    const allFollowUps = db.prepare('SELECT * FROM follow_ups ORDER BY created_at ASC').all() as FollowUpRow[];
    const followUpsByPatient = new Map<string, FollowUpRow[]>();
    for (const fu of allFollowUps) {
      const list = followUpsByPatient.get(fu.patient_id) || [];
      list.push(fu);
      followUpsByPatient.set(fu.patient_id, list);
    }

    let mapped = patients.map((p) =>
      rowToPatient(p, followUpsByPatient.get(p.id) || [])
    );

    if (search) {
      mapped = mapped.filter(
        (p) =>
          p.fileNumber.toLowerCase().includes(search) ||
          p.fullName.toLowerCase().includes(search) ||
          p.phone.includes(search) ||
          p.nationalNumber.includes(search)
      );
    }

    if (gender) mapped = mapped.filter((p) => p.gender === gender);
    if (insurance) mapped = mapped.filter((p) => p.hasInsurance === insurance);

    if (followupFilter !== 'all') {
      mapped = mapped.filter((p) => {
        const fus = p.followUps || [];
        const latest = fus.length > 0 ? fus[fus.length - 1] : null;
        switch (followupFilter) {
          case 'followups_only':
            return fus.length > 0;
          case 'followups_added_today':
            return fus.some((f) => f.createdAt.startsWith(today));
          case 'followups_added_yesterday':
            return fus.some((f) => f.createdAt.startsWith(yesterday));
          case 'appointment_today':
            return latest?.date === today;
          case 'appointment_tomorrow':
            return latest?.date === tomorrow;
          default:
            return true;
        }
      });
    }

    const stats = {
      total: patients.length,
      today: patients.filter((p) => p.file_date === today).length,
      month: patients.filter((p) => p.file_date.startsWith(currentMonth)).length,
      recent: Math.min(patients.length, 5),
      followUps: patients.filter((p) => (followUpsByPatient.get(p.id)?.length || 0) > 0).length,
    };

    return NextResponse.json({ patients: mapped, stats });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    ensureMigrations();
    const body = await request.json();
    const parsed = createPatientSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const db = getDb();
    const fileNumber = getNextFileNumber();
    const id = 'patient_' + Date.now();
    const fileDate = data.fileDate || new Date().toISOString().split('T')[0];

    db.prepare(
      `INSERT INTO patients (
        id, file_number, file_date, full_name, national_id, national_number,
        dob, gender, address, patient_notes, phone, additional_phone,
        emergency_name, emergency_phone, marital_status, edu_status, blood_type,
        medical_history, has_insurance, insurance_company, insurance_card_no
      ) VALUES (
        @id, @file_number, @file_date, @full_name, @national_id, @national_number,
        @dob, @gender, @address, @patient_notes, @phone, @additional_phone,
        @emergency_name, @emergency_phone, @marital_status, @edu_status, @blood_type,
        @medical_history, @has_insurance, @insurance_company, @insurance_card_no
      )`
    ).run({
      id,
      file_number: fileNumber,
      file_date: fileDate,
      full_name: data.fullName,
      national_id: data.nationalId || null,
      national_number: data.nationalNumber || null,
      dob: data.dob || null,
      gender: data.gender,
      address: data.address || null,
      patient_notes: data.patientNotes || null,
      phone: data.phone,
      additional_phone: data.additionalPhone,
      emergency_name: data.emergencyName || null,
      emergency_phone: data.emergencyPhone || null,
      marital_status: data.maritalStatus || null,
      edu_status: data.eduStatus || null,
      blood_type: data.bloodType || null,
      medical_history: JSON.stringify(data.medicalHistory || {}),
      has_insurance: data.hasInsurance || 'No',
      insurance_company: data.insuranceCompany || null,
      insurance_card_no: data.insuranceCardNo || null,
    });

    incrementFileSeq();

    addAuditLog({
      action: 'Registered New Patient',
      patientId: fileNumber,
      details: `Patient: ${data.fullName}`,
      actionType: 'register',
    });

    const row = db.prepare('SELECT * FROM patients WHERE id = ?').get(id) as PatientRow;
    return NextResponse.json({ patient: rowToPatient(row, []) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
  }
}
