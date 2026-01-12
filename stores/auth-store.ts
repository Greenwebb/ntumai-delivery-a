import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserRole = 'customer' | 'tasker' | 'vendor' | null;

export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  photo?: string;
  role: UserRole;
  createdAt: string;
}

interface AuthState {
  // State
  isAuthenticated: boolean;
  user: User | null;
  role: UserRole;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  setRole: (role: UserRole) => void;
  setToken: (token: string) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      role: null,
      token: null,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) =>
        set({
          user,
          role: user.role,
          isAuthenticated: true,
        }),

      setRole: (role) =>
        set((state) => ({
          role,
          user: state.user ? { ...state.user, role } : null,
        })),

      setToken: (token) =>
        set({
          token,
        }),

      login: (user, token) =>
        set({
          isAuthenticated: true,
          user,
          role: user.role,
          token,
          error: null,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
          role: null,
          token: null,
          error: null,
        }),

      updateProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      setError: (error) =>
        set({
          error,
        }),

      clearError: () =>
        set({
          error: null,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
