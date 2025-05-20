import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useToast, ToastVariant } from './use-toast';

interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  onDismiss: (id: string) => void;
}

function Toast({ id, title, description, variant = 'default', onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  const variantClasses = {
    default: 'bg-background border',
    destructive: 'bg-destructive text-destructive-foreground border-destructive',
    success: 'bg-green-500 text-white border-green-600',
  };

  return (
    <div
      className={cn(
        'w-full max-w-sm rounded-lg shadow-lg transition-all duration-300 transform',
        variantClasses[variant],
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      )}
    >
      <div className="p-4 relative">
        {title && <h4 className="font-medium text-sm">{title}</h4>}
        {description && <p className="text-sm opacity-90 mt-1">{description}</p>}
        <button
          onClick={() => onDismiss(id)}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onDismiss={dismiss}
        />
      ))}
    </div>
  );
}
