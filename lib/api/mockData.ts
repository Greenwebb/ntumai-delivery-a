// @ts-nocheck

// Mock data generator for all API endpoints
// This file generates realistic mock data for development and testing

import { User, Product, Order, DeliveryAddress, DriverStats } from '@/src/store/types';

// Mock users
export const mockUsers: Record<string, User> = {
  customer1: {
    id: 'user_cust_001',
    email: 'customer@example.com',
    phone: '+260978123456',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://i.pravatar.cc/150?img=1',
    role: 'customer',
    isVerified: true,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  driver1: {
    id: 'user_drv_001',
    email: 'driver@example.com',
    phone: '+260978654321',
    firstName: 'James',
    lastName: 'Smith',
    avatar: 'https://i.pravatar.cc/150?img=2',
    role: 'driver',
    isVerified: true,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  vendor1: {
    id: 'user_vnd_001',
    email: 'vendor@example.com',
    phone: '+260978987654',
    firstName: 'Sarah',
    lastName: 'Johnson',
    avatar: 'https://i.pravatar.cc/150?img=3',
    role: 'vendor',
    isVerified: true,
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

// Mock products/menu items
export const mockProducts: Product[] = [
  {
    id: 'prod_001',
    name: 'Nshima with Relish',
    description: 'Traditional Zambian staple with vegetable relish',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    category: 'Traditional',
    vendorId: 'user_vnd_001',
    vendorName: 'Zambian Kitchen',
    rating: 4.5,
    reviewCount: 128,
    isAvailable: true,
    preparationTime: 15,
    ingredients: ['Maize meal', 'Tomatoes', 'Onions'],
    allergens: ['Gluten'],
  },
  {
    id: 'prod_002',
    name: 'Fried Chicken',
    description: 'Crispy fried chicken with special spices',
    price: 55000,
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc46e?w=400',
    category: 'Main Course',
    vendorId: 'user_vnd_001',
    vendorName: 'Zambian Kitchen',
    rating: 4.7,
    reviewCount: 245,
    isAvailable: true,
    preparationTime: 20,
    ingredients: ['Chicken', 'Spices', 'Oil'],
    allergens: [],
  },
  {
    id: 'prod_003',
    name: 'Vegetable Salad',
    description: 'Fresh mixed vegetables with special dressing',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400',
    category: 'Salads',
    vendorId: 'user_vnd_001',
    vendorName: 'Zambian Kitchen',
    rating: 4.3,
    reviewCount: 89,
    isAvailable: true,
    preparationTime: 10,
    ingredients: ['Lettuce', 'Tomatoes', 'Cucumbers', 'Carrots'],
    allergens: [],
  },
  {
    id: 'prod_004',
    name: 'Beef Stew',
    description: 'Slow-cooked beef with potatoes and vegetables',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1599043513c80ac0e36997a5d2cecac65c90b7c10?w=400',
    category: 'Main Course',
    vendorId: 'user_vnd_001',
    vendorName: 'Zambian Kitchen',
    rating: 4.6,
    reviewCount: 156,
    isAvailable: true,
    preparationTime: 30,
    ingredients: ['Beef', 'Potatoes', 'Carrots', 'Onions'],
    allergens: [],
  },
  {
    id: 'prod_005',
    name: 'Mango Juice',
    description: 'Fresh mango juice',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400',
    category: 'Beverages',
    vendorId: 'user_vnd_001',
    vendorName: 'Zambian Kitchen',
    rating: 4.4,
    reviewCount: 67,
    isAvailable: true,
    preparationTime: 5,
    ingredients: ['Mango', 'Water', 'Sugar'],
    allergens: [],
  },
];

// Mock delivery addresses
export const mockAddresses: DeliveryAddress[] = [
  {
    id: 'addr_001',
    street: '123 Cairo Road',
    city: 'Lusaka',
    state: 'Lusaka Province',
    zipCode: '10101',
    country: 'Zambia',
    coordinates: {
      latitude: -15.3875,
      longitude: 28.3228,
    },
    isDefault: true,
  },
  {
    id: 'addr_002',
    street: '456 Independence Avenue',
    city: 'Lusaka',
    state: 'Lusaka Province',
    zipCode: '10102',
    country: 'Zambia',
    coordinates: {
      latitude: -15.3900,
      longitude: 28.3300,
    },
    isDefault: false,
  },
  {
    id: 'addr_003',
    street: '789 Great North Road',
    city: 'Ndola',
    state: 'Copperbelt Province',
    zipCode: '71101',
    country: 'Zambia',
    coordinates: {
      latitude: -12.9626,
      longitude: 28.6476,
    },
    isDefault: false,
  },
];

// Mock orders
export const mockOrders: Order[] = [
  {
    id: 'order_001',
    customerId: 'user_cust_001',
    vendorId: 'user_vnd_001',
    driverId: 'user_drv_001',
    items: [
      {
        product: mockProducts[0],
        quantity: 2,
        specialInstructions: 'Extra spicy',
      },
      {
        product: mockProducts[1],
        quantity: 1,
        specialInstructions: '',
      },
    ],
    status: 'delivered',
    totalAmount: 155000,
    deliveryFee: 15000,
    discount: 0,
    deliveryAddress: mockAddresses[0],
    paymentMethod: 'card',
    estimatedDeliveryTime: '30 mins',
    actualDeliveryTime: '28 mins',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 5,
    review: 'Great food and fast delivery!',
  },
  {
    id: 'order_002',
    customerId: 'user_cust_001',
    vendorId: 'user_vnd_001',
    driverId: 'user_drv_001',
    items: [
      {
        product: mockProducts[3],
        quantity: 1,
        specialInstructions: 'No onions',
      },
    ],
    status: 'on_the_way',
    totalAmount: 80000,
    deliveryFee: 15000,
    discount: 0,
    deliveryAddress: mockAddresses[0],
    paymentMethod: 'cash',
    estimatedDeliveryTime: '25 mins',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock driver stats
export const mockDriverStats: DriverStats = {
  totalDeliveries: 342,
  totalEarnings: 2850000,
  averageRating: 4.8,
  completionRate: 98.5,
  onTimeRate: 96.2,
};

// Mock notifications
export const mockNotifications = [
  {
    id: 'notif_001',
    userId: 'user_cust_001',
    type: 'order_update' as const,
    title: 'Order Confirmed',
    message: 'Your order from Zambian Kitchen has been confirmed',
    data: { orderId: 'order_002' },
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_002',
    userId: 'user_cust_001',
    type: 'delivery' as const,
    title: 'Driver Assigned',
    message: 'James Smith has been assigned to deliver your order',
    data: { orderId: 'order_002', driverId: 'user_drv_001' },
    isRead: false,
    createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif_003',
    userId: 'user_cust_001',
    type: 'promotion' as const,
    title: 'Special Offer',
    message: 'Get 20% off on your next order',
    data: { promoCode: 'SAVE20' },
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock wallet/payment data
export const mockWalletData = {
  balance: 450000,
  currency: 'ZMW',
  transactions: [
    {
      id: 'txn_001',
      type: 'debit' as const,
      amount: 155000,
      description: 'Order #order_001',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed' as const,
    },
    {
      id: 'txn_002',
      type: 'credit' as const,
      amount: 100000,
      description: 'Referral bonus',
      timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed' as const,
    },
    {
      id: 'txn_003',
      type: 'debit' as const,
      amount: 80000,
      description: 'Order #order_002',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'pending' as const,
    },
  ],
};

// Mock P2P delivery data
export const mockP2PDeliveries = [
  {
    id: 'p2p_001',
    senderId: 'user_cust_001',
    senderName: 'John Doe',
    recipientName: 'Jane Smith',
    recipientPhone: '+260978111111',
    pickupLocation: mockAddresses[0],
    dropoffLocation: mockAddresses[1],
    itemDescription: 'Documents and gifts',
    deliveryType: 'moto',
    estimatedPrice: 25000,
    status: 'delivered' as const,
    driverId: 'user_drv_001',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
    trackingLink: 'https://ntumai.app/track/p2p_001',
  },
  {
    id: 'p2p_002',
    senderId: 'user_cust_001',
    senderName: 'John Doe',
    recipientName: 'Michael Brown',
    recipientPhone: '+260978222222',
    pickupLocation: mockAddresses[0],
    dropoffLocation: mockAddresses[2],
    itemDescription: 'Electronics package',
    deliveryType: 'car',
    estimatedPrice: 50000,
    status: 'on_the_way' as const,
    driverId: 'user_drv_001',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    trackingLink: 'https://ntumai.app/track/p2p_002',
  },
];

// Mock tasks/errands
export const mockTasks = [
  {
    id: 'task_001',
    customerId: 'user_cust_001',
    title: 'Grocery Shopping',
    description: 'Buy groceries from Pick n Pay',
    category: 'shopping',
    items: ['Milk', 'Bread', 'Eggs', 'Vegetables'],
    budget: 150000,
    status: 'completed' as const,
    assignedTo: 'user_drv_001',
    location: mockAddresses[0],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    totalSpent: 145000,
    rating: 5,
    review: 'Perfect! Got everything I needed',
  },
  {
    id: 'task_002',
    customerId: 'user_cust_001',
    title: 'Pay Bills',
    description: 'Pay electricity and water bills',
    category: 'errands',
    items: ['Electricity bill', 'Water bill'],
    budget: 200000,
    status: 'in_progress' as const,
    assignedTo: 'user_drv_001',
    location: mockAddresses[0],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock vendor profile
export const mockVendorProfile = {
  id: 'user_vnd_001',
  name: 'Zambian Kitchen',
  description: 'Authentic Zambian cuisine with modern twist',
  logo: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400',
  coverImage: 'https://images.unsplash.com/photo-1504674900152-b8b80e7ddb3d?w=800',
  cuisine: ['Zambian', 'African', 'Traditional'],
  rating: 4.6,
  reviewCount: 542,
  deliveryTime: '30-45 mins',
  deliveryFee: 15000,
  minimumOrder: 40000,
  isOpen: true,
  openingHours: {
    monday: { open: '10:00', close: '22:00' },
    tuesday: { open: '10:00', close: '22:00' },
    wednesday: { open: '10:00', close: '22:00' },
    thursday: { open: '10:00', close: '22:00' },
    friday: { open: '10:00', close: '23:00' },
    saturday: { open: '11:00', close: '23:00' },
    sunday: { open: '11:00', close: '21:00' },
  },
  address: mockAddresses[0],
  phone: '+260978987654',
  email: 'vendor@example.com',
};

// Mock vendor stats
export const mockVendorStats = {
  totalOrders: 1250,
  totalRevenue: 18750000,
  averageRating: 4.6,
  totalProducts: 45,
  activeOrders: 3,
};

// Helper function to generate random ID
export const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Helper function to get random item from array
export const getRandomItem = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper function to get random items from array
export const getRandomItems = <T,>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
};
