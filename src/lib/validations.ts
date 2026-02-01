import { z } from 'zod';
import i18n from '@/lib/i18n';

// Helper to get translated validation messages
const t = (key: string, params?: Record<string, any>): string => {
  return i18n.t(`validation:${key}`, params) as string;
};

// ============================================
// User Validations (API: firstName 2-50, lastName 2-50, email valid, password 8-100)
// ============================================
export const userSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, { message: 'Must be at least 2 characters' })
    .max(50, { message: 'Must be at most 50 characters' }),
  lastName: z
    .string()
    .trim()
    .min(2, { message: 'Must be at least 2 characters' })
    .max(50, { message: 'Must be at most 50 characters' }),
  email: z
    .string()
    .trim()
    .email({ message: 'Invalid email address' })
    .max(255, { message: 'Must be at most 255 characters' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(100, { message: 'Must be at most 100 characters' }),
  role: z.enum(['USER', 'ADMIN', 'OWNER'], { errorMap: () => ({ message: 'This field is required' }) }),
  type: z.enum(['TECHNICIAN', 'ADMINISTRATION', 'SELLER'], { errorMap: () => ({ message: 'This field is required' }) }),
});

export const userUpdateSchema = userSchema.partial().omit({ password: true });

export type UserFormData = z.infer<typeof userSchema>;

// ============================================
// Work Validations (API: name 2-100, bidNumber required, orderNumber required, orderDate required)
// ============================================
export const workSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Must be at least 2 characters' })
    .max(100, { message: 'Must be at most 100 characters' }),
  bidNumber: z
    .string()
    .trim()
    .min(1, { message: 'This field is required' }),
  orderNumber: z
    .string()
    .trim()
    .min(1, { message: 'This field is required' }),
  orderDate: z
    .string()
    .min(1, { message: 'Date is required' }),
  description: z.string().optional(),
  expectedStartDate: z.string().optional(),
  nasSubDirectory: z.string().optional(),
  expectedOfficeHours: z
    .number()
    .min(0, { message: 'Value must be at least 0' })
    .optional(),
  expectedPlantHours: z
    .number()
    .min(0, { message: 'Value must be at least 0' })
    .optional(),
  electricalSchemaProgression: z
    .number()
    .min(0, { message: 'Value must be at least 0' })
    .max(100, { message: 'Value must be at most 100' })
    .optional(),
  programmingProgression: z
    .number()
    .min(0, { message: 'Value must be at least 0' })
    .max(100, { message: 'Value must be at most 100' })
    .optional(),
  sellerId: z.string().optional(),
  atixClientId: z.string().optional(),
  finalClientId: z.string().optional(),
  plantId: z.string().optional(),
  ticketId: z.string().optional(),
});

export type WorkFormData = z.infer<typeof workSchema>;

// ============================================
// Client Validations (API: name 2-100, type required)
// ============================================
export const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Must be at least 2 characters' })
    .max(100, { message: 'Must be at most 100 characters' }),
  type: z.enum(['ATIX', 'FINAL'], { errorMap: () => ({ message: 'This field is required' }) }),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// ============================================
// Plant Validations (API: name 2-100, all fields required)
// ============================================
export const plantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Must be at least 2 characters' })
    .max(100, { message: 'Must be at most 100 characters' }),
  notes: z.string().optional(),
  nasDirectory: z
    .string()
    .trim()
    .min(1, { message: 'This field is required' }),
  pswPhrase: z
    .string()
    .trim()
    .min(1, { message: 'This field is required' }),
  pswPlatform: z
    .string()
    .trim()
    .min(1, { message: 'This field is required' }),
  pswStation: z
    .string()
    .trim()
    .min(1, { message: 'This field is required' }),
});

export type PlantFormData = z.infer<typeof plantSchema>;

// ============================================
// Ticket Validations (API: name 2-100, description required, status required)
// ============================================
export const ticketSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Must be at least 2 characters' })
    .max(100, { message: 'Must be at most 100 characters' }),
  description: z
    .string()
    .trim()
    .min(1, { message: 'This field is required' }),
  senderEmail: z
    .string()
    .email({ message: 'Invalid email address' })
    .optional()
    .or(z.literal('')),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'], { 
    errorMap: () => ({ message: 'This field is required' }) 
  }),
});

export type TicketFormData = z.infer<typeof ticketSchema>;

// ============================================
// Work Report Entry Validations (API: description required, hours > 0)
// ============================================
export const workReportEntrySchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, { message: 'This field is required' }),
  hours: z
    .number()
    .positive({ message: 'Value must be greater than 0' }),
  date: z.string().optional(),
  technicianId: z.string().optional(),
});

export type WorkReportEntryFormData = z.infer<typeof workReportEntrySchema>;

// ============================================
// Worksite Reference Validations (API: name required)
// ============================================
export const worksiteReferenceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Must be at least 2 characters' })
    .max(100, { message: 'Must be at most 100 characters' }),
  telephone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+]?[\d\s()-]{7,20}$/.test(val),
      { message: 'Invalid phone number format' }
    ),
  notes: z.string().optional(),
});

export type WorksiteReferenceFormData = z.infer<typeof worksiteReferenceSchema>;

// ============================================
// Login Validation
// ============================================
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================
// Password Change Validation
// ============================================
export const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, { message: 'Password is required' }),
  newPassword: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(100, { message: 'Must be at most 100 characters' }),
  confirmPassword: z
    .string()
    .min(1, { message: 'Password is required' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

// ============================================
// Helper function to validate and get errors
// ============================================
export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: ValidationErrors<T> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: ValidationErrors<T> = {};
  result.error.errors.forEach((error) => {
    const path = error.path[0] as keyof T;
    if (path && !errors[path]) {
      errors[path] = error.message;
    }
  });
  
  return { success: false, errors };
}

// ============================================
// Simple field validation helper
// ============================================
export function validateField<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  field: keyof T,
  value: unknown
): string | null {
  const fieldSchema = schema.shape[field];
  if (!fieldSchema) return null;
  
  const result = fieldSchema.safeParse(value);
  if (result.success) return null;
  return result.error.errors[0]?.message || null;
}
