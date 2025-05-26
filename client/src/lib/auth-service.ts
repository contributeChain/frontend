import { Octokit } from '@octokit/core';
import { createTokenClient, getAuthenticatedUser, type GitHubUser } from './githubClient';
import { uploadJson } from './groveClient';
import { addUserToCollection as addUserToGroveCollection } from './grove-service';

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || "Ov23lixqQvpop8vkzG0W";
const GITHUB_CLIENT_SECRET = import.meta.env.VITE_GITHUB_CLIENT_SECRET || "25d6196cabad1bb6b1acdb69356295fcffce450c";
const GITHUB_REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI || "http://lo4ks0s4sok0484gk4k0s8ko.35.208.71.32.sslip.io//auth/callback";

console.log('GITHUB_CLIENT_ID', GITHUB_CLIENT_ID);
console.log('GITHUB_CLIENT_SECRET', GITHUB_CLIENT_SECRET);
console.log('GITHUB_REDIRECT_URI', GITHUB_REDIRECT_URI);
// Combined user profile type
export interface UserProfile {
  walletAddress: string;
  ensName?: string;
  githubUser?: GitHubUser;
  lensHandle?: string;
  isAuthenticated: boolean;
}

// Initialize GitHub OAuth URL
export function getGitHubAuthUrl(): string {
  const baseUrl = 'https://github.com/login/oauth/authorize';
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: 'read:user,repo',
    state: generateRandomState(),
  });

  console.log('GitHub Auth URL:', `${baseUrl}?${params.toString()}`);
  return `${baseUrl}?${params.toString()}`;
}

// Generate random state to prevent CSRF attacks
function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Store user profile in Grove
export async function storeUserProfile(profile: UserProfile, walletAddress: `0x${string}`) {
  try {
    const response = await uploadJson(profile, walletAddress);
    return response.uri;
  } catch (error) {
    console.error('Failed to store user profile in Grove:', error);
    throw error;
  }
}

// Get user profile from local storage
export function getLocalUserProfile(): UserProfile | null {
  const storedProfile = localStorage.getItem('user_profile');
  if (storedProfile) {
    try {
      return JSON.parse(storedProfile);
    } catch (error) {
      return null;
    }
  }
  return null;
}

// Store user profile in local storage
export function storeLocalUserProfile(profile: UserProfile): void {
  localStorage.setItem('user_profile', JSON.stringify(profile));
}

// Clear user profile from local storage
export function clearLocalUserProfile(): void {
  localStorage.removeItem('user_profile');
}

// Add user to collection in Grove
export async function addUserToCollection(userData: any, walletAddress: `0x${string}`): Promise<boolean> {
  try {
    return await addUserToGroveCollection(userData, walletAddress);
  } catch (error) {
    console.error('Failed to add user to collection:', error);
    return false;
  }
}

// Link wallet with GitHub account (using token)
export async function linkWalletWithGitHubToken(
  walletAddress: string,
  ensName: string | undefined,
  githubToken: string
): Promise<UserProfile> {
  try {
    // Create GitHub client with token
    const githubClient = createTokenClient(githubToken);
    
    // Get GitHub user data
    const githubUser = await getAuthenticatedUser(githubClient);
    
    // Create combined profile
    const profile: UserProfile = {
      walletAddress,
      ensName,
      githubUser,
      isAuthenticated: true
    };
    
    // Store profile locally
    storeLocalUserProfile(profile);
    
    // Store in Grove if it's an Ethereum address
    if (walletAddress.startsWith('0x') && walletAddress.length === 42) {
      try {
        // Store individual user profile
        await storeUserProfile(profile, walletAddress as `0x${string}`);
        
        // Add user to the users collection
        const userData = {
          id: Date.now(),
          username: githubUser.login,
          githubUsername: githubUser.login,
          avatarUrl: githubUser.avatar_url,
          reputation: 0,
          walletAddress: walletAddress,
          bio: githubUser.bio || null,
          location: githubUser.location || null,
          website: githubUser.blog || githubUser.html_url || null,
          createdAt: new Date()
        };
        
        await addUserToCollection(userData, walletAddress as `0x${string}`);
      } catch (error) {
        console.warn('Failed to store in Grove, but continuing with local storage:', error);
      }
    }
    
    return profile;
  } catch (error) {
    console.error('Failed to link wallet with GitHub:', error);
    throw error;
  }
}

// Link wallet with GitHub account (using GitHub user data)
export async function linkWalletWithGitHub(
  walletAddress: string,
  githubUser: GitHubUser | any
): Promise<UserProfile> {
  try {
    console.log('Linking wallet with GitHub:', {
      walletAddress: walletAddress.substring(0, 8) + '...',
      githubUser: githubUser ? {
        id: githubUser.id,
        login: githubUser.login,
        type: typeof githubUser
      } : null
    });
    
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    
    if (!githubUser) {
      throw new Error('GitHub user data is required');
    }
    
    // Ensure githubUser has required properties
    if (!githubUser.id || !githubUser.login) {
      console.warn('GitHub user data is incomplete:', githubUser);
      // Try to recover if possible
      if (typeof githubUser === 'string') {
        // If it's a stringified object, try to parse it
        try {
          githubUser = JSON.parse(githubUser);
        } catch (e) {
          console.error('Failed to parse GitHub user data:', e);
        }
      }
      
      // If still not valid, create a minimal user object
      if (!githubUser.id || !githubUser.login) {
        githubUser = {
          id: githubUser.id || Date.now(),
          login: githubUser.login || 'github-user',
          name: githubUser.name || 'GitHub User',
          avatar_url: githubUser.avatar_url || '',
          html_url: githubUser.html_url || '',
          ...githubUser
        };
      }
    }
    
    // Get existing profile or create new
    const existingProfile = getLocalUserProfile() || { walletAddress, isAuthenticated: false };
    
    // Create combined profile
    const profile: UserProfile = {
      ...existingProfile,
      walletAddress,
      githubUser,
      isAuthenticated: true
    };
    
    console.log('Created profile:', {
      walletAddress: profile.walletAddress.substring(0, 8) + '...',
      hasGithubUser: !!profile.githubUser,
      isAuthenticated: profile.isAuthenticated
    });
    
    // Store profile locally
    storeLocalUserProfile(profile);
    
    // Store in Grove if it's an Ethereum address
    if (walletAddress.startsWith('0x') && walletAddress.length === 42) {
      try {
        // Store individual user profile
        await storeUserProfile(profile, walletAddress as `0x${string}`);
        console.log('Successfully stored profile in Grove');
        
        // Add user to the users collection
        const userData = {
          id: Date.now(),
          username: githubUser.login,
          githubUsername: githubUser.login,
          avatarUrl: githubUser.avatar_url,
          reputation: 0,
          password: '',  // We don't store actual passwords
          walletAddress: walletAddress,
          bio: githubUser.bio || null,
          location: githubUser.location || null,
          website: githubUser.blog || githubUser.html_url || null,
          createdAt: new Date()
        };
        
        const added = await addUserToCollection(userData, walletAddress as `0x${string}`);
        if (added) {
          console.log('Successfully added/updated user in Grove collection');
        } else {
          console.warn('Failed to add/update user in Grove collection');
        }
      } catch (error) {
        console.warn('Failed to store in Grove, but continuing with local storage:', error);
      }
    } else {
      console.warn('Not storing in Grove: invalid Ethereum address format');
    }
    
    return profile;
  } catch (error) {
    console.error('Failed to link wallet with GitHub:', error);
    throw error;
  }
} 