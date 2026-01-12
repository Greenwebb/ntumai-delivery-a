
// API configuration with Socket.io integration

// Environment configuration
export const API_CONFIG = {
  // Base URLs for different environments
  BASE_URL: {
    development: 'https://api.ntumai.com/api/v1',
    staging: 'https://staging-api.ntumai.com/api/v1',
    production: 'https://api.ntumai.com/api/v1',
  },
  
  // WebSocket URLs for Socket.io
  WS_URL: {
    development: 'https://api.ntumai.com',
    staging: 'https://staging-api.ntumai.com',
    production: 'https://api.ntumai.com',
  },
  
  // Default request configuration
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  DEFAULT_RETRIES: 3,
  DEFAULT_CACHE_TIMEOUT: 300000, // 5 minutes
  
  // Request limits
  MAX_REQUEST_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_CONCURRENT_REQUESTS: 10,
  
  // Authentication
  TOKEN_STORAGE_KEY: 'auth_token',
  REFRESH_TOKEN_STORAGE_KEY: 'refresh_token',
  TOKEN_REFRESH_THRESHOLD: 300000, // 5 minutes before expiry
  
  // Cache configuration
  CACHE_PREFIX: 'ntumai_api_',
  CACHE_VERSION: '1.0',
  
  // Rate limiting
  RATE_LIMIT: {
    requests: 100,
    window: 60000, // 1 minute
  },
  
  // File upload
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    CHUNK_SIZE: 1024 * 1024, // 1MB chunks
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
  
  // Location
  LOCATION: {
    DEFAULT_RADIUS: 5000, // 5km
    MAX_RADIUS: 50000, // 50km
  },
  
  // Search
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    DEBOUNCE_DELAY: 300, // ms
    MAX_SUGGESTIONS: 10,
  },
  
  // Socket.io configuration
  SOCKET_IO: {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
    autoConnect: false,
  },
};

// Get current environment
export const getCurrentEnvironment = (): 'development' | 'staging' | 'production' => {
  if (__DEV__) {
    return 'development';
  }
  
  // You can add more sophisticated environment detection here
  // For example, checking bundle identifier or build configuration
  return 'production';
};

// Get base URL for current environment
export const getBaseUrl = (): string => {
  const env = getCurrentEnvironment();
  return API_CONFIG.BASE_URL[env];
};

// Get WebSocket URL for current environment
export const getWebSocketUrl = (): string => {
  const env = getCurrentEnvironment();
  return API_CONFIG.WS_URL[env];
};

// API endpoints configuration
export const ENDPOINTS = {
  // Authentication
  AUTH: {
    REQUEST_OTP: '/auth/otp/start',  // Alias for SEND_OTP
    SEND_OTP: '/auth/otp/start',
    VERIFY_OTP: '/auth/otp/verify',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/profile',
    DELETE_ACCOUNT: '/auth/delete-account',
    CHECK_EMAIL: '/auth/check-email',
    CHECK_USERNAME: '/auth/check-username',
    SESSIONS: '/auth/sessions',
    REVOKE_ALL_SESSIONS: '/auth/revoke-all-sessions',
    ENABLE_2FA: '/auth/2fa/enable',
    VERIFY_2FA: '/auth/2fa/verify',
    DISABLE_2FA: '/auth/2fa/disable',
    GENERATE_BACKUP_CODES: '/auth/2fa/backup-codes',
    SOCIAL_LOGIN: '/auth/social',
    LINK_SOCIAL: '/auth/social/link',
    UNLINK_SOCIAL: '/auth/social/unlink',
    LINKED_ACCOUNTS: '/auth/social/accounts',
    REQUEST_VERIFICATION: '/auth/request-verification',
    UPLOAD_PROFILE_PICTURE: '/auth/profile/picture',
    REMOVE_PROFILE_PICTURE: '/auth/profile/picture',
    PREFERENCES: '/auth/preferences',
  },
  
  // User management
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
    UPLOAD_AVATAR: '/user/avatar',
    ADDRESSES: '/user/addresses',
    PREFERENCES: '/user/preferences',
    DELETE_ACCOUNT: '/user/delete',
  },
  
  // Restaurants
  RESTAURANTS: {
    LIST: '/restaurants',
    DETAIL: '/restaurants/:id',
    SEARCH: '/restaurants/search',
    NEARBY: '/restaurants/nearby',
    FEATURED: '/restaurants/featured',
    CATEGORIES: '/restaurants/categories',
    REVIEWS: '/restaurants/:id/reviews',
  },
  
  // Menu
  MENU: {
    RESTAURANT_MENU: '/restaurants/:restaurantId/menu',
    CATEGORIES: '/restaurants/:restaurantId/menu/categories',
    ITEMS: '/restaurants/:restaurantId/menu/items',
    ITEM_DETAIL: '/restaurants/:restaurantId/menu/items/:itemId',
    SEARCH: '/restaurants/:restaurantId/menu/search',
  },
  
  // Orders
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders',
    DETAIL: '/orders/:id',
    UPDATE: '/orders/:id',
    CANCEL: '/orders/:id/cancel',
    TRACK: '/orders/:id/track',
    HISTORY: '/orders/history',
    REORDER: '/orders/:id/reorder',
  },
  
  // Payments
  PAYMENTS: {
    METHODS: '/payments/methods',
    ADD_METHOD: '/payments/methods',
    UPDATE_METHOD: '/payments/methods/:id',
    DELETE_METHOD: '/payments/methods/:id',
    CREATE_INTENT: '/payments/create-intent',
    CONFIRM_PAYMENT: '/payments/confirm',
    REFUND: '/payments/:id/refund',
  },
  
  // Delivery
  DELIVERY: {
    ESTIMATE: '/delivery/estimate',
    TRACK: '/delivery/track/:orderId',
    DRIVERS: '/delivery/drivers/nearby',
    ZONES: '/delivery/zones',
  },
  
  // Reviews
  REVIEWS: {
    LIST: '/reviews',
    CREATE: '/reviews',
    UPDATE: '/reviews/:id',
    DELETE: '/reviews/:id',
    RESTAURANT_REVIEWS: '/restaurants/:restaurantId/reviews',
    USER_REVIEWS: '/users/:userId/reviews',
  },
  
  // Search
  SEARCH: {
    GLOBAL: '/search',
    RESTAURANTS: '/search/restaurants',
    MENU_ITEMS: '/search/menu-items',
    SUGGESTIONS: '/search/suggestions',
    AUTOCOMPLETE: '/search/autocomplete',
  },
  
  // Location
  LOCATION: {
    GEOCODE: '/location/geocode',
    REVERSE_GEOCODE: '/location/reverse-geocode',
    SEARCH: '/location/search',
    VALIDATE_ADDRESS: '/location/validate',
  },
  
  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: '/notifications/:id/read',
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: '/notifications/:id',
    SETTINGS: '/notifications/settings',
    REGISTER_DEVICE: '/notifications/register-device',
  },
  
  // Analytics
  ANALYTICS: {
    TRACK_EVENT: '/analytics/track',
    BATCH_EVENTS: '/analytics/batch',
  },
  
  // File upload
  UPLOAD: {
    IMAGE: '/upload/image',
    DOCUMENT: '/upload/document',
    AVATAR: '/upload/avatar',
  },
  
  // System
  SYSTEM: {
    HEALTH: '/health',
    VERSION: '/version',
    CONFIG: '/config',
  },
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// Error codes
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  UNAUTHORIZED: 'UNAUTHORIZED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Business logic errors
  RESTAURANT_CLOSED: 'RESTAURANT_CLOSED',
  ITEM_UNAVAILABLE: 'ITEM_UNAVAILABLE',
  MINIMUM_ORDER_NOT_MET: 'MINIMUM_ORDER_NOT_MET',
  DELIVERY_UNAVAILABLE: 'DELIVERY_UNAVAILABLE',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  
  // System errors
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

// Request headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Client-Version': '1.0.0',
  'X-Platform': 'mobile',
};

// Cache keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  RESTAURANTS: 'restaurants',
  MENU: 'menu',
  ORDERS: 'orders',
  PAYMENT_METHODS: 'payment_methods',
  NOTIFICATIONS: 'notifications',
  SEARCH_RESULTS: 'search_results',
  LOCATION_RESULTS: 'location_results',
};

// WebSocket events
export const WS_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  
  // Order tracking
  ORDER_STATUS_UPDATE: 'order_status_update',
  DRIVER_LOCATION_UPDATE: 'driver_location_update',
  
  // Notifications
  NEW_NOTIFICATION: 'new_notification',
  
  // Real-time updates
  RESTAURANT_STATUS_UPDATE: 'restaurant_status_update',
  MENU_UPDATE: 'menu_update',
  
  // Chat
  MESSAGE_RECEIVED: 'message_received',
  TYPING_INDICATOR: 'typing_indicator',
  
  // Job assignments (for taskers)
  JOB_OFFER: 'job_offer',
  JOB_ACCEPTED: 'job_accepted',
  JOB_REJECTED: 'job_rejected',
  JOB_COMPLETED: 'job_completed',
  
  // Location updates
  LOCATION_UPDATE: 'location_update',
};

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_CACHING: true,
  ENABLE_OFFLINE_MODE: true,
  ENABLE_ANALYTICS: true,
  ENABLE_CRASH_REPORTING: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_LOCATION_TRACKING: true,
  ENABLE_BIOMETRIC_AUTH: true,
  ENABLE_DARK_MODE: false,
  ENABLE_REAL_TIME_TRACKING: true,
  ENABLE_VOICE_SEARCH: false,
  ENABLE_AR_MENU: false,
};
