import { getDb } from './client';
import { ensureMigrations } from './migrate';
import type { MedicalHistory, Odontogram } from '@/lib/types';

ensureMigrations();

export interface PatientRow {
  id: string;
  file_number: string;
  file_date: string;
  full_name: string;
  national_id: string | null;
  national_number: string | null;
  dob: string | null;
  gender: string;
  address: string | null;
  patient_notes: string | null;
  phone: string;
  additional_phone: string;
  emergency_name: string | null;
  emergency_phone: string | null;
  marital_status: string | null;
  edu_status: string | null;
  blood_type: string | null;
  medical_history: string;
  has_insurance: string;
  insurance_company: string | null;
  insurance_card_no: string | null;
  odontogram: string;
  doctor_id: string | null;
  doctor_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DoctorRow {
  id: string;
  name: string;
  specialty: string | null;
  phone: string | null;
  active: number;
  created_at: string;
}

export interface FollowUpRow {
  id: string;
  patient_id: string;
  date: string;
  day_name: string | null;
  time: string;
  time_12: string | null;
  procedure: string;
  doctor_notes: string | null;
  created_at: string;
}

export interface AttachmentRow {
  id: string;
  patient_id: string;
  name: string;
  mime_type: string;
  size: number;
  data_base64: string;
  uploaded_at: string;
}

export interface AuditLogRow {
  id: string;
  iso_timestamp: string;
  timestamp: string;
  user_name: string;
  action: string;
  action_type: string;
  icon: string | null;
  label: string | null;
  color: string | null;
  patient_id: string | null;
  details: string | null;
  page: string | null;
  created_at: string;
}

export interface AdminUserRow {
  id: number;
  username: string;
  password_hash: string;
  is_super_admin: number;
  created_at: string;
}

export function getNextFileNumber(): string {
  ensureMigrations();
  const db = getDb();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('file_seq') as {
    value: string;
  };
  const seq = parseInt(row.value, 10);
  const year = new Date().getFullYear();
  return `DENT-${year}-${seq}`;
}

export function incrementFileSeq() {
  ensureMigrations();
  const db = getDb();
  db.prepare(
    `UPDATE settings SET value = CAST(CAST(value AS INTEGER) + 1 AS TEXT) WHERE key = 'file_seq'`
  ).run();
}

export function rowToPatient(row: PatientRow, followUps: FollowUpRow[] = [], doctorName?: string) {
  return {
    id: row.id,
    fileNumber: row.file_number,
    fileDate: row.file_date,
    fullName: row.full_name,
    nationalId: row.national_id || '',
    nationalNumber: row.national_number || '',
    dob: row.dob || '',
    gender: row.gender,
    address: row.address || '',
    patientNotes: row.patient_notes || '',
    phone: row.phone,
    additionalPhone: row.additional_phone,
    emergencyName: row.emergency_name || '',
    emergencyPhone: row.emergency_phone || '',
    maritalStatus: row.marital_status || '',
    eduStatus: row.edu_status || '',
    bloodType: row.blood_type || '',
    medicalHistory: JSON.parse(row.medical_history || '{}') as MedicalHistory,
    hasInsurance: row.has_insurance,
    insuranceCompany: row.insurance_company || '',
    insuranceCardNo: row.insurance_card_no || '',
    odontogram: JSON.parse(row.odontogram || '{}') as Odontogram,
    doctorId: row.doctor_id || null,
    doctorName: doctorName || '',
    doctorNotes: row.doctor_notes || '',
    followUps: followUps.map(rowToFollowUp),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function rowToDoctor(row: DoctorRow) {
  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty || '',
    phone: row.phone || '',
    active: row.active === 1,
    createdAt: row.created_at,
  };
}

export function getDoctorNameMap(): Map<string, string> {
  ensureMigrations();
  const db = getDb();
  const doctors = db.prepare('SELECT id, name FROM doctors WHERE active = 1').all() as {
    id: string;
    name: string;
  }[];
  return new Map(doctors.map((d) => [d.id, d.name]));
}

export function rowToFollowUp(row: FollowUpRow) {
  return {
    id: row.id,
    date: row.date,
    dayName: row.day_name || '',
    time: row.time,
    time12: row.time_12 || '',
    procedure: row.procedure,
    doctorNotes: row.doctor_notes || '',
    createdAt: row.created_at,
  };
}

export function rowToAttachment(row: AttachmentRow) {
  return {
    id: row.id,
    patientId: row.patient_id,
    name: row.name,
    type: row.mime_type,
    size: row.size,
    dataUrl: row.data_base64.startsWith('data:')
      ? row.data_base64
      : `data:${row.mime_type};base64,${row.data_base64}`,
    uploadedAt: row.uploaded_at,
  };
}

export function rowToAuditLog(row: AuditLogRow) {
  return {
    id: row.id,
    isoTimestamp: row.iso_timestamp,
    timestamp: row.timestamp,
    user: row.user_name,
    action: row.action,
    actionType: row.action_type,
    icon: row.icon,
    label: row.label,
    color: row.color,
    patientId: row.patient_id || 'N/A',
    details: row.details || '',
    page: row.page || '',
  };
}

export { ensureMigrations, getDb };
