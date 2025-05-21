import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Octokit } from '@octokit/core';
import {
  octokit,
  createTokenClient,
  getAuthenticatedUser,
  type GitHubUser,
} from '@/lib/githubClient';

interface GitHubState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  authenticatedClient: Octokit | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  initGitHub: () => Promise<void>;
}

export const useGitHubStore = create<GitHubState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      authenticatedClient: null,
      
      initGitHub: async () => {
        const token = localStorage.getItem('github_token');
        if (!token) return;
        
        try {
          const client = createTokenClient(token);
          set({ authenticatedClient: client });
          
          // Fetch user data
          const userData = await getAuthenticatedUser(client);
          set({
            user: userData,
            isAuthenticated: true
          });
        } catch (error) {
          console.error('Error authenticating with stored token:', error);
          // Token might be invalid, remove it
          localStorage.removeItem('github_token');
          set({
            isAuthenticated: false,
            user: null,
            authenticatedClient: null
          });
        }
      },
      
      login: async (token: string | any) => {
        try {
          // Debug token value
          console.log('Raw token received:', {
            value: token,
            type: typeof token,
            constructor: token && token.constructor ? token.constructor.name : 'none',
            prototype: token && token.__proto__ ? token.__proto__.constructor.name : 'none',
            stringified: JSON.stringify(token)
          });
          
          if (!token) {
            throw new Error('No token provided');
          }
          
          // Force conversion to string using different methods
          let tokenStr;
          try {
            // Try converting directly to string
            tokenStr = '' + token;
            console.log('Token after string conversion:', tokenStr);
          } catch (e) {
            console.error('Error converting token to string:', e);
            tokenStr = typeof token === 'object' ? JSON.stringify(token) : String(token);
          }
          
          if (!tokenStr || tokenStr.trim() === '') {
            throw new Error('Empty token after conversion');
          }
          
          console.log('Creating GitHub client with token:', {
            tokenType: typeof tokenStr,
            tokenLength: tokenStr.length,
            tokenSample: tokenStr.substring(0, 5) + '...',
            isString: typeof tokenStr === 'string'
          });
          
          // Create client using the token
          let client;
          try {
            client = createTokenClient(tokenStr);
          } catch (clientError) {
            console.error('Error creating client with token, using simplified approach:', clientError);
            // Fallback to direct Octokit creation
            client = new Octokit({
              auth: tokenStr
            });
          }
          
          console.log('Fetching user data from GitHub');
          
          // Verify the token by fetching user data
          const userData = await getAuthenticatedUser(client);
          
          console.log('GitHub user authenticated:', { 
            login: userData.login,
            id: userData.id,
            name: userData.name 
          });

          set({
            authenticatedClient: client,
            user: userData,
            isAuthenticated: true
          });

          // Store the token for future sessions
          localStorage.setItem('github_token', tokenStr);
          
          console.log('GitHub authentication complete');
        } catch (error: any) {
          console.error('GitHub authentication failed:', error);
          // Clear any partial state
          set({
            isAuthenticated: false,
            user: null,
            authenticatedClient: null
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
          authenticatedClient: null
        });
      },
    }),
    {
      name: 'github-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user 
      }),
    }
  )
); 