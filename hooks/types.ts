
// Hook types and interfaces
import { DependencyList } from 'react';

// API hook types
export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  cache?: boolean;
  cacheTimeout?: number;
}

export interface UseFetchOptions extends UseApiOptions {
  dependencies?: DependencyList;
  enabled?: boolean;
  refetchOnMount?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}

export interface UseMutationOptions {
  onSuccess?: (data: any, variables: any) => void;
  onError?: (error: any, variables: any) => void;
  onSettled?: (data: any, error: any, variables: any) => void;
  onMutate?: (variables: any) => void;
  retry?: boolean | number;
  retryDelay?: number;
}

export interface UseInfiniteQueryOptions extends UseApiOptions {
  getNextPageParam?: (lastPage: any, pages: any[]) => any;
  getPreviousPageParam?: (firstPage: any, pages: any[]) => any;
  initialPageParam?: any;
  maxPages?: number;
}

// Form hook types
export interface UseFormOptions<T = any> {
  initialValues?: Partial<T>;
  validationSchema?: any;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
  onSubmit?: (values: T) => void | Promise<void>;
  onValidationError?: (errors: Record<string, string>) => void;
}

export interface UseFormValidationOptions {
  rules?: Record<string, any>;
  messages?: Record<string, string>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
  valid: boolean;
}

export interface FormState<T = any> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  dirty: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

// Location hook types
export interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceFilter?: number;
  interval?: number;
  fastestInterval?: number;
  showLocationDialog?: boolean;
  forceRequestLocation?: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface LocationError {
  code: number;
  message: string;
}

// Permission hook types
export interface UsePermissionsOptions {
  permissions: string[];
  requestOnMount?: boolean;
  showRationale?: boolean;
  onGranted?: (permissions: string[]) => void;
  onDenied?: (permissions: string[]) => void;
  onBlocked?: (permissions: string[]) => void;
}

export interface PermissionState {
  granted: string[];
  denied: string[];
  blocked: string[];
  loading: boolean;
  hasRequested: boolean;
}

// Notification hook types
export interface UseNotificationsOptions {
  requestPermissionOnMount?: boolean;
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  onNotificationReceived?: (notification: any) => void;
  onNotificationOpened?: (notification: any) => void;
}

export interface NotificationState {
  permission: 'granted' | 'denied' | 'undetermined';
  token?: string;
  loading: boolean;
}

// Pagination hook types
export interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startIndex: number;
  endIndex: number;
}

// Search hook types
export interface UseSearchOptions<T = any> {
  data?: T[];
  searchFields?: (keyof T)[];
  debounceMs?: number;
  minSearchLength?: number;
  caseSensitive?: boolean;
  exactMatch?: boolean;
  onSearch?: (query: string, results: T[]) => void;
}

export interface SearchState<T = any> {
  query: string;
  results: T[];
  loading: boolean;
  hasSearched: boolean;
}

// Filter hook types
export interface UseFiltersOptions<T = any> {
  data?: T[];
  initialFilters?: Record<string, any>;
  onFiltersChange?: (filters: Record<string, any>, filteredData: T[]) => void;
}

export interface FilterState<T = any> {
  filters: Record<string, any>;
  filteredData: T[];
  activeFilterCount: number;
}

// Sort hook types
export interface UseSortOptions<T = any> {
  data?: T[];
  initialSortBy?: keyof T;
  initialSortOrder?: 'asc' | 'desc';
  onSort?: (sortBy: keyof T, sortOrder: 'asc' | 'desc', sortedData: T[]) => void;
}

export interface SortState<T = any> {
  sortBy?: keyof T;
  sortOrder: 'asc' | 'desc';
  sortedData: T[];
}

// Animation hook types
export interface UseAnimationOptions {
  duration?: number;
  delay?: number;
  easing?: string;
  loop?: boolean;
  autoStart?: boolean;
  onStart?: () => void;
  onComplete?: () => void;
}

export interface AnimationState {
  isAnimating: boolean;
  progress: number;
  value: number;
}

// Storage hook types
export interface UseAsyncStorageOptions<T = any> {
  key: string;
  defaultValue?: T;
  serializer?: {
    stringify: (value: T) => string;
    parse: (value: string) => T;
  };
  onError?: (error: Error) => void;
}

export interface StorageState<T = any> {
  value: T | undefined;
  loading: boolean;
  error: Error | null;
}

// Network hook types
export interface NetworkState {
  isConnected: boolean;
  type: string;
  isWifiEnabled: boolean;
  isInternetReachable: boolean;
  details: any;
}

// Device hook types
export interface DeviceState {
  platform: 'ios' | 'android';
  version: string;
  model: string;
  brand: string;
  isTablet: boolean;
  isEmulator: boolean;
  hasNotch: boolean;
  screenDimensions: {
    width: number;
    height: number;
    scale: number;
    fontScale: number;
  };
}

// Theme hook types
export interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  isDark: boolean;
  colors: Record<string, string>;
  fonts: Record<string, any>;
  spacing: Record<string, number>;
}

// Modal hook types
export interface UseModalOptions {
  initialVisible?: boolean;
  onShow?: () => void;
  onHide?: () => void;
  closeOnBackdrop?: boolean;
  closeOnBackButton?: boolean;
}

export interface ModalState {
  visible: boolean;
  data?: any;
}

// Toast hook types
export interface UseToastOptions {
  position?: 'top' | 'center' | 'bottom';
  duration?: number;
  maxToasts?: number;
}

export interface ToastState {
  toasts: Toast[];
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

// Loading hook types
export interface LoadingState {
  loading: boolean;
  loadingStates: Record<string, boolean>;
}

// Keyboard hook types
export interface KeyboardState {
  keyboardShown: boolean;
  keyboardHeight: number;
}

// Orientation hook types
export interface OrientationState {
  orientation: 'portrait' | 'landscape';
  isPortrait: boolean;
  isLandscape: boolean;
}

// Safe area hook types
export interface SafeAreaState {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

// Counter hook types
export interface UseCounterOptions {
  initialValue?: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface CounterState {
  count: number;
  atMin: boolean;
  atMax: boolean;
}

// Toggle hook types
export interface UseToggleOptions {
  initialValue?: boolean;
  onToggle?: (value: boolean) => void;
}

// Array hook types
export interface UseArrayOptions<T> {
  initialValue?: T[];
  onAdd?: (item: T, array: T[]) => void;
  onRemove?: (item: T, array: T[]) => void;
  onUpdate?: (index: number, item: T, array: T[]) => void;
  onClear?: () => void;
}

// Object hook types
export interface UseObjectOptions<T> {
  initialValue?: T;
  onUpdate?: (key: keyof T, value: any, object: T) => void;
  onReset?: (object: T) => void;
}

// Debounce hook types
export interface UseDebounceOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

// Throttle hook types
export interface UseThrottleOptions {
  delay?: number;
  leading?: boolean;
  trailing?: boolean;
}

// Interval hook types
export interface UseIntervalOptions {
  delay?: number;
  immediate?: boolean;
  onTick?: () => void;
}

// Timeout hook types
export interface UseTimeoutOptions {
  delay?: number;
  onTimeout?: () => void;
}

// Cache hook types
export interface UseCacheOptions<T> {
  key: string;
  ttl?: number;
  maxSize?: number;
  onExpire?: (key: string, value: T) => void;
}

export interface CacheState<T> {
  value: T | undefined;
  loading: boolean;
  expired: boolean;
  lastUpdated?: number;
}

// Geolocation hook types
export interface UseGeolocationOptions extends UseLocationOptions {
  watchPosition?: boolean;
  onLocationChange?: (location: LocationData) => void;
  onError?: (error: LocationError) => void;
}

export interface GeolocationState {
  location: LocationData | null;
  error: LocationError | null;
  loading: boolean;
  watching: boolean;
}

// Delivery tracking hook types
export interface UseDeliveryTrackingOptions {
  orderId?: string;
  updateInterval?: number;
  onStatusChange?: (status: string) => void;
  onLocationUpdate?: (location: LocationData) => void;
}

export interface DeliveryTrackingState {
  status: string;
  driverLocation: LocationData | null;
  estimatedTime: number;
  distance: number;
  loading: boolean;
}

// Payment hook types
export interface UsePaymentOptions {
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

export interface PaymentState {
  processing: boolean;
  result: any;
  error: any;
}

// Generic hook result types
export interface AsyncHookResult<T, E = Error> {
  data: T | undefined;
  loading: boolean;
  error: E | null;
  refetch: () => Promise<void>;
}

export interface MutationResult<T, V = any, E = Error> {
  data: T | undefined;
  loading: boolean;
  error: E | null;
  mutate: (variables: V) => Promise<T>;
  reset: () => void;
}

export interface InfiniteQueryResult<T, E = Error> {
  data: T[];
  loading: boolean;
  error: E | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  fetchNextPage: () => Promise<void>;
  fetchPreviousPage: () => Promise<void>;
  refetch: () => Promise<void>;
}
