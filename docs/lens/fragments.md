# Lens Protocol GraphQL Fragments

## Core Fragments

### Post Fragment
```graphql
fragment Post on Post {
  id
  author {
    ...Account
  }
  timestamp
  app {
    address
    metadata {
      name
      logo
    }
  }
  metadata {
    ...PostMetadata
  }
  root {
    ...ReferencedPost
  }
  quoteOf {
    ...ReferencedPost
  }
  commentOn {
    ...ReferencedPost
  }
  stats {
    ...PostStats
  }
}
```

### Repost Fragment
```graphql
fragment Repost on Repost {
  id
  author {
    ...Account
  }
  timestamp
  app {
    metadata {
      name
      logo
    }
  }
  repostOf {
    ...Post
  }
}
```

### Account Fragment
```graphql
fragment Account on Account {
  address
  username
  metadata {
    name
    picture
  }
}
```

### ReferencedPost Fragment
```graphql
fragment ReferencedPost on Post {
  id
  author {
    ...Account
  }
  metadata {
    ...PostMetadata
  }

  # root, quoteOf, commentOn omitted to avoid circular references
}
```

### PostStats Fragment
```graphql
fragment PostStats on PostStats {
  # The total number of bookmarks.
  bookmarks

  # The total number of comments.
  comments

  # The total number of reposts.
  reposts

  # The total number of quotes.
  quotes

  # The total number of upvotes.
  upvotes: reactions(request: { type: UPVOTE })

  # The total number of downvotes.
  downvotes: reactions(request: { type: DOWNVOTE })
}
```

## Custom Fragments

This guide expands on how to customize the Lens SDK responses by using custom fragments.

In the Getting Started Guide, we introduced the concept of custom GraphQL fragments. This guide delves into common use cases and potential pitfalls to consider when defining custom fragments.

### Fragment Definitions

A GraphQL fragment, a Fragment Definition to be precise, is a reusable piece of a GraphQL query that defines a subset of fields to be retrieved from the server.

```graphql
fragment FragmentName on TypeName {
  field1
  field2
  field3
}
```

where:
- `FragmentName` is the name of the fragment
- `TypeName` is the type of the node the fragment represents
- `field1`, `field2`, `field3` are the fields to be retrieved

Fragments can include other fragments, known as fragment spreads. This allows you to build complex queries by combining smaller, reusable components.

```graphql
fragment FragmentName on TypeName {
  field1
  field2
  field3 {
    ...OtherFragment
  }
}
```

### Common Use Cases

Use the `graphql` function from the Lens SDK to define custom fragments by passing a query string and an array of imported fragments.

#### Example

```typescript
import { UsernameFragment, graphql } from "@lens-protocol/client";

export const AccountFragment = graphql(
  `
    fragment Account on Account {
      __typename
      username {
        ...Username
      }
      address
    }
  `,
  [UsernameFragment]
);
```

The `graphql` function is a bespoke instance of the gql.tada library that provides a more ergonomic way to define GraphQL fragments.

If a Lens SDK fragment meets your requirements, it is recommended to reuse it to prevent data duplication.

In most cases, Lens SDK fragments are named after the node they represent (e.g., `Account`, `Post`, `Group`, etc.). Any deviations from this naming convention will be explicitly noted in the documentation.

It is essential to name your fragment consistently with the existing Lens SDK fragments. This allows the Lens SDK to seamlessly merge your custom fragment with the predefined ones.

### Post Fields

The `PostFields` fragment is used to retrieve post fields for the `Post` and the `ReferencedPost` fragments.

```typescript
// fragments/posts.ts
import { graphql, PostMetadataFragment } from "@lens-protocol/client";

export const PostFieldsFragment = graphql(
  `
    fragment PostFields on Post {
      slug
      timestamp
      metadata {
        ...PostMetadata
      }
    }
  `,
  [PostMetadataFragment]
);
```

The `ReferencedPost` fragment selects specific fields from a Post, excluding links to other posts. This prevents circular references when retrieving posts.

### Post Metadata

The `PostMetadata` fragment represents a union of all standard Post Metadata types. Use it to retrieve metadata for the specific post types you plan to support in your application (e.g., video, image, text-only, audio, story, embed) while excluding unnecessary types.

```typescript
// fragments/posts.ts
import {
  ArticleMetadataFragment,
  AudioMetadataFragment,
  TextOnlyMetadataFragment,
  ImageMetadataFragment,
  VideoMetadataFragment,
  graphql,
} from "@lens-protocol/client";

export const PostMetadataFragment = graphql(
  `
    fragment PostMetadata on PostMetadata {
      __typename
      ... on ArticleMetadata {
        ...ArticleMetadata
      }
      ... on AudioMetadata {
        ...AudioMetadata
      }
      ... on TextOnlyMetadata {
        ...TextOnlyMetadata
      }
      ... on ImageMetadata {
        ...ImageMetadata
      }
      ... on VideoMetadata {
        ...VideoMetadata
      }
    }
  `,
  [
    ArticleMetadataFragment,
    AudioMetadataFragment,
    TextOnlyMetadataFragment,
    ImageMetadataFragment,
    VideoMetadataFragment,
  ]
);
```

### Media Images

Use custom `MediaImage` fragment to optimize the retrieval of Post images. Use the parametrized `item` field to request images of different sizes and formats.

```typescript
// fragments/images.ts
import { graphql } from "@lens-protocol/client";

export const MediaImageFragment = graphql(
  `
    fragment MediaImage on MediaImage {
      __typename

      full: item

      large: item(request: { preferTransform: { widthBased: { width: 2048 } } })

      thumbnail: item(
        request: { preferTransform: { fixedSize: { height: 128, width: 128 } } }
      )

      altTag
      license
      type
    }
  `
);
```

See the Querying Metadata Media section for more information on this.

### Account Metadata

The `AccountMetadata` fragment is used to retrieve metadata for the `Account` type. Use the `picture` and `coverPicture` fields to retrieve profile and cover images.

```typescript
// fragments/accounts.ts
import { graphql, MediaImageFragment } from "@lens-protocol/client";

export const AccountMetadataFragment = graphql(
  `
    fragment AccountMetadata on AccountMetadata {
      name
      bio

      thumbnail: picture(
        request: { preferTransform: { fixedSize: { height: 128, width: 128 } } }
      )
      picture

      coverPicture
      wideBackground: coverPicture(
        request: { preferTransform: { widthBased: { width: 2048 } } }
      )
    }
  `,
  [MediaImageFragment]
);
```

## Using Fragments with Interfaces and Unions

When working with interfaces and unions in GraphQL, fragments become essential to query specific fields from implementing types. For example, when querying a field that returns a `User` interface (which could be either a `Host` or `Guest`), you need to use fragments to access type-specific fields.

### Inline Fragments

```graphql
query GetMyProfile {
  me {
    __typename
    name
    profilePicture
    ... on Host {
      profileDescription
    }
    ... on Guest {
      funds
    }
  }
}
```

### Named Fragments

```graphql
query GetMyProfile {
  me {
    __typename
    name
    profilePicture
    ...HostProfileFields
    ...GuestProfileFields
  }
}

fragment HostProfileFields on Host {
  profileDescription
}

fragment GuestProfileFields on Guest {
  funds
}
```

## Setting Up Fragment Registry

To use fragments effectively in your application, you can set up a fragment registry:

```typescript
// fragments/index.ts
import type { FragmentOf } from "@lens-protocol/react";
import { AccountFragment, AccountMetadataFragment } from "./accounts";
import { PostMetadataFragment } from "./posts";
import { MediaImageFragment } from "./images";

declare module "@lens-protocol/react" {
  export interface Account extends FragmentOf<typeof AccountFragment> {}
  export interface AccountMetadata extends FragmentOf<typeof AccountMetadataFragment> {}
  export interface MediaImage extends FragmentOf<typeof MediaImageFragment> {}
  export type PostMetadata = FragmentOf<typeof PostMetadataFragment>;
}

export const fragments = [
  AccountFragment,
  PostMetadataFragment,
  MediaImageFragment,
];
```

## Troubleshooting

### Duplicated Fragments

When instantiating the `PublicClient` with fragments, you might encounter the following error:

```
InvariantError: Duplicate fragment detected.
A fragment named "<Name>" has already been provided,
either directly or as part of another fragment document.
```

This means that there are duplicated fragments as part of the fragment documents you provided.

Typically, this occurs when you define a fragment that includes a sub-fragment and then include both the parent fragment and the sub-fragment in the list of fragments passed to the `PublicClient` factory function.

For example, if you defined `PostFieldsFragment` with a bespoke `PostMetadataFragment` like this:

```typescript
const PostFieldsFragment = graphql(
  `
    fragment PostFields on Post {
      metadata {
        ...PostMetadata
      }
    }
  `,
  [PostMetadataFragment]
);
```

Then, omit the `PostMetadataFragment` from the list of fragments passed to the `PublicClient` factory function.

## Data Masking with Fragments

Apollo Client provides data masking capabilities that work well with fragments. When data masking is enabled, fields defined in fragments are hidden from components that don't explicitly request them, preventing implicit dependencies between components.

To use fragments with data masking:

1. Enable data masking in your Apollo Client:
   ```javascript
   const client = new ApolloClient({
     dataMasking: true,
     // ...
   });
   ```

2. Use the `useFragment` hook to access fragment data:
   ```javascript
   function PostDetails({ post }) {
     const { data, complete } = useFragment({
       fragment: POST_DETAILS_FRAGMENT,
       from: post,
     });
     
     // Use data.title, data.content, etc.
   }
   ```

This approach creates more loosely coupled components that are more resistant to change.