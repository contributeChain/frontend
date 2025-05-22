import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import {
  mainnet,
  polygon,
  base,
  zora,
  lens,
  lensTestnet,
} from 'wagmi/chains';
import { HelmetProvider } from 'react-helmet-async';
import LensProvider from './LensProvider';

// Create a client for tanstack query
const queryClient = new QueryClient();

// Get WalletConnect project ID from environment variables
declare global {
  interface ImportMetaEnv {
    VITE_WALLET_CONNECT_PROJECT_ID: string;
  }
}

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || "095afbef7b1e67019b7de4bd59e951fd";

// Configuration using ConnectKit's getDefaultConfig
const config = createConfig(
  getDefaultConfig({
    appName: 'Lens Alchemy',
    chains: [mainnet, polygon, base, zora, lens, lensTestnet],
    transports: {
      [mainnet.id]: http(),
      [polygon.id]: http(),
      [base.id]: http(),
      [zora.id]: http(),
      [lens.id]: http(),
      [lensTestnet.id]: http(),
    },
    walletConnectProjectId: projectId,
    
    // Optional App Info
    appDescription: "Connect developers with on-chain credentials",
    appUrl: "https://lens-alchemy.com",
    appIcon: "https://lens-alchemy.com/icon.png",
  }),
);

interface InfrastructureProvidersProps {
  children: ReactNode;
}

export function InfrastructureProviders({ children }: InfrastructureProvidersProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider mode="auto">
          <HelmetProvider>
            <LensProvider>
              {children}
            </LensProvider>
          </HelmetProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 