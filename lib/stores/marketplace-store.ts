
import { create } from 'zustand';
import { Product } from './cart-store';

/**
 * Vendor interface
 */
export interface Vendor {
  id: string;
  name: string;
  description: string;
  logo?: string;
  banner?: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  isOpen: boolean;
  distance?: number;
  categories?: string[];
  address?: string;
  phone?: string;
}

/**
 * Product category interface
 */
export interface Category {
  id: string;
  name: string;
  icon?: string;
  productCount?: number;
}

/**
 * Marketplace filters
 */
export interface MarketplaceFilters {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  sortBy?: 'relevance' | 'rating' | 'price' | 'delivery_time';
  /** Filter to show only in-stock items (default: true for customers) */
  showInStockOnly?: boolean;
}

/**
 * Marketplace state interface
 */
interface MarketplaceState {
  vendors: Vendor[];
  selectedVendor: Vendor | null;
  products: Product[];
  selectedProduct: Product | null;
  categories: Category[];
  searchResults: Product[];
  searchQuery: string;
  filters: MarketplaceFilters;
  isLoading: boolean;
  error: string | null;
}

/**
 * Marketplace store interface with actions
 */
interface MarketplaceStore extends MarketplaceState {
  // Vendor actions
  fetchVendors: (latitude?: number, longitude?: number, search?: string) => Promise<void>;
  selectVendor: (vendor: Vendor) => void;
  getVendorDetail: (vendorId: string) => Promise<void>;

  // Product actions
  fetchProducts: (vendorId: string, categoryId?: string) => Promise<void>;
  selectProduct: (product: Product) => void;
  getProductDetail: (productId: string) => Promise<void>;

  // Category actions
  fetchCategories: (vendorId?: string) => Promise<void>;

  // Search and filter
  searchProducts: (query: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<MarketplaceFilters>) => void;
  clearFilters: () => void;

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: MarketplaceState = {
  vendors: [],
  selectedVendor: null,
  products: [],
  selectedProduct: null,
  categories: [],
  searchResults: [],
  searchQuery: '',
  filters: {},
  isLoading: false,
  error: null,
};

/**
 * Marketplace store
 * Adapted from app.zip marketplaceSlice.ts
 */
export const useMarketplaceStore = create<MarketplaceStore>()((set, get) => ({
  ...initialState,

  // Fetch vendors
  fetchVendors: async (latitude?: number, longitude?: number, search?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // TODO: Replace with actual API call
      // const response = await marketplaceApi.getVendors(latitude, longitude, search);
      
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Select vendor
  selectVendor: (vendor: Vendor) => {
    set({ selectedVendor: vendor });
  },

  // Get vendor detail
  getVendorDetail: async (vendorId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // TODO: Replace with actual API call
      const vendor = get().vendors.find((v) => v.id === vendorId);
      
      set({ selectedVendor: vendor || null, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch products
  fetchProducts: async (vendorId: string, categoryId?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // TODO: Replace with actual API call
      // const response = await marketplaceApi.getProducts(vendorId, categoryId);
      
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Select product
  selectProduct: (product: Product) => {
    set({ selectedProduct: product });
  },

  // Get product detail
  getProductDetail: async (productId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // TODO: Replace with actual API call
      const product = get().products.find((p) => p.id === productId);
      
      set({ selectedProduct: product || null, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Fetch categories
  fetchCategories: async (vendorId?: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // TODO: Replace with actual API call
      // const response = await marketplaceApi.getCategories(vendorId);
      
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Search products
  searchProducts: async (query: string) => {
    try {
      set({ isLoading: true, error: null, searchQuery: query });
      
      // TODO: Replace with actual API call
      // const response = await marketplaceApi.searchProducts(query);
      
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  // Set search query
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  // Set filters
  setFilters: (filters: Partial<MarketplaceFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  // Clear filters
  clearFilters: () => {
    set({ filters: {} });
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
}));
