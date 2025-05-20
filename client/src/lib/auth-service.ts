import { Octokit } from '@octokit/core';
import { createTokenClient, getAuthenticatedUser, type GitHubUser } from './githubClient';
import { uploadJson } from './groveClient';

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
const GITHUB_REDIRECT_URI = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI || `${window.location.origin}/auth/callback`;

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
    client_id: GITHUB_CLIENT_ID || '',
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: 'read:user,repo',
    state: generateRandomState(),
  });

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

// Link wallet with GitHub account
export async function linkWalletWithGitHub(
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
    
    return profile;
  } catch (error) {
    console.error('Failed to link wallet with GitHub:', error);
    throw error;
  }
} 