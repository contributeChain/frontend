/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: {
    readonly VITE_NEXT_PUBLIC_NETWORK: string;
    readonly VITE_GITHUB_CLIENT_ID: string;
    readonly VITE_GITHUB_CLIENT_SECRET: string;
    readonly VITE_GITHUB_REDIRECT_URI: string;
    readonly VITE_GITHUB_AUTH_TOKEN: string;
    readonly VITE_NETWORK_ENV: string;
    readonly VITE_WALLET_CONNECT_PROJECT_ID: string;
    readonly VITE_ALCHEMY_API_KEY: string;
    readonly LENS_API_KEY: string;
    
    // NFT Contract Addresses will be derived based on network
    readonly VITE_NFT_CONTRACT_ADDRESS_TESTNET: string;
    readonly VITE_NFT_CONTRACT_ADDRESS_MAINNET: string;
    
    // Lens App Addresses
    readonly VITE_LENS_APP_ADDRESS_TESTNET: string;
    readonly VITE_LENS_APP_ADDRESS_MAINNET: string;
  };
}