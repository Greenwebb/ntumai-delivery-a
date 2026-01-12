// @ts-nocheck
/**
 * Mock Orders Data (Customer)
 */

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready_for_pickup' | 'picked_up' | 'en_route' | 'arriving' | 'delivered' | 'cancelled';

export interface MockOrder {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: string;
  deliveryInstructions?: string;
  taskerName?: string;
  taskerPhone?: string;
  estimatedDeliveryTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mock orders database
 */
const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'order_001',
    userId: 'user_customer_001',
    restaurantId: 'rest_001',
    restaurantName: 'Hungry Lion',
    items: [
      { id: 'item_001', name: 'Quarter Chicken & Chips', quantity: 2, price: 45 },
      { id: 'item_002', name: 'Chicken Burger', quantity: 1, price: 35 },
    ],
    subtotal: 125,
    deliveryFee: 15,
    total: 140,
    status: 'en_route',
    deliveryAddress: 'Plot 123, Kabulonga Road, Lusaka',
    taskerName: 'John Mwale',
    taskerPhone: '+260 97 111 2222',
    estimatedDeliveryTime: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    updatedAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
  },
  {
    id: 'order_002',
    userId: 'user_customer_001',
    restaurantId: 'rest_002',
    restaurantName: 'Debonairs Pizza',
    items: [
      { id: 'item_003', name: 'Triple-Decker', quantity: 1, price: 85 },
    ],
    subtotal: 85,
    deliveryFee: 20,
    total: 105,
    status: 'delivered',
    deliveryAddress: 'Plot 123, Kabulonga Road, Lusaka',
    taskerName: 'Mary Banda',
    taskerPhone: '+260 97 222 3333',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // Delivered 45 min after order
  },
];

/**
 * Get orders for user
 */
export async function mockGetOrders(userId: string): Promise<MockOrder[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return MOCK_ORDERS.filter(order => order.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Get order by ID
 */
export async function mockGetOrder(orderId: string): Promise<MockOrder | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_ORDERS.find(order => order.id === orderId) || null;
}

/**
 * Create new order
 */
export async function mockCreateOrder(data: {
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: MockOrder['items'];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  deliveryInstructions?: string;
}): Promise<MockOrder> {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const newOrder: MockOrder = {
    id: `order_${Date.now()}`,
    ...data,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  MOCK_ORDERS.push(newOrder);
  
  return newOrder;
}

/**
 * Update order status
 */
export async function mockUpdateOrderStatus(orderId: string, status: OrderStatus): Promise<MockOrder> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const order = MOCK_ORDERS.find(o => o.id === orderId);
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  order.status = status;
  order.updatedAt = new Date();
  
  return order;
}

/**
 * Cancel order
 */
export async function mockCancelOrder(orderId: string): Promise<MockOrder> {
  return mockUpdateOrderStatus(orderId, 'cancelled');
}
