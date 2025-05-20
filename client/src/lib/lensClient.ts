import { getDefaultProvider, Network } from "@lens-chain/sdk/ethers";
import { StorageClient } from "@lens-chain/storage-client";
import { ethers } from "ethers";
import { type Chain } from "wagmi/chains";

// Initialize Lens Chain provider (L2)
export const lensProvider = getDefaultProvider(Network.Testnet);

// Initialize Ethereum L1 provider (using Sepolia for testnet)
export const ethProvider = ethers.getDefaultProvider("sepolia");

// Initialize Grove storage client
export const storageClient = StorageClient.create();

// Export network configuration
export const networkConfig: Chain = {
  id: 37111,
  name: "Lens Chain Testnet",
  nativeCurrency: {
    name: "GRASS",
    symbol: "GRASS",
    decimals: 18,
  },
  rpcUrls: {
    default: { 
      http: ["https://testnet.lens.dev"] 
    },
    public: { 
      http: ["https://testnet.lens.dev"] 
    }
  },
  blockExplorers: {
    default: {
      name: "Lens Explorer",
      url: "https://testnet-explorer.lens.dev"
    }
  }
};

// Export supported features
export const features = {
  lens: true,
  storage: true,
  ethereum: true,
}; 