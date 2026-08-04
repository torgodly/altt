import {
  ensureMigrations,
  getDb,
  type AuditLogRow,
} from '@/lib/db/index';
import { ACTION_TYPE_META, detectActionType } from '@/lib/utils';

export function addAuditLog(params: {
  action: string;
  patientId?: string;
  details?: string;
  actionType?: string;
  userName?: string;
  page?: string;
}) {
  ensureMigrations();
  const db = getDb();

  const actionType = params.actionType || detectActionType(params.action);
  const meta = ACTION_TYPE_META[actionType] || ACTION_TYPE_META.system;
  const now = new Date();

  const logItem = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    iso_timestamp: now.toISOString(),
    timestamp: now.toLocaleString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    user_name: params.userName || 'مريض / نظام',
    action: params.action,
    action_type: actionType,
    icon: meta.icon,
    label: meta.label,
    color: meta.color,
    patient_id: params.patientId || 'N/A',
    details: params.details || '',
    page: params.page || '',
  };

  db.prepare(
    `INSERT INTO audit_logs (
      id, iso_timestamp, timestamp, user_name, action, action_type,
      icon, label, color, patient_id, details, page
    ) VALUES (
      @id, @iso_timestamp, @timestamp, @user_name, @action, @action_type,
      @icon, @label, @color, @patient_id, @details, @page
    )`
  ).run(logItem);

  // Keep max 500 logs
  db.prepare(
    `DELETE FROM audit_logs WHERE id NOT IN (
      SELECT id FROM audit_logs ORDER BY created_at DESC LIMIT 500
    )`
  ).run();

  return logItem;
}

export function getAuditLogs(filterType?: string): AuditLogRow[] {
  ensureMigrations();
  const db = getDb();

  if (filterType && filterType !== 'all') {
    return db
      .prepare(
        'SELECT * FROM audit_logs WHERE action_type = ? ORDER BY created_at DESC LIMIT 500'
      )
      .all(filterType) as AuditLogRow[];
  }

  return db
    .prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 500')
    .all() as AuditLogRow[];
}

export function clearAuditLogs(userName: string) {
  ensureMigrations();
  const db = getDb();
  db.prepare('DELETE FROM audit_logs').run();
  addAuditLog({
    action: 'Cleared Audit Log',
    details: 'تم مسح سجل التدقيق بالكامل',
    actionType: 'system',
    userName,
  });
}
