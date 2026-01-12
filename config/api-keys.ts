/**
 * Third-Party API Keys Configuration
 * 
 * Centralized location for all third-party service API keys.
 * DO NOT commit sensitive keys to public repositories.
 */

export const API_KEYS = {
  /**
   * Google Maps API Key
   * Used for: Maps display, geocoding, directions
   */
  GOOGLE_MAPS: 'AIzaSyDw59gPssVHEg1TcHoC9at1KDF98yVnQe4',

  /**
   * Add other third-party API keys here as needed:
   * - Payment gateways (Stripe, PayPal, etc.)
   * - Analytics (Google Analytics, Mixpanel, etc.)
   * - Push notifications (Firebase, OneSignal, etc.)
   * - SMS services (Twilio, etc.)
   */
} as const;

/**
 * Helper function to get API key by service name
 */
export const getApiKey = (service: keyof typeof API_KEYS): string => {
  return API_KEYS[service];
};

/**
 * API Configuration
 */
export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 30000,
  TOKEN_STORAGE_KEY: 'auth_token',
  REFRESH_TOKEN_STORAGE_KEY: 'refresh_token',
  DEFAULT_TIMEOUT: 30000,
  TIMEOUT_ERROR: 'REQUEST_TIMEOUT',
};

export const ENDPOINTS = {
  auth: '/api/auth',
  users: '/api/users',
  orders: '/api/orders',
  vendors: '/api/vendors',
};

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  TIMEOUT_ERROR: 'REQUEST_TIMEOUT',
};

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  INVALID_REQUEST: 'INVALID_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
};

export const getBaseUrl = () => API_CONFIG.baseUrl;

/**
 * Storage Keys
 */
export const STORAGE_KEYS = {
  TOKEN_STORAGE_KEY: 'auth_token',
  REFRESH_TOKEN_STORAGE_KEY: 'refresh_token',
  DEFAULT_TIMEOUT: 30000,
  TIMEOUT_ERROR: 'REQUEST_TIMEOUT',
};
