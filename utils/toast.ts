'use client';

import { useCallback } from 'react';
import { addToast } from '@heroui/toast';

interface ToastOptions {
  title?: string;
  description?: string;
  color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  variant?: 'solid' | 'bordered' | 'flat';
  timeout?: number;
  hideCloseButton?: boolean;
  icon?: React.ReactNode;
}

export function useToast() {
  const showToast = useCallback((options: ToastOptions) => {
    addToast({
      title: options.title,
      description: options.description,
      color: options.color || 'primary',
      variant: options.variant || 'flat',
      timeout: options.timeout || 5000,
      hideCloseButton: options.hideCloseButton || false,
      icon: options.icon,
    });
  }, []);

  const success = useCallback((title: string, description?: string) => {
    showToast({
      title,
      description,
      color: 'success',
    });
  }, [showToast]);

  const error = useCallback((title: string, description?: string) => {
    showToast({
      title,
      description,
      color: 'danger',
    });
  }, [showToast]);

  const warning = useCallback((title: string, description?: string) => {
    showToast({
      title,
      description,
      color: 'warning',
    });
  }, [showToast]);

  const info = useCallback((title: string, description?: string) => {
    showToast({
      title,
      description,
      color: 'primary',
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