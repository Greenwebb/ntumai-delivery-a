// @ts-nocheck
/**
 * Mock Shared Data (Wallet, Addresses, Payments, etc.)
 */

export interface MockAddress {
  id: string;
  userId: string;
  label: string;
  address: string;
  instructions?: string;
  isDefault: boolean;
}

export interface MockPaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'mobile_money';
  label: string;
  last4?: string;
  provider?: string;
  isDefault: boolean;
}

export interface MockWalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  createdAt: Date;
}

/**
 * Mock addresses
 */
const MOCK_ADDRESSES: MockAddress[] = [
  {
    id: 'addr_001',
    userId: 'user_customer_001',
    label: 'Home',
    address: 'Plot 123, Kabulonga Road, Lusaka',
    instructions: 'Blue gate, ring the bell',
    isDefault: true,
  },
  {
    id: 'addr_002',
    userId: 'user_customer_001',
    label: 'Work',
    address: 'Office Block 5, Cairo Road, Lusaka',
    instructions: 'Reception on ground floor',
    isDefault: false,
  },
];

/**
 * Mock payment methods
 */
const MOCK_PAYMENT_METHODS: MockPaymentMethod[] = [
  {
    id: 'pm_001',
    userId: 'user_customer_001',
    type: 'mobile_money',
    label: 'MTN Mobile Money',
    provider: 'MTN',
    isDefault: true,
  },
  {
    id: 'pm_002',
    userId: 'user_customer_001',
    type: 'card',
    label: 'Visa Card',
    last4: '4242',
    isDefault: false,
  },
];

/**
 * Mock wallet transactions
 */
const MOCK_WALLET_TRANSACTIONS: MockWalletTransaction[] = [
  {
    id: 'txn_001',
    userId: 'user_customer_001',
    type: 'debit',
    amount: 140,
    description: 'Order #1234 - Hungry Lion',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: 'txn_002',
    userId: 'user_customer_001',
    type: 'credit',
    amount: 500,
    description: 'Wallet Top-up',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
];

/**
 * Get user addresses
 */
export async function mockGetAddresses(userId: string): Promise<MockAddress[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_ADDRESSES.filter(addr => addr.userId === userId);
}

/**
 * Add address
 */
export async function mockAddAddress(data: Omit<MockAddress, 'id'>): Promise<MockAddress> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const newAddress: MockAddress = {
    id: `addr_${Date.now()}`,
    ...data,
  };
  
  MOCK_ADDRESSES.push(newAddress);
  
  return newAddress;
}

/**
 * Update address
 */
export async function mockUpdateAddress(addressId: string, updates: Partial<MockAddress>): Promise<MockAddress> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const address = MOCK_ADDRESSES.find(a => a.id === addressId);
  
  if (!address) {
    throw new Error('Address not found');
  }
  
  Object.assign(address, updates);
  
  return address;
}

/**
 * Delete address
 */
export async function mockDeleteAddress(addressId: string): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const index = MOCK_ADDRESSES.findIndex(a => a.id === addressId);
  
  if (index === -1) {
    throw new Error('Address not found');
  }
  
  MOCK_ADDRESSES.splice(index, 1);
}

/**
 * Get payment methods
 */
export async function mockGetPaymentMethods(userId: string): Promise<MockPaymentMethod[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_PAYMENT_METHODS.filter(pm => pm.userId === userId);
}

/**
 * Add payment method
 */
export async function mockAddPaymentMethod(data: Omit<MockPaymentMethod, 'id'>): Promise<MockPaymentMethod> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const newPaymentMethod: MockPaymentMethod = {
    id: `pm_${Date.now()}`,
    ...data,
  };
  
  MOCK_PAYMENT_METHODS.push(newPaymentMethod);
  
  return newPaymentMethod;
}

/**
 * Get wallet balance
 */
export async function mockGetWalletBalance(userId: string): Promise<number> {
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const transactions = MOCK_WALLET_TRANSACTIONS.filter(t => t.userId === userId);
  
  const balance = transactions.reduce((sum, t) => {
    return t.type === 'credit' ? sum + t.amount : sum - t.amount;
  }, 0);
  
  return Math.max(0, balance);
}

/**
 * Get wallet transactions
 */
export async function mockGetWalletTransactions(userId: string): Promise<MockWalletTransaction[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_WALLET_TRANSACTIONS.filter(t => t.userId === userId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Top up wallet
 */
export async function mockTopUpWallet(userId: string, amount: number): Promise<MockWalletTransaction> {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const transaction: MockWalletTransaction = {
    id: `txn_${Date.now()}`,
    userId,
    type: 'credit',
    amount,
    description: 'Wallet Top-up',
    createdAt: new Date(),
  };
  
  MOCK_WALLET_TRANSACTIONS.push(transaction);
  
  return transaction;
}
