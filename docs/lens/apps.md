# Apps

This guide will walk you through the process of creating and managing Lens Apps.

## Create an App

To create an App, follow these steps.

You MUST be authenticated as Builder create an App.

### 1. Create App Metadata

First, construct an App Metadata object with the necessary content.

```ts
import { MetadataAttributeType, app } from "@lens-protocol/metadata";

const metadata = app({
  name: "XYZ",
  tagline: "The next big thing",
  description: "An app to rule them all",
  logo: "lens://4f91cab87ab5e4f5066f878b72…",
  developer: "John Doe <john.doe@email.com>",
  url: "https://example.com",
  termsOfService: "https://example.com/terms",
  privacyPolicy: "https://example.com/privacy",
  platforms: ["web", "ios", "android"],
});
```

### 2. Upload App Metadata

Next, upload the App Metadata object to a public URI.

```ts
import { storageClient } from "./storage-client";

const { uri } = await storageClient.uploadAsJson(metadata);

console.log(uri); // e.g., lens://4f91ca…
```

This example uses Grove storage to host the Metadata object. See the Lens Metadata Standards guide for more information on hosting Metadata objects.

### 3. Deploy App Contract

Next, deploy the Lens App smart contract.

```ts
import { uri } from "@lens-protocol/client";
import { createApp } from "@lens-protocol/client/actions";

// …

const result = await createApp(sessionClient, {
  metadataUri: uri("lens://4f91…"), // the URI from the previous step
  defaultFeed: {
    globalFeed: true,
  },
  graph: {
    globalGraph: true,
  },
  namespace: {
    globalNamespace: true,
  },
});
```

### 4. Handle Result

Next, handle the result using the adapter for the library of your choice and wait for it to be indexed.

```ts
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await createApp(sessionClient, {
  metadataUri: uri("lens://4f91…"), // the URI from the previous step
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

### 5. Fetch New App

Finally, fetch the newly created App using the `fetchApp` action.

```ts
import { fetchApp } from "@lens-protocol/client/actions";

// …

const result = await createApp(sessionClient, {
  metadataUri: uri("lens://4f91…"), // the URI from the previous step
})
  .andThen(handleOperationWith(walletClientOrSigner))
  .andThen(sessionClient.waitForTransaction)
  .andThen((txHash) => fetchApp(sessionClient, { txHash }));

if (result.isErr()) {
  return console.error(result.error);
}

// app: App | null
const app = result.value;
```

That's it—you now can start using your Lens App!

## Fetch Apps

This guide will show you how to fetch App data in different ways.

Lens App data has a rich structure that includes the following information:

- Addresses of the primitives contracts
- App Metadata content
- Time of creation
- Owner of the App

To illustrate how to fetch apps, we will use the following fragments:

```graphql
fragment App on App {
  address
  graphAddress
  sponsorshipAddress
  defaultFeedAddress
  namespaceAddress
  treasuryAddress
  verificationEnabled
  createdAt
  metadata {
    ...AppMetadata
  }
  owner
}
```

### Get an App

Use the `fetchApp` action to fetch a single App by address or by transaction hash.

```ts
// By Address
import { evmAddress } from "@lens-protocol/client";
import { fetchApp } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchApp(client, {
  app: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

const app = result.value;
```

### List Apps

Use the paginated `fetchApps` action to fetch a list of Apps based on the provided filters.

```ts
// By Query
import { fetchApps } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchApps(client, {
  filter: {
    searchQuery: "Lens",
  },
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<App>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

### List App Users

Use the paginated `fetchAppUsers` action to fetch a list of users using an App based on the provided filters.

```ts
// All Users
import { evmAddress } from "@lens-protocol/client";
import { fetchAppUsers } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchAppUsers(client, {
  app: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<AppUser>: [{account: Account, lastActiveOn: DateTime, firstLoginOn: DateTime}, …]
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

### List App Feeds

Use the paginated `fetchAppFeeds` action to fetch a list of feeds using an App.

```ts
import { evmAddress } from "@lens-protocol/client";
import { fetchAppFeeds } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchAppFeeds(client, {
  app: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Feed>: [{feed: evmAddress, timestamp: DateTime}, …]
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

### List App Groups

Use the paginated `fetchAppGroups` action to fetch a list of groups using an App.

```ts
import { evmAddress } from "@lens-protocol/client";
import { fetchAppGroups } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchAppGroups(client, {
  app: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Group>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

### List App Signers

Use the paginated `fetchAppSigners` action to fetch list of signers assigned to an App.

```ts
import { evmAddress } from "@lens-protocol/client";
import { fetchAppSigners } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchAppSigners(client, {
  app: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<AppSigner>: [{signer: evmAddress, timestamp: DateTime}, …]
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

## Manage Apps

This guide explains how to manage Apps on Lens.

### Update App Metadata

To update the metadata of an existing app, follow these steps.

You MUST be authenticated as Builder and be owner or admin of the App to update its metadata.

#### 1. Create New App Metadata

First, construct an App Metadata object with the new content.

```ts
import { MetadataAttributeType, app } from "@lens-protocol/metadata";

const metadata = app({
  name: "XYZ",
  tagline: "The next big thing",
  description: "An app to rule them all",
  logo: "lens://4f91cab87ab5e4f5066f878b72…",
  developer: "John Doe <john.doe@email.com>",
  url: "https://example.com",
  termsOfService: "https://example.com/terms",
  privacyPolicy: "https://example.com/privacy",
  platforms: ["web", "ios", "android"],
});
```

#### 2. Upload App Metadata

Next, upload the App Metadata object to a public URI.

```ts
import { storageClient } from "./storage-client";

const { uri } = await storageClient.uploadAsJson(metadata);

console.log(uri); // e.g., lens://4f91ca…
```

This example uses Grove storage to host the Metadata object. See the Lens Metadata Standards guide for more information on hosting Metadata objects.

#### 3. Update New Custom App Metadata

Next, update the app metadata using `setAppMetadata` action.

```ts
import { uri, evmAddress } from "@lens-protocol/client";
import { setAppMetadata } from "@lens-protocol/client/actions";

// …

const result = await setAppMetadata(sessionClient, {
  metadataUri: uri("lens://4f91…"), // the URI with new metadata
  app: evmAddress("0x1234…"),
});
```

#### 4. Handle Result

Finally, handle the result using the adapter for the library of your choice:

```ts
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await setAppMetadata(sessionClient, {
  metadataUri: uri("lens://4f91…"),
  app: evmAddress("0x1234…"),
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

### Update App Feeds

To update the custom feeds of an existing app, follow these steps.

You MUST be authenticated as Builder and be owner or admin of the App to update its feeds.

#### 1. Update the App Feeds

First, update the custom feeds in an app using `addAppFeeds` or `removeAppFeeds` actions.

```ts
// Add Custom Feeds
import { evmAddress } from "@lens-protocol/client";
import { addAppFeeds } from "@lens-protocol/client/actions";

// …

const result = await addAppFeeds(sessionClient, {
  feeds: [evmAddress("0x4546…")],
  app: evmAddress("0x1234…"),
});
```

#### 2. Handle Result

Then, handle the result using the adapter for the library of your choice:

```ts
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await addAppFeeds(sessionClient, {
  feeds: ['0x4567…']
  app: evmAddress("0x1234…")
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

### Set App Default Feed

To set the default feed for an app, follow these steps.

You MUST be authenticated as Builder and be owner or admin of the App to set its default feed.

#### 1. Update App Default Feed

First, use `setDefaultAppFeed` action to set the default feed of an app.

```ts
// Set Custom Default Feed
import { evmAddress } from "@lens-protocol/client";
import { setDefaultAppFeed } from "@lens-protocol/client/actions";

// …

const result = await setDefaultAppFeed(sessionClient, {
  feed: { custom: evmAddress("0x4546…") },
  app: evmAddress("0x1234…"),
});
```

#### 2. Handle Result

Then, handle the result using the adapter for the library of your choice:

```ts
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await setDefaultAppFeed(sessionClient, {
  feeds: { global: true },
  app: evmAddress("0x1234…"),
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

### Update App Graph

To update the graph of an existing app, follow these steps.

You MUST be authenticated as Builder and be owner or admin of the App to update its graph.

#### 1. Set New Custom App Graph

First, use `setAppGraph` action to update or set the graph of an existing app.

```ts
// Set Custom Graph
import { evmAddress } from "@lens-protocol/client";
import { setAppGraph } from "@lens-protocol/client/actions";

// …

const result = await setAppGraph(sessionClient, {
  graph: { custom: evmAddress("0x1234…") },
  app: evmAddress("0x1234…"),
});
```

#### 2. Handle Result

Then, handle the result using the adapter for the library of your choice:

```ts
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await setAppGraph(sessionClient, {
  graph: { globalGraph: true },
  app: evmAddress("0x1234…"),
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

### App Treasury

To update the treasury of an existing app, follow these steps.

You MUST be authenticated as Builder and be owner or admin of the App to update its treasury.

#### 1. Update App Treasury

First, use `setAppTreasury` action to update or set the treasury of an existing app.

```ts
import { evmAddress } from "@lens-protocol/client";
import { setAppTreasury } from "@lens-protocol/client/actions";

// …

const result = await setAppTreasury(sessionClient, {
  treasury: evmAddress('0x4567…')
  app: evmAddress('0x1234…')
});
```

#### 2. Handle Result

Then, handle the result using the adapter for the library of your choice:

```ts
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await setAppTreasury(sessionClient, {
  treasury: evmAddress("0x4567…"),
  app: evmAddress("0x1234…"),
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

### App Sponsorship

To update the sponsorship of an existing app, follow these steps.

You MUST be authenticated as Builder and be owner or admin of the App to update its sponsorship.

#### 1. Update App Sponsorship

First, use `setAppSponsorship` action to update or set the sponsorship of an existing app.

```ts
import { evmAddress } from "@lens-protocol/client";
import { setAppSponsorship } from "@lens-protocol/client/actions";

// …

const result = await setAppSponsorship(sessionClient, {
  app: evmAddress("0x1234…"),
  sponsorship: evmAddress("0x4567…"),
});
```

#### 2. Handle Result

Then, handle the result using the adapter for the library of your choice:

```ts
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await setAppSponsorship(sessionClient, {
  sponsorship: evmAddress("0x4567…"),
  app: evmAddress("0x1234…"),
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

## Access Control

The App contract supports two roles: Owner and Administrator.

Administrators can:

- Update the App Metadata
- Update the App Rules
- Update the App Feeds and Graph
- Update the App Treasury
- Update the App Sponsorship

The Owner can do everything the administrators can do, plus transfer ownership of the App to another address.

See the Team Management guide for more information on how to manage these roles.

## Authorization Workflows

This guide will show you how you can control how user interact with your app.

The Lens API empowers builders with enhanced control over user interactions within their app. Specifically, builders can:

- Determine who is allowed to log in to the Lens API as a user of their Lens App
- Revoke user credentials at any time
- Decide whether the app, through the associated Sponsorship, should sponsor user activities
- Protect your Lens App from being impersonated by an unauthorized actor (e.g., a spam bot)

### Overview

The Lens Authentication flow is at the heart of this mechanism. It allows you to control who can acquire credentials for the Lens API as user of your Lens App, serving as the starting point to manage user activity sponsorship and App Verification.

### App Authorization

By default, any Lens account can log in to your app. To control access, sponsorship, or enable app verification, follow the steps below to implement a custom authorization workflow.

#### 1. Authorization Endpoint

First, create an Authorization Endpoint as a publicly accessible HTTPS URL. It must accept POST requests with a JSON body and use token authentication via the standard `Authorization` header (Bearer token authentication). Ensure the endpoint responds within 500 ms, as exceeding this limit will result in the user's authentication request being denied.

To ensure reliability, focus on lightweight checks and avoid resource-intensive operations. For more complex validations, consider asynchronously populating a cache with the required data (e.g., through a separate job) to meet the timing constraints. If using serverless infrastructure, address cold start issues to ensure quick responses.

**Request**

The Lens API will send a POST request to the Authorization Endpoint according to the following format:

```
POST /path/to/endpoint HTTP/1.1
Host: myserver.com
Authorization: Bearer <secret>
Content-Type: application/json
{
  "account": "0x4F10f685B6BF165e86f41CDf4a906B17F295C235",
  "signedBy": "0x00004747f7a56EE7Af7237220c960a7D06232626"
}
```

| Header | Description |
| ------ | ----------- |
| `<secret>` | A secret used to authenticate the request. See the Generate a Secret section below. |

| Body Parameter | Description |
| -------------- | ----------- |
| account | The Lens Account that wants to log-in to the Lens API for your Lens App. |
| signedBy | The Lens Account owner or an Account Manager for it. |

**Response**

The Authorization Endpoint must respond with a JSON object according to the following format:

Any non-200 response or invalid response will end up in denying the user access to the Lens API for your Lens App.

```json
// Access Granted
HTTP/1.1 200 OK
Content-Type: application/json
{
  "allowed": true,
  "sponsored": true
}
```

#### 2. Generate a Secret

Create a secret to be used as a Bearer token for authenticating requests to your Authorization Endpoint.

The secret must be between 64 and 4096 characters and use only type-safe characters, such as:

A–Z a–z 0–9 - _ . ~ + / =

Avoid whitespace, control characters, or symbols that require escaping in HTTP headers.

A long-lived JWT can also be used as the secret, as long as it meets the character and length requirements.

#### 3. Configure App

Once you have your Authorization Endpoint ready, you can configure it for your Lens App.

You MUST be authenticated as Builder and be either the owner or an admin of the App you intend to configure.

Use the `addAppAuthorizationEndpoint` action to configure the Authorization Endpoint for your Lens App.

```ts
// Add Authorization Endpoint
import { evmAddress, uri } from "@lens-protocol/client";
import { addAppAuthorizationEndpoint } from "@lens-protocol/client/actions";

const result = await addAppAuthorizationEndpoint(sessionClient, {
  endpoint: uri("https://myserver.com/path/to/endpoint"),
  app: evmAddress("0xa0182D914845ec1C3EF61a23C50D56370E23d94e"),
  bearerToken: "<secret>",
});

if (result.isErr()) {
  return console.error(result.error);
}
```

Use the `removeAppAuthorizationEndpoint` action to remove the Authorization Endpoint configuration for your Lens App.

```ts
// Remove Authorization Endpoint
import { evmAddress } from "@lens-protocol/client";
import { removeAppAuthorizationEndpoint } from "@lens-protocol/client/actions";

const result = await removeAppAuthorizationEndpoint(sessionClient, {
  app: evmAddress("0xa0182D914845ec1C3EF61a23C50D56370E23d94e"),
});

if (result.isErr()) {
  return console.error(result.error);
}
```

That's it—you now have full control over who can log in into your Lens App and how your sponsorship funds are used.

During the initial phase, all Lens transactions are sponsored by the Lens team.

### App Verification

With your authorization flow configured, you can now set up App Verification to securely sign operations on behalf of your app so to avoid impersonation by unauthorized actors (e.g., spam bots).

#### 1. Generate Signing Key

First, generate a new signing key for the address that will be responsible for signing operations. This key will serve as an authorized App Signer for your Lens App's operations.

```ts
#!/usr/bin/env tsx

import { privateKeyToAccount, generatePrivateKey } from "viem/accounts";

const privateKey = generatePrivateKey();
const account = privateKeyToAccount(privateKey);

console.log("Private Key:", account.privateKey);
console.log("Address:", account.address);
```

DO NOT use an existing private key or reuse the generated key for any other purpose. This key should be exclusively used for signing operations on behalf of your Lens App.

#### 2. Issue Signing Key

Update the Authorization Endpoint to include the signing key in the response.

```json
HTTP/1.1 200 OK
Content-Type: application/json
{
  "allowed": true,
  "sponsored": true,
  "signingKey": "0x72433488d76ffec7a16b…"
}
```

| Response Property | Description |
| ----------------- | ----------- |
| allowed | `true` - allowed |
| sponsored | Boolean indication whether the Lens API can use the App Sponsorship to cover transaction fees for this Account-Signer pair. |
| signingKey | The App Verification signing key from the first step. |

#### 3. Configure App Signers

Then, add address from the previous step to the list of App Signers associated with your Lens App.

Use the `addAppSigners` action to add the approver addresses to the list of App Signers associated with your Lens App.

```ts
import { evmAddress } from "@lens-protocol/client";
import { addAppSigners } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

const result = await addAppSigners(sessionClient, {
  app: evmAddress("0x75bb5fBdb559Fb2A8e078EC2ee74aad791e37DCc"),
  signers: [evmAddress("0xe2f2a5C287993345a840db3B0845fbc70f5935a5")],
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);
```

#### 4. Enable App Verification

Finally, enable the App Verification for your Lens App.

You MUST be authenticated as Builder and be either the owner or an admin of the App you intend to configure.

Use the `setAppVerification` action to enable the App Verification for your Lens App.

```ts
import { evmAddress } from "@lens-protocol/client";
import { handleOperationWith } from "@lens-protocol/client/viem";

const result = await setAppVerification(sessionClient, {
  app: evmAddress("0x75bb5fBdb559Fb2A8e078EC2ee74aad791e37DCc"),
  enabled: true,
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);
```

That's it—all operations performed by the Lens API on behalf of your Lens App will now be signed using the signing key you provided.

### Advanced Topics

#### Revoking Credentials

The Lens Authentication flow allows you to implement a credentials revocation mechanism. This is useful when you want to invalidate a user's session or revoke access to the Lens API for interactions involving your app.

To revoke a user's credentials, you should include the relevant Account address in a denylist that is accessible to your Authorization Endpoint. On the subsequent request to refresh the credentials you can then deny access to the Lens API. 