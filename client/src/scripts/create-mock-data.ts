import * as fs from 'fs/promises';
import * as path from 'path';

// Types
interface User {
  id: number;
  username: string;
  githubUsername: string | null;
  avatarUrl: string | null;
  reputation: number | null;
  password: string;
  walletAddress: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  createdAt: Date | null;
}

interface Repository {
  id: number;
  userId: number;
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
}

interface NFT {
  id: number;
  userId: number;
  tokenId: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: string;
  repoName?: string;
  mintedAt: Date;
  transactionHash: string;
  metadata: { [key: string]: any };
}

interface Activity {
  activity: {
    id: number;
    userId: number;
    type: string;
    repoName?: string;
    description: string;
    createdAt: Date;
    metadata: {
      tags?: Array<{ name: string; color: string }>;
      name?: string;
      description?: string;
      rarity?: string;
      transactionHash?: string;
    };
  };
  user: User;
}

// Mock data for users
const mockUsers: User[] = [
  {
    id: 1,
    username: "Sarah Chen",
    githubUsername: "sarahcodes",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80",
    reputation: 876,
    password: "",
    walletAddress: "0x123...",
    bio: "Full-stack developer specializing in React and Node.js",
    location: "San Francisco, CA",
    website: "https://sarahchen.dev",
    createdAt: new Date("2023-01-15")
  },
  {
    id: 2,
    username: "Alex Rivera",
    githubUsername: "alexdev",
    avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80",
    reputation: 742,
    password: "",
    walletAddress: "0x456...",
    bio: "Blockchain engineer and open-source contributor",
    location: "Miami, FL",
    website: "https://alexrivera.io",
    createdAt: new Date("2023-02-20")
  },
  {
    id: 3,
    username: "Michael Thompson",
    githubUsername: "mthompson",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80",
    reputation: 685,
    password: "",
    walletAddress: "0x789...",
    bio: "Smart contract developer and DeFi enthusiast",
    location: "Berlin, Germany",
    website: "https://mthompson.dev",
    createdAt: new Date("2023-03-10")
  },
  {
    id: 4,
    username: "Maya Johnson",
    githubUsername: "mayacodes",
    avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80",
    reputation: 524,
    password: "",
    walletAddress: "0xabc...",
    bio: "Frontend developer focused on Web3 UX",
    location: "London, UK",
    website: "https://mayajohnson.com",
    createdAt: new Date("2023-04-05")
  },
  {
    id: 5,
    username: "David Kim",
    githubUsername: "davidkim",
    avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40&q=80",
    reputation: 489,
    password: "",
    walletAddress: "0xdef...",
    bio: "Solidity developer and security researcher",
    location: "Seoul, South Korea",
    website: "https://davidkim.dev",
    createdAt: new Date("2023-05-15")
  }
];

// Mock data for repositories
const mockRepositories: Repository[] = [
  {
    id: 1,
    userId: 1,
    name: "defi-dashboard",
    description: "A comprehensive dashboard for DeFi protocols",
    stars: 342,
    forks: 78,
    language: "TypeScript"
  },
  {
    id: 2,
    userId: 1,
    name: "smart-contract-library",
    description: "Collection of reusable smart contract components",
    stars: 215,
    forks: 43,
    language: "Solidity"
  },
  {
    id: 3,
    userId: 2,
    name: "nft-marketplace",
    description: "Decentralized NFT marketplace with low fees",
    stars: 189,
    forks: 37,
    language: "JavaScript"
  },
  {
    id: 4,
    userId: 3,
    name: "eth-wallet",
    description: "Secure Ethereum wallet implementation",
    stars: 276,
    forks: 52,
    language: "TypeScript"
  },
  {
    id: 5,
    userId: 4,
    name: "web3-components",
    description: "React component library for Web3 applications",
    stars: 321,
    forks: 64,
    language: "TypeScript"
  }
];

// Mock data for NFTs
const mockNFTs: NFT[] = [
  {
    id: 1,
    userId: 1,
    tokenId: "0x1234...",
    name: "Code Guardian",
    description: "Reward for identifying a critical security vulnerability",
    imageUrl: "https://example.com/nft1.png",
    rarity: "Legendary",
    repoName: "smart-contract-library",
    mintedAt: new Date("2023-06-10"),
    transactionHash: "0xabcd...",
    metadata: { attributes: [{ trait_type: "Category", value: "Security" }] }
  },
  {
    id: 2,
    userId: 2,
    tokenId: "0x2345...",
    name: "Innovation Pioneer",
    description: "First implementation of a novel algorithm",
    imageUrl: "https://example.com/nft2.png",
    rarity: "Epic",
    repoName: "nft-marketplace",
    mintedAt: new Date("2023-07-15"),
    transactionHash: "0xbcde...",
    metadata: { attributes: [{ trait_type: "Category", value: "Innovation" }] }
  },
  {
    id: 3,
    userId: 3,
    tokenId: "0x3456...",
    name: "Community Builder",
    description: "Recognition for outstanding open-source contributions",
    imageUrl: "https://example.com/nft3.png",
    rarity: "Rare",
    repoName: "eth-wallet",
    mintedAt: new Date("2023-08-20"),
    transactionHash: "0xcdef...",
    metadata: { attributes: [{ trait_type: "Category", value: "Community" }] }
  },
  {
    id: 4,
    userId: 4,
    tokenId: "0x4567...",
    name: "UX Master",
    description: "Excellence in user experience design",
    imageUrl: "https://example.com/nft4.png",
    rarity: "Uncommon",
    repoName: "web3-components",
    mintedAt: new Date("2023-09-25"),
    transactionHash: "0xdefg...",
    metadata: { attributes: [{ trait_type: "Category", value: "Design" }] }
  },
  {
    id: 5,
    userId: 5,
    tokenId: "0x5678...",
    name: "Performance Optimizer",
    description: "Significant improvements to code efficiency",
    imageUrl: "https://example.com/nft5.png",
    rarity: "Epic",
    repoName: "blockchain-indexer",
    mintedAt: new Date("2023-10-30"),
    transactionHash: "0xefgh...",
    metadata: { attributes: [{ trait_type: "Category", value: "Performance" }] }
  }
];

// Mock data for activities
const mockActivities: Activity[] = mockUsers.map((user, index) => {
  const activityTypes = ["commit", "pull_request", "issue", "release", "fork"];
  const type = activityTypes[index % activityTypes.length];
  
  const repositories = mockRepositories.filter(repo => repo.userId === user.id);
  const repo = repositories.length > 0 ? repositories[0] : mockRepositories[0];
  
  return {
    activity: {
      id: index + 1,
      userId: user.id,
      type,
      repoName: repo.name,
      description: `${type === "commit" ? "Committed to" : type === "pull_request" ? "Opened PR in" : type === "issue" ? "Created issue in" : type === "release" ? "Released version in" : "Forked"} ${repo.name}`,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)),
      metadata: {
        tags: [
          { name: repo.language, color: "#3178c6" }
        ]
      }
    },
    user
  };
});

/**
 * Function to generate mock data and simulated Grove URIs
 */
async function generateMockData() {
  console.log("Generating mock data...");
  
  // In a real app with Grove integration, we'd upload these as JSON files
  // For now, we'll just simulate the URIs that would be returned after uploading
  const mockUris = {
    users: "ipfs://QmUsersHash123",
    repositories: "ipfs://QmRepositoriesHash456",
    nfts: "ipfs://QmNftsHash789",
    activities: "ipfs://QmActivitiesHashAbc"
  };
  
  // Create config directory if it doesn't exist
  const configDir = path.join(process.cwd(), 'src', 'config');
  try {
    await fs.mkdir(configDir, { recursive: true });
  } catch (error) {
    // Directory already exists, continue
  }
  
  // Write mock URIs to a JSON file
  const groveUrisPath = path.join(configDir, 'grove-uris.json');
  await fs.writeFile(groveUrisPath, JSON.stringify(mockUris, null, 2), 'utf-8');
  
  console.log("Mock data URIs saved to:", groveUrisPath);
  console.log("URIs:", mockUris);

  // Also save the raw mock data for development purposes
  const mockDataPath = path.join(configDir, 'mock-data.json');
  await fs.writeFile(mockDataPath, JSON.stringify({
    users: mockUsers,
    repositories: mockRepositories,
    nfts: mockNFTs,
    activities: mockActivities
  }, (key, value) => {
    // Handle Date objects for JSON serialization
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }, 2), 'utf-8');

  console.log("Mock data also saved to:", mockDataPath);
}

// Execute the script
generateMockData().catch(console.error); 