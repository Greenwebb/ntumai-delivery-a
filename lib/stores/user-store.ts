
import { create } from 'zustand';
import { createPersistentStore } from './utils/persistent-store';
import { DeliveryAddress } from './delivery-store';

/**
 * User role enum
 */
export enum UserRole {
  CUSTOMER = 'customer',
  TASKER = 'tasker',
  VENDOR = 'vendor',
  ADMIN = 'admin',
}

/**
 * Payment method interface
 */
export interface PaymentMethod {
  id: string;
  type: 'card' | 'mobile_money' | 'cash';
  last4?: string;
  brand?: string;
  expiryMonth?: string;
  expiryYear?: string;
  isDefault: boolean;
}

/**
 * User profile interface
 */
export interface UserProfile {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  addresses: DeliveryAddress[];
  defaultAddressId?: string;
  paymentMethods: PaymentMethod[];
  defaultPaymentMethodId?: string;
  rating?: number;
  reviewCount?: number;
  totalOrders?: number;
  totalDeliveries?: number;
  joinedAt: string;
  isVerified: boolean;
  preferences: {
    notifications: boolean;
    emailUpdates: boolean;
    smsUpdates: boolean;
    language: string;
    theme: 'light' | 'dark' | 'auto';
  };
}

/**
 * User state interface
 */
interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * User store interface with actions
 */
interface UserStore extends UserState {
  // Profile actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadAvatar: (imageUri: string) => Promise<void>;

  // Address actions
  addAddress: (address: DeliveryAddress) => Promise<void>;
  updateAddress: (addressId: string, updates: Partial<DeliveryAddress>) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => void;

  // Payment method actions
  addPaymentMethod: (paymentMethod: PaymentMethod) => Promise<void>;
  removePaymentMethod: (paymentMethodId: string) => Promise<void>;
  setDefaultPaymentMethod: (paymentMethodId: string) => void;

  // Preferences actions
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => void;

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
};

/**
 * User store with persistence
 * Adapted from app.zip userSlice.ts
 */
export const useUserStore = create<UserStore>()(
  createPersistentStore(
    (set, get) => ({
      ...initialState,

      // Set profile
      setProfile: (profile: UserProfile) => {
        set({ profile });
      },

      // Update profile
      updateProfile: async (updates: Partial<UserProfile>) => {
        try {
          set({ isLoading: true, error: null });

          // TODO: Replace with actual API call
          // const response = await userApi.updateProfile(updates);

          const currentProfile = get().profile;
          if (currentProfile) {
            set({
              profile: { ...currentProfile, ...updates },
              isLoading: false,
            });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Upload avatar
      uploadAvatar: async (imageUri: string) => {
        try {
          set({ isLoading: true, error: null });

          // TODO: Replace with actual API call
          // const response = await userApi.uploadAvatar(imageUri);

          const currentProfile = get().profile;
          if (currentProfile) {
            set({
              profile: { ...currentProfile, avatar: imageUri },
              isLoading: false,
            });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Add address
      addAddress: async (address: DeliveryAddress) => {
        try {
          set({ isLoading: true, error: null });

          // TODO: Replace with actual API call
          const currentProfile = get().profile;
          if (currentProfile) {
            const newAddress = { ...address, id: `addr_${Date.now()}` } as DeliveryAddress & { id: string };
            set({
              profile: {
                ...currentProfile,
                addresses: [...currentProfile.addresses, newAddress],
              },
              isLoading: false,
            });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Update address
      updateAddress: async (addressId: string, updates: Partial<DeliveryAddress>) => {
        try {
          set({ isLoading: true, error: null });

          // TODO: Replace with actual API call
          const currentProfile = get().profile;
          if (currentProfile) {
            set({
              profile: {
                ...currentProfile,
                addresses: currentProfile.addresses.map((addr: any) =>
                  addr.id === addressId ? { ...addr, ...updates } : addr
                ),
              },
              isLoading: false,
            });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Remove address
      removeAddress: async (addressId: string) => {
        try {
          set({ isLoading: true, error: null });

          // TODO: Replace with actual API call
          const currentProfile = get().profile;
          if (currentProfile) {
            set({
              profile: {
                ...currentProfile,
                addresses: currentProfile.addresses.filter((addr: any) => addr.id !== addressId),
              },
              isLoading: false,
            });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Set default address
      setDefaultAddress: (addressId: string) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: { ...currentProfile, defaultAddressId: addressId },
          });
        }
      },

      // Add payment method
      addPaymentMethod: async (paymentMethod: PaymentMethod) => {
        try {
          set({ isLoading: true, error: null });

          // TODO: Replace with actual API call
          const currentProfile = get().profile;
          if (currentProfile) {
            set({
              profile: {
                ...currentProfile,
                paymentMethods: [...currentProfile.paymentMethods, paymentMethod],
              },
              isLoading: false,
            });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Remove payment method
      removePaymentMethod: async (paymentMethodId: string) => {
        try {
          set({ isLoading: true, error: null });

          // TODO: Replace with actual API call
          const currentProfile = get().profile;
          if (currentProfile) {
            set({
              profile: {
                ...currentProfile,
                paymentMethods: currentProfile.paymentMethods.filter((pm) => pm.id !== paymentMethodId),
              },
              isLoading: false,
            });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Set default payment method
      setDefaultPaymentMethod: (paymentMethodId: string) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: {
              ...currentProfile,
              defaultPaymentMethodId: paymentMethodId,
              paymentMethods: currentProfile.paymentMethods.map((pm) => ({
                ...pm,
                isDefault: pm.id === paymentMethodId,
              })),
            },
          });
        }
      },

      // Update preferences
      updatePreferences: (preferences: Partial<UserProfile['preferences']>) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: {
              ...currentProfile,
              preferences: { ...currentProfile.preferences, ...preferences },
            },
          });
        }
      },

      // Set loading state
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      // Set error
      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },

      // Reset store
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'ntumai-user-store',
      partialize: (state) => ({
        profile: state.profile,
      }),
    }
  )
);
