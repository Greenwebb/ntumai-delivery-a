// @ts-nocheck

// Authentication API endpoints - OTP-based only
import { apiClient } from './client';
import {
  ApiResponse,
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  LoginCredentials,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
  User,
} from './types';
import { ENDPOINTS } from './config';

// Authentication service class - OTP-based only
export class AuthService {
  // Send OTP for login or registration (Ntumai API: /api/v1/auth/request-otp)
  async sendOtp(request: SendOtpRequest): Promise<ApiResponse<SendOtpResponse>> {
    // Validate input parameters
    const hasEmail = request.email && request.email.trim() !== '';
    const hasPhone = request.phone && request.phone.trim() !== '' && request.countryCode;
    
    if (!hasEmail && !hasPhone) {
      throw new Error('Either email or phone number with country code is required');
    }

    return apiClient.post<SendOtpResponse>(ENDPOINTS.AUTH.REQUEST_OTP, request);
  }

  // Verify OTP and complete authentication (Ntumai API: /api/v1/auth/verify-otp)
  async verifyOtp(request: VerifyOtpRequest): Promise<ApiResponse<VerifyOtpResponse>> {
    if (!request.otpId || !request.code) {
      throw new Error('OTP ID and code are required');
    }

    return apiClient.post<VerifyOtpResponse>(ENDPOINTS.AUTH.VERIFY_OTP, request);
  }

  // Legacy login method - now redirects to OTP flow
  async login(credentials: LoginCredentials): Promise<ApiResponse<SendOtpResponse>> {
    const otpRequest: SendOtpRequest = {
      email: credentials.email,
      phone: credentials.phone,
      countryCode: credentials.countryCode,
      type: 'login'
    };
    
    return this.sendOtp(otpRequest);
  }

  // User registration - now uses OTP
  async register(userData: RegisterRequest): Promise<ApiResponse<SendOtpResponse>> {
    const otpRequest: SendOtpRequest = {
      email: userData.email,
      phone: userData.phone,
      countryCode: userData.countryCode,
      type: 'register'
    };
    
    return this.sendOtp(otpRequest);
  }

  // Refresh access token
  async refreshToken(refreshData: RefreshTokenRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      return await apiClient.post<LoginResponse>(ENDPOINTS.AUTH.REFRESH_TOKEN, refreshData);
    } catch (error) {
      throw new Error('Failed to refresh token');
    }
  }

  // User logout
  async logout(): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post<void>(ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      throw new Error('Logout failed');
    }
  }

  // Request password reset using OTP
  async requestPasswordReset(data: ResetPasswordRequest): Promise<ApiResponse<SendOtpResponse>> {
    const otpRequest: SendOtpRequest = {
      email: data.email,
      phone: data.phone,
      countryCode: data.countryCode,
      type: 'login' // Use login type for password reset
    };
    
    return this.sendOtp(otpRequest);
  }

  // Reset password
  async resetPassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    try {
      return await apiClient.post<void>(ENDPOINTS.AUTH.RESET_PASSWORD, data);
    } catch (error) {
      throw new Error('Password reset failed');
    }
  }

  // Change password
  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>(ENDPOINTS.AUTH.CHANGE_PASSWORD, data, {
      cache: false,
    });
  }

  // Verify email
  async verifyEmail(data: VerifyEmailRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>(ENDPOINTS.AUTH.VERIFY_EMAIL, data, {
      requiresAuth: false,
      cache: false,
    });
  }

  // Resend verification email
  async resendVerification(data: ResendVerificationRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>(ENDPOINTS.AUTH.RESEND_VERIFICATION, data, {
      requiresAuth: false,
      cache: false,
    });
  }

  // Get current user profile
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return apiClient.get<User>(ENDPOINTS.AUTH.ME, {
      cache: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
    });
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.put<User>(ENDPOINTS.AUTH.UPDATE_PROFILE, userData, {
      cache: false,
    });
  }

  // Delete user account
  async deleteAccount(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(ENDPOINTS.AUTH.DELETE_ACCOUNT, {
      cache: false,
    });
  }

  // Check if email exists
  async checkEmailExists(email: string): Promise<ApiResponse<{ exists: boolean }>> {
    return apiClient.get<{ exists: boolean }>(
      `${ENDPOINTS.AUTH.CHECK_EMAIL}?email=${encodeURIComponent(email)}`,
      {
        requiresAuth: false,
        cache: true,
        cacheTimeout: 2 * 60 * 1000, // 2 minutes
      }
    );
  }

  // Check if username exists
  async checkUsernameExists(username: string): Promise<ApiResponse<{ exists: boolean }>> {
    return apiClient.get<{ exists: boolean }>(
      `${ENDPOINTS.AUTH.CHECK_USERNAME}?username=${encodeURIComponent(username)}`,
      {
        requiresAuth: false,
        cache: true,
        cacheTimeout: 2 * 60 * 1000, // 2 minutes
      }
    );
  }

  // Get user sessions
  async getUserSessions(): Promise<ApiResponse<Array<{
    id: string;
    deviceInfo: string;
    ipAddress: string;
    lastActive: string;
    isCurrent: boolean;
  }>>> {
    return apiClient.get(ENDPOINTS.AUTH.SESSIONS, {
      cache: false,
    });
  }

  // Revoke user session
  async revokeSession(sessionId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${ENDPOINTS.AUTH.SESSIONS}/${sessionId}`, {
      cache: false,
    });
  }

  // Revoke all sessions except current
  async revokeAllSessions(): Promise<ApiResponse<void>> {
    return apiClient.post<void>(ENDPOINTS.AUTH.REVOKE_ALL_SESSIONS, {}, {
      cache: false,
    });
  }

  // Enable two-factor authentication
  async enableTwoFactor(): Promise<ApiResponse<{
    qrCode: string;
    backupCodes: string[];
    secret: string;
  }>> {
    return apiClient.post(ENDPOINTS.AUTH.ENABLE_2FA, {}, {
      cache: false,
    });
  }

  // Verify two-factor authentication setup
  async verifyTwoFactor(code: string): Promise<ApiResponse<{
    backupCodes: string[];
  }>> {
    return apiClient.post(ENDPOINTS.AUTH.VERIFY_2FA, { code }, {
      cache: false,
    });
  }

  // Disable two-factor authentication
  async disableTwoFactor(password: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(ENDPOINTS.AUTH.DISABLE_2FA, { password }, {
      cache: false,
    });
  }

  // Generate new backup codes
  async generateBackupCodes(): Promise<ApiResponse<{
    backupCodes: string[];
  }>> {
    return apiClient.post(ENDPOINTS.AUTH.GENERATE_BACKUP_CODES, {}, {
      cache: false,
    });
  }

  // Social login (Google, Facebook, Apple)
  async socialLogin(provider: 'google' | 'facebook' | 'apple', token: string): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>(
      `${ENDPOINTS.AUTH.SOCIAL_LOGIN}/${provider}`,
      { token },
      {
        requiresAuth: false,
        cache: false,
      }
    );
  }

  // Link social account
  async linkSocialAccount(provider: 'google' | 'facebook' | 'apple', token: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(
      `${ENDPOINTS.AUTH.LINK_SOCIAL}/${provider}`,
      { token },
      {
        cache: false,
      }
    );
  }

  // Unlink social account
  async unlinkSocialAccount(provider: 'google' | 'facebook' | 'apple'): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(
      `${ENDPOINTS.AUTH.UNLINK_SOCIAL}/${provider}`,
      {
        cache: false,
      }
    );
  }

  // Get linked social accounts
  async getLinkedAccounts(): Promise<ApiResponse<Array<{
    provider: string;
    email: string;
    linkedAt: string;
  }>>> {
    return apiClient.get(ENDPOINTS.AUTH.LINKED_ACCOUNTS, {
      cache: true,
      cacheTimeout: 10 * 60 * 1000, // 10 minutes
    });
  }

  // Request account verification
  async requestAccountVerification(): Promise<ApiResponse<void>> {
    return apiClient.post<void>(ENDPOINTS.AUTH.REQUEST_VERIFICATION, {}, {
      cache: false,
    });
  }

  // Upload profile picture
  async uploadProfilePicture(file: File): Promise<ApiResponse<{ profilePictureUrl: string }>> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    return apiClient.post<{ profilePictureUrl: string }>(
      ENDPOINTS.AUTH.UPLOAD_PROFILE_PICTURE,
      formData,
      {
        cache: false,
        headers: {
          // Don't set Content-Type, let browser set it for FormData
        },
      }
    );
  }

  // Remove profile picture
  async removeProfilePicture(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(ENDPOINTS.AUTH.REMOVE_PROFILE_PICTURE, {
      cache: false,
    });
  }

  // Get user preferences
  async getUserPreferences(): Promise<ApiResponse<{
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      orderUpdates: boolean;
      promotions: boolean;
      newsletter: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'private';
      showEmail: boolean;
      showPhone: boolean;
    };
    app: {
      theme: 'light' | 'dark' | 'system';
      language: string;
      currency: string;
      units: 'metric' | 'imperial';
    };
  }>> {
    return apiClient.get(ENDPOINTS.AUTH.PREFERENCES, {
      cache: true,
      cacheTimeout: 15 * 60 * 1000, // 15 minutes
    });
  }

  // Update user preferences
  async updateUserPreferences(preferences: any): Promise<ApiResponse<void>> {
    return apiClient.put<void>(ENDPOINTS.AUTH.PREFERENCES, preferences, {
      cache: false,
    });
  }
}

// Default auth service instance
export const authService = new AuthService();

// Auth utility functions
export const authUtils = {
  // Check if user is authenticated
  isAuthenticated(): boolean {
    // This would typically check for a valid token
    return false; // Placeholder
  },

  // Get current user from storage
  getCurrentUser(): User | null {
    // This would typically get user from storage
    return null; // Placeholder
  },

  // Clear authentication data
  clearAuthData(): void {
    // This would clear tokens and user data from storage
  },

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  },

  // Get token expiry time
  getTokenExpiry(token: string): Date | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  },

  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },


};

// Export authApi as alias for authService (backward compatibility)
export const authApi = authService;
