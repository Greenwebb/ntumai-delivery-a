// @ts-nocheck

// API Services - Feature-specific API calls
import { apiClient, ApiResponse } from './apiClient';
import { ENDPOINTS } from './config';

// ============ Auth Services ============
export const authService = {
  sendOtp: (phone: string) =>
    apiClient.post<{ sessionId: string }>(ENDPOINTS.AUTH.SEND_OTP, { phone }, { requiresAuth: false }),
  
  verifyOtp: (sessionId: string, otp: string) =>
    apiClient.post<{ token: string; refreshToken: string }>(
      ENDPOINTS.AUTH.VERIFY_OTP,
      { sessionId, otp },
      { requiresAuth: false }
    ),
  
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; refreshToken: string }>(
      ENDPOINTS.AUTH.LOGIN,
      { email, password },
      { requiresAuth: false }
    ),
  
  register: (data: any) =>
    apiClient.post<{ token: string; refreshToken: string }>(
      ENDPOINTS.AUTH.REGISTER,
      data,
      { requiresAuth: false }
    ),
  
  logout: () => apiClient.post(ENDPOINTS.AUTH.LOGOUT),
  
  refreshToken: (refreshToken: string) =>
    apiClient.post<{ token: string }>(
      ENDPOINTS.AUTH.REFRESH,
      { refreshToken },
      { requiresAuth: false }
    ),
  
  getProfile: () => apiClient.get(ENDPOINTS.AUTH.ME),
  
  updateProfile: (data: any) => apiClient.put(ENDPOINTS.AUTH.UPDATE_PROFILE, data),
  
  deleteAccount: () => apiClient.delete(ENDPOINTS.AUTH.DELETE_ACCOUNT),
};

// ============ User Services ============
export const userService = {
  getProfile: () => apiClient.get(ENDPOINTS.USER.PROFILE),
  
  updateProfile: (data: any) => apiClient.put(ENDPOINTS.USER.UPDATE_PROFILE, data),
  
  uploadAvatar: (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(ENDPOINTS.USER.UPLOAD_AVATAR, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  getAddresses: () => apiClient.get(ENDPOINTS.USER.ADDRESSES),
  
  updatePreferences: (preferences: any) =>
    apiClient.put(ENDPOINTS.USER.PREFERENCES, preferences),
  
  deleteAccount: () => apiClient.delete(ENDPOINTS.USER.DELETE_ACCOUNT),
};

// ============ Restaurant Services ============
export const restaurantService = {
  getRestaurants: (params?: any) => apiClient.get(ENDPOINTS.RESTAURANTS.LIST, { params }),
  
  getRestaurantDetail: (id: string) =>
    apiClient.get(ENDPOINTS.RESTAURANTS.DETAIL.replace(':id', id)),
  
  searchRestaurants: (query: string, params?: any) =>
    apiClient.get(ENDPOINTS.RESTAURANTS.SEARCH, { params: { q: query, ...params } }),
  
  getNearbyRestaurants: (latitude: number, longitude: number, radius?: number) =>
    apiClient.get(ENDPOINTS.RESTAURANTS.NEARBY, {
      params: { latitude, longitude, radius },
    }),
  
  getFeaturedRestaurants: () => apiClient.get(ENDPOINTS.RESTAURANTS.FEATURED),
  
  getCategories: () => apiClient.get(ENDPOINTS.RESTAURANTS.CATEGORIES),
  
  getRestaurantReviews: (id: string, params?: any) =>
    apiClient.get(ENDPOINTS.RESTAURANTS.REVIEWS.replace(':id', id), { params }),
};

// ============ Menu Services ============
export const menuService = {
  getRestaurantMenu: (restaurantId: string) =>
    apiClient.get(ENDPOINTS.MENU.RESTAURANT_MENU.replace(':restaurantId', restaurantId)),
  
  getMenuCategories: (restaurantId: string) =>
    apiClient.get(ENDPOINTS.MENU.CATEGORIES.replace(':restaurantId', restaurantId)),
  
  getMenuItems: (restaurantId: string, params?: any) =>
    apiClient.get(ENDPOINTS.MENU.ITEMS.replace(':restaurantId', restaurantId), { params }),
  
  getMenuItemDetail: (restaurantId: string, itemId: string) =>
    apiClient.get(
      ENDPOINTS.MENU.ITEM_DETAIL.replace(':restaurantId', restaurantId).replace(':itemId', itemId)
    ),
  
  searchMenuItems: (restaurantId: string, query: string, params?: any) =>
    apiClient.get(ENDPOINTS.MENU.SEARCH.replace(':restaurantId', restaurantId), {
      params: { q: query, ...params },
    }),
};

// ============ Order Services ============
export const orderService = {
  getOrders: (params?: any) => apiClient.get(ENDPOINTS.ORDERS.LIST, { params }),
  
  createOrder: (data: any) => apiClient.post(ENDPOINTS.ORDERS.CREATE, data),
  
  getOrderDetail: (id: string) =>
    apiClient.get(ENDPOINTS.ORDERS.DETAIL.replace(':id', id)),
  
  updateOrder: (id: string, data: any) =>
    apiClient.put(ENDPOINTS.ORDERS.UPDATE.replace(':id', id), data),
  
  cancelOrder: (id: string, reason?: string) =>
    apiClient.post(ENDPOINTS.ORDERS.CANCEL.replace(':id', id), { reason }),
  
  trackOrder: (id: string) =>
    apiClient.get(ENDPOINTS.ORDERS.TRACK.replace(':id', id)),
  
  getOrderHistory: (params?: any) =>
    apiClient.get(ENDPOINTS.ORDERS.HISTORY, { params }),
  
  reorderItems: (id: string) =>
    apiClient.post(ENDPOINTS.ORDERS.REORDER.replace(':id', id)),
};

// ============ Payment Services ============
export const paymentService = {
  getPaymentMethods: () => apiClient.get(ENDPOINTS.PAYMENTS.METHODS),
  
  addPaymentMethod: (data: any) => apiClient.post(ENDPOINTS.PAYMENTS.ADD_METHOD, data),
  
  updatePaymentMethod: (id: string, data: any) =>
    apiClient.put(ENDPOINTS.PAYMENTS.UPDATE_METHOD.replace(':id', id), data),
  
  deletePaymentMethod: (id: string) =>
    apiClient.delete(ENDPOINTS.PAYMENTS.DELETE_METHOD.replace(':id', id)),
  
  createPaymentIntent: (amount: number, currency: string = 'USD') =>
    apiClient.post(ENDPOINTS.PAYMENTS.CREATE_INTENT, { amount, currency }),
  
  confirmPayment: (paymentIntentId: string, data: any) =>
    apiClient.post(ENDPOINTS.PAYMENTS.CONFIRM_PAYMENT, { paymentIntentId, ...data }),
  
  refundPayment: (paymentId: string, reason?: string) =>
    apiClient.post(ENDPOINTS.PAYMENTS.REFUND.replace(':id', paymentId), { reason }),
};

// ============ Delivery Services ============
export const deliveryService = {
  estimateDelivery: (pickupLocation: any, dropoffLocation: any) =>
    apiClient.post(ENDPOINTS.DELIVERY.ESTIMATE, { pickupLocation, dropoffLocation }),
  
  trackDelivery: (orderId: string) =>
    apiClient.get(ENDPOINTS.DELIVERY.TRACK.replace(':orderId', orderId)),
  
  getNearbyDrivers: (latitude: number, longitude: number, radius?: number) =>
    apiClient.get(ENDPOINTS.DELIVERY.DRIVERS, {
      params: { latitude, longitude, radius },
    }),
  
  getDeliveryZones: () => apiClient.get(ENDPOINTS.DELIVERY.ZONES),
};

// ============ Review Services ============
export const reviewService = {
  getReviews: (params?: any) => apiClient.get(ENDPOINTS.REVIEWS.LIST, { params }),
  
  createReview: (data: any) => apiClient.post(ENDPOINTS.REVIEWS.CREATE, data),
  
  updateReview: (id: string, data: any) =>
    apiClient.put(ENDPOINTS.REVIEWS.UPDATE.replace(':id', id), data),
  
  deleteReview: (id: string) =>
    apiClient.delete(ENDPOINTS.REVIEWS.DELETE.replace(':id', id)),
  
  getRestaurantReviews: (restaurantId: string, params?: any) =>
    apiClient.get(ENDPOINTS.REVIEWS.RESTAURANT_REVIEWS.replace(':restaurantId', restaurantId), {
      params,
    }),
  
  getUserReviews: (userId: string, params?: any) =>
    apiClient.get(ENDPOINTS.REVIEWS.USER_REVIEWS.replace(':userId', userId), { params }),
};

// ============ Search Services ============
export const searchService = {
  globalSearch: (query: string, params?: any) =>
    apiClient.get(ENDPOINTS.SEARCH.GLOBAL, { params: { q: query, ...params } }),
  
  searchRestaurants: (query: string, params?: any) =>
    apiClient.get(ENDPOINTS.SEARCH.RESTAURANTS, { params: { q: query, ...params } }),
  
  searchMenuItems: (query: string, params?: any) =>
    apiClient.get(ENDPOINTS.SEARCH.MENU_ITEMS, { params: { q: query, ...params } }),
  
  getSuggestions: (query: string) =>
    apiClient.get(ENDPOINTS.SEARCH.SUGGESTIONS, { params: { q: query } }),
  
  getAutocomplete: (query: string) =>
    apiClient.get(ENDPOINTS.SEARCH.AUTOCOMPLETE, { params: { q: query } }),
};

// ============ Location Services ============
export const locationService = {
  geocode: (address: string) =>
    apiClient.post(ENDPOINTS.LOCATION.GEOCODE, { address }, { requiresAuth: false }),
  
  reverseGeocode: (latitude: number, longitude: number) =>
    apiClient.post(
      ENDPOINTS.LOCATION.REVERSE_GEOCODE,
      { latitude, longitude },
      { requiresAuth: false }
    ),
  
  searchLocation: (query: string) =>
    apiClient.get(ENDPOINTS.LOCATION.SEARCH, { params: { q: query }, requiresAuth: false }),
  
  validateAddress: (address: any) =>
    apiClient.post(ENDPOINTS.LOCATION.VALIDATE_ADDRESS, address, { requiresAuth: false }),
};

// ============ Notification Services ============
export const notificationService = {
  getNotifications: (params?: any) =>
    apiClient.get(ENDPOINTS.NOTIFICATIONS.LIST, { params }),
  
  markAsRead: (id: string) =>
    apiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_READ.replace(':id', id)),
  
  markAllAsRead: () =>
    apiClient.post(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ),
  
  deleteNotification: (id: string) =>
    apiClient.delete(ENDPOINTS.NOTIFICATIONS.DELETE.replace(':id', id)),
  
  getNotificationSettings: () =>
    apiClient.get(ENDPOINTS.NOTIFICATIONS.SETTINGS),
  
  updateNotificationSettings: (settings: any) =>
    apiClient.put(ENDPOINTS.NOTIFICATIONS.SETTINGS, settings),
  
  registerDevice: (deviceToken: string, platform: string) =>
    apiClient.post(ENDPOINTS.NOTIFICATIONS.REGISTER_DEVICE, { deviceToken, platform }),
};

// ============ Analytics Services ============
export const analyticsService = {
  trackEvent: (eventName: string, eventData?: any) =>
    apiClient.post(ENDPOINTS.ANALYTICS.TRACK_EVENT, { eventName, eventData }),
  
  batchEvents: (events: any[]) =>
    apiClient.post(ENDPOINTS.ANALYTICS.BATCH_EVENTS, { events }),
};

// ============ Upload Services ============
export const uploadService = {
  uploadImage: (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(ENDPOINTS.UPLOAD.IMAGE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  uploadDocument: (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(ENDPOINTS.UPLOAD.DOCUMENT, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  uploadAvatar: (file: any) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(ENDPOINTS.UPLOAD.AVATAR, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ============ System Services ============
export const systemService = {
  getHealth: () => apiClient.get(ENDPOINTS.SYSTEM.HEALTH, { requiresAuth: false }),
  
  getVersion: () => apiClient.get(ENDPOINTS.SYSTEM.VERSION, { requiresAuth: false }),
  
  getConfig: () => apiClient.get(ENDPOINTS.SYSTEM.CONFIG, { requiresAuth: false }),
};
