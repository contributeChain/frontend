# Transactions

This guide covers everything you need to know about working with transactions in Lens.

## Transaction Lifecycle

Lens transactions go through several stages from creation to completion:

1. **Preparation**: The transaction is prepared with the necessary parameters.
2. **Signing**: The transaction is signed by the user's wallet.
3. **Broadcasting**: The signed transaction is sent to the blockchain network.
4. **Confirmation**: The transaction is confirmed by the blockchain network.
5. **Indexing**: The transaction is indexed by the Lens API.

## Transaction Types

Lens supports several types of transactions:

1. **On-chain Transactions**: Transactions that are executed on the blockchain.
2. **Meta Transactions**: Transactions that are executed on behalf of the user by a relayer.
3. **Bundled Transactions**: Multiple transactions that are executed together as a single transaction.

## Handle Transactions

To handle transactions in Lens, you can use the transaction adapters provided by the SDK.

### Viem Adapter

The Viem adapter allows you to handle transactions using the Viem library.

```ts
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await createPost(sessionClient, {
  metadataUri: uri("lens://4f91…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

### Ethers Adapter

The Ethers adapter allows you to handle transactions using the Ethers library.

```ts
import { handleOperationWith } from "@lens-protocol/client/ethers";

// …

const result = await createPost(sessionClient, {
  metadataUri: uri("lens://4f91…"),
})
  .andThen(handleOperationWith(signer))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

### Web3.js Adapter

The Web3.js adapter allows you to handle transactions using the Web3.js library.

```ts
import { handleOperationWith } from "@lens-protocol/client/web3js";

// …

const result = await createPost(sessionClient, {
  metadataUri: uri("lens://4f91…"),
})
  .andThen(handleOperationWith(web3))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

## Transaction Status

To check the status of a transaction, you can use the `waitForTransaction` method provided by the SDK.

```ts
import { handleOperationWith } from "@lens-protocol/client/viem";

// …

const result = await createPost(sessionClient, {
  metadataUri: uri("lens://4f91…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}

// Transaction has been confirmed and indexed
console.log("Transaction hash:", result.value);
```

## Transaction Errors

Lens transactions can fail for various reasons. Here are some common error types and how to handle them:

### User Rejection

If the user rejects the transaction in their wallet, you'll receive a `UserRejectedError`.

```ts
import { UserRejectedError } from "@lens-protocol/client";

// …

const result = await createPost(sessionClient, {
  metadataUri: uri("lens://4f91…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  if (result.error instanceof UserRejectedError) {
    console.error("User rejected the transaction");
    return;
  }
  console.error("Transaction failed:", result.error);
  return;
}
```

### Transaction Failure

If the transaction fails on the blockchain, you'll receive a `TransactionError`.

```ts
import { TransactionError } from "@lens-protocol/client";

// …

const result = await createPost(sessionClient, {
  metadataUri: uri("lens://4f91…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  if (result.error instanceof TransactionError) {
    console.error("Transaction failed on the blockchain:", result.error.message);
    return;
  }
  console.error("Transaction failed:", result.error);
  return;
}
```

### Indexing Failure

If the transaction is confirmed on the blockchain but fails to be indexed by the Lens API, you'll receive an `IndexingError`.

```ts
import { IndexingError } from "@lens-protocol/client";

// …

const result = await createPost(sessionClient, {
  metadataUri: uri("lens://4f91…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  if (result.error instanceof IndexingError) {
    console.error("Transaction was confirmed but failed to be indexed:", result.error.message);
    return;
  }
  console.error("Transaction failed:", result.error);
  return;
}
```

## Transaction Receipts

To get the receipt of a transaction, you can use the `getTransactionReceipt` method provided by the SDK.

```ts
import { getTransactionReceipt } from "@lens-protocol/client/actions";

// …

const result = await getTransactionReceipt(client, {
  txHash: "0x1234…",
});

if (result.isErr()) {
  return console.error(result.error);
}

const receipt = result.value;
console.log("Transaction receipt:", receipt);
```

## Transaction History

To get the transaction history for an account, you can use the `fetchTransactionHistory` method provided by the SDK.

```ts
import { fetchTransactionHistory } from "@lens-protocol/client/actions";

// …

const result = await fetchTransactionHistory(client, {
  for: evmAddress("0x1234…"),
});

if (result.isErr()) {
  return console.error(result.error);
}

const { items, pageInfo } = result.value;
console.log("Transaction history:", items);
```

## Transaction Fees

Lens transactions may require fees to be paid. Here's how to handle transaction fees:

### Estimate Gas

To estimate the gas required for a transaction, you can use the `estimateGas` method provided by the SDK.

```ts
import { estimateGas } from "@lens-protocol/client/actions";

// …

const result = await estimateGas(client, {
  operation: createPost(sessionClient, {
    metadataUri: uri("lens://4f91…"),
  }),
});

if (result.isErr()) {
  return console.error(result.error);
}

const gasEstimate = result.value;
console.log("Estimated gas:", gasEstimate);
```

### Set Gas Price

To set the gas price for a transaction, you can use the `setGasPrice` method provided by the SDK.

```ts
import { setGasPrice } from "@lens-protocol/client/actions";

// …

const result = await createPost(sessionClient, {
  metadataUri: uri("lens://4f91…"),
})
  .andThen(setGasPrice(walletClient, { maxFeePerGas: 100n }))
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

## Transaction Sponsorship

Lens supports transaction sponsorship, which allows apps to pay for transaction fees on behalf of their users.

### Check Sponsorship Eligibility

To check if a transaction is eligible for sponsorship, you can use the `isSponsoredEligible` method provided by the SDK.

```ts
import { isSponsoredEligible } from "@lens-protocol/client/actions";

// …

const result = await isSponsoredEligible(client, {
  operation: createPost(sessionClient, {
    metadataUri: uri("lens://4f91…"),
  }),
});

if (result.isErr()) {
  return console.error(result.error);
}

const isEligible = result.value;
console.log("Is eligible for sponsorship:", isEligible);
```

### Use Sponsorship

To use sponsorship for a transaction, you can use the `useSponsoredTransaction` method provided by the SDK.

```ts
import { useSponsoredTransaction } from "@lens-protocol/client/actions";

// …

const result = await createPost(sessionClient, {
  metadataUri: uri("lens://4f91…"),
})
  .andThen(useSponsoredTransaction(sessionClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

## Transaction Batching

Lens supports transaction batching, which allows you to execute multiple transactions as a single transaction.

### Create Transaction Batch

To create a transaction batch, you can use the `batchOperations` method provided by the SDK.

```ts
import { batchOperations } from "@lens-protocol/client/actions";

// …

const result = await batchOperations([
  createPost(sessionClient, {
    metadataUri: uri("lens://4f91…"),
  }),
  followAccount(sessionClient, {
    account: evmAddress("0x1234…"),
  }),
])
  .andThen(handleOperationWith(walletClient))
  .andThen(sessionClient.waitForTransaction);

if (result.isErr()) {
  return console.error(result.error);
}
```

## Transaction Polling

To poll for the status of a transaction, you can use the `pollTransaction` method provided by the SDK.

```ts
import { pollTransaction } from "@lens-protocol/client/actions";

// …

const result = await createPost(sessionClient, {
  metadataUri: uri("lens://4f91…"),
})
  .andThen(handleOperationWith(walletClient))
  .andThen((txHash) => pollTransaction(client, { txHash }));

if (result.isErr()) {
  return console.error(result.error);
}

const status = result.value;
console.log("Transaction status:", status);
```

## Transaction Cancellation

To cancel a pending transaction, you can use the `cancelTransaction` method provided by the SDK.

```ts
import { cancelTransaction } from "@lens-protocol/client/actions";

// …

const result = await cancelTransaction(client, {
  txHash: "0x1234…",
});

if (result.isErr()) {
  return console.error(result.error);
}

const success = result.value;
console.log("Transaction cancelled:", success);
```

## Transaction Replacement

To replace a pending transaction, you can use the `replaceTransaction` method provided by the SDK.

```ts
import { replaceTransaction } from "@lens-protocol/client/actions";

// …

const result = await replaceTransaction(client, {
  txHash: "0x1234…",
  operation: createPost(sessionClient, {
    metadataUri: uri("lens://4f91…"),
  }),
});

if (result.isErr()) {
  return console.error(result.error);
}

const newTxHash = result.value;
console.log("Transaction replaced:", newTxHash);
```

## Best Practices

Here are some best practices for working with transactions in Lens:

1. **Error Handling**: Always handle transaction errors gracefully and provide clear feedback to the user.
2. **Transaction Status**: Keep the user informed about the status of their transactions.
3. **Gas Estimation**: Estimate gas before sending transactions to ensure they have enough funds.
4. **Transaction Batching**: Batch related transactions together to reduce the number of user interactions.
5. **Transaction Sponsorship**: Use transaction sponsorship when available to improve the user experience.
``` 