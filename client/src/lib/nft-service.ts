import { ContractFunctionExecutionError } from "viem";
import { storageClient } from "@/lib/groveClient";
import { createPublicClient, http, createWalletClient, custom, parseEther } from "viem";
import { lens, lensTestnet } from "wagmi/chains";
import { DEFAULT_NETWORK, getNftContractAddress } from "@/config/contracts";

// ContributorNFT contract ABI (partial - only functions we need)
const contributorNftAbi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "repositoryUrl",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "contributionScore",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "tokenURI",
        "type": "string"
      }
    ],
    "name": "mintContribution",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getTokenMetadata",
    "outputs": [
      {
        "internalType": "string",
        "name": "repositoryUrl",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "contributor",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "rarityName",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "contributionScore",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "mintedAt",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "repositoryUrl",
        "type": "string"
      }
    ],
    "name": "getRepositoryTokens",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// Get contract address from config
export const CONTRIBUTOR_NFT_ADDRESS = getNftContractAddress();

// Create a public client for read operations using the default provider for the selected chain
const publicClient = createPublicClient({
  chain: DEFAULT_NETWORK === 'mainnet' ? lens : lensTestnet,
  transport: http()
});

/**
 * Creates a wallet client from an ethereum provider
 */
export function createWalletClientFromProvider(provider: any) {
  if(DEFAULT_NETWORK === 'mainnet') {
    return createWalletClient({
      chain: lens,
      transport: custom(provider)
    });
  } else {
    return createWalletClient({
      chain: lensTestnet,
      transport: custom(provider)
    });
  }
}

/**
 * Calculate contribution score based on different metrics
 * This is a simplified algorithm and can be made more complex
 */
export function calculateContributionScore(
  commits: number,
  additions: number,
  deletions: number,
  pullRequests: number,
  issues: number
): number {
  // Base score from commits
  const commitScore = commits * 10;
  
  // Code change score - changes have diminishing returns
  const codeChangeScore = Math.sqrt(additions + deletions) * 5;
  
  // Pull request score
  const prScore = pullRequests * 25;
  
  // Issue score
  const issueScore = issues * 15;
  
  // Total score
  return Math.floor(commitScore + codeChangeScore + prScore + issueScore);
}

/**
 * Upload NFT metadata to Grove storage
 * @param metadata NFT metadata object
 * @param walletAddress User's wallet address
 * @returns Upload result from Grove storage
 */
export async function uploadNftMetadata(metadata: any, walletAddress: `0x${string}`) {
  try {
    const uploadResult = await storageClient.uploadAsJson(metadata);
    return uploadResult;
  } catch (error) {
    console.error("Error uploading NFT metadata:", error);
    throw new Error("Failed to upload NFT metadata to storage");
  }
}

/**
 * Calculate rarity level based on contribution score
 * @param score Contribution score
 * @returns Rarity information including name and color
 */
export function getRarityLevel(score: number) {
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

/**
 * Generate NFT image URL
 * @param repoName Repository name
 * @param contributorName Contributor name
 * @param score Contribution score
 * @param rarity Rarity information
 * @returns URL for the NFT image
 */
export function generateNftImageUrl(
  repoName: string,
  contributorName: string,
  score: number,
  rarity: { name: string; color: string }
): string {
  // Encode parameters for URL
  const encodedRepo = encodeURIComponent(repoName);
  const encodedContributor = encodeURIComponent(contributorName);
  const encodedScore = encodeURIComponent(score.toString());
  const encodedRarity = encodeURIComponent(rarity.name);
  const encodedColor = encodeURIComponent(rarity.color.replace('#', ''));
  
  // Use our own SVG image generator
  return  `http://f8ksk0o4w0kosswc88s4o8ck.35.208.71.32.sslip.io/api/nft-image/generate?repo=${encodedRepo}&contributor=${encodedContributor}&score=${encodedScore}&rarity=${encodedRarity}&color=${encodedColor}`;
}

/**
 * Create NFT metadata
 * @param repo Repository name
 * @param repoUrl Repository URL
 * @param contributor Contributor information
 * @param stats Contribution statistics
 * @param ownerAddress Owner wallet address
 * @param customImageUrl Optional custom image URL from Grove storage
 * @param attributes Optional additional attributes
 * @returns Result of metadata creation
 */
export async function createNftMetadata(
  repo: string,
  repoUrl: string,
  contributor: {
    name?: string;
    login: string;
    avatar_url: string;
  },
  stats: {
    commits: number;
    additions: number;
    deletions: number;
    pullRequests: number;
    issues: number;
    score: number;
  },
  ownerAddress: `0x${string}`,
  customImageUrl?: string,
  attributes?: Array<{ trait_type: string; value: string }>
) {
  try {
    // Generate NFT name and description
    const name = `${repo} Contribution - ${contributor.name || contributor.login}`;
    const description = `This NFT represents contributions to ${repo} by ${
      contributor.name || contributor.login
    } (${contributor.login}).`;

    // Default attributes if none provided
    const nftAttributes = attributes || [
      { trait_type: "Repository", value: repo },
      { trait_type: "Contributor", value: contributor.login },
      { trait_type: "Contribution Score", value: stats.score.toString() },
      { trait_type: "Commits", value: stats.commits.toString() },
      { trait_type: "Additions", value: stats.additions.toString() },
      { trait_type: "Deletions", value: stats.deletions.toString() },
      { trait_type: "Pull Requests", value: stats.pullRequests.toString() },
      { trait_type: "Issues", value: stats.issues.toString() },
    ];

    // Determine rarity level
    const rarity = getRarityLevel(stats.score);
    
    // Add rarity attribute if not already included
    if (!nftAttributes.find(attr => attr.trait_type === "Rarity")) {
      nftAttributes.push({
        trait_type: "Rarity",
        value: rarity.name
      });
    }

    // Use custom image URL if provided, otherwise generate one
    const imageUrl = customImageUrl || 
      generateNftImageUrl(repo, contributor.name || contributor.login, stats.score, rarity);

    // Create metadata object
    const metadata = {
      name,
      description,
      image: imageUrl,
      attributes: nftAttributes,
      external_url: repoUrl,
      properties: {
        repository: repo,
        contributor: contributor.login,
        score: stats.score,
        commits: stats.commits,
        additions: stats.additions,
        deletions: stats.deletions,
        pullRequests: stats.pullRequests,
        issues: stats.issues,
        ownerAddress,
      },
    };

    // Upload metadata to Grove
    const uploadResult = await uploadNftMetadata(metadata, ownerAddress);
    
    console.log("Metadata URI:", uploadResult.uri);
    return { success: true, metadata, uploadResult };
  } catch (error) {
    console.error("Error creating NFT metadata:", error);
    throw error;
  }
}

/**
 * Mint a contribution NFT
 * @param client Wallet client
 * @param recipient Recipient wallet address
 * @param repoUrl Repository URL
 * @param score Contribution score
 * @param metadataUri URI of the NFT metadata
 * @returns Result of minting operation
 */
export async function mintContributionNft(
  client: any,
  recipient: `0x${string}`,
  repoUrl: string,
  score: number,
  metadataUri: string
): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
  try {
    if (!client) {
      throw new Error("Wallet client is required for minting NFTs");
    }

    const contractAddress = getNftContractAddress() as `0x${string}`;
    
    console.log("Contract Address:", contractAddress);
    console.log("Recipient:", recipient);
    console.log("Repo URL:", repoUrl);
    console.log("Score:", score);
    console.log("Metadata URI:", metadataUri);

    // Prepare the transaction request
    const request = {
      address: contractAddress,
      abi: contributorNftAbi,
      functionName: "mintContribution",
      args: [
        recipient,
        repoUrl,
        BigInt(score),
        metadataUri
      ],
      account: recipient,
      // chain: alchemyConfig.chain
    };

    // Write the contract directly without simulation
    const hash = await client.writeContract(request);
    
    return {
      success: true,
      transactionHash: hash
    };
  } catch (error: any) {
    // Handle contract errors more specifically
    if (error instanceof ContractFunctionExecutionError) {
      console.error("Contract execution error:", error.cause);
      return {
        success: false,
        error: `Contract error: ${error.cause || error.message}`
      };
    }
    
    console.error("Error minting NFT:", error);
    return {
      success: false,
      error: error.message || "Failed to mint NFT"
    };
  }
}

/**
 * Get tokens minted for a repository
 */
export async function getRepositoryTokens(repositoryUrl: string) {
  try {
    const tokenIds = await publicClient.readContract({
      address: CONTRIBUTOR_NFT_ADDRESS as `0x${string}`,
      abi: contributorNftAbi,
      functionName: 'getRepositoryTokens',
      args: [repositoryUrl]
    });
    
    return tokenIds;
  } catch (error) {
    console.error("Error getting repository tokens:", error);
    return [];
  }
}

/**
 * Get token metadata for a specific token ID
 */
export async function getTokenMetadata(tokenId: bigint) {
  try {
    const metadata = await publicClient.readContract({
      address: CONTRIBUTOR_NFT_ADDRESS as `0x${string}`,
      abi: contributorNftAbi,
      functionName: 'getTokenMetadata',
      args: [tokenId]
    }) as [string, `0x${string}`, string, bigint, bigint];
    
    return {
      repositoryUrl: metadata[0],
      contributor: metadata[1],
      rarityName: metadata[2],
      contributionScore: metadata[3],
      mintedAt: new Date(Number(metadata[4]) * 1000)
    };
  } catch (error) {
    console.error("Error getting token metadata:", error);
    return null;
  }
}

/**
 * Get total number of minted tokens
 */
export async function getTotalSupply() {
  try {
    const totalSupply = await publicClient.readContract({
      address: CONTRIBUTOR_NFT_ADDRESS as `0x${string}`,
      abi: contributorNftAbi,
      functionName: 'totalSupply'
    });
    
    return totalSupply;
  } catch (error) {
    console.error("Error getting total supply:", error);
    return BigInt(0);
  }
} 