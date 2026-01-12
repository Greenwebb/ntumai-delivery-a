// Vendor order management service
import { isDemoMode } from '@/lib/config/demo-mode';

type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'picked_up' | 'completed' | 'cancelled';

interface VendorOrder {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    photo: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  paymentMethod: string;
  orderTime: string;
  status: OrderStatus;
  prepTime?: number;
  specialInstructions?: string;
}

type OrderUpdateCallback = (orders: VendorOrder[]) => void;

class VendorOrderService {
  private listeners: Set<OrderUpdateCallback> = new Set();
  private mockOrders: VendorOrder[] = [];
  private mockInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (isDemoMode()) {
      this.initializeMockOrders();
    }
  }

  /**
   * Subscribe to order updates
   */
  subscribe(callback: OrderUpdateCallback) {
    this.listeners.add(callback);

    // Send initial data
    callback(this.mockOrders);

    // Start mock updates if not already running
    if (isDemoMode() && !this.mockInterval) {
      this.startMockUpdates();
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0) {
        this.stopMockUpdates();
      }
    };
  }

  /**
   * Get all orders
   */
  async getOrders(filter?: OrderStatus): Promise<VendorOrder[]> {
    if (isDemoMode()) {
      if (filter) {
        return this.mockOrders.filter((order) => order.status === filter);
      }
      return this.mockOrders;
    }

    // In production, fetch from API
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/vendor/orders');
      // return await response.json();
      return [];
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      return [];
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<VendorOrder | null> {
    if (isDemoMode()) {
      return this.mockOrders.find((order) => order.id === orderId) || null;
    }

    // In production, fetch from API
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/vendor/orders/${orderId}`);
      // return await response.json();
      return null;
    } catch (error) {
      console.error('Failed to fetch order:', error);
      return null;
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: OrderStatus, prepTime?: number): Promise<void> {
    if (isDemoMode()) {
      const orderIndex = this.mockOrders.findIndex((order) => order.id === orderId);
      if (orderIndex !== -1) {
        this.mockOrders[orderIndex] = {
          ...this.mockOrders[orderIndex],
          status,
          prepTime,
        };
        this.notifyListeners();
      }
      return;
    }

    // In production, send to API
    try {
      // TODO: Replace with actual API call
      // await fetch(`/api/vendor/orders/${orderId}/status`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ status, prepTime }),
      // });
    } catch (error) {
      console.error('Failed to update order status:', error);
      throw error;
    }
  }

  /**
   * Accept order
   */
  async acceptOrder(orderId: string, prepTime: number): Promise<void> {
    await this.updateOrderStatus(orderId, 'accepted', prepTime);
    // Auto-transition to preparing after a delay
    setTimeout(() => {
      this.updateOrderStatus(orderId, 'preparing', prepTime);
    }, 2000);
  }

  /**
   * Reject order
   */
  async rejectOrder(orderId: string): Promise<void> {
    await this.updateOrderStatus(orderId, 'cancelled');
  }

  /**
   * Mark order as ready
   */
  async markReady(orderId: string): Promise<void> {
    await this.updateOrderStatus(orderId, 'ready');
    // Send notification to customer and driver
    // TODO: Implement notification service
  }

  /**
   * Mark order as picked up
   */
  async markPickedUp(orderId: string): Promise<void> {
    await this.updateOrderStatus(orderId, 'picked_up');
    // Auto-complete after a short delay
    setTimeout(() => {
      this.updateOrderStatus(orderId, 'completed');
    }, 1000);
  }

  /**
   * Initialize mock orders for demo mode
   */
  private initializeMockOrders() {
    this.mockOrders = [
      {
        id: '1',
        orderNumber: '#0001',
        customer: {
          id: '1',
          name: 'Sarah Banda',
          phone: '+260971234567',
          photo: 'https://i.pravatar.cc/150?img=25',
        },
        items: [
          { id: '1', name: 'Nshima with Chicken', quantity: 2, price: 45, notes: 'Extra gravy' },
          { id: '2', name: 'Vegetable Rice', quantity: 1, price: 30 },
        ],
        subtotal: 120,
        deliveryFee: 20,
        total: 140,
        deliveryAddress: '123 Kabulonga Road, Lusaka',
        paymentMethod: 'Mobile Money',
        orderTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        status: 'pending',
        specialInstructions: 'Please pack separately',
      },
      {
        id: '2',
        orderNumber: '#0002',
        customer: {
          id: '2',
          name: 'John Mwale',
          phone: '+260977654321',
          photo: 'https://i.pravatar.cc/150?img=33',
        },
        items: [
          { id: '3', name: 'Grilled Fish', quantity: 1, price: 60 },
          { id: '4', name: 'Chips', quantity: 2, price: 15 },
        ],
        subtotal: 90,
        deliveryFee: 15,
        total: 105,
        deliveryAddress: '456 Roma Township, Lusaka',
        paymentMethod: 'Cash',
        orderTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'preparing',
        prepTime: 20,
      },
      {
        id: '3',
        orderNumber: '#0003',
        customer: {
          id: '3',
          name: 'Mary Phiri',
          phone: '+260966123456',
          photo: 'https://i.pravatar.cc/150?img=44',
        },
        items: [
          { id: '5', name: 'Beef Stew', quantity: 1, price: 50 },
          { id: '6', name: 'Nshima', quantity: 1, price: 20 },
        ],
        subtotal: 70,
        deliveryFee: 10,
        total: 80,
        deliveryAddress: '789 Chelston, Lusaka',
        paymentMethod: 'Card',
        orderTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        status: 'ready',
        prepTime: 15,
      },
    ];
  }

  /**
   * Start mock order updates
   */
  private startMockUpdates() {
    // Simulate new orders coming in
    this.mockInterval = setInterval(() => {
      const randomChance = Math.random();
      
      // 20% chance of new order
      if (randomChance < 0.2) {
        const newOrder: VendorOrder = {
          id: String(Date.now()),
          orderNumber: `#${String(this.mockOrders.length + 1).padStart(4, '0')}`,
          customer: {
            id: String(Math.floor(Math.random() * 100)),
            name: ['Alice', 'Bob', 'Charlie', 'Diana'][Math.floor(Math.random() * 4)] + ' ' +
                  ['Smith', 'Jones', 'Brown', 'Wilson'][Math.floor(Math.random() * 4)],
            phone: '+26097' + Math.floor(Math.random() * 10000000),
            photo: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          },
          items: [
            {
              id: String(Date.now()),
              name: ['Nshima with Chicken', 'Fish & Chips', 'Beef Stew', 'Vegetable Rice'][Math.floor(Math.random() * 4)],
              quantity: Math.floor(Math.random() * 3) + 1,
              price: Math.floor(Math.random() * 50) + 30,
            },
          ],
          subtotal: 100,
          deliveryFee: 15,
          total: 115,
          deliveryAddress: ['Kabulonga', 'Roma', 'Chelston', 'Woodlands'][Math.floor(Math.random() * 4)] + ', Lusaka',
          paymentMethod: ['Mobile Money', 'Cash', 'Card'][Math.floor(Math.random() * 3)],
          orderTime: new Date().toISOString(),
          status: 'pending',
        };
        
        this.mockOrders.unshift(newOrder);
        this.notifyListeners();
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Stop mock updates
   */
  private stopMockUpdates() {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = null;
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    this.listeners.forEach((callback) => callback(this.mockOrders));
  }

  /**
   * Clean up
   */
  cleanup() {
    this.listeners.clear();
    this.stopMockUpdates();
  }
}

export const vendorOrderService = new VendorOrderService();
