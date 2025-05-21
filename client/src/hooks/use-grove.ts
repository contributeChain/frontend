import { useGroveStore } from '@/store';
import { useAccount } from 'wagmi';
import type { UploadConfig } from '@/lib/groveClient';

// This is a compatibility layer to provide the same API as the old useGrove hook
export function useGrove() {
  const uploadFileBase = useGroveStore((state) => state.uploadFile);
  const uploadJsonBase = useGroveStore((state) => state.uploadJson);
  const uploadNftMetadataBase = useGroveStore((state) => state.uploadNftMetadata);
  
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

  return {
    uploadFile,
    uploadJson,
    uploadNftMetadata
  };
} 