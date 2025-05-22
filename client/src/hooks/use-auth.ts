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

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    connectGitHub,
    disconnectGitHub: () => {
      // First, clean up the GitHub store state completely
      // Use direct access to the store to ensure we're calling the most up-to-date method
      const githubStore = useGitHubStore.getState();
      githubStore.logout();
      
      // Remove GitHub token from localStorage
      localStorage.removeItem('github_token');
      
      // Then update the auth store state
      if (user) {
        // Create a new user object without the githubUser property
        const updatedUser = { ...user };
        delete updatedUser.githubUser;
        
        // Update isAuthenticated to false since GitHub is disconnected
        // This matches the field name in the AuthState interface
        updatedUser.isAuthenticated = false;
        
        // Update the store with the new user profile
        updateUser(updatedUser);
        
        // Force a UI update by re-fetching user data after a delay
        setTimeout(() => {
          const authStore = useAuthStore.getState();
          // Double check that the githubUser was removed
          const currentUser = authStore.user;
          if (currentUser && currentUser.githubUser) {
            const cleanUser = { ...currentUser };
            delete cleanUser.githubUser;
            cleanUser.isAuthenticated = false;
            authStore.updateUser(cleanUser);
          }
          
          // Force GitHub store to clear again to be extra safe
          useGitHubStore.getState().logout();
        }, 100);
      }
    },
    updateUserWithGitHub: (token: string) => {
      // Get the address from the store to avoid needing to pass it
      const address = user?.walletAddress;
      if (!address) {
        throw new Error("No wallet connected");
      }
      return updateUserWithGitHub(token, address);
    },
    // Provide access to GitHub data from the store
    github: {
      user: useGitHubStore((state) => state.user),
      repositories: useGitHubStore((state) => state.repositories),
      statistics: useGitHubStore((state) => state.statistics),
      isAuthenticated: useGitHubStore((state) => state.isAuthenticated),
      fetchRepositories: () => useGitHubStore.getState().fetchUserRepositories(),
      fetchStatistics: () => useGitHubStore.getState().fetchUserStatistics()
    }
  };
} 