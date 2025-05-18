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

// Fetch GitHub user profile data
export async function fetchGitHubUser(username: string): Promise<GitHubUser | null> {
  try {
    const response = await fetch(`/api/github/user/${username}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch GitHub user');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub user:', error);
    return null;
  }
}

// Fetch GitHub user repositories
export async function fetchGitHubRepos(username: string): Promise<GitHubRepo[]> {
  try {
    const response = await fetch(`/api/github/repos/${username}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch GitHub repositories');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    return [];
  }
}

// Fetch GitHub user contribution data
export async function fetchGitHubContributions(username: string): Promise<GitHubContribution[]> {
  try {
    const response = await fetch(`/api/github/contributions/${username}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch GitHub contributions');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub contributions:', error);
    return [];
  }
}

// Fetch GitHub user activities
export async function fetchGitHubActivities(username: string): Promise<GitHubActivity[]> {
  try {
    const response = await fetch(`/api/github/activities/${username}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch GitHub activities');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching GitHub activities:', error);
    return [];
  }
}

// Connect GitHub account
export async function connectGitHub(): Promise<{ success: boolean; username?: string }> {
  try {
    // In a real app, this would redirect to GitHub OAuth flow
    // For demo purposes, we'll simulate a successful connection
    
    // Mock GitHub OAuth flow with a prompt for username
    const username = prompt('Enter your GitHub username:');
    
    if (!username) {
      return { success: false };
    }
    
    // Verify the username exists
    const user = await fetchGitHubUser(username);
    
    if (!user) {
      throw new Error('GitHub user not found');
    }
    
    // Save to our backend
    const response = await fetch('/api/github/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to connect GitHub account');
    }
    
    return { success: true, username };
  } catch (error) {
    console.error('Error connecting GitHub account:', error);
    return { success: false };
  }
}

// Check if already connected to GitHub
export async function isGitHubConnected(): Promise<boolean> {
  try {
    const response = await fetch('/api/github/status');
    
    if (!response.ok) {
      return false;
    }
    
    const data = await response.json();
    return data.connected;
  } catch (error) {
    console.error('Error checking GitHub connection status:', error);
    return false;
  }
}

// Get connected GitHub username
export async function getConnectedGitHubUsername(): Promise<string | null> {
  try {
    const response = await fetch('/api/github/status');
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.username || null;
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
