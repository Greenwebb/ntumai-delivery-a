import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Order History Cache Service
 * 
 * Caches order history locally for offline viewing.
 * Automatically syncs with server when online.
 */

const ORDER_HISTORY_KEY = '@taapp:order_history_cache';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface CachedOrderHistory {
  orders: any[];
  lastSync: number;
  expiresAt: number;
}

export const orderHistoryCache = {
  /**
   * Save order history to cache
   */
  async save(orders: any[]): Promise<void> {
    try {
      const now = Date.now();
      const cache: CachedOrderHistory = {
        orders,
        lastSync: now,
        expiresAt: now + CACHE_EXPIRY_MS,
      };
      await AsyncStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to cache order history:', error);
    }
  },

  /**
   * Load order history from cache
   */
  async load(): Promise<any[] | null> {
    try {
      const cached = await AsyncStorage.getItem(ORDER_HISTORY_KEY);
      if (!cached) return null;

      const data: CachedOrderHistory = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() > data.expiresAt) {
        await this.clear();
        return null;
      }

      return data.orders;
    } catch (error) {
      console.error('Failed to load cached order history:', error);
      return null;
    }
  },

  /**
   * Check if cache is valid (not expired)
   */
  async isValid(): Promise<boolean> {
    try {
      const cached = await AsyncStorage.getItem(ORDER_HISTORY_KEY);
      if (!cached) return false;

      const data: CachedOrderHistory = JSON.parse(cached);
      return Date.now() <= data.expiresAt;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get cache metadata
   */
  async getMetadata(): Promise<{ lastSync: number; expiresAt: number } | null> {
    try {
      const cached = await AsyncStorage.getItem(ORDER_HISTORY_KEY);
      if (!cached) return null;

      const data: CachedOrderHistory = JSON.parse(cached);
      return {
        lastSync: data.lastSync,
        expiresAt: data.expiresAt,
      };
    } catch (error) {
      return null;
    }
  },

  /**
   * Clear cache
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ORDER_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear order history cache:', error);
    }
  },

  /**
   * Append a new order to cache (for optimistic UI)
   */
  async appendOrder(order: any): Promise<void> {
    try {
      const cached = await this.load();
      if (!cached) {
        await this.save([order]);
        return;
      }

      // Add to beginning of array
      cached.unshift(order);
      
      // Keep only last 100 orders
      const limited = cached.slice(0, 100);
      await this.save(limited);
    } catch (error) {
      console.error('Failed to append order to cache:', error);
    }
  },
};
