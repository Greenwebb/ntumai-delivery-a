// @ts-nocheck

import { apiClient } from '@/src/api/client';
import { ENDPOINTS } from '@/src/api/config';
import {
  AuthSessionSchema,
  RefreshSessionRequestSchema,
  RevokeSessionRequestSchema,
  AuthVerificationResultSchema,
} from './schemas';
import type { AuthSession, AuthVerificationResult, RefreshSessionRequest, RevokeSessionRequest } from './types';
import type { LoginResponse } from '@/types';

export const refreshSession = async (rawInput: RefreshSessionRequest): Promise<AuthSession> => {
  const input = RefreshSessionRequestSchema.parse(rawInput);

  const response = await apiClient.post<LoginResponse>(
    ENDPOINTS.AUTH.REFRESH ?? '/auth/refresh',
    { refreshToken: input.refreshToken },
    { requiresAuth: false }
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Unable to refresh session');
  }

  return AuthSessionSchema.parse({
    accessToken: response.data.token,
    refreshToken: response.data.refreshToken,
    expiresIn: response.data.expiresIn,
    issuedAt: new Date().toISOString(),
    scope: ['default'],
  });
};

export const revokeSession = async (rawInput?: RevokeSessionRequest): Promise<void> => {
  const input = RevokeSessionRequestSchema.parse(rawInput ?? {});

  try {
    if (input.allDevices) {
      await apiClient.post<void>(ENDPOINTS.AUTH.REVOKE_ALL_SESSIONS, {});
    } else {
      await apiClient.post<void>(ENDPOINTS.AUTH.LOGOUT, {
        sessionId: input.sessionId,
      });
    }
  } catch (error) {
    console.warn('[AuthApi] Failed to revoke session:', error);
  }
};

export const completePostAuthSync = async (result: AuthVerificationResult): Promise<AuthVerificationResult> => {
  // Placeholder for future orchestration (e.g., feature flags, role routing)
  return AuthVerificationResultSchema.parse(result) as AuthVerificationResult;
};

