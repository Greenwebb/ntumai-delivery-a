
import { create } from 'zustand';
import { createPersistentStore } from './utils/persistent-store';

export interface Transaction {
  id: string;
  type: 'debit' | 'credit';
  amount: number;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'cash' | 'paypal' | 'mobile_money';
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

interface WalletState {
  balance: number;
  currency: string;
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: PaymentMethod | null;
  isLoading: boolean;
  error: string | null;
}

interface WalletStore extends WalletState {
  // Wallet actions
  getWalletBalance: (userId: string) => Promise<void>;
  getTransactions: (userId: string, limit?: number) => Promise<void>;
  addFunds: (userId: string, amount: number, paymentMethod: string) => Promise<void>;
  withdrawFunds: (userId: string, amount: number, bankAccount: any) => Promise<void>;

  // Payment method actions
  getPaymentMethods: (userId: string) => Promise<void>;
  addPaymentMethod: (userId: string, methodData: any) => Promise<void>;
  selectPaymentMethod: (method: PaymentMethod) => void;
  deletePaymentMethod: (methodId: string) => void;

  // Payment actions
  initiatePayment: (orderId: string, amount: number, paymentMethod: string) => Promise<any>;
  confirmPayment: (paymentId: string) => Promise<void>;

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: WalletState = {
  balance: 0,
  currency: 'ZMW',
  transactions: [],
  paymentMethods: [],
  selectedPaymentMethod: null,
  isLoading: false,
  error: null,
};

export const useWalletStore = create<WalletStore>()(
  createPersistentStore(
    (set, get) => ({
      ...initialState,

      // Wallet actions
      getWalletBalance: async (userId: string) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // const { balance, currency } = await trpc.wallet.getBalance.query({ userId });
          // set({ balance, currency, isLoading: false });
          
          // Mock data for now
          set({ balance: 0, currency: 'ZMW', isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      getTransactions: async (userId: string, limit: number = 20) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // const transactions = await trpc.wallet.getTransactions.query({ userId, limit });
          // set({ transactions, isLoading: false });
          
          // Mock data for now
          set({ transactions: [], isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      addFunds: async (userId: string, amount: number, paymentMethod: string) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // const result = await trpc.wallet.addFunds.mutate({ userId, amount, paymentMethod });
          // set((state) => ({
          //   balance: state.balance + amount,
          //   isLoading: false,
          // }));
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      withdrawFunds: async (userId: string, amount: number, bankAccount: any) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // await trpc.wallet.withdrawFunds.mutate({ userId, amount, bankAccount });
          // set((state) => ({
          //   balance: state.balance - amount,
          //   isLoading: false,
          // }));
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      // Payment method actions
      getPaymentMethods: async (userId: string) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // const paymentMethods = await trpc.wallet.getPaymentMethods.query({ userId });
          // set({ paymentMethods, isLoading: false });
          
          // Mock data for now
          set({ paymentMethods: [], isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      addPaymentMethod: async (userId: string, methodData: any) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // const method = await trpc.wallet.addPaymentMethod.mutate({ userId, ...methodData });
          // set((state) => ({
          //   paymentMethods: [...state.paymentMethods, method],
          //   isLoading: false,
          // }));
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      selectPaymentMethod: (method: PaymentMethod) => {
        set({ selectedPaymentMethod: method });
      },

      deletePaymentMethod: (methodId: string) => {
        set((state) => ({
          paymentMethods: state.paymentMethods.filter((method) => method.id !== methodId),
          selectedPaymentMethod:
            state.selectedPaymentMethod?.id === methodId ? null : state.selectedPaymentMethod,
        }));
      },

      // Payment actions
      initiatePayment: async (orderId: string, amount: number, paymentMethod: string) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // const payment = await trpc.payments.initiate.mutate({ orderId, amount, paymentMethod });
          // set({ isLoading: false });
          // return payment;
          
          set({ isLoading: false });
          return null;
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          return null;
        }
      },

      confirmPayment: async (paymentId: string) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // await trpc.payments.confirm.mutate({ paymentId });
          set({ isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error, isLoading: false });
      },

      clearError: () => {
        set({ error: null });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'wallet-store',
      partialize: (state) => ({
        balance: state.balance,
        currency: state.currency,
        paymentMethods: state.paymentMethods,
        selectedPaymentMethod: state.selectedPaymentMethod,
      }),
    }
  )
);
