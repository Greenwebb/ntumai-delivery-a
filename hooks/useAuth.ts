// @ts-nocheck

// Authentication hook
import { useCallback, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/src/store';
import { apiClient } from '@/src/utils/api';
import { User } from '@/src/store/types';

export interface UseAuthResult {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  
  // Utilities
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  isEmailVerified: boolean;
  isProfileComplete: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'customer' | 'driver' | 'vendor';
  acceptTerms: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export const useAuth = (): UseAuthResult => {
  const {
    user,
    token,
    refreshToken: storedRefreshToken,
    isAuthenticated,
    isLoading,
    error,
    login: loginAction,
    logout: logoutAction,
    setUser,
    setToken,
    setLoading,
    setError,
    clearError: clearErrorAction,
  } = useAuthStore();

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      if (response.success && response.data) {
        const { user, token, refreshToken, expiresIn } = response.data;
        
        // Update store
        loginAction(user, token, refreshToken);
        
        // Set API client token
        await apiClient.setAuthToken(token);
        
        // Schedule token refresh
        scheduleTokenRefresh(expiresIn);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loginAction, setLoading, setError]);

  // Register function
  const register = useCallback(async (userData: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Validate passwords match
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Validate terms acceptance
      if (!userData.acceptTerms) {
        throw new Error('You must accept the terms and conditions');
      }

      const response = await apiClient.post<LoginResponse>('/auth/register', {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role || 'customer',
      });

      if (response.success && response.data) {
        const { user, token, refreshToken, expiresIn } = response.data;
        
        // Update store
        loginAction(user, token, refreshToken);
        
        // Set API client token
        await apiClient.setAuthToken(token);
        
        // Schedule token refresh
        scheduleTokenRefresh(expiresIn);
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [loginAction, setLoading, setError]);

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Call logout endpoint if authenticated
      if (isAuthenticated && token) {
        try {
          await apiClient.post('/auth/logout', {
            refreshToken: storedRefreshToken,
          });
        } catch (error) {
          // Ignore logout API errors, still proceed with local logout
          console.warn('Logout API call failed:', error);
        }
      }
      
      // Clear local state
      logoutAction();
      
      // Remove API client token
      await apiClient.removeAuthToken();
      
      // Clear token refresh timer
      clearTokenRefreshTimer();
    } catch (error: any) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      logoutAction();
      await apiClient.removeAuthToken();
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, token, storedRefreshToken, logoutAction, setLoading]);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      if (!storedRefreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<LoginResponse>('/auth/refresh', {
        refreshToken: storedRefreshToken,
      });

      if (response.success && response.data) {
        const { user, token, refreshToken: newRefreshToken, expiresIn } = response.data;
        
        // Update store
        setUser(user);
        setToken(token, newRefreshToken);
        
        // Set API client token
        await apiClient.setAuthToken(token);
        
        // Schedule next token refresh
        scheduleTokenRefresh(expiresIn);
      } else {
        throw new Error(response.error || 'Token refresh failed');
      }
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      // Force logout on refresh failure
      await logout();
      throw new Error('Session expired. Please login again.');
    }
  }, [storedRefreshToken, setUser, setToken, logout]);

  // Update user function
  const updateUser = useCallback(async (userData: Partial<User>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put<User>('/auth/profile', userData, {
        requiresAuth: true,
      });

      if (response.success && response.data) {
        setUser(response.data);
      } else {
        throw new Error(response.error || 'Profile update failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Profile update failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading, setError]);

  // Clear error function
  const clearError = useCallback(() => {
    clearErrorAction();
  }, [clearErrorAction]);

  // Token refresh timer
  let tokenRefreshTimer: NodeJS.Timeout | null = null;

  const scheduleTokenRefresh = useCallback((expiresIn: number) => {
    clearTokenRefreshTimer();
    
    // Refresh token 5 minutes before expiry
    const refreshTime = Math.max(0, (expiresIn - 300) * 1000);
    
    tokenRefreshTimer = setTimeout(() => {
      refreshToken().catch(console.error);
    }, refreshTime);
  }, [refreshToken]);

  const clearTokenRefreshTimer = useCallback(() => {
    if (tokenRefreshTimer) {
      clearTimeout(tokenRefreshTimer);
      tokenRefreshTimer = null;
    }
  }, []);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (token && isAuthenticated) {
          // Set API client token
          await apiClient.setAuthToken(token);
          
          // Verify token is still valid
          try {
            const response = await apiClient.get('/auth/verify', {
              requiresAuth: true,
            });
            
            if (!response.success) {
              // Token is invalid, try to refresh
              if (storedRefreshToken) {
                await refreshToken();
              } else {
                await logout();
              }
            }
          } catch (error) {
            // Token verification failed, try to refresh
            if (storedRefreshToken) {
              try {
                await refreshToken();
              } catch (refreshError) {
                await logout();
              }
            } else {
              await logout();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      }
    };

    initializeAuth();

    // Cleanup on unmount
    return () => {
      clearTokenRefreshTimer();
    };
  }, []);

  // Utility functions
  const hasRole = useCallback((role: string): boolean => {
    return user?.role === role;
  }, [user]);

  const hasPermission = useCallback((permission: string): boolean => {
    return user?.permissions?.includes(permission) ?? false;
  }, [user]);

  // Computed values
  const isEmailVerified = useMemo(() => {
    return user?.emailVerified ?? false;
  }, [user]);

  const isProfileComplete = useMemo(() => {
    if (!user) return false;
    
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    return requiredFields.every(field => user[field as keyof User]);
  }, [user]);

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    clearError,
    
    // Utilities
    hasRole,
    hasPermission,
    isEmailVerified,
    isProfileComplete,
  };
};
