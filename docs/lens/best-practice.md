# Metadata Standards

This guide explains how Metadata objects are created and managed in Lens.

Lens Metadata Standards, introduced in LIP-2, are a set of self-describing object specifications. These standards ensure that the data includes all the necessary information for validation within itself.

## Create Metadata Object

You can construct Metadata objects in two ways:

- By utilizing the `@lens-protocol/metadata` package
- Manually, with the help of a dedicated JSON Schema

### Installation

Install the `@lens-protocol/metadata` package with its required peer dependencies.

```bash
# npm
npm install zod @lens-protocol/metadata@latest

# yarn
yarn add zod @lens-protocol/metadata@latest

# pnpm
pnpm add zod @lens-protocol/metadata@latest
```

Below, we provide a few practical examples for creating Metadata objects. Throughout this documentation, we will detail the specific Metadata objects required for various use cases.

### Text-only Post Metadata

```typescript
import { textOnly } from "@lens-protocol/metadata";

const metadata = textOnly({
  content: `GM! GM!`,
});
```

## Localize Post Metadata

You can specify the language of a Post's content using the `locale` field in the metadata.

The `locale` values must follow the `<language>-<region>` format, where:

- `<language>` is a lowercase ISO 639-1 language code
- `<region>` is an optional uppercase ISO 3166-1 alpha-2 country code

You can provide either just the language code, or both the language and country codes. Here are some examples:

- `en` represents English in any region
- `en-US` represents English as used in the United States
- `en-GB` represents English as used in the United Kingdom

If not specified, the `locale` field in all `@lens-protocol/metadata` helpers will default to `en`.

### Example

```typescript
import { textOnly } from "@lens-protocol/metadata";

const metadata = textOnly({
  content: `Ciao mondo!`,
  locale: "it",
});
```

While this example uses the `textOnly` helper, the same principle applies to all other metadata types.

## Host Metadata Objects

We recommend using Grove to host your Metadata objects as a cheap and secure solution. However, developers are free to store Metadata anywhere, such as IPFS, Arweave, or AWS S3, as long as the data is publicly accessible via a URI and served with the `Content-Type: application/json` header.

In this documentation, examples will often use an instance of Grove's `StorageClient` to upload Metadata objects.

```typescript
// storage-client.ts
import { StorageClient, testnet } from "@lens-chain/storage-client";

export const storageClient = StorageClient.create(testnet);
```

You can also upload media files to the same hosting solution, then reference their URIs in the Metadata prior to uploading it.

## Query Metadata Media

Many metadata fields reference media objects such as images, audio, and video files. The content at those URIs is fetched and snapshotted by the Lens API as part of the indexing process.

By default, when you query those fields, the Lens API returns the snapshot URLs. However, you can also request the original URIs.

```graphql
fragment MediaImage on MediaImage {
  __typename
  altTag
  item # Snapshot URL
  original: item(request: { useOriginal: true })
  license
  type
  width
  height
}
```

Additionally, when you get snapshot URLs of images, you can request different sizes of the image through an `ImageTransform` object.

```graphql
input ImageTransform @oneOf {
  fixedSize: FixedSizeTransform
  widthBased: WidthBasedTransform
  heightBased: HeightBasedTransform
}

# Resize image to a fixed size, cropping if necessary
input FixedSizeTransform {
  width: Int! # px
  height: Int! # px
}

# Maintain aspect ratio by adjusting height based on width
input WidthBasedTransform {
  width: Int! # px
}

# Maintain aspect ratio by adjusting width based on height
input HeightBasedTransform {
  height: Int! # px
}
```

See the following example:

```graphql
fragment MediaImage on MediaImage {
  # …

  tall: item(request: { preferTransform: { heightBased: { height: 600 } } })

  large: item(request: { preferTransform: { widthBased: { width: 2048 } } })

  thumbnail: item(
    request: { preferTransform: { fixedSize: { height: 128, width: 128 } } }
  )
}
```

## Refresh Metadata Objects

In some cases, you may need to refresh the cached content of a Metadata object in the Lens API.

Let's go through an example. Suppose you have a Post object with a Metadata object hosted on Grove that you want to update without submitting a transaction, as described in the edit Post guide.

```typescript
import { Post } from "@lens-protocol/client";

const post: Post = {
  id: "42",
  contentUri: "lens://323c0e1cceb…",
  metadata: {
    content: "Good morning!",
  },

  // …
};
```

Assuming you have the necessary permissions to update the content of the Post, you can update the Metadata object hosted on Grove as follows.

```typescript
import { textOnly } from "@lens-protocol/metadata";

import { acl } from "./acl";
import { storageClient } from "./storage";
import { signer } from "./viem";

const updates = textOnly({
  content: `Good morning!`,
});

const response = await storageClient.updateJson(
  post.contentUri,
  newData,
  signer,
  { acl }
);
```

The process described here works with any hosting solution that allows you to update the content at a given URI.

### 1. Initiate a Metadata Refresh

First, use the `refreshMetadata` action to initiate the refresh process.

```typescript
import { refreshMetadata } from "@lens-protocol/client";
import { client } from "./client";

const result = await refreshMetadata(client, { entity: { post: post.id } });
```

This process is asynchronous and may take a few seconds to complete.

### 2. Wait for the Refresh to Complete

Then, if necessary, use the for the Lens API to update the Metadata object.

```typescript
import { waitForMetadata } from "@lens-protocol/client";

// …

const result = await refreshMetadata(client, {
  entity: { post: post.id },
}).andThen(({ id }) => waitForMetadata(client, id));
```

That's it—any Lens API request involving the given Post will now reflect the updated Metadata object.

# Team Management

This guide explains how to manage your team's access to your Lens primitives.

Lens uses a unified approach to access control for its primitives (apps, graphs, feeds, etc.). There are two types of roles:

- **Owner**: The owner has full control over a primitive, including adding and removing admins and transferring ownership. The initial owner is the address that creates the primitive.

- **Admin**: An admin can perform most actions except transferring ownership. See the individual primitive documentation for more details.

This document identifies as primitives the following Lens entities:

- Apps
- Graphs
- Feeds
- Groups
- Username Namespaces
- Sponsorships

The steps are the same for all primitives, so we will just refer to them their primitive address.

## Add Admins

You **MUST** be authenticated as Builder to make this request.

### 1. Prepare the Request

Use the `addAdmins` action to add Admins to an owned primitive.

```typescript
import { evmAddress } from "@lens-protocol/client";
import { addAdmins } from "@lens-protocol/client/actions";

const result = await addAdmins(sessionClient, {
  admins: [evmAddress("0x1234…"), evmAddress("0x5678…")],
  address: evmAddress("0x90ab…"), // address of the primitive (app/graph/feed/etc)
});
```

### 2. Handle Result

Finally, handle the result using the adapter for the library of your choice:

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await addAdmins(sessionClient, {
  admins: [evmAddress("0x1234…"), evmAddress("0x5678…")],
  address: evmAddress("0x3243…"),
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

## Remove Admins

### 1. Prepare the Request

You **MUST** be authenticated as Builder to make this request.

```typescript
import { evmAddress } from "@lens-protocol/client";
import { removeAdmins } from "@lens-protocol/client/actions";

const result = await removeAdmins(sessionClient, {
  admins: [evmAddress("0x1234…"), evmAddress("0x5678…")],
  address: evmAddress("0x90ab…"), // address of the primitive (app/graph/feed/etc)
});
```

### 2. Handle Result

Finally, handle the result using the adapter for the library of your choice:

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await removeAdmins(sessionClient, {
  admins: [evmAddress("0x1234…"), evmAddress("0x5678…")],
  address: evmAddress("0x3243…"),
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

## Fetch Admins

In some cases, you may need to fetch the list of admins for a primitive.

Since a Lens Account, by being a smart wallet, can potentially be a primitive's admin, you can also search admins by their username.

Use the paginated `fetchAdminsFor` action to fetch a list of admins for a primitive.

```typescript
import { evmAddress } from "@lens-protocol/client";
import { fetchAdminsFor } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchAdminsFor(client, {
  address: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Admin>: [{ account: Account, addedAt: DateTime }, …]
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

## Transfer Ownership

The owner of a primitive can transfer ownership to another address.

### 1. Prepare the Request

You **MUST** be authenticated as Builder to make this request.

```typescript
import { evmAddress } from "@lens-protocol/client";
import { transferPrimitiveOwnership } from "@lens-protocol/client/actions";

const result = await transferPrimitiveOwnership(sessionClient, {
  address: evmAddress("0x5678…"),
  newOwner: evmAddress("0x1234…"),
});
```

### 2. Handle Result

Finally, handle the result using the adapter for the library of your choice:

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await transferPrimitiveOwnership(sessionClient, {
  address: evmAddress("0x5678…"),
  newOwner: evmAddress("0x1234…"),
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

# Mentions

This guide will show you how mentions work on Lens.

Mentions are tracked by the Lens API when included in the `content` field of the Post metadata.

```typescript
import { textOnly } from "@lens-protocol/metadata";

const metadata = textOnly({
  content: `Hey @lens/stani, how are you?`,
});
```

Lens supports two types of mentions: Account and Group mentions.

## Account Mentions

In Lens, an Account can have multiple usernames, but only one username per Username Namespace.

### Global Lens Namespace

A special case is the global Lens Username namespace (i.e., `lens/`). In this case, account mentions take the familiar form:

`@lens/<local_name>`

where `<local_name>` is the Lens Account's name under the global Lens Username namespace.

For example:

`Hey @lens/stani, how are you?`

### Custom Namespaces

The general format for a mention is:

`@<namespace_address>/<account_address>`

where:

- `<namespace_address>`: The address of the Username namespace contract associated with the account.
- `<account_address>`: The address of the Lens Account being mentioned.

For example:

`Hey @0x123abc456…/0x789def123…, how are you?`

`0x123abc456…` is the Username namespace contract address.
`0x789def123…` is the mentioned Lens Account address.

## Group Mentions

Group mentions are similar to Account mentions, but with a different format:

`#<group_address>`

where `<group_address>` is the address of the Group being mentioned.

For example:

`To all #0x123abc456… members, please check the latest update.`

## Rendering Mentions

Use the `post.mentions` field to replace raw mentions in the Post content with a more user-friendly format.

```typescript
const content = "Hey @0x123abc456…/0x789def123…, how are you?";

const processed = post.mentions.reduce(
  (updated, mention) =>
    updated.replace(mention.replace.from, mention.replace.to),
  content
);

// Hey @lens/wagmi, how are you?
```

Below a more detailed example with React.

