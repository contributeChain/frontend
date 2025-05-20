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
  linkGithubWithWallet: () => Promise<void>;
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
    console.log('GitHub auth state changed:', {
      isConnected,
      address: address?.substring(0, 8) + '...',
      isGitHubAuthenticated,
      hasGithubUser: !!githubUser,
      currentUser: user ? {
        walletAddress: user.walletAddress.substring(0, 8) + '...',
        hasGithubUser: !!user.githubUser
      } : null
    });
    
    const updateWithGitHubInfo = async () => {
      if (isConnected && address && isGitHubAuthenticated && githubUser && user) {
        if (!user.githubUser || user.githubUser.id !== githubUser.id) {
          console.log('Updating user profile with GitHub info');
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

  // Link GitHub account with wallet
  const linkGithubWithWallet = async () => {
    try {
      console.log('Attempting to link GitHub with wallet:', {
        isConnected, 
        address: address?.substring(0, 8) + '...',
        isGitHubAuthenticated,
        hasGithubUser: !!githubUser
      });
      
      if (!isConnected || !address) {
        throw new Error('Wallet not connected');
      }
      
      // Instead of checking isGitHubAuthenticated, check for githubUser directly
      if (!githubUser) {
        throw new Error('GitHub user data not available');
      }
      
      console.log('Linking wallet with GitHub user:', {
        walletAddress: address,
        githubUser: {
          login: githubUser.login,
          id: githubUser.id
        }
      });

      // Link wallet with GitHub in the backend/storage
      await linkWalletWithGitHub(address, githubUser);
      
      // Update local user profile
      if (user) {
        const updatedProfile: UserProfile = {
          ...user,
          githubUser,
          isAuthenticated: true,
        };
        setUser(updatedProfile);
        storeLocalUserProfile(updatedProfile);
        console.log('Successfully linked GitHub with wallet');
      } else {
        console.warn('No user profile to update after GitHub linking');
        // Create a new user profile if none exists
        const newProfile: UserProfile = {
          walletAddress: address,
          githubUser,
          isAuthenticated: true,
        };
        setUser(newProfile);
        storeLocalUserProfile(newProfile);
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error linking GitHub with wallet:', error);
      return Promise.reject(error);
    }
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
    linkGithubWithWallet,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
} 