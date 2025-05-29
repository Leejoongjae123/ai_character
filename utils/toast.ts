'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';

interface ToastOptions {
  title?: string;
  description?: string;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function useToast() {
  const showToast = useCallback((options: ToastOptions) => {
    const { title, description, type = 'default', duration = 5000, action } = options;
    
    const message = title || '';
    const toastOptions = {
      description,
      duration,
      action,
    };

    switch (type) {
      case 'success':
        toast.success(message, toastOptions);
        break;
      case 'error':
        toast.error(message, toastOptions);
        break;
      case 'warning':
        toast.warning(message, toastOptions);
        break;
      case 'info':
        toast.info(message, toastOptions);
        break;
      default:
        toast(message, toastOptions);
        break;
    }
  }, []);

  const success = useCallback((title: string, description?: string) => {
    showToast({
      title,
      description,
      type: 'success',
    });
  }, [showToast]);

  const error = useCallback((title: string, description?: string) => {
    showToast({
      title,
      description,
      type: 'error',
    });
  }, [showToast]);

  const warning = useCallback((title: string, description?: string) => {
    showToast({
      title,
      description,
      type: 'warning',
    });
  }, [showToast]);

  const info = useCallback((title: string, description?: string) => {
    showToast({
      title,
      description,
      type: 'info',
    });
  }, [showToast]);

  return {
    showToast,
    success,
    error,
    warning,
    info,
  };
} 