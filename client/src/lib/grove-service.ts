// @ts-ignore
import groveUris from "../config/grove-uris.json";
import { storageClient } from "./groveClient";
import { createLensAccountACL, updateJson } from "./groveClient";

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

    console.log('Users:', data.users);
    
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
    console.log('Users:', users);
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
 * Gets a user by GitHub username from the Grove storage
 * @param githubUsername The GitHub username to search for
 */
export async function getUserByGitHubUsername(githubUsername: string): Promise<User | null> {
  try {
    const users = await fetchUsers();
    console.log('Users:', users);
    const user = users.find(user => user.githubUsername === githubUsername);
    return user || null;
  } catch (error) {
    console.error(`Error getting user by GitHub username (${githubUsername}):`, error);
    return null;
  }
}

/**
 * Gets repositories by user ID from the Grove storage
 * @param userId The user ID to filter repositories by
 */
export async function getRepositoriesByUserId(userId: number): Promise<Repository[]> {
  try {
    const repositories = await fetchRepositories();
    return repositories.filter(repo => repo.userId === userId);
  } catch (error) {
    console.error(`Error getting repositories by user ID (${userId}):`, error);
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

/**
 * Updates the Grove URI in the configuration file
 * @param key The key in the grove-uris.json file to update (e.g., 'repositories', 'nfts')
 * @param newUri The new URI to save
 */
export async function updateGroveUri(key: keyof typeof groveUris, newUri: string): Promise<boolean> {
  try {
    console.log(`Updating Grove URI for ${key} to ${newUri}`);
    
    // Update the in-memory URI
    (groveUris as any)[key] = newUri;
    
    // Call the API to update the file on the server
    const response = await fetch('/api/grove/uri', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, uri: newUri }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`API error updating Grove URI: ${response.status}`, errorData);
      return false;
    }
    
    const result = await response.json();
    console.log(`API updated Grove URI: ${result.message}`);
    
    // Clear cache for this URI to ensure fresh data on next fetch
    delete cache[newUri];
    delete cacheTimestamps[newUri];
    
    return true;
  } catch (error) {
    console.error(`Error updating Grove URI for ${key}:`, error);
    return false;
  }
}

/**
 * Adds a new NFT to the existing NFT collection in Grove storage
 * @param newNft The new NFT to add to the collection
 * @param walletAddress The wallet address of the user adding the NFT
 */
export async function addNFTToCollection(newNft: NFT, walletAddress: `0x${string}`): Promise<boolean> {
  try {
    console.log('Adding NFT to collection:', newNft);
    
    // 1. Fetch current NFTs collection
    const data = await fetchFromGrove<any>(groveUris.nfts);
    
    // Validate data structure
    if (!data || !Array.isArray(data.nfts)) {
      console.warn('Invalid data format for NFTs:', data);
      return false;
    }
    
    const nfts = data.nfts;
    
    // 2. Add the new NFT to the collection
    nfts.push(newNft);
    console.log('Updated NFT collection:', nfts);
    
    // 3. Upload the updated collection back to Grove
    const updatedData = { nfts };
    
    // Use updateJson to update the existing URI
    const response = await updateJson(
      groveUris.nfts,
      updatedData,
      walletAddress
    );
    
    console.log('Updated NFTs collection:', response);
    
    // Update the URI in the config if it changed
    if (response.uri !== groveUris.nfts) {
      await updateGroveUri('nfts', response.uri);
    }
    
    // Clear cache for the NFTs URI to ensure fresh data on next fetch
    delete cache[groveUris.nfts];
    delete cacheTimestamps[groveUris.nfts];
    
    return true;
  } catch (error) {
    console.error('Error adding NFT to collection:', error);
    return false;
  }
}

/**
 * Adds a new repository to the existing repositories collection in Grove storage
 * @param newRepo The new repository to add to the collection
 * @param walletAddress The wallet address of the user adding the repository
 */
export async function addRepositoryToCollection(newRepo: Repository, walletAddress: `0x${string}`): Promise<boolean> {
  try {
    console.log('Adding repository to collection:', newRepo);
    
    // 1. Fetch current repositories collection
    const data = await fetchFromGrove<any>(groveUris.repositories);
    
    // Validate data structure
    if (!data || !Array.isArray(data.repositories)) {
      console.warn('Invalid data format for repositories:', data);
      return false;
    }
    
    const repositories = data.repositories;
    
    // 2. Add the new repository to the collection
    repositories.push(newRepo);
    console.log('Updated repositories collection:', repositories);
    
    // 3. Upload the updated collection back to Grove
    const updatedData = { repositories };
    
    // Use updateJson to update the existing URI
    const response = await updateJson(
      groveUris.repositories,
      updatedData,
      walletAddress
    );
    
    console.log('Updated repositories collection:', response);
    
    // Update the URI in the config if it changed
    if (response.uri !== groveUris.repositories) {
      await updateGroveUri('repositories', response.uri);
    }
    
    // Clear cache for the repositories URI to ensure fresh data on next fetch
    delete cache[groveUris.repositories];
    delete cacheTimestamps[groveUris.repositories];
    
    return true;
  } catch (error) {
    console.error('Error adding repository to collection:', error);
    return false;
  }
}

/**
 * Adds or updates a user in the users collection in Grove storage
 * @param userData User data to add or update in the collection
 * @param walletAddress The wallet address of the user
 */
export async function addUserToCollection(userData: Partial<User>, walletAddress: `0x${string}`): Promise<boolean> {
  try {
    console.log('Adding/updating user in collection:', userData);
    
    // 1. Fetch current users collection
    const data = await fetchFromGrove<any>(groveUris.users);
    
    // Validate data structure
    if (!data || !Array.isArray(data.users)) {
      console.warn('Invalid data format for users:', data);
      return false;
    }
    
    const users = data.users;
    
    // 2. Check if user already exists (by wallet address or GitHub username)
    const existingUserIndex = users.findIndex((user: User) => 
      (userData.walletAddress && user.walletAddress === userData.walletAddress) || 
      (userData.githubUsername && user.githubUsername === userData.githubUsername)
    );
    
    if (existingUserIndex >= 0) {
      // Update existing user
      users[existingUserIndex] = {
        ...users[existingUserIndex],
        ...userData,
        // Ensure these fields are preserved if they exist
        id: users[existingUserIndex].id || userData.id || Date.now(),
        walletAddress: userData.walletAddress || users[existingUserIndex].walletAddress,
        githubUsername: userData.githubUsername || users[existingUserIndex].githubUsername,
      };
      console.log('Updated existing user:', users[existingUserIndex]);
    } else {
      // Add new user
      const newUser: User = {
        id: userData.id || Date.now(),
        username: userData.username || `user_${Date.now()}`,
        githubUsername: userData.githubUsername || null,
        avatarUrl: userData.avatarUrl || null,
        reputation: userData.reputation || 0,
        password: userData.password || '',
        walletAddress: userData.walletAddress || null,
        bio: userData.bio || null,
        location: userData.location || null,
        website: userData.website || null,
        createdAt: userData.createdAt || new Date(),
      };
      users.push(newUser);
      console.log('Added new user:', newUser);
    }
    
    // 3. Upload the updated collection back to Grove
    const updatedData = { users };
    
    // Use updateJson to update the existing URI
    const response = await updateJson(
      groveUris.users,
      updatedData,
      walletAddress
    );
    
    console.log('Updated users collection:', response);
    
    // Update the URI in the config if it changed
    if (response.uri !== groveUris.users) {
      await updateGroveUri('users', response.uri);
    }
    
    // Clear cache for the users URI to ensure fresh data on next fetch
    delete cache[groveUris.users];
    delete cacheTimestamps[groveUris.users];
    
    return true;
  } catch (error) {
    console.error('Error adding/updating user in collection:', error);
    return false;
  }
}

/**
 * Gets a repository by ID from the Grove storage
 * @param id The ID of the repository to retrieve
 */
export async function getRepositoryById(id: number): Promise<Repository | null> {
  try {
    console.log(`Getting repository by ID: ${id}`);
    const repositories = await fetchRepositories();
    const repository = repositories.find(repo => repo.id === id);
    return repository || null;
  } catch (error) {
    console.error(`Error getting repository by ID (${id}):`, error);
    return null;
  }
}

/**
 * Gets a user by wallet address from the Grove storage
 * @param walletAddress The wallet address to search for
 * @returns The user with the specified wallet address, or null if not found
 */
export async function getUserByWalletAddress(walletAddress: string): Promise<User | null> {
  try {
    const users = await fetchUsers();
    const user = users.find(user => user.walletAddress?.toLowerCase() === walletAddress.toLowerCase());
    return user || null;
  } catch (error) {
    console.error(`Error getting user by wallet address (${walletAddress}):`, error);
    return null;
  }
} 