import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAccount, useEnsName } from 'wagmi';
import { useGitHub } from './GitHubProvider';
import {
  UserProfile,
  getLocalUserProfile,
  storeLocalUserProfile,
  clearLocalUserProfile,
  linkWalletWithGitHub,
  getGitHubAuthUrl,
  linkWalletWithGitHubToken
} from '@/lib/auth-service';
import { type GitHubUser } from '@/lib/githubClient';

// Define the shape of the Auth context
interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (profile: UserProfile) => void;
  logout: () => void;
  updateUser: (user: Partial<UserProfile>) => void;
  connectGitHub: () => void;
  updateUserWithGitHub: (accessToken: string) => Promise<UserProfile>;
}

// Create the Auth context
const AuthContext = createContext<AuthContextType | null>(null);

// Define the AuthProvider props
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
function AuthProvider({ children }: AuthProviderProps) {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated: isGitHubAuthenticated, user: githubUser, logout: logoutGitHub } = useGitHub();

  // Initialize user from local storage
  useEffect(() => {
    const storedUser = getLocalUserProfile();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // Update user when wallet changes
  useEffect(() => {
    if (address && isConnected) {
      // Check if we have a different address than stored
      if (user && user.walletAddress !== address) {
        // Clear the current user if a different wallet connects
        setUser(null);
        clearLocalUserProfile();
      } 
      // If no user is set but we have an address, we can create a basic profile
      else if (!user) {
        const newUser: UserProfile = {
          walletAddress: address,
          isAuthenticated: false
        };
        setUser(newUser);
        storeLocalUserProfile(newUser);
      }
    } else if (!isConnected && user) {
      // If wallet disconnects, clear the user
      setUser(null);
      clearLocalUserProfile();
    }
  }, [address, isConnected, user]);

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

  // Login function (update or set user profile)
  const login = (profile: UserProfile) => {
    console.log('Logging in with profile:', profile);
    setUser(profile);
    storeLocalUserProfile(profile);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    clearLocalUserProfile();
    logoutGitHub();
  };

  // Calculate authentication status
  const isAuthenticated = !!user?.isAuthenticated;

  const updateUser = (userData: Partial<UserProfile>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...userData };
      storeLocalUserProfile(updatedUser);
      return updatedUser;
    });
  };

  const connectGitHub = () => {
    // Redirect to GitHub OAuth flow
    window.location.href = getGitHubAuthUrl();
  };

  const updateUserWithGitHub = async (accessToken: string): Promise<UserProfile> => {
    try {
      if (!address) {
        throw new Error("No wallet connected");
      }
      
      // Link wallet with GitHub using the token
      const updatedProfile = await linkWalletWithGitHubToken(
        address,
        ensName ? ensName : undefined,
        accessToken
      );
      
      // Update user in state
      setUser(updatedProfile);
      storeLocalUserProfile(updatedProfile);
      
      return updatedProfile;
    } catch (error) {
      console.error("Error updating user with GitHub:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    connectGitHub,
    updateUserWithGitHub,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the Auth context
function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export { AuthProvider, useAuth, type AuthContextType }; 