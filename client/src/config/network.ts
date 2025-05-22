import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Network types
export type NetworkType = 'mainnet' | 'testnet';

// Default to the environment setting, fallback to testnet
const defaultNetwork = (import.meta.env.VITE_NEXT_PUBLIC_NETWORK || 'testnet') as NetworkType;

// Get the correct contract address based on network
export const getNftContractAddress = (network: NetworkType): string => {
  return network === 'mainnet' 
    ? '0xEA03fAF9Ade0c1cB5E4fEB5b1316f039b385f39B'  // Mainnet address
    : '0x31F8fC3Bcada00d64ce6bB3D4D22d9814530feD8'; // Testnet address
};

// Get the correct Lens app address based on network
export const getLensAppAddress = (network: NetworkType): string => {
  return network === 'mainnet' 
    ? '0xdB055861b6E31Ad9624a913923A7BbCD88808668'  // Mainnet address
    : '0x64F4b7D86Aca0f23856F29cE67fC8Cf049d786A4'; // Testnet address
};

// Network configuration store
interface NetworkState {
  network: NetworkType;
  setNetwork: (network: NetworkType) => void;
  nftContractAddress: string;
  lensAppAddress: string;
}

export const useNetworkStore = create<NetworkState>()(
  persist(
    (set) => ({
      network: defaultNetwork,
      setNetwork: (network: NetworkType) => 
        set(() => ({ 
          network,
          nftContractAddress: getNftContractAddress(network),
          lensAppAddress: getLensAppAddress(network),
        })),
      nftContractAddress: getNftContractAddress(defaultNetwork),
      lensAppAddress: getLensAppAddress(defaultNetwork),
    }),
    {
      name: 'network-storage',
    }
  )
);

// Utility function to get current network values
export const getNetworkConfig = () => {
  const { network, nftContractAddress, lensAppAddress } = useNetworkStore.getState();
  return {
    network,
    nftContractAddress,
    lensAppAddress,
    isMainnet: network === 'mainnet',
    isTestnet: network === 'testnet',
  };
}; 