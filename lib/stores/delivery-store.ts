
import { create } from 'zustand';
import { createPersistentStore } from './utils/persistent-store';

/**
 * Delivery address interface
 */
export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
}

/**
 * Delivery type
 */
export type DeliveryType = 'moto' | 'car' | 'truck';

/**
 * Delivery status
 */
export type DeliveryStatus =
  | 'pending'
  | 'accepted'
  | 'on_the_way_to_pickup'
  | 'arrived_at_pickup'
  | 'picked_up'
  | 'on_the_way_to_dropoff'
  | 'arrived_at_dropoff'
  | 'delivered'
  | 'cancelled';

/**
 * P2P Delivery interface
 */
export interface P2PDelivery {
  id: string;
  senderId: string;
  senderName: string;
  senderPhone: string;
  recipientName: string;
  recipientPhone: string;
  pickupLocation: DeliveryAddress;
  dropoffLocation: DeliveryAddress;
  itemDescription: string;
  deliveryType: DeliveryType;
  estimatedPrice: number;
  actualPrice?: number;
  status: DeliveryStatus;
  taskerId?: string;
  taskerName?: string;
  taskerPhone?: string;
  taskerLocation?: {
    latitude: number;
    longitude: number;
  };
  estimatedDeliveryTime?: string;
  pickupTime?: string;
  deliveryTime?: string;
  createdAt: string;
  updatedAt: string;
  trackingLink: string;
  proofOfDelivery?: {
    signature?: string;
    photo?: string;
    notes?: string;
  };
}

/**
 * Delivery state interface
 */
interface DeliveryState {
  deliveries: P2PDelivery[];
  currentDelivery: P2PDelivery | null;
  trackedDelivery: P2PDelivery | null;
  estimatedPrice: number | null;
  estimatedTime: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Delivery store interface with actions
 */
interface DeliveryStore extends DeliveryState {
  // Delivery actions
  createDelivery: (deliveryData: Partial<P2PDelivery>) => Promise<P2PDelivery | null>;
  getDeliveries: (userId: string, role?: 'sender' | 'tasker') => Promise<void>;
  getDeliveryDetail: (deliveryId: string) => Promise<void>;
  trackDelivery: (trackingId: string) => Promise<void>;
  estimatePrice: (
    pickupLocation: DeliveryAddress,
    dropoffLocation: DeliveryAddress,
    deliveryType: DeliveryType
  ) => Promise<void>;
  cancelDelivery: (deliveryId: string) => Promise<void>;
  acceptDelivery: (deliveryId: string, taskerId: string) => Promise<void>;
  updateDeliveryStatus: (deliveryId: string, status: DeliveryStatus) => Promise<void>;
  updateTaskerLocation: (deliveryId: string, location: { latitude: number; longitude: number }) => void;
  completeDelivery: (deliveryId: string, proofOfDelivery: P2PDelivery['proofOfDelivery']) => Promise<void>;

  // State management
  setCurrentDelivery: (delivery: P2PDelivery | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: DeliveryState = {
  deliveries: [],
  currentDelivery: null,
  trackedDelivery: null,
  estimatedPrice: null,
  estimatedTime: null,
  isLoading: false,
  error: null,
};

/**
 * Delivery store with persistence
 * Adapted from app.zip deliverySlice.ts
 */
export const useDeliveryStore = create<DeliveryStore>()(
  createPersistentStore(
    (set, get) => ({
      ...initialState,

      // Create new delivery
      createDelivery: async (deliveryData: Partial<P2PDelivery>) => {
        try {
          set({ isLoading: true, error: null });
          
          // TODO: Replace with actual API call
          const newDelivery: P2PDelivery = {
            id: `delivery_${Date.now()}`,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            trackingLink: `https://ntumai.app/track/${Date.now()}`,
            ...deliveryData,
          } as P2PDelivery;

          set((state) => ({
            deliveries: [newDelivery, ...state.deliveries],
            currentDelivery: newDelivery,
            isLoading: false,
          }));

          return newDelivery;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return null;
        }
      },

      // Get deliveries for user
      getDeliveries: async (userId: string, role: 'sender' | 'tasker' = 'sender') => {
        try {
          set({ isLoading: true, error: null });
          
          // TODO: Replace with actual API call
          // const response = await deliveryApi.getDeliveries(userId, role);
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Get delivery detail
      getDeliveryDetail: async (deliveryId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // TODO: Replace with actual API call
          const delivery = get().deliveries.find((d) => d.id === deliveryId);
          
          set({ currentDelivery: delivery || null, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Track delivery
      trackDelivery: async (trackingId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // TODO: Replace with actual API call
          const delivery = get().deliveries.find((d) => d.trackingLink.includes(trackingId));
          
          set({ trackedDelivery: delivery || null, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Estimate price
      estimatePrice: async (
        pickupLocation: DeliveryAddress,
        dropoffLocation: DeliveryAddress,
        deliveryType: DeliveryType
      ) => {
        try {
          set({ isLoading: true, error: null });
          
          // TODO: Replace with actual API call
          // Mock estimation based on delivery type
          const basePrice = deliveryType === 'moto' ? 50 : deliveryType === 'car' ? 100 : 200;
          const estimatedPrice = basePrice + Math.random() * 50;
          const estimatedTime = `${Math.floor(15 + Math.random() * 30)} mins`;

          set({
            estimatedPrice,
            estimatedTime,
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Cancel delivery
      cancelDelivery: async (deliveryId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          const delivery = get().deliveries.find((d) => d.id === deliveryId);
          
          if (delivery && ['pending', 'accepted'].includes(delivery.status)) {
            set((state) => ({
              deliveries: state.deliveries.map((d) =>
                d.id === deliveryId ? { ...d, status: 'cancelled', updatedAt: new Date().toISOString() } : d
              ),
              isLoading: false,
            }));
          } else {
            set({ error: 'Cannot cancel this delivery', isLoading: false });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Accept delivery (tasker)
      acceptDelivery: async (deliveryId: string, taskerId: string) => {
        try {
          set({ isLoading: true, error: null });
          
          // TODO: Replace with actual API call
          set((state) => ({
            deliveries: state.deliveries.map((d) =>
              d.id === deliveryId
                ? { ...d, status: 'accepted', taskerId, updatedAt: new Date().toISOString() }
                : d
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Update delivery status
      updateDeliveryStatus: async (deliveryId: string, status: DeliveryStatus) => {
        try {
          set({ isLoading: true, error: null });
          
          // TODO: Replace with actual API call
          set((state) => ({
            deliveries: state.deliveries.map((d) =>
              d.id === deliveryId ? { ...d, status, updatedAt: new Date().toISOString() } : d
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Update tasker location
      updateTaskerLocation: (deliveryId: string, location: { latitude: number; longitude: number }) => {
        set((state) => ({
          deliveries: state.deliveries.map((d) =>
            d.id === deliveryId ? { ...d, taskerLocation: location, updatedAt: new Date().toISOString() } : d
          ),
        }));
      },

      // Complete delivery
      completeDelivery: async (deliveryId: string, proofOfDelivery: P2PDelivery['proofOfDelivery']) => {
        try {
          set({ isLoading: true, error: null });
          
          // TODO: Replace with actual API call
          set((state) => ({
            deliveries: state.deliveries.map((d) =>
              d.id === deliveryId
                ? {
                    ...d,
                    status: 'delivered',
                    deliveryTime: new Date().toISOString(),
                    proofOfDelivery,
                    updatedAt: new Date().toISOString(),
                  }
                : d
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Set current delivery
      setCurrentDelivery: (delivery: P2PDelivery | null) => {
        set({ currentDelivery: delivery });
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
      name: 'ntumai-delivery-store',
      partialize: (state) => ({
        deliveries: state.deliveries,
        currentDelivery: state.currentDelivery,
      }),
    }
  )
);
