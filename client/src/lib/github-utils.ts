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
  email?: string | null;
  company?: string | null;
  hireable?: boolean | null;
  twitter_username?: string | null;
  created_at?: string;
  updated_at?: string;
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
  topics?: string[];
  owner?: {
    login: string;
    avatar_url: string;
  };
  visibility?: string;
  open_issues_count?: number;
  watchers_count?: number;
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
  actor?: {
    login: string;
    avatar_url: string;
  };
}

// Enhanced interface for a single commit
export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      email: string;
      date: string;
    }
  };
  html_url: string;
  repository?: string;
}

// Interface for GitHub event payload that includes commits
interface PushEventPayload {
  commits?: Array<{
    sha: string;
    message: string;
    author: {
      name: string;
      email: string;
    }
  }>;
  [key: string]: any;
}

import { Octokit } from '@octokit/core';
import { getUserProfile, getUserRepositories } from './githubClient';

// Create Octokit instance
function createOctokit(token?: string): Octokit {
  return new Octokit({
    auth: token
  });
}

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
      following: user.following,
      email: user.email,
      company: user.company,
      twitter_username: user.twitter_username,
      created_at: user.created_at,
      updated_at: user.updated_at
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
      updated_at: repo.updated_at || new Date().toISOString(),
      topics: repo.topics || [],
      owner: repo.owner,
      visibility: repo.visibility,
      watchers_count: repo.watchers_count
    }));
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    return [];
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
