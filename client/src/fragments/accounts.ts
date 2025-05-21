import { UsernameFragment, graphql } from "@lens-protocol/client";
import { MediaImageFragment } from "./images";

export const CustomAccountMetadataFragment = graphql(
  `
    fragment CustomAccountMetadata on AccountMetadata {
      name
      bio

      thumbnail: picture(
        request: { preferTransform: { fixedSize: { height: 128, width: 128 } } }
      )
      picture
    }
  `,
  [MediaImageFragment]
);

export const AccountFragment = graphql(
  `
    fragment Account on Account {
      __typename
      username {
        ...Username
      }
      address
      metadata {
        ...CustomAccountMetadata
      }
    }
  `,
  [UsernameFragment, CustomAccountMetadataFragment]
); 