import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'full';
}

export function Container({
  children,
  className,
  size = 'default',
}: ContainerProps) {
  const containerSize = {
    sm: 'max-w-3xl',
    default: 'max-w-5xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={cn('container px-4 mx-auto', containerSize[size], className)}>
      {children}
    </div>
  );
} 