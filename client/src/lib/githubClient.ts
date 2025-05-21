import { Octokit } from '@octokit/core';

// Create a base Octokit instance factory function instead of a global
export function createOctokit(token?: string): Octokit {
  return new Octokit({
    auth: token
  });
}

// Initialize token-authenticated Octokit instance
export function createTokenClient(token: string | { access_token: string }): Octokit {
  let tokenStr: string;
  
  // Handle token objects from OAuth flows
  if (typeof token === 'object' && token !== null && 'access_token' in token) {
    tokenStr = token.access_token;
  } else if (typeof token === 'string') {
    tokenStr = token;
  } else {
    throw new Error('Invalid token format. Expected string or object with access_token');
  }
  
  return createOctokit(tokenStr);
}

// GitHub API helpers
export async function getAuthenticatedUser(client: Octokit) {
  try {
    const { data: user } = await client.request('GET /user');
    return user as GitHubUser;
  } catch (error) {
    console.error('Error fetching authenticated user:', error);
    throw error;
  }
}

export async function getUserProfile(username: string, client?: Octokit) {
  const octokit = client || createOctokit();
  try {
    const { data: profile } = await octokit.request('GET /users/{username}', {
      username,
    });
    return profile as GitHubUser;
  } catch (error) {
    console.error(`Error fetching GitHub user profile for ${username}:`, error);
    throw error;
  }
}

export async function getUserRepositories(username: string, client?: Octokit, perPage = 100) {
  const octokit = client || createOctokit();
  try {
    const { data: repositories } = await octokit.request('GET /users/{username}/repos', {
      username,
      sort: 'updated',
      per_page: perPage,
    });
    return repositories as GitHubRepository[];
  } catch (error) {
    console.error(`Error fetching repositories for ${username}:`, error);
    throw error;
  }
}

export async function getRepository(owner: string, repo: string, client?: Octokit) {
  const octokit = client || createOctokit();
  try {
    const { data: repository } = await octokit.request('GET /repos/{owner}/{repo}', {
      owner,
      repo,
    });
    return repository as GitHubRepository;
  } catch (error) {
    console.error(`Error fetching repository ${owner}/${repo}:`, error);
    throw error;
  }
}

export async function getRepositoryContributions(owner: string, repo: string, client?: Octokit) {
  const octokit = client || createOctokit();
  try {
    const { data: stats } = await octokit.request('GET /repos/{owner}/{repo}/stats/contributors', {
      owner,
      repo,
    });
    // Use as unknown first to safely cast to our interface
    return stats as unknown as GitHubContributor[];
  } catch (error) {
    console.error(`Error fetching repository contributions for ${owner}/${repo}:`, error);
    throw error;
  }
}

export async function getUserEvents(username: string, client?: Octokit, perPage = 30) {
  const octokit = client || createOctokit();
  try {
    const { data: events } = await octokit.request('GET /users/{username}/events', {
      username,
      per_page: perPage
    });
    return events;
  } catch (error) {
    console.error(`Error fetching events for ${username}:`, error);
    throw error;
  }
}

export async function getUserFollowers(username: string, client?: Octokit) {
  const octokit = client || createOctokit();
  try {
    const { data: followers } = await octokit.request('GET /users/{username}/followers', {
      username,
      per_page: 100
    });
    return followers;
  } catch (error) {
    console.error(`Error fetching followers for ${username}:`, error);
    throw error;
  }
}

export async function getUserFollowing(username: string, client?: Octokit) {
  const octokit = client || createOctokit();
  try {
    const { data: following } = await octokit.request('GET /users/{username}/following', {
      username,
      per_page: 100
    });
    return following;
  } catch (error) {
    console.error(`Error fetching following for ${username}:`, error);
    throw error;
  }
}

export async function getCommitsByUsername(username: string, client?: Octokit, since?: string) {
  const octokit = client || createOctokit();
  try {
    // Get the user's repositories first
    const repos = await getUserRepositories(username, octokit);
    
    // Filter out forks and get the top 5 most recently updated repos
    const topRepos = repos
      .filter(repo => !repo.fork)
      .sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 5);
    
    if (topRepos.length === 0) {
      return { commitCount: 0, commitsByDate: [] };
    }
    
    // Set a default date range of 1 year if not specified
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const sinceDate = since || oneYearAgo.toISOString();
    
    // Get commits for each repository
    const commitCountsByDate = new Map<string, number>();
    let totalCommits = 0;
    
    await Promise.all(topRepos.map(async (repo) => {
      try {
        const { data: commits } = await octokit.request('GET /repos/{owner}/{repo}/commits', {
          owner: repo.owner.login,
          repo: repo.name,
          author: username,
          since: sinceDate,
          per_page: 100
        });
        
        // Count commits by date
        commits.forEach(commit => {
          if (!commit.commit?.author?.date) return;
          
          totalCommits++;
          const dateString = commit.commit.author.date.split('T')[0];
          const currentCount = commitCountsByDate.get(dateString) || 0;
          commitCountsByDate.set(dateString, currentCount + 1);
        });
      } catch (error) {
        console.warn(`Error fetching commits for ${repo.full_name}:`, error);
      }
    }));
    
    // Convert the map to an array of objects
    const commitsByDate = Array.from(commitCountsByDate.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    return {
      commitCount: totalCommits,
      commitsByDate
    };
  } catch (error) {
    console.error(`Error fetching commits for ${username}:`, error);
    throw error;
  }
}

export async function getUserStatistics(username: string, client?: Octokit): Promise<GitHubStatistics> {
  const octokit = client || createOctokit();
  try {
    // Fetch basic profile data
    const profile = await getUserProfile(username, octokit);
    
    // Fetch repositories
    const repositories = await getUserRepositories(username, octokit);
    
    // Get commit statistics (from last year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const { commitCount, commitsByDate } = await getCommitsByUsername(username, octokit, oneYearAgo.toISOString());
    
    // Fetch followers and following
    const [followers, following] = await Promise.all([
      getUserFollowers(username, octokit),
      getUserFollowing(username, octokit)
    ]);
    
    // Fetch recent activity
    const events = await getUserEvents(username, octokit);
    
    // Calculate stars received
    const starsReceived = repositories.reduce((total, repo) => {
      return total + (repo.stargazers_count || 0);
    }, 0);
    
    // Calculate contribution score - a more comprehensive metric
    const contributionScore = Math.min(3000, 
      commitCount * 10 + 
      starsReceived * 5 + 
      (followers ? followers.length * 2 : 0) + 
      repositories.length * 15
    );
    
    return {
      profile,
      repositoryCount: repositories.length,
      commitCount,
      commitsByDate,
      starsReceived,
      followerCount: followers ? followers.length : 0,
      followingCount: following ? following.length : 0,
      events,
      contributionScore
    };
  } catch (error) {
    console.error(`Error fetching GitHub statistics for ${username}:`, error);
    throw error;
  }
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
  location?: string | null;
  company?: string | null;
  blog?: string | null;
  email?: string | null;
  twitter_username?: string | null;
  updated_at?: string;
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
  created_at: string | null;
  updated_at: string | null;
  pushed_at: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  visibility: string;
}

export interface GitHubContributor {
  author: {
    login: string;
    id: number;
  } | null;
  total: number;
  weeks: Array<{
    w: number;
    a: number;
    d: number;
    c: number;
  }>;
}

export interface CommitsByDate {
  date: string;
  count: number;
}

export interface GitHubStatistics {
  profile: GitHubUser;
  repositoryCount: number;
  commitCount: number;
  commitsByDate: CommitsByDate[];
  starsReceived: number;
  followerCount: number;
  followingCount: number;
  events: any[];
  contributionScore: number;
} 