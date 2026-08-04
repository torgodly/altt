'use client';

import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/components/AppProvider';
import { Header } from '@/components/Header';
import { t } from '@/lib/i18n';
import {
  validatePatientForm,
  mapApiErrors,
  vm,
  type FieldErrors,
  type PatientFormValues,
} from '@/lib/form-validation';
import type { Patient, MedicalHistory } from '@/lib/types';

const MEDICAL_KEYS: (keyof MedicalHistory)[] = [
  'qChronic',
  'qMeds',
  'qAllergies',
  'qRegularTreatment',
  'qSurgeries',
  'qExtraction',
  'qThyroid',
  'qPressure',
  'qDiabetes',
  'qHeart',
  'qKidneyLiver',
  'qBloodThinner',
  'qAnesthesiaAllergy',
  'qPregnancy',
];

function Field({
  name,
  label,
  required,
  hint,
  error,
  children,
  className = '',
}: {
  name: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`form-group ${error ? 'error' : ''} ${className}`}
      data-field={name}
      id={`field-${name}`}
    >
      <label htmlFor={name}>
        {label}
        {required && <span className="required-asterisk"> *</span>}
      </label>
      {children}
      <span className="validation-hint" role={error ? 'alert' : undefined}>
        {error ? `⚠ ${error}` : hint}
      </span>
    </div>
  );
}

export function PatientRegistrationForm() {
  const { lang, showToast } = useApp();
  const formRef = useRef<HTMLFormElement>(null);
  const [fileDate, setFileDate] = useState('');
  const [showInsurance, setShowInsurance] = useState(false);
  const [showPregnancy, setShowPregnancy] = useState(false);
  const [savedPatient, setSavedPatient] = useState<Patient | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [showFormError, setShowFormError] = useState(false);

  useEffect(() => {
    setFileDate(new Date().toISOString().split('T')[0]);
  }, []);

  function clearError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setShowFormError(false);
  }

  function scrollToFirstError(fieldErrors: FieldErrors) {
    const first = Object.keys(fieldErrors)[0];
    if (!first) return;
    const el = document.getElementById(`field-${first}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function readFormValues(form: HTMLFormElement): PatientFormValues {
    const fd = new FormData(form);
    return {
      fullName: String(fd.get('fullName') || '').trim(),
      nationalId: String(fd.get('nationalId') || '').trim(),
      nationalNumber: String(fd.get('nationalNumber') || '').trim(),
      dob: String(fd.get('dob') || ''),
      gender: String(fd.get('gender') || 'Male'),
      address: String(fd.get('address') || '').trim(),
      patientNotes: String(fd.get('patientNotes') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      additionalPhone: String(fd.get('additionalPhone') || '').trim(),
      emergencyName: String(fd.get('emergencyName') || '').trim(),
      emergencyPhone: String(fd.get('emergencyPhone') || '').trim(),
      maritalStatus: String(fd.get('maritalStatus') || ''),
      eduStatus: String(fd.get('eduStatus') || ''),
      bloodType: String(fd.get('bloodType') || ''),
      hasInsurance: String(fd.get('hasInsurance') || 'No'),
      insuranceCompany: String(fd.get('insuranceCompany') || '').trim(),
      insuranceCardNo: String(fd.get('insuranceCardNo') || '').trim(),
    };
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const values = readFormValues(form);

    const clientErrors = validatePatientForm(values, lang);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      setShowFormError(true);
      showToast(vm(lang, 'formHasErrors'), 'error');
      scrollToFirstError(clientErrors);
      return;
    }

    setErrors({});
    setShowFormError(false);
    setSubmitting(true);

    const fd = new FormData(form);
    const medicalHistory: MedicalHistory = {};
    for (const key of MEDICAL_KEYS) {
      medicalHistory[key] = (fd.get(key) as string) || 'No';
    }

    const payload = { ...values, fileDate, medicalHistory };

    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const apiErrors = mapApiErrors(data.details, lang);
        if (Object.keys(apiErrors).length > 0) {
          setErrors(apiErrors);
          setShowFormError(true);
          scrollToFirstError(apiErrors);
        }
        showToast(data.error === 'Validation failed' ? vm(lang, 'formHasErrors') : vm(lang, 'formHasErrors'), 'error');
        return;
      }

      setSavedPatient(data.patient);
      showToast(lang === 'ar' ? 'تم حفظ الملف بنجاح' : 'Record saved successfully', 'success');
      form.reset();
      setShowInsurance(false);
      setShowPregnancy(false);
      setErrors({});
      setShowFormError(false);
    } catch {
      showToast(lang === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Save failed', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setErrors({});
    setShowFormError(false);
    setShowInsurance(false);
    setShowPregnancy(false);
  }

  const digitsOnly = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
  };

  return (
    <>
      <Header showAdminLink />

      <section className="page-banner registration-banner">
        <div className="banner-content">
          <h2>{vm(lang, 'registrationTitle')}</h2>
          <p>{vm(lang, 'registrationSub')}</p>
        </div>
        <div className="registration-date-badge">
          <span>{vm(lang, 'todayDate')}</span>
          <strong>{fileDate}</strong>
        </div>
      </section>

      <div className="registration-steps" aria-hidden="true">
        <div className="registration-step active">
          <span>1</span> {vm(lang, 'stepPersonal')}
        </div>
        <div className="registration-step">
          <span>2</span> {vm(lang, 'stepMedical')}
        </div>
        <div className="registration-step">
          <span>3</span> {vm(lang, 'stepInsurance')}
        </div>
      </div>

      <p className="registration-required-note">{vm(lang, 'requiredFieldsNote')}</p>

      {showFormError && Object.keys(errors).length > 0 && (
        <div className="form-error-banner" role="alert">
          <span>⚠</span>
          <div>
            <strong>{vm(lang, 'formHasErrors')}</strong>
            <ul>
              {Object.entries(errors).map(([field, msg]) => (
                <li key={field}>
                  <button
                    type="button"
                    onClick={() => document.getElementById(`field-${field}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  >
                    {msg}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form ref={formRef} id="patient-registration-form" onSubmit={handleSubmit} onReset={handleReset} noValidate>
        {/* Section 1 — Personal */}
        <div className="glass-card registration-section">
          <div className="section-header">
            <div className="section-icon">1</div>
            <div>
              <h3>{t(lang, 'secPersonal')}</h3>
              <p>{t(lang, 'secPersonalSub')}</p>
            </div>
          </div>

          <div className="registration-subsection">
            <h4 className="registration-subsection-title">{lang === 'ar' ? '👤 الهوية والاسم' : '👤 Identity'}</h4>
            <div className="form-grid form-grid-2">
              <Field
                name="fullName"
                label={t(lang, 'fullName')}
                required
                hint={vm(lang, 'nameHint')}
                error={errors.fullName}
                className="full-width"
              >
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="form-control"
                  placeholder={t(lang, 'fullNamePlaceholder')}
                  onChange={() => clearError('fullName')}
                />
              </Field>
              <Field name="nationalId" label={t(lang, 'nationalId')} error={errors.nationalId}>
                <input
                  id="nationalId"
                  name="nationalId"
                  type="text"
                  className="form-control no-icon"
                  placeholder={t(lang, 'nationalIdPlaceholder')}
                />
              </Field>
              <Field
                name="nationalNumber"
                label={t(lang, 'nationalNumber')}
                hint={vm(lang, 'nationalHint')}
                error={errors.nationalNumber}
              >
                <input
                  id="nationalNumber"
                  name="nationalNumber"
                  type="text"
                  className="form-control"
                  maxLength={12}
                  placeholder={t(lang, 'nationalNumberPlaceholder')}
                  onInput={digitsOnly}
                  onChange={() => clearError('nationalNumber')}
                />
              </Field>
              <Field name="dob" label={t(lang, 'dob')}>
                <input id="dob" name="dob" type="date" className="form-control no-icon" />
              </Field>
              <Field name="gender" label={t(lang, 'gender')}>
                <select
                  id="gender"
                  name="gender"
                  className="form-control no-icon"
                  defaultValue="Male"
                  onChange={(e) => setShowPregnancy(e.target.value === 'Female')}
                >
                  <option value="Male">{t(lang, 'male')}</option>
                  <option value="Female">{t(lang, 'female')}</option>
                </select>
              </Field>
            </div>
          </div>

          <div className="registration-subsection">
            <h4 className="registration-subsection-title">{lang === 'ar' ? '📱 التواصل' : '📱 Contact'}</h4>
            <div className="form-grid form-grid-2">
              <Field
                name="phone"
                label={t(lang, 'phone')}
                required
                hint={vm(lang, 'phoneHint')}
                error={errors.phone}
              >
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  className="form-control"
                  maxLength={10}
                  placeholder={t(lang, 'phonePlaceholder')}
                  dir="ltr"
                  onInput={digitsOnly}
                  onChange={() => clearError('phone')}
                />
              </Field>
              <Field
                name="additionalPhone"
                label={t(lang, 'additionalPhone')}
                required
                hint={vm(lang, 'phoneHint')}
                error={errors.additionalPhone}
              >
                <input
                  id="additionalPhone"
                  name="additionalPhone"
                  type="tel"
                  inputMode="numeric"
                  className="form-control"
                  maxLength={10}
                  placeholder={t(lang, 'additionalPhonePlaceholder')}
                  dir="ltr"
                  onInput={digitsOnly}
                  onChange={() => clearError('additionalPhone')}
                />
              </Field>
              <Field name="emergencyName" label={t(lang, 'emergencyName')}>
                <input id="emergencyName" name="emergencyName" type="text" className="form-control no-icon" />
              </Field>
              <Field name="emergencyPhone" label={t(lang, 'emergencyPhone')} error={errors.emergencyPhone} hint={vm(lang, 'phoneHint')}>
                <input
                  id="emergencyPhone"
                  name="emergencyPhone"
                  type="tel"
                  inputMode="numeric"
                  className="form-control"
                  maxLength={10}
                  dir="ltr"
                  onInput={digitsOnly}
                  onChange={() => clearError('emergencyPhone')}
                />
              </Field>
            </div>
          </div>

          <div className="registration-subsection">
            <h4 className="registration-subsection-title">{lang === 'ar' ? '📋 تفاصيل إضافية' : '📋 Additional details'}</h4>
            <div className="form-grid form-grid-3">
              <Field name="maritalStatus" label={t(lang, 'maritalStatus')}>
                <select id="maritalStatus" name="maritalStatus" className="form-control no-icon" defaultValue="Single">
                  <option value="Single">{t(lang, 'single')}</option>
                  <option value="Married">{t(lang, 'married')}</option>
                  <option value="Divorced">{t(lang, 'divorced')}</option>
                  <option value="Widowed">{t(lang, 'widowed')}</option>
                </select>
              </Field>
              <Field name="eduStatus" label={t(lang, 'eduStatus')}>
                <select id="eduStatus" name="eduStatus" className="form-control no-icon" defaultValue="Primary">
                  <option value="Primary">{t(lang, 'primaryEdu')}</option>
                  <option value="Secondary">{t(lang, 'secondaryEdu')}</option>
                  <option value="University">{t(lang, 'universityEdu')}</option>
                </select>
              </Field>
              <Field name="bloodType" label={t(lang, 'bloodType')}>
                <select id="bloodType" name="bloodType" className="form-control no-icon" defaultValue="A+">
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </Field>
              <Field name="address" label={t(lang, 'address')} className="full-width">
                <textarea id="address" name="address" className="form-control no-icon" placeholder={t(lang, 'addressPlaceholder')} rows={2} />
              </Field>
              <Field name="patientNotes" label={t(lang, 'patientNotes')} className="full-width">
                <textarea id="patientNotes" name="patientNotes" className="form-control no-icon" placeholder={t(lang, 'patientNotesPlaceholder')} rows={2} />
              </Field>
            </div>
          </div>
        </div>

        {/* Section 2 — Medical */}
        <div className="glass-card registration-section">
          <div className="section-header">
            <div className="section-icon">2</div>
            <div>
              <h3>{t(lang, 'secMedical')}</h3>
              <p>{t(lang, 'secMedicalSub')}</p>
            </div>
          </div>
          <div className="medical-questions-list">
            {MEDICAL_KEYS.filter((k) => k !== 'qPregnancy').map((key) => (
              <div key={key} className="medical-item">
                <span className="medical-item-text">{t(lang, key)}</span>
                <div className="radio-group">
                  <label className="custom-radio">
                    <input type="radio" name={key} value="Yes" /> {t(lang, 'yes')}
                  </label>
                  <label className="custom-radio">
                    <input type="radio" name={key} value="No" defaultChecked /> {t(lang, 'no')}
                  </label>
                </div>
              </div>
            ))}
            {showPregnancy && (
              <div className="medical-item">
                <span className="medical-item-text">{t(lang, 'qPregnancy')}</span>
                <div className="radio-group">
                  <label className="custom-radio">
                    <input type="radio" name="qPregnancy" value="Yes" /> {t(lang, 'yes')}
                  </label>
                  <label className="custom-radio">
                    <input type="radio" name="qPregnancy" value="No" defaultChecked /> {t(lang, 'no')}
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 3 — Insurance */}
        <div className="glass-card registration-section">
          <div className="section-header">
            <div className="section-icon">3</div>
            <div>
              <h3>{t(lang, 'secInsurance')}</h3>
              <p>{t(lang, 'secInsuranceSub')}</p>
            </div>
          </div>
          <div className="form-group">
            <label>{t(lang, 'hasInsurance')}</label>
            <div className="radio-group">
              <label className="custom-radio">
                <input type="radio" name="hasInsurance" value="Yes" onChange={() => setShowInsurance(true)} /> {t(lang, 'yes')}
              </label>
              <label className="custom-radio">
                <input type="radio" name="hasInsurance" value="No" defaultChecked onChange={() => setShowInsurance(false)} /> {t(lang, 'no')}
              </label>
            </div>
          </div>
          {showInsurance && (
            <div className="form-grid form-grid-2 insurance-fields">
              <Field name="insuranceCompany" label={t(lang, 'insuranceCompany')}>
                <input id="insuranceCompany" name="insuranceCompany" type="text" className="form-control no-icon" />
              </Field>
              <Field name="insuranceCardNo" label={t(lang, 'insuranceCardNo')}>
                <input id="insuranceCardNo" name="insuranceCardNo" type="text" className="form-control no-icon" />
              </Field>
            </div>
          )}
        </div>

        <div className="registration-actions">
          <button type="reset" className="btn btn-secondary">{t(lang, 'resetForm')}</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? '⏳ ...' : `💾 ${t(lang, 'submitForm')}`}
          </button>
        </div>
      </form>

      {savedPatient && (
        <div className="modal-backdrop active" onClick={() => setSavedPatient(null)}>
          <div className="modal-container success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✅ {t(lang, 'successTitle')}</h3>
              <button type="button" className="modal-close-btn" onClick={() => setSavedPatient(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="success-modal-intro">{t(lang, 'successMsg')}</p>
              <div className="file-badge-box success-file-badge">
                <span>{t(lang, 'fileNumberLabel')}</span>
                <strong>{savedPatient.fileNumber}</strong>
              </div>
              <div className="success-patient-summary">
                <p><strong>{t(lang, 'fullName')}:</strong> {savedPatient.fullName}</p>
                <p><strong>{t(lang, 'phone')}:</strong> <span dir="ltr">{savedPatient.phone}</span></p>
                <p><strong>{t(lang, 'fileDateLabel')}:</strong> {savedPatient.fileDate}</p>
              </div>
            </div>
            <div className="modal-footer success-modal-footer">
              <p className="success-save-note">
                {lang === 'ar'
                  ? '📌 يرجى حفظ رقم الملف — ستحتاجه عند زيارة العيادة'
                  : '📌 Please save your file number — you will need it at the clinic'}
              </p>
              <button type="button" className="btn btn-primary btn-lg" onClick={() => setSavedPatient(null)}>
                {t(lang, 'closeModal')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
