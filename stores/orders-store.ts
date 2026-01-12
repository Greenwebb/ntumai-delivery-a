import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'failed';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  notes?: string;
}

export interface Order {
  id: string;
  vendorId: string;
  vendorName: string;
  customerId: string;
  taskerId?: string;
  taskerName?: string;
  taskerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: string;
  deliveryLat?: number;
  deliveryLng?: number;
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
  cancelReason?: string;
  failureReason?: string;
}

interface OrdersState {
  // State
  orders: Order[];
  activeOrder: Order | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  setActiveOrder: (orderId: string | null) => void;
  getOrderById: (orderId: string) => Order | undefined;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  cancelOrder: (orderId: string, reason: string) => void;
  clearOrders: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      // Initial state
      orders: [],
      activeOrder: null,
      isLoading: false,
      error: null,

      // Actions
      addOrder: (order) => {
        set((state) => ({
          orders: [order, ...state.orders],
          activeOrder: order,
        }));
      },

      updateOrderStatus: (orderId, status) => {
        const state = get();
        const updatedOrders = state.orders.map((order) =>
          order.id === orderId
            ? { ...order, status, updatedAt: new Date().toISOString() }
            : order
        );

        const updatedActiveOrder =
          state.activeOrder?.id === orderId
            ? { ...state.activeOrder, status, updatedAt: new Date().toISOString() }
            : state.activeOrder;

        set({
          orders: updatedOrders,
          activeOrder: updatedActiveOrder,
        });
      },

      updateOrder: (orderId, updates) => {
        const state = get();
        const updatedOrders = state.orders.map((order) =>
          order.id === orderId
            ? { ...order, ...updates, updatedAt: new Date().toISOString() }
            : order
        );

        const updatedActiveOrder =
          state.activeOrder?.id === orderId
            ? { ...state.activeOrder, ...updates, updatedAt: new Date().toISOString() }
            : state.activeOrder;

        set({
          orders: updatedOrders,
          activeOrder: updatedActiveOrder,
        });
      },

      setActiveOrder: (orderId) => {
        if (!orderId) {
          set({ activeOrder: null });
          return;
        }

        const order = get().orders.find((o) => o.id === orderId);
        set({ activeOrder: order || null });
      },

      getOrderById: (orderId) => {
        return get().orders.find((order) => order.id === orderId);
      },

      getOrdersByStatus: (status) => {
        return get().orders.filter((order) => order.status === status);
      },

      cancelOrder: (orderId, reason) => {
        get().updateOrder(orderId, {
          status: 'cancelled',
          cancelReason: reason,
        });
      },

      clearOrders: () => {
        set({
          orders: [],
          activeOrder: null,
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: 'orders-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
