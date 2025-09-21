// lib/contexts/ToastContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  customIcon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, newToast.duration);
    }
  }, [hideToast]);

  const success = useCallback((title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  }, [showToast]);

  const error = useCallback((title: string, message?: string) => {
    showToast({ type: 'error', title, message });
  }, [showToast]);

  const warning = useCallback((title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  }, [showToast]);

  const info = useCallback((title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast, success, error, warning, info }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast, index) => (
        <ToastItem key={toast.id} toast={toast} index={index} />
      ))}
    </div>
  );
}

function ToastItem({ toast, index }: { toast: Toast; index: number }) {
  const { hideToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [progress, setProgress] = useState(100);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      hideToast(toast.id);
    }, 300);
  }, [hideToast, toast.id]);

  useEffect(() => {
    // Trigger enter animation with staggered delay
    const timer = setTimeout(() => setIsVisible(true), 50 + index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, toast.duration! - elapsed);
      const progressPercent = (remaining / toast.duration!) * 100;
      setProgress(progressPercent);

      if (remaining <= 0) {
        clearInterval(interval);
        handleClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast.duration, handleClose]);

  const getIcon = () => {
    if (toast.customIcon) {
      return toast.customIcon;
    }
    
    const iconProps = { className: "w-5 h-5 flex-shrink-0" };
    switch (toast.type) {
      case 'success':
        return <CheckCircle {...iconProps} className="w-5 h-5 flex-shrink-0 text-emerald-500" />;
      case 'error':
        return <XCircle {...iconProps} className="w-5 h-5 flex-shrink-0 text-red-500" />;
      case 'warning':
        return <AlertCircle {...iconProps} className="w-5 h-5 flex-shrink-0 text-amber-500" />;
      case 'info':
        return <Info {...iconProps} className="w-5 h-5 flex-shrink-0 text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          border: 'border-emerald-200',
          bg: 'bg-gradient-to-r from-emerald-50 to-white',
          accent: 'border-l-emerald-500'
        };
      case 'error':
        return {
          border: 'border-red-200',
          bg: 'bg-gradient-to-r from-red-50 to-white',
          accent: 'border-l-red-500'
        };
      case 'warning':
        return {
          border: 'border-amber-200',
          bg: 'bg-gradient-to-r from-amber-50 to-white',
          accent: 'border-l-amber-500'
        };
      case 'info':
        return {
          border: 'border-blue-200',
          bg: 'bg-gradient-to-r from-blue-50 to-white',
          accent: 'border-l-blue-500'
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`relative overflow-hidden ${styles.bg} ${styles.border} ${styles.accent} border border-l-4 rounded-xl shadow-lg backdrop-blur-sm pointer-events-auto transform transition-all duration-500 ease-out ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100 scale-100 rotate-0'
          : 'translate-x-full opacity-0 scale-95 rotate-1'
      }`}
      style={{ 
        animationDelay: `${index * 100}ms`,
        transform: isVisible && !isLeaving 
          ? 'translateX(0) scale(1) rotate(0deg)' 
          : 'translateX(100%) scale(0.95) rotate(1deg)'
      }}
    >
      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/5">
          <div
            className={`h-full transition-all duration-100 ease-linear ${
              toast.type === 'success' ? 'bg-emerald-400' :
              toast.type === 'error' ? 'bg-red-400' :
              toast.type === 'warning' ? 'bg-amber-400' :
              'bg-blue-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 mb-1">
              {toast.title}
            </h4>
            {toast.message && (
              <p className="text-sm text-slate-600 leading-relaxed">
                {toast.message}
              </p>
            )}
            {toast.action && (
              <div className="mt-3">
                <button
                  onClick={toast.action.onClick}
                  className="text-sm font-medium px-3 py-1 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 bg-black/5 hover:bg-black/10 text-slate-700"
                >
                  {toast.action.label}
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-all duration-200 hover:scale-110 active:scale-90 p-1 rounded-lg hover:bg-black/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-2 right-2 w-1 h-1 bg-white/20 rounded-full animate-pulse" style={{ animationDelay: '0s' }} />
      <div className="absolute top-3 right-4 w-0.5 h-0.5 bg-white/10 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
    </div>
  );
}