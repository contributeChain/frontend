import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  polygon,
  base,
  zora,
} from 'wagmi/chains';
import { http } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';

// Create a client for tanstack query
const queryClient = new QueryClient();

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || "lens-alchemy-project";

// New configuration using RainbowKit's getDefaultConfig
const config = getDefaultConfig({
  appName: 'Lens Alchemy',
  projectId,
  chains: [mainnet, polygon, base, zora],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
    [zora.id]: http(),
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
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 