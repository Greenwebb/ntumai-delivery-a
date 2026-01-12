
import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

/**
 * User type definition
 */
export interface User {
  id: string;
  phone?: string;
  email?: string;
  countryCode?: string;
  role?: 'customer' | 'tasker' | 'vendor' | null;
  name?: string;
  avatar?: string;
}

/**
 * Auth state interface
 */
interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Verification state
  verificationMethod: 'phone' | 'email' | null;
  verificationValue: string | null;
  requiresVerification: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => Promise<void>;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setGuestMode: (isGuest: boolean) => void;
  setVerificationState: (method: 'phone' | 'email', value: string) => void;
  clearVerificationState: () => void;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

/**
 * Secure storage keys
 */
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'auth_user',
} as const;

/**
 * Secure storage helpers
 */
const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Failed to save ${key} to secure storage:`, error);
      throw error;
    }
  },
  
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error(`Failed to get ${key} from secure storage:`, error);
      return null;
    }
  },
  
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Failed to remove ${key} from secure storage:`, error);
    }
  },
};

/**
 * Auth store
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  token: null,
  isAuthenticated: false,
  isGuest: false,
  isLoading: false,
  error: null,
  verificationMethod: null,
  verificationValue: null,
  requiresVerification: false,
  
  // Set user
  setUser: (user) => {
    set({ 
      user, 
      isAuthenticated: !!user,
      error: null,
    });
    
    // Persist user to secure storage
    if (user) {
      secureStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } else {
      secureStorage.removeItem(STORAGE_KEYS.USER);
    }
  },
  
  // Set token
  setToken: async (token) => {
    set({ token, error: null });
    
    // Persist token to secure storage
    if (token) {
      await secureStorage.setItem(STORAGE_KEYS.TOKEN, token);
    } else {
      await secureStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  },
  
  // Set error
  setError: (error) => {
    set({ error, isLoading: false });
  },
  
  // Set loading
  setLoading: (isLoading) => {
    set({ isLoading });
  },
  
  // Set guest mode
  setGuestMode: (isGuest) => {
    set({ isGuest, isAuthenticated: false, user: null, token: null });
  },
  
  // Set verification state
  setVerificationState: (method, value) => {
    set({
      verificationMethod: method,
      verificationValue: value,
      requiresVerification: true,
    });
  },
  
  // Clear verification state
  clearVerificationState: () => {
    set({
      verificationMethod: null,
      verificationValue: null,
      requiresVerification: false,
    });
  },
  
  // Login - set user and token together
  login: async (user, token) => {
    set({
      user,
      token,
      isAuthenticated: true,
      isGuest: false,
      error: null,
      verificationMethod: null,
      verificationValue: null,
      requiresVerification: false,
    });
    
    // Persist to secure storage
    await secureStorage.setItem(STORAGE_KEYS.TOKEN, token);
    await secureStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },
  
  // Logout
  logout: async () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
      verificationMethod: null,
      verificationValue: null,
      requiresVerification: false,
    });
    
    // Clear secure storage
    await secureStorage.removeItem(STORAGE_KEYS.TOKEN);
    await secureStorage.removeItem(STORAGE_KEYS.USER);
  },
  
  // Initialize auth (load from secure storage)
  initializeAuth: async () => {
    set({ isLoading: true });
    
    try {
      const [token, userJson] = await Promise.all([
        secureStorage.getItem(STORAGE_KEYS.TOKEN),
        secureStorage.getItem(STORAGE_KEYS.USER),
      ]);
      
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      set({ isLoading: false, error: 'Failed to load authentication state' });
    }
  },
}));
