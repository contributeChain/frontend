// Interface for GitHub user data
export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string;
  bio: string;
  location: string;
  blog: string;
  public_repos: number;
  followers: number;
  following: number;
}

// Interface for GitHub repository data
export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

// Interface for GitHub contribution data
export interface GitHubContribution {
  date: string;
  count: number;
}

// Interface for GitHub activity data
export interface GitHubActivity {
  id: string;
  type: string;
  repo: {
    name: string;
  };
  created_at: string;
  payload: any;
}

import { octokit, getUserProfile, getUserRepositories } from './githubClient';

// Fetch GitHub user profile data
export async function fetchGitHubUser(username: string): Promise<GitHubUser | null> {
  try {
    const user = await getUserProfile(username);
    return {
      login: user.login,
      id: user.id,
      avatar_url: user.avatar_url,
      html_url: user.html_url,
      name: user.name || user.login,
      bio: user.bio || '',
      location: user.location || '',
      blog: user.blog || '',
      public_repos: user.public_repos,
      followers: user.followers,
      following: user.following
    };
  } catch (error) {
    console.error('Error fetching GitHub user:', error);
    return null;
  }
}

// Fetch GitHub user repositories
export async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  try {
    const repos = await getUserRepositories(username);
    return repos.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description || '',
      html_url: repo.html_url,
      language: repo.language || '',
      stargazers_count: repo.stargazers_count || 0,
      forks_count: repo.forks_count || 0,
      updated_at: repo.updated_at || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    return [];
  }
}

// Fetch GitHub user contribution data
export async function fetchGitHubContributions(username: string): Promise<GitHubContribution[]> {
  try {
    // GitHub doesn't have a direct API for contribution calendar data
    // This would require fetching commit data for each repository and aggregating it
    // For now, return an empty array or implement a more complex solution
    console.warn('Using real GitHub API for contributions requires custom implementation');
    return [];
  } catch (error) {
    console.error('Error fetching GitHub contributions:', error);
    return [];
  }
}

// Fetch GitHub user activities
export async function fetchGitHubActivities(username: string): Promise<GitHubActivity[]> {
  try {
    const { data: events } = await octokit.request('GET /users/{username}/events', {
      username,
      per_page: 30
    });
    
    return events.map(event => ({
      id: event.id,
      type: event.type || 'UnknownEvent',
      repo: {
        name: event.repo?.name || 'unknown'
      },
      created_at: event.created_at || new Date().toISOString(),
      payload: event.payload || {}
    }));
  } catch (error) {
    console.error('Error fetching GitHub activities:', error);
    return [];
  }
}

// Connect GitHub account
export async function connectGitHub(): Promise<{ success: boolean; username?: string }> {
  // This function would trigger the OAuth flow
  // The actual implementation would be handled by the OAuth provider
  console.warn('GitHub OAuth flow should be triggered externally');
  return { success: false };
}

// Check if already connected to GitHub
export async function isGitHubConnected(): Promise<boolean> {
  try {
    // This would be handled by the auth state in your application
    return false;
  } catch (error) {
    console.error('Error checking GitHub connection status:', error);
    return false;
  }
}

// Get connected GitHub username
export async function getConnectedGitHubUsername(): Promise<string | null> {
  try {
    // This would be handled by the auth state in your application
    return null;
  } catch (error) {
    console.error('Error getting connected GitHub username:', error);
    return null;
  }
}

// Function to map contribution counts to color levels
export function getContributionColorClass(count: number): string {
  if (count === 0) return 'bg-primary/10';
  if (count <= 2) return 'bg-primary/30';
  if (count <= 5) return 'bg-primary/50';
  if (count <= 10) return 'bg-primary/70';
  return 'bg-primary glow';
}
