
import { create } from 'zustand';
import { createPersistentStore } from './utils/persistent-store';

export interface TaskerLocation {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
}

export interface TaskerStats {
  totalDeliveries: number;
  totalEarnings: number;
  averageRating: number;
  completionRate: number;
  onTimeRate: number;
}

export interface TaskerEarnings {
  today: number;
  week: number;
  month: number;
}

export interface Order {
  id: string;
  customerId: string;
  vendorId?: string;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'delivering' | 'delivered' | 'cancelled';
  type: 'food' | 'parcel' | 'task';
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  deliveryLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  estimatedEarnings: number;
  distance: number;
  createdAt: string;
  items?: any[];
  totalAmount?: number;
}

interface TaskerStore {
  // State
  isOnline: boolean;
  currentLocation: TaskerLocation | null;
  activeOrder: Order | null;
  availableOrders: Order[];
  stats: TaskerStats;
  earnings: TaskerEarnings;
  isLoading: boolean;
  error: string | null;

  // Actions
  setOnlineStatus: (isOnline: boolean) => void;
  updateLocation: (location: TaskerLocation) => void;
  setActiveOrder: (order: Order | null) => void;
  setAvailableOrders: (orders: Order[]) => void;
  addAvailableOrder: (order: Order) => void;
  removeAvailableOrder: (orderId: string) => void;
  acceptOrder: (orderId: string) => void;
  updateStats: (stats: Partial<TaskerStats>) => void;
  updateEarnings: (period: keyof TaskerEarnings, amount: number) => void;
  addEarnings: (period: keyof TaskerEarnings, amount: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  resetTaskerData: () => void;

  // Async methods (to be integrated with backend)
  fetchAvailableJobs: (taskerId: string, latitude: number, longitude: number) => Promise<void>;
  goOnlineAsync: (taskerId: string) => Promise<void>;
  goOfflineAsync: (taskerId: string) => Promise<void>;
  fetchStats: (taskerId: string) => Promise<void>;
  fetchEarnings: (taskerId: string, period?: keyof TaskerEarnings) => Promise<void>;
}

export const useTaskerStore = create<TaskerStore>()(
  createPersistentStore(
    (set, get) => ({
      // Initial state
      isOnline: false,
      currentLocation: null,
      activeOrder: null,
      availableOrders: [],
      stats: {
        totalDeliveries: 0,
        totalEarnings: 0,
        averageRating: 0,
        completionRate: 0,
        onTimeRate: 0,
      },
      earnings: {
        today: 0,
        week: 0,
        month: 0,
      },
      isLoading: false,
      error: null,

      // Sync Actions
      setOnlineStatus: (isOnline: boolean) => {
        set({ isOnline });
        if (!isOnline) {
          // Clear available orders when going offline
          set({ availableOrders: [] });
        }
      },

      updateLocation: (location: TaskerLocation) => {
        set({ currentLocation: location });
      },

      setActiveOrder: (order: Order | null) => {
        set({ activeOrder: order });
        if (order) {
          // Remove from available orders if accepting
          const availableOrders = get().availableOrders.filter(
            (availableOrder) => availableOrder.id !== order.id
          );
          set({ availableOrders });
        }
      },

      setAvailableOrders: (orders: Order[]) => {
        set({ availableOrders: orders });
      },

      addAvailableOrder: (order: Order) => {
        const availableOrders = get().availableOrders;
        const exists = availableOrders.some((existingOrder) => existingOrder.id === order.id);
        if (!exists) {
          set({ availableOrders: [...availableOrders, order] });
        }
      },

      removeAvailableOrder: (orderId: string) => {
        const availableOrders = get().availableOrders.filter((order) => order.id !== orderId);
        set({ availableOrders });
      },

      acceptOrder: (orderId: string) => {
        const availableOrders = get().availableOrders;
        const order = availableOrders.find((order) => order.id === orderId);
        if (order) {
          get().setActiveOrder(order);
        }
      },

      updateStats: (stats: Partial<TaskerStats>) => {
        const currentStats = get().stats;
        set({ stats: { ...currentStats, ...stats } });
      },

      updateEarnings: (period: keyof TaskerEarnings, amount: number) => {
        const earnings = get().earnings;
        set({ earnings: { ...earnings, [period]: amount } });
      },

      addEarnings: (period: keyof TaskerEarnings, amount: number) => {
        const earnings = get().earnings;
        set({ earnings: { ...earnings, [period]: earnings[period] + amount } });

        // Also update total earnings in stats
        const stats = get().stats;
        set({ stats: { ...stats, totalEarnings: stats.totalEarnings + amount } });
      },

      // Async methods (TODO: integrate with backend tRPC)
      fetchAvailableJobs: async (taskerId: string, latitude: number, longitude: number) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // const orders = await trpc.tasker.getAvailableJobs.query({ taskerId, latitude, longitude });
          // set({ availableOrders: orders, isLoading: false });
          
          // Mock data for now
          set({ availableOrders: [], isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      goOnlineAsync: async (taskerId: string) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // await trpc.tasker.goOnline.mutate({ taskerId });
          set({ isOnline: true, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      goOfflineAsync: async (taskerId: string) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // await trpc.tasker.goOffline.mutate({ taskerId });
          set({ isOnline: false, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      fetchStats: async (taskerId: string) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // const stats = await trpc.tasker.getStats.query({ taskerId });
          // set({ stats, isLoading: false });
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      fetchEarnings: async (taskerId: string, period: keyof TaskerEarnings = 'today') => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // const amount = await trpc.tasker.getEarnings.query({ taskerId, period });
          // set((state) => ({
          //   earnings: { ...state.earnings, [period]: amount },
          //   isLoading: false,
          // }));
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },

      resetTaskerData: () => {
        set({
          isOnline: false,
          currentLocation: null,
          activeOrder: null,
          availableOrders: [],
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'tasker-store',
      partialize: (state) => ({
        stats: state.stats,
        earnings: state.earnings,
      }),
    }
  )
);
