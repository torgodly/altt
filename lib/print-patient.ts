import type { Attachment, Patient } from '@/lib/types';
import { t } from '@/lib/i18n';
import { escapeHtml } from '@/lib/utils';

const MED_KEYS = [
  'qChronic', 'qMeds', 'qAllergies', 'qRegularTreatment', 'qSurgeries', 'qExtraction',
  'qThyroid', 'qPressure', 'qDiabetes', 'qHeart', 'qKidneyLiver', 'qBloodThinner',
  'qAnesthesiaAllergy', 'qPregnancy',
] as const;

const TOOTH_STATUS_COLORS: Record<string, string> = {
  healthy: '#cbd5e1',
  caries: '#ef4444',
  filled: '#3b82f6',
  crown: '#f59e0b',
  extracted: '#64748b',
  implant: '#8b5cf6',
};

const TOOTH_SVG =
  '<svg class="print-tooth-svg" viewBox="0 0 24 24"><path d="M12 2C8 2 5 5 5 9c0 4 2 8 3 11 1 2 2 2 4 2s3 0 4-2c1-3 3-7 3-11 0-4-3-7-7-7z"/></svg>';

function yesNoBadge(value: string | undefined, lang: 'ar' | 'en'): string {
  const isYes = value === 'Yes';
  const label = isYes ? t(lang, 'yes') : t(lang, 'no');
  const cls = isYes ? 'print-badge-yes' : 'print-badge-no';
  return `<span class="print-med-badge ${cls}">${label}</span>`;
}

function renderTooth(id: string, symbol: string, odontogram: Record<string, string>) {
  const status = odontogram[id] || 'healthy';
  const color = TOOTH_STATUS_COLORS[status] || TOOTH_STATUS_COLORS.healthy;
  return `
    <div class="print-tooth-box" style="--tooth-color:${color}">
      <span class="print-tooth-num">${symbol}</span>
      ${TOOTH_SVG}
      <span class="print-tooth-status">${status}</span>
    </div>
  `;
}

function renderOdontogram(patient: Patient, lang: 'ar' | 'en') {
  const map = patient.odontogram || {};
  const ur = ['UR8', 'UR7', 'UR6', 'UR5', 'UR4', 'UR3', 'UR2', 'UR1']
    .map((id) => renderTooth(id, id.replace('UR', ''), map)).join('');
  const ul = ['UL1', 'UL2', 'UL3', 'UL4', 'UL5', 'UL6', 'UL7', 'UL8']
    .map((id) => renderTooth(id, id.replace('UL', ''), map)).join('');
  const lr = ['LR8', 'LR7', 'LR6', 'LR5', 'LR4', 'LR3', 'LR2', 'LR1']
    .map((id) => renderTooth(id, id.replace('LR', ''), map)).join('');
  const ll = ['LL1', 'LL2', 'LL3', 'LL4', 'LL5', 'LL6', 'LL7', 'LL8']
    .map((id) => renderTooth(id, id.replace('LL', ''), map)).join('');

  const legend = Object.entries(TOOTH_STATUS_COLORS)
    .map(([status, color]) => `<span class="print-legend-item"><i style="background:${color}"></i>${status}</span>`)
    .join('');

  return `
    <div class="print-odontogram-wrap">
      <div class="print-odontogram-legend">${legend}</div>
      <p class="print-odontogram-hint">${lang === 'ar' ? 'الوجه الأمامي للمريض — خط المنتصف في الوسط' : 'Patient front view — midline in center'}</p>
      <div class="print-palmer-grid">
        <div class="print-palmer-quadrant print-palmer-quadrant--ur">
          <div class="print-palmer-title">${lang === 'ar' ? 'الأيمن العلوي (UR)' : 'Upper Right (UR)'}</div>
          <div class="print-palmer-row">${ur}</div>
        </div>
        <div class="print-palmer-quadrant print-palmer-quadrant--ul">
          <div class="print-palmer-title">${lang === 'ar' ? 'الأيسر العلوي (UL)' : 'Upper Left (UL)'}</div>
          <div class="print-palmer-row">${ul}</div>
        </div>
        <div class="print-palmer-quadrant print-palmer-quadrant--lr">
          <div class="print-palmer-title">${lang === 'ar' ? 'الأيمن السفلي (LR)' : 'Lower Right (LR)'}</div>
          <div class="print-palmer-row">${lr}</div>
        </div>
        <div class="print-palmer-quadrant print-palmer-quadrant--ll">
          <div class="print-palmer-title">${lang === 'ar' ? 'الأيسر السفلي (LL)' : 'Lower Left (LL)'}</div>
          <div class="print-palmer-row">${ll}</div>
        </div>
      </div>
    </div>
  `;
}

function renderAttachments(attachments: Attachment[], lang: 'ar' | 'en') {
  if (!attachments.length) {
    return `<p class="print-empty">${lang === 'ar' ? 'لا توجد مرفقات أو أشعة' : 'No attachments or X-rays uploaded'}</p>`;
  }

  return `
    <div class="print-attachments-grid">
      ${attachments
        .map(
          (att) => `
        <div class="print-attachment-item">
          <div class="print-attachment-preview">
            ${
              att.type.startsWith('image/')
                ? `<img src="${att.dataUrl}" alt="${escapeHtml(att.name)}" />`
                : `<div class="print-attachment-file">📄 PDF</div>`
            }
          </div>
          <div class="print-attachment-name">${escapeHtml(att.name)}</div>
        </div>
      `
        )
        .join('')}
    </div>
  `;
}

function renderMedicalGrid(patient: Patient, lang: 'ar' | 'en') {
  const med = patient.medicalHistory || {};
  return `
    <div class="print-medical-grid">
      ${MED_KEYS.map(
        (key) => `
        <div class="print-medical-item">
          <span class="print-medical-q">${t(lang, key)}</span>
          ${yesNoBadge(med[key], lang)}
        </div>
      `
      ).join('')}
    </div>
  `;
}

export function printPatientFile(
  patient: Patient,
  lang: 'ar' | 'en',
  attachments: Attachment[] = []
) {
  const container = document.getElementById('printable-patient-container');
  if (!container) return;

  const genderLabel =
    patient.gender === 'Male' ? t(lang, 'male') : patient.gender === 'Female' ? t(lang, 'female') : patient.gender;

  const insuranceLine =
    patient.hasInsurance === 'Yes'
      ? `${t(lang, 'yes')} — ${escapeHtml(patient.insuranceCompany || '-')} (${escapeHtml(patient.insuranceCardNo || '-')})`
      : t(lang, 'no');

  const printDate = new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US');

  container.innerHTML = `
    <div class="print-patient-document">
      <!-- PAGE 1: Personal info + ALL medical yes/no questions -->
      <section class="print-page print-page-1">
        <header class="print-doc-header">
          <img src="/images/logo.png" alt="" class="print-doc-logo" />
          <div>
            <h1>${t(lang, 'clinicTitle')}</h1>
            <p>${t(lang, 'clinicSubtitle')}</p>
          </div>
        </header>

        <div class="print-patient-banner">
          <div>
            <h2>${escapeHtml(patient.fullName)}</h2>
            <p>${t(lang, 'fileDateLabel')}: ${escapeHtml(patient.fileDate)}</p>
          </div>
          <div class="print-file-badge">
            <span>${t(lang, 'fileNumberLabel')}</span>
            <strong>${escapeHtml(patient.fileNumber)}</strong>
          </div>
        </div>

        <h3 class="print-section-title">📌 ${t(lang, 'secPersonal')}</h3>
        <div class="print-info-grid">
          <div><strong>${t(lang, 'nationalNumber')}:</strong> ${escapeHtml(patient.nationalNumber || '-')}</div>
          <div><strong>${t(lang, 'nationalId')}:</strong> ${escapeHtml(patient.nationalId || '-')}</div>
          <div><strong>${t(lang, 'dob')}:</strong> ${escapeHtml(patient.dob || '-')}</div>
          <div><strong>${t(lang, 'gender')}:</strong> ${genderLabel}</div>
          <div><strong>${t(lang, 'phone')}:</strong> <span dir="ltr">${escapeHtml(patient.phone)}</span></div>
          <div><strong>${t(lang, 'additionalPhone')}:</strong> <span dir="ltr">${escapeHtml(patient.additionalPhone || '-')}</span></div>
          <div><strong>${t(lang, 'emergencyPhone')}:</strong> <span dir="ltr">${escapeHtml(patient.emergencyPhone || '-')}</span> (${escapeHtml(patient.emergencyName || '-')})</div>
          <div><strong>${t(lang, 'bloodType')}:</strong> ${escapeHtml(patient.bloodType || '-')}</div>
          <div><strong>${t(lang, 'maritalStatus')}:</strong> ${escapeHtml(patient.maritalStatus || '-')}</div>
          <div><strong>${lang === 'ar' ? 'الطبيب المعالج' : 'Assigned Doctor'}:</strong> ${escapeHtml(patient.doctorName || '-')}</div>
          <div class="print-info-full"><strong>${t(lang, 'address')}:</strong> ${escapeHtml(patient.address || '-')}</div>
        </div>

        ${patient.patientNotes ? `
          <h3 class="print-section-title">📝 ${t(lang, 'patientNotes')}</h3>
          <div class="print-notes-box">${escapeHtml(patient.patientNotes)}</div>
        ` : ''}

        <h3 class="print-section-title">🏥 ${t(lang, 'secMedical')}</h3>
        <p class="print-section-sub">${t(lang, 'secMedicalSub')}</p>
        ${renderMedicalGrid(patient, lang)}

        <h3 class="print-section-title">💳 ${t(lang, 'secInsurance')}</h3>
        <div class="print-insurance-box">
          <strong>${t(lang, 'hasInsurance')}:</strong> ${insuranceLine}
        </div>

        <h3 class="print-section-title">🩺 ${lang === 'ar' ? 'ملاحظات الطبيب المعالج' : 'Doctor Notes'}</h3>
        <div class="print-doctor-notes-box">
          ${patient.doctorNotes ? escapeHtml(patient.doctorNotes) : `<span class="print-muted">${lang === 'ar' ? '(مساحة لملاحظات الطبيب)' : '(Space for doctor notes)'}</span>`}
        </div>
      </section>

      <!-- PAGE 2: Teeth chart + attachments -->
      <section class="print-page print-page-2">
        <header class="print-page2-header">
          <div>
            <h2>🦷 ${lang === 'ar' ? 'مخطط الأسنان والمرفقات' : 'Dental Chart & Attachments'}</h2>
            <p>${escapeHtml(patient.fullName)} — ${escapeHtml(patient.fileNumber)}</p>
          </div>
          <span class="print-date">${lang === 'ar' ? 'تاريخ الطباعة' : 'Printed'}: ${printDate}</span>
        </header>

        <h3 class="print-section-title">${lang === 'ar' ? 'مخطط الأسنان (Palmer)' : 'Odontogram (Palmer Notation)'}</h3>
        ${renderOdontogram(patient, lang)}

        <h3 class="print-section-title">📑 ${lang === 'ar' ? 'الأشعة والمرفقات' : 'X-Rays & Attachments'}</h3>
        ${renderAttachments(attachments, lang)}
      </section>
    </div>
  `;

  container.classList.add('active-print');
  document.body.classList.add('printing-patient-file');

  const images = container.querySelectorAll('img');
  const imagePromises = Array.from(images).map(
    (img) =>
      new Promise<void>((resolve) => {
        if (img.complete) resolve();
        else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      })
  );

  Promise.all(imagePromises).then(() => {
    setTimeout(() => {
      window.print();
      setTimeout(() => {
        container.classList.remove('active-print');
        document.body.classList.remove('printing-patient-file');
        container.innerHTML = '';
      }, 500);
    }, 200);
  });
}
