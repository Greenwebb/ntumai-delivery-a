// @ts-nocheck
import type { z } from 'zod';
import type { User } from '@/types';
import {
  // New improved schemas
  OtpStartRequestSchema,
  OtpStartResponseSchema,
  OtpVerifyRequestSchema,
  OtpVerifyResponseSchema,
  OtpVerifyExistingUserResponseSchema,
  OtpVerifyNewUserResponseSchema,
  SelectRoleRequestSchema,
  SelectRoleResponseSchema,
  AuthMeResponseSchema,
  RefreshTokenRequestSchema,
  RefreshTokenResponseSchema,
  LogoutRequestSchema,
  LogoutResponseSchema,
  OtpErrorResponseSchema,
  ApiErrorResponseSchema,
  FlowTypeSchema,
  ChannelSchema,
  RoleSchema,
  // Legacy schemas (for backward compatibility)
  AuthChallengeRequestSchema,
  AuthChallengeResponseSchema,
  AuthChallengeVerificationRequestSchema,
  AuthSessionSchema,
  AuthVerificationResultSchema,
  RefreshSessionRequestSchema,
  RevokeSessionRequestSchema,
  AuthProfileUpdateSchema,
} from './schemas';

// ============================================================================
// NEW IMPROVED AUTH TYPES
// ============================================================================

export type FlowType = z.infer<typeof FlowTypeSchema>;
export type Channel = z.infer<typeof ChannelSchema>;
export type Role = z.infer<typeof RoleSchema>;

// OTP Start
export type OtpStartRequest = z.infer<typeof OtpStartRequestSchema>;
export type OtpStartResponse = z.infer<typeof OtpStartResponseSchema>;

// OTP Verify
export type OtpVerifyRequest = z.infer<typeof OtpVerifyRequestSchema>;
export type OtpVerifyExistingUserResponse = z.infer<typeof OtpVerifyExistingUserResponseSchema>;
export type OtpVerifyNewUserResponse = z.infer<typeof OtpVerifyNewUserResponseSchema>;
export type OtpVerifyResponse = z.infer<typeof OtpVerifyResponseSchema>;

// Select Role
export type SelectRoleRequest = z.infer<typeof SelectRoleRequestSchema>;
export type SelectRoleResponse = z.infer<typeof SelectRoleResponseSchema>;

// Additional endpoints
export type AuthMeResponse = z.infer<typeof AuthMeResponseSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
export type LogoutRequest = z.infer<typeof LogoutRequestSchema>;
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

// Error responses
export type OtpErrorResponse = z.infer<typeof OtpErrorResponseSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

// ============================================================================
// LEGACY AUTH TYPES (For backward compatibility during migration)
// ============================================================================

export type AuthChallengeRequest = z.infer<typeof AuthChallengeRequestSchema>;
export type AuthChallengeResponse = z.infer<typeof AuthChallengeResponseSchema>;
export type AuthChallengeVerificationRequest = z.infer<typeof AuthChallengeVerificationRequestSchema>;
export type AuthSession = z.infer<typeof AuthSessionSchema>;

type AuthVerificationResultBase = z.infer<typeof AuthVerificationResultSchema>;

export interface AuthVerificationResult extends Omit<AuthVerificationResultBase, 'user'> {
  user: User;
}

export type RefreshSessionRequest = z.infer<typeof RefreshSessionRequestSchema>;
export type RevokeSessionRequest = z.infer<typeof RevokeSessionRequestSchema>;
export type AuthProfileUpdate = z.infer<typeof AuthProfileUpdateSchema>;

// ============================================================================
// INTERNAL STATE TYPES
// ============================================================================

/**
 * OTP Session state tracked by the app
 * Used to manage the OTP flow on the client side
 */
export interface OtpSession {
  sessionId: string;
  flowType: FlowType;
  channelsSent: Channel[];
  expiresAt: Date;
  email?: string;
  phone?: string;
}

/**
 * Authentication state
 */
export interface AuthState {
  // User data
  user: User | null;
  
  // Tokens
  accessToken: string | null;
  refreshToken: string | null;
  
  // Onboarding token (for new users during signup)
  onboardingToken: string | null;
  
  // OTP session
  otpSession: OtpSession | null;
  
  // Authentication status
  isAuthenticated: boolean;
  hasRole: boolean;
  
  // Loading & error states
  isLoading: boolean;
  error: string | null;
  
  // Token expiry
  tokenExpiresAt: Date | null;
}

/**
 * User data returned from auth endpoints
 */
export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  role?: Role;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isVerified?: boolean;
}
