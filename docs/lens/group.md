# Create a Group

This guide will help you create a Group on Lens.

To create an Group, follow these steps.

You **MUST** be authenticated as Builder, Account Manager, or Account Owner to create a Group.

## 1. Create Group Metadata

First, construct a Group Metadata object.

Use the `@lens-protocol/metadata` package to construct a valid `GroupMetadata` object:

```typescript
import { group } from "@lens-protocol/metadata";

const metadata = group({
  name: "XYZ",
  description: "My group description",
  icon: "lens://BsdfA…",
});
```

## 2. Upload Group Metadata

Next, upload the Group Metadata object to a public URI.

```typescript
import { storageClient } from "./storage-client";

const { uri } = await storageClient.uploadAsJson(metadata);

console.log(uri); // e.g., lens://4f91ca…
```

This example uses Grove storage to host the Metadata object. See the Lens Metadata Standards guide for more information on hosting Metadata objects.

## 3. Deploy Group Contract

Next, deploy the Group smart contract.

Use the `createGroup` action to deploy the Lens Group smart contract.

```typescript
import { uri } from "@lens-protocol/client";
import { createGroup } from "@lens-protocol/client/actions";

const result = await createGroup(sessionClient, {
  metadataUri: uri("lens://4f91c…"),
});
```

To learn more about how to use Group Rules, see the Group Rules guide.

## 4. Handle Result

Next, handle the result using the adapter for the library of your choice and wait for it to be indexed.

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await createGroup(sessionClient, {
  metadataUri: uri("lens://4f91ca…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

## 5. Fetch New Group

Finally, fetch the newly created Group using the `fetchGroup` action.

```typescript
import { fetchGroup } from "@lens-protocol/client/actions";

// …

const result = await createGroup(sessionClient, {
  metadataUri: uri("lens://4f91…"), // the URI from the previous step
})
  .andThen(handleOperationWith(walletClientOrSigner))
  .andThen(sessionClient.waitForTransaction)
  .andThen((txHash) => fetchGroup(sessionClient, { txHash }));

if (result.isErr()) {
  return console.error(result.error);
}

// group: Group | null
const group = result.value;
```

That's it—you have successfully created a Group on Lens!

# Fetch Groups

This guide will help you with fetching Groups from Lens API.

## Get a Group

Use the `fetchGroup` function to fetch a single Group by address or by transaction hash.

Fetching a Group by transaction hash is extremely useful when building a user experience where a user creates a Group and needs it presented back to them.

### By Group Address

```typescript
import { evmAddress } from "@lens-protocol/client";
import { fetchGroup } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchGroup(client, {
  group: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

const group = result.value;
```

## List Groups

Use the paginated `fetchGroups` function to fetch a list of Groups based on the provided filters.

```typescript
import { fetchGroups } from "@lens-protocol/client/actions";
import { client } from "./client";

const result = await fetchGroups(client, {
  filter: {
    searchQuery: "group",
  },
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Group>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

# Join Groups

This guide will help you manage Group membership on Lens.

## Join a Group

To join a Group, follow these steps.

You **MUST** be authenticated as Account Owner or Account Manager to join a Group.

### 1. Check Group Rules

First, inspect the `group.operations.canJoin` field to determine whether the logged-in Account is allowed to join. Some Groups may have restrictions on who can join them.

```typescript
switch (group.operations.canJoin.__typename) {
  case "GroupOperationValidationPassed":
    // Joining the group is allowed
    break;

  case "GroupOperationValidationFailed":
    // Joinin the group is not allowed
    console.log(group.operations.canJoin.reason);
    break;

  case "GroupOperationValidationUnknown":
    // Validation outcome is unknown
    break;
}
```

Where:

- `GroupOperationValidationPassed`: The logged-in Account can join the Group.
- `GroupOperationValidationFailed`: Joining the Group is not allowed. The `reason` field explains why, and `unsatisfiedRules` lists the unmet requirements.
- `GroupOperationValidationUnknown`: The Group has one or more unknown rules requiring ad-hoc verification. The `extraChecksRequired` field provides the addresses and configurations of these rules.

Treat the `GroupOperationValidationUnknown` as failed unless you intend to support the specific rules. See Group Rules for more information.

### 2. Join the Group

Next, if allowed, join the Group.

Use the `joinGroup` action to join a Group with the logged-in account.

You **MUST** be authenticated as Account Owner or Account Manager to make this request.

```typescript
import { evmAddress } from "@lens-protocol/client";
import { joinGroup } from "@lens-protocol/client/actions";

const result = await joinGroup(sessionClient, { group: evmAddress("0x1234") });
```

### 3. Handle Result

Finally, handle the result using the adapter for the library of your choice:

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await joinGroup(sessionClient, {
  group: evmAddress("0x1234"),
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

That's it—you now know how to join a Group on Lens!

# Leave Groups

This guide will help you leave a Group on Lens.

## Leave a Group

To leave a Group, follow these steps.

You **MUST** be authenticated as Account Owner or Account Manager to leave a Group.

### 1. Check Membership

First, inspect the `group.isMember` field to determine whether the logged-in Account is a member of the Group.

```typescript
if (!group.isMember) {
  console.log("You are not a member of this group");
  return;
}
```

### 2. Leave the Group

Next, leave the Group.

```typescript
import { evmAddress } from "@lens-protocol/client";
import { leaveGroup } from "@lens-protocol/client/actions";

const result = await leaveGroup(sessionClient, { group: evmAddress("0x1234") });
```

### 3. Handle Result

Finally, handle the result using the adapter for the library of your choice:

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await leaveGroup(sessionClient, {
  group: evmAddress("0x1234"),
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

# Group Membership

This guide will help you manage and query Group membership on Lens.

## List Group Members

Use the paginated `fetchGroupMembers` function to fetch a list of members of a Group.

```typescript
import { evmAddress } from "@lens-protocol/client";
import { fetchGroupMembers } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchGroupMembers(client, {
  group: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Account>
const { items, pageInfo } = result.value;
```

## List Account's Group Memberships

Use the paginated `fetchAccountGroups` function to fetch a list of Groups that an Account is a member of.

```typescript
import { evmAddress } from "@lens-protocol/client";
import { fetchAccountGroups } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchAccountGroups(client, {
  account: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Group>
const { items, pageInfo } = result.value;
```

## Check Group Membership

Use the `fetchGroupMembership` function to check if an Account is a member of a Group.

```typescript
import { evmAddress } from "@lens-protocol/client";
import { fetchGroupMembership } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchGroupMembership(client, {
  group: evmAddress("0x1234…"),
  member: evmAddress("0x5678…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

const membership = result.value;

console.log(
  membership.isMember
    ? "The account is a member of the group"
    : "The account is not a member of the group"
);
```

# Update Group Metadata

This guide will help you update the metadata of a Group on Lens.

You **MUST** be authenticated as Group Owner or Group Admin to update Group metadata.

## 1. Create Updated Metadata

First, construct an updated Group Metadata object.

```typescript
import { group } from "@lens-protocol/metadata";

const metadata = group({
  name: "Updated Group Name",
  description: "Updated group description",
  icon: "lens://BsdfA…",
});
```

## 2. Upload Updated Metadata

Next, upload the updated Group Metadata object to a public URI.

```typescript
import { storageClient } from "./storage-client";

const { uri } = await storageClient.uploadAsJson(metadata);

console.log(uri); // e.g., lens://updated4f91ca…
```

## 3. Update Group Metadata

Next, update the Group metadata.

```typescript
import { evmAddress, uri } from "@lens-protocol/client";
import { updateGroupMetadata } from "@lens-protocol/client/actions";

const result = await updateGroupMetadata(sessionClient, {
  group: evmAddress("0x1234…"),
  metadataUri: uri("lens://updated4f91ca…"),
});
```

## 4. Handle Result

Finally, handle the result using the adapter for the library of your choice:

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await updateGroupMetadata(sessionClient, {
  group: evmAddress("0x1234…"),
  metadataUri: uri("lens://updated4f91ca…"),
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

# Group Administration

This guide will help you manage Group administrators on Lens.

## Add Group Admins

To add admins to a Group, follow these steps.

You **MUST** be authenticated as Group Owner to add Group Admins.

### 1. Prepare the Request

```typescript
import { evmAddress } from "@lens-protocol/client";
import { addGroupAdmins } from "@lens-protocol/client/actions";

const result = await addGroupAdmins(sessionClient, {
  group: evmAddress("0x1234…"),
  admins: [evmAddress("0x5678…"), evmAddress("0x90ab…")],
});
```

### 2. Handle Result

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await addGroupAdmins(sessionClient, {
  group: evmAddress("0x1234…"),
  admins: [evmAddress("0x5678…"), evmAddress("0x90ab…")],
}).andThen(handleOperationWith(walletClient));
```

## Remove Group Admins

To remove admins from a Group, follow these steps.

You **MUST** be authenticated as Group Owner to remove Group Admins.

### 1. Prepare the Request

```typescript
import { evmAddress } from "@lens-protocol/client";
import { removeGroupAdmins } from "@lens-protocol/client/actions";

const result = await removeGroupAdmins(sessionClient, {
  group: evmAddress("0x1234…"),
  admins: [evmAddress("0x5678…"), evmAddress("0x90ab…")],
});
```

### 2. Handle Result

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await removeGroupAdmins(sessionClient, {
  group: evmAddress("0x1234…"),
  admins: [evmAddress("0x5678…"), evmAddress("0x90ab…")],
}).andThen(handleOperationWith(walletClient));
```

## List Group Admins

Use the paginated `fetchAdminsFor` function to fetch a list of admins for a Group.

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

# Group Rules

This guide will help you understand and manage Group rules on Lens.

Group Rules allow Group owners or admins to add requirements for users to join a Group.

## Built-in Group Rules

Lens provides several built-in Group rules:

- **No Rule**: Anyone can join the Group freely.
- **Token Gated Rule**: Requires members to hold a specific token (ERC20, ERC721, etc.) to join.
- **Manual Approval Rule**: Requires an admin to approve membership requests.
- **Follow Account Rule**: Requires members to follow specific Lens Accounts to join.

## Update Group Rules

To update the rules for a Group, follow these steps.

You **MUST** be authenticated as Group Owner or Group Admin to update Group Rules.

### 1. Prepare the Request

```typescript
import { evmAddress, TokenStandard } from "@lens-protocol/client";
import { updateGroupRules } from "@lens-protocol/client/actions";

const result = await updateGroupRules(sessionClient, {
  group: evmAddress("0x1234…"),
  rules: {
    required: [
      {
        tokenGatedRule: {
          token: {
            currency: evmAddress("0x5678…"),
            standard: TokenStandard.Erc721,
            amount: "1",
          },
        },
      },
    ],
  },
});
```

### 2. Handle Result

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await updateGroupRules(sessionClient, {
  group: evmAddress("0x1234…"),
  rules: {
    required: [
      {
        tokenGatedRule: {
          token: {
            currency: evmAddress("0x5678…"),
            standard: TokenStandard.Erc721,
            amount: "1",
          },
        },
      },
    ],
  },
}).andThen(handleOperationWith(walletClient));
```

## Check Group Rules

Use the `fetchGroupRules` function to fetch the rules for a Group.

```typescript
import { evmAddress } from "@lens-protocol/client";
import { fetchGroupRules } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchGroupRules(client, {
  group: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

const rules = result.value;
```

# Transfer Group Ownership

This guide will help you transfer ownership of a Group on Lens.

## Transfer Ownership

To transfer ownership of a Group, follow these steps.

You **MUST** be authenticated as Group Owner to transfer Group ownership.

### 1. Prepare the Request

```typescript
import { evmAddress } from "@lens-protocol/client";
import { transferGroupOwnership } from "@lens-protocol/client/actions";

const result = await transferGroupOwnership(sessionClient, {
  group: evmAddress("0x1234…"),
  newOwner: evmAddress("0x5678…"),
});
```

### 2. Handle Result

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await transferGroupOwnership(sessionClient, {
  group: evmAddress("0x1234…"),
  newOwner: evmAddress("0x5678…"),
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

# Group Posts

This guide will help you post to a Group on Lens.

## Post to a Group

To post to a Group, follow these steps.

You **MUST** be authenticated as Account Owner or Account Manager to post to a Group.

### 1. Check Membership

First, ensure the logged-in account is a member of the Group.

```typescript
if (!group.isMember) {
  console.log("You must be a member of this group to post to it");
  return;
}
```

### 2. Create Post Metadata

Next, create the Post metadata.

```typescript
import { textOnly } from "@lens-protocol/metadata";

const metadata = textOnly({
  content: "Hello, Group!",
});
```

### 3. Upload Post Metadata

Upload the Post metadata to a public URI.

```typescript
import { storageClient } from "./storage-client";

const { uri } = await storageClient.uploadAsJson(metadata);
```

### 4. Create the Post

Submit the Post to the Group.

```typescript
import { evmAddress, uri } from "@lens-protocol/client";
import { post } from "@lens-protocol/client/actions";

const result = await post(sessionClient, {
  contentUri: uri("lens://..."),
  to: evmAddress("0x1234…"), // Group address
});
```

### 5. Handle Result

Handle the result using the adapter for the library of your choice.

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await post(sessionClient, {
  contentUri: uri("lens://..."),
  to: evmAddress("0x1234…"), // Group address
}).andThen(handleOperationWith(walletClient));
```

## Fetch Group Posts

Use the paginated `fetchPosts` function to fetch posts in a Group.

```typescript
import { evmAddress } from "@lens-protocol/client";
import { fetchPosts } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchPosts(client, {
  filter: {
    where: {
      anyGroup: [evmAddress("0x1234…")],
    },
  },
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Post>
const { items, pageInfo } = result.value;
```

# Close Group Feed

Closing a Group feed is a permanent action that prevents new posts from being created in the Group. Existing posts will still be visible.

You **MUST** be authenticated as Group Owner to close a Group feed.

## Close a Group Feed

To close a Group feed, follow these steps.

### 1. Prepare the Request

```typescript
import { evmAddress } from "@lens-protocol/client";
import { closeGroupFeed } from "@lens-protocol/client/actions";

const result = await closeGroupFeed(sessionClient, {
  group: evmAddress("0x1234…"),
});
```

### 2. Handle Result

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await closeGroupFeed(sessionClient, {
  group: evmAddress("0x1234…"),
}).andThen(handleOperationWith(walletClient));
```



```