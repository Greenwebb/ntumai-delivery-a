
// API type definitions

// Base API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
  timestamp: string;
  requestId?: string;
}

// API error structure
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
  timestamp: string;
  requestId?: string;
  statusCode?: number;
}

// Request configuration
export interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTimeout?: number;
  requiresAuth?: boolean;
  skipInterceptors?: boolean;
}

// API endpoint definition
export interface ApiEndpoint {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  requiresAuth?: boolean;
  cache?: boolean;
  cacheTimeout?: number;
  retries?: number;
  timeout?: number;
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Filter parameters
export interface FilterParams {
  search?: string;
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  location?: {
    latitude: number;
    longitude: number;
    radius?: number;
  };
}

// Authentication types - OTP-based only
export interface SendOtpRequest {
  email?: string;
  phone?: string;
  countryCode?: string;
  type: 'login' | 'register';
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  otpId: string;
  expiresIn: number;
  method: 'email' | 'phone';
  maskedContact: string; // e.g., "j***@example.com" or "+1***-***-1234"
}

export interface VerifyOtpRequest {
  otpId: string;
  code: string;
  email?: string;
  phone?: string;
  countryCode?: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
  isNewUser?: boolean;
}

// Login credentials for OTP authentication
export interface LoginCredentials {
  email?: string;
  phone?: string;
  countryCode?: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Login validation result
export interface LoginValidation {
  isValid: boolean;
  errors: string[];
  hasEmail: boolean;
  hasPhone: boolean;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  acceptTerms: boolean;
}

export interface RegisterResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  requiresVerification?: boolean;
  verificationMethod?: 'email' | 'phone';
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ResetPasswordRequest {
  email?: string;
  phone?: string;
  countryCode?: string;
}

export interface ChangePasswordRequest {
  currentOtp: string;
  newPassword: string;
  confirmPassword: string;
}

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: string;
  address?: Address;
  preferences?: UserPreferences;
  role: 'customer' | 'restaurant_owner' | 'delivery_driver' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id?: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface UserPreferences {
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  privacy: {
    shareLocation: boolean;
    shareActivity: boolean;
  };
  dietary: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    halal: boolean;
    kosher: boolean;
    allergies: string[];
  };
}

// Restaurant types
export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string[];
  images: string[];
  logo?: string;
  rating: number;
  reviewCount: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  deliveryFee: number;
  minimumOrder: number;
  estimatedDeliveryTime: number;
  isOpen: boolean;
  openingHours: OpeningHours[];
  address: Address;
  phone: string;
  email?: string;
  website?: string;
  features: string[];
  tags: string[];
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface OpeningHours {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  openTime: string; // HH:mm format
  closeTime: string; // HH:mm format
  isClosed: boolean;
}

// Menu types
export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  ingredients: string[];
  allergens: string[];
  nutritionalInfo?: NutritionalInfo;
  options: MenuItemOption[];
  isAvailable: boolean;
  isPopular: boolean;
  isSpicy: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  preparationTime: number;
  calories?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuCategory {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  items?: MenuItem[];
}

export interface MenuItemOption {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  maxSelections?: number;
  choices: MenuItemChoice[];
}

export interface MenuItemChoice {
  id: string;
  name: string;
  price: number;
  isDefault?: boolean;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  restaurant: Restaurant;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  tip: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryAddress: Address;
  deliveryInstructions?: string;
  estimatedDeliveryTime: string;
  actualDeliveryTime?: string;
  driverId?: string;
  driver?: DeliveryDriver;
  tracking?: OrderTracking;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  price: number;
  selectedOptions: SelectedOption[];
  specialInstructions?: string;
}

export interface SelectedOption {
  optionId: string;
  optionName: string;
  choiceId: string;
  choiceName: string;
  price: number;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface OrderTracking {
  status: OrderStatus;
  estimatedDeliveryTime: string;
  driverLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  statusHistory: OrderStatusUpdate[];
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  timestamp: string;
  message?: string;
}

// Payment types
export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'apple_pay' | 'google_pay' | 'cash';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  billingAddress?: Address;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret: string;
}

// Delivery types
export interface DeliveryDriver {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;
  rating: number;
  reviewCount: number;
  vehicle: {
    type: 'bike' | 'scooter' | 'car';
    model?: string;
    licensePlate?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
}

// Review types
export interface Review {
  id: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  restaurantId?: string;
  orderId?: string;
  driverId?: string;
  rating: number;
  comment?: string;
  images?: string[];
  response?: {
    message: string;
    timestamp: string;
  };
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Search types
export interface SearchFilters {
  query?: string;
  cuisine?: string[];
  priceRange?: string[];
  rating?: number;
  deliveryTime?: number;
  features?: string[];
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  sortBy?: 'relevance' | 'rating' | 'delivery_time' | 'price' | 'distance';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  totalResults: number;
  suggestions?: string[];
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'order_update' | 'promotion' | 'system' | 'delivery';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

// Analytics types
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp?: string;
}

// Location types
export interface LocationSearchResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: 'restaurant' | 'address' | 'landmark';
  distance?: number;
}

// File upload types
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

// Generic list response
export interface ListResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Verification types
export interface VerifyEmailRequest {
  email?: string;
  phone?: string;
  code: string;
}

export interface ResendVerificationRequest {
  email?: string;
  phone?: string;
}

// Health check response
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  version: string;
  timestamp: string;
  services: {
    database: 'ok' | 'error';
    redis: 'ok' | 'error';
    storage: 'ok' | 'error';
  };
}