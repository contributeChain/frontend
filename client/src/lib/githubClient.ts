import { Octokit } from '@octokit/core';
import { createTokenAuth } from '@octokit/auth-token';

// GitHub OAuth App credentials
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID ?? "Ov23liUYQ7DJ0ipEFRWm";
const GITHUB_CLIENT_SECRET = import.meta.env.VITE_GITHUB_CLIENT_SECRET  ?? "d4171172b8b43bd513b6c4bae65fb88a88186c41";

// Initialize base Octokit instance
export const octokit = new Octokit();

// Initialize token-authenticated Octokit instance
export function createTokenClient(token: any) {
  // Enhanced token validation and conversion
  console.log('createTokenClient received token:', {
    type: typeof token,
    constructor: token && token.constructor ? token.constructor.name : 'none',
    prototype: token && token.__proto__ ? token.__proto__.constructor.name : 'none',
    stringRepresentation: typeof token === 'string' ? `${token.substring(0, 5)}...` : 'not a string'
  });
  
  // Ensure token is a string (multiple fallbacks)
  if (token === null || token === undefined) {
    throw new Error('Token must not be null or undefined');
  }
  
  let tokenStr;
  
  // Try various methods to convert to string
  if (typeof token === 'string') {
    // Already a string
    tokenStr = token;
  } else if (typeof token === 'object') {
    // If it's an object with an access_token property, use that
    if (token.access_token && typeof token.access_token === 'string') {
      tokenStr = token.access_token;
    } else {
      // Otherwise stringify the object
      try {
        tokenStr = JSON.stringify(token);
      } catch (e) {
        console.error('Error stringifying token object:', e);
        tokenStr = '' + token; // Last resort
      }
    }
  } else {
    // For numbers, booleans, etc.
    tokenStr = '' + token;
  }
  
  // Final validation
  tokenStr = String(tokenStr).trim();
  
  if (tokenStr === '') {
    throw new Error('Token must be a non-empty string');
  }
  
  console.log('Creating Octokit client with token type:', typeof tokenStr);
  
  // Use a try-catch to handle any errors that might still occur
  try {
    // Change the way we initialize Octokit to bypass the auth strategy
    // This is a workaround for the auth-token module that has strict type checking
    const finalToken = tokenStr;
    
    return new Octokit({
      auth: finalToken
    });
  } catch (error) {
    console.error('Error creating Octokit client:', error);
    throw new Error(`Failed to create GitHub client: ${error}`);
  }
}

// GitHub API helpers
export async function getAuthenticatedUser(client: Octokit) {
  try {
    const { data: user } = await client.request('GET /user');
    return user;
  } catch (error) {
    console.error('Error fetching authenticated user:', error);
    throw error;
  }
}

export async function getUserProfile(username: string) {
  const { data: profile } = await octokit.request('GET /users/{username}', {
    username,
  });
  return profile;
}

export async function getUserRepositories(username: string) {
  const { data: repositories } = await octokit.request('GET /users/{username}/repos', {
    username,
    sort: 'updated',
    per_page: 100,
  });
  return repositories;
}

export async function getRepository(owner: string, repo: string) {
  const { data: repository } = await octokit.request('GET /repos/{owner}/{repo}', {
    owner,
    repo,
  });
  return repository;
}

export async function getRepositoryContributions(owner: string, repo: string) {
  const { data: stats } = await octokit.request('GET /repos/{owner}/{repo}/stats/contributors', {
    owner,
    repo,
  });
  return stats;
}

// Types
export interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  visibility: string;
}

export interface ContributionStats {
  author: {
    login: string;
    id: number;
  };
  total: number;
  weeks: Array<{
    w: string;
    a: number;
    d: number;
    c: number;
  }>;
} 