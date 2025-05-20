import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http, createConfig } from "wagmi";
import { mainnet, polygon, base, zora } from "wagmi/chains";

const projectId = import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID;

if (!projectId) {
  console.warn("Missing VITE_WALLET_CONNECT_PROJECT_ID environment variable. Using fallback project ID, which may not work in production.");
}

export const config = getDefaultConfig({
  appName: "Lens Alchemy",
  projectId: projectId || "lens-alchemy-project", // Fallback only used if environment variable is missing
  chains: [mainnet, polygon, base, zora],
  transports: {
    // Using specific transport URLs is recommended for production
    // Replace these with your own RPC provider URLs for better reliability
    [mainnet.id]: http(), // http('https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY')
    [polygon.id]: http(), // http('https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY')
    [base.id]: http(),    // http('https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY')
    [zora.id]: http(),    // http('https://zora-mainnet.g.alchemy.com/v2/YOUR_API_KEY')
  },
  ssr: true, // Enable server-side rendering support
}); 