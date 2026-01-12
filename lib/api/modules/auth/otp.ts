// @ts-nocheck

import { AuthChallengeRequestSchema, AuthChallengeResponseSchema, AuthChallengeVerificationRequestSchema, AuthVerificationResultSchema } from './schemas';
import type {
  AuthChallengeRequest,
  AuthChallengeResponse,
  AuthChallengeVerificationRequest,
  AuthVerificationResult,
  AuthSession,
} from './types';
import type { SendOtpRequest, SendOtpResponse, VerifyOtpRequest, VerifyOtpResponse, User } from '@/types';
import { apiClient } from '@/src/api/base/client';
import { ENDPOINTS } from '@/src/api/config';

const DEFAULT_ATTEMPT_LIMIT = 5;

const mapPurposeToLegacyType = (purpose: AuthChallengeRequest['purpose']): SendOtpRequest['type'] =>
  purpose === 'register' ? 'register' : 'login';

const normalisePhoneIdentifier = (identifier: string, countryCode?: string) => {
  const trimmed = identifier.replace(/\s+/g, '');

  if (countryCode) {
    const local = trimmed.startsWith(countryCode) ? trimmed.slice(countryCode.length) : trimmed;
    return {
      countryCode,
      phone: local.replace(/^\+/, ''),
    };
  }

  if (trimmed.startsWith('+')) {
    const match = trimmed.match(/^\+(\d{1,4})(.*)$/);
    if (match) {
      return {
        countryCode: `+${match[1]}`,
        phone: match[2].replace(/^\s*/, ''),
      };
    }
  }

  return {
    countryCode,
    phone: trimmed,
  };
};

const toSendOtpPayload = (input: AuthChallengeRequest): SendOtpRequest => {
  if (input.method === 'email') {
    return {
      type: mapPurposeToLegacyType(input.purpose),
      email: input.identifier.trim().toLowerCase(),
    };
  }

  const { countryCode, phone } = normalisePhoneIdentifier(input.identifier, input.countryCode);

  return {
    type: mapPurposeToLegacyType(input.purpose),
    phone,
    countryCode,
  };
};

const buildChallengeResponse = (
  request: AuthChallengeRequest,
  legacyResponse: SendOtpResponse,
  message?: string
): AuthChallengeResponse => {
  const now = Date.now();
  const ttl = legacyResponse.expiresIn ? legacyResponse.expiresIn * 1000 : 5 * 60 * 1000;

  return AuthChallengeResponseSchema.parse({
    challengeId: legacyResponse.otpId ?? `mock-${Math.random().toString(36).slice(2, 10)}`,
    expiresAt: new Date(now + ttl).toISOString(),
    resendAvailableAt: new Date(now + Math.min(ttl, 60 * 1000)).toISOString(),
    method: request.method,
    purpose: request.purpose,
    attemptLimit: DEFAULT_ATTEMPT_LIMIT,
    message,
  });
};

const buildSession = (payload: VerifyOtpResponse): AuthSession => ({
  accessToken: payload.token,
  refreshToken: payload.refreshToken,
  expiresIn: payload.expiresIn,
  issuedAt: new Date().toISOString(),
  scope: payload.scopes,
});

const buildVerificationResult = (
  request: AuthChallengeVerificationRequest,
  legacyResponse: VerifyOtpResponse
): AuthVerificationResult => {
  const base = AuthVerificationResultSchema.parse({
    session: buildSession(legacyResponse),
    user: legacyResponse.user,
    isNewUser: legacyResponse.isNewUser,
    nextStep: legacyResponse.isNewUser ? 'complete-profile' : 'authenticated',
  });

  return { ...base, user: legacyResponse.user };
};

export const requestChallenge = async (rawInput: AuthChallengeRequest): Promise<AuthChallengeResponse> => {
  const input = AuthChallengeRequestSchema.parse(rawInput);
  const payload = toSendOtpPayload(input);

  const response = await apiClient.post<SendOtpResponse>(ENDPOINTS.AUTH.SEND_OTP, payload, {
    requiresAuth: false,
  });

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to request verification challenge');
  }

  return buildChallengeResponse(input, response.data, response.message);
};

export const verifyChallenge = async (
  rawInput: AuthChallengeVerificationRequest
): Promise<AuthVerificationResult> => {
  const input = AuthChallengeVerificationRequestSchema.parse(rawInput);

  const payload: VerifyOtpRequest = {
    otpId: input.challengeId,
    code: input.code,
  };

  if (input.method === 'email' && input.identifier) {
    payload.email = input.identifier;
  }

  if (input.method === 'phone' && input.identifier) {
    const { countryCode, phone } = normalisePhoneIdentifier(input.identifier, input.countryCode);
    payload.phone = phone;
    payload.countryCode = countryCode;
  }

  const response = await apiClient.post<VerifyOtpResponse>(ENDPOINTS.AUTH.VERIFY_OTP, payload, {
    requiresAuth: false,
  });

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Verification failed');
  }

  return buildVerificationResult(input, response.data);
};

