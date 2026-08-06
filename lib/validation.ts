import { z } from 'zod';

const phoneSchema = z
  .string()
  .regex(/^09\d{8}$/, 'Phone must be 10 digits starting with 09');

const optionalPhoneSchema = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? undefined : val),
  z.string().regex(/^09\d{8}$/, 'Invalid phone format').optional()
);

const nationalNumberSchema = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? undefined : val),
  z
    .string()
    .regex(/^\d{12}$/, 'National number must be 12 digits')
    .optional()
);

export const medicalHistorySchema = z.object({
  qChronic: z.enum(['Yes', 'No']).optional(),
  qMeds: z.enum(['Yes', 'No']).optional(),
  qAllergies: z.enum(['Yes', 'No']).optional(),
  qRegularTreatment: z.enum(['Yes', 'No']).optional(),
  qSurgeries: z.enum(['Yes', 'No']).optional(),
  qExtraction: z.enum(['Yes', 'No']).optional(),
  qThyroid: z.enum(['Yes', 'No']).optional(),
  qPressure: z.enum(['Yes', 'No']).optional(),
  qDiabetes: z.enum(['Yes', 'No']).optional(),
  qHeart: z.enum(['Yes', 'No']).optional(),
  qKidneyLiver: z.enum(['Yes', 'No']).optional(),
  qBloodThinner: z.enum(['Yes', 'No']).optional(),
  qAnesthesiaAllergy: z.enum(['Yes', 'No']).optional(),
  qPregnancy: z.enum(['Yes', 'No']).optional(),
});

export const createPatientSchema = z.object({
  fileDate: z.string().optional(),
  fullName: z
    .string()
    .min(4)
    .refine((val) => val.trim().split(/\s+/).length >= 2, 'Full name required'),
  nationalId: z.string().optional(),
  nationalNumber: nationalNumberSchema,
  dob: z.string().optional(),
  gender: z.enum(['Male', 'Female']),
  address: z.string().optional(),
  patientNotes: z.string().optional(),
  phone: phoneSchema,
  additionalPhone: phoneSchema,
  emergencyName: z.string().optional(),
  emergencyPhone: optionalPhoneSchema,
  maritalStatus: z.string().optional(),
  eduStatus: z.string().optional(),
  bloodType: z.string().optional(),
  medicalHistory: medicalHistorySchema.optional(),
  hasInsurance: z.enum(['Yes', 'No']).optional(),
  insuranceCompany: z.string().optional(),
  insuranceCardNo: z.string().optional(),
});

export const updatePatientSchema = createPatientSchema.partial().extend({
  odontogram: z.record(z.string()).optional(),
  doctorId: z.string().nullable().optional(),
  doctorNotes: z.string().optional(),
});

export const createDoctorSchema = z.object({
  name: z.string().min(2),
  specialty: z.string().optional(),
  phone: z.string().optional(),
});

export const updateDoctorSchema = createDoctorSchema.partial().extend({
  active: z.boolean().optional(),
});

export const followUpSchema = z.object({
  patientId: z.string(),
  date: z.string().min(1),
  time: z.string().min(1),
  procedure: z.string().min(1),
  doctorNotes: z.string().optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const createUserSchema = z.object({
  username: z.string().min(2),
  password: z.string().min(6),
});
