import { ContractFunctionExecutionError } from "viem";
import { uploadNftMetadata } from "./groveClient";
import { createPublicClient, http, createWalletClient, custom, parseEther } from "viem";
import { base, baseGoerli } from "viem/chains";

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

//TODO: Add mainnet contract address
// Contract address from the deployment
export const CONTRIBUTOR_NFT_ADDRESS = import.meta.env.VITE_NEXT_PUBLIC_NETWORK === "testnet" ? "0x31F8fC3Bcada00d64ce6bB3D4D22d9814530feD8" : "//mainnet contract address";

// Set the chain based on environment
const chain = import.meta.env.VITE_NEXT_PUBLIC_NETWORK === "mainnet" ? base : baseGoerli;

// Create a public client for read operations
const publicClient = createPublicClient({
  chain,
  transport: http()
});

/**
 * Creates a wallet client from an ethereum provider
 */
export function createWalletClientFromProvider(provider: any) {
  return createWalletClient({
    chain,
    transport: custom(provider)
  });
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
 * Get rarity level based on contribution score
 */
export function getRarityLevel(score: number): {
  name: string;
  color: string;
  level: number;
} {
  if (score >= 1000) {
    return { name: "Legendary", color: "#FF8C00", level: 5 };
  } else if (score >= 500) {
    return { name: "Epic", color: "#9932CC", level: 4 };
  } else if (score >= 200) {
    return { name: "Rare", color: "#1E90FF", level: 3 };
  } else if (score >= 50) {
    return { name: "Uncommon", color: "#32CD32", level: 2 };
  } else {
    return { name: "Common", color: "#808080", level: 1 };
  }
}

/**
 * Generate an image URL for the NFT based on repository and score
 * This is a placeholder - in a real app, you'd generate proper images
 */
export function generateNftImageUrl(
  repositoryName: string,
  contributorName: string,
  score: number,
  rarity: { name: string; color: string }
): string {
  // In a real app, you'd generate proper NFT images
  // This is just a placeholder - you would use a real NFT image generator or API
  return `https://via.placeholder.com/500x500.png?text=${repositoryName}+${rarity.name}`;
}

/**
 * Create NFT metadata for a contributor
 */
export async function createNftMetadata(
  repositoryName: string,
  repositoryUrl: string,
  contributor: {
    name: string;
    login: string;
    avatar_url: string;
  },
  stats: {
    commits: number;
    additions: number;
    deletions: number;
    pullRequests: number;
    issues: number;
  },
  walletAddress: `0x${string}`
) {
  const score = calculateContributionScore(
    stats.commits,
    stats.additions,
    stats.deletions,
    stats.pullRequests,
    stats.issues
  );
  
  const rarity = getRarityLevel(score);
  
  // In a production app, you'd generate a real image
  // For this example, we'll use a placeholder
  const imageUrl = generateNftImageUrl(
    repositoryName,
    contributor.name || contributor.login,
    score,
    rarity
  );
  
  const metadata = {
    name: `${repositoryName} Contributor: ${contributor.login}`,
    description: `Recognition for contributions to ${repositoryName}. Contribution Score: ${score}`,
    image: imageUrl,
    external_url: repositoryUrl,
    attributes: [
      {
        trait_type: "Repository",
        value: repositoryName
      },
      {
        trait_type: "Contributor",
        value: contributor.login
      },
      {
        trait_type: "Contribution Score",
        value: score
      },
      {
        trait_type: "Rarity",
        value: rarity.name
      },
      {
        trait_type: "Commits",
        value: stats.commits
      },
      {
        trait_type: "Lines Added",
        value: stats.additions
      },
      {
        trait_type: "Lines Deleted",
        value: stats.deletions
      },
      {
        trait_type: "Pull Requests",
        value: stats.pullRequests
      },
      {
        trait_type: "Issues",
        value: stats.issues
      }
    ]
  };
  
  // Upload metadata to Grove
  const uploadResult = await uploadNftMetadata(metadata, walletAddress);
  
  return {
    metadata,
    score,
    rarity,
    uploadResult
  };
}

/**
 * Mint a new contribution NFT
 */
export async function mintContributionNft(
  provider: any,
  walletAddress: `0x${string}`,
  repositoryUrl: string,
  contributionScore: number,
  metadataUri: string
) {
  try {
    // Create wallet client if provider is available
    const walletClient = provider ? createWalletClientFromProvider(provider) : null;
    
    if (!walletClient) {
      // Use a more compatible approach without provider
      return {
        success: false,
        error: "No wallet provider available. Please connect your wallet."
      };
    }
    
    // Prepare transaction
    const { request } = await publicClient.simulateContract({
      address: CONTRIBUTOR_NFT_ADDRESS as `0x${string}`,
      abi: contributorNftAbi,
      functionName: 'mintContribution',
      args: [walletAddress, repositoryUrl, BigInt(contributionScore), metadataUri]
    });
    
    // Send transaction with account specified
    const hash = await walletClient.writeContract({
      ...request,
      account: walletAddress
    });
    
    // Wait for transaction
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    
    return {
      success: true,
      transactionHash: hash,
      receipt
    };
  } catch (error: any) {
    console.error("Error minting NFT:", error);
    
    let errorMessage = "Failed to mint NFT";
    if (error instanceof ContractFunctionExecutionError) {
      // Try to extract a more specific error message
      errorMessage = error.message.split("Contract Function Execution Error:")[1]?.trim() || errorMessage;
    }
    
    return {
      success: false,
      error: errorMessage
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