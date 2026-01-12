// @ts-nocheck

// Mock API Services - Simulates backend API responses
// All responses follow the documented API structure

import {
  mockUsers,
  mockProducts,
  mockAddresses,
  mockOrders,
  mockNotifications,
  mockWalletData,
  mockP2PDeliveries,
  mockTasks,
  mockVendorProfile,
  mockVendorStats,
  generateId,
  getRandomItem,
  getRandomItems,
} from './mockData';
import { User, Product, Order, DeliveryAddress } from '@/src/store/types';

// Simulate network delay
const delay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// AUTHENTICATION SERVICES
// ============================================================================

export const mockAuthService = {
  async sendOtp(email?: string, phone?: string) {
    await delay();
    return {
      success: true,
      otpId: generateId('otp'),
      expiresIn: 600,
      method: email ? 'email' : 'phone',
      maskedContact: email ? 'j***@example.com' : '+260***-***-6789',
      message: `OTP sent to ${email || phone}`,
    };
  },

  async verifyOtp(otpId: string, code: string) {
    await delay();
    if (code === '123456') {
      return {
        success: true,
        user: mockUsers.customer1,
        token: `token_${Date.now()}`,
        refreshToken: `refresh_${Date.now()}`,
        expiresIn: 3600,
        isNewUser: false,
      };
    }
    return {
      success: false,
      error: 'Invalid OTP code',
    };
  },

  async register(firstName: string, lastName: string, email?: string, phone?: string) {
    await delay();
    const newUser: User = {
      id: generateId('user'),
      email: email || `user_${Date.now()}@example.com`,
      phone,
      firstName,
      lastName,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      role: 'customer',
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      success: true,
      user: newUser,
      token: `token_${Date.now()}`,
      refreshToken: `refresh_${Date.now()}`,
      expiresIn: 3600,
      requiresVerification: false,
    };
  },

  async logout() {
    await delay(300);
    return { success: true, message: 'Logged out successfully' };
  },

  async refreshToken(refreshToken: string) {
    await delay();
    return {
      success: true,
      token: `token_${Date.now()}`,
      expiresIn: 3600,
    };
  },
};

// ============================================================================
// MARKETPLACE SERVICES
// ============================================================================

export const mockMarketplaceService = {
  async getVendors(latitude?: number, longitude?: number, search?: string) {
    await delay();
    const vendors = [mockVendorProfile];
    if (search) {
      return vendors.filter(v => v.name.toLowerCase().includes(search.toLowerCase()));
    }
    return vendors;
  },

  async getVendorDetail(vendorId: string) {
    await delay();
    if (vendorId === 'user_vnd_001') {
      return {
        success: true,
        data: mockVendorProfile,
      };
    }
    return { success: false, error: 'Vendor not found' };
  },

  async getProducts(vendorId: string, categoryId?: string) {
    await delay();
    let products = mockProducts.filter(p => p.vendorId === vendorId);
    if (categoryId) {
      products = products.filter(p => p.category === categoryId);
    }
    return {
      success: true,
      data: products,
      meta: {
        total: products.length,
        page: 1,
        limit: 50,
      },
    };
  },

  async getProductDetail(productId: string) {
    await delay();
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      return { success: true, data: product };
    }
    return { success: false, error: 'Product not found' };
  },

  async searchProducts(query: string, filters?: any) {
    await delay();
    const results = mockProducts.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );
    return {
      success: true,
      data: results,
      meta: { total: results.length },
    };
  },

  async getCategories(vendorId: string) {
    await delay();
    const categories = [
      { id: 'cat_001', name: 'Traditional', description: 'Traditional Zambian food' },
      { id: 'cat_002', name: 'Main Course', description: 'Main dishes' },
      { id: 'cat_003', name: 'Salads', description: 'Fresh salads' },
      { id: 'cat_004', name: 'Beverages', description: 'Drinks' },
    ];
    return { success: true, data: categories };
  },
};

// ============================================================================
// ORDER SERVICES
// ============================================================================

export const mockOrderService = {
  async createOrder(orderData: any) {
    await delay();
    const newOrder: Order = {
      id: generateId('order'),
      customerId: orderData.customerId,
      vendorId: orderData.vendorId,
      items: orderData.items,
      status: 'pending',
      totalAmount: orderData.totalAmount,
      deliveryFee: orderData.deliveryFee || 15000,
      discount: orderData.discount || 0,
      deliveryAddress: orderData.deliveryAddress,
      paymentMethod: orderData.paymentMethod,
      estimatedDeliveryTime: '30-45 mins',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { success: true, data: newOrder };
  },

  async getOrders(userId: string, status?: string) {
    await delay();
    let orders = mockOrders.filter(o => o.customerId === userId);
    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    return {
      success: true,
      data: orders,
      meta: { total: orders.length },
    };
  },

  async getOrderDetail(orderId: string) {
    await delay();
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      return { success: true, data: order };
    }
    return { success: false, error: 'Order not found' };
  },

  async updateOrderStatus(orderId: string, status: string) {
    await delay();
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      order.status = status as any;
      order.updatedAt = new Date().toISOString();
      return { success: true, data: order };
    }
    return { success: false, error: 'Order not found' };
  },

  async cancelOrder(orderId: string, reason?: string) {
    await delay();
    const order = mockOrders.find(o => o.id === orderId);
    if (order && ['pending', 'confirmed'].includes(order.status)) {
      order.status = 'cancelled';
      return { success: true, data: order };
    }
    return { success: false, error: 'Cannot cancel this order' };
  },

  async rateOrder(orderId: string, rating: number, review?: string) {
    await delay();
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      order.rating = rating;
      order.review = review;
      return { success: true, data: order };
    }
    return { success: false, error: 'Order not found' };
  },
};

// ============================================================================
// P2P DELIVERY SERVICES
// ============================================================================

export const mockP2PService = {
  async createDelivery(deliveryData: any) {
    await delay();
    const newDelivery = {
      id: generateId('p2p'),
      senderId: deliveryData.senderId,
      senderName: deliveryData.senderName,
      recipientName: deliveryData.recipientName,
      recipientPhone: deliveryData.recipientPhone,
      pickupLocation: deliveryData.pickupLocation,
      dropoffLocation: deliveryData.dropoffLocation,
      itemDescription: deliveryData.itemDescription,
      deliveryType: deliveryData.deliveryType,
      estimatedPrice: deliveryData.estimatedPrice,
      status: 'pending',
      createdAt: new Date().toISOString(),
      trackingLink: `https://ntumai.app/track/${generateId('p2p')}`,
    };
    return { success: true, data: newDelivery };
  },

  async getDeliveries(userId: string, role: 'sender' | 'driver' = 'sender') {
    await delay();
    let deliveries = mockP2PDeliveries;
    if (role === 'sender') {
      deliveries = deliveries.filter(d => d.senderId === userId);
    }
    return {
      success: true,
      data: deliveries,
      meta: { total: deliveries.length },
    };
  },

  async getDeliveryDetail(deliveryId: string) {
    await delay();
    const delivery = mockP2PDeliveries.find(d => d.id === deliveryId);
    if (delivery) {
      return { success: true, data: delivery };
    }
    return { success: false, error: 'Delivery not found' };
  },

  async trackDelivery(trackingId: string) {
    await delay();
    const delivery = mockP2PDeliveries.find(d => d.id === trackingId);
    if (delivery) {
      return {
        success: true,
        data: {
          ...delivery,
          driverLocation: {
            latitude: -15.3875 + Math.random() * 0.01,
            longitude: 28.3228 + Math.random() * 0.01,
            timestamp: new Date().toISOString(),
          },
        },
      };
    }
    return { success: false, error: 'Delivery not found' };
  },

  async estimatePrice(pickupLocation: any, dropoffLocation: any, deliveryType: string) {
    await delay();
    const basePrice = { moto: 20000, car: 40000, truck: 60000 };
    const price = basePrice[deliveryType as keyof typeof basePrice] || 25000;
    return {
      success: true,
      data: {
        estimatedPrice: price,
        estimatedTime: '20-30 mins',
        distance: '5.2 km',
      },
    };
  },
};

// ============================================================================
// TASK/ERRAND SERVICES
// ============================================================================

export const mockTaskService = {
  async createTask(taskData: any) {
    await delay();
    const newTask = {
      id: generateId('task'),
      customerId: taskData.customerId,
      title: taskData.title,
      description: taskData.description,
      category: taskData.category,
      items: taskData.items || [],
      budget: taskData.budget,
      status: 'pending',
      location: taskData.location,
      createdAt: new Date().toISOString(),
    };
    return { success: true, data: newTask };
  },

  async getTasks(userId: string, role: 'customer' | 'tasker' = 'customer') {
    await delay();
    let tasks = mockTasks;
    if (role === 'customer') {
      tasks = tasks.filter(t => t.customerId === userId);
    } else {
      tasks = tasks.filter(t => t.assignedTo === userId);
    }
    return {
      success: true,
      data: tasks,
      meta: { total: tasks.length },
    };
  },

  async getTaskDetail(taskId: string) {
    await delay();
    const task = mockTasks.find(t => t.id === taskId);
    if (task) {
      return { success: true, data: task };
    }
    return { success: false, error: 'Task not found' };
  },

  async updateTaskStatus(taskId: string, status: string) {
    await delay();
    const task = mockTasks.find(t => t.id === taskId);
    if (task) {
      task.status = status as any;
      return { success: true, data: task };
    }
    return { success: false, error: 'Task not found' };
  },

  async rateTask(taskId: string, rating: number, review?: string) {
    await delay();
    const task = mockTasks.find(t => t.id === taskId);
    if (task) {
      task.rating = rating;
      task.review = review;
      return { success: true, data: task };
    }
    return { success: false, error: 'Task not found' };
  },
};

// ============================================================================
// DRIVER/TASKER SERVICES
// ============================================================================

export const mockDriverService = {
  async getAvailableJobs(driverId: string, latitude: number, longitude: number) {
    await delay();
    // Return available orders and tasks nearby
    const availableOrders = mockOrders.filter(o => o.status === 'confirmed' && !o.driverId);
    const availableTasks = mockTasks.filter(t => t.status === 'pending' && !t.assignedTo);
    return {
      success: true,
      data: {
        orders: availableOrders.slice(0, 3),
        tasks: availableTasks.slice(0, 3),
      },
    };
  },

  async acceptJob(driverId: string, jobId: string, jobType: 'order' | 'task') {
    await delay();
    return {
      success: true,
      data: {
        jobId,
        jobType,
        status: 'accepted',
        message: 'Job accepted successfully',
      },
    };
  },

  async rejectJob(driverId: string, jobId: string, reason?: string) {
    await delay();
    return {
      success: true,
      data: { jobId, status: 'rejected' },
    };
  },

  async updateLocation(driverId: string, latitude: number, longitude: number) {
    await delay();
    return {
      success: true,
      data: {
        driverId,
        location: { latitude, longitude, timestamp: new Date().toISOString() },
      },
    };
  },

  async getEarnings(driverId: string, period: 'today' | 'week' | 'month' = 'today') {
    await delay();
    const earnings = {
      today: 450000,
      week: 2100000,
      month: 8500000,
    };
    return {
      success: true,
      data: {
        period,
        amount: earnings[period],
        currency: 'ZMW',
        transactions: mockWalletData.transactions,
      },
    };
  },

  async getStats(driverId: string) {
    await delay();
    return {
      success: true,
      data: {
        totalDeliveries: 342,
        totalEarnings: 2850000,
        averageRating: 4.8,
        completionRate: 98.5,
        onTimeRate: 96.2,
      },
    };
  },

  async goOnline(driverId: string) {
    await delay();
    return { success: true, data: { status: 'online' } };
  },

  async goOffline(driverId: string) {
    await delay();
    return { success: true, data: { status: 'offline' } };
  },
};

// ============================================================================
// VENDOR SERVICES
// ============================================================================

export const mockVendorService = {
  async getVendorProfile(vendorId: string) {
    await delay();
    return { success: true, data: mockVendorProfile };
  },

  async updateVendorProfile(vendorId: string, profileData: any) {
    await delay();
    return { success: true, data: { ...mockVendorProfile, ...profileData } };
  },

  async getVendorOrders(vendorId: string, status?: string) {
    await delay();
    let orders = mockOrders.filter(o => o.vendorId === vendorId);
    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    return {
      success: true,
      data: orders,
      meta: { total: orders.length },
    };
  },

  async updateOrderStatus(orderId: string, status: string) {
    await delay();
    const order = mockOrders.find(o => o.id === orderId);
    if (order) {
      order.status = status as any;
      return { success: true, data: order };
    }
    return { success: false, error: 'Order not found' };
  },

  async getProducts(vendorId: string) {
    await delay();
    return {
      success: true,
      data: mockProducts.filter(p => p.vendorId === vendorId),
    };
  },

  async createProduct(vendorId: string, productData: any) {
    await delay();
    const newProduct: Product = {
      id: generateId('prod'),
      ...productData,
      vendorId,
      rating: 0,
      reviewCount: 0,
      isAvailable: true,
    };
    return { success: true, data: newProduct };
  },

  async updateProduct(productId: string, productData: any) {
    await delay();
    const product = mockProducts.find(p => p.id === productId);
    if (product) {
      Object.assign(product, productData);
      return { success: true, data: product };
    }
    return { success: false, error: 'Product not found' };
  },

  async deleteProduct(productId: string) {
    await delay();
    const index = mockProducts.findIndex(p => p.id === productId);
    if (index > -1) {
      mockProducts.splice(index, 1);
      return { success: true, message: 'Product deleted' };
    }
    return { success: false, error: 'Product not found' };
  },

  async getStats(vendorId: string) {
    await delay();
    return { success: true, data: mockVendorStats };
  },
};

// ============================================================================
// PAYMENT SERVICES
// ============================================================================

export const mockPaymentService = {
  async initiatePayment(orderId: string, amount: number, paymentMethod: string) {
    await delay();
    return {
      success: true,
      data: {
        paymentId: generateId('pay'),
        orderId,
        amount,
        status: 'pending',
        clientSecret: `secret_${Date.now()}`,
      },
    };
  },

  async confirmPayment(paymentId: string) {
    await delay();
    return {
      success: true,
      data: {
        paymentId,
        status: 'completed',
        message: 'Payment successful',
      },
    };
  },

  async getPaymentMethods(userId: string) {
    await delay();
    return {
      success: true,
      data: [
        {
          id: 'card_001',
          type: 'card',
          last4: '4242',
          brand: 'Visa',
          isDefault: true,
        },
        {
          id: 'cash_001',
          type: 'cash',
          isDefault: false,
        },
      ],
    };
  },

  async addPaymentMethod(userId: string, methodData: any) {
    await delay();
    return {
      success: true,
      data: {
        id: generateId('card'),
        ...methodData,
        isDefault: false,
      },
    };
  },
};

// ============================================================================
// WALLET SERVICES
// ============================================================================

export const mockWalletService = {
  async getWalletBalance(userId: string) {
    await delay();
    return {
      success: true,
      data: {
        balance: mockWalletData.balance,
        currency: mockWalletData.currency,
      },
    };
  },

  async getTransactions(userId: string, limit: number = 20) {
    await delay();
    return {
      success: true,
      data: mockWalletData.transactions.slice(0, limit),
      meta: { total: mockWalletData.transactions.length },
    };
  },

  async addFunds(userId: string, amount: number, paymentMethod: string) {
    await delay();
    return {
      success: true,
      data: {
        transactionId: generateId('txn'),
        amount,
        status: 'completed',
        newBalance: mockWalletData.balance + amount,
      },
    };
  },

  async withdrawFunds(userId: string, amount: number, bankAccount: any) {
    await delay();
    return {
      success: true,
      data: {
        transactionId: generateId('txn'),
        amount,
        status: 'pending',
        estimatedTime: '1-2 business days',
      },
    };
  },
};

// ============================================================================
// NOTIFICATION SERVICES
// ============================================================================

export const mockNotificationService = {
  async getNotifications(userId: string, limit: number = 20) {
    await delay();
    return {
      success: true,
      data: mockNotifications.slice(0, limit),
      meta: { total: mockNotifications.length, unread: 2 },
    };
  },

  async markAsRead(notificationId: string) {
    await delay();
    const notif = mockNotifications.find(n => n.id === notificationId);
    if (notif) {
      notif.isRead = true;
      return { success: true };
    }
    return { success: false };
  },

  async markAllAsRead(userId: string) {
    await delay();
    mockNotifications.forEach(n => {
      if (n.userId === userId) {
        n.isRead = true;
      }
    });
    return { success: true };
  },

  async deleteNotification(notificationId: string) {
    await delay();
    const index = mockNotifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      mockNotifications.splice(index, 1);
      return { success: true };
    }
    return { success: false };
  },
};

// ============================================================================
// USER PROFILE SERVICES
// ============================================================================

export const mockUserService = {
  async getProfile(userId: string) {
    await delay();
    return {
      success: true,
      data: {
        ...mockUsers.customer1,
        addresses: mockAddresses,
        favoriteVendors: [mockVendorProfile],
      },
    };
  },

  async updateProfile(userId: string, profileData: any) {
    await delay();
    const user = mockUsers.customer1;
    Object.assign(user, profileData);
    return { success: true, data: user };
  },

  async addAddress(userId: string, addressData: any) {
    await delay();
    const newAddress: DeliveryAddress = {
      id: generateId('addr'),
      ...addressData,
      isDefault: false,
    };
    mockAddresses.push(newAddress);
    return { success: true, data: newAddress };
  },

  async updateAddress(addressId: string, addressData: any) {
    await delay();
    const address = mockAddresses.find(a => a.id === addressId);
    if (address) {
      Object.assign(address, addressData);
      return { success: true, data: address };
    }
    return { success: false, error: 'Address not found' };
  },

  async deleteAddress(addressId: string) {
    await delay();
    const index = mockAddresses.findIndex(a => a.id === addressId);
    if (index > -1) {
      mockAddresses.splice(index, 1);
      return { success: true };
    }
    return { success: false };
  },

  async getAddresses(userId: string) {
    await delay();
    return { success: true, data: mockAddresses };
  },
};
