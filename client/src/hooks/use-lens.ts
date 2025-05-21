import { useLensStore } from '@/store';
import { useAccount, useWalletClient } from 'wagmi';
import { useContext } from 'react';
import { LensContext } from '@/providers/LensProvider';

// Export the hook to use the Lens context directly
export const useLens = () => useContext(LensContext);

// This is a compatibility layer to provide the same API as the old useLens hook
// using the useLensStore under the hood
export function useLensCompat() {
  const { hasProfile, isAuthenticated, isLoading, authenticate: authFn, logout } = useLensStore();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const authenticate = async () => {
    if (!address || !walletClient) return false;
    return authFn(address, walletClient);
  };
  
  return {
    hasProfile,
    isAuthenticated, 
    isLoading,
    authenticate,
    logout
  };
} 