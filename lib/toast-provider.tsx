// @ts-nocheck
import React, { createContext, useContext, useState, useCallback } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast, ToastConfig, ToastType } from '@/components/ui/toast';

interface ToastContextValue {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);
  const insets = useSafeAreaInsets();

  const showToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastConfig = { id, type, message, duration };
    
    setToasts((prev) => {
      if (prev.length >= 3) {
        return [...prev.slice(1), newToast];
      }
      return [...prev, newToast];
    });
  }, []);

  const handleDismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const value: ToastContextValue = {
    showToast,
    success: (message, duration) => showToast('success', message, duration),
    error: (message, duration) => showToast('error', message, duration),
    warning: (message, duration) => showToast('warning', message, duration),
    info: (message, duration) => showToast('info', message, duration),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View 
        className="absolute left-0 right-0 z-[9999]" 
        style={{ top: insets.top }}
        pointerEvents="box-none"
      >
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onDismiss={handleDismiss} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}
