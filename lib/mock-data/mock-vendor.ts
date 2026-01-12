// @ts-nocheck
/**
 * Mock Vendor Data
 */

export interface MockVendorOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'cancelled';
  createdAt: Date;
  estimatedReadyTime?: Date;
}

export interface MockVendorStats {
  todayOrders: number;
  todayRevenue: number;
  weekOrders: number;
  weekRevenue: number;
  monthOrders: number;
  monthRevenue: number;
  averageOrderValue: number;
  popularItems: { name: string; count: number }[];
}

/**
 * Mock vendor orders
 */
const MOCK_VENDOR_ORDERS: MockVendorOrder[] = [
  {
    id: 'vorder_001',
    orderNumber: '#1234',
    customerName: 'Demo Customer',
    items: [
      { name: 'Quarter Chicken & Chips', quantity: 2, price: 45 },
      { name: 'Chicken Burger', quantity: 1, price: 35 },
    ],
    total: 125,
    status: 'preparing',
    createdAt: new Date(Date.now() - 10 * 60 * 1000),
    estimatedReadyTime: new Date(Date.now() + 5 * 60 * 1000),
  },
  {
    id: 'vorder_002',
    orderNumber: '#1235',
    customerName: 'Sarah Phiri',
    items: [
      { name: 'Triple-Decker Pizza', quantity: 1, price: 85 },
    ],
    total: 85,
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: 'vorder_003',
    orderNumber: '#1236',
    customerName: 'James Mulenga',
    items: [
      { name: 'Full Chicken', quantity: 1, price: 120 },
      { name: 'Chicken Wrap', quantity: 2, price: 55 },
    ],
    total: 230,
    status: 'ready',
    createdAt: new Date(Date.now() - 25 * 60 * 1000),
    estimatedReadyTime: new Date(Date.now() - 5 * 60 * 1000),
  },
];

/**
 * Get vendor orders
 */
export async function mockGetVendorOrders(vendorId: string): Promise<MockVendorOrder[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return MOCK_VENDOR_ORDERS.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Get vendor order by ID
 */
export async function mockGetVendorOrder(orderId: string): Promise<MockVendorOrder | null> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_VENDOR_ORDERS.find(order => order.id === orderId) || null;
}

/**
 * Update vendor order status
 */
export async function mockUpdateVendorOrderStatus(
  orderId: string,
  status: MockVendorOrder['status']
): Promise<MockVendorOrder> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const order = MOCK_VENDOR_ORDERS.find(o => o.id === orderId);
  
  if (!order) {
    throw new Error('Order not found');
  }
  
  order.status = status;
  
  if (status === 'preparing') {
    order.estimatedReadyTime = new Date(Date.now() + 15 * 60 * 1000);
  }
  
  return order;
}

/**
 * Get vendor stats
 */
export async function mockGetVendorStats(vendorId: string): Promise<MockVendorStats> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    todayOrders: 12,
    todayRevenue: 1450,
    weekOrders: 78,
    weekRevenue: 9850,
    monthOrders: 342,
    monthRevenue: 42500,
    averageOrderValue: 124,
    popularItems: [
      { name: 'Quarter Chicken & Chips', count: 45 },
      { name: 'Chicken Burger', count: 38 },
      { name: 'Full Chicken', count: 22 },
    ],
  };
}
