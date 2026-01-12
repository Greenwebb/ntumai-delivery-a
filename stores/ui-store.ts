import { create } from 'zustand';

interface UIState {
  // Loading states
  isLoading: boolean;
  loadingMessage: string | null;

  // Error states
  error: string | null;
  errorTitle: string | null;

  // Network states
  isOnline: boolean;
  showOfflineBanner: boolean;

  // Modal states
  isModalOpen: boolean;
  modalContent: React.ReactNode | null;

  // Toast/Snackbar states
  showToast: boolean;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info' | 'warning' | null;

  // Actions
  setLoading: (loading: boolean, message?: string) => void;
  setError: (error: string | null, title?: string) => void;
  clearError: () => void;
  setOnline: (online: boolean) => void;
  setOfflineBanner: (show: boolean) => void;
  openModal: (content: React.ReactNode) => void;
  closeModal: () => void;
  showToastMessage: (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ) => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  isLoading: false,
  loadingMessage: null,
  error: null,
  errorTitle: null,
  isOnline: true,
  showOfflineBanner: false,
  isModalOpen: false,
  modalContent: null,
  showToast: false,
  toastMessage: null,
  toastType: null,

  // Actions
  setLoading: (loading, message = null) => {
    set({
      isLoading: loading,
      loadingMessage: message,
    });
  },

  setError: (error, title = null) => {
    set({
      error,
      errorTitle: title,
    });
  },

  clearError: () => {
    set({
      error: null,
      errorTitle: null,
    });
  },

  setOnline: (online) => {
    set({
      isOnline: online,
      showOfflineBanner: !online,
    });
  },

  setOfflineBanner: (show) => {
    set({
      showOfflineBanner: show,
    });
  },

  openModal: (content) => {
    set({
      isModalOpen: true,
      modalContent: content,
    });
  },

  closeModal: () => {
    set({
      isModalOpen: false,
      modalContent: null,
    });
  },

  showToastMessage: (message, type) => {
    set({
      showToast: true,
      toastMessage: message,
      toastType: type,
    });

    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      set({
        showToast: false,
        toastMessage: null,
        toastType: null,
      });
    }, 3000);
  },

  hideToast: () => {
    set({
      showToast: false,
      toastMessage: null,
      toastType: null,
    });
  },
}));
