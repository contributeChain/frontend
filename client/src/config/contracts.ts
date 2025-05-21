/**
 * Contract addresses configuration for Lens Alchemy
 * Focused only on Lens environments
 */

export type NetworkEnvironment = 'testnet' | 'mainnet';

interface ContractAddresses {
  lensApp: string;
  nftContract: string;
}

const LENS_TESTNET_ADDRESSES: ContractAddresses = {
  lensApp: '0x64F4b7D86Aca0f23856F29cE67fC8Cf049d786A4',
  nftContract: '0x31F8fC3Bcada00d64ce6bB3D4D22d9814530feD8',
};

const LENS_MAINNET_ADDRESSES: ContractAddresses = {
  lensApp: '0xdB055861b6E31Ad9624a913923A7BbCD88808668',
  nftContract: '0xEA03fAf9Ade0c1cB5E4fEB5b1316f039b385f39B',
};

// Default to testnet for development, can be overridden via environment variable
export const DEFAULT_NETWORK: NetworkEnvironment = 
  (import.meta.env.VITE_NETWORK_ENV as NetworkEnvironment) || 'testnet';

/**
 * Get contract addresses based on Lens network environment
 */
export function getContractAddresses(network: NetworkEnvironment = DEFAULT_NETWORK): ContractAddresses {
  return network === 'mainnet' ? LENS_MAINNET_ADDRESSES : LENS_TESTNET_ADDRESSES;
}

/**
 * Get a specific contract address
 */
export function getContractAddress(
  contractKey: keyof ContractAddresses,
  network: NetworkEnvironment = DEFAULT_NETWORK
): string {
  return getContractAddresses(network)[contractKey];
}

// Export specific getters for convenience
export const getLensAppAddress = (network: NetworkEnvironment = DEFAULT_NETWORK) => 
  getContractAddress('lensApp', network);

export const getNftContractAddress = (network: NetworkEnvironment = DEFAULT_NETWORK) => 
  getContractAddress('nftContract', network); 