// Type definitions for Lens Protocol data

// Types for Lens Protocol API responses

export type LensPostMetadata = {
  __typename?: "TextOnlyMetadata" | "ImageMetadata" | string;
  attributes?: Array<{
    key: string;
    value: string;
  }>;
  content?: string;
  contentWarning?: string | null;
  id?: string;
  locale?: string;
  mainContentFocus?: string;
  tags?: string[];
  achievement?: boolean;
};

export type LensPostStats = {
  __typename?: "PostStats";
  bookmarks: number;
  collects: number;
  comments: number;
  quotes: number;
  upvotes: number;
  downvotes: number;
  reposts: number;
  tips: number;
};

export type LensUsername = {
  __typename?: "Username";
  id: string;
  value: string;
  localName: string;
  linkedTo: string;
  ownedBy: string;
  timestamp: string;
  namespace: string;
  operations: any;
};

export type LensAccount = {
  __typename?: "Account";
  address: string;
  owner: string;
  score: number;
  createdAt: string;
  username?: LensUsername;
  metadata?: {
    __typename?: "AccountMetadata";
    attributes: any[];
    bio: string | null;
    coverPicture: string | null;
    id: string;
    name: string | null;
    picture: string | null;
  };
  operations: any;
  rules: {
    __typename?: "AccountFollowRules";
    required: any[];
    anyOf: any[];
  };
  actions: any[];
};

export type LensPost = {
  __typename?: "Post";
  id: string;
  author: LensAccount;
  slug: string;
  isDeleted: boolean;
  isEdited: boolean;
  timestamp: string;
  contentUri: string;
  snapshotUrl: string;
  feed?: {
    __typename?: "PostFeedInfo";
    address: string;
    metadata: any;
    group: any;
  };
  app?: {
    __typename?: "App";
    address: string;
    createdAt: string;
    metadata?: {
      description: string;
      developer: string;
      logo: string;
      name: string;
      platforms: string[];
      privacyPolicy: string;
      tagline: string;
      termsOfService: string;
      url: string;
    };
  };
  metadata: LensPostMetadata;
  mentions: any[];
  stats: LensPostStats;
  actions: any[];
  rules: {
    __typename?: "PostRules";
    required: any[];
    anyOf: any[];
  };
  operations: any;
  collectibleMetadata?: {
    __typename?: "NftMetadata";
    animationUrl: string | null;
    attributes: any[];
    description: string | null;
    externalUrl: string | null;
    image: string | null;
    name: string | null;
  };
  root: any | null;
  quoteOf: any | null;
  commentOn: any | null;
};

export enum PageSizeEnum {
  Ten = "TEN",
  Twenty = "TWENTY",
  Fifty = "FIFTY"
}

// For TypeScript type casting
export interface LensTag {
  name: string;
  color: string;
}

// We don't need to extend the existing Activity interface since we're casting
// the metadata field to our LensPostMetadata type in the component 