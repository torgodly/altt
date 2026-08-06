import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const defaultPath = path.join(process.cwd(), 'data', 'clinic.db');

function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

function getDbPath() {
  return process.env.DATABASE_PATH
    ? path.isAbsolute(process.env.DATABASE_PATH)
      ? process.env.DATABASE_PATH
      : path.join(process.cwd(), process.env.DATABASE_PATH)
    : defaultPath;
}

function removeSidecarFiles(dbPath: string) {
  for (const suffix of ['-wal', '-shm']) {
    try {
      fs.unlinkSync(`${dbPath}${suffix}`);
    } catch {
      // ignore missing sidecars
    }
  }
}

function openDatabase(dbPath: string): Database.Database {
  const existedBefore = fs.existsSync(dbPath);

  // Orphan WAL/SHM files (e.g. committed without the main db) cause SQLITE_CORRUPT.
  if (!existedBefore) {
    removeSidecarFiles(dbPath);
  }

  try {
    const instance = new Database(dbPath);
    instance.pragma('journal_mode = WAL');
    instance.pragma('foreign_keys = ON');

    const check = instance.pragma('quick_check', { simple: true });
    if (check !== 'ok') {
      instance.close();
      throw Object.assign(new Error('Database integrity check failed'), { code: 'SQLITE_CORRUPT' });
    }

    return instance;
  } catch (error) {
    const code =
      error instanceof Error && 'code' in error
        ? String((error as Error & { code?: string }).code)
        : '';

    // Only auto-recover on fresh deploys (no existing db file).
    if (code !== 'SQLITE_CORRUPT' || existedBefore) {
      throw error;
    }

    removeSidecarFiles(dbPath);
    try {
      fs.unlinkSync(dbPath);
    } catch {
      // ignore
    }

    const instance = new Database(dbPath);
    instance.pragma('journal_mode = WAL');
    instance.pragma('foreign_keys = ON');
    return instance;
  }
}

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (isBuildPhase()) {
    throw new Error('Database is not available during production build');
  }

  if (db) return db;

  const dbPath = getDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  db = openDatabase(dbPath);

  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
