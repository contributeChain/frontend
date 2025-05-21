import { ethers } from "ethers";

// Add Ethereum to window type
declare global {
  interface Window {
    ethereum?: any; // Use 'any' to avoid type conflicts with different metamask versions
  }
}

// Define the interface for a simple NFT
export interface NFT {
  id: number;
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: string; // Changed from enum to string to be compatible with Grove NFT type
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

// Function to mint an NFT using Grove storage
export async function mintNFT(metadata: any): Promise<{ success: boolean; transactionHash?: string; tokenId?: string }> {
  try {
    if (!metadata || !metadata.name || !metadata.description || !metadata.walletAddress) {
      throw new Error('Missing required NFT metadata');
    }

    // Import dynamically to avoid circular dependencies
    const { addNFTToCollection, getUserByWalletAddress } = await import('./grove-service');
    
    // Generate a unique token ID
    const tokenId = `NFT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const transactionHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    // Find the user ID for this wallet
    const user = await getUserByWalletAddress(metadata.walletAddress);
    
    if (!user) {
      console.error('Cannot mint NFT: No user found for wallet address', metadata.walletAddress);
      return { success: false };
    }
    
    // Create the NFT object
    const newNft: any = {
      id: Date.now(),
      userId: user.id,
      tokenId,
      name: metadata.name,
      description: metadata.description,
      imageUrl: metadata.imageUrl || 'https://example.com/placeholder.png',
      rarity: metadata.rarity || 'common',
      repoName: metadata.repoName,
      mintedAt: new Date(),
      transactionHash,
      metadata: metadata
    };
    
    // Add the NFT to the Grove collection
    const success = await addNFTToCollection(newNft, metadata.walletAddress as `0x${string}`);
    
    if (!success) {
      throw new Error('Failed to add NFT to Grove collection');
    }
    
    return {
      success: true,
      transactionHash,
      tokenId,
    };
  } catch (error) {
    console.error('Error minting NFT:', error);
    return { success: false };
  }
}

// Mock function to fetch NFTs for a wallet
export async function fetchNFTsForWallet(walletAddress: string): Promise<NFT[]> {
  try {
    // Import dynamically to avoid circular dependencies
    const { fetchNFTs, getNFTsByUserId, getUserByWalletAddress } = await import('./grove-service');
    
    if (!walletAddress) {
      console.error('No wallet address provided to fetchNFTsForWallet');
      return [];
    }

    // First check if this wallet belongs to a registered user
    const user = await getUserByWalletAddress(walletAddress);
    
    if (user) {
      // If user found, get their specific NFTs
      return await getNFTsByUserId(user.id);
    }
    
    // Fallback: just return an empty array since the wallet has no registered user
    return [];
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
}
// These functions are now moved to github-utils.ts
