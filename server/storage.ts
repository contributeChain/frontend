import {
  users, nfts, repositories, activities, contributions,
  type User, type InsertUser,
  type Nft, type InsertNft,
  type Repository, type InsertRepository,
  type Activity, type InsertActivity,
  type Contribution, type InsertContribution
} from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // User methods
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGitHubUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // NFT methods
  getNfts(): Promise<Nft[]>;
  getNft(id: number): Promise<Nft | undefined>;
  getNftsByUserId(userId: number): Promise<Nft[]>;
  createNft(nft: InsertNft): Promise<Nft>;
  getFeaturedNfts(): Promise<Nft[]>;
  getPopularNfts(): Promise<{ id: number; name: string; count: number; rarity: string; icon: string; }[]>;
  
  // Repository methods
  getRepositories(): Promise<Repository[]>;
  getRepository(id: number): Promise<Repository | undefined>;
  getRepositoriesByUserId(userId: number): Promise<Repository[]>;
  createRepository(repository: InsertRepository): Promise<Repository>;
  
  // Activity methods
  getActivities(): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  getActivitiesByUserId(userId: number): Promise<Activity[]>;
  getActivitiesWithUsers(): Promise<{ activity: Activity; user: User }[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Contribution methods
  getContributions(): Promise<Contribution[]>;
  getContribution(id: number): Promise<Contribution | undefined>;
  getContributionsByUserId(userId: number): Promise<Contribution[]>;
  createContribution(contribution: InsertContribution): Promise<Contribution>;
  
  // Other methods
  getTrendingDevelopers(): Promise<User[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private nfts: Map<number, Nft>;
  private repositories: Map<number, Repository>;
  private activities: Map<number, Activity>;
  private contributions: Map<number, Contribution>;
  
  private userIdCounter: number;
  private nftIdCounter: number;
  private repositoryIdCounter: number;
  private activityIdCounter: number;
  private contributionIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.nfts = new Map();
    this.repositories = new Map();
    this.activities = new Map();
    this.contributions = new Map();
    
    this.userIdCounter = 1;
    this.nftIdCounter = 1;
    this.repositoryIdCounter = 1;
    this.activityIdCounter = 1;
    this.contributionIdCounter = 1;
    
    // Initialize with some sample data for development purposes
    this.initializeData();
  }
  
  // User methods
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByGitHubUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.githubUsername?.toLowerCase() === username.toLowerCase()
    );
  }
  
  async getUserByWalletAddress(address: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress?.toLowerCase() === address.toLowerCase()
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }
  
  // NFT methods
  async getNfts(): Promise<Nft[]> {
    return Array.from(this.nfts.values());
  }
  
  async getNft(id: number): Promise<Nft | undefined> {
    return this.nfts.get(id);
  }
  
  async getNftsByUserId(userId: number): Promise<Nft[]> {
    return Array.from(this.nfts.values()).filter(
      (nft) => nft.userId === userId
    );
  }
  
  async createNft(insertNft: InsertNft): Promise<Nft> {
    const id = this.nftIdCounter++;
    const now = new Date();
    const nft: Nft = { ...insertNft, id, mintedAt: now };
    this.nfts.set(id, nft);
    
    // Create an activity for the NFT mint
    this.createActivity({
      userId: insertNft.userId,
      type: "nft_mint",
      description: `Minted NFT: ${insertNft.name}`,
      nftId: id,
      metadata: {
        name: insertNft.name,
        rarity: insertNft.rarity,
        transactionHash: insertNft.transactionHash,
        tokenId: insertNft.tokenId
      }
    });
    
    return nft;
  }
  
  async getFeaturedNfts(): Promise<Nft[]> {
    // In a real app, you might have a featured flag or other criteria
    return Array.from(this.nfts.values())
      .sort((a, b) => b.mintedAt.getTime() - a.mintedAt.getTime())
      .slice(0, 8);
  }
  
  async getPopularNfts(): Promise<{ id: number; name: string; count: number; rarity: string; icon: string; }[]> {
    // Group NFTs by name and count occurrences
    const nftCounts = new Map<string, { id: number; count: number; rarity: string; }>();
    
    Array.from(this.nfts.values()).forEach(nft => {
      const existing = nftCounts.get(nft.name);
      if (existing) {
        existing.count++;
      } else {
        nftCounts.set(nft.name, { 
          id: nft.id, 
          count: 1, 
          rarity: nft.rarity || "common"
        });
      }
    });
    
    // Convert to array and sort by count
    return Array.from(nftCounts.entries())
      .map(([name, { id, count, rarity }]) => {
        let icon = "fa-code-branch";
        
        if (name.includes("Streak") || name.includes("streak")) {
          icon = "fa-fire";
        } else if (name.includes("Trophy") || name.includes("trophy") || name.includes("Champion")) {
          icon = "fa-trophy";
        } else if (name.includes("Bug") || name.includes("bug") || name.includes("Fix")) {
          icon = "fa-bug";
        } else if (name.includes("Star") || name.includes("star") || name.includes("Maintainer")) {
          icon = "fa-star";
        }
        
        return {
          id,
          name,
          count,
          rarity: rarity.charAt(0).toUpperCase() + rarity.slice(1), // Capitalize first letter
          icon
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }
  
  // Repository methods
  async getRepositories(): Promise<Repository[]> {
    return Array.from(this.repositories.values());
  }
  
  async getRepository(id: number): Promise<Repository | undefined> {
    return this.repositories.get(id);
  }
  
  async getRepositoriesByUserId(userId: number): Promise<Repository[]> {
    return Array.from(this.repositories.values()).filter(
      (repository) => repository.userId === userId
    );
  }
  
  async createRepository(insertRepository: InsertRepository): Promise<Repository> {
    const id = this.repositoryIdCounter++;
    const now = new Date();
    const repository: Repository = { ...insertRepository, id, nftCount: 0, lastUpdated: now };
    this.repositories.set(id, repository);
    
    // Create an activity for the repository creation
    this.createActivity({
      userId: insertRepository.userId,
      type: "repo_create",
      repoName: insertRepository.name,
      description: `Created repository: ${insertRepository.name}`,
      metadata: {
        language: insertRepository.language,
        stars: insertRepository.stars,
        forks: insertRepository.forks
      }
    });
    
    return repository;
  }
  
  // Activity methods
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }
  
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter((activity) => activity.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getActivitiesWithUsers(): Promise<{ activity: Activity; user: User }[]> {
    return Array.from(this.activities.values())
      .map(activity => {
        const user = this.users.get(activity.userId);
        if (!user) return null;
        return { activity, user };
      })
      .filter((item): item is { activity: Activity; user: User } => item !== null)
      .sort((a, b) => b.activity.createdAt.getTime() - a.activity.createdAt.getTime());
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const now = new Date();
    const activity: Activity = { ...insertActivity, id, createdAt: now };
    this.activities.set(id, activity);
    return activity;
  }
  
  // Contribution methods
  async getContributions(): Promise<Contribution[]> {
    return Array.from(this.contributions.values());
  }
  
  async getContribution(id: number): Promise<Contribution | undefined> {
    return this.contributions.get(id);
  }
  
  async getContributionsByUserId(userId: number): Promise<Contribution[]> {
    return Array.from(this.contributions.values()).filter(
      (contribution) => contribution.userId === userId
    );
  }
  
  async createContribution(insertContribution: InsertContribution): Promise<Contribution> {
    const id = this.contributionIdCounter++;
    const contribution: Contribution = { ...insertContribution, id };
    this.contributions.set(id, contribution);
    return contribution;
  }
  
  // Other methods
  async getTrendingDevelopers(): Promise<User[]> {
    // In a real app, this would be based on activity, reputation, etc.
    return Array.from(this.users.values())
      .sort((a, b) => (b.reputation || 0) - (a.reputation || 0))
      .slice(0, 5);
  }
  
  // Helper method to initialize some data for development
  private initializeData() {
    // Add sample users
    const sarahChen = this.createUser({
      username: "Sarah Chen",
      githubUsername: "sarahcodes",
      password: "password123", // In a real app, this would be hashed
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
      walletAddress: "0x3a28fb7c9472d7eb05f5d80e2c8c3c059befc924",
      bio: "Building open source tools for developers. Passionate about blockchain technology and web performance optimization.",
      location: "San Francisco",
      website: "https://sarahchen.dev",
      reputation: 876
    });
    
    const alexRivera = this.createUser({
      username: "Alex Rivera",
      githubUsername: "alexdev",
      password: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
      walletAddress: "0x7b42bf6e9c3a7eb8f5d8bfd645ab21de9f7c8b94",
      bio: "Full stack developer passionate about Web3 and DeFi. Currently exploring blockchain authentication systems.",
      location: "New York",
      website: "https://alexrivera.dev",
      reputation: 742
    });
    
    const mayaJohnson = this.createUser({
      username: "Maya Johnson",
      githubUsername: "mayacodes",
      password: "password123",
      avatarUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80",
      walletAddress: "0x3d59f21a8c7d6e9b2a1b3c4d5e6f7g8h9i0j1k2l3",
      bio: "Frontend developer and UI/UX enthusiast. Working on making blockchain more accessible to everyone.",
      location: "Berlin",
      website: "https://mayajohnson.com",
      reputation: 524
    });
    
    // Add sample repositories
    const authRepo = this.createRepository({
      userId: 1,
      name: "blockchain-auth-system",
      description: "An OAuth-compatible authentication system built on blockchain technology for secure, decentralized identity verification.",
      stars: 248,
      forks: 56,
      language: "JavaScript"
    });
    
    const reactRepo = this.createRepository({
      userId: 1,
      name: "react-performance-toolkit",
      description: "A collection of performance optimization tools and components for React applications with a focus on rendering speed.",
      stars: 1200,
      forks: 184,
      language: "TypeScript"
    });
    
    const defiRepo = this.createRepository({
      userId: 1,
      name: "defi-dashboard-components",
      description: "A suite of React components specifically designed for DeFi applications with real-time data visualization.",
      stars: 845,
      forks: 92,
      language: "TypeScript"
    });
    
    // Add sample NFTs
    const commitNft = this.createNft({
      userId: 1,
      name: "COMMIT-7834",
      description: "React Component Library",
      rarity: "rare",
      repoName: "react-performance-toolkit",
      tokenId: "7834",
      transactionHash: "0x3a28fb7c9472d7eb05f5d80e2c8c3c059befc9245bded0aef5244672c1b7bc5d",
      metadata: { type: "commit", language: "javascript" }
    });
    
    const streakNft = this.createNft({
      userId: 2,
      name: "STREAK-30",
      description: "30 Day Commit Streak",
      rarity: "epic",
      tokenId: "streak-30-alex",
      transactionHash: "0x7b42bf6e9c3a7eb8f5d8bfd645ab21de9f7c8b94e3d5f9b2a1b3c4d5e6f7g8h9",
      metadata: { type: "streak", days: 30 }
    });
    
    const prNft = this.createNft({
      userId: 1,
      name: "PR-MERGE-42",
      description: "Major Feature Merge",
      rarity: "common",
      repoName: "blockchain-auth-system",
      tokenId: "pr-42",
      transactionHash: "0x3d59f21a8c7d6e9b2a1b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4",
      metadata: { type: "pull-request", additions: 1240, deletions: 345 }
    });
    
    const firstNft = this.createNft({
      userId: 3,
      name: "FIRST-COMMIT",
      description: "First GitHub contribution minted as NFT",
      rarity: "common",
      repoName: "javascript-utils",
      tokenId: "first-maya",
      transactionHash: "0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7",
      metadata: { type: "first-commit", repository: "javascript-utils" }
    });
    
    // Add sample contributions (days with GitHub activity)
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    
    // Add some random contributions over the past year for Sarah
    for (let i = 0; i < 200; i++) {
      const randomDay = Math.floor(Math.random() * 365);
      const date = new Date(currentYear, 0, 1);
      date.setDate(date.getDate() + randomDay);
      
      if (date <= new Date()) {
        this.createContribution({
          userId: 1,
          date,
          count: Math.floor(Math.random() * 10) + 1 // 1-10 contributions
        });
      }
    }
    
    // Add some contributions for Alex (including a 30-day streak)
    const streakStart = new Date(currentYear, currentMonth - 2, 1);
    for (let i = 0; i < 30; i++) {
      const date = new Date(streakStart);
      date.setDate(date.getDate() + i);
      
      this.createContribution({
        userId: 2,
        date,
        count: Math.floor(Math.random() * 8) + 3 // 3-10 contributions
      });
    }
    
    // Add some scattered contributions for Maya
    for (let i = 0; i < 50; i++) {
      const randomDay = Math.floor(Math.random() * 90);
      const date = new Date(currentYear, currentMonth - 3, 1);
      date.setDate(date.getDate() + randomDay);
      
      if (date <= new Date()) {
        this.createContribution({
          userId: 3,
          date,
          count: Math.floor(Math.random() * 5) + 1 // 1-5 contributions
        });
      }
    }
    
    // Add some activities (beyond NFT minting which is automatically created)
    this.createActivity({
      userId: 1,
      type: "commit",
      repoName: "react-performance-toolkit",
      description: "Just released a major update to my React Performance Toolkit! Check out the new virtualization component that improves rendering by 40% 🚀",
      metadata: {
        tags: [
          { name: "react", color: "primary" },
          { name: "performance", color: "secondary" },
          { name: "optimization", color: "accent" }
        ]
      }
    });
    
    this.createActivity({
      userId: 2,
      type: "commit",
      repoName: "web3-auth-explorer",
      description: "Working on a new authentication flow using blockchain signatures. Making great progress! #web3 #auth",
      metadata: {
        tags: [
          { name: "web3", color: "primary" },
          { name: "auth", color: "secondary" }
        ]
      }
    });
    
    this.createActivity({
      userId: 3,
      type: "repo_create",
      repoName: "react-defi-components",
      description: "Just created a new repository for React components specifically designed for DeFi applications. Contributors welcome!",
      metadata: {
        language: "TypeScript",
        tags: [
          { name: "react", color: "primary" },
          { name: "defi", color: "accent" },
          { name: "components", color: "secondary" }
        ]
      }
    });
  }
}

// Export a single instance of the storage
export const storage = new MemStorage();
