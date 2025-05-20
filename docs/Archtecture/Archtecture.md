
# Implementation Plan for GitChain Web3 Integration

## 1. File Structure Organization

```
frontend/
├── client/
│   ├── src/
│   │   ├── services/
│   │   │   ├── github.ts         # Real GitHub SDK implementation
│   │   │   ├── lens.ts           # Lens Protocol integration
│   │   │   ├── storage.ts        # Grove storage operations
│   │   │   └── blockchain.ts     # Blockchain interactions
│   │   ├── lib/
│   │   │   ├── web3Provider.tsx  # Wallet connection setup
│   │   │   └── constants.ts      # Configuration constants
│   │   └── hooks/
│   │       ├── useGitHub.ts      # Custom hook for GitHub operations
│   │       ├── useLens.ts        # Custom hook for Lens operations
│   │       └── useNFT.ts         # Custom hook for NFT operations
├── server/
│   ├── api/
│   │   ├── github.ts             # GitHub API endpoints
│   │   ├── blockchain.ts         # Replace mock with real integration
│   │   └── storage.ts            # Grove storage integration
│   └── services/
│       ├── github.service.ts     # GitHub service implementation
│       └── lens.service.ts       # Lens service implementation
```

## 2. Required API Integrations

### Lens Protocol Integration
```typescript
// client/src/services/lens.ts
import { LensClient, development } from "@lens-protocol/client";

export const lensClient = new LensClient({
  environment: development
});

export async function authenticateWithLens(address: string) {
  // Implement Lens authentication flow
}

export async function createProfile(profileData) {
  // Create a Lens profile
}
```

### GitHub SDK Integration
```typescript
// client/src/services/github.ts
import { Octokit } from "@octokit/rest";

export const octokit = new Octokit();

export async function fetchUserProfile(username: string) {
  return octokit.users.getByUsername({ username });
}

export async function fetchRepository(owner: string, repo: string) {
  return octokit.repos.get({ owner, repo });
}

export async function fetchContributions(owner: string, repo: string, username: string) {
  // Implement contribution stats fetching
}
```

### Grove Storage Integration
```typescript
// server/api/storage.ts
import { IStorageProvider } from "@lens-protocol/storage";

// Initialize Grove as the storage provider
export const groveStorage = /* initialization code */;

export async function storeUserData(userData) {
  // Store user data in Grove
}

export async function storeRepositoryData(repoData) {
  // Store repository data in Grove
}
```

## 3. Core Component Implementation

### Web3Provider Setup
```typescript
// client/src/lib/web3Provider.tsx
import { WagmiProvider, createConfig, http } from "wagmi";
import { chains } from "@lens-chain/sdk/viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";

const config = createConfig(
  getDefaultConfig({
    chains: [chains.mainnet, chains.testnet],
    transports: {
      [chains.mainnet.id]: http(chains.mainnet.rpcUrls.default.http[0]!),
      [chains.testnet.id]: http(chains.testnet.rpcUrls.default.http[0]!),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    appName: "GitChain",
  })
);

const queryClient = new QueryClient();

export const Web3Provider = ({ children }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>{children}</ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
```

### User Authentication Flow
```typescript
// client/src/hooks/useAuth.ts
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { authenticateWithLens } from "../services/lens";

export function useAuth() {
  const { address, isConnected } = useAccount();
  const [gitHubProfile, setGitHubProfile] = useState(null);
  
  // Link GitHub profile with wallet address
  async function linkGitHubToWallet(githubUrl) {
    // Extract username from GitHub URL
    const username = extractGitHubUsername(githubUrl);
    const profileData = await fetchUserProfile(username);
    
    // Store in Lens storage
    // Return preview data
  }
  
  // Complete signup process
  async function completeSignup(githubProfile) {
    if (address && githubProfile) {
      // Create Lens profile
      // Store association in Grove
    }
  }
  
  return { 
    isConnected, 
    address, 
    linkGitHubToWallet,
    completeSignup
  };
}
```

### Repository Integration
```typescript
// server/api/github.ts
import { Express, Request, Response } from "express";
import { fetchRepository, fetchContributions } from "../services/github.service";
import { storeRepositoryData } from "./storage";

export function setupGitHubRoutes(app: Express) {
  app.post("/api/github/import-repo", async (req: Request, res: Response) => {
    try {
      const { repoUrl } = req.body;
      const { owner, repo } = parseRepoUrl(repoUrl);
      
      // Fetch repo data from GitHub
      const repoData = await fetchRepository(owner, repo);
      
      // Store in Grove
      const storedRepo = await storeRepositoryData({
        name: repoData.name,
        owner: repoData.owner.login,
        description: repoData.description,
        stars: repoData.stargazers_count,
        url: repoData.html_url,
      });
      
      res.json({ success: true, repository: storedRepo });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
}
```

### NFT Minting Service
```typescript
// server/api/blockchain.ts (updated version)
import { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";

// Define validation schema for NFT minting
const MintRequestSchema = z.object({
  userId: z.string(),
  repositoryId: z.string(),
  contributionData: z.object({
    commits: z.number(),
    pulls: z.number(),
    issues: z.number(),
    reviews: z.number()
  })
});

export function setupBlockchainRoutes(app: Express) {
  // Mint an NFT based on GitHub contributions
  app.post("/api/blockchain/mint", async (req: Request, res: Response) => {
    try {
      const validatedData = MintRequestSchema.parse(req.body);
      const { userId, repositoryId, contributionData } = validatedData;
      
      // Get user data
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get repository data
      const repository = await storage.getRepository(repositoryId);
      if (!repository) {
        return res.status(404).json({ message: "Repository not found" });
      }
      
      // Calculate rarity based on contribution metrics
      const rarity = calculateContributionRarity(contributionData);
      
      // Generate NFT metadata
      const nftMetadata = {
        name: `${repository.name} Contributor`,
        description: `NFT for contributions to ${repository.name}`,
        image: generateNFTImage(repository, contributionData, rarity),
        properties: {
          rarity,
          type: "Contribution",
          repository: repository.name,
          contributor: user.githubUsername,
          date: new Date().toISOString()
        }
      };
      
      // Call the actual blockchain functions
      // This would use ethers.js or similar to interact with smart contract
      const result = await mintContributorNFT(user.walletAddress, nftMetadata);
      
      // Store NFT data in Grove
      const nft = await storage.createNft({
        userId,
        repositoryId,
        name: nftMetadata.name,
        description: nftMetadata.description,
        imageUrl: nftMetadata.image,
        rarity,
        tokenId: result.tokenId,
        transactionHash: result.transactionHash,
        metadata: nftMetadata
      });
      
      // Update repository NFT count
      await storage.updateRepositoryNFTCount(repositoryId);
      
      res.json({
        success: true,
        nft,
        transactionHash: result.transactionHash,
        tokenId: result.tokenId
      });
    } catch (error) {
      console.error("Error minting NFT:", error);
      res.status(500).json({ message: "Failed to mint NFT" });
    }
  });
  
  // Implement other endpoints...
}
```

## 4. Smart Contract Implementation Plan

```solidity
// ContributorNFT.sol (simplified)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ContributorNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    // Events
    event NFTMinted(address to, uint256 tokenId, string repository);
    
    constructor() ERC721("GitChain Contributor", "GITC") {}
    
    // Function to mint a contributor NFT
    function mintContributorNFT(
        address to, 
        string memory tokenURI,
        string memory repository
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        emit NFTMinted(to, tokenId, repository);
        
        return tokenId;
    }
}
```

## 5. Data Flow Diagrams

### User Authentication & Profile Creation Flow
1. User connects wallet via ConnectKit
2. User provides GitHub profile URL
3. System fetches GitHub profile data
4. System shows preview card with GitHub info
5. User confirms registration
6. System creates Lens profile and stores association in Grove
7. User profile appears on explorer page

### Repository Import Flow
1. User provides repository URL
2. System parses URL and fetches repo data from GitHub API
3. System shows preview card with repository info
4. User confirms import
5. System stores repository data in Grove
6. Repository appears on platform

### NFT Minting Flow
1. User selects repository
2. System fetches user's contributions to that repository
3. System calculates contribution metrics
4. System shows preview of NFT with rarity grading
5. User confirms minting
6. System calls smart contract to mint NFT
7. System updates repository NFT count
8. User receives NFT in their wallet

