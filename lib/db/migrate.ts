import bcrypt from 'bcryptjs';
import { getDb } from './client';
import { getSuperAdminUsername, getSuperAdminPassword } from '@/lib/constants';

function addColumnIfNotExists(
  db: ReturnType<typeof getDb>,
  table: string,
  column: string,
  definition: string
) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

export function runMigrations() {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      is_super_admin INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      specialty TEXT,
      phone TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      file_number TEXT NOT NULL UNIQUE,
      file_date TEXT NOT NULL,
      full_name TEXT NOT NULL,
      national_id TEXT,
      national_number TEXT,
      dob TEXT,
      gender TEXT NOT NULL,
      address TEXT,
      patient_notes TEXT,
      phone TEXT NOT NULL,
      additional_phone TEXT NOT NULL,
      emergency_name TEXT,
      emergency_phone TEXT,
      marital_status TEXT,
      edu_status TEXT,
      blood_type TEXT,
      medical_history TEXT NOT NULL DEFAULT '{}',
      has_insurance TEXT NOT NULL DEFAULT 'No',
      insurance_company TEXT,
      insurance_card_no TEXT,
      odontogram TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS follow_ups (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      day_name TEXT,
      time TEXT NOT NULL,
      time_12 TEXT,
      procedure TEXT NOT NULL,
      doctor_notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS attachments (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      data_base64 TEXT NOT NULL,
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      iso_timestamp TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      action_type TEXT NOT NULL,
      icon TEXT,
      label TEXT,
      color TEXT,
      patient_id TEXT,
      details TEXT,
      page TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_patients_file_number ON patients(file_number);
    CREATE INDEX IF NOT EXISTS idx_patients_full_name ON patients(full_name);
    CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
    CREATE INDEX IF NOT EXISTS idx_follow_ups_patient_id ON follow_ups(patient_id);
    CREATE INDEX IF NOT EXISTS idx_follow_ups_date ON follow_ups(date);
    CREATE INDEX IF NOT EXISTS idx_attachments_patient_id ON attachments(patient_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_doctors_name ON doctors(name);
  `);

  addColumnIfNotExists(db, 'patients', 'doctor_id', 'TEXT REFERENCES doctors(id)');
  addColumnIfNotExists(db, 'patients', 'doctor_notes', 'TEXT');

  db.exec(`CREATE INDEX IF NOT EXISTS idx_patients_doctor_id ON patients(doctor_id)`);

  const seqRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('file_seq') as
    | { value: string }
    | undefined;

  if (!seqRow) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('file_seq', '1001');
  }

  const userCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get() as {
    count: number;
  };

  if (userCount.count === 0) {
    const username = getSuperAdminUsername();
    const password = getSuperAdminPassword();
    const hash = bcrypt.hashSync(password, 12);

    db.prepare(
      'INSERT INTO admin_users (username, password_hash, is_super_admin) VALUES (?, ?, 1)'
    ).run(username, hash);
  } else {
    // Ensure the designated super-admin account exists with current credentials
    const username = getSuperAdminUsername();
    const password = getSuperAdminPassword();
    const hash = bcrypt.hashSync(password, 12);
    const existing = db.prepare('SELECT id FROM admin_users WHERE username = ?').get(username) as
      | { id: number }
      | undefined;

    if (!existing) {
      db.prepare(
        'INSERT INTO admin_users (username, password_hash, is_super_admin) VALUES (?, ?, 1)'
      ).run(username, hash);
    }
  }

  const doctorCount = db.prepare('SELECT COUNT(*) as count FROM doctors').get() as { count: number };
  if (doctorCount.count === 0) {
    db.prepare(
      `INSERT INTO doctors (id, name, specialty, phone, active) VALUES (?, ?, ?, ?, 1)`
    ).run('doc_default', 'Dr. Assad Matoug', 'General Dentistry', '');
  }
}

let migrated = false;

export function ensureMigrations() {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return;
  }
  if (!migrated) {
    runMigrations();
    migrated = true;
  }
}
