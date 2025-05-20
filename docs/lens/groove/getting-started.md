# Getting Started with Grove

Grove is a secure, flexible, onchain-controlled storage layer for Web3 applications. You can get started with Grove in just a few lines of code.

## TypeScript

You can interact with Grove's API via the `@lens-chain/storage-client` library.

### 1. Install the Package

First, install the `@lens-chain/storage-client` package:

```bash
# npm
npm install @lens-chain/storage-client@latest

# yarn
yarn add @lens-chain/storage-client@latest

# pnpm
pnpm add @lens-chain/storage-client@latest
```

### 2. Instantiate the Client

Then, instantiate the client with the following code:

```typescript
import { StorageClient } from "@lens-chain/storage-client";

// For mainnet
const storageClient = StorageClient.create();

// For testnet
import { testnet } from "@lens-chain/storage-client";
const testnetStorageClient = StorageClient.create(testnet);
```

That's it—you are now ready to upload files to Grove.

## API

You can also interact with Grove using the RESTful API available at `https://api.grove.storage`.

In the following guides, we will demonstrate how to interact with this API using `curl` commands.

