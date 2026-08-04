import type { Lang } from '@/lib/types';

export type FieldErrors = Record<string, string>;

export interface PatientFormValues {
  fullName: string;
  nationalId: string;
  nationalNumber: string;
  dob: string;
  gender: string;
  address: string;
  patientNotes: string;
  phone: string;
  additionalPhone: string;
  emergencyName: string;
  emergencyPhone: string;
  maritalStatus: string;
  eduStatus: string;
  bloodType: string;
  hasInsurance: string;
  insuranceCompany: string;
  insuranceCardNo: string;
}

const MESSAGES = {
  ar: {
    valRequired: 'هذا الحقل مطلوب',
    valFullName: 'يرجى كتابة الاسم رباعياً (اسمين على الأقل)',
    valNationalNum: 'الرقم الوطني يجب أن يتكون من 12 رقماً بالضبط',
    valPhone: 'رقم الهاتف: 10 أرقام ويبدأ بـ 09',
    valAdditionalPhone: 'رقم الهاتف الإضافي: 10 أرقام ويبدأ بـ 09',
    valEmergencyPhone: 'رقم الطوارئ: 10 أرقام ويبدأ بـ 09',
    formHasErrors: 'يرجى تصحيح الحقول المحددة أدناه',
    phoneHint: 'مثال: 0912345678',
    nameHint: 'الاسم الكامل — اسمين على الأقل',
    nationalHint: '12 رقماً فقط (اختياري)',
    requiredFieldsNote: 'الحقول بعلامة * مطلوبة',
    stepPersonal: 'البيانات الشخصية',
    stepMedical: 'التاريخ الطبي',
    stepInsurance: 'التأمين',
    registrationTitle: 'استمارة تسجيل مريض جديد',
    registrationSub: 'يرجى تعبئة البيانات بدقة — سيتم إنشاء رقم الملف بعد الحفظ',
    todayDate: 'تاريخ اليوم',
  },
  en: {
    valRequired: 'This field is required',
    valFullName: 'Please enter full name (at least 2 words)',
    valNationalNum: 'National number must be exactly 12 digits',
    valPhone: 'Phone: 10 digits starting with 09',
    valAdditionalPhone: 'Additional phone: 10 digits starting with 09',
    valEmergencyPhone: 'Emergency phone: 10 digits starting with 09',
    formHasErrors: 'Please fix the highlighted fields below',
    phoneHint: 'Example: 0912345678',
    nameHint: 'Full name — at least 2 words',
    nationalHint: '12 digits only (optional)',
    requiredFieldsNote: 'Fields marked * are required',
    stepPersonal: 'Personal Info',
    stepMedical: 'Medical History',
    stepInsurance: 'Insurance',
    registrationTitle: 'New Patient Registration',
    registrationSub: 'Fill in the details — your file number is created after saving',
    todayDate: "Today's date",
  },
};

export function vm(lang: Lang, key: keyof typeof MESSAGES.ar): string {
  return MESSAGES[lang][key];
}

function isPhone(val: string) {
  return /^09\d{8}$/.test(val);
}

export function validatePatientForm(values: PatientFormValues, lang: Lang): FieldErrors {
  const errors: FieldErrors = {};
  const m = MESSAGES[lang];

  const name = values.fullName.trim();
  if (!name) {
    errors.fullName = m.valRequired;
  } else if (name.length < 4 || name.split(/\s+/).filter(Boolean).length < 2) {
    errors.fullName = m.valFullName;
  }

  if (!values.phone.trim()) {
    errors.phone = m.valRequired;
  } else if (!isPhone(values.phone.trim())) {
    errors.phone = m.valPhone;
  }

  if (!values.additionalPhone.trim()) {
    errors.additionalPhone = m.valRequired;
  } else if (!isPhone(values.additionalPhone.trim())) {
    errors.additionalPhone = m.valAdditionalPhone;
  }

  const nat = values.nationalNumber.trim();
  if (nat && !/^\d{12}$/.test(nat)) {
    errors.nationalNumber = m.valNationalNum;
  }

  const emerg = values.emergencyPhone.trim();
  if (emerg && !isPhone(emerg)) {
    errors.emergencyPhone = m.valEmergencyPhone;
  }

  return errors;
}

export function mapApiErrors(details: unknown, lang: Lang): FieldErrors {
  const errors: FieldErrors = {};
  if (!details || typeof details !== 'object') return errors;

  const flat = details as { fieldErrors?: Record<string, string[]> };
  const fieldErrors = flat.fieldErrors;
  if (!fieldErrors) return errors;

  const map: Record<string, string> = {
    fullName: vm(lang, 'valFullName'),
    phone: vm(lang, 'valPhone'),
    additionalPhone: vm(lang, 'valAdditionalPhone'),
    nationalNumber: vm(lang, 'valNationalNum'),
    emergencyPhone: vm(lang, 'valEmergencyPhone'),
  };

  for (const [key, msgs] of Object.entries(fieldErrors)) {
    if (msgs?.length) {
      errors[key] = map[key] || msgs[0];
    }
  }
  return errors;
}
