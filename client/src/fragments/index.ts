import type { FragmentOf } from "@lens-protocol/client";

import { AccountFragment, CustomAccountMetadataFragment } from "./accounts";
import { PostFragment, PostMetadataFragment, PostStatsFragment } from "./posts";
import { MediaImageFragment } from "./images";

declare module "@lens-protocol/client" {
  export interface Account extends FragmentOf<typeof AccountFragment> {}
  export interface AccountMetadata
    extends FragmentOf<typeof CustomAccountMetadataFragment> {}
  export interface MediaImage extends FragmentOf<typeof MediaImageFragment> {}
  export type PostMetadata = FragmentOf<typeof PostMetadataFragment>;
  export type LensPost = FragmentOf<typeof PostFragment>;
  export type PublicationStats = FragmentOf<typeof PostStatsFragment>;
}

export const fragments = [
  AccountFragment,
  CustomAccountMetadataFragment,
  PostFragment,
  PostMetadataFragment,
  PostStatsFragment,
  MediaImageFragment,
]; 