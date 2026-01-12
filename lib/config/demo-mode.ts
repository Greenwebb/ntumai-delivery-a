// @ts-nocheck
/**
 * Demo Mode Configuration
 * 
 * Controls whether the app uses mock data or real APIs.
 * Set USAGE_DEMO=true in .env to enable demo mode globally.
 * 
 * Features without real APIs will always use mock data.
 * Features with real APIs will respect the USAGE_DEMO flag.
 */

import Constants from 'expo-constants';

// Read from environment variable
const USAGE_DEMO = process.env.EXPO_PUBLIC_USAGE_DEMO === 'true';

/**
 * Check if demo mode is enabled
 */
export function isDemoMode(): boolean {
  return USAGE_DEMO;
}

/**
 * Check if a specific feature should use mock data
 * @param feature - Feature name
 * @param hasRealAPI - Whether this feature has a real API implemented
 */
export function shouldUseMockData(feature: string, hasRealAPI: boolean = false): boolean {
  // If no real API exists, always use mock data
  if (!hasRealAPI) {
    return true;
  }
  
  // If real API exists, respect the USAGE_DEMO flag
  return USAGE_DEMO;
}

/**
 * Feature flags - tracks which features have real APIs
 */
export const FEATURE_FLAGS = {
  // Auth & User Management
  AUTH_LOGIN: false,           // Uses mock auth
  AUTH_REGISTER: false,        // Uses mock auth
  USER_PROFILE: false,         // Uses mock data
  
  // Customer Features
  RESTAURANTS: false,          // Uses mock data
  MENU_ITEMS: false,           // Uses mock data
  CART: false,                 // Uses local state
  ORDERS: false,               // Uses mock data
  ORDER_TRACKING: false,       // Uses mock data with simulated updates
  LIVE_TRACKING: false,        // Uses mock GPS simulation
  CHAT: false,                 // Uses mock messages
  
  // Tasker Features
  JOB_OFFERS: false,           // Uses mock job offers
  ACTIVE_JOBS: false,          // Uses mock data
  EARNINGS: false,             // Uses mock data
  TASKER_PROFILE: false,       // Uses mock data
  
  // Vendor Features
  VENDOR_ORDERS: false,        // Uses mock data
  VENDOR_MENU: false,          // Uses mock data
  VENDOR_ANALYTICS: false,     // Uses mock data
  
  // Shared Features
  NOTIFICATIONS: false,        // Uses local notifications
  PAYMENTS: false,             // Uses mock payment flow
  ADDRESSES: false,            // Uses local storage
  WALLET: false,               // Uses mock data
  REFERRALS: false,            // Uses mock data
  SUPPORT: false,              // Uses mock data
} as const;

/**
 * Get the appropriate data source for a feature
 */
export function getDataSource(feature: keyof typeof FEATURE_FLAGS): 'mock' | 'api' {
  const hasRealAPI = FEATURE_FLAGS[feature];
  return shouldUseMockData(feature, hasRealAPI) ? 'mock' : 'api';
}

/**
 * Demo mode configuration
 */
export const DEMO_CONFIG = {
  enabled: USAGE_DEMO,
  
  // Demo users for testing
  users: {
    customer: {
      email: 'customer@demo.com',
      password: 'demo123',
      name: 'Demo Customer',
      phone: '+260 97 123 4567',
      role: 'customer' as const,
    },
    tasker: {
      email: 'tasker@demo.com',
      password: 'demo123',
      name: 'Demo Tasker',
      phone: '+260 97 234 5678',
      role: 'tasker' as const,
    },
    vendor: {
      email: 'vendor@demo.com',
      password: 'demo123',
      name: 'Demo Vendor',
      phone: '+260 97 345 6789',
      role: 'vendor' as const,
      businessName: 'Demo Restaurant',
    },
  },
  
  // Simulation settings
  simulation: {
    // Order tracking simulation
    orderUpdateInterval: 3000,      // Update order status every 3 seconds
    gpsUpdateInterval: 2000,        // Update GPS location every 2 seconds
    
    // Job offer simulation
    jobOfferInterval: 15000,        // Send new job offer every 15 seconds
    jobOfferChance: 0.3,            // 30% chance of job offer
    
    // Chat simulation
    autoReplyDelay: 2000,           // Auto-reply after 2 seconds
    autoReplyChance: 0.5,           // 50% chance of auto-reply
    
    // Network simulation
    apiDelay: { min: 300, max: 800 }, // Simulate API latency
    errorRate: 0.02,                // 2% chance of simulated error
  },
  
  // UI indicators
  showDemoIndicator: true,         // Show "DEMO MODE" badge in UI
  showDataSource: process.env.NODE_ENV === 'development',  // Show data source labels in dev mode
} as const;

/**
 * Simulate API delay for realistic mock data
 */
export async function simulateApiDelay(): Promise<void> {
  if (!USAGE_DEMO) return;
  
  const { min, max } = DEMO_CONFIG.simulation.apiDelay;
  const delay = Math.random() * (max - min) + min;
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Simulate random API error for testing error handling
 */
export function shouldSimulateError(): boolean {
  if (!USAGE_DEMO) return false;
  return Math.random() < DEMO_CONFIG.simulation.errorRate;
}

/**
 * Log demo mode status (dev only)
 */
if (process.env.NODE_ENV === 'development') {
  console.log('🎭 Demo Mode:', USAGE_DEMO ? 'ENABLED' : 'DISABLED');
  if (USAGE_DEMO) {
    console.log('📊 Features using mock data:', 
      Object.entries(FEATURE_FLAGS)
        .filter(([_, hasAPI]) => !hasAPI)
        .map(([feature]) => feature)
    );
  }
}
