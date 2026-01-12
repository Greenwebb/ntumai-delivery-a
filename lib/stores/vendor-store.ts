
import { create } from 'zustand';
import { createPersistentStore } from './utils/persistent-store';

export interface VendorProfile {
  id: string;
  name: string;
  description: string;
  logo: string;
  coverImage?: string;
  category: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder?: number;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  stock?: number;
}

export interface VendorStats {
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalProducts: number;
  activeOrders: number;
}

interface VendorStore {
  // State
  profile: VendorProfile | null;
  products: Product[];
  orders: any[];
  stats: VendorStats;
  isLoading: boolean;
  error: string | null;

  // Actions
  setProfile: (profile: VendorProfile) => void;
  updateProfile: (updates: Partial<VendorProfile>) => void;
  setProducts: (products: Product[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  removeProduct: (productId: string) => void;
  toggleProductAvailability: (productId: string) => void;
  setOrders: (orders: any[]) => void;
  addOrder: (order: any) => void;
  updateOrder: (orderId: string, updates: Partial<any>) => void;
  removeOrder: (orderId: string) => void;
  updateStats: (stats: Partial<VendorStats>) => void;
  toggleVendorStatus: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  resetVendorData: () => void;
}

export const useVendorStore = create<VendorStore>()(
  createPersistentStore(
    (set, get) => ({
      // Initial state
      profile: null,
      products: [],
      orders: [],
      stats: {
        totalOrders: 0,
        totalRevenue: 0,
        averageRating: 0,
        totalProducts: 0,
        activeOrders: 0,
      },
      isLoading: false,
      error: null,

      // Actions
      setProfile: (profile: VendorProfile) => {
        set({ profile });
      },

      updateProfile: (updates: Partial<VendorProfile>) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({ profile: { ...currentProfile, ...updates } });
        }
      },

      setProducts: (products: Product[]) => {
        set({ products });
        // Update stats
        const stats = get().stats;
        set({ stats: { ...stats, totalProducts: products.length } });
      },

      addProduct: (product: Product) => {
        const products = [...get().products, product];
        set({ products });
        // Update stats
        const stats = get().stats;
        set({ stats: { ...stats, totalProducts: products.length } });
      },

      updateProduct: (productId: string, updates: Partial<Product>) => {
        const products = get().products.map((product) =>
          product.id === productId ? { ...product, ...updates } : product
        );
        set({ products });
      },

      removeProduct: (productId: string) => {
        const products = get().products.filter((product) => product.id !== productId);
        set({ products });
        // Update stats
        const stats = get().stats;
        set({ stats: { ...stats, totalProducts: products.length } });
      },

      toggleProductAvailability: (productId: string) => {
        const products = get().products.map((product) =>
          product.id === productId ? { ...product, isAvailable: !product.isAvailable } : product
        );
        set({ products });
      },

      setOrders: (orders: any[]) => {
        set({ orders });
        // Update stats
        const activeOrders = orders.filter(
          (order) => !['delivered', 'cancelled'].includes(order.status)
        ).length;
        const stats = get().stats;
        set({ stats: { ...stats, activeOrders } });
      },

      addOrder: (order: any) => {
        const orders = [order, ...get().orders];
        set({ orders });
        // Update stats
        const stats = get().stats;
        set({
          stats: {
            ...stats,
            totalOrders: stats.totalOrders + 1,
            activeOrders: stats.activeOrders + 1,
          },
        });
      },

      updateOrder: (orderId: string, updates: Partial<any>) => {
        const orders = get().orders.map((order) =>
          order.id === orderId ? { ...order, ...updates } : order
        );
        set({ orders });
        // Update active orders count
        const activeOrders = orders.filter(
          (order) => !['delivered', 'cancelled'].includes(order.status)
        ).length;
        const stats = get().stats;
        set({ stats: { ...stats, activeOrders } });
      },

      removeOrder: (orderId: string) => {
        const orders = get().orders.filter((order) => order.id !== orderId);
        set({ orders });
      },

      updateStats: (stats: Partial<VendorStats>) => {
        const currentStats = get().stats;
        set({ stats: { ...currentStats, ...stats } });
      },

      toggleVendorStatus: () => {
        const profile = get().profile;
        if (profile) {
          set({ profile: { ...profile, isActive: !profile.isActive } });
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

      resetVendorData: () => {
        set({
          profile: null,
          products: [],
          orders: [],
          isLoading: false,
          error: null,
        });
      },
    }),
    {
      name: 'vendor-store',
      partialize: (state) => ({
        profile: state.profile,
        stats: state.stats,
      }),
    }
  )
);
