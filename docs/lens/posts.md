# Posts

This guide covers everything you need to know about creating and managing posts on Lens.

## Create a Post

To create a post, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to create a post.

### 1. Create Post Metadata

First, construct a Post Metadata object with the necessary content.

```ts
import { textOnly } from "@lens-protocol/metadata";

const metadata = textOnly({
  content: "Hello World!",
});
```

For more complex posts, you can use other metadata constructors:

```ts
import { article, image, video } from "@lens-protocol/metadata";

// Article post
const articleMetadata = article({
  title: "My Article",
  content: "This is my article content",
  attachments: [
    {
      item: "ipfs://QmV5dYTm8LLmHEGLGEQDGvjq4jeoHjKgQWXgTQNKQgVFK1",
      type: "image/jpeg",
    },
  ],
});

// Image post
const imageMetadata = image({
  image: "ipfs://QmV5dYTm8LLmHEGLGEQDGvjq4jeoHjKgQWXgTQNKQgVFK1",
  title: "My Image",
  content: "This is my image description",
});

// Video post
const videoMetadata = video({
  video: "ipfs://QmV5dYTm8LLmHEGLGEQDGvjq4jeoHjKgQWXgTQNKQgVFK1",
  title: "My Video",
  content: "This is my video description",
});
```

See the Metadata Standards guide for more information on creating different types of metadata.

### 2. Upload Post Metadata

Next, upload the Post Metadata object to a public URI.

```ts
import { storageClient } from "./storage-client";

const { uri } = await storageClient.uploadAsJson(metadata);

console.log(uri); // e.g., lens://4f91ca…
```

This example uses Grove storage to host the Metadata object. See the Lens Metadata Standards guide for more information on hosting Metadata objects.

### 3. Create Post

Next, create the post using the `post` action.

```ts
import { uri } from "protocol/client";
import { post } from "protocol/client/actions";

// …

const result = await post(sessionClient, {
  contentUri: uri("lens://4f91…"), // the URI from the previous step
});
```

### 4. Handle Result

Next, handle the result using the adapter for the library of your choice and wait for it to be indexed.

```ts
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await post(sessionClient, {
  contentUri: uri("lens://4f91…"), // the URI from the previous step
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

### 5. Fetch New Post

Finally, fetch the newly created post using the `fetchPost` action.

```ts
import { fetchPost } from "protocol/client/actions";

// …

const result = await post(sessionClient, {
  contentUri: uri("lens://4f91…"), // the URI from the previous step
})
  .andThen(handleOperationWith(walletClientOrSigner))
  .andThen(sessionClient.waitForTransaction)
  .andThen((txHash) => fetchPost(sessionClient, { txHash }));

if (result.isErr()) {
  return console.error(result.error);
}

// post: Post | null
const post = result.value;
```

That's it—you now have a post on Lens!

## Fetch Posts

This guide will show you how to fetch post data in different ways.

Lens Post data has a rich structure that includes the following information:

- Post ID
- Post Metadata content
- Creator information
- Timestamp
- App information 
- Root, quote, and comment references
- Engagement metrics (bookmarks, comments, reposts, quotes, reactions)

To illustrate how to fetch posts, we will use the following fragments:

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

fragment Account on Account {
  address
  username
  metadata {
    name
    picture
  }
}

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

### Get a Post

Use the `fetchPost` action to fetch a single post by ID or by transaction hash.

```ts
// By ID
import { postId } from "protocol/client";
import { fetchPost } from "protocol/client/actions";

import { client } from "./client";

const result = await fetchPost(client, {
  post: postId("01234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

const post = result.value;
```

### List Posts

Use the paginated `fetchPosts` action to fetch a list of posts based on the provided filters.

```ts
// By Creator
import { evmAddress } from "protocol/client";
import { fetchPosts } from "protocol/client/actions";

import { client } from "./client";

const result = await fetchPosts(client, {
  where: {
    from: [evmAddress("0x1234…")],
  },
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Post>
const { items, pageInfo } = result.value;
```

### List Posts by Search Query

Use the search query filter to find posts by text content.

```ts
import { evmAddress } from "protocol/client";
import { fetchPosts } from "protocol/client/actions";

import { client } from "./client";

const result = await fetchPosts(client, {
  filter: {
    searchQuery: "Hello, World!",
  },
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<AnyPost>
const { items, pageInfo } = result.value;
```

### List Posts by Feeds

Use the feeds filter to fetch posts from global or custom feeds.

```ts
import { evmAddress } from "protocol/client";
import { fetchPosts } from "protocol/client/actions";

import { client } from "./client";

const result = await fetchPosts(client, {
  filter: {
    feeds: [
      // filter by the global feed
      {
        globalFeed: true,
      },

      // filter by a specific feed address
      // {
      //   feed: evmAddress("0x5678…"),
      // },

      // filter by ALL feeds associated with an app address
      // {
      //   app: evmAddress("0x9123…"),
      // }
    ],
  },
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<AnyPost>
const { items, pageInfo } = result.value;
```

### List Posts by Apps

Use the apps filter to fetch posts created through specific applications.

```ts
import { evmAddress } from "protocol/client";
import { fetchPosts } from "protocol/client/actions";

import { client } from "./client";

const result = await fetchPosts(client, {
  filter: {
    // apps used to publish the posts
    apps: [evmAddress("0x1234…"), evmAddress("0x5678…")]
  },
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<AnyPost>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

### List Comments

Use the paginated `fetchComments` action to fetch a list of comments for a post.

```ts
import { postId } from "protocol/client";
import { fetchComments } from "protocol/client/actions";

import { client } from "./client";

const result = await fetchComments(client, {
  for: postId("0x01-0x01"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Comment>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

### List Mirrors

Use the paginated `fetchMirrors` action to fetch a list of mirrors for a post.

```ts
import { postId } from "protocol/client";
import { fetchMirrors } from "protocol/client/actions";

import { client } from "./client";

const result = await fetchMirrors(client, {
  for: postId("0x01-0x01"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Mirror>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

### List Reactions

Use the paginated `fetchReactions` action to fetch a list of reactions for a post.

```ts
import { postId } from "protocol/client";
import { fetchReactions } from "protocol/client/actions";

import { client } from "./client";

const result = await fetchReactions(client, {
  for: postId("0x01-0x01"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Reaction>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

## Create a Comment

To create a comment on a post, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to create a comment.

### 1. Check Parent Rules

First, inspect the `post.operations.canComment` field to determine whether the logged-in Account is allowed to comment on a given post. Some posts may have restrictions on who can comment on them.

Comments cannot have their own Post Rules. Instead, they inherit the rules of the root post (either a Post or a Quote) in the thread. The operations field of a comment reflects the rules of the root post.

```ts
switch (post.operations.canComment.__typename) {
  case "PostOperationValidationPassed":
    // Commenting is allowed
    break;

  case "PostOperationValidationFailed":
    // Commenting is not allowed
    console.log(post.operations.canComment.reason);
    break;

  case "PostOperationValidationUnknown":
    // Validation outcome is unknown
    break;
}
```

Where:

- `PostOperationValidationPassed`: The logged-in Account can comment on the Post.
- `PostOperationValidationFailed`: Commenting is not allowed. The `reason` field explains why, and `unsatisfiedRules` lists the unmet requirements.
- `PostOperationValidationUnknown`: The Post or its Feed (for custom Feeds) has one or more unknown rules requiring ad-hoc verification. The `extraChecksRequired` field provides the addresses and configurations of these rules.

Treat the `PostOperationValidationUnknown` as failed unless you intend to support the specific rules. See Post Rules for more information.

### 2. Create Comment Metadata

Next, construct a Comment Metadata object with the necessary content.

```ts
import { textOnly } from "@lens-protocol/metadata";

const metadata = textOnly({
  content: "This is my comment!",
});
```

### 3. Upload Comment Metadata

Next, upload the Comment Metadata object to a public URI.

```ts
import { storageClient } from "./storage-client";

const { uri } = await storageClient.uploadAsJson(metadata);

console.log(uri); // e.g., lens://4f91ca…
```

This example uses Grove storage to host the Metadata object. See the Lens Metadata Standards guide for more information on hosting Metadata objects.

### 4. Create Comment

Next, create the comment using the `post` action with the `commentOn` parameter.

```ts
import { postId, uri } from "protocol/client";
import { post } from "protocol/client/actions";

const result = await post(sessionClient, {
  contentUri: uri("lens://4f91ca…"),
  commentOn: {
    post: postId("42"), // the post to comment on
  },
});
```

Cross-feed commenting is currently not supported. If you find this feature valuable, please let us know by opening an issue.

### 5. Handle Result

Next, handle the result using the adapter for the library of your choice and wait for it to be indexed.

```ts
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await post(sessionClient, {
  contentUri: uri("lens://4f91ca…"),
  commentOn: {
    post: postId("42"), // the post to comment on
  },
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

### 6. Fetch New Comment

Finally, fetch the newly created comment using the `fetchComment` action.

```ts
import { fetchComment } from "@lens-protocol/client/actions";

// …

const result = await post(sessionClient, {
  contentUri: uri("lens://4f91ca…"),
  commentOn: {
    post: postId("42"), // the post to comment on
  },
})
  .andThen(handleOperationWith(walletClientOrSigner))
  .andThen(sessionClient.waitForTransaction)
  .andThen((txHash) => fetchComment(sessionClient, { txHash }));

if (result.isErr()) {
  return console.error(result.error);
}

// comment: Comment | null
const comment = result.value;
```

That's it—you now have a comment on a post!

## Create a Mirror

To create a mirror of a post, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to create a mirror.

### 1. Check Post Rules

First, inspect the `post.operations.canQuote` field to determine whether the logged-in Account is allowed to mirror a given Post. Some posts may have restrictions on who can mirror them.

```ts
switch (post.operations.canMirror.__typename) {
  case "PostOperationValidationPassed":
    // Mirroring is allowed
    break;

  case "PostOperationValidationFailed":
    // Mirroring is not allowed
    console.log(post.operations.canMirror.reason);
    break;

  case "PostOperationValidationUnknown":
    // Validation outcome is unknown
    break;
}
```

Where:

- `PostOperationValidationPassed`: The logged-in Account can mirror the Post.
- `PostOperationValidationFailed`: Mirroring is not allowed. The `reason` field explains why, and `unsatisfiedRules` lists the unmet requirements.
- `PostOperationValidationUnknown`: The Post or its Feed (for custom Feeds) has one or more unknown rules requiring ad-hoc verification. The `extraChecksRequired` field provides the addresses and configurations of these rules.

Treat the `PostOperationValidationUnknown` as failed unless you intend to support the specific rules. See Post Rules for more information.

### 2. Create Mirror

Next, create the mirror using the `post` action with the `mirrorOn` parameter.

```ts
import { postId, uri } from "protocol/client";
import { post } from "protocol/client/actions";

const result = await post(sessionClient, {
  mirrorOn: {
    post: postId("42"), // the post to mirror
  },
});
```

Cross-feed mirroring is currently not supported. If you find this feature valuable, please let us know by opening an issue.

### 3. Handle Result

Next, handle the result using the adapter for the library of your choice and wait for it to be indexed.

```ts
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await post(sessionClient, {
  mirrorOn: {
    post: postId("42"), // the post to mirror
  },
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

### 4. Fetch New Mirror

Finally, fetch the newly created mirror using the `fetchMirror` action.

```ts
import { fetchMirror } from "@lens-protocol/client/actions";

// …

const result = await post(sessionClient, {
  mirrorOn: {
    post: postId("42"), // the post to mirror
  },
})
  .andThen(handleOperationWith(walletClientOrSigner))
  .andThen(sessionClient.waitForTransaction)
  .andThen((txHash) => fetchMirror(sessionClient, { txHash }));

if (result.isErr()) {
  return console.error(result.error);
}

// mirror: Mirror | null
const mirror = result.value;
```

That's it—you now have a mirror of a post!

## Create a Quote

To create a quote of a post, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to create a quote.

### 1. Check Post Rules

First, inspect the `post.operations.canQuote` field to determine whether the logged-in Account is allowed to quote a given Post. Some posts may have restrictions on who can quote them.

```ts
switch (post.operations.canQuote.__typename) {
  case "PostOperationValidationPassed":
    // Quoting is allowed
    break;

  case "PostOperationValidationFailed":
    // Quoting is not allowed
    console.log(post.operations.canQuote.reason);
    break;

  case "PostOperationValidationUnknown":
    // Validation outcome is unknown
    break;
}
```

Where:

- `PostOperationValidationPassed`: The logged-in Account can quote the Post.
- `PostOperationValidationFailed`: Quoting is not allowed. The `reason` field explains why, and `unsatisfiedRules` lists the unmet requirements.
- `PostOperationValidationUnknown`: The Post or its Feed (for custom Feeds) has one or more unknown rules requiring ad-hoc verification. The `extraChecksRequired` field provides the addresses and configurations of these rules.

Treat the `PostOperationValidationUnknown` as failed unless you intend to support the specific rules. See Post Rules for more information.

### 2. Create Quote Metadata

First, construct a Quote Metadata object with the necessary content.

```ts
import { textOnly } from "@lens-protocol/metadata";

const metadata = textOnly({
  content: "This is my quote!",
});
```

### 3. Upload Quote Metadata

Next, upload the Quote Metadata object to a public URI.

```ts
import { storageClient } from "./storage-client";

const { uri } = await storageClient.uploadAsJson(metadata);

console.log(uri); // e.g., lens://4f91ca…
```

This example uses Grove storage to host the Metadata object. See the Lens Metadata Standards guide for more information on hosting Metadata objects.

### 4. Create Quote

Next, create the quote using the `post` action with the `quoteOf` parameter.

```ts
import { uri, postId } from "protocol/client";
import { post } from "protocol/client/actions";

// …

const result = await post(sessionClient, {
  contentUri: uri("lens://4f91…"), // the URI from the previous step
  quoteOf: {
    post: postId("42"), // the post to quote
  },
});
```

Cross-feed quoting is currently not supported. If you find this feature valuable, please let us know by opening an issue.

### 5. Handle Result

Next, handle the result using the adapter for the library of your choice and wait for it to be indexed.

```ts
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await post(sessionClient, {
  contentUri: uri("lens://4f91…"), // the URI from the previous step
  quoteOf: {
    post: postId("42"), // the post to quote
  }
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

### 6. Fetch New Quote

Finally, fetch the newly created quote using the `fetchQuote` action.

```ts
import { fetchQuote } from "@lens-protocol/client/actions";

// …

const result = await post(sessionClient, {
  contentUri: uri("lens://4f91…"), // the URI from the previous step
  quoteOf: {
    post: postId("42"), // the post to quote
  }
})
  .andThen(handleOperationWith(walletClientOrSigner))
  .andThen(sessionClient.waitForTransaction)
  .andThen((txHash) => fetchQuote(sessionClient, { txHash }));

if (result.isErr()) {
  return console.error(result.error);
}

// quote: Quote | null
const quote = result.value;
```

That's it—you now have a quote of a post!

## Post on Custom Feed

You can also post directly to a custom feed if allowed.

```ts
import { evmAddress, postId, uri } from "protocol/client";
import { post } from "protocol/client/actions";

const result = await post(sessionClient, {
  contentUri: uri("lens://4f91ca…"),
  commentOn: {
    post: postId("42"), // the post to comment on
  },
  feed: evmAddress("0x1234…"), // the custom feed address
});
```

Continue as you would with a regular Post on the Global Feed.

## Create a Reaction

To create a reaction to a post, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to create a reaction.

### 1. Create Reaction

Create the reaction using the `addReaction` action.

```ts
import { postId, ReactionType } from "protocol/client";
import { addReaction } from "protocol/client/actions";

// …

const result = await addReaction(sessionClient, {
  for: postId("0x01-0x01"), // the post to react to
  reaction: ReactionType.UPVOTE,
});

if (result.isErr()) {
  return console.error(result.error);
}
```

### 2. Remove Reaction

To remove a reaction, use the `removeReaction` action.

```ts
import { postId, ReactionType } from "protocol/client";
import { removeReaction } from "protocol/client/actions";

// …

const result = await removeReaction(sessionClient, {
  for: postId("0x01-0x01"), // the post to remove reaction from
  reaction: ReactionType.UPVOTE,
});

if (result.isErr()) {
  return console.error(result.error);
}
```

## Hide a Post

To hide a post, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to hide a post.

### 1. Hide Post

Hide the post using the `hidePost` action.

```ts
import { postId } from "protocol/client";
import { hidePost } from "protocol/client/actions";

// …

const result = await hidePost(sessionClient, {
  for: postId("0x01-0x01"), // the post to hide
});

if (result.isErr()) {
  return console.error(result.error);
}
```

### 2. Unhide Post

To unhide a post, use the `unhidePost` action.

```ts
import { postId } from "protocol/client";
import { unhidePost } from "protocol/client/actions";

// …

const result = await unhidePost(sessionClient, {
  for: postId("0x01-0x01"), // the post to unhide
});

if (result.isErr()) {
  return console.error(result.error);
}
```

## Report a Post

To report a post, follow these steps.

### 1. Report Post

Report the post using the `reportPost` action.

```ts
import { postId, ReportReason } from "protocol/client";
import { reportPost } from "protocol/client/actions";

// …

const result = await reportPost(client, {
  post: postId("0x01-0x01"), // the post to report
  reason: ReportReason.SPAM,
  additionalComments: "This post is spam",
});

if (result.isErr()) {
  return console.error(result.error);
}
```

## Bookmark a Post

To bookmark a post, follow these steps.

You MUST be authenticated to bookmark a post.

### 1. Add Bookmark

Add the post to bookmarks using the `addBookmark` action.

```ts
import { postId } from "protocol/client";
import { addBookmark } from "protocol/client/actions";

// …

const result = await addBookmark(sessionClient, {
  post: postId("0x01-0x01"), // the post to bookmark
});

if (result.isErr()) {
  return console.error(result.error);
}
```

### 2. Remove Bookmark

To remove a post from bookmarks, use the `removeBookmark` action.

```ts
import { postId } from "protocol/client";
import { removeBookmark } from "protocol/client/actions";

// …

const result = await removeBookmark(sessionClient, {
  post: postId("0x01-0x01"), // the post to remove from bookmarks
});

if (result.isErr()) {
  return console.error(result.error);
}
```

### 3. List Bookmarks

Use the paginated `fetchBookmarks` action to fetch a list of bookmarked posts.

```ts
import { fetchBookmarks } from "protocol/client/actions";

// …

const result = await fetchBookmarks(sessionClient);

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Post>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

## Post Metadata

Lens supports a variety of post metadata types to enable rich content experiences. Here's a quick overview of the available metadata types:

### Text-Only Post

```ts
import { textOnly } from "protocol/metadata";

const metadata = textOnly({
  content: "Hello World!",
});
```

### Image Post

```ts
import { image } from "protocol/metadata";

const metadata = image({
  image: "ipfs://QmV5dYTm8LLmHEGLGEQDGvjq4jeoHjKgQWXgTQNKQgVFK1",
  title: "My Image",
  content: "This is my image description",
});
```

### Video Post

```ts
import { video } from "protocol/metadata";

const metadata = video({
  video: "ipfs://QmV5dYTm8LLmHEGLGEQDGvjq4jeoHjKgQWXgTQNKQgVFK1",
  title: "My Video",
  content: "This is my video description",
});
```

### Article Post

```ts
import { article } from "protocol/metadata";

const metadata = article({
  title: "My Article",
  content: "This is my article content",
  attachments: [
    {
      item: "ipfs://QmV5dYTm8LLmHEGLGEQDGvjq4jeoHjKgQWXgTQNKQgVFK1",
      type: "image/jpeg",
    },
  ],
});
```

### Audio Post

```ts
import { audio } from "protocol/metadata";

const metadata = audio({
  audio: "ipfs://QmV5dYTm8LLmHEGLGEQDGvjq4jeoHjKgQWXgTQNKQgVFK1",
  title: "My Audio",
  content: "This is my audio description",
});
```

### Embed Post

```ts
import { embed } from "protocol/metadata";

const metadata = embed({
  embed: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  title: "My Embed",
  content: "This is my embed description",
});
```

### Link Post

```ts
import { link } from "protocol/metadata";

const metadata = link({
  url: "https://example.com",
  title: "My Link",
  content: "This is my link description",
});
```

### Mint Post

```ts
import { mint } from "protocol/metadata";

const metadata = mint({
  mintLink: "https://opensea.io/assets/ethereum/0x1234…/1",
  title: "My NFT",
  content: "This is my NFT description",
});
```

### Transaction Post

```ts
import { transaction } from "protocol/metadata";

const metadata = transaction({
  txHash: "0x1234…",
  title: "My Transaction",
  content: "This is my transaction description",
});
```

### Space Post

```ts
import { space } from "protocol/metadata";

const metadata = space({
  spaceId: "1234",
  title: "My Space",
  content: "This is my space description",
});
```

### 3D Post

```ts
import { threeD } from "protocol/metadata";

const metadata = threeD({
  uri: "ipfs://QmV5dYTm8LLmHEGLGEQDGvjq4jeoHjKgQWXgTQNKQgVFK1",
  title: "My 3D Model",
  content: "This is my 3D model description",
});
```

See the Metadata Standards guide for more information on creating different types of metadata. 