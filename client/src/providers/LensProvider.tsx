import { ReactNode } from 'react';
import { networkConfig } from '@/lib/lensClient';

interface LensProviderProps {
  children: ReactNode;
}

export function LensProvider({ children }: LensProviderProps) {
  // Instead of creating another WagmiProvider, we'll just render children
  // The Lens configuration should be integrated into the main WagmiProvider in Providers.tsx
  return <>{children}</>;
} 