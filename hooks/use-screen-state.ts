
import { useState, useCallback } from 'react';

export interface ScreenState<T = any> {
  isLoading: boolean;
  isEmpty: boolean;
  error: Error | null;
  data: T | null;
}

export interface UseScreenStateReturn<T = any> extends ScreenState<T> {
  setLoading: () => void;
  setSuccess: (data: T) => void;
  setError: (error: Error | string) => void;
  retry: () => void;
  reset: () => void;
}

/**
 * Hook for managing screen states (loading, empty, error, success)
 * 
 * Provides a consistent pattern for handling all screen states:
 * - Loading: Data is being fetched
 * - Empty: Data fetched successfully but no results
 * - Error: Data fetch failed
 * - Success: Data fetched successfully with results
 * 
 * Usage:
 * ```tsx
 * const { isLoading, isEmpty, error, data, setLoading, setSuccess, setError, retry } = useScreenState();
 * 
 * const fetchData = async () => {
 *   setLoading();
 *   try {
 *     const result = await api.getData();
 *     setSuccess(result);
 *   } catch (err) {
 *     setError(err);
 *   }
 * };
 * 
 * if (isLoading) return <Skeleton />;
 * if (error) return <ErrorState error={error} onRetry={retry} />;
 * if (isEmpty) return <EmptyState />;
 * return <DataView data={data} />;
 * ```
 */
export function useScreenState<T = any>(
  onRetry?: () => void | Promise<void>
): UseScreenStateReturn<T> {
  const [state, setState] = useState<ScreenState<T>>({
    isLoading: false,
    isEmpty: false,
    error: null,
    data: null,
  });

  const setLoading = useCallback(() => {
    setState({
      isLoading: true,
      isEmpty: false,
      error: null,
      data: null,
    });
  }, []);

  const setSuccess = useCallback((data: T) => {
    const isEmpty = Array.isArray(data) ? data.length === 0 : !data;
    setState({
      isLoading: false,
      isEmpty,
      error: null,
      data,
    });
  }, []);

  const setError = useCallback((error: Error | string) => {
    setState({
      isLoading: false,
      isEmpty: false,
      error: typeof error === 'string' ? new Error(error) : error,
      data: null,
    });
  }, []);

  const retry = useCallback(() => {
    if (onRetry) {
      onRetry();
    }
  }, [onRetry]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isEmpty: false,
      error: null,
      data: null,
    });
  }, []);

  return {
    ...state,
    setLoading,
    setSuccess,
    setError,
    retry,
    reset,
  };
}
