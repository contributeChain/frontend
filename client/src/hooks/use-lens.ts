import { useLensStore } from '@/store';
import { useAccount, useWalletClient } from 'wagmi';

// This is a compatibility layer to provide the same API as the old useLens hook
export function useLens() {
  const hasProfile = useLensStore((state) => state.hasProfile);
  const isAuthenticated = useLensStore((state) => state.isAuthenticated);
  const isLoading = useLensStore((state) => state.isLoading);
  const logout = useLensStore((state) => state.logout);
  const authenticateBase = useLensStore((state) => state.authenticate);
  
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  // Wrap authenticate to match the original API
  const authenticate = async () => {
    if (!address || !walletClient) return false;
    return authenticateBase(address, walletClient);
  };

  return {
    hasProfile,
    isAuthenticated,
    isLoading,
    authenticate,
    logout
  };
} 