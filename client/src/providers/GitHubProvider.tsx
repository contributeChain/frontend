import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Octokit } from '@octokit/core';
import {
  octokit,
  createTokenClient,
  getAuthenticatedUser,
  type GitHubUser,
} from '@/lib/githubClient';

interface GitHubContextType {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  authenticatedClient: Octokit | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const GitHubContext = createContext<GitHubContextType | null>(null);

export function useGitHub() {
  const context = useContext(GitHubContext);
  if (!context) {
    throw new Error('useGitHub must be used within a GitHubProvider');
  }
  return context;
}

interface GitHubProviderProps {
  children: ReactNode;
}

interface AuthResponse {
  token: string;
  type: string;
}

export function GitHubProvider({ children }: GitHubProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [authenticatedClient, setAuthenticatedClient] = useState<Octokit | null>(null);

  // Check for existing GitHub token on mount
  useEffect(() => {
    const token = localStorage.getItem('github_token');
    if (token) {
      try {
        const client = createTokenClient(token);
        setAuthenticatedClient(client);
        
        // Fetch user data
        getAuthenticatedUser(client)
          .then((userData) => {
            setUser(userData);
            setIsAuthenticated(true);
          })
          .catch((error) => {
            console.error('Error authenticating with stored token:', error);
            // Token might be invalid, remove it
            localStorage.removeItem('github_token');
            setIsAuthenticated(false);
            setUser(null);
            setAuthenticatedClient(null);
          });
      } catch (error) {
        console.error('Invalid token in localStorage:', error);
        localStorage.removeItem('github_token');
      }
    }
  }, []);

  const login = async (token: string | any) => {
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

      setAuthenticatedClient(client);
      setUser(userData);
      setIsAuthenticated(true);

      // Store the token for future sessions
      localStorage.setItem('github_token', tokenStr);
      
      console.log('GitHub authentication complete');
    } catch (error: any) {
      console.error('GitHub authentication failed:', error);
      // Clear any partial state
      setIsAuthenticated(false);
      setUser(null);
      setAuthenticatedClient(null);
      localStorage.removeItem('github_token');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('github_token');
    setIsAuthenticated(false);
    setUser(null);
    setAuthenticatedClient(null);
  };

  const contextValue: GitHubContextType = {
    isAuthenticated,
    user,
    authenticatedClient,
    login,
    logout,
  };

  return (
    <GitHubContext.Provider value={contextValue}>
      {children}
    </GitHubContext.Provider>
  );
} 