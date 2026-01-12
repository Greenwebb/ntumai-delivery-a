// @ts-nocheck

import { z } from 'zod';

/**
 * Authentication Schemas - Improved OTP Flow
 * 
 * Key improvements:
 * 1. Backend determines flow (login vs signup)
 * 2. Backend decides channels (SMS, email, or both)
 * 3. Phone numbers in E.164 format (+260972827372)
 * 4. SessionId-only verification (no re-sending identifiers)
 * 5. Two token paths: full tokens for existing users, onboarding token for new users
 * 6. OTP security: max attempts, rate limiting, single-use enforcement
 */

// ============================================================================
// ENUMS & BASIC SCHEMAS
// ============================================================================

export const FlowTypeSchema = z.enum(['login', 'signup']);
export const ChannelSchema = z.enum(['sms', 'email']);
export const RoleSchema = z.enum(['customer', 'tasker', 'vendor']);

// ============================================================================
// STEP 1: OTP START - POST /auth/otp/start
// ============================================================================

/**
 * Request to initiate OTP flow
 * Backend will:
 * - Normalize phone number
 * - Check if user exists
 * - Decide channels (SMS, email, or both)
 * - Create OTP session
 */
export const OtpStartRequestSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  phone: z
    .string()
    .regex(/^\+\d{1,3}\d{4,14}$/, 'Phone must be in E.164 format (e.g., +260972827372)')
    .optional(),
  deviceId: z.string().uuid().optional(),
}).refine(
  (data) => data.email || data.phone,
  'Either email or phone is required'
);

/**
 * Response from OTP start
 * Tells the app:
 * - sessionId: Use this for verification
 * - flowType: Whether this is login or signup
 * - channelsSent: Which channels the OTP was sent to
 * - expiresIn: How long the session is valid (in seconds)
 */
export const OtpStartResponseSchema = z.object({
  sessionId: z.string(),
  expiresIn: z.number().int().positive().default(600), // 10 minutes
  flowType: FlowTypeSchema, // 'login' or 'signup' - backend decided
  channelsSent: z.array(ChannelSchema), // ['sms', 'email'] or just one
  message: z.string().optional(),
});

// ============================================================================
// STEP 2: OTP VERIFY - POST /auth/otp/verify
// ============================================================================

/**
 * Request to verify OTP
 * Only needs sessionId and OTP code
 * Backend knows which user/contacts belong to that session
 */
export const OtpVerifyRequestSchema = z.object({
  sessionId: z.string(),
  otp: z.string().regex(/^\d{4,8}$/, 'OTP must be 4-8 digits'),
  deviceId: z.string().uuid().optional(),
});

/**
 * Response for existing user with role
 * Returns full tokens immediately
 */
export const OtpVerifyExistingUserResponseSchema = z.object({
  flowType: z.literal('login'),
  requiresRoleSelection: z.literal(false),
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int().positive().default(3600), // 1 hour
  user: z.object({
    id: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    role: RoleSchema,
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatar: z.string().optional(),
  }),
});

/**
 * Response for new user or user without role
 * Returns onboarding token (limited to role selection)
 */
export const OtpVerifyNewUserResponseSchema = z.object({
  flowType: z.literal('signup'),
  requiresRoleSelection: z.literal(true),
  onboardingToken: z.string(), // One-time token for role selection
  user: z.object({
    id: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  }),
});

export const OtpVerifyResponseSchema = z.union([
  OtpVerifyExistingUserResponseSchema,
  OtpVerifyNewUserResponseSchema,
]);

// ============================================================================
// STEP 3: SELECT ROLE - POST /auth/select-role
// ============================================================================

/**
 * Request to select role after signup
 * Must include onboardingToken (not bare userId)
 * This prevents spoofing
 */
export const SelectRoleRequestSchema = z.object({
  onboardingToken: z.string(),
  role: RoleSchema,
});

/**
 * Response from role selection
 * Issues full token set
 */
export const SelectRoleResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int().positive().default(3600), // 1 hour
  user: z.object({
    id: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    role: RoleSchema,
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatar: z.string().optional(),
  }),
});

// ============================================================================
// ADDITIONAL ENDPOINTS
// ============================================================================

/**
 * GET /auth/me - Validate current session
 * Called on app startup to check if user is still authenticated
 */
export const AuthMeResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    role: RoleSchema,
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatar: z.string().optional(),
    isVerified: z.boolean().default(false),
  }),
});

/**
 * POST /auth/refresh - Refresh access token
 * Called when access token is about to expire
 */
export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
  deviceId: z.string().uuid().optional(),
});

export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number().int().positive().default(3600),
});

/**
 * POST /auth/logout - Logout user
 * Invalidates current session
 */
export const LogoutRequestSchema = z.object({
  deviceId: z.string().uuid().optional(),
  allDevices: z.boolean().optional(),
});

export const LogoutResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// ============================================================================
// ERROR RESPONSES
// ============================================================================

/**
 * OTP verification error response
 */
export const OtpErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.enum([
      'INVALID_OTP',
      'OTP_EXPIRED',
      'MAX_ATTEMPTS_EXCEEDED',
      'SESSION_NOT_FOUND',
      'RATE_LIMITED',
    ]),
    message: z.string(),
    attemptsRemaining: z.number().int().optional(),
    retryAfter: z.number().int().optional(), // seconds
  }),
});

/**
 * Generic API error response
 */
export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
  }),
});

// ============================================================================
// LEGACY SCHEMAS (For backward compatibility during migration)
// ============================================================================

export const AuthMethodSchema = z.enum(['email', 'phone']);
export const AuthPurposeSchema = z.enum(['login', 'register', 'reset-password', 'verify']);

export const AuthChallengeRequestSchema = z.object({
  method: AuthMethodSchema,
  identifier: z.string().min(1, 'Identifier is required'),
  purpose: AuthPurposeSchema,
  countryCode: z
    .string()
    .regex(/^\+\d{1,4}$/, 'Country code must include "+" and up to 4 digits')
    .optional(),
  metadata: z
    .object({
      channel: z.enum(['sms', 'email']).optional(),
      deviceId: z.string().optional(),
      appVersion: z.string().optional(),
      locale: z.string().optional(),
    })
    .optional(),
});

export const AuthChallengeResponseSchema = z.object({
  challengeId: z.string(),
  expiresAt: z.string(),
  resendAvailableAt: z.string().optional(),
  method: AuthMethodSchema,
  purpose: AuthPurposeSchema,
  attemptLimit: z.number().int().positive().optional(),
  message: z.string().optional(),
});

export const AuthChallengeVerificationRequestSchema = z.object({
  challengeId: z.string(),
  code: z.string().min(4, 'Code must contain at least 4 characters').max(8),
  method: AuthMethodSchema.optional(),
  identifier: z.string().optional(),
  countryCode: z
    .string()
    .regex(/^\+\d{1,4}$/, 'Country code must include "+" and up to 4 digits')
    .optional(),
});

export const AuthSessionSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.number().int().positive().optional(),
  issuedAt: z.string(),
  scope: z.array(z.string()).optional(),
});

export const AuthVerificationResultSchema = z.object({
  session: AuthSessionSchema,
  user: z.custom<unknown>(),
  isNewUser: z.boolean().optional(),
  nextStep: z.enum(['authenticated', 'complete-profile', 'verify-contact']).optional(),
});

export const RefreshSessionRequestSchema = z.object({
  refreshToken: z.string(),
  deviceId: z.string().optional(),
});

export const RevokeSessionRequestSchema = z.object({
  allDevices: z.boolean().optional(),
  sessionId: z.string().optional(),
});

export const AuthProfileUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  countryCode: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  preferences: z.record(z.unknown()).optional(),
});
