import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { useGitHub } from './GitHubProvider';
import {
  UserProfile,
  getLocalUserProfile,
  storeLocalUserProfile,
  clearLocalUserProfile,
  linkWalletWithGitHub,
  getGitHubAuthUrl
} from '@/lib/auth-service';

// Define Auth context type
interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  connectGitHub: () => void;
  disconnectGitHub: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { address, isConnected } = useAccount();
  const { isAuthenticated: isGitHubAuthenticated, user: githubUser, logout: logoutGitHub } = useGitHub();

  // Initialize user from local storage
  useEffect(() => {
    const initializeUser = async () => {
      try {
        if (isConnected && address) {
          const storedProfile = getLocalUserProfile();
          
          if (storedProfile && storedProfile.walletAddress === address) {
            setUser(storedProfile);
          } else {
            // Create a new profile with wallet address
            const newProfile: UserProfile = {
              walletAddress: address,
              isAuthenticated: false,
            };
            setUser(newProfile);
            storeLocalUserProfile(newProfile);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [isConnected, address]);

  // Update user when GitHub auth changes
  useEffect(() => {
    const updateWithGitHubInfo = async () => {
      if (isConnected && address && isGitHubAuthenticated && githubUser && user) {
        if (!user.githubUser || user.githubUser.id !== githubUser.id) {
          // Update the user profile with GitHub info
          const updatedProfile: UserProfile = {
            ...user,
            githubUser,
            isAuthenticated: true,
          };
          setUser(updatedProfile);
          storeLocalUserProfile(updatedProfile);
        }
      }
    };

    updateWithGitHubInfo();
  }, [isConnected, address, isGitHubAuthenticated, githubUser, user]);

  // Connect GitHub account
  const connectGitHub = () => {
    // Redirect to GitHub OAuth flow
    window.location.href = getGitHubAuthUrl();
  };

  // Disconnect GitHub account
  const disconnectGitHub = () => {
    if (user) {
      // Remove GitHub info from profile
      const updatedProfile: UserProfile = {
        ...user,
        githubUser: undefined,
        isAuthenticated: false,
      };
      setUser(updatedProfile);
      storeLocalUserProfile(updatedProfile);
      
      // Logout from GitHub provider
      logoutGitHub();
    }
  };

  // Logout completely
  const logout = () => {
    clearLocalUserProfile();
    setUser(null);
    logoutGitHub();
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: Boolean(user?.isAuthenticated),
    isLoading,
    connectGitHub,
    disconnectGitHub,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
} 