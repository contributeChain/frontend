/**
 * Contract addresses configuration for Lens Alchemy
 * Focused only on Lens environments
 */

import { useNetworkStore } from './network';

// Network environment type
export type NetworkEnvironment = 'mainnet' | 'testnet';

// Default network from environment variables
export const DEFAULT_NETWORK: NetworkEnvironment = 
  (import.meta.env.VITE_NEXT_PUBLIC_NETWORK as NetworkEnvironment) || 'testnet';

// Contract addresses for each network
export const CONTRACT_ADDRESSES = {
  // NFT contract addresses
  NFT_CONTRACT: {
    mainnet: '0xEA03fAF9Ade0c1cB5E4fEB5b1316f039b385f39B',
    testnet: '0x31F8fC3Bcada00d64ce6bB3D4D22d9814530feD8',
  },
  
  // Lens app addresses
  LENS_APP: {
    mainnet: '0xdB055861b6E31Ad9624a913923A7BbCD88808668',
    testnet: '0x64F4b7D86Aca0f23856F29cE67fC8Cf049d786A4',
  }
};

// Get NFT contract address based on current network
export function getNftContractAddress(): string {
  const { network } = useNetworkStore.getState();
  return CONTRACT_ADDRESSES.NFT_CONTRACT[network];
}

// Get Lens app address based on current network
export function getLensAppAddress(): string {
  const { network } = useNetworkStore.getState();
  return CONTRACT_ADDRESSES.LENS_APP[network];
}

// Get all contract addresses for current network
export function getContractAddresses() {
  const { network } = useNetworkStore.getState();
  
  return {
    nftContract: CONTRACT_ADDRESSES.NFT_CONTRACT[network],
    lensApp: CONTRACT_ADDRESSES.LENS_APP[network],
    network,
  };
} 