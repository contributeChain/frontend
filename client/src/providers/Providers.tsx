import { ReactNode } from 'react';
import LensProvider from './LensProvider';
import { AuthProvider } from './AuthProvider';
import { GitHubProvider } from './GitHubProvider';
import { GroveProvider } from './GroveProvider';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <LensProvider>
      <AuthProvider>
        <GitHubProvider>
          <GroveProvider>
            {children}
          </GroveProvider>
        </GitHubProvider>
      </AuthProvider>
    </LensProvider>
  );
} 