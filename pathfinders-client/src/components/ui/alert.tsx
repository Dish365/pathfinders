import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'rounded-lg border p-4',
          {
            'bg-destructive/15 text-destructive border-destructive/50': variant === 'destructive',
            'bg-background text-foreground': variant === 'default',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Alert.displayName = 'Alert'; 