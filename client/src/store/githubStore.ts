import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Octokit } from '@octokit/core';
import {
  getAuthenticatedUser,
  type GitHubUser,
  type GitHubRepository,
  type GitHubStatistics
} from '@/lib/githubClient';

interface GitHubState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  repositories: GitHubRepository[] | null;
  statistics: GitHubStatistics | null;
  octokit: Octokit | null;
  
  // Authentication methods
  login: (token: string) => Promise<void>;
  logout: () => void;
  initGitHub: () => Promise<void>;
  
  // Data fetch methods
  fetchUserRepositories: () => Promise<GitHubRepository[] | null>;
  fetchUserStatistics: () => Promise<GitHubStatistics | null>;
}

// Custom selector function to help prevent unnecessary rerenders
export const createGitHubSelector = <T>(selector: (state: GitHubState) => T) => {
  return (state: GitHubState) => selector(state);
};

export const useGitHubStore = create<GitHubState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      repositories: null,
      statistics: null,
      octokit: null,
      
      initGitHub: async () => {
        const token = localStorage.getItem('github_token');
        if (!token) return;
        
        try {
          // Create an authenticated Octokit instance
          const octokitClient = new Octokit({ auth: token });
          
          // Fetch user data to validate the token
          const userData = await getAuthenticatedUser(octokitClient);
          
          set({
            octokit: octokitClient,
            user: userData,
            isAuthenticated: true
          });
          
          // We could optionally pre-fetch repositories here
          // Uncomment if you want to load repos on initialization
          // get().fetchUserRepositories();
        } catch (error) {
          console.error('Error authenticating with stored token:', error);
          // Token might be invalid, remove it
          localStorage.removeItem('github_token');
          set({
            isAuthenticated: false,
            user: null,
            octokit: null,
            repositories: null,
            statistics: null
          });
        }
      },
      
      login: async (token: string) => {
        try {
          if (!token) {
            throw new Error('No token provided');
          }
          
          // Ensure token is a string
          const tokenStr = String(token).trim();
          
          if (!tokenStr) {
            throw new Error('Empty token after conversion');
          }
          
          // Create an authenticated Octokit instance
          const octokitClient = new Octokit({ auth: tokenStr });
          
          // Verify the token by fetching user data
          const userData = await getAuthenticatedUser(octokitClient);
          
          console.log('GitHub user authenticated:', { 
            login: userData.login,
            id: userData.id,
            name: userData.name 
          });

          set({
            octokit: octokitClient,
            user: userData,
            isAuthenticated: true
          });

          // Store the token for future sessions
          localStorage.setItem('github_token', tokenStr);
          
          // Fetch repositories after successful login
          get().fetchUserRepositories();
          
          console.log('GitHub authentication complete');
        } catch (error: any) {
          console.error('GitHub authentication failed:', error);
          // Clear any partial state
          set({
            isAuthenticated: false,
            user: null,
            octokit: null,
            repositories: null,
            statistics: null
          });
          localStorage.removeItem('github_token');
          throw error;
        }
      },
      
      logout: () => {
        localStorage.removeItem('github_token');
        set({
          isAuthenticated: false,
          user: null,
          octokit: null,
          repositories: null,
          statistics: null
        });
      },
      
      fetchUserRepositories: async () => {
        const { octokit, user } = get();
        
        if (!octokit || !user) {
          console.error('Cannot fetch repos: No authenticated GitHub client or user');
          return null;
        }
        
        try {
          const { data: repos } = await octokit.request('GET /user/repos', {
            sort: 'updated',
            per_page: 100
          });
          
          set({ repositories: repos as GitHubRepository[] });
          return repos as GitHubRepository[];
        } catch (error) {
          console.error('Error fetching repositories:', error);
          return null;
        }
      },
      
      fetchUserStatistics: async () => {
        const { octokit, user } = get();
        
        if (!octokit || !user) {
          console.error('Cannot fetch statistics: No authenticated GitHub client or user');
          return null;
        }
        
        try {
          // This is a simplified version - in a real app you might
          // want to implement a more comprehensive statistics calculation
          const { data: repos } = await octokit.request('GET /user/repos', {
            sort: 'updated',
            per_page: 100
          });
          
          const { data: followers } = await octokit.request('GET /user/followers', {
            per_page: 100
          });
          
          const { data: following } = await octokit.request('GET /user/following', {
            per_page: 100
          });
          
          // Calculate stars received
          const starsReceived = repos.reduce((total, repo) => {
            return total + (repo.stargazers_count || 0);
          }, 0);
          
          const stats: GitHubStatistics = {
            profile: user,
            repositoryCount: repos.length,
            commitCount: 0, // We'd need more complex API calls to get this
            commitsByDate: [],
            starsReceived,
            followerCount: followers.length,
            followingCount: following.length,
            events: [],
            contributionScore: starsReceived * 5 + followers.length * 2 + repos.length * 15
          };
          
          set({ statistics: stats });
          return stats;
        } catch (error) {
          console.error('Error fetching user statistics:', error);
          return null;
        }
      }
    }),
    {
      name: 'github-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        repositories: state.repositories,
        statistics: state.statistics
      }),
    }
  )
);

// Custom selectors for various pieces of state
export const useGitHubUser = () => useGitHubStore(state => state.user);
export const useGitHubRepositories = () => useGitHubStore(state => state.repositories);
export const useGitHubStatistics = () => useGitHubStore(state => state.statistics);
export const useGitHubAuthenticated = () => useGitHubStore(state => state.isAuthenticated); 