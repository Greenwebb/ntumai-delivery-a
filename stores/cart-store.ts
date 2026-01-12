import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  notes?: string;
  isAvailable: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  isOpen: boolean;
  minimumOrder: number;
  deliveryFee: number;
}

interface CartState {
  // State
  items: CartItem[];
  vendor: Vendor | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  isMinimumMet: boolean;

  // Actions
  addItem: (item: CartItem, vendor: Vendor) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateItemNotes: (itemId: string, notes: string) => void;
  clearCart: () => void;
  setVendor: (vendor: Vendor) => void;
  calculateTotals: () => void;
  getItemCount: () => number;
  hasItems: () => boolean;
  canCheckout: () => boolean;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      vendor: null,
      subtotal: 0,
      deliveryFee: 0,
      total: 0,
      isMinimumMet: false,

      // Actions
      addItem: (item, vendor) => {
        const state = get();
        
        // If cart has items from different vendor, clear cart
        if (state.vendor && state.vendor.id !== vendor.id) {
          set({
            items: [item],
            vendor,
          });
        } else {
          // Check if item already exists
          const existingItemIndex = state.items.findIndex(
            (i) => i.productId === item.productId
          );

          if (existingItemIndex >= 0) {
            // Update quantity
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += item.quantity;
            set({ items: updatedItems, vendor });
          } else {
            // Add new item
            set({
              items: [...state.items, item],
              vendor,
            });
          }
        }

        get().calculateTotals();
      },

      removeItem: (itemId) => {
        const state = get();
        const updatedItems = state.items.filter((item) => item.id !== itemId);
        
        set({
          items: updatedItems,
          vendor: updatedItems.length === 0 ? null : state.vendor,
        });

        get().calculateTotals();
      },

      updateQuantity: (itemId, quantity) => {
        const state = get();
        
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        const updatedItems = state.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );

        set({ items: updatedItems });
        get().calculateTotals();
      },

      updateItemNotes: (itemId, notes) => {
        const state = get();
        const updatedItems = state.items.map((item) =>
          item.id === itemId ? { ...item, notes } : item
        );
        set({ items: updatedItems });
      },

      clearCart: () => {
        set({
          items: [],
          vendor: null,
          subtotal: 0,
          deliveryFee: 0,
          total: 0,
          isMinimumMet: false,
        });
      },

      setVendor: (vendor) => {
        set({ vendor });
        get().calculateTotals();
      },

      calculateTotals: () => {
        const state = get();
        
        // Calculate subtotal
        const subtotal = state.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        // Get delivery fee from vendor
        const deliveryFee = state.vendor?.deliveryFee || 0;

        // Calculate total
        const total = subtotal + deliveryFee;

        // Check if minimum order is met
        const minimumOrder = state.vendor?.minimumOrder || 0;
        const isMinimumMet = subtotal >= minimumOrder;

        set({
          subtotal,
          deliveryFee,
          total,
          isMinimumMet,
        });
      },

      getItemCount: () => {
        const state = get();
        return state.items.reduce((count, item) => count + item.quantity, 0);
      },

      hasItems: () => {
        return get().items.length > 0;
      },

      canCheckout: () => {
        const state = get();
        return (
          state.items.length > 0 &&
          state.isMinimumMet &&
          state.vendor?.isOpen === true &&
          state.items.every((item) => item.isAvailable)
        );
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
