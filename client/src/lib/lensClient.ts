import { PublicClient, testnet, mainnet, evmAddress } from '@lens-protocol/client';
import { signMessageWith } from '@lens-protocol/client/viem';
import { fetchAccountsAvailable } from '@lens-protocol/client/actions';
import { getLensAppAddress, DEFAULT_NETWORK, NetworkEnvironment } from '@/config/contracts';

// Initialize Lens client with environment based on configuration
export const lensClient = PublicClient.create({
  environment: DEFAULT_NETWORK === 'mainnet' ? mainnet : testnet,
  storage: localStorage, // Use localStorage to persist authentication
});

// Helper function to authenticate with Lens
export async function authenticateWithLens(walletAddress: string, signer: any) {
  try {
    // Get app address from config based on current environment
    const appAddress = getLensAppAddress();
    
    // Authenticate as an Account Owner
    const authenticated = await lensClient.login({
      accountOwner: {
        owner: evmAddress(walletAddress),
        account: evmAddress(walletAddress),
        // Use configured app address for the current environment
        app: evmAddress(appAddress),
      },
      signMessage: signMessageWith(signer),
    });

    if (authenticated.isErr()) {
      console.error("Authentication error:", authenticated.error);
      return { success: false, error: authenticated.error };
    }

    // Store the authenticated session client
    const sessionClient = authenticated.value;
    return { success: true, sessionClient };
  } catch (error) {
    console.error("Error authenticating with Lens:", error);
    return { success: false, error };
  }
}

// Check if user has a lens profile
export async function checkLensProfile(walletAddress: string) {
  try {
    if (!walletAddress) {
      return { success: false, hasProfile: false, error: "No wallet address provided" };
    }

    const result = await fetchAccountsAvailable(lensClient, {
      managedBy: evmAddress(walletAddress),
      includeOwned: true,
    });

    if (result.isErr()) {
      return { success: false, hasProfile: false, error: result.error };
    }

    // If we get accounts back, the user has at least one profile
    const accounts = result.value.items;
    return { 
      success: true, 
      hasProfile: accounts.length > 0, 
      accounts: accounts 
    };
  } catch (error) {
    console.error("Error checking Lens profile:", error);
    return { success: false, hasProfile: false, error };
  }
}

// Export network configuration
export const networkConfig = {
  id: DEFAULT_NETWORK === 'mainnet' ? 37110 : 37111,
  name: DEFAULT_NETWORK === 'mainnet' ? "Lens Chain" : "Lens Chain Testnet",
  nativeCurrency: {
    name: "GRASS",
    symbol: "GRASS",
    decimals: 18,
  },
  rpcUrls: {
    default: { 
      http: [DEFAULT_NETWORK === 'mainnet' ? "https://rpc.lens.dev" : "https://testnet.lens.dev"] 
    },
    public: { 
      http: [DEFAULT_NETWORK === 'mainnet' ? "https://rpc.lens.dev" : "https://testnet.lens.dev"] 
    }
  },
  blockExplorers: {
    default: {
      name: "Lens Explorer",
      url: DEFAULT_NETWORK === 'mainnet' ? "https://explorer.lens.dev" : "https://testnet-explorer.lens.dev"
    }
  }
};

// Export supported features
export const features = {
  lens: true,
  storage: true,
  ethereum: true,
}; 