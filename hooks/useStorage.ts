// @ts-nocheck

// Storage management hook
import { useState, useEffect, useCallback, useRef } from 'react';
import { UseAsyncStorageOptions, StorageState } from './types';
import { Storage, storageUtils, CacheStorage, secureStorage } from '@/src/utils/storage';

export interface UseStorageResult<T> {
  // Storage state
  data: T | null;
  loading: boolean;
  error: string | null;
  
  // Storage actions
  setData: (value: T) => Promise<void>;
  removeData: () => Promise<void>;
  refresh: () => Promise<void>;
  
  // Storage utilities
  exists: boolean;
  lastUpdated: Date | null;
  size: number;
}

export const useStorage = <T = any>(
  key: string,
  options: UseAsyncStorageOptions<T> = {}
): UseStorageResult<T> => {
  const {
    defaultValue = null,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onError,
    syncAcrossInstances = false,
    cacheTimeout = 0,
    encrypted = false,
  } = options;

  const [data, setDataState] = useState<T | null>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exists, setExists] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [size, setSize] = useState(0);

  const storage = useRef(new Storage());
  const cacheStorage = useRef(new CacheStorage());
  const mounted = useRef(true);

  // Load data from storage
  const loadData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      let value: string | null = null;
      
      // Try cache first if timeout is set
      if (cacheTimeout > 0) {
        const cachedData = await cacheStorage.current.get<T>(key);
        if (cachedData !== null) {
          if (mounted.current) {
            setDataState(cachedData);
            setExists(true);
            setLastUpdated(new Date());
            setLoading(false);
          }
          return;
        }
      }
      
      // Load from storage
      if (encrypted) {
        value = await secureStorage.getItem(key);
      } else {
        value = await storage.current.getItem(key);
      }

      if (value !== null) {
        const parsedData = deserialize(value);
        
        // Cache the data if timeout is set
        if (cacheTimeout > 0) {
          await cacheStorage.current.set(key, parsedData, cacheTimeout);
        }
        
        if (mounted.current) {
          setDataState(parsedData);
          setExists(true);
          setLastUpdated(new Date());
          setSize(value.length);
        }
      } else {
        if (mounted.current) {
          setDataState(defaultValue);
          setExists(false);
          setLastUpdated(null);
          setSize(0);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load data from storage';
      
      if (mounted.current) {
        setError(errorMessage);
        setDataState(defaultValue);
        setExists(false);
      }
      
      onError?.(err);
      console.error(`Storage error for key "${key}":`, err);
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [key, defaultValue, deserialize, onError, cacheTimeout, encrypted]);

  // Save data to storage
  const setData = useCallback(async (value: T): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const serializedValue = serialize(value);
      
      // Save to storage
      if (encrypted) {
        await secureStorage.setItem(key, serializedValue);
      } else {
        await storage.current.setItem(key, serializedValue);
      }
      
      // Update cache if timeout is set
      if (cacheTimeout > 0) {
        await cacheStorage.current.set(key, value, cacheTimeout);
      }

      if (mounted.current) {
        setDataState(value);
        setExists(true);
        setLastUpdated(new Date());
        setSize(serializedValue.length);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save data to storage';
      
      if (mounted.current) {
        setError(errorMessage);
      }
      
      onError?.(err);
      console.error(`Storage error for key "${key}":`, err);
      throw err;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [key, serialize, onError, cacheTimeout, encrypted]);

  // Remove data from storage
  const removeData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Remove from storage
      if (encrypted) {
        await secureStorage.removeItem(key);
      } else {
        await storage.current.removeItem(key);
      }
      
      // Remove from cache
      await cacheStorage.current.remove(key);

      if (mounted.current) {
        setDataState(defaultValue);
        setExists(false);
        setLastUpdated(null);
        setSize(0);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove data from storage';
      
      if (mounted.current) {
        setError(errorMessage);
      }
      
      onError?.(err);
      console.error(`Storage error for key "${key}":`, err);
      throw err;
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [key, defaultValue, onError, encrypted]);

  // Refresh data from storage
  const refresh = useCallback(async (): Promise<void> => {
    // Clear cache first
    await cacheStorage.current.remove(key);
    await loadData();
  }, [key, loadData]);

  // Initialize data loading
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  // Sync across instances if enabled
  useEffect(() => {
    if (!syncAcrossInstances) return;

    // This would require a more sophisticated implementation
    // For now, we'll just refresh periodically
    const interval = setInterval(() => {
      refresh();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [syncAcrossInstances, refresh]);

  return {
    // Storage state
    data,
    loading,
    error,
    
    // Storage actions
    setData,
    removeData,
    refresh,
    
    // Storage utilities
    exists,
    lastUpdated,
    size,
  };
};

// Specialized storage hooks
export const useUserPreferences = () => {
  return useStorage<{
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications: boolean;
    location: boolean;
    analytics: boolean;
  }>('user_preferences', {
    defaultValue: {
      theme: 'system',
      language: 'en',
      notifications: true,
      location: true,
      analytics: true,
    },
  });
};

export const useAuthToken = () => {
  return useStorage<string>('auth_token', {
    encrypted: true,
    defaultValue: null,
  });
};

export const useUserProfile = () => {
  return useStorage<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
  }>('user_profile', {
    defaultValue: null,
    cacheTimeout: 300000, // 5 minutes
  });
};

export const useCartItems = () => {
  return useStorage<Array<{
    id: string;
    restaurantId: string;
    name: string;
    price: number;
    quantity: number;
    options?: any[];
  }>>('cart_items', {
    defaultValue: [],
    syncAcrossInstances: true,
  });
};

export const useRecentSearches = () => {
  const { data, setData, ...rest } = useStorage<string[]>('recent_searches', {
    defaultValue: [],
  });

  const addSearch = useCallback(async (search: string) => {
    const currentSearches = data || [];
    const filteredSearches = currentSearches.filter(s => s !== search);
    const newSearches = [search, ...filteredSearches].slice(0, 10); // Keep only 10 recent searches
    await setData(newSearches);
  }, [data, setData]);

  const clearSearches = useCallback(async () => {
    await setData([]);
  }, [setData]);

  return {
    searches: data || [],
    addSearch,
    clearSearches,
    ...rest,
  };
};

export const useFavoriteRestaurants = () => {
  const { data, setData, ...rest } = useStorage<string[]>('favorite_restaurants', {
    defaultValue: [],
  });

  const addFavorite = useCallback(async (restaurantId: string) => {
    const currentFavorites = data || [];
    if (!currentFavorites.includes(restaurantId)) {
      await setData([...currentFavorites, restaurantId]);
    }
  }, [data, setData]);

  const removeFavorite = useCallback(async (restaurantId: string) => {
    const currentFavorites = data || [];
    await setData(currentFavorites.filter(id => id !== restaurantId));
  }, [data, setData]);

  const isFavorite = useCallback((restaurantId: string): boolean => {
    return (data || []).includes(restaurantId);
  }, [data]);

  return {
    favorites: data || [],
    addFavorite,
    removeFavorite,
    isFavorite,
    ...rest,
  };
};

export const useAppSettings = () => {
  return useStorage<{
    pushNotifications: boolean;
    emailNotifications: boolean;
    smsNotifications: boolean;
    locationTracking: boolean;
    analytics: boolean;
    crashReporting: boolean;
    autoUpdate: boolean;
    dataUsage: 'wifi' | 'cellular' | 'both';
    cacheSize: number;
    offlineMode: boolean;
  }>('app_settings', {
    defaultValue: {
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      locationTracking: true,
      analytics: true,
      crashReporting: true,
      autoUpdate: true,
      dataUsage: 'both',
      cacheSize: 100, // MB
      offlineMode: false,
    },
  });
};

// Storage utilities hook
export const useStorageUtils = () => {
  const getAllKeys = useCallback(async (): Promise<string[]> => {
    try {
      return await storage.current.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }, []);

  const clearAll = useCallback(async (): Promise<void> => {
    try {
      await storage.current.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }, []);

  const getStorageSize = useCallback(async (): Promise<number> => {
    try {
      const keys = await getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await storage.current.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }, [getAllKeys]);

  const exportData = useCallback(async (): Promise<Record<string, any>> => {
    try {
      const keys = await getAllKeys();
      const data: Record<string, any> = {};
      
      for (const key of keys) {
        const value = await storage.current.getItem(key);
        if (value) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value; // Keep as string if not JSON
          }
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error exporting data:', error);
      return {};
    }
  }, [getAllKeys]);

  const importData = useCallback(async (data: Record<string, any>): Promise<void> => {
    try {
      for (const [key, value] of Object.entries(data)) {
        const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
        await storage.current.setItem(key, serializedValue);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }, []);

  return {
    getAllKeys,
    clearAll,
    getStorageSize,
    exportData,
    importData,
  };
};
