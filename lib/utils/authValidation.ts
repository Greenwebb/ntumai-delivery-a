import { z, ZodError } from 'zod';

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .max(20, 'Phone number is too long')
    .refine((phone) => /^[0-9\s\-\+\(\)]+$/.test(phone), 'Invalid phone number'),
  countryCode: z
    .string()
    .min(1, 'Country code is required')
    .regex(/^\+[1-9]\d{0,3}$/, 'Invalid country code'),
});

const emailSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
});

export const loginCredentialsSchema = z.union([phoneSchema, emailSchema]);

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .min(2, 'First name must be at least 2 characters')
      .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .min(2, 'Last name must be at least 2 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
    acceptTerms: z.boolean().refine((value) => value, 'Please accept the Terms and Conditions'),
  })
  .and(loginCredentialsSchema);

const parseResult = <T>(fn: () => T) => {
  try {
    fn();
    return { isValid: true as const, errors: [] as string[] };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        isValid: false as const,
        errors: error.issues.map((issue) => issue.message),
      };
    }
    return {
      isValid: false as const,
      errors: ['Validation failed'],
    };
  }
};

export const validatePhone = (phone: string, countryCode: string) =>
  parseResult(() => phoneSchema.parse({ phone, countryCode }));

export const validateEmail = (email: string) =>
  parseResult(() => emailSchema.parse({ email }));

export const validateLoginCredentials = (credentials: { phone?: string; countryCode?: string; email?: string }) => {
  if (credentials.phone) {
    return validatePhone(credentials.phone, credentials.countryCode ?? '+1');
  }
  if (credentials.email) {
    return validateEmail(credentials.email);
  }
  return {
    isValid: false as const,
    errors: ['Either email or phone number is required'],
  };
};
