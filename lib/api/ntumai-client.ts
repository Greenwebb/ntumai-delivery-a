import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS, getBaseUrl, DEFAULT_HEADERS, HTTP_STATUS, ERROR_CODES } from '@/config/api-keys';

// Fallback config if not found in api-keys
const DEFAULT_API_CONFIG = {
  baseUrl: getBaseUrl?.() || 'http://localhost:3000',
  timeout: 30000,
};

/**
 * API Response type
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

/**
 * Request options
 */
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: Record<string, unknown>;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  timeout?: number;
  requiresAuth?: boolean;
}

/**
 * Token storage keys
 */
const TOKEN_KEY = API_CONFIG.TOKEN_STORAGE_KEY;
const REFRESH_TOKEN_KEY = API_CONFIG.REFRESH_TOKEN_STORAGE_KEY;

/**
 * Ntumai API Client
 * Handles all API requests to the Ntumai backend
 */
class NtumaiClient {
  private baseUrl: string;
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.baseUrl = getBaseUrl();
    this.loadTokens();
  }

  /**
   * Load tokens from storage
   */
  private async loadTokens() {
    try {
      this.authToken = await AsyncStorage.getItem(TOKEN_KEY);
      this.refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Failed to load tokens:', error);
    }
  }

  /**
   * Save tokens to storage
   */
  async saveTokens(authToken: string, refreshToken?: string) {
    try {
      this.authToken = authToken;
      await AsyncStorage.setItem(TOKEN_KEY, authToken);
      
      if (refreshToken) {
        this.refreshToken = refreshToken;
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      }
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  }

  /**
   * Clear tokens (logout)
   */
  async clearTokens() {
    try {
      this.authToken = null;
      this.refreshToken = null;
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  /**
   * Build URL with path parameters and query string
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    let url = `${this.baseUrl}${endpoint}`;
    
    // Replace path parameters (e.g., :id)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (url.includes(`:${key}`)) {
          url = url.replace(`:${key}`, String(value));
          delete params[key];
        }
      });
      
      // Add remaining params as query string
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    return url;
  }

  /**
   * Make an API request
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      body,
      params,
      headers = {},
      timeout = API_CONFIG.DEFAULT_TIMEOUT,
      requiresAuth = true,
    } = options;

    const url = this.buildUrl(endpoint, params);
    
    // Build headers
    const requestHeaders: Record<string, string> = {
      ...DEFAULT_HEADERS,
      ...headers,
    };

    // Add auth token if required
    if (requiresAuth && this.authToken) {
      requestHeaders['Authorization'] = `Bearer ${this.authToken}`;
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const responseData = await response.json().catch(() => ({}));

      // Handle different status codes
      if (response.ok) {
        return {
          success: true,
          data: responseData.data || responseData,
          meta: responseData.meta,
        };
      }

      // Handle 401 - try to refresh token
      if (response.status === HTTP_STATUS.UNAUTHORIZED && this.refreshToken) {
        const refreshed = await this.refreshAuthToken();
        if (refreshed) {
          // Retry the request with new token
          return this.request<T>(endpoint, options);
        }
      }

      // Return error response
      return {
        success: false,
        error: {
          code: responseData.error?.code || this.getErrorCodeFromStatus(response.status),
          message: responseData.error?.message || responseData.message || 'An error occurred',
          details: responseData.error?.details,
        },
      };
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle network/timeout errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: {
              code: ERROR_CODES.TIMEOUT_ERROR,
              message: 'Request timed out. Please try again.',
            },
          };
        }
      }

      return {
        success: false,
        error: {
          code: ERROR_CODES.NETWORK_ERROR,
          message: 'Network error. Please check your connection.',
        },
      };
    }
  }

  /**
   * Refresh auth token
   */
  private async refreshAuthToken(): Promise<boolean> {
    if (this.isRefreshing) {
      // Wait for the current refresh to complete
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token: string) => {
          this.authToken = token;
          resolve(true);
        });
      });
    }

    this.isRefreshing = true;

    try {
      // Note: Ntumai API uses OTP-based auth, so refresh might not be applicable
      // This is a placeholder for when refresh token endpoint is available
      const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        await this.saveTokens(data.accessToken, data.refreshToken);
        
        // Notify subscribers
        this.refreshSubscribers.forEach((callback) => callback(data.accessToken));
        this.refreshSubscribers = [];
        
        return true;
      }

      // Refresh failed - clear tokens
      await this.clearTokens();
      return false;
    } catch (error) {
      await this.clearTokens();
      return false;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Get error code from HTTP status
   */
  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return ERROR_CODES.VALIDATION_ERROR;
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_CODES.UNAUTHORIZED;
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_CODES.UNAUTHORIZED;
      case HTTP_STATUS.NOT_FOUND:
        return 'NOT_FOUND';
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return ERROR_CODES.RATE_LIMIT_EXCEEDED;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      case HTTP_STATUS.BAD_GATEWAY:
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
      case HTTP_STATUS.GATEWAY_TIMEOUT:
        return ERROR_CODES.SERVER_ERROR;
      default:
        return 'UNKNOWN_ERROR';
    }
  }

  // ============================================
  // Authentication API
  // ============================================

  /**
   * Request OTP for phone number
   */
  async requestOtp(phoneNumber: string) {
    return this.request<{ message: string }>(ENDPOINTS.AUTH.REQUEST_OTP, {
      method: 'POST',
      body: { phoneNumber },
      requiresAuth: false,
    });
  }

  /**
   * Verify OTP code
   */
  async verifyOtp(phoneNumber: string, otpCode: string) {
    const response = await this.request<{
      accessToken: string;
      refreshToken?: string;
      user: {
        id: string;
        phoneNumber: string;
        name?: string;
        role?: string;
      };
    }>(ENDPOINTS.AUTH.VERIFY_OTP, {
      method: 'POST',
      body: { phoneNumber, otpCode },
      requiresAuth: false,
    });

    // Save tokens on successful verification
    if (response.success && response.data?.accessToken) {
      await this.saveTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    return this.request<{
      id: string;
      phoneNumber: string;
      name?: string;
      email?: string;
      role?: string;
      avatar?: string;
    }>(ENDPOINTS.AUTH.ME);
  }

  /**
   * Update user profile
   */
  async updateProfile(data: { name?: string; email?: string; avatar?: string }) {
    return this.request(ENDPOINTS.AUTH.UPDATE_PROFILE, {
      method: 'PUT',
      body: data,
    });
  }

  // ============================================
  // Marketplace API
  // ============================================

  /**
   * Search products
   */
  async searchProducts(query: string, filters?: {
    categoryId?: string;
    storeId?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    page?: number;
    limit?: number;
  }) {
    return this.request<{
      products: Array<{
        id: string;
        name: string;
        description: string;
        price: number;
        images: string[];
        category: { id: string; name: string };
        store: { id: string; name: string };
        inStock: boolean;
        rating?: number;
      }>;
    }>(ENDPOINTS.MARKETPLACE.SEARCH_PRODUCTS, {
      params: { query, ...filters },
    });
  }

  /**
   * Get product details
   */
  async getProduct(productId: string) {
    return this.request(ENDPOINTS.MARKETPLACE.GET_PRODUCT, {
      params: { productId },
    });
  }

  /**
   * Get categories
   */
  async getCategories() {
    return this.request<{
      categories: Array<{
        id: string;
        name: string;
        icon?: string;
        productCount: number;
      }>;
    }>(ENDPOINTS.MARKETPLACE.GET_CATEGORIES);
  }

  /**
   * Get stores
   */
  async getStores(params?: { page?: number; limit?: number; lat?: number; lng?: number }) {
    return this.request(ENDPOINTS.MARKETPLACE.GET_STORES, { params });
  }

  /**
   * Get cart
   */
  async getCart() {
    return this.request(ENDPOINTS.MARKETPLACE.GET_CART);
  }

  /**
   * Add item to cart
   */
  async addToCart(productId: string, quantity: number) {
    return this.request(ENDPOINTS.MARKETPLACE.ADD_TO_CART, {
      method: 'POST',
      body: { productId, quantity },
    });
  }

  /**
   * Create order
   */
  async createOrder(data: {
    deliveryAddress: string;
    paymentMethodId: string;
    notes?: string;
  }) {
    return this.request(ENDPOINTS.MARKETPLACE.CREATE_ORDER, {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Get orders
   */
  async getOrders(params?: { page?: number; limit?: number; status?: string }) {
    return this.request(ENDPOINTS.MARKETPLACE.GET_ORDERS, { params });
  }

  // ============================================
  // Delivery API
  // ============================================

  /**
   * Create delivery request
   */
  async createDelivery(data: {
    pickupAddress: string;
    pickupLat: number;
    pickupLng: number;
    dropoffAddress: string;
    dropoffLat: number;
    dropoffLng: number;
    packageDetails: {
      description: string;
      weight?: number;
      dimensions?: string;
    };
    recipientName: string;
    recipientPhone: string;
  }) {
    return this.request(ENDPOINTS.DELIVERIES.CREATE, {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Get delivery details
   */
  async getDelivery(deliveryId: string) {
    return this.request(ENDPOINTS.DELIVERIES.GET, {
      params: { id: deliveryId },
    });
  }

  /**
   * Get delivery config (vehicle types, limits, etc.)
   */
  async getDeliveryConfig() {
    const [vehicleTypes, limits, paymentMethods] = await Promise.all([
      this.request(ENDPOINTS.DELIVERIES.CONFIG_VEHICLE_TYPES),
      this.request(ENDPOINTS.DELIVERIES.CONFIG_LIMITS),
      this.request(ENDPOINTS.DELIVERIES.CONFIG_PAYMENT_METHODS),
    ]);

    return {
      vehicleTypes: vehicleTypes.data,
      limits: limits.data,
      paymentMethods: paymentMethods.data,
    };
  }

  // ============================================
  // Tracking API
  // ============================================

  /**
   * Get delivery tracking timeline
   */
  async getDeliveryTracking(deliveryId: string) {
    return this.request(ENDPOINTS.TRACKING.GET_DELIVERY_TIMELINE, {
      params: { deliveryId },
    });
  }

  /**
   * Get booking tracking timeline
   */
  async getBookingTracking(bookingId: string) {
    return this.request(ENDPOINTS.TRACKING.GET_BOOKING_TIMELINE, {
      params: { bookingId },
    });
  }

  /**
   * Get live location for booking
   */
  async getBookingLocation(bookingId: string) {
    return this.request(ENDPOINTS.TRACKING.GET_BOOKING_LOCATION, {
      params: { bookingId },
    });
  }

  // ============================================
  // Tasker/Rider API
  // ============================================

  /**
   * Get nearby deliveries (for riders)
   */
  async getNearbyDeliveries(lat: number, lng: number, radius?: number) {
    const params: Record<string, string | number | boolean> = { lat, lng };
    if (radius !== undefined) {
      params.radius = radius;
    }
    return this.request(ENDPOINTS.RIDER_DELIVERIES.GET_NEARBY, { params });
  }

  /**
   * Accept a delivery (for riders)
   */
  async acceptDelivery(deliveryId: string) {
    return this.request(ENDPOINTS.RIDER_DELIVERIES.ACCEPT, {
      method: 'POST',
      params: { id: deliveryId },
    });
  }

  /**
   * Start a shift
   */
  async startShift(data: { lat: number; lng: number; vehicleType?: string }) {
    return this.request(ENDPOINTS.SHIFTS.START, {
      method: 'POST',
      body: data,
    });
  }

  /**
   * End current shift
   */
  async endShift(shiftId: string) {
    return this.request(ENDPOINTS.SHIFTS.END, {
      method: 'POST',
      params: { shiftId },
    });
  }

  /**
   * Update location during shift
   */
  async updateShiftLocation(shiftId: string, lat: number, lng: number) {
    return this.request(ENDPOINTS.SHIFTS.UPDATE_LOCATION, {
      method: 'PUT',
      params: { shiftId },
      body: { lat, lng },
    });
  }

  /**
   * Get shift performance analytics
   */
  async getShiftPerformance() {
    return this.request(ENDPOINTS.SHIFTS.GET_PERFORMANCE);
  }

  // ============================================
  // Matching/Booking API (for errands)
  // ============================================

  /**
   * Create a booking (errand request)
   */
  async createBooking(data: {
    type: string;
    description: string;
    location: { lat: number; lng: number; address: string };
    budget?: number;
    scheduledAt?: string;
  }) {
    return this.request(ENDPOINTS.MATCHING.CREATE_BOOKING, {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Get booking details
   */
  async getBooking(bookingId: string) {
    return this.request(ENDPOINTS.MATCHING.GET_BOOKING, {
      params: { bookingId },
    });
  }

  /**
   * Respond to a booking offer (for taskers)
   */
  async respondToBookingOffer(bookingId: string, accept: boolean) {
    return this.request(ENDPOINTS.MATCHING.RESPOND_TO_OFFER, {
      method: 'POST',
      params: { bookingId },
      body: { accept },
    });
  }
}

// Export singleton instance
export const ntumaiClient = new NtumaiClient();
export default ntumaiClient;
