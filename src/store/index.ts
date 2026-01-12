import { create } from 'zustand';

export const useMarketplaceStore = create((set) => ({
  products: [],
  vendors: [],
  searchQuery: '',
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setProducts: (products: any[]) => set({ products }),
  setVendors: (vendors: any[]) => set({ vendors }),
}));

export const useCartStore = create((set) => ({
  items: [],
  total: 0,
  addItem: (item: any) => set((state: any) => ({ items: [...state.items, item] })),
  removeItem: (id: string) => set((state: any) => ({ items: state.items.filter((i: any) => i.id !== id) })),
  clearCart: () => set({ items: [], total: 0 }),
}));

export const useOrderStore = create((set) => ({
  orders: [],
  currentOrder: null,
  setOrders: (orders: any[]) => set({ orders }),
  setCurrentOrder: (order: any) => set({ currentOrder: order }),
}));
