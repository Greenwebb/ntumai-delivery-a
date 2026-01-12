// @ts-nocheck
/**
 * Mock Authentication Data
 */

import { DEMO_CONFIG } from '../config/demo-mode';

export type UserRole = 'customer' | 'tasker' | 'vendor';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  businessName?: string;
  createdAt: Date;
}

/**
 * Mock user database
 */
export const MOCK_USERS: Record<string, MockUser> = {
  'customer@demo.com': {
    id: 'user_customer_001',
    email: 'customer@demo.com',
    name: 'Demo Customer',
    phone: '+260 97 123 4567',
    role: 'customer',
    createdAt: new Date('2024-01-01'),
  },
  'tasker@demo.com': {
    id: 'user_tasker_001',
    email: 'tasker@demo.com',
    name: 'Demo Tasker',
    phone: '+260 97 234 5678',
    role: 'tasker',
    createdAt: new Date('2024-01-01'),
  },
  'vendor@demo.com': {
    id: 'user_vendor_001',
    email: 'vendor@demo.com',
    name: 'Demo Vendor',
    phone: '+260 97 345 6789',
    role: 'vendor',
    businessName: 'Demo Restaurant',
    createdAt: new Date('2024-01-01'),
  },
};

/**
 * Mock login function
 */
export async function mockLogin(email: string, password: string): Promise<{ user: MockUser; token: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = MOCK_USERS[email.toLowerCase()];
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Check password (all demo users use 'demo123')
  if (password !== 'demo123') {
    throw new Error('Invalid email or password');
  }
  
  return {
    user,
    token: `mock_token_${user.id}_${Date.now()}`,
  };
}

/**
 * Mock register function
 */
export async function mockRegister(data: {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
  businessName?: string;
}): Promise<{ user: MockUser; token: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Check if user already exists
  if (MOCK_USERS[data.email.toLowerCase()]) {
    throw new Error('Email already registered');
  }
  
  const user: MockUser = {
    id: `user_${data.role}_${Date.now()}`,
    email: data.email,
    name: data.name,
    phone: data.phone,
    role: data.role,
    businessName: data.businessName,
    createdAt: new Date(),
  };
  
  // Add to mock database
  MOCK_USERS[data.email.toLowerCase()] = user;
  
  return {
    user,
    token: `mock_token_${user.id}_${Date.now()}`,
  };
}

/**
 * Mock logout function
 */
export async function mockLogout(): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
}

/**
 * Mock get current user function
 */
export async function mockGetCurrentUser(token: string): Promise<MockUser> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Extract user ID from token
  const userId = token.split('_')[2];
  
  // Find user by ID
  const user = Object.values(MOCK_USERS).find(u => u.id === userId);
  
  if (!user) {
    throw new Error('Invalid token');
  }
  
  return user;
}

/**
 * Mock update profile function
 */
export async function mockUpdateProfile(userId: string, updates: Partial<MockUser>): Promise<MockUser> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const user = Object.values(MOCK_USERS).find(u => u.id === userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Update user
  Object.assign(user, updates);
  
  return user;
}

/**
 * Get demo users for quick login
 */
export function getDemoUsers() {
  return {
    customer: DEMO_CONFIG.users.customer,
    tasker: DEMO_CONFIG.users.tasker,
    vendor: DEMO_CONFIG.users.vendor,
  };
}
