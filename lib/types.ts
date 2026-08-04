export type Lang = 'ar' | 'en';

export interface MedicalHistory {
  qChronic?: string;
  qMeds?: string;
  qAllergies?: string;
  qRegularTreatment?: string;
  qSurgeries?: string;
  qExtraction?: string;
  qThyroid?: string;
  qPressure?: string;
  qDiabetes?: string;
  qHeart?: string;
  qKidneyLiver?: string;
  qBloodThinner?: string;
  qAnesthesiaAllergy?: string;
  qPregnancy?: string;
}

export type Odontogram = Record<string, string>;

export interface FollowUp {
  id: string;
  date: string;
  dayName: string;
  time: string;
  time12: string;
  procedure: string;
  doctorNotes: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  patientId: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
}

export interface Patient {
  id: string;
  fileNumber: string;
  fileDate: string;
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
  medicalHistory: MedicalHistory;
  hasInsurance: string;
  insuranceCompany: string;
  insuranceCardNo: string;
  odontogram: Odontogram;
  followUps?: FollowUp[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  isoTimestamp: string;
  timestamp: string;
  user: string;
  action: string;
  actionType: string;
  icon: string | null;
  label: string | null;
  color: string | null;
  patientId: string;
  details: string;
  page: string;
}

export interface SessionUser {
  username: string;
  isSuperAdmin: boolean;
}
