// Type definitions for Lens Protocol data

// Lens post metadata
export interface LensPostMetadata {
  lensPostId: string;
  tags: Array<{
    name: string;
    color: string;
  }>;
  name?: string;
  description?: string;
  rarity?: string;
  transactionHash?: string;
  tokenId?: string;
  icon?: string;
  language?: string;
  type?: string;
  topic?: string;
  achievement?: boolean;
}

// For TypeScript type casting
export interface LensTag {
  name: string;
  color: string;
}

// We don't need to extend the existing Activity interface since we're casting
// the metadata field to our LensPostMetadata type in the component 