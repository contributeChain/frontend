import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  lens,
  lensTestnet,
} from 'wagmi/chains';
import { http } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import LensProvider from './LensProvider';
import { AuthProvider } from './AuthProvider';
import { GitHubProvider } from './GitHubProvider';
import { HelmetProvider } from 'react-helmet-async';
import { GroveProvider } from './GroveProvider';

// Create a client for tanstack query
const queryClient = new QueryClient();

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || "095afbef7b1e67019b7de4bd59e951fd";

// New configuration using RainbowKit's getDefaultConfig
const config = getDefaultConfig({
  appName: 'Lens Alchemy',
  projectId,
  chains: [lens, lensTestnet],
  transports: {
    [lens.id]: http(),
    [lensTestnet.id]: http(),
  },
});

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <HelmetProvider>
            <GitHubProvider>
              <AuthProvider>
                <LensProvider>
                  <GroveProvider>
                    {children}
                  </GroveProvider>
                </LensProvider>
              </AuthProvider>
            </GitHubProvider>
          </HelmetProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 