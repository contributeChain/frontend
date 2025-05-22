import { graphql } from "@lens-protocol/client";

export const MediaImageFragment = graphql(`
  fragment MediaImage on Media {
    url
    mimeType
    altTag
  }
`); 