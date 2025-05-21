import { useAuthStore, useGitHubStore } from '@/store';
import type { UserProfile } from '@/lib/auth-service';

// This is a compatibility layer to provide the same API as the old useAuth hook
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const connectGitHub = useAuthStore((state) => state.connectGitHub);
  const updateUserWithGitHub = useAuthStore((state) => state.updateUserWithGitHub);
  const githubLogout = useGitHubStore((state) => state.logout);

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    connectGitHub,
    disconnectGitHub: () => {
      // First, clean up the GitHub store state
      githubLogout();
      
      // Remove GitHub token from localStorage
      localStorage.removeItem('github_token');
      
      // Then update the auth store state
      if (user) {
        // Create a new user object without the githubUser property
        const updatedUser = { ...user };
        delete updatedUser.githubUser;
        updatedUser.isAuthenticated = false;
        updateUser(updatedUser);
      }
    },
    updateUserWithGitHub: (token: string) => {
      // Get the address from the store to avoid needing to pass it
      const address = user?.walletAddress;
      if (!address) {
        throw new Error("No wallet connected");
      }
      return updateUserWithGitHub(token, address);
    }
  };
} 