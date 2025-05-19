# Sponsoring Transactions

Lens allows apps to offer a free user experience to their end-users through Sponsorships.

Lens Sponsorship enables developers to provide a fully configurable, gasless experience for their users. It leverages the ZKsync Paymaster.

After creating and funding a Sponsorship, it can be used to cover gas fees for Lens Protocol transactions, as well as any other transactions on the Lens Chain.

## Create Sponsorship
To create a Sponsorship, follow these steps.

You **MUST** be authenticated as a Builder to create a Sponsorship.

### 1. Create Metadata
First, create the Sponsorship Metadata object.

```typescript
// Use the @lens-protocol/metadata package to construct a valid SponsorshipMetadata object:
import { sponsorship } from "@lens-protocol/metadata";

const metadata = sponsorship({
  name: "GasPal",
});
```

### 2. Upload Metadata
Next, upload the Sponsorship Metadata object to a public URI.

```typescript
import { storageClient } from "./storage-client";

const { uri } = await storageClient.uploadAsJson(metadata);

console.log(uri); // e.g., lens://4f91ca…
```

This example uses Grove storage to host the Metadata object. See the Lens Metadata Standards guide for more information on hosting Metadata objects.

### 3. Deploy Contract
Next, deploy the Lens Sponsorship smart contract.

By setting the `allowLensAccess` flag to `true`, you are allowing the Lens API to use the Sponsorship to sponsor Lens transactions for users of your Lens App.

```typescript
import { uri } from "@lens-protocol/client";
import { createSponsorship } from "@lens-protocol/client/actions";

// …

const result = await createSponsorship(sessionClient, {
  metadataUri: uri("lens://4f91…"), // the URI from the previous step
  allowLensAccess: true,
});
```

### 4. Handle Result
Then, handle the result using the adapter for the library of your choice:

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await createSponsorship(sessionClient, {
  metadataUri: uri("lens://4f91…"), // the URI from the previous step
  allowLensAccess: true,
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

## Fund Sponsorship
To sponsor transactions for your users, you must periodically fund your Lens Sponsorship.

This involves sending native GHO (GRASS on Testnet) to the Lens Sponsorship contract address.

You can accomplish this either manually through a wallet or programmatically using code.

```typescript
// wallet.ts
import { ethers } from "ethers";

import { wallet } from "./wallet";

const response = await wallet.sendTransaction({
  to: "<SPONSORSHIP_ADDRESS>",
  value: ethers.parseEther("100"), // Amount in native tokens
});

const receipt = await response.wait();

// funded
```

Refer to the Lens Chain integration guide for more options on how to integrate with the Lens Chain.

## Sponsor Lens Transactions
To start using Lens Sponsorship to sponsor Lens transactions for your users, follow these steps.

To simplify the development process on Testnet, if an app Sponsorship contract is not configured, all transactions are sponsored by Lens through a global Sponsorship contract.

### 1. Set App Sponsorship
First, configure your Lens App to use a Sponsorship you previously created.

```typescript
import { evmAddress } from "@lens-protocol/client";
import { setAppSponsorship } from "@lens-protocol/client/actions";

// …

const result = await setAppSponsorship(sessionClient, {
  app: evmAddress("0x1234…"),
  sponsorship: evmAddress("0x5678…"),
});
```

### 2. Handle Result
Then, handle the result using the adapter for the library of your choice and wait for it to be indexed.

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await setAppSponsorship(sessionClient, {
  app: evmAddress("0x1234…"),
  sponsorship: evmAddress("0x5678…"),
}).andThen(handleOperationWith(walletClient));
```

And, ensure the transaction was successful:

```typescript
// Wait for Transaction
const result = await setAppSponsorship(sessionClient, {
  app: evmAddress("0x1234…"),
  sponsorship: evmAddress("0x5678…"),
})
  .andThen(handleOperationWith(signer))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}

// The transaction was successful
```

### 3. Authentication Workflow
Finally, implement the Authentication Workflow to be able to authorize end-users for your sponsorship. If this is not implemented, the Lens API will require end-users to cover transaction fees by returning a Self-Funded Transaction Request for any operation involving a transaction.

Since transactions on Testnet fall back to being sponsored by the Lens global Sponsorship if no app Sponsorship is configured, you might not notice any visible difference in the final user experience until deploying to Mainnet, where the full behavior is enforced.

## Sponsor Any Transaction
To sponsor any transaction on the Lens Chain using funds from your Sponsorship, follow these steps.

### 1. Sponsorship Signer
First, generate a new private key for the address responsible for approving sponsorship requests (i.e., the signer).

```bash
# Foundry (cast)
cast wallet new

Successfully created new keypair.
Address:     0x8711d4d6B7536D…
Private key: 0x72433488d76ffec7a16b…
```

### 2. Add Signer
Next, add the signer to your Sponsorship.

You **MUST** be authenticated as a Builder and be the owner or an admin for the Sponsorship you want to add the signer to.

```typescript
import { evmAddress } from "@lens-protocol/client";
import { updateSponsorshipSigners } from "@lens-protocol/client/actions";

// …

const result = await updateSponsorshipSigners(sessionClient, {
  sponsorship: evmAddress("0xe2f2a5C287993345a840db3B0845fbc70f5935a5"),
  toAdd: [
    {
      address: evmAddress("0x8711d4d6B7536D…"),
      label: "My Backend System",
    },
  ],
});
```

### 3. Handle Result
Then, handle the result using the adapter for the library of your choice and wait for it to be indexed.

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await updateSponsorshipSigners(sessionClient, {
  sponsorship: evmAddress("0xe2f2a5C287993345a840db3B0845fbc70f5935a5"),
  toAdd: [
    {
      address: evmAddress("0x8711d4d6B7536D…"),
      label: "My Backend System",
    },
  ],
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);
```

### 4. Sponsorship Logic
Finally, implement the logic to sponsor user's transaction that supports your use case.

Here's an example of a client-side application that sends a request to its backend to generate a sponsored transaction based on specific criteria.

```typescript
// client.ts
import { parseEip712Transaction, sendEip712Transaction } from "viem/zksync";

import { wallet } from "./wallet";

const request = {
  from: wallet.account.address,
  to: "0x567890abcdef1234567890abcdef1234567890ab",
  value: 100,
};

const response = await fetch("http://localhost:3000/sponsor", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(request),
});
const { serialized } = await response.json();

// send the transaction
const transaction = parseEip712Transaction(serialized) as any;
const hash = await sendEip712Transaction(wallet, transaction);
```

The backend server listens for incoming requests, utilizes the `SponsorshipApprovalSigner` to approve the transaction, and sends the approved transaction back to the client.

```typescript
// server.ts
import express from "express";
import type { Address } from "viem";
import { serializeTransaction } from "viem/zksync";

import { approver } from "./approver";

const app = express();
app.use(express.json());

app.post("/sponsor", async (req, res) => {
  try {
    const approved = await approver.approveSponsorship({
      account: req.body.from as Address,
      to: req.body.to as Address,
      value: BigInt(req.body.value),
    });
    res.json({
      serialized: serializeTransaction(approved),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
});

app.listen(3000, () => {
  console.log("Server listening on http://localhost:3000");
});
```

## Managing Sponsorships
This guide covers how to manage your Lens Sponsorship contract.

### Rate Limiting
Lens Sponsorships allow you to scale your app while protecting it from abuse. Sponsorships can be configured with app-wide as well as per-user rate limits with configurable reset windows. This gives the developer full visibility and control over the usage of their app.

```graphql
input SponsorshipRateLimits {
  """
  The global rate limit.
  """
  global: SponsorshipRateLimit

  """
  The user rate limit.
  """
  user: SponsorshipRateLimit
}
```

### Configure Limits
You can provide rate limits when deploying the Sponsorship contract as well as update them later.

#### 1. Update Limits
First, create the transaction request to update the rate limits of a Sponsorship.

You **MUST** be authenticated as Builder and be either the owner or an admin of the Sponsorship you intend to configure.

```typescript
import { evmAddress, SponsorshipRateLimitWindow } from "@lens-protocol/client";
import { updateSponsorshipLimits } from "@lens-protocol/client/actions";

// …

const result = await updateSponsorshipLimits(sessionClient, {
  sponsorship: evmAddress("0xe2f2a5C287993345a840db3B0845fbc70f5935a5"),
  rateLimits: {
    user: {
      window: SponsorshipRateLimitWindow.Hour,
      limit: 100,
    },
    global: {
      window: SponsorshipRateLimitWindow.Day,
      limit: 1_000_000,
    },
  },
});
```

#### 2. Handle Result
Then, handle the result using the adapter for the library of your choice:

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await updateSponsorshipLimits(sessionClient, {
  sponsorship: evmAddress("0xe2f2a5C287993345a840db3B0845fbc70f5935a5"),
  rateLimits: {
    // …
  },
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

### Exclusion List
To enable certain use-cases such as trusted VIP/users, the rate-limiting feature can be optionally bypassed for given addresses by adding them to an exclusion list.

#### Update Exclusion List

##### 1. Prepare the Request
First, create the transaction request to update the exclusion list of a Sponsorship.

You **MUST** be authenticated as Builder and be either the owner or an admin of the Sponsorship you intend to configure.

```typescript
import { evmAddress, SponsorshipRateLimitWindow } from "@lens-protocol/client";
import { updateSponsorshipExclusionList } from "@lens-protocol/client/actions";

// …

const result = await updateSponsorshipExclusionList(sessionClient, {
  sponsorship: evmAddress("0xe2f2a5C287993345a840db3B0845fbc70f5935a5"),
  toAdd: [
    {
      address: evmAddress("0x1234…"),
      label: "Bob The Builder",
    },
  ],
  toRemove: [evmAddress("0x5678…")],
});
```

##### 2. Handle Result
Then, handle the result using the adapter for the library of your choice:

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await updateSponsorshipExclusionList(sessionClient, {
  sponsorship: evmAddress("0xe2f2a5C287993345a840db3B0845fbc70f5935a5"),
  toAdd: [
    // …
  ],
  toRemove: [
    // …
  ],
}).andThen(handleOperationWith(walletClient));
```

See the Transaction Lifecycle guide for more information on how to determine the status of the transaction.

#### Fetch Exclusion List

```typescript
import { evmAddress } from "@lens-protocol/client";
import { fetchSponsorshipLimitExclusions } from "@lens-protocol/client/actions";

import { client } from "./client";

const posts = await fetchSponsorshipLimitExclusions(client, {
  filter: {
    sponsorship: evmAddress("0x1234…"),
  },
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<{ sponsorship: EvmAddress, label: string, address: EvmAddress, createdAt: DateTimeTime }>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

### Signers
To ensure that sponsored transactions are only used by the intended users, the Sponsorship contract uses a list of authorized signers. These signers are one or more addresses that need to supply their signature to every transaction sent to the Sponsorship contract, indicating that the transaction originates from their app.

This is the mechanism behind the `allowLensAccess` flag you encountered when deploying the Sponsorship contract—it allows the Lens API to sponsor transactions for users while they are logged into your app.

#### Update Signers
You can provide a list of signers when deploying the Sponsorship contract as well as update them later.

##### 1. Configure Signers
First, create the transaction request to update the signers of a Sponsorship.

You **MUST** be authenticated as Builder and be either the owner or an admin of the Sponsorship you intend to configure.

```typescript
import { evmAddress } from "@lens-protocol/client";
import { updateSponsorshipSigners } from "@lens-protocol/client/actions";

// …

const result = await updateSponsorshipSigners(sessionClient, {
  sponsorship: evmAddress("0x1234…"),
  toAdd: [
    {
      address: evmAddress("0x5678…"),
      label: "My Backend System",
    },
  ],
});
```

##### 2. Handle Result
Then, handle the result using the adapter for the library of your choice:

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await updateSponsorshipSigners(sessionClient, {
  sponsorship: evmAddress("0x1234…"),
  toRemove: [evmAddress("0x5678…")],
}).andThen(handleOperationWith(walletClient));
```

#### Fetch Signers

```typescript
import { evmAddress } from "@lens-protocol/client";
import { fetchSponsorshipSigners } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchSponsorshipSigners(client, {
  filter: {
    sponsorship: evmAddress("0x1234…"),
  },
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<SponsorshipSigner>
// const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results.

### Pausing Sponsorships
By default, Sponsorships are active when deployed and ready to use. You can pause a Sponsorship to stop it from being used to sponsor transactions.

#### 1. Prepare Transaction
First, create the transaction request to pause or unpause a Sponsorship.

You **MUST** be authenticated as Builder and be either the owner or an admin of the Sponsorship you intend to configure.

```typescript
// Pause
import { evmAddress } from "@lens-protocol/client";
import { pauseSponsorship } from "@lens-protocol/client/actions";

// …

const result = await pauseSponsorship(sessionClient, {
  sponsorship: evmAddress("0x1234…"),
});
```

#### 2. Handle Result
Then, handle the result using the adapter for the library of your choice:

```typescript
// viem
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await pauseSponsorship(sessionClient, {
  sponsorship: evmAddress("0x1234…"),
}).andThen(handleOperationWith(walletClient));
```

### Access Control
The Sponsorship contract supports two roles: Owner and Administrators.

Administrators can:

- Add and remove authorized signers
- Add and remove addresses to the rate limit exclusion list
- Update the rate limits
- Pause and unpause the Sponsorship

The Owner can do everything the administrators can do, plus:

- Transfer ownership
- Update the list of administrators
- Withdraw the funds from the Sponsorship

See the Team Management guide for more information on how to manage these roles.

## Fetch Sponsorship
This guide will show you how to fetch Sponsorship data in different ways.

Lens Sponsorship data has a rich structure that includes the following information:

- Addresses of the primitive contract
- Sponsorship Metadata content
- Time of creation
- Owner of the Sponsorship
- Information about status of the sponsorship (pause or unpause)

To illustrate how to fetch sponsorships, we will use the following fragments:

```graphql
fragment Sponsorship on Sponsorship {
  __typename
  address
  isPaused
  allowsLensAccess
  createdAt
  metadata {
    ...SponsorshipMetadata
  }
  limits {
    __typename
    global {
      ...SponsorshipRateLimit
    }
    user {
      ...SponsorshipRateLimit
    }
  }
  owner
}
```

### Get a Sponsorship

```typescript
// By Address
import { evmAddress } from "@lens-protocol/client";
import { fetchSponsorship } from "@lens-protocol/client/actions";

import { client } from "./client";

const result = await fetchSponsorship(client, {
  address: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

const sponsorship = result.value;
```

### List Sponsorships

```typescript
// Managed By
import { evmAddress } from "@lens-protocol/client";
import { fetchSponsorships } from "@lens-protocol/client/actions";

import { client } from "./client";

const posts = await fetchSponsorships(client, {
  filter: {
    managedBy: {
      address: evmAddress("0x1234…"),
    },
  },
});

if (result.isErr()) {
  return console.error(result.error);
}

// items: Array<Sponsorship>
const { items, pageInfo } = result.value;
```

See the Pagination guide for more information on how to handle paginated results. 