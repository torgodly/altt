'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/components/AppProvider';
import { Header } from '@/components/Header';
import { t } from '@/lib/i18n';
import { formatTimeTo12Hour, getDayNameFromDate, escapeHtml } from '@/lib/utils';
import { printPatientFile } from '@/lib/print-patient';
import { FOLLOWUP_PROCEDURES } from '@/lib/constants';
import type { Patient, Attachment, AuditLog, SessionUser, FollowUp, Doctor } from '@/lib/types';

interface Stats {
  total: number;
  today: number;
  month: number;
  recent: number;
  followUps: number;
}

const TOOTH_STATES = ['healthy', 'caries', 'filled', 'crown', 'extracted', 'implant'] as const;

const MED_KEYS = [
  'qChronic', 'qMeds', 'qAllergies', 'qRegularTreatment', 'qSurgeries', 'qExtraction',
  'qThyroid', 'qPressure', 'qDiabetes', 'qHeart', 'qKidneyLiver', 'qBloodThinner',
  'qAnesthesiaAllergy', 'qPregnancy',
] as const;

export function AdminDashboard() {
  const { lang, showToast } = useApp();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0, month: 0, recent: 0, followUps: 0 });
  const [search, setSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [insurance, setInsurance] = useState('');
  const [followupFilter, setFollowupFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [modal, setModal] = useState<'view' | 'edit' | 'followup' | 'audit' | 'users' | 'doctors' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditFilter, setAuditFilter] = useState('all');
  const [adminUsers, setAdminUsers] = useState<{ username: string; is_super_admin: number }[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const loadPatients = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (doctorFilter) params.set('doctor', doctorFilter);
    if (insurance) params.set('insurance', insurance);
    if (followupFilter) params.set('followup', followupFilter);

    const res = await fetch(`/api/patients?${params}`);
    if (res.status === 401) {
      router.replace('/admin/login');
      return;
    }
    const data = await res.json();
    setPatients(data.patients || []);
    setStats(data.stats || { total: 0, today: 0, month: 0, recent: 0, followUps: 0 });
  }, [search, doctorFilter, insurance, followupFilter, router]);

  const loadDoctors = useCallback(async () => {
    const res = await fetch('/api/doctors');
    if (res.ok) {
      const data = await res.json();
      setDoctors(data.doctors || []);
    }
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d.user) router.replace('/admin/login');
        else setUser(d.user);
      });
  }, [router]);

  useEffect(() => {
    if (user) {
      loadPatients();
      loadDoctors();
    }
  }, [user, loadPatients, loadDoctors]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  async function openPatient(id: string, mode: 'view' | 'edit' | 'followup') {
    const res = await fetch(`/api/patients/${id}`);
    const data = await res.json();
    setActivePatient(data.patient);
    setAttachments(data.attachments || []);
    setModal(mode);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/patients/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleting(false);
    if (res.ok) {
      showToast(lang === 'ar' ? 'تم حذف الملف بنجاح' : 'Patient deleted', 'success');
      setDeleteTarget(null);
      loadPatients();
    } else {
      showToast(lang === 'ar' ? 'فشل الحذف' : 'Delete failed', 'error');
    }
  }

  async function exportBackup() {
    const res = await fetch('/api/backup');
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dental_clinic_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(lang === 'ar' ? 'تم تنزيل النسخة الاحتياطية' : 'Backup downloaded', 'success');
  }

  async function importBackup(file: File) {
    const text = await file.text();
    const imported = JSON.parse(text);
    const res = await fetch('/api/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(imported),
    });
    if (res.ok) {
      showToast(lang === 'ar' ? 'تمت الاستعادة بنجاح' : 'Restored successfully', 'success');
      loadPatients();
    } else {
      showToast(lang === 'ar' ? 'ملف غير صالح' : 'Invalid backup file', 'error');
    }
  }

  async function openAudit() {
    const res = await fetch(`/api/audit-logs?filter=${auditFilter}`);
    const data = await res.json();
    setAuditLogs(data.logs || []);
    setModal('audit');
  }

  async function openUsers() {
    const res = await fetch('/api/users');
    if (res.status === 403) {
      showToast(lang === 'ar' ? 'غير مصرح لك بإدارة المستخدمين' : 'Not authorized to manage users', 'error');
      return;
    }
    if (!res.ok) {
      showToast(lang === 'ar' ? 'فشل تحميل المستخدمين' : 'Failed to load users', 'error');
      return;
    }
    const data = await res.json();
    setAdminUsers(data.users || []);
    setModal('users');
  }

  async function openDoctors() {
    await loadDoctors();
    setModal('doctors');
  }

  function getLatestFollowUp(p: Patient): FollowUp | null {
    const fus = p.followUps || [];
    return fus.length > 0 ? fus[fus.length - 1] : null;
  }

  function toggleSelectAll(checked: boolean) {
    setSelectedIds(checked ? patients.map((p) => p.id) : []);
  }

  function toggleSelect(id: string, checked: boolean) {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  }

  function printFollowUps(ids: string[]) {
    const target = patients.filter((p) => ids.includes(p.id));
    const container = document.getElementById('printable-followups-container');
    if (!container) return;

    let rows = '';
    let counter = 1;
    for (const p of target) {
      const fu = getLatestFollowUp(p);
      if (!fu) continue;
      const dayStr = fu.dayName || getDayNameFromDate(fu.date, lang);
      const time12 = fu.time12 || formatTimeTo12Hour(fu.time, lang);
      rows += `<tr>
        <td style="text-align:center;font-weight:bold;">${counter++}</td>
        <td><strong>${escapeHtml(p.fullName)}</strong><br><small>ملف: ${p.fileNumber}</small></td>
        <td dir="ltr">${p.phone}</td>
        <td><strong>${escapeHtml(`${dayStr} - ${fu.date} (${time12})`)}</strong></td>
        <td>${escapeHtml(fu.procedure)}</td>
        <td>${escapeHtml(fu.doctorNotes) || '-'}</td>
      </tr>`;
    }

    if (!rows) {
      showToast(lang === 'ar' ? 'لا توجد متابعات للطباعة' : 'No follow-ups to print', 'warning');
      return;
    }

    container.innerHTML = `<div class="print-followups-sheet">
      <div style="text-align:center;border-bottom:2px solid #000;padding-bottom:12px;margin-bottom:18px;">
        <h2 style="margin:0;font-size:18pt;">${t(lang, 'clinicTitle')}</h2>
        <p style="margin:4px 0 0 0;">📋 كشف متابعات ومواعيد زيارات المرضى القادمة</p>
      </div>
      <table class="print-followups-table"><thead><tr>
        <th>#</th><th>اسم المريض</th><th>الهاتف</th><th>موعد الزيارة</th><th>الإجراء</th><th>ملاحظات</th>
      </tr></thead><tbody>${rows}</tbody></table>
    </div>`;

    container.classList.add('active-print');
    document.body.classList.add('printing-followups');
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        container.classList.remove('active-print');
        document.body.classList.remove('printing-followups');
      }, 500);
    }, 150);
  }

  async function cycleTooth(toothId: string) {
    if (!activePatient) return;
    const odontogram = { ...activePatient.odontogram };
    const current = odontogram[toothId] || 'healthy';
    const nextIdx = (TOOTH_STATES.indexOf(current as (typeof TOOTH_STATES)[number]) + 1) % TOOTH_STATES.length;
    odontogram[toothId] = TOOTH_STATES[nextIdx];

    const res = await fetch(`/api/patients/${activePatient.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ odontogram }),
    });
    const data = await res.json();
    setActivePatient(data.patient);
    loadPatients();
  }

  async function uploadFiles(files: FileList | null) {
    if (!activePatient || !files) return;
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        await fetch('/api/attachments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: activePatient.id,
            name: file.name,
            type: file.type,
            size: file.size,
            dataUrl: evt.target?.result,
          }),
        });
        openPatient(activePatient.id, 'view');
      };
      reader.readAsDataURL(file);
    }
  }

  const adminActions = (
    <>
      <button type="button" className="btn btn-secondary btn-sm" onClick={exportBackup}>
        💾 {t(lang, 'backupRestore')}
      </button>
      <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
        📥 {lang === 'ar' ? 'استعادة' : 'Restore'}
        <input type="file" accept=".json" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && importBackup(e.target.files[0])} />
      </label>
      <button type="button" className="btn btn-secondary btn-sm" onClick={openAudit}>
        📋 {t(lang, 'auditLogTitle')}
      </button>
      <button type="button" className="btn btn-secondary btn-sm" onClick={openDoctors}>
        🩺 {lang === 'ar' ? 'إدارة الأطباء' : 'Doctors'}
      </button>
      {user?.canManageUsers && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={openUsers}>
          👤 {lang === 'ar' ? 'إدارة المستخدمين' : 'Users'}
        </button>
      )}
      <button type="button" className="btn btn-danger btn-sm" onClick={logout}>
        🚪 {t(lang, 'logout')}
      </button>
    </>
  );

  return (
    <>
    <div className="app-container" id="dashboard-app">
      <Header title={t(lang, 'adminDashboard')} subtitle={t(lang, 'clinicTitle')} adminActions={adminActions} />

      <div className="dashboard-grid">
        <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFollowupFilter('followups_only')}>
          <div className="stat-icon followups" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', fontSize: '1.5rem' }}>📅</div>
          <div className="stat-info"><span>{t(lang, 'followUpsTitle')}</span><h3>{stats.followUps}</h3></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon total">👥</div>
          <div className="stat-info"><span>{t(lang, 'totalPatients')}</span><h3>{stats.total}</h3></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon today">📅</div>
          <div className="stat-info"><span>{t(lang, 'todayRegistrations')}</span><h3>{stats.today}</h3></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon month">📆</div>
          <div className="stat-info"><span>{t(lang, 'monthlyRegistrations')}</span><h3>{stats.month}</h3></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon recent">✨</div>
          <div className="stat-info"><span>{t(lang, 'recentPatients')}</span><h3>{stats.recent}</h3></div>
        </div>
      </div>

      <div className="glass-card">
        <div className="toolbar-card">
          <div className="search-box">
            <input
              type="text"
              className="form-control"
              placeholder={t(lang, 'searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filter-actions">
            <select className="form-control no-icon" value={followupFilter} onChange={(e) => setFollowupFilter(e.target.value)} style={{ width: 'auto', minWidth: 220 }}>
              <option value="all">👥 {lang === 'ar' ? 'جميع المرضى' : 'All Patients'}</option>
              <option value="followups_only">📅 {lang === 'ar' ? 'حالات المتابعة' : 'Follow-ups'}</option>
              <option value="followups_added_today">🟢 {lang === 'ar' ? 'متابعات اليوم' : 'Added Today'}</option>
              <option value="followups_added_yesterday">🟡 {lang === 'ar' ? 'متابعات أمس' : 'Added Yesterday'}</option>
              <option value="appointment_today">🔔 {lang === 'ar' ? 'موعد اليوم' : 'Today Appointment'}</option>
              <option value="appointment_tomorrow">⏰ {lang === 'ar' ? 'موعد الغد' : 'Tomorrow Appointment'}</option>
            </select>
            <select className="form-control no-icon" value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} style={{ width: 'auto', minWidth: 180 }}>
              <option value="">{lang === 'ar' ? 'جميع الأطباء' : 'All Doctors'}</option>
              {doctors.filter((d) => d.active).map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select className="form-control no-icon" value={insurance} onChange={(e) => setInsurance(e.target.value)} style={{ width: 'auto' }}>
              <option value="">{t(lang, 'allInsurance')}</option>
              <option value="Yes">{t(lang, 'yes')}</option>
              <option value="No">{t(lang, 'no')}</option>
            </select>
            {selectedIds.length > 0 && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => printFollowUps(selectedIds)}>
                🖨️ {t(lang, 'printSelectedFollowups')} ({selectedIds.length})
              </button>
            )}
            <Link href="/" className="btn btn-primary btn-sm">➕ {lang === 'ar' ? 'تسجيل مريض جديد' : 'New Patient'}</Link>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 38, textAlign: 'center' }}>
                  <input type="checkbox" checked={selectedIds.length === patients.length && patients.length > 0} onChange={(e) => toggleSelectAll(e.target.checked)} />
                </th>
                <th>{t(lang, 'fileNumberLabel')}</th>
                <th>{t(lang, 'fullName')}</th>
                <th>{lang === 'ar' ? 'الطبيب' : 'Doctor'}</th>
                <th>{t(lang, 'phone')}</th>
                <th>{t(lang, 'nationalNumber')}</th>
                <th>{t(lang, 'nextVisitHeader')}</th>
                <th style={{ textAlign: 'left' }}>{t(lang, 'actions')}</th>
              </tr>
            </thead>
            <tbody>
              {patients.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>{t(lang, 'noData')}</td></tr>
              ) : (
                patients.map((p) => {
                  const latest = getLatestFollowUp(p);
                  return (
                    <tr key={p.id}>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={(e) => toggleSelect(p.id, e.target.checked)} />
                      </td>
                      <td><code className="file-code">{p.fileNumber}</code></td>
                      <td><strong>{p.fullName}</strong></td>
                      <td>{p.doctorName || '-'}</td>
                      <td dir="ltr">{p.phone}</td>
                      <td>{p.nationalNumber || '-'}</td>
                      <td>{latest ? `${latest.date} ${latest.time12 || formatTimeTo12Hour(latest.time, lang)}` : '-'}</td>
                      <td>
                        <div className="admin-actions-row">
                          <button type="button" className="admin-action-btn view" onClick={() => openPatient(p.id, 'view')} title={t(lang, 'viewFile')}>
                            <span>👁️</span><small>{t(lang, 'viewFile')}</small>
                          </button>
                          <button type="button" className="admin-action-btn edit" onClick={() => openPatient(p.id, 'edit')} title={t(lang, 'editFile')}>
                            <span>✏️</span><small>{t(lang, 'editFile')}</small>
                          </button>
                          <button type="button" className="admin-action-btn followup" onClick={() => openPatient(p.id, 'followup')} title={t(lang, 'followUpBtn')}>
                            <span>📅</span><small>{t(lang, 'followUpBtn')}</small>
                          </button>
                          <button type="button" className="admin-action-btn delete" onClick={() => setDeleteTarget(p)} title={t(lang, 'deleteFile')}>
                            <span>🗑️</span><small>{t(lang, 'deleteFile')}</small>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <DeleteConfirmModal
          patient={deleteTarget}
          lang={lang}
          deleting={deleting}
          onConfirm={confirmDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}

      {modal && activePatient && (modal === 'view' || modal === 'edit' || modal === 'followup') && (
        <PatientModal
          mode={modal}
          patient={activePatient}
          attachments={attachments}
          doctors={doctors.filter((d) => d.active)}
          lang={lang}
          onClose={() => { setModal(null); setActivePatient(null); }}
          onRefresh={() => openPatient(activePatient.id, modal)}
          onSave={loadPatients}
          cycleTooth={cycleTooth}
          uploadFiles={uploadFiles}
          printFollowUps={printFollowUps}
          showToast={showToast}
        />
      )}

      {modal === 'audit' && (
        <AuditModal
          logs={auditLogs}
          filter={auditFilter}
          lang={lang}
          onFilter={async (f) => {
            setAuditFilter(f);
            const res = await fetch(`/api/audit-logs?filter=${f}`);
            const data = await res.json();
            setAuditLogs(data.logs || []);
          }}
          onClose={() => setModal(null)}
          onClear={async () => {
            if (!confirm(lang === 'ar' ? 'مسح جميع السجلات؟' : 'Clear all logs?')) return;
            await fetch('/api/audit-logs', { method: 'DELETE' });
            openAudit();
          }}
        />
      )}

      {modal === 'users' && (
        <UsersModal
          users={adminUsers}
          lang={lang}
          onClose={() => setModal(null)}
          onRefresh={openUsers}
          showToast={showToast}
        />
      )}

      {modal === 'doctors' && (
        <DoctorsModal
          doctors={doctors}
          lang={lang}
          onClose={() => setModal(null)}
          onRefresh={loadDoctors}
          showToast={showToast}
        />
      )}
    </div>

    <div id="printable-followups-container" className="printable-followups-only" style={{ display: 'none' }} />
    <div id="printable-patient-container" className="printable-patient-only" style={{ display: 'none' }} />
  </>
  );
}

/* ─── Shared modal shell ─── */
function AdminModalShell({
  modeClass,
  icon,
  title,
  subtitle,
  onClose,
  children,
  footer,
  wide,
}: {
  modeClass: string;
  icon: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="modal-backdrop active admin-modal-backdrop" onClick={onClose}>
      <div
        className={`modal-container admin-modal ${modeClass}${wide ? ' admin-modal--wide' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`admin-modal-header ${modeClass}`}>
          <div className="admin-modal-header-text">
            <span className="admin-modal-icon">{icon}</span>
            <div>
              <h3>{title}</h3>
              {subtitle && <p>{subtitle}</p>}
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="modal-body admin-modal-body">{children}</div>
        {footer && <div className="modal-footer admin-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function PatientHeaderCard({ patient, lang }: { patient: Patient; lang: 'ar' | 'en' }) {
  return (
    <div className="patient-header-card">
      <div className="patient-header-avatar">{patient.fullName.charAt(0)}</div>
      <div className="patient-header-info">
        <h4>{patient.fullName}</h4>
        <div className="patient-header-meta">
          <span className="patient-file-badge">{patient.fileNumber}</span>
          <span dir="ltr">📞 {patient.phone}</span>
          {patient.nationalNumber && <span>🪪 {patient.nationalNumber}</span>}
          <span>📅 {patient.fileDate}</span>
        </div>
      </div>
    </div>
  );
}

function InfoGrid({ items }: { items: { label: string; value: string; dir?: string }[] }) {
  return (
    <div className="admin-info-grid">
      {items.map((item) => (
        <div key={item.label} className="admin-info-item">
          <span className="admin-info-label">{item.label}</span>
          <span className="admin-info-value" dir={item.dir}>{item.value || '-'}</span>
        </div>
      ))}
    </div>
  );
}

function DeleteConfirmModal({
  patient, lang, deleting, onConfirm, onClose,
}: {
  patient: Patient; lang: 'ar' | 'en'; deleting: boolean;
  onConfirm: () => void; onClose: () => void;
}) {
  return (
    <AdminModalShell
      modeClass="admin-modal--delete"
      icon="🗑️"
      title={lang === 'ar' ? 'تأكيد حذف الملف' : 'Confirm Delete'}
      subtitle={lang === 'ar' ? 'هذا الإجراء لا يمكن التراجع عنه' : 'This action cannot be undone'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={deleting}>
            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
          </button>
          <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? '⏳ ...' : `🗑️ ${lang === 'ar' ? 'نعم، احذف الملف' : 'Yes, Delete'}`}
          </button>
        </>
      }
    >
      <div className="delete-confirm-body">
        <PatientHeaderCard patient={patient} lang={lang} />
        <div className="delete-warning-box">
          <span>⚠️</span>
          <p>
            {lang === 'ar'
              ? `هل أنت متأكد من حذف ملف المريض "${patient.fullName}"؟ سيتم حذف جميع المتابعات والمرفقات المرتبطة.`
              : `Are you sure you want to delete "${patient.fullName}"? All follow-ups and attachments will be removed.`}
          </p>
        </div>
      </div>
    </AdminModalShell>
  );
}

function PatientModal({
  mode, patient, attachments, doctors, lang, onClose, onRefresh, onSave, cycleTooth, uploadFiles, printFollowUps, showToast,
}: {
  mode: 'view' | 'edit' | 'followup';
  patient: Patient;
  attachments: Attachment[];
  doctors: Doctor[];
  lang: 'ar' | 'en';
  onClose: () => void;
  onRefresh: () => void;
  onSave: () => void;
  cycleTooth: (id: string) => void;
  uploadFiles: (files: FileList | null) => void;
  printFollowUps: (ids: string[]) => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
}) {
  const [fuDate, setFuDate] = useState('');
  const [fuTime, setFuTime] = useState('10:00');
  const [fuProcedure, setFuProcedure] = useState('');
  const [fuNotes, setFuNotes] = useState('');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    const latest = patient.followUps?.[patient.followUps.length - 1];
    setFuDate(latest?.date || new Date().toISOString().split('T')[0]);
    setFuTime(latest?.time || '10:00');
    setFuProcedure(latest?.procedure || '');
    setFuNotes(latest?.doctorNotes || '');
    setDoctorNotes(patient.doctorNotes || '');
  }, [patient]);

  const modeConfig = {
    view: { class: 'admin-modal--view', icon: '👁️', title: lang === 'ar' ? 'عرض ملف المريض' : 'Patient File' },
    edit: { class: 'admin-modal--edit', icon: '✏️', title: lang === 'ar' ? 'تعديل بيانات المريض' : 'Edit Patient' },
    followup: { class: 'admin-modal--followup', icon: '📅', title: lang === 'ar' ? 'إدارة المتابعة' : 'Follow-up Management' },
  }[mode];

  async function saveFollowUp(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/follow-ups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: patient.id, date: fuDate, time: fuTime, procedure: fuProcedure, doctorNotes: fuNotes }),
    });
    setSaving(false);
    if (res.ok) { onRefresh(); onSave(); }
  }

  async function deleteFollowUp(fuId: string) {
    if (!confirm(lang === 'ar' ? 'حذف هذه المتابعة؟' : 'Delete this follow-up?')) return;
    await fetch(`/api/follow-ups?id=${fuId}&patientId=${patient.id}`, { method: 'DELETE' });
    onRefresh();
    onSave();
  }

  async function saveDoctorNotes() {
    setSavingNotes(true);
    const res = await fetch(`/api/patients/${patient.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctorNotes }),
    });
    setSavingNotes(false);
    if (res.ok) {
      showToast(lang === 'ar' ? 'تم حفظ ملاحظات الطبيب' : 'Doctor notes saved', 'success');
      onRefresh();
      onSave();
    } else {
      showToast(lang === 'ar' ? 'فشل حفظ الملاحظات' : 'Failed to save notes', 'error');
    }
  }

  async function saveEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const medicalHistory: Record<string, string> = {};
    MED_KEYS.forEach((k) => { medicalHistory[k] = String(fd.get(k) || 'No'); });

    const payload = {
      fullName: String(fd.get('fullName') || ''),
      nationalNumber: String(fd.get('nationalNumber') || ''),
      nationalId: String(fd.get('nationalId') || ''),
      dob: String(fd.get('dob') || ''),
      gender: String(fd.get('gender') || ''),
      phone: String(fd.get('phone') || ''),
      additionalPhone: String(fd.get('additionalPhone') || ''),
      emergencyName: String(fd.get('emergencyName') || ''),
      emergencyPhone: String(fd.get('emergencyPhone') || ''),
      bloodType: String(fd.get('bloodType') || ''),
      maritalStatus: String(fd.get('maritalStatus') || ''),
      eduStatus: String(fd.get('eduStatus') || ''),
      address: String(fd.get('address') || ''),
      patientNotes: String(fd.get('patientNotes') || ''),
      hasInsurance: String(fd.get('hasInsurance') || 'No'),
      insuranceCompany: String(fd.get('insuranceCompany') || ''),
      insuranceCardNo: String(fd.get('insuranceCardNo') || ''),
      doctorId: String(fd.get('doctorId') || '') || null,
      medicalHistory,
    };

    const res = await fetch(`/api/patients/${patient.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) { onSave(); onClose(); }
  }

  const toothSvg = <svg className="tooth-icon-svg" viewBox="0 0 24 24"><path d="M12 2C8 2 5 5 5 9c0 4 2 8 3 11 1 2 2 2 4 2s3 0 4-2c1-3 3-7 3-11 0-4-3-7-7-7z" /></svg>;

  function renderTooth(id: string, symbol: string) {
    const status = patient.odontogram[id] || 'healthy';
    return (
      <div key={id} className={`tooth-box ${status}`} onClick={() => cycleTooth(id)} title={id} role="button">
        <span className="tooth-number">{symbol}</span>
        {toothSvg}
        <span className="tooth-label">{status}</span>
      </div>
    );
  }

  const ur = ['UR8','UR7','UR6','UR5','UR4','UR3','UR2','UR1'].map((id) => renderTooth(id, id.replace('UR','')));
  const ul = ['UL1','UL2','UL3','UL4','UL5','UL6','UL7','UL8'].map((id) => renderTooth(id, id.replace('UL','')));
  const lr = ['LR8','LR7','LR6','LR5','LR4','LR3','LR2','LR1'].map((id) => renderTooth(id, id.replace('LR','')));
  const ll = ['LL1','LL2','LL3','LL4','LL5','LL6','LL7','LL8'].map((id) => renderTooth(id, id.replace('LL','')));

  const med = patient.medicalHistory || {};

  return (
    <AdminModalShell
      modeClass={modeConfig.class}
      icon={modeConfig.icon}
      title={modeConfig.title}
      subtitle={patient.fileNumber}
      onClose={onClose}
      wide
      footer={
        mode === 'view' ? (
          <>
            <button type="button" className="btn btn-secondary" onClick={() => printFollowUps([patient.id])}>🖨️ {lang === 'ar' ? 'طباعة المتابعة' : 'Print Follow-up'}</button>
            <button type="button" className="btn btn-secondary" onClick={() => printPatientFile(patient, lang)}>🖨️ {t(lang, 'printFile')}</button>
            <button type="button" className="btn btn-primary" onClick={onClose}>{t(lang, 'closeModal')}</button>
          </>
        ) : mode === 'edit' ? undefined : (
          <button type="button" className="btn btn-primary" onClick={onClose}>{t(lang, 'closeModal')}</button>
        )
      }
    >
      <PatientHeaderCard patient={patient} lang={lang} />

      {mode === 'followup' && (
        <div className="admin-modal-section">
          <h5 className="admin-section-title">📌 {lang === 'ar' ? 'تسجيل موعد جديد' : 'Schedule Visit'}</h5>
          <form onSubmit={saveFollowUp} className="admin-form-card">
            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label>{lang === 'ar' ? 'تاريخ الزيارة' : 'Visit Date'} *</label>
                <input type="date" className="form-control no-icon" value={fuDate} onChange={(e) => setFuDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>{lang === 'ar' ? 'اليوم' : 'Day'}</label>
                <input type="text" className="form-control no-icon" readOnly value={getDayNameFromDate(fuDate, lang)} />
              </div>
              <div className="form-group">
                <label>{lang === 'ar' ? 'الوقت' : 'Time'} *</label>
                <input type="time" className="form-control no-icon" value={fuTime} onChange={(e) => setFuTime(e.target.value)} required />
                <small className="validation-hint">{formatTimeTo12Hour(fuTime, lang)}</small>
              </div>
            </div>
            <div className="form-group">
              <label>{lang === 'ar' ? 'الإجراء' : 'Procedure'} *</label>
              <div className="procedure-chips-container">
                {FOLLOWUP_PROCEDURES.map((p) => (
                  <span key={p} className={`procedure-chip${fuProcedure === p ? ' active' : ''}`} onClick={() => setFuProcedure(p)}>{p}</span>
                ))}
              </div>
              <input type="text" className="form-control" value={fuProcedure} onChange={(e) => setFuProcedure(e.target.value)} required placeholder={lang === 'ar' ? 'اختر أو اكتب الإجراء' : 'Select or type procedure'} />
            </div>
            <div className="form-group">
              <label>{lang === 'ar' ? 'ملاحظات الطبيب' : 'Doctor Notes'}</label>
              <textarea className="form-control no-icon" rows={3} value={fuNotes} onChange={(e) => setFuNotes(e.target.value)} />
            </div>
            <div className="admin-form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => printFollowUps([patient.id])}>🖨️ {lang === 'ar' ? 'طباعة' : 'Print'}</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳' : `💾 ${lang === 'ar' ? 'حفظ المتابعة' : 'Save'}`}</button>
            </div>
          </form>

          <h5 className="admin-section-title" style={{ marginTop: '1.5rem' }}>📋 {lang === 'ar' ? 'سجل المتابعات' : 'Follow-up History'}</h5>
          {(patient.followUps || []).length === 0 ? (
            <p className="admin-empty-state">{lang === 'ar' ? 'لا توجد متابعات مسجلة' : 'No follow-ups recorded'}</p>
          ) : (
            <div className="followup-timeline">
              {(patient.followUps || []).slice().reverse().map((fu) => (
                <div key={fu.id} className="followup-timeline-item">
                  <div className="followup-timeline-dot" />
                  <div className="followup-timeline-content">
                    <div className="followup-timeline-header">
                      <strong>{fu.dayName || getDayNameFromDate(fu.date, lang)} — {fu.date}</strong>
                      <span className="followup-time-badge">{fu.time12 || formatTimeTo12Hour(fu.time, lang)}</span>
                    </div>
                    <div className="followup-procedure">{fu.procedure}</div>
                    {fu.doctorNotes && <p className="followup-notes">{fu.doctorNotes}</p>}
                    <button type="button" className="btn btn-danger btn-sm followup-delete-btn" onClick={() => deleteFollowUp(fu.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === 'edit' && (
        <form onSubmit={saveEdit} className="admin-modal-section">
          <h5 className="admin-section-title">📌 {t(lang, 'secPersonal')}</h5>
          <div className="admin-form-card">
            <div className="form-grid form-grid-2">
              <div className="form-group full-width"><label>{t(lang, 'fullName')}</label><input name="fullName" defaultValue={patient.fullName} className="form-control" required /></div>
              <div className="form-group"><label>{t(lang, 'nationalNumber')}</label><input name="nationalNumber" defaultValue={patient.nationalNumber} className="form-control" maxLength={12} /></div>
              <div className="form-group"><label>{t(lang, 'nationalId')}</label><input name="nationalId" defaultValue={patient.nationalId} className="form-control" /></div>
              <div className="form-group"><label>{t(lang, 'dob')}</label><input name="dob" type="date" defaultValue={patient.dob} className="form-control no-icon" /></div>
              <div className="form-group"><label>{t(lang, 'gender')}</label><select name="gender" defaultValue={patient.gender} className="form-control no-icon"><option value="Male">{t(lang, 'male')}</option><option value="Female">{t(lang, 'female')}</option></select></div>
              <div className="form-group">
                <label>{lang === 'ar' ? 'الطبيب المعالج' : 'Assigned Doctor'}</label>
                <select name="doctorId" defaultValue={patient.doctorId || ''} className="form-control no-icon">
                  <option value="">{lang === 'ar' ? '— غير محدد —' : '— Unassigned —'}</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group"><label>{t(lang, 'phone')}</label><input name="phone" defaultValue={patient.phone} className="form-control" dir="ltr" required /></div>
              <div className="form-group"><label>{t(lang, 'additionalPhone')}</label><input name="additionalPhone" defaultValue={patient.additionalPhone} className="form-control" dir="ltr" required /></div>
              <div className="form-group"><label>{t(lang, 'emergencyName')}</label><input name="emergencyName" defaultValue={patient.emergencyName} className="form-control" /></div>
              <div className="form-group"><label>{t(lang, 'emergencyPhone')}</label><input name="emergencyPhone" defaultValue={patient.emergencyPhone} className="form-control" dir="ltr" /></div>
              <div className="form-group"><label>{t(lang, 'bloodType')}</label><select name="bloodType" defaultValue={patient.bloodType} className="form-control no-icon">{['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b => <option key={b} value={b}>{b}</option>)}</select></div>
              <div className="form-group"><label>{t(lang, 'maritalStatus')}</label><select name="maritalStatus" defaultValue={patient.maritalStatus} className="form-control no-icon"><option value="Single">{t(lang, 'single')}</option><option value="Married">{t(lang, 'married')}</option><option value="Divorced">{t(lang, 'divorced')}</option><option value="Widowed">{t(lang, 'widowed')}</option></select></div>
              <div className="form-group full-width"><label>{t(lang, 'address')}</label><input name="address" defaultValue={patient.address} className="form-control" /></div>
              <div className="form-group full-width"><label>{t(lang, 'patientNotes')}</label><textarea name="patientNotes" defaultValue={patient.patientNotes} className="form-control no-icon" rows={2} /></div>
              <div className="form-group"><label>{t(lang, 'hasInsurance')}</label><select name="hasInsurance" defaultValue={patient.hasInsurance} className="form-control no-icon"><option value="Yes">{t(lang, 'yes')}</option><option value="No">{t(lang, 'no')}</option></select></div>
              <div className="form-group"><label>{t(lang, 'insuranceCompany')}</label><input name="insuranceCompany" defaultValue={patient.insuranceCompany} className="form-control" /></div>
            </div>
          </div>

          <h5 className="admin-section-title">🏥 {t(lang, 'secMedical')}</h5>
          <div className="admin-form-card medical-edit-grid">
            {MED_KEYS.map((key) => (
              <div key={key} className="medical-item compact">
                <span className="medical-item-text">{t(lang, key)}</span>
                <div className="radio-group">
                  <label className="custom-radio"><input type="radio" name={key} value="Yes" defaultChecked={med[key] === 'Yes'} /> {t(lang, 'yes')}</label>
                  <label className="custom-radio"><input type="radio" name={key} value="No" defaultChecked={med[key] !== 'Yes'} /> {t(lang, 'no')}</label>
                </div>
              </div>
            ))}
          </div>

          <div className="admin-form-actions sticky">
            <button type="button" className="btn btn-secondary" onClick={onClose}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳' : `💾 ${lang === 'ar' ? 'حفظ التعديلات' : 'Save Changes'}`}</button>
          </div>
        </form>
      )}

      {mode === 'view' && (
        <div id="printable-patient-file" className="admin-modal-section">
          <h5 className="admin-section-title">📌 {t(lang, 'secPersonal')}</h5>
          <InfoGrid items={[
            { label: t(lang, 'fullName'), value: patient.fullName },
            { label: t(lang, 'phone'), value: patient.phone, dir: 'ltr' },
            { label: t(lang, 'additionalPhone'), value: patient.additionalPhone, dir: 'ltr' },
            { label: t(lang, 'nationalNumber'), value: patient.nationalNumber },
            { label: t(lang, 'nationalId'), value: patient.nationalId },
            { label: t(lang, 'dob'), value: patient.dob },
            { label: t(lang, 'gender'), value: patient.gender === 'Male' ? t(lang, 'male') : t(lang, 'female') },
            { label: lang === 'ar' ? 'الطبيب المعالج' : 'Assigned Doctor', value: patient.doctorName || '-' },
            { label: t(lang, 'bloodType'), value: patient.bloodType },
            { label: t(lang, 'address'), value: patient.address },
          ]} />

          {patient.patientNotes && (
            <>
              <h5 className="admin-section-title">📝 {t(lang, 'patientNotes')}</h5>
              <div className="admin-notes-box">{patient.patientNotes}</div>
            </>
          )}

          <h5 className="admin-section-title">🩺 {lang === 'ar' ? 'ملاحظات الطبيب' : 'Doctor Notes'}</h5>
          <div className="doctor-notes-section no-print">
            <textarea
              className="form-control no-icon"
              rows={4}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder={lang === 'ar' ? 'أضف ملاحظات الطبيب حول هذه الحالة...' : 'Add doctor notes about this case...'}
            />
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ marginTop: '0.75rem' }}
              onClick={saveDoctorNotes}
              disabled={savingNotes}
            >
              {savingNotes ? '⏳' : `💾 ${lang === 'ar' ? 'حفظ الملاحظات' : 'Save Notes'}`}
            </button>
          </div>
          {patient.doctorNotes && (
            <div className="admin-notes-box doctor-notes-box print-only">{patient.doctorNotes}</div>
          )}

          <h5 className="admin-section-title">🏥 {t(lang, 'secMedical')}</h5>
          <div className="medical-badges-grid">
            {MED_KEYS.map((key) => (
              <div key={key} className={`medical-badge-item${med[key] === 'Yes' ? ' yes' : ''}`}>
                <span>{t(lang, key)}</span>
                <span className={`badge ${med[key] === 'Yes' ? 'badge-danger' : 'badge-success'}`}>
                  {med[key] === 'Yes' ? t(lang, 'yes') : t(lang, 'no')}
                </span>
              </div>
            ))}
          </div>

          <h5 className="admin-section-title">🦷 {lang === 'ar' ? 'مخطط الأسنان' : 'Odontogram'}</h5>
          <p className="admin-hint no-print">{lang === 'ar' ? 'انقر على أي سن لتغيير حالته' : 'Click a tooth to cycle its status'}</p>
          <div className="palmer-crosshair-container">
            <div className="palmer-quadrant"><div className="palmer-quadrant-title">UR</div><div className="palmer-teeth-row">{ur}</div></div>
            <div className="palmer-quadrant"><div className="palmer-quadrant-title">UL</div><div className="palmer-teeth-row">{ul}</div></div>
            <div className="palmer-quadrant"><div className="palmer-quadrant-title">LR</div><div className="palmer-teeth-row">{lr}</div></div>
            <div className="palmer-quadrant"><div className="palmer-quadrant-title">LL</div><div className="palmer-teeth-row">{ll}</div></div>
          </div>

          <h5 className="admin-section-title">📎 {lang === 'ar' ? 'المرفقات' : 'Attachments'}</h5>
          <div className="dropzone no-print" onClick={() => document.getElementById('file-upload-input')?.click()}>
            <p>📁 {lang === 'ar' ? 'اسحب الملفات أو انقر للرفع' : 'Drop files or click to upload'}</p>
            <input id="file-upload-input" type="file" style={{ display: 'none' }} multiple accept="image/*,application/pdf" onChange={(e) => uploadFiles(e.target.files)} />
          </div>
          {attachments.length === 0 ? (
            <p className="admin-empty-state">{lang === 'ar' ? 'لا توجد مرفقات' : 'No attachments'}</p>
          ) : (
            <div className="attachments-grid">
              {attachments.map((att) => (
                <div key={att.id} className="attachment-card">
                  <div className="attachment-preview">{att.type.startsWith('image/') ? <img src={att.dataUrl} alt={att.name} /> : '📄'}</div>
                  <div className="attachment-name">{att.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminModalShell>
  );
}

function AuditModal({ logs, filter, lang, onFilter, onClose, onClear }: {
  logs: AuditLog[]; filter: string; lang: 'ar' | 'en';
  onFilter: (f: string) => void; onClose: () => void; onClear: () => void;
}) {
  const types = ['all','register','edit','delete','followup','print','view','login','logout','backup','restore','tooth','attach','system'];
  return (
    <AdminModalShell
      modeClass="admin-modal--audit"
      icon="📋"
      title={t(lang, 'auditLogTitle')}
      subtitle={`${logs.length} ${lang === 'ar' ? 'سجل' : 'entries'}`}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" className="btn btn-danger" onClick={onClear}>🗑️ {lang === 'ar' ? 'مسح السجل' : 'Clear Log'}</button>
          <button type="button" className="btn btn-primary" onClick={onClose}>{t(lang, 'closeModal')}</button>
        </>
      }
    >
      <div className="audit-filter-chips">
        {types.map((tp) => (
          <button key={tp} type="button" className={`audit-filter-chip${filter === tp ? ' active' : ''}`} onClick={() => onFilter(tp)}>{tp}</button>
        ))}
      </div>
      <div className="admin-table-wrap">
        <table className="data-table admin-audit-table">
          <thead><tr><th>{lang === 'ar' ? 'التوقيت' : 'Time'}</th><th>{lang === 'ar' ? 'النوع' : 'Type'}</th><th>{lang === 'ar' ? 'المستخدم' : 'User'}</th><th>{lang === 'ar' ? 'الملف' : 'File'}</th><th>{lang === 'ar' ? 'التفاصيل' : 'Details'}</th></tr></thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="admin-empty-state">{lang === 'ar' ? 'لا توجد سجلات' : 'No logs'}</td></tr>
            ) : logs.map((l) => (
              <tr key={l.id}>
                <td className="audit-time">{l.timestamp}</td>
                <td><span className="audit-type-badge" style={{ borderColor: l.color || '#64748b', color: l.color || '#64748b' }}>{l.icon} {l.label}</span></td>
                <td>{l.user}</td>
                <td><code>{l.patientId}</code></td>
                <td>{l.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminModalShell>
  );
}

function DoctorsModal({ doctors, lang, onClose, onRefresh, showToast }: {
  doctors: Doctor[];
  lang: 'ar' | 'en';
  onClose: () => void;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
}) {
  async function addDoctor(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fd.get('name'),
        specialty: fd.get('specialty'),
        phone: fd.get('phone'),
      }),
    });
    if (res.ok) {
      showToast(lang === 'ar' ? 'تم إضافة الطبيب' : 'Doctor added', 'success');
      e.currentTarget.reset();
      onRefresh();
    } else {
      const d = await res.json();
      showToast(d.error || 'Failed', 'error');
    }
  }

  async function toggleDoctor(id: string, active: boolean) {
    const res = await fetch(`/api/doctors?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    });
    if (res.ok) onRefresh();
  }

  async function deleteDoctor(id: string, name: string) {
    if (!confirm(lang === 'ar' ? `حذف الطبيب ${name}؟` : `Delete doctor ${name}?`)) return;
    const res = await fetch(`/api/doctors?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    if (res.ok) {
      showToast(lang === 'ar' ? 'تم حذف الطبيب' : 'Doctor deleted', 'success');
      onRefresh();
    } else {
      showToast(lang === 'ar' ? 'فشل الحذف' : 'Delete failed', 'error');
    }
  }

  return (
    <AdminModalShell
      modeClass="admin-modal--doctors"
      icon="🩺"
      title={lang === 'ar' ? 'إدارة الأطباء' : 'Doctor Management'}
      onClose={onClose}
      wide
      footer={<button type="button" className="btn btn-primary" onClick={onClose}>{t(lang, 'closeModal')}</button>}
    >
      <form onSubmit={addDoctor} className="admin-form-card user-add-form">
        <h5 className="admin-section-title">➕ {lang === 'ar' ? 'إضافة طبيب' : 'Add Doctor'}</h5>
        <div className="form-grid form-grid-3">
          <input name="name" placeholder={lang === 'ar' ? 'اسم الطبيب *' : 'Doctor name *'} className="form-control" required />
          <input name="specialty" placeholder={lang === 'ar' ? 'التخصص' : 'Specialty'} className="form-control" />
          <input name="phone" placeholder={lang === 'ar' ? 'الهاتف' : 'Phone'} className="form-control" dir="ltr" />
        </div>
        <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>💾 {lang === 'ar' ? 'إضافة' : 'Add'}</button>
      </form>
      <h5 className="admin-section-title">📋 {lang === 'ar' ? 'قائمة الأطباء' : 'Doctors List'}</h5>
      {doctors.length === 0 ? (
        <p className="admin-empty-state">{lang === 'ar' ? 'لا يوجد أطباء' : 'No doctors yet'}</p>
      ) : (
        doctors.map((d) => (
          <div key={d.id} className="user-list-item">
            <div className="user-list-info">
              <span className="user-list-icon">🩺</span>
              <div>
                <strong>{d.name}</strong>
                <small>{[d.specialty, d.phone].filter(Boolean).join(' · ') || (lang === 'ar' ? 'بدون تفاصيل' : 'No details')}</small>
                {!d.active && <small style={{ color: '#ef4444' }}>{lang === 'ar' ? ' (غير نشط)' : ' (inactive)'}</small>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => toggleDoctor(d.id, d.active)}>
                {d.active ? (lang === 'ar' ? 'تعطيل' : 'Disable') : (lang === 'ar' ? 'تفعيل' : 'Enable')}
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteDoctor(d.id, d.name)}>🗑️</button>
            </div>
          </div>
        ))
      )}
    </AdminModalShell>
  );
}

function UsersModal({ users, lang, onClose, onRefresh, showToast }: {
  users: { username: string; is_super_admin: number }[];
  lang: 'ar' | 'en';
  onClose: () => void;
  onRefresh: () => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error' | 'warning') => void;
}) {
  async function addUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: fd.get('username'), password: fd.get('password') }),
    });
    if (res.ok) {
      showToast(lang === 'ar' ? 'تم إضافة المستخدم' : 'User added', 'success');
      e.currentTarget.reset();
      onRefresh();
    } else {
      const d = await res.json();
      showToast(d.error || 'Failed', 'error');
    }
  }

  async function deleteUser(username: string) {
    if (!confirm(lang === 'ar' ? `حذف المستخدم ${username}؟` : `Delete ${username}?`)) return;
    await fetch(`/api/users?username=${encodeURIComponent(username)}`, { method: 'DELETE' });
    onRefresh();
  }

  return (
    <AdminModalShell
      modeClass="admin-modal--users"
      icon="👤"
      title={lang === 'ar' ? 'إدارة المستخدمين' : 'User Management'}
      onClose={onClose}
      footer={<button type="button" className="btn btn-primary" onClick={onClose}>{t(lang, 'closeModal')}</button>}
    >
      <form onSubmit={addUser} className="admin-form-card user-add-form">
        <h5 className="admin-section-title">➕ {lang === 'ar' ? 'إضافة مستخدم' : 'Add User'}</h5>
        <div className="form-grid form-grid-2">
          <input name="username" placeholder={lang === 'ar' ? 'اسم المستخدم' : 'Username'} className="form-control" required autoComplete="off" />
          <input name="password" type="password" placeholder={lang === 'ar' ? 'كلمة المرور' : 'Password'} className="form-control" required autoComplete="new-password" />
        </div>
        <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>💾 {lang === 'ar' ? 'إضافة' : 'Add'}</button>
      </form>
      <h5 className="admin-section-title">📋 {lang === 'ar' ? 'المستخدمون' : 'Users'}</h5>
      {users.map((u) => (
        <div key={u.username} className="user-list-item">
          <div className="user-list-info">
            <span className="user-list-icon">{u.is_super_admin ? '🔒' : '👤'}</span>
            <div>
              <strong>{u.username}</strong>
              {u.is_super_admin && <small>{lang === 'ar' ? 'مدير أساسي' : 'Super Admin'}</small>}
            </div>
          </div>
          {!u.is_super_admin && (
            <button type="button" className="btn btn-danger btn-sm" onClick={() => deleteUser(u.username)}>🗑️</button>
          )}
        </div>
      ))}
    </AdminModalShell>
  );
}
