import { getNftContractAddress } from '@/config/contracts';
import { Alchemy, Network } from 'alchemy-sdk';

// Initialize Alchemy SDK
const config = {
  apiKey: process.env.VITE_PUBLIC_ALCHEMY_API_KEY || '',
  network: Network.BASE_MAINNET,
};

const alchemy = new Alchemy(config);

// Interface for NFT Collection
export interface NFTCollection {
  name: string;
  symbol: string;
  totalSupply: number;
  contractAddress: string;
  tokenType: string;
  floorPrice?: number;
  imageUrl?: string;
}

// Interface for NFT Item
export interface NFTItem {
  tokenId: string;
  contractAddress: string;
  name: string;
  description: string;
  imageUrl: string;
  attributes: any[];
  tokenType: string;
  tokenUri?: string;
  media?: any[];
  timeLastUpdated: string;
  rarity?: {
    score?: number;
    rank?: number;
    totalSupply?: number;
  };
}

/**
 * Get all NFTs owned by an address
 * @param ownerAddress The wallet address to get NFTs for
 * @returns Array of NFT items
 */
export async function getNFTsByOwner(ownerAddress: string): Promise<NFTItem[]> {
  try {
    const contractAddress = getNftContractAddress() as `0x${string}`;
    const nfts = await alchemy.nft.getNftsForOwner(ownerAddress,{contractAddresses:[contractAddress]});
    
    return nfts.ownedNfts.map(nft => ({
      tokenId: nft.tokenId,
      contractAddress: nft.contract.address,
      name: nft.name || 'Unnamed NFT',
      description: nft.description || '',
      imageUrl: nft.image?.cachedUrl || nft.image?.originalUrl || nft.image?.pngUrl || nft.image?.thumbnailUrl || '',
      attributes: nft.raw?.metadata?.attributes || [],
      tokenType: nft.tokenType,
      tokenUri: nft.tokenUri || '',
      media: [{ gateway: nft.image?.cachedUrl || '', raw: nft.image?.originalUrl || '' }],
      timeLastUpdated: nft.timeLastUpdated,
      rarity: {
        score: nft.raw?.metadata?.rarityScore || undefined,
        rank: nft.raw?.metadata?.rarityRank || undefined,
        totalSupply: nft.raw?.metadata?.totalSupply || undefined,
      }
    }));
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
}

/**
 * Get collections for a list of contract addresses
 * @param contractAddresses Array of contract addresses to get information for
 * @returns Array of NFT collections
 */
export async function getCollectionsByOwner(contractAddresses: string[]): Promise<NFTCollection[]> {
  try {
    const collections: NFTCollection[] = [];
    
    // Process each contract address individually
    for (const contractAddress of contractAddresses) {
      try {
        // Get NFTs for this contract to extract contract metadata
        const response = await alchemy.nft.getNftsForContract(contractAddress, { pageSize: 1 });
        
        // Extract contract info from the first NFT if available
        if (response.nfts.length > 0) {
          const nft = response.nfts[0];
          
          collections.push({
            name: nft.contract.name || 'Unnamed Collection',
            symbol: nft.contract.symbol || '',
            totalSupply: nft.contract.totalSupply ? parseInt(nft.contract.totalSupply) : 0,
            contractAddress: nft.contract.address,
            tokenType: nft.contract.tokenType,
            imageUrl: nft.contract.openSeaMetadata?.imageUrl || '',
            floorPrice: nft.contract.openSeaMetadata?.floorPrice || undefined
          });
        } else {
          // If no NFTs found, try to get the contract metadata directly
          const contractMetadata = await alchemy.nft.getContractMetadata(contractAddress);
          
          collections.push({
            name: contractMetadata.name || 'Unnamed Collection',
            symbol: contractMetadata.symbol || '',
            totalSupply: contractMetadata.totalSupply ? parseInt(contractMetadata.totalSupply) : 0,
            contractAddress: contractMetadata.address,
            tokenType: contractMetadata.tokenType,
            imageUrl: contractMetadata.openSeaMetadata?.imageUrl || '',
            floorPrice: contractMetadata.openSeaMetadata?.floorPrice || undefined
          });
        }
      } catch (contractError) {
        console.error(`Error fetching collection for ${contractAddress}:`, contractError);
        // Continue with other contracts even if one fails
      }
    }
    
    return collections;
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

/**
 * Get detailed NFT metadata
 * @param contractAddress The NFT contract address
 * @param tokenId The token ID
 * @returns Detailed NFT metadata
 */
export async function getNFTMetadata(contractAddress: string, tokenId: string): Promise<NFTItem | null> {
  try {
    const nft = await alchemy.nft.getNftMetadata(contractAddress, tokenId);
    
    return {
      tokenId: nft.tokenId,
      contractAddress: nft.contract.address,
      name: nft.name || 'Unnamed NFT',
      description: nft.description || '',
      imageUrl: nft.image?.cachedUrl || nft.image?.originalUrl || nft.image?.pngUrl || nft.image?.thumbnailUrl || '',
      attributes: nft.raw?.metadata?.attributes || [],
      tokenType: nft.tokenType,
      tokenUri: nft.tokenUri || '',
      media: [{ gateway: nft.image?.cachedUrl || '', raw: nft.image?.originalUrl || '' }],
      timeLastUpdated: nft.timeLastUpdated,
      rarity: {
        score: nft.raw?.metadata?.rarityScore || undefined,
        rank: nft.raw?.metadata?.rarityRank || undefined,
        totalSupply: nft.raw?.metadata?.totalSupply || undefined,
      }
    };
  } catch (error) {
    console.error('Error fetching NFT metadata:', error);
    return null;
  }
}

/**
 * Get NFTs from a specific collection
 * @param contractAddress The NFT contract address
 * @param ownerAddress Optional owner address to filter by
 * @returns Array of NFTs in the collection
 */
export async function getNFTsInCollection(contractAddress: string, ownerAddress?: string): Promise<NFTItem[]> {
  try {
    let nfts;
    
    if (ownerAddress) {
      nfts = await alchemy.nft.getNftsForOwner(ownerAddress, {
        contractAddresses: [contractAddress]
      });
      return nfts.ownedNfts.map(formatNFTData);
    } else {
      // Get all NFTs in a collection (up to a limit)
      const baseNfts = await alchemy.nft.getNftsForContract(contractAddress, { pageSize: 100 });
      return baseNfts.nfts.map(formatNFTData);
    }
  } catch (error) {
    console.error('Error fetching collection NFTs:', error);
    return [];
  }
}

/**
 * Generate an NFT image as SVG with rarity indicators
 * @param repoName Repository name
 * @param contributorName Contributor name
 * @param score Contribution score
 * @param rarity Rarity information
 * @returns SVG data URI for the NFT image
 */
export function generateEnhancedNftImage(
  repoName: string,
  contributorName: string,
  score: number,
  rarity: { name: string; color: string }
): string {
  // Calculate dynamic elements based on input
  const backgroundColor = getBackgroundByRarity(rarity.name);
  const borderColor = rarity.color;
  const fontColor = getContrastColor(borderColor);
  
  // Create SVG content
  const svgContent = `
    <svg width="500" height="500" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
      <!-- Background with gradient -->
      <defs>
        <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${backgroundColor}"/>
          <stop offset="100%" stop-color="${darkenColor(backgroundColor, 20)}"/>
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="10" flood-color="#000" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <!-- Card background -->
      <rect x="25" y="25" width="450" height="450" rx="15" fill="url(#cardGradient)" 
            stroke="${borderColor}" stroke-width="8" filter="shadow"/>
      
      <!-- Rarity banner -->
      <rect x="25" y="25" width="450" height="40" rx="10" fill="${borderColor}"/>
      <text x="250" y="53" font-family="Arial, sans-serif" font-size="24" font-weight="bold" 
            text-anchor="middle" fill="${fontColor}">${rarity.name.toUpperCase()} - SCORE: ${score}</text>
      
      <!-- Repository name -->
      <text x="250" y="120" font-family="Arial, sans-serif" font-size="28" font-weight="bold" 
            text-anchor="middle" fill="#FFFFFF">${repoName}</text>
      
      <!-- Contributor avatar (placeholder circle) -->
      <circle cx="250" cy="220" r="80" fill="#FFFFFF" opacity="0.9"/>
      <text x="250" y="230" font-family="Arial, sans-serif" font-size="24" 
            text-anchor="middle" fill="#000000">${getInitials(contributorName)}</text>
      
      <!-- Contributor name -->
      <text x="250" y="340" font-family="Arial, sans-serif" font-size="26" 
            text-anchor="middle" fill="#FFFFFF">${contributorName}</text>
      
      <!-- Contribution details -->
      <text x="250" y="380" font-family="Arial, sans-serif" font-size="18" 
            text-anchor="middle" fill="#FFFFFF">Contribution Score: ${score}</text>
      
      <!-- Generated timestamp -->
      <text x="250" y="450" font-family="Arial, sans-serif" font-size="12" 
            text-anchor="middle" fill="#CCCCCC">Generated on ${new Date().toLocaleDateString()}</text>
    </svg>
  `;
  
  // Convert SVG to data URI
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgContent)))}`;
}

/**
 * Get background color based on rarity tier
 */
function getBackgroundByRarity(rarityName: string): string {
  switch (rarityName.toLowerCase()) {
    case 'legendary': return '#4B0082'; // Deep purple
    case 'epic': return '#800080'; // Purple
    case 'rare': return '#0000CD'; // Medium blue
    case 'uncommon': return '#006400'; // Dark green
    case 'common': return '#2F4F4F'; // Dark slate gray
    default: return '#333333'; // Dark gray
  }
}

/**
 * Calculate a readable contrast color (black or white) based on background
 */
function getContrastColor(hexColor: string): string {
  // Remove # if present
  const color = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  
  // Calculate luminance using the formula for perceived brightness
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for bright colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Darken a hex color by the specified percentage
 */
function darkenColor(hexColor: string, percent: number): string {
  // Remove # if present
  const color = hexColor.replace('#', '');
  
  // Convert to RGB
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);
  
  // Darken by reducing each component
  r = Math.floor(r * (100 - percent) / 100);
  g = Math.floor(g * (100 - percent) / 100);
  b = Math.floor(b * (100 - percent) / 100);
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Get initials from a name
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}

/**
 * Helper function to format NFT data from Alchemy API
 */
function formatNFTData(nft: any): NFTItem {
  return {
    tokenId: nft.tokenId,
    contractAddress: nft.contract.address,
    name: nft.name || 'Unnamed NFT',
    description: nft.description || '',
    imageUrl: nft.image?.cachedUrl || nft.image?.originalUrl || nft.image?.pngUrl || nft.image?.thumbnailUrl || '',
    attributes: nft.raw?.metadata?.attributes || [],
    tokenType: nft.tokenType,
    tokenUri: nft.tokenUri || '',
    media: [{ gateway: nft.image?.cachedUrl || '', raw: nft.image?.originalUrl || '' }],
    timeLastUpdated: nft.timeLastUpdated,
    rarity: {
      score: nft.raw?.metadata?.rarityScore || undefined,
      rank: nft.raw?.metadata?.rarityRank || undefined,
      totalSupply: nft.raw?.metadata?.totalSupply || undefined,
    }
  };
}

/**
 * Calculate rarity tier based on contribution score
 * @param score Contribution score
 * @returns Rarity information including tier and color
 */
export function calculateRarityTier(score: number): { name: string; color: string } {
  if (score >= 1000) {
    return { name: "Legendary", color: "#FF8C00" }; // Orange
  } else if (score >= 500) {
    return { name: "Epic", color: "#9932CC" }; // Purple
  } else if (score >= 200) {
    return { name: "Rare", color: "#1E90FF" }; // Blue
  } else if (score >= 50) {
    return { name: "Uncommon", color: "#32CD32" }; // Green
  } else {
    return { name: "Common", color: "#808080" }; // Gray
  }
}

export const alchemyService = {
  getNFTsByOwner,
  getCollectionsByOwner,
  getNFTMetadata,
  getNFTsInCollection,
  generateEnhancedNftImage,
  calculateRarityTier
}; 