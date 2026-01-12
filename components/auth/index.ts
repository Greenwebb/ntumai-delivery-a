// @ts-nocheck
// Auth components barrel export file
// This file exports all authentication-related components

import React from 'react';
import { AuthComponentProps } from '@/index';

// Auth component types
export interface LoginFormProps extends AuthComponentProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  loading?: boolean;
}

export interface SignupFormProps extends AuthComponentProps {
  onSignup: (userData: SignupData) => Promise<void>;
  loading?: boolean;
}

export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

// Export the actual AuthGuard component
export { default as AuthGuard } from './AuthGuard';

// Placeholder components (to be implemented)
export const LoginForm: React.FC<LoginFormProps> = (props) => {
  // TODO: Implement LoginForm component
  return null;
};

export const SignupForm: React.FC<SignupFormProps> = (props) => {
  // TODO: Implement SignupForm component
  return null;
};

export const ForgotPasswordForm: React.FC<AuthComponentProps> = (props) => {
  // TODO: Implement ForgotPasswordForm component
  return null;
};

export const ResetPasswordForm: React.FC<AuthComponentProps> = (props) => {
  // TODO: Implement ResetPasswordForm component
  return null;
};

// Auth utilities
export const authUtils = {
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
  
  validatePasswordMatch: (password: string, confirmPassword: string): boolean => {
    return password === confirmPassword;
  },
};

// Auth constants
export const AUTH_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days
} as const;