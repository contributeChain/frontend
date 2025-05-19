# Feeds

This guide covers everything you need to know about working with feeds in Lens.

## Feed Types

Lens provides several types of feeds to help users discover content:

1. **Global Feed**: The default feed that includes all public content on Lens.
2. **Custom Feeds**: Feeds created by users or apps with specific content curation.
3. **Highlight Feed**: A feed of content that has been highlighted by users.
4. **Following Feed**: A feed of content from accounts that the user follows.

## Create a Feed

To create a custom feed, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to create a feed.

### 1. Create Feed Metadata

First, construct a Feed Metadata object with the necessary content.

```ts
import { feed } from "@lens-protocol/metadata";

const metadata = feed({
  name: "My Custom Feed",
  description: "A feed of my favorite content",
  image: "ipfs://QmV5dYTm8LLmHEGLGEQDGvjq4jeoHjKgQWXgTQNKQgVFK1",
});
```

### 2. Upload Feed Metadata

Next, upload the Feed Metadata object to a public URI.

```ts
import { storageClient } from "./storage-client";

const { uri } = await storageClient.uploadAsJson(metadata);

console.log(uri); // e.g., lens://4f91ca…
```

This example uses Grove storage to host the Metadata object. See the Lens Metadata Standards guide for more information on hosting Metadata objects.

### 3. Create Feed

Next, create the feed using the `createFeed` action.

```ts
import { uri } from "@lens-protocol/client";
import { createFeed } from "@lens-protocol/client/actions";

// …

const result = await createFeed(sessionClient, {
  metadataUri: uri("lens://4f91…"), // the URI from the previous step
});
```

### 4. Handle Result

Next, handle the result using the adapter for the library of your choice and wait for it to be indexed.

```ts
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await createFeed(sessionClient, {
  metadataUri: uri("lens://4f91…"), // the URI from the previous step
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

### 5. Fetch New Feed

Finally, fetch the newly created feed using the `fetchFeed` action.

```ts
import { fetchFeed } from "@lens-protocol/client/actions";

// …

const result = await createFeed(sessionClient, {
  metadataUri: uri("lens://4f91…"), // the URI from the previous step
})
  .andThen(handleOperationWith(walletClientOrSigner))
  .andThen(sessionClient.waitForTransaction)
  .andThen((txHash) => fetchFeed(sessionClient, { txHash }));

if (result.isErr()) {
  return console.error(result.error);
}

// feed: Feed | null
const feed = result.value;
```

That's it—you now have a custom feed on Lens!

## Fetch Feeds

This guide will show you how to fetch feed data in different ways.

Lens Feed data has a rich structure that includes the following information:

- Feed address
- Feed Metadata content
- Owner information
- Creation time

To illustrate how to fetch feeds, we will use the following fragments:

```graphql
fragment Feed on Feed {
  address
  metadata {
    ...FeedMetadata
  }
  owner
  createdAt
}
```

### Get a Feed

Use the `fetchFeed` action to fetch a single feed by address or by transaction hash.

```ts
// By Address
import { evmAddress } from "@lens-protocol/client";
import { fetchFeed } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchFeed(client, {
  feed: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

const feed = result.value;
```

### List Feeds

Use the paginated `fetchFeeds` action to fetch a list of feeds based on the provided filters.

```ts
// By Owner
import { evmAddress } from "@lens-protocol/client";
import { fetchFeeds } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchFeeds(client, {
  where: {
    owner: evmAddress("0x1234…"),
  },
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Feed>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

## Update Feed

To update an existing feed, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to update a feed.

### 1. Create New Feed Metadata

First, construct a Feed Metadata object with the new content.

```ts
import { feed } from "@lens-protocol/metadata";

const metadata = feed({
  name: "My Updated Feed",
  description: "An updated feed of my favorite content",
  image: "ipfs://QmV5dYTm8LLmHEGLGEQDGvjq4jeoHjKgQWXgTQNKQgVFK1",
});
```

### 2. Upload Feed Metadata

Next, upload the Feed Metadata object to a public URI.

```ts
import { storageClient } from "./storage-client";

const { uri } = await storageClient.uploadAsJson(metadata);

console.log(uri); // e.g., lens://4f91ca…
```

This example uses Grove storage to host the Metadata object. See the Lens Metadata Standards guide for more information on hosting Metadata objects.

### 3. Update Feed

Next, update the feed using the `setFeedMetadata` action.

```ts
import { uri, evmAddress } from "@lens-protocol/client";
import { setFeedMetadata } from "@lens-protocol/client/actions";

// …

const result = await setFeedMetadata(sessionClient, {
  metadataUri: uri("lens://4f91…"), // the URI with new metadata
  feed: evmAddress("0x1234…"),
});
```

### 4. Handle Result

Finally, handle the result using the adapter for the library of your choice:

```ts
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await setFeedMetadata(sessionClient, {
  metadataUri: uri("lens://4f91…"),
  feed: evmAddress("0x1234…"),
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

## Feed Items

Feed items are the content that appears in a feed. You can add and remove items from a feed to curate the content that users see.

### Add Feed Items

To add items to a feed, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to add items to a feed.

```ts
import { evmAddress, postId } from "@lens-protocol/client";
import { addFeedItems } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await addFeedItems(sessionClient, {
  feed: evmAddress("0x1234…"),
  items: [postId("0x01-0x01"), postId("0x01-0x02")],
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

### Remove Feed Items

To remove items from a feed, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to remove items from a feed.

```ts
import { evmAddress, postId } from "@lens-protocol/client";
import { removeFeedItems } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await removeFeedItems(sessionClient, {
  feed: evmAddress("0x1234…"),
  items: [postId("0x01-0x01"), postId("0x01-0x02")],
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

### List Feed Items

Use the paginated `fetchFeedItems` action to fetch a list of items in a feed.

```ts
import { evmAddress } from "@lens-protocol/client";
import { fetchFeedItems } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchFeedItems(client, {
  feed: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Post>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

## Feed Highlights

Feed highlights are a way to mark specific content as highlighted in a feed. This is useful for featuring important or high-quality content.

### Highlight Feed Item

To highlight an item in a feed, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to highlight items in a feed.

```ts
import { evmAddress, postId } from "@lens-protocol/client";
import { highlightFeedItem } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await highlightFeedItem(sessionClient, {
  feed: evmAddress("0x1234…"),
  item: postId("0x01-0x01"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

### Unhighlight Feed Item

To unhighlight an item in a feed, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to unhighlight items in a feed.

```ts
import { evmAddress, postId } from "@lens-protocol/client";
import { unhighlightFeedItem } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await unhighlightFeedItem(sessionClient, {
  feed: evmAddress("0x1234…"),
  item: postId("0x01-0x01"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

### List Highlighted Items

Use the paginated `fetchHighlightedFeedItems` action to fetch a list of highlighted items in a feed.

```ts
import { evmAddress } from "@lens-protocol/client";
import { fetchHighlightedFeedItems } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchHighlightedFeedItems(client, {
  feed: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Post>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

## Feed Recommendations

Feed recommendations are a way to get personalized content recommendations for a user. This is useful for discovering new content that the user might be interested in.

### Get Feed Recommendations

Use the paginated `fetchFeedRecommendations` action to fetch a list of recommended content for a user.

```ts
import { fetchFeedRecommendations } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchFeedRecommendations(client);

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Post>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

## Feed Ownership

The owner of a feed is the address that can manage the feed and its items. The owner can transfer ownership of the feed to another address.

### Transfer Ownership

To transfer ownership of a feed, follow these steps.

You MUST be authenticated as Feed Owner to transfer ownership.

```ts
import { evmAddress } from "@lens-protocol/client";
import { transferFeed } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await transferFeed(sessionClient, {
  feed: evmAddress("0x1234…"),
  to: evmAddress("0x5678…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

## Feed Deletion

Feed deletion allows users to permanently delete their feeds. This is useful for removing feeds that are no longer needed.

### Delete Feed

To delete a feed, follow these steps.

You MUST be authenticated as Feed Owner to delete a feed.

```ts
import { evmAddress } from "@lens-protocol/client";
import { deleteFeed } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await deleteFeed(sessionClient, {
  feed: evmAddress("0x1234…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

## Feed Subscription

Feed subscription allows users to subscribe to feeds to receive updates when new content is added. This is useful for staying up-to-date with content from feeds that the user is interested in.

### Subscribe to Feed

To subscribe to a feed, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to subscribe to a feed.

```ts
import { evmAddress } from "@lens-protocol/client";
import { subscribeFeed } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await subscribeFeed(sessionClient, {
  feed: evmAddress("0x1234…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

### Unsubscribe from Feed

To unsubscribe from a feed, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to unsubscribe from a feed.

```ts
import { evmAddress } from "@lens-protocol/client";
import { unsubscribeFeed } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await unsubscribeFeed(sessionClient, {
  feed: evmAddress("0x1234…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

### List Subscribed Feeds

Use the paginated `fetchSubscribedFeeds` action to fetch a list of feeds that the authenticated user is subscribed to.

```ts
import { fetchSubscribedFeeds } from "@lens-protocol/client/actions";

// …

const result = await fetchSubscribedFeeds(sessionClient);

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Feed>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

### List Feed Subscribers

Use the paginated `fetchFeedSubscribers` action to fetch a list of accounts that are subscribed to a feed.

```ts
import { evmAddress } from "@lens-protocol/client";
import { fetchFeedSubscribers } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchFeedSubscribers(client, {
  feed: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Account>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results. 