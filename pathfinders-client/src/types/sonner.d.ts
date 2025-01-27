declare module 'sonner' {
  interface ToastOptions {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    duration?: number;
  }

  interface Toast {
    (message: string, options?: ToastOptions): void;
    error(message: string, options?: ToastOptions): void;
    success(message: string, options?: ToastOptions): void;
    warning(message: string, options?: ToastOptions): void;
    info(message: string, options?: ToastOptions): void;
  }

  export const Toaster: React.FC<ToastOptions>;
  export const toast: Toast;
} 