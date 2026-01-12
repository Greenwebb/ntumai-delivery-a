
import { create } from 'zustand';
import { createPersistentStore } from './utils/persistent-store';

export interface Notification {
  id: string;
  userId: string;
  type: 'order_update' | 'delivery' | 'promotion' | 'system';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

interface NotificationStore extends NotificationState {
  // Notification actions
  fetchNotifications: (userId: string, limit?: number) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  addNotification: (notification: Notification) => void;

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

export const useNotificationStore = create<NotificationStore>()(
  createPersistentStore(
    (set, get) => ({
      ...initialState,

      fetchNotifications: async (userId: string, limit: number = 20) => {
        try {
          set({ isLoading: true, error: null });
          // TODO: Replace with tRPC call
          // const notifications = await trpc.notifications.getAll.query({ userId, limit });
          // const unreadCount = notifications.filter((n) => !n.isRead).length;
          // set({ notifications, unreadCount, isLoading: false });
          
          // Mock data for now
          set({ notifications: [], unreadCount: 0, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      markAsRead: async (notificationId: string) => {
        try {
          // TODO: Replace with tRPC call
          // await trpc.notifications.markAsRead.mutate({ notificationId });
          
          set((state) => {
            const updated = state.notifications.map((n) =>
              n.id === notificationId ? { ...n, isRead: true } : n
            );
            const unreadCount = updated.filter((n) => !n.isRead).length;
            return { notifications: updated, unreadCount };
          });
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      markAllAsRead: async (userId: string) => {
        try {
          // TODO: Replace with tRPC call
          // await trpc.notifications.markAllAsRead.mutate({ userId });
          
          set((state) => {
            const updated = state.notifications.map((n) => ({ ...n, isRead: true }));
            return { notifications: updated, unreadCount: 0 };
          });
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      deleteNotification: async (notificationId: string) => {
        try {
          // TODO: Replace with tRPC call
          // await trpc.notifications.delete.mutate({ notificationId });
          
          set((state) => {
            const updated = state.notifications.filter((n) => n.id !== notificationId);
            const unreadCount = updated.filter((n) => !n.isRead).length;
            return { notifications: updated, unreadCount };
          });
        } catch (error: any) {
          set({ error: error.message });
        }
      },

      addNotification: (notification: Notification) => {
        set((state) => {
          const exists = state.notifications.some((n) => n.id === notification.id);
          if (exists) return state;

          const notifications = [notification, ...state.notifications];
          const unreadCount = notifications.filter((n) => !n.isRead).length;
          return { notifications, unreadCount };
        });
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
      name: 'notification-store',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
      }),
    }
  )
);
