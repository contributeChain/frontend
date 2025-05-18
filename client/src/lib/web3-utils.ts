import { ethers } from "ethers";

// Add Ethereum to window type
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

// Define the interface for a simple NFT
export interface NFT {
  id: number;
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  repoName?: string;
  mintedAt: Date;
  transactionHash?: string;
  metadata?: Record<string, any>;
}

// Shorten address for display
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  const start = address.substring(0, chars + 2); // +2 for "0x"
  const end = address.substring(address.length - chars);
  return `${start}...${end}`;
}

// Mock wallet connection function
export async function connectWallet(): Promise<string | null> {
  // Check if window.ethereum is available
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        return accounts[0];
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  } else {
    console.error('No Ethereum provider detected. Please install MetaMask or another wallet.');
  }
  
  return null;
}

// Check wallet connection status
export async function isWalletConnected(): Promise<boolean> {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      return accounts.length > 0;
    } catch (error) {
      console.error('Error checking wallet connection:', error);
    }
  }
  
  return false;
}

// Get current wallet address
export async function getCurrentWalletAddress(): Promise<string | null> {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        return accounts[0];
      }
    } catch (error) {
      console.error('Error getting wallet address:', error);
    }
  }
  
  return null;
}

// Mock function to mint an NFT
export async function mintNFT(metadata: any): Promise<{ success: boolean; transactionHash?: string; tokenId?: string }> {
  try {
    // This would normally interact with a smart contract
    // Instead, we'll simulate success with a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      transactionHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      tokenId: Math.floor(Math.random() * 1000000).toString(),
    };
  } catch (error) {
    console.error('Error minting NFT:', error);
    return { success: false };
  }
}

// Mock function to fetch NFTs for a wallet
export async function fetchNFTsForWallet(walletAddress: string): Promise<NFT[]> {
  try {
    // This would normally fetch from the blockchain or an indexer
    // Instead, we'll fetch from our API
    const response = await fetch(`/api/nfts?walletAddress=${walletAddress}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch NFTs');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
}

// Format wallet address for display
export function formatWalletAddress(address: string, startLength = 6, endLength = 4): string {
  if (!address) return '';
  
  return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`;
}

// Add listener for account changes
export function addWalletListener(callback: (accounts: string[]) => void): void {
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', callback);
  }
}

// Remove listener for account changes
export function removeWalletListener(callback: (accounts: string[]) => void): void {
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.removeListener('accountsChanged', callback);
  }
}

// These functions are now moved to github-utils.ts
