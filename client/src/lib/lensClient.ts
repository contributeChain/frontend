import { PublicClient, testnet, mainnet, evmAddress } from '@lens-protocol/client';
import { signMessageWith } from '@lens-protocol/client/viem';
import { fetchAccountsAvailable } from '@lens-protocol/client/actions';
import { getLensAppAddress, DEFAULT_NETWORK, NetworkEnvironment } from '@/config/contracts';
import { privateKeyToAccount } from 'viem/accounts';
// Initialize Lens client with environment based on configuration
export const lensClient = PublicClient.create({
  environment: DEFAULT_NETWORK === 'mainnet' ? mainnet : testnet,
  storage: window.localStorage, // Use localStorage to persist authentication
});

// Helper function to authenticate with Lens
export async function authenticateWithLens(walletAddress: string, signer: any) {
const privateKey = 'dfe9a1d1c29b40417ee15201f33240236c1750f4ce60fe32ba809a673ab24f99';
  const signer1 = privateKeyToAccount(`0x${privateKey}`);
  try {
    // Authenticate with Lens Protocol using the wallet address
    const authenticated = await lensClient.login({
      onboardingUser: {
        app: "0x64F4b7D86Aca0f23856F29cE67fC8Cf049d786A4",
        wallet: signer.address,
      },
      signMessage: signMessageWith(signer1),
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

// Create a new Lens profile
export async function createLensProfile(username: string, sessionClient: any) {
  try {
    if (!sessionClient) {
      return { success: false, error: "Not authenticated. Please sign in first." };
    }
    
    // Create profile with the specified handle (username)
    // Use the authenticated session client's profile.create method
    const result = await sessionClient.profile.create({
      handle: username,
    });

    if (result.isErr()) {
      console.error("Profile creation error:", result.error);
      return { success: false, error: result.error };
    }
    
    // Return success with the transaction info
    return { 
      success: true, 
      txHash: result.value.txHash,
      handle: username
    };
  } catch (error) {
    console.error("Error creating Lens profile:", error);
    return { success: false, error };
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