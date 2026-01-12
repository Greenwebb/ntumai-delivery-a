
// Enhanced REST API Client with error handling and interceptors
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBaseUrl, API_CONFIG, DEFAULT_HEADERS, ERROR_CODES, HTTP_STATUS } from './config';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, any>;
  meta?: Record<string, any>;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
  timestamp: string;
}

class ApiClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = getBaseUrl();
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: API_CONFIG.DEFAULT_TIMEOUT,
      headers: DEFAULT_HEADERS,
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Add token to headers if available
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }

        // Add timestamp
        config.headers['X-Request-Time'] = new Date().toISOString();

        return config;
      },
      (error) => {
        console.error('[ApiClient] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle token expiration
        if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh token
            const refreshToken = await AsyncStorage.getItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
            
            if (refreshToken) {
              const response = await this.client.post('/auth/refresh', {
                refreshToken,
              });

              if (response.data.success && response.data.data.token) {
                // Update token
                await this.setAuthToken(response.data.data.token);
                
                // Retry original request
                return this.client(originalRequest);
              }
            }
          } catch (refreshError) {
            console.error('[ApiClient] Token refresh failed:', refreshError);
            // Clear auth data on refresh failure
            await this.clearAuthToken();
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authentication token
   */
  async setAuthToken(token: string): Promise<void> {
    this.token = token;
    await AsyncStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEY, token);
  }

  /**
   * Get authentication token
   */
  async getAuthToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);
    }
    return this.token;
  }

  /**
   * Clear authentication token
   */
  async clearAuthToken(): Promise<void> {
    this.token = null;
    await AsyncStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
  }

  /**
   * Make GET request
   */
  async get<T = any>(path: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.get<ApiResponse<T>>(path, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Make POST request
   */
  async post<T = any>(path: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.post<ApiResponse<T>>(path, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Make PUT request
   */
  async put<T = any>(path: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.put<ApiResponse<T>>(path, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Make PATCH request
   */
  async patch<T = any>(path: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.patch<ApiResponse<T>>(path, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Make DELETE request
   */
  async delete<T = any>(path: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.delete<ApiResponse<T>>(path, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): ApiResponse {
    console.error('[ApiClient] Error:', error);

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      return {
        success: false,
        message: data?.message || error.message,
        error: data?.error || this.getErrorCode(status),
        errors: data?.errors,
        data: data?.data,
      };
    } else if (error.request) {
      // Request made but no response
      return {
        success: false,
        message: 'No response from server',
        error: ERROR_CODES.CONNECTION_ERROR,
      };
    } else {
      // Error in request setup
      return {
        success: false,
        message: error.message || 'Unknown error',
        error: ERROR_CODES.NETWORK_ERROR,
      };
    }
  }

  /**
   * Get error code from HTTP status
   */
  private getErrorCode(status: number): string {
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return ERROR_CODES.VALIDATION_ERROR;
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_CODES.UNAUTHORIZED;
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_CODES.UNAUTHORIZED;
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_CODES.NETWORK_ERROR;
      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return ERROR_CODES.RATE_LIMIT_EXCEEDED;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      case HTTP_STATUS.BAD_GATEWAY:
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return ERROR_CODES.SERVER_ERROR;
      default:
        return ERROR_CODES.NETWORK_ERROR;
    }
  }

  /**
   * Update base URL
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
    this.client.defaults.baseURL = url;
  }

  /**
   * Get current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
