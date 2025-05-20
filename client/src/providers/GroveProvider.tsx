import { createContext, useContext, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { storageClient, uploadFile, uploadJson, uploadNftMetadata, type UploadConfig } from '@/lib/groveClient';

interface GroveContextType {
  uploadFile: (file: File, config?: UploadConfig) => Promise<{ uri: string }>;
  uploadJson: (data: any) => Promise<{ uri: string }>;
  uploadNftMetadata: (metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string | number }>;
  }) => Promise<{ uri: string }>;
}

const GroveContext = createContext<GroveContextType | null>(null);

export function useGrove() {
  const context = useContext(GroveContext);
  if (!context) {
    throw new Error('useGrove must be used within a GroveProvider');
  }
  return context;
}

interface GroveProviderProps {
  children: ReactNode;
}

export function GroveProvider({ children }: GroveProviderProps) {
  const { address } = useAccount();

  const contextValue: GroveContextType = {
    uploadFile: async (file: File, config?: UploadConfig) => {
      if (!address) {
        throw new Error('Wallet not connected');
      }
      return uploadFile(file, address, config);
    },
    uploadJson: async (data: any) => {
      if (!address) {
        throw new Error('Wallet not connected');
      }
      return uploadJson(data, address);
    },
    uploadNftMetadata: async (metadata) => {
      if (!address) {
        throw new Error('Wallet not connected');
      }
      return uploadNftMetadata(metadata, address);
    },
  };

  return (
    <GroveContext.Provider value={contextValue}>
      {children}
    </GroveContext.Provider>
  );
} 