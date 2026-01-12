// Application constants

// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ ? 'https://api.ntumai.com/api' : 'https://api.ntumai.com',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Authentication
export const AUTH_CONFIG = {
  TOKEN_KEY: '@ntumai_auth_token',
  REFRESH_TOKEN_KEY: '@ntumai_refresh_token',
  USER_KEY: '@ntumai_user',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes in milliseconds
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  // User preferences
  THEME: '@ntumai_theme',
  LANGUAGE: '@ntumai_language',
  NOTIFICATIONS: '@ntumai_notifications',
  LOCATION_PERMISSION: '@ntumai_location_permission',
  
  // App state
  ONBOARDING_COMPLETED: '@ntumai_onboarding_completed',
  FIRST_LAUNCH: '@ntumai_first_launch',
  APP_VERSION: '@ntumai_app_version',
  
  // Cart and orders
  CART: '@ntumai_cart',
  RECENT_ORDERS: '@ntumai_recent_orders',
  FAVORITE_VENDORS: '@ntumai_favorite_vendors',
  FAVORITE_PRODUCTS: '@ntumai_favorite_products',
  
  // Tasker specific (renamed from Driver)
  TASKER_STATUS: '@ntumai_tasker_status',
  TASKER_LOCATION: '@ntumai_tasker_location',
  TASKER_STATS: '@ntumai_tasker_stats',
  
  // Vendor specific
  VENDOR_PROFILE: '@ntumai_vendor_profile',
  VENDOR_STATS: '@ntumai_vendor_stats',
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'NTUMAI',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  BUNDLE_ID: 'com.ntumai.app',
  DEEP_LINK_SCHEME: 'ntumai',
  SUPPORT_EMAIL: 'support@ntumai.com',
  PRIVACY_POLICY_URL: 'https://ntumai.com/privacy',
  TERMS_OF_SERVICE_URL: 'https://ntumai.com/terms',
} as const;

// UI Constants
export const UI_CONSTANTS = {
  // Spacing
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
  },
  
  // Border radius
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
    XL: 16,
    ROUND: 50,
  },
  
  // Font sizes
  FONT_SIZES: {
    XS: 12,
    SM: 14,
    MD: 16,
    LG: 18,
    XL: 20,
    XXL: 24,
    XXXL: 32,
  },
  
  // Animation durations
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  
  // Screen dimensions
  SCREEN: {
    HEADER_HEIGHT: 60,
    TAB_BAR_HEIGHT: 80,
    STATUS_BAR_HEIGHT: 44,
  },
} as const;

// Business Logic Constants
export const BUSINESS_CONSTANTS = {
  // Order limits
  MIN_ORDER_AMOUNT: 10,
  MAX_ORDER_AMOUNT: 500,
  MAX_ITEMS_PER_ORDER: 50,
  
  // Delivery
  DEFAULT_DELIVERY_RADIUS: 10, // km
  MAX_DELIVERY_RADIUS: 25, // km
  DELIVERY_FEE_BASE: 2.99,
  DELIVERY_FEE_PER_KM: 0.5,
  FREE_DELIVERY_THRESHOLD: 25,
  
  // Timing
  ORDER_PREPARATION_TIME: 15, // minutes
  AVERAGE_DELIVERY_TIME: 30, // minutes
  MAX_DELIVERY_TIME: 60, // minutes
  
  // Ratings
  MIN_RATING: 1,
  MAX_RATING: 5,
  MIN_REVIEWS_FOR_DISPLAY: 5,
  
  // Commission
  PLATFORM_COMMISSION_RATE: 0.15, // 15%
  PAYMENT_PROCESSING_FEE: 0.029, // 2.9%
  
  // Tasker (renamed from Driver)
  TASKER_COMMISSION_RATE: 0.8, // 80% of delivery fee
  MIN_TASKER_RATING: 4.0,
  MAX_ACTIVE_ORDERS_PER_TASKER: 3,
} as const;

// Validation Constants
export const VALIDATION_CONSTANTS = {
  // Password
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SPECIAL_CHARS: true,
  
  // Name
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  
  // Phone
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
  
  // Address
  ADDRESS_MIN_LENGTH: 10,
  ADDRESS_MAX_LENGTH: 200,
  
  // Product
  PRODUCT_NAME_MIN_LENGTH: 3,
  PRODUCT_NAME_MAX_LENGTH: 100,
  PRODUCT_DESCRIPTION_MAX_LENGTH: 500,
  PRODUCT_PRICE_MIN: 0.01,
  PRODUCT_PRICE_MAX: 999.99,
  
  // Review
  REVIEW_MIN_LENGTH: 10,
  REVIEW_MAX_LENGTH: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Network
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Account temporarily locked due to multiple failed login attempts.',
  TOKEN_EXPIRED: 'Session expired. Please log in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  
  // Validation
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  WEAK_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  
  // Location
  LOCATION_PERMISSION_DENIED: 'Location permission is required for delivery.',
  LOCATION_UNAVAILABLE: 'Unable to get your current location.',
  OUTSIDE_DELIVERY_AREA: 'Sorry, we don\'t deliver to this location yet.',
  
  // Orders
  CART_EMPTY: 'Your cart is empty.',
  MIN_ORDER_NOT_MET: 'Minimum order amount not met.',
  ITEM_OUT_OF_STOCK: 'This item is currently out of stock.',
  VENDOR_CLOSED: 'This vendor is currently closed.',
  
  // Payment
  PAYMENT_FAILED: 'Payment failed. Please try again or use a different payment method.',
  INVALID_CARD: 'Invalid card information.',
  CARD_DECLINED: 'Your card was declined.',
  
  // General
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  FEATURE_UNAVAILABLE: 'This feature is currently unavailable.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  ORDER_PLACED: 'Order placed successfully!',
  PAYMENT_SUCCESS: 'Payment processed successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  ADDRESS_ADDED: 'Address added successfully.',
  REVIEW_SUBMITTED: 'Review submitted successfully.',
  ITEM_ADDED_TO_CART: 'Item added to cart.',
  ITEM_REMOVED_FROM_CART: 'Item removed from cart.',
  VENDOR_FAVORITED: 'Vendor added to favorites.',
  VENDOR_UNFAVORITED: 'Vendor removed from favorites.',
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PAYPAL: 'paypal',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  CASH_ON_DELIVERY: 'cash_on_delivery',
} as const;

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  TASKER: 'tasker',  // Changed from DRIVER to align with blueprint
  VENDOR: 'vendor',
  ADMIN: 'admin',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  ORDER_UPDATE: 'order_update',
  PROMOTION: 'promotion',
  TASKER_ASSIGNMENT: 'tasker_assignment',
  PAYMENT_CONFIRMATION: 'payment_confirmation',
  DELIVERY_UPDATE: 'delivery_update',
  REVIEW_REQUEST: 'review_request',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
} as const;

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_ZOOM: 15,
  MIN_ZOOM: 10,
  MAX_ZOOM: 20,
  LOCATION_UPDATE_INTERVAL: 10000, // 10 seconds
  TRACKING_ACCURACY: 'high',
  MARKER_COLORS: {
    USER: '#007AFF',
    VENDOR: '#FF3B30',
    TASKER: '#34C759',
    DELIVERY: '#FF9500',
  },
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  MAX_IMAGES_PER_PRODUCT: 5,
  IMAGE_QUALITY: 0.8,
  MAX_IMAGE_DIMENSION: 1024,
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_LOCATION_TRACKING: true,
  ENABLE_BIOMETRIC_AUTH: true,
  ENABLE_DARK_MODE: true,
  ENABLE_MULTI_LANGUAGE: true,
  ENABLE_CASH_ON_DELIVERY: true,
  ENABLE_TASKER_TIPS: true,
  ENABLE_LOYALTY_PROGRAM: false,
  ENABLE_REFERRAL_PROGRAM: false,
} as const;

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  POSTAL_CODE: /^\d{5}(-\d{4})?$/,
  CREDIT_CARD: /^\d{13,19}$/,
  CVV: /^\d{3,4}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
} as const;

// Time Constants
export const TIME_CONSTANTS = {
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  DAYS_PER_WEEK: 7,
  DAYS_PER_MONTH: 30,
  DAYS_PER_YEAR: 365,
} as const;

// Export all constants as a single object for convenience
export const CONSTANTS = {
  API_CONFIG,
  AUTH_CONFIG,
  STORAGE_KEYS,
  APP_CONFIG,
  UI_CONSTANTS,
  BUSINESS_CONSTANTS,
  VALIDATION_CONSTANTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ORDER_STATUS,
  PAYMENT_METHODS,
  USER_ROLES,
  NOTIFICATION_TYPES,
  MAP_CONFIG,
  FILE_UPLOAD,
  FEATURE_FLAGS,
  REGEX_PATTERNS,
  TIME_CONSTANTS,
} as const;