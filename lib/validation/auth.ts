import { z } from 'zod';

/**
 * Phone validation schema
 * Validates phone numbers with country code
 */
export const phoneSchema = z.object({
  phone: z
    .string()
    .min(9, 'Phone number must be at least 9 digits')
    .max(15, 'Phone number must not exceed 15 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
  countryCode: z
    .string()
    .regex(/^\+[0-9]{1,4}$/, 'Invalid country code format'),
});

/**
 * Email validation schema
 */
export const emailSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must not exceed 255 characters'),
});

/**
 * OTP validation schema
 */
export const otpSchema = z.object({
  otp: z
    .string()
    .length(4, 'OTP must be exactly 4 digits')
    .regex(/^[0-9]{4}$/, 'OTP must contain only digits'),
});

/**
 * Login credentials schema (phone or email)
 */
export const loginCredentialsSchema = z.union([phoneSchema, emailSchema]);

/**
 * Validation helper functions
 */
export const validatePhone = (phone: string, countryCode: string) => {
  try {
    phoneSchema.parse({ phone, countryCode });
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map((err: z.ZodIssue) => err.message),
      };
    }
    return { isValid: false, errors: ['Invalid phone number'] };
  }
};

export const validateEmail = (email: string) => {
  try {
    emailSchema.parse({ email });
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map((err: z.ZodIssue) => err.message),
      };
    }
    return { isValid: false, errors: ['Invalid email address'] };
  }
};

export const validateOtp = (otp: string) => {
  try {
    otpSchema.parse({ otp });
    return { isValid: true, errors: [] };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.issues.map((err: z.ZodIssue) => err.message),
      };
    }
    return { isValid: false, errors: ['Invalid OTP'] };
  }
};

/**
 * Type exports
 */
export type PhoneCredentials = z.infer<typeof phoneSchema>;
export type EmailCredentials = z.infer<typeof emailSchema>;
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type OtpCredentials = z.infer<typeof otpSchema>;
