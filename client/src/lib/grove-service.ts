// @ts-ignore
import groveUris from "../config/grove-uris.json";
import { storageClient } from "./groveClient";

// Types
export interface User {
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

export interface Repository {
  id: number;
  userId: number;
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  nftCount: number;
  lastUpdated: Date;
}

export interface NFT {
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

export interface Activity {
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

// Cache mechanism to avoid multiple identical fetches
const cache: Record<string, any> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps: Record<string, number> = {};

// Helper to check if cache is valid
const isCacheValid = (key: string): boolean => {
  const timestamp = cacheTimestamps[key];
  return !!timestamp && (Date.now() - timestamp < CACHE_TTL);
};

/**
 * Fetches data from Grove storage using the specified URI
 */
async function fetchFromGrove<T>(uri: string): Promise<T> {
  try {
    console.log('Fetching from Grove:', uri);
    
    // Check cache first
    if (cache[uri] && isCacheValid(uri)) {
      return cache[uri] as T;
    }
    
    // Resolve lens:// URI to a web URL
    let resolvedUrl: string;
    if (uri.startsWith('lens://')) {
      // Use StorageClient to resolve lens:// URI
      resolvedUrl = storageClient.resolve(uri);
      console.log('Resolved URL:', resolvedUrl);
    } else {
      resolvedUrl = uri;
    }
    
    // Fetch data from Grove
    const response = await fetch(resolvedUrl);
    console.log('Response:', response);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as T;
    console.log('Data:', data);
    
    // Update cache
    cache[uri] = data;
    cacheTimestamps[uri] = Date.now();
    
    return data;
  } catch (error) {
    console.error(`Error fetching data from Grove (${uri}):`, error);
    throw new Error(`Failed to fetch data from Grove: ${error}`);
  }
}

/**
 * Fetches users from Grove storage
 */
export async function fetchUsers(): Promise<User[]> {
  try {
    const data = await fetchFromGrove<any>(groveUris.users);
    
    // Validate data structure 
    if (!data || !Array.isArray(data.users)) {
      console.warn('Invalid data format for users:', data);
      return []; // Return empty array instead of throwing
    }
    
    return data.users.map((user: any) => ({
      ...user,
      createdAt: user.createdAt ? new Date(user.createdAt as unknown as string) : null
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

/**
 * Fetches trending developers (top users by reputation)
 */
export async function fetchTrendingDevelopers(limit: number = 5): Promise<User[]> {
  try {
    const users = await fetchUsers();
    return users
      .sort((a, b) => (b.reputation || 0) - (a.reputation || 0))
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching trending developers:", error);
    return [];
  }
}

/**
 * Fetches repositories from Grove storage
 */
export async function fetchRepositories(): Promise<Repository[]> {
  try {
    const data = await fetchFromGrove<any>(groveUris.repositories);
    
    // Validate data structure
    if (!data || !Array.isArray(data.repositories)) {
      console.warn('Invalid data format for repositories:', data);
      return []; // Return empty array instead of throwing
    }
    
    return data.repositories.map(formatRepository);
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return [];
  }
}

/**
 * Formats repository data to match expected Repository type
 */
function formatRepository(repo: any): Repository {
  return {
    id: repo.id,
    userId: repo.userId,
    name: repo.name,
    description: repo.description || null,
    stars: repo.stars || 0,
    forks: repo.forks || 0,
    language: repo.language || null,
    nftCount: repo.nftCount || 0,
    lastUpdated: repo.lastUpdated ? new Date(repo.lastUpdated) : new Date()
  };
}

/**
 * Fetches NFTs from Grove storage
 */
export async function fetchNFTs(): Promise<NFT[]> {
  try {
    const data = await fetchFromGrove<any>(groveUris.nfts);
    
    // Validate data structure
    if (!data || !Array.isArray(data.nfts)) {
      console.warn('Invalid data format for NFTs:', data);
      return []; // Return empty array instead of throwing
    }
    
    return data.nfts.map((nft: any) => ({
      ...nft,
      mintedAt: new Date(nft.mintedAt as unknown as string)
    }));
  } catch (error) {
    console.error("Error fetching NFTs:", error);
    return [];
  }
}

/**
 * Fetches activities from Grove storage
 */
export async function fetchActivities(): Promise<Activity[]> {
  try {
    const data = await fetchFromGrove<any>(groveUris.activities);
    
    // Validate data structure
    if (!data || !Array.isArray(data.activities)) {
      console.warn('Invalid data format for activities:', data);
      return []; // Return empty array instead of throwing
    }
    
    return data.activities.map((activity: any) => ({
      ...activity,
      activity: {
        ...activity.activity,
        createdAt: new Date(activity.activity.createdAt as unknown as string)
      },
      user: {
        ...activity.user,
        createdAt: activity.user.createdAt ? new Date(activity.user.createdAt as unknown as string) : null
      }
    }));
  } catch (error) {
    console.error("Error fetching activities:", error);
    return [];
  }
}

/**
 * Searches for users by username or GitHub username
 */
export async function searchUsers(query: string): Promise<User[]> {
  try {
    const users = await fetchUsers();
    const lowerQuery = query.toLowerCase();
    
    return users.filter(user => 
      user.username.toLowerCase().includes(lowerQuery) || 
      (user.githubUsername && user.githubUsername.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
}

/**
 * Gets a user by ID
 */
export async function getUserById(id: number): Promise<User | null> {
  try {
    const users = await fetchUsers();
    return users.find(user => user.id === id) || null;
  } catch (error) {
    console.error(`Error getting user by ID ${id}:`, error);
    return null;
  }
}

/**
 * Gets a user by GitHub username
 */
export async function getUserByGitHubUsername(username: string): Promise<User | null> {
  try {
    const users = await fetchUsers();
    return users.find(user => user.githubUsername === username) || null;
  } catch (error) {
    console.error(`Error getting user by GitHub username ${username}:`, error);
    return null;
  }
}

/**
 * Gets repositories by user ID
 */
export async function getRepositoriesByUserId(userId: number): Promise<Repository[]> {
  try {
    const repositories = await fetchRepositories();
    return repositories.filter(repo => repo.userId === userId);
  } catch (error) {
    console.error(`Error getting repositories for user ${userId}:`, error);
    return [];
  }
}

/**
 * Gets NFTs by user ID
 */
export async function getNFTsByUserId(userId: number): Promise<NFT[]> {
  try {
    const nfts = await fetchNFTs();
    return nfts.filter(nft => nft.userId === userId);
  } catch (error) {
    console.error(`Error getting NFTs for user ${userId}:`, error);
    return [];
  }
}

/**
 * Gets activities by user ID
 */
export async function getActivitiesByUserId(userId: number): Promise<Activity[]> {
  try {
    const activities = await fetchActivities();
    return activities.filter(activity => activity.activity.userId === userId);
  } catch (error) {
    console.error(`Error getting activities for user ${userId}:`, error);
    return [];
  }
} 