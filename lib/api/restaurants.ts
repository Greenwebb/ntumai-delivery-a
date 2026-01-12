// @ts-nocheck

// Restaurant API endpoints
import { apiClient } from './client';
import {
  ApiResponse,
  ListResponse,
  Restaurant,
  MenuItem,
  MenuCategory,
  Review,
  PaginationParams,
  RestaurantFilters,
  SearchFilters,
} from './types';
import { API_ENDPOINTS } from './config';

// Restaurant service class
export class RestaurantService {
  // Get all restaurants with filters and pagination
  async getRestaurants(
    params?: PaginationParams & RestaurantFilters
  ): Promise<ApiResponse<ListResponse<Restaurant>>> {
    return apiClient.get<ListResponse<Restaurant>>(API_ENDPOINTS.RESTAURANTS.LIST, {
      params,
      cache: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
    });
  }

  // Get restaurant by ID
  async getRestaurant(id: string): Promise<ApiResponse<Restaurant>> {
    return apiClient.get<Restaurant>(`${API_ENDPOINTS.RESTAURANTS.DETAIL}/${id}`, {
      cache: true,
      cacheTimeout: 10 * 60 * 1000, // 10 minutes
    });
  }

  // Get nearby restaurants
  async getNearbyRestaurants(
    latitude: number,
    longitude: number,
    radius?: number,
    filters?: RestaurantFilters
  ): Promise<ApiResponse<ListResponse<Restaurant>>> {
    const params = {
      latitude,
      longitude,
      radius,
      ...filters,
    };

    return apiClient.get<ListResponse<Restaurant>>(API_ENDPOINTS.RESTAURANTS.NEARBY, {
      params,
      cache: true,
      cacheTimeout: 3 * 60 * 1000, // 3 minutes
    });
  }

  // Search restaurants
  async searchRestaurants(
    query: string,
    filters?: SearchFilters & PaginationParams
  ): Promise<ApiResponse<ListResponse<Restaurant>>> {
    const params = {
      q: query,
      ...filters,
    };

    return apiClient.get<ListResponse<Restaurant>>(API_ENDPOINTS.RESTAURANTS.SEARCH, {
      params,
      cache: true,
      cacheTimeout: 2 * 60 * 1000, // 2 minutes
    });
  }

  // Get featured restaurants
  async getFeaturedRestaurants(): Promise<ApiResponse<Restaurant[]>> {
    return apiClient.get<Restaurant[]>(API_ENDPOINTS.RESTAURANTS.FEATURED, {
      cache: true,
      cacheTimeout: 15 * 60 * 1000, // 15 minutes
    });
  }

  // Get popular restaurants
  async getPopularRestaurants(
    params?: PaginationParams
  ): Promise<ApiResponse<ListResponse<Restaurant>>> {
    return apiClient.get<ListResponse<Restaurant>>(API_ENDPOINTS.RESTAURANTS.POPULAR, {
      params,
      cache: true,
      cacheTimeout: 10 * 60 * 1000, // 10 minutes
    });
  }

  // Get restaurants by category
  async getRestaurantsByCategory(
    category: string,
    params?: PaginationParams & RestaurantFilters
  ): Promise<ApiResponse<ListResponse<Restaurant>>> {
    return apiClient.get<ListResponse<Restaurant>>(
      `${API_ENDPOINTS.RESTAURANTS.BY_CATEGORY}/${category}`,
      {
        params,
        cache: true,
        cacheTimeout: 8 * 60 * 1000, // 8 minutes
      }
    );
  }

  // Get restaurant menu
  async getRestaurantMenu(restaurantId: string): Promise<ApiResponse<{
    categories: MenuCategory[];
    items: MenuItem[];
  }>> {
    return apiClient.get(`${API_ENDPOINTS.RESTAURANTS.DETAIL}/${restaurantId}/menu`, {
      cache: true,
      cacheTimeout: 15 * 60 * 1000, // 15 minutes
    });
  }

  // Get menu item details
  async getMenuItem(restaurantId: string, itemId: string): Promise<ApiResponse<MenuItem>> {
    return apiClient.get<MenuItem>(
      `${API_ENDPOINTS.RESTAURANTS.DETAIL}/${restaurantId}/menu/items/${itemId}`,
      {
        cache: true,
        cacheTimeout: 10 * 60 * 1000, // 10 minutes
      }
    );
  }

  // Get menu categories
  async getMenuCategories(restaurantId: string): Promise<ApiResponse<MenuCategory[]>> {
    return apiClient.get<MenuCategory[]>(
      `${API_ENDPOINTS.RESTAURANTS.DETAIL}/${restaurantId}/menu/categories`,
      {
        cache: true,
        cacheTimeout: 20 * 60 * 1000, // 20 minutes
      }
    );
  }

  // Get restaurant reviews
  async getRestaurantReviews(
    restaurantId: string,
    params?: PaginationParams & {
      rating?: number;
      sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
    }
  ): Promise<ApiResponse<ListResponse<Review>>> {
    return apiClient.get<ListResponse<Review>>(
      `${API_ENDPOINTS.RESTAURANTS.DETAIL}/${restaurantId}/reviews`,
      {
        params,
        cache: true,
        cacheTimeout: 5 * 60 * 1000, // 5 minutes
      }
    );
  }

  // Add restaurant review
  async addRestaurantReview(
    restaurantId: string,
    review: {
      rating: number;
      comment?: string;
      orderId?: string;
    }
  ): Promise<ApiResponse<Review>> {
    return apiClient.post<Review>(
      `${API_ENDPOINTS.RESTAURANTS.DETAIL}/${restaurantId}/reviews`,
      review,
      {
        cache: false,
      }
    );
  }

  // Update restaurant review
  async updateRestaurantReview(
    restaurantId: string,
    reviewId: string,
    review: {
      rating?: number;
      comment?: string;
    }
  ): Promise<ApiResponse<Review>> {
    return apiClient.put<Review>(
      `${API_ENDPOINTS.RESTAURANTS.DETAIL}/${restaurantId}/reviews/${reviewId}`,
      review,
      {
        cache: false,
      }
    );
  }

  // Delete restaurant review
  async deleteRestaurantReview(
    restaurantId: string,
    reviewId: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(
      `${API_ENDPOINTS.RESTAURANTS.DETAIL}/${restaurantId}/reviews/${reviewId}`,
      {
        cache: false,
      }
    );
  }

  // Like/unlike restaurant review
  async toggleReviewLike(
    restaurantId: string,
    reviewId: string
  ): Promise<ApiResponse<{ liked: boolean; likesCount: number }>> {
    return apiClient.post(
      `${API_ENDPOINTS.RESTAURANTS.DETAIL}/${restaurantId}/reviews/${reviewId}/like`,
      {},
      {
        cache: false,
      }
    );
  }

  // Report restaurant review
  async reportReview(
    restaurantId: string,
    reviewId: string,
    reason: string
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>(
      `${API_ENDPOINTS.RESTAURANTS.DETAIL}/${restaurantId}/reviews/${reviewId}/report`,
      { reason },
      {
        cache: false,
      }
    );
  }

  // Get restaurant operating hours
  async getRestaurantHours(restaurantId: string): Promise<ApiResponse<{
    hours: Array<{
      day: string;
      open: string;
      close: string;
      isOpen: boolean;
    }>;
    isCurrentlyOpen: boolean;
    nextOpenTime?: string;
    nextCloseTime?: string;
  }>> {
    return apiClient.get(
      `${API_ENDPOINTS.RESTAURANTS.DETAIL}/${restaurantId}/hours`,
      {
        cache: true,
        cacheTimeout: 30 * 60 * 1000, // 30 minutes
      }
    );
  }

  // Check restaurant availability
  async checkRestaurantAvailability(
    restaurantId: string,
    deliveryTime?: string
  ): Promise<ApiResponse<{
    isAvailable: boolean;
    estimatedDeliveryTime: number;
    minimumOrderAmount: number;
    deliveryFee: number;
    message?: string;
  }>> {
    const params = deliveryTime ? { deliveryTime } : undefined;
    
    return apiClient.get(
      `${API_ENDPOINTS.RESTAURANTS.DETAIL}/${restaurantId}/availability`,
      {
        params,
        cache: true,
        cacheTimeout: 2 * 60 * 1000, // 2 minutes
      }
    );
  }

  // Get restaurant delivery areas
  async getRestaurantDeliveryAreas(
    restaurantId: string
  ): Promise<ApiResponse<{
    areas: Array<{
      name: string;
      coordinates: Array<[number, number]>;
      deliveryFee: number;
      minimumOrder: number;
      estimatedTime: number;
    }>;
  }>> {
    return apiClient.get(
      `${API_ENDPOINTS.RESTAURANTS.DETAIL}/${restaurantId}/delivery-areas`,
      {
        cache: true,
        cacheTimeout: 60 * 60 * 1000, // 1 hour
      }
    );
  }

  // Add restaurant to favorites
  async addToFavorites(restaurantId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(
      `${API_ENDPOINTS.RESTAURANTS.DETAIL}/${restaurantId}/favorite`,
      {},
      {
        cache: false,
      }
    );
  }

  // Remove restaurant from favorites
  async removeFromFavorites(restaurantId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(
      `${API_ENDPOINTS.RESTAURANTS.DETAIL}/${restaurantId}/favorite`,
      {
        cache: false,
      }
    );
  }

  // Get user's favorite restaurants
  async getFavoriteRestaurants(
    params?: PaginationParams
  ): Promise<ApiResponse<ListResponse<Restaurant>>> {
    return apiClient.get<ListResponse<Restaurant>>(API_ENDPOINTS.RESTAURANTS.FAVORITES, {
      params,
      cache: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
    });
  }

  // Get restaurant categories
  async getRestaurantCategories(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    icon: string;
    description?: string;
    restaurantCount: number;
  }>>> {
    return apiClient.get(API_ENDPOINTS.RESTAURANTS.CATEGORIES, {
      cache: true,
      cacheTimeout: 60 * 60 * 1000, // 1 hour
    });
  }

  // Get restaurant promotions
  async getRestaurantPromotions(
    restaurantId: string
  ): Promise<ApiResponse<Array<{
    id: string;
    title: string;
    description: string;
    discountType: 'percentage' | 'fixed' | 'free_delivery';
    discountValue: number;
    minimumOrder?: number;
    validUntil: string;
    terms?: string;
  }>>> {
    return apiClient.get(
      `${API_ENDPOINTS.RESTAURANTS.DETAIL}/${restaurantId}/promotions`,
      {
        cache: true,
        cacheTimeout: 10 * 60 * 1000, // 10 minutes
      }
    );
  }

  // Get similar restaurants
  async getSimilarRestaurants(
    restaurantId: string,
    limit?: number
  ): Promise<ApiResponse<Restaurant[]>> {
    const params = limit ? { limit } : undefined;
    
    return apiClient.get<Restaurant[]>(
      `${API_ENDPOINTS.RESTAURANTS.DETAIL}/${restaurantId}/similar`,
      {
        params,
        cache: true,
        cacheTimeout: 15 * 60 * 1000, // 15 minutes
      }
    );
  }

  // Get restaurant statistics
  async getRestaurantStats(
    restaurantId: string
  ): Promise<ApiResponse<{
    totalOrders: number;
    averageRating: number;
    totalReviews: number;
    averageDeliveryTime: number;
    popularItems: Array<{
      id: string;
      name: string;
      orderCount: number;
    }>;
    busyHours: Array<{
      hour: number;
      orderCount: number;
    }>;
  }>> {
    return apiClient.get(
      `${API_ENDPOINTS.RESTAURANTS.DETAIL}/${restaurantId}/stats`,
      {
        cache: true,
        cacheTimeout: 30 * 60 * 1000, // 30 minutes
      }
    );
  }
}

// Default restaurant service instance
export const restaurantService = new RestaurantService();

// Restaurant utility functions
export const restaurantUtils = {
  // Calculate distance between two coordinates
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  // Format distance for display
  formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  },

  // Check if restaurant is open
  isRestaurantOpen(restaurant: Restaurant): boolean {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const todayHours = restaurant.openingHours?.find(
      (hours) => hours.dayOfWeek === currentDay
    );

    if (!todayHours || !todayHours.isOpen) {
      return false;
    }

    const openTime = this.timeStringToMinutes(todayHours.openTime);
    const closeTime = this.timeStringToMinutes(todayHours.closeTime);

    if (closeTime < openTime) {
      // Restaurant closes after midnight
      return currentTime >= openTime || currentTime <= closeTime;
    }

    return currentTime >= openTime && currentTime <= closeTime;
  },

  // Convert time string to minutes
  timeStringToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  },

  // Get next opening time
  getNextOpeningTime(restaurant: Restaurant): Date | null {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Check remaining days of the week
    for (let i = 0; i < 7; i++) {
      const checkDay = (currentDay + i) % 7;
      const dayHours = restaurant.openingHours?.find(
        (hours) => hours.dayOfWeek === checkDay
      );

      if (dayHours && dayHours.isOpen) {
        const openTime = this.timeStringToMinutes(dayHours.openTime);
        
        if (i === 0 && currentTime < openTime) {
          // Today, but before opening time
          const nextOpen = new Date(now);
          nextOpen.setHours(Math.floor(openTime / 60), openTime % 60, 0, 0);
          return nextOpen;
        } else if (i > 0) {
          // Future day
          const nextOpen = new Date(now);
          nextOpen.setDate(now.getDate() + i);
          nextOpen.setHours(Math.floor(openTime / 60), openTime % 60, 0, 0);
          return nextOpen;
        }
      }
    }

    return null;
  },

  // Filter restaurants by criteria
  filterRestaurants(
    restaurants: Restaurant[],
    filters: {
      minRating?: number;
      maxDeliveryTime?: number;
      maxDeliveryFee?: number;
      cuisineTypes?: string[];
      priceRange?: string[];
      isOpen?: boolean;
    }
  ): Restaurant[] {
    return restaurants.filter((restaurant) => {
      if (filters.minRating && restaurant.rating < filters.minRating) {
        return false;
      }

      if (filters.maxDeliveryTime && restaurant.estimatedDeliveryTime > filters.maxDeliveryTime) {
        return false;
      }

      if (filters.maxDeliveryFee && restaurant.deliveryFee > filters.maxDeliveryFee) {
        return false;
      }

      if (filters.cuisineTypes && filters.cuisineTypes.length > 0) {
        if (!restaurant.cuisineTypes.some(type => filters.cuisineTypes!.includes(type))) {
          return false;
        }
      }

      if (filters.priceRange && filters.priceRange.length > 0) {
        if (!filters.priceRange.includes(restaurant.priceRange)) {
          return false;
        }
      }

      if (filters.isOpen !== undefined) {
        const isOpen = this.isRestaurantOpen(restaurant);
        if (filters.isOpen !== isOpen) {
          return false;
        }
      }

      return true;
    });
  },

  // Sort restaurants by criteria
  sortRestaurants(
    restaurants: Restaurant[],
    sortBy: 'rating' | 'deliveryTime' | 'deliveryFee' | 'distance' | 'popularity'
  ): Restaurant[] {
    return [...restaurants].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'deliveryTime':
          return a.estimatedDeliveryTime - b.estimatedDeliveryTime;
        case 'deliveryFee':
          return a.deliveryFee - b.deliveryFee;
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'popularity':
          return (b.totalOrders || 0) - (a.totalOrders || 0);
        default:
          return 0;
      }
    });
  },
};
