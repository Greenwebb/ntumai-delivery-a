// @ts-nocheck

// Mock Authentication Service for Development
// This provides a fallback when the backend server is not available

import { ApiResponse } from './types';
import { EnhancedLoginRequest, EnhancedLoginResponse } from './auth';

// Mock user data
const MOCK_USERS = [
  {
    id: '1',
    email: 'test@example.com',
    phone: '+263123456789',
    firstName: 'Test',
    lastName: 'User',
    role: 'customer',
    emailVerified: false,
    phoneVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'admin@example.com',
    phone: '+263987654321',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    emailVerified: true,
    phoneVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock OTP codes for testing
const MOCK_OTP_CODES = {
  'test@example.com': '123456',
  '+263123456789': '123456',
  'admin@example.com': '654321',
  '+263987654321': '654321',
};

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockAuthService {
  // Mock login implementation
  async login(credentials: EnhancedLoginRequest): Promise<ApiResponse<EnhancedLoginResponse>> {
    await delay(1000); // Simulate network delay
    
    console.log('[MockAuth] Login attempt:', credentials);
    
    // Find user by email or phone
    const user = MOCK_USERS.find(u => 
      (credentials.email && u.email === credentials.email) ||
      (credentials.phone && u.phone === `${credentials.countryCode}${credentials.phone}`)
    );
    
    if (!user) {
      return {
        success: false,
        error: 'User not found',
        data: null,
      };
    }
    
    // For demo purposes, accept any password
    if (!credentials.password || credentials.password.length < 3) {
      return {
        success: false,
        error: 'Invalid password',
        data: null,
      };
    }
    
    // Generate mock token
    const token = `mock_token_${user.id}_${Date.now()}`;
    const refreshToken = `mock_refresh_${user.id}_${Date.now()}`;
    
    return {
      success: true,
      data: {
        user,
        token,
        refreshToken,
        expiresIn: 3600000, // 1 hour
      },
      error: null,
    };
  }
  
  // Mock OTP verification
  async verifyOTP(identifier: string, code: string): Promise<ApiResponse<{ verified: boolean }>> {
    await delay(500);
    
    console.log('[MockAuth] OTP verification:', { identifier, code });
    
    const expectedCode = MOCK_OTP_CODES[identifier as keyof typeof MOCK_OTP_CODES];
    
    if (code === expectedCode) {
      return {
        success: true,
        data: { verified: true },
        error: null,
      };
    }
    
    return {
      success: false,
      data: { verified: false },
      error: 'Invalid OTP code',
    };
  }
  
  // Mock send OTP
  async sendOTP(identifier: string, method: 'email' | 'phone'): Promise<ApiResponse<{ sent: boolean }>> {
    await delay(800);
    
    console.log('[MockAuth] Sending OTP to:', identifier, 'via', method);
    
    // For demo, always succeed
    return {
      success: true,
      data: { sent: true },
      error: null,
    };
  }
  
  // Mock token refresh
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; expiresIn: number }>> {
    await delay(300);
    
    if (!refreshToken.startsWith('mock_refresh_')) {
      return {
        success: false,
        data: null,
        error: 'Invalid refresh token',
      };
    }
    
    const newToken = `mock_token_refreshed_${Date.now()}`;
    
    return {
      success: true,
      data: {
        token: newToken,
        expiresIn: 3600000,
      },
      error: null,
    };
  }
  
  // Mock user profile fetch
  async getCurrentUser(token: string): Promise<ApiResponse<any>> {
    await delay(200);
    
    if (!token.startsWith('mock_token_')) {
      return {
        success: false,
        data: null,
        error: 'Invalid token',
      };
    }
    
    // Extract user ID from token (mock implementation)
    const userId = token.includes('_1_') ? '1' : '2';
    const user = MOCK_USERS.find(u => u.id === userId);
    
    return {
      success: true,
      data: user,
      error: null,
    };
  }
}

export const mockAuthService = new MockAuthService();
