import type { Patient } from '@/lib/types';
import { escapeHtml } from '@/lib/utils';

export function printPatientFile(patient: Patient, lang: 'ar' | 'en') {
  const container = document.getElementById('printable-patient-container');
  if (!container) return;

  const med = patient.medicalHistory || {};
  const medKeys = [
    'qChronic', 'qMeds', 'qAllergies', 'qPressure', 'qDiabetes', 'qHeart', 'qBloodThinner',
  ] as const;

  const medRows = medKeys
    .map(
      (k) =>
        `<tr><td>${k}</td><td>${med[k] === 'Yes' ? (lang === 'ar' ? 'نعم' : 'Yes') : lang === 'ar' ? 'لا' : 'No'}</td></tr>`
    )
    .join('');

  container.innerHTML = `
    <div class="print-patient-sheet">
      <div class="print-patient-header">
        <h1>${lang === 'ar' ? 'المركز التخصصي لطب وزراعة الاسنان' : 'Advanced Dental Clinic'}</h1>
        <p>${lang === 'ar' ? 'ملف المريض' : 'Patient File'}</p>
      </div>
      <div class="print-patient-file-badge">
        <strong>${escapeHtml(patient.fileNumber)}</strong>
        <span>${escapeHtml(patient.fileDate)}</span>
      </div>
      <h2>${escapeHtml(patient.fullName)}</h2>
      <table class="print-patient-table">
        <tr><th>${lang === 'ar' ? 'الهاتف' : 'Phone'}</th><td dir="ltr">${escapeHtml(patient.phone)}</td></tr>
        <tr><th>${lang === 'ar' ? 'هاتف إضافي' : 'Alt. Phone'}</th><td dir="ltr">${escapeHtml(patient.additionalPhone)}</td></tr>
        <tr><th>${lang === 'ar' ? 'الرقم الوطني' : 'National No.'}</th><td>${escapeHtml(patient.nationalNumber || '-')}</td></tr>
        <tr><th>${lang === 'ar' ? 'تاريخ الميلاد' : 'DOB'}</th><td>${escapeHtml(patient.dob || '-')}</td></tr>
        <tr><th>${lang === 'ar' ? 'الطبيب المعالج' : 'Assigned Doctor'}</th><td>${escapeHtml(patient.doctorName || '-')}</td></tr>
        <tr><th>${lang === 'ar' ? 'العنوان' : 'Address'}</th><td>${escapeHtml(patient.address || '-')}</td></tr>
      </table>
      ${patient.patientNotes ? `<div class="print-patient-notes"><strong>${lang === 'ar' ? 'ملاحظات المريض' : 'Patient Notes'}:</strong><p>${escapeHtml(patient.patientNotes)}</p></div>` : ''}
      ${patient.doctorNotes ? `<div class="print-patient-notes doctor"><strong>${lang === 'ar' ? 'ملاحظات الطبيب' : 'Doctor Notes'}:</strong><p>${escapeHtml(patient.doctorNotes)}</p></div>` : ''}
      <h3>${lang === 'ar' ? 'التاريخ الطبي' : 'Medical History'}</h3>
      <table class="print-patient-table">${medRows}</table>
    </div>
  `;

  container.classList.add('active-print');
  document.body.classList.add('printing-patient-file');

  setTimeout(() => {
    window.print();
    setTimeout(() => {
      container.classList.remove('active-print');
      document.body.classList.remove('printing-patient-file');
    }, 500);
  }, 150);
}
