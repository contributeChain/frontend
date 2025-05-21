import { create } from 'zustand';
import { storageClient, uploadFile, uploadJson, uploadNftMetadata, type UploadConfig } from '@/lib/groveClient';

type HexAddress = `0x${string}`;

interface GroveState {
  uploadFile: (file: File, address: HexAddress, config?: UploadConfig) => Promise<{ uri: string }>;
  uploadJson: (data: any, address: HexAddress) => Promise<{ uri: string }>;
  uploadNftMetadata: (
    metadata: {
      name: string;
      description: string;
      image: string;
      attributes: Array<{ trait_type: string; value: string | number }>;
    },
    address: HexAddress
  ) => Promise<{ uri: string }>;
}

export const useGroveStore = create<GroveState>()((set, get) => ({
  uploadFile: async (file: File, address: HexAddress, config?: UploadConfig) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }
    return uploadFile(file, address, config);
  },
  
  uploadJson: async (data: any, address: HexAddress) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }
    return uploadJson(data, address);
  },
  
  uploadNftMetadata: async (metadata, address: HexAddress) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }
    return uploadNftMetadata(metadata, address);
  },
})); 