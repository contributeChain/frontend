import { getDefaultConfig } from "connectkit";
import { createConfig } from "wagmi";
import { type Chain, mainnet, polygon, base, zora } from "wagmi/chains";

// Define which chains we want to support
const chains = [mainnet, polygon, base, zora] as const;

// Create the ConnectKit configuration
export const config = createConfig(
  getDefaultConfig({
    // Your dApp's info
    appName: "Lens Alchemy",
    appDescription: "Transform your GitHub contributions into NFTs on Lens Chain",
    appUrl: "https://lens-alchemy.xyz",
    
    // Chains supported by your dApp
    chains: chains as readonly [Chain, ...Chain[]],
    
    // Connect Kit options
    walletConnectProjectId: process.env.WALLET_CONNECT_PROJECT_ID || "",
    
    // Optional theme customization can be done in the ConnectKitProvider
  })
);

// Export the supported chains
export { chains };