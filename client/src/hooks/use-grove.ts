import { useGroveStore } from '@/store';
import { useAccount } from 'wagmi';
import type { UploadConfig } from '@/lib/groveClient';
import { invalidateAllGroveCache, fetchActivities, fetchRepositories, fetchNFTs, fetchUsers } from '@/lib/grove-service';
import { useCallback, useState } from 'react';

// This is a compatibility layer to provide the same API as the old useGrove hook
export function useGrove() {
  const uploadFileBase = useGroveStore((state) => state.uploadFile);
  const uploadJsonBase = useGroveStore((state) => state.uploadJson);
  const uploadNftMetadataBase = useGroveStore((state) => state.uploadNftMetadata);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { address } = useAccount();
  
  // Wrap methods to match the original API
  const uploadFile = async (file: File, config?: UploadConfig) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }
    return uploadFileBase(file, address as `0x${string}`, config);
  };
  
  const uploadJson = async (data: any) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }
    return uploadJsonBase(data, address as `0x${string}`);
  };
  
  const uploadNftMetadata = async (metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string | number }>;
  }) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }
    return uploadNftMetadataBase(metadata, address as `0x${string}`);
  };

  // Function to refresh all Grove data by invalidating the cache
  const refreshGroveData = useCallback(() => {
    console.log("Refreshing all Grove data by invalidating cache");
    invalidateAllGroveCache();
    // If you have any global state update mechanism (like a context or zustand store that holds Grove data),
    // trigger refetching here
  }, []);

  // Enhanced version that ensures data is actually refetched from Grove
  const refreshGroveDataWithFetch = useCallback(async () => {
    setIsRefreshing(true);
    console.log("Refreshing all Grove data with fetch");
    
    try {
      // First, invalidate all caches
      invalidateAllGroveCache();
      
      // Then force refetch of main data collections to warm up the cache
      await Promise.all([
        fetchActivities(),
        fetchRepositories(),
        fetchNFTs(),
        fetchUsers()
      ]);
      
      console.log("All Grove data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing Grove data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return {
    uploadFile,
    uploadJson,
    uploadNftMetadata,
    refreshGroveData,
    refreshGroveDataWithFetch,
    isRefreshing
  };
} 