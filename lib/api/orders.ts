// @ts-nocheck

// Order API endpoints
import { apiClient } from './client';
import {
  ApiResponse,
  ListResponse,
  Order,
  OrderItem,
  OrderStatus,
  OrderTracking,
  PaginationParams,
} from './types';
import { API_ENDPOINTS } from './config';

// Order service class
export class OrderService {
  // Create new order
  async createOrder(orderData: {
    restaurantId: string;
    items: Array<{
      menuItemId: string;
      quantity: number;
      selectedOptions?: Array<{
        optionId: string;
        choiceId: string;
      }>;
      specialInstructions?: string;
    }>;
    deliveryAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      latitude?: number;
      longitude?: number;
      instructions?: string;
    };
    paymentMethodId: string;
    promoCode?: string;
    scheduledDeliveryTime?: string;
    contactPhone?: string;
    deliveryInstructions?: string;
  }): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(API_ENDPOINTS.ORDERS.CREATE, orderData, {
      cache: false,
    });
  }

  // Get user's orders
  async getUserOrders(
    params?: PaginationParams & {
      status?: OrderStatus[];
      restaurantId?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<ApiResponse<ListResponse<Order>>> {
    return apiClient.get<ListResponse<Order>>(API_ENDPOINTS.ORDERS.LIST, {
      params,
      cache: true,
      cacheTimeout: 2 * 60 * 1000, // 2 minutes
    });
  }

  // Get order by ID
  async getOrder(orderId: string): Promise<ApiResponse<Order>> {
    return apiClient.get<Order>(`${API_ENDPOINTS.ORDERS.DETAIL}/${orderId}`, {
      cache: true,
      cacheTimeout: 1 * 60 * 1000, // 1 minute
    });
  }

  // Update order status (for restaurant/admin use)
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    notes?: string
  ): Promise<ApiResponse<Order>> {
    return apiClient.patch<Order>(
      `${API_ENDPOINTS.ORDERS.DETAIL}/${orderId}/status`,
      { status, notes },
      {
        cache: false,
      }
    );
  }

  // Cancel order
  async cancelOrder(
    orderId: string,
    reason?: string
  ): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(
      `${API_ENDPOINTS.ORDERS.DETAIL}/${orderId}/cancel`,
      { reason },
      {
        cache: false,
      }
    );
  }

  // Get order tracking information
  async getOrderTracking(orderId: string): Promise<ApiResponse<OrderTracking>> {
    return apiClient.get<OrderTracking>(
      `${API_ENDPOINTS.ORDERS.DETAIL}/${orderId}/tracking`,
      {
        cache: true,
        cacheTimeout: 30 * 1000, // 30 seconds
      }
    );
  }

  // Get live order updates (for real-time tracking)
  async getOrderUpdates(orderId: string): Promise<ApiResponse<{
    status: OrderStatus;
    estimatedDeliveryTime: string;
    driverLocation?: {
      latitude: number;
      longitude: number;
      heading?: number;
    };
    statusHistory: Array<{
      status: OrderStatus;
      timestamp: string;
      notes?: string;
    }>;
  }>> {
    return apiClient.get(
      `${API_ENDPOINTS.ORDERS.DETAIL}/${orderId}/updates`,
      {
        cache: false,
      }
    );
  }

  // Reorder (create new order from existing order)
  async reorder(orderId: string): Promise<ApiResponse<Order>> {
    return apiClient.post<Order>(
      `${API_ENDPOINTS.ORDERS.DETAIL}/${orderId}/reorder`,
      {},
      {
        cache: false,
      }
    );
  }

  // Get order receipt
  async getOrderReceipt(orderId: string): Promise<ApiResponse<{
    orderId: string;
    orderNumber: string;
    restaurant: {
      name: string;
      address: string;
      phone: string;
    };
    items: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      options?: string[];
    }>;
    subtotal: number;
    tax: number;
    deliveryFee: number;
    serviceFee: number;
    discount: number;
    total: number;
    paymentMethod: string;
    orderDate: string;
    deliveryAddress: string;
  }>> {
    return apiClient.get(
      `${API_ENDPOINTS.ORDERS.DETAIL}/${orderId}/receipt`,
      {
        cache: true,
        cacheTimeout: 60 * 60 * 1000, // 1 hour
      }
    );
  }

  // Rate order and delivery
  async rateOrder(
    orderId: string,
    rating: {
      foodRating: number;
      deliveryRating: number;
      restaurantRating: number;
      comment?: string;
      tip?: number;
    }
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>(
      `${API_ENDPOINTS.ORDERS.DETAIL}/${orderId}/rate`,
      rating,
      {
        cache: false,
      }
    );
  }

  // Report order issue
  async reportOrderIssue(
    orderId: string,
    issue: {
      type: 'missing_items' | 'wrong_items' | 'quality_issue' | 'delivery_issue' | 'other';
      description: string;
      items?: string[]; // IDs of affected items
      photos?: string[]; // URLs of uploaded photos
      requestRefund?: boolean;
    }
  ): Promise<ApiResponse<{
    issueId: string;
    status: 'submitted' | 'under_review' | 'resolved';
    estimatedResolutionTime: string;
  }>> {
    return apiClient.post(
      `${API_ENDPOINTS.ORDERS.DETAIL}/${orderId}/report-issue`,
      issue,
      {
        cache: false,
      }
    );
  }

  // Get order issues
  async getOrderIssues(
    orderId: string
  ): Promise<ApiResponse<Array<{
    id: string;
    type: string;
    description: string;
    status: string;
    createdAt: string;
    resolvedAt?: string;
    resolution?: string;
  }>>> {
    return apiClient.get(
      `${API_ENDPOINTS.ORDERS.DETAIL}/${orderId}/issues`,
      {
        cache: true,
        cacheTimeout: 5 * 60 * 1000, // 5 minutes
      }
    );
  }

  // Calculate order total
  async calculateOrderTotal(orderData: {
    restaurantId: string;
    items: Array<{
      menuItemId: string;
      quantity: number;
      selectedOptions?: Array<{
        optionId: string;
        choiceId: string;
      }>;
    }>;
    deliveryAddress: {
      latitude: number;
      longitude: number;
    };
    promoCode?: string;
  }): Promise<ApiResponse<{
    subtotal: number;
    tax: number;
    deliveryFee: number;
    serviceFee: number;
    discount: number;
    promoDiscount: number;
    total: number;
    estimatedDeliveryTime: number;
  }>> {
    return apiClient.post(
      API_ENDPOINTS.ORDERS.CALCULATE_TOTAL,
      orderData,
      {
        cache: true,
        cacheTimeout: 1 * 60 * 1000, // 1 minute
      }
    );
  }

  // Validate promo code
  async validatePromoCode(
    promoCode: string,
    restaurantId?: string,
    orderTotal?: number
  ): Promise<ApiResponse<{
    isValid: boolean;
    discountType: 'percentage' | 'fixed' | 'free_delivery';
    discountValue: number;
    minimumOrder?: number;
    maximumDiscount?: number;
    expiresAt?: string;
    description?: string;
    errorMessage?: string;
  }>> {
    const params = {
      code: promoCode,
      restaurantId,
      orderTotal,
    };

    return apiClient.get(API_ENDPOINTS.ORDERS.VALIDATE_PROMO, {
      params,
      cache: true,
      cacheTimeout: 2 * 60 * 1000, // 2 minutes
    });
  }

  // Get available delivery time slots
  async getDeliveryTimeSlots(
    restaurantId: string,
    deliveryAddress: {
      latitude: number;
      longitude: number;
    }
  ): Promise<ApiResponse<{
    asap: {
      available: boolean;
      estimatedTime: number;
    };
    slots: Array<{
      date: string;
      times: Array<{
        time: string;
        available: boolean;
        fee?: number;
      }>;
    }>;
  }>> {
    return apiClient.post(
      API_ENDPOINTS.ORDERS.DELIVERY_SLOTS,
      { restaurantId, deliveryAddress },
      {
        cache: true,
        cacheTimeout: 5 * 60 * 1000, // 5 minutes
      }
    );
  }

  // Get order history statistics
  async getOrderStats(): Promise<ApiResponse<{
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    favoriteRestaurant: {
      id: string;
      name: string;
      orderCount: number;
    };
    mostOrderedItems: Array<{
      id: string;
      name: string;
      restaurant: string;
      orderCount: number;
    }>;
    ordersByMonth: Array<{
      month: string;
      count: number;
      total: number;
    }>;
  }>> {
    return apiClient.get(API_ENDPOINTS.ORDERS.STATS, {
      cache: true,
      cacheTimeout: 15 * 60 * 1000, // 15 minutes
    });
  }

  // Get active orders (orders in progress)
  async getActiveOrders(): Promise<ApiResponse<Order[]>> {
    return apiClient.get<Order[]>(API_ENDPOINTS.ORDERS.ACTIVE, {
      cache: true,
      cacheTimeout: 30 * 1000, // 30 seconds
    });
  }

  // Get order recommendations (suggested reorders)
  async getOrderRecommendations(): Promise<ApiResponse<Array<{
    type: 'reorder' | 'similar' | 'trending';
    title: string;
    description: string;
    order?: Order;
    restaurant?: {
      id: string;
      name: string;
      image: string;
    };
    items?: Array<{
      id: string;
      name: string;
      price: number;
      image: string;
    }>;
  }>>> {
    return apiClient.get(API_ENDPOINTS.ORDERS.RECOMMENDATIONS, {
      cache: true,
      cacheTimeout: 10 * 60 * 1000, // 10 minutes
    });
  }

  // Schedule order for later
  async scheduleOrder(
    orderData: any,
    scheduledTime: string
  ): Promise<ApiResponse<{
    scheduledOrderId: string;
    scheduledTime: string;
    status: 'scheduled';
  }>> {
    return apiClient.post(
      API_ENDPOINTS.ORDERS.SCHEDULE,
      { ...orderData, scheduledTime },
      {
        cache: false,
      }
    );
  }

  // Get scheduled orders
  async getScheduledOrders(): Promise<ApiResponse<Array<{
    id: string;
    scheduledTime: string;
    restaurant: {
      id: string;
      name: string;
      image: string;
    };
    itemCount: number;
    total: number;
    status: 'scheduled' | 'cancelled';
  }>>> {
    return apiClient.get(API_ENDPOINTS.ORDERS.SCHEDULED, {
      cache: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
    });
  }

  // Cancel scheduled order
  async cancelScheduledOrder(scheduledOrderId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(
      `${API_ENDPOINTS.ORDERS.SCHEDULED}/${scheduledOrderId}`,
      {
        cache: false,
      }
    );
  }

  // Add tip to completed order
  async addTip(
    orderId: string,
    tipAmount: number,
    tipType: 'percentage' | 'fixed' = 'fixed'
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>(
      `${API_ENDPOINTS.ORDERS.DETAIL}/${orderId}/tip`,
      { amount: tipAmount, type: tipType },
      {
        cache: false,
      }
    );
  }

  // Get order invoice (for business users)
  async getOrderInvoice(orderId: string): Promise<ApiResponse<{
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    billTo: {
      name: string;
      address: string;
      taxId?: string;
    };
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
    paymentStatus: 'paid' | 'pending' | 'overdue';
  }>> {
    return apiClient.get(
      `${API_ENDPOINTS.ORDERS.DETAIL}/${orderId}/invoice`,
      {
        cache: true,
        cacheTimeout: 30 * 60 * 1000, // 30 minutes
      }
    );
  }
}

// Default order service instance
export const orderService = new OrderService();

// Order utility functions
export const orderUtils = {
  // Calculate order total from items
  calculateTotal(
    items: OrderItem[],
    deliveryFee: number = 0,
    serviceFee: number = 0,
    tax: number = 0,
    discount: number = 0
  ): number {
    const subtotal = items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    return subtotal + deliveryFee + serviceFee + tax - discount;
  },

  // Format order status for display
  formatOrderStatus(status: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
      pending: 'Order Placed',
      confirmed: 'Confirmed',
      preparing: 'Being Prepared',
      ready: 'Ready for Pickup',
      picked_up: 'Out for Delivery',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    };
    
    return statusMap[status] || status;
  },

  // Get order status color
  getOrderStatusColor(status: OrderStatus): string {
    const colorMap: Record<OrderStatus, string> = {
      pending: '#FFA500',
      confirmed: '#4CAF50',
      preparing: '#2196F3',
      ready: '#FF9800',
      picked_up: '#9C27B0',
      delivered: '#4CAF50',
      cancelled: '#F44336',
      refunded: '#607D8B',
    };
    
    return colorMap[status] || '#757575';
  },

  // Check if order can be cancelled
  canCancelOrder(order: Order): boolean {
    const cancellableStatuses: OrderStatus[] = ['pending', 'confirmed'];
    return cancellableStatuses.includes(order.status);
  },

  // Check if order can be rated
  canRateOrder(order: Order): boolean {
    return order.status === 'delivered' && !order.rating;
  },

  // Calculate estimated delivery time
  calculateEstimatedDelivery(
    orderTime: Date,
    preparationTime: number,
    deliveryTime: number
  ): Date {
    const totalMinutes = preparationTime + deliveryTime;
    return new Date(orderTime.getTime() + totalMinutes * 60 * 1000);
  },

  // Format delivery time
  formatDeliveryTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }
    
    return `${hours} hr ${remainingMinutes} min`;
  },

  // Group orders by date
  groupOrdersByDate(orders: Order[]): Record<string, Order[]> {
    return orders.reduce((groups, order) => {
      const date = new Date(order.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(order);
      return groups;
    }, {} as Record<string, Order[]>);
  },

  // Filter orders by status
  filterOrdersByStatus(orders: Order[], statuses: OrderStatus[]): Order[] {
    return orders.filter(order => statuses.includes(order.status));
  },

  // Get order progress percentage
  getOrderProgress(status: OrderStatus): number {
    const progressMap: Record<OrderStatus, number> = {
      pending: 10,
      confirmed: 25,
      preparing: 50,
      ready: 75,
      picked_up: 90,
      delivered: 100,
      cancelled: 0,
      refunded: 0,
    };
    
    return progressMap[status] || 0;
  },

  // Generate order number
  generateOrderNumber(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `ORD-${timestamp}-${random}`.toUpperCase();
  },

  // Validate order items
  validateOrderItems(items: OrderItem[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!items || items.length === 0) {
      errors.push('Order must contain at least one item');
    }
    
    items.forEach((item, index) => {
      if (!item.menuItemId) {
        errors.push(`Item ${index + 1}: Menu item ID is required`);
      }
      
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
      
      if (!item.price || item.price < 0) {
        errors.push(`Item ${index + 1}: Price must be a positive number`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};
