import { useAccount } from 'wagmi';
import { useAuthStore, useGitHubStore } from '@/store';
import { useMemo } from 'react';

export function useConnections() {
  const { isConnected: wagmiConnected, address } = useAccount();
  
  // Handle the case where address is present but isConnected is false
  // This can happen with ConnectKit in some cases
  const isConnected = useMemo(() => 
    wagmiConnected || !!address, 
    [wagmiConnected, address]
  );
  
  // Auth state - use selectors to avoid unnecessary re-renders
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  
  // GitHub state - use selectors to avoid unnecessary re-renders
  const githubUser = useGitHubStore(state => state.user);
  const isGitHubAuthenticated = useGitHubStore(state => state.isAuthenticated);
  
  // Combined states - memoize to prevent recalculation on every render
  const isFullyConnected = useMemo(
    () => isConnected && isAuthenticated && isGitHubAuthenticated,
    [isConnected, isAuthenticated, isGitHubAuthenticated]
  );
  
  const shouldConnectGitHub = useMemo(
    () => isConnected && !isGitHubAuthenticated,
    [isConnected, isGitHubAuthenticated]
  );
  
  const displayUser = useMemo(
    () => user?.githubUser || githubUser,
    [user?.githubUser, githubUser]
  );

  return {
    // Wallet state
    isConnected,
    wagmiConnected, // Original isConnected from wagmi
    address,
    
    // Auth state
    isAuthenticated,
    user,
    
    // GitHub state
    isGitHubAuthenticated,
    githubUser,
    
    // Combined states
    isFullyConnected,
    shouldConnectGitHub,
    displayUser,
  };
} 