# Accounts

This guide covers everything you need to know about working with accounts in Lens.

## Account Types

Lens has two main account types:

1. **Lens Accounts**: These are the primary accounts on Lens, identified by a unique address.
2. **Lens Profiles**: Legacy accounts from Lens v1, identified by a profile ID.

## Create an Account

To create a new Lens Account, follow these steps.

### 1. Create Account Metadata

First, construct an Account Metadata object with the necessary content.

```ts
import { account } from "@lens-protocol/metadata";

const metadata = account({
  bio: "I'm a developer",
  links: ["https://github.com/username"],
  location: "San Francisco, CA",
  version: "1.0.0",
});
```

### 2. Upload Account Metadata

Next, upload the Account Metadata object to a public URI.

```ts
import { storageClient } from "./storage-client";

const { uri } = await storageClient.uploadAsJson(metadata);

console.log(uri); // e.g., lens://4f91ca…
```

This example uses Grove storage to host the Metadata object. See the Lens Metadata Standards guide for more information on hosting Metadata objects.

### 3. Create Account

Next, create the Lens Account using the `createAccount` action.

```ts
import { uri } from "@lens-protocol/client";
import { createAccount } from "@lens-protocol/client/actions";

// …

const result = await createAccount(sessionClient, {
  to: "0x1234…", // the address that will own the account
  metadataUri: uri("lens://4f91…"), // the URI from the previous step
});
```

### 4. Handle Result

Next, handle the result using the adapter for the library of your choice and wait for it to be indexed.

```ts
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await createAccount(sessionClient, {
  to: "0x1234…", // the address that will own the account
  metadataUri: uri("lens://4f91…"), // the URI from the previous step
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

### 5. Fetch New Account

Finally, fetch the newly created Account using the `fetchAccount` action.

```ts
import { fetchAccount } from "@lens-protocol/client/actions";

// …

const result = await createAccount(sessionClient, {
  to: "0x1234…", // the address that will own the account
  metadataUri: uri("lens://4f91…"), // the URI from the previous step
})
  .andThen(handleOperationWith(walletClientOrSigner))
  .andThen(sessionClient.waitForTransaction)
  .andThen((txHash) => fetchAccount(sessionClient, { txHash }));

if (result.isErr()) {
  return console.error(result.error);
}

// account: Account | null
const account = result.value;
```

That's it—you now have a Lens Account!

## Fetch Accounts

This guide will show you how to fetch Account data in different ways.

Lens Account data has a rich structure that includes the following information:

- Address of the account
- Account Metadata content
- Usernames
- Ownership
- Linked Profiles
- Verification status

To illustrate how to fetch accounts, we will use the following fragments:

```graphql
fragment Account on Account {
  address
  metadata {
    ...AccountMetadata
  }
  usernames {
    ...Username
  }
  owner
  profiles {
    ...Profile
  }
  verified
}
```

### Get an Account

Use the `fetchAccount` action to fetch a single Account by address or by transaction hash.

```ts
// By Address
import { evmAddress } from "@lens-protocol/client";
import { fetchAccount } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchAccount(client, {
  account: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

const account = result.value;
```

### List Accounts

Use the paginated `fetchAccounts` action to fetch a list of Accounts based on the provided filters.

```ts
// By Query
import { fetchAccounts } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchAccounts(client, {
  filter: {
    searchQuery: "Lens",
  },
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Account>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

### Check if Account Exists

Use the `isAccountExisting` action to check if an Account exists.

```ts
import { evmAddress } from "@lens-protocol/client";
import { isAccountExisting } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await isAccountExisting(client, {
  address: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// exists: boolean
const exists = result.value;
```

## Update Account

To update an existing Lens Account, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to update an Account.

### 1. Create New Account Metadata

First, construct an Account Metadata object with the new content.

```ts
import { account } from "@lens-protocol/metadata";

const metadata = account({
  bio: "I'm a developer",
  links: ["https://github.com/username"],
  location: "San Francisco, CA",
  version: "1.0.0",
});
```

### 2. Upload Account Metadata

Next, upload the Account Metadata object to a public URI.

```ts
import { storageClient } from "./storage-client";

const { uri } = await storageClient.uploadAsJson(metadata);

console.log(uri); // e.g., lens://4f91ca…
```

This example uses Grove storage to host the Metadata object. See the Lens Metadata Standards guide for more information on hosting Metadata objects.

### 3. Update Account

Next, update the Account using the `setAccountMetadata` action.

```ts
import { uri, evmAddress } from "@lens-protocol/client";
import { setAccountMetadata } from "@lens-protocol/client/actions";

// …

const result = await setAccountMetadata(sessionClient, {
  metadataUri: uri("lens://4f91…"), // the URI with new metadata
  account: evmAddress("0x1234…"),
});
```

### 4. Handle Result

Finally, handle the result using the adapter for the library of your choice:

```ts
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await setAccountMetadata(sessionClient, {
  metadataUri: uri("lens://4f91…"),
  account: evmAddress("0x1234…"),
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

## Account Managers

Account Managers are addresses that can manage an Account on behalf of the owner. This is useful for allowing applications to manage an Account without requiring the owner to sign every transaction.

### Add Account Manager

To add an Account Manager to an Account, follow these steps.

You MUST be authenticated as Account Owner to add an Account Manager.

```ts
import { evmAddress } from "@lens-protocol/client";
import { addAccountManager } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await addAccountManager(sessionClient, {
  account: evmAddress("0x1234…"),
  manager: evmAddress("0x5678…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

### Remove Account Manager

To remove an Account Manager from an Account, follow these steps.

You MUST be authenticated as Account Owner to remove an Account Manager.

```ts
import { evmAddress } from "@lens-protocol/client";
import { removeAccountManager } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await removeAccountManager(sessionClient, {
  account: evmAddress("0x1234…"),
  manager: evmAddress("0x5678…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

### List Account Managers

Use the paginated `fetchAccountManagers` action to fetch a list of Account Managers for an Account.

```ts
import { evmAddress } from "@lens-protocol/client";
import { fetchAccountManagers } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchAccountManagers(client, {
  account: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<AccountManager>: [{manager: evmAddress, timestamp: DateTime}, …]
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

## Account Ownership

The owner of an Account is the address that can manage the Account and its managers. The owner can transfer ownership of the Account to another address.

### Transfer Ownership

To transfer ownership of an Account, follow these steps.

You MUST be authenticated as Account Owner to transfer ownership.

```ts
import { evmAddress } from "@lens-protocol/client";
import { transferAccount } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await transferAccount(sessionClient, {
  account: evmAddress("0x1234…"),
  to: evmAddress("0x5678…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

## Account Verification

Account verification is a process that allows users to prove ownership of their Lens Account. This is useful for preventing impersonation and ensuring that users are who they claim to be.

### Verify Account

To verify an Account, follow these steps.

You MUST be authenticated as Account Owner to verify an Account.

```ts
import { evmAddress } from "@lens-protocol/client";
import { verifyAccount } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await verifyAccount(sessionClient, {
  account: evmAddress("0x1234…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

## Account Blocking

Account blocking allows users to block other users from interacting with them. This is useful for preventing harassment and unwanted interactions.

### Block Account

To block an Account, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to block an Account.

```ts
import { evmAddress } from "@lens-protocol/client";
import { blockAccount } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await blockAccount(sessionClient, {
  account: evmAddress("0x1234…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

### Unblock Account

To unblock an Account, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to unblock an Account.

```ts
import { evmAddress } from "@lens-protocol/client";
import { unblockAccount } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await unblockAccount(sessionClient, {
  account: evmAddress("0x1234…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

### List Blocked Accounts

Use the paginated `fetchBlockedAccounts` action to fetch a list of Accounts that the authenticated user has blocked.

```ts
import { fetchBlockedAccounts } from "@lens-protocol/client/actions";

// …

const result = await fetchBlockedAccounts(sessionClient);

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Account>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

## Account Follow

Account following allows users to follow other users to receive updates from them. This is useful for building social networks and content discovery.

### Follow Account

To follow an Account, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to follow an Account.

```ts
import { evmAddress } from "@lens-protocol/client";
import { followAccount } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await followAccount(sessionClient, {
  account: evmAddress("0x1234…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

### Unfollow Account

To unfollow an Account, follow these steps.

You MUST be authenticated as Account Owner or Account Manager to unfollow an Account.

```ts
import { evmAddress } from "@lens-protocol/client";
import { unfollowAccount } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await unfollowAccount(sessionClient, {
  account: evmAddress("0x1234…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

### List Followers

Use the paginated `fetchFollowers` action to fetch a list of Accounts that follow the specified Account.

```ts
import { evmAddress } from "@lens-protocol/client";
import { fetchFollowers } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchFollowers(client, {
  account: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Account>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

### List Following

Use the paginated `fetchFollowing` action to fetch a list of Accounts that the specified Account follows.

```ts
import { evmAddress } from "@lens-protocol/client";
import { fetchFollowing } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchFollowing(client, {
  account: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Account>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

### Check Follow Status

Use the `isFollowing` action to check if an Account is following another Account.

```ts
import { evmAddress } from "@lens-protocol/client";
import { isFollowing } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await isFollowing(client, {
  follower: evmAddress("0x1234…"),
  followee: evmAddress("0x5678…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// isFollowing: boolean
const isFollowing = result.value;
```

## Account Linking

Account linking allows users to link their Lens Account to other accounts, such as legacy Lens Profiles or other blockchain accounts.

### Link Profile

To link a Lens Profile to a Lens Account, follow these steps.

You MUST be authenticated as Account Owner to link a Profile.

```ts
import { evmAddress, profileId } from "@lens-protocol/client";
import { linkProfile } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await linkProfile(sessionClient, {
  account: evmAddress("0x1234…"),
  profile: profileId("0x01"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

### Unlink Profile

To unlink a Lens Profile from a Lens Account, follow these steps.

You MUST be authenticated as Account Owner to unlink a Profile.

```ts
import { evmAddress, profileId } from "@lens-protocol/client";
import { unlinkProfile } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await unlinkProfile(sessionClient, {
  account: evmAddress("0x1234…"),
  profile: profileId("0x01"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

### List Linked Profiles

Use the paginated `fetchLinkedProfiles` action to fetch a list of Profiles linked to an Account.

```ts
import { evmAddress } from "@lens-protocol/client";
import { fetchLinkedProfiles } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchLinkedProfiles(client, {
  account: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Profile>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

## Account Team Management

Team management allows Account Owners to delegate specific permissions to other addresses. This is useful for allowing applications to manage specific aspects of an Account without requiring the owner to sign every transaction.

### Add Team Member

To add a team member to an Account, follow these steps.

You MUST be authenticated as Account Owner to add a team member.

```ts
import { evmAddress } from "@lens-protocol/client";
import { addTeamMember } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await addTeamMember(sessionClient, {
  account: evmAddress("0x1234…"),
  member: evmAddress("0x5678…"),
  role: "ADMIN",
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

### Remove Team Member

To remove a team member from an Account, follow these steps.

You MUST be authenticated as Account Owner to remove a team member.

```ts
import { evmAddress } from "@lens-protocol/client";
import { removeTeamMember } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await removeTeamMember(sessionClient, {
  account: evmAddress("0x1234…"),
  member: evmAddress("0x5678…"),
  role: "ADMIN",
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

### List Team Members

Use the paginated `fetchTeamMembers` action to fetch a list of team members for an Account.

```ts
import { evmAddress } from "@lens-protocol/client";
import { fetchTeamMembers } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchTeamMembers(client, {
  account: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<TeamMember>: [{member: evmAddress, role: string, timestamp: DateTime}, …]
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

## Account Deletion

Account deletion allows users to permanently delete their Lens Account. This is useful for complying with privacy regulations and allowing users to remove their data from the platform.

### Delete Account

To delete a Lens Account, follow these steps.

You MUST be authenticated as Account Owner to delete an Account.

```ts
import { evmAddress } from "@lens-protocol/client";
import { deleteAccount } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await deleteAccount(sessionClient, {
  account: evmAddress("0x1234…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

## Account Recovery

Account recovery allows users to recover their Lens Account if they lose access to their private key. This is useful for preventing users from losing access to their accounts due to lost or compromised keys.

### Initiate Recovery

To initiate recovery of a Lens Account, follow these steps.

```ts
import { evmAddress } from "@lens-protocol/client";
import { initiateAccountRecovery } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await initiateAccountRecovery(client, {
  account: evmAddress("0x1234…"),
  email: "user@example.com",
});

if (result.isErr()) {
  return console.error(result.error);
}

// success: boolean
const success = result.value;
```

### Complete Recovery

To complete recovery of a Lens Account, follow these steps.

```ts
import { evmAddress } from "@lens-protocol/client";
import { completeAccountRecovery } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await completeAccountRecovery(sessionClient, {
  account: evmAddress("0x1234…"),
  recoveryCode: "123456",
  newOwner: evmAddress("0x5678…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}

// success: boolean
const success = result.value;
``` 