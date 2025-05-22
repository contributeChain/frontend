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
    
    if (groveUris[key] === newUri) {
      console.log(`URI for ${key} is already set to ${newUri}, skipping update`);
      return true;
    }
    
    // Update the URI in memory
    groveUris[key] = newUri;
    
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
    
    // Invalidate all Grove cache entries to ensure fresh data everywhere
    invalidateAllGroveCache();
    
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
    
    // Invalidate all Grove cache entries to ensure fresh data everywhere
    invalidateAllGroveCache();
    
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

/**
 * Updates a repository's NFT count in the collection when a new NFT is minted
 * @param repoName The full name of the repository (e.g., "owner/repo")
 * @param walletAddress The wallet address of the user updating the repository
 * @returns True if the update was successful, false otherwise
 */
export async function updateRepositoryNftCount(repoName: string, walletAddress: `0x${string}`): Promise<boolean> {
  try {
    console.log(`Updating NFT count for repository: ${repoName}`);
    
    // 1. Fetch current repositories collection
    const data = await fetchFromGrove<any>(groveUris.repositories);
    
    // Validate data structure
    if (!data || !Array.isArray(data.repositories)) {
      console.warn('Invalid data format for repositories:', data);
      return false;
    }
    
    const repositories = data.repositories;
    
    // 2. Find the repository by name
    const repoIndex = repositories.findIndex((repo: Repository) => repo.name === repoName);
    
    if (repoIndex === -1) {
      console.warn(`Repository "${repoName}" not found in collection`);
      return false;
    }
    
    // 3. Increment the NFT count
    repositories[repoIndex].nftCount = (repositories[repoIndex].nftCount || 0) + 1;
    repositories[repoIndex].lastUpdated = new Date();
    
    console.log(`Updated repository NFT count: ${repositories[repoIndex].nftCount}`);
    
    // 4. Upload the updated collection back to Grove
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
    
    // Invalidate all Grove cache entries to ensure fresh data everywhere
    invalidateAllGroveCache();
    
    return true;
  } catch (error) {
    console.error(`Error updating NFT count for repository "${repoName}":`, error);
    return false;
  }
}

/**
 * Updates a user's information after minting an NFT
 * @param walletAddress The wallet address of the user
 * @returns True if the update was successful, false otherwise
 */
export async function updateUserAfterMinting(walletAddress: `0x${string}`): Promise<boolean> {
  try {
    console.log(`Updating user information after minting for wallet: ${walletAddress}`);
    
    // 1. Get user by wallet address
    const user = await getUserByWalletAddress(walletAddress);
    
    if (!user) {
      console.warn(`User with wallet address "${walletAddress}" not found`);
      return false;
    }
    
    // 2. Fetch current users collection
    const data = await fetchFromGrove<any>(groveUris.users);
    
    // Validate data structure
    if (!data || !Array.isArray(data.users)) {
      console.warn('Invalid data format for users:', data);
      return false;
    }
    
    const users = data.users;
    
    // 3. Find the user in the collection
    const userIndex = users.findIndex((u: any) => u.walletAddress === walletAddress);
    
    if (userIndex === -1) {
      console.warn(`User with wallet address "${walletAddress}" not found in collection`);
      return false;
    }
    
    // 4. Update the user's reputation
    users[userIndex].reputation = (users[userIndex].reputation || 0) + 10; // Add 10 reputation points for minting an NFT
    
    console.log(`Updated user reputation: ${users[userIndex].reputation}`);
    
    // 5. Upload the updated collection back to Grove
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
    
    // Invalidate all Grove cache entries to ensure fresh data everywhere
    invalidateAllGroveCache();
    
    return true;
  } catch (error) {
    console.error(`Error updating user information after minting for wallet "${walletAddress}":`, error);
    return false;
  }
}

/**
 * Adds a new activity to the activities collection in Grove storage
 * @param activityData The activity data to add
 * @param userData The user data associated with the activity
 * @param walletAddress The wallet address of the user adding the activity
 * @returns True if the activity was added successfully, false otherwise
 */
export async function addActivityToCollection(
  activityData: {
    type: string;
    repoName?: string;
    description: string;
    metadata?: {
      tags?: Array<{ name: string; color: string }>;
      name?: string;
      description?: string;
      rarity?: string;
      transactionHash?: string;
      [key: string]: any;
    };
  },
  userData: User,
  walletAddress: `0x${string}`
): Promise<boolean> {
  try {
    console.log('Adding activity to collection:', activityData);
    
    // 1. Fetch current activities collection
    const data = await fetchFromGrove<any>(groveUris.activities);
    
    // Validate data structure
    if (!data || !Array.isArray(data.activities)) {
      console.warn('Invalid data format for activities:', data);
      return false;
    }
    
    const activities = data.activities;
    
    // 2. Create new activity object
    const newActivity = {
      activity: {
        id: Date.now(),
        userId: userData.id,
        type: activityData.type,
        repoName: activityData.repoName || undefined,
        description: activityData.description,
        createdAt: new Date(),
        metadata: activityData.metadata || {}
      },
      user: userData
    };
    
    // 3. Add the new activity to the collection
    activities.push(newActivity);
    
    console.log('Updated activities collection with new activity:', newActivity);
    
    // 4. Upload the updated collection back to Grove
    const updatedData = { activities };
    
    // Use updateJson to update the existing URI
    const response = await updateJson(
      groveUris.activities,
      updatedData,
      walletAddress
    );
    
    console.log('Updated activities collection:', response);
    
    // Update the URI in the config if it changed
    if (response.uri !== groveUris.activities) {
      await updateGroveUri('activities', response.uri);
    }
    
    // Invalidate all Grove cache entries to ensure fresh data everywhere
    invalidateAllGroveCache();
    
    return true;
  } catch (error) {
    console.error('Error adding activity to collection:', error);
    return false;
  }
}

/**
 * Invalidates all Grove cache entries to ensure fresh data is fetched
 * Call this function after major updates to ensure all components display the latest data
 */
export function invalidateAllGroveCache(): void {
  console.log('Invalidating all Grove cache entries');
  
  // Get all URIs from the groveUris object
  Object.values(groveUris).forEach(uri => {
    // Skip non-string values like timestamps
    if (typeof uri === 'string') {
      delete cache[uri];
      delete cacheTimestamps[uri];
      console.log(`Invalidated cache for URI: ${uri}`);
    }
  });
}

/**
 * Add a repository follow activity and update user data
 * @param repoName Repository name being followed
 * @param userData User data of the follower
 * @param walletAddress Wallet address of the follower
 * @returns True if the follow activity was added successfully, false otherwise
 */
export async function addRepositoryFollowActivity(
  repoName: string, 
  userData: User,
  walletAddress: `0x${string}`
): Promise<boolean> {
  try {
    console.log(`Adding repository follow activity for ${repoName} by user ${userData.username}`);
    
    // 1. Add the follow activity
    const activityAdded = await addActivityToCollection(
      {
        type: 'repo_follow',
        repoName: repoName,
        description: `Started following ${repoName}`,
        metadata: {
          tags: [
            { name: 'Follow', color: '#10B981' }
          ]
        }
      },
      userData,
      walletAddress
    );
    
    if (!activityAdded) {
      console.warn(`Failed to add repository follow activity for ${repoName}`);
      return false;
    }
    
    // NOTE: If you want to update follow counts or other repository metrics,
    // add that functionality here
    
    return true;
  } catch (error) {
    console.error(`Error adding repository follow activity for ${repoName}:`, error);
    return false;
  }
}

/**
 * Add a user follow activity and update user data
 * @param followedUser User being followed
 * @param followerUser User who is following
 * @param walletAddress Wallet address of the follower
 * @returns True if the follow activity was added successfully, false otherwise
 */
export async function addUserFollowActivity(
  followedUser: User, 
  followerUser: User,
  walletAddress: `0x${string}`
): Promise<boolean> {
  try {
    console.log(`Adding user follow activity for ${followedUser.username} by user ${followerUser.username}`);
    
    // 1. Add the follow activity
    const activityAdded = await addActivityToCollection(
      {
        type: 'user_follow',
        description: `Started following ${followedUser.username}`,
        metadata: {
          followedUserId: followedUser.id,
          followedUsername: followedUser.username,
          tags: [
            { name: 'Follow', color: '#10B981' }
          ]
        }
      },
      followerUser,
      walletAddress
    );
    
    if (!activityAdded) {
      console.warn(`Failed to add user follow activity for ${followedUser.username}`);
      return false;
    }
    
    // NOTE: If you want to update follower/following counts or other user metrics,
    // add that functionality here
    
    return true;
  } catch (error) {
    console.error(`Error adding user follow activity for ${followedUser.username}:`, error);
    return false;
  }
}

/**
 * Check if a user is following another user
 * @param followerWalletAddress Wallet address of the follower
 * @param followedUserId ID of the user being followed
 * @returns True if the user is following, false otherwise
 */
export async function isFollowingUser(followerWalletAddress: string, followedUserId: number): Promise<boolean> {
  try {
    // Get user by wallet address
    const follower = await getUserByWalletAddress(followerWalletAddress);
    if (!follower) {
      return false;
    }
    
    // Get activities
    const activities = await fetchActivities();
    
    // Filter activities to find follow activity from this user to the target user
    const followActivity = activities.find(activity => {
      // Check if this is a user_follow activity from the follower
      if (activity.activity.userId === follower.id && activity.activity.type === 'user_follow') {
        // Access metadata safely with type assertion
        const metadata = activity.activity.metadata as { followedUserId?: number };
        return metadata?.followedUserId === followedUserId;
      }
      return false;
    });
    
    return !!followActivity;
  } catch (error) {
    console.error(`Error checking if user is following another user:`, error);
    return false;
  }
}

/**
 * Check if a user is following a repository
 * @param walletAddress Wallet address of the follower
 * @param repoName Full name of the repository (e.g., "owner/repo")
 * @returns True if the user is following the repository, false otherwise
 */
export async function isFollowingRepository(walletAddress: string, repoName: string): Promise<boolean> {
  try {
    // Get user by wallet address
    const user = await getUserByWalletAddress(walletAddress);
    if (!user) {
      return false;
    }
    
    // Get activities
    const activities = await fetchActivities();
    
    // Filter activities to find follow activity from this user to the target repository
    const followActivity = activities.find(activity => 
      activity.activity.userId === user.id && 
      activity.activity.type === 'repo_follow' && 
      activity.activity.repoName === repoName
    );
    
    return !!followActivity;
  } catch (error) {
    console.error(`Error checking if user is following repository ${repoName}:`, error);
    return false;
  }
}

/**
 * Get NFTs associated with a specific repository
 * @param repoName Repository name (e.g., "owner/repo")
 * @returns Array of NFTs associated with the repository
 */
export async function getNFTsByRepoName(repoName: string): Promise<NFT[]> {
  try {
    const allNfts = await fetchNFTs();
    
    // Filter NFTs by repository name
    return allNfts.filter(nft => 
      nft.repoName === repoName ||
      (nft.metadata && nft.metadata.repository === repoName)
    );
  } catch (error) {
    console.error(`Error getting NFTs for repository ${repoName}:`, error);
    return [];
  }
}

/**
 * Check if a user has already minted an NFT for a specific repository
 * @param walletAddress The wallet address of the user
 * @param repoName Repository name (e.g., "owner/repo")
 * @returns True if the user has already minted an NFT for this repository, false otherwise
 */
export async function hasUserMintedNFTForRepo(walletAddress: string, repoName: string): Promise<boolean> {
  try {
    // Get user by wallet address
    const user = await getUserByWalletAddress(walletAddress);
    if (!user) {
      return false;
    }
    
    // Get all NFTs for this repository
    const repoNfts = await getNFTsByRepoName(repoName);
    
    // Check if any of these NFTs were minted by this user
    const userNft = repoNfts.find(nft => nft.userId === user.id);
    
    return !!userNft;
  } catch (error) {
    console.error(`Error checking if user has minted NFT for repository ${repoName}:`, error);
    return false;
  }
}

/**
 * Remove user follow activity
 * @param followedUser User being unfollowed
 * @param followerWalletAddress Wallet address of the follower who is unfollowing
 * @returns True if the unfollow action was successful, false otherwise
 */
export async function removeUserFollowActivity(
  followedUser: User,
  followerWalletAddress: `0x${string}`
): Promise<boolean> {
  try {
    console.log(`Removing follow activity for ${followedUser.username} by wallet ${followerWalletAddress}`);
    
    // Get user by wallet address
    const follower = await getUserByWalletAddress(followerWalletAddress);
    if (!follower) {
      console.warn(`Follower with wallet address ${followerWalletAddress} not found`);
      return false;
    }
    
    // 1. Fetch current activities collection
    const data = await fetchFromGrove<any>(groveUris.activities);
    
    // Validate data structure
    if (!data || !Array.isArray(data.activities)) {
      console.warn('Invalid data format for activities:', data);
      return false;
    }
    
    const activities = data.activities;
    
    // Find the index of the follow activity to remove
    const followActivityIndex = activities.findIndex((activity: Activity) => {
      // Use type assertion for the metadata
      const metadata = activity.activity.metadata as { followedUserId?: number };
      return (
        activity.activity.userId === follower.id && 
        activity.activity.type === 'user_follow' && 
        metadata?.followedUserId === followedUser.id
      );
    });
    
    if (followActivityIndex === -1) {
      console.warn(`Follow activity not found for ${followedUser.username} by ${follower.username}`);
      return false;
    }
    
    // Remove the activity
    activities.splice(followActivityIndex, 1);
    console.log(`Removed follow activity at index ${followActivityIndex}`);
    
    // 3. Upload the updated collection back to Grove
    const updatedData = { activities };
    
    // Use updateJson to update the existing URI
    const response = await updateJson(
      groveUris.activities,
      updatedData,
      followerWalletAddress
    );
    
    console.log('Updated activities collection after removing follow:', response);
    
    // Update the URI in the config if it changed
    if (response.uri !== groveUris.activities) {
      await updateGroveUri('activities', response.uri);
    }
    
    // Invalidate all Grove cache entries to ensure fresh data everywhere
    invalidateAllGroveCache();
    
    return true;
  } catch (error) {
    console.error(`Error removing follow activity for ${followedUser.username}:`, error);
    return false;
  }
} 