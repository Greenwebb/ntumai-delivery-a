// @ts-nocheck

/**
 * Mock Authentication Services - Improved OTP Flow
 * 
 * This implements the improved authentication flow with:
 * - Backend-driven flow determination (login vs signup)
 * - Backend-driven channel selection (SMS, email, or both)
 * - E.164 phone format standardization
 * - SessionId-only verification
 * - Two token paths (full tokens vs onboarding token)
 * - OTP security (max attempts, rate limiting, single-use)
 */

import { mockUsers, generateId } from './mockData';
import type {
  OtpStartRequest,
  OtpStartResponse,
  OtpVerifyRequest,
  OtpVerifyResponse,
  OtpVerifyExistingUserResponse,
  OtpVerifyNewUserResponse,
  SelectRoleRequest,
  SelectRoleResponse,
  AuthMeResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutResponse,
} from './modules/auth/types';

// Simulate network delay
const delay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// OTP SESSION MANAGEMENT (In-Memory)
// ============================================================================

interface OtpSessionData {
  sessionId: string;
  email?: string;
  phone?: string;
  flowType: 'login' | 'signup';
  channelsSent: ('sms' | 'email')[];
  otpCode: string;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  expiresAt: Date;
  verified: boolean;
  userId?: string;
}

interface OnboardingSessionData {
  onboardingToken: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

// In-memory storage (in production, use database)
const otpSessions = new Map<string, OtpSessionData>();
const onboardingSessions = new Map<string, OnboardingSessionData>();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalize phone number to E.164 format
 * Input: "+260", "0972827372" → Output: "+260972827372"
 * Input: "+260972827372" → Output: "+260972827372"
 */
function normalizePhoneToE164(phone: string): string {
  // Remove all non-digit characters except leading +
  let normalized = phone.replace(/[^\d+]/g, '');
  
  // If starts with 0, remove it (local format)
  if (normalized.startsWith('0')) {
    normalized = normalized.substring(1);
  }
  
  // Ensure it starts with +
  if (!normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }
  
  return normalized;
}

/**
 * Check if user exists by email or phone
 */
function findUserByContact(email?: string, phone?: string): typeof mockUsers.customer1 | null {
  if (email) {
    const user = Object.values(mockUsers).find(u => u.email === email);
    if (user) return user;
  }
  
  if (phone) {
    const normalizedPhone = normalizePhoneToE164(phone);
    const user = Object.values(mockUsers).find(u => u.phone === normalizedPhone);
    if (user) return user;
  }
  
  return null;
}

/**
 * Determine which channels to use for OTP
 * In production, this would respect user preferences and business rules
 */
function determineChannels(email?: string, phone?: string): ('sms' | 'email')[] {
  const channels: ('sms' | 'email')[] = [];
  
  if (phone) channels.push('sms');
  if (email) channels.push('email');
  
  // If only one provided, use that one
  // If both provided, use both (more secure)
  return channels.length > 0 ? channels : ['email'];
}

/**
 * Generate a mock OTP code
 * In production, this would be a secure random 6-digit code
 */
function generateOtpCode(): string {
  // For testing, use a predictable code
  return '123456';
}

/**
 * Clean up expired sessions
 */
function cleanupExpiredSessions() {
  const now = new Date();
  
  for (const [sessionId, session] of otpSessions.entries()) {
    if (session.expiresAt < now) {
      otpSessions.delete(sessionId);
    }
  }
  
  for (const [token, session] of onboardingSessions.entries()) {
    if (session.expiresAt < now) {
      onboardingSessions.delete(token);
    }
  }
}

// ============================================================================
// STEP 1: OTP START - POST /auth/otp/start
// ============================================================================

/**
 * Initiate OTP flow
 * 
 * Backend responsibilities:
 * 1. Normalize phone number to E.164 format
 * 2. Check if user exists (login vs signup)
 * 3. Decide channels (SMS, email, or both)
 * 4. Create OTP session
 * 5. Send OTP via selected channels
 * 
 * Response tells app:
 * - sessionId: Use this for verification
 * - flowType: Whether this is login or signup
 * - channelsSent: Which channels OTP was sent to
 */
export const mockOtpStartService = {
  async start(request: OtpStartRequest): Promise<OtpStartResponse> {
    await delay();
    
    // Normalize phone if provided
    let normalizedPhone = request.phone;
    if (request.phone) {
      normalizedPhone = normalizePhoneToE164(request.phone);
    }
    
    // Check if user exists
    const existingUser = findUserByContact(request.email, normalizedPhone);
    const flowType = existingUser ? 'login' : 'signup';
    
    // Determine channels
    const channelsSent = determineChannels(request.email, normalizedPhone);
    
    // Generate OTP session
    const sessionId = generateId('session');
    const otpCode = generateOtpCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
    
    // Store session
    otpSessions.set(sessionId, {
      sessionId,
      email: request.email,
      phone: normalizedPhone,
      flowType,
      channelsSent,
      otpCode,
      attempts: 0,
      maxAttempts: 5,
      createdAt: now,
      expiresAt,
      verified: false,
      userId: existingUser?.id,
    });
    
    // In production:
    // - Send OTP via SMS using Twilio or similar
    // - Send OTP via email using SendGrid or similar
    // - Log this for audit purposes
    // - Implement rate limiting
    
    console.log(`[MOCK] OTP sent to ${channelsSent.join(' and ')}`);
    console.log(`[MOCK] OTP Code: ${otpCode} (for testing only)`);
    
    return {
      sessionId,
      expiresIn: 600, // 10 minutes in seconds
      flowType,
      channelsSent,
      message: `OTP sent to ${channelsSent.join(' and ')}`,
    };
  },
};

// ============================================================================
// STEP 2: OTP VERIFY - POST /auth/otp/verify
// ============================================================================

/**
 * Verify OTP code
 * 
 * Backend responsibilities:
 * 1. Validate session exists and not expired
 * 2. Check OTP code
 * 3. Enforce max attempts
 * 4. Mark OTP as single-use (invalidate after success)
 * 5. Issue tokens or onboarding token
 * 
 * Two paths:
 * - Existing user with role: Return full tokens
 * - New user or no role: Return onboarding token
 */
export const mockOtpVerifyService = {
  async verify(request: OtpVerifyRequest): Promise<OtpVerifyResponse> {
    await delay();
    
    cleanupExpiredSessions();
    
    // Validate session exists
    const session = otpSessions.get(request.sessionId);
    if (!session) {
      throw new Error('Session not found or expired');
    }
    
    // Check if session expired
    if (session.expiresAt < new Date()) {
      otpSessions.delete(request.sessionId);
      throw new Error('OTP session expired');
    }
    
    // Check if already verified (single-use)
    if (session.verified) {
      throw new Error('OTP already used');
    }
    
    // Check max attempts
    if (session.attempts >= session.maxAttempts) {
      otpSessions.delete(request.sessionId);
      throw new Error('Max OTP attempts exceeded. Please request a new OTP.');
    }
    
    // Increment attempts
    session.attempts++;
    
    // Verify OTP code
    if (request.otp !== session.otpCode) {
      throw new Error('Invalid OTP code');
    }
    
    // Mark as verified (single-use enforcement)
    session.verified = true;
    
    // ========================================================================
    // PATH 1: Existing user with role → Return full tokens
    // ========================================================================
    
    if (session.userId) {
      const user = Object.values(mockUsers).find(u => u.id === session.userId);
      
      if (user && user.role && user.role !== 'admin') {
        const accessToken = `access_${Date.now()}_${generateId('token')}`;
        const refreshToken = `refresh_${Date.now()}_${generateId('token')}`;
        
        // Store tokens in mock storage (in production, use secure storage)
        // Also store refresh token in database for validation
        
        const response: OtpVerifyExistingUserResponse = {
          flowType: 'login',
          requiresRoleSelection: false,
          accessToken,
          refreshToken,
          expiresIn: 3600, // 1 hour
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar,
          },
        };
        
        // Clean up OTP session after successful verification
        otpSessions.delete(request.sessionId);
        
        return response;
      }
    }
    
    // ========================================================================
    // PATH 2: New user or user without role → Return onboarding token
    // ========================================================================
    
    // Create new user if doesn't exist
    let userId = session.userId;
    if (!userId) {
      userId = generateId('user');
      // In production, create user in database here
    }
    
    // Generate onboarding token (one-time, limited to role selection)
    const onboardingToken = `onboard_${Date.now()}_${generateId('token')}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes
    
    onboardingSessions.set(onboardingToken, {
      onboardingToken,
      userId,
      createdAt: now,
      expiresAt,
      used: false,
    });
    
    const response: OtpVerifyNewUserResponse = {
      flowType: 'signup',
      requiresRoleSelection: true,
      onboardingToken,
      user: {
        id: userId,
        email: session.email,
        phone: session.phone,
      },
    };
    
    // Clean up OTP session after successful verification
    otpSessions.delete(request.sessionId);
    
    return response;
  },
};

// ============================================================================
// STEP 3: SELECT ROLE - POST /auth/select-role
// ============================================================================

/**
 * Select role after signup
 * 
 * Backend responsibilities:
 * 1. Validate onboarding token
 * 2. Bind role to user
 * 3. Mark onboarding token as used
 * 4. Issue full token set
 * 
 * This prevents spoofing because we validate onboardingToken (not bare userId)
 */
export const mockSelectRoleService = {
  async selectRole(request: SelectRoleRequest): Promise<SelectRoleResponse> {
    await delay();
    
    cleanupExpiredSessions();
    
    // Validate onboarding token
    const onboardingSession = onboardingSessions.get(request.onboardingToken);
    if (!onboardingSession) {
      throw new Error('Invalid or expired onboarding token');
    }
    
    // Check if token expired
    if (onboardingSession.expiresAt < new Date()) {
      onboardingSessions.delete(request.onboardingToken);
      throw new Error('Onboarding token expired');
    }
    
    // Check if already used (single-use)
    if (onboardingSession.used) {
      throw new Error('Onboarding token already used');
    }
    
    // Mark as used
    onboardingSession.used = true;
    
    // In production:
    // - Update user role in database
    // - Set any initial flags (e.g., requiresKyc for tasker/vendor)
    // - Create default profile data
    
    const userId = onboardingSession.userId;
    const accessToken = `access_${Date.now()}_${generateId('token')}`;
    const refreshToken = `refresh_${Date.now()}_${generateId('token')}`;
    
    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 hour
      user: {
        id: userId,
        role: request.role,
        firstName: null,
        lastName: null,
      },
    };
  },
};

// ============================================================================
// ADDITIONAL ENDPOINTS
// ============================================================================

/**
 * GET /auth/me - Validate current session
 * Called on app startup to check if user is still authenticated
 */
export const mockAuthMeService = {
  async getMe(accessToken: string): Promise<AuthMeResponse> {
    await delay(300);
    
    // In production:
    // - Validate token signature
    // - Check if token is revoked
    // - Check if token is expired
    // - Return user data from database
    
    // For mock, just return a user
    const user = mockUsers.customer1;
    
    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        isVerified: true,
      },
    };
  },
};

/**
 * POST /auth/refresh - Refresh access token
 * Called when access token is about to expire
 */
export const mockRefreshTokenService = {
  async refresh(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    await delay(300);
    
    // In production:
    // - Validate refresh token signature
    // - Check if refresh token is revoked
    // - Check if refresh token is expired
    // - Generate new access token
    // - Optionally generate new refresh token
    
    const newAccessToken = `access_${Date.now()}_${generateId('token')}`;
    
    return {
      accessToken: newAccessToken,
      refreshToken: request.refreshToken, // Can optionally rotate refresh token
      expiresIn: 3600, // 1 hour
    };
  },
};

/**
 * POST /auth/logout - Logout user
 * Invalidates current session
 */
export const mockLogoutService = {
  async logout(): Promise<LogoutResponse> {
    await delay(300);
    
    // In production:
    // - Revoke access token
    // - Revoke refresh token
    // - Clear any active sessions
    // - Log logout event
    
    return {
      success: true,
      message: 'Logged out successfully',
    };
  },
};

// ============================================================================
// EXPORT ALL SERVICES
// ============================================================================

export const mockAuthService = {
  // OTP flow
  otpStart: mockOtpStartService.start.bind(mockOtpStartService),
  otpVerify: mockOtpVerifyService.verify.bind(mockOtpVerifyService),
  selectRole: mockSelectRoleService.selectRole.bind(mockSelectRoleService),
  
  // Additional endpoints
  getMe: mockAuthMeService.getMe.bind(mockAuthMeService),
  refresh: mockRefreshTokenService.refresh.bind(mockRefreshTokenService),
  logout: mockLogoutService.logout.bind(mockLogoutService),
};
