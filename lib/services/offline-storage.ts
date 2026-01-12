import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Offline Storage Service
 * 
 * Provides persistent storage for critical app data using AsyncStorage.
 * Supports offline mode by caching data locally and syncing when online.
 */

// Storage keys
const STORAGE_KEYS = {
  CART: '@taapp:cart',
  ORDER_HISTORY: '@taapp:order_history',
  FAVORITES: '@taapp:favorites',
  OFFLINE_QUEUE: '@taapp:offline_queue',
  LAST_SYNC: '@taapp:last_sync',
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;

/**
 * Generic storage operations
 */
export const offlineStorage = {
  /**
   * Save data to AsyncStorage
   */
  async set<T>(key: StorageKey, data: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(STORAGE_KEYS[key], jsonValue);
    } catch (error) {
      console.error(`Failed to save ${key} to storage:`, error);
      throw error;
    }
  },

  /**
   * Get data from AsyncStorage
   */
  async get<T>(key: StorageKey): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS[key]);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Failed to get ${key} from storage:`, error);
      return null;
    }
  },

  /**
   * Remove data from AsyncStorage
   */
  async remove(key: StorageKey): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS[key]);
    } catch (error) {
      console.error(`Failed to remove ${key} from storage:`, error);
      throw error;
    }
  },

  /**
   * Clear all app data from AsyncStorage
   */
  async clearAll(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Failed to clear all storage:', error);
      throw error;
    }
  },

  /**
   * Get multiple items at once
   */
  async getMultiple<T extends Record<string, any>>(
    keys: StorageKey[]
  ): Promise<Partial<T>> {
    try {
      const storageKeys = keys.map(k => STORAGE_KEYS[k]);
      const pairs = await AsyncStorage.multiGet(storageKeys);
      
      const result: any = {};
      pairs.forEach(([key, value], index) => {
        if (value != null) {
          result[keys[index]] = JSON.parse(value);
        }
      });
      
      return result;
    } catch (error) {
      console.error('Failed to get multiple items from storage:', error);
      return {};
    }
  },
};

/**
 * Cart-specific operations
 */
export const cartStorage = {
  async save(cart: any): Promise<void> {
    await offlineStorage.set('CART', cart);
  },

  async load(): Promise<any | null> {
    return await offlineStorage.get('CART');
  },

  async clear(): Promise<void> {
    await offlineStorage.remove('CART');
  },
};

/**
 * Order history operations
 */
export const orderHistoryStorage = {
  async save(orders: any[]): Promise<void> {
    await offlineStorage.set('ORDER_HISTORY', orders);
  },

  async load(): Promise<any[] | null> {
    return await offlineStorage.get('ORDER_HISTORY');
  },

  async append(order: any): Promise<void> {
    const existing = await this.load() || [];
    existing.unshift(order); // Add to beginning
    // Keep only last 50 orders
    const limited = existing.slice(0, 50);
    await this.save(limited);
  },
};

/**
 * Favorites operations
 */
export const favoritesStorage = {
  async save(favorites: any[]): Promise<void> {
    await offlineStorage.set('FAVORITES', favorites);
  },

  async load(): Promise<any[] | null> {
    return await offlineStorage.get('FAVORITES');
  },

  async add(item: any): Promise<void> {
    const existing = await this.load() || [];
    // Check if already exists
    if (!existing.find(f => f.id === item.id)) {
      existing.push(item);
      await this.save(existing);
    }
  },

  async remove(itemId: string): Promise<void> {
    const existing = await this.load() || [];
    const filtered = existing.filter(f => f.id !== itemId);
    await this.save(filtered);
  },
};

/**
 * Offline queue operations
 */
export interface OfflineAction {
  id: string;
  type: 'ADD_TO_CART' | 'PLACE_ORDER' | 'UPDATE_PROFILE' | 'ADD_FAVORITE' | 'REMOVE_FAVORITE';
  payload: any;
  timestamp: number;
  retries: number;
}

export const offlineQueueStorage = {
  async enqueue(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    const queue = await this.load() || [];
    const newAction: OfflineAction = {
      ...action,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };
    queue.push(newAction);
    await offlineStorage.set('OFFLINE_QUEUE', queue);
  },

  async load(): Promise<OfflineAction[] | null> {
    return await offlineStorage.get('OFFLINE_QUEUE');
  },

  async dequeue(actionId: string): Promise<void> {
    const queue = await this.load() || [];
    const filtered = queue.filter(a => a.id !== actionId);
    await offlineStorage.set('OFFLINE_QUEUE', filtered);
  },

  async clear(): Promise<void> {
    await offlineStorage.remove('OFFLINE_QUEUE');
  },

  async incrementRetry(actionId: string): Promise<void> {
    const queue = await this.load() || [];
    const updated = queue.map(a => 
      a.id === actionId ? { ...a, retries: a.retries + 1 } : a
    );
    await offlineStorage.set('OFFLINE_QUEUE', updated);
  },
};

/**
 * Last sync timestamp
 */
export const syncStorage = {
  async setLastSync(): Promise<void> {
    await offlineStorage.set('LAST_SYNC', Date.now());
  },

  async getLastSync(): Promise<number | null> {
    return await offlineStorage.get('LAST_SYNC');
  },
};
