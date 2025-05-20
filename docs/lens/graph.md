# Follow and Unfollow

This guide explains how to follow and unfollow an Account on Lens.

Lens Account can follow other Lens accounts on the Global Graph or on Custom Graphs.

Follow operations are regulated by Follow Rules set on the target Account and by the Graph Rule of the Graph where the follow relationship is established.

## Follow an Account

To follow an Account, implement the following steps.

You **MUST** be authenticated as Account Owner or Account Manager to follow an Account.

### 1. Check Rules

First, inspect the `account.operations` field to determine if you can follow an Account.

```typescript
type Account = {
  __typename: "Account";
  address: EvmAddress;

  // …

  operations: LoggedInAccountOperations;
};
```

The `account.operations.canFollow` can assume one of the following values:

```typescript
switch (account.operations.canFollow.__typename) {
  case "AccountFollowOperationValidationPassed":
    // Follow is allowed
    break;

  case "AccountFollowOperationValidationFailed":
    // Following is not possible
    console.log(account.operations.canFollow.reason);
    break;

  case "AccountFollowOperationValidationUnknown":
    // Validation outcome is unknown
    break;
}
```

Where:

- `AccountFollowOperationValidationPassed`: The logged-in Account can follow the target Account.
- `AccountFollowOperationValidationFailed`: Following is not allowed. The `reason` field explains why. This could be for two reasons:
  - The logged-in Account already follows the target Account. In this case, the `account.operation.isFollowedByMe` field will be `true`.
  - The logged-in Account does not meet the follow criteria for the target Account. In this case, `unsatisfiedRules` lists the unmet requirements.
- `AccountFollowOperationValidationUnknown`: The target Account or the Graph (for custom Graphs) has one or more unknown rules requiring ad-hoc verification. The `extraChecksRequired` field provides the addresses and configurations of these rules.

Treat the `AccountFollowOperationValidationUnknown` as failed unless you intend to support the specific rules. See Follow Rules for more information.

### 2. Submit Follow Request

Then, if your follow request is allowed, you can proceed with submitting the request.

#### Follow on Global Graph

```typescript
import { evmAddress } from "@lens-protocol/client";
import { follow } from "@lens-protocol/client/actions";

const result = await follow(sessionClient, { account: evmAddress("0x1234") });
```

The Lens SDK example here leverages a functional approach to chaining operations using the `Result<T, E>` object. See the Error Handling guide for more information.

### 3. Handle Result

Finally, handle the result using the adapter for the library of your choice:

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await follow(sessionClient, {
  account: evmAddress("0x1234"),
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

## Unfollow an Account

To unfollow an Account, implement the following steps.

You **MUST** be authenticated as Account Owner or Account Manager to follow an Account.

### 1. Check Rules

First, inspect the `account.operations` field to determine if you can unfollow an Account.

```typescript
type Account = {
  __typename: "Account";
  address: EvmAddress;

  // …

  operations: LoggedInAccountOperations;
};
```

If `true`, you can unfollow the account. If `false`, you might not be following them, in which case the `operation.isFollowedByMe` field will also be `false`.

Where:

- `AccountFollowOperationValidationPassed`: The logged-in Account can unfollow the target Account.
- `AccountFollowOperationValidationFailed`: Following is not allowed. The `reason` field explains why. This could be for two reasons:
  - The logged-in Account does not follow the target Account. In this case, the `account.operation.isFollowedByMe` field will be `false`.
  - The logged-in Account does not meet the follow criteria for the target Account. In this case, `unsatisfiedRules` lists the unmet requirements.
- `AccountFollowOperationValidationUnknown`: The custom Graph has one or more unknown rules requiring ad-hoc verification. The `extraChecksRequired` field provides the addresses and configurations of these rules.

Treat the `AccountFollowOperationValidationUnknown` as failed unless you intend to support the specific rules. See Follow Rules for more information.

### 2. Submit Unfollow Request

Then, if your unfollow request is allowed, you can proceed with submitting the request.

#### Unfollow on Global Graph

```typescript
import { evmAddress } from "@lens-protocol/client";
import { unfollow } from "@lens-protocol/client/actions";

const result = await unfollow(sessionClient, {
  account: evmAddress("0x1234…"),
});
```

The Lens SDK example here leverages a functional approach to chaining operations using the `Result<T, E>` object. See the Error Handling guide for more information.

### 3. Handle Result

Finally, handle the result using the adapter for the library of your choice:

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await unfollow(sessionClient, {
  account: evmAddress("0x1234"),
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

That's it—you now know how to follow and unfollow an Account on Lens, allowing to manage your social graph.

# Follow Relationships

This guide explains how to fetch followers and followings on Lens.

## List Followers

Use the paginated `fetchFollowers` action to list followers of an Account.

```typescript
// Any Graph
import { evmAddress } from "@lens-protocol/client";
import { fetchFollowers } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchFollowers(client, {
  of: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Follow>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

## List Following

Use the paginated `fetchFollowing` action to fetch a list of accounts that this account is following.

```typescript
// Any Graph
import { evmAddress } from "@lens-protocol/client";
import { fetchFollowing } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchFollowing(client, {
  for: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Follow>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

## Check Follow Status

You can use the `fetchFollowStatus` action to check if an Account follows other Accounts.

```typescript
// Any Graph
import { evmAddress } from "@lens-protocol/client";
import { fetchFollowStatus } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchFollowStatus(client, {
  observer: evmAddress("0x1234…"),
  subject: evmAddress("0x5678…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// followStatus: { isFollowing: boolean }
const followStatus = result.value;

console.log(
  followStatus.isFollowing
    ? "They're following the account"
    : "They're not following the account"
);
```

## Followers You Know

Use the `fetchFollowersYouKnow` action to get mutual followers between two accounts—followers of a targeted account that are also followed by the logged-in account.

```typescript
import { evmAddress } from "@lens-protocol/client";
import { fetchFollowersYouKnow } from "@lens-protocol/client/actions";

import { sessionClient } from "./client";

const result = await fetchFollowersYouKnow(sessionClient, {
  of: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Account>
const { items, pageInfo } = result.value;
```

## Find Accounts by Follow Status

You can use both `fetchFollowers` and `fetchFollowing` to find common connections between accounts.

### Fetch Common Followers

Use `fetchFollowers` multiple times to get the followers for each of the specified accounts.

```typescript
import { evmAddress } from "@lens-protocol/client";
import { fetchFollowers } from "@lens-protocol/client/actions";
import { uniqBy } from "ramda";

import { client } from "./client";

const subject1 = evmAddress("0x1234…");
const subject2 = evmAddress("0x5678…");

const [result1, result2] = await Promise.all([
  fetchFollowers(client, {
    for: subject1,
  }),
  fetchFollowers(client, {
    for: subject2,
  }),
]);

if (result1.isErr()) {
  return console.error(result1.error);
}

if (result2.isErr()) {
  return console.error(result2.error);
}

// find common followers
const followers1 = result1.value.items.map((item) => item.followers);
const followers2 = result2.value.items.map((item) => item.followers);

// find addresses that appear in both arrays
const commonFollowers = followers1.filter((follower) =>
  followers2.includes(follower)
);

console.log("Common followers:", commonFollowers);
```

# Follow Rules

This guide explains how to manage follow rules for an Account on Lens.

## List Available Follow Rules

You can use the `fetchAccountFollowRules` action to fetch the follow rules associated with a specific Account.

```typescript
import { evmAddress } from "@lens-protocol/client";
import { fetchAccountFollowRules } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchAccountFollowRules(client, {
  account: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

const rules = result.value;
```

## Set Follow Rule

To set a Follow Rule for an account, implement the following steps.

You **MUST** be authenticated as Account Owner or Account Manager to set a Follow Rule.

### 1. Prepare the Request

First, prepare the set rule action.

#### No Follow Rule (Free Follow)

```typescript
import { evmAddress } from "@lens-protocol/client";
import { setAccountFollowRule } from "@lens-protocol/client/actions";

const result = await setAccountFollowRule(sessionClient, {
  account: evmAddress("0x1234…"), // The account to set the rule for
  rule: {
    type: "NO_RULE",
  },
});
```

#### Paid Follow Rule

```typescript
import { evmAddress } from "@lens-protocol/client";
import { setAccountFollowRule } from "@lens-protocol/client/actions";

const result = await setAccountFollowRule(sessionClient, {
  account: evmAddress("0x1234…"), // The account to set the rule for
  rule: {
    type: "PAID_RULE",
    amount: "1.5",
    currency: evmAddress("0xD40ec9ac0BBAb78dECf566A77213Eb069FD6a735"), // GHO
    recipient: evmAddress("0x7890…"), // Optional, defaults to rule owner
  },
});
```

### 2. Handle Result

Finally, handle the result using the adapter for the library of your choice:

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await setAccountFollowRule(sessionClient, {
  account: evmAddress("0x1234…"),
  rule: {
    type: "NO_RULE",
  },
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

# Custom Graphs

This guide explains how to create and manage custom follow graphs on Lens.

A Graph represents a follow network between Accounts. Each Graph has a unique identifier.

## Create a Graph

To create a new Graph, implement the following steps.

You **MUST** be authenticated as Builder to create a Graph.

### 1. Create Metadata

First, create the Graph Metadata object.

```typescript
import { graph } from "@lens-protocol/metadata";

const metadata = graph({
  name: "My Custom Graph",
  description: "A custom graph for my app",
});
```

### 2. Upload Metadata

Next, upload the Graph Metadata object to a public URI.

```typescript
import { storageClient } from "./storage-client";

const { uri } = await storageClient.uploadAsJson(metadata);

console.log(uri); // e.g., lens://4f91ca…
```

This example uses Grove storage to host the Metadata object. See the Lens Metadata Standards guide for more information on hosting Metadata objects.

### 3. Create Graph

Next, create the Graph on Lens.

```typescript
import { uri } from "@lens-protocol/client";
import { createGraph } from "@lens-protocol/client/actions";

const result = await createGraph(sessionClient, {
  metadataUri: uri("lens://4f91ca…"), // The URI from the previous step
  rule: {
    type: "NO_RULE", // No follow restriction
  },
  ownershipOf: {
    app: evmAddress("0x1234…"), // Optional: App to grant ownership to
  },
});
```

### 4. Handle Result

Finally, handle the result using the adapter for the library of your choice:

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await createGraph(sessionClient, {
  metadataUri: uri("lens://4f91ca…"),
  rule: {
    type: "NO_RULE",
  },
}).andThen(handleOperationWith(walletClient));
```

## Follow on Custom Graph

You can use the same methods as for the Global Graph, but specify the `graph` parameter:

```typescript
import { evmAddress } from "@lens-protocol/client";
import { follow } from "@lens-protocol/client/actions";

const result = await follow(sessionClient, {
  account: evmAddress("0x1234…"),
  graph: evmAddress("0x5678…"), // The custom graph address
});
```

## Unfollow on Custom Graph

You can use the same methods as for the Global Graph, but specify the `graph` parameter:

```typescript
import { evmAddress } from "@lens-protocol/client";
import { unfollow } from "@lens-protocol/client/actions";

const result = await unfollow(sessionClient, {
  account: evmAddress("0x1234…"),
  graph: evmAddress("0x5678…"), // The custom graph address
});
```

## List Followers on Custom Graph

List followers on a custom graph by specifying the `graph` parameter:

```typescript
import { evmAddress } from "@lens-protocol/client";
import { fetchFollowers } from "@lens-protocol/client/actions";

const result = await fetchFollowers(client, {
  of: evmAddress("0x1234…"),
  graph: evmAddress("0x5678…"), // The custom graph address
});
```

## List Following on Custom Graph

List accounts that an account is following on a custom graph by specifying the `graph` parameter:

```typescript
import { evmAddress } from "@lens-protocol/client";
import { fetchFollowing } from "@lens-protocol/client/actions";

const result = await fetchFollowing(client, {
  for: evmAddress("0x1234…"),
  graph: evmAddress("0x5678…"), // The custom graph address
});
```

## Set Graph Rule

To set a Rule for a Graph, implement the following steps.

You **MUST** be authenticated as Graph Owner or Graph Admin to set a Graph Rule.

### 1. Prepare the Request

First, prepare the set rule action.

#### No Follow Rule (Free Follow)

```typescript
import { evmAddress } from "@lens-protocol/client";
import { setGraphRule } from "@lens-protocol/client/actions";

const result = await setGraphRule(sessionClient, {
  graph: evmAddress("0x5678…"), // The graph to set the rule for
  rule: {
    type: "NO_RULE",
  },
});
```

#### Paid Follow Rule

```typescript
import { evmAddress } from "@lens-protocol/client";
import { setGraphRule } from "@lens-protocol/client/actions";

const result = await setGraphRule(sessionClient, {
  graph: evmAddress("0x5678…"), // The graph to set the rule for
  rule: {
    type: "PAID_RULE",
    amount: "1.5",
    currency: evmAddress("0xD40ec9ac0BBAb78dECf566A77213Eb069FD6a735"), // GHO
    recipient: evmAddress("0x7890…"), // Optional, defaults to rule owner
  },
});
```

### 2. Handle Result

Finally, handle the result using the adapter for the library of your choice:

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await setGraphRule(sessionClient, {
  graph: evmAddress("0x5678…"),
  rule: {
    type: "NO_RULE",
  },
}).andThen(handleOperationWith(walletClient));
```

## List Graphs

Use the `fetchGraphs` action to list Graphs.

```typescript
import { evmAddress } from "@lens-protocol/client";
import { fetchGraphs } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchGraphs(client, {
  filter: {
    owner: evmAddress("0x1234…"), // Optional filter by owner
  },
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Graph>
const { items, pageInfo } = result.value;
```

## Get Graph Details

Use the `fetchGraph` action to fetch details about a specific Graph.

```typescript
import { evmAddress } from "@lens-protocol/client";
import { fetchGraph } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchGraph(client, {
  address: evmAddress("0x5678…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

const graph = result.value;

console.log("Graph name:", graph.metadata?.name);
console.log("Owner:", graph.owner);
```

