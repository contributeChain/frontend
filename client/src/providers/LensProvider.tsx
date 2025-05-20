import { ReactNode } from 'react';
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lensProvider, networkConfig } from '@/lib/lensClient';

interface LensProviderProps {
  children: ReactNode;
}

// Create wagmi config for Lens Chain
const config = createConfig({
  chains: [networkConfig],
  transports: {
    [networkConfig.id]: http(networkConfig.rpcUrls.default.http[0]),
  },
});

// Create React Query client
const queryClient = new QueryClient();

export function LensProvider({ children }: LensProviderProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
} 