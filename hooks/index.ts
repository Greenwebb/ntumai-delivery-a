// @ts-nocheck

// Custom React hooks exports

// Authentication hooks
export { useAuth } from './useAuth';
export { useAuthState } from './useAuthState';
export { useLogin } from './useLogin';
export { useLogout } from './useLogout';
export { useRegister } from './useRegister';

// API hooks
export { useApi } from './useApi';
export { useFetch } from './useFetch';
export { useMutation } from './useMutation';
export { useInfiniteQuery } from './useInfiniteQuery';
export { useUpload } from './useUpload';

// State management hooks
export { useStore } from './useStore';
export { useCart } from './useCart';
export { useUser } from './useUser';
export { useOrders } from './useOrders';
export { useDriver } from './useDriver';
export { useVendor } from './useVendor';

// UI hooks
export { useTheme } from './useTheme';
export { useModal } from './useModal';
export { useToast } from './useToast';
export { useLoading } from './useLoading';
export { useKeyboard } from './useKeyboard';
export { useOrientation } from './useOrientation';
export { useSafeArea } from './useSafeArea';

// Form hooks
export { useForm } from './useForm';
export { useFormValidation } from './useFormValidation';
export { useInput } from './useInput';
export { useDebounce } from './useDebounce';
export { useThrottle } from './useThrottle';

// Navigation hooks
export { useNavigation } from './useNavigation';
export { useRoute } from './useRoute';
export { useNavigationState } from './useNavigationState';
export { useBackHandler } from './useBackHandler';

// Device hooks
export { useDevice } from './useDevice';
export { useNetworkStatus } from './useNetworkStatus';
export { usePermissions } from './usePermissions';
export { useLocation } from './useLocation';
export { useCamera } from './useCamera';
export { useBiometrics } from './useBiometrics';

// Storage hooks
export { useAsyncStorage } from './useAsyncStorage';
export { useSecureStorage } from './useSecureStorage';
export { usePersistentState } from './usePersistentState';
export { useCache } from './useCache';

// Utility hooks
export { useInterval } from './useInterval';
export { useTimeout } from './useTimeout';
export { usePrevious } from './usePrevious';
export { useToggle } from './useToggle';
export { useCounter } from './useCounter';
export { useArray } from './useArray';
export { useObject } from './useObject';
export { useLocalStorage } from './useLocalStorage';
export { useClipboard } from './useClipboard';

// Business logic hooks
export { useSearch } from './useSearch';
export { useFilters } from './useFilters';
export { usePagination } from './usePagination';
export { useSort } from './useSort';
export { useGeolocation } from './useGeolocation';
export { useDeliveryTracking } from './useDeliveryTracking';
export { usePayment } from './usePayment';
export { useNotifications } from './useNotifications';

// Performance hooks
export { useMemoizedCallback } from './useMemoizedCallback';
export { useOptimizedState } from './useOptimizedState';
export { useLazyLoad } from './useLazyLoad';
export { useVirtualization } from './useVirtualization';

// Animation hooks
export { useAnimation } from './useAnimation';
export { useSpring } from './useSpring';
export { useFadeIn } from './useFadeIn';
export { useSlideIn } from './useSlideIn';

// Types
export type {
  UseApiOptions,
  UseFetchOptions,
  UseMutationOptions,
  UseInfiniteQueryOptions,
  UseFormOptions,
  UseFormValidationOptions,
  UseLocationOptions,
  UsePermissionsOptions,
  UseNotificationsOptions,
  UsePaginationOptions,
  UseSearchOptions,
  UseFiltersOptions,
  UseSortOptions,
} from './types';
