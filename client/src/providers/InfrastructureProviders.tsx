import { ReactNode, useEffect } from 'react';
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
import { useNetworkStore, NetworkType } from '../config/network';

// Create a client for tanstack query
const queryClient = new QueryClient();

// Get WalletConnect project ID from environment variables
const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID || "095afbef7b1e67019b7de4bd59e951fd";

// Get the appropriate chain based on network
const getChain = (network: NetworkType) => {
  return network === 'mainnet' ? lens : lensTestnet;
};

interface InfrastructureProvidersProps {
  children: ReactNode;
}

export function InfrastructureProviders({ children }: InfrastructureProvidersProps) {
  // Get network from store
  const { network, setNetwork } = useNetworkStore();
  
  // Create configuration based on current network
  const config = createConfig(
    getDefaultConfig({
      appName: 'Lens Alchemy',
      // Always include both chains to allow switching
      chains: [lens, lensTestnet],
      transports: {
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

  // Handle network change when user switches chains
  useEffect(() => {
    // This effect will run when the component mounts and whenever network changes
    // Add listener or callback for chain changes here if needed
  }, [network]);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider 
          mode="auto"
          customTheme={{
            // You can add custom theme options here
          }}
          options={{
            initialChainId: getChain(network).id,
          }}
        >
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