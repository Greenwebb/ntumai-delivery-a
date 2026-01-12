
import { create } from 'zustand';

/**
 * Order status enum
 */
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

/**
 * Order interface
 */
export interface Order {
  id: string;
  userId: string;
  vendorId: string;
  vendorName: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  paymentMethod: string;
  promoCode?: string;
  taskerId?: string;
  taskerName?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Orders state interface
 */
interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Orders store interface with actions
 */
interface OrdersStore extends OrdersState {
  // Actions
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  setCurrentOrder: (order: Order | null) => void;
  removeOrder: (orderId: string) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getActiveOrders: () => Order[];
  getCompletedOrders: () => Order[];
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearOrders: () => void;
}

/**
 * Orders store
 * Adapted from app.zip orderSlice.ts
 */
export const useOrdersStore = create<OrdersStore>()((set, get) => ({
  // Initial state
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,

  // Set all orders
  setOrders: (orders: Order[]) => {
    set({ orders });
  },

  // Add new order
  addOrder: (order: Order) => {
    const orders = [order, ...get().orders];
    set({ orders, currentOrder: order });
  },

  // Update order
  updateOrder: (orderId: string, updates: Partial<Order>) => {
    const orders = get().orders.map((order) =>
      order.id === orderId
        ? { ...order, ...updates, updatedAt: new Date().toISOString() }
        : order
    );
    set({ orders });

    // Update current order if it's the one being updated
    const currentOrder = get().currentOrder;
    if (currentOrder && currentOrder.id === orderId) {
      set({
        currentOrder: { ...currentOrder, ...updates, updatedAt: new Date().toISOString() },
      });
    }
  },

  // Update order status
  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    get().updateOrder(orderId, { status });
  },

  // Set current order
  setCurrentOrder: (order: Order | null) => {
    set({ currentOrder: order });
  },

  // Remove order
  removeOrder: (orderId: string) => {
    const orders = get().orders.filter((order) => order.id !== orderId);
    set({ orders });

    // Clear current order if it's the one being removed
    const currentOrder = get().currentOrder;
    if (currentOrder && currentOrder.id === orderId) {
      set({ currentOrder: null });
    }
  },

  // Get order by ID
  getOrderById: (orderId: string) => {
    return get().orders.find((order) => order.id === orderId);
  },

  // Get orders by status
  getOrdersByStatus: (status: OrderStatus) => {
    return get().orders.filter((order) => order.status === status);
  },

  // Get active orders (not delivered, cancelled, or refunded)
  getActiveOrders: () => {
    return get().orders.filter(
      (order) =>
        order.status !== OrderStatus.DELIVERED &&
        order.status !== OrderStatus.CANCELLED &&
        order.status !== OrderStatus.REFUNDED
    );
  },

  // Get completed orders (delivered, cancelled, or refunded)
  getCompletedOrders: () => {
    return get().orders.filter(
      (order) =>
        order.status === OrderStatus.DELIVERED ||
        order.status === OrderStatus.CANCELLED ||
        order.status === OrderStatus.REFUNDED
    );
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

  // Clear all orders
  clearOrders: () => {
    set({
      orders: [],
      currentOrder: null,
      error: null,
    });
  },
}));
