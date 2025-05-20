import { ReactNode } from 'react';
import { WagmiProvider, createConfig, http } from "wagmi";
import { networkConfig } from '@/lib/lensClient';

interface LensProviderProps {
  children: ReactNode;
}

// Create wagmi config for Lens Chain
const config = createConfig({
  chains: [networkConfig],
  transports: {
    [networkConfig.id]: http(networkConfig.rpcUrls.default.http[0]),
  }
});

export function LensProvider({ children }: LensProviderProps) {
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  );
} 