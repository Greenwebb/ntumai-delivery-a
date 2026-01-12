// @ts-nocheck

// Payment API endpoints
import { apiClient } from './client';
import {
  ApiResponse,
  ListResponse,
  PaymentMethod,
  PaymentIntent,
  PaginationParams,
} from './types';
import { API_ENDPOINTS } from './config';

// Payment service class
export class PaymentService {
  // Get user's payment methods
  async getPaymentMethods(): Promise<ApiResponse<PaymentMethod[]>> {
    return apiClient.get<PaymentMethod[]>(API_ENDPOINTS.PAYMENTS.METHODS, {
      cache: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
    });
  }

  // Add new payment method
  async addPaymentMethod(paymentData: {
    type: 'card' | 'paypal' | 'apple_pay' | 'google_pay' | 'bank_account';
    cardNumber?: string;
    expiryMonth?: number;
    expiryYear?: number;
    cvv?: string;
    cardholderName?: string;
    billingAddress?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    paypalEmail?: string;
    bankAccountNumber?: string;
    routingNumber?: string;
    accountHolderName?: string;
    isDefault?: boolean;
  }): Promise<ApiResponse<PaymentMethod>> {
    return apiClient.post<PaymentMethod>(API_ENDPOINTS.PAYMENTS.ADD_METHOD, paymentData, {
      cache: false,
    });
  }

  // Update payment method
  async updatePaymentMethod(
    methodId: string,
    updates: {
      expiryMonth?: number;
      expiryYear?: number;
      cardholderName?: string;
      billingAddress?: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
      isDefault?: boolean;
    }
  ): Promise<ApiResponse<PaymentMethod>> {
    return apiClient.put<PaymentMethod>(
      `${API_ENDPOINTS.PAYMENTS.METHODS}/${methodId}`,
      updates,
      {
        cache: false,
      }
    );
  }

  // Delete payment method
  async deletePaymentMethod(methodId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.PAYMENTS.METHODS}/${methodId}`, {
      cache: false,
    });
  }

  // Set default payment method
  async setDefaultPaymentMethod(methodId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(
      `${API_ENDPOINTS.PAYMENTS.METHODS}/${methodId}/set-default`,
      {},
      {
        cache: false,
      }
    );
  }

  // Create payment intent
  async createPaymentIntent(paymentData: {
    amount: number;
    currency: string;
    paymentMethodId: string;
    orderId?: string;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<PaymentIntent>> {
    return apiClient.post<PaymentIntent>(API_ENDPOINTS.PAYMENTS.CREATE_INTENT, paymentData, {
      cache: false,
    });
  }

  // Confirm payment intent
  async confirmPaymentIntent(
    intentId: string,
    confirmationData?: {
      paymentMethodId?: string;
      billingDetails?: {
        name?: string;
        email?: string;
        phone?: string;
        address?: {
          line1: string;
          line2?: string;
          city: string;
          state: string;
          postal_code: string;
          country: string;
        };
      };
    }
  ): Promise<ApiResponse<PaymentIntent>> {
    return apiClient.post<PaymentIntent>(
      `${API_ENDPOINTS.PAYMENTS.INTENTS}/${intentId}/confirm`,
      confirmationData,
      {
        cache: false,
      }
    );
  }

  // Cancel payment intent
  async cancelPaymentIntent(intentId: string): Promise<ApiResponse<PaymentIntent>> {
    return apiClient.post<PaymentIntent>(
      `${API_ENDPOINTS.PAYMENTS.INTENTS}/${intentId}/cancel`,
      {},
      {
        cache: false,
      }
    );
  }

  // Get payment intent status
  async getPaymentIntent(intentId: string): Promise<ApiResponse<PaymentIntent>> {
    return apiClient.get<PaymentIntent>(`${API_ENDPOINTS.PAYMENTS.INTENTS}/${intentId}`, {
      cache: false,
    });
  }

  // Process refund
  async processRefund(
    paymentId: string,
    refundData: {
      amount?: number; // If not provided, full refund
      reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'other';
      description?: string;
    }
  ): Promise<ApiResponse<{
    refundId: string;
    amount: number;
    status: 'pending' | 'succeeded' | 'failed';
    reason?: string;
    description?: string;
    estimatedArrival?: string;
  }>> {
    return apiClient.post(
      `${API_ENDPOINTS.PAYMENTS.REFUNDS}`,
      { paymentId, ...refundData },
      {
        cache: false,
      }
    );
  }

  // Get refund status
  async getRefund(refundId: string): Promise<ApiResponse<{
    id: string;
    amount: number;
    status: 'pending' | 'succeeded' | 'failed';
    reason?: string;
    description?: string;
    createdAt: string;
    processedAt?: string;
    estimatedArrival?: string;
  }>> {
    return apiClient.get(`${API_ENDPOINTS.PAYMENTS.REFUNDS}/${refundId}`, {
      cache: true,
      cacheTimeout: 2 * 60 * 1000, // 2 minutes
    });
  }

  // Get payment history
  async getPaymentHistory(
    params?: PaginationParams & {
      startDate?: string;
      endDate?: string;
      status?: 'succeeded' | 'pending' | 'failed' | 'cancelled';
      type?: 'payment' | 'refund';
    }
  ): Promise<ApiResponse<ListResponse<{
    id: string;
    type: 'payment' | 'refund';
    amount: number;
    currency: string;
    status: string;
    description?: string;
    orderId?: string;
    paymentMethod: {
      type: string;
      last4?: string;
      brand?: string;
    };
    createdAt: string;
    processedAt?: string;
  }>>> {
    return apiClient.get<ListResponse<any>>(API_ENDPOINTS.PAYMENTS.HISTORY, {
      params,
      cache: true,
      cacheTimeout: 3 * 60 * 1000, // 3 minutes
    });
  }

  // Validate payment method
  async validatePaymentMethod(methodData: {
    type: 'card' | 'bank_account';
    cardNumber?: string;
    expiryMonth?: number;
    expiryYear?: number;
    cvv?: string;
    bankAccountNumber?: string;
    routingNumber?: string;
  }): Promise<ApiResponse<{
    isValid: boolean;
    errors?: string[];
    cardBrand?: string;
    bankName?: string;
  }>> {
    return apiClient.post(API_ENDPOINTS.PAYMENTS.VALIDATE_METHOD, methodData, {
      cache: false,
    });
  }

  // Get supported payment methods
  async getSupportedPaymentMethods(): Promise<ApiResponse<{
    cards: {
      supported: boolean;
      brands: string[];
    };
    digitalWallets: {
      applePay: boolean;
      googlePay: boolean;
      paypal: boolean;
    };
    bankTransfer: {
      supported: boolean;
      countries: string[];
    };
    buyNowPayLater: {
      klarna: boolean;
      afterpay: boolean;
      affirm: boolean;
    };
  }>> {
    return apiClient.get(API_ENDPOINTS.PAYMENTS.SUPPORTED_METHODS, {
      cache: true,
      cacheTimeout: 60 * 60 * 1000, // 1 hour
    });
  }

  // Calculate payment fees
  async calculatePaymentFees(
    amount: number,
    paymentMethodType: string,
    currency: string = 'USD'
  ): Promise<ApiResponse<{
    processingFee: number;
    platformFee: number;
    totalFees: number;
    netAmount: number;
  }>> {
    return apiClient.get(API_ENDPOINTS.PAYMENTS.CALCULATE_FEES, {
      params: {
        amount,
        paymentMethodType,
        currency,
      },
      cache: true,
      cacheTimeout: 10 * 60 * 1000, // 10 minutes
    });
  }

  // Setup payment subscription (for premium features)
  async createSubscription(subscriptionData: {
    planId: string;
    paymentMethodId: string;
    trialDays?: number;
    promoCode?: string;
  }): Promise<ApiResponse<{
    subscriptionId: string;
    status: 'active' | 'trialing' | 'past_due' | 'cancelled';
    currentPeriodStart: string;
    currentPeriodEnd: string;
    trialEnd?: string;
  }>> {
    return apiClient.post(API_ENDPOINTS.PAYMENTS.SUBSCRIPTIONS, subscriptionData, {
      cache: false,
    });
  }

  // Update subscription
  async updateSubscription(
    subscriptionId: string,
    updates: {
      planId?: string;
      paymentMethodId?: string;
      promoCode?: string;
    }
  ): Promise<ApiResponse<any>> {
    return apiClient.put(
      `${API_ENDPOINTS.PAYMENTS.SUBSCRIPTIONS}/${subscriptionId}`,
      updates,
      {
        cache: false,
      }
    );
  }

  // Cancel subscription
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<ApiResponse<any>> {
    return apiClient.post(
      `${API_ENDPOINTS.PAYMENTS.SUBSCRIPTIONS}/${subscriptionId}/cancel`,
      { cancelAtPeriodEnd },
      {
        cache: false,
      }
    );
  }

  // Get subscription details
  async getSubscription(subscriptionId: string): Promise<ApiResponse<{
    id: string;
    status: string;
    plan: {
      id: string;
      name: string;
      amount: number;
      currency: string;
      interval: 'month' | 'year';
    };
    currentPeriodStart: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialEnd?: string;
  }>> {
    return apiClient.get(`${API_ENDPOINTS.PAYMENTS.SUBSCRIPTIONS}/${subscriptionId}`, {
      cache: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
    });
  }

  // Get available subscription plans
  async getSubscriptionPlans(): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    amount: number;
    currency: string;
    interval: 'month' | 'year';
    features: string[];
    popular?: boolean;
    trialDays?: number;
  }>>> {
    return apiClient.get(API_ENDPOINTS.PAYMENTS.PLANS, {
      cache: true,
      cacheTimeout: 30 * 60 * 1000, // 30 minutes
    });
  }

  // Apply promo code to payment
  async applyPromoCode(
    promoCode: string,
    amount: number
  ): Promise<ApiResponse<{
    isValid: boolean;
    discountAmount: number;
    discountType: 'percentage' | 'fixed';
    finalAmount: number;
    description?: string;
    expiresAt?: string;
  }>> {
    return apiClient.post(
      API_ENDPOINTS.PAYMENTS.APPLY_PROMO,
      { promoCode, amount },
      {
        cache: true,
        cacheTimeout: 2 * 60 * 1000, // 2 minutes
      }
    );
  }

  // Get payment analytics (for business users)
  async getPaymentAnalytics(
    params?: {
      startDate?: string;
      endDate?: string;
      groupBy?: 'day' | 'week' | 'month';
    }
  ): Promise<ApiResponse<{
    totalRevenue: number;
    totalTransactions: number;
    averageTransactionValue: number;
    successRate: number;
    topPaymentMethods: Array<{
      type: string;
      count: number;
      percentage: number;
    }>;
    revenueByPeriod: Array<{
      period: string;
      revenue: number;
      transactions: number;
    }>;
    refundRate: number;
    chargebackRate: number;
  }>> {
    return apiClient.get(API_ENDPOINTS.PAYMENTS.ANALYTICS, {
      params,
      cache: true,
      cacheTimeout: 15 * 60 * 1000, // 15 minutes
    });
  }

  // Setup automatic payments
  async setupAutoPay(
    paymentMethodId: string,
    settings: {
      enabled: boolean;
      minimumAmount?: number;
      maximumAmount?: number;
      frequency?: 'weekly' | 'monthly';
    }
  ): Promise<ApiResponse<void>> {
    return apiClient.post(
      API_ENDPOINTS.PAYMENTS.AUTO_PAY,
      { paymentMethodId, ...settings },
      {
        cache: false,
      }
    );
  }

  // Get auto-pay settings
  async getAutoPaySettings(): Promise<ApiResponse<{
    enabled: boolean;
    paymentMethodId?: string;
    minimumAmount?: number;
    maximumAmount?: number;
    frequency?: string;
    lastPayment?: string;
    nextPayment?: string;
  }>> {
    return apiClient.get(API_ENDPOINTS.PAYMENTS.AUTO_PAY, {
      cache: true,
      cacheTimeout: 10 * 60 * 1000, // 10 minutes
    });
  }
}

// Default payment service instance
export const paymentService = new PaymentService();

// Payment utility functions
export const paymentUtils = {
  // Format card number for display
  formatCardNumber(cardNumber: string): string {
    return cardNumber.replace(/(.{4})/g, '$1 ').trim();
  },

  // Mask card number
  maskCardNumber(cardNumber: string): string {
    if (cardNumber.length < 4) return cardNumber;
    const last4 = cardNumber.slice(-4);
    const masked = '*'.repeat(cardNumber.length - 4);
    return `${masked}${last4}`;
  },

  // Get card brand from number
  getCardBrand(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6(?:011|5)/.test(number)) return 'discover';
    if (/^(?:2131|1800|35\d{3})/.test(number)) return 'jcb';
    if (/^3(?:0[0-5]|[68])/.test(number)) return 'diners';
    
    return 'unknown';
  },

  // Validate card number using Luhn algorithm
  validateCardNumber(cardNumber: string): boolean {
    const number = cardNumber.replace(/\s/g, '');
    
    if (!/^\d+$/.test(number)) return false;
    if (number.length < 13 || number.length > 19) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  },

  // Validate expiry date
  validateExpiryDate(month: number, year: number): boolean {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    if (month < 1 || month > 12) return false;
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    
    return true;
  },

  // Validate CVV
  validateCVV(cvv: string, cardBrand: string): boolean {
    if (!/^\d+$/.test(cvv)) return false;
    
    if (cardBrand === 'amex') {
      return cvv.length === 4;
    }
    
    return cvv.length === 3;
  },

  // Format amount for display
  formatAmount(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100); // Assuming amount is in cents
  },

  // Calculate processing fee
  calculateProcessingFee(
    amount: number,
    paymentMethod: string,
    feeStructure: {
      percentage: number;
      fixed: number;
      cap?: number;
    }
  ): number {
    const percentageFee = (amount * feeStructure.percentage) / 100;
    const totalFee = percentageFee + feeStructure.fixed;
    
    if (feeStructure.cap && totalFee > feeStructure.cap) {
      return feeStructure.cap;
    }
    
    return Math.round(totalFee);
  },

  // Generate payment reference
  generatePaymentReference(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 8);
    return `PAY-${timestamp}-${random}`.toUpperCase();
  },

  // Check if payment method is expired
  isPaymentMethodExpired(expiryMonth: number, expiryYear: number): boolean {
    const now = new Date();
    const expiry = new Date(expiryYear, expiryMonth - 1);
    return expiry < now;
  },

  // Get payment method icon
  getPaymentMethodIcon(type: string, brand?: string): string {
    const iconMap: Record<string, string> = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      paypal: '🅿️',
      apple_pay: '🍎',
      google_pay: '🅖',
      bank_account: '🏦',
    };
    
    return iconMap[brand || type] || '💳';
  },

  // Validate bank account number
  validateBankAccount(accountNumber: string, routingNumber: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!/^\d{8,17}$/.test(accountNumber)) {
      errors.push('Account number must be 8-17 digits');
    }
    
    if (!/^\d{9}$/.test(routingNumber)) {
      errors.push('Routing number must be 9 digits');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};
