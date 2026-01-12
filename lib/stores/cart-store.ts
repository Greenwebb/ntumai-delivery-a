
import { create } from 'zustand';
import { createPersistentStore } from './utils/persistent-store';

/**
 * Product interface
 */
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  vendorId: string;
  vendorName: string;
  category?: string;
  available?: boolean;
  /** Stock status - true if in stock, false if out of stock */
  inStock?: boolean;
  /** Stock quantity (optional) */
  stockQuantity?: number;
}

/**
 * Cart item interface
 */
export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

/**
 * Cart state interface
 */
interface CartState {
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
  discount: number;
  deliveryFee: number;
  promoCode?: string;
}

/**
 * Cart store interface with actions
 */
interface CartStore extends CartState {
  // Actions
  addItem: (product: Product, quantity?: number, notes?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  getSubtotal: () => number;
  applyDiscount: (discount: number, promoCode?: string) => void;
  removeDiscount: () => void;
  setDeliveryFee: (fee: number) => void;
}

/**
 * Cart store with persistence
 * Adapted from app.zip cartSlice.ts
 */
export const useCartStore = create<CartStore>()(
  createPersistentStore(
    (set, get) => ({
      // Initial state
      items: [],
      totalPrice: 0,
      totalItems: 0,
      discount: 0,
      deliveryFee: 0,
      promoCode: undefined,

      // Add item to cart
      addItem: (product: Product, quantity = 1, notes?: string) => {
        const items = get().items;
        const existingItem = items.find((item) => item.product.id === product.id);

        if (existingItem) {
          // Update quantity if item already exists
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
                : item
            ),
          });
        } else {
          // Add new item
          set({
            items: [...items, { product, quantity, notes }],
          });
        }

        // Update totals
        const store = get();
        set({
          totalPrice: store.getTotalPrice(),
          totalItems: store.getTotalItems(),
        });
      },

      // Remove item from cart
      removeItem: (productId: string) => {
        const items = get().items.filter((item) => item.product.id !== productId);
        set({ items });

        // Update totals
        const store = get();
        set({
          totalPrice: store.getTotalPrice(),
          totalItems: store.getTotalItems(),
        });
      },

      // Update item quantity
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const items = get().items.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        );
        set({ items });

        // Update totals
        const store = get();
        set({
          totalPrice: store.getTotalPrice(),
          totalItems: store.getTotalItems(),
        });
      },

      // Update item notes
      updateNotes: (productId: string, notes: string) => {
        const items = get().items.map((item) =>
          item.product.id === productId ? { ...item, notes } : item
        );
        set({ items });
      },

      // Clear cart
      clearCart: () => {
        set({
          items: [],
          totalPrice: 0,
          totalItems: 0,
          discount: 0,
          promoCode: undefined,
        });
      },

      // Get subtotal (before discount and delivery fee)
      getSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
      },

      // Get total price (subtotal - discount + delivery fee)
      getTotalPrice: () => {
        const { discount, deliveryFee } = get();
        const subtotal = get().getSubtotal();
        return Math.max(0, subtotal - discount + deliveryFee);
      },

      // Get total items count
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      // Apply discount
      applyDiscount: (discount: number, promoCode?: string) => {
        set({ discount, promoCode });
        const store = get();
        set({ totalPrice: store.getTotalPrice() });
      },

      // Remove discount
      removeDiscount: () => {
        set({ discount: 0, promoCode: undefined });
        const store = get();
        set({ totalPrice: store.getTotalPrice() });
      },

      // Set delivery fee
      setDeliveryFee: (fee: number) => {
        set({ deliveryFee: fee });
        const store = get();
        set({ totalPrice: store.getTotalPrice() });
      },
    }),
    {
      name: 'ntumai-cart-store',
      partialize: (state) => ({
        items: state.items,
        discount: state.discount,
        deliveryFee: state.deliveryFee,
        promoCode: state.promoCode,
      }),
    }
  )
);
