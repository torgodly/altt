import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const defaultPath = path.join(process.cwd(), 'data', 'clinic.db');

function getDbPath() {
  return process.env.DATABASE_PATH
    ? path.isAbsolute(process.env.DATABASE_PATH)
      ? process.env.DATABASE_PATH
      : path.join(process.cwd(), process.env.DATABASE_PATH)
    : defaultPath;
}

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dbPath = getDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
