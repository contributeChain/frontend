import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  polygon,
  base,
  zora,
  lens,
} from 'wagmi/chains';
import { http } from 'wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import { networkConfig } from '@/lib/lensClient';

// Create a client for tanstack query
const queryClient = new QueryClient();

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || "095afbef7b1e67019b7de4bd59e951fd";

// New configuration using RainbowKit's getDefaultConfig
const config = getDefaultConfig({
  appName: 'Lens Alchemy',
  projectId,
  chains: [mainnet, polygon, base, zora, lens, networkConfig],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
    [zora.id]: http(),
    [lens.id]: http(),
    [networkConfig.id]: http(networkConfig.rpcUrls.default.http[0]),
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