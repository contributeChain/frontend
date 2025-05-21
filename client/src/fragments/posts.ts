import { graphql } from "@lens-protocol/client";
import { MediaImageFragment } from "./images";

export const PostMetadataFragment = graphql(
  `
    fragment PostMetadata on PublicationMetadata {
      content
      description
      tags
      mainContentFocus
      locale
      
      asset {
        ...MediaImage
      }

      attachments {
        ... on PublicationMetadataMedia {
          media {
            ...MediaImage
          }
        }
      }
    }
  `,
  [MediaImageFragment]
);

export const PostStatsFragment = graphql(`
  fragment PostStats on PublicationStats {
    comments
    collects
    upvotes
    downvotes
    mirrors
  }
`);

export const PostFragment = graphql(
  `
    fragment Post on Post {
      id
      createdAt
      publishedOn {
        id
      }
      momoka
      isHidden
      metadata {
        ...PostMetadata
      }
      stats {
        ...PostStats
      }
      by {
        id
        handle {
          fullHandle
          localName
          namespace
        }
        metadata {
          displayName
          picture {
            ... on ImageSet {
              optimized {
                ...MediaImage
              }
            }
          }
        }
      }
    }
  `,
  [PostMetadataFragment, PostStatsFragment, MediaImageFragment]
); 