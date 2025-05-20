import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Octokit } from '@octokit/core';
import {
  octokit,
  createAuthenticatedClient,
  createTokenClient,
  getAuthenticatedUser,
  type GitHubUser,
} from '@/lib/githubClient';

interface GitHubContextType {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  authenticatedClient: Octokit | null;
  login: (code: string) => Promise<void>;
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
      const client = createTokenClient(token);
      setAuthenticatedClient(client);
      
      // Fetch user data
      getAuthenticatedUser(client)
        .then((userData) => {
          setUser(userData);
          setIsAuthenticated(true);
        })
        .catch(() => {
          // Token might be invalid, remove it
          localStorage.removeItem('github_token');
          setIsAuthenticated(false);
          setUser(null);
          setAuthenticatedClient(null);
        });
    }
  }, []);

  const login = async (code: string) => {
    try {
      const client = await createAuthenticatedClient(code);
      const userData = await getAuthenticatedUser(client);

      setAuthenticatedClient(client);
      setUser(userData);
      setIsAuthenticated(true);

      // Store the token for future sessions
      const auth = await client.auth() as AuthResponse;
      localStorage.setItem('github_token', auth.token);
    } catch (error) {
      console.error('GitHub authentication failed:', error);
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