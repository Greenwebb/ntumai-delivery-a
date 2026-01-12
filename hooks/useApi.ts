// @ts-nocheck

// Generic API hook
import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient } from '@/src/utils/api';
import { UseApiOptions, AsyncHookResult } from './types';

export interface UseApiResult<T> extends AsyncHookResult<T> {
  execute: (url: string, config?: any) => Promise<T>;
  cancel: () => void;
  reset: () => void;
}

export const useApi = <T = any>(options: UseApiOptions = {}): UseApiResult<T> => {
  const {
    immediate = false,
    onSuccess,
    onError,
    retries = 3,
    retryDelay = 1000,
    timeout = 30000,
    cache = false,
    cacheTimeout = 300000, // 5 minutes
  } = options;

  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const lastRequestRef = useRef<string>('');

  // Cancel current request
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  }, []);

  // Reset state
  const reset = useCallback(() => {
    cancel();
    setData(undefined);
    setError(null);
    cacheRef.current.clear();
  }, [cancel]);

  // Get cached data
  const getCachedData = useCallback((key: string): T | null => {
    if (!cache) return null;
    
    const cached = cacheRef.current.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    if (now - cached.timestamp > cacheTimeout) {
      cacheRef.current.delete(key);
      return null;
    }
    
    return cached.data;
  }, [cache, cacheTimeout]);

  // Set cached data
  const setCachedData = useCallback((key: string, data: T) => {
    if (cache) {
      cacheRef.current.set(key, {
        data,
        timestamp: Date.now(),
      });
    }
  }, [cache]);

  // Execute API request
  const execute = useCallback(async (url: string, config: any = {}): Promise<T> => {
    try {
      // Cancel previous request
      cancel();
      
      // Generate cache key
      const cacheKey = `${url}:${JSON.stringify(config)}`;
      lastRequestRef.current = cacheKey;
      
      // Check cache first
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setError(null);
        return cachedData;
      }
      
      setLoading(true);
      setError(null);
      
      // Create abort controller
      abortControllerRef.current = new AbortController();
      
      // Prepare request config
      const requestConfig = {
        ...config,
        timeout,
        retries,
        retryDelay,
        signal: abortControllerRef.current.signal,
      };
      
      // Make API request
      const response = await apiClient.request<T>(url, requestConfig);
      
      // Check if request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Request cancelled');
      }
      
      if (response.success && response.data !== undefined) {
        const responseData = response.data;
        
        // Only update state if this is still the latest request
        if (lastRequestRef.current === cacheKey) {
          setData(responseData);
          setCachedData(cacheKey, responseData);
          
          // Call success callback
          onSuccess?.(responseData);
        }
        
        return responseData;
      } else {
        throw new Error(response.error || 'API request failed');
      }
    } catch (err: any) {
      // Don't update state if request was cancelled
      if (err.name === 'AbortError' || err.message === 'Request cancelled') {
        return Promise.reject(err);
      }
      
      const error = new Error(err.message || 'API request failed');
      
      // Only update state if this is still the latest request
      if (lastRequestRef.current === `${url}:${JSON.stringify(config)}`) {
        setError(error);
        
        // Call error callback
        onError?.(error);
      }
      
      throw error;
    } finally {
      // Only update loading state if this is still the latest request
      if (lastRequestRef.current === `${url}:${JSON.stringify(config)}`) {
        setLoading(false);
      }
      
      abortControllerRef.current = null;
    }
  }, [cancel, getCachedData, setCachedData, timeout, retries, retryDelay, onSuccess, onError]);

  // Refetch function (re-execute last request)
  const refetch = useCallback(async (): Promise<void> => {
    if (lastRequestRef.current) {
      const [url, configStr] = lastRequestRef.current.split(':');
      const config = configStr ? JSON.parse(configStr) : {};
      await execute(url, config);
    }
  }, [execute]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    data,
    loading,
    error,
    execute,
    refetch,
    cancel,
    reset,
  };
};

// Specialized hooks for different HTTP methods
export const useGet = <T = any>(url?: string, options: UseApiOptions = {}) => {
  const api = useApi<T>(options);
  
  const get = useCallback((requestUrl?: string, config?: any) => {
    const targetUrl = requestUrl || url;
    if (!targetUrl) {
      throw new Error('URL is required');
    }
    return api.execute(targetUrl, { method: 'GET', ...config });
  }, [api.execute, url]);
  
  // Auto-execute if URL is provided and immediate is true
  useEffect(() => {
    if (url && options.immediate) {
      get();
    }
  }, [url, options.immediate, get]);
  
  return {
    ...api,
    get,
  };
};

export const usePost = <T = any>(options: UseApiOptions = {}) => {
  const api = useApi<T>(options);
  
  const post = useCallback((url: string, data?: any, config?: any) => {
    return api.execute(url, { method: 'POST', body: data, ...config });
  }, [api.execute]);
  
  return {
    ...api,
    post,
  };
};

export const usePut = <T = any>(options: UseApiOptions = {}) => {
  const api = useApi<T>(options);
  
  const put = useCallback((url: string, data?: any, config?: any) => {
    return api.execute(url, { method: 'PUT', body: data, ...config });
  }, [api.execute]);
  
  return {
    ...api,
    put,
  };
};

export const usePatch = <T = any>(options: UseApiOptions = {}) => {
  const api = useApi<T>(options);
  
  const patch = useCallback((url: string, data?: any, config?: any) => {
    return api.execute(url, { method: 'PATCH', body: data, ...config });
  }, [api.execute]);
  
  return {
    ...api,
    patch,
  };
};

export const useDelete = <T = any>(options: UseApiOptions = {}) => {
  const api = useApi<T>(options);
  
  const del = useCallback((url: string, config?: any) => {
    return api.execute(url, { method: 'DELETE', ...config });
  }, [api.execute]);
  
  return {
    ...api,
    delete: del,
  };
};

// Hook for handling multiple concurrent requests
export const useApiQueue = <T = any>() => {
  const [requests, setRequests] = useState<Map<string, AsyncHookResult<T>>>(new Map());
  const [globalLoading, setGlobalLoading] = useState(false);
  
  const addRequest = useCallback((key: string, promise: Promise<T>) => {
    setRequests(prev => {
      const newRequests = new Map(prev);
      newRequests.set(key, {
        data: undefined,
        loading: true,
        error: null,
        refetch: async () => {},
      });
      return newRequests;
    });
    
    setGlobalLoading(true);
    
    promise
      .then(data => {
        setRequests(prev => {
          const newRequests = new Map(prev);
          const existing = newRequests.get(key);
          if (existing) {
            newRequests.set(key, {
              ...existing,
              data,
              loading: false,
              error: null,
            });
          }
          return newRequests;
        });
      })
      .catch(error => {
        setRequests(prev => {
          const newRequests = new Map(prev);
          const existing = newRequests.get(key);
          if (existing) {
            newRequests.set(key, {
              ...existing,
              loading: false,
              error,
            });
          }
          return newRequests;
        });
      })
      .finally(() => {
        // Check if all requests are done
        setRequests(prev => {
          const hasLoading = Array.from(prev.values()).some(req => req.loading);
          setGlobalLoading(hasLoading);
          return prev;
        });
      });
  }, []);
  
  const removeRequest = useCallback((key: string) => {
    setRequests(prev => {
      const newRequests = new Map(prev);
      newRequests.delete(key);
      return newRequests;
    });
  }, []);
  
  const clearAll = useCallback(() => {
    setRequests(new Map());
    setGlobalLoading(false);
  }, []);
  
  return {
    requests: Object.fromEntries(requests),
    globalLoading,
    addRequest,
    removeRequest,
    clearAll,
  };
};
