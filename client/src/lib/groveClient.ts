import { StorageClient, immutable, lensAccountOnly } from "@lens-chain/storage-client";
import { networkConfig } from "./lensClient";
import { DEFAULT_NETWORK } from "@/config/contracts";
import { lens, lensTestnet } from "wagmi/chains";
// Initialize Grove storage client
export const storageClient = StorageClient.create();

// ACL configuration helpers
export const createImmutableACL = () => {
  return immutable(DEFAULT_NETWORK === 'mainnet' ? lens.id : lensTestnet.id);
};

export const createLensAccountACL = (accountAddress: `0x${string}`) => {
  return lensAccountOnly(accountAddress, DEFAULT_NETWORK === 'mainnet' ? lens.id : lensTestnet.id);
};

// File upload configuration
export interface UploadConfig {
  maxSize: number; // in bytes
  allowedTypes: string[];
}

export const defaultUploadConfig: UploadConfig = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/json',
  ],
};

// Upload helpers
export async function uploadFile(
  file: File,
  accountAddress: `0x${string}`,
  config: UploadConfig = defaultUploadConfig
) {
  // Validate file
  if (file.size > config.maxSize) {
    throw new Error(`File size exceeds maximum allowed size of ${config.maxSize / 1024 / 1024}MB`);
  }
  if (!config.allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`);
  }

  // Create ACL for the file
  const acl = createLensAccountACL(accountAddress);

  // Upload file to Grove
  try {
    const response = await storageClient.uploadFile(file, { acl });
    return response;
  } catch (error) {
    console.error('Error uploading file to Grove:', error);
    throw error;
  }
}

// JSON data upload helper
export async function uploadJson(
  data: any,
  accountAddress: `0x${string}`,
) {
  const acl = createLensAccountACL(accountAddress);
  
  try {
    const response = await storageClient.uploadAsJson(data);
    return response;
  } catch (error) {
    console.error('Error uploading JSON to Grove:', error);
    throw error;
  }
}

// Metadata upload helper for NFTs
export async function uploadNftMetadata(
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string | number }>;
  },
  accountAddress: `0x${string}`,
) {
  return uploadJson(metadata, accountAddress);
}

// JSON data update helper
export async function updateJson(
  uri: string,
  data: any,
  accountAddress: `0x${string}`,
) {
  const acl = createLensAccountACL(accountAddress);
  
  try {
    // For now, we're using a workaround since direct updateJson might not be available
    // We'll upload the content as new and manually update the reference in our app
    const response = await storageClient.uploadAsJson(data, { acl });
    console.log(`Updated JSON data. Original URI: ${uri}, New URI: ${response.uri}`);
    return response;
  } catch (error) {
    console.error('Error updating JSON in Grove:', error);
    throw error;
  }
} 