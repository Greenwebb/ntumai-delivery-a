// @ts-nocheck
/**
 * Mock Restaurants & Menu Data
 */

export interface MockRestaurant {
  id: string;
  name: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minimumOrder: number;
  cuisineTypes: string[];
  isOpen: boolean;
  distance: string;
}

export interface MockMenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isAvailable: boolean;
  preparationTime: number;
}

/**
 * Mock restaurants
 */
export const MOCK_RESTAURANTS: MockRestaurant[] = [
  {
    id: 'rest_001',
    name: 'Hungry Lion',
    description: 'Fast food, Chicken, Burgers',
    image: 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Hungry+Lion',
    rating: 4.5,
    reviewCount: 342,
    deliveryTime: '20-30 min',
    deliveryFee: 15,
    minimumOrder: 50,
    cuisineTypes: ['Fast Food', 'Chicken'],
    isOpen: true,
    distance: '1.2 km',
  },
  {
    id: 'rest_002',
    name: 'Debonairs Pizza',
    description: 'Pizza, Italian',
    image: 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Debonairs',
    rating: 4.7,
    reviewCount: 521,
    deliveryTime: '25-35 min',
    deliveryFee: 20,
    minimumOrder: 60,
    cuisineTypes: ['Pizza', 'Italian'],
    isOpen: true,
    distance: '2.1 km',
  },
  {
    id: 'rest_003',
    name: 'Nandos',
    description: 'Peri-Peri Chicken, Portuguese',
    image: 'https://via.placeholder.com/300x200/95E1D3/FFFFFF?text=Nandos',
    rating: 4.6,
    reviewCount: 428,
    deliveryTime: '30-40 min',
    deliveryFee: 18,
    minimumOrder: 55,
    cuisineTypes: ['Chicken', 'Portuguese'],
    isOpen: true,
    distance: '1.8 km',
  },
  {
    id: 'rest_004',
    name: 'Steers',
    description: 'Burgers, Fast Food',
    image: 'https://via.placeholder.com/300x200/F38181/FFFFFF?text=Steers',
    rating: 4.3,
    reviewCount: 287,
    deliveryTime: '20-30 min',
    deliveryFee: 15,
    minimumOrder: 45,
    cuisineTypes: ['Burgers', 'Fast Food'],
    isOpen: true,
    distance: '1.5 km',
  },
  {
    id: 'rest_005',
    name: 'Ocean Basket',
    description: 'Seafood, Sushi',
    image: 'https://via.placeholder.com/300x200/AA96DA/FFFFFF?text=Ocean+Basket',
    rating: 4.8,
    reviewCount: 612,
    deliveryTime: '35-45 min',
    deliveryFee: 25,
    minimumOrder: 80,
    cuisineTypes: ['Seafood', 'Sushi'],
    isOpen: false,
    distance: '3.2 km',
  },
];

/**
 * Mock menu items
 */
export const MOCK_MENU_ITEMS: MockMenuItem[] = [
  // Hungry Lion
  {
    id: 'item_001',
    restaurantId: 'rest_001',
    name: 'Quarter Chicken & Chips',
    description: 'Juicy quarter chicken with crispy chips',
    price: 45,
    image: 'https://via.placeholder.com/200x150/FF6B6B/FFFFFF?text=Chicken',
    category: 'Meals',
    isAvailable: true,
    preparationTime: 15,
  },
  {
    id: 'item_002',
    restaurantId: 'rest_001',
    name: 'Chicken Burger',
    description: 'Crispy chicken burger with lettuce and mayo',
    price: 35,
    image: 'https://via.placeholder.com/200x150/FF6B6B/FFFFFF?text=Burger',
    category: 'Burgers',
    isAvailable: true,
    preparationTime: 10,
  },
  // Debonairs Pizza
  {
    id: 'item_003',
    restaurantId: 'rest_002',
    name: 'Triple-Decker',
    description: 'Pepperoni, mushrooms, and extra cheese',
    price: 85,
    image: 'https://via.placeholder.com/200x150/4ECDC4/FFFFFF?text=Pizza',
    category: 'Pizza',
    isAvailable: true,
    preparationTime: 20,
  },
  {
    id: 'item_004',
    restaurantId: 'rest_002',
    name: 'BBQ Chicken Pizza',
    description: 'BBQ sauce, chicken, onions, and cheese',
    price: 90,
    image: 'https://via.placeholder.com/200x150/4ECDC4/FFFFFF?text=BBQ+Pizza',
    category: 'Pizza',
    isAvailable: true,
    preparationTime: 20,
  },
  // Nandos
  {
    id: 'item_005',
    restaurantId: 'rest_003',
    name: 'Full Chicken',
    description: 'Whole peri-peri chicken with 2 sides',
    price: 120,
    image: 'https://via.placeholder.com/200x150/95E1D3/FFFFFF?text=Full+Chicken',
    category: 'Meals',
    isAvailable: true,
    preparationTime: 25,
  },
  {
    id: 'item_006',
    restaurantId: 'rest_003',
    name: 'Chicken Wrap',
    description: 'Grilled chicken wrap with peri-peri sauce',
    price: 55,
    image: 'https://via.placeholder.com/200x150/95E1D3/FFFFFF?text=Wrap',
    category: 'Wraps',
    isAvailable: true,
    preparationTime: 12,
  },
];

/**
 * Get restaurants
 */
export async function mockGetRestaurants(): Promise<MockRestaurant[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return MOCK_RESTAURANTS;
}

/**
 * Get restaurant by ID
 */
export async function mockGetRestaurant(id: string): Promise<MockRestaurant | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_RESTAURANTS.find(r => r.id === id) || null;
}

/**
 * Get menu items for restaurant
 */
export async function mockGetMenuItems(restaurantId: string): Promise<MockMenuItem[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return MOCK_MENU_ITEMS.filter(item => item.restaurantId === restaurantId);
}

/**
 * Search restaurants
 */
export async function mockSearchRestaurants(query: string): Promise<MockRestaurant[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  const lowerQuery = query.toLowerCase();
  return MOCK_RESTAURANTS.filter(r => 
    r.name.toLowerCase().includes(lowerQuery) ||
    r.description.toLowerCase().includes(lowerQuery) ||
    r.cuisineTypes.some(c => c.toLowerCase().includes(lowerQuery))
  );
}
