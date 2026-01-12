// @ts-nocheck
/**
 * Demo Mode Smart API Layer
 * 
 * Automatically switches between real API and mock data based on:
 * 1. USAGE_DEMO environment variable
 * 2. Whether a real API exists for the feature
 * 
 * Usage:
 * ```ts
 * import { demoApi } from '@/lib/api/demo-api';
 * 
 * const user = await demoApi.auth.login(email, password);
 * const restaurants = await demoApi.restaurants.getAll();
 * ```
 */

import { isDemoMode, getDataSource, FEATURE_FLAGS } from '../config/demo-mode';
import * as mockAuth from '../mock-data/mock-auth';
import * as mockRestaurants from '../mock-data/mock-restaurants';
import * as mockOrders from '../mock-data/mock-orders';
import * as mockJobs from '../mock-data/mock-jobs';
import * as mockVendor from '../mock-data/mock-vendor';
import * as mockShared from '../mock-data/mock-shared';

// Import existing real APIs when available
import { apiClient } from './client';

/**
 * Auth API
 */
export const authApi = {
  async login(email: string, password: string) {
    const source = getDataSource('AUTH_LOGIN');
    
    if (source === 'mock') {
      return mockAuth.mockLogin(email, password);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async register(data: Parameters<typeof mockAuth.mockRegister>[0]) {
    const source = getDataSource('AUTH_REGISTER');
    
    if (source === 'mock') {
      return mockAuth.mockRegister(data);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async logout() {
    const source = getDataSource('AUTH_LOGIN');
    
    if (source === 'mock') {
      return mockAuth.mockLogout();
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async getCurrentUser(token: string) {
    const source = getDataSource('USER_PROFILE');
    
    if (source === 'mock') {
      return mockAuth.mockGetCurrentUser(token);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async updateProfile(userId: string, updates: Partial<mockAuth.MockUser>) {
    const source = getDataSource('USER_PROFILE');
    
    if (source === 'mock') {
      return mockAuth.mockUpdateProfile(userId, updates);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  getDemoUsers() {
    return mockAuth.getDemoUsers();
  },
};

/**
 * Restaurants API
 */
export const restaurantsApi = {
  async getAll() {
    const source = getDataSource('RESTAURANTS');
    
    if (source === 'mock') {
      return mockRestaurants.mockGetRestaurants();
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async getById(id: string) {
    const source = getDataSource('RESTAURANTS');
    
    if (source === 'mock') {
      return mockRestaurants.mockGetRestaurant(id);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async getMenuItems(restaurantId: string) {
    const source = getDataSource('MENU_ITEMS');
    
    if (source === 'mock') {
      return mockRestaurants.mockGetMenuItems(restaurantId);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async search(query: string) {
    const source = getDataSource('RESTAURANTS');
    
    if (source === 'mock') {
      return mockRestaurants.mockSearchRestaurants(query);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
};

/**
 * Orders API (Customer)
 */
export const ordersApi = {
  async getAll(userId: string) {
    const source = getDataSource('ORDERS');
    
    if (source === 'mock') {
      return mockOrders.mockGetOrders(userId);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async getById(orderId: string) {
    const source = getDataSource('ORDERS');
    
    if (source === 'mock') {
      return mockOrders.mockGetOrder(orderId);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async create(data: Parameters<typeof mockOrders.mockCreateOrder>[0]) {
    const source = getDataSource('ORDERS');
    
    if (source === 'mock') {
      return mockOrders.mockCreateOrder(data);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async updateStatus(orderId: string, status: mockOrders.OrderStatus) {
    const source = getDataSource('ORDERS');
    
    if (source === 'mock') {
      return mockOrders.mockUpdateOrderStatus(orderId, status);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async cancel(orderId: string) {
    const source = getDataSource('ORDERS');
    
    if (source === 'mock') {
      return mockOrders.mockCancelOrder(orderId);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
};

/**
 * Jobs API (Tasker)
 */
export const jobsApi = {
  async getAvailable() {
    const source = getDataSource('JOB_OFFERS');
    
    if (source === 'mock') {
      return mockJobs.mockGetAvailableJobs();
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async getById(jobId: string) {
    const source = getDataSource('JOB_OFFERS');
    
    if (source === 'mock') {
      return mockJobs.mockGetJob(jobId);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async accept(jobId: string, taskerId: string) {
    const source = getDataSource('JOB_OFFERS');
    
    if (source === 'mock') {
      return mockJobs.mockAcceptJob(jobId, taskerId);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async start(jobId: string) {
    const source = getDataSource('ACTIVE_JOBS');
    
    if (source === 'mock') {
      return mockJobs.mockStartJob(jobId);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async complete(jobId: string) {
    const source = getDataSource('ACTIVE_JOBS');
    
    if (source === 'mock') {
      return mockJobs.mockCompleteJob(jobId);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async getTaskerJobs(taskerId: string) {
    const source = getDataSource('ACTIVE_JOBS');
    
    if (source === 'mock') {
      return mockJobs.mockGetTaskerJobs(taskerId);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async getEarnings(taskerId: string) {
    const source = getDataSource('EARNINGS');
    
    if (source === 'mock') {
      return mockJobs.mockGetTaskerEarnings(taskerId);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
};

/**
 * Vendor API
 */
export const vendorApi = {
  async getOrders(vendorId: string) {
    const source = getDataSource('VENDOR_ORDERS');
    
    if (source === 'mock') {
      return mockVendor.mockGetVendorOrders(vendorId);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async getOrderById(orderId: string) {
    const source = getDataSource('VENDOR_ORDERS');
    
    if (source === 'mock') {
      return mockVendor.mockGetVendorOrder(orderId);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async updateOrderStatus(orderId: string, status: mockVendor.MockVendorOrder['status']) {
    const source = getDataSource('VENDOR_ORDERS');
    
    if (source === 'mock') {
      return mockVendor.mockUpdateVendorOrderStatus(orderId, status);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
  
  async getStats(vendorId: string) {
    const source = getDataSource('VENDOR_ANALYTICS');
    
    if (source === 'mock') {
      return mockVendor.mockGetVendorStats(vendorId);
    }
    
    // TODO: Implement real API call
    throw new Error('Real API not implemented yet');
  },
};

/**
 * Shared API (Addresses, Payments, Wallet)
 */
export const sharedApi = {
  addresses: {
    async getAll(userId: string) {
      const source = getDataSource('ADDRESSES');
      
      if (source === 'mock') {
        return mockShared.mockGetAddresses(userId);
      }
      
      // TODO: Implement real API call
      throw new Error('Real API not implemented yet');
    },
    
    async add(data: Parameters<typeof mockShared.mockAddAddress>[0]) {
      const source = getDataSource('ADDRESSES');
      
      if (source === 'mock') {
        return mockShared.mockAddAddress(data);
      }
      
      // TODO: Implement real API call
      throw new Error('Real API not implemented yet');
    },
    
    async update(addressId: string, updates: Partial<mockShared.MockAddress>) {
      const source = getDataSource('ADDRESSES');
      
      if (source === 'mock') {
        return mockShared.mockUpdateAddress(addressId, updates);
      }
      
      // TODO: Implement real API call
      throw new Error('Real API not implemented yet');
    },
    
    async delete(addressId: string) {
      const source = getDataSource('ADDRESSES');
      
      if (source === 'mock') {
        return mockShared.mockDeleteAddress(addressId);
      }
      
      // TODO: Implement real API call
      throw new Error('Real API not implemented yet');
    },
  },
  
  payments: {
    async getMethods(userId: string) {
      const source = getDataSource('PAYMENTS');
      
      if (source === 'mock') {
        return mockShared.mockGetPaymentMethods(userId);
      }
      
      // TODO: Implement real API call
      throw new Error('Real API not implemented yet');
    },
    
    async addMethod(data: Parameters<typeof mockShared.mockAddPaymentMethod>[0]) {
      const source = getDataSource('PAYMENTS');
      
      if (source === 'mock') {
        return mockShared.mockAddPaymentMethod(data);
      }
      
      // TODO: Implement real API call
      throw new Error('Real API not implemented yet');
    },
  },
  
  wallet: {
    async getBalance(userId: string) {
      const source = getDataSource('WALLET');
      
      if (source === 'mock') {
        return mockShared.mockGetWalletBalance(userId);
      }
      
      // TODO: Implement real API call
      throw new Error('Real API not implemented yet');
    },
    
    async getTransactions(userId: string) {
      const source = getDataSource('WALLET');
      
      if (source === 'mock') {
        return mockShared.mockGetWalletTransactions(userId);
      }
      
      // TODO: Implement real API call
      throw new Error('Real API not implemented yet');
    },
    
    async topUp(userId: string, amount: number) {
      const source = getDataSource('WALLET');
      
      if (source === 'mock') {
        return mockShared.mockTopUpWallet(userId, amount);
      }
      
      // TODO: Implement real API call
      throw new Error('Real API not implemented yet');
    },
  },
};

/**
 * Combined Demo API export
 */
export const demoApi = {
  auth: authApi,
  restaurants: restaurantsApi,
  orders: ordersApi,
  jobs: jobsApi,
  vendor: vendorApi,
  shared: sharedApi,
};

/**
 * Check if demo mode is active
 */
export { isDemoMode } from '../config/demo-mode';
